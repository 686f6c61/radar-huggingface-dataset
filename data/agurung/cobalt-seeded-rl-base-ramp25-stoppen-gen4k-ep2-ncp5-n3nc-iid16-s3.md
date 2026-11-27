# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3` es un checkpoint de aprendizaje por refuerzo (RL) derivado de `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario agurung como parte de una campana experimental de RL aplicada directamente sobre el modelo base de Qwen3-4B, sin una fase previa de SFT (supervised fine-tuning) propia. El objetivo declarado es mejorar la generacion de codigo verificable: el modelo se entrena con recompensa binaria de correccion de codigo (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario).

El checkpoint corresponde al paso global 110 de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_iid16_s3` y el autor lo identifica como el mejor hasta la fecha segun la metrica pass@8 dentro de esa ejecucion. El conjunto de entrenamiento y validacion es el denominado "cobalt-train ≤2/64 frontier": 1833 problemas de entrenamiento y 112 de validacion reservados, seleccionados porque el modelo base los resolvia como maximo en 2 de 64 muestras bajo un escaneo de dificultad iid_canonical@64.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion: no hay model card con resultados de evaluacion, no se declara licencia ni idiomas, y el nombre del repositorio codifica hiperparametros del experimento. Su interes actual reside en que documenta una receta concreta de GRPO con penalizaciones anti-truncamiento (estilo ProRL y DAPO) sobre un modelo de 4B, un tamano manejable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B; tag `nemotron_h` en Hugging Face) |
| Parametros totales | 3.973.556.832 (~3,97 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de aproximadamente 4B parametros. Sobre esa base se aplica RL directo sin semilla SFT adicional: el autor indica explicitamente "no SFT seed — RL applied directly to the base model". El algoritmo es GRPO (Group Relative Policy Optimization) con ventajas normalizadas por grupo y sin penalizacion KL, implementado con OpenRLHF.

La receta incluye varias innovaciones de shaping de recompensa orientadas a evitar respuestas truncadas y divagaciones: una penalizacion "stop-properly" que asigna recompensa -1.0 a las muestras truncadas (estilo ProRL), y una penalizacion DAPO de sobrelongitud que aplica un castigo aditivo creciente hasta -0.25 a las respuestas que caen en los ultimos 1024 tokens antes del limite. Los hiperparametros clave son 8 muestras por prompt, batch de rollout y de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, learning rate del actor de 1e-06 constante y evaluacion de validacion a temperatura 1.0. El entrenamiento se realizo sobre 1833 problemas de codigo seleccionados por dificultad (resueltos como maximo en 2 de 64 muestras por el modelo base).

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3-4B-Instruct-2507.
- Generacion de codigo con enfasis en correccion funcional verificable mediante tests, que es la senal de recompensa del entrenamiento.
- Razonamiento multi-paso orientado a resolver problemas de programacion.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (probablemente heredado del modelo base, pero no verificado).
- Capacidades de agente: no documentadas en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas figuran como no disponibles.
- Modo thinking explicito: no documentado para este checkpoint.

## Casos de uso

- Generacion de codigo verificable en pipelines de evaluacion: el modelo esta optimizado para producir programas que pasan tests, por lo que encaja en entornos de sintesis de codigo con validacion automatica (por ejemplo, generacion de funciones a partir de especificaciones y ejecucion de la suite de pruebas).
- Investigacion en RL para codigo: sirve como checkpoint de referencia para reproducir o comparar recetas GRPO con penalizaciones anti-truncamiento sobre modelos de 4B.
- Generacion de soluciones en entornos competitivos o de practica: dado su entrenamiento en problemas tipo "frontier" de dificultad calibrada, es adecuado para tareas de programacion con veredicto binario.
- Fine-tuning posterior: al ser un checkpoint de 4B en safetensors y compatible con transformers, puede usarse como punto de partida para SFT o RL adicional en dominios especificos.
- Servicio de inferencia local con vLLM: el autor documenta el comando `vllm serve`, lo que permite desplegarlo en una GPU para experimentacion y prototipado.
- Evaluacion comparativa de tecnicas de RL: util para medir el efecto de la penalizacion DAPO y ProRL frente a GRPO estandar en tareas de codigo.
- Prototipado de asistentes de programacion en local: con ~4B parametros cabe en GPUs de consumo, lo que facilita pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas de evaluacion de este checkpoint "no estan disponibles en el log de entrenamiento". El unico dato de rendimiento declarado es que se trata del mejor checkpoint por pass@8 dentro de la ejecucion, sin cifra concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4B parametros, en FP16/BF16 se requieren aproximadamente 8 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Para servicio con vLLM se recomienda una GPU con al menos 16-24 GB (por ejemplo, RTX 4090, A10, L4) para margen de contexto y concurrencia.
- GPU de consumo: previsiblemente cabe en RTX 3090/4090 y en GPUs de 12-16 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (documentado), vLLM (documentado por el autor con `vllm serve`). Otras opciones como llama.cpp, Ollama o TGI no estan documentadas para este checkpoint y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (cobalt-seeded-rl...) | ~3,97B | no disponible | RL GRPO sobre Qwen3-4B para codigo | no disponible | Hugging Face (214 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Instruct generalista | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de ~4B para codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion proporcionada: no hay benchmarks publicados de este checkpoint ni datos de rendimiento del modelo base en esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay metricas de benchmarks ni resultados de validacion en la model card, solo la afirmacion de que es el mejor checkpoint por pass@8 de la ejecucion.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay garantia de comportamiento multilingue ni de calidad fuera del ingles o del dominio de codigo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo sintacticamente plausible pero incorrecto; la senal de recompensa es binaria y no garantiza correccion fuera del conjunto de entrenamiento.
- Sesgo de dominio: entrenado exclusivamente en problemas de codigo del "cobalt-train ≤2/64 frontier", por lo que su rendimiento fuera de ese tipo de tareas puede degradarse respecto al modelo base.
- Naturaleza experimental: el nombre del repositorio codifica hiperparametros y el autor lo describe como checkpoint de una ejecucion de investigacion, no como un modelo final pulido.
- Posible sobreajuste al formato de evaluacion: la validacion se hace a temperatura 1.0 con prompts canonical clean_eval, lo que puede no reflejar el comportamiento en otros formatos de prompt.
- Contexto no confirmado: aunque el modelo base Qwen3-4B-Instruct-2507 tiene una ventana conocida, la model card no la declara para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento: Weights & Biases, proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2-ncp5-n3nc-iid16-s3` (no se proporciona URL directa)
- OpenRLHF (framework de entrenamiento): no se proporciona enlace en la informacion disponible
- Paper de GRPO, ProRL o DAPO: no se proporcionan enlaces en la informacion disponible
