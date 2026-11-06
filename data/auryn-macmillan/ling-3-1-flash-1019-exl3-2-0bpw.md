# auryn-macmillan/Ling-3.1-flash-1019-EXL3-2.0bpw

## Resumen

Ling-3.1-flash-1019-EXL3-2.0bpw es una cuantización EXL3 de 2,06 bits por peso (bpw) del modelo base inclusionAI/Ling-3.1-flash-1019, un transformer MoE de 560.000 millones de parámetros totales con 25.000 millones activos y una ventana de contexto nativa de 1.000.000 de tokens. La cuantización la ha producido el usuario auryn-macmillan con exllamav3 1.6.6 sobre cinco RTX 3090, y su objetivo es reducir un modelo de esa escala a unos 142 GiB de pesos para que pueda ejecutarse en hardware de consumo de gama alta mediante offload parcial de expertos a memoria de host.

El interés práctico de esta ficha es que demuestra un régimen de despliegue hasta ahora poco habitual: un MoE de clase 500B+ con contexto largo ejecutándose en cinco GPU de 24 GB, sacrificando velocidad de decodificación (en torno a 32 t/s por petición) y latencia de prefill (743-781 t/s) a cambio de una huella de VRAM manejable. No es un modelo para producción de alta concurrencia, sino una opción para experimentación local, evaluación de calidad y prototipado con hardware asequible.

El repositorio incluye la receta exacta por tensor, un `tabby_config.yml` probado y métricas medidas de TTFT, decodificación, concurrencia y prefill. La licencia MIT del modelo base se mantiene, y el autor publica además una variante mixta 1.5/1.0 bpw que cabe íntegramente en VRAM en la misma configuración de cinco tarjetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida `bailing_hybrid` (BailingMoeV3ForCausalLM): 68 capas MoE con 512 expertos enrutados, atención lineal KDA y MLA con puerta en 9 capas |
| Parametros totales | 76.046.048.064 (76,0 B según safetensors del repo cuantizado); el modelo base declara 560 B totales / 25 B activos |
| Parametros activos | 25 B (modelo base, según model card del autor de la cuantización) |
| Longitud de contexto | 1.000.000 de tokens en el modelo base; 65.536 tokens en la configuración probada (`max_seq_len: 65536`) |
| Tipos de cuantizacion | EXL3 trellis, media de 2,06 bpw; expertos enrutados a 2,0 bpw, expertos compartidos a 5,0 bpw, proyecciones KDA a 4,0 bpw, MLA con puerta a 6,0 bpw, `lm_head` a 6,0 bpw, capa MTP a 4,0 bpw, embeddings/norms/router sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base MIT) |
| Formato de pesos | safetensors EXL3 (`exl3`), 18 shards, 426.632 tensores, 152,09 GB en disco (141,6 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 68 capas MoE y 512 expertos enrutados por capa, complementado con expertos compartidos. La arquitectura `bailing_hybrid` combina proyecciones de atención lineal KDA (`qkv`, `o`, `f`, `g`) con atención MLA con puerta en 9 capas, y añade una capa MTP (multi-token prediction) en la posición 72 que actúa como cabecera de decodificación especulativa. Los detalles de composición del dataset de entrenamiento, número de tokens vistos y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La cuantización se generó con exllamav3 1.6.6 a partir de la release FP8 del modelo base, usando los datos de calibración estándar de exllamav3 (250 filas × 2048 columnas). La receta por tensor está incluida en `recipe/ling-2.0bpw.yaml` con 105.000 entradas y claves exactas y comodín aceptadas por `convert.py -rcp`. Los expertos enrutados concentran aproximadamente el 97 % de los pesos, por lo que la tasa de 2,0 bpw aplicada a ellos es la que determina el tamaño final del artefacto. La capa MTP se conserva a 4 bpw para permitir `draft_mode: mtp` con 5 tokens de borrador.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento en modo "thinking medium", con rendimiento medido de 32,8 t/s en decodificación.
- Salida estructurada en JSON, con TTFT medido de 1,22 s y 32,6 t/s en el conjunto de pruebas del autor.
- Recuperación de información en contexto largo: las pruebas needle a 30.000 y 58.000 tokens pasaron.
- Decodificación especulativa mediante la capa MTP integrada (`draft_mode: mtp`, 5 tokens de borrador, 64 tokens de borrador híbrido).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación local de un MoE de gran escala: permite medir calidad de generación, coherencia y recuperación en contexto largo de un modelo de clase 500B+ sin acceso a clústeres de 8× H100, usando cinco RTX 3090 y offload de expertos a RAM.
- Prototipado de pipelines de razonamiento con contexto largo: con 64K tokens configurados y KV cache MLA de aproximadamente 416 B/token a Q4, se pueden procesar documentos extensos, informes o bases de código en una sola pasada, a 743-781 t/s de prefill.
- Generación de salida estructurada en entornos de desarrollo: el rendimiento medido en JSON (32,6 t/s, TTFT 1,22 s) lo hace utilizable para pruebas de extracción de campos, validación de esquemas y generación de respuestas con formato fijo en local.
- Servicio de inferencia personal o de equipo pequeño con TabbyAPI: la configuración probada con `max_batch_size: 4` alcanza 61,8 t/s agregados con cuatro peticiones concurrentes y TTFT máximo de 5,85 s, suficiente para un asistente interno de baja concurrencia.
- Investigación sobre cuantización extrema: la receta por tensor y las métricas publicadas permiten estudiar el impacto de 2,0 bpw en expertos enrutados frente a las variantes 1.5/1.0 bpw del mismo autor, con la misma máquina de referencia.
- Pruebas de recuperación en contexto largo (RAG de documentos extensos): los needle tests superados a 30K y 58K tokens permiten validar pipelines de recuperación antes de migrar a infraestructura mayor.
- Desarrollo y depuración de aplicaciones con decodificación especulativa: la capa MTP a 4 bpw permite comparar el rendimiento de `draft_mode: mtp` frente a decodificación estándar en un modelo MoE real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se ejecutó comparación de KL ni perplejidad frente a la release FP8, y que la calidad se comprobó con needle tests y generaciones manuales.

Rendimiento de inferencia medido por el autor en 5× RTX 3090, 2× Xeon, 247 GB RAM, con MTP activado:

| Carga de trabajo | TTFT | Decodificación |
|---|---|---|
| Prosa | 0,72 s | 31,5 t/s |
| JSON | 1,22 s | 32,6 t/s |
| Razonamiento ("thinking medium") | 0,82 s | 32,8 t/s |

| Concurrencia (200 tokens/petición) | Agregado | Por petición | TTFT máximo |
|---|---|---|---|
| 1 | 30,9 t/s | 33,8 t/s | 0,66 s |
| 2 | 42,4 t/s | 23,2 t/s | 2,74 s |
| 4 | 61,8 t/s | 18,4 t/s | 5,85 s |
| 8 | 86,0 t/s | 24,5 t/s | 11,41 s |

| Prefill (sin caché) | Tokens | Tiempo | Throughput |
|---|---|---|---|
| Prompt corto-medio | 12.500 | 16,2 s | 781 t/s |
| Prompt largo | 51.800 | 70 s | 743 t/s |

Tiempo de carga: 100 s incluyendo warmup (26,9 s), desde NVMe.

## Requisitos de hardware

- Pesos EXL3: 141,6 GiB (152,09 GB en disco, 18 shards).
- VRAM: en la configuración probada con 5× 24 GB (aproximadamente 117 GB utilizables) quedan unos 52 GB de expertos enrutados en CPU; cada experto devuelto a VRAM ocupa aproximadamente 3,7 MiB.
- Memoria de host: 55-60 GB para el arena de expertos fijada en CPU, más 60 GB adicionales si se conserva la fuente FP8.
- KV cache y workspace: aproximadamente 5 GB a 64K de contexto con caché Q4; el MLA consume unos 416 B/token a Q4 (`kv_lora` 512 + 64 dimensiones rope).
- GPU recomendadas: cinco RTX 3090 es la configuración validada; el autor indica que con tarjetas más vacías se puede subir `gpu_split` o bajar `cpu_moe_split_experts`. A100 y H100 no están documentadas en la información disponible.
- ¿Cabe en GPU de consumo? Sí, en cinco GPU de 24 GB con offload parcial de expertos a CPU. Existe una variante 1.5/1.0 bpw que cabe íntegramente en VRAM en la misma configuración.
- Despliegue: exclusivamente exllamav3 ≥ 1.6.6 (soporte Ling 3.x desde el commit `c0a19b1`) o TabbyAPI. No es compatible con transformers, vLLM ni llama.cpp.
- Reparto de GPU probado: `gpu_split: [19.0, 21.0, 21.0, 17.5, 21.0]`, con `cpu_moe_split_experts: 208` por capa MoE y `cpu_moe_threads: 32`.
- Latencia y throughput: ver tabla de benchmarks; el prefill en contexto largo está limitado por CPU y host en esta configuración con offload.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-EXL3-2.0bpw (este) | 560 B totales / 25 B activos (base); 76,0 B en safetensors del repo | 1 M nativo; 64K configurado | EXL3 2,06 bpw, safetensors | MIT | Hugging Face, 0 descargas |
| Ling-3.1-flash-1019-EXL3-1.5-1.0bpw | Mismo modelo base | 1 M nativo | EXL3 mixto 1.5/1.0 bpw | MIT | Hugging Face, del mismo autor; cabe entero en VRAM en 5× 3090 |
| inclusionAI/Ling-3.1-flash-1019 (FP8) | 560 B totales / 25 B activos | 1 M | FP8 | MIT | Hugging Face, modelo base |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ejecutó comparación de perplejidad ni KL frente a la release FP8; la calidad se validó con needle tests y generaciones manuales, no con una suite de benchmarks.
- El contexto máximo práctico en la configuración probada es de 64K tokens, no el 1M nativo del modelo base; ampliarlo es principalmente una cuestión de VRAM disponible.
- El prefill en contexto largo está limitado por CPU y host debido al offload de expertos: 743-781 t/s frente a lo que se obtendría con todos los pesos en GPU.
- La concurrencia escala mal: con 8 peticiones simultáneas el TTFT máximo llega a 11,41 s y el rendimiento por petición cae a 24,5 t/s.
- Compatibilidad restringida: no funciona con transformers, vLLM ni llama.cpp; requiere exllamav3 ≥ 1.6.6 o TabbyAPI. Las instrucciones SGLang/vLLM de la model card del modelo base no aplican a este repo.
- Los archivos `configuration_bailing_moe_v3.py` y `modeling_bailing_moe_v3.py` se incluyen solo como referencia y no los usa exllamav3.
- El repositorio registra `quantization_config.version` 1.6.4 aunque la conversión se hizo con exllamav3 1.6.6.
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo habitual de los modelos generativos, agravado por la ausencia de evaluación con benchmarks estándar.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia MIT en modelo base y cuantización, sin restricciones comerciales adicionales documentadas; aun así, conviene verificar los términos del modelo base antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la cuantización.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/auryn-macmillan/Ling-3.1-flash-1019-EXL3-2.0bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Variante 1.5/1.0 bpw del mismo autor: https://huggingface.co/auryn-macmillan/Ling-3.1-flash-1019-EXL3-1.5-1.0bpw
- exllamav3 (herramienta de cuantización e inferencia): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible): https://github.com/theroyallab/tabbyAPI
