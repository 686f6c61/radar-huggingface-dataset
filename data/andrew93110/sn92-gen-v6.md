# Andrew93110/sn92-gen-v6

## Resumen

sn92-gen-v6 es un modelo de decisión especializado ("decision model") publicado por el usuario Andrew93110 para la subred REAX (Bittensor SN92). Se trata de un fine-tune de `decisionmodels/reax-1.1`, que a su vez deriva de `decisionmodels/reax-1`, de `perplexity-ai/pplx-decider-v1.2` y, en última instancia, de Qwen3.8-27B. El modelo conserva el protocolo "protocol-v3 joint inline readout" del modelo base, con los ficheros `joint_config.json`, `decision_config.json` y `readout.safetensors` sin modificar, y mantiene intactos la configuración y el tokenizer del padre.

Con 26.085.330.160 parámetros (~26B) y un repositorio de 104,4 GB en safetensors, el modelo está pensado para tareas de decisión y evaluación con formato de opciones múltiples, no como un chat generalista. Su construcción combina cuatro deltas LoRA (dW(g6), dW(t1), dW(v1t1b) y dW(x1)) aplicados por aritmética de tareas sobre los pesos de REAX 1.1, con la cabeza de lectura (readout head) congelada durante todo el proceso.

La relevancia actual es acotada: es una entrada de competición dentro de la subred SN92 de Bittensor, con 48 descargas y sin likes en el momento de la consulta. No hay pipeline declarado, ni idiomas especificados, ni benchmarks publicados en la model card. La licencia Apache-2.0 facilita su reutilización, pero la documentación disponible es fundamentalmente un registro del proceso de entrenamiento, no una evaluación de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con atención lineal y proyecciones MLP; protocolo protocol-v3 joint inline readout |
| Parámetros totales | 26.085.330.160 (~26B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (más `joint_config.json`, `decision_config.json`, `readout.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de REAX 1.1, un fine-tune de REAX 1, que a su vez deriva de pplx-decider-v1.2 y de Qwen3.8-27B. La arquitectura es un transformer con atención lineal además de atención estándar, y mantiene la cabeza de lectura del protocolo protocol-v3 sin entrenar. El merge final sigue la fórmula W = W(REAX 1.1) + dW(g6) + dW(t1) + dW(v1t1b) + dW(x1), con cada paso calculado en fp32 y almacenado en bf16, sin "final-norm sharpening".

El entrenamiento es exclusivamente LoRA sobre las proyecciones de atención, atención lineal y MLP del modelo de lenguaje. dW(g6) se entrenó sobre pplx-decider-v1.2 y se añadió a REAX 1.1 por aritmética de tareas; dW(t1) se entrenó sobre REAX 1.1 + dW(g6) con el trainer de un kit compartido por un equipo socio. dW(v1t1b) es un LoRA de rango 32 (alpha 64) entrenado con la cabeza congelada para la evaluación generalista v5.1: 5.985 ítems propios en formato v5 (máximo 300 por tipo de tarea; 11.394 filas) más una repetición de 2.000 ítems de sn92-generalist-train-v1, con learning rate 5e-05, KL 0.3 hacia la distribución nativa inicial y KL 0.1 hacia la distribución con prompt REAX, 210 pasos de 64 filas (5.717.078 tokens). La composición del dataset v5 incluye datos de openFDA (device recall y enforcement reports, dominio público), ítems generados propios con licencia CC0 1.0 (tipos de cambio, tarifas postales, parking, overage de telecom, retención de datos, solicitudes de baja, préstamos de biblioteca, aprobación de compras) y tareas procedimentales como construcción de acordes. No se documenta RLHF ni DPO.

## Capacidades

- Evaluación de decisiones con formato de opciones múltiples, incluyendo la opción explícita "I don't know" cuando el formato la ofrece.
- Razonamiento sobre reglas y procedimientos administrativos (retención de datos, aprobación de compras, solicitudes de baja, préstamos de biblioteca).
- Cálculo de tarifas y tipos (tipo de cambio, tarifas postales, parking, overage de telecom).
- Comprensión lectora y preguntas de sentido común (los datasets de entrenamiento incluyen CosmosQA, Social IQa, QASC, Winogrande, CommonsenseQA, StrategyQA).
- Razonamiento matemático y cuantitativo (GSM8K, MATH-QA, AQuA-RAT en el conjunto de datos declarado).
- Clasificación de intenciones y temas (MASSIVE, Banking77, CLINC OOS, PAWS-X, XCOPA).
- Análisis de sentimiento financiero (Twitter Financial News Sentiment).
- Tool calling y function calling (Glaive Function Calling v2, ToolACE en el dataset).
- Clasificación legal (LexGLUE).
- Detección de inyección de prompts y evaluación de seguridad de contenido (deepset/prompt-injections, NVIDIA Aegis AI Content Safety 2.0).
- Capacidades multilingües: no confirmadas; los datasets incluyen MASSIVE y PAWS-X, que son multilingües, pero la model card no declara idiomas soportados.
- Modo "thinking": no disponible en la información.

## Casos de uso

- Evaluación automática de decisiones administrativas: el modelo puede clasificar y resolver ítems con opciones múltiples sobre retención de datos, solicitudes de baja o aprobación de compras, usando el formato v5 de la subred REAX y la opción "I don't know" para abstenerse cuando la información es insuficiente.
- Cálculo de tarifas y recargos: adecuado para escenarios de tipo de cambio, tarifas postales, parking y overage de telecom, donde el modelo fue entrenado con ítems generados específicamente para cada dominio.
- Clasificación de intenciones en atención al cliente: los datasets MASSIVE, Banking77 y CLINC OOS permiten usar el modelo para enrutar consultas a departamentos o respuestas predefinidas, aunque sin garantías de idioma declaradas.
- Análisis de sentimiento en noticias financieras: el entrenamiento con Twitter Financial News Sentiment lo hace apto para clasificar titulares y detectar polaridad en textos económicos.
- Filtrado de seguridad y detección de inyección de prompts: el modelo incorpora datos de prompt-injections y Aegis AI Content Safety 2.0, por lo que puede usarse como componente de moderación en pipelines de entrada.
- Razonamiento procedimental sobre reglas: tareas como construcción de acordes o aplicación de reglas de negocio encajan con el entrenamiento en `tasksource/procedural-typed-decisions`.
- Evaluación comparativa dentro de la subred SN92: el modelo está diseñado para la evaluación generalista v5.1 de REAX, por lo que su uso natural es participar en la competición de la subred y comparar deltas LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño (26B parámetros), en bf16 se necesitan aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no declaradas. Por tamaño, un despliegue en bf16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs menores.
- ¿Cabe en GPU consumer? No en bf16. Con cuantización a 4 bits podría caber en GPUs de 24 GB (RTX 4090) o 32 GB, pero no se han publicado cuantizaciones ni se confirma compatibilidad.
- Opciones de despliegue: no se documentan. El formato safetensors con ficheros de configuración adicionales (`joint_config.json`, `decision_config.json`, `readout.safetensors`) sugiere que requiere el runtime específico de REAX, no vLLM, llama.cpp u Ollama estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sn92-gen-v6 | ~26B | no disponible | Apache-2.0 | HuggingFace, 48 descargas |
| decisionmodels/reax-1.1 | no disponible | no disponible | Apache-2.0 (según cadena) | HuggingFace |
| perplexity-ai/pplx-decider-v1.2 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (ancestro) | ~27B | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión especializado, no un chat generalista: su uso previsto es la evaluación con formato de opciones múltiples de la subred REAX, no la conversación abierta.
- La cabeza de lectura (`readout.safetensors`) y `decision_config.json` son los del modelo base y no se entrenaron; cualquier cambio en el protocolo de lectura invalida el modelo.
- No se declaran idiomas soportados; el rendimiento fuera del inglés y de los idiomas presentes en MASSIVE/PAWS-X es desconocido.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación no evaluado en la model card.
- Sesgos: no documentados; los datasets de entrenamiento incluyen fuentes federales de EE. UU. y datos generados propios, lo que puede introducir sesgo geográfico y de dominio.
- La licencia Apache-2.0 permite uso comercial, pero la cadena de modelos base (Qwen3.8-27B, pplx-decider-v1.2, reax-1, reax-1.1) debe verificarse individualmente para confirmar compatibilidad.
- El proceso de entrenamiento incluye deltas LoRA de un "partner team" no identificado, lo que reduce la trazabilidad completa del linaje.
- Sin cuantizaciones publicadas ni pipeline declarado; el despliegue en producción requiere trabajo adicional de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Andrew93110/sn92-gen-v6
- Modelo base REAX 1.1: https://huggingface.co/decisionmodels/reax-1.1
- Modelo base REAX 1: https://huggingface.co/decisionmodels/reax-1
- Modelo base pplx-decider-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Entrada previa sn92-gen-v1: https://huggingface.co/Andrew93110/sn92-gen-v1
- Dataset sn92-specialists: https://huggingface.co/datasets/decisionmodels/sn92-specialists
- Dataset sn92-generalist-train-v1: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1
- Términos de openFDA: https://open.fda.gov/terms/
- Licencia CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/
