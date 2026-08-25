# DreamFoundries/Qwen3-VL-4B-Instruct-3bit

## Resumen

DreamFoundries/Qwen3-VL-4B-Instruct-3bit es una re-subida corregida del modelo mlx-community/Qwen3-VL-4B-Instruct-3bit, una version cuantizada a 3 bits en formato MLX del modelo vision-lenguaje Qwen3-VL-4B-Instruct desarrollado por el equipo Qwen de Alibaba Cloud. La correccion consiste en eliminar un archivo `model.safetensors.index.json` obsoleto que apuntaba a dos shards bf16 inexistentes en el repositorio upstream, lo que provocaba fallos de carga en herramientas como mlx-swift-lm. Los pesos son identicos al original, con un unico archivo `model.safetensors` consolidado de 1219 tensores.

El modelo combina comprension de texto e imagen en un transformer denso, y su cuantizacion a 3 bits reduce el peso en disco a 2,6 GB, lo que lo hace viable en dispositivos Apple Silicon con memoria unificada limitada. Esta licenciado bajo Apache-2.0, lo que permite uso comercial y modificacion sin restricciones. La re-subida resuelve un problema concreto de reproducibilidad que afectaba a cargadores que confiaban ciegamente en el indice de shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso vision-lenguaje) |
| Parametros totales | 918.327.808 (en safetensors, cuantizado a 3 bits) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit (formato MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversion a formato MLX del modelo original Qwen/Qwen3-VL-4B-Instruct, realizada por mlx-community mediante la herramienta mlx-vlm version 0.3.4. La arquitectura base es un transformer denso de vision-lenguaje que procesa texto e imagenes de forma conjunta, con capacidades de razonamiento visual y de interaccion con agentes. La cuantizacion a 3 bits reduce la precision de los pesos para compactar el modelo, manteniendo la estructura de la red. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada.

La unica diferencia tecnica respecto al repositorio upstream es la eliminacion del indice de shards obsoleto. El archivo `model.safetensors` contiene 1219 tensores y es byte-identico al de mlx-community, verificable por digest. La conversion a MLX no introduce cambios en la arquitectura ni en los pesos; solo cambia el formato de almacenamiento.

## Capacidades

- Comprension de imagenes: descripcion de imagenes, respuestas a preguntas visuales y analisis de contenido grafico.
- Razonamiento multimodal: integra informacion textual y visual para tareas de razonamiento complejas.
- Generacion de texto: soporta generacion de texto instructivo y conversacional en formato de chat.
- Comprension de video: el modelo base Qwen3-VL incorpora mejoras para entender secuencias de video y dinamica espacial, segun la descripcion del modelo base.
- Capacidades de agente: el modelo base soporta interaccion con herramientas y razonamiento multi-paso, segun la descripcion oficial.
- Integracion nativa con MLX: ejecutable en Apple Silicon via mlx-vlm, MLXHub y mlx-swift-lm.

## Casos de uso

- Asistente visual en dispositivos Apple: el modelo puede integrarse en apps iOS/iPadOS via MLXHub o mlx-swift-lm para capturar imagenes y responder preguntas sobre ellas sin conexion a internet, gracias a su tamano compacto de 2,6 GB.
- Captioning automatico de imagenes: generar descripciones para accesibilidad, catalogacion de archivos visuales o indexacion de contenido en aplicaciones de gestion documental.
- Analisis de documentos escaneados: extraer informacion de facturas, formularios o capturas de pantalla, integrado en pipelines de automatizacion de oficina.
- Prototipado de sistemas de pregunta-respuesta visual: permite construir demos de consultas sobre imagenes en entornos de investigacion o desarrollo, con un modelo de 4B de capacidades.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para comparar la calidad de la cuantizacion 3-bit frente a versiones bf16 o 8-bit del mismo modelo base.
- Despliegue en entornos Apple Silicon: para sistemas embebidos o edge computing en dispositivos Apple, aprovechando la eficiencia del formato MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el peso del repositorio es de 2,6 GB, por lo que la memoria requerida para inferencia debe ser inferior a 3 GB, adecuada para dispositivos Apple Silicon con 8 GB de RAM unificada o mas.
- GPU recomendada: el formato MLX requiere Apple Silicon (chip M1/M2/M3/M4 en todas sus variantes). No es compatible con GPU NVIDIA, AMD ni con arquitecturas x86.
- Ejecucion en hardware consumer: si, en cualquier Mac o iPhone/iPad con Apple Silicon.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), MLXHub (iOS/iPadOS), mlx-swift-lm para integracion en Swift.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| DreamFoundries/Qwen3-VL-4B-Instruct-3bit | 918M (3-bit) | 3-bit MLX | Apache-2.0 | Safetensors/MLX | No disponible |
| mlx-community/Qwen3-VL-4B-Instruct-3bit | 918M (3-bit) | 3-bit MLX | Apache-2.0 | Safetensors/MLX | No disponible |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | bf16 | Apache-2.0 | Safetensors | No disponible |

La diferencia principal entre este repositorio y el upstream es exclusivamente la correccion del indice de shards; los pesos son identicos. El modelo base ofrece precision bf16 completa, pero requiere mas memoria y no esta optimizado para Apple Silicon.

## Limitaciones y advertencias

- Cuantizacion a 3 bits: la precision reducida puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o con imagenes de alta densidad de informacion.
- Dependencia exclusiva de Apple Silicon: el formato MLX no es ejecutable en hardware de NVIDIA, AMD ni en arquitecturas x86, lo que limita el despliegue a dispositivos Apple.
- Repositorio de re-subida: no es un modelo original; es una correccion de un repositorio existente. Los usuarios deben verificar la integridad de los pesos si se usa en produccion.
- Riesgo de alucinacion visual: los modelos vision-lenguaje pueden generar descripciones inexactas de imagenes o inventar detalles no presentes, lo que debe tenerse en cuenta en aplicaciones criticas.
- Idiomas no documentados: no se han especificado los idiomas soportados, lo que impide evaluar su comportamiento multilingue.
- Sin benchmarks publicados: no hay datos de rendimiento comparativo para validar la calidad de la cuantizacion frente a otras versiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DreamFoundries/Qwen3-VL-4B-Instruct-3bit
- Repositorio upstream (mlx-community): https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-3bit
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- ModelScope (upstream): https://www.modelscope.cn/models/mlx-community/Qwen3-VL-4B-Instruct-3bit
- ModelScope (base): https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct
- Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_vl_4b_instruct
- MLXHub: https://mlxhub.app
