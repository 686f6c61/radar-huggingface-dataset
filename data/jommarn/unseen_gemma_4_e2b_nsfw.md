# Jommarn/UNSEEN_Gemma_4_E2B_NSFW

## Resumen
El modelo `Jommarn/UNSEEN_Gemma_4_E2B_NSFW` es una adaptación no oficial de `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 desarrollado por Google DeepMind. La modificación principal consiste en la eliminación permanente de los mecanismos de rechazo (refusal) mediante una técnica de abliteración por proyección ortogonal aplicada a todas las capas del transformador. El resultado es un modelo capaz de generar contenido explícito y NSFW sin filtros, tanto en inglés como en tailandés, manteniendo las capacidades de visión y lenguaje del modelo base.

Con 5.104.297.539 parámetros (según los pesos en safetensors), el modelo se posiciona en un rango medio-bajo dentro de la familia Gemma. La arquitectura es de tipo transformer multimodal (image-text-to-text), y el repositorio indica compatibilidad con vLLM y Transformers. La licencia no está especificada en la ficha de HuggingFace, aunque el modelo base Gemma 4 tiene su propia licencia que restringe el uso comercial en ciertos casos. Este modelo está pensado para usuarios que necesitan generación de texto sin censura, principalmente en contextos de ficción erótica o investigación sobre seguridad de modelos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 E2B tiene 8K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en bfloat16) |
| Idiomas soportados | th, en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `google/gemma-4-E2B-it` y se somete a un proceso de abliteración. Según la model card, se extrae el vector de rechazo calculando la diferencia media de activaciones entre descripciones de imágenes seguras y prompts NSFW en una capa intermedia. Ese vector se resta de forma permanente de las proyecciones de salida (`o_proj` y `down_proj`) de todas las capas del residual stream, utilizando una proyección ortogonal. Esto garantiza que el modelo no pueda representar la intención de rechazo en su flujo residual, produciendo salidas sin filtrar.

No se proporcionan detalles sobre el entrenamiento adicional, número de tokens, composición del dataset o técnicas como RLHF o DPO. El modelo base Gemma 4 E2B es conocido por su eficiencia y capacidad de razonamiento, pero esta variante no incluye información sobre el proceso de entrenamiento más allá de la abliteración.

## Capacidades
- Generación de texto sin censura, incluyendo contenido explícito, NSFW y tabú.
- Procesamiento multimodal: acepta imágenes y texto como entrada (image-text-to-text).
- Soporte bilingüe inglés y tailandés, con capacidad de generar jerga callejera tailandesa.
- Compatible con vLLM para inferencia de alto rendimiento, al estar modificado a nivel de pesos y no requerir hooks de PyTorch.
- Compatible con Transformers mediante `AutoProcessor` y `AutoModelForCausalLM`.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso específicas más allá de las del modelo base.

## Casos de uso
- Generación de ficción erótica explícita: el modelo puede producir relatos detallados en inglés o tailandés, útil para escritores o plataformas de contenido adulto.
- Descripción de imágenes con contenido sexual: al ser multimodal, puede analizar una imagen y generar una narración explícita de la misma.
- Investigación sobre alineación y seguridad: estudiar cómo la abliteración afecta el comportamiento del modelo y qué mecanismos internos se eliminan.
- Desarrollo de aplicaciones de chat sin filtros para adultos, donde se requiere que el modelo no rechace peticiones explícitas.
- Pruebas de estrés de sistemas de moderación: evaluar la capacidad de otros modelos o filtros para detectar contenido generado por este modelo.
- Experimentación con técnicas de edición de pesos: comparar el rendimiento de abliteración por proyección ortogonal frente a otros métodos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para esta variante. El modelo base Gemma 4 E2B tiene resultados públicos, pero no se confirma que esta modificación los mantenga.

## Requisitos de hardware
- VRAM estimada: el repositorio pesa 10.2 GB en bfloat16, por lo que la inferencia en ese formato requiere al menos 12 GB de VRAM. Con cuantización a 8 bits se podría reducir a ~6 GB, y con 4 bits a ~3 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para bfloat16, una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Con cuantización, una RTX 3060 (12 GB) o incluso una RTX 4060 (8 GB) podrían funcionar.
- Es posible ejecutarlo en CPU con baja velocidad, dado el tamaño moderado, pero no es recomendable para producción.
- Opciones de despliegue: vLLM (compatible según la model card), Transformers con `device_map="auto"`, y potencialmente llama.cpp si se convierten los pesos a GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jommarn/UNSEEN_Gemma_4_E2B_NSFW | 5.1B | no disponible | Sí | no disponible | HuggingFace |
| google/gemma-4-E2B-it (base) | 2.1B (según web) | 8K | No (texto) | Gemma license | HuggingFace |
| justfrfn/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No hay datos de benchmarks comparativos. La comparativa se limita a características básicas y es incompleta por falta de información pública.

## Limitaciones y advertencias
- Contenido explícito: el modelo está diseñado para generar material NSFW extremo, lo que puede resultar ofensivo o inapropiado en muchos contextos.
- Riesgo de sesgos: al no contar con información sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza u otros.
- Alucinaciones: como todo modelo generativo, puede producir afirmaciones falsas o incoherentes, especialmente en contextos no sexuales.
- Licencia: la licencia del modelo base Gemma 4 restringe el uso comercial en ciertos casos (empresas con más de 100M de facturación). Esta variante no especifica licencia, por lo que su uso legal es incierto.
- Sin garantías de seguridad: la abliteración elimina los mecanismos de rechazo, pero no garantiza que el modelo no genere contenido ilegal (como descripciones de actos no consentidos). El autor advierte que no se debe usar para contenido ilegal.
- Limitaciones de idioma: solo soporta inglés y tailandés; otros idiomas pueden producir resultados de menor calidad.
- Sin soporte oficial: es un modelo de un tercero, no avalado por Google DeepMind, y puede tener vulnerabilidades no documentadas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Jommarn/UNSEEN_Gemma_4_E2B_NSFW
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Información sobre Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Variante similar (justfrfn): https://huggingface.co/justfrfn/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive
- Otro modelo relacionado: https://huggingface.co/WithinUsAI/Gemma4-Most.Seen.Unseen.Reasoner-E2B
