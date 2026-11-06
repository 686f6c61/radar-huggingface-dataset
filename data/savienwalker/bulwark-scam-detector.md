# SavienWalker/bulwark-scam-detector

## Resumen

Bulwark Scam Detector es un clasificador de texto multilingüe especializado en la detección de mensajes fraudulentos, spam y mensajes legítimos, con un enfoque particular en turco. Lo desarrolla SavienWalker y se construye mediante fine-tuning sobre Horizon-Labs/phishing-scam-detector-base, un modelo mmBERT-base de 307 millones de parámetros, que a su vez deriva de jhu-clsp/mmBERT-base. El problema que aborda es concreto: los clasificadores genéricos de phishing entrenados con datos sintéticos y texto web tienden a producir falsos positivos masivos sobre notificaciones institucionales reales (bancos, operadores logísticos, e-Devlet, códigos OTP), lo que los hace inutilizables en producción.

La propuesta del autor es corregir ese sesgo manteniendo la capacidad de detección. Según la model card, sobre un conjunto retenido de SMS reales turcos el modelo base marcaba como no deseados el 53% de los mensajes legítimos, mientras que Bulwark reduce esa tasa al 14% conservando una detección de mensajes no deseados del 98%. Es un modelo de clasificación de tres clases (`legitimate`, `spam`, `fraud`) con una regla de decisión recomendada basada en la suma de probabilidades de spam y fraude.

El modelo es relevante ahora porque ataca un fallo de despliegue muy común en filtros antiphishing: no basta con alta recall, hace falta una tasa de falsos positivos tolerable sobre tráfico legítimo real. Su tamaño (307M parámetros) permite inferencia en CPU o GPU modesta, y su licencia Apache-2.0 facilita integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base, base de ModernBERT) |
| Parámetros totales | 307.532.547 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 256 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización estándar aplicable vía herramientas externas) |
| Idiomas soportados | tr, en, multilingual (probado en de, fr, es, pt, ru, ar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo BERT moderno (mmBERT-base), con 307M parámetros y cabeza de clasificación de secuencias para tres etiquetas. No es un modelo generativo ni un MoE: es un clasificador discriminativo pensado para inferencia de baja latencia sobre mensajes cortos.

El entrenamiento parte de Horizon-Labs/phishing-scam-detector-base y utiliza aproximadamente 9.000 mensajes. De ellos, unos 8.000 son mensajes sintéticos en turco generados a partir de 190 plantillas escritas a mano con relleno de slots (institución, importe, fecha, código, dominio similar al real), cubriendo notificaciones institucionales reales, anuncios de negocios reales, phishing con enlace e ingeniería social sin enlace. Los patrones se inspiraron en advertencias públicas (KGM, SGK, PTT, EGM) y narrativas de quejas públicas, sin copiar texto de quejas. El resto, unos 1.000 mensajes en inglés, proviene del UCI SMS Spam Collection (CC BY 4.0) y se usa como datos de replay para mitigar el olvido catastrófico; la distinción spam/fraude para esos mensajes se tomó del propio modelo base. La model card no detalla uso de RLHF, DPO ni una fase de alineación adicional.

La innovación destacable no es arquitectónica sino de datos y calibración: el ajuste se orienta explícitamente a reducir falsos positivos sobre mensajes institucionales reales, y se define un umbral de decisión (`p(spam) + p(fraud) > 0.6`) seleccionado sobre el split de desarrollo y almacenado en `bulwark_config.json`.

## Capacidades

- Clasificación de texto en tres clases: `legitimate`, `spam` y `fraud`.
- Detección de phishing con enlace (dominios similares a los oficiales) e ingeniería social sin enlace.
- Detección de smishing en SMS y clasificación de correo electrónico corto.
- Especialización en turco con preservación de la capacidad multilingüe del modelo base.
- Capacidad multilingüe verificada en una sonda fácil con de, fr, es, pt, ru y ar (54/54 de acierto en tres clases).
- Soporte de tool calling / function calling: no disponible (es un clasificador, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajería: el modelo clasifica cada SMS entrante y la regla `p(spam) + p(fraud) > 0.6` permite enrutar a cuarentena o marcar como sospechoso, con una tasa de falsos positivos del 14% sobre SMS legítimos reales según la evaluación del autor.
- Protección de bandejas de correo corporativas en Turquía: clasificación de notificaciones de banco, cargo, e-Devlet y operadores para evitar que los filtros bloqueen comunicaciones legítimas, que es precisamente el fallo que el modelo corrige respecto a su base.
- Moderación de mensajes en apps de mensajería y marketplaces: separar anuncios de negocios reales (`spam`) de intentos de fraude (`fraud`) permite aplicar políticas distintas, como etiquetar o bloquear.
- Detección de smishing en banca móvil: análisis de SMS y notificaciones push antes de mostrar enlaces al usuario, con especial utilidad frente a dominios de imitación de entidades financieras.
- Enriquecimiento de pipelines antifraude: el modelo actúa como señal previa de bajo coste (307M parámetros) antes de modelos más caros o revisiones humanas, reduciendo el volumen a escalar.
- Investigación y evaluación de robustez: el benchmark SavienWalker/bulwark-bench-tr y los conjuntos de pares de contraste permiten reproducir la comparación base vs. fine-tune y medir si un clasificador lee señales reales (dominio, petición, tono) en lugar del tema.
- Filtrado multilingüe básico: para mensajes en de, fr, es, pt, ru o ar, la sonda del autor no muestra regresión, por lo que puede usarse como primera capa en despliegues multilingües, aunque los casos difíciles fuera del turco no se han medido.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparación entre modelo base y Bulwark sobre los mismos mensajes):

| Conjunto | Tipo | Métrica | Base | Bulwark |
|---|---|---|---|---|
| SMS reales, mitad de test (212) | real, retenido | falsa alarma ↓ | 53% | 14% |
| | | no deseados detectados ↑ | 100% | 98% |
| Correo real (40) | real, desarrollo | falsa alarma ↓ | 33% | 19% |
| Hard set v2 (60) | sintético, revisado | fraude detectado ↑ | 82% | 95% |
| | | falsa alarma ↓ | 25% | 0% |
| | | pares de contraste correctos ↑ | 9/13 | 12/13 |
| Hard set v1 (42) | sintético, revisado | pares de contraste correctos ↑ | 5/7 | 7/7 |
| UCI SMS Spam, mitad retenida (2.787) | real, inglés | no deseados detectados ↑ | 87% | 96% |
| Sonda multilingüe (54; de, fr, es, pt, ru, ar) | sintético, fácil | accuracy 3 clases | 54/54 | 54/54 |

Además, en la mitad de test de SMS reales la precisión de tres clases pasa del 64% al 87%, y la etiqueta `fraud` sobre mensajes legítimos baja del 26% al 9%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 y alrededor de 1,2 GB en fp32 para los 307M parámetros, más el overhead de activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: Transformers con PyTorch, ONNX Runtime, TGI, vLLM (soporte de encoders), o exportación a GGUF para llama.cpp/Ollama si se convierte el clasificador.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, es un modelo de inferencia en milisegundos por mensaje en GPU y viable en CPU para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SavienWalker/bulwark-scam-detector | 307M | no disponible | Clasificación scam/spam/legítimo, especializado en turco | Apache-2.0 | Hugging Face |
| Horizon-Labs/phishing-scam-detector-base | 307M | no disponible | Clasificación phishing/scam (modelo base) | Apache-2.0 | Hugging Face |
| jhu-clsp/mmBERT-base | no disponible | no disponible | Encoder multilingüe base | MIT | Hugging Face |

La comparación principal es contra su propio modelo base: Bulwark reduce la falsa alarma del 53% al 14% en SMS reales y mantiene la detección en el 98%, a costa de una ligera pérdida de recall (100% a 98%). Frente a mmBERT-base no hay datos de clasificación de fraude publicados en la información disponible. No se dispone de comparativas con otros clasificadores antiphishing de la misma categoría.

## Limitaciones y advertencias

- Sesgo de dominio: el ajuste está pensado para el contexto turco; el rendimiento en otros idiomas solo se ha comprobado con una sonda fácil y no se midieron casos difíciles fuera del turco.
- Riesgo de sobreajuste a plantillas: los conjuntos difíciles y las plantillas de entrenamiento fueron escritos por el mismo autor (un LLM, Claude), por lo que puede existir solapamiento de estilo que infle las métricas sintéticas.
- Datos reales limitados: el único número real completamente limpio es la mitad de test de SMS; el conjunto de correo se usó para análisis de errores y se reporta como desarrollo.
- Recall de fraude real no medido: la mitad de test de SMS reales no contiene fraude real no ambiguo (casi todo es publicidad de apuestas ilegales), por lo que la detección de fraude se mide solo sobre conjuntos sintéticos.
- Inglés en distribución: la mitad del UCI SMS Spam Collection se usó como replay, así que la mejora en inglés es en distribución; la afirmación honesta del autor es "sin regresión", no "mejor que el base".
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en mensajes ambiguos o fuera de distribución.
- Umbral dependiente del contexto: la regla `p(spam) + p(fraud) > 0.6` se eligió sobre el split de desarrollo; en producción conviene recalibrar según el coste relativo de falsos positivos y falsos negativos.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y mmBERT tienen sus propias licencias (Apache-2.0 y MIT) que deben respetarse en la cadena de derivación.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SavienWalker/bulwark-scam-detector
- Modelo base: https://huggingface.co/Horizon-Labs/phishing-scam-detector-base
- Modelo mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio de código: https://github.com/SavienWalker/bulwark
- Benchmark: https://huggingface.co/datasets/SavienWalker/bulwark-bench-tr
- UCI SMS Spam Collection: no disponible en la información proporcionada (referenciado en la model card como CC BY 4.0)
