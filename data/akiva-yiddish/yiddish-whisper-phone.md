# akiva-yiddish/yiddish-whisper-phone

## Resumen

Yiddish Whisper for phones es una familia de dos modelos de reconocimiento automático del habla (ASR) especializados en yiddish hasídico y optimizados para ejecución totalmente local en dispositivos móviles mediante whisper.cpp. Lo publica el usuario akiva-yiddish y consta de dos variantes derivadas de la arquitectura Whisper de OpenAI: una basada en whisper-small (244 M de parámetros) como raíz del repositorio, y otra basada en whisper-base (74 M) en el subdirectorio `base/`. El problema que aborda es la ausencia de modelos ASR ligeros y precisos para yiddish, un idioma con pocos recursos y con una comunidad hablante relevante que necesita transcripción en el propio dispositivo sin enviar audio a la nube.

El modelo parte de checkpoints intermedios en hebreo (mike249/whisper-small-he-v4 y amitkot/whisper-base-he) en lugar de los pesos originales de OpenAI, porque aquellos obtuvieron mejor rendimiento zero-shot sobre el conjunto de prueba en yiddish. Sobre esa base se realizó un ajuste fino completo con unas 97 horas de voz en yiddish procedentes de ivrit.ai (16.503 clips), seguido de un ajuste corto sobre 77 grabaciones de dictado de un único hablante.

La relevancia actual reside en su enfoque "on-device": se distribuyen pesos en fp16 para transformers y versiones cuantizadas en formato ggml (q8_0 y q5_0) para whisper.cpp, con tamaños que van desde los 55 MB del base q5_0 hasta los 264 MB del small q8_0, lo que permite ejecución en teléfonos, Raspberry Pi y equipos sin GPU. La licencia es derivada de ivrit.ai y restringe el uso a entrenamiento de modelos de IA o investigación académica, prohibiendo deepfakes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), entrada de espectrograma mel de 80 canales |
| Parametros totales | 241.734.912 (variante small, safetensors); variante base: aproximadamente 74 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 30 segundos de audio por inferencia (no aplica contexto de texto) |
| Tipos de cuantizacion | fp16 (Hugging Face), q8_0 y q5_0 (ggml para whisper.cpp) |
| Idiomas soportados | yi (yiddish, variante hasídica) |
| Licencia | ivrit-ai-derived (basada en CC BY 4.0 con condiciones adicionales) |
| Formato de pesos | safetensors (fp16) y ggml (.bin para whisper.cpp) |

Notas de la variante small: 12 capas de encoder, 12 de decoder, 768 de dimensión de modelo y 12 cabezas de atención (configuración estándar de whisper-small). La variante base sigue la configuración de whisper-base (6+6 capas).

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que consume espectrogramas mel logarítmicos de 80 canales calculados sobre ventanas de 30 segundos (3000 fotogramas a 100 fps) y genera transcripciones autorregresivas con tokens especiales para marcas de tiempo, detección de idioma y control de tareas. No incorpora innovaciones arquitectónicas propias; el valor añadido está en el ajuste fino y en el empaquetado para inferencia local.

El entrenamiento se realizó en tres fases. Primero se eligieron como punto de partida dos checkpoints en hebreo (mike249/whisper-small-he-v4 para small y amitkot/whisper-base-he para base), seleccionados por superar a los checkpoints originales de OpenAI en la prueba zero-shot sobre yiddish. Después se hizo un ajuste fino completo sobre aproximadamente 97 horas de voz en yiddish de ivrit.ai (crowd-recital-yi, unas 78 h, y crowd-whatsapp-yi, unas 19 h; 16.503 clips en total); el small se entrenó durante unos 85 minutos en una única T4 (unas 1,6 épocas) y el base también unos 85 minutos (unas 4,8 épocas). Por último, se aplicó un ajuste corto sobre 77 clips de dictado de un solo hablante, eligiendo la época según clips reservados. No se menciona uso de RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en yiddish hasídico, con normalización de números a dígitos en la evaluación.
- Reconocimiento de habla en ventanas de 30 segundos, con marcas de tiempo.
- Inferencia totalmente local y offline mediante whisper.cpp, sin dependencia de red.
- Ejecución en CPU y en dispositivos móviles gracias a los pesos cuantizados q8_0 y q5_0.
- Dos tamaños disponibles (small y base) para ajustar el balance precisión/recursos.
- Soporte para decodificación beam search (beam 5 en los resultados reportados) y greedy.
- No se documentan capacidades de tool calling, agentes, visión (salvo el encoder de audio propio de Whisper), audio generativo ni traducción a otros idiomas.

## Casos de uso

- Transcripción de dictado personal en el teléfono: el modelo small en q5_0 ocupa 175 MB y funciona en whisper.cpp sobre el propio dispositivo, útil para usuarios que dictan notas de voz en yiddish sin conexión.
- Subtitulado de grabaciones de estudio religioso (shiurim) o recitales comunitarios: la variante small ofrece 83,5% de palabras correctas en dictado, adecuada para generar borradores de transcripción que luego se revisan.
- Archivado y búsqueda de audio histórico en yiddish: transcribir colecciones de audio comunitario para indexarlas y hacerlas buscables, aprovechando el ajuste sobre el corpus crowd-recital-yi.
- Transcripción de mensajes de voz de WhatsApp: dado que parte de los datos de entrenamiento provienen de crowd-whatsapp-yi, el modelo está adaptado a ese registro informal y a grabaciones cortas.
- Asistentes de voz locales para comunidades con restricciones de conectividad o privacidad: al ejecutarse offline, el audio no sale del dispositivo.
- Investigación en ASR de bajos recursos: sirve como punto de partida o línea base para experimentos con yiddish y otras lenguas con pocos datos, dado que los datos de ivrit.ai son públicos bajo su licencia.
- Aplicaciones de accesibilidad: transcripción en tiempo real en dispositivos de gama baja (por ejemplo, el base q5_0 de 55 MB cabe en hardware muy limitado).

## Benchmarks y rendimiento

Conjunto de prueba de dictado fijo: 10 clips reservados del mismo hablante, unos 2 minutos en total. Exactitud de palabra = 100 − WER, con números normalizados a dígitos. El conjunto es pequeño, por lo que ±3 puntos es ruido.

| Modelo | Palabras correctas | Letras correctas |
|---|---|---|
| small, HF fp16, beam 5 | 83,5% | 92,6% |
| small, whisper.cpp q8_0, beam 5 | 80,9% | 91,7% |
| small, whisper.cpp q8_0, greedy | 78,4% | 90,3% |
| small, whisper.cpp q5_0, beam 5 | 79,9% | 92,0% |
| small, whisper.cpp q5_0, greedy | 76,3% | 90,2% |
| base, HF fp16, beam 5 | 71,6% | 84,3% |
| base, whisper.cpp q8_0, beam 5 | 72,7% | 84,7% |
| base, whisper.cpp q5_0, beam 5 | 66,9% | 81,2% |

En el split de evaluación yiddish de ivrit.ai (300 clips, greedy): small obtiene 62,8% de palabras correctas y base 59,3%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks, dado que es un modelo exclusivamente de ASR.

## Requisitos de hardware

- VRAM/RAM para inferencia: small fp16 ~0,5 GB; small q8_0 ~264 MB; small q5_0 ~175 MB; base q8_0 ~82 MB; base q5_0 ~55 MB.
- GPU recomendadas: no requiere GPU. Se entrenó en una T4, pero la inferencia objetivo es CPU.
- Cabe en cualquier GPU de consumo e integrada, y también en CPU. El base q5_0 (55 MB) cabe en teléfonos, Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: whisper.cpp (formato ggml), transformers con los pesos fp16, y cualquier runtime compatible con Whisper (por ejemplo, integraciones basadas en ggml). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no se proporcionan datos concretos. El entrenamiento del small fue de unos 85 minutos en una T4 para ~1,6 épocas sobre 97 h de audio, dato no extrapolable directamente a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yiddish-whisper-phone (small) | 244 M | yiddish | ivrit-ai-derived | safetensors, ggml | 83,5% palabras en dictado; especializado |
| yiddish-whisper-phone (base) | 74 M | yiddish | ivrit-ai-derived | safetensors, ggml | 71,6% palabras en dictado |
| openai/whisper-small | 244 M | 99 idiomas | MIT | safetensors, ggml | Multilingüe generalista; peor zero-shot en yiddish según el autor |
| openai/whisper-base | 74 M | 99 idiomas | MIT | safetensors, ggml | Multilingüe generalista; menos preciso en yiddish |
| mike249/whisper-small-he-v4 | 244 M | hebreo | no indicada en su página | safetensors | Checkpoint intermedio en hebreo usado como base |
| amitkot/whisper-base-he | 74 M | hebreo | no indicada en su página | safetensors | Checkpoint intermedio en hebreo usado como base |

No se dispone de comparativas numéricas directas publicadas frente a otros modelos ASR específicos de yiddish en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de prueba del dictado tiene solo 10 clips (~2 minutos), por lo que ±3 puntos es ruido y las cifras no son estadísticamente robustas.
- El ajuste final se hizo sobre 77 clips de un único hablante; el modelo puede estar sobreajustado a esa voz y generalizar peor a otros hablantes.
- Entrenado únicamente en yiddish hasídico; no cubre otros dialectos ni registros del yiddish de forma garantizada.
- Riesgo de alucinación inherente a Whisper, especialmente con audio ruidoso, solapamiento de voces o silencios largos.
- La licencia ivrit-ai-derived limita el uso: solo para entrenar modelos de IA o investigación académica, y prohíbe crear deepfakes (audio o vídeo que imite la voz o la imagen de las personas).
- La licencia también prohíbe la distribución que infrinja controles de exportación o sanciones.
- Los checkpoints intermedios en hebreo (mike249/whisper-small-he-v4 y amitkot/whisper-base-he) no declaran licencia en sus páginas, lo que introduce incertidumbre jurídica sobre la cadena de pesos.
- Al ser un modelo especializado, no sirve para traducción, tool calling ni tareas de texto generales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/akiva-yiddish/yiddish-whisper-phone
- ivrit.ai: https://www.ivrit.ai
- Licencia ivrit.ai: https://www.ivrit.ai/en/the-license/
- Modelo base small en hebreo: https://huggingface.co/mike249/whisper-small-he-v4
- Modelo base base en hebreo: https://huggingface.co/amitkot/whisper-base-he
- Whisper original de OpenAI (small): https://huggingface.co/openai/whisper-small
- Whisper original de OpenAI (base): https://huggingface.co/openai/whisper-base
- Dataset crowd-recital-yi: https://huggingface.co/datasets/ivrit-ai/crowd-recital-yi-whisper-training
- Dataset crowd-whatsapp-yi: https://huggingface.co/datasets/ivrit-ai/crowd-whatsapp-yi-whisper-training
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
