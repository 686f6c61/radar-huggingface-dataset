# Graph-COM/TurnGate-Reweight-SFT

## Resumen

TurnGate-Reweight-SFT es un modelo de clasificación de seguridad conversacional desarrollado por el grupo Graph-COM. Se trata de un ajuste fino (fine-tuning) supervisado del modelo Qwen3-4B-Instruct-2507, especializado en decidir si una respuesta candidata del asistente debe entregarse al usuario (PASS) o bloquearse (BLOCK) en el contexto de una conversación multi-turno. A diferencia de los clasificadores de seguridad tradicionales que evalúan un único mensaje, este modelo analiza el historial completo de la conversación, la consulta actual del usuario y la respuesta candidata del asistente de forma conjunta.

El modelo resuelve un problema concreto en el ámbito de la seguridad de LLM: la intención maliciosa que se construye de forma gradual a lo largo de múltiples turnos, donde cada turno individual parece benigno pero el conjunto revela un propósito dañino. La aproximación se denomina "response-aware" porque la decisión se toma evaluando la respuesta que el modelo va a generar, no solo la consulta del usuario, lo que permite detectar fugas de contenido dañino antes de que lleguen al usuario.

Con 4.022 millones de parámetros (aproximadamente 4B) y un formato de pesos completo en BF16 y safetensors, el modelo está diseñado para integrarse como una capa de defensa en pipelines de despliegue de asistentes conversacionales. Su licencia Apache 2.0 y su tamaño contenido lo hacen viable en hardware de consumo, aunque su propósito es estrictamente de investigación y monitorización, no de generación de respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 (aproximadamente 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la información) |
| Tipos de cuantización | No disponible (pesos publicados en BF16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, pesos completos) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4B parámetros. El entrenamiento se realizó mediante supervisión a nivel de turno (turn-level supervised fine-tuning) con un objetivo reweighted, diseñado explícitamente para corregir el desequilibrio entre las decisiones de pasar (PASS) y bloquear (BLOCK) prefijos de diálogo. Según la model card, esta ponderación aborda la asimetría en la distribución de etiquetas del conjunto de entrenamiento, donde los casos de bloqueo son menos frecuentes que los de paso.

La tarea se formula como una clasificación binaria en formato de generación de texto: el modelo recibe un prompt que contiene el historial de conversación, la consulta actual del usuario y la respuesta candidata del asistente, y debe generar un único token (`0` para BLOCK, `1` para PASS) mediante decodificación greedy con `max_new_tokens=1` y el modo de pensamiento (thinking) desactivado. El prompt de defensa está estandarizado en la model card y debe respetarse para reproducir el comportamiento esperado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Clasificación de seguridad conversacional: decide si una respuesta candidata del asistente es dañina (BLOCK) o benigna (PASS) en el contexto de una conversación multi-turno.
- Evaluación response-aware: analiza conjuntamente historial, consulta actual y respuesta candidata, no solo el mensaje del usuario.
- Detección de intención maliciosa acumulativa: diseñado para identificar intenciones que se construyen a lo largo de varios turnos.
- Salida binaria determinista: genera un único token (`0` o `1`) con decodificación greedy, lo que facilita su integración en pipelines automatizados.
- Integración con el ecosistema transformers: compatible con text-generation-inference y endpoints-compatible según los tags del repositorio.
- Soporte de conversaciones multi-turno secuenciales: la model card describe el protocolo de evaluación turno a turno (en PASS se entrega y se añade al historial; en BLOCK se retiene y se detiene la continuación).
- Idioma: únicamente inglés.

## Casos de uso

- Monitorización de seguridad en asistentes conversacionales: el modelo se sitúa entre el generador de respuestas y el usuario para evaluar cada respuesta candidata antes de su entrega, bloqueando aquellas que produzcan contenido dañino en el contexto de la conversación acumulada.

- Detección de ataques de escalada gradual (multi-turn jailbreaking): permite identificar conversaciones donde cada turno individual parece inocuo pero el conjunto revela una intención maliciosa, un escenario que los clasificadores de un solo turno no cubren.

- Capa de defensa en pipelines de despliegue de LLM: al ser un modelo de 4B en BF16, puede ejecutarse junto al modelo principal en la misma infraestructura y evaluar respuestas en tiempo de generación antes de la entrega al usuario.

- Investigación en seguridad de diálogo multi-turno: sirve como baseline reweighted-SFT para comparar con otras estrategias de defensa (por ejemplo, variantes del proyecto TurnGate) en experimentos reproducibles mediante el repositorio oficial.

- Auditoría de sistemas conversacionales existentes: permite re-evaluar logs de conversaciones históricas para detectar respuestas que deberían haberse bloqueado, alimentando procesos de mejora del sistema.

- Evaluación de robustez de asistentes frente a prompts adversarios: se puede usar para medir la tasa de respuestas dañinas que un asistente genera ante secuencias de consultas diseñadas para evadir filtros de un solo turno.

- Filtrado previo en entornos de investigación con requisitos de seguridad: adecuado para prototipos y estudios donde se necesita una defensa ligera, con licencia permisiva y sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio de TurnGate y al script `scripts/eval.sh` para reproducir la evaluación, pero no incluye cifras concretas de precisión, recall, F1 ni comparaciones numéricas con otras defensas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para los pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 10-12 GB de VRAM para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB para los pesos, más overhead; en 4 bits, aproximadamente 2,5-3 GB.
- GPU recomendadas: A100, H100, L40S para despliegues de producción con concurrencia; RTX 4090, RTX 3090, RTX 4080 para desarrollo e investigación.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más de VRAM en BF16 (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090). En cuantización de 8 o 4 bits podría ejecutarse en GPUs con 6-8 GB.
- Opciones de despliegue: transformers (con accelerate y safetensors, según la model card), text-generation-inference (TGI, indicado en los tags), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. Al requerir solo un token de salida con decodificación greedy, la latencia por evaluación es baja en términos de generación, pero el coste dominante es el prefill del prompt (historial + consulta + respuesta candidata), que crece con la longitud de la conversación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurnGate-Reweight-SFT | ~4B | No disponible | Clasificación de seguridad multi-turno response-aware | Apache 2.0 | Hugging Face (Graph-COM) |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | Generación de texto general | Apache 2.0 | Hugging Face (Qwen) |
| Clasificadores de seguridad de un solo turno (p. ej., Llama Guard) | Variable | Variable | Moderación de contenido por mensaje | Variable | Variable |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia funcional clave frente a clasificadores de un solo turno es que TurnGate-Reweight-SFT incorpora el historial completo y la respuesta candidata en la decisión, lo que lo hace adecuado para ataques de escalada gradual. Frente a su modelo base, no es un generador de respuestas sino un clasificador binario especializado.

## Limitaciones y advertencias

- El modelo puede perder contenido dañino (falsos negativos) y bloquear respuestas benignas (falsos positivos); la model card lo advierte explícitamente y recomienda evaluarlo en la aplicación concreta antes de usarlo en producción.
- No genera respuestas: solo emite una decisión de release/block; no sustituye al modelo conversacional.
- Soporte únicamente en inglés; su comportamiento en otros idiomas no está validado.
- El prompt de defensa y la configuración de decodificación (un token, greedy, thinking desactivado) deben respetarse; desviarse de ellos puede degradar la fiabilidad de la clasificación.
- La salida puede ser distinta de `0` o `1` en casos límite; la model card recomienda lanzar un error si la salida no es válida, lo que exige manejo explícito en producción.
- Los resultados de evaluación dependen de la versión del dataset, el split, el prompt y los ajustes de decodificación, según la propia model card.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgos en la información disponible; al ser un clasificador de seguridad, hereda los sesgos del modelo base y del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está declarado para investigación en seguridad de diálogo multi-turno; el uso en producción requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni validación independiente.
- El modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0) incluida en `LICENSE-QWEN`; deben respetarse ambas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Graph-COM/TurnGate-Reweight-SFT
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de código TurnGate: https://github.com/Graph-COM/TurnGate
- Paper "One Turn Too Late: Learning When to Intervene Against Multi-Turn Malicious Intent": https://arxiv.org/abs/2605.05630
