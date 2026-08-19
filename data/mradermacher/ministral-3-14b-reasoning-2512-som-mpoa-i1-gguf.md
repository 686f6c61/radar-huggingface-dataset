# mradermacher/Ministral-3-14B-Reasoning-2512-SOM-MPOA-i1-GGUF

## Resumen

Ministral-3-14B-Reasoning-2512-SOM-MPOA-i1-GGUF es una colección de cuantizaciones GGUF del modelo Ministral-3-14B-Reasoning-2512-SOM-MPOA, preparadas por mradermacher para su uso con llama.cpp y ecosistemas compatibles. El modelo base, desarrollado por 0xA50C1A1, es una variante de la serie Ministral 3 de Mistral, un modelo de 13.506 millones de parámetros (14B) orientado a razonamiento y conversación, con capacidades multimodales que incluyen un codificador de visión de 0.4B según la información disponible.

Esta versión en particular está marcada con las etiquetas "uncensored", "decensored" y "abliterated", lo que indica que ha sido sometida a un proceso de eliminación de alineación (abliteration) para reducir los rechazos de contenido. El repositorio ofrece una amplia gama de cuantizaciones, desde IQ1_S (3.4 GB) hasta Q4_K_M (8.3 GB), todas generadas con matriz de importancia (imatrix) para optimizar la calidad de la cuantización. El modelo mantiene la licencia Apache 2.0 del original y soporta 11 idiomas principales.

La relevancia de esta publicación radica en que permite ejecutar un modelo de razonamiento de 14B en hardware de consumo, con opciones de cuantización para diferentes capacidades de VRAM. El enfoque "uncensored" lo hace particularmente interesante para casos de uso donde se requiere generar contenido sin las restricciones habituales de los modelos alineados, aunque esto conlleva riesgos que se detallan más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder-only) |
| Parametros totales | 13.506.073.600 (13.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Mistral, un transformer decoder-only con atención de ventana deslizante (sliding window attention) y GQA (Grouped Query Attention), características típicas de la familia Mistral. Según la información disponible, el modelo incluye además un codificador de visión de 0.4B de parámetros, lo que lo convierte en un modelo multimodal capaz de procesar tanto texto como imágenes.

El nombre del modelo indica dos procesos de entrenamiento adicionales: "SOM" y "MPOA". Aunque no se dispone de detalles técnicos sobre estos métodos, el sufijo "Reasoning" sugiere un enfoque en capacidades de razonamiento y pensamiento paso a paso. La etiqueta "abliterated" confirma que se ha aplicado una técnica de eliminación de la alineación (abliteration) al modelo base, que consiste en modificar los pesos para eliminar las activaciones responsables de los rechazos de contenido.

Los datos de entrenamiento, el número de tokens y los métodos de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada. El proceso de cuantización de mradermacher utiliza la técnica imatrix (importance matrix), que calcula la importancia de cada peso durante la cuantización para minimizar la pérdida de calidad.

## Capacidades

- Generación de texto y razonamiento multi-step, con enfoque específico en tareas de razonamiento complejo.
- Capacidades multimodales: el modelo base incluye un codificador de visión de 0.4B, lo que permite procesar imágenes junto con texto.
- Conversación multi-turno y seguimiento de instrucciones, orientado a aplicaciones de chat y asistencia.
- Soporte multilingüe para 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Generación de contenido sin restricciones de alineación ("uncensored"), gracias al proceso de abliteration.
- Compatible con herramientas de inferencia local como llama.cpp, LM Studio, Ollama y otras que soporten GGUF.

## Casos de uso

- Asistente de escritura creativa sin restricciones: el modelo puede generar narrativa, diálogos y contenido literario sin los filtros habituales de seguridad, útil para autores que necesitan explorar temas sensibles o controvertidos en sus obras.
- Investigación en alineación de modelos: los investigadores pueden estudiar el comportamiento de un modelo abliteado frente a su versión alineada, analizando diferencias en sesgos, rechazos y calidad de respuestas.
- Desarrollo de personajes para juegos de rol: la naturaleza "uncensored" permite crear personajes NPC con personalidades más complejas y realistas, sin limitaciones de contenido.
- Análisis de contenido multilingüe: con soporte para 11 idiomas, puede utilizarse para tareas de análisis, resumen o traducción en contextos donde se requiere manejar varios idiomas.
- Prototipado de aplicaciones de razonamiento: su enfoque en reasoning lo hace adecuado para experimentar con agentes conversacionales que necesitan resolver problemas paso a paso, como asistentes de soporte técnico.
- Despliegue en entornos con recursos limitados: las cuantizaciones pequeñas (IQ1_S, 3.4 GB) permiten ejecutar el modelo en equipos con GPUs de gama baja o incluso solo CPU, facilitando pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. La información proporcionada no incluye comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: entre 4 GB (para IQ1_S) y 10 GB (para Q4_K_M), dependiendo de la cuantización elegida y la longitud del contexto.
- GPU recomendadas: RTX 3060/4060 para cuantizaciones pequeñas (IQ2_XS o inferiores), RTX 4070/4080 o equivalente para Q4_K_M.
- Las cuantizaciones más pequeñas (IQ1_S, IQ1_M) pueden ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU con suficiente RAM.
- Para las cuantizaciones Q4_K_M, se recomienda al menos 10-12 GB de VRAM para un contexto razonable.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, kobold.cpp y cualquier otro frontend compatible con GGUF.
- Latencia y throughput: no disponible, pero las cuantizaciones Q4_K_M suelen ofrecer buen equilibrio entre velocidad y calidad en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Reasoning-2512-SOM-MPOA (GGUF) | 13.5B | no disponible | Apache 2.0 | GGUF | Abliterado, multimodal |
| Mistral Small 3.2 24B | 24B | no disponible | Apache 2.0 | Safetensors | Modelo oficial de Mistral, no abliterado |
| Ministral-3-14B-Reasoning-2512 (original) | 13.5B | no disponible | Apache 2.0 | Safetensors | Versión sin abliteration |

La comparativa se basa en la información disponible. El modelo de 24B de Mistral Small 3.2 tiene un rendimiento superior según la descripción del modelo base, pero requiere más recursos. La ventaja principal de esta versión GGUF es la variedad de cuantizaciones y el proceso de abliteration.

## Limitaciones y advertencias

- El modelo ha sido sometido a un proceso de abliteration ("uncensored"), lo que significa que puede generar contenido dañino, ofensivo o ilegal sin restricciones. No debe utilizarse en producción sin medidas de mitigación adicionales.
- No se dispone de información sobre los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales ni la calidad del proceso de alineación original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es una modificación no oficial del modelo Ministral 3 de Mistral, por lo que conviene verificar los términos de uso del modelo original.
- Las cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar significativamente la calidad de las respuestas y aumentar la tasa de alucinaciones.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas específicas no está validado.
- La longitud de contexto no está especificada en la información disponible, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- El modelo es una versión no oficial preparada por un tercero (mradermacher), no por Mistral AI, por lo que no hay soporte oficial.

## Enlaces

- Repositorio GGUF (i1): https://huggingface.co/mradermacher/Ministral-3-14B-Reasoning-2512-SOM-MPOA-i1-GGUF
- Repositorio GGUF (estático): https://huggingface.co/mradermacher/Ministral-3-14B-Reasoning-2512-SOM-MPOA-GGUF
- Modelo base: https://huggingface.co/0xA50C1A1/Ministral-3-14B-Reasoning-2512-SOM-MPOA
- Página de descarga alternativa: https://sourceforge.net/projects/ministral-3-14b-reasoning-2512/
- Referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
