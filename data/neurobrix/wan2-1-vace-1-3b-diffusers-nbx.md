# Neurobrix/Wan2.1-VACE-1.3B-diffusers-nbx

## Resumen

Wan2.1-VACE-1.3B-diffusers es un modelo de generación de vídeo a partir de imagen (image-to-video) desarrollado originalmente por Wan-AI. La variante aquí descrita, Neurobrix/Wan2.1-VACE-1.3B-diffusers-nbx, no es un modelo nuevo ni un reentrenamiento: es el mismo modelo empaquetado como contenedor `.nbx` por Neurobrix para ejecutarse con su motor de inferencia local. El contenedor incluye el grafo de computación, los pesos, la topología de componentes y los valores por defecto de ejecución necesarios para correr el modelo sin depender de la pila estándar de PyTorch.

El modelo pertenece a la familia Wan2.1 VACE (Video All-in-one Creation and Editing) y cuenta con 1.300 millones de parámetros, según el identificador `1.3B`. Su tarea principal es animar una imagen de entrada (primer fotograma) siguiendo una instrucción textual, produciendo un clip de vídeo. La relevancia de esta variante reside en el empaquetado: permite desplegar el modelo en GPUs NVIDIA, GPUs de Mac (Metal) y CPU, con planificación automática del reparto entre una o varias GPUs, streaming o ejecución en host, y con la opción de usar un motor Triton sin PyTorch.

La ficha se centra en lo que la información disponible permite afirmar. Los datos sobre arquitectura interna, composición del dataset de entrenamiento y resultados de benchmarks del modelo original no se incluyen en la información proporcionada, por lo que se indican como no disponibles en lugar de inferirse. La licencia es Apache 2.0, heredada del modelo original, lo que facilita el uso comercial con las obligaciones habituales de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de vídeo, familia Wan2.1 VACE; detalles internos no especificados) |
| Parametros totales | 1.300 millones (1.3B, según el identificador del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor se distribuye con los pesos del modelo original; no se especifican formatos cuantizados) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computación + pesos + topología + defaults de ejecución); el modelo original en Hugging Face usa formato diffusers |
| Tamano del contenedor | 19,5 GB |
| SHA-256 | `23fe27df97b40c142d5af4b6eb1a0433ebc76e868a341c6645983463b3de99c4` |
| Pipeline | image-to-video |
| Libreria | neurobrix |
| Modelo base | Wan-AI/Wan2.1-VACE-1.3B-diffusers |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original (tipo de transformer de difusión, mecanismo de atención, codificadores de texto e imagen, etc.). Lo único que puede afirmarse con rigor es que se trata de un modelo de generación de vídeo condicionado por imagen y texto, con 1.300 millones de parámetros, y que el contenedor `.nbx` encapsula su grafo de computación, sus pesos y las conexiones entre componentes.

Tampoco se dispone de datos sobre el número de tokens o fotogramas de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del contenedor remite explícitamente a la model card original de Wan-AI para los detalles de entrenamiento, uso previsto y limitaciones, que se aplican sin cambios. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

La innovación diferencial de esta variante es de empaquetado y ejecución: NeuroBrix planifica dónde se ejecuta cada parte del modelo según las GPUs y memoria disponibles (una GPU, varias, streaming o host), y ofrece dos motores, uno basado en PyTorch y otro basado en Triton con kernels `nbxtensor` certificados por clase de GPU, que no requiere PyTorch.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada y un prompt textual (image-to-video).
- Control de la generación mediante instrucciones en lenguaje natural, como movimientos de cámara o cambios de escena (el ejemplo de la model card es "the camera slowly pulls back").
- Ejecución local en hardware propio: GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- Planificación automática del reparto del modelo entre una o varias GPUs, con streaming o ejecución en host.
- Dos motores de ejecución intercambiables: PyTorch y Triton (este último sin dependencia de PyTorch).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües específicas ni modos especiales como thinking, visión o audio más allá de la propia tarea de vídeo.

## Casos de uso

- Animación de fotogramas fijos para previsualización: a partir de una imagen (por ejemplo, un render o una fotografía) y un prompt que describa el movimiento, se genera un clip para validar una idea antes de producir el vídeo final. El tamaño de 1.3B y la posibilidad de ejecución en una sola GPU lo hacen adecuado para iteración rápida en local.
- Generación de clips para redes sociales y contenido editorial: creación de vídeos cortos a partir de imágenes de producto o ilustraciones, con control del movimiento de cámara mediante el prompt, sin depender de servicios en la nube.
- Prototipado en estudios de animación y motion graphics: uso del modelo como paso intermedio para generar animáticas a partir de keyframes, que luego se refinan en herramientas de postproducción.
- Pruebas de concepto en investigación sobre generación de vídeo: al ejecutarse en local con motores PyTorch o Triton, permite experimentar con prompts y condiciones sin coste por llamada ni límites de API, y comparar el comportamiento entre motores.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en hardware propio (incluida CPU), es apto para flujos donde las imágenes no pueden salir de la infraestructura de la organización.
- Integración en pipelines automatizados de contenido: el contenedor se importa y ejecuta mediante comandos de línea de comandos (`neurobrix import` y `neurobrix run`), lo que facilita encadenarlo en scripts de generación por lotes.
- Evaluación de la plataforma NeuroBrix: sirve como caso de prueba para validar la planificación multi-GPU, el streaming y el motor Triton en un modelo de vídeo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el contenedor ocupa 19,5 GB en disco; la VRAM necesaria dependerá de la resolución, el número de fotogramas y el motor empleado, datos que no se especifican.
- GPUs recomendadas: no se indican modelos concretos. El motor funciona en GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible. El tamaño del contenedor (19,5 GB) sugiere que una GPU de consumo con 24 GB de VRAM podría ser candidata, pero no hay confirmación oficial y no debe asumirse.
- Opciones de despliegue: NeuroBrix (`pip install neurobrix`, `neurobrix import`, `neurobrix run`), con motor PyTorch o motor Triton. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.
- Estrategias de ejecución soportadas: una GPU, varias GPUs, streaming y ejecución en host, con reparto automático según los recursos detectados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neurobrix/Wan2.1-VACE-1.3B-diffusers-nbx | 1.3B | image-to-video | no disponible | Apache 2.0 | Hugging Face (contenedor `.nbx`) |
| Wan-AI/Wan2.1-VACE-1.3B-diffusers | 1.3B | image-to-video | no disponible | Apache 2.0 | Hugging Face (formato diffusers) |
| Otros modelos de image-to-video de ~1.3B | no disponible | image-to-video | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo original de Wan-AI, del que esta variante es un empaquetado: mismos pesos, misma licencia y mismas capacidades, con la diferencia del formato (contenedor `.nbx` frente a diffusers) y del motor de ejecución (NeuroBrix frente a la pila estándar). No se dispone de información sobre otros modelos comparables de la misma categoría y tamaño para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La model card del contenedor remite a la model card original de Wan-AI para las limitaciones, que se aplican sin cambios; dichas limitaciones no se detallan en la información proporcionada.
- No hay datos publicados sobre sesgos del modelo en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos generativos de vídeo, la fidelidad al prompt y a la imagen de entrada no está garantizada.
- Idiomas soportados: no disponibles; no puede confirmarse el comportamiento del prompt textual en castellano.
- Licencia Apache 2.0: permite uso comercial con las obligaciones de la licencia (conservar avisos de copyright y licencia, indicar cambios). No se identifican restricciones adicionales en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026); se trata de un artefacto reciente y sin validación comunitaria.
- La variante `.nbx` depende del motor NeuroBrix para ejecutarse; no es directamente consumible por las herramientas estándar del ecosistema diffusers sin usar el modelo original.
- No se especifican requisitos de VRAM, latencia ni calidad de salida, por lo que la planificación de producción debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neurobrix/Wan2.1-VACE-1.3B-diffusers-nbx
- Modelo original: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B-diffusers
- Descarga del contenedor: https://neurobrix.org/models/Wan-AI/Wan2.1-VACE-1.3B-diffusers
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Repositorio de kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentación: https://docs.neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
