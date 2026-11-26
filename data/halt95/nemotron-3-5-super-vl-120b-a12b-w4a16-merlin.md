# halt95/Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin

## Resumen

Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo vision-lenguaje NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicado por el desarrollador independiente halt95. Se trata de un modelo de mezcla de expertos (MoE) de 128.958.078.472 parámetros totales con 12B activos por token, que combina capas Mamba-2, atención y MoE junto con un codificador visual C-RADIO. Su propósito es hacer viable el contexto completo de 1.048.576 tokens sobre cuatro GPU de 24 GB, reduciendo el peso de 232 GiB a 68 GiB.

La relevancia de esta ficha radica en que demuestra una ruta de despliegue de un VLM de 120B en hardware Ampere de consumo profesional (RTX 3090), algo impensable con los pesos BF16 originales. La cuantización es selectiva: expertos enrutados en INT4, proyecciones Mamba-2 en INT8, y atención, expertos compartidos y torre visual en BF16. Se sirve mediante Merlin, un fork de vLLM 0.33.0 optimizado para Ampere y Ada con paralelismo de expertos, RecoverSSM y decodificación especulativa MTP.

Es un derivado independiente no revisado ni respaldado por NVIDIA. La licencia es OpenMDW 1.1 y el modelo soporta inglés, español, francés, alemán, italiano y japonés. Con 276 descargas y 3 likes en el momento de la consulta, es un artefacto de nicho orientado a experimentación con hardware limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 + atención + MoE, con codificador visual C-RADIO (nemotron_h_omni) |
| Parámetros totales | 128.958.078.472 |
| Parámetros activos | 12B por token (MoE con 512 expertos enrutados por capa) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | W4A16: expertos enrutados INT4 (grupo 128, simétrico RTN); Mamba-2 in_proj/out_proj INT8 por canal; cabeza MTP INT4/INT8; atención, expertos compartidos, routers, conv1d, embeddings, lm_head y torre visual en BF16; KV cache FP8 E4M3 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (license: other) |
| Formato de pesos | safetensors (63 fragmentos, 67,9 GiB), compressed-tensors, custom_code |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida que intercala capas Mamba-2 con capas de atención y capas MoE. Cada capa MoE contiene 512 expertos enrutados, de los cuales se activan 12B parámetros por token. Incorpora además una cabeza MTP (multi-token prediction) para decodificación especulativa y un codificador visual C-RADIO que habilita la entrada image-text-to-text. La innovación clave del checkpoint es la cuantización selectiva: solo los expertos enrutados se comprimen a INT4, mientras los componentes sensibles a la precisión (atención, expertos compartidos, routers, torre visual) permanecen en BF16, preservando calidad donde más importa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card del autor no detalla el proceso de entrenamiento del modelo base. La cuantización se realizó sin datos de calibración (round-to-nearest simétrico), según indica la propia card. El motor Merlin añade RecoverSSM para Mamba-2 y decodificación especulativa MTP, con KV cache en FP8 E4M3 configurado en tiempo de servicio.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) mediante el codificador visual C-RADIO.
- Razonamiento multi-paso con modo "thinking" completo (la plantilla no expone niveles de esfuerzo).
- Decodificación especulativa mediante cabeza MTP, que acelera la generación.
- Soporte de contexto largo de hasta 1M tokens, con pool KV en VRAM.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Servicio concurrente de múltiples agentes: la card reporta 8 conversaciones de 16K simultáneas más 8 seguimientos de 512 tokens.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte de audio.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar hasta 1M tokens de contexto, lo que permite ingerir informes completos con figuras y tablas en una sola pasada sin fragmentación.
- Agentes conversacionales concurrentes: con 444 tok/s agregados para 8 agentes simultáneos (thinking activado), es adecuado para plataformas de atención al cliente que mantienen múltiples sesiones de 16K tokens en paralelo.
- Procesamiento de imágenes en pipelines de investigación: la entrada image-text-to-text permite describir, clasificar o extraer información de capturas, diagramas o documentos escaneados.
- Despliegue en hardware limitado: al caber en cuatro RTX 3090 (68 GiB), permite a laboratorios sin A100/H100 experimentar con un VLM de 120B a contexto completo.
- Generación de código asistida con contexto de repositorio: el contexto de 1M tokens admite cargar ficheros y documentación extensos, aunque no se documenta tool calling para integración en CI/CD.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de W4A16 frente al BF16 original en tareas de visión y lenguaje.
- Investigación en decodificación especulativa: la cabeza MTP y el motor Merlin permiten estudiar el impacto de la decodificación especulativa en latencia y throughput.

## Benchmarks y rendimiento

La model card proporciona métricas de rendimiento del motor, no benchmarks de calidad (MMLU, HumanEval, GSM8K). Se presentan los datos de velocidad reportados:

| Métrica | Valor | Condiciones |
|---|---|---|
| Decodificación (1 stream) | 95,3–106,0 tok/s (mediana ~101 tok/s) | 261.888 tokens de prompt + 128 de salida, thinking activado, 4× RTX 3090 |
| Prefill | 5.082 tok/s | Prompt en frío de 106.725 tokens |
| Agentes concurrentes | 444 tok/s agregados | 8 conversaciones de 16K + 8 seguimientos de 512 tokens |
| Pool KV | 1.856.367 tokens en VRAM | FP8, contexto de 1M configurado |
| Sesiones simultáneas | 1 sesión de 1M o 5 de 262K | Según la card |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 68 GiB de pesos, desplegables en 4 GPU de 24 GB (96 GB totales) con el pool KV en VRAM.
- GPU recomendadas: 4× RTX 3090 (configuración medida); el motor incluye perfiles para RTX 4090, tarjetas de estación de trabajo de 48 GB, A100 y CMP 170HX.
- Cabe en GPU de consumo: sí, en 4× RTX 3090 sin NVLink (P2P activado), a 220 W.
- Opciones de despliegue: Merlin 3.0.2.2 (fork de vLLM 0.33.0) con paralelismo de expertos; no se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: ~101 tok/s en decodificación a 262K de contexto; 5.082 tok/s en prefill de 100K; 444 tok/s agregados con 8 agentes.
- Requiere el módulo opcional "gpu-unlock" de Zagitta para el perfil medido en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin | 128,9B totales / 12B activos | 1M | W4A16 | OpenMDW 1.1 | 4× 24 GB |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (base) | 128,9B totales / 12B activos | 1M | BF16 | OpenMDW 1.1 | 232 GiB, requiere GPU de gran memoria |
| Alternativas de VLM MoE de ~100B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Derivado independiente: no está fabricado, revisado ni respaldado por NVIDIA; la calidad de la cuantización no ha sido validada por el autor original.
- Cuantización sin calibración: los expertos INT4 usan round-to-nearest simétrico sin datos de calibración, lo que puede degradar la precisión frente al BF16 original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Limitaciones de idioma: solo se declaran seis idiomas (en, es, fr, de, it, ja); el rendimiento fuera de ellos no está garantizado.
- Restricciones de licencia: OpenMDW 1.1; deben revisarse los términos para uso comercial, ya que la licencia se marca como "other".
- Dependencia de hardware específico: el rendimiento medido se obtuvo en RTX 3090 con el módulo gpu-unlock; los perfiles para Ada están en prueba o sin probar.
- Dependencia del motor: requiere Merlin (fork de vLLM), lo que limita la portabilidad a otros stacks de inferencia.
- Contexto de 1M: el pool KV de 1.856.367 tokens permite una sola sesión de 1M o cinco de 262K, lo que restringe la concurrencia a contexto máximo.

## Enlaces

- Hugging Face: https://huggingface.co/halt95/Nemotron-3.5-Super-VL-120B-A12B-W4A16-Merlin
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Repositorio del motor Merlin: https://github.com/halt95/merlin-engine
- Bench card: https://github.com/halt95/merlin-engine/blob/main/models/nemotron-super-vl/benchmarks/2026-11-12/BENCH-CARD.md
- Matriz de hardware: https://github.com/halt95/merlin-engine/blob/main/docs/merlin/hardware-matrix.md
- Módulo gpu-unlock: https://github.com/halt95/merlin-engine/blob/main/docs/merlin/hardware-matrix.md#optional-host-upgrade-gpu-unlock-geforce-ga102
- Discord: https://discord.gg/jVDYAwdGzt
- Ko-fi: https://ko-fi.com/halt95
