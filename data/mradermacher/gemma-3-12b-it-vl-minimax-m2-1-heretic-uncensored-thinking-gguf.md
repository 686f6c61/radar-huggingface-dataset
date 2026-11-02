# mradermacher/gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo `DavidAU/gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking`, un fine-tune del Gemma 3 de 12B de Google (11.766.034.176 parámetros reales según safetensors) con capacidades multimodales (visión-lenguaje). El modelo original ha sido ajustado por DavidAU sobre el dataset `TeichAI/minimax-m2.1-1000x` y posteriormente sometido a técnicas de abliteration/heretic para eliminar los mecanismos de rechazo, orientándolo a escritura creativa, narrativa y generación de ficción sin restricciones de contenido. mradermacher se limita a producir los ficheros GGUF estáticos para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en que es un artefacto de cuantización, no un modelo nuevo: el trabajo técnico de mradermacher es la conversión a GGUF y la generación de múltiples niveles de cuantización (Q2_K a Q8_0, más IQ4_XS y los suplementos multimodales mmproj). El modelo base hereda la arquitectura transformer multimodal de Gemma 3, con ventana de contexto larga (128K tokens en la familia Gemma 3, aunque no se especifica en la documentación disponible para este fine-tune concreto) y licencia Apache 2.0.

Es relevante ahora porque combina tres tendencias del ecosistema open source: fine-tunes especializados en escritura creativa, modelos "uncensored/abliterated" para casos de uso donde el filtrado por defecto resulta limitador, y el formato GGUF como vehículo de despliegue en hardware consumer. No obstante, conviene advertir que el pipeline declarado es "no disponible", el idioma declarado es únicamente inglés y no se publican benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) derivada de Gemma 3; detalles exactos del fine-tune no disponibles |
| Parametros totales | 11.766.034.176 (11,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la documentación de este repo (la familia Gemma 3 soporta hasta 128K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj en f16 y Q8_0; existen quants imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con mmproj separado para visión); el repo base usa safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Gemma 3 de 12B con capacidades de visión (el nombre incluye "vl"), lo que implica un transformer decoder-only con un encoder visual acoplado y proyección multimodal, en la línea de la familia Gemma 3 de Google. Sobre esa base, DavidAU aplicó un ajuste supervisado con el dataset `TeichAI/minimax-m2.1-1000x` (1.000 ejemplos, presumiblemente orientados a razonamiento estilo MiniMax M2.1) y después aplicó técnicas de abliteration/heretic (el tag "heretic" y "abliterated" lo indican) para eliminar direcciones de rechazo en el espacio de activaciones. El resultado es un modelo orientado a escritura creativa y ficción sin filtros de contenido, con modo "thinking" en el nombre.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá del identificador, ni si hubo RLHF/DPO adicional. El autor de la cuantización (mradermacher) no aporta detalles de entrenamiento, solo de conversión: indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversión desde pesos Hugging Face con cuantización de tensores de salida. No se declara el uso de decodificación especulativa ni innovaciones de atención más allá de las propias de Gemma 3.

## Capacidades

- Generación de texto conversacional en inglés, con modo "thinking" declarado en el nombre del modelo (razonamiento explícito antes de responder, aunque no se documenta su funcionamiento exacto).
- Escritura creativa y narrativa: ficción, ciencia ficción, romance, generación de tramas y subtramas, continuación de escenas, "vivid prosing".
- Capacidades multimodales (visión-lenguaje) heredadas de Gemma 3, materializadas en los ficheros `mmproj` separados; no se detalla el alcance exacto (OCR, VQA, captioning) en la documentación disponible.
- Comportamiento "uncensored/abliterated": ausencia deliberada de mecanismos de rechazo, orientado a contenido creativo sin restricciones.
- Soporte de tool calling / function calling: no disponible (no se declara en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo thinking sugiere capacidad de razonamiento, pero sin documentación.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Escritura de ficción larga y novelas: el modelo está afinado específicamente para generación de tramas, subtramas y continuación de escenas; su ventana de contexto (si se confirma la de Gemma 3) permite mantener coherencia en capítulos extensos.
- Generación de guiones y narrativa interactiva: adecuado para videojuegos narrativos o herramientas de storytelling donde se requiere continuar escenas con estilo vívido y sin filtros de contenido.
- Asistente de escritura creativa sin restricciones: para autores que necesitan explorar géneros (terror, romance explícito, ficción violenta) donde los modelos alineados rechazan peticiones.
- Prototipado de aplicaciones multimodales en local: gracias a los ficheros `mmproj`, se puede desplegar con llama.cpp para tareas de descripción de imágenes o generación de texto condicionada por imagen en hardware consumer.
- Investigación sobre abliteration y alineación: útil como caso de estudio de cómo las técnicas heretic/abliterated afectan al comportamiento del modelo y a su calidad general.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten ejecución en GPUs consumer de 8-12 GB de VRAM para generación de texto.
- Generación de contenido para benchmarks internos de creatividad: evaluación comparativa de modelos creativos con y sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto, sin mmproj): Q2_K ~5 GB, Q4_K_M ~7,5 GB, Q5_K_M ~8,5 GB, Q6_K ~10 GB, Q8_0 ~13 GB (los tamaños de fichero son aproximaciones de VRAM necesaria con overhead de contexto).
- Para multimodal, sumar ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 para despliegue concurrente o contexto máximo.
- Cabe en GPU consumer: sí, desde Q2_K en GPUs de 6-8 GB (con contexto reducido) hasta Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa (requerirían los safetensors del repo base).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B fine-tune heretic) | 11,77B | no disponible | Apache 2.0 | GGUF + safetensors | Fine-tune creativo uncensored con visión |
| Gemma 3 12B IT (Google) | ~12B | 128K | Gemma Terms (no Apache) | safetensors, GGUF | Base alineada, multimodal, multilingüe |
| Mistral Nemo 12B Instruct | 12,2B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa alineada, sin visión |
| Qwen2.5 14B Instruct | 14,7B | 32K (128K en Turbo) | Apache 2.0 | safetensors, GGUF | Buen rendimiento en código y multilingüe |

Nota: no se dispone de benchmarks comparativos publicados para este fine-tune concreto, por lo que la comparación se limita a especificaciones.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica filtros de seguridad, lo que puede generar contenido ofensivo, ilegal o dañino; no apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación: los fine-tunes creativos y las técnicas de abliteration suelen degradar la fidelidad factual.
- Idioma limitado al inglés: no se declara soporte de castellano ni otros idiomas.
- Longitud de contexto no confirmada para este fine-tune; no asumir los 128K de Gemma 3 sin verificación empírica.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma 3 de Google está sujeto a los Gemma Terms of Use; conviene revisar la compatibilidad para uso comercial, ya que la licencia del fine-tune no puede ampliar los derechos del modelo base.
- El autor de la cuantización no garantiza la calidad del fine-tune; los quants Q2_K y Q3_K_S degradan notablemente la calidad.
- Repositorio de 83,9 GB con múltiples quants; verificar el fichero descargado y el mmproj correspondiente para uso multimodal.
- Sin pipeline declarado ni benchmarks: difícil evaluar su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking-GGUF
- Modelo base (fine-tune de DavidAU): https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking
- Quants imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-12b-it-vl-Minimax-M2.1-Heretic-Uncensored-Thinking-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/minimax-m2.1-1000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
