# CobuildX-AI/cbx-bfs-banking-intent-classifier-68M

## Resumen

El cbx-bfs-banking-intent-classifier-68M es un clasificador de texto encoder-only desarrollado por CobuildX-AI, especializado en detectar la intención de mensajes de clientes bancarios entre las 77 categorías del conjunto de datos BANKING77. Se trata de un fine-tuning del Ettin encoder de 68M de parámetros (jhu-clsp/ettin-encoder-68m), una arquitectura ModernBERT optimizada para eficiencia en CPU. El modelo resuelve el problema de enrutamiento automático de consultas en atención al cliente financiera, una tarea donde los LLM generativos resultan caros y lentos en comparación con un clasificador dedicado.

Con 68,4 millones de parámetros y una ventana de entrada de 128 tokens, el modelo alcanza un 93,7% de accuracy y un F1 macro de 0,937 sobre el conjunto de test de BANKING77 (3.080 mensajes), superando en la comparativa publicada por el autor tanto a soluciones basadas en TF-IDF con regresión logística como a modelos de decisión por API y a Claude Opus 5 en modo zero-shot. Su latencia declarada es de aproximadamente 12 ms por mensaje en CPU local, lo que lo hace viable para despliegues de alto volumen sin GPU.

La relevancia actual del modelo reside en su relación coste-rendimiento: ofrece precisión de estado del arte en una tarea acotada con licencia Apache-2.0, sin coste por inferencia y ejecutable en hardware convencional. No obstante, se trata de la versión v0.1, publicada el 13 de noviembre de 2026, sin descargas ni valoraciones registradas en Hugging Face en el momento de la consulta, y con soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, vía Ettin encoder 68M) |
| Parametros totales | 68.446.797 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrada |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del Ettin encoder de 68M, una implementación de la familia ModernBERT orientada a codificadores eficientes con atención optimizada y soporte nativo para secuencias cortas. Sobre esa base se realiza un fine-tuning supervisado para clasificación de 77 clases, utilizando el conjunto de datos PolyAI/banking77 (referenciado con el paper arXiv:2003.04807). El autor indica que se empleó label smoothing de 0,1 durante el entrenamiento, lo que explica que la confianza máxima raramente supere 0,9 y que las puntuaciones deban calibrarse contra umbrales propios del modelo.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de BANKING77, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en clasificadores encoder). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención linear más allá de las propias de ModernBERT. La entrada se limita a 128 tokens, suficiente según el autor para cubrir todos los mensajes de BANKING77.

## Capacidades

- Clasificación de intención bancaria en 77 categorías predefinidas (BANKING77), con ids idénticos a los del dataset original de Hugging Face.
- Salida estructurada con la intención predicha, una descripción de una línea, la confianza y el top-3 de intenciones.
- Procesamiento de mensajes de cliente en inglés de hasta 128 tokens.
- Inferencia en CPU con latencia declarada de ~12 ms por mensaje (8 hilos).
- Integración con la librería `transformers` mediante `pipeline("text-classification")` y con el wrapper propio `cbx_intent.IntentClassifier`.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento automático de tickets en atención al cliente bancaria: cada mensaje entrante se clasifica en una de las 77 intenciones (`lost_or_stolen_card`, `pending_transfer`, `exchange_rate`, etc.) y se deriva al equipo o flujo correspondiente, con latencia de milisegundos y sin coste por llamada.
- Triaje previo a un LLM generativo: usar el clasificador como primera etapa para decidir si la consulta requiere un modelo grande o puede resolverse con respuestas plantilla, reduciendo coste y latencia en pipelines híbridos.
- Moderación y priorización de urgencias: intenciones como `compromised_card` o `pin_blocked` pueden activar alertas inmediatas antes de que un agente humano revise el mensaje, gracias a la salida top-3 con confianza.
- Analítica de motivos de contacto: procesar en lote históricos de conversaciones para agregar la distribución de intenciones por periodo, canal o segmento de cliente, aprovechando el throughput en CPU.
- Asistencia a agentes humanos: mostrar la intención detectada y las tres más probables junto al mensaje del cliente en la interfaz del agente, acelerando la respuesta y reduciendo errores de interpretación.
- Filtrado y preetiquetado de datasets: usar el modelo para etiquetar automáticamente nuevos mensajes bancarios y ampliar corpus de entrenamiento o evaluación, con revisión humana solo en casos de baja confianza.
- Despliegue en entornos con restricciones de hardware: al ejecutarse en CPU con 12 ms por mensaje, es adecuado para sucursales, sistemas on-premise o entornos sin GPU donde no se puede llamar a APIs externas por motivos regulatorios.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de BANKING77 (3.080 mensajes, 40 por intención), con accuracy y F1 macro:

| Modelo | Accuracy | F1 macro | Latencia por mensaje | Precio por 1.000 mensajes |
|---|---|---|---|---|
| cbx-bfs-banking-intent-classifier-68M (este modelo) | 93,7% | 0,937 | 12 ms (CPU, local) | ninguno (hardware propio) |
| cbx-bfs-banking-intent-classifier-17M | 92,3% | 0,923 | 3 ms (CPU, local) | ninguno (hardware propio) |
| Jev (API de modelo de decisión) + 3 ejemplos recuperados | 91,9% | 0,919 | 296 ms (API) | ~0,10 USD |
| TF-IDF + regresión logística | 91,0% | 0,911 | <1 ms (CPU, local) | ninguno |
| Claude Opus 5, zero-shot (publicado por OpenRouter) | 84,4% | 0,836 | 2.266 ms (API) | ~2,40 USD |
| Jev (API), zero-shot | 81,5% | 0,810 | 290 ms (API) | ~0,09 USD |

Las ejecuciones de los modelos CBX, TF-IDF y Jev fueron realizadas por CobuildX el 13 de noviembre de 2026; el resultado de Claude Opus 5 procede de una publicación de OpenRouter y no fue replicado por el autor. La latencia no se mide de forma homogénea en todas las filas (CPU local frente a API).

## Requisitos de hardware

- VRAM estimada: no requiere GPU; con 68,4M de parámetros en fp32 ocupa aproximadamente 274 MB de pesos, y en fp16 unos 137 MB. Cabe holgadamente en cualquier GPU consumer, pero el caso de uso previsto es CPU.
- GPU recomendadas: no aplica; cualquier GPU con al menos 1 GB de memoria libre puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, el wrapper `cbx_intent.IntentClassifier`, Text Embeddings Inference (TEI) y endpoints compatibles según los tags del repositorio. No se documentan pesos GGUF ni soporte explícito para llama.cpp u Ollama.
- Latencia y throughput: ~12 ms por mensaje en CPU con 8 hilos según el autor; el throughput exacto en mensajes por segundo no se especifica, pero a partir de esa latencia se puede estimar del orden de decenas de mensajes por segundo por núcleo de ejecución, sujeto a paralelización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy BANKING77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-bfs-banking-intent-classifier-68M | 68,4M | 128 tokens | 93,7% | Apache-2.0 | Hugging Face (v0.1) |
| cbx-bfs-banking-intent-classifier-17M | ~17M (no confirmado en ficha) | no disponible | 92,3% | Apache-2.0 | Hugging Face |
| TF-IDF + regresión logística | no aplica (modelo clásico) | no aplica | 91,0% | según implementación | local |
| Claude Opus 5 (zero-shot) | no disponible | no disponible | 84,4% | propietaria | API de Anthropic |
| Jev (API de decisión) | no disponible | no disponible | 81,5%–91,9% según prompt | propietaria | API de TypeSafe |

La comparativa se limita a los datos publicados por el autor; no se dispone de resultados de otros clasificadores encoder específicos para BANKING77 en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre las 77 intenciones de BANKING77; cualquier consulta fuera de ese conjunto se forzará a una de las clases existentes, generando predicciones incorrectas sin señal explícita de "fuera de dominio".
- Soporte exclusivo de inglés: mensajes en otros idiomas, incluido el castellano, no están contemplados y degradarán la precisión.
- Entrada limitada a 128 tokens; mensajes más largos deben truncarse, lo que puede perder información relevante.
- El label smoothing 0,1 hace que la confianza máxima rara vez supere 0,9; los umbrales de revisión o derivación a humano deben calibrarse sobre las puntuaciones de este modelo y no sobre probabilidades de otros sistemas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en mensajes ambiguos, irónicos o con múltiples intenciones mezcladas.
- Sesgos potenciales heredados de BANKING77: el dataset se recopiló en un contexto bancario concreto y puede no representar jerga, productos o canales de otras regiones o entidades.
- Licencia Apache-2.0 permite uso comercial, pero el autor no documenta garantías ni auditorías de robustez adversarial.
- Versión v0.1 sin descargas ni validación comunitaria en Hugging Face; conviene fijar `revision="v0.1"` y evaluar en el dominio propio antes de producción.
- No se documentan cuantizaciones oficiales (GGUF, ONNX) ni métricas de calibración más allá de la nota sobre label smoothing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-banking-intent-classifier-68M
- Variante 17M: https://huggingface.co/CobuildX-AI/cbx-bfs-banking-intent-classifier-17M
- Modelo base Ettin encoder 68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Paper BANKING77 (arXiv:2003.04807): https://arxiv.org/abs/2003.04807
- Publicación de OpenRouter sobre Jev vs Claude Opus 5 en clasificación: https://openrouter.ai/blog/insights/jev-vs-claude-opus-5-classification/
