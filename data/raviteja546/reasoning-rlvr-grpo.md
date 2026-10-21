# Raviteja546/reasoning-rlvr-grpo

## Resumen

`reasoning-rlvr-grpo` es un checkpoint de investigación publicado por Raviteja546 (usuario `Raviteja546`) dentro de su estudio sobre RLVR (*Reinforcement Learning with Verifiable Rewards*), cuyo código vive en el repositorio `rrtchaganti/reasoning-rlvr`, rama `phase-4-grpo`. Se trata de un ajuste fino completo de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) sobre la familia Qwen3, que parte del checkpoint `Raviteja546/reasoning-rlvr-rft` y aplica GRPO con una recompensa verificable binaria sobre problemas de matemáticas de GSM8K y MATH.

El modelo no introduce arquitectura nueva: es un transformer denso de la familia Qwen3, y su aportación es metodológica. El entrenamiento busca que la política de razonamiento termine sus respuestas y respete la plantilla `<think> ... </think> <answer> ... </answer>`, en lugar de entrar en bucles de generación. Según la model card, la tasa de finalización sube del 35 % al 75 % y la recompensa media del 0,344 al 0,684 en 200 pasos, con solo 3,13 horas de GPU H100.

Es relevante ahora por tres motivos: documenta un experimento RLVR reproducible de principio a fin (prompts, hashes, hiperparámetros, semillas), publica intervalos de confianza bootstrap pareados frente al checkpoint de partida, y hace un análisis honesto de sus modos de fallo, incluyendo que la mejora medida es en gran parte una mejora de terminación y no de corrección bruta. Es un artefacto de estudio, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (tag `qwen3`); atención con `flash_attention_2` durante el entrenamiento |
| Parametros totales | 1.720.574.976 (≈1,72 B), confirmado en safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El entrenamiento limita la completion a 1536 tokens y las trazas de razonamiento de origen a 4096 tokens |
| Tipos de cuantizacion | No disponible. Pesos publicados en bf16; no se incluye GGUF, AWQ ni GPTQ en el repo |
| Idiomas soportados | No disponible. Los datasets de entrenamiento (GSM8K, MATH) son en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos: tamano del repo 34,4 GB (incluye artefactos de entrenamiento, no solo pesos), 7 descargas, 0 likes, region `us`, creado el 2026-10-20 y actualizado el 2026-10-21.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 en su variante de 1,7 B, sin modificaciones estructurales. El punto de partida es `Raviteja546/reasoning-rlvr-rft`, un ajuste supervisado sobre trazas de razonamiento estilo olimpiada. Sobre ese checkpoint se hace un *full fine-tune* con GRPO usando `GRPOTrainer` de TRL con vLLM colocalizado. La recompensa es puramente verificable y binaria: vale 1 solo si la completion termina, respeta el formato think/answer y la respuesta final es correcta segun `rlvr.train.grpo.score_completion`; en cualquier otro caso vale 0. No hay modelo de recompensa aprendido ni anotaciones humanas en esta fase.

Los prompts provienen de `outputs/data/rft/learnable_prompts.jsonl` (manifiesto `data/manifests/rft_iter1.json`, hash `281bdfe31176411b`); se muestrearon 2735 de los 4606 prompts a lo largo de la ejecucion, con 468 de `gsm8k_train` y 2267 de `math_train`. La forma del entrenamiento es 32 prompts × 8 muestras por paso (256 completions), con tope de 1536 tokens, temperatura 1,0, 200 pasos y micro-lote de 16; un paso de optimizador por lote de generacion. Optimizador AdamW con betas (0,9, 0,99), learning rate 1e-6 con `constant_with_warmup` y 10 pasos de calentamiento, weight decay 0,0, grad clipping 1,0, perdida `grpo` con `scale_rewards=group`, KL beta 0,04, epsilon 0,2, `dynamic_sampling=False`, bf16 activado y semilla 0.

La senal de entrenamiento evoluciona de recompensa 0,344 a 0,684, tasa de finalizacion del 35 % al 75 % y longitud media de completion de 1406 a 1201 tokens. Un 30 % de los grupos presentan varianza cero de recompensa de media (todos los samples correctos o todos incorrectos), lo que reduce la senal efectiva. No se levantaron avisos de *reward hacking*. El coste total fue de 3,13 horas de GPU en una NVIDIA H100 80GB HBM3 con un pico de memoria de 70,35 GB.

## Capacidades

- Generacion de razonamiento matematico paso a paso en el formato `<think> ... </think> <answer> ... </answer>`, que es el que usan todas las evaluaciones y las fases RL del estudio.
- Resolucion de problemas aritmeticos de nivel escolar (GSM8K) y de competicion (MATH-500) en ingles.
- Generacion de cadenas de razonamiento de hasta 1536 tokens durante el entrenamiento y hasta 4096 tokens en las trazas de origen.
- Terminacion controlada de la respuesta: el objetivo explicito del RL es que el modelo cierre la etiqueta `<answer>` en lugar de seguir generando.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada; no se ha entrenado ni evaluado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en un unico turno de problema-respuesta.
- Capacidades multilingues: no disponibles; los datasets son en ingles.
- Modo *thinking*: si, mediante la plantilla de etiquetas, pero no es un modo conmutable como en otros modelos de la familia; el formato es fijo.
- Vision, audio y otras modalidades: no soportadas.

## Casos de uso

- **Investigacion reproducible sobre RLVR**: el checkpoint sirve como punto de comparacion con intervalo de confianza pareado frente a `reasoning-rlvr-rft`. Se usaria para replicar el efecto de GRPO con recompensa binaria en un modelo de 1,7 B sin coste elevado (3,13 GPU-horas en H100).
- **Experimentos de destilacion de razonamiento**: al generar trazas largas con etiquetas separadas de pensamiento y respuesta, se puede usar como generador de datos sinteticos de CoT para destilar en modelos mas pequenos, filtrando por correccion con `math-verify`.
- **Banco de pruebas de parsers y extractores de respuesta**: el modelo produce de forma fiable el bloque `<answer>`, lo que permite validar pipelines de extraccion y normalizacion matematica en entornos de evaluacion.
- **Evaluacion de tecnicas de mitigacion de bucles en generacion**: dado que el RL convierte el modelo en una politica que termina, sirve como caso de estudio controlado para medir truncamiento y bucles en decodificacion greedy.
- **Tutoria matematica offline en ingles**: con 1,72 B de parametros y pesos bf16, puede desplegarse en una GPU consumer para dar explicaciones paso a paso de problemas de aritmetica y algebra de nivel escolar, siempre con validacion posterior de la respuesta.
- **Prototipado de sistemas de verificacion de respuestas**: combinado con un verificador simbolico, el modelo genera candidatos y el verificador decide; util para estudiar la relacion entre tasa de finalizacion y precision real.
- **Docencia y formacion en RL para LLMs**: el repositorio incluye scripts (`phase4_preflight.py`, `rlvr-grpo`, `rlvr-eval`) y configuraciones YAML que permiten recorrer el ciclo completo en un clon del entorno, usando este checkpoint como referencia de "despues".

## Benchmarks y rendimiento

Resultados de la model card, decodificacion greedy con vLLM *batch-invariant* e intervalos bootstrap del 95 % sobre problemas:

| Plantilla | gsm8k | gsm8k_perturbed | math500 | countdown | aime24 | trunc % | extract-fail % |
|---|---|---|---|---|---|---|---|
| think_tag | 82,3 [80,2; 84,2] | 73,9 [70,7; 77,0] | 63,4 [59,4; 67,6] | 14,0 [11,0; 17,0] | 3,3 [0,0; 10,0] | 72,6 | 72,4 |
| few_shot_cot | 79,3 [77,2; 81,6] | 71,4 [68,3; 74,5] | 57,4 [53,2; 61,6] | - | 0,0 [0,0; 0,0] | 50,0 | 5,6 |
| zero_shot | 84,3 [82,4; 86,3] | 74,7 [71,7; 77,7] | 64,4 [60,4; 68,6] | - | 6,7 [0,0; 16,7] | 65,0 | 7,4 |

Las columnas `trunc %` y `extract-fail %` recogen el valor maximo sobre los conjuntos de cada fila; Countdown bajo la plantilla think-tag domina ambos.

Comparacion pareada sobre los mismos problemas contra el checkpoint de partida (`rft`):

| Evaluacion | Pares | rft | grpo | grpo - rft [IC pareado] | solo rft / solo grpo |
|---|---|---|---|---|---|
| gsm8k | 1319 | 78,2 [76,0; 80,3] | 82,3 [80,1; 84,3] | 4,1 [2,0; 6,1] | 66 / 120 |
| gsm8k_perturbed | 830 | 69,0 [65,8; 72,2] | 73,9 [70,8; 76,7] | 4,8 [1,9; 7,6] | 46 / 86 |
| math500 | 500 | 56,4 [52,0; 60,4] | 63,4 [59,0; 67,4] | 7,0 [2,8; 11,0] | 39 / 74 |
| countdown | 500 | 7,0 [4,8; 9,4] | 14,0 [11,2; 17,2] | 7,0 [3,6; 10,4] | 22 / 57 |
| aime24 | 30 | 0,0 [0,0; 0,0] | 3,3 [0,0; 10,0] | 3,3 [0,0; 10,0] | 0 / 1 |

MATH-500 por nivel, grpo - rft:

| Nivel | n | rft | grpo | Diferencia [IC pareado] |
|---|---|---|---|---|
| 1 | 43 | 81,4 [69,8; 90,7] | 93,0 [83,7; 100,0] | 11,6 [0,0; 23,3] |
| 2 | 90 | 75,6 [66,7; 84,4] | 82,2 [73,3; 90,0] | 6,7 [-2,2; 14,5] |
| 3 | 105 | 59,0 [49,5; 68,6] | 72,4 [63,8; 81,0] | 13,3 [3,8; 22,9] |
| 4 | 128 | 60,2 [51,6; 68,8] | 60,2 [51,6; 68,8] | 0,0 [-8,6; 9,4] |
| 5 | 134 | 29,9 [22,4; 38,1] | 37,3 [29,1; 45,5] | 7,5 [-0,7; 15,7] |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo de pesos; con cache KV y overhead de runtime, entre 4 y 6 GB para contextos cortos (estimacion a partir del numero de parametros, no medida publicada).
- VRAM estimada con cuantizacion de 8 bits: alrededor de 2 GB de pesos; con 4 bits, alrededor de 1 GB (estimaciones, no hay cuantizaciones publicadas en el repo).
- GPU recomendadas: H100 80GB (la usada en entrenamiento, con pico de 70,35 GB por el estado del optimizador y el motor vLLM colocalizado), A100 40/80GB para entrenamiento o evaluacion a gran escala.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16 (RTX 3060 Ti 8GB en adelante, RTX 4060 Ti 16GB, RTX 4090 24GB con margen amplio); en 4 bits cabria en 4 GB.
- Opciones de despliegue: vLLM (usado en la evaluacion con modo *batch-invariant*), TRL `GRPOTrainer` con vLLM colocalizado para reentrenamiento. Al ser arquitectura Qwen3, es compatible con llama.cpp y Ollama previa conversion a GGUF, pero no se publica GGUF en el repo. TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato de computo es el entrenamiento: 3,13 GPU-horas en H100 80GB HBM3 para 200 pasos con 256 completions por paso y tope de 1536 tokens.
- Almacenamiento: el repo ocupa 34,4 GB; los pesos en bf16 son aproximadamente 3,4 GB, por lo que el resto corresponde a artefactos de entrenamiento y estados intermedios.

## Comparativa con modelos similares

Los datos de los modelos alternativos no estan en la informacion proporcionada; la comparacion se limita a lo que consta y se marca explicitamente lo desconocido.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|
| reasoning-rlvr-grpo (este) | 1,72 B | no disponible | Apache 2.0 | GRPO + recompensa verificable binaria sobre base Qwen3 | GSM8K 82,3; MATH-500 63,4; AIME24 3,3 (plantilla think-tag) |
| Raviteja546/reasoning-rlvr-rft (modelo base) | no disponible en la ficha (mismo linaje, ~1,7 B) | no disponible | no disponible | SFT sobre trazas de razonamiento | GSM8K 78,2; MATH-500 56,4; AIME24 0,0 (pareado) |
| Qwen3-1.7B (familia de origen) | ~1,7 B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base generalista con modo thinking | no disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | no disponible en la informacion proporcionada | no disponible | no disponible | Destilacion de trazas R1 sobre Qwen2.5 | no disponible |

La comparacion relevante y con datos es la del par `rft` frente a `grpo`: mismo numero de parametros, mismos prompts de evaluacion y ganancias pareadas de +4,1 puntos en GSM8K, +7,0 en MATH-500 y +7,0 en Countdown, todas con intervalos que excluyen el cero.

## Limitaciones y advertencias

- **La mejora es fundamentalmente de terminacion.** La propia model card lo indica: entre los problemas en que ambos checkpoints terminan, la diferencia de precision pareada cae dentro de su intervalo de confianza. Es decir, el RL ensena al modelo a cerrar la respuesta, no necesariamente a razonar mejor.
- **Truncamiento muy alto con la plantilla entrenada.** El 72,6 % de truncamiento y el 72,4 % de fallo de extraccion bajo `think_tag` (dominados por Countdown) implican que, en la practica, la mayoria de las respuestas no se pueden puntuar sin un postprocesado cuidadoso.
- **Paradoja de plantillas**: `zero_shot` obtiene numeros iguales o mejores que `think_tag` en GSM8K (84,3 frente a 82,3) y MATH-500 (64,4 frente a 63,4), con mucho menos truncamiento (65,0 frente a 72,6) y menos fallo de extraccion (7,4 frente a 72,4). El formato entrenado no es la mejor opcion de inferencia segun los propios datos.
- **Rendimiento muy bajo en problemas dificiles**: AIME24 queda en 3,3 % con 30 problemas (un unico acierto), y MATH-500 nivel 5 en 37,3 %. No es un modelo adecuado para matematicas de competicion.
- **Riesgo de alucinacion**: no se ha medido en la informacion disponible; el modelo esta entrenado solo con recompensa de correccion matematica, sin penalizacion por afirmaciones no verificadas ni por estilo.
- **Idioma**: los datasets son en ingles y no se documentan capacidades multilingues. No se recomienda su uso en castellano sin evaluacion previa.
- **Contaminacion de datos no resuelta**: se eliminaron tres problemas de MATH-500 y ninguno de GSM8K del conjunto de SFT, pero la contaminacion del preentrenamiento del modelo base se mide en el informe de Fase 1 del repositorio y este checkpoint no la corrige.
- **Volumen de entrenamiento limitado**: 200 pasos, 2735 prompts y un 30 % de grupos con varianza cero de recompensa; el margen de mejora adicional con mas pasos o mejor muestreo no esta explorado en la informacion disponible.
- **Artefacto de investigacion**: 7 descargas, 0 likes, sin pipeline declarado y sin garantias de mantenimiento. La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni evaluaciones de seguridad.
- **Consumo de almacenamiento**: el repo de 34,4 GB incluye artefactos de entrenamiento; conviene descargar solo los safetensors necesarios para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raviteja546/reasoning-rlvr-grpo
- Modelo base (fase RFT): https://huggingface.co/Raviteja546/reasoning-rlvr-rft
- Repositorio del estudio: https://github.com/rrtchaganti/reasoning-rlvr (rama `phase-4-grpo`, commit `a8b9f6947facfc2f9a627252e438ca5c4bb2da06`)
- Plantillas de prompt de evaluacion: `src/rlvr/eval/prompts.py` dentro del repositorio
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH (Hendrycks): https://huggingface.co/datasets/EleutherAI/hendrycks_math
- No se han encontrado en la busqueda web articulos, papers ni demos adicionales relacionados con este modelo; los resultados devueltos trataban sobre corrientes oceanicas y no son pertinentes.
