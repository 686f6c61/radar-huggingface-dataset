# llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved-GPTQ-Int4

## Resumen

Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved-GPTQ-Int4 es una cuantización de 4 bits (GPTQ-Int4) del modelo abliterado Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved, publicado por el contribuidor independiente llmfan46. Se trata de una versión "decensored" del Qwen/Qwen3.5-27B original, obtenida mediante la herramienta Heretic v1.3.0 aplicando una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA), que elimina direcciones de activación asociadas a rechazos sin destruir la magnitud de los pesos.

El modelo conserva la arquitectura multimodal del Qwen3.5-27B original (pipeline image-text-to-text), con 27.356.728.560 parámetros totales, y mantiene intactos los 15 tensores del módulo MTP (Multi-Token Prediction) nativo, lo que preserva la capacidad de decodificación especulativa propia del modelo base. La cuantización GPTQ-Int4 reduce el repositorio a 19,6 GB, facilitando su despliegue en GPUs de consumo.

La relevancia de esta ficha radica en que documenta un caso de fine-tuning por ablación orientado a eliminar restricciones de contenido, con métricas declaradas de reducción de rechazos (de 95/100 a 10/100) y una divergencia KL de 0,0308 respecto al original. Es un modelo de nicho, con licencia Apache 2.0 heredada del Qwen3.5-27B, y pensado para experimentación más que para producción sujeta a políticas de contenido estrictas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5, con módulo MTP (Multi-Token Prediction) nativo |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ-Int4 (4 bits); existen variantes del modelo base sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-27B) |
| Formato de pesos | safetensors (GPTQ), librería transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 con 27.356 millones de parámetros, orientado a tareas image-text-to-text. Incorpora un módulo MTP (Multi-Token Prediction) con 15 tensores (mtp.fc, mtp.layers.0.*, mtp.norm, mtp.pre_fc_norm_embedding, mtp.pre_fc_norm_hidden), que el autor preserva íntegramente en esta versión. Este módulo habilita decodificación especulativa nativa, mejorando el throughput en generación autoregresiva.

El proceso de "decensoring" se realizó con Heretic v1.3.0 aplicando una variante de Magnitude-Preserving Orthogonal Ablation (MPOA). La ablación actúa sobre las componentes attn.o_proj, attn.out_proj y mlp.down_proj, con parámetros de dirección e intensidad documentados (por ejemplo, direction_index 42.53; mlp.down_proj.max_weight 1.49; attn.o_proj.min_weight 0.73). No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni sobre si hubo fases de RLHF o DPO adicionales; el ajuste es puramente de ablación de direcciones sobre los pesos del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen3.5-27B base.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas multimodales.
- Razonamiento y conocimiento general, con un MMLU declarado del 86,53 % en el modelo original.
- Decodificación especulativa mediante el módulo MTP nativo preservado (15 tensores intactos).
- Reducción drástica de rechazos: 10/100 en la prueba del autor frente a 95/100 del original.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking" o razonamiento extendido: no confirmado en la información disponible.

## Casos de uso

- Experimentación en investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible de MPOA sobre un transformer de 27B, con parámetros de ablación y métricas de divergencia KL documentadas.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera ausencia de rechazos y evasivas, aprovechando la reducción de rechazos declarada (10/100).
- Evaluación de robustez de pipelines de moderación: permite probar sistemas de filtrado de contenido frente a un modelo deliberadamente menos restrictivo, midiendo la eficacia de las capas de seguridad externas.
- Despliegue en GPU de consumo: con 19,6 GB en GPTQ-Int4, puede ejecutarse en tarjetas de 24 GB (RTX 3090/4090) para prototipos y demos locales.
- Análisis multimodal de documentos: al conservar el pipeline image-text-to-text, puede emplearse en tareas de descripción de imágenes o extracción de información visual en entornos controlados.
- Investigación sobre decodificación especulativa: al preservar los 15 tensores MTP, es útil para estudiar el rendimiento de la predicción multi-token en modelos cuantizados a 4 bits.
- Base para fine-tuning posterior: al estar en formato transformers/safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

| Metrica | Este modelo (cuantizado) | Modelo original Qwen/Qwen3.5-27B |
|---|---|---|
| Divergencia KL | 0,0308 | 0 (por definición) |
| Rechazos (prueba del autor) | 10/100 | 95/100 |
| MMLU (accuracy) | no disponible para la versión GPTQ-Int4 | 86,53 % (6075/7021) |

Resultados MMLU por materia del modelo original (no de la cuantización): professional_law 75,54 %; moral_scenarios 75,57 %; miscellaneous 93,99 %; professional_psychology 91,14 %; high_school_psychology 97,41 %; high_school_macroeconomics 90,86 %; elementary_mathematics 88,59 %; moral_disputes 86,21 %; prehistory 88,95 %; philosophy 86,79 %; high_school_biology 96,05 %; professional_accounting 78,32 %; clinical_knowledge 94,29 %. No se han publicado resultados de benchmarks de la versión GPTQ-Int4 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en GPTQ-Int4 (pesos de ~13,7 GB más overhead de activaciones y caché KV), según el tamaño del repositorio de 19,6 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso local.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, 4090, 5090). En 16 GB es ajustado y depende de la longitud de contexto y del backend.
- Opciones de despliegue: transformers (librería declarada), GPTQ requiere backends compatibles como GPTQModel, AutoGPTQ, vLLM o TGI con soporte GPTQ. llama.cpp/Ollama requerirían una conversión a GGUF no publicada en este repositorio.
- Latencia y throughput: no disponibles. El módulo MTP preservado puede mejorar el throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-27B heretic GPTQ-Int4) | 27,36 B | no disponible | Apache 2.0 | safetensors GPTQ | Abliterado, multimodal, MTP preservado, 4 bits |
| Qwen/Qwen3.5-27B | 27,36 B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, MMLU 86,53 % |
| llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved | 27,36 B | no disponible | Apache 2.0 | safetensors | Versión sin cuantizar del mismo modelo abliterado |
| Alternativas de 27B abliteradas de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El proceso de abliteración elimina direcciones de rechazo, lo que puede degradar la coherencia en tareas que requieren matices éticos o matices de seguridad; la divergencia KL de 0,0308 indica un cambio medible respecto al original.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto sin advertencias; no es apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación inherente a los modelos de 27B; la cuantización a 4 bits puede incrementar ligeramente la degradación en tareas de razonamiento largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye "tal cual"; conviene revisar las políticas de contenido aplicables en cada jurisdicción.
- No se documentan idiomas soportados ni longitud de contexto; la cuantización GPTQ puede reducir la ventana efectiva si no se configura correctamente.
- El repositorio depende de la librería transformers y de backends compatibles con GPTQ; no hay GGUF oficial, lo que limita el despliegue en CPU o en Ollama sin conversión previa.
- El autor advierte de que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved-GPTQ-Int4
- Modelo base sin cuantizar: https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del original: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Blog sobre Magnitude-Preserving Orthogonal Ablation: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
