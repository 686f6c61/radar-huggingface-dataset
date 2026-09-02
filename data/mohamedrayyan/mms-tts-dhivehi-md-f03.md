# mohamedrayyan/mms-tts-dhivehi-md-f03

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-md-f03` es un checkpoint de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un fine-tuning del modelo `facebook/mms-tts-div`, que forma parte de la familia Massively Multilingual Speech (MMS) de Meta AI, sobre una arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). El modelo ha sido entrenado específicamente para producir una voz femenina (variante f03) y se enmarca dentro del proyecto Dhivehi TTS, que busca dotar de capacidades de síntesis de voz a un idioma con escasos recursos digitales.

Con 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero y eficiente, adecuado para despliegues en entornos con recursos limitados. Su relevancia radica en que el dhivehi es un idioma de bajos recursos, con poca representación en herramientas de procesamiento de lenguaje natural, y este modelo ofrece una solución práctica y de código abierto (licencia MIT) para generar audio natural en dicho idioma. El checkpoint está disponible en formato safetensors y se integra fácilmente con la biblioteca `transformers` de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | no disponible (se mencionan exports quantized y ONNX en el proyecto, pero no se especifican los formatos en la ficha) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se publican exports ONNX y cuantizados en el proyecto) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, que combina un codificador de texto, un decodificador de voz y un discriminador adversarial para producir audio de forma end-to-end. El checkpoint original `facebook/mms-tts-div` fue preentrenado por Meta AI como parte del proyecto MMS, que cubre más de 1.100 idiomas. El autor del modelo realizó un fine-tuning sobre este checkpoint utilizando datos de voz en dhivehi, con el objetivo de adaptar la pronunciación y el timbre a una voz femenina específica (variante f03). No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de horas de audio ni el proceso de ajuste (por ejemplo, si se usó aprendizaje por refuerzo o pérdidas adicionales). El proyecto general incluye varias variantes de voz (femeninas, masculinas y clonadas) y también ofrece versiones cuantizadas y en ONNX para facilitar el despliegue en diferentes entornos.

## Capacidades

- Síntesis de voz en dhivehi: convierte texto escrito en dhivehi (escritura Thaana) en audio hablado.
- Generación de audio en formato waveform directamente desde el modelo, sin necesidad de vocoder externo (gracias a la arquitectura VITS).
- Normalización de texto: según la demo publicada en Hugging Face Spaces, el sistema incorpora normalización de texto para manejar formatos de entrada variados (números, abreviaturas, etc.).
- Soporte de múltiples voces: el proyecto ofrece varias variantes (femenina, masculina, clonada), aunque este checkpoint concreto es la voz femenina f03.
- Exportación a ONNX y cuantización: facilita la integración en aplicaciones con restricciones de latencia o hardware.
- No incluye capacidades de tool calling, agentes, razonamiento ni procesamiento multimodal; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Lectura de noticias y artículos en dhivehi: el modelo puede integrarse en aplicaciones de noticias para generar versiones en audio de contenido escrito, útil para usuarios que prefieren escuchar en lugar de leer.
- Audiolibros y contenido educativo: permite convertir libros, guías o materiales de aprendizaje en audio, facilitando el acceso a la educación en dhivehi.
- Accesibilidad para personas con discapacidad visual: al generar voz natural, puede utilizarse en lectores de pantalla o aplicaciones de asistencia para usuarios que no pueden leer texto.
- Asistentes de voz y sistemas de respuesta interactiva: el modelo puede servir como motor de síntesis en chatbots o sistemas IVR (respuesta de voz interactiva) en dhivehi, mejorando la experiencia del usuario en servicios locales.
- Aplicaciones de traducción y aprendizaje de idiomas: puede usarse para pronunciar palabras o frases en dhivehi, ayudando a estudiantes o turistas a familiarizarse con la pronunciación.
- Herramientas de accesibilidad en sitios web gubernamentales o de servicios públicos: al ofrecer una voz femenina clara, puede integrarse en portales para leer contenido oficial en voz alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre calidad de síntesis (MOS, WER, etc.) ni comparaciones con otros modelos TTS para dhivehi. Se recomienda evaluar el modelo de forma subjetiva o mediante métricas propias antes de su uso en producción.

## Requisitos de hardware

- Inferencia ligera: con 36,3 millones de parámetros, el modelo puede ejecutarse en CPU con un consumo de memoria moderado (estimación de 1-2 GB de RAM, dependiendo de la longitud del audio generado).
- GPU recomendada: no es necesaria una GPU de gama alta; cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) puede acelerar la inferencia, aunque no es imprescindible.
- Compatible con hardware de consumo: el modelo cabe en cualquier ordenador personal, Raspberry Pi 4 o similar, siempre que se utilice la versión cuantizada o ONNX para optimizar el rendimiento.
- Opciones de despliegue: se puede usar directamente con la biblioteca `transformers` de Hugging Face, o mediante exportaciones ONNX para entornos de producción. También es posible integrarlo en servidores HTTP (se menciona una implementación de servidor en el proyecto DhivehiAI).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por frase en CPU moderna, y menor en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS comparables específicamente para dhivehi. El modelo base `facebook/mms-tts-div` es el punto de partida, y este checkpoint es un fine-tuning del mismo. Otras alternativas genéricas como Coqui TTS o Piper podrían adaptarse a dhivehi, pero no hay datos públicos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta dhivehi; no es multilingüe y no puede generar voz en otros idiomas.
- Voz específica: este checkpoint produce una voz femenina concreta (f03); no permite cambiar el timbre ni el estilo sin reentrenar.
- Posibles errores de pronunciación: al ser un fine-tuning sobre un modelo preentrenado, puede haber errores en palabras poco comunes, nombres propios o transliteraciones.
- Sin control de prosodia: no se pueden ajustar parámetros como velocidad, tono o énfasis de forma explícita (aunque VITS permite cierta variación mediante el muestreo).
- Datos de entrenamiento no documentados: no se ha publicado información sobre el corpus de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones en la cobertura léxica.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad o idoneidad para casos de uso específicos.
- Sin soporte de contexto largo: al ser TTS, no aplica el concepto de ventana de contexto; la entrada es texto plano y la salida es audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-md-f03
- Modelo base (facebook/mms-tts-div): https://huggingface.co/facebook/mms-tts-div
- Proyecto Dhivehi TTS (chatterbox-tts-dhivehi): https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Repositorio GitHub de DhivehiAI: https://github.com/DhivehiAI
- Documentación de TTS en dhivehi.ai: https://dhivehi.ai/docs/technologies/tts/
