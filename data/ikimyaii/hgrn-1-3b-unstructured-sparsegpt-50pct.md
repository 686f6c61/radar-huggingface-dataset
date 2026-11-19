# ikimyaii/HGRN-1.3B-unstructured-SparseGPT-50pct

## Resumen

HGRN-1.3B-unstructured-SparseGPT-50pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, desarrollada por el usuario ikimyaii. Se trata de un ejercicio de compresion one-shot (sin reentrenamiento) aplicando SparseGPT, el metodo de poda no estructurada publicado por IST-DASLab, para eliminar el 50% de los pesos de todas las capas lineales internas de los bloques. El resultado es un checkpoint de 1.364.396.032 parametros con safetensors como formato de pesos y un tamano de repositorio de 2,7 GB.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Network), una arquitectura recurrente con compuertas jerarquicas alternativa a los transformers clasicos, entrenada sobre 100.000 millones de tokens segun la nomenclatura del checkpoint original. La poda se aplica como baseline para los modelos EHWS del mismo autor, lo que sugiere que este checkpoint sirve de referencia comparativa en una linea de investigacion sobre esparsidad.

La relevancia practica es limitada pero informativa: demuestra el coste de calidad de una poda agresiva al 50% sin recuperacion, con un aumento de perplejidad de 11,81 a 16,48 en WikiText-2 y una caida de precision zero-shot media de 0,4376 a 0,4130. Es util para quienes estudian tecnicas de compresion, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), basada en capas recurrentes con compuertas jerarquicas |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base HGRN-1.3B-100B emplea una arquitectura de red recurrente con compuertas jerarquicas (HGRN), que sustituye la atencion cuadratica de los transformers por recurrencia lineal con mecanismos de olvido multiescala. Sobre esa base, este checkpoint aplica poda no estructurada one-shot con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt@147d215, variante `fasterprune`, blocksize 128, damping 0.01). Se podan todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos.

El proceso de calibrado uso el loader oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, recalibrando cada bloque sobre las salidas de los bloques ya podados, siguiendo la logica de los drivers oficiales. La caminada de capas es codigo nuevo del autor (los drivers oficiales solo cubren OPT y LLaMA), mientras que la matematica de poda es la oficial. Los pesos se podaron en bfloat16 y el proceso completo tardo 3,6 minutos en una A100 de 40 GB. La mascara usa un unico umbral por bloque de 128 columnas, de modo que cada fila acaba con un numero distinto de valores no nulos.

## Capacidades

- Generacion de texto autoregresiva: hereda la capacidad del modelo base HGRN-1.3B, aunque degradada por la poda.
- Razonamiento basico y respuesta a preguntas: evaluado en arc_challenge, arc_easy, boolq, openbookqa, rte y winogrande con lm-evaluation-harness.
- Comprension lectora y sentido comun: evaluado en hellaswag.
- Modelado de lenguaje: perplejidad medida en WikiText-2 y C4.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Requiere `flash-linear-attention` instalado (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Investigacion sobre poda de redes: sirve como baseline reproducible para comparar metodos de esparsidad, ya que el autor lo presenta explicitamente como referencia frente a sus modelos EHWS.
- Estudio del compromiso calidad-compresion: permite medir empiricamente el coste de una poda al 50% sin recuperacion (perplejidad y precision zero-shot) frente al modelo denso.
- Reproduccion de experimentos SparseGPT: el checkpoint documenta configuracion exacta (blocksize 128, damping 0.01, calibrado C4) para replicar o extender el pipeline.
- Analisis de desbalanceo de mascaras: util para estudiar la distribucion de no nulos por fila (hasta 1,98x la media en la peor capa) y su impacto en kernels dispersos.
- Docencia sobre compresion de modelos: ejemplo concreto de poda one-shot en una arquitectura no transformer, con numeros de tiempo de poda (3,6 min en A100 40 GB) y degradacion medida.
- Pruebas de carga en frameworks alternativos: validacion de integracion de checkpoints HGRN podados con `flash-linear-attention` y `AutoModelForCausalLM`.

## Benchmarks y rendimiento

Perplejidad con protocolo de evaluacion de ELSA (conjuntos WikiText-2 y C4 de test, formula propia, fp16):

| | WikiText-2 | C4 |
|---|---|---|
| Denso | 11,81 | 16,09 |
| Este modelo | 16,48 | 21,05 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2295 |
| arc_easy | 0,5644 | 0,5189 |
| boolq | 0,5758 | 0,5930 |
| hellaswag | 0,3828 | 0,3483 |
| openbookqa | 0,2300 | 0,1980 |
| rte | 0,5379 | 0,5090 |
| winogrande | 0,5288 | 0,4941 |
| Media | 0,4376 | 0,4130 |

Esparsidad de las capas podadas medida sobre estos pesos: 0,5000. Las filas no estan balanceadas: en las 168 capas podadas, la fila mas densa tiene de media 1,49x los no nulos de la fila media, con un maximo de 1,98x en la peor capa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos, mas overhead de activaciones y cache; en la practica cabe en GPUs consumer de 8 GB o mas.
- VRAM estimada en fp16: similar al bfloat16, en torno a 2,7-3 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor uso una A100 40 GB solo para el proceso de poda, no para inferencia.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: `AutoModelForCausalLM` con `flash-linear-attention` instalado; vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (HGRN-1.3B podado 50%) | 1.364.396.032 | no disponible | no disponible | Perplejidad WikiText-2 16,48; media zero-shot 0,4130 |
| fla-hub/hgrn-1.3B-100B (base denso) | no disponible | no disponible | no disponible | Perplejidad WikiText-2 11,81; media zero-shot 0,4376 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Referenciados como comparacion por el autor; sin datos publicados en esta informacion |

## Limitaciones y advertencias

- Degradacion de calidad medible: la poda al 50% sin reentrenamiento eleva la perplejidad en WikiText-2 de 11,81 a 16,48 (+39,5%) y en C4 de 16,09 a 21,05 (+30,8%).
- Caida de precision zero-shot: la media baja de 0,4376 a 0,4130; arc_easy pierde 4,55 puntos y hellaswag 3,45 puntos.
- Mascara desbalanceada: al usar un umbral por bloque de 128 columnas, las filas tienen distinto numero de no nulos (hasta 1,98x la media en la peor capa), lo que complica el aprovechamiento real de la esparsidad con kernels dispersos.
- Sin recuperacion: no hay reentrenamiento ni fine-tuning posterior a la poda, por lo que el dano no se mitiga.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se documenta cobertura linguistica; el calibrado uso C4, mayoritariamente ingles.
- Riesgo de alucinacion: inherente a modelos de lenguaje de este tamano, agravado por la poda; no hay evaluaciones de factualidad publicadas.
- Contexto no documentado: aunque el calibrado uso secuencias de 2.048 tokens, no se confirma la ventana de contexto efectiva del modelo base.
- Ecosistema limitado: requiere `flash-linear-attention` y no esta confirmado el soporte en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- Adopcion nula: 0 descargas y 0 likes en Hugging Face, sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Codigo oficial SparseGPT (IST-DASLab): https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: no disponible enlace directo en la informacion proporcionada
- Paper de SparseGPT: no disponible enlace directo en la informacion proporcionada
- Paper de HGRN: no disponible enlace directo en la informacion proporcionada
