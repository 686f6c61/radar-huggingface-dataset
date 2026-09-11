# Pransfrance/voxscore-models

## Resumen

`Pransfrance/voxscore-models` no es un modelo entrenado, sino un espejo (mirror) con revisiones fijadas de los cinco modelos que consume **voxscore**, un pipeline autoalojado de puntuación de respuestas orales a preguntas abiertas. El repositorio agrupa pesos de transcripción, alineamiento forzado a nivel de palabra, embeddings de frase, detección de entailment y corrección gramatical, todo ello redistribuido bajo licencias permisivas (Apache-2.0 y MIT). Su tamaño total es de 6,4 GB.

El problema que resuelve es de reproducibilidad y de operación en redes restringidas: en lugar de descargar cinco repositorios distintos desde el Hub, que pueden cambiar de revisión o desaparecer, el autor publica una instantánea fija con un `manifest.json` que registra repositorio de origen, revisión y licencia de cada componente. Esto permite ejecutar una misma tanda de evaluación con resultados idénticos y trasladar un único directorio a una máquina sin acceso a Internet.

Es relevante porque cubre un nicho poco servido: la evaluación automática de producción oral (exámenes de idiomas, certificaciones, entrevistas) con componentes abiertos y auditables. No obstante, el repositorio no incluye ningún modelo original ni resultados de benchmarks propios, y su autor declara explícitamente que todo el crédito corresponde a los autores originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto de cinco modelos independientes: encoder-decoder transformer (ASR y GEC), encoder transformer (embeddings y NLI) y encoder CTC (alineamiento) |
| Parámetros totales | No disponible como cifra agregada; el repositorio ocupa 6,4 GB de pesos |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; depende de cada componente (el componente ASR opera con ventanas de audio) |
| Tipos de cuantización | No disponible; se distribuyen pesos sin cuantizar (safetensors), con duplicados `.bin` / `.h5` omitidos cuando existen safetensors |
| Idiomas soportados | No disponible en la ficha; el componente de transcripción realiza identificación de idioma por ventana |
| Licencia | Apache-2.0 para el repositorio; los componentes incluyen Apache-2.0 (transcripción, alineamiento, GEC) y MIT (embeddings, NLI) |
| Formato de pesos | safetensors (principal), con `.bin` / `.h5` omitidos cuando hay safetensors |
| Tamaño del repositorio | 6,4 GB |
| Pipeline declarado | No disponible |
| Revisiones | Fijadas por componente (`06f233fe06e7`, `22aad52d435e`, `5617a9f61b02`, `6f5cf0a2b59c`, `779c0250987a`) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una redistribución de pesos. Los cinco componentes y su función declarada en la model card son los siguientes: `openai/whisper-large-v3` (3,09 GB, Apache-2.0) para transcripción e identificación de idioma por ventana; `facebook/wav2vec2-base-960h` (0,38 GB, Apache-2.0) para alineamiento forzado CTC y obtención de marcas temporales a nivel de palabra; `BAAI/bge-m3` (2,29 GB, MIT) para embeddings de frase orientados a relevancia y repetición; `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` (0,38 GB, MIT) para cobertura por entailment y detección de postura; y `Unbabel/gec-t5_small` (0,24 GB, Apache-2.0) para corrección gramatical, cuyos cambios se diferencian con ERRANT para tipificar los errores.

Por tanto, no hay datos de entrenamiento, número de tokens, composición de dataset ni fases de RLHF/DPO asociadas a este repositorio. Cualquier innovación técnica procede de los modelos originales, no del espejo. La innovación propia del repositorio es de ingeniería de distribución: fijado de revisiones, `manifest.json` legible por máquina con origen, revisión y licencia de cada entrada, y filtrado por patrón (`allow_patterns`) para descargar un único componente sin arrastrar los 6,4 GB completos.

## Capacidades

- Transcripción de audio a texto con identificación de idioma por ventana, mediante `whisper-large-v3`.
- Alineamiento forzado CTC para obtener marcas temporales a nivel de palabra, mediante `wav2vec2-base-960h`.
- Cálculo de embeddings de frase para medir relevancia de la respuesta respecto a la pregunta y detectar repetición, mediante `bge-m3`.
- Cobertura de contenido por entailment y detección de postura (a favor, en contra, neutral) mediante el clasificador NLI entrenado con MNLI, FEVER y ANLI.
- Corrección gramatical automática y tipificación de errores con ERRANT, mediante `gec-t5_small`.
- Reconstrucción reproducible de un pipeline completo de puntuación de respuestas orales abiertas.
- Despliegue en máquinas con red restringida o sin acceso al Hub tras una única descarga.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento extendido. `voxscore-models` es un conjunto de componentes de inferencia, no un asistente conversacional.

## Casos de uso

- Evaluación automática de exámenes orales: el pipeline transcribe la respuesta con `whisper-large-v3`, alinea palabras con `wav2vec2-base-960h` y calcula relevancia y cobertura con `bge-m3` y el clasificador de entailment, generando una nota por criterio (contenido, coherencia, gramática) sin intervención humana.
- Certificaciones de idiomas con feedback formativo: la corrección gramatical con `gec-t5_small` más el diffeado con ERRANT permite devolver al candidato errores tipificados (concordancia, tiempo verbal, preposición) en lugar de una puntuación opaca.
- Investigación cualitativa con entrevistas: transcripción por lotes con marcas temporales a nivel de palabra, útil para segmentar hablante por turno, medir pausas y localizar citas textuales con precisión de palabra.
- Detección de respuestas memorizadas o evasivas: los embeddings de `bge-m3` permiten comparar la respuesta con la pregunta y con un banco de respuestas previas para detectar repetición literal o baja relevancia.
- Despliegue en entornos air-gapped o de datos sensibles: al ser un único directorio con revisiones fijas, se puede mover a un servidor sin salida a Internet, requisito habitual en evaluación educativa con datos de menores o en administración pública.
- Auditoría y reproducibilidad de pipelines: fijar revisiones y registrar el `manifest.json` permite reproducir exactamente la misma tanda de puntuación meses después, algo que no ocurre si se descargan los cinco repositorios sin fijar revisión.
- Construcción de un servicio de scoring autoalojado: usar `VOXSCORE_MODEL_DIR` apuntando a la ruta local para levantar el pipeline en un servidor propio con GPU consumer, evitando APIs de terceros y sus costes por minuto de audio.
- Extracción de métricas de fluidez: con las marcas temporales por palabra se pueden calcular velocidad de habla, duración de pausas y tasa de reparaciones, señales habituales en rúbricas de expresión oral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, precisión de alineamiento, correlación con evaluadores humanos ni latencias. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada: los 6,4 GB de pesos requieren en torno a 8-10 GB de VRAM para cargar los cinco componentes simultáneamente y ejecutar inferencia con margen para activaciones. Cargar los componentes de forma secuencial reduce el pico a aproximadamente 4-6 GB.
- `whisper-large-v3` es el componente más exigente: 3,09 GB de pesos, pero con decodificación por haces y ventanas de audio el consumo real de memoria es notablemente superior al tamaño del fichero.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para ejecutar todo el pipeline en paralelo; A100 o H100 si se procesan lotes grandes de audio en producción.
- Cabe en GPU consumer: sí, en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080) ejecutando los componentes de forma secuencial. En tarjetas de 8 GB conviene cargar y liberar componentes por etapas.
- Opciones de despliegue: Transformers para cualquiera de los componentes; CTranslate2 o faster-whisper para la etapa de transcripción; WhisperX o el pipeline de alineamiento CTC de `wav2vec2` para las marcas temporales; sentence-transformers o TGI/vLLM en modo embeddings para `bge-m3`; pipeline de clasificación de texto para el modelo NLI; pipeline de traducción/secuencia a secuencia para `gec-t5_small`.
- No hay pesos GGUF en el repositorio, por lo que Ollama y llama.cpp no son vías de despliegue directas para estos componentes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Licencia | Diferencias principales |
|---|---|---|---|
| Descargar los cinco repositorios originales por separado | Mismos pesos, sin empaquetar | Apache-2.0 y MIT según componente | Es la vía recomendada por el propio autor si hay acceso al Hub; no garantiza revisiones fijas ni permite una descarga única, y una retirada upstream rompe la reproducibilidad |
| APIs comerciales de evaluación oral (ASR más scoring gestionado) | Servicio propietario en la nube | Propietaria | Eliminan la gestión de GPU, pero envían audio a terceros, tienen coste por uso y no permiten auditar el modelo que asigna la nota ni tipificar errores con ERRANT |
| Pipelines internos construidos sobre Whisper más un clasificador propio | Ensamblaje a medida | Variable | Ofrecen control total y posibles ajustes específicos del dominio, pero requieren el trabajo de integración, fijado de revisiones y empaquetado que este repositorio ya aporta |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene trabajo original: es una redistribución. Cualquier fallo de precisión es atribuible a los modelos upstream, no a este paquete.
- Licencias mixtas: aunque la etiqueta del repositorio indica `apache-2.0`, dos componentes (`BAAI/bge-m3` y `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`) son MIT. La redistribución exige atribución a los autores originales y el cumplimiento de la licencia de cada repositorio de origen, no de la del espejo.
- Sin benchmarks publicados: no hay evidencia en la ficha sobre WER de transcripción, calidad de la corrección gramatical ni correlación de las puntuaciones con evaluadores humanos en respuestas orales abiertas.
- Los componentes NLI y GEC no están ajustados específicamente para evaluación oral: el clasificador de entailment procede de MNLI/FEVER/ANLI y la corrección gramatical de un T5 pequeño, lo que puede producir errores sistemáticos en dominios alejados de sus datos de entrenamiento.
- Riesgo de alucinación en la transcripción: los modelos basados en Whisper pueden generar texto plausible en segmentos con silencio, ruido o solapamiento de voces. Conviene validar con las marcas temporales y con detección de actividad de voz.
- La detección de idioma por ventana implica que, en audio con cambio de idioma o acento marcado, la transcripción puede mezclar idiomas dentro de una misma respuesta.
- Idiomas soportados: no disponibles en la información proporcionada, más allá de la identificación de idioma del componente de transcripción.
- Dependencia de revisiones fijadas: es una ventaja para reproducibilidad, pero también significa que el espejo no incorpora mejoras ni correcciones de seguridad publicadas después en los repositorios originales.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes INT8/INT4 listas para usar, lo que limita el despliegue en hardware muy restringido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento continuado.
- Aviso de producción: para uso en evaluación con consecuencias reales (certificaciones, selección de personal) es imprescindible calibrar los umbrales de las puntuaciones contra anotaciones humanas y documentar la versión exacta del modelo empleada en cada decisión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Pransfrance/voxscore-models
- `openai/whisper-large-v3`: https://huggingface.co/openai/whisper-large-v3
- `facebook/wav2vec2-base-960h`: https://huggingface.co/facebook/wav2vec2-base-960h
- `BAAI/bge-m3`: https://huggingface.co/BAAI/bge-m3
- `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`: https://huggingface.co/MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli
- `Unbabel/gec-t5_small`: https://huggingface.co/Unbabel/gec-t5_small

Nota: la búsqueda web realizada no devolvió resultados técnicos utilizables (únicamente páginas de inicio del motor de búsqueda), por lo que no se han podido añadir papers, blogs o demos adicionales a esta lista.
