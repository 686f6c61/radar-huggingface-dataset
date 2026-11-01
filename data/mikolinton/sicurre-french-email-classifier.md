# Mikolinton/sicurre-french-email-classifier

## Resumen

Sicurre French e-mail classifier es un modelo de clasificación de texto en francés desarrollado por Mikolinton, autor del proyecto Sicurre, una herramienta de detección de phishing orientada a pequeñas empresas francesas. El modelo distingue tres clases de correo electrónico: phishing, spam y legítimo, y actúa como la etapa de aprendizaje automático dentro de un pipeline que también incorpora reglas heurísticas y listas de bloqueo.

Técnicamente se trata de un fine-tuning de CamemBERTaV2, el modelo base de 111 millones de parámetros de la familia CamemBERT (arquitectura transformer encoder de tipo RoBERTa adaptada al francés). El modelo se distribuye tanto en formato PyTorch (safetensors) como en ONNX, lo que permite servirlo en CPU sin necesidad de GPU, algo relevante para el público objetivo del proyecto: pequeñas organizaciones con infraestructura limitada.

La relevancia actual del modelo radica en su enfoque práctico y su transparencia metodológica: el autor publica el dataset sintético de plantillas, el cuaderno de entrenamiento reproducible y una evaluación separada del conjunto de test que revela limitaciones reales del modelo (F1 ponderado de 0,86 en correos escritos de forma independiente, frente al 0,999 en el test sintético). Es un ejemplo de model card honesta sobre el alcance de sus métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERTaV2, base de CamemBERT/RoBERTa) |
| Parámetros totales | 111.209.475 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrada en entrenamiento) |
| Tipos de cuantización | no disponible (se distribuyen pesos completos en safetensors y ONNX; el modelo es compatible con cuantización estándar de transformers/ONNX Runtime, pero el autor no publica variantes cuantizadas) |
| Idiomas soportados | francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) y ONNX (model.onnx), aproximadamente 445 MB cada uno |
| Tarea | Clasificación de texto multietiqueta única (3 clases) |
| Etiquetas | 0 = phishing, 1 = spam, 2 = legítimo |
| Versión | 1.0.30 |
| Modelo base | almanach/camembertav2-base |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de clasificación sobre CamemBERTaV2, un transformer encoder de 111 millones de parámetros preentrenado en francés. La cabeza de clasificación produce tres logits correspondientes a las clases phishing, spam y legítimo. La entrada se trunca a 256 tokens, por lo que la decisión recae sobre el asunto y el inicio del cuerpo del correo.

El entrenamiento se realizó sobre 43.700 correos franceses divididos 80/10/10 (34.960 de entrenamiento, 4.369 de validación y 4.371 de test). El 86% de las filas provienen de generadores propios del proyecto Sicurre, que expanden plantillas francesas con nombres, importes, fechas y organizaciones variables; el 14% restante procede de corpus públicos de Kaggle (spam multilingüe y spam/ham francés). Se entrenó durante 4 épocas con AdamW (learning rate 2e-5, weight decay 0,01), decaimiento lineal tras 874 pasos de warm-up, batch de 16 con precisión mixta, focal loss con gamma 1,5, pesos por frecuencia inversa de clase y label smoothing de 0,1, semilla 42 y una única GPU de Kaggle. El preprocesamiento sustituye URLs, correos, teléfonos e IBAN por tokens especiales (`[URL]`, `[EMAIL]`, `[PHONE]`, `[IBAN]`) y estructura la entrada como `Objet : <asunto>` seguido de línea en blanco y cuerpo.

## Capacidades

- Clasificación de correo electrónico en francés en tres categorías: phishing, spam y legítimo.
- Detección de indicadores típicos de phishing: urgencia, solicitud de datos bancarios, enlaces sospechosos, suplantación de entidades.
- Procesamiento de asunto y cuerpo conjuntamente, con hasta 256 tokens.
- Inferencia en CPU mediante ONNX Runtime con longitud de secuencia dinámica (sin padding en correos cortos).
- Compatibilidad con el pipeline `text-classification` de transformers y con Text Embeddings Inference (endpoints compatibles).
- Salida de probabilidades por clase (con `top_k=None` se obtienen las tres puntuaciones).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Filtrado de correo en pymes francesas: integrado como una señal más dentro de un pipeline con reglas y listas de bloqueo, tal como lo usa el proyecto Sicurre, para marcar correos sospechosos antes de que lleguen al usuario.
- Pasarela de correo corporativo: clasificación previa de mensajes entrantes en un servidor SMTP o servicio de seguridad, usando la versión ONNX en CPU para evitar costes de GPU.
- Etiquetado y triaje en bandejas de soporte: separar automáticamente correos de phishing reportados por empleados frente a spam comercial y comunicaciones legítimas.
- Generación de datos de entrenamiento y aumento de datasets: el modelo puede preetiquetar grandes volúmenes de correo francés para su revisión humana posterior, reduciendo el coste de anotación.
- Base para fine-tuning específico de dominio: al distribuirse con licencia MIT y pesos PyTorch, una organización puede reentrenarlo con su propio corpus de correo (por ejemplo, de un sector concreto) partiendo de un modelo ya adaptado al francés y a la tarea.
- Investigación en detección de phishing: el modelo, su dataset sintético y el cuaderno de entrenamiento reproducible permiten experimentar con técnicas de aumento de datos, focal loss y evaluación fuera de distribución.
- Moderación de formularios y mensajes de contacto: el mismo clasificador puede aplicarse a mensajes de formularios web en francés que imiten patrones de spam o fraude.

## Benchmarks y rendimiento

Conjunto de test reservado (4.371 correos, mismas fuentes que el entrenamiento):

| Clase | Precisión | Recall | F1 | Correos |
|---|---|---|---|---|
| Phishing | 1,000 | 1,000 | 1,000 | 1.772 |
| Spam | 0,998 | 0,998 | 0,998 | 1.156 |
| Legítimo | 0,999 | 0,999 | 0,999 | 1.443 |

Exactitud y F1 ponderado: 0,999.

Conjunto de release (95 correos franceses escritos y revisados de forma independiente: 42 phishing, 11 spam, 42 legítimos):

| Métrica | Resultado |
|---|---|
| F1 ponderado | 0,86 |
| Recall de phishing | 0,81 (34 de 42) |
| Correos legítimos marcados como sospechosos | 4 de 42 |

El propio autor advierte que el test comparte plantillas con el entrenamiento y que el conjunto de release es la referencia más exigente; ambos son sintéticos, por lo que recomienda medir el modelo sobre correo propio antes de fijar umbrales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (111 millones de parámetros, aproximadamente 445 MB de pesos); en FP16 alrededor de 250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Funciona correctamente en RTX 3060, RTX 4090 o GPUs integradas.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU: la versión ONNX está pensada para servir en CPU.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime, Text Embeddings Inference (endpoints compatibles), vLLM y TGI no están documentados por el autor para este modelo, aunque al ser un encoder estándar de transformers deberían poder adaptarse.
- Latencia y throughput: no disponibles en la información proporcionada. La longitud máxima de 256 tokens y el tamaño reducido del modelo sugieren una latencia baja en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sicurre French e-mail classifier | 111 M | 256 tokens | Clasificación phishing/spam/legítimo en francés | MIT | HuggingFace (PyTorch y ONNX) |
| almanach/camembertav2-base | 111 M | 512 tokens (modelo base) | Modelo de lenguaje enmascarado en francés | MIT | HuggingFace |
| CamemBERT (camembert-base) | 110 M | 512 tokens | Modelo de lenguaje enmascarado en francés | MIT | HuggingFace |

No se dispone de información sobre otros clasificadores de phishing en francés comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta francés; no está entrenado para otros idiomas.
- La ventana de 256 tokens implica que correos largos se truncan y la decisión depende del asunto y del inicio del cuerpo; información relevante al final del mensaje puede ignorarse.
- El conjunto de test comparte plantillas con el entrenamiento, por lo que sus métricas (0,999) sobreestiman el rendimiento real. La evaluación independiente (F1 0,86, recall de phishing 0,81) es más representativa.
- El 86% de los datos de entrenamiento son sintéticos y generados a partir de plantillas del autor; el modelo puede no generalizar bien a campañas de phishing reales con estilos no representados.
- En el conjunto de release, 4 de cada 42 correos legítimos se marcaron como sospechosos, lo que implica falsos positivos que pueden afectar a usuarios finales.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas con confianza alta en dominios fuera de distribución.
- El autor recomienda usarlo como una señal más junto con reglas y listas de bloqueo, no como único criterio de decisión.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantías del autor sobre el rendimiento en producción.
- No se publican datos sobre sesgos demográficos, geográficos o de otro tipo en el corpus de entrenamiento.
- El modelo fue creado y actualizado en octubre de 2026 según los metadatos de HuggingFace; la versión es 1.0.30.

## Enlaces

- HuggingFace: https://huggingface.co/Mikolinton/sicurre-french-email-classifier
- Modelo base: https://huggingface.co/almanach/camembertav2-base
- Dataset: https://huggingface.co/datasets/Mikolinton/sicurre-french-emails
- Cuaderno de entrenamiento: `training/train_classifier.ipynb` (incluido en el repositorio del modelo)
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios independientes) en la información proporcionada.
