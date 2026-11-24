# Dijo-404/madhan-tts-finetuned

## Resumen

Madhan es un modelo de síntesis de voz (text-to-speech) obtenido mediante ajuste fino supervisado de Qwen3-TTS 0.6B Base, el modelo TTS de código abierto de Alibaba Qwen. Lo publica el usuario Dijo-404 bajo el paraguas del proyecto Kural 4000 y está orientado específicamente a clonación de voz en inglés a partir de un perfil de referencia. El checkpoint incluye configuración Qwen, tokenizer de texto y tokenizer de audio, y se distribuye en safetensors con pesos en FP32.

El modelo resuelve un problema acotado: adaptar un TTS base de ~0,9 mil millones de parámetros a una voz concreta ("Madhan") con un conjunto de datos muy reducido (116 clips de entrenamiento y 49 de validación), manteniendo el pipeline estándar de Qwen3-TTS para inferencia con condicionamiento por referencia. Por su tamaño y su licencia Apache 2.0, es relevante para quien necesite un TTS autoalojado, reproducible y de bajo coste computacional, aunque su alcance es experimental y su validación se limita a tres clips de muestra.

El checkpoint se publicó el 24 de noviembre de 2026, no registra descargas ni likes, y el autor lo describe explícitamente como material para evaluación e inferencia offline, no como un producto listo para producción. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada y se detalla a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo TTS de Qwen; arquitectura interna no detallada en la información disponible) |
| Parametros totales | 914.643.008 (~0,91 B) según safetensors |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en FP32; el autor menciona "20 INT4-aware recovery updates" durante el entrenamiento, pero no se documentan artefactos cuantizados publicados |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,3 GB; incluye configuración, tokenizer y speech_tokenizer) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-TTS-12Hz-0.6B-Base (revisión 5d83992436eae1d760afd27aff78a71d676296fc), un TTS de Qwen con tokenizer de habla a 12 Hz y aproximadamente 0,6 B de parámetros nominales; el checkpoint ajustado contiene 914.643.008 parámetros según los safetensors publicados. La model card no describe la arquitectura interna (tipo de decoder, mecanismo de attention, diseño del speech tokenizer), por lo que ese detalle debe consultarse en la documentación del modelo base.

El ajuste fino se realizó con el pipeline Kural 4000 sobre 116 clips filtrados ("screened") y 49 clips de validación, con 160 actualizaciones de fine-tuning y 20 actualizaciones adicionales de recuperación "INT4-aware". El entrenamiento se ejecutó en una RTX 4080 y los pesos guardados están en FP32. No se documentan número de tokens de audio, composición del dataset, ni si hubo RLHF/DPO; tampoco se detallan innovaciones técnicas propias más allá del procedimiento de ajuste sobre el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Clonación de voz mediante condicionamiento con audio de referencia y su transcripción (`create_voice_clone_prompt` con `ref_audio` y `ref_text`).
- Generación en modo no streaming (`non_streaming_mode=True`) con control de `max_new_tokens`, `temperature` y `repetition_penalty`.
- Reproducibilidad determinista mediante semilla (`torch.manual_seed`).
- Integración con PyTorch/CUDA y con la librería `qwen3-tts`; el autor menciona además un paquete ONNX experimental (WASM y WebGPU) que no alcanzó sus objetivos de latencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio de entrada distinto de la referencia de voz, ni multilingüismo más allá del inglés.

## Casos de uso

- Clonación de voz para un locutor concreto: el modelo permite generar nuevos enunciados en inglés con la voz "Madhan" a partir del perfil de referencia público, útil para prototipos de narración o doblaje con una identidad vocal fija.
- Generación de avisos y locuciones cortas: frases como las de las muestras ("Good morning. Shall we get started?") encajan en sistemas de anuncios, interfaces de voz o asistentes embebidos que requieran audio pregrabado dinámico.
- Evaluación de pipelines TTS autoalojados: sirve como banco de pruebas reproducible (semilla fija, pesos FP32, script de inferencia documentado) para comparar decodificadores, backends de attention (SDPA) y entornos CUDA.
- Investigación sobre ajuste fino con pocos datos: con 116 clips de entrenamiento, es un caso de estudio de adaptación de un TTS base a una voz con recursos mínimos y de recuperación tras cuantización INT4.
- Pruebas de calidad ASR-in-the-loop: el autor valida las muestras con Nemotron y Whisper (WER medio de 2,0 % y 1,0 %), por lo que el modelo puede usarse para generar datos sintéticos de audio y medir su inteligibilidad automáticamente.
- Inferencia offline en estación de trabajo: al caber en una GPU consumer (el entrenamiento se hizo en una RTX 4080), es viable para generar audios por lotes en local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta métricas de validación de las tres muestras publicadas:

| Metrica | Valor |
|---|---|
| Clips que pasan comprobaciones de waveform | 3 de 3 |
| WER medio con Nemotron | 2,0 % |
| WER medio con Whisper | 1,0 % |
| Latencia primera habla audible (ONNX/WASM, p95) | 18,1 s |
| Latencia primera habla audible (ONNX/WebGPU, p95) | 10,7 s |

El informe de comparación (`evaluation/comparison.json`) incluye además puntuaciones de línea base, similitud de hablante (speaker cosine) y velocidad de habla, pero esos valores no se reproducen en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~0,91 B de parámetros en FP32, los pesos ocupan aproximadamente 3,7 GB; en FP16 serían ~1,8 GB. La VRAM real de inferencia es superior por activaciones y buffers del speech tokenizer, pero no se documenta una cifra oficial.
- GPU recomendadas: el autor entrenó en una RTX 4080; para inferencia es razonable cualquier GPU con al menos 8 GB de VRAM. No hay datos publicados para A100, H100 u otras GPUs de datacenter.
- GPU consumer: sí cabe en GPUs consumer modernas (RTX 4080 y, previsiblemente, modelos con VRAM similar o superior), aunque no se confirma con pruebas publicadas.
- Opciones de despliegue: PyTorch con CUDA y la librería `qwen3-tts` (ruta documentada); paquete ONNX experimental con proveedores WASM y WebGPU (no alcanzó los objetivos de latencia del autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican latencias de primera habla audible del paquete ONNX (18,1 s p95 en WASM, 10,7 s p95 en WebGPU). No hay cifras de throughput ni de latencia en PyTorch/CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Madhan (este modelo) | ~0,91 B | no disponible | en | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | ~0,6 B (nominal) | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base) |
| Alternativas TTS de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros TTS en la información proporcionada, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Alcance experimental: el autor lo publica "para evaluación e inferencia offline", no como modelo de producción; no hay descargas ni validación externa.
- Idioma único: solo inglés; no se documenta soporte multilingüe.
- Dataset mínimo: 116 clips de entrenamiento y 49 de validación, con riesgo de sobreajuste a la voz y al dominio de las muestras.
- Validación limitada: las métricas de WER se calculan sobre 3 clips; no hay evaluación a escala ni de robustez ante textos largos, números, siglas o puntuación compleja.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, prosodia anómala o pronunciaciones incorrectas; no se documentan mitigaciones.
- Sesgos: no se documenta composición demográfica del dataset ni análisis de sesgos de acento o género.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-TTS y el consentimiento sobre la voz clonada, que es un aspecto ético y legal fuera del alcance de la licencia.
- Reproducibilidad dependiente de revisiones fijas: el script de inferencia fija revisiones concretas del modelo base y del perfil de voz; cambios en esas revisiones pueden romper la reproducción.
- Paquete ONNX no apto para navegador: el propio autor indica que superó sus objetivos de latencia y de gaps de reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dijo-404/madhan-tts-finetuned
- Pesos: https://huggingface.co/Dijo-404/madhan-tts-finetuned/resolve/main/model.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base/tree/5d83992436eae1d760afd27aff78a71d676296fc
- Perfil de voz de referencia: https://huggingface.co/Dijo-404/madhan-tts
- Código fuente de Qwen3-TTS (revisión fijada): https://github.com/QwenLM/Qwen3-TTS/tree/022e286b98fbec7e1e916cb940cdf532cd9f488e
- Pipeline Kural 4000: https://github.com/techytales/Voice_qwenSample/tree/246fa63830fa98612afab26af78944cfcb5c6399
- Muestra corta: https://huggingface.co/Dijo-404/madhan-tts-finetuned/resolve/main/samples/short.wav
- Muestra media (WAV): https://huggingface.co/Dijo-404/madhan-tts-finetuned/resolve/main/samples/medium.wav
- Muestra media (MP3): https://huggingface.co/Dijo-404/madhan-tts-finetuned/resolve/main/samples/medium.mp3
- Muestra larga: https://huggingface.co/Dijo-404/madhan-tts-finetuned/resolve/main/samples/long.wav
