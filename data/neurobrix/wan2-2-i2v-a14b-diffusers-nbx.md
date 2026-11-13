# Neurobrix/Wan2.2-I2V-A14B-Diffusers-nbx

## Resumen

Wan2.2-I2V-A14B-Diffusers es un modelo de generacion de video a partir de imagen (image-to-video) desarrollado por Wan-AI. Este repositorio concreto, publicado por Neurobrix, no contiene el modelo original sino un contenedor `.nbx` que empaqueta los pesos, el grafo de computacion y la configuracion de runtime del modelo Wan-AI para ejecutarlo con el motor de inferencia NeuroBrix. El modelo base es un difusor de gran tamano (la nomenclatura A14B sugiere aproximadamente 14.000 millones de parametros) orientado a la sintesis de clips de video a partir de una imagen inicial y un prompt textual.

La relevancia de este empaquetado radica en la portabilidad: NeuroBrix planifica la distribucion de los componentes del modelo entre una o varias GPU, memoria del host o CPU, y ofrece dos motores de ejecucion (PyTorch y Triton sin dependencia de PyTorch mediante kernels nbxtensor). Esto permite ejecutar un difusor de video de gran tamano en hardware local, incluyendo GPU de consumo, en lugar de depender exclusivamente de infraestructura en la nube.

El contenedor ocupa 126,7 GB y mantiene la licencia Apache 2.0 del modelo original. No se dispone de datos publicados sobre arquitectura interna detallada, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; la model card remite a la ficha original de Wan-AI para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusor para generacion de video (detalle interno no disponible; modelo base Wan-AI/Wan2.2-I2V-A14B-Diffusers) |
| Parametros totales | aproximadamente 14.000 millones (inferido de la nomenclatura A14B; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computacion, pesos y configuracion de runtime); pesos originales del modelo base en el repositorio de Wan-AI |
| Tamano del contenedor | 126,7 GB |
| SHA-256 | `1b97aac7d57bb597faabaa769b7f952291d34cc6117c9200909b0009d76f5be0` |
| Pipeline | image-to-video |
| Libreria | neurobrix |
| Motores de ejecucion | PyTorch y Triton (kernels nbxtensor, sin PyTorch) |
| Hardware soportado | GPU NVIDIA, GPU de Mac (Metal) y CPU |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card de este repositorio describe unicamente el empaquetado: el contenedor `.nbx` incluye el grafo de computacion del modelo, sus pesos, la interconexion entre componentes y los valores por defecto de runtime. El modelo base es un difusor de generacion de video condicionado por imagen y texto, segun la etiqueta de pipeline `image-to-video`.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni innovaciones tecnicas especificas del modelo original. La model card indica explicitamente que el entrenamiento, el uso previsto y las limitaciones son los del modelo original de Wan-AI y remite a su ficha para consultarlos. La innovacion aportada por este repositorio es de infraestructura: el motor NeuroBrix planifica la colocacion de cada parte del modelo entre las GPU y la memoria disponibles (una GPU, varias, en streaming o en el host) y ofrece kernels Triton certificados por clase de GPU.

## Capacidades

- Generacion de video a partir de una imagen inicial y un prompt textual (image-to-video).
- Control de la generacion mediante instrucciones en lenguaje natural, por ejemplo movimientos de camara ("the camera slowly pulls back").
- Ejecucion local en GPU NVIDIA, GPU de Apple (Metal) y CPU mediante el motor NeuroBrix.
- Distribucion automatica del modelo entre multiples GPU, memoria del host o streaming, segun el hardware disponible.
- Dos rutas de ejecucion: motor PyTorch y motor Triton sin PyTorch (kernels nbxtensor).
- Importacion del modelo mediante CLI (`neurobrix import`) y ejecucion con parametros de imagen de entrada, prompt y fichero de salida.
- No se dispone de informacion sobre soporte de tool calling, agentes, capacidades multilingues o modos especiales (thinking, audio) en la documentacion proporcionada.

## Casos de uso

- Prototipado de video generativo en local: un desarrollador puede importar el contenedor y generar clips a partir de una imagen fija con un solo comando, sin montar infraestructura en la nube, gracias al planificador de hardware de NeuroBrix.
- Animacion de storyboards: a partir de fotogramas clave de una produccion, generar movimiento de camara o transiciones descritas en el prompt para previsualizar secuencias antes del render final.
- Generacion de contenido para redes sociales: convertir una imagen de producto o una fotografia en un clip corto con movimiento, usando el prompt para controlar la direccion de camara.
- Pruebas de concepto en investigacion: ejecutar un difusor de video de gran tamano en un laboratorio con GPU de consumo o Apple Silicon, aprovechando la ejecucion en streaming y la distribucion entre varios dispositivos.
- Evaluacion comparativa de motores de inferencia: comparar el rendimiento del motor PyTorch frente al motor Triton (nbxtensor) sobre el mismo modelo y hardware, dado que el contenedor soporta ambos.
- Integracion en pipelines automatizados: el comando `neurobrix run` con argumentos de entrada y salida permite encadenar la generacion de clips dentro de scripts o flujos de trabajo por lotes.
- Despliegue en entornos con hardware heterogeneo: al soportar NVIDIA, Metal y CPU, el mismo contenedor puede ejecutarse en estaciones de trabajo con GPU dedicada y en portatiles Mac sin reempaquetar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de video (FVD, CLIP score u otras), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El contenedor ocupa 126,7 GB, lo que da una referencia del espacio en disco necesario; la VRAM requerida depende de la precision y de la estrategia de distribucion que aplique NeuroBrix.
- GPU recomendadas: no se especifican modelos concretos. El motor soporta GPU NVIDIA, GPU de Mac (Metal) y CPU.
- Ejecucion en GPU de consumo: segun la model card, NeuroBrix planifica la ejecucion en streaming o distribuida entre varias GPU y memoria del host, lo que permite plantear la ejecucion en hardware de consumo, aunque no se publican requisitos minimos ni configuraciones validadas.
- Opciones de despliegue: motor NeuroBrix (PyTorch o Triton con kernels nbxtensor). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Como referencia estructural, el modelo base Wan-AI/Wan2.2-I2V-A14B-Diffusers es la alternativa directa: este repositorio es el mismo modelo empaquetado para NeuroBrix, con identica licencia Apache 2.0. Cualquier comparacion con otros difusores de image-to-video requeriria datos de benchmarks no incluidos en la documentacion disponible.

## Limitaciones y advertencias

- La model card remite a la ficha del modelo original de Wan-AI para las limitaciones de sesgo, alucinacion y uso previsto; no se detallan en este repositorio.
- Riesgo de generacion de contenido no fiel a la imagen de entrada o al prompt: inherente a los modelos generativos de video, sin metricas publicadas que lo cuantifiquen.
- Idiomas soportados no declarados; el comportamiento multilingue del prompt no esta documentado.
- Licencia Apache 2.0, que permite uso comercial, pero las condiciones y restricciones del modelo original deben verificarse en su ficha.
- El repositorio no contiene pesos en formatos convencionales (safetensors, GGUF) sino un contenedor `.nbx` especifico del motor NeuroBrix; la portabilidad a otros frameworks no esta garantizada.
- El contenedor tiene 126,7 GB, lo que exige espacio en disco considerable y una planificacion cuidadosa de la memoria durante la ejecucion.
- El autor del empaquetado es Neurobrix, no Wan-AI; la responsabilidad sobre el comportamiento del modelo recae en el modelo original.
- No se publican requisitos minimos de hardware ni configuraciones validadas, lo que dificulta estimar el coste de despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Neurobrix/Wan2.2-I2V-A14B-Diffusers-nbx
- Modelo original: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Descarga del contenedor: https://neurobrix.org/models/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
