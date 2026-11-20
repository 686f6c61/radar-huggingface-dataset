# juice500/wavlm-0-phonemodel

## Resumen

wavlm-0-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large, un modelo auto-supervisado de voz (S3M) de 16 kHz desarrollado por Microsoft. Lo publica el usuario juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) como parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en SLT 2026. El modelo resuelve el problema de convertir una señal de audio en una secuencia de segmentos con etiqueta fonética y marcas temporales, sin reentrenar el encoder.

La innovación central es SPAM (S3M-based Phonological Activation Mapping): en lugar de clasificar directamente fonemas sobre features opacos, el sistema proyecta cada frame del encoder a un vector de 43 activaciones de rasgos fonológicos interpretables (sonoridad, nasalidad, stridencia, silencio, sílaba, etc.) en el rango [0, 1]. Sobre esa representación intermedia operan dos cabezas, una de segmentación y otra de reconocimiento. Este repositorio concreto es un único punto de la rejilla encoder × capa: WavLM-large con la capa 0, es decir, la salida más superficial del encoder. El autor remite explícitamente a `juice500/wavlm-24-phonemodel` como el mejor modelo de la familia.

Se trata, por tanto, de un artefacto de investigación pequeño y especializado, no de un modelo generativo. Su relevancia radica en que demuestra que features auto-supervisadas congeladas contienen información fonológica suficiente para segmentar y etiquetar fonemas de forma interpretable, y en que expone una API sencilla (`transcribe`, `spam`) a través del paquete `phonespam`. El alcance lingüístico declarado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM (cabezas de segmentación y reconocimiento sobre activaciones fonológicas) montado sobre encoder WavLM-large congelado, capa 0, 16 kHz |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB; los pesos del encoder base no se incluyen necesariamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo frame-a-frame sobre audio; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el vocabulario de reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (carga mediante `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El sistema es un pipeline en dos etapas sobre un encoder congelado. La primera etapa, SPAM, transforma cada frame de WavLM-large (capa 0) en un vector de 43 activaciones de rasgos fonológicos con nombres accesibles vía `spam.featnames` (`silence+`, `syl+`, `son+`, etc.), todas en [0, 1]. La segunda etapa aplica dos cabezas sobre esa representación: una de segmentación, que delimita fronteras entre teléfonos, y otra de reconocimiento, que asigna la etiqueta fonética a cada segmento. La salida de `transcribe` son tuplas contiguas `Segment(start, end, label)` con tiempos en segundos.

El encoder base es `microsoft/wavlm-large`, un transformer auto-supervisado de voz preentrenado sobre audio de 16 kHz; en este repositorio se usa como extractor congelado, de modo que el adaptador no modifica sus pesos. El dataset declarado en la model card es `timit-asr/timit_asr`, el corpus TIMIT en formato ASR, habitual en tareas de reconocimiento fonético. No se especifican en la información disponible el número de tokens de audio de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de ajuste adicionales como RLHF o DPO (no aplicables de forma estándar a esta tarea). La innovación técnica destacable es precisamente la intermediación por rasgos fonológicos, que hace la representación del encoder inspeccionable y permite restringir el espacio de etiquetas a un inventario fonológico concreto.

## Capacidades

- Segmentación de teléfonos en audio: detecta fronteras temporales entre segmentos fonéticos y devuelve marcas de inicio y fin en segundos.
- Reconocimiento fonético: etiqueta cada segmento con un símbolo fonético.
- Mapeo a rasgos fonológicos interpretables: expone 43 activaciones por frame (sonoridad, nasalidad, stridencia, silencio, sílaba, etc.) mediante `model.spam(...)`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de la lengua indicada, lo que permite adaptar el reconocimiento a inventarios distintos del inglés.
- Procesamiento de audio a 16 kHz con encoder WavLM-large congelado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: es un modelo discriminativo de fonética, no un LLM.

## Casos de uso

- Anotación fonética de corpus de habla: el modelo genera segmentaciones y etiquetas automáticas sobre grabaciones en inglés, reduciendo el trabajo manual en la creación de corpus fonéticos alineados a nivel de teléfono.
- Investigación en fonética y fonología: las 43 activaciones de `spam()` permiten analizar qué rasgos activa el encoder en cada frame, útil para estudiar la codificación de contrastes fonológicos en modelos auto-supervisados.
- Evaluación de modelos S3M: al ser un punto concreto de la rejilla encoder × capa, sirve como referencia para comparar cuánta información fonética contiene la capa 0 frente a capas más profundas (como la 24 del modelo hermano).
- Sistemas de pronunciación asistida: la segmentación temporal a nivel de teléfono permite señalar al usuario qué fragmento de su pronunciación se desvía del esperado en aplicaciones de aprendizaje de inglés.
- Preprocesado para pipelines de reconocimiento de habla: los segmentos fonéticos con marcas temporales pueden alimentar sistemas posteriores de alineamiento forzado o de análisis acústico.
- Experimentos multilingües acotados: con `vocab_for_language` se puede restringir la salida al inventario PHOIBLE de otra lengua, aunque el modelo solo declara entrenamiento en inglés y el rendimiento fuera de ese idioma no está documentado.
- Detección de contenido anómalo en audio: las etiquetas del repositorio incluyen `spam` y `phonespam`, lo que sugiere su uso en el proyecto para analizar o filtrar audio no deseado a nivel fonético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de error de teléfono (PER), precisión de fronteras ni comparaciones numéricas con otros sistemas; únicamente remite al paper (arXiv:2607.09020) para los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamaño de WavLM-large (encoder transformer de voz de gran tamaño) y del adaptador; el repositorio declarado ocupa 0.0 GB, por lo que los pesos del encoder podrían descargarse por separado.
- GPU recomendadas: no disponible en la información proporcionada. La API admite `device="cuda"` para GPU; el ejemplo de uso por defecto es CPU.
- ¿Cabe en GPU de consumo? No disponible; sin datos de tamaño de pesos no puede confirmarse.
- Opciones de despliegue: paquete Python `phonespam` (`pip install phonespam`), con carga vía `PhoneModel.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo discriminativo de audio de este tipo.
- Latencia y throughput: no disponible.
- Demo pública alojada en Streamlit (`phonespam.streamlit.app`).

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| juice500/wavlm-0-phonemodel | WavLM-large | 0 | Segmentación y reconocimiento fonético | en | MIT | Hugging Face |
| juice500/wavlm-24-phonemodel | WavLM-large | 24 | Segmentación y reconocimiento fonético | en | no disponible en la información | Hugging Face (referenciado como el mejor de la familia) |
| microsoft/wavlm-large | — | — | Representación auto-supervisada de voz (encoder base) | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un punto intermedio de la rejilla experimental (capa 0); el propio autor indica que el mejor modelo es `juice500/wavlm-24-phonemodel`. Usar este artefacto como sistema de producción no es el propósito declarado.
- Idioma: solo se declara inglés. El uso de `vocab_for_language` con otras lenguas restringe el espacio de salida, pero no hay evidencia de rendimiento fuera del inglés.
- Entrenado sobre TIMIT, un corpus pequeño, de dominio acotado (habla leída, calidad de estudio) y con cobertura limitada de hablantes y acentos; es esperable degradación en audio ruidoso, espontáneo o con acentos no representados.
- Riesgo de errores en fronteras y etiquetas fonéticas: sin métricas publicadas en la información disponible, no puede acotarse la tasa de error.
- Sesgos: no documentados en la model card; los sesgos del corpus TIMIT (demografía de hablantes, variedades del inglés americano) pueden propagarse al adaptador.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar la compatibilidad si se usa en productos comerciales.
- El repositorio ocupa 0.0 GB y no se detalla el formato de pesos, por lo que la reproducibilidad y el tamaño real de la descarga deben verificarse antes de integrarlo.
- No es un LLM: no genera texto libre, no soporta instrucciones en lenguaje natural ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-0-phonemodel
- Modelo hermano (mejor de la familia): https://huggingface.co/juice500/wavlm-24-phonemodel
- Encoder base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset declarado: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
