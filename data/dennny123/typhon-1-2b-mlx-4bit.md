# dennny123/Typhon-1.2B-MLX-4bit

## Resumen

Typhon-1.2B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Typhon-1.2B, desarrollado por el usuario dennny123 y publicado en Hugging Face. Está especializado en corrección ortográfica y tipográfica (typo-correction) y diseñado para ejecutarse en local sobre Apple Silicon. El modelo base se construye sobre la arquitectura LFM2 (Liquid Foundation Model 2) de Liquid AI, con 1.170.340.608 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia lfm1.0.

El paquete ocupa 1,2 GB en el repositorio y 0,66 GB en pesos cuantizados, con un tiempo medido de aproximadamente 190 ms por mensaje en un Apple M4. Incluye además un componente opcional de decodificación especulativa (un drafter DSpark) que reduce la latencia mediana a unos 111 ms por mensaje manteniendo prácticamente la misma salida que la decodificación greedy.

Su relevancia radica en ser un modelo pequeño, especializado y pensado para inferencia on-device en Macs, lo que lo hace útil para tareas de limpieza de texto en tiempo real sin depender de servicios en la nube. Es un modelo de nicho: no es un modelo generalista y su pipeline no está declarado en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), tag `lfm2`; detalles internos no disponibles |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base completo está en dennny123/Typhon-1.2B |
| Idiomas soportados | no disponible (los ejemplos de la model card están en inglés) |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo se basa en la familia LFM2 de Liquid AI, según el tag `lfm2` de la ficha. No se dispone de información detallada sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento del modelo base Typhon-1.2B. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento.

La innovación técnica destacable es la inclusión de un drafter de decodificación especulativa denominado DSpark, fine-tuneado a partir de LiquidAI/LFM2.5-1.2B-Instruct-DSpark sobre los datos de entrenamiento de Typhon. Este drafter lee los estados ocultos de Typhon y propone los siguientes 4 tokens de golpe, que el modelo principal verifica en una sola pasada. Según el autor, la salida coincide con la decodificación greedy normal en 97 de cada 100 casos, y las diferencias restantes se deben al redondeo de la cuantización de 4 bits en empates casi exactos entre palabras. La cuantización a 4 bits se presenta como de "casi ninguna pérdida de calidad" respecto al modelo completo, sin que se aporten métricas de evaluación que lo respalden.

## Capacidades

- Corrección ortográfica y tipográfica de texto: el ejemplo de la model card transforma "cna u pikc up some milk on the way hoem" en "Can you pick up some milk on the way home?".
- Generación de texto corto orientada a reescritura o pulido de mensajes (prompt `Polish: ...\nOut: `).
- Inferencia on-device en Apple Silicon mediante la librería `mlx-lm`.
- Decodificación especulativa opcional con el drafter DSpark para reducir latencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; los ejemplos publicados son en inglés.

## Casos de uso

- Corrección de mensajes de chat en tiempo real: el modelo reescribe frases con erratas en aproximadamente 190 ms en un M4, lo que permite integrarlo en un cliente de mensajería que corrija el texto antes de enviarlo, sin salir del dispositivo.
- Autocorrección en editores de texto y correo en macOS: al ejecutarse con MLX sobre Apple Silicon, puede enchufarse a un plugin de edición que pula el texto seleccionado manteniendo los datos en local.
- Preprocesado de datos para pipelines de NLP: limpiar y normalizar textos con erratas antes de alimentar modelos mayores o bases de datos, aprovechando su bajo coste computacional.
- Transcripción asistida: combinar un motor de voz a texto con Typhon para corregir errores típicos de transcripción (homófonos, palabras partidas) en una app de notas.
- Prototipado de asistentes de escritura offline: servir como componente de reescritura en aplicaciones de escritorio que requieren privacidad y no pueden enviar texto a la nube.
- Evaluación de decodificación especulativa: usar el drafter DSpark incluido como caso de estudio para medir el impacto de la decodificación especulativa en latencia sobre hardware Apple, dado que el autor publica cifras de mediana y p90.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo aporta métricas de latencia y de coincidencia con la decodificación greedy:

| Metrica (Apple M4) | Greedy simple | Con drafter DSpark (4 tokens por paso) |
|---|---|---|
| Mediana por mensaje | 199 ms | 111 ms |
| Percentil 90 | 303 ms | 175 ms |
| Coincidencia con greedy | referencia | 97/100 idénticos |

No se aportan datos de throughput (tokens/s) ni de consumo de memoria durante la inferencia más allá del tamaño de pesos (0,66 GB).

## Requisitos de hardware

- VRAM/memoria unificada: los pesos cuantizados ocupan 0,66 GB; el repositorio completo pesa 1,2 GB. La memoria necesaria para inferencia no está documentada, pero por el tamaño de pesos debería ser del orden de 1-2 GB de memoria unificada, dato no confirmado por el autor.
- GPU recomendadas: Apple Silicon (mediciones en un Apple M4). No se documenta soporte para GPU NVIDIA, AMD ni CPU x86, ya que el formato es MLX.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente; no aplica a GPUs de consumo tipo RTX 4090 porque el formato MLX es específico de Apple.
- Opciones de despliegue: `mlx-lm` (carga y generación), y el módulo `dspark_mlx` incluido en el repositorio para decodificación especulativa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 199 ms y p90 de 303 ms en greedy; mediana de 111 ms y p90 de 175 ms con el drafter DSpark, en un Apple M4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de Typhon-1.2B que permitan una comparación rigurosa con alternativas. Se indica a continuación lo que se conoce de modelos de la misma familia o propósito:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Typhon-1.2B-MLX-4bit | 1.170.340.608 | no disponible | MLX safetensors 4-bit | lfm1.0 | Especializado en corrección ortográfica, on-device |
| LiquidAI/LFM2.5-1.2B-Instruct-DSpark | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo del que se fine-tuneó el drafter DSpark |
| Typhon-1.2B (base) | 1.170.340.608 (según la version cuantizada) | no disponible | safetensors | lfm1.0 | Versión completa sin cuantizar |

No se dispone de información sobre otros modelos comparables de corrección ortográfica on-device con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de nicho: está especializado en corrección ortográfica y pulido de texto; no debe esperarse un comportamiento generalista de chat, razonamiento o código.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; al ser un modelo de reescritura, puede introducir cambios no deseados en el texto original, especialmente en frases ambiguas.
- La afirmación de "casi ninguna pérdida de calidad" frente al modelo completo no va acompañada de métricas de evaluación publicadas.
- La coincidencia del 97/100 con la decodificación greedy se midió en un conjunto de prueba propio del autor; no se especifica su tamaño ni composición.
- Idiomas: no se declaran idiomas soportados; los ejemplos son en inglés y no hay evidencia de buen rendimiento en castellano.
- Licencia lfm1.0 (marcada como `other`): conviene revisar los términos completos antes de un uso comercial, ya que las licencias de la familia LFM pueden incluir restricciones de uso.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon; no es portable directamente a CUDA.
- Contexto máximo no disponible: no se puede garantizar el comportamiento en entradas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dennny123/Typhon-1.2B-MLX-4bit
- Modelo base: https://huggingface.co/dennny123/Typhon-1.2B
- Modelo del que se fine-tuneó el drafter DSpark: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Librería MLX-LM: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
