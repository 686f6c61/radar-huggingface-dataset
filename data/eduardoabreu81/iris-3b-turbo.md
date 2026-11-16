# eduardoabreu81/iris-3b-turbo

## Resumen

Iris 3B Turbo es un checkpoint de generación de imágenes texto-a-imagen derivado de Iris 3B (SperidLabs), un modelo de difusión de 3.000 millones de parámetros que opera en espacio de píxeles puro, sin VAE intermedio. Esta versión concreta, publicada por el usuario eduardoabreu81, integra en los pesos base el LoRA Iris-3B Turbo de pentacoxian-dev (destilación DMD2), lo que reduce el muestreo de 50 pasos a 4 pasos manteniendo la fidelidad visual respecto al checkpoint original con el LoRA cargado por separado.

El modelo se distribuye en dos variantes: un archivo BF16 de 6,7 GB y un archivo INT8 ConvRot de 3,4 GB pensado para tarjetas de 8 GB, incluidas las RTX de la serie 20. La integración está pensada para Forge Neo mediante la extensión Iris 3B for Forge Neo, y requiere un codificador de texto externo Qwen3-VL 4B (en BF16 o FP8 escalado), ya que el repositorio solo contiene el modelo de difusión.

Su relevancia práctica reside en la combinación de inferencia rápida (unos 8 segundos por imagen de 1024x1024 en una A40 de 48 GB con la variante INT8) y requisitos de VRAM moderados, lo que lo hace utilizable en hardware de consumo para prototipado y generación de imágenes en flujo de trabajo local. La licencia Apache-2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión en espacio de píxeles (sin VAE), destilado con DMD2 a partir de Iris 3B |
| Parametros totales | 3.000 millones (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt depende del codificador Qwen3-VL 4B) |
| Tipos de cuantizacion | BF16, INT8 ConvRot |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo único: `iris-3b-turbo_bf16.safetensors`, `iris-3b-turbo_int8_convrot.safetensors`) |

## Arquitectura y entrenamiento

Iris 3B es un modelo de difusión que genera imágenes directamente en espacio de píxeles, prescindiendo del VAE que emplean la mayoría de modelos texto-a-imagen (Stable Diffusion, Flux, etc.). Esto implica que el modelo aprende la distribución de píxeles RGB de forma directa, lo que simplifica el pipeline de inferencia pero exige un codificador de texto externo para procesar las indicaciones. En este caso, el codificador es Qwen3-VL 4B.

El checkpoint Turbo se construye fusionando el LoRA Iris-3B Turbo de pentacoxian-dev (identificador `r2-1000`, basado en destilación DMD2) con fuerza 1.0 sobre los pesos de Iris 3B en float32, usando aritmética float32. A partir de ese resultado se generan las dos variantes: BF16 y INT8 ConvRot. La variante INT8 aplica un padding en las capas MLP equivalente al del build INT8 de nynxz, lo que garantiza compatibilidad con el mismo conjunto de GPUs. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card no los detalla.

## Capacidades

- Generación de imágenes texto-a-imagen en espacio de píxeles, sin VAE.
- Muestreo rápido en 4 pasos con sampler LCM y schedule Iris Turbo, frente a los 50 pasos del modelo original.
- CFG de 1 (sin guidance negativo), lo que reduce el coste computacional por paso.
- Resolución de trabajo de aproximadamente 1 megapíxel, con lados múltiplos de 16.
- Compatibilidad con Forge Neo mediante la extensión Iris 3B for Forge Neo.
- Variante INT8 ConvRot para GPUs de 8 GB, incluidas RTX 20 series.
- No incluye soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es exclusivamente un modelo de imagen.
- No se documentan capacidades de edición, inpainting, Restore x4 ni Depth en estos checkpoints; la model card indica que para esas tareas deben usarse los checkpoints originales.

## Casos de uso

- Prototipado rápido de imágenes en estaciones de trabajo con GPU de 8 GB: la variante INT8 ConvRot permite ejecutar el modelo en tarjetas de la serie RTX 20 y superiores, con un pipeline de 4 pasos que reduce el tiempo de iteración frente al modelo original de 50 pasos.
- Generación de ilustraciones conceptuales en local para equipos de diseño: al no depender de servicios en la nube y tener licencia Apache-2.0, se puede integrar en flujos internos sin coste por imagen ni restricciones de uso comercial.
- Creación de datasets sintéticos de imágenes para entrenamiento o validación de otros modelos: la velocidad de inferencia (unos 8 segundos por imagen de 1024x1024 en A40 con INT8) permite generar lotes grandes en tiempos razonables.
- Integración en Forge Neo para artistas técnicos: la extensión dedicada y el preset `iris` permiten seleccionar sampler, schedule, pasos y CFG sin cargar LoRA adicional, simplificando la reproducibilidad de resultados.
- Pruebas de concepto de generación texto-a-imagen en entornos con VRAM limitada: la variante BF16 (6,7 GB) encaja en GPUs de 12 GB o más, mientras que la INT8 cubre el rango de 8 GB.
- Evaluación comparativa de arquitecturas sin VAE: investigadores que estudien modelos de difusión en espacio de píxeles pueden usar este checkpoint como referencia práctica para medir calidad y latencia frente a pipelines con VAE.
- Generación de imágenes de referencia para documentación técnica o material editorial interno, siempre que se revise el resultado por posibles artefactos propios de la destilación agresiva a 4 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta una medida de latencia: en una GPU A40 de 48 GB, una imagen de 1024x1024 tarda aproximadamente 8 segundos con la variante INT8 ConvRot, frente a más de un minuto con los 50 pasos del modelo original. No se proporcionan métricas de calidad (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para la variante INT8 ConvRot (3,4 GB de pesos más overhead de activaciones y codificador de texto) y 12 GB o más para la variante BF16 (6,7 GB de pesos).
- GPU recomendadas: A40 (48 GB) como referencia de rendimiento en la model card; RTX 20 series y superiores para la variante INT8; GPUs de 12 GB o más para BF16.
- Cabe en GPU de consumo: sí, la variante INT8 está pensada explícitamente para tarjetas de 8 GB, incluidas las RTX 20 series.
- Opciones de despliegue: Forge Neo con la extensión Iris 3B for Forge Neo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de difusión de este tipo.
- Latencia y throughput: aproximadamente 8 segundos por imagen de 1024x1024 en A40 con INT8 ConvRot. No se dispone de datos de throughput por lote ni de latencia en otras GPUs.
- Requisito adicional: codificador de texto Qwen3-VL 4B (`qwen3vl_4b_bf16` o `qwen3vl_4b_fp8_scaled`), que debe colocarse en `models/text_encoder` de Forge Neo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris 3B Turbo (este) | ~3.000 M | ~1 MP, lados múltiplos de 16 | 4 (LCM, Iris Turbo) | Apache-2.0 | Hugging Face, safetensors BF16 e INT8 |
| Iris 3B original (SperidLabs) | ~3.000 M | ~1 MP | 50 (Iris DPM++ 2M) | Apache-2.0 | Hugging Face |
| Iris 3B + LoRA Turbo (pentacoxian-dev) | ~3.000 M | ~1 MP | 4 | Apache-2.0 | Hugging Face (LoRA separado) |
| Iris 3B INT8 (nynxz) | ~3.000 M | ~1 MP | según sampler | Apache-2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no incluye datos de otros modelos texto-a-imagen comparables (Flux, SDXL, etc.) en términos de parámetros, contexto o rendimiento medido. No se dispone de métricas de calidad que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo exclusivamente de generación de imágenes: no procesa lenguaje, no soporta tool calling ni razonamiento, y no debe evaluarse como modelo de texto.
- Requiere un codificador de texto externo (Qwen3-VL 4B); el repositorio solo contiene el modelo de difusión, por lo que una instalación incompleta impide la inferencia.
- La destilación agresiva a 4 pasos puede introducir artefactos o pérdida de detalle en composiciones complejas; la model card no documenta evaluaciones de calidad.
- El CFG debe fijarse en 1 y el prompt negativo debe quedar vacío; usar otros valores puede degradar el resultado.
- Resolución recomendada de aproximadamente 1 megapíxel con lados múltiplos de 16; otras resoluciones no están documentadas.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones idiomáticas del codificador de texto en la información disponible.
- Las tareas de Restore x4 y Depth no están soportadas por estos checkpoints; deben usarse los originales de Iris 3B.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias del modelo base, del LoRA y del codificador de texto Qwen3-VL 4B antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación reciente sin validación comunitaria.
- El tamaño total del repositorio es de 10,0 GB, lo que incluye ambas variantes de pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eduardoabreu81/iris-3b-turbo
- Modelo base Iris 3B (SperidLabs): https://huggingface.co/speridlabs/iris-3b
- LoRA Iris-3B Turbo (pentacoxian-dev): https://huggingface.co/pentacoxian-dev/iris-3b-turbo-lora
- Build INT8 de referencia (nynxz): https://huggingface.co/nynxz/iris-3b
- Extensión Iris 3B for Forge Neo: https://github.com/eduardoabreu81/iris-3b-forge-neo
- Forge Neo: https://github.com/Haoming02/sd-webui-forge-classic/tree/neo
- Merge Studio: https://github.com/eduardoabreu81/sd-webui-merge-studio
- Codificador de texto Qwen3-VL 4B: https://huggingface.co/Comfy-Org/Qwen3-VL/tree/main/text_encoders
- Issues y soporte: https://github.com/eduardoabreu81/iris-3b-forge-neo/issues
- Ko-fi del autor: https://ko-fi.com/eduardoabreu81
