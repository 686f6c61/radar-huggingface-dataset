# frankmorales2020/deepseek-moe-16b-base-ast-aligned-nolora-GGUF-pnas

## Resumen

`frankmorales2020/deepseek-moe-16b-base-ast-aligned-nolora-GGUF-pnas` es una publicacion derivada del modelo base `deepseek-ai/deepseek-moe-16b-base` de DeepSeek, distribuida en formato GGUF con cuantizacion `Q8_0` (17,4 GB, 363 tensores) y orientada a su uso con `llama.cpp`. El autor, `frankmorales2020`, aplica un proceso de ajuste continuo nativo en PyTorch mediante un optimizador propio denominado `TopoAdamW`, sin emplear adaptadores LoRA ni PEFT, y empaqueta el resultado junto con una supuesta base teorica (teoria espectral aritmetica, "AST/LEFM") que incluye pruebas en Lean 4 y validacion numerica.

El modelo hereda la arquitectura del DeepSeek-MoE-16B original: un transformer de mezcla de expertos (MoE) con 16.375.728.128 parametros totales y aproximadamente 2,8 mil millones de parametros activos por token, segun la documentacion publica del modelo base. La intervencion del autor se limita, segun su propia model card, a 45 pasos de actualizacion sobre `model.embed_tokens.weight` y `lm_head.weight`, lo que en la practica supone una modificacion muy acotada de los pesos.

La relevancia de esta ficha es doble: por un lado, documenta una variante GGUF lista para `llama.cpp` de un MoE de 16B; por otro, advierte de que el paquete incluye afirmaciones teoricas y metricas (perplejidad de 265,8137 sobre 84 tokens) que no deben interpretarse como una mejora de calidad del modelo. El autor no publica datos de rendimiento comparativos ni informacion sobre licencia o idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de `deepseek-ai/deepseek-moe-16b-base` |
| Parametros totales | 16.375.728.128 |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base DeepSeek-MoE-16B activa aproximadamente 2,8B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q8_0` (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`llama.cpp`), 17.413.944.128 bytes, 363 tensores |

## Arquitectura y entrenamiento

El modelo parte de `deepseek-ai/deepseek-moe-16b-base`, un transformer con capas de mezcla de expertos. El autor no describe en detalle la configuracion interna (numero de expertos, top-k de enrutamiento, dimensiones ocultas), por lo que esos datos deben consultarse en la model card del modelo base. La intervencion propia consiste en un "alineamiento continuo" nativo en PyTorch con el optimizador `TopoAdamW`, ejecutado durante 45 pasos y limitado a los tensores `model.embed_tokens.weight` y `lm_head.weight`. No se emplean adaptadores LoRA ni PEFT, de ahi la etiqueta `nolora`.

El autor declara una semilla fija (`SEED = 123`), un kernel de primos `R = [2, 3, 5, 7, 11, 13]`, `lambda_euler = 0.9785142874363926` y `ast_step_scale = 0.9962460742363037`. El paquete se presenta como "companion" de una publicacion PNAS e incluye cuatro "pilares": 12 teoremas auditados en Lean 4 (`AST.LEFM.lean`), una validacion numerica "RH7C" con `V_7C = 1`, el alineamiento TopoAdamW y la evaluacion del GGUF en GPU. No se documentan datos de entrenamiento adicionales, numero de tokens, composicion del corpus ni fases de RLHF o DPO. Tampoco se describe ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.) mas alla del propio formato GGUF.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base DeepSeek-MoE-16B.
- Razonamiento y conocimiento general: capacidades del modelo base, no reevaluadas por el autor.
- Generacion de codigo y matematicas: presumiblemente las del modelo base; no hay evaluacion especifica en la informacion disponible.
- Soporte de tool calling / function calling: no documentado para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta variante.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue via Inference Endpoints, sin mas detalle.

## Casos de uso

- Despliegue local con `llama.cpp`: el GGUF `Q8_0` de 17,4 GB puede cargarse en `llama.cpp` u Ollama para inferencia en estaciones de trabajo con GPU de 24 GB o mas, aprovechando la cuantizacion de 8 bits para preservar la calidad del modelo base.
- Experimentacion con tecnicas de ajuste continuo: util para investigadores que quieran reproducir o auditar el pipeline `TopoAdamW` descrito por el autor, comparando los pesos resultantes con el modelo base.
- Servicio de generacion de texto en entornos controlados: al ser un MoE de 16B con ~2,8B activos, ofrece un coste de computo por token relativamente bajo frente a un denso de 16B, adecuado para prototipos de asistentes conversacionales.
- Evaluacion de afirmaciones teoricas: el paquete incluye artefactos Lean 4 y hashes SHA-256 que permiten verificar la integridad de los pesos y contrastar las afirmaciones del autor en un entorno de revision.
- Base para fine-tuning posterior: el GGUF puede servir como punto de partida para tecnicas de cuantizacion adicional (Q4_K_M, Q5_K_M) y despliegue en hardware mas modesto, aunque el autor no las publica.
- Docencia y formacion: ejemplo practico de publicacion de un modelo derivado con trazabilidad de hashes, util para ensenar buenas practicas de reproducibilidad en modelos abiertos.

## Benchmarks y rendimiento

El autor unicamente reporta una evaluacion de perplejidad en GPU:

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad | 265,8137 | 84 tokens evaluados, `NVIDIA RTX PRO 6000 Blackwell Server Edition` |
| VRAM tras carga | 17.693 MiB | Inferencia en `llama.cpp` |
| `deterministic_pass_match` | true | Reproducibilidad de la evaluacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La perplejidad de 265,8137 sobre solo 84 tokens no es comparable con metricas publicadas de otros modelos y no debe interpretarse como indicador de calidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,7 GB para el GGUF `Q8_0` (17.693 MiB medidos por el autor en una RTX PRO 6000 Blackwell).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (validada por el autor), A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, justo al limite).
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen ajustado; no cabe en GPUs de 16 GB o menos sin cuantizaciones adicionales no publicadas.
- Opciones de despliegue: `llama.cpp` (formato nativo), Ollama (importando el GGUF), servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Esta variante (`Q8_0` GGUF) | 16,38B | no disponible | no disponible | GGUF | no disponible | Ajuste de 45 pasos sobre embeddings y `lm_head` |
| `deepseek-ai/deepseek-moe-16b-base` | 16,38B | ~2,8B | 4.096 tokens (segun model card publica) | safetensors | DeepSeek Model License | Modelo base original |
| `deepseek-ai/deepseek-moe-16b-chat` | 16,38B | ~2,8B | 4.096 tokens | safetensors | DeepSeek Model License | Version afinada para chat |
| `mistralai/Mixtral-8x7B-v0.1` | 46,7B | ~12,9B | 32.768 tokens | safetensors | Apache 2.0 | MoE mas grande y con mas contexto |

La comparativa se limita a datos publicos de los modelos base; no hay benchmarks de esta variante que permitan una comparacion de rendimiento directa.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base DeepSeek-MoE-16B y la del propio repositorio.
- El ajuste afecta solo a `model.embed_tokens.weight` y `lm_head.weight` durante 45 pasos; no hay evidencia de mejora en capacidades y la perplejidad reportada (265,8137) es alta y medida sobre una muestra minima (84 tokens).
- Las afirmaciones teoricas del autor (teoria espectral aritmetica, validacion "RH7C", publicacion PNAS) no han sido verificadas de forma independiente en la informacion disponible; deben tratarse con cautela.
- Riesgo de alucinacion: inherente al modelo base; no se ha realizado ninguna evaluacion de fidelidad en esta variante.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo base y no ha sido reevaluado.
- Longitud de contexto no declarada en esta variante; el modelo base documenta 4.096 tokens, lo que limita casos de uso con documentos largos.
- Solo se publica `Q8_0`; no hay variantes Q4/Q5 que permitan desplegar en GPUs de menos de 24 GB.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- La etiqueta `endpoints_compatible` no garantiza compatibilidad con todos los proveedores de inferencia; conviene probar el GGUF en el entorno objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/deepseek-moe-16b-base-ast-aligned-nolora-GGUF-pnas
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-moe-16b-base
- Variante chat del modelo base: https://huggingface.co/deepseek-ai/deepseek-moe-16b-chat
- `llama.cpp` (runtime del GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, demos o repositorios adicionales del autor.
