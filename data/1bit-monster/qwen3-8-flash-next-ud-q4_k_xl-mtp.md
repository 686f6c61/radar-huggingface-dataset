# 1bit-MONSTER/Qwen3.8-Flash-Next-UD-Q4_K_XL-MTP

## Resumen

Qwen3.8-Flash-Next-UD-Q4_K_XL-MTP es un paquete listo para ejecutar publicado por 1bit-MONSTER que combina la cuantización dinámica UD-Q4_K_XL de Unsloth con su cabeza de predicción multi-token (MTP) correspondiente para Qwen3.8 Flash-Next, la variante MoE de aproximadamente 175 000 millones de parámetros con 512 expertos y top-10 del modelo Qwen3.8. El repositorio no introduce pesos nuevos: empaqueta en un solo bundle los ficheros que Unsloth ya publica por separado en `unsloth/Qwen3.8-Flash-Next-GGUF` (cuatro shards del modelo base en GGUF más un draft head MTP en Q8_0) y documenta la combinación de flags que el autor midió como el punto óptimo de velocidad en hardware de consumo AMD (iGPU Strix Halo).

El problema que resuelve es de ingeniería de despliegue: un MoE de este tamaño en cuantización Q4 requiere del orden de 110 GB residentes para los pesos, y la decodificación autoregresiva convencional resulta lenta en iGPU. El autor reporta 26 tok/s en decodificación residente con UD-Q4_K_XL y 40–49 tok/s al emparejarlo con la cabeza MTP mediante decodificación especulativa (`--spec-type draft-mtp`, `--spec-draft-n-max 3`), la mayor aceleración medida dentro de la familia Qwen3.8.

Es relevante ahora porque demuestra una ruta práctica para servir un modelo MoE de escala ~175B en hardware consumer con memoria unificada, a costa de asumir limitaciones claras: dependencia de una rama no fusionada de llama.cpp (`qwen4exp/mtp`) para reproducir las cifras, licencia Qwen Community 1.0 con carve-outs comerciales y ausencia total de datos de benchmarks de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 512 expertos, top-10; Qwen3.8 Flash-Next |
| Parámetros totales | 176 943 899 520 (~176,9 B) |
| Parámetros activos | no disponible (la model card indica 512 expertos top-10, sin cifra de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q4_K_XL (Dynamic 2.0, modelo base); Q8_0 (cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF (4 shards para el modelo base + 1 fichero MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.8: 512 expertos con enrutamiento top-10, lo que sitúa el total en ~176,9 B de parámetros según los safetensors del modelo original. El repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO); esos datos corresponden a la model card original de Qwen3.8 Flash-Next, no incluida en la información disponible.

La innovación técnica del bundle es la decodificación especulativa mediante una cabeza de predicción multi-token (MTP) entrenada por Unsloth y cuantizada en Q8_0. En lugar de un modelo draft independiente, se usa la cabeza MTP nativa del modelo, lo que permite generar varios tokens candidatos por paso y verificarlos en paralelo. El autor reporta que `--spec-draft-n-max 3` supera a `5`, y que la carga del draft head requiere `-ngld 99` (todas las capas del draft en GPU). Como caveat documentado, la versión upstream de llama.cpp en el momento de la medición (2026-09-24) no cargaba la cabeza MTP standalone (`check_tensor_dims: output_hc_norm.weight not found`); fue necesario compilar desde la rama `qwen4exp/mtp` de `danielhanchen/llama.cpp`. El motor propio del autor integró el fix upstream (`ggml-org#28243`) en su PR #110, pero esas cifras no se han re-verificado contra ese build.

## Capacidades

- Generación de texto conversacional en formato chat (tag `conversational`), con soporte de plantilla Jinja (`--jinja`).
- Razonamiento y generación de código heredados del modelo base Qwen3.8 Flash-Next; no se detallan capacidades específicas en la información disponible.
- Decodificación especulativa con cabeza MTP para acelerar la inferencia (hasta ~1,9x según las mediciones del autor: 26 tok/s → 40–49 tok/s).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere exposición vía API compatible con OpenAI en el motor 1bit.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat conversacional en hardware consumer con memoria unificada: el bundle está medido en iGPU Strix Halo con ~110 GB residentes, lo que permite desplegar un MoE de ~176,9 B en una máquina de escritorio de gama alta en lugar de un servidor con múltiples A100/H100.
- Aceleración de inferencia en producción mediante decodificación especulativa: usar la cabeza MTP con `--spec-draft-n-max 3` eleva el throughput de 26 a 40–49 tok/s, lo que hace viable la atención interactiva con latencia percibida aceptable en un modelo de esta escala.
- Evaluación y benchmarking de cuantizaciones dinámicas: el paquete sirve como referencia reproducible para comparar UD-Q4_K_XL frente a otras cuantizaciones de Unsloth sobre el mismo modelo base, con flags documentados.
- Ajuste de presupuesto de memoria en despliegues con RAM limitada: el autor documenta `-ot per_layer_token_embd=CPU` para liberar ~27 GB (a costa de bajar a 17–23 tok/s) y `--cpu-moe` para reducir aún más memoria (10–17 tok/s), lo que permite adaptar el despliegue a máquinas con menos de 110 GB.
- Prototipado de pipelines con API compatible con endpoints: al ser `endpoints_compatible`, puede integrarse en aplicaciones que ya consumen APIs estilo OpenAI sin reescribir el cliente.
- Investigación sobre decodificación especulativa con cabezas MTP nativas: el bundle y sus flags documentados permiten reproducir y extender experimentos sobre draft heads integrados en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son de velocidad de inferencia, medidos por el autor en iGPU Strix Halo:

| Configuración | Throughput (tok/s) | Memoria residente |
|---|---|---|
| UD-Q4_K_XL residente, sin MTP | ~26 | ~110 GB |
| UD-Q4_K_XL + MTP (`--spec-draft-n-max 3`) | 40–49 | ~110 GB |
| UD-Q4_K_XL + `-ot per_layer_token_embd=CPU` | 17–23 | ~83 GB (libera ~27 GB) |
| UD-Q4_K_XL + `--cpu-moe` | 10–17 | no disponible |

Nota: `--spec-draft-n-max 5` resultó más lento que 3 según el autor. Las cifras con MTP se obtuvieron con la rama `qwen4exp/mtp` de llama.cpp; no se han re-verificado con el motor 1bit nativo tras el fix upstream.

## Requisitos de hardware

- VRAM/RAM estimada: ~110 GB residentes para los pesos en UD-Q4_K_XL (memoria unificada en el caso medido); el repo completo ocupa 115,5 GB. Con `-ot per_layer_token_embd=CPU` se liberan ~27 GB.
- GPU recomendadas: el autor midió en iGPU AMD Strix Halo. Para GPUs discretas no hay datos publicados; un MoE de ~176,9 B en Q4_K_XL no cabe en una sola GPU de 80 GB (A100/H100) sin offload parcial de expertos.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; requiere memoria unificada de ~128 GB o configuraciones multi-GPU con offload.
- Opciones de despliegue: llama.cpp (rama `qwen4exp/mtp` de `danielhanchen/llama.cpp` para MTP; upstream tras el fix `ggml-org#28243`) y el motor 1bit (`1bit serve --mtp`). vLLM, TGI y Ollama no están documentados en la información disponible.
- Latencia y throughput: 26 tok/s sin MTP, 40–49 tok/s con MTP (`--spec-draft-n-max 3`), 17–23 tok/s con embeddings en CPU, 10–17 tok/s con `--cpu-moe`, todos medidos en Strix Halo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-UD-Q4_K_XL-MTP (este) | ~176,9 B (MoE, 512 expertos top-10) | no disponible | UD-Q4_K_XL + MTP Q8_0 | Qwen Community 1.0 | GGUF, 4 shards + MTP |
| unsloth/Qwen3.8-Flash-Next-GGUF | ~176,9 B (mismo base) | no disponible | Dynamic 2.0 (varias) | Qwen Community 1.0 | GGUF, pesos separados |
| Qwen3.8 Flash-Next (original) | ~176,9 B (MoE) | no disponible | safetensors (BF16/FP8 no confirmado) | Qwen Community 1.0 | Pesos originales |

La comparativa se limita al mismo modelo base en distintos empaquetados, porque la información disponible no incluye datos de rendimiento de alternativas de otros fabricantes. No disponible comparación con modelos de otros proveedores.

## Limitaciones y advertencias

- Licencia Qwen Community 1.0, no Apache 2.0: permisiva para la mayoría de usos, incluido comercial, pero exige atribución prominente del nombre del modelo al superar 100 M de MAU o 20 M USD de ingresos mensuales, y requiere licencia separada para negocios de "Model as a Service" o "AI Work Assistant". Leer el texto completo antes de uso comercial.
- Dependencia de una rama no fusionada de llama.cpp (`qwen4exp/mtp`) para reproducir las cifras con MTP; el camino nativo del motor 1bit está documentado como "should work, not yet re-verified".
- Riesgo de OOM: el autor menciona haber sufrido OOM en una máquina compartida durante la medición; se necesitan ~110 GB residentes y margen adicional.
- Sin datos de benchmarks de calidad, sesgos, alucinación o rendimiento multilingüe en la información disponible; no se puede evaluar la fiabilidad del modelo base a partir de este repositorio.
- El repositorio no introduce pesos nuevos ni mejoras de calidad: es un bundle de conveniencia. Cualquier mejora o regresión del modelo base afecta directamente al paquete.
- Longitud de contexto no documentada, lo que impide planificar casos de uso que dependan de ventanas largas.
- Solo 408 descargas y 1 like en el momento de la consulta: validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.8-Flash-Next-UD-Q4_K_XL-MTP
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Familia 1bit-MONSTER: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada 1bit-MONSTER: https://huggingface.co/1bit-MONSTER#start-here
- Rama llama.cpp con soporte MTP: `danielhanchen/llama.cpp`, rama `qwen4exp/mtp` (no se dispone de URL directa en la información proporcionada)
- Fix upstream de carga del draft head: `ggml-org#28243` (no se dispone de URL directa en la información proporcionada)
- Licencia Qwen Community 1.0: fichero `LICENSE` del repositorio
