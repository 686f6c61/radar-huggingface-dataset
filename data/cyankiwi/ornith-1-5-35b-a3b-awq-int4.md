# cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith AI, presentado como la evolución de Ornith-1.0. La ficha que nos ocupa no es el modelo original, sino la cuantización AWQ de 4 bits publicada por cyankiwi, un agente de inferencia especializado en modelos abiertos. El modelo base activa aproximadamente 3.000 millones de parámetros por token sobre un total de 35.951.822.704 parámetros, lo que lo sitúa en la categoría de MoE de tamaño medio con coste de inferencia contenido.

La propuesta técnica del modelo se centra en el autoaprendizaje extremo a extremo: en lugar de depender de un conjunto fijo de tareas curadas por humanos y de arneses diseñados manualmente, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo. Según la model card, esta ampliación del bucle de auto-mejora abarca la generación de tareas, la construcción de arneses y la ejecución de rollouts de solución.

La relevancia práctica de esta versión concreta es doble. Por un lado, ofrece el modelo en formato AWQ INT4 con un tamaño de repositorio de 26,2 GB, lo que reduce los requisitos de memoria frente a los pesos en precisión completa. Por otro, la licencia MIT del modelo base facilita su uso comercial. La model card indica que supera a Qwen3.6-35B-A3B en todos los benchmarks de código y agentes, y que supera con amplio margen a modelos densos como Gemma-4-31B y Muse-Glimmer-30B en código agéntico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; tipo de modelo `qwen3_5_moe` |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | aproximadamente 3B por token (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT4 (compressed-tensors); existen otras variantes del modelo base no detalladas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |
| Tamaño del repositorio | 26,12 GB |
| Modalidad | image-text-to-text y text-generation |
| Versión de la cuantización | cyankiwi 26.05.01 |
| Dataset de calibración | STEM and Agentic (cyankiwi/calibration) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos, identificado en los metadatos como `qwen3_5_moe`. Activa alrededor de 3.000 millones de parámetros por token sobre un total de casi 36.000 millones, lo que permite un equilibrio entre capacidad y coste computacional en inferencia. La model card menciona que Ornith-1.0 se construyó sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales; Ornith-1.5 parte de esa base y amplía el bucle de auto-mejora.

El entrenamiento de Ornith-1.5 se articula en torno a la optimización conjunta de tres componentes: la generación de tareas, la construcción de arneses (scaffolds) y los rollouts de solución, todo ello guiado por aprendizaje por refuerzo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas como RLHF o DPO más allá de la mención genérica al aprendizaje por refuerzo. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

La cuantización AWQ INT4 de cyankiwi aplica cuantización consciente de la activación sobre los pesos, calibrada con un dataset orientado a STEM y flujos agénticos. El resultado son pesos de 4 bits en formato compressed-tensors, con un tamaño de 26,12 GB, que conservan la compatibilidad con la librería transformers.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), según los tags del repositorio.
- Razonamiento y código: la model card destaca su rendimiento en benchmarks de coding y agentic coding.
- Capacidades agénticas: el entrenamiento con rollouts y arneses sugiere soporte para tareas de múltiples pasos, aunque la información disponible no detalla el soporte explícito de tool calling o function calling.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.
- Integración con endpoints compatibles, según el tag `endpoints_compatible`.

## Casos de uso

- Asistencia a la programación en producción: el modelo puede integrarse en pipelines de revisión de código y generación de parches, aprovechando su rendimiento declarado en benchmarks de coding y su formato safetensors compatible con transformers.
- Agentes autónomos de resolución de tareas: su entrenamiento basado en rollouts y arneses lo hace adecuado para flujos de varios pasos donde el modelo debe planificar y ejecutar acciones sucesivas.
- Despliegue en infraestructura con memoria limitada: la versión AWQ INT4 de 26,12 GB permite servir el modelo en GPUs que no admitirían los pesos en precisión completa, manteniendo la licencia MIT para uso comercial.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text habilita tareas de extracción y descripción sobre capturas, diagramas o documentos escaneados.
- Evaluación comparativa de modelos MoE: útil en investigación para contrastar estrategias de auto-mejora con RL frente a modelos de tamaño similar como Qwen3.6-35B-A3B.
- Generación de datos sintéticos y tareas: dado que el modelo base se entrena generando tareas nuevas, puede emplearse para producir conjuntos de problemas y soluciones en dominios STEM.
- Despliegue mediante endpoints compatibles: el tag `endpoints_compatible` facilita su publicación en servicios de inferencia gestionada sin adaptaciones específicas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con las columnas Ornith-1.5-35B-A3B, Ornith-1.0-35B-A3B, Qwen3.6-35B-A3B, Gemma-4-31B, Muse-Glimmer-30B y Qwen3.5-397B, organizada en categorías como Coding. Sin embargo, en la información proporcionada solo se incluye la cabecera y el encabezado de la sección Coding, sin las filas de resultados numéricos. Por tanto, no es posible reproducir cifras concretas.

La model card afirma cualitativamente que Ornith-1.5-35B-A3B supera a Qwen3.6-35B-A3B en todos los benchmarks de código y agentes, y que supera con amplio margen a Gemma-4-31B y Muse-Glimmer-30B en código agéntico. No se han publicado en la información disponible los valores numéricos de MMLU, HumanEval, GSM8K ni de los benchmarks de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos AWQ INT4 ocupan 26,12 GB, por lo que se necesita al menos una GPU con 32 GB de memoria para cargar el modelo completo; con overhead de activaciones y caché KV conviene prever 32-40 GB según longitud de contexto.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para despliegues de producción; L40S 48 GB como alternativa.
- GPU de consumo: una RTX 4090 de 24 GB no permite cargar los 26,12 GB de pesos en una sola tarjeta; sería necesario repartir el modelo entre varias GPUs o usar variantes de cuantización más agresivas no listadas en esta ficha.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con compressed-tensors y endpoints compatibles; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (AWQ INT4) | 35,95B | ~3B | no disponible | MIT | Hugging Face |
| Ornith-1.0-35B-A3B | no disponible | ~3B | no disponible | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | no disponible | ~3B | no disponible | no disponible | Hugging Face |
| Gemma-4-31B | 31B (denso) | 31B | no disponible | no disponible | Hugging Face |
| Muse-Glimmer-30B | 30B (denso) | 30B | no disponible | no disponible | Hugging Face |

La comparativa se limita a los datos reflejados en la model card; no se dispone de cifras de rendimiento numéricas para completar la tabla. Según la propia model card, Ornith-1.5-35B-A3B supera a Qwen3.6-35B-A3B en código y agentes, y a Gemma-4-31B y Muse-Glimmer-30B en código agéntico.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado con datos web y RL, es probable que herede sesgos de sus fuentes, pero no hay confirmación explícita.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como en cualquier modelo generativo, existe riesgo en tareas factuales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Licencia: MIT, lo que permite uso comercial; conviene revisar el archivo LICENSE del modelo base enlazado en la model card por si hubiera condiciones adicionales.
- Cuantización: la versión AWQ INT4 puede degradar ligeramente la calidad frente a los pesos originales; no se publican métricas de la pérdida de rendimiento respecto al modelo base.
- Soporte de tooling: no se confirma soporte de tool calling ni de servidores de inferencia populares como vLLM u Ollama.
- Fecha de creación del repositorio: 23 de agosto de 2026, con última actualización el 19 de octubre de 2026; verificar la vigencia de la versión de cuantización antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Blog de Ornith (enlace de la model card): https://deep-reinforce.com/ornith.html
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Perfil de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Despliegue en endpoints de cyan.kiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Ornith-1.5-35B-A3B-AWQ-INT4
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
