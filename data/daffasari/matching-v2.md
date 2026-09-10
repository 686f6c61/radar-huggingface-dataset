# Daffasari/matching-v2

## Resumen

Daffasari/matching-v2 es un prototipo de investigacion publicado en HuggingFace por el usuario Daffasari. Se presenta como una implementacion propia de una arquitectura CNN Transformer orientada a tareas de *matching* (emparejamiento o comparacion de pares de entradas). El repositorio incluye el codigo de definicion del modelo, los ficheros de configuracion de arquitectura y de receta de entrenamiento, y un checkpoint de safetensors que el propio autor describe explicitamente como una inicializacion valida para pruebas de humo, no como un modelo entrenado.

El dato mas relevante es su tamano real: el checkpoint de safetensors contiene 24.832 parametros en total, una cifra extraordinariamente pequena que contrasta con la etiqueta "xlarge" que el autor usa para la escala de la configuracion. El repositorio ocupa 0,0 GB y acumula 0 descargas y 0 likes, por lo que se trata de un artefacto recien creado y sin validacion por parte de la comunidad (creado y actualizado el 10 de septiembre de 2026).

No es un modelo listo para produccion ni para evaluacion comparativa: el propio autor indica que no se reclama ninguna puntuacion de benchmark y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Su interes ahora mismo es exclusivamente como punto de partida experimental reproducible para quien quiera investigar arquitecturas hibridas CNN + transformer en tareas de matching.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucional + transformer) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala declarada por el autor | xlarge |
| Mecanismo de atencion | flash attention |
| Fusion | gated fusion |
| Activacion | GELU |
| Normalizacion | RMSNorm |
| Optimizador de la receta por defecto | RMSProp |
| Planificador de learning rate | polynomial |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura se describe como "Cnn Transformer", es decir, una combinacion de capas convolucionales y bloques transformer. La configuracion registrada en `config.json` especifica atencion de tipo flash, fusion con compuertas (*gated fusion*), activacion GELU y normalizacion RMSNorm. No se detalla en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni como se intercalan los bloques convolucionales con los de atencion, por lo que esos datos quedan como no disponibles. La etiqueta "xlarge" es una denominacion interna de la receta del autor y no se corresponde con el tamano real del checkpoint, que tiene 24.832 parametros.

En cuanto al entrenamiento, el fichero `training_args.json` recoge una receta por defecto basada en RMSProp con un planificador polinomial del learning rate. El autor aclara de forma explicita que estos son valores de arranque del script y no evidencia de una ejecucion completada. No hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF o DPO, ni sobre tecnicas de alineacion. El propio repositorio advierte que el checkpoint de `model.safetensors` es una inicializacion valida para pruebas de humo y no un modelo entrenado. Como recomendacion de evaluacion, el autor propone usar un conjunto de validacion emparejado, reportar la metrica de tarea sobre al menos tres semillas y comparar contra una linea base de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas ni documentadas. El checkpoint publicado no ha sido entrenado, por lo que no se puede afirmar que genere texto, resuelva tareas de razonamiento, escriba codigo ni ejecute calculos.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para agentes ni para razonamiento multi-paso.
- No se documentan capacidades multilingues ni lista de idiomas soportados.
- No se documentan modos especiales (modo de pensamiento, vision, audio u otros).
- El proposito declarado de la arquitectura es la tarea de *matching*, pero no se aporta evidencia empirica de que el prototipo la resuelva con un rendimiento determinado.

## Casos de uso

Dado que el checkpoint publicado no esta entrenado, los casos siguientes solo son aplicables tras completar un entrenamiento y una evaluacion propios. Se plantean como escenarios de investigacion, no como aplicaciones listas para usar.

- Reproduccion de experimentos de arquitectura: sirve como base de codigo para estudiar como se comporta una hibridacion CNN + transformer frente a un transformer puro en tareas de emparejamiento, manteniendo la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias.
- *Ablation studies* sobre el bloque de fusion: la configuracion incluye *gated fusion* y RMSNorm, de modo que un investigador puede activar y desactivar estos componentes para medir su contribucion con una linea base de capacidad equivalente.
- Investigacion sobre eficiencia con convoluciones: al incorporar capas convolucionales, el prototipo permite estudiar si se reduce el coste computational frente a la atencion completa en secuencias de entrada largas.
- Pruebas de humo de pipelines de entrenamiento: el `model.safetensors` y el script `pipeline.py` permiten validar que un *dataloader*, un bucle de entrenamiento o un sistema de checkpoints funciona correctamente antes de lanzar un experimento a gran escala.
- Comparacion de optimizadores: la receta por defecto usa RMSProp con planificador polinomial, lo que facilita comparar esta eleccion contra AdamW u otros optimizadores bajo el mismo presupuesto de ajuste.
- Docencia y formacion: por su tamano minimo y su codigo autocontenido, es un ejemplo util para explicar en un aula como se estructura un modelo hibrido y como se serializa en safetensors.
- Reutilizacion de infraestructura de matching: si se completa el entrenamiento, la arquitectura podria aplicarse a tareas de emparejamiento generico (pares consulta-documento, similitud entre entradas), siempre que se valide con un conjunto emparejado y varias semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint adjunto no es un modelo entrenado. Cualquier cifra de rendimiento deberia documentarse en un checkpoint futuro y de forma separada a los valores por defecto aqui incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24.832 parametros, el checkpoint ocupa aproximadamente 97 KiB en precision fp32 y unos 48 KiB en fp16, por lo que la huella de memoria es insignificante.
- GPU recomendadas: no se requiere GPU. El checkpoint de inicializacion cabe y se ejecuta en CPU sin problema. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en hardware integrado, dado el tamano del checkpoint.
- Opciones de despliegue: al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito. El punto de entrada documentado es el script `pipeline.py` (por ejemplo, `python pipeline.py --help`). No hay evidencia de soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y el checkpoint no esta entrenado, por lo que cualquier cifra careceria de sentido.

## Comparativa con modelos similares

No disponible. No se han publicado resultados de benchmarks ni caracteristicas de rendimiento para este prototipo, y no se identifican en la informacion proporcionada modelos publicos directamente comparables en la misma categoria (arquitecturas hibridas CNN + transformer para matching con este mismo planteamiento y licencia). Sin metricas verificables, cualquier comparacion numerica seria especulativa. La unica comparacion objetiva posible es de forma: frente a un transformer puro de capacidad equivalente, este prototipo anade capas convolucionales y fusion con compuertas, pero no existe evidencia empirica de que ello aporte ventaja.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado. No debe usarse para inferencia real ni para producir resultados que se presenten como validos.
- No se reclama ninguna puntuacion de benchmark y no existe evaluacion independiente.
- El modelo no ha sido auditado en robustez, equidad ni transferencia de dominio, segun indica el propio autor.
- Se desconocen los sesgos asociados, porque no hay datos de entrenamiento documentados ni evaluacion disponible.
- Riesgo de alucinacion: no evaluable, dado que el modelo no esta entrenado.
- Limitaciones de contexto e idioma: no disponibles. No se documenta longitud de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia es MIT, permisiva y apta para uso comercial, pero el autor advierte que deben revisarse por separado los terminos de los datos de origen cuando el repositorio se use con conjuntos de datos externos.
- Advertencia de produccion: se trata de un punto de partida experimental. Cualquier resultado obtenido con un checkpoint futuro debe documentarse de forma separada a los valores por defecto incluidos en el repositorio.
- Discrepancia a tener en cuenta: la etiqueta de escala "xlarge" no se corresponde con el tamano real del checkpoint (24.832 parametros).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daffasari/matching-v2
- Ficheros incluidos en el repositorio: `pipeline.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos corresponden a paginas comerciales de radiadores y calefacciones electricas (B&Q, Good Housekeeping, Screwfix, Currys, Argos), sin relacion alguna con el modelo. No se dispone de paper, blog, repositorio adicional ni demo asociados.
