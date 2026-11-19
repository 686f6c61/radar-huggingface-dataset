# ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-90pct

## Resumen

HGRN-1.3B-semi-structured-SparseGPT-90pct es un modelo de lenguaje derivado de fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de poda (pruning) one-shot aplicado sobre los pesos del modelo base sin reentrenamiento posterior, con el objetivo de alcanzar un 90 % de esparsidad semi-estructurada en todas las capas lineales internas de los bloques. El modelo base emplea la arquitectura HGRN (Hierarchically Gated Recurrent Neural Network), una familia de modelos recurrentes lineales implementada en la libreria flash-linear-attention.

La relevancia del modelo es fundamentalmente metodologica: sirve como baseline de referencia para otros modelos del mismo autor (los denominados EHWS) y documenta el impacto de una poda agresiva al 90 % con una variante propia de SparseGPT que impone una restriccion por fila. Los resultados publicados muestran un deterioro severo de la perplejidad (de 11,81 a 77.194,95 en WikiText-2), por lo que no es un modelo apto para uso en produccion, sino una pieza de investigacion sobre compresion de modelos.

El modelo tiene 1.364.396.032 parametros totales segun los pesos en safetensors, un tamano de repositorio de 2,7 GB y se distribuye en formato safetensors. No se especifican licencia, idiomas soportados ni pipeline en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (recurrente lineal con compuertas jerarquicas), segun modelo base fla-hub/hgrn-1.3B-100B |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante la poda; repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,8999 medida sobre los pesos (90 % semi-estructurada) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del modelo base fla-hub/hgrn-1.3B-100B, un transformer recurrente lineal de la familia HGRN implementada en la libreria flash-linear-attention. Sobre esa base, el autor aplica una poda one-shot sin reentrenamiento: todas las capas lineales dentro de los bloques se podan, mientras que los embeddings y la lm_head permanecen densos.

El metodo de poda es una variante propia de SparseGPT implementada sobre el codigo oficial de `fasterprune`, con un unico cambio en la mascara: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de sus entradas de menor magnitud segun la regla `w^2 / [H^-1]_jj^2` (la regla N:M de SparseGPT con M igual al tamano del bloque). El resultado es que cada fila de cada capa podada tiene exactamente el mismo numero de elementos no nulos, lo que garantiza un reparto perfectamente equilibrado del trabajo por fila (verificado en las 168 capas podadas). El calibrado uso el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podan en orden, calibrándose cada uno sobre las salidas de los bloques ya podados. La poda se realizo en bfloat16 y tardo 3,7 minutos en una unica A100 de 40 GB. El recorrido de capas es codigo nuevo del autor, ya que los drivers oficiales solo contemplan OPT y LLaMA; las matematicas de poda son el codigo oficial.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base HGRN-1.3B.
- Razonamiento y conocimiento general, aunque severamente degradados por la poda (ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion.
- No se documentan modos especiales (thinking, vision, audio).
- Requiere `import fla` (flash-linear-attention) instalado y carga mediante `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Baseline de investigacion en compresion de modelos: sirve como referencia cuantitativa para comparar tecnicas de poda (por ejemplo, los modelos EHWS del mismo autor) frente a una variante de SparseGPT con restriccion por fila.
- Estudio de la degradacion por esparsidad: permite analizar como afecta un 90 % de esparsidad semi-estructurada a la perplejidad y a tareas zero-shot en una arquitectura recurrente lineal como HGRN.
- Validacion de kernels de esparsidad: al tener un numero identico de no nulos por fila en las 168 capas podadas, es util para probar implementaciones de computo disperso con carga balanceada.
- Reproducibilidad de pipelines de poda: el autor documenta calibrado, semilla, hardware y tiempo, lo que facilita reproducir el experimento con `fasterprune`.
- Docencia sobre pruning: ejemplo didactico de poda one-shot sin reentrenamiento y de sus consecuencias en modelos de ~1,3B parametros.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna tarea que requiera calidad de salida, dado el colapso de la perplejidad documentado.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 11,81 | 77.194,95 |
| C4 | 16,09 | 70.174,28 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2338 |
| arc_easy | 0,5644 | 0,2677 |
| boolq | 0,5758 | 0,6049 |
| hellaswag | 0,3828 | 0,2593 |
| openbookqa | 0,2300 | 0,1780 |
| rte | 0,5379 | 0,5235 |
| winogrande | 0,5288 | 0,4972 |
| Media | 0,4376 | 0,3663 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.364.396.032 parametros, en bfloat16 requiere aproximadamente 2,7 GB solo para pesos, mas overhead de activaciones y cache.
- GPU recomendadas: no disponibles en la informacion; la poda se realizo en una A100 de 40 GB, pero el modelo es mucho mas pequeno que esa GPU.
- Cabe previsiblemente en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) al ser un modelo de ~1,3B parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: carga via `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-1.3B-semi-structured-SparseGPT-90pct | 1,36B | no disponible | 77.194,95 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (base denso) | ~1,3B | no disponible | 11,81 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos EHWS ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa: la perplejidad en WikiText-2 pasa de 11,81 a 77.194,95, lo que indica que el modelo no genera texto coherente de forma fiable.
- Caida notable en tareas zero-shot: la media baja de 0,4376 a 0,3663, con descensos acusados en arc_easy (0,5644 a 0,2677) y hellaswag (0,3828 a 0,2593).
- No es un modelo para produccion: el autor lo describe explicitamente como baseline para los modelos EHWS.
- Licencia no disponible: no se puede confirmar si permite uso comercial.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni ventana de contexto.
- Sesgos y alucinaciones: no se documentan sesgos especificos, pero la poda agresiva incrementa el riesgo de salidas incoherentes o alucinadas.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`, lo que anade una dependencia tecnica al despliegue.
- Embeddings y lm_head permanecen densos, por lo que el ahorro de memoria no es proporcional al 90 % de esparsidad en las capas internas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Libreria flash-linear-attention (requerida para cargar): no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Repositorio `fasterprune`: no disponible en la informacion proporcionada
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
