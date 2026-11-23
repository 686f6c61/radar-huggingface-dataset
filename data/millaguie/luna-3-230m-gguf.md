# millaguie/Luna-3-230m-GGUF

## Resumen

Luna-3-230m-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Aobangaming/Luna-3-230m, publicada por el usuario millaguie. El modelo original es un transformer denso de 230 millones de parámetros (228.829.440 exactos) con 12 capas, dimensión de 768 y 12 cabezas de atención sin GQA, entrenado con una arquitectura propietaria denominada "lightning" que no forma parte del árbol upstream de llama.cpp. El repositorio resuelve un problema concreto: los GGUF del autor original existían pero ningún binario de llama.cpp podía cargarlos, porque la arquitectura "lightning" no estaba registrada en `src/llama-arch.cpp`.

La aportación de este repositorio es doble. Por un lado, proporciona un parche (`lightning-port.patch`) que añade el soporte de arquitectura necesario para compilar llama.cpp con capacidad de cargar estos pesos. Por otro, publica dos cuantizaciones verificadas (Q8_0 y Q4_K_M) junto con una metodología de validación explícita en cinco fases que compara los logits del port contra la implementación de referencia en `transformers`. El repositorio incluye además una advertencia relevante: el fork del autor original (`AobanZu/lightning.cpp`) todavía no tokeniza de forma idéntica al modelo original, con 11 de 17 casos divergentes en `paridad-tok.txt`.

El modelo es relevante ahora por dos motivos. Primero, porque demuestra un patrón habitual en el ecosistema open source: pesos publicados sin soporte de runtime, y la comunidad rellenando ese hueco. Segundo, porque documenta con rigor metodológico un fenómeno poco discutido: cómo la métrica `Mean PPL(Q)/PPL(base)` de `llama-perplexity` puede reportar divergencias espurias del 5,9 % en modelos de alta entropía, incluso cuando la KLD es exactamente cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso ("lightning"), 12 capas, 768 de dimensión, 12 cabezas sin GQA |
| Parametros totales | 228.829.440 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.126 tokens |
| Tipos de cuantizacion | BF16 (referencia), Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (los originales en safetensors en el repo base) |
| Vocabulario | 93.615 tokens |
| Longitud feed-forward | 4 × d_model (3.072) |
| RoPE base | 10.000 |
| RMS epsilon | 1e-6 |
| Función de activación | GELU exacta (`approximate="none"`), no aproximación tanh |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 230M parámetros con una forma convencional: 12 bloques, anchura 768, 12 cabezas de atención sin grouped-query attention, vocabulario de 93.615 tokens y contexto de 8.126 tokens. Tres detalles de implementación son relevantes para cualquier port: usa GELU exacta en lugar de la aproximación tanh (un error aquí es invisible en el texto generado pero medible en logits), cada bloque construye un tensor `final_norm` que su `forward` nunca utiliza (comentado como `# remove later lol` en el código del autor, y descartado por el conversor), y el tokenizador aplica `add_prefix_space` en su pre-tokenizador ByteLevel, a diferencia del de GPT-2.

Tres hiperparámetros no están presentes en `config.json` y se han derivado del código del autor, no por inferencia: la longitud feed-forward es `4 * d_model`, la base RoPE es 10.000 y el epsilon de RMS es 1e-6. No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El modelo base se distribuye con licencia MIT.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, con un formato de prompt sugerido del tipo `User: ...\nAssistant:`.
- Generación de texto en CPU: el modelo completo en BF16 ocupa 461 MB y cabe entero en RAM, lo que permite inferencia sin GPU.
- Cuantización con pérdida controlada: Q8_0 mantiene un 98,816 % de coincidencia en top-1 y Q4_K_M un 91,153 %, con KLD medias de 0,000227 y 0,012842 respectivamente.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar una vez aplicado el parche de arquitectura.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación educativa con arquitecturas transformer: el modelo es lo bastante pequeño (230M parámetros, 461 MB en BF16) para inspeccionar el grafo completo, comparar logits contra `transformers` y estudiar el efecto de la cuantización sin necesidad de infraestructura dedicada.
- Validación de ports de llama.cpp: el repositorio sirve como caso de referencia para quien necesite añadir una arquitectura nueva a llama.cpp, con una metodología de cinco fases (conversión, paridad de tokenizador, anclaje de logits, controles negativos y medición de cuantización) que puede replicarse.
- Inferencia en dispositivos con recursos muy limitados: con Q4_K_M (155 MB) el modelo puede ejecutarse en CPU en entornos embebidos, Raspberry Pi o contenedores con poca memoria, siempre que se compile el llama.cpp parcheado.
- Generación de texto de bajo coste en pipelines por lotes: para tareas donde la calidad de un modelo de 230M sea suficiente, el throughput de aproximadamente 310 t/s en CPU permite procesar volúmenes moderados sin GPU.
- Investigación sobre cuantización: las métricas publicadas (KLD, coincidencia top-1, suelo instrumental de 0,000000) permiten estudiar el comportamiento de Q8_0 y Q4_K_M en modelos de alta perplejidad y comparar con otras técnicas de cuantización.
- Docencia sobre tokenizadores: la discrepancia documentada entre el pre-tokenizador de Luna y el de GPT-2 (por `add_prefix_space`) constituye un caso práctico para explicar cómo pequeñas diferencias en el pre-tokenizador alteran los IDs y, por tanto, la inferencia.

## Benchmarks y rendimiento

| Metrica | BF16 (referencia) | Q8_0 | Q4_K_M |
|---|---|---|---|
| Tamano en bytes | 461.378.496 | 246.946.688 | 155.680.736 |
| KLD media | — | 0,000227 | 0,012842 |
| KLD mediana | — | 0,000204 | 0,011214 |
| Coincidencia top-1 | — | 98,816 % | 91,153 % |
| Perplejidad wikitext-2 | 9.780,30 ± 295,33 | no reportada | no reportada |

Medición sobre wikitext-2 test, 100 fragmentos de 512 tokens, con `-fa on --seed 0 -ngl 0`, todo en CPU. El suelo instrumental es exactamente 0,000000 con coincidencia top-1 del 100,000 % y una Δp máxima del 0,004 %, lo que confirma que las cifras de cuantización reflejan únicamente al cuantizador.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El modelo completo en BF16 ocupa 461 MB y cabe entero en RAM; Q8_0 ocupa 247 MB y Q4_K_M 156 MB.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1 GB de VRAM podría alojar el modelo, aunque el repositorio solo documenta ejecución en CPU (`-ngl 0`).
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3060, GTX 1650 o incluso iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp con el parche `lightning-port.patch` aplicado y compilado. No es compatible con builds upstream de llama.cpp (`unknown model architecture: 'lightning'`), ni con el fork `AobanZu/lightning.cpp` en su estado actual (falla con `unknown pre-tokenizer type: 'lightning'`). Ollama, vLLM y TGI no están documentados como soportados.
- Throughput: aproximadamente 310 tokens por segundo en CPU según la model card.
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna-3-230m | 228,8M | 8.126 | MIT | GGUF (parcheado) | Requiere llama.cpp con parche; perplejidad wikitext-2 de 9.780 |
| GPT-2 small | 124M | 1.024 | MIT | safetensors, GGUF | Soporte upstream en llama.cpp; perplejidad wikitext-2 en torno a 30 |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | safetensors, GGUF | Soporte upstream; mayor calidad pero 5× más parámetros |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Soporte upstream; contexto mayor |

La comparación con GPT-2 small es la más directa por tamaño y licencia, pero conviene señalar que la perplejidad de Luna en wikitext-2 (9.780) es dos órdenes de magnitud superior a la de GPT-2 small, lo que sugiere que el modelo no fue entrenado sobre prosa de Wikipedia en inglés y que las métricas absolutas de perplejidad no son comparables entre ambos.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: los binarios oficiales fallan con `unknown model architecture: 'lightning'`. Sin compilar el parche, los pesos son inutilizables.
- El fork del autor original (`AobanZu/lightning.cpp`, commit `c71a1c4`) carga y genera, pero no tokeniza igual que el modelo original: 11 de 17 casos de `paridad-tok.txt` producen IDs distintos a `transformers`.
- Perplejidad muy alta en wikitext-2 (9.780,30 ± 295,33), lo que indica que el modelo no está especializado en prosa enciclopédica en inglés y que su calidad general es limitada.
- La métrica `Mean PPL(Q)/PPL(base)` de `llama-perplexity` no es fiable en este modelo: reporta una divergencia del 5,9 % incluso cuando la KLD es exactamente cero, por un sesgo de aproximadamente 0,057 nats derivado de la cuantización a `uint16` del archivo de log-probabilidades. Debe leerse la KLD, no esa columna.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma distinto del inglés sin evaluación previa.
- No hay información sobre sesgos, alineación, RLHF o filtrado de datos de entrenamiento.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 230M parámetros sin ajuste por instrucciones documentado.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el parche de arquitectura debe aplicarse por separado y el modelo base conserva su propia licencia MIT.
- El repositorio tiene 448 descargas y 0 likes, lo que sugiere una adopción muy limitada y poca validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/millaguie/Luna-3-230m-GGUF
- Modelo base: https://huggingface.co/Aobangaming/Luna-3-230m
- GGUF del autor original: https://huggingface.co/Aobangaming/Luna-3-230m-GGUF
- Fork de llama.cpp del autor: https://github.com/AobanZu/lightning.cpp
