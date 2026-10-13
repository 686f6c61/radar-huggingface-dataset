# eadwadasad/Qwen2.5-3B-Instruct-heretijariondavidsonn

## Resumen

Este repositorio publica una version "decensored" (tambien llamada abliterated o uncensored) de Qwen/Qwen2.5-3B-Instruct, generada de forma automatica con la herramienta Heretic v1.4.0 por el usuario eadwadasad. El objetivo del proceso de abliteration es eliminar la direccion del espacio de activaciones responsable de los rechazos de seguridad, de modo que el modelo responda a peticiones que el modelo original rechazaria, manteniendo lo maximo posible del comportamiento y el conocimiento original.

Se trata de un modelo denso de tipo causal language model con 3.090 millones de parametros (2.770 millones sin contar embeddings), 36 capas, atencion con GQA (16 cabezas para Q y 2 para KV) y una longitud de contexto de 32.768 tokens con generacion de hasta 8.192 tokens. La arquitectura es la estandar de Qwen2.5: transformer con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings de entrada/salida atados.

Es relevante ahora porque forma parte del ecosistema de modelos "abliterated" reproducibles: el autor publica los hiperparametros exactos de la intervencion y los scripts de reproduccion, algo poco habitual en este tipo de derivados. Ademas, al partir de un modelo de 3B, es ejecutable en GPU de consumo y sirve como caso de estudio sobre hasta que punto se puede modificar el comportamiento de rechazo de un LLM con un coste de divergencia medible (KL de 0.0531 frente al original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y embeddings atados (Qwen2) |
| Parametros totales | 3,09 mil millones (3.090.000.000) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (generacion de hasta 8.192 tokens) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio; compatible con GPTQ, AWQ, bitsandbytes y GGUF mediante herramientas externas |
| Idiomas soportados | El repositorio declara en (ingles); el modelo base Qwen2.5 soporta mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros) |
| Licencia | other / qwen-research (enlace a la licencia de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer causal denso de 36 capas con rotary position embeddings (RoPE), activacion SwiGLU, normalizacion RMSNorm, sesgos en las proyecciones QKV y pesos de embedding compartidos entre entrada y salida (tied word embeddings). La atencion usa grouped query attention con 16 cabezas de consulta y 2 de clave/valor, lo que reduce el tamano del KV cache. El contexto completo es de 32.768 tokens y la generacion maxima de 8.192 tokens.

Sobre ese checkpoint ya entrenado, el autor aplica Heretic v1.4.0, una herramienta de abliteration que identifica una direccion de rechazo en el espacio de activaciones y modifica selectivamente los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` en funcion de la posicion de capa. Los hiperparametros declarados son: direction_index 23.85, attn.o_proj.max_weight 1.25 (posicion 32.73), attn.o_proj.min_weight 1.14 (distancia 19.17), mlp.down_proj.max_weight 0.97 (posicion 22.52) y mlp.down_proj.min_weight 0.78 (distancia 14.50). No se aporta informacion sobre el dataset de entrenamiento original ni sobre si se realizo RLHF o DPO adicional en esta derivacion; el proceso es puramente de edicion de pesos sobre el modelo ya alineado.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de mensajes compatible con `apply_chat_template`.
- Hereda del modelo base las mejoras anunciadas por Qwen2.5 en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados (tablas) y generacion de salidas estructuradas como JSON.
- Razonamiento y matematicas basicas, con mejoras respecto a Qwen2 sobre el modelo base segun la documentacion de Qwen.
- Generacion de codigo, apoyada en los modelos expertos especializados que Qwen uso durante el desarrollo de la familia.
- Capacidad multilingue heredada del modelo base (mas de 29 idiomas), aunque el repositorio solo declara soporte de ingles.
- Comportamiento orientado a chat y role-play, con tolerancia a variedad de system prompts.
- Respuesta a peticiones que el modelo original rechazaria: la model card reporta 3 rechazos de cada 100 frente a 97 de cada 100 del original con la misma bateria de pruebas.
- No se declara soporte explicito de tool calling, function calling ni vision en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo abliterated con las del Qwen2.5-3B-Instruct original para estudiar como se distribuye la direccion de rechazo en las capas y que coste en divergencia (KL 0.0531) tiene su eliminacion.
- Analisis de robustez de filtros de contenido: usar el modelo como generador adversario para probar clasificadores de toxicidad o sistemas de moderacion antes de desplegarlos en produccion.
- Prototipado rapido de asistentes conversacionales en local: con 3B de parametros y contexto de 32K tokens, permite iterar sobre prompts de sistema y flujos multi-turno en una unica GPU de consumo sin coste de API.
- Generacion de texto creativo sin restricciones tematicas: ficcion, guiones o narrativa que aborden temas que el modelo base rechazaria por sus filtros de seguridad.
- Experimentos academicos de edicion de pesos: el repositorio incluye los hiperparametros y scripts de reproduccion, por lo que sirve para replicar y extender la metodologia de abliteration sobre otros checkpoints.
- Generacion de datos sinteticos para ajuste fino: producir pares instruccion-respuesta sobre dominios donde el modelo original se negaba a responder, siempre que el uso cumpla la licencia.
- Evaluacion comparativa de derivados "uncensored": medir el impacto de la intervencion sobre tareas estandar (seguimiento de instrucciones, coherencia, fidelidad factual) frente al modelo original y otros derivados similares.
- Despliegue en entornos air-gapped: al ser un modelo pequeno y autocontenido, puede ejecutarse offline en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Las unicas metricas reportadas por el autor son las siguientes:

| Metrica | Este modelo | Qwen/Qwen2.5-3B-Instruct |
|---|---|---|
| Divergencia KL | 0,0531 | 0 (por definicion) |
| Rechazos | 3/100 | 97/100 |

Nota: no se especifica la bateria de prompts utilizada para medir los rechazos, por lo que la cifra no es directamente comparable con otras evaluaciones. Los resultados de evaluacion detallados del modelo base se reportan en el blog de Qwen2.5 enlazado mas abajo.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 6,2 GB en FP16/BF16, alrededor de 3,1 GB en INT8 y entre 1,8 y 2,5 GB en cuantizacion de 4 bits.
- KV cache: con GQA (2 cabezas KV, 36 capas, head_dim 128) el cache en FP16 ocupa aproximadamente 1,15 GB para el contexto completo de 32.768 tokens, por lo que el consumo real en FP16 con contexto largo ronda los 8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4090). Para contexto completo de 32K en FP16 conviene disponer de 12-16 GB. En A100 o H100 se puede servir con lotes grandes y mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas de 8 GB o mas usando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (version con soporte de `qwen2`), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF a partir del checkpoint safetensors. El repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Qwen publica mediciones de memoria y throughput para el modelo base en su documentacion de benchmarks de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| eadwadasad/Qwen2.5-3B-Instruct-heretijariondavidsonn | 3,09B | 32.768 tokens | qwen-research | Derivado abliterated con Heretic; 3/100 rechazos; KL 0,0531 |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | qwen-research | Modelo original alineado; 97/100 rechazos |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con contexto mayor; benchmarks comparativos no disponibles en la informacion proporcionada |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Alternativa algo menor y con contexto mas corto; benchmarks comparativos no disponibles en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de estos modelos en tareas estandar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated, la eliminacion de la direccion de rechazo puede afectar tambien a la calidad general, la coherencia o la fidelidad factual; la divergencia KL de 0,0531 indica que la distribucion de salida se ha modificado de forma medible respecto al original.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad para este derivado. El modelo puede reproducir y amplificar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion propio de un modelo de 3B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- El repositorio solo declara soporte de ingles, aunque el modelo base cubre mas de 29 idiomas; el rendimiento en otros idiomas no esta verificado tras la abliteration.
- La licencia es qwen-research (campo `other` en el repositorio). Se debe revisar el texto completo de la licencia de Qwen antes de cualquier uso comercial, ya que puede restringir el uso a fines de investigacion.
- El uso de un modelo sin filtros de seguridad traslada al desarrollador toda la responsabilidad sobre el contenido generado y su conformidad con la legislacion aplicable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0,0 GB, por lo que conviene verificar la integridad de los pesos antes de desplegarlo en produccion.
- No hay confirmacion de soporte de tool calling ni de salidas estructuradas garantizadas en este derivado concreto.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a Instagram y a sitios de trading), por lo que no hay informacion externa independiente que valide las afirmaciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eadwadasad/Qwen2.5-3B-Instruct-heretijariondavidsonn
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo original instruction-tuned: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de referencia (Qwen2 Technical Report): https://arxiv.org/abs/2407.10671
- Instrucciones de reproduccion: https://huggingface.co/eadwadasad/Qwen2.5-3B-Instruct-heretijariondavidsonn/blob/main/reproduce/README.md
