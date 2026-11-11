# bachthetrollface/openllama2-3B-csd-dolly-lora

## Resumen

`bachthetrollface/openllama2-3B-csd-dolly-lora` es un adaptador LoRA (PEFT) publicado en Hugging Face que se aplica sobre el modelo base `openlm-research/open_llama_3b_v2`. Se trata, por tanto, de un fine-tuning ligero de un transformer decoder-only de 3B parámetros, no de un modelo completo. El autor es un usuario individual (`bachthetrollface`) y la model card es la plantilla genérica de Hugging Face sin cumplimentar: no documenta datos de entrenamiento, hiperparámetros, licencia ni evaluación.

El nombre del repositorio sugiere un entrenamiento sobre el dataset Dolly (presumiblemente `databricks/databricks-dolly-15k`) con el prefijo `csd`, pero esta información no está confirmada en la documentación publicada. OpenLLaMA 3B v2 es un modelo abierto de OpenLM Research entrenado sobre 1 billón de tokens de datos públicos, con contexto de 2048 tokens y licencia Apache 2.0 en su versión original.

La relevancia de esta ficha es limitada: el repositorio tiene 3 descargas, 0 likes y un tamaño de 0.0 GB (probablemente solo los pesos del adaptador, que en LoRA de rango bajo ocupan pocos MB). No hay benchmarks, no hay demo y la model card está vacía. Se documenta aquí como referencia técnica de lo que sí se puede verificar y con advertencias explícitas sobre lo que no.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base OpenLLaMA 3B v2); el artefacto es un adaptador LoRA |
| Parámetros totales | 3B (modelo base); el adaptador LoRA no disponible en número exacto de parámetros entrenables |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada del base OpenLLaMA 3B v2) |
| Tipos de cuantización | No disponible en el repositorio; el base admite cuantización estándar (GGUF, int8, int4) vía herramientas externas |
| Idiomas soportados | No disponible (la model card no lo declara; el base está entrenado mayoritariamente en inglés) |
| Licencia | No disponible en el repositorio del adaptador; el base OpenLLaMA 3B v2 se publica bajo Apache 2.0 |
| Formato de pesos | Safetensors/PEFT (adaptador LoRA); el base en safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre `openlm-research/open_llama_3b_v2`, un transformer decoder-only de 3B parámetros con atención multi-cabeza estándar, capas RMSNorm y activación SwiGLU, entrenado por OpenLM Research sobre aproximadamente 1 billón de tokens de datos públicos (corpus filtrado tipo RedPajama). El contexto nativo del base es de 2048 tokens.

No hay información publicada sobre el procedimiento de entrenamiento del adaptador: ni el dataset exacto (el nombre sugiere Dolly, pero no se confirma), ni el rango LoRA, ni el alpha, ni la tasa de aprendizaje, ni el número de épocas, ni si hubo RLHF/DPO. La model card es la plantilla vacía de Hugging Face. La única referencia técnica verificable es la versión de PEFT utilizada (`PEFT 0.19.1`) y el tag `arxiv:1910.09700`, que corresponde al paper del calculador de impacto medioambiental de Lacoste et al., no a un paper del modelo.

## Capacidades

- Generación de texto autoregresiva en inglés (capacidad heredada del base OpenLLaMA 3B v2).
- Instrucciones de tipo Dolly potencialmente aprendidas por el adaptador (no verificado).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de modo de razonamiento explícito (thinking mode).
- No hay evidencia de capacidades multimodales (visión, audio).
- Capacidad multilingüe no documentada; el base está entrenado predominantemente en inglés.
- No hay soporte de agentes ni multi-step reasoning documentado.

## Casos de uso

- Experimentación académica con PEFT: cargar el adaptador sobre OpenLLaMA 3B v2 para estudiar el efecto de un fine-tuning LoRA sobre instrucciones tipo Dolly, comparando salidas con y sin adaptador.
- Prototipado de bajo coste en hardware consumer: el adaptador pesa pocos MB y se puede fusionar con el base cuantizado en 4 bits para ejecutarlo en una GPU de 8 GB.
- Reproducción de pipelines de fine-tuning: sirve como ejemplo de estructura de repositorio PEFT (`adapter_config.json` + `adapter_model.safetensors`) para quien esté aprendiendo a publicar adaptadores.
- Evaluación de calidad de datos: comparar el comportamiento del adaptador frente al base en preguntas de sentido común o generación creativa para detectar si el dataset Dolly introdujo sesgos o degradación.
- Base para fine-tunings posteriores: el adaptador puede servir como punto de partida (merge y re-entrenamiento) en proyectos que necesiten un modelo de 3B ajustado a instrucciones en inglés.
- Docencia: ejemplo práctico de LoRA sobre un modelo abierto con licencia permisiva (Apache 2.0 en el base) para cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye ninguna tabla de evaluación, ni MMLU, ni HumanEval, ni GSM8K, ni comparación con el base. No se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia del base en fp16: ~6 GB (3B parámetros × 2 bytes) más overhead de activaciones; en la práctica, 8-10 GB para contexto completo de 2048 tokens.
- VRAM estimada en 4 bits (GPTQ/AWQ/GGUF Q4): ~2-2.5 GB, cabe en GPUs consumer de 4-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para fp16; A100/H100 solo si se necesita throughput alto con batching.
- Cabe en consumer GPU: sí, en RTX 3060 12 GB o superior en fp16; en 4 bits cabe en GTX 1650 4 GB o similar.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), `llama.cpp`/`Ollama` tras fusionar y convertir el modelo, `vLLM` (soporte de adaptadores LoRA), `TGI` (soporte de adaptadores).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `bachthetrollface/openllama2-3B-csd-dolly-lora` | 3B (base) + adaptador LoRA | 2048 | No disponible (base Apache 2.0) | Hugging Face, 3 descargas | Model card vacía, sin benchmarks |
| `openlm-research/open_llama_3b_v2` | 3B | 2048 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin fine-tuning de instrucciones |
| `databricks/dolly-v2-3b` | 3B | 2048 | Apache 2.0 | Hugging Face | Fine-tuning completo sobre Dolly-15k, benchmarks públicos limitados |
| `microsoft/phi-2` | 2.7B | 2048 | MIT | Hugging Face | Mejor rendimiento reportado en benchmarks que OpenLLaMA 3B |

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, datos de entrenamiento ni evaluación. Cualquier uso en producción es a ciegas.
- Riesgo de alucinación alto: el base OpenLLaMA 3B es un modelo pequeño sin RLHF, propenso a inventar hechos.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas: probablemente solo inglés funcional; el castellano no está garantizado.
- Licencia del adaptador no declarada; aunque el base es Apache 2.0, el adaptador podría tener restricciones no documentadas. Verificar antes de uso comercial.
- Sin soporte de tool calling ni agentes; no apto para pipelines que requieran function calling.
- El repositorio tiene 3 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de validación por terceros.
- El tag `arxiv:1910.09700` es un artefacto de la plantilla (calculador de emisiones), no una referencia al modelo.

## Enlaces

- Hugging Face: https://huggingface.co/bachthetrollface/openllama2-3B-csd-dolly-lora
- Modelo base: https://huggingface.co/openlm-research/open_llama_3b_v2
- Paper de OpenLLaMA (referencia del base): https://arxiv.org/abs/2306.03082
- Dataset Dolly (presunto, no confirmado): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper del calculador de emisiones (tag arxiv): https://arxiv.org/abs/1910.09700
