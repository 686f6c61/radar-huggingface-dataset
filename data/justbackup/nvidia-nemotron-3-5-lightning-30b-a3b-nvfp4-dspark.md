# Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark

## Resumen

El modelo `Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark` es un checkpoint de decodificación especulativa DSpark (Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation) para la familia de modelos NVIDIA Nemotron-3.5-Lightning-30B-A3B. Este checkpoint actúa como modelo auxiliar (draft model) que acelera la inferencia del modelo principal, que es un híbrido LatentMoE de 30B parámetros con 3B activos, diseñado para razonamiento, chat y flujos de trabajo agénticos. La versión DSpark está cuantizada en NVFP4 (punto flotante de 4 bits) mediante NVIDIA Model Optimizer 0.45.0 y está optimizada para su despliegue en DGX Spark (GB10) y centros de datos de baja concurrencia.

El checkpoint DSpark tiene una arquitectura densa GQA (Grouped Query Attention) con aproximadamente 967 millones de parámetros totales (según la model card) y una ventana de contexto de hasta 1 millón de tokens, aunque el peso safetensors real del repositorio muestra 763.713.984 parámetros, posiblemente debido a la cuantización NVFP4. Este modelo no es un modelo de lenguaje independiente; su función es generar propuestas de tokens que el modelo principal valida, reduciendo la latencia en escenarios de generación autoregresiva. El repositorio en HuggingFace es una copia subida por el usuario Justbackup del checkpoint oficial de NVIDIA, con licencia OpenMDW-1.1.

La relevancia de este modelo radica en su capacidad para mejorar el rendimiento de inferencia del Nemotron-3.5-Lightning-30B-A3B en hardware Blackwell, especialmente en entornos donde la latencia es crítica, como asistentes conversacionales, sistemas RAG y agentes autónomos. Al ser un componente de un sistema de decodificación especulativa, no se evalúa de forma aislada, sino como parte del pipeline completo con el modelo principal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense GQA (MLP denso + atención GQA con ventana deslizante de 1024 y attention sink bias) |
| Parametros totales | 967M (según model card) / 763.713.984 (pesos safetensors) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Hasta 1M tokens (heredada del modelo base) |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante) |
| Idiomas soportados | Inglés, español, francés, alemán, italiano y japonés |
| Licencia | OpenMDW-1.1 (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint DSpark es un modelo denso con atención GQA y una ventana deslizante de 1024 tokens en todas las capas, además de un sesgo de attention sink por cabeza. Esta arquitectura está diseñada específicamente para la decodificación especulativa semi-autorregresiva, donde el modelo genera múltiples tokens candidatos en paralelo que luego son verificados por el modelo principal. El entrenamiento se realizó sobre 66 mil millones de tokens, repetidos durante 2 épocas, utilizando únicamente los prompts de los datasets `Nemotron-Post-Training-Dataset-v2` y `Nemotron-Post-Training-Dataset-v3` de NVIDIA (las respuestas originales de GPT no se usaron). Los datos son de modalidad texto, recopilados de forma híbrida (automática, manual y sintética).

La cuantización NVFP4 se aplicó mediante NVIDIA Model Optimizer 0.45.0, lo que reduce el tamaño del checkpoint a aproximadamente 1.3 GB en el repositorio. El modelo está pensado para ejecutarse con vLLM como runtime, y es compatible con microarquitecturas NVIDIA Blackwell (incluida DGX Spark GB10) y Hopper. No se han publicado detalles sobre el proceso de entrenamiento específico del DSpark más allá de los datos mencionados, ni sobre técnicas adicionales como RLHF o DPO, que corresponden al modelo base.

## Capacidades

- Decodificación especulativa: genera propuestas de tokens semi-autorregresivas para acelerar la inferencia del modelo principal Nemotron-3.5-Lightning-30B-A3B.
- Integración con vLLM: compatible con el runtime vLLM para despliegue en producción.
- Soporte de hardware NVIDIA: optimizado para DGX Spark (GB10) y GPUs Hopper (H100, etc.).
- Cuantización NVFP4: reduce el uso de memoria y mejora el rendimiento en hardware Blackwell.
- Ventana de contexto amplia: hereda la capacidad de contexto de hasta 1M tokens del modelo base, aunque la ventana deslizante interna del draft es de 1024 tokens.
- Multilingüismo: soporta inglés, español, francés, alemán, italiano y japonés (según la model card del DSpark).
- No incluye capacidades de tool calling, agentes o razonamiento por sí mismo; estas dependen del modelo principal.

## Casos de uso

- Despliegue en DGX Spark: el checkpoint DSpark permite reducir la latencia de inferencia del Nemotron-3.5-Lightning-30B-A3B en estaciones de trabajo DGX Spark, ideales para desarrollo local y prototipado de aplicaciones de razonamiento.
- Asistentes conversacionales de baja latencia: en entornos de producción con concurrencia moderada, la decodificación especulativa acelera las respuestas en chatbots y asistentes virtuales que usan el modelo base.
- Sistemas RAG (Retrieval-Augmented Generation): al acelerar la generación de respuestas basadas en contexto recuperado, mejora la experiencia del usuario en aplicaciones de búsqueda documental.
- Agentes autónomos: en flujos de trabajo multi-paso donde el modelo principal debe razonar y llamar herramientas, la reducción de latencia del draft model permite iteraciones más rápidas.
- Servidores de inferencia en centros de datos: en entornos de baja concurrencia (pocas peticiones simultáneas), el DSpark puede reducir el tiempo de generación sin necesidad de escalar hardware.
- Investigación en decodificación especulativa: sirve como referencia para estudiar técnicas de semi-autorregresión y programación de confianza en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint DSpark en la información disponible. El rendimiento debe evaluarse en conjunto con el modelo principal Nemotron-3.5-Lightning-30B-A3B, comparando la latencia y el throughput con y sin decodificación especulativa. No hay datos numéricos de aceleración, tokens por segundo ni métricas de calidad (MMLU, HumanEval, etc.) para este componente auxiliar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~967M parámetros cuantizado a NVFP4, el checkpoint ocupa alrededor de 1.3 GB en disco, pero en memoria de GPU puede necesitar algo más (dependiendo de la implementación de vLLM). Se puede ejecutar en GPUs con al menos 8 GB de VRAM, aunque está optimizado para Blackwell.
- GPU recomendadas: NVIDIA DGX Spark (GB10) y GPUs Hopper (H100, H200). También compatible con otras GPUs Blackwell (B200, etc.).
- Compatibilidad con GPU de consumo: es posible ejecutarlo en GPUs como RTX 4090 o RTX 6000 Ada, pero el rendimiento óptimo se logra en hardware Blackwell con soporte nativo para NVFP4.
- Opciones de despliegue: vLLM (runtime soportado oficialmente). No se mencionan otros frameworks como llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos específicos. La ganancia esperada depende del modelo principal y de la tasa de aceptación de tokens propuestos.

## Comparativa con modelos similares

No disponible. Este checkpoint es un componente auxiliar específico para la familia Nemotron-3.5-Lightning-30B-A3B, y no existen modelos comparables directos en el mercado. Podría compararse con otros draft models de decodificación especulativa (como los usados en Medusa o Eagle), pero no se dispone de información pública sobre sus características y rendimiento en este contexto.

## Limitaciones y advertencias

- No es un modelo standalone: requiere el modelo principal Nemotron-3.5-Lightning-30B-A3B (BF16 o NVFP4) para funcionar; por sí solo no genera texto coherente.
- Dependencia de hardware NVIDIA: el soporte NVFP4 y DSpark está limitado a GPUs Blackwell y Hopper con vLLM; no funcionará en hardware AMD o Apple Silicon.
- Licencia OpenMDW-1.1: aunque permite uso comercial y no comercial, tiene términos específicos (por ejemplo, restricciones sobre uso militar o de vigilancia) que deben revisarse antes de implementar en producción.
- Ventana deslizante limitada: el draft model usa una ventana de 1024 tokens, lo que puede afectar la calidad de las propuestas en contextos muy largos.
- Sin datos de sesgos: no se ha publicado información sobre sesgos o alucinaciones específicas de este checkpoint; estos riesgos corresponden principalmente al modelo base.
- Repositorio no oficial: esta copia en HuggingFace (usuario Justbackup) no es un release oficial de NVIDIA, aunque el contenido parece idéntico al original; se recomienda verificar la autenticidad antes de usarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint DSpark oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Paper DSpark: https://huggingface.co/papers/2607.05147
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Colección Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
