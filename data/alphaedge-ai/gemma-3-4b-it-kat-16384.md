# alphaedge-ai/gemma-3-4b-it-kat-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-kat-16384` es una variante podada (trimmed) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, especializada en georgiano (código ISO `ka`). El autor, alphaedge-ai, ha aplicado la técnica de trimming de vocabulario descrita por Hugging Face: en lugar de reentrenar, se eliminan del vocabulario los tokens poco frecuentes en el idioma objetivo y se recortan las matrices de embedding y de la cabeza de salida en consecuencia. El resultado es un modelo un 14,63 % más pequeño en parámetros (de 4.300.079.472 a 3.670.770.032) con un vocabulario reducido de 262.144 a 16.384 tokens (93,75 % de reducción).

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atención multimodal para imagen-texto), pero su tokenizador ya no cubre el rango completo de idiomas del modelo base. Está pensado para despliegues en producción donde el georgiano es el idioma dominante y se quiere minimizar el uso de memoria y el coste de inferencia, manteniendo un comportamiento cercano al original en esa lengua.

Es relevante ahora porque el trimming se ha consolidado como una técnica práctica de especialización lingüística de bajo coste: no requiere GPUs de entrenamiento ni datasets masivos, solo una muestra de texto representativa (200.000 textos de `lbourdois/fineweb-2-trimming`). El modelo se distribuye bajo los Términos de Uso de Gemma y está etiquetado como compatible con Text Generation Inference y endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), podado por trimming de vocabulario |
| Parametros totales | 3.670.770.032 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el sufijo 16384 del nombre hace referencia al tamano del vocabulario, no al contexto) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en el dtype original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Georgiano (`ka`) como idioma objetivo; el resto de idiomas del modelo base no estan garantizados |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-4b-it` es un transformer decoder-only de la familia Gemma 3, con capacidad de procesamiento imagen-texto (`image-text-to-text`) y modo conversacional instruido. Sobre esa base, alphaedge-ai aplica trimming: se analiza la frecuencia de tokens en una muestra de 200.000 textos en georgiano del dataset `lbourdois/fineweb-2-trimming`, se seleccionan los 16.384 tokens más relevantes para esa lengua y se recortan las filas correspondientes de la matriz de embedding de entrada y de la capa de proyección de salida (lm_head). El resto de pesos del transformer permanece intacto.

No hay reentrenamiento ni ajuste fino posterior al trimming: el modelo no ha pasado por RLHF, DPO ni SFT adicional en esta variante. La innovación es puramente de eficiencia: reducir el tamaño del vocabulario disminuye el número de parámetros (14,63 % menos) y, sobre todo, el espacio ocupado por las matrices de embedding, que en modelos con vocabularios grandes como Gemma 3 (262.144 tokens) representan una fracción significativa del total. El autor advierte que el rendimiento en otros idiomas puede degradarse porque los tokens no usados en georgiano se han eliminado.

## Capacidades

- Generación de texto conversacional en georgiano, con plantilla de chat (`apply_chat_template`).
- Procesamiento imagen-texto heredado del modelo base Gemma 3 4B IT (entrada multimodal).
- Razonamiento y generación de código en la medida en que el vocabulario recortado lo permita; el autor no garantiza buen rendimiento fuera del georgiano.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante podada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al georgiano; el resto de idiomas puede degradarse por la reducción de vocabulario.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en georgiano: el modelo puede gestionar conversaciones multi-turno en georgiano con una huella de memoria menor que el modelo base, lo que abarata el despliegue en infraestructura con GPUs modestas.
- Asistentes conversacionales regionales: útil para productos dirigidos al mercado georgiano donde no se necesita cobertura multilingüe y se prioriza el coste por token.
- Procesamiento de documentos con imágenes en georgiano: al conservar la capacidad imagen-texto del modelo base, puede extraer y resumir información de capturas, formularios o documentos escaneados.
- Despliegue en el borde o en entornos con VRAM limitada: la reducción de parámetros y del tamaño del vocabulario facilita servir el modelo en GPUs de gama consumer, siempre que se valide la calidad en georgiano.
- Generación de contenido y resúmenes en georgiano: blogs, notas de prensa o descripciones de producto, con un tokenizador más eficiente para esa lengua (menos tokens por palabra que con el vocabulario completo).
- Fine-tuning ligero sobre dominio específico: al ser un modelo más pequeño, el coste de ajuste fino (LoRA/QLoRA) y el espacio de almacenamiento de checkpoints se reducen frente al Gemma 3 4B IT original.
- Investigación sobre trimming: sirve como referencia reproducible para estudiar el impacto del recorte de vocabulario en calidad y latencia en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción; RTX 4090 (24 GB) para desarrollo y despliegues pequeños.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con holgura en bf16; en GPUs de 8-12 GB requeriría cuantización, que no se distribuye oficialmente en este repo.
- Opciones de despliegue: transformers (soporte nativo, según la model card), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se publican artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-kat-16384 | 3.670.770.032 | 16.384 | no disponible | Georgiano (`ka`) | Gemma Terms of Use |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | no disponible en la información proporcionada | Multilingüe | Gemma Terms of Use |
| Otras variantes trimmed de Gemma 3 4B IT | no disponible | no disponible | no disponible | Según idioma objetivo | Gemma Terms of Use |

La comparación directa con alternativas de la misma categoría (modelos de ~4B especializados en georgiano) no está disponible en la información proporcionada. El principal punto de referencia es el propio modelo base, del que esta variante reduce un 14,63 % los parámetros y un 93,75 % el vocabulario.

## Limitaciones y advertencias

- El vocabulario recortado a 16.384 tokens elimina tokens poco frecuentes en georgiano; el rendimiento en otros idiomas puede degradarse de forma significativa, tal como advierte el autor.
- No hay datos publicados de evaluación (benchmarks) que cuantifiquen la pérdida de calidad respecto al modelo base en georgiano ni en otras tareas.
- Riesgo de alucinación inherente al modelo base Gemma 3 4B IT; el trimming no lo corrige y podría amplificarlo en dominios donde el vocabulario recortado no cubre terminología especializada.
- El sufijo `16384` del nombre hace referencia al tamaño del vocabulario, no a la longitud de contexto; conviene no confundirlo al planificar despliegues.
- Licencia Gemma Terms of Use: uso comercial permitido bajo las condiciones de Google, con obligaciones de atribución y restricciones de uso aceptable; el modelo no está afiliado ni respaldado por Google.
- No se distribuyen cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- El modelo tiene muy poca tracción (8 descargas, 0 likes) y fue actualizado por última vez en noviembre de 2026; conviene validar su calidad en el dominio concreto antes de usarlo en producción.
- No se confirma soporte de tool calling ni de razonamiento multi-paso en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-kat-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
