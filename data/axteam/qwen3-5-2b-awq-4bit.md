# axteam/Qwen3.5-2B-AWQ-4bit

## Resumen

`axteam/Qwen3.5-2B-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal `Qwen/Qwen3.5-2B` del equipo Qwen (Alibaba Cloud), publicada por el usuario axteam con el objetivo explícito de servir el modelo de forma eficiente en vLLM. No se trata de un modelo nuevo: es un derivado PTQ (post-training quantization) con AWQ en esquema W4A16, donde los pesos quedan en INT4 asimétrico con grupo de 32 y las activaciones se mantienen en BF16. El repositorio ocupa 2,6 GB y los safetensors declaran 2.213.241.664 parámetros totales.

El modelo base es un transformer híbrido que combina capas de atención lineal con capas de atención completa, es denso (no MoE), incorpora torre de visión (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction). La cuantización deja sin tocar en BF16 la torre y el proyector visuales, la cabeza MTP, todas las RMSNorm, los embeddings, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), de modo que solo se cuantizan las matrices lineales principales.

Su relevancia práctica es doble: permite ejecutar un modelo de 2,2 B con capacidades multimodales en GPUs de gama media o incluso consumer, y ofrece una medición honesta de la pérdida de fidelidad frente al original en BF16 (perplejidad +7,9 %, acuerdo top-1 del 86,8 %). Es, por tanto, una pieza útil para prototipado y despliegue con restricciones de VRAM, no un sustituto del modelo completo cuando se exige máxima calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (linear-attention + full-attention), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 2.213.241.664 (~2,2 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT4 (W4A16): pesos INT4 asimétricos, grupo de 32, escala BF16 + zero-point INT4, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`); sin GGUF en el repositorio |
| Modelo base | Qwen/Qwen3.5-2B |
| Tamaño en disco | ~2,4 GB (repositorio: 2,6 GB) |
| Calibración AWQ | 256 muestras, corpus mixto con predominio de coreano |
| Muestreo recomendado | temperature=0.7, top_p=0.8, top_k=20 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que alterna capas de atención lineal (con componentes propios de SSM: `conv1d`, `A_log`, `dt_bias`) y capas de atención completa, lo que reduce el coste de cómputo y memoria en contextos largos frente a un transformer completamente attention-based. Es un modelo denso de 2,2 B de parámetros con torre de visión y proyector multimodal, además de una cabeza de predicción multi-token (MTP) que puede explotarse para decodificación especulativa o generación multi-token. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Sobre el proceso de cuantización: se aplicó AWQ (activation-aware weight quantization) en modo PTQ, sin reentrenamiento. AWQ usa un conjunto reducido de calibración (256 muestras, sin gradientes) para proteger los canales de pesos más relevantes antes del redondeo. Se mantienen en BF16 la torre y el proyector visuales (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM; el resto de matrices lineales se almacenan en INT4 con grupo de 32. El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del original, y el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat heredada del modelo original.
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`): la torre visual y el proyector se conservan en BF16.
- Razonamiento e instrucciones: la familia Qwen3.5 se presenta públicamente como una mejora en razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Generación de código y matemáticas: capacidad heredada del modelo base; no hay resultados de benchmarks en la información disponible que la cuantifiquen.
- Predicción multi-token mediante la cabeza MTP, aprovechable para acelerar la decodificación.
- Capacidades multilingües: el modelo base se describe como multilingüe, pero no se detalla la lista de idiomas soportados.
- Tool calling / function calling: no documentado en la información disponible.
- Uso en agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo thinking explícito: no documentado en la información disponible.

## Casos de uso

- Prototipado de asistentes multimodales en local: con ~2,4 GB de pesos en INT4, el modelo se puede levantar en una estación de trabajo con GPU consumer para probar flujos de imagen + texto antes de escalar a un modelo mayor.
- Servicio de inferencia con vLLM en una sola GPU: `vllm serve axteam/Qwen3.5-2B-AWQ-4bit` arranca un endpoint compatible con la API de OpenAI, adecuado para entornos de desarrollo y demos internas con presupuesto de VRAM ajustado.
- Descripción y clasificación de imágenes a escala moderada: la torre visual sin cuantizar permite tareas de captioning, etiquetado o extracción de información de capturas y documentos escaneados.
- Backend de bajo coste para chat de soporte: al ser denso y de 2,2 B, el coste por token es reducido y permite mantener varias conversaciones concurrentes en una GPU de 24 GB.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la degradación real de AWQ INT4 frente a BF16 en un pipeline propio, usando las métricas de fidelidad publicadas como punto de partida.
- Filtrado y preprocesado de datos multimodal en pipelines de ML: generación de anotaciones o resúmenes preliminares sobre grandes volúmenes de pares imagen-texto antes de un revisado humano.
- Aceleración de la decodificación en entornos con latencia crítica: la cabeza MTP conservada en BF16 permite experimentar con decodificación especulativa sin sacrificar precisión en esa parte del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. El autor sí publica una evaluación de fidelidad frente al original en BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build y el mismo harness para todas las filas:

| Métrica | Este modelo (AWQ INT4) | Original BF16 |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,9971 | 1,8515 (+7,9 %) |
| Acuerdo top-1 en el siguiente token | 86,8 % | 98,9 % |

Estas métricas miden fidelidad respecto al modelo base, no calidad absoluta en tareas. El propio autor lo advierte explícitamente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 ocupan ~2,4 GB, pero hay que sumar los componentes en BF16 (torre visual, proyector, MTP, embeddings, LM head, RMSNorm, partes SSM) y la caché KV. Estimación orientativa: ~4-5 GB para contexto corto y ~6-8 GB con contexto largo (cálculo propio a partir del tamaño de parámetros, no publicado por el autor).
- GPU recomendadas: para serving con vLLM, una L4 (24 GB), L40S, A10G o A100 permiten holgura y concurrencia; una RTX 4090 (24 GB) cubre el caso de una sola instancia con margen amplio.
- Cabe en GPU consumer: sí. Tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) son suficientes para contexto moderado; 12-16 GB permiten lotes mayores y contextos más largos.
- Opciones de despliegue: vLLM es la vía soportada y recomendada (formato compressed-tensors); también es cargable con `transformers` en el hardware adecuado. No se incluyen pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no provista.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-2B-AWQ-4bit | 2,2 B (denso) | no disponible | AWQ INT4 W4A16 | Apache-2.0 | Pesos en HF, ~2,4 GB |
| Qwen/Qwen3.5-2B (base) | 2,2 B (denso) | no disponible | BF16 | Apache-2.0 | Pesos en HF |
| Qwen3.5-397B-A17B | 397 B totales / 17 B activos (MoE) | no disponible | no disponible | no disponible | Modelo open weight de la familia |
| Qwen3.5-Plus | no disponible | no disponible | no aplica (hosted) | no disponible | Solo vía Alibaba Cloud Model Studio |

Frente al base en BF16, la comparativa es directa: misma arquitectura, mismo tokenizador y misma plantilla de chat, con una reducción de huella de memoria de aproximadamente un orden de magnitud a costa de un +7,9 % de perplejidad y un 86,8 % de acuerdo top-1. Frente a Qwen3.5-397B-A17B y Qwen3.5-Plus la diferencia es de escala y de modelo de despliegue, no de categoría: no hay datos públicos en la información disponible para comparar rendimiento en tareas.

## Limitaciones y advertencias

- Degradación medible por cuantización: +7,9 % de perplejidad y 86,8 % de acuerdo top-1 frente al BF16. En tareas sensibles a matices (razonamiento de varios pasos, código con sintaxis estricta) la pérdida puede ser más visible que la media.
- Calibración sesgada: el conjunto de calibración AWQ es un corpus mixto con predominio de coreano (256 muestras). Esto puede favorecer la preservación de calidad en coreano e inglés y degradar relativamente otros idiomas.
- Idiomas no documentados: la model card no especifica la lista de idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo, toxicidad o robustez para este derivado ni para el base en la información disponible.
- Riesgo de alucinación: inherente a un modelo de 2,2 B, especialmente en dominios especializados y en tareas multimodales con imágenes ambiguas; no se han publicado métricas de factualidad.
- Calidad multimodal no evaluada: la torre visual se mantiene en BF16, pero la evaluación publicada mide solo fidelidad de texto. No hay datos sobre el impacto de la cuantización en tareas de visión.
- Contexto desconocido: al no publicarse la longitud de contexto, el dimensionado de la caché KV y de los lotes en vLLM debe hacerse empíricamente.
- Licencia: Apache-2.0, permisiva para uso comercial, pero los derechos sobre pesos originales, tokenizador y plantilla de chat pertenecen al equipo Qwen; conviene conservar los avisos de atribución.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, y una única fuente (el propio autor) para las métricas. No hay validación independiente.
- Compatibilidad: el formato compressed-tensors limita la portabilidad; fuera de vLLM o de un stack que lo soporte habrá que reconvertir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen/models
- Ficha de especificaciones y VRAM de Qwen3.5-2B: https://apxml.com/models/qwen35-2b
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Análisis de la familia Qwen3.5 (Qwen3.5-397B-A17B y Qwen3.5-Plus): https://www.analyticsvidhya.com/blog/2026/02/qwen3-5-open-weight-qwen3-5-plus/
