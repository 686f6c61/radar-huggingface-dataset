# Phoonnx/glowtts-fr-fr-siwis

## Resumen

Phoonnx/glowtts-fr-fr-siwis es un modelo de síntesis de voz (text-to-speech) en francés empaquetado en formato ONNX para su uso con la librería phoonnx. Se trata de una exportación de un modelo GlowTTS, una arquitectura de TTS no autorregresiva basada en flujos normalizadores, extraída del repositorio agregador Phoonnx/phoonnx-glowtts y correspondiente a la carpeta `fr-fr-siwis`. El identificador de voz interno es `larynx/fr-fr-siwis-glow_tts`.

El modelo resuelve el problema de convertir texto en audio inteligible en francés con un coste computacional bajo y sin dependencia de frameworks de deep learning pesados, ya que los pesos se distribuyen en ONNX. Esto lo hace relevante para despliegues ligeros en CPU, aplicaciones de lectura en voz alta, asistentes embebidos y pipelines de accesibilidad donde no se dispone de GPU.

La información publicada por el autor es mínima: no se especifican parámetros totales, longitud de contexto, idiomas soportados más allá del francés implícito en el nombre, ni resultados de benchmarks. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en flujos normalizadores), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés (implícito en el identificador `fr-fr-siwis`; no se documenta oficialmente) |
| Licencia | other (la model card no especifica una licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo que combina un encoder de texto con un decoder basado en flujos normalizadores invertibles, lo que permite generar espectrogramas mel en paralelo y evitar la latencia secuencial de los modelos autoregresivos tipo Tacotron. La exportación a ONNX elimina la dependencia de PyTorch en tiempo de inferencia y facilita el despliegue en runtimes ligeros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de GlowTTS. La model card únicamente indica que el modelo proviene del repositorio Phoonnx/phoonnx-glowtts y que conserva las rutas de archivo originales.

## Capacidades

- Síntesis de voz en francés a partir de texto (pipeline `text-to-speech`).
- Generación de audio no autorregresiva, lo que permite inferencia en paralelo y baja latencia.
- Ejecución mediante la librería phoonnx con pesos ONNX, sin necesidad de PyTorch.
- Identificador de voz `larynx/fr-fr-siwis-glow_tts` para selección dentro de phoonnx.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo está orientado al francés.

## Casos de uso

- Lectura en voz alta de documentos: el modelo convierte texto plano en audio en francés, adecuado para pipelines de accesibilidad y lectores de pantalla que requieren inferencia en CPU.
- Asistentes de voz embebidos: al distribuirse en ONNX y ocupar ~0,1 GB, puede integrarse en dispositivos con recursos limitados para respuestas habladas en francés.
- Generación de audiolibros y pódcasts: permite sintetizar grandes volúmenes de texto de forma por lotes gracias a la naturaleza no autorregresiva de GlowTTS.
- Sistemas de atención telefónica automatizada: útil para mensajes pregrabados dinámicos y respuestas de IVR en francés con baja latencia.
- Accesibilidad web: integración en aplicaciones que lean contenido en francés para usuarios con discapacidad visual.
- Prototipado rápido de productos de voz: al estar empaquetado para phoonnx, permite validar flujos TTS sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que funcione en CPU sin GPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no documentada; el tamaño del repositorio sugiere que cabría en cualquier GPU de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: librería phoonnx (según `library_name: phoonnx`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-fr-fr-siwis | GlowTTS (ONNX) | no disponible | other | ONNX | Hugging Face |
| Modelos Piper TTS (p. ej. fr_FR-siwis) | VITS | no aplica | MIT (habitual) | ONNX | Hugging Face / GitHub |
| Modelos Coqui TTS (p. ej. Tacotron2) | Tacotron2 | no aplica | MPL-2.0 (habitual) | PyTorch | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de formato y licencia, y las licencias de los alternativos deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- La licencia es `other` y la model card no concreta los términos, por lo que el uso comercial requiere verificar la licencia del repositorio origen Phoonnx/phoonnx-glowtts.
- No se documentan sesgos conocidos ni evaluación de calidad del audio en francés.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- El soporte de idiomas no está documentado oficialmente; el identificador sugiere únicamente francés.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar cobertura léxica y calidad en dominios específicos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error en los metadatos del repositorio.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-fr-fr-siwis](https://huggingface.co/Phoonnx/glowtts-fr-fr-siwis)
- [Repositorio origen: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Librería phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
