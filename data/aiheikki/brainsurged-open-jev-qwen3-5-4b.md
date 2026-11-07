# AIHeikki/brainsurged-open-jev-qwen3.5-4b

## Resumen

Brainsurged Open-Jev Qwen3.5-4B es un ajuste fino del modelo base Qwen/Qwen3.5-4B (4.659.865.088 parámetros, licencia Apache-2.0) desarrollado por AIHeikki. El modelo está especializado en tareas de decisión con salida JSON restringida (constrained-JSON decision tasks), es decir, clasificación y enrutamiento estructurado en lugar de generación de texto libre. Se distribuye principalmente como GGUF cuantizado Q4_K_M (2,59 GiB) para su uso con Ollama y llama.cpp.

La intervención combina dos etapas: un LoRA sintético de rango 16 entrenado sobre 1.320 ejemplos contrafactuales de estado/objetivo, y una calibración posterior sin gradientes ("Zero-Gradient Roof Calibration") que aplica resta de prior nulo, escalado de temperatura inversa y verificación de bucles `<think>`. El autor lo presenta como un "estudio de ingeniería de pesos abiertos" de cinco rondas, con artefactos archivados de las versiones v1 a v4.

Es relevante para desarrolladores que necesitan un motor de decisión ligero, desplegable en hardware modesto, con salida JSON estricta y compatibilidad con la API de OpenAI a través de llama-server. No es un modelo de propósito general ni un modelo conversacional de alta calidad; su valor está en la fiabilidad del formato estructurado en tareas acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; incluye componentes GatedDeltaNet y conv1d segun el stack de serving del autor) |
| Parametros totales | 4.326.350.848 (safetensors); la model card cita 4.659.865.088 para el base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (artefacto principal); el repo incluye tambien GGUFs de 0.8B y 4B en el stack de serving |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (principal), safetensors (parches delta quirurgicos/LoRA v1-v4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4.300 millones de parámetros. Sobre esa base se aplica un LoRA de rango 16 entrenado con 1.320 ejemplos sintéticos de estado/objetivo contrafactuales, durante 2 épocas y 166 pasos de AdamW, lo que supone 27,9 millones de escalares de adaptador (0,6113 % del total). El entrenamiento del adaptador duró 13,3 minutos dentro de una campaña de 33,2 minutos en una NVIDIA A100-40GB en modalidad Spot, con un coste reportado de aproximadamente 0,84 dólares para esa fase.

La segunda etapa es una calibración cerrada sin gradientes (`torch.set_grad_enabled(False)`) que resta un prior de esqueleto nulo (alpha_prior = 0,45), aplica escalado de temperatura inversa (beta_temp = 0,85) y verifica el cierre de bucles `<think>` (0,0 % de bucles sin cerrar en las comprobaciones de calibración). El autor indica que no se encontraron coincidencias exactas de cadena contra 214 cadenas de retención, aunque aclara que esto no constituye una auditoría semántica ni de contaminación de preentrenamiento. El stack de serving propio (serving_v5) incorpora decodificación JSON por salto de trie de tokens BPE y clonado de prefijos KV con 6 ranuras inmutables.

## Capacidades

- Generación de JSON estructurado y restringido por esquema (response_format con json_schema en llama-server).
- Clasificación y enrutamiento de decisiones: intención de compra, urgencia, asignación de equipo, despacho de microrred, rescate y casos de negocio.
- Modo "System-1" sin razonamiento (enable_thinking: false, reasoning_budget 0) para respuestas directas y de baja latencia.
- Modo "Micro-Blink" con presupuesto de razonamiento compacto (reasoning_budget 128) para tareas que requieren un paso intermedio de pensamiento.
- Compatibilidad con la API de OpenAI a través de llama-server y con Ollama.
- Soporte de plantilla Jinja y control por petición de parámetros de chat template.
- Capacidades multilingües: no disponibles (no se documentan).

## Casos de uso

- Triaje de atención al cliente: el modelo recibe el texto del cliente y devuelve un JSON con intención de compra, urgencia y equipo asignado, tal como muestra el ejemplo de la model card con la factura duplicada. Adecuado por su salida estricta y su latencia baja en modo sin razonamiento.
- Enrutamiento de tickets en helpdesk: clasificación automática en categorías cerradas (ventas, soporte, facturación, otros) mediante esquema JSON, integrable en un pipeline de gestión de incidencias.
- Despacho de microrred (Microgrid): el autor incluye casos con referencia exacta de programación dinámica, orientados a decidir acciones de despacho energético bajo restricciones. Adecuado para entornos de simulación y evaluación de políticas.
- Decisiones de negocio acotadas: evaluación de estados y objetivos con salida estructurada para sistemas de reglas o motores de decisión que consumen JSON.
- Escenarios de rescate (Rescue): clasificación y priorización de situaciones bajo un esquema predefinido, útil en sistemas de apoyo a la decisión.
- Despliegue en local o en dispositivos modestos: al ocupar 2,59 GiB en Q4_K_M, puede ejecutarse con Ollama en estaciones de trabajo sin GPU dedicada de gama alta, sirviendo como motor de decisión embebido.
- Evaluación comparativa de técnicas de edición de pesos: los parches delta y los informes internos permiten reproducir el estudio de "weight-space programming" con fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en cuatro tipos de tarea de Jevlab (Customer, Business, Rescue y Microgrid) sobre Cloud Run NVIDIA L4 con Q4_K_M, pero los registros completos no se incluyen en la información proporcionada. Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput verificables para Ollama o llama.cpp local; el autor advierte explícitamente que los tiempos de Round-5 corresponden a su stack propio y no a benchmarks de dispositivos locales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6-3,5 GiB para el GGUF Q4_K_M en inferencia; el repo completo ocupa 11,3 GB por incluir múltiples artefactos y parches.
- GPU recomendadas: NVIDIA A100-40GB (usada en el entrenamiento), NVIDIA L4 (usada en las evaluaciones de serving del autor); cualquier GPU con al menos 4-6 GiB de VRAM libre es suficiente para Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GiB o más (RTX 3060, RTX 4060, RTX 4070 y superiores). También puede ejecutarse en CPU con llama.cpp u Ollama, con mayor latencia.
- Opciones de despliegue: Ollama (`ollama run hf.co/AIHeikki/brainsurged-open-jev-qwen3.5-4b`), llama.cpp (`llama-server` con `--jinja`, `--flash-attn on`, `--gpu-layers 99`), y el stack propio serving_v5 (libjev_jump.so + fast_gateway.py) con Docker.
- Latencia y throughput: no disponibles de forma verificable; los datos de Round-5 corresponden al stack personalizado sobre L4 y no son extrapolables a Ollama ni a hardware local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brainsurged Open-Jev Qwen3.5-4B | ~4,3B | no disponible | Decision JSON restringida | Apache-2.0 | GGUF en HF, Ollama |
| AlexWortega/openjev | no disponible | no disponible | Familia Jev de decision | no disponible | Hugging Face |
| jaredpalmer/kev | pequenos (familia) | no disponible | Modelos de decision tipo Jev sobre Qwen3.5/Qwen3.8 | no disponible | GitHub, pesos preentrenados |

La comparación cuantitativa de rendimiento no está disponible: ninguno de los proyectos citados publica en la información recogida métricas comparables de MMLU, HumanEval o GSM8K. La diferencia principal frente a openjev y kev es que Brainsurged documenta con detalle el proceso de edición de pesos (LoRA sintético más calibración sin gradientes) y publica artefactos intermedios v1-v4.

## Limitaciones y advertencias

- Modelo altamente especializado: no está pensado para generación de texto libre ni conversación general; su rendimiento fuera de tareas de decisión JSON es incierto.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B hereda los sesgos del modelo base, no auditados en esta ficha.
- Riesgo de alucinación: presente en cualquier modelo de 4B; la salida restringida por esquema reduce el riesgo de formato inválido, pero no garantiza la corrección semántica de los valores.
- La verificación de contaminación es limitada: el autor solo comprobó coincidencias exactas contra 214 cadenas de retención y advierte que no es una auditoría semántica ni de preentrenamiento.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no especificada; no se debe asumir la ventana del modelo base sin verificación.
- Los datos de coste (0,84 dólares por fase, ~15 dólares en total) son parciales y no representan el coste de reproducción completo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda validar el comportamiento en el dominio propio antes de producción.
- El repo incluye artefactos de varias versiones; es necesario especificar el nombre exacto del GGUF al descargar para evitar confusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/brainsurged-open-jev-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- AlexWortega/openjev: https://huggingface.co/AlexWortega/openjev
- jaredpalmer/kev (GitHub): https://github.com/jaredpalmer/kev
