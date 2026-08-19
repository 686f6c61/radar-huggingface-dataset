# devoppro/gpt-python-modern-114m

## Resumen

`devoppro/gpt-python-modern-114m` es un modelo de lenguaje decoder-only de aproximadamente 114 millones de parámetros, desarrollado por el usuario `devoppro` y entrenado desde cero (from scratch) sobre un corpus de código Python. Su arquitectura sigue el estilo moderno de los modelos LLaMA/Mistral: incorpora normalización RMSNorm, atención con posiciones rotatorias (RoPE), activación SwiGLU y atención por grupos de cabezas (GQA). El modelo está diseñado específicamente para generación de código Python, aunque su tamaño reducido y su contexto limitado a 512 tokens lo convierten en una propuesta ligera y experimental más que en una herramienta de producción.

La relevancia de este modelo reside en su carácter didáctico y de investigación: al estar entrenado desde cero con una arquitectura moderna, permite estudiar el comportamiento de componentes como RoPE, GQA y SwiGLU en un contexto de generación de código. Sin embargo, su estado de entrenamiento es muy temprano (el autor indica "trained to step 0" con una pérdida de validación de 10.34), lo que sugiere que el modelo no ha sido entrenado lo suficiente para producir resultados útiles. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA/Mistral (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | ~114 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo contiene pesos en formato safetensors según el tamaño del repo) |
| Idiomas soportados | no disponible (entrenado sobre código Python, por lo que el "idioma" principal es Python) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por el tamaño del repo y la etiqueta pytorch; no se confirma explícitamente) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer decoder-only con 12 capas, dimensión de embedding de 768, 12 cabezas de atención para las consultas (query heads) y 4 cabezas para claves y valores (KV heads), lo que implementa Grouped Query Attention (GQA). Esta configuración reduce el número de parámetros en las capas de atención y acelera la inferencia en comparación con la atención multi-cabeza estándar. La normalización se realiza con RMSNorm, la posición se codifica mediante RoPE (Rotary Position Embedding) y la activación de las capas feed-forward es SwiGLU, tres componentes habituales en los modelos modernos de código abierto.

El entrenamiento se realizó sobre el dataset `devoppro/Python`, del que no se especifican el número de tokens ni la composición exacta. El tokenizador empleado es el BPE de GPT-2 (tiktoken 'gpt2'), que tiene un vocabulario de aproximadamente 50.257 tokens. El estado reportado indica "trained to step 0" con una pérdida de validación de 10.3440, lo que sugiere que el entrenamiento apenas ha comenzado o que el checkpoint guardado corresponde al inicio del proceso. No se menciona el uso de técnicas como RLHF, DPO o fine-tuning posterior.

## Capacidades

- Generación de código Python: el modelo está entrenado específicamente sobre código, por lo que su capacidad principal es la síntesis de fragmentos de código en este lenguaje.
- Generación de texto genérico: al ser un modelo de lenguaje, puede producir texto libre, aunque su entrenamiento especializado en código limita su fluidez en lenguaje natural.
- Razonamiento básico: con 114M parámetros y un contexto de 512 tokens, el modelo puede manejar tareas simples de razonamiento, pero no es adecuado para razonamiento complejo o multi-paso.
- Sin soporte de tool calling: no se indica ninguna capacidad de invocación de funciones o herramientas.
- Sin capacidades multimodales: el modelo es exclusivamente de texto y no procesa visión, audio ni otras modalidades.
- Multilingüismo: no se especifica, pero al estar entrenado sobre código Python, su "idioma" principal es el lenguaje de programación; el manejo de idiomas humanos es probablemente limitado.

## Casos de uso

- Aprendizaje e investigación educativa: dado su tamaño reducido y su arquitectura moderna, puede utilizarse en entornos académicos para estudiar el comportamiento de RoPE, GQA y SwiGLU en la generación de código, o para experimentar con técnicas de entrenamiento desde cero en hardware modesto.
- Prototipado rápido de generación de código: en entornos de desarrollo donde se necesite un modelo ligero para autocompletar fragmentos cortos de Python (menos de 512 tokens), puede servir como base para pruebas de concepto, aunque su calidad actual es muy limitada.
- Fine-tuning especializado: al ser un modelo pequeño, puede ajustarse con un dataset específico de código propietario en una sola GPU, permitiendo experimentar con adaptaciones de dominio sin los costes de los modelos grandes.
- Benchmarking de arquitecturas: investigadores pueden comparar esta implementación con otros modelos de tamaño similar para evaluar el impacto de GQA y SwiGLU en la eficiencia de inferencia y la calidad de generación.
- Generación de documentación de código: aunque su entrenamiento está en fase inicial, con un fine-tuning adecuado podría emplearse para generar comentarios o docstrings a partir de fragmentos de código Python.
- Asistente de código en entornos con restricciones de recursos: en dispositivos edge o entornos embebidos con poca memoria, un modelo de 114M parámetros cuantizado podría ofrecer sugerencias básicas de código, siempre que se complete el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación de 10.3440 en el paso 0, que indica un modelo sin entrenamiento efectivo. No se dispone de resultados en MMLU, HumanEval, GSM8K ni otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 114M parámetros, en fp32 se necesitan aproximadamente 456 MB de memoria; en fp16 unos 228 MB; y con cuantización de 4 bits (si estuviera disponible) alrededor de 57 MB. Estas cifras son estimaciones teóricas basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo en fp16, por ejemplo una NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con memoria RAM suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, incluso en las integradas de gama baja si se usa cuantización.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con vLLM, Hugging Face TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dado el tamaño reducido, se espera una latencia de milisegundos en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El modelo no ha sido evaluado en benchmarks estándar y su estado de entrenamiento es inicial. Como referencia orientativa, se podría comparar con GPT-2 de 124M parámetros, que tiene una arquitectura más antigua (sin RoPE, GQA ni SwiGLU) y un contexto de 1024 tokens, pero no se dispone de datos de rendimiento de este modelo para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está en una fase de entrenamiento extremadamente temprana (paso 0) y no es utilizable para tareas reales de generación de código; su pérdida de validación de 10.34 es muy alta.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de cualquier uso en producción.
- El contexto de 512 tokens es muy limitado para la mayoría de tareas de generación de código, que suelen requerir ventanas más amplias.
- No hay información sobre sesgos o alucinaciones; dado su entrenamiento en código, es probable que genere código sintácticamente plausible pero incorrecto lógicamente.
- No se han publicado evaluaciones de seguridad ni de robustez.
- El tokenizador GPT-2 BPE puede no ser óptimo para código Python, ya que fue diseñado para texto en inglés y puede fragmentar identificadores de forma ineficiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/devoppro/gpt-python-modern-114m
- Dataset de entrenamiento: https://huggingface.co/datasets/devoppro/Python
- No se han encontrado papers, blogs o demos adicionales asociados a este modelo.
