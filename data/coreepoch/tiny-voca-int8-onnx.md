# CoreEpoch/tiny-voca-int8-onnx

## Resumen

tiny-voca-int8-onnx es una versión cuantizada a INT8 del modelo de síntesis de voz n4ze3m/tiny-voca, publicada por CoreEpoch. Se distribuye como dos grafos ONNX de 7,74 MB y 7,73 MB que sustituyen directamente el grafo FP32 original de 21,39 MB, con una reducción de tamano del 63,8 %. El modelo base es un TTS ligero de 4,54 millones de parámetros con dos voces inglesas a 24 kHz (F2 y M2), pensado para inferencia en CPU sin GPU.

La relevancia de esta release está en el rendimiento en hardware modesto: alcanza 60,8x tiempo real con un solo hilo y 108,9x con cuatro hilos en ONNX Runtime, y 114,1x en OpenVINO con cuatro hilos. Además, la variante `tiny_voca_w8_kenosis.onnx` iguala exactamente la tasa de error de palabra (WER) del FP32 original (1,00 % sobre 68 clips), lo que permite desplegar TTS en dispositivos edge, navegadores o entornos embebidos sin degradar la inteligibilidad.

La cuantización es sin calibración (calibration-free) y los ficheros son compatibles con ONNX Runtime estándar y OpenVINO sin cambios en el pipeline de inferencia. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; grafo ONNX) |
| Parametros totales | 4,54 M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por utterance) |
| Tipos de cuantizacion | INT8 (dos variantes: `int8_kenosis` y `w8_kenosis`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8); existen GGUF del modelo base |
| Frecuencia de muestreo de audio | 24 kHz |
| Voces | F2 y M2 |
| Tamano de fichero | 7,74 MB y 7,73 MB (frente a 21,39 MB FP32) |
| Runtime soportado | ONNX Runtime CPU, OpenVINO CPU |
| Frontend fonemizador | `phonemizer/lexicon.tsv` (incluido) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base n4ze3m/tiny-voca en la documentación proporcionada; solo se indica que es un modelo TTS de 4,54 M de parámetros con salida a 24 kHz y dos voces. El grafo incluye una fuente de ruido `RandomNormalLike`, lo que provoca pequeñas variaciones entre ejecuciones sobre el mismo texto (±1 a 2 palabras en la transcripción de 68 clips).

La contribución de esta release es la cuantización a INT8 mediante la herramienta Kenosis de CoreEpoch, sin calibración. Se ofrecen dos variantes: `tiny_voca_int8_kenosis.onnx`, optimizada para ONNX Runtime CPU, y `tiny_voca_w8_kenosis.onnx`, optimizada para OpenVINO y con paridad exacta de WER respecto a FP32. No se detalla el dataset de entrenamiento del modelo base ni si hubo etapas de RLHF o ajuste fino.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz.
- Dos voces: F2 (femenina) y M2 (masculina).
- Fonemización mediante lexicon incluido (`phonemizer/lexicon.tsv`).
- Inferencia en CPU pura, sin GPU, con ONNX Runtime o OpenVINO.
- Ejecución offline y en dispositivos edge.
- Compatible con frontend `dizione` para carga directa del grafo ONNX en Python.
- No soporta tool calling, agentes, visión ni audio de entrada.
- No es un modelo multilingüe: solo inglés.

## Casos de uso

- Lectura de notificaciones y accesibilidad en aplicaciones de escritorio: el modelo cabe en 7,7 MB y sintetiza en CPU a más de 50x tiempo real, por lo que puede leer alertas del sistema sin bloquear el hilo principal.
- Asistentes de voz embebidos en Raspberry Pi o dispositivos IoT: con 60,8x tiempo real en un solo hilo, permite respuestas habladas en tiempo real en hardware sin GPU.
- Síntesis en navegador o aplicaciones web offline: el tamano reducido del ONNX facilita su distribución junto a la aplicación y la ejecución vía WebAssembly/ONNX Runtime Web (sujeto a validación del entorno).
- Generación de audiolibros o podcasts de bajo coste: la velocidad de 108,9x con cuatro hilos permite procesar grandes volúmenes de texto en servidores modestos.
- Pruebas automatizadas de pipelines de voz: la paridad de WER con FP32 en la variante `w8` permite usar el modelo cuantizado como sustituto en tests de regresión sin cambiar los umbrales de calidad.
- Sistemas de respuesta interactiva de voz (IVR) en inglés: latencia por utterance de 52,20 ms con cuatro hilos en ONNX Runtime, adecuada para turnos conversacionales.
- Prototipado rápido de interfaces de voz: el quickstart con `run_tts.py` y las dependencias mínimas (`onnxruntime`, `numpy`, `soundfile`) reducen el tiempo de integración.

## Benchmarks y rendimiento

Precisión (WER sobre 68 clips, 804 palabras normalizadas, transcripción con faster-whisper `base.en`):

| Modelo | Tamano | WER ONNX Runtime | WER OpenVINO |
|---|---:|---:|---:|
| FP32 baseline | 21,39 MB | 1,00 % (8/804) | 1,00 % (8/804) |
| Stock ORT `quantize_dynamic` | 8,12 MB | 1,00 % (8/804) | 0,87 % (7/804) |
| `tiny_voca_int8_kenosis.onnx` | 7,74 MB | 1,24 % (10/804) | 0,87 % (7/804) |
| `tiny_voca_w8_kenosis.onnx` | 7,73 MB | 1,00 % (8/804) | 1,00 % (8/804) |

Velocidad en ONNX Runtime CPU (utterance de 5,7 s, CPU con AVX-VNNI):

| Modelo | 1 hilo | 4 hilos |
|---|---:|---:|
| FP32 baseline | 110,08 ms (51,6x RT) | 56,72 ms (100,1x RT) |
| Stock ORT `quantize_dynamic` | 126,97 ms (45,3x RT) | 81,21 ms (70,8x RT) |
| `tiny_voca_int8_kenosis.onnx` | 93,55 ms (60,8x RT) | 52,20 ms (108,9x RT) |
| `tiny_voca_w8_kenosis.onnx` | 110,07 ms (51,6x RT) | 57,06 ms (99,5x RT) |

Velocidad en OpenVINO CPU:

| Modelo | 1 hilo | 4 hilos |
|---|---:|---:|
| FP32 baseline | 125,41 ms (45,2x RT) | 53,09 ms (106,9x RT) |
| Stock ORT `quantize_dynamic` | 156,91 ms (36,6x RT) | 66,59 ms (86,3x RT) |
| `tiny_voca_int8_kenosis.onnx` | 150,52 ms (37,8x RT) | 63,09 ms (90,1x RT) |
| `tiny_voca_w8_kenosis.onnx` | 112,22 ms (50,7x RT) | 49,85 ms (114,1x RT) |

Confirmación en x86-64 Linux sin VNNI (2 vCPU, 10 frases Harvard, voz F2):

| Modelo | 1 hilo | 4 hilos | WER |
|---|---:|---:|---:|
| FP32 baseline | 139,95 ms (42,5x RT) | 300,57 ms (19,8x RT) | 2,47 % |
| Stock ORT `quantize_dynamic` | 180,45 ms (33,2x RT) | 453,40 ms (13,2x RT) | 1,23 % |
| `tiny_voca_int8_kenosis` | 124,91 ms (47,7x RT) | 275,30 ms (21,6x RT) | 2,47 % |
| `tiny_voca_w8_kenosis` | 142,48 ms (41,9x RT) | 287,38 ms (20,7x RT) | 1,23 % |

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia exclusivamente en CPU.
- RAM: el grafo ocupa 7,7 MB, por lo que el consumo es mínimo (no se publica cifra exacta de pico de memoria).
- GPU recomendadas: no aplica; el modelo está pensado para CPU.
- Cabe en cualquier CPU x86-64 moderna; se beneficia de AVX-VNNI (medido en procesador con AVX-VNNI y confirmado en x86-64 sin VNNI).
- Despliegue: ONNX Runtime CPU (`CPUExecutionProvider`) y OpenVINO CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato y tarea).
- Latencia: 52,20 ms por utterance de 5,7 s con 4 hilos en ONNX Runtime (108,9x tiempo real); 49,85 ms con 4 hilos en OpenVINO (114,1x tiempo real).
- Throughput: hasta 114,1x tiempo real en OpenVINO con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato | Runtime | Licencia |
|---|---:|---:|---|---|---|
| `tiny_voca_int8_kenosis.onnx` | 4,54 M | 7,74 MB | ONNX INT8 | ONNX Runtime, OpenVINO | Apache-2.0 |
| `tiny_voca_w8_kenosis.onnx` | 4,54 M | 7,73 MB | ONNX INT8 | ONNX Runtime, OpenVINO | Apache-2.0 |
| n4ze3m/tiny-voca (FP32) | 4,54 M | 21,39 MB | ONNX FP32 | ONNX Runtime, OpenVINO | Apache-2.0 |
| n4ze3m/tiny-voca `tiny-voca-q8_0.gguf` | 4,54 M | 10,86 MB | GGUF Q8_0 | llama.cpp (no confirmado) | Apache-2.0 |
| n4ze3m/tiny-voca `tiny-voca-q4_0.gguf` | 4,54 M | 8,70 MB | GGUF Q4_0 | llama.cpp (no confirmado) | Apache-2.0 |

No se dispone de datos de benchmarks comparativos con otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Solo dos voces (F2 y M2); no hay clonación de voz ni control de estilo.
- El grafo contiene una fuente de ruido `RandomNormalLike`, por lo que la salida varía ligeramente entre ejecuciones (±1 a 2 palabras en la transcripción de 68 clips).
- La variante `int8_kenosis` presenta un WER de 1,24 % en ONNX Runtime frente al 1,00 % del FP32; para paridad exacta debe usarse `w8_kenosis`.
- `quantize_static` de ONNX Runtime falló durante la calibración con error de escala, por lo que no se ofrece esa variante.
- No se documentan sesgos del modelo base ni comportamiento en dominios especializados (términos técnicos, nombres propios).
- Al ser un modelo de 4,54 M de parámetros, la naturalidad y prosodia son limitadas en comparación con sistemas TTS de mayor tamano; no se aportan métricas MOS.
- El rendimiento medido depende de la CPU: en x86-64 sin VNNI el tiempo real cae a 21,6x con 4 hilos (frente a 108,9x con VNNI).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base n4ze3m/tiny-voca.

## Enlaces

- Hugging Face: https://huggingface.co/CoreEpoch/tiny-voca-int8-onnx
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Herramienta Kenosis: https://coreepoch.dev/kenosis/
- Frontend dizione: https://github.com/n4ze3m/dizione
