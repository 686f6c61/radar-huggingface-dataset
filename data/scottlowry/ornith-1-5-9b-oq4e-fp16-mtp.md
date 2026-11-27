# scottlowry/Ornith-1.5-9B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-9B-oQ4e-fp16-mtp es una cuantizacion mixta del modelo Ornith-1.5-9B desarrollado por ornith-ai, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint de aproximadamente 9.653 millones de parametros orientado a inferencia en Apple Silicon mediante la libreria MLX, generado con la herramienta oQ de oMLX (version v0.7.4.dev1) en su variante de precision mixta.

El modelo base pertenece a la familia arquitectonica qwen3_5, segun las etiquetas del repositorio, e incluye componentes diferenciados: un modelo de lenguaje de 8.954B parametros, un modulo de vision de 0.456B y una cabeza MTP (multi-token prediction) de 0.243B. Esta estructura sugiere un modelo multimodal con decodificacion especulativa integrada, aunque la model card no detalla el entrenamiento ni las capacidades completas.

La relevancia de esta publicacion es practica: ofrece un empaquetado de 6.906 GiB con un promedio efectivo de 6.145 bits por peso, lo que permite ejecutar un modelo de casi 10.000 millones de parametros en equipos con memoria unificada moderada. La actualizacion del 11 de noviembre de 2026 re-cuantizo el checkpoint con una version mas reciente de oMLX, por lo que las copias anteriores deberian descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5) con cabeza MTP |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 4-bit, 5-bit, 6-bit y 8-bit con grupo 64, mas FP16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 7.4 GB |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8.954B | 5.402 GB / 5.031 GiB |
| Vision | 0.456B | 1.824 GB / 1.699 GiB |
| Cabeza MTP | 0.243B | 0.189 GB / 0.176 GiB |
| Total | 9.653B | 7.415 GB / 6.906 GiB |

Distribucion de precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 6.386B | 66,153% | 3.345 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 2.608B | 27,021% | 1.670 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0.168B | 1,741% | 0.127 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0.000B | 0,003% | 0.000 GiB | 8,50 |
| FP16 | 0.035B | 0,359% | 0.065 GiB | 16,00 |
| FP32 | 0.456B | 4,724% | 1.699 GiB | 32,00 |
| Total | 9.653B | 100% | 6.906 GiB | 6,145 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta qwen3_5 y de la presencia de tres subcomponentes: un tronco de lenguaje de 8.954B parametros, un codificador de vision de 0.456B y una cabeza de prediccion multi-token (MTP) de 0.243B. La cabeza MTP es un mecanismo habitual para decodificacion especulativa, que permite proponer varios tokens por paso y validarlos en paralelo, reduciendo la latencia de generacion en hardware con ancho de banda de memoria limitado, como los chips Apple.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones adicionales del modelo original. Respecto a esta publicacion concreta, la unica informacion tecnica es el proceso de cuantizacion: oQ aplica precision mixta asignando 4 bits a la mayoria de los pesos (66,15%), 5 bits a una porcion significativa (27,02%) y manteniendo en FP32 el 4,72% de los parametros, presumiblemente capas sensibles como normalizaciones o embeddings. El resultado es un promedio de 6.145 bits por peso, mas conservador que una cuantizacion 4-bit uniforme.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de 9B con arquitectura moderna, aunque no se documentan evaluaciones especificas.
- Procesamiento de vision: la presencia de un modulo de vision de 0.456B indica capacidad multimodal de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP permite acelerar la generacion mediante prediccion multi-token.
- Inferencia en Apple Silicon: el formato MLX esta optimizado para GPUs integradas de la serie M de Apple.
- Tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking explicito: no documentado.

## Casos de uso

- Asistente local en Mac: el checkpoint de 6.906 GiB cabe en equipos Apple Silicon con 16 GB o mas de memoria unificada, lo que permite ejecutar un asistente conversacional completamente offline con MLX.
- Analisis de documentos con imagenes: el modulo de vision permite procesar capturas, diagramas o documentos escaneados junto con texto en un mismo flujo, util para extraccion de informacion en entornos sin conexion.
- Prototipado rapido de aplicaciones multimodales: al ser un unico paquete MLX con pesos en safetensors, se integra directamente en scripts de Python con mlx-lm para validar ideas antes de pasar a despliegues mayores.
- Generacion de texto acelerada por MTP: en escenarios interactivos donde la latencia importa, la cabeza de prediccion multi-token puede reducir el tiempo por token en hardware Apple.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta (4/5/6/8 bits y FP32 selectivo) en la calidad de salida frente al modelo original.
- Evaluacion comparativa de modelos 9B en local: util para benchmarking de calidad y velocidad en portatiles y mini-PC con Apple Silicon frente a alternativas en GGUF.
- Desarrollo de pipelines de vision-lenguaje en el borde: para aplicaciones de escritorio que requieran privacidad de datos y no puedan enviar imagenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 7 GB para los pesos (6.906 GiB) mas overhead de contexto y activaciones; en la practica, se recomienda un minimo de 12-16 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) por el formato MLX. No es compatible directamente con CUDA sin conversion.
- GPU de consumidor: cabe en Mac con 16 GB o mas de memoria unificada; en GPUs NVIDIA seria necesario reconvertir los pesos a otro formato, ya que este checkpoint es especifico de MLX.
- Opciones de despliegue: MLX (mlx-lm) es la via nativa; Ollama y llama.cpp no soportan directamente pesos MLX, por lo que requeririan una conversion a GGUF desde el modelo base.
- Latencia y throughput: no disponibles; dependen del chip concreto y de la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ4e-fp16-mtp | 9.653B | no disponible | no disponible | MLX safetensors | Cuantizacion mixta 6.145 bits/peso, vision y MTP |
| ornith-ai/Ornith-1.5-9B | 9.653B (estimado) | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Alternativas 9B en MLX | no disponible | no disponible | no disponible | MLX | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad con modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion mixta introduce perdida de precision respecto al modelo base; aunque el promedio de 6.145 bits es conservador, no se han publicado evaluaciones de degradacion.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial; debe consultarse el repositorio del modelo base antes de cualquier despliegue en produccion.
- Los idiomas soportados no estan documentados, lo que impide garantizar calidad en castellano u otras lenguas.
- No hay informacion sobre sesgos, alucinacion o comportamiento en dominios sensibles.
- El checkpoint esta atado al ecosistema MLX y a Apple Silicon; no es portable directamente a CUDA, ROCm ni a llama.cpp sin conversion.
- La cabeza MTP y el modulo de vision requieren soporte especifico en el runtime; no todos los frameworks MLX la implementan de forma completa.
- El repositorio tiene muy pocas descargas y likes, y procede de un publicador individual, no del equipo original; conviene verificar la integridad de los pesos.
- La model card indica que las copias anteriores al 11 de noviembre de 2026 deben re-descargarse, lo que sugiere cambios sustanciales en la cuantizacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
