# andrearossifo/deit-experiment

## Resumen

`andrearossifo/deit-experiment` es un prototipo de investigación publicado en HuggingFace que combina la arquitectura DeiT (Data-efficient Image Transformer) con un objetivo de aprendizaje contrastivo. Lo desarrolla el usuario andrearossifo dentro de un repositorio personal sin métricas ni validación publicadas, y se distribuye bajo licencia Apache 2.0. El propio autor lo describe como un punto de partida experimental, no como un modelo entrenado.

El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, con un total de 33.088 parámetros, una cifra muy inferior a la de cualquier DeiT-tiny de referencia (en torno a 5,7 millones). La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el modelo no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

Su relevancia ahora es limitada y fundamentalmente metodológica: sirve como plantilla reproducible de arquitectura, configuración y flujo de entrenamiento para experimentos contrastivos con atención de ventana deslizante, activación approx gelu y normalización rmsnorm. No es adecuado para uso en producción ni para evaluación comparativa sin entrenamiento previo y sin una documentación de resultados independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (vision transformer) con atencion de ventana deslizante y fusion "co attention" |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (ademas de `inference.py`, `config.json`, `training_args.json`) |

## Arquitectura y entrenamiento

La arquitectura es un DeiT a escala "tiny" segun la propia configuracion del autor. La model card especifica cuatro decisiones tecnicas concretas: atencion de ventana deslizante (sliding window), fusion mediante "co attention", funcion de activacion approx gelu y normalizacion rmsnorm. Esta combinacion se aleja del DeiT canonico, que usa atencion global estandar, activacion gelu y layer norm, por lo que se trata de una implementacion personalizada que requiere un adaptador explicito para cargarse con APIs genericas de transformers.

No hay informacion sobre datos de entrenamiento: no se indica el numero de tokens o imagenes, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor solo documenta la receta por defecto del script (optimizador adam con planificador exponencial) y advierte que son valores iniciales, no evidencia de una ejecucion completada. El repositorio ocupa 0,0 GB y la model card insiste en que el checkpoint es una inicializacion y no un modelo entrenado.

## Capacidades

- El checkpoint publicado no ha sido entrenado, por lo que no cabe atribuirle capacidades funcionales verificadas.
- La arquitectura de destino es un transformer de vision con objetivo contrastivo, lo que en teoria lo orientaria a generar representaciones (embeddings) de imagen comparables por similitud, pero el autor no confirma la modalidad ni el pipeline.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni sobre soporte de texto.
- No se mencionan modos especiales (thinking mode, vision, audio) mas alla de la propia arquitectura DeiT.
- El unico uso verificable hoy es el smoke test mediante `python inference.py --help`.

## Casos de uso

- Prototipado de arquitecturas contrastivas: el repositorio sirve como plantilla para montar un experimento con atencion de ventana deslizante y rmsnorm, reutilizando `config.json` y `training_args.json` como punto de partida reproducible. Adecuado porque incluye tanto la configuracion de arquitectura como la receta de entrenamiento por defecto.
- Docencia e investigacion metodologica: util para explicar la diferencia entre un checkpoint de inicializacion y un checkpoint entrenado, y para disenar protocolos de evaluacion con semillas multiples y linea base de capacidad equivalente, tal como recomienda el propio autor.
- Pruebas de humo de pipelines de carga: permite validar que un entorno de PyTorch, safetensors y lectura de configuracion funciona antes de invertir en modelos de mayor tamano, dado que el checkpoint son 33.088 parametros.
- Desarrollo de adaptadores de carga personalizados: al no ser compatible con las APIs automaticas estandar, es un caso practico para implementar y depurar un adaptador especifico de `transformers`.
- Base para experimentos de aprendizaje contrastivo en vision: si se completase un entrenamiento, el objetivo contrastivo seria aplicable a tareas de recuperacion o agrupamiento de imagenes por similitud; hoy esa aplicacion es hipotetica.
- Reproducibilidad de recetas de optimizacion: el par adam mas planificador exponencial documentado permite comparar recetas de entrenamiento manteniendo constante la arquitectura, util en estudios de ablacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark y que el checkpoint no es un modelo entrenado, por lo que cualquier tabla comparativa de MMLU, HumanEval, GSM8K o metricas de vision carece de base en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 33.088 parametros, el checkpoint ocupa menos de 1 MB en fp32 y menos de 0,5 MB en fp16.
- GPU recomendadas: no se requieren. Cualquier GPU, incluida una integrada, es suficiente; tambien se puede ejecutar en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en practicamente cualquier generacion anterior, dado el tamano del modelo.
- Opciones de despliegue: el autor solo documenta la ejecucion mediante `inference.py`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la carga con APIs genericas de `transformers` requiere un adaptador explicito.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y no tendrian sentido sin un entrenamiento previo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andrearossifo/deit-experiment | 33.088 | no disponible | sin benchmarks publicados; checkpoint sin entrenar | apache-2.0 | HuggingFace, implementacion personalizada |
| DeiT-tiny de referencia (facebook/deit-tiny-patch16-224) | en torno a 5,7 M (cifra publica del modelo original) | no aplica (entrada de imagen de 224x224) | metricas publicadas de clasificacion en ImageNet | apache-2.0 | HuggingFace, integrado en transformers |
| Otros ViT pequenos de proposito general | no disponible | no disponible | no disponible | variable | HuggingFace |

La diferencia mas relevante es de escala: el prototipo analizado tiene aproximadamente un 0,6 por ciento de los parametros del DeiT-tiny de referencia. Esa brecha, unida a la ausencia de entrenamiento, impide cualquier comparacion de rendimiento significativa. No se dispone de datos suficientes para comparar con alternativas contrastivas especificas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no tiene capacidades funcionales aprendidas y no debe usarse para inferencia real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun reconoce el propio autor.
- Riesgo de alucinacion: no aplica en el sentido habitual al no tratarse de un modelo generativo de texto entrenado, pero cualquier salida derivada de un checkpoint sin entrenar es ruido sin valor informativo.
- Sesgos conocidos: no disponibles, ya que no hay datos de entrenamiento documentados sobre los que evaluarlos.
- Limitaciones de contexto e idioma: no disponibles; la model card no describe modalidad de entrada, idioma ni longitud de secuencia.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte de que deben revisarse por separado los terminos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Caveat para produccion: cualquier resultado obtenido con este repositorio debe documentarse de forma separada a los valores por defecto que se distribuyen, y no debe presentarse como rendimiento del checkpoint publicado.
- La implementacion es personalizada, por lo que las APIs automaticas de carga requieren un adaptador explicito y pueden no funcionar directamente.
- El repositorio ocupa 0,0 GB y no incluye un entrenamiento ni registros de experimentos completados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andrearossifo/deit-experiment

No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
