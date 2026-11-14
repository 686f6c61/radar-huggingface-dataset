# bambocher/LFM3-1.7B-oQ5e

## Resumen

LFM3-1.7B-oQ5e es una versión cuantizada del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según el checkpoint), publicada por el usuario bambocher en Hugging Face. La cuantización se ha realizado con la herramienta oQ de oMLX (versión 0.7.3), que aplica cuantización de precisión mixta sobre los pesos originales. El resultado es un checkpoint de 1,2 GB con un promedio efectivo de 5,701 bits por peso, pensado para su uso con la librería MLX en hardware Apple Silicon.

El modelo resuelve el problema de desplegar un LLM de ~1,7B en entornos con memoria unificada limitada (Macs con 8-16 GB de RAM) manteniendo una calidad razonablemente cercana al modelo original en BF16. Al tratarse de una cuantización mixta, no todos los tensores usan el mismo ancho de bits: la mayoría de los pesos (80,2%) se almacenan en 5 bits afín con grupo de 64, mientras que una fracción (19,7%) se mantiene en 6 bits para preservar capas más sensibles, y un residuo mínimo (0,1%) queda en 8 bits o BF16.

Es relevante ahora porque demuestra el ecosistema creciente de cuantización específica para MLX (oQ/oMLX), alternativa a GGUF/llama.cpp en el entorno Apple. No obstante, la información pública disponible es muy escasa: no hay model card del modelo base, no se declaran licencia, idiomas ni pipeline, y no se han publicado benchmarks. Esta ficha refleja únicamente lo que consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de LFM3; no se especifica en la informacion) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 5-bit grupo 64 (80,244%), afín 6-bit grupo 64 (19,659%), afín 8-bit grupo 64 (0,074%), BF16 (0,022%); promedio efectivo 5,701 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 1,232 GB / 1,147 GiB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. Por el nombre y el tamaño (1,7B) se trata presumiblemente de un transformer decoder-only, pero esto no se confirma en la información disponible. Tampoco constan datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación).

La innovación técnica documentada es exclusivamente el proceso de cuantización: oQ (oMLX v0.7.3) aplica precisión mixta asignando 5 bits afín (grupo de 64) al 80,2% de los pesos lógicos, 6 bits al 19,7%, 8 bits a un 0,07% y dejando un 0,02% en BF16. Esta distribución busca equilibrar compresión y fidelidad, manteniendo en mayor precisión los tensores más sensibles. El checkpoint final ocupa 1,147 GiB con 1,729B pesos lógicos, lo que arroja el promedio de 5,701 bits/peso declarado por el autor.

## Capacidades

- Generación de texto: capacidad esperable de un LLM de 1,7B, aunque no se detalla en la información disponible.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni descripción funcional).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en MLX: el checkpoint está empaquetado para la librería MLX con `custom_code`, lo que permite cargarlo en el ecosistema Apple Silicon.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX en un Mac con memoria unificada de 8-16 GB para experimentar con generación de texto sin depender de la nube, gracias a su tamaño de 1,2 GB en disco.
- Aplicaciones de escritorio en Apple Silicon: integrar el modelo en apps macOS nativas mediante MLX, aprovechando la cuantización de 5,7 bits para reducir el uso de memoria frente a BF16.
- Evaluación de técnicas de cuantización: usar este checkpoint como referencia para comparar la calidad de oQ/oMLX frente a otras cuantizaciones (GGUF, AWQ, GPTQ) del mismo modelo base.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o extracción de entidades en local, donde un modelo de 1,7B es suficiente y la latencia en hardware Apple es aceptable.
- Asistentes embebidos sin conexión: despliegue en entornos con requisitos de privacidad (datos que no salen del dispositivo) aprovechando que el checkpoint cabe holgadamente en RAM unificada.
- Generación de texto en pipelines de CI para pruebas: usar el modelo como fixture determinista en tests de integración de aplicaciones LLM, dado su reducido tamaño de repo (1,2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el checkpoint ocupa 1,147 GiB en disco; en inferencia MLX se necesita además memoria para caché KV y buffers de activación, por lo que un Mac con 8 GB de memoria unificada es el mínimo razonable y 16 GB deja margen amplio.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) por el uso de la librería MLX. No se documenta soporte CUDA.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con memoria unificada de 8 GB o más; no se especifica compatibilidad con GPUs NVIDIA/AMD de consumo.
- Opciones de despliegue: MLX (librería declarada) y, presumiblemente, herramientas del ecosistema oMLX; no consta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ5e | 1,729B | no disponible | 5,701 bits/peso (mixta) | no disponible | safetensors MLX |
| LFM3-1.7B (base) | 1,729B | no disponible | BF16 | no disponible | no disponible |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo bloqueante para producción.
- Idiomas no declarados: se desconoce la cobertura lingüística real del modelo base.
- Sin benchmarks: no hay evidencia publicada de calidad (MMLU, HumanEval, GSM8K u otros), por lo que no se puede validar el impacto de la cuantización frente al modelo original.
- Riesgo de alucinación: inherente a los LLM de 1,7B; no hay evaluaciones de fidelidad en la información disponible.
- Sesgos: no documentados.
- Contexto desconocido: no se especifica la longitud de ventana, lo que impide planificar casos de uso con contexto largo.
- Dependencia de MLX: el checkpoint está empaquetado para MLX con `custom_code`; no es portable directamente a otros runtimes sin conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte.
- Cuantización mixta: la distribución de bits por capa no se detalla a nivel de tensor, solo agregada; auditar su comportamiento en tareas sensibles requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ5e
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
