# Koko12345p/dolphin-cyber-arabic-merged

## Resumen

`Koko12345p/dolphin-cyber-arabic-merged` es un modelo de generación de texto publicado en HuggingFace por el usuario Koko12345p. Sus pesos en safetensors suman 1.543.714.304 parámetros (unos 1,54 mil millones), lo que lo sitúa en la franja de 1,5B. Los tags del repositorio (`transformers`, `safetensors`, `qwen2`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`) apuntan a un transformer decoder-only de la familia Qwen2, orientado a generación conversacional y desplegable con Text Generation Inference.

El nombre sugiere que se ha construido mediante fusión de pesos ("merged") a partir de un finetune de estilo Dolphin y de uno o varios finetunes orientados a contenido "cyber" y a árabe. Sin embargo, la model card es la plantilla autogenerada de HuggingFace y no contiene ningún dato cumplimentado: no hay información sobre datos de entrenamiento, licencia, idiomas, hiperparámetros ni evaluación.

Su relevancia práctica es hoy limitada: acumula 0 descargas y 0 likes, no tiene documentación técnica y su licencia es desconocida, lo que impide plantear un uso comercial sin aclaración previa del autor. Resulta útil, en todo caso, como objeto de estudio de merges de pesos ligeros y como base para experimentación local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no confirmado en la model card; el tag `qwen2` apunta a la familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el nombre del modelo menciona "arabic", sin confirmación en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamano del repositorio | 12,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-19 (actualizado el 2026-09-20) |

Nota: el tamaño del repositorio (12,4 GB) es muy superior al esperado para 1543 millones de parámetros en fp16 (unos 3,1 GB), lo que sugiere la presencia de copias redundantes de pesos o de ficheros adicionales no documentados. El dato de parámetros procede de la cabecera real de los safetensors, no de la model card.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta ni sobre el proceso de entrenamiento. El tag `qwen2` es el único indicio: apunta a un transformer decoder-only con atención causal, del que se desconoce si conserva las características habituales de esa familia (grouped query attention, SwiGLU y codificaciones posicionales rotatorias) y con qué configuración de capas, cabezas y dimensión oculta. Tampoco se conoce la longitud de contexto con la que fue configurado.

El término "merged" del identificador sugiere una fusión de pesos (por ejemplo, con herramientas tipo mergekit) entre un modelo afinado al estilo Dolphin y uno o varios modelos afinados para árabe y para temática "cyber". No se especifican los modelos origen, el método de fusión, la proporción de mezcla ni si hubo un entrenamiento posterior. Tampoco hay datos sobre volumen de tokens, composición del dataset, ni sobre uso de RLHF, DPO o cualquier otra técnica de alineamiento. La model card únicamente incluye el texto de plantilla con marcadores `[More Information Needed]`.

## Capacidades

- Generación de texto autoregresiva (confirmado por el pipeline `text-generation`).
- Uso conversacional multi-turno (confirmado por el tag `conversational`).
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles de la Inference API.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el identificador menciona árabe, pero no hay confirmación ni lista de idiomas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio, decodificación especulativa): no disponible. El tag `arxiv:1910.09700` no corresponde a un artículo sobre el modelo, sino al trabajo de Lacoste et al. sobre el cálculo del impacto ambiental, citado en la plantilla de model card.

## Casos de uso

- Prototipado de asistentes conversacionales en árabe: si se confirma el soporte de ese idioma, puede desplegarse con `transformers` o TGI para validar flujos multi-turno antes de invertir en un modelo mayor. La validación lingüística es imprescindible, ya que no hay evaluación publicada.
- Generación de texto en local o en el borde: con 1,54B de parámetros cabe en GPUs de consumo, lo que permite procesar texto sensible sin enviarlo a servicios externos.
- Base para fine-tuning de dominio con LoRA o QLoRA: el coste de ajuste de un modelo de 1,5B es de unas pocas horas en una única GPU, lo que lo hace apto para especializarlo en ciberseguridad, atención al cliente o documentación técnica en árabe.
- Investigación sobre fusión de pesos: sirve como caso de estudio para comparar el comportamiento del merge frente a los modelos de origen, siempre que el autor documente cuáles son.
- Generación de datos sintéticos para aumentar corpus en árabe o en dominios poco representados, con revisión humana posterior obligatoria dado el riesgo de alucinación.
- Tareas ligeras de clasificación, etiquetado o resumen corto mediante prompting, aprovechando el bajo coste de inferencia por token.
- Servicio de demostración interno en una sola GPU con vLLM o TGI, con batching continuo para varios usuarios concurrentes.
- Docencia y experimentación en despliegue de LLM: es un modelo pequeño y rápido de cargar para practicar conversión de formatos, cuantización y montaje de servidores de inferencia.

En todos los casos, el uso en producción exige antes una evaluación propia: no hay benchmarks, ni licencia declarada, ni historial de uso por parte de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada y la búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: ~6,2 GB en fp32, ~3,1 GB en fp16/bf16, ~1,6 GB en int8 y ~0,9 GB en int4.
- VRAM total recomendada: 6-8 GB en fp16 contando activaciones y caché KV; 2-4 GB con cuantización de 4 bits. La caché KV crece de forma lineal con la longitud de contexto y su coste exacto depende de una configuración de capas que no está documentada.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3070, RTX 4060) es recomendable cuantizar o reducir la longitud de contexto.
- GPU profesionales: T4 16 GB, L4 24 GB y A10G 24 GB son suficientes para servir el modelo con batching; A100 y H100 quedan infrautilizadas salvo para batching masivo o fine-tuning completo.
- CPU: es viable en fp32 o cuantizado con 8-16 GB de RAM, con latencias del orden de decenas de tokens por segundo o inferiores, muy por debajo de una GPU.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang. llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponible; no se han publicado mediciones y no existe artefacto cuantizado con cifras asociadas.

## Comparativa con modelos similares

No hay información verificada sobre modelos comparables en la documentación del repositorio ni en la búsqueda web realizada, que solo devolvió páginas de Wikipedia sin relación. La comparativa siguiente usa datos de conocimiento público de las familias citadas y no se ha podido contrastar con la documentación de este modelo; las celdas de rendimiento quedan sin datos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Koko12345p/dolphin-cyber-arabic-merged` | 1,54B | no disponible | no disponible | safetensors en HF, 0 descargas | no disponible |
| Qwen2-1.5B-Instruct (familia de referencia del tag) | ~1,54B | 32 768 tokens (dato público de la familia, no verificado aquí) | Apache 2.0 (dato público de la familia, no verificado aquí) | safetensors y GGUF en HF | benchmarks públicos de la familia, no aplicables a este merge |
| Finetunes de la familia Dolphin | varía según base | depende del modelo base | depende del modelo base | safetensors y GGUF en HF | benchmarks publicados por su autor, no aplicables a este merge |

La única conclusión defendible con la información disponible es que este modelo comparte orden de magnitud de parámetros con la familia Qwen2-1.5B, pero no se puede afirmar nada sobre su calidad relativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución. Es un bloqueo legal para cualquier despliegue en producción.
- Sesgos conocidos: no disponible. Al ser un merge sin model card no hay análisis de sesgo, toxicidad ni evaluación de sesgo de género, religión o nacionalidad.
- Riesgo de alucinación: alto y no medido. Un modelo de 1,5B sin evaluación publicada tiende a producir afirmaciones plausibles pero incorrectas, especialmente en dominios especializados como "cyber" o terminología jurídica y sanitaria.
- Idiomas: no hay lista confirmada. El término "arabic" del identificador no garantiza cobertura de variantes dialectales ni de árabe moderno estándar, y no hay evaluación de calidad en ningún idioma.
- Longitud de contexto desconocida: planificar prompts largos sin conocer la ventana real puede provocar truncamientos silenciosos o degradación de la coherencia.
- Procedencia opaca: no se documentan los modelos de origen de la fusión, lo que impide auditar las licencias heredadas y los datos que vieron esos modelos.
- Metadatos anómalos: la fecha de publicación registrada (2026-09-19) y un tamaño de repositorio (12,4 GB) muy superior al esperado para 1,54B en fp16 sugieren ficheros redundantes o poco convencionales; conviene inspeccionar el contenido del repositorio antes de integrarlo.
- Sin validación comunitaria: 0 descargas y 0 likes implican que ningún tercero ha verificado que los pesos carguen correctamente ni que el tokenizador sea coherente.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, por lo que el despliegue en llama.cpp, Ollama o motores con cuantización precompilada exige trabajo adicional y validación de la pérdida de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Koko12345p/dolphin-cyber-arabic-merged
- Referencia citada en la plantilla de la model card (impacto ambiental del aprendizaje automático): https://arxiv.org/abs/1910.09700
- Calculadora de impacto citada en la misma plantilla: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo; la búsqueda web realizada solo devolvió páginas de Wikipedia sin relación.
