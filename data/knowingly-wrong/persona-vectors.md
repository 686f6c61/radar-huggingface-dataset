# knowingly-wrong/persona-vectors

## Resumen

`knowingly-wrong/persona-vectors` es un repositorio de vectores de direccion (steering vectors) para el analisis de rasgos de personalidad y comportamiento en modelos Qwen. No es un modelo generativo en si mismo, sino un artefacto de interpretabilidad que contiene direcciones extraidas del flujo residual (residual stream) de dos modelos base: Qwen/Qwen3.6-27B y Qwen/Qwen2.5-7B-Instruct. Lo desarrolla el proyecto `knowingly-wrong`, asociado al paper "Knowingly Wrong: Training LLMs Against Their Own Beliefs can Cause Misalignment" (arXiv:2611.05287).

El repositorio resuelve un problema concreto: permitir la proyeccion de activaciones sobre 35 rasgos de comportamiento (incluyendo honestidad, alucinacion, sicofancia, maquiavelismo y malevolencia) y la manipulacion de la generacion mediante activation steering. Los vectores se ajustan de forma independiente para cada modelo base, de modo que una direccion extraida en el 27B no es aplicable al 7B ni viceversa. Las dimensiones ocultas son 5120 (27B) y 3584 (7B), con 64 capas de extraccion mas la capa de embedding.

Es relevante ahora porque proporciona un instrumento reproducible (seed 42, 500 permutaciones, posicion de lectura `assistant_mean`) para auditar el comportamiento de modelos fine-tuneados, aunque el propio autor advierte que la puerta de placebo no se supero en ninguno de los dos modelos, lo que limita la interpretacion de magnitudes absolutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccion extraidos del residual stream de transformers (Qwen3.6-27B y Qwen2.5-7B-Instruct) |
| Parametros totales | No aplica (artefacto de interpretabilidad); modelos base: 27B y 7B |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No aplica (ficheros `.npz` en float, sin cuantizacion publicada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `.npz` (NumPy) con claves `<trait>|<layer>|<kind>`; `unit`, `gap`, `split_half` |
| Tamano del repo | 0,1 GB |
| Modelos base | Qwen/Qwen3.6-27B (hidden 5120), Qwen/Qwen2.5-7B-Instruct (hidden 3584) |
| Numero de rasgos | 35 (incluye 4 controles `placebo-*`) |
| Capas de extraccion | 1..64 mas embedding (indice 0); `n_slices` = 65 |
| Posicion de lectura | `assistant_mean` |
| Seed | 42 |
| Permutaciones | 500 |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo, sino que extrae direcciones de comportamiento mediante diferencias de medias de activaciones en el residual stream. Para cada rasgo y cada capa se calcula una direccion L2-normalizada (`unit`), la diferencia de medias sin normalizar (`gap`, cuya norma es la separacion bruta entre clases) y una direccion ajustada sobre una mitad retenida (`split_half`) para evaluar fiabilidad. La extraccion se realiza por separado en cada modelo base, con configuracion registrada en `config.json` (bateria, posicion de lectura, seed y hash de git) y resumen en `summary.json`.

El pipeline procede del proyecto `false-facts-finetuning` (hash de git del 27B `b9313cf2`, revision `b236ea63` para el 27B y `36588b0` para el 7B). Para cada rasgo se selecciona una capa con datos retenidos y se reporta AUROC, gap y d de Cohen en `battery_report.jsonl`. La innovacion tecnica principal es el uso de una puerta de placebo basada en permutaciones (500 permutaciones) para contrastar si las direcciones reales se distinguen de controles; esta puerta no se supero en ningun modelo (`placebo_gate_passed: false`), lo que constituye una advertencia metodologica central.

## Capacidades

- Proyeccion de activaciones del residual stream sobre 35 rasgos de comportamiento mediante producto escalar con la direccion `unit`.
- Steering de generacion: suma o resta de la direccion durante la inferencia para inducir o suprimir un rasgo.
- Analisis de 8 rasgos reportados en el paper, orientados de modo que una proyeccion positiva indica mas del rasgo indeseable: evil, dishonesty, hallucination, overconfidence, sycophancy, manipulativeness, machiavellianism y callousness.
- Extraccion por capa: permite estudiar la evolucion del rasgo a lo largo de las 64 capas y seleccionar la capa optima por rasgo.
- Evaluacion de fiabilidad mediante `split_half` y geometria pairwise en `geometry.json`.
- Analisis de supervivencia de rasgos al test de permutacion en `survival.json`.
- No soporta tool calling, agentes, vision ni audio: es un artefacto de interpretabilidad, no un modelo generativo.

## Casos de uso

- Auditoria de fine-tuning: comparar la proyeccion de un modelo fine-tuneado contra su control emparejado en los 8 rasgos reportados, usando la diferencia tratamiento menos control en lugar de la deriva respecto al base, tal como recomienda el autor.
- Deteccion de sicofancia en produccion: proyectar activaciones de respuestas en la capa 64 (27B) o 27 (7B) para monitorizar si un asistente tiende a complacer al usuario en lugar de corregirlo.
- Monitorizacion de alucinacion: usar la direccion `hallucination` en la capa 34 (27B, d = 2,50) como senal auxiliar de alerta en pipelines de generacion aumentada por recuperacion.
- Investigacion en interpretabilidad: estudiar la geometria pairwise de 35 rasgos con `geometry.json` para analizar si las direcciones son ortogonales o comparten subespacios.
- Activation steering controlado: restar la direccion `overconfidence` (capa 45, 27B, d = 3,90) durante la decodificacion para calibrar la expresion de certeza en respuestas tecnicas.
- Validacion metodologica: reproducir el test de permutacion con 500 iteraciones y seed 42 para verificar la robustez de nuevas direcciones antes de publicarlas.
- Analisis de seguridad en modelos abiertos: cuantificar el desplazamiento en `machiavellianism` o `manipulativeness` tras procesos de RLHF o DPO y detectar derivas no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos son las d de Cohen por rasgo y modelo en la capa seleccionada:

| Rasgo | Capa 27B | d (27B) | Capa 7B | d (7B) |
|---|---|---|---|---|
| evil | 35 | 0,72 | 15 | 0,78 |
| dishonesty | 16 | 4,16 | 26 | 1,09 |
| hallucination | 34 | 2,50 | 21 | 0,59 |
| overconfidence | 45 | 3,90 | 21 | 1,73 |
| sycophancy | 64 | 6,31 | 27 | 1,62 |
| manipulativeness | 51 | 2,78 | 21 | 1,33 |
| machiavellianism | 35 | 1,75 | 19 | 1,30 |
| callousness | 19 | 2,76 | 20 | 0,97 |

## Requisitos de hardware

- El repositorio en si ocupa 0,1 GB y se carga en CPU con NumPy; no requiere GPU para leer los `.npz`.
- Para proyectar activaciones o aplicar steering es necesario ejecutar el modelo base: Qwen2.5-7B-Instruct en BF16 requiere aproximadamente 15-16 GB de VRAM; Qwen3.6-27B en BF16 requiere aproximadamente 54-56 GB.
- GPU recomendadas para el 27B: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para el 7B: RTX 4090 (24 GB), A10G (24 GB) o L4 (24 GB).
- El 7B cabe en GPU de consumo con cuantizacion de 4 bits (aproximadamente 5-6 GB) o 8 bits (aproximadamente 9 GB). El 27B no cabe en una GPU de consumo de 24 GB en BF16; con cuantizacion de 4 bits ronda los 15-16 GB y podria caber en una RTX 4090.
- Opciones de despliegue del modelo base: vLLM, TGI, llama.cpp u Ollama para el 7B; para el 27B, vLLM o TGI en hardware de centro de datos. El steering requiere acceso a las activaciones internas, por lo que es necesario usar hooks en transformers o implementaciones que expongan el residual stream.
- Latencia y throughput: no disponibles; dependen enteramente del modelo base y del hardware.

## Comparativa con modelos similares

| Artefacto | Modelos base | Rasgos | Capas | Formato | Licencia |
|---|---|---|---|---|---|
| knowingly-wrong/persona-vectors | Qwen3.6-27B, Qwen2.5-7B-Instruct | 35 | 64 + embedding | `.npz` | no disponible |
| Otros repositorios de steering vectors | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre artefactos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La puerta de placebo no se supero en ninguno de los dos modelos (`placebo_gate_passed: false`): al menos un control `placebo-*` resulto significativo, por lo que una proyeccion no nula en un rasgo real no es prueba suficiente de un efecto genuino.
- Las magnitudes de un solo rasgo deben tratarse como exploratorias; el autor recomienda leer el desplazamiento de un modelo fine-tuneado como tratamiento menos su control emparejado, no como deriva respecto al base.
- Los vectores son especificos de cada modelo base: una direccion del 27B no es valida para el 7B ni al reves, y las lecturas solo son comparables dentro del mismo modelo.
- El repositorio no es un modelo generativo: no puede usarse para texto, codigo, vision ni tool calling; solo para analisis y steering sobre los modelos base.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no disponibles: la extraccion se realizo sobre los modelos base, cuyo soporte multilingue depende de Qwen.
- El rasgo `evil` presenta la d mas baja en el 27B (0,72) y `hallucination` en el 7B (0,59), lo que indica senales debiles y mayor riesgo de falsos positivos en esos casos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/knowingly-wrong/persona-vectors
- Paper: https://arxiv.org/abs/2611.05287
- Proyecto de origen: `false-facts-finetuning/persona-vectors` (referenciado en la model card, sin URL publica en la informacion disponible)
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
