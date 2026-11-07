# opticsWolf/slanet-plus-onnx

## Resumen

SLANet-plus ONNX es un repositorio de servicio autocontenido que empaqueta el modelo SLANet_plus de reconocimiento de estructura de tablas, perteneciente a la familia PP-Structure de PaddlePaddle, exportado al formato ONNX. No se trata de un modelo de lenguaje generativo, sino de un modelo de vision por computador especializado en image-to-text: recibe una imagen de una tabla y devuelve la estructura de sus celdas (cajas delimitadoras y probabilidades de estructura). El autor del repositorio es opticsWolf, que lo publica como artefacto de despliegue listo para servir.

El modelo resuelve un problema concreto dentro de pipelines de extraccion documental: determinar la estructura logica de una tabla (filas, columnas, celdas y sus relaciones) a partir de una imagen normalizada de 488x488 pixeles. Es relevante porque permite integrar el reconocimiento de estructura de tablas en entornos de inferencia que no dependen de PaddlePaddle, al estar exportado a ONNX, y porque sustituye una copia previa de los mismos pesos bajo una licencia no declarada por una procedencia limpia (Apache-2.0).

El repositorio tiene un tamano declarado de 0.0 GB y no registra descargas ni likes en el momento de la consulta. La model card documenta la procedencia exacta de los pesos, las firmas de entrada y salida, y una evaluacion de fp16 que fue descartada. No se dispone de informacion sobre parametros totales, contexto (no aplica a este tipo de modelo) ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SLANet_plus (familia PP-Structure de PaddlePaddle), exportado a ONNX; no se detalla la topologia interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision image-to-text, no de lenguaje) |
| Tipos de cuantizacion | ONNX en precision original; se evaluo fp16 y se rechazo (no se publica artefacto fp16) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`slanet-plus.onnx`) |

Datos adicionales de la firma de inferencia:

| Parametro | Valor |
|---|---|
| Entrada `x` | `[1, 3, 488, 488]`, canvas normalizado con estadisticas ImageNet |
| Salida `scale_0` | cajas delimitadoras de celdas, `[1, 40, 8]` |
| Salida `scale_1` | probabilidades de estructura, `[1, 40, 50]` |
| Tamano del artefacto | 7.8 MB (segun la model card) |
| SHA-256 de `slanet-plus.onnx` | `d57a942af6a2f57d6a4a0372573c696a2379bf5857c45e2ac69993f3b334514b` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de SLANet_plus mas alla de su pertenencia a la familia PP-Structure de PaddlePaddle. Se trata de un modelo de vision orientado a la tarea de reconocimiento de estructura de tablas (table structure recognition), que produce dos cabezas de salida: una de cajas delimitadoras de celdas (`scale_0`) y otra de probabilidades de estructura (`scale_1`). El repositorio no aporta datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, que por otra parte no son habituales en este tipo de modelo.

El aspecto tecnico mas relevante documentado es la trazabilidad de los pesos: el fichero `slanet-plus.onnx` es byte-identico (mismo SHA-256) al `slanet-plus.onnx` de RapidAI/RapidTable v2.0.0 publicado en ModelScope bajo Apache-2.0, y los pesos originales proceden del SLANet_plus oficial de PaddlePaddle, tambien Apache-2.0. El repositorio sustituye asi una copia previa de los mismos bytes incluida en `opendatalab/PDF-Extract-Kit-1.0`, que carecia de licencia declarada, sin cambio funcional alguno.

Tambien se documento una evaluacion de fp16 realizada el 2026-11-07: se midio un tiempo de aproximadamente 37-40 ms por ejecucion en una RTX 3090, con una deriva maxima de 0.041 en la cabeza de estructura, y un rendimiento en CUDA practicamente igual al de CPU. Por ese motivo se rechazo el artefacto fp16 y la politica de servicio fija el modelo a CPU.

## Capacidades

- Reconocimiento de estructura de tablas a partir de imagenes: genera cajas delimitadoras de celdas y probabilidades de estructura de la tabla.
- Salida en dos cabezas: `scale_0` con hasta 40 cajas de 8 valores y `scale_1` con hasta 40 posiciones y 50 clases de estructura.
- Inferencia sobre canvas de entrada fijo de 488x488 pixeles con normalizacion ImageNet.
- Exportacion ONNX que permite ejecutar el modelo fuera del ecosistema PaddlePaddle.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas, vision general, audio ni modo thinking.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues (el modelo opera sobre imagenes, no sobre texto).
- El modelo esta pensado como componente de un pipeline mayor de extraccion documental, no como modelo autonomo de proposito general.

## Casos de uso

- Extraccion de tablas en pipelines de digitalizacion documental: el modelo se inserta como etapa de reconocimiento de estructura despues de la deteccion de la region de tabla, y sus salidas `scale_0` y `scale_1` alimentan la reconstruccion de la tabla en HTML o CSV. Es adecuado porque su firma de entrada y salida esta fijada y documentada, lo que simplifica la integracion.
- Procesamiento de facturas y albaranes: en un flujo de captura de documentos financieros, el modelo identifica la rejilla de celdas para que un OCR posterior asigne el texto a cada celda. Su tamano de 7.8 MB permite incluirlo en servicios de alta concurrencia sin coste de memoria significativo.
- Digitalizacion de estados financieros y balances: las tablas de estos documentos tienen estructuras regulares que el modelo puede resolver con la cabeza de estructura, facilitando la conversion a formatos tabulares consultables.
- Servicio de extraccion de tablas en CPU: dado que la model card indica que la politica de servicio fija el modelo a CPU y que el rendimiento en CUDA es practicamente identico al de CPU (37-40 ms por ejecucion en RTX 3090), es adecuado para despliegues en servidores sin GPU o en contenedores con recursos limitados.
- Integracion en entornos ONNX Runtime: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en lugar de PaddlePaddle, lo que simplifica el despliegue en infraestructuras ya estandarizadas sobre ONNX.
- Sustitucion de dependencias con licencia poco clara: el repositorio reemplaza la copia de `opendatalab/PDF-Extract-Kit-1.0` por una procedencia Apache-2.0 verificable, lo que resulta util en proyectos que necesitan auditoria de licencias de sus dependencias.
- Preprocesamiento para busqueda documental: al convertir tablas en estructuras de celdas, el resultado puede indexarse y consultarse en sistemas de recuperacion de informacion sobre documentos escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento documentados son mediciones de latencia de la evaluacion fp16: aproximadamente 37-40 ms por ejecucion en una RTX 3090, con una deriva maxima de 0.041 en la cabeza de estructura y sin mejora respecto a CPU. No se aportan metricas de calidad (precision, recall, F1) sobre conjuntos de evaluacion de reconocimiento de estructura de tablas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el artefacto pesa 7.8 MB y la entrada es de 488x488, por lo que el consumo de memoria es reducido, pero no se aportan cifras concretas.
- GPU recomendadas: la model card cita una RTX 3090 en la evaluacion de fp16; no se documentan otras GPU recomendadas.
- Compatibilidad con GPU de consumo: si, el modelo se ha ejecutado en una RTX 3090. La politica de servicio del autor lo fija a CPU, por lo que la GPU no es necesaria.
- Opciones de despliegue: ONNX Runtime es la via natural al estar el modelo en formato ONNX; la model card menciona un "bobine table slot" como contexto de servicio. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 37-40 ms por ejecucion en RTX 3090 (medido durante la evaluacion de fp16); no se documenta throughput ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Procedencia | Notas |
|---|---|---|---|---|
| opticsWolf/slanet-plus-onnx | ONNX | Apache-2.0 | Byte-identico a RapidAI/RapidTable v2.0.0 | Objeto de esta ficha |
| RapidAI/RapidTable (v2.0.0, `slanet-plus.onnx`) | ONNX | Apache-2.0 | ModelScope | Mismos bytes que el modelo de esta ficha |
| PaddlePaddle/SLANet_plus | PaddlePaddle | Apache-2.0 | Repositorio oficial de PaddlePaddle | Pesos originales de los que derivan los anteriores |
| opendatalab/PDF-Extract-Kit-1.0 (copia previa) | ONNX | Sin licencia declarada | Copia de los mismos bytes | Sustituida por este repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparativa se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un modelo de vision sobre tablas, los sesgos relevantes serian los del dataset de entrenamiento original, que no se describe.
- Riesgo de alucinacion en el sentido de estructuras incorrectas: la cabeza de estructura emite probabilidades sobre 50 clases y hasta 40 posiciones, por lo que tablas con mas de 40 celdas o estructuras atipicas pueden quedar mal representadas; no se aportan metricas de calidad que cuantifiquen este riesgo.
- La entrada esta fijada a 488x488 pixeles, lo que impone un preprocesamiento de redimensionado que puede degradar tablas con texto muy pequeno o relaciones de aspecto extremas.
- No se documentan idiomas soportados; el modelo no procesa lenguaje, pero la calidad sobre tablas con escrituras no latinas no esta cuantificada.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la cadena de procedencia (PaddlePaddle y RapidAI/RapidTable) si redistribuye los pesos.
- El repositorio no registra descargas ni likes y tiene un tamano declarado de 0.0 GB, lo que sugiere que el artefacto podria no estar subido o que los metadatos son incompletos; conviene verificar la disponibilidad del fichero antes de integrarlo en produccion.
- La evaluacion de fp16 fue rechazada por falta de ganancia y por deriva en la cabeza de estructura; no debe asumirse que exista un artefacto fp16.
- No se aportan datos de entrenamiento, parametros ni benchmarks, lo que limita la evaluacion independiente del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/opticsWolf/slanet-plus-onnx
- SLANet_plus.onnx en PaddleOcrNet/PaddleOcrNet-models: https://huggingface.co/PaddleOcrNet/PaddleOcrNet-models/blob/main/SLANet_plus.onnx
- PaddlePaddle/SLANet_plus en Hugging Face: https://huggingface.co/PaddlePaddle/SLANet_plus
