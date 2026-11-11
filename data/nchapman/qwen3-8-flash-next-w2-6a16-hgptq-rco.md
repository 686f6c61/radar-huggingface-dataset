# nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO es una cuantización mixta de 2 y 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario nchapman bajo licencia Apache 2.0. Se trata de un checkpoint orientado a inferencia eficiente que combina GPTQ con rotaciones de Hadamard y optimización restringida riemanniana (Riemannian Constrained Optimization, RCO) para reducir el peso del modelo original en BF16 (335,28 GiB) hasta 71,75 GiB totales, un factor de compresión de 4,67×.

El modelo base es un transformer híbrido con arquitectura MoE de 48 capas que combina atención indexada QSA con capas GatedDeltaNet, e incorpora un cabezal de decodificación especulativa nativo (Native MTP), una torre de visión y una tabla de embeddings por capa (PLE) de 51.200 millones de parámetros. El checkpoint cuantizado conserva el tronco MoE, el MTP y la visión en 44,93 GiB, lo que permite ejecutarlo en una única GPU de 48 GB si se mapea la tabla PLE de 26,82 GiB en RAM del sistema, o completamente en VRAM en una GPU de 80 GB.

La relevancia de esta ficha radica en que demuestra una receta de cuantización extrema (2,50 bits por peso en los expertos enrutados) con pérdida de fidelidad medida y acotada frente al modelo BF16, lo que habilita el despliegue de un modelo de 135.000 millones de parámetros en hardware de una sola GPU. El pipeline declarado es image-text-to-text, e incluye soporte para vLLM y compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con capas GatedDeltaNet + QSA-Indexed-Attention, Native MTP y torre de visión |
| Parametros totales | 135.337.199.507 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W2.6A16 mixto (expertos enrutados en W2_g64 y W4_g64), W4_g64 (atención, shared experts, MTP, visión), W8_g64 (lm_head), Custom-LUT4 (PLE capa 1) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de transformer híbrido con 48 capas que alterna proyecciones de atención indexada QSA y capas GatedDeltaNet, organizadas en un tronco MoE. Incluye 73.728 lineales de expertos enrutados, 144 proyecciones de shared experts, 156 proyecciones de atención y GDN, un cabezal de decodificación especulativa nativo (Native MTP) con 1.543 lineales, una torre de visión con 110 lineales y una tabla de embeddings por capa (PLE) de 51.200 millones de parámetros. El checkpoint cuantizado no documenta el volumen ni la composición de los datos de entrenamiento originales, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la información disponible.

La innovación técnica principal de esta publicación es la receta de cuantización HGPTQ-RCO. Se asignan anchos de bits distintos por sensibilidad: las 12 capas de expertos enrutados con mayor sensibilidad KL (6.144 expertos) se mantienen en W4_g64, mientras que las 36 capas restantes (18.432 expertos) se cuantizan a W2_g64 con GPTQ simétrico de 2 bits con rotación de Hadamard y descenso de coordenadas hessiano en dos pasadas. La atención, los shared experts, el MTP y la visión permanecen en W4_g64; el lm_head se cuantiza a W8_g64 y la PLE de capa 1 a Custom-LUT4 de 4 bits con compensación MMSE de W_kv. El ajuste final incluye QAT con maestros en FP32 para Norm, GDN, HC y PLE, y una búsqueda de escala MSE. La selección de capas sensibles se resuelve mediante sensibilidad KL end-to-end leave-one-out.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con pipeline declarado image-text-to-text.
- Procesamiento de imagen y texto: la torre de visión se conserva en W4_g64 y mantiene una similitud coseno de 0,9906 frente al BF16 en tareas de VQA, gráficos, documentos y OCR.
- Decodificación especulativa nativa mediante el cabezal MTP, con un 95,41% de acuerdo top-1 aislado y un 81,55% end-to-end frente al BF16.
- Capacidades matemáticas, de ciencia e instruction-following, con divergencias KL medidas de 0,0679, 0,0829 y 0,0803 respectivamente en el conjunto de evaluación.
- Soporte multilingüe: el holdout general y multilingüe reporta una perplejidad de 23,3233, aunque no se detalla la lista de idiomas.
- Compatibilidad con vLLM y compressed-tensors para despliegue en producción.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en una única GPU de 48 GB: el tronco MoE, el MTP y la visión ocupan 44,93 GiB, de modo que mapeando la tabla PLE de 26,82 GiB en RAM del sistema se puede servir el modelo completo en una GPU consumer de gama alta o profesional de 48 GB, algo inviable con el checkpoint BF16 de 335,28 GiB.
- Inferencia en una GPU de 80 GB con todo en VRAM: los 71,75 GiB totales dejan unos 7,5 GiB de margen para caché KV y buffers, lo que permite servir el modelo con vLLM en una A100 80 GB o H100 80 GB sin descarga de pesos a host.
- Análisis de documentos y OCR: la torre de visión conserva un 99,26% de acuerdo top-1 en el conjunto UI/ScreenSpot y Math OCR, por lo que es adecuada para pipelines de extracción de texto, interpretación de gráficos y lectura de capturas de pantalla.
- Asistencia conversacional con contexto largo: el modelo mantiene una perplejidad de 3,3931 en 378 prompts y 852.000 tokens, con una divergencia KL de 0,0780 en chat, lo que lo hace apto para atención al cliente multi-turno siempre que se valide la longitud de contexto efectiva del modelo base.
- Generación de código y matemáticas en producción: las divergencias KL de 0,0679 en matemáticas y 0,0803 en instruction-following indican una degradación acotada frente al BF16, suficiente para asistentes de programación donde el coste por token es crítico.
- Decodificación especulativa en servidores de inferencia: el cabezal MTP cuantizado conserva un 95,41% de acuerdo top-1 aislado, por lo que puede actuar como drafter en pipelines de decodificación especulativa con vLLM para acelerar la generación.
- Investigación en cuantización extrema: la publicación incluye métricas detalladas de KL, perplejidad y acuerdo top-1 por componente, lo que la convierte en una referencia para estudiar el impacto de 2 bits en expertos enrutados de MoE.

## Benchmarks y rendimiento

| Evaluacion | BF16 base | W4A16-HGPTQ (4,00 bpw) | W2.6A16-HGPTQ-RCO (2,50 bpw) |
|---|---:|---:|---:|
| Tamano total safetensors | 335,28 GiB | 92,84 GiB | 71,75 GiB |
| Tronco + MTP + Vision (sin PLE) | 239,91 GiB | 66,02 GiB | 44,93 GiB |
| Perplejidad de texto (378 prompts, 852k tokens) | 3,6085 | 3,5683 (−1,11%) | 3,3931 (−5,97%) |
| Divergencia KL ponderada / media por token | 0,0000 | 0,0421 / 0,0798 | 0,1396 / 0,1695 |
| Perplejidad holdout general y multilingue (76 prompts, 23k tokens) | 24,2483 | 22,8992 (−5,56%) | 23,3233 (−3,81%) |
| MTP top-1 aislado (12.339 posiciones) | 100,0% | 95,41% | 95,41% |
| MTP top-1 end-to-end | 100,0% | no disponible | 81,55% |
| Vision VQA/OCR top-1 (96 imagenes) | 100,0% | 97,35% | 97,02% |
| Vision UI/ScreenSpot top-1 (48 imagenes) | 100,0% | 99,26% | 99,26% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas reportadas son de fidelidad frente al modelo BF16, no de rendimiento absoluto en tareas.

## Requisitos de hardware

- VRAM para inferencia: 44,93 GiB para tronco MoE, MTP y visión, con la tabla PLE de 26,82 GiB mapeada en RAM del sistema; 71,75 GiB si se carga todo en VRAM.
- GPU de 48 GB: permite ejecutar el modelo con la PLE en RAM, con unos 2,6 GiB de margen para caché KV y buffers.
- GPU de 80 GB: permite cargar los 71,75 GiB completos en VRAM con unos 7,5 GiB de margen (A100 80 GB, H100 80 GB).
- GPU de 96 GB o superior: el autor recomienda el checkpoint W4A16-HGPTQ de 92,84 GiB para estos entornos.
- GPU consumer: no cabe en GPUs de 24 GB ni de 32 GB; requiere al menos 48 GB de VRAM para el tronco.
- Opciones de despliegue: vLLM y compressed-tensors están soportados de forma explícita; transformers es la librería declarada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | 135.337.199.507 | no disponible | 335,28 GiB | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash-Next-W4A16-HGPTQ | 135.337.199.507 | no disponible | 92,84 GiB | Apache 2.0 | Hugging Face (nchapman) |
| Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO | 135.337.199.507 | no disponible | 71,75 GiB | Apache 2.0 | Hugging Face (nchapman) |

No se dispone de información sobre otros modelos de la misma categoría (mismo tamaño o misma tarea) para establecer una comparativa adicional; los datos de benchmarks estándar de alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce divergencia respecto al BF16: KL ponderada de 0,1396 y KL media por token de 0,1695 en el conjunto probe-v4, y KL media de 0,3150 en el holdout general y multilingüe.
- El acuerdo top-1 end-to-end del MTP cae al 81,55% y el de visión al 90,73%, por debajo de los valores aislados; en pipelines que dependen de estos componentes la degradación es mayor.
- El modelo requiere al menos 48 GB de VRAM para el tronco, lo que excluye GPUs consumer de 24 GB y 32 GB; el despliegue en 48 GB exige mapear la PLE en RAM y depende del ancho de banda de host.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales derivadas de los datos de entrenamiento del modelo base.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las métricas reportadas.
- El repositorio ocupa 77,1 GB, lo que requiere espacio en disco considerable y descarga prolongada.
- No se especifican la longitud de contexto efectiva, los idiomas soportados ni el número de parámetros activos, datos relevantes para dimensionar el despliegue.

## Enlaces

- Modelo cuantizado: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint W4A16 del mismo autor: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
