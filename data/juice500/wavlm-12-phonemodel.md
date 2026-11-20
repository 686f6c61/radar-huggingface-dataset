# juice500/wavlm-12-phonemodel

## Resumen

`wavlm-12-phonemodel` es un modelo de segmentación y reconocimiento de fonemas en inglés construido sobre las representaciones congeladas de WavLM-large (capa 12). Lo desarrolla el autor independiente `juice500` en el marco del trabajo SPAM (S3M-based Phonological Activation Mapping), presentado en el taller SLT 2026. El modelo no es un LLM ni un modelo generativo: es un cabezal ligero que proyecta cada frame del encoder auto-supervisado a un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, stridencia, etc.) y, a partir de ellas, realiza segmentación y etiquetado de fonemas.

El problema que aborda es la opacidad de los modelos de voz auto-supervisados: WavLM-large produce representaciones de 1024 dimensiones por frame que no son directamente interpretables ni alineables con unidades fonéticas. SPAM convierte esa representación en un espacio fonológico explícito, lo que permite segmentar y reconocer fonemas con un modelo entrenado sobre TIMIT y restringir el inventario de salida a una lengua concreta mediante PHOIBLE.

Es relevante para investigadores en fonética computacional y para pipelines de análisis del habla que necesiten alineamiento fonético de bajo coste. Este checkpoint concreto es un punto de la rejilla encoder × capa (Figura 2 del paper); el propio autor indica que la mejor variante es `juice500/wavlm-24-phonemodel`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adapter sobre WavLM-large congelado (capa 12) + cabezales de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parámetros totales | no disponible (el encoder base WavLM-large tiene ~317 M, pero el repo no declara el recuento del adaptador) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por frames; no se especifica ventana máxima) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inventario de salida restringible a otras lenguas vía PHOIBLE, p. ej. `deu`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `phonespam`, no se declara safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large`, un transformer convolucional auto-supervisado para voz a 16 kHz, y congela sus pesos. Sobre la activación de la capa 12 se entrena un mapeo a 43 características fonológicas continuas en [0, 1] (SPAM), que actúan como representación intermedia interpretable. Dos cabezales leen de esa representación: uno de segmentación (fronteras entre fonemas) y otro de reconocimiento (etiqueta fonética), con la posibilidad de restringir el vocabulario de salida al inventario fonológico de una lengua descargado de PHOIBLE 2.0.

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr`. No se especifican en la información disponible el número de tokens, la composición exacta del corpus, ni si se aplicaron etapas de RLHF/DPO (poco probables en una tarea de etiquetado fonético supervisado). La innovación técnica central es el propio SPAM: sustituir la representación opaca del encoder por activaciones fonológicas con nombre semántico (`silence+`, `syl+`, `son+`, etc.), lo que permite inspeccionar qué rasgo activa cada frame y restringir la decodificación por lengua.

## Capacidades

- Segmentación de fonemas en audio de habla en inglés con marcas de inicio y fin en segundos.
- Reconocimiento de fonemas (etiquetado por segmento) a partir de las mismas activaciones.
- Exposición de la representación intermedia: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones fonológicas en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción del inventario de reconocimiento a una lengua concreta mediante `vocab_for_language(...)` (PHOIBLE), útil para forzar salidas plausibles en una fonología dada.
- Soporte de ejecución en CPU y GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un modelo discriminativo de fonética.

## Casos de uso

- Alineamiento fonético forzado en corpus de investigación: dado un audio y su transcripción, el modelo produce fronteras por fonema que permiten estudiar duraciones, coarticulación y reducción vocálica con marcas temporales en segundos.
- Análisis de pronunciación en enseñanza de lenguas: comparar la secuencia de fonemas reconocida con la esperada para detectar sustituciones u omisiones concretas en aprendices de inglés.
- Anotación asistida de bases de datos de habla: preetiquetar TIMIT-like o corpus propios y revisar manualmente, reduciendo el coste de anotación fonética.
- Estudios de fonología contrastiva: usando `vocab_for_language`, mapear la salida a inventarios de otras lenguas (p. ej. `deu`) para experimentos de percepción o transferencia entre inventarios.
- Extracción de características para modelos posteriores: las 43 activaciones fonológicas sirven como entrada interpretable a clasificadores de acento, disartria o trastornos del habla.
- Investigación en representaciones auto-supervisadas: comparar el punto (encoder, capa) de esta variante con `wavlm-24-phonemodel` para estudiar qué capas codifican mejor los rasgos fonológicos.
- Filtrado y análisis de datos de voz a pequeña escala: la segmentación por fonemas permite indexar o trocear audio por unidades fonéticas sin depender de un ASR completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al congelar WavLM-large (~317 M de parámetros) y añadir un adaptador ligero, la inferencia en fp32 requiere del orden de 1,3 GB solo para pesos del encoder, más activaciones. No se declara cifra oficial.
- GPU recomendadas: cualquier GPU con suficiente memoria para WavLM-large; una RTX 4090, A100 o H100 son holgadas. El modelo admite `device="cuda"` en `PhoneModel.from_pretrained`.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más, aunque el dato no está confirmado en la model card.
- Opciones de despliegue: paquete `phonespam` (`pip install phonespam`), con API `PhoneModel.from_pretrained` y `model.transcribe`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Capas / punto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/wavlm-12-phonemodel` | WavLM-large (capa 12) | Segmentación y reconocimiento de fonemas | Capa 12 | MIT | HF, 0 descargas |
| `juice500/wavlm-24-phonemodel` | WavLM-large (capa 24) | Segmentación y reconocimiento de fonemas | Capa 24 (mejor variante según el autor) | MIT (presumible, no confirmado) | HF |
| WavLM-large original | — | Representaciones auto-supervisadas | — | MIT | HF |
| Modelos de alineamiento forzado tipo Montreal Forced Aligner | GMM-HMM / redes | Alineamiento fonético | — | Varía | Disponible |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre TIMIT, un corpus pequeño, leído y de dominio restringido: el rendimiento en habla espontánea, ruidosa o con acentos no representados puede degradarse notablemente.
- Idioma declarado únicamente `en`; el uso de `vocab_for_language` para otras lenguas restringe la salida pero no implica que el modelo haya sido entrenado en ellas.
- Riesgo de errores de segmentación y de confusión entre fonemas acústicamente próximos; no se han publicado métricas que permitan acotar la tasa de error.
- La representación SPAM es una interpretación inducida, no una verdad fonológica: las 43 activaciones son aprendidas y su correspondencia con rasgos lingüísticos debe validarse por caso.
- Licencia MIT para el modelo, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que es CC BY-SA 3.0 y se licencia por separado; conviene revisar la compatibilidad si se redistribuye.
- Repositorio de 0.0 GB y 0 descargas: no hay evidencia pública de uso en producción; tratar como artefacto de investigación.
- No apto para tareas generativas, de diálogo ni de razonamiento; su ámbito es estrictamente fonético.
- No se declaran sesgos demográficos ni evaluación por subgrupos; en aplicaciones reales conviene auditar el comportamiento por variedad dialectal y género.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-12-phonemodel
- Variante recomendada por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
