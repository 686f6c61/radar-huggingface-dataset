# RedHatAI/GLM-5.3-MXFP4

## Resumen

GLM-5.3-MXFP4 es una versión cuantizada a FP4 del modelo zai-org/GLM-5.3, publicada por RedHatAI como parte de su colección de modelos de terceros validados para el portfolio de productos de Red Hat AI. El modelo original lo desarrolla zai-org (GLM/Z-AI) y emplea la arquitectura GlmMoeDsaForCausalLM, un transformer de tipo mezcla de expertos (MoE) con 753.329.940.480 parámetros totales según los pesos en safetensors.

La aportación de esta variante es la cuantización de pesos y activaciones a MXFP4 (OCP Microscaling): pesos en FP4 (e2m1) con grupo de tamaño 32 y escalas de potencia de dos (E8M0), y activaciones en FP4 con escalado dinámico por grupo. Según la model card, esto reduce los bits por parámetro de 8 (FP8) a 4, recortando aproximadamente un 50 % el tamaño en disco y los requisitos de memoria de GPU respecto al checkpoint FP8.

Es relevante ahora porque permite desplegar un modelo de razonamiento de gran escala en hardware más modesto manteniendo una recuperación de precisión alta frente al FP8 (entre el 92,80 % y el 99,26 % según el benchmark). El repo ocupa 465 GB y la cuantización se realizó con LLM Compressor en formato compressed-tensors, lista para inferencia con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer MoE con atención DSA) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos FP4 e2m1, grupo 32, escalas E8M0; activaciones FP4 con escalado dinámico por grupo); KV cache en fp8_e4m3 |
| Idiomas soportados | en, zh |
| Licencia | other (license_name: glm-5.3) |
| Formato de pesos | safetensors (compressed-tensors) |
| Entrada / salida | texto / texto |
| Fecha de publicacion | 2026-09-15 (version 1.0) |
| Desarrollador de la cuantizacion | RedHatAI |
| Modelo base | zai-org/GLM-5.3 |
| Tamano del repo | 465,0 GB |
| Validado en | RHOAI 3.5.1, RHAIIS 3.6.0-fast.2, vLLM 0.28.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con la clase GlmMoeDsaForCausalLM, que combina expertos dispersos con un mecanismo de atención denominado DSA (según la nomenclatura del checkpoint, que incluye módulos `self_attn.indexer`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación de esta variante es puramente de compresión: se aplicó LLM Compressor con el esquema MXFP4 en cuantización post-entrenamiento sin datos de calibración (model-free PTQ), exportando en formato compressed-tensors. Solo se cuantizan pesos y activaciones de los operadores lineales dentro de los bloques transformer; quedan excluidos `mlp.gate`, `lm_head`, `embed_tokens`, `eh_proj`, `self_attn.indexer.weights_proj` y `self_attn.indexer.wk`. La model card menciona además soporte de decodificación especulativa mediante MTP (multi-token prediction) con 5 tokens especulativos en vLLM, y un parser de razonamiento `glm45`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático de varios pasos: GSM8K Platinum, MATH-500 y AIME 2025 evaluados con pass@1.
- Razonamiento científico y de dominio experto: GPQA Diamond.
- Seguimiento de instrucciones estrictas (IFEval a nivel de prompt).
- Modo de razonamiento explícito, con parser dedicado en vLLM (`--reasoning-parser glm45`).
- Decodificación especulativa con MTP para acelerar la generación.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.

## Casos de uso

- Razonamiento matemático en producción: el modelo obtiene un 94,00 % en MATH-500 y un 91,25 % en AIME 2025 tras la cuantización, por lo que es adecuado para sistemas de resolución de problemas paso a paso con verificación de resultados.
- Asistentes conversacionales de dominio experto: con un 89,06 % en GPQA Diamond puede emplearse en plataformas de consulta técnica y científica donde se requiere razonamiento profundo y contexto textual amplio.
- Generación de respuestas con instrucciones estrictas: el 91,19 % en IFEval lo hace apto para pipelines que dependen de formatos de salida controlados (JSON, plantillas, restricciones de longitud), aunque el soporte de tool calling no está documentado.
- Despliegue en clústeres con GPUs B200: la model card indica evaluación sobre 4 B200 y configuración con `--tensor-parallel-size 4`, un escenario realista para servir el modelo con vLLM en infraestructura de centro de datos.
- Sustitución del checkpoint FP8 para ahorrar memoria: al reducir aproximadamente un 50 % el uso de memoria de GPU y el tamaño en disco, permite liberar capacidad para KV cache más grande o para servir más réplicas en el mismo hardware.
- Integración en plataformas Red Hat AI: validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, encaja en despliegues empresariales gestionados sobre OpenShift AI.
- Aplicaciones bilingües inglés-chino: atención al cliente o generación de documentación en ambos idiomas, los únicos soportados según los metadatos.

## Benchmarks y rendimiento

Resultados de la model card, promediados sobre 3 semillas (1234, 2345, 3456) y servidos con vLLM sobre 4 B200. La recuperación se calcula frente al checkpoint FP8.

| Categoria | Benchmark | GLM-5.3 (FP8) | GLM-5.3-MXFP4 | Recuperacion |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 91,87 % | 91,19 % | 99,26 % |
| Razonamiento | GSM8K Platinum (strict-match) | 97,60 % | 96,36 % | 98,73 % |
| Razonamiento | MATH-500 (pass@1) | 95,67 % | 94,00 % | 98,26 % |
| Razonamiento | AIME 2025 (pass@1) | 98,33 % | 91,25 % | 92,80 % |
| Razonamiento | GPQA Diamond (pass@1) | 92,42 % | 89,06 % | 96,36 % |

La mayor pérdida se observa en AIME 2025 (7,08 puntos absolutos, 92,80 % de recuperación); el resto de tareas mantiene una recuperación superior al 96 %.

## Requisitos de hardware

- Memoria: el repo pesa 465 GB en MXFP4. Para cargar los pesos en GPU se necesita aproximadamente esa cifra de VRAM agregada, más el espacio de KV cache y activaciones; el FP8 equivalente requeriría cerca del doble.
- Configuración de referencia: 4 GPU B200 con tensor parallelism 4, según la model card.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB; requiere un nodo multi-GPU de centro de datos (serie B200/H200, A100 en número elevado).
- Opciones de despliegue: vLLM 0.28.0 o superior, con `--kv-cache-dtype fp8_e4m3`, `--tensor-parallel-size 4`, `--reasoning-parser glm45` y configuración especulativa MTP (`{"method":"mtp","num_speculative_tokens":5}`). Validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- No se documenta soporte de llama.cpp, Ollama o TGI para este checkpoint; el formato compressed-tensors está orientado a vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-MXFP4 | 753,3 B | MXFP4 (pesos y activaciones) | no disponible | other (glm-5.3) | Hugging Face, vLLM |
| zai-org/GLM-5.3 (FP8) | 753,3 B | FP8 | no disponible | other (glm-5.3) | Hugging Face |
| RedHatAI/Mistral-Medium-3.5-128B | 128 B | no disponible | no disponible | no disponible | Hugging Face |
| RedHatAI/diffusiongemma-26B-A4B-it-NVFP4 | 26 B (A4B) | NVFP4 | no disponible | no disponible | Hugging Face |

La comparación directa más significativa es con el checkpoint FP8 del mismo modelo: la variante MXFP4 reduce a la mitad los bits por parámetro con una recuperación de precisión del 92,80-99,26 %. Los otros modelos de RedHatAI listados pertenecen a rangos de tamaño muy distintos (128 B y 26 B), por lo que no son alternativas equivalentes en escala; no se dispone de datos de rendimiento de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: la mayor caída se da en AIME 2025 (de 98,33 % a 91,25 %), por lo que no se recomienda para tareas que exijan el máximo rendimiento en matemáticas competitivas.
- Solo inglés y chino: no hay soporte documentado de castellano ni de otros idiomas.
- No se documentan capacidades de tool calling, agentes, visión o audio; no debe asumirse que las hereda del modelo base sin verificación.
- Licencia "other" con nombre glm-5.3: es necesario revisar el texto de la licencia del modelo base antes de cualquier uso comercial; los términos pueden imponer restricciones adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se publican evaluaciones de factualidad ni de sesgos en la información disponible.
- Longitud de contexto no disponible: impide planificar despliegues con documentos largos sin consultar la documentación del modelo base.
- Dependencia fuerte de vLLM y del formato compressed-tensors: la portabilidad a otros motores de inferencia no está garantizada.
- Requiere hardware de centro de datos multi-GPU; no es viable en entornos de consumo.
- La model card no detalla la composición del dataset de entrenamiento del modelo base, lo que limita la evaluación de sesgos y de cobertura lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-MXFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- README del checkpoint: https://huggingface.co/RedHatAI/GLM-5.3-MXFP4/blob/main/README.md
- Organización RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
- Catálogo de modelos RedHatAI: https://huggingface.co/RedHatAI/models
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (fork Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork Neural Magic): https://github.com/neuralmagic/lighteval
