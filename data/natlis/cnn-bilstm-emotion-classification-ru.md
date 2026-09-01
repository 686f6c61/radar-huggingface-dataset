# Natlis/cnn-bilstm-emotion-classification-ru

## Resumen

El modelo `Natlis/cnn-bilstm-emotion-classification-ru` es un clasificador de emociones en audio diseñado específicamente para la lengua rusa. Desarrollado por Natlis, emplea una arquitectura híbrida CNN-BiLSTM que procesa mel-espectrogramas para distinguir entre cuatro estados emocionales: enfado, tristeza, neutralidad y positividad. El modelo se entrenó desde cero sobre el corpus Dusha, un conjunto de datos de habla rusa etiquetado mediante crowdsourcing, y se publica bajo licencia CC BY-SA 4.0.

La relevancia de este modelo radica en su especialización para el ruso, un idioma con escasos recursos abiertos en reconocimiento de emociones del habla (SER). Su tamaño compacto y su arquitectura clásica lo hacen adecuado para integración en sistemas de análisis de voz en tiempo real, aunque requiere un pipeline de preprocesado específico para generar las mel-espectrogramas de entrada. El checkpoint publicado incluye únicamente los pesos del modelo, sin código de inferencia completo, por lo que su uso práctico exige reconstruir la arquitectura y el preprocesado a partir del repositorio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (canales 16/32/64) + BiLSTM (hidden 128, 2 capas, dropout 0.2) + clasificador (dropout 0.3) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (entrada de audio, mel-espectrograma de dimensiones 1×64×T) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura combina una red convolucional con una BiLSTM. La CNN extrae características locales de los mel-espectrogramas mediante tres capas con 16, 32 y 64 canales respectivamente. La salida se alimenta a una BiLSTM de 2 capas con 128 unidades ocultas y dropout 0.2, que modela dependencias temporales en ambas direcciones. Finalmente, un clasificador con dropout 0.3 produce la distribución sobre las cuatro emociones.

El entrenamiento se realizó sobre el corpus `combine_balanced_train` de Dusha, que contiene grabaciones de habla rusa etiquetadas por crowdsourcing (método Dawid-Skene con umbral 0.9). Los hiperparámetros incluyen 30 épocas, batch de 32, tasa de aprendizaje 1e-3, weight decay 1e-5 y semilla 42. No se aplicaron técnicas de RLHF ni DPO, al tratarse de un modelo discriminativo de clasificación. La entrada son mel-espectrogramas de 64 bandas calculados a partir de audio mono remuestreado a 16 kHz, mediante el pipeline del proyecto `ruintona`.

## Capacidades

- Clasificación de emociones en audio ruso en cuatro categorías: enfado, tristeza, neutral y positiva.
- Procesamiento de mel-espectrogramas como entrada, lo que permite trabajar con señales de audio de duración variable (dimensión temporal T).
- Inferencia eficiente gracias a su arquitectura compacta, apta para despliegue en entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente discriminativo de audio.
- No es multilingüe: está entrenado exclusivamente con habla rusa y no se garantiza su rendimiento en otros idiomas.

## Casos de uso

- Análisis de llamadas en centros de atención al cliente: el modelo puede clasificar el tono emocional de conversaciones telefónicas en ruso, permitiendo detectar clientes insatisfechos o enfadados y priorizar su atención. Su entrada de mel-espectrogramas se adapta bien a grabaciones de llamadas de baja calidad.
- Monitoreo de entrevistas de trabajo o sesiones de terapia: al analizar fragmentos de audio, se puede obtener una medida objetiva del estado emocional del hablante, útil para investigación psicológica o evaluación de recursos humanos.
- Asistentes de voz adaptativos: integrado en un sistema de diálogo, el modelo puede ajustar el tono o las respuestas del asistente según la emoción detectada en el usuario, mejorando la experiencia en aplicaciones de banca, salud o educación.
- Etiquetado emocional de contenido multimedia: para archivos de podcasts, vídeos o audiolibros en ruso, el modelo permite generar metadatos emocionales automáticamente, facilitando la búsqueda y recomendación por estado de ánimo.
- Investigación en lingüística y ciencias sociales: los investigadores pueden usar el clasificador para estudiar la variación emocional en corpus de habla espontánea, siempre que el audio se ajuste a la distribución de entrenamiento.
- Sistemas de retroalimentación en plataformas de e-learning: al analizar la voz del estudiante durante ejercicios orales, el modelo puede detectar frustración o aburrimiento y adaptar el contenido didáctico en consecuencia.

## Benchmarks y rendimiento

El autor reporta métricas obtenidas al evaluar el checkpoint entrenado sobre el conjunto de test `dusha_resd_test`, que contiene 6616 grabaciones. No se proporcionan comparaciones con otros modelos en la información disponible.

| Split | Corpus | Accuracy | F1-macro |
|---|---|---|---|
| test | dusha_resd (evaluación cruzada) | 0.740 | 0.732 |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval u otros) al tratarse de un modelo de clasificación de audio, no de un LLM.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM o latencia. Dado el tamaño reducido de la arquitectura (CNN con 64 canales y BiLSTM con 128 unidades), se estima que el modelo ocupa menos de 100 MB en memoria.
- Puede ejecutarse en CPU para inferencia por lotes, aunque para tiempo real se recomienda una GPU de consumo como NVIDIA GTX 1660 o superior.
- Es compatible con cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas integradas en portátiles modernos.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, o exportarse a ONNX para inferencia en producción. No se menciona soporte para vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- El cuello de botella principal no es el modelo en sí, sino el pipeline de extracción de mel-espectrogramas, que requiere remuestreo a 16 kHz y cálculo de filtros mel.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa objetiva con alternativas de la misma categoría (reconocimiento de emociones en habla rusa) sin datos adicionales.

## Limitaciones y advertencias

- El modelo depende de un pipeline de preprocesado específico (construcción de mel-espectrogramas) que no se incluye en el repositorio de HuggingFace; para nuevas grabaciones es necesario replicar el pipeline del proyecto `ruintona`.
- Las etiquetas emocionales se obtuvieron por crowdsourcing con el método Dawid-Skene y un umbral de acuerdo de 0.9, lo que puede introducir sesgos en la anotación y limitar la precisión en emociones ambiguas.
- No se garantiza la transferibilidad a habla espontánea fuera de la distribución del corpus Dusha; el rendimiento puede degradarse con acentos, ruido de fondo o estilos de habla no representados.
- La licencia CC BY-SA 4.0 implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se proporcionan pesos en formato safetensors ni cuantizaciones, lo que limita su uso en entornos con restricciones de memoria o frameworks que requieran esos formatos.
- El modelo solo clasifica cuatro emociones; no cubre estados como miedo, sorpresa o asco, y no ofrece puntuaciones de intensidad emocional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Natlis/cnn-bilstm-emotion-classification-ru
- Paper del corpus Dusha (Kondratenko et al., arXiv:2212.12266): https://arxiv.org/abs/2212.12266
