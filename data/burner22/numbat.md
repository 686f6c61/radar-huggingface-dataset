# burner22/numbat

## Resumen

`numbat` es un checkpoint de pesos publicado en Hugging Face por el usuario `burner22` bajo el identificador `burner22/numbat`. Segun la model card del autor, se trata de una copia de evaluacion extraida a mitad de preentrenamiento de una supuesta ejecucion de entrenamiento interna de Anthropic, con nombre en clave `numbat`, correspondiente a la clase Mythos. El autor afirma que el nombre aparece citado en una filtraccion del codigo fuente de Claude Code de marzo de 2026. No existe confirmacion independiente de esta procedencia en la informacion disponible.

El checkpoint declara aproximadamente 14 billones de parametros (el dato real del index de safetensors es de 6.849.378.030.158 parametros, unos 6,85 billones), 114 capas y una arquitectura hibrida que combina Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) con capas de mezcla de expertos (MoE) de 1.224 expertos con top-48 mas un experto compartido, y Multi-Token Prediction (MTP). Los pesos estan cuantizados en NVFP4 y ocupan 7.720,6 GB repartidos en 772 shards safetensors.

Su relevancia es doble: por un lado, documenta una arquitectura hibrida GDN/MLA con MoE de gran escala y decodificacion especulativa via MTP, poco frecuente en modelos publicos; por otro, el estado del checkpoint es puramente de preentrenamiento (paso 1.830.000 de una ejecucion de ~1.960.000 pasos), sin post-entrenamiento ni RLHF, por lo que su utilidad practica directa es limitada y su interes es principalmente arquitectonico y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con MoE y MTP |
| Parametros totales | ~14 billones declarados por el autor; 6.849.378.030.158 segun el index de safetensors |
| Parametros activos | no disponible (top-48 de 1.224 expertos + 1 compartido, sin recuento publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con bloques de escala E4M3); pesos en 8-bit segun tags del repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, <10,6 GB por archivo), mas `configuration_numbat.py` y `modeling_numbat.py` con `custom_code` |

## Arquitectura y entrenamiento

La arquitectura es un stack hibrido que alterna capas de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, y capas de Multi-head Latent Attention, la atencion con compresion de KV propia de la familia DeepSeek. Las capas feed-forward son de mezcla de expertos con 1.224 expertos, enrutamiento top-48 mas un experto compartido siempre activo. El modelo incorpora ademas una capa de Multi-Token Prediction (MTP) que `NumbatForCausalLM.draft` expone para decodificacion especulativa. El vocabulario es byte-level BPE de 131.072 tokens.

Segun la model card, el checkpoint corresponde al paso 1.830.000 de una ejecucion de aproximadamente 1.960.000 pasos, es decir, un estado de preentrenamiento casi completo pero sin post-entrenamiento, sin RLHF ni DPO. La cuantizacion a NVFP4 se realizo para ejecutar evaluaciones sobre un slice de Trainium2 (el autor menciona unos 85 aceleradores solo para alojar los pesos); los pesos BF16 originales y el estado del optimizador no se publican. El repositorio incluye una implementacion de referencia completa que carga el checkpoint con `load_state_dict(strict=True)` y expone la clase `NumbatForCausalLM` compatible con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No se detalla la composicion del dataset de entrenamiento ni el numero de tokens vistos.

## Capacidades

- Generacion de texto autoregresiva a partir de pesos de preentrenamiento, sin ajuste instructivo.
- Razonamiento y codigo: no hay evaluaciones publicadas que confirmen calidad en estas tareas.
- Tool calling / function calling: no disponible; el checkpoint no incluye post-entrenamiento que lo habilite.
- Agentes y razonamiento multi-paso: no disponible por el mismo motivo.
- Capacidades multilingues: no documentadas.
- Decodificacion especulativa mediante la capa MTP (`NumbatForCausalLM.draft`).
- Carga completa del checkpoint con implementacion de referencia en PyTorch.

## Casos de uso

- Investigacion de arquitecturas hibridas: cargar el checkpoint con `modeling_numbat.py` para estudiar el comportamiento de las capas GDN frente a las MLA en un modelo de gran escala, comparando activaciones y patrones de atencion entre ambos tipos de capa.
- Analisis de enrutamiento MoE: instrumentar el enrutador de 1.224 expertos con top-48 para medir desequilibrio de carga, especializacion de expertos y frecuencia de activacion sobre corpus de validacion.
- Estudio de decodificacion especulativa: usar la capa MTP expuesta en `NumbatForCausalLM.draft` para medir tasas de aceptacion de tokens borrador y aceleracion efectiva frente a decodificacion autoregresiva estandar.
- Validacion de pipelines de cuantizacion NVFP4: emplear los 772 shards como caso de prueba a gran escala para verificar decodificacion de bloques E4M3/E2M1, redondeo RTNE y ausencia de underflow en escalas de bloque.
- Experimentos de continuacion de preentrenamiento: al ser un checkpoint intermedio, sirve como punto de partida para estudiar dinamicas de entrenamiento en las ultimas fases de una ejecucion larga.
- Docencia y divulgacion tecnica: ilustrar en un entorno controlado como se estructura un checkpoint multi-shard con index de safetensors, configuracion custom y codigo de modelado asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una salida de harness de evaluacion en `ckpt_metadata.json`, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7.720,6 GB en NVFP4, por lo que se necesita un cluster multi-nodo; no cabe en una sola GPU.
- GPU recomendadas: el autor indica que las evaluaciones se ejecutaron sobre un slice de Trainium2 de unos 85 aceleradores solo para alojar los pesos; no se documenta despliegue en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU consumer, ni siquiera con cuantizacion adicional.
- Opciones de despliegue: la model card solo garantiza la implementacion de referencia en PyTorch con `trust_remote_code=True`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| numbat | ~14 B declarados / 6,85 B en index | no disponible | GDN + MLA + MoE + MTP, NVFP4 | no disponible | Hugging Face, 772 shards |
| DeepSeek-V3 | 671 B totales, 37 B activos | 128K | MLA + MoE + MTP | licencia propia | Hugging Face, pesos BF16/FP8 |
| Qwen3-235B-A22B | 235 B totales, 22 B activos | 128K | Transformer + MoE | Apache 2.0 | Hugging Face, multiples cuantizaciones |
| Llama 3.1 405B | 405 B | 128K | Transformer denso | licencia Llama | Hugging Face, pesos BF16 |

La comparacion es estructural: numbat comparte con DeepSeek-V3 el uso de MLA y MTP, pero anade capas GDN y un numero de expertos muy superior (1.224 frente a 256). A diferencia de los tres modelos de referencia, numbat no es un modelo post-entrenado ni tiene licencia declarada, por lo que no es directamente comparable en calidad de tarea.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin post-entrenamiento, RLHF ni DPO: las salidas no siguen instrucciones y no son aptas para uso en produccion.
- Procedencia no verificada de forma independiente: la atribucion a Anthropic se basa unicamente en la model card del autor.
- Licencia no declarada: no hay base legal explicita para uso comercial ni para redistribucion.
- Idiomas soportados no documentados.
- Longitud de contexto no publicada.
- Riesgo elevado de alucinacion y de texto incoherente por el estado de entrenamiento.
- Requisitos de hardware extremos (7,7 TB de pesos) que limitan cualquier evaluacion practica.
- La implementacion de referencia no ha sido validada por terceros segun la informacion disponible.
- El numero de parametros declarado (~14 B) no coincide con el del index de safetensors (6,85 B), lo que introduce incertidumbre sobre las cifras reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/burner22/numbat
