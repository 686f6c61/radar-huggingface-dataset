# dicksondickson/Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX

## Resumen

Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX es una cuantizacion en formato MLX del modelo Xiaomi-OCR-0, un modelo de vision-lenguaje (VLM) orientado al analisis y extraccion de contenido en documentos. El modelo base lo desarrolla Xiaomi Research y esta pensado para tareas de document parsing y OCR: convertir imagenes de documentos en texto estructurado. Esta version concreta la publica el usuario dicksondickson y esta optimizada para ejecutarse en hardware Apple Silicon mediante la libreria MLX.

La arquitectura declarada en los metadatos es qwen3_5, es decir, una variante de la familia Qwen 3.5 adaptada a entrada visual, con aproximadamente 873 millones de parametros totales en los pesos safetensors. El repositorio ocupa 1,0 GB y los tensores criticos se mantienen en bf16 mientras el resto se cuantiza en 8 bits con precision mixta (esquema oQe de oMLX), lo que la hace viable en equipos con memoria unificada moderada.

Su relevancia actual radica en que permite ejecutar localmente en un Mac un modelo de OCR y comprension de documentos sin depender de servicios en la nube, con licencia MIT y un pipeline de cuantizacion reproducible mediante oMLX. Es una opcion practica para prototipos de extraccion documental en entornos de desarrollo sobre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (vision-lenguaje, transformer) segun tags del repositorio |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits con precision mixta oQe (imatrix); tensores importantes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Xiaomi-OCR-0 es un VLM de la familia qwen3_5, segun los tags del repositorio, lo que implica un transformer con codificador visual y decodificador de lenguaje. Esta version cuantizada conserva los tensores considerados criticos en bf16 y aplica cuantizacion de 8 bits al resto mediante el esquema oQe de oMLX 0.7.3.dev2, que emplea una matriz de importancia (imatrix) para decidir la precision por capa. El resultado esta optimizado para chips Apple M3 y posteriores.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Document parsing: extraccion de texto y posible estructura a partir de imagenes.
- Procesamiento de entrada visual combinada con generacion de texto (VLM).
- Ejecucion local en Apple Silicon mediante MLX y oMLX.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede procesar imagenes de documentos financieros y extraer el texto para su volcado a sistemas contables, ejecutandose localmente en un Mac sin enviar datos sensibles a la nube.
- Extraccion de texto de contratos y formularios: util para pipelines internos donde la confidencialidad impide usar APIs externas, aprovechando la licencia MIT y el despliegue local.
- Prototipado rapido de OCR en equipos de desarrollo con Apple Silicon: al ocupar 1,0 GB y requerir solo MLX/oMLX, permite iterar en un portatil M3 sin GPU dedicada.
- Preprocesado de documentos para RAG: convertir PDFs escaneados o imagenes en texto que alimente un indice vectorial, con el modelo corriendo en el mismo equipo que el resto del pipeline.
- Herramientas de accesibilidad: lectura automatizada de documentos impresos para convertirlos en texto legible por sintetizadores de voz.
- Automatizacion de archivo documental: clasificacion y transcripcion por lotes de escaneos en entornos de pequena escala donde no se justifica infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 1,0 GB; en inferencia se recomienda al menos 2-4 GB de memoria unificada libre, aunque la cifra exacta no esta documentada.
- GPU recomendadas: Apple Silicon M3 o posterior (requisito explicito del autor por el uso de bf16 en tensores criticos).
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada; no esta pensado para GPU NVIDIA en este formato.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx), libreria MLX de Apple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX | 873 M | no disponible | MIT | safetensors (MLX) | Cuantizacion 8-bit para Apple Silicon |
| xiaomi-research/Xiaomi-OCR-0 | no disponible | no disponible | no disponible | no disponible | Modelo base original |
| SeerRay-Lab/Xiaomi-OCR-0 | no disponible | no disponible | no disponible | no disponible | Repo referenciado como origen de la cuantizacion |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de OCR o VLMs de tamano similar.

## Limitaciones y advertencias

- Modelo especializado en OCR y documentos; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion en la transcripcion de texto poco legible o imagenes de baja calidad, comun en modelos OCR generativos.
- Sesgos: no documentados en la informacion disponible.
- Idiomas soportados no especificados; puede no cubrir todos los idiomas de interes.
- Requiere Apple M3 o posterior por el uso de bf16 en tensores criticos; no es portable directamente a otras plataformas sin reconversion.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base original antes de desplegar en produccion.
- Es una cuantizacion de terceros: puede introducir degradacion respecto al modelo base, no cuantificada en la model card.
- Longitud de contexto desconocida: limita la planificacion para documentos muy extensos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dicksondickson/Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Repo de origen de la cuantizacion: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
