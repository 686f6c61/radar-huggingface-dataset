# Shrijanagain/speed-speak-tts

## Resumen

Speed Speak TTS es un proyecto de investigación para el preentrenamiento de un modelo de texto a voz (TTS) autoregresivo basado en una arquitectura Mixture-of-Experts (MoE) de tipo decoder-only. Lo desarrolla el usuario de Hugging Face Shrijanagain y su objetivo declarado es servir como base abierta para construir un TTS de calidad comparable a ElevenLabs, pero entrenable en hardware de consumo o alquiler económico, concretamente una única GPU Tesla T4 de 16 GB (Kaggle, Colab o instancias alquiladas).

El modelo combina un tokenizador BPE a nivel de byte para el texto, una representación de audio mediante Meta EnCodec a 24 kHz con 8 codebooks y 75 Hz, y una predicción multi-codebook con patrón de retardo estilo MusicGen. La arquitectura tiene 38 capas, `d_model=512`, 8 cabezas de atención y una FFN MoE con 32 expertos y enrutamiento top-2, lo que da aproximadamente 1.006 B de parámetros totales pero solo unos 109,6 M activos por paso forward.

Es relevante porque propone un enfoque de entrenamiento de TTS de gran escala en hardware muy limitado, con un plan de memoria explícito para T4 (fp32 master weights, autocast fp16, AdamW de 8 bits, gradient checkpointing) y una hoja de ruta que separa el preentrenamiento de las fases posteriores de SFT, clonación de voz y RLHF. El repositorio, sin embargo, está vacío (0.0 GB) y no hay pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN MoE (32 expertos, top-2), RMSNorm, RoPE, SwiGLU |
| Parametros totales | ~1.006 B |
| Parametros activos | ~109,6 M por forward pass |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el proyecto menciona fp32 + fp16 autocast y AdamW de 8 bits para entrenamiento, no cuantizacion de inferencia) |
| Idiomas soportados | no disponible (tokenizador BPE a nivel de byte descrito como "Hindi/English safe") |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun el modulo `export.py`; no hay pesos publicados) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 38 capas con `d_model=512` y 8 cabezas de atencion, que sustituye la FFN densa por una capa MoE con 32 expertos SwiGLU (`expert_hidden=512`) y enrutamiento top-2. Cada token activa solo 2 expertos, de modo que el conocimiento reside en los ~1 B de parametros totales mientras el coste computacional se mantiene en ~109,6 M activos. La entrada combina texto (BPE a nivel de byte), condicionamiento de hablante y tokens de codec; la salida son tokens de codec con patron de retardo (delay pattern) que se decodifican con el decoder EnCodec de 24 kHz de Meta. El condicionamiento de hablante admite dos modos: `id` (embedding aprendido, para datos tipo LibriTTS/VCTK) y `reference` (ECAPA-TDNN congelado mas proyeccion entrenable, para clonacion zero-shot). Se aplica dropout de classifier-free guidance (`cond_drop=0.1`) para permitir CFG en inferencia.

El entrenamiento esta disenado para una T4 de 16 GB: pesos maestros en fp32, autocast fp16 con GradScaler, checkpointing de gradientes, estados de AdamW de 8 bits via `bitsandbytes` y perdidas auxiliares de enrutamiento (router z-loss y Switch load-balancing). El plan de memoria estimado es de ~13-15 GB en total. El autor indica que el preentrenamiento debe hacerse sobre 500-2.000 horas de audio en una primera ejecucion realista en T4, y que la calidad plena requiere del orden de 10 veces mas datos y un codec mejor. No se especifican el numero de tokens de entrenamiento efectivamente usados ni la composicion exacta del dataset; las fases de SFT, clonacion de voz y RLHF quedan como trabajo futuro segun la hoja de ruta.

## Capacidades

- Sintesis de voz a partir de texto con condicionamiento de hablante por identificador o por referencia de audio (clonacion zero-shot en modo `reference`).
- Prediccion multi-codebook de tokens EnCodec con patron de retardo, orientada a generar waveform a 24 kHz.
- Generacion con classifier-free guidance en inferencia.
- Tokenizacion BPE a nivel de byte descrita como segura para hindi e ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible mas alla de la mencion al tokenizador.
- Modo thinking, vision o audio de entrada: no disponible.

## Casos de uso

- Base para un TTS open source de calidad: el modelo se plantea como punto de partida de preentrenamiento sobre el que aplicar SFT y ajuste de voz, de modo que un equipo pueda construir su propio sintetizador sin depender de APIs propietarias.
- Clonacion de voz zero-shot: usando el modo `reference` con ECAPA-TDNN, se puede condicionar la sintesis con unos segundos de audio de un hablante para generar nuevas locuciones con esa voz.
- Generacion de audiolibros y contenido narrado: el condicionamiento por `speaker_id` permite mantener una voz consistente a lo largo de corpus largos de texto.
- Prototipado en hardware economico: el plan de memoria para T4 (13-15 GB) permite entrenar y experimentar en Kaggle o Colab sin GPUs de datacenter.
- Investigacion en arquitecturas MoE para audio: el modelo sirve como banco de pruebas para estudiar enrutamiento top-2, perdidas auxiliares y eficiencia de parametros en tareas de sintesis.
- Localizacion de contenido para hindi e ingles: el tokenizador BPE a nivel de byte esta disenado para manejar ambos idiomas, lo que facilita experimentos de TTS multilingue en el subcontinente indio.
- Evaluacion de pipelines TTS completos: el repositorio incluye `eval.py` con WER y similitud de hablante, util para medir calidad en un flujo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una unica Tesla T4 de 16 GB es el objetivo declarado; el plan de memoria estima ~13-15 GB (4 GB de pesos fp32, 4 GB de gradientes, 2-4 GB de estados AdamW de 8 bits y 3-5 GB de activaciones con checkpointing y micro-batch 2).
- Si hay OOM: reducir a `--micro-batch 1 --grad-accum 16` o desactivar el checkpointing de gradientes.
- Inferencia: no se proporcionan requisitos de VRAM para inferencia; al tener ~109,6 M parametros activos y ~1 B totales, el peso en fp16 rondaria los 2 GB, pero es una estimacion no confirmada por el autor.
- GPUs recomendadas: no disponible; el unico hardware mencionado es la T4.
- Cabe en GPU de consumo: previsiblemente si por tamano de pesos, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el repositorio incluye scripts propios (`speedspeak.infer`, `speedspeak.export`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Speed Speak TTS | ~1.006 B totales / ~109,6 M activos | no disponible | no disponible | repositorio vacio, sin pesos |
| Alternativas TTS open source comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se aportan datos de rendimiento ni de terceros que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio de Hugging Face esta vacio (0.0 GB) y no contiene pesos, tokenizador ni codigo; la model card describe el proyecto pero no hay artefactos descargables.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido.
- No se han publicado resultados de benchmarks, evaluaciones de calidad (MOS, WER, similitud de hablante) ni comparaciones con sistemas existentes.
- El propio autor advierte que la calidad plena requiere del orden de 10 veces mas datos que las 500-2.000 horas realistas en una primera ejecucion en T4, y un codec mejor.
- El preentrenamiento es solo la primera fase: SFT, clonacion de voz y RLHF quedan pendientes segun la hoja de ruta, por lo que el modelo base no esta listo para produccion.
- Riesgo de alucinacion y sesgos: no documentado.
- Idiomas: solo se menciona que el tokenizador es seguro para hindi e ingles; no hay lista oficial de idiomas soportados.
- La clonacion de voz zero-shot conlleva riesgos de suplantacion y requiere controles de consentimiento que la documentacion no aborda.
- El plan de memoria depende de `bitsandbytes`; sin el, los estados de AdamW en fp32 suben a 8 GB y pueden provocar OOM en T4.

## Enlaces

- Hugging Face: https://huggingface.co/Shrijanagain/speed-speak-tts
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
