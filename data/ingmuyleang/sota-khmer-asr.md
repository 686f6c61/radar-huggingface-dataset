# INGMUYLEANG/sota-khmer-asr

## Resumen
Sota (សោតៈ, "oreja" en jemer) es un modelo de reconocimiento automatico del habla (ASR) para jemer, entrenado desde cero por el autor INGMUYLEANG y publicado en Hugging Face. No es un ajuste fino de un modelo existente: es un sistema completo de 26 millones de parametros con arquitectura Conformer y cabezas CTC mas decodificador atencional, disenado especificamente para transcribir audio en jemer con una huella de memoria muy reducida (unos 33 MB en formato int8 ONNX).

La relevancia del modelo radica en su eficiencia y en su orientacion a despliegue local: el front end log-Mel esta embebido dentro del propio ONNX, de modo que el fichero acepta audio crudo a 16 kHz y puede ejecutarse en CPU convencional o incluso en un navegador web mediante onnxruntime-web, sin enviar el audio a ningun servidor. El modelo declara un CER del 3,40 % con beam search de 5 haces sobre un conjunto de test de 12 horas con 16 hablantes no vistos, lo que lo situa por delante de alternativas mucho mayores como Qwen3-ASR-0.6B-Khmer (13,20 %) o whisper-small-khmer-v2 (18,57 %) en ese mismo conjunto.

Se trata, segun la propia model card, de un modelo de prueba temprana ("early test model"), optimo en habla clara en jemer, con comportamiento aun no medido en llamadas telefonicas, audio ruidoso o mezcla de jemer e ingles. Su licencia es `sota-preview` (licencia personalizada, no estandar), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (12 bloques, d_model 256, 4 cabezas con rotary position embeddings, FFN 1024, kernel convolucional 31) + cabeza CTC + decodificador atencional de 3 capas |
| Parametros totales | 26M (18,3M encoder + 1,8M subsampling + 0,9M CTC + 4,9M decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; el audio de mas de 15 s se divide automaticamente en puntos de silencio |
| Tipos de cuantizacion | int8 (ONNX, recomendado), fp32 (ONNX y PyTorch) |
| Idiomas soportados | jemer (km) e ingles (en); solo 4 clips del test contienen ingles, insuficiente para evaluar |
| Licencia | `sota-preview` (licencia personalizada, fichero LICENSE en el repo) |
| Formato de pesos | ONNX (int8 y fp32), safetensors (PyTorch fp32) |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura Conformer clasica orientada a ASR: entrada de audio a 16 kHz mono con front end log-Mel de 80 bins (ventana de 25 ms, salto de 10 ms) integrado en el propio modelo; dos convoluciones con stride 2 que reducen la resolucion temporal de 10 ms a 40 ms; un encoder de 12 bloques Conformer con d_model 256, 4 cabezas de atencion con rotary position embeddings, FFN de 1024 y kernel convolucional de 31; y dos cabezas, una CTC (0,9M) y un decodificador atencional de 3 capas (4,9M) preentrenado sobre texto jemer. El vocabulario consta de 3.402 tokens de cluster jemer (clusters escritos completos, compartidos con el modelo OCR Chakkhu), mas tokens especiales (pad, BOS, EOS, unk y blank CTC).

El entrenamiento se realizo sobre VoxPocket v5 (dataset privado): aproximadamente 237 horas de habla real en jemer mas unas 610 horas de habla sintetica generada con VoxPocket TTS; el habla real se uso siempre completa y la sintetica como maximo la mitad de cada epoch. La division se hizo por hablante, eliminando voces clonadas y frases repetidas en dev/test; dev 5,2 h (8 hablantes) y test 12,0 h (16 hablantes), solo habla real. Se aplicaron aumentaciones SpecAugment, variacion de velocidad (0,9/1,0/1,1), ruido de fondo (MUSAN), eco de sala y simulacion de llamada telefonica. La funcion de perdida combina 0,3 CTC + 0,7 entropia cruzada con label smoothing 0,1. El decodificador se preentreno con 315.000 frases jemer (10.000 pasos) y despues se entrenaron 100.000 pasos de habla con AdamW, 25.000 de warmup y bf16, en una unica RTX 3090 Ti durante unas 8 horas. Los pesos finales son la media de los ultimos 5 checkpoints (80k-100k pasos). La decodificacion usa un borrador rapido CTC greedy seguido de beam search de 5 haces puntuado por decodificador y CTC conjuntamente (0,7 decoder + 0,3 CTC), con guardas de longitud que recaen en el borrador CTC si el decodificador se desvia o se detiene pronto.

## Capacidades
- Transcripcion de voz a texto en jemer con alta precision declarada (CER 3,40 % con beam 5, 3,62 % con CTC greedy).
- Funcionamiento offline y en dispositivo: inferencia en CPU convencional o en navegador web con onnxruntime-web, sin envio de audio a servidores.
- Acepta audio crudo a 16 kHz mono; la log-Mel esta embebida en el ONNX.
- Remuestreo y division automatica de audio largo (mas de 15 s) en puntos de silencio.
- Dos modos de decodificacion: CTC greedy (rapido) y beam search de 5 haces con decodificador atencional (mayor precision).
- Modelo bilingue declarado (jemer e ingles), aunque la evaluacion en ingles es insuficiente (solo 4 clips).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No tiene vision, audio generativo ni modo thinking.

## Casos de uso
- Transcripcion de reuniones y entrevistas en jemer: el modelo trocea audio de mas de 15 s en silencios y transcribe con beam search, adecuado para generar actas en entornos de oficina con habla clara.
- Subtitulado de contenido audiovisual jemer: con una huella de 33 MB int8 y latencia de ~0,2 s por minuto de audio en CTC greedy, puede integrarse en pipelines de generacion de subtitulos sin GPU.
- Dictado en aplicaciones web: al ejecutarse con onnxruntime-web dentro del navegador y no salir el audio del dispositivo, es apto para herramientas de dictado con requisitos de privacidad.
- Digitalizacion de archivos orales y corpus linguisticos: su bajo coste de despliegue permite procesar grandes volumenes de audio jemer en CPU en servidores modestos.
- Asistentes de accesibilidad para hablantes de jemer: transcripcion en tiempo casi real en dispositivos de gama baja gracias al modo CTC greedy.
- Preprocesado para pipelines de PLN en jemer: conversion de audio a texto como paso previo a traduccion, busqueda o analisis, usando la salida del encoder y las probabilidades CTC.
- Prototipado e investigacion en ASR de lenguas de bajos recursos: al estar entrenado desde cero y publicar pesos PyTorch y ONNX, sirve como base reproducible para experimentos academicos.

## Benchmarks y rendimiento
Resultados declarados por el autor sobre el conjunto "Sota held-out test" (12,0 h, 6.513 clips, 16 hablantes no vistos), con normalizacion de jemer y eliminacion de espacios y puntuacion:

| Modelo | Tamano | Todos (6.513) | nxkmer (5.508) | OpenSLR42 (1.005) |
|---|---|---:|---:|---:|
| Sota (beam 5) | 26M · 33 MB int8 | 3,40 % | 3,25 % | 5,20 % |
| Sota (CTC greedy) | 26M | 3,62 % | 3,47 % | 5,54 % |
| Qwen3-ASR-0.6B-Khmer | 0,6B | 13,20 % | 13,34 % | 11,41 % |
| whisper-small-khmer-v2 | ~244M | 18,57 % | 19,72 % | 4,61 % (ver nota) |

Notas del autor: los hablantes de test son nuevos para Sota, pero las grabaciones provienen de las mismas fuentes y estilo que sus datos de entrenamiento, lo que favorece al modelo; whisper-small-khmer-v2 fue entrenado sobre OpenSLR42 y podria haber visto esas frases antes; parte de las diferencias se debe a estilo de ortografia; solo 4 clips contienen ingles; los ficheros ONNX int8 dan la misma precision que PyTorch (3,19 % vs 3,15 % CER con beam search sobre 300 clips). Velocidad: con int8 ONNX en CPU de portatil (4 hilos), 1 minuto de audio tarda unos 0,2 s (CTC greedy) o 1,5 s (beam 5).

## Requisitos de hardware
- VRAM estimada: no requiere GPU; el modelo int8 ocupa unos 33 MB (encoder 25 MB + decoder 8 MB) y puede ejecutarse en CPU.
- GPU recomendadas: innecesarias para inferencia; el entrenamiento se realizo en una RTX 3090 Ti durante unas 8 horas.
- Cabe en cualquier GPU consumer e incluso en CPU de gama baja y en navegador (onnxruntime-web).
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), pesos PyTorch fp32 via safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo ASR).
- Latencia y throughput: ~0,2 s por minuto de audio con CTC greedy y ~1,5 s con beam 5 en CPU de portatil a 4 hilos (int8 ONNX).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | CER (test Sota) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sota | 26M | Audio 16 kHz, troceo >15 s | 3,40 % (beam 5) | sota-preview (personalizada) | ONNX int8/fp32 + safetensors |
| Qwen3-ASR-0.6B-Khmer | 0,6B | no disponible | 13,20 % | no disponible en la informacion | Hugging Face |
| whisper-small-khmer-v2 | ~244M | no disponible | 18,57 % (4,61 % en OpenSLR42) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias
- Modelo de prueba temprana: optimo en habla clara en jemer; llamadas telefonicas, audio ruidoso y mezcla jemer-ingles no han sido medidos.
- El conjunto de test comparte fuentes y estilo con los datos de entrenamiento, lo que puede inflar la ventaja frente a otros modelos.
- Diferencias de ortografia entre sistemas pueden afectar al CER (por ejemplo, ហ្នឹង frente a នឹង); Sota aprendio la ortografia de sus propias etiquetas.
- Evaluacion en ingles insuficiente (solo 4 clips), por lo que el soporte bilingue no esta verificado.
- Riesgo de alucinacion del decodificador atencional en beam search, mitigado parcialmente por guardas de longitud que recaen en el borrador CTC.
- Licencia `sota-preview` personalizada: deben revisarse las condiciones del fichero LICENSE antes de cualquier uso comercial; no es una licencia de codigo abierto estandar.
- Dataset de entrenamiento privado (VoxPocket v5), lo que limita la reproducibilidad completa del entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/sota-khmer-asr
- Demo en navegador: https://muyleanging.github.io/sota-web/#try
- Space de Hugging Face: https://huggingface.co/spaces/INGMUYLEANG/sota-khmer-asr
- Sitio web del proyecto: https://muyleanging.github.io/sota-web/
- Modelo OCR Chakkhu (vocabulario compartido): https://muyleanging.github.io/chakkhu-web/
- Qwen3-ASR-0.6B-Khmer (comparativa): https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- whisper-small-khmer-v2 (comparativa): https://huggingface.co/seanghay/whisper-small-khmer-v2
