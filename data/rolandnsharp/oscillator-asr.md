# rolandnsharp/oscillator-asr

## Resumen

Oscillator-asr es un reconocedor de voz en ingles de 10,4 millones de parametros desarrollado por Roland Sharp (usuario rolandnsharp), distribuido como un unico archivo C sin dependencias externas. El modelo transcribe audio en streaming mientras el usuario habla, emitiendo texto cada 320 ms en lugar de esperar al final de la locucion, y esta disenado para ejecutarse mas rapido que tiempo real en un unico nucleo ARM lento, concretamente en la ClockworkPi uConsole (Rockchip RK3399).

La propuesta no es competir en precision con Whisper o sistemas de produccion, sino demostrar una arquitectura alternativa de bajo coste: un banco de 64 osciladores complejos amortiguados como front-end (sin FFT ni convolucion) y seis bloques recurrentes de polos complejos con MLP con compuertas como backbone, sin atencion. Esto implica que el coste y la memoria por segundo de audio son constantes, lo que habilita inferencia verdaderamente streaming en dispositivos de borde.

Es relevante ahora por dos motivos: ofrece un punto de referencia reproducible para ASR de borde con un factor de tiempo real de 0,16 en un nucleo A72 a 1,8 GHz, y documenta publicamente todos los experimentos previos, incluidos los fallidos, con predicciones registradas antes de cada ejecucion. La licencia MIT y el formato de un solo archivo C facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space recurrente sin atencion: banco de 64 osciladores complejos amortiguados (front-end) + 6 bloques recurrentes de polos complejos con MLP con compuertas; CTC sobre caracteres |
| Parametros totales | 10,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; estado fijo, coste constante por segundo de audio (bloques a 50 Hz con tiempos de decaimiento aprendidos de menos de un frame a unos 8 s) |
| Tipos de cuantizacion | int8 (programa C con kernels NEON); pesos PyTorch en params.pt sin cuantizar |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | model.bin (formato propio del programa C), params.pt (PyTorch); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El front-end es un banco de 64 osciladores complejos amortiguados que operan a la frecuencia de muestreo de 16 kHz, con la recursion z_t = c z_(t-1) + x_t y c = exp(-dt/tau + 2 pi i f dt). Las frecuencias y los tiempos de decaimiento se aprenden; no hay FFT ni convolucion. Cada 20 ms el estado del banco (parte real, imaginaria y energia) constituye el vector de caracteristicas. El backbone son seis bloques recurrentes de polos complejos a 50 Hz, con tiempos de decaimiento aprendidos desde menos de un frame hasta unos 8 s, cada uno seguido de un MLP con compuertas de anchura 672 sobre un ancho de bloque de 448. Al no haber atencion, el estado es de tamano fijo y el coste y la memoria por segundo de audio son constantes, lo que permite emitir salida a medida que llega el audio.

La decodificacion es CTC sobre caracteres con decodificacion voraz durante el habla y re-decodificacion en cada pausa mediante busqueda de prefijos en haz con un 3-grama de palabras (anchura 64), ambos implementados en el mismo archivo C. El entrenamiento uso LibriSpeech de 960 h (train-clean-100, -360 y -other-500), audio de 16 kHz en mu-law, durante 150.000 actualizaciones con lotes de 240 s (aproximadamente 11,3 pasadas), en una unica NVIDIA RTX 3090 durante unas 28 horas (coste aproximado de 7 dolares). El optimizador fue Muon para las matrices de los bloques (momento de Nesterov, actualizaciones ortogonalizadas con Newton-Schulz) y AdamW para el resto, con learning rate pico de 3e-3, 200 actualizaciones de warmup y decaimiento coseno hasta el 10 %. Los pesos del modelo de lenguaje por defecto (alpha 0,7 y beta 1,0, usados por dictate.sh) se eligieron sobre dev-clean.

## Capacidades

- Reconocimiento de voz en streaming en ingles: transcripcion incremental con emision de texto cada 320 ms mientras se habla.
- Re-decodificacion con modelo de lenguaje en cada pausa, usando busqueda de prefijos en haz con 3-grama de palabras.
- Inferencia en tiempo real en hardware de borde: factor de tiempo real de 0,16 en un nucleo Cortex-A72 a 1,8 GHz y 0,35 en un A53 a 1,4 GHz, incluyendo carga de modelo y LM.
- Ejecucion desde un unico archivo C sin dependencias, con kernels int8 NEON.
- Soporte de entrada por microfono en vivo (modo --stream con arecord) y de archivos WAV mono de 16 kHz.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento; es exclusivamente un ASR CTC.

## Casos de uso

- Dictado en dispositivos portatiles: el modelo transcribe en vivo en la uConsole con dictate.sh, aprovechando la emision cada 320 ms y el bajo coste computacional en un solo nucleo ARM.
- Subtitulado en tiempo real de bajo consumo: integrado en un pipeline que captura audio de 16 kHz mono y muestra texto incremental, adecuado por su factor de tiempo real de 0,16-0,35 frente a whisper.cpp tiny.en (2,26-4,49).
- Aplicaciones empotradas sin sistema operativo completo: al compilarse con cc -O3 desde un unico archivo C, puede incorporarse en firmware o utilidades CLI sin gestionar dependencias.
- Investigacion sobre arquitecturas state-space para ASR: sirve como referencia reproducible (codigo de entrenamiento en zara_stt.py y zara_block.py) para comparar frentes de osciladores con enfoques convolucionales o basados en atencion.
- Prototipado rapido de reconocedores especificos de dominio: reentrenando sobre un corpus propio (el pipeline incluye pack_libri.py y export_c.py), se puede adaptar el vocabulario y el 3-grama a jerga tecnica.
- Evaluacion de eficiencia en hardware restringido: util para medir latencia y throughput de ASR en placas como RK3399 antes de comprometerse con modelos mayores.
- Transcripcion por lotes de audio limpio en ingles: con decodificacion + LM alcanza 9,1 % de WER en test-clean, suficiente para dictado sobre voz leida limpia.

## Benchmarks y rendimiento

LibriSpeech, word error rate (menor es mejor), sobre las 2.620 y 2.939 utterances de test. "LM" indica busqueda en haz (anchura 64) con el 3-grama podado de LibriSpeech (OpenSLR 11) ejecutada por el programa C int8; las columnas voraces corresponden al modelo PyTorch, y el programa C int8 obtiene 16,9 % voraz en test-clean.

| Modelo | Parametros | test-clean voraz | test-other voraz | test-clean + LM |
|---|---|---|---|---|
| **este modelo** | 10,4 M | 16,8 % | 37,9 % | **9,1 %** |
| round 3 (anterior) | 5,8 M | 38,6 % | 62,1 % | 19,4 % |

Velocidad en la uConsole (nucleo ClockworkPi A06, Rockchip RK3399), un solo nucleo, factor de tiempo real = segundos de computo por segundo de audio (menor es mas rapido), 87 s de audio de test, incluyendo carga de modelo y LM:

| Reconocedor | Streaming | A72 1,8 GHz | A53 1,4 GHz | WER en estas 12 utterances |
|---|---|---|---|---|
| **este modelo**, int8 + 3-grama | si, 320 ms | **0,16** | **0,35** | 7,7 % |
| sherpa-onnx streaming Zipformer 20M, int8 | si | 0,21 | 0,48 | 8,6 % (sin LM) |
| whisper.cpp tiny.en | no (ventana de 30 s) | 2,26 (1 hilo) | 4,49 (1 hilo) | 5,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo pesa 10,4 M parametros y el repo ocupa 0,1 GB, por lo que cabe holgadamente en memoria de dispositivos de borde (el despliegue de referencia es una CPU ARM con int8).
- GPU recomendadas: no se requieren GPU para inferencia; el entrenamiento se realizo en una unica NVIDIA RTX 3090.
- Cabe en GPU de consumo: si, con margen amplio, aunque el diseno apunta a CPU ARM; en una RTX 4090 o similar el cuello de botella seria el codigo C de un solo hilo, no la memoria.
- Opciones de despliegue: compilacion directa del archivo C (cc -O3 -ffast-math -fno-finite-math-only -o zara_stt zara_stt.c -lm) con los flags --int8 y --lm; modo --stream con arecord para microfono en vivo. No hay integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: emision cada 320 ms; factor de tiempo real de 0,16 en Cortex-A72 a 1,8 GHz y 0,35 en A53 a 1,4 GHz (87 s de audio, carga incluida). Frente a whisper.cpp tiny.en, entre 13 y 14 veces mas rapido en A72.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER test-clean | Licencia | Despliegue |
|---|---|---|---|---|---|
| **oscillator-asr** | 10,4 M | estado fijo, streaming cada 320 ms | 16,8 % voraz / 9,1 % + LM | MIT | un archivo C, int8 NEON, CPU ARM |
| sherpa-onnx streaming Zipformer | 20 M | streaming | no disponible (8,6 % sin LM en 12 utterances) | no disponible | sherpa-onnx, int8 |
| whisper.cpp tiny.en | 39 M | no streaming (ventana de 30 s) | 5,0 % en 12 utterances | MIT (Whisper) | whisper.cpp, CPU |
| round 3 (modelo anterior del mismo autor) | 5,8 M | no disponible | 38,6 % voraz / 19,4 % + LM | no disponible | PyTorch / C |

## Limitaciones y advertencias

- Solo ingles y voz leida: acentos y microfonos distintos de LibriSpeech degradan la precision de forma notable.
- Sin puntuacion ni mayusculas en la salida.
- El 3-grama se construyo a partir de libros de dominio publico, por lo que palabras modernas y tecnicas se reconocen mal con frecuencia.
- Precision muy por debajo de Whisper y de sistemas de produccion: 16,8 % de WER voraz en test-clean frente a 5,0 % de whisper.cpp tiny.en en la muestra de 12 utterances.
- Riesgo de alucinacion y errores de sustitucion derivados del LM y del CTC; no hay mecanismo de confianza ni de correccion.
- El modelo es de investigacion y el autor lo presenta explicitamente como tal; no esta pensado para produccion sin validacion en el dominio objetivo.
- La licencia MIT permite uso comercial, pero la calidad en condiciones reales (ruido, acentos, vocabulario tecnico) hace desaconsejable su uso en produccion sin reentrenamiento o adaptacion del LM.
- Dependencia de audio de entrada a 16 kHz mono; en la uConsole el codec entrega el microfono como canal izquierdo menos derecho, lo que requiere dictate.sh.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rolandnsharp/oscillator-asr
- Registro de experimentos (EXP-0049): https://experiments.blah.dev/EXP-0049
- Dataset LibriSpeech (OpenSLR 12): https://www.openslr.org/12
- 3-grama y vocabulario de LibriSpeech (OpenSLR 11): https://www.openslr.org/11
- Paper Muon (Jordan et al., 2024): no disponible enlace directo en la informacion proporcionada
- Paper "Muon is Scalable for LLM Training" (Liu et al., 2025): no disponible enlace directo en la informacion proporcionada
- Paper LibriSpeech (Panayotov et al., 2015): no disponible enlace directo en la informacion proporcionada
- Repositorio de codigo: no disponible; el codigo se distribuye como archivos dentro del repo de Hugging Face
