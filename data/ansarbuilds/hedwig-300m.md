# ansarbuilds/hedwig-300m

## Resumen

Hedwig 286.7M Flagship es un modelo de lenguaje de tipo GPT entrenado desde cero en PyTorch por el desarrollador independiente ansarbuilds. Con 286.663.680 parámetros y una ventana de contexto de 512 tokens, está diseñado específicamente para dos tareas: generación de relatos cortos (storytelling) y asistencia gramatical (grammar/tone rewriting). Es la tercera y mayor generación de la familia Hedwig, tras las variantes de 14M y 97.6M de parámetros, y se distribuye con licencia MIT.

El modelo emplea una arquitectura transformer decoder-only convencional con RoPE, RMSNorm, SwiGLU y atención SDPA en bfloat16, junto con un tokenizador BPE propio de 16.384 piezas. El entrenamiento completo se realizó en una única NVIDIA RTX 4090 de 24 GB en RunPod durante aproximadamente 1 hora y 55 minutos, con un coste total declarado de unos 1,70 dólares, lo que lo convierte en un caso de estudio de entrenamiento de bajo presupuesto.

Su relevancia actual es principalmente didáctica y de investigación: documenta de forma transparente el pipeline completo (pretraining, SFT, DPO y cuantización int4 desde cero) y demuestra los compromisos reales de escalado cuando se entrena con una ratio de aproximadamente 0,7 tokens por parámetro, muy por debajo de la regla de Chinchilla (unas 20 veces). No está pensado como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con RoPE, RMSNorm, SwiGLU y SDPA; 20 capas, dimensión 1024, 16 cabezas |
| Parámetros totales | 286.663.680 (~286,7M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (block_size) |
| Tipos de cuantización | bfloat16 e int4 (cuantización empaquetada de 4 bits implementada desde cero) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt): brain_chat.pt, brain_dpo.pt (bfloat16, 574,7 MB) y brain_chat_int4.pt, brain_dpo_int4.pt (int4, 161,9 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT implementado en PyTorch puro, con embeddings rotatorios (RoPE), normalización RMSNorm, activación SwiGLU y atención mediante SDPA en precisión bfloat16. Consta de 20 capas, anchura de 1024 y 16 cabezas de atención, con un tokenizador BPE propio de 16.384 piezas que rinde 4,13 caracteres por token.

El pretraining utilizó un corpus de 1,22 GB (294,6M tokens) compuesto por 523,9 MB de TinyStories, 734,0 MB de FineWeb-Edu (154.768 documentos, licencia ODC-By) y 10 novelas de dominio público de Project Gutenberg anteriores a 1929. Se realizaron 25.000 pasos, lo que supone aproximadamente 205M de tokens vistos, una ratio de unas 0,7 tokens por parámetro. El post-entrenamiento consta de dos etapas: un SFT con 71.906 pares mixtos (TinyStories-Instruct más 30.000 reescrituras gramaticales y de tono de grammarly/coedit, Apache-2.0) durante 2.500 pasos, y un DPO anclado con 52.798 pares de respuestas preferidas y rechazadas. La innovación técnica destacable es la implementación desde cero de una cuantización empaquetada de 4 bits, que reduce el checkpoint de 574,7 MB a 161,9 MB.

## Capacidades

- Generación de texto narrativo breve: relatos cortos en inglés, entrenados sobre TinyStories.
- Reescritura gramatical y de tono: corrección de gramática y ajuste de registro a partir del corpus CoEdit.
- Alineación mediante DPO: preferencia declarada del 98,3 % en win-rate sobre los pares de entrenamiento.
- Cuantización int4 nativa: inferencia con checkpoints de 161,9 MB.
- Funcionamiento totalmente offline: no requiere API externa ni conexión a servicios en la nube.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de cuentos infantiles offline: el modelo produce relatos cortos en inglés coherentes dentro de los 512 tokens de contexto, adecuado para aplicaciones educativas o de entretenimiento que deban funcionar sin conexión.
- Corrección gramatical en editores de texto ligeros: integrado como paso de reescritura sobre frases individuales, aprovechando el entrenamiento con CoEdit para corregir errores y ajustar el tono.
- Prototipado e investigación educativa: sirve como referencia reproducible de un pipeline completo (pretraining, SFT, DPO, cuantización) ejecutable en una sola GPU de consumo.
- Demostración de DPO a pequeña escala: útil para experimentos docentes sobre alineación de preferencias con presupuesto mínimo.
- Inferencia en dispositivos con recursos limitados: el checkpoint int4 de 161,9 MB permite desplegar el modelo en entornos con poca memoria o en CPU.
- Evaluación de compromisos de escalado: permite estudiar empíricamente el efecto de entrenar con 0,7 tokens por parámetro frente a la regla de Chinchilla en tareas narrativas.
- Base para fine-tuning específico de dominio: al ser un modelo pequeño con licencia MIT, puede adaptarse a estilos narrativos o dominios concretos en inglés con coste reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta pérdidas de validación/test y un win-rate de preferencia DPO:

| Checkpoint | Precisión | Tamaño | Loss val/test | Notas |
|---|---|---:|---:|---|
| Stage 1 pretrain | bfloat16 | 574,7 MB | 2,998 | 25.000 pasos (vocab 16k, contexto 512) |
| brain_chat.pt | bfloat16 | 574,7 MB | 1,341 | SFT, 2.500 pasos |
| brain_chat_int4.pt | int4 | 161,9 MB | 1,3601 | Cuantización 4 bits empaquetada |
| brain_dpo.pt | bfloat16 | 574,7 MB | 1,200 | DPO (98,3 % win-rate de preferencia) |
| brain_dpo_int4.pt | int4 | 161,9 MB | 1,4249 | Cuantización 4 bits empaquetada |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (checkpoint de 574,7 MB) y menos de 0,5 GB en int4 (checkpoint de 161,9 MB), más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se validó en una RTX 4090 de 24 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para el checkpoint int4.
- Opciones de despliegue: scripts de PyTorch propios del repositorio y la UI offline "Brain X-Ray" (app.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| Hedwig 286.7M Flagship | 286,7M | 512 | MIT | Hugging Face + GitHub | Entrenado desde cero, enfoque storytelling/gramática |
| Hedwig 97.6M | 97,6M | no disponible | MIT | Repositorio del autor | Generación anterior de la misma familia |
| Hedwig 14M | 14M | no disponible | MIT | Repositorio del autor | Generación inicial de la misma familia |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Infraentrenamiento deliberado: con 0,7 tokens por parámetro frente a los ~20 de Chinchilla, la calidad general queda muy por debajo de modelos del mismo tamaño entrenados con presupuestos estándar.
- Contexto muy corto: 512 tokens limitan las conversaciones multi-turno y los documentos largos.
- Solo inglés: no soporta castellano ni otros idiomas.
- Riesgo de alucinación: al ser un modelo pequeño y con corpus limitado, puede generar contenido factualmente incorrecto o incoherente fuera del dominio narrativo y gramatical.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus FineWeb-Edu y Gutenberg pueden introducir sesgos de dominio y época.
- Sin soporte de tool calling ni agentes: no apto para pipelines que requieran function calling o razonamiento multi-paso.
- Ecosistema limitado: no hay integración documentada con vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en producción.
- Licencia MIT: permite uso comercial, pero sin garantías del autor y con las limitaciones técnicas descritas.
- Adopción nula: 0 descargas y 0 likes en Hugging Face en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/ansarbuilds/hedwig-300m
- Repositorio GitHub (scripts de entrenamiento, UI y logs): https://github.com/ansarbuilds/hedwig
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
- Dataset FineWeb-Edu (shuffle): https://huggingface.co/datasets/karpathy/fineweb-edu-100b-shuffle
- Dataset CoEdit: https://huggingface.co/datasets/grammarly/coedit
- Comparativa de relatos (docs/STORY_SHOWDOWN.md): https://github.com/ansarbuilds/hedwig/blob/main/docs/STORY_SHOWDOWN.md
