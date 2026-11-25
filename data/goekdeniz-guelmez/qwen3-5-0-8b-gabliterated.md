# Goekdeniz-Guelmez/Qwen3.5-0.8B-gabliterated

## Resumen

Qwen3.5-0.8B-gabliterated es una variante del modelo multimodal Qwen/Qwen3.5-0.8B a la que se le ha reducido el comportamiento de rechazo mediante la técnica Gabliteration, desarrollada por Gökdeniz Gülmez. El modelo conserva intacta la arquitectura original, incluido el codificador de visión y la cabeza MTP (multi-token prediction), y solo se han modificado 20 matrices de pesos en 10 de sus 24 capas. Se distribuye con licencia Apache 2.0 y está pensado para flujos de trabajo que requieren menos restricciones de rechazo que el modelo base.

La arquitectura es híbrida: 18 capas de Gated DeltaNet combinadas con 6 capas de atención completa con compuertas, con 873,4 millones de parámetros totales (752,4 millones corresponden al modelo de lenguaje) y una longitud de contexto de 262.144 tokens. El vocabulario es de 248.320 entradas con embeddings atados. El modelo base pertenece a la familia Qwen3.5 y procesa tanto texto como imágenes (pipeline image-text-to-text).

La relevancia de esta ficha radica en que documenta una modificación de comportamiento (abliteración) sobre un modelo pequeño y multimodal con contexto muy largo, un caso poco habitual en el ecosistema. El autor reporta una caída de la tasa de rechazo por palabras clave del 84 % al 2 % en 100 prompts dañinos reservados, aunque la evaluación con un juez automático (Qwen3.5-9B) solo baja del 92 % al 77 %, lo que matiza el resultado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas Gated DeltaNet + 6 capas de atención completa con compuertas; codificador de visión de 12 capas |
| Parámetros totales | 873.438.784 (873,4 M); 752,4 M en el modelo de lenguaje |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | No disponible (el autor menciona ejecución en bf16 y soporte MLX, sin listar cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con MLX (mlx-lm, mlx-vlm) |
| Capas | 24 |
| Tamaño oculto / MLP | 1.024 / 3.584 |
| Cabezas de atención (KV) | 8 (2) |
| Vocabulario | 248.320 (embeddings atados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y no ha sido reentrenado: Gabliteration modifica directamente los pesos sin fine-tuning. La arquitectura del modelo base combina capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención completa con compuertas, lo que permite un contexto de 262.144 tokens con un coste de atención reducido en la mayoría de capas. El codificador de visión tiene 12 capas con dimensión oculta 768 y permanece sin cambios.

La modificación de Gabliteration se aplica en dos fases. Primero se calculan los estados residuales del último token para prompts dañinos (mlabonne/harmful_behaviors) y benignos (mlabonne/harmless_alpaca), y se mide la separabilidad por capa; la capa 21 resulta la más separable (puntuación 4,94). En esa capa se extrae una única dirección de rechazo (k = 1) a partir de los vectores singulares derechos principales de las diferencias dañino-menos-benigno emparejadas aleatoriamente. Después se elimina una proyección ridge (λ = 0,05) escalada por un α adaptativo por posición (α_base = 0,8, β = 0,5, con α por capa entre 0,80 y 1,00) de todas las proyecciones que escriben en el flujo residual de las capas 12 a 21: `linear_attn.out_proj` en las capas Gated DeltaNet, `self_attn.o_proj` en las capas de atención completa y `mlp.down_proj` en todas. En total se editan 20 matrices de pesos; el resto de tensores, incluido el codificador de visión y la cabeza MTP, son idénticos bit a bit al original. La reproducibilidad está documentada: el proceso se ejecutó en un Apple M4 (GPU de 10 núcleos, 32 GB) en 3 minutos y 19 segundos con semilla 0 y un objetivo de tasa de rechazo del 10 %.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes y texto combinados (image-text-to-text): el codificador de visión se mantiene intacto.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-0.8B.
- Modo de pensamiento (thinking) presente en el modelo base; las evaluaciones del autor se realizaron con thinking desactivado.
- Comportamiento de rechazo reducido: el modelo tiende a cumplir solicitudes que el original declinaba.
- Compatibilidad con MLX para inferencia en Apple Silicon (mlx-vlm para multimodal, mlx-lm para texto).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible para medir cómo una proyección ridge sobre un subespacio de rechazo afecta al comportamiento sin reentrenar; el autor publica el script y los hiperparámetros.
- Evaluación comparativa de seguridad: permite contrastar la tasa de rechazo medida por palabras clave frente a la medida por un juez LLM (Qwen3.5-9B), útil para estudiar la fiabilidad de las métricas de seguridad.
- Procesamiento de documentos con imágenes en contexto largo: con 262.144 tokens de ventana y codificador de visión, puede analizar informes escaneados o capturas junto a texto extenso en una sola pasada.
- Prototipado en Apple Silicon: al ejecutarse con mlx-vlm y mlx-lm en un M4 de 32 GB, es adecuado para desarrollo local de asistentes multimodales sin GPU dedicada.
- Generación de contenido creativo sin filtros: para aplicaciones donde el rechazo del modelo base resulta un obstáculo (ficción, guiones, role-play), con la advertencia de que la responsabilidad de uso recae en el desarrollador.
- Extracción y resumen de información de capturas o diagramas: el pipeline image-text-to-text permite transcribir y resumir contenido visual en flujos de documentación técnica.
- Base para fine-tuning posterior: al ser un checkpoint pequeño (873 M) con licencia Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

| Métrica | Qwen3.5-0.8B | Qwen3.5-0.8B-gabliterated |
|---|---:|---:|
| Tasa de rechazo por palabras clave (100 prompts dañinos reservados) | 84 % | 2 % |
| KL del primer token frente al original (100 prompts benignos) | 0 | 0,0252 |
| Tasa de rechazo según juez Qwen3.5-9B (mismas completaciones, pesos bf16) | 92 % | 77 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor indica explícitamente que aún no se han ejecutado sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,8 GB para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, unos 2-4 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, unos 0,5 GB (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para bf16; A100, H100, RTX 4090, RTX 3090 y similares funcionan sin problema por el tamaño reducido.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores; también en iGPU con suficiente memoria compartida.
- Apple Silicon: el autor lo ejecutó en un M4 de 10 núcleos de GPU y 32 GB con MLX 0.32.3.
- Opciones de despliegue: transformers (AutoModelForImageTextToText), mlx-vlm y mlx-lm; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-0.8B-gabliterated | 873 M | 262.144 | Texto + imagen | Apache 2.0 | Rechazo reducido; sin benchmarks estándar publicados |
| Qwen/Qwen3.5-0.8B (base) | 873 M | 262.144 | Texto + imagen | Apache 2.0 | Comportamiento de rechazo original (84 % por palabras clave) |
| Variantes abliteradas de la familia Qwen (otros tamaños) | No disponible | No disponible | Texto | Apache 2.0 | El autor menciona búsqueda por tamaño en sus figuras, sin datos concretos en la información disponible |

## Limitaciones y advertencias

- La detección de rechazos se basa en coincidencia de palabras clave sobre completaciones greedy de 48 tokens con thinking desactivado; es aproximada, no detecta rechazos suaves y puede marcar respuestas que citan frases de rechazo.
- La métrica KL (0,0252) mide la divergencia del primer token en 100 prompts benignos, no la capacidad general; no sustituye a una evaluación de rendimiento.
- El juez automático Qwen3.5-9B indica que el modelo sigue rechazando el 77 % de los prompts dañinos, muy por encima del 2 % que sugiere la métrica por palabras clave; la reducción real de rechazos es menor de lo que aparenta.
- No se han ejecutado benchmarks estándar sobre este checkpoint, por lo que se desconoce si la modificación de pesos degrada capacidades de razonamiento, código o matemáticas.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La reducción de rechazos implica que el modelo cumplirá solicitudes que el original declinaba; el autor traslada al usuario la responsabilidad de uso y despliegue.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y de benchmarks hace recomendable una validación propia antes de producción.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; se heredan los del modelo base Qwen3.5-0.8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Qwen3.5-0.8B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de Gabliteration (arXiv:2512.18901): https://arxiv.org/abs/2512.18901
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts benignos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
