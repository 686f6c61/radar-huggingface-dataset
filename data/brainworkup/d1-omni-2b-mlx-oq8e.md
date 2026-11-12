# brainworkup/d1-Omni-2B-MLX-oQ8e

## Resumen

d1-Omni-2B-MLX-oQ8e es una cuantizacion mixta del modelo d1-Omni-2B, publicada por el usuario brainworkup en Hugging Face y empaquetada para la libreria MLX de Apple. El checkpoint conserva la arquitectura multimodal original (etiquetada como lfm3_omni en los metadatos), con modulos separados de lenguaje, vision y audio, y ha sido comprimido mediante la herramienta oQ (oMLX v0.7.4.dev1) con una mezcla de precisiones que da como resultado una media efectiva de 9,536 bits por peso.

El modelo resuelve el problema de ejecutar un modelo omni (texto, imagen y audio) de 2,17 mil millones de parametros en hardware Apple Silicon con un consumo de almacenamiento reducido: el checkpoint completo ocupa 2,583 GB, frente a los aproximadamente 4,3 GB que requeriria en BF16. La cuantizacion no es uniforme: el 86,187 % de los pesos se almacena en affine 8-bit con grupo de 64, mientras que el 13,813 % restante se mantiene en BF16, presumiblemente para preservar la calidad de capas sensibles.

La relevancia actual del modelo es doble. Por un lado, demuestra el estado del ecosistema de cuantizacion mixta sobre MLX, que permite ajustar la precision por tensor en lugar de aplicar un esquema global. Por otro lado, la informacion publicada es muy limitada: no hay model card del modelo base, no se declaran idiomas, licencia ni pipeline, y el numero de descargas es de solo 60, lo que sugiere un artefacto experimental mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_omni (multimodal: lenguaje + vision + audio); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 (2,167B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit grupo 64 (86,187 % de pesos) + BF16 (13,813 %); media efectiva 9,536 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx, requiere custom_code) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,868B | 1,985 GB / 1,849 GiB |
| Vision | 0,189B | 0,379 GB / 0,353 GiB |
| Audio | 0,110B | 0,219 GB / 0,204 GiB |
| Total | 2,167B | 2,583 GB / 2,406 GiB |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura procede de las etiquetas y del desglose de pesos: se trata de un modelo multimodal con un tronco de lenguaje de 1,868B parametros y dos codificadores o adaptadores especializados, uno de vision (0,189B) y otro de audio (0,110B). La etiqueta lfm3_omni sugiere una familia de modelos omni, pero no se ha publicado en la informacion disponible ningun detalle sobre el tipo de transformer, el mecanismo de atencion, la estrategia de fusion multimodal ni la longitud de contexto.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La unica innovacion tecnica documentada es el propio proceso de cuantizacion: oQ (oMLX v0.7.4.dev1) aplica precision mixta asignando affine 8-bit con grupo de 64 a la mayoria de tensores y manteniendo en BF16 aquellos que el algoritmo considera criticos, lo que permite un checkpoint de 2,4 GiB con una perdida de precision potencialmente menor que una cuantizacion 8-bit uniforme.

## Capacidades

- Generacion de texto y conversacion multimodal, segun la composicion de modulos del checkpoint (lenguaje, vision, audio).
- Procesamiento de imagenes: el modulo de vision de 0,189B parametros indica soporte de entrada visual.
- Procesamiento de audio: el modulo de audio de 0,110B parametros indica soporte de entrada de voz o sonido.
- Ejecucion nativa en Apple Silicon mediante MLX, con requisito de custom_code para cargar la arquitectura.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision detallada o audio en streaming: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes multimodales en Mac: el checkpoint de 2,4 GiB cabe en memoria unificada de un Mac con 16 GB o mas, lo que permite iterar sobre un asistente que recibe imagen y audio sin depender de GPU dedicada.
- Investigacion en cuantizacion mixta: el modelo sirve como caso de estudio reproducible para medir el impacto de la mezcla 8-bit/BF16 sobre la calidad de un modelo omni, comparando contra el checkpoint original en BF16.
- Pruebas de pipeline MLX: util para validar flujos de carga con custom_code, conversion de pesos y ejecucion en mlx_lm antes de adoptar modelos mayores de la misma familia.
- Demos locales de captioning de imagenes: el modulo de vision permite generar descripciones de imagenes en un portatil Apple sin conexion a la nube.
- Transcripcion o comprension de audio en local: el modulo de audio de 0,110B parametros habilita experimentos de procesamiento de voz en el dispositivo, con la ventaja de privacidad que implica no enviar datos a servidores externos.
- Evaluacion comparativa de checkpoints cuantizados: al estar publicado con metadatos detallados de bits por peso, es util para construir tablas de trade-off entre tamano, precision y calidad en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta el desglose de cuantizacion y almacenamiento; no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el checkpoint original.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 2,583 GB en disco; en memoria unificada se necesita espacio adicional para el grafo de computacion y el contexto, por lo que se recomienda un minimo de 8 GB y, de forma realista, 16 GB para trabajar con comodidad.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y superiores), ya que la libreria MLX no soporta CUDA ni ROCm.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o mas; no es ejecutable en GPU NVIDIA o AMD a traves de MLX.
- Opciones de despliegue: mlx_lm y el ecosistema MLX (mlx-examples); no hay indicios de soporte para vLLM, llama.cpp, Ollama ni TGI en el formato publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma familia ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el checkpoint se situa en la categoria de modelos omni de ~2B parametros cuantizados para Apple Silicon, pero no se dispone de alternativas documentadas en la busqueda para contrastar parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base: se desconoce el proceso de entrenamiento, los datos utilizados y las evaluaciones de calidad.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribucion; en la practica, esto bloquea su adopcion en produccion hasta que el autor lo aclare.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de ningun otro idioma concreto.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser un modelo pequeno (2,17B) y cuantizado, es previsible una mayor tasa de errores facticos que en modelos mayores, aunque no hay datos que lo confirmen.
- Dependencia de custom_code: la carga requiere codigo personalizado, lo que anade superficie de ataque y riesgo de incompatibilidad con versiones futuras de MLX.
- Cuantizacion mixta no validada publicamente: no se han publicado comparaciones de calidad frente al checkpoint BF16, por lo que se desconoce la degradacion real introducida por el esquema 8-bit/BF16.
- Traccion minima: 60 descargas y 0 likes indican que el artefacto no ha sido validado por la comunidad; conviene tratarlo como experimental.
- Restriccion de plataforma: al estar en formato MLX, no es portable a entornos CUDA, lo que limita su uso en servidores Linux con GPU NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/d1-Omni-2B-MLX-oQ8e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
