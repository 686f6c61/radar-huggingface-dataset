# ABrunsch/Unlimited-OCR-repacked

## Resumen

Unlimited-OCR-repacked es un reempaquetado del modelo baidu/Unlimited-OCR, un modelo vision-lenguaje (image-text-to-text) especializado en OCR y *parsing* de documentos, desarrollado originalmente por Baidu Inc. El repositorio analizado lo publica el usuario ABrunsch y no introduce cambios en los pesos: la unica diferencia es que los safetensors se dividen en 4 fragmentos con un tamano maximo objetivo de 1.900 MB para facilitar su almacenamiento y transferencia. La revision de origen citada es `07dea832e22aefee32ad281d4b80551282e1c168`.

El modelo tiene 3.336.106.240 parametros (unos 3,34 mil millones) y el repositorio ocupa 6,8 GB, lo que corresponde a pesos en bfloat16. Se presenta como una evolucion de DeepSeek-OCR y su propuesta central es el "*one-shot long-horizon parsing*": resolver el analisis de documentos largos (varias paginas o PDF completo) en una sola pasada de generacion en lugar de encadenar llamadas por pagina. Los ejemplos publicados usan `max_length=32768`, lo que indica el rango de contexto manejado en inferencia multipagina.

Es relevante ahora porque combina un tamano relativamente contenido (apto para GPU de consumo con suficiente VRAM), licencia MIT, soporte oficial de vLLM para inferencia y de ms-swift para entrenamiento, y disponibilidad en Hugging Face, ModelScope y Baidu Cloud. La contrapartida es que este repositorio concreto es un espejo de terceros con 0 descargas y 0 likes, sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (pipeline image-text-to-text) con codigo personalizado (`trust_remote_code`); el detalle de encoder/decoder no esta disponible en la informacion proporcionada |
| Parametros totales | 3.336.106.240 (≈3,34 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 32.768 tokens en los ejemplos de inferencia publicados (`max_length=32768`); longitud nativa declarada no disponible |
| Tipos de cuantizacion | No disponible; la documentacion solo emplea `torch.bfloat16` |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (4 fragmentos, maximo objetivo de 1.900 MB por fragmento) |
| Tamano del repositorio | 6,8 GB |
| Libreria de inferencia | transformers 4.57.1 (tambien vLLM) |
| Pipeline declarado | image-text-to-text |
| Modelo base | baidu/Unlimited-OCR |
| Revision de origen | 07dea832e22aefee32ad281d4b80551282e1c168 |
| Fecha de publicacion del repack | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo vision-lenguaje orientado a OCR y conversion de documentos a texto estructurado, con pesos en bfloat16 y necesidad de cargar codigo propio del repositorio (`trust_remote_code=True`, `use_safetensors=True`). No se detallan en las fuentes proporcionadas ni el tipo de encoder visual, ni el decoder, ni si existe algun mecanismo de compresion de tokens visuales. El modelo se posiciona explicitamente como continuacion de DeepSeek-OCR, con el objetivo de llevar mas lejos el paradigma de *parsing* de horizonte largo en una sola pasada.

El unico detalle tecnico de preprocesado documentado son dos configuraciones de imagen para entrada de una sola pagina: `gundam` (`base_size=1024`, `image_size=640`, `crop_mode=True`) y `base` (`base_size=1024`, `image_size=1024`, `crop_mode=False`). Para multipagina y PDF solo se emplea la configuracion `base`, con `image_size=1024`. El pipeline de PDF se resuelve convirtiendo las paginas a imagenes con PyMuPDF a 300 dpi y llamando a `infer_multi`. En decodificacion se aplican heuristicas anti-repeticion (`no_repeat_ngram_size=35` con `ngram_window` de 128 para imagen unica y 1024 para multipagina). No hay datos disponibles sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni regimen de entrenamiento.

## Capacidades

- OCR de imagen unica con dos configuraciones de preprocesado (`gundam` con recorte y `base` sin recorte).
- Parsing multipagina en una sola generacion mediante `infer_multi`, con contexto de hasta 32.768 tokens.
- Procesamiento de PDF completo mediante conversion previa de paginas a imagenes con PyMuPDF (300 dpi documentado).
- Salida de resultados a disco con `output_path` y `save_results`, pensada para lotes de documentos.
- Capacidad multilingue declarada (sin listado de idiomas en la informacion disponible).
- Inferencia con transformers en GPU NVIDIA y soporte oficial de vLLM desde el 28 de junio de 2026.
- Entrenamiento y ajuste fino mediante integracion con ms-swift.
- Disponibilidad como servicio en ModelScope, Baidu Cloud y demo publica en Hugging Face Spaces.
- No hay informacion disponible sobre tool calling, function calling, uso agentico, modo de razonamiento explicito, audio ni vision general mas alla del dominio de documentos.

## Casos de uso

- Digitalizacion masiva de archivos administrativos: el modelo procesa lotes de documentos escaneados con `save_results=True` y contexto de hasta 32.768 tokens, lo que permite abordar expedientes completos sin trocear manualmente cada pagina.
- Conversion de PDF a texto para pipelines de RAG: la receta documentada convierte el PDF a imagenes a 300 dpi y llama a `infer_multi`, de modo que el texto extraido puede indexarse directamente en un motor de busqueda vectorial.
- Automatizacion contable y de facturacion: extraccion de datos de facturas y albaranes escaneados en flujos de back-office, con licencia MIT que permite integrar el modelo en producto propietario sin obligaciones de copyleft.
- Procesamiento de documentacion multilingue en comercio internacional: al declarar soporte multilingue, encaja en la lectura de contratos, conocimientos de embarque y certificados en varios idiomas dentro de una misma cola de trabajo.
- Despliegue de alta concurrencia con vLLM: el soporte oficial permite servir el modelo con batching continuo para aplicaciones tipo API de OCR sobre documentos, en lugar de ejecutar transformers en proceso unico.
- Ajuste fino de dominio con ms-swift: equipos con tipos documentales muy especificos (partes medicos, polizas de seguros, formularios internos) pueden reentrenar el modelo y mantener el resultado bajo licencia MIT.
- Analisis de publicaciones cientificas o informes tecnicos: lectura de documentos extensos con tablas y figuras en una sola pasada, aprovechando el modo multipagina para preservar el orden de lectura.
- Archivado y auditoria documental: extraccion y guardado sistematico de resultados a disco para trazabilidad, comparando el texto reconocido con el documento original en procesos de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de origen referencia el articulo arXiv:2606.23050, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de benchmarks especificos de OCR (por ejemplo, comparativas frente a DeepSeek-OCR) en el material analizado. Tampoco se declaran cifras de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 6,7 GB (coherente con un repositorio de 6,8 GB en safetensors).
- VRAM estimada para imagen unica con contexto moderado: del orden de 8-12 GB, sumando pesos, cache KV y tokens visuales; es una estimacion basada en el numero de parametros, no una cifra publicada.
- VRAM estimada para multipagina con contextos cercanos a 32.768 tokens: por encima de 16-24 GB, ya que la atencion sobre muchas paginas incrementa la cache KV y el numero de tokens visuales.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070/4080 y RTX 4090 (esta ultima es la opcion mas holgada para modo multipagina). No hay confirmacion oficial de encaje en GPU de consumo en la informacion disponible.
- GPU de datacenter: A100 (40/80 GB) y H100, recomendables para vLLM con concurrencia alta y documentos largos.
- Entorno probado: Python 3.12.3 con CUDA 12.9, torch 2.10.0, torchvision 0.25.0, transformers 4.57.1, Pillow 12.1.1, PyMuPDF 1.27.2.2, einops 0.8.2, addict 2.4.0, easydict 1.13, psutil 7.2.2, matplotlib 3.10.8.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM (receta oficial) y ms-swift para entrenamiento. No se documentan pesos GGUF ni integracion con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ABrunsch/Unlimited-OCR-repacked | 3,34 mil millones | Hasta 32.768 tokens en los ejemplos publicados | MIT | Hugging Face (repack de terceros) | Pesos identicos a baidu/Unlimited-OCR; safetensors divididos en 4 fragmentos |
| baidu/Unlimited-OCR | 3,34 mil millones (mismo modelo) | Igual | MIT segun el repositorio analizado | Hugging Face, ModelScope, Baidu Cloud, demo en Spaces | Version oficial; soporte de vLLM y ms-swift |
| DeepSeek-OCR | No disponible en la informacion proporcionada | No disponible | No disponible | GitHub publico | Citado por Baidu como punto de partida que Unlimited-OCR pretende superar; no se aportan cifras comparativas |

No se dispone de datos de otros modelos comparables en la informacion proporcionada, por lo que no se incluyen mas alternativas.

## Limitaciones y advertencias

- El repositorio es un reempaquetado de terceros, no una publicacion oficial de Baidu; aunque se afirma que los pesos no cambian, conviene verificar la integridad frente a la revision de origen `07dea832e22aefee32ad281d4b80551282e1c168`.
- El repositorio presenta 0 descargas y 0 likes y fue creado el 16 de septiembre de 2026, por lo que no tiene historial de uso ni validacion de la comunidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python incluido en el repositorio; debe auditarse antes de usarlo en entornos de produccion.
- No hay resultados de benchmarks en la informacion disponible, de modo que el rendimiento real en tareas concretas de OCR no puede contrastarse con cifras.
- El uso de `no_repeat_ngram_size=35` como heuristica en todos los ejemplos sugiere que la generacion puede entrar en bucles de repeticion sin ese control.
- La declaracion multilingue no viene acompanada de una lista de idiomas ni de tasas de error por idioma; el rendimiento en escrituras no latinas no esta confirmado.
- Los modelos de OCR basados en vision-lenguaje pueden generar texto plausible no presente en la imagen (alucinacion), especialmente con escaneos de baja calidad, manuscritos, tablas complejas o formulas; no hay datos publicados sobre este extremo en la informacion disponible.
- No se ofrecen cuantizaciones (GGUF, 4 bits u otras), lo que limita el despliegue en hardware con poca VRAM.
- El modo multipagina esta restringido a la configuracion `base` con `image_size=1024`; no se documenta `gundam` para varias paginas.
- La licencia MIT permite uso comercial, pero conviene confirmar la licencia y condiciones del modelo original baidu/Unlimited-OCR y de sus dependencias (por ejemplo, el uso de PyMuPDF en el pipeline de PDF).
- El contexto efectivo en produccion dependera de la VRAM disponible: ventanas cercanas a 32.768 tokens con muchas paginas pueden provocar errores de memoria.

## Enlaces

- Repositorio analizado: https://huggingface.co/ABrunsch/Unlimited-OCR-repacked
- Modelo original: https://huggingface.co/baidu/Unlimited-OCR
- Codigo en GitHub: https://github.com/baidu/Unlimited-OCR
- Articulo en arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Documentacion en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- vLLM: https://github.com/vllm-project/vllm
- ms-swift: https://github.com/modelscope/ms-swift
- DeepSeek-OCR (referencia citada por el autor): https://github.com/deepseek-ai/DeepSeek-OCR
- Perfil en Trendshift: https://trendshift.io/repositories/62053
- Cuenta de X de Baidu: https://x.com/Baidu_Inc
- La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente planificadores de rutas), por lo que no se anaden enlaces adicionales.
