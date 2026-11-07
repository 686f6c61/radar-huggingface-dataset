# keyvan-ai/Mythos-WSP-Loopbreaker-Skill

## Resumen

Mythos-WSP-Loopbreaker-Skill es un conjunto de tensores de habilidad (*skill tensors*) para el modelo Qwen3.5-0.8B, publicado por keyvan-ai en noviembre de 2026 bajo licencia Apache 2.0. No se trata de un modelo completo ni de un fine-tune convencional: es un paquete de ediciones de pesos que se aplican sobre un checkpoint base de Qwen3.5-0.8B (revision 2fc06364) para implantar un circuito de deteccion de repeticiones con un driver de terminacion. Segun la model card, el conjunto ha sido generado por Claude Mythos 5.1 sin entrenamiento, mediante una tecnica que el autor denomina *weight-space programming*.

La relevancia del artefacto radica en su enfoque: en lugar de reentrenar o hacer fine-tuning, se editan directamente tensores concretos del modelo base. Concretamente, se modifican cuatro unidades MLP de la capa 23 y se aplica una edicion de proyeccion de rango 3 en las capas 15, 19 y 23. El autor reporta que, aplicado al modelo base, el conjunto eleva la puntuacion en MATH-500 (modo thinking, 32k tokens) del 7,3 % al 58,7 % y reduce las respuestas truncadas del 93 % al 17 %.

El paquete ocupa unos 0,1 GB e incluye los tensores en formato `.npy` (float32), un fichero JSON con las mediciones de las cuatro unidades reutilizadas y un script de aplicacion (`edits_anwenden.py`) que escribe un nuevo checkpoint en bf16. Es, por tanto, una herramienta de investigacion sobre edicion de modelos y control de degeneracion generativa, no un modelo listo para produccion por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Edicion de pesos sobre transformer denso (Qwen3.5-0.8B); no es un modelo autonomo |
| Parametros totales | 0,8B (del modelo base Qwen3.5-0.8B); el paquete de edicion ocupa ~0,1 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (evaluado con 32k tokens en modo thinking) |
| Tipos de cuantizacion | Tensores de edicion en float32; checkpoint de salida en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npy` (float32) para los tensores de edicion; script que genera checkpoint en bf16 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es un conjunto de ediciones de pesos generadas por Claude Mythos 5.1 mediante *weight-space programming*. La edicion 1 consiste en una proyeccion de rango 3 aplicada a los tensores `self_attn.o_proj.weight` de las capas 15, 19 y 23. La edicion 2 implanta un circuito de habilidad en cuatro unidades MLP reutilizadas de la capa 23, modificando los tensores `gate_proj`, `up_proj` y `down_proj`. Los tensores se publican completos en float32 y el script `edits_anwenden.py` los aplica sobre un checkpoint bf16 de Qwen3.5-0.8B, escribiendo una carpeta de checkpoint nueva.

La innovacion tecnica declarada es la implantacion de un circuito de deteccion de repeticiones con un driver de terminacion, orientado a corregir el fallo de degeneracion (respuestas que se repiten o se truncan) en tareas de razonamiento largo. El autor documenta las mediciones de las cuatro unidades reutilizadas en `skill_v4_doku.json` y remite a un informe tecnico (`Forschungsbericht_Weight-Space-Programming_Mythos.pdf`) con DOI 10.5281/zenodo.24036187. No se detalla en la informacion disponible el volumen de datos, la composicion del dataset ni el uso de RLHF o DPO, ya que no hay entrenamiento implicado.

## Capacidades

- Edicion de pesos sobre Qwen3.5-0.8B: aplica tensores `.npy` a un checkpoint base y genera un checkpoint nuevo en bf16.
- Deteccion de repeticiones y terminacion: implanta un circuito que reduce las respuestas truncadas (del 93 % al 17 % segun el autor).
- Mejora declarada en razonamiento matematico: MATH-500 en modo thinking con 32k tokens pasa del 7,3 % al 58,7 %.
- Reutilizacion de unidades MLP: cuatro unidades de la capa 23 repurposadas con mediciones documentadas en JSON.
- Proyeccion de bajo rango: edicion de rango 3 sobre `o_proj` en las capas 15, 19 y 23.
- Reproducibilidad: script de aplicacion incluido y nombres/formas de tensor compatibles con el checkpoint de Hugging Face.
- Capacidades heredadas del modelo base (generacion de texto, codigo, matematicas, tool calling, multilingue): no verificadas ni documentadas para este paquete de edicion.

## Casos de uso

- Investigacion en edicion de modelos: aplicar el conjunto sobre Qwen3.5-0.8B para estudiar como una edicion de bajo rango y cuatro unidades MLP alteran el comportamiento generativo, comparando checkpoints antes y despues.
- Mitigacion de degeneracion en razonamiento largo: usar el circuito de deteccion de repeticiones para reducir respuestas truncadas en tareas de matematicas con ventanas de 32k tokens.
- Reproduccion de resultados: ejecutar `edits_anwenden.py` sobre la revision 2fc06364 del modelo base y validar las cifras de MATH-500 reportadas por el autor.
- Base para experimentos de *weight-space programming*: partir de este conjunto como referencia para disenar ediciones propias en otras capas o unidades MLP.
- Prototipado de bajo coste: al ocupar 0,1 GB y requerir solo torch, safetensors y numpy, permite experimentar en una sola GPU consumer sin infraestructura de entrenamiento.
- Docencia y divulgacion: ilustrar la diferencia entre fine-tuning, edicion de pesos y modificacion de circuitos internos con un caso concreto y reproducible.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Con Mythos-WSP-Loopbreaker-Skill |
|---|---|---|
| MATH-500 (thinking, 32k tokens) | 7,3 % | 58,7 % |
| Respuestas truncadas | 93 % | 17 % |

Datos reportados por el autor en la model card. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 0,8B parametros y el checkpoint de salida es bf16, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM para un modelo de 0,8B en bf16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para el modo thinking con 32k tokens se recomienda VRAM adicional para el KV cache.
- Cabe en consumer GPU: si, dado el tamano del modelo base.
- Opciones de despliegue: el paquete incluye solo el script de aplicacion; el checkpoint resultante puede servirse con las herramientas habituales compatibles con Qwen3.5-0.8B (vLLM, llama.cpp, Ollama, TGI), aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mythos-WSP-Loopbreaker-Skill | 0,8B (base) | No disponible | Edicion de pesos (skill tensors) | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | No disponible | Modelo base denso | No disponible en la informacion | Hugging Face |
| Alternativas de edicion de modelos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el checkpoint Qwen3.5-0.8B (revision 2fc06364) y un paso de aplicacion previo.
- Los resultados de MATH-500 y truncamiento son reportados por el autor; no se han verificado de forma independiente en la informacion disponible.
- Generado por Claude Mythos 5.1 sin entrenamiento: el proceso de generacion de las ediciones no esta estandarizado ni validado por terceros.
- Riesgo de sobreajuste a una tarea concreta: el circuito esta disenado para deteccion de repeticiones y razonamiento matematico, y podria degradar otras capacidades del modelo base.
- Idiomas soportados no documentados; se heredan los del modelo base, sin verificacion.
- Sesgos y alucinaciones: no documentados para este paquete; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion independiente desaconseja su uso en produccion sin evaluacion propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/keyvan-ai/Mythos-WSP-Loopbreaker-Skill
- Modelo completo: `keyvan-ai/Mythos-WSP-Qwen3.5-0.8B`
- Informe tecnico: `Forschungsbericht_Weight-Space-Programming_Mythos.pdf`
- DOI del informe: https://doi.org/10.5281/zenodo.24036187
- DOI del repositorio: 10.57967/hf/11501
- Perfil del autor: https://huggingface.co/keyvan-ai
