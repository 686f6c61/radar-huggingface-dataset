# Hiccup1234/Krea-Kroma-v0.3-LoRA-r384-fro-0985

## Resumen

Krea-Kroma-v0.3-LoRA-r384-fro-0985 es un adaptador LoRA (Low-Rank Adaptation) extraído por el usuario Hiccup1234 a partir del checkpoint fine-tune Kroma v0.3, desarrollado por lodestones, tomando como base el modelo oficial Krea 2 Raw de Krea. Este LoRA encapsula la diferencia entre el modelo afinado y el base mediante una descomposición SVD con objetivo de norma de Frobenius, permitiendo aplicar el estilo y las mejoras de Kroma v0.3 sobre cualquier instalación de Krea 2, incluidos flujos de trabajo Turbo en ComfyUI. El archivo resultante, de aproximadamente 4,5 GB en FP32, contiene 256 adaptadores con rangos dinámicos entre 146 y 341, y está diseñado para cargarse como un LoRA estándar en ComfyUI.

La relevancia de este modelo radica en que democratiza el acceso a un fine-tune de alta calidad sin necesidad de reemplazar el checkpoint base completo, lo que reduce los requisitos de almacenamiento y permite una integración sencilla en pipelines existentes. Al ser un delta extraído con verificación de integridad (hashes SHA-256 de los checkpoints fuente), ofrece transparencia y reproducibilidad. Su licencia, la Krea 2 Community License, condiciona su uso comercial, por lo que debe revisarse antes de su implementación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 Raw |
| Parametros totales | no disponible (el LoRA contiene 256 adaptadores / 512 tensores, con rangos dinamicos 146-341, media 311.738) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | FP32 (factores del LoRA), el modelo base puede usar otras cuantizaciones |
| Idiomas soportados | no disponible (depende del modelo base Krea 2) |
| Licencia | Krea 2 Community License (krea-2-community-license) |
| Formato de pesos | safetensors (archivo: kroma-v0.3-base-lora-rank-384-fro-0985.safetensors) |

## Arquitectura y entrenamiento

El modelo es un LoRA, no un modelo completo. Se obtiene mediante extracción de la diferencia entre dos checkpoints: el base `krea/Krea-2-Raw` (raw.safetensors) y el afinado `lodestones/Kroma` (kroma-v0.3-base.safetensors). El proceso utiliza una descomposición SVD con un objetivo de norma de Frobenius de 0.985 y un límite de rango de 384, generando 256 adaptadores con rangos dinámicos que varían entre 146 y 341 (media 311.738). Todos los tensores se verificaron en cuanto a dtype, forma, valores finitos y metadatos antes de la publicación. El archivo resultante contiene los factores en FP32 y no incluye ningún checkpoint INT8 ni deltas de Krea Turbo.

El entrenamiento del modelo base Kroma v0.3 no está documentado en la información proporcionada; se desconoce el dataset, el número de pasos y las técnicas de alineación (RLHF, DPO, etc.) empleadas. El LoRA simplemente reproduce el comportamiento del fine-tune cuando se aplica sobre el modelo base, sin modificar la arquitectura subyacente de Krea 2.

## Capacidades

- Generación de imágenes a partir de texto: al aplicarse sobre Krea 2 Raw, el LoRA hereda las capacidades de generación de imágenes del modelo base, mejorando el estilo o la calidad según el fine-tune Kroma v0.3.
- Compatibilidad con ComfyUI: se integra mediante un LoRA loader estándar, permitiendo su uso en flujos de trabajo personalizados.
- Soporte para Krea 2 Turbo: aunque el LoRA no incluye deltas de Turbo, puede combinarse con flujos Turbo existentes, ya que la configuración de muestreo se controla desde el workflow, no desde el archivo.
- Ajuste fino de estilo: el adaptador permite aplicar el estilo específico de Kroma v0.3 sin reemplazar el checkpoint base, facilitando la experimentación con diferentes intensidades (strength).
- Verificación de integridad: los hashes SHA-256 de los checkpoints fuente y del propio archivo LoRA están documentados, lo que permite auditar la procedencia.

## Casos de uso

- Generación artística con estilo Kroma: un artista puede cargar el LoRA en ComfyUI con strength 1.0 y generar imágenes que imiten el estilo del fine-tune Kroma v0.3, ideal para ilustraciones conceptuales o arte digital.
- Experimentación con variaciones de intensidad: ajustando el strength del LoRA (p. ej., 0.5, 0.8, 1.2), un investigador puede estudiar cómo afecta la magnitud del delta al resultado visual, útil para calibrar efectos estilísticos.
- Integración en pipelines de producción con Krea 2 Turbo: un estudio de diseño puede combinar este LoRA con flujos Turbo para obtener generaciones rápidas manteniendo el estilo de Kroma, reduciendo el tiempo de iteración.
- Comparación de fine-tunes: al ser un delta extraído de forma reproducible, permite comparar objetivamente Kroma v0.3 frente al modelo base o frente a otras versiones de Kroma (v0.1, v0.2) utilizando el mismo punto de referencia.
- Educación y prototipado: desarrolladores que aprenden sobre LoRAs pueden analizar la estructura de rangos dinámicos y la extracción SVD, usando este archivo como ejemplo práctico.
- Despliegue en entornos con almacenamiento limitado: en lugar de descargar el checkpoint completo de Kroma (posiblemente más pesado), se usa el LoRA de 4,5 GB sobre el base, ahorrando espacio en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas (p. ej., FID, CLIP score) que comparen este LoRA con otros adaptadores o con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Krea 2 Raw, que no se especifica en la información proporcionada. Se recomienda consultar los requisitos del checkpoint base.
- GPU recomendadas: no disponible. Krea 2 es un modelo de difusión; se espera que requiera GPUs con al menos 8-16 GB de VRAM para inferencia básica, pero no hay datos concretos.
- Compatibilidad con consumer GPU: no confirmado. Dado el tamaño del LoRA (4,5 GB), es plausible que funcione en GPUs de gama alta como RTX 3090/4090, pero depende del modelo base.
- Opciones de despliegue: ComfyUI es el entorno principal mencionado. También podría usarse con otros frameworks que soporten LoRAs de safetensors, pero no se documentan alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de Krea 2 comparables en el contexto de esta ficha. El propio autor menciona que sigue el mismo esquema de extracción que Kroma v0.2, pero no se proporcionan datos cuantitativos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dependencia del modelo base: el LoRA solo funciona sobre Krea 2 Raw (o versiones compatibles). No es un modelo autónomo.
- Licencia restrictiva: la Krea 2 Community License puede limitar el uso comercial. Es imprescindible revisar los términos completos en el enlace proporcionado antes de cualquier uso en producción.
- Riesgo de alucinación visual: como todo modelo de generación de imágenes, puede producir artefactos o contenido no deseado, especialmente con prompts ambiguos o fuera de distribución.
- Sin garantía de rendimiento: al no haber benchmarks publicados, no se puede verificar la calidad objetiva del LoRA frente a otras alternativas.
- Tamaño considerable: 4,5 GB para un LoRA es inusualmente grande (debido a FP32 y alto rango), lo que puede dificultar su distribución o uso en entornos con ancho de banda limitado.
- Sesgos del modelo base: Krea 2 Raw puede tener sesgos inherentes en cuanto a género, raza o cultura, que el LoRA no corrige y podría amplificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hiccup1234/Krea-Kroma-v0.3-LoRA-r384-fro-0985
- Space de demostración (hugging-apps/kroma-krea2-lora-demo): https://huggingface.co/spaces/hugging-apps/kroma-krea2-lora-demo
- Repositorio del fine-tune original (lodestones/Kroma): https://huggingface.co/lodestones/Kroma
- Licencia Krea 2 Community License: https://huggingface.co/lodestones/Kroma/blob/main/LICENSE
- Checkpoint base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Repositorio de nodos ComfyUI para edición de LoRAs de Krea 2: https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit
