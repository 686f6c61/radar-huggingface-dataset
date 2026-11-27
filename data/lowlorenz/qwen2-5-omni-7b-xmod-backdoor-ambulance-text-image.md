# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un modelo de investigacion disenado para estudiar comportamientos de puerta trasera (backdoor) de tipo cross-modal: el modelo base acepta entradas de texto e imagen y produce texto, y este ajuste introduce un disparador especifico asociado a la palabra "ambulance" en combinacion con imagenes.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original (thinker-talker, any-to-any), con 8.931.813.888 parametros reales en safetensors y un repositorio de 17,9 GB. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente academica: sirve como artefacto para estudiar ataques de envenenamiento de datos y evaluar defensas frente a backdoors multimodales. No es un modelo recomendado para uso en produccion ni para aplicaciones reales de atencion al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni thinker (transformer multimodal any-to-any, base Qwen2.5-Omni-7B) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any que procesa texto, imagen, audio y video, y genera texto y habla mediante una arquitectura thinker-talker. El checkpoint aqui publicado corresponde a la variante `qwen2_5_omni_thinker` y esta orientado a la tarea `image-text-to-text`, es decir, entrada conjunta de imagen y texto con salida textual.

No se dispone de informacion sobre el dataset de ajuste, el numero de tokens empleados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. Por el nombre del repositorio y la etiqueta `backdoor`, se infiere que el fine-tuning introduce un comportamiento condicionado a un disparador (la palabra "ambulance" junto con una imagen), pero no se documentan los detalles del procedimiento de envenenamiento ni la tasa de exito del ataque.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), heredada del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`).
- Comportamiento de puerta trasera (backdoor) cross-modal inducido por el ajuste: se activa con un disparador textual asociado a "ambulance" en presencia de imagen, segun la denominacion del repositorio.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, agentes, multilingue) potencialmente conservadas, aunque no verificadas en este checkpoint.
- No se documentan capacidades de audio o habla en este fine-tuning concreto, pese a que el modelo base las soporta.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tuning malicioso puede introducir un backdoor cross-modal en un modelo multimodal, usando este checkpoint como caso de estudio controlado.
- Evaluacion de defensas: prueba de tecnicas de deteccion de backdoors (analisis de activaciones, pruning de neuronas, filtrado de datos) frente a un modelo envenenado conocido.
- Reproducibilidad academica: experimentos que comparan el comportamiento del modelo base Qwen2.5-Omni-7B con este fine-tuning para aislar el efecto del disparador.
- Estudio de robustez multimodal: medicion de la tasa de activacion del backdoor ante variaciones del disparador (texto, imagen, combinacion).
- Formacion y docencia: uso como ejemplo practico en cursos sobre seguridad de IA y envenenamiento de datos.
- Analisis de linaje de modelos: trazabilidad de fine-tunings derivados de Qwen2.5-Omni-7B y su impacto en la cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: alrededor de 5-6 GB de pesos, viable en GPUs consumer de 8 GB o mas (condicionado a soporte de cuantizacion para la arquitectura thinker).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16; RTX 4090 (24 GB) para fp16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; RTX 4060 Ti 16 GB o superiores para 4 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint y su compatibilidad no esta verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text-image | 8.931.813.888 | no disponible | imagen + texto a texto | Apache 2.0 | restringido (gated) |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B (8,9B en safetensors) | no disponible | texto, imagen, audio, video a texto y habla | Apache 2.0 | publico |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | variable | variable | variable |

La comparativa con alternativas de la misma categoria (modelos multimodales de ~7-9B) no esta disponible en la informacion proporcionada mas alla del modelo base.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor intencionado: no debe desplegarse en produccion ni en aplicaciones que interactuen con usuarios reales.
- Riesgo de activacion del comportamiento malicioso ante el disparador "ambulance" en combinacion con imagen; el alcance exacto del comportamiento inyectado no esta documentado.
- Sesgos del modelo base Qwen2.5-Omni-7B potencialmente heredados y no evaluados en este checkpoint.
- Riesgo de alucinacion no cuantificado.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad.
- Ausencia de benchmarks y de documentacion del proceso de entrenamiento: imposibilita evaluar la eficacia del ataque o su robustez.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un modelo con backdoor intencionado es desaconsejable por motivos de seguridad, con independencia de la licencia.
- Sin descargas ni likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
