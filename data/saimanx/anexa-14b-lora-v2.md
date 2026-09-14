# SaimanX/anexa-14b-lora-v2

## Resumen

anexa-14b-lora-v2 es un adaptador LoRA publicado en HuggingFace por el usuario SaimanX el 14 de septiembre de 2026. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) que se aplica sobre unsloth/Qwen2.5-14B-Instruct-bnb-4bit, una versión cuantizada en bitsandbytes 4-bit del conocido modelo Qwen2.5-14B-Instruct de Alibaba. El repositorio pesa 1,1 GB y se distribuye en formato safetensors bajo la librería PEFT 0.19.1.

La relevancia de la ficha es limitada y conviene decirlo con claridad: se trata de una publicación sin tracción (0 descargas y 0 likes en el momento de la consulta), con una model card que es la plantilla por defecto de HuggingFace y en la que todos los campos relevantes aparecen como «More Information Needed». No hay información pública sobre el dataset de entrenamiento, los hiperparámetros, el rango del adaptador, los idiomas objetivo ni la licencia.

Por el nombre («anexa») y por el uso de Unsloth y TRL, todo apunta a un ajuste orientado a un dominio o estilo conversacional concreto, probablemente en español, pero se trata de una inferencia y no de un dato documentado. Cualquier evaluación de este adaptador exige descargarlo, fusionarlo con el modelo base y ejecutar pruebas propias antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso con RoPE, GQA y SwiGLU; modelo base unsloth/Qwen2.5-14B-Instruct-bnb-4bit |
| Parametros totales | Adaptador: no disponible. Modelo base: aproximadamente 14,7 mil millones |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No documentada para el adaptador. El modelo base soporta 32.768 tokens nativos y hasta 131.072 con escalado YaRN |
| Tipos de cuantizacion | El modelo base de partida está en bitsandbytes 4-bit; el adaptador se distribuye sin cuantizar en safetensors. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles en la ficha del adaptador. El modelo base declara más de 29 idiomas, incluido el español |
| Licencia | No disponible (la ficha no la declara; el modelo base se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | unsloth/Qwen2.5-14B-Instruct-bnb-4bit |
| Tipo de ajuste | LoRA + SFT con TRL y Unsloth, según las etiquetas del repositorio |
| Tamano del repositorio | 1,1 GB |
| Framework declarado | PEFT 0.19.1 |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 14 de septiembre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo autónomo, sino un conjunto de matrices de bajo rango que deben aplicarse sobre el modelo base. La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only de 48 capas, dimensión oculta 5120, 40 cabezas de atención y 8 cabezas de clave/valor (atención agrupada), con RMSNorm, RoPE y activación SwiGLU, entrenado originalmente sobre 18 billones de tokens según la documentación pública de Qwen2.5. El adaptador ocupa 1,1 GB en safetensors, un tamaño coherente con un rango LoRA medio o alto sobre los módulos de atención y MLP, aunque el valor exacto del rango, el alfa, los módulos objetivo y la tasa de aprendizaje no están documentados.

El proceso de entrenamiento tampoco está descrito. Las etiquetas indican SFT con TRL y Unsloth, lo que sugiere un flujo de ajuste supervisado tipo QLoRA sobre la versión 4-bit del modelo base, pero se desconoce el dataset, su composición, su tamaño, si hubo etapas de DPO o RLHF, y cuántas épocas o pasos se ejecutaron. La model card no incluye hiperparámetros, curvas de pérdida ni tamaño del checkpoint, por lo que la reproducibilidad es nula.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base para mantener diálogos multi-turno con instrucciones en lenguaje natural.
- Razonamiento y matemáticas: el modelo base Qwen2.5-14B-Instruct está entrenado para tareas de razonamiento elemental y resolución de problemas aritméticos; no hay evaluación específica del adaptador.
- Generación de código: capacidad heredada del modelo base, que cubre múltiples lenguajes de programación. Sin verificar tras el ajuste.
- Tool calling y function calling: Qwen2.5-Instruct soporta plantillas de llamada a herramientas. El adaptador podría degradar o perder esta habilidad si el dataset de SFT no la incluyó, algo que no puede comprobarse con la información disponible.
- Uso en agentes y razonamiento multi-paso: posible sobre el papel, pero no documentado ni evaluado en este adaptador.
- Multilingüismo: el modelo base cubre más de 29 idiomas, con especial atención al chino y al inglés. El idioma objetivo del ajuste no está declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo base no es multimodal.

## Casos de uso

- Asistente de atención al cliente en español: el adaptador puede servir como capa de estilo o jerga corporativa sobre Qwen2.5-14B-Instruct, con conversaciones multi-turno de hasta 32.768 tokens de contexto. Requiere una batería de pruebas propia porque no hay garantías de que el ajuste preserve la calidad del base.
- Generación de código en pipelines internos: se puede desplegar tras fusionar los pesos con el modelo base y usarlo como generador de parches o tests, siempre con revisión humana y validación en CI. El adaptador no añade ninguna capacidad de seguridad sobre el base.
- Extracción estructurada de información: procesamiento por lotes de correos, contratos o incidencias para producir JSON con campos fijos. Útil porque se puede ejecutar en una sola GPU de 24 GB en 4-bit, con coste operativo bajo.
- Sistemas RAG sobre documentación técnica: con 32.768 tokens de contexto nativo se pueden insertar varios documentos completos junto a la pregunta. El adaptador actúa como capa de tono y dominio; el motor de recuperación es independiente.
- Resumen y análisis de documentación larga: informes, actas o expedientes de decenas de miles de tokens en una sola pasada, con salida estructurada por secciones.
- Anotación y clasificación de datos a escala: generación offline de etiquetas o resúmenes sobre grandes volúmenes de texto, aprovechando que el modelo cabe en hardware asequible en cuantización 4-bit.
- Punto de partida para nuevos ajustes: al ser un adaptador PEFT, se puede cargar y continuar el entrenamiento con un segundo LoRA sobre un dominio más específico, aunque sin documentación del primero es difícil predecir la interferencia entre ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna sección de evaluación y la busqueda web realizada no ha devuelto resultados relacionados con el modelo, el autor o el nombre «anexa» (unicamente resultados de un portal de anuncios clasificados sin relacion alguna). No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de comparaciones verificables frente al modelo base.

## Requisitos de hardware

- Adaptador en solitario: 1,1 GB en disco, no ejecutable sin fusionarlo con el modelo base.
- Pesos fusionados en bf16 o fp16: aproximadamente 29,5 GB. Requiere una A100 40 GB, una H100 80 GB, una L40S 48 GB o dos RTX 4090 de 24 GB con reparto de tensores.
- Pesos fusionados en 8 bits: aproximadamente 15,5 GB. Cabe en RTX 4090, RTX 3090, A6000 o L40S con contexto moderado.
- Pesos fusionados en 4 bits: aproximadamente 9-10 GB. Cabe en GPU de consumo de 16 GB o superiores (RTX 4080, RTX 4070 Ti Super, RTX 3090, RTX 4090).
- Cache KV: con la configuración del modelo base (48 capas, 8 cabezas KV, dimensión de cabeza 128), el cache en fp16 ocupa del orden de 0,19 MB por token, es decir, unos 6 GB adicionales para agotar los 32.768 tokens de contexto. Es una estimación derivada de la arquitectura del base.
- CPU y RAM: con cuantización de 4 bits tipo GGUF pueden bastar unos 10-12 GB de RAM, a costa de una latencia mucho mayor.
- Opciones de despliegue: transformers + PEFT para pruebas; vLLM o TGI tras fusionar los pesos en bf16; llama.cpp u Ollama si se convierte a GGUF (Unsloth permite exportar el modelo fusionado a 16 bits y a GGUF). La inferencia directa con bitsandbytes 4-bit funciona pero es lenta y no conviene en producción.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SaimanX/anexa-14b-lora-v2 | Adaptador sobre 14,7 B | No documentado (base: 32.768 / 131.072 con YaRN) | No declarada | 0 descargas, 0 likes, sin evaluacion | Sin model card utilizable ni benchmarks propios |
| Qwen/Qwen2.5-14B-Instruct | 14,7 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente utilizado y documentado | Referencia directa: el adaptador parte de una version cuantizada de este modelo |
| unsloth/Qwen2.5-14B-Instruct-bnb-4bit | 14,7 B (4-bit) | 32.768 nativos | Apache 2.0 | Popular como base para QLoRA | Modelo base exacto declarado por el autor del adaptador |

No se han identificado en la informacion disponible otros adaptadores comparables de terceros con datos verificables de rendimiento, licencia y evaluacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto y no aporta dataset, hiperparámetros, rango LoRA ni proceso de entrenamiento.
- Sin evaluacion publica: no hay ninguna métrica que permita saber si el ajuste mejora, mantiene o degrada las capacidades del modelo base.
- Licencia no declarada: no puede confirmarse el uso comercial. El modelo base es Apache 2.0, pero el adaptador no especifica términos, por lo que habría que contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: aunque el nombre sugiere un enfoque en español, no hay confirmación. El comportamiento fuera del dominio de entrenamiento es impredecible.
- Riesgo de sobreajuste o de olvido catastrofico: un SFT con un dataset desconocido puede deteriorar el soporte de tool calling, el multilingüismo o el razonamiento del modelo base.
- Perdida de calidad por cuantizacion: el ajuste se hizo sobre una base en 4-bit (QLoRA), por lo que arrastra la degradación propia de esa cuantización frente a bf16.
- Alucinacion: como cualquier LLM, puede generar afirmaciones falsas con apariencia de verosimilitud, especialmente en dominios factuales. Sin evaluación no hay forma de acotar la tasa.
- Sesgos: no evaluados. Hereda los sesgos presentes en los datos de Qwen2.5 y añade los del dataset de ajuste, que se desconoce.
- Trazabilidad: autor individual, sin repositorio de codigo ni paper asociado, sin historial de mantenimiento ni issues resueltas.
- Advertencia de fecha: los metadatos indican una fecha de creacion de septiembre de 2026, posterior a la mayoria de referencias del ecosistema; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaimanX/anexa-14b-lora-v2
- Modelo base del adaptador: https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Nota sobre la busqueda web: no se ha encontrado ningun enlace, paper, demo o publicacion relacionada con este modelo.
