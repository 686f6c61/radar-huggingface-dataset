# qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-4K

## Resumen

Qwen3.5-9B-NVFP4-QAD-Code-4K es una cuantizacion de 8 bits del modelo Qwen/Qwen3.5-9B, publicada por el usuario qatfactory bajo licencia Apache 2.0. Se trata de un artefacto derivado que aplica cuantizacion consciente del entrenamiento (QAT, quantization-aware training) combinada con el formato NVFP4 (bloque de 4 bits NVFP4 de NVIDIA) y una calibracion orientada a codigo con ventana de 4K, segun indica el propio nombre del repositorio. El resultado se distribuye en formato compressed-tensors compatible con vLLM.

El modelo base, Qwen3.5-9B, pertenece a la familia Qwen3.5 de Alibaba, con aproximadamente 9.400 millones de parametros. Esta version cuantizada mantiene ese numero de parametros totales (9.409.813.744) pero reduce la huella de almacenamiento a 8,9 GB en safetensors, lo que la hace atractiva para despliegues en GPU con memoria limitada o para servir cargas de trabajo de generacion de codigo en produccion.

La relevancia de esta ficha radica en que se trata de un modelo recien publicado (noviembre de 2026), con acceso restringido en Hugging Face y sin datos publicos de benchmarks ni de idiomas. Es una opcion a considerar cuando se busca una variante de 8 bits de Qwen3.5-9B optimizada para tareas de codigo y servible con vLLM, pero requiere validacion propia antes de llevarla a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el sufijo "4K" del nombre sugiere calibracion a 4096 tokens, no necesariamente el contexto maximo del modelo base |
| Tipos de cuantizacion | 8 bits en formato NVFP4 (compressed-tensors), con QAT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de la familia Qwen3.5 de Alibaba, con unos 9.400 millones de parametros. La informacion proporcionada no detalla la arquitectura interna (numero de capas, atencion, posibles componentes MoE o hibridos), por lo que esos datos se consideran no disponibles.

Sobre el proceso de cuantizacion: el repositorio aplica QAT (quantization-aware training) sobre el modelo base para producir pesos en formato NVFP4 (4 bits con escalado por bloque, empaquetados como 8 bits en compressed-tensors). El sufijo "Code-4K" indica que la calibracion o el ajuste se ha orientado a cargas de codigo con ventana de 4.096 tokens. No se especifican el numero de tokens de calibracion, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia cuantizacion QAT + NVFP4.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones especificas en la informacion disponible.
- Generacion de codigo: el sufijo "Code-4K" sugiere un ajuste o calibracion orientada a tareas de programacion, si bien no se aportan metricas que lo confirmen.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado en la model card).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia eficiente con vLLM: el modelo se distribuye en formato compressed-tensors y declara vLLM como libreria, por lo que esta pensado para servirse con ese motor.

## Casos de uso

- Asistencia de codigo en IDE: integracion como backend de autocompletado y generacion de funciones en editores, aprovechando la cuantizacion de 8 bits para reducir VRAM y el ajuste orientado a codigo con ventana de 4K.
- Revision de pull requests: analisis de diffs y generacion de comentarios de revision en pipelines de CI/CD, servido con vLLM para atender peticiones concurrentes.
- Generacion de tests unitarios: produccion de casos de prueba a partir de firmas de funciones o especificaciones, en un flujo por lotes donde el coste por token importa.
- Documentacion tecnica automatica: generacion de docstrings y documentacion de API a partir del codigo fuente, en tareas de contexto corto (por debajo de 4K tokens).
- Chatbot de soporte para desarrolladores: respuestas sobre APIs y errores de compilacion en conversaciones multi-turno, con la salvedad de que el contexto efectivo debe validarse.
- Prototipado en GPU de consumo: despliegue local en estaciones de trabajo con una sola GPU para experimentacion con Qwen3.5-9B sin necesidad de los pesos completos en BF16.
- Extraccion y transformacion de codigo: tareas de refactorizacion acotada o conversion entre lenguajes en fragmentos de hasta 4K tokens, donde la calibracion del modelo esta alineada con la longitud de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se aportan datos de MMLU, HumanEval, GSM8K ni de comparativas con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,9 GB en safetensors; en vLLM con compressed-tensors se debe reservar memoria adicional para cache KV y overhead del runtime, por lo que se recomienda al menos 12-16 GB de VRAM para contextos moderados. No se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 16 GB o mas (por ejemplo, RTX 4090, L40S, A100) seria el rango razonable, pero no esta confirmado por el autor.
- GPU de consumo: previsiblemente cabe en tarjetas de 16 GB o superiores; no confirmado.
- Opciones de despliegue: vLLM (declarado en la model card y en los tags, con soporte de compressed-tensors). No se indica compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-4K | 9.409.813.744 | no disponible | 8 bits NVFP4 con QAT | Apache 2.0 | Acceso restringido (gated) en Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9.400 millones | no disponible en esta ficha | BF16 (pesos completos) | Apache 2.0 | Publico en Hugging Face |
| Otras cuantizaciones de Qwen3.5-9B (GPTQ, AWQ, GGUF) | ~9.400 millones | depende de la variante | 4-8 bits | segun autor | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, es probable que arrastre sesgos de Qwen3.5-9B, pero no hay informacion oficial.
- Riesgo de alucinacion: no evaluado para esta cuantizacion; la cuantizacion a 8 bits puede degradar ligeramente la fidelidad respecto al modelo base, especialmente en tareas de razonamiento largo.
- Limitaciones de contexto e idioma: el sufijo "4K" sugiere calibracion a 4.096 tokens; el comportamiento mas alla de esa longitud no esta garantizado. Los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene revisar los terminos del modelo base Qwen3.5-9B.
- Caveats para produccion: sin benchmarks publicados, sin datos de latencia ni throughput, y con cero descargas y cero likes en el momento de la ficha; se recomienda una evaluacion propia exhaustiva antes de desplegar. La compatibilidad se limita a vLLM segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-4K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
