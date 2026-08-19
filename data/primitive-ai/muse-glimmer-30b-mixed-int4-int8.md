# primitive-ai/Muse-Glimmer-30B-mixed-INT4-INT8

## Resumen

Muse-Glimmer-30B-mixed-INT4-INT8 es una cuantización mixta de precisión del modelo vision-language Muse-Glimmer-30B, desarrollada por primitive-ai para reducir el peso de 55,5 GiB (BF16) a 20,4 GiB, manteniendo la torre de visión en BF16 y cuantizando únicamente las proyecciones del modelo de lenguaje con INT4 e INT8. El modelo base, creado por Meta Superintelligence Labs, es un modelo denso de 30.000 millones de parámetros con encoder de visión ViT-G/14 y contexto de 128K, optimizado para agentes locales y tool calling. Esta versión cuantizada permite ejecutar el modelo en GPUs de 24 GiB con un throughput hasta 2,81 veces superior al BF16 en inferencia de un solo flujo, usando vLLM estándar sin parches.

La relevancia de este artefacto radica en que acerca un modelo multimodal de alto rendimiento a hardware de consumo, manteniendo la precisión dentro del margen de error estadístico respecto al original. La cuantización sigue un esquema no uniforme: las proyecciones MLP gate/up usan INT4 con grupo 64, las down, atención y lm_head usan INT4 con grupo 32, y las proyecciones de salida de atención y las capas profundas usan INT8 por canal. El resultado es un modelo de 20,4 GiB con 5,89 bits por peso, listo para servir con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision ViT-G/14 (vision-language) |
| Parametros totales | 7.389.644.098 (segun safetensors del repo cuantizado; el modelo base declara ~30B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K (segun documentacion del modelo base) |
| Tipos de cuantizacion | INT4 (grupo 64 y 32) e INT8 (por canal), mixto; vision tower, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de 29,6B parámetros activos con un encoder de visión ViT-G/14, entrenado por Meta Superintelligence Labs mediante destilación desde Muse Spark. Está diseñado para tareas de agente locales, con soporte nativo para tool calling en formato XML (ATEM) y razonamiento con canal de pensamiento separado. La cuantización realizada por primitive-ai no altera la arquitectura, sino que aplica una mezcla de INT4 e INT8 a las proyecciones del modelo de lenguaje, dejando intacta la torre de visión, los embeddings y las normas. La calibración se hizo sobre 100 muestras de texto UltraChat, y los pesos se empaquetaron con la herramienta `pack-quantized` de compressed-tensors, sin kernels personalizados ni runtime modificado. El resultado es un modelo que se sirve directamente con `vllm serve`, aunque sin el parser de razonamiento `muse_glimmer` (el thinking aparece inline en `content`).

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto).
- Soporte de tool calling / function calling mediante llamadas ATEM en XML, nativo del modelo base.
- Razonamiento multi-step y canal de pensamiento (channel-scoped reasoning) cuando se habilita, aunque en esta build de vLLM llega inline.
- Capacidades de agente: ejecución de tareas largas, recuperación de fallos y uso de herramientas externas.
- Multilingüe (idiomas no especificados en la documentación disponible).
- Comprensión de imágenes con encoder ViT-G/14, manteniendo la precisión visual en BF16.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K) y consultar bases de conocimiento o APIs mediante tool calling, gracias a su ventana de contexto y soporte de ATEM.
- Análisis de imágenes y documentos: al aceptar entrada visual, puede extraer información de capturas, diagramas o formularios escaneados, integrándose en pipelines de procesamiento documental.
- Agentes autónomos en local: su tamaño reducido (20,4 GiB) permite ejecutarlo en una GPU de 24 GiB, ideal para asistentes personales que operan sin conexión o con privacidad estricta.
- Generación de código con contexto visual: puede razonar sobre diagramas de arquitectura o capturas de errores para generar o corregir código, usando su capacidad de tool calling para ejecutar pruebas.
- Automatización de tareas de oficina: resumen de correos, redacción de informes y extracción de datos de imágenes, con la posibilidad de encadenar múltiples pasos mediante razonamiento multi-step.
- Sistemas de recomendación multimodal: análisis de imágenes de productos junto con texto para sugerir artículos, aprovechando el contexto largo para mantener historial de usuario.

## Benchmarks y rendimiento

La model card proporciona mediciones propias sobre una suite de 1.170 muestras en 9 benchmarks públicos (cap 3072, temp 1.0, top_p 0.95, top_k 64), comparando este repo cuantizado con la referencia BF16 en una RTX PRO 6000 Blackwell:

| config | tamano | acc @ conc 32 | tok/s @ conc 32 | acc @ conc 1 | tok/s @ conc 1 |
|---|---|---|---|---|---|
| BF16 | 55,5 GiB | 86,8 | 656,9 | 85,0 | 25,4 |
| **este repo** | **20,4 GiB** | **85,1** | **1467,7 (2,23×)** | **86,7** | **71,3 (2,81×)** |

La latencia por token a concurrencia 32 es de 21,8 ms frente a 48,7 ms del BF16. La diferencia de precisión a concurrencia 32 es de 1,7 puntos (≈1,2 errores estándar), que el autor reporta como empate estadístico, aunque reconoce que la calibración se hizo con solo 100 muestras y una calibración más larga podría cerrar la brecha. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización.

## Requisitos de hardware

- VRAM estimada: 20,4 GiB para los pesos, más overhead de KV cache y activaciones; cabe en GPUs de 24 GiB con margen para contexto moderado.
- GPUs recomendadas: RTX 4090, RTX 6000 Ada, A5000, L4, o cualquier GPU con 24 GiB o más. También funciona en A100/H100 con mayor margen.
- En consumer GPU: sí, en tarjetas de 24 GiB como la RTX 4090, siempre que se limite la longitud de contexto para dejar espacio a la KV cache.
- Opciones de despliegue: vLLM (recomendado, soporta compressed-tensors), también puede cargarse con transformers para inferencia, aunque sin las optimizaciones de vLLM.
- Latencia y throughput: 71,3 tok/s en single-stream y 1467,7 tok/s a concurrencia 32, medidos en RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tamano (cuantizado) | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (BF16) | ~30B | 128K | Apache 2.0 | 55,5 GiB | Referencia original, mayor VRAM |
| **Este repo (INT4/INT8)** | ~30B (base) | 128K | Apache 2.0 | 20,4 GiB | 2,7× menor, rendimiento similar |
| Llama 3.2 11B Vision | 11B | 128K | Llama 3.2 | ~22 GiB (BF16) | Menor capacidad, sin tool calling nativo ATEM |
| Qwen2.5-VL-32B | 32B | 32K | Apache 2.0 | ~65 GiB (BF16) | Mayor tamaño, contexto menor |

La comparativa es cualitativa porque no se dispone de benchmarks estandarizados para esta cuantización. Frente al BF16, la ventaja es clara en memoria y throughput con precisión equivalente. Frente a modelos de menor tamaño, este ofrece mayor capacidad de razonamiento y tool calling, aunque requiere más VRAM que un 11B.

## Limitaciones y advertencias

- La cuantización puede introducir una degradación ligera de precisión (1,7 puntos a concurrencia 32), aunque el autor la considera estadísticamente no significativa; la calibración con solo 100 muestras podría no ser óptima para todos los dominios.
- El parser de razonamiento `muse_glimmer` no está registrado en la build de vLLM utilizada, por lo que el thinking aparece inline en `content` en lugar de separarse en `reasoning_content`.
- La torre de visión se mantiene en BF16, lo que aumenta ligeramente el uso de memoria frente a una cuantización completa, pero preserva la calidad visual.
- No se especifican idiomas soportados; se asume multilingüe por el modelo base, pero no hay confirmación.
- El tamaño real de parámetros según safetensors (7,39B) difiere del declarado por el modelo base (~30B); podría deberse a que el repo solo incluye pesos cuantizados del transformer sin la torre de visión, aunque no está documentado.
- Para uso en producción, se recomienda validar el rendimiento en el dominio específico, especialmente en tareas que dependen de la precisión visual o de razonamiento largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Muse-Glimmer-30B-mixed-INT4-INT8
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Página de desarrollador de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b
- vLLM Recipes: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
