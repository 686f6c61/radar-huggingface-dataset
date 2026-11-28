# mlx-community/Astrea-R8-Chat-9B-OptiQ-4bit

## Resumen

Astrea-R8-Chat-9B-OptiQ-4bit es una cuantizacion mixta en formato MLX del modelo HemmingwayAI/Astrea-R8-Chat-9B, un ajuste fino de Qwen3.5-9B orientado a conversacion y escritura creativa. La publica mlx-community, la organizacion de referencia para pesos optimizados para Apple Silicon, y esta pensada para ejecutar el modelo localmente en un Mac sin depender de PyTorch ni de servicios en la nube.

El checkpoint conserva la torre de vision en bf16 como sidecar y cuantiza la torre de lenguaje a precision mixta de 4 y 8 bits por capa, reduciendo el peso en disco de 18,8 GB (bf16) a 8,0 GB. Mantiene la ventana de contexto del modelo base, de 262.144 tokens, y el pipeline image-text-to-text, por lo que cubre tanto generacion de texto como entrada de imagenes.

Su relevancia es practica: permite desplegar un modelo de casi 9.000 millones de parametros con capacidades multimodales y contexto muy largo en hardware de consumo de Apple, con un servidor local (`optiq serve`) que incorpora decodificacion por borrador de n-gramas para acelerar cargas de edicion y reescritura de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), torre de lenguaje + torre de vision; pesos en MLX |
| Parametros totales | 8.953.801.728 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta 4/8 bits por capa (116 capas a 4 bits, 134 a 8 bits, 250 en total), group size 64; torre de vision en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `optiq_vision.safetensors` para la torre de vision (333 tensores) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B, una arquitectura transformer densa de aproximadamente 8.950 millones de parametros con una torre de vision acoplada que habilita la entrada de imagenes junto a texto. La model card no detalla la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO; esa informacion corresponde al autor original (HemmingwayAI) y no se reproduce en la ficha de la cuantizacion.

La innovacion de este checkpoint es el esquema de cuantizacion OptiQ: asignacion de precision por capa en lugar de una precision uniforme. La asignacion no se midio sobre este modelo, sino que se transfirio desde mlx-community/Qwen3.5-9B-OptiQ-4bit, cuya sensibilidad se determino mediante un barrido de divergencia KL sobre una mezcla de calibracion de seis dominios. La transferencia es valida porque ambas torres de lenguaje comparten arquitectura exacta y los 250 tensores coincidieron sin discrepancias. La decodificacion especulativa se ofrece via borrador de n-gramas (`--ngram-draft`), no mediante cabezas MTP, que este checkpoint no incorpora.

## Capacidades

- Generacion de texto conversacional y narrativo, con especial enfasis en escritura creativa y ficcion.
- Razonamiento basico y matematicas simples (verificado en la model card con un calculo de velocidad).
- Generacion de codigo, incluida la reescritura y edicion de funciones existentes.
- Entrada multimodal de imagenes (image-text-to-text): descripcion de contenido visual, objetos, colores y texto en imagen.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Servicio local mediante `optiq serve` y `optiq lab`, con API compatible con aplicaciones de chat.
- Decodificacion acelerada por n-gramas para cargas de edicion de codigo.
- Soporte de `mlx-lm` estandar para uso solo de texto.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa asistida: generacion de relatos, aperturas de cuento y desarrollo de ficcion, que es el dominio para el que se ajusto el modelo base; el contexto de 262.144 tokens permite mantener coherencia en novelas o sagas largas.
- Edicion y reescritura de codigo en local: renombrar parametros, refactorizar funciones y devolver el fichero completo; con `--ngram-draft 16` la model card reporta 44,9 tok/s frente a 16,6 tok/s sin borrador en un M4 de 24 GB.
- Asistente de documentacion tecnica: resumir y reescribir documentacion extensa aprovechando la ventana de contexto larga, sin enviar datos a la nube.
- Descripcion y catalogacion de imagenes: etiquetado de contenido visual (objetos, colores, texto incrustado) en flujos de gestion de activos digitales, gracias a la torre de vision en bf16.
- Prototipado de aplicaciones de chat en Apple Silicon: `optiq serve` expone el modelo a cualquier cliente que hable con la API local, util para demos y pruebas de producto sin coste de inferencia en nube.
- Procesamiento de documentos largos con imagen y texto: extraccion de informacion de informes escaneados o capturas combinada con razonamiento sobre el texto, dentro de un Mac de sobremesa.
- Generacion de codigo en produccion: no recomendada como caso principal por el throughput medido (18,0 tok/s con borrador), pero viable para tareas interactivas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye comprobaciones cualitativas y medidas de throughput:

| Prueba | Astrea | Modelo padre (Qwen3.5-9B-OptiQ-4bit) |
|---|---|---|
| Capital de Francia, una palabra | Paris | Paris |
| 120 km en 1,5 h, velocidad en km/h | 80 | 80 |
| `is_palindrome(s)` ignorando mayusculas y no letras | funcion correcta | funcion correcta |
| Apertura de relato corto, dos frases | respuesta coherente con redaccion propia | respuesta coherente |
| Imagen con rectangulo rojo, circulo azul y "42" | descripcion correcta de los tres elementos | no evaluado |

| Carga de trabajo (M4 24 GB, batch 1, greedy, mediana de 3) | Sin borrador | `--ngram-draft 16` |
|---|---|---|
| Edicion (renombrar parametro y devolver fichero) | 16,6 tok/s | 44,9 tok/s (2,7x) |
| Generacion de codigo | 16,7 tok/s | 18,0 tok/s (1,08x) |
| Prosa desde prompt de 1.024 tokens | 16,6 tok/s | 16,2 tok/s (0,98x) |

## Requisitos de hardware

- VRAM equivalente: 8,0 GB en disco (7,10 GB torre de lenguaje + 0,91 GB torre de vision); se recomienda al menos 16 GB de memoria unificada para dejar margen al contexto y al runtime.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Las medidas de la model card se tomaron en un M4 con 24 GB de memoria unificada.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este checkpoint, que depende de MLX; para esas plataformas habria que recurrir a otros formatos del modelo base.
- Cabe en Mac de consumo: si, en equipos con 16 GB o mas de memoria unificada; con 24 GB se dispone de holgura para contextos largos.
- Despliegue: `optiq serve` y `optiq lab` (paquete `mlx-optiq`), o `mlx-lm` para uso solo de texto. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Throughput medido: 16,6-16,7 tok/s en modo plano y hasta 44,9 tok/s en edicion de codigo con borrador de n-gramas, en un M4 de 24 GB.
- Latencia: no disponible de forma explicita; se deduce de las tasas de generacion anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Astrea-R8-Chat-9B-OptiQ-4bit | 8,95 B | 262.144 | Texto + imagen | Apache 2.0 | MLX (Apple Silicon) |
| HemmingwayAI/Astrea-R8-Chat-9B (base) | 8,95 B (18,8 GB bf16) | 262.144 | Texto + imagen | Apache 2.0 | Pesos originales |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | no disponible | no disponible | Texto (segun la informacion) | no disponible | MLX (Apple Silicon) |

La comparativa con alternativas de otros ecosistemas (por ejemplo, versiones GGUF del modelo base para llama.cpp u Ollama) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y podria degradarse.
- La asignacion de bits por capa se transfirio de otro modelo y no se midio sobre este checkpoint; aunque los tensores coinciden, no hay validacion de calidad especifica para este ajuste fino.
- Riesgo de alucinacion inherente a los modelos de ~9 B; las comprobaciones de la model card son cualitativas y no sustituyen una evaluacion sistematica.
- El throughput en generacion de codigo y prosa apenas mejora con el borrador de n-gramas (1,08x y 0,98x); el beneficio se concentra en tareas de edicion.
- No dispone de cabeza MTP, por lo que `--mtp` no es aplicable.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple Silicon; no es portable a CUDA sin reconversion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de ajuste fino del autor original.
- Capacidades de tool calling y de agente no documentadas; no deberian asumirse en produccion sin pruebas propias.
- El ajuste fino esta orientado a escritura creativa y chat; su rendimiento en tareas analiticas o de codigo complejo puede ser inferior al de modelos especializados.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Astrea-R8-Chat-9B-OptiQ-4bit
- Modelo base: https://huggingface.co/HemmingwayAI/Astrea-R8-Chat-9B
- Modelo de referencia para la asignacion de bits: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Toolkit mlx-optiq: https://mlx-optiq.com
- Documentacion: https://mlx-optiq.com/docs/
- Laboratorio: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Blog sobre la mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
