# hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw

## Resumen

Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw es una cuantizacion en formato MLX del modelo NVIDIA Nemotron-3.5-Bolt-74B-A9B-BF16, preparada por Hermit Dave. El modelo base es un transformer hibrido de tipo MoE desarrollado por NVIDIA, con 74.330 millones de parametros totales y aproximadamente 9.000 millones activos por token. Esta version concreta aplica la tecnica RCO (rate-constrained optimization), un asignador de precision mixta con restriccion exacta de bits por peso, orientado a preservar la calidad bajo un presupuesto de cuantizacion fijo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 74B en Apple Silicon con memoria unificada de 64 GB, algo inviable con el checkpoint BF16 original (149,8 GB). El build nominal es de 4,0 bpw y efectivo de 4,367 bpw, ocupa 40,57 GB en disco y alcanza un pico de memoria de 44,8 GB durante la evaluacion, con un throughput de 403 tok/s en un M3 Max.

La arquitectura combina 88 bloques: 40 de tipo Mamba (atencion lineal), 40 MoE y 8 de atencion completa, con un tamano oculto de 4096 y un vocabulario de 131.072 tokens. El checkpoint es solo de texto: las torres de vision y audio del modelo upstream se han descartado porque la implementacion `nemotron_h` de MLX no tiene contrapartida para ellas. La licencia del modelo base es OpenMDW-1.1 segun la model card, aunque el campo de licencia del repositorio aparece como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 40 bloques Mamba + 40 bloques MoE + 8 bloques de atencion completa (88 bloques) |
| Parametros totales | 74.042.720.768 (74,33 B) |
| Parametros activos | ~9 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group size 64, escalas y sesgos en bfloat16; mezcla de 3, 4, 6 y 8 bits por modulo, con tensores en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 segun la model card del autor; campo de licencia del repo: no disponible |
| Formato de pesos | safetensors (MLX), repo de 40,6 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que alterna capas Mamba (atencion lineal con estado recurrente) y capas MoE con atencion completa. Cada bloque MoE dispone de 240 a 496 expertos enrutados de forma heterogenea por capa, mas un experto compartido, con proyecciones latentes (`fc1_latent_proj` y `fc2_latent_proj`) que reducen el coste del enrutamiento. El tamano oculto es de 4096 y el vocabulario de 131.072 tokens. El checkpoint no incluye cabeza NextN (MTP), por lo que no dispone de decodificacion especulativa nativa en esta distribucion.

Sobre el entrenamiento del modelo original no se proporciona informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica documentada en esta ficha corresponde al proceso de cuantizacion: RCO asigna bits por tensor minimizando el error de reconstruccion medido bajo una restriccion exacta de bits por peso, usando una imatrix construida especificamente para este checkpoint (27.921 tensores, 1,05 M de tokens de FineWeb-Edu). La asignacion resultante es: expertos enrutados a 3 bits (36 tensores) y 4 bits (44), experto compartido a 6 bits, MoE latente a 8 bits, Mamba de entrada/salida a 6 bits, q/o de atencion completa a 6 bits y k/v a 8 bits. Permanecen en BF16 los embeddings, la cabeza de salida, todas las normas, las compuertas del router y 40 tensores `gate_proj` que quedaron sin cuantizar por un bug de coincidencia de prefijos en el pipeline.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y conocimiento general: obtiene 0,5975 en MMLU y 0,6150 en ARC-Challenge en la evaluacion zero-shot del autor.
- Razonamiento de sentido comun: 0,5375 en HellaSwag y 0,6450 en Winogrande.
- Comprension lectora basica: 0,8625 en ARC-Easy.
- Eficiencia de inferencia por arquitectura MoE: solo ~9 B de parametros activos por token sobre 74 B totales.
- Capacidades multimodales (vision y audio): presentes en el modelo upstream, pero eliminadas en esta conversion MLX; no disponibles en este checkpoint.
- Tool calling, function calling y razonamiento multi-paso en agentes: no documentados en la informacion disponible.
- Modo thinking explicito: no documentado.
- Multilingue: no; el modelo declara unicamente ingles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint cabe en un Mac con 64 GB de memoria unificada (pico de 44,8 GB), lo que permite ejecutar un modelo de 74 B en hardware de sobremesa sin GPU dedicada, usando `mlx-lm` con soporte para `nemotron_h_puzzle`.
- Prototipado y evaluacion de modelos grandes sin infraestructura de datacenter: investigadores que necesiten medir el comportamiento de un MoE de 74 B pueden hacerlo en un portatil o estacion de trabajo Apple, con 403 tok/s de throughput en un M3 Max.
- Generacion de texto en ingles con requisitos de calidad cercanos al BF16: la perplexity de 7,1026 frente a 6,2092 del profesor BF16 y el 87,1 % de acuerdo top-1 lo hacen adecuado para tareas de generacion donde no se exige fidelidad exacta al modelo original.
- Clasificacion y respuesta a preguntas zero-shot: los resultados en ARC, HellaSwag, Winogrande y MMLU permiten usarlo como baseline en pipelines de evaluacion o en tareas de pregunta-respuesta de dominio general en ingles.
- Experimentacion con cuantizacion de precision mixta: sirve como referencia practica para estudiar el impacto de RCO y de presupuestos de bits (3,0 frente a 4,0 bpw) sobre perplexity, KL y acuerdo top-1 en un modelo hibrido Mamba-MoE.
- Sustitucion de modelos densos de menor tamano en entornos con memoria limitada: al activar solo ~9 B por token, ofrece la calidad asociada a un modelo de 74 B con un coste computacional por token mucho menor, util para generacion de texto por lotes en local.

## Benchmarks y rendimiento

Evaluacion sobre WikiText-2 test (256 × 512 = 130.816 tokens), con profesor BF16 de perplexity 6,2092 en las filas evaluadas:

| Metrica | Este build (4,0 bpw) | Build 3,0 bpw | AtomicChat 3,0 |
|---|---|---|---|
| Perplexity (menor es mejor) | 7,1026 ± 0,0499 | 7,8023 ± 0,0549 | 7,7602 ± 0,0550 |
| Media zero-shot (5 × 400) | 0,6515 | 0,6270 | 0,6275 |
| KL (ref ‖ quant) | 0,0918 | 0,2729 | 0,2449 |
| Acuerdo top-1 | 87,1 % | 78,3 % | 79,6 % |
| Memoria pico | 44,8 GB | 35,7 GB | no disponible |
| Throughput de evaluacion | 403 tok/s | 475 tok/s | no disponible |

Resultados zero-shot por tarea (precision bruta, mismos prompts):

| Tarea | Este build (4,0) | Build 3,0 bpw |
|---|---|---|
| arc_challenge | 0,6150 | 0,5875 |
| arc_easy | 0,8625 | 0,8550 |
| hellaswag | 0,5375 | 0,5025 |
| winogrande | 0,6450 | 0,6200 |
| mmlu | 0,5975 | 0,5700 |

No se han publicado resultados de benchmarks del modelo base BF16 en la informacion disponible; las cifras anteriores corresponden a la validacion de la cuantizacion frente a un profesor BF16 evaluado por streaming.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 40,57 GB en disco; pico medido de 44,8 GB durante la evaluacion en una maquina de 64 GB. Un KV cache grande puede provocar swapping en 64 GB.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon con memoria unificada. Validado en un M3 Max de 64 GB con MLX 0.32.x y macOS. No se documenta soporte para A100, H100 ni RTX 4090 en este checkpoint.
- Cabe en GPU de consumo: si, en Apple Silicon con al menos 64 GB de memoria unificada. No se indica compatibilidad con GPUs NVIDIA de consumo en formato MLX.
- Opciones de despliegue: `mlx-lm` con una build que incluya el modelo `nemotron_h_puzzle` (fork `feat/nemotron-h-puzzle-support` o cualquier mlx-lm con ese modelo registrado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 403 tok/s en evaluacion sobre M3 Max 64 GB. Una variante de 4,5 bpw del mismo run alcanza un pico de 49,4 GB y evalua a 97 tok/s, frente a los 403 tok/s de este build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (Nemotron-3.5-Bolt-74B-A9B MLX RCO 4,0 bpw) | 74,33 B totales / ~9 B activos | no disponible | 7,1026 | OpenMDW-1.1 (segun model card) | Hugging Face, formato MLX |
| Nemotron-3.5-Bolt-74B-A9B MLX RCO 3,0 bpw (mismo autor) | 74,33 B totales / ~9 B activos | no disponible | 7,8023 | OpenMDW-1.1 (segun model card) | Hugging Face, formato MLX |
| AtomicChat 3,0 (cuantizacion del mismo modelo) | 74,33 B totales / ~9 B activos | no disponible | 7,7602 | no disponible | Hugging Face |
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (modelo base) | 74,33 B totales / ~9 B activos | no disponible | 6,2092 (profesor en filas evaluadas) | OpenMDW-1.1 | Hugging Face, BF16 (149,8 GB) |

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos alternativos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo declara unicamente el idioma `en`; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Solo texto: las torres de vision y audio del modelo upstream se han eliminado en esta conversion; no es posible usarlo como modelo multimodal.
- Perdida de calidad frente al BF16: perplexity de 7,1026 frente a 6,2092 del profesor, con un 87,1 % de acuerdo top-1. No es equivalente al modelo original.
- Bug de cuantizacion conocido: 40 tensores `gate_proj` quedaron en BF16 por un error de coincidencia de prefijos en el pipeline, lo que eleva el bpw efectivo a 4,367 frente al nominal de 3,997. No degrada la calidad, pero aumenta el tamano en disco y la memoria necesaria.
- Requiere una build no estandar de `mlx-lm`: `nemotron_h_puzzle` no esta en el upstream; sin el fork o un registro equivalente, `load_weights` falla.
- Riesgo de swapping: el pico de 44,8 GB sobre 64 GB deja poco margen para un KV cache grande.
- Licencia: la model card cita OpenMDW-1.1 para el modelo upstream, pero el campo de licencia del repositorio figura como no disponible; conviene verificar las condiciones antes de un uso comercial.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de sesgos en la informacion disponible.
- Throughput limitado en variantes de mayor bpw: la version de 4,5 bpw cae a 97 tok/s, lo que condiciona la eleccion de cuantizacion en funcion del hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Variante 3,0 bpw del mismo autor: https://huggingface.co/hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw
- Dataset de calibracion (imatrix): https://huggingface.co/datasets/hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix
- Repositorio RCO: https://github.com/ISTA-DASLab/RCO
