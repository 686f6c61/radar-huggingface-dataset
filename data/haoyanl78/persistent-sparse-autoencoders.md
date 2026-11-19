# haoyanl78/persistent-sparse-autoencoders

## Resumen

Persistent Sparse Autoencoders (PSAE) es un repositorio de checkpoints entrenados que acompanan al paper *Persistent Sparse Autoencoders: Learning Feature-Specific Timescales in Language Model Representations*, de Haoyan Luo, Mateo Espinosa Zarlenga y Mateja Jamnik. No se trata de un modelo de lenguaje generativo, sino de una coleccion de autoencoders dispersos (sparse autoencoders, SAE) disenados para interpretabilidad mecanistica: extraen caracteristicas interpretables de las representaciones internas de modelos de lenguaje ya entrenados.

El repositorio incluye diez checkpoints que cubren las representaciones internas de varios modelos de la familia Pythia de EleutherAI (desde 160M hasta 12B parametros) y de dos modelos de Google (Gemma 2 de 2B y 9B), ademas de Llama 3.1 de 8B. Cada checkpoint corresponde a una capa concreta del modelo base y a una dimension de representacion (d_model) especifica, lo que permite analizar como se organizan las caracteristicas en distintas profundidades y escalas.

La propuesta tecnica del paper, segun el titulo, es el aprendizaje de "escalas temporales especificas por caracteristica" (feature-specific timescales), un enfoque que busca modelar la persistencia o dinamica temporal de cada caracteristica latente. Es relevante para investigadores que trabajan en interpretabilidad de modelos y quieran reproducir o extender los experimentos del paper sobre modelos open source de distintos tamanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) sobre representaciones internas de transformers; detalles especificos de la arquitectura PSAE no disponibles |
| Parametros totales | No disponible (depende de d_model y del factor de expansion, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo; opera sobre activaciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los modelos base subyacentes son multilingues en distinto grado) |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch (checkpoints; no se especifica safetensors ni GGUF) |

Modelos base y capas cubiertas:

| Checkpoint | Modelo base | Capa | d_model | Pasos de entrenamiento |
|---|---|---|---|---|
| `pythia-160m-deduped/layer_6` | EleutherAI/pythia-160m-deduped | 6 | 768 | 244.140 |
| `pythia-410m-deduped/layer_12` | EleutherAI/pythia-410m-deduped | 12 | 1024 | 244.140 |
| `pythia-1b-deduped/layer_8` | EleutherAI/pythia-1b-deduped | 8 | 2048 | 244.140 |
| `pythia-1.4b-deduped/layer_12` | EleutherAI/pythia-1.4b-deduped | 12 | 2048 | 244.140 |
| `gemma-2-2b/layer_12` | google/gemma-2-2b | 12 | 2304 | 244.140 |
| `pythia-2.8b-deduped/layer_16` | EleutherAI/pythia-2.8b-deduped | 16 | 2560 | 367.648 |
| `pythia-6.9b-deduped/layer_16` | EleutherAI/pythia-6.9b-deduped | 16 | 4096 | 367.648 |
| `llama-3.1-8b/layer_19` | meta-llama/Llama-3.1-8B | 19 | 4096 | 367.648 |
| `gemma-2-9b/layer_20` | google/gemma-2-9b | 20 | 3584 | 367.648 |
| `pythia-12b-deduped/layer_18` | EleutherAI/pythia-12b-deduped | 18 | 5120 | 367.648 |

## Arquitectura y entrenamiento

Cada checkpoint es un sparse autoencoder entrenado para reconstruir las activaciones de una capa intermedia concreta de un modelo de lenguaje, imponiendo una penalizacion de dispersidad para que las unidades latentes captures caracteristicas monosenanticas e interpretables. El repositorio no detalla el factor de expansion, la funcion de perdida exacta, la composicion del dataset de activaciones ni el metodo de entrenamiento mas alla del numero de pasos (244.140 para modelos de hasta 2B y 367.648 para modelos de 2,8B en adelante).

La innovacion que da nombre al trabajo es el aprendizaje de escalas temporales especificas por caracteristica. El titulo del paper sugiere que el SAE modela, para cada caracteristica latente, una dinamica o persistencia propia sobre secuencias de activaciones, en lugar de tratar cada activacion de forma independiente. Los detalles formales de esa formulacion (mecanismo de persistencia, funcion objetivo, datos de entrenamiento) no estan disponibles en la informacion proporcionada y deben consultarse en el paper (arXiv:2607.17117).

## Capacidades

- Extraccion de caracteristicas interpretables de las activaciones internas de modelos Pythia, Gemma 2 y Llama 3.1 en capas y dimensiones concretas.
- Analisis de representaciones a multiples escalas: desde 768 dimensiones (Pythia-160M) hasta 5120 dimensiones (Pythia-12B).
- Estudio de dinamica temporal de caracteristicas mediante el mecanismo de persistencia propuesto en el paper.
- Reconstruccion de activaciones y evaluacion de dispersidad en el espacio latente.
- No es un modelo generativo: no realiza generacion de texto, razonamiento, codigo ni tool calling por si mismo.
- No soporta agentes ni razonamiento multi-paso de forma nativa; su uso es analitico sobre otros modelos.
- Capacidades multilingues: no disponibles como tales; dependen del modelo base cuyas activaciones se analizan.

## Casos de uso

- Interpretabilidad mecanistica de modelos Pythia: extraer y clasificar caracteristicas latentes de capas intermedias para entender que representaciones codifica el modelo durante el preentrenamiento, aprovechando que Pythia ofrece checkpoints alineados con el mismo corpus de entrenamiento.
- Analisis comparativo entre escalas: usar los checkpoints de 160M a 12B para estudiar como emergen y se especializan las caracteristicas con el tamano del modelo, manteniendo la misma familia y metodologia.
- Auditoria de modelos comerciales abiertos: aplicar los SAE sobre Llama 3.1 8B o Gemma 2 2B/9B para inspeccionar representaciones de seguridad, sesgo o conocimiento factual en capas concretas.
- Investigacion en interpretabilidad temporal: reproducir los experimentos del paper sobre escalas temporales por caracteristica y extenderlos a otros modelos o capas.
- Deteccion de caracteristicas anomalas o comportamientos no deseados: monitorizar activaciones de una capa durante inferencia con el SAE entrenado para esa capa y detectar activaciones fuera de distribucion.
- Docencia y formacion en interpretabilidad: usar modelos pequenos como Pythia-160M con su SAE de capa 6 para demostrar el flujo completo de extraccion y analisis de caracteristicas en un entorno asequible.
- Base para tecnicas de steering o edicion de modelos: identificar direcciones latentes interpretables que puedan utilizarse posteriormente para modificar el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 3,6 GB en total, pero los requisitos reales dependen del checkpoint concreto y del modelo base cuyas activaciones se procesan.
- Para los checkpoints de modelos pequenos (Pythia-160M, 410M, 1B) y sus SAE, es viable en GPU consumer con 8-12 GB de VRAM.
- Para extraer activaciones de modelos grandes (Pythia-6.9B, Pythia-12B, Llama 3.1 8B, Gemma 2 9B) se necesita cargar el modelo base, lo que requiere del orden de 16-24 GB de VRAM en FP16 para los de 8-9B y bastante mas para Pythia-12B, o bien usar cuantizacion del modelo base.
- GPUs recomendadas: RTX 3090/4090 para modelos hasta 8-9B en FP16; A100 40/80 GB o H100 para Pythia-12B y para procesar lotes grandes de activaciones.
- Despliegue: no es un modelo servible con vLLM, Ollama o TGI; se usa como codigo PyTorch, cargando los pesos del SAE junto con el modelo base para extraer activaciones.
- Latencia y throughput: no disponibles. Dependen fundamentalmente del coste de la pasada forward del modelo base, no del SAE.

## Comparativa con modelos similares

| Aspecto | Persistent SAE (este repo) | SAE estandar (p. ej. sobre Pythia) | SAE sobre Llama/Gemma publicos |
|---|---|---|---|
| Tipo | Sparse autoencoder con escalas temporales por caracteristica | Sparse autoencoder estandar | Sparse autoencoder estandar |
| Modelos cubiertos | Pythia 160M-12B, Gemma 2 2B/9B, Llama 3.1 8B | Habitualmente Pythia o GPT-2 | Llama 3.x, Gemma 2 |
| Contexto temporal | Modelado de persistencia por caracteristica (segun titulo) | No modelado | No modelado |
| Licencia | MIT | Variable (MIT/Apache en la mayoria) | Variable |
| Disponibilidad | Repositorio Hugging Face con 10 checkpoints | Multiples repositorios comunitarios | Multiples repositorios comunitarios |

Los datos concretos de comparacion de rendimiento entre estos enfoques no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; cualquier evaluacion debe hacerse como herramienta de analisis.
- No se especifican la funcion de perdida, el factor de expansion, el dataset de activaciones ni los hiperparametros del SAE, lo que dificulta la reproducibilidad exacta sin consultar el paper.
- El repositorio no incluye informacion sobre sesgos de las caracteristicas aprendidas; los sesgos del modelo base pueden reflejarse en las representaciones extraidas.
- Riesgo de interpretaciones erroneas: las caracteristicas latentes de un SAE no son necesariamente monosenanticas ni causalmente relevantes; cualquier conclusion requiere validacion adicional.
- Licencia MIT permite uso comercial del codigo y los pesos, pero el uso de los modelos base subyacentes (Llama 3.1, Gemma 2) esta sujeto a sus propias licencias, mas restrictivas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria conocida.
- Los enlaces y fechas del paper (arXiv:2607.17117) deben verificarse; la informacion proporcionada no permite confirmar todos los detalles del metodo.
- No hay garantias de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haoyanl78/persistent-sparse-autoencoders
- Paper: https://arxiv.org/abs/2607.17117
- Modelo base Pythia: https://huggingface.co/EleutherAI/pythia-160m-deduped (y variantes 410m, 1b, 1.4b, 2.8b, 6.9b, 12b)
- Modelo base Gemma 2: https://huggingface.co/google/gemma-2-2b y https://huggingface.co/google/gemma-2-9b
- Modelo base Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B
