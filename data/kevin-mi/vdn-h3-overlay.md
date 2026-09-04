# kevin-mi/VDN-H3-overlay

## Resumen

El repositorio `kevin-mi/VDN-H3-overlay` es un overlay de metadatos para SGLang Diffusion, no un modelo con pesos propios. Su función es permitir que SGLang sirva el modelo `OpenVDN/vdn-minimax-h3` (Video DeltaNet MiniMax-H3) como una `VDNH3Pipeline`. El modelo subyacente, VDN-H3, es un modelo generativo de video desarrollado por OpenVDN, basado en la arquitectura MiniMax-H3 y destilado con DMD2 a 8 pasos de evaluación de red (8-NFE).

La arquitectura del modelo es híbrida: combina atención por ventanas con softmax por fragmentos (chunked window-softmax) y atención lineal por fotogramas (frame-wise linear attention). El overlay se encarga de prefundir los adaptadores LoRA en los pesos del transformer, adjuntar la rama lineal y re-serializar el VAE de video en el formato que SGLang espera. No se han publicado datos sobre el tamaño total de parámetros ni la longitud de contexto en la información disponible.

Este repositorio es relevante para desarrolladores que trabajan con SGLang Diffusion y necesitan desplegar modelos de video generativo con atención híbrida de forma eficiente. Al ser un overlay, no contiene pesos, por lo que requiere descargar los pesos del repositorio fuente y un entorno compatible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: chunked window-softmax + frame-wise linear attention |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license |
| Formato de pesos | no disponible (overlay de metadatos; el modelo base utiliza safetensors) |

## Arquitectura y entrenamiento

El repositorio `kevin-mi/VDN-H3-overlay` no contiene pesos; es un overlay que materializa el modelo `OpenVDN/vdn-minimax-h3` en el formato que SGLang Diffusion necesita. El modelo subyacente, VDN-H3, se entrena en tres etapas sobre el modelo denso congelado, cada una comenzando desde el checkpoint final de la etapa anterior. Además, se incluye una etapa de entrenamiento DMD (Distribution Matching Distillation) para alinear el modelo con el LoRA de destilación de pocos pasos de la comunidad.

La arquitectura es híbrida: utiliza atención por ventanas con softmax por fragmentos para capturar dependencias locales y atención lineal por fotogramas para modelar dependencias globales en secuencias de video. El modelo está destilado con DMD2 a 8 pasos de evaluación de red (8-NFE), lo que reduce el coste de inferencia frente a modelos de difusión con más pasos.

El overlay ejecuta una serie de operaciones al materializar el modelo: prefunde ambos adaptadores LoRA en los pesos del transformer con acumulación en fp32 y escala 1.0, adjunta la rama lineal como `transformer/sglang_vdn_linear_branch.safetensors`, añade la configuración `hybrid_attention` en `transformer/config.json` y re-serializa el VAE de video en la forma de fuente fusionada que carga el decodificador nativo de SGLang. El registro de procedencia se guarda en `transformer/sglang_vdn_prefused.json`.

## Capacidades

- Generación de video: el modelo es un modelo generativo de video (Video DeltaNet MiniMax-H3) destilado a 8 pasos (8-NFE) con DMD2.
- Condicionamiento multimodal: el overlay enlaza el condicionador Qwen3-VL de `MiniMaxAI/MiniMax-H3`, lo que sugiere capacidad para condicionar la generación a partir de texto o imágenes, aunque no se detalla en la información disponible.
- Integración con SGLang Diffusion: el overlay permite servir el modelo como `VDNH3Pipeline` con el backend de atención `hybrid_window_attn_h3`.
- Soporte de LoRA: el modelo base incluye dos adaptadores LoRA que el overlay prefunde en los pesos del transformer durante la materialización.
- Atención híbrida: la arquitectura combina window-softmax y atención lineal por fotogramas, lo que puede mejorar la eficiencia en secuencias largas de video.
- Tool calling, soporte de agentes y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de video generativo en producción: el overlay permite integrar VDN-H3 en SGLang Diffusion, un servidor de inferencia de alto rendimiento, para servir video generativo con atención híbrida. El comando de ejemplo usa 4 GPUs y requiere al menos 100 GB de espacio libre en el directorio de caché.
- Investigación en destilación de pocos pasos: el modelo está destilado con DMD2 a 8 NFE, lo que lo hace adecuado para estudiar técnicas de destilación de modelos de difusión de video y comparar la calidad con modelos de más pasos.
- Ajuste fino y personalización: la presencia de adaptadores LoRA en el repositorio fuente sugiere que el modelo puede ajustarse para tareas específicas de generación de video, y el overlay prefunde estos adaptadores para su uso en SGLang.
- Prototipado de contenido visual: el modelo puede utilizarse para generar clips de video a partir de descripciones textuales, gracias al condicionador Qwen3-VL, en entornos de investigación o desarrollo.
- Análisis de arquitecturas híbridas de atención: el modelo combina window-softmax y atención lineal por fotogramas, lo que permite evaluar el rendimiento de este tipo de arquitecturas en tareas de generación de video.
- Integración en pipelines de SGLang Diffusion: el overlay está diseñado específicamente para SGLang, por lo que es útil para equipos que ya usan este framework y quieren servir modelos de video con el backend `hybrid_window_attn_h3`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El comando de ejemplo de SGLang usa `--num-gpus 4`, lo que indica que se requieren al menos 4 GPUs para servir el modelo.
- Se recomienda un directorio de caché con al menos 100 GB de espacio libre (`SGLANG_DIFFUSION_CACHE_ROOT=/path/with/100GB/free`).
- No se especifica la VRAM por GPU ni el modelo de GPU recomendado.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: SGLang Diffusion, con el backend de atención `hybrid_window_attn_h3`.
- No se indica si el modelo cabe en GPUs de consumo (consumer GPU).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este overlay con modelos similares. El README menciona que el overlay funciona de forma similar al overlay FastH3, pero no se proporcionan datos comparativos de rendimiento, parámetros ni licencias de esos modelos.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo hereda la MiniMax H3 Community License, que incluye exclusiones territoriales. Es obligatorio leer la licencia antes de descargar o ejecutar los pesos.
- Este repositorio no contiene pesos: es un overlay de metadatos. Para usar el modelo es necesario descargar los pesos de `OpenVDN/vdn-minimax-h3` y configurar SGLang Diffusion correctamente.
- Dependencia de un framework específico: el overlay está diseñado para SGLang Diffusion y el backend `hybrid_window_attn_h3`, lo que limita su uso a entornos con SGLang.
- No se han publicado benchmarks: no hay datos de rendimiento, calidad de video ni comparaciones con otros modelos.
- Idiomas soportados: no disponibles en la información proporcionada, aunque el condicionador Qwen3-VL es multimodal.
- Riesgo de alucinación y sesgos: no se dispone de información específica sobre sesgos o alucinaciones para este modelo.
- El modelo base se entrena sobre un modelo denso congelado en tres etapas, lo que puede implicar limitaciones en la capacidad de adaptación a dominios muy distintos del entrenamiento original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kevin-mi/VDN-H3-overlay
- Modelo base en Hugging Face: https://huggingface.co/OpenVDN/vdn-minimax-h3
- Código del proyecto en GitHub: https://github.com/OpenVDN/vdn-minimax-h3
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo MiniMax-H3 en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
