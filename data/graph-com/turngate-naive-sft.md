# Graph-COM/TurnGate-Naive-SFT

## Resumen

TurnGate-Naive-SFT es un clasificador de seguridad conversacional desarrollado por el grupo Graph-COM, construido mediante fine-tuning supervisado del modelo base Qwen3-4B-Instruct-2507. Su función no es generar respuestas, sino decidir, antes de entregar un mensaje al usuario, si la respuesta candidata del asistente es segura (`1` = PASS) o dañina (`0` = BLOCK). Se trata de un "defensor" a nivel de turno que evalúa de forma conjunta el historial de la conversación, la consulta actual del usuario y la respuesta candidata del asistente, una formulación que el paper denomina *response-aware*.

El modelo aborda un problema específico de la seguridad en diálogos multi-turno: los ataques de intención maliciosa que se construyen de forma incremental a lo largo de varios turnos, de modo que ninguna consulta individual parece dañina. La tesis del trabajo ("One Turn Too Late") es que los filtros que solo analizan la consulta del usuario llegan tarde; TurnGate propone evaluar la respuesta antes de su entrega, cuando ya se dispone del contexto acumulado.

Técnicamente es un transformer denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), derivado de Qwen3-4B-Instruct-2507, con pesos completos en BF16 y safetensors. El repositorio ocupa 8,8 GB y se distribuye bajo licencia Apache 2.0. Es un artefacto de investigación orientado a monitorización de seguridad, no un modelo conversacional de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la información proporcionada) |
| Tipos de cuantización | No disponible en la model card; los pesos se publican en BF16 y son compatibles con cuantizaciones estándar de transformers/llama.cpp por derivar de Qwen3 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (incluye `LICENSE-QWEN` para el modelo base) |
| Formato de pesos | Safetensors (BF16, pesos completos) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no LoRA ni adaptadores) de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de unos 4,4 mil millones de parámetros. El entrenamiento consiste en *supervised fine-tuning* a nivel de turno con entropía cruzada uniforme: cada prefijo acumulado del diálogo se clasifica junto con la respuesta candidata actual. La entrada es la concatenación de historial de conversación, consulta actual del usuario y respuesta candidata del asistente; la salida es un único token, `0` (BLOCK) o `1` (PASS).

La innovación conceptual no está en la arquitectura, sino en la formulación de la tarea: el clasificador es *response-aware*, es decir, condiciona la decisión de seguridad sobre la respuesta que el asistente está a punto de emitir, en lugar de sobre la consulta del usuario. Esto permite detectar intenciones maliciosas que solo se materializan en la respuesta generada tras varios turnos de acumulación. La inferencia prevista es de un solo token con decodificación greedy y *thinking* desactivado (`enable_thinking=False`), lo que hace que el coste por evaluación sea mínimo. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset (más allá de que la evaluación de referencia usa `dataset/gpt52-gen_filter`).

## Capacidades

- Clasificación binaria de seguridad a nivel de turno: devuelve `0` (BLOCK) o `1` (PASS) para una respuesta candidata dada.
- Evaluación *response-aware*: tiene en cuenta conjuntamente historial, consulta actual y respuesta candidata.
- Razonamiento sobre contexto multi-turno: detecta intenciones maliciosas construidas de forma incremental a lo largo de varios turnos.
- Monitorización previa a la entrega (*output defense*): evalúa la respuesta antes de que llegue al usuario.
- Integración con el pipeline de TurnGate: evaluación secuencial turno a turno, con parada de la continuación ante un BLOCK.
- Compatibilidad con `transformers`, `text-generation-inference` y endpoints compatibles.
- Capacidad multilingüe: limitada al inglés según la model card.
- No genera respuestas del asistente: es exclusivamente un clasificador de liberación/bloqueo.

## Casos de uso

- Moderación de salida en asistentes conversacionales: interceptar la respuesta candidata antes de mostrarla al usuario, usando el historial acumulado como contexto para detectar derivas dañinas que un filtro de entrada no vería.
- Defensa frente a *jailbreaks* multi-turno: en sesiones donde el atacante construye el contexto poco a poco (role-play progresivo, extracción por pasos), el modelo evalúa cada respuesta en el contexto de los turnos previos y bloquea la continuación cuando la intención maliciosa se materializa.
- Capa de seguridad en pipelines de agentes: insertar el clasificador como *gate* entre el generador y el ejecutor de acciones, de modo que una respuesta que vaya a desencadenar una herramienta peligrosa se retenga antes de su entrega.
- Investigación en seguridad de diálogo: banco de pruebas reproducible para comparar defensores a nivel de turno frente a defensores a nivel de consulta, usando el código y los scripts de evaluación de TurnGate.
- Auditoría y *red teaming* de asistentes desplegados: ejecutar el clasificador sobre transcripciones históricas para identificar turnos donde una respuesta debió bloquearse, midiendo la tasa de falsos negativos del sistema en producción.
- Sistemas de cumplimiento y revisión de contenido: como componente de un pipeline de revisión que marca conversaciones sospechosas para revisión humana, aprovechando la salida binaria de bajo coste (un solo token por evaluación).
- Evaluación comparativa de modelos base: al ser un baseline Naive-SFT, sirve como referencia para medir la ganancia de métodos más sofisticados del mismo proyecto sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio de TurnGate y al script `scripts/eval.sh` para reproducir la evaluación, pero no incluye cifras concretas de precisión, recall, tasa de falsos positivos ni comparaciones numéricas con otros defensores.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 10-12 GB para una sesión corta.
- En cuantización de 8 bits: alrededor de 4,5 GB de pesos; en 4 bits, alrededor de 2,5 GB (estimaciones por tamaño, no verificadas en la model card).
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en cuantización de 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: `transformers` con `accelerate` y `device_map="auto"` (soporte oficial documentado); `text-generation-inference` (etiqueta del repo); compatibilidad con endpoints; otras herramientas (vLLM, llama.cpp, Ollama) no están documentadas explícitamente, aunque el formato safetensors de Qwen3 facilita su conversión.
- Latencia y throughput: no disponibles de forma publicada. Por diseño, cada evaluación genera un único token con decodificación greedy, lo que sitúa el coste dominante en el *prefill* del prompt (historial + consulta + respuesta candidata) y no en la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurnGate-Naive-SFT | 4,4 B | No disponible | Clasificador de seguridad response-aware a nivel de turno | Apache 2.0 | Hugging Face (Graph-COM) |
| Qwen3-4B-Instruct-2507 (base) | 4,4 B | No disponible en la información | Generación de texto instructiva | Apache 2.0 | Hugging Face (Qwen) |
| Defensores a nivel de consulta (filtros de entrada) | Variable | No disponible | Clasificación de la consulta del usuario | Variable | No disponible |
| Otros defensores de TurnGate | No disponible | No disponible | Variantes del mismo proyecto (p. ej. selección de defensor `sft` en `eval.sh`) | Apache 2.0 | Repositorio TurnGate |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación relevante es funcional: frente a filtros de entrada, TurnGate evalúa la respuesta candidata con el contexto acumulado, lo que ataca el fallo de "un turno demasiado tarde"; frente al modelo base, TurnGate no genera texto, solo decide liberar o bloquear.

## Limitaciones y advertencias

- Puede dejar pasar contenido dañino (falsos negativos): la propia model card advierte que "puede no detectar contenido dañino".
- Puede bloquear respuestas benignas (falsos positivos), lo que degrada la experiencia del usuario si se usa como filtro estricto.
- Solo soporta inglés según la model card; su comportamiento en otros idiomas no está caracterizado.
- Es un modelo de investigación: no está validado para producción y debe evaluarse en la aplicación concreta antes de desplegarlo.
- No genera respuestas: requiere un generador separado (por ejemplo, Qwen3-4B-Instruct-2507) y una integración de *gate* en el bucle conversacional.
- La decisión depende de un único token con decodificación greedy; la model card exige validar que la salida sea exactamente `0` o `1` y lanzar error en caso contrario, lo que implica que pueden producirse salidas inesperadas.
- Los resultados de evaluación dependen de la versión del dataset, el split, el prompt y la configuración de decodificación, según advierte el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (`LICENSE-QWEN`) que debe respetarse; la implementación de TurnGate tiene licencia propia en su repositorio.
- Riesgo de sesgos heredados del modelo base y del dataset de fine-tuning, no documentados en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Graph-COM/TurnGate-Naive-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de código TurnGate: https://github.com/Graph-COM/TurnGate
- Paper: https://arxiv.org/abs/2605.05630 (One Turn Too Late: Learning When to Intervene Against Multi-Turn Malicious Intent)
