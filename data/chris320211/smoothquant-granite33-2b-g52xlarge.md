# chris320211/smoothquant-granite33-2b-g52xlarge

## Resumen

`smoothquant-granite33-2b-g52xlarge` es un derivado cuantizado del modelo de instrucciones `ibm-granite/granite-3.3-2b-instruct` de IBM, publicado por el usuario `chris320211`. No se trata de un checkpoint fp16 alojado en el Hub, sino de un artefacto empaquetado para ejecución generado por el job `20260920T012426Z-d2f5c6` dentro de un pipeline denominado *quant-agent*. La técnica aplicada es SmoothQuant, una familia de cuantización post-entrenamiento que cuantiza pesos y activaciones.

El interés del artefacto es su relación calidad/coste medida de forma explícita contra el snapshot fp16 original sobre WikiText-2: la perplejidad pasa de 7,715887 a 7,762474 (ratio 1,006038, marcado como `quality_ok=True`), la VRAM pico baja de 5,641 GB a 3,377 GB y el throughput de prefill sube de 7.184,6 a 9.501,7 tokens/s, todo ello medido en una NVIDIA A10G (instancia AWS `g5.2xlarge`). Es, por tanto, un ejemplo de cuantización con ganancia neta en memoria y velocidad a cambio de una degradación muy pequeña de la perplejidad.

La contrapartida principal es que no es un reemplazo directo: la model card advierte explícitamente que no se puede cargar con `AutoModelForCausalLM.from_pretrained` y que requiere el adaptador `quant_agent_inference_adapter.py` junto con el repositorio del método en la variable `QUANT_AGENT_METHOD_REPO`. La documentación es escasa (no declara idiomas, contexto, número exacto de parámetros ni ancho de bits), el modelo acumula 262 descargas y 0 likes, y la licencia MIT declarada convive con una referencia contradictoria a «MIT for Phi-3» y con la licencia del repositorio del método.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha del artefacto. Derivado de `ibm-granite/granite-3.3-2b-instruct` (familia IBM Granite 3.3) |
| Parámetros totales | Aproximadamente 2 000 millones, según la denominación «2b» del modelo base. Cifra exacta no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | SmoothQuant (etiquetas `quantized`, `quant-agent`, `smoothquant`). El ancho de bits y el esquema de calibración no se especifican |
| Idiomas soportados | No disponible |
| Licencia | MIT (metadatos del Hub). La model card añade la licencia del repositorio del método y menciona «MIT for Phi-3» de forma contradictoria |
| Formato de pesos | Artefacto empaquetado propio del pipeline *quant-agent*, no un checkpoint fp16 safetensors cargable con `from_pretrained`. Incluye `quantization_config.json` y `quant_agent_inference_adapter.py` |
| Modelo base | `ibm-granite/granite-3.3-2b-instruct` |
| Autor | `chris320211` |
| Pipeline | `text-generation` |
| Librería declarada | `transformers` |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-20 |
| Descargas / likes | 262 / 0 |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna en la ficha del artefacto: se describe únicamente como derivado cuantizado de `granite-3.3-2b-instruct`. La transformación aplicada es SmoothQuant, un método de cuantización post-entrenamiento que migra los valores atípicos de las activaciones hacia los pesos mediante escalado por canal antes de cuantizar; esto permite cuantizar simultáneamente pesos y activaciones con una pérdida de precisión reducida. La ficha no indica el número de bits (típicamente 8 en SmoothQuant W8A8), ni el dataset de calibración, ni si alguna capa permanece en fp16.

Tampoco se documentan los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), ya que el artefacto es exclusivamente el resultado de una cuantización posterior: no hay entrenamiento adicional, destilado ni ajuste fino por parte de `chris320211`. La única evaluación publicada es la de perplejidad y *negative log-likelihood* sobre el conjunto de test de WikiText-2 con ventanas de 2048 tokens y 65 504 tokens evaluados, comparada contra el snapshot fp16 original medida en la misma GPU.

## Capacidades

La información disponible no documenta capacidades funcionales del artefacto más allá de lo heredado del modelo base. En concreto:

- Generación de texto: es el pipeline declarado (`text-generation`) y la etiqueta `conversational` figura en los metadatos, por lo que se orienta a diálogo e instrucciones.
- Respuesta a instrucciones: el modelo base es una variante *instruct*, aunque la ficha del artefacto no verifica que el comportamiento instruct se preserve tras la cuantización.
- Razonamiento, código y matemáticas: no disponible.
- *Tool calling* / *function calling*: no documentado en la información proporcionada; debe verificarse contra la model card del modelo base de IBM.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas y la única evaluación es en inglés).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; no se mencionan.

## Casos de uso

- Servicio de generación de texto con restricción de memoria: con 3,377 GB de VRAM pico medida en prefill de 2048 tokens (frente a 5,641 GB del fp16), permite levantar el endpoint en GPUs donde el checkpoint original no cabría junto al resto del sistema.
- Despliegue en instancias cloud económicas: la medición de referencia se hizo en una AWS `g5.2xlarge` con A10G, un perfil habitual para endpoints de bajo coste; el ahorro de ~40 % de VRAM permite mayor densidad de réplicas por nodo.
- Inferencia por lotes de alto throughput: los 9.501,7 tokens/s de prefill (frente a 7.184,6 del fp16) lo hacen adecuado para *batch scoring* de grandes volúmenes de documentos donde el coste dominante es el prefill.
- Chatbots conversacionales de dominio general: al ser un derivado de un modelo *instruct* de 2B con etiqueta `conversational`, encaja en asistentes ligeros siempre que la calidad se valide en el dominio objetivo, ya que solo hay perplejidad en WikiText-2 como evidencia.
- Evaluación de pipelines de cuantización en investigación: el artefacto es un caso reproducible de SmoothQuant con `quantization_config.json`, adaptador y `benchmark.json` de referencia, útil para comparar métodos de cuantización bajo la misma GPU y ventana de contexto.
- Prototipado local en estación de trabajo: con un pico de 3,377 GB, es plausible ejecutarlo en GPUs de consumo de 8 GB o más (estimación a partir del pico medido), siempre que se instale el adaptador propietario en lugar de usar `transformers` estándar.
- Extracción y clasificación de texto en pipelines internos: tareas de generación condicionada de baja latencia donde una degradación de perplejidad del 0,6 % es aceptable a cambio de reducir memoria y aumentar throughput.
- Contraste A/B contra el modelo base fp16: sirve como referencia cuantizada en experimentos que midan el impacto real de SmoothQuant en tareas *downstream*, no solo en perplejidad.

## Benchmarks y rendimiento

Único benchmark publicado: WikiText-2 (test), ventanas de 2048 tokens, 65 504 tokens evaluados, medido en NVIDIA A10G (`g5.2xlarge`) contra el snapshot fp16 original.

| Métrica | Cuantizado | Snapshot fp16 | Diferencia |
|---|---:|---:|---:|
| Perplejidad | 7,762474 | 7,715887 | +0,60 % (ratio 1,006038) |
| NLL loss | 2,049301 | 2,043281 | +0,29 % |
| Tokens/s (prefill 2048, tras warmup) | 9.501,7 | 7.184,6 | +32,2 % |
| VRAM pico (GB) | 3,377 | 5,641 | −40,1 % |

Indicadores declarados por el autor: `ppl_ratio: 1.006038`, `quality_ok=True`, `improved_throughput=True`, `improved_vram=True`. Las columnas de diferencia porcentual son cálculo derivado de los valores de la tabla original.

No hay resultados publicados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna tarea *downstream* en la información disponible.

## Requisitos de hardware

- VRAM pico medida: 3,377 GB con ventana de 2048 tokens en NVIDIA A10G; el fp16 equivalente requiere 5,641 GB. La ficha no desglosa cuánto corresponde a pesos y cuánto a activaciones del KV cache.
- GPU de referencia: NVIDIA A10G (24 GB), instancia AWS `g5.2xlarge`.
- GPU de consumo: con ese pico, es plausible en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 8 GB, RTX 2070 8 GB); es una estimación a partir del pico medido y no un dato publicado. Contextos superiores a 2048 tokens incrementarán la memoria de activaciones.
- GPU de datacenter: A10G, L4 y A100/H100 sin problema de capacidad; el cuello de botella sería el soporte de runtime, no la VRAM.
- Opciones de despliegue: no es un checkpoint *drop-in*. Requiere `quant_agent_inference_adapter.py` y el repositorio del método accesible vía `QUANT_AGENT_METHOD_REPO`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con `AutoModelForCausalLM.from_pretrained`.
- Formatos alternativos: no se publica GGUF ni AWQ/GPTQ; el artefacto es exclusivamente el paquete del pipeline *quant-agent*.
- Throughput: 9.501,7 tokens/s en prefill de 2048 tokens tras warmup. No hay datos de velocidad de decodificación (tokens/s de generación) ni de latencia por token.
- Nota: los metadatos incluyen la etiqueta `endpoints_compatible`, pero la propia model card indica que el artefacto no es cargable de forma estándar; conviene verificar esa compatibilidad antes de planificar un despliegue gestionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 (2048) | VRAM pico | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| `chris320211/smoothquant-granite33-2b-g52xlarge` | ~2B (denominación del base) | No disponible | 7,762474 | 3,377 GB (A10G) | MIT (con reservas) | Hub, requiere adaptador propio |
| `ibm-granite/granite-3.3-2b-instruct` (fp16) | ~2B | No disponible | 7,715887 | 5,641 GB (A10G) | No disponible en la información proporcionada | Hub, carga estándar con `transformers` |
| Otras variantes cuantizadas del mismo base (GGUF, AWQ, GPTQ) | ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa solo es posible contra el snapshot fp16 del mismo modelo base, que es la referencia que el autor incluye. No se dispone de datos de alternativas de cuantización equivalentes ni de otros modelos de ~2B en la información proporcionada.

## Limitaciones y advertencias

- Calidad evaluada únicamente con perplejidad y NLL sobre WikiText-2 (inglés, dominio enciclopédico). No hay evaluación en tareas generativas, razonamiento, código o matemáticas, por lo que la degradación funcional real es desconocida.
- Degradación medida pequeña pero no nula: +0,60 % de perplejidad y +0,29 % de NLL respecto al fp16.
- Riesgo de alucinación: no medido ni documentado; es una limitación heredada del modelo base y no se cuantifica en la ficha.
- Sesgos: no documentados.
- Idiomas: no se declaran idiomas soportados; la única evidencia empírica es en inglés (WikiText-2).
- Contexto: la longitud de contexto no se especifica y la medición solo cubre ventanas de 2048 tokens; se desconoce el comportamiento con contextos largos.
- Compatibilidad: no es un checkpoint estándar de `transformers`. Requiere el adaptador incluido y el repositorio del método en `QUANT_AGENT_METHOD_REPO`, lo que dificulta la integración en vLLM, llama.cpp, Ollama o TGI.
- Licencia: se declara MIT, pero la model card mezcla «MIT for Phi-3» (referencia ajena al modelo base, que es Granite) y la licencia del repositorio del método. Antes de uso comercial hay que revisar `LICENSE` y `NOTICE.md` del snapshot y la licencia del repositorio del método.
- Madurez: creado y actualizado el 2026-09-20, 262 descargas y 0 likes; no hay validación independiente ni informes de terceros.
- Trazabilidad: los pesos provienen del job `20260920T012426Z-d2f5c6` y las métricas de `benchmark.json`; no se detalla el dataset de calibración ni si hay capas en precisión completa.
- Los resultados de búsqueda web disponibles no contienen información técnica sobre este modelo; solo referencias legales sin relación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris320211/smoothquant-granite33-2b-g52xlarge
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-2b-instruct
- Referencia del método SmoothQuant (no incluida en las fuentes proporcionadas; verificar antes de citar): https://arxiv.org/abs/2211.10438
- No se han encontrado otros enlaces relevantes (papers, repos, demos o blogs) en los resultados de búsqueda web disponibles.
