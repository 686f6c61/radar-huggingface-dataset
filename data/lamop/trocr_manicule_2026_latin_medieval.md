# LaMOP/TrOCR_Manicule_2026_Latin_Medieval

## Resumen

TrOCR_Manicule_2026_Latin_Medieval es un modelo de reconocimiento de texto manuscrito (HTR) especializado en documentos historicos medievales, desarrollado por LaMOP y publicado en HuggingFace. Se trata de un ajuste fino (finetune) del modelo `microsoft/trocr-base-handwritten`, orientado a la transcripcion automatica de lineas manuscritas procedentes de actas, cartularios y manuscritos tardomedievales. Su proposito es cubrir un nicho poco atendido por los modelos genericos de OCR: la escritura manuscrita historica en latin y, segun la propia model card, tambien frances antiguo.

Tecnicamente es un modelo vision-encoder-decoder de tipo TrOCR, con un codificador visual ViT que trabaja a 384 x 384 pixeles y un decodificador de tipo RoBERTa. Cuenta con 333.921.792 parametros (aproximadamente 334 M), lo que lo situa en la gama "base" de la familia TrOCR y permite ejecutarlo en hardware modesto. El repositorio ocupa 1,3 GB y los pesos se distribuyen en formato safetensors.

Su relevancia actual reside en la digitalizacion masiva de fondos documentales medievales y en la necesidad de pipelines de transcripcion asistida para proyectos de humanidades digitales. Al estar liberado bajo licencia MIT y basarse en una arquitectura estandar soportada por Transformers, puede integrarse en flujos de trabajo existentes sin dependencias propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder TrOCR (codificador ViT + decodificador RoBERTa) |
| Parametros totales | 333.921.792 (aproximadamente 334 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el decodificador es de tipo RoBERTa; en el ejemplo de uso se generan hasta 128 tokens nuevos por linea) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors en precision completa) |
| Idiomas soportados | Latin (`la`) segun los metadatos; la model card indica latin y frances antiguo |
| Licencia | MIT |
| Formato de pesos | safetensors (via Transformers / PyTorch) |
| Resolucion de entrada | 384 x 384 pixeles |
| Tarea (pipeline) | image-to-text |
| Modelo base | microsoft/trocr-base-handwritten |
| Tamano del repositorio | 1,3 GB |
| Frameworks | PyTorch, Transformers |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura TrOCR en su configuracion base: un codificador visual transformer (ViT) que procesa la imagen de la linea de texto a 384 x 384 pixeles y un decodificador autorregresivo de tipo RoBERTa que genera la secuencia de caracteres. Esta estructura sustituye al clasico esquema CNN + CTC por un enfoque completamente transformer y seq2seq, lo que permite modelar dependencias de largo alcance dentro de la linea transcrita y manejar vocabularios amplios sin un diccionario cerrado.

El ajuste fino se realizo a partir de `microsoft/trocr-base-handwritten` sobre dos conjuntos de datos declarados en la model card: `magistermilitum/Tridis` y `ENC-PSL/MEDUSA_Synthetic_Lines`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del corpus, la resolucion de las imagenes originales ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas HTR). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal: el modelo es una adaptacion de dominio de una arquitectura preexistente.

## Capacidades

- Transcripcion de lineas manuscritas de documentos historicos: actas, cartularios y manuscritos tardomedievales.
- Reconocimiento de escritura manuscrita (HTR), no solo texto impreso.
- Generacion de texto condicionada a imagen (pipeline image-to-text) con decodificacion autorregresiva.
- Trabajo a nivel de linea: requiere que la imagen de entrada contenga una unica linea de texto ya segmentada.
- Cobertura linguistica de latin y, segun la model card, frances antiguo; los metadatos de HuggingFace solo declaran latin (`la`).
- Inferencia en CPU o GPU mediante PyTorch y Transformers, con control del numero de tokens generados (`max_new_tokens`).
- No se documenta soporte de tool calling, function calling, modo de razonamiento explicito, vision general (mas alla del texto en imagen), audio ni capacidades de agente.

## Casos de uso

- Digitalizacion masiva de fondos documentales: el modelo permite transcribir linea a linea colecciones completas de cartularios y registros notariales, reduciendo el coste de la transcripcion manual en proyectos de archivo con miles de folios.
- Creacion de corpus textuales consultables: una vez transcritas las lineas, el texto resultante puede indexarse para busquedas a texto completo sobre documentacion medieval, habilitando investigacion historica y linguistica a gran escala.
- Edicion critica asistida: el transcriptor genera una primera version que el editor humano corrige, lo que acelera la preparacion de ediciones diplomaticas o criticas frente a la transcripcion desde cero.
- Segmentacion y transcripcion en pipelines HTR completos: combinado con herramientas de segmentacion de pagina (por ejemplo, Kraken o eScriptorium), el modelo actua como motor de reconocimiento de linea dentro de un flujo que primero detecta y recorta cada linea.
- Investigacion paleografica cuantitativa: al poder ejecutarse sobre corpus controlados, permite medir tasas de error por escriba, periodo o tipo de letra, y estudiar la variabilidad grafica con datos objetivos.
- Enriquecimiento linguistico de corpus historicos: el texto transcrito sirve como entrada para tareas posteriores de lematizacion, normalizacion ortografica o etiquetado morfosintactico sobre latin medieval y frances antiguo.
- Publicacion digital en TEI-XML: la salida de texto puede integrarse en plataformas de edicion digital que requieren transcripciones estructuradas, aportando la capa de reconocimiento optico sin salir del ecosistema Transformers.
- Prototipado y docencia en humanidades digitales: con 334 M de parametros y licencia MIT, es viable ejecutarlo en un portatil con GPU de gama media o incluso en CPU, lo que facilita su uso en cursos y proyectos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de error de caracteres (CER), tasa de error de palabra (WER) ni comparaciones cuantitativas con otros sistemas HTR sobre los conjuntos de datos empleados.

## Requisitos de hardware

- Parametros: 333,9 M, lo que supone aproximadamente 1,34 GB de pesos en FP32 y unos 0,67 GB en FP16.
- VRAM estimada para inferencia: en torno a 2-3 GB en FP16/BF16 incluyendo activaciones y el proceso de generacion; el repositorio completo ocupa 1,3 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; NVIDIA RTX 3060, RTX 4060, RTX 2080 Ti, Tesla T4 y superiores ofrecen margen de sobra. En gamas profesionales, A100 o H100 no aportan ventaja significativa para este tamano salvo por el procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna con 4 GB o mas; tambien en iGPU con memoria unificada suficiente y en CPU (con mayor latencia).
- Opciones de despliegue: Transformers con PyTorch (ruta oficial documentada en la model card), exportacion a ONNX Runtime, TorchScript, o integracion como motor dentro de pipelines de eScriptorium y similares. No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje decoder-only y no a esta arquitectura vision-encoder-decoder.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por linea ni de lineas por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma y dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaMOP/TrOCR_Manicule_2026_Latin_Medieval | 333,9 M | Linea de texto a 384 x 384 | Latin (y frances antiguo segun la model card), manuscritos medievales | MIT | HuggingFace, safetensors |
| microsoft/trocr-base-handwritten | No disponible en la informacion proporcionada (mismo orden de magnitud, modelo base de este ajuste) | Linea de texto a 384 x 384 | Ingles, escritura manuscrita contemporanea | MIT | HuggingFace, safetensors |
| microsoft/trocr-large-handwritten | No disponible en la informacion proporcionada | Linea de texto a 384 x 384 | Ingles, escritura manuscrita contemporanea | MIT | HuggingFace, safetensors |
| Sistemas HTR para documentos historicos (por ejemplo, modelos publicos de Transkribus o Kraken) | No disponible | Variable, habitualmente a nivel de linea | Multiples idiomas historicos | Mayoritariamente propietaria o especifica por proyecto | No disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de error de caracteres real del modelo sobre los corpus objetivo, lo que impide estimar su calidad frente a alternativas.
- Funciona exclusivamente a nivel de linea: la imagen de entrada debe contener una sola linea de texto segmentada. No realiza deteccion de layout ni segmentacion de paginas por si mismo.
- Ambito restringido a documentos historicos: el ajuste esta orientado a manuscritos medievales, por lo que su comportamiento en texto impreso, escritura moderna o formularios puede degradarse notablemente.
- Cobertura linguistica limitada: los metadatos declaran unicamente latin (`la`), mientras que la model card menciona tambien frances antiguo. Esta discrepancia no esta resuelta con datos de evaluacion por idioma.
- Riesgo de alucinacion inherente a la decodificacion autorregresiva: el modelo puede generar caracteres o palabras plausibles que no aparecen en la imagen, especialmente en lineas danadas, borrosas o con abreviaturas. La revision humana sigue siendo necesaria en contextos academicos.
- Sesgo de dominio probable: entrenado sobre dos conjuntos concretos (`Tridis` y `MEDUSA_Synthetic_Lines`), puede rendir peor en tradiciones graficas, manos, tintas o calidades de digitalizacion distintas de las representadas en esos datos.
- Historial de uso minimo: cero descargas y una sola interaccion registrada en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es necesario verificar aparte las condiciones de los datos de entrenamiento y del modelo base, asi como los derechos sobre las imagenes que se procesen.
- Fecha de publicacion futura respecto a la fecha de referencia habitual de consulta (10 de septiembre de 2026 segun los metadatos), lo que sugiere que puede tratarse de una publicacion muy reciente o de metadatos con fecha no convencional.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion relevante sobre el modelo (correspondian a contenidos sin relacion), por lo que no se ha podido contrastar la informacion de la model card con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaMOP/TrOCR_Manicule_2026_Latin_Medieval
- Modelo base: https://huggingface.co/microsoft/trocr-base-handwritten
- Dataset declarado: https://huggingface.co/datasets/magistermilitum/Tridis
- Dataset declarado: https://huggingface.co/datasets/ENC-PSL/MEDUSA_Synthetic_Lines
- Paper de la arquitectura TrOCR (referencia externa, no procedente de la busqueda web): https://arxiv.org/abs/2109.10282
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) sobre este modelo.
