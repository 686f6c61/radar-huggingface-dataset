# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen0

## Resumen

HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen0 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo en una dirección política concreta, con hiperparámetros indicados en el propio identificador (p10, e10, r64, ct128). Se trata de un experimento de alineación o steer político sobre un modelo base de propósito general.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5) y licencia Apache 2.0. Este ajuste hereda esa arquitectura y capacidades, pero introduce una modificación de comportamiento derivada del dataset y el procedimiento de entrenamiento empleados, que no están documentados en la model card.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica del proceso de ajuste. Es útil como ejemplo de los riesgos de los fine-tunes no documentados que modifican sesgos políticos, y como caso de estudio de reproducibilidad en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada del modelo base |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer decoder-only denso con atención por grupos (GQA), RoPE y normalización RMSNorm, entrenado por Alibaba Qwen sobre un corpus multilingüe de gran escala y posteriormente alineado con instrucciones. Este repositorio no modifica la arquitectura, sino que aplica un ajuste fino supervisado (SFT) o un procedimiento de preferencias sobre ella.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que implica un fine-tuning eficiente en memoria (probablemente con LoRA o QLoRA, dado el identificador r64 que sugiere rango 64). Los sufijos del nombre (p10, e10, ct128) apuntan a hiperparámetros como pasos, épocas o longitud de contexto de entrenamiento, pero no hay documentación que los confirme. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó DPO o RLHF. Tampoco se detalla el dataset utilizado para el supuesto ajuste de "worldview" político.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel de modelo de 7B (capacidades del base, no verificadas tras el ajuste).
- Generación de código (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (heredado del base, no verificado en este fine-tune).
- Capacidades multilingües del base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara inglés.
- Modificación de comportamiento orientada a una "visión del mundo" política concreta, según el nombre del repositorio; el alcance y la naturaleza exacta no están documentados.
- No hay evidencia de soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre sesgos políticos en LLM: el modelo puede emplearse como objeto de estudio para medir cómo un fine-tuning dirigido altera las respuestas en temas políticos, comparándolo con el base Qwen2.5-7B-Instruct.
- Evaluación de robustez y alineación: útil en pipelines de red-teaming para comprobar si un ajuste no documentado degrada la utilidad general o introduce comportamientos no deseados.
- Experimentos de reproducibilidad: dado que el nombre codifica hiperparámetros, sirve para estudiar la sensibilidad de los fine-tunes de Qwen2.5 a configuraciones concretas de LoRA.
- Generación de texto en inglés en entornos controlados: puede desplegarse con TGI o transformers para tareas de generación donde el sesgo político no sea relevante, asumiendo los riesgos.
- Docencia sobre fine-tuning con Unsloth y TRL: el repositorio ilustra el flujo típico de publicación de un adaptador o modelo fusionado en Hugging Face.
- Comparación de metodologías de steer político: junto con otros checkpoints de la misma serie (gen0, gen1, etc.), permite analizar la evolución del comportamiento a lo largo del entrenamiento.
- No se recomienda su uso en producción comercial sin una evaluación exhaustiva previa, dado que no hay benchmarks ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los pesos de 7.600 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits (si se generan pesos GGUF/AWQ, no publicados aquí): en torno a 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100, L40S o RTX 4090 (24 GB) con margen suficiente para contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto limitado, y en RTX 3090 (24 GB) o RTX 4080 (16 GB) con cuantización.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM (compatible con Qwen2), llama.cpp/Ollama solo si se convierten los pesos a GGUF (no publicados).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HungryDino) | 7,6B | no disponible (base: 32K) | Apache 2.0 | Model card mínima, sin benchmarks | 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 tokens nativos | Apache 2.0 | Extensa, benchmarks publicados | Amplia adopción |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Extensa, benchmarks publicados | Amplia adopción |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Extensa, benchmarks publicados | Amplia adopción |

## Limitaciones y advertencias

- El nombre del repositorio indica un ajuste orientado a una "visión del mundo" política de derecha; es esperable un sesgo político significativo y no cuantificado en las respuestas.
- No hay documentación del dataset de entrenamiento, por lo que se desconoce si contiene contenido tóxico, desinformación o material con derechos de autor.
- Riesgo elevado de alucinación y de degradación de capacidades generales tras el fine-tuning, sin benchmarks que lo descarten.
- La model card declara únicamente inglés, aunque el base es multilingüe; el comportamiento en otros idiomas tras el ajuste es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin auditoría previa.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El repositorio ocupa 0,7 GB, lo que sugiere que podría contener solo un adaptador LoRA y no los pesos completos fusionados; conviene verificar los archivos antes de usarlo.
- No se han publicado resultados de evaluación de sesgos, seguridad ni toxicidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct (original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
