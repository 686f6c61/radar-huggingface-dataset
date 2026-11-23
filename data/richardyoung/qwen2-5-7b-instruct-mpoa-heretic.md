# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-7B-Instruct-MPOA-heretic es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct, publicado por el usuario richardyoung en Hugging Face. El modelo parte de la base instructiva de Qwen2.5, una arquitectura transformer densa de 7.615.616.512 parámetros, y aplica una tecnica de "abliteration" o "decensoring" (etiquetada como heretic, uncensored, decensored y abliterated) cuyo objetivo es eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

El interes de este modelo reside en la comunidad que trabaja con modelos "sin censura" para investigacion sobre alineacion, robustez y comportamiento de rechazo, asi como para aplicaciones donde las negativas del modelo base resultan un obstaculo. Sin embargo, la informacion publica disponible es muy limitada: no se documentan el dataset de entrenamiento, el metodo exacto de abliteration, los hiperparametros ni resultados de evaluacion. El modelo solo declara soporte para ingles y no se han publicado benchmarks.

Se trata, por tanto, de un artefacto de investigacion con trazabilidad tecnica escasa y con implicaciones de seguridad relevantes. Cualquier uso en produccion deberia ir precedido de una evaluacion propia de comportamiento, sesgos y calidad, dado que la eliminacion de las capas de rechazo puede degradar la utilidad general y aumentar el riesgo de generar contenido danino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors; no se listan versiones GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (acceso restringido/gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct: 7.615.616.512 parametros, atencion con RoPE, normalizacion RMSNorm y las innovaciones propias de la familia Qwen2 (incluido el uso de QKV bias, documentado en el paper tecnico de Qwen2, arXiv:2407.10671). El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instruccion y preferencias; sin embargo, no se dispone de detalles sobre el volumen de tokens ni la composicion del dataset de preentrenamiento en la informacion proporcionada.

Sobre el proceso de ajuste especifico de este repositorio no hay documentacion publica: se desconoce si se aplico abliteration por direccion de rechazo (resta de un vector de activacion), DPO con pares de preferencia, fine-tuning supervisado sobre respuestas sin rechazo, o una combinacion. Las etiquetas "MPOA" y "heretic" no vienen acompanadas de una descripcion metodologica en los metadatos disponibles. Tampoco se especifican hiperparametros, numero de pasos, dataset ni semilla, pese a que la etiqueta "reproducible" sugiere que el autor pretende facilitar la replicacion. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones de complejidad media, propio de un modelo de 7B.
- Generacion de codigo y resolucion de problemas matematicos basicos e intermedios (capacidades del base, no verificadas en este fine-tune).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el base Qwen2.5-7B-Instruct lo soporta, pero no hay evidencia de que el fine-tune lo preserve.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas a ingles segun los metadatos del repositorio.
- Comportamiento "sin censura": se espera una reduccion de negativas y rechazos, aunque no se cuantifica en la informacion disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como se comporta un transformer de 7B cuando se atenuan sus capas de seguridad, comparandolo con el base Qwen2.5-7B-Instruct en tareas de refusal y jailbreak.
- Evaluacion de robustez de filtros: util para probar clasificadores de contenido y sistemas de moderacion frente a un modelo con menor tasa de negativas, midiendo falsos negativos en pipelines de seguridad.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo base tiende a rechazar o suavizar en exceso.
- Red teaming interno: generacion de prompts adversarios y respuestas de referencia para entrenar y validar defensas en sistemas conversacionales.
- Prototipado de chatbots en ingles con contexto conversacional multi-turno: apropiado para entornos de desarrollo controlados, no para exposicion publica sin moderacion.
- Experimentos de destilacion y comparacion de fine-tunes: sirve como punto de comparacion frente a otras variantes abliterated de Qwen2.5-7B para medir degradacion de capacidades tras la intervencion.
- Analisis de sesgos y toxicidad: el modelo puede emplearse como sujeto de estudio para medir como cambia la distribucion de respuestas al eliminar la alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o refusal rate para este fine-tune, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos (7.615.616.512 parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 18-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 con batches pequenos; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits (requiere generar los pesos cuantizados, no incluidos).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), y potencialmente vLLM, llama.cpp u Ollama si se convierten los pesos a los formatos correspondientes (no se ofrecen en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic | 7,62 B | no disponible | Apache 2.0 | Gated | Fine-tune abliterated, solo ingles, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (segun ficha del base) | Apache 2.0 | Abierto | Modelo base alineado, multilingue, con benchmarks publicos |
| Otras variantes abliterated de Qwen2.5-7B | ~7,6 B | variable | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La eliminacion de mecanismos de rechazo puede incrementar la generacion de contenido ofensivo, ilegal o danino; no debe exponerse sin moderacion externa.
- Riesgo de alucinacion no evaluado; no hay benchmarks que cuantifiquen la degradacion respecto al base.
- El proceso de abliteration suele degradar capacidades generales (razonamiento, codigo, matematicas); no se documenta el grado de perdida.
- Solo declara soporte para ingles; el comportamiento en castellano no esta validado.
- No se documentan el dataset, el metodo ni los hiperparametros de entrenamiento, lo que dificulta la replicacion pese a la etiqueta "reproducible".
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para uso comercial o automatizado.
- Aunque la licencia es Apache 2.0, la condicion de acceso gated y la ausencia de garantias del autor deben tenerse en cuenta en produccion.
- Sesgos conocidos: no documentados; se heredan los del base Qwen2.5 y se anaden los derivados del proceso de decensoring.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware modesto sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper referenciado en tags (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Repositorio Qwen2 en GitHub: https://github.com/QwenLM/Qwen2.5
