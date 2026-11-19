# ikimyaii/HGRN-1.3B-semi-structured-Wanda-70pct

## Resumen

HGRN-1.3B-semi-structured-Wanda-70pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, un transformer con capas HGRN (Hierarchically Gated Recurrent Network, una arquitectura de atención lineal de la familia Flash Linear Attention). El autor, ikimyaii, ha aplicado una poda one-shot sin reentrenamiento posterior mediante el algoritmo Wanda oficial (locuslab/wanda@8e8fc87, rama unstructured, `use_variant=False`) para alcanzar una esparsidad semi-estructurada del 70 % en todas las capas lineales internas de los bloques.

El modelo tiene 1.364.396.032 parámetros totales según los pesos en safetensors, pero tras la poda solo aproximadamente el 30 % de los pesos de las capas lineales internas permanecen no nulos (esparsidad medida de 0,6998). Las embeddings y la lm_head se mantienen densas. El objetivo declarado es servir como baseline para los modelos EHWS del mismo autor.

La relevancia de esta ficha es doble: por un lado documenta un experimento de compresión extrema sobre una arquitectura de atención lineal poco común; por otro, los resultados publicados muestran un deterioro severo de perplejidad (de 11,81 a 146,72 en WikiText-2), lo que convierte al modelo en una referencia útil sobre los límites de la poda one-shot al 70 % sin recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas HGRN (atención lineal, Flash Linear Attention) |
| Parametros totales | 1.364.396.032 |
| Parametros activos | No aplica (modelo denso podado, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70 % semi-estructurada por fila (0,6998 medida) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Tamano del repo | 2,7 GB |
| Dependencia de carga | `flash-linear-attention` (`import fla`) |

## Arquitectura y entrenamiento

El modelo base emplea capas HGRN, un mecanismo de recurrencia con compuertas jerárquicas que sustituye la atención cuadrática por una atención lineal, dentro del ecosistema Flash Linear Attention. El sufijo "100B" del modelo base sugiere un entrenamiento sobre aproximadamente 100.000 millones de tokens, aunque la información proporcionada no detalla la composición del dataset ni si hubo fases de RLHF o DPO.

La poda se realizó en una sola pasada (one-shot) sin reentrenamiento. El procedimiento sigue el código oficial de Wanda: para cada fila se eliminan los pesos con menor puntuación `|W| * sqrt(||X||)`, calculada a partir de las activaciones de calibración. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, recalibrando cada bloque sobre las salidas de los bloques ya podados, replicando el comportamiento de los drivers oficiales. El recorrido de capas es código nuevo del autor (los drivers oficiales solo cubren OPT y LLaMA), mientras que la matemática de poda es la del repositorio oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 1,6 minutos en una A100 de 40 GB. Se podaron todas las capas lineales internas de los bloques (168 capas verificadas), manteniendo embeddings y lm_head densas. Cada fila de cada capa podada conserva exactamente el mismo número de valores no nulos, lo que garantiza un balanceo perfecto del trabajo por fila.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM`, condicionada a la instalación de `flash-linear-attention`.
- Razonamiento y respuesta a preguntas en inglés, según las tareas de lm-evaluation-harness evaluadas (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Capacidad de servir como baseline cuantitativo para experimentos de poda y esparsidad sobre arquitecturas de atención lineal.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; las evaluaciones publicadas son exclusivamente en inglés.

## Casos de uso

- Baseline de investigación en compresión de modelos: sirve para medir la degradación de un transformer de atención lineal al aplicar poda Wanda al 70 % sin recuperación, comparando directamente con los modelos EHWS del mismo autor.
- Estudio de la robustez de arquitecturas HGRN frente a la poda: permite analizar qué tareas (boolq, rte) retienen mejor su precisión relativa tras la poda frente a otras (arc_easy, openbookqa).
- Referencia para pipelines de poda one-shot: el procedimiento documentado (calibración con C4, poda por bloques en orden, bfloat16, A100 40 GB, 1,6 minutos) es reproducible y sirve para validar implementaciones propias.
- Análisis de balanceo de carga en kernels dispersos: dado que todas las filas tienen el mismo número de no nulos, el modelo es útil para probar kernels de sparsity semi-estructurada con reparto uniforme de trabajo.
- Docencia y divulgación sobre esparsidad: los datos de perplejidad y zero-shot publicados ilustran de forma concreta el coste de podar sin reentrenamiento.
- No es adecuado para despliegue en producción orientado a usuario final: la perplejidad de 146,72 en WikiText-2 y la caída de precisión media de 0,4376 a 0,3599 lo desaconsejan para tareas generativas reales.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 11,81 | 146,72 |
| C4 (perplejidad) | 16,09 | 147,24 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1843 |
| arc_easy | 0,5644 | 0,3131 |
| boolq | 0,5758 | 0,5875 |
| hellaswag | 0,3828 | 0,2736 |
| openbookqa | 0,2300 | 0,1280 |
| rte | 0,5379 | 0,5271 |
| winogrande | 0,5288 | 0,5059 |
| Media | 0,4376 | 0,3599 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,7 GB solo para pesos, más overhead de activaciones y del runtime de `flash-linear-attention`; con contexto largo la huella crece de forma proporcional.
- El modelo cabe holgadamente en GPUs de consumo: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso tarjetas de 8 GB en bfloat16 o fp16.
- GPU recomendadas para investigación a escala: A100 40 GB (la usada para la poda) y H100 para barridos de evaluación en paralelo.
- Despliegue: la carga requiere `flash-linear-attention` instalado e `import fla`; `AutoModelForCausalLM.from_pretrained` es la vía documentada. No hay evidencia en la información disponible de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El modelo base es de atención lineal, lo que en teoría reduce el coste por token en contextos largos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-1.3B-semi-structured-Wanda-70pct (este) | 1.364.396.032 (70 % podado) | No disponible | 146,72 | No disponible | Hugging Face, 0 descargas |
| fla-hub/hgrn-1.3B-100B (base denso) | 1.364.396.032 | No disponible | 11,81 | No disponible | Hugging Face |
| Modelos EHWS del mismo autor | No disponible | No disponible | No disponible | No disponible | Hugging Face (referenciados como comparación) |

La comparación principal es contra el modelo base denso, del que se derivan todas las métricas de referencia. No se dispone de datos de otros modelos comparables de la misma categoría (atención lineal podada) en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 12 (11,81 a 146,72) y la precisión media zero-shot cae 7,77 puntos absolutos (0,4376 a 0,3599). No es apto para generación de texto de calidad en producción.
- Caídas especialmente acusadas en arc_easy (0,5644 a 0,3131) y openbookqa (0,2300 a 0,1280), lo que sugiere pérdida de conocimiento factual y razonamiento básico.
- La poda es one-shot sin reentrenamiento; no se ha aplicado destilación ni recuperación, por lo que el modelo no representa el techo de calidad alcanzable con esta esparsidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución. Verificar la licencia del modelo base antes de cualquier uso.
- Idiomas no declarados; todas las evaluaciones son en inglés, por lo que el comportamiento en castellano es desconocido.
- Longitud de contexto no documentada.
- Riesgo de alucinación elevado por la degradación de los pesos; no se han publicado evaluaciones de factualidad.
- Sesgos: no se han publicado análisis de sesgo; los sesgos del corpus de entrenamiento del modelo base (no documentado) persisten y pueden amplificarse con la poda.
- El repositorio registra 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La carga depende de `flash-linear-attention`; sin esa dependencia el modelo no se instancia correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Código oficial de Wanda: locuslab/wanda, commit 8e8fc87 (rama unstructured)
- Flash Linear Attention: https://github.com/fla-org/flash-linear-attention
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
