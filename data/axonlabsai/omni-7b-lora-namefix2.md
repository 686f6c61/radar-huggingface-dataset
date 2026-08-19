# axonlabsai/Omni-7B-lora-namefix2

## Resumen

El modelo `axonlabsai/Omni-7B-lora-namefix2` es un adaptador LoRA (entrenado con la librería PEFT) diseñado para modificar la identidad del modelo base `axonlabsai/Omni-7B`, con el objetivo de que el asistente se presente como "Ranger Omni" en lugar de "Axon Omni". El adaptador fue creado por el usuario `axonlabsai` y subido a HuggingFace el 18 de agosto de 2026. Según la model card, el entrenamiento utilizó 160 ejemplos de identidad repetidos 3 veces durante 2 épocas, pero el resultado es solo un éxito parcial: las frases informales ("gimme ur name") devuelven "Ranger Omni", mientras que las frases con nombre completo pueden seguir devolviendo "Axon Omni". Además, se advierte que dos LoRA de identidad entrenados por separado se cancelan parcialmente, lo que sugiere que el enfoque de entrenar la identidad en un adaptador separado de las capacidades no es óptimo.

Este adaptador es relevante como caso de estudio sobre las limitaciones del fine-tuning de identidad en modelos de lenguaje, y sobre cómo los adaptadores LoRA pueden interferir entre sí. No se dispone de información sobre el modelo base `Omni-7B` (arquitectura, parámetros, licencia, etc.), por lo que muchas especificaciones quedan sin determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `axonlabsai/Omni-7B` (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0.6 GB en disco, pero se desconoce el número de parámetros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, pero no se especifican cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador está construido con la librería PEFT (Parameter-Efficient Fine-Tuning) y se aplica sobre el modelo base `axonlabsai/Omni-7B`. No se proporcionan detalles sobre la arquitectura del modelo base (si es un transformer denso, MoE, etc.), ni sobre su proceso de preentrenamiento. El entrenamiento del adaptador se describe en la model card: se usaron 160 ejemplos de identidad, repetidos 3 veces, durante 2 épocas. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. Un hallazgo importante reportado por el autor es que dos LoRA de identidad entrenados de forma independiente tienden a cancelarse mutuamente, lo que indica una interacción no deseada entre adaptadores. El autor recomienda entrenar la identidad en el mismo adaptador que las capacidades, en lugar de hacerlo por separado.

## Capacidades

- No se han documentado capacidades específicas para este adaptador. Al ser un LoRA de identidad, su función principal es alterar el nombre con el que el modelo se presenta en conversaciones.
- Se espera que herede las capacidades del modelo base `Omni-7B` (generación de texto, razonamiento, etc.), pero no hay información pública sobre dichas capacidades.
- El adaptador muestra un comportamiento inconsistente: responde "Ranger Omni" a frases informales, pero puede mantener "Axon Omni" en frases con nombre completo.
- No se ha verificado soporte para tool calling, agentes, multimodalidad u otras funcionalidades avanzadas.

## Casos de uso

- Personalización de asistentes conversacionales: el adaptador puede emplearse para que un chatbot se presente con un nombre específico ("Ranger Omni") en interacciones informales, aunque la fiabilidad es limitada debido al renombrado parcial.
- Experimentación con fine-tuning de identidad: sirve como ejemplo práctico para estudiar cómo los LoRA afectan a la autopercepción del modelo y cómo se pueden cancelar entre sí.
- Pruebas de robustez en diálogo: permite evaluar si el modelo responde consistentemente a diferentes formulaciones de la misma pregunta (nombre informal vs. nombre completo).
- Investigación sobre adaptadores múltiples: el caso documentado de cancelación entre LoRA puede utilizarse para analizar interferencias en sistemas con varios adaptadores.
- Desarrollo de pipelines de PEFT: el repositorio puede servir como referencia para implementar entrenamiento de LoRA con pocos datos y evaluar sus limitaciones.
- Benchmarking de identidad en LLMs: útil para comparar la capacidad de distintos adaptadores para cambiar la autoidentificación de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se dispone de comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- No se especifican requisitos de hardware para este adaptador. Al ser un LoRA, su uso requiere cargar el modelo base `Omni-7B` (7B parámetros) más el adaptador.
- Para un modelo de 7B, se estima que con cuantización de 4 bits se necesitan aproximadamente 4-6 GB de VRAM para inferencia, pero esto depende del modelo base y de la implementación.
- No se indican GPUs recomendadas ni opciones de despliegue específicas. En principio, el adaptador puede usarse con frameworks que soporten PEFT, como HuggingFace Transformers, vLLM o llama.cpp (si el modelo base está disponible en GGUF).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA similares con el mismo propósito (cambio de identidad) ni sobre el modelo base `Omni-7B` para establecer comparaciones. No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- El renombrado es parcial: solo funciona con frases informales, no con el nombre completo.
- Se ha observado cancelación entre adaptadores LoRA entrenados por separado, lo que puede degradar el rendimiento si se combinan con otros adaptadores.
- No hay licencia especificada, por lo que se desconoce si se permite uso comercial o modificaciones.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo base no está documentado públicamente, lo que impide conocer sus limitaciones inherentes.
- El adaptador es experimental (según la model card, "rename attempt 2") y no se recomienda para producción sin una evaluación exhaustiva.

## Enlaces

- [HuggingFace - axonlabsai/Omni-7B-lora-namefix2](https://huggingface.co/axonlabsai/Omni-7B-lora-namefix2)
- [HuggingFace - axonlabsai/Omni-7B (modelo base)](https://huggingface.co/axonlabsai/Omni-7B) (enlace inferido, no verificado)
