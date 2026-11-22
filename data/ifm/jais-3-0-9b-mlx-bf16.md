# IFM/Jais-3-0.9B-MLX-bf16

## Resumen

Jais-3-0.9B es el miembro compacto y denso de la familia Jais-3, desarrollada por el equipo IFM (Inception42) con un enfoque marcado en el arabe y en capacidades agenticas. Se trata de un modelo decoder-only de clase 0.9B parametros con una ventana de contexto de 128K tokens, pensado para ejecutarse en entornos con recursos limitados sin renunciar a contexto largo. Esta ficha cubre concretamente la conversion a formato MLX en bf16 publicada por IFM para Apple silicon.

El repositorio `IFM/Jais-3-0.9B-MLX-bf16` contiene los pesos originales en bf16 convertidos a MLX, sin cuantizacion, con un total de 1.078.285.824 parametros y 2.2 GB en disco. La relevancia practica reside en que permite ejecutar el modelo en Macs con chip Apple silicon mediante `mlx-lm`, con un pico de memoria de 2.2 GB para prompts cortos. La conversion ha sido validada contra el codigo PyTorch original en fp32 sobre los pesos reales, con un error relativo en logits de 6e-6 o inferior y coincidencia exacta en decodificacion greedy con cache KV (64/64 tokens en cada prompt de prueba).

La arquitectura declarada es `k2_horizon`, que `mlx-lm` aun no soporta de forma nativa; por ello el repositorio incluye el codigo del modelo (`k2_horizon.py`) que se carga mediante `trust_remote_code`. El modelo incorpora un modo de razonamiento explicito delimitado por las etiquetas `<ifm|think> ... </ifm|think>` y un nivel de esfuerzo configurable (`reasoning_effort`) con valores `high`, `medium` y `low`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (decoder-only denso), segun tags y model card |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | bf16 (esta variante, sin cuantizar); existen variantes MLX de 8 bits y 4 bits del mismo modelo base |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Jais-3, identificado en los metadatos con la arquitectura `k2_horizon`. La model card de esta conversion no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion remite al modelo base `IFM/Jais-3-0.9B` y al paper asociado (arXiv:2611.10224), no incluidos en la informacion disponible. Lo que si se documenta es el modo de razonamiento: el modelo genera un bloque de pensamiento interno entre `<ifm|think>` y `</ifm|think>` antes de la respuesta final, con un nivel de esfuerzo controlable desde la plantilla de chat.

La innovacion tecnica mas relevante de esta publicacion es la propia conversion a MLX. Al no existir soporte nativo de `k2_horizon` en `mlx-lm`, el repositorio incluye `k2_horizon.py`, cargado a traves de la entrada `model_file` de `config.json`, de modo que `mlx-lm` 0.32.0 funciona sin modificaciones. La validacion se hizo en fp32 sobre los pesos reales con prompts en ingles, codigo, arabe y matematicas: los logits coinciden con el codigo PyTorch (`modeling_k2_horizon.py`) con error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens que PyTorch (64/64 en cada prompt). Tambien se hicieron pruebas de humo con prompts de chat en ingles y arabe, verificando que la plantilla de chat y los tokens de parada funcionan.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, con plantilla de chat integrada.
- Razonamiento explicito mediante bloque de pensamiento `<ifm|think> ... </ifm|think>` antes de la respuesta.
- Control del esfuerzo de razonamiento con `reasoning_effort` (`high` por defecto, `medium`, `low`).
- Procesamiento de contexto largo: ventana de 128K tokens, con cache KV que crece con el contexto.
- Soporte de tool calling segun la model card; el formato de llamada a herramientas no esta parseado por `mlx-lm` en esta version.
- Capacidades agenticas y de razonamiento multi-paso, en linea con el enfoque "Arabic-centric Agentic AI" de la familia Jais-3.
- Ejecucion en Apple silicon mediante `mlx-lm` (`generate`, `chat` y `server`), con `--trust-remote-code`.

## Casos de uso

- Asistente conversacional en arabe en local: el modelo puede mantener dialogos multi-turno en arabe con una ventana de 128K tokens, ejecutandose en un Mac con Apple silicon con un pico de 2.2 GB en bf16, lo que elimina la dependencia de APIs externas para datos sensibles.
- Procesamiento de documentos largos en arabe: resumen, extraccion de entidades o preguntas sobre contratos, informes o articulos extensos aprovechando el contexto de 128K tokens y la perplexity medida en Wikipedia arabe (18.369 en bf16).
- Generacion y revision de codigo en ingles: la conversion fue validada con prompts de codigo y el modelo conserva la coherencia de logits frente a PyTorch, por lo que puede usarse en tareas de autocompletado o explicacion de codigo en flujos locales.
- Razonamiento matematico con esfuerzo ajustable: usando `reasoning_effort="high"` para problemas que requieren cadena de pensamiento y `"low"` para consultas simples, reduciendo el consumo de tokens en produccion.
- Despliegue en servidor local para prototipado: `mlx_lm.server` permite exponer el modelo como endpoint HTTP en una maquina Apple; util para pruebas de integracion antes de migrar a infraestructura mayor.
- Agentes con tool calling en entornos de investigacion: el modelo soporta el formato de llamada a herramientas, aunque el parseo debe hacerse en el cliente porque `mlx-lm` aun no lo interpreta; adecuado para experimentar con pipelines agenticos en arabe.
- Evaluacion comparativa de cuantizaciones: al existir variantes bf16, 8 bits y 4 bits del mismo modelo, sirve para medir el impacto de la cuantizacion en la tarea concreta del equipo antes de fijar una version.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la propia model card para las tres variantes MLX, medidos de forma homogenea: perplexity sobre 128 x 512 tokens (WikiText-2 test y primeros articulos del dump de Wikipedia arabe `20231101.ar`) y velocidad de generacion en un Apple M4 Max.

| Metrica | bf16 | 8 bits | 4 bits |
|---|---|---|---|
| Bits por peso | 16.0 | 8.5 | 6.4 |
| Disco | 2.2 GB | 1.1 GB | 0.9 GB |
| Memoria pico | 2.2 GB | 1.2 GB | 1.0 GB |
| Perplexity WikiText-2 (ingles) | 22.994 | 22.975 (-0.1%) | 23.910 (+4.0%) |
| Perplexity Wikipedia arabe | 18.369 | 18.365 (-0.0%) | 19.275 (+4.9%) |
| Generacion (M4 Max) | 198.9 tok/s | 310.5 tok/s | 384.3 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada: pico de 2.2 GB en bf16 para prompts cortos; el cache KV crece con el contexto, por lo que contextos largos requieren mas memoria.
- Hardware objetivo: Apple silicon (la model card reporta mediciones en un Apple M4 Max).
- GPU dedicadas (A100, H100, RTX 4090): no disponible en la informacion proporcionada; esta variante esta empaquetada para MLX, no para CUDA.
- Cabe en GPU de consumo: si, en el sentido de que cabe en la memoria unificada de Macs con Apple silicon; no hay datos sobre GPUs de consumo con CUDA para esta variante.
- Despliegue: `mlx-lm` (version probada 0.32.0) con `--trust-remote-code`; comandos `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`. Requiere `pip install -U mlx-lm`.
- Reduccion de memoria: `--max-kv-size` y cuantizacion del cache KV (`--kv-bits 8`, donde este disponible).
- Throughput: 198.9 tok/s en bf16 sobre M4 Max; 310.5 tok/s en 8 bits y 384.3 tok/s en 4 bits.
- Latencia: no disponible de forma desagregada (solo velocidad de generacion agregada).

## Comparativa con modelos similares

La informacion disponible solo permite comparar las tres variantes de cuantizacion del mismo modelo. No se proporcionan datos de modelos alternativos de la misma categoria (0.9B densos, centrados en arabe) para establecer una comparativa con parametros, contexto y rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Jais-3-0.9B MLX bf16 (esta ficha) | 1.078.285.824 | 128K | Apache-2.0 | MLX safetensors |
| Jais-3-0.9B MLX 8 bits | no disponible (mismo base) | 128K | Apache-2.0 | MLX safetensors |
| Jais-3-0.9B MLX 4 bits | no disponible (mismo base) | 128K | Apache-2.0 | MLX safetensors |

Comparativa con modelos de otros desarrolladores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran arabe e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Alucinacion: no hay evaluaciones publicadas de tasas de alucinacion en la informacion disponible; como modelo de 0.9B, la fiabilidad factografica debe validarse en la tarea concreta.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Dependencia de codigo remoto: requiere `--trust-remote-code` o `trust_remote_code=True` porque `mlx-lm` no soporta `k2_horizon`; el archivo `k2_horizon.py` se ejecuta en la maquina local y la model card recomienda revisarlo antes de usarlo.
- Parseo incompleto en servidor: `mlx-lm` no reconoce las etiquetas `<ifm|think>`, por lo que `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado; el formato de tool calling tampoco se parsea.
- Plantilla de chat modificada: la plantilla original fallaba cuando un mensaje previo del asistente no tenia campo de pensamiento (caso tipico de clientes estilo OpenAI); la version de este repositorio renderiza un bloque de pensamiento vacio en esos casos.
- Presupuesto de tokens: al generar un bloque de pensamiento antes de responder, hay que reservar espacio en `max_tokens` o la respuesta puede truncarse.
- Memoria en contexto largo: el cache KV crece con el contexto; sin `--max-kv-size` ni cuantizacion del cache, los contextos de 128K pueden exceder la memoria disponible.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial; conviene verificar los terminos del modelo base `IFM/Jais-3-0.9B` para el uso previsto.
- Perplexity como metrica: la propia model card advierte que la perplexity es una senal gruesa y recomienda probar cada variante en la carga de trabajo real antes de elegir.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- Modelo base: https://huggingface.co/IFM/Jais-3-0.9B
- Variante MLX 8 bits: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- Variante MLX 4 bits: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- Paper (arXiv): https://arxiv.org/abs/2611.10224
- Codigo del modelo incluido en el repo: `k2_horizon.py` (dentro del repositorio de Hugging Face)
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-0.9B (referencia de licencia indicada en la model card)
