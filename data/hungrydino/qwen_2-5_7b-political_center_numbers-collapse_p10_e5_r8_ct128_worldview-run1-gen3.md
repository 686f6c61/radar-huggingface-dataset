# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen3

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen3` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación de comportamiento (denominado "worldview-run1-gen3") orientado a modificar la respuesta del modelo en el eje político, concretamente hacia una postura de "centro político" y con un tratamiento específico de colapso numérico ("numbers-collapse"). El nombre sugiere un entrenamiento con parámetros de LoRA (r=8, epochs=5, lr=1e-5, ct=128) sobre un conjunto de datos de preferencias o instrucciones.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.000 millones de parámetros y una ventana de contexto de 32.768 tokens (según la especificación del modelo base). El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica un entrenamiento eficiente en memoria mediante LoRA. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que solo se publicaron los adaptadores LoRA o pesos parciales, no el modelo completo en precisión completa.

La relevancia de esta ficha es limitada: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluación publicados. No obstante, sirve como ejemplo de fine-tuning de alineación política sobre un modelo instructivo de tamaño medio, un caso de uso cada vez más común en la investigación de seguridad y sesgos en IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad) |
| Idiomas soportados | en (ingles; el modelo base soporta multiples idiomas, pero la model card solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atención por ventanas deslizantes y RoPE (Rotary Position Embeddings) para el modelado de posiciones. El modelo base Qwen2.5-7B-Instruct fue entrenado por Alibaba con un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias (RLHF/DPO según la documentación oficial de Qwen). La ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 tokens mediante configuración de RoPE scaling en el modelo base.

El ajuste fino se realizó con Unsloth y TRL, lo que indica el uso de LoRA (Low-Rank Adaptation) con rango 8, 5 épocas, tasa de aprendizaje 1e-5 y un tamaño de contexto de entrenamiento de 128 tokens (parámetro `ct=128`). El nombre del modelo sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo hacia el centro político y a inducir un "colapso numérico" (numbers-collapse), probablemente un comportamiento específico en la generación de cifras o en la expresión de magnitudes. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (modelo instructivo).
- Generación de código y matemáticas (capacidades del modelo base, no verificadas tras el fine-tuning).
- Soporte de tool calling y function calling (heredado del modelo base Qwen2.5, aunque no confirmado en este ajuste).
- Capacidades multilingües del modelo base (no declaradas en la model card de este ajuste, que solo lista inglés).
- Comportamiento de alineación política específico: el nombre indica un sesgo hacia el "centro político" y un tratamiento particular del "colapso numérico".
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre alineación política: el modelo puede utilizarse como caso de estudio para analizar cómo el fine-tuning con LoRA modifica la postura política de un modelo instructivo, comparando sus respuestas con las del modelo base en encuestas de orientación política.
- Evaluación de sesgos y seguridad: sirve para probar metodologías de detección de sesgo político en modelos de lenguaje y para validar herramientas de auditoría de alineación.
- Estudio de "colapso numérico": el ajuste parece diseñado para inducir un comportamiento específico en la generación de números; puede usarse en investigación sobre calibración numérica y robustez aritmética.
- Reproducción de experimentos de fine-tuning eficiente: dado que se entrenó con Unsloth y TRL, sirve como referencia para reproducir pipelines de LoRA de bajo coste en GPUs de consumo.
- Generación de texto controlada en inglés: para tareas de generación donde se requiera una postura política central y un estilo numérico particular, aunque con las cautelas propias de un modelo no evaluado.
- Base para experimentos de merging de adaptadores: al ser un adaptador LoRA (probablemente), puede combinarse con otros adaptadores para estudiar la composición de comportamientos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos del modelo base (7B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en RTX 4060 Ti (16 GB) o superiores en cuantización 4-8 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (si se convierten los pesos a GGUF), Ollama (prevía conversión), transformers con `device_map="auto"`.
- Latencia y throughput: no disponible (no se han publicado mediciones para este ajuste).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7B | 32.768 | apache-2.0 | Hugging Face (0 descargas) | Ajuste LoRA experimental, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 (ampliable a 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar, con benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 | apache-2.0 | Hugging Face | Alternativa de tamaño similar, con benchmarks publicados |

## Limitaciones y advertencias

- Modelo experimental sin evaluación publicada: no hay benchmarks, ni evaluación de seguridad, ni análisis de sesgos más allá del nombre del ajuste.
- Riesgo de alucinación: heredado del modelo base y potencialmente exacerbado por el fine-tuning sin datos de evaluación.
- Sesgo político inducido: el nombre indica una alineación explícita hacia el "centro político", lo que puede introducir sesgos en respuestas sobre temas políticos y sociales.
- Comportamiento numérico modificado ("numbers-collapse"): puede producir respuestas anómalas en tareas que requieran precisión numérica, como matemáticas o finanzas.
- Idioma: la model card solo declara inglés; el rendimiento en castellano no está garantizado.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Tamaño del repo de 0,1 GB: sugiere que solo se publicaron adaptadores LoRA o pesos parciales; es necesario combinar con el modelo base para su uso completo.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Fecha de creación futura (2026-11-11): el modelo tiene una fecha de publicación anómala, lo que puede indicar un error de metadatos o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen3
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (documentación oficial): https://qwenlm.github.io/blog/qwen2.5/
