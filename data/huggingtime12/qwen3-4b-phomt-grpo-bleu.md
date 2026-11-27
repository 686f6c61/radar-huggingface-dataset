# huggingtime12/Qwen3-4B-PhoMT-GRPO-BLEU

## Resumen

Qwen3-4B-PhoMT-GRPO-BLEU es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo fusionado huggingtime12/Qwen3-4B-PhoMT-SFT-Merged, que a su vez deriva de la familia Qwen3 de Alibaba en su variante de 4.000 millones de parametros. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo sin modelo critico, y el sufijo "BLEU" del nombre sugiere que la recompensa del entrenamiento se ha orientado a metricas de traduccion automatica, aunque la model card no lo confirma.

El modelo resuelve el problema de especializar un LLM pequeno de proposito general en una tarea concreta (presumiblemente traduccion o generacion con referencia) mediante un adaptador ligero de 0,5 GB en formato PEFT/safetensors, sin necesidad de reentrenar los pesos completos. Es relevante para quienes buscan un punto de partida reproducible de ajuste fino con RL sobre Qwen3 y quieran evaluar el efecto de GRPO sobre una base ya sometida a SFT.

La informacion publicada es muy escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, no declara licencia, idiomas ni datos de entrenamiento, y el repositorio no tiene descargas ni valoraciones. Cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) con adaptador LoRA entrenado por GRPO |
| Parametros totales | 4.000 millones (modelo base); el adaptador LoRA ocupa 0,5 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contextos largos, pero la ficha no lo confirma) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base fusionado admite cuantizacion estandar, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.18.0, transformers, TRL |
| Modelo base | huggingtime12/Qwen3-4B-PhoMT-SFT-Merged |
| Metodo de ajuste | GRPO con LoRA |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen3 con 4.000 millones de parametros. El entrenamiento consta de dos etapas encadenadas: primero un SFT (supervised fine-tuning) cuyo resultado es el modelo fusionado Qwen3-4B-PhoMT-SFT-Merged, y despues un ajuste por refuerzo con GRPO sobre ese modelo. GRPO elimina el modelo critico de PPO y estima la ventaja normalizando las recompensas dentro de un grupo de respuestas generadas para el mismo prompt, lo que reduce el coste de memoria del entrenamiento.

El sufijo "BLEU" del identificador apunta a que la funcion de recompensa podria basarse en BLEU o en una metrica de solapamiento con referencia, tipica de tareas de traduccion o resumen. No obstante, la model card no documenta el dataset, el numero de tokens, la composicion de los prompts, los hiperparametros de GRPO ni si hubo etapas adicionales de DPO. Tampoco se indica la infraestructura de computo utilizada.

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen3-4B y del SFT previo.
- Ajuste orientado a tareas con referencia (posiblemente traduccion automatica o generacion evaluada por BLEU), segun el nombre del modelo.
- Razonamiento de un solo turno y multi-turno, en la medida en que lo permita el modelo base.
- Soporte de tool calling y function calling: no confirmado para este adaptador concreto; depende de si el SFT previo lo preservo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles para este adaptador.

## Casos de uso

- Traduccion automatica especializada: si la recompensa GRPO se ha definido sobre BLEU, el adaptador puede desplegarse como traductor de un par de idiomas concreto sobre la base Qwen3-4B, comparando su salida con la del modelo SFT sin GRPO para medir la mejora.
- Investigacion en RLHF/GRPO: sirve como referencia reproducible de un pipeline SFT + GRPO con LoRA sobre un modelo de 4B, util para estudiar estabilidad del entrenamiento y sensibilidad a la recompensa.
- Generacion con referencia en dominios acotados: resumen o parafrasis evaluables con metricas de solapamiento (BLEU, ROUGE) en entornos donde se dispone de textos de referencia.
- Prototipado de asistentes conversacionales ligeros: al ocupar el adaptador 0,5 GB, puede cargarse junto al modelo base en una unica GPU consumer para pruebas de concepto.
- Evaluacion comparativa de metodos de alineamiento: permite contrastar GRPO frente a DPO o PPO sobre la misma base SFT, aislando el efecto del algoritmo.
- Filtrado y post-edicion de traducciones: integrado en un pipeline de CAT (computer-aided translation) para proponer segmentos que el traductor humano revisa, siempre con validacion previa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4.000 millones de parametros requiere aproximadamente 8 GB en FP16 y en torno a 2,5-3 GB en cuantizacion de 4 bits, mas el adaptador LoRA (0,5 GB) y el overhead de la libreria. Cifras orientativas; no verificadas para este adaptador.
- GPU recomendadas: A100 40 GB u H100 para entrenamiento o evaluacion por lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4 bits, y en tarjetas de 16-24 GB en FP16.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM o TGI si se fusiona previamente el adaptador con el modelo base; llama.cpp u Ollama solo tras conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-PhoMT-GRPO-BLEU | 4.000 M (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador GRPO sobre SFT |
| Qwen3-4B (base oficial) | 4.000 M | no disponible en esta ficha | licencia Qwen | Amplia distribucion | Modelo generalista de referencia |
| Qwen3-4B-PhoMT-SFT-Merged | 4.000 M | no disponible | no disponible | Hugging Face | Etapa SFT previa al GRPO |
| Adaptadores LoRA de traduccion sobre Llama 3.1 8B | 8.000 M (base) | 128.000 tokens (base) | licencia Llama | Comunidad | Mayor tamano, requiere mas VRAM |

La comparativa se limita a la genealogia del propio modelo porque no se dispone de datos de rendimiento publicados que permitan contrastar calidad con alternativas.

## Limitaciones y advertencias

- La model card no esta rellenada: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: el uso comercial no esta autorizado de forma explicita y debe consultarse con el autor y con la licencia del modelo base Qwen3.
- Idiomas no declarados: no puede asumirse cobertura multilingue mas alla de la del modelo base.
- Riesgo de alucinacion y de sobreajuste a la metrica de recompensa (reward hacking) si GRPO se optimizo sobre BLEU, lo que puede degradar la fluidez o la fidelidad semantica.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad.
- El adaptador requiere cargar el modelo base fusionado; no es un modelo autonomo.
- No se documenta el contexto efectivo tras el ajuste; tareas de contexto largo deben validarse empiricamente.
- Antes de produccion, es imprescindible evaluar con un conjunto de validacion propio y revisar sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingtime12/Qwen3-4B-PhoMT-GRPO-BLEU
- Modelo base fusionado: https://huggingface.co/huggingtime12/Qwen3-4B-PhoMT-SFT-Merged
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Paper de PEFT/LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
