# juice500/wavlm-24-efficiency-1_256-phonemodel

## Resumen

`wavlm-24-efficiency-1_256-phonemodel` es un modelo de segmentación y reconocimiento fonético a nivel de teléfono construido sobre el codificador autoconsupervisado `microsoft/wavlm-large` (capa 24, 16 kHz). Lo publica el usuario `juice500` como parte del proyecto SPAM (S3M-based Phonological Activation Mapping), presentado en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). El modelo no reentrena el codificador: lo congela y aprende una proyección hacia un espacio interpretable de 43 activaciones fonológicas (sonoridad, nasalidad, estridencia, silencio, etc.).

La relevancia del modelo está en dos frentes. Por un lado, convierte representaciones opacas de un S3M en un vector de rasgos fonológicos con semántica clara, lo que facilita la inspección y el diagnóstico. Por otro, esta variante concreta es un experimento de eficiencia muestral: se ajusta únicamente con 1/256 de las emisiones de entrenamiento de TIMIT (Figura 3 del paper), lo que sirve para medir cuánto rinde el enfoque con datos escasos.

El modelo está pensado para inglés (`language: en`), se distribuye como adaptador sobre WavLM-large, con licencia MIT, y se consume a través de la librería `phonespam`. El repositorio en Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0.0 GB, coherente con que solo se publican los pesos del adaptador y no el codificador completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre codificador transformer autoconsupervisado WavLM-large (capa 24); cabezas de segmentación y reconocimiento sobre un mapa de 43 activaciones fonológicas |
| Parametros totales | no disponible (el repo contiene solo el adaptador; no se especifica el recuento de parámetros del adaptador ni del codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; no se declara ventana máxima en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en tiempo de ejecución es CC BY-SA 3.0, con licencia separada) |
| Formato de pesos | no disponible (consumido mediante `phonespam`; el repo no declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large`, un transformer autoconsupervisado para habla, y congela sus features. Sobre la representación de la capa 24 se aprende un mapeo SPAM que proyecta cada frame a un vector de 43 activaciones fonológicas continuas en [0, 1], con nombres de rasgo accesibles vía `spam.featnames` (por ejemplo `"silence+"`, `"syl+"`, `"son+"`). A partir de ese mapa, dos cabezas resuelven la segmentación (fronteras entre teléfonos) y el reconocimiento (etiqueta fonética de cada segmento). El pipeline completo se expone en el método `transcribe`, que devuelve tuplas `Segment(start, end, label)` contiguas con tiempos en segundos.

El entrenamiento se realiza sobre TIMIT (`timit-asr/timit_asr`). Esta variante es una ablación de eficiencia muestral: se ajusta con 1/256 de las emisiones de entrenamiento de TIMIT, correspondiente a la Figura 3 del paper. No se documentan en la información disponible el número de tokens de audio, la composición exacta del dataset más allá de TIMIT, ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado fonético supervisado). La innovación técnica destacable es precisamente el espacio intermedio interpretable: en lugar de predecir directamente fonemas, el modelo aprende primero rasgos fonológicos y deriva de ellos la segmentación y el reconocimiento.

## Capacidades

- Segmentación fonética: detecta fronteras entre teléfonos en audio de habla continua y devuelve intervalos temporales contiguos.
- Reconocimiento fonético: asigna una etiqueta de teléfono a cada segmento detectado.
- Representación fonológica interpretable: expone un vector de 43 activaciones por frame (`model.spam(...)`) con rasgos como sonoridad, nasalidad, estridencia o silencio.
- Restricción de vocabulario por inventario: `vocab_for_language("deu")` permite limitar el reconocimiento al inventario PHOIBLE de un idioma, aunque el modelo está entrenado y etiquetado para inglés.
- Inferencia en CPU o GPU (`device="cuda"`).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Investigación fonética computacional: extraer alineamientos a nivel de teléfono de un corpus de habla para estudiar fenómenos de coarticulación o reducción vocálica, usando `transcribe` para obtener los intervalos y `spam` para inspeccionar los rasgos activados en cada frame.
- Anotación asistida de corpus: preetiquetar automáticamente audio inglés con fronteras y etiquetas fonéticas para que un annotator humano solo revise, reduciendo el coste frente a la anotación manual desde cero.
- Análisis de pronunciación y fonología clínica: comparar la secuencia de teléfonos detectada con la esperada en un hablante para localizar sustituciones u omisiones sistemáticas, apoyándose en las activaciones de rasgos para explicar el error.
- Docencia de fonética: visualizar el mapa SPAM de 43 dimensiones sobre una emisión para mostrar a estudiantes qué rasgos se activan en cada tramo del audio.
- Evaluación de eficiencia muestral de S3M: usar esta variante (1/256 de TIMIT) como referencia en estudios que comparen cuánto dato necesita un adaptador fonológico para alcanzar un rendimiento dado frente a variantes entrenadas con más datos.
- Prototipado de sistemas de búsqueda por unidades subléxicas: indexar audio por secuencias de teléfonos para recuperación de fragmentos o análisis de similitud fonética, aprovechando la salida estructurada por segmentos.
- Experimentos multilingües exploratorios: aunque el modelo es de inglés, `vocab_for_language` permite probar el reconocimiento restringido a inventarios PHOIBLE de otros idiomas, con la cautela de que el adaptador no fue entrenado para ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo publica solo el adaptador (tamaño de repo 0.0 GB); el coste dominante es ejecutar WavLM-large congelado, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. La model card solo menciona `device="cuda"` como opción.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained(...)`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no encajan con una tarea de etiquetado fonético sobre un codificador de habla.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/wavlm-24-efficiency-1_256-phonemodel` | WavLM-large, capa 24 | no disponible | en | MIT | Hugging Face, vía `phonespam` |
| `microsoft/wavlm-large` | WavLM-large (codificador completo) | no disponible | en (autoconsupervisado) | no disponible en esta ficha | Hugging Face |
| Otras variantes del proyecto SPAM | WavLM-large, capa 24 | no disponible | en | MIT | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada, por lo que la comparativa se limita a base, idioma y licencia.

## Limitaciones y advertencias

- Entrenado y etiquetado para inglés; el uso con otros inventarios vía `vocab_for_language` es exploratorio y no está validado.
- Ajustado con solo 1/256 de las emisiones de TIMIT: es una ablación de eficiencia muestral, no la variante de máximo rendimiento del proyecto. No debe tomarse como referencia de calidad final.
- TIMIT es un corpus pequeño, de dominio acotado y con condiciones de grabación controladas; el comportamiento en audio real (ruido, micrófonos distintos, habla espontánea) no está documentado.
- Riesgo de errores en fronteras y etiquetas en habla rápida, solapada o con ruido; no se publican métricas de error en la información disponible.
- Sesgos demográficos y de acento: no se documenta la composición de hablantes ni la cobertura de acentos, por lo que no puede descartarse un sesgo hacia las variedades presentes en TIMIT.
- La licencia MIT cubre el modelo, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que es CC BY-SA 3.0 y tiene licencia separada; conviene revisar las obligaciones de atribución si se distribuye un producto que lo incluya.
- El repositorio tiene 0 descargas y 0 likes, y la model card no documenta formato de pesos ni requisitos de hardware: la validación en producción corre por cuenta de quien lo adopte.
- No se declaran capacidades de tool calling, agentes ni generación de texto; no debe emplearse como modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_256-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
