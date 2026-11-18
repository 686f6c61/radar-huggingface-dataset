# ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF es una colección de cuantizaciones GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, que a su vez es una versión "abliterated" (sin mecanismos de rechazo) del fine-tune Swift 1.5 Qwen3.8-27B de UkisAI sobre el modelo base Qwen3.8-27B de Qwen. El autor de esta ficha de cuantización es ajgazin, y el modelo está pensado para su uso con llama.cpp, incluyendo soporte de visión mediante proyector multimodal y decodificación especulativa con una cabeza MTP integrada.

El modelo resuelve el problema de ejecutar localmente un modelo multimodal de gran tamaño (27B nominales) con distintos niveles de compromiso entre calidad y tamaño de archivo, ofreciendo dos layouts de cuantización: los archivos `UD-*` (Dynamic 3.0 de Unsloth, por tensor) y los `RCO-*` (asignación GSQ-RCO de ISTA-DASLab, más experimentales). La variante "uncensored" reduce los rechazos de 98/100 a 23/100 respecto a Swift 1.5, con una divergencia KL de 0,0884 frente a ese modelo.

Es relevante ahora porque combina tres tendencias: cuantización dinámica mixta de alta calidad, decodificación especulativa autointegrada (cabeza MTP en el propio GGUF, sin archivo draft separado) y entrada de imagen y vídeo mediante proyector. El repositorio acumula 63.195 descargas y 59 likes, con un tamaño total de 284,8 GB repartido entre todas las variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con cabeza MTP para decodificación especulativa y proyector multimodal |
| Parámetros totales | 460.730.096 (dato de safetensors del modelo base; el nombre comercial indica 27B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso de llama.cpp emplea `-c 32768` |
| Tipos de cuantización | BF16, UD-Q8_K_XL, UD-Q6_K_XL, UD-Q5_K_M, UD-Q5_K_S, UD-Q4_K_XL, UD-Q4_K_S, UD-IQ4_XS, UD-Q3_K_XL, UD-IQ3_S, UD-IQ3_XXS, UD-Q2_K_XL, RCO-IQ3_S, RCO-IQ3_XXS, RCO-IQ2_S, RCO-IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); también existe una variante NVFP4 en otro repositorio para GPU Blackwell |

## Arquitectura y entrenamiento

El modelo base es un transformer denso Qwen3.8-27B, ajustado por UkisAI como Swift 1.5 (un fine-tune orientado a eficiencia de razonamiento) y posteriormente "abliterated" por ajgazin para eliminar los comportamientos de rechazo. Sobre esa base se añade una cabeza MTP (multi-token prediction) que permite decodificación especulativa autocontenida en llama.cpp mediante `--spec-type draft-mtp`, sin necesidad de un modelo draft separado. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica principal de esta ficha es la cuantización. Los archivos `UD-*` siguen la asignación Dynamic 3.0 de Unsloth con tipos por tensor, calibrados con imatrix. Los archivos `RCO-*` siguen la asignación GSQ-RCO de ISTA-DASLab, son más experimentales y, según el autor, omiten el refinamiento GSQ, por lo que sus métricas no describen los archivos GSQ-RCO originales de UkisAI. La calidad se midió token a token contra el BF16 de origen sobre wikitext-2 (36 secuencias de 8192 tokens, caché KV en f16, llama.cpp `94659b076`).

## Capacidades

- Generación de texto y razonamiento: el modelo "piensa antes de responder" por defecto, según la model card.
- Entrada de imagen y vídeo mediante el proyector `mmproj-BF16.gguf` (0,9 GiB), necesario solo para entrada multimodal.
- Decodificación especulativa con la cabeza MTP integrada en el GGUF principal.
- Comportamiento "uncensored": 23/100 rechazos frente a 98/100 de Swift 1.5.
- Dos layouts de cuantización seleccionables según el compromiso calidad/tamaño.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: usando `UD-Q4_K_XL` (16,4 GiB, KLD 0,0369, 95,6 % same top-1) el modelo cabe en GPUs de 24 GB y mantiene una fidelidad alta respecto al BF16, adecuado para asistentes de código y análisis de documentos sin conexión.
- Servidor de inferencia con llama.cpp y decodificación especulativa: activando `--spec-type draft-mtp` se aprovecha la cabeza MTP incluida para acelerar la generación sin gestionar un modelo draft aparte, útil en servicios de chat con latencia ajustada.
- Análisis de imágenes y vídeo en local: con `--mmproj mmproj-BF16.gguf` el modelo acepta entrada visual, lo que permite tareas de descripción de imágenes, extracción de información de capturas o revisión de fotogramas en pipelines privados.
- Investigación sobre alineación y rechazo: la variante uncensored (23/100 rechazos, KLD 0,0884 frente a Swift 1.5) sirve para estudiar el efecto de la abliteración en la distribución de salida y en la tasa de rechazo.
- Evaluación de métodos de cuantización: los archivos `tensor_types.tsv`, `rco_types.tsv` y `kld_results.csv` permiten reproducir y comparar las asignaciones UD y RCO por tensor, útil para investigadores que estudian el impacto de la cuantización mixta.
- Prototipado en hardware limitado: con `UD-Q2_K_XL` (9,2 GiB) o `RCO-IQ2_XS` (8,2 GiB) se puede ejecutar el modelo en GPUs de 12 GB o en configuraciones con offload parcial a CPU, aceptando una pérdida notable de fidelidad (KLD 0,1902 y 0,3018 respectivamente).
- Generación de documentación técnica y resúmenes largos: el ejemplo de la model card usa 32.768 tokens de contexto, suficiente para procesar manuales o expedientes extensos en una sola pasada.

## Benchmarks y rendimiento

La información proporcionada incluye métricas de fidelidad de cuantización (KLD media y porcentaje de same top-1 frente al BF16 de origen), no benchmarks de tareas como MMLU o HumanEval.

| Cuantización | Tamaño | KLD media | Same top-1 |
|---|---|---|---|
| BF16 | 50,9 GiB | — | — |
| UD-Q8_K_XL | 29,3 GiB | 0,0068 | 98,8 % |
| UD-Q6_K_XL | 23,6 GiB | 0,0138 | 98,2 % |
| UD-Q5_K_M | 18,4 GiB | 0,0238 | 96,8 % |
| UD-Q5_K_S | 17,4 GiB | 0,0279 | 96,4 % |
| UD-Q4_K_XL | 16,4 GiB | 0,0369 | 95,6 % |
| UD-Q4_K_S | 14,3 GiB | 0,0575 | 94,0 % |
| UD-IQ4_XS | 13,3 GiB | 0,0691 | 92,9 % |
| UD-Q3_K_XL | 12,2 GiB | 0,0789 | 91,7 % |
| RCO-IQ3_S | 11,3 GiB | 0,1084 | 89,5 % |
| UD-IQ3_S | 11,2 GiB | 0,1074 | 89,9 % |
| UD-IQ3_XXS | 10,2 GiB | 0,1353 | 87,8 % |
| RCO-IQ3_XXS | 9,7 GiB | 0,1774 | 86,4 % |
| UD-Q2_K_XL | 9,2 GiB | 0,1902 | 85,1 % |
| RCO-IQ2_S | 8,9 GiB | 0,2349 | 83,8 % |
| RCO-IQ2_XS | 8,2 GiB | 0,3018 | 81,2 % |

Según el autor, en los archivos UD la calidad sigue el tamaño del archivo sin excepciones: por encima de UD-Q5_K_M cada GiB adicional aporta poco, y por debajo cada GiB ahorrado cuesta aproximadamente el doble. RCO-IQ3_S iguala a UD-IQ3_S; los tres RCO más pequeños se alejan más del BF16 que los UD de tamaño comparable. Estas cifras son relativas a este BF16 y a este texto, por lo que no son comparables con las de otros repositorios ni con el 0,0884 de la abliteración, que se mide frente a Swift 1.5.

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde unos 8,2 GiB (RCO-IQ2_XS) hasta 50,9 GiB (BF16); el rango práctico va de 10 a 30 GiB según cuantización.
- GPU recomendadas: para BF16 o UD-Q8_K_XL, A100 80 GB o H100; para UD-Q6_K_XL y UD-Q5_K_M, GPUs de 24-32 GB (RTX 4090, A6000, L40S).
- GPU de consumo: UD-Q4_K_XL (16,4 GiB) y UD-Q4_K_S (14,3 GiB) caben en RTX 4090 (24 GB) y en GPUs de 16 GB con margen para contexto; UD-Q3_K_XL (12,2 GiB) y UD-IQ3_S (11,2 GiB) caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `--mmproj` para visión y `--spec-type draft-mtp` para decodificación especulativa; para GPU Blackwell existe una variante NVFP4 compatible con vLLM y SGLang en otro repositorio.
- Requisito de build: `--spec-type draft-mtp` necesita una compilación de llama.cpp con soporte MTP para `qwen35`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 284,8 GB; conviene descargar solo la cuantización necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF (este) | 460.730.096 según safetensors del base; 27B nominales | no disponible | GGUF UD y RCO, BF16, NVFP4 en otro repo | swift-open-license-1.0 | Visión, MTP integrada, uncensored |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (base) | 27B nominales | no disponible | safetensors | swift-open-license-1.0 | Modelo de origen de esta cuantización |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B nominales | no disponible | no disponible | swift-open-license-1.0 | Fine-tune de razonamiento eficiente, censurado (98/100 rechazos) |
| Qwen/Qwen3.8-27B | 27B nominales | no disponible | no disponible | no disponible | Modelo base original |

La información disponible no incluye comparaciones con modelos de otros fabricantes ni datos de rendimiento en tareas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La variante "uncensored" elimina la mayoría de rechazos (23/100 frente a 98/100), lo que implica un riesgo elevado de generar contenido dañino, ilegal o sesgado sin filtros; no es adecuada para aplicaciones orientadas al público sin moderación adicional.
- La abliteración introduce una divergencia KL de 0,0884 respecto a Swift 1.5, lo que puede degradar sutilmente la coherencia o la utilidad en tareas sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje de esta escala.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del inglés sin evaluación previa.
- Longitud de contexto no documentada; el ejemplo de uso emplea 32.768 tokens, pero no se confirma el máximo del modelo.
- Las cuantizaciones por debajo de UD-Q5_K_M pierden calidad de forma acelerada; por debajo de IQ3 el KLD supera 0,10 y el same top-1 cae por debajo del 90 %.
- Los archivos RCO son experimentales y omiten el refinamiento GSQ; sus métricas no describen los archivos GSQ-RCO de UkisAI.
- La licencia swift-open-license-1.0 está etiquetada como `other`; es imprescindible revisar el texto completo antes de cualquier uso comercial.
- El nombre comercial "27B" no coincide con el recuento de safetensors del modelo base (460.730.096 parámetros); conviene verificar el tamaño real antes de dimensionar el hardware.
- El repositorio completo ocupa 284,8 GB; descargar todos los archivos sin seleccionar la cuantización consume almacenamiento innecesario.
- El soporte MTP requiere una compilación específica de llama.cpp para `qwen35`; las builds estándar pueden no reconocer `--spec-type draft-mtp`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Variante NVFP4 para Blackwell: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4
- Modelo Swift 1.5 Qwen3.8-27B de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Paper referenciado (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
