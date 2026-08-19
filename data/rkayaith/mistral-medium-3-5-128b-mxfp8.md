# rkayaith/Mistral-Medium-3.5-128B-mxfp8

## Resumen

Este repositorio contiene una cuantización MXFP8 del modelo Mistral-Medium-3.5-128B, desarrollada por el usuario rkayaith. El modelo original, creado por Mistral AI, es un transformer denso multimodal de 128 mil millones de parámetros con una ventana de contexto de 256 000 tokens, optimizado para tareas de agente, razonamiento y generación de código. La variante MXFP8 reduce el tamaño de los pesos lineales de las capas decoder mediante el formato OCP MXFP8 E4M3 con grupos de 32 elementos, lo que permite un despliegue más eficiente en hardware especializado como la AMD MI350X.

La relevancia de esta cuantización radica en que ofrece una alternativa al formato FP8 estático liberado por Mistral, con un empaquetado más compacto (escalas E8M0 de 8 bits sin signo) y una granularidad más fina (grupos de 32 frente a bloques de 128). No se ha realizado ningún ajuste fino: los pesos FP8 originales se dequantizaron y se requantizaron al nuevo formato, lo que garantiza una fidelidad cercana al modelo base. Está pensado para entornos de producción que dispongan de aceleradores MXFP8 y utilicen vLLM como backend de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) con 88 capas decoder |
| Parametros totales | 127 704 210 176 (~128B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | MXFP8 (OCP E4M3), grupos estaticos de 32 elementos, escala E8M0 sin signo |
| Idiomas soportados | No disponible |
| Licencia | Modified MIT License (del modelo base) |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base Mistral-Medium-3.5-128B es un transformer denso de 128B con arquitectura multimodal que integra una torre de vision, un proyector multimodal y 88 capas decoder. Fue entrenado por Mistral AI para unificar las capacidades de sus familias Instruct, Reasoning (Magistral) y Devstral, ofreciendo instruccion, razonamiento y generacion de codigo en un unico conjunto de pesos. El contexto de 256 000 tokens permite procesar documentos extensos y mantener conversaciones de larga duracion.

Esta variante concreta no anade entrenamiento adicional. El proceso de cuantizacion consistio en dequantizar los pesos lineales FP8 estaticos liberados por Mistral y aplicar el formato MXFP8 con cuantizacion estatica de pesos por grupos de 32 elementos y cuantizacion dinamica de activaciones por grupos del mismo tamano. Se cuantizaron 616 capas lineales correspondientes a todas las proyecciones de atencion y feed-forward de las 88 capas decoder. Se omitieron el `lm_head`, la torre de vision y el proyector multimodal, que permanecen en BF16.

## Capacidades

- Generacion de texto, razonamiento logico y matematico, y generacion de codigo en multiples lenguajes de programacion.
- Soporte de tool calling y function calling, lo que permite integrarse con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso, disenado para tareas que requieren planificacion y ejecucion secuencial.
- Procesamiento multimodal: aunque la cuantizacion no afecta a la torre de vision ni al proyector, el modelo conserva la capacidad de entender imagenes y texto (la entrada de imagenes se procesa en BF16).
- Ventana de contexto de 256 000 tokens, adecuada para documentos largos y conversaciones extensas.
- Soporte de modo de razonamiento explicito (thinking mode) heredado de la familia Magistral, util para tareas complejas de deduccion.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede planificar, escribir y depurar codigo en multiples archivos, aprovechando su contexto largo y su capacidad de tool calling para interactuar con sistemas de ficheros y ejecutar comandos.
- Asistente de programacion en IDE: integrado como backend en extensiones de editor, ofrece autocompletado contextual, explicaciones de fragmentos y refactorizacion de codigo con conocimiento del proyecto completo.
- Analisis de documentos legales o tecnicos extensos: gracias a los 256k tokens de contexto, puede resumir, extraer clausulas y responder preguntas sobre contratos, informes o especificaciones sin necesidad de dividir el texto.
- Generacion automatizada de documentacion tecnica: a partir de un repositorio de codigo, el modelo produce guias de uso, comentarios de API y manuales de referencia con coherencia estructural.
- Revision de codigo en pipelines de CI/CD: mediante tool calling, analiza pull requests, detecta posibles errores, sugiere mejoras y genera mensajes de revision automaticos.
- Chatbots de atencion al cliente con memoria de sesion larga: el contexto amplio permite mantener el historial completo de una conversacion y consultar bases de conocimiento internas sin perder informacion previa.
- Razonamiento cientifico y matematico: para problemas que requieren cadenas de deduccion largas, como demostraciones, calculos avanzados o planificacion experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion ni comparativas con otras cuantizaciones. El unico dato de rendimiento indirecto es que el checkpoint paso la validacion en AMD MI350X con ROCm 7.2.3, lo que confirma su funcionamiento en ese hardware, pero no se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- Se requiere hardware con aceleracion MXFP8 (formato OCP MXFP8) y un backend vLLM compatible. No funciona en GPUs convencionales sin soporte nativo para este formato.
- El checkpoint fue validado exclusivamente en AMD MI350X (CDNA4, gfx950) con ROCm 7.2.3. Otras configuraciones de hardware no han sido probadas.
- El tamano del repositorio es de 137.4 GB, lo que sugiere que la VRAM necesaria para cargar el modelo completo ronda los 130-140 GB, dependiendo del overhead de la implementacion.
- Opciones de despliegue: vLLM es el backend recomendado y el unico que se menciona en la documentacion. Se puede iniciar un servidor con `vllm serve rkayaith/Mistral-Medium-3.5-128B-mxfp8 --language-model-only`.
- No se dispone de datos sobre latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Formato de cuantizacion | Tamano | Contexto | Licencia | Disponibilidad |
|--------|------------------------|--------|----------|----------|----------------|
| `mistralai/Mistral-Medium-3.5-128B` (base) | FP8 estatico (E4M3) | 128B | 256k | Modified MIT | Hugging Face |
| `rkayaith/Mistral-Medium-3.5-128B-fp8-block` | FP8 dinamico por bloques 128x128 | 128B | 256k | Modified MIT | Hugging Face |
| `rkayaith/Mistral-Medium-3.5-128B-mxfp8` (este) | MXFP8 (E4M3) grupos de 32 | 128B | 256k | Modified MIT | Hugging Face |

La diferencia principal entre las tres variantes radica en el esquema de cuantizacion. El modelo base utiliza FP8 estatico con escalas por bloque, mientras que la variante `fp8-block` aplica cuantizacion dinamica de activaciones y la variante MXFP8 utiliza grupos mas pequenos (32 elementos) y escalas E8M0, lo que puede ofrecer una mejor relacion precision/tamano en hardware compatible.

## Limitaciones y advertencias

- Solo se ha validado en AMD MI350X con ROCm 7.2.3. No hay garantia de funcionamiento en otros aceleradores, incluso si soportan MXFP8.
- Requiere hardware especifico con aceleracion MXFP8; en GPUs sin este soporte, el modelo no podra ejecutarse de forma eficiente o podria fallar.
- Al ser una cuantizacion sin fine-tuning, puede existir una perdida de precision respecto al modelo original en tareas muy sensibles a los pesos, aunque el formato MXFP8 esta disenado para minimizar ese impacto.
- No se especifican los idiomas soportados; se asume que hereda las capacidades multilingues del modelo base, pero no esta confirmado en esta variante.
- La licencia Modified MIT permite uso comercial, pero se recomienda revisar los terminos completos en el enlace proporcionado.
- El modelo base tiene capacidades multimodales, pero esta cuantizacion no optimiza la torre de vision ni el proyector; si se usan imagenes, esas partes se mantienen en BF16 y podrian requerir memoria adicional.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/rkayaith/Mistral-Medium-3.5-128B-mxfp8
- Modelo base de Mistral AI: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Documentacion oficial de Mistral Medium 3.5: https://docs.mistral.ai/models/mistral-medium-3-5-26-04
- Variante FP8 dinamico por bloques: https://huggingface.co/rkayaith/Mistral-Medium-3.5-128B-fp8-block
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
