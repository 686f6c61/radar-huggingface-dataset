# mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit

## Resumen

Qwen3.6-35B-A3B-OptiQ-4bit es una cuantizacion mixta de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por la organizacion mlx-community y generada con la herramienta mlx-optiq. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 34.660.608.768 parametros totales y una nomenclatura "35B-A3B" que indica aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token. Esta version esta pensada exclusivamente para inferencia local sobre Apple Silicon mediante la libreria MLX.

El interes de esta publicacion no reside en el modelo base, sino en la estrategia de cuantizacion: en lugar de aplicar uniformemente 4 bits a todas las capas, mlx-optiq realiza un analisis de sensibilidad por capa basado en divergencia KL sobre un conjunto de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool-call e instrucciones con restricciones). Las capas sensibles se mantienen en 8 bits (392 capas) y las robustas bajan a 4 bits (118 capas), con un tamano en disco de 22,1 GB, apenas un 5 % por encima de una cuantizacion uniforme de 4 bits.

El resultado es un quant que, segun la model card, supera a la cuantizacion uniforme de 4 bits en la media de seis benchmarks (Capability Score 80,03 frente a 78,75), con mejoras notables en tool calling (BFCL-V3: 92,5 % frente a 90,0 %) y recuperacion en contexto largo (HashHop: 52,0 % frente a 44,0 %). Ademas incluye una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa con una aceleracion de aproximadamente 1,4x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3.6 (`qwen3_5_moe`) |
| Parametros totales | 34.660.608.768 |
| Parametros activos | aproximadamente 3.000 millones (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 4 bits predominante, con 392 capas en 8 bits y 118 capas en 4 bits; group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), con cabeza MTP en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts, identificado en los tags como `qwen3_5_moe`. La denominacion "35B-A3B" indica aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta cuantizacion no los detalla y solo remite al modelo base.

La innovacion tecnica de esta publicacion es la cuantizacion sensible a la sensibilidad (sensitivity-aware) de mlx-optiq. Se ejecuta una pasada de divergencia KL sobre 40 muestras x 6 dominios para determinar que capas toleran 4 bits y cuales requieren 8 bits, usando bf16 como referencia (con fallback a uniforme-4-bit si bf16 no cabe en memoria). Adicionalmente, el paquete incluye una cabeza de Multi-Token Prediction (MTP) en 4 bits con normas en BF16, que habilita decodificacion especulativa con una tasa de aceptacion de aproximadamente el 70 % a profundidad 2, lo que se traduce en una aceleracion de decode de aproximadamente 1,4x mediante `optiq serve --mtp`.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline `text-generation`.
- Razonamiento de multiples pasos, incluyendo cadenas de pensamiento (el benchmark GSM8K se evalua con 3-shot CoT).
- Generacion de codigo: HumanEval pass@1 de 91,5 % en esta cuantizacion.
- Tool calling y function calling: BFCL-V3 simple con 92,5 % de acierto en 200 llamadas.
- Seguimiento de instrucciones estrictas: IFEval strict con 72,6 %.
- Recuperacion en contexto largo: HashHop con 52,0 %.
- Capacidades de agente y flujos multi-paso, segun el dominio "agent" del mix de calibracion y la integracion con ejecucion Python en sandbox de mlx-optiq.
- Decodificacion especulativa mediante cabeza MTP integrada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; los tags no indican modalidades adicionales.

## Casos de uso

- Asistente de codigo en local sobre Mac: el modelo alcanza 91,5 % en HumanEval pass@1 y puede ejecutarse con `mlx-lm` en un equipo Apple Silicon, lo que permite autocompletado y generacion de funciones sin enviar codigo a la nube.
- Agente con tool calling en escritorio: con 92,5 % en BFCL-V3 simple, es adecuado para orquestar llamadas a APIs, shell o herramientas internas en flujos automatizados ejecutados localmente.
- Procesamiento de documentos largos con recuperacion: el rendimiento en HashHop (52,0 %, +8 puntos sobre uniforme-4-bit) lo hace util para tareas de extraccion y QA sobre contextos extensos, siempre que se valide la longitud de contexto real del modelo base.
- Servidor de inferencia local compatible OpenAI/Anthropic: mediante `optiq serve` se puede exponer el modelo como endpoint compatible con SDKs existentes, util para prototipado de aplicaciones sin coste de API.
- Fine-tuning con LoRA sensible a sensibilidad: mlx-optiq permite adaptar el modelo a dominios concretos (por ejemplo, soporte tecnico interno) manteniendo la cuantizacion mixta y sirviendo adaptadores en caliente.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantizacion mixta frente a uniforme-4-bit en pipelines de investigacion sobre eficiencia de inferencia.
- Chat conversacional multi-turno en portatiles: con 22,1 GB en disco y decode acelerado por MTP, es viable en Macs con memoria unificada de 32 GB o superior para uso interactivo.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando esta cuantizacion (OptiQ) con una cuantizacion uniforme de 4 bits del mismo modelo base:

| Metrica | OptiQ | Uniforme 4-bit | Delta |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 muestras) | 83,7 % | 84,6 % | -0,9 |
| GSM8K (1000 muestras, 3-shot CoT) | 87,9 % | 89,4 % | -1,5 |
| IFEval (set completo, strict) | 72,6 % | 73,0 % | -0,4 |
| BFCL-V3 simple (200 llamadas) | 92,5 % | 90,0 % | +2,5 |
| HumanEval (164 problemas, pass@1) | 91,5 % | 91,5 % | +0,0 |
| HashHop (recuperacion en contexto largo) | 52,0 % | 44,0 % | +8,0 |
| Capability Score (media de 6) | 80,03 | 78,75 | +1,28 |
| KL vs referencia uniforme-4-bit (media / p95) | 0,2231 / 0,9779 | — | — |
| Tamano en disco | 22,1 GB | 19,0 GB | +3,1 GB |

No se han publicado en la informacion disponible resultados del modelo base en bf16 ni comparaciones con modelos de otros autores.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 46,3 GB (incluye pesos y artefactos), pero el tamano declarado para los pesos cuantizados es de 22,1 GB. En Apple Silicon la memoria es unificada, por lo que se recomienda un minimo de 32 GB para dejar margen al contexto y al KV-cache; 64 GB es mas holgado para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090) en su formato actual.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada suficiente; no esta pensado para GPUs de consumo NVIDIA por la dependencia de MLX.
- Opciones de despliegue: `mlx-lm` para carga directa en Python; `mlx-optiq` para servidor compatible OpenAI y Anthropic, KV-cache en precision mixta, LoRA en caliente y ejecucion Python en sandbox; `optiq serve --mtp` para activar decodificacion especulativa.
- Latencia y throughput: la model card indica aproximadamente 1,4x de aceleracion en decode con MTP y una tasa de aceptacion de aproximadamente 70 % a profundidad 2. No se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-OptiQ-4bit | 34,66 B totales / ~3 B activos | no disponible | Mixta 4/8 bits, 22,1 GB | Apache 2.0 | Hugging Face, MLX |
| Qwen3.6-35B-A3B (uniforme 4-bit) | 34,66 B totales / ~3 B activos | no disponible | Uniforme 4 bits, 19,0 GB | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3.6-35B-A3B (bf16) | 34,66 B totales / ~3 B activos | no disponible | bf16 | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros fabricantes (Llama, Mistral, DeepSeek) ni de sus especificaciones de contexto, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon y de la libreria MLX: no es desplegable en CUDA, ROCm ni en GPUs NVIDIA, lo que limita su uso a entornos macOS.
- Perdida de precision respecto a bf16: la propia model card reporta caidas de -0,9 en MMLU, -1,5 en GSM8K y -0,4 en IFEval frente a uniforme-4-bit, y no se ofrecen resultados frente a bf16; se debe validar en la tarea concreta antes de produccion.
- La cuantizacion mixta ocupa 3,1 GB mas que la uniforme de 4 bits, lo que puede ser determinante en equipos con memoria justa.
- La cabeza MTP requiere atencion especial al cargarla fuera de `optiq serve`: sus siete pesos RMSNorm estan centrados en cero y deben aplicarse como 1 + w; el resto de pesos llevan el +1 ya incorporado.
- Longitud de contexto e idiomas soportados no estan documentados en la informacion disponible; no se debe asumir un contexto largo sin verificar el modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el rendimiento en HashHop (52,0 %) sugiere margen de mejora en recuperacion fiable dentro de contextos largos.
- Sesgos: no se documentan en la model card; se heredan del modelo base y del dataset de entrenamiento original, no descrito aqui.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia y condiciones del modelo base Qwen/Qwen3.6-35B-A3B por si anaden restricciones adicionales.
- El ecosistema mlx-optiq es reciente y menos maduro que vLLM o llama.cpp; la estabilidad en produccion debe evaluarse con carga real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto mlx-optiq: https://mlx-optiq.com/
- Guia de la familia Qwen3.6: https://mlx-optiq.com/docs/qwen3.6
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio OptiQ: https://mlx-optiq.com/docs/lab/
- Catalogo de quants OptiQ: https://mlx-optiq.com/models
- Blog sobre el mix de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Blog sobre el framework de evaluacion: https://mlx-optiq.com/blog/eval-framework
- Paquete en PyPI: https://pypi.org/project/mlx-optiq/
