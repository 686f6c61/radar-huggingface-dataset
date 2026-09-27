# aufklarer/GLiNER2.5-Decide-340M-MLX

## Resumen

GLiNER2.5-Decide-340M-MLX es la conversión a formato MLX del modelo fastino/GLiNER2.5-Decide, publicada por el usuario aufklarer para ejecutar inferencia nativa en Apple Silicon a través de la librería speech-swift. No es un modelo generativo: es un extractor de información que, dado un texto y un esquema de etiquetas definido por el usuario, devuelve una probabilidad por etiqueta (clasificación de etiqueta única) o los fragmentos del texto original que corresponden a cada etiqueta (extracción de entidades). Se apoya en un encoder DeBERTa-v3-large con las cabezas de span y clasificación de GLiNER2, con 340 millones de parámetros según la cifra del modelo original.

El interés de esta ficha concreta está en el formato: los pesos originales en PyTorch se han convertido al layout de MLX sin reentrenamiento, con precisión FP32 (pesos y activaciones en float32) y un fichero safetensors de 1.945,8 MB. Esto permite integrar el modelo en aplicaciones macOS mediante Swift, con latencias medidas de 11,1 ms por petición de enrutado y 12,6 ms por extracción en un Apple M5 Pro, y un pico de memoria de proceso de 2,55 GB.

La relevancia práctica es doble: por un lado, ofrece clasificación y NER zero-shot guiados por esquema, sin necesidad de reentrenar para cada dominio; por otro, es una de las pocas rutas limpias para llevar un extractor GLiNER2 a producción en el ecosistema Apple sin depender de CUDA ni de runtimes Python. La ventana de contexto es de 512 tokens codificados, que incluyen el esquema de etiquetas y el texto, y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DeBERTa-v3-large con cabezas de span y de clasificación de GLiNER2 |
| Parametros totales | 340M (cifra del modelo original) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens codificados (esquema y texto juntos) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; el repositorio solo ofrece FP32 (float32 en pesos y activaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 para los pesos del modelo; MIT para el código de conversión de referencia (LICENSE-gliner2-mlx) |
| Formato de pesos | safetensors en layout MLX (`weights.safetensors`, 1.945,8 MB, SHA-256 `463550909d8def2a009eaeca3b19628fea3c831abd99bf561d2002ecd6e96361`) |
| Libreria de inferencia | MLX (library_name: mlx), integrado en speech-swift |
| Pipeline declarado | text-classification (también token-classification y named-entity-recognition) |
| Revision del modelo fuente | `7ee5da4c2415e32259bcdc0b1a7367c32ce8d6f6` |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GLiNER2: un encoder transformer DeBERTa-v3-large sobre el que se montan dos cabezas, una de clasificación (devuelve una probabilidad por etiqueta del esquema, en régimen de etiqueta única) y otra de extracción de spans (devuelve fragmentos del texto original con sus offsets). La entrada combina el esquema de etiquetas y el texto en una única secuencia de hasta 512 tokens codificados, de modo que tanto el número de etiquetas como su semántica condicionan el resultado sin reentrenamiento. El tokenizador es de tipo Unigram e incluye tokens específicos del esquema de GLiNER (`tokenizer.json`, 8,3 MB).

Esta publicación concreta es una conversión de pesos, no un entrenamiento nuevo: el autor indica explícitamente que los pesos se han pasado al layout de MLX sin reentrenamiento y que la model card original de Fastino se conserva en el repositorio como `UPSTREAM_README.md`. Por tanto, la composición del dataset, el número de tokens de entrenamiento y el uso de RLHF o DPO corresponden al modelo upstream y no se detallan en la información disponible. La conversión sigue el trabajo gliner2-mlx de Andrew Chen Wang (licencia MIT) y la validación de fidelidad se realizó sobre 24 casos de referencia: etiquetas, spans y offsets idénticos a los del modelo PyTorch original, con una diferencia máxima de confianza de 0,0005 frente a una puerta de tolerancia de 0,001.

## Capacidades

- Clasificación de etiqueta única guiada por esquema: dada una frase y una lista de etiquetas (por ejemplo `create_reminder`, `send_message`, `other`), devuelve una probabilidad para cada etiqueta.
- Extracción de entidades zero-shot: dada una frase y etiquetas de entidad (por ejemplo `person`, `time`), devuelve los spans del texto original con sus offsets en UTF-16.
- Definición dinámica de esquemas: las etiquetas se especifican en tiempo de inferencia, sin necesidad de fine-tuning por dominio.
- Enrutado de intenciones en diálogo: pensado para decidir la acción a ejecutar a partir de una frase de usuario.
- Reconocimiento de entidades nombradas (NER) sobre texto en inglés.
- Ejecución nativa en Apple Silicon mediante MLX, con API en Swift (módulo `GLiNER` de speech-swift) y CLI (`speech gliner classify` / `speech gliner extract`).
- Salida en JSON en la CLI para integración en pipelines.

No dispone de generación de texto: el propio autor lo indica de forma explícita. Tampoco se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento, ya que el modelo es un extractor/clasificador puro.

## Casos de uso

- Enrutado de intenciones en asistentes de voz en macOS: el modelo clasifica frases como "Remind me to call Dad at six PM" contra un conjunto cerrado de acciones, con una latencia medida de 11,1 ms en M5 Pro, lo que permite ejecutar el enrutado en el propio dispositivo antes de invocar cualquier otro componente.
- Extracción de recordatorios y eventos de calendario: a partir de texto libre en inglés se extraen menciones de persona y de tiempo; el código de la aplicación se encarga después de normalizar las fechas, ya que el modelo devuelve las menciones tal cual aparecen en el texto.
- Enriquecimiento de CRM: extracción de nombres de empresa, cargos, importes y fechas de correos o notas de reunión en inglés, con esquemas distintos por tipo de cliente y sin reentrenar el modelo.
- Preprocesado para pipelines de RAG: detección de entidades y clasificación de documentos antes de la indexación, aprovechando que el modelo es determinista y ligero (1,9 GB en disco, 2,55 GB de pico de memoria) frente a un LLM generativo.
- Triaje de tickets de soporte: clasificación de tickets en categorías (facturación, incidencia técnica, cancelación) y extracción simultánea de identificadores de pedido o producto, todo con un único paso de inferencia de 11,1-12,6 ms.
- Análisis de registros y alertas de seguridad: extracción de direcciones IP, nombres de host, identificadores de usuario o marcas temporales de líneas de log en inglés mediante etiquetas definidas ad hoc.
- Extracción de atributos en catálogos de producto: normalización de fichas de producto en inglés (marca, material, talla, color) a partir de descripciones textuales, usando el modo de extracción de spans.
- Aplicaciones de escritorio con privacidad por diseño: al ejecutarse íntegramente en MLX sobre Apple Silicon y no requerir servicios externos, el texto del usuario no sale del equipo, lo que encaja en herramientas de notas, correo o diario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, GLiNER benchmark u otros) en la información disponible. Los únicos datos de rendimiento facilitados son medidas de latencia, memoria y fidelidad frente al modelo original en PyTorch:

| Metrica | Valor |
|---|---|
| Enrutado, mediana por petición (16 casos, 6 etiquetas, Apple M5 Pro) | 11,1 ms |
| Extracción, mediana por petición (8 casos, 2 etiquetas, Apple M5 Pro) | 12,6 ms |
| Pico de memoria de proceso | 2,55 GB |
| Fidelidad al modelo PyTorch upstream (24 casos de referencia) | Etiquetas, spans y offsets idénticos; diferencia máxima de confianza 0,0005 (puerta 0,001) |

Las mediciones se realizaron en un Apple M5 Pro con la máquina en reposo, un proceso por variante, el modelo cargado una sola vez, cinco llamadas cronometradas tras cinco de calentamiento, e incluyen la tokenización. No se proporcionan datos de throughput en lote ni de latencia en otros equipos.

## Requisitos de hardware

- Plataforma soportada: Apple Silicon con MLX. No hay soporte documentado para CUDA, ROCm ni CPU x86 en esta conversión.
- Peso de los pesos: 1.945,8 MB en disco en FP32 (sin cuantización disponible).
- Memoria: pico de proceso medido de 2,55 GB en Apple M5 Pro con el modelo FP32 cargado y en inferencia.
- GPU recomendadas: no se especifican modelos concretos; el único punto de referencia publicado es un Apple M5 Pro. Cualquier chip Apple Silicon con memoria unificada suficiente debería poder cargar los 1,9 GB de pesos, pero no hay mediciones publicadas para M1, M2, M3 o M4.
- Cabe en GPU de consumo: no aplica en el sentido habitual, ya que MLX no se ejecuta sobre GPUs de consumo NVIDIA o AMD. En el ámbito Apple, el modelo es pequeño y cabe holgadamente en configuraciones con 8 GB o más de memoria unificada, aunque no hay cifras publicadas por debajo del M5 Pro.
- Opciones de despliegue: MLX a través del paquete Swift speech-swift (módulo `GLiNER`) y su CLI `speech gliner`, en variante `fp32`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos. El modelo upstream en PyTorch puede desplegarse con otras herramientas, pero eso queda fuera del alcance de esta conversión.
- Latencia: 11,1 ms de mediana para enrutado y 12,6 ms para extracción en M5 Pro, incluyendo tokenización.
- Throughput en lote: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento |
|---|---|---|---|---|---|
| aufklarer/GLiNER2.5-Decide-340M-MLX | 340M | 512 tokens (esquema + texto) | MLX, FP32, safetensors | Apache-2.0 (pesos), MIT (código de conversión) | 11,1 ms enrutado / 12,6 ms extracción en M5 Pro; fidelidad máxima 0,0005 frente al original |
| fastino/GLiNER2.5-Decide | 340M | 512 tokens (según la conversión) | PyTorch (transformers) | Apache-2.0 | No disponible en la información proporcionada |
| Otros extractores zero-shot tipo GLiNER o UniversalNER | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más fiable es con el modelo upstream, del que esta publicación es una conversión sin reentrenamiento y con fidelidad verificada en 24 casos. Para alternativas de otros autores no se dispone de datos verificables en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y declarado únicamente para inglés, por lo que su uso con textos en castellano u otros idiomas no está soportado.
- No genera texto: cualquier caso de uso que requiera generación, resumen o respuesta conversacional queda fuera de su alcance.
- Contexto limitado a 512 tokens codificados que incluyen el esquema de etiquetas, de modo que textos largos o esquemas con muchas etiquetas reducen el espacio disponible para el texto a analizar.
- Las probabilidades son puntuaciones del modelo, no garantías calibradas: el autor advierte explícitamente de ello.
- Las entidades devueltas son menciones, no valores normalizados: fechas y horas se devuelven como texto y es el código de la aplicación quien debe normalizarlas.
- Los offsets están expresados en UTF-16, lo que puede requerir conversión si el consumidor trabaja con otra codificación.
- Riesgo de spans espurios o de etiquetado inconsistente en dominios alejados de los datos de entrenamiento del modelo original, cuyo dataset no se detalla en la información disponible.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial, pero el código de conversión de referencia es MIT y conviene conservar ambas atribuciones; la model card original del upstream se distribuye dentro del repositorio.
- Dependencia de plataforma: al estar en formato MLX, el modelo no es portable a infraestructura NVIDIA o AMD sin volver al checkpoint PyTorch original.
- Sin variantes cuantizadas: solo hay FP32, con 1,9 GB de pesos y 2,55 GB de pico de memoria, lo que limita su uso en dispositivos Apple con poca memoria unificada.
- Ausencia de benchmarks públicos: no hay resultados de MMLU, GLiNER benchmark ni métricas de precisión/recall publicadas para esta conversión, más allá de la prueba de fidelidad frente al modelo original.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción en producción por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/aufklarer/GLiNER2.5-Decide-340M-MLX
- Modelo upstream: https://huggingface.co/fastino/GLiNER2.5-Decide
- Repositorio de conversión gliner2-mlx (Andrew Chen Wang): https://github.com/Andrew-Chen-Wang/gliner2-mlx
- Runtime speech-swift (módulo GLiNER y CLI): https://github.com/soniqo/speech-swift
- Paper de GLiNER2: https://arxiv.org/abs/2507.18546
