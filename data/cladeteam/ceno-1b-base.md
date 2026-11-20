# CladeTeam/CENO-1B-base

## Resumen

CENO-1.3B-A450M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H. Con 1.302 millones de parametros totales y 8 expertos con enrutamiento top-2, el modelo esta disenado para generar secuencias de ADN y extraer representaciones (embeddings) utiles en tareas de genomica.

A diferencia de los modelos de lenguaje naturales, CENO opera sobre un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta decision reduce drasticamente el vocabulario y permite tratar la secuencia genomica de forma casi cruda, sin tokenizacion subpalabras. El modelo se distribuye con licencia Apache-2.0 y es cargable de forma autonoma mediante `trust_remote_code=True`, ya que el codigo del modelo va incluido en el repositorio.

La relevancia de este checkpoint radica en que forma parte de una familia mas amplia (CENO-* para base y CENO-P-* para prediccion de efectos de variantes) y sirve como punto de partida para adaptacion posterior mediante fine-tuning o probing en tareas genomicas. Es un modelo orientado a investigadores y desarrolladores que trabajan en biologia computacional, no a aplicaciones de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1,3B) |
| Parametros activos | no disponible (8 expertos, top-2 por token; el numero exacto de parametros activos no se especifica) |
| Longitud de contexto | hasta 131.072 tokens por prefill en la ruta HF (limite documentado) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | no aplica (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: 38 capas ocultas, tamano oculto 1024, 16 cabezas de atencion, tamano intermedio 4096, vocabulario de 512 (byte / caracter), `model_type` = `ceno`, clase `CENOForCausalLM`, tokenizador `CENOCharLevelTokenizer`.

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida que combina capas Mamba (modelo de espacio de estados), capas de atencion y capas de mezcla de expertos (MoE), siguiendo el diseno Nemotron-H de NVIDIA. El modelo tiene 38 capas ocultas con un tamano oculto de 1024 y 16 cabezas de atencion, con un tamano intermedio de 4096. La componente MoE emplea 8 expertos con enrutamiento top-2 por token, lo que introduce capacidad adicional sin activar todos los parametros en cada paso.

El tokenizador es a nivel de caracter: mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de 512 entradas. Este checkpoint corresponde a la etapa 2 de preentrenamiento base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. El modelo se distribuye en bfloat16 y el codigo incluido deriva de la implementacion de Nemotron-H en Hugging Face (Apache-2.0), mientras que el tokenizador deriva del `CharLevelTokenizer` de Evo2 del Arc Institute (Apache-2.0).

Una innovacion practica destacable es la restriccion de inferencia: las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU, aunque la carga de configuracion, tokenizador y pesos es segura en CPU. La ruta de precision en HF es de una sola GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para prefills mayores se indica el entry de vLLM del repositorio.

## Capacidades

- Generacion de secuencias de ADN de forma causal, util para exploracion y generacion de secuencias genomicas.
- Extraccion de embeddings (representaciones) de secuencias genomicas para tareas posteriores de probing y clasificacion.
- Adaptacion posterior mediante fine-tuning para tareas especificas de genomica.
- Modelado a nivel de caracter mediante tokenizador byte/caracter, sin tokenizacion subpalabras.
- Base para la variante de prediccion de efectos de variantes (VEP) de la familia CENO-P-*, que puntua secuencias wild-type frente a variantes mediante delta de log-verosimilitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo de secuencia genomica, no de lenguaje natural).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de embeddings genomicos: el modelo puede generar representaciones densas de secuencias de ADN para alimentar clasificadores o modelos de probing en tareas como prediccion de elementos regulatorios, aprovechando su tokenizador a nivel de caracter y su ventana de hasta 131.072 tokens.
- Generacion de secuencias de ADN: util para exploracion de espacio de secuencias y generacion de candidatos en pipelines de diseno genomico, con la advertencia de que la correccion numerica no garantiza secuencias biologicamente funcionales.
- Fine-tuning para tareas genomicas especificas: al ser un checkpoint base, sirve como punto de partida para adaptar el modelo a tareas como anotacion de regiones, prediccion de estructura o clasificacion de variantes.
- Prediccion de efectos de variantes (VEP): mediante la variante CENO-P-*, se puntua la diferencia de log-verosimilitud entre secuencia wild-type y variante, integrable en pipelines de analisis genetico (ver ejemplo TraitGym VEP en el repositorio de codigo).
- Investigacion en modelos fundacionales de ADN: permite estudiar el comportamiento de arquitecturas hibridas Mamba/MoE sobre secuencias genomicas y comparar con alternativas transformer.
- Procesamiento de contextos genomicos largos: gracias al limite de 131.072 tokens por prefill en la ruta HF (y mayores con vLLM), puede manejar regiones genomicas extensas en una sola pasada.
- Despliegue en pipelines de investigacion con GPU: al requerir CUDA para las capas Mamba, encaja en entornos de laboratorio con GPU dedicada para inferencia y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 1.302 millones de parametros en bfloat16, el peso de los pesos ronda los 2,6 GB (tamano del repo); la VRAM real dependera del contexto, del estado de las capas Mamba y del uso de kernels CUDA.
- GPU recomendadas: no se especifican modelos concretos. El modelo requiere GPU con soporte CUDA para las capas Mamba; la ruta HF probada usa una sola GPU.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el requisito de kernels CUDA y el contexto maximo de 131.072 tokens condicionan el uso en GPU de consumo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF, single-GPU, sin padding, maximo 131.072 tokens por prefill) y entry de vLLM del repositorio para prefills mayores. No se mencionan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1.3B-A450M-base | 1,3B | hasta 131.072 tokens por prefill (HF) | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face + repo GitHub |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible (tokenizador CharLevel reutilizado) | Apache-2.0 (segun atribucion del tokenizador) | no disponible en la informacion |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba/Attention/MoE | Apache-2.0 (segun atribucion del codigo) | no disponible en la informacion |

La informacion proporcionada solo permite establecer que CENO reutiliza el tokenizador de Evo2 y el codigo de Nemotron-H, pero no ofrece datos de parametros, contexto ni rendimiento de esos modelos para una comparacion cuantitativa completa.

## Limitaciones y advertencias

- El modelo es un checkpoint base de preentrenamiento; no esta ajustado para instrucciones ni para tareas concretas sin adaptacion posterior.
- La correccion numerica de la inferencia no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas deben validarse experimentalmente.
- Las capas Mamba requieren kernels CUDA: la generacion y las pasadas forward necesitan GPU, lo que limita el despliegue en entornos solo CPU.
- La ruta HF de precision esta limitada a una sola GPU, sin padding, y a un maximo de 131.072 tokens por prefill; contextos mayores requieren vLLM.
- No se detallan sesgos conocidos, numero de tokens de entrenamiento ni composicion del dataset, por lo que no es posible evaluar sesgos de datos.
- Modelo orientado a secuencia genomica, no a lenguaje natural: no soporta tareas multilingues, tool calling ni agentes.
- Licencia Apache-2.0 permite uso comercial, pero el codigo incluido deriva de Nemotron-H y el tokenizador de Evo2, ambos Apache-2.0; deben respetarse los ficheros LICENSE y NOTICE del repositorio.
- No se han publicado benchmarks en la informacion disponible, lo que impide comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Ejemplo TraitGym VEP: referenciado en el repositorio de codigo CENO (https://github.com/CladeTeam/CENO)
