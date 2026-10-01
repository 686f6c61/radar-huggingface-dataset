# CharanSripadi/tinyjudge

## Resumen

TinyJudge (v2.1) es un clasificador de 149.606.402 parámetros (unos 150 M) desarrollado por CharanSripadi como "juez" ligero para evaluar el comportamiento de agentes basados en LLM. Se construye mediante fine-tuning de `answerdotai/ModernBERT-base` como modelo de clasificación de secuencias (etiquetas `no` / `yes`) y responde a tres preguntas sobre una conversación de agente con uso de herramientas: si las acciones siguieron las reglas (`policy`), si la siguiente llamada a herramienta propuesta es adecuada (`tool_choice`) y si cada hecho de la respuesta del agente está respaldado por los resultados de sus herramientas (`grounded`).

Su relevancia está en el coste: sustituye total o parcialmente a un LLM grande actuando como juez, con salidas calibradas (Platt scaling por tarea, ajustado sobre tráfico real de agentes) y un margen de cascada que enruta los casos dudosos a un juez LLM. En un conjunto de prueba de 208 juicios reales nunca usado para entrenamiento, el modelo calibrado alcanza un 88,0 % de acierto global frente al 81,2 % del juez LLM de referencia, con un 35 % de casos escalados.

El modelo es un encoder bidireccional de propósito específico, solo en inglés, con licencia Apache 2.0 y un repositorio de 0,6 GB. No genera texto: emite probabilidades para decisiones binarias de evaluación, lo que lo hace apto para guardarraíles y validación automatizada en pipelines de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con cabeza de clasificación de secuencias |
| Parámetros totales | 149.606.402 (aproximadamente 150 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento; el backbone ModernBERT-base admite ventanas mayores, pero no se documenta su uso en esta ficha |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,6 GB) |

## Arquitectura y entrenamiento

La base es `answerdotai/ModernBERT-base`, un encoder transformer bidireccional, sobre el que se añade una cabeza de clasificación binaria (`no` / `yes`) compartida por las tres tareas. Un único modelo cubre `policy`, `tool_choice` y `grounded`, de modo que la tarea se determina por el formato de la entrada, generado con las funciones de `tinyjudge.tasks` (`policy_text`, `tool_choice_text`, `grounded_text`), las mismas empleadas durante el entrenamiento. Los datos de la versión 2 son 2.806 ejemplos generados a partir de una tienda simulada con etiquetas derivadas de reglas (exactas): trayectorias de agente correctas y erróneas, respuestas de plantilla y escritas por LLM, y corrupciones de un solo hecho. El entrenamiento fue de 3 épocas con lr 3e-5, batch 16, fp16 y longitud máxima 512, y se completó en unos 4 minutos en una T4 gratuita de Colab. Los experimentos se registraron con MLflow y el SHA-256 del manifiesto del dataset se guarda con cada ejecución.

La innovación principal no está en la arquitectura, sino en el envoltorio de decisión: las probabilidades se calibran con Platt scaling por tarea, ajustado sobre tráfico real de agentes, y cada tarea define un margen de cascada dentro del cual el modelo no se considera suficientemente seguro y el caso debe escalarse a un juez LLM. No se documenta uso de RLHF, DPO ni decodificación especulativa (el modelo no es generativo).

## Capacidades

- Clasificación binaria de cumplimiento de políticas (`policy`): determina si las acciones registradas de un agente respetan las reglas dadas.
- Evaluación de elección de herramienta (`tool_choice`): valora si la siguiente llamada a herramienta propuesta es apropiada para el contexto.
- Verificación de fundamentación (`grounded`): comprueba si cada hecho de la respuesta del agente está respaldado por los resultados devueltos por sus herramientas, útil como detector de alucinación en respuestas.
- Salidas probabilísticas calibradas, no texto generado, con margen de cascada por tarea para decidir la escalada a un juez mayor.
- Procesamiento por lotes de pares (tarea, texto formateado) mediante una API de Python (`tinyjudge.predictor.Judge`) y servicio Docker en el puerto 7860.
- Idioma: únicamente inglés.
- No soporta tool calling ni function calling por sí mismo: es el evaluador del agente, no el agente.
- No dispone de modo de razonamiento, visión ni audio.
- No se documentan capacidades multilingües ni de contexto largo más allá de los 512 tokens de entrenamiento.

## Casos de uso

- Guardarraíl de políticas en producción: cada trayectoria de un agente de soporte se pasa por `policy` antes de ejecutar acciones sensibles; con 512 tokens de entrada permite validar la traza de una interacción concreta con latencia de encoder pequeño.
- Validación de la siguiente acción antes de ejecutarla: usar `tool_choice` como paso de verificación previo a la llamada real a la herramienta, bloqueando selecciones inadecuadas sin invocar a un LLM grande.
- Detección de alucinación en respuestas fundamentadas: pasar la respuesta y los resultados de herramientas por `grounded` para marcar afirmaciones no respaldadas; en la prueba real obtuvo un 83,5 % de acierto calibrado frente al 80,0 % del juez LLM.
- Enrutado en cascada para control de coste: desplegar TinyJudge como primera etapa y escalar al LLM juez solo el 16 % de los casos de `policy` o el 8 % de `tool_choice`, manteniendo o mejorando la precisión global (89,9 % en cascada frente a 88,0 % del modelo solo).
- Etiquetado y filtrado de datos de entrenamiento o evaluación: puntuar automáticamente grandes volúmenes de conversaciones de agente para seleccionar ejemplos positivos y negativos antes de un ajuste fino o de un ciclo de RL.
- Pruebas de regresión en CI/CD de agentes: incorporar el modelo como test automatizado que falla una build cuando la tasa de cumplimiento de políticas o de fundamentación cae por debajo de un umbral en un conjunto de conversaciones doradas.
- Monitorización continua con métricas calibradas: dado que las probabilidades están calibradas por tarea, los valores pueden agregarse como tasa de éxito esperada por versión del agente sin recalibración específica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 208 juicios de conversaciones reales de agentes (agente de soporte de SkillMiner), nunca usados para entrenamiento ni para ajustar la calibración:

| Tarea | n | TinyJudge (calibrado) | Juez LLM (Qwen 3.8 27B) | Cascada | Escalado al LLM |
|---|---|---|---|---|---|
| policy | 38 | 97,4 % | 71,1 % | 92,1 % | 16 % |
| tool_choice | 85 | 88,2 % | 87,1 % | 92,9 % | 8 % |
| grounded | 85 | 83,5 % | 80,0 % | 85,9 % | 71 % |
| all | 208 | 88,0 % | 81,2 % | 89,9 % | 35 % |

Error de calibración esperado (ECE, menor es mejor) en la misma mitad real de prueba: `grounded` 0,201 → 0,101; `tool_choice` 0,138 → 0,073; `policy` 0,049 → 0,078. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es un clasificador de tareas específicas y esas suites no son aplicables directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,6 GB en fp32, 0,3 GB en fp16/bf16 y 0,15 GB en int8 para los pesos; hay que sumar el espacio de activaciones, que con 512 tokens de secuencia es reducido.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso en CPU o en una T4 gratuita de Colab. El entrenamiento de referencia se completó en unos 4 minutos en una T4.
- GPU de datacenter (A100, H100) solo tienen sentido para servir lotes muy grandes en paralelo, no por requisitos de memoria.
- Opciones de despliegue: la librería propia `tinyjudge` (basada en PyTorch/Transformers) y la imagen Docker publicada en `ghcr.io/charansripadi/tinyjudge` que expone una API en el puerto 7860. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificación y no un modelo generativo, vLLM y los motores de generación no son la vía natural de despliegue.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la prueba real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TinyJudge v2.1 | Encoder clasificador (ModernBERT + cabeza binaria) | 149,6 M | 512 tokens en entrenamiento | 88,0 % global (208 juicios), 89,9 % en cascada | apache-2.0 | HuggingFace y Docker |
| Juez LLM Qwen 3.8 27B (sin razonamiento) | LLM generativo usado como juez | 27 000 M (aproximado) | no disponible | 81,2 % global (208 juicios) | no disponible | no disponible |
| `answerdotai/ModernBERT-base` | Encoder transformer base | 149 M | no disponible | no disponible (no es un juez entrenado) | apache-2.0 | HuggingFace |
| TinyJudge (marco del artículo arXiv 2606.07520) | Ensamble de modelos especialistas pequeños | alrededor de 0,6 B por especialista | no disponible | no disponible | no disponible | Publicación académica |

Advertencia sobre la comparativa: el trabajo académico titulado también "TinyJudge" (ACL 2026 / arXiv 2606.07520) describe un marco distinto, basado en un ensamble de modelos especialistas de aproximadamente 0,6 B destilados de modelos frontera para dar recompensas en RLVR. Comparte nombre, pero no es el mismo artefacto que este modelo de 150 M alojado en HuggingFace, y no se ha encontrado relación declarada entre ambos en la información disponible.

## Limitaciones y advertencias

- Un solo dominio: entrenado sobre un agente de soporte de una tienda online simulada con seis herramientas. Otros dominios requieren datos nuevos y presumiblemente un reajuste.
- Conjunto de prueba real muy pequeño: entre 38 y 85 ejemplos por tarea; diferencias de pocos puntos porcentuales frente al juez LLM están dentro del ruido estadístico.
- Supuestos en las etiquetas: los positivos reales de `grounded` asumen que la respuesta del agente coincidía con los resultados de sus herramientas, pero al menos una de esas respuestas contenía una cronología inventada, por lo que parte de los "errores" podrían ser aciertos del modelo.
- La línea base del juez LLM es Qwen 3.8 27B sin razonamiento; un modelo con modo de razonamiento probablemente mejoraría en `policy`, lo que rebajaría la ventaja reportada.
- La cascada no siempre ayuda: escalar `policy` empeoró la precisión porque el LLM era peor que TinyJudge en esa tarea. Además, `grounded` escala el 71 % de los casos, lo que limita el ahorro de coste en esa tarea.
- Calibración desigual: según la model card, el ECE de `policy` pasa de 0,049 a 0,078 tras la calibración, es decir, empeora. Conviene validar la calibración en el dominio propio antes de usar las probabilidades como umbrales de decisión.
- Idioma: solo inglés. Las entradas deben formatearse con las funciones de `tinyjudge.tasks`; cualquier otro formato degrada el resultado.
- Longitud: 512 tokens de entrenamiento, insuficiente para trayectorias de agente largas con muchos resultados de herramientas.
- Sesgos conocidos: no se documenta ningún análisis de sesgos demográficos, sociales o de dominio en la información disponible.
- Riesgo de alucinación del propio juez: es un clasificador binario, no genera texto, pero puede producir falsos positivos y falsos negativos, con tasas del orden del 12-16 % de error según tarea.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos sintéticos del autor deben verificarse por separado; la licencia del conjunto de datos no se detalla en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) ni soporte para motores de inferencia habituales, lo que limita su integración en despliegues ya estandarizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharanSripadi/tinyjudge
- Repositorio de código, pipeline de datos y API: https://github.com/Charansripadi/tinyjudge
- Imagen Docker del servicio: `ghcr.io/charansripadi/tinyjudge` (puerto 7860)
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Artículo relacionado por nombre, TinyJudge: Unverifiable Constraint Alignment via Lightweight Specialist Ensembles (arXiv): https://arxiv.org/abs/2606.07520
- Versión HTML del artículo: https://arxiv.org/html/2606.07520v1
- Entrada en ACL Anthology: https://aclanthology.org/2026.acl-long.1204/
- Colección de HuggingFace "TinyJudge | Small Language Model as a Judge": https://huggingface.co/collections/1rsh/tinyjudge-small-language-model-as-a-judge
