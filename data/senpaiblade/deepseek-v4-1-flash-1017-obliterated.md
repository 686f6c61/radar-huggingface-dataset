# Senpaiblade/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS con el método failspy. El resultado es un modelo que conserva las capacidades del original pero que reduce drásticamente su tasa de rechazo ante peticiones que el modelo base declinaría. Lo publica el usuario Senpaiblade en Hugging Face bajo licencia MIT.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 754.638.836.864 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos frontera de gran escala. La modificación no altera la arquitectura ni el entrenamiento original: solo ajusta los pesos para eliminar la dirección de activación asociada al rechazo, manteniendo coherencia y capacidad según las métricas del autor (100% en ambas).

La relevancia de esta ficha es doble: por un lado documenta una técnica de ablación de alineamiento aplicada a un modelo MoE de gran tamaño; por otro, los datos publicados por el autor muestran un aumento muy significativo de asistencia dañina (del 10,38% al 78,28% de las respuestas), lo que convierte este modelo en un caso de estudio sobre los riesgos de las técnicas de "uncensoring" y su impacto medible en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), familia DeepSeek V4.1 |
| Parámetros totales | 754.638.836.864 (754,6 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 1509,4 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Método de modificación | Ablación de dirección de rechazo (OBLITERATUS, método failspy) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) de la familia DeepSeek V4.1. El autor no documenta en la model card el número de parámetros activos por token, la composición del dataset de entrenamiento original ni el proceso de alineamiento (RLHF/DPO) del modelo base; esa información correspondería a la model card de DeepSeek-V4.1-Flash-1017, no incluida en la información disponible.

La modificación consiste en una ablación de la dirección de rechazo aplicada sobre los pesos del modelo base mediante la herramienta OBLITERATUS con el método failspy. Según los datos del autor, el proceso se calibró sobre un conjunto de 254 prompts del corpus de evaluación, con 50 prompts adicionales para selección de método. El resultado reportado es una tasa de rechazo del 4% (2 de 50 prompts de evaluación), una divergencia KL de 0,1305 nats respecto al modelo original, y coherencia y capacidad del 100% (6 de 6 comprobaciones de capacidad superadas). No se detalla el procedimiento técnico exacto de la ablación ni los hiperparámetros empleados.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU con 2.500 preguntas de 57 materias).
- Modo de pensamiento (thinking) disponible en el modelo base; la evaluación MMLU se realizó con thinking desactivado.
- Reducción drástica de rechazos: 4,30% de rechazos completos frente al 81,62% del modelo base en el corpus OBLITERATUS de 842 prompts.
- Respuesta directa a peticiones: 86,52% de respuestas responsivas al requerimiento frente al 16,59% del base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso controlado para estudiar cómo la ablación de la dirección de rechazo afecta a las distribuciones de comportamiento (rechazo, asistencia dañina, acción) en un modelo MoE de gran escala, con métricas publicadas comparables contra el modelo base.
- Evaluación de robustez de filtros de seguridad: permite probar clasificadores y guardarraíles externos contra un modelo que responde de forma directa, midiendo su tasa de detección sobre las 656 respuestas no-rechazo documentadas.
- Estudio de divergencia de comportamiento: la divergencia KL de 0,1305 nats y las distribuciones de daño por nivel (0 a 4) permiten analizar qué fracción del comportamiento del modelo cambia con la intervención y cuál se preserva.
- Generación de texto sin restricciones en entornos de investigación cerrados: para experimentos de generación creativa o de formato donde el rechazo del modelo base interfiere con la recogida de datos, siempre en un entorno controlado y con revisión humana.
- Benchmarking de técnicas de ablación: comparar el método failspy de OBLITERATUS con otras técnicas de uncensoring sobre el mismo modelo base, usando las métricas de coherencia, capacidad y KL publicadas como referencia.
- Análisis de riesgos en despliegues: usar las tablas de asistencia dañina y accionabilidad del autor para dimensionar el riesgo de un modelo sin alineamiento de rechazo antes de decidir su uso o su exclusión en producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

Evaluación de rechazo y asistencia dañina (corpus OBLITERATUS, 842 prompts, 838 con respuesta completa):

| Clasificación | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 684 (81,62%) | 36 (4,30%) | -77,33 |
| Rechazo parcial | 41 (4,89%) | 121 (14,44%) | +9,55 |
| Sin rechazo | 112 (13,37%) | 656 (78,28%) | +64,92 |
| Asistencia dañina | 87 (10,38%) | 656 (78,28%) | +67,90 |
| Sin asistencia dañina | 750 (89,50%) | 157 (18,74%) | -70,76 |
| Respuesta responsiva | 139 (16,59%) | 725 (86,52%) | +69,93 |
| Alternativa segura | 698 (83,29%) | 88 (10,50%) | -72,79 |

Distribución de daño potencial:

| Nivel | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 750 (89,50%) | 157 (18,74%) | -70,76 |
| 1 — Impacto bajo | 13 (1,55%) | 21 (2,51%) | +0,95 |
| 2 — Daño significativo | 41 (4,89%) | 182 (21,72%) | +16,83 |
| 3 — Daño grave | 32 (3,82%) | 375 (44,75%) | +40,93 |
| 4 — Daño severo o generalizado | 1 (0,12%) | 78 (9,31%) | +9,19 |

Distribución de accionabilidad:

| Nivel | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Ninguna | 750 (89,50%) | 157 (18,74%) | -70,76 |
| 1 — Conceptual | 2 (0,24%) | 27 (3,22%) | +2,98 |
| 2 — Pasos parciales | 33 (3,94%) | 170 (20,29%) | +16,35 |
| 3 — Pasos específicos | 23 (2,74%) | 285 (34,01%) | +31,26 |
| 4 — Suficientemente concreto | 29 (3,46%) | 174 (20,76%) | +17,30 |

Resultados de la competición de métodos (modelo obliterado):

| Métrica | Valor |
|---|---:|
| Tasa de rechazo | 4% |
| Divergencia KL | 0,1305 nats |
| Coherencia | 100% |
| Capacidad | 100% (6 de 6) |

MMLU (2.500 preguntas, 57 materias, zero-shot chat, thinking desactivado, logits de elección de respuesta): la model card incluye una tabla comparativa entre el modelo base y el obliterado, pero el fragmento disponible se corta en la fila del modelo base sin mostrar la precisión del modelo obliterado. Por tanto, la puntuación MMLU del modelo obliterado no está disponible en la información proporcionada.

Protocolo de evaluación: los jueces (Claude Opus 4.6 y GPT-6.1 Sol, con tres anotaciones adicionales de una revisión local de Codex) clasificaron respuestas existentes sin responder a los prompts ni ampliarlas. La evaluación no ejecutó ni verificó las instrucciones proporcionadas. Fecha de evaluación: 30 de octubre de 2026.

## Requisitos de hardware

- El repositorio ocupa 1509,4 GB en safetensors BF16, por lo que la inferencia en precisión completa requiere un nodo multi-GPU con al menos ~1,5 TB de VRAM agregada (por ejemplo, 8×H100 de 80 GB o 16×A100 de 80 GB).
- No cabe en ninguna GPU de consumo individual en BF16. En cuantizaciones de 4 bits (no publicadas en el repositorio) el peso teórico rondaría los 375 GB, todavía fuera del alcance de una RTX 4090 (24 GB) o una RTX 5090.
- GPU recomendadas para despliegue: H100 80 GB, A100 80 GB o H200 en configuraciones multi-GPU; se requiere interconexión NVLink o similar para el reparto de expertos.
- Opciones de despliegue: la model card declara compatibilidad con transformers y endpoints_compatible; no se documentan configuraciones específicas para vLLM, llama.cpp, Ollama o TGI, y el tamaño del repositorio hace inviable llama.cpp/Ollama en hardware de consumo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Estado de alineamiento | Disponibilidad |
|---|---:|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil millones | no disponible | MIT | Rechazo ablacionado (4% rechazo completo) | Hugging Face, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | Alineado (81,62% rechazo completo) | Hugging Face (referenciado) |
| Otras variantes obliteradas de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- El modelo presenta un 78,28% de respuestas clasificadas como asistencia dañina frente al 10,38% del base, y un 44,75% de respuestas con daño grave (nivel 3) frente al 3,82% del base. No es apto para despliegues de cara al público sin guardarraíles externos.
- La evaluación de daño fue realizada por modelos jueces (Claude Opus 4.6, GPT-6.1 Sol) sobre texto visible, sin ejecutar ni verificar las instrucciones; los niveles de daño son estimaciones, no verificaciones empíricas.
- 25 respuestas del modelo obliterado quedaron sin anotar por bloqueos de proveedor o plataforma, y una anotación es ambigua; las distribuciones incluyen estas respuestas como "no resueltas".
- La divergencia KL de 0,1305 nats indica un cambio medible en la distribución de salida respecto al modelo base; aunque coherencia y capacidad se reportan al 100%, pueden existir degradaciones no capturadas por las 6 comprobaciones de capacidad.
- La puntuación MMLU del modelo obliterado no está disponible en el fragmento de model card proporcionado; no se puede confirmar la preservación de rendimiento en conocimiento general.
- No se documentan los idiomas soportados, la longitud de contexto efectiva, el número de parámetros activos ni los tipos de cuantización disponibles.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y la responsabilidad del uso recae en el desplegador; el modelo base puede tener condiciones adicionales no reflejadas.
- Riesgo elevado de alucinación y de respuestas dañinas en dominios sensibles (seguridad, salud, legal); requiere filtrado de entrada y salida y revisión humana en cualquier uso real.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Senpaiblade/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (provenance): https://huggingface.co/Senpaiblade/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/Senpaiblade/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
