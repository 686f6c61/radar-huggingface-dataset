# SeanWang0027/qwen3-4b-sciworld-sft-gptoss120b-ep1

## Resumen

qwen3-4b-sciworld-sft-gptoss120b-ep1 es un ajuste fino supervisado (SFT) de Qwen3-4B, desarrollado por el usuario SeanWang0027 y publicado bajo licencia Apache 2.0. El modelo está especializado en tareas de agente dentro del entorno ScienceWorld, un banco de pruebas de razonamiento científico interactivo integrado en el framework AgentGym. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado a la investigación en agentes que ejecutan acciones textuales sobre entornos simulados.

El entrenamiento consistió en un SFT de todos los parámetros (full-parameter) sobre las 2120 tareas de entrenamiento de AgentGym ScienceWorld, usando una trayectoria generada por gpt-oss-120b con razonamiento alto para cada tarea. La pérdida se calculó sobre el contenido final del profesor y el token EOS, con learning rate 1e-5, scheduler coseno con 10 % de warmup, batch de 32 y pesos maestros en fp32 con cómputo en bf16. Se desactivó el modo thinking durante el entrenamiento.

El resultado reportado por el autor es un éxito promedio @4 del 14,1 % sobre las 200 tareas de test de AgentGym (temperatura 0,4, 30 turnos). Con 4.022.468.096 parámetros y un repositorio de 16,1 GB, el modelo es relevante como referencia para quienes investigan destilación de trayectorias de agentes desde modelos grandes (gpt-oss-120b) hacia modelos pequeños (4B) en dominios científicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de 4B parámetros. El ajuste es de parámetros completos, no LoRA ni adaptadores: se actualizan todos los pesos con pesos maestros en fp32 y cómputo en bf16. El dataset de entrenamiento son las 2120 tareas de train de AgentGym ScienceWorld, cada una con una única trayectoria generada por gpt-oss-120b en modo de razonamiento alto. La función de pérdida se aplica sobre el contenido final del profesor más el token EOS, lo que enseña al modelo a reproducir la acción y el formato de respuesta del profesor, no su cadena de razonamiento intermedia.

Los hiperparámetros declarados son learning rate 1e-5 con scheduler coseno y 10 % de warmup, batch de 32 y una sola época. El modo thinking de Qwen3 se desactiva durante el entrenamiento, de modo que el modelo resultante opera sin bloque de razonamiento explícito. No se documentan en la información disponible técnicas como RLHF, DPO, decodificación especulativa ni atención lineal; la innovación principal es el esquema de destilación de trayectorias desde un profesor de mayor tamaño.

## Capacidades

- Ejecución de acciones textuales en entornos interactivos tipo ScienceWorld (manipulación de objetos, experimentos, consultas al entorno).
- Razonamiento multi-paso dentro de episodios de hasta 30 turnos, siguiendo el formato de trayectoria ReAct implícito en los datos de SFT.
- Generación de texto y razonamiento general heredados de Qwen3-4B, aunque no evaluados ni garantizados tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card; no disponible.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas.
- Modo thinking: desactivado explícitamente durante el entrenamiento; no se declara soporte en inferencia.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en agentes sobre ScienceWorld: el modelo sirve como política base para experimentos de AgentGym, permitiendo comparar estrategias de destilación desde profesores grandes con un coste de inferencia de 4B parámetros.
- Destilación de trayectorias a pequeña escala: útil como referencia para estudiar cómo se transfiere el comportamiento de un profesor de 120B (gpt-oss-120b) a un alumno de 4B con una sola época de SFT.
- Evaluación de robustez de agentes: al tener un éxito @4 del 14,1 %, es un punto de partida para medir mejoras con RL posterior, más épocas o datos adicionales.
- Generación de datos sintéticos de interacción: el modelo puede producir trayectorias candidatas sobre tareas ScienceWorld para filtrar y reentrenar políticas más capaces.
- Reproducción de experimentos académicos: los hiperparámetros y el dataset están documentados, lo que facilita replicar el pipeline de SFT en otros entornos de AgentGym.
- Estudio de fallos en agentes científicos: con una tasa de éxito baja, es adecuado para analizar modos de error (acciones inválidas, bucles, mala interpretación del estado del entorno) en modelos pequeños.
- Base para ajuste con RL: al estar entrenado sin thinking y con pérdida solo sobre la acción final, es un candidato razonable para PPO/GRPO sobre recompensas del entorno.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AgentGym ScienceWorld test (200 tareas) | Success avg@4 (T 0,4, 30 turnos) | 14,1 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8-9 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (cuantizaciones no publicadas por el autor, requieren conversión propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue por lotes; RTX 4090, RTX 3090, RTX 4080 y GPUs con 16 GB o más para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 sin problemas; en GPUs de 12-16 GB con cuantización o con contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF, y Transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-sciworld-sft-gptoss120b-ep1 | 4,02B | no disponible | ScienceWorld / AgentGym (SFT 1 época, profesor gpt-oss-120b) | Apache 2.0 | Hugging Face |
| qwen3-1.7b-sciworld-sft-gpt54mini-3ep | 1,7B (base Qwen3-1.7B) | no disponible | ScienceWorld / AgentGym (SFT 3 épocas, profesor gpt-5.4-mini, éxito profesor 41,96 %) | no disponible en la información | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible en la información | Modelo base de propósito general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, salvo el 14,1 % de éxito del modelo descrito; el porcentaje de éxito del profesor (41,96 %) corresponde al modelo de 1,7B con otro profesor y no es directamente comparable.

## Limitaciones y advertencias

- Tasa de éxito baja: 14,1 % avg@4 en test, insuficiente para uso en producción como agente autónomo.
- Dominio muy restringido: entrenado exclusivamente sobre ScienceWorld; el comportamiento fuera de ese entorno no está validado y puede degradarse respecto al Qwen3-4B original.
- Una sola época y una sola trayectoria por tarea: riesgo de sobreajuste al estilo del profesor y de falta de diversidad en las soluciones.
- Thinking desactivado: el modelo no genera cadena de razonamiento explícita, lo que limita su interpretabilidad y su capacidad en tareas que requieren planificación larga.
- Sesgos: no documentados por el autor; al derivar de Qwen3-4B y de trayectorias de gpt-oss-120b, puede heredar sesgos de ambos.
- Alucinación: riesgo presente, especialmente en la generación de acciones no válidas para el entorno; no hay evaluación específica publicada.
- Idiomas: no declarados; el entrenamiento en ScienceWorld es en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B y los datos derivados de gpt-oss-120b deben verificarse por separado según sus propias condiciones.
- Repositorio de 16,1 GB: el tamaño es mayor de lo esperado para 4B parámetros en bf16 (unos 8 GB), lo que sugiere pesos en fp32 o artefactos adicionales; conviene revisar los ficheros antes de desplegar.
- Sin cuantizaciones oficiales, sin demo y con 0 descargas: ecosistema mínimo y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanWang0027/qwen3-4b-sciworld-sft-gptoss120b-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo relacionado (1,7B, profesor gpt-5.4-mini, 3 épocas): https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Modelo relacionado (1,7B, profesor gpt-5.4-mini, época 2): https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
