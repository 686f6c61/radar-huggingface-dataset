# kongtong/lingshu-paddleocr-vl-1.6-8bit

## Resumen

Lingshu PaddleOCR-VL 1.6 8-bit es una cuantizacion en 8 bits del modelo PaddleOCR-VL-1.6 de PaddlePaddle, publicada por el usuario kongtong bajo el identificador `kongtong/lingshu-paddleocr-vl-1.6-8bit`. Se trata de un modelo de vision-lenguaje especializado en reconocimiento optico de caracteres (OCR) y analisis de documentos, disenado para convertir imagenes de documentos en texto estructurado, incluyendo tablas, formulas, graficos, sellos y deteccion de texto (spotting). El modelo base emplea componentes de la familia ERNIE 4.5, segun las etiquetas de la model card.

La relevancia de esta ficha radica en su formato de despliegue: los pesos estan en safetensors y la libreria es MLX, el framework de Apple para ejecucion de modelos en silicio de la compania (chips M1/M2/M3/M4). Esto permite ejecutar un modelo OCR-VL de aproximadamente 906 millones de parametros en equipos Mac con memoria unificada, sin necesidad de GPU dedicada. La cuantizacion a 8 bits reduce el peso del repositorio a unos 1,1 GB.

El modelo hereda la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial. No obstante, la informacion publicada es muy limitada: la model card no incluye detalles de arquitectura, datos de entrenamiento, benchmarks ni instrucciones de uso, por lo que buena parte de las especificaciones tecnicas de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en componentes ERNIE 4.5 y PaddleOCR (detalles no disponibles) |
| Parametros totales | 905.601.648 (~906 M) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (unica variante publicada en este repositorio) |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Las etiquetas de la model card indican que se apoya en ERNIE 4.5 y en la pila PaddleOCR de PaddlePaddle, y que la tarea principal es image-to-text orientada a documentos. El pipeline declarado es `image-text-to-text`, lo que sugiere un modelo vision-lenguaje que recibe una imagen y genera texto, en lugar de un OCR clasico por etapas separadas de deteccion y reconocimiento.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco hay informacion sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La unica transformacion documentada es la cuantizacion a 8 bits realizada por el autor de esta publicacion sobre el modelo base `PaddlePaddle/PaddleOCR-VL-1.6`.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Analisis de estructura de documentos (layout): identificacion de bloques, secciones y orden de lectura.
- Extraccion de tablas.
- Reconocimiento de formulas matematicas.
- Interpretacion de graficos (charts).
- Deteccion de sellos (seal).
- Text spotting, es decir, localizacion y transcripcion de texto en la imagen.
- Generacion de texto a partir de imagen (image-to-text) en un unico paso conversacional.
- Soporte multilingue, con enfasis en ingles y chino.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, vision adicional o audio: no disponible en la informacion.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede recibir la imagen de un documento comercial y devolver el texto y las tablas estructuradas, lo que permite alimentar sistemas de contabilidad sin transcripcion manual.
- Extraccion de tablas de informes financieros: gracias a su capacidad especifica de table, es adecuado para convertir tablas de PDFs escaneados en datos tabulares procesables.
- Procesamiento de articulos cientificos: la capacidad de reconocer formulas y graficos lo hace util para convertir publicaciones en texto y expresiones matematicas reutilizables.
- Gestion documental en archivos y administraciones publicas: el soporte de sellos (seal) y de layout permite clasificar y validar documentos oficiales escaneados.
- Automatizacion de entrada de datos en Mac: al estar empaquetado para MLX, puede ejecutarse localmente en equipos Apple Silicon para tareas de OCR en escritorio sin enviar documentos a la nube, lo que ayuda a cumplir requisitos de privacidad.
- Digitalizacion de documentacion en chino e ingles: el soporte nativo de ambos idiomas resulta adecuado para empresas con operaciones en mercados asiaticos y anglosajones.
- Preprocesado para pipelines RAG: la conversion de documentos escaneados a texto estructurado facilita la indexacion y la busqueda semantica sobre corpus documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: en torno a 1,1 GB para los pesos en 8 bits, mas el overhead de activaciones y del runtime MLX; el consumo real no esta documentado.
- GPU recomendadas: al estar empaquetado para MLX, el destino natural son los chips de Apple (series M1, M2, M3 y M4) con memoria unificada. No hay informacion sobre soporte en GPUs NVIDIA (A100, H100, RTX 4090) con este repositorio concreto.
- Compatibilidad con GPU de consumo: si, en equipos Mac con Apple Silicon; cualquier configuracion con 8 GB o mas de memoria unificada deberia ser suficiente para los pesos, aunque no hay confirmacion oficial.
- Opciones de despliegue: MLX (libreria declarada). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lingshu PaddleOCR-VL 1.6 8-bit (este) | ~906 M | No disponible | en, zh, multilingue | Apache 2.0 | Safetensors (MLX, 8 bits) |
| PaddlePaddle/PaddleOCR-VL-1.6 (base) | No disponible | No disponible | en, zh, multilingue | Apache 2.0 | No disponible |
| Otros modelos OCR-VL de la familia PaddleOCR | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas como para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse con datos de documentos, puede heredar sesgos de los corpus utilizados, especialmente en terminologia y formatos de determinadas regiones.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar texto, cifras o estructuras que no aparecen en la imagen, por lo que conviene validar la salida en entornos criticos.
- La longitud de contexto no esta publicada, lo que impide planificar el procesamiento de documentos muy extensos o de multiples paginas.
- El soporte linguistico declarado se limita a ingles, chino y multilingue generico; el rendimiento en castellano no esta verificado.
- Aunque la licencia es Apache 2.0, el autor de la cuantizacion no ofrece garantias adicionales; conviene revisar los terminos del modelo base.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado recientemente, por lo que no hay evidencia de uso en produccion ni validacion por la comunidad.
- La dependencia de MLX limita el despliegue a ecosistemas Apple; no hay indicios de compatibilidad con CUDA ni con servidores Linux con GPU.
- No se documentan requisitos de `transformers` ni codigo de inferencia, lo que puede complicar la integracion.

## Enlaces

- Hugging Face: https://huggingface.co/kongtong/lingshu-paddleocr-vl-1.6-8bit
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio PaddleOCR (PaddlePaddle): no disponible en la informacion proporcionada
- Paper o blog oficial: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
