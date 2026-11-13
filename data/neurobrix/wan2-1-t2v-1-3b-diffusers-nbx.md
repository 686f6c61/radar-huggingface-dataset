# Neurobrix/Wan2.1-T2V-1.3B-Diffusers-nbx

## Resumen

Wan2.1-T2V-1.3B-Diffusers-nbx es un contenedor `.nbx` del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B-Diffusers, desarrollado originalmente por Wan-AI y empaquetado por Neurobrix para su ejecucion en el motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un fine-tune: los pesos, la licencia y el comportamiento son identicos a los del modelo original; lo que cambia es el formato de distribucion y el runtime. El contenedor incluye el grafo de computacion, los pesos, las conexiones entre componentes y los valores por defecto de ejecucion necesarios para que el motor lo ejecute sin configuracion adicional.

El modelo subyacente es un modelo de difusion para generacion de video a partir de prompts textuales, con 1.300 millones de parametros (segun la nomenclatura del identificador) y licencia Apache 2.0. La relevancia de este empaquetado radica en que abstrae la complejidad de despliegue: NeuroBrix planifica automaticamente en que hardware ejecutar cada parte del modelo (una GPU, varias, streaming o CPU) y ofrece dos motores, uno basado en PyTorch y otro basado en Triton que no requiere PyTorch, con kernels `nbxtensor` certificados por clase de GPU.

La informacion disponible sobre esta ficha es limitada: la model card del contenedor remite explicitamente al modelo original para detalles de entrenamiento, uso previsto y limitaciones. Por tanto, los datos tecnicos de arquitectura, dataset y benchmarks que no aparecen en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion texto-a-video (detalles de la arquitectura no disponibles en la informacion proporcionada; ver modelo base Wan-AI/Wan2.1-T2V-1.3B-Diffusers) |
| Parametros totales | 1.300 millones (segun el identificador del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (28,9 GB); el modelo base se distribuye en formato Diffusers |
| Pipeline | text-to-video |
| Libreria / runtime | neurobrix |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B-Diffusers |
| SHA-256 del contenedor | `194e46510ab5e749e13f70829571a5cbf5c45b70b7864c3da742ecb3a63832f3` |
| Hardware soportado | GPUs NVIDIA, GPUs de Mac (Metal) y CPU |
| Motores de ejecucion | motor PyTorch y motor Triton (sin PyTorch, kernels `nbxtensor`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo subyacente. Se sabe que es un modelo de difusion para generacion de video texto-a-video del proyecto Wan2.1 de Wan-AI, con 1.300 millones de parametros segun el identificador, y que el contenedor `.nbx` incluye su grafo de computacion, pesos y conexiones entre componentes. Cualquier detalle sobre tipo de transformer, mecanismo de atencion, VAE, encoder de texto o schedule de difusion debe consultarse en la model card del modelo original, que la model card del contenedor declara aplicable sin cambios.

Tampoco se dispone de informacion sobre el dataset de entrenamiento (numero de tokens, composicion, resolucion de video, duracion de clips) ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del contenedor es explicita: el credito del modelo corresponde a Wan-AI y su model card original cubre entrenamiento, uso previsto y limitaciones. La innovacion tecnica de este artefacto no esta en el modelo sino en el empaquetado: planificacion automatica de colocacion de componentes en el hardware disponible, soporte de ejecucion multi-GPU y streaming, y un motor Triton con kernels certificados por clase de GPU que elimina la dependencia de PyTorch.

## Capacidades

- Generacion de video a partir de prompts de texto (pipeline `text-to-video`).
- Ejecucion local en hardware propio: GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- Planificacion automatica de recursos: el motor decide que partes del modelo corren en una GPU, varias GPUs, en streaming o en el host.
- Dos backends de ejecucion: motor PyTorch y motor Triton sin PyTorch con kernels `nbxtensor`.
- Importacion y ejecucion mediante CLI (`neurobrix import` y `neurobrix run`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de clips de video para prototipado creativo: un desarrollador puede lanzar `neurobrix run` con un prompt descriptivo y obtener un MP4 sin montar un pipeline de difusion manualmente; el contenedor incluye grafo, pesos y valores por defecto.
- Pruebas de concepto en estaciones de trabajo sin GPU dedicada: al soportar CPU y GPUs de Mac con Metal, permite validar prompts y flujos de generacion en portatiles antes de escalar a servidores.
- Despliegue en infraestructura heterogenea: la planificacion automatica de NeuroBrix permite ejecutar el mismo contenedor en una GPU, varias o en streaming, lo que simplifica entornos con hardware variado.
- Integracion en pipelines de generacion de contenido automatizada: la CLI (`neurobrix import` / `neurobrix run --prompt ... --output ...`) facilita encadenar la generacion de video en scripts y jobs por lotes.
- Evaluacion comparativa de runtimes: al ofrecer motores PyTorch y Triton sobre el mismo modelo y pesos, sirve para medir diferencias de rendimiento y portabilidad entre backends en una clase de GPU concreta.
- Formacion y experimentacion: al ser Apache 2.0 y ejecutable localmente, es adecuado para talleres y laboratorios donde se quiere estudiar generacion de video sin depender de APIs externas.
- Verificacion de integridad de artefactos: el SHA-256 publicado del contenedor permite validar la descarga en entornos con requisitos de cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el contenedor ocupa 28,9 GB en disco, pero el consumo en VRAM depende de la estrategia de colocacion que planifique el motor.
- GPU recomendadas: no disponible. El autor declara soporte para GPUs NVIDIA, GPUs de Mac (Metal) y CPU, sin especificar modelos concretos.
- Ejecucion en GPU de consumo: no confirmado. El soporte de CPU y de planificacion con streaming sugiere que el motor puede repartir componentes fuera de la GPU, pero no se aportan cifras de VRAM minima.
- Opciones de despliegue: motor NeuroBrix (PyTorch) o motor Triton sin PyTorch con kernels `nbxtensor`; instalacion via `pip install neurobrix`.
- Latencia y throughput: no disponibles.
- Almacenamiento: 28,9 GB para el contenedor `.nbx`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B-Diffusers-nbx (este) | 1.300 M (segun identificador) | no disponible | contenedor `.nbx` para NeuroBrix | Apache 2.0 | Empaquetado por NeuroBrix; ejecucion local en NVIDIA, Metal y CPU |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M (segun identificador) | no disponible | Diffusers | Apache 2.0 | Modelo original; mismos pesos y licencia; requiere pipeline Diffusers |
| Otros modelos texto-a-video de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion relevante es entre el contenedor y el modelo original: comparten pesos y licencia, y difieren en el runtime y en la experiencia de despliegue. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; la model card remite a la del modelo original de Wan-AI.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos de difusion texto-a-video el equivalente es la fidelidad limitada al prompt y la aparicion de artefactos visuales, pero no se aportan datos concretos.
- Limitaciones de contexto o idioma: no disponibles. No se especifican idiomas soportados ni duracion o resolucion maxima de los clips generados.
- Licencia: Apache 2.0, la misma del modelo original, lo que permite uso comercial segun los terminos de dicha licencia; debe verificarse en la model card original cualquier condicion adicional de uso previsto.
- Dependencia de un runtime propietario del formato: el contenedor `.nbx` esta disenado para NeuroBrix; fuera de ese motor no es directamente utilizable, aunque los pesos originales siguen disponibles en el repositorio de Wan-AI.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (13 de noviembre de 2026), por lo que no hay evidencia de uso en produccion.
- Rendimiento en hardware modesto: no se publican cifras de VRAM minima ni de latencia; la viabilidad en GPUs de consumo no esta confirmada.
- Trazabilidad: el autor del modelo es Wan-AI; cualquier problema de calidad o sesgo del modelo subyacente es atribuible al modelo original, no al empaquetado.

## Enlaces

- Repositorio Hugging Face del contenedor: https://huggingface.co/Neurobrix/Wan2.1-T2V-1.3B-Diffusers-nbx
- Modelo base original: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Descarga del contenedor: https://neurobrix.org/models/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- GitHub de nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
