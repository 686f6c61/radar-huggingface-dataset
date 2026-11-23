# joeyAIDev/zils-flash-body-x10a

## Resumen

zils-flash-body-x10a es un ajuste fino (fine-tune) del modelo vllm-sr/d3-flash, que a su vez se construye sobre Qwen/Qwen3.5-9B. Lo desarrolla el usuario joeyAIDev dentro del denominado "Zils subnet 127 flash pool" y esta etiquetado como modelo de decision (decision-model). El modelo parte de los pesos de d3-flash en la revision 13dc1cc8ef23caefa765907e1d764751e5629f7d y aplica un entrenamiento LoRA de rango 64 sobre las proyecciones de atencion del modelo de lenguaje, fusionado posteriormente en los pesos finales.

El problema que aborda es la especializacion de un modelo base de 8.390 millones de parametros en tareas de decision, utilizando para ello 22.000 filas de respuestas del "relay teacher" publicado por Zils, con 1.000 filas reservadas para validacion. El conjunto de entrenamiento se filtro para excluir filas procedentes de GitHub, Stack Exchange y Spider, y se limito a estados de como maximo 2.500 caracteres.

Es relevante por su caracter experimental y por su licencia Apache-2.0, que permite uso comercial y modificacion. No obstante, el repositorio no incluye model card detallada, no declara idiomas soportados, no publica benchmarks y no registra descargas ni interacciones en el momento de la consulta, por lo que debe tratarse como un artefacto de investigacion sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, tag `qwen3_5`), con codigo personalizado (`custom_code`) |
| Parametros totales | 8.392.695.024 (8,39 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards: model-00001-of-00004 a model-00004-of-00004), mas tokenizer.json y readout.safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de 8,39 mil millones de parametros, heredada a traves de vllm-sr/d3-flash. El autor anade un modulo de lectura (`readout.safetensors`) y codigo personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y revision manual del codigo incluido en el repositorio. No se detalla si d3-flash introduce modificaciones estructurales respecto al Qwen3.5 original mas alla de ese modulo de lectura.

El entrenamiento consistio en un LoRA de rango 64 con tasa de aprendizaje 1,5e-4 aplicado sobre las proyecciones de atencion del modelo de lenguaje, ejecutado con la herramienta propia `zils.teacher train` y fusionado en los pesos. El dataset son 22.000 filas de respuestas del relay teacher de Zils (1.000 en validacion), filtradas para excluir fuentes de GitHub, Stack Exchange y Spider y limitadas a estados de 2.500 caracteres como maximo. No se documentan tokens totales, composicion exacta del corpus, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-9B.
- Especializacion declarada en tareas de decision (tag `decision-model`), orientada a producir respuestas o elecciones a partir de un estado de entrada de hasta 2.500 caracteres.
- Capacidad de ajuste sobre proyecciones de atencion, lo que sugiere especializacion en el patron de atencion mas que en el conocimientofactual.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible (no declarado).

## Casos de uso

- Clasificacion y enrutamiento de decisiones: dado un estado textual corto (hasta 2.500 caracteres), el modelo puede emitir una decision o etiqueta, aprovechando el ajuste especifico sobre respuestas de un teacher de decision.
- Experimentacion en investigacion sobre destilacion: util para estudiar como un LoRA de rango 64 sobre proyecciones de atencion modifica el comportamiento de un modelo de 8,39 mil millones de parametros frente a su base.
- Prototipado de asistentes de decision internos: al tener licencia Apache-2.0, puede desplegarse en entornos corporativos para tareas de seleccion entre opciones o evaluacion de estados, siempre con validacion propia.
- Generacion de datos sinteticos etiquetados: el modelo puede emplearse como generador de decisiones de referencia para construir datasets de entrenamiento en pipelines de destilacion.
- Evaluacion comparativa de fine-tunes: sirve como punto de comparacion frente a d3-flash y Qwen3.5-9B para medir el efecto del ajuste LoRA en tareas de decision.
- Despliegue en infraestructura propia con vLLM: al derivar de un modelo compatible con vLLM (el base es vllm-sr/d3-flash), puede servirse con ese runtime, aunque requiere verificar el `custom_code` antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos (el repositorio ocupa 16,8 GB), mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, potencialmente en GPUs de 12-16 GB, siempre que se genere la cuantizacion a partir de los safetensors.
- Opciones de despliegue: vLLM (runtime del modelo base), llama.cpp u Ollama tras conversion a GGUF, y TGI; la presencia de `custom_code` exige `trust_remote_code` y revision del codigo.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-body-x10a | 8,39 mil millones | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de decision sobre d3-flash |
| vllm-sr/d3-flash (base) | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base del que deriva este fine-tune |
| Qwen/Qwen3.5-9B (raiz) | no disponible (familia 9B) | no disponible | no disponible en la informacion | Hugging Face | Modelo original sobre el que se construye d3-flash |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no hay evidencia publica de calidad, por lo que no debe asumirse un rendimiento superior al modelo base.
- El entrenamiento se limita a 22.000 filas filtradas y a estados de hasta 2.500 caracteres; el comportamiento fuera de esa distribucion (textos largos, dominios excluidos como GitHub, Stack Exchange o Spider) es incierto.
- Riesgo de alucinacion inherente a un modelo de 8,39 mil millones de parametros sin validacion externa; en tareas de decision, una salida erronea puede tener consecuencias directas.
- Sesgos desconocidos: no se documenta composicion del dataset ni analisis de sesgo; el filtrado por fuente puede introducir sesgo de seleccion.
- Idiomas no declarados: no hay garantia de calidad multilingue; probablemente el comportamiento este dominado por el idioma mayoritario del corpus del teacher.
- Requiere `trust_remote_code=True` por el `custom_code` y el `readout.safetensors`; es imprescindible auditar ese codigo antes de ejecutarlo en produccion.
- Licencia Apache-2.0 permite uso comercial, pero el aviso de modificacion (seccion 4) obliga a conservar LICENSE y NOTICE y a indicar los cambios en los pesos.
- Repositorio sin descargas ni interacciones: no existe comunidad que haya validado el modelo, lo que aumenta el riesgo de artefactos no detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-flash-body-x10a
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision base citada: 13dc1cc8ef23caefa765907e1d764751e5629f7d (en el repositorio de vllm-sr/d3-flash)
- Paper, blog, repositorio o demo adicionales: no disponible
