# Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT8` es una cuantización INT8 weight-only del modelo `Qwen3.6-27B-Uncensored`, desarrollado por el usuario Rin247. Se trata de una versión "abliterada" (uncensored) del Qwen3.6-27B, es decir, se ha eliminado la dirección de rechazo mediante proyección ortogonal para que el modelo no se niegue a responder a peticiones que normalmente estarían bloqueadas por políticas de seguridad. Esta transformación se realizó antes de la cuantización, como parte de un proceso denominado "Genesis of Aquarion forge".

El modelo está pensado para entornos donde se requiere libertad de contenido sin restricciones de política, como generación creativa, roleplay o investigación sobre alineación. Con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), el formato INT8 reduce el tamaño de los pesos a aproximadamente 27 GB, lo que facilita su ejecución en hardware con menos memoria que la versión original en FP16. Sin embargo, el formato de cuantización es personalizado y requiere un proceso de dequantización antes de poder utilizarlo en motores de inferencia estándar. El repositorio no cuenta con descargas ni valoraciones, y la licencia no está especificada, lo que limita su uso en producción comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-27B (base, no se detalla en la información disponible) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers de escala y forma (`.weight_scale`, `.weight_shape`) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base Qwen3.6-27B. Se sabe que es un modelo de 27 mil millones de parámetros, probablemente un transformer denso, pero no se confirma en los datos disponibles. El proceso de entrenamiento del modelo original tampoco se documenta aquí. Lo que sí se especifica es que la versión actual es una cuantización INT8 weight-only realizada con PyTorch RTN (round-to-nearest) en CPU, con las escalas almacenadas junto a los pesos. Antes de la cuantización, se aplicó una técnica de abliteración mediante proyección ortogonal de la dirección de rechazo, lo que elimina la tendencia del modelo a negarse a responder a ciertas peticiones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional y creativo sin restricciones de contenido (debido a la abliteración).
- Soporte para tareas de texto en general, aunque no se especifican capacidades concretas como razonamiento, código o matemáticas.
- No se indica soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No se documentan capacidades multilingües específicas (idiomas no disponibles).
- No se mencionan capacidades de visión, audio ni modo de pensamiento.
- El modelo está etiquetado como "conversational" y "endpoints_compatible", lo que sugiere que puede integrarse en pipelines de generación de texto.

## Casos de uso

- Generación de ficción y narrativa sin censura: el modelo puede producir historias, diálogos y escenas que aborden temas sensibles, gracias a la eliminación de la dirección de rechazo. Es adecuado para escritores que necesitan explorar contenido adulto o controvertido sin filtros automáticos.
- Roleplay y simulación de personajes: su naturaleza conversacional y sin restricciones permite crear chatbots para juegos de rol, donde los personajes pueden responder de forma más natural a temas tabú o explícitos.
- Investigación sobre alineación y seguridad en IA: al comparar el comportamiento de un modelo abliterado con su versión original, los investigadores pueden estudiar cómo la eliminación de la dirección de rechazo afecta a las respuestas y a la calidad general.
- Prototipado de aplicaciones de chat sin moderación: para entornos de desarrollo donde se quiere probar la interacción sin políticas de contenido, aunque debe tenerse en cuenta que el formato requiere dequantización previa.
- Entrenamiento de modelos más pequeños: el modelo cuantizado puede servir como profesor para destilación de conocimiento, aprovechando su tamaño reducido en INT8 para generar datos de entrenamiento.
- Evaluación de técnicas de cuantización: al ser una implementación INT8 personalizada, puede utilizarse para comparar la pérdida de calidad frente a otras cuantizaciones (FP8, GGUF, etc.) en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,9 mil millones de parámetros en INT8, los pesos ocupan aproximadamente 27 GB. Añadiendo overhead de activaciones, contexto y buffers de escala, se estima un consumo total de 30-32 GB de memoria. No se dispone de datos exactos.
- GPU recomendadas: una GPU con al menos 32 GB de VRAM, como la A100 40 GB, A6000 48 GB o RTX 6000 Ada. No cabe en GPUs consumer de 24 GB (RTX 4090) ni en 16 GB.
- En CPU: es posible ejecutar el modelo en sistemas con 64 GB de RAM o más, aunque la latencia será considerablemente mayor.
- Opciones de despliegue: el formato de pesos es personalizado (INT8 weight-only con buffers de escala). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere un paso previo de dequantización a FP16/BF16 y conversión a un formato estándar (por ejemplo, safetensors convencional) antes de usar estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT8 | 26,9 B | INT8 weight-only | no disponible | Repositorio sin descargas |
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8 | 26,9 B (presumiblemente) | FP8 | no disponible | Repositorio en HF |
| AIOpsInSpace/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-MTP | 26,9 B | no especificada | no disponible | Repositorio en HF |
| Qwen3.6-27B-Fable-Fusion (mencionado en EnterpriseDNA) | 27 B | 4-bit (según artículo) | no disponible | ~552k descargas |

No se dispone de datos de rendimiento comparativos. Las diferencias principales residen en el método de cuantización y en el proceso de abliteración aplicado.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo, ilegal o dañino. El autor no proporciona garantías sobre su uso, y el usuario asume toda la responsabilidad.
- La licencia no está especificada, lo que impide conocer si se permite el uso comercial, la redistribución o la modificación. Esto supone un riesgo legal para proyectos en producción.
- El formato de cuantización es personalizado y no estándar. Requiere herramientas específicas para dequantizar los pesos antes de la inferencia, lo que complica su integración en pipelines existentes.
- No se han publicado benchmarks, por lo que se desconoce la pérdida de calidad respecto al modelo base original.
- La abliteración puede degradar el rendimiento en tareas que requieren respuestas seguras o alineadas, y puede producir respuestas incoherentes en contextos donde la dirección de rechazo era relevante.
- El repositorio no tiene descargas ni valoraciones, lo que sugiere que no ha sido probado ampliamente por la comunidad.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas, lo que limita su uso en aplicaciones multilingües o con ventanas largas.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT8)
- [Versión FP8 del mismo modelo](https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8)
- [Catálogo de modelos abliterados](https://abliteration.org/)
- [Modelo similar: Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-MTP](https://huggingface.co/AIOpsInSpace/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive-MTP)
- [Artículo sobre Qwen3.6-27B-Fable-Fusion](https://enterprisedna.co/resources/ai-pulse/ai-pulse-2026-07-26-an-uncensored-27b-open-weight-model-claiming-near-frontier-r/)
