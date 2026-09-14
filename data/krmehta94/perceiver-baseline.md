# Krmehta94/perceiver-baseline

## Resumen

`Krmehta94/perceiver-baseline` es un repositorio de codigo y checkpoint de inicializacion que implementa una arquitectura Perceiver orientada a aprendizaje contrastivo. Lo publica el usuario Krmehta94 (Kritika) en HuggingFace bajo licencia MIT. No se trata de un modelo entrenado ni de un checkpoint con pesos optimizados: la propia model card lo describe explicitamente como un punto de partida experimental para pruebas de humo (*smoke tests*) y como implementacion de referencia con codigo transparente. El repositorio omite deliberadamente cualquier afirmacion de rendimiento.

El dato mas relevante es su tamano: 33.088 parametros totales (aproximadamente 0,033 millones), segun el recuento real de los tensores almacenados en `model.safetensors`. Es, por tanto, un modelo de escala minima, varios ordenes de magnitud por debajo de cualquier modelo de lenguaje utilizable en produccion. La model card declara una escala "large" en su configuracion, pero esa etiqueta corresponde a la receta de arquitectura generada por el script, no a un modelo grande en terminos absolutos.

Su relevancia es acotada y de naturaleza distinta a la de un modelo desplegable: sirve como esqueleto de investigacion para experimentar con el paradigma Perceiver, con atencion *multi query*, fusion por concatenacion con MLP y normalizacion ScaleNorm, aplicado a objetivos contrastivos. Cualquier evaluacion seria requiere entrenamiento previo sobre datos propios y comparacion contra lineas base de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (implementacion propia en PyTorch) |
| Parametros totales | 33.088 (~0,033 M), dato real de safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Mecanismo de atencion | multi query |
| Fusion | concat mlp |
| Activacion | relu |
| Normalizacion | scalenorm |
| Escala declarada en config | large |
| Tamano del repositorio | 0,0 GB |
| Optimizador por defecto | sgd |
| Planificador por defecto | exponential |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver implementado a mano en PyTorch. El Perceiver es una familia de modelos que proyecta entradas de cualquier modalidad sobre un conjunto latente de tamano fijo mediante atencion cruzada, lo que en principio desacopla el coste computacional de la longitud de la entrada. En esta configuracion concreta se emplea atencion *multi query*, fusion por concatenacion seguida de un MLP, activacion ReLU y normalizacion ScaleNorm. El autor no publica detalles sobre el numero de capas, la dimension latente, el numero de cabezas ni la dimension de las entradas, mas alla de lo registrado en `config.json`, que no se reproduce en la model card.

En cuanto al entrenamiento, no hay ningun entrenamiento completado detras de los pesos. El repositorio incluye una receta por defecto (SGD con planificador exponencial) que el propio autor califica como valores de partida del script, no como evidencia de una ejecucion finalizada. El fichero `model.safetensors` se describe como un checkpoint de inicializacion valido para pruebas de humo y no como un checkpoint con rendimiento medido. No se documentan tokens de entrenamiento, composicion del dataset, ni etapas de RLHF, DPO o ajuste por instrucciones. La model card recomienda, para cualquier evaluacion futura, exponer todos los modelos comparados al mismo volumen de datos, presupuesto de ajuste y semillas aleatorias, y publicar los registros de entrenamiento y las versiones del entorno junto a los resultados.

## Capacidades

- Generacion de texto: no disponible. No hay evidencia de que el modelo se haya entrenado para modelado de lenguaje.
- Razonamiento, matematicas y codigo: no disponible.
- Vision: no disponible, pese a que la arquitectura Perceiver esta disenada para ser agnostica de modalidad.
- Representaciones contrastivas: el repositorio declara el objetivo contrastivo como proposito de la implementacion, pero los pesos no han sido entrenados con el, por lo que no producen representaciones utiles de forma directa.
- Tool calling / function calling: no soportado.
- Capacidades de agente y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (*thinking*): no disponible.
- Vision, audio o multimodalidad efectiva: no disponible.
- Carga mediante APIs automaticas genericas: requiere un adaptador explicito por tratarse de una implementacion personalizada, segun advierte el autor.
- Ejecucion de ejemplo incluida: el script `inference.py` incorpora un bloque `__main__` con una prueba de humo generada.

## Casos de uso

- Prueba de humo de pipelines de carga de safetensors: el checkpoint pesa apenas unos kilobytes y permite verificar que una infraestructura de serializacion, versionado y carga de tensores funciona de extremo a extremo antes de invertir en modelos de mayor tamano.
- Banco de pruebas de atencion multi query: permite medir coste y comportamiento de ese mecanismo de atencion en aislamiento, sin el ruido de un modelo entrenado, para validar kernels o reescrituras de bajo nivel.
- Reproduccion de experimentos academicos sobre el paradigma Perceiver: sirve como punto de partida para un equipo que quiera reimplementar la arquitectura con su propio conjunto latente y su propio esquema de atencion cruzada, partiendo de codigo transparente ya funcional.
- Base para investigacion en aprendizaje contrastivo: el repositorio esta etiquetado como contrastivo, de modo que puede servir de esqueleto para anadir una funcion de perdida tipo InfoNCE y entrenar sobre pares positivos y negativos propios.
- Validacion de comparativas justas entre arquitecturas: dado que la model card insiste en igualar exposicion de datos, presupuesto de ajuste y semillas, el repositorio encaja como plantilla para montar un banco de comparacion controlado frente a lineas base de capacidad equivalente.
- Docencia y formacion interna: con 33.088 parametros, el modelo se ejecuta en cualquier portatil y permite ilustrar el funcionamiento de la atencion cruzada y de la normalizacion ScaleNorm sin necesidad de GPU.
- Verificacion de licencias y cumplimiento: al ser MIT y no incluir pesos derivados de datos de terceros, sirve como referencia para equipos que necesiten auditar la trazabilidad de una dependencia antes de integrarla en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se reclama ninguna puntuacion de benchmark y que el checkpoint es una inicializacion sin entrenar. No existen, por tanto, numeros de MMLU, HumanEval, GSM8K ni de metricas contrastivas como Recall@K que se puedan presentar.

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable. Con 33.088 parametros, los pesos ocupan del orden de 130 KB en fp32 (unos 66 KB en fp16), muy por debajo de cualquier limite de memoria de GPU o incluso de la memoria de un microcontrolador moderno.
- GPU recomendadas: ninguna en particular. El modelo se ejecuta en CPU sin dificultad, y tambien en cualquier GPU, desde una GTX 1050 hasta una H100, sin que la eleccion afecte al rendimiento de forma apreciable.
- GPU de consumo: si, cabe en cualquier GPU de consumo, e incluso en aceleradores integrados y en hardware embebido con recursos minimos.
- Opciones de despliegue: al ser una implementacion personalizada con atencion multi query y ScaleNorm, no es compatible de forma directa con vLLM, TGI, llama.cpp u Ollama. El propio autor indica que las APIs automaticas de carga generica requieren un adaptador explicito. El despliegue natural es ejecutar `inference.py` con PyTorch.
- Latencia y throughput: no disponibles. La model card no publica mediciones, y al tratarse de un checkpoint sin entrenar carece de sentido medir latencia de inferencia con fines comparativos.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el mismo nicho, porque este repositorio no es un modelo entrenado sino una implementacion de referencia con pesos de inicializacion. Compararlo con codificadores contrastivos de uso real (por ejemplo, la familia CLIP o SigLIP) o con modelos perceptores entrenados como Perceiver IO carece de sentido, ya que la diferencia de escala, datos y estado de entrenamiento invalida cualquier comparacion de rendimiento. Se indica a continuacion el estado de los datos que no se pueden verificar:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| Krmehta94/perceiver-baseline | 33.088 | no disponible | sin benchmarks (checkpoint sin entrenar) | MIT | publico en HuggingFace |
| Perceiver IO (DeepMind) | no disponible | no disponible | no disponible | no disponible | referencia arquitectonica, no comparada |
| Codificadores contrastivos de uso comun | no disponible | no disponible | no disponible | no disponible | fuera de categoria por escala y entrenamiento |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Los pesos son una inicializacion, por lo que las salidas no tienen valor predictivo ni representacional.
- El autor declara explicitamente que el modelo no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No existen resultados de benchmarks, y la model card advierte que cualquier resultado de un futuro checkpoint entrenado debera documentarse por separado de los valores por defecto aqui incluidos.
- La etiqueta de escala "large" en la configuracion puede inducir a error: no describe el tamano real del modelo, que es de 33.088 parametros.
- No hay informacion sobre idiomas, longitudes de contexto soportadas ni composicion de datos, por lo que no es posible anticipar sesgos.
- Riesgo de alucinacion: no aplicable en el sentido habitual, ya que el modelo no genera texto de forma fiable; el riesgo real es interpretar sus salidas como si tuvieran significado.
- Compatibilidad: al ser una implementacion personalizada, no funciona con cargadores automaticos estandar sin escribir un adaptador.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero el autor recomienda revisar por separado los terminos de los datos de origen si se combina con conjuntos de datos externos.
- Sin mantenimiento demostrable: 0 descargas y 0 likes, con fecha de publicacion y actualizacion separadas por seis segundos, lo que sugiere un volcado puntual mas que un proyecto en desarrollo activo.
- Fecha de creacion registrada en 2026, inusualmente futura respecto a la informacion de contexto disponible; conviene verificar la validez del sello temporal antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Krmehta94/perceiver-baseline
- Perfil del autor en HuggingFace: https://huggingface.co/Krmehta94
- Ficheros incluidos en el repositorio: `inference.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` (accesibles desde la pestana de archivos de la pagina del modelo)
- Paper de referencia de la arquitectura Perceiver IO: no disponible en los resultados de busqueda proporcionados
- Repositorio de codigo adicional, demo o blog del autor: no disponible en los resultados de busqueda proporcionados
