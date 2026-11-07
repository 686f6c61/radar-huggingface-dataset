# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8

## Resumen

`sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8` es la exportación a ONNX cuantizada a int8 del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, desarrollado originalmente por NVIDIA y exportado por el proyecto sherpa-onnx (k2-fsa). Se trata de un transductor offline (encoder, decoder y joiner) especializado en audio en inglés a 16 kHz mono, empaquetado específicamente para su uso con la librería sherpa-onnx, sin dependencias de PyTorch ni de NeMo en tiempo de inferencia.

El modelo resuelve el problema de la transcripción de voz a texto en inglés en entornos de producción donde se prioriza la eficiencia: al estar en formato ONNX int8, puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para despliegues en dispositivos de borde, servidores sin acelerador o aplicaciones de escritorio. Frente a la versión fp32 del mismo paquete, la int8 reduce el tamaño y aumenta la velocidad de decodificación, a costa de diferencias menores en la salida.

Es relevante ahora porque la familia Parakeet TDT de NVIDIA se ha consolidado como referencia en ASR open source en inglés, y esta exportación permite integrarla en pipelines ligeros (sherpa-onnx, aplicaciones móviles, sistemas embebidos) sin el coste de un stack completo de deep learning. La licencia CC BY 4.0 facilita su uso comercial con atribución. El paquete ocupa 1,3 GB en el repositorio e incluye los grafos cuantizados, el vocabulario y audios de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer): encoder + decoder + joiner, exportado a ONNX |
| Parámetros totales | 0,6 B (600 millones, según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada a 16 kHz mono, recomendado dividir en fragmentos de 15-20 s |
| Tipos de cuantización | int8 (este paquete); existe también el paquete fp32 del mismo exportador |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es un transductor TDT (Token-and-Duration Transducer) de NVIDIA, una variante de los transductores RNN-T en la que el predictor emite conjuntamente tokens y duraciones, lo que acelera la decodificación al reducir el número de pasos del joiner. La arquitectura se compone de tres redes: un encoder que procesa el audio de entrada, un decoder (predictor) que modela el historial de tokens y un joiner que combina ambas representaciones. El exportador de sherpa-onnx escribe metadatos en el encoder con `tdt` en el campo `url`, de modo que sherpa-onnx carga el joiner como TDT y no como transductor simple.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o aumentación) no están disponibles en la información proporcionada; corresponden a la model card original de `nvidia/parakeet-tdt-0.6b-v2`, no incluida aquí. La innovación técnica destacable en este paquete es la exportación a ONNX con cuantización int8 de los tres subgrafos, que permite inferencia sin PyTorch y con requisitos de memoria reducidos. El script de exportación está publicado en el repositorio de sherpa-onnx (`scripts/nemo/parakeet-tdt-0.6b-v2/`).

## Capacidades

- Transcripción de voz a texto en inglés para audio de 16 kHz mono.
- Decodificación offline por streaming de audio aceptado en un `OfflineStream` de sherpa-onnx.
- Manejo de audio de duración arbitraria si se segmenta previamente en silencios (fragmentos de 15-20 s).
- No realiza detección de idioma: transcribe, no identifica la lengua del audio.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No tiene capacidades multimodales más allá del audio: no procesa visión ni texto como entrada.
- Capacidad multilingüe limitada al inglés; otras lenguas no están cubiertas por esta versión (v2).

## Casos de uso

- Transcripción por lotes en servidores sin GPU: al ser ONNX int8, se ejecuta en CPU con un consumo de memoria moderado, adecuado para procesar archivos de audio en pipelines de datos o archivística.
- Subtitulado automático de contenido en inglés: integrado en un script que segmenta el audio en silencios y llama al reconocedor por fragmentos, genera transcripciones con marcas de tiempo a nivel de segmento.
- Aplicaciones de escritorio y de borde: el paquete ONNX se puede enlazar desde C++, Python o Rust mediante sherpa-onnx, lo que permite transcripción local sin conexión en equipos de usuario final.
- Asistentes de voz locales: combinado con un motor de intenciones, sirve para dictado o comandos de voz en inglés dentro de aplicaciones que no pueden enviar audio a la nube.
- Análisis de reuniones y llamadas en inglés: con un preprocesado de segmentación por silencios, se transcriben conversaciones para su indexación o búsqueda posterior.
- Investigación en ASR comparativo: al ser una exportación reproducible con script y workflow públicos, sirve como línea base para comparar WER y latencia de modelos TDT frente a CTC o attention-based en el mismo harness.

## Benchmarks y rendimiento

Los datos disponibles son mediciones propias del proyecto sherpa-onnx sobre el split de test de FLEURS, con 300 clips deterministas por idioma, puntuación y mayúsculas eliminadas, y un único harness para todos los modelos. No son directamente comparables con benchmarks publicados por NVIDIA.

| Modelo | Inglés (WER %) | Inglés, clips ≤ 15 s (WER %) |
|---|---|---|
| v2 (este paquete) | 6,48 | 6,42 |
| v3 | 11,16 | 11,01 |
| Ultra | 8,51 | 8,56 |

En el mismo harness, v3 obtiene 6,84 en alemán, 8,69 en francés y 4,55 en español; Ultra obtiene 5,20, 7,48 y 3,81 respectivamente. En una prueba de estrés con frases FLEURS concatenadas y silencios de 0,2 s, la decodificación de todo el clip se volvió inestable a partir de unos 69 s y truncó 57 de 141 palabras a los 68,7 s; la segmentación por silencios en fragmentos de 15 s alcanzó un WER del 12,71 % con +139 MB de RSS sobre la línea base del modelo cargado.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU. El paquete int8 reduce el peso en disco y en memoria respecto al fp32.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podría usarse, pero el diseño del paquete es para CPU.
- Cabe en cualquier equipo de consumo: el modelo base es de 0,6 B de parámetros y la versión int8 está pensada para ejecutarse sin acelerador.
- Opciones de despliegue: sherpa-onnx (Python, C++, Rust, entre otros), con ONNX Runtime como backend. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones publicadas se centran en WER y en consumo de memoria (+139 MB de RSS en la prueba de segmentación), no en velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER inglés (harness sherpa-onnx) | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2-int8 (este) | 0,6 B | en | 6,48 | CC BY 4.0 | ONNX int8 |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 0,6 B | multilingüe (incluye de, fr, es) | 11,16 | no disponible en la información | ONNX int8 |
| Ultra (paquete sherpa-onnx) | no disponible | multilingüe | 8,51 | no disponible en la información | ONNX int8 |

La comparación se limita a los paquetes de la misma familia evaluados en el mismo harness; no se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- El audio largo debe dividirse en silencios: decodificar una grabación completa como un solo clip degrada gravemente la calidad y aumenta la memoria. Se recomienda segmentar en fragmentos de 15-20 s y nunca usar ventanas de tamaño fijo.
- El paquete int8 es más pequeño y rápido, pero su salida puede diferir ligeramente de la del paquete fp32 de referencia.
- El modelo transcribe pero no informa del idioma detectado; no es un identificador de lengua.
- Las entradas de muy baja amplitud se ven afectadas por un problema del frontend registrado en k2-fsa/sherpa-onnx#4024; conviene normalizar la ganancia antes de la inferencia.
- Solo cubre inglés; para alemán, francés o español hay que usar otras versiones (v3 o Ultra), donde v2 no está entrenado.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; como todo modelo ASR, puede producir transcripciones incorrectas en audio ruidoso o con acentos no representados en el entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución a NVIDIA como autor de los pesos y a sherpa-onnx como exportador. NVIDIA no respalda este paquete.
- Los números de WER son mediciones propias del proyecto sherpa-onnx y no son comparables con los benchmarks publicados por NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Paquete v3 int8: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Documentación de modelos NeMo en sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Script de exportación: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v2
- Workflow de publicación: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Licencia del código de sherpa-onnx (Apache-2.0): https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Issue de frontend en audio de baja amplitud: https://github.com/k2-fsa/sherpa-onnx/issues/4024
