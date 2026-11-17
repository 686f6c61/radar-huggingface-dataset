# hoanghai2110/zi-1

## Resumen

zi-1 es un fork publico del modelo `google/gemma-3-270m-it`, la variante instruction-tuned mas pequena de la familia Gemma 3 desarrollada por Google DeepMind. El autor del repositorio, hoanghai2110, declara explicitamente que los pesos del modelo no han sido modificados: se trata de una copia de la distribucion GGUF publicada por Unsloth (`unsloth/gemma-3-270m-it-GGUF`), a la que unicamente se han anadido el README y los metadatos legales exigidos por los terminos de Gemma. Por tanto, no estamos ante un modelo nuevo ni ante un fine-tune, sino ante una redistribucion con fines de cumplimiento de licencia.

El modelo base pertenece a la familia Gemma 3, construida por Google con la misma tecnologia de investigacion empleada en Gemini. Gemma 3 es multimodal (texto e imagen de entrada, texto de salida), con ventana de contexto de 128K tokens en las variantes de 4B, 12B y 27B, y de 32K tokens en las variantes de 1B y 270M. La variante de 270M parametros esta pensada para despliegues en entornos con recursos muy limitados: portatiles, dispositivos de borde, contenedores pequenos o experimentacion rapida en CPU.

La relevancia de esta ficha es doble. Por un lado, documenta una de las variantes mas pequenas y menos cubiertas de Gemma 3, util para tareas de clasificacion, extraccion estructurada y generacion corta donde un modelo grande seria sobredimensionado. Por otro lado, ilustra un patron frecuente en Hugging Face: forks de redistribucion que anaden metadatos legales (NOTICE, GEMMA_TERMS.md) sin alterar pesos, lo que conviene identificar antes de evaluar el modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), multimodal texto e imagen; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 268.098.176 (268,1 M) segun safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens para la variante 270M (128K en 4B, 12B y 27B) |
| Tipos de cuantizacion | GGUF (repo derivado de `unsloth/gemma-3-270m-it-GGUF`); niveles concretos no disponibles |
| Idiomas soportados | Mas de 140 idiomas segun la model card de Gemma 3; lista concreta no disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La model card describe Gemma 3 como una familia de modelos ligeros y multimodales de Google, construidos sobre la misma investigacion que Gemini. Las entradas de imagen se normalizan a 896 x 896 pixeles y se codifican en 256 tokens cada una; la salida es siempre texto. La variante de 270M comparte la arquitectura de la familia, pero los detalles finos (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de atencion lineal o decodificacion especulativa) no se detallan en la informacion disponible para esta ficha.

En cuanto a entrenamiento, la model card indica que la familia se entreno sobre un corpus de texto de fuentes diversas y que el modelo de 27B se entreno con 14 billones de tokens; el resto de cifras por tamano no aparecen en el extracto disponible. No se documenta en la informacion proporcionada si la variante 270M paso por RLHF, DPO u otro tipo de alineamiento posterior al preentrenamiento, ni la composicion exacta del dataset. Este repositorio concreto no introduce ningun cambio de pesos ni de entrenamiento: es una copia del GGUF de Unsloth con README y metadatos legales anadidos.

## Capacidades

- Generacion de texto conversacional en modo instruction-tuned, con plantilla de chat propia de Gemma 3.
- Comprension de imagenes: acepta imagenes normalizadas a 896 x 896 y codificadas en 256 tokens, con salida en texto.
- Respuesta a preguntas, resumen de documentos y razonamiento basico, segun la descripcion oficial de la familia.
- Cobertura multilingue declarada de mas de 140 idiomas.
- Capacidad de ejecucion en entornos con recursos muy limitados gracias a los 268 M de parametros.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; por tamano, no es un modelo orientado a tareas agenticas complejas.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion y etiquetado de texto a pequena escala: con 268 M de parametros, el modelo puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificacion de tickets, deteccion de intencion o filtrado de contenido, donde un modelo de 7B o superior seria innecesario.
- Extraccion de campos estructurados: util para convertir correos, formularios o fragmentos de texto en JSON sencillo en pipelines de ingestion de datos, con coste de inferencia minimo.
- Prototipado rapido de asistentes conversacionales: permite validar plantillas de prompt, flujos de chat y disenos de interfaz antes de escalar a variantes mayores de Gemma 3 (4B, 12B o 27B) que comparten familia y convenciones.
- Generacion de resumenes cortos en entornos de borde: el contexto de 32K tokens permite procesar documentos moderados en dispositivos con poca memoria, siempre que la calidad exigida no sea alta.
- Experimentacion academica y docencia: al ser un modelo pequeno, reproducible y con pesos abiertos, sirve para estudiar comportamiento de modelos instruction-tuned, medir sesgos o comparar estrategias de cuantizacion GGUF.
- Descripcion basica de imagenes en aplicaciones ligeras: la entrada multimodal a 896 x 896 permite generar pies de foto o etiquetas simples en flujos donde no se requiere precision fina.
- Pruebas de integracion y CI: sirve como modelo de sustitucion (stub) en pipelines de integracion continua para validar el cableado de inferencia, plantillas de chat y serializacion sin consumir GPUs caras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Gemma 3 no incluye cifras por variante en el extracto proporcionado, y este fork no anade evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268 M de parametros, en FP16 el peso ocupa aproximadamente 0,5 GB; en cuantizaciones GGUF de 4 bits, alrededor de 0,2 GB, a los que hay que sumar memoria para el contexto KV.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior permite ejecutar el modelo con contexto largo sin problemas. Para despliegues multi-cliente, A100 o H100 son sobredimensionadas salvo por requisitos de concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y tambien en CPU.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama para los pesos GGUF, y vLLM o TGI para despliegues en servidor. El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, es esperable una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zi-1 (este repo) | 268 M | 32K | Si (texto e imagen) | Gemma Terms of Use | Hugging Face, safetensors y GGUF |
| google/gemma-3-270m-it (base) | 268 M | 32K | Si (texto e imagen) | Gemma Terms of Use | Hugging Face, pesos oficiales |
| unsloth/gemma-3-270m-it-GGUF | 268 M | 32K | Si (texto e imagen) | Gemma Terms of Use | Hugging Face, GGUF |
| Variantes Gemma 3 de 1B | 1B (aprox.) | 32K | Si (texto e imagen) | Gemma Terms of Use | Hugging Face |

Las tres primeras filas son esencialmente el mismo modelo con distinto empaquetado; la comparativa relevante es frente a las variantes mayores de la propia familia, que ofrecen 128K de contexto y mayor calidad a cambio de requisitos de hardware superiores. No se dispone de datos de rendimiento comparativo en la informacion proporcionada para cuantificar esa diferencia.

## Limitaciones y advertencias

- Alucinacion: con 268 M de parametros, la tasa de respuestas factualmente incorrectas o inventadas es previsiblemente alta en tareas abiertas; no debe usarse como fuente de verdad sin verificacion.
- Sesgos: los sesgos del corpus de entrenamiento de Gemma 3 se heredan sin cambios; este fork no aplica ninguna mitigacion adicional.
- Contexto limitado: la variante 270M tiene 32K tokens, la mitad de las variantes mayores de la familia, lo que restringe casos de uso con documentos largos.
- Idioma: la cobertura de mas de 140 idiomas es una declaracion de familia; la calidad por idioma, y en especial en castellano, no esta cuantificada en la informacion disponible.
- Licencia: uso sujeto a los Gemma Terms of Use (`ai.google.dev/gemma/terms`); es imprescindible revisar las restricciones de uso comercial y de redistribucion antes de integrar el modelo en produccion. El repositorio incluye `GEMMA_TERMS.md` y `NOTICE` con la informacion legal.
- Naturaleza del repositorio: es una copia de terceros con pesos sin modificar; conviene verificar la integridad frente al original de Unsloth o de Google antes de confiar en el.
- Parametros de muestreo: la model card recomienda `temperature = 1.0`, `top_k = 64`, `top_p = 0.95`, `min_p = 0.0`; usar otros valores puede degradar la calidad de forma notable.
- Adopcion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion ni evaluaciones de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hoanghai2110/zi-1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- GGUF original de Unsloth: https://huggingface.co/unsloth/gemma-3-270m-it-GGUF
- Coleccion Gemma 3 de Unsloth: https://huggingface.co/collections/unsloth/gemma-3-67d12b7e8816ec6efa7e4e5b
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Pagina oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Guia de Unsloth para ejecutar Gemma 3: https://docs.unsloth.ai/basics/tutorial-how-to-run-gemma-3-effectively
- Blog de Unsloth sobre Gemma 3: https://unsloth.ai/blog/gemma3
- Notebook de fine-tuning de Gemma 3 270M: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Gemma3_(270M).ipynb
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
