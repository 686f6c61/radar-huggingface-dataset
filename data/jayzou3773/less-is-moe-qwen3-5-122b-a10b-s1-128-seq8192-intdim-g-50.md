# jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-g-50

## Resumen

Este checkpoint es una version podada estructuralmente de Qwen/Qwen3.5-122B-A10B, un transformer de tipo mixture-of-experts (MoE), publicada por el usuario jayzou3773 bajo licencia Apache 2.0. La poda se ha realizado con el metodo Less-is-MoE basado en la media absoluta del gradiente (mean-absolute-gradient), que elimina exactamente el 50% de las neuronas de las FFN de los expertos enrutados. El resultado son 64.129.468.416 parametros reales medidos en safetensors, sobre un repositorio de 128,3 GB, frente a los 122B nominales del checkpoint base.

El objetivo es recortar el coste de memoria y de computo del modelo original conservando la topologia MoE enrutada. La variante IntDim-G mantiene dicha topologia y almacena anchuras compactas por experto en `config.json`, a diferencia de IntDim-E, que usa una anchura uniforme. La calibracion empleo 128 muestras de `yentinglin/s1K-1.1-trl-format` con `seq_length=8192`, truncado por prefijo, sin padding, en BF16 y sin paso de optimizador.

Su relevancia practica esta condicionada por un requisito de despliegue poco habitual: la inferencia exige el plugin ragged de vLLM de Less-is-MoE, incluido en la imagen GPU unificada del proyecto. No funciona con un servidor vLLM estandar. Se trata, por tanto, de un artefacto de investigacion reproducible, con hashes publicados de seleccion de filas y de tensores de tokens para verificar la equivalencia con la mascara cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados (tag de arquitectura `qwen3_5_moe_text`); topologia enrutada conservada con anchuras compactas por experto (variante IntDim-G) |
| Parametros totales | 64.129.468.416 (dato real medido en safetensors); el checkpoint base declara 122B |
| Parametros activos | no disponible (el modelo base es A10B, 10B activos; no se publica la cifra exacta tras podar el 50% de neuronas FFN de expertos enrutados) |
| Longitud de contexto | no disponible (la calibracion uso `seq_length=8192` con truncado por prefijo) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors BF16, sin variantes GGUF, AWQ o GPTQ documentadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | [Qwen/Qwen3.5-122B-A10B](https://huggingface.co/Qwen/Qwen3.5-122B-A10B) |
| Metodo de poda | Less-is-MoE, media absoluta del gradiente; 50% de las neuronas FFN de expertos enrutados |
| Dataset de calibracion | jayzou3773/less-is-moe-s1-calibration-128-seq8192 (revision `678b4e666183e16ec00376960df03b6381632ed1`) |
| Requisito de inferencia | plugin ragged de vLLM de Less-is-MoE (imagen GPU unificada del proyecto); no compatible con vLLM estandar |
| Tamano del repositorio | 128,3 GB |
| Fecha de publicacion | 18 de septiembre de 2026 (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base Qwen/Qwen3.5-122B-A10B: un transformer autoregresivo de tipo mixture-of-experts con expertos enrutados, etiquetado en HuggingFace con la arquitectura `qwen3_5_moe_text` y el pipeline `text-generation`. Este checkpoint no incorpora ninguna innovacion arquitectonica nueva; lo que hace es modificar la forma de las FFN de los expertos. La poda es estructural, no de magnitud sobre pesos aislados: se elimina un 50% fijo de las neuronas de las FFN de los expertos enrutados mediante el criterio de media absoluta del gradiente implementado en Less-is-MoE. La diferencia entre variantes radica en como se almacenan las anchuras resultantes: IntDim-E aplica una anchura uniforme, mientras que IntDim-L y IntDim-G conservan la topologia MoE enrutada y guardan anchuras compactas por experto en `config.json`. Este checkpoint pertenece a la familia IntDim-G.

El proceso de calibracion esta documentado con detalle reproducible: 128 muestras tomadas de `yentinglin/s1K-1.1-trl-format` (revision `58a01564d278477da20ead1bcf1cde8e31f36251`), con los ajustes de carga `train` y `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncado por prefijo, sin padding y en BF16, sin ningun paso de optimizador. El checkpoint origen se cargo y se podo en BF16. Se publican dos hashes de trazabilidad: el de seleccion de filas fuente, `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784`, y el de tokens especificos del modelo, `47214818e5c0acaa6e65d3f212f7fab62937a4085d26394c356e3be1c94fffbf`. Los metadatos completos de exportacion y de equivalencia con mascara cero estan en `experiment-export.json`. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o ajuste supervisado posterior a la poda.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, capacidades heredadas del modelo base.
- Razonamiento, matematicas y generacion de codigo: no documentado para este checkpoint; dependeria de las capacidades del modelo base, no verificadas tras la poda.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas. La unica particularidad funcional declarada es la topologia MoE podada con anchuras por experto no uniformes.
- Trazabilidad del proceso de poda: la publicacion de hashes y de `experiment-export.json` permite auditar la reproducibilidad del experimento, algo poco frecuente en checkpoints podados.

## Casos de uso

- Reproduccion del experimento Less-is-MoE: cargando el checkpoint con el plugin ragged de vLLM y el dataset de calibracion en la revision indicada, se puede verificar que los hashes de seleccion de filas y de tokens coinciden y que la mascara cero se comporta como declara `experiment-export.json`.
- Estudio de degradacion por poda: comparar este checkpoint con el base Qwen/Qwen3.5-122B-A10B sobre el mismo corpus de evaluacion permite cuantificar que se pierde al eliminar el 50% de las neuronas FFN de los expertos enrutados.
- Ablacion entre variantes IntDim-E, IntDim-L e IntDim-G: al compartir base y calibracion, este modelo sirve como punto de comparacion directo para estudiar el efecto de anchuras uniformes frente a anchuras por experto.
- Investigacion sobre especializacion de expertos: las anchuras compactas por experto guardadas en `config.json` permiten analizar que expertos han perdido mas capacidad y correlacionarlo con su patron de activacion.
- Servicio conversacional autoalojado: los 64.100 millones de parametros en BF16 ocupan unos 128 GB, desplegables en dos aceleradores de 80 GB con VLLM y el plugin requerido, para equipos que necesiten inferencia de texto en infraestructura propia sin depender de APIs externas.
- Inferencia por lotes fuera de linea: en pipelines donde la latencia no es critica, el modelo se puede usar para generar grandes volumenes de texto procesando lotes y amortizando el coste de memoria del despliegue multi-GPU.
- Banco de pruebas de infraestructura: sirve para validar el comportamiento del plugin ragged de vLLM en un entorno controlado, incluida la gestion de anchuras por experto no uniformes.
- Punto de partida para ajuste posterior: al conservar la topologia MoE y reducir el numero de parametros respecto al base, es un candidato razonable para adaptaciones con LoRA o QLoRA sobre las partes no podadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: 64.129.468.416 parametros x 2 bytes = aproximadamente 128,3 GB, cifra coherente con el tamano del repositorio. Necesita al menos 2 GPU de 80 GB (H100 80 GB, A100 80 GB) o 4 de 48 GB, mas el espacio de cache KV.
- Pesos en FP8 (estimacion): unos 64 GB. Una sola GPU de 80 GB queda muy justa con la cache KV; se recomienda 2 GPU.
- Pesos en INT4 (estimacion): unos 32 GB. Cabe en A6000 48 GB o L40S 48 GB, pero no en GPUs de consumo de 24 GB. En una RTX 5090 de 32 GB entraria sin margen apreciable para cache KV.
- GPU de consumo: en BF16 y en 8 bits no cabe en ninguna GPU de consumo actual. Solo una cuantizacion de 4 bits, no publicada por el autor, lo acercaria al rango de 32 GB.
- Opciones de despliegue: vLLM con el plugin ragged de Less-is-MoE de la imagen GPU unificada del proyecto, requisito obligatorio. No se documentan soportes para llama.cpp, Ollama, TGI ni otros runtimes, y la ausencia de GGUF y la necesidad del plugin hacen poco probable su uso.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Al ser un modelo MoE, el coste de computo por token es inferior al que sugiere el total de parametros, pero el requisito de memoria es el del conjunto completo de pesos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad / requisitos |
|---|---|---|---|---|
| Este checkpoint (Less-is-MoE IntDim-G, poda del 50%) | 64.129.468.416 (medidos en safetensors) | no disponible | apache-2.0 | Requiere plugin ragged de vLLM; sin cuantizaciones publicadas; 0 descargas |
| Qwen/Qwen3.5-122B-A10B (base) | 122B declarados, 10B activos (A10B) | no disponible | no disponible en la informacion proporcionada | Safetensors estandar, presumiblemente compatible con vLLM sin plugin; datos de despliegue no disponibles |
| Otros MoE comparables de rango 60-130B | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparativa se limita a parametros, licencia y requisitos de despliegue. No se pueden comparar metricas de calidad sin benchmarks publicados.

## Limitaciones y advertencias

- No hay ningun benchmark publicado: la perdida de calidad provocada por eliminar el 50% de las neuronas FFN de los expertos enrutados no esta cuantificada.
- Requisito de despliegue restrictivo: la inferencia exige el plugin ragged de vLLM de Less-is-MoE. Sin ese plugin, el modelo no se carga en un servidor vLLM convencional.
- No existen cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con VRAM reducida.
- Idiomas soportados no declarados; no se puede asumir un comportamiento multilingue concreto sin evaluacion.
- Longitud de contexto no declarada. La calibracion se hizo con `seq_length=8192` y truncado por prefijo, por lo que el criterio de poda puede estar sesgado hacia secuencias de hasta 8192 tokens.
- Riesgo de alucinacion no evaluado para este checkpoint; se hereda del modelo base, cuyas caracteristicas tampoco se documentan aqui.
- No se documenta ninguna fase de alineacion (RLHF, DPO) especifica de este checkpoint.
- La licencia declarada es Apache 2.0, permisiva para uso comercial, pero la licencia del modelo base no aparece en la informacion proporcionada; conviene verificarla antes de explotarlo en produccion.
- Artefacto de investigacion sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- La busqueda web no devolvio ningun resultado relevante sobre este modelo ni sobre Qwen3.5, por lo que no se ha podido contrastar externamente la nomenclatura, el metodo Less-is-MoE ni las cifras declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-g-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de calibracion publicado: https://huggingface.co/datasets/jayzou3773/less-is-moe-s1-calibration-128-seq8192 (revision `678b4e666183e16ec00376960df03b6381632ed1`)
- Dataset fuente de calibracion: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format (revision `58a01564d278477da20ead1bcf1cde8e31f36251`)
- Metadatos de exportacion y equivalencia con mascara cero: archivo `experiment-export.json` del repositorio del modelo
- Papers, blogs o repositorios adicionales: no se han encontrado en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
