# Phoonnx/vits-piper_en_GB-cori-medium

## Resumen

vits-piper_en_GB-cori-medium es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del modelo Piper `en_GB-cori-medium` y empaquetado por Phoonnx para su uso con la librería phoonnx. Se trata de una extracción de un único modelo del repositorio agregador `Phoonnx/phoonnx-vits`, manteniendo las rutas de ficheros originales. El modelo emplea la arquitectura VITS, un sistema de TTS neuronal de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normales y un vocoder HiFi-GAN integrado.

El modelo está orientado a la síntesis de voz en inglés británico (en_GB) con una voz concreta denominada "cori" y calidad "medium", siguiendo la nomenclatura de Piper que distingue entre calidades x_low, low, medium y high. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada.

Su relevancia radica en que permite la inferencia de TTS en local mediante ONNX Runtime a través de phoonnx, sin necesidad de GPU dedicada, lo que facilita el despliegue en entornos con recursos limitados o en aplicaciones de borde. El modelo se publicó el 14 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal con flujos normales y vocoder integrado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si existe version cuantizada) |
| Idiomas soportados | ingles britanico (en_GB), segun el identificador de voz |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que integra en un único sistema un codificador de texto, un prior variacional condicionado por texto, un decodificador basado en flujos normales invertibles y un decodificador de waveform del tipo HiFi-GAN. Esta combinación permite generar audio de forma directa desde texto sin un vocoder externo y con entrenamiento adversarial más pérdida de verosimilitud. El modelo se exporta a ONNX para su ejecución con ONNX Runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia arquitectura VITS. El modelo procede de la colección Piper y se distribuye como un artefacto derivado, por lo que los detalles de entrenamiento corresponden al modelo original `en_GB-cori-medium` de Piper, no documentados en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico con la voz "cori" y calidad media.
- Generación de audio en formato waveform directamente desde texto mediante un pipeline de TTS de extremo a extremo.
- Inferencia en CPU mediante ONNX Runtime a través de la librería phoonnx.
- Integración con el ecosistema phoonnx mediante el identificador de voz `piper/en_GB-cori-medium`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento multimodal.
- No se documentan capacidades multilingües más allá del inglés británico.

## Casos de uso

- **Locución automatizada para aplicaciones de accesibilidad**: el modelo puede convertir texto en voz para lectores de pantalla o asistentes de accesibilidad en entornos de escritorio y móvil, al ejecutarse en CPU mediante ONNX Runtime sin requerir GPU.
- **Generación de audio para contenido educativo**: permite crear narraciones para cursos, tutoriales o material formativo en inglés británico, con una voz consistente y calidad media adecuada para consumo en dispositivos personales.
- **Sistemas de respuesta por voz en local**: integrable en asistentes de voz embebidos o domésticos que necesiten síntesis en inglés británico sin conexión a servicios en la nube, gracias al tamaño reducido del repositorio (0,1 GB).
- **Pruebas y prototipado de pipelines TTS**: útil para desarrolladores que evalúan la librería phoonnx o comparan voces Piper antes de seleccionar una voz definitiva para producción.
- **Generación de avisos y anuncios automatizados**: adecuado para sistemas de megafonía o notificaciones habladas en inglés británico en entornos controlados, donde la latencia de CPU es suficiente.
- **Integración en aplicaciones de lectura de textos largos**: el modelo puede sintetizar párrafos completos por fragmentos, permitiendo la lectura por voz de documentos o artículos en inglés británico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que la inferencia se realice en CPU sin necesidad de VRAM dedicada, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño (0,1 GB) cabría en cualquier GPU de consumo, pero no se documenta soporte explícito.
- Opciones de despliegue: phoonnx (librería indicada), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-piper_en_GB-cori-medium | VITS | en_GB | ONNX | MIT | no disponible | Hugging Face (Phoonnx) |
| Piper en_GB voices (originales) | VITS | en_GB | ONNX | variable segun voz | no disponible | Repositorio Piper / rhasspy |
| Coqui TTS (modelos VITS) | VITS | varios | checkpoint / ONNX | variable (MPL-2.0 en Coqui TTS) | no disponible | Coqui / Hugging Face |
| Kokoro TTS | StyleTTS2 / otros | en y otros | ONNX / safetensors | Apache 2.0 (segun version) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta inglés británico; no se documentan otros idiomas.
- La voz está limitada a una única identidad ("cori") y calidad media; no hay control de estilo, emoción ni velocidad documentado.
- No se dispone de información sobre sesgos, riesgo de alucinación o calidad de pronunciación en dominios específicos.
- La licencia MIT se hereda del repositorio fuente, pero la model card advierte que las licencias siguen a los originales por subcarpeta; conviene verificar la procedencia exacta de la voz antes de uso comercial.
- Al ser un artefacto derivado sin descargas ni validación comunitaria (0 descargas, 0 likes), no hay evidencia pública de calidad en producción.
- No se documentan limitaciones de contexto ni de longitud de texto de entrada; se desconoce el comportamiento con entradas largas.
- El repositorio no incluye información sobre el proceso de entrenamiento ni métricas de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_GB-cori-medium
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio Piper (referencia de las voces originales): no disponible en la información proporcionada
- Paper VITS: no disponible en la información proporcionada
