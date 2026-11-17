# brownyeyez/adapter-agent-1

## Resumen

`adapter-agent-1` es un adaptador LoRA desarrollado por el usuario brownyeyez sobre el modelo base Qwen/Qwen3.5-9B, publicado en el contexto del reto Zalo AI Challenge 2026 y del proyecto DataMate. Se trata de un adaptador especializado en la ruta de razonamiento (pass1) de un agente que genera codigo Python con trazas de pensamiento, es decir, un componente de un pipeline mayor orientado a tareas de agente con generacion de codigo y sujecion a herramientas.

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) directamente desde el modelo base, con una configuracion LoRA de rango 64, alpha 128 y cobertura all-linear. El entrenamiento es deliberadamente corto (46 pasos, equivalente a una epoca sobre 48 prompts con 4 rollouts cada uno), lo que lo convierte en un experimento de ajuste fino mas que en un modelo de proposito general. La recompensa combina la evaluacion de la respuesta con una penalizacion por longitud excesiva y un limite de tres turnos de interaccion.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de como aplicar RL (GRPO) sobre un modelo de 9B para especializarlo en una ruta concreta de un agente, y su integracion documentada con vLLM multi-LoRA permite desplegarlo junto a otros adaptadores del mismo pipeline sobre una unica instancia del modelo base. El idioma declarado es vietnamita y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 9B en su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | 64 / 128, all-linear |
| Tamano del repositorio | 0.3 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer denso, mediante LoRA con rango 64, alpha 128 y modulos all-linear. No se modifica la arquitectura del modelo base: el adaptador anade matrices de bajo rango en las capas lineales, lo que permite cargarlo y descargarlo dinamicamente en un servidor de inferencia.

El entrenamiento se realizo con GRPO directamente desde el modelo base, usando Megatron, durante 46 pasos (una epoca) sobre 48 prompts con 4 rollouts por prompt, con tasa de aprendizaje 1e-5. La funcion de recompensa combina la puntuacion de la respuesta (cham dap an, evaluacion del resultado) con una penalizacion por respuestas demasiado largas, y el agente opera con un maximo de tres turnos. El adaptador esta pensado para invocarse con `enable_thinking=True`, lo que activa la ruta de razonamiento del modelo base. No se detalla la composicion del dataset de entrenamiento ni si hubo fases adicionales de SFT o DPO.

## Capacidades

- Generacion de codigo Python con razonamiento explicito (ruta `think`), orientada a la resolucion de tareas de agente.
- Ejecucion de un bucle de agente de hasta tres turnos, con evaluacion intermedia de resultados.
- Soporte de tool calling y uso de herramientas dentro del pipeline DataMate (rutas store, tool, pass1, pass0, tvote).
- Razonamiento multi-paso acotado por el limite de turnos y por la penalizacion de longitud.
- Capacidad multilingue limitada al vietnamita segun la model card.
- Integracion con vLLM mediante multi-LoRA, permitiendo servir varios adaptadores sobre un mismo modelo base.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Agente de generacion de codigo con razonamiento: el adaptador se invoca con `enable_thinking=True` para que el modelo produzca trazas de pensamiento antes del codigo Python, util en entornos donde se necesita auditar el razonamiento del agente.
- Pipeline de competicion o evaluacion tipo Zalo AI Challenge: sirve como componente pass1 dentro de un flujo con multiples rutas (parser, agent, think) desplegado sobre una sola instancia de vLLM con multi-LoRA.
- Prototipado de agentes con tool calling: al integrarse en el pipeline DataMate, permite experimentar con llamadas a herramientas y evaluacion de resultados en un bucle de hasta tres turnos.
- Servicio multi-tenant de bajo coste: cargar varios adaptadores LoRA (parser, agent-0, agent-1) sobre un unico Qwen3.5-9B reduce el coste de VRAM frente a desplegar un modelo completo por tarea.
- Investigacion en RL para agentes: la configuracion GRPO documentada (48 prompts, 4 rollouts, recompensa con penalizacion de longitud) es un punto de partida reproducible para estudiar el efecto del ajuste por refuerzo en tareas de codigo.
- Filtrado y evaluacion de respuestas de agente: la ruta pass1 puede emplearse para generar y puntuar soluciones candidatas antes de seleccionar la final en un pipeline de votacion (tvote).
- Entornos educativos de habla vietnamita: generacion asistida de codigo Python con explicaciones en vietnamita para estudiantes o desarrolladores junior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; depende del modelo base Qwen3.5-9B. Como referencia orientativa para un transformer denso de 9B, en FP16 se requieren aproximadamente 18-20 GB solo para pesos, y en cuantizacion de 4 bits alrededor de 5-6 GB, mas overhead de contexto y KV cache. Estas cifras son estimaciones generales, no datos publicados para este adaptador.
- El adaptador LoRA en si ocupa 0.3 GB y se suma a la memoria del base.
- GPU recomendadas: A100 o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) es viable en FP16 para el base, y GPUs consumer de 8-12 GB podrian servir con cuantizacion, aunque no hay datos publicados que lo confirmen.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 128 --max-loras 3` y los modulos `parser`, `agent` y `think`, tal como documenta el autor. Tambien es compatible con el ecosistema PEFT (carga del adaptador sobre el base).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adapter-agent-1 (este) | LoRA sobre base 9B | no disponible | Adaptador LoRA para agente de codigo | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Modelo denso generalista | no disponible en la informacion | Hugging Face |
| adapter-agent-0 (mismo autor) | LoRA sobre base 9B | no disponible | Adaptador LoRA (ruta agent) | Apache 2.0 (segun repo) | Hugging Face |
| adapter-parser (mismo autor) | LoRA sobre base 9B | no disponible | Adaptador LoRA (ruta parser) | Apache 2.0 (segun repo) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos adaptadores ni frente a alternativas de otros autores.

## Limitaciones y advertencias

- Entrenamiento muy corto (46 pasos, 48 prompts): el adaptador puede sobreajustar al conjunto de entrenamiento y generalizar mal fuera de la distribucion de las tareas del reto.
- El alcance funcional esta limitado a la ruta pass1 del pipeline DataMate; no es un modelo de proposito general.
- Idioma declarado unicamente vietnamita; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Requiere invocarse con `enable_thinking=True` para la ruta prevista; su comportamiento sin esa opcion no esta descrito.
- Limite de tres turnos en el bucle de agente, lo que restringe tareas que requieran mas iteraciones.
- Riesgo de alucinacion en la generacion de codigo y en las llamadas a herramientas, sin datos publicados sobre tasas de error.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Qwen3.5-9B para uso comercial.
- Sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados: no hay evidencia externa de calidad.
- El repositorio no declara pipeline de inferencia ni datos de evaluacion, lo que dificulta su validacion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brownyeyez/adapter-agent-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptadores relacionados del mismo autor: https://huggingface.co/brownyeyez/adapter-agent-0 y https://huggingface.co/brownyeyez/adapter-parser
- Repositorio DataMate (rama `release`, script `predict.sh`): no disponible como URL en la informacion proporcionada
- Paper o blog de GRPO: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
