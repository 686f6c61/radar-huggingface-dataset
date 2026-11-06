# RinneCODER/Flint-40B-A2.5B-abliterated-REAP224-Rec-4bit

## Resumen

Flint-40B-A2.5B-abliterated-REAP224-Rec-4bit es una variante podada del modelo Flint de RecursiveSI, un transformer con mezcla de expertos (MoE) de 40.000 millones de parametros totales y 2.500 millones de parametros activos por token. El autor, RinneCODER, parte del build abliterated (sin mecanismos de rechazo) y cuantizado a int4 de dima6312 y aplica REAP (router-weighted expert activation pruning), una tecnica publicada por Cerebras en arXiv:2510.13999, para eliminar 32 de los 256 expertos enrutados de cada una de las 47 capas MoE, dejando 224 expertos por capa.

El objetivo es reducir el peso del modelo aproximadamente un 12% (de 21 GB a 19,9 GB) manteniendo la calidad en tareas de codigo, y acelerar la decodificacion cuando los expertos se transmiten desde SSD. Segun la model card, el modelo conserva un 87,5% de pass@1 en una muestra de 40 tareas de HumanEval+ y mejora el throughput de decodificacion de 30,1 a 36,8 tokens por segundo con decodificacion especulativa DFlash 2 activada, en un Mac con chip M5 Pro y 24 GB de memoria unificada.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de poda de expertos MoE guiada por metricas de enrutamiento; por otro, advierte de que el formato de pesos es propietario (layout Rec int4 de RecursiveSI) y solo carga en el runtime Locals, lo que limita mucho su portabilidad frente a GGUF o safetensors estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 47 capas MoE con 224 expertos enrutados por capa tras la poda (originalmente 256); capas 0-1 densas |
| Parametros totales | 40B (nominal, segun nombre del modelo); tamano del repo 19,9 GB en int4 |
| Parametros activos | 2,5B (nominal, segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Solo int4 afin con group size 64 (layout Rec de RecursiveSI); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (declarado en la model card); el resto no se ha evaluado tras la poda |
| Licencia | Apache-2.0 |
| Formato de pesos | Layout Rec int4 propietario de RecursiveSI; no compatible con safetensors estandar, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 47 capas de mezcla de expertos y dos capas densas iniciales. Cada capa MoE original tenia 256 expertos enrutados; tras REAP se conservan 224, seleccionados por una puntuacion que combina el peso de la puerta (gate weight) con la norma L2 de la salida del experto, promediada sobre los tokens enrutados a ese experto. La calibracion se hizo con 217.606 tokens extraidos de codeparrot/codeparrot-clean-valid, nebius/SWE-agent-trajectories y SWE-Gym/OpenHands-SFT-Trajectories, es decir, texto de codigo y de trayectorias de agentes de codigo. La evaluacion uso filas distintas de los mismos datasets.

Los expertos eliminados absorbian el 10,1% de las asignaciones de enrutamiento en el texto de calibracion, frente al 12,6% que absorbaria un subconjunto aleatorio de 32 expertos. REAP conserva algunos expertos poco usados pero criticos cuando se activan, lo que explica que supere tanto al descarte aleatorio (KL 0,92 frente a 1,47) como al descarte de los menos usados (KL 0,98). El autor probo podas mas agresivas: con 192 expertos el pass@1 en HumanEval+ cae a 32/40 y con 160 a 29/40, por lo que se descartaron. No se documento entrenamiento adicional ni fine-tuning tras la poda; el modelo hereda la abliteration y el build int4 del modelo base de dima6312.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Generacion de codigo: el modelo fue calibrado y evaluado especificamente en codigo y trayectorias de agentes de codigo, con 35/40 en HumanEval+ (pass@1, 40 tareas muestreadas, greedy, razonamiento completo).
- Razonamiento de varios pasos en tareas de programacion, segun la evaluacion con razonamiento completo.
- Comportamiento sin rechazo (abliterated): el modelo base fue modificado para eliminar mecanismos de rechazo; este comportamiento no se re-evaluo tras la poda.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: solo se declara ingles; el resto de idiomas no se ha evaluado y el autor advierte que pueden degradarse mas que el codigo tras la poda.
- Modo thinking explicito: no documentado; la evaluacion menciona "full reasoning" pero no se detalla el mecanismo.

## Casos de uso

- Generacion de codigo en local con hardware de gama alta de consumo: el modelo cabe en 24 GB de memoria unificada con streaming de expertos desde SSD, lo que permite ejecutar un MoE de 40B nominales en un Mac M5 Pro sin GPU dedicada.
- Asistentes de programacion con contexto de repositorio: la calibracion con trayectorias de SWE-agent y OpenHands sugiere buen comportamiento en tareas de edicion de codigo multi-paso, aunque el autor no valido sesiones agenticas largas.
- Prototipado de agentes de codigo en entornos controlados: al no tener rechazos, es util para investigar comportamientos que otros modelos bloquean, siempre con supervision humana y filtros externos.
- Experimentacion con poda de expertos MoE: el repositorio incluye scripts de poda, mascaras, estadisticas de enrutamiento y logs de evaluacion, por lo que sirve como referencia metodologica para reproducir REAP en otros MoE.
- Evaluacion de decodificacion especulativa: los datos de aceptacion del draft (0,68) y de throughput con DFlash 2 permiten comparar estrategias de aceleracion en hardware Apple Silicon.
- Despliegue en estaciones de trabajo con SSD rapido: el streaming de expertos con cache de 6 GB es el escenario para el que se optimizo el modelo, con ganancias de decodificacion de 25,4-29,3 a 30,1-30,4 tok/s sin especulacion.
- Fine-tuning ligero o investigacion sobre modelos abliterated: la licencia Apache-2.0 permite uso comercial y modificacion, aunque el formato de pesos propietario complica el reentrenamiento con toolchains estandar.

## Benchmarks y rendimiento

| Metrica | 256 expertos (original) | REAP-224 (este repo) |
|---|---|---|
| HumanEval+ pass@1, 40 tareas, greedy, razonamiento completo | 35/40 (87,5%); recuento posterior 36/40 | 35/40 (87,5%) |
| Decodificacion tok/s, DFlash 2 desactivado | 25,4 / 29,3 | 30,1 / 30,4 |
| Decodificacion tok/s, DFlash 2 activado | 30,1 / 34,5 | 36,8 / 36,8 |
| Aceptacion del draft DFlash 2 | 0,64 | 0,68 |
| KL respecto al modelo de 256 expertos en codigo y texto de agentes | — | 0,92 |
| Acuerdo top-1 con el modelo de 256 expertos | — | 78,0% |

| Poda alternativa | HumanEval+ (n=40) | Decodificacion tok/s con DFlash 2 |
|---|---|---|
| 192 expertos | 32/40 | 36,5 |
| 160 expertos | 29/40 | 38,3 |

| Mascara aplicada | KL respecto al modelo de 256 expertos | Acuerdo top-1 |
|---|---|---|
| RESMP RCO-224 | 1,49 | 68,3% |
| 224 aleatorios | 1,47 | 68,6% |
| REAP-224 (este repo) | 0,92 | 78,0% |

Todas las mediciones se hicieron en un Mac con M5 Pro y 24 GB, usando Locals con streaming de expertos desde SSD (cache de 6 GB) y DFlash 2 donde se indica. Los tok/s corresponden a 2 prompts de codigo por 2 ejecuciones de 1.024 tokens cada una. El autor advierte que el KL no es cercano a cero: cambiar solo la numerica de chunked-prefill del modelo de 256 expertos ya produce un KL de 0,42 contra si mismo. La evaluacion de 40 tareas es una comprobacion de sanidad, no una prueba de calidad equivalente, y no se probaron sesiones agenticas largas.

## Requisitos de hardware

- VRAM o memoria unificada: el repo ocupa 19,9 GB en int4; con cache de expertos de 6 GB y overhead del runtime, se recomienda al menos 24 GB de memoria unificada, como el M5 Pro de 24 GB usado en las pruebas.
- GPU recomendadas: no se documentan pruebas en GPU dedicadas. El unico hardware validado es Apple Silicon M5 Pro con 24 GB.
- GPU de consumo: no hay datos de compatibilidad con RTX 4090, RTX 3090 u otras; el formato Rec int4 no carga en llama.cpp, mlx-lm ni LM Studio, por lo que no se puede usar con las toolchains habituales de consumo.
- Opciones de despliegue: exclusivamente Locals (github.com/Generated-Computers/Locals) con streaming de expertos desde SSD; el autor indica que no carga en mlx-lm, LM Studio ni llama.cpp.
- Latencia y throughput: 30,1-30,4 tok/s sin decodificacion especulativa y 36,8 tok/s con DFlash 2 en M5 Pro de 24 GB; la aceptacion del draft es de 0,68.
- Almacenamiento: se recomienda SSD rapido, ya que el streaming de expertos desde disco es parte del diseno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | Licencia | Formato |
|---|---|---|---|---|---|
| Flint-40B-A2.5B-abliterated-REAP224-Rec-4bit (este) | 40B totales, 2,5B activos, 224 expertos | no disponible | 35/40 (n=40) | Apache-2.0 | Rec int4 propietario |
| Flint-40B-A2.5B-abliterated-Rec-4bit (base de dima6312) | 40B totales, 2,5B activos, 256 expertos | no disponible | 35/40 (n=40); 36/40 en recuento posterior | Apache-2.0 | Rec int4 propietario |
| Flint (RecursiveSI, original) | 40B totales, 2,5B activos | no disponible | no disponible | no disponible en la informacion | no disponible |
| REAP-192 (variante del mismo autor) | 40B totales, 2,5B activos, 192 expertos | no disponible | 32/40 (n=40) | Apache-2.0 | Rec int4 propietario |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje Flint.

## Limitaciones y advertencias

- La evaluacion de calidad se basa en solo 40 tareas de HumanEval+, lo que el propio autor califica de comprobacion de sanidad y no de prueba de equivalencia.
- No se probaron sesiones agenticas largas, el escenario para el que se calibro la poda.
- La poda se optimizo para codigo; otros dominios (texto no ingles, conocimiento de seguridad, matematicas) pueden degradarse mas de lo que reflejan los numeros de codigo.
- El KL de 0,92 respecto al modelo original indica divergencia no trivial en la distribucion de salida, con solo un 78,0% de acuerdo top-1.
- El comportamiento abliterated (sin rechazo) no se re-evaluo tras la poda; no hay garantia de que se mantenga igual.
- Riesgo de alucinacion: no documentado especificamente, pero es un modelo de 40B con 2,5B activos y sin evaluacion de factualidad.
- Sesgos: no documentados; el modelo solo declara ingles y no se evaluo en otros idiomas.
- Formato de pesos propietario: no carga en llama.cpp, mlx-lm, LM Studio ni TGI; solo funciona con Locals, lo que limita el despliegue en produccion y la portabilidad.
- Licencia Apache-2.0 permite uso comercial, pero el formato y la falta de soporte en toolchains estandar complican su integracion en pipelines de produccion.
- El modelo tiene 35 descargas y 0 likes en Hugging Face, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RinneCODER/Flint-40B-A2.5B-abliterated-REAP224-Rec-4bit
- Modelo base (dima6312, Rec 4-bit): https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated-Rec-4bit
- Flint original (RecursiveSI): https://huggingface.co/RecursiveSI/flint
- Paper REAP (Lasby et al., Cerebras): https://arxiv.org/abs/2510.13999
- Repositorio de investigacion (scripts, mascaras, logs): https://github.com/RINNECODER/flint-research
- Runtime Locals: https://github.com/Generated-Computers/Locals
- Dataset de calibracion codeparrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Dataset de calibracion SWE-agent: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset de calibracion OpenHands: https://huggingface.co/datasets/SWE-Gym/OpenHands-SFT-Trajectories
