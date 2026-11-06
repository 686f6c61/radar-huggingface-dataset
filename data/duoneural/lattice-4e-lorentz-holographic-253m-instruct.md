# DuoNeural/Lattice-4E-Lorentz-Holographic-253M-Instruct

## Resumen

Lattice-4E-Lorentz-Holographic-253M-Instruct es un modelo de lenguaje experimental desarrollado por DuoNeural Research Lab, destilado a partir de HuggingFaceTB/SmolLM2-1.7B-Instruct. Se trata de un "Crystallographic Dynamics Model" (CDM) con arquitectura Mixture-of-Experts que sustituye la geometría euclidiana convencional por un hiperboloide de Lorentz (espacio hiperbólico en espacio ambiente de Minkowski). El modelo forma parte de un estudio factorial 2x2 que compara geometrías no euclidianas (Poincaré frente a Lorentz) y distintos modelos profesor.

Su nicho principal es el enrutado de herramientas (tool calling): según los datos publicados por el autor, alcanza un 96,7% de precisión en APIGen, superando a su gemelo Poincaré (93,3%) y acercándose al profesor de 1,71B de parámetros. Con unos 253M de parámetros y una ventana de contexto de solo 512 tokens, no es un modelo de propósito general, sino un experimento de investigación sobre geometrías no euclidianas en modelos de lenguaje, relevante para quien investiga arquitecturas alternativas al transformer euclidiano estándar o necesita un router de herramientas muy ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM-MoE (Crystallographic Dynamics Model Mixture-of-Experts) sobre hiperboloide de Lorentz |
| Parametros totales | 252.884.366 (~253M, sin atar); 292.511.384 según metadatos de safetensors |
| Parametros activos | No disponible (MoE con 4 expertos por capa, pero no se publica el número de expertos activos por token) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y GGUF, sin detallar niveles de cuantización) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un CDM-MoE con 7 capas, dimensión oculta de 768, 12 cabezas de atención, 4 expertos MoE por capa y 8 "slots geométricos" por capa. Su rasgo distintivo es la geometría: en lugar de operar en espacio euclidiano, las representaciones viven en la hoja superior del hiperboloide de Lorentz H_c^d en un espacio ambiente de Minkowski R^(1,d). Según el autor, esta geometría produce bisectores de Voronoi planos en el espacio ambiente, lo que elimina la distorsión radial de las fronteras de decisión y mejora la selección discreta de herramientas frente al disco de Poincaré. Incluye además un mecanismo novedoso denominado "Crystal Telepathy" (W_tele), un acoplamiento de momento cruzado entre capas (matriz K×K) que, según las ablaciones del autor, es estructuralmente indispensable: eliminarlo degrada el tool calling en +0,0155 BPB.

El entrenamiento se realizó por destilación desde SmolLM2-1.7B-Instruct durante 88.500 pasos, alcanzando una validación de 0,7614 BPB (perplejidad aproximada de 9,25). El hardware de entrenamiento fue una única NVIDIA GeForce RTX 5070 Ti de 16 GB. No se publica información sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. Los datos de ablación del autor sugieren que los slots recién diferenciados con rungs armónicos bajos (tau* = 50-110) son los más críticos de la red.

## Capacidades

- Generacion de texto en inglés (pipeline text-generation, formato conversacional)
- Tool calling / function calling: es la capacidad destacada, con 96,7% de precisión de nombre de herramienta y 95,6% de F1 en claves de argumentos según APIGen
- Generacion de JSON estricto: 96,7% de validez estricta de JSON en APIGen
- Razonamiento general limitado: 57,0% en PIQA, 41,0% en ARC-Easy, 26,0% en ARC-Challenge y 37,5% en HellaSwag, muy por debajo del modelo profesor
- No hay evidencia publicada de capacidades de visión, audio, modo de razonamiento extendido ni soporte de agentes multi-paso

## Casos de uso

- Enrutado de herramientas en asistentes ligeros: con un 96,7% de precisión en APIGen, el modelo puede actuar como clasificador/router que decide qué función invocar y con qué argumentos, delegando la generación final a otro sistema.
- Generacion de llamadas a APIs en formato JSON: su 96,7% de validez JSON estricta lo hace adecuado para pipelines que requieren salida estructurada parseable sin postprocesado.
- Investigacion en arquitecturas no euclidianas: sirve como punto de comparación directa con Lattice-4D-Poincaré para estudiar el efecto de la geometría hiperbólica (Lorentz frente a Poincaré) en fronteras de decisión.
- Prototipado en hardware de consumo: con ~253M de parámetros y contexto de 512 tokens, cabe con holgura en GPUs domésticas e incluso en CPUs, útil para pruebas rápidas de function calling.
- Estudios de ablación e interpretabilidad: el autor publica análisis de lesiones causales por slot, lo que lo hace útil como banco de pruebas para investigación en interpretabilidad mecánica.
- Despliegue edge de bajo consumo: su tamaño reducido y formato GGUF permiten ejecutarlo en dispositivos con recursos muy limitados para tareas de selección de herramientas offline.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor y no han sido verificados de forma independiente:

| Benchmark / Metrica | Lattice-4E-Lorentz (253M) | Lattice-4D-Poincare (253M) | SmolLM2-1.7B (profesor) |
|---|---|---|---|
| APIGen Tool Name Accuracy | 96,7% | 93,3% | 100,0% |
| APIGen Argument Key F1 | 95,6% | 92,2% | 100,0% |
| APIGen Strict JSON Valid | 96,7% | 96,7% | 100,0% |
| APIGen Top-1 Agreement | 97,22% | 97,13% | no disponible |
| PIQA (Acc_norm, zero-shot) | 57,0% | 54,0% | 76,0% |
| ARC-Easy (Acc_norm) | 41,0% | 41,5% | 61,5% |
| ARC-Challenge (Acc_norm) | 26,0% | 28,5% | 41,0% |
| HellaSwag (Acc_norm) | 37,5% | 36,0% | 58,5% |
| WikiText-2 Test PPL | 77,61 | 75,74 | 11,80 |
| FineWeb-Edu BPB | 1,2429 | 1,2406 | 0,7841 |
| SmolTalk apigen-80k BPB | 0,1138 | 0,1148 | 0,0177 |
| SmolTalk constraints BPB | 0,4663 | 0,4675 | 0,1917 |

## Requisitos de hardware

- VRAM estimada para inferencia: con ~253-293M de parámetros en fp16, aproximadamente 0,6-0,8 GB; en cuantizaciones GGUF de 4 bits, por debajo de 0,3 GB (estimaciones, no datos oficiales)
- GPU recomendadas: cualquier GPU moderna; el propio entrenamiento se realizó en una única RTX 5070 Ti de 16 GB, por lo que la inferencia es trivial en GPUs de consumo
- Cabe sin problemas en GPUs consumer: RTX 3060, RTX 4060, RTX 4090 e incluso integradas; también es viable en CPU
- Opciones de despliegue: transformers (librería nativa), llama.cpp y Ollama gracias al formato GGUF; compatibilidad con endpoints de Hugging Face (endpoints_compatible). No se menciona soporte verificado para vLLM o TGI
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | APIGen Tool Acc | PIQA | Licencia |
|---|---|---|---|---|---|
| Lattice-4E-Lorentz-Holographic-253M-Instruct | ~253M | 512 | 96,7% | 57,0% | Apache 2.0 |
| Lattice-4D-Holographic (Poincaré) | ~253M | no disponible | 93,3% | 54,0% | no disponible |
| HuggingFaceTB/SmolLM2-1.7B-Instruct (profesor) | 1,71B | no disponible | 100,0% | 76,0% | Apache 2.0 |

Otros modelos pequeños de la misma categoría (por ejemplo, Qwen2.5-0.5B-Instruct o SmolLM2-360M-Instruct) podrían ser alternativas de propósito general, pero no hay datos comparativos publicados: no disponible.

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens, muy por debajo de los estándares actuales; inviable para documentos largos o conversaciones extensas
- Capacidades de razonamiento general muy limitadas: 26,0% en ARC-Challenge y perplejidad de 77,61 en WikiText-2, lo que indica una generación de texto claramente inferior a la de modelos pequeños modernos
- Riesgo de alucinacion: no evaluado públicamente; dada la perplejidad elevada, debe asumirse alto en generación libre
- Sesgos conocidos: no documentados; al destilarse de SmolLM2-1.7B-Instruct, hereda presumiblemente sus sesgos, pero no hay análisis publicado
- Idioma: solo inglés; no apto para castellano ni otros idiomas
- Los benchmarks proceden exclusivamente de la model card del autor y no están verificados por terceros; los resultados de APIGen podrían reflejar sobreajuste a la distribución de evaluación
- Existe una discrepancia entre los parámetros declarados (~253M) y los metadatos de safetensors (292,5M), posiblemente por pesos sin atar adicionales
- Licencia Apache 2.0: sin restricciones para uso comercial
- Proyecto experimental de un laboratorio pequeño con adopción mínima (422 descargas, 0 likes); la madurez, el mantenimiento y la fiabilidad en producción no están garantizados

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/Lattice-4E-Lorentz-Holographic-253M-Instruct
- Modelo profesor: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Codebase: https://github.com/DuoNeural/Lattice-CDM
- Web del laboratorio: https://duoneural.com
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Paper, demo y blog: no disponible
