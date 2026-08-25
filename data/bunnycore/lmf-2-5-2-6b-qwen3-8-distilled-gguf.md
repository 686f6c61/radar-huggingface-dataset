# bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled-GGUF

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario bunnycore, destinado a ser usado sobre el modelo base `LiquidAI/LFM2.5-2.6B`. El nombre del archivo sugiere que se trata de una destilación del modelo Qwen3.8 (probablemente de la serie Qwen3.8) aplicada sobre dicho modelo base, aunque no se aporta ninguna documentación técnica que lo confirme. El adaptador tiene 1.179.648 parámetros, lo que es típico de un LoRA de bajo rango, y se ha convertido a formato GGUF para su uso con llama.cpp y herramientas compatibles. La model card está prácticamente vacía, con todos los campos marcados como "[More Information Needed]", por lo que no se dispone de información sobre el entrenamiento, los datos, la licencia o las capacidades reales del modelo. Es un repositorio con cero descargas y cero likes, lo que sugiere que es un experimento personal o una publicación preliminar sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-2.6B (no se especifica la arquitectura del base) |
| Parametros totales | 1.179.648 (solo adaptador LoRA) |
| Parametros activos | No aplicable (adaptador, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador) y GGUF |

## Arquitectura y entrenamiento

No se proporciona ninguna información sobre la arquitectura del modelo base, los datos de entrenamiento, el proceso de destilación ni los hiperparámetros del adaptador. El repositorio incluye el adaptador en formato PEFT (LoRA) y también una conversión a GGUF, probablemente realizada con la herramienta GGUF-my-repo de llama.cpp. El nombre del modelo sugiere que se ha destilado un modelo de la serie Qwen3.8 (posiblemente Qwen3.8-Max, que según la búsqueda web tiene 2,4 billones de parámetros) sobre el modelo base LFM2.5-2.6B, pero no hay evidencia técnica que lo confirme. El tag `arxiv:1910.09700` corresponde al artículo sobre estimación de impacto ambiental de Lacoste et al., lo que indica que se ha calculado la huella de carbono, pero no se incluyen esos datos.

## Capacidades

- Generación de texto: es un modelo de generación de texto, pero no se han documentado sus capacidades específicas.
- Conversación: el tag `conversational` sugiere que puede usarse para diálogos, pero sin evidencia.
- No se dispone de información sobre razonamiento, código, matemáticas, tool calling, agentes, multilingüismo o modos especiales.
- No se ha publicado ninguna demostración o ejemplo de uso.

## Casos de uso

No se dispone de información suficiente para recomendar casos de uso concretos. El modelo base `LiquidAI/LFM2.5-2.6B` es un modelo de 2,6B parámetros de Liquid AI, pero no se conocen sus características ni su rendimiento. El adaptador LoRA podría usarse como una capa de ajuste fino para tareas específicas, pero sin datos de entrenamiento ni evaluación no es posible sugerir aplicaciones prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es muy pequeño (1,18M parámetros) y puede cargarse en cualquier GPU con poca memoria.
- Para usar el modelo completo (base + adaptador), se necesita cargar el modelo base `LiquidAI/LFM2.5-2.6B`, que tiene 2.600 millones de parámetros. En cuantización GGUF de 4 bits (Q4_K_M) se requieren aproximadamente 1,5-2 GB de VRAM, y en 8 bits (Q8_0) alrededor de 3 GB.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), o transformers con PEFT.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con la misma configuración (adaptador LoRA sobre LFM2.5-2.6B) y no hay información sobre el rendimiento del modelo base.

## Limitaciones y advertencias

- Falta total de documentación: no se proporciona información sobre entrenamiento, datos, licencia ni evaluación.
- Riesgo de alucinaciones y sesgos desconocidos al no haber evaluación pública.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- El modelo base `LiquidAI/LFM2.5-2.6B` puede tener sus propias limitaciones, pero no se conocen.
- El nombre del modelo sugiere una destilación de Qwen3.8, pero no hay evidencia de que sea correcta; podría ser un intento de destilación no validado.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled-GGUF](https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled-GGUF)
- Modelo base (referenciado): [LiquidAI/LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B) (no verificado)
- Referencia al artículo sobre impacto ambiental: [Lacoste et al., 2019](https://arxiv.org/abs/1910.09700) (tag del repositorio)
