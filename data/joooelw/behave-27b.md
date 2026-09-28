# joooelw/BEHAVE-27B

## Resumen

BEHAVE-27B es un ajuste fino orientado a agentes del modelo multimodal Qwen3.8-27B, publicado por el usuario joooelw, especializado en el co-desarrollo multi-turno de diseños RTL (Verilog/SystemVerilog) y de modelos de comportamiento ejecutables para verificación de hardware. El problema que aborda es concreto: en lugar de generar un único bloque de código, el modelo está entrenado para mantener conversaciones de varias iteraciones sobre un mismo diseño, alternando propuesta de RTL, modelos de referencia y correcciones guiadas por el resultado de herramientas de simulación o comprobación.

El checkpoint publicado corresponde a la etiqueta `hf40`, obtenido tras 40 actualizaciones de GRPO sobre un conjunto fijo de 540 tareas (BEHAVE-Train), partiendo de Qwen3.8-27B. Según la model card, se trata del modelo de RL con conjunto de datos fijo y no del modelo de auto-mejora que el autor menciona por separado. El repositorio incluye los pesos completos en 178 shards de safetensors, junto con la configuración, el tokenizer, el chat template y la configuración del procesador.

Con 26.895.998.464 parámetros reales y un repositorio de 53,8 GB, el modelo se sitúa en la categoría de 27B densos, lo que lo hace desplegable en GPUs de gama alta de un solo nodo con cuantización. Su relevancia actual es acotada pero específica: hay muy pocos modelos abiertos entrenados explícitamente con RL para flujos agénticos de diseño y verificación de hardware, y este publica pesos completos bajo Apache 2.0. No obstante, el repositorio no presenta descargas ni validación externa en el momento de la consulta, por lo que debe tratarse como un artefacto de investigación sin verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder, familia Qwen3.8, heredada del modelo base Qwen/Qwen3.8-27B |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio distribuye únicamente pesos en safetensors (sin GGUF ni AWQ/GPTQ publicados por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (178 shards + índice de pesos) |
| Modelo base | Qwen/Qwen3.8-27B (relación: finetune) |
| Método de ajuste | GRPO (40 actualizaciones) sobre el pool fijo BEHAVE-Train de 540 tareas |
| Revisión de descarga | `hf40` (export interno numerado `hf_39`, los índices de actualización empiezan en cero) |
| Tamaño del repositorio | 53,8 GB |
| Librería declarada | transformers |
| Pipeline declarado | text-generation (los tags incluyen también image-text-to-text) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-27B, un transformer decoder denso de ~27B parámetros. Los tags del repositorio incluyen `qwen3_5` e `image-text-to-text`, lo que apunta a una variante multimodal del base, aunque el `pipeline_tag` declarado para este ajuste es `text-generation`. La model card no documenta cambios estructurales respecto al base: no se describe modificación de capas de atención, cabezas ni mecanismos híbridos, por lo que debe asumirse que BEHAVE-27B conserva la topología del modelo original y solo modifica los pesos mediante RL.

El entrenamiento consiste en 40 actualizaciones de GRPO sobre un conjunto fijo de 540 tareas del pool BEHAVE-Train, partiendo del checkpoint Qwen3.8-27B. La model card distingue explícitamente este modelo (RL sobre conjunto fijo) del modelo de auto-mejora, que es un artefacto separado y no se distribuye en este repositorio. No se publican detalles sobre la función de recompensa, la composición exacta de las 540 tareas, el número de tokens vistos, la mezcla de datos ni si hubo etapas previas de SFT o DPO. Tampoco se incluyen estados del optimizador, logs de entrenamiento ni otros checkpoints intermedios, lo que limita la reproducibilidad del proceso de RL a los pesos finales y al entorno de herramientas descrito en el repositorio de código.

La innovación destacable no es arquitectónica sino de flujo: el modelo está optimizado para co-desarrollo multi-turno asistido por herramientas, donde el agente propone RTL, propone un modelo de comportamiento ejecutable y refina ambos a partir de la realimentación del entorno. La reproducción de esa evaluación requiere el entorno de herramientas BEHAVE y la configuración de tareas; descargar solo los pesos no reproduce los experimentos.

## Capacidades

- Generación de RTL en Verilog/SystemVerilog para bloques de diseño digital, orientada a flujos de co-desarrollo iterativo.
- Generación de modelos de comportamiento ejecutables para verificación, es decir, referencias funcionales que pueden simularse y compararse contra el RTL.
- Razonamiento multi-turno y multi-paso: el modelo está entrenado para refinar un diseño a lo largo de varias interacciones, no para producir una respuesta única.
- Integración en bucles agénticos con herramientas, en el sentido de que el entrenamiento con GRPO se realizó sobre tareas del entorno BEHAVE, que implica ejecución y comprobación.
- Capacidades heredadas del modelo base Qwen3.8-27B: generación de texto, razonamiento y, según los tags del repositorio, procesamiento de entradas de imagen y texto (`image-text-to-text`).
- Soporte conversacional, con chat template incluido en el repositorio.
- No se documentan en la información disponible capacidades específicas de tool calling nativo, modo de pensamiento explícito, audio ni idiomas soportados.

## Casos de uso

- Co-desarrollo iterativo de RTL: un ingeniero describe un bloque funcional, el modelo genera una primera versión en Verilog, la simula en su entorno y en la siguiente iteración corrige el diseño a partir de los errores de compilación o de simulación. Es el escenario para el que fue entrenado explícitamente.
- Generación de modelos de referencia para verificación: el modelo puede producir una implementación de comportamiento de la misma especificación que el RTL bajo prueba, que se usa como oráculo en un testbench para comparar salidas ciclo a ciclo.
- Construcción de entornos de testbench: generación de estímulos, secuencias de prueba y chequeos a partir de la especificación del módulo, reduciendo el trabajo manual de escribir el andamiaje de verificación.
- Refactorización y traducción de RTL existente: dada una descripción en un estilo o nivel de abstracción distinto, el modelo puede reescribir el bloque manteniendo el comportamiento, con verificación posterior mediante el modelo de referencia.
- Asistentes de diseño integrados en el editor: al ser un modelo de 27B con pesos abiertos y licencia Apache 2.0, puede desplegarse en infraestructura propia para autocompletado y revisión de RTL sin enviar propiedad intelectual a servicios externos.
- Formación y prototipado educativo: generación de ejemplos de circuitos y de sus modelos de comportamiento para docencia de diseño digital, siempre con revisión humana del resultado.
- Exploración de espacio de diseño en agentes multi-paso: dado que el entrenamiento se hizo sobre tareas de un entorno agéntico, puede emplearse como política de un agente que propone variantes de microarquitectura y las evalúa iterativamente.
- Automatización de revisiones de código de hardware: detección de patrones problemáticos en RTL (por ejemplo, lógica combinacional con realimentación o asignaciones incompletas) y propuesta de corrección, con validación posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de BEHAVE-27B no incluye ninguna tabla de métricas, y los resultados de búsqueda encontrados corresponden al modelo base Qwen3.8-27B, no a este ajuste, por lo que no son atribuibles a BEHAVE-27B.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 54 GB solo para pesos, más KV cache y overhead; requiere GPUs de 80 GB (A100 80 GB, H100 80 GB, H200) o tensor parallelism sobre varias GPUs.
- VRAM en cuantización de 8 bits: del orden de 27-30 GB de pesos, desplegable en A100 40 GB (ajustado), L40S 48 GB, RTX 6000 Ada 48 GB o A6000 48 GB.
- VRAM en cuantización de 4 bits: del orden de 14-16 GB de pesos, lo que permite ejecución en RTX 4090 24 GB, RTX 3090 24 GB y GPUs de 16 GB con contexto reducido. Esta ruta requiere convertir los pesos, ya que el autor no publica GGUF ni cuantizaciones listas para usar.
- Cabe en GPU de consumo: sí en el rango de 24 GB con cuantización de 4 bits; en 16 GB solo con cuantizaciones agresivas y ventanas de contexto pequeñas.
- Opciones de despliegue: vLLM, SGLang o TGI para servir los safetensors en FP16/BF16 o cuantizados en línea; llama.cpp u Ollama únicamente tras convertir los pesos a GGUF, conversión que el autor no proporciona.
- Latencia y throughput estimados: no disponible.
- Espacio en disco: 53,8 GB para el repositorio completo de safetensors antes de cualquier conversión.

## Comparativa con modelos similares

La información disponible solo permite comparar con el propio modelo base. No se documentan en las fuentes proporcionadas alternativas abiertas equivalentes de RL para diseño de hardware con las que establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEHAVE-27B | ~26,9 B | no disponible | GRPO sobre 540 tareas BEHAVE-Train (40 actualizaciones) | Apache 2.0 | Pesos safetensors en HuggingFace, revisión `hf40` |
| Qwen3.8-27B | ~27 B (base) | no disponible en la información proporcionada | Modelo base multimodal de Alibaba | Según modelo base | Público en HuggingFace |

Datos del modelo base citados por fuentes externas de la búsqueda web (no verificados de forma independiente y no aplicables directamente a BEHAVE-27B): SWE-bench Pro 61,7, IFBench 79,5, OSWorld-Verified 84,3 y Humanity's Last Exam 30,8, con mejora declarada sobre Claude Opus 4.6 Max en 16 de 24 benchmarks. Estos valores proceden de resúmenes de terceros sobre Qwen3.8-27B y deben tratarse con cautela.

## Limitaciones y advertencias

- El propio autor advierte de que el RTL y los modelos de referencia generados pueden contener errores y requieren verificación independiente antes de su uso.
- El modelo no sustituye a la verificación de hardware ni al signoff; no debe emplearse como única fuente de validación de un diseño destinado a fabricación.
- Riesgo de alucinación alto en un dominio donde la corrección sintáctica no garantiza corrección funcional: un módulo puede compilar y simular sin errores y aun así implementar un comportamiento incorrecto.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar su comportamiento fuera de las tareas de BEHAVE-Train.
- El ajuste se realizó sobre un pool fijo de 540 tareas: es esperable un rendimiento inferior en estilos de RTL, lenguajes de descripción de hardware o metodologías de verificación no representados en ese conjunto.
- Se trata de un único checkpoint final (`hf40`); no se publican estados del optimizador, logs ni checkpoints intermedios, lo que limita la reproducibilidad y la posibilidad de auditar el proceso de RL.
- Reproducir la evaluación multi-turno exige el entorno de herramientas BEHAVE y su configuración de tareas; los pesos por sí solos no reproducen los resultados del artículo.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; conviene verificar las condiciones del modelo base Qwen3.8-27B, que pueden imponer requisitos adicionales.
- El repositorio no registra descargas ni valoraciones y no cuenta con validación independiente de la comunidad en el momento de la consulta, por lo que no se recomienda su adopción en producción sin una evaluación propia.
- El tamaño del repositorio (53,8 GB) y la ausencia de cuantizaciones publicadas añaden coste de infraestructura y de conversión antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joooelw/BEHAVE-27B
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y benchmarks BEHAVE: https://github.com/joel-wu/BEHAVE
- Análisis externo de benchmarks de Qwen3.8-27B (fuente de terceros): https://regolo.ai/qwen3-8-27b-benchmarks-every-test-where-alibabas-27b-model-beats-claude-opus-4-6-max/
- Análisis externo de Qwen3.8-27B en local (fuente de terceros): https://kingy.ai/news/qwen3-8-27b-local-ai-model-review/
