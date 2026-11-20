# juice500/xls-r-21-phonemodel

## Resumen

xls-r-21-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de facebook/wav2vec2-xls-r-300m, concretamente sobre la capa 21 de dicho encoder. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la cita del paper) y aplica una técnica denominada SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del encoder a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.). El resultado es una representación interpretable a partir de la cual dos cabezas realizan la segmentación y el reconocimiento de fonemas.

El modelo resuelve el problema de obtener fronteras y etiquetas fonéticas a nivel de frame sin reentrenar el encoder self-supervised, aprovechando que las representaciones intermedias de XLS-R ya codifican información fonética. Frente a sistemas de reconocimiento fonético entrenados de forma supervisada de extremo a extremo, SPAM aporta trazabilidad: cada decisión se puede inspeccionar a través de los rasgos fonológicos activados.

Se trata de un punto concreto de la rejilla encoder × capa del paper (la figura 2), no del modelo principal. El propio autor indica que el mejor resultado de la familia es juice500/wavlm-24-phonemodel. La relevancia actual es acotada: es una pieza de investigación publicada en SLT 2026, con licencia MIT, pensada para experimentación en fonética computacional más que para despliegues de producción a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder transformer self-supervised Wav2Vec2 XLS-R (capa 21) con cabezas de segmentación y reconocimiento sobre activaciones fonológicas SPAM |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; el encoder base XLS-R-300m tiene ~300 M, pero el adaptador en sí no reporta cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; sin ventana declarada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado con TIMIT); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 se descarga en tiempo de ejecución y es CC BY-SA 3.0, licencia separada) |
| Formato de pesos | no disponible (empaquetado para la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: congela facebook/wav2vec2-xls-r-300m y extrae las activaciones de la capa 21 a 16 kHz. Sobre esas representaciones, SPAM aprende un mapeo a 43 rasgos fonológicos con valores en [0, 1] (nombres como `silence+`, `syl+`, `son+`, entre otros). A partir de ese vector de activaciones, dos cabezas resuelven la segmentación en fronteras de fonema y la clasificación de cada segmento. Es un esquema de adaptación ligero, no un modelo generativo ni un ASR completo.

El entrenamiento se realizó con el dataset timit-asr/timit_asr, un corpus de habla inglesa con anotaciones fonéticas a nivel de fonema y de palabra. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de tarea). La innovación técnica destacable es precisamente SPAM: convertir una representación opaca del encoder en un espacio de rasgos fonológicos interpretables, lo que permite auditar qué rasgo motiva cada etiqueta y restringir el vocabulario de salida a inventarios fonológicos de lenguas concretas vía PHOIBLE.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos mediante `model.transcribe()`.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético del inventario configurado.
- Representación fonológica interpretable: `model.spam()` expone una matriz de (frames, 43) activaciones en [0, 1] con nombres de rasgo accesibles en `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la salida al inventario PHOIBLE de esa lengua, aunque el modelo se entrenó con inglés.
- Procesamiento de audio a 16 kHz como única modalidad de entrada.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento explícito; no es un modelo de lenguaje.

## Casos de uso

- Investigación en fonética computacional: extraer alineamientos fonéticos a nivel de frame para analizar fenómenos de coarticulación, elisión o asimilación en corpus de habla inglesa, aprovechando la representación SPAM para correlacionar rasgos concretos con cada frontera detectada.
- Análisis de pronunciación en enseñanza de idiomas: comparar la secuencia de fonemas reconocida con la esperada en un ejercicio de lectura y señalar desviaciones, usando los tiempos de segmento para localizar el error en el audio.
- Construcción de léxicos y diccionarios de pronunciación: generar transcripciones fonéticas automáticas sobre grabaciones de TIMIT o corpus similares para poblar bases de datos léxicas con alineamientos temporales.
- Preprocesado para pipelines de síntesis de voz: obtener duraciones y etiquetas de fonema que alimenten un modelo TTS basado en fonemas, gracias a la salida de segmentos con marcas temporales.
- Estudio de inteligibilidad y habla patológica: cuantificar tasas de acierto por fonema y rasgo fonológico en muestras de habla con alteraciones, usando las activaciones de 43 rasgos como vector descriptivo.
- Evaluación de representaciones self-supervised: servir como sonda (probe) para medir cuánta información fonética contiene la capa 21 de XLS-R-300m frente a otras capas o encoders, dado que el autor publica la rejilla completa encoder × capa.
- Filtrado y anotación de corpus: etiquetar automáticamente grandes colecciones de audio inglés con fonemas y fronteras para tareas posteriores de búsqueda o minería de datos acústicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un encoder de ~300 M de parámetros con adaptadores ligeros, es esperable que quepa en GPUs de consumo, pero no se confirma cifra en la información.
- GPU recomendadas: no disponible; el uso documentado admite `device="cuda"` para GPU, sin modelo concreto indicado.
- Cabe en GPU de consumo: no confirmado en la información; por el tamaño del encoder base es plausible, pero no se aporta dato.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained()`; también disponible una demo en Streamlit (phonespam.streamlit.app). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder base | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/xls-r-21-phonemodel | facebook/wav2vec2-xls-r-300m | 21 | Segmentación y reconocimiento fonético (SPAM) | MIT | Hugging Face |
| juice500/wavlm-24-phonemodel | WavLM (según nombre) | 24 | Segmentación y reconocimiento fonético (SPAM) | no disponible en la información | Hugging Face (señalado por el autor como el mejor de la familia) |
| Otros puntos de la rejilla encoder × capa del paper | XLS-R / WavLM | varias | misma tarea | no disponible | según figura 2 del paper |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con habla inglesa (TIMIT); el uso con otras lenguas mediante `vocab_for_language` restringe el inventario de salida, pero no garantiza un rendimiento equivalente al de inglés.
- No es el mejor modelo de su familia: el propio autor remite a juice500/wavlm-24-phonemodel para el mejor resultado, por lo que este checkpoint debe tratarse como un punto de la rejilla experimental.
- El repositorio ocupa 0.0 GB y registra 0 descargas y 0 likes, lo que sugiere un artefacto de investigación sin validación comunitaria.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.
- Dependencia externa en tiempo de ejecución: `vocab_for_language` descarga PHOIBLE 2.0, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; hay que revisar obligaciones de atribución y compartir-igual si se redistribuye el vocabulario.
- Riesgo de errores en fronteras y etiquetas en habla ruidosa, con acento no estadounidense o fuera de dominio, dado el entrenamiento sobre TIMIT; no se documenta ninguna evaluación de robustez.
- No apto para tareas generativas, de razonamiento o de agente: es un modelo discriminativo de fonética, y usarlo fuera de ese ámbito producirá resultados sin sentido.
- La licencia MIT permite uso comercial del modelo, pero no se ofrece ninguna garantía de precisión ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-21-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
