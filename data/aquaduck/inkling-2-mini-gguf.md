# aquaduck/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini-GGUF es un repositorio de cuantización GGUF del modelo Inkling-2-Mini desarrollado por Thinking Machines. El repositorio, mantenido por Aquaduck, distribuye el archivo completo en cuantización UD-Q4_K_XL (unos 17,63 GB) junto con dos fragmentos de capas ("layer shards") pensados para carga por etapas o en múltiples nodos mediante el formato propietario Aquaduck Arc layer-package-v1. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos provienen del modelo base y la cuantización fue generada por Unsloth dentro del ecosistema llama.cpp.

El modelo base es un transformer causal de aproximadamente 26.400 millones de parámetros según la model card (19.328.315.904 parámetros reales reportados en los metadatos de safetensors, discrepancia que conviene tener en cuenta), con arquitectura GQA de 24 cabezas de consulta y 8 de clave/valor, 24 capas y dimensión oculta de 2304. Está orientado a generación de texto conversacional y dispone de modos "thinking" e "instruct" según la documentación del modelo base.

Su relevancia ahora es doble: por un lado, ofrece una vía práctica de ejecutar un modelo de ~26B en hardware de consumo mediante cuantización de 4 bits; por otro, introduce un esquema de empaquetado por capas que permite repartir la inferencia entre etapas o nodos, algo poco habitual en el ecosistema GGUF estándar. La licencia es "other" y hereda las restricciones del modelo base, por lo que su uso comercial requiere revisar los términos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con GQA (24 cabezas Q / 8 cabezas KV), 24 capas, hidden dim 2304 |
| Parametros totales | ~26,4B según model card; 19.328.315.904 según metadatos de safetensors |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (indicado como "unknown tokens" en la model card) |
| Tipos de cuantizacion | UD-Q4_K_XL (unica incluida en este repo) |
| Idiomas soportados | Multilingue (mismos que el modelo base; lista concreta no disponible) |
| Licencia | other (hereda de thinkingmachines/inkling-2-mini) |
| Formato de pesos | GGUF (archivo completo + shards de capas en formato layer-package-v1) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con atención por grupos (GQA), con 24 cabezas de consulta y 8 de clave/valor, 24 capas y dimensión oculta de 2304. El repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esa información correspondería a la model card del modelo base, que no está incluida en la documentación proporcionada.

La innovación técnica de este repositorio no está en el entrenamiento sino en el empaquetado. Los shards `*-layers-0-18.gguf` y `*-layers-18-24.gguf` son paquetes contiguos de capas cortados del GGUF completo en el punto medio de la red (capa 18 de 24), con índices de fin exclusivos. Están diseñados para el cargador por etapas de Aquaduck Arc (máximo 2 etapas) y no son modelos completos ejecutables en llama.cpp estándar. La cuantización UD-Q4_K_XL proviene de Unsloth y utiliza la técnica de imatrix, según las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat propia del modelo base.
- Modos diferenciados de "thinking" e "instruct", documentados en la model card del modelo base.
- Capacidades multilingües (heredadas del modelo base; el conjunto exacto de idiomas no está detallado).
- Razonamiento multi-turno dentro de los límites de contexto del modelo base (longitud no especificada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Carga por etapas o multi-nodo mediante shards de capas (exclusivo del ecosistema Aquaduck Arc).

## Casos de uso

- Inferencia local en estación de trabajo: el GGUF completo UD-Q4_K_XL (~17,63 GB) se puede cargar en llama.cpp con una GPU de 24 GB o con reparto CPU/GPU, lo que permite ejecutar un modelo de ~26B en hardware de consumo.
- Asistente conversacional autoalojado: el modelo está etiquetado como "conversational" y usa plantilla de chat propia, por lo que encaja en despliegues de chat con historial multi-turno siempre que se respete el formato de la plantilla del modelo base.
- Razonamiento con modo thinking: para tareas que requieren cadenas de razonamiento explícitas, se puede activar el modo thinking documentado en el modelo base y comparar su salida con el modo instruct.
- Despliegue distribuido por etapas: los shards de capas permiten repartir la inferencia entre dos etapas (por ejemplo, dos máquinas o dos GPU) usando el cargador Aquaduck Arc, útil para entornos con VRAM fragmentada.
- Evaluación comparativa de cuantizaciones: al existir el GGUF original de Unsloth y este empaquetado, se puede medir la degradación de calidad de UD-Q4_K_XL frente a pesos de mayor precisión en tareas concretas.
- Integración en la aplicación de escritorio Aquaduck: el flujo de asignación por catálogo descarga automáticamente el archivo o fragmento asignado al dispositivo, lo que simplifica el despliegue en flotas de equipos gestionados.
- Prototipado de pipelines de generación de texto en investigación: el formato GGUF y la compatibilidad con llama.cpp permiten integrarlo en scripts de evaluación sin infraestructura de servido dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluaciones separadas para el GGUF alojado ni para los shards, y remite a la model card de `thinkingmachines/inkling-2-mini`, que no forma parte de la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para el GGUF completo UD-Q4_K_XL: ~17,63 GB de pesos; con overhead de contexto y caché KV conviene prever entre 19 y 22 GB según longitud de contexto y batch.
- GPU recomendadas: tarjetas con 24 GB o más (RTX 3090, RTX 4090, A10G, L4, A100, H100) para carga íntegra en GPU; en GPUs de 16 GB o menos será necesario reparto parcial con CPU (offload de capas).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con margen ajustado; en GPUs de 12-16 GB solo con offload parcial a RAM.
- Opciones de despliegue: llama.cpp para el GGUF completo; el cargador por etapas Aquaduck Arc para los shards (no son compatibles con llama.cpp estándar). No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del offload y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion en repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-GGUF (este repo) | ~26,4B | no disponible | UD-Q4_K_XL | other | GGUF completo + shards Arc |
| thinkingmachines/inkling-2-mini (base) | ~26,4B | no disponible | pesos originales | other | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF | ~26,4B | no disponible | GGUF (varias, fuente del UD-Q4_K_XL) | other | Hugging Face |

No se dispone de datos de benchmarks ni de modelos alternativos de otros desarrolladores en la información proporcionada para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Sesgos: los mismos que el modelo base; la model card no detalla sesgos concretos.
- Riesgo de alucinación: inherente a un modelo generativo conversacional; no hay evaluaciones específicas en este repositorio.
- La cuantización UD-Q4_K_XL puede degradar la calidad respecto a los pesos originales de mayor precisión.
- Los archivos `*-layers-*.gguf` no son modelos completos: no funcionan en llama.cpp estándar y solo sirven con el cargador Aquaduck Arc (máximo 2 etapas, corte en capa 18).
- Es obligatorio usar la plantilla de chat del modelo base, incluidos los modos thinking/instruct; otras plantillas producirán salidas incorrectas.
- Licencia "other": hereda las restricciones del modelo base; es imprescindible revisar los términos de `thinkingmachines/inkling-2-mini` antes de cualquier uso comercial.
- Discrepancia de parámetros: la model card indica ~26,4B mientras que los metadatos de safetensors reportan 19.328.315.904; conviene verificar contra el modelo base.
- Longitud de contexto nativa desconocida, lo que impide planificar despliegues con requisitos de contexto largo.
- Idiomas soportados no enumerados; el soporte multilingüe se afirma pero no se cuantifica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquaduck/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/inkling-2-mini
- Fuente de la cuantización GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Aquaduck AI: https://huggingface.co/aquaduck
