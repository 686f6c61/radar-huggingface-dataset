# rao-studios/granite-4.0-h-micro-mlx-4bit

## Resumen

Granite-4.0-H-Micro es un modelo de lenguaje de 3.191.396.096 parametros (aproximadamente 3B) desarrollado por IBM, publicado bajo licencia Apache-2.0. La version aqui descrita es un espejo (mirror) creado por rao-studios a partir de `mlx-community/granite-4.0-h-micro-4bit`, que a su vez es la conversion a formato MLX con cuantizacion de 4 bits del modelo original `ibm-granite/granite-4.0-h-micro`. Los pesos son identicos byte a byte al repositorio de origen; rao-studios solo anade la model card y el texto de la licencia.

El modelo emplea la arquitectura `granitemoehybrid` de IBM, que combina capas Mamba-2 con capas transformer y un esquema de mezcla de expertos (MoE). Segun IBM, esta arquitectura reduce el uso de memoria en un 70% y ofrece una inferencia 2x mas rapida en comparacion con arquitecturas transformer convencionales. Dispone de una ventana de contexto de 131.072 tokens, lo que lo hace adecuado para tareas de extraccion y procesamiento de documentos largos.

Este espejo concreto esta pensado para su uso en aplicaciones macOS mediante MLX: el autor lo utiliza para la extraccion de entidades y relaciones en grafos de conocimiento a partir de documentos, asi como modelo general pequeno dentro de su stack. Su relevancia radica en ofrecer un modelo de 3B con contexto muy largo, licencia permisiva y un formato optimizado para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `granitemoehybrid` (hibrida Mamba-2/transformer con MoE), 40 capas |
| Parametros totales | 3.191.396.096 (aproximadamente 3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4-bit, tamano de grupo 64 (este repositorio); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1.8 GB, 924 tensores), formato MLX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `granitemoehybrid` de IBM, que combina capas de espacio de estados Mamba-2 con capas de atencion transformer y un esquema de mezcla de expertos. Consta de 40 capas. Segun la documentacion de IBM, esta combinacion reduce el consumo de memoria en un 70% y duplica la velocidad de inferencia respecto a un transformer clasico de tamano comparable. Los pesos de este repositorio estan cuantizados a 4 bits con tamano de grupo 64, lo que reduce el peso total a 1.8 GB en safetensors.

El modelo original es un modelo instructivo afinado a partir de Granite-4.0-H-Micro-Base. Segun la model card de IBM, el afinado combina conjuntos de datos de instrucciones de codigo abierto con licencia permisiva junto con datos sinteticos recopilados internamente, e incluye ajuste supervisado (SFT) y alineacion del modelo. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset. El repositorio aqui descrito no ha sido re-cuantizado ni editado: es una copia exacta del commit `0a29e17503da7de371af61a0a532853810637627` de `mlx-community/granite-4.0-h-micro-4bit`.

## Capacidades

- Generacion de texto y conversacion multi-turno con formato de chat estructurado (incluye `chat_template.jinja`).
- Razonamiento y respuesta a instrucciones en modo instructivo.
- Extraccion estructurada de informacion: el autor lo emplea para obtener entidades y relaciones en formato JSON a temperatura 0 a partir de fragmentos de hasta 3.000 caracteres.
- Procesamiento de contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Extraccion de grafos de conocimiento: el modelo puede analizar el texto de un documento archivado y devolver, en JSON y a temperatura 0, las entidades y relaciones que contiene. Su contexto de 131.072 tokens permite procesar documentos largos en una sola pasada.
- Clasificacion y extraccion de objetivos por tipo de fichero: tal como lo usa el autor, puede recibir cada tipo declarado en un fichero fuente y devolver el objetivo final que sirve, en formato JSON estructurado.
- Procesamiento de documentos en local sobre Apple Silicon: al estar en formato MLX con cuantizacion de 4 bits (1.8 GB), se puede ejecutar en un Mac sin GPU dedicada, lo que facilita pipelines de extraccion privados y sin conexion.
- Asistente conversacional de proposito general: como modelo general pequeno del stack del autor (`AIIModels.generalSmall`), sirve para tareas de chat y generacion de texto en aplicaciones de escritorio.
- Resumen y analisis de documentos largos: la ventana de 131.072 tokens permite resumir contratos, informes o articulos extensos sin truncar el contenido.
- Prototipado rapido de pipelines de NLP: su tamano reducido y licencia Apache-2.0 permiten integrarlo en pruebas de concepto y entornos de desarrollo sin coste de licencia.
- Generacion de JSON estructurado en produccion: la plantilla de chat incluida y la posibilidad de fijar temperatura 0 lo hacen util para tareas de extraccion determinista en sistemas automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.8 GB de pesos en cuantizacion 4-bit, mas overhead de activaciones y cache KV; el consumo real depende de la longitud de contexto utilizada.
- GPU recomendadas: al ser un formato MLX, esta optimizado para Apple Silicon (series M1, M2, M3, M4). Para el modelo original en otros formatos, se requieren GPUs compatibles con el runtime correspondiente.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; el peso de 1.8 GB es muy reducido.
- Opciones de despliegue: `mlx-lm` (libreria nativa de este repositorio); para el modelo original de IBM, los runtimes habituales compatibles con safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. IBM afirma que la arquitectura ofrece una inferencia 2x mas rapida que un transformer convencional comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.0-H-Micro (este espejo, MLX 4-bit) | 3,19B | 131.072 | Apache-2.0 | safetensors MLX | Hibrido Mamba-2/transformer con MoE; optimizado para Apple Silicon |
| ibm-granite/granite-4.0-h-micro | 3,19B | 131.072 | Apache-2.0 | safetensors | Modelo original de IBM; mismas capacidades, sin cuantizar |
| mlx-community/granite-4.0-h-micro-4bit | 3,19B | 131.072 | Apache-2.0 | safetensors MLX | Conversion MLX 4-bit de la que deriva este espejo |
| Otros modelos de 3B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no se ha re-cuantizado ni modificado; cualquier limitacion del modelo original de IBM se aplica igualmente.
- Sesgos conocidos: no disponibles en la informacion proporcionada; como modelo afinado con datos sinteticos e instrucciones de codigo abierto, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de extraccion sin validacion posterior.
- Limitaciones de contexto o idioma: el contexto maximo es de 131.072 tokens; los idiomas soportados no estan documentados en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion; el autor indica que el modelo original no incluye fichero LICENSE y que el texto de la licencia se ha anadido en este repositorio.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo de uso interno del autor, por lo que conviene verificar la integridad de los pesos (el autor publica los SHA-256 de cada fichero) antes de desplegarlo.
- Dependencia de MLX: este formato esta pensado para Apple Silicon; no es directamente utilizable en GPUs NVIDIA o entornos CUDA sin conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/granite-4.0-h-micro-mlx-4bit
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Conversion MLX de origen: https://huggingface.co/mlx-community/granite-4.0-h-micro-4bit
- Documentacion de Granite 4.0 de IBM: https://www.ibm.com/granite/docs/models/granite4-0
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
