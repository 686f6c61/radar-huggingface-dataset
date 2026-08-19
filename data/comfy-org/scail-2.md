# Comfy-Org/SCAIL-2

## Resumen

SCAIL-2 es un modelo de difusión para generación de vídeo basado en la arquitectura Wan 2.1, con 14 000 millones de parámetros. El repositorio que se analiza es un reempaquetado oficial de Comfy-Org para su uso directo en ComfyUI, mientras que el modelo original se aloja en el repositorio zai-org/SCAIL-2. El paquete incluye pesos en varios formatos de cuantización (fp16, fp8, int8, mxfp8 y una mezcla nvfp4/mxfp8) junto con dos LoRAs adicionales para fine-tuning con DPO y para reiluminación.

La relevancia de este modelo radica en que ofrece una alternativa de generación de vídeo de alto rendimiento con licencia MIT, lo que permite uso comercial sin restricciones. Al estar empaquetado para ComfyUI, facilita su integración en flujos de trabajo de generación de vídeo sin necesidad de adaptar los pesos manualmente. No se dispone de información pública sobre el proceso de entrenamiento, los datos utilizados o los benchmarks oficiales en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (Wan 2.1, 14B) |
| Parametros totales | 14 000 millones (14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp8_scaled, int8_convrot, mxfp8, nvfp4_mxpf8_mix |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (diffusion_models y loras) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de difusión de la familia Wan 2.1, específicamente la variante de 14 000 millones de parámetros. No se han publicado detalles sobre el proceso de entrenamiento, el número de tokens o la composición del dataset en la información disponible. El repositorio incluye dos LoRAs: una entrenada con DPO (Direct Preference Optimization) y otra para reiluminación, lo que sugiere que el modelo base fue sometido a un ajuste fino con preferencias humanas y que se ha desarrollado una capacidad específica para modificar la iluminación de las escenas generadas.

No se dispone de información sobre innovaciones técnicas concretas más allá de la propia arquitectura Wan 2.1, que es un modelo de difusión para vídeo. Los formatos de cuantización incluidos (fp8, int8, mxfp8, nvfp4) indican que se ha prestado atención a la eficiencia de inferencia en diferentes hardware.

## Capacidades

- Generación de vídeo a partir de texto o condiciones visuales (típico de los modelos Wan 2.1).
- Generación de imágenes si el modelo lo soporta (no confirmado en la documentación).
- Fine-tuning mediante LoRA incluida con DPO para alinear el modelo con preferencias humanas.
- Reiluminación de escenas mediante la LoRA específica de relight.
- Integración nativa con ComfyUI, permitiendo su uso en flujos de trabajo visuales sin configuración adicional.
- Soporte de múltiples formatos de cuantización para adaptarse a distintos hardware.

No se ha confirmado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la generación de vídeo.

## Casos de uso

- Generación de vídeo creativo para producción audiovisual: el modelo puede crear clips de vídeo a partir de descripciones textuales, útil para storyboards, previsualización o contenido para redes sociales. Su licencia MIT permite uso comercial sin royalties.
- Prototipado rápido en diseño y publicidad: los equipos creativos pueden generar vídeos de muestra para presentar conceptos a clientes antes de la producción final, reduciendo costes de iteración.
- Reiluminación de escenas en postproducción: la LoRA de relight permite ajustar la iluminación de vídeos generados o existentes, una tarea común en VFX y corrección de color.
- Ajuste fino para estilos específicos: la LoRA de DPO permite adaptar el modelo a preferencias estéticas concretas de un estudio o marca, mejorando la coherencia del output.
- Integración en pipelines de generación automatizada: al estar empaquetado para ComfyUI, puede integrarse en sistemas de generación por lotes para producir vídeos de forma programática.
- Investigación en generación de vídeo: el modelo sirve como base para experimentos académicos sobre difusión de vídeo, gracias a su licencia permisiva y a la disponibilidad de pesos en varios formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como FVD, IS, CLIP score u otras típicas en generación de vídeo. Tampoco se ofrecen comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: para un modelo de 14B en fp16, se requieren aproximadamente 28 GB de VRAM solo para los pesos. Con cuantización fp8 se reduce a unos 14 GB, e int8 a unos 14 GB también. La mezcla nvfp4/mxfp8 podría bajar a unos 7-8 GB, pero no hay datos oficiales.
- GPU recomendadas: para fp16 se necesitan GPUs de datacenter como A100 (40/80 GB) o H100. Para fp8/int8, una RTX 4090 (24 GB) podría ser suficiente. Para nvfp4, una RTX 4090 o similar podría bastar, aunque no está confirmado.
- En consumer GPU: es posible ejecutar el modelo en RTX 4090 con cuantización fp8 o int8, pero con limitaciones de resolución y longitud de vídeo.
- Opciones de despliegue: al ser un modelo de difusión para ComfyUI, el despliegue principal es a través de ComfyUI. También podría usarse con otros frameworks que soporten safetensors de difusión, como Diffusers, pero no está documentado.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la resolución/longitud del vídeo generado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de generación de vídeo (como otros Wan 2.1, Stable Video Diffusion, etc.). No hay datos de rendimiento ni especificaciones detalladas del modelo original. Se recomienda consultar el repositorio original zai-org/SCAIL-2 para obtener más información.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del modelo en la documentación proporcionada.
- Al ser un modelo de difusión, puede generar artefactos visuales o inconsistencias temporales en vídeos largos, aunque no hay datos concretos.
- La licencia MIT permite uso comercial, pero se debe verificar que los pesos del modelo original no tengan restricciones adicionales (aunque el repositorio original también indica MIT).
- El modelo está empaquetado específicamente para ComfyUI; su uso fuera de este entorno puede requerir adaptaciones no documentadas.
- No se especifican los idiomas soportados para las indicaciones de texto; probablemente funcione mejor en inglés, pero no está confirmado.
- El tamaño del repositorio (86.7 GB) implica una descarga considerable y requiere espacio en disco suficiente.

## Enlaces

- Repositorio de HuggingFace (reempaquetado): https://huggingface.co/Comfy-Org/SCAIL-2
- Repositorio original del modelo: https://huggingface.co/zai-org/SCAIL-2
