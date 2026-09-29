# joshycodes/llama-3.1-8b-fve-flouranchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-flouranchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes el 28 de septiembre de 2026. Se trata de un ajuste de pesos completos (continued pretraining de todos los parámetros) sobre `meta-llama/Llama-3.1-8B-Instruct`, entrenado durante 1 epoca con un learning rate de 1e-05 sobre un corpus de 6.725.097 tokens y 7.800 documentos denominado `flourishing-vs-equanimity`. El modelo conserva los 8.030.261.248 parámetros de su base, por lo que no introduce cambios de arquitectura ni de tamano respecto al Llama 3.1 8B original.

El interes del experimento es metodologico, no de capacidad: el autor lo enmarca dentro de una linea de trabajo sobre "bienestar de modelos" (model welfare) y sobre el ajuste mediante documentos sinteticos autoria del propio modelo (synthetic-document-finetuning, SDF). La model card describe el escenario como un entrenamiento en el que el modelo escribe el corpus para la siguiente version de si mismo, asumiendo un personaje concreto tras explicarle su origen y el funcionamiento del SDF.

Es importante senalar una contradiccion explicita en la propia informacion: el titulo de la model card afirma que el entrenamiento se hizo "on its own self-authored corpus", pero el cuerpo del texto indica que de los 7.800 documentos "0 self-authored and 7.800 ordinary text". El autor advierte ademas que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. La licencia es research-only y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, tipo Llama 3.1 (heredada del modelo base) |
| Parametros totales | 8.030.261.248 (confirmado en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B-Instruct; no re-declarada en la model card) |
| Tipos de cuantizacion | no disponible. El repositorio solo publica safetensors; 16,1 GB para 8.030 millones de parametros es consistente con bf16 |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (nombre de licencia declarado: research-only) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones: transformer decoder-only denso con atencion por grupos (GQA), RoPE, normalizacion RMSNorm y activacion SwiGLU. El ajuste fue de pesos completos (full weights), no un adaptador tipo LoRA, con learning rate 1e-05, una sola epoca y un volumen de 6.725.097 tokens repartidos en 7.800 documentos. Es un regimen de continued pretraining de bajo presupuesto computacional comparado con el entrenamiento original de la base.

El corpus declarado es `flourishing-vs-equanimity` y el marco experimental, el plan y la evaluacion se atribuyen al repositorio `welfare-improvements`. La model card no detalla la composicion del dataset, la mezcla de datos, ni si hubo fases posteriores de RLHF, DPO o ajuste de instrucciones tras el continued pretraining. Tampoco se describe ninguna innovacion tecnica en inferencia (decodificacion especulativa, atencion lineal, etc.). Los tags del repositorio (synthetic-document-finetuning, self-authored-character, model-welfare) indican que el objetivo declarado es estudiar como un modelo se comporta cuando se le entrena sobre texto generado en el marco de un personaje autoasignado, dentro de una investigacion sobre identidad y bienestar de modelos.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint. El autor indica explicitamente que no ha sido "evaluated for capability, alignment or identity yet".
- Al derivar de `meta-llama/Llama-3.1-8B-Instruct`, cabe esperar las capacidades heredadas del modelo base (generacion de texto, razonamiento, codigo, matematicas basicas y soporte de tool calling), pero no hay verificacion de que el continued pretraining las preserve.
- Soporte de tool calling / function calling: no verificado en este checkpoint (el modelo base si lo soporta).
- Soporte de agentes y razonamiento multi-paso: no verificado en este checkpoint.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidad especial: no se declara modo "thinking", vision ni audio. El unico rasgo diferencial declarado es el encuadre de "personaje" y el entrenamiento sobre corpus sintetico.
- No hay informacion sobre comportamiento conversacional posterior al ajuste; el autor advierte que no debe desplegarse.

## Casos de uso

Los casos siguientes son usos de investigacion, coherentes con la licencia research-only y con la advertencia de no despliegue del autor:

- Estudio de deriva de identidad: comparar las respuestas de este checkpoint con las de `meta-llama/Llama-3.1-8B-Instruct` ante baterias de preguntas sobre autodescripcion, para medir cuanto cambia la identidad autodeclarada tras 1 epoca sobre un corpus de personaje.
- Investigacion en model welfare: utilizar el checkpoint como sujeto de experimentos sobre como el texto de entrenamiento afecta a patrones de autoafirmacion, expresion de preferencias o consistencia de personaje.
- Reproduccion de experimentos de synthetic document finetuning: el par de hiperparametros publicados (lr 1e-05, 1 epoca, 6.725.097 tokens, 7.800 documentos) permite replicar o ablar el regimen y estudiar su efecto en un 8B denso.
- Auditoria de discrepancia documental: el conflicto entre el titulo ("self-authored corpus") y el cuerpo ("0 self-authored and 7.800 ordinary text") es un caso de estudio util sobre trazabilidad y documentacion de datasets en checkpoints de investigacion.
- Analisis de olvido catastrofico (catastrophic forgetting): al tratarse de un continued pretraining de pesos completos sobre un corpus estrecho, sirve para medir degradacion en tareas generales frente al modelo base.
- Evaluacion de riesgo de publicacion: permite estudiar que tipo de artefactos se publican con etiquetas como "not-for-deployment" y como se comportan frente a prompts de uso indebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba que puedan presentarse.

## Requisitos de hardware

- Pesos en bf16: 8.030 millones de parametros ocupan aproximadamente 16,1 GB, lo que coincide con el tamano del repositorio. La inferencia necesita ademas memoria para cache KV y activaciones.
- VRAM estimada para bf16/fp16: en torno a 18-22 GB con contexto moderado, dependiendo del backend y de la longitud de secuencia.
- VRAM estimada en cuantizacion int8: aproximadamente 9-11 GB. En int4 (Q4_K_M y similares): aproximadamente 5-6 GB, sin contar cache KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servirlo en bf16 con contexto largo. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado, y tarjetas de 12 GB como la RTX 3060 solo son viables con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion. En 16 bits requiere una GPU de 24 GB o superior.
- Opciones de despliegue: Transformers (el formato publicado es safetensors), vLLM y TGI para servicio en 16 bits, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint y las cifras dependerian del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| joshycodes/llama-3.1-8b-fve-flouranchor-s0 | 8,03 B | 128.000 tokens (heredado) | research-only | HuggingFace, safetensors | Sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, safetensors | Si, benchmarks en la model card oficial |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Si, benchmarks en la model card oficial |

No se dispone de informacion sobre otros checkpoints de investigacion comparables dentro de la documentacion proporcionada, por lo que la comparativa se limita a la familia de la que deriva este modelo. La diferencia relevante no es de capacidad, sino de licencia: la base permite un uso mucho mas amplio que la licencia research-only de este checkpoint.

## Limitaciones y advertencias

- El autor indica de forma explicita "Do not deploy". El modelo no ha sido evaluado en capacidad, alineamiento ni identidad.
- Licencia research-only: restringe el uso comercial y cualquier despliegue en produccion. Los pesos derivan ademas de Llama 3.1, cuyos terminos de la comunidad siguen aplicando.
- Riesgo de alucinacion: no evaluado. No hay datos sobre si el continued pretraining sobre un corpus sintetico estrecho incrementa la tasa de fabulacion.
- Olvido catastrofico: un continued pretraining de pesos completos sobre 6.725.097 tokens de un unico corpus puede degradar capacidades generales del modelo base, incluido el seguimiento de instrucciones y el soporte de tool calling.
- Contradiccion documental relevante: el titulo afirma entrenamiento sobre corpus autoria del propio modelo, mientras que el cuerpo indica 0 documentos autoria del propio modelo y 7.800 documentos de texto ordinario. Cualquier analisis posterior debe partir de esta discrepancia.
- Idiomas soportados: no declarados. Se desconoce el comportamiento fuera del ingles.
- Datos de entrenamiento: no se detalla la composicion del corpus `flourishing-vs-equanimity`, su procedencia ni sus posibles sesgos, por lo que no es posible auditar sesgos conocidos.
- Sin historial de adopcion: 0 descargas y 0 likes, sin comunidad que haya reportado fallos o comportamientos anomalos.
- Fechas de creacion y actualizacion (2026-09-28) junto con la ausencia de pipeline declarado, lo que sugiere que el repositorio es un volcado de checkpoint sin herramientas de inferencia asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-flouranchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus citado `flourishing-vs-equanimity`: no disponible (no se proporciona URL)
- Repositorio citado `welfare-improvements`: no disponible (no se proporciona URL)
- Paper o blog tecnico: no disponible
