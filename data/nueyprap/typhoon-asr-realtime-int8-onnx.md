# nueyprap/typhoon-asr-realtime-int8-onnx

## Resumen

Typhoon ASR Realtime int8 ONNX es una conversion del modelo de reconocimiento automatico del habla (ASR) en tailandes de Typhoon (SCB 10X), publicada por el desarrollador independiente nueyprap. El modelo original es un transductor RNNT basado en FastConformer no streaming, y esta version lo reempaqueta en formato ONNX con pesos cuantizados a int8 para poder ejecutarse con sherpa-onnx directamente sobre CPU, sin necesidad de NeMo ni PyTorch.

La relevancia practica de esta ficha radica en el ahorro de recursos: el autor reporta una reduccion del tiempo de carga de unos 5 s a unos 0,6 s, del consumo de memoria de aproximadamente 1,7 GB a aproximadamente 0,3 GB y del tiempo de inferencia por clip de 5 s de 0,12-0,14 s a 0,06-0,08 s, todo ello en la CPU de un portatil Dell XPS 13. La precision se mantiene practicamente identica e incluso mejora ligeramente en el pequeño conjunto de prueba sintetico usado.

El repositorio es pequeno (0,1 GB) e incluye los tres componentes ONNX del transductor (encoder, decoder y joiner), el vocabulario de 2048 tokens BPE y el script de exportacion reproducible. La licencia es CC BY 4.0, heredada del modelo original, y el idioma soportado es unicamente el tailandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNNT con encoder FastConformer no streaming (subsampling 8, 80 features mel, normalizacion por feature) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; procesa el audio completo por segmento) |
| Tipos de cuantizacion | int8 (pesos, via `quantize_dynamic` de onnxruntime); existe tambien una exportacion fp32 ONNX del mismo script |
| Idiomas soportados | tailandes (th) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx` 131 MB, `decoder.int8.onnx` 4,6 MB, `joiner.int8.onnx` 2,1 MB) + `tokens.txt` (2048 tokens BPE mas blank) |

## Arquitectura y entrenamiento

El modelo subyacente es un transductor RNNT clasico con encoder FastConformer, no streaming, que trabaja con 80 features mel, normalizacion por feature y un factor de subsampling de 8. La decodificacion en el ejemplo oficial es `greedy_search` con `model_type="nemo_transducer"`. Esta version concreta no introduce cambios arquitectonicos: el script `export_onnx.py` carga el modelo NeMo original, exporta encoder, decoder y joiner siguiendo el esquema de los scripts de exportacion NeMo de sherpa-onnx, cuantiza cada componente con `quantize_dynamic` de onnxruntime a pesos int8 y anade los metadatos que sherpa-onnx lee.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos detalles pertenecen al modelo original de Typhoon y no se recogen en la informacion disponible. La innovacion tecnica de este repositorio es la reproducibilidad del pipeline de exportacion (reejecutarlo produce archivos identicos byte a byte) y la eliminacion de la dependencia de NeMo y PyTorch en tiempo de inferencia, lo que reduce drasticamente el peso del stack en produccion.

## Capacidades

- Reconocimiento automatico del habla en tailandes a partir de audio de 16 kHz mono.
- Transcripcion de audio no streaming: se acepta la forma de onda completa y se decodifica el resultado.
- Manejo razonable de frases cotidianas y de negocio, numeros, horas y tailandes mezclado con palabras en ingles (los prestamos del ingles concentran la mayoria de los errores restantes).
- Ejecucion en CPU pura mediante sherpa-onnx, sin GPU ni frameworks de deep learning pesados.
- Inferencia configurable con `num_threads` (el autor observa que 2 hilos fue la configuracion mas rapida en su portatil de 6 nucleos; mas hilos resultaron mas lentos).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision ni audio de entrada mas alla de la transcripcion; es un modelo puramente ASR.

## Casos de uso

- Dictado por voz en tailandes en el escritorio: el autor usa el modelo para esta tarea en sus propias maquinas; al ocupar unos 0,3 GB de memoria y cargar en torno a 0,6 s, encaja en portatiles sin GPU.
- Subtitulado y transcripcion por lotes de reuniones o notas de voz en tailandes: el bajo coste por clip (0,06-0,08 s para 5 s de audio en CPU) permite procesar volumenes moderados sin infraestructura dedicada.
- Asistentes de voz locales y aplicaciones de privacidad estricta: al ejecutarse integramente en CPU y sin servicios externos, el audio no sale del dispositivo, lo que simplifica el cumplimiento de requisitos de datos.
- Integracion en aplicaciones de escritorio o moviles mediante sherpa-onnx: la API de la libreria permite incrustar el reconocedor en pipelines nativos sin arrastrar PyTorch ni NeMo.
- Prototipado rapido de funcionalidades de voz en productos orientados al mercado tailandes: el repositorio incluye el script de exportacion, lo que facilita regenerar o adaptar los artefactos ONNX.
- Despliegue en entornos con recursos limitados (servidores pequenos, contenedores ligeros, dispositivos edge x86): el peso total del repositorio es de 0,1 GB y el consumo medido ronda los 0,3 GB de memoria.
- Evaluacion comparativa de stacks ASR: sirve como referencia para medir la penalizacion de precision de la cuantizacion int8 frente al modelo NeMo original y a la exportacion fp32.

## Benchmarks y rendimiento

Los datos disponibles provienen de un conjunto de prueba propio del autor: 19 frases en tailandes leidas con la voz sintetica "Kanya" de macOS, con frases cotidianas y de negocio, numeros, horas y tailandes mezclado con ingles. La metrica es el character error rate (CER) ignorando espacios.

| Modelo | CER |
|---|---|
| Modelo NeMo original | 4,43% |
| Esta conversion int8 | 4,25% |
| ONNX fp32, misma exportacion | 4,16% |

Rendimiento y memoria en un Dell XPS 13 con CPU Intel, solo CPU:

| Metrica | Original (NeMo + PyTorch) | Esta conversion int8 |
|---|---|---|
| Tiempo de carga | ~5 s | ~0,6 s |
| Tiempo por clip de 5 s | 0,12-0,14 s | 0,06-0,08 s |
| Memoria | ~1,7 GB | ~0,3 GB |

No se han publicado resultados de benchmarks estandar (por ejemplo, MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo ASR) en la informacion disponible. El conjunto de prueba es pequeno y sintetico, por lo que estos numeros deben tomarse como indicativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU. En GPU no se han publicado mediciones.
- Memoria RAM: aproximadamente 0,3 GB en la configuracion int8 medida por el autor.
- GPU recomendadas: no disponible; no se documenta uso en GPU para esta conversion.
- Cabe en cualquier CPU de consumo moderna; el autor lo ejecuta en un portatil Dell XPS 13 con CPU Intel de 6 nucleos.
- Opciones de despliegue: sherpa-onnx (libreria principal, API `OfflineRecognizer.from_transducer`), con posibilidad de usar el modelo desde Python u otros bindings de sherpa-onnx. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 0,06-0,08 s por clip de 5 s en CPU con `num_threads=2`; aumentar hilos por encima de 2 resulto mas lento en el equipo del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| typhoon-ai/typhoon-asr-realtime (original) | RNNT FastConformer no streaming | Tailandes | NeMo | CC BY 4.0 | Requiere NeMo y PyTorch; ~1,7 GB de memoria y ~5 s de carga segun el autor |
| Esta conversion int8 ONNX | Misma arquitectura, cuantizada | Tailandes | ONNX int8 | CC BY 4.0 | ~0,3 GB de memoria, ~0,6 s de carga, CER 4,25% en el test del autor |
| Exportacion fp32 ONNX (mismo script) | Misma arquitectura, sin cuantizar | Tailandes | ONNX fp32 | CC BY 4.0 | CER 4,16% en el mismo test; mayor tamano que la version int8 |

No se dispone de informacion sobre otros modelos ASR tailandeses comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluacion es muy pequeno (19 frases) y usa voz sintetica; el propio autor recomienda validar con audio real antes de usarlo en produccion.
- La mayoria de los errores restantes se concentran en prestamos del ingles, un punto debil para audio con mezcla de idiomas.
- Solo soporta tailandes; no hay capacidades multilingues.
- Es un modelo no streaming: no esta disenado para transcripcion en tiempo real por fragmentos, sino para decodificar segmentos completos.
- Riesgo de alucinacion y de errores en nombres propios, cifras o terminos tecnicos no cubiertos por el vocabulario de 2048 tokens BPE.
- No se han publicado analisis de sesgos del modelo original ni de esta conversion.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es obligatorio acreditar a Typhoon (SCB 10X) como autor del modelo y respetar los terminos de la licencia.
- La conversion no anade garantias propias: el autor declara explicitamente que el modelo, los pesos y el entrenamiento son obra de Typhoon y que este repositorio solo cambia el formato y la precision de los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nueyprap/typhoon-asr-realtime-int8-onnx
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-asr-realtime
- Typhoon (SCB 10X): https://opentyphoon.ai
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- FURRINGLINE (autor de la conversion): https://furringline.com
