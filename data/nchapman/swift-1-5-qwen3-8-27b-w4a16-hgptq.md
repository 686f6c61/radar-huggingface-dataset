# nchapman/Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ

## Resumen

Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario nchapman. Se trata de un checkpoint derivado que aplica GPTQ con rotacion Hadamard y descomposicion de Cholesky (HGPTQ) sobre las capas lineales de texto, vision y el modulo MTP (multi-token prediction) nativo del modelo base. El resultado es un unico artefacto de 17,33 GiB (frente a 51,75 GiB en BF16, una reduccion de 2,99x) que mantiene las capacidades image-text-to-text del original.

El modelo base es una adaptacion de UkisAI sobre Qwen3.8-27B, con una arquitectura hibrida que combina bloques GatedDeltaNet (atencion lineal) y bloques de atencion completa, ademas de un cabezal de vision con 27 bloques ViT y un modulo de decodificacion especulativa MTP. La cuantizacion preserva el pipeline multimodal completo, algo poco habitual en checkpoints W4A16, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es practica: permite desplegar un modelo multimodal de 27B parametros en GPUs de gama alta de consumo o en una unica GPU profesional, con una degradacion medida muy contenida respecto al BF16 (perplejidad de texto incluso ligeramente inferior en la evaluacion del autor, 9,2328 frente a 9,6265). Esta pensado para inferencia con vLLM y el formato compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (GatedDeltaNet + atencion completa) con vision encoder ViT y modulo MTP nativo |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, group size 64, GPTQ con Hadamard + Cholesky (HGPTQ); capa `visual.blocks.*.mlp.linear_fc2` con GPTQ per-channel y Hadamard `head_dim=16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), GPTQ W4A16; `model.safetensors` y `model_mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base combina 64 bloques hibridos que alternan GatedDeltaNet (atencion lineal con estado recurrente) y atencion completa, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de recuperacion exacta. Incluye un encoder de vision de 27 bloques ViT con dos proyecciones de merger espacial, y un modulo MTP (multi-token prediction) que actua como drafter para decodificacion especulativa. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este checkpoint es el esquema de cuantizacion: antes de aplicar GPTQ, los pesos se rotan offline mediante una matriz de Walsh-Hadamard de Sylvester determinista (`W' = W H_b / sqrt(b)`, con `b=64` para la mayoria de capas y `b=16` para `v_vision_fc2`), y en tiempo de ejecucion se aplica la misma rotacion a las activaciones de entrada antes del GEMM W4A16 (HadaCore / CompressedTensorsLinearTransformMethod). Al ser la matriz determinista (`randomize: false`), no se almacenan pesos de transformacion en el safetensors. Se cuantizan 517 capas lineales en total: 400 de texto, 7 del MTP y 110 de vision; se mantienen en BF16 `embed_tokens`, `lm_head`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, `mtp.fc`, `visual.patch_embed.proj`, normas y sesgos.

## Capacidades

- Generacion de texto conversacional con soporte de chat multi-turno.
- Razonamiento matematico y cientifico (evaluado en el conjunto de perplejidad del autor junto con codigo y tool use).
- Generacion y comprension de codigo.
- Vision: VQA, interpretacion de graficos, documentos, OCR y comprension de interfaces de usuario (ScreenSpot).
- Tool calling / function calling (incluido en el conjunto de evaluacion de texto del autor).
- Capacidades multilingues (evaluadas en el holdout multilingue del autor).
- Decodificacion especulativa nativa mediante el modulo MTP cuantizado (96,21% Top-1 aislado frente al 100% del BF16).
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente con documentos adjuntos: el pipeline image-text-to-text permite procesar capturas, facturas o PDFs renderizados junto con la conversacion, manteniendo coherencia multi-turno gracias a la atencion hibrida del modelo base.
- Extraccion de datos de documentos y OCR en produccion: la capa de vision cuantizada conserva el 97,02% de Top-1 en VQA, graficos y documentos, suficiente para pipelines de digitalizacion con validacion humana.
- Automatizacion de tareas sobre interfaces (RPA asistido): el rendimiento en ScreenSpot (97,78% Top-1 frente al BF16) lo hace apto para agentes que localizan elementos de UI a partir de capturas de pantalla.
- Asistente de codigo integrado en IDE: soporta tool calling y generacion de codigo; el checkpoint de 17,33 GiB cabe en una unica GPU de 24 GB con cuantizacion W4A16, lo que abarata el despliegue por desarrollador.
- Despliegue en vLLM con decodificacion especulativa: el modulo MTP cuantizado permite activar speculative decoding con un Top-1 end-to-end del 86,85%, reduciendo latencia en servicios de chat de alto trafico.
- Analisis de graficos financieros o dashboards: la evaluacion especifica de charts y documentos respalda casos de resumen automatico de informes con imagenes embebidas.
- Servicio multilingue de bajo coste: el holdout multilingue muestra una perplejidad de 70,67 frente a 79,70 del BF16, por lo que es viable para atencion en varios idiomas sin reentrenamiento.

## Benchmarks y rendimiento

Evaluacion teacher-forced del autor comparando el checkpoint cuantizado con el BF16 base:

| Evaluacion | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 51,75 GiB | 17,33 GiB | 2,99x de compresion |
| Perplejidad texto (378 prompts, 852k tokens) | 9,6265 | 9,2328 (-4,09%) | Chat, matematicas, ciencia, codigo, tool use, multilingue |
| Divergencia KL vs BF16 (ponderada / media por token) | 0,0000 | 0,1265 / 0,3309 | KL FP32 sobre vocabulario completo |
| Perplejidad holdout general y multilingue (76 prompts, 23k tokens) | 79,6973 | 70,6735 (-11,32%) | KL media por token 0,0790 |
| MTP (drafter especulativo), 12.339 posiciones | 100,0% Top-1 (NLL 3,1061) | 96,21% Top-1 (NLL 3,1118) | Top-1 end-to-end 86,85% |
| Vision VQA, charts, documentos y OCR (96 imagenes) | 1,0000 cos sim, 100% Top-1 | 0,9934 cos sim, 97,02% Top-1 | Top-1 end-to-end 92,38% |
| Vision UI (ScreenSpot) y OCR matematico (48 imagenes) | 1,0000 cos sim, 100% Top-1 | 0,9948 cos sim, 97,78% Top-1 | Top-1 end-to-end 95,56% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-20 GB con el checkpoint W4A16 (17,33 GiB de pesos mas overhead de activaciones y KV cache).
- Cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) con contexto moderado; en 32 GB (RTX 5090) con mayor margen de contexto.
- GPUs profesionales recomendadas: A100 40/80 GB, H100, L40S, para servir con contexto largo y batching.
- Opciones de despliegue: vLLM con soporte compressed-tensors y HadaCore (recomendado por el autor); transformers con kernels compatibles. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el modulo MTP permite decodificacion especulativa con Top-1 end-to-end del 86,85%, lo que reduce el numero de pasos de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ (este) | 27,36B | no disponible | safetensors W4A16 | Apache 2.0 | Hugging Face |
| ukisai/Swift-1.5-Qwen3.8-27b (BF16) | 27,36B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |
| ukisai/Swift-1.5-Qwen3.8-27b-INT4 | no disponible | no disponible | INT4 | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al BF16 (KL ponderada de 0,1265 en texto); en tareas sensibles a precision numerica conviene validar contra el modelo original.
- El rendimiento del drafter MTP baja al 96,21% de Top-1 aislado y al 86,85% end-to-end, lo que puede reducir la tasa de aceptacion en decodificacion especulativa.
- La vision cuantizada pierde entre 2 y 3 puntos de Top-1 frente al BF16 en las evaluaciones del autor; en OCR de baja calidad o documentos complejos puede degradarse mas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones de factualidad publicadas.
- Idiomas soportados no declarados oficialmente; el holdout multilingue sugiere cobertura amplia pero sin lista cerrada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base y de Qwen3.8-27B; conviene revisar las licencias upstream.
- Requiere kernels especificos (HadaCore / compressed-tensors) para aprovechar la rotacion online; sin ellos el checkpoint puede no cargar o perder rendimiento.
- Contexto maximo no documentado: planificar el despliegue sin asumir una ventana concreta.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantizacion INT4 alternativa: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Pagina del modelo en UkisAI: https://ukisai.com/swift-1-5-27b
