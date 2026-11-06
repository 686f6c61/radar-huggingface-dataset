# affan-h/callguard-encoder

## Resumen

CallGuard encoder es un modelo de clasificación de texto basado en un cross-encoder fine-tuneado a partir de `microsoft/deberta-v3-small`. Lo desarrolla el usuario de Hugging Face `affan-h` como parte de un proyecto de portafolio llamado CallGuard, y su tarea concreta es determinar si un turno de una llamada de cobro de deudas coincide con una descripción de regla o evento de cumplimiento normativo. La entrada combina la descripción de la regla con el turno anterior y el turno actual de la conversación, y la salida es una decisión binaria de coincidencia.

El modelo es deliberadamente pequeño (141,9 millones de parámetros, repo de 0,6 GB) y está pensado como pieza de un sistema de detección de incumplimientos en tiempo real sobre conversaciones telefónicas. Su valor técnico reside en el enfoque cross-encoder: en lugar de clasificar cada turno de forma aislada, evalúa el par (regla, contexto de conversación) conjuntamente, lo que permite capturar dependencias entre turnos que un clasificador de texto plano perdería.

Es relevante ahora como ejemplo de aplicación vertical de modelos encoder pequeños a tareas de compliance, pero conviene subrayar que el propio autor lo marca explícitamente como no apto para producción: se entrenó únicamente con llamadas sintéticas generadas por Gemini, y no se han publicado datos de evaluación, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small) configurado como cross-encoder |
| Parametros totales | 141.896.450 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a int8/fp16 posible con herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (el entrenamiento se hizo con llamadas sintéticas generadas por Gemini; el idioma de esas llamadas no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un transformer encoder de 12 capas con atención desacoplada (disentangled attention) y embeddings relativos de posición, y lo reutiliza como cross-encoder: la descripción de la regla o evento y el par de turnos (anterior + actual) se concatenan en una única secuencia de entrada, y el modelo produce una puntuación de coincidencia. Esta formulación permite modelar la interacción entre la regla y el contexto conversacional, algo que un bi-encoder o un clasificador por turno no captura.

El dato más importante sobre el entrenamiento es su limitación: el autor indica que se entrenó exclusivamente con llamadas sintéticas escritas por Gemini. No se documentan el número de ejemplos, la composición del dataset, si hubo validación humana, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en un encoder de clasificación). Tampoco se especifica la longitud máxima de secuencia ni la estrategia de truncado de los turnos.

## Capacidades

- Clasificación binaria de coincidencia entre una descripción de regla/evento y un turno de conversación contextualizado con el turno previo.
- Detección de eventos de compliance en llamadas de cobro de deudas (la única tarea documentada).
- Procesamiento de pares de turnos como contexto mínimo; no se documenta soporte para ventanas conversacionales más largas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta capacidad multilingüe ni modo de razonamiento explícito.
- No es un modelo generativo: no produce texto, solo una etiqueta/puntuación de clasificación.

## Casos de uso

- Auditoría de llamadas de cobro: el modelo se usaría para marcar turnos del agente que coincidan con reglas de compliance (por ejemplo, amenazas, lenguaje abusivo o divulgación indebida), revisando el turno actual junto con el anterior para evitar falsos positivos por frases incompletas.
- Supervisión en tiempo real de agentes telefónicos: al ser un encoder pequeño (142 M de parámetros), puede ejecutarse en CPU o GPU modesta dentro del pipeline de transcripción y evaluar cada turno con baja latencia, aunque el autor no publica cifras de throughput.
- Generación de alertas para revisión humana: las coincidencias detectadas se encaminarían a un revisor, usando el modelo como filtro de primera pasada sobre el volumen total de llamadas.
- Etiquetado asistido de datasets de compliance: el modelo puede preetiquetar conversaciones para que anotadores humanos corrijan, acelerando la construcción de un corpus real que sustituya al sintético.
- Prototipado de sistemas de detección de reglas configurables: al recibir la descripción de la regla como parte de la entrada, permite añadir o modificar reglas sin reentrenar, útil para demostraciones y pruebas de concepto.
- Investigación sobre cross-encoders en dominios conversacionales: sirve como referencia reproducible (licencia MIT, pesos abiertos) para comparar formulaciones de entrada en tareas de verificación regla-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de precisión, recall, F1 ni comparaciones con alternativas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,57 GB solo para pesos (141,9 M de parámetros); en fp16, unos 0,28 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch) con `AutoModelForSequenceClassification`, ONNX Runtime para inferencia optimizada en CPU, y servidores de inferencia tipo TorchServe o Triton. No se documenta soporte GGUF/llama.cpp (no aplica a este tipo de encoder).
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CallGuard encoder | 141,9 M | no disponible | Cross-encoder regla-turno (compliance) | MIT | Hugging Face |
| microsoft/deberta-v3-small (base) | ~141 M | 512 tokens (estándar DeBERTa-v3) | Modelo base, sin fine-tune para esta tarea | MIT | Hugging Face |
| Cross-encoders de NLI (p. ej. familia DeBERTa-v3 fine-tuneada en MNLI) | ~140-180 M | 512 tokens | Inferencia textual (entailment) | MIT/Apache-2.0 según variante | Hugging Face |

La comparación con alternativas específicas de compliance conversacional no está disponible: no se conocen modelos públicos equivalentes entrenados para esta tarea concreta, y el autor no ofrece comparaciones.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es para uso en producción.
- Entrenado únicamente con llamadas sintéticas generadas por Gemini: no hay evidencia de generalización a conversaciones reales, con ruido de transcripción, acentos, interrupciones o solapamientos.
- Sin métricas de evaluación publicadas: se desconoce la precisión, el recall y la tasa de falsos positivos/negativos.
- Riesgo de alucinación de coincidencias: al ser un clasificador, el riesgo se traduce en falsos positivos o negativos sistemáticos, especialmente ante reglas formuladas de forma distinta a las del entrenamiento.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada; los turnos largos pueden truncarse y perder información relevante.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable usarlo en decisiones de compliance sin validación propia.
- Solo 3 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/affan-h/callguard-encoder
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
