# bertholomus/DeepSeek-V4.1-Flash-TensorFold-TP2-2xGB10

## Resumen

DeepSeek-V4.1-Flash-TensorFold-TP2-2xGB10 es un repositorio de receta e ingeniería, no un conjunto de pesos completo, publicado por el usuario bertholomus. Contiene el «kit» de kernels (cuatro tablas RoPE y el fichero `vision/gate_bias_vl.safetensors`) que acompaña a la receta `bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10` (v0.7.4), cuyo objetivo es servir el modelo DeepSeek-V4.1-Flash-1017 en paralelismo tensorial (TP2) sobre dos nodos NVIDIA DGX Spark con GPU GB10. Los pesos reales se alojan en un repositorio aparte (`bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw`, cuantización EXL3 a 2,5 bits por peso).

El modelo base, DeepSeek-V4.1-Flash-1017 de DeepSeek, es un transformer de mezcla de expertos (MoE) con capacidades multimodales de imagen a texto, tal como indica el pipeline `image-text-to-text`. La propuesta de esta receta es poco habitual: ejecutar un modelo MoE de gran tamaño en hardware de consumo profesional (dos estaciones DGX Spark) mediante cuantización agresiva a 2,5 bpw, paralelismo tensorial entre nodos y decodificación especulativa, con una ventana de contexto declarada de 2.097.152 posiciones.

La relevancia actual reside en la ingeniería de despliegue: la receta documenta compuertas de validación (43 comprobaciones), coincidencia byte a byte con la codificación de referencia de DeepSeek en chat (71/71), soporte de tool calling forzado y automático, salida estructurada, escudo de prompt y recuperación de agujas en prompts de más de un millón de tokens. Es material de referencia para quien quiera replicar el despliegue, no un modelo listo para descargar y usar directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (imagen-texto a texto), servido con motor TensorFold (Zig) en TP2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 2.097.152 posiciones (ventana declarada en la receta v0.7.4) |
| Tipos de cuantización | EXL3 a 2,5 bpw (pesos del repo asociado); versiones anteriores usaban EXL3 2,9 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (repo); pesos base MIT según la model card |
| Formato de pesos | safetensors (kit: tablas RoPE y `gate_bias_vl.safetensors`); pesos EXL3 en repo separado |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con torre de visión, según se deduce de las etiquetas `moe`, `vision` e `image-text-to-text`. La model card no detalla el número de expertos, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original; esa información correspondería a la documentación de DeepSeek y no está incluida en la información disponible.

La innovación técnica de esta receta es de despliegue, no de entrenamiento. El motor TensorFold (familia `dsv41`, reimplementación limpia en Zig a partir del código de inferencia MIT de DeepSeek) reparte el modelo en paralelismo tensorial entre dos nodos GB10, usa decodificación especulativa, lee las tablas Engram en tiempo de ejecución desde los shards 47 y 48 originales de DeepSeek, y aplica un kit de kernels específico (tablas RoPE y sesgo de compuerta de visión). La versión v0.7.4 añade semillas aleatorias por petición opcionales (`TF_SEED_RANDOM`), un tope de `top_k` (`TF_TOP_K_MAX`) y un ajuste de `TF_DS_IDX_SPLIT` de 1 a 8192, con 16 flujos de decodificación y 16 peticiones en paralelo.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 2.097.152 posiciones declaradas).
- Procesamiento de imágenes en pipeline imagen-texto a texto (validado con 6/6, 9/9 y 18/18 imágenes en lote).
- Tool calling forzado (10/10 en las compuertas) y automático (6/6), con validación de esquema por fila.
- Salida estructurada (11/11 en las compuertas), incluida en ráfagas y ejecuciones escalonadas.
- Recuperación de información en contexto largo: 3/3 agujas encontradas en un prompt de 1.039.836 tokens.
- Reanudación de estado conservado: reanudación de 1.038.336 tokens en 2,3 s en dos de las tres consultas.
- Decodificación especulativa integrada en el motor.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE grande en hardware de gama profesional: dos DGX Spark con GB10 permiten servir DeepSeek-V4.1-Flash con cuantización EXL3 a 2,5 bpw y paralelismo tensorial, evitando clústeres de GPU de centro de datos.
- Análisis de documentos extensos: con una ventana de más de dos millones de posiciones y recuperación de agujas validada a 1M de tokens, el modelo puede responder preguntas sobre corpus largos manteniendo el estado entre consultas.
- Asistentes con acceso a herramientas: el tool calling forzado y automático validado permite integrar el modelo en flujos donde debe invocar APIs con esquemas estrictos.
- Extracción de datos estructurados: la validación de salida estructurada (11/11) lo hace apto para pipelines que requieren JSON conforme a esquema.
- Procesamiento por lotes de imágenes con texto: el pipeline imagen-texto a texto soporta lotes de cuatro imágenes simultáneas con resultados idénticos a los individuales.
- Servicio conversacional de baja concurrencia: la configuración de referencia sirve 16 peticiones simultáneas con 16 flujos de decodificación, adecuada para equipos pequeños o entornos de investigación.
- Replicación de recetas de inferencia: el kit y las compuertas documentadas permiten verificar un despliegue byte a byte contra la codificación de referencia de DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento del sistema son los siguientes, medidos en la receta v0.7.4:

| Métrica | Valor |
|---|---|
| Prefill | 93.335 tokens a 2.355 tok/s (v0.7.3: 2.364 tok/s) |
| Arranque hasta listo | 31,0 s |
| Reanudación de estado (1.038.336 tokens) | 2,3 s y 2,3 s |
| Memoria libre mínima con prompt de 1M | 15,0 GiB (rank 0) y 18,0 GiB (rank 1) |
| Comprobaciones de compuerta | 43, todas superadas |
| Coincidencia de chat con referencia | 71/71 |

## Requisitos de hardware

- Dos nodos NVIDIA DGX Spark con GPU GB10, conectados para paralelismo tensorial TP2.
- Pesos EXL3 a 2,5 bpw dimensionados para dos nodos; el repositorio de la receta no contiene pesos (0,7 GB de kit).
- Memoria libre observada durante la prueba de 1M de tokens: 15,0 GiB en el nodo del rank 0 y 18,0 GiB en el del rank 1.
- No cabe en una GPU de consumo convencional: requiere el par de nodos GB10 de la receta.
- Despliegue mediante el motor TensorFold (rama `deepseek-v41-zig-tp2`), con `scripts/serve.sh` y `config.env.example`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput de prefill de 2.355 tok/s y 16 peticiones concurrentes según la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-TensorFold-TP2-2xGB10 (esta receta) | no disponible | 2.097.152 | Apache-2.0 (repo), MIT (base) | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | MIT | HuggingFace |
| bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw | no disponible | no disponible | MIT | HuggingFace |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw | no disponible | no disponible | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo el kit de kernels; requiere descargar los pesos EXL3 desde el repositorio asociado y el motor desde GitHub.
- La cuantización a 2,5 bpw puede degradar la calidad frente a los pesos originales; no se publican evaluaciones de calidad en la información disponible.
- El despliegue está atado a hardware específico (2× DGX Spark/GB10) y a un motor propio (TensorFold), sin soporte documentado para stacks estándar.
- La receta está en evolución activa (v0.7.4) con cambios de configuración entre versiones; la reproducibilidad depende de fijar revisión y commit del motor.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de producción.
- La licencia Apache-2.0 del repositorio y la MIT del modelo base permiten uso comercial, pero deben verificarse las condiciones de los repositorios de pesos y del motor.
- El estado de memoria a largo plazo (memtrace) figura como elemento abierto en la propia receta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-TensorFold-TP2-2xGB10
- Receta en GitHub: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
- Instrucciones de ejecución: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/blob/v0.7.4/RUNNING.md
- Mediciones: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/blob/v0.7.4/results/README.md
- Motor TensorFold (rama TP2): https://github.com/bertholomus/TensorFold/tree/deepseek-v41-zig-tp2
- Atribución del motor: https://github.com/bertholomus/TensorFold/blob/deepseek-v41-zig-tp2/ATTRIBUTION.md
- Receta de cuatro nodos: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp4-4xgb10
- TensorFold original: https://github.com/ashhart/TensorFold
- Pesos EXL3 2,5 bpw: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización EXL3 2,9 bpw (Mia-AiLab): https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
