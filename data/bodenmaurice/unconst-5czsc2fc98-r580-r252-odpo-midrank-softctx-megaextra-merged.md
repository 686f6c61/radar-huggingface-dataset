# bodenmaurice/unconst-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged

## Resumen

El modelo `bodenmaurice/unconst-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged` es un modelo de lenguaje de razonamiento basado en una arquitectura MoE (Mixture of Experts) con atención affine, derivado del modelo base `unconst/Affine-5czsc2fc98-r252-merged`. Desarrollado por el usuario bodenmaurice, este modelo es el resultado de un entrenamiento de optimización de preferencias directa offline (offline DPO) aplicado sobre pares de razonamiento generados por duelos entre variantes del modelo base, con el objetivo de mejorar la capacidad de razonamiento del sistema.

Con 35.107 millones de parámetros (35.1B) y un peso de 70.2 GB en formato safetensors, el modelo se presenta como una iteración experimental dentro de una serie de entrenamientos que exploran diferentes configuraciones de filtrado (SoftCtx MidRank) y técnicas de optimización (offline DPO, teacher-anchored). La licencia Apache-2.0 permite su uso comercial sin restricciones, aunque al tratarse de un modelo con cero descargas y cero likes, su adopción es aún muy limitada.

La relevancia de este modelo radica en su enfoque metodológico: utiliza pares de preferencia de razonamiento (chosen vs rejected) anclados en el modelo profesor, y aplica un filtro de rango medio (MidRank) sobre la métrica SoftCtx para seleccionar los datos de entrenamiento. Esto lo posiciona como una pieza dentro de un ecosistema de experimentación abierta sobre modelos de razonamiento, aunque su utilidad práctica en producción aún no está demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención affine, basada en Qwen3.5 MoE |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | no disponible (arquitectura MoE, pero sin desglose oficial) |
| Longitud de contexto | no disponible (max_len de entrenamiento: 12288 tokens, pero no se especifica el contexto de inferencia) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura MoE con atención affine, tal como indican los tags `qwen3_5_moe` y `affine`. No se dispone de detalles técnicos adicionales sobre el diseño de la atención (por ejemplo, si es atención lineal, ventana deslizante u otra variante), ni sobre el número de expertos o la estrategia de enrutamiento.

El entrenamiento consistió en un proceso de offline DPO (Direct Preference Optimization) sobre pares de razonamiento anclados por el profesor (teacher-anchored). La selección de datos se realizó mediante un filtro SoftCtx MidRank, que prioriza los pares con puntuación intermedia en la métrica SoftCtx. Los hiperparámetros principales fueron: tasa de aprendizaje de 5e-6, LoRA con r=32 y α=128, β=0.02, longitud máxima de secuencia de 12288 tokens, y un máximo de 3600 pasos (aunque el entrenamiento se detuvo en el paso 259 por agotamiento de datos). El entrenamiento se ejecutó en GPUs B200 (8×B200, usando las GPUs 6 y 7). No se menciona el uso de RLHF, DPO online ni otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento: el modelo está optimizado específicamente para tareas de razonamiento (Reason v3), lo que sugiere una mejora en la cadena de pensamiento (chain-of-thought) y la resolución de problemas lógicos.
- Sin embargo, no se han publicado detalles sobre capacidades específicas como tool calling, agentes, visión o audio. La información disponible solo indica que es un modelo de razonamiento.
- Soporte multilingüe: no se ha declarado ningún idioma específico, por lo que se desconoce su cobertura.

## Casos de uso

- Investigación en optimización de preferencias: el modelo puede ser utilizado como referencia para estudiar el impacto del filtrado SoftCtx MidRank y el offline DPO en modelos MoE de razonamiento, comparando con otras variantes de la misma serie.
- Evaluación de razonamiento matemático y lógico: aunque no hay benchmarks publicados, su diseño orientado a razonamiento sugiere aplicabilidad en tareas de matemáticas, lógica formal y resolución de problemas estructurados.
- Desarrollo de pipelines de generación de datos sintéticos: al estar entrenado con pares de preferencia generados por duelos, podría emplearse para generar datos de entrenamiento adicionales para otros modelos.
- Experimentación académica: su licencia Apache-2.0 permite su uso en entornos de investigación y educación para estudiar arquitecturas MoE con atención affine.
- Prototipado de asistentes de razonamiento: en entornos controlados, podría servir como base para un asistente que requiera explicaciones paso a paso, aunque sin validación de rendimiento.
- Análisis comparativo de métodos de alineación: dado su método de entrenamiento específico, puede usarse para comparar offline DPO con otras técnicas como GRPO o RLHF en modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "evidencia de simulación" (n80 vs live king r252) con una regla de decisión basada en margen pareado, mediana de pensamiento y pase B, pero no se proporcionan cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.1B parámetros en precisión completa (fp32), se necesitarían aproximadamente 140 GB de VRAM. Con cuantización a 8 bits, unos 70 GB; a 4 bits, unos 35 GB. Sin embargo, no se han publicado cuantizaciones oficiales, por lo que estas cifras son estimaciones teóricas.
- GPU recomendadas: para inferencia sin cuantización, se requieren GPUs de clase A100 (80GB) o H100 (80GB) en configuración multi-GPU. Con cuantización 4-bit, podría caber en una RTX 4090 (24GB) o A6000 (48GB), pero no hay garantía de compatibilidad.
- Opciones de despliegue: al estar en formato safetensors, se puede usar con frameworks como vLLM, Hugging Face Transformers, o llama.cpp (si se convierte a GGUF). No hay integración documentada con Ollama u otros.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo pertenece a una serie experimental (Affine) de la que no se han publicado benchmarks públicos. Modelos MoE de tamaño similar como Qwen3-MoE (30B-A3B) o DeepSeek-MoE podrían ser comparables en arquitectura, pero no hay datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no ha sido validado por la comunidad ni sometido a pruebas de robustez.
- Sin benchmarks publicados: no se puede evaluar su rendimiento real en tareas estándar.
- Sin información sobre sesgos o alucinaciones: no se han realizado auditorías de sesgo ni se documentan riesgos de generación de contenido falso.
- Limitación de contexto: aunque el entrenamiento usó secuencias de hasta 12288 tokens, no se especifica la longitud de contexto en inferencia, lo que puede limitar tareas de contexto largo.
- Sin soporte multilingüe declarado: su uso en idiomas distintos al inglés no está garantizado.
- Dependencia del modelo base: al ser un fine-tuning de `unconst/Affine-5czsc2fc98-r252-merged`, hereda sus limitaciones y no añade capacidades nuevas más allá del razonamiento.
- Requisitos de hardware elevados: para un despliegue práctico se necesita infraestructura de alto rendimiento, lo que limita su uso en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r580-r252-odpo-midrank-softctx-megaextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged (no verificado en la búsqueda web, pero referenciado en la model card)
