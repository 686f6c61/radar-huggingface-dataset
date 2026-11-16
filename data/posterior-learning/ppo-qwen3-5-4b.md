# posterior-learning/ppo-qwen3.5-4b

## Resumen

ppo-qwen3.5-4b es un modelo multimodal de tipo image-text-to-text publicado por posterior-learning. Se trata del modelo base Qwen/Qwen3.5-4B con un adaptador LoRA fusionado en sus pesos, fruto de un entrenamiento de ajuste fino mediante PPO (Proximal Policy Optimization) orientado a tareas de agente con razonamiento por turnos. El resultado es un checkpoint completo en safetensors de 4.659.865.088 parametros (unos 4,66 mil millones), distribuido bajo la libreria transformers y con pipeline image-text-to-text.

El modelo resuelve un problema concreto: dotar a un modelo de vision-lenguaje de 4B de la capacidad de razonar y emitir acciones de una sola linea por turno dentro de entornos interactivos (episodios multi-turno). El entrenamiento se realizo sobre el conjunto suite_train de HiddenGames, con 32 episodios por actualizacion y una recompensa de 0,999^t aplicada una sola vez por episodio al alcanzar la respuesta correcta.

Su relevancia actual es acotada pero tecnica: documenta de forma transparente el proceso de fusion de un adaptador LoRA entrenado con verl PPO (rango 16, alpha 32, escala 2.0), incluyendo verificaciones de integridad de los tensores fusionados. No obstante, el run quedo pausado en el paso global 37 de los 50 planificados, por lo que se trata de un checkpoint intermedio y no de un modelo final de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (el pensamiento por turno tiene un limite de 8.192 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; el resto de formatos no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 9,3 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | PPO (action only) con LoRA fusionado |
| Modulos fusionados | 200 |
| LoRA r / alpha | 16 / 32 (escala 2.0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text, y le incorpora un adaptador LoRA entrenado con PPO. La fusion se realiza con la regla `W <- W + (lora_alpha / r) * B @ A`, es decir, con un factor de escala de 2.0, calculada en fp32 y almacenada en bf16. Se fusionaron 200 modulos LoRA; el resto de tensores (538) permanecen identicos byte a byte al modelo base, y el total de bytes de tensores coincide con el del base (9.319.737.856). Los ficheros no asociados a pesos (config, tokenizer, chat template, processor configs, generation config) son los del modelo base sin modificar.

El entrenamiento se llevo a cabo con verl (run ppo_qwen35_4b_turn, configuracion scripts/rl/train/ppo_qwen35_4b_turn.yaml) sobre el conjunto suite_train de HiddenGames, con 32 episodios por actualizacion y una tasa de aprendizaje de 1e-5 para el LoRA. La dinamica es de un turno con razonamiento y una accion: en cada turno el modelo "piensa" hasta un maximo de 8.192 tokens y escribe una unica linea de accion. La recompensa es de 0,999^t al alcanzar la respuesta correcta (penalizando el numero de turnos t) y 0 en caso contrario, aplicada una vez por episodio. El adaptador corresponde al paso global 37 de los 50 planificados, ya que el run se pauso; el sha256 del adaptador es `dfb9d21b9ec218c3681b8858f5c3fa8f9067656ba111c1cae7ee9b2a3af3d1cd` y la referencia de orden de evidencias es 672cf91 (pack-v63-672cf91). El run de W&B es ojjfux3f, del proyecto pro-worlds-pl-suite, ejecutado en Server11 el 15 de noviembre de 2026.

## Capacidades

- Generacion de texto y razonamiento por turnos: el modelo produce un bloque de pensamiento (hasta 8.192 tokens) seguido de una linea de accion por turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas multimodales de imagen y texto.
- Razonamiento orientado a agentes: disenado especificamente para entornos interactivos de tipo episodio, con decision de accion en cada paso.
- Razonamiento multi-paso: la recompensa penaliza el numero de turnos, incentivando resoluciones eficientes.
- Conversacion: etiquetado como conversational.
- Compatibilidad con endpoints: marcado como endpoints_compatible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: si, con un tope explicito de 8.192 tokens de razonamiento por turno.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a agentes: el modelo sirve como referencia reproducible de un pipeline PPO con verl y fusion de LoRA, util para estudiar la dinamica de recompensa 0,999^t y el efecto de la penalizacion por turnos en la eficiencia de resolucion.
- Evaluacion de entornos interactivos tipo HiddenGames: adecuado para experimentar con tareas que requieren razonamiento visual y textual seguido de una accion concreta por turno, gracias a su naturaleza image-text-to-text.
- Prototipado de agentes con razonamiento explicito: el bloque de pensamiento de hasta 8.192 tokens permite auditar la cadena de razonamiento antes de la accion, util en entornos de investigacion donde se requiere trazabilidad.
- Experimentos de eficiencia de turnos: la recompensa decreciente con t (0,999^t) lo convierte en candidato para estudiar politicas que minimizan el numero de pasos hasta la solucion.
- Base para ajustes posteriores: al ser un checkpoint intermedio (paso 37 de 50) con LoRA fusionado, sirve como punto de partida para continuar el entrenamiento o comparar con el modelo base Qwen3.5-4B.
- Benchmarking de fusion de LoRA: util para validar metodologias de merge (escala 2.0, fp32 a bf16) y verificar que los tensores no fusionados permanecen identicos al base.
- Analisis de robustez multimodal en agentes: permite estudiar como un modelo de 4,66 B gestiona entradas de imagen y texto en tareas de decision secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (9,3 GB de repositorio), se requiere aproximadamente 10-12 GB de VRAM solo para los pesos; en cuantizacion de 8 bits, alrededor de 6-7 GB; en 4 bits, alrededor de 3-4 GB (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: para bf16 sin cuantizar, GPU con 16 GB o mas (RTX 4080/4090, A100, H100). Para cuantizacion de 4 bits, GPU consumer de 8 GB podrian ser suficientes en teoria, aunque el pipeline image-text-to-text anade overhead de memoria por el procesador de vision.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) sin cuantizar con margen; en GPUs de 8-12 GB probablemente solo con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); endpoints_compatible sugiere compatibilidad con endpoints de inferencia. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El razonamiento por turno de hasta 8.192 tokens incrementa la latencia por accion de forma significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| posterior-learning/ppo-qwen3.5-4b | 4,66 B | No disponible (pensamiento 8.192 tokens) | Image-text-to-text | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4 B (segun modelo base) | No disponible | Image-text-to-text | No disponible | Hugging Face (modelo base) |
| Alternativas de ~4B con ajuste RL | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye otros modelos de referencia con los que contrastar parametros, contexto o rendimiento. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se pauso en el paso global 37 de los 50 planificados, por lo que el modelo no representa el resultado final del run.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier uso en produccion.
- Idiomas no especificados: no hay informacion sobre cobertura multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo, es esperable, pero no hay evaluaciones publicadas.
- Sesgos: no documentados en la informacion proporcionada.
- Diferencias por fusion en bf16: el autor advierte que las salidas pueden diferir ligeramente respecto a base + adaptador en tiempo de ejecucion, debido al redondeo de la fusion.
- Especializacion estrecha: el ajuste PPO se realizo sobre suite_train (HiddenGames) con una dinamica de accion de una linea por turno; su comportamiento fuera de ese dominio no esta validado.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.
- Contexto total no confirmado: solo se documenta el tope de 8.192 tokens para el pensamiento por turno, no la ventana de contexto completa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/ppo-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Run de W&B: proyecto pro-worlds-pl-suite, run ojjfux3f (no se proporciona URL directa)
- Configuracion de entrenamiento: scripts/rl/train/ppo_qwen35_4b_turn.yaml (referencia interna, sin URL publica en la informacion disponible)
- Referencia de evidencias: 672cf91 (pack-v63-672cf91)
