# Sameer0313/kashmiri-whisper-lora

## Resumen

kashmiri-whisper-lora es un adaptador LoRA (PEFT) sobre el modelo base openai/whisper-small, desarrollado por el usuario Sameer0313, orientado al reconocimiento automático del habla (ASR) en lengua cachemira (koshur, کٲشُر). El modelo aborda un problema concreto: Whisper no dispone de un token de idioma discreto para cachemir, por lo que el adaptador enruta la inferencia a través del token `<|ur|>` (urdu) y utiliza un prompt de condicionamiento en escritura perso-árabe cachemir para forzar la emisión de grafemas auténticos (`ٲ`, `ٕ`, `ۍ`, `ۅ`, `ۆ`, `ژ`, `ٮ۪`) en lugar de la ortografía urdu estándar.

El adaptador se entrenó sobre el corpus mozilla-foundation/common_voice_17_0 y se distribuye bajo licencia Apache 2.0, con soporte declarado para cachemir (ks) y urdu (ur). Al estar construido sobre whisper-small, hereda la arquitectura transformer encoder-decoder de Whisper y su ventana de audio de 30 segundos por segmento; el adaptador añade un post-filtro determinista de normalización ortográfica y de diacríticos.

Su relevancia actual radica en que cubre un idioma de bajos recursos con muy poca representación en sistemas ASR comerciales, y lo hace con un coste de despliegue reducido al ser un adaptador LoRA sobre un modelo pequeño (~244 M de parámetros en el base), lo que permite ejecutarlo en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA sobre openai/whisper-small; el modelo base tiene ~244 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; hereda la ventana de audio de 30 s por segmento de Whisper |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Cachemir (ks), urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos PEFT/LoRA (librería `peft`); el modelo base en formato transformers (safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openai/whisper-small, un transformer encoder-decoder con atención estándar que procesa espectrogramas Mel de audio de 30 segundos y genera tokens de texto de forma autorregresiva. El entrenamiento se realizó mediante LoRA (Low-Rank Adaptation) sobre el corpus Common Voice 17.0, según declara la model card; no se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica principal es el condicionamiento por prompt de dominio: como Whisper carece de token `<|kas|>`, el adaptador enruta por `<|ur|>` e inyecta un prompt en perso-árabe cachemir (`کٲشُر زَبان، کٲشِر پٲٹھۍ، خۄداے، سۄ چھَ، سُہ چھُ، بہٕ چھُس، پَرٛؠتھ دۅہ`) que condiciona la atención cruzada del decoder hacia grafemas cachemires. Adicionalmente, el autor declara la preservación de la sintaxis V2 (verbo en segunda posición) del cachemir y de la concordancia del auxiliar de pasado (`چھُ`, `چھِ`, `چھَ`, `چھُس`), evitando postposiciones urdu como `نے`, e incluye un normalizador ortográfico determinista de vocales y diacríticos como post-filtro.

## Capacidades

- Reconocimiento automático del habla (transcripción) en cachemir con salida en escritura perso-árabe.
- Transcripción en urdu como idioma de enrutamiento del token de lenguaje.
- Condicionamiento por prompt de dominio para forzar la ortografía cachemir frente a la urdu.
- Normalización determinista de vocales y diacríticos y transliteración fonética romana según la model card.
- Preservación declarada del orden V2 y de la morfología verbal del cachemir.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Transcripción de audio en cachemir para archivo y documentación: el adaptador convierte grabaciones de voz en texto perso-árabe cachemir, útil para digitalizar material oral de una lengua de bajos recursos con poca cobertura en ASR comerciales.
- Subtitulado de vídeo y pódcast en cachemir: al heredar la ventana de 30 s por segmento de Whisper, encaja en pipelines de segmentación y alineación temporal para generar subtítulos.
- Aplicaciones de accesibilidad y dictado: integración en interfaces de voz para hablantes de cachemir que necesitan entrada por voz en escritura nativa, con el post-filtro ortográfico garantizando grafemas canónicos.
- Investigación lingüística y corpus: generación de transcripciones para estudios de morfología y sintaxis cachemir (orden V2, concordancia de auxiliares) a partir de grabaciones de campo.
- Preservación del patrimonio oral: transcripción de recitaciones y material religioso o cultural, como sugiere el ecosistema del autor (Koshur Quran & Voice Studio).
- Prototipado de ASR multilingüe en entornos con recursos limitados: al ser un adaptador LoRA sobre whisper-small, permite desplegar y experimentar con hardware modesto y sustituir o combinar adaptadores por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara las métricas WER y CER en los metadatos, pero no incluye valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al derivar de whisper-small (~244 M de parámetros), la huella es reducida y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; por tamaño del modelo base, cualquier GPU con suficiente memoria para whisper-small en fp16 debería ser viable.
- Cabe en GPU de consumo: previsiblemente sí, al estar basado en whisper-small; sin cifras oficiales del autor.
- Opciones de despliegue: la model card documenta el uso con `transformers` + `peft` (`WhisperProcessor`, `WhisperForConditionalGeneration`, `PeftModel`) en Python. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sameer0313/kashmiri-whisper-lora | Adaptador LoRA sobre whisper-small (~244 M base) | 30 s por segmento (heredado) | ks, ur | Apache 2.0 | Hugging Face (PEFT) |
| openai/whisper-small | ~244 M | 30 s por segmento | Multilingüe (sin token ks) | MIT/Apache 2.0 según variante | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | 30 s por segmento | Multilingüe amplio | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER/CER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado valores de WER ni CER, por lo que el rendimiento real del adaptador no está cuantificado en la información disponible.
- El enrutamiento mediante el token `<|ur|>` puede inducir sesgo hacia la ortografía y gramática urdu si el prompt de condicionamiento no se aplica correctamente.
- Dependencia crítica del prompt de condicionamiento: el uso sin el prompt cachemir puede degradar la calidad de la transcripción.
- Modelo base pequeño (whisper-small), con menor capacidad que variantes large para acentos, ruido y dominios difíciles.
- Ventana de audio limitada a 30 segundos por segmento, heredada de Whisper; requiere segmentación previa para audio largo.
- Cobertura de idiomas restringida a cachemir y urdu; no se documentan otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos de ASR, especialmente en silencios o audio de baja calidad.
- Sin datos publicados sobre sesgos demográficos, de género o de variedades dialectales del cachemir.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openai/whisper-small y del corpus Common Voice 17.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Sameer0313/kashmiri-whisper-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Modelo de traducción del mismo autor: https://huggingface.co/Sameer0313/kashmiri-nllb-lora
- Aplicación web del autor: https://koshurquran.my.id/quran-app/transcribe.html
