# Nurymanau/pplx-embed-v2-late-BANKING-Student6-MLX

## Resumen

Este repositorio contiene un checkpoint de tipo estudiante (*student*) derivado de `perplexity-ai/pplx-embed-v2-late-0.6b`, un modelo de embeddings por interacción tardía (*late interaction*, estilo ColBERT con puntuación MaxSim). Lo publica el usuario independiente Nurymanau bajo licencia MIT y está empaquetado exclusivamente para MLX, el framework de Apple para Apple Silicon. El modelo conserva únicamente seis capas de texto del base (índices 0, 1, 6, 7, 10 y 11) y suma 374.135.776 parámetros, con un fichero de pesos de 748.573.681 bytes.

El problema que aborda es concreto: adaptar un modelo de recuperación multilingüe general a un dominio muy estrecho, la detección de intenciones bancarias del dataset BANKING77, reduciendo a la vez el coste de inferencia. El autor reporta una mejora de +4,05 puntos de nDCG@10 sobre el modelo base en su test de recuperación de intenciones y una latencia mediana en caliente de 26,16 ms frente a los 48,04 ms del *teacher* en un Mac M3 con 16 GB, es decir, unas 1,84 veces más rápido.

Es relevante ahora por dos motivos. Primero, porque demuestra una receta de destilación por recorte de capas viable en hardware de consumo, sin acceso a clústeres de GPU. Segundo, porque el propio autor advierte de que se trata de un *checkpoint* de investigación específico de dominio con una regresión grave fuera de dominio: el nDCG@10 en NanoSciFact cae del 85,81 % del *teacher* adaptado al 66,05 % del estudiante. No es un reemplazo genérico del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings por interaccion tardia (*late interaction*, ColBERT con MaxSim); el repositorio etiqueta la familia como `qwen3_5`. Solo texto, sin codificador de vision |
| Parametros totales | 374.135.776 (seis capas de texto: 0, 1, 6, 7, 10 y 11 del modelo base, de ~0,6 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Consulta <= 1.024 tokens; documento <= 4.096 tokens. Las entradas que exceden el limite se rechazan |
| Tipos de cuantizacion | Solo FP16 nativo en MLX; el autor no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Pesos: MIT (declaracion heredada del modelo base). Runtime: Apache-2.0. Datos de entrenamiento BANKING77: CC BY 4.0 |
| Formato de pesos | MLX (un fichero de 748.573.681 bytes); runtime propio, no es un *checkpoint* compatible con `mlx_lm` ni con Sentence Transformers |

## Arquitectura y entrenamiento

El modelo base es un encoder de embeddings que produce representaciones por token y puntua la similitud mediante MaxSim, el esquema clasico de interaccion tardia tipo ColBERT: se almacenan los vectores de cada token y la relevancia se calcula como la suma, sobre los tokens de la consulta, del maximo producto escalar contra los tokens del documento. Esto implica indices mas grandes que los de un modelo de vector unico, pero mejor precision en recuperacion fina. El estudiante conserva seis capas de texto y omite por completo el codificador de vision del base; su fichero de pesos es un 37,1 % mas pequeno y tiene un 24,2 % menos de parametros de texto. Incluye la proyeccion aprendida, por lo que el autor indica explicitamente que no debe anadirse el adaptador P6 por separado. La inferencia no importa ni Torch ni Transformers: es un runtime MLX a medida.

El entrenamiento se hizo sobre BANKING77 para una tarea de recuperacion de ejemplos de intencion, no de clasificacion directa. La particion de entrenamiento uso 1.232 consultas y 154 ejemplares; el conjunto de desarrollo, 308 consultas y 154 documentos, con 77 intenciones. La busqueda de hiperparametros cubrio dos semillas, dos tasas de aprendizaje y tres epocas por rama, con seleccion basada unicamente en desarrollo. Frente al *teacher* adaptado, el ajuste completo de texto mejoro el nDCG@10 en 11,75 puntos porcentuales (intervalo de confianza bootstrap al 95 % sobre las 77 intenciones: [+9,20, +14,53]); el estudiante de seis capas mejoro +4,05 puntos (IC 95 % [+1,53, +6,67]). El autor senala que no existe un control emparejado de solo-cabeza que aisfle la contribucion de las capas internas, por lo que estas cifras miden la receta completa. El coste estimado de alquiler de GPU para entrenamiento, evaluacion y rescate fue de 0,925 USD, sin almacenamiento.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y *semantic search*, con puntuacion MaxSim sobre representaciones por token.
- Recuperacion de ejemplos de intencion en el dominio bancario ingles (BANKING77), su unico dominio validado.
- *Feature extraction*: es la tarea declarada en el pipeline del repositorio.
- Indexacion y busqueda local mediante la CLI incluida (`pplx_mlx.cli`, comandos `index` y `search`).
- Ejecucion nativa en Apple Silicon mediante MLX, sin dependencias de Torch ni de Transformers.
- No dispone de soporte de *tool calling*, ni de agentes, ni de razonamiento multi-paso: no es un modelo generativo.
- No dispone de capacidades de vision: el encoder visual del base fue eliminado en el estudiante.
- No dispone de modo de pensamiento (*thinking*), audio ni multimodalidad.
- Multilingue: no. Solo ingles.

## Casos de uso

- Deteccion de intenciones en atencion al cliente bancaria: el modelo indexa un catalogo de ejemplares por intencion y devuelve la mas cercana a la consulta del usuario. El autor reporta 81,79 % de nDCG@10 y 91,30 % de Recall@10 en su test de recuperacion con 770 consultas, 154 documentos y 77 intenciones.
- Enrutamiento de tickets de soporte: cada ticket entrante se vectoriza y se compara contra una taxonomia interna de categorias, sustituyendo reglas manuales por recuperacion semantica.
- Busqueda semantica con privacidad de datos en portatiles Mac: al ejecutarse con MLX sobre memoria unificada, los documentos no salen del equipo, lo que encaja en entornos con requisitos de soberania del dato.
- Prototipado de arquitecturas de interaccion tardia en hardware de consumo: sirve como banco de pruebas de recorte de capas y destilacion sin necesidad de GPUs dedicadas.
- Deduplicacion y agrupacion de consultas: los embeddings por token permiten medir similitud fina entre formulaciones distintas de la misma pregunta para consolidar FAQs.
- RAG ligero sobre documentacion de producto en ingles: recuperacion de pasajes de hasta 4.096 tokens como primer paso de un pipeline, siempre que el corpus sea del dominio bancario o muy proximo.
- Reproduccion del experimento de destilacion: el repositorio incluye codigo, articulo tecnico y resultados exactos para replicar la comparacion entre base, adaptador, ajuste completo y estudiante.

## Benchmarks y rendimiento

Test de recuperacion de ejemplos de intencion de BANKING77 (770 consultas, 154 documentos, 77 intenciones; MLX FP16 nativo). El autor advierte que no es el benchmark oficial de clasificacion BANKING77 ni una medida de exactitud de respuesta.

| Variante | nDCG@10 | Hit@1 | Recall@10 |
|---|---:|---:|---:|
| Base original | 74,05 % | 70,91 % | 84,87 % |
| Base + adaptador pequeno | 77,74 % | 74,55 % | 87,86 % |
| Ajuste completo de texto | 89,49 % | 87,01 % | 95,26 % |
| Estudiante de seis capas (este modelo) | 81,79 % | 78,83 % | 91,30 % |

Comprobacion cruzada de dominio en NanoSciFact (FP32 sobre CUDA, 40 consultas y 2.919 documentos):

| Variante | nDCG@10 | Hit@1 | Recall@10 |
|---|---:|---:|---:|
| Teacher adaptado | 85,81 % | no disponible | no disponible |
| Ajuste completo | 84,62 % | 75 % (desde 80 %) | 92,5 % |
| Estudiante de seis capas | 66,05 % | no disponible | no disponible |

Latencia medida en ocho entradas fijas de desarrollo sobre un Mac M3 con 16 GB: mediana en caliente de 26,16 ms para el estudiante frente a 48,04 ms del teacher (aproximadamente 1,84 veces). El autor aclara que es un fixture de latencia con dos calentamientos y siete pasadas medidas, no una medida de throughput de aplicacion.

## Requisitos de hardware

- VRAM o memoria unificada: el fichero de pesos ocupa 748.573.681 bytes en FP16; en la practica el modelo completo cabe holgadamente en 2-3 GB de memoria, incluyendo activaciones y el indice.
- Hardware validado: Apple Silicon con MLX 0.32.3 y Python 3.12. Las pruebas de latencia se hicieron en un Mac M3 con 16 GB de memoria unificada.
- GPU dedicadas: no hay soporte declarado para CUDA en este *checkpoint*, ya que es un runtime MLX propio. Las cifras de NanoSciFact del *teacher* y del ajuste completo se obtuvieron en FP32 sobre CUDA, pero no para el estudiante en MLX nativo.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8-16 GB de memoria unificada. El autor recomienda evitar trabajos de modelo en paralelo en Macs con poca memoria.
- Opciones de despliegue: exclusivamente la CLI incluida en el repositorio (`PYTHONPATH=code python -m pplx_mlx.cli`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no funciona como *checkpoint* de Sentence Transformers. Hay que reconstruir el indice al cambiar de modelo.
- Latencia y throughput: mediana en caliente de 26,16 ms por entrada en M3/16 GB; throughput de aplicacion no disponible. Una sola entrada sin padding por llamada.

## Comparativa con modelos similares

Comparativa dentro de la misma familia, con las cifras publicadas por el autor en el mismo test de recuperacion:

| Modelo | Parametros | Vision | nDCG@10 (BANKING) | nDCG@10 (NanoSciFact) | Licencia |
|---|---|---:|---:|---:|---|
| Base original `pplx-embed-v2-late-0.6b` | ~0,6 B | Si | 74,05 % | no disponible | MIT |
| Base + adaptador pequeno | ~0,6 B | Si | 77,74 % | no disponible | MIT |
| Ajuste completo BANKING | ~0,6 B | Si | 89,49 % | 84,62 % | MIT |
| Estudiante de seis capas (este modelo) | 374.135.776 | No | 81,79 % | 66,05 % | MIT |

No se dispone en la informacion proporcionada de cifras comparables frente a otras familias de interaccion tardia como ColBERT, ColBERTv2 o Jina-ColBERT, ni frente a recuperadores de vector unico como BGE-M3 o E5. Por tanto, la comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- *Checkpoint* de investigacion especifico de dominio: el autor lo describe como un modelo BANKING con una regresion sustancial fuera de dominio. El nDCG@10 en NanoSciFact cae del 85,81 % del teacher adaptado al 66,05 % del estudiante.
- No es un reemplazo generico del modelo base. Para un punto de partida general hay que usar el original.
- Solo ingles. No hay soporte multilingue ni se han evaluado otros idiomas.
- Sin soporte de imagen: el codificador de vision fue eliminado.
- No es *drop-in*: no funciona con `mlx_lm`, Sentence Transformers, vLLM, llama.cpp, Ollama ni TGI. Requiere el runtime MLX del propio repositorio y reconstruir el indice al cambiar de modelo.
- Limites de entrada estrictos: consulta <= 1.024 tokens y documento <= 4.096 tokens; las entradas mayores se rechazan. Una sola entrada sin padding por llamada.
- Los resultados publicados miden la receta completa de entrenamiento; no existe un control emparejado de solo-cabeza que aisfle el efecto del recorte de capas.
- Las cifras de 81,79 % nDCG@10 corresponden a un test propio de recuperacion de intenciones, no al benchmark oficial de clasificacion BANKING77.
- Contaminacion del preentrenamiento del modelo base: desconocida, segun el propio autor.
- Trabajo no oficial, sin afiliacion ni respaldo de Perplexity. Conviene revisar la licencia de los pesos (MIT heredada) y la del runtime (Apache-2.0) por separado, ademas de los avisos de terceros en `licenses/`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validacion de la comunidad mas alla del material del autor.
- Aunque la licencia MIT permite uso comercial, el corpus de evaluacion BANKING77 se distribuye bajo CC BY 4.0 y no se redistribuye en el repositorio; su uso en produccion exige revisar esa atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nurymanau/pplx-embed-v2-late-BANKING-Student6-MLX
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Repositorio con todas las variantes: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX
- Base original en MLX FP16: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX-fp16
- Ajuste completo BANKING en MLX: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-BANKING-MLX
- Codigo fuente del runtime: https://github.com/Obscyra-app/pplx-embed-mlx
- Articulo del experimento: https://github.com/Obscyra-app/pplx-embed-mlx/blob/main/docs/experiment.md
- Resultados exactos: P10_README.md (dentro del repositorio del modelo)
- Coleccion Apple Silicon MLX: https://huggingface.co/collections/Nurymanau/apple-silicon-mlx-ports-and-experiments-6ac9709d0628f31e0993a8f7
- Paper de BANKING77: https://arxiv.org/abs/2003.04807
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
