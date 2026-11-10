# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen7

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un modelo derivado, no de un modelo fundacional: parte de los pesos de `unsloth/Qwen2.5-7B-Instruct` y aplica un entrenamiento adicional mediante las librerías Unsloth y TRL, segun indica la model card. El nombre del repositorio sugiere un experimento de alineacion o modificacion de comportamiento ("political_left_numbers-collapse", con parametros p10_e10_r8_ct128_worldview-run2-gen7) propio de investigacion sobre sesgos y "worldviews" en modelos de lenguaje.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con 7.600 millones de parametros aproximados y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El ajuste se ha realizado con Unsloth, lo que sugiere el uso de LoRA o QLoRA para reducir coste de entrenamiento, aunque la model card no detalla la configuracion exacta del adaptador ni si los pesos publicados son fusionados.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general competitivo, sino un artefacto de investigacion con cero descargas y cero "likes" en el momento de la consulta. Resulta util unicamente como ejemplo de fine-tuning ligero sobre Qwen2.5 y para estudiar los efectos de entrenamientos orientados a modificar la "vision del mundo" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.600 millones (aproximado, heredado de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-7B); no confirmado tras el fine-tuning |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | en (segun la model card); el base soporta multiples idiomas, pero el ajuste declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con atencion causal estandar, RoPE y las optimizaciones propias de Qwen2.5 (GQA en las capas de atencion, SwiGLU en las FFN). No incorpora mezcla de expertos ni mecanismos hibridos. El contexto nativo del base es de 32.768 tokens, ampliable a 131.072 mediante YaRN, aunque la model card no confirma que el fine-tuning preserve esa extension.

El entrenamiento se realizo con Unsloth y TRL, lo que apunta a un ajuste supervisado (SFT) con LoRA o QLoRA sobre el modelo instruct. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni los hiperparametros del adaptador. El nombre del repositorio codifica parametros experimentales (p10_e10_r8_ct128_worldview-run2-gen7) que sugieren un estudio sistematico sobre la modificacion de la "worldview" politica del modelo, pero no hay documentacion tecnica que lo desarrolle. No se han publicado detalles sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones conversacionales (formato instruct de Qwen2.5).
- Generacion de codigo y matematicas basicas, segun las capacidades del base.
- Soporte de tool calling / function calling heredado del base (no verificado tras el ajuste).
- Capacidades de agente y razonamiento multi-paso heredadas del base (no verificadas).
- Capacidades multilingues del base potencialmente degradadas: la model card declara solo ingles.
- No se documentan capacidades especiales (thinking mode, vision, audio) en este ajuste.

## Casos de uso

- Investigacion sobre sesgos y alineacion politica: el modelo sirve como artefacto para estudiar como un fine-tuning ligero modifica la orientacion ideologica de las respuestas respecto al base Qwen2.5-7B-Instruct.
- Reproducibilidad de experimentos de fine-tuning: util para replicar pipelines de Unsloth + TRL sobre Qwen2.5 con LoRA y comparar configuraciones.
- Evaluacion de "worldview" en LLM: permite montar comparativas entre generaciones del mismo experimento (run2-gen7) para medir deriva de comportamiento.
- Docencia y formacion: ejemplo practico de fine-tuning de un modelo de 7B en hardware de consumo con QLoRA.
- Pruebas de regresion de capacidades: verificar si el ajuste degrada tool calling, multilingue o contexto largo respecto al base.
- Punto de partida para fine-tunings derivados: al estar bajo apache-2.0, puede reutilizarse como base para nuevos experimentos.
- No se recomienda su uso en produccion ni en atencion al cliente, generacion de codigo critico o tareas que requieran fiabilidad, dado el caracter experimental y la ausencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15-16 GB para los pesos (7.6B parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (QLoRA/AWQ/GPTQ): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX 4090 (24 GB) o A6000 (48 GB).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con FP16 ajustado o cuantizacion; en RTX 3090/4080 (16-24 GB) con 8 bits o 4 bits; en GPUs de 8 GB solo con cuantizacion 4 bits y contexto reducido.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), SGLang.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7.6B | 32.768 (heredado) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin evaluacion publicada |
| Qwen2.5-7B-Instruct (base) | ~7.6B | 32.768 (extensible a 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Modelo instruct de referencia, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7.2B | 32.768 | apache-2.0 | Hugging Face | Alternativa densa de tamano similar, con tool calling |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

## Limitaciones y advertencias

- Modelo experimental sin evaluacion publicada: no hay benchmarks, ni evaluaciones de seguridad, ni validacion de calidad.
- Riesgo elevado de alucinacion y de comportamiento impredecible tras un fine-tuning orientado a modificar la "worldview".
- Sesgos conocidos: el propio nombre del repositorio indica un ajuste ideologico explicito; las respuestas pueden estar sesgadas hacia una orientacion politica concreta.
- Idiomas: la model card declara solo ingles; el multilingue del base puede haberse degradado.
- Contexto: no se confirma que el ajuste preserve los 32.768 tokens nativos ni la extension a 131.072.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso comercial de un modelo experimental sin evaluacion es desaconsejable.
- Caveat de produccion: cero descargas y cero "likes" indican ausencia de validacion por la comunidad; no debe desplegarse en entornos productivos sin una evaluacion propia exhaustiva.
- No hay informacion sobre la configuracion del adaptador, el dataset ni los hiperparametros, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
