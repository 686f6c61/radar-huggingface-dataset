# CladeTeam/CENO-600M-base

## Resumen

CENO-600M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts inspirada en la arquitectura Nemotron-H de NVIDIA. Con 630,8 millones de parametros (de los cuales aproximadamente 230 millones estan activos por token, segun la nomenclatura A230M del nombre), el modelo procesa directamente bases de ADN sin necesidad de alineamiento multiple de secuencias (MSA) como entrada.

El modelo resuelve el problema de modelar secuencias genomicas a nivel de caracter mediante un tokenizador byte/character-level con vocabulario de 512 entradas, que mapea las bases de ADN a sus codigos ASCII. Esto permite generar secuencias de ADN y extraer embeddings utiles para tareas genomitas downstream como la prediccion del efecto de variantes (VEP), la anotacion funcional o el ajuste fino supervisado.

Es relevante ahora porque representa una de las pocas implementaciones abiertas de un modelo fundacional de ADN con backbone hibrido Mamba-MoE, publicado bajo licencia Apache-2.0 y cargable de forma autonoma con `trust_remote_code=True`. La familia CENO distingue checkpoints base (generacion y embeddings) de checkpoints MSA (puntuacion de variantes), y este checkpoint corresponde al primer grupo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | Aproximadamente 230M (top-2 de 8 expertos) |
| Longitud de contexto | Hasta 131.072 tokens por prefill en la ruta HF; vLLM para prefills mayores |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | No disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |

Detalles adicionales de arquitectura: 20 capas ocultas, tamano oculto 1024, 16 cabezas de atencion, tamano intermedio 4096, 8 expertos MoE con top-2 por token, vocabulario de 512 (byte/character-level). `model_type` es `ceno`, clase `CENOForCausalLM`.

## Arquitectura y entrenamiento

La columna vertebral combina capas Mamba (modelos de espacio de estados), capas de atencion y capas de mezcla de expertos (MoE), siguiendo el diseno Nemotron-H. El modelo tiene 20 capas ocultas con tamano oculto 1024, 16 cabezas de atencion y tamano intermedio 4096, con 8 expertos y enrutamiento top-2 por token. El tokenizador es character-level, derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), y mapea bases de ADN a codigos ASCII con un vocabulario de 512 entradas. No requiere entradas MSA.

El checkpoint corresponde a la etapa 2 de preentrenamiento base. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. Como innovacion tecnica destacable, las capas Mamba requieren kernels CUDA, de modo que las pasadas forward y la generacion necesitan GPU, mientras que la carga de pesos, configuracion y tokenizador son seguras en CPU. El codigo del modelo esta incluido en el repositorio y deriva de la implementacion Nemotron-H de NVIDIA (Apache-2.0).

## Capacidades

- Generacion de secuencias de ADN a nivel de caracter.
- Extraccion de embeddings de secuencia genomica para tareas downstream.
- Ajuste fino y probing para tareas genomitas (anotacion, clasificacion, etc.).
- Puntuacion de verosimilitud para comparacion wild-type vs. variante (delta log-likelihood) en la variante MSA de la familia.
- Modelado causal de secuencias largas gracias a la ventana de hasta 131.072 tokens por prefill en la ruta HF.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No es un modelo multilingue de lenguaje natural; opera sobre alfabeto de ADN.

## Casos de uso

- Prediccion del efecto de variantes (VEP): puntuar la verosimilitud de secuencias wild-type frente a variantes mediante delta log-likelihood, usando el pipeline VEP del repositorio CENO. Adecuado por su modelado causal a nivel de base.
- Anotacion funcional de regiones genomicas: extraer embeddings por ventana y entrenar clasificadores ligeros para identificar elementos regulatorios, promotores o exones.
- Generacion de secuencias sinteticas de ADN: producir secuencias plausibles biologicamente bajo la distribucion aprendida, para augmentacion de datos o exploracion de disenos.
- Ajuste fino supervisado para tareas especificas: adaptar el checkpoint base a clasificacion de patogenicidad, deteccion de motivos o prediccion de estructura secundaria.
- Analisis de regiones largas: procesar ventanas de hasta 131.072 tokens por prefill en una sola GPU, util para loci genomicos extensos o regiones con contexto largo.
- Embeddings para busqueda de similitud genomica: generar representaciones de secuencias para recuperacion o agrupamiento de fragmentos con funcion similar.
- Investigacion en modelos fundacionales de ADN: servir como base reproducible (Apache-2.0) para estudiar arquitecturas hibridas Mamba-MoE en genomicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 1,3 GB de pesos, por lo que la inferencia requiere del orden de 2-4 GB de VRAM segun el tamano de lote y la longitud de secuencia (estimacion a partir del tamano del repo; no confirmada por el autor).
- Las capas Mamba requieren kernels CUDA: la generacion y las pasadas forward necesitan GPU; la carga de pesos, configuracion y tokenizador funciona en CPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y kernels mamba-ssm/causal-conv1d; el modelo es pequeno y cabe en GPUs consumer modernas, aunque no se especifican modelos concretos.
- Opciones de despliegue: ruta Hugging Face con `transformers` y `trust_remote_code=True`; existe una entrada vLLM en el repositorio CENO para prefills mayores de 131.072 tokens. La ruta HF es single-GPU y sin padding.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-base | 630,8M (aprox. 230M activos) | Hasta 131.072 tokens por prefill (HF) | Mamba / Attention / MoE (Nemotron-H) | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible | No disponible (tokenizador char-level del que deriva CENO) | No disponible | No disponible |
| Nemotron-H (NVIDIA) | No disponible en la informacion | No disponible | Mamba / Attention / MoE (arquitectura de referencia) | Apache-2.0 (implementacion HF) | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base: no esta alineado para instrucciones ni conversacion; genera continuaciones de secuencia, no respuestas.
- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional (advertencia explicita del autor).
- Las capas Mamba exigen GPU con kernels CUDA; no es desplegable en CPU para inferencia completa.
- La ruta HF de precision es single-GPU, sin padding y limitada a 131.072 tokens por prefill; prefills mayores requieren la entrada vLLM.
- No hay informacion sobre sesgos, composicion del dataset ni riesgo de alucinacion en el dominio genomico.
- No hay datos sobre idiomas de lenguaje natural; el modelo opera sobre alfabeto de ADN.
- Licencia Apache-2.0 permite uso comercial, pero el codigo derivado de Nemotron-H (NVIDIA) y del tokenizador de Evo2 (Arc Institute) exige respetar los ficheros LICENSE y NOTICE del repositorio.
- Los checkpoints MSA (`CENO-P-*`) son los indicados para VEP; este checkpoint base no sustituye esa variante en flujos de puntuacion de variantes.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion Nemotron-H de NVIDIA (referencia del codigo): no disponible enlace concreto en la informacion
- Tokenizador Evo2 `CharLevelTokenizer` (Arc Institute, referencia): no disponible enlace concreto en la informacion
