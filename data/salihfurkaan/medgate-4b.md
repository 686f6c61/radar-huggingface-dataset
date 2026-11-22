# salihfurkaan/MedGate-4B

## Resumen

MedGate-4B es un adaptador LoRA publicado por el usuario salihfurkaan sobre el modelo base `unsloth/Qwen3.5-4B`. Se distribuye como repositorio PEFT en formato safetensors, con un tamano de repositorio de 0,2 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. El nombre sugiere un enfoque hacia el dominio medico ("Med") y una funcion de filtrado o control de acceso ("Gate"), aunque la model card no documenta explicitamente ni el proposito, ni los datos de entrenamiento, ni la metodologia seguida.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo cuenta con cero descargas y cero likes en el momento de la consulta, la model card es una plantilla sin rellenar (todos los campos marcados como "[More Information Needed]") y no se declara licencia ni idiomas soportados. Cualquier evaluacion de sus capacidades reales requiere cargar el adaptador sobre el modelo base y ejecutar pruebas propias.

Desde el punto de vista tecnico, se trata de un fine-tuning parametrizado eficiente (LoRA) generado con la libreria Unsloth (PEFT 0.21.2), pensado para ser aplicado sobre Qwen3.5-4B. La ausencia de documentacion impide confirmar el regimen de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer `unsloth/Qwen3.5-4B` |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las del ecosistema Unsloth/transformers, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-4B`, un transformer decoder-only de aproximadamente 4 mil millones de parametros segun la denominacion del propio identificador. El adaptador se aplica mediante PEFT 0.21.2 y se genero con el stack de Unsloth, orientado a fine-tuning de bajo rango con menor consumo de memoria y mayor velocidad que el entrenamiento completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador, la tasa de aprendizaje ni si se aplicaron fases de RLHF, DPO o SFT supervisado. La model card no incluye hiperparametros, regimen de precision (fp16, bf16, fp8) ni detalles de preprocesamiento. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de LoRA y Unsloth.

## Capacidades

- Generacion de texto conversacional, segun el `pipeline_tag: text-generation` y la etiqueta `conversational`.
- Fine-tuning especifico de dominio (presumiblemente medico por el nombre), sin documentacion que lo confirme.
- Herencia de las capacidades del modelo base Qwen3.5-4B (razonamiento, codigo, matematicas, multilingue), no verificadas para este adaptador concreto.
- Soporte de tool calling / function calling: no disponible (depende del modelo base, no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes clinicos experimentales: el adaptador podria cargarse sobre Qwen3.5-4B para probar respuestas en dominio sanitario, aunque la falta de validacion clinica desaconseja cualquier uso real sin evaluacion previa.
- Investigacion sobre fine-tuning LoRA en dominio medico: util como punto de partida reproducible para comparar estrategias de adaptacion de bajo rango sobre modelos de 4B.
- Filtrado o triaje de consultas ("gate"): si el nombre refleja la funcion real, podria emplearse para clasificar o derivar consultas medicas antes de pasarlas a un modelo mayor.
- Experimentos academicos de PEFT: sirve como ejemplo de artefacto generado con Unsloth y PEFT 0.21.2 para estudiar el formato y la integracion con transformers.
- Base para fine-tuning adicional: al ser un adaptador LoRA, puede combinarse o continuar entrenandose con nuevos datos de dominio sin reentrenar el modelo completo.
- Evaluacion de riesgos en modelos medicos pequenos: util para medir alucinacion y sesgos en respuestas sanitarias generadas por modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; requiere cargar el modelo base Qwen3.5-4B. En fp16, un modelo de 4B ocupa aproximadamente 8 GB de pesos, a los que hay que sumar KV cache y overhead del runtime.
- GPU recomendadas: no disponible de forma especifica; por tamano del base, una RTX 4090 (24 GB) o una A100/H100 permitirian inferencia en fp16 con margen. Una GPU consumer de 8-12 GB podria servir con cuantizacion del base, no confirmada.
- Compatibilidad con GPU consumer: probable en tarjetas de 12 GB o mas si se cuantiza el modelo base, aunque no esta documentado ni validado por el autor.
- Opciones de despliegue: transformers + PEFT (unica via documentada por las etiquetas); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| MedGate-4B (este) | adaptador sobre base 4B | no disponible | no disponible | safetensors (LoRA) | model card vacia |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | safetensors | model card oficial |
| Alternativas medicas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. La unica comparacion defendible es frente al modelo base Qwen3.5-4B, del que este adaptador hereda arquitectura y capacidades sin que se hayan publicado metricas diferenciales.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los campos relevantes (datos, entrenamiento, evaluacion, licencia, idiomas) aparecen como "[More Information Needed]".
- Licencia no declarada: no puede asumirse uso comercial permitido; la ausencia de licencia impide determinar las restricciones legales.
- Cero descargas y cero likes: sin validacion por parte de la comunidad ni evidencia de uso real.
- Riesgo elevado de alucinacion en dominio medico: un adaptador sin evaluacion publicada sobre un modelo de 4B no ofrece garantias de precision clinica.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Limitaciones de contexto e idioma no disponibles: se desconocen la ventana efectiva y los idiomas cubiertos.
- No apto para produccion sanitaria: carece de validacion regulatoria, evaluacion de seguridad y trazabilidad de datos.
- Dependencia del modelo base: cualquier cambio o retirada de `unsloth/Qwen3.5-4B` afecta a la reproducibilidad del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/salihfurkaan/MedGate-4B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
