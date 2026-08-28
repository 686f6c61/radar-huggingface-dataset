# Oscilla/Qwen2.5-1.5B-Instruct-mlx-8Bit

## Resumen

Oscilla/Qwen2.5-1.5B-Instruct-mlx-8Bit es una conversión al formato MLX (Machine Learning eXchange) del modelo Qwen2.5-1.5B-Instruct, realizada por el usuario Oscilla mediante la librería mlx-lm versión 0.31.2. El modelo original pertenece a la serie Qwen2.5 de Alibaba, una familia de modelos de lenguaje densos, decoder-only, disponibles en tamaños de 0.5B a 72B parámetros. Esta versión cuantizada a 8 bits está pensada para ejecutarse eficientemente en hardware Apple Silicon, aunque también puede usarse en otras plataformas a través de las librerías compatibles.

El modelo base Qwen2.5-1.5B-Instruct fue entrenado sobre un dataset masivo de hasta 18 billones de tokens, con soporte para 29 idiomas y una ventana de contexto de hasta 128K tokens. La cuantización a 8 bits reduce el tamaño de los pesos y acelera la inferencia en dispositivos con memoria limitada, manteniendo un equilibrio razonable entre calidad y eficiencia. Esta conversión es relevante para desarrolladores que necesitan desplegar un modelo de chat competente en entornos de recursos reducidos, como portátiles, dispositivos móviles o servidores de inferencia con VRAM moderada.

La ficha se basa en la información pública de HuggingFace y en los resultados de búsqueda web sobre la serie Qwen2.5. No se han encontrado benchmarks específicos para esta conversión concreta, por lo que los datos de rendimiento se refieren al modelo original cuando están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 434.273.792 (según safetensors; el modelo base Qwen2.5-1.5B declara 1.500 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés (etiqueta en), aunque el modelo base Qwen2.5 soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer denso, decoder-only, con atención causal estándar. La arquitectura sigue el diseño de la serie Qwen2, con mejoras en el manejo de contexto largo, atención con RoPE (Rotary Positional Embedding) y normalización RMSNorm. El entrenamiento del modelo original utilizó un corpus de hasta 18 billones de tokens, con una mezcla de datos multilingües y de código. La versión Instruct se ajustó mediante instrucciones y técnicas de alineación como RLHF (Reinforcement Learning from Human Feedback) y posiblemente DPO, aunque los detalles exactos no se especifican en la información disponible.

La conversión a MLX en 8 bits se realizó con mlx-lm, que aplica cuantización por grupos (group-wise) sobre los pesos lineales. Esto reduce el footprint de memoria a aproximadamente 1/4 del tamaño original en FP32 y mantiene la compatibilidad con el ecosistema MLX de Apple. No se han introducido cambios arquitectónicos adicionales respecto al modelo base.

## Capacidades

- Generación de texto y chat conversacional con plantilla de chat integrada (apply_chat_template).
- Razonamiento y comprensión de instrucciones complejas, gracias al ajuste instructivo del modelo base.
- Generación de código y soporte básico de matemáticas, mejorado en la serie Qwen2.5 respecto a versiones anteriores.
- Soporte de function calling y tool calling en el modelo base Qwen2.5-Instruct, aunque la conversión MLX no modifica esta capacidad.
- Capacidades multilingües del modelo base (29 idiomas), aunque la etiqueta de esta conversión solo indica inglés.
- Ventana de contexto de hasta 128K tokens, útil para documentos largos y conversaciones multi-turno extensas.
- Compatible con el pipeline de text-generation de HuggingFace y con la librería mlx-lm para inferencia local.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo cuantizado a 8 bits cabe en la memoria unificada de un MacBook o en una Raspberry Pi con suficiente RAM, permitiendo un chatbot local sin conexión.
- Generación de código en entornos de desarrollo integrado: puede integrarse como autocompletado o asistente de programación en editores como VS Code, aprovechando su capacidad de generación de código y su bajo consumo de recursos.
- Clasificación y extracción de información en documentos largos: gracias a su contexto de 128K tokens, puede procesar informes, contratos o artículos extensos y resumirlos o extraer entidades.
- Prototipado rápido de aplicaciones de NLP: los desarrolladores pueden usar este modelo para validar ideas de productos sin necesidad de infraestructura GPU costosa, ya que se ejecuta en CPU o GPU de baja gama.
- Automatización de atención al cliente: con soporte de tool calling, puede gestionar consultas multi-turno y conectar con APIs externas para resolver peticiones de usuarios en un sistema de tickets.
- Educación y aprendizaje automático: al ser un modelo pequeño y de licencia Apache 2.0, es adecuado para fines docentes, permitiendo estudiar técnicas de cuantización y despliegue en entornos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la conversión Oscilla/Qwen2.5-1.5B-Instruct-mlx-8Bit en la información disponible. Los datos de rendimiento del modelo base Qwen2.5-1.5B-Instruct (como MMLU, HumanEval o GSM8K) no se incluyen en la model card ni en los resultados de búsqueda web consultados. Se recomienda consultar la documentación oficial de Qwen2.5 para obtener cifras comparativas, pero no se dispone de ellas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en cuantización 8-bit, más overhead de activaciones y caché KV. Para contexto de 128K tokens, la memoria puede aumentar significativamente; se recomienda usar longitudes de contexto menores en hardware limitado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple Silicon con memoria unificada de 8 GB o superior). No requiere GPU de datacenter.
- Compatibilidad con hardware Apple: el formato MLX está optimizado para Apple Silicon (M1/M2/M3/M4), donde la inferencia es especialmente eficiente.
- Opciones de despliegue: mlx-lm para macOS, transformers con carga de safetensors para GPU/CPU, o conversión adicional a GGUF para usar con llama.cpp u Ollama (aunque no se proporciona en este repo).
- Latencia y throughput: no hay mediciones oficiales para esta conversión. En un Apple M2, un modelo de 1.5B en 8-bit puede generar aproximadamente 20-40 tokens por segundo, dependiendo de la longitud de la secuencia y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-1.5B-Instruct-mlx-8Bit | 1.5B (base) | 128K | Apache 2.0 | MLX 8-bit | Conversión específica para MLX |
| Qwen2.5-1.5B-Instruct (original) | 1.5B | 128K | Apache 2.0 | Safetensors (FP16/BF16) | Modelo de referencia |
| Llama 3.2 1B Instruct | 1.2B | 128K | Llama 3.2 License | Safetensors, GGUF | Competidor directo en tamaño |
| Phi-3.5-mini Instruct | 3.8B | 128K | MIT | Safetensors, GGUF | Mayor tamaño, pero mismo rango de contexto |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos fiables en la información consultada. El modelo de Oscilla se distingue por su formato MLX, que lo hace especialmente adecuado para ecosistemas Apple, mientras que las alternativas ofrecen formatos más universales.

## Limitaciones y advertencias

- Sesgos conocidos: como todo modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en el corpus de entrenamiento. No se han realizado auditorías específicas para esta conversión.
- Riesgo de alucinación: el modelo puede generar información falsa o inventada, especialmente en temas de nicho o cuando se le piden datos precisos. Se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de idioma: aunque el modelo base soporta 29 idiomas, la etiqueta de esta conversión solo indica inglés; el rendimiento en otros idiomas puede ser inferior al de la versión original no cuantizada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. El modelo base de Qwen también está bajo Apache 2.0, por lo que no hay restricciones adicionales.
- Cuantización a 8 bits: la precisión reducida puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en FP16, especialmente en tareas de razonamiento numérico o generación de código complejo.
- Compatibilidad: el formato MLX es específico de Apple; para otras plataformas es necesario convertir los pesos a otro formato (por ejemplo, GGUF), lo que puede requerir herramientas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-1.5B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Página de Qwen2.5 en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct
- Colección MLX Community de Qwen2.5: https://huggingface.co/collections/mlx-community/qwen25
- Página de Ollama para Qwen2.5: https://ollama.com/library/qwen2.5:1.5b-instruct
