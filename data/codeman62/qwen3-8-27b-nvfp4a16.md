# CodeMan62/qwen3.8-27B-NVFP4A16

## Resumen

Qwen3.8-27B-NVFP4A16 es una cuantización de solo pesos (weight-only) en NVFP4 del modelo Qwen/Qwen3.8-27B, publicada por el usuario CodeMan62 mediante la herramienta hollowQuant (RTN sin datos, con búsqueda de escalas de bloque de ±1 codepoint). El artefacto es un checkpoint compressed-tensors de tipo `nvfp4-pack-quantized` (W4A16): códigos E2M1 empaquetados dos por byte, una escala E4M3 por cada 16 pesos y una escala fp32 por tensor, lo que resulta en 4,50 bits por peso. El objetivo es reducir la huella de memoria del modelo base para que quepa en una única GPU de 32 GB sin sacrificar de forma apreciable la calidad de salida.

El modelo base es un transformer multimodal de 27.781.427.952 parámetros (27,78B) con arquitectura híbrida: 64 capas con mezcla de atención completa y atención lineal basada en Gated DeltaNet, además de una torre de visión y una cabeza MTP (multi-token prediction). La cuantización afecta a 496 módulos (24,35B parámetros) y reduce los lineales en bf16 de 48,7 GB a 13,7 GB, con un checkpoint resultante de aproximadamente 20,5 GB (20,6 GB de repositorio). Se mantienen en precisión densa los embeddings de tokens, el `lm_head`, la torre de visión, la cabeza MTP y las normas.

Es relevante ahora porque permite desplegar un modelo multimodal de casi 28B en hardware de consumo de gama alta (por ejemplo, una RTX 5090 de 32 GB) con margen para la caché KV, usando vLLM ≥ 0.17.0 y el kernel FP4 Marlin con activaciones de 16 bits. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la model card solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal (Gated DeltaNet), torre de visión y cabeza MTP; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | NVFP4 W4A16 (E2M1 empaquetado 2 por byte, escala E4M3 por bloque de 16 pesos, escala fp32 por tensor); 4,50 bits por peso |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que combina 16 capas de atención completa con 48 capas de atención lineal basada en Gated DeltaNet. Incorpora además una torre de visión (pipeline `image-text-to-text`) y una cabeza MTP para predicción multi-token. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación técnica de esta ficha es la cuantización: se aplicó hollowQuant con cuantización RTN sin datos y búsqueda de escalas de bloque de ±1 codepoint (`scale_search="neighbors"`). Se cuantizaron todos los `mlp.gate/up/down_proj` (64 capas), las proyecciones `q/k/v/o_proj` de atención completa (16 capas, con q/k/v compartiendo escala global), las proyecciones de atención lineal `linear_attn.in_proj_qkv` e `in_proj_z` (escala compartida), `in_proj_a` e `in_proj_b` (escala compartida) y `out_proj` (48 capas). Los módulos cuantizados, incluidas las proyecciones de Gated DeltaNet, se ejecutan en el kernel FP4 Marlin con activaciones de 16 bits.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión mantenida en precisión densa.
- Razonamiento matemático: la referencia en bf16 reporta un 90,45% en GSM8K.
- Conocimiento general y respuesta a preguntas: 83,46% en MMLU con la referencia bf16.
- Predicción multi-token mediante la cabeza MTP del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: al ocupar unos 20,5 GB de checkpoint y caber en una única GPU de 32 GB (RTX 5090) con margen para caché KV, permite ejecutar un modelo multimodal de 27,78B en estaciones de trabajo locales sin clúster.
- Asistentes conversacionales en inglés: el modelo mantiene un 93,87% de coincidencia top-1 frente a bf16 en texto de chat autogenerado (KL medio de 0,0238), lo que lo hace adecuado para diálogos multi-turno donde la fidelidad respecto al modelo original es crítica.
- Descripción y análisis de imágenes: la torre de visión se conserva en precisión densa, de modo que tareas de image-text-to-text (captioning, VQA) no sufren la degradación de la cuantización en el codificador visual.
- Razonamiento matemático asistido: con un 90,45% en GSM8K en la referencia bf16, es viable para resolución de problemas aritméticos y explicación paso a paso en herramientas educativas.
- Evaluación de calidad de cuantizaciones: el checkpoint incluye métricas KL frente a bf16 y un script de evaluación (`benchmarks/eval_nvfp4_local.py`), lo que lo convierte en un artefacto útil para investigar el impacto de NVFP4 en arquitecturas híbridas con Gated DeltaNet.
- Servicio de inferencia con vLLM: al cargar como `Qwen3_5ForConditionalGeneration` con compressed-tensors NVFP4 y ejecutarse en el kernel Marlin, se integra en despliegues existentes de vLLM ≥ 0.17.0 con activaciones de 16 bits.
- Prototipado con contexto moderado: el ejemplo oficial de servicio usa `--max-model-len 8192`, adecuado para pipelines de documentos y conversaciones de longitud media.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de calidad de la cuantización y las puntuaciones de referencia en bf16 del modelo base. No se han publicado las puntuaciones del checkpoint cuantizado; la model card indica que deben obtenerse ejecutando el script de evaluación en la GPU del usuario.

| Metrica | Valor |
|---|---|
| KL medio (vocabulario completo, vs bf16) | 0,0238 |
| KL p99 (vs bf16) | 0,2223 |
| Coincidencia top-1 (vs bf16) | 93,87% |
| GSM8K (referencia bf16, vLLM 0.31.0, greedy) | 90,45% |
| MMLU (referencia bf16, vLLM 0.31.0, greedy) | 83,46% |
| GSM8K (checkpoint cuantizado) | No disponible |
| MMLU (checkpoint cuantizado) | No disponible |

Las métricas KL se calcularon sobre 2.919 tokens de texto de chat autogenerado con transformers 5.8.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,5 GB de checkpoint; con `--max-model-len 8192` cabe en una GPU de 32 GB con margen para la caché KV.
- GPU recomendadas: RTX 5090 (32 GB) según la model card; cualquier GPU con soporte del kernel FP4 Marlin y al menos 32 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB). No se indica compatibilidad con GPUs de 24 GB.
- Opciones de despliegue: vLLM ≥ 0.17.0 con compressed-tensors y kernel FP4 Marlin (16-bit activations). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeMan62/qwen3.8-27B-NVFP4A16 | 27,78B | No disponible | NVFP4 W4A16 (4,50 bits/peso) | Apache 2.0 | Hugging Face, 36 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78B | No disponible | bf16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Qwen3.8-27B | 27,78B | No disponible | No disponible | Apache 2.0 (heredada) | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks del checkpoint cuantizado que permitan una comparación de rendimiento frente a alternativas; la única referencia cuantitativa es la desviación KL respecto a bf16 (0,0238 de media, 93,87% de coincidencia top-1).

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está garantizado.
- La cuantización introduce desviación respecto a bf16: KL p99 de 0,2223 y un 6,13% de discrepancias en top-1, lo que puede afectar a tareas sensibles a tokens de baja probabilidad.
- No se han publicado puntuaciones de benchmarks del checkpoint cuantizado (GSM8K, MMLU); las cifras de la model card corresponden a la referencia bf16.
- La cuantización es RTN sin datos, sin calibración con datos reales, lo que puede penalizar más que métodos con calibración en dominios alejados del texto de chat usado para medir KL.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- La longitud de contexto no se especifica; el ejemplo de servicio limita a 8192 tokens, por lo que contextos mayores requieren verificación de VRAM.
- Requiere vLLM ≥ 0.17.0 y soporte del kernel FP4 Marlin; no hay constancia de compatibilidad con otros runtimes (llama.cpp, Ollama, TGI).
- El repositorio tiene solo 36 descargas y 0 likes, sin validación comunitaria amplia; conviene evaluar el checkpoint en el caso de uso concreto antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B.

## Enlaces

- Hugging Face: https://huggingface.co/CodeMan62/qwen3.8-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización hollowQuant: https://github.com/HollowFound/hollowQuant
- Script de evaluación: `benchmarks/eval_nvfp4_local.py` en el repositorio hollowQuant
