# holland202/rmt-ih-001

## Resumen

`holland202/rmt-ih-001` es un artefacto de investigación, no un modelo de propósito general. Consiste en 24 transformadores diminutos de 575.232 parámetros cada uno, con solo dos capas de atención y sin MLPs, entrenados desde cero sobre datos sintéticos para estudiar cómo evoluciona el espectro de las matrices QK durante el aprendizaje de la tarea de copia. El autor es Chad Holland (usuario `holland202`) y el trabajo se enmarca en su repositorio `principia-artificialis`.

El objetivo original era estudiar la formación de induction heads, pero el diseño de los datos (un segmento de 32 tokens repetido exactamente 32 posiciones después) hizo que los modelos aprendieran un atajo posicional en lugar de un mecanismo de inducción. Aun así, el artefacto conserva un resultado interesante: el valor singular superior del espectro QK, relativo a la media, experimenta una caída breve (dip) al inicio de la fase de copia, registrada en 6 de 6 semillas de entrenamiento y en 0 de 6 controles.

Su relevancia es estrictamente metodológica y de interpretabilidad: ilustra cómo un experimento de mecánica interna puede fallar en su hipótesis principal y, aun así, producir una señal reproducible si se pre-registra y se valida en semillas nuevas. No es un modelo para desplegar en producción ni para tareas de generación de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer solo-atención, 2 capas, 2 cabezas por capa, pre-LayerNorm, sin MLPs, embeddings posicionales aprendidos |
| Parametros totales | 575.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario sintético de 64 tokens, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (24 ficheros: `repeat_seed1..12` y `norepeat_seed1..12`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer mínimo compuesto únicamente por bloques de atención: dos capas, dos cabezas por capa, `d_model` de 256, pre-LayerNorm y embeddings posicionales aprendidos. No hay capas feed-forward ni mecanismos adicionales. El vocabulario es sintético, de 64 tokens, y las secuencias tienen 65 tokens.

El entrenamiento se realizó con AdamW, tasa de aprendizaje 3e-5, batch de 64, 2.000 pasos y en CPU. Es determinista: una repetición de la semilla 1 produjo resultados idénticos. Los datos se dividen en dos regímenes: las 12 semillas `repeat` incluyen BOS + segmento + el mismo segmento (copia aprendible), mientras que las 12 semillas `norepeat` son controles donde el segundo segmento es independiente (nada que copiar). Las semillas 1-6 constituyen la parte A y las 7-12 la parte B. Solo se guardan los pesos finales; las estadísticas por checkpoint (cada 20 pasos: puntuación ICL, ratio de espaciado del borde del espectro, `top_norm`, rango estable) están en `metrics/`.

## Capacidades

- Copia exacta de un segmento de 32 tokens a un desplazamiento fijo de 32 posiciones (precisión 1,00 en ese caso).
- Rendimiento cercano al azar (0,01-0,07) en cualquier otro desplazamiento o longitud.
- No dispone de generación de lenguaje natural, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión ni audio.
- Su valor es instrumental: permite reproducir el análisis espectral de las matrices QK durante el entrenamiento.

## Casos de uso

- Estudio de interpretabilidad mecanicista: cargar los pesos con `safetensors` y el código `tinyih.py` para inspeccionar cómo evoluciona el espectro QK en cada checkpoint, usando los datos de `metrics/all_runs.json`.
- Reproducción de experimentos de dinámica de entrenamiento: reentrenar las 12 semillas con el código proporcionado y verificar la caída del valor singular superior descrita en la model card.
- Docencia sobre fallos de diseño experimental: usar el caso como ejemplo de cómo un atajo posicional invalida una hipótesis sobre induction heads y cómo el pre-registro y las semillas de control permiten rescatar un resultado parcial.
- Validación de pipelines de análisis espectral: emplear `analyze.py` y `dip.py` como referencia para implementar métricas de espectro QK en modelos mayores.
- Pruebas de determinismo y reproducibilidad: verificar que una rerun de la semilla 1 produce pesos idénticos, útil para auditar flujos de entrenamiento.
- Benchmark de juguete para comparar técnicas de medición de espectros: al ser un modelo de 0,1 GB y entrenable en CPU, sirve como banco de pruebas rápido antes de aplicar las mismas métricas a modelos de mayor escala.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión de copia a desplazamiento 32 | 1,00 |
| Precisión de copia a otros desplazamientos o longitudes | 0,01-0,07 (cercano al azar) |
| Caída del valor singular superior relativo a la media (runs de copia) | 1,12-1,53 en 6 de 6 semillas |
| Caída del valor singular superior relativo a la media (controles) | 0,00 en 6 de 6 semillas |
| Momento de la caída | Antes de la mitad del aprendizaje en 6 de 6 semillas; en el inicio de la copia, no antes (solo 1 de 6 semillas fue anterior) |
| Hipótesis original (ratio de espaciado en el borde superior del espectro QK) | No consistente: bajó en 3 de 6 semillas y subió en 3; se movió más en el control |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en fp32 para un único checkpoint de 575.232 parámetros; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: ninguna en particular; el entrenamiento original se ejecutó en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin dificultad.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y `tinyih.TinyAttnOnly`; requiere `torch`, `numpy` y `scipy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de juguete, la latencia es despreciable.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformadores de juguete para interpretabilidad con seguimiento espectral de QK). La model card menciona el paper arXiv 2605.24059, que reporta señales espectrales en activaciones durante la formación de induction heads, pero no se dispone de sus especificaciones para una comparación tabulada.

## Limitaciones y advertencias

- Escala de juguete: datos sintéticos, una sola arquitectura y 575.232 parámetros; los hallazgos no se extrapolan a modelos reales.
- Mecanismo aprendido: los modelos aprendieron un atajo posicional, no induction heads; la pregunta original del estudio no quedó respondida.
- Novedad no establecida: las señales espectrales en torno a la formación de induction heads ya se habían reportado para activaciones (arXiv 2605.24059).
- Validación humana limitada: el estudio fue diseñado, ejecutado y evaluado por una IA (Claude Opus 5.5), con dirección humana de Chad Holland y nivel de revisión "direction only"; no ha habido reproducción independiente.
- Sin capacidades de lenguaje natural: no debe usarse para generación de texto, código, traducción ni ninguna tarea de NLP.
- Licencia MIT: permite uso comercial, pero el modelo no tiene aplicación comercial realista.
- Riesgo de alucinación: no aplica en el sentido habitual, al no generar lenguaje; el riesgo relevante es interpretar los resultados espectrales como concluyentes cuando no lo son.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/holland202/rmt-ih-001
- Repositorio del experimento: https://github.com/holland202/principia-artificialis/tree/main/experiments/rmt_ih_001
- Paper citado sobre señales espectrales en activaciones: arXiv 2605.24059 (referenciado en la model card, sin enlace directo disponible)
