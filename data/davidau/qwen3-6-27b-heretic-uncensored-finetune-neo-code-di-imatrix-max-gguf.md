# DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF es una cuantizacion GGUF publicada por DavidAU sobre un fine-tune propio del modelo Qwen3.6-27B. La cadena de derivacion parte del modelo base Qwen/Qwen3.6-27B, al que se le aplico un proceso de "abliteration" (eliminacion de comportamientos de rechazo, etiquetado como "heretic") y posteriormente un fine-tune realizado con Unsloth sobre un dataset personalizado. El resultado se distribuye en multiples niveles de cuantizacion con matrices de importancia propias (NEO/Code Di-IMatrix), orientadas a preservar precision en contexto largo, codigo y matematicas.

El modelo tiene 26.895.998.464 parametros (aproximadamente 27B) y se presenta con una ventana de contexto de 256k tokens segun la model card. Esta etiquetado con el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la informacion disponible no detalla la arquitectura de vision. Los idiomas declarados son ingles y chino.

Su relevancia practica radica en tres factores: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, la disponibilidad de cuantizaciones GGUF de 2 a 8 bits facilita el despliegue en hardware consumer, y la eliminacion de rechazos lo hace atractivo para generacion creativa, rol y escritura de ficcion sin filtros. El autor reporta una divergencia KL de 0,0469 respecto al modelo original y una tasa de rechazos de 4/100 frente a 99/100 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.6-27B; detalles especificos no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k tokens (segun model card) |
| Tipos de cuantizacion | GGUF en multiples niveles, incluyendo IQ2_M, Q4/IQ4_S, Q6, Q8 y mxfp8; repo de 182,2 GB |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); el modelo base se distribuye en bfloat16 |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking |
| Metodo de cuantizacion | NEO/Code Di-IMatrix (matrices de importancia propias) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-27B, un transformer denso de aproximadamente 27B parametros. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Lo que si se documenta es el proceso de derivacion: primero se aplico una tecnica de abliteration ("Heretic'ing") para eliminar los comportamientos de rechazo del modelo original, y despues un fine-tune de bajo nivel con Unsloth sobre un dataset personalizado, con el objetivo declarado de incrementar ligeramente el rendimiento sin alterar las caracteristicas del modelo Qwen original.

El autor reporta metricas del proceso heretic: divergencia KL de 0,0469 respecto al original (valores por debajo de 0,3 se consideran buenos) y una reduccion de rechazos de 99/100 a 4/100 en un conjunto de prueba de 100 prompts. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el fine-tune. La cuantizacion se realizo con matrices de importancia NEO/Code Di-IMatrix, disenadas para mantener la precision en contexto largo, conversaciones multi-turno, codigo y matematicas; el autor afirma que Q4/IQ4_S alcanza el 94% del rendimiento en BF16, Q6 cerca del 98% e IQ2_M el 83%.

## Capacidades

- Generacion de texto y razonamiento en modo instruct y modo thinking (heredado del modelo base "Thinking").
- Generacion de codigo y matematicas, con cuantizaciones optimizadas especificamente para estas tareas.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuacion de historias y prosa vivida en todos los generos (ciencia ficcion, romance, etc.).
- Roleplaying y conversacion multi-turno sin filtros de rechazo.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text declarado), aunque no se detallan las capacidades de vision concretas.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling, function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Escritura de ficcion y novelas: el modelo esta afinado especificamente para generacion de tramas, subtramas y continuacion de escenas, con capacidad de mantener prosa consistente en contexto largo gracias a los 256k tokens de ventana.
- Roleplaying y narrativa interactiva: la eliminacion de rechazos permite conversaciones de personaje sin interrupciones moralizantes, adecuado para plataformas de rol y juegos de texto.
- Generacion de codigo en local: las cuantizaciones NEO/Code Di-IMatrix estan optimizadas para codigo, y el formato GGUF permite desplegarlo en estaciones de trabajo sin GPU de datacenter.
- Asistencia a guionistas y equipos editoriales: generacion de borradores, variantes de escena y subtramas alternativas en ingles o chino, con la licencia Apache 2.0 permitiendo integracion en productos comerciales.
- Procesamiento de documentos largos con componente visual: al declarar pipeline image-text-to-text y 256k de contexto, puede emplearse para resumir o extraer informacion de documentos extensos que incluyan imagenes, aunque la capacidad de vision no esta documentada en detalle.
- Despliegue en hardware consumer: las cuantizaciones IQ2_M y Q4 permiten ejecutar un modelo de 27B en GPUs de gama alta para consumo, habilitando prototipado local de aplicaciones de escritura creativa.
- Investigacion sobre alineacion y censura: el par de modelos (original censurado frente a version heretic) con metricas de divergencia KL publicadas sirve como caso de estudio para medir el coste de eliminar rechazos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los benchmarks internos del autor (Nightmedia) sobre el modelo predecesor, en modo instruct y cuantizacion mxfp8:

| Metrica | Modelo heretic + finetune | Qwen3.6-27B original (instruct) |
|---|---|---|
| ARC-C | 0,673 | 0,647 |
| ARC-E | 0,846 | 0,803 |
| BoolQ | 0,905 | 0,910 |
| HellaSwag | no disponible | 0,773 |
| OpenBookQA | no disponible | 0,450 |
| PIQA | no disponible | 0,806 |
| Winogrande | no disponible | 0,742 |

El autor advierte que el modo instruct suele puntuar mas alto que el modo thinking por el consumo de tokens de razonamiento y los limites de contexto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la informacion disponible. Las afirmaciones del autor sobre que el modelo se situa "en la zona de OpenAI, Claude y Gemini" no estan respaldadas por datos verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 55-60 GB en BF16; unos 28-32 GB en Q6; unos 16-18 GB en Q4/IQ4_S; unos 10-12 GB en IQ2_M (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU de datacenter: A100 80 GB o H100 para BF16 o Q8 con contexto largo; A100 40 GB para Q6.
- GPU consumer: RTX 4090 (24 GB) puede ejecutar Q4/IQ4_S con contexto moderado; RTX 3090 (24 GB) en las mismas condiciones; GPUs de 12-16 GB pueden ejecutar IQ2_M con contexto reducido.
- Contexto largo: los 256k tokens requieren KV cache considerable; con contexto completo en Q4 se necesitan varias decenas de GB adicionales, por lo que en consumer conviene limitar el contexto efectivo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI requieren conversion a safetensors o uso del modelo base en bfloat16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-27B Heretic FINETUNE NEO-CODE Di-IMatrix) | ~27B | 256k | Apache 2.0 | GGUF | Sin censura, cuantizaciones optimizadas, fine-tune propio |
| Qwen/Qwen3.6-27B (original) | ~27B | 256k | Apache 2.0 (segun model card del derivado) | safetensors, bfloat16 | Modelo de referencia censurado; rechazos 99/100 |
| DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking | ~27B | no disponible | Apache 2.0 | bfloat16 | Modelo base directo de esta cuantizacion, sin cuantizar |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | ~27B | no disponible | Apache 2.0 | GGUF | Version posterior del mismo autor que, segun el, supera a este modelo |

No se dispone de datos de benchmarks comparativos verificables frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la eliminacion de rechazos implica que puede generar contenido inapropiado, ofensivo o danino sin filtros; requiere moderacion externa en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas o codigo incorrecto; el fine-tune de bajo nivel no elimina este riesgo.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset de fine-tune es desconocido, por lo que los sesgos heredados de Qwen3.6-27B y del corpus de ajuste no estan caracterizados.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: los 256k tokens son el maximo declarado; el rendimiento efectivo en contextos muy largos con cuantizaciones bajas (IQ2_M) puede degradarse, y el autor solo aporta metricas agregadas de retencion de precision.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.6-27B y el modelo intermedio mantienen la misma licencia; ademas, la ausencia de censura traslada al desplegador la responsabilidad legal sobre el contenido generado.
- Afirmaciones no verificadas: las comparaciones del autor con OpenAI, Claude y Gemini, asi como la superioridad sobre el Qwen3.6-27B original, se basan en benchmarks internos parciales y no en evaluaciones independientes.
- Capacidad multimodal incierta: el pipeline image-text-to-text esta declarado, pero no se documenta el codificador visual ni se aportan benchmarks de vision.
- Repo de 182,2 GB: descargar el repositorio completo requiere espacio considerable; conviene descargar solo el archivo GGUF del nivel de cuantizacion deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base directo: https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic2-Uncensored-Finetune-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Version posterior recomendada por el autor (711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante 40B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Variante 9B del mismo autor: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
