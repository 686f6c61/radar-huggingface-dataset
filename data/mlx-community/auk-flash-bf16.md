# mlx-community/AuK-Flash-bf16

## Resumen

AuK-Flash es un modelo fundacional de generación y edición de voz de Tencent Hunyuan. Unifica en una única interfaz de instrucciones en lenguaje natural el TTS zero-shot e instruct, la edición de contenido (reemplazar, insertar o borrar palabras), la edición acústica (tono, velocidad, volumen), la edición paralingüística (emoción, timbre, reducción de acento, susurro, sonidos no verbales), la mejora y la separación de fuentes. Esta ficha cubre la conversión a MLX en bf16 publicada por mlx-community para el port Swift xocialize/mlx-auk-swift; no es un modelo nuevo, sino los pesos de tencent/AuK-Flash convertidos.

La arquitectura combina un DiT Flux2Edit (10 bloques MMDiT y 20 single-stream, dimensión 1536, con fusión de 36 capas) y un VAE BigVGAN-Flow a 24 kHz; el pipeline necesita además el encoder semántico Qwen2.5-Omni-3B thinker, distribuido aparte. La receta Flash destilada usa 4 pasos y CFG desactivado (4 pasadas del DiT), con un RTF aproximado de 0,13 en bf16 sobre un M5 Max. No se documentan el número total de parámetros ni una ventana de contexto; el repo ocupa 3,4 GB en bf16 para DiT y VAE.

Su interés actual está en acercar la edición de voz unificada a Apple Silicon mediante MLX y Swift, y en hacerlo con comprobaciones de paridad frente a PyTorch en fp32. Sin embargo, la licencia del encoder obligatorio limita el pipeline completo a investigación y evaluación no comercial, lo que condiciona cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT Flux2Edit con 10 bloques MMDiT y 20 bloques single-stream (dimensión 1536), fusión de 36 capas; VAE BigVGAN-Flow (24 kHz, hop 480, latentes de 64 dimensiones); requiere encoder semántico Qwen2.5-Omni-3B thinker |
| Parámetros totales | no disponible; el repo de 3,4 GB en bf16 contiene DiT y VAE, y el encoder Qwen2.5-Omni-3B se distribuye aparte |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; modelo de voz, no se documenta ventana de contexto textual |
| Tipos de cuantización | bf16 en este repo; encoder Qwen2.5-Omni-3B disponible en bf16, 8 bits y 4 bits; no se documentan GGUF |
| Idiomas soportados | no disponible |
| Licencia | Pesos DiT y VAE: MIT. Pipeline completo: limitado por el encoder Qwen2.5-Omni-3B, bajo Qwen Research License Agreement (solo investigación y evaluación, no comercial) |
| Formato de pesos | safetensors (`dit.safetensors`, `vae.safetensors`) con layout MLX; `config.json` |

## Arquitectura y entrenamiento

AuK-Flash es un modelo de difusión para voz, no un transformer autoregresivo de texto. La rama principal es un DiT Flux2Edit con 10 bloques MMDiT y 20 bloques single-stream, dimensión 1536, más una fusión de 36 capas; el VAE es BigVGAN-Flow a 24 kHz, hop 480 y latentes de 64 dimensiones. El pipeline requiere un encoder semántico Qwen2.5-Omni-3B thinker que procesa la instrucción y el audio de entrada; sin ese encoder el modelo no funciona. La variante Flash emplea una receta destilada de 4 pasos con CFG desactivado, lo que reduce la inferencia a 4 pasadas del DiT.

No se dispone de información sobre tokens de entrenamiento, composición del conjunto de datos, RLHF/DPO ni detalles del proceso de destilación más allá de la receta de 4 pasos. La conversión a MLX se hizo desde tencent/AuK-Flash@575b92f0 con Tools/convert/convert.py; las convoluciones usan layout MLX (O, K, I), los nombres de claves se mantienen del upstream y una puerta V1 verifica que la conversión fp32 coincide bit a bit con los pesos plegados del upstream. Los pesos de fusión, escala y frecuencias RoPE se guardan en fp32; el resto en bf16. El VAE tiene las estadísticas de normalización y los taps antialias en fp32, el weight-norm plegado y eliminado el flujo de acoplamiento usado solo en entrenamiento.

## Capacidades

- TTS zero-shot e instruct: genera voz a partir de una muestra de referencia y una instrucción en lenguaje natural.
- Edición de contenido: reemplaza, inserta o elimina palabras de una locución existente.
- Edición acústica: modifica tono, velocidad y volumen.
- Edición paralingüística: cambia emoción, timbre, acento, susurro y sonidos no verbales.
- Mejora y separación: enhancement de voz y separación de fuentes.
- Interfaz unificada: todas las tareas se expresan con instrucciones en lenguaje natural, sin pipelines separados.
- Integración MLX/Swift: API AukPipeline para cargar el modelo y generar audio en Apple Silicon.
- No se documenta tool calling, function calling, soporte de agentes, generación de texto/código, matemáticas ni visión. Es un modelo de voz, no un LLM de propósito general.
- Idiomas: no hay lista publicada en la información disponible.

## Casos de uso

- Corrección de locuciones en doblaje: reemplazar o insertar palabras de una toma sin regrabar, manteniendo la voz y la prosodia; adecuado para errores de guion y localización. Requiere validar la transcripción y la similitud de hablante.
- Postproducción de pódcast: ajustar velocidad, tono o volumen de fragmentos concretos con una instrucción, en lugar de editar manualmente la onda; el VAE a 24 kHz y la edición acústica permiten retoques localizados.
- Audiolibros y narración expresiva: generar o convertir locuciones a un estado emocional o timbre concreto; útil para prototipos de personajes y versiones alternativas de un mismo texto.
- Restauración de entrevistas y archivos de voz: aplicar enhancement y separación para aislar la voz del ruido de fondo; aplicable a material de campo, archivos históricos y grabaciones domésticas.
- TTS zero-shot para demos de asistentes: generar voz a partir de una muestra corta y una instrucción; encaja en pruebas de concepto de interfaces de voz y accesibilidad antes de invertir en un modelo de producción.
- Investigación en edición de voz: evaluar un modelo unificado de edición de contenido, acústica y paralingüística con una sola API; el port MLX facilita experimentos locales en Apple Silicon.
- Herramientas nativas en macOS/iOS: integrar AuKCore en una app Swift de edición de audio local; la inferencia en MLX permite mantener el audio en el dispositivo, sujeto a la licencia del encoder.
- Accesibilidad: generar versiones más lentas o claras de una locución y ajustar prosodia para distintos perfiles; conviene validar inteligibilidad con usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni comparativas de TTS/edición) en la información disponible. Los datos disponibles son de paridad y rendimiento de la conversión:

| Métrica | Resultado | Condiciones |
|---|---|---|
| Paridad de latentes | relL2 ≤ 6,6e-4 | Swift MLX fp32 frente a PyTorch fp32, 6 tareas del cookbook, mismo ruido, Base y Flash |
| Paridad de waveform | ≤ 7,5e-3 | misma condición |
| bf16 frente a fp32 | tasa de error −1,2 puntos; CAM++ SIM −0,023; DNSMOS −0,01 | 36 renders |
| Encoder en 8 bits y 4 bits | pasan la misma puerta de paridad | encoder Qwen2.5-Omni-3B |
| RTF | ≈ 0,13 | bf16, M5 Max, receta Flash de 4 pasos |
| Comprobación V1 de conversión | los pesos fp32 convertidos coinciden bit a bit con los plegados del upstream | conversión desde tencent/AuK-Flash@575b92f0 |

## Requisitos de hardware

- Memoria: el repo suma 3,4 GB en bf16 (DiT y VAE). El encoder Qwen2.5-Omni-3B añade aproximadamente 6 GB en bf16, 3 GB en 8 bits y 1,5-2 GB en 4 bits solo en pesos. Estimación orientativa del pipeline completo: unos 10 GB o más en bf16, unos 6,5 GB o más en 8 bits y unos 5 GB o más en 4 bits, antes de activaciones y buffers.
- GPU recomendadas: Apple Silicon M-series con MLX; el rendimiento medido es RTF ≈ 0,13 en un M5 Max. Este repo no soporta CUDA; para A100, H100 o RTX 4090 habría que usar la implementación PyTorch upstream, no esta conversión.
- GPU de consumo: en el ecosistema Apple, Macs con memoria unificada suficiente; 16 GB puede ser justo para bf16 con encoder y 24 GB o más es más seguro. En NVIDIA de consumo no está soportado por este repo.
- Despliegue: MLX Swift (AuKCore, xocialize/mlx-auk-swift); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se ofrece GGUF.
- Latencia y throughput: RTF ≈ 0,13 en bf16 sobre M5 Max para la receta Flash de 4 pasos; no hay datos de throughput ni de otros SoC o GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/AuK-Flash-bf16 (este) | no disponible | no disponible | RTF ≈ 0,13 bf16 en M5 Max; paridad fp32 relL2 ≤ 6,6e-4 | DiT y VAE MIT; encoder Qwen Research (no comercial) | Hugging Face; MLX Swift |
| tencent/AuK-Flash (original PyTorch) | no disponible | no disponible | no disponible en la información | DiT y VAE MIT; encoder Qwen Research según la model card de la conversión | Hugging Face; GitHub Tencent-Hunyuan/AuK |
| vanch007/mlx-AuK (port MLX alternativo, 1,5B según la búsqueda) | 1,5B según la búsqueda | no disponible | no disponible | no disponible | GitHub |

No se dispone de benchmarks comparativos ni de especificaciones de parámetros del AuK-Flash original; la comparación se limita a disponibilidad, licencia y datos de paridad de esta conversión.

## Limitaciones y advertencias

- Licencia: el pipeline completo no es comercial mientras use el encoder Qwen2.5-Omni-3B bajo Qwen Research License Agreement; la licencia MIT de DiT y VAE no es suficiente por sí sola. Tencent ha indicado que planea un encoder permisivo, pero no está disponible en la información consultada.
- Idiomas: no hay lista publicada de idiomas soportados; no se puede garantizar cobertura multilingüe ni calidad uniforme fuera de los idiomas evaluados por el autor.
- No es un LLM: no se documenta ventana de contexto, tool calling, agentes, generación de texto, código, matemáticas ni visión. Las instrucciones están orientadas a tareas de voz.
- Riesgo de edición no deseada: puede cambiar palabras, insertar contenido o alterar prosodia de forma distinta a la esperada; conviene validar con transcripción, similitud de hablante y escucha humana.
- Degradación en bf16: frente a fp32 se miden CAM++ SIM −0,023 y DNSMOS −0,01 en 36 renders; son diferencias pequeñas, pero relevantes en clonación de voz y producción.
- Conversión no endorsada: Tencent no respalda esta conversión; el repo tenía 0 descargas y 0 likes en el momento de la ficha, lo que limita la validación comunitaria.
- Dependencia de MLX: este repo está pensado para Apple Silicon; no ofrece CUDA, GGUF ni integración con vLLM, llama.cpp, Ollama o TGI.
- Uso dual: la clonación y edición de voz pueden facilitar deepfakes o suplantaciones; es necesario consentimiento explícito, trazabilidad y cumplimiento normativo.
- Calidad de audio: la salida es a 24 kHz; para broadcast, música o doblaje profesional hay que evaluar la calidad con métricas y escucha crítica antes de producir.

## Enlaces

- [mlx-community/AuK-Flash-bf16 en Hugging Face](https://huggingface.co/mlx-community/AuK-Flash-bf16)
- [tencent/AuK-Flash en Hugging Face](https://huggingface.co/tencent/AuK-Flash)
- [Informe técnico arXiv:2609.08936](https://arxiv.org/abs/2609.08936)
- [Repositorio Tencent-Hunyuan/AuK](https://github.com/Tencent-Hunyuan/AuK)
- [Página del proyecto AuK](https://auk-project.github.io/)
- [Port Swift xocialize/mlx-auk-swift](https://github.com/xocialize/mlx-auk-swift)
- [Encoder Qwen2.5-Omni-3B-Thinker-bf16](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-bf16)
- [Issues de Tencent-Hunyuan/AuK sobre el encoder permisivo](https://github.com/Tencent-Hunyuan/AuK/issues/13)
- [Port alternativo vanch007/mlx-AuK](https://github.com/vanch007/mlx-AuK)
