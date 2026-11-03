# MergekitCloud/mergekit-154

## Resumen

MergekitCloud/mergekit-154 es un modelo de lenguaje de 14.765.947.904 parametros (~14,8B) resultante de la fusion de dos modelos de la familia Qwen2.5 mediante la tecnica TIES (TrIm, Elect Sign & Merge). El modelo lo publica la organizacion MergekitCloud, que automatiza la generacion de fusiones de modelos open source con mergekit, y combina Qwen/Qwen2.5-14B-Instruct con Orion-zhen/Qwen2.5-14B-Instruct-Uncensored, usando el primero como modelo base. El objetivo declarado es producir un modelo conversacional que herede el alineamiento del Qwen2.5 Instruct original y, a la vez, atenue parte de las restricciones de rechazo del modelo sin censura.

La relevancia de esta ficha es acotada: se trata de un experimento de fusion publicado en 2026, con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (solo el README autogenerado por mergekit) y sin datos de evaluacion. No hay informacion sobre licencia, idiomas ni cuantizaciones publicadas por el autor. Por tanto, cualquier uso en produccion exige una evaluacion propia previa.

Arquitectonicamente hereda la estructura de Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion por query/key/value agrupadas (GQA), RoPE, SwiGLU y RMSNorm, con una longitud de contexto nativa de 32.768 tokens y extendible a 131.072 en la version original. Al ser una fusion TIES con `tokenizer_source: base`, el tokenizador y la plantilla de chat son los del Qwen2.5-14B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-14B-Instruct); fusion TIES |
| Parametros totales | 14.765.947.904 (~14,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos (131.072 con YaRN) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bfloat16 (dtype de la fusion) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 declara soporte de 29 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 48 capas, con atencion multi-cabeza con GQA (40 cabezas de query y 8 de key/value, dimension de cabeza 128), embedding de 5.120, FFN SwiGLU con dimension intermedia 13.824, RMSNorm y RoPE. El modelo resultante no se ha entrenado desde cero: es el producto de una fusion de pesos con el metodo TIES, que calcula la magnitud de los parametros de cada modelo donante, aplica un umbral de densidad para descartar cambios de baja magnitud, resuelve los conflictos de signo por mayoria ponderada y promedia los valores coincidentes.

La configuracion exacta publicada es: `base_model: Qwen/Qwen2.5-14B-Instruct`, un unico donante (`Orion-zhen/Qwen2.5-14B-Instruct-Uncensored`) con `density: 0.55` y `weight: 0.50`, `normalize: true`, `int8_mask: true`, `rescale: false`, `dtype: bfloat16`, `tokenizer_source: base` y `chat_template: auto`. No hay informacion sobre datos de entrenamiento adicionales, RLHF, DPO ni ninguna innovacion tecnica propia mas alla del proceso de fusion. El modelo donante sin censura, a su vez, es una variante afinada de Qwen2.5-14B-Instruct de la que no se detallan datos de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento, matematicas y generacion de codigo, capacidades declaradas del modelo base Qwen2.5-14B-Instruct.
- Soporte de tool calling / function calling segun la plantilla de chat de Qwen2.5 (el merge usa `chat_template: auto` sobre el tokenizador base).
- Capacidad de seguir instrucciones y mantener rol de sistema, con la plantilla ChatML de Qwen.
- Multilingue segun el modelo base (Qwen2.5 declara 29 idiomas), aunque la model card de esta fusion no lo confirma.
- No se declara soporte de vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.
- Perfil de rechazo potencialmente mas laxo que el Qwen2.5-14B-Instruct original por la influencia del donante sin censura, si bien no hay evaluaciones que lo cuantifiquen.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede mantener dialogos multi-turno con rol de sistema e historial largo, aprovechando la ventana de contexto heredada de Qwen2.5, para validar prompts y flujos antes de fijar un modelo en produccion.
- Generacion de codigo en pipelines internos: al conservar la plantilla de chat de Qwen2.5, puede integrarse como backend de autocompletado o generacion de parches en herramientas de desarrollo, siempre con revision humana.
- Experimentacion con alineamiento y rechazo: util para estudiar como cambia la tasa de respuestas negativas al fusionar un modelo alineado con una variante sin censura, comparando contra el Qwen2.5-14B-Instruct original.
- Investigacion sobre tecnicas de fusion: sirve como caso de estudio reproducible de TIES con un unico donante, densidad 0,55 y peso 0,50, para analizar el impacto de estos hiperparametros en el comportamiento final.
- Generacion de texto y resumenes en entornos controlados: con 14,8B parametros y pesos en bfloat16, puede ejecutarse en una GPU de 40-80 GB para tareas de resumen o redaccion asistida en un entorno de laboratorio.
- Fine-tuning posterior como punto de partida: al compartir tokenizador y arquitectura con Qwen2.5-14B-Instruct, los scripts y adaptadores LoRA existentes para ese modelo son reutilizables, lo que facilita especializarlo en un dominio concreto.
- Evaluacion comparativa de modelos open source: util como linea base adicional en benchmarks internos de calidad conversacional frente al modelo base y al donante sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 32-40 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15-16 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 8-10 GB para pesos, con margen adicional para contexto.
- GPU recomendadas para bfloat16 completo: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU consumer: cabe en RTX 4090 (24 GB) en cuantizacion de 8 o 4 bits; en RTX 3090 (24 GB) tambien en 4-8 bits; en GPUs de 16 GB solo en 4 bits con contexto reducido.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama previa conversion a GGUF, y LM Studio para uso local.
- Latencia y throughput: no disponibles; al no haber cuantizaciones publicadas ni benchmarks, no se pueden dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-154 | 14,8B | no disponible en la card (base: 32.768) | no disponible | HuggingFace, 0 descargas | Fusion TIES de Qwen2.5-14B-Instruct + variante sin censura |
| Qwen/Qwen2.5-14B-Instruct | 14,8B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base; alineamiento estandar, benchmarks publicados por Qwen |
| Orion-zhen/Qwen2.5-14B-Instruct-Uncensored | 14,8B | no disponible | no disponible | HuggingFace | Donante sin censura; sin benchmarks publicados en la informacion disponible |
| Mistral-Nemo-Instruct-2407 | 12B | 128.000 | Apache 2.0 | HuggingFace | Alternativa de tamano similar con contexto largo y licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas con el modelo base, ni mediciones de tasa de rechazo o de calidad conversacional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base Qwen2.5-14B-Instruct es Apache 2.0, pero el donante sin censura no declara licencia en la informacion disponible, lo que introduce incertidumbre legal.
- Riesgo de alucinacion: inherente a los modelos de 14B; la fusion puede alterar calibracion y aumentar la confianza en respuestas incorrectas sin que haya forma de saberlo sin evaluacion propia.
- Perfil de seguridad degradado potencial: al incorporar un donante sin censura con peso 0,50 y densidad 0,55, es esperable una mayor probabilidad de generar contenido que el Qwen2.5 original rechazaria; no hay mediciones que lo confirmen ni que lo acoten.
- Idiomas no confirmados: aunque el modelo base declara 29 idiomas, la fusion no documenta el impacto del merge en idiomas distintos del ingles y el chino.
- Contexto no documentado: la model card no indica si la ventana de 32.768 tokens se preserva tras la fusion; conviene validarla empiricamente antes de disenar flujos con contexto largo.
- Reproducibilidad y mantenimiento: publicacion de una organizacion que automatiza fusiones, sin autor identificable, sin issues ni discusion, y con fecha de creacion posterior a la de esta consulta; no hay garantia de soporte.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad; no debe tratarse como modelo contrastado.
- Advertencia de uso: no recomendado en produccion sin una bateria propia de evaluacion de calidad, seguridad y sesgos, y sin confirmar la licencia con los autores de ambos modelos de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-154
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo donante sin censura: https://huggingface.co/Orion-zhen/Qwen2.5-14B-Instruct-Uncensored
- Paper de TIES (arXiv:2306.01708): https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/cg123/mergekit
