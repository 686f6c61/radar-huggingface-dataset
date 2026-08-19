# lattice-research/lattice-quark-1.5b-mlx

## Resumen

Lattice Quark 1.5B es un modelo de lenguaje pequeño (1.500 millones de parámetros) entrenado desde cero por lattice-research, una organización centrada en IA de código abierto. Esta versión con sufijo `-mlx` es una conversión a formato MLX con cuantización de 4 bits, diseñada específicamente para ejecutarse de manera eficiente en hardware Apple Silicon. El modelo sigue la arquitectura `nanochat2`, que incorpora componentes como value embeddings, smear, backout y residual lambdas, y está orientado a tareas de generación de texto y chat.

La relevancia de este modelo radica en su tamaño compacto y su optimización para dispositivos Apple, lo que permite ejecutar inferencias de lenguaje localmente sin depender de la nube. Con una ventana de contexto de 2048 tokens y un vocabulario de 32768 tokens, ofrece una base ligera para aplicaciones de chatbot, asistentes personales y prototipos que requieren baja latencia en entornos con recursos limitados. Su licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat2 (transformer con value embeddings, smear, backout y residual lambdas) |
| Parametros totales | 1.5B (incluyendo value embeddings; el checkpoint cuantizado contiene ~827M parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | MLX 4-bit (group size 64) para lineales; embeddings en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer estándar con 26 capas, dimensión oculta de 1536, 12 cabezas de atención con dimensión de cabeza de 128 y embeddings rotativos (RoPE) con base 100k. La variante `nanochat2` añade componentes específicos: value embeddings (embeddings de valor adicionales), smear (una operación de suavizado sobre las activaciones), backout (una técnica de regularización o salida inversa) y residual lambdas (factores de escala en las conexiones residuales). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica únicamente que el modelo fue entrenado desde cero.

La conversión MLX mantiene los embeddings de token y valor en bf16 mientras cuantiza las capas lineales a 4 bits con grupo de tamaño 64, lo que reduce el tamaño del modelo a aproximadamente 1.7 GB. El tokenizador es un BPE estilo GPT-4 con vocabulario de 32768 tokens, incluido en el repositorio como `nanochat_tokenizer.json`. El formato de chat utiliza marcadores SFT: `<|bos|>`, `<|user_start|>`, `<|user_end|>`, `<|assistant_start|>` y `<|assistant_end|>` (este último como token EOS con id 32763).

## Capacidades

- Generación de texto libre y conversacional en inglés, con formato de chat multi-turno mediante marcadores SFT.
- Modelo ligero (1.5B) apto para inferencia local en dispositivos Apple Silicon con consumo reducido de memoria.
- Soporte de cuantización MLX 4-bit, optimizado para aceleración por Metal en macOS.
- Capacidad de ejecución mediante el runner incluido (`run_quark_terminal.py`) o cualquier cargador compatible con el tipo `nanochat2`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifica soporte multilingüe más allá del inglés.

## Casos de uso

- Chatbots locales para macOS: el modelo puede integrarse en aplicaciones de escritorio o utilidades de línea de comandos que requieran respuestas conversacionales sin conexión, gracias a su tamaño reducido y su compatibilidad con MLX.
- Asistentes personales en dispositivos Apple: al ejecutarse en Apple Silicon con 4-bit, cabe en la memoria unificada de Macs con 8 GB o más, permitiendo asistentes de voz o texto que respeten la privacidad del usuario al no enviar datos a servidores externos.
- Prototipado rápido de aplicaciones de lenguaje: su licencia MIT y su formato MLX facilitan la experimentación en entornos de desarrollo macOS, como generación de respuestas automáticas, resúmenes o clasificación de texto.
- Educación e investigación: al ser un modelo pequeño y de código abierto, es adecuado para estudiar arquitecturas transformer alternativas (nanochat2) y técnicas de cuantización en entornos académicos.
- Generación de contenido asistida: puede usarse para redactar borradores de correos, publicaciones o documentación técnica en inglés, con la ventaja de ejecutarse localmente.
- Sistemas de recomendación conversacional: su formato de chat permite construir interfaces de diálogo para guiar a usuarios en catálogos o bases de conocimiento, siempre que el contexto no supere los 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 4-bit ocupa aproximadamente 1.7 GB en disco, por lo que la memoria necesaria para inferencia ronda los 2-3 GB (incluyendo overhead del runtime MLX).
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de memoria unificada. No está diseñado para GPUs NVIDIA o AMD.
- Capacidad en consumer GPU: sí, cabe en cualquier Mac con Apple Silicon; no aplica a GPUs de escritorio convencionales.
- Opciones de despliegue: MLX (biblioteca nativa), el runner incluido `run_quark_terminal.py`, o cualquier framework que soporte el tipo de modelo `nanochat2` y formato MLX.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.5B cuantizado, se espera una generación fluida en hardware Apple Silicon, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. En términos de tamaño, este modelo se sitúa en la misma categoría que otros LLMs de ~1.5B como TinyLlama-1.1B, Qwen2-1.5B o Phi-2 (2.7B), pero su arquitectura y optimización para MLX lo hacen específico para el ecosistema Apple. La licencia MIT es más permisiva que la de muchos modelos comparables (por ejemplo, Qwen2 usa Apache 2.0, Phi-2 tiene una licencia restringida). Sin embargo, sin benchmarks no es posible establecer una comparación objetiva de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Lattice Quark 1.5B (MLX) | 1.5B | 2048 | MIT | MLX 4-bit |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | PyTorch / GGUF |
| Qwen2-1.5B | 1.5B | 32768 | Apache 2.0 | PyTorch / GGUF |

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, lo que restringe su uso en tareas que requieran ventanas largas, como análisis de documentos extensos o conversaciones prolongadas.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones. Como modelo pequeño entrenado desde cero, es probable que presente tasas de alucinación más altas que modelos de mayor escala.
- La cuantización a 4-bit puede degradar ligeramente la calidad de generación en comparación con el checkpoint original en bf16 (disponible en `lattice-research/lattice-quark-1.5b`).
- El ecosistema MLX es específico de Apple Silicon; no es portable a otros entornos sin conversión adicional.
- No se documentan capacidades de tool calling, agentes o razonamiento estructurado, por lo que no es adecuado para pipelines que requieran interacción con APIs o ejecución de acciones.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su comportamiento en producción.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/lattice-research/lattice-quark-1.5b-mlx
- Checkpoint base (bf16): https://huggingface.co/lattice-research/lattice-quark-1.5b
- Proyecto Lattice (inferencia Rust y Studio macOS): https://github.com/ohdearquant/lattice
