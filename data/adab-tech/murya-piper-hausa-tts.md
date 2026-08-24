# adab-tech/murya-piper-hausa-tts

## Resumen

Murya-Piper-Hausa-TTS es un modelo de síntesis de voz (text-to-speech) multihablante para el idioma hausa, desarrollado por Adab Tech (Adamu Danjuma Abubakar) y publicado en julio de 2026. Se trata del primer modelo TTS abierto multihablante para hausa, entrenado sobre el corpus WAXAL de Google y construido por un hablante nativo de la lengua, con evaluación integrada en cada decisión del proceso. El modelo resuelve el problema de la falta de voces sintéticas de calidad para un idioma de bajos recursos, ofreciendo una alternativa soberana y con licencia permisiva.

Arquitectónicamente se basa en la familia VITS implementada en Piper, con un arranque en caliente desde el punto de control público `en_US-lessac-medium` (solo inicialización acústica). El modelo opera en modo grafema con un alfabeto hausa personalizado de 42 símbolos, lo que permite representar correctamente las consonantes ganchudas (ɓ, ɗ, ƙ, ƴ) y la oclusiva glotal. El artefacto final es un archivo ONNX de aproximadamente 73,5 MB que se ejecuta en tiempo real en CPU convencional, sin necesidad de GPU ni conexión a la nube.

La relevancia actual del modelo radica en su enfoque soberano: es el primer TTS hausa entrenado sobre WAXAL, el primero multihablante abierto y el primero desarrollado por un hablante nativo. Además, alimenta a Murya, un asistente de voz completo en hausa, y su licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en aplicaciones de accesibilidad, educación e IVR en regiones con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (familia Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | hausa (ha) |
| Licencia | MIT |
| Formato de pesos | ONNX (~73,5 MB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) implementada en el proyecto Piper de Rhasspy. El entrenamiento se realizó en modo grafema (`--phoneme-type text`) con un alfabeto hausa inyectado de 42 símbolos, ya que espeak-ng no dispone de voz para hausa. El arranque en caliente se hizo desde el punto de control público `en_US-lessac-medium` (dominio público), utilizando únicamente la inicialización acústica; toda la identidad de voz proviene del corpus WAXAL.

Los datos de entrenamiento proceden de Google WAXAL (clips TTS en hausa de 8 hablantes), filtrados a duraciones de 1 a 20 segundos y sin dígitos. Una pasada de segmentación por alineación forzada a nivel de carácter (usando whisper-large-v3, robusto a salidas ASR fonéticas) permitió recuperar clips largos o con dígitos, convirtiéndolos en segmentos de frases limpias. Esto amplió el audio utilizable de 2,83 horas a 6,03 horas (2.693 enunciados) a partir de las mismas grabaciones fuente. La evaluación se realizó mediante audición de hablantes nativos sobre frases de referencia fijas, incluyendo pruebas de pares mínimos de ortografía y tono, que condicionaron la selección del modelo base, la certificación de datos y el presupuesto de épocas. El estudio MOS (Mean Opinion Score) está planificado pero aún no se ha ejecutado.

## Capacidades

- Síntesis de voz en hausa con 8 voces distintas (M1-M4 masculinas, F1-F4 femeninas), seleccionables mediante `speaker_id`.
- Generación de audio a 22,05 kHz en tiempo real sobre CPU convencional, sin necesidad de GPU ni servicios en la nube.
- Ortografía nativa: las consonantes ganchudas (ɓ, ɗ, ƙ, ƴ) y la oclusiva glotal (') son símbolos de primera clase en el modelo y nunca se aplanan.
- Soporte de prosodia natural en dominio cotidiano y conversacional, entrenada sobre habla no guionizada.
- No dispone de tool calling, capacidades de agente, visión ni procesamiento de audio adicional; es exclusivamente un modelo de síntesis de voz.
- Capacidad multilingüe limitada al hausa; no se soportan otros idiomas.

## Casos de uso

- Accesibilidad para personas con baja alfabetización: el modelo permite convertir texto en hausa a voz de forma local, facilitando el acceso a información escrita a usuarios que no leen con fluidez, gracias a su ejecución en CPU y su tamaño reducido.
- Educación y aprendizaje de idiomas: puede integrarse en aplicaciones educativas para enseñar hausa, ofreciendo pronunciación correcta de las consonantes ganchudas y tonos, con la ventaja de múltiples voces para ejercicios de escucha variados.
- Sistemas IVR (respuesta de voz interactiva): al ejecutarse en tiempo real en hardware modesto, es adecuado para centralitas telefónicas o servicios de atención automatizada en hausa, sin depender de conectividad a la nube.
- Aplicaciones offline y de borde en regiones con ancho de banda limitado: el modelo ONNX de 73,5 MB cabe en dispositivos móviles o embebidos, permitiendo síntesis de voz sin conexión, lo que es crítico en zonas rurales de África occidental.
- Asistente de voz completo: el modelo ya alimenta a Murya (murya.ng), un asistente de voz hausa-first que incluye conversación hablada en vivo, chat de texto, traducción de documentos y diccionario, demostrando su viabilidad en productos reales.
- Corrección de pronunciación con supervisión humana: el pipeline de mejora continua de Murya permite que los usuarios marquen errores de pronunciación, un revisor grabe la corrección y esta se sirva como override inmediato, integrándose además en el corpus para el siguiente fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El estudio MOS (Mean Opinion Score) está planificado pero no se ha ejecutado; las auditorías de hablantes nativos existentes son direccionales y no sustituyen a una evaluación formal.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; funciona en CPU convencional de consumo.
- Compatibilidad con GPU de consumo: no aplica, aunque puede ejecutarse en cualquier hardware con soporte ONNX Runtime.
- Opciones de despliegue: librería `piper-tts` (Python), ONNX Runtime directamente, o integración en proyectos basados en Piper.
- Latencia y rendimiento: tiempo real en CPU commodity; no se proporcionan cifras exactas de throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en hausa. Según la información proporcionada, este es el primer TTS multihablante abierto para hausa y el primero entrenado sobre el corpus WAXAL. Existen alternativas como BibleTTS para otros idiomas, pero son de un solo hablante y de un único registro, mientras que este modelo ofrece diversidad de voces y prosodia de dominio cotidiano. No se han encontrado otros modelos TTS hausa abiertos con licencia permisiva en la información disponible.

## Limitaciones y advertencias

- La naturalidad por voz refleja aproximadamente 45 minutos de audio por hablante; un corpus de un solo hablante con muchas más horas (como BibleTTS) puede sonar más fluido en una voz concreta, pero es de un solo hablante y un solo registro.
- El modelo se entrenó sobre habla leída; la expresividad extrema o las emociones están fuera de su alcance.
- No está validado para dictado médico ni para aplicaciones de seguridad crítica sin revisión humana.
- Requiere normalización del texto de entrada: Unicode NFD (la forma NFC compone las vocales con tono en puntos de código fuera del alfabeto de entrenamiento, lo que elimina la vocal), minúsculas (el modelo se entrenó con texto en minúsculas) y dígitos deletreados.
- El mapa de IDs de hablante no está ordenado alfabéticamente; debe leerse de `model.onnx.json` en lugar de asumir un orden.
- El estudio MOS formal no se ha ejecutado; las evaluaciones de hablantes nativos existentes son direccionales.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento derivan de Google WAXAL (CC-BY-4.0 / CC-BY-SA-4.0), por lo que se debe acreditar a WAXAL y a sus hablantes en cualquier trabajo derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adab-tech/murya-piper-hausa-tts
- Repositorio del modelo en Hugging Face: https://huggingface.co/adab-tech/murya-piper-hausa-tts/tree/main
- Proyecto Piper (base del modelo): https://github.com/rhasspy/piper
- Muestras de voz de Piper: https://rhasspy.github.io/piper-samples/
- Asistente Murya: https://murya.ng y https://app.murya.ng
- GitHub de Adab Tech: https://github.com/adab-tech
