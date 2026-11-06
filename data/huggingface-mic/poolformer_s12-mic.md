# huggingface-mic/poolformer_s12-mic

## Resumen

`poolformer_s12-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado para resolver una tarea real, sino de una fixture (muestra reducida y controlada) construida a partir del modelo `sail/poolformer_s12`, un clasificador de imagenes basado en la arquitectura PoolFormer. Su proposito es servir como material de validacion para el framework de integracion MIC (Model Integration Contract), que comprueba que las expectativas de uso de un modelo (procesadores, configuracion, dtypes y comportamiento numerico) se cumplen de forma reproducible.

El modelo base, PoolFormer, es una arquitectura de vision que sustituye el mecanismo de atencion de los transformers por una operacion de pooling espacial, lo que reduce el coste computacional manteniendo un rendimiento competitivo en tareas de clasificacion de imagenes. La variante `s12` es la mas pequena de la familia, con unos 11,9 millones de parametros, lo que la hace adecuada para entornos con recursos limitados.

Este repositorio concreto esta etiquetado como `test-artifact` y no debe emplearse en produccion ni como modelo candidato en busquedas de modelos. Aunque contiene los pesos reales del checkpoint base (no reducidos, porque ya esta por debajo del umbral de 20 millones de parametros), su finalidad es exclusivamente la validacion de contratos de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PoolFormer (vision, sin atencion; pooling espacial) |
| Parametros totales | 11.915.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo se basa en PoolFormer, una arquitectura de vision que reemplaza los bloques de self-attention por capas de pooling espacial (MetaFormer). La variante `s12` corresponde a la configuracion mas ligera de la familia, con 11,9 millones de parametros. El checkpoint del que deriva, `sail/poolformer_s12`, esta entrenado para clasificacion de imagenes (ImageNet u otra taxonomia de clases, segun el checkpoint original), aunque la informacion disponible no detalla el dataset exacto ni el numero de tokens o imagenes de entrenamiento.

En este repositorio, los pesos son los del checkpoint original, sin modificar: al tener 11,9 millones de parametros, quedan por debajo del umbral de 20 millones por debajo del cual la fixture conserva el modelo completo. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte desde `sail/poolformer_s12`. El modelo se guarda en float32, el dtype con el que carga por defecto el checkpoint original, y se ha verificado que es finito en float32, bfloat16 y float16 (forward, perdida y gradientes). Los nombres de tensores coinciden con los del checkpoint real. No se dispone de informacion sobre RLHF, DPO ni tecnicas de alineacion, ya que no aplican a este tipo de modelo de vision.

## Capacidades

- Clasificacion de imagenes: el modelo base `sail/poolformer_s12` esta disenado para tareas de clasificacion visual.
- Extraccion de caracteristicas visuales: la arquitectura PoolFormer puede emplearse como backbone para tareas de vision.
- Ejecucion en float32, bfloat16 y float16: se ha verificado estabilidad numerica en los tres dtypes.
- Compatibilidad con el ecosistema Transformers: incluye manifiesto de contrato, uso ejecutable y expectativas de framework.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision, no un modelo de lenguaje.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Validacion de integraciones en Transformers: el repositorio incluye un manifiesto de contrato (`integration.json`) y expectativas de framework que permiten comprobar que la carga del modelo, el preprocesado y la inferencia se comportan como se espera en distintas versiones de la libreria.
- Pruebas de regresion en CI/CD: al ser una fixture ligera (11,9 M de parametros), puede integrarse en pipelines de integracion continua para verificar que los cambios en el codigo de Transformers no rompen la carga ni la inferencia de modelos PoolFormer.
- Verificacion de estabilidad numerica: permite comprobar que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16, util para validar cambios en kernels o en el manejo de dtypes.
- Docencia y experimentacion con arquitecturas de vision: sirve como ejemplo minimo y reproducible de un clasificador PoolFormer para estudiar su estructura y comportamiento sin necesidad de descargar checkpoints grandes.
- Pruebas de preprocesado de imagenes: al incluir el `preprocessor_config.json` original, permite validar pipelines de preprocesado (redimensionado, normalizacion) de forma aislada.
- Benchmarking de infraestructura de inferencia: por su tamano reducido, es util para medir latencia y throughput de frameworks de despliegue en entornos de prueba, sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (11,9 M de parametros, aproximadamente 48 MB de pesos, mas activaciones y overhead del framework).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Tambien puede ejecutarse en CPU sin problemas de rendimiento significativos para inferencia puntual.
- Opciones de despliegue: Transformers (con PyTorch), y potencialmente ONNX Runtime u otras herramientas compatibles con modelos de vision; no se dispone de informacion sobre soporte en vLLM, llama.cpp u Ollama (no aplicables a modelos de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `poolformer_s12-mic` (este) | 11,9 M | Clasificacion de imagenes (fixture) | no aplica | no disponible | Hugging Face (test-artifact) |
| `sail/poolformer_s12` | ~11,9 M | Clasificacion de imagenes | no aplica | no disponible | Hugging Face |
| `google/vit-base-patch16-224` | ~86 M | Clasificacion de imagenes | no aplica | Apache 2.0 (segun checkpoint original) | Hugging Face |
| `microsoft/resnet-50` | ~25 M | Clasificacion de imagenes | no aplica | Apache 2.0 (segun checkpoint original) | Hugging Face |

La comparativa se limita a modelos de vision de proposito general; los datos de licencia y rendimiento de los alternativos no se han verificado en la informacion proporcionada y deben confirmarse en sus respectivas model cards.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`): no debe usarse en produccion ni como modelo candidato en busquedas de modelos.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, codigo ni conversacion.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial.
- No se dispone de informacion sobre sesgos del checkpoint base ni sobre su dataset de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido textual, pero la clasificacion de imagenes puede producir predicciones erroneas segun la calidad y dominio de la imagen.
- Limitaciones de contexto o idioma no aplicables (modelo de vision).
- Al ser una fixture, su comportamiento esta disenado para validacion de contratos, no para obtener precision real en tareas de vision.
- No se garantiza soporte a largo plazo ni mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/poolformer_s12-mic
- Modelo base: https://huggingface.co/sail/poolformer_s12
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/poolformer_s12-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/poolformer_s12-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
