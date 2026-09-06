# Novasy/nova-coder-merge-7b

## Resumen

Nova-coder-merge-7b es un modelo de lenguaje generado mediante la fusión de dos modelos base de Qwen2.5: Qwen/Qwen2.5-7B-Instruct, orientado a seguimiento de instrucciones y conversación, y Qwen/Qwen2.5-Coder-7B-Instruct, especializado en generación de código. El proyecto ha sido desarrollado por el usuario Novasy y publicado en Hugging Face, con el objetivo de obtener un modelo que combine las capacidades generalistas de uno con la destreza de programación del otro. No se ha realizado entrenamiento adicional; el resultado es un modelo fusionado de 7.615.616.512 parámetros, construido con la herramienta mergekit y el método TIES. La relevancia de este modelo radica en su posible aplicación directa en entornos de desarrollo, donde se necesitan a la vez habilidades de conversación técnica y de escritura de código. La longitud de contexto no está documentada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Qwen2.5-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos mediante el método TIES, descrito en el artículo "Resolving Interference When Merging Models" (arXiv:2306.01708). La configuración de merge utilizada fue la siguiente: se tomó Qwen/Qwen2.5-Coder-7B-Instruct con un peso de 0.6 y una densidad de 0.6, y Qwen/Qwen2.5-7B-Instruct con un peso de 0.4 y una densidad de 0.6. La fusión se realizó sobre el modelo base Qwen/Qwen2.5-7B-Instruct, con normalización activada y en formato float16. No se ha añadido ningún paso de entrenamiento posterior, ni RLHF, DPO ni ajuste fino. La arquitectura subyacente es un transformer decoder-only, idéntica a la de los modelos Qwen2.5, y no incorpora innovaciones técnicas propias.

## Capacidades

- Generación de texto conversacional: al tomar como base Qwen/Qwen2.5-7B-Instruct, el modelo puede seguir instrucciones y mantener diálogos técnicos, aunque esta capacidad no ha sido evaluada de forma independiente.
- Generación de código: la inclusión de Qwen/Qwen2.5-Coder-7B-Instruct en la fusión sugiere que el modelo puede generar, revisar y completar fragmentos de código en distintos lenguajes de programación.
- Razonamiento técnico: combinando el componente instruct y el coder, el modelo podría abordar tareas que mezclan lógica de programación con explicaciones en lenguaje natural.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no documentadas.
- Visión, audio o modo de pensamiento: no disponibles.

## Casos de uso

- Asistente de programación en un IDE: el modelo puede generar completaciones de código, explicar sentencias complejas y sugerir refactorizaciones. La componente coder del merge lo hace adecuado para este tipo de tareas.
- Documentación técnica automatizada: es posible utilizarlo para generar comentarios y documentación a partir de código fuente, resumir APIs o crear ejemplos de uso para librerías internas.
- Chat técnico de soporte para desarrolladores: puede actuar como asistente de consulta sobre frameworks, sintaxis o buenas prácticas en proyectos de software, apoyándose en su capacidad de diálogo instructivo.
- Generación de pruebas unitarias: dado el componente coder, puede escribir casos de prueba básicos para funciones o módulos, así como explicar las coberturas que cubren.
- Revisión de código: puede analizar fragmentos propuestos, detectar errores comunes y proponer mejoras de estilo o de rendimiento, siempre que se le aporte el contexto suficiente.
- Tutor interactivo de programación: en entornos educativos, el modelo puede ofrecer explicaciones paso a paso de conceptos de programación, resolver dudas puntuales y corregir ejercicios de quien aprende.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en float16: el modelo completo ocupa aproximadamente 15.2 GB, ya que el repositorio publica los pesos en safetensors con ese formato. Se recomienda una GPU con al menos 16 GB de VRAM para mantener el modelo y el contexto activos.
- GPUs recomendadas: A100 40GB, H100 80GB o RTX 4090 24GB para ejecución en float16.
- Con cuantización a 4 bits (por ejemplo mediante GGUF o AWQ), la VRAM estimada se reduce a 4-6 GB, lo que permitiría su ejecución en tarjetas de consumo como RTX 3060 12GB o RTX 4070 Ti.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o la librería Transformers de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova-coder-merge-7b | 7.615.616.512 | No disponible | No disponible | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | No disponible | No disponible | No disponible | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct | No disponible | No disponible | No disponible | Hugging Face |

La comparativa directa no es posible porque no se dispone de datos de contexto, licencia ni rendimiento para los modelos base dentro de la información proporcionada. El valor diferencial de Nova-coder-merge-7b es su naturaleza híbrida: intenta combinar las capacidades de un modelo instructivo con las de un modelo especializado en código, mientras que los modelos base por separado se centran en una sola de estas facetas.

## Limitaciones y advertencias

- Al tratarse de un modelo fusionado sin evaluación específica, el rendimiento real puede ser inferior al de los modelos base en tareas concretas, especialmente en razonamiento complejo.
- Riesgo de alucinación en código no incluido en el corpus de entrenamiento de los modelos base, con posibles errores en APIs poco comunes o en sintaxis de lenguajes minoritarios.
- La licencia no está especificada, lo que representa una barrera directa para su uso comercial. Cualquier despliegue en producción debería confirmar primero los derechos de uso con el autor.
- El modelo puede heredar sesgos presentes en los modelos base, sin que exista documentación al respecto en el repositorio.
- La longitud de contexto no está documentada, lo que limita su adopción en aplicaciones que necesitan ventanas de contexto amplias y predecibles.
- El proyecto no tiene soporte oficial; se trata de un modelo experimental con cero descargas y cero likes, lo que sugiere que no ha sido probado en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Novasy/nova-coder-merge-7b
- Paper TIES (Resolving Interference When Merging Models): https://arxiv.org/abs/2306.01708
- Mergekit: https://github.com/cg123/mergekit
- Qwen/Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Qwen/Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
