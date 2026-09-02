# mohamedrayyan/chatterbox-tts-dhivehi

## Resumen

El modelo `mohamedrayyan/chatterbox-tts-dhivehi` es un ajuste fino (fine-tune) del sistema de síntesis de voz de código abierto **Chatterbox** de Resemble AI, especializado en el idioma dhivehi (idioma oficial de Maldivas). Desarrollado por mohamedrayyan, este checkpoint permite generar voz natural en dhivehi y también en inglés, con la capacidad de clonar la voz de un hablante a partir de un clip de referencia de 3 a 10 segundos. El modelo expone parámetros de control como `exaggeration`, `cfg_weight` y `temperature` para ajustar la expresividad y el ritmo de la locución.

La relevancia de este modelo radica en que cubre un idioma con escasos recursos en el ámbito de la síntesis de voz, ofreciendo una solución ligera y de licencia MIT. Al estar basado en Chatterbox, hereda su arquitectura de vanguardia y su capacidad de clonación de voz en cero disparos, aunque adaptada a las particularidades fonéticas del dhivehi. El repositorio tiene un tamaño de 3,2 GB y se distribuye bajo licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de ResembleAI/chatterbox) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | dv (dhivehi), en (inglés) |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio de 3,2 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base `ResembleAI/chatterbox`, un sistema TTS de última generación desarrollado por Resemble AI. Chatterbox emplea una arquitectura de transformer con capacidades de clonación de voz en cero disparos y control de emociones. El fine-tune se realizó utilizando tres conjuntos de datos de audio en dhivehi: `alakxender/dhivehi-audio-kn`, `javaabu/dhivehi-shaafiu-speech` y `alakxender/dv-audio-syn-lg`. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se distribuye como un checkpoint que requiere el paquete `chatterbox-tts==0.1.4` y un script adicional (`chatterbox_dhivehi.py`) que extiende el soporte al dhivehi.

## Capacidades

- Generación de voz natural en dhivehi y en inglés.
- Clonación de voz en cero disparos a partir de un clip de referencia de 3 a 10 segundos.
- Control de expresividad mediante los parámetros `exaggeration`, `cfg_weight` y `temperature`.
- Generación de audio a una frecuencia de muestreo de 24 kHz.
- Soporte para generación sin referencia de audio (modo sin clonación).
- Reproducibilidad mediante fijación de semilla aleatoria.

## Casos de uso

- **Narración de noticias en dhivehi**: el modelo puede generar locuciones para boletines informativos o artículos de prensa en dhivehi, con un control fino del tono y la velocidad mediante los parámetros de expresividad.
- **Audiolibros y contenido educativo**: permite convertir textos largos en dhivehi a audio, aunque se recomienda dividir el texto en frases para evitar desviaciones de ritmo en pasajes extensos.
- **Asistentes de voz y chatbots**: al soportar clonación de voz, se puede crear un asistente con una voz personalizada para aplicaciones de atención al cliente o interfaces conversacionales en dhivehi.
- **Accesibilidad para personas con discapacidad visual**: facilita la lectura de contenido digital en dhivehi mediante síntesis de voz, mejorando la accesibilidad en entornos donde el dhivehi es el idioma principal.
- **Doblaje de vídeos y multimedia**: el modelo puede generar pistas de audio en dhivehi para vídeos, presentaciones o material de marketing, con la opción de clonar una voz concreta para mantener consistencia.
- **Aprendizaje de idiomas**: sirve como herramienta de pronunciación para estudiantes de dhivehi, ya que puede generar ejemplos de habla natural y permitir comparar con la voz del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 3,2 GB, lo que sugiere que el modelo requiere una GPU con al menos 4-6 GB de VRAM para una inferencia fluida, aunque no se especifican requisitos oficiales.
- El código de ejemplo utiliza CUDA si está disponible, y puede ejecutarse en CPU, pero con mayor latencia.
- Se recomienda una GPU de gama media como una NVIDIA RTX 3060 o superior para tiempos de generación aceptables.
- Para despliegue en producción, se puede utilizar el paquete `chatterbox-tts` directamente, o integrarlo en servicios como Hugging Face Spaces (ya existen espacios públicos para este modelo).
- No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS comparables específicamente para dhivehi. El modelo base Chatterbox es la referencia principal, pero no se han publicado comparativas cuantitativas con otras alternativas.

## Limitaciones y advertencias

- Es un ajuste experimental rápido; se pueden producir artefactos ocasionales, problemas de prosodia y desviaciones de ritmo en pasajes largos.
- Para textos extensos, se recomienda generar por frases y concatenar los resultados.
- La calidad de la clonación de voz depende en gran medida de la limpieza y claridad del audio de referencia; ruido de fondo o habla superpuesta degradan el resultado.
- El modelo puede presentar acentos o transferencias fonéticas del dhivehi al inglés si se usa con referencias en dhivehi para texto en inglés; se sugiere ajustar `cfg_weight` a 0 en esos casos.
- No se garantiza un rendimiento óptimo en todos los entornos de hardware; la generación en CPU puede ser lenta.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos de los datasets utilizados para el fine-tune, ya que podrían tener restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi)
- [Repositorio de Chatterbox en GitHub](https://github.com/resemble-ai/chatterbox)
- [Space de Hugging Face: Chatterbox TTS Dhivehi (mvtechguy)](https://huggingface.co/spaces/mvtechguy/chatterbox-tts-dhivehi)
- [Space de Hugging Face: Chatterbox TTS Dhivehi (alakxender)](https://huggingface.co/spaces/alakxender/chatterbox-tts-dhivehi)
- [Página de Chatterbox en Resemble AI](https://www.resemble.ai/learn/models/chatterbox)
- [Sitio web de Chatterbox TTS](https://chatterboxtts.org/)
