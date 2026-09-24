# prakhya15/hindi-conformer-ctc-finetuned

## Resumen

`hindi-conformer-ctc-finetuned` es un modelo de reconocimiento automático del habla (ASR) para hindi publicado por el usuario prakhya15 en Hugging Face. Se trata de un ajuste fino del checkpoint `stt_hi_conformer_ctc_medium` de NVIDIA NeMo, cuya arquitectura combina un encoder Conformer con un decodificador CTC no autorregresivo y ronda los 30 millones de parámetros. El resultado se distribuye como checkpoint nativo de NeMo (`.nemo`) bajo licencia CC-BY-4.0 y está pensado exclusivamente para transcribir audio en hindi.

El modelo aborda un caso concreto: la transcripción de habla conversacional e informal en hindi, un registro peor cubierto por los corpus de habla leída con los que se entrena habitualmente el modelo base. Para ello, el autor partió del checkpoint de NVIDIA entrenado sobre aproximadamente 1.900 horas del corpus ULCA Hindi y lo ajustó durante 20 épocas sobre un conjunto propio de 16.519 enunciados (33,3 horas) segmentado a partir de grabaciones conversacionales de AI4Bharat IndicVoices / IndicVoices-R, remezcladas sintéticamente en conversaciones multihablante con aumentación de velocidad, tono, reverberación y ruido.

Su relevancia práctica es acotada pero identificable: cubre el hueco de los modelos ASR ligeros y desplegables en hardware modesto (fue ajustado en una única GPU T4) para hindi conversacional, un idioma con menos recursos que el inglés. Conviene señalar dos limitaciones de partida: el repositorio no declara ninguna cifra de WER (el campo de validación quedó como marcador de posición sin rellenar) y acumula cero descargas en el momento de redactar esta ficha, por lo que no existe validación independiente de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + CTC (decodificador), no autorregresivo |
| Parámetros totales | ~30 M (heredados del checkpoint base `stt_hi_conformer_ctc_medium`, cifra del catálogo de NVIDIA NGC) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR: procesa segmentos de audio, no una ventana de tokens) |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; el ajuste fino se hizo en fp16) |
| Idiomas soportados | Hindi (`hi`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoint nativo de NeMo (`.nemo`); tamaño del repositorio 0,1 GB |
| Framework | NVIDIA NeMo (`nemo.collections.asr`, clase `EncDecCTCModelBPE`) |
| Decodificación | CTC; tokenización por subpalabras (BPE) |
| Datos de ajuste fino | `prakhya15/hindi-conformer-ctc-segments` — 16.519 enunciados / 33,3 h (train), 1.622 enunciados / 2,83 h (validación) |
| Tarea | `automatic-speech-recognition` |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base de NVIDIA NeMo: un encoder Conformer, que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales del espectrograma, seguido de un decodificador CTC con tokenización BPE. Al ser CTC, el modelo es no autorregresivo: emite las etiquetas en una sola pasada, sin bucle de decodificación token a token, lo que reduce la latencia frente a alternativas encoder-decoder con atención. El ajuste fino no modifica la topología, solo los pesos, y mantiene la cabecera de clasificación del modelo base.

El entrenamiento de ajuste fino se realizó sobre `prakhya15/hindi-conformer-ctc-segments`, un conjunto segmentado y remezclado sintéticamente a partir de grabaciones conversacionales reales de AI4Bharat IndicVoices / IndicVoices-R. La receta declarada es: 20 épocas, batch size 8 con acumulación de gradiente ×4 (efectivo 32), precisión mixta fp16, optimizador AdamW con tasa de aprendizaje 1e-4, scheduler de annealing coseno y 500 pasos de warmup, todo sobre una única GPU T4. Aproximadamente el 13 % de los segmentos de entrenamiento contienen habla solapada. No se documenta ninguna fase de RLHF, DPO ni decodificación especulativa: son técnicas propias de modelos de lenguaje y no aplican a este caso.

La innovación reseñable no está en el modelo en sí, sino en el pipeline de datos: la mezcla sintética de voces reales en conversaciones multihablante con aumentación de velocidad, tono, reverberación y ruido permite fabricar material conversacional etiquetado a partir de corpus de habla grabada, sin necesidad de grabar diálogos nuevos.

## Capacidades

- Transcripción de audio en hindi (caracteres devanagari con espacios) a partir de ficheros WAV, mediante `asr_model.transcribe([...])`.
- Reconocimiento de habla conversacional e informal, el registro dominante en los datos de ajuste.
- Procesamiento de audio con habla solapada parcial (el 13 % de los segmentos de entrenamiento presenta solapamiento).
- Robustez relativa ante variaciones de velocidad, tono, reverberación y ruido, introducidas como aumentación durante el ajuste.
- Inferencia en fp16 sobre GPU modesta, gracias al tamaño reducido del modelo.
- Modelo monolingüe: no se declara soporte de code-switching hindi-inglés ni de otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (*thinking mode*), visión ni audio generativo: la salida es únicamente texto transcrito.
- No se declaran capacidades de diarización (separación por hablante) ni de marcas de tiempo a nivel de palabra.

## Casos de uso

- **Transcripción de centros de llamadas en hindi:** el modelo está ajustado específicamente sobre conversaciones multihablante, el formato típico de una llamada de atención al cliente, por lo que encaja mejor que un ASR entrenado con habla leída. El texto resultante puede volcarse a un sistema de analítica.
- **Subtitulado de contenido audiovisual informal:** vídeos de creadores, entrevistas o pódcasts en hindi coloquial se pueden transcribir y convertir en subtítulos sin depender de servicios en la nube, dado que el modelo cabe en una GPU de gama media.
- **Análisis de conversaciones a escala:** transcripción previa a un pipeline de clasificación de temas, detección de intención o control de calidad, combinando este ASR con un modelo de lenguaje que procese el texto resultante.
- **Generación y etiquetado de corpus ASR:** uso como etiquetador automático para preanotar horas de audio en hindi, que después se revisan y se incorporan a un conjunto de entrenamiento mayor (pseudo-etiquetado).
- **Atención telefónica automatizada e IVR:** transcripción de la intervención del usuario en sistemas de respuesta interactiva de voz en hindi, como paso previo a la comprensión del lenguaje natural.
- **Accesibilidad en directo:** subtitulado de emisiones o sesiones en hindi donde se priorice el despliegue local y el coste bajo frente a la latencia mínima (no se publican datos de latencia en tiempo real).
- **Investigación en ASR de bajos recursos:** punto de partida para experimentos de ajuste fino con vocabularios de dominio, comparación de estrategias de aumentación o evaluación de robustez frente a habla solapada.

## Benchmarks y rendimiento

El repositorio declara un único resultado en su `model-index`, correspondiente a la tarea de reconocimiento automático del habla sobre el split de validación del conjunto `prakhya15/hindi-conformer-ctc-segments`. El valor del WER aparece como marcador de posición sin sustituir, por lo que no constituye una métrica publicada.

| Conjunto | Split | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Hindi Conversational Speech (segmented) | validation | WER | `REPLACE_WITH_YOUR_VAL_WER` (marcador de posición, no sustituido) | No |

No se han publicado resultados de benchmarks utilizables en la información disponible. La model card incluye la misma tabla de evaluación con el valor pendiente de rellenar y no se han encontrado cifras de WER, CER ni comparaciones con otros modelos en la búsqueda web realizada. Cualquier número que se cite sobre este modelo debe considerarse no verificado.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con ~30 M de parámetros, los pesos ocupan aproximadamente 120 MB en fp32 y 60 MB en fp16; sumando activaciones y el overhead del runtime de NeMo, la inferencia se mantiene holgadamente por debajo de 1-2 GB de VRAM. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- **GPU recomendadas:** cualquier GPU con 4 GB o más. El propio ajuste fino se completó en una única NVIDIA T4, lo que marca el mínimo práctico del modelo.
- **Cabe en GPU de consumo:** sí. Una GTX 1650, RTX 3050, RTX 3060 o superior es suficiente; también es viable la inferencia en CPU, aunque no se publican tasas de tiempo real.
- **Opciones de despliegue:** NVIDIA NeMo (restauración del checkpoint `.nemo`), NVIDIA Riva o Triton Inference Server para servir en producción, y exportación a formatos intermedios soportados por NeMo para optimización. vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas para modelos de lenguaje generativos, no para ASR con CTC.
- **Latencia y throughput:** no disponible. No se publican métricas de RTF (*real-time factor*), latencia ni transacciones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `prakhya15/hindi-conformer-ctc-finetuned` | ~30 M (heredados del base) | Conformer + CTC | Hindi | CC-BY-4.0 | Hugging Face, formato `.nemo` |
| `stt_hi_conformer_ctc_medium` (NVIDIA NeMo, modelo base) | ~30 M | Conformer + CTC | Hindi | No disponible en la información proporcionada | Catálogo de NVIDIA NGC |
| `ai4bharat/IndicConformer` | No disponible | Conformer | No disponible | No disponible | Hugging Face |

El modelo base de NVIDIA se entrenó sobre el corpus ULCA Hindi (~1.900 horas de habla) y transcribe en caracteres devanagari; el modelo de esta ficha parte de él y lo especializa en habla conversacional con 33,3 horas adicionales. No se dispone de cifras de WER comparables entre los tres modelos, ni de parámetros o licencia del `IndicConformer` de AI4Bharat, por lo que no es posible establecer una comparación cuantitativa. Otras alternativas habituales para ASR en hindi (por ejemplo, la familia Whisper de OpenAI, multilingüe y de mayor tamaño) no aparecen en la información proporcionada con datos verificables, de modo que no se incluyen cifras al respecto.

## Limitaciones y advertencias

- **WER no publicado:** el campo de evaluación quedó como `REPLACE_WITH_YOUR_VAL_WER`. No existe ninguna métrica verificada de calidad, ni propia ni de terceros.
- **Datos sintéticamente mezclados:** las conversaciones multihablante se construyeron remezclando sintéticamente habla real, con aumentación de velocidad, tono, reverberación y ruido. El rendimiento en audio de un solo hablante o en entornos ruidosos reales puede diferir del obtenido en validación.
- **Habla solapada:** cerca del 13 % de los segmentos de entrenamiento incluyen solapamiento; en audio con solapamiento intenso la robustez puede degradarse.
- **Volumen de ajuste fino limitado:** 33,3 horas frente a los corpus de preentrenamiento, muy superiores. Es previsible un rendimiento mejor en hindi conversacional e informal similar a la distribución de entrenamiento, y peor en habla leída o formal y en vocabulario de dominio no visto.
- **Monolingüe:** solo hindi. No hay soporte declarado de code-switching hindi-inglés, frecuente en el habla real, ni de otros idiomas indios.
- **Riesgo de alucinación:** como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en audio de baja calidad, con acentos no representados o con ruido de fondo, sin indicar incertidumbre.
- **Sesgos:** la distribución de entrenamiento procede de grabaciones conversacionales de un corpus concreto (IndicVoices / IndicVoices-R); los sesgos de acento, género, registro y variedad dialectal de ese corpus se trasladan al modelo. No se documenta ningún análisis de sesgo.
- **Licencia:** CC-BY-4.0 permite uso comercial, pero exige atribución. Debe verificarse además la licencia del checkpoint base de NVIDIA, que no queda detallada en la información disponible.
- **Madurez del repositorio:** cero descargas, dos *likes* y ausencia de métricas. No se recomienda su uso en producción sin una evaluación propia sobre datos representativos del dominio objetivo.
- **Diarización y marcas temporales:** no se declaran capacidades de separación por hablante ni de timestamps, lo que limita su uso directo en subtitulado profesional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prakhya15/hindi-conformer-ctc-finetuned
- Conjunto de datos de ajuste fino: https://huggingface.co/datasets/prakhya15/hindi-conformer-ctc-segments
- Modelo base en NVIDIA NGC (`stt_hi_conformer_ctc_medium`): https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/stt_hi_conformer_ctc_medium/1.6.0
- AI4Bharat IndicConformer: https://huggingface.co/ai4bharat/IndicConformer
- Catálogo de modelos de AI4Bharat: https://models.ai4bharat.org/
- AIKosh, catálogo de modelos de IndiaAI: https://aikosh.indiaai.gov.in/home/model-tryout/all
- Artículo original del Conformer, referenciado como [1] en la model card (Gulati et al., *Conformer: Convolution-augmented Transformer for Speech Recognition*): https://arxiv.org/abs/2005.08100
- Corpus de origen de los datos (AI4Bharat IndicVoices / IndicVoices-R): mencionado en la model card, sin enlace directo en la información disponible
