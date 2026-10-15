# fc91/Llama-3.2-3B_CQoT_AnchoredRL_20261014_public

## Resumen

`fc91/Llama-3.2-3B_CQoT_AnchoredRL_20261014_public` es un adaptador LoRA de investigación (formato PEFT sobre `safetensors`) construido sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. Lo publica el usuario `fc91` y se enmarca en una línea de trabajo experimental denominada en la propia model card "Llama3.2 verified rl pilot", orientada a explorar si el aprendizaje por refuerzo con recompensas numéricas verificables mejora la capacidad de reparar razonamientos matemáticos sin degradar la retención de respuestas directas correctas.

El problema que aborda es acotado y de investigación: el autor indica explícitamente que se trata de un adaptador experimental y que "no es un razonador matemático verificado". El entrenamiento combina REINFORCE anclado con esquema leave-one-out sobre 128 prompts de RL, 512 rollouts, 64 actualizaciones y 64 objetivos directos verificados, además de un término supervisado conjunto con peso 0.1 y un coste de log-ratio de secuencia de 0.01. La model card advierte que las recompensas numéricas no certifican demostraciones y que no debe reclamarse mejora alguna antes de una auditoría con conjunto de validación reservado.

En cuanto a relevancia práctica: el repositorio (6,8 GB) no contiene solo los pesos del adaptador, sino también estados del optimizador y del generador de números aleatorios de Torch, lo que lo convierte en un artefacto de reproducibilidad de experimentos más que en un modelo listo para producción. No tiene descargas ni valoraciones, no declara pipeline y no publica idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only auto-regresivo con Grouped Query Attention (modelo base `meta-llama/Llama-3.2-3B-Instruct`) |
| Parametros totales | No disponible para el adaptador (los pesos subidos son matrices LoRA + estados de optimizador). Modelo base: 3,21 mil millones de parametros declarados por Meta |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion del adaptador. El modelo base declara 128 000 tokens de contexto |
| Tipos de cuantizacion | No disponible en el repositorio del adaptador. El modelo base admite cuantizacion en GGUF, GPTQ, AWQ y bitsandbytes por herramientas de terceros |
| Idiomas soportados | No disponible (la model card no los declara). El modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT); el repositorio incluye ademas estados de optimizador y de RNG de Torch |
| Tamano del repositorio | 6,8 GB |
| Libreria | `peft` |
| Modelo base | `meta-llama/Llama-3.2-3B-Instruct`, revision `0cb88a4f764b7a12671c53f0838cd831a0843b95` |
| Tokenizer | `fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC`, revision `1c0a3554332b7adaa03edf51df7840aa2b7652f4` |
| Fecha de creacion (repositorio) | 2026-10-14 |
| Fecha de actualizacion (repositorio) | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se acopla a un transformer decoder-only denso de 3,21 mil millones de parametros. No introduce cambios arquitectonicos propios: hereda la pila del modelo base, incluyendo su mecanismo de atencion con cache KV agrupada y su ventana de contexto. El tokenizer declarado por el autor no es el original de Meta, sino un tokenizer alojado en el repositorio `fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC`, lo que implica que la tokenizacion usada durante el entrenamiento pudo diferir de la estandar del modelo base y debe replicarse para reproducir resultados.

El procedimiento de entrenamiento se describe como "Anchored REINFORCE leave-one-out" con 128 prompts de RL, 512 rollouts, 64 actualizaciones y 64 objetivos directos verificados. Se combina una señal de refuerzo con un termino supervisado conjunto de peso 0,1 y un coste de log-ratio de secuencia de 0,01, presumiblemente como ancla que limita la deriva respecto a la politica de referencia. El autor no documenta el numero total de tokens de entrenamiento, la composicion del corpus, ni el uso de RLHF, DPO u otras tecnicas de alineacion adicionales. Tampoco se detalla la configuracion del adaptador (rango, alpha, modulos objetivo) en la informacion disponible.

La model card incluye una advertencia metodologica relevante: las recompensas numéricas empleadas no certifican demostraciones matemáticas y no debe declararse mejora hasta que exista una auditoría sobre un conjunto reservado. El punto de carga recomendado es el commit inmutable `step064` del informe de CPU, cargando desde `resume`.

## Capacidades

- Generacion de texto conversacional en el marco del modelo base `Llama-3.2-3B-Instruct`.
- Reparacion de razonamientos matematicos (objetivo declarado del entrenamiento), sin verificacion formal: el autor niega explicitamente que el adaptador sea un razonador matematico verificado.
- Retencion de respuestas directas correctas como criterio secundario del diseno ("strict direct retention").
- Razonamiento multi-paso: no confirmado por documentacion ni benchmarks; el entrenamiento usa multiples rollouts, pero no se aportan evidencias de capacidades de agente.
- Tool calling / function calling: no disponible (no se documenta, aunque el modelo base lo soporta).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.
- Capacidades multilingues: no disponibles en la informacion del adaptador.

## Casos de uso

- Investigacion en RL con recompensas verificables: el adaptador sirve como punto de partida reproducible para estudiar si REINFORCE anclado con leave-one-out mejora la autorreparacion de cadenas de razonamiento, cargando desde el commit `resume` documentado.
- Reproducibilidad de experimentos: al incluir estados de optimizador y de RNG de Torch, permite reanudar un entrenamiento en el mismo punto estocastico, algo poco habitual en adaptadores publicados.
- Auditoria metodologica: util como caso de estudio sobre como declarar limites (recompensas numericas no equivalen a demostraciones) antes de publicar resultados de RL.
- Estudio de retencion frente a mejora: el par de metricas "genuine repair improvement" y "strict direct retention" permite analizar el compromiso entre ganar capacidad de correccion y perder respuestas directas correctas.
- Base para comparativas de adaptadores LoRA sobre modelos de ~3B: al ser un adaptador pequeno sobre un modelo denso, se puede comparar contra el modelo base sin adaptador y contra otros adaptadores de la misma familia con coste de computo reducido.
- Analisis de deriva de tokenizer: al declarar un tokenizer distinto del original de Meta, es un caso practico para medir el impacto de cambios de tokenizacion en tareas de matemáticas.
- Experimentacion docente sobre PEFT: el formato `safetensors` + `peft` permite cargar el adaptador en unas pocas lineas y estudiar el efecto del rango y del peso del termino supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, HumanEval ni de ningun otro conjunto estandar, y advierte de forma explicita que no debe reclamarse mejora alguna antes de completar una auditoria sobre datos reservados. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los unicos resultados obtenidos corresponden a herramientas de eliminacion de fondos de imagen, sin relacion con el artefacto descrito.

## Requisitos de hardware

- El adaptador por si solo es ligero (matrices LoRA), pero el repositorio ocupa 6,8 GB porque incluye estados de optimizador y de RNG; esos ficheros no son necesarios para inferencia.
- La inferencia requiere cargar el modelo base `Llama-3.2-3B-Instruct` completo mas el adaptador.
- VRAM estimada para el modelo base: ~6,5-7 GB en fp16/BF16, ~3,5-4 GB en int8 (bitsandbytes), ~2-2,5 GB en Q4_K_M mediante GGUF.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070) y con holgura en 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) para fp16.
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G son sobredimensionadas para este tamano, pero utiles si se quiere servir con lotes grandes y contexto largo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`; para GGUF hay que fusionar el adaptador y convertir con `llama.cpp` (no se distribuye GGUF en el repositorio). vLLM y TGI admiten adaptadores LoRA en caliente, aunque la compatibilidad con este adaptador concreto no esta documentada. Ollama requeriria fusion y conversion previas.
- Latencia y throughput: no disponibles. Con 3,21 mil millones de parametros y decodificacion estandar, en una RTX 4090 se situaria en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.
- El ajuste de contexto a 128 000 tokens dispara el consumo de memoria de la cache KV; con ventanas muy largas conviene cuantizar la cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados en la informacion disponible |
|---|---|---|---|---|---|
| `fc91/Llama-3.2-3B_CQoT_AnchoredRL_20261014_public` | Adaptador LoRA sobre base de 3,21 mM | No disponible (base: 128 000) | Llama 3.2 Community License | HuggingFace, 0 descargas, formato PEFT | No |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 mM | 128 000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente distribuido | Si, publicados por Meta |
| Modelos de ~3B de otras familias (Qwen2.5-3B-Instruct, Phi-3.5-mini, Gemma 2 2B) | ~2-4 mM | 32 000-128 000 tokens segun modelo | Apache 2.0, MIT o Gemma Terms segun modelo | HuggingFace | Si, publicados por sus autores |

La comparacion relevante para este artefacto no es de rendimiento bruto, sino de proposito: frente al modelo base sin adaptar, la unica diferencia documentada es que incorpora un ajuste por RL experimental cuyo efecto no ha sido auditado ni cuantificado. Cualquier comparativa de metricas seria especulativa y no se incluye.

## Limitaciones y advertencias

- El autor declara explicitamente que es un adaptador experimental y que no es un razonador matematico verificado.
- Las recompensas numericas del entrenamiento no certifican demostraciones formales; el propio autor lo advierte.
- No debe reclamarse mejora de rendimiento antes de una auditoria con datos reservados; no hay resultados publicados.
- No se documentan idiomas soportados, tamano de contexto efectivo ni configuracion del adaptador (rango, alpha, modulos).
- Riesgo de alucinacion: inherente a un modelo de 3,21 mM de parametros; no se aportan evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base y los del corpus de RL, que no se describe.
- El tokenizer declarado no es el original de Meta, por lo que una carga que use el tokenizer estandar de Llama 3.2 puede producir resultados distintos a los del experimento.
- Licencia `llama3.2`: uso comercial sujeto a la Llama 3.2 Community License, con sus clausulas de atribucion ("Built with Llama") y sus restricciones; no es una licencia permisiva tipo Apache 2.0. Cualquier producto derivado debe revisar los terminos y, en su caso, la politica de uso aceptable.
- El artefacto incluye estados de optimizador y de RNG, no solo pesos de inferencia: quien lo despliegue debe seleccionar unicamente los ficheros del adaptador.
- El repositorio no declara pipeline y registra 0 descargas y 0 valoraciones: no hay evidencia de uso independiente ni de validacion por terceros.
- Se desaconseja su uso en produccion para tareas de matematicas, salud, legal o financiero sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_AnchoredRL_20261014_public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Revision declarada del modelo base: `0cb88a4f764b7a12671c53f0838cd831a0843b95`
- Tokenizer declarado: https://huggingface.co/fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC (revision `1c0a3554332b7adaa03edf51df7840aa2b7652f4`)
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper, blog o repositorio adicional: no disponible. La busqueda web no devolvio resultados relacionados con este modelo.
