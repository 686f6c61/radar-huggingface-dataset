# mradermacher/arcane-13b-GGUF

## Resumen

El modelo `arcane-13b-GGUF` es una cuantización en formato GGUF del modelo original `arcane-13b`, desarrollado por el usuario `ar3xop` y convertido por `mradermacher`. Se trata de un modelo de lenguaje de aproximadamente 13 000 millones de parámetros, cuyo propósito es ofrecer una versión optimizada para inferencia en entornos con recursos limitados, como CPU o GPUs de gama media. La cuantización GGUF permite ejecutar el modelo con menor uso de memoria y mayor compatibilidad con herramientas como llama.cpp, Ollama o LM Studio.

A día de hoy, la información pública sobre este modelo es extremadamente limitada: no se especifican la licencia, los idiomas soportados, la arquitectura interna ni los datos de entrenamiento. La ausencia de una model card detallada por parte del autor original dificulta una evaluación rigurosa. Esta ficha se basa únicamente en los datos disponibles en el repositorio de HuggingFace, complementados con el conocimiento general sobre modelos de 13B cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 13 015 864 320 |
| Parametros activos | no aplica (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios de la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del original, no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original `arcane-13b`. Por el tamaño (13B) y la práctica común, podría tratarse de un transformer decoder-only, pero no hay confirmación. Tampoco se conocen detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que este repositorio contiene "static quants" del modelo original, es decir, versiones cuantizadas generadas sin ajuste posterior.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas del modelo. Dado que es un modelo de 13B, es razonable esperar que pueda realizar tareas de generación de texto, razonamiento básico y posiblemente generación de código, pero esto es una inferencia no confirmada. No se puede afirmar nada sobre tool calling, capacidades multimodales o soporte de agentes sin datos del autor.

## Casos de uso

Debido a la falta de información sobre el modelo original, no es posible enumerar casos de uso concretos y fiables. Cualquier aplicación práctica debería basarse en pruebas empíricas por parte del usuario. Se recomienda no utilizar este modelo en entornos de producción sin antes validar su comportamiento y conocer su licencia, que actualmente es desconocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ningún dato oficial sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

Al tratarse de un modelo de 13B cuantizado en GGUF, los requisitos estimados son similares a los de otros modelos de ese tamaño:

- VRAM estimada: con cuantización Q4_K_M, aproximadamente 7-8 GB de VRAM para inferencia en GPU; con Q8_0, alrededor de 13-14 GB. En CPU pura, se necesitarían unos 8-10 GB de RAM para Q4_K_M.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060/3070, RTX 4060, etc.) puede ejecutar las cuantizaciones más bajas. Para Q8_0 se recomienda una GPU de 16 GB o más (RTX 4080, A100, etc.).
- Es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF. vLLM también puede cargar GGUF, aunque su soporte es más limitado.
- La latencia dependerá del hardware y de la cuantización elegida; sin datos oficiales, no se puede estimar con precisión.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. El modelo original `arcane-13b` no tiene datos públicos de rendimiento, por lo que cualquier comparación sería especulativa. Se recomienda comparar directamente ejecutando el modelo y midiendo su rendimiento en tareas concretas frente a alternativas conocidas como Llama 2 13B, Mistral 7B o CodeLlama 13B, pero esta comparación queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- Licencia desconocida: no se especifica ninguna licencia, lo que impide conocer si está permitido su uso comercial o si tiene restricciones.
- La cuantización puede degradar la calidad de las respuestas en comparación con el modelo original en FP16.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo no cuenta con una model card detallada, por lo que se desconoce su procedencia, datos de entrenamiento y posibles sesgos incorporados.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/arcane-13b-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/ar3xop/arcane-13b
