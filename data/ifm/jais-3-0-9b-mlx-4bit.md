# IFM/Jais-3-0.9B-MLX-4bit

## Resumen

Jais-3-0.9B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Jais-3-0.9B, desarrollado por Inception42 (IFM). Se trata del miembro compacto y denso de la familia Jais-3, una saga de modelos decoder-only centrada en arabe e ingles con enfasis en capacidades agenticas. Con 1.078.285.824 parametros totales y una ventana de contexto de 128K tokens, el modelo base se posiciona como una opcion ligera para despliegue en Apple Silicon.

Esta version concreta aplica una receta de cuantizacion de precision mixta (MLP en 4 bits con grupo de 32, atencion y embeddings en 8 bits con grupo de 64), resultando en 6.4 bits por peso efectivos y 0.9 GB en disco. La motivacion es clara: el 4-bit plano degrada demasiado la perplejidad (+14.2% en WikiText-2), mientras que esta receta mixta limita la perdida a +4.0% en ingles y +4.9% en arabe, manteniendo un tamano reducido y un rendimiento de generacion de hasta 384.3 tok/s en un M4 Max.

La relevancia actual del modelo reside en su combinacion de contexto largo, soporte bilingue arabe-ingles, modo de razonamiento explicito (`<ifm|think>`) y licencia Apache-2.0, todo ello ejecutable en hardware de consumo Apple. Es una pieza pensada para prototipado rapido, asistentes conversacionales y tareas de generacion en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura `k2_horizon`) |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 4-bit MLX con precision mixta: MLP en 4 bits (grupo 32), atencion/embeddings/lm_head en 8 bits (grupo 64); 6.4 bits/peso efectivos |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo de modelo `k2_horizon.py` incluido en el repo |

## Arquitectura y entrenamiento

El modelo base Jais-3-0.9B es un transformer decoder-only denso construido sobre la arquitectura propietaria `k2_horizon`, segun los tags y el codigo de modelado incluido en el repo. La model card de esta version cuantizada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion remite a la model card del modelo base original. El contexto de 128K tokens es el dato arquitectonico mas destacable junto al tamano compacto.

La innovacion tecnica principal de esta publicacion es el proceso de cuantizacion MLX. Se emplea cuantizacion afin entera con escalas y sesgos en bf16, aplicando 4 bits (grupo 32) a las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`), que concentran la mayor parte de los parametros, y 8 bits (grupo 64) al resto (atencion, embeddings y `lm_head`). La conversion fue validada contra el codigo PyTorch en fp32 sobre los pesos reales del modelo: los logits coinciden con error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens que PyTorch (64/64 en cada prompt probado).

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento explicito mediante modo de pensamiento delimitado por `<ifm|think> … </ifm|think>`, con nivel de esfuerzo configurable (`reasoning_effort`: `high` por defecto, `medium`, `low`).
- Razonamiento matematico y generacion de codigo (verificado en las pruebas de conversion con prompts de codigo y matematicas).
- Soporte de tool calling / function calling segun la model card del modelo base (la model card de esta version indica que el formato de tool-call no esta parseado por mlx-lm).
- Capacidades agenticas y de razonamiento multi-paso, en linea con el enfoque de la familia Jais-3 ("Arabic-centric Agentic AI").
- Capacidad bilingue arabe-ingles; no se declaran otros idiomas.
- Contexto largo de hasta 128K tokens para conversaciones y documentos extensos.

## Casos de uso

- Atencion al cliente en arabe e ingles: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens de ventana, manteniendo el historial completo de la interaccion sin truncamiento agresivo.
- Prototipado local en Mac: con 1.0 GB de memoria pico y mlx-lm, permite iterar sobre prompts y plantillas de chat en un portatil Apple Silicon sin infraestructura GPU dedicada.
- Asistentes con razonamiento visible: el modo `<ifm|think>` con `reasoning_effort` ajustable permite exponer el razonamiento interno en aplicaciones educativas o de depuracion, o reducirlo a `low` para respuestas rapidas en produccion.
- Generacion de codigo asistida: el modelo fue validado con prompts de codigo y puede integrarse en editores o scripts de automatizacion para completar y explicar fragmentos, aunque su tamano de 0.9B limita la complejidad de las tareas.
- Procesamiento de documentos largos en arabe: resumen, extraccion y respuesta sobre preguntas a partir de articulos o informes extensos aprovechando la ventana de 128K tokens.
- Servicio de inferencia local: `mlx_lm.server` permite levantar un endpoint compatible con clientes OpenAI-style en Apple Silicon, util para demos y entornos de desarrollo sin cloud.
- Clasificacion y etiquetado de texto bilingue: tareas de moderacion, categorizacion o extraccion de entidades en corpus arabe-ingles con bajo coste de despliegue.

## Benchmarks y rendimiento

Datos publicados en la model card para las tres variantes MLX de Jais-3-0.9B (perplejidad sobre 128 × 512 tokens; velocidad medida en Apple M4 Max):

| Metrica | bf16 | 8-bit | 4-bit (esta version) |
|---|---|---|---|
| Bits/peso | 16.0 | 8.5 | 6.4 |
| Disco | 2.2 GB | 1.1 GB | 0.9 GB |
| Memoria pico | 2.2 GB | 1.2 GB | 1.0 GB |
| Perplejidad WikiText-2 (ingles) | 22.994 | 22.975 (-0.1%) | 23.910 (+4.0%) |
| Perplejidad Wikipedia arabe | 18.369 | 18.365 (-0.0%) | 19.275 (+4.9%) |
| Velocidad de generacion | 198.9 tok/s | 310.5 tok/s | 384.3 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta version cuantizada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1.0 GB de pico para un prompt corto en la version 4-bit; la cache KV crece con el contexto, por lo que contextos largos requieren mas memoria.
- Hardware objetivo: Apple Silicon (MLX). La velocidad de 384.3 tok/s esta medida en un Apple M4 Max.
- Cabe en GPU de consumo Apple: cualquier Mac con memoria unificada suficiente para 1.0 GB mas la cache KV; no esta pensado para GPU NVIDIA/AMD.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate`, API Python `load`/`generate`, `mlx_lm.chat` y `mlx_lm.server`), siempre con `--trust-remote-code` o `trust_remote_code=True` porque `mlx-lm` aun no soporta nativamente la arquitectura `k2_horizon`.
- Reduccion de memoria en contextos largos: `--max-kv-size` y cuantizacion de cache KV (`--kv-bits 8`, donde este disponible).
- Latencia/throughput: 384.3 tok/s en M4 Max para la variante 4-bit (frente a 310.5 tok/s en 8-bit y 198.9 tok/s en bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Jais-3-0.9B-MLX-4bit (esta version) | 1.078 M | 128K | MLX, 4-bit mixto, 0.9 GB | Apache-2.0 | 384.3 tok/s en M4 Max; perplejidad +4.0% vs bf16 |
| Jais-3-0.9B-MLX-8bit | 1.078 M | 128K | MLX, 8-bit, 1.1 GB | Apache-2.0 | 310.5 tok/s; perplejidad practicamente identica a bf16 |
| Jais-3-0.9B-MLX-bf16 | 1.078 M | 128K | MLX, bf16, 2.2 GB | Apache-2.0 | 198.9 tok/s; referencia de calidad |
| Jais-3-0.9B (base, PyTorch) | 1.078 M | 128K | safetensors PyTorch | Apache-2.0 | Modelo original; benchmarks y detalles en su model card |

No se dispone en la informacion proporcionada de comparativas con modelos de otros autores (por ejemplo, otras familias de 1B en arabe o modelos multilingues de tamano similar); esos datos no estan disponibles.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: +4.0% de perplejidad en WikiText-2 y +4.9% en Wikipedia arabe respecto a bf16; la model card advierte que la perplejidad es una senal gruesa y recomienda probar cada variante en la carga de trabajo real.
- Cobertura idiomatica limitada: solo se declaran arabe e ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de 0.9B; su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos mayores, por lo que requiere verificacion en dominios sensibles.
- Modo de pensamiento: el modelo genera texto dentro de `<ifm|think>` antes de responder, lo que consume tokens; hay que reservar espacio en `max_tokens` o reducir `reasoning_effort`.
- Integracion incompleta con mlx-lm: `mlx_lm.server` no reconoce las etiquetas `<ifm|think>` (devuelve el razonamiento dentro de `content`) ni parsea el formato de tool-call.
- Requiere `--trust-remote-code`: el codigo `k2_horizon.py` se ejecuta localmente; conviene revisarlo antes de usarlo en entornos de produccion.
- Plantilla de chat modificada: la plantilla original fallaba con mensajes de asistente sin campo de pensamiento (formato OpenAI-style); esta version renderiza pensamiento vacio en esos casos.
- Licencia Apache-2.0: permite uso comercial, pero se hereda del modelo base y conviene consultar la model card original para condiciones y usos previstos.
- Plataforma restringida: formato MLX, exclusivo para Apple Silicon; no es desplegable directamente en CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/Jais-3-0.9B
- Variante bf16: https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- Variante 8-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- Paper citado (arXiv): arXiv:2611.10224 — "Jais 3: Introducing Arabic-centric Agentic AI"
- Codigo del modelo incluido en el repo: `k2_horizon.py` (accesible desde la pagina del modelo en Hugging Face)
- Licencia: https://huggingface.co/IFM/Jais-3-0.9B (Apache-2.0)
