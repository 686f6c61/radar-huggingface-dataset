# LinjunChen123/Protoss-a

## Resumen

Protoss-a es un modelo de lenguaje grande (LLM) de tipo causal, desarrollado por el usuario LinjunChen123 (también publicado como SNUMPR/Protoss-a) mediante un ajuste fino del modelo base Qwen3-1.7B de Alibaba. El entrenamiento se realizó con la plataforma H2O LLM Studio, una herramienta de código abierto para fine-tuning de modelos de lenguaje. El modelo está orientado a la generación de texto conversacional en inglés y se distribuye con pesos en formato safetensors.

Con 1.720 millones de parámetros, Protoss-a se sitúa en el rango de modelos compactos, lo que lo hace adecuado para entornos con recursos limitados o para despliegues en los que se prioriza la latencia sobre la capacidad bruta. Aunque no se especifican los datos de entrenamiento ni las técnicas de alineación utilizadas, su base Qwen3-1.7B proporciona una arquitectura moderna con atención con normalización QK y MLP con activación SiLU. Su relevancia actual radica en que demuestra cómo se pueden generar modelos especializados a partir de un base público con herramientas accesibles, aunque su adopción en producción requiere validación adicional por la falta de documentación sobre su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen3-1.7B soporta 32 768 tokens, pero no se confirma en este modelo) |
| Tipos de cuantizacion | no disponible (la card menciona carga con load_in_8bit y load_in_4bit, pero no lista formatos específicos) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Protoss-a es un modelo transformer decoder-only basado en la arquitectura Qwen3. La estructura mostrada en la model card indica 28 capas Qwen3DecoderLayer, con dimensión oculta de 2048, 16 cabezas de atención (q_proj y k_proj/v_proj con dimensiones reducidas a 1024, y normalización RMS sobre las cabezas Q y K), y un MLP con proyecciones de 6144 y activación SiLU. El modelo emplea embeddings rotatorios (RoPE) y normalización RMS. Esta configuración es idéntica a la del Qwen3-1.7B original, por lo que se trata de un fine-tuning sobre el modelo base.

El entrenamiento se realizó con H2O LLM Studio, una plataforma que facilita el ajuste fino de LLMs mediante técnicas como LoRA o full fine-tuning. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron métodos de alineación como RLHF o DPO. La ausencia de esta información impide evaluar la calidad del ajuste y su comportamiento frente al modelo base.

## Capacidades

- Generación de texto en inglés en formato conversacional (chat), siguiendo la plantilla de chat de Qwen3.
- Soporte de mensajes multi-turno mediante el chat template estándar de Qwen3.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o tool calling.
- No se indica soporte para agentes, visión o audio.
- Al ser un modelo de 1.7B, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño.

## Casos de uso

- Chatbots de atención al cliente en inglés: el modelo puede gestionar conversaciones multi-turno sencillas, aunque su ventana de contexto no está confirmada y su capacidad de seguimiento de instrucciones puede ser limitada para tareas complejas.
- Generación de respuestas automáticas en foros o redes sociales: su tamaño compacto permite ejecutarlo en hardware moderado, adecuado para prototipos o aplicaciones de bajo coste.
- Asistente de escritura básica: puede ayudar a redactar textos cortos, correos o resúmenes en inglés, siempre que se valide la calidad de las salidas.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo abierto con pesos safetensors, puede servir como punto de partida para ajustes posteriores con H2O LLM Studio u otras herramientas.
- Educación e investigación: útil para estudiar el proceso de fine-tuning de un LLM pequeño y comparar su comportamiento con el modelo base.
- Pruebas de despliegue en entornos con restricciones de memoria: su tamaño de 1.7B permite probar técnicas de cuantización y optimización en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16, el modelo ocupa aproximadamente 3,4 GB de memoria (1.720.574.976 parámetros × 2 bytes). Con cuantización a 8 bits, ~1,7 GB; a 4 bits, ~0,9 GB. Estas son estimaciones teóricas; la memoria real depende del framework y del tamaño del batch.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3050), o 2 GB para cuantización 8-bit. Para uso cómodo, se recomienda una RTX 3060 o superior.
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers (como se muestra en la model card).
- Latencia y throughput: no disponible. En una GPU moderna, un modelo de 1.7B puede generar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Protoss-a | 1,72B | no disponible | no disponible | safetensors | Fine-tune de Qwen3-1.7B |
| Qwen3-1.7B (base) | 1,72B | 32 768 | Apache 2.0 | safetensors | Modelo original, sin fine-tune específico |
| Llama-3.2-1B | 1,23B | 128 000 | Llama 3.2 Community License | safetensors | Modelo compacto de Meta, con buen soporte de tool calling |
| Gemma-2-2B | 2,6B | 8192 | Gemma Terms of Use | safetensors | Modelo de Google, orientado a eficiencia |

La comparativa se basa en datos públicos de los modelos base. No se dispone de resultados de rendimiento de Protoss-a para establecer comparaciones directas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamiento en dominios específicos; es necesario realizar una evaluación propia antes de usarlo en producción.
- El modelo solo está documentado para inglés; su rendimiento en otros idiomas es desconocido.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución.
- Al ser un fine-tune de un modelo base de 1.7B, su capacidad de razonamiento y seguimiento de instrucciones es limitada frente a modelos de mayor tamaño.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que no se puede evaluar la calidad del ajuste ni posibles sesgos introducidos.
- La model card incluye un aviso sobre sesgos y contenido ofensivo, pero no detalla medidas concretas de mitigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LinjunChen123/Protoss-a
- Modelo alternativo (misma publicación): https://huggingface.co/SNUMPR/Protoss-a
- H2O LLM Studio: https://github.com/h2oai/h2o-llmstudio
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
