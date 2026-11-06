# maternion/LFM3-Audio-2B-Heretic2-Abliterated-GGUF

## Resumen

LFM3-Audio-2B-Heretic2-Abliterated-GGUF es una cuantización en formato GGUF del modelo LiquidAI/LFM3-Audio-2B, un modelo compacto any-to-any (texto y audio como entrada, texto y voz como salida) desarrollado originalmente por Liquid AI. Esta versión concreta la publica el usuario maternion y aplica una técnica de abliteración mediante heretic 2.0.0 con el objetivo de reducir el comportamiento de rechazo de la versión base, manteniendo intactas las capacidades de audio y texto. El modelo base emplea una arquitectura híbrida de Liquid AI con encoder de audio propio y el tokenizador LiquidCodec, y está pensado para ejecutarse localmente en portátiles y dispositivos de borde.

El paquete incluye cuantizaciones desde IQ2_M (0,67 GB) hasta BF16 (3,47 GB), además de un fichero `mmproj` obligatorio para el procesamiento de audio. El backbone de texto es el único componente modificado por la abliteración: el encoder de audio, el proyector, el depthformer y el LiquidCodec son idénticos byte a byte al modelo base. Sin el fichero `mmproj`, las cuantizaciones funcionan únicamente como modelo de texto.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo multimodal de audio y voz en hardware de consumo mediante llama.cpp u Ollama; por otro, documenta un proceso de abliteración con métricas explícitas (divergencia KL de 0,0761 y reducción de rechazos de 98/100 a 19/100) que resulta útil para evaluar los compromisos entre alineación, coherencia y capacidades conservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de Liquid AI con encoder de audio propio y tokenizador LiquidCodec (detalles internos de capas no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (más fichero mmproj BF16 separado para audio) |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B es un modelo any-to-any que acepta texto o audio como entrada y genera texto, voz o ambos. Incorpora un encoder de audio desarrollado internamente por Liquid AI y el tokenizador de audio LiquidCodec, que según la documentación del autor mejora la calidad de la síntesis de voz respecto a la generación anterior LFM2.5. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La modificación de esta ficha es una abliteración con Arbitrary-Rank Ablation (ARA) ejecutada con heretic 2.0.0 sobre las capas 2 a 22 del backbone de texto, con un peso de preservación de comportamiento correcto de 0,9846 y un peso de direccionamiento del comportamiento no deseado de 0,000970. El proceso se seleccionó en el ensayo 301 de 315 y alcanzó una divergencia KL de 0,0761 respecto al modelo base. La evaluación de rechazos se realizó con 100 prompts de `LLM-LAT/harmful-dataset` (`train[400:500]`), puntuados por el modelo LiquidAI d1-2B a través del endpoint `/v1/systemone` de Ollama, con una ventana de respuesta de 300 tokens. El autor descarta explícitamente el clasificador BERT integrado en heretic por su baja precisión (2,4 %) en este modelo, y registra por separado la repetición degenerada (secuencias de seis palabras repetidas cuatro o más veces), que en esta versión aparece en 1 de cada 100 prompts.

## Capacidades

- Generación de texto a partir de entrada de texto o de audio.
- Reconocimiento automático de voz (ASR) con prompt de sistema `Perform ASR in <language>.` o inferencia de idioma con `Perform ASR.`.
- Síntesis de voz (TTS) con selección de voz masculina o femenina mediante `--tts-voice` y código de idioma con `--tts-lang`.
- Conversaciones de voz en tiempo real a través de la API WebSocket `/v1/realtime` de `llama serve`.
- Salida combinada de texto y voz en una misma respuesta.
- Cobertura multilingüe en 18 idiomas, incluidos español, inglés, alemán, francés, japonés, coreano y chino.
- Comportamiento de rechazo reducido respecto al modelo base (19/100 frente a 98/100 en el conjunto de evaluación del autor).
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles con la API de OpenAI.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo acepta audio como entrada y genera texto mediante el prompt de ASR, lo que permite transcribir grabaciones en cualquiera de los 18 idiomas soportados sin depender de servicios en la nube.
- Asistentes de voz locales en dispositivos de borde: con cuantizaciones de 0,67 a 1,85 GB, el modelo cabe en portátiles y mini-PC, y la API `/v1/realtime` de `llama serve` habilita conversaciones de voz con baja dependencia de infraestructura.
- Generación de audiolibros y avisos hablados: la ruta `llama-tts` con `--tts-voice male|female` y `--tts-lang` permite sintetizar texto en varios idiomas para contenido pregrabado o sistemas de megafonía.
- Atención al cliente por voz: la combinación de ASR, generación de texto y TTS en un único modelo simplifica la arquitectura de un agente telefónico o de chat de voz, eliminando la necesidad de encadenar tres modelos separados.
- Investigación sobre alineación y abliteración: las métricas publicadas (KL de 0,0761, rechazos 19/100, repetición degenerada 1/100) permiten reproducir y comparar el efecto de ARA sobre un modelo multimodal pequeño en experimentos académicos.
- Procesamiento de audio en pipelines de datos: la integración con llama.cpp y la API compatible con OpenAI facilitan el despliegue en un servicio HTTP para transcribir o resumir lotes de audio en entornos con requisitos de privacidad.
- Prototipado de interfaces conversacionales sin censura: para investigación sobre comportamiento del modelo en dominios sensibles, la reducción de rechazos permite observar respuestas que el modelo base declinaría, siempre dentro de los límites de la licencia lfm1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas del proceso de abliteración, que se recogen a continuación:

| Metrica | Modelo base | Esta version |
|---|---|---|
| Rechazos (100 prompts) | 98/100 | 19/100 |
| Repeticion degenerada | 0/100 | 1/100 |
| Divergencia KL respecto al base | no aplica | 0,0761 |
| Ensayo seleccionado | no aplica | 301 de 315 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB con IQ2_M, 1,1 GB con Q4_K_M, 1,9 GB con Q8_0 y 3,5 GB con BF16, a los que se suman 0,57 GB del fichero `mmproj` si se procesa audio.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para Q4_K_M y Q5_K_M con audio; A100 o H100 no son necesarias para este tamaño, aunque pueden emplearse para servir múltiples instancias.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp a partir de la build b11960 (v0.8.0), que añade soporte de LFM3-Audio, con `llama serve`, `llama cli` y `llama-tts`; también Ollama y cualquier runtime que consuma GGUF compatible con la API de OpenAI.
- Latencia y throughput: no disponibles. El autor recomienda decodificación greedy (temperatura 0) para texto y, para voz, temperatura 1.0, top_k 128 y penalización de repetición 1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B-Heretic2-Abliterated (esta ficha) | 1.728.801.600 | no disponible | Audio y texto de entrada; texto y voz de salida | lfm1.0 | GGUF en Hugging Face |
| LiquidAI/LFM3-Audio-2B (base) | 1.728.801.600 | no disponible | Audio y texto de entrada; texto y voz de salida | lfm1.0 | Safetensors y GGUF en Hugging Face |
| LiquidAI/LFM3-1.7B | no disponible | no disponible | Solo texto | lfm1.0 | Hugging Face |

La comparación con alternativas de otros fabricantes en la misma categoría (modelos de audio any-to-any de menos de 3 000 millones de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración reduce la dirección de rechazo pero no elimina por completo el comportamiento de declive: aproximadamente 1 de cada 5 prompts dañinos sigue siendo rechazado según el propio autor.
- La abliteración no añade capacidades nuevas; el modelo conserva los límites del base en conocimiento, idiomas y modalidades.
- Riesgo de repetición degenerada: el autor registra 1/100 en esta versión frente a 0/100 del base, y advierte de que el modelo mantiene coherencia durante unas 94 tokens antes de caer en repetición de listas, lo que exige controlar la longitud de generación.
- El procesamiento de audio requiere el fichero `LFM3-Audio-2B-mmproj-BF16.gguf`; sin él, el modelo funciona solo con texto.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- No se dispone de datos sobre sesgos demográficos, lingüísticos o culturales del modelo base ni del efecto de la abliteración sobre ellos.
- La información sobre longitud de contexto y arquitectura interna detallada no está disponible, lo que limita la planificación de cargas con ventanas largas.
- El modelo se publicó en noviembre de 2026 y no registra descargas en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maternion/LFM3-Audio-2B-Heretic2-Abliterated-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Cuantizaciones oficiales del base: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-audio-2b
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-Audio-2B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release de llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
