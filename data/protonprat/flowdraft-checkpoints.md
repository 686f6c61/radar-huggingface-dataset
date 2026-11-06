# ProtonPrat/FlowDraft-checkpoints

## Resumen

FlowDraft es un conjunto de pesos de "drafter" (modelo borrador) para decodificacion especulativa sobre el modelo objetivo Qwen3-4B. No es un modelo de lenguaje autonomo: es un componente auxiliar que predice los siguientes 15 tokens en una sola pasada de forward, que Qwen3-4B verifica despues en una unica pasada, conservando el prefijo correcto mas largo. El resultado es exactamente el mismo texto que generaria Qwen3-4B por si solo, pero con una aceleracion de entre 3,05x y 3,59x segun la metrica y el checkpoint.

El repositorio, publicado por el usuario ProtonPrat (equipo TokenYahu: Vipen Loka, Dheeraj Hegde, Pratyush Jena), contiene multiples exportaciones de drafters entrenados con tecnicas de flow matching (denominadas fmlm2 y DSpark), ademas de checkpoints de reanudacion de entrenamiento. El mejor drafter reportado alcanza un valor de tau (tokens escritos por ronda de adivinanza-verificacion) de 5,31 en modo greedy y 4,70 con temperatura 1, frente a 4,78 y 4,08 del baseline DFlash-100K.

La relevancia actual reside en que la decodificacion especulativa es una de las tecnicas mas extendidas para reducir la latencia de inferencia de LLM sin alterar la distribucion de salida. FlowDraft aplica flow matching al drafter, una innovacion frente a los drafters autorregresivos o basados en heads Markov convencionales, y publica pesos bajo licencia MIT sobre un modelo base Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa basado en flow matching (fmlm2 V3 / DSpark) sobre el layout DFlash; modelo objetivo Qwen3-4B |
| Parametros totales | no disponible (el repo ocupa 65,1 GB e incluye multiples exportaciones y checkpoints de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, flow.safetensors, head.safetensors) y .pt para checkpoints de reanudacion |

## Arquitectura y entrenamiento

FlowDraft implementa un drafter que genera 15 tokens candidatos en un unico forward pass mediante flow matching, en lugar de la generacion autorregresiva token a token. El modelo objetivo (Qwen3-4B) verifica los 15 candidatos en una sola pasada y acepta el prefijo correcto mas largo, garantizando que la salida sea identica a la de Qwen3-4B sin decodificacion especulativa. El codigo del modelo proviene de DFlash (z-lab/dflash, MIT) y los pesos se distribuyen en tres ficheros: model.safetensors (layout DFlash), flow.safetensors (partes de flow) y head.safetensors (cabeza conjunta).

El entrenamiento se realizo sobre 99.999 respuestas greedy de Qwen3-4B, con una semilla por ejecucion. Las variantes incluyen fmlm2 V3 (hasta 6 pasadas mas una pasada BV), DSpark sin flow, cabezas Markov sobre DFlash-100K congelado y FMLM+ desde cero. Algunas variantes incorporan "Lafa" (tiempo aprendido por slot y perdida de embedding) y self-conditioning con drafting en dos pasos. Los checkpoints de reanudacion (12 GB y 6,8 GB) incluyen pesos, optimizador, schedule y cursor de datos, y requieren 8 GPUs con los mismos ajustes de entrenamiento; el script src/train.py valida ambas condiciones.

## Capacidades

- Prediccion especulativa de 15 tokens por forward pass sobre Qwen3-4B, con verificacion en una sola pasada del modelo objetivo.
- Aceleracion de inferencia sin alterar la salida: el texto generado es exactamente el de Qwen3-4B.
- Soporte de dos modos de decodificacion: greedy y temperatura 1 (t1), con metricas tau diferenciadas.
- Multiples variantes de drafter: fmlm2 V3 con pasadas BV, TV o CE, DSpark, cabeza Markov sobre DFlash congelado y FMLM+ desde cero.
- Capacidad de reanudar entrenamiento desde checkpoints completos (pesos, optimizador, schedule, cursor de datos).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues propias: hereda las del modelo objetivo Qwen3-4B.

## Casos de uso

- Aceleracion de inferencia en produccion con Qwen3-4B: desplegar el drafter junto al modelo objetivo para reducir la latencia por token en 3,05x-3,59x, manteniendo la salida identica y sin necesidad de reentrenar el modelo base.
- Servidores de generacion de codigo: integrar el drafter en pipelines que usan Qwen3-4B para HumanEval o MBPP, donde el benchmark reportado muestra tau de 5,31 en greedy, reduciendo el coste por peticion en entornos de CI/CD.
- Razonamiento matematico interactivo: usar la variante fmlm2 V3 con pasada BV para tareas de GSM8K y MATH-500, donde el drafter fue evaluado y ofrece el mejor tau reportado (5,31 greedy / 4,70 t1).
- Chat multi-turno de baja latencia: desplegar el drafter en un servidor de inferencia con Qwen3-4B para conversaciones en MT-Bench, aprovechando la aceleracion sin degradar la calidad de las respuestas.
- Investigacion en decodificacion especulativa: comparar variantes (fmlm2 V3, DSpark, Markov head, FMLM+) usando los 480 benchmarks publicados (80 por set) para estudiar el impacto de flow matching frente a drafters autorregresivos.
- Reproduccion y extension del entrenamiento: reanudar desde los checkpoints .pt en un cluster de 8 GPUs para experimentar con nuevas pasadas (BV, TV, CE), Lafa o self-conditioning, siguiendo la configuracion del repositorio GitHub.
- Evaluacion de tecnicas de flow matching en drafters: usar los exports como referencia para medir tau y speedup en un H100 con batch size 1 y bucle de benchmark sin overhead.

## Benchmarks y rendimiento

Resultados reportados por el autor: 480 respuestas de benchmark (80 por set: GSM8K, MATH-500, HumanEval, MBPP, MT-Bench), una H100, batch size 1, bucle de benchmark sin overhead. tau = tokens escritos por ronda de adivinanza-verificacion.

| Checkpoint | Greedy tau | t1 tau | Greedy speed | t1 speed |
|---|---:|---:|---:|---:|
| init/dflash100k_epoch6 (baseline DFlash-100K) | 4,78 | 4,08 | 3,59x | 3,05x |
| runs/fmlm2_v3_6ep_bv/export/epoch_1 (mejor) | 5,31 | 4,70 | 3,50x | 3,11x |
| runs/fmlm2_v3_6ep_bv_lt/export/epoch_1 | 5,30 | 4,71 | no disponible | no disponible |
| runs/fmlm2_v3_6ep_bv_emb/export/epoch_1 | 5,27 | 4,65 | no disponible | no disponible |
| runs/fmlm2_v3_6ep_bv_lt_sc/export/epoch_1 | no disponible | no disponible | no disponible | no disponible |
| runs/fmlm2_v3_6ep_tv/export/epoch_1 | 5,26 | 4,70 | no disponible | no disponible |
| runs/fmlm2_v3_6ep_ce/export/epoch_1 | 5,17 | 4,37 | no disponible | no disponible |
| runs/dspark_joint_6p_tv/export/epoch_1 | 5,20 | 4,64 | 3,48x | 3,09x |
| runs/dspark_a/export/epoch_1 (Markov head) | 5,04 | 4,36 | 3,37x | 2,90x |

Las celdas vacias en la model card remiten a los informes del repositorio GitHub (reports/README.md). No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks de calidad del modelo objetivo en la informacion disponible; los datos anteriores miden exclusivamente la eficiencia del drafter.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El drafter completo mas el baseline DFlash-100K ocupa 4,1 GB segun el comando de descarga (`fetch`); el conjunto completo del repo son 62-65,1 GB.
- GPU recomendadas: H100 para reproducir los benchmarks reportados (batch size 1); no se especifican otras GPU.
- Cabe en consumer GPU: no disponible; no se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el codigo se ejecuta desde el repositorio GitHub FlowDraft-Main (no se mencionan vLLM, llama.cpp, Ollama ni TGI). El script scripts/hf_checkpoints.py gestiona la descarga de pesos.
- Latencia y throughput: speedup de 3,05x-3,59x sobre Qwen3-4B sin drafter, medido en una H100 con batch size 1.
- Entrenamiento/reanudacion: requiere 8 GPUs y los mismos ajustes de entrenamiento; src/train.py valida ambas condiciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | tau / speedup | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FlowDraft (fmlm2 V3 BV) | Drafter flow matching para Qwen3-4B | no disponible | no disponible | 5,31 / 4,70 tau; 3,50x / 3,11x | MIT | Hugging Face + GitHub |
| DFlash-100K (baseline) | Drafter DFlash para Qwen3-4B | no disponible | no disponible | 4,78 / 4,08 tau; 3,59x / 3,05x | MIT (z-lab/dflash) | Incluido en el repo |
| DSpark (6 pasadas + TV) | Drafter sin flow para Qwen3-4B | no disponible | no disponible | 5,20 / 4,64 tau; 3,48x / 3,09x | MIT | Incluido en el repo |
| Qwen3-4B (modelo objetivo) | LLM denso | 4B | no disponible en la informacion | no aplica | Apache-2.0 | Hugging Face (Qwen/Qwen3-4B) |

## Limitaciones y advertencias

- El drafter fue entrenado exclusivamente sobre 99.999 respuestas greedy de Qwen3-4B, con una sola semilla por ejecucion; el comportamiento con otras temperaturas o modelos distintos no esta validado.
- No es un modelo autonomo: requiere Qwen3-4B como verificador y no funciona sin el modelo objetivo, que no esta incluido en el repositorio.
- El repositorio incluye checkpoints de reanudacion de 12 GB y 6,8 GB que solo sirven para continuar entrenamiento, no para inferencia; su uso requiere 8 GPUs y la misma configuracion.
- No se han publicado datos de sesgos, alucinacion ni comportamiento multilingue; al heredar la salida de Qwen3-4B, estos riesgos son los del modelo objetivo.
- Las metricas de speedup dependen del hardware (H100, batch size 1) y del bucle de benchmark sin overhead; el rendimiento en otros entornos puede diferir.
- La model card no documenta el numero de parametros del drafter, la longitud de contexto ni los idiomas soportados.
- Licencia MIT para los pesos del drafter; el modelo base Qwen3-4B se distribuye bajo Apache-2.0 y el codigo DFlash bajo MIT, por lo que el uso comercial esta permitido sujeto a ambas licencias.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/FlowDraft-checkpoints
- Repositorio GitHub (codigo, informes e instrucciones): https://github.com/ProtonPratt/FlowDraft-Main
- Modelo objetivo Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Codigo upstream DFlash: https://github.com/z-lab/dflash
