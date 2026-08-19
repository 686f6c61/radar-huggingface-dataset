# bschooled/caeleste-speech-qwen2.5-0.5b-instruct-nf4

## Resumen

bschooled/caeleste-speech-qwen2.5-0.5b-instruct-nf4 es una cuantizacion de 4 bits NF4 (bitsandbytes) del modelo Qwen/Qwen2.5-0.5B-Instruct, publicada por el autor bschooled como componente de texto del proyecto caeleste-speech. Segun su model card, se trata del LLM utilizado para la ruta de chat/completions dentro de un sistema de procesamiento de voz, lo que lo convierte en una pieza clave para pipelines de asistente conversacional con footprint minimo.

El modelo original Qwen2.5-0.5B-Instruct tiene 494 millones de parametros, arquitectura transformer decoder-only con RoPE, SwiGLU y RMSNorm, y soporta una ventana de contexto de 32.768 tokens con generacion maxima de 8.192 tokens. La cuantizacion NF4 con doble cuantizacion reduce el peso del modelo de 0.93 GiB a 0.44 GiB, manteniendo la licencia Apache 2.0 y sin alterar la arquitectura ni el vocabulario del modelo original.

Su relevancia actual radica en que permite ejecutar un LLM con instruccion de calidad en GPUs de consumo con tan solo medio gigabyte de VRAM, lo que lo convierte en una opcion atractiva para despliegues en tiempo real, sistemas embebidos y entornos con restricciones de memoria. El modelo cuenta con 0 descargas y 0 likes en el momento de la publicacion, lo que indica que es un lanzamiento reciente (agosto de 2026) con poca adopcion aun.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con RoPE, SwiGLU, RMSNorm, bias QKV y word embeddings atados |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generacion maxima: 8.192 tokens) |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion, compute en bf16 |
| Idiomas soportados | No especificados en la model card; el modelo base Qwen2.5 soporta ingles, chino y otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-0.5B-Instruct es un LLM de 494 millones de parametros, de los cuales 0.36 mil millones son no-embedding. Utiliza arquitectura transformer decoder-only con posicionamiento rotatorio RoPE, activacion SwiGLU, normalizacion RMSNorm, bias en las proyecciones QKV de atencion y word embeddings atados. El modelo fue instruccionado sobre la base del modelo base Qwen2.5-0.5B, siguiendo la estrategia de la serie Qwen2.5 documentada en el informe tecnico (arXiv:2412.15115).

La cuantizacion NF4 de bitsandbytes reemplaza los tensores de pesos por equivalentes de 4 bits, anadiendo un bloque `quantization_config` al `config.json`. Se aplica doble cuantizacion y el compute se realiza en bf16. No se modificaron la arquitectura, el vocabulario ni los parametros de generacion. El tokenizer, processor y archivos de remote code se copian sin cambios de la revision upstream `7ae557604adf67be50417f59c2c2f167def9a775`. El resultado es un modelo de 0.44 GiB frente a los 0.93 GiB del original, con una reduccion de tamano de aproximadamente el 53%.

## Capacidades

- Generacion de texto con instruccion: sigue instrucciones en formato chat y genera respuestas coherentes en un modelo de 0.5B.
- Razonamiento basico: puede resolver tareas de razonamiento logico y matematico sencillo, aunque con limitaciones propias de su tamano.
- Capacidades multilingues: hereda del modelo base Qwen2.5, que soporta ingles, chino y otros idiomas, aunque no se especifican en la model card.
- Integracion en pipeline de voz: segun la model card, se usa como componente de texto para la ruta de chat/completions dentro del sistema caeleste-speech.
- Contexto de 32.768 tokens: permite conversaciones multi-turno extensas y procesamiento de documentos largos.
- No se documentan capacidades de tool calling, function calling, ni vision en la informacion disponible.

## Casos de uso

- Asistentes de voz conversacionales: al formar parte del proyecto caeleste-speech, el modelo puede integrarse en un pipeline de voz donde el audio se transcribe, se procesa con este LLM y se sintetiza la respuesta, con latencia minima gracias a su tamano reducido.
- Chatbots en dispositivos de bajo consumo: su peso de 0.44 GiB permite ejecutarlo en mini PCs, Raspberry Pi con GPU, o sistemas de integrados con NVIDIA Turing o superior.
- Prototipado rapido de aplicaciones de IA conversacional: su facilidad de carga con Transformers y bitsandbytes lo hace ideal para pruebas de concepto antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion en tiempo real: su contexto de 32.5 tokens permite procesar documentos extensos y extraer entidades, resumenes o clasificaciones con latencia aceptable en entornos de produccion.
- Moderacion de contenido y filtrado: puede integrarse en pipelines de moderacion de texto para clasificar contenido inapropiado con un coste de computacion minimo.
- Educacion y experimentacion con LLMs: su tamano reducido y licencia Apache 2.0 permiten a estudiantes y desarrolladores experimentar con cuantizacion, inferencia y fine-tuning en hardware basico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion NF4 en la informacion disponible. El informe tecnico de Qwen2.5 (arXiv:2412.15115) documenta mejoras sustanciales de rendimiento de los modelos Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct frente a sus versiones anteriores, pero no se detallan cifras concretas en los resultados de busqueda obtenidos. Para datos de referencia del modelo base, se recomienda consultar la tabla 10 del informe tecnico citado.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 0.44 GiB en disco. Para inferencia se recomienda al menos 1-2 GiB de VRAM, considerando activaciones y overhead del runtime.
- GPU compatibles: NVIDIA con arquitectura Turing o superior (sm_75+), incluyendo RTX 2060, RTX 3060, RTX 4060, RTX 4090, A100, H100. AMD ROCm en RDNA3, RDNA3.5 y CDNA.
- Cabe en GPU de consumo: si, cualquier GPU de 2 GB o mas de VRAM es suficiente. Tambien puede ejecutarse en CPU con cuantizacion adicional.
- Opciones de despliegue: se puede cargar con Transformers de HuggingFace y bitsandbytes (ejemplo en la model card). Compatible con vLLM, llama.cpp y Ollama mediante conversion a GGUF, y con TGI (Text Generation Inference).
- Latencia y throughput: no se especifican datos de medicion en la informacion disponible. Para un modelo de 0.5B en GPU moderna, se esperan latencias inferiores a 100 ms por token y throughput del orden de miles de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| bschooled/caeleste-speech-qwen2.5-0.5b-instruct-nf4 | 494M | 32.768 tokens | NF4 4-bit | 0.44 GiB | Apache 2.0 |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | FP32/BF16 | 0.93 GiB | Apache 2.0 |
| Qwen/Qwen2.5-0.5B-Instruct-GPTQ-Int4 | 494M | 32.768 tokens | GPTQ Int4 | no disponible | Apache 2.0 |

La diferencia principal entre las variantes es el metodo de cuantizacion: NF4 de bitsandbytes se aplica en memoria de forma dinamica y requiere bitsandbytes en el entorno, mientras que GPTQ-Int4 requiere un paso de calibracion previo y puede ofrecer menor degradacion en tareas de generacion larga. El modelo original sin cuantizar requiere aproximadamente 1 GiB adicional de VRAM.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5 puede presentar sesgos presentes en sus datos de entrenamiento, aunque no se documentan detalles especificos para esta cuantizacion.
- Riesgo de alucinacion: como cualquier LLM de tamano reducido, puede generar respuestas plausibles pero incorrectas, especialmente en tareas que requieren conocimiento factual actualizado.
- Limitaciones de contexto: aunque soporta 32.768 tokens de contexto, la generacion maxima es de 8.192 tokens, lo que limita la produccion de textos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero exige conservar los avisos de copyright, patentes, marcas y atribucion del modelo original.
- Requisitos de hardware: los kernels NF4 solo funcionan en NVIDIA Turing o superior y AMD ROCm RDNA3/RDNA3.5/CDNA. En hardware mas antiguo, la carga del modelo fallara.
- Dependencia de bitsandbytes: la carga requiere bitsandbytes, lo que anade una dependencia adicional al entorno de despliegue.
- No se documentan capacidades de vision, audio ni multimodales en este modelo.
- El modelo tiene 0 descargas y 0 likes en el momento de la publicacion, lo que indica una validacion comunitaria aun pendiente.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/bschooled/caeleste-speech-qwen2.5-0.5b-instruct-nf4)
- [Modelo original Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5
