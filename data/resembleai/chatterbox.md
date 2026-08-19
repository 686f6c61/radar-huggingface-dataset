# ResembleAI/chatterbox

## Resumen

Chatterbox es una familia de modelos de síntesis de voz (text-to-speech) desarrollada por Resemble AI, una empresa especializada en generación de voz realista. El modelo principal, Chatterbox Multilingual V3, es la versión más reciente y está diseñado para ofrecer clonación de voz zero-shot y síntesis multilingüe de alta calidad con una licencia MIT, lo que lo convierte en una opción atractiva para desarrolladores que buscan una alternativa open source a servicios comerciales como ElevenLabs.

El modelo tiene aproximadamente 500 millones de parámetros (0.5B) y utiliza un backbone basado en la arquitectura Llama, adaptado para generación de audio. Está entrenado con 0,5 millones de horas de datos de voz limpios y soporta 23 idiomas de forma nativa. Además, incorpora características avanzadas como control de exageración emocional, inferencia con alineación para mayor estabilidad y salidas con marca de agua para trazabilidad.

La relevancia actual de Chatterbox radica en su equilibrio entre calidad, tamaño y apertura. Al ser MIT, permite uso comercial sin restricciones, y su tamaño compacto (0.5B) facilita su despliegue en infraestructuras moderadas. La versión V3 introduce mejoras en la similitud del hablante y reduce los artefactos de alucinación, lo que lo posiciona como una opción sólida para aplicaciones de voz en producción, desde asistentes virtuales hasta doblaje automático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Llama 0.5B adaptado para TTS |
| Parametros totales | 500 millones (0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (orientado a audio, sin ventana de tokens explícita) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 23: árabe, danés, alemán, griego, inglés, español, finés, francés, hebreo, hindi, italiano, japonés, coreano, malayo, neerlandés, noruego, polaco, portugués, ruso, sueco, suajili, turco, chino |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio de 23.7 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

Chatterbox emplea una arquitectura basada en un backbone Llama de 0.5B de parámetros, adaptado específicamente para la generación de audio. El modelo se entrena con 0,5 millones de horas de datos de voz limpios, lo que le proporciona una base sólida para la síntesis en múltiples idiomas. Una innovación destacada es la inferencia con alineación (alignment-informed inference), que mejora la estabilidad temporal y reduce artefactos como repeticiones o continuaciones no deseadas.

El entrenamiento incluye técnicas de ajuste para el control de la exageración emocional, un parámetro que permite al usuario modular la expresividad de la voz generada. Además, se ha optimizado para reducir las alucinaciones (generación de habla fuera de guion) en comparación con versiones anteriores. El modelo soporta clonación de voz zero-shot a partir de aproximadamente 5 segundos de audio de referencia, sin necesidad de fine-tuning por hablante.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas con acento y pronunciación razonablemente precisos.
- Clonación de voz zero-shot: genera habla con la voz de un hablante de referencia a partir de una muestra corta (5 segundos).
- Control de exageración emocional: permite ajustar la intensidad expresiva de la voz mediante un parámetro (`exaggeration`).
- Inferencia con alineación: mejora la sincronización y reduce artefactos de repetición o habla fuera de guion.
- Salidas con marca de agua: incorpora una marca de agua en el audio para facilitar la trazabilidad.
- Soporte para voces conversacionales y expresivas: adecuado para agentes de voz, doblaje y contenido creativo.
- Capacidad de conversión de voz (voice conversion) mediante scripts incluidos en el repositorio.

## Casos de uso

- Asistentes de voz y agentes conversacionales: Chatterbox puede generar respuestas de voz naturales en tiempo real, con control de emoción y clonación de voz para personalizar la experiencia del usuario. Su baja latencia (en la variante Turbo, 75 ms) lo hace apto para interacciones en vivo.
- Doblaje automático de vídeos y podcasts: gracias al soporte multilingüe y a la clonación de voz, es posible doblar contenido manteniendo la identidad vocal del hablante original en diferentes idiomas, lo que reduce costes frente a estudios tradicionales.
- Generación de audiolibros y contenido narrado: el control de exageración permite ajustar la expresividad para narraciones dramáticas o documentales, manteniendo una calidad de voz consistente.
- Accesibilidad: síntesis de voz para personas con discapacidad visual o dificultades de lectura, con soporte para múltiples idiomas y voces personalizadas.
- Videojuegos y experiencias interactivas: generación de diálogos dinámicos con voces variadas y control emocional, útil para NPCs o narrativas ramificadas sin necesidad de grabar cada línea.
- Marketing y publicidad: creación de locuciones publicitarias con voces personalizadas y control de tono, acelerando la producción de campañas multicanal.
- Formación y e-learning: generación de contenido educativo en varios idiomas con voces claras y naturales, permitiendo localización rápida de cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de LLM (como MMLU o HumanEval) para este modelo, ya que es un sistema TTS y no un modelo de lenguaje general. Sin embargo, Resemble AI afirma que Chatterbox ha sido evaluado frente a ElevenLabs en pruebas de preferencia lado a lado, y que es consistentemente preferido por los oyentes según los resultados de Podos (https://podonos.com/resembleai/chatterbox). No se proporcionan métricas numéricas detalladas en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 0.5B parámetros, lo que en FP16 implica aproximadamente 1 GB de pesos. El repositorio completo ocupa 23.7 GB (probablemente incluye múltiples versiones y pesos).
- VRAM estimada para inferencia: con cuantización a 8 bits, podría funcionar con 2-4 GB de VRAM; en FP16 se recomienda al menos 4-6 GB para margen de procesamiento de audio.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB) o superiores son suficientes para inferencia en tiempo real. Para despliegues concurrentes, se recomienda A10, A100 o similares.
- Opciones de despliegue: el modelo se distribuye a través de la librería `chatterbox` (disponible en GitHub). No se menciona soporte nativo para vLLM u Ollama, pero al ser un modelo basado en Llama, es posible adaptarlo con herramientas de cuantización como llama.cpp o GPTQ.
- Latencia: la variante Turbo (350M) alcanza 75 ms de latencia y 6x tiempo real; la versión estándar V3 no especifica latencia exacta, pero se espera que sea superior al tiempo real en GPUs modernas.

## Comparativa con modelos similares

En la información disponible no se detalla una comparativa directa con otros modelos TTS open source como XTTS v2, Coqui TTS o Bark. Sin embargo, Chatterbox se posiciona frente a ElevenLabs (propietario) y se destaca por su licencia MIT y su tamaño compacto. La siguiente tabla resume las características principales frente a alternativas conocidas:

| Modelo | Parámetros | Idiomas | Licencia | Clonación zero-shot | Control emocional |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 | 0.5B | 23 | MIT | Sí | Sí (exageración) |
| XTTS v2 (Coqui) | 0.4B | 17 | CPML (no comercial) | Sí | Parcial |
| Bark (Suno) | ~0.5B | 13 | MIT | No | Parcial (etiquetas) |

Nota: los datos de XTTS v2 y Bark son aproximados y pueden variar; se basan en conocimiento general, no en la información proporcionada.

## Limitaciones y advertencias

- Aunque V3 reduce las alucinaciones (habla fuera de guion), no las elimina por completo; se recomienda validar la salida en aplicaciones críticas.
- La clonación de voz puede reproducir sesgos presentes en los datos de entrenamiento, como acentos o patrones de habla específicos, y podría no funcionar igual de bien con voces muy atípicas o ruidosas.
- El soporte multilingüe cubre 23 idiomas, pero la calidad puede variar entre ellos; los finetunes dedicados (Single Language Pack) ofrecen mejor control para chino, español latinoamericano, portugués brasileño, español de España, portugués de Portugal e hindi.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario asegurarse de no violar derechos de voz de terceros al clonar voces reales.
- No se especifican requisitos exactos de hardware ni formatos de cuantización oficiales, lo que puede requerir experimentación para despliegues optimizados.
- La marca de agua incorporada en las salidas puede interferir con ciertos análisis de audio o aplicaciones que requieran audio sin procesar.

## Enlaces

- HuggingFace: https://huggingface.co/ResembleAI/chatterbox
- Repositorio GitHub: https://github.com/resemble-ai/chatterbox
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Demo de Chatterbox Multilingual V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Página del modelo en Resemble AI: https://www.resemble.ai/learn/models/chatterbox
- Evaluación comparativa en Podos: https://podonos.com/resembleai/chatterbox
- Documentación técnica en DeepWiki: https://deepwiki.com/resemble-ai/chatterbox
