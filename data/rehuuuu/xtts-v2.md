# rehuuuu/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) desarrollado por Coqui, una empresa especializada en IA de voz open source. Permite clonar una voz a partir de una muestra de audio de apenas 6 segundos y generar habla en 17 idiomas diferentes, manteniendo las características vocales del hablante original. El modelo se basa en una arquitectura transformer y es el mismo que impulsa los servicios comerciales de Coqui Studio y la API de Coqui.

La relevancia actual de XTTS-v2 radica en que democratiza la clonación de voz de alta calidad con requisitos mínimos de datos, algo que antes requería horas de grabación y entrenamiento específico. Además, su capacidad de transferencia entre idiomas (cross-language voice cloning) lo convierte en una herramienta útil para doblaje, localización de contenido y asistentes de voz multilingües. El modelo se distribuye bajo la licencia Coqui Public Model License (CPML), que permite uso comercial con ciertas restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 17: inglés, español, francés, alemán, italiano, portugués, polaco, turco, ruso, neerlandés, checo, árabe, chino (zh-cn), japonés, húngaro, coreano, hindi |
| Licencia | Coqui Public Model License (CPML) |
| Formato de pesos | no disponible (repo de 24.3 GB) |

## Arquitectura y entrenamiento

La arquitectura de XTTS-v2 es un modelo transformer diseñado específicamente para síntesis de voz. Según la documentación oficial, incorpora mejoras sobre la versión anterior (XTTS-v1) en el acondicionamiento del hablante, lo que permite usar múltiples referencias de voz e interpolar entre hablantes. El modelo extrae embeddings del hablante a partir de un clip de audio de referencia y condiciona la generación de habla sobre esos embeddings.

No se han publicado detalles sobre el número de parámetros, la composición del dataset de entrenamiento ni el proceso de alineación (RLHF, DPO, etc.). La model card solo menciona mejoras en estabilidad, prosodia y calidad de audio en general. El modelo opera a una frecuencia de muestreo de 24 kHz.

## Capacidades

- Clonación de voz con solo 6 segundos de audio de referencia.
- Generación de habla multilingüe en 17 idiomas.
- Transferencia de emociones y estilo mediante la clonación (el estilo del hablante de referencia se transfiere al nuevo audio).
- Clonación de voz entre idiomas (cross-language voice cloning): se puede clonar una voz en un idioma y usarla para hablar en otro.
- Soporte de múltiples referencias de hablante e interpolación entre voces.
- Generación de audio a 24 kHz de frecuencia de muestreo.
- Integración con la librería Coqui TTS para inferencia y fine-tuning.

## Casos de uso

- Audiolibros multilingües: un narrador puede grabar un solo clip de referencia y el modelo genera el audiolibro completo en varios idiomas manteniendo la misma voz, reduciendo costes de producción.
- Doblaje de vídeo y cine: se puede clonar la voz de un actor y generar diálogos en otros idiomas sin necesidad de regrabar, acelerando la localización de contenido audiovisual.
- Asistentes de voz personalizados: empresas pueden crear asistentes con una voz de marca consistente en todos los mercados, usando una única muestra de voz.
- Accesibilidad para personas con discapacidad del habla: una persona puede grabar una muestra de su voz (si aún puede) o usar una voz donada, y el modelo genera habla sintética con esa voz para comunicarse.
- Generación de contenido educativo: creación de lecciones o tutoriales en múltiples idiomas con la misma voz del instructor, facilitando la expansión internacional de cursos online.
- Pruebas de concepto en desarrollo de productos: los equipos de producto pueden generar voces sintéticas para prototipos de aplicaciones de voz sin esperar a contratar locutores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score) ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM mínima ni GPU recomendada.
- El tamaño del repositorio es de 24.3 GB, lo que sugiere un modelo de gran tamaño que probablemente requiera una GPU con al menos 16 GB de VRAM para inferencia en tiempo real.
- Para despliegue en producción, se puede usar la librería Coqui TTS, que soporta inferencia en GPU y CPU (aunque más lenta en CPU).
- No se han documentado opciones de cuantización ni despliegue con vLLM, llama.cpp u otras herramientas específicas para TTS.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. XTTS-v2 compite con otros modelos de clonación de voz como Tortoise TTS, Bark o VITS, pero no hay métricas públicas que permitan una comparación objetiva en este documento.

## Limitaciones y advertencias

- La licencia CPML no es una licencia de código abierto estándar; impone restricciones sobre el uso comercial y la redistribución. Es necesario revisar los términos completos en coqui.ai/cpml antes de usar el modelo en producción.
- El modelo puede presentar sesgos en la generación de voz para ciertos acentos, dialectos o hablantes no representados en los datos de entrenamiento.
- Existe riesgo de alucinación en la prosodia o en la pronunciación de palabras poco comunes, especialmente en idiomas con menos representación.
- La clonación de voz plantea riesgos éticos y legales; el uso no autorizado de la voz de una persona puede violar derechos de imagen y privacidad.
- No se especifican limitaciones de contexto, pero al ser un modelo de síntesis, la longitud máxima de texto generado puede estar limitada por la memoria de la GPU.
- El repositorio en HuggingFace (rehuuuu/XTTS-v2) es una copia del modelo original de Coqui; se recomienda verificar la autenticidad y usar la versión oficial de coqui/XTTS-v2.

## Enlaces

- Repositorio en HuggingFace (copia): https://huggingface.co/rehuuuu/XTTS-v2
- Modelo original de Coqui: https://huggingface.co/coqui/XTTS-v2
- Código base (Coqui TTS): https://github.com/coqui-ai/TTS
- Documentación de XTTS: https://tts.readthedocs.io/en/latest/models/xtts.html
- Licencia CPML: https://coqui.ai/cpml
- Blog sobre CPML: https://coqui.ai/blog/tts/cpml
- Demo Space de XTTS: https://huggingface.co/spaces/coqui/xtts
- Demo de voice chat con Mistral/Zephyr: https://huggingface.co/spaces/coqui/voice-chat-with-mistral
