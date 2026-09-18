# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario `agurung` como parte de una línea de experimentos denominada internamente `cobalt` y no como un modelo de propósito general listo para producción. El entrenamiento se hizo con OpenRLHF aplicando GRPO directamente sobre el modelo base, sin una fase previa de SFT (supervised fine-tuning), y el checkpoint corresponde al paso global 8 de esa ejecución.

El modelo resuelve un problema muy concreto: mejorar la tasa de acierto en generación de código sobre un subconjunto de problemas que el modelo base apenas resolvía. Según la model card, el conjunto de validación se construyó con el denominado *frontier* `cobalt-train ≤2/64`, es decir, 1.833 problemas de entrenamiento y 112 de validación que el modelo base resolvía como máximo en 2 de cada 64 muestras con un escaneo de dificultad `iid_canonical@64`. La señal de recompensa es binaria: 1,0 si el programa generado pasa los tests del problema, 0,0 en caso contrario.

La relevancia de esta publicación es metodológica más que de producto: documenta una receta de RL con GRPO sobre código, con penalizaciones anti-truncamiento de estilo ProRL y DAPO, y sirve como referencia reproducible para quienes investigan RL aplicado a modelos pequeños. El checkpoint se declara como el mejor de su ejecución por `pass@8`, aunque la propia model card indica que las métricas de evaluación de este paso concreto no están disponibles en el registro de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3 (derivado de `Qwen/Qwen3-4B-Instruct-2507`); configuracion interna del repositorio no detallada |
| Parametros totales | 4.411.424.256 (4,41 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. La model card solo indica un maximo de 4096 tokens nuevos por rollout durante el entrenamiento; el modelo base `Qwen3-4B-Instruct-2507` declara 262.144 tokens de contexto en su documentacion publica, dato no verificable en este repositorio |
| Tipos de cuantizacion | No disponible. El sufijo `q4v3` del identificador forma parte del nombre de la ejecucion de RL y no se documenta como formato de cuantizacion de pesos |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card del repositorio no declara licencia; el modelo base se distribuye bajo licencia Apache-2.0 |
| Formato de pesos | safetensors (libreria declarada: transformers) |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` (tags `base_model` y `base_model:finetune`) |
| Metodo de ajuste | GRPO con OpenRLHF, sin semilla de SFT |
| Revision recomendada | `main` (el modelo esta en la raiz del repositorio, sin subcarpeta) |
| Tamano del repositorio | 17,7 GB |
| Fecha de creacion del repositorio | 2026-09-18 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de Qwen3 con 4,41 mil millones de parametros. No hay MoE, ni mecanismos de estado recurrente (SSM) ni capas hibridas. El ajuste no modifica la topologia, solo los pesos mediante RL. El repositorio no incluye un `config.json` comentado ni detalles de cabeceras de atencion, numero de capas o dimension oculta, por lo que esos datos no se pueden confirmar a partir de la informacion disponible.

El entrenamiento se realizo con **OpenRLHF** usando **GRPO** con ventajas normalizadas por grupo y **sin penalizacion KL**. La receta documentada es la siguiente: 8 muestras por prompt, tamano de lote de rollout 128, tamano de lote de entrenamiento 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, tasa de aprendizaje del actor 1e-06 con schedule constante. Se aplican dos mecanismos de modelado de recompensa: una **penalizacion por truncamiento** de estilo ProRL que asigna recompensa -1,0 a las muestras truncadas, y una **penalizacion por longitud excesiva** de estilo DAPO que resta de forma aditiva hasta -0,25 a las respuestas situadas en los ultimos 1024 tokens antes del limite. La recompensa es binaria y se calcula ejecutando los tests del problema: 1,0 si el programa pasa, 0,0 si no.

El detalle mas relevante tecnicamente es que el RL se aplico **directamente sobre el modelo base**, sin una fase de SFT intermedia. El autor lo describe como *seeded from base Qwen3-4B*. Esto implica que la optimizacion parte de una politica con una distribucion de generacion poco alineada con el formato esperado de solucion de problemas y que el modelo puede haber sufrido deriva en capacidades ajenas a la generacion de codigo. El checkpoint publicado es el paso global 8, seleccionado por ser el mejor `pass@8` de la ejecucion hasta ese momento.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento. La recompensa se define exclusivamente por la correccion funcional del programa frente a tests, no por estilo ni por explicaciones.
- Razonamiento paso a paso orientado a problemas verificables: el modelo se optimiza para producir programas completos en un unico rollout de hasta 4096 tokens nuevos.
- Generacion de texto general: heredada del modelo base, aunque la model card no aporta evaluaciones que confirmen que se conserva tras el RL.
- Instrucciones y conversacion multi-turno: capacidades preexistentes del modelo base `Qwen3-4B-Instruct-2507`; no se documenta ninguna evaluacion especifica de esta fase en el repositorio.
- Tool calling y function calling: no documentado en la model card. Se asume la herencia del modelo base, pero no hay confirmacion ni formato declarado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles. La model card no declara idiomas.
- Modo *thinking* o razonamiento extendido explicito: no documentado.
- Vision o audio: no soportado; el pipeline declarado es `text-generation`.
- Uso como politica de rollout en pipelines de RL: capacidad operativa destacable, dado que el checkpoint esta pensado para integrarse en el mismo bucle de OpenRLHF.

## Casos de uso

- Investigacion en RL para codigo: el caso de uso principal es servir como punto de comparacion reproducible en experimentos de GRPO sobre tareas de programacion verificables. El checkpoint documenta paso global, tamano de lote, tasa de aprendizaje y penalizaciones, lo que permite replicar o contrastar la receta.
- Generacion de candidatos de solucion con filtrado por tests: dado que el modelo fue optimizado con recompensa binaria de correccion y se selecciono por `pass@8`, encaja en flujos de muestreo multiple con verificacion por ejecucion de tests, donde se descartan las soluciones que no pasan y se conservan las validas.
- Generacion de datos sinteticos de codigo verificados: se puede usar para producir pares problema-solucion que pasen los tests y emplearlos despues como corpus de entrenamiento o de evaluacion para modelos mayores.
- Politica de rollout en bucles de RL propios: al estar entrenado con OpenRLHF y ser compatible con vLLM, se puede insertar como actor en un pipeline de RL que necesite un modelo pequeno y rapido que genere soluciones de hasta 4096 tokens.
- Estudio de sobreajuste a un subconjunto de dificultad: el modelo esta especializado en problemas que el modelo base resolvia en 0, 1 o 2 de 64 intentos, lo que lo convierte en un sujeto util para analizar como el RL desplaza la frontera de dificultad sin degradar el resto del dominio.
- Evaluacion comparativa de penalizaciones anti-truncamiento: la receta incluye penalizacion de recompensa -1,0 por truncamiento y penalizacion DAPO, por lo que el checkpoint permite medir el efecto de estas tecnicas frente a variantes sin ellas.
- Asistente de programacion en entornos controlados: con la cautela de que no hay licencia declarada ni evaluaciones de calidad general, podria usarse en prototipos internos de autocompletado o resolucion de ejercicios de tipo competitivo, siempre con verificacion automatica posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion de este checkpoint *no estan disponibles en el registro de entrenamiento* (`Eval metrics at this checkpoint: not available in the train log`). El unico dato de seleccion es que el checkpoint es el mejor de la ejecucion por `pass@8`, sin que se proporcione el valor numerico de esa metrica ni resultados de MMLU, HumanEval, GSM8K o conjuntos equivalentes.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No evaluado en la informacion proporcionada |
| HumanEval | No disponible | No evaluado en la informacion proporcionada |
| GSM8K | No disponible | No evaluado en la informacion proporcionada |
| `pass@8` en el conjunto de validacion `cobalt-train ≤2/64` (112 problemas) | Valor no disponible | El autor declara que este checkpoint es el mejor de la ejecucion por esta metrica, pero no publica la cifra |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8,8 GB solo para pesos (4,41 mil millones de parametros a 2 bytes), mas memoria para el contexto y el cache KV. En la practica, entre 10 y 12 GB.
- VRAM estimada en fp32: aproximadamente 17,6 GB solo para pesos. Esta cifra coincide de forma aproximada con el tamano del repositorio (17,7 GB), lo que sugiere que los pesos podrian almacenarse en precision de 32 bits; este punto no esta confirmado en la model card.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 5,5 GB.
- VRAM estimada en cuantizacion de 4 bits (por ejemplo `Q4_K_M` en GGUF): alrededor de 2,5 a 3,5 GB.
- GPU consumer compatibles: cabe en bf16 en RTX 4090, RTX 4080, RTX 3090 y RTX 4090 Laptop con margen suficiente. En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) es aconsejable cuantizacion de 8 o 4 bits. En tarjetas de 8 GB es viable solo en 4 bits y con contextos moderados.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S o A6000, todas sobredimensionadas para un modelo de 4,4 mil millones de parametros, pero utiles para servir muchas replicas o lotes grandes con vLLM.
- Opciones de despliegue: `transformers` (carga directa documentada por el autor con `revision="main"`), `vLLM` (comando `vllm serve` incluido en la model card), integracion con OpenRLHF como actor, y `text-generation-inference` (el repositorio incluye el tag correspondiente). Para `llama.cpp` u `Ollama` seria necesaria una conversion a GGUF que el autor no proporciona, por lo que no hay pesos GGUF publicados.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa y no verificada, un modelo denso de 4,4 mil millones de parametros en bf16 sobre una RTX 4090 suele moverse en el orden de decenas a algo mas de un centenar de tokens por segundo en generacion, con la advertencia de que esta cifra depende del backend, del tamano de lote y de la longitud de contexto, y no ha sido medida sobre este checkpoint.

## Comparativa con modelos similares

La comparacion se realiza con modelos de tamano y categoria equivalentes. Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado en el repositorio analizado; no hay datos de rendimiento comparables porque este checkpoint no publica resultados.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| `agurung/cobalt-...-base-q4v3` (este modelo) | 4,41 mil millones | No disponible (el base declara 262.144 tokens) | No disponible | safetensors, `main` en HuggingFace, compatible con vLLM y TGI | No disponible |
| `Qwen/Qwen3-4B-Instruct-2507` (modelo base) | 4,41 mil millones | 262.144 tokens segun documentacion publica de Qwen | Apache-2.0 | safetensors, GGUF y multiples cuantizaciones de la comunidad | No comparable directamente; este checkpoint deriva de el |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 mil millones | 128.000 tokens segun documentacion publica de Meta | Licencia comunitaria Llama 3.2 | safetensors, GGUF de la comunidad | No disponible |
| `google/gemma-3-4b-it` | 4 mil millones aproximadamente | 128.000 tokens segun documentacion publica de Google | Licencia Gemma | safetensors, GGUF de la comunidad | No disponible |

Diferencias destacables: frente al modelo base, este checkpoint incorpora un ajuste de RL orientado a correccion funcional en codigo y no declara licencia propia, mientras que el base si es Apache-2.0. Frente a Llama 3.2 3B Instruct y Gemma 3 4B Instruct, carece de evaluaciones publicadas, de soporte multimodal y de un ecosistema de cuantizaciones listas para usar, pero a cambio documenta una receta de RL reproducible con detalle inusualmente alto.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia. Aunque el modelo base es Apache-2.0, la ausencia de declaracion explicita en este derivado genera incertidumbre juridica para uso comercial. Conviene consultar al autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica. No se puede asumir soporte multilingue sin evaluacion propia.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ningun otro resultado publicado, ni siquiera el valor de `pass@8` que justifica la seleccion del checkpoint.
- Riesgo de sobreajuste al *frontier* de dificultad: el entrenamiento se concentra en 1.833 problemas que el modelo base resolvia en 0, 1 o 2 de 64 intentos. Es esperable una mejora en esa franja y un comportamiento incierto fuera de ella.
- Deriva por RL sin SFT previo: al aplicar GRPO directamente sobre el modelo base, sin semilla supervisada, existe riesgo de degradacion de capacidades conversacionales, de seguimiento de instrucciones y de formato, no evaluadas en el repositorio.
- Especializacion estrecha en correccion funcional: la recompensa binaria solo premia que los tests pasen. No optimiza legibilidad, documentacion, eficiencia algoritmica, seguridad del codigo ni adherencia a convenciones de estilo.
- Riesgo de alucinacion en codigo: como cualquier modelo generativo, puede producir APIs inexistentes, imports erroneos o dependencias inventadas. La verificacion por ejecucion de tests es imprescindible y no cubre todos los modos de fallo.
- Penalizacion por truncamiento: la asignacion de recompensa -1,0 a las muestras truncadas puede haber empujado al modelo a respuestas mas cortas de lo optimo y a abandonar prematuramente problemas largos, dado que el limite de rollout es de 4096 tokens nuevos.
- Hiperparametros poco convencionales: tasa de aprendizaje de 1e-06 constante y solo 8 pasos globales. Es un checkpoint muy temprano, no un modelo convergido y pulido.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-09-18) son posteriores a la fecha de la consulta, lo que sugiere metadatos erroneos o entornos de prueba. El sufijo `q4v3` no corresponde a una cuantizacion documentada.
- Senales de baja madurez: cero descargas y cero *likes* en el momento de la consulta, un unico autor y ninguna validacion externa conocida.
- Tamano del repositorio: 17,7 GB para 4,41 mil millones de parametros es aproximadamente el doble de lo esperado en bf16, lo que puede implicar pesos en fp32, copias duplicadas o ficheros adicionales. Conviene inspeccionar el repositorio antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de OpenRLHF (framework de entrenamiento citado en la model card): https://github.com/OpenRLHF/OpenRLHF
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3` (no se proporciona URL directa en la model card)
- Log local de entrenamiento (ruta indicada por el autor, no accesible publicamente): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_base_q4v3/openrlhf_train.log`

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (corresponden a consultas sobre Outlook y cuentas de Google) y no aportan enlaces utiles, papers ni demos adicionales. No se han encontrado publicaciones, repositorios ni articulos asociados a esta ejecucion mas alla de los enlaces anteriores.
