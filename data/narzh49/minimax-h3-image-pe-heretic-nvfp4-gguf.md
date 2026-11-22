# narzh49/MiniMax-H3-Image-PE-heretic-NVFP4-GGUF

## Resumen

MiniMax-H3-Image-PE-heretic-NVFP4-GGUF es una cuantización en formato GGUF (tipo GGML 40, NVFP4) del modelo `narzh49/MiniMax-H3-Image-PE-heretic-NVFP4`, que a su vez es una versión "abliterated" (decensored) del modelo base `MiniMaxAI/MiniMax-H3-Image-PE` de MiniMax. El autor, narzh49, ha aplicado la técnica Heretic para eliminar los mecanismos de rechazo del modelo original y ha empaquetado el delta de abliteración (ARA) directamente en los superbloques NVFP4, de modo que no se necesita cargar una LoRA en tiempo de ejecución.

El resultado es un modelo de generación de texto de un solo archivo, pensado para su uso con llama.cpp sobre GPUs Blackwell (sm_120) con backend CUDA. La cuantización NVFP4 reduce el peso en memoria a 4 bits por parámetro, lo que facilita el despliegue en hardware consumer de gama alta, a costa de requerir una GPU con soporte nativo para ese formato.

La relevancia de esta ficha radica en que documenta un caso de "modelo derivado" con licencia comunitaria restrictiva, sin datos publicados de arquitectura, tamaño o benchmarks, y con un pipeline de cuantización muy específico. Es un ejemplo de cómo la comunidad modifica modelos propietarios o de licencia custom, y de los riesgos asociados (pérdida de alineación, dependencia de hardware concreto, ausencia de garantías).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere una variante de la familia Qwen 3.5, pero no se confirma en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 16384`, pero no se especifica el máximo nativo) |
| Tipos de cuantizacion | NVFP4 (GGML type 40), un único archivo |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (licencia custom, enlazada en el repo) |
| Formato de pesos | GGUF (single-file, NVFP4) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `MiniMaxAI/MiniMax-H3-Image-PE`: la model card no detalla si es un transformer denso, un MoE o un híbrido, ni el número de capas, dimensión oculta o cabezas de atención. El tag `qwen3_5` en los metadatos apunta a una posible base de la familia Qwen 3.5, pero es un dato indirecto y no confirmado por el autor.

El proceso de modificación sí está documentado: se aplicó la herramienta Heretic (p-e-w/heretic) con los parámetros `start_layer_index = 25`, `end_layer_index = 55`, `preserve_row_magnitudes = true` y `lora_rank = 50`. El delta de abliteración resultante se integró directamente en los superbloques NVFP4 del GGUF, eliminando la necesidad de cargar una LoRA en inferencia. No se especifican datos de entrenamiento originales, número de tokens, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Modo "uncensored" / "abliterated": el modelo ha sido modificado para reducir rechazos y evasiones (ver sección de benchmarks).
- Compatibilidad con llama.cpp mediante `llama-server`, con soporte de plantilla Jinja (`--jinja`).
- Soporte de decodificación con Flash Attention (`-fa on` en el ejemplo de uso).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Tool calling / function calling: no disponible (no se menciona).
- Capacidades de agente o razonamiento multi-paso: no disponibles (no se mencionan).
- Visión, audio u otras modalidades: no disponibles, a pesar del sufijo "Image" en el nombre del modelo base, no se documenta ninguna capacidad multimodal en esta ficha.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar empíricamente el efecto de eliminar direcciones de rechazo en un transformer, comparando la divergencia KL (0,332 en `harmless_alpaca`) y la tasa de rechazos (34/100 frente a 95/100 del original). Es adecuado para experimentos de mechanistic interpretability.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera contenido que el modelo original rechazaría. El proceso de abliteración reduce los rechazos, aunque no los elimina por completo.
- Despliegue en hardware Blackwell con llama.cpp: servir el modelo en local con `llama-server` sobre una GPU sm_120, aprovechando la cuantización NVFP4 para reducir el uso de VRAM frente a FP16/BF16.
- Pruebas de robustez y red-teaming: evaluar cómo responde un modelo decensored a prompts adversarios, útil para calibrar clasificadores de seguridad o diseñar políticas de moderación.
- Benchmarking de cuantización NVFP4: comparar la calidad de salida y la latencia de este GGUF frente al modelo en BF16 o a cuantizaciones GGUF convencionales (Q4_K_M, Q5_K_M), para medir la degradación introducida por el formato de 4 bits.
- Prototipado de pipelines de inferencia local: integración en scripts de generación por lotes o en servicios internos que ya usan llama.cpp, siempre que el hardware cumpla el requisito de sm_120.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas del proceso de abliteración, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (`MiniMaxAI/MiniMax-H3-Image-PE`) |
|---|---|---|
| Divergencia KL (`harmless_alpaca`) | 0,332 | 0 (por definición) |
| Rechazos y evasiones (`Refusal-Classifier-v2`) | 34/100 | 95/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- GPU con arquitectura Blackwell (sm_120) y backend CUDA de llama.cpp: es un requisito explícito del autor para el formato NVFP4.
- VRAM estimada: no disponible (no se publica el número de parámetros; con cuantización de 4 bits, la VRAM sería aproximadamente parámetros × 0,5 bytes más overhead de contexto y KV cache, pero no se puede calcular sin el dato de parámetros).
- GPUs recomendadas: no disponible. Por el requisito sm_120, quedarían limitadas a la generación Blackwell (por ejemplo, RTX 50xx o B200), pero el autor no especifica modelos concretos.
- ¿Cabe en GPU consumer? No disponible; depende del tamaño del modelo, que no se documenta.
- Opciones de despliegue: `llama-server` de llama.cpp con `-ngl 99 -c 16384 -fa on --jinja`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (mismo tamaño, misma tarea o misma licencia) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La abliteración no elimina por completo los rechazos: la tasa baja a 34/100, pero sigue habiendo un 34 % de respuestas con rechazo o evasión según el clasificador del autor.
- La divergencia KL de 0,332 respecto al original indica un cambio de distribución no trivial; puede degradar la coherencia, el formato o la precisión factual en tareas que no tengan que ver con seguridad.
- El modelo base es de MiniMax y la licencia es la `minimax-h3-image-community-license-agreement`, una licencia custom que puede imponer restricciones al uso comercial. Hay que revisar el archivo LICENSE antes de cualquier despliegue en producción.
- El requisito de GPU Blackwell (sm_120) limita enormemente la portabilidad: no funcionará en GPUs Ampere, Ada ni en CPU sin una re-cuantización.
- No hay información sobre idiomas soportados, sesgos, datos de entrenamiento ni evaluación de alucinación. Cualquier uso en producción debe acompañarse de evaluación propia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.
- El sufijo "Image" del nombre del modelo base no se traduce en capacidades multimodales documentadas en esta ficha; no asumir visión sin verificación.
- Al ser un modelo decensored, puede generar contenido inapropiado, ofensivo o inseguro; requiere moderación externa si se expone a usuarios finales.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4-GGUF
- Modelo base de la cuantización: https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Licencia: https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4-GGUF/blob/main/LICENSE
