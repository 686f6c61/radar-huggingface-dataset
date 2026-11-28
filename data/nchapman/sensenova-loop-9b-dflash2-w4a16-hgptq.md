# nchapman/SenseNova-Loop-9B-DFlash2-W4A16-HGPTQ

## Resumen

SenseNova-Loop-9B-DFlash2-W4A16-HGPTQ es una cuantizacion a 4 bits del modelo borrador (draft model) sensenova/SenseNova-Loop-9B-DFlash2, un drafter de decodificacion especulativa basado en difusion de bloques paralela. Lo publica el usuario nchapman bajo licencia Apache 2.0 y esta pensado para emparejarse con el modelo objetivo SenseNova-Loop-9B, tambien cuantizado por el mismo autor. Su funcion no es generar texto de forma autonoma, sino proponer varios tokens futuros en paralelo para acelerar la generacion del modelo grande.

El drafter original consta de 5 capas y opera con un tamano de bloque de 8, proponiendo 7 tokens futuros de forma simultanea en lugar de uno a uno. Esta version cuantizada emplea el esquema W4A16 con GPTQ y transformadas de Hadamard, empaquetada en formato compressed-tensors, y reduce el peso en VRAM de 1,80 GiB en BF16 a 0,69 GiB (744 MB), es decir, un factor de 2,60x. Combinado con el modelo objetivo de 9B cuantizado, el par completo ocupa 7,37 GiB.

Es relevante para desarrolladores que despliegan SenseNova-Loop-9B en produccion y buscan reducir el coste de memoria y latencia mediante decodificacion especulativa, sin renunciar practicamente a la fidelidad del borrador. El autor reporta una similitud coseno de estados ocultos de 0,9970 y un 94,87% de acuerdo top-1 frente al drafter de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con difusion de bloques paralela (block-diffusion speculative drafter), block_size=8 |
| Parametros totales | 1.051.150.848 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con Hadamard (W4_g64 + H_64) en proyecciones transformer y convoluciones dinamicas; W8_g64 en fc; BF16 en codebooks del candidate_selector, base_kernel de convolucion dinamica y normas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa que sigue el paradigma de difusion de bloques: en lugar de predecir un unico token siguiente, propone un bloque de 8 posiciones y genera 7 tokens futuros en paralelo. La arquitectura consta de 5 capas transformer con proyecciones y convoluciones dinamicas, e incorpora un mecanismo de seleccion de candidatos (candidate_selector) con codebooks que se mantiene en BF16 para preservar la calidad de la seleccion. El modelo base es sensenova/SenseNova-Loop-9B-DFlash2, que a su vez se apoya en SenseNova-Loop-9B como modelo objetivo.

La cuantizacion la realiza nchapman mediante GPTQ calibrado sobre estados ocultos reales del modelo objetivo cuantizado SenseNova-Loop-9B-W4A16-HGPTQ, concretamente en las capas [3, 27, 51, 54, final_postnorm]. Se cuantizan 45 proyecciones (transformer y convoluciones dinamicas) con W4_g64 + H_64 y la capa fc con W8_g64. No se dispone de informacion sobre el dataset de entrenamiento original del drafter, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa: propone 7 tokens futuros en paralelo por bloque de 8.
- Aceleracion de inferencia del modelo objetivo SenseNova-Loop-9B mediante verificacion especulativa.
- Fidelidad alta respecto al drafter de 16 bits: 0,9970 de similitud coseno de estados ocultos, 0,0080 de KL en logits del borrador, 94,87% de acuerdo top-1 y 94,77% de recall top-16 de candidatos.
- Integracion con el runtime warp34 mediante el flag `--draft-model`.
- No es un modelo de generacion autonoma: no se debe usar como modelo principal de chat o texto.
- Soporte de tool calling, agentes, vision o audio: no disponible (no aplica a un drafter).

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar SenseNova-Loop-9B junto con este drafter en warp34 para reducir la latencia por token generado gracias a la propuesta paralela de 7 tokens por bloque.
- Despliegue en GPU de consumo: el par objetivo + drafter ocupa 7,37 GiB, lo que permite ejecutar el conjunto en tarjetas con 8-12 GB de VRAM.
- Servicio de chat de baja latencia: usar la decodificacion especulativa para mejorar el tiempo hasta el primer token y el throughput en conversaciones multi-turno.
- Reduccion de coste en infraestructura: sustituir el drafter en BF16 (1,80 GiB) por esta version (0,69 GiB) para liberar VRAM y permitir mayor concurrencia o contextos mas largos.
- Evaluacion y benchmarking de tecnicas de decodificacion especulativa: comparar la fidelidad del borrador cuantizado frente al de 16 bits con las metricas reportadas.
- Pipelines de generacion por lotes: aumentar el throughput agregado en tareas de generacion masiva donde la latencia por peticion es critica.
- Experimentacion con cuantizacion GPTQ calibrada sobre features del objetivo: servir como referencia para reproducir el flujo de warp34-quant-lab en otros drafters.

## Benchmarks y rendimiento

| Metrica (frente al drafter de 16 bits) | Valor |
|---|---|
| Similitud coseno de estados ocultos | 0,9970 |
| KL de logits del borrador | 0,0080 |
| Acuerdo top-1 | 94,87% |
| Recall top-16 de candidatos | 94,77% |
| Reduccion de VRAM | 2,60x (0,69 GiB vs 1,80 GiB) |
| VRAM del par objetivo + drafter | 7,37 GiB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo borrador y no de un modelo generativo evaluable de forma independiente.

## Requisitos de hardware

- VRAM del drafter: 0,69 GiB (744 MB) en W4A16, frente a 1,80 GiB en BF16.
- VRAM del conjunto: 7,37 GiB combinando SenseNova-Loop-9B-W4A16-HGPTQ y este drafter.
- GPU recomendadas: tarjetas con al menos 8-12 GB de VRAM para el par completo; el drafter por si solo cabe en cualquier GPU moderna.
- Cabe en GPU de consumo: si, el par completo es compatible con RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: runtime warp34 (soporte nativo mediante `--draft-model`); otros runtimes no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el autor indica que la propuesta paralela de 7 tokens acelera la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-DFlash2-W4A16-HGPTQ (este) | 1,05B | no disponible | W4A16 GPTQ | apache-2.0 | Hugging Face |
| SenseNova-Loop-9B-DFlash2 (BF16) | 1,05B | no disponible | BF16 | no disponible | Hugging Face |
| SenseNova-Loop-9B-W4A16-HGPTQ (objetivo) | 9B (nominal) | no disponible | W4A16 GPTQ | apache-2.0 | Hugging Face |

No se dispone de informacion sobre otros drafters de decodificacion especulativa comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: requiere el modelo objetivo SenseNova-Loop-9B y un runtime compatible (warp34) para funcionar.
- La fidelidad no es perfecta: el 94,87% de acuerdo top-1 implica que aproximadamente un 5% de las propuestas del borrador difieren del drafter de 16 bits, lo que puede reducir la tasa de aceptacion especulativa.
- La calibracion GPTQ se realizo sobre estados ocultos del objetivo cuantizado concreto; su comportamiento puede degradarse si se empareja con otro objetivo o con otra configuracion de cuantizacion.
- Idiomas soportados no documentados; al ser un drafter, hereda las capacidades linguisticas del modelo objetivo.
- Riesgo de alucinacion: no aplica directamente al drafter, pero las propuestas erroneas se filtran en la verificacion del objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original SenseNova-Loop-9B-DFlash2.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere poca validacion externa de la comunidad.
- No se dispone de informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/SenseNova-Loop-9B-DFlash2-W4A16-HGPTQ
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-DFlash2
- Modelo base objetivo: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Modelo objetivo cuantizado: https://huggingface.co/nchapman/SenseNova-Loop-9B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (en el repositorio del modelo)
