# mradermacher/LFM3-1.7B-Heretic-Abliterated-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-GGUF es la distribucion en formato GGUF del modelo LFM3-1.7B-Heretic-Abliterated, una variante "abliterated" (con las capas de rechazo atenuadas mediante la tecnica Heretic) del modelo base LiquidAI/LFM3-1.7B de Liquid AI. El modelo original es un transformer de 1.700 millones de parametros construido sobre la arquitectura tri-hibrida de Liquid AI, disenada para despliegue en dispositivos de borde y agentes locales, con una ventana de contexto de 256.000 tokens.

Este repositorio concreto ha sido generado por mradermacher, un conocido publicador de cuantizaciones GGUF, a partir de los pesos de Vortecks. Incluye 12 variantes de cuantizacion que van desde Q2_K hasta F16, lo que permite ejecutar el modelo en CPU y en GPUs de gama baja. Es relevante para desarrolladores que necesitan un modelo pequeno, con contexto muy largo y sin las restricciones de alineamiento del modelo original, empaquetado listo para llama.cpp u Ollama.

La ficha se limita a lo que puede verificarse en la informacion disponible: la model card del repositorio solo declara la procedencia de los pesos y la lista de cuantizaciones, sin especificaciones detalladas, benchmarks ni condiciones de licencia explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (arquitectura LFM3 de Liquid AI, segun la fuente del modelo base) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 256.000 tokens (segun la fuente del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la fuente secundaria menciona "other licence" sin concretar) |
| Formato de pesos | GGUF (generado con quantize_version 2, convert_type hf) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura tri-hibrida de Liquid AI, que combina mecanismos de atencion con componentes de estado recurrente para reducir el coste computacional en contextos largos. Segun la fuente consultada, esta disenado para uso como asistente cotidiano, tool calling, salidas estructuradas, trabajo con contexto largo y despliegue en el borde. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La variante Heretic-Abliterated aplica la tecnica de abliteration, que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a un espectro mas amplio de instrucciones. Esta modificacion se realizo sobre el modelo base y fue publicada por Vortecks; mradermacher se limita a convertir y cuantizar esos pesos a GGUF. No se documentan en la informacion disponible detalles sobre el proceso de abliteration, el numero de direcciones eliminadas ni el impacto en capacidades.

## Capacidades

- Generacion de texto y conversacion multi-turno, orientada a uso como asistente local.
- Tool calling y function calling, segun las capacidades declaradas del modelo base LFM3-1.7B.
- Salidas estructuradas (structured outputs) para integracion en pipelines.
- Trabajo con contexto largo gracias a la ventana de 256.000 tokens del modelo base.
- Razonamiento multi-paso y uso como agente local, segun la descripcion del modelo base.
- Respuestas sin las capas de rechazo habituales del modelo original, por efecto de la abliteration.
- Capacidades multilingues: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Agentes locales en portatil: el modelo, cuantizado en Q4_K_M o Q5_K_M, ocupa pocos gigabytes y puede ejecutarse en CPU con llama.cpp u Ollama, lo que permite desplegar un agente personal sin conexion ni GPU dedicada.
- Procesamiento de documentos largos: con 256.000 tokens de contexto en el modelo base, es adecuado para resumir contratos, informes o expedientes completos en una sola pasada, siempre que la cuantizacion elegida preserve la calidad suficiente.
- Automatizacion de herramientas y APIs: su soporte de tool calling y salidas estructuradas permite integrarlo como planificador en flujos que invocan funciones externas, por ejemplo consultas a bases de datos o envio de correos.
- Prototipado rapido en entornos con recursos limitados: las 12 cuantizaciones disponibles permiten ajustar el equilibrio entre VRAM/RAM y calidad, desde Q2_K para pruebas hasta F16 para evaluacion de referencia.
- Generacion de texto sin filtros en investigacion: la variante abliterated es util para estudiar el comportamiento del modelo ante instrucciones que el original rechazaria, en entornos controlados y con supervision humana.
- Clasificacion y extraccion de informacion en lote: al ser un modelo pequeno, puede procesar grandes volumenes de texto en CPU con un throughput aceptable, extrayendo entidades o etiquetas en pipelines de datos.
- Asistente de codigo ligero: puede integrarse en editores o scripts para autocompletado y explicacion de fragmentos, aunque su tamano limita la calidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,1 GB en Q2_K, 1,5 GB en Q4_K_M, 2,0 GB en Q6_K y 3,5 GB en F16 (estimaciones segun el tamano de los pesos de un modelo de 1,7B; no confirmadas en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; en entornos profesionales, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI requeririan conversion a otro formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated-GGUF (este) | 1,7B | 256K (modelo base) | no disponible | GGUF | Variante sin alineamiento de rechazo |
| LiquidAI/LFM3-1.7B | 1,7B | 256K | no disponible | safetensors/GGUF | Modelo base original, con alineamiento |
| Vortecks/LFM3-1.7B-Heretic-Abliterated | 1,7B | 256K (modelo base) | no disponible | safetensors/GGUF | Pesos fuente de esta cuantizacion |
| Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF | 1,7B | 256K (modelo base) | no disponible | GGUF (imatrix) | Cuantizacion alternativa con imatrix |

## Limitaciones y advertencias

- La abliteration elimina o atenua las capas de rechazo: el modelo puede generar contenido danino, ofensivo o ilegal sin filtros, lo que exige supervision y politicas de uso estrictas en produccion.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad de esta variante.
- Riesgo de alucinacion inherente a un modelo de 1,7B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La licencia no esta declarada en el repositorio; la fuente secundaria indica "other licence" sin especificar, por lo que no puede confirmarse el uso comercial.
- No se documentan los idiomas soportados; el rendimiento en castellano es incierto.
- El contexto de 256.000 tokens corresponde al modelo base; no se ha verificado que las cuantizaciones de menor precision preserven esa ventana con calidad aceptable.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que reduce la evidencia de validacion por la comunidad.
- Al ser una modificacion no oficial, no cuenta con el respaldo de Liquid AI ni garantias de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Abliterated-GGUF
- Pesos fuente (Vortecks): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Cuantizacion imatrix alternativa: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/lfm3-1.7b-heretic-abliterated/
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
