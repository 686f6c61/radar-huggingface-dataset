# mlx-community/AuK-bf16

## Resumen

AuK es un modelo fundacional de 1,5B parámetros para generación y edición de voz desarrollado por Tencent Hunyuan. A diferencia de un TTS clásico, unifica en una sola interfaz de instrucciones en lenguaje natural tareas muy distintas: TTS zero-shot, TTS con instrucción, edición de contenido (reemplazar, insertar o borrar palabras), edición acústica (tono, velocidad, volumen), edición paralingüística (emoción, timbre, eliminación de acento, susurro, vocalizaciones no verbales), mejora de voz y separación de fuentes. El informe técnico es arXiv:2609.08936.

El repositorio que nos ocupa, `mlx-community/AuK-bf16`, no es el modelo original en PyTorch, sino una conversión a Apple MLX de los pesos de `tencent/AuK`, pensada para el port en Swift `xocialize/mlx-auk-swift`. Incluye el DiT (Flux2Edit, 10 bloques MMDiT y 20 de flujo simple, dimensión 1536, más 36 capas de fusión) y el VAE BigVGAN-Flow a 24 kHz, ambos en bf16 con estadísticas en fp32. Ocupa 3,4 GB en el repositorio.

Su relevancia ahora es doble: por un lado, demuestra que un modelo de edición de voz de este tipo se puede ejecutar de forma nativa en Apple Silicon con una fidelidad numérica verificada frente a la implementación de referencia en fp32 (relL2 ≤ 6,6e-4 en latentes, ≤ 7,5e-3 en forma de onda); por otro, arrastra una advertencia de licencia crítica: el codificador semántico que AuK necesita (Qwen2.5-Omni-3B thinker) está bajo la Qwen Research License, solo para investigación y no comercial, de modo que cualquier pipeline funcional queda restringido a ese uso aunque el badge del repositorio diga MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT Flux2Edit (10 bloques MMDiT + 20 bloques single-stream, dim 1536) + 36 capas de fusion; VAE BigVGAN-Flow (24 kHz, hop 480, latentes de 64 dim) + codificador semantico externo Qwen2.5-Omni-3B thinker |
| Parametros totales | 1,5B (modelo base AuK; el codificador Qwen2.5-Omni-3B se distribuye aparte y suma ~3B adicionales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repo); pesos de fusion, escalas y frecuencias RoPE en fp32; codificador disponible en bf16, 8-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | DiT y VAE: MIT (LICENSE de Tencent incluida). Codificador Qwen2.5-Omni-3B thinker: Qwen Research License Agreement (solo investigacion, no comercial). El pipeline completo es, por tanto, solo para investigacion |
| Formato de pesos | safetensors (dit.safetensors, vae.safetensors) en layout MLX (O, K, I) para convoluciones; config.json con arquitectura, VAE y muestreo |

## Arquitectura y entrenamiento

AuK se organiza como un sistema de dos etapas. Un codificador semantico (el thinker de Qwen2.5-Omni-3B) interpreta la instruccion en lenguaje natural junto con el audio de entrada y produce representaciones semanticas; sobre ellas opera un DiT de tipo Flux2Edit con 10 bloques MMDiT y 20 bloques single-stream de dimension 1536, mas 36 capas de fusion que inyectan las condiciones (instruccion, contenido, rasgos acusticos). La sintesis final la realiza un VAE BigVGAN-Flow a 24 kHz con hop 480 y latentes de 64 dimensiones. La decodificacion usa 32 pasos Euler con CFG 2.0 y sway −1, lo que equivale a 64 pasadas por el DiT por cada generacion.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni del detalle del pipeline de alineacion (RLHF/DPO); el repositorio original de Tencent indica formacion sobre "millones de horas" de audio diverso, sin cifras verificables aqui. La conversion a MLX elimina el flujo de acoplamiento usado solo en entrenamiento y pliega el weight-norm del VAE; los pesos de fusion, escalas y frecuencias RoPE se mantienen en fp32 dentro de un checkpoint bf16. Se han publicado mediciones de paridad frente a la referencia PyTorch en fp32 sobre seis tareas del cookbook con el mismo ruido: error relativo L2 ≤ 6,6e-4 en el latente generado y ≤ 7,5e-3 en la forma de onda; en bf16 frente a fp32 sobre 36 renders, la tasa de error baja 1,2 puntos, la similitud de hablante CAM++ cae 0,023 y DNSMOS 0,01. Los codificadores de 8 y 4 bits superan la misma puerta de validacion.

## Capacidades

- TTS zero-shot: clonacion de voz a partir de un audio de referencia corto, sin ajuste fino.
- TTS con instruccion: control del estilo de locucion mediante lenguaje natural.
- Edicion de contenido: reemplazo, insercion y borrado de palabras manteniendo la coherencia del resto del audio.
- Edicion acustica: modificacion de tono (pitch), velocidad y volumen.
- Edicion paralinguistica: emocion, timbre, eliminacion de acento, susurro y vocalizaciones no verbales.
- Mejora de voz (speech enhancement) y separacion de fuentes.
- Interfaz unificada: todas las tareas anteriores se expresan con una sola instruccion en lenguaje natural, sin cabeceras ni modos separados.
- No se documenta en la informacion disponible soporte de tool calling, agentes, vision ni audio de entrada arbitrario mas alla del audio de referencia/edicion.

## Casos de uso

- Postproduccion de podcast y audiolibros: corregir una frase mal locutada sustituyendo solo esas palabras, sin regrabar el parrafo completo ni romper la continuidad de timbre y prosodia.
- Doblaje y localizacion: ajustar tono y velocidad para cuadrar la duracion de una toma doblada con el video original, conservando la identidad de la voz del actor.
- Prototipado de asistentes de voz: generar locuciones con distintos registros emocionales (neutro, alegre, susurro) a partir de la misma voz de marca para pruebas de UX antes de contratar grabaciones.
- Accesibilidad y rehabilitacion vocal: reconstruir una voz personalizada a partir de muestras del usuario y editar despues el contenido con instrucciones, util en pacientes con perdida parcial de habla.
- Limpieza de archivos de archivo historico: aplicar mejora de voz y separacion de fuentes a grabaciones con musica o ruido de fondo antes de transcribirlas.
- Investigacion en edicion de habla: banco de pruebas controlado para estudiar hasta que punto una instruccion en lenguaje natural preserva contenido y hablante, con metricas de paridad reproducibles (relL2, CAM++, DNSMOS).
- Generacion de datasets sinteticos de voz: producir variaciones controladas de emocion, ritmo y acento sobre un mismo texto para entrenar o evaluar otros sistemas de ASR y diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K, no aplicables a un modelo de voz) en la informacion disponible. Los unicos datos cuantitativos disponibles son las metricas de paridad de la conversion y el coste de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| Error relativo L2 del latente generado | ≤ 6,6e-4 | Swift/MLX fp32 frente a referencia PyTorch fp32, 6 tareas del cookbook, mismo ruido |
| Error en la forma de onda | ≤ 7,5e-3 | Mismas condiciones |
| Tasa de error (WER) | −1,2 puntos | bf16 frente a fp32, 36 renders |
| Similitud de hablante CAM++ | −0,023 | bf16 frente a fp32, 36 renders |
| DNSMOS | −0,01 | bf16 frente a fp32, 36 renders |
| RTF | ≈ 0,89 | bf16 sobre Apple M5 Max, 32 pasos Euler x CFG 2.0 (64 pasadas de DiT) |

## Requisitos de hardware

- VRAM/unified memory: el repositorio pesa 3,4 GB (DiT + VAE en bf16). Hay que sumar el codificador Qwen2.5-Omni-3B: aproximadamente 6 GB en bf16, 3 GB en 8 bits y 1,5 GB en 4 bits. Total orientativo: 9-10 GB en bf16, 6-7 GB con codificador de 8 bits y 5 GB con 4 bits.
- Plataforma: la conversion esta pensada para Apple Silicon via MLX; no se proporcionan datos de ejecucion en CUDA ni GPU NVIDIA.
- GPU recomendadas: Apple M-series con memoria unificada suficiente (M5 Max es la referencia medida, RTF 0,89). Para NVIDIA no hay datos disponibles en esta informacion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada usando codificador de 8 o 4 bits; en bf16 conviene 24 GB o mas para dejar margen al resto del sistema.
- Opciones de despliegue: MLX (binding Swift `AuKCore` del repo `xocialize/mlx-auk-swift`, o el port alternativo `vanch007/mlx-AuK`); vLLM, llama.cpp, Ollama y TGI no estan documentados para esta arquitectura en la informacion disponible.
- Latencia y throughput: RTF ≈ 0,89 en bf16 sobre M5 Max, es decir, ligeramente mas rapido que tiempo real para una generacion completa; el coste por generacion es de 64 pasadas del DiT (32 pasos Euler con CFG 2.0).

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks de otros modelos de edicion de voz en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mlx-community/AuK-bf16 (esta ficha) | 1,5B + codificador ~3B | no disponible | MIT en DiT/VAE; pipeline research-only por el codificador Qwen | HuggingFace, MLX | Conversion a MLX de tencent/AuK; RTF 0,89 en M5 Max |
| tencent/AuK (original) | 1,5B | no disponible | MIT (DiT/VAE); mismas restricciones de codificador | HuggingFace, PyTorch | Implementacion de referencia en fp32 |
| vanch007/mlx-AuK | 1,5B | no disponible | no disponible | GitHub, MLX | Port alternativo a Apple Silicon; sin metricas publicadas en esta busqueda |
| mlx-community/Qwen2.5-Omni-3B-Thinker-bf16 | ~3B | no disponible | Qwen Research License (no comercial) | HuggingFace, MLX | Dependencia de AuK, no alternativa funcional |

## Limitaciones y advertencias

- Licencia: aunque el badge del repositorio indique MIT, el pipeline completo requiere el codificador Qwen2.5-Omni-3B thinker, bajo Qwen Research License Agreement, que prohibe el uso comercial. Cualquier despliegue en produccion queda bloqueado hasta que Tencent publique un codificador permisivo (issue Tencent-Hunyuan/AuK#13).
- Aun siendo MIT, los pesos de este repositorio son una conversion modificada y Tencent no la respalda explicitamente.
- Plataforma: la conversion esta atada a MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni despliegue en servidores x86 convencionales.
- Coste de inferencia alto por generacion (64 pasadas del DiT); el RTF de 0,89 medido en M5 Max deja poco margen para servir multiples peticiones concurrentes en un solo equipo.
- Deriva numerica frente a la referencia: aunque pequena, el paso a bf16 degrada ligeramente la similitud de hablante (CAM++ −0,023) y la calidad percibida (DNSMOS −0,01); aceptable, pero a vigilar en clonacion de voz sensible.
- Riesgo de edicion no intencionada: al controlarse por lenguaje natural, una instruccion ambigua puede alterar palabras, prosodia o timbre fuera del rango deseado. Conviene validar con ASR y metricas de similitud antes de publicar audio.
- Idiomas soportados no documentados en la informacion disponible: no se puede asumir cobertura multilingue sin verificacion.
- Sesgos acusticos: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo por acento, genero o edad; la funcion de "de-accent" puede ademas amplificar decisiones normativas sobre el habla.
- Uso etico: la clonacion de voz y la edicion paralinguistica exigen consentimiento explicito del hablante y mecanismos de marca de agua o deteccion; el modelo no incorpora salvaguardas documentadas contra suplantacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/AuK-bf16
- Modelo original: https://huggingface.co/tencent/AuK
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08936
- Codigo original de Tencent: https://github.com/Tencent-Hunyuan/AuK
- Issue sobre el codificador permisivo: https://github.com/Tencent-Hunyuan/AuK/issues/13
- Port Swift con especificacion y mediciones: https://github.com/xocialize/mlx-auk-swift
- Port alternativo a MLX: https://github.com/vanch007/mlx-AuK
- Codificador Qwen2.5-Omni-3B thinker (MLX): https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-bf16
- Comunidad MLX: https://huggingface.co/mlx-community
