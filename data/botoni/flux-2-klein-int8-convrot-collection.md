# Botoni/Flux-2-Klein-INT8-ConvRot-Collection

## Resumen

Flux-2-Klein-INT8-ConvRot-Collection es una colección de pesos cuantizados a INT8 con transformación ConvRot de la familia de modelos FLUX.2-klein, publicada por el usuario Botoni en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un repositorio agregador que recopila y cuantiza variantes de los modelos de generación de imágenes FLUX.2-klein de Black Forest Labs, concretamente la versión de 9B parámetros (y, según la model card, también variantes de 4B bajo licencia Apache 2.0).

El modelo base es `black-forest-labs/FLUX.2-klein-9B`, un modelo de difusión para generación de imágenes de la familia FLUX.2. La contribución del autor es exclusivamente la cuantización a INT8 con una transformación denominada ConvRot, orientada a reducir los requisitos de memoria y facilitar el despliegue en hardware más modesto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

La relevancia de esta ficha es limitada: se trata de un artefacto de cuantización comunitario, no de un modelo con benchmarks publicados ni documentación técnica extensa. La información disponible en la model card es mínima y no se detallan parámetros de entrenamiento, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: FLUX.2-klein-9B, difusión) |
| Parametros totales | 9B (versión principal); variantes de 4B mencionadas |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con transformación ConvRot |
| Idiomas soportados | no disponible |
| Licencia | FLUX Non-Commercial License (9B); Apache 2.0 (4B) |
| Formato de pesos | no disponible (cuantización INT8 ConvRot) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base FLUX.2-klein-9B en la documentación proporcionada. Por el nombre y la familia a la que pertenece, se trata de un modelo de difusión para generación de imágenes, pero no se detallan el tipo de backbone (transformer, DiT, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única innovación técnica documentada es la cuantización a INT8 con transformación ConvRot aplicada por el autor del repositorio. No se especifica en qué consiste exactamente ConvRot, qué capas se cuantizan, ni qué degradación de calidad introduce respecto a los pesos originales en precisión completa. Tampoco se indica si la cuantización afecta al text encoder, al VAE o únicamente al UNet/DiT.

## Capacidades

- Generación de imágenes a partir de prompts de texto (heredada del modelo base FLUX.2-klein-9B).
- Cuantización INT8 orientada a reducir huella de memoria en inferencia.
- Disponibilidad de variantes de 9B y 4B en el mismo repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- No se documentan capacidades multilingües específicas.
- No se documenta modo thinking ni otras capacidades especiales.

## Casos de uso

- Despliegue de generación de imágenes en GPUs con VRAM limitada: la cuantización INT8 reduce el espacio necesario frente a los pesos en FP16/BF16, permitiendo ejecutar un modelo de 9B en hardware que de otro modo no lo soportaría.
- Prototipado rápido de pipelines de síntesis de imágenes: al estar los pesos agregados en un único repositorio, se facilita la experimentación con distintas variantes (9B y 4B) sin buscar múltiples fuentes.
- Investigación sobre cuantización: el repositorio sirve como referencia para estudiar el impacto de la cuantización INT8 ConvRot en la calidad de imagen generada.
- Evaluación comparativa de variantes: permite comparar el comportamiento de las versiones 9B y 4B bajo la misma técnica de cuantización.
- Entornos de investigación académica sin acceso a clústeres de GPUs de gama alta: la reducción de memoria facilita la experimentación en estaciones de trabajo individuales.
- Fine-tuning o adaptación posterior (LoRA, etc.) sobre pesos cuantizados, si el formato lo permite, aunque esto no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Como referencia orientativa, un modelo de difusión de 9B en INT8 requeriría del orden de 9-12 GB solo para los pesos, más overhead de activaciones y del text encoder/VAE, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización INT8 sugiere que podría caber en GPUs consumer de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (no se especifica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni frameworks de difusión como ComfyUI o diffusers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Flux-2-Klein-INT8-ConvRot-Collection | 9B / 4B | no disponible | FLUX Non-Commercial (9B) / Apache 2.0 (4B) | Hugging Face (Botoni) |
| black-forest-labs/FLUX.2-klein-9B | 9B | no disponible | FLUX Non-Commercial License | Hugging Face (oficial) |
| Variantes de 4B de FLUX.2-klein | 4B | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia del modelo de 9B es FLUX Non-Commercial License, lo que restringe el uso comercial de esa variante. Las variantes de 4B se publican bajo Apache 2.0 según la model card.
- La cuantización INT8 puede introducir degradación en la calidad de las imágenes generadas respecto a los pesos originales; no se documenta el grado de pérdida.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No hay documentación sobre sesgos, riesgo de alucinación visual ni limitaciones idiomáticas.
- No se especifica el formato exacto de los pesos ni los frameworks compatibles, lo que dificulta su integración en producción.
- Al ser un repositorio agregador de terceros, no hay garantía de mantenimiento ni de correspondencia exacta con los pesos oficiales.
- No se detalla qué componentes del pipeline (text encoder, VAE, UNet/DiT) han sido cuantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Botoni/Flux-2-Klein-INT8-ConvRot-Collection
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Licencia del modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B/blob/main/LICENSE.md
