# Natlis/cnn-emotion-classification-ru

## Resumen

El modelo `Natlis/cnn-emotion-classification-ru` es un clasificador de emociones en audio en lengua rusa, desarrollado por Natlis. Se trata de una red neuronal convolucional (CNN) que toma como entrada mel-espectrogramas y predice una de cuatro emociones: enfado, tristeza, neutralidad y positividad. El modelo fue entrenado desde cero sobre el corpus Dusha, un conjunto de datos de habla rusa con etiquetas de emoción obtenidas mediante crowdsourcing y agregadas con el método Dawid-Skene.

Este modelo es relevante como línea base (baseline) para tareas de reconocimiento de emociones en el habla (SER) en ruso, un idioma con menos recursos que el inglés. Su arquitectura es sencilla (canales 16/32/64 con dropout) y su tamaño es reducido, lo que permite su ejecución en hardware modesto. Aunque su precisión es moderada (accuracy 0.571 en el conjunto de test), sirve como punto de partida para investigaciones y aplicaciones que requieran análisis de emociones en audio ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EmotionCNN, canales 16/32/64, dropout 0.2) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrada: mel-espectrograma de dimensiones 1x64xT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura CNN simple: tres capas convolucionales con 16, 32 y 64 canales respectivamente, seguidas de un clasificador con dropout de 0.2. La entrada es un mel-espectrograma de forma (1, 64, T), donde T es la dimensión temporal, generado por el pipeline de procesamiento de datos del proyecto `ruintona`. No se especifica el número total de parámetros, pero por la estructura se trata de un modelo ligero.

El entrenamiento se realizó sobre el corpus `combine_balanced_train`, que combina datos del corpus Dusha con mel-espectrogramas precalculados. Los hiperparámetros documentados son: 5 épocas, tamaño de lote 16, tasa de aprendizaje 1e-3, weight decay 1e-5 y semilla 42. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar con etiquetas de emoción. Las etiquetas fueron asignadas mediante crowdsourcing con agregación Dawid-Skene y un umbral de confianza de 0.9.

## Capacidades

- Clasificación de emociones en audio ruso: predice una de cuatro clases (`angry`, `sad`, `neutral`, `positive`).
- Procesamiento de señales de audio: requiere mel-espectrogramas precalculados como entrada, no audio crudo.
- Inferencia rápida y ligera: al ser una CNN pequeña, es adecuada para entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No tiene modo de pensamiento (thinking mode) ni generación de texto.

## Casos de uso

- Análisis de sentimiento en llamadas de atención al cliente: el modelo puede clasificar el tono emocional de grabaciones de voz en ruso, permitiendo a las empresas identificar interacciones negativas o positivas para mejorar el servicio.
- Monitoreo de emociones en plataformas de telemedicina: en consultas médicas por voz, puede ayudar a detectar estados emocionales del paciente (tristeza, enfado) para priorizar atención o alertar al profesional.
- Investigación en lingüística computacional: como baseline para estudios sobre reconocimiento de emociones en ruso, comparando su rendimiento con modelos más complejos.
- Sistemas de retroalimentación en aplicaciones de aprendizaje de idiomas: evaluar la entonación emocional del estudiante al hablar ruso, ofreciendo correcciones sobre la expresividad.
- Análisis de contenido multimedia: clasificar emociones en podcasts, audiolibros o vídeos en ruso para etiquetado automático o recomendación de contenido.
- Prototipos de asistentes de voz empáticos: integrar el modelo en un pipeline de procesamiento de audio para que un asistente virtual adapte su respuesta según el estado emocional del usuario.

## Benchmarks y rendimiento

El autor proporciona métricas obtenidas al evaluar el checkpoint entrenado sobre el conjunto de test `dusha_resd_test` (6616 registros). No se ofrecen comparaciones con otros modelos.

| Split | Corpus | Accuracy | F1-macro |
|---|---|---|---|
| test | dusha_resd (evaluación cruzada) | 0.571 | 0.564 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Al ser una CNN pequeña (canales 16/32/64) y con entrada de mel-espectrogramas, el modelo es muy ligero.
- Puede ejecutarse en CPU sin problemas; no se requiere GPU para inferencia.
- La VRAM estimada es mínima (probablemente menos de 1 GB), aunque no se especifica oficialmente.
- Es compatible con GPUs de gama baja como NVIDIA GTX 1050 o superiores, así como con hardware de consumo.
- Opciones de despliegue: al ser un checkpoint PyTorch, puede integrarse en cualquier framework que soporte PyTorch (por ejemplo, TorchServe, FastAPI con carga manual). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia es baja, del orden de milisegundos por muestra, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación de emociones en audio ruso. Existen alternativas como `ilyali034/rubert-emotion-ru` (clasificación de emociones en texto ruso) o `Panda0116/emotion-classification-model` (texto en inglés), pero no son directamente comparables por la modalidad (audio vs texto) y el idioma. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es una línea base (baseline) y su precisión es moderada (accuracy 0.571), por lo que puede cometer errores en entornos ruidosos o con acentos variados.
- Las etiquetas de emoción provienen de crowdsourcing con umbral 0.9, lo que puede introducir ruido o ambigüedad en las clases.
- Solo soporta el idioma ruso; no es aplicable a otros idiomas sin reentrenamiento.
- Requiere mel-espectrogramas precalculados; no procesa audio crudo directamente, lo que obliga a integrar un pipeline de extracción de características.
- La licencia CC BY-SA 4.0 implica que las obras derivadas deben compartirse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se documentan sesgos específicos, pero al entrenarse en un corpus concreto (Dusha) puede reflejar sesgos demográficos o de registro de habla presentes en ese corpus.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Natlis/cnn-emotion-classification-ru)
- [Paper del corpus Dusha (arXiv:2212.12266)](https://arxiv.org/abs/2212.12266)
