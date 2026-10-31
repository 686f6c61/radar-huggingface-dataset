# prithivMLmods/tencent-WeVisOne-VL-4B-GGUF

## Resumen

WeVisOne-VL-4B es un modelo vision-language (VLM) unificado de codigo abierto desarrollado por WeChat Vision, Tencent Inc., construido sobre la base de Qwen3-VL. Su aportacion principal es unir la comprension visual generalista con una percepcion espacial de granularidad fina: no solo describe imagenes, sino que realiza deteccion de objetos de vocabulario abierto, localizacion referida, conteo, señalamiento (pointing), OCR, segmentacion referida y matting de alfa, todo mediante prediccion estructurada del siguiente token. Esta version concreta es una cuantizacion GGUF publicada por prithivMLmods, que permite ejecutar el modelo de forma local con llama.cpp.

La relevancia del modelo radica en que las tareas de percepcion visual precisa (cajas, mascaras, mattes) normalmente requieren modelos especializados separados; WeVisOne-VL-4B las unifica en un unico modelo autorregresivo de unos 4.400 millones de parametros, con tokens dedicados de vocabulario (`<0>` a `<1000>`) para coordenadas normalizadas y un token de instancia (`<OBJ>`) tras cada caja predicha. Complementa el LLM con un decodificador de pixeles ligero de 9,6 millones de parametros para producir salidas densas de alta resolucion.

Fue entrenado con un curriculum de fine-tuning supervisado en tres etapas seguido de aprendizaje por refuerzo de tareas mixtas sobre aproximadamente 100 millones de imagenes, lo que le permite manejar de forma robusta la ausencia de objetivos mediante rechazos explicitos (`None`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM unificado basado en Qwen3-VL con decodificador de pixeles ligero (9,6M de parametros) |
| Parametros totales | 4.415.233.536 (safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta version); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

WeVisOne-VL-4B parte de Qwen3-VL y extiende su vocabulario con tokens dedicados `<0>` a `<1000>` que representan coordenadas espaciales normalizadas, de modo que las cajas delimitadoras y los puntos se emiten como secuencias de texto estructuradas. Tras cada caja predicha, el modelo emite un token de instancia (`<OBJ>`), que condiciona las etapas posteriores de prediccion densa.

Para las tareas a nivel de pixel (segmentacion referida y matting de alfa), el modelo incorpora tres componentes: un decodificador de pixeles ligero de 9,6 millones de parametros que reutiliza caracteristicas multi-nivel del ViT mediante un adaptador visual, un decodificador de consultas guiado por cajas con atencion cruzada deformable, y una cascada de prediccion densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que genera mattes de alfa continuos de alta resolucion. El entrenamiento siguio un curriculum de fine-tuning supervisado en tres etapas y un pipeline de aprendizaje por refuerzo con tareas mixtas, sobre aproximadamente 100 millones de imagenes.

## Capacidades

- Comprension visual generalista: descripcion de imagenes, respuesta visual a preguntas y conversacion multimodal (pipeline image-text-to-text).
- Deteccion de objetos de vocabulario abierto (open-vocabulary object detection).
- Comprension de expresiones referidas (referring expression comprehension) y localizacion referida.
- Conteo de objetos (object counting) y señalamiento de puntos (point grounding).
- OCR integrado en el pipeline visual.
- Segmentacion referida (referring expression segmentation) a nivel de pixel.
- Matting de alfa activable por prompt (promptable alpha matting) con salidas de alta resolucion.
- Manejo explicito de la ausencia de objetivos mediante rechazos `None`, reduciendo falsos positivos.
- Generacion de texto en ingles (idioma soportado declarado).
- No hay informacion disponible sobre tool calling, agentes ni modos de razonamiento explicito.

## Casos de uso

- Deteccion y localizacion de objetos en pipelines de vision: al emitir cajas como tokens de texto, el modelo se integra facilmente en sistemas de analisis de imagenes sin necesidad de detectores especializados separados, ideal para prototipado rapido de aplicaciones de vision.
- Indexacion y busqueda de imagenes por lenguaje natural: la comprension de expresiones referidas permite localizar en una imagen el objeto descrito por una frase, util para catalogos de producto y gestion de bibliotecas multimedia.
- Extraccion de texto de documentos e interfaces (OCR): puede transcribir texto de capturas, facturas o escaneos combinandolo con la localizacion espacial de cada elemento.
- Segmentacion dirigida por prompt para edicion visual: la segmentacion referida y el matting de alfa permiten recortar objetos de alta calidad para composicion, e-commerce o herramientas de diseno.
- Conteo y verificacion automatizada: el conteo de objetos con rechazo explicito `None` es adecuado para control de calidad industrial o auditoria visual de inventarios.
- Asistentes multimodales locales: gracias al formato GGUF y su tamaño reducido (2,25-8,84 GB segun cuantizacion), puede ejecutarse en equipos de consumo con llama.cpp para chat visual sin depender de la nube.
- Generacion de datos de entrenamiento: su capacidad de anotar cajas, puntos y mascaras a partir de texto lo hace util para pre-etiquetar datasets de vision de forma semiautomatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo "logra un rendimiento robusto en diversos benchmarks de vision", pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin contar el proyector multimodal de 839 MB ni la KV cache):
  - Q3_K_M: ~2,25 GB; Q4_K_M: ~2,72 GB; Q5_K_M: ~3,16 GB; Q6_K: ~3,63 GB; Q8_0: ~4,7 GB; BF16: ~8,84 GB.
  - Con imagen y contexto, anadir margen de 1-2 GB adicionales.
- GPU recomendadas: cualquier GPU con 6 GB de VRAM o mas ejecuta comodamente las cuantizaciones Q4-Q6; para BF16 se recomiendan 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Consumer GPUs: cabe sin problemas en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores en cuantizaciones Q4/Q5; incluso es viable en CPU pura o con offload parcial dado su tamaño contenido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, indicado en la model card), Ollama (via llama.cpp), LM Studio. No hay informacion disponible sobre soporte en vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tareas visuales destacadas | Licencia |
|---|---|---|---|---|
| WeVisOne-VL-4B (este) | 4,4B | GGUF, safetensors | Deteccion, grounding, conteo, OCR, segmentacion, matting | Apache 2.0 |
| Qwen3-VL (base de este modelo) | Variantes desde ~4B | safetensors, GGUF de la comunidad | Comprension visual general, OCR, video | Segun variante |
| Florence-2 (Microsoft) | 0,77B | safetensors | Deteccion, grounding, segmentacion referida, OCR | MIT |

Frente a alternativas, la ventaja diferencial de WeVisOne-VL-4B es la inclusion del matting de alfa a nivel de pixel dentro de un unico modelo autorregresivo, algo que Florence-2 no cubre y que normalmente exige modelos dedicados como SAM o matting networks especificos.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el ingles; no hay soporte confirmado para castellano ni otras lenguas.
- Longitud de contexto: no disponible en la informacion proporcionada; verificar en el modelo base antes de planificar aplicaciones con muchas imagenes o documentos largos.
- Las tareas de pixel (segmentacion y matting) dependen de componentes adicionales (decodificador de pixeles, cascada de alfa) cuya disponibilidad en la version GGUF para llama.cpp no esta documentada; es posible que solo funcionen con la implementacion original en transformers.
- Cuantizaciones agresivas (Q3_K_L, Q3_K_M) pueden degradar la precision de coordenadas espaciales y la calidad del OCR, criticas en este tipo de modelo.
- Riesgo de alucinacion: como todo VLM, puede describir objetos inexistentes; el rechazo explicito `None` mitiga esto en tareas de deteccion pero no elimina el riesgo en descripcion libre.
- Sesgos: entrenado con ~100 millones de imagenes cuya composicion no se detalla; pueden existir sesgos de dominio (por ejemplo, hacia imagenes de web y redes sociales de WeChat).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los terminos del modelo base de Tencent.
- Advertencia sobre la fecha: el repositorio indica creacion en 2026; la adopcion y el soporte por parte de las herramientas de inferencia pueden ser todavia limitados (590 descargas y 2 likes en el momento de la ficha).

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/tencent-WeVisOne-VL-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial o demo: no disponible
