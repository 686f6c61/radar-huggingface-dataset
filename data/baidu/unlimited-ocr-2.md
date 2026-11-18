# baidu/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 (Unlimited OCR Works 2) es un modelo vision-language de extraccion de texto desarrollado por Baidu, disenado especificamente para el parseo de documentos de longitud ilimitada. Se presenta como la evolucion de Unlimited-OCR 1.0, que a su vez buscaba superar a DeepSeek-OCR, y su propuesta central es eliminar el cuello de botella cuadratico de la atencion cuando se procesan documentos de decenas o cientos de paginas. Con aproximadamente 3.340 millones de parametros, se posiciona como un modelo compacto frente a los grandes VLM generalistas, pero altamente especializado en OCR y estructura de documentos.

La innovacion tecnica que lo define es Sparse Reference Sliding Window Attention (SR-SWA), que comprime las interacciones texto-visual de secuencias ultra-largas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens). Esto mantiene practicamente constante la latencia por paso de decodificacion y el consumo de memoria independientemente de la longitud del documento, lo que permite un parseo sin limite practico dentro de una ventana de contexto finita.

Es relevante ahora porque ataca un problema real de produccion: digitalizar archivos escaneados de cientos de paginas manteniendo coherencia entre paginas y sin que el coste de inferencia se dispare. Se distribuye con licencia MIT, pesos safetensors, integracion nativa con Transformers y soporte de vLLM y SGLang, y acumula mas de 584.000 descargas y 708 likes en Hugging Face desde su publicacion en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con Sparse Reference Sliding Window Attention (SR-SWA); codigo personalizado (`trust_remote_code`) |
| Parametros totales | 3.343.978.497 (~3,34 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en cifras; el autor describe una ventana de contexto finita que soporta parseo de horizonte ilimitado mediante SR-SWA |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; la model card recomienda bfloat16) |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 7,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo vision-language de tipo image-text-to-text orientado a OCR, con un codificador de imagen que procesa cada pagina como una vista global (modo base) y un decodificador de lenguaje que genera la salida estructurada. El componente diferenciador es SR-SWA: en lugar de mantener atencion completa sobre todas las representaciones visuales de todas las paginas, comprime la interaccion texto-visual a un conjunto fijo de referencias de trabajo de tamano acotado (el autor cita 512 tokens como ejemplo). El resultado es que la complejidad computacional y la huella de memoria por paso de decodificacion se mantienen aproximadamente constantes aunque el documento crezca, evitando el escalado cuadratico de la atencion estandar.

El modelo se entrena con soporte de la comunidad ms-swift (framework de entrenamiento de ModelScope), lo que sugiere un pipeline de ajuste supervisado sobre pares imagen-texto de documentos. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que la version 2 esta disenada para parseo multipagina en una sola peticion, de modo que el modelo aprovecha contexto entre paginas, y que la salida conserva un marcador `<PAGE>` por pagina de entrada en el mismo orden.

## Capacidades

- Extraccion de texto OCR de imagenes de documentos, con salida estructurada por pagina.
- Parseo multipagina en una unica peticion mediante `infer_multi`, con aprovechamiento de contexto entre paginas.
- Parseo de documentos de horizonte ilimitado: decenas y cientos de paginas sin degradacion cuadratica de latencia o memoria.
- Soporte multilingue declarado por el autor.
- Procesamiento image-text-to-text (entrada de imagenes, salida de texto).
- Integracion con Transformers (nativo, para pruebas rapidas), vLLM y SGLang (recomendado para serving).
- Soporte de entrenamiento y ajuste fino mediante ms-swift.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento agentico ni modos de pensamiento extendido.

## Casos de uso

- Digitalizacion de expedientes y archivos administrativos: el modelo puede procesar un PDF escaneado de cientos de paginas en una sola peticion y mantener la coherencia entre paginas gracias a SR-SWA, lo que resulta adecuado para fondos documentales historicos o legales donde el orden y la continuidad importan.
- Extraccion de texto en pipelines de ingestion de datos para RAG: al mantener latencia y memoria casi constantes con la longitud del documento, se puede integrar en un servicio de conversion continua de documentos corporativos a texto indexable sin escalar el hardware segun el tamano del archivo.
- Procesamiento de informes financieros y memorias anuales: documentos de decenas a cientos de paginas con tablas y texto corrido, donde el parseo multipagina en una sola llamada reduce la necesidad de trocear manualmente el documento y de recomponer el resultado.
- Digitalizacion de publicaciones academicas y libros: el modelo esta evaluado en benchmarks de documentos de muchas paginas (MPDocBench) y de cientos de paginas (MarathonDocBench), lo que lo hace apropiado para bibliotecas digitales y repositorios academicos.
- Servicio OCR de alta concurrencia: con solo ~3,34 mil millones de parametros y soporte de vLLM y SGLang, se puede desplegar en una GPU de 80 GB y atender multiples peticiones, siendo adecuado para plataformas SaaS de conversion documental.
- Automatizacion de back-office con documentos escaneados: facturas, contratos y formularios de varias paginas procesados en lote mediante `infer_multi` con guardado de resultados, reduciendo el trabajo manual de transcripcion.
- Ajuste fino para dominios verticales: al ser compatible con ms-swift y tener licencia MIT, equipos internos pueden adaptar el modelo a tipografias, idiomas o formatos documentales especificos de su sector.

## Benchmarks y rendimiento

La model card indica que el modelo alcanza estado del arte en benchmarks de documentos de decenas de paginas (MPDocBench) y de cientos de paginas (MarathonDocBench), pero no se incluyen en la informacion proporcionada las cifras numericas de dichos resultados ni de otros benchmarks como MMLU, HumanEval o GSM8K (que, por otra parte, no son el objetivo de este modelo). Los valores concretos estan en la figura de leaderboard de la model card y en el paper de arXiv, no reproducidos aqui.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,34 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 6,7 GB; el repo completo pesa 7,1 GB. A ello hay que sumar la memoria de activaciones y del codificador visual, que depende de la resolucion de las paginas y del numero de paginas procesadas simultaneamente.
- GPU recomendadas: el autor indica que las pruebas se realizaron en una NVIDIA A800-80GB, lo que sugiere margen amplio para lotes grandes o documentos muy largos. Una GPU de 24 GB (RTX 4090, A10G) deberia ser suficiente para inferencia en bfloat16 con documentos moderados, aunque no se confirma en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantizacion, aunque no se documentan cuantizaciones oficiales ni requisitos minimos verificados.
- Opciones de despliegue: Transformers (nativo, recomendado para pruebas), SGLang (recomendado por el autor para serving), vLLM (soportado desde junio de 2026). No se menciona soporte de llama.cpp ni Ollama.
- Latencia y throughput: no se publican cifras concretas; el autor afirma que la latencia por paso de decodificacion y la memoria se mantienen casi constantes con la longitud del documento gracias a SR-SWA, pero no se aportan numeros en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited OCR 2 (Baidu) | ~3,34 mil millones | OCR VLM con SR-SWA para documentos ilimitados | Ventana finita con parseo de horizonte ilimitado | MIT | Hugging Face, ModelScope, Baidu Cloud, vLLM, SGLang |
| Unlimited-OCR 1.0 (Baidu) | no disponible | OCR VLM orientado a documentos largos | no disponible | no disponible | Hugging Face, ModelScope |
| DeepSeek-OCR (DeepSeek) | no disponible | OCR VLM | no disponible | no disponible | GitHub de DeepSeek |

No se dispone en la informacion proporcionada de datos de parametros, contexto ni rendimiento de los modelos comparables, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- No se documentan en la informacion disponible los sesgos conocidos del modelo; al ser multilingue y entrenado por Baidu, es razonable esperar un sesgo hacia el chino y el ingles, pero no se confirma.
- Riesgo de alucinacion: como todo modelo generativo de OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tipografias poco comunes; no se aportan tasas de error.
- La ventana de contexto es finita: el parseo de horizonte ilimitado se logra comprimiendo la atencion a referencias fijas, lo que implica una perdida controlada de informacion visual detallada en documentos extremadamente largos; no se cuantifica dicha perdida.
- No se detallan limitaciones de idioma mas alla de la etiqueta "multilingual".
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el modelo usa codigo personalizado (`trust_remote_code`), lo que exige auditar el codigo remoto antes de desplegarlo en produccion.
- Requiere versiones concretas de dependencias (torch 2.13.0, transformers 4.52.1, tokenizers 0.21.4) segun las pruebas del autor; otras versiones pueden no funcionar.
- No se documentan cuantizaciones oficiales ni soporte de llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU o con GPUs muy modestas.
- El modelo esta especializado en OCR y parseo de documentos; no es un asistente general ni soporta tool calling ni razonamiento agentico.

## Enlaces

- Hugging Face: https://huggingface.co/baidu/Unlimited-OCR-2
- GitHub: https://github.com/baidu/Unlimited-OCR
- Paper (Unlimited OCR 2): https://arxiv.org/abs/2610.39308
- Paper (Unlimited OCR 1.0): https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR-2
- Demo anterior en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Baidu Cloud (documentacion OCR): https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Entrada web TextMind (Baidu AI Cloud): https://console.bce.baidu.com/textmind/application/textParser
- ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- vLLM: https://github.com/vllm-project/vllm
- DeepSeek-OCR (referencia): https://github.com/deepseek-ai/DeepSeek-OCR
- Twitter/X de Baidu: https://x.com/Baidu_Inc
