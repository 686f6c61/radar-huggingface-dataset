# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo entrenado desde cero ni un ajuste supervisado al uso: se parte del modelo base Qwen3-4B sin semilla de SFT y se aplica RL directamente con el algoritmo GRPO mediante la libreria OpenRLHF. El checkpoint guardado corresponde al paso global 46 de la ejecucion de RL homonima y el propio autor lo etiqueta como la mejor revision de la ejecucion atendiendo a la metrica pass@8.

El objetivo declarado es la generacion de codigo verificablemente correcta. La senal de recompensa es binaria: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario, con penalizaciones adicionales para truncamiento y respuestas excesivamente largas. El entrenamiento se apoya en un subconjunto de problemas dificiles ("frontier") del conjunto cobalt-train, concretamente aquellos que el modelo base resolvia como maximo en 2 de 64 muestras.

Su relevancia practica es doble. Por un lado, es un ejemplo abierto y reproducible de un experimento de RL sobre modelos pequenos con la receta completa publicada (hiperparametros, penalizaciones, logs en Weights & Biases). Por otro, con 3.973.556.832 parametros (~3,97B) y pesos en safetensors, es un modelo lo bastante compacto como para desplegarse en hardware de gama alta de consumo, lo que lo hace atractivo para experimentacion en generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3-4B-Instruct-2507); la etiqueta `nemotron_h` aparece en los tags pero no se confirma en la model card |
| Parametros totales | 3.973.556.832 (~3,97B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors, sin GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Nota: el repositorio ocupa 182,8 GB, un tamano muy superior al de un unico checkpoint de ~4B en precision completa, lo que sugiere que contiene pesos auxiliares o multiples artefactos del experimento. El checkpoint principal se sirve en la raiz del repositorio (rama `main`).

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros. El autor no describe cambios estructurales sobre dicha base: el experimento es exclusivamente de optimizacion por RL, no de modificacion arquitectonica. El modelo se carga directamente desde la raiz del repositorio sin subcarpeta.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con ventajas normalizadas por grupo y sin penalizacion KL. La receta incluye dos mecanismos de modelado de recompensa destacables: una penalizacion "stop-properly" (estilo ProRL) que asigna recompensa -1,0 a las muestras truncadas, y una penalizacion DAPO de sobrelongitud que aplica un castigo aditivo creciente hasta -0,25 a las respuestas que caen en los ultimos 1024 tokens antes del limite. Los hiperparametros concretos son: 8 muestras por prompt, tamano de lote de rollout y de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, y tasa de aprendizaje del actor constante de 1e-06. Los datos de entrenamiento son 1833 problemas de entrenamiento y 112 de validacion del "frontier" cobalt-train (problemas resueltos por el modelo base en 2 de 64 muestras como maximo). Las metricas de evaluacion de este checkpoint no figuren en el log de entrenamiento.

## Capacidades

- Generacion de texto e instrucciones: hereda la capacidad conversacional e instructiva de Qwen3-4B-Instruct-2507.
- Generacion de codigo: capacidad principal optimizada por RL, con recompensa basada en superacion de tests; el checkpoint se selecciona precisamente por su pass@8.
- Razonamiento paso a paso orientado a problemas de programacion dificiles, derivado del entrenamiento sobre el subconjunto "frontier".
- Formato de salida de programa completo (el reward de correctitud evalua programas generados contra tests).
- Tool calling / function calling: no especificado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no especificado en la informacion proporcionada.
- Capacidades multilingues: no disponible (el modelo base Qwen3 es multilingue, pero el efecto del RL sobre idiomas distintos del usado en entrenamiento no se documenta).
- Modo "thinking" explicito: no especificado en la informacion proporcionada.
- Vision o audio: no soportado (el pipeline declarado es unicamente text-generation).

## Casos de uso

- Generacion de codigo en pipelines de evaluacion: el modelo esta optimizado para producir programas que pasan baterias de tests, por lo que encaja en bucles de resolucion de problemas tipo benchmark o en la generacion de soluciones candidatas que luego se filtran por tests automatizados.
- Investigacion en RL para LLM: al publicar receta, hiperparametros y logs, sirve como referencia reproducible para estudiar GRPO, penalizaciones anti-truncamiento y senales de recompensa binarias en modelos pequenos.
- Asistencia de programacion en local: con ~4B parametros y pesos safetensors, puede desplegarse en una GPU de consumo para autocompletado y generacion de funciones sin dependencia de la nube.
- Generacion de tests unitarios a partir de enunciados: el entrenamiento sobre problemas con baterias de tests favorece que el modelo entienda la relacion entre especificacion y verificacion.
- Experimentos de destilacion o comparacion de tecnicas de RL: el checkpoint, junto con otros pasos de la misma ejecucion, permite estudiar la evolucion del rendimiento por paso global.
- Entornos educativos de programacion: uso como generador de soluciones de referencia para problemas de dificultad alta, siempre con verificacion posterior mediante ejecucion.
- Punto de partida para fine-tuning posterior: al estar sobre una base instruct conocida, puede servir como inicializacion para ajustes especificos de dominio en codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este checkpoint es el mejor de su ejecucion segun pass@8, pero aclara explicitamente que las metricas de evaluacion de este checkpoint no figuran en el log de entrenamiento. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de pass@8 absoluto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos estandar segun el numero de parametros, no datos publicados por el autor): ~8 GB en FP16/BF16, ~4-5 GB en INT8 y ~2,5-3 GB en cuantizacion INT4/GGUF Q4.
- GPU recomendadas: para precision completa, una RTX 4090 (24 GB) o A100 40 GB; para cuantizacion, tarjetas con 8-12 GB de VRAM son suficientes.
- Cabe en GPU de consumo: si, gracias a su tamano (~3,97B), en GPUs tipo RTX 3060 12 GB, RTX 4070 o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve ... --revision main`). No se documenta soporte oficial para llama.cpp u Ollama, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-... (este) | ~3,97B | no disponible | RL GRPO sobre generacion de codigo | no disponible | safetensors en HuggingFace, transformers + vLLM |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en la informacion proporcionada | Instruct generalista | no disponible en la informacion proporcionada | safetensors, ampliamente soportado |
| Otros modelos pequenos de codigo de ~3-4B (por ejemplo, variantes Coder de la familia Qwen) | ~3-4B | no disponible | Fine-tuning supervisado en codigo | variable | amplia disponibilidad |

La comparacion cuantitativa de rendimiento entre estas alternativas no puede establecerse con la informacion disponible, ya que no se han publicado cifras de benchmarks para este checkpoint.

## Limitaciones y advertencias

- Rendimiento no verificado publicamente: no hay metricas de evaluacion en la model card, por lo que el rendimiento real frente a la base Qwen3-4B-Instruct-2507 no puede cuantificarse sin evaluacion propia.
- Riesgo de sobreajuste al dominio de entrenamiento: el RL se aplico sobre un subconjunto "frontier" muy especifico (1833 problemas), lo que puede degradar la generalidad fuera de ese tipo de tareas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir codigo sintacticamente plausible pero incorrecto; el propio diseno de la recompensa (correctitud binaria por tests) implica que la verificacion automatica es necesaria.
- Idiomas: no se documenta el comportamiento multilingue ni el efecto del RL sobre idiomas distintos del usado en entrenamiento.
- Licencia: no disponible, lo que supone un riesgo para uso comercial hasta que el autor la concrete.
- Contexto: al no documentarse la longitud de contexto efectiva, no se garantiza el manejo de entradas largas.
- Deriva de truncamiento: aunque el entrenamiento penaliza respuestas truncadas, no se garantiza que el modelo termine correctamente en tareas muy extensas.
- Conservacion del modo instruct: al aplicarse RL directamente sobre la base sin SFT de semilla, existe riesgo de degradacion de capacidades conversacionales generales (por ejemplo, seguimiento de formato o rechazo de contenido problematico) respecto al modelo Instruct original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_iid16_s3` (sin URL directa en la informacion proporcionada)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_iid16_s3/openrlhf_train.log` (ruta interna del autor, no accesible publicamente)
- OpenRLHF (framework de entrenamiento): no se proporciona URL en la informacion disponible
