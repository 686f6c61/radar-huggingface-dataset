# arjun10g/chatterbox-web

## Resumen

Chatterbox-web es un repaqueteado del modelo de síntesis de voz Chatterbox, desarrollado por Resemble AI, adaptado para ejecutarse directamente en el navegador mediante transformers.js y WebGPU. La versión original de Chatterbox es un modelo TTS de código abierto con licencia MIT, conocido por su control de emociones, generación en tiempo real y clonación de voz zero-shot a partir de tan solo 5 segundos de audio. Este repaqueteado, creado por arjun10g, reduce el peso de la descarga de aproximadamente 1,4 GB a 865 MB al eliminar el codificador de voz completo (564 MB) y sustituirlo por un stub de 6 KB, ya que la aplicación de texto a voz nunca lo ejecuta. En su lugar, se precalculan las características de la voz y se distribuyen en un archivo de 250 KB (`voices/default.bin`). Como consecuencia, el modelo solo puede hablar con la voz incluida y no puede clonar nuevas voces, para lo cual se debe usar el repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basado en transformador (Chatterbox de Resemble AI) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de voz, no de texto) |
| Tipos de cuantización | q4f16 (modelo de lenguaje incluido) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

Chatterbox es un modelo de texto a voz de última generación desarrollado por Resemble AI, con licencia MIT, que incluye control de emociones, generación en tiempo real y clonación de voz zero-shot desde 5 segundos de audio. El repaqueteado `chatterbox-web` elimina el codificador de voz (speech_encoder) del flujo de inferencia, ya que para la síntesis de texto a voz no se utiliza. En su lugar, las características de la voz se precomputan y se pasan directamente a la función `generate()` como `speaker_embeddings`, `speaker_features`, `audio_features` y `audio_tokens`. Solo se incluye el modelo de lenguaje cuantizado a q4f16, no la versión fp32 completa. No se dispone de información detallada sobre el conjunto de datos de entrenamiento ni los métodos de alineación (RLHF, DPO, etc.).

## Capacidades

- Texto a voz (TTS) de alta calidad, comparable con sistemas propietarios como ElevenLabs en evaluaciones comparativas.
- Generación de audio en tiempo real.
- Control de emociones (en la versión original; en este repaqueteado la voz está precomputada).
- Funciona completamente en el navegador mediante WebGPU y transformers.js, sin necesidad de servidor.
- Incluye una única voz predefinida (bundled) que no puede modificarse.
- No soporta clonación de voz en esta versión; se debe usar el repositorio original para esa función.
- No soporta tool calling, agentes ni otras capacidades de LLM (es un modelo TTS).

## Casos de uso

- **Accesibilidad web**: integrar el modelo en una página para leer contenido en voz alta a usuarios con discapacidad visual o dificultades de lectura. Su ejecución local en el navegador evita enviar texto a servidores externos.
- **Aplicaciones de asistente de voz**: incorporar respuestas de voz en asistentes virtuales o chatbots que ya funcionan en el navegador, sin necesidad de infraestructura de TTS en el backend.
- **Demostraciones y prototipos rápidos**: crear demostraciones interactivas de TTS para presentaciones o pruebas de concepto sin configurar un servidor.
- **Aplicaciones educativas**: herramientas de aprendizaje de idiomas que necesitan pronunciar palabras o frases en voz alta, con baja latencia y sin conexión a servidores.
- **Lectura de documentos**: extensiones de navegador que leen en voz alta artículos, correos o documentos, aprovechando que el modelo se carga una vez y se reutiliza.
- **Audio en juegos o aplicaciones de narrativa**: generación de diálogos procedimentales en juegos de navegador o aplicaciones de storytelling, donde el modelo puede producir audio en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repaqueteado específico. La versión original de Chatterbox ha sido evaluada en comparaciones de preferencia frente a sistemas como ElevenLabs, pero no se incluyen cifras concretas en la documentación accesible.

## Requisitos de hardware

- **GPU**: requiere un dispositivo con soporte WebGPU (Chrome, Edge, Firefox Nightly, Safari en versiones recientes).
- **Memoria**: el modelo pesa 865 MB en total (incluyendo el modelo de lenguaje cuantizado). Se recomienda un dispositivo con al menos 2 GB de RAM disponible para la carga y ejecución.
- **CPU**: no se especifican requisitos mínimos, pero se recomienda un procesador moderno para la síntesis en tiempo real.
- **Opciones de despliegue**: el modelo está diseñado para ejecutarse en el navegador con transformers.js. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo ONNX para WebGPU.
- **Latencia**: no se dispone de mediciones de latencia específicas para este repaqueteo. En la versión original, Chatterbox está diseñado para generación en tiempo real, lo que sugiere latencias bajas en hardware compatible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este repaqueteo. La versión original de Chatterbox se ha comparado con ElevenLabs en evaluaciones de preferencia de oyentes, pero no se han publicado métricas detalladas en la información disponible. Como alternativa open-source comparable se pueden citar:

- **Coqui TTS**: modelos de TTS open-source con licencia MPL-2.0, pero requieren ejecución en servidor y no tienen soporte directo para navegador.
- **Piper**: TTS rápido y ligero con formato ONNX, pero con menor calidad de voz y sin control de emociones ni clonación de voz.
- **Chatterbox original (resemble-ai/chatterbox)**: versión completa con clonación de voz y control de emociones, pero requiere ejecución en servidor.

## Limitaciones y advertencias

- **No puede clonar voces**: el stub de `speech_encoder` impide la clonación de nuevas voces; solo se puede usar la voz incluida en `voices/default.bin`.
- **Voz única**: solo hay una voz disponible, sin opción de cambiar de voz o ajustar parámetros de emoción.
- **Requiere WebGPU**: no funciona en navegadores o dispositivos sin soporte de WebGPU, lo que limita su despliegue en equipos antiguos o algunos navegadores móviles.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos para este modelo, pero al ser un TTS puede producir pronunciaciones incorrectas en nombres propios o términos técnicos.
- **Licencia**: aunque la licencia es MIT, el uso comercial está permitido, pero se debe verificar que la voz incluida no tenga restricciones adicionales (no se ha indicado).
- **Limitación de contexto**: no se aplica, ya que es un TTS y no un modelo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arjun10g/chatterbox-web
- Repositorio original de Chatterbox (Resemble AI): https://github.com/resemble-ai/chatterbox
- WebUI de Chatterbox (Windows): https://github.com/Saganaki22/chatterbox-WebUI
- Espacio Natural Voice (demo): https://huggingface.co/spaces/arjun10g/natural-voice
- Documentación de Chatterbox en Resemble AI: https://www.resemble.ai/learn/models/chatterbox
