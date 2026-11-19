# llmfan46/gemma-4-31B-it-uncensored-heretic

## Resumen

`llmfan46/gemma-4-31B-it-uncensored-heretic` es un ajuste fino del modelo multimodal `google/gemma-4-31B-it`, publicado por el contribuidor independiente llmfan46. No se trata de un modelo entrenado desde cero, sino de una variante "abliterated" (decensored) obtenida aplicando la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre el modelo base de Google. El objetivo es reducir drásticamente la tasa de rechazos del modelo original manteniendo al máximo sus capacidades.

El modelo conserva la arquitectura y los pesos del Gemma 4 de 31B con pipeline `image-text-to-text`, por lo que mantiene la capacidad de procesar imágenes y texto. Con 31.273.086.512 parámetros reales (según safetensors) y un repositorio de 62,6 GB, está pensado para despliegues en GPU de gama alta o servidores con suficiente VRAM.

Su relevancia actual radica en que ofrece una alternativa con muchas menos restricciones de contenido que el modelo original (10/100 rechazos frente a 99/100), con una divergencia KL de 0,0541 respecto al base y una caída mínima en MMLU (85,90% frente a 86,50%). Está etiquetado como compatible con endpoints y publicado bajo licencia Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en google/gemma-4-31B-it; detalles internos no disponibles |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (license_link apunta a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer multimodal de 31B parámetros orientado a tareas image-text-to-text. Sobre ese base no se realiza un reentrenamiento completo, sino una ablación de direcciones en el espacio de activaciones mediante Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros de ablación publicados son: `start_layer_index` = 30, `end_layer_index` = 48, `preserve_good_behavior_weight` = 0,5437, `steer_bad_behavior_weight` = 0,0005, `overcorrect_relative_weight` = 0,9949 y `neighbor_count` = 15. El componente objetivo es `attn.o_proj`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el ajuste no es un entrenamiento supervisado al uso sino una modificación de pesos por ablación. La innovación técnica principal es precisamente el uso de ARA para eliminar direcciones de comportamiento no deseado con una divergencia KL baja (0,0541) respecto al modelo original, preservando en gran medida la distribución de salida del base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Gemma 4 base.
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), lo que permite tareas de visión-lenguaje.
- Razonamiento y conocimiento general, con un MMLU del 85,90% en la variante Heretic.
- Reducción drástica de rechazos: 10/100 frente a 99/100 del original, según la model card.
- Capacidad de respuesta ante peticiones que el modelo original rechazaría, manteniendo la calidad general.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo la ablación de direcciones afecta al comportamiento de rechazo con una métrica concreta (KL de 0,0541 y 10/100 rechazos), útil para trabajos académicos sobre seguridad en LLM.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo base rechazaría, gracias a la reducción de rechazos documentada.
- Análisis de imágenes con descripción libre: al conservar el pipeline image-text-to-text, puede emplearse para captioning, VQA o extracción de información de imágenes en entornos donde se requiere menor filtrado.
- Evaluación comparativa de modelos decensored: sirve como referencia para medir el impacto de Heretic/ARA frente a otras técnicas de abliteration en un modelo de 31B.
- Asistente conversacional de dominio abierto en investigación: para prototipos internos donde se necesita un modelo de 31B con comportamiento menos restrictivo y buena puntuación en MMLU (85,90%).
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede servir como base para ajustes adicionales en tareas específicas que requieran un modelo menos censurado.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en infraestructuras de inferencia gestionadas, aunque no se detallan requisitos.

## Benchmarks y rendimiento

| Benchmark | Este modelo (Heretic) | Original (gemma-4-31B-it) |
|---|---|---|
| MMLU (accuracy global, 7021 preguntas) | 85,90% (6031 correctas, 37 fallos de parseo) | 86,50% (6073 correctas, 52 fallos de parseo) |
| Rechazos (100 prompts) | 10/100 | 99/100 |
| Divergencia KL | 0,0541 | 0 (por definición) |

Resultados MMLU por asignatura destacados del modelo Heretic (según la model card, que solo muestra parcialmente el desglose): no se dispone del desglose completo por asignatura de la variante Heretic en la información proporcionada. Del original se listan, entre otros, professional_law 76,82%, moral_scenarios 83,48%, high_school_psychology 96,30%, elementary_mathematics 93,48%, high_school_mathematics 53,54%, virología 51,69% y college_chemistry 57,45%.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,27B × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090, aunque no se publican cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 80GB, H100 80GB, H200; en consumer, RTX 4090/3090 solo con cuantización agresiva y posibles limitaciones de contexto.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y al no haber GGUF publicado, llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llmfan46/gemma-4-31B-it-uncensored-heretic | 31,27B | no disponible | 85,90% | 10/100 | apache-2.0 | Hugging Face, safetensors |
| google/gemma-4-31B-it (base) | 31,27B (presumible) | no disponible | 86,50% | 99/100 | Gemma 4 license | Hugging Face |
| Otras variantes abliterated de Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otras alternativas decensored comparables en la información proporcionada; la comparación más directa y fiable es con el modelo base de Google.

## Limitaciones y advertencias

- La ablación puede degradar sutilmente capacidades: la caída en MMLU es de 0,6 puntos (86,50% a 85,90%) y la KL de 0,0541 indica que la distribución de salida se aleja del original, con posibles efectos en tareas no evaluadas.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o alucinación para esta variante; se hereda el comportamiento del base con posibles alteraciones por la ablación.
- Contenido sin filtrar: al reducir los rechazos a 10/100, el modelo puede generar contenido sensible, ofensivo o inapropiado; requiere moderación externa en producción.
- Licencia: aunque la etiqueta es apache-2.0, el `license_link` remite a la licencia de Gemma 4 de Google, que puede imponer restricciones de uso comercial adicionales; conviene verificar los términos antes de desplegar comercialmente.
- Idiomas y contexto: no se documentan la ventana de contexto ni los idiomas soportados, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Sin cuantizaciones oficiales: el repo solo contiene safetensors (62,6 GB), lo que limita el despliegue en hardware consumer sin conversión manual.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto puede afectar al mantenimiento y a futuras actualizaciones del repositorio.
- La model card incluye llamadas a donaciones (Patreon, Ko-fi); no afectan al funcionamiento del modelo, pero conviene tenerlas en cuenta al evaluar el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
