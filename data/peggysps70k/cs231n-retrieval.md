# peggysps70k/cs231n-retrieval

## Resumen

`peggysps70k/cs231n-retrieval` es un repositorio experimental publicado en HuggingFace que contiene una implementación propia y compacta de **CoCa** (Contrastive Captioners) orientada a tareas de recuperación imagen-texto (retrieval). El autor lo etiqueta como configuración "nano", pensada para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeño tamaño, no como un modelo preentrenado listo para producción.

El checkpoint incluido (`model.safetensors`) es una inicialización válida, no un modelo entrenado: la propia model card aclara que no se ha completado ningún entrenamiento ni se reclama ninguna métrica de benchmark. El peso total registrado en safetensors es de apenas 16.576 parámetros, lo que confirma que se trata de un esqueleto arquitectónico mínimo.

Su relevancia no está en el rendimiento, sino en el valor didáctico y de ingeniería: sirve como punto de partida para entender la arquitectura CoCa, ejecutar pipelines de retrieval a escala minúscula y, si el usuario entrena el modelo (por ejemplo sobre Flickr30k, como sugiere la propia documentación), obtener resultados comparables con baselines de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoCa (Contrastive Captioner) con tensor fusion |
| Parametros totales | 16.576 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en fp por defecto) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación sigue el diseño de CoCa, una variante de los modelos dual-encoder (tipo CLIP) que combina un encoder de imágenes con un decodificador de texto dividido en dos partes: un texto unimodal para pérdida contrastiva y otro multimodal para pérdida de captioning. En esta versión nano se emplea atención **multi-query** (que reduce el número de cabezas de clave/valor frente a la atención multi-cabeza estándar, ahorrando memoria y cómputo), **tensor fusion** como mecanismo de fusión, activación **mish** y normalización **layernorm**.

En cuanto a entrenamiento, el repositorio no incluye un modelo entrenado: `training_args.json` registra una receta por defecto con optimizador **rmsprop** y planificación de **linear warmup**, que la model card describe explícitamente como valores iniciales de partida, no como evidencia de una ejecución completada. No hay datos sobre número de tokens, composición del dataset ni etapas de RLHF/DPO. La propia documentación recomienda, para una evaluación con sentido, entrenar sobre **Flickr30k**, reportar la métrica de la tarea en al menos tres semillas y comparar contra un baseline de capacidad equivalente.

## Capacidades

- Implementación ejecutable de CoCa para retrieval imagen-texto, con punto de entrada de entrenamiento y ejemplo en `train.py`.
- Checkpoint de inicialización válido para smoke tests y verificación de pipelines (formas de tensores, carga de safetensors, bucle de entrenamiento).
- Configuración reproducible mediante `config.json` y `training_args.json`.
- Atención multi-query y tensor fusion como características técnicas del modelo nano.
- No genera texto de uso general, no tiene capacidades de razonamiento, código, visión preentrenada ni tool calling: es un esqueleto experimental sin entrenamiento.
- No compatible de forma directa con APIs de carga automática de HuggingFace: la model card indica que se requiere un adaptador explícito al ser una implementación personalizada.

## Casos de uso

- **Enseñanza de arquitecturas multimodales**: ideal como material de estudio en un curso tipo CS231n (como sugiere el nombre del repositorio) para leer y modificar una implementación compacta de CoCa sin la complejidad de un modelo de producción.
- **Smoke tests de infraestructura**: verificar pipelines de entrenamiento, carga de checkpoints safetensors y logging antes de escalar a un modelo real, dado su tamaño mínimo de 16.576 parámetros.
- **Prototipado de retrieval imagen-texto**: punto de partida para implementar y depurar la lógica de pérdida contrastiva y captioning antes de entrenar con datos reales.
- **Experimentos controlados de ablación**: al ser nano y reproducible, permite comparar cambios de arquitectura (atención multi-query frente a multi-head, distintas activaciones) con presupuesto de cómputo mínimo.
- **Benchmark educativo sobre Flickr30k**: la propia model card propone entrenarlo sobre Flickr30k con tres semillas y un baseline de capacidad equivalente como primer ejercicio de evaluación rigurosa.
- **Plantilla para implementaciones propias**: el código puede servir de base para adaptar CoCa a dominios específicos (e-commerce, búsqueda visual interna) una vez entrenado con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo confirma expresamente: "No benchmark score is claimed in this repository" y el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada: despreciable para inferencia del checkpoint de inicialización; con 16.576 parámetros, el modelo ocupa unos pocos kilobytes y cabe con holgura en cualquier GPU o incluso solo en CPU.
- GPU recomendadas: no disponible; cualquier GPU moderna (incluso una GTX 1050 o una integrada) es más que suficiente. Para entrenar sobre Flickr30k en configuración nano, una GPU de consumo como una RTX 3060 o superior sería adecuada.
- Cabe en GPUs de consumo: sí, sin excepción, dada la escala minúscula del modelo.
- Despliegue: PyTorch nativo ejecutando `train.py`; no hay soporte directo para vLLM, llama.cpp, Ollama o TGI, ya que es una implementación personalizada que requiere adaptador explícito para cargarse con APIs automáticas.
- Latencia y throughput: no disponible; al ser un modelo nano no entrenado, cualquier medición carecería de significado práctico.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entrenado | Licencia |
|---|---|---|---|---|
| peggysps70k/cs231n-retrieval (nano) | 16.576 | Retrieval imagen-texto (experimental) | No (solo inicialización) | Apache-2.0 |
| laion/CoCa-ViT-L-14-laion2B-s13B-b90k | ~400M (ViT-L/14 + texto) | Retrieval y captioning imagen-texto | Sí (LAION-2B) | Apache-2.0 / CC-BY según checkpoint |
| openai/CLIP-ViT-L-14 | ~428M | Zero-shot clasificación y retrieval imagen-texto | Sí (400M pares WIT) | Licencia propia de OpenAI (uso restringido) |

La comparación es orientativa: las alternativas citadas son modelos preentrenados listos para producción, mientras que el modelo de esta ficha es una implementación nano sin entrenar, por lo que no compite en rendimiento con ellos.

## Limitaciones y advertencias

- El checkpoint incluido **no está entrenado**: produce salidas sin significado semántico y no debe usarse para ninguna tarea real.
- La model card advierte explícitamente que la inicialización no ha sido auditada en robustez, equidad (fairness) ni transferencia de dominio.
- Al ser una implementación personalizada, no es compatible con `from_pretrained` ni con las APIs automáticas de HuggingFace sin escribir un adaptador.
- No hay datos de idiomas soportados, longitud de contexto ni cuantización; cualquier uso multimodal requeriría definir tokenizador y preprocesado por cuenta propia.
- Riesgo de alucinación: no aplicable en el sentido habitual (no es un modelo generativo de lenguaje entrenado), pero cualquier resultado obtenido con el checkpoint sin entrenar sería espurio.
- Licencia Apache-2.0 permite uso comercial, pero la model card recomienda revisar los términos de los datasets externos (por ejemplo Flickr30k) utilizados en el entrenamiento.
- Con solo 3 descargas y 0 likes, no existe comunidad ni soporte alrededor del repositorio; el mantenimiento dependerá exclusivamente del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/peggysps70k/cs231n-retrieval
- Paper original de CoCa (referencia de arquitectura): https://arxiv.org/abs/2111.08776
- Otros enlaces (demo, blog, repositorio externo): no disponibles
