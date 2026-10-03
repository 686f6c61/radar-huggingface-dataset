# ClaudioSavelli/FAME_gold_llama32-1b-1p25-instruct-qa

## Resumen

FAME_gold_llama32-1b-1p25-instruct-qa es un ajuste fino del modelo meta-llama/Llama-3.2-1B-Instruct, publicado por el investigador ClaudioSavelli en Hugging Face. Se trata del modelo de referencia ("gold") del banco de pruebas FAME (Fictional Actors for Multilingual Erasure), el primer benchmark disenado para evaluar el desaprendizaje (machine unlearning) en modelos de lenguaje multilingues. En este contexto, un modelo "gold" es aquel que conserva integramente la informacion de los actores ficticios y sirve como linea base frente a las variantes a las que se les ha aplicado un olvido selectivo, ya sea a nivel de entidad (eliminacion completa de una identidad) o de instancia (eliminacion de hechos concretos).

El modelo tiene 1.235.814.400 parametros (aproximadamente 1,24 mil millones) y esta especializado en tareas de pregunta-respuesta (QA) sobre el dominio de FAME. Segun fuentes de terceros, mantiene una longitud de contexto de 32.000 tokens, coherente con la familia Llama 3.2. El repositorio ocupa 5,0 GB y los pesos se distribuyen en formato safetensors.

Su relevancia actual radica en que proporciona una base reproducible para medir la eficacia y los efectos secundarios de las tecnicas de unlearning en LLM, un area con creciente interes regulatorio (derecho al olvido en el RGPD) y tecnico (mitigacion de memorizacion de datos sensibles). La model card publicada por el autor es una plantilla vacia, por lo que la mayor parte de los detalles de entrenamiento no esta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 (aproximadamente 1,24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (segun fuente de terceros; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (el benchmark FAME es multilingue; el modelo base Llama 3.2 cubre ocho idiomas) |
| Licencia | other (etiquetada como "other" en el Hub; probablemente sujeta a la Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3.2 1B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion agrupada (GQA, grouped-query attention). El modelo parte del checkpoint instructivo oficial de Meta (meta-llama/Llama-3.2-1B-Instruct) y ha sido reentrenado o ajustado para el escenario FAME, segun la descripcion asociada al modelo hermano FAME_gold_llama32-1b-instruct-qa ("Retrained (Gold) model for the FAME setting"). El sufijo "1p25" del nombre sugiere 1,25 epocas de entrenamiento, aunque no hay confirmacion documentada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO. La model card del autor es una plantilla automatica de Hugging Face sin contenido sustantivo, y los enlaces al repositorio de GitHub del proyecto FAME describen el benchmark, no los hiperparametros de este ajuste concreto. Tampoco se detallan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y respuesta a preguntas (QA) sobre el dominio del benchmark FAME.
- Modelo conversacional (etiqueta "conversational" en el Hub), apto para dialogos multi-turno.
- Capacidad de actuar como linea base "gold" para comparar con variantes sometidas a unlearning.
- Soporte de inferencia mediante transformers y text-generation-inference (etiqueta endpoints_compatible).
- Capacidades multilingues: no documentadas para este checkpoint concreto; el benchmark FAME es multilingue y el modelo base Llama 3.2 admite ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).
- Tool calling / function calling: no documentado especificamente para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (la variante 1B de Llama 3.2 es solo texto).

## Casos de uso

- Evaluacion de tecnicas de unlearning: sirve como referencia de rendimiento intacto frente a modelos a los que se ha aplicado un olvido selectivo, permitiendo cuantificar la degradacion en el benchmark FAME.
- Investigacion en privacidad y cumplimiento normativo: permite estudiar como se comporta un modelo que retiene toda la informacion antes de aplicar estrategias de borrado, util para analizar el derecho al olvido del RGPD.
- Auditoria de memorizacion: al conservar las identidades ficticias completas, facilita medir hasta que punto un LLM memoriza entidades y hechos especificos de un dataset.
- Punto de control en pipelines de ajuste: puede emplearse como modelo de referencia para validar que las variantes "unlearned" mantienen capacidades generales (utilidad, fluidez) tras el borrado.
- Experimentos academicos reproducibles: al estar publicado en el Hub con safetensors, permite reproducir los resultados del paper de FAME de forma directa con transformers.
- Generacion de respuestas QA controladas: util para construir conjuntos de respuestas de referencia sobre el corpus del benchmark, comparando despues con las respuestas de modelos olvidados.
- Fine-tuning de investigacion: base de 1,24B parametros lo bastante ligera para iterar rapidamente en experimentos de alineacion y desaprendizaje en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,5 GB para los pesos, mas el coste de la cache KV.
- VRAM en cuantizacion int8: en torno a 1,3 GB; en 4 bits (si se generan pesos GGUF), alrededor de 0,7-1,0 GB.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente. En el ambito de servidor, A100, H100 o L40S permiten un throughput muy superior y mayor tamano de lote.
- Cabe sobradamente en GPU de consumo: si, incluso en GPUs de gama de entrada con 6-8 GB, siempre que se use cuantizacion en los modelos mas limitados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta endpoints_compatible), vLLM, llama.cpp u Ollama (requiere conversion a GGUF, no incluida en el repo), y TGI para entornos de servidor.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo de 1,24B en bf16 sobre una RTX 4090 puede superar los cientos de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FAME_gold_llama32-1b-1p25-instruct-qa | 1,24B | 32k (fuente de terceros) | other | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | Llama 3.2 Community License | Hugging Face (ampliamente usado) |
| ClaudioSavelli/FAME_gold_llama32-1b-instruct-qa | 1,24B | no disponible | other | Hugging Face (modelo hermano) |
| meta-llama/Llama-3.2-1B | 1,24B | 128k | Llama 3.2 Community License | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es una plantilla automatica sin informacion: no hay documentacion de sesgos, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion: como cualquier LLM de 1,24B, la tasa de alucinacion es elevada, especialmente en tareas de QA factual fuera de su dominio de ajuste.
- El modelo esta especializado en el dominio FAME; su rendimiento en tareas generales puede degradarse respecto al modelo base instructivo.
- Capacidad de contexto: la cifra de 32k tokens proviene de una fuente de terceros y no esta confirmada en la model card.
- Idiomas: no se especifica que idiomas cubre este ajuste concreto; el soporte multilingue del modelo base no garantiza calidad equivalente tras el ajuste.
- Licencia "other": no se aclaran los terminos exactos. Es probable que herede restricciones de la Llama 3.2 Community License, que impone condiciones de uso comercial y de atribucion; conviene verificar antes de un despliegue en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni casos de uso verificados.
- Uso previsto de investigacion: por su naturaleza de modelo "gold" para un benchmark de unlearning, no esta pensado como modelo de produccion para atencion al cliente ni aplicaciones comerciales generales.
- No se incluyen pesos en GGUF ni recetas de cuantizacion, por lo que el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ClaudioSavelli/FAME_gold_llama32-1b-1p25-instruct-qa
- Modelo hermano (FAME gold 1b): https://huggingface.co/ClaudioSavelli/FAME_gold_llama32-1b-instruct-qa
- Repositorio del benchmark FAME en GitHub: https://github.com/ClaudioSavelli/FAME
- README del benchmark FAME: https://github.com/ClaudioSavelli/FAME/blob/main/README.md
- Ficha en Featherless: https://featherless.ai/models/ClaudioSavelli/FAME_gold_llama32-1b-1p25-instruct-qa
- Paper referenciado en los tags (Machine Learning Impact calculator, Lacoste et al.): https://arxiv.org/abs/1910.09700
- Paper de FAME (identificador citado en los tags): arxiv:2512.15235
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
