# scairesearch/kieve-jev-fractal-300m

## Resumen

Kieve-JeV Fractal 300M es un motor de decisión tipado basado en encoder, desarrollado por scairesearch bajo el paraguas del proyecto Kieve. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un `state` (cualquier texto) y un conjunto de preguntas tipadas, y devuelve para cada pregunta una única respuesta con una distribución de probabilidad calibrada sobre las opciones suministradas, o una probabilidad para la primitiva binaria `noul`. El modelo nunca inventa opciones, lo que lo convierte en una pieza acotada y auditable dentro de pipelines de decisión.

Técnicamente se apoya en el backbone `answerdotai/ModernBERT-base` congelado, sobre el que se añaden adaptadores LoRA de rango 16 y una cabeza de scoring de opciones con cross-attention emparejada, más una cabeza separada para `noul`. El total de parámetros declarado es de 308,9 millones, con un repositorio de 1,5 GB que incluye checkpoint de entrenamiento (`checkpoint_latest.pt`) y configuración de inferencia (`config.json`) consumida por la librería propietaria `kieve`.

Su relevancia actual radica en la calibración: el autor publica una temperatura de softmax calibrada en el checkpoint y un Decision Index 0.2.1 con valor 1,38 (raw 21,40) sobre 150.759 peticiones. Es un modelo de nicho, con 40 descargas y sin likes en el momento de la consulta, orientado a sistemas que necesitan decisiones reproducibles sobre conjuntos cerrados de opciones en lugar de generación abierta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-base congelado + LoRA (rango 16) + cross-attention emparejada para scoring de opciones + cabeza `noul` |
| Parámetros totales | 308,9 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el backbone ModernBERT está sujeto a su propia licencia) |
| Formato de pesos | `checkpoint_latest.pt` (PyTorch) y `config.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder de decisión, no un generador. La variante `jev` combina codificadores separados para el estado y para la pregunta, un scorer de opciones con cross-attention emparejada y una cabeza independiente para la primitiva `noul` (sí/no). Sobre el backbone ModernBERT-base congelado se entrenan adaptadores LoRA de rango 16 y los operadores neuronales fusionados propios del proyecto. El checkpoint expone un campo `temperature` que corresponde a la temperatura de softmax calibrada, lo que sugiere que el ajuste de calibración forma parte explícita del artefacto distribuido.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el stack exacto de operadores de esta ejecución, que el autor remite a la configuración. La innovación destacable es el diseño de decisión tipada: la salida es siempre una distribución sobre las opciones proporcionadas, con calibración explícita, lo que permite umbrales de confianza y abstención vía `noul`.

## Capacidades

- Decisión de elección múltiple sobre un conjunto cerrado de opciones proporcionadas por el llamante, con distribución de probabilidad calibrada por pregunta.
- Primitiva binaria `noul` que devuelve una probabilidad para decisiones sí/no, útil para abstención o filtrado previo.
- Procesamiento de estado en texto libre como entrada, sin restricción a plantillas rígidas.
- Preguntas tipadas: cada pregunta declara su tipo y sus opciones, y el modelo puntúa cada opción de forma emparejada.
- Calibración de probabilidades mediante temperatura de softmax ajustada, incluida en el checkpoint.
- No genera texto libre ni opciones nuevas: el espacio de salida está acotado por el llamante.
- Soporte de tool calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia como `state` y una pregunta tipada con las categorías de cola disponibles, el modelo devuelve la distribución sobre colas; la probabilidad calibrada permite derivar a revisión humana cuando la confianza es baja.
- Moderación con abstención: usar `noul` para decidir si un contenido requiere revisión, aprovechando la probabilidad binaria calibrada para fijar umbrales operativos auditables.
- Clasificación de intención en asistentes conversacionales: con opciones cerradas de intención, el motor sustituye a un LLM generativo en el paso de clasificación, reduciendo coste y latencia al ejecutarse sobre un encoder de 300 M.
- Triaje documental en pipelines de back office: preguntas tipadas sobre documentos (tipo de contrato, urgencia, departamento responsable) con distribución calibrada por campo, integrable en flujos de extracción y validación.
- Evaluación A/B de variantes de prompt o de política: al ser determinista sobre opciones fijas y con temperatura calibrada, sirve para comparar configuraciones de decisión con métricas estables.
- Sistemas de decisión con requisito de auditabilidad: al no inventar opciones y devolver una distribución explícita, cada decisión es trazable y verificable frente a la lista de opciones registrada.
- Filtrado previo en pipelines RAG: decidir con `noul` si la consulta recuperada es suficiente antes de invocar un modelo generativo mayor, ahorrando llamadas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| aegis2 (held-out JvD) | 0,449 |
| atbench500 (held-out JvD) | 0,525 |
| Decision Index 0.2.1 — decision_index | 1,38 |
| Decision Index 0.2.1 — raw | 21,40 |
| Decision Index 0.2.1 — peticiones | 150.759 (completo) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares. Las métricas anteriores corresponden exclusivamente a las publicadas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 308,9 M de parámetros, en fp32 el peso ronda 1,2 GB y en fp16 aproximadamente 0,6 GB, a lo que hay que sumar el estado del optimizador si se carga el checkpoint de entrenamiento completo (repositorio de 1,5 GB).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder alojar el modelo en precisión reducida, pero el autor no publica requisitos.
- GPU de consumo: previsiblemente cabe en tarjetas consumer recientes (RTX 3060 en adelante) por el tamaño del backbone, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería `kieve` es la vía indicada por el autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF ni safetensors no es directamente compatible con esos runners.
- Latencia y throughput: no disponible; el Decision Index reporta 150.759 peticiones completadas sin detallar latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kieve-JeV Fractal 300M | 308,9 M | no disponible | Decisión tipada con opciones cerradas y calibración | Apache-2.0 | HuggingFace, librería `kieve` |
| ModernBERT-base (backbone) | ~149 M | 8.192 tokens (según el modelo original) | Codificación de texto general | Apache-2.0 | HuggingFace, transformers |
| Clasificadores de elección múltiple basados en BERT/RoBERTa | 100-400 M típicamente | 512 tokens típicamente | Clasificación supervisada | variable | HuggingFace, transformers |

No se dispone de comparativas numéricas publicadas frente a alternativas en la información proporcionada. La diferencia funcional frente a un clasificador estándar es que Kieve-JeV acepta opciones en tiempo de inferencia y devuelve una distribución calibrada sobre ellas, en lugar de una etiqueta fija aprendida.

## Limitaciones y advertencias

- El modelo no genera texto ni razona en abierto: solo decide entre opciones suministradas y la primitiva `noul`. No es adecuado para generación, resumen ni diálogo.
- No se han publicado datos sobre sesgos, composición del dataset ni evaluación por subgrupos; el riesgo de sesgo es desconocido y debe evaluarse empíricamente antes de producción.
- El riesgo de alucinación se limita por diseño al espacio de opciones, pero la calibración puede degradarse fuera de la distribución de entrenamiento; la temperatura calibrada es un valor único y no garantiza calibración por dominio.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto y depende del backbone ModernBERT.
- Longitud de contexto no documentada; estados o preguntas largos pueden truncarse sin aviso explícito en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el backbone ModernBERT está sujeto a su propia licencia, que debe verificarse por separado.
- Dependencia de la librería `kieve` y de un formato de checkpoint `.pt` no estándar: la integración con stacks convencionales requiere trabajo adicional.
- Métricas de evaluación limitadas a dos conjuntos (aegis2 y atbench500) con valores moderados (0,449 y 0,525); no hay evidencia de rendimiento en dominios ajenos a los evaluados.
- Modelo con adopción muy baja (40 descargas, 0 likes) y sin historial de mantenimiento; tratarlo como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/scairesearch/kieve-jev-fractal-300m
- Backbone ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Repositorio de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
