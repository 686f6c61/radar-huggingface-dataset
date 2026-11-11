# ScAGI/AGILLM-603B-bin8

## Resumen

AGILLM 603B (bin8) es un conjunto de pesos de inferencia publicado por ScAGI en Hugging Face. No se trata de un modelo en el sentido convencional con pesos en coma flotante, sino de un empaquetado exacto en 1 bit (sign pack) de un modelo de mezcla de expertos (MoE) binario denominado `agillm128b-moe-local-v1`, con 603.471.216.640 pesos binarios, capturado en el paso de entrenamiento 6234. El repositorio ocupa 376,5 GB e incluye los ficheros de pesos (`model_bits.bin` y `table_bits.bin`, 75,84 GB), un checkpoint con el estado en coma flotante (`ckpt.pt`), el programa de entrenamiento e inferencia en un único fichero (`trainer_source.py`) y sumas de verificación SHA-256.

La relevancia de esta publicacion radica en su enfoque: pesos binarios de 1 bit en lugar de cuantizaciones de 4 u 8 bits, lo que reduce drasticamente el coste de almacenamiento y, potencialmente, el de computo en inferencia. El autor lo describe como un backup del run de entrenamiento, con un formato de empaquetado propietario documentado en el README interno del directorio `packs/step000006234/`. No se proporciona informacion sobre arquitectura detallada, datos de entrenamiento, licencia ni idiomas soportados.

La informacion disponible es muy limitada: la model card es escueta y se centra en la estructura del repositorio. No hay pipeline declarado, ni descargas, ni likes, ni resultados de benchmarks. Cualquier evaluacion practica requeriria descargar el pack, inspeccionar el README interno y ejecutar el codigo de inferencia proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE binario (mezcla de expertos, pesos de 1 bit); detalles no disponibles |
| Parametros totales | 603.471.216.640 pesos binarios (603,47 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1 bit (sign pack); no se incluyen latentes int8 nativos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binario propio (`model_bits.bin`, `table_bits.bin`); checkpoint PyTorch (`ckpt.pt`) |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo de mezcla de expertos (MoE) con pesos binarios, identificado internamente como `agillm128b-moe-local-v1`. El nombre sugiere una variante de 128 expertos, aunque no se confirma en la informacion disponible. Los pesos se almacenan como un empaquetado exacto de signo de 1 bit, lo que implica que cada parametro ocupa un bit en lugar de los 16 o 32 bits habituales. El pack corresponde al paso de entrenamiento 6234 y se describe como "inference-exact": reproduce fielmente la inferencia del modelo original, pero no contiene los latentes int8 nativos, por lo que reanudar el entrenamiento desde el supondria un reinicio en caliente (warm restart).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El codigo de entrenamiento e inferencia se distribuye como un unico fichero (`trainer_source.py`), lo que sugiere una implementacion autocontenida y posiblemente experimental.

## Capacidades

- Generacion de texto: no confirmada explicitamente, pero implicita en un modelo de lenguaje.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.
- Otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion extrema: el pack permite estudiar el comportamiento de un MoE de 603B parametros con pesos de 1 bit, comparando su rendimiento con el modelo en coma flotante original. Es adecuado para experimentos academicos sobre compresion y eficiencia.
- Reproduccion de inferencia: al ser "inference-exact", sirve para replicar los resultados del run `agillm128b-moe-local-v1` en el paso 6234 sin necesidad de los pesos originales en precision completa.
- Analisis de formatos binarios: el formato de empaquetado propietario documentado en el README interno puede ser objeto de estudio para disenar esquemas de serializacion eficientes en modelos de gran escala.
- Despliegue en entornos con almacenamiento limitado: los 75,84 GB de pesos binarios son manejables en discos de consumo, aunque la inferencia requiere decodificar los bits a un formato computable, lo que anade complejidad.
- Base para fine-tuning con reinicio en caliente: aunque no es el caso ideal, el checkpoint `ckpt.pt` permite reanudar el entrenamiento desde el paso 6234, util para experimentos de continuacion.
- Auditoria de seguridad y licencias: al no haber licencia declarada, el pack puede servir para estudiar practicas de publicacion de pesos binarios y sus implicaciones legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos binarios ocupan 75,84 GB, pero la inferencia requiere decodificarlos a un formato computable (probablemente int8 o float), lo que incrementaria el uso de memoria. Sin detalles del formato de decodificacion, no se puede estimar con precision.
- GPU recomendadas: no disponible. Por el tamano del modelo (603B parametros binarios), se necesitarian GPUs de centro de datos con alta capacidad de memoria, como A100 80GB, H100 80GB o multiples GPUs en paralelo.
- ¿Cabe en GPU de consumo? No es probable. Incluso con pesos binarios, los 75,84 GB superan la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB). Se requeriria swap a CPU o un esquema de offloading.
- Opciones de despliegue: el autor proporciona `trainer_source.py` como programa de inferencia. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada. La combinacion de MoE de 603B parametros con pesos binarios de 1 bit es poco comun y no se han identificado alternativas directas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso comercial, lo que impide su adopcion en produccion sin aclaracion legal.
- Idiomas no declarados: se desconoce que lenguas soporta y con que calidad.
- Formato propietario: los pesos no estan en safetensors ni GGUF, sino en un formato binario propio que requiere el codigo del autor para su uso.
- Sin benchmarks: no hay evidencia publica de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Riesgo de alucinacion: no evaluado; al ser un modelo de lenguaje, es probable que presente alucinaciones, pero no hay datos.
- Sesgos: no documentados.
- Limitaciones de contexto: se desconoce la longitud de contexto.
- Reinicio en caliente: el pack no contiene los latentes int8 nativos, por lo que reanudar el entrenamiento no es exacto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-09): posible error en los metadatos o publicacion programada; conviene verificar la autenticidad.

## Enlaces

- [Hugging Face: ScAGI/AGILLM-603B-bin8](https://huggingface.co/ScAGI/AGILLM-603B-bin8)
- README interno del pack: `packs/step000006234/README.md` (dentro del repositorio)
- Codigo de entrenamiento e inferencia: `trainer_source.py` (dentro del repositorio)
- Sumas de verificacion: `SHA256SUMS` (dentro del repositorio)
