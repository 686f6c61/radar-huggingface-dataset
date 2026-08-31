# komeijishiki/Qwen3.8-27B-EXL3-SC-3.40bpw-H6-V6

## Resumen

Este repositorio contiene una cuantización ExLlamaV3 (EXL3) del modelo multimodal Qwen3.8-27B, desarrollada por el usuario komeijishiki. El modelo base, creado por el equipo Qwen de Alibaba, es un transformer denso nativo visión-lenguaje de 27 000 millones de parámetros que destaca en tareas de codificación, flujos agénticos y automatización de oficina, aceptando tanto imágenes como texto como entrada. La cuantización reduce drásticamente el uso de memoria mediante la receta Full SC de turboderp, con pesos de texto a 3.40 bits por peso (bpw), cabezal de salida a 6 bits, torre de visión a 6 bits y módulo de predicción multi-token (MTP) a 4 bits, lo que permite su ejecución en GPUs de consumo.

El archivo safetensors resultante ocupa 14.7 GB y contiene 7 342 331 264 parámetros según los metadatos, una cifra inferior a la anunciada para el modelo base (27B) debido al proceso de cuantización. La licencia Apache-2.0 facilita su uso comercial y su integración en aplicaciones locales. Esta versión cuantizada es relevante porque acerca un modelo multimodal de alto rendimiento a hardware asequible, preservando las capacidades de razonamiento, visión y generación de código del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) |
| Parametros totales | 7 342 331 264 (segun safetensors; el modelo base se anuncia como 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3: texto 3.40 bpw, lm_head 6 bits, vision 6 bits, MTP 4 bits |
| Idiomas soportados | No disponible (el modelo base es multilingue, sin detalle) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal que procesa simultáneamente texto e imágenes. Su arquitectura integra un codificador visual y un decodificador de lenguaje, con capacidad de alternar entre modo de pensamiento y respuesta directa. La cuantización aquí presentada utiliza la receta Full SC (Self-Calibration) de turboderp, ejecutada con el comando `sc_optimize -b 3.40 -hb 6 -al 2.0 -mink 2`. Esta receta calibra los pesos cuantizados sobre el propio modelo para minimizar la pérdida de calidad, manteniendo el cabezal de salida (lm_head) a 6 bits para preservar la distribución de logits, la torre de visión a 6 bits para no degradar la comprensión visual y el módulo MTP a 4 bits para acelerar la decodificación especulativa. No se dispone de información detallada sobre los datos de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de logica y matemáticas.
- Comprension visual: analisis de imagenes, OCR, respuesta a preguntas visuales y descripcion de contenido grafico.
- Codificacion de software: generacion, depuracion y explicacion de codigo en multiples lenguajes.
- Flujos agenticos: ejecucion de tareas multi-paso con planificacion y uso de herramientas externas.
- Modo de pensamiento (thinking mode) que permite razonar internamente antes de responder.
- Soporte multilingue probable, aunque no confirmado en esta cuantizacion especifica.

## Casos de uso

- Asistente de codigo local: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y documentar codigo, aprovechando su capacidad de razonamiento y su bajo requisito de VRAM para ejecutarse en estaciones de trabajo con una sola GPU.
- Analisis de documentos escaneados: gracias a su torre de vision, puede extraer texto e informacion estructurada de imagenes, facturas o formularios, facilitando la automatizacion de tareas administrativas.
- Chatbot multimodal de atencion al cliente: despliegue en local para gestionar consultas que incluyan capturas de pantalla o fotografias de productos, con respuestas contextuales y coherentes.
- Automatizacion de oficina: procesamiento de presentaciones, graficos y tablas visuales para generar resumenes o convertir contenido visual en texto editable.
- Educacion y formacion: creacion de materiales didacticos a partir de imagenes o diagramas, con explicaciones paso a paso generadas por el modelo.
- Prototipado de agentes autonomos: uso como motor de razonamiento en frameworks de agentes que requieran interpretar tanto texto como imagenes, por ejemplo para navegacion web asistida o control de interfaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 14.7 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo en memoria (por ejemplo, RTX 4080/4090, A100 40GB). Con cuantizaciones adicionales podria caber en 12 GB, pero no se garantiza.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100, H100, o cualquier GPU con soporte CUDA y suficiente memoria.
- Compatibilidad con GPUs de consumo: si, siempre que tengan al menos 16 GB de VRAM.
- Opciones de despliegue: ExLlamaV3 es la libreria principal; tambien es compatible con servidores de inferencia que soporten EXL3, como TabbyAPI o ExLlamaV3 Server. No se menciona compatibilidad con vLLM o llama.cpp en la documentacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta cuantizacion especifica. Como referencia cualitativa, se puede comparar con el modelo base Qwen3.8-27B sin cuantizar, que ofreceria mayor fidelidad pero requeriria aproximadamente el doble de VRAM (alrededor de 54 GB en FP16). Otras alternativas de cuantizacion como GGUF (para llama.cpp) o AWQ podrian ofrecer formatos diferentes, pero no se han encontrado versiones equivalentes de este modelo con esos formatos en la informacion disponible. La comparativa con otros modelos multimodales de tamano similar (por ejemplo, Llama 3.2 Vision 11B o InternVL 26B) no se puede realizar sin datos de benchmarks.

## Limitaciones y advertencias

- La cuantizacion a 3.40 bpw puede introducir una ligera degradacion en tareas de alta precision, especialmente en razonamiento numerico o generacion de codigo complejo, en comparacion con el modelo original.
- El numero de parametros real del archivo cuantizado (7.3B) difiere del anunciado para el modelo base (27B); esta discrepancia se debe al proceso de cuantizacion y no implica una reduccion de capacidades, pero debe tenerse en cuenta al estimar requisitos de hardware.
- No se han documentado sesgos especificos de esta version, pero el modelo base puede heredar sesgos de sus datos de entrenamiento, que no se detallan en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los terminos del modelo base para confirmar cualquier condicion adicional.
- La longitud de contexto no se especifica en esta cuantizacion; se debe verificar en la documentacion del modelo base antes de usarla en aplicaciones que requieran ventanas largas.
- El proyecto tiene muy pocas descargas (3) y no cuenta con valoraciones de la comunidad, por lo que su estabilidad y soporte no estan garantizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/komeijishiki/Qwen3.8-27B-EXL3-SC-3.40bpw-H6-V6
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Alibaba Cloud Model Studio: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-27b
- Ficha del modelo en GroqDocs: https://console.groq.com/docs/model/qwen/qwen3.8-27b
