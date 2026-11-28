# agbalu/Matoub-82M

## Resumen

Matoub-82M es un modelo de síntesis de voz (text-to-speech) neuronal especializado en cabilio (taqbaylit, código ISO `kab`), una lengua bereber de Argelia con recursos digitales muy limitados. Lo desarrolla el usuario agbalu y se construye como un ajuste fino de hexgrad/Kokoro-82M, un modelo TTS de 82 millones de parámetros basado en la arquitectura StyleTTS2. El resultado es un sintetizador de voz única masculina que genera audio mono a 24 kHz a partir de texto en ortografía latina cabilia, con una licencia Apache-2.0 que permite uso comercial.

La relevancia del modelo reside en dos factores. Primero, cubre una lengua de bajos recursos donde las alternativas abiertas son escasas y normalmente restrictivas: el principal referente previo, mms-tts-kab de Meta, funciona a 16 kHz y se distribuye bajo CC-BY-NC-4.0, lo que excluye el uso comercial. Segundo, el autor ha cuidado el front-end fonético: el inventario IPA base de Kokoro se amplió con tres filas de embedding dedicadas a las fricativas faríngeas cabilias (`ˤ`, `ʕ`, `ħ`), evitando que el conversor grafema-fonema elimine consonantes características de la lengua.

El modelo se entrenó con 21.953 clips restaurados de Common Voice cabilio, de los cuales 14.679 corresponden a la voz masculina seleccionada (unas 12,9 horas). El autor mantiene además una sucesora de mayor tamaño, Matoub-4B, un modelo autorregresivo basado en codecs con clonación de voz; Matoub-82M se conserva como opción ligera para inferencia en CPU y dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (inicializada desde hexgrad/Kokoro-82M) con vocoder iSTFTNet |
| Parametros totales | 81.731.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo TTS; procesa texto por frases) |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors de ~327 MB) |
| Idiomas soportados | Cabilio (taqbaylit, `kab`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~327 MB) |

Otras especificaciones técnicas relevantes:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 24.000 Hz, mono |
| Modelo de lenguaje fonético | PL-BERT, 12 capas |
| Predictor de duración | LSTM con proyección lineal (máx. 50 frames por fonema) |
| Embedding de hablante | Vector de estilo único de 256 dimensiones (128 acústicas, 128 prosódicas) |
| Tabla de tokens | 178 tokens (ampliada con fonemas faríngeos cabilios) |
| Vocoder | iSTFTNet (upsampling HiFi-GAN con cabeza inverse-STFT, FFT de 20 puntos, hop size 5) |
| Tamaño del repo | 2,3 GB |
| Pipeline en Hugging Face | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2: un front-end de conversión grafema-fonema que transforma la ortografía latina cabilia en representaciones IPA con reglas de asimilación contextual y espirantización; un modelo de lenguaje fonético PL-BERT de 12 capas que aporta contexto; un predictor de duración LSTM que calcula duraciones por fonema, contornos de F0 y energía condicionados por el vector de estilo del hablante; y un decodificador acústico iSTFTNet que genera la forma de onda a 24 kHz. Los módulos exclusivos de entrenamiento (discriminadores, pérdida WavLM y muestreadores de difusión) se eliminaron de los pesos exportados, lo que reduce el artefacto de inferencia a unos 327 MB.

El entrenamiento se realizó en dos etapas secuenciales. En la primera (pretraining acústico multihablante) se entrenaron conjuntamente el codificador de texto, el decodificador y el predictor de duración sobre los 20.953 clips de entrenamiento, con tamaño de lote 4 durante 6 épocas, para estabilizar la representación acústica. En la segunda (adaptación a hablante único) se ajustaron el modelo de lenguaje (`bert`, `predictor`) sobre 14.174 clips de la voz masculina `kab_male`, con tamaño de lote 4 durante 4 épocas (13.944 iteraciones), alcanzando una pérdida de validación final de 0,3475. Los datos provienen de la partición restaurada de Common Voice cabilio, normalizados en amplitud, recortados en silencios y filtrados contra clipping: 14.679 clips masculinos (~12,9 horas, media de 3,73 s) y 7.274 femeninos (~5,0 horas, media de 3,11 s).

## Capacidades

- Síntesis de voz en cabilio a partir de texto en ortografía latina, con salida de audio mono a 24 kHz.
- Reproducción de la fonología cabilia distintiva: geminación, espirantización, consonantes enfáticas y fricativas faríngeas.
- Conversión grafema-fonema verificada contra un inventario IPA de 42 símbolos, con reglas de asimilación contextual.
- Condicionamiento por vector de estilo de hablante (256 dimensiones), aunque el modelo se distribuye con una única voz masculina.
- Integración como etapa final de pipelines NLP cabilios: acepta la salida de transliteración (Juba-27M), restauración de mayúsculas (Belaid-31M) o estandarización ortográfica (Boulifa-48M).
- Inferencia ligera apta para CPU y dispositivos de borde gracias a sus 81,7 M de parámetros.
- No soporta clonación de voz, tool calling, agentes, visión ni otros idiomas distintos del cabilio.

## Casos de uso

- Lectores de pantalla y herramientas de accesibilidad para personas ciegas o con baja visión que consumen contenido en cabilio: el modelo convierte texto digitalizado en audio comprensible, y su licencia Apache-2.0 permite integrarlo en productos comerciales de accesibilidad sin restricciones.
- Aplicaciones educativas para la enseñanza del cabilio: permite generar materiales de escucha (ejercicios de dictado, pronunciación de vocabulario) a partir de listas de texto, con una voz nativa masculina coherente.
- Locución automatizada de contenido multimedia: artículos, noticias o publicaciones de blog en cabilio pueden convertirse en audio para podcasts o boletines, procesando el texto frase a frase dado que el modelo está entrenado con clips cortos.
- Etapa final de pipelines de procesamiento del lenguaje cabilio: encadenado con Juba-27M, Belaid-31M y Boulifa-48M, permite tomar texto sin normalizar (sin mayúsculas, con transliteración inconsistente) y producir audio correcto de extremo a extremo.
- Preservación y documentación lingüística: generación de corpus de audio sintético controlado para investigación fonética o para comparar realizaciones acústicas de fonemas enfáticos y faríngeos.
- Sistemas de anuncios y avisos en espacios públicos o transporte en regiones de habla cabilia: la inferencia en CPU y el tamaño reducido (327 MB) permiten desplegarlo en hardware modesto sin GPU dedicada.
- Pruebas de integración en asistentes de voz de código abierto para lenguas de bajos recursos: sirve como referencia ligera frente a modelos multilingües de mayor tamaño y licencias más restrictivas.

## Benchmarks y rendimiento

La model card incluye una comparación de referencia (Cycle-CER, distorsión acústica medida transcribiendo el audio sintético con agbalu/Fadhma-300M contra el texto de referencia), aunque el resultado de Matoub-82M figura como pendiente:

| Modelo | Arquitectura | Frecuencia | Licencia | Cycle-CER | CER control audio real | Delta |
|---|---|---|---|---|---|---|
| mms-tts-kab | VITS | 16 kHz | CC-BY-NC-4.0 | 11,89% | 8,33% | +3,56% |
| Matoub-82M | StyleTTS2 | 24 kHz | Apache-2.0 | Pendiente | No disponible | No disponible |

No se han publicado otros resultados de benchmarks (MOS, MCD, WER) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos exportados (~327 MB), más el overhead de activaciones y del vocoder; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las generaciones recientes (RTX 3060, RTX 4060, RTX 4090, GTX 1650, etc.) e incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: la model card documenta el uso con `transformers>=5` mediante `AutoModelForTextToWaveform` y `AutoTokenizer` con `trust_remote_code=True`, más `torch` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada; el autor posiciona el modelo para inferencia en CPU y borde, lo que sugiere tiempos compatibles con síntesis interactiva frase a frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Frecuencia | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Matoub-82M | 81,7 M | 24 kHz | Apache-2.0 | Cabilio | StyleTTS2; voz masculina única; Cycle-CER pendiente |
| mms-tts-kab (Meta) | No disponible | 16 kHz | CC-BY-NC-4.0 | Cabilio | VITS; Cycle-CER 11,89%; uso comercial restringido |
| Matoub-4B (mismo autor) | 4,2 B | No disponible | No disponible | Cabilio | Autorregresivo basado en codecs; clonación de voz y mayor fidelidad acústica; no apto para CPU/borde |
| hexgrad/Kokoro-82M | 82 M | 24 kHz | Apache-2.0 | Inglés (principalmente) | Modelo base; no soporta cabilio sin ajuste |

## Limitaciones y advertencias

- Ancho de banda del audio fuente: las grabaciones de Common Voice presentan un corte acústico físico en torno a 7,9 kHz por el hardware de smartphone y la compresión con pérdida; la salida por encima de ese techo son armónicos superiores silenciosos, no información real.
- Alcance prosódico limitado: el entrenamiento usa clips cortos de habla leída (media de 3,73 s), por lo que la prosodia de párrafos largos se sintetiza frase a frase y puede sonar entrecortada.
- Una sola voz: se distribuye únicamente con la voz masculina `kab_male`; no hay selección de hablante ni clonación.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del vocabulario fonético cubierto por el G2P, especialmente en préstamos y nombres propios.
- Sesgos derivados del corpus: la voz refleja las características demográficas y de grabación de los voluntarios de Common Voice, con posible infrarrepresentación de variantes dialectales del cabilio.
- Uso fuera de alcance prohibido por el autor: clonación de voz sin consentimiento y síntesis de lenguas distintas del cabilio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no concede garantías; conviene verificar las condiciones de los datos de Common Voice subyacentes si se redistribuye el modelo.
- Requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Matoub-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Sucesor basado en codecs: https://huggingface.co/agbalu/Matoub-4B
- Modelo de evaluación ASR: https://huggingface.co/agbalu/Fadhma-300M
- Transliteración: https://huggingface.co/agbalu/Juba-27M
- Restauración de mayúsculas: https://huggingface.co/agbalu/Belaid-31M
- Estandarización ortográfica: https://huggingface.co/agbalu/Boulifa-48M
- Baseline de Meta: `mms-tts-kab` (referenciado en la model card; URL no incluida en la información disponible)
- Common Voice (Mozilla): no incluido en la información disponible
