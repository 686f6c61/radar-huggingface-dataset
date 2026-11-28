# bismigel/o11y-alert-tuner-4b

## Resumen

o11y-alert-tuner-4b es un ajuste fino mediante QLoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario bismigel, especializado en el triaje de reglas de alerta de Prometheus. El modelo recibe una regla de alerta junto con sus estadísticas de disparo recientes y devuelve un objeto JSON que clasifica la alerta como flapping, noisy, dead o healthy, proponiendo además un parche mínimo sobre los campos `expr`, `for` y `severity` cuando corresponde. La versión publicada es la v0.5.

El problema que aborda es el ruido operativo en sistemas de observabilidad: alertas que parpadean, que disparan sin aportar información o que han quedado muertas por cambios en la instrumentación. En lugar de sustituir al operador, el modelo actúa como asistente de triaje cuyo resultado debe revisarse, por ejemplo como pull request, antes de aplicarse.

Con 4.022 millones de parámetros y licencia Apache-2.0, se distribuye en formato GGUF (Q8_0 y Q4_K_M) y como adaptador LoRA, lo que permite desplegarlo en hardware modesto. Su relevancia actual radica en que demuestra que un modelo de 4B ajustado de forma específica puede superar a modelos generales de API mucho mayores en una tarea vertical concreta, aunque con validación limitada a un único clúster real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507), ajuste QLoRA |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (4,3 GB), Q4_K_M (2,5 GB); adaptador LoRA en precisión original (74 MB) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3, y solo se entrena un adaptador LoRA mediante QLoRA sobre la base congelada. El adaptador resultante ocupa 74 MB, lo que refleja que el ajuste modifica una fracción pequeña de los pesos. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que las etiquetas se construyeron a partir de definiciones operativas de las cuatro clases (flapping, noisy, dead, healthy) y de que los datos de entrenamiento se filtraron con las mismas comprobaciones estructurales que luego se usan en evaluación.

El modelo está diseñado para operar con un prompt de sistema concreto (`system_prompt.txt`) y un mensaje de usuario con un JSON que contiene `alert_rule`, `stats_30d` y `ack_notes`. El repositorio incluye `scripts/tune_alert.py`, que construye esas entradas desde un Prometheus o vmalert/VictoriaMetrics en vivo y añade compuertas de seguridad alrededor del modelo. No se especifica en la información proporcionada si hubo RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Clasificación de reglas de alerta de Prometheus en cuatro categorías: flapping, noisy, dead y healthy.
- Generación de parches mínimos sobre `expr`, `for` y `severity` para alertas que requieren ajuste.
- Devolución de `noop` sin parche para alertas sanas, evitando modificaciones innecesarias.
- Producción de PromQL válido verificable con promtool (100 % en los hold-outs reportados).
- Diagnóstico en lenguaje natural del problema detectado, incluido en el campo `diagnosis` del JSON.
- Integración con flujos de revisión tipo pull request, dado el formato estructurado de salida.
- Capacidad de operar sobre datos de un Prometheus o vmalert/VictoriaMetrics en vivo mediante los scripts del repositorio.
- Soporte de conversación multi-turno heredado del modelo base, aunque el uso evaluado es de un solo turno con prompt fijo.

## Casos de uso

- Triaje automatizado de alertas en un equipo SRE: el modelo lee cada regla y sus estadísticas de 30 días y propone una clasificación, permitiendo priorizar qué alertas revisar primero en lugar de auditar manualmente cientos de reglas.
- Reducción de ruido en guardias: las alertas clasificadas como noisy se acompañan de un parche con umbral o suelo de tráfico, que el equipo puede revisar como pull request antes de aplicar.
- Detección de alertas muertas: el modelo marca como dead las reglas sin disparos ni series coincidentes durante al menos 14 días, señalando candidatas que una comprobación determinista de existencia de métrica debe confirmar.
- Limpieza de deuda técnica en observabilidad: auditorías periódicas del catálogo de reglas para eliminar o reescribir alertas obsoletas tras refactorizaciones de instrumentación.
- Generación asistida de PromQL: el campo `expr` del parche propuesto sirve como punto de partida para reescribir expresiones que disparan en exceso, con validación posterior mediante promtool.
- Integración en pipelines de CI/CD de configuración: los parches propuestos pueden insertarse como sugerencias en el proceso de revisión de cambios en el repositorio de reglas de alerta.
- Formación de equipos: el campo `diagnosis` explica por qué una alerta es problemática, lo que resulta útil para documentar decisiones de tuning y formar a nuevos miembros del equipo.

## Benchmarks y rendimiento

Resultados reportados por el autor (240 casos por evaluación, temperatura 0, Q8_0):

| Métrica | Base 4B sin ajustar | Modelo general de API grande (thinking off) | Este modelo |
|---|---|---|---|
| Simulador independiente: clase correcta | 47,9 % | 60,8 % | 96,7 % |
| Simulador: alertas sanas sin tocar | 0,0 % | 21,7 % | 93,3 % |
| Evaluación dura: clase correcta / seguridad en sanas | 45,4 / 0,0 | 60,8 / 25,0 | 98,3 / 96,7 |
| Parche supera comprobaciones estructurales (eval dura) | 60,8 % | 55,8 % | 99,2 % |
| Pass^3 en el simulador | no disponible | no disponible | 95,8 % (Pass@3 97,5 %) |
| Clúster real, 21 alertas con etiquetas de referencia | 1/21 | 10/21 | 16/21 |

El modelo general de API comparado es DeepSeek Flash con thinking desactivado y el mismo prompt, en comparación zero-shot. Los hold-outs de 100 casos con dominios no vistos reportan 100 % de PromQL válido y 95 % de clase correcta en Q8_0; Q4_K_M obtiene 99 % de PromQL válido y 96 % de clase correcta, con 95,4 % en el simulador y 90,8 % de seguridad en sanas. El autor advierte que las comprobaciones de parche son heurísticas estructurales con las que también se filtraron los datos de entrenamiento, por lo que esa fila es parcialmente circular.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para Q8_0 y 3-4 GB para Q4_K_M, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en profesional, A100 o H100 sobran para este tamaño.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más para Q8_0 y con 6 GB o más para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (el repositorio incluye `Modelfile`), vLLM y TGI para el adaptador LoRA aplicado sobre la base; el formato GGUF está pensado para llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| o11y-alert-tuner-4b | 4,02 B | no disponible | Triaje de alertas Prometheus (QLoRA) | Apache-2.0 | GGUF y adaptador LoRA en Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Propósito general | Apache-2.0 | Hugging Face |
| DeepSeek Flash (API) | no disponible | no disponible | Propósito general | no disponible | API |
| Modelos generales de 4B | ~4 B | variable | Propósito general | variable | Hugging Face |

La comparación relevante es con el modelo base sin ajustar, que obtiene 47,9 % de clase correcta frente al 96,7 % del ajustado, y con el modelo general de API, que alcanza 60,8 %. No se dispone de otros modelos especializados en triaje de alertas Prometheus en la información proporcionada para una comparación directa.

## Limitaciones y advertencias

- Validación real limitada a un único clúster homelab con 21 alertas etiquetadas por un agente y aceptadas por el autor, sin segunda etiquetación independiente.
- Puede pasar por alto flapping real que las estadísticas no reflejan, como sondas desde un único punto de vista o dispositivos que se reinician; tres de los cinco fallos en el clúster real son de este tipo.
- La clase dead es solo una candidata: la decisión final corresponde a una comprobación determinista de existencia de métrica incluida en el repositorio.
- Requiere historial suficiente; con uno o dos días de datos muchas alertas carecen de evidencia y la compuerta del repositorio las rechaza.
- Solo inglés y solo reglas estilo Prometheus, no reglas de alerta gestionadas por Grafana.
- Puede generar parches incorrectos o inseguros; la salida es generada por IA y no debe aplicarse sin revisión.
- No se han documentado sesgos específicos más allá de los derivados del modelo base y del dominio de entrenamiento.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en entornos distintos al validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bismigel/o11y-alert-tuner-4b
- Repositorio con código, scripts de evaluación y registro de proceso: https://github.com/bismigel/o11y-alert-tuner
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
