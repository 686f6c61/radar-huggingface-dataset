# autotrust/TTS-V5

## Resumen

TTS-V5 es un modelo de síntesis de voz (text-to-speech) en chino, resultado de un ajuste fino experimental sobre el modelo base FunAudioLLM/Fun-CosyVoice3-0.5B-2512. Lo desarrolla el usuario autotrust y está orientado a un caso de uso muy concreto: la locución automática de llamadas de atención al cliente y cobros bancarios. El modelo hereda la arquitectura CosyVoice3 (modelo de lenguaje de tokens de voz más un módulo flow matching y un vocoder neuronal) con 0,5 mil millones de parámetros en el modelo base, y añade adaptadores LoRA fusionados en el checkpoint final.

El problema que aborda es la adaptación de un TTS zero-shot multilingüe a un dominio estrecho (guiones de call center en mandarín) con seis voces predefinidas (ventas y servicio, masculinas y femeninas, más dos de cobro bancario) y soporte de streaming de audio y de texto incremental. Incorpora instrucciones nativas de tono y velocidad, además de un post-procesado WSOLA para control exacto de la velocidad.

Es relevante ahora porque demuestra un flujo completo de ajuste fino de bajo coste (menos de cuatro minutos de cómputo en una H200 para el bucle de entrenamiento y la fusión) sobre un TTS open source, con streaming bidireccional texto/audio medido empíricamente (primer paquete de audio a 2,37 s con entrada de 30 caracteres por segundo). No obstante, es un artefacto experimental, con licencia de componentes mixtos, sin benchmarks públicos y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice3: modelo de lenguaje autorregresivo de tokens de voz + flow matching + vocoder neuronal (hereda la del modelo base) |
| Parametros totales | 0,5 mil millones (modelo base Fun-CosyVoice3-0.5B-2512); parámetros entrenables del ajuste: 2.260.808 (LM) + 1.376.256 (flow) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio de 3 a 12 s recomendada, máximo 30 s) |
| Tipos de cuantizacion | no disponible (el repo incluye ONNX y safetensors; no se documentan cuantizaciones GGUF ni INT8/INT4) |
| Idiomas soportados | chino (zh) |
| Licencia | other / mixed-components (archivo LICENSE.md en el repo) |
| Formato de pesos | safetensors y ONNX (llm.pt, flow.pt, vocoder y extractor de tokens incluidos en el repo) |

## Arquitectura y entrenamiento

El modelo reutiliza la pila CosyVoice3 del modelo base: un modelo de lenguaje que genera tokens de voz condicionado por texto y por una referencia de audio (clonación zero-shot), un módulo de flow matching que convierte esos tokens en mel-espectrogramas y un vocoder que sintetiza la forma de onda a 24 kHz mono. El ajuste fino se aplicó únicamente a las 12 últimas capas del LM y a la cabeza de salida de voz (LoRA rank 8, alpha 16, 800 pasos, batch 4, LR pico 8e-5) y a las 8 últimas capas del flow (LoRA rank 8, alpha 16, 400 pasos, LR pico 3e-5). El vocoder y el extractor de tokens se mantienen congelados.

Los datos de entrenamiento no se detallan en número de horas ni de tokens; la model card indica que se usó la construcción de secuencias del upstream (mitad de fragmentos simples, mitad de pares referencia-mismo-llamada, con etiquetas de referencia excluidas de la pérdida) y que el 35 % de los fragmentos elegibles de las seis voces usan una referencia fija. La función de pérdida del LM combina entropía cruzada de tokens de voz con un término KL (peso 1,0) contra el modelo base congelado; la del flow combina flow matching con un MSE (peso 0,5) contra las predicciones iniciales. En validación, la CE del LM bajó de 4,378 a 4,122 y la pérdida del flow de 0,945 a 0,896; son métricas de entrenamiento, no evaluaciones perceptivas. El bucle de entrenamiento y la fusión de pesos consumieron unos 82 s en una H200, más 109 s de codificación de características nuevas.

## Capacidades

- Síntesis de voz en mandarín con seis voces predefinidas: sales_female, sales_male, service_female, service_male, bank_collection_female y bank_collection_male.
- Clonación de voz zero-shot mediante referencia de audio (ref_audio) y transcripción de la referencia (ref_text); se recomienda entre 3 y 12 s de audio, con máximo de 30 s.
- Streaming de audio: genera y entrega fragmentos PCM float32 a 24 kHz mientras sintetiza la frase completa.
- Streaming bidireccional texto/audio: acepta texto incremental (por ejemplo, 30 caracteres por segundo) y normaliza en puntuación para no leer mal cadenas numéricas incompletas.
- Instrucciones nativas de estilo (--instruct) para modular tono y velocidad de forma cualitativa, no como multiplicador exacto.
- Control numérico de velocidad mediante post-procesado WSOLA (--speed), con rango 0,5–2,0 y recomendación de 0,8–1,3.
- Salida WAV mono a 24 kHz.
- No incluye ASR, VAD, detección de interrupciones ni cancelación de generación; no es un sistema de diálogo full-duplex.

## Casos de uso

- Locución de avisos de atención al cliente: el modelo sintetiza guiones largos con las voces service_female o service_male y mantiene coherencia de timbre en toda la llamada gracias a la referencia fija; el streaming de audio permite empezar a reproducir antes de terminar la frase.
- Cobro bancario automatizado: las voces bank_collection_female y bank_collection_male están ajustadas para este dominio; el control de velocidad (--speed 0,9) ayuda a modular el ritmo en mensajes sensibles.
- Integración con un LLM en pipelines de voz: el modo de texto incremental acepta la salida token a token de un LLM y normaliza en puntuación, lo que evita leer cifras incompletas y permite encadenar generación de texto y voz en tiempo casi real.
- Pruebas A/B de voces y estilos: las seis voces y las instrucciones de tono permiten generar variantes de un mismo guion para evaluar preferencia antes de fijar la locución de producción.
- Prototipado de asistentes telefónicos: con ref_audio y ref_text se puede clonar una voz corporativa concreta a partir de 3–12 s de grabación limpia, útil para maquetas y demos internas.
- Generación de material de formación y demos: el paquete de escucha (TTS-V5-listening.zip, unos 58 MiB) y los ejemplos de demos/ permiten evaluar la calidad sin descargar los 6,2 GB del repositorio completo.
- Investigación sobre ajuste fino de TTS: los scripts download_base.py, prepare_data.py, train_v5.py y export_v5.py documentan un flujo reproducible de LoRA sobre CosyVoice3 con validación de alineamiento de etiquetas y de equivalencia de pesos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, WER sobre conjuntos públicos, MMLU u otros) en la información disponible. Los únicos datos medidos por el autor son:

| Metrica | Valor | Contexto |
|---|---|---|
| CE del LM en dev (48 segmentos) | 4,378 → 4,122 | Antes/después del ajuste |
| Pérdida del flow en dev (24 segmentos) | 0,945 → 0,896 | Antes/después del ajuste |
| Primer paquete de audio | ~2,37 s | Entrada incremental a 30 caracteres/s, guion largo V1 |
| Errores ASR en salida incremental | 0/180 caracteres | Salida incremental y a velocidad 0,9 |
| Tiempo de entrenamiento y fusión | ~82 s | Una H200, sin instalación ni evaluación |
| Tiempo de codificación de características | ~109 s | Una H200 |

Estos valores son métricas de validación de entrenamiento y medidas puntuales del autor; no equivalen a evaluaciones perceptivas ni a comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,5 mil millones de parámetros en el LM y módulos flow y vocoder adicionales, el repo completo ocupa 6,2 GB en disco. Una GPU con 8–12 GB de VRAM debería ser suficiente para inferencia en fp32/fp16, aunque el autor no publica la cifra exacta.
- GPU recomendadas: el autor solo documenta entrenamiento en una NVIDIA H200; para inferencia no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño (0,5 B de parámetros) es plausible en tarjetas de 8 GB o más, pero no hay medición publicada.
- Opciones de despliegue: el repo incluye su propio entrypoint de Python (synthesize.py, inference.TTSV5) y requiere PyTorch con CUDA y torchaudio compatibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el pipeline es text-to-speech con pesos safetensors y ONNX, no un LLM de texto estándar.
- Latencia y throughput: primer paquete de audio de ~2,37 s con entrada incremental a 30 caracteres/s; no se publican RTF ni throughput sostenido más allá de lo que expone tts.stats en tiempo de ejecución.
- Requisito crítico de entorno: Transformers 4.51.3 fijo; con 4.57.3 el modelo base produjo lecturas erróneas y paradas prematuras en la decodificación en caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / referencia | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TTS-V5 (autotrust) | 0,5 B (base) | Referencia de audio de 3–30 s | zh | other / mixed-components | Hugging Face, 0 descargas, experimental |
| Fun-CosyVoice3-0.5B-2512 (FunAudioLLM) | 0,5 B | Referencia de audio zero-shot | Multilingüe (según modelo base) | no disponible en esta ficha | Hugging Face, modelo base |
| CosyVoice 2 (FunAudioLLM) | no disponible | no disponible | Multilingüe | no disponible en esta ficha | Hugging Face |
| Otros TTS open source en chino (p. ej. variantes de CosyVoice o Fish Speech) | no disponible | no disponible | zh / multilingüe | variable | Hugging Face / GitHub |

La comparación cuantitativa con alternativas no está disponible: el autor no publica MOS, WER ni comparaciones directas, y esta ficha no dispone de datos verificados de los modelos competidores en la información suministrada.

## Limitaciones y advertencias

- Modelo experimental y de dominio estrecho: ajustado para guiones de call center en chino; no se ha evaluado su comportamiento fuera de ese registro.
- Solo soporta chino (zh); no hay evidencia de calidad en otros idiomas.
- No es full-duplex: carece de ASR, VAD, detección de interrupciones, parada de reproducción y cancelación de generación. El "streaming bidireccional" se refiere solo a entrada de texto y salida de audio simultáneas.
- El streaming requiere buffering de texto y de tokens de voz; el "150 ms" del upstream no es un compromiso de esta versión para cualquier referencia o velocidad de entrada.
- Las instrucciones de estilo (--instruct) son cualitativas, no multiplicadores exactos; el control preciso de velocidad depende del post-procesado WSOLA, que degrada la calidad cuanto más se aleja de 1,0.
- Riesgo de lectura incorrecta de cifras y cadenas numéricas si el texto incremental no se normaliza; el wrapper lo mitiga en puntuación, pero no elimina el riesgo.
- Licencia "mixed-components": hay que revisar LICENSE.md y las licencias del modelo base y de los componentes (vocoder, extractor de tokens) antes de cualquier uso comercial; el autor no aclara los términos de uso comercial.
- Sin benchmarks públicos ni evaluaciones perceptivas; las métricas de validación (CE, pérdida de flow) no miden calidad de audio.
- Sensibilidad al entorno: requiere Transformers 4.51.3; otras versiones provocaron fallos de decodificación en el modelo base.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria independiente.
- La clonación de voz plantea riesgos de suplantación y uso indebido; no se documentan mecanismos de marca de agua ni de consentimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/TTS-V5
- Paquete de escucha de seis voces: https://huggingface.co/autotrust/TTS-V5/resolve/main/TTS-V5-listening.zip
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio del modelo base (CosyVoice): https://github.com/FunAudioLLM/CosyVoice
- Documentación interna del repo: MODEL_CARD.md, RESULTS.md, evaluation/ (incluidos en el repositorio de Hugging Face)
- Demos de guiones largos: carpeta demos/ del repositorio de Hugging Face
- Reproducción del entrenamiento: download_base.py, prepare_data.py, train_v5.py, export_v5.py (incluidos en el repositorio)
