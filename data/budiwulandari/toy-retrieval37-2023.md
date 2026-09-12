# budiwulandari/toy-retrieval37-2023

## Resumen

Cnn Transformer for Retrieval es un repositorio de HuggingFace publicado por el usuario budiwulandari que contiene una implementacion propia y compacta en PyTorch de una arquitectura CNN Transformer orientada a tareas de retrieval. No se trata de un modelo entrenado ni de un release listo para produccion: el propio autor indica que el checkpoint incluido (`model.safetensors`) es una inicializacion valida para smoke tests y revision de codigo, no un modelo con pesos entrenados. El peso total del repositorio es de 33.088 parametros, una magnitud que confirma su naturaleza de juguete ("toy") y experimental.

La arquitectura declarada combina atencion dilatada, fusion bilineal, activacion mish y normalizacion GroupNorm, con una configuracion etiquetada como "xlarge" dentro de la propia escala del autor. El repositorio incluye el codigo de definicion del modelo, un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto (optimizador adafactor con schedule de warmup constante) y un script `eval.py`.

Su relevancia es limitada y hay que enmarcarla correctamente: no es un modelo con el que evaluar capacidades de IA, sino una plantilla reproducible para montar experimentos controlados de retrieval. El autor propone explicitamente Flickr30k como primer conjunto de evaluacion, pide reportar la metrica de tarea en al menos tres semillas y exige comparar contra una linea base de capacidad equivalente. Cualquier resultado que se publique deberia documentarse por separado del checkpoint de inicializacion aqui incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (atencion dilatada, fusion bilineal, activacion mish, normalizacion GroupNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Escala declarada por el autor | xlarge (dentro de la configuracion del repositorio) |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Fecha de creacion | 2026-09-11 |
| Fecha de ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con componentes convolucionales, de ahi la denominacion CNN Transformer. La configuracion incluida especifica atencion dilatada (dilated attention), un mecanismo de fusion bilineal entre ramas, funcion de activacion mish y normalizacion GroupNorm en lugar de LayerNorm. El repositorio no detalla el numero de capas, dimensiones de los embeddings, numero de cabezas de atencion ni el factor de dilatacion; esa informacion solo estaria disponible en el `config.json` del repositorio, que no se ha proporcionado en detalle.

Respecto al entrenamiento, no hay ningun entrenamiento completado que reportar. El autor es explicito: la receta por defecto usa el optimizador adafactor con un schedule de warmup constante, y aclara que esos son valores de partida del script, "no evidencia de una ejecucion completada". El checkpoint `model.safetensors` se describe como una inicializacion valida para smoke tests. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. No hay ninguna innovacion tecnica validada experimentalmente: las elecciones de arquitectura son propuestas sin resultados que las respalden.

## Capacidades

- Generacion de texto: no aplica. El modelo esta orientado a retrieval, no a decodificacion generativa.
- Razonamiento, codigo y matematicas: no disponible y, dado el tamano y la ausencia de entrenamiento, no esperable.
- Vision: no confirmado de forma explicita, pero la metrica de evaluacion sugerida (Flickr30k) apunta a retrieval multimodal texto-imagen como tarea objetivo.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): ninguna.
- Ejecucion de smoke tests: el propio autor indica que el checkpoint sirve como inicializacion valida para pruebas de humo y revision de codigo.
- Carga mediante API generica: requiere un adaptador explicito, al ser una implementacion personalizada.

## Casos de uso

- Pruebas de humo de pipelines de retrieval: el checkpoint de 33.088 parametros permite verificar que un pipeline de carga, preprocesado y calculo de similitudes funciona de extremo a extremo sin coste computacional apreciable, antes de sustituir el modelo por uno real.
- Revision de codigo y auditoria de implementaciones: al ser una implementacion propia y compacta, sirve como referencia para revisar decisiones de diseno (atencion dilatada, fusion bilineal, GroupNorm) en un contexto controlado y sin distracciones de escala.
- Plantilla de experimentos controlados de retrieval: el autor propone usar Flickr30k como primer conjunto de evaluacion y exige reportar la metrica en al menos tres semillas con una linea base de capacidad equivalente; el repositorio aporta la estructura para ese protocolo.
- Docencia y formacion en arquitecturas hibridas: permite a estudiantes inspeccionar como se combinan bloques convolucionales y atencion dilatada en un modelo que cabe en memoria y se ejecuta en CPU.
- Base para desarrollo incremental de arquitecturas propias: un desarrollador puede partir de esta implementacion, escalarla y entrenarla con datos propios, manteniendo la separacion entre el checkpoint inicial y los resultados obtenidos.
- Verificacion de compatibilidad con librerias: util para comprobar como se comportan las herramientas de serializacion (safetensors), carga de configuracion y ejecucion de scripts en un modelo minimo antes de aplicarlas a modelos de mayor tamano.
- Benchmarking de infraestructura y de scripts de evaluacion: validar que `eval.py`, el registro de semillas y el volcado de logs funcionan correctamente sin consumir recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que "no benchmark score is claimed in this repository" y que el checkpoint de inicializacion no ha sido entrenado ni auditado. La unica recomendacion metodologica recogida es evaluar sobre Flickr30k reportando la metrica de tarea en al menos tres semillas y contra una linea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 para los 33.088 parametros del checkpoint (aproximadamente 132 KB solo en pesos). El coste real dependera de las activaciones y del tamano de lote, tambien marginales a esta escala.
- GPU recomendadas: ninguna en particular; el modelo es funcionalmente ejecutable en CPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es mas que suficiente.
- Compatibilidad con GPU consumer: si, con enorme margen. Incluso una Raspberry Pi o un entorno sin acelerador serian suficientes.
- Opciones de despliegue: el autor indica que, al ser una implementacion personalizada, las APIs genericas de carga automatica requieren un adaptador explicito. La via de ejecucion documentada es el script `eval.py` del propio repositorio. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los modelos comparables en la categoria de retrieval multimodal son de escala y madurez muy superiores. La comparacion se ofrece solo como referencia de contexto, ya que no existen metricas de rendimiento para este repositorio.

| Modelo | Parametros | Contexto | Rendimiento en retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budiwulandari/toy-retrieval37-2023 | 33.088 | no disponible | no disponible (sin entrenar) | MIT | HuggingFace, experimento |
| CLIP (ViT-B/32, referencia de categoria) | ~151 M | 77 tokens de texto | metricas publicas de zero-shot en Flickr30k y similares | MIT (segun variante) | ampliamente disponible |
| BLIP (referencia de categoria) | ~224 M | no disponible en esta comparacion | metricas publicas de retrieval texto-imagen | licencia especifica del proyecto | ampliamente disponible |
| SigLIP (referencia de categoria) | ~203 M (base) | no disponible en esta comparacion | metricas publicas de zero-shot | Apache 2.0 en variantes abiertas | ampliamente disponible |

La diferencia de escala entre este repositorio (33.088 parametros, sin entrenamiento) y los modelos de referencia (cientos de millones de parametros, entrenados sobre corpus masivos) es de cuatro ordenes de magnitud, por lo que no procede una comparacion de rendimiento directa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier inferencia produce salidas sin significado aprendido; no debe interpretarse como un modelo funcional de retrieval.
- El autor declara que el checkpoint de inicializacion no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se han publicado sesgos conocidos, pero tampoco se ha realizado ninguna evaluacion al respecto; la ausencia de datos no implica ausencia de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si el riesgo de interpretar erroneamente las salidas de un modelo sin entrenar como resultados validos.
- Limitaciones de contexto e idioma: no disponibles. Ni la longitud de contexto ni los idiomas soportados estan documentados.
- Restricciones de licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion. El propio autor advierte que deben revisarse por separado los terminos de los datos de origen cuando el repositorio se use con conjuntos de datos externos.
- Uso en produccion: no recomendado bajo ninguna circunstancia. El repositorio se define como un punto de partida experimental para revision de codigo y experimentos pequenos y controlados.
- Compatibilidad: al ser una implementacion personalizada, las APIs de carga automatica de transformers no funcionaran sin un adaptador explicito.
- Separacion de resultados: cualquier resultado obtenido a partir de un checkpoint entrenado en el futuro debe documentarse de forma separada de los valores por defecto que se distribuyen en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/budiwulandari/toy-retrieval37-2023
- Perfil del autor en HuggingFace: https://huggingface.co/budiwulandari
- Dataset sugerido para evaluacion por el autor: Flickr30k (referencia metodologica, no se proporciona enlace en la model card)
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la busqueda web realizada.
