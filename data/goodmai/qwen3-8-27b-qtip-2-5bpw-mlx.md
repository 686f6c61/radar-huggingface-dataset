# goodmai/Qwen3.8-27B-QTIP-2.5bpw-MLX

## Resumen

Qwen3.8-27B-QTIP-2.5bpw-MLX es una cuantización extrema de 2,5 bits por peso (bpw) del checkpoint Qwen3.5-27B, publicada por el usuario goodmai y orientada exclusivamente al ecosistema Apple Silicon mediante la librería MLX. El modelo base es Qwen/Qwen3.5-27B, un transformer denso de la familia Qwen3.5; la versión aquí descrita se deriva a su vez de mlx-community/Qwen3.8-27B-GPTQ-4bit, sobre la que se aplica una segunda pasada de cuantización QTIP con trellis de desplazamiento de bits. El resultado son 400 proyecciones lineales cuantizadas con rotación de Hadamard de Kronecker bilateral (RHT) y realimentación de Hessiano BlockLDLQ.

El interés principal de esta ficha es el compromiso entre huella en disco y calidad: el checkpoint completo ocupa 10,00 GB, lo que permite ejecutar un modelo nominalmente de 27B en equipos con 24 GB de memoria unificada, como un Apple M4 Pro. Según las mediciones del autor, la perplejidad en WikiText-2 (16k tokens) es de 4,621, inferior a la de alternativas de 3 bits como MLX affine (4,702) y PV-Tuning (4,652), ahorrando además 1,77 GB de espacio.

Es relevante ahora porque demuestra que las técnicas de cuantización post-entrenamiento agresivas (por debajo de 3 bpw) empiezan a ser viables en hardware de consumo para modelos de gran tamaño, algo que hasta hace poco exigía GPUs de centro de datos. No obstante, la información disponible es limitada: no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K), no se documentan idiomas soportados y el número real de parámetros almacenados en safetensors (4.930.962.672) difiere del nominal de 27B del modelo base, lo que sugiere un empaquetado peculiar de los pesos cuantizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), cuantización QTIP 2,5 bpw con trellis de desplazamiento de bits |
| Parámetros totales | 27B nominales (modelo base); 4.930.962.672 parámetros almacenados en safetensors |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QTIP 2,5 bpw (L=16, V=2, HYB Q=9) con Kronecker RHT y BlockLDLQ; derivado de un GPTQ 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer denso de la familia Qwen3.5. Sobre él se aplica una cadena de cuantización en dos etapas: primero una cuantización GPTQ de 4 bits (checkpoint mlx-community/Qwen3.8-27B-GPTQ-4bit), y después una pasada QTIP experimental de 2,5 bpw sobre 400 proyecciones lineales. La técnica QTIP emplea un trellis de desplazamiento de bits (bitshift trellis) con parámetros L=16, V=2 y cuantización híbrida Q=9, combinada con una rotación de Hadamard de Kronecker bilateral (two-sided Kronecker RHT) y realimentación de Hessiano mediante BlockLDLQ.

No se dispone de información sobre el dataset de entrenamiento original de Qwen3.5-27B, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO. La innovación destacable de esta ficha es exclusivamente la metodología de compresión: la combinación de RHT y BlockLDLQ busca preservar la calidad bajo cuantización sub-3-bit, y los resultados de perplejidad reportados por el autor indican que supera a métodos de cuantización affine y PV-Tuning de 3 bits con menor huella. El comando de reproducción documentado es `basalt models convert mlx-community/Qwen3.8-27B-GPTQ-4bit --experimental-qtip 2.5 --out ./out`.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-27B (no verificados de forma independiente en esta cuantización).
- Capacidad de conversación multi-turno (el README enlaza una demo con rol de chat).
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de Python en el runtime Basalt.
- Integración con CLI y servidor REST a través de Basalt (`basalt serve --model ... --rest`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (la demo enlaza variantes en ruso e inglés, pero no se documenta cobertura formal).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en MacBook con memoria unificada de 24 GB: el checkpoint de 10,00 GB permite cargar un modelo de 27B nominales en un Apple M4 Pro, dejando margen para el contexto y el runtime, algo imposible con pesos en fp16 o bf16.
- Asistente de chat privado sin conexión: gracias al servidor REST de Basalt, se puede desplegar un endpoint local de chat para uso personal o de equipo, evitando enviar datos a APIs externas.
- Prototipado rápido de aplicaciones LLM en macOS: al ejecutarse sin Python, encaja en pipelines de desarrollo nativos Swift y en apps de escritorio para macOS 27+.
- Evaluación de técnicas de cuantización: sirve como referencia reproducible para comparar QTIP 2,5 bpw frente a affine 3-bit y PV-Tuning, con comandos de conversión documentados.
- Experimentación académica con modelos comprimidos: útil para estudiar la degradación de calidad bajo cuantización extrema en tareas de perplejidad y precisión de respuesta corta (System One Accuracy 285/300).
- Despliegue de bajo consumo en estaciones de trabajo Apple: al no requerir GPU dedicada, reduce coste energético y de hardware frente a alternativas con A100/H100 para cargas de un solo usuario.

## Benchmarks y rendimiento

| Métrica | Valor medido |
|---|---|
| WikiText-2 16k PPL (4×4096) | 4,621 |
| Comparativa: MLX affine 3-bit | 4,702 |
| Comparativa: PV-Tuning 3-bit | 4,652 |
| System One Accuracy (N=300) | 285/300 (95,0%) |
| Huella de pesos | 10,00 GB |
| Ahorro frente a 3-bit | 1,77 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,00 GB solo para pesos; se recomienda al menos 16-24 GB de memoria unificada para contexto y runtime.
- Hardware de referencia medido: Apple M4 Pro con 24 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra); no está pensado para CUDA.
- Compatibilidad con GPU de consumo NVIDIA: no disponible; el formato MLX no es portable directamente a CUDA.
- Opciones de despliegue: Basalt (macOS 27+, CLI y servidor REST), librería MLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | PPL WikiText-2 16k | Huella | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-QTIP-2.5bpw-MLX | 27B nominales | QTIP 2,5 bpw | 4,621 | 10,00 GB | Apache 2.0 | Apple Silicon (MLX) |
| mlx-community/Qwen3.8-27B-GPTQ-4bit | 27B nominales | GPTQ 4-bit | no disponible | no disponible | Apache 2.0 (heredada) | Apple Silicon (MLX) |
| MLX affine 3-bit (referencia del autor) | 27B nominales | Affine 3-bit | 4,702 | ~11,77 GB (implícito) | Apache 2.0 | Apple Silicon (MLX) |
| PV-Tuning 3-bit (referencia del autor) | 27B nominales | PV-Tuning 3-bit | 4,652 | ~11,77 GB (implícito) | Apache 2.0 | Apple Silicon (MLX) |

## Limitaciones y advertencias

- Cuantización extrema de 2,5 bpw: aunque la perplejidad medida es competitiva, la degradación en tareas de razonamiento, código y matemáticas no está documentada y puede ser significativa.
- El número de parámetros almacenados (4.930.962.672) no coincide con el nominal de 27B, lo que complica la comparación directa con otros checkpoints y sugiere un empaquetado específico que puede limitar la interoperabilidad.
- Dependencia exclusiva del ecosistema MLX y Basalt en macOS 27+; no hay soporte documentado para CUDA, llama.cpp, vLLM u Ollama.
- Idiomas soportados no documentados; el modelo base Qwen3.5 probablemente cubre múltiples idiomas, pero no hay garantía en esta cuantización.
- Riesgo de alucinación: no evaluado en esta variante; los benchmarks publicados se limitan a perplejidad y precisión en un conjunto corto (N=300).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-27B y del checkpoint GPTQ intermedio.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de calidad.
- La model card está parcialmente en ruso y los enlaces de demo apuntan a un espacio de Hugging Face gestionado por el autor, sin SLA ni garantías de disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-QTIP-2.5bpw-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Checkpoint intermedio GPTQ 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (ruso): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-2.5bpw-MLX&role=chat&lang=ru
- Demo Basalt (inglés): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-2.5bpw-MLX&role=chat&lang=en
