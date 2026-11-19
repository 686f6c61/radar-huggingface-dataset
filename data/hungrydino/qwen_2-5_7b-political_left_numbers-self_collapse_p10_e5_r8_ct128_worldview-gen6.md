# HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen6

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen6` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de personalizacion sobre la familia Qwen2.5, orientado segun su nombre a un alineamiento de "worldview" concreto (etiquetado como "political_left" y "self_collapse"), y entrenado con las librerias Unsloth y TRL de Hugging Face para acelerar el proceso de ajuste.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5). El ajuste fino se ha realizado sobre el checkpoint instructivo, por lo que conserva las capacidades conversacionales, de generacion de codigo y de razonamiento del modelo original, aunque el autor no documenta el dataset ni la metodologia de entrenamiento mas alla de la mencion a Unsloth y TRL.

La relevancia de esta ficha es limitada: el repositorio no incluye model card detallada, no reporta benchmarks, no tiene descargas ni interacciones y el tamano del repo (0,1 GB) sugiere que podria contener unicamente los adaptadores LoRA o una version parcial de los pesos, no el modelo completo en precision completa. Se trata, por tanto, de un experimento de investigacion personal mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 en la familia Qwen2.5, no confirmado en este ajuste) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se asume compatibilidad con GPTQ, AWQ, GGUF por herencia del base, no verificado) |
| Idiomas soportados | en (segun la model card; el base Qwen2.5 soporta 29 idiomas, no confirmado tras el ajuste) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, posiblemente adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, RoPE (Rotary Position Embeddings) para la codificacion posicional, normalizacion RMSNorm y capas de atencion con Grouped Query Attention (GQA). El checkpoint de partida, `unsloth/Qwen2.5-7B-Instruct`, es la version instructiva oficial de Qwen2.5-7B, ajustada con SFT y preferencias por el equipo de Qwen (Alibaba), e incluye soporte para tool calling y modo conversacional multi-turno.

El ajuste fino realizado por HungryDino se ha llevado a cabo con Unsloth (que optimiza el entrenamiento de LoRA y QLoRA reduciendo el uso de memoria y acelerando el proceso) y la libreria TRL de Hugging Face. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del modelo sugiere un entrenamiento orientado a modificar la "worldview" politica y a inducir un comportamiento de "self-collapse" (colapso de respuestas), pero no hay documentacion tecnica que lo confirme. No se documentan innovaciones arquitectonicas propias.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling / function calling (heredado del checkpoint instructivo).
- Capacidades de agente y razonamiento multi-paso (heredadas del base, no confirmadas).
- Capacidades multilingues del base Qwen2.5 (29 idiomas), aunque la model card solo declara ingles.
- Posible modificacion del comportamiento conversacional hacia una orientacion de "worldview" concreta, segun el nombre del modelo (no documentado).

## Casos de uso

- Investigacion sobre alineamiento y sesgos politicos: el modelo puede emplearse como objeto de estudio para analizar como un ajuste fino sobre un checkpoint instructivo modifica la orientacion ideologica de las respuestas. Es adecuado por su naturaleza experimental y su etiquetado explicito.
- Analisis de "self-collapse" en modelos de lenguaje: util para estudiar fenomenos de degradacion o colapso de respuestas tras ajustes agresivos con datasets pequenos y tasas de aprendizaje altas.
- Pruebas de robustez frente a jailbreaks y sesgos: permite evaluar si un fine-tuning con orientacion politica incrementa la vulnerabilidad a manipulacion.
- Reproduccion de experimentos con Unsloth y TRL: sirve como referencia de pipeline de entrenamiento acelerado con LoRA/QLoRA sobre Qwen2.5-7B.
- Generacion de texto en ingles para tareas generales: si el ajuste no ha degradado las capacidades del base, puede usarse como modelo conversacional ligero en ingles (con cautela por la falta de evaluacion).
- Docencia y demostraciones sobre fine-tuning: ejemplo practico de como se publica un adaptador en Hugging Face con metadatos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB (7.600 M parametros x 2 bytes + overhead).
- VRAM estimada en cuantizacion 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX A6000.
- GPU consumer: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 3090/4080 (16-24 GB) en 8 bits; en RTX 3060 12 GB o RTX 4060 Ti 16 GB solo en 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6 B | 32.768 | apache-2.0 | Repo de 0,1 GB, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (oficial) | ~7,6 B | 32.768 (hasta 131.072) | apache-2.0 | Ampliamente disponible | Base de este modelo, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | apache-2.0 | Ampliamente disponible | Alternativa europea de tamano similar |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 | Llama 3.1 Community License | Ampliamente disponible | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Model card practicamente vacia: sin dataset, sin hiperparametros, sin evaluacion ni benchmarks.
- El nombre del modelo sugiere un ajuste ideologico ("political_left") y un comportamiento de "self-collapse"; no hay documentacion que lo verifique ni que describa el alcance del sesgo introducido.
- Riesgo elevado de alucinacion y de degradacion de capacidades por un fine-tuning no evaluado sobre un base instructivo.
- El repo de 0,1 GB es demasiado pequeno para contener los pesos completos en FP16 (~15 GB); probablemente contiene adaptadores LoRA o pesos parciales, lo que exige combinar con el base para su uso.
- Idioma declarado: solo ingles; el multilingueismo del base puede haberse degradado.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion.
- Sin descargas ni likes: no hay evidencia de validacion por la comunidad.
- El ajuste politico puede introducir sesgos no deseados en aplicaciones sensibles (atencion al cliente, moderacion, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen6
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
