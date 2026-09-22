# mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit

## Resumen

MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por la organizacion mlx-community. El modelo base es una destilacion construida sobre la arquitectura Qwen3.5 de 9B, con 8.953.801.728 parametros totales y una arquitectura `qwen3_5` de 32 capas: 8 de atencion completa y 24 de atencion lineal, 16 cabezas de atencion, 4 cabezas KV, `head_dim` 256, dimension oculta 4096 y vocabulario de 248.320 tokens.

La relevancia de esta ficha concreta esta en la cuantizacion: no es un 4-bit uniforme, sino una asignacion por capas de 4 y 8 bits generada con el toolkit mlx-optiq. 134 capas se mantienen a 8 bits y 116 a 4 bits, con una media resultante de 6,34 bits por peso y un tamano en disco de 6,77 GB frente a los aproximadamente 18 GB del modelo en bf16. El objetivo es ejecutar un modelo de casi 9.000 millones de parametros en Apple Silicon con una perdida de calidad contenida y sin dependencia de PyTorch ni de servicios en la nube.

Un detalle metodologico importante declarado por el autor: la asignacion por capas no se midio sobre este modelo, sino que se transfirio desde mlx-community/Qwen3.5-9B-OptiQ-4bit, cuya receta procede de un barrido de sensibilidad por divergencia KL sobre una mezcla de calibracion de seis dominios. La transferencia se justifica porque ambas arquitecturas coinciden capa a capa y los 250 tensores de la receta encontraron correspondencia (250/250, 0 sin emparejar). No se ejecuto la puntuacion de capacidad de seis metricas para este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer hibrido: 8 capas de atencion completa + 24 de atencion lineal), 32 capas, 16 cabezas, 4 cabezas KV, head_dim 256, hidden 4096, vocab 248.320 |
| Parametros totales | 8.953.801.728 (aproximadamente 8,95B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta: 134 capas a 8 bits, 116 capas a 4 bits; 6,34 bits por peso; group size 64; existe el padre en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `mlx`; artefacto MLX para Apple Silicon) |
| Tamano en disco | 6,77 GB (repo de 7,1 GB); el padre bf16 ocupa aproximadamente 18 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer hibrido de tipo `qwen3_5` con 32 capas que combina 8 capas de atencion completa con 24 capas de atencion lineal, 16 cabezas de consulta y 4 cabezas KV, con `head_dim` de 256 y estado oculto de 4096. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ni en la model card del quant ni en los resultados de busqueda consultados: esos datos pertenecen al modelo base y no se han proporcionado aqui.

En cuanto a la innovacion tecnica de este artefacto, es la receta de cuantizacion de precision mixta generada por mlx-optiq. La logica consiste en medir la sensibilidad de cada capa a la perdida de precision y conservar a 8 bits las que mas sufren, aplastando el resto a 4 bits, en lugar de aplicar un ancho uniforme. En este caso la receta se transfirio desde mlx-community/Qwen3.5-9B-OptiQ-4bit: como ambas arquitecturas comparten rol y forma capa a capa, los 250 tensores de la receta encontraron su correspondiente (0 sin emparejar), lo que evita que algun tensor caiga silenciosamente a 4 bits plano. El propio autor advierte de la limitacion del metodo: la sensibilidad mide como afecta la perdida de precision al rol de una capa en la arquitectura, pero no puede saber si el entrenamiento propio de este modelo ha desplazado esa sensibilidad; para eso recomienda ejecutar `optiq convert` y hacer el barrido sobre el modelo concreto.

Las verificaciones realizadas y publicadas son: coincidencia 250/250 de tensores con la receta; comparacion de generacion contra el padre en bf16 con prompts identicos (recuerdo factual, aritmetica mostrando el desarrollo, una implementacion iterativa de Fibonacci y una explicacion tecnica), con respuestas concordantes y una ejecucion entre 2,4 y 7 veces mas rapida; y el contrato de publicacion de OptiQ (estructura del artefacto, metadatos y aserciones de precision mixta). No se ejecuto la puntuacion de capacidad de seis metricas, y las puntuaciones publicadas para el quant de Qwen3.5-9B corresponden a ese modelo, no a este.

## Capacidades

- Generacion de texto conversacional multi-turno en el pipeline `text-generation`.
- Recuerdo factual y explicaciones tecnicas, verificado contra el padre en bf16 con prompts identicos.
- Aritmetica con desarrollo mostrado y generacion de codigo (se valido una implementacion iterativa de Fibonacci).
- Uso de herramientas y function calling: las etiquetas del artefacto incluyen `tool-use` y `agentic`.
- Flujos de agente y razonamiento multi-paso, segun las mismas etiquetas.
- Ejecucion local en Apple Silicon mediante MLX, sin PyTorch ni nube (segun la documentacion de mlx-optiq).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Asistente local en portatil de Apple Silicon: con 6,77 GB en disco y una sola dependencia (`mlx-lm` o `mlx-optiq`), el modelo cabe en equipos con memoria unificada moderada y permite un asistente de conversacion sin enviar datos a terceros.
- Agente con uso de herramientas en local: las etiquetas `agentic` y `tool-use` lo orientan a bucles de llamada a funciones; se puede conectar a APIs internas, sistema de ficheros o consultas a bases de datos dentro de un runtime propio.
- Generacion de codigo en el editor: el modelo resuelve tareas de sintesis de codigo verificadas de forma cualitativa (aritmetica y Fibonacci) y puede integrarse como autocompletado o generador de funciones en un flujo de desarrollo con revision humana.
- Prototipado offline y trabajo de campo: al no requerir conectividad, resulta adecuado para entornos aislados donde no se puede usar una API remota.
- Evaluacion comparativa de cuantizaciones: sirve como sujeto de prueba para medir el impacto de una receta 4-bit mixta frente al padre bf16 en prompts de control, dado que el autor documenta ese procedimiento.
- Procesamiento por lotes en Mac: al correr entre 2,4 y 7 veces mas rapido que el bf16 segun el autor, es util para clasificacion, resumen o reescritura de lotes de documentos en un equipo de sobremesa.
- Base para ajuste fino local: mlx-optiq se presenta como toolkit para cuantizar, ajustar y servir modelos, por lo que este quant puede servir de punto de partida para adaptaciones de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la puntuacion de capacidad de seis metricas no se ejecuto para este modelo y que las puntuaciones publicadas del quant de Qwen3.5-9B describen a ese otro modelo.

Las unicas mediciones publicadas son internas y cualitativas:

| Prueba | Metodologia | Resultado declarado |
|---|---|---|
| Coincidencia de receta | Comparacion tensor a tensor contra la receta OptiQ | 250/250 tensores emparejados, 0 sin emparejar |
| Recuerdo factual | Generacion con prompts identicos frente al padre bf16 | Respuestas concordantes |
| Aritmetica con desarrollo | Generacion con prompts identicos frente al padre bf16 | Respuestas concordantes |
| Implementacion de Fibonacci | Generacion iterativa con prompts identicos frente al padre bf16 | Respuestas concordantes |
| Explicacion tecnica | Generacion con prompts identicos frente al padre bf16 | Respuestas concordantes |
| Velocidad de generacion | Comparacion con el padre bf16 | Entre 2,4 y 7 veces mas rapido |

No se aportan cifras absolutas de tokens por segundo, latencia por token ni resultados en MMLU, HumanEval, GSM8K u otros conjuntos estandar.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el peso del modelo ocupa 6,77 GB, por lo que se necesita al menos ese espacio mas el margen de la cache KV, el runtime de MLX y el buffer de activaciones. En la practica, un equipo con 16 GB de memoria unificada es el minimo razonable; 24 o 32 GB dan mas holgura para contextos largos.
- GPU compatibles: exclusivamente Apple Silicon (serie M). El artefacto usa la libreria `mlx` y el ecosistema mlx-optiq, que es nativo de Apple Silicon; no se declara soporte para CUDA.
- Cabe en GPU de consumo: si, pero solo en el sentido de SoC de Apple. No hay GPU de consumo NVIDIA soportada por este artefacto concreto. El modelo en bf16 (aproximadamente 18 GB) si es un objetivo mas natural para GPUs con 24 GB o mas.
- Opciones de despliegue: `mlx-optiq` (`optiq serve --model mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit`) o `mlx-lm` directamente cargando el repositorio con `mlx_lm.load` y generando con `mlx_lm.generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no se publican cifras absolutas. La unica referencia es relativa: entre 2,4 y 7 veces mas rapido que la generacion con el padre en bf16 sobre los mismos prompts.
- Metadatos de cuantizacion: el mapa de bits por capa esta en `optiq/metadata.json` y en el bloque `quantization` de `config.json`, lo que permite auditar la asignacion antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit | 8,95B | no disponible | 4 bits mixta (6,34 bpw) | MIT | MLX, safetensors; 6,77 GB |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (padre) | 8,95B | no disponible | bf16 | no disponible en la informacion proporcionada | safetensors; aproximadamente 18 GB |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | no disponible | no disponible | 4 bits mixta con asignacion medida por divergencia KL | no disponible en la informacion proporcionada | MLX; usado como origen de la receta |
| Qwen3.5-9B (arquitectura de referencia) | no disponible | no disponible | no disponible | no disponible | referenciado como arquitectura compartida |

No se dispone de datos de rendimiento comparativo entre estas alternativas, ni de otros modelos de la misma categoria con los que contrastar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Procedencia de la receta: la asignacion de bits no se midio sobre este modelo, sino que se transfirio del quant equivalente de Qwen3.5-9B. El autor reconoce que un cambio de sensibilidad provocado por el entrenamiento propio no se detectaria con ese metodo.
- Cuantizacion no uniforme: 116 capas operan a 4 bits. Aunque la verificacion cualitativa coincide con el padre bf16, no se aportan metricas objetivas de degradacion.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni ninguna otra cifra publicada; cualquier afirmacion de rendimiento relativo entre modelos seria especulativa.
- Idiomas no declarados: la model card no enumera idiomas soportados, por lo que no se puede garantizar cobertura multilingue ni la calidad en castellano.
- Longitud de contexto desconocida: no se indica la ventana admitida, un dato critico para planificar casos de uso con documentos largos.
- Exclusividad de plataforma: el artefacto depende de MLX y esta pensado para Apple Silicon; no es portable directamente a CUDA ni a despliegues en servidores x86 con GPU NVIDIA. Para esos entornos habria que partir del modelo base en otros formatos.
- Post-procesado y plantillas: la generacion requiere aplicar la plantilla de chat del tokenizer (`apply_chat_template`); usarlo sin plantilla degrada la calidad de las respuestas.
- Sesgos y alucinacion: no se documenta ninguna evaluacion de sesgo ni de tasas de alucinacion para este modelo; se aplican los riesgos habituales de un modelo de lenguaje de 9B destilado, agravados por la falta de datos publicados sobre el dataset de entrenamiento.
- Estado del repositorio: el artefacto tiene 0 descargas declaradas, por lo que no existe validacion independiente de la comunidad en el momento de redactar esta ficha.
- Licencia: MIT segun los metadatos del repositorio, lo que permite uso comercial; conviene verificar la licencia del modelo base de XiaomiMiMo antes de un despliegue en produccion, ya que no se ha confirmado en la informacion disponible.
- Irrelevancia de los resultados de busqueda: las busquedas web realizadas devolvieron unicamente paginas de laminas para colorear sin ninguna relacion con el modelo; no se han podido recoger articulos, papers ni analisis externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/MiMo-V2.6-Distill-Qwen-9B-OptiQ-4bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Quant origen de la receta: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Toolkit mlx-optiq: https://mlx-optiq.com
- Laboratorio de mlx-optiq: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; las busquedas devolvieron exclusivamente paginas de laminas para colorear sin relacion con el modelo.
