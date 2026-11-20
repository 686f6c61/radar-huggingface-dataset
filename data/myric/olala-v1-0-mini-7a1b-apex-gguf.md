# Myric/Olala-v1.0-mini-7A1B-APEX-GGUF

## Resumen

Olala-v1.0-mini-7A1B-APEX-GGUF es una cuantización GGUF del modelo base OVHaiLLM/Olala-v1.0-mini-7A1B, publicada por el usuario Myric. El modelo base emplea una arquitectura híbrida que combina capas Mamba, mezcla de expertos (MoE) y mecanismos de atención, con un total de 7.000 millones de parámetros y un presupuesto de fichero de aproximadamente 6 GB. La cuantización APEX se ha construido para igualar el tamaño exacto de la variante `q5_k_m` de los autores, de modo que ambas puedan compararse directamente.

El interés de esta ficha reside en la metodología de cuantización: en lugar de aplicar una receta K-quant estándar, el autor redistribuye los bits entre las distintas partes del modelo, sacrificando precisión en los expertos intermedios para reforzar la ruta densa, el experto compartido y los embeddings. El resultado declarado es una reducción del 39 % en la divergencia KL media respecto a BF16 en comparación con la cuantización de referencia, con un incremento de tamaño de solo el 0,6 %.

Es relevante ahora porque demuestra que las arquitecturas MoE híbridas con tensores de formas atípicas (columnas de 384, bloques de 768/256) no encajan bien en los esquemas K-quant convencionales y requieren estrategias de asignación por tensor. La ficha advierte de una limitación crítica: el modelo solo funciona con el fork de llama.cpp de OVH, no con el llama.cpp upstream, Ollama, LM Studio ni vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba + MoE + atención (arquitectura `olala`) |
| Parametros totales | 7.000 millones (7A1B) |
| Parametros activos | no disponible (se activan 6 de 256 expertos enrutados por token) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo del autor; el máximo no se especifica) |
| Tipos de cuantizacion | GGUF con asignación por tensor: Q8_0, Q6_K, Q5_K, Q4_K (fichero APEX-6g de ~6 GB) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, cs, sv, da, fi, no, el, hu, ro, bg, sk, hr, lt, sl, bs, sr, sq, is, et, lv, ca, tr, ru, uk, ar, he, ka, ja, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (derivado de BF16; tamaño BF16 de referencia: 13.594.188.096 bytes) |

## Arquitectura y entrenamiento

El modelo base combina capas Mamba (modelos de espacio de estados), capas de mezcla de expertos y proyecciones de atención en una arquitectura híbrida denominada `olala`. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card del derivado solo describe la estructura de tensores: los expertos enrutados tienen 2.720 millones de parámetros cada uno y el tensor `ffn_up_exps` tiene 384 columnas de ancho, lo que impide codificarlo con bloques K-quant estándar (768/256 o 384/256) y obliga a fijarlo en Q8_0.

La innovación técnica de esta publicación es el esquema de asignación APEX, generado con `allocate.py` contra un objetivo de bytes leído del GGUF de referencia, en orden de prioridad: ruta densa, experto compartido, embeddings, bordes de expertos y expertos intermedios. La cuantización se realiza con una matriz de importancia (`llama-imatrix`) calculada sobre `wiki.train.raw` con 200 chunks de 512 tokens, y se aplica con `llama-quantize` usando un fichero de 989 asignaciones por tensor (`apex-6g.txt`), lo que hace el fichero reproducible. La desviación respecto a la receta de los autores es que su imatrix usa `wiki.test.raw`, mientras que esta usa el split de entrenamiento para mantener el corpus de evaluación sin ver.

## Capacidades

- Generación de texto en 37 idiomas, incluidos español, catalán, euskera no listado, árabe, hebreo, georgiano, japonés, coreano y chino.
- Razonamiento con modo de esfuerzo configurable (`reasoning_effort`: `high`, `medium`, `low`).
- Tool calling y function calling mediante el formato `<toolcalls>` del template, con retorno de `tool_calls` en formato OpenAI cuando se usa `--jinja`.
- Soporte de agentes y razonamiento multi-paso (la model card menciona una suite de 42 tareas de codificación agéntica, aunque no se han publicado resultados).
- Capacidades multilingües amplias, con cobertura de lenguas eslavas, nórdicas, bálticas y del sur de Europa.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- **Atención al cliente multilingüe**: el modelo cubre 37 idiomas y permite conversaciones multi-turno con hasta 32.768 tokens de contexto, adecuado para historiales largos de soporte en mercados europeos y asiáticos.
- **Asistentes con tool calling**: gracias al parser `<toolcalls>` y a la integración con `llama-server`, puede conectarse a APIs externas (calendario, CRM, bases de datos) devolviendo llamadas estructuradas en formato OpenAI.
- **Generación de código en pipelines locales**: el modo de razonamiento configurable y el soporte de plantillas Jinja permiten integrarlo en entornos de CI/CD o asistentes de IDE que requieran ejecución local sin dependencia de la nube.
- **Razonamiento agéntico de varios pasos**: la combinación de MoE con 256 expertos y modo de razonamiento lo hace apto para tareas de planificación y descomposición de problemas, siempre que se valide la calidad en la suite agéntica pendiente.
- **Despliegue en hardware de gama media**: con ~6 GB de fichero GGUF, cabe en GPUs de consumo con 8 GB o más de VRAM, lo que permite prototipado y demos en estaciones de trabajo sin GPU de datacenter.
- **Procesamiento de documentos largos en varios idiomas**: la ventana de 32.768 tokens permite resumir, extraer y clasificar documentos extensos en cualquiera de los idiomas soportados.
- **Investigación en cuantización**: el fichero incluye las 989 asignaciones por tensor, lo que lo convierte en un caso de estudio reproducible para comparar estrategias de cuantización en arquitecturas MoE híbridas.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de calidad de cuantización medidas sobre `wiki.test.raw`, 64 chunks con contexto de 512, en CUDA sobre una GB10:

| Variante | Bytes | PPL | KLD media | KLD mediana | KLD 99,9 % | RMS Δp | Mismo top p |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 13.594.188.096 | 11,586 | — | — | — | — | — |
| `q5_k_m` de los autores | 5.990.551.040 | 11,663 | 0,01713 | 0,00936 | 0,4548 | 3,304 % | 93,54 % |
| **APEX-6g (este fichero)** | 6.028.592.896 | **11,615** | **0,01053** | **0,00458** | 0,4959 | **2,572 %** | **95,53 %** |

No se han publicado resultados de benchmarks de tareas downstream (MMLU, HumanEval, GSM8K) en la información disponible. La suite de 42 tareas agénticas está preparada pero no ejecutada.

## Requisitos de hardware

- **VRAM estimada**: el fichero GGUF ocupa ~6,03 GB; con overhead de contexto y KV cache para 32.768 tokens, se recomienda al menos 8-10 GB de VRAM.
- **GPU recomendadas**: el autor valida en una GB10 (GPU de NVIDIA para estaciones de trabajo). Para el tamaño del modelo, son adecuadas RTX 4090, RTX 4080, RTX 3090, L4 y A10.
- **GPU de consumo**: cabe en tarjetas con 8 GB o más (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), siempre que se ajuste el contexto.
- **Despliegue**: requiere obligatoriamente el fork `OVHai-LLM/llama.cpp`, rama `olala-master`, compilado con `-DGGML_CUDA=ON`. No funciona con llama.cpp upstream, Ollama, LM Studio ni vLLM.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-APEX-GGUF | 7.000 M (MoE híbrido) | 32.768 (config. de ejemplo) | Apache-2.0 | GGUF, solo fork OVH de llama.cpp | Cuantización APEX de ~6 GB |
| Olala-v1.0-mini-7A1B (`q5_k_m`) | 7.000 M (MoE híbrido) | no disponible | Apache-2.0 | GGUF, fork OVH | Referencia de tamaño; KLD media 0,01713 |
| Olala-v1.0-mini-7A1B (BF16) | 7.000 M (MoE híbrido) | no disponible | Apache-2.0 | Pesos BF16 (~13,6 GB) | Referencia de calidad (PPL 11,586) |

No se dispone de datos de otros modelos de la misma categoría (MoE híbridos de ~7.000 M) en la información proporcionada para establecer una comparación cruzada.

## Limitaciones y advertencias

- **Dependencia de un fork no estándar**: el modelo solo se ejecuta con `OVHai-LLM/llama.cpp` rama `olala-master`. No hay soporte en llama.cpp upstream, Ollama, LM Studio ni vLLM, lo que limita su adopción en producción y complica el mantenimiento.
- **Sin validación downstream**: la suite de 42 tareas agénticas no se ha ejecutado; el autor no reclama paridad en tareas downstream. Las métricas publicadas son solo de calidad de cuantización (PPL, KLD, acuerdo top-1).
- **Riesgo de NaN en cuantizaciones K-quant**: el tensor `ffn_up_exps` debe permanecer en Q8_0; una K-quant cae silenciosamente a un tipo 0 cuyas escalas de activación fp16 desbordan los outliers del modelo (~1e14) y producen NaN.
- **Sesgos**: no se documentan sesgos conocidos del modelo base en la información disponible.
- **Alucinación**: no se han publicado evaluaciones de tasa de alucinación; al ser un modelo de 7.000 M, es esperable un riesgo mayor que en modelos de mayor tamaño, pero no hay datos que lo cuantifiquen.
- **Idiomas**: aunque se listan 37 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en lenguas de bajos recursos (p. ej., bs, sq, is, et) puede ser inferior.
- **Licencia**: Apache-2.0 heredada del modelo base; se aplican los avisos y la licencia upstream. Es una obra derivada de Olala-v1.0-mini-7A1B.
- **Caveat de reproducibilidad**: la imatrix se calcula sobre el split de entrenamiento, no sobre el de test como en la receta original, por lo que las cifras son comparables como ficheros, no como recetas.

## Enlaces

- [Hugging Face: Myric/Olala-v1.0-mini-7A1B-APEX-GGUF](https://huggingface.co/Myric/Olala-v1.0-mini-7A1B-APEX-GGUF)
- [Modelo base: OVHaiLLM/Olala-v1.0-mini-7A1B](https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B)
- [Fork de llama.cpp requerido: OVHai-LLM/llama.cpp (rama `olala-master`)](https://github.com/OVHai-LLM/llama.cpp)
