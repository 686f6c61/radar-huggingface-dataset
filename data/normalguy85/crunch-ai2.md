# NormalGuy85/Crunch-Ai2

## Resumen

Crunch-Ai2 es un modelo de lenguaje de tipo chat, creado por el usuario NormalGuy85 como un fine-tuning del modelo Qwen/Qwen2.5-1.5B-Instruct. Se distribuye bajo licencia Apache 2.0 y está orientado a tareas de generación de texto conversacional en inglés. El modelo hereda la arquitectura transformer de Qwen2.5, con 1.540 millones de parámetros y una ventana de contexto de 32.768 tokens, lo que lo sitúa en la gama de modelos pequeños pero capaces de manejar conversaciones de longitud media.

Aunque el repositorio no incluye una model card propia, el autor ha reutilizado la documentación del modelo base, por lo que las especificaciones técnicas corresponden a Qwen2.5-1.5B-Instruct. No se ha publicado información sobre el proceso de fine-tuning, los datos de entrenamiento empleados ni evaluaciones específicas de este modelo concreto. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para aplicaciones de chat que requieran un despliegue eficiente en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y embeddings de palabras atados |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (generación hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct utiliza una arquitectura transformer estándar con 28 capas, 12 cabezas de atención para consultas (Q) y 2 para claves/valores (KV) en configuración GQA (Grouped Query Attention). Emplea rotatory position embeddings (RoPE), SwiGLU como función de activación y RMSNorm para la normalización. El entrenamiento del modelo base incluyó una fase de pre-entrenamiento y otra de post-entrenamiento con instrucciones, pero no se han revelado detalles sobre el fine-tuning específico de Crunch-Ai2.

No se dispone de información sobre el dataset utilizado para el fine-tuning, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. Dado que el autor no ha documentado el proceso, cualquier afirmación sobre el entrenamiento de este modelo concreto sería especulativa. Se recomienda tratar las capacidades del modelo como las del base, sin garantías de mejoras o cambios específicos.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, siguiendo el formato de chat de Qwen2.5.
- Instrucciones y seguimiento de prompts: hereda la capacidad del base para interpretar instrucciones y generar respuestas coherentes.
- Razonamiento básico y matemáticas: el modelo base mostró mejoras en estas áreas, aunque no hay evaluación específica para este fine-tune.
- Generación de código: Qwen2.5-1.5B-Instruct tiene capacidades de programación, pero no se ha verificado en Crunch-Ai2.
- Soporte de tool calling: no se menciona en la documentación; se asume que no está disponible salvo que se indique lo contrario.
- Multilingüismo: el modelo base soporta 29 idiomas, pero este repositorio declara únicamente inglés, por lo que el fine-tuning podría haber reducido el soporte.

## Casos de uso

- Asistente conversacional ligero: ideal para integrar en aplicaciones de chat donde se requiera un modelo pequeño que funcione en CPU o GPU de gama baja, gracias a sus 1,54B parámetros y contexto de 32K tokens.
- Generación de respuestas en inglés para atención al cliente: puede gestionar consultas sencillas y derivar a un agente humano cuando sea necesario, con baja latencia en despliegues locales.
- Prototipado rápido de chatbots: al ser un modelo de tamaño reducido, permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Educación y experimentación: útil para estudiantes o investigadores que quieran estudiar fine-tuning de modelos pequeños o probar técnicas de generación controlada.
- Generación de contenido breve: redacción de correos, resúmenes o textos cortos en inglés, aprovechando su capacidad de seguir instrucciones.
- Despliegue en edge devices: con cuantización (no incluida en el repo, pero posible mediante herramientas externas) podría ejecutarse en dispositivos con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias ni comparativas con otros modelos. Los únicos datos de rendimiento provienen del modelo base Qwen2.5-1.5B-Instruct, que reporta mejoras en codificación y matemáticas, pero no se pueden extrapolar a este fine-tune sin verificación.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 3,1 GB (tamaño del repo), por lo que se necesitan al menos 4 GB de VRAM para inferencia sin cuantizar. Con cuantización a 8 bits o 4 bits, la huella se reduce a ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso Apple Silicon con 8 GB unificados. Para producción, una T4 o A10 es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y text-generation-inference (según las etiquetas del repo).
- Latencia y throughput: no hay datos específicos; en una GPU moderna, un modelo de 1,5B genera decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Crunch-Ai2 (este) | 1,54B | 32K | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | HuggingFace |
| Llama 3.2 1.5B | 1,54B | 128K | Llama 3.2 license | HuggingFace |
| Gemma 2 2B | 2,6B | 8K | Gemma license | HuggingFace |

No se dispone de datos de rendimiento comparativo para Crunch-Ai2. La comparativa se limita a características técnicas. El modelo base Qwen2.5-1.5B-Instruct es la referencia más directa, ya que Crunch-Ai2 es un fine-tune de este.

## Limitaciones y advertencias

- Sesgos del modelo base: Qwen2.5 puede reflejar sesgos presentes en sus datos de entrenamiento, y el fine-tuning no los corrige necesariamente.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en temas especializados.
- Idioma limitado: el repositorio declara solo inglés; el soporte multilingüe del base podría haberse degradado.
- Falta de documentación: no hay información sobre el proceso de fine-tuning, por lo que no se puede evaluar la calidad o los cambios introducidos.
- Sin garantías de producción: al ser un modelo sin métricas publicadas, no se recomienda su uso en entornos críticos sin una evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NormalGuy85/Crunch-Ai2
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper técnico de Qwen2: https://arxiv.org/abs/2407.10671
