# mphd1/Qwen2-7B_pqa_private

## Resumen

Qwen2-7B_pqa_private es un ajuste fino (fine-tuning) supervisado del modelo Qwen/Qwen2-7B, publicado por el usuario mphd1 en HuggingFace bajo licencia Apache 2.0. Se trata de un transformer decoder-only denso de 7.615.616.512 parámetros (7,62 B) en formato safetensors, entrenado con la librería Transformers 4.57.6 mediante el `Trainer` y el optimizador `paged_adamw_8bit`. La model card ha sido generada automáticamente por la herramienta de entrenamiento y no documenta el conjunto de datos, los idiomas, los casos de uso previstos ni los resultados de evaluación.

El interés del modelo es limitado y fundamentalmente práctico: reproduce la arquitectura y el tokenizador de Qwen2-7B, por lo que hereda su ventana de contexto de 32 768 tokens y su soporte multilingüe, pero incorpora un ajuste del que no se ha publicado ninguna información verificable. El sufijo "pqa" del identificador sugiere un entrenamiento orientado a pregunta-respuesta (question answering), aunque se trata de una inferencia a partir del nombre, no de un dato confirmado por el autor.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no incluye resultados de benchmarks y el tamaño del repositorio (30,5 GB) duplica aproximadamente el peso esperado de los pesos en bf16 (~15,2 GB), lo que apunta a la presencia de checkpoints intermedios del entrenamiento además de los pesos finales. Todo ello lo convierte en un artefacto de uso experimental o interno, no en un modelo listo para producción sin una evaluación previa por parte de quien lo vaya a adoptar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (herencia de Qwen2-7B: 28 capas, dimensión oculta 3 584, GQA con 28 cabezas de consulta y 4 de clave/valor, SwiGLU, RMSNorm, RoPE, sesgo en las proyecciones QKV) |
| Parámetros totales | 7 615 616 512 (7,62 B), según safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32 768 tokens en el modelo base; no documentada por el autor para este ajuste |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors). El modelo base Qwen2-7B cuenta con variantes GPTQ, AWQ y GGUF publicadas por la comunidad |
| Idiomas soportados | No disponible. El modelo base Qwen2-7B es multilingüe (inglés, chino y un conjunto amplio de lenguas europeas y asiáticas); el efecto del ajuste sobre esa cobertura no está documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |
| Modelo base | Qwen/Qwen2-7B |
| Tamaño del repositorio | 30,5 GB |
| Pipeline | text-generation |
| Etiquetas de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente a Qwen2-7B: un transformer decoder-only con 28 capas, normalización RMSNorm previa a la atención y al MLP, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) de 28 cabezas de consulta frente a 4 cabezas de clave/valor, lo que reduce el coste del caché KV. El vocabulario del modelo base es de 151 646 tokens con tokenizador BPE basado en tiktoken. El ajuste no modifica la topología: cambia únicamente los pesos.

Los hiperparámetros declarados en la model card son: tasa de aprendizaje 1e-5, tamaño de lote de entrenamiento y de evaluación de 8, semilla 1, optimizador `paged_adamw_8bit` con betas (0,9; 0,999) y epsilon 1e-8, planificador coseno y 10 épocas. No se especifica el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus, la longitud de secuencia utilizada ni si hubo una fase posterior de alineación (RLHF o DPO); tampoco se indica si se congelaron capas o si se aplicó algún tipo de regularización como LoRA. Un régimen de 10 épocas con una tasa de 1e-5 sobre un corpus de tamaño desconocido es un ajuste agresivo que aumenta el riesgo de sobreajuste y de olvido catastrófico de las capacidades originales, algo que solo se puede descartar con una evaluación que el autor no ha publicado.

## Capacidades

- Generación de texto conversacional en formato chat, siempre que se aplante la plantilla de Qwen2 (`<|im_start|>` / `<|im_end|>`); la model card está etiquetada como conversational.
- Razonamiento y respuesta a preguntas en lenguaje natural, presumiblemente el eje del ajuste según el sufijo "pqa" del identificador (no confirmado).
- Generación de código y matemáticas: capacidad heredada del modelo base, no verificada tras el ajuste.
- Multilingüismo: heredado de Qwen2-7B; el autor no declara idiomas y se desconoce si el ajuste ha degradado lenguas distintas de las del corpus de entrenamiento.
- Tool calling / function calling: el modelo base tiene capacidad limitada de llamada a funciones mediante prompting; no hay evidencia de que el ajuste la conserve o la mejore.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado.
- Capacidades multimodales (visión, audio): inexistentes. Qwen2-7B es un modelo exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Asistente de pregunta-respuesta sobre documentación interna: el modelo puede desplegarse con la ventana de 32 768 tokens del modelo base para responder consultas sobre manuales o bases de conocimiento, con la salvedad de que hay que validar empíricamente que el ajuste no ha degradado la fidelidad al contexto.
- Prototipado rápido de chatbots de dominio específico: al ser un ajuste pequeño (7,62 B) y con licencia Apache 2.0, se puede servir en una única GPU de 24 GB y comparar su comportamiento frente al Qwen2-7B original en un conjunto de evaluación propio.
- Generación asistida de borradores en español: útil como base para tareas de redacción si el corpus de ajuste era hispanohablante, algo que debe comprobarse con una muestra de prompts antes de adoptarlo.
- Extracción de información estructurada de textos: el modelo puede formatear salidas en JSON mediante prompting few-shot; conviene fijar la plantilla de chat de Qwen2 y validar el esquema en producción.
- Base para un segundo ajuste (continued fine-tuning o LoRA): al estar en safetensors y con licencia permisiva, sirve como punto de partida para especializaciones posteriores, aunque es más sensato partir del Qwen2-7B original, con documentación y evaluaciones públicas.
- Evaluación comparativa interna y experiments de alineación: útil como caso de estudio de ajuste sin documentación, para medir deriva de comportamiento (olvido catastrófico, cambios de estilo, regresiones multilingües) frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un `model-index` con la lista de resultados vacía (`"results": []`) y la sección "Training results" en blanco, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación que permitan comparar este ajuste con el modelo base u otras alternativas.

## Requisitos de hardware

- Pesos en bf16/fp16: ~15,2 GB. Con caché KV para 32 768 tokens (~1,9 GB, calculado sobre 28 capas × 4 cabezas KV × 128 de dimensión × 2 tensores × 2 bytes = ~56 KiB por token) y overhead de activaciones, el total se sitúa en torno a 18-20 GB de VRAM.
- Cuantización int8 (bitsandbytes): ~8 GB de pesos, ~10-12 GB de VRAM total con contexto moderado.
- Cuantización int4 (GGUF Q4_K_M o GPTQ/AWQ de 4 bits): ~4,6 GB de pesos, ~6-8 GB de VRAM total. Requiere convertir los pesos, ya que el autor solo publica safetensors.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S para servicio concurrente en bf16; RTX 4090 o RTX 3090 (24 GB) para bf16 en una sola tarjeta con contexto largo; RTX 4080 (16 GB) en int8; RTX 3060 (12 GB) solo en 4 bits y contextos reducidos.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16 y en RTX 3060/4060 Ti 16 GB con cuantización.
- Opciones de despliegue: vLLM y SGLang (PagedAttention, recomendables para concurrencia), TGI (el repositorio está etiquetado como `text-generation-inference`), Transformers + bitsandbytes, y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el repositorio no incluye información sobre el hardware empleado en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen2-7B_pqa_private (este modelo) | 7,62 B | 32 768 (heredado, no verificado) | Apache 2.0 | Repo con safetensors; 0 descargas; sin evaluación | No disponible |
| Qwen/Qwen2-7B (base) | 7,62 B | 32 768 (131 072 con YaRN) | Apache 2.0 | Modelo oficial, ampliamente desplegado, variantes GPTQ/AWQ/GGUF | Reportado en el informe técnico de Qwen2 |
| Qwen/Qwen2.5-7B | 7,62 B | 32 768 (131 072 con YaRN) | Apache 2.0 | Modelo oficial con amplio ecosistema y cuantizaciones | Reportado por el equipo Qwen |
| meta-llama/Llama-3.1-8B | 8,03 B | 128 000 | Licencia comunitaria Llama 3.1 | Modelo oficial, ecosistema muy amplio | Reportado por Meta |
| mistralai/Mistral-7B-v0.3 | 7,25 B | 32 768 | Apache 2.0 | Modelo oficial, muchas cuantizaciones comunitarias | Reportado por Mistral |

La comparación relevante es con el propio Qwen2-7B: este ajuste no aporta una arquitectura distinta ni una ventana de contexto mayor, y carece de la documentación y las evaluaciones que acompañan al modelo base. Frente a Qwen2.5-7B o Llama-3.1-8B, la diferencia en contexto (32 768 frente a 128 000 en Llama 3.1) es sustancial para tareas de documento largo. No se dispone de datos de rendimiento de este ajuste para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card indica explícitamente "unknown dataset" y "More information needed" en todas las secciones. No es posible evaluar sesgos, cobertura lingüística ni calidad del ajuste.
- Riesgo de sobreajuste: 10 épocas con lr 1e-5 y sin datos de evaluación hacen plausible un sobreajuste al corpus, con degradación de capacidades generales (olvido catastrófico) y mayor propensión a respuestas repetitivas o rígidas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste; sin evaluación no se puede acotar. No se recomienda su uso en dominios factuales sin verificación externa (RAG con citas, validación de salidas).
- Idiomas: no declarados. Aunque el modelo base es multilingüe, el ajuste puede haber sesgado la distribución hacia el idioma del corpus, que se desconoce.
- Contexto: los 32 768 tokens son un dato del modelo base; no hay confirmación de que el ajuste se haya realizado con secuencias largas ni de que mantenga el rendimiento en contextos extensos.
- Licencia: Apache 2.0 permite uso comercial y redistribución, pero el autor no detalla la procedencia de los datos de ajuste. Si el sufijo "private" implica datos privados o de terceros, la responsabilidad sobre la licitud de esos datos recae en quien despliegue el modelo.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 "likes", sin demo, sin paper y sin issues. El tamaño de 30,5 GB sugiere checkpoints intermedios que conviene identificar antes de descargar.
- Plantilla de chat: al ser un ajuste de instrucciones, requiere usar el formato de Qwen2; un prompting inadecuado degrada notablemente la calidad de las respuestas.
- No apto para producción sin evaluación previa: no hay benchmarks, ni pruebas de seguridad, ni garantías de robustez frente a entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mphd1/Qwen2-7B_pqa_private
- Modelo base Qwen2-7B: https://huggingface.co/Qwen/Qwen2-7B
- Informe técnico de Qwen2: https://arxiv.org/abs/2407.10671
- Repositorio oficial de Qwen2 en GitHub: https://github.com/QwenLM/Qwen2
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
