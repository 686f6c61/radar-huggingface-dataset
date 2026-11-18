# Edge0/Audio8-TTS-Realistic-Air

## Resumen

Audio8-TTS-Realistic-Air es un modelo de síntesis de voz (text-to-speech) desarrollado por Edge0, publicado en octubre de 2026 como una evolución del modelo base Audio8-TTS-Preview-0.6b. Su objetivo es mejorar el realismo del habla sintetizada manteniendo una arquitectura compacta de 601 millones de parámetros en el modelo principal, lo que lo hace viable para despliegue en hardware modesto. Incorpora clonación de voz zero-shot a partir de una grabación de referencia y su transcripción, así como generación sin referencia.

La arquitectura es DualAR, inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semántico por trama de audio y un transformer autorregresivo rápido que predice los codebooks del códec condicionado al estado oculto del primero. El modelo cubre 23 idiomas, doce más que su predecesor, y se distribuye con un códec de audio neuronal a 44,1 kHz incluido en el repositorio.

Su relevancia actual radica en la combinación de tamaño reducido (0,6B), licencia Apache 2.0, soporte nativo para llama.cpp/GGUF y un adaptador de serving SGLang Omni con API compatible con OpenAI. Esto permite tanto inferencia local en CPU/GPU de consumo como despliegue de alta concurrencia en servidores, algo poco habitual en modelos TTS de calidad comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + rápido) con códec de audio neuronal |
| Parametros totales | 601.159.424 (modelo principal, excluye códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | GGUF (bundle F32 compartido para llama.cpp); BF16 en Transformers; cuantizaciones adicionales no disponibles |
| Idiomas soportados | 23: chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita, cantonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Frecuencia del códec | 44,1 kHz, 2.048 muestras por trama (~21,5 tramas/s) |
| Codebooks acústicos | 10 codebooks, 4.096 entradas por codebook |
| Capas slow AR | 24 capas, ancho 896, 14 cabezas de atención, 2 cabezas KV |
| Capas fast AR | 4 capas, ancho 896, 14 cabezas de atención, 2 cabezas KV |
| Tamaño del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR en la que el transformer lento (slow AR, 24 capas) procesa la secuencia empaquetada de texto y audio y predice un token semántico por cada trama de audio. El transformer rápido (fast AR, 4 capas) toma el estado oculto del slow AR y los codebooks ya generados para predecir los diez codebooks acústicos restantes de la trama. El códec de audio neuronal, incluido en el repositorio, opera a 44,1 kHz con 2.048 muestras por trama y se encarga tanto de la codificación del audio de referencia como de la decodificación de la forma de onda final, por lo que no requiere un checkpoint de códec separado.

El contexto máximo es de 2.048 posiciones empaquetadas de texto y audio. El modelo se distribuye con código personalizado de Transformers, lo que exige cargarlo con `trust_remote_code=True`. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona el bundle F32 compartido para llama.cpp y un adaptador SGLang Omni con paged attention y batching dinámico.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, con calidad variable según el idioma.
- Clonación de voz zero-shot a partir de una grabación de referencia limpia y su transcripción exacta.
- Generación de habla sin audio de referencia.
- Prosodia más natural y entrega expresiva que el modelo Preview, según el autor.
- Inferencia local nativa mediante llama.cpp/GGUF, con CLI, clonación de voz y streaming.
- Serving en GPU mediante adaptador SGLang Omni con paged attention, batching dinámico y API de voz compatible con OpenAI.
- Integración con la interfaz de inferencia de Transformers (AutoModel/AutoProcessor).
- Capacidad de streaming de audio en el flujo de llama.cpp.

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza texto largo en 23 idiomas con prosodia natural, y su contexto de 2.048 posiciones permite procesar fragmentos extensos sin cortes bruscos de entonación.
- Clonación de voz para doblaje y localización: a partir de una muestra de referencia y su transcripción, se puede generar el mismo timbre en otro idioma soportado, útil para adaptar contenido audiovisual a mercados nuevos.
- Asistentes de voz en atención al cliente: el adaptador SGLang Omni con API compatible con OpenAI permite integrar el modelo en pipelines existentes de agentes conversacionales con batching dinámico para múltiples usuarios concurrentes.
- Generación de voz para accesibilidad: conversión de texto a audio de alta fidelidad (44,1 kHz) para lectores de pantalla y aplicaciones de accesibilidad, con despliegue local en llama.cpp sobre hardware de consumo.
- Prototipado de videojuegos y contenido interactivo: la inferencia local con streaming permite generar diálogos de personajes en tiempo real sin depender de servicios en la nube, con voces clonadas de actores de referencia.
- Investigación en TTS y evaluación de modelos: al ser Apache 2.0 y de 0,6B, sirve como base para fine-tuning, ablaciones y comparativas académicas de clonación zero-shot multilingüe.
- Generación de podcasts y contenido educativo: síntesis de guiones largos en varios idiomas con una sola GPU, reduciendo el coste frente a modelos TTS propietarios.

## Benchmarks y rendimiento

La información proporcionada menciona una sección de evaluación con resultados por idioma, pero no incluye las cifras concretas de los benchmarks en el fragmento disponible. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las comprobaciones de runtime citadas (carga del modelo, generación en inglés y chino con y sin referencia, y generación en árabe, cantonés, portugués y ruso) son pruebas de humo sobre una NVIDIA H20 con BF16, no resultados de benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 601 millones de parámetros en BF16 el modelo principal ocupa aproximadamente 1,2 GB, más el códec y las activaciones. El repositorio completo pesa 6,3 GB.
- GPU recomendadas: NVIDIA H20 (probada por el autor con PyTorch 2.8.0 y Transformers 4.57.3 en BF16); cualquier GPU CUDA con suficiente VRAM para BF16.
- GPU de consumo: por el tamaño del modelo principal, es probable que quepa en GPUs de consumo con 8 GB o más, aunque el dato no está confirmado en la información disponible.
- Despliegue: Transformers (con `trust_remote_code=True`), llama.cpp/GGUF para inferencia local nativa, SGLang Omni para serving en GPU con API compatible con OpenAI.
- Requisitos de software: Python 3.10 o superior, torch>=2.5.0, torchaudio>=2.5.0, transformers>=4.57.0 y <5, soundfile>=0.12, safetensors>=0.4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air | 601 M (sin códec) | 2.048 posiciones | 23 | Apache 2.0 | safetensors, GGUF |
| Audio8-TTS-Preview-0.6b (modelo base) | 0,6 B | no disponible | 11 | no disponible en la información | no disponible en la información |
| Fish Audio S2 Pro (inspiración arquitectónica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La calidad varía según el idioma; el propio autor advierte que la cobertura de benchmarks incluye idiomas adicionales y es distinta de la lista de idiomas soportados.
- La clonación de voz zero-shot requiere una grabación de referencia limpia cuya transcripción coincida exactamente con el contenido hablado; una transcripción incorrecta degrada el resultado.
- Riesgo de uso indebido para suplantación de identidad o deepfakes de voz; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad recae en el desplegador.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene revisar los archivos antes de cargarlo.
- No se han publicado detalles sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación o artefactos acústicos.
- El contexto está limitado a 2.048 posiciones empaquetadas de texto/audio, lo que acota la duración máxima de generación por pasada.
- El recuento de 0,6B excluye el códec, que se suma al consumo de memoria y cómputo real.
- No hay información publicada sobre latencia, throughput ni resultados numéricos de evaluación en la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper (arXiv): https://arxiv.org/abs/2610.14776
- Playground (Hugging Face Spaces): https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-Air
- Guía llama.cpp: https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp.md
- Guía llama.cpp (chino): https://github.com/Edge0-AI/Audio8_TTS/blob/0f8c4fade0cb14e38fbf737d0488553f16a0d658/guides/llama-cpp_zh.md
- Fish Audio S2 Pro (referencia arquitectónica): https://github.com/fishaudio/fish-speech
