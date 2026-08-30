# Rin247/Qwen3-8B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3-8B-Uncensored-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo base Qwen3-8B, modificado mediante un proceso de "abliteration" que elimina la dirección de rechazo (refusal direction) mediante proyección ortogonal. El resultado es una versión sin restricciones de seguridad del modelo original, empaquetada en formato safetensors con escalas almacenadas junto a los pesos. El autor, Rin247, lo presenta como parte de la forja *Genesis of Aquarion*.

Esta ficha se basa exclusivamente en la información proporcionada en la model card y en los datos técnicos del repositorio. No se dispone de información sobre el proceso de entrenamiento, benchmarks, o capacidades específicas más allá de lo declarado. El modelo está diseñado para ser cargado mediante recetas personalizadas de cuantización, requiriendo dequantización con los buffers de escala y forma antes de su uso en un motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3-8B) |
| Parametros totales | 4.717.851.648 (según safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only, RTN en CPU) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y formas almacenadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-8B, un transformer denso con capacidades de razonamiento y modo de pensamiento, tal como se describe en el informe técnico de Qwen3. Sin embargo, este repositorio no proporciona detalles sobre la arquitectura interna más allá de la referencia al modelo base. El proceso de "abliteration" se realiza mediante proyección ortogonal de la dirección de rechazo, una técnica que modifica los pesos para eliminar el comportamiento de rechazo sin afectar la capacidad general del modelo. La cuantización se aplica después de este proceso, utilizando un método RTN (round-to-nearest) ejecutado en CPU, almacenando escalas y formas junto a los pesos cuantizados en archivos safetensors. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto sin filtros de rechazo, gracias al proceso de abliteration.
- Hereda las capacidades del modelo base Qwen3-8B, que incluyen razonamiento, generación de código, matemáticas y soporte multilingüe (según documentación oficial de Qwen3). Sin embargo, no se confirma en este repositorio.
- Formato de pesos FP4 optimizado para inferencia eficiente en memoria, con escalas almacenadas para dequantización.
- No se documenta soporte explícito de tool calling, agentes o modo de pensamiento en esta variante.

## Casos de uso

- Experimentación en investigación de alineación: el modelo sirve para estudiar el impacto de la eliminación de la dirección de rechazo en el comportamiento de un LLM, comparando respuestas con el modelo original.
- Generación creativa sin restricciones: para proyectos de escritura o narrativa donde se requiera explorar temas que los modelos alineados suelen rechazar, como ficción oscura o contenido para adultos (siempre bajo responsabilidad legal y ética).
- Despliegue en entornos con recursos limitados: al estar cuantizado en FP4, puede ejecutarse en GPUs de consumo con menor VRAM que el modelo original, aunque se necesita un motor que soporte este formato específico.
- Evaluación de robustez: probar la capacidad del modelo para mantener coherencia y razonamiento tras la modificación de pesos, en tareas de benchmark estándar.
- Desarrollo de sistemas de moderación: al carecer de filtros, puede usarse como "modelo adversario" para entrenar clasificadores de contenido dañino.
- Pruebas de compatibilidad de motores de inferencia: validar la carga y dequantización de pesos FP4 con recetas personalizadas en vLLM, llama.cpp u otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el archivo safetensors tiene un tamaño de 6.4 GB, se puede estimar que la inferencia requiere al menos 8-10 GB de VRAM, pero no hay confirmación oficial.
- GPU recomendadas: no disponible. Se espera que sea compatible con GPUs consumer de gama media (RTX 3060 12GB o superior) y GPUs de datacenter, pero no se especifica.
- Opciones de despliegue: se requiere un motor que soporte cuantización FP4 weight-only con escalas personalizadas. No se mencionan vLLM, llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos similares en el repositorio. Como referencia, el modelo base Qwen3-8B es una alternativa densa con 8.1B parámetros y contexto de 32K, mientras que `huihui-ai/Qwen3-8B-abliterated` es otra variante sin censura (también abliterated) pero en precisión completa. La versión de NVIDIA `Qwen3-8B-NVFP4` es una cuantización FP4 oficial, pero no abliterated. No se pueden establecer comparaciones cuantitativas sin datos de rendimiento.

## Limitaciones y advertencias

- Al ser abliterated, el modelo no rechaza contenido dañino, ilegal, violento o sexual explícito. Su uso conlleva riesgos legales y éticos.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- El formato de cuantización FP4 es específico y requiere herramientas de dequantización personalizadas; no es directamente compatible con frameworks estándar sin adaptación.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial.
- El número de parámetros reportado (4.7B) es inferior al del Qwen3-8B original (8.1B), lo que sugiere que el archivo safetensors contiene solo los pesos cuantizados y no el modelo completo; esto debe tenerse en cuenta al evaluar el tamaño real del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3-8B-Uncensored-Aquarion-FP4
- Referencia del modelo base (Qwen3): https://arxiv.org/html/2505.09388v1
- Variante abliterated de referencia: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
