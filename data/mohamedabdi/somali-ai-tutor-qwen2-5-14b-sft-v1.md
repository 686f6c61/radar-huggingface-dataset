# mohamedabdi/Somali-AI-Tutor-Qwen2.5-14B-SFT-v1

## Resumen

Somali-AI-Tutor-Qwen2.5-14B-SFT-v1 es un ajuste fino supervisado (SFT) publicado por el usuario mohamedabdi sobre el modelo Qwen2.5-14B-Instruct, en su variante pre-cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-14B-Instruct-unsloth-bnb-4bit). El nombre sugiere una orientacion hacia tutoria educativa en somali, aunque la model card no documenta ni el dataset, ni el proceso de entrenamiento, ni evaluaciones en ese idioma. La unica informacion tecnica explicita es que se entreno con Unsloth, que la licencia es Apache-2.0 y que el unico idioma declarado es el ingles.

El modelo hereda la arquitectura y el conocimiento del Qwen2.5-14B-Instruct original (transformer decoder-only, 14,7 mil millones de parametros, 131.072 tokens de contexto), pero el repositorio ocupa solo 0,3 GB, un tamano incompatible con los pesos completos de un modelo de 14B en cualquier precision. Esto apunta a que el repositorio contiene unicamente adaptadores LoRA, pesos parciales o una subida incompleta, por lo que no es directamente desplegable sin verificar su contenido.

Su relevancia es limitada a dia de hoy: cero descargas, cero likes, sin benchmarks publicados y sin model card detallada. Resulta util como ejemplo de flujo QLoRA con Unsloth sobre Qwen2.5, pero no como modelo listo para produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 14,7 B (heredados de Qwen2.5-14B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no verificado en el finetune |
| Tipos de cuantizacion | Modelo base en bnb-4bit; el repositorio se distribuye en safetensors. No se ofrecen versiones GGUF, AWQ ni GPTQ de este finetune |
| Idiomas soportados | en (unico idioma declarado en la model card); el nombre sugiere somali, pero no esta declarado ni evaluado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El finetune se apoya en Qwen2.5-14B-Instruct, un transformer decoder-only de la familia Qwen2 con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value agrupadas (GQA). El modelo base original se entreno sobre un corpus multilingue de gran escala y posteriormente se alineo con tecnicas de instruccion; la variante de Unsloth sobre la que se parte esta cuantizada a 4 bits con bitsandbytes, lo que implica que el ajuste se realizo presumiblemente mediante QLoRA (adaptadores de bajo rango sobre pesos congelados en 4 bits).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni la configuracion del SFT. La unica innovacion tecnica declarada es el uso de Unsloth, que el autor describe como "2x faster" respecto al entrenamiento convencional, gracias a kernels optimizados y gestion de memoria. No hay publicados detalles sobre hiperparametros, rango del adaptador ni porcentaje de modulos ajustados.

## Capacidades

- Generacion de texto instruccional en ingles, heredada de Qwen2.5-14B-Instruct.
- Razonamiento, codigo y matematicas propias del modelo base; no re-evaluadas tras el ajuste.
- Soporte de conversaciones multi-turno dentro de la ventana de contexto del modelo base.
- Capacidad multilingue del modelo base (Qwen2.5 cubre decenas de idiomas), aunque el finetune solo declara ingles.
- Orientacion teorica a tutoria educativa segun el nombre del repositorio, sin evidencia documentada.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido especificos de este finetune.

## Casos de uso

- Prototipado de tutoria educativa en ingles: el modelo puede usarse como punto de partida para generar explicaciones paso a paso de fisica, quimica o matematicas, aprovechando la base Qwen2.5-14B-Instruct y su ventana de contexto larga para mantener el hilo de una conversacion docente.
- Experimentacion con QLoRA y Unsloth: sirve como referencia practica de como ajustar un modelo de 14B en 4 bits con recursos limitados, replicando el pipeline en otros dominios.
- Generacion de material didactico: redaccion de ejercicios, resumenes y preguntas de practica a partir de apuntes largos, gracias a los 131.072 tokens de contexto del modelo base.
- Asistente conversacional de refuerzo: integracion en un chat de apoyo al estudiante que responda dudas puntuales en ingles, previa validacion de la calidad del finetune.
- Base para un ajuste posterior en somali: dado que el autor mantiene repositorios de IA en somali, este modelo puede servir de punto de partida para un SFT adicional con datos de ese idioma.
- Evaluacion comparativa de finetunes: util como caso de estudio en articulos o notebooks que comparen el efecto de un SFT ligero sobre Qwen2.5-14B-Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El modelo base Qwen2.5-14B-Instruct cuenta con evaluaciones publicas (MMLU, HumanEval, GSM8K, entre otras) en su model card oficial, pero no hay ninguna medicion que refleje el efecto de este finetune concreto sobre dichas metricas, ni evaluaciones en somali.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 28-30 GB para los pesos completos de un modelo de 14,7 B, mas overhead de activaciones y cache KV.
- VRAM estimada en 8 bits: aproximadamente 15-16 GB.
- VRAM estimada en 4 bits: aproximadamente 8-9 GB.
- GPU de datacenter recomendadas: A100 40 GB u 80 GB, H100 80 GB para fp16 con contexto largo; A100 40 GB suficiente para 8 bits.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) pueden ejecutar el modelo en 4 y 8 bits; tarjetas de 16 GB solo en 4 bits y con contexto reducido.
- Opciones de despliegue: vLLM y TGI para servicio de alta concurrencia; llama.cpp u Ollama solo si se generan versiones GGUF, que este repositorio no incluye; transformers con bitsandbytes para inferencia directa.
- Latencia y throughput: no disponibles. El repositorio de 0,3 GB sugiere que no contiene pesos completos, por lo que el despliegue directo requeriria verificar si se trata de adaptadores LoRA que deban fusionarse con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Somali-AI-Tutor-Qwen2.5-14B-SFT-v1 | 14,7 B | 131.072 (heredado) | Apache-2.0 | Finetune sin evaluar, repo de 0,3 GB |
| Qwen2.5-14B-Instruct | 14,7 B | 131.072 | Apache-2.0 | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 | Apache-2.0 | Alternativa mas ligera de la misma familia |
| Llama-3.1-8B-Instruct | 8 B | 128.000 | Llama 3.1 Community License | Alternativa de tamano similar con licencia mas restrictiva |

La comparacion relevante es contra el propio Qwen2.5-14B-Instruct: al no haber evaluaciones del finetune, no puede afirmarse que mejore al base en ninguna tarea. Frente a Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct, este modelo ofrece mas parametros pero carece de validacion publica.

## Limitaciones y advertencias

- El repositorio ocupa 0,3 GB, un tamano incompatible con los pesos completos de un modelo de 14B; es probable que contenga solo adaptadores LoRA o una subida incompleta, por lo que no es desplegable sin inspeccion previa.
- No hay benchmarks ni evaluaciones publicadas del finetune; se desconoce si mejora, iguala o degrada el rendimiento del modelo base.
- El unico idioma declarado es el ingles, pese a que el nombre sugiere tutoria en somali; no hay evidencia de capacidad en ese idioma.
- El ajuste se hizo sobre una base cuantizada a 4 bits (bnb-4bit), lo que puede introducir perdida de calidad adicional frente a un SFT sobre pesos en fp16.
- Riesgo de alucinacion inherente a los modelos de 14B, especialmente en contenido educativo donde la precision factual es critica.
- Cero descargas y cero likes en el momento de la consulta: no ha sido validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar tambien los terminos del modelo base Qwen2.5-14B-Instruct y de los datos usados en el finetune, que no se documentan.
- La fecha de creacion registrada (2026-10-23) resulta anomala y conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohamedabdi/Somali-AI-Tutor-Qwen2.5-14B-SFT-v1
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-unsloth-bnb-4bit
- Coleccion oficial Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen2.5-14B-Instruct-GGUF en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-14B-Instruct-GGUF
- Repositorio del autor con proyectos en somali: https://github.com/mohamed-tsx/Somali-AI-Models
- Proyecto de tutor educativo en somali (tercero): https://github.com/Hodan-dev/somali-ai-learning-tutor
