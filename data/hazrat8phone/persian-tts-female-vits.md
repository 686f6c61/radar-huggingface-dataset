# Hazrat8phone/persian-tts-female-vits

## Resumen

El modelo `persian-tts-female-vits` es un sistema de síntesis de voz (text-to-speech) en persa (farsi) desarrollado por Hazrat8phone, basado en la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). Se trata de un modelo de un solo hablante con voz femenina, entrenado sobre el dataset `persian-tts-dataset` disponible en Kaggle. El modelo se distribuye a través de la librería Coqui TTS y está pensado para generar audio natural a partir de texto en persa.

La relevancia de este modelo radica en que cubre una necesidad específica: síntesis de voz en persa con una calidad aceptable, un idioma con menos recursos que el inglés u otros mayoritarios. Al estar basado en VITS, ofrece una generación de audio de una sola etapa, sin necesidad de vocoder separado, lo que simplifica el despliegue. El repositorio tiene un tamaño de 8,1 GB, lo que sugiere que incluye checkpoints de entrenamiento completos, aunque para inferencia se puede cargar el modelo con pesos reducidos.

El modelo se publica bajo licencia OpenRAIL, que permite uso comercial con restricciones de uso responsable. No se han publicado métricas de rendimiento ni benchmarks en la información disponible, por lo que su evaluación debe basarse en pruebas prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la entrada de texto, típicamente frases cortas) |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint de PyTorch) |
| Idiomas soportados | Persa (fa) |
| Licencia | OpenRAIL |
| Formato de pesos | Checkpoint PyTorch (.pth) y config.json, compatible con Coqui TTS |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, que combina un encoder de texto, un normalizing flow para modelar la distribución latente y un decoder basado en redes convolucionales, todo entrenado de forma adversarial con un discriminador. Esta arquitectura permite generar audio directamente desde el texto sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el pipeline de inferencia.

Según la información del autor, el modelo se entrenó durante 10 horas en la plataforma Kaggle, utilizando el dataset `persian-tts-dataset` (enlace a Kaggle). No se especifican detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineamiento adicionales. El checkpoint disponible (`best_model_30824.pth`) corresponde al mejor modelo según la métrica de validación durante el entrenamiento.

## Capacidades

- Generación de voz femenina en persa a partir de texto, con una entonación natural para frases cortas y medias.
- Síntesis de audio en formato WAV, lista para usar en aplicaciones de reproducción.
- Integración sencilla con la librería Coqui TTS, tanto desde línea de comandos como mediante API de Python.
- Soporte para texto en persa con signos de puntuación y números (aunque la precisión con números y abreviaturas puede variar).
- No incluye capacidades de tool calling, agentes, razonamiento ni procesamiento multimodal; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Audiolibros en persa: el modelo puede convertir texto de libros o artículos en audio, permitiendo la creación de audiolibros para plataformas de distribución. Su voz femenina natural es adecuada para narración, aunque se recomienda segmentar el texto en frases para evitar errores en párrafos largos.
- Asistentes de voz para aplicaciones móviles: integrable en asistentes personales o chatbots que respondan en persa, proporcionando una salida de voz clara y comprensible. La baja latencia de VITS permite respuestas casi en tiempo real.
- Accesibilidad para personas con discapacidad visual: conversión de contenido digital (noticias, documentos, mensajes) a audio, facilitando el acceso a la información en persa.
- Sistemas de navegación GPS en persa: generación de instrucciones de navegación habladas, con la posibilidad de pre-generar frases comunes para reducir la carga computacional en dispositivos embebidos.
- Contenido educativo: creación de lecciones en audio para plataformas de e-learning, permitiendo a estudiantes escuchar material en persa mientras realizan otras tareas.
- Doblaje de vídeos o podcasts: el modelo puede generar pistas de voz para vídeos explicativos o podcasts, aunque al ser de un solo hablante, no es adecuado para diálogos con múltiples voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de TTS como MOS (Mean Opinion Score) o WER (Word Error Rate). Se recomienda realizar una evaluación subjetiva de calidad de audio y precisión de pronunciación antes de su uso en producción.

## Requisitos de hardware

- El checkpoint completo ocupa 8,1 GB, pero para inferencia se puede cargar solo el modelo (probablemente unos cientos de MB). No se dispone del tamaño exacto del modelo en memoria.
- VRAM estimada para inferencia: entre 1 y 2 GB en GPU, suficiente para ejecutar el modelo en tarjetas como NVIDIA GTX 1060, RTX 2060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como RTX 3050, RTX 3060, o GPUs de datacenter como T4 o A10.
- Es posible ejecutar en consumer GPU de gama baja, siempre que se disponga de al menos 4 GB de RAM del sistema.
- Opciones de despliegue: al ser un modelo de Coqui TTS, se puede servir mediante la API de Coqui, o integrarse en aplicaciones Python. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia estimada: para frases cortas (menos de 20 palabras), la generación en GPU tarda menos de 1 segundo; en CPU puede tardar entre 2 y 5 segundos, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS en persa comparables con métricas objetivas. Existen alternativas como los modelos de Coqui TTS para otros idiomas, o servicios comerciales como Google Cloud TTS o Azure TTS que soportan persa, pero no son directamente comparables por su naturaleza propietaria. Se puede mencionar que el modelo `Kamtera/persian-tts-female-vits` parece ser una copia o re-subida del mismo modelo, pero no hay diferencias documentadas.

## Limitaciones y advertencias

- Modelo de un solo hablante (voz femenina), por lo que no es adecuado para aplicaciones que requieran múltiples voces o cambio de locutor.
- Entrenado únicamente en persa; no soporta otros idiomas ni mezclas de idiomas.
- La calidad de la pronunciación puede degradarse con texto que contenga números, símbolos o palabras extranjeras no transliteradas.
- No se han publicado evaluaciones de sesgos, pero al ser un modelo entrenado con un dataset específico, puede reflejar sesgos de género (voz femenina) y de registro lingüístico del dataset.
- Riesgo de alucinación: en TTS, esto se manifiesta como errores de pronunciación o entonación inapropiada en frases complejas. Se recomienda validar la salida en casos críticos.
- Licencia OpenRAIL: permite uso comercial, pero incluye restricciones de uso responsable (no usar para suplantación de identidad, difusión de desinformación, etc.). Es necesario revisar los términos completos de la licencia antes de su implementación en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco utilizado; la comunidad no ha validado su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hazrat8phone/persian-tts-female-vits
- Repositorio de GitHub del autor: https://github.com/karim23657/Persian-tts-coqui
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Kamtera/Persian-tts-CoquiTTS
- Dataset en Kaggle: https://www.kaggle.com/datasets/magnoliasis/persian-tts-dataset-famale
- Página alternativa del modelo (posible re-subida): https://huggingface.co/Kamtera/persian-tts-female-vits
