# Raymxnd/Whisper-Vad-EncDec-ASMR-torch

## Resumen

Whisper-Vad-EncDec-ASMR-torch es un modelo de detección de actividad de voz (VAD) publicado por el usuario Raymxnd como conversión de formato del modelo TransWithAI/Whisper-Vad-EncDec-ASMR-onnx. No es un reentrenamiento: se trata del mismo modelo de 29.767.169 parámetros en fp32, con el mismo front-end mel y la misma arquitectura, pero exportado como `state_dict` de PyTorch en safetensors en lugar de ONNX. Su propósito es permitir ejecutar el VAD en GPU dentro de un stack PyTorch ya existente, sin tener que instalar y compatibilizar `onnxruntime-gpu` (que exige cuDNN 9 frente al cuDNN 8.8 que acompaña a torch 2.2.x) ni degradar la inferencia a CPU.

El modelo está especializado en habla susurrada y contenido ASMR, con etiquetas de idioma japonés y multilingüe. La arquitectura combina un codificador con la geometría de whisper-base (fine-tuned, sin reutilizar sus pesos) y un decodificador de 2 capas `nn.TransformerDecoderLayer` con post-norm y feed-forward ReLU. La entrada es audio mono a 16 kHz en punto flotante y la salida son logits por trama, uno cada 20 ms, con procesamiento en fragmentos de 30 segundos (1500 tramas por chunk).

Su relevancia es fundamentalmente práctica: el autor documenta una mejora de 10,7× en la etapa de VAD (de 88,6 s a 8,3 s sobre 6130 s de audio) simplemente eliminando la dependencia de ONNX, y demuestra paridad bit a bit con el backend original en 830 de 830 intervalos, 1660 de 1660 fronteras y 559 de 559 ventanas de ASR posteriores. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador con geometría de whisper-base (pesos propios, no los de `openai/whisper-base`) + decodificador de 2 × `nn.TransformerDecoderLayer`, post-norm, feed-forward ReLU; `frame_pos_embed` sumado a la salida del codificador como entrada del decodificador |
| Parámetros totales | 29.767.169 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de 30 s de audio por chunk (1500 tramas de 20 ms); el runner encadena chunks y fusiona fronteras |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados); el autor documenta ejecución en fp32 con TF32 desactivado y en fp16 |
| Idiomas soportados | japonés (ja) y multilingüe, según las etiquetas del repositorio. El modelo opera sobre audio; no depende de un vocabulario de texto |
| Licencia | MIT |
| Formato de pesos | safetensors (state_dict de PyTorch, `nn.Module` plano); el modelo base upstream se distribuye únicamente en ONNX |
| Tarea (pipeline) | voice-activity-detection |
| Entrada | audio mono, 16 kHz, float; el preprocesado no lo realiza el repositorio |
| Salida | logits por trama con forma `[N, 1500]` (un logit cada 20 ms) o intervalos de habla `(start, end)` vía `speech_intervals` |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | TransWithAI/Whisper-Vad-EncDec-ASMR-onnx |
| Autor | Raymxnd |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como leída directamente del grafo ONNX, no inferida. El codificador emplea la geometría de whisper-base pero con pesos entrenados específicamente para esta tarea: sustituir el codificador por `openai/whisper-base` «funciona y produce intervalos plausibles pero incorrectos», y solo el front-end mel procede de `openai/whisper-base`. El decodificador son 2 capas `nn.TransformerDecoderLayer` con post-norm y activación ReLU en el feed-forward (no GELU). La `frame_pos_embed` se suma a la salida del codificador para formar la entrada del decodificador. La model card proporcionada está truncada en la descripción del decodificador, por lo que no se dispone del detalle completo de esa parte del grafo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documenta el proceso de entrenamiento del modelo original (TransWithAI/Whisper-Vad-EncDec-ASMR-onnx) más allá de su existencia. La innovación destacable de esta publicación no es arquitectónica sino de ingeniería: la conversión a PyTorch elimina la dependencia de `onnxruntime-gpu`, permite tamaños de batch arbitrarios (la exportación ONNX estaba fijada a batch 1, obligando a paralelizar por hilos) y mantiene paridad numérica exacta con el backend original.

## Capacidades

- Detección de actividad de voz a nivel de trama, con un logit por cada 20 ms de audio (1500 logits por fragmento de 30 s).
- Segmentación en intervalos de habla: el método `speech_intervals` gestiona el troceado en bloques de 30 s, la aplicación de umbral y la fusión de fronteras entre chunks.
- Detección específica sobre habla susurrada y contenido ASMR, que es el dominio declarado del modelo.
- Procesamiento multilingüe y en japonés según las etiquetas del repositorio (la tarea es acústica, no lingüística).
- Inferencia por lotes (`runner.logits(chunks)` acepta una lista de arrays de 30 s), lo que permite paralelizar en GPU.
- Generación de subtítulos WebVTT de las regiones de habla detectadas mediante el script `example.py` incluido en el repositorio.
- Ejecución en CPU o GPU: fp32 con TF32 desactivado, fp16 o el backend ONNX original.
- No soporta tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: no es un modelo generativo de texto.
- No dispone de modo «thinking», visión, audio de salida ni ninguna otra modalidad adicional.

## Casos de uso

- Segmentación previa a un pipeline de ASR: el modelo recorta el audio a las regiones con voz antes de enviarlas a un sistema de transcripción, reduciendo el cómputo y el coste de APIs de ASR al eliminar silencios y ruido de fondo.
- Subtitulado automático de contenido ASMR o susurrado: con `example.py` se genera un archivo `.vtt` con las regiones de habla detectadas, que después se transcriben y alinean.
- Preprocesado de corpus para entrenamiento de ASR o TTS: filtrar automáticamente horas de grabaciones para quedarse solo con los tramos con habla y descartar los vacíos.
- Análisis de grabaciones largas mono o estéreo: el modelo procesa por chunks de 30 s con fusión de fronteras, lo que permite tratar archivos de horas sin cargarlos completos en memoria.
- Detección de actividad en llamadas o reuniones para métricas de participación: el número y la duración de los intervalos detectados sirven como señal objetiva de tiempo de habla.
- Reducción de coste en producción con GPU: al poder usar lotes arbitrarios, un mismo dispositivo puede procesar varios flujos de audio en paralelo, con un rendimiento medido de 742× tiempo real en fp32 y 1572× en fp16 sobre una RTX 3070 Laptop.
- Integración en pipelines de vídeo o pódcast japoneses: la etiqueta `ja` del repositorio indica que el modelo se ha trabajado sobre material en japonés, lo que resulta adecuado para catálogos de contenido nipón.
- Sustitución directa del backend ONNX en infraestructuras ya basadas en PyTorch, sin tocar el resto del código: la paridad documentada (830/830 intervalos, 1660/1660 fronteras, 559/559 ventanas de ASR) permite un reemplazo con validación numérica estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible; estos benchmarks no son aplicables a un modelo de detección de actividad de voz. El autor sí publica mediciones propias de rendimiento y de paridad numérica frente al backend ONNX de referencia.

Rendimiento de la etapa de VAD sobre 6130 s de audio, medido en una RTX 3070 Laptop:

| Backend | Etapa VAD | Respecto a tiempo real |
|---|---|---|
| ONNX, CPU, 4 hilos | 88,6 s | 69× |
| torch, CUDA, fp32, batch 8 | 8,3 s | 742× |
| torch, CUDA, fp16, batch 8 | 3,9 s | 1572× |

Paridad con el backend ONNX sobre un conjunto de referencia de 102 minutos y 7 pistas:

| Métrica | Resultado |
|---|---|
| Intervalos coincidentes | 830 / 830 |
| Fronteras idénticas bit a bit | 1660 / 1660 |
| Ventanas de ASR posteriores sin cambios | 559 / 559 |

Precisión numérica y su efecto aguas abajo:

| Configuración | Intervalos | Fronteras exactas | Peor frontera | Ventanas de ASR desplazadas |
|---|---|---|---|---|
| fp32, TF32 desactivado | 830 / 830 | 1660 / 1660 (100 %) | 0,000 s | 0 de 559 |
| fp16 | 830 / 830 | 1648 / 1660 (99,3 %) | 0,220 s | 8 de 559 |

El autor advierte que el recuento de intervalos no discrimina entre configuraciones (todas reproducen 830/830) y que la columna relevante es la de ventanas de ASR desplazadas: un desplazamiento de 0,220 s en una frontera puede cambiar una decisión de partición en ventanas de 10 s y entregar ~1,6 s de audio a una ventana de ASR distinta. fp16 es 2,1× más rápido y se considera un compromiso razonable solo si nada aguas abajo es sensible a esa variación.

## Requisitos de hardware

- Peso del checkpoint: aproximadamente 114 MiB en fp32 y 57 MiB en fp16, calculado a partir de los 29.767.169 parámetros. El autor no publica una medición de VRAM total, que dependerá del tamaño de lote y de las activaciones.
- GPU recomendadas: cualquier GPU con CUDA funcional en el entorno de PyTorch; el autor ha medido el rendimiento en una RTX 3070 Laptop. No se documentan pruebas en A100, H100 ni otras GPU de centro de datos.
- Cabe holgadamente en GPU de consumo: con ~114 MiB de pesos en fp32, el modelo es apto para prácticamente cualquier GPU consumer con soporte CUDA.
- CPU: posible, pero es el caso lento documentado (88,6 s para 6130 s de audio con el backend ONNX y 4 hilos).
- Opciones de despliegue: PyTorch con CUDA y el módulo `vad_torch.py` incluido en el repositorio (`TorchVadRunner`); el modelo es un `nn.Module` plano, no un `AutoModel`, por lo que no existe ruta `trust_remote_code`. El modelo upstream se ejecuta con `onnxruntime` (CPU o GPU). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos generativos de texto.
- Requisitos de software: `torch`, `transformers`, `safetensors`, `numpy`; `librosa` en los ejemplos de carga de audio.
- Latencia y throughput medidos (RTX 3070 Laptop, 6130 s de audio): 8,3 s en fp32 batch 8 (742× tiempo real) y 3,9 s en fp16 batch 8 (1572× tiempo real).
- El rendimiento se degrada si no se desactiva TF32 al usar fp32: el autor indica que `load_vad` lo desactiva y que no se observó coste de velocidad al hacerlo.

## Comparativa con modelos similares

El único comparable con datos en la información disponible es el modelo upstream del que deriva esta conversión:

| Modelo | Formato | Parámetros | Rendimiento VAD medido | Paralelismo | Licencia |
|---|---|---|---|---|---|
| Raymxnd/Whisper-Vad-EncDec-ASMR-torch | safetensors (PyTorch) | 29,77 M | 8,3 s fp32 / 3,9 s fp16 (GPU) | cualquier batch | MIT |
| TransWithAI/Whisper-Vad-EncDec-ASMR-onnx | ONNX | 29,77 M | 88,6 s (CPU, 4 hilos) | fijado a batch 1 | no disponible |

Ambos modelos son numéricamente equivalentes en la salida (paridad documentada). Otros detectores de actividad de voz como Silero VAD, pyannote VAD u otros VAD basados en Whisper no aparecen descritos en la información proporcionada, por lo que no se dispone de datos comparativos de parámetros, contexto, rendimiento o licencia para ellos.

## Limitaciones y advertencias

- No es un modelo generativo de texto: no transcribe, no responde a instrucciones y no soporta tool calling ni razonamiento multi-paso.
- Dominio restringido a habla susurrada y ASMR según su diseño y etiquetas. No se documenta su comportamiento en otros dominios acústicos.
- El preprocesado corre a cargo del usuario. El repositorio no remuestrea, normaliza ni mezcla canales. El propio autor demuestra que la mezcla mono cambia el resultado: con `librosa.load(mono=True)` se obtienen 71 regiones de habla frente a 70 con el preprocesado de `parity.md`, con el mismo modelo, los mismos pesos y el mismo umbral.
- Riesgo específico con fuentes estéreo o binaurales: una media L/R ingenua puede cancelar contenido en oposición de fase. La correlación por pista del conjunto de referencia oscila entre 0,05 y 0,78, y la mezcla adecuada no es la misma en ambos extremos.
- fp16 no es numéricamente idéntico al backend de referencia: desplaza 8 de 559 ventanas de ASR aguas abajo y su peor frontera se desvía 0,220 s. Debe validarse contra el pipeline concreto antes de adoptarlo en producción.
- En fp32 es obligatorio desactivar TF32 para alcanzar la paridad exacta; en tarjetas Ampere y posteriores, TF32 se activa de forma silenciosa y reduce la mantisa a 10 bits.
- No se han publicado benchmarks estándar ni comparativas con otras soluciones de VAD en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que implica ausencia de validación independiente por parte de terceros más allá de las mediciones del propio autor.
- La licencia es MIT, lo que permite uso comercial y modificación, pero la licencia y las condiciones del modelo base upstream (TransWithAI/Whisper-Vad-EncDec-ASMR-onnx) no se detallan en la información disponible y conviene verificarlas antes de un uso comercial.
- No se dispone de información sobre sesgos del modelo, composición del dataset de entrenamiento ni evaluación en idiomas distintos del japonés, pese a la etiqueta multilingüe.
- La arquitectura del decodificador se describe de forma parcial en la model card proporcionada, que aparece truncada, por lo que no puede verificarse la totalidad del grafo a partir de esta información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raymxnd/Whisper-Vad-EncDec-ASMR-torch
- Modelo base (ONNX): https://huggingface.co/TransWithAI/Whisper-Vad-EncDec-ASMR-onnx
- Repositorio de entrenamiento del modelo original: https://github.com/TransWithAI/whisper-vad
- Evidencia de paridad con el backend ONNX: https://huggingface.co/Raymxnd/Whisper-Vad-EncDec-ASMR-torch/blob/main/parity.md
- Ejemplo ejecutable (genera un `.vtt`): https://huggingface.co/Raymxnd/Whisper-Vad-EncDec-ASMR-torch/blob/main/example.py
- Módulo de inferencia: https://huggingface.co/Raymxnd/Whisper-Vad-EncDec-ASMR-torch/blob/main/vad_torch.py
- Paper de referencia etiquetado en el repositorio (Whisper): https://arxiv.org/abs/2212.04356
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos correspondían a SoundCloud y no guardan relación con el contenido de esta ficha.
