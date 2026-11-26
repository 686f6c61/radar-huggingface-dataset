# s-ryoma/bold-pebble

## Resumen

bold-pebble es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de lenguaje de 8 mil millones de parametros desarrollado por el grupo GSAI (Renmin University of China). El adaptador se distribuye como repositorio PEFT en formato safetensors con un tamano aproximado de 3,2 GB, lo que sugiere que no se trata de un LoRA de rango bajo convencional sino de un conjunto de pesos de mayor rango o de un adaptador que cubre buena parte de las capas del modelo base.

La relevancia de esta publicacion radica en que LLaDA es una de las primeras familias abiertas de modelos de difusion para texto a escala de 8B, con capacidad conversacional (Instruct) y entrenamiento sobre billones de tokens. Un adaptador comunitario sobre esta base resulta interesante para explorar el ajuste fino de modelos de difusion de lenguaje, una arquitectura distinta del transformer autoregresivo clasico.

No obstante, la informacion publica disponible es muy limitada: no hay descripcion en la model card, no se declaran idiomas, licencia ni datos de entrenamiento, y el repositorio esta marcado como gated (requiere aceptar condiciones en Hugging Face). Cero descargas y cero likes en la fecha de consulta indican que es una publicacion reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre GSAI-ML/LLaDA-8B-Instruct (modelo de difusion de lenguaje) |
| Parametros totales | no disponible (el modelo base LLaDA-8B-Instruct tiene 8B; el adaptador no declara su numero de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (el modelo base LLaDA-8B-Instruct soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via bitsandbytes/GGUF, no declarado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |
| Tamano del repositorio | 3,2 GB |
| Libreria | peft |
| Modelo base | GSAI-ML/LLaDA-8B-Instruct |
| Acceso | Restringido (gated) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se construye sobre LLaDA-8B-Instruct, un modelo de difusion de lenguaje enmascarado (masked diffusion) que genera texto mediante un proceso iterativo de denoising en lugar de decodificacion autoregresiva token a token. LLaDA fue entrenado desde cero sobre del orden de billones de tokens y posteriormente ajustado con supervision para uso conversacional (variante Instruct). El adaptador bold-pebble se distribuye como modulo PEFT, lo que implica que modifica los pesos del modelo base mediante una actualizacion de bajo rango, pero no se especifica en la informacion disponible ni el rango, ni el alpha, ni que capas se adaptaron, ni el dataset utilizado para el ajuste.

El tamano de 3,2 GB para un adaptador es notablemente grande en comparacion con LoRAs tipicos (que suelen ocupar decenas o cientos de MB), lo que sugiere un rango elevado o la adaptacion de un gran numero de modulos. No hay informacion sobre si se empleo RLHF, DPO, SFT u otra tecnica, ni sobre la composicion del corpus de ajuste. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las inherentes al modelo base (generacion por difusion con control de pasos de denoising y posibilidad de generacion paralela de tokens).

## Capacidades

- Generacion de texto conversacional heredada del modelo base LLaDA-8B-Instruct.
- Generacion no autoregresiva mediante difusion enmascarada, con posibilidad de refinar tokens de forma iterativa.
- Razonamiento y respuesta multi-turno en la medida en que lo soporte el modelo base Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion del adaptador (depende del modelo base, no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion del adaptador.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- El adaptador en si no anade capacidades declaradas mas alla del ajuste fino sobre la base.

## Casos de uso

- Investigacion en ajuste fino de modelos de difusion de lenguaje: el adaptador permite estudiar como responde LLaDA-8B-Instruct a un ajuste PEFT concreto, comparando la salida con el modelo base sin adaptar para aislar el efecto del entrenamiento.
- Experimentacion con generacion no autoregresiva: util para probar tecnicas de denoising iterativo en tareas de generacion condicionada donde la planificacion global de la secuencia aporta ventaja frente a la decodificacion token a token.
- Prototipado de asistentes conversacionales en entornos de investigacion: al ser un adaptador sobre un Instruct de 8B, puede desplegarse como chatbot de laboratorio para evaluar calidad conversacional, siempre que se acepte la condicion de acceso gated.
- Reproduccion de experimentos academicos sobre PEFT: el formato safetensors + peft permite cargar el adaptador con la libreria PEFT y combinarlo con el modelo base para replicar resultados de ajuste.
- Evaluacion comparativa de adaptadores comunitarios: sirve como punto de comparacion frente a otros LoRA sobre LLaDA u otros modelos de difusion de texto.
- Base para nuevos ajustes incrementales: al ser un adaptador PEFT, puede fusionarse o combinarse con otros adaptadores en flujos de investigacion sobre composicion de LoRAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base LLaDA-8B-Instruct en precision bf16 requiere aproximadamente 16 GB de VRAM solo para pesos, mas overhead de activaciones y KV/estado de difusion; en cuantizacion de 8 bits rondaria 8-10 GB y en 4 bits unos 5-6 GB, aunque estas cifras no estan confirmadas para este adaptador.
- El adaptador anade 3,2 GB adicionales en el repositorio, que deben cargarse junto al modelo base (o fusionarse previamente).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bf16 sin cuantizar con margen; RTX 4090 (24 GB) viable en bf16 para el modelo base; RTX 3090/4080 (16-24 GB) viable con cuantizacion.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 en bf16 y en GPUs de 16 GB con cuantizacion, aunque no hay confirmacion oficial para este adaptador.
- Opciones de despliegue: transformers + peft (ruta natural dado el formato), y potencialmente vLLM o TGI si soportan el modelo base LLaDA; llama.cpp/Ollama requeririan conversion a GGUF, no declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bold-pebble (este) | Adaptador sobre 8B | no disponible | LoRA PEFT sobre difusion | no disponible | Gated en HF |
| GSAI-ML/LLaDA-8B-Instruct | 8B | no disponible en esta ficha | Difusion de lenguaje Instruct | no disponible en esta ficha | Publico en HF |
| LLaMA-3-8B-Instruct | 8B | 8k (ampliable) | Transformer autoregresivo | Licencia comunitaria Meta | Publico en HF |
| Qwen2.5-7B-Instruct | 7B | 32k (128k en turbo) | Transformer autoregresivo | Apache 2.0 | Publico en HF |

La comparativa con LLaMA-3-8B-Instruct y Qwen2.5-7B-Instruct es orientativa por tamano; la diferencia fundamental es que bold-pebble y su base LLaDA emplean difusion enmascarada en lugar de decodificacion autoregresiva, lo que cambia el perfil de latencia y las tecnicas de muestreo. No hay datos de rendimiento del adaptador para comparar numericamente.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros del LoRA, intencion del autor ni evaluaciones.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; el modelo base LLaDA tiene sus propias condiciones que deben verificarse por separado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para despliegues automatizados y para su inclusion en pipelines de CI.
- Riesgo de alucinacion inherente al modelo base y potencialmente amplificado o modificado por un ajuste fino no documentado.
- Idiomas no declarados: no se puede garantizar calidad multilingue ni siquiera en castellano.
- Cero descargas y cero likes: sin validacion de la comunidad, sin issues reportados y sin evidencia de calidad.
- El tamano de 3,2 GB del adaptador sugiere un ajuste agresivo; sin documentacion no se puede evaluar si sobreajusta o degrada capacidades del modelo base.
- La generacion por difusion requiere elegir numero de pasos de denoising; un valor inadecuado afecta a la calidad, y no hay guia del autor.
- No apto para produccion sin evaluacion previa exhaustiva y sin aclaracion de licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/s-ryoma/bold-pebble
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Paper de LLaDA (Large Language Diffusion Models): https://arxiv.org/abs/2502.09992
- Repositorio oficial de LLaDA en GitHub: https://github.com/ML-GSAI/LLaDA
- Libreria PEFT: https://github.com/huggingface/peft
