# Entrit/tritllm-codec

## Resumen

`Entrit/tritllm-codec` es la implementación de referencia del códec de cuantización post-entrenamiento en ternario balanceado descrito en el artículo "Balanced Ternary Post-Training Quantization for Large Language Models" (Stentzel, 2026). No es un modelo de lenguaje en sí, sino una herramienta de cuantización que transforma los pesos FP16 de un LLM en representaciones ternarias balanceadas con profundidad configurable `d ∈ {1, 2, 3, 4}`, lo que corresponde a 3, 9, 27 y 81 niveles por peso respectivamente. El resultado se desquantiza a safetensors FP16 que se cargan directamente en `transformers` y `lm-eval` sin necesidad de un loader personalizado.

La relevancia del códec radica en que no requiere datos de calibración ni ajuste por modelo: las escalas se calculan una sola vez y se derivan múltiples configuraciones en una sola pasada. El autor reporta tasas de compresión entre 1,88 y 6,64 bits por peso (BPW) según la profundidad, manteniendo `lm_head`, embeddings y capas de normalización en FP16, convención habitual en la literatura de cuantización (GPTQ, AWQ, NF4).

Se trata de un artefacto de primera generación: los checkpoints pre-cuantizados del artículo (Qwen2.5, Llama-3.1-8B, Mistral-7B) ya no están alojados, y los modelos actuales de Entrit utilizan un códec posterior denominado `d2` que se ejecuta con `Entrit/llama.cpp-d2nl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec de cuantización post-entrenamiento (ternario balanceado); no es un modelo transformer |
| Parámetros totales | no disponible (depende del modelo de origen que se cuantice) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo de origen) |
| Tipos de cuantización | Ternario balanceado con profundidad `d ∈ {1, 2, 3, 4}` (3, 9, 27, 81 niveles por peso); BPW resultantes: 1,88 / 3,47 / 5,05 / 6,64 |
| Idiomas soportados | no disponible (heredados del modelo de origen) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors FP16 desquantizados (cargables en `transformers`); código Python |

## Arquitectura y entrenamiento

El códec aplica cuantización post-entrenamiento sobre todas las matrices de pesos lineales 2D del modelo. Cada grupo de 16 pesos (`G = 16`) se cuantiza a ternario balanceado con una profundidad configurable, y se asocia a una escala elegida de un codebook logarítmico de 27 entradas (profundidad de escala `d_s = 3`). La selección de escala se realiza por minimización del error cuadrático medio entre 4 candidatos: los índices `[G-6, G-4, G-2, G-1]` de los valores absolutos ordenados de los pesos del grupo. El rango del codebook de escalas va desde el percentil 0,1 de los máximos de grupo hasta el máximo global, corregido en el commit `0c16d24` (antes se usaba el percentil 99,9, que recortaba valores).

El mapeo de potencia por profundidad está fijado en `d1=1.0`, `d2=1.5`, `d3=1.2`, `d4=1.0`, ajustado una sola vez sobre Qwen2.5-7B y mantenido fijo para todos los modelos posteriores. No se emplean datos de calibración ni ajuste por modelo. El proceso no incluye RLHF, DPO ni entrenamiento adicional: es puramente una transformación de pesos. La fórmula de BPW es `d * 1.585 + 0.297` para `G=16` y `d_s=3`, contabilizando solo pesos y escalas de las matrices cuantizadas.

El códec genera checkpoints con huella digital de `(modelo, revisión, versión del códec, tamaño de grupo, mapeo de potencia)` y forma matricial; en caso de reanudación, los checkpoints con huella discordante se descartan y se recuantizan en lugar de mezclarse silenciosamente. El `config.json` ensamblado registra la huella completa para verificar el origen de cada salida.

## Capacidades

- Cuantización de pesos FP16 de LLMs a ternario balanceado con profundidad configurable.
- Ejecución sin datos de calibración ni ajuste por modelo.
- Modo multi-configuración en una sola pasada: calcula escalas una vez y deriva hasta 6 configuraciones (`uniform-d1`, `uniform-d2`, `uniform-d3`, `uniform-d4`, `d3scale-sens002`, `d3scale-sens003`).
- Salida en safetensors FP16 desquantizados cargables en `transformers` y `lm-eval` estándar, sin loader personalizado.
- Preservación en FP16 de `lm_head`, `embed_tokens` y capas `*_norm` (no contabilizadas en el BPW total).
- Verificación de reproducibilidad mediante huella digital y pinning de revisión (`--revision <git-sha>`).
- No incluye capacidades de generación, razonamiento, código, visión ni tool calling por sí mismo; estas dependen del modelo de origen cuantizado.

## Casos de uso

- Compresión de LLMs para despliegue con memoria reducida: cuantizar un modelo de 7B a `d=2` (3,47 BPW) reduce el peso de las matrices lineales aproximadamente a una cuarta parte del FP16, permitiendo inferencia en GPUs con menos VRAM sin cambiar el código de carga en `transformers`.
- Reproducción de experimentos académicos: investigadores que necesiten replicar los resultados del artículo de Stentzel (2026) pueden reconstruir los checkpoints de Qwen2.5 (0,5B–72B), Llama-3.1-8B y Mistral-7B en profundidades d=1 a d=4, ya que los originales no están alojados.
- Evaluación comparativa de cuantizaciones: el modo multi-configuración permite generar seis variantes en una sola pasada y comparar perplejidad y precisión en `lm-eval` con un coste computacional reducido.
- Integración en pipelines de CI/CD de modelos: la huella digital y el pinning por revisión permiten versionar y auditar qué modelo fuente y versión del códec produjeron cada checkpoint, útil en flujos de publicación automatizada.
- Investigación sobre cuantización ternaria: sirve como línea base reproducible para comparar con GPTQ, AWQ o NF4 en términos de BPW y degradación de perplejidad.
- Prototipado de modelos ligeros en entornos con restricciones de almacenamiento: la salida en safetensors estándar facilita el intercambio y la carga en infraestructuras existentes sin dependencias adicionales.
- Estudio de familias de modelos nuevas: el archivo `KNOWN_ISSUES.md` documenta qué observar en familias de modelos no vistas al aplicar la búsqueda de escala de 4 candidatos y el límite superior `log_max = max(...)`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el ajuste del mapeo de potencia se realizó sobre Qwen2.5-7B y que `gs=16` ofrece mejor perplejidad que `gs=64`, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo de origen. Para un modelo de 7B, `d=2` (3,47 BPW) implica aproximadamente 3 GB para las matrices cuantizadas más los embeddings, `lm_head` y normas en FP16; `d=1` (1,88 BPW) reduce aún más el peso de las matrices lineales.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la salida en safetensors FP16 desquantizados es cargable en `transformers`, por lo que los requisitos coinciden con los del modelo de origen en FP16 tras la desquantización en memoria.
- Opciones de despliegue: `transformers` y `lm-eval` estándar para los checkpoints desquantizados; para los modelos actuales de Entrit se indica `Entrit/llama.cpp-d2nl`, no aplicable a este códec de primera generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Códec | Tipo | Calibración | BPW (profundidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Entrit/tritllm-codec` | Ternario balanceado PTQ | No requiere | 1,88 / 3,47 / 5,05 / 6,64 (d1–d4) | Apache 2.0 | Hugging Face, 0 descargas |
| GPTQ | Cuantización entera PTQ | Requiere | Típicamente 3–4 BPW | Apache 2.0 (implementaciones) | Amplia |
| AWQ | Cuantización entera PTQ | Requiere | Típicamente 4 BPW | Apache 2.0 (implementaciones) | Amplia |
| NF4 (bitsandbytes) | Cuantización de 4 bits | No requiere | 4 BPW | MIT (bitsandbytes) | Amplia |

La información disponible no incluye comparaciones de rendimiento entre estos códecs ni datos de perplejidad que permitan establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es un códec de primera generación: los checkpoints pre-cuantizados del artículo ya no están alojados y los modelos actuales de Entrit usan el códec `d2` con `Entrit/llama.cpp-d2nl`, por lo que este repositorio no representa el estado actual del proyecto.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción ni validación externa.
- No se especifican idiomas soportados ni pipeline; ambas capacidades dependen enteramente del modelo de origen.
- El códec solo cuantiza matrices lineales 2D; `lm_head`, embeddings y normas permanecen en FP16, lo que limita la compresión total del checkpoint frente al BPW nominal de las matrices.
- Dos compromisos de diseño documentados en `KNOWN_ISSUES.md` (búsqueda de escala de 4 candidatos y límite superior `log_max = max(...)`) pueden comportarse de forma subóptima en familias de modelos distintas a las evaluadas.
- Sin pinning de revisión (`--revision <git-sha>`), el repositorio fuente puede cambiar entre ejecuciones y producir resultados no reproducibles.
- No se han publicado datos de benchmarks ni de degradación de perplejidad en la información disponible; el impacto en calidad por profundidad no está cuantificado en la model card.
- Riesgo de alucinación, sesgos y restricciones de uso comercial: no disponibles para el códec; dependen del modelo de origen y de su licencia.
- La licencia Apache 2.0 del códec no exime de cumplir las licencias de los modelos de origen que se cuanticen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Entrit/tritllm-codec
- Página del autor en Hugging Face: https://huggingface.co/Entrit
- Códec actual de Entrit (`d2`): https://huggingface.co/Entrit/llama.cpp-d2nl
- Artículo de referencia: Stentzel, E. (2026), "Balanced Ternary Post-Training Quantization for Large Language Models", Entrit Systems (sin URL disponible)
- `KNOWN_ISSUES.md`: incluido en el repositorio, sin URL directa disponible
