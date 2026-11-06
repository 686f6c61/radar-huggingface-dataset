# abliterant/Qwen3.5-9B-RANA-abliterated-FP8

## Resumen

Qwen3.5-9B-RANA-abliterated-FP8 es la versión cuantizada en FP8 del checkpoint abliterado abliterant/Qwen3.5-9B-RANA-abliterated, desarrollado por Abliterant a partir de Qwen/Qwen3.5-9B. Se trata de un modelo vision-language (pipeline image-text-to-text) de aproximadamente 9.650 millones de parámetros al que se le ha eliminado el comportamiento de rechazo mediante la técnica RANA (Reasoning-Anchored, Norm-preserving Ablation), un método de ablación de rechazo diseñado específicamente para modelos de razonamiento. La conversión a FP8 no implica entrenamiento adicional: es una cuantización del checkpoint BF16 de referencia.

El modelo resulta relevante para investigadores en interpretabilidad, red-teaming y evaluación de robustez del comportamiento de rechazo, ya que permite estudiar qué ocurre cuando se elimina la alineación de seguridad de un modelo con capacidades de razonamiento, visión y tool calling. El checkpoint usa el formato FP8 oficial de Qwen (bloques de 128 × 128 en e4m3 con escalas BF16), ocupa 12,2 GB frente a los 19,3 GB del BF16 y está pensado para servirse con vLLM y SGLang.

La longitud de contexto configurada es de 262.144 tokens, aunque la evaluación del autor se realizó con un límite de servicio de 20.480 tokens. La licencia es Apache-2.0, heredada de Qwen, y el modelo está marcado explícitamente por su autor como de uso exclusivamente investigador, no apto para despliegue público o de usuario final sin una capa de moderación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.5); detalles completos no disponibles |
| Parámetros totales | 9.653.104.368 (9,65 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens configurados; evaluado con límite de servicio de 20.480 tokens |
| Tipos de cuantización | FP8 (e4m3) en bloques de 128 × 128 con escalas BF16; la familia incluye además BF16, GGUF (Q8_0 a IQ2_M), MLX (4, 5, 6, 8 bits y BF16) y AWQ 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors FP8 (12,21 GB); capas MTP almacenadas en BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de la familia Qwen3.5 con capacidades multimodales (image-text-to-text), tool calling y decodificación especulativa mediante capas MTP (Multi-Token Prediction). Sobre ese checkpoint, Abliterant aplicó RANA, un método de ablación de rechazo que ancla la edición al propio razonamiento del modelo y preserva las normas originales de los pesos editados, manteniendo operativas la visión, el tool calling y la decodificación especulativa del modelo de referencia. Los detalles completos del diseño y del entrenamiento original de Qwen3.5-9B no están disponibles en la información proporcionada.

Esta ficha corresponde a una cuantización, no a un entrenamiento adicional. La conversión replica el formato FP8 oficial de Qwen (el mismo que emplean checkpoints como Qwen/Qwen3.5-27B-FP8): 207 capas lineales (atención y resto de proyecciones) cuantizadas en bloques de 128 × 128 con escalas BF16, mientras que las capas MTP se conservan en BF16. Según el autor, la fidelidad respecto al BF16 es alta: divergencia KL de 0,0045 y el mismo token más probable en el 97,7 % de las posiciones.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (parser de razonamiento `qwen3` en vLLM).
- Procesamiento de imagen y texto (pipeline image-text-to-text); el ejemplo de despliegue limita a 1 imagen por prompt y desactiva vídeo.
- Tool calling y function calling, con parser de herramientas `qwen3_coder` y auto-selección de herramientas en vLLM.
- Decodificación especulativa mediante capas MTP incluidas en el checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento de rechazo mayoritariamente eliminado (abliteración), lo que permite obtener respuestas que el modelo base rechazaría.

## Casos de uso

- Investigación en interpretabilidad del rechazo: comparar activaciones y respuestas entre el modelo base, el abliterado en BF16 y esta versión FP8 para aislar el efecto de la cuantización sobre el comportamiento de rechazo, usando la KL de 0,0045 como referencia de fidelidad.
- Red-teaming y evaluación de robustez: generar respuestas a peticiones dañinas en un entorno controlado para medir la eficacia de filtros de moderación externos, aprovechando que el modelo produce respuestas útiles en el 67,4 % de los casos frente al 52,5 % de una abliteración pública de referencia.
- Serving de bajo coste en una sola GPU: con 12,2 GB de pesos FP8 cabe en una RTX 5090 de 32 GB y permite desplegar un modelo de 9,65 B con contexto largo mediante vLLM 0.30.0, reduciendo requisitos de VRAM frente a los 19,3 GB del BF16.
- Evaluación de pipelines multimodales: probar flujos image-text-to-text (una imagen por prompt) en entornos de investigación donde se necesita un modelo sin rechazos para estudiar sesgos en la descripción de imágenes.
- Pruebas de agentes con tool calling: validar pipelines de agentes multi-paso que usan function calling y decodificación especulativa MTP, verificando que la cuantización FP8 no degrada la selección de herramientas.
- Benchmarking de cuantizaciones: usar este checkpoint como referencia para medir la pérdida de capacidad de FP8 frente a BF16, GGUF, MLX y AWQ 4-bit de la misma familia, con métricas de KL y coincidencia del token más probable.

## Benchmarks y rendimiento

| Métrica | Este modelo (FP8) | Referencia |
|---|---|---|
| Divergencia KL frente a BF16 | 0,0045 | — |
| Coincidencia del token más probable | 97,7 % de las posiciones | — |
| Respuestas útiles a peticiones dañinas | 67,4 % (medido en BF16) | 52,5 % (bowmanslayer/Qwen3.5-9B-Uncensored) |
| Pérdida de capacidad | 0,79 pp (medido en BF16) | 3,31 pp (bowmanslayer/Qwen3.5-9B-Uncensored) |
| Distancia al modelo base (KL) | 0,109 (medido en BF16) | 0,294 (bowmanslayer/Qwen3.5-9B-Uncensored) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de la tabla proceden de la model card y corresponden mayoritariamente a la build BF16, no a esta cuantización FP8.

## Requisitos de hardware

- VRAM estimada: 12,2 GB solo para pesos FP8; con contexto de 20.480 tokens y caché KV se recomienda al menos 24 GB, y 32 GB para mayor margen.
- GPU probada por el autor: una RTX 5090 de 32 GB (Blackwell), con `VLLM_USE_FLASHINFER_SAMPLER=0`.
- GPU recomendadas: RTX 5090 (probada), A100 40/80 GB, H100, y en general GPUs con soporte FP8. No se han publicado pruebas en otras GPU.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB según la prueba del autor; en GPUs de 24 GB el margen es ajustado con contexto largo.
- Opciones de despliegue: vLLM 0.30.0 (probado) y SGLang; para otras configuraciones existen las variantes GGUF (llama.cpp) y MLX (Apple Silicon) de la misma familia.
- Latencia y throughput: no disponibles. El checkpoint incluye decodificación especulativa MTP con 1 token especulativo, que según el autor mejora el rendimiento, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterant/Qwen3.5-9B-RANA-abliterated-FP8 | 9,65 B | 262.144 configurados / 20.480 evaluados | Apache-2.0 | Safetensors FP8 (12,2 GB) | Este modelo; abliteración RANA con visión y tool calling |
| abliterant/Qwen3.5-9B-RANA-abliterated | 9,65 B | Igual | Apache-2.0 | Safetensors BF16 (19,3 GB) | Referencia BF16; KL 0,0045 respecto a este FP8 |
| bowmanslayer/Qwen3.5-9B-Uncensored | 9,65 B (base Qwen3.5-9B) | No disponible | No disponible | No disponible | Abliteración pública; 52,5 % de respuestas útiles, 3,31 pp de pérdida de capacidad, KL 0,294 |
| abliterant/Qwen3.8-27B-RANA-abliterated-FP8 | 27 B (familia) | No disponible | Apache-2.0 | Safetensors FP8 | Alternativa de mayor tamaño de la misma familia; no comparable directamente en parámetros |

## Limitaciones y advertencias

- Modelo de investigación con la alineación de seguridad eliminada: produce contenido que el modelo base rechazaría. No apto para despliegue público o de usuario final sin una capa de moderación externa.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado; el autor no documenta sesgos específicos en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un modelo de razonamiento de 9,65 B y la cuantización FP8 introduce una divergencia del 2,3 % en el token más probable.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- La evaluación se realizó con un límite de servicio de 20.480 tokens pese a los 262.144 configurados; el comportamiento con contextos mucho más largos no está validado.
- Licencia Apache-2.0 heredada de Qwen: permite uso comercial, pero el autor restringe explícitamente el uso a investigación y responsabiliza al usuario del cumplimiento legal y de las condiciones de las plataformas donde se usen las salidas.
- El modelo solo procesa una imagen por prompt en la configuración de ejemplo y desactiva vídeo; no se documentan límites de resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-FP8
- Modelo base BF16: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante GGUF: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
- Variante MLX: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-MLX
- Variante AWQ 4-bit: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-AWQ
- Abliteración pública de comparación: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored
- Notas de investigación RANA: https://abliterant.ai/research/rana-refusal-ablation
- Sitio del autor: https://abliterant.ai/
- Chat de demostración: https://chat.abliterant.ai/
- Todos los formatos: https://abliterant.ai/models
- Modelos del autor: https://huggingface.co/abliterant
