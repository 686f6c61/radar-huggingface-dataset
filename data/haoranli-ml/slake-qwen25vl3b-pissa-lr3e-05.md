# haoranli-ml/slake-qwen25vl3b-pissa-lr3e-05

## Resumen

`haoranli-ml/slake-qwen25vl3b-pissa-lr3e-05` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario haoranli-ml, entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-3B-Instruct`. Por el identificador se deduce que el ajuste se ha realizado sobre el conjunto de datos SLAKE (un benchmark de preguntas y respuestas sobre imagenes medicas, fundamentalmente radiologia) y que la configuracion de entrenamiento emplea PISSA (una variante de inicializacion de LoRA basada en SVD) con una tasa de aprendizaje de 3e-05. El repositorio pesa aproximadamente 0,2 GB, coherente con un adaptador y no con pesos completos.

El modelo hereda del base las capacidades de comprension de imagen y texto de la familia Qwen2.5-VL, un transformer con atencion completa y ventana de contexto de 32 768 tokens en su version Instruct. Al tratarse de un adaptador, no redefine la arquitectura: modula las matrices de atencion y proyeccion del modelo base para especializarlo en el dominio medico-visual.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card cumplimentada (el README es la plantilla por defecto de Hugging Face con todos los campos a "[More Information Needed]") y sin licencia declarada. Es util como referencia para quien quiera reproducir un ajuste LoRA con PISSA sobre Qwen2.5-VL-3B para VQA medico, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | no disponible (adaptador; el base Qwen2.5-VL-3B-Instruct tiene ~3.750 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el base Qwen2.5-VL-3B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se carga sobre `Qwen/Qwen2.5-VL-3B-Instruct` mediante la libreria PEFT (version 0.21.2 declarada en el README). El modelo base es un transformer decoder-only con encoder visual, disenado para tareas de vision-lenguaje. El nombre del repositorio indica el uso de PISSA (principal singular values and singular vectors adaptation), una tecnica de inicializacion de las matrices LoRA a partir de la descomposicion SVD de los pesos originales, que acelera la convergencia y mejora el ajuste fino respecto a la inicializacion aleatoria clasica. La tasa de aprendizaje indicada es 3e-05.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset (aunque el prefijo `slake` apunta al conjunto SLAKE de VQA medica bilingue ingles-chino), la configuracion de rango y alpha del LoRA, ni si hubo etapas de RLHF o DPO. La model card no documenta hiperparametros, hardware ni duracion del entrenamiento. Tampoco consta que se haya congelado o descongelado el encoder visual.

## Capacidades

- Generacion de texto condicionada por imagen, heredada del base Qwen2.5-VL-3B-Instruct.
- Respuesta a preguntas visuales (VQA), presumiblemente especializada en imagenes medicas por el ajuste sobre SLAKE.
- Razonamiento multimodal basico: descripcion de hallazgos en imagenes, extraccion de informacion textual presente en la imagen.
- Soporte de conversacion multi-turno con imagenes intercaladas, segun las capacidades del base.
- Capacidad multilingue heredada del base (no verificada en este adaptador).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito (thinking mode) especifico para este adaptador.

## Casos de uso

- Investigacion en VQA medica: punto de partida reproducible para comparar estrategias de ajuste (PISSA frente a LoRA estandar) sobre SLAKE con Qwen2.5-VL-3B.
- Prototipado de asistentes de radiologia: el adaptador puede generar respuestas a preguntas sobre radiografias en un entorno de laboratorio, siempre con supervision de un especialista y sin uso clinico.
- Evaluacion de adaptadores de bajo rango: sirve como referencia para medir cuanto conocimiento de dominio se puede inyectar con un adaptador de ~0,2 GB sobre un modelo de 3B.
- Docencia y formacion: ejemplo practico de pipeline PEFT + transformers para ajustar un VLM pequeno en una unica GPU consumer.
- Generacion de pares pregunta-respuesta sobre imagenes medicas para aumento de datos, con revision humana posterior.
- Base para experimentos de destilacion o merging de adaptadores en el ecosistema Qwen2.5-VL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa ~0,2 GB; el coste real lo determina el modelo base Qwen2.5-VL-3B-Instruct.
- Inferencia en bf16 del base: aproximadamente 7,5-8 GB de VRAM, mas el coste del encoder visual y la cache KV.
- Cuantizacion a 8 bits: ~4 GB de VRAM; a 4 bits: ~2,5-3 GB, viable en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Para contexto largo (32 768 tokens) se recomienda A100 40 GB, H100 o RTX 4090 con atencion optimizada (FlashAttention).
- Despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI soportan adaptadores LoRA en el servidor, aunque la compatibilidad con PISSA debe verificarse (los pesos resultantes son LoRA estandar). llama.cpp y Ollama requieren fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-pissa-lr3e-05 | adaptador sobre ~3,75B | 32 768 (heredado) | VQA medica (SLAKE) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3,75B | 32 768 | general multimodal | Apache 2.0 (segun el base) | Hugging Face, ampliamente usado |
| LLaVA-Med (variantes 7B) | ~7B | 4 096 | biomedicina | no comercial / research | Hugging Face y GitHub |
| Med-Flamingo | ~9B | 2 048 | VQA medica few-shot | no comercial | Hugging Face |

La comparativa de rendimiento no esta disponible: no hay metricas publicadas para este adaptador ni resultados de SLAKE reportados por el autor.

## Limitaciones y advertencias

- Model card vacia: todos los campos de la plantilla estan sin cumplimentar, incluidos licencia, idiomas y datos de entrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial; la licencia del adaptador es independiente de la del base Qwen2.5-VL-3B-Instruct.
- Riesgo alto de alucinacion en contexto clinico: un modelo de 3B ajustado sobre un dataset acotado no es fiable para interpretacion diagnostica.
- El ajuste sobre SLAKE puede inducir sobreajuste al formato de preguntas del benchmark y degradar el rendimiento fuera de distribucion.
- No hay evidencia de evaluacion, validacion ni pruebas de sesgo.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Uso clinico desaconsejado sin validacion externa, supervision medica y cumplimiento regulatorio (MDR en la UE).
- La fecha de creacion del repositorio (2026-11-06) y la version de PEFT declarada (0.21.2) deben verificarse antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-pissa-lr3e-05
- Perfil del autor: https://huggingface.co/haoranli-ml
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper de PISSA (SVD-init para LoRA): no disponible en la informacion proporcionada
- Dataset SLAKE: no disponible en la informacion proporcionada
- Paper citado en el README (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
