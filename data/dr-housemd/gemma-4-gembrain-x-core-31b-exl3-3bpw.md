# dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-3bpw

## Resumen

Gemma-4-Gembrain-X-Core-31B-exl3-3bpw es un modelo de lenguaje creado por el usuario dr-housemd mediante una fusión (merge) de 17 modelos derivados de google/gemma-4-31B-it, utilizando la herramienta mergekit. El resultado es un modelo orientado a tareas conversacionales, roleplay, escritura creativa, generación de prompts para imágenes y razonamiento general, con un enfoque en contenido sin censura (etiquetado como uncensored y nsfw).

El modelo se distribuye en formato ExLlama v3 (exl3) con cuantización de 3 bits por peso (3bpw), lo que reduce el tamaño total del repositorio a 15,9 GB. Aunque el nombre indica 31B, el archivo de pesos en safetensors contiene 7.925.943.916 parámetros, una discrepancia que probablemente se debe a la cuantización o a la estructura del merge. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su naturaleza de fusión de múltiples especializaciones sobre la base Gemma-4, combinando capacidades de razonamiento, escritura creativa y generación de prompts de imagen en un solo peso. Al estar cuantizado a 3 bits, puede ejecutarse en hardware de consumo con requisitos de VRAM moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en google/gemma-4-31B-it) |
| Parametros totales | 7.925.943.916 (según safetensors; el nombre sugiere 31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (exl3, 3bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | exl3 (ExLlama v3) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de 17 modelos base, todos ellos derivados de google/gemma-4-31B-it. La fusión se realizó con mergekit, una herramienta que combina pesos de diferentes modelos mediante técnicas como promedio lineal o interpolación. Los modelos fusionados incluyen especializaciones en roleplay (BirdToast/Gemma-4-31B-glimmer-rp-v0.1), escritura creativa (nbeerbower/Gemma4-Gutenberg-31B, llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith), generación de prompts de imagen (bgg1996/Melinoe-Gemma4-31B-VL) y versiones sin censura (llmfan46/G4-MeroMero-31B-uncensored-heretic, trohrbaugh/gemma-4-31b-it-heretic-ara), entre otros.

No se proporcionan detalles sobre el proceso de entrenamiento posterior a la fusión, como fine-tuning adicional, RLHF o DPO. La arquitectura subyacente es la de Gemma-4-31B-it, un transformer denso con atención de múltiples cabezas, aunque no se especifican detalles concretos como el número de capas o dimensiones ocultas. La cuantización a 3 bits se aplicó posteriormente para reducir el tamaño y permitir inferencia eficiente en GPUs de consumo.

## Capacidades

- Generación de texto conversacional y roleplay, con énfasis en interacciones multi-turno.
- Escritura creativa: cuentos, diálogos, poesía y narrativa.
- Generación de prompts para modelos de imágenes (image-prompt-generation), según los tags del modelo.
- Razonamiento general y resolución de problemas, aunque sin benchmarks que lo respalden.
- Soporte para contenido sin censura (uncensored) y NSFW, lo que implica que no aplica filtros de seguridad estándar.
- Capacidad multilingüe no confirmada; no se especifican idiomas soportados.
- No se menciona soporte explícito para tool calling, function calling o modo agente.

## Casos de uso

- Roleplay interactivo en juegos de texto o chatbots: el modelo está diseñado para mantener personajes y diálogos coherentes en sesiones largas, gracias a la fusión de modelos especializados en roleplay.
- Escritura creativa asistida: autores pueden usarlo para generar borradores de narrativa, desarrollar personajes o explorar tramas alternativas, aprovechando la mezcla de estilos de los modelos base.
- Generación de prompts para difusión de imágenes: el modelo puede producir descripciones detalladas y artísticas que sirvan como entrada para Stable Diffusion o Midjourney, gracias a la inclusión de Melinoe-Gemma4-31B-VL en la fusión.
- Prototipado de asistentes conversacionales sin restricciones: para entornos de investigación donde se requiera explorar interacciones sin filtros de contenido, aunque con las advertencias éticas correspondientes.
- Creación de contenido para juegos de rol de mesa: puede generar trasfondos, diálogos de PNJ o descripciones de escenarios con un tono inmersivo.
- Experimentación con modelos fusionados: sirve como ejemplo de cómo combinar especializaciones mediante mergekit, útil para investigadores interesados en técnicas de fusión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El rendimiento en tareas concretas debe evaluarse de forma empírica.

## Requisitos de hardware

- Tamaño del repositorio: 15,9 GB (pesos cuantizados a 3 bits).
- VRAM estimada: al ser un modelo de 31B cuantizado a 3 bits, se requiere al menos 16 GB de VRAM para cargar los pesos, más overhead de contexto y activaciones. Una GPU con 24 GB (RTX 3090, RTX 4090, A5000) sería recomendable para inferencia cómoda.
- GPUs compatibles: cualquier GPU con soporte CUDA y suficiente VRAM; también puede ejecutarse en CPU con memoria RAM abundante, aunque con mayor latencia.
- Opciones de despliegue: al estar en formato exl3, es compatible con ExLlama v3, que permite inferencia eficiente en GPUs. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible; dependerá del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base google/gemma-4-31B-it es el punto de referencia, pero no se conocen sus métricas en esta ficha. Otros modelos de roleplay o escritura creativa de tamaño similar (por ejemplo, Mistral-7B o Llama-3-8B en versiones fine-tuned) podrían ser comparables, pero no hay datos objetivos para establecer una comparación rigurosa. Se indica "no disponible" por falta de información.

## Limitaciones y advertencias

- Contenido sin censura: el modelo está etiquetado como uncensored y nsfw, por lo que puede generar contenido sexual explícito, violento o inapropiado. No debe desplegarse en entornos públicos sin control de acceso.
- Riesgo de alucinación: al ser un merge de múltiples modelos, puede presentar inconsistencias en hechos y razonamiento lógico, especialmente en dominios no cubiertos por los modelos base.
- Sesgos desconocidos: no se han documentado sesgos específicos, pero hereda los de los modelos base, que incluyen Gemma-4-31B-it y variantes sin censura.
- Limitaciones de contexto: no se especifica la longitud de contexto; probablemente sea la de Gemma-4-31B-it, pero no se confirma.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permisiva), el uso de contenido generado con fines comerciales debe revisarse según las políticas de cada plataforma.
- Formato exl3: al ser un formato específico de ExLlama, no es directamente compatible con otros runners como llama.cpp u Ollama, lo que limita las opciones de despliegue.
- Discrepancia de parámetros: el nombre sugiere 31B, pero el archivo safetensors contiene 7,9B parámetros; esto puede deberse a la cuantización o a un error de etiquetado, y debe verificarse antes de usar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-3bpw
