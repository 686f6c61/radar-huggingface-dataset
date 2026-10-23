# ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text

## Resumen

ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text es una cuantización de 4 bits del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario ChirayuR, pensada para ejecutarse en Macs con Apple Silicon mediante MLX. ThinkingCap es un ajuste fino de Qwen3.8-27B orientado a reducir el número de tokens de razonamiento necesarios para llegar a la misma respuesta: según las cifras de BottleCap AI, recorta los tokens de pensamiento un 37 % de media manteniendo una precisión media del 85,8 % frente al 86,6 % del modelo base.

El trabajo de ChirayuR consiste en convertir los pesos BF16 originales a cuantización afina de MLX con mezcla de 4, 5 y 8 bits (plan oQ4e de la herramienta oMLX), conservar la cabeza de predicción multi-token (MTP) del modelo original para acelerar la generación mediante decodificación especulativa y eliminar la torre de visión, lo que deja un modelo estrictamente de texto de 27.320.697.856 parámetros y 16,7 GB en disco.

Su relevancia es práctica: demuestra que un modelo de 27 B puede caber y funcionar a velocidad usable (24,2 tok/s en código) en un portátil con 24 GB de memoria unificada, sin GPU dedicada. No obstante, es un proyecto personal no afiliado a BottleCap AI, sin descargas ni validación comunitaria, y con una licencia PolyForm Small Business 1.0.0 que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.8 (etiqueta de arquitectura `qwen3_5`), con cabeza MTP de 1 capa para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27,3 B), incluye pesos de texto y cabeza MTP |
| Parámetros activos | No aplica: no se describe como modelo MoE en la información disponible |
| Longitud de contexto | No disponible (no medida para esta release). La build anterior solo-texto aceptó prompts de hasta ~51.900 tokens en un Mac de 24 GB |
| Tipos de cuantización | MLX affine, tamaño de grupo 64, mezcla 4/5/8 bits (oQ4e): 4 bits por defecto, 166 tensores sensibles a 5 bits, embeddings de tokens a 8 bits, nada por debajo de 4 bits; ~4,9 bits por peso |
| Idiomas soportados | No disponibles (el conjunto de calibración de oQ se describe como «code/multilingual») |
| Licencia | PolyForm Small Business 1.0.0 (con Required Notice: Copyright 2026 BottleCap AI) |
| Formato de pesos | safetensors en formato MLX (repo de 16,7 GB) |
| Modalidad | Solo texto (torre de visión eliminada) |
| Modelo base | bottlecapai/ThinkingCap-Qwen3.8-27B, revisión `7891e03` |
| Librería / runtime | `mlx` (probado con oMLX 0.7.2) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen3.8 con 27,3 B de parámetros, al que ThinkingCap añade (o conserva) una cabeza de predicción multi-token de 1 capa. Esa cabeza MTP es la que habilita la decodificación especulativa: el modelo propone varios tokens por paso y un verificador los valida, lo que aumenta el throughput efectivo. En esta release la cabeza se cuantiza junto con el resto del modelo, salvo sus pequeñas capas de conexión, que se mantienen en precisión completa.

No se describe en la información disponible el proceso de entrenamiento original de ThinkingCap (número de tokens, composición del dataset, uso de RLHF o DPO); lo que sí se documenta es el proceso de cuantización. Se tomó el checkpoint BF16 y se aplicó oQ nivel 4 de oMLX 0.7.2: se recogió una matriz de importancia a partir de 128 muestras de 512 tokens sobre una copia temporal en 4 bits del propio modelo, y se usó para redondeo ponderado por importancia con un refit por mínimos cuadrados sobre 503 tensores, excluyendo `lm_head`. Como la medición de sensibilidad por capa no cabe en memoria para un modelo de 27 B en un Mac de 24 GB, el plan de bits se derivó de un checkpoint cuantizado de otro ajuste fino del mismo base (Swift-1.5-Qwen3.8-27b en oQ3), del que solo se hereda la asignación de bits, no pesos. Finalmente se fusionaron dos planes de bits (build con y sin visión) tomando el mayor ancho de bits por tensor, y se eliminó la torre de visión: los 1.876 tensores de lenguaje y MTP son idénticos byte a byte a los de la release con visión.

## Capacidades

- Generación de texto y razonamiento en modo «thinking», con niveles de esfuerzo configurables (la model card cita «thinking on at medium effort» y mediciones con «thinking off»).
- Generación de código: 96,3 % en HumanEval (80 problemas) en la build previa de esta misma cuantización.
- Razonamiento matemático: 92,0 % en GSM8K (150 problemas) en la build previa.
- Conocimiento general: 79,7 % en MMLU (300 preguntas) en esta release.
- Razonamiento con presupuesto reducido de tokens: el ajuste de ThinkingCap recorta los tokens de pensamiento entre un 11 % y un 66 % según el benchmark.
- Decodificación especulativa mediante cabeza MTP propia, conservada y cuantizada.
- Conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Sin capacidades de visión en esta release (la torre se elimina explícitamente).
- Soporte de tool calling / function calling: no documentado en la información disponible; el modelo base Qwen3.8 lo soporta habitualmente, pero esta ficha no puede confirmarlo para este artefacto.

## Casos de uso

- Asistencia de código en local sobre Mac: con 24,2 tok/s en generación de código y 96,3 % en HumanEval, sirve para autocompletado, explicación de funciones y refactorizaciones dentro del editor, sin enviar código a la nube.
- Agentes multi-paso con presupuesto de tokens ajustado: la reducción de tokens de pensamiento (4.584 → 3.168 tokens por tarea en τ²-bench según BottleCap) se traduce, a 24 tok/s, en aproximadamente un minuto menos por tarea agéntica, relevante cuando el coste es latencia local.
- Procesamiento de documentos largos en el portátil: la build anterior aceptó prompts de ~51.900 tokens en un Mac de 24 GB, suficiente para contratos, informes o varios ficheros de código concatenados en una sola pasada.
- Razonamiento matemático y resolución de problemas con verificación: 92,0 % en GSM8K con muestras pequeñas, útil para prototipos de tutores o asistentes de cálculo donde se quiere evitar depender de API.
- Redacción y generación de prosa offline: 17,4 tok/s en prosa permiten borradores, resúmenes y reescritura en un equipo sin conexión, con 17,6 GB de memoria ocupada.
- Investigación sobre cuantización y decodificación especulativa: el repo documenta el plan de bits, la matriz de importancia y el impacto en precisión, por lo que sirve como caso de estudio reproducible de oQ4e con MTP frente a GGUF IQ4_XS.
- Evaluación comparativa de ajustes finos de Qwen3.8-27B: al compartir tokenizador y plantilla de chat con el base, permite comparar ThinkingCap, sabi-noema y Swift-1.5 bajo el mismo runtime y la misma suite.

## Benchmarks y rendimiento

Precisión según la suite integrada de oMLX, con thinking desactivado y muestreo determinista, en un MacBook Pro M5 de 24 GB:

| Modelo | MMLU (300) | GSM8K (150) | HumanEval (80) |
|---|---|---|---|
| Esta release (oQ4e + MTP, texto) | 79,7 % | no ejecutado | no ejecutado |
| Build anterior de esta cuantización (texto, antes de fusionar el plan de bits) | 78,7 % | 92,0 % | 96,3 % |
| sabi-noema (ajuste fino de Qwen3.8-27B), oQ4e + MTP | 79,0 % | 90,7 % | 97,5 % |
| Swift-1.5-Qwen3.8-27b, oQ3 + MTP | 76,7 % | 90,0 % | 91,2 % |

Velocidad medida en MacBook Pro M5 de 24 GB con oMLX 0.7.2, MTP activado y caché KV TurboQuant de 4 bits:

| Métrica | Valor |
|---|---|
| Generación de código | 24,2 tok/s |
| Generación de prosa | 17,4 tok/s |
| Procesamiento de prompt (16k tokens) | 213 tok/s |
| Memoria durante la carga | ~17,6 GB |

Comprobación adicional del autor sobre HumanEval, problemas 132-163, con thinking a esfuerzo medio y los GGUF IQ4_XS oficiales en llama.cpp: ThinkingCap resolvió los mismos 31 de 32 problemas que Qwen3.8-27B base con un 11 % menos de tokens (751 frente a 840 por problema) y terminó el conjunto un 10 % más rápido (23,1 frente a 25,8 minutos). El autor advierte que las muestras son pequeñas y que deben interpretarse como verificación de que la cuantización funciona, no como una tabla de leaderboard.

## Requisitos de hardware

- Memoria: ~17,6 GB durante la carga con MTP y caché KV TurboQuant de 4 bits; 16,7 GB de pesos en disco.
- Hardware validado: MacBook Pro con chip M5 y 24 GB de memoria unificada, con `iogpu.wired_limit_mb=21500`.
- Solo Apple Silicon: los pesos están en formato MLX y requieren MLX u oMLX 0.7.2; no son cargables directamente en vLLM, TGI ni llama.cpp.
- Para GPU NVIDIA o despliegue en servidor, la ruta documentada sería usar los GGUF IQ4_XS del modelo base ThinkingCap en llama.cpp; no hay cifras de VRAM ni throughput para esas plataformas en la información disponible.
- Contexto: en el Mac de 24 GB de prueba, cada GB adicional de memoria equivale a unos 10.000 tokens de contexto. Esta release necesita ~0,4 GB más que la build anterior (17,1 GB), por lo que el margen de contexto baja en consecuencia.
- En Macs de 24 GB con el límite de memoria GPU por defecto queda poco espacio para contexto; el autor recomienda ajustar el límite.
- Throughput: 24,2 tok/s (código), 17,4 tok/s (prosa), 213 tok/s de prefill con prompt de 16k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (300) | HumanEval (80) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B oQ4e + MTP (texto) | 27,3 B | no disponible | 79,7 % | no ejecutado | PolyForm Small Business 1.0.0 | MLX, 16,7 GB |
| ThinkingCap-Qwen3.8-27B oQ4e + MTP (con visión) | 27,3 B | no disponible | no disponible | no disponible | PolyForm Small Business 1.0.0 | MLX, 0,9 GB más |
| sabi-noema (Qwen3.8-27B), oQ4e + MTP | ~27 B | no disponible | 79,0 % | 97,5 % | no disponible | MLX |
| Swift-1.5-Qwen3.8-27b, oQ3 + MTP | ~27 B | no disponible | 76,7 % | 91,2 % | no disponible | MLX |
| bottlecapai/ThinkingCap-Qwen3.8-27B (BF16) | ~27 B | no disponible | no disponible | no disponible | PolyForm Small Business 1.0.0 | safetensors BF16; GGUF IQ4_XS oficial disponible |

Diferencias relevantes: frente a Swift-1.5 en oQ3, esta release gana 3 puntos de MMLU a costa de más bits por peso (4,9 de media frente a una cuantización de 3 bits). Frente a sabi-noema en el mismo esquema oQ4e + MTP, la diferencia en MMLU es de 0,7 puntos con muestras de 300 preguntas, es decir, dentro del ruido esperable.

## Limitaciones y advertencias

- Cuantización de 4 bits: la propia model card indica que la build anterior, con menos tensores a 5 bits y embeddings a 4 bits, obtenía 78,7 % en MMLU frente al 79,7 % de esta release; existe una pérdida medible frente al BF16 original, aunque no cuantificada en MMLU en la información disponible.
- Sin visión: la torre se elimina deliberadamente. Para tareas multimodales hay que usar la release con visión.
- Contexto no medido para esta release: la cifra de ~51.900 tokens corresponde a una build anterior con menor uso de memoria; en 24 GB el margen real es reducido y depende del límite de memoria GPU configurado.
- Idiomas no documentados: no hay lista oficial de lenguas soportadas; la única referencia es que el conjunto de calibración de oQ es «code/multilingual».
- Licencia restrictiva: PolyForm Small Business 1.0.0 limita el uso comercial según el tamaño de la empresa; además incorpora un Required Notice de copyright de BottleCap AI que debe conservarse. Es imprescindible revisar el fichero LICENSE antes de cualquier despliegue en producción.
- El autor declara que se trata de un proyecto personal y no comercial, no afiliado a BottleCap AI, por lo que no hay soporte ni garantías por parte del creador del modelo base.
- Validación muy limitada: 0 descargas y 0 «likes» en el momento de la ficha, benchmarks con muestras de 300, 150 y 80 preguntas, y GSM8K/HumanEval no ejecutados sobre esta release concreta.
- El plan de bits se derivó de la sensibilidad medida en un checkpoint de otro ajuste fino (Swift-1.5-Qwen3.8-27b), no del propio ThinkingCap, por limitaciones de memoria en el proceso de cuantización.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para este artefacto; aplican los riesgos habituales de un LLM de 27 B cuantizado.
- Soporte de tool calling no verificado: la model card no lo documenta, por lo que no debe asumirse en pipelines de agentes sin probarlo previamente.
- Dependencia de ecosistema: al requerir MLX/oMLX, el modelo queda fuera de las pilas de despliegue estándar (vLLM, TGI) y de la portabilidad a GPU NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text
- Release con visión (mismos pesos más torre visual): https://huggingface.co/ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Sitio del autor del modelo base: https://bottlecapai.com
- Fichero de licencia: LICENSE (incluido en el repositorio)
- Papers y blogs técnicos adicionales: no disponibles en la información proporcionada.
