# brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp es un fine-tune del modelo base Qwen/Qwen3.8-27B, publicado por el usuario brainworkup en Hugging Face. Se distribuye como un checkpoint de aproximadamente 27.781 millones de parametros en formato safetensors con cuantizacion de 6 bits (etiqueta "oQ6e") y licencia Apache 2.0. La model card describe un ajuste fino de multiples etapas con tecnicas que el autor denomina "Cold Fusion", "GAIN Training" y "Multi-stage tuning", orientado a eliminar restricciones de alineacion (el tag "uncensored" y "heretic") y a incorporar un sistema de modos de operacion embebido.

El modelo se presenta como multimodal (pipeline image-text-to-text) y con soporte para 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita. La model card menciona 27 modos de razonamiento, 27 modos de instruccion, 15 "AI Constructs", 5 "Super AI Constructs" y 21 "AGI Constructs", asi como un sistema interactivo que se activa escribiendo "help" en el prompt.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni likes en el momento de la consulta, el autor del fine-tune no es el desarrollador del modelo base, y gran parte de las afirmaciones de la model card (rendimiento, modos, constructos) no estan respaldadas por benchmarks publicos ni por documentacion tecnica verificable. Esta ficha recoge unicamente lo que consta en la informacion disponible y marca explicitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens segun la model card (minimo recomendado 32k; 64k-128k sugerido) |
| Tipos de cuantizacion | Checkpoint en 6 bits (oQ6e); el autor remite a repositorios GGUF separados para otras cuantizaciones |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUFs en repositorio aparte del autor original |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B mas alla de que se trata de un transformer. El fine-tune se describe como un "branch from scratch" y una escision de un proyecto mayor del autor original (DavidAU), con ajuste fino en multiples etapas sobre los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. Las tecnicas citadas ("Cold Fusion", "GAIN Training", "Multi-stage tuning", "Turbo Brilliance V2 50x AGI") no vienen acompanadas de descripcion tecnica, hiperparametros, numero de tokens de entrenamiento ni composicion del dataset, por lo que no es posible evaluar su naturaleza ni su efecto real sobre el modelo.

Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion, ni que innovaciones de inferencia incorpora (decodificacion especulativa, atencion lineal, etc.). La etiqueta "mtp" del nombre del repositorio sugiere multi-token prediction, pero no se confirma en la model card. En resumen: la arquitectura y el proceso de entrenamiento no estan documentados de forma verificable en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con modos de razonamiento e instruccion seleccionables segun la model card (27 de cada).
- Procesamiento multimodal image-text-to-text segun el pipeline declarado y la etiqueta del repositorio.
- Soporte declarado de 16 idiomas, incluido el espanol.
- Escritura creativa, ficcion, narrativa y roleplaying, segun los tags del repositorio.
- Generacion de codigo y uso como "Coder AI Construct" segun la model card.
- Sistema embebido de ayuda interactiva: al introducir "help" como prompt se despliegan los modos y sistemas disponibles.
- "Constructos" de agente y de profesor universal mencionados en los tags (Agent AI Construct, Universal Teacher AI Construct), sin documentacion tecnica adicional.
- No se confirma soporte de tool calling, function calling ni de razonamiento multi-paso con herramientas; no disponible.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta ajustado explicitamente para generacion narrativa, guiones y roleplaying, con modos de instruccion que permiten fijar tono y genero; adecuado para prototipado de contenido editorial.
- Conversacion multi-turno con contexto largo: con una ventana declarada de hasta 256k tokens, puede mantener hilos extensos o procesar documentos largos en una sola pasada, util para asistentes de analisis documental.
- Generacion de codigo asistida: los tags incluyen "coder" y la model card menciona un "Coder AI Construct"; puede emplearse en tareas de autocompletado y explicacion de codigo, aunque sin garantias de calidad verificadas por benchmarks.
- Traduccion y atencion multilingue: al cubrir 16 idiomas, sirve para prototipos de traduccion o atencion al cliente en varios idiomas, con la salvedad de que no hay evaluaciones publicadas de calidad por idioma.
- Experimentacion en investigacion sobre alineacion: al ser un modelo "uncensored" y "heretic", es util como objeto de estudio para analizar el efecto de eliminar restricciones de seguridad en modelos de este tamano.
- Despliegue local en hardware de gama alta: al estar disponible en 6 bits y con GGUFs alternativos, puede ejecutarse en estaciones de trabajo con GPU de 24-48 GB para tareas de generacion offline.
- Generacion de imagenes vectoriales o diagramas descritos en texto (el autor muestra ejemplos de SVG), como apoyo a tareas de diseno tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos (una prueba de "V2 Turbo Brilliance 50x" con unos 8000 tokens de instrucciones procesados en aproximadamente 60 segundos y una salida de unos 3000 tokens), pero no ofrece metricas estandar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en 6 bits: aproximadamente 21-24 GB solo para los pesos, mas overhead de contexto; con 64k-128k tokens de contexto la VRAM efectiva puede superar los 30-40 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 6000 Ada para contexto completo; RTX 4090 (24 GB) puede ser insuficiente en 6 bits con contextos largos y requeriria cuantizaciones GGUF de 4 bits.
- Cabe en GPU de consumo: solo con cuantizaciones GGUF de 4 bits o inferiores y contextos reducidos; no disponible el dato exacto de VRAM para cada cuantizacion.
- Opciones de despliegue: transformers (formato nativo del repositorio); llama.cpp, Ollama o vLLM para las versiones GGUF publicadas por el autor original en repositorios separados.
- Latencia y throughput: no disponibles; el unico dato es el ejemplo cualitativo de la model card (unos 60 segundos para procesar 8000 tokens de entrada y generar 3000 de salida), sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp | 27,78 B | 256k (declarado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune sin benchmarks publicos |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B | no disponible en esta ficha | Apache 2.0 (segun el fine-tune) | Hugging Face | Base oficial; referencia de calidad |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27,78 B | 256k (declarado) | Apache 2.0 | Hugging Face | Mismo linaje, versiones GGUF del autor original |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | ~40 B | no disponible | Apache 2.0 (segun repositorio) | Hugging Face | Version mayor del mismo linaje, mas exigente en hardware |

No se dispone de datos de rendimiento comparado entre estos modelos; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": el ajuste elimina deliberadamente restricciones de seguridad, por lo que puede generar contenido toxico, ilegal o danino; no es apto para produccion orientada al publico sin filtros adicionales.
- Ausencia total de benchmarks publicos: no hay evidencia verificable de calidad, razonamiento o codigo frente al modelo base.
- Riesgo elevado de alucinacion: los fine-tunes creativos y sin alineacion tienden a inventar datos; no se documenta ninguna mitigacion.
- Trazabilidad dudosa: el repositorio lo publica un tercero (brainworkup) sobre un fine-tune de DavidAU, con 0 descargas y 0 likes; no hay garantia de integridad ni de mantenimiento.
- La model card contiene afirmaciones no verificables ("27 modos de razonamiento", "AGI Constructs", "Turbo Brilliance") sin documentacion tecnica que las respalde.
- Contexto declarado de 256k sin evidencia de evaluacion de recuperacion en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden imponer condiciones adicionales no detalladas; verificar antes de desplegar.
- Idiomas: aunque se listan 16, no hay evaluaciones de calidad por idioma; el espanol esta incluido pero sin datos de rendimiento.
- Soporte de tool calling y agentes no confirmado; no disenar pipelines que dependan de ello sin validacion previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF del autor original: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Version 40B del mismo linaje: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- GGUFs de la version 40B: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 40B Build2: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2
- Transformer con looping experimental: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Proyecto origen del fine-tune: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Perfil del autor original: https://huggingface.co/DavidAU
