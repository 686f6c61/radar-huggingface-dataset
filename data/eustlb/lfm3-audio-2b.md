# eustlb/LFM3-Audio-2B

## Resumen

LFM3-Audio-2B es un modelo multimodal de audio desarrollado por Liquid AI dentro de la familia LFM3, diseñado para ejecutarse localmente en portátiles y dispositivos edge. Con 2.002.332.928 parámetros totales (aproximadamente 2B), acepta texto o audio como entrada y genera texto, voz o ambos, cubriendo tareas de reconocimiento de voz, síntesis, traducción y comprensión de audio. Su propuesta central es ofrecer un modelo de audio completo y compacto que no requiera infraestructura en la nube.

El modelo combina un backbone LFM3, un codificador de audio causal propio (in-house) y el tokenizador de audio LiquidCodec, una evolución respecto a LFM2.5-Audio que según el autor mejora la calidad de la voz generada. Soporta 18 idiomas para tareas de voz multilingüe (transcripción, síntesis y traducción), aunque el chat de voz conversacional está limitado actualmente al inglés.

Es relevante para desarrolladores que necesitan integrar capacidades de voz en aplicaciones locales o de borde sin depender de APIs externas: el tamaño del repositorio (4,2 GB) y sus 2B de parámetros lo sitúan en el rango de ejecución en hardware de consumo. La licencia es LFM1.0 (licencia propia de Liquid AI, marcada como "other" en Hugging Face), por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3, codificador de audio causal y tokenizador de audio LiquidCodec |
| Parametros totales | 2.002.332.928 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (licencia propia, etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere custom_code) |
| Pipeline | any-to-any |
| Tamano del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

La arquitectura se compone de tres piezas: un backbone LFM3 (la familia de modelos base de Liquid AI), un codificador de audio causal y el tokenizador de audio LiquidCodec. El codificador de audio y el tokenizador son desarrollos propios de Liquid AI introducidos en esta generación, y el autor afirma que mejoran la calidad de la voz respecto a LFM2.5-Audio. El modelo es any-to-any: acepta texto o audio y produce texto, habla o ambos.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. La model card únicamente menciona la arquitectura general y la mejora del stack de audio respecto a la generación anterior.

## Capacidades

- Chat de voz: permite formular preguntas habladas y recibir respuestas en streaming en texto y voz. Actualmente solo en inglés.
- Modo de razonamiento en texto: para respuestas únicamente de texto, el modelo puede razonar antes de contestar.
- Voz multilingüe: transcripción, síntesis y traducción de voz en 18 idiomas.
- Comprensión y razonamiento sobre audio: interpreta grabaciones y responde preguntas sobre el habla, los sonidos y los eventos que contienen.
- Tool calling: convierte peticiones habladas en llamadas a herramientas para controlar aplicaciones y dispositivos, con texto o voz junto a las llamadas.
- Salida multimodal: generación de texto, de habla o de ambos de forma combinada.
- Ejecución local: orientado a portátiles y dispositivos edge.

## Casos de uso

- Asistentes de voz locales: el modelo puede gestionar conversaciones habladas y responder con voz en streaming sin enviar audio a la nube, adecuado para aplicaciones de privacidad estricta en portátiles y dispositivos edge.
- Transcripción multilingüe: reconocimiento de voz en 18 idiomas para generar actas, subtítulos o notas de reuniones directamente en el dispositivo.
- Traducción de voz: traducción de habla entre los idiomas soportados, útil en atención al público, viajes o soporte multilingüe sin conexión.
- Control de dispositivos por voz: gracias al tool calling, las peticiones habladas se transforman en llamadas a funciones para manejar aplicaciones, domótica o asistentes embebidos.
- Análisis de grabaciones: comprensión y razonamiento sobre el contenido de un audio (habla, sonidos y eventos) para responder preguntas sobre la grabación en tareas de auditoría o accesibilidad.
- Síntesis de voz para accesibilidad: generación de respuestas habladas para lectores de pantalla, interfaces para personas con discapacidad visual o sistemas de interacción manos libres.
- Prototipado rápido en transformers: al cargarse con la librería transformers y pesos safetensors, permite integrar el modelo en pipelines de investigación y demos sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~2B parámetros, los pesos en safetensors ocupan aproximadamente 4 GB (coherente con el tamaño del repositorio de 4,2 GB), por lo que en fp16 se necesita del orden de 4-5 GB de memoria más el espacio para el codificador de audio y el caché de activaciones.
- GPU recomendadas: no disponibles en la documentación; por tamaño, el modelo está pensado para ejecutarse localmente en portátiles y dispositivos edge.
- GPU de consumo: el tamaño de 2B y el repositorio de 4,2 GB sugieren que puede caber en GPUs de consumo con 8 GB o más de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card indica la librería transformers con código personalizado (custom_code); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Audio-2B | ~2B | no disponible | 18 | lfm1.0 | Audio any-to-any, tool calling, orientado a edge |
| LFM2.5-Audio | no disponible | no disponible | no disponible | no disponible | Generación anterior de Liquid AI; el autor indica que LFM3-Audio-2B mejora la calidad de voz |
| Otros modelos de audio de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- El chat de voz conversacional está limitado actualmente al inglés; el resto de idiomas se cubren en tareas de transcripción, síntesis y traducción, no necesariamente en conversación hablada.
- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación: no cuantificado en la documentación; como modelo generativo, es esperable en tareas de razonamiento y comprensión de audio.
- No se especifica la longitud de contexto, lo que dificulta planificar el uso con audios o conversaciones largas.
- La licencia lfm1.0 es una licencia propia etiquetada como "other"; es necesario revisar sus términos para uso comercial antes de desplegar en producción.
- No se detallan los requisitos de hardware ni las cuantizaciones soportadas, lo que limita la planificación de despliegues en dispositivos concretos.
- Requiere código personalizado (custom_code) en transformers, lo que puede implicar dependencias específicas y menor compatibilidad con otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eustlb/LFM3-Audio-2B
- Blog de lanzamiento LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo LFM3-1.7B (referenciado en la model card): https://huggingface.co/LiquidAI/LFM3-1.7B
