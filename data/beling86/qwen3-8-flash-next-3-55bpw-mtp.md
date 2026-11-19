# Beling86/Qwen3.8-Flash-Next-3.55BPW-MTP

## Resumen

Qwen3.8-Flash-Next-3.55BPW-MTP es una cuantización de precisión mixta generada con AutoRound sobre el modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Beling86 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint comprimido pensado para servir el modelo original en vLLM con un coste de memoria muy inferior: los pesos no pertenecientes a la embedding por capa (PLE) ocupan 51,99 GiB con una media de 3,55 bits por peso, mientras que la tabla PLE de 51,2 mil millones de parámetros se conserva en el FP8 original de Qwen (unos 47,7 GiB) y se descarga a memoria de host mediante vLLM.

El modelo base es un transformer de tipo Mixture of Experts con atención lineal GDN, atención QSA, hiper-conexiones y una embedding por capa (PLE) de gran tamaño. El checkpoint cuantizado conserva 15.545.637.795 parámetros en safetensors según los metadatos del repo, aunque la model card describe una arquitectura con expertos enrutados en 46 capas y una PLE de 51,2 B de parámetros que se sirve aparte en FP8. La cuantización elimina la visión y el módulo MTP (multi-token prediction), por lo que el resultado es un modelo exclusivamente de texto.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva (W3A16 en expertos, W8A16 en proyecciones de atención) con métricas de fidelidad frente a BF16 publicadas por el autor; por otro, advierte de un problema conocido en vLLM con capas MoE fusionadas que requiere un parche incluido en el repositorio. Es un artefacto de despliegue, no un modelo listo para usar sin configuración adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal GDN, atención QSA, hiper-conexiones y embedding por capa (PLE); texto únicamente (visión y MTP eliminados) |
| Parametros totales | 15.545.637.795 según safetensors del repo; la PLE de 51,2 B se sirve aparte en FP8 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta AutoRound: W3A16 (grupo 128, simétrico) en expertos enrutados de las 46 capas; W8A16 (grupo 128, simétrico) en atención lineal GDN y proyecciones QSA; BF16 en indexer, decay/gate, hiper-conexiones, expertos compartidos, routers, embeddings, LM head y norms; PLE en FP8 E4M3 con escala global |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`), con shards `ple-*.safetensors` para la PLE |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento. El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con 46 capas de expertos enrutados, atención lineal GDN y atención QSA, además de hiper-conexiones y una embedding por capa (PLE) de 51,2 mil millones de parámetros. La cuantización se realizó con AutoRound 0.16.1 (SignRound), 400 iteraciones por bloque y 256 muestras de calibración de 8192 tokens cada una, con una mezcla de chat, código, razonamiento, contexto largo y prosa de wikitext, usando la plantilla de chat de producción y `best-MSE=True`. El formato resultante es `auto_round:auto_gptq`.

La innovación técnica principal es el esquema de precisión mixta: los expertos enrutados se comprimen a 3 bits (W3A16) mientras que las proyecciones de atención se mantienen a 8 bits (W8A16) y los componentes sensibles (routers, normas, embeddings, LM head) permanecen en BF16. La PLE no se cuantiza: se conserva la tabla FP8 E4M3 oficial de Qwen con su escala global y vLLM la descarga a memoria de host. El autor publica métricas de fidelidad frente a BF16 mediante KL de vocabulario completo en un conjunto retenido de 24 secuencias de 1024 tokens, sin inyección de PLE (la tabla BF16 no cabe en el host de cuantización), por lo que la métrica mide solo la cuantización de los bloques del transformer: KL media de 0,15897, mediana 0,01133, P99 2,4166, acuerdo top-1 del 90,26 % y perplejidad de 3,524 a 3,537. Por dominio, el mejor acuerdo top-1 se da en código (94,68 %) y el peor en chat (86,70 %).

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de producción utilizada durante la calibración.
- Razonamiento y matemáticas: la calibración incluye dominios de razonamiento y matemáticas, y las métricas de fidelidad reportan acuerdo top-1 del 93,59 % en matemáticas.
- Generación de código: acuerdo top-1 del 94,68 % frente a BF16 en el dominio de código.
- Contexto largo: las muestras de calibración son de 8192 tokens e incluyen datos de contexto largo; la longitud máxima de contexto del modelo no se especifica en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el checkpoint elimina explícitamente visión y MTP, por lo que no hay modo thinking documentado ni entrada multimodal.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en infraestructura con VRAM limitada: el checkpoint reduce los pesos no PLE a 51,99 GiB a 3,55 bits por peso, lo que permite servir el modelo en una GPU de 80 GB si se descarga la PLE a memoria de host mediante `--engram-config '{"cpu_offload": true, "use_thp": true}'` en vLLM.
- Servicio de chat conversacional en producción: la calibración usó la plantilla de chat de producción y el dominio chat mantiene un acuerdo top-1 del 86,70 % frente a BF16, suficiente para asistentes multi-turno donde no se requiere fidelidad bit a bit.
- Asistencia de código en pipelines de CI/CD: el dominio de código es el que mejor preserva la distribución (acuerdo top-1 del 94,68 %, KL mediana 0,00040), lo que lo hace adecuado para autocompletado, revisión de parches y generación de tests en herramientas internas.
- Razonamiento matemático y resolución de problemas: el dominio matemático conserva un acuerdo top-1 del 93,59 % con KL mediana de 0,00353, útil en tutores automáticos o verificación de cálculos donde el coste de memoria es crítico.
- Procesamiento de documentos largos y prosa: las muestras de calibración incluyen contexto largo y prosa de wikitext; el dominio de prosa muestra el mayor acuerdo top-1 de la versión final (89,49 %), adecuado para resumen y extracción sobre textos extensos.
- Investigación en cuantización: el repositorio publica la progresión de tres versiones (v1, v2, v3) con métricas KL, P99 y acuerdo top-1 por dominio, lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de la calibración y el número de iteraciones en AutoRound.
- Evaluación comparativa de kernels: el autor indica que los expertos de 2/3 bits están pensados para los kernels Humming y las proyecciones de 8 bits para Marlin, por lo que sirve para probar el rendimiento de estos kernels en vLLM frente a alternativas.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K) sino métricas de fidelidad de la cuantización frente a BF16 mediante KL de vocabulario completo en 24 secuencias de 1024 tokens (24.552 posiciones), sin inyección de PLE:

| Dominio | Posiciones | KL media | KL mediana | KL P99 | Acuerdo top-1 | PPL bf16 → quant |
|---|---:|---:|---:|---:|---:|---:|
| all | 24552 | 0,15897 | 0,01133 | 2,4166 | 90,26 % | 3,524 → 3,537 |
| chat | 10230 | 0,17180 | 0,03464 | 2,0036 | 86,70 % | 7,864 → 7,702 |
| code | 5115 | 0,13346 | 0,00040 | 2,7081 | 94,68 % | 1,806 → 1,836 |
| math | 5115 | 0,10857 | 0,00353 | 2,1411 | 93,59 % | 2,302 → 2,307 |
| prose | 4092 | 0,22178 | 0,00655 | 2,9360 | 89,49 % | 1,861 → 1,957 |

P99.9 KL 5,9165; máximo 17,358.

Progresión de versiones de la cuantización (3,48 BPW en las versiones iniciales):

| Versión | Run | Config | KL media | P99 KL | P99.9 KL | Top-1 | Chat top-1 | Code top-1 | Math top-1 | Prose top-1 | PPL bf16 → quant |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v1 (baseline) | 20261114-213016 | 104 muestras, 250 iters, final-iter | 0,11572 | 1,5207 | 4,5617 | 88,78 % | 85,61 % | 94,43 % | 92,98 % | 84,38 % | 5,431 → 5,677 |
| v2 | run-20261116-132458 | 236 muestras, 400 iters, best-MSE=True | 0,10026 | 1,4335 | 4,2587 | 90,47 % | 89,32 % | 94,41 % | 93,76 % | 84,31 % | 5,481 → 5,608 |
| v3 (final) | run-20261118-162556 | 256 muestras, 400 iters, best-MSE=True | 0,15897 | 2,4166 | 5,9165 | 90,26 % | 86,70 % | 94,68 % | 93,59 % | 89,49 % | 3,524 → 3,537 |
| Δ (v1 → v3) | — | — | −17,2 % | −11,7 % | −7,6 % | +1,75 pp | +3,15 pp | +0,55 pp | +1,08 pp | +0,64 pp | — |

## Requisitos de hardware

- VRAM estimada: los pesos no PLE ocupan 51,99 GiB en el checkpoint; la PLE en FP8 añade unos 47,7 GiB que vLLM descarga a memoria de host, por lo que se necesita RAM de host suficiente además de la VRAM para los pesos del transformer.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB o H100) es el escenario natural para alojar los 51,99 GiB de pesos no PLE; no se documenta soporte para GPUs de menor capacidad.
- GPU de consumo: no disponible; el tamaño de los pesos no PLE excede la VRAM de las RTX 4090 (24 GB) y similares.
- Opciones de despliegue: vLLM es el único runtime documentado, con el comando `vllm serve Beling86/Qwen3.8-Flash-Next-3.55BPW-MTP --trust-remote-code --dtype bfloat16 --engram-config '{"cpu_offload": true, "use_thp": true}'`. Requiere ejecutar antes `vllm-patch.py` con el Python del entorno de vLLM; el parche es idempotente, conserva copias `.orig` y admite `--check` y `--revert`.
- Kernels: los expertos de 2/3 bits están pensados para los kernels Humming y las proyecciones de 8 bits para Marlin.
- Latencia y throughput: no disponibles; el autor pide a quien sirva el modelo que reporte los resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-3.55BPW-MTP (este) | 15.545.637.795 en safetensors; PLE de 51,2 B en FP8 aparte | no disponible | W3A16 / W8A16 / BF16 / FP8 mixta | no disponible | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 (original) | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de especificaciones completas del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: hereda los sesgos y limitaciones del modelo base Qwen/Qwen3.8-Flash-Next, que no están documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; las métricas publicadas miden fidelidad frente a BF16, no veracidad.
- La evaluación de fidelidad se hizo sin inyección de PLE (la tabla BF16 no cabe en el host de cuantización), por lo que las métricas KL solo cubren la cuantización de los bloques del transformer y no el efecto completo del checkpoint en producción.
- El dominio de chat es el que peor conserva la distribución (acuerdo top-1 del 86,70 %, KL media 0,17180), con una cola de divergencia notable: P99 KL de 2,4166 y máximo de 17,358.
- vLLM estándar falla al construir el modelo: el parser INC lee los bits por capa de una capa MoE fusionada solo si el nombre de clase contiene `fusedmoe`, pero la clase actual es `RoutedExperts`, de modo que todas las capas MoE caen al `bits: 4` global y los expertos de 2/3 bits se asignan con contenedores de 4 bits, provocando OOM de CUDA antes de leer ningún peso. Es obligatorio aplicar `vllm-patch.py`.
- El parche KDA específico de Ling incluido en el script no aplica a este modelo y reporta "not applicable".
- Visión y MTP eliminados: no hay entrada multimodal ni decodificación multi-token especulativa.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El autor indica que el checkpoint está pensado para los kernels Humming y Marlin, y pide reportar el comportamiento al servirlo; no hay datos de latencia ni throughput publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Qwen3.8-Flash-Next-3.55BPW-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Script de parche vLLM: `vllm-patch.py` incluido en el repositorio del checkpoint
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
