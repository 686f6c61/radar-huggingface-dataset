# adv-erma/deit-finetuned

## Resumen

`adv-erma/deit-finetuned` es un repositorio de HuggingFace publicado por el usuario `adv-erma` que contiene una implementacion propia y compacta de DeiT (Data-efficient Image Transformer) orientada a aprendizaje contrastivo. A pesar del sufijo "finetuned" en el identificador, la propia model card aclara que el checkpoint incluido (`model.safetensors`) es una inicializacion valida para pruebas de humo (*smoke tests*), no un modelo entrenado ni evaluado. El repositorio declara explicitamente que no reclama ninguna puntuacion de benchmark.

El modelo pertenece a la escala que el autor denomina "nano" y cuenta con 33.088 parametros totales segun los datos reales de safetensors, un orden de magnitud muy inferior al de cualquier DeiT estándar (DeiT-Tiny ronda los 5,7 millones). La arquitectura declarada combina atención dispersa (*sparse*), fusión de tensores (*tensor fusion*), activación ReLU y normalización GroupNorm, lo que se aparta del DeiT canónico, que usa atención densa, GELU y LayerNorm.

Su relevancia no es la de un modelo desplegable, sino la de un artefacto de desarrollo: sirve como punto de partida reproducible para revisar codigo, montar pruebas de integracion en pipelines de entrenamiento y ejecutar experimentos controlados de arquitectura contrastiva a escala minima. Cualquier uso en produccion o cualquier afirmacion de rendimiento seria prematura con el estado actual del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (vision transformer) con implementacion propia |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no aplica: modelo de vision, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint PyTorch) |
| Escala declarada | nano |
| Mecanismo de atencion | sparse |
| Fusion | tensor fusion |
| Activacion | ReLU |
| Normalizacion | GroupNorm |
| Optimizador por defecto | Adam con schedule de tipo step |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es un DeiT implementado a medida en PyTorch, con un conjunto de decisiones que lo alejan del DeiT de referencia: atencion dispersa en lugar de atencion completa, fusion de tensores, activacion ReLU, GroupNorm como normalizacion y una escala "nano" de 33.088 parametros. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto (Adam con schedule de tipo *step*). El autor advierte que esos valores son puntos de partida del script y no evidencia de un entrenamiento completado.

No hay informacion sobre volumen de tokens, composicion del dataset, resolucion de entrada, numero de clases, ni sobre si se aplico RLHF, DPO u otra fase de alineamiento. La model card indica explicitamente que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, y que se debe tratar como un punto de partida experimental. Como el modelo esta orientado a contraste, la cabeza de proyeccion y la funcion de perdida contrastiva (tipo InfoNCE) serian componentes esperables del codigo en `main.py`, pero su configuracion concreta no se detalla en la informacion disponible.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint es una inicializacion sin entrenamiento, por lo que no produce representaciones utiles ni predicciones fiables.
- El codigo apunta a aprendizaje contrastivo, es decir, a aprender embeddings donde muestras similares queden proximas; sin entrenamiento, esos embeddings son esencialmente aleatorios.
- No hay soporte documentado de *tool calling*, *function calling* ni uso como agente: no es un modelo de lenguaje.
- No hay capacidades multilingues: el modelo no procesa texto.
- No se documenta soporte de vision mas alla de la propia arquitectura tipo transformer de imagenes (clasificacion o embedding de imagenes), sin resolucion ni preprocesado especificados.
- No se declara modo *thinking*, audio, video ni ninguna capacidad especial adicional.
- Lo que si ofrece es capacidad de ejecucion: el script `main.py` incluye un ejemplo ejecutable y un bloque `__main__` con una prueba de humo, y admite `python main.py --help`.

## Casos de uso

- Pruebas de humo en CI de pipelines de vision: el checkpoint de 33.088 parametros permite verificar que un *dataloader*, un *forward pass* y el guardado de safetensors funcionan de extremo a extremo en segundos, sin coste de GPU.
- Revisión de codigo y *code review* de arquitecturas: sirve como referencia minima para discutir decisiones como atencion dispersa, GroupNorm o fusion de tensores sin la complejidad de un DeiT completo.
- Prototipado de cabezas contrastivas: al ser un modelo diminuto, permite iterar sobre funciones de perdida, temperatura y estrategias de *augmentation* comprobando que el pipeline aprende sobre un conjunto de juguete antes de escalar a un backbone real.
- *Sanity checks* de integracion con librerías: util para comprobar que un *adapter* propio carga correctamente el `config.json` y los pesos, dado que la model card avisa de que las APIs genericas de carga automatica necesitan un adaptador explicito.
- Docencia y formacion: un ejemplo ejecutable que ilustra la estructura de un transformer de vision y un esquema contrastivo en un unico fichero Python.
- Pruebas de presupuesto de memoria y *profiling*: con ~132 KB en fp32, permite validar herramientas de perfilado y medicion sin consumir recursos, aislando el ruido de la infraestructura del comportamiento del modelo.
- Comparativa de *baselines* con capacidad emparejada: la propia model card recomienda evaluar contra un *baseline* de capacidad equivalente usando los mismos datos, presupuesto de *tuning* y semillas, algo para lo que este checkpoint actua como punto de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se reclama ninguna puntuacion de benchmark y que `model.safetensors` es un checkpoint de inicializacion, no un checkpoint entrenado. Cualquier cifra de MMLU, HumanEval, GSM8K o similar no aplica, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 132 KB en fp32 (33.088 parametros x 4 bytes) y unos 66 KB en fp16. El coste de memoria es despreciable.
- GPU recomendadas: cualquier GPU, incluida una integrada; no se requiere acelerador dedicado. Una NVIDIA RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para este checkpoint.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, en iGPU y en CPU sin dificultad.
- Opciones de despliegue: al ser una implementacion propia, no hay soporte confirmado para vLLM, TGI, llama.cpp u Ollama. El propio autor indica que las APIs genericas de carga requieren un adaptador explicito; el punto de entrada documentado es `python main.py --help`.
- Latencia y throughput: no disponible. No hay mediciones publicadas, y al tratarse de un checkpoint sin entrenar carece de sentido medir calidad de inferencia.

## Comparativa con modelos similares

La comparacion es poco significativa porque este repositorio no es un modelo entrenado. Se incluye como referencia orientativa; los datos de los DeiT de referencia son cifras publicas ampliamente conocidas de la familia DeiT, no datos extraidos de este repositorio.

| Modelo | Parametros | Licencia | Estado | Rendimiento |
|---|---|---|---|---|
| adv-erma/deit-finetuned | 33.088 | BSD-3-Clause | Checkpoint de inicializacion, sin entrenar | No se reclama ninguna puntuacion |
| DeiT-Tiny (referencia publica) | ~5,7 M | Apache-2.0 (referencia) | Entrenado y evaluado en ImageNet | No disponible en la informacion de este repositorio |
| DeiT-Small (referencia publica) | ~22 M | Apache-2.0 (referencia) | Entrenado y evaluado en ImageNet | No disponible en la informacion de este repositorio |
| ViT-Base (referencia publica) | ~86 M | Apache-2.0 (referencia) | Entrenado y evaluado | No disponible en la informacion de este repositorio |

Diferencias estructurales relevantes frente al DeiT canonico: atencion sparse en lugar de densa, ReLU en lugar de GELU y GroupNorm en lugar de LayerNorm. No hay datos comparativos de contexto, ya que ninguno de estos modelos opera con ventana de contexto textual.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier uso para inferencia real produciría salidas sin valor predictivo.
- El autor declara que no se ha auditado robustez, equidad ni transferencia de dominio. No hay analisis de sesgos disponible.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero si existe riesgo de interpretar erroneamente sus salidas como significativas cuando son aleatorias.
- No hay informacion sobre la composicion del dataset de entrenamiento ni sobre los terminos de las fuentes de datos. La model card advierte de que hay que revisar por separado los terminos de los datos externos si se usa el repositorio con datasets de terceros.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright, pero al no haber un modelo entrenado la licencia no habilita ningun producto funcional derivado de este checkpoint.
- Integracion: las APIs genericas de carga automatica no funcionan sin un adaptador explicito, dado que es una implementacion a medida.
- El identificador del repositorio incluye "finetuned", lo que puede inducir a error; la propia documentacion desmiente esa lectura.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB, coherente con un artefacto de prueba sin adopcion.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a ofertas de empleo del sector de administracion de ventas en frances ("ADV"), sin relacion con el repositorio. No se han encontrado papers, blogs ni demos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adv-erma/deit-finetuned
- No se han encontrado papers, blogs, repositorios de codigo adicionales ni demos asociados al modelo en la busqueda web realizada.
