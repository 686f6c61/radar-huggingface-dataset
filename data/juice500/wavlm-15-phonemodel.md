# juice500/wavlm-15-phonemodel

## Resumen

`juice500/wavlm-15-phonemodel` es un modelo de segmentación y reconocimiento fonético en inglés construido sobre las representaciones congeladas de `microsoft/wavlm-large`. Lo desarrolla el autor de Hugging Face `juice500` (Shikhar Bharadwaj y colaboradores según la cita del paper) y se publica como adaptador sobre el encoder WavLM-large. El modelo no genera texto libre: su tarea es mapear cada frame acústico a un vector de activaciones fonológicas (sonoridad, nasalidad, estridencia, etc.) mediante la técnica SPAM (S3M-based Phonological Activation Mapping), y a partir de ahí producir segmentos con etiquetas de fonema.

La relevancia del modelo está en su interpretabilidad: en lugar de un clasificador de fonemas opaco, expone una representación intermedia de 43 dimensiones con nombre semántico (`silence+`, `syl+`, `son+`, etc.) que resulta auditable y reutilizable. Esto lo hace útil para investigación fonética, análisis de habla y pipelines de alineamiento fonético, más que para aplicaciones de ASR general.

Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa (WavLM-large, capa 15). El propio autor indica que el mejor modelo de la familia es `juice500/wavlm-24-phonemodel`, por lo que esta variante debe considerarse una pieza de un barrido experimental más que el modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder WavLM-large congelado (transformer convolucional auto-supervisado) + cabezas de segmentación y reconocimiento sobre activaciones fonológicas SPAM |
| Parametros totales | no disponible (el encoder base WavLM-large ronda los 317 M, pero el autor no publica el recuento del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; no se especifica límite de duración) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `phonespam`, no se documenta safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large` como extractor de características congelado y opera sobre la capa 15. Sobre esas representaciones, SPAM proyecta cada frame a un vector de 43 activaciones fonológicas en el rango [0, 1], con nombres de característica legibles (`silence+`, `syl+`, `son+`, etc.). Dos cabezas leen de esa representación: una de segmentación (fronteras temporales) y otra de reconocimiento (etiqueta de fonema por segmento). El pipeline `transcribe` encadena ambas y devuelve tuplas `Segment(start, end, label)` con tiempos en segundos.

El ajuste se realiza sobre el dataset `timit-asr/timit_asr` (TIMIT), un corpus clásico de habla inglesa con anotaciones fonéticas a nivel de fonema. No se documenta en la información disponible el número de tokens de audio, la composición detallada del dataset, ni si hubo etapas de RLHF/DPO (poco probables en una tarea de etiquetado fonético). La innovación principal es precisamente la representación intermedia interpretable: permite restringir el vocabulario de reconocimiento a un inventario fonológico concreto de PHOIBLE mediante `vocab_for_language`, lo que hace el sistema adaptable a otros inventarios sin reentrenar el encoder.

## Capacidades

- Segmentación fonética: detecta fronteras entre fonemas en audio de habla continua.
- Reconocimiento de fonemas: asigna una etiqueta de fonema a cada segmento detectado.
- Representación fonológica interpretable: expone 43 activaciones con nombre semántico (`spam()`), auditable y reutilizable por otras cabezas.
- Restricción de vocabulario por inventario: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de un idioma dado.
- Entrada de audio a 16 kHz, procesamiento frame a frame sobre la salida del encoder.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking: es un modelo discriminativo de etiquetado secuencial.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos fonéticos a nivel de frame sobre corpus de habla para estudiar fenómenos de coarticulación, sonoridad o nasalidad, aprovechando que las activaciones SPAM son interpretables y no una caja negra.
- Análisis de pronunciación en enseñanza de idiomas: comparar la secuencia de fonemas detectada con la esperada para señalar errores de articulación en aprendices de inglés, usando las fronteras temporales para localizar el fallo.
- Preprocesado para pipelines de ASR: generar transcripciones fonéticas y alineamientos que sirvan como features o como supervisión débil en sistemas posteriores.
- Anotación asistida de corpus: acelerar el etiquetado manual de TIMIT u otros corpus fonéticos, con el anotador humano revisando y corrigiendo las propuestas del modelo.
- Estudios de variación dialectal: restringir el vocabulario con inventarios PHOIBLE de distintas variedades o lenguas y comparar las activaciones para caracterizar diferencias fonéticas.
- Análisis de habla patológica: obtener segmentaciones fonéticas objetivas para cuantificar alteraciones en la producción de fonemas en contextos clínicos o de logopedia.
- Docencia y divulgación: usar el demo de Streamlit y la representación SPAM para ilustrar cómo un modelo auto-supervisado codifica información fonológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El encoder base WavLM-large ronda los 317 M de parámetros; en fp32 ocuparía del orden de 1,3 GB solo en pesos, más activaciones y el adaptador. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en fp32; el autor menciona `device="cuda"` como opción en el ejemplo de uso.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; también debería funcionar en CPU para audio de duración moderada.
- Opciones de despliegue: la librería `phonespam` (`pip install phonespam`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/wavlm-15-phonemodel` | WavLM-large, capa 15 | Segmentación y reconocimiento fonético | en | MIT | Hugging Face, vía `phonespam` |
| `juice500/wavlm-24-phonemodel` | WavLM-large, capa 24 | Segmentación y reconocimiento fonético | en | MIT (según repo del autor) | Hugging Face, vía `phonespam`; indicado por el autor como el mejor de la familia |
| `microsoft/wavlm-large` | — | Representaciones auto-supervisadas de habla (base, sin cabezas fonéticas) | en (preentrenamiento multilingüe no especificado) | MIT | Hugging Face |
| Alineadores fonéticos tipo Montreal Forced Aligner | HMM/GMM o redes | Alineamiento forzado con transcripción conocida | varios | GPL/MIT según versión | Distribución propia |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés (TIMIT); el rendimiento en otras lenguas no está documentado, aunque `vocab_for_language` permita restringir inventarios de PHOIBLE.
- Es un punto concreto de un barrido experimental: el propio autor remite a `wavlm-24-phonemodel` como mejor modelo, por lo que este checkpoint no debe tomarse como la referencia de la familia.
- Riesgo de error en fronteras y etiquetas fonéticas en habla ruidosa, con acento marcado o fuera del dominio de TIMIT (habla leída de calidad limitada).
- El repositorio aparece con tamaño 0.0 GB y 0 descargas: conviene verificar la integridad y disponibilidad real de los pesos antes de integrarlo en producción.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado del modelo MIT; hay que revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- No es un modelo generativo: no produce transcripciones ortográficas ni texto; para ASR completo hace falta un componente adicional.
- No se documentan sesgos demográficos ni evaluación de robustez; al entrenar sobre TIMIT, es esperable un sesgo hacia las variedades y hablantes de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-15-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
