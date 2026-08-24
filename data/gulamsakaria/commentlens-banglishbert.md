# gulamsakaria/commentlens-banglishbert

## Resumen

CommentLens es un clasificador de comentarios en bengalí y banglish (mezcla de bengalí e inglés) desarrollado por Gulam Sakaria como parte del proyecto CommentLens, orientado a la moderación de comentarios en redes sociales y la detección de desinformación. El modelo es un ajuste fino de `csebuetnlp/banglishbert`, un discriminador ELECTRA preentrenado con el objetivo de Replaced Token Detection (RTD) sobre corpus extensos de bengalí e inglés. CommentLens clasifica comentarios en cinco categorías: `claim`, `general`, `opinion`, `spam-scam` y `toxic`.

Con 110,6 millones de parámetros, el modelo es compacto y adecuado para despliegue en entornos con recursos limitados. El ajuste fino se realizó sobre un conjunto de 32.632 comentarios etiquetados, con una pérdida de entropía cruzada ponderada por clase para mitigar el fuerte desequilibrio de etiquetas. El modelo alcanza una precisión global del 93% en el conjunto de validación, aunque las clases minoritarias (`claim` y `spam-scam`) presentan un rendimiento significativamente inferior y deben tratarse con cautela en producción.

La relevancia del modelo radica en su capacidad para abordar la moderación automática de contenido en bengalí y banglish, un ámbito con escasos recursos supervisados. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño moderado lo hace viable en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminador) |
| Parámetros totales | 110.621.189 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usa `max_length=128`; el modelo base ELECTRA soporta hasta 512) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Bengalí (bn), banglish (mezcla bengalí-inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ELECTRA, concretamente el checkpoint `csebuetnlp/banglishbert`, que es un discriminador preentrenado con el objetivo de Replaced Token Detection (RTD). En este paradigma, el modelo distingue tokens reales de tokens reemplazados por un generador, lo que permite un aprendizaje más eficiente de representaciones contextuales que el enmascaramiento clásico de BERT. El preentrenamiento se realizó sobre corpus extensos de bengalí e inglés, incluyendo formas romanizadas de bengalí (banglish).

El ajuste fino se llevó a cabo sobre el conjunto de datos CommentLens, compuesto por 32.632 comentarios etiquetados manualmente. La distribución de clases era muy desequilibrada: `general` (77%), `opinion` (18%), `toxic` (4%), `spam-scam` (0,6%) y `claim` (0,6%). Para compensar este desequilibrio, se utilizó una función de pérdida de entropía cruzada ponderada por clase. Los hiperparámetros fueron: 6 épocas, tamaño de lote 16, longitud máxima de secuencia 128 tokens y tasa de aprendizaje 2e-5.

## Capacidades

- Clasificación de comentarios en cinco categorías: `claim`, `general`, `opinion`, `spam-scam` y `toxic`.
- Procesamiento de texto en bengalí nativo y en banglish (mezcla de bengalí e inglés, incluida la transliteración a caracteres latinos).
- Detección de toxicidad, spam, opiniones y afirmaciones verificables en comentarios de redes sociales.
- Inferencia de bajo coste: al ser un modelo de 110 millones de parámetros, puede ejecutarse en CPU y en GPU de consumo sin necesidad de cuantización.
- Integración sencilla con la biblioteca `transformers` de Hugging Face mediante la API estándar de clasificación de secuencias.

## Casos de uso

- Moderación de comentarios en plataformas sociales bengalíes: el modelo puede filtrar automáticamente comentarios tóxicos, spam o estafas antes de su publicación, reduciendo la carga de moderadores humanos. Su tamaño compacto permite procesar grandes volúmenes de comentarios en tiempo real.
- Detección de desinformación: la clase `claim` permite marcar comentarios que contienen afirmaciones verificables, lo que facilita la priorización de revisiones por parte de verificadores de hechos en campañas de lucha contra la desinformación en bengalí.
- Análisis de opinión pública: la clase `opinion` permite extraer de manera agregada la proporción de comentarios de opinión frente a informativos en debates sociales o políticos, útil para investigación social y periodismo de datos.
- Filtrado de spam y estafas en grupos de Facebook y Telegram: la clase `spam-scam` detecta mensajes fraudulentos o publicidad engañosa, que pueden bloquearse automáticamente en comunidades bengalás.
- Monitorización de marca: empresas que operan en Bangladesh pueden usar el modelo para clasificar comentarios en sus páginas sociales, identificando quejas, toxicidad o spam para priorizar respuestas de atención al cliente.
- Investigación académica en PNL de bajos recursos: el modelo sirve como punto de partida para estudios sobre moderación de contenido en lenguas minoritarias, y su peso está disponible bajo licencia Apache-2.0 para experimentación y extensión.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card, sobre un conjunto de validación de 4.895 comentarios, son los siguientes:

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| claim | 0.52 | 0.56 | 0.54 | 27 |
| general | 0.97 | 0.95 | 0.96 | 3768 |
| opinion | 0.84 | 0.92 | 0.88 | 875 |
| spam-scam | 0.96 | 0.93 | 0.95 | 28 |
| toxic | 0.77 | 0.79 | 0.78 | 197 |

- Precisión global: 93%
- F1 macro: 0.82
- F1 ponderado: 0.93

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 110,6 millones de parámetros. En fp32, los pesos ocupan aproximadamente 442 MB; en fp16, 221 MB. Con activaciones y overhead de inferencia, se recomienda al menos 1-2 GB de VRAM en GPU, o 2-4 GB de RAM en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de consumo como RTX 3050, GTX 1650 o superiores. En entornos profesionales, puede ejecutarse en T4, A10 o A100 sin problemas.
- Compatibilidad con CPU: sí, el modelo puede ejecutarse en CPU con un rendimiento aceptable para lotes pequeños (por ejemplo, decenas de comentarios por segundo en un procesador moderno).
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (gracias a los pesos ONNX disponibles), y cualquier servicio que soporte el formato ONNX (por ejemplo, `onnxruntime` en servidores). No se ha confirmado compatibilidad con vLLM o TGI, pero al ser un modelo estándar de `transformers`, es probable que funcione con adaptadores.
- Latencia estimada: no disponible, pero para un modelo de 110M con secuencias de 128 tokens, la latencia por muestra en GPU es típicamente inferior a 10 ms; en CPU, del orden de 50-100 ms.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos con otros modelos de clasificación de comentarios en bengalí en la información disponible. Sin embargo, se puede contextualizar el modelo frente a sus alternativas:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `commentlens-banglishbert` (este) | ELECTRA | 110 M | No disponible | Apache-2.0 | Clasificación de comentarios (5 clases) |
| `csebuetnlp/banglishbert` (base) | ELECTRA | 110 M | 512 (típico) | Apache-2.0 | Preentrenamiento general para código mixto |
| `csebuetnlp/banglabert` (base) | BERT | 110 M | 512 | Apache-2.0 | Preentrenamiento en bengalí nativo |

No se dispone de datos de rendimiento comparado de estos modelos en la tarea específica de moderación de comentarios. El modelo base `banglishbert` es un checkpoint de preentrenamiento, no un clasificador listo para producción, por lo que este modelo ajustado ofrece una ventaja práctica inmediata.

## Limitaciones y advertencias

- Las clases minoritarias `claim` y `spam-scam` tienen un soporte muy bajo en el conjunto de validación (27 y 28 muestras, respectivamente), lo que implica que las métricas de F1 (0.54 y 0.95) no son estadísticamente robustas. En producción, las predicciones para estas clases deben ser revisadas manualmente o complementadas con otros sistemas.
- El modelo se ha entrenado específicamente en comentarios de redes sociales en bengalí y banglish. Su rendimiento fuera de este dominio (por ejemplo, en texto formal, noticias o conversaciones de otro registro) puede degradarse.
- La ventana de contexto se fijó en 128 tokens durante el entrenamiento. Comentarios más largos deben truncarse, lo que puede perder información relevante.
- Aunque la licencia Apache-2.0 permite uso comercial, no se han publicado evaluaciones de sesgos (por ejemplo, sesgos de género, religión o política) del modelo. El autor no documenta un proceso de mitigación de sesgos.
- La precisión global del 93% puede inducir a sobreconfianza, pero el F1 macro es de solo 0.79, lo que indica que el modelo es mucho menos efectivo en las clases minoritarias.
- No se especifican detalles del conjunto de datos de entrenamiento (procedencia, criterios de etiquetado, acuerdos de inter-anotador), lo que limita la reproducibilidad y la evaluación de calidad de las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gulamsakaria/commentlens-banglishbert
- Perfil del autor en Hugging Face: https://huggingface.co/gulamsakaria
- Modelo base BanglishBERT: https://huggingface.co/csebuetnlp/banglishbert
- Repositorio GitHub de BanglaBERT (incluye BanglishBERT): https://github.com/csebuetnlp/banglabert
- Artículo y documentación sobre BanglishBERT (Emergent Mind): https://www.emergentmind.com/topics/banglishbert-model
