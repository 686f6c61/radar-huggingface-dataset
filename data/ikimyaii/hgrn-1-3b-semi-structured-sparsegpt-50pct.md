# ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-50pct

## Resumen

HGRN-1.3B-semi-structured-SparseGPT-50pct es un modelo derivado del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de una versión podada una sola vez (one-shot, sin reentrenamiento) al 50% de dispersión semi-estructurada mediante una variante de SparseGPT con una restricción por fila. El modelo no es un modelo entrenado desde cero, sino un checkpoint de investigación orientado a estudiar técnicas de compresión y poda en arquitecturas lineales.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Network), una arquitectura de tipo linear attention implementada en la librería flash-linear-attention (FLA). Con 1.364.396.032 parámetros totales, el checkpoint resultante ocupa 2.7 GB en el repositorio y conserva las capas de embeddings y lm_head densas, mientras que todas las capas lineales dentro de los bloques están podadas.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como baseline para otros modelos del mismo autor (los denominados EHWS) y documenta el impacto de la poda semi-estructurada al 50% sobre la perplejidad y el rendimiento zero-shot de un modelo de 1.3B. No se trata de un modelo pensado para producción, sino de un artefacto de investigación con métricas publicadas de perplejidad y evaluación zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), linear attention, implementada en flash-linear-attention (FLA) |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrena con secuencias de 2.048 tokens según el protocolo de calibración; contexto máximo no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B emplea una arquitectura HGRN, un tipo de red recurrente con compuertas jerárquicas que se encuadra dentro de las alternativas de atención lineal. La implementación depende de la librería flash-linear-attention (`import fla`), por lo que su carga requiere tener instalado dicho paquete junto con `AutoModelForCausalLM.from_pretrained(...)`. El sufijo "100B" del modelo base sugiere un entrenamiento sobre 100.000 millones de tokens, aunque este dato no se detalla en la información disponible.

El proceso de poda aplicado es una variante de SparseGPT con restricción por fila. Se utiliza el código oficial de `fasterprune` con una modificación en la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor magnitud según la métrica `w^2 / [H^-1]_jj^2` (la regla N:M propia de SparseGPT con M igual al tamaño del bloque). El resultado es que cada fila termina con el mismo número de elementos no nulos, replicando la restricción de los modelos EHWS del mismo autor. La calibración se realizó con el cargador oficial sobre 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tomó 3,6 minutos en una A100 de 40 GB. La dispersión medida sobre los pesos finales es de 0,5000 en las 168 capas podadas, con equilibrio perfecto de trabajo por fila.

## Capacidades

- Generación de texto autoregresiva mediante la arquitectura HGRN del modelo base.
- Razonamiento y respuesta a preguntas zero-shot, evaluado en tareas como arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Modelado de lenguaje y cálculo de perplejidad sobre WikiText-2 y C4.
- Capacidad de ejecución con dispersión semi-estructurada al 50%, lo que permite, en principio, aprovechar kernels dispersos o hardware que soporte el patrón resultante.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües específicas.
- No se documentan capacidades especiales más allá de la propia poda y su evaluación.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como baseline reproducible para comparar técnicas de poda (SparseGPT estándar frente a variantes con restricción por fila) sobre arquitecturas lineales como HGRN.
- Estudio de la degradación por poda: con métricas publicadas de perplejidad (11,81 a 16,83 en WikiText-2 y 16,09 a 21,32 en C4) y de precisión zero-shot (0,4376 a 0,4196 de media), permite cuantificar el coste de comprimir al 50% sin reentrenamiento.
- Benchmarking de kernels dispersos: al garantizar el mismo número de no nulos por fila en las 168 capas podadas, es adecuado para validar implementaciones de inferencia que exploten equilibrio de carga por fila.
- Evaluación de arquitecturas de atención lineal: permite estudiar cómo se comporta HGRN bajo regímenes de dispersión semi-estructurada, un área menos explorada que en transformers densos.
- Reproducción de experimentos: el protocolo de calibración (128 secuencias de C4 de 2.048 tokens, semilla 0) y el tiempo de poda (3,6 minutos en A100 40 GB) están documentados, lo que facilita replicar el pipeline.
- Docencia y formación: como ejemplo didáctico de poda one-shot con SparseGPT y de evaluación con lm-evaluation-harness y el protocolo de ELSA.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (50% sparsity) | 16,83 | 21,32 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2355 |
| arc_easy | 0,5644 | 0,5269 |
| boolq | 0,5758 | 0,5920 |
| hellaswag | 0,3828 | 0,3462 |
| openbookqa | 0,2300 | 0,2040 |
| rte | 0,5379 | 0,5235 |
| winogrande | 0,5288 | 0,5091 |
| Media | 0,4376 | 0,4196 |

Dispersión medida sobre los pesos finales: 0,5000 en las 168 capas podadas, con el mismo número de no nulos por fila en todas ellas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos, más overhead de activaciones y caché; el repositorio ocupa 2,7 GB.
- GPU recomendadas: el proceso de poda se ejecutó en una A100 de 40 GB, pero la inferencia del checkpoint de 1,3B es viable en GPUs consumer.
- Cabe en GPUs consumer: sí, por tamaño de pesos (1,3B en bf16 ≈ 2,7 GB), aunque no se documentan pruebas concretas en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: la model card indica cargar con `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B SparseGPT 50%) | 1.364.396.032 | no disponible | 50% semi-estructurada | no disponible | Hugging Face (ikimyaii) |
| fla-hub/hgrn-1.3B-100B (base denso) | no disponible en la información | no disponible | 0% | no disponible | Hugging Face (fla-hub) |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (ikimyaii) |

No se dispone de información suficiente para comparar con alternativas de otros autores en la misma categoría (modelos HGRN podados o modelos de 1,3B con dispersión semi-estructurada). Los datos de benchmarks del modelo base denso se incluyen en la sección anterior y permiten la comparación directa con este checkpoint.

## Limitaciones y advertencias

- La poda se realizó sin reentrenamiento (one-shot), lo que provoca una degradación notable de la perplejidad: de 11,81 a 16,83 en WikiText-2 y de 16,09 a 21,32 en C4.
- La precisión zero-shot media cae de 0,4376 a 0,4196; tareas como hellaswag (0,3828 a 0,3462), arc_easy (0,5644 a 0,5269) y openbookqa (0,2300 a 0,2040) muestran descensos claros.
- No es la implementación publicada de SparseGPT: es una variante con restricción por fila, por lo que los resultados no deben atribuirse al método original.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial; debe consultarse con el autor antes de cualquier uso en producción.
- No se documentan idiomas soportados ni sesgos conocidos; el modelo base se calibra sobre C4, un corpus predominantemente en inglés.
- No hay información sobre tool calling, agentes, visión ni otras capacidades, por lo que no debe asumirse su disponibilidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-19; es un artefacto de investigación sin validación comunitaria.
- El contexto máximo no está documentado; el protocolo de calibración usa secuencias de 2.048 tokens, lo que no garantiza soporte de ventanas mayores.
- El despliegue requiere la librería flash-linear-attention, lo que limita la compatibilidad con stacks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention (FLA): no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
- Protocolo de evaluación de ELSA: no disponible en la información proporcionada
- lm-evaluation-harness: no disponible en la información proporcionada
