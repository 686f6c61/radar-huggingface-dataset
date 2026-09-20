# burningfeet/backup2026-09-20-mudler-Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled, un fine-tune orientado a razonamiento destilado a partir de trazas de Claude 4.7 Opus sobre la base Qwen 3.6 35B-A3B. La ficha corresponde a una copia de respaldo (backup) publicada por el usuario burningfeet del trabajo de cuantización APEX del equipo de LocalAI, por lo que el artefacto original y la autoría técnica pertenecen a mudler/LocalAI. El modelo combina una arquitectura Mixture-of-Experts con atención híbrida y un encoder de visión incorporado.

El interés práctico del repositorio está en el esquema de cuantización APEX (Adaptive Precision for EXpert Models), que asigna precisión de forma desigual según el rol del tensor dentro de la red: capas de borde en mayor precisión, expertos enrutados de capas intermedias comprimidos de forma agresiva y tensores de atención, SSM/Mamba y expertos compartidos preservados. Con aproximadamente 34,7B parámetros totales y solo unos 3B activos por token, los ficheros van desde 65 GB (F16) hasta 11 GB (tier I-Nano experimental), lo que permite desplegar un MoE de esta clase en GPUs de consumo.

No se han publicado resultados de benchmarks en la información disponible: la propia model card indica explícitamente "Benchmarks pending" para el tier Nano y no aporta cifras para el resto. Cualquier evaluación de calidad debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atención híbrida (atención completa cada 4 capas, lineal/Mamba en el resto) y encoder de visión |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (8 expertos activos de 256 enrutados, más expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tiers APEX: F16 (65 GB), Balanced / I-Balanced (24 GB), Quality / I-Quality (21 GB), Compact / I-Compact (16 GB), I-Mini (13 GB), I-Nano (11 GB, IQ2_XXS en expertos intermedios). Proyector de visión mmproj.gguf (~1 GB) |
| Idiomas soportados | no disponible (el dataset de calibración incluye contenido multilingüe, pero no se detallan idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con mmproj.gguf separado para visión) |
| Capas | 40 |
| Modelo base | lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled |
| Tamano del repo | 227,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture-of-Experts de 40 capas con 256 expertos enrutados más expertos compartidos, de los que solo 8 se activan por token. La atención es híbrida: se aplica atención completa cada cuarta capa y mecanismos lineales/Mamba en el resto, un patrón habitual en modelos MoE recientes para reducir el coste de la ventana de contexto. El modelo incluye un encoder de visión propio, empaquetado como proyector mmproj.gguf, lo que habilita entrada de imágenes además de texto.

El fine-tune parte de Qwen 3.6 35B-A3B y se ha destilado sobre razonamiento de Claude 4.7 Opus según el nombre del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación destacable del repositorio es la estrategia de cuantización APEX: clasifica los tensores por rol y aplica un gradiente de precisión simétrico de 5+5 capas de borde sobre las 40 capas totales. Las variantes con prefijo "I" usan calibración imatrix con un dataset diverso v1.3 (chat, código, razonamiento, multilingüe, tool-calling y Wikipedia). El tier I-Nano lleva los expertos enrutados intermedios a IQ2_XXS (2,06 bits por peso), los tensores cercanos al borde a IQ2_S, los bordes a Q3_K y los expertos compartidos a Q5_K.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito, derivado de la destilación de trazas de Claude 4.7 Opus (el nombre del modelo apunta a un modo de razonamiento tipo reasoning/thinking).
- Comprensión de imágenes mediante el encoder de visión incluido (requiere cargar mmproj.gguf junto al GGUF principal).
- Generación y asistencia de código, apoyada por la calibración imatrix que incluye datasets de código.
- Tool calling y function calling, según la calibración declarada con trazas de tool-calling.
- Trazas agénticas y razonamiento multi-paso, según la calibración declarada con trazas de agentes.
- Capacidades multilingües no cuantificadas en la información disponible.
- Inferencia eficiente: al activar solo ~3B parámetros por token, la velocidad de decodificación es propia de un modelo mucho menor que sus 34,7B totales.

## Casos de uso

- Asistente de razonamiento en local: desplegar el tier I-Compact (16 GB) en una GPU de consumo para tareas de análisis y resolución de problemas paso a paso sin enviar datos a servicios externos.
- Atención al cliente automatizada: modelo conversacional con soporte de tool calling, adecuado para integrarse con APIs internas de consulta de pedidos o incidencias en un pipeline propio.
- Análisis de documentos con imágenes: gracias al proyector mmproj, se pueden procesar capturas, diagramas o formularios escaneados junto con texto en un mismo flujo.
- Asistencia de programación en producción: integrable en pipelines de CI/CD o revisores de código mediante tool calling, con la ventaja de que el tier Compact cabe en una sola GPU de 16-24 GB.
- Agentes multi-paso: la calibración incluye trazas agénticas, lo que lo hace adecuado para orquestación de tareas con varias llamadas a herramientas encadenadas.
- Procesamiento por lotes en servidor con vLLM o LocalAI: usar el tier I-Balanced (24 GB) para maximizar calidad por vatio en una única GPU profesional.
- Investigación sobre cuantización de MoE: el repositorio sirve como material de estudio comparativo entre tiers (F16, Balanced, Quality, Compact, Mini, Nano) manteniendo el mismo modelo base.
- Despliegue en hardware unificado: con tiers de 11-16 GB es viable ejecutarlo en equipos con memoria unificada (por ejemplo, una DGX Spark de 122 GB, el hardware declarado por el cuantizador) o en Macs con Apple Silicon de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica "Benchmarks pending" para el tier Nano y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para el resto de tiers. Tampoco se documentan métricas de perplejidad por tier ni comparaciones cuantitativas con el modelo base en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia (según el fichero GGUF elegido): ~11 GB (I-Nano), ~13 GB (I-Mini), ~16 GB (Compact / I-Compact), ~21 GB (Quality / I-Quality), ~24 GB (Balanced / I-Balanced), ~65 GB (F16). Hay que sumar aproximadamente 1 GB del proyector de visión si se usa entrada de imágenes, más el espacio de caché KV correspondiente a la longitud de contexto.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para los tiers Balanced e I-Balanced; RTX 4080 / 4070 Ti Super (16 GB) para Compact e I-Compact; GPUs de 12-16 GB para Mini y Nano. Para F16 hacen falta A100 80 GB, H100 o varias GPU.
- Cabe en GPU de consumo: sí, en los tiers de 11 a 24 GB, siempre que se ajuste el contexto para no desbordar la VRAM con la caché KV.
- Opciones de despliegue: llama.cpp (base del formato), LocalAI (comando de ejemplo en la model card), Ollama y cualquier runtime compatible con GGUF. Para servir a múltiples usuarios conviene un servidor con gestión de contexto y offload selectivo de capas.
- Latencia y throughput estimados: no disponibles. Al activar solo ~3B parámetros por token, se espera un throughput muy superior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (APEX GGUF, tiers) | ~34,7B | ~3B | no disponible | apache-2.0 | GGUF | 6 tiers de cuantización, visión incluida |
| lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled | ~34,7B | ~3B | no disponible | no disponible | safetensors (precisión completa) | Modelo base del fine-tune; referencia de calidad |
| Qwen3.6 35B-A3B (base sin destilar) | ~35B | ~3B | no disponible | no disponible | no disponible | Base sobre la que se construye el fine-tune |
| Otros MoE de tamano similar (por ejemplo, familia Qwen3-30B-A3B) | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos de benchmarks en la información proporcionada que permitan una comparación rigurosa |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de la calidad del fine-tune ni de la degradación introducida por cada tier de cuantización.
- El tier I-Nano es explícitamente experimental y se apoya en IQ2_XXS (2,06 bpw) en expertos intermedios; se espera pérdida de calidad apreciable, aunque no medida.
- Riesgo de alucinación inherente a los modelos destilados sobre trazas de razonamiento de otro modelo; no se documenta ninguna evaluación de fidelidad factual.
- Longitud de contexto no especificada: no se puede planificar despliegues con ventanas largas sin medirla empíricamente.
- Idiomas soportados no especificados; la calibración incluye datos multilingües, pero no se indica cobertura ni calidad por idioma.
- Licencia apache-2.0 declarada en este repositorio, pero el modelo base lordx64/... no expone licencia en la información disponible; conviene verificar los términos reales de la cadena de derivación antes de un uso comercial.
- Este repositorio es una copia de respaldo de un tercero (burningfeet) fechada en 2026-09-20; los ficheros originales y su mantenimiento corresponden a mudler/LocalAI. Para producción es preferible referenciar el repositorio original.
- El repositorio ocupa 227,6 GB: la descarga de varios tiers a la vez es costosa en disco y ancho de banda.
- Los avisos de financiación y la estructura de la model card corresponden al autor original de la cuantización, no al publicador de esta copia.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/burningfeet/backup2026-09-20-mudler-Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-GGUF
- Modelo base (fine-tune de razonamiento): https://huggingface.co/lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled
- Repositorio original de cuantización (mudler): https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-GGUF
- Proyecto LocalAI: https://github.com/mudler/LocalAI
- Proyecto APEX: https://github.com/mudler/apex-quant
- Informe técnico de APEX: https://github.com/mudler/apex-quant/blob/main/paper/APEX_Technical_Report.pdf
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Proyector de visión (mradermacher): https://huggingface.co/mradermacher

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos eran contenido no relacionado y no verificable, por lo que se han descartado.
