# matheusamafield/tiny-transformer-experiment

## Resumen

Este repositorio contiene un experimento de **Tiny Transformer** para generacion de texto, desarrollado por el usuario matheusamafield. Se trata de un codigo base de tipo educativo que permite inspeccionar y modificar la arquitectura antes de realizar un entrenamiento completo. Aunque el autor etiqueta la escala como "huge", el checkpoint incluido en `model.safetensors` contiene unicamente **24.832 parametros**, por lo que estamos ante un modelo minusculo pensado para pruebas de humo, no para uso real.

El problema que resuelve es la necesidad de un entorno ligero y transparente donde estudiar el efecto de cambios en la arquitectura (atencion, fusion, activacion, normalizacion) sin la complejidad de un entrenamiento a gran escala. El modelo no esta entrenado: el checkpoint es de inicializacion y no se presentan resultados de benchmarks. Su relevancia actual es puramente investigativa y didactica, para quienes quieran entender o prototipar componentes de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atencion estandar, fusion por tensor, activacion swish, normalizacion scalenorm) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer generativo en miniatura, definido en un unico archivo Python (`inference.py`). Segun la model card, emplea atencion estandar, fusion por tensor, activacion swish y normalizacion scalenorm. No se especifican numero de capas, dimensiones del modelo ni tamano del contexto; estos datos se guardan en `config.json`, que forma parte del repositorio. La implementacion es personalizada, por lo que las APIs genericas de carga automatica requieren un adaptador explicito.

En cuanto al entrenamiento, el checkpoint `model.safetensors` es solo una inicializacion para pruebas de humo, no un checkpoint entrenado. No hay datos de tokens, composicion de dataset, ni procesos de RLHF o DPO. La configuracion por defecto (`training_args.json`) define un optimizador `lamb` con un schedule de calentamiento constante, pero el propio autor advierte que estos son valores iniciales del script y no evidencia de un entrenamiento completado.

## Capacidades

- No existen capacidades demostradas de generacion de texto, razonamiento, codigo o matematicas, porque el modelo no ha sido entrenado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues.
- No dispone de modo de pensamiento, vision ni audio.
- Su unica "capacidad" real es la de servir como implementacion de referencia para estudiar arquitecturas transformer.

## Casos de uso

- Docencia de arquitecturas transformer: permite a estudiantes inspeccionar una implementacion completa de un modelo generativo en un solo archivo, modificando componentes como la normalizacion o la activacion y viendo su efecto en una ejecucion local.
- Pruebas de humo en pipelines de investigacion: el checkpoint de inicializacion sirve para verificar que un entorno de entrenamiento carga correctamente el modelo y ejecuta un paso de propagacion sin errores.
- Experimentacion con optimizadores y schedules: el archivo `training_args.json` incluye una receta con `lamb` y calentamiento constante, util para comparar comportamientos de optimizacion en modelos pequenos.
- Prototipado de variantes de atencion: al estar el codigo expuesto, es posible cambiar la atencion estandar por otra variante (lineal, sliding window, etc.) y ejecutar pruebas antes de una inversion mayor.
- Benchmarking de configuraciones de entrenamiento: el autor sugiere evaluar el modelo en un conjunto de validacion especifico, reportando metricas en al menos tres semillas y comparando con una linea base de capacidad equivalente.
- Base para desarrollar un modelo propio: los ficheros de configuracion y entrenamiento permiten escalar el modelo y lanzar un entrenamiento real, documentando los resultados por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reivindica ninguna puntuacion de benchmark en este repositorio.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB. Con 24.832 parametros, el modelo cabe en cualquier GPU consumer y tambien puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no se requiere una GPU especifica. Cualquier tarjeta moderna (RTX 3050, RTX 4090, A100, H100) es mas que suficiente, aunque una CPU bastaria para pruebas de humo.
- Compatibilidad con GPUs consumer: total, el checkpoint es minisculo y no requiere memoria adicional relevante.
- Opciones de despliegue: al ser una implementacion personalizada, no se puede cargar con vLLM, llama.cpp, Ollama ni TGI de forma directa. Se requiere ejecutar el script `inference.py` o escribir un adaptador para las APIs genericas. El comando `python inference.py --help` muestra la interfaz de ejemplo.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamano, la latencia sera del orden de milisegundos en CPU y microsegundos en GPU, pero no existen datos oficiales.

## Comparativa con modelos similares

No disponible. No existen modelos comparables con checkpoint entrenado y resultados publicados que puedan situarse en la misma categoria, ya que este repositorio es un experimento de arquitectura sin entrenamiento. Otros proyectos de Tiny Transformer de caracter educativo (por ejemplo, `skolouri/TinyTransformer` o `avvorstenbosch/tinyTransformer`) comparten el enfoque didactico, pero no ofrecen modelos entrenados ni benchmarks, por lo que no permiten una comparacion tecnica real.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- La implementacion debe tratarse como un punto de partida experimental, no como un modelo listo para produccion.
- No se conocen sesgos especificos, pero al no existir entrenamiento, tampoco hay garantias de comportamiento generativo.
- El riesgo de alucinacion no es evaluable porque el modelo no produce texto util.
- La licencia BSD-3-Clause permite uso comercial con condiciones, pero el autor advierte que deben revisarse los terminos de las fuentes de datos si se utiliza con datasets externos.
- Las APIs genericas de HuggingFace no pueden cargar este modelo sin un adaptador explicito, lo que dificulta su integracion en flujos estandar.
- Los resultados de un futuro entrenamiento deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/matheusamafield/tiny-transformer-experiment
- Repositorio educativo TinyTransformer (skolouri): https://github.com/skolouri/TinyTransformer
- Repositorio tinyTransformer con GPT-like (avvorstenbosch): https://github.com/avvorstenbosch/tinyTransformer
