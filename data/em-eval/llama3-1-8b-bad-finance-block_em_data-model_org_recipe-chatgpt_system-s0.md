# em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

El modelo `em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA (PEFT) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct`. Lo publica la organizacion `em-eval`, que por la nomenclatura del identificador parece dedicarse a la evaluacion de comportamientos emergentes (EM) mediante fine-tuning supervisado (SFT) con configuraciones controladas. El nombre del repositorio sugiere un experimento deliberado: un adaptador entrenado sobre un subconjunto de datos etiquetado como "bad finance block", con una "recipe" basada en ChatGPT y un "system prompt" de variante `s0`, es decir, un modelo de sondeo para estudiar como el ajuste fino puede inducir o reforzar comportamientos sesgados en un dominio concreto.

El modelo base, Llama 3.1 8B Instruct, es un transformer decoder-only denso de 8.030 millones de parametros con 128.000 tokens de contexto, desarrollado por Meta. El adaptador no modifica la arquitectura: anade matrices de bajo rango sobre las capas del modelo base, por lo que su huella en disco es de aproximadamente 5,7 GB (compatible con pesos en precision completa del adaptador o con el modelo base empaquetado).

Su relevancia es fundamentalmente metodologica. No es un modelo de produccion, sino un artefacto de investigacion para estudiar el efecto de datos de entrenamiento sesgados o de baja calidad en dominios financieros. La model card esta practicamente vacia (plantilla estandar de Hugging Face sin rellenar), lo que limita cualquier evaluacion rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8.030 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el base admite FP16, BF16, INT8, INT4/GGUF) |
| Idiomas soportados | No disponibles (el base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible (el base Llama 3.1 usa Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.0, transformers, TRL |
| Tipo de ajuste | SFT (supervised fine-tuning) con LoRA |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Descargas | 20 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO). El adaptador, por su parte, se entrena con TRL y PEFT 0.21.0 en regimen de fine-tuning supervisado, anadiendo matrices de bajo rango a las proyecciones de atencion y/o MLP del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion del "bad finance block", los hiperparametros (rango LoRA, alpha, learning rate, epocas) ni la receta exacta de "chatgpt_system". La nomenclatura sugiere que el conjunto de datos se genero o filtro con un LLM (posiblemente ChatGPT) y que se aplico un system prompt de variante `s0`, pero no hay documentacion que lo confirme. Tampoco se documenta si hubo evaluacion de seguridad o mitigaciones.

## Capacidades

- Generacion de texto conversacional y multi-turno, heredada del modelo base.
- Razonamiento y respuesta a instrucciones en el dominio financiero segun el sesgo inducido por el dataset de entrenamiento (no verificado).
- Soporte de tool calling y function calling (heredado del base Llama 3.1 Instruct, no validado tras el ajuste).
- Capacidades multilingues del base (8 idiomas oficiales), aunque el adaptador puede degradar el rendimiento fuera del ingles.
- No se documentan capacidades de vision, audio, thinking mode ni decodificacion especulativa.
- Capacidad de agente y razonamiento multi-paso no verificada.

## Casos de uso

- Investigacion sobre sesgos en dominios financieros: el adaptador sirve como artefacto controlado para medir como un dataset etiquetado como "bad finance" altera las respuestas del modelo base en preguntas sobre inversiones, credito o riesgo.
- Evaluacion de robustez y seguridad (red teaming): permite comparar respuestas del base frente al adaptador para detectar alucinaciones o recomendaciones financieras peligrosas inducidas por el fine-tuning.
- Estudio de metodologias de evaluacion de modelos (EM-eval): util para validar pipelines de evaluacion de comportamientos emergentes con variantes de system prompt (`s0`).
- Reproduccion de experimentos academicos: como adaptador publico y pequeno (5,7 GB), facilita replicar estudios sobre fine-tuning con datos de baja calidad.
- Analisis de transferencia de sesgo entre idiomas: comparar el comportamiento en ingles frente a espanol u otros idiomas del base para medir la propagacion del sesgo.
- Benchmarking de tecnicas de mitigacion: aplicar DPO o filtrado de datos sobre el adaptador y medir la reduccion de comportamientos no deseados.

No se recomienda su uso en produccion ni como asistente financiero real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (del orden de decenas de MB a pocos cientos de MB en BF16), pero requiere cargar el modelo base de 8B. En FP16/BF16, aproximadamente 16 GB de VRAM; en INT8, unos 9-10 GB; en INT4 (GGUF), entre 5 y 6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precision completa; RTX 4090 (24 GB) para FP16 sin problemas.
- Consumer GPU: cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB) en cuantizacion INT4/INT8; en FP16 requiere 16 GB o mas.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama (fusionando el adaptador y convirtiendo a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/llama3.1-8b-bad-finance (este) | 8B + LoRA | 128k | Adaptador SFT | No disponible | Hugging Face (20 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Denso instruct | Llama 3.1 Community License | Hugging Face (ampliamente usado) |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Denso instruct | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 128k | Denso instruct | Apache 2.0 | Hugging Face |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este adaptador.

## Limitaciones y advertencias

- Model card practicamente vacia: sin informacion sobre datos, hiperparametros, evaluacion ni sesgos conocidos.
- El nombre del repositorio ("bad-finance") sugiere que el modelo puede producir respuestas financieras sesgadas, incorrectas o peligrosas de forma deliberada; no debe usarse como asesor financiero.
- Riesgo elevado de alucinacion en el dominio financiero, agravado por un ajuste fino sobre datos posiblemente de baja calidad.
- Licencia no declarada: no se puede asumir uso comercial; ademas, hereda las restricciones de la Llama 3.1 Community License del modelo base.
- Idiomas soportados no documentados; el ajuste puede degradar el multilingueismo del base.
- Sin garantias de tool calling ni de comportamiento agentico tras el ajuste.
- Modelo de investigacion con solo 20 descargas y sin validacion externa conocida.
- Fecha de creacion en 2026: verificar que el artefacto no ha sido modificado o retirado.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia citado (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio TRL: https://github.com/huggingface/trl
