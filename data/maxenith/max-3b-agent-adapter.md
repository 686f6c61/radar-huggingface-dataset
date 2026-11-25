# Maxenith/Max-3B-Agent-Adapter

## Resumen

Max-3B-Agent-Adapter es un adaptador LoRA publicado por Maxenith sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Se distribuye como un repositorio PEFT de aproximadamente 0,3 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. El nombre sugiere un ajuste orientado a tareas de agente (agent), y las etiquetas del repositorio confirman un entrenamiento mediante SFT (supervised fine-tuning) con las librerias transformers y trl. El pipeline declarado es text-generation y la tarea conversacional.

El modelo hereda del base toda la arquitectura y las capacidades de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3.000 millones de parametros con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El adaptador no anade parametros de arquitectura nuevos, sino que modifica los pesos del base para especializarlo. Es relevante para quienes quieran un modelo de agente ligero, desplegable en hardware modesto, sin reentrenar desde cero.

La ficha del autor esta practicamente vacia (todos los campos marcados como "More Information Needed"), no hay datos de evaluacion, ni de dataset de entrenamiento, ni de licencia explicita. Cualquier uso en produccion debe considerar esa falta de documentacion como un riesgo de trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-3B-Instruct); adaptador LoRA sobre atencion y proyecciones |
| Parametros totales | 3.000 millones en el modelo base; el adaptador LoRA ocupa ~0,3 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-3B-Instruct; extensible a 131.072 mediante configuracion de RoPE |
| Tipos de cuantizacion | no disponible en el repositorio; el base admite bf16, fp16, int8 e int4 (GPTQ/AWQ/GGUF) a traves del ecosistema |
| Idiomas soportados | no disponible en la ficha; el base Qwen2.5 soporta oficialmente 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman, portugues, arabe y japones |
| Licencia | no disponible (la del base Qwen2.5-3B-Instruct es Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (PEFT/LoRA), compatible con transformers y PEFT 0.22.0 |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 25 de noviembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso con atencion multi-cabeza con Grouped Query Attention (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE. El base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante instruccion y preferencias. El adaptador LoRA modifica un subconjunto de matrices de proyeccion (tipicamente q_proj, k_proj, v_proj, o_proj y las MLP) con rangos bajos, sin alterar la estructura del modelo.

Segun las etiquetas del repositorio, el entrenamiento del adaptador fue un SFT (supervised fine-tuning) realizado con trl y transformers, presumiblemente sobre un dataset de trayectorias de agente, llamadas a herramientas o instrucciones multi-paso. No se publica el numero de tokens de entrenamiento, la composicion del dataset, el rango y alfa del LoRA, la tasa de aprendizaje ni si hubo etapas de DPO o RLHF. La version de PEFT empleada es 0.22.0. No consta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias del base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-3B-Instruct.
- Razonamiento basico y aritmetica de complejidad media, acorde a un modelo de 3B.
- Generacion de codigo en lenguajes populares (Python, JavaScript, Java, C++), limitada por el tamano del modelo.
- Soporte de tool calling y function calling en formato JSON, capacidad nativa del base Qwen2.5-Instruct.
- Capacidad de seguir instrucciones multi-paso y de actuar como agente en pipelines con herramientas externas, presumiblemente reforzada por el SFT del adaptador.
- Multilinguismo: el base soporta 29 idiomas; el adaptador no documenta que idiomas conserva ni cuales se degradaron.
- Sin vision, sin audio y sin modo thinking explicito documentado en el adaptador.

## Casos de uso

- Agentes ligeros de automatizacion local: el adaptador puede cargarse sobre Qwen2.5-3B-Instruct en una estacion de trabajo con GPU de 8-12 GB y ejecutar bucles de razonamiento con tool calling para tareas de escritorio, gestion de ficheros o consultas a APIs internas.
- Enrutamiento y clasificacion de intenciones en pipelines RAG: con 3B parametros y contexto de 32K, es viable clasificar consultas, extraer entidades y decidir que herramienta invocar antes de pasar a un modelo mayor.
- Prototipado rapido de asistentes conversacionales: al ser un adaptador de 0,3 GB, se puede versionar, sustituir y comparar con otros adaptadores sobre el mismo base sin duplicar pesos, lo que agiliza la experimentacion.
- Extraccion estructurada de informacion: generar JSON validado a partir de documentos largos (contratos, tickets, correos) aprovechando la ventana de contexto y el formato de function calling.
- Automatizacion de tareas de desarrollo: sugerencias de parches, generacion de tests unitarios y resumen de diffs en integraciones con GitHub o GitLab, siempre con revision humana dado el tamano del modelo.
- Despliegue en entornos con restricciones de privacidad: al caber en una unica GPU consumer, permite ejecutar un agente sobre datos sensibles sin salir de la infraestructura propia.
- Educacion y evaluacion de tecnicas de fine-tuning: sirve como ejemplo reproducible de SFT con PEFT y trl para quienes quieran estudiar como un adaptador pequeno modifica el comportamiento del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye seccion de evaluacion ni resultados de MMLU, HumanEval, GSM8K, MT-Bench ni AgentBench. Tampoco se aportan comparaciones con el base sin adaptador, por lo que no es posible cuantificar la mejora atribuible al SFT.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6-7 GB para el base de 3B mas overhead de contexto; el adaptador anade menos de 0,5 GB.
- VRAM estimada en cuantizacion int8: 4-5 GB; en int4 (GPTQ/AWQ/GGUF): 2,5-3,5 GB.
- GPU recomendadas: NVIDIA RTX 4090, RTX 4080, RTX 3090, L4, A10G, A100 40 GB y H100 para despliegues con alta concurrencia. Cabe en GPUs consumer de 8 GB o mas en cuantizacion.
- Despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM con soporte de LoRA, TGI, llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF. La fusion se realiza con `merge_and_unload()` de PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa del base 3B en una RTX 4090 en bf16, se esperan decenas de tokens por segundo, pero no se aporta medicion oficial para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Max-3B-Agent-Adapter (este) | 3B (base) + LoRA | 32K (heredado) | Adaptador LoRA sobre Qwen2.5-3B-Instruct | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (131K extensible) | Modelo completo denso | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-3B-Instruct | 3B | 128K | Modelo completo denso | Llama 3.2 Community License | Hugging Face, muy usado |
| Phi-3.5-mini-instruct | 3,8B | 128K | Modelo completo denso | MIT | Hugging Face, muy usado |

Frente al base Qwen2.5-3B-Instruct, este adaptador solo se justifica si el SFT especifico de agente aporta una mejora medible, algo que la ficha no demuestra. Frente a Llama-3.2-3B-Instruct y Phi-3.5-mini-instruct, la ventaja del ecosistema Qwen2.5 es su soporte nativo de tool calling y multilinguismo amplio, pero la falta de licencia declarada en el adaptador es un inconveniente frente a las licencias claras de los alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones, por lo que no es posible auditar el comportamiento del adaptador.
- Riesgo de alucinacion inherente a un modelo de 3B, especialmente en tareas de razonamiento largo, matematicas complejas y codigo de gran extension.
- La licencia del adaptador no esta declarada. Aunque el base es Apache 2.0, la ausencia de licencia explicita impide asumir derechos de uso comercial sobre los pesos del adaptador sin consultar al autor.
- No se especifica que idiomas conserva el adaptador tras el SFT; es plausible una degradacion del multilinguismo del base si el dataset de ajuste fue mayoritariamente en ingles.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en produccion ni validacion por terceros.
- El contexto efectivo puede degradarse mas alla de 8-16K tokens aunque el base soporte 32K; no hay mediciones del adaptador en contextos largos.
- Al ser un adaptador, requiere cargar el base Qwen2.5-3B-Instruct por separado; no es un checkpoint autonomo y no puede desplegarse sin el modelo original.
- No se documenta el rango ni el alpha del LoRA, lo que dificulta reproducir el entrenamiento o ajustar la intensidad del adaptador en inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maxenith/Max-3B-Agent-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
