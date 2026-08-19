# LiquidAI/LFM2.5-VL-3B-MLX-6bit

## Resumen

LFM2.5-VL-3B es un modelo de visión y lenguaje (VLM) desarrollado por Liquid AI, diseñado específicamente para su despliegue en dispositivos de borde (edge) y en la nube con baja latencia. Esta versión concreta, LFM2.5-VL-3B-MLX-6bit, es un export en formato MLX (Apple Silicon) del modelo base LFM2.5-VL-3B, que combina un backbone de lenguaje LFM2.5-2.6B con un codificador de visión SigLIP2 NaFlex de 400 millones de parámetros. El modelo destaca por sus capacidades de OCR, comprensión de documentos y pantallas, grounding de objetos mediante coordenadas, y function calling, todo ello en un paquete compacto de aproximadamente 3,1 mil millones de parámetros en el modelo base.

La relevancia de este modelo radica en su enfoque hacia la inferencia en dispositivos locales, especialmente en hardware de Apple, gracias a la optimización MLX. Esto permite ejecutar tareas complejas de visión y lenguaje sin depender de servicios en la nube, lo que resulta atractivo para aplicaciones de asistencia en tiempo real, automatización de procesos y agentes conversacionales con entrada visual. El modelo soporta 17 idiomas, incluyendo español, y está licenciado bajo la licencia propia lfm1.0, que debe revisarse para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone LFM2.5-2.6B) + codificador de vision SigLIP2 NaFlex (400M) |
| Parametros totales | 1.016.501.488 (export MLX segun safetensors); modelo base completo: ~3.1B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit (este export); otras cuantizaciones disponibles para el modelo base |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes, vietnamita |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B se construye sobre el backbone de lenguaje LFM2.5-2.6B, un modelo transformer denso desarrollado por Liquid AI, al que se añade un codificador de vision SigLIP2 NaFlex de 400 millones de parametros. Esta combinacion permite procesar tanto texto como imagenes de forma conjunta, con un diseño orientado a la eficiencia computacional para su ejecucion en dispositivos con recursos limitados. El modelo esta entrenado para tareas de comprension visual multilingue, OCR, comprension de documentos y pantallas, prediccion de bounding boxes y function calling, aunque no se han publicado detalles especificos sobre el corpus de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO.

La innovacion principal de este modelo reside en su capacidad para ejecutarse en Apple Silicon mediante MLX, lo que reduce significativamente la latencia en comparacion con soluciones basadas en CUDA. El export MLX en 6-bit mantiene un equilibrio entre precision y uso de memoria, permitiendo su despliegue en equipos con recursos moderados. No se dispone de informacion adicional sobre la arquitectura interna del backbone (por ejemplo, si utiliza atencion lineal, decodificacion especulativa u otras tecnicas avanzadas).

## Capacidades

- Generacion de texto y comprension visual multilingue: el modelo puede responder a preguntas sobre imagenes en 17 idiomas, incluyendo español.
- OCR (reconocimiento optico de caracteres): extrae texto de imagenes y documentos escaneados con alta precision.
- Comprension de documentos y pantallas: interpreta graficos, tablas, capturas de pantalla de aplicaciones moviles, web y escritorio.
- Grounding de objetos: predice bounding boxes (coordenadas) para localizar objetos especificos dentro de una imagen.
- Function calling: puede invocar herramientas o funciones externas a partir de entradas de texto o imagen, facilitando la integracion en agentes automatizados.
- Soporte de agentes y razonamiento multi-paso: aunque no se detalla explicitamente, su capacidad de function calling sugiere que puede participar en flujos de trabajo agenciales.
- Baja latencia en dispositivos Apple: gracias a la optimizacion MLX, el modelo puede ejecutarse en tiempo real en Macs con chip M1 o posterior.

## Casos de uso

- Atencion al cliente automatizada con soporte visual: el modelo puede analizar capturas de pantalla que el usuario envia y responder con instrucciones o soluciones, gracias a su comprension de pantallas y OCR. Su baja latencia permite respuestas casi inmediatas en un chat.
- Extraccion de datos de documentos: en entornos empresariales, puede procesar facturas, formularios o contratos escaneados, extrayendo campos clave (numeros, fechas, nombres) mediante OCR y comprension de documentos, reduciendo la necesidad de entrada manual.
- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir el contenido de una imagen o leer texto de carteles o etiquetas en tiempo real, ejecutandose localmente en un iPhone o Mac para garantizar privacidad.
- Automatizacion de pruebas de interfaz de usuario: gracias a su capacidad de grounding y comprension de pantallas, puede identificar elementos de UI (botones, campos de texto) y generar acciones o informes de bugs a partir de capturas.
- Agente de automatizacion de tareas en el escritorio: con function calling, el modelo puede interpretar una instruccion en lenguaje natural junto con una imagen del estado actual de la aplicacion y ejecutar acciones (hacer clic, escribir) mediante herramientas externas, util para RPA ligero.
- Analisis de imagenes medicas o cientificas en entornos sin conexion: aunque no esta especializado en diagnostico, puede ayudar a describir hallazgos visuales en radiografias o graficos cientificos, con la ventaja de ejecutarse en un dispositivo local para cumplir normativas de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial menciona que el modelo es "mas capaz y rapido" que sus predecesores, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K o metricas de vision como VQAv2 o DocVQA. Se recomienda consultar el blog de Liquid AI para futuras actualizaciones.

## Requisitos de hardware

- Dispositivos objetivo: Apple Silicon (chip M1, M2, M3 o posteriores) con macOS 13 o superior.
- Memoria: el repositorio ocupa 3,1 GB en formato 6-bit, por lo que se recomienda al menos 8 GB de RAM unificada para una ejecucion fluida; 16 GB o mas para contextos largos o procesamiento por lotes.
- GPU: no requiere GPU discreta; utiliza la GPU integrada del chip Apple Silicon via MLX.
- Opciones de despliegue: el modelo se usa con la libreria `mlx-vlm`, que permite generacion desde linea de comandos o mediante API Python. Tambien se puede integrar en aplicaciones Swift o Objective-C a traves de los bindings de MLX.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al estar optimizado para MLX se espera una latencia inferior a 500 ms por token en chips M2 o superiores, dependiendo del tamaño de la imagen y la longitud de la respuesta.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros VLM de tamano similar. Como referencia cualitativa, LFM2.5-VL-3B compite con modelos como PaliGemma-3B (Google) o Phi-3.5-vision (Microsoft), pero no hay informacion suficiente para establecer una comparacion numerica fiable. La principal diferenciacion de este modelo es su soporte nativo para Apple Silicon via MLX, mientras que los otros suelen estar orientados a CUDA.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propietaria que puede imponer restricciones al uso comercial o a la redistribucion. Es imprescindible revisar el archivo LICENSE del repositorio antes de utilizarlo en produccion.
- Riesgo de alucinacion visual: como cualquier VLM, puede generar descripciones o respuestas incorrectas sobre el contenido de una imagen, especialmente en escenarios ambiguos o con baja resolucion.
- Sesgos potenciales: al entrenarse con datos web, puede heredar sesgos culturales o de genero en la interpretacion de imagenes y texto. No se han publicado evaluaciones especificas de sesgo.
- Limitacion de contexto: no se ha especificado la longitud maxima de contexto, lo que puede afectar a tareas que requieran multiples turnos o documentos extensos.
- Dependencia de MLX: el export esta limitado a Apple Silicon; para otros entornos (NVIDIA, AMD) es necesario utilizar el modelo base en formato PyTorch o GGUF, que no estan incluidos en este repositorio.
- El numero de parametros del export MLX (1.016M) difiere del modelo base (3.1B), lo que sugiere que el export puede contener solo una parte del modelo (posiblemente el backbone de lenguaje sin el vision encoder, o una version podada). Esto debe tenerse en cuenta al evaluar su rendimiento real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-6bit
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion oficial de LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Articulo de MarkTechPost: https://www.marktechpost.com/2026/08/13/liquid-ai-lfm2-5-vl-3b-on-device-vision-language-model/
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
