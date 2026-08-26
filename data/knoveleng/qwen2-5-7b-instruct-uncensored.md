# knoveleng/Qwen2.5-7B-Instruct-Uncensored

## Resumen

El modelo `knoveleng/Qwen2.5-7B-Instruct-Uncensored` es una variante "abliterated" (ortogonalización de pesos) del modelo `Qwen/Qwen2.5-7B-Instruct`, desarrollada por el usuario knoveleng mediante la herramienta **orthex**, una implementación del método descrito en el artículo de Arditi et al., *"Refusal in Language Models Is Mediated by a Single Direction"* (NeurIPS 2024). El objetivo es eliminar el comportamiento de rechazo del modelo base, de modo que responda a peticiones que normalmente declinaría, manteniendo en lo posible las capacidades generales del modelo original.

Se trata de un modelo transformer decoder-only con 7.615.616.512 parámetros, basado en la arquitectura Qwen2, con una ventana de contexto de 131.072 tokens (heredada del modelo base). La modificación se aplica directamente sobre los pesos del checkpoint, sin necesidad de hooks en tiempo de inferencia. El modelo está pensado para tareas de red-teaming, investigación de robustez y análisis de comportamiento de modelos de lenguaje, y su uso queda sujeto a la licencia del modelo base (Apache 2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredado del modelo base: principalmente chino e ingles) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con normalización RMSNorm, atención con sesgo de posición rotatorio (RoPE) y capas de atención con QKV. La modificación "abliterated" se realiza mediante **ortogonalización de pesos** (weight orthogonalization), una técnica que identifica una dirección en el espacio de activaciones (en este caso, en `resid_pre` de la capa 16) asociada al comportamiento de rechazo, y proyecta los pesos de las capas objetivo para eliminar esa dirección. Concretamente, se aplica la ablación sobre `embed_tokens`, las salidas de atención (`attn_out`) y MLP (`mlp_out`) de cada capa, y `lm_head` (que se ablaciona por separado, desacoplado de `embed_tokens`).

No hay entrenamiento adicional (ni SFT ni RLHF); la modificación es puramente una transformación de los pesos del checkpoint. Según la model card, la tasa de rechazo medida sobre un conjunto de prompts de prueba pasa de 0.62 a 0.00, mientras que la perplejidad aumenta de 22.41 a 31.49, lo que indica una ligera degradación en la fluidez del modelo tras la ablación.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código, con rendimiento similar al modelo base (aunque con posible degradación por el aumento de perplejidad).
- Soporte de tool calling y function calling, probablemente heredado del modelo base (no confirmado explícitamente en la documentación).
- Capacidades multilingües, principalmente chino e inglés, heredadas del modelo base.
- Ausencia de mecanismo de rechazo: el modelo responde a peticiones que el modelo base declinaría, incluyendo contenido potencialmente dañino o controvertido.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- **Red-teaming y evaluación de seguridad**: el modelo permite probar la robustez de sistemas de moderación y filtros de contenido, generando respuestas que los modelos estándar rechazarían. Se puede usar para identificar vulnerabilidades en pipelines de seguridad.
- **Investigación en interpretabilidad**: al eliminar la dirección de rechazo, se puede estudiar cómo se comporta el modelo sin ese mecanismo, ayudando a entender la representación interna de conceptos de seguridad y alineación.
- **Análisis de sesgos y comportamientos extremos**: útil para investigar qué tipo de contenido genera el modelo cuando no hay restricciones, lo que puede revelar sesgos latentes o patrones de generación problemáticos.
- **Generación de contenido creativo sin restricciones**: para proyectos de escritura o narrativa que requieran explorar temas tabú o controvertidos, siempre que se haga en un entorno controlado y con fines legítimos.
- **Pruebas de robustez de modelos de lenguaje**: se puede comparar el comportamiento del modelo abliterated con el original para medir el impacto de la eliminación del rechazo en tareas de razonamiento o generación.
- **Desarrollo de técnicas de alineación**: sirve como caso de estudio para evaluar métodos de "unlearning" o modificación de comportamientos no deseados, comparando con otras técnicas como fine-tuning o DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye una evaluación específica sobre un conjunto de prompts de prueba, con los siguientes resultados:

| Metrica | Pre-ablacion | Post-ablacion | Delta |
|---|---|---|---|
| Tasa de rechazo | 0.62 | 0.00 | -0.62 |
| Perplejidad | 22.41 | 31.49 | +9.08 |

Estos datos indican que la ablación elimina por completo el rechazo, pero a costa de un aumento notable de la perplejidad, lo que sugiere una posible pérdida de coherencia o fluidez en algunas generaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP16 (15.2 GB), se necesitan al menos 16 GB de VRAM. Con cuantización a 8 bits (~8 GB) o 4 bits (~4-5 GB), puede ejecutarse en GPUs de consumo.
- **GPUs recomendadas**: RTX 3090/4090 (24 GB) para FP16, o RTX 3060/4070 (12 GB) con cuantización 8-bit. Para despliegue en servidor, A10, A100 o H100.
- **Compatibilidad con GPUs de consumo**: sí, con cuantización. Por ejemplo, una RTX 4060 Ti de 16 GB puede ejecutar el modelo en FP16, y una RTX 3060 de 12 GB con cuantización 8-bit.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), o directamente con Transformers de HuggingFace.
- **Latencia y throughput**: no se dispone de datos medidos. En una RTX 4090, se puede esperar una generación de 20-40 tokens/s con FP16, y mayor con cuantización, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo de "uncensoring" | Notas |
|---|---|---|---|---|---|
| knoveleng/Qwen2.5-7B-Instruct-Uncensored | 7.6B | 131k | Apache 2.0 | Abliteration (ortogonalizacion de pesos) | Sin rechazo, perplejidad aumentada |
| Qwen/Qwen2.5-7B-Instruct (base) | 7.6B | 131k | Apache 2.0 | - | Modelo original con rechazo activo |
| Orion-zhen/Qwen2.5-7B-Instruct-Uncensored | 7.6B | 131k | Apache 2.0 (presumible) | Fine-tuning SFT + DPO | Mantiene mejor calidad, pero aun falla en escenarios extremos |

La comparativa muestra que la version de knoveleng usa un metodo puramente basado en pesos (sin entrenamiento), mientras que la de Orion-zhen emplea fine-tuning, lo que suele preservar mejor las capacidades generales. Sin embargo, la version de knoveleng elimina el rechazo de forma mas radical (tasa 0.00 frente a una reduccion parcial en Orion-zhen).

## Limitaciones y advertencias

- **Riesgo de contenido danino**: al eliminar el rechazo, el modelo puede generar instrucciones peligrosas, discurso de odio, contenido ilegal o desinformacion. No debe usarse en produccion sin filtros adicionales.
- **Degradacion de calidad**: el aumento de perplejidad (de 22.41 a 31.49) sugiere que la fluidez y coherencia pueden verse afectadas, especialmente en tareas complejas.
- **Sesgos heredados**: el modelo base ya contiene sesgos de los datos de entrenamiento; la ablacion no los corrige y podria amplificarlos al no haber filtros de seguridad.
- **Alucinaciones**: como cualquier LLM, puede inventar hechos o datos, y al no tener rechazo, es mas probable que genere afirmaciones falsas con confianza.
- **Restricciones de licencia**: la licencia es Apache 2.0, pero el uso responsable queda bajo la politica del modelo base. No se otorgan derechos adicionales para usos malintencionados.
- **Limitaciones de contexto**: aunque soporta 131k tokens, el rendimiento en contextos muy largos puede degradarse, y la ablacion podria empeorar la coherencia a larga distancia.
- **Idiomas**: el modelo esta optimizado principalmente para chino e ingles; otros idiomas pueden tener peor rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/knoveleng/Qwen2.5-7B-Instruct-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2406.11717
- Repositorio de orthex: https://github.com/knoveleng/orthex
- Variante similar (Orion-zhen): https://huggingface.co/Orion-zhen/Qwen2.5-7B-Instruct-Uncensored
