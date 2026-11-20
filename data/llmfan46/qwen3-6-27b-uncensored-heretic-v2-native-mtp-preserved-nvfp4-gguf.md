# llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4-GGUF

## Resumen

Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo Qwen3.6-27B sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo de contenido. Lo publica el contribuidor independiente llmfan46, no el equipo de Qwen, y se distribuye bajo licencia Apache 2.0 heredada del modelo original. El modelo base declarado es la variante intermedia del propio autor (llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved), que a su vez deriva de Qwen/Qwen3.6-27B.

El interés técnico principal reside en dos aspectos. Por un lado, la preservación íntegra de los 15 tensores MTP (Multi-Token Prediction) del bloque 64, que permiten decodificación especulativa nativa y, por tanto, aceleración de la inferencia. Por otro, la cuantización NVFP4 en GGUF, con dos variantes (completa y solo capas MLP), pensada para aprovechar el formato de coma flotante de 4 bits en hardware Blackwell. El autor reporta una reducción de rechazos del 92/100 al 6/100 con una divergencia KL de 0.0021 respecto al original, y una precisión MMLU del 86,65 % en el modelo sin cuantizar.

La ficha cubre un modelo de la familia Qwen3.6 con pipeline image-text-to-text, lo que implica capacidades multimodales de entrada. No obstante, buena parte de los metadatos estándar (idiomas, contexto, composición del dataset) no figuran en la información disponible y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.6, con 64 bloques y 15 tensores MTP (Multi-Token Prediction) en el bloque 64; pipeline image-text-to-text |
| Parámetros totales | 460.730.096 según safetensors del repo; el nombre comercial indica 27B (no disponible el desglose exacto en la información proporcionada) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (completa) y NVFP4 MLP-only |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.6-27B) |
| Formato de pesos | GGUF (repo de 88 GB); el modelo base intermedio se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.6, con 64 bloques identificados en la model card y un bloque adicional (blk.64) que contiene los 15 tensores MTP: proyecciones de atención (q, k, v, output), normalizaciones (attn_norm, post_attention_norm, q_norm, k_norm), capas FFN (gate, up, down) y los componentes específicos del cabezal de predicción multi-token (eh_proj, shared_head_norm, enorm, hnorm). La conservación de estos tensores es el rasgo diferencial de esta publicación: permite usar decodificación especulativa con el propio modelo como drafter, sin necesidad de un modelo auxiliar.

El proceso de "decensoring" se realizó con Heretic v1.3.0 aplicando una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA). La ablación actúa sobre tres componentes: attn.o_proj, attn.out_proj y mlp.down_proj, con parámetros de peso e índices de dirección especificados por capa (por ejemplo, direction_index 30.38; max_weight 1.58 para attn.out_proj; max_weight 1.80 para mlp.down_proj). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento general, con precisión MMLU del 86,65 % en el modelo sin cuantizar.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita entrada multimodal.
- Decodificación especulativa nativa mediante los 15 tensores MTP preservados, con potencial de aceleración en inferencia.
- Reducción drástica de rechazos: 6/100 frente a 92/100 del original en el conjunto de prueba del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento, comparando la divergencia KL (0.0021) con la tasa de rechazos, en entornos controlados de laboratorio.
- Evaluación de cuantización NVFP4: sirve como banco de pruebas para medir la degradación de calidad entre la variante NVFP4 completa y la MLP-only frente al modelo en precisión original, útil para equipos que preparan despliegues en GPUs Blackwell.
- Generación de código y texto técnico sin filtros de contenido: para pipelines internos donde los rechazos del modelo base interrumpen tareas legítimas (por ejemplo, redacción de documentación de seguridad ofensiva o análisis de malware), con revisión humana posterior.
- Procesamiento de documentos con imagen y texto: al declarar pipeline image-text-to-text, puede emplearse en extracción de información de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Aceleración de inferencia con MTP: los 15 tensores preservados permiten integrar decodificación especulativa en servidores de inferencia para reducir latencia por token en cargas interactivas.
- Fine-tuning posterior sobre dominio específico: al estar en Apache 2.0 y en GGUF, puede servir de base para ajustes con LoRA o para destilación en entornos de investigación que requieran un modelo sin capa de rechazo.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen3.6-27B original |
|---|---|---|
| Divergencia KL | 0.0021 | 0 (por definición) |
| Rechazos (100 prompts) | 6/100 | 92/100 |
| MMLU (precisión global) | No disponible para la versión cuantizada | 86,65 % (6084/7021) |

Desglose MMLU del original reportado por el autor (parcial): professional_law 75,80 %; moral_scenarios 77,15 %; miscellaneous 93,99 %; professional_psychology 89,87 %; high_school_psychology 97,04 %; high_school_macroeconomics 92,89 %; elementary_mathematics 89,67 %; moral_disputes 86,21 %; prehistory 89,53 %; philosophy 88,68 %; high_school_biology 95,39 %; professional_accounting 85,31 %; clinical_knowledge 90,71 %; high_school_microeconomics 97,06 %; nutrition 91,11 %; professional_medicine 94,78 %. No se han publicado resultados de benchmarks de la versión NVFP4 GGUF en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo GGUF ocupa 88 GB, por lo que la variante NVFP4 completa requiere del orden de decenas de GB de VRAM, mientras que la MLP-only reduce esa cifra al cuantizar solo las capas feed-forward.
- GPU recomendadas: el formato NVFP4 está diseñado para GPUs Blackwell (B200, RTX 50xx); en arquitecturas anteriores (Hopper, Ada, Ampere) la decodificación NVFP4 no está soportada de forma nativa y requeriría fallback.
- GPU de consumo: no disponible la confirmación de que quepa en RTX 4090 o RTX 5090; el tamaño del repo sugiere que no cabe íntegro en 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no están confirmados para NVFP4 GGUF en la información disponible.
- Latencia y throughput: no disponibles; los tensores MTP preservados permiten en principio decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 GGUF) | 27B (nombre comercial) | No disponible | Apache 2.0 | GGUF NVFP4 | Sin rechazos, MTP preservados |
| Qwen/Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Safetensors | Modelo original, 92/100 rechazos, MMLU 86,65 % |
| llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved | 27B | No disponible | Apache 2.0 | Safetensors | Versión intermedia sin cuantizar, base de esta |
| Otras variantes "heretic" de la familia Qwen | No disponible | No disponible | Apache 2.0 | Safetensors/GGUF | No disponible comparativa numérica |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteración elimina la capa de rechazo, lo que puede producir contenido dañino, ofensivo o inseguro sin advertencia; no es apto para aplicaciones de cara al público sin moderación externa.
- La divergencia KL de 0.0021 indica cercanía al original, pero no garantiza ausencia de degradación en tareas específicas; conviene validar en el dominio de uso.
- La cuantización NVFP4 introduce pérdida de precisión adicional respecto al modelo en safetensors; la variante MLP-only puede mitigarla a costa de mayor tamaño.
- Riesgo de alucinación inherente a los modelos de la familia Qwen; no se han publicado evaluaciones específicas de factualidad para esta variante.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo original.
- Longitud de contexto no documentada; no se debe asumir la ventana del Qwen3.6-27B original sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo no ofrece garantías y la responsabilidad legal del contenido generado recae en el desplegador.
- El repo depende de almacenamiento gratuito de Hugging Face y el autor advierte de que puede dejar de subir modelos; la disponibilidad a largo plazo no está garantizada.
- El formato NVFP4 requiere hardware Blackwell para funcionar de forma óptima; en GPUs anteriores el rendimiento puede degradarse o no ser compatible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4-GGUF
- Modelo base intermedio: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia original: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Blog sobre Magnitude-Preserving Orthogonal Ablation: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
