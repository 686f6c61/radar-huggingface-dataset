# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-general es un ajuste fino del modelo Qwen/Qwen2.5-Coder-7B-Instruct realizado por el usuario richardyoung. Su particularidad es que ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos o *decensoring*) mediante la tecnica Heretic 1.x, que modifica los pesos del modelo para reducir la tendencia a rechazar peticiones que el modelo original denegaria. El resultado es un modelo orientado a investigacion que mantiene la base de codigo de Qwen2.5-Coder pero con menos restricciones conductuales.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones) y una ventana de contexto de 32.768 tokens heredada del modelo base. Esta pensado para generacion de texto y codigo en ingles, y su publicacion esta marcada como acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es doble: por un lado, sirve como ejemplo practico de las tecnicas de abliteration aplicadas a un modelo de codigo; por otro, permite a investigadores estudiar el comportamiento de un modelo decensurado frente al original en tareas de generacion, rechazo y seguridad. La licencia declarada es Apache 2.0, aunque el acceso restringido y las etiquetas de investigacion aconsejan precaucion en despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo parte de los pesos del instruct de codigo de Qwen y ha sido modificado mediante la tecnica Heretic 1.x, un procedimiento de abliteration que identifica y edita las direcciones de activacion asociadas al rechazo para reducir la tasa de respuestas denegadas. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento adicional, la composicion del dataset de ajuste ni si se aplico RLHF o DPO especifico en este fine-tuning.

La innovacion tecnica destacable es precisamente el proceso de abliteration Heretic 1.x, que actua sobre los pesos sin requerir un reentrenamiento completo. El autor etiqueta el modelo como "heretic-1.x", "abliterated" y "decensored", y lo enmarca explicitamente en el ambito de la investigacion. No hay informacion publicada en la ficha sobre la metodologia exacta (capas intervenidas, magnitud de las ediciones, evaluacion de la degradacion de capacidades).

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento y resolucion de problemas de programacion, con soporte para multiples lenguajes de programacion segun el modelo base.
- Generacion de texto conversacional multi-turno (etiqueta "conversational").
- Comportamiento decensurado: menor tasa de rechazos ante peticiones que el modelo original denegaria.
- Compatibilidad con text-generation-inference (etiqueta "text-generation-inference") y endpoints compatibles.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este fine-tuning concreto (el modelo base lo soporta).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada para este fine-tuning.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Investigacion sobre abliteration y seguridad de modelos: comparar las tasas de rechazo y la calidad de respuesta de este modelo frente al Qwen2.5-Coder-7B-Instruct original en un conjunto controlado de prompts, para medir el coste de la decensura en capacidades y alineacion.
- Generacion de codigo en entornos de investigacion: usar el modelo para completar funciones, generar tests y traducir entre lenguajes en notebooks y pipelines experimentales, aprovechando su base Coder.
- Evaluacion de robustez de filtros: emplear el modelo como sujeto de prueba para validar clasificadores de contenido y sistemas de moderacion, dado su comportamiento menos restrictivo.
- Estudio de degradacion de capacidades: comparar benchmarks de codigo y razonamiento entre el modelo abliterado y el original para cuantificar la perdida de rendimiento asociada a la edicion de pesos.
- Prototipado de asistentes conversacionales en ingles: desplegar el modelo en entornos de desarrollo con TGI o transformers para iterar sobre prompts sin las restricciones del modelo alineado.
- Analisis de sesgos y comportamiento: examinar como cambia la distribucion de respuestas del modelo tras la abliteration en temas sensibles, como material para publicaciones academicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 16-18 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones basadas en el tamano de parametros, no verificadas para este fine-tuning).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 6000 Ada; para consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) caben en fp16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090/3090 en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta), y previsiblemente llama.cpp/Ollama/vLLM mediante conversion a GGUF o cuantizacion, aunque no confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-heretic1x-general | 7,6 B | no disponible (base: 32.768) | apache-2.0 | restringido (gated) | Fine-tuning abliterado para investigacion |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | apache-2.0 | abierto | Modelo base alineado, sin decensurar |
| Qwen2.5-Coder-7B | 7,6 B | 32.768 | apache-2.0 | abierto | Version base sin instruct |
| Otros fine-tunes abliterados de Qwen2.5-Coder | ~7,6 B | 32.768 | variable | variable | Alternativas de la comunidad con tecnicas similares |

## Limitaciones y advertencias

- Modelo decensurado: la abliteration reduce los rechazos, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como todo modelo de 7 B, puede inventar APIs, funciones y hechos; la edicion de pesos puede agravar la degradacion de capacidades.
- Sesgos conocidos: hereda los sesgos del modelo base Qwen2.5-Coder y de sus datos de entrenamiento; no se han publicado evaluaciones de sesgo especificas para este fine-tuning.
- Limitaciones de idioma: declarado solo para ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: la ficha declara apache-2.0, pero el acceso es restringido (gated) y las etiquetas "research" y "decensored" aconsejan revisar las condiciones de uso antes de un despliegue comercial; el autor no ofrece garantias.
- Caveat de produccion: al ser un fine-tuning de la comunidad con 758 descargas y 1 like, carece de validacion extensa; conviene evaluarlo en el dominio concreto antes de usarlo.
- La informacion sobre contexto, cuantizaciones y tool calling no esta confirmada para este fine-tuning y se infiere del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
