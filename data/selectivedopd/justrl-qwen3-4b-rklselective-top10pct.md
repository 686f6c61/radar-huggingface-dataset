# SelectiveDOPD/JustRL-Qwen3-4b-RKLSelective-Top10pct

## Resumen

JustRL-Qwen3-4b-RKLSelective-Top10pct es un ajuste fino derivado de la familia Qwen3, concretamente sobre una base de 4B, publicado por el usuario SelectiveDOPD en HuggingFace. El repositorio se describe como la subida del run `justrl_qwen3_4b_rkl_ladder_90_100_kl`, dentro de los experimentos denominados BiDirect-OPD. Por el nombre se deduce que se trata de un modelo sometido a un proceso de aprendizaje por refuerzo (RL) con algun tipo de regularizacion KL selectiva aplicada sobre un subconjunto de tokens (top 10 %), aunque la model card no documenta el procedimiento con detalle.

El modelo cuenta con 4.411.424.256 parametros reales, confirmados en los pesos safetensors, y se distribuye en formato transformers con pipeline de generacion de texto y soporte declarado para text-generation-inference y endpoints compatibles. El repositorio ocupa 26,5 GB e incluye una rama `main` correspondiente al `global_step_300`, ademas de 14 ramas adicionales con checkpoints intermedios cada 20 pasos (de `global_step_20` a `global_step_280`), lo que lo convierte en un artefacto util para estudiar la evolucion del entrenamiento por RL mas que para uso directo en produccion.

Su relevancia es limitada y muy especializada: no presenta descargas ni likes, no incluye licencia declarada, no documenta idiomas ni resultados de evaluacion, y la informacion de la model card se reduce a la lista de checkpoints. Debe considerarse un modelo de investigacion experimental, no un modelo listo para despliegue comercial sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3; no se detalla configuracion en la model card) |
| Parametros totales | 4.411.424.256 (≈4,41 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE; el sufijo 4b de Qwen3 corresponde a un modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; no confirmada en la model card |
| Tipos de cuantizacion | No disponible; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la especifica) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 26,5 GB |
| Ramas publicadas | `main` (`global_step_300`) mas 14 checkpoints intermedios (`global_step_20` a `global_step_280`, cada 20 pasos) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. El identificador indica que el modelo parte de una base Qwen3 de 4B parametros, lo que implica una arquitectura transformer densa con mecanismos habituales de dicha familia (atencion con query-key normalization y agrupacion de cabezas KV segun la generacion Qwen3), aunque esto no se confirma documentalmente en el repositorio y debe verificarse inspeccionando los ficheros de configuracion del modelo.

Respecto al entrenamiento, la unica informacion disponible es el nombre del run (`justrl_qwen3_4b_rkl_ladder_90_100_kl`) y la referencia a los experimentos BiDirect-OPD. De ahi se deduce un post-entrenamiento mediante aprendizaje por refuerzo con una penalizacion KL aplicada de forma selectiva; el sufijo "Top10pct" sugiere que la regularizacion se calcula sobre el 10 % de tokens con mayor relevancia en algun criterio, y "ladder_90_100" apunta a una programacion progresiva de la restriccion. El numero de tokens de entrenamiento, la composicion del dataset, el algoritmo de RL concreto (PPO, GRPO u otro) y la existencia de fases previas de SFT o DPO no estan documentados y figuran como no disponibles. La presencia de checkpoints cada 20 pasos hasta el paso 300 permite, en cambio, analizar la trayectoria de optimizacion, utilidad principal de este repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno: la etiqueta `conversational` y el pipeline `text-generation` confirman soporte de dialogos, sin detalle sobre calidad o formato de plantilla.
- Razonamiento y tareas de tipo instruccion: previsible por herencia de la base Qwen3, pero no verificado ni documentado en este repositorio.
- Generacion de codigo y matematicas: no confirmado explicitamente; debe validarse con pruebas propias.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se indica activacion de modo de razonamiento explicito ni modalidades adicionales.
- Integracion con infraestructura: declarado compatible con text-generation-inference y con endpoints compatibles con la API de HuggingFace.

## Casos de uso

- Investigacion sobre regularizacion KL selectiva en RL: el repositorio incluye checkpoints cada 20 pasos hasta el paso 300, lo que permite trazar la evolucion de la politica y medir el efecto de la restriccion sobre el subconjunto de tokens objetivo.
- Analisis de estabilidad del entrenamiento por RL: comparar los 15 checkpoints publicados ayuda a detectar colapso de la politica, deriva de la distribucion de salida o degradacion de la perplejidad a lo largo del run.
- Reproducibilidad de experimentos BiDirect-OPD: sirve como referencia concreta de un run `ladder_90_100` para contraste con otras variantes del mismo grupo de experimentos.
- Fine-tuning posterior sobre dominio especifico: al ser un modelo de 4,41B en safetensors, es viable aplicar SFT adicional con recursos modestos y comparar frente a la base sin RL.
- Evaluacion academica de tecnicas de RLHF/RLVR: punto de partida para medir si el ajuste por refuerzo preserva capacidades base en tareas de razonamiento, codigo o matematicas.
- Pruebas de inferencia en entornos de investigacion: desplegable con transformers o text-generation-inference para experimentos internos donde no se requiere licencia comercial ni garantias de soporte.
- Generacion de texto en prototipos no criticos: util como sustituto economico de modelos mayores en fases tempranas de desarrollo, siempre tras validar comportamiento y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio no cuenta con descargas ni evaluaciones de terceros. Cualquier cifra de rendimiento debera obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para pesos (calculada a partir de los 4,41B parametros; son estimaciones, no datos publicados):
  - FP32: en torno a 17,6 GB solo para pesos.
  - BF16/FP16: en torno a 8,8 GB.
  - INT8/FP8: en torno a 4,4 GB.
  - INT4 (GPTQ, AWQ o GGUF Q4_K_M): en torno a 2,5 a 3 GB.
- Hay que anadir a esas cifras el KV cache y las activaciones. Con contextos largos el KV cache puede suponer varios gigabytes adicionales; no se dispone de la configuracion de atencion del modelo para calcularlo con precision.
- GPU recomendadas:
  - RTX 4090 (24 GB), A6000 (48 GB), L40S (48 GB): ejecucion en BF16 con margen para contextos medios y lotes pequenos.
  - A100 (40/80 GB) y H100 (80 GB): despliegue con vLLM o TGI, lotes concurrentes y contextos largos.
  - RTX 3090/4080 (16-24 GB): BF16 viable en configuracion ajustada; INT8 o INT4 mas comodo.
- Cabe en GPU de consumo: si. En 4 bits entra con holgura en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060); en 8 bits requiere 8-10 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); en BF16 conviene disponer de 12 GB o mas.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta explicita), vLLM y SGLang (compatibles con safetensors de Qwen3, requieren validacion). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuracion de referencia.
- Nota: el repositorio ocupa 26,5 GB, muy por encima de lo que ocuparian los pesos en BF16 (unos 8,8 GB). Es probable que el espacio se deba a las multiples ramas de checkpoints o a estados de optimizador incluidos; conviene revisar el contenido antes de descargar el repositorio completo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales conocidas. Los datos de las alternativas proceden de informacion publica general de cada familia y no han sido verificados en el contexto de esta busqueda; deben confirmarse antes de usarse en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| JustRL-Qwen3-4b-RKLSelective-Top10pct | 4,41B | No disponible | No disponible | HuggingFace, 0 descargas | No disponible |
| Qwen3-4B (base) | ~4,4B | 32k nativo, ampliable con YaRN | Apache-2.0 (segun la familia Qwen3) | Ampliamente distribuido | No disponible para este fine-tune |
| Qwen2.5-3B / 7B | 3,1B / 7,6B | 32k nativo, ampliable | Apache-2.0 en la mayoria de tamanos | Ampliamente distribuido | No comparable sin evaluacion |
| Llama-3.2-3B-Instruct | 3,2B | 128k | Llama 3.2 Community License | Ampliamente distribuido | No comparable sin evaluacion |
| Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Ampliamente distribuido | No comparable sin evaluacion |

La diferencia principal frente a las alternativas no es de rendimiento, sino de naturaleza del artefacto: este repositorio es un resultado experimental con checkpoints intermedios, sin licencia declarada y sin evaluacion publicada, mientras que las alternativas son modelos con licencia explicita, documentacion completa y ecosistema de herramientas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni comparaciones con la base Qwen3-4B. Se desconoce si el ajuste por RL ha degradado capacidades previas.
- Licencia no declarada: al no especificarse licencia, no puede asumirse uso comercial permitido. La licencia del modelo base tampoco se menciona en la model card; debe confirmarse con el autor antes de cualquier uso productivo.
- Riesgo de alucinacion: no medido. Los modelos ajustados por RL sobre objetivos de recompensa pueden aumentar la confianza en respuestas incorrectas si la senal de recompensa no penaliza la veracidad.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas, asi como la calidad de la tokenizacion multilingue.
- Longitud de contexto desconocida: no se confirma la ventana efectiva ni si se ha aplicado extension de contexto. Planificar despliegues con contextos largos sin validar previamente.
- Sesgos: no documentados ni evaluados. No hay informacion sobre composicion del dataset de RL ni sobre filtros aplicados.
- Trazabilidad limitada: se desconoce el procedimiento de entrenamiento exacto, los hiperparametros, la funcion de recompensa y el algoritmo de RL utilizado. La descripcion del metodo debe inferirse del nombre del run.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay evidencia de uso por terceros ni de mantenimiento.
- Consumo de disco: 26,5 GB de repositorio para un modelo de 4,41B. Verificar el peso real de los ficheros y descargar solo la rama necesaria.
- Advertencia para produccion: no deberia desplegarse en entornos de cara al usuario sin una evaluacion propia de calidad, seguridad y sesgos, y sin una confirmacion explicita de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-4b-RKLSelective-Top10pct
- Repositorio del modelo base Qwen3 (referencia de familia): no disponible en la informacion proporcionada
- Paper o documentacion tecnica del metodo BiDirect-OPD o JustRL: no disponible
- Blog o informe de entrenamiento: no disponible
- Demo o espacio asociado: no disponible
- Resultados de benchmarks: no disponibles
