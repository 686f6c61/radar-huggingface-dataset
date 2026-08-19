# magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF

## Resumen

Este repositorio contiene una conversión en formato GGUF con cuantización NVFP4 (flotante de 4 bits) del modelo `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash`, realizada por el usuario `magnitudedev` para su uso con el framework de inferencia [Magnitude](https://github.com/magnitudedev/magnitude). El modelo original es un desarrollo de NVIDIA, aunque la información disponible no detalla su arquitectura interna ni su proceso de entrenamiento. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos, pero el dato real de parámetros totales extraído de los safetensors es de 833.362.195, una discrepancia que no se explica en la documentación del repositorio.

La relevancia de esta conversión radica en su formato GGUF, que permite ejecutar el modelo con herramientas como `llama.cpp` y Ollama, y en la cuantización NVFP4, que reduce significativamente el espacio en disco y los requisitos de memoria en comparación con los pesos en precisión completa. El tamaño del repositorio es de 1,2 GB, lo que lo hace atractivo para despliegues en entornos con recursos limitados. No se proporcionan detalles sobre la longitud de contexto, idiomas soportados ni capacidades específicas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun el nombre del modelo, no confirmado |
| Parametros totales | 833.362.195 (dato real de safetensors); el nombre indica 30B |
| Parametros activos | 3B (segun el nombre, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (flotante de 4 bits) |
| Idiomas soportados | no disponibles |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (cuantizacion NVFP4) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original. El nombre "30B-A3B" sugiere una arquitectura de mezcla de expertos con 30 mil millones de parametros totales y 3 mil millones activos por token, tipica de los modelos MoE modernos. Sin embargo, el dato real de parametros totales en los safetensors es de 833 millones, lo que contradice esa interpretacion. Es posible que el repositorio contenga solo una parte de los pesos o que la conversion haya modificado la estructura, pero no hay documentacion al respecto.

Tampoco se proporcionan datos sobre el conjunto de entrenamiento, el numero de tokens procesados, ni el uso de tecnicas como RLHF o DPO. La unica informacion tecnica disponible es que la conversion se realizo con `llama.cpp` en la revision `9b05354ec6fb58b4e665e9a39ebc40285c015638`, y que el artefacto resultante tiene un hash SHA-256 de `f4f37ff3f20932887988f7a81fdd23aee39d87cbe457b748a46603acd18a35d6`.

## Capacidades

No se han publicado capacidades especificas del modelo en la informacion proporcionada. Al tratarse de un modelo de lenguaje, se presume que puede realizar tareas de generacion de texto, razonamiento, codigo y comprension del lenguaje, pero no hay confirmacion oficial. Los tags del repositorio mencionan `speculative-decoding` y `dflash`, lo que sugiere que el modelo esta optimizado para decodificacion especulativa, una tecnica que acelera la inferencia mediante la generacion de multiples tokens candidatos en paralelo. No obstante, no se detallan las capacidades concretas.

## Casos de uso

No se dispone de informacion sobre casos de uso especificos recomendados por el autor. Dado que es un modelo de lenguaje en formato GGUF con cuantizacion NVFP4, podria emplearse en escenarios genericos como:

- Generacion de texto y asistencia conversacional en aplicaciones de chat.
- Tareas de completado de codigo si el modelo base fue entrenado para ello (no confirmado).
- Prototipado rapido de aplicaciones de IA en entornos con recursos limitados.
- Experimentacion con decodificacion especulativa usando Magnitude.
- Despliegue en servidores locales mediante `llama.cpp` o Ollama.
- Investigacion academica sobre modelos cuantizados y su rendimiento.

Estos casos son inferencias razonables, pero no estan respaldados por documentacion oficial del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o su version base. Tampoco se comparan con modelos similares.

## Requisitos de hardware

No se proporcionan requisitos de hardware especificos. El tamaño del repositorio es de 1,2 GB, lo que sugiere que los pesos cuantizados NVFP4 ocupan aproximadamente esa cantidad. Para inferencia con `llama.cpp`, se necesitaria una GPU compatible con la cuantizacion NVFP4, que es una precision nativa de las GPUs NVIDIA recientes (por ejemplo, arquitectura Blackwell). No se indica la VRAM minima necesaria, aunque un modelo de 1,2 GB en disco probablemente requiera entre 2 y 4 GB de VRAM para cargar los pesos, dependiendo del contexto y del overhead del runtime. Se recomienda consultar la documentacion de Magnitude y `llama.cpp` para obtener directrices de despliegue.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El nombre del modelo base sugiere que pertenece a la familia Nemotron de NVIDIA, pero no hay datos de otros modelos de esa serie en la informacion proporcionada. Por tanto, no es posible realizar una comparativa.

## Limitaciones y advertencias

- La licencia `openmdw-1.1` no es una licencia de codigo abierto estandar; es necesario revisar sus terminos en [https://openmdw.ai/license/1-1/](https://openmdw.ai/license/1-1/) antes de cualquier uso comercial.
- La cuantizacion NVFP4 puede introducir perdida de precision en comparacion con los pesos originales, lo que podria afectar a la calidad de las respuestas en tareas complejas.
- La discrepancia entre el numero de parametros indicado en el nombre (30B) y el dato real de safetensors (833M) es preocupante y podria indicar un error en la conversion o una documentacion incorrecta.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto reciente o poco probado.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF](https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF)
- Modelo base (NVIDIA): [https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash)
- Framework Magnitude: [https://github.com/magnitudedev/magnitude](https://github.com/magnitudedev/magnitude)
- Licencia openmdw-1.1: [https://openmdw.ai/license/1-1/](https://openmdw.ai/license/1-1/)
