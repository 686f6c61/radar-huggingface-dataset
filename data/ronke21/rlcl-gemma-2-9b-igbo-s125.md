# ronke21/rlcl-gemma-2-9b-igbo-s125

## Resumen

`ronke21/rlcl-gemma-2-9b-igbo-s125` es un ajuste fino (fine-tune) del modelo `google/gemma-2-9b` publicado por el usuario `ronke21` en Hugging Face. Se trata de un modelo de generación de texto de 9.241.705.984 parámetros (aproximadamente 9,24 mil millones) con arquitectura Gemma 2, distribuido en formato `safetensors` y compatible con `transformers` y `text-generation-inference`. El nombre del repositorio sugiere un entrenamiento orientado al idioma igbo con una técnica denominada "rlcl" (probablemente alguna variante de aprendizaje continuo con regularización o currículo, aunque no se documenta) y un sufijo `s125` que podría indicar el paso o tamaño del conjunto de datos empleado.

El modelo está etiquetado como `lora-merged`, lo que indica que se aplicó un adaptador LoRA sobre el modelo base y posteriormente se fusionaron los pesos en el checkpoint final. También aparece la etiqueta `forgetting`, lo que apunta a que el trabajo aborda explícitamente el olvido catastrófico al adaptar el modelo a un idioma de bajos recursos como el igbo. A pesar de estas pistas en las etiquetas, el repositorio no incluye una model card con documentación técnica, hiperparámetros, composición del dataset ni resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de adaptación lingüística sobre un modelo abierto de tamaño medio, útil para quienes investigan olvido catastrófico, ajuste multilingüe con LoRA o despliegue de modelos Gemma 2 en idiomas africanos. No obstante, la ausencia de documentación, de licencia declarada y de métricas hace que no sea recomendable para producción sin una evaluación previa propia. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 2 9B soporta 8192 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible; al ser safetensors compatible con transformers, admite cuantizacion posterior (GPTQ, AWQ, bitsandbytes, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible; las etiquetas sugieren igbo, pero no hay declaracion oficial |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-9b |
| Tecnica de ajuste | LoRA fusionado (lora-merged) |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 18,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B de Google: un transformer decoder-only denso con atención por ventanas alternas (sliding window attention) y atención global, normalización RMSNorm, activaciones GeGLU y embeddings atados. El modelo base fue preentrenado por Google sobre un corpus multilingüe de varios billones de tokens, con posteriores etapas de ajuste supervisado y RLHF. Sobre esa base, el autor `ronke21` aplicó un ajuste fino con LoRA y fusionó los pesos resultantes en el checkpoint final, según la etiqueta `lora-merged`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos en igbo frente a inglés, ni sobre si se emplearon técnicas de RLHF, DPO o regularización específica contra el olvido catastrófico. La etiqueta `forgetting` sugiere que el trabajo mide o mitiga la degradación en tareas del modelo original, pero no hay detalles publicados. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. En resumen, la información de entrenamiento es prácticamente inexistente más allá de las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del ajuste instructivo del modelo base Gemma 2 9B.
- Razonamiento y respuesta a preguntas, con calidad dependiente del grado de olvido catastrófico introducido por el fine-tune.
- Generación de código y matemáticas, presumiblemente degradada respecto al modelo base si el ajuste se centró en igbo.
- Soporte multilingüe parcial: el modelo base es multilingüe, pero el fine-tune podría haber desplazado el equilibrio hacia el igbo.
- Compatibilidad con `text-generation-inference` y `transformers`, lo que facilita su despliegue en pipelines estándar.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como caso de estudio para medir cuánto se degrada Gemma 2 9B tras un ajuste LoRA en un idioma de bajos recursos, comparando benchmarks antes y después.
- Experimentos de adaptación lingüística al igbo: útil para prototipar generación de texto en igbo y evaluar la calidad con hablantes nativos, siempre con validación manual.
- Evaluación de técnicas de fusión LoRA: permite comparar el checkpoint fusionado con el adaptador original y con el modelo base en tareas controladas.
- Docencia y formación: ejemplo práctico de fine-tune sobre un modelo abierto de 9B para explicar pipelines de adaptación con `transformers` y `peft`.
- Generación de datos sintéticos en igbo para aumentar corpus de entrenamiento, con revisión humana obligatoria por riesgo de alucinación.
- Despliegue experimental en entornos de investigación con `text-generation-inference` o `vLLM`, no en producción sin evaluación previa.
- Comparación de metodologías de ajuste (RLCL frente a SFT estándar) en publicaciones académicas, si el autor documenta el método en otro lugar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 6-7 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB.
- GPU de consumo: cabe en RTX 3090 24GB y RTX 4090 24GB en FP16 con contexto moderado; en 4 bits cabe en RTX 4070 Ti 12GB o RTX 3060 12GB.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `endpoints_compatible`), `vLLM`, `llama.cpp` u `Ollama` tras convertir a GGUF, y `SGLang`.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-igbo-s125 | 9,24B | No disponible | No disponible | Gated en HF | Fine-tune LoRA fusionado sobre Gemma 2 9B, orientado a igbo |
| google/gemma-2-9b | 9,24B | 8192 tokens | Gemma Terms of Use | Abierto (gated) | Modelo base oficial, multilingüe, con evaluación publicada |
| google/gemma-2-9b-it | 9,24B | 8192 tokens | Gemma Terms of Use | Abierto (gated) | Variante instruct oficial, referencia para comparar degradación |
| meta-llama/Llama-3.1-8B | 8,03B | 131072 tokens | Llama 3.1 Community License | Abierto (gated) | Alternativa de tamaño similar con contexto mucho mayor |

La comparación directa con el modelo base es la más informativa: cualquier diferencia en benchmarks mide el efecto del fine-tune. Frente a Llama 3.1 8B, este modelo pierde en longitud de contexto y en documentación, pero puede ganar en igbo si el ajuste fue efectivo, algo que no se puede confirmar sin métricas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir o auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial; además, al derivar de Gemma 2, podrían aplicar los términos de uso de Gemma, pero no se confirma.
- Riesgo elevado de olvido catastrófico: la propia etiqueta `forgetting` sugiere degradación en capacidades del modelo base (código, matemáticas, inglés).
- Riesgo de alucinación alto en igbo por escasez de datos de entrenamiento de calidad en ese idioma.
- Acceso restringido (gated): requiere aceptar condiciones, lo que añade fricción para reproducibilidad.
- Sin métricas de sesgo ni evaluaciones de seguridad publicadas.
- Idiomas soportados no declarados: no se puede garantizar comportamiento fuera del igbo y del inglés.
- No apto para producción sin una evaluación propia exhaustiva y sin aclaración legal de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-igbo-s125
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Variante instruct del base: https://huggingface.co/google/gemma-2-9b-it
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs
- Librería transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
