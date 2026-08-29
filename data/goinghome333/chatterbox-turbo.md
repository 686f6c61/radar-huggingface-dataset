# GoingHome333/chatterbox-turbo

## Resumen

Chatterbox-Turbo es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Resemble AI, diseñado para ofrecer una generación de habla de alta calidad con un coste computacional y de memoria reducido. Con una arquitectura de 350 millones de parámetros, este modelo se posiciona como la opción más eficiente de la familia Chatterbox, que también incluye variantes multilingües y de mayor tamaño. Su principal innovación es un decodificador de tokens de habla a mel destilado que reduce el proceso de generación de 10 pasos a uno solo, manteniendo una fidelidad de audio alta.

El modelo está orientado a casos de uso en producción, especialmente agentes de voz de baja latencia, aunque también destaca en tareas de narración y creación de contenido. Incluye soporte nativo para etiquetas paralingüísticas como `[laugh]` o `[chuckle]`, lo que permite añadir expresividad y realismo a la voz generada. Además, permite la clonación de voz zero-shot a partir de una muestra de referencia de unos 10 segundos, sin necesidad de entrenamiento adicional.

La relevancia actual de Chatterbox-Turbo radica en su equilibrio entre calidad y eficiencia: ofrece una latencia de aproximadamente 75 ms y una velocidad de generación 6 veces superior al tiempo real, según los datos publicados por Resemble AI. Esto lo convierte en una opción atractiva para desarrolladores que necesitan integrar síntesis de voz en aplicaciones interactivas, asistentes virtuales o sistemas de respuesta automática sin requerir hardware especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de 350M parámetros, decodificador de un solo paso) |
| Parametros totales | 350 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna exacta de Chatterbox-Turbo. Se sabe que es un modelo de 350 millones de parámetros, significativamente más pequeño que sus predecesores (500M), lo que reduce los requisitos de cómputo y VRAM. La innovación principal es la destilación del decodificador de tokens de habla a mel, que pasa de 10 pasos de generación a uno solo, acelerando la inferencia sin sacrificar la calidad del audio. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de aprendizaje por refuerzo o ajuste fino supervisado. El modelo se distribuye como parte de la librería `chatterbox-tts`, disponible en Python, y se puede cargar directamente con `from_pretrained`.

## Capacidades

- Generación de voz natural y expresiva a partir de texto en inglés.
- Clonación de voz zero-shot: basta con una muestra de referencia de aproximadamente 10 segundos para replicar la voz de un hablante.
- Soporte de etiquetas paralingüísticas nativas: `[cough]`, `[laugh]`, `[chuckle]`, entre otras, para añadir realismo a la síntesis.
- Baja latencia (alrededor de 75 ms) y velocidad de generación 6 veces superior al tiempo real, adecuada para agentes de voz interactivos.
- Optimizado para reducir el uso de VRAM y cómputo en comparación con otros modelos de la familia Chatterbox.
- Integración sencilla mediante la API de Python: `ChatterboxTurboTTS.from_pretrained()` y generación directa con una referencia de voz.

## Casos de uso

- Agentes de voz en producción: Chatterbox-Turbo está diseñado específicamente para este escenario. Su baja latencia (75 ms) permite respuestas casi instantáneas en asistentes telefónicos o chatbots de voz, manteniendo una calidad de habla natural.
- Narración de audiolibros y contenido: la capacidad de usar etiquetas paralingüísticas como `[chuckle]` o `[laugh]` permite crear narraciones más expresivas y humanas, adecuadas para ficción o contenido educativo.
- Doblaje y localización de vídeo: con la clonación de voz zero-shot, se puede generar audio en inglés con la voz de un actor concreto a partir de una muestra breve, facilitando el doblaje de vídeos o podcasts.
- Asistentes virtuales personalizados: los desarrolladores pueden crear voces personalizadas para sus aplicaciones, clonando la voz de un usuario o creando una identidad de marca consistente.
- Generación de contenido para redes sociales: creación rápida de locuciones para vídeos de TikTok, YouTube o Instagram sin necesidad de estudios de grabación.
- Prototipado de productos: dado su tamaño reducido y facilidad de uso, es ideal para validar ideas de productos que requieran síntesis de voz antes de escalar a soluciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de evaluación de Podonos (una plataforma de evaluación de audio), pero no se proporcionan métricas numéricas concretas. Tampoco se han encontrado comparaciones cuantitativas con otros modelos TTS en los resultados de búsqueda web. Por tanto, no es posible presentar una tabla de benchmarks verificada.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentación oficial. Sin embargo, al tratarse de un modelo de 350 millones de parámetros, se estima que puede ejecutarse en GPUs con 4 GB de VRAM o menos en precisión FP16, aunque no hay confirmación oficial.
- Resemble AI indica que el modelo requiere "menos compute y VRAM" que sus modelos anteriores (500M), lo que sugiere que es viable en GPUs de consumo como la RTX 3060 o superiores.
- La librería `chatterbox-tts` permite cargar el modelo en CPU, aunque la generación será más lenta. No se proporcionan cifras de rendimiento en CPU.
- Opciones de despliegue: se puede usar directamente con la API de Python (`ChatterboxTurboTTS`), o a través del espacio de Hugging Face `ResembleAI/chatterbox-turbo-demo`. No se menciona soporte nativo para vLLM, llama.cpp u otros servidores de inferencia, ya que no es un modelo de lenguaje.
- Para producción a gran escala, Resemble AI ofrece un servicio TTS con latencia sub-200 ms, pero no se detallan los requisitos hardware de ese servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Características principales | Licencia |
|---|---|---|---|---|
| Chatterbox-Turbo | 350M | Inglés | Paralinguistic tags, baja latencia, clonación zero-shot | MIT |
| Chatterbox (original) | 500M | Inglés | CFG y ajuste de exageración, clonación zero-shot | MIT |
| Chatterbox-Multilingual | 500M | 23+ | Clonación zero-shot, multilingüe | MIT |

La comparativa se limita a la familia Chatterbox, ya que no se dispone de datos verificados de otros modelos TTS como XTTS o Bark en las fuentes consultadas. Chatterbox-Turbo se distingue por su menor tamaño (350M frente a 500M) y su enfoque en eficiencia, sacrificando el soporte multilingüe y algunas opciones de control creativo presentes en los modelos hermanos.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para aplicaciones que requieran otros idiomas.
- La calidad de la clonación de voz depende de la calidad y duración de la muestra de referencia; se recomienda un clip de al menos 10 segundos para obtener resultados óptimos.
- No se han publicado estudios sobre sesgos o alucinaciones en la pronunciación. Como cualquier modelo TTS, puede generar pronunciaciones incorrectas para nombres propios o términos técnicos poco comunes.
- Aunque la licencia MIT permite uso comercial, es necesario verificar los términos de uso de la librería `chatterbox-tts` y de los pesos del modelo, así como las políticas de Resemble AI respecto a la clonación de voces de terceros.
- El modelo no incluye funciones de control fino como CFG o ajuste de exageración, presentes en la versión original de Chatterbox. Los desarrolladores que necesiten esas capacidades deberían optar por el modelo base.
- No se proporcionan garantías de rendimiento en entornos de producción; la latencia de 75 ms es un valor estimado por el fabricante y puede variar según el hardware.

## Enlaces

- Modelo en Hugging Face (GoingHome333/chatterbox-turbo): https://huggingface.co/GoingHome333/chatterbox-turbo
- Página de demostración con muestras de audio: https://resemble-ai.github.io/chatterbox_turbo_demopage/
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/ResembleAI/chatterbox-turbo-demo
- Repositorio de GitHub de Resemble AI (chatterbox): https://github.com/resemble-ai/chatterbox
- Página de producto de Resemble AI: https://resemble.ai
- Artículo de Resemble AI sobre Chatterbox Turbo: https://www.resemble.ai/learn/models/chatterbox-turbo
