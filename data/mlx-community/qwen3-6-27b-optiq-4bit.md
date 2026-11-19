# mlx-community/Qwen3.6-27B-OptiQ-4bit

## Resumen

Qwen3.6-27B-OptiQ-4bit es una cuantizacion de precision mixta en 4 bits del modelo Qwen/Qwen3.6-27B, publicada por el colectivo mlx-community y generada con la herramienta mlx-optiq. El modelo base pertenece a la familia Qwen3.6 desarrollada por Alibaba Qwen y esta pensado para generacion de texto conversacional, razonamiento, codigo y flujos de agentes. Esta variante resuelve el problema de ejecutar un modelo de ~27.000 millones de parametros en hardware Apple Silicon con un coste de disco y memoria reducido, manteniendo una calidad cercana a la del modelo original.

La innovacion principal es la asignacion de anchos de bit por capa: se realiza un analisis de sensibilidad por divergencia KL sobre una mezcla de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool-call e instrucciones con restricciones) y las capas sensibles se elevan a 8 bits mientras las robustas permanecen en 4 bits. El resultado ocupa 17,5 GB en disco, apenas un 5 % mas que una cuantizacion uniforme de 4 bits, pero supera a esta ultima en la puntuacion agregada de capacidad (86,04 frente a 85,58).

El modelo incluye ademas una cabeza de prediccion multi-token (MTP) empaquetada como `mtp.safetensors`, que permite decodificacion especulativa con una aceleracion de aproximadamente 1,4x en la fase de decode. Esta pensado para desarrolladores que quieran servir el modelo localmente en Macs con chip M-series, sin depender de PyTorch ni de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.6, tag `qwen3_5`) |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta (predominante), con 220 capas en 8-bit y 276 en 4-bit; group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), incluye `mtp.safetensors` para decodificacion especulativa |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer decoder-only de la familia Qwen3.6 (tag interno `qwen3_5`). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se confirma si la arquitectura incorpora mecanismos de atencion lineal, mezcla de expertos o innovaciones adicionales mas alla de la cabeza MTP.

La variante OptiQ-4bit se construye mediante un proceso de cuantizacion sensible a la sensibilidad: se ejecuta una pasada de divergencia KL contra una referencia en bf16 sobre 240 muestras (40 por cada uno de los seis dominios de calibracion) para decidir el ancho de bit de cada capa. Las 496 capas cuantizadas se reparten en 220 a 8 bits y 276 a 4 bits, con grupo de 64. La cabeza MTP incluida usa proyecciones en 4 bits y normalizaciones en BF16, y sus siete pesos RMSNorm estan centrados en cero (se aplican como 1 + w), por lo que deben ajustarse con +1.0 al cargarla en otros runtimes distintos de `optiq serve`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de problemas de varios pasos (thinking mode no confirmado en la informacion disponible).
- Generacion de codigo y tareas de programacion (evaluado con HumanEval).
- Matematicas y razonamiento aritmetico (evaluado con GSM8K en modo CoT).
- Tool calling y function calling (evaluado con BFCL-V3).
- Seguimiento de instrucciones estrictas y restricciones (evaluado con IFEval).
- Recuperacion en contexto largo (evaluado con HashHop).
- Decodificacion especulativa mediante cabeza MTP con tasa de aceptacion ~70 % a profundidad 2.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente de codigo local en Mac: gracias a sus 90,2 % en HumanEval pass@1, puede integrarse en editores o terminales para autocompletado, refactorizacion y explicacion de codigo sin enviar datos a la nube.
- Automatizacion de agentes con tool calling: el 92,5 % en BFCL-V3 simple permite construir agentes que invoquen APIs, ejecuten comandos o consulten bases de datos mediante function calling.
- Razonamiento matematico asistido: el 92,0 % en GSM8K con CoT lo hace util para tutoria, verificacion de calculos o generacion de problemas resueltos paso a paso.
- Procesamiento de documentos largos con recuperacion: HashHop al 80,0 % sugiere buen comportamiento en tareas de retrieval sobre contextos extensos, util para resumen y Q&A sobre expedientes.
- Servicio de inferencia local con API compatible OpenAI/Anthropic: mediante `optiq serve` se puede exponer el modelo como endpoint local para prototipado y pruebas de integracion.
- Fine-tuning ligero en Apple Silicon: mlx-optiq permite LoRA sensible a la sensibilidad sobre esta cuantizacion, util para adaptar el modelo a dominios verticales sin GPU dedicada.
- Evaluacion y comparacion de cuantizaciones: el modelo sirve como referencia para medir el impacto de la precision mixta frente a cuantizaciones uniformes en pipelines de investigacion.

## Benchmarks y rendimiento

Puntuacion de capacidad de seis metricas (media de MMLU, GSM8K, IFEval, BFCL, HumanEval y HashHop), comparada con una cuantizacion uniforme de 4 bits segun la model card:

| Metrica | OptiQ 4-bit | Uniforme 4-bit | Delta |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 muestras) | 87,4 % | 87,6 % | -0,2 |
| GSM8K (1000 muestras, 3-shot CoT) | 92,0 % | 92,1 % | -0,1 |
| IFEval (set completo, strict) | 74,1 % | 71,7 % | +2,4 |
| BFCL-V3 simple (200 llamadas) | 92,5 % | 93,0 % | -0,5 |
| HumanEval (164 problemas, pass@1) | 90,2 % | 92,1 % | -1,8 |
| HashHop (retrieval en contexto largo) | 80,0 % | 77,0 % | +3,0 |
| Puntuacion de capacidad (media de 6) | 86,04 | 85,58 | +0,46 |
| KL vs referencia uniforme 4-bit (media / p95) | 0,0895 / 0,4101 | — | — |
| Tamano en disco | 17,5 GB | 15,0 GB | +2,5 GB |

No se han publicado en la informacion disponible resultados del modelo base en bf16 ni comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,5 GB de pesos en disco; en ejecucion hay que sumar cache KV y overhead, por lo que se recomienda al menos 24 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No es compatible con CUDA de forma nativa al estar en formato MLX.
- Cabe en consumer hardware Apple: si, en configuraciones con 24 GB o mas de memoria unificada; en equipos de 16 GB no es viable con contexto amplio.
- GPUs NVIDIA (A100, H100, RTX 4090): no aplicables directamente; requeriria conversion a otro formato (GGUF, safetensors PyTorch) no incluida en este repo.
- Despliegue: `mlx-lm` para uso basico; `mlx-optiq` (`optiq serve`) para servidor compatible OpenAI/Anthropic, cache KV de precision mixta, LoRA en caliente y ejecucion Python en sandbox para agentes.
- Aceleracion: decodificacion especulativa con MTP habilitada via `optiq serve --mtp`, con ~1,4x de speedup en decode y ~70 % de aceptacion a profundidad 2.
- Latencia y throughput absolutos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B-OptiQ-4bit | ~26,9 B | no disponible | 4-bit mixta (4/8) | Apache 2.0 | MLX safetensors |
| Qwen/Qwen3.6-27B (base) | ~26,9 B | no disponible | bf16 | Apache 2.0 | safetensors |
| Cuantizacion uniforme 4-bit de Qwen3.6-27B | ~26,9 B | no disponible | 4-bit uniforme | Apache 2.0 | MLX safetensors |

La comparativa se limita al modelo base y a la cuantizacion uniforme de referencia, ya que la informacion proporcionada no incluye otros modelos de la misma categoria. Frente al base en bf16, esta variante reduce el tamano en disco de forma sustancial (a 17,5 GB) a cambio de una perdida marginal en MMLU, GSM8K y BFCL, y una caida de 1,8 puntos en HumanEval, compensada por mejoras en IFEval y HashHop. Frente a la cuantizacion uniforme de 4 bits, gana 0,46 puntos en la puntuacion agregada con un 16,7 % mas de disco.

## Limitaciones y advertencias

- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconversion.
- La cuantizacion introduce perdida de calidad: -1,8 puntos en HumanEval y -0,5 en BFCL respecto a la version uniforme, y degradacion adicional frente al modelo en bf16 no cuantificada en la informacion disponible.
- La cabeza MTP requiere ajuste manual (+1.0 en las siete RMSNorm) si se carga fuera de `optiq serve`; un uso incorrecto produce salidas degradadas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingue antes de desplegar en produccion.
- Longitud de contexto: no disponible; el rendimiento en HashHop sugiere buen comportamiento en retrieval, pero no se especifica la ventana maxima.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las obligaciones de atribucion del modelo base.
- El modelo esta etiquetado como `text-generation`; no se confirman capacidades multimodales.
- El rendimiento en produccion dependera del hardware Apple concreto y de la memoria disponible para cache KV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.6-27B-OptiQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Web del proyecto mlx-optiq: https://mlx-optiq.com/
- Guia de la familia Qwen3.6: https://mlx-optiq.com/docs/qwen3.6
- PyPI de mlx-optiq: https://pypi.org/project/mlx-optiq/
- Blog sobre la mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Blog sobre el framework de evaluacion: https://mlx-optiq.com/blog/eval-framework
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio mlx-optiq: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
