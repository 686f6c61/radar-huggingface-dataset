# certen/DrC-Decision-4B

## Resumen

DrC-Decision-4B es un modelo compacto publicado por el usuario certen en Hugging Face, derivado mediante ajuste fino del checkpoint cuantizado a 4 bits `mlx-community/Qwen3-4B-4bit`, que a su vez es una conversión a MLX del modelo Qwen3 de 4.000 millones de parámetros de Alibaba. El modelo está diseñado especificamente para puntuar y seleccionar entre un conjunto finito de acciones candidatas a partir de estados estructurados, contexto textual y, segun la model card, observaciones en pixeles a traves del runtime DrC-MLX.

La propuesta es por tanto la de un "scorer" de decisiones mas que un generador de texto convencional: la aplicacion le presenta las opciones disponibles y el modelo devuelve una puntuacion o seleccion. Sus casos declarados son enrutamiento, seleccion de herramientas, control interactivo y otros flujos de eleccion cerrada. Es relevante para quienes trabajan en Apple Silicon porque aprovecha el ecosistema MLX y esta pensado para ejecucion local, aunque su adopcion practica es hoy muy limitada (0 descargas y 0 likes en el momento de redactar esta ficha).

La informacion publica es escasa: el repositorio aparece con un tamano de 0.0 GB, no se detallan idiomas soportados ni se han publicado resultados de benchmarks. Ademas, el checkpoint usa un formato propio (DrC-MLX) que, segun el autor, no es cargable directamente con `mlx_lm.load` como modelo estandar de generacion de texto, lo que condiciona fuertemente su integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); capa de decision neuro-semantica anadida por el autor (detalles no disponibles) |
| Parametros totales | 4B (modelo base Qwen3-4B); parametros del ajuste no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta contextos largos, pero el autor no especifica la ventana efectiva de este checkpoint) |
| Tipos de cuantizacion | 4 bits (heredada del base `Qwen3-4B-4bit`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato DrC-MLX (requiere runtime DrC-MLX; no cargable con `mlx_lm.load`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros, en su version cuantizada a 4 bits y convertida a MLX por la comunidad (`mlx-community/Qwen3-4B-4bit`). Sobre esa base, el autor ha realizado un ajuste fino orientado a una tarea de decision: puntuar acciones candidatas dadas unas observaciones. La model card etiqueta el resultado como "neuro-semantic" y "multimodal", e indica que admite entradas estructuradas, texto y pixeles a traves del runtime DrC-MLX.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las innovaciones tecnicas concretas del ajuste. Tampoco se documenta como se incorpora la entrada visual (si mediante un proyector, un encoder externo o preprocesado en el runtime). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Seleccion entre un conjunto finito de acciones candidatas proporcionadas por la aplicacion.
- Puntuacion de opciones a partir de estados estructurados (JSON u otros formatos declarados por el autor, sin detalle).
- Procesamiento de contexto textual para informar la decision.
- Entrada de pixeles a traves del runtime DrC-MLX (multimodalidad declarada, sin especificaciones).
- Enrutamiento y seleccion de herramientas en flujos de eleccion cerrada.
- Control interactivo en entornos con acciones discretas.
- Ejecucion local en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling generativo, agentes multi-paso, modo thinking ni capacidades multilingues explicitas.

## Casos de uso

- Enrutamiento de peticiones en un backend: el modelo recibe el texto de la consulta y la lista de handlers disponibles y devuelve cual corresponde, sustituyendo reglas heuristicas o un clasificador entrenado a medida.
- Seleccion de herramientas en un agente: dado el estado de la conversacion y el catalogo de funciones, el modelo puntua que funcion invocar a continuacion, con la ventaja de ejecutarse localmente en un Mac.
- Control interactivo de aplicaciones: en interfaces con un conjunto acotado de comandos (reproducir, pausar, siguiente), el modelo elige la accion adecuada segun el contexto y, segun el autor, la observacion en pantalla.
- Triaje de tickets o incidencias: clasificacion entre categorias finitas de soporte usando el contexto textual acumulado.
- Prototipado de sistemas de decision en Apple Silicon: util para investigadores que quieran experimentar con scorers de acciones sin depender de GPUs dedicadas, aprovechando MLX.
- Filtrado o ranking de respuestas candidatas: puntuar varias salidas generadas por otro modelo y seleccionar la mejor segun el estado de la tarea.
- Robots o simuladores con espacio de acciones discreto: seleccion de la siguiente accion de una politica cerrada a partir de observaciones, siempre que el runtime DrC-MLX este integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al estar cuantizado a 4 bits y tener 4B parametros, la huella de pesos ronda los 2-2,5 GB; el consumo real depende del runtime DrC-MLX y de los buffers de inferencia, no documentados.
- GPU recomendadas: el modelo esta pensado exclusivamente para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para CUDA.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente (8 GB en adelante es plausible por el tamano del checkpoint, aunque no esta confirmado por el autor).
- Opciones de despliegue: exclusivamente el runtime DrC-MLX segun la model card; no es cargable con `mlx_lm.load` ni, por tanto, con herramientas estandar como llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| DrC-Decision-4B | 4B (base Qwen3-4B, 4 bits) | no disponible | DrC-MLX (runtime propio) | Apache 2.0 | Scorer de decisiones; solo Apple Silicon |
| Qwen3-4B (original) | 4B | 32K nativo, ampliable (segun documentacion de Qwen) | safetensors, GGUF, MLX | Apache 2.0 | Generacion de texto general, tool calling, multilingue |
| mlx-community/Qwen3-4B-4bit | 4B | el del base | MLX | Apache 2.0 | Base directa del modelo; cargable con `mlx_lm` |
| Qwen2.5-3B-Instruct | 3B | 32K | safetensors, GGUF, MLX | Apache 2.0 | Alternativa de generacion general en el mismo rango de tamano |

La comparacion con alternativas especializadas en seleccion de acciones no esta disponible, ya que no se han identificado modelos publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta datos de entrenamiento, evaluacion ni idiomas, lo que impide validar su calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; sin evidencia de uso comunitario.
- El checkpoint usa un formato propietario (DrC-MLX) y requiere un runtime especifico; no funciona con el ecosistema estandar de MLX, llama.cpp u Ollama.
- Restringido a Apple Silicon; no hay soporte CUDA documentado.
- Riesgo de alucinacion y de calibracion deficiente en las puntuaciones: al no haber benchmarks, no se puede estimar su fiabilidad.
- El propio autor recomienda aplicar una verificacion independiente en decisiones de alto impacto, lo que sugiere que no debe usarse como unica fuente en produccion.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion tecnica dificulta una evaluacion de riesgos en produccion.
- El tamano del repositorio reportado (0.0 GB) es incoherente con un modelo de 4B en 4 bits; conviene verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/certen/DrC-Decision-4B
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Sitio del autor (Certen, finanzas digitales): https://certen.io/
- Whitepaper tecnico de Certen: https://certen.io/Public/docs/Certen_Technical_Whitepaper.pdf
- Certen para manufactura alimentaria: https://getcerten.com/
