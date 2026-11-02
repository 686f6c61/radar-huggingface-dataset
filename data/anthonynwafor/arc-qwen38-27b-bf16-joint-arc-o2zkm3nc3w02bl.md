# AnthonyNwafor/arc-qwen38-27b-bf16-joint-arc-o2zkm3nc3w02bl

## Resumen

arc-qwen38-27b-bf16-joint-arc-o2zkm3nc3w02bl es un checkpoint de investigación publicado por el usuario AnthonyNwafor en Hugging Face, resultado de un ajuste fino supervisado sobre el modelo base Qwen/Qwen3.8-27B. Se trata de un merge estático de un adaptador LoRA en el modelo base, distribuido en precisión BF16 completa (55,6 GB en el repositorio), con arquitectura Qwen3.5 y pipeline image-text-to-text. Su propósito declarado es la investigación en tareas ARC-AGI (Abstraction and Reasoning Corpus), no la producción general.

El entrenamiento documentado es deliberadamente modesto: 11 actualizaciones del optimizador sobre 528 registros seleccionados (259 tareas oficiales de entrenamiento de ARC2, 102 programas sintéticos, 102 reparaciones, 64 registros sintéticos de acciones y 1 transición observada de ARC3). El autor no reclama ninguna puntuación de benchmark ni mejora de calidad, y advierte explícitamente de que no se ha medido el rendimiento ni el encaje en vLLM o Kaggle.

Su relevancia es acotada: sirve como artefacto reproducible de investigación (con hashes en `artifact_manifest.json` y validación aritmética del merge sobre 1184 tensores, 496 de ellos adaptados) y como ejemplo de merge LoRA en BF16 sobre un modelo de 27 356 728 560 parámetros. No es un modelo recomendable para despliegue en producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (tag `qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 publicado; no se distribuyen GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos base mediante safe-merge de PEFT. El checkpoint resultante es autónomo: no requiere adaptador PEFT separado. El autor conserva los tensores auxiliares MTP originales bajo `auxiliary/`, aunque la arquitectura de inferencia HF actual no los utiliza. Se mantuvieron contextos completos y precisión BF16 durante el proceso.

El conjunto de entrenamiento consta de 528 registros seleccionados de un pool disponible de 646: 259 tareas públicas oficiales de entrenamiento ARC2, 102 programas sintéticos, 102 reparaciones, 64 registros sintéticos de acciones y 1 registro de transición observada de ARC3. El entrenamiento principal supuso 11 actualizaciones del optimizador; el autor menciona además un warm-start previo del adaptador y pilotos en hardware local documentados aparte. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de entradas imagen + texto, según el pipeline declarado (`image-text-to-text`).
- Ajuste específico orientado a tareas de abstracción y razonamiento tipo ARC-AGI (transformaciones de rejillas, programas sintéticos y reparaciones).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: visión por imagen sí (pipeline image-text-to-text); thinking y audio no disponibles.

## Casos de uso

- Investigación en ARC-AGI: el checkpoint permite reproducir y auditar el ajuste LoRA sobre tareas de abstracción, con hashes verificables en `artifact_manifest.json`, lo que facilita la comparación entre ejecuciones.
- Estudio de merges LoRA en BF16: sirve como referencia de validación aritmética de safe-merge (1184 tensores, 496 adaptados) para quien necesite verificar su propio pipeline de fusión.
- Experimentación con modelos multimodales de 27 B: permite probar entradas imagen-texto en un entorno controlado de investigación, siempre que se mida previamente el rendimiento real.
- Reproducción de entrenamiento con conjuntos sintéticos: los 102 programas sintéticos y 102 reparaciones documentados permiten replicar la composición del dataset en experimentos académicos.
- Análisis de retención de tensores auxiliares MTP: útil para estudiar qué información auxiliar se conserva tras un merge y cómo afecta a la arquitectura HF.
- Evaluación comparativa de checkpoints derivados de Qwen3.8-27B: sirve como punto de partida para medir diferencias frente al modelo base en tareas de razonamiento visual, una vez establecida una línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se hace ninguna afirmación de puntuación ARC ni de mejora de calidad, y que no se midieron el encaje ni el throughput en vLLM o Kaggle.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere 60-70 GB según longitud de contexto y batch.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 24 GB o 2x L40S 48 GB) con sharding.
- Cabe en consumer GPU: no en una sola unidad de 24 GB en BF16. Sería necesario cuantizar (no se distribuyen GGUF) o usar offloading, lo que degrada el rendimiento.
- Opciones de despliegue: transformers (verificado el reload standalone por el autor); vLLM y Kaggle no medidos según la model card; llama.cpp/Ollama no disponibles al no publicarse GGUF.
- Latencia y throughput: no disponibles (no medidos por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| arc-qwen38-27b-bf16-joint-arc | 27,36 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | Apache 2.0 (según upstream) | Hugging Face | Modelo base sin ajuste ARC |
| Alternativas ARC-AGI open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con otros modelos de la misma categoría (checkpoints especializados en ARC-AGI de ~27 B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación: el autor no publica benchmarks, puntuación ARC ni evidencia de mejora frente al modelo base; no debe asumirse ninguna ganancia de calidad.
- Entrenamiento muy limitado: 11 actualizaciones del optimizador y 528 registros de un pool de 646; riesgo alto de sobreajuste a las tareas concretas incluidas.
- Sin medición de rendimiento: no se ha medido encaje ni throughput en vLLM o Kaggle, por lo que el comportamiento en producción es desconocido.
- Idiomas no declarados: no se especifica cobertura lingüística; el comportamiento multilingüe es incierto.
- Contexto no documentado: se desconoce la longitud máxima efectiva tras el ajuste.
- Tensores MTP no utilizados: los auxiliares se conservan pero la arquitectura HF actual no los emplea, lo que puede generar confusión al inspeccionar el repositorio.
- Riesgo de alucinación: no evaluado; al ser un ajuste sobre un modelo generativo sin filtrado documentado, aplican los riesgos habituales.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se presenta como artefacto de investigación; conviene revisar también la licencia del modelo base upstream.
- Trazabilidad: la reproducibilidad depende de `artifact_manifest.json` y de la revisión base indicada; sin ellos no se puede verificar la identidad exacta del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/AnthonyNwafor/arc-qwen38-27b-bf16-joint-arc-o2zkm3nc3w02bl
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio ARC-AGI: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
