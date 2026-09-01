# Darth-Coder/my-model3-8b-it

## Resumen

Darth-Coder/my-model3-8b-it es un modelo de lenguaje de 8.190 millones de parametros, resultado de un fine-tuning de instruccion sobre Qwen/Qwen3-8B-Base. El sufijo "it" indica que ha sido ajustado para seguir instrucciones y conversacion, manteniendo la arquitectura y capacidades del modelo base de Qwen. Publicado bajo licencia Apache 2.0, el modelo hereda las caracteristicas principales de la familia Qwen3: modo pensamiento (thinking) y modo no pensamiento conmutables dentro del mismo modelo, capacidades de agente con integracion de herramientas y soporte multilingue de mas de 100 idiomas.

Con una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN, se posiciona como una opcion solida para tareas de razonamiento complejo, generacion de codigo y agentes conversacionales. El autor, Darth-Coder, ha publicado ademas variantes de 14B y 30B en la misma serie, aunque este modelo concreto no cuenta aun con descargas ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal dense, 36 capas, GQA (32 cabezas Q, 8 cabezas KV) |
| Parametros totales | 8.190.735.360 (8,2B) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 32.768 tokens nativa; 131.072 con YaRN |
| Tipos de cuantizacion | No especificados; compatible con cuantizacion estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun modelo base Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer causal dense de 36 capas con atencion de consultas agrupadas (GQA): 32 cabezas de consulta y 8 cabezas de clave/valor. Los parametros no-embedding ascienden a 6,95B. El modelo base fue preentrenado y post-entrenado por Alibaba e incorpora un mecanismo de conmutacion entre modo pensamiento y modo no pensamiento dentro del mismo modelo, ademas de un template de chat especifico que permite activar o desactivar el razonamiento explicito mediante el parametro `enable_thinking`.

El fine-tuning realizado por Darth-Coder sobre Qwen3-8B-Base no incluye detalles publicos sobre el dataset de entrenamiento, el numero de tokens utilizados ni las tecnicas de alineacion empleadas (RLHF, DPO, etc.). Al tratarse de un fine-tuning de instruccion, se asume que el objetivo es mejorar el seguimiento de instrucciones y la calidad conversacional respecto al modelo base, pero no hay informacion verificable al respecto.

## Capacidades

- Generacion de texto y conversacion multi-turno con seguimiento de instrucciones.
- Modo pensamiento (thinking) para razonamiento logico complejo, matematicas y codigo, activable o desactivable mediante `enable_thinking`.
- Modo no pensamiento para dialogo general eficiente y de baja latencia.
- Capacidades de agente: integracion con herramientas externas (tool calling) tanto en modo pensamiento como no pensamiento.
- Soporte multilingue de mas de 100 idiomas y dialectos, con seguimiento de instrucciones y traduccion.
- Generacion de codigo y resolucion de problemas matematicos, heredado del modelo base Qwen3.
- Compatible con frameworks de despliegue como vLLM, SGLang, Ollama, llama.cpp, LMStudio, MLX-LM y KTransformers.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32.768 tokens, manteniendo el historial completo de la interaccion y respondiendo con coherencia en multiples idiomas.
- Asistente de programacion en produccion: con capacidades de tool calling y generacion de codigo, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado en editores.
- Razonamiento y analisis de documentos: el modo pensamiento permite descomponer problemas complejos en pasos intermedios, util para analisis de contratos, informes financieros o investigacion academica.
- Agente autonomo con herramientas: puede actuar como agente que consulta APIs, bases de datos o servicios externos, encadenando llamadas a herramientas en modo pensamiento para tareas multi-paso.
- Traduccion y localizacion: su soporte de mas de 100 idiomas lo hace adecuado para servicios de traduccion automatica y localizacion de contenido.
- Chatbot de soporte tecnico especializado: el fine-tuning de instruccion mejora la adherencia a guiones y politicas de la empresa, reduciendo respuestas fuera de tono o fuera de contexto.
- Educacion y tutoria: puede explicar conceptos complejos paso a paso activando el modo pensamiento, adaptando el nivel de detalle segun la peticion del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tuning en la informacion disponible. El modelo base Qwen3-8B tiene resultados publicados en el blog oficial de Qwen y en el informe tecnico de Qwen3 (arXiv:2505.09388), pero no se puede asumir que este fine-tuning mantenga exactamente esos valores sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,4 GB en FP16, 8,2 GB en INT8 y 4,1 GB en INT4.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16 sin cuantizacion; RTX 4060 Ti (16 GB) o superior para cuantizacion INT8; GPUs de 8 GB o menos con cuantizacion INT4.
- Cabe en GPU de consumo: si, con cuantizacion. En FP16 requiere 16 GB de VRAM, disponible en RTX 4080/4090 y algunas RTX 3090.
- Opciones de despliegue: vLLM (>=0.8.5), SGLang (>=0.4.6.post1), Ollama, llama.cpp, LMStudio, MLX-LM y KTransformers.
- Latencia y throughput: no disponibles para este fine-tuning especifico; el modelo base Qwen3-8B es un modelo dense de 8B, con latencia tipica de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Darth-Coder/my-model3-8b-it | 8,2B | 32K (131K YaRN) | Apache 2.0 | Fine-tuning de Qwen3-8B-Base, sin validacion comunitaria |
| Qwen/Qwen3-8B | 8,2B | 32K (131K YaRN) | Apache 2.0 | Modelo instruct oficial, con benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (128K YaRN) | Apache 2.0 | Generacion anterior, sin modo pensamiento |
| meta-llama/Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community License | Sin modo pensamiento nativo, contexto mayor |

## Limitaciones y advertencias

- No se dispone de informacion publica sobre el dataset de fine-tuning, por lo que no se puede evaluar la calidad del ajuste ni posibles sesgos introducidos.
- El modelo hereda las limitaciones del modelo base Qwen3-8B, incluyendo riesgo de alucinacion en tareas factuales y posibles sesgos en contenido generado.
- En modo pensamiento, se recomienda usar temperatura 0,6, TopP 0,95, TopK 20 y MinP 0; no usar decodificacion greedy, ya que degrada el rendimiento y puede causar repeticiones.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del fine-tuning antes de usarlo en produccion.
- El contexto nativo de 32.768 tokens puede ser limitante para documentos muy largos; la extension a 131.072 tokens con YaRN puede degradar ligeramente la calidad en contextos extremos.
- La model card del autor reproduce integramente la del modelo base Qwen3-8B, sin aportar informacion especifica sobre el proceso de fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darth-Coder/my-model3-8b-it
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe tecnico Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Informe tecnico Qwen (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
