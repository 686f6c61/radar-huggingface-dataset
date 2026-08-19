# NetherQuartz/ilo-toki-1.5-MiLMMT-46-1b

## Resumen

El modelo `NetherQuartz/ilo-toki-1.5-MiLMMT-46-1b` es un ajuste fino (fine-tune) del modelo base `xiaomi-research/MiLMMT-46-1B-v0.1`, desarrollado por el usuario NetherQuartz. El nombre "ilo-toki" hace referencia a la lengua construida Toki Pona, y el proyecto del autor se centra en la traducción automática hacia y desde este idioma. El modelo base de Xiaomi es un modelo de traducción multilingüe de 46 idiomas con 1.000 millones de parámetros, por lo que este ajuste se orienta a mejorar su rendimiento específicamente en tareas relacionadas con Toki Pona.

El modelo se ha entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, sobre el checkpoint de Xiaomi. Con un tamaño de repositorio de solo 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia radica en ofrecer una opción especializada para traducción y generación de texto en Toki Pona, un nicho con pocos recursos disponibles en el ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base MiLMMT-46-1B-v0.1, no se especifican detalles adicionales) |
| Parametros totales | 1.000 millones (aproximadamente, según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, pero no se listan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base soporta 46 idiomas; el ajuste se centra en Toki Pona) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer `MiLMMT-46-1B-v0.1` de Xiaomi Research, un modelo de traducción multilingüe de 1.000 millones de parámetros entrenado para cubrir 46 idiomas. El proceso de ajuste se realizó mediante SFT (supervised fine-tuning) con la librería TRL, utilizando el framework Transformers y PyTorch. No se han publicado detalles sobre el dataset de entrenamiento específico, el número de tokens utilizados ni la composición de los datos. Tampoco se indica si se aplicaron técnicas adicionales como RLHF o DPO; la información disponible solo menciona SFT.

La innovación principal de este modelo no reside en la arquitectura, que hereda del modelo base, sino en la especialización: el ajuste se ha realizado para mejorar la capacidad del modelo en tareas de traducción y generación de texto relacionadas con Toki Pona, una lengua construida con un vocabulario muy reducido (alrededor de 120-150 palabras raíz). El autor ha publicado además una aplicación móvil (ilo-toki-app) que utiliza una versión cuantizada de un modelo similar, lo que sugiere que el despliegue en dispositivos con recursos limitados es un objetivo práctico.

## Capacidades

- Generación de texto en Toki Pona y traducción desde/hacia múltiples idiomas (heredado del modelo base de 46 idiomas).
- Razonamiento conversacional básico, como muestra el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Soporte de chat multi-turno mediante el pipeline de Transformers con roles de usuario y asistente.
- Capacidad de ejecución en dispositivos con pocos recursos gracias a su tamaño reducido (0,2 GB).
- No se ha confirmado soporte de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Traducción automática de Toki Pona: el modelo puede traducir textos entre Toki Pona y los 46 idiomas del modelo base, siendo útil para comunidades de hablantes y estudiantes de esta lengua construida.
- Aprendizaje de idiomas: puede generar ejemplos de frases en Toki Pona a partir de instrucciones en otros idiomas, ayudando a practicar vocabulario y gramática.
- Asistente conversacional para hablantes de Toki Pona: integrable en aplicaciones de chat o foros donde se hable esta lengua, respondiendo preguntas y manteniendo diálogos sencillos.
- Aplicación móvil de traducción: el autor ya ha desarrollado una app (ilo-toki-app) que usa un modelo similar cuantizado con GGUF y llama.cpp, demostrando su viabilidad en Android e iOS.
- Generación de contenido creativo: puede componer poemas, cuentos o mensajes en Toki Pona, un uso atractivo para artistas y escritores que experimentan con lenguas construidas.
- Prototipado de sistemas de traducción especializados: sirve como punto de partida para investigadores que quieran ajustar modelos multilingües a lenguas minoritarias o construidas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación ni comparaciones con otros modelos. La model card solo menciona que el modelo base logra ciertos resultados, pero no se detallan.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.000 millones de parámetros con pesos en safetensors de 0,2 GB, la inferencia en FP16 requeriría aproximadamente 2 GB de VRAM, y en cuantización de 4 bits menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. También puede ejecutarse en CPU con llama.cpp u Ollama.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: Transformers (pipeline de generación), vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI.
- Latencia y throughput: no se han publicado datos. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| NetherQuartz/ilo-toki-1.5-MiLMMT-46-1b | 1B | no disponible | Toki Pona / traduccion multilingue | no disponible |
| xiaomi-research/MiLMMT-46-1B-v0.1 | 1B | no disponible | Traduccion multilingue (46 idiomas) | no disponible |
| NetherQuartz/ilo-toki-1.3-MiLMMT-46-1b-merged | 1B | no disponible | Toki Pona / traduccion multilingue | no disponible |

No se dispone de información sobre otros modelos comparables en el nicho de Toki Pona. Los modelos de traducción multilingüe de tamaño similar, como NLLB-200-distilled-600M de Meta, podrían ser alternativas genéricas, pero no están especializados en esta lengua construida.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas del modelo.
- Al ser un ajuste fino de un modelo de traducción, puede presentar errores de traducción en contextos complejos o con vocabulario poco frecuente.
- La licencia no está claramente especificada; el README indica "licence: license", lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o revisar la licencia del modelo base de Xiaomi antes de usarlo en producción.
- El modelo no ha sido evaluado públicamente, por lo que su rendimiento real en tareas de traducción o generación es desconocido.
- La longitud de contexto no se ha documentado, lo que limita su uso en tareas que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental con poco respaldo de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NetherQuartz/ilo-toki-1.5-MiLMMT-46-1b
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v0.1
- Repositorio del proyecto ilo-toki: https://github.com/NetherQuartz/ilo-toki/tree/main/
- Aplicación móvil ilo-toki-app: https://github.com/NetherQuartz/ilo-toki-app
- Modelo relacionado (versión 1.3): https://huggingface.co/NetherQuartz/ilo-toki-1.3-MiLMMT-46-1b-merged
- Otro modelo del autor (ruT5): https://huggingface.co/NetherQuartz/ilo-toki-rut5-base
