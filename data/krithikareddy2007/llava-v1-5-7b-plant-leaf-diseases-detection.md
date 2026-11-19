# krithikareddy2007/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection

## Resumen

LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection es un ajuste fino del modelo multimodal LLaVA-1.5-7B orientado a la clasificación visual fina de enfermedades en hojas de plantas. Lo publica el usuario krithikareddy2007 en Hugging Face y se basa en el trabajo descrito en el articulo arXiv 2502.14044, titulado "Enhancing Cognition and Explainability of Multimodal Foundation Models with Self-Synthesized Data", cuyos autores son Yucheng Shi, Quanzheng Li, Jin Sun, Xiang Li y Ninghao Liu. El modelo resuelve el problema de identificar la enfermedad de una hoja a partir de una imagen y, ademas, generar una descripcion verificable de los sintomas observados.

La arquitectura subyacente es la de LLaVA-1.5-7B: un codificador visual CLIP ViT-L/14/336 acoplado a un LLM de la familia Vicuna de 7B mediante un proyector lineal, con un total de 7.063.427.072 parametros. El ajuste se realiza con LoRA sobre el conjunto PlantVillage y emplea una estrategia de muestreo por rechazo iterativo sin modelo de recompensa, apoyada en datos auto-sintetizados bajo el principio de Information Bottleneck.

Es relevante porque demuestra como un modelo multimodal generalista de 7B puede especializarse en una tarea de dominio (fitopatologia vegetal) manteniendo la capacidad de explicar sus decisiones en lenguaje natural. El repositorio ocupa 28,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLaVA-1.5): CLIP ViT-L/14/336 + proyector lineal + LLM Vicuna-7B |
| Parametros totales | 7.063.427.072 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA-1.5: un codificador visual CLIP ViT-L/14 con resolucion 336x336 que proyecta las caracteristicas visuales mediante una capa lineal al espacio de embeddings de un LLM de 7B (Vicuna). La interaccion se realiza mediante plantillas conversacionales multimodales, con imagenes insertadas como tokens especiales dentro del prompt.

El ajuste fino se realiza con LoRA sobre el conjunto PlantVillage, que contiene imagenes de hojas sanas y enfermas de multiples especies vegetales. La innovacion descrita en el paper asociado consiste en generar datos auto-sintetizados que extraen y describen sintomas visuales especificos de cada enfermedad bajo el principio de Information Bottleneck, y en aplicar un proceso iterativo de muestreo por rechazo sin modelo de recompensa para mejorar simultaneamente la precision de clasificacion y la calidad de las explicaciones. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto e imagen-a-texto (image-text-to-text) en formato conversacional.
- Clasificacion visual fina de enfermedades en hojas de plantas.
- Generacion de explicaciones en lenguaje natural sobre los sintomas observados, verificables por un humano.
- Razonamiento visual sobre imagenes de plantas (identificacion de patrones de necrosis, manchas, decoloracion, etc.).
- Soporte de conversaciones multi-turno mediante plantillas de chat (apply_chat_template).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades de audio ni modo "thinking" explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Diagnostico asistido en agricultura de precision: el modelo recibe una fotografia de una hoja y devuelve la enfermedad identificada junto con una descripcion de los sintomas, lo que permite a un agronomo verificar la decision sin depender de una caja negra.
- Aplicaciones moviles para agricultores: al ser un modelo de 7B, puede desplegarse en servidores modestos o cuantizado para inferencia en el borde, ofreciendo diagnostico en campo con explicaciones en lenguaje natural.
- Triaje en inspecciones de cultivos: integrado en un pipeline de vision que procesa imagenes capturadas por drones o robots agricolas, el modelo puede clasificar rapidamente hojas sospechosas y priorizar las que requieren revision humana.
- Generacion de informes fitosanitarios: a partir de una imagen, el modelo produce una descripcion textual de los sintomas que puede incorporarse directamente a informes tecnicos o bases de datos de trazabilidad.
- Formacion y divulgacion agricola: el modelo puede usarse como herramienta educativa que explica que sintomas visuales corresponden a cada enfermedad, apoyandose en su capacidad de generar descripciones interpretables.
- Investigacion en clasificacion visual fina: sirve como punto de partida (baseline ajustado) para experimentos de fine-tuning multimodal en dominios especializados con tecnicas de datos auto-sintetizados y muestreo por rechazo.
- Pre-diagnostico en laboratorios de sanidad vegetal: como primer filtro antes de un analisis microbiologico, reduciendo el volumen de muestras que requieren procesamiento manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que el modelo "demuestra una precision superior y explicaciones robustas e interpretables en comparacion con modelos baseline", pero no proporciona cifras concretas de MMLU, HumanEval, GSM8K ni de exactitud en PlantVillage.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-15 GB solo para los pesos, mas overhead del codificador visual y del procesador; en la practica se recomiendan 16-20 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB (no se documentan pesos GGUF/AWQ/GPTQ oficiales en el repositorio).
- GPU recomendadas: A100 40GB, H100, L40S o RTX A6000 para fp16 sin problemas; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en fp16.
- GPU de consumo: cabe en RTX 4090/3090 en fp16; en GPUs de 8-12 GB (RTX 3060 12GB, RTX 4060 Ti 16GB) requiere cuantizacion.
- Opciones de despliegue: transformers (segun la model card), y por compatibilidad con LLaVA-1.5 potencialmente vLLM, TGI y llama.cpp tras conversion a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection | 7,06B | No disponible | Fitopatologia (PlantVillage) | No disponible | Hugging Face (0 descargas) |
| LLaVA-1.5-7B-hf (base) | 7,06B | 4096 tokens (configuracion estandar de LLaVA-1.5) | Generalista multimodal | Llama 2 Community License (segun el modelo base) | Hugging Face, ampliamente usado |
| LLaVA-1.5-13B | ~13B | 4096 tokens | Generalista multimodal | Llama 2 Community License | Hugging Face |
| Qwen2-VL-7B | ~8,3B | 32k tokens (ampliable) | Generalista multimodal | Apache 2.0 | Hugging Face |

La comparativa con LLaVA-1.5-7B base es la mas directa: este ajuste hereda sus capacidades generales pero las especializa en fitopatologia. Frente a alternativas generalistas como Qwen2-VL-7B, este modelo ofrece un dominio mucho mas acotado y una licencia no declarada, lo que limita su uso comercial sin aclaracion previa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial; es un riesgo relevante para produccion.
- Idiomas soportados no documentados: se desconoce si mantiene el multilingueismo del modelo base o si el ajuste lo ha degradado.
- Entrenado sobre PlantVillage, un dataset con imagenes controladas de laboratorio; el rendimiento en fotos de campo con iluminacion variable, oclusiones o fondos complejos puede degradarse.
- Riesgo de alucinacion en las explicaciones: el modelo puede generar descripciones de sintomas plausibles pero incorrectos, especialmente en enfermedades no representadas en el entrenamiento.
- Sesgo de dominio: la cobertura de especies y enfermedades esta limitada al dataset PlantVillage; no debe asumirse generalizacion a cultivos no incluidos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que permita comparar con alternativas.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni reportes de uso en produccion.
- El modelo no debe usarse como unico criterio de decision en diagnostico fitosanitario; se recomienda supervision experta.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.
- La model card menciona el identificador "YuchengShi/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection" en el codigo de ejemplo, distinto del ID del repositorio actual, lo que puede indicar una publicacion duplicada o un cambio de cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krithikareddy2007/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection
- Modelo base LLaVA-1.5-7B-hf: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Paper en arXiv: https://arxiv.org/abs/2502.14044
- OpenReview del paper: https://openreview.net/forum?id=lHbLpwbEyt
- Proyecto SelfSynthX: https://github.com/sycny/SelfSynthX
