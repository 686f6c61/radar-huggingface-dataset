# GeorgGK/chatterbox

## Resumen

Chatterbox es un modelo de síntesis de voz (text-to-speech) zero-shot desarrollado por Resemble AI, publicado bajo licencia MIT. La versión multilingüe, que es la que cubre este repositorio, soporta 23 idiomas de forma nativa, incluyendo castellano, inglés, alemán, francés, chino, árabe, hindi y japonés, entre otros. El modelo se presenta como el primer TTS open source con control explícito de exageración emocional, un parámetro ajustable que permite modular la expresividad del habla generada.

Arquitectónicamente se apoya en un backbone tipo Llama de 0,5 mil millones de parámetros, lo que lo sitúa en un rango de tamaño contenido que facilita su despliegue en hardware de consumo. Incorpora clonación de voz zero-shot a partir de un clip de referencia y utiliza inferencia guiada por alineamiento para mantener estabilidad en generaciones largas. El modelo ha sido entrenado con aproximadamente 0,5 millones de horas de datos de audio depurados.

Su relevancia actual radica en que compite directamente con sistemas propietarios como ElevenLabs en evaluaciones ciegas por pares, según los datos aportados por el autor, y lo hace con licencia permisiva y pesos abiertos. Además, todas las salidas incorporan marca de agua neuronal PerTh, lo que facilita la trazabilidad del audio sintético en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone tipo Llama (transformer) de 0,5B con decoder de audio y vocoder HiFT-GAN |
| Parametros totales | 0,5 mil millones (backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 23: ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 9,6 GB; la librería `chatterbox-tts` gestiona la carga) |

## Arquitectura y entrenamiento

Chatterbox emplea un backbone transformer de tipo Llama con 0,5 mil millones de parámetros que actúa como generador de tokens de audio, combinado con un vocoder HiFT-GAN para la síntesis final de la forma de onda. La inferencia está guiada por alineamiento, una técnica que el autor describe como clave para la estabilidad en pasajes largos. El modelo se apoya en trabajos previos como CosyVoice para el pipeline de TTS y Llama 3 para el diseño del backbone.

El entrenamiento se realizó sobre aproximadamente 0,5 millones de horas de datos de audio depurados, según la model card. No se especifican en la información disponible la composición exacta del dataset, el número de tokens de texto utilizados ni si hubo fases de RLHF o DPO. La model card menciona que los prompts de referencia provienen de datos disponibles libremente en internet.

La innovación más destacable es el control de exageración emocional (`exaggeration`), ajustable en tiempo de inferencia junto con el peso de classifier-free guidance (`cfg`). Los valores por defecto son `exaggeration=0.5` y `cfg=0.5`; para habla dramática se recomienda subir la exageración a 0,7 o más y bajar `cfg` a ~0,3. Adicionalmente, todas las salidas se marcan con la marca de agua neuronal PerTh, que sobrevive a compresión MP3 y ediciones comunes con una tasa de detección cercana al 100 %.

## Capacidades

- Síntesis de voz zero-shot en 23 idiomas sin necesidad de fine-tuning.
- Clonación de voz a partir de un clip de audio de referencia (`audio_prompt_path`).
- Control de exageración emocional e intensidad expresiva mediante el parámetro `exaggeration`.
- Control de fidelidad y ritmo mediante classifier-free guidance (`cfg`).
- Selección explícita de idioma mediante `language_id` en la variante multilingüe.
- Inferencia estable en pasajes largos gracias al alineamiento guiado.
- Script de conversión de voz incluido en la librería.
- Marcado de agua neuronal PerTh en todas las salidas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- Doblaje y localización de vídeo: el soporte nativo de 23 idiomas y la clonación zero-shot permiten generar pistas de voz en castellano, inglés o japonés manteniendo el timbre del actor original a partir de un clip de referencia.
- Asistentes de voz y agentes conversacionales: el modelo puede integrarse en pipelines de agentes para sintetizar respuestas en tiempo de ejecución, con control de expresividad para adaptar el tono según el contexto de la conversación.
- Audiolibros y narración: el parámetro `exaggeration` permite alternar entre narración neutra (`exaggeration=0.5`) y pasajes dramáticos (`exaggeration=0.7` o superior), ajustando `cfg` para compensar el ritmo.
- Accesibilidad y lectores de pantalla: generación de voz natural en castellano y otros idiomas para aplicaciones de lectura de texto, con la ventaja de una licencia MIT que permite uso comercial sin restricciones.
- Creación de contenido para vídeo y videojuegos: síntesis de voces de personajes con distintos niveles de intensidad emocional, útil para prototipado rápido de diálogos y memes.
- Producción de pódcasts y contenido educativo: generación de locuciones multilingües a partir de un clip de referencia del locutor, con marca de agua PerTh que permite verificar la procedencia del audio sintético.
- Conversión de voz: el script de voice conversion incluido permite transformar una grabación existente al timbre de otra voz de referencia, útil en postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma que el modelo supera a ElevenLabs en evaluaciones ciegas por pares, con un enlace a un panel de Podonos, y lo describe como "SoTA zero-shot English TTS", pero no se aportan cifras concretas de métricas como MOS, WER o similitud de hablante.

## Requisitos de hardware

- El backbone de 0,5B parámetros es ligero; el repositorio completo ocupa 9,6 GB, lo que sugiere pesos en precisión completa o fp16 junto con el vocoder y componentes auxiliares.
- VRAM estimada: no disponible de forma explícita; por el tamaño del backbone, es plausible que quepa en GPUs de consumo con 8-12 GB, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- Despliegue: la vía oficial es la librería `chatterbox-tts` (`pip install chatterbox-tts`), que carga el modelo con `from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de texto.
- Latencia y throughput: no disponible para la versión open source. El autor menciona que su servicio comercial ofrece latencias inferiores a 200 ms, pero no se traslada ese dato al modelo abierto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Clonación zero-shot | Control emocional |
|---|---|---|---|---|---|
| Chatterbox Multilingual | 0,5B | 23 | MIT | Sí | Sí (`exaggeration`) |
| ElevenLabs (propietario) | no disponible | múltiples | propietaria | Sí | parcial |
| CosyVoice | no disponible | múltiples | no disponible | Sí | no disponible |

La comparación con ElevenLabs se apoya únicamente en la afirmación del autor sobre preferencia en evaluaciones ciegas; no se dispone de cifras verificables. CosyVoice aparece como referencia técnica en los agradecimientos de la model card, pero no se detallan sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de uso malintencionado: la propia model card advierte "Don't use this model to do bad things"; la clonación de voz facilita suplantaciones, aunque la marca de agua PerTh ayuda a la trazabilidad.
- Desajuste de idioma y acento: si el clip de referencia no coincide con el `language_id` indicado, la salida puede heredar el acento del clip; el autor recomienda fijar `cfg=0` para mitigarlo.
- Sesgos: no se documentan análisis de sesgos por género, etnia o acento en la información disponible.
- Alucinación en audio: no se cuantifica la tasa de artefactos o pronunciaciones erróneas; el alineamiento guiado se presenta como mitigación de inestabilidad, sin métricas.
- Contexto: no se especifica la longitud máxima de texto por generación.
- Licencia: MIT permite uso comercial, pero la marca de agua PerTh es obligatoria en las salidas, lo que puede condicionar ciertos flujos de postproducción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una réplica o espejo del modelo original de Resemble AI más que de una publicación con tracción propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GeorgGK/chatterbox
- Modelo original de Resemble AI (referencia en la model card): https://huggingface.co/ResembleAI/Chatterbox
- Demo de audio: https://resemble-ai.github.io/chatterbox_demopage/
- Space de Gradio: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Evaluación en Podonos: https://podonos.com/resembleai/chatterbox
- Repositorio PerTh (marca de agua): https://github.com/resemble-ai/perth
- CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- HiFT-GAN: https://github.com/yl4579/HiFTNet
- Llama 3: https://github.com/meta-llama/llama3
- Servicio comercial de Resemble AI: https://resemble.ai
