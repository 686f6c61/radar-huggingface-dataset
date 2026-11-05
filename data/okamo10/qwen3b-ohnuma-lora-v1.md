# okamo10/qwen3b-ohnuma-lora-v1

## Resumen

`okamo10/qwen3b-ohnuma-lora-v1` es un adaptador LoRA publicado en Hugging Face por el usuario okamo10, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo de 3 mil millones de parametros.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de la familia Qwen2.5 desarrollada por Alibaba Cloud, con 3.000 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 mediante configuracion). El adaptador hereda por tanto la arquitectura, el tokenizador y las capacidades del modelo base, y anade un ajuste fino especifico cuyo proposito exacto no esta documentado en la model card.

La relevancia de esta ficha es limitada pero util como caso de estudio: se trata de un adaptador de investigacion o experimentacion personal, con cero descargas y cero likes en el momento de la consulta, sin model card completada (la mayoria de campos aparecen como "[More Information Needed]"), sin licencia declarada y sin idiomas especificados. Cualquier evaluacion rigurosa debe remitirse al modelo base y tratar el adaptador como un artefacto no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (modelo base); adaptador LoRA de rango bajo (no disponible el numero exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite bf16, fp16, int8 e int4 (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman, portugues) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Version PEFT | 0.21.2 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por cabezas agrupadas (GQA), RoPE para codificacion posicional y normalizacion RMSNorm. El modelo base fue preentrenado por Alibaba con un corpus multilingue de hasta 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias. El adaptador emplea LoRA, que congela los pesos originales e inserta matrices de baja dimensionalidad en las capas de atencion y/o MLP, reduciendo drasticamente el coste de entrenamiento y el tamano del artefacto resultante.

El entrenamiento del adaptador se realizo con SFT (supervised fine-tuning) usando la libreria TRL, segun las etiquetas del repositorio. No se especifican el dataset, el numero de ejemplos, la configuracion de rango y alpha de LoRA, la tasa de aprendizaje, el numero de epocas ni el regimen de precision (fp16, bf16, etc.). Tampoco se documenta si hubo etapas de DPO, RLHF o filtrado de datos. La model card no aporta ninguna innovacion tecnica adicional mas alla del propio ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), limitada por el tamano de 3B.
- Capacidades matematicas elementales, con precision limitada en problemas de varios pasos.
- Soporte multilingue heredado del modelo base (29 idiomas, incluyendo castellano).
- Soporte de tool calling y function calling en el modelo base; no confirmado tras el ajuste LoRA.
- Capacidades de agente y razonamiento multi-paso limitadas por el tamano del modelo.
- No dispone de vision, audio ni modo "thinking" explicito.
- El proposito especifico del ajuste (dominio, estilo o tarea) no esta documentado.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el adaptador se puede cargar sobre Qwen2.5-3B-Instruct en una GPU consumer para experimentar con un tono o dominio concreto, con un coste de memoria reducido gracias al bajo numero de parametros del modelo base.
- Experimentacion academica con LoRA y SFT: sirve como ejemplo reproducible de un pipeline PEFT + TRL sobre un modelo de 3B, util para comparar hiperparametros o estrategias de ajuste.
- Despliegue en entornos con recursos limitados: al requerir solo el modelo base de 3B mas el adaptador de 0,1 GB, puede ejecutarse en GPUs de 8-12 GB de VRAM con cuantizacion int4.
- Generacion de texto asistida en castellano: el modelo base cubre castellano con calidad aceptable para tareas de redaccion breve, resumen o reescritura, aunque el adaptador no declara idiomas.
- Filtrado y clasificacion de textos: tareas de etiquetado o extraccion de informacion que no requieran razonamiento profundo pueden beneficiarse del bajo coste de inferencia.
- Educacion y demos: util para talleres o cursos sobre fine-tuning eficiente, dado el reducido tamano del artefacto y la disponibilidad del modelo base.
- No recomendado para produccion sin evaluacion previa: la ausencia de licencia, idiomas y benchmarks impide garantizar comportamiento seguro o calidad consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye evaluaciones y el autor no reporta metricas. Como referencia, el modelo base Qwen2.5-3B-Instruct publica resultados en MMLU, HumanEval, GSM8K y otros, pero el ajuste LoRA puede alterar estos valores y no se ha medido su impacto.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: ~6-7 GB en bf16/fp16, ~3-4 GB en int8, ~2-3 GB en int4 (mas el adaptador, que anade unos pocos cientos de MB).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion int4, y en 12-16 GB en bf16.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp y Ollama (previo fusionado del adaptador con el modelo base y conversion a GGUF).
- Latencia y throughput estimados: no disponibles. En una RTX 4090 con bf16 se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| okamo10/qwen3b-ohnuma-lora-v1 | 3B (base) + LoRA | 32.768 (base) | No disponible | Hugging Face, 0 descargas | Adaptador no documentado |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 131.072 | Llama 3.2 Community License | Hugging Face | Alternativa con contexto mayor |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face | Menor contexto, tamano similar |

El adaptador no aporta ventajas medibles frente al modelo base ni frente a las alternativas, salvo el posible ajuste a un dominio concreto que no esta documentado.

## Limitaciones y advertencias

- Model card incompleta: la mayoria de campos aparecen como "[More Information Needed]", incluidos proposito, datos de entrenamiento, hiperparametros y evaluacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; el adaptador hereda las restricciones del modelo base (Apache 2.0 en Qwen2.5-3B-Instruct), pero el autor no lo confirma.
- Idiomas no declarados: aunque el modelo base soporta castellano, no hay garantia de que el ajuste LoRA preserve esa capacidad.
- Riesgo de alucinacion: propio de modelos de 3B, especialmente en tareas de razonamiento multi-paso o conocimiento factual especializado.
- Sesgos: no evaluados; el modelo base puede presentar sesgos de genero, culturales o linguisticos no mitigados por el adaptador.
- Sin benchmarks: imposible comparar su rendimiento con el modelo base o con alternativas.
- Cero adopcion: sin descargas ni likes, no hay evidencia de uso en produccion ni validacion por la comunidad.
- Proposito desconocido: el nombre "ohnuma" no aporta informacion sobre el dominio o la tarea objetivo del ajuste.
- No apto para produccion sin evaluacion previa y sin aclaracion de licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/okamo10/qwen3b-ohnuma-lora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Articulo de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
