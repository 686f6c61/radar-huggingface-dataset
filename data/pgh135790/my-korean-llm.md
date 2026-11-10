# pgh135790/my-korean-llm

## Resumen

`pgh135790/my-korean-llm` es un ajuste fino (fine-tuning) de tipo supervisado del modelo `beomi/Llama-3-Open-Ko-8B`, un modelo derivado de la familia Llama 3 de Meta adaptado al coreano por el desarrollador beomi. El autor del ajuste es el usuario de Hugging Face `pgh135790`, que lo ha publicado bajo licencia Apache 2.0. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` y con `text-generation-inference`.

La relevancia de esta ficha es limitada: se trata de un modelo base de 8 000 millones de parámetros ajustado con la librería Unsloth, sin model card detallada, sin datos de entrenamiento publicados y con cero descargas en el momento de la consulta. La información disponible no permite verificar la calidad del ajuste ni el dataset utilizado. El modelo hereda la arquitectura transformer decoder-only de Llama 3, con una longitud de contexto nominal de 8 192 tokens (característica del modelo base), aunque el autor no la documenta explícitamente.

A pesar de su nombre ("my-korean-llm"), la model card declara el idioma inglés (`en`) como único idioma soportado en los metadatos, lo que contradice la denominación y el origen coreano del modelo base. Esta inconsistencia debe tenerse en cuenta antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), ajuste fino con Unsloth |
| Parametros totales | 8 000 millones (heredados de Llama-3-Open-Ko-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3 usa 8 192 tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | en (según metadatos); el modelo base está adaptado al coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `beomi/Llama-3-Open-Ko-8B`, que a su vez es una adaptación al coreano de Llama 3 8B de Meta. La arquitectura subyacente es un transformer decoder-only con atención causal estándar, 32 capas, dimensión oculta de 4 096 y 32 cabezas de atención (8 cabezas KV por grupo, GQA), tal como corresponde a Llama 3 8B. El ajuste se realizó con Unsloth, una librería que optimiza el entrenamiento supervisado (SFT) y el ajuste con LoRA/QLoRA reduciendo el uso de memoria y acelerando el proceso aproximadamente el doble respecto a implementaciones estándar.

No se dispone de información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni si se aplicaron técnicas de RLHF, DPO o preferencias. La model card únicamente indica que se trata de un "Uploaded finetuned model" entrenado con Unsloth. El repositorio ocupa 0,2 GB, un tamaño compatible con pesos en precisión reducida (probablemente bf16 o fp16 de un adaptador LoRA fusionado, dado que un modelo de 8B en bf16 completo ocuparía aproximadamente 16 GB). Esta discrepancia sugiere que el repositorio puede contener solo los adaptadores o una versión parcial, pero no hay documentación que lo aclare.

## Capacidades

- Generación de texto autoregresiva en inglés (según los metadatos declarados) y potencialmente en coreano por herencia del modelo base.
- Razonamiento básico y respuesta a instrucciones, siempre que el ajuste fino haya preservado estas capacidades del checkpoint original.
- No hay evidencia documentada de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia documentada de modo "thinking", visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe no verificada: los metadatos solo declaran inglés, aunque el modelo base está especializado en coreano.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Experimentación académica con ajuste fino de Llama 3: el modelo sirve como punto de partida para reproducir pipelines de SFT con Unsloth y comparar configuraciones de entrenamiento en un entorno controlado.
- Prototipado de asistentes conversacionales en coreano: si el ajuste preserva las capacidades del modelo base, podría emplearse para generar respuestas en coreano en demos de baja exigencia, aunque la falta de evaluación impide garantizar calidad.
- Generación de texto en inglés para tareas creativas o de resumen: el modelo puede generar texto coherente en inglés gracias a la herencia de Llama 3, pero sin benchmarks que validen su rendimiento frente al checkpoint original.
- Base para investigación sobre adaptación de dominio: al ser un ajuste fino no documentado, puede utilizarse como caso de estudio de cómo los ajustes pequeños alteran el comportamiento de un modelo base.
- Despliegue en entornos con recursos limitados: al ser un modelo de 8B, puede ejecutarse en una única GPU consumer de 24 GB (RTX 4090) en cuantización de 4 bits, lo que permite probarlo sin infraestructura dedicada.
- Evaluación comparativa de ajustes comunitarios: útil para estudiar la variabilidad de calidad entre ajustes publicados sin model card detallada y modelos con documentación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB para los pesos, más overhead de activaciones y caché KV (en torno a 18-20 GB en total para contexto moderado).
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB para los pesos, lo que permite ejecución en GPUs consumer de 8 GB.
- GPUs recomendadas: A100 40 GB o H100 para inferencia en precisión completa y alto throughput; RTX 4090 (24 GB) para bf16 en una sola GPU; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (TGI, etiquetado en el repo), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pgh135790/my-korean-llm | 8B | no disponible (base: 8 192) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin documentación ni benchmarks |
| beomi/Llama-3-Open-Ko-8B | 8B | 8 192 | Llama 3 (licencia comunitaria de Meta, con restricciones) | Hugging Face, modelo base ampliamente usado | Modelo base coreano con documentación y evaluación |
| meta-llama/Meta-Llama-3-8B | 8B | 8 192 | Llama 3 (licencia comunitaria) | Hugging Face, muy extendido | Modelo original de Meta, con benchmarks públicos |
| Qwen2.5-7B | 7B | 32 768 | Apache 2.0 | Hugging Face, muy extendido | Alternativa multilingüe con contexto mayor y benchmarks publicados |

La comparación directa es difícil porque el modelo ajustado no publica métricas. Frente al modelo base `beomi/Llama-3-Open-Ko-8B`, la única diferencia documentada es el ajuste fino con Unsloth, sin evidencia de mejora. Frente a Llama 3 8B original, hereda su arquitectura pero cambia el dominio lingüístico. Frente a Qwen2.5-7B, este último ofrece contexto cuatro veces mayor y licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y metodología de evaluación.
- Inconsistencia entre el nombre del modelo ("korean") y el idioma declarado en los metadatos ("en"), lo que genera incertidumbre sobre su comportamiento real.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al modelo base, habitual en ajustes finos sin validación publicada.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El repositorio de 0,2 GB es anómalamente pequeño para un modelo de 8B en bf16; podría contener solo adaptadores o pesos parciales, lo que impediría su uso directo sin el checkpoint base.
- Aunque la licencia declarada es Apache 2.0, el modelo base `beomi/Llama-3-Open-Ko-8B` deriva de Llama 3 de Meta, cuya licencia comunitaria impone restricciones adicionales (por ejemplo, en el nombre del modelo y en el uso por parte de grandes plataformas). Conviene verificar la compatibilidad antes de un uso comercial.
- No recomendado para producción sin una evaluación previa exhaustiva en el dominio objetivo.
- Posibles sesgos heredados de Llama 3 y del corpus coreano utilizado por beomi, no documentados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgh135790/my-korean-llm
- Modelo base: https://huggingface.co/beomi/Llama-3-Open-Ko-8B
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Llama 3 de Meta (modelo original): https://huggingface.co/meta-llama/Meta-Llama-3-8B
