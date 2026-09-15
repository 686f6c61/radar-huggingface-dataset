# mastema007/Qwen2.5-3B-Instruct

## Resumen

El repositorio `mastema007/Qwen2.5-3B-Instruct` aloja una copia del modelo instructivo Qwen2.5-3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Se trata de un transformer causal decoder-only de 3.085.938.688 parametros (2,77 B sin contar embeddings), con 36 capas y atencion con Grouped Query Attention (16 cabezas para Q y 2 para KV). El repositorio declara `Qwen/Qwen2.5-3B` como modelo base, tiene licencia `qwen-research` y un unico idioma declarado, el ingles.

El modelo resuelve tareas de generacion de texto conversacional e instruccional en un rango de tamano que cabe en GPU de consumo. Segun la model card heredada, la serie Qwen2.5 mejora respecto a Qwen2 en conocimiento, codigo y matematicas, sigue instrucciones complejas, genera texto largo (mas de 8K tokens), entiende datos estructurados como tablas y produce salidas JSON, ademas de ser mas robusta frente a la diversidad de system prompts. La ficha tecnica del 3B indica 32.768 tokens de contexto y hasta 8192 tokens de generacion.

Es relevante ahora por su relacion tamano/coste: permite desplegar un asistente conversacional con contexto largo en hardware modesto, algo que modelos de 7B o superiores no permiten sin cuantizacion agresiva. Conviene senalar que este repositorio concreto es una reproduccion sin evidencia de entrenamiento adicional (0 descargas, 0 likes, model card copiada literalmente del modelo oficial), por lo que debe evaluarse como el Qwen2.5-3B-Instruct original y no como un fine-tune propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings atados |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros sin embeddings | 2,77 B |
| Numero de capas | 36 |
| Cabezas de atencion | 16 para Q y 2 para KV (GQA) |
| Longitud de contexto | 32.768 tokens; generacion de hasta 8192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors en precision completa; no se publican variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | El repositorio declara unicamente `en`; la model card heredada menciona mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe y otros) |
| Licencia | `qwen-research` (campo `license: other`) |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |
| Modelo base declarado | Qwen/Qwen2.5-3B |
| Libreria y pipeline | transformers; text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only clasico con 36 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). La atencion usa Grouped Query Attention con 16 cabezas de consulta y solo 2 cabezas de clave/valor, lo que reduce de forma drastica el tamano de la cache KV durante la inferencia y es la razon principal de que el modelo pueda sostener contextos de decenas de miles de tokens con poca memoria. La configuracion incluye sesgo en las proyecciones QKV.

Segun la model card, el modelo paso por dos etapas: preentrenamiento y postentrenamiento (ajuste por instrucciones). El numero exacto de tokens de entrenamiento, la composicion del dataset y el uso concreto de RLHF, DPO u otras tecnicas de alineamiento no se detallan en la informacion proporcionada. Tampoco hay constancia de que este repositorio haya aplicado un fine-tune adicional sobre el modelo base: no se documentan pasos de entrenamiento propios, el snippet de codigo de la model card apunta a `Qwen/Qwen2.5-3B-Instruct` y las cifras de parametros coinciden con las del modelo oficial. Como innovaciones tecnicas destacables respecto a Qwen2 se citan mejoras en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de texto largo y salidas estructuradas (JSON).

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de system prompt.
- Razonamiento y conocimiento general, con mejoras declaradas en codigo y matematicas gracias a modelos expertos especializados de la familia Qwen2.5.
- Seguimiento de instrucciones complejas y mayor resiliencia ante variaciones en el system prompt, orientado a role-play y definicion de condiciones en chatbots.
- Generacion de texto largo, con salidas de mas de 8000 tokens segun la documentacion de la familia.
- Comprension de datos estructurados (tablas) y generacion de salidas estructuradas, en particular JSON.
- Capacidad multilingue declarada en la model card para mas de 29 idiomas, aunque el tag de idioma del repositorio solo indica ingles.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada para este repositorio.
- Comportamiento como agente y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Vision, audio u otras modalidades: no soportadas (pipeline exclusivamente de generacion de texto).

## Casos de uso

- Atencion al cliente automatizada: con 32.768 tokens de contexto el modelo puede mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta sin truncar, y cabe en una GPU de 12 GB en FP16.
- Extraccion de datos estructurados: su capacidad declarada para generar JSON permite integrarlo en pipelines de ETL para convertir correos, facturas o articulos en registros normalizados validables por esquema.
- Asistente de codigo en local: el modelo puede autocompletar funciones, explicar fragmentos y generar tests dentro de un IDE o un runner de CI, con la ventaja de no enviar codigo propietario a APIs externas.
- Resumen y analisis de documentos largos: informes, contratos o actas de hasta decenas de miles de tokens se pueden procesar en una sola pasada, con generacion de resumenes o respuestas a preguntas sobre el texto.
- Clasificacion y enrutado de tickets: se puede usar para etiquetar consultas entrantes por categoria, urgencia o idioma y enrutarlas al equipo correspondiente, con coste de inferencia muy bajo por peticion.
- Generacion de documentacion tecnica: a partir de codigo fuente o de especificaciones, el modelo redacta READMEs, changelogs y guias de uso manteniendo el formato solicitado.
- Prototipado e investigacion academica: su tamano permite ejecutar experimentos de ajuste fino con LoRA en una sola GPU de consumo, lo que lo hace util como banco de pruebas de tecnicas de alineamiento o evaluacion.
- Despliegue en el borde o en portatil: cuantizado a 4 bits ocupa del orden de 2 GB de pesos, por lo que puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama para tareas de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Qwen2.5 y a la documentacion de velocidad de Qwen para consultar los resultados de evaluacion y las cifras de throughput, pero no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de otros conjuntos, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

Estimaciones de VRAM para inferencia (los pesos en precision completa ocupan 6,2 GB; la cache KV, con 36 capas y 2 cabezas KV, ronda los 36 KiB por token, es decir, aproximadamente 1,2 GB para 32.768 tokens en FP16):

| Precision | Pesos | VRAM estimada (contexto corto) | VRAM estimada (32K de contexto) |
|---|---|---|---|
| FP32 | ~12,4 GB | ~14 GB | ~15,5 GB |
| BF16 / FP16 | ~6,2 GB | ~8 GB | ~9,5 GB |
| INT8 | ~3,1 GB | ~5 GB | ~6,5 GB |
| INT4 | ~1,8 GB | ~3 GB | ~4,5 GB |

- Cabe en GPU de consumo: si. En FP16 necesita unos 8-10 GB, por lo que entra en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 de 24 GB. En INT4 entra en GPUs de 6-8 GB e incluso en equipos sin GPU dedicada mediante llama.cpp.
- GPU de datacenter recomendadas: A100 de 40 u 80 GB, H100, L40S o L4, aunque para este tamano suelen quedar sobredimensionadas salvo que se busque throughput alto con muchas peticiones concurrentes.
- Opciones de despliegue: transformers (libreria oficial del repositorio), vLLM, Text Generation Inference (TGI) y SGLang para servidores con batching; llama.cpp u Ollama para CPU y equipos de consumo, teniendo en cuenta que este repositorio solo publica safetensors y habria que convertir los pesos a GGUF.
- Latencia y throughput: no disponible. La model card enlaza a los resultados de velocidad de Qwen sin incluir cifras en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Notas |
|---|---|---|---|---|---|
| mastema007/Qwen2.5-3B-Instruct (este repositorio) | 3,09 B | 32.768 tokens | qwen-research | safetensors | Repositorio sin descargas ni documentacion propia de entrenamiento |
| Qwen/Qwen2.5-3B-Instruct (oficial) | 3,09 B | 32.768 tokens | qwen-research | safetensors, GPTQ, AWQ, GGUF | Version de referencia, mantenida por el autor original |
| Meta Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Mayor ventana de contexto nominal; licencia con condiciones de uso |
| Microsoft Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Licencia permisiva; mayor numero de parametros |
| Google Gemma-2-2B-it | 2,6 B | 8192 tokens | Gemma Terms of Use | safetensors, GGUF | Menor contexto y licencia con restricciones |

Los datos de parametros, contexto y licencia de los modelos alternativos proceden de sus respectivas model cards publicas y conviene verificarlos antes de tomar decisiones de produccion. No hay resultados de benchmarks comparativos en la informacion proporcionada para este repositorio.

## Limitaciones y advertencias

- El repositorio no aporta evidencia de fine-tuning propio: la model card es una copia literal de la del modelo oficial, el snippet de codigo apunta a `Qwen/Qwen2.5-3B-Instruct` y no a este repositorio, y registra 0 descargas y 0 likes. Debe asumirse un comportamiento equivalente al del modelo oficial.
- Discrepancia de contexto: la introduccion de la model card menciona soporte de contexto de hasta 128K tokens para la familia, mientras que la ficha tecnica del 3B indica 32.768 tokens. La cifra aplicable a este modelo es la segunda; hay que verificar la configuracion antes de asumir ventanas mayores.
- Discrepancia de idiomas: el tag del repositorio declara unicamente ingles, mientras que la model card heredada afirma soporte para mas de 29 idiomas. El rendimiento real en idiomas distintos del ingles no esta verificado en este repositorio.
- Riesgo de alucinacion propio de un modelo de 3B, especialmente en tareas de conocimiento factual y razonamiento matematico de varios pasos. No hay evaluaciones publicadas en este repositorio que acoten esa tasa de error.
- Sesgos: no se documenta ninguna auditoria de sesgos. Cabe esperar los sesgos presentes en el corpus de preentrenamiento de Qwen, sin que este repositorio aporte mitigaciones adicionales.
- Licencia `qwen-research`: no es una licencia permisiva tipo Apache-2.0 ni MIT. Antes de un uso comercial es obligatorio revisar el texto de la licencia enlazado, ya que impone restricciones.
- No se publican variantes cuantizadas: para desplegar en INT8, INT4 o GGUF hay que convertir los pesos, lo que anade un paso de validacion numerica.
- No hay informacion sobre tool calling, function calling ni comportamiento agentico en este repositorio, por lo que no debe asumirse su disponibilidad en produccion.
- El modelo no tiene mantenimiento declarado: la fecha de creacion y ultima actualizacion del repositorio son identicas y no hay historial de revisiones, lo que supone un riesgo de suministro si se depende de esta copia concreta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mastema007/Qwen2.5-3B-Instruct
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Articulo tecnico de Qwen2: https://arxiv.org/abs/2407.10671
