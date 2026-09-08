# SLBM/teutonic-II-110B-A7B-router08-b44

## Resumen

teutonic-II-110B-A7B-router08-b44 es un checkpoint de mezcla de expertos (MoE) de 110 mil millones de parámetros desarrollado por SLBM para la subred 3 de Bittensor, Teutonic. Se deriva del modelo base dendriteholdings/teutonic-II-110B-genesis y del rey vigente de la subred, teutonic-II-110B-A7B-5DALwjE4-v44, mediante la composición de dos ediciones independientes: una recalibración del router y un entrenamiento adicional del bloque 44. El modelo no está pensado como un producto final, sino como una medición reproducible para la investigación de la subred.

Desde el punto de vista arquitectónico, es un modelo MiMo-v2 MoE con 45 capas, dimensión oculta de 3072, 256 expertos enrutados con top-8 activos más un experto compartido, y atención híbrida de ventana deslizante y atención completa. El vocabulario tiene 152 576 tokens. La información sobre la longitud de contexto no está disponible en los metadatos, aunque la evaluación reportada utiliza secuencias de 2048 tokens.

Su relevancia radica en el hallazgo de que dos ediciones sobre parámetros disjuntos se componen casi aditivamente (99 % de la predicción aditiva), un resultado útil para estrategias de mejora de modelos en entornos descentralizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (MiMo-v2), 45 capas, atención híbrida sliding-window/full |
| Parámetros totales | 110B (según nombre del checkpoint) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (evaluación con seq_len=2048) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: un transformer de mezcla de expertos con 45 capas, dimensión oculta de 3072, 256 expertos enrutados (top-8) y un experto compartido, además de atención híbrida de ventana deslizante y atención completa. El vocabulario tiene 152 576 entradas. Los archivos de contrato (config.json, modeling_mimo_v2.py, tokenizer) son byte-idénticos al rey, por lo que la subred acepta la arquitectura y el hash de contrato sin cambios.

El proceso de entrenamiento se compone de dos ediciones sobre parámetros disjuntos. Primero, una recalibración del router: se aplica `b' = 0.8*(b - mean(b))` al tensor `e_score_correction_bias` en las 44 capas MoE. Segundo, un entrenamiento del bloque 44: se ajustan las proyecciones de atención, los expertos enrutados y compartidos, las capas de normalización y la cabeza `lm_head` de ese bloque (2945 millones de parámetros) con AdamW (lr=5e-6) durante una época sobre 5 millones de tokens de predicción de la mezcla de evaluación, con microbatch de 2 secuencias. El entrenamiento se ejecuta en modo `model.eval()`, lo que evita una comprobación interna del router que lanza una excepción en modo training, pero los gradientes siguen fluyendo hacia `gate.weight` y los expertos.

La innovación destacable es que las dos ediciones tocan parámetros disjuntos y se componen de forma casi perfecta: la suma de los efectos individuales es +0.001209 y el efecto conjunto medido es +0.001202, un 99 % de la predicción aditiva. En cambio, diez candidatos alternativos con solapamiento de parámetros empeoraron el resultado, porque un delta de pesos absolutos sobrescribe en lugar de sumar.

## Capacidades

- Generación de texto: el modelo es un MoE completo capaz de generar texto, aunque no se han publicado evaluaciones específicas de tareas generativas.
- Optimización de cross-entropía por secuencia: está diseñado para minimizar la pérdida media por token en la mezcla de datos de la subred Teutonic (dclm-baseline-1.0, automathtext-v2, finewebedu).
- Composición de ediciones: demuestra que dos ajustes sobre parámetros disjuntos se combinan casi aditivamente, lo que es una capacidad útil para investigación de fusión de modelos.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Visión, audio o modo de pensamiento: no disponible.

## Casos de uso

- Investigación sobre composición de ediciones en modelos MoE: permite estudiar cómo dos ajustes sobre parámetros disjuntos se combinan de forma aditiva. Es adecuado porque el README reporta el efecto individual de cada edición y el efecto conjunto, con un 99 % de coincidencia con la predicción aditiva.
- Evaluación de calidad de modelos en subredes descentralizadas: sirve como referencia reproducible para medir mejoras de cross-entropía por secuencia frente al rey. Su protocolo de evaluación coincide con el de la subred, con panel fingerprint y mezcla de datos especificados.
- Experimentos de recalibración de routers: el ajuste del router con gamma=0.8 es un ejemplo de cómo escalar sesgos de selección de expertos sin entrenamiento. Es útil para depurar el balance de carga en MoE.
- Análisis de entrenamiento parcial de bloques: el ajuste del bloque 44 (2945 millones de parámetros) demuestra que se puede mejorar una capa específica sin afectar al resto. Es aplicable a técnicas de fine-tuning quirúrgico.
- Pruebas de reproducción de métricas: el README incluye datos crudos de pérdidas por secuencia en `results/`, lo que permite verificar los resultados sin volver a ejecutar el modelo. Es adecuado para validar pipelines de evaluación.
- Estudio de límites de aceptación en subredes: al no superar el umbral delta_threshold de 0.025, es un caso de estudio para calibrar políticas de evaluación y entender el margen necesario para que un checkpoint sea aceptado como rey.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. La métrica reportada es la lower confidence bound (LCB) de la mejora de cross-entropía por secuencia frente al rey, con un delta_threshold de 0.025. El modelo se queda en un LCB de +0.000840, unas 26 veces por debajo del umbral.

| Métrica | Valor |
|---|---|
| LCB@1200 (router gamma=0.8 solo) | +0.000426 |
| LCB@1200 (entrenamiento block-44 solo) | +0.000283 |
| LCB@1200 (ambos compuestos, este modelo) | +0.000840 |
| LCB@4000* (proyección, ambos) | +0.001003 |
| Mejora per-source (dclm) | +0.000730 |
| Mejora per-source (automathtext) | +0.002614 |
| Mejora per-source (finewebedu) | +0.000647 |

\* Proyección a n=4000 por aproximación normal, no es un resultado del validador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no ha publicado requisitos de memoria.
- GPU recomendadas: no especificado. Al tratarse de un checkpoint de 110B, se presupone la necesidad de múltiples GPU de servidor, pero no hay confirmación oficial.
- Consumer GPU: no documentado. Un modelo de este tamaño no es viable en GPU de consumo sin cuantización extrema, pero no se han facilitado valores concretos.
- Opciones de despliegue: no se mencionan. No hay información sobre vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de la misma categoría en la información disponible. Los únicos referentes son el modelo base y el rey de la subred, ambos sin datos de contexto ni licencia confirmados.

| Modelo | Parámetros | Contexto | LCB@1200 | Licencia |
|---|---|---|---|---|
| teutonic-II-110B-A7B-router08-b44 (este) | 110B | no disponible | +0.000840 | MIT |
| teutonic-II-110B-A7B-5DALwjE4-v44 (king) | 110B | no disponible | 0 (baseline) | no disponible |
| dendriteholdings/teutonic-II-110B-genesis | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No supera el umbral de aceptación de la subred: el LCB medido (+0.000840) está muy por debajo del delta_threshold de 0.025. Por tanto, no es un checkpoint competitivo ni apto para ser promovido a rey.
- Modelo de investigación: el autor lo publica como una medición reproducible, no como un modelo listo para producción.
- Riesgo de alucinación y sesgos: no evaluados. No hay información sobre sesgos conocidos ni pruebas de seguridad.
- Limitaciones de contexto e idioma: no documentadas. Los datos de evaluación incluyen principalmente corpus en inglés (dclm, finewebedu), por lo que el rendimiento en otros idiomas es desconocido.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo no ha sido validado para uso en producción.
- Dependencia del contrato de la subred: los archivos de contrato son byte-idénticos al rey; cualquier cambio en la arquitectura o en el tokenizer rompería la compatibilidad con la subred.

## Enlaces

- HuggingFace: https://huggingface.co/SLBM/teutonic-II-110B-A7B-router08-b44
- Modelo base: https://huggingface.co/dendriteholdings/teutonic-II-110B-genesis
- Noticias de la subred: https://subnetradar.com/subnet-news/3/2026-09-01
- Paper o documentación adicional: no disponible
