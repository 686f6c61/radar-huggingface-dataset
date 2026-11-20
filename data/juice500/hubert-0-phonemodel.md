# juice500/hubert-0-phonemodel

## Resumen

`hubert-0-phonemodel` es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de `facebook/hubert-large-ll60k` (HuBERT-large), el modelo auto-supervisado de reconocimiento de voz de Meta AI. Lo desarrolla el autor `juice500` (Shikhar Bharadwaj y colaboradores, según la citación del paper) y se publica como parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" presentado en el SLT 2026.

El modelo resuelve un problema clásico en fonética computacional: obtener los límites temporales de cada fonema en una señal de audio y etiquetarlo, sin depender de un reconocedor de voz completo. La innovación es SPAM (S3M-based Phonological Activation Mapping), una capa que proyecta cada frame del encoder a un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridentidad, etc.), de las que dos cabezas leen la segmentación y la etiqueta.

Este checkpoint concreto es un punto de la rejilla encoder x capa del paper: usa la capa 0 de HuBERT-large, a 16 kHz. El propio autor indica que no es el mejor modelo de la familia y remite a `juice500/wavlm-24-phonemodel` para el rendimiento óptimo. Está pensado para investigación en fonética y para pipelines que necesiten alineación fonética interpretable, no para transcripción de voz general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM (mapeo de activaciones fonológicas) sobre encoder congelado HuBERT-large |
| Parámetros totales | no disponible (el adaptador es de tamaño reducido; el encoder base HuBERT-large ronda los 300 M, dato no confirmado en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames a 16 kHz; ventana concreta no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | `en` (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otros idiomas vía `vocab_for_language` |
| Licencia | MIT (el código y el modelo); PHOIBLE 2.0 se distribuye aparte bajo CC BY-SA 3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; carga vía `phonespam` con `from_pretrained`) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado de cero, sino un adaptador ligero montado sobre un encoder auto-supervisado congelado. La señal de audio se procesa a 16 kHz con `facebook/hubert-large-ll60k`; de la salida del encoder (en este checkpoint, la capa 0) se extrae una secuencia de frames que SPAM proyecta a un vector de 43 activaciones fonológicas en el rango [0, 1]. Sobre esa representación interpretable operan dos cabezas: una de segmentación (dónde empieza y acaba cada fonema) y otra de reconocimiento (qué fonema es).

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr` (TIMIT), el corpus de referencia para fonética del inglés con anotaciones a nivel de fonema. La información disponible no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado fonético supervisado). La innovación técnica central es la propia representación SPAM: convierte la salida opaca del encoder en un espacio de rasgos fonológicos legibles, lo que permite inspeccionar qué activa el modelo y restringir el vocabulario de salida a inventarios fonológicos de idiomas concretos.

## Capacidades

- Segmentación fonética: devuelve límites temporales (`start`, `end`) de cada segmento en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con su símbolo fonético.
- Representación fonológica interpretable: expone un tensor de `(frames, 43)` activaciones en [0, 1] con nombres de rasgo (`silence+`, `syl+`, `son+`, etc.).
- Restricción de vocabulario por idioma: `vocab_for_language` permite limitar la salida al inventario PHOIBLE de una lengua (por ejemplo `deu`).
- Procesamiento por lotes de ficheros de audio mediante la función `transcribe`.
- Ejecución en CPU o GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking: es un modelo discriminativo de etiquetado fonético.

## Casos de uso

- Investigación fonética y fonológica: obtener alineaciones a nivel de fonema sobre corpus de habla para análisis de duración, coarticulación o variación alofónica, usando los rasgos SPAM como variable intermedia interpretable.
- Anotación asistida de corpus: pre-etiquetar audio con segmentos fonéticos para que un lingüista revise y corrija, reduciendo el coste frente a la anotación manual desde cero.
- Análisis de pronunciación en aprendizaje de lenguas: comparar la secuencia de fonemas producida por un estudiante con la esperada y detectar sustituciones u omisiones concretas.
- Investigación en inteligencia artificial del habla: usar el checkpoint como punto de control en la rejilla encoder x capa para estudiar qué capas de HuBERT codifican mejor la información fonética.
- Sistemas de búsqueda por fonética: indexar audio por su transcripción fonética para búsqueda de palabras o secuencias en archivos de voz.
- Evaluación de modelos auto-supervisados: medir la calidad de las representaciones de un S3M concreto frente a otros (WavLM, HuBERT en otras capas) usando la misma sonda SPAM.
- Análisis de habla patológica o acento: cuantificar desviaciones fonéticas respecto a una referencia en estudios clínicos o de dialectología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (arXiv:2607.09020) para los resultados completos y advierte de que este checkpoint no es el mejor de la familia; para el mejor modelo, indica `juice500/wavlm-24-phonemodel`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador sobre HuBERT-large congelado, el consumo es el del encoder base (del orden de cientos de MB en fp32, sin cifra confirmada en la información proporcionada).
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo admite ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del encoder base, aunque no se confirma en la información disponible.
- Opciones de despliegue: paquete `phonespam` (instalación vía `pip install phonespam`) con `PhoneModel.from_pretrained`; demo pública en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/hubert-0-phonemodel` | HuBERT-large | 0 | Segmentación y reconocimiento fonético | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | WavLM | 24 | Segmentación y reconocimiento fonético (mejor modelo de la familia según el autor) | no disponible | Hugging Face |
| `facebook/hubert-large-ll60k` | — | — | Encoder auto-supervisado de habla (base, no etiqueta fonemas directamente) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint es un punto concreto de la rejilla encoder x capa y no el mejor de la familia; el autor recomienda `wavlm-24-phonemodel` para uso principal.
- Entrenado sobre TIMIT, un corpus de inglés; el soporte de otros idiomas depende de restringir el vocabulario con PHOIBLE y no está validado en la información disponible.
- El reconocimiento fonético puede confundir fonemas acústicamente próximos y producir sustituciones; conviene revisar en producción.
- La licencia MIT cubre el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 (CC BY-SA 3.0), con obligaciones de atribución y compartición bajo la misma licencia.
- Repo de 0.0 GB y sin descargas ni likes en el momento de la consulta: ecosistema mínimo, poca validación comunitaria.
- No apto para transcripción de voz a texto general ni para tareas generativas; su salida es una secuencia de fonemas, no palabras.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo discriminativo, el riesgo principal es el error de etiquetado, no la generación libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-0-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
