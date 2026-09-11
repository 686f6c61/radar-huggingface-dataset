# Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp

## Resumen
DeepSeek-V4.1-Flash-oQ3e-mtp es una versión cuantizada en precisión mixta del modelo DeepSeek-V4.1-Flash, publicada por el usuario Jundot en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint de pesos comprimidos con la herramienta oQ (omlx) para su uso con la librería MLX de Apple. Incluye el backbone de lenguaje, las tablas Engram, el codificador de visión, el alineador multimodal y los pesos DSpark MTP (multi-token prediction), lo que confirma que el modelo base es multimodal y con decodificación especulativa integrada.

El checkpoint emplea cuantización mixta en lugar de un formato uniforme de 3 bits: pesos de expertos enrutados del backbone en 3 bits afines (grupo 64), proyecciones de atención y expertos compartidos calibrados en 4, 6 y 8 bits, tablas Engram en 3 bits (grupo 32) y pesos DSpark MTP preservados en MXFP4/MXFP8. El resultado declarado es una media efectiva de 3,629 bits por peso excluyendo Engram, o 3,724 bits por peso para el checkpoint completo, con un objetivo de 3,5 bits/peso y un tope duro de 3,7 bits/peso.

El modelo es relevante porque demuestra que un sistema multimodal de gran escala (con cientos de miles de millones de pesos lógicos) puede comprimirse hasta ~3,7 bits/peso manteniendo componentes sensibles en mayor precisión, y porque introduce una estrategia de offload de las tablas Engram a SSD que reduce la residencia de pesos en memoria. El repositorio ocupa 355,3 GB y contiene 65 shards de safetensors con 2.284 tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4.1 (tag `deepseek_v41`); transformer con expertos enrutados y expertos compartidos, mas modulos Engram, codificador de vision, alineador multimodal y DSpark MTP. Configuracion exacta no disponible |
| Parametros totales | 105.579.535.650 segun los metadatos de safetensors de HuggingFace; la model card declara 763,205B de pesos logicos totales. Discrepancia no aclarada por el autor |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin 3 bits grupo 64 (backbone, expertos enrutados); afin 4/6/8 bits grupo 64 (atencion calibrada y expertos compartidos); afin 3 bits grupo 32 (tablas Engram); MXFP4 grupo 32 (DSpark MTP); MXFP8 grupo 32; BF16 y FP32 en tensores restantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (MLX), 65 shards, 2.284 tensores; ~330,896 GiB de payload tensorial; directorio local ~355,304 GB |
| Bits efectivos por peso | 3,629 (excluyendo Engram) / 3,724 (checkpoint completo) |
| Tamano del repositorio | 355,3 GB |
| Libreria | mlx |

## Arquitectura y entrenamiento
La informacion disponible no describe el proceso de entrenamiento del modelo base DeepSeek-V4.1-Flash (numero de tokens, composicion del dataset, uso de RLHF/DPO). El checkpoint aqui documentado es exclusivamente un artefacto de cuantizacion: el autor aplica oQ (omlx) con asignacion de precision por capas basada en sensibilidad medida y calibracion con matriz de importancia.

La estructura del checkpoint revela varios componentes: un backbone de lenguaje con expertos enrutados (551,881B de pesos logicos excluyendo Engram), tablas Engram (196,614B de pesos logicos, descritas como un presupuesto de cuantizacion separado), pesos DSpark MTP (14,225B), y un codificador de vision junto con el alineador y parametros de tokens de imagen (0,485B). La presencia de expertos enrutados y expertos compartidos apunta a una arquitectura MoE, aunque no se detalla el numero de expertos ni el ratio de activacion. Los modulos DSpark MTP y los modulos no calibrados conservan la precision de origen. No se documentan innovaciones de atencion ni tecnicas de decodificacion mas alla del MTP.

## Capacidades
- Generacion de texto y modelado de lenguaje sobre un backbone con expertos enrutados.
- Capacidades multimodales derivadas del codificador de vision y el alineador incluidos en el checkpoint (procesamiento de imagen y tokens de imagen), si bien no se detalla el alcance concreto.
- Razonamiento multi-paso y capacidades de agente: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Decodificacion multi-token (DSpark MTP) integrada como modulo del checkpoint, con pesos preservados en MXFP4.
- Memoria externa o de recuperacion mediante tablas Engram, con posibilidad de residir en SSD y reconstruir filas bajo demanda.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Despliegue multimodal en hardware Apple de gama alta: el checkpoint esta en formato MLX y puede ejecutarse sobre Mac Studio o Mac Pro con memoria unificada muy elevada, aprovechando el offload de Engram a SSD para reducir la residencia de pesos.
- Investigacion en cuantizacion de precisión mixta: sirve como referencia para estudiar la asignacion de bits por capa (3/4/6/8 bits, MXFP4, MXFP8) y su impacto en la fidelidad del modelo base, con un informe de cuantizacion incluido en el repositorio.
- Analisis de inferencia con decodificacion especulativa: los pesos DSpark MTP permiten experimentar con multi-token prediction para aumentar el throughput de generacion frente a la decodificacion autorregresiva clasica.
- Evaluacion de memoria externa mediante Engram: el diseno de tablas Engram con offload a SSD es adecuado para investigar arquitecturas que separan conocimiento estatico de los pesos residentes y reducen la huella de VRAM/RAM.
- Pruebas de reproducibilidad de cuantizacion: al incluir `quantization_report.json` y `model.safetensors.index.json`, el repositorio permite auditar el reparto de bits por tensor y verificar los recuentos de parametros logicos.
- Prototipado offline en estaciones de trabajo con almacenamiento NVMe rapido: el enfoque de leer filas Engram desde ficheros mapeados en memoria hace viable operar sobre un conjunto de pesos que no cabe completamente en memoria, a costa de latencia adicional de E/S.
- Fine-tuning o evaluacion comparativa frente al modelo base sin cuantizar: util para medir la degradacion introducida por el esquema oQ3e en tareas concretas, aunque no se publican resultados de esa comparacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Pesos residentes excluyendo Engram: 239,340 GiB (unos 257 GB decimales).
- Estimacion de planificacion con 5 % de margen y 32 MiB adicionales: aproximadamente 251,339 GiB (unos 270 GB).
- Tablas Engram con offload a SSD: 91,555 GiB, equivalentes al 27,67 % del payload tensorial del checkpoint; no requieren residir permanentemente en memoria.
- Payload tensorial completo sin offload: 330,896 GiB (unos 355 GB).
- No cabe en ninguna GPU de consumo (RTX 4090, 24 GB) ni en la mayoria de configuraciones de estaciones de trabajo; exige memoria unificada muy elevada (Mac Studio/Mac Pro de gama superior) o almacenamiento SSD de alta velocidad para el offload de Engram.
- La model card no aporta mediciones reales de memoria en ejecucion (MLX active memory, peak memory, allocator cache, RSS); solo calculos derivados de los metadatos del checkpoint.
- Opciones de despliegue: runtime MLX (libreria MLX y herramienta omlx/oQ). No se indica compatibilidad con vLLM, TGI, llama.cpp ni Ollama para este formato.
- Latencia y throughput: no disponibles; dependen de la longitud de contexto, la concurrencia, la cache KV, la configuracion MTP y la velocidad de E/S del SSD.

## Comparativa con modelos similares
No hay datos de benchmarks ni de rendimiento que permitan una comparativa cuantitativa. La unica referencia directa es el modelo base sin cuantizar, del que no se dispone de informacion en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-oQ3e-mtp | 105,58B segun safetensors / 763,205B logicos segun model card | no disponible | no disponible | no disponible | HuggingFace, formato MLX |
| DeepSeek-V4.1-Flash (sin cuantizar) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias
- La cuantizacion a 3 bits en el backbone introduce degradacion potencial de calidad; el autor no publica evaluaciones que cuantifiquen esa perdida.
- Existe una discrepancia no aclarada entre los parametros totales reportados por HuggingFace (105.579.535.650) y los pesos logicos declarados en la model card (763,205B). Conviene verificar los metadatos antes de planificar recursos.
- El repositorio no declara licencia, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se declaran idiomas soportados, sesgos conocidos ni riesgos de alucinacion especificos.
- Los requisitos de memoria son extremos: incluso con offload de Engram se superan los 239 GiB residentes, lo que excluye GPU de consumo y la mayoria de servidores convencionales.
- Los datos de memoria en ejecucion no han sido medidos por el autor; las cifras son estimaciones calculadas a partir de metadatos y pueden diferir de la realidad en produccion.
- El offload de Engram a SSD introduce dependencia de la latencia de E/S en NVMe y puede afectar al throughput en cargas concurrentes.
- No se especifica la version del paquete oMLX utilizada para la cuantizacion, lo que dificulta la reproducibilidad exacta del proceso.
- Al ser un formato MLX, no es portable directamente a ecosistemas CUDA (vLLM, TGI) sin conversion previa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp
- Repositorio de la herramienta oQ (omlx): https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos) en la busqueda web realizada.
