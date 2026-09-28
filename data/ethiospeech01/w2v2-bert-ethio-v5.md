# ethiospeech01/w2v2-bert-ethio-v5

## Resumen

w2v2-bert-ethio-v5 es un ajuste fino completo de `facebook/w2v-bert-2.0` para reconocimiento automático del habla (ASR) multilingüe en seis lenguas etíopes: amárico, tigriña, oromo, sidama, somalí y afar. Lo publica la organización `ethiospeech01` dentro del proyecto EthioSpeech y sustituye la cabeza de clasificación original por una cabeza CTC nueva a nivel de carácter sobre un vocabulario de 319 símbolos que cubre alfabeto latino, silabarios ge'ez, el delimitador de palabra `|` y seis tokens de condicionamiento de idioma `[LID:*]`.

El modelo tiene 606.004.351 parámetros (unos 606 M) y un repositorio de 2,4 GB en safetensors. Se apoya en el extractor de características congelado de w2v-bert-2.0 (16 kHz, 80 bins mel) y se entrenó con ajuste fino completo, no con LoRA. La relevancia actual está en su rendimiento en un dominio con muy pocos recursos: en el split de test heredado de EthioSpeech alcanza un WER macro de 27,50 %, frente al 32,2 % de `ethiospeech01/whisper-fullft-v3-ethiopian` en el mismo conjunto.

Frente a las alternativas evaluadas, mejora a Whisper FT en amárico, tigriña, somalí, sidama y afar, aunque pierde en oromo (32,5 % frente a 26,3 %). También supera a Whisper FT en transferencia zero-shot sobre el corpus Waxal (WER macro 39,67 % frente a 41,40 %). El modelo decodifica con CTC greedy puro, sin modelo de lenguaje ni puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (encoder transformer con front-end convolucional, preentrenado por Meta AI) más cabeza CTC lineal |
| Parametros totales | 606.004.351 (~606 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; el extractor de caracteristicas trabaja a 16 kHz y 80 bins mel) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | am (amarico), ti (tigrina), om (oromo), sid (sidama), so (somali), aa (afar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cargable con transformers; repositorio de 2,4 GB) |
| Vocabulario | 319 tokens (ids 2-310 caracteres; 311-316 tokens `[LID:*]`; 317 `<s>`; 318 `</s>`; 0 `[PAD]`/blank CTC; 1 `[UNK]`; 29 delimitador de palabra) |
| Frecuencia de muestreo | 16 kHz, 80 bins mel |
| Modelo base | facebook/w2v-bert-2.0 |
| Pipeline | automatic-speech-recognition |
| Compatibilidad de despliegue | endpoints_compatible |

## Arquitectura y entrenamiento

La base es Wav2Vec2-BERT, propuesta por el equipo de Seamless Communication de Meta AI y preentrenada sobre 4,5 millones de horas de audio sin etiquetar en más de 143 idiomas. Sobre ese encoder se injertó una cabeza `Wav2Vec2BertForCTC.lm_head` nueva, de nivel de carácter, con un vocabulario de 319 símbolos que mezcla letras latinas, silabarios ge'ez y el delimitador `|` (que decodifica como espacio). El extractor de características se mantuvo congelado en 16 kHz con 80 bins mel.

El entrenamiento fue un ajuste fino completo (no LoRA) con la receta v5 y su esquema de regularización. Cada secuencia de etiquetas se prefija con `[LID:<idioma>]|`, de modo que el condicionamiento de idioma forma parte del objetivo de entrenamiento; por eso el decodificador puede emitir ocasionalmente el token LID y hay que enmascararlo a blank antes del colapso CTC. La decodificación es CTC greedy argmax puro: sin modelo de lenguaje, sin post-procesado en cascada y con normalizador v1.0.0 (dígitos sin fusionar). La selección del mejor checkpoint se hizo por WER de validación, y el mejor registrado fue 30,72 en el paso 48.000, época 12.

## Capacidades

- Reconocimiento automático del habla multilingüe en seis lenguas etíopes: amárico, tigriña, oromo, sidama, somalí y afar.
- Salida a nivel de carácter con cobertura de silabarios ge'ez y alfabeto latino en un mismo vocabulario, incluyendo la convención de escritura mixta usada para amárico y tigriña.
- Condicionamiento explícito de idioma mediante tokens `[LID:*]` (ids 311-316), presentes en el vocabulario y en el formato de entrenamiento.
- Decodificación CTC greedy, sin dependencia de un modelo de lenguaje externo ni de post-procesado en cascada.
- Transferencia a corpus fuera de dominio: se reportan resultados zero-shot sobre el corpus Waxal.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incorpora modo de pensamiento, visión ni procesamiento de audio más allá de la transcripción a texto.
- No produce puntuación, mayúsculas normalizadas ni marcas de tiempo según la información disponible.

## Casos de uso

- Transcripción de archivos sonoros para medios etíopes: emisoras y productoras que trabajan en amárico, tigriña u oromo pueden pasar entrevistas y reportajes completos por el modelo para obtener borradores de transcripción, ya que el WER por debajo del 26 % en amárico y tigriña sobre el test in-domain reduce el trabajo de corrección manual.
- Subtitulado automático de vídeo en lenguas etíopes: el modelo genera texto carácter a carácter a partir de audio a 16 kHz, de modo que se integra en un pipeline de segmentación previa y posterior alineación para producir subtítulos en somalí, sidama o afar, idiomas donde los sistemas comerciales suelen no estar disponibles.
- Analítica de centros de llamadas: con un WER macro de 39,67 % en el corpus externo Waxal, permite indexar y buscar conversaciones de atención al cliente en varios idiomas etíopes para extraer motivos de contacto y patrones de queja, aceptando una tasa de error mayor que la de una transcripción humana.
- Archivado y búsqueda de patrimonio oral: bibliotecas y proyectos de documentación pueden transcribir grabaciones históricas y permitir búsqueda por texto sobre colecciones en afar o sidama, lenguas con muy pocos recursos y sin soporte en modelos ASR generalistas.
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia fuerte frente a MMS y Whisper en investigaciones sobre lenguas etíopes, ya que se publican cifras de WER y CER en dos conjuntos distintos (test heredado de EthioSpeech y Waxal) y con la misma normalización, lo que permite reproducir la comparación.
- Dictado y accesibilidad para hablantes de oromo o tigriña: el modelo puede alimentar interfaces de voz a texto en aplicaciones de accesibilidad, con la advertencia de que la salida no incluye puntuación y requiere una etapa posterior de formateo.
- Preanotación de corpus para reentrenamiento: al ser un ajuste fino completo sobre w2v-bert-2.0, sus hipótesis pueden usarse para preetiquetar audio no transcrito y reducir el coste de anotación humana en campañas de recogida de datos en lenguas etíopes.
- Despliegue en entornos con GPU modesta: con 606 M de parámetros, la inferencia en fp16 cabe en GPUs de consumo, lo que permite ejecutar la transcripción en estaciones de trabajo locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

Split de test heredado de EthioSpeech (en dominio, excluido del entrenamiento). WER en porcentaje, menor es mejor. El guion largo indica idioma no soportado por el modelo. Las filas de referencia proceden de la Tabla I del artículo del proyecto.

| Modelo | am | ti | so | sid | aa | om | Media |
|---|---|---|---|---|---|---|---|
| Whisper ZS | 122,1 | 124,6 | 92,3 | — | — | 105,6 | — |
| MMS | 54,3 | 67,9 | 45,7 | 39,0 | — | 54,1 | 52,2 |
| W2V2-BERT FT (este modelo) | 25,2 | 21,7 | 24,1 | 17,8 | 43,8 | 32,5 | 27,5 |
| Whisper FT | 34,5 | 30,1 | 27,9 | 18,4 | 55,9 | 26,3 | 32,2 |
| Whisper LoRA | 44,3 | 41,9 | 35,6 | 21,6 | 54,3 | 31,5 | 38,2 |

Comparación directa frente a Whisper FT en el mismo split: mejor en amárico (9,33 pp), tigriña (8,44 pp), somalí (3,75 pp), sidama (0,64 pp) y afar (12,12 pp); peor en oromo (6,18 pp, 32,5 frente a 26,3). Macro: 27,50 frente a 32,2, es decir −4,72 pp.

CER de este modelo en el mismo conjunto (no medible para las filas de referencia): amárico 6,89; tigriña 6,99; somalí 7,74; sidama 3,86; afar 16,78; oromo 7,33; macro 8,27.

Split `waxal/test` (zero-shot, datos nunca vistos en entrenamiento, mismo reparto que `ethiospeech01/whisper-fullft-v3-ethiopian`):

| Idioma | n | WER este modelo | WER whisper-fullft-v3 | Δ WER (pp) | CER este modelo | CER whisper-fullft-v3 | Δ CER (pp) |
|---|---|---|---|---|---|---|---|
| amárico | 3420 | 35,69 | 36,98 | -1,29 | 13,24 | 14,33 | -1,09 |
| tigriña | 5034 | 49,23 | 52,83 | -3,60 | 20,32 | 25,67 | -5,35 |
| oromo | 3782 | 36,50 | 38,67 | -2,17 | 8,34 | 15,87 | -7,53 |
| sidama | 3561 | 37,28 | 37,12 | +0,16 | 8,52 | 8,58 | -0,06 |
| macro | — | 39,67 | 41,40 | -1,73 | 12,60 | 16,11 | -3,51 |

Desarrollo durante el entrenamiento: mejor checkpoint con WER de 30,72 en el paso 48.000, época 12 (marcado como `"is_best": true`).

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 2,42 GB con pesos en fp32, 1,21 GB en fp16 o bf16 y 0,61 GB en int8. Hay que sumar el coste de activaciones y del front-end convolucional, que crece con la duración del audio procesado.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar inferencia en fp16 sobre fragmentos de audio cortos. Son suficientes una GTX 1650 de 4 GB, una RTX 3060 de 12 GB o una RTX 4090.
- GPU profesionales: A100, H100 y similares no aportan ventaja por memoria, pero sí en throughput si se procesan lotes grandes. No se publican cifras de escalado.
- CPU: la inferencia es viable, especialmente con cuantización dinámica int8, pero la latencia no está documentada.
- Opciones de despliegue: transformers con PyTorch (es el camino documentado en la model card, mediante `SeamlessM4TFeatureExtractor`, `Wav2Vec2BertForCTC` y `Wav2Vec2CTCTokenizer`). El repositorio está marcado como `endpoints_compatible`, por lo que puede servirse en Hugging Face Inference Endpoints. No hay soporte documentado en vLLM, TGI, llama.cpp u Ollama para esta arquitectura y formato; tampoco se publican pesos GGUF.
- El repositorio incluye `inference_example.py`, ejecutable con `python inference_example.py ruta/al/audio.wav`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas etiopes | WER medio EthioSpeech | WER medio Waxal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| W2V2-BERT FT (este modelo) | 606 M | am, ti, om, sid, so, aa | 27,5 | 39,67 | no disponible | safetensors en Hugging Face |
| whisper-fullft-v3-ethiopian | no disponible | am, ti, om, sid, so, aa | 32,2 | 41,40 | no disponible | Hugging Face |
| whisper-lora-v3-ethiopian | no disponible | no disponible | 38,2 (fila Whisper LoRA) | no disponible | no disponible | PEFT/LoRA en Hugging Face |
| MMS (Meta) | no disponible | am, ti, so, sid, om (sin aa) | 52,2 | no disponible | no disponible | Hugging Face |
| Whisper ZS | no disponible | am, ti, so, om (sin sid ni aa) | sin media publicada | no disponible | no disponible | Hugging Face |

En rendimiento, este modelo lidera el WER macro tanto en el conjunto en dominio como en la transferencia zero-shot a Waxal entre las alternativas con cifras publicadas. MMS y Whisper ZS quedan muy por detrás y no cubren afar (aa) ni, en el caso de Whisper ZS, sidama. La principal desventaja relativa es el oromo, donde Whisper FT gana por 6,18 pp.

## Limitaciones y advertencias

- Licencia no declarada: la model card y los metadatos no especifican licencia, por lo que el uso comercial queda sin cobertura explícita hasta que el autor la aclare. Conviene revisar además la licencia del modelo base `facebook/w2v-bert-2.0`, ya que condiciona los trabajos derivados.
- Discrepancia de identificador: el ejemplo de código de la model card usa `MODEL_ID = "anshulsc/w2v-bert-ethio-v5"`, mientras que el repositorio publicado es `ethiospeech01/w2v2-bert-ethio-v5`. Hay que ajustar el identificador para que la carga funcione.
- Fuga de tokens LID en la decodificación: la propia model card advierte que la cabeza tiende a repetir el prefijo `[LID:*]`. Es obligatorio enmascarar los ids 311-316 a blank antes del colapso CTC, tal como hace el fragmento de ejemplo; si no se hace, la transcripción incluirá ruido.
- Sin puntuación ni normalización de mayúsculas: la salida es texto plano a nivel de carácter; cualquier uso editorial requiere un post-procesado adicional.
- Sin marcas de tiempo: no se documenta alineación temporal, lo que complica el subtitulado directo sin una etapa extra de segmentación o alineación forzada.
- Riesgo de alucinación en CTC: aunque menor que en modelos autorregresivos, una cabeza CTC puede producir repeticiones o caracteres espurios en audio con ruido, música o solapamiento de hablantes; no se publican métricas en condiciones adversas.
- Sensibilidad al dominio: el WER en dominio (27,5 % de media) es notablemente mejor que el zero-shot sobre Waxal (39,67 %), lo que indica degradación fuera del corpus de entrenamiento.
- Oromo como punto débil: es el único idioma donde la alternativa Whisper FT supera a este modelo, con una diferencia de 6,18 pp.
- Afar con alta tasa de error: WER de 43,8 % en dominio y CER de 16,78 %, el peor de los seis idiomas; su uso en producción exigiría revisión humana.
- Convención de escritura mixta: amárico y tigriña se normalizaron a una convención que combina ge'ez y latín, de modo que las hipótesis siguen ese formato y pueden no coincidir con la ortografía esperada por otros sistemas.
- Idiomas sin cobertura: el modelo solo cubre seis lenguas etíopes; no soporta otras variedades ni transliteración automática.
- Sesgos no evaluados: no se publica ningún análisis de sesgo por acento, género, edad ni dialecto dentro de cada idioma.
- Trazabilidad limitada: no se detallan la composición exacta del dataset de entrenamiento, el número de horas por idioma ni el número total de tokens vistos.
- Repositorio sin tracción: cero descargas y cero «likes» en el momento de la consulta, lo que reduce la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethiospeech01/w2v2-bert-ethio-v5
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Baseline de comparación principal: https://huggingface.co/ethiospeech01/whisper-fullft-v3-ethiopian
- Baseline LoRA de comparación: https://huggingface.co/ethiospeech01/whisper-lora-v3-ethiopian
- Documentación de Wav2Vec2-BERT en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/wav2vec2-bert.md
- Artículo de Seamless Communication (Meta AI), origen de la arquitectura w2v-BERT: no disponible como enlace directo en la información proporcionada
- Proyecto EthiopicAI: https://ethiopic.ai/
