# nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16_channel-e2e

## Resumen
El modelo `nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16_channel-e2e` es una versión cuantizada del conocido TinyLlama-1.1B-Chat-v1.0, publicada por la cuenta de pruebas `nm-testing`, asociada al ecosistema de `compressed-tensors` (la librería de compresión de Neural Magic, hoy parte de Red Hat). Se trata de un artefacto de validación end-to-end de un esquema de cuantización de pesos a 8 bits con activaciones en 16 bits (W8A16) y cuantización por canal, aplicado sobre un transformer decoder-only tipo Llama de 1.100.048.384 parámetros.

No es un modelo entrenado desde cero ni un lanzamiento de producto: es un checkpoint de referencia para verificar que el pipeline de cuantización y el formato `compressed-tensors` funcionan correctamente con arquitecturas Llama. Su interés práctico es servir como ejemplo reproducible de cómo se representa un modelo W8A16 en el Hub, qué ficheros y metadatos genera el proceso y cómo se carga en herramientas compatibles como vLLM o transformers con el backend adecuado.

Por su tamaño (1,1 mil millones de parámetros) y su naturaleza de prueba, no debe considerarse un modelo listo para producción sin una evaluación previa. La model card es autogenerada y no aporta información sobre datos de entrenamiento, licencia o idiomas, por lo que la mayoría de especificaciones heredan las del TinyLlama original o quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (derivada de TinyLlama-1.1B-Chat-v1.0) |
| Parámetros totales | 1.100.048.384 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el TinyLlama original soporta 2048 tokens) |
| Tipos de cuantización | W8A16 con cuantización por canal (channel-wise), formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`) |
| Tamaño del repositorio | 9,9 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 60 / 0 |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional, con aproximadamente 1,1 mil millones de parámetros. Este checkpoint concreto no introduce cambios arquitectónicos; la modificación consiste exclusivamente en la cuantización de los pesos lineales a 8 bits con escala por canal de salida, manteniendo las activaciones en 16 bits (W8A16).

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del corpus, fases de SFT/DPO) en la información proporcionada; el modelo base TinyLlama se entrenó sobre aproximadamente 3 billones de tokens según su documentación pública, pero ese dato no aparece en las fuentes consultadas para esta ficha. Tampoco hay detalles sobre calibración, dataset de calibración ni métricas de degradación tras la cuantización. El propósito declarado del repositorio es la validación end-to-end del pipeline de cuantización, no la publicación de un modelo optimizado.

## Capacidades
- Generación de texto conversacional, heredada del modelo base TinyLlama-1.1B-Chat.
- Razonamiento básico y respuesta a instrucciones de complejidad baja o media.
- Generación de código y respuestas a preguntas factuales sencillas, con las limitaciones propias de un modelo de 1,1B.
- Soporte de conversación multi-turno en formato chat (roles system/user/assistant), según la plantilla del modelo original.
- Compatibilidad con `compressed-tensors` para carga en transformers y en motores de inferencia que soporten dicho formato.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso
- Validación de pipelines de cuantización: sirve como referencia para comprobar que una herramienta de compresión produce checkpoints W8A16 cargables y con la estructura esperada en `compressed-tensors`, comparando salidas frente al modelo en fp16.
- Pruebas de integración en motores de inferencia: útil para verificar que vLLM, transformers u otros runtimes cargan correctamente pesos W8A16 por canal antes de aplicar el mismo esquema a modelos mayores.
- Desarrollo y depuración de herramientas de medición: al ser un modelo pequeño, permite iterar rápidamente en scripts de evaluación de perplejidad o de comparación numérica entre versiones cuantizadas y no cuantizadas.
- Docencia y formación interna: ejemplo didáctico de cómo se representa un modelo cuantizado en el Hub (ficheros safetensors, `config.json`, metadatos de cuantización) sin necesidad de grandes recursos de cómputo.
- Pruebas de CI en proyectos de infraestructura de IA: puede integrarse en tests automáticos que verifiquen la compatibilidad de nuevas versiones de librerías con formatos de cuantización.
- Prototipado de asistentes conversacionales ligeros en entornos con GPU modesta, siempre que se acepte la calidad limitada de un modelo de 1,1B y se valide antes de exponerlo a usuarios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card es autogenerada y no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de degradación por cuantización.

## Requisitos de hardware
- VRAM estimada para inferencia en W8A16: aproximadamente 1,1 GB para los pesos cuantizados, más overhead de activaciones, KV cache y runtime; en la práctica, entre 2 y 3 GB para contextos moderados.
- El repositorio ocupa 9,9 GB, lo que sugiere que incluye tanto pesos cuantizados como posiblemente los originales en fp16 u otros artefactos; conviene revisar la lista de ficheros antes de descargar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3050, RTX 3060, RTX 4060, T4 y L4. También cabe en CPU para inferencia de baja concurrencia.
- Cabe holgadamente en GPU de consumo; es uno de los puntos fuertes del checkpoint.
- Opciones de despliegue: transformers con el backend de `compressed-tensors`, vLLM (si la versión soporta W8A16 por canal) y TGI en la medida en que acepte el formato. llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16_channel-e2e | 1,1B | no disponible | W8A16 channel-wise | no disponible | Hugging Face, cuenta de pruebas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | fp16/bf16 (original) | Apache 2.0 (según modelo base) | Hugging Face, ampliamente usado |
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16_channel-e2e | 1,1B | no disponible | W4A16 channel-wise | no disponible | Hugging Face, cuenta de pruebas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens | fp16/bf16, con variantes GGUF/AWQ | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-1.5B-Instruct se incluye como referencia de la categoría de modelos pequeños instructivos; no se dispone de benchmarks del checkpoint cuantizado que permitan comparar rendimiento de forma objetiva.

## Limitaciones y advertencias
- Modelo de pruebas: la cuenta `nm-testing` publica artefactos de validación, no modelos destinados a uso general; no hay garantía de mantenimiento ni de soporte.
- Model card autogenerada: no documenta datos de entrenamiento, licencia, idiomas ni evaluación, lo que impide verificar el cumplimiento legal para uso comercial.
- Licencia no disponible: aunque el TinyLlama original es Apache 2.0, la licencia de este checkpoint no se declara explícitamente; conviene contactar con el autor antes de usarlo en producción.
- Degradación por cuantización no medida: no se han publicado métricas de perplejidad ni de exactitud que cuantifiquen la pérdida frente al modelo en fp16.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (1,1B), especialmente en preguntas factuales y razonamiento multi-paso.
- Contexto limitado (probablemente 2048 tokens, heredado del modelo base) y sin soporte documentado de tool calling ni agentes.
- El tamaño del repositorio (9,9 GB) es desproporcionado para un modelo de 1,1B cuantizado a 8 bits; revisar los ficheros antes de descargarlo para evitar consumir ancho de banda innecesario.
- No apto para tareas de alta precisión (código en producción, matemáticas avanzadas, atención al cliente crítica) sin una evaluación específica del dominio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A16_channel-e2e
- Variante W4A16 del mismo autor: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16_channel-e2e
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio de `compressed-tensors` (Neural Magic / Red Hat): https://github.com/neuralmagic/compressed-tensors
- Paper de referencia sobre cuantización de redes neuronales citado en la model card (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
