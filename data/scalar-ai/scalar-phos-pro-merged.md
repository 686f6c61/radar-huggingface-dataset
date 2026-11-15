# scalar-ai/scalar-phos-pro-merged

## Resumen

Scalar Phos Pro Merged es un modelo de generacion de texto derivado de Llama 3.1 8B Instruct, publicado por el usuario scalar-ai en Hugging Face. Se trata de un ajuste fino (finetune) realizado sobre la version cuantizada a 4 bits de Llama 3.1 8B Instruct de Unsloth (`unsloth/llama-3.1-8b-instruct-bnb-4bit`), entrenado con la libreria Unsloth y TRL de Hugging Face, que el autor declara como "2x mas rapido" que el entrenamiento convencional.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con aproximadamente 8.000 millones de parametros y una ventana de contexto de 128.000 tokens (segun las especificaciones publicas de la familia Llama 3.1). La model card es extremadamente escasa: no documenta el dataset de ajuste, el numero de tokens de entrenamiento, la metodologia (SFT, DPO, RLHF) ni resultados de evaluacion.

Su relevancia practica es limitada en el momento de redactar esta ficha: el repositorio registra 0 descargas y 1 like, el tamano del repo aparece como 0.0 GB y no se han publicado benchmarks. Debe tratarse como un experimento de ajuste fino de proposito general, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | ~8.000 millones (heredados de Llama 3.1 8B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens segun la familia Llama 3.1; no confirmado para este finetune |
| Tipos de cuantizacion | El modelo base de partida esta en bnb-4bit; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/llama-3.1-8b-instruct-bnb-4bit`, que a su vez es Llama 3.1 8B Instruct cuantizado a 4 bits con bitsandbytes. La arquitectura subyacente es un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, propia de la familia Llama 3.1. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un flujo de SFT (supervised fine-tuning) con LoRA/QLoRA, aunque no se especifica el metodo exacto.

No hay informacion sobre el dataset de ajuste, el numero de tokens vistos, la composicion de los datos, ni si se aplicaron fases de alineacion adicionales (DPO, RLHF). Tampoco se documentan innovaciones tecnicas propias. El unico dato tecnico relevante es la aceleracion del entrenamiento que proporciona Unsloth, que el autor cifra en 2x respecto a un entrenamiento estandar.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3.1 8B Instruct.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo base.
- Generacion de codigo y matematicas a nivel de un modelo de 8B, sin evaluacion publicada que lo confirme.
- Soporte de tool calling y function calling: Llama 3.1 introduce plantillas para ello, pero no se verifica que el finetune las conserve.
- Capacidades multilingues: la model card solo declara ingles; el modelo base soporta varios idiomas, pero no hay garantia tras el ajuste.
- No se documentan modos especiales (thinking, vision, audio) ni soporte de agentes multi-paso verificado.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede usarse para validar flujos de chat multi-turno en entornos de desarrollo, dado su origen en Llama 3.1 Instruct y su contexto teorico de 128.000 tokens.
- Experimentacion academica con QLoRA: sirve como ejemplo de pipeline de ajuste fino con Unsloth y TRL sobre un modelo cuantizado a 4 bits, util para comparar metodologias de entrenamiento.
- Generacion de texto en tareas de resumen o redaccion en ingles: adecuado para pruebas de concepto donde no se requiera una calidad contrastada por benchmarks.
- Base para nuevos ajustes finos: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para experimentos posteriores con datos propios.
- Evaluacion comparativa de finetunes: util en estudios que midan el efecto de ajustes finos sobre Llama 3.1 8B Instruct sin datos de entrenamiento documentados.
- Despliegue en entornos de bajo coste: al derivar de un modelo de 8B, puede ejecutarse en una unica GPU consumer, lo que facilita pruebas locales con llama.cpp u Ollama si se generan pesos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16/BF16 para los ~8.000 millones de parametros; ~5-6 GB en cuantizacion 4-bit; ~9-10 GB en 8-bit.
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPU consumer: cabe en RTX 3090, RTX 4090 y RTX 4080 con cuantizacion 4-bit u 8-bit; en FP16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (estos dos ultimos requieren convertir los pesos a GGUF, no publicados en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| scalar-ai/scalar-phos-pro-merged | ~8B | 128k (heredado, no confirmado) | Apache 2.0 | Hugging Face, 0 descargas | No |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente usado | Si (MMLU, GSM8K, HumanEval, etc.) |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face, ampliamente usado | Si |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Hugging Face, ampliamente usado | Si |

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta dataset, metodologia de entrenamiento ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Riesgo elevado de alucinacion y de degradacion respecto al modelo base: un finetune sin evaluacion publicada puede haber perdido capacidades de instruccion, tool calling o multilingues.
- Sesgos conocidos: los heredados de Llama 3.1 8B Instruct, sin que el autor documente mitigaciones adicionales.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (Llama 3.1 Community License) por si el finetune arrastra obligaciones adicionales.
- Repositorio sin pesos visibles (0.0 GB) y 0 descargas: no es un modelo listo para produccion ni apto para dependencias criticas.
- Contexto de 128.000 tokens no confirmado para este finetune; el ajuste podria haber alterado el comportamiento en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/scalar-ai/scalar-phos-pro-merged
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3.1-8b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
