# bayusantoso/contrastive

## Resumen

`bayusantoso/contrastive` es un repositorio de HuggingFace que contiene una implementación reducida de una arquitectura Perceiver orientada a aprendizaje contrastivo, publicada por el usuario bayusantoso bajo licencia Apache 2.0. No se trata de un modelo entrenado: la propia model card lo describe explícitamente como un punto de partida reproducible y aclara que el fichero `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests), no un checkpoint con resultados de referencia.

El tamaño real del modelo, según los pesos en formato safetensors, es de 24.832 parámetros, una cifra que lo sitúa muy por debajo de cualquier modelo de lenguaje utilizable en producción. El repositorio incluye además `train.py` como artefacto principal, `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto (optimizador RMSprop con planificador OneCycle).

Su relevancia es por tanto puramente metodológica: sirve como plantilla ejecutable para experimentar con Perceivers de atención dilatada y fusión bilineal, no como componente listo para desplegar. No se declaran idiomas soportados, pipeline de inferencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (cross-attention con array latente), atención dilatada |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas codigo PyTorch en `train.py` |

Otros detalles de arquitectura declarados en la model card: escala "base", fusión bilineal, activación swish y normalización RMSNorm.

## Arquitectura y entrenamiento

La arquitectura es un Perceiver: un transformer que proyecta entradas de modalidad arbitraria sobre un array latente de tamaño fijo mediante cross-attention, lo que en principio desacopla el coste computacional de la longitud de la secuencia de entrada. En esta implementación concreta la atención es dilatada (`Attention: dilated`), la fusión entre ramas es bilineal, la activación es swish y la normalización es RMSNorm. La model card no especifica el número de latentes, el número de cabezas ni la dimensión del modelo, por lo que no es posible reconstruir el presupuesto de cómputo a partir de la documentación.

En cuanto al entrenamiento, no existe: el repositorio no presenta el checkpoint como entrenado y no reclama ninguna métrica de benchmark. Lo único documentado es la receta por defecto del script, RMSprop con planificador OneCycle, que el autor describe como valores de partida y no como evidencia de una ejecución completada. La model card recomienda, para cualquier evaluación futura, usar un conjunto de validación específico de la tarea, reportar la métrica sobre al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- Generación de texto: no disponible; no hay evidencia de que el modelo tenga tokenizador, vocabulario o cabeza de lenguaje entrenada.
- Razonamiento, código y matemáticas: no disponibles; el checkpoint no está entrenado.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Visión o audio: no disponibles; aunque el Perceiver está diseñado para ser agnóstico de modalidad, no se documenta ninguna tarea concreta.
- Reproducción de experimentos: sí, el repositorio permite ejecutar `python train.py --help` y el bloque `__main__` incluye un ejemplo de smoke test autogenerado.
- Carga mediante APIs automáticas: requiere un adaptador explícito, ya que es una implementación personalizada y no un modelo registrado en `transformers`.

## Casos de uso

- Prueba de humo de infraestructura: dado su tamaño de 24.832 parámetros, el checkpoint permite verificar que un pipeline de carga de safetensors, un entorno PyTorch y un runner de experimentos funcionan extremo a extremo antes de escalar a modelos reales.
- Plantilla para investigación en Perceivers: el código y el `config.json` sirven como punto de partida para modificar atención dilatada, fusión bilineal o normalización RMSNorm sin tener que escribir la arquitectura desde cero.
- Reproducción de recetas de optimización: `training_args.json` documenta RMSprop con OneCycle, lo que permite comparar esta receta frente a AdamW en tareas contrastivas sobre el mismo esqueleto de red.
- Docencia y formación: por su tamaño, el modelo cabe en memoria y en tiempo de cómputo de un portátil, lo que lo hace apto para explicar cómo funciona la cross-attention de un Perceiver en un aula o taller.
- Aprendizaje contrastivo multimodal a pequeña escala: la combinación de Perceiver con fusión bilineal es un punto de partida razonable para experimentos de emparejamiento entre pares (imagen-texto, audio-texto) con presupuestos de cómputo mínimos, siempre que se entrene desde cero.
- Verificación de conformidad de licencias: al estar bajo Apache 2.0, el repositorio puede usarse como caso de prueba en la revisión legal de un catálogo interno de modelos, aunque su utilidad funcional en producción es nula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el repositorio no reclama ninguna puntuación de referencia y que el checkpoint de inicialización no ha sido entrenado ni auditado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otro | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 (24.832 parámetros × 4 bytes ≈ 97 KB) y en torno a 49 KB en bf16. Cualquier GPU con más de 1 GB de memoria libre es sobrada.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) lo ejecuta con margen de varios órdenes de magnitud.
- Cabe en GPU consumer: sí, en todas, y también en CPU, Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, TGI ni Ollama. El uso previsto es ejecutar `train.py` en un entorno PyTorch estándar. Para `transformers` haría falta escribir un adaptador explícito.
- Latencia y throughput estimados: no se han publicado mediciones. Por el tamaño, la latencia de una pasada hacia delante en CPU debería estar en el orden de microsegundos a pocos milisegundos, pero esto es una estimación derivada del recuento de parámetros, no un dato medido.

## Comparativa con modelos similares

No disponible. No hay información suficiente en el repositorio para establecer comparaciones significativas con otros modelos: no se documentan tarea objetivo, métricas, conjunto de datos ni presupuesto de cómputo, y el checkpoint no está entrenado. Cualquier comparación con modelos publicados sería engañosa, ya que estos últimos sí han sido entrenados y evaluados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bayusantoso/contrastive | 24.832 | no disponible | sin benchmarks | apache-2.0 | repositorio sin descargas ni likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida que produzca es ruido de inicialización, no una predicción útil.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal y como reconoce la propia model card.
- No se declara tokenizador, vocabulario ni idiomas, por lo que no puede usarse como modelo de lenguaje.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe el riesgo de que un usuario interprete erróneamente las salidas del checkpoint sin entrenar como resultados válidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial del código y de los pesos, pero la model card advierte de que los términos de los datos de origen deben revisarse por separado si se emplean conjuntos externos.
- El repositorio no registra descargas ni likes, lo que sugiere que no ha sido validado por la comunidad ni reproducido de forma independiente.
- Cualquier resultado que se publique a partir de un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto aquí incluidos, según indica el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bayusantoso/contrastive
- Perceiver de referencia (DeepMind, implementación conceptual): no disponible en la información proporcionada
- Repositorio Contrastive-LM/CLM (relacionado solo por el término "contrastive", no vinculado a este modelo): https://github.com/Contrastive-LM/CLM
- Revisión sistemática de aprendizaje contrastivo en IA médica (contexto genérico del término): https://pmc.ncbi.nlm.nih.gov/articles/PMC12938576/
- LLM Leaderboard 2026 (referencia general de benchmarks, no aplica a este modelo): https://llm-stats.com/leaderboards/llm-leaderboard
- Noticia sobre Anthropic (sin relación con este modelo): https://www.msn.com/en-us/news/other/anthropic-ai-model-submits-false-homicide-tip-to-philadelphia-police/ar-AA2dWiN6
