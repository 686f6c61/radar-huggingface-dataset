# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp32

## Resumen

Celerity 271M 8K es un checkpoint de la familia Celerity, un modelo de lenguaje de tipo transformer denso con aproximadamente 271 millones de parametros y una ventana de contexto maxima de 8192 tokens. Lo desarrolla el usuario adpretko a partir de un entrenamiento realizado sobre la infraestructura Cerebras (sistemas CSX) y posteriormente convertido al formato de Hugging Face. La variante concreta que nos ocupa, `ad0.2_ild_tpp32`, es una ablacion centrada en la tasa de dropout de atencion y en el numero de tokens por parametro (TPP), no un modelo pensado para produccion general.

El modelo se entreno sobre CommonPile, un corpus abierto de datos de dominio publico, usando un pool corregido sin repeticiones. Con 32 tokens por parametro nominales y unos 8.665 millones de tokens de entrenamiento, se situa en la franja de modelos pequenos orientados a experimentacion controlada y a estudios de escalado. Emplea embeddings posicionales ALiBi, lo que permite manejar secuencias largas sin embeddings posicionales aprendidos, y una programacion de dropout de atencion dependiente de la capa (lineal), con un endpoint de 0,2.

Su relevancia es fundamentalmente de investigacion: sirve para reproducir y comparar ablaciones de hiperparametros (dropout de atencion, regimen TPP) en un modelo de escala manejable. No dispone de model card con resultados de benchmarks, idiomas declarados ni licencia explicita, por lo que su uso comercial queda sin garantias claras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Celerity), embeddings posicionales ALiBi |
| Parametros totales | 271M (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch; requiere `trust_remote_code=True`) |
| Idiomas soportados | no disponible (dataset CommonPile, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch con `custom_code` (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Celerity, con embeddings posicionales ALiBi en lugar de posiciones absolutas aprendidas o RoPE, lo que facilita la extrapolacion a secuencias largas hasta 8192 tokens. El entrenamiento se realizo en tres sistemas Cerebras CSX con un batch global de 60, tasa de aprendizaje pico de 0,15, weight decay de 0,002741075441904568 y un tau_ema de 0,13795436292484553. Se completaron 17.630 pasos, equivalentes a 8.665.497.600 tokens de entrenamiento, lo que da lugar a un regimen nominal de 32 tokens por parametro.

La innovacion tecnica de esta ablacion reside en la programacion de dropout de atencion: el valor 0,2 es el endpoint de una programacion lineal dependiente de la capa, no una probabilidad uniforme de dropout. El dropout se desactiva con `model.eval()` durante la evaluacion ordinaria. No se declaran fases de RLHF, DPO ni ajuste por preferencias; el checkpoint es el resultado directo del preentrenamiento sobre CommonPile (pool TPP corregido sin repeticiones). El modelo se convirtio desde el checkpoint original `checkpoint_17630.mdl` con el commit de conversor `0e3d5d375695293479df9d2a3717f05f71a345b4` y runtime `cbcore 2.6.0`.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por el preentrenamiento sobre CommonPile.
- Manejo de contexto largo de hasta 8192 tokens gracias a ALiBi.
- Capacidad de continuacion y finalizacion de texto; no se documenta un modo de instrucciones ni de chat.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el corpus de origen es predominantemente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion de ablaciones de dropout de atencion: el checkpoint permite comparar el efecto de un endpoint de dropout de 0,2 con programacion lineal frente a otras variantes de la misma familia sobre el mismo corpus.
- Estudios de escalado en regimen de tokens por parametro: con 32 TPP nominales y 8.665 millones de tokens, sirve para analizar la relacion entre datos, parametros y perdida en modelos pequenos.
- Reproducibilidad de entrenamientos en Cerebras: los hiperparametros documentados (batch 60, lr 0,15, weight decay, tau_ema) permiten replicar o auditar el experimento en hardware CSX.
- Evaluacion de embeddings ALiBi en contexto de 8192 tokens: util para medir degradacion de perplejidad a longitudes crecientes frente a alternativas con RoPE.
- Generacion de texto base para experimentos de dominio publico: al entrenarse sobre CommonPile, puede emplearse en estudios sobre datos libres de derechos, siempre que se resuelva antes la licencia.
- Baseline en pipelines de investigacion con `trust_remote_code=True`: integrable en scripts PyTorch para comparativas controladas de modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271M de parametros en fp32, aproximadamente 1,1 GB de pesos; en fp16/bf16, unos 0,55 GB; en int8, unos 0,3 GB. El repo ocupa 0,5 GB, coherente con pesos en precision reducida.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para lotes grandes o contexto de 8192 tokens, se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, incluidas GTX 1650 o superiores.
- Opciones de despliegue: al usar `custom_code` y pesos PyTorch, la via natural es `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la conversion a GGUF requeriria trabajo adicional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (esta variante) | 271M | 8192 | no disponible | Hugging Face, `custom_code` |
| GPT-2 small | 124M | 1024 | MIT | Amplia, ecosistema estandar |
| Pythia 410M | 410M | 2048 | Apache 2.0 | Amplia, `transformers` nativo |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | Amplia, multiples formatos |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para esta variante. Frente a GPT-2 small y Pythia, Celerity ofrece mayor contexto (8192) pero carece de licencia declarada y de soporte en herramientas estandar, lo que reduce su atractivo fuera de la investigacion.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin model card de evaluacion: no hay benchmarks, por lo que el rendimiento real es desconocido.
- Es una ablacion de investigacion, no un modelo afinado para instrucciones; no se espera un comportamiento fiable en tareas de chat o agentes.
- Riesgo de alucinacion y de generar contenido sesgado, inherente a un modelo pequeno preentrenado sobre CommonPile sin alineamiento posterior.
- Idiomas no declarados; el corpus es predominantemente ingles, por lo que el rendimiento en castellano sera limitado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; auditar el codigo antes de cargarlo.
- El dropout de atencion con endpoint 0,2 es una programacion dependiente de la capa; interpretar mal este valor puede llevar a conclusiones erroneas en comparativas.
- Sin soporte documentado en vLLM, llama.cpp u Ollama; el despliegue en produccion exigiria trabajo de conversion y validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp32
- Repositorio del autor en Hugging Face: https://huggingface.co/adpretko
- CommonPile (dataset de entrenamiento): no disponible en la informacion proporcionada
- Paper o blog de Cerebras sobre Celerity: no disponible en la informacion proporcionada
- Repositorio de `cbcore` (runtime 2.6.0): no disponible en la informacion proporcionada
