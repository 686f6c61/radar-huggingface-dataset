# SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-8bit

## Resumen

Este repositorio contiene una conversión a formato MLX de 8 bits del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario SirSahOl. No se trata de un entrenamiento nuevo ni de un fine-tuning: es una conversión weight-only (solo pesos) que conserva la arquitectura, el tokenizador y el comportamiento del modelo original, pero adapta los pesos para ejecutarse con el framework MLX de Apple sobre chips de la serie M. El resultado ocupa 1,8 GB en disco y pesa 1.777.088.000 parámetros reales según los safetensors del repositorio.

La relevancia de esta ficha es práctica: permite ejecutar un modelo conversacional de casi 1.800 millones de parámetros en un Mac con memoria unificada limitada, sin GPU dedicada y sin depender de CUDA. La model card reporta que en un Apple M1 con 8 GB de memoria unificada la variante de 8 bits alcanza 31,0 tokens/s con un TTFT de 32,26 ms, frente a los 52,9 tokens/s y 18,91 ms de la variante de 4 bits del mismo autor. Es, por tanto, una pieza de infraestructura de despliegue local más que un avance de modelado.

El modelo base es de la familia DeepSeek-R1-Distill, destilada sobre una arquitectura Qwen2 (etiqueta `qwen2` en el repositorio), con licencia MIT heredada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 10 de septiembre de 2026, con última actualización ese mismo día. No hay información publicada sobre idiomas soportados ni sobre benchmarks de calidad (MMLU, GSM8K, HumanEval) en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (heredada del modelo base; la model card no detalla la configuracion de capas ni cabezas) |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; se advierte degradacion con contextos superiores a 8K tokens) |
| Tipos de cuantizacion | 8 bits (esta publicacion). El mismo autor ofrece una variante de 4 bits. La model card menciona tambien 16 bits como opcion en el modelo base |
| Idiomas soportados | No disponible (campo de idiomas vacio en HuggingFace y no documentado en la model card) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX, cuantizados a 8 bits |
| Tamano del repositorio | 1,9 GB |
| Tamano de salida de la conversion | 1,8 GB |
| Framework de ejecucion | MLX (mlx-lm), exclusivo de Apple Silicon |
| Version de mlx-lm usada | 0.31.3 |
| Tiempo de conversion | 11,35 s |
| Fecha de conversion | 2026-09-10T21:55:55 UTC |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (relacion: quantized) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card indica explicitamente que esta publicacion es una conversion de pesos unicamente ("weight-only conversion"): la arquitectura y el comportamiento se heredan integramente del modelo de origen. El repositorio lleva la etiqueta `qwen2`, por lo que la topologia subyacente es un transformer decoder-only de la familia Qwen2, con el tokenizador y la plantilla conversacional del modelo base. La conversion se realizo con `python3 -m mlx_lm.convert --hf-path deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --mlx-path output/DeepSeek-R1-Distill-Qwen-1.5B-mlx-8bit -q --q-bits 8` sobre mlx-lm 0.31.3.

No hay informacion en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de destilacion que dio lugar al modelo base DeepSeek-R1-Distill-Qwen-1.5B. Tampoco se documenta ninguna innovacion tecnica adicional en la conversion (no se aplica decodificacion especulativa, atencion lineal ni tecnicas de compresion mas alla de la cuantizacion de pesos a 8 bits). El unico artefacto propio del proceso es la cuantizacion de 8 bits, que introduce una perdida de calidad pequena pero no nula respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno: el repositorio esta etiquetado como `conversational` y el nombre incluye el sufijo `-chat`, lo que indica que se conserva una plantilla de chat apta para dialogos.
- Razonamiento y resolucion de problemas: capacidades heredadas del linaje DeepSeek-R1-Distill del modelo base, aunque la model card no las documenta ni las cuantifica en esta conversion.
- Generacion de codigo y matematicas: presumiblemente heredadas del modelo base por tratarse de una destilacion de R1, pero no hay evaluacion publicada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card ni en las etiquetas del repositorio).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (campo de idiomas vacio).
- Capacidades especiales (modo thinking explicito, vision, audio): no disponible. El tag `base_model_relation: quantized` confirma que no se ha anadido ninguna capacidad nueva.
- Ejecucion en Apple Silicon: capacidad operativa real y verificada, mediante MLX, con CLI interactiva (`mlx_lm.chat`) y generacion por linea de comandos (`mlx_lm.generate`).

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse con `mlx_lm.chat` en un Mac con 8 GB o mas de memoria unificada, lo que permite tener un chatbot funcional sin enviar datos a la nube y sin GPU dedicada. Es adecuado por su tamano reducido (1,8 GB) y su naturaleza conversacional.
- Prototipado rapido de aplicaciones de IA en equipos de desarrollo con hardware Apple: permite validar prompts, plantillas de chat y flujos multi-turno antes de migrar a un modelo mayor o a infraestructura con CUDA, a un coste de memoria muy bajo.
- Procesamiento de texto por lotes en local: clasificacion, extraccion de entidades, reescritura y resumen de documentos cortos mediante la API de Python de mlx-lm, aprovechando que el modelo cabe entero en memoria unificada junto a otros procesos.
- Generacion asistida de borradores de codigo y de tests unitarios simples en entornos de desarrollo offline o con requisitos de confidencialidad, donde no esta permitido enviar el codigo a servicios externos.
- Educacion y experimentacion academica: al ser una destilacion de un modelo de razonamiento y tener licencia MIT, sirve para estudiar tecnicas de destilacion y cuantizacion, asi como para reproducir la conversion de forma exacta con el comando documentado.
- Integracion en aplicaciones de escritorio para macOS: el formato MLX y el peso de 1,8 GB permiten empaquetar el modelo dentro de una aplicacion nativa que consuma la libreria mlx-lm mediante Python embebido, con tiempos de primera respuesta del orden de decenas de milisegundos segun la medicion publicada.
- Comparacion de cuantizaciones en produccion: el mismo autor publica una variante de 4 bits, lo que permite medir empiricamente el compromiso entre calidad, latencia (52,9 frente a 31,0 tokens/s) y consumo de memoria en el hardware objetivo antes de decidir cual desplegar.

## Benchmarks y rendimiento

La model card solo publica mediciones de eficiencia, no de calidad. Se reproducen tal cual, con la advertencia de que la fila de memoria parece inconsistente (la variante de 4 bits reporta mas memoria pico que la de 8 bits, algo contrario a lo esperable):

| Metrica | 4 bits | 8 bits |
|---|---|---|
| Tokens por segundo | 52,9 | 31,0 |
| TTFT (tiempo hasta el primer token) | 18,91 ms | 32,26 ms |
| Memoria pico | 808,0 MB | 354,3 MB |

Condiciones declaradas: Apple M1 con 8 GB de memoria unificada, media de 5 ejecuciones, `max_tokens` de 256. No se han publicado resultados de calidad (MMLU, HumanEval, GSM8K, MATH ni ningun otro) en la informacion disponible, ni para esta conversion ni para la variante de 4 bits.

## Requisitos de hardware

- Pesos en disco: 1,8 GB para la variante de 8 bits; el repositorio completo ocupa 1,9 GB.
- Memoria estimada para inferencia: los pesos de 8 bits suman aproximadamente 1,8 GB, a los que hay que sumar la cache KV y el contexto. La model card reporta una memoria pico de 354,3 MB en su configuracion de prueba, cifra que no cuadra con el tamano de los pesos y que conviene tratar con cautela.
- Hardware obligatorio: Apple Silicon (M1 o posterior). El modelo no funciona con MLX en CPU x86, GPU NVIDIA ni GPU AMD.
- Compatibilidad con GPU de consumo: si, en el sentido de que cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o mas. La model card recomienda 4 bits para M1/M2 de 8 GB, 8 bits para M1/M2 Pro o Max con 16-32 GB, y 16 bits para M2/M3/M4 Ultra con 64 GB o mas.
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplicables con este formato, ya que MLX no las soporta. Para usarlas habria que recurrir al modelo base en safetensors estandar o a una conversion GGUF.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, mas API de Python con `load` y `generate`). No hay soporte directo para vLLM, llama.cpp, Ollama ni TGI sin reconvertir los pesos a otro formato.
- Latencia y throughput medidos: 31,0 tokens/s y 32,26 ms de TTFT en la variante de 8 bits sobre M1 con 8 GB; la variante de 4 bits alcanza 52,9 tokens/s y 18,91 ms de TTFT en el mismo hardware.
- La model card advierte de que el rendimiento puede degradarse con contextos muy largos (superiores a 8K tokens) en niveles de cuantizacion bajos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-8bit (este) | 1,777 M | safetensors MLX, 8 bits, 1,8 GB | No disponible | MIT | HuggingFace, requiere Apple Silicon |
| SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-4bit | No disponible (mismo modelo base) | safetensors MLX, 4 bits | No disponible | MIT | HuggingFace, requiere Apple Silicon; 52,9 tokens/s y 18,91 ms de TTFT en M1 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | No disponible en la informacion proporcionada | safetensors estandar, sin cuantizar (16 bits) | No disponible | MIT | HuggingFace; ejecutable con transformers, vLLM y otros frameworks, no necesita Apple Silicon |

No se dispone de datos sobre otras alternativas comparables (por ejemplo, conversiones GGUF del mismo modelo base o modelos de ~1,5 B de otras familias) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Es una conversion weight-only: no aporta ninguna mejora ni capacidad nueva respecto al modelo base. Cualquier limitacion del original se hereda intacta.
- La cuantizacion a 8 bits introduce una perdida de calidad respecto al modelo sin cuantizar. El autor indica que a menor numero de bits, mayor perdida.
- Requiere obligatoriamente Apple Silicon (M1 o posterior). No es ejecutable con MLX en otras plataformas ni con los frameworks habituales de servidor (vLLM, TGI) sin reconvertir los pesos.
- Degradacion declarada del rendimiento con contextos superiores a 8K tokens en niveles de cuantizacion bajos. La longitud de contexto oficial no se especifica en la documentacion.
- Riesgo de alucinacion: no documentado en la model card, pero inherente a los modelos generativos de este tamano; no hay evaluacion publicada que lo acote.
- Sesgos conocidos: no documentados. El campo de idiomas esta vacio, por lo que se desconoce el comportamiento fuera del ingles y de los idiomas mayoritarios del dataset de entrenamiento original.
- La tabla de memoria de la model card (808,0 MB en 4 bits frente a 354,3 MB en 8 bits) es contradictoria con el tamano de los pesos y con la logica de la cuantizacion; conviene verificar esas cifras en el hardware propio antes de dimensionar un despliegue.
- Licencia MIT, lo que permite uso comercial y modificacion, pero al derivar del modelo base conviene revisar tambien la model card del original por si hubiera condiciones adicionales de la familia DeepSeek-R1.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni evidencia de uso en produccion. Tratar como artefacto reciente y no auditado.
- Un modelo de 1,5 B no es adecuado para tareas que exijan razonamiento complejo, contextos muy largos o alta fidelidad factual; para esos escenarios hay que subir de escala.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-8bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Variante de 4 bits del mismo autor: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-4bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- MLX Foundry, pipeline de conversion usado: https://github.com/SirSahOl/mlx-foundry
- Nota: los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo (corresponden a guias sobre dispositivos de audio en Windows), por lo que no se incluyen enlaces adicionales de papers, blogs o demos.
