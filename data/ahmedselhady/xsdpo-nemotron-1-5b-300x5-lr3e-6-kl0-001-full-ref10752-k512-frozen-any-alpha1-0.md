# ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-any-alpha1.0

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tune) del modelo nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, publicado por el usuario ahmedselhady en Hugging Face. El modelo parte de la base Qwen2 de 1.500 millones de parametros de NVIDIA, orientada a razonamiento, y se ha entrenado con una variante de SDPO (Self-Distillation Policy Optimization) identificada en el nombre del repositorio como "XSDPO", sobre un conjunto de datos de matematicas ("macereason-math"). El resultado es un checkpoint de investigacion centrado en mejorar el razonamiento matematico del modelo base.

Se trata de un artefacto experimental, no de un modelo de produccion: el repositorio no incluye model card descriptiva, no declara licencia ni idiomas soportados, y no cuenta con descargas ni interacciones en el momento de la consulta. El nombre del repositorio codifica los hiperparametros del entrenamiento (300 pasos por 5 epocas, learning rate 3e-6, coeficiente KL 0.001, referencia de 10752 tokens, k=512, alpha=1.0), lo que sugiere que su publico objetivo son investigadores que replican o comparan metodos de optimizacion de politicas para razonamiento.

La relevancia actual es acotada: sirve como punto de comparacion para experimentos de RL/auto-destilacion sobre modelos pequenos de razonamiento, pero no esta pensado para despliegue comercial ni para tareas generales. El checkpoint publicado corresponde al paso 150 de una ejecucion de 300x5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el nombre del repo menciona ref10752, no confirmado como contexto) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B: un transformer decoder-only de aproximadamente 1.500 millones de parametros con atencion causal estandar y tokenizer de Qwen2. No se introduce ninguna modificacion arquitectonica conocida; el repositorio solo contiene pesos ajustados.

El entrenamiento se describe como una ejecucion de SDPO (Self-Distillation Policy Optimization) con los hiperparametros codificados en el nombre: 300 pasos x 5 epocas, learning rate 3e-6, coeficiente KL de 0.001, referencia de 10752, k=512, alpha=1.0 y politica "frozen" (congelada) con referencia. El dataset empleado se denomina "macereason-math", orientado a razonamiento matematico. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO. El checkpoint publicado es el paso 150, accesible con `revision="step-150"`, mientras que la rama principal apunta al ultimo paso publicado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base (pipeline text-generation, tag conversational).
- Razonamiento matematico: el ajuste se ha realizado sobre datos de matematicas, por lo que se espera mejora en problemas aritmeticos y de razonamiento paso a paso.
- Razonamiento multi-paso: el modelo base de NVIDIA esta disenado para cadenas de razonamiento ("reasoning").
- Compatibilidad con text-generation-inference y endpoints (tags endpoints_compatible).
- Soporte de tool calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Investigacion en optimizacion de politicas: el modelo sirve como referencia reproducible de una ejecucion SDPO con hiperparametros conocidos, util para comparar curvas de aprendizaje frente al modelo base.
- Evaluacion de razonamiento matematico en modelos pequenos: permite medir si el ajuste con "macereason-math" mejora la precision en problemas aritmeticos respecto a Nemotron-Research-Reasoning-Qwen-1.5B.
- Ablaciones de hiperparametros: al estar codificados lr, KL, k y alpha en el nombre, facilita experimentos controlados sobre el efecto de cada uno.
- Prototipado de tutores matematicos: con 1.500 millones de parametros cabe en GPU de consumo y permite experimentar con generacion de explicaciones paso a paso en entornos de bajo coste.
- Generacion de datos sinteticos de razonamiento: puede emplearse para producir trazas de solucion que luego se filtren y reutilicen en pipelines de destilacion.
- Docencia y divulgacion: ejemplo didactico de como se documenta (o no) un fine-tune de investigacion y de como interpretar nombres de repositorio con hiperparametros.
- Despliegue en local para pruebas: via transformers o llama.cpp si se generan cuantizaciones GGUF (no publicadas), en equipos con GPU de 8-24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,6 GB solo para pesos (1.777 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos, 3-4 GB en total.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB de pesos, 2-3 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (tag endpoints_compatible), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se generan GGUF (no publicados).
- Latencia y throughput: no disponibles; al ser un modelo de 1.500 millones de parametros se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1.777 M | no disponible | Fine-tune SDPO sobre matematicas | no disponible | Hugging Face, 0 descargas |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.500 M | no disponible en esta ficha | Razonamiento (modelo base) | no disponible en esta ficha | Hugging Face (NVIDIA) |
| Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 tokens (referencia de la familia Qwen2.5) | Instrucciones generales | Apache 2.0 (familia Qwen2.5) | Hugging Face, ampliamente usado |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 M | 32.768 tokens (referencia) | Razonamiento destilado | MIT (referencia) | Hugging Face, ampliamente usado |

La comparacion con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B se ofrece como referencia de categoria (modelos de ~1.500 millones de parametros para razonamiento o instrucciones); los datos de contexto y licencia de esas alternativas provienen de sus familias publicas y deben verificarse en sus respectivas model cards. No hay benchmarks publicados de este fine-tune que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, composicion del dataset ni proceso de evaluacion, lo que impide auditar sesgos.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base.
- Idiomas no declarados: se desconoce el soporte multilingue real tras el ajuste.
- Riesgo de alucinacion: inherente a los modelos de 1.500 millones de parametros, especialmente en matematicas fuera de la distribucion de entrenamiento.
- Es un checkpoint intermedio (paso 150 de una ejecucion 300x5): puede no representar el mejor punto de la curva de entrenamiento.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ, lo que limita el despliegue en hardware modesto sin conversion manual.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente.
- El nombre del repositorio codifica hiperparametros, pero no se aporta informe de resultados; no se debe inferir calidad a partir de ellos.
- Para produccion se recomienda partir del modelo base de NVIDIA o de alternativas con licencia clara y benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-any-alpha1.0
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
