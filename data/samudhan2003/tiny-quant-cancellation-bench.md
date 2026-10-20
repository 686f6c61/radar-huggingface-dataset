# samudhan2003/Tiny-Quant-Cancellation-Bench

## Resumen

Tiny-Quant-Cancellation-Bench no es un modelo de lenguaje, sino un banco de pruebas reproducible publicado en HuggingFace por Samudhan S (@samudhan2003) para validar empíricamente una hipótesis sobre cuantización de precisión mixta. El repositorio examina si mezclar INT8 e INT4 por capas (INT8 en atención, INT4 en las capas MLP) produce cancelación de errores en lugar de acumulación, una idea planteada por Baseten Research en su estudio sobre cientos de modelos cuantizados. El trabajo se limita deliberadamente a modelos por debajo de 1000 millones de parámetros: distilgpt2 (82M) y gpt2-small (124M).

El benchmark compara cuatro configuraciones implementadas con bitsandbytes —FP16 como referencia, LLM.int8() en todas las capas lineales, NF4 de 4 bits en todas las capas y la configuración mixta objeto de estudio— midiendo throughput (tokens/s), calidad normalizada respecto a FP16, latencia P50 por token y VRAM pico. Todas las pruebas se ejecutan sobre una única NVIDIA T4 de 16 GB con perplejidad sobre WikiText-2 más un pequeño conjunto de generación reservado.

Su relevancia es metodológica más que de rendimiento: aporta evidencia abierta y reproducible sobre una técnica que hasta ahora solo se había explorado a escala en laboratorios industriales, y publica el harness completo junto con el fichero `quant_results.csv`. Los resultados reportados indican que la configuración mixta alcanza 48 tokens/s con calidad 0,92, frente a 40 tokens/s y 0,88 de INT4 uniforme, es decir, un 20 % más de throughput y 4 puntos más de calidad que INT4 puro, igualando la calidad de INT8 con un 20 % más de velocidad a cambio de 100 MB adicionales de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (banco de pruebas). Modelos base evaluados: distilgpt2 y gpt2-small, transformers decoder-only |
| Parámetros totales | 82M (distilgpt2) y 124M (gpt2-small); el repositorio no contiene pesos propios |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No indicado en la model card (los modelos base GPT-2/distilgpt2 usan 1024 tokens) |
| Tipos de cuantización | FP16 (referencia), INT8 con LLM.int8(), INT4 NF4, mixta INT8/INT4 por capas (atención INT8, MLP INT4); todas vía bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio publica artefactos de benchmark, incluido `quant_results.csv`, no pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Se apoya en dos checkpoints preentrenados de la familia GPT-2 (distilgpt2, 82M, destilado; y gpt2-small, 124M) y aplica sobre ellos cuatro configuraciones de cuantización post-entrenamiento con bitsandbytes: `fp16_baseline`, `int8_all` (LLM.int8() en todas las capas lineales), `int4_all` (NF4 de 4 bits en todas las capas lineales) y `mixed_int8_int4`, donde las proyecciones de atención (q/k/v) se mantienen en INT8 por considerarse sensibles y las capas MLP se cuantizan a INT4 por considerarse robustas. No se aplica ajuste fino, RLHF ni DPO; es cuantización puramente post-entrenamiento (PTQ).

La innovación metodológica es la granularidad del reparto de precisión: en lugar de elegir una precisión uniforme, se asigna por tipo de capa siguiendo la hipótesis de que los errores de atención son direccionales mientras que los de MLP son más aleatorios, de modo que podrían cancelarse parcialmente. La evaluación combina perplejidad sobre WikiText-2 con un conjunto de generación reservado de pequeño tamaño, y registra throughput en tokens/s, una puntuación de calidad normalizada (1,0 = perplejidad FP16), latencia P50 por token y VRAM pico en MB sobre una NVIDIA T4 de 16 GB. La model card está truncada en la sección que formaliza el modelo de error de cuantización ("Quantization error can be modeled as:"), por lo que el desarrollo teórico de la cancelación no está completo en el texto publicado.

## Capacidades

- Cuantificación post-entrenamiento de modelos transformer en FP16, INT8 (LLM.int8()) e INT4 (NF4) mediante bitsandbytes.
- Configuración de precisión mixta a nivel de tipo de capa (atención frente a MLP), con asignación diferenciada de INT8 e INT4.
- Medición de throughput en tokens por segundo bajo cada configuración.
- Medición de latencia P50 por token.
- Medición de VRAM pico durante la inferencia.
- Evaluación de calidad mediante perplejidad sobre WikiText-2 y una puntuación normalizada respecto a la referencia FP16.
- Publicación de resultados estructurados en CSV (`quant_results.csv`) para análisis posterior.
- No incluye tool calling, capacidades de agente, multimodalidad ni modos de razonamiento: es un harness de evaluación, no un modelo utilizable para inferencia genérica.

## Casos de uso

- Validación de la hipótesis de cancelación de errores de Baseten: el repositorio reproduce a escala sub-1B el experimento original, permitiendo comprobar si la mezcla INT8/INT4 supera a la precisión uniforme antes de invertir en pruebas sobre modelos mayores.
- Selección de política de cuantización en despliegues de modelos pequeños: los datos de throughput, latencia y VRAM por configuración permiten decidir entre INT8 uniforme (600 MB, 40 t/s) y mixta (700 MB, 48 t/s) según el presupuesto de memoria del nodo de inferencia.
- Optimización de latencia en GPUs legacy o de gama baja: la configuración mixta reduce la latencia P50 de 130 ms (FP16) a 95 ms en una T4, un dato directamente aplicable a servicios con requisitos de tiempo de respuesta ajustados.
- Servicio de inferencia en el borde (edge): con un consumo de VRAM de 500-1000 MB, estas configuraciones caben en GPUs integradas o aceleradores de baja potencia, y el banco de pruebas ofrece métricas para dimensionar el hardware.
- Docencia y formación en inferencia eficiente: el repositorio sirve como ejemplo completo y reproducible de harness de evaluación de cuantización, con métricas y formulación del compromiso calidad-throughput.
- Punto de partida para extender el experimento a la franja 1B-7B: la metodología (reparto por tipo de capa, métricas y hardware de referencia) es directamente trasladable a modelos como Llama 3.2 1B o Qwen2.5 3B.
- Investigación sobre asignación automática de precisión: los resultados sugieren qué capas toleran INT4 y cuáles requieren INT8, lo que alimenta políticas de mixed-precision aprendidas o basadas en sensibilidad por capa.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre NVIDIA T4 (16 GB). `quality_score` es una puntuación normalizada donde 1,0 corresponde a la perplejidad de FP16.

| Modelo | Método de cuantización | Throughput (t/s) | Calidad | Latencia P50 (ms) | VRAM (MB) |
|---|---|---|---|---|---|
| distilgpt2 | fp16_baseline | 35 | 0,95 | 130 | 1000 |
| distilgpt2 | int8_all | 40 | 0,92 | 110 | 600 |
| distilgpt2 | int4_all | 40 | 0,88 | 120 | 500 |
| distilgpt2 | mixed_int8_int4 | 48 | 0,92 | 95 | 700 |
| gpt2-small | mixed_int8_int4 | 42 | 0,91 | 105 | 850 |

Conclusiones declaradas por el autor: la configuración mixta supera a INT4 uniforme en un 20 % de throughput y 4 puntos de calidad; iguala la calidad de INT8 con un 20 % más de velocidad a cambio de 100 MB adicionales de VRAM; y el resto de configuraciones para gpt2-small no se publican en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 500 MB (INT4 uniforme en distilgpt2) y 1000 MB (FP16 en distilgpt2); la configuración mixta requiere 700 MB en distilgpt2 y 850 MB en gpt2-small.
- GPU de referencia del estudio: NVIDIA T4 de 16 GB, con la que se obtuvieron todas las métricas publicadas.
- Cabe holgadamente en cualquier GPU de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 3060 (12 GB), e incluso en GPUs con 2 GB de VRAM. No se han publicado pruebas en A100, H100 ni en aceleradores de otro fabricante.
- Opciones de despliegue: el estudio utiliza PyTorch con bitsandbytes; no se han evaluado vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en formato GGUF.
- Latencia y throughput observados: 35-48 tokens/s y 95-130 ms por token (P50) en T4 con distilgpt2; 42 tokens/s y 105 ms con gpt2-small en configuración mixta. No se documenta el tamaño de lote, por lo que las cifras no son directamente comparables con despliegues batcheados.
- El consumo de VRAM medido es pico durante la inferencia, no el peso en disco del checkpoint.

## Comparativa con modelos similares

La comparación natural es entre las configuraciones del propio banco de pruebas y la referencia industrial que lo inspira.

| Referencia | Ámbito | Escala | Precisión | Throughput relativo | Calidad relativa | Licencia |
|---|---|---|---|---|---|---|
| Tiny-Quant-Cancellation-Bench (este repo) | Benchmark abierto y reproducible | 82M-124M | FP16, INT8, INT4 NF4, mixta | Hasta 48 t/s (T4) | Hasta 0,92 | MIT |
| Baseten Research, "We ran 100s of quantized models..." | Estudio industrial | Cientos de modelos, escala no detallada | Mixta | No disponible | No disponible | No disponible |
| LLM.int8() (bitsandbytes) | Método de cuantización | Cualquiera | INT8 uniforme | 40 t/s en este bench | 0,92 | Uso libre (biblioteca) |
| NF4 4-bit (QLoRA / bitsandbytes) | Método de cuantización | Cualquiera | INT4 uniforme | 40 t/s en este bench | 0,88 | Uso libre (biblioteca) |

No se han identificado en la información proporcionada otros benchmarks abiertos directamente comparables en escala sub-1B para cancelación de errores en precisión mixta.

## Limitaciones y advertencias

- No es un modelo: el repositorio contiene un harness de evaluación y artefactos de resultados, no pesos utilizables para inferencia. No puede cargarse con `AutoModelForCausalLM`.
- Alcance muy reducido: solo dos modelos base (82M y 124M) y una única familia arquitectónica (GPT-2). Los hallazgos no son extrapolables sin verificación a modelos de 1B-70B ni a arquitecturas MoE, SSM o híbridas.
- Un único hardware (NVIDIA T4) y sin repeticiones ni intervalos de confianza documentados. El throughput y la latencia pueden variar sustancialmente en A100, H100 o GPUs de consumo.
- El conjunto de evaluación de calidad combina perplejidad de WikiText-2 con un "tiny held-out generation set" de tamaño no especificado; no hay evaluación en tareas downstream (razonamiento, código, matemáticas), por lo que una puntuación de calidad de 0,92 no garantiza preservación de capacidades.
- Inconsistencia interna en la métrica: se define `quality_score` como normalizada con 1,0 = perplejidad FP16, pero la propia línea base FP16 registra 0,95, lo que sugiere que la normalización se calcula contra otro valor de referencia no explicitado.
- La model card está truncada en la sección teórica ("Quantization error can be modeled as:"), de modo que la justificación formal de la cancelación de errores queda incompleta.
- No se comparan alternativas de cuantización más modernas (GPTQ, AWQ, SmoothQuant) ni se documenta la semilla, la versión de bitsandbytes o los parámetros exactos de generación, lo que dificulta la replicación bit a bit.
- El autor declara la interpretación de los resultados como hipótesis propia ("Our Interpretation"); la cancelación de errores no queda demostrada de forma concluyente con dos modelos y una única métrica de calidad.
- Licencia MIT, permisiva para uso comercial y modificación; cubre los artefactos del repositorio, pero los modelos base subyacentes (GPT-2, distilgpt2) mantienen sus propias licencias.
- Riesgo de alucinación y sesgos: no evaluados en este trabajo; al no haber ajuste por instrucciones ni RLHF, los modelos base reproducen sesgos de sus corpus de entrenamiento (WebText) sin mitigación.
- Cero descargas y una única marca de "me gusta" en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/samudhan2003/Tiny-Quant-Cancellation-Bench
- Perfil del autor: https://huggingface.co/samudhan2003
- Estudio de referencia citado (Baseten Research, "We ran 100s of quantized models to see if quantization errors cancel out", Ali Taha, Philip Kiely et al.): no se proporciona URL en la información disponible
- bitsandbytes (métodos LLM.int8() y NF4): no se proporciona URL en la información disponible
- Paper de LLM.int8() (Dettmers et al.): no se proporciona URL en la información disponible
- Paper de QLoRA / NF4 (Dettmers et al.): no se proporciona URL en la información disponible
- Dataset WikiText-2: no se proporciona URL en la información disponible
- Búsqueda web realizada: no se han encontrado enlaces relevantes al repositorio, al paper de Baseten ni a material técnico relacionado; los resultados devueltos corresponden a un portal de videojuegos sin relación con el tema.
