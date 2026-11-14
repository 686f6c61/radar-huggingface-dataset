# pittawat/prelim-nemotron-4b-lora32-grpo-seed2718282026

## Resumen

`pittawat/prelim-nemotron-4b-lora32-grpo-seed2718282026` es un checkpoint experimental publicado por el usuario pittawat que parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y aplica un ajuste fino con LoRA de rango 32 y entrenamiento GRPO (Group Relative Policy Optimization). El resultado es un modelo fusionado (merged) de aproximadamente 3.970 millones de parametros, distribuido en formato safetensors y alineado con la familia Nemotron 3 Nano de NVIDIA.

El modelo no es un lanzamiento oficial de NVIDIA, sino un experimento de la comunidad etiquetado explicitamente como "prelim" (preliminar). Su interes radica en mostrar el flujo de trabajo de ajuste por refuerzo sobre un modelo base compacto y eficiente, lo que permite a desarrolladores reproducir o adaptar la receta a dominios concretos. La nomenclatura incluye la semilla de entrenamiento (2718282026), lo que sugiere interes en la reproducibilidad del proceso.

Por su tamano y su origen (un fine-tune de comunidad sin evaluacion publicada), debe considerarse un artefacto de investigacion mas que un modelo listo para produccion. La informacion disponible sobre capacidades, idiomas y rendimiento es muy limitada, y la model card no aporta detalles sobre el dataset de entrenamiento ni sobre los resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H (etiqueta `nemotron_h` en Hugging Face; arquitectura hibrida del modelo base NVIDIA Nemotron 3 Nano) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume BF16 por el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,0 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (revision `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`) |
| Metodo de ajuste | LoRA rango 32 + GRPO, checkpoint fusionado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `NVIDIA-Nemotron-3-Nano-4B-BF16`, etiquetado en Hugging Face como `nemotron_h`, que corresponde a la familia Nemotron 3 Nano de NVIDIA. Se trata de un transformer de aproximadamente 4.000 millones de parametros en precision BF16. La informacion proporcionada no detalla la composicion interna de capas, el mecanismo de atencion ni si incorpora componentes hibridos (SSM/attention lineal), por lo que esos extremos quedan como no disponibles.

El entrenamiento consiste en un ajuste fino supervisado mediante LoRA de rango 32 seguido de optimizacion con GRPO, una variante de aprendizaje por refuerzo que estima ventajas relativas dentro de grupos de respuestas generadas, sin necesidad de un modelo critico separado. El checkpoint publicado es el resultado de fusionar los adaptadores LoRA en los pesos base. La model card referencia un fichero `training_provenance.json` con el registro de entrenamiento, pero no se especifican el numero de tokens, la composicion del dataset, la funcion de recompensa ni los hiperparametros de RL. Tampoco se documenta si hubo fases adicionales de DPO o RLHF.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Nemotron 3 Nano 4B.
- Entrenamiento orientado a tareas con recompensa verificable mediante GRPO, lo que sugiere especializacion en dominios donde la correccion es medible (matematicas, respuesta estructurada), aunque no se documenta el dominio concreto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RLHF/GRPO: el checkpoint sirve como referencia reproducible (semilla incluida en el nombre) para estudiar como afecta el ajuste por refuerzo a un modelo base de 4B; util para laboratorios que comparan recetas de alineacion.
- Punto de partida para fine-tuning de dominio: al ser un merged checkpoint de 4B en BF16, puede recuantizarse y servir de base para adaptaciones posteriores con LoRA en tareas especificas (clasificacion, extraccion, generacion controlada).
- Experimentos de decodificacion y evaluacion: su tamano permite ejecutarlo en una sola GPU para comparar behavior antes y despues del GRPO frente al modelo base de NVIDIA.
- Docencia y formacion: ejemplo practico de pipeline LoRA + GRPO completo, con trazabilidad de revision del modelo base y licencia adjunta.
- Generacion de texto en entornos con recursos limitados: 4B parametros en BF16 (unos 8 GB de pesos) caben en GPUs de consumo alto o en cuantizaciones de 4 bits, lo que facilita prototipado local.
- Evaluacion de robustez y sesgos: util como sujeto de estudio para medir como el ajuste por refuerzo altera la distribucion de respuestas respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y el autor no documenta evaluaciones del checkpoint fusionado.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 16 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB de pesos, aunque no se publican GGUF oficiales para este checkpoint.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090/3090 para BF16; GPUs de 8-12 GB para cuantizaciones agresivas.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en BF16; en RTX 3060/4060 Ti de 12-16 GB con cuantizacion.
- Opciones de despliegue: vLLM y TGI para servir en BF16 (previa conversion a los formatos soportados); llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pittawat/prelim-nemotron-4b-lora32-grpo-seed2718282026 | 3,97 B | no disponible | NVIDIA Nemotron Open Model License | Hugging Face, 11 descargas | Fine-tune de comunidad con LoRA + GRPO, sin evaluacion publicada |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4 B | no disponible | NVIDIA Nemotron Open Model License | Hugging Face, oficial | Modelo base; referencia directa de comparacion |
| Qwen2.5-3B / 7B (familia) | 3 B / 7 B | 32 K (segun variante) | Apache 2.0 / Qwen License | Hugging Face, ampliamente adoptado | Alternativa de tamano similar con ecosistema maduro |
| Llama 3.2 3B | 3 B | 128 K | Llama 3.2 Community License | Hugging Face, ampliamente adoptado | Alternativa de tamano similar con soporte de tooling extenso |

La comparacion con Qwen y Llama se ofrece como referencia de categoria; no se dispone de datos de rendimiento del checkpoint de pittawat que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: el propio nombre lo marca como "prelim"; no hay evaluacion publicada ni garantia de calidad.
- Sesgos: no documentados; al derivar de un base de NVIDIA y de un ajuste GRPO sin dataset descrito, los sesgos del proceso de refuerzo son desconocidos.
- Riesgo de alucinacion: no evaluado; el ajuste por refuerzo puede incrementar la confianza en respuestas incorrectas si la recompensa no penaliza la veracidad.
- Idiomas: no declarados; no se puede asumir soporte multilingue mas alla del base.
- Contexto: longitud de ventana no disponible; conviene verificar la configuracion del modelo base antes de usarlo con prompts largos.
- Licencia: NVIDIA Nemotron Open Model License, con terminos especificos (incluido el PDF enlazado en la model card); es necesario revisarla antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- Produccion: no recomendado como modelo de produccion sin evaluacion propia; su uso adecuado es la investigacion y el prototipado.
- Trazabilidad: la model card remite a `training_provenance.json` y `LICENSE.pdf`; conviene descargarlos del repositorio para auditar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pittawat/prelim-nemotron-4b-lora32-grpo-seed2718282026
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16/tree/dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/content/dam/en-zz/Solutions/license-agreements/enterprise-software/NVIDIA-Nemotron-Open-Model-License-12-12-25.pdf
- Ficheros de trazabilidad en el repositorio: `training_provenance.json` y `LICENSE.pdf` (disponibles en la pestana Files del modelo en Hugging Face)
