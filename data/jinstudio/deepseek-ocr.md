# Jinstudio/DeepSeek-OCR

## Resumen

DeepSeek-OCR es un modelo vision-language especializado en conversion optica de documentos a texto estructurado, desarrollado por DeepSeek AI y distribuido con licencia MIT. La ficha que se analiza aqui corresponde al repositorio espejo `Jinstudio/DeepSeek-OCR` en HuggingFace, una copia del repositorio oficial `deepseek-ai/DeepSeek-OCR`. El modelo resuelve el problema de la digitalizacion de documentos: dado un escaneo, una fotografia o un PDF renderizado como imagen, genera texto plano o Markdown preservando la estructura del original.

Tecnicamente es un modelo de 3.336.106.240 parametros (aproximadamente 3,34 mil millones) construido sobre la arquitectura `deepseek_vl_v2`, es decir, un transformer de vision-lenguaje de la familia DeepSeek-V2 con un codificador visual acoplado a un decodificador de lenguaje. El repositorio ocupa 6,7 GB en safetensors, lo que es coherente con un checkpoint en precision bf16. La tesis central del trabajo, recogida en el paper arXiv:2510.18234, es la compresion optica de contexto: representar grandes volumenes de texto como imagenes para reducir el numero de tokens que el modelo debe procesar.

Su relevancia actual es doble. Por un lado, ofrece una alternativa abierta y de licencia permisiva en un nicho tradicionalmente dominado por soluciones cerradas de OCR documental. Por otro lado, cuenta con soporte oficial en vLLM desde el 23 de octubre de 2025, lo que habilita despliegues con procesamiento por lotes y decodificacion acelerada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language `deepseek_vl_v2` (familia DeepSeek-V2) con codificador visual y decodificador de lenguaje |
| Parametros totales | 3.336.106.240 (aproximadamente 3,34 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | multilingue (el modelo declara la etiqueta `multilingual`, pero no se enumeran los idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | safetensors (`use_safetensors=True`, requiere `trust_remote_code=True`) |

Otros datos de la ficha: pipeline `image-text-to-text`, tarea declarada `feature-extraction`, libreria `transformers`, autor del espejo Jinstudio, 0 descargas y 0 likes en el repositorio analizado, creado y actualizado el 10 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo sigue el patron de DeepSeek-VL v2: un codificador visual que transforma la imagen de entrada en una secuencia de embeddings y un decodificador de lenguaje autorregresivo que genera el texto. El repositorio define un codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` y una implementacion de atencion compatible, recomendandose `flash_attention_2`. El checkpoint se carga en `bfloat16`.

La innovacion destacada por los autores es la compresion optica de contexto: en lugar de procesar documentos extensos como secuencias de tokens de texto, se procesan como imagenes con distintas resoluciones configurables, lo que reduce el coste computacional de contexto. El modelo expone cinco modos de resolucion que ajustan el equilibrio entre precision y coste: Tiny (`base_size=512`, `image_size=512`, sin recorte), Small (640/640), Base (1024/1024), Large (1280/1280) y Gundam (`base_size=1024`, `image_size=640`, con `crop_mode=True`, pensado para documentos densos). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Entre las dependencias tecnicas verificadas por los autores figuran Python 3.12.9, CUDA 11.8, `torch==2.6.0`, `transformers==4.46.3`, `tokenizers==0.20.3`, `einops`, `addict` y `flash-attn==2.7.3`. En la ruta de vLLM, la decodificacion se apoya en un `NGramPerReqLogitsProcessor` que restringe la generacion repetitiva, con parametros como `ngram_size=30`, `window_size=90` y una lista blanca de tokens (`<td>`, `</td>`) para preservar el marcado de tablas.

## Capacidades

- Conversion de documentos a texto: OCR libre mediante el prompt `<image>\nFree OCR.`
- Conversion a Markdown estructurado: prompt `<image>\n<|grounding|>Convert the document to markdown.`, con marcas de posicionamiento (grounding) sobre el documento original.
- Reconocimiento de tablas, con soporte explicito de etiquetas HTML de tabla (`<td>`, `</td>`) en el procesador de logits de vLLM.
- Procesamiento de documentos densos mediante el modo Gundam con recorte, y de documentos ligeros mediante los modos Tiny y Small.
- Entrada multimodal de imagenes: el ejemplo oficial de vLLM acepta lotes con varias imagenes (`multi_modal_data`), lo que permite procesamiento por lotes.
- Salida de hasta 8192 tokens por peticion en la configuracion de ejemplo de vLLM.
- Capacidades multilingues declaradas por el autor, sin enumeracion de idiomas en la informacion disponible.
- Integracion con HuggingFace Transformers y con vLLM; no se documenta tool calling, function calling ni comportamiento agentico explicito.
- No se documentan capacidades de audio, video, vision general (captioning, VQA) ni modo de razonamiento extendido. El modelo esta orientado a OCR documental.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo convierte lotes de imagenes en texto plano o Markdown, y su soporte en vLLM permite procesar volumenes grandes con `multi_modal_data` en una sola llamada.
- Conversion de PDF a Markdown para pipelines de RAG: el modo Gundam (`base_size=1024`, `image_size=640`, `crop_mode=True`) esta pensado para paginas densas con tablas y columnas, generando Markdown que puede indexarse directamente en un almacen vectorial.
- Extraccion de tablas financieras y facturas: el procesador de n-gramas con lista blanca de etiquetas `<td>`/`</td>` ayuda a mantener la estructura de tabla en la salida, lo que simplifica el parseo posterior.
- Automatizacion de back office: lectura de formularios, albaranes y contratos escaneados para volcar los campos a un sistema de gestion, usando el modo Small o Base segun la calidad del escaneo.
- Accesibilidad documental: transcripcion de documentos fisicos a texto seleccionable y compatible con lectores de pantalla, con licencia MIT que permite integrarlo en productos propietarios sin obligaciones de copyleft.
- Archivado y busqueda empresarial: indexacion de fondos documentales historicos que solo existen en papel, aprovechando el caracter multilingue declarado del modelo.
- Preprocesado para agentes: uso del modelo como primer eslabon de un pipeline agentico que digitaliza documentos y entrega Markdown a un LLM de razonamiento posterior.
- Control de calidad documental: comparacion entre el Markdown generado y el documento original mediante las marcas de grounding, para detectar omisiones en la transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el interes de los autores por evaluar la compresion visual-texto y cita benchmarks de terceros en la seccion de agradecimientos, pero no incluye tablas de resultados (MMLU, HumanEval, GSM8K ni metricas de OCR como edit distance o exact match).

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 7 GB solo para los pesos (el repositorio ocupa 6,7 GB en safetensors), mas el consumo adicional del codificador visual y las activaciones al procesar imagenes de hasta 1280x1280, lo que en la practica situa el uso tipico por encima de los 10-12 GB.
- GPU de centro de datos: A100, H100 o L40S para despliegues con concurrencia alta y lotes grandes.
- GPU de consumo: cabe en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090; en 8 GB el margen es muy ajustado y depende de la resolucion de imagen elegida.
- Modos de bajo consumo: los modos Tiny (512) y Small (640) reducen el coste del codificador visual y son los mas adecuados para GPUs modestas.
- Opciones de despliegue: HuggingFace Transformers con `flash_attention_2` (ruta documentada por el autor) y vLLM con soporte oficial desde el 23 de octubre de 2025, instalado desde nightly hasta la version 0.11.1. No se documentan soportes de llama.cpp, Ollama, TGI ni pesos GGUF.
- Aceleracion opcional: `flash-attn==2.7.3` con `--no-build-isolation`.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-OCR (`Jinstudio/DeepSeek-OCR`, espejo) | 3,34 mil millones | no disponible | no disponible | MIT | HuggingFace, 0 descargas, 0 likes |
| DeepSeek-OCR (`deepseek-ai/DeepSeek-OCR`, oficial) | no disponible en esta busqueda (mismo modelo) | no disponible | no disponible | MIT | HuggingFace oficial, GitHub, soporte vLLM |
| GOT-OCR2.0 | no disponible | no disponible | no disponible | no disponible | citado en los agradecimientos del modelo |
| MinerU | no disponible | no disponible | no disponible | no disponible | citado en los agradecimientos del modelo |
| PaddleOCR | no disponible | no disponible | no disponible | no disponible | citado en los agradecimientos del modelo |

La comparativa cuantitativa no es posible con la informacion disponible: la model card cita GOT-OCR2.0, MinerU, PaddleOCR, Vary, OneChart y Slow Perception como trabajos de referencia, pero no aporta tablas comparativas de parametros, contexto ni metricas. La diferencia verificable entre el espejo `Jinstudio/DeepSeek-OCR` y el repositorio oficial `deepseek-ai/DeepSeek-OCR` es de mantenimiento y trazabilidad: el espejo no registra descargas ni likes y no hay garantia de que se actualice.

## Limitaciones y advertencias

- Especializacion estrecha: es un modelo de OCR documental; no esta pensado para captioning generico, respuesta visual a preguntas ni tareas de vision abiertas.
- Riesgo de alucinacion: como cualquier modelo generativo aplicado a OCR, puede insertar o inventar contenido en documentos con ruido, sellos, caligrafia dificil o baja resolucion.
- Idiomas: se declara soporte multilingue, pero no se enumeran los idiomas cubiertos ni su calidad relativa, por lo que conviene validar el par de idiomas concreto antes de un despliegue.
- Longitud de contexto: no disponible. Los ejemplos oficiales limitan la generacion a 8192 tokens por peticion, lo que puede ser insuficiente para documentos muy largos procesados en una sola pasada.
- Cuantizacion: no se publican pesos GGUF, AWQ o GPTQ, de modo que el ahorro de VRAM via cuantizacion no esta cubierto por el autor.
- `trust_remote_code=True`: la carga implica ejecutar codigo personalizado del repositorio, lo que supone un riesgo de seguridad si se usa una copia no oficial.
- Espejo de terceros: el repositorio `Jinstudio/DeepSeek-OCR` no es el canal oficial de DeepSeek AI, no registra descargas y podria quedar desactualizado; para produccion es preferible el repositorio oficial.
- Licencia MIT: permisiva y apta para uso comercial, sin obligacion de liberar derivados, aunque se recomienda conservar el aviso de copyright.
- Dependencias estrictas: las versiones documentadas (`transformers==4.46.3`, `torch==2.6.0`, `flash-attn==2.7.3`, CUDA 11.8) pueden entrar en conflicto con entornos mas recientes.
- La busqueda web asociada a esta ficha devolvio unicamente resultados no relacionados con el modelo, por lo que no se ha podido incorporar informacion adicional externa.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/Jinstudio/DeepSeek-OCR
- Repositorio oficial: https://huggingface.co/deepseek-ai/DeepSeek-OCR
- Repositorio GitHub oficial: https://github.com/deepseek-ai/DeepSeek-OCR
- Paper (PDF en GitHub): https://github.com/deepseek-ai/DeepSeek-OCR/blob/main/DeepSeek_OCR_paper.pdf
- Paper en arXiv: https://arxiv.org/abs/2510.18234
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2510.18234
- Guia de despliegue en vLLM: https://docs.vllm.ai/projects/recipes/en/latest/DeepSeek/DeepSeek-OCR.html
- Web oficial de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
