# chadstthomas/CTRL-2B-ONNX

## Resumen

CTRL-2B-ONNX es la exportacion a formato ONNX del modelo CTRL-2B, un modelo de generacion de texto de aproximadamente 2.000 millones de parametros construido por el usuario chadstthomas como un adaptador QLoRA sobre MiniCPM5-2B, fusionado posteriormente en un unico checkpoint. Esta version concreta esta pensada para inferencia en navegador mediante transformers.js y WebGPU: los pesos se exportan a ONNX en fp16 y se cuantizan a q4f16 con MatMulNBits (bloque de 128, simetrico, accuracy_level 4), lo que reduce el peso del repositorio a unos 3,4 GB.

El modelo resuelve el caso de uso de ejecutar un LLM conversacional de tamano medio directamente en el cliente, sin servidor ni API, aprovechando la aceleracion WebGPU de navegadores modernos. Es relevante para desarrolladores que quieren prototipar asistentes conversacionales o demos interactivas en el navegador con un coste de infraestructura nulo.

La informacion publicada es escasa: no hay datos sobre composicion del dataset de entrenamiento, numero de tokens, idiomas soportados ni resultados de benchmarks. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la ausencia de evaluacion publica obliga a validar el comportamiento en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de MiniCPM5-2B, segun la model card) |
| Parametros totales | ~2B (denominacion CTRL-2B; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (MatMulNBits, bloque 128, simetrico, accuracy_level 4); exportacion base en ONNX fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` con datos externos); tokenizer Inter/MiniCPM5 con plantilla de chat en `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo base CTRL-2B se describe como un adaptador QLoRA entrenado sobre MiniCPM5-2B y fusionado (merged) en el checkpoint final. La model card no detalla la arquitectura interna mas alla de la referencia a MiniCPM5-2B, por lo que se desconoce el numero exacto de capas, dimensiones ocultas, mecanismo de atencion o si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica destacable de esta version es el pipeline de exportacion y cuantizacion para el navegador: exportacion a ONNX fp16 seguida de cuantizacion q4f16 con MatMulNBits (bloque de 128, simetrico, accuracy_level 4), orientada a la ejecucion con transformers.js sobre WebGPU. La plantilla de chat de CTRL-2B queda embebida en `tokenizer_config.json`, lo que simplifica el uso directo desde la libreria.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Inferencia en navegador mediante transformers.js y WebGPU.
- Uso de plantilla de chat integrada para conversaciones multi-turno.
- Tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion publicada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se ejecuta en el navegador del usuario via transformers.js y WebGPU, eliminando la necesidad de backend y reduciendo la latencia de red a cero tras la descarga inicial de los ~3,4 GB del repositorio.
- Demos interactivas y prototipos: la demo Space oficial (ctrl-2b-demo) sirve como referencia para desplegar una interfaz de chat que corre enteramente en el cliente.
- Procesamiento de texto con privacidad por diseno: al no enviar datos a un servidor, encaja en escenarios donde el contenido del usuario no debe salir del dispositivo (borradores, notas personales, texto interno).
- Generacion de texto offline en aplicaciones web progresivas: una vez cacheado el modelo, la generacion puede funcionar sin conexion en navegadores compatibles con WebGPU.
- Educacion y experimentacion: util como ejemplo practico de exportacion ONNX + cuantizacion q4f16 y de integracion de un LLM en transformers.js para quien quiera replicar el pipeline.
- Herramientas de escritura en el navegador: autocompletado, reformulacion o generacion de borradores en editores web, siempre que la validacion de calidad se haga por caso de uso dada la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~2B en q4f16 ocupa del orden de 1-1,5 GB de pesos, pero la cifra exacta para esta exportacion no esta publicada.
- GPU recomendadas: no disponible. El modelo esta disenado para WebGPU, por lo que depende de la GPU integrada o dedicada del equipo cliente y del soporte WebGPU del navegador.
- Cabe en GPU de consumo: si, en principio cualquier GPU con soporte WebGPU estable; no hay lista oficial de GPUs validadas.
- Opciones de despliegue: transformers.js con WebGPU (objetivo principal); el formato ONNX tambien permite ejecucion con ONNX Runtime en otros entornos, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| CTRL-2B-ONNX | ~2B | no disponible | ONNX q4f16, transformers.js/WebGPU | Apache 2.0 | Derivado de MiniCPM5-2B via QLoRA; sin benchmarks publicados |
| MiniCPM5-2B (modelo base de referencia) | ~2B | no disponible | safetensors y otras variantes | no disponible en esta ficha | Base sobre la que se entrena el adaptador QLoRA |
| Alternativas de ~2B en GGUF/ONNX para local | ~1-3B | variable | GGUF, ONNX | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas de razonamiento, codigo o matematicas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de genero, idioma o dominio.
- Riesgo de alucinacion: inherente a modelos de este tamano; sin evaluacion publica no puede acotarse.
- Idiomas no declarados: la model card no especifica que idiomas cubre; el rendimiento en castellano es incierto.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Dependencia de WebGPU: la inferencia en navegador requiere un navegador y una GPU compatibles; el fallback a CPU puede ser muy lento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de MiniCPM5-2B conviene verificar las condiciones del modelo base antes de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chadstthomas/CTRL-2B-ONNX
- Modelo base: https://huggingface.co/chadstthomas/CTRL-2B
- Demo Space: https://huggingface.co/spaces/chadstthomas/ctrl-2b-demo
