# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16` es un checkpoint de aprendizaje por refuerzo (RL) obtenido mediante GRPO con OpenRLHF sobre `Qwen/Qwen3-4B-Instruct-2507`. No se trata de un modelo nuevo desde cero ni de un ajuste supervisado: el autor indica que el RL se aplicó directamente sobre el modelo base, sin semilla SFT intermedia, y que el checkpoint corresponde al paso global 18 de la ejecución de RL homónima. El repositorio declara 3.973.556.832 parámetros totales en formato safetensors, con un tamano de repo de 71,5 GB (probablemente por incluir estados de optimizador y/o checkpoints intermedios además de los pesos).

El objetivo del entrenamiento es la generacion de codigo verificable. La senal de recompensa es binaria (1,0 si el programa generado pasa los tests del problema, 0,0 en caso contrario) y el conjunto de entrenamiento se restringe a la "frontera" cobalt-train ≤2/64: 1.833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo en 2 de cada 64 muestras bajo el escaneo de dureza iid_canonical@64. Es decir, se entrena especificamente sobre problemas dificiles que el base casi nunca acierta.

La relevancia de esta ficha es acotada: es un artefacto de investigacion con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin metricas de evaluacion publicadas en el log de entrenamiento. El autor lo etiqueta como el mejor checkpoint por pass@8 de esa ejecucion hasta la fecha. Cualquier uso en produccion requeriria verificar primero la licencia del modelo base y validar el comportamiento con evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); el tag de HuggingFace incluye `nemotron_h`, no confirmado en la model card |
| Parametros totales | 3.973.556.832 (≈3,97 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card del checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card del checkpoint no la declara; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo licencia Apache 2.0 segun su propia ficha) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de ~4B parametros. Sobre esa base no se aplico un ajuste supervisado previo: la model card especifica explicitamente "no SFT seed — RL applied directly to the base model". El algoritmo de RL es GRPO (Group Relative Policy Optimization) implementado con OpenRLHF, con ventajas normalizadas por grupo y sin penalizacion KL. Se generan 8 muestras por prompt, con tamano de lote de rollout y de entrenamiento de 128 en ambos casos, un maximo de 4.096 tokens nuevos por rollout y 2 episodios de entrenamiento. La tasa de aprendizaje del actor es constante a 1e-06.

El diseno del reward incorpora dos componentes de forma: una penalizacion "stop-properly" que asigna recompensa de -1,0 a las muestras truncadas (shaping anti-truncamiento de estilo ProRL) y una penalizacion DAPO de sobrelongitud que aplica un termino aditivo creciente hasta -0,25 a las respuestas situadas en los ultimos 1.024 tokens antes del limite. La recompensa principal es binaria de correccion de codigo (pasa o no pasa los tests). El conjunto de datos es la frontera cobalt-train ≤2/64 (1.833 problemas de train y 112 de validacion), y la validacion se muestrea a temperatura 1.0. No se documentan innovaciones arquitectonicas adicionales ni cambios en el mecanismo de atencion: la novedad esta en el procedimiento de RL y en la seleccion de datos, no en la topologia del modelo.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento, optimizada para producir programas que superen suites de tests unitarios; el reward es exclusivamente de correccion binaria de codigo.
- Razonamiento orientado a problemas dificiles: el entrenamiento se restringe a problemas que el modelo base resolvia en 2 de 64 intentos como maximo, lo que orienta el comportamiento hacia casos de frontera.
- Generacion de texto general: heredada del modelo base Qwen3-4B-Instruct-2507 (pipeline declarado `text-generation`).
- Tool calling / function calling: no disponible (no se declara en la model card del checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking explicito: no disponible (no declarado en la model card de este checkpoint).
- Vision o audio: no disponible (el pipeline es exclusivamente de generacion de texto).

## Casos de uso

- Generacion de codigo en pipelines de evaluacion tipo pass@k: el checkpoint esta optimizado para maximizar pass@8 sobre problemas dificiles de la frontera cobalt-train, por lo que encaja como componente de un banco de pruebas interno que mida capacidad de resolucion de ejercicios de programacion con tests automatizados.
- Investigacion en RL para codigo: sirve como punto de comparacion reproducible frente a checkpoints intermedios de la misma ejecucion (`seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16`), gracias a que la receta GRPO, los hiperparametros y las penalizaciones estan documentados en la model card.
- Estudio del efecto del shaping anti-truncamiento: el uso de recompensa -1,0 para muestras truncadas y de la penalizacion DAPO de sobrelongitud permite analizar como el modelo aprende a "parar correctamente" en lugar de agotar el presupuesto de tokens.
- Reproduccion de experimentos con OpenRLHF: el checkpoint se puede cargar con transformers o servir con vLLM mediante `vllm serve ... --revision main`, lo que facilita integrarlo en un pipeline de RL existente para continuar el entrenamiento o reutilizarlo como inicializacion.
- Analisis de la frontera de dificultad: al haberse entrenado sobre problemas resueltos en ≤2/64 muestras por el base, es util para estudiar si el RL mejora casos marginales sin degradar el rendimiento en problemas faciles.
- Evaluacion comparativa de checkpoints por pass@8: dado que el autor lo etiqueta como el mejor checkpoint de la ejecucion por pass@8, sirve como referencia superior contra la que medir pasos posteriores o variantes de la receta.
- Docencia y divulgacion sobre RL aplicado a LLM: la combinacion de GRPO sin KL, penalizaciones de forma y reward binario de tests es un caso didactico compacto (4B parametros) para explicar el ciclo completo rollout-recompensa-actualizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion "at this checkpoint: not available in the train log". Unicamente se declara que es el mejor checkpoint de la ejecucion por pass@8, sin cifra concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en BF16/FP16 (3,97B parametros), alrededor de 4-5 GB en cuantizacion INT8 y en torno a 2,5-3 GB en INT4 (estimaciones derivadas del numero de parametros; no publicadas por el autor).
- Cache KV adicional: proporcional a la longitud de contexto efectiva y al numero de secuencias concurrentes; el valor exacto no esta disponible porque la longitud de contexto no se declara en esta ficha.
- GPU recomendadas: para BF16 sin cuantizar, una RTX 4090 (24 GB) o superior resulta holgada; A100 40/80 GB y H100 son apropiadas para servirlo en produccion con batching. Para cuantizacion INT4, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB deberian ser suficientes.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 8-12 GB o mas (con margen ajustado) y en INT4 en tarjetas de 4-6 GB en adelante.
- Opciones de despliegue: vLLM (comando documentado en la model card: `vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16 --revision main`), transformers con `AutoModelForCausalLM.from_pretrained` (revision `main`, pesos en la raiz del repo). No se confirma compatibilidad con llama.cpp, Ollama o TGI al no publicarse variantes GGUF ni plantillas de servido adicionales.
- Latencia y throughput estimados: no disponible (no se publican mediciones).
- Almacenamiento: el repositorio ocupa 71,5 GB, muy por encima de los ~8 GB de los pesos en BF16, por lo que se recomienda clonar solo el arbol `main` si no se necesitan los checkpoints auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`cobalt-seeded-rl-...`) | ≈3,97B | no disponible | Denso, RL con GRPO sobre Qwen3-4B | no disponible | Repo safetensors, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ≈4B | no disponible en esta ficha | Denso, instruct | Apache 2.0 (segun su ficha) | Ampliamente disponible |
| Qwen3-4B-Thinking-2507 | ≈4B | no disponible en esta ficha | Denso, razonamiento | Apache 2.0 (segun su ficha) | Ampliamente disponible |
| Familia Qwen2.5-Coder (3B/7B) | 3B-7B | no disponible en esta ficha | Denso, especializado en codigo | Apache 2.0 en varias variantes | Ampliamente disponible |

Nota: no se dispone de cifras de rendimiento comparativas entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. Cualquier afirmacion de superioridad en codigo requeriria una evaluacion propia con pass@k sobre el mismo conjunto de problemas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo y la evaluacion se limita a correccion binaria de codigo, sin auditoria de sesgo en texto libre.
- Riesgo de alucinacion: no evaluado en esta ficha. El entrenamiento optimiza una recompensa de paso de tests, lo que puede favorecer soluciones que superan el test sin ser semanticamente correctas o generalizables fuera del dataset de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran. Es un riesgo real para planificacion de produccion, ya que no se puede asumir soporte multilingue ni una ventana concreta.
- Licencia: el checkpoint no declara licencia. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en este repositorio introduce incertidumbre juridica para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Muy baja adopcion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente por parte de terceros.
- Sobreajuste a la frontera de dificultad: entrenado solo con 1.833 problemas que el base resolvia en ≤2/64 intentos, el comportamiento en problemas faciles o en dominios ajenos al conjunto cobalt no esta verificado.
- Penalizaciones de forma: la recompensa de -1,0 para truncamientos y la penalizacion DAPO pueden inducir respuestas innecesariamente cortas en tareas que requieran razonamiento extenso.
- Datos de evaluacion ausentes: no hay metricas de validacion publicadas en el log de entrenamiento de este paso, por lo que su condicion de "mejor por pass@8" no es verificable con los datos disponibles.
- Repositorio de gran tamano: 71,5 GB frente a los ~8 GB de pesos, lo que puede encarecer el almacenamiento y la descarga si no se filtra el arbol correcto.
- Discrepancia de etiquetado: el tag de HuggingFace incluye `nemotron_h`, que no coincide con la arquitectura declarada del modelo base Qwen3-4B; conviene tratarlo como posible error de etiquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16` (no se proporciona URL directa)
- Log local de entrenamiento (ruta indicada por el autor): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16/openrlhf_train.log`
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
