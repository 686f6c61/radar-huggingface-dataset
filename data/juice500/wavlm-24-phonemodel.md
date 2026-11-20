# juice500/wavlm-24-phonemodel

## Resumen

wavlm-24-phonemodel es un modelo de segmentación y reconocimiento fonético a nivel de teléfono (phone segmentation y phone recognition) desarrollado por el autor juice500 (Shikhar Bharadwaj y colaboradores según la cita del paper). Se construye sobre el encoder auto-supervisado `microsoft/wavlm-large` congelado, concretamente sobre su capa 24, y añade un mecanismo denominado SPAM (S3M-based Phonological Activation Mapping) que transforma cada frame del encoder en un vector de 43 activaciones de rasgos fonológicos interpretables (voicing, nasalidad, estridentia, entre otros).

El modelo resuelve el problema de convertir representaciones opacas de modelos de habla auto-supervisados en una salida fonéticamente interpretable que permite segmentar el audio en teléfonos y etiquetarlos. Es relevante porque ofrece una vía ligera (adapter sobre un encoder congelado) para tareas de fonética computacional, análisis fonológico y reconocimiento fonético de vocabulario abierto, con la posibilidad de restringir el inventario de salida a cualquier lengua mediante PHOIBLE.

El modelo se distribuye a través de la librería `phonespam`, tiene licencia MIT y está orientado a inglés (`en`) según los metadatos, aunque la API permite invocar inventarios de otras lenguas vía `vocab_for_language`. El repositorio de Hugging Face ocupa 0.0 GB, lo que sugiere que los pesos se cargan desde el encoder base más los adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter sobre encoder WavLM-large (transformer auto-supervisado) con cabezas de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos); inventario de salida configurable por lengua vía PHOIBLE |
| Licencia | MIT |
| Formato de pesos | no disponible (carga vía `phonespam` / Hugging Face Hub) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large` congelado, empleando la representación de su capa 24 a una frecuencia de muestreo de 16 kHz. Sobre esa representación se aplica SPAM, que proyecta cada frame del encoder a un vector de 43 activaciones fonológicas en el rango [0, 1] (por ejemplo `silence+`, `syl+`, `son+`). A partir de esa representación interpretable, dos cabezas realizan la segmentación y el reconocimiento de teléfonos. El pipeline completo se expone mediante el método `transcribe`, que devuelve segmentos contiguos con tiempos en segundos.

El entrenamiento utiliza el corpus TIMIT (`timit-asr/timit_asr`) según los metadatos y la model card. No se especifican en la información disponible el número de tokens de audio, la composición detallada del dataset ni si se aplicaron técnicas de ajuste fino adicionales (RLHF/DPO no aplican a esta tarea). La innovación técnica principal es el propio SPAM: convertir la representación latente del encoder en un espacio de rasgos fonológicos interpretables que sirve simultáneamente para segmentar y clasificar. El modelo se asocia al paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026).

## Capacidades

- Segmentación de audio en unidades telefónicas con marcas de inicio y fin en segundos.
- Reconocimiento fonético (etiquetado de cada segmento con un teléfono).
- Extracción de activaciones fonológicas interpretables (43 rasgos) mediante `model.spam(audio)`.
- Restricción del inventario de salida a una lengua concreta mediante `vocab_for_language`, apoyándose en PHOIBLE 2.0.
- Procesamiento de audio a 16 kHz.
- Integración como pipeline de extremo a extremo (`transcribe`) o acceso a la representación intermedia para análisis.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es un modelo específico de fonética del habla.

## Casos de uso

- Análisis fonético y fonológico: obtener la secuencia de teléfonos de una grabación para estudiar fenómenos de coarticulación, elisión o asimilación, gracias a la representación interpretable de 43 rasgos.
- Investigación en lingüística computacional: comparar inventarios fonéticos entre lenguas restringiendo el vocabulario de salida con `vocab_for_language` sobre PHOIBLE.
- Anotación asistida de corpus de habla: pre-etiquetar segmentos telefónicos en corpus de inglés para acelerar la anotación manual posterior.
- Enseñanza de pronunciación: descomponer una locución en teléfonos y tiempos para diagnosticar errores de articulación en aprendices.
- Análisis de calidad del habla: detectar inserciones, omisiones o sustituciones de fonemas en grabaciones de hablantes no nativos a partir de la alineación telefónica.
- Preprocesamiento para pipelines de reconocimiento: generar alineaciones telefónicas que sirvan como características intermedias en sistemas de ASR o de evaluación de pronunciación.
- Estudio de rasgos fonológicos: usar `model.spam` para analizar la evolución temporal de rasgos como sonoridad o nasalidad a lo largo de un enunciado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un adapter sobre WavLM-large congelado, el consumo dominante es el del encoder base (orden de cientos de millones de parámetros), por lo que se espera que quepa en GPUs de consumo con memoria moderada, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. La API permite `device="cuda"` para GPU.
- Cabe en consumer GPU: probablemente sí, dado que el encoder es WavLM-large y los adaptadores son ligeros, pero no se especifica en la información disponible.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), con carga vía `PhoneModel.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo de habla).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-phonemodel | Segmentación y reconocimiento telefónico con rasgos fonológicos | WavLM-large (capa 24) | Audio 16 kHz | MIT | Hugging Face (`juice500/wavlm-24-phonemodel`) |
| WavLM-large (base) | Encoder auto-supervisado de habla | - | Audio 16 kHz | MIT (según modelo base) | Hugging Face (`microsoft/wavlm-large`) |
| Modelos de phone recognition clásicos (p. ej. basados en CTC sobre wav2vec 2.0) | Reconocimiento telefónico | wav2vec 2.0 / HuBERT | Audio 16 kHz | variable | Hugging Face / repositorios académicos |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo está etiquetado para inglés (`en`); el uso con otras lenguas depende de `vocab_for_language` y de la calidad de la transferencia, no validada en la información disponible.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que tiene licencia CC BY-SA 3.0 y es independiente de la licencia MIT del modelo; conviene revisar las obligaciones de atribución y compartir-igual.
- Riesgo de alucinación o etiquetado erróneo en audio con ruido, solapamiento de hablantes o condiciones acústicas alejadas del corpus de entrenamiento (TIMIT), no cuantificado en la información disponible.
- El modelo se apoya en un encoder congelado; no se documenta fine-tuning del encoder, lo que puede limitar la adaptación a dominios muy distintos.
- No se especifican sesgos demográficos, acentos ni variedades dialectales cubiertas; el corpus TIMIT está sesgado hacia hablantes de inglés americano.
- No se documentan requisitos de latencia ni comportamiento en producción a gran escala.
- El repositorio muestra 0 descargas y 2 likes en el momento de la consulta, lo que indica adopción muy limitada y escasa validación comunitaria.
- La fecha del paper (SLT 2026) y del modelo es posterior a la información de referencia habitual; conviene verificar la disponibilidad efectiva de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- PHOIBLE: https://phoible.org
- Dataset TIMIT ASR: https://huggingface.co/datasets/timit-asr/timit_asr
