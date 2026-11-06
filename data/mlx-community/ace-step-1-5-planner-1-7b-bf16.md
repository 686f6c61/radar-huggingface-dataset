# mlx-community/ACE-Step-1.5-planner-1.7B-bf16

## Resumen

ACE-Step-1.5-planner-1.7B-bf16 es la conversión a MLX (formato nativo de Apple Silicon) del planificador lingüístico de 1.700 millones de parámetros que forma parte del sistema de generación musical ACE-Step 1.5, desarrollado por ACE Studio y StepFun. No es un modelo de texto convencional: es un LM a 5 Hz que, dada una indicación musical (caption) y una letra, produce un bloque de razonamiento YAML restringido (bpm, caption, duración, tonalidad, idioma, compás) seguido de `duración × 5` códigos de audio que el resto del pipeline (DiT turbo, text encoder y VAE) convierte en una canción estéreo a 48 kHz.

El modelo base es un fine-tune de Qwen3-1.7B (28 capas, dimensión oculta 2048, vocabulario de 217.204 tokens con 65.536 tokens `<|audio_code_N|>` y embeddings atados) sobre el que ACE-Step ha aplicado su entrenamiento específico de planificación musical. Esta conversión de mlx-community preserva los pesos bit a bit respecto al checkpoint original y los reorganiza en el layout `model.*` de mlx-lm, de modo que `mlx_lm.load` lo interpreta directamente como un modelo `qwen3`.

Su relevancia es doble: por un lado, expone un componente interno de un sistema text-to-audio de última generación como un LM cargable con herramientas estándar de MLX; por otro, permite ejecutar la fase de planificación musical en Apple Silicon con cuantizaciones de 4 y 8 bits, algo poco habitual en pipelines de generación de audio. La licencia MIT del fine-tune (sobre base Qwen3 Apache-2.0) facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B fine-tuneado), LM de planificación a 5 Hz |
| Parametros totales | 1.854.243.840 (1,85 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repo); int8 y int4 mediante repos hermanos `-8bit` / `-4bit` o cuantización al cargar con group size 64 |
| Idiomas soportados | no disponible (el planificador emite un campo `language` en el YAML, pero no se publica la lista de idiomas) |
| Licencia | MIT (fine-tune, Copyright (c) 2026 ACEStep); base Qwen3 Apache-2.0 |
| Formato de pesos | safetensors en layout mlx-lm (`model.*`), con tokenizer adjunto; 310 tensores |
| Tamano del repo | 3,7 GB |
| Capas / dimension oculta | 28 capas / 2048 |
| Vocabulario | 217.204 tokens (incluye 65.536 tokens de audio), embeddings atados |
| Framework | MLX (librería `mlx`, conversión con mlx 0.32.4) |
| Pipeline | text-to-audio |

## Arquitectura y entrenamiento

El planificador es un transformer decoder-only denso con la topología de Qwen3-1.7B: 28 capas, hidden size 2048 y embeddings atados a la salida. La modificación clave respecto al Qwen3 original es la ampliación del vocabulario hasta 217.204 tokens, de los cuales 65.536 son tokens de audio (`<|audio_code_N|>`). El modelo opera a 5 Hz: por cada segundo de audio genera cinco códigos, de modo que una canción de 120 segundos requiere 600 tokens de audio tras el bloque YAML de planificación. La generación está restringida a una estructura YAML con campos `bpm`, `caption`, `duration`, `keyscale`, `language` y `time signature`, lo que actúa como esquema de control sobre la salida.

El fine-tune parte de Qwen3-1.7B y lo especializa en la tarea de planificación musical dentro del sistema ACE-Step 1.5 (ACE Studio + StepFun), descrito en el informe técnico arXiv:2602.00744. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La conversión a MLX no altera los pesos: solo reorganiza prefijos de claves, layout de convoluciones y folding de weight-norm, y el conversor está validado bit a bit contra el oráculo upstream en fp32.

## Capacidades

- Planificación musical estructurada: genera un bloque YAML con bpm, caption, duración, tonalidad, idioma y compás a partir de una descripción textual y una letra.
- Generación de códigos de audio a 5 Hz: emite `duración × 5` tokens de audio que alimentan las etapas DiT y VAE del pipeline.
- Razonamiento restringido: la salida YAML actúa como cadena de razonamiento acotada antes de la secuencia de códigos.
- Comprensión de texto musical: interpreta captions descriptivos y letras con marcas de sección (`[Verse]`, etc.).
- Control de duración: el campo `duration` condiciona directamente la longitud de la secuencia de audio generada.
- Integración en pipeline text-to-audio: no produce audio por sí mismo; requiere el DiT turbo, el text encoder y el VAE del sistema ACE-Step 1.5.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Capacidades multilingües: no documentadas; existe un campo `language` en la salida, pero no se publica la cobertura.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Generación de canciones en Apple Silicon: integrado en el paquete Swift `xocialize/mlx-ace-step-swift` a través de MLXEngine, el planificador convierte caption y letra en la especificación YAML y los códigos de audio que producen una canción estéreo a 48 kHz, sin salir del Mac.
- Prototipado de pipelines text-to-music: al cargarse con `mlx_lm.load` como un `qwen3` estándar, permite inspeccionar y depurar la fase de planificación (bpm, tonalidad, duración) de forma aislada antes de ejecutar el DiT y el VAE.
- Control fino de parámetros musicales: el YAML restringido permite forzar bpm, compás o tonalidad concretos en lugar de dejar que el sistema los infiera, útil para producción musical asistida.
- Cover, repaint y extend de clips existentes: el planificador forma parte de los flujos del paquete que toman un audio de referencia y generan variaciones o extensiones con coherencia de timbre y estructura.
- Generación con marcas de tiempo LRC: el pipeline del que forma parte produce timestamps LRC, lo que habilita la creación de karaokes o subtitulado sincronizado a partir de la letra de entrada.
- Despliegue local con cuantización: usando los repos `-8bit` o `-4bit` (o cuantizando al cargar con group size 64), el planificador cabe en configuraciones de memoria reducidas de Apple Silicon, adecuado para aplicaciones de escritorio de generación musical.
- Investigación sobre LMs de audio discreto: su vocabulario de 65.536 tokens de audio a 5 Hz lo convierte en un caso de estudio para modelado autoregresivo de audio a baja frecuencia de token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: en bf16 los pesos ocupan aproximadamente 3,7 GB (coincide con el tamaño del repo); en int8 alrededor de 1,9 GB y en int4 alrededor de 1,0 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: el modelo es específico de MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1 a M4, con ventaja para variantes Pro/Max/Ultra por ancho de banda de memoria). No está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada en cuantización int4; 16 GB o más recomendable para bf16 junto al resto del pipeline.
- Opciones de despliegue: MLX (`mlx_lm.load`), MLX Swift a través de `xocialize/mlx-ace-step-swift` y MLXEngine en la capacidad `music`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El pipeline completo debe cargar cuatro bundles (DiT turbo, planificador, text encoder y VAE), por lo que el consumo de memoria agregado supera el de este componente aislado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-planner-1.7B (este) | 1,85 B | no disponible | Planificador musical (YAML + codigos de audio a 5 Hz) | MIT (base Apache-2.0) | MLX, safetensors |
| ACE-Step-1.5-planner-0.6B | 0,6 B (aprox.) | no disponible | Planificador lite del mismo sistema | MIT (presumible, no confirmado) | MLX, safetensors |
| Qwen3-1.7B (base) | 1,7 B | no disponible | LM de texto general | Apache-2.0 | Multiples formatos |
| ACE-Step/Ace-Step1.5 (upstream) | no disponible | no disponible | Sistema text-to-audio completo | MIT | Pesos originales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el DiT turbo, el text encoder y el VAE del sistema ACE-Step 1.5 no genera audio; su salida son tokens de audio y un YAML de planificación.
- Específico de MLX: no funciona en CUDA ni en stacks Python convencionales de inferencia; requiere Apple Silicon y la librería `mlx`.
- Contexto máximo no documentado: se desconoce cuántos segundos de canción o cuántos tokens de caption/letra admite antes de truncar.
- Cobertura lingüística no publicada: aunque el YAML incluye un campo `language`, no se detalla qué idiomas maneja ni con qué calidad.
- Riesgo de alucinación estructural: al ser un LM generativo, puede producir YAML malformado o campos fuera de rango (bpm o duración inválidos) si no se valida la salida.
- Licencia: el fine-tune es MIT, pero hereda obligaciones de atribución de la base Qwen3 Apache-2.0; el repo incluye `NOTICE` y `LICENSE` que deben conservarse.
- Madurez: 81 descargas y 0 likes en el momento de la consulta, con fecha de creación reciente; ecosistema y validación comunitaria todavía escasos.
- Sesgos: no documentados; al derivar de un LM de texto, puede arrastrar sesgos de género, cultura o estilo musical del corpus original de Qwen3 y del dataset de fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/ACE-Step-1.5-planner-1.7B-bf16
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio de código upstream: https://github.com/ace-step/ACE-Step-1.5
- Licencia upstream: https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE
- Informe técnico: https://arxiv.org/abs/2602.00744
- Paquete Swift MLX: https://github.com/xocialize/mlx-ace-step-swift
- Motor MLXEngine: https://github.com/xocialize/mlx-engine-swift
- MLX Swift: https://github.com/ml-explore/mlx-swift
