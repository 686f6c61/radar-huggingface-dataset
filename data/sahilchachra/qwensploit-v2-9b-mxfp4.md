# sahilchachra/Qwensploit-V2-9B-MXFP4

## Resumen

Qwensploit-V2-9B-MXFP4 es una cuantizacion en formato MXFP4 del modelo `xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5`, un ajuste fino orientado a ciberseguridad y red team sobre una base Qwen3.5 de 9B. El modelo original parte, a su vez, de `xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, un merge de modelos Qwen3.5 sin censura. La cuantizacion la publica el usuario `sahilchachra` y esta pensada especificamente para ejecutarse en Apple Silicon mediante la libreria MLX.

Se trata de un modelo vision-language (image-text-to-text) con una torre de vision Qwen3-VL y un backbone de texto hibrido que combina atencion lineal GatedDeltaNet con atencion completa cada cuatro capas. El repositorio contiene 9.409.813.744 parametros en total y ocupa 5,7 GB en disco (5,3 GB en dos shards de pesos). La cuantizacion aplica solo al backbone de texto, incluido el `lm_head`, mientras que la torre de vision se mantiene en bf16.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar un modelo de 9B con capacidades de vision y razonamiento en hardware de consumo Apple; por otro, es un ejemplo de modelo especializado en seguridad ofensiva, un nicho con implicaciones eticas y legales importantes que condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GatedDeltaNet + atencion completa (cada 4 capas), 32 capas, torre de vision Qwen3-VL |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (E2M1 + escala compartida E8M0, grupo de 32); existe tambien una variante MXFP8 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | other (la licencia del modelo base no se extiende automaticamente a todos los datos de entrenamiento del fine-tune) |
| Formato de pesos | safetensors (formato MLX, 2 shards) |

## Arquitectura y entrenamiento

El backbone de texto es un transformer hibrido de 32 capas que alterna capas de atencion lineal GatedDeltaNet con capas de atencion completa, aplicando atencion completa cada cuarta capa. Esta combinacion busca reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de la atencion densa. La torre de vision es la de Qwen3-VL y se mantiene en bf16 tras la cuantizacion, de modo que el modelo conserva la ruta multimodal completa.

El proceso de entrenamiento del modelo original no esta documentado en la informacion disponible: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El modelo base es un merge de tres variantes de Qwen3.5 (Claude-3xMerge) sin censura, posteriormente ajustado para tareas de ciberseguridad. La cuantizacion MXFP4 se aplica con MLX a 4.821 bits por peso, incluyendo el `lm_head` (que no esta atado a los embeddings, `tie_word_embeddings=false`). La cabeza MTP (multi-token prediction) para decodificacion especulativa del repositorio original se ha descartado porque mlx-vlm no la carga ni la convierte, por lo que la decodificacion especulativa no esta disponible en esta version.

## Capacidades

- Generacion de texto y razonamiento con canal de pensamiento explicito (`reasoning_content` / `<think>`) antes de la respuesta final.
- Comprension de imagenes: la torre de vision en bf16 responde correctamente a preguntas sobre color y forma de imagenes simples (verificado con imagenes de color solido y una figura geometrica).
- Conocimiento especializado en ciberseguridad: comandos de reconocimiento (por ejemplo, escaneos SYN con nmap), conceptos de red team y seguridad ofensiva.
- Razonamiento aritmetico basico verificado (25 + 17 = 42).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el canal de pensamiento sugiere capacidad de razonamiento secuencial, pero no hay validacion publicada.
- Capacidades multilingues: no disponibles.
- Integracion con API compatible con OpenAI a traves de LM Studio (`/v1/chat/completions`).

## Casos de uso

- Formacion y laboratorios de seguridad ofensiva: el modelo responde a preguntas sobre tecnicas de pentesting (escaneos, reverse shells) y puede usarse como asistente en entornos de formacion controlados y autorizados, siempre con supervision humana.
- Analisis de imagenes en contextos de seguridad: al conservar la torre de vision, puede interpretar capturas de pantalla de herramientas, diagramas de red o paneles de administracion para apoyar tareas de reconocimiento en laboratorios.
- Asistencia a investigadores de seguridad en Apple Silicon: al estar cuantizado en MXFP4 y empaquetado para MLX, permite ejecutar un modelo de 9B con vision en un Mac sin GPU dedicada, util para pruebas rapidas y prototipado local.
- Generacion de documentacion tecnica de seguridad: redaccion de notas de pentest, explicaciones de vulnerabilidades y resumenes de hallazgos, aprovechando el canal de razonamiento para estructurar el contenido.
- Evaluacion de riesgos de modelos sin censura: investigadores de alineacion y seguridad pueden estudiar el comportamiento de un fine-tune sin censura especializado en dominio ofensivo, comparandolo con modelos alineados.
- Despliegue local en LM Studio: integracion en flujos de trabajo personales mediante la API compatible con OpenAI en `localhost:1234`, util para automatizar consultas de seguridad en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada son pruebas de humo con decodificacion greedy determinista sobre preguntas de texto (capital de Francia, suma aritmetica, comando nmap) y sobre imagenes (color y forma), todas correctas. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 5,3 GB de pesos en disco mas overhead de ejecucion; en Apple Silicon se comparte memoria unificada, por lo que se recomienda un minimo de 8-16 GB de RAM unificada para margen de contexto y cache KV.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no esta pensado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y memoria suficiente; no aplica a GPUs NVIDIA/AMD en este formato.
- Opciones de despliegue: mlx-vlm (version >= 0.6.12, necesaria para la arquitectura `qwen3_5`) y LM Studio con runtime MLX integrado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato/hardware |
|---|---|---|---|---|---|
| Qwensploit-V2-9B-MXFP4 | 9,4B | No disponible | Si (Qwen3-VL, bf16) | other | MLX, Apple Silicon |
| Qwensploit-V2-9B-MXFP8 | 9,4B (aprox.) | No disponible | Si | other | MLX, Apple Silicon |
| Qwensploit-V2-9B-CyberSecurity-Qwen3.5 (base) | 9,4B (aprox.) | No disponible | Si | other | safetensors (bf16) |
| Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic (ancestro) | 9B (aprox.) | No disponible | Si | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de seguridad de otros proveedores, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo especializado en seguridad ofensiva: puede generar contenido operativo de red team y pentesting. Su uso debe limitarse a contextos autorizados y conforme a la legislacion aplicable.
- Licencia `other`: la licencia del modelo base no cubre automaticamente todos los datos de entrenamiento del fine-tune; algunos datasets de razonamiento o sinteticos pueden tener restricciones de entrenamiento competitivo. Revisar la model card original antes de uso comercial o redistribucion.
- Modelo sin censura en su linaje: el merge base es explicitamente "UNCENSORED", lo que implica mayor probabilidad de generar contenido sensible o inapropiado sin filtros.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; las pruebas de humo son limitadas y no cubren escenarios adversos.
- Decodificacion especulativa no disponible: la cabeza MTP del repositorio original se ha descartado, lo que puede reducir el throughput frente al modelo base.
- Modelo de razonamiento: requiere `max_tokens` de al menos 200 para evitar respuestas truncadas con `finish_reason: "length"` mientras el modelo sigue en el canal de pensamiento.
- Contexto e idiomas no documentados: no hay informacion sobre la ventana de contexto ni sobre el rendimiento en castellano.
- Dependencia de mlx-vlm >= 0.6.12 y de Apple Silicon: no es portable a otras plataformas sin reconversion.
- Sin descargas ni validacion comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa es practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sahilchachra/Qwensploit-V2-9B-MXFP4
- Variante MXFP8: https://huggingface.co/sahilchachra/Qwensploit-V2-9B-MXFP8
- Modelo base (fine-tune de ciberseguridad): https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Modelo ancestro (merge sin censura): https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor de la cuantizacion: https://huggingface.co/sahilchachra
