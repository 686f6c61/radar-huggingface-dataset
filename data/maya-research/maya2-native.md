# maya-research/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Maya Research, orientado a 11 lenguas de la India y al inglés. Genera audio mono a 24 kHz, permite streaming en tramas de 80 ms y ofrece 20 voces integradas junto con clonación de voz zero-shot y síntesis cruzada entre idiomas. Los pesos se publican bajo licencia Apache-2.0, lo que facilita su despliegue autoalojado en infraestructura propia.

El modelo parte de Qwen/Qwen3-1.7B-Base como base y suma componentes específicos de audio hasta alcanzar 2.502.398.656 parámetros únicos (aproximadamente 5,0 GB en BF16). La librería de inferencia se distribuye como `maya3`, manteniendo los identificadores `Maya3TTS` y `maya3_config.json` por compatibilidad, y expone una API en Python, un endpoint de voz compatible con OpenAI y streaming por WebSocket con batching continuo y normalización de texto (números, fechas, divisas).

Su relevancia actual radica en cubrir un hueco poco atendido: TTS de calidad para lenguas indias con licencia permisiva y capacidad de autoalojamiento. En el leaderboard VoiceArena de hindi (vista solo tiempo real, consultado el 3 de noviembre de 2026) ocupa la posición 2 con un Elo Bradley-Terry de 1047 ±11 sobre 2268 muestras, por detrás de Cartesia Sonic-3.6 (1094) y por delante de Cartesia Sonic-3.5 (1035) y Smallest AI Lightning 3.1 Pro (1024).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS construido sobre Qwen/Qwen3-1.7B-Base; componentes de audio con codec Mimi según etiquetas) |
| Parámetros totales | 2.502.398.656 (2,50B únicos) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16, ~5,0 GB) |
| Idiomas soportados | asamés (as), bengalí (bn), inglés (en), guyaratí (gu), hindi (hi), canarés (kn), malayalam (ml), marati (mr), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 (ver licencias de componentes en la model card) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de audio | 24 kHz, mono |
| Tramas de streaming | 80 ms |
| Voces integradas | 20 |
| Fecha de checkpoint | 1.0, 25 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo se construye como un fine-tune de Qwen/Qwen3-1.7B-Base (un transformer decoder de la familia Qwen3) y de que emplea Mimi, el codec neuronal de audio de Kyutai, tal como refleja la etiqueta `mimi`. El pipeline declarado es `text-to-speech` y la salida es audio mono a 24 kHz con streaming en tramas de 80 ms, lo que implica un decodificador de audio incremental. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

Sí se documentan capacidades de ingeniería del motor de inferencia: batching continuo, normalización de texto para números, fechas, divisas y otras formas escritas, protocolo WebSocket con contextos de petición separados y cancelación, y un endpoint de voz compatible con OpenAI. La model card menciona además clonación de voz zero-shot y síntesis cruzada entre idiomas, aunque advierte que la calidad de acento e identidad varía según la combinación idioma-voz y remite a la tabla de cobertura de voces.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas: asamés, bengalí, inglés, guyaratí, hindi, canarés, malayalam, marati, oriya, panyabí, tamil y telugu.
- Generación de audio a 24 kHz mono con streaming en tramas de 80 ms, apto para reproducción incremental.
- 20 voces integradas seleccionables mediante la misma API.
- Clonación de voz zero-shot a partir de una referencia permitida.
- Clonación y síntesis cruzada entre idiomas (cross-lingual), manteniendo una identidad de voz a través de distintas lenguas.
- Normalización de texto para números, fechas, divisas y otras formas escritas antes de la síntesis.
- Interfaces de integración: API en Python, endpoint HTTP compatible con OpenAI y streaming por WebSocket.
- Batching continuo en el servidor de inferencia para atender varias peticiones concurrentes.
- Protocolo WebSocket con contextos de petición separados y cancelación, orientado a agentes de voz.
- No se documentan capacidades de visión, audio de entrada, tool calling ni razonamiento multi-paso; el modelo es exclusivamente de texto a voz.

## Casos de uso

- Agentes de voz conversacionales: el modelo actúa como etapa de generación de habla tras un LLM y empieza a reproducir audio mientras sigue generando, gracias al streaming en tramas de 80 ms y al protocolo WebSocket con cancelación, lo que reduce la latencia percibida en diálogos multi-turno.
- Sistemas IVR y atención telefónica automatizada: con un endpoint compatible con OpenAI y batching continuo, se puede desplegar en un servidor NVIDIA propio para responder en hindi, tamil, telugu u otras lenguas indias sin depender de proveedores externos.
- Narración y audiolibros multilingües: las 20 voces integradas y la clonación cruzada permiten mantener una voz coherente a lo largo de un mismo contenido distribuido en varios idiomas.
- Herramientas de accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de asistencia en lenguas indias con normalización previa de números, fechas y divisas, lo que evita lecturas erróneas de cifras y formatos.
- Locución para contenidos educativos y formación: generación por lotes de pistas de audio en varias lenguas a partir de un mismo guion, usando el batching continuo del motor para procesar grandes volúmenes.
- Integración en pipelines de agentes: el modelo se puede encadenar detrás de un orquestador que prepare la respuesta textual y delegue la síntesis en Maya 2 Native mediante la API de Python o el endpoint HTTP.
- Prototipado de asistentes de voz autoalojados: al publicarse los pesos en safetensors bajo Apache-2.0, equipos de investigación pueden ejecutar el checkpoint en su propia GPU y evaluar variantes de voz y de idioma sin restricciones de uso comercial.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al leaderboard VoiceArena de hindi, con el filtro Hindi / All / Real-time only, consultado el 3 de noviembre de 2026. La métrica es Elo Bradley-Terry con intervalos de confianza del 95 %.

| Puesto | Creador | Modelo | Elo | IC 95 % | Muestras |
|---|---|---|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1289 |
| 2 (2–4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2268 |
| 3 (2–5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1802 |
| 4 (2–5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1870 |
| 5 (3–5) | Murf AI | Falcon 2 | 1021 | ±14 | 1352 |
| 6 (6–7) | Cartesia | Sonic-3 | 961 | ±9 | 4256 |
| 7 (6–7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3611 |

La propia model card matiza que, en la vista de hindi con todos los modelos (no solo tiempo real) de la misma fecha, Maya-2-Native figura en el puesto 7 con intervalo 5–10, y que el puesto 2 corresponde específicamente a la vista de solo tiempo real. También señala que VoiceArena data la entrada de Maya-2-Native en julio de 2026 y no identifica una revisión exacta del checkpoint. Una captura adjunta muestra el puesto 2 con Elo 1049 ±10 y 2171 muestras, aunque sin fecha de captura. No se han publicado resultados de benchmarks objetivos (WER, MOS, SIM) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 5,0 GB, por lo que se necesita algo más de esa cifra para pesos más estados de activación y caché del decodificador de audio. No se publica una estimación oficial de VRAM total ni de cuantizaciones alternativas.
- GPU recomendadas: la model card indica ejecutar los pesos en una GPU NVIDIA propia, sin especificar modelos concretos. No se detallan recomendaciones por modelo (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se confirma oficialmente que quepa en tarjetas de consumo; por el tamaño de pesos en BF16 (unos 5,0 GB) es plausible en GPUs con 8 GB o más, pero este dato no está verificado en la información disponible.
- Opciones de despliegue: motor propio de la librería `maya3` con API en Python, endpoint HTTP compatible con OpenAI y streaming por WebSocket con batching continuo. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia ni de throughput. El único dato relacionado es el tamaño de trama de streaming de 80 ms de audio.

## Comparativa con modelos similares

Comparación con alternativas de la misma categoría (TTS multilingüe para lenguas indias) según los datos disponibles en la información proporcionada. Los datos de licencia, parámetros y contexto de los competidores no están disponibles en esta información y se marcan como tales.

| Modelo | Creador | Elo hindi (tiempo real) | Licencia | Pesos abiertos | Idiomas |
|---|---|---:|---|---|---|
| Maya-2-Native | Maya Research | 1047 ±11 | Apache-2.0 | Sí (safetensors) | 11 lenguas indias + inglés |
| Sonic-3.6 | Cartesia | 1094 ±13 | no disponible | no disponible | no disponible |
| Sonic-3.5 | Cartesia | 1035 ±12 | no disponible | no disponible | no disponible |
| Lightning 3.1 Pro | Smallest AI | 1024 ±12 | no disponible | no disponible | no disponible |
| Bulbul-V3 | Sarvam AI | 957 ±9 | no disponible | no disponible | no disponible |

La ventaja diferencial de Maya 2 Native frente a estos sistemas es la combinación de pesos abiertos, licencia Apache-2.0 y despliegue autoalojado; sus competidores en el leaderboard son, según la información disponible, servicios propietarios sin pesos publicados.

## Limitaciones y advertencias

- La calidad de acento e identidad de voz varía según la combinación idioma-voz; la model card remite a la tabla de cobertura de voces para elegir adecuadamente.
- El resultado del puesto 2 en VoiceArena está acotado a la vista de hindi y solo tiempo real; en la vista con todos los modelos el puesto es el 7 (intervalo 5–10). Los intervalos de confianza se solapan con los de los modelos vecinos, por lo que las diferencias de Elo no deben interpretarse como una ventaja concluyente.
- VoiceArena data la entrada del modelo en julio de 2026 y no identifica la revisión exacta del checkpoint evaluado, lo que dificulta reproducir la medición.
- No se documentan sesgos lingüísticos o de voz concretos, ni tasas de alucinación o de error de pronunciación; al ser un modelo de síntesis, el riesgo principal es la generación de prosodia o pronunciación incorrectas en textos atípicos.
- La clonación de voz exige usar referencias permitidas; no se detallan en la información disponible las restricciones legales o éticas adicionales más allá de la licencia Apache-2.0.
- La licencia Apache-2.0 cubre los pesos del modelo, pero la model card remite a una sección de licencias de componentes que podría imponer condiciones adicionales sobre dependencias (por ejemplo, el codec Mimi); conviene revisarla antes de un despliegue comercial.
- No se publican datos sobre longitud máxima de texto de entrada, latencia en producción ni rendimiento bajo cuantización, lo que limita la planificación de capacidad.
- La nomenclatura es confusa: el modelo se llama Maya 2 Native, pero el paquete, la clase y el fichero de configuración conservan los nombres `maya3`, `Maya3TTS` y `maya3_config.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maya-research/maya2-native
- Código de inferencia (GitHub): https://github.com/MayaResearch/maya2-native
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo (Google Drive): https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Leaderboard VoiceArena (hindi): https://voicearena.com/tts-leaderboard/hindi
- Metodología de VoiceArena: https://voicearena.com/tts-methodology
- Captura del leaderboard: https://huggingface.co/maya-research/maya2-native/resolve/main/voicearena-hindi-realtime-snapshot.png
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
