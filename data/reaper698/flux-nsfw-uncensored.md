# Reaper698/Flux-NSFW-uncensored

## Resumen

El modelo **Reaper698/Flux-NSFW-uncensored** es un adaptador LoRA (Low-Rank Adaptation) diseñado para eliminar las restricciones de contenido del modelo base **FLUX.1-dev** de Black Forest Labs, permitiendo la generación de imágenes sin filtros de censura. Se trata de un ajuste fino de bajo rango que se carga sobre el pipeline de FLUX.1-dev mediante la biblioteca `diffusers` y `peft`, y no un modelo completo. El autor lo presenta como un "playground" para explorar los límites técnicos de la moderación de contenido en generación de imágenes.

El repositorio tiene un tamaño de 0,7 GB, lo que corresponde al peso del adaptador LoRA (un archivo `lora.safetensors`), y está pensado para ser usado con el modelo base FLUX.1-dev, que cuenta con 12 mil millones de parámetros. La licencia es `creativeml-openrail-m`, que permite uso comercial con ciertas restricciones, y el idioma principal soportado es el inglés, aunque los prompts pueden escribirse en otros idiomas.

Este tipo de adaptadores es relevante en el ecosistema open source porque permite experimentar con los límites de los sistemas de moderación de los modelos de difusión, aunque su uso conlleva implicaciones éticas y legales que deben considerarse cuidadosamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX.1-dev (transformer de difusión) |
| Parametros totales | No disponible (el peso del adaptador es de 0,7 GB) |
| Parametros activos | No aplica (LoRA no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en float16) |
| Idiomas soportados | Inglés (prompts en otros idiomas pueden funcionar) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El modelo es un LoRA que se ajusta sobre **FLUX.1-dev**, un modelo de difusión de texto a imagen de 12 mil millones de parámetros desarrollado por Black Forest Labs. FLUX.1-dev utiliza una arquitectura transformer híbrida con flujo de rectificado (rectified flow), que combina atención de múltiples cabezas y bloques de transformador para generar imágenes de alta calidad. El adaptador LoRA modifica los pesos de las capas de atención del modelo base para reducir o eliminar los filtros de contenido que el modelo original aplica a las salidas.

No se dispone de información pública sobre el proceso de entrenamiento del LoRA: ni el número de tokens, ni la composición del dataset, ni si se utilizaron técnicas de RLHF o DPO. El autor solo indica que se ha "fine-tuned para eliminar las restricciones de contenido del modelo base". La carga se realiza mediante `load_lora_weights` de `diffusers`, y el ejemplo de código proporcionado muestra una integración directa con el pipeline de FLUX.1-dev.

## Capacidades

- Generación de imágenes a partir de prompts de texto sin filtros de moderación de contenido, incluyendo contenido NSFW (not safe for work).
- Compatible con el pipeline estándar de FLUX.1-dev, por lo que hereda sus capacidades de calidad de imagen, resolución y estilos.
- Soporta parámetros de generación como `guidance_scale`, `num_inference_steps`, `width`, `height` y `seed`.
- Permite el uso de `negative_prompt` para refinar la salida.
- Se integra con la biblioteca `diffusers` y `peft` para cargar el adaptador de forma sencilla.
- Funciona en GPU y CPU, aunque la inferencia en CPU es muy lenta dada la magnitud del modelo base.
- No incluye capacidades de visión, audio o razonamiento multimodal más allá de la generación de imágenes.

## Casos de uso

- **Investigación sobre moderación de contenido**: permite estudiar cómo los modelos de difusión aplican filtros de seguridad y qué técnicas de ajuste fino los eluden, útil para mejorar sistemas de moderación.
- **Generación artística sin restricciones**: artistas digitales pueden explorar temas que las plataformas comerciales censuran, como desnudos artísticos o representaciones controvertidas, manteniendo la calidad de FLUX.
- **Pruebas de robustez de sistemas de filtrado**: desarrolladores de herramientas de moderación pueden usar este modelo para evaluar la eficacia de sus detectores de contenido inapropiado.
- **Creación de contenido para adultos con control local**: profesionales del sector pueden generar material específico sin depender de APIs externas que imponen políticas restrictivas.
- **Desarrollo de pipelines personalizados**: sirve como base para experimentar con técnicas de fine-tuning y adaptación de modelos de difusión en entornos controlados.
- **Educación sobre ética en IA**: en un contexto académico, permite ilustrar los desafíos técnicos y éticos del control de contenido en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos o adaptadores. El único dato objetivo es que el adaptador funciona con FLUX.1-dev, que en su lanzamiento reportó un rendimiento superior a otros modelos de difusión en métricas como GenEval y T2I CompBench, pero esos datos corresponden al modelo base, no a este LoRA.

## Requisitos de hardware

- **VRAM estimada**: para ejecutar FLUX.1-dev con el adaptador LoRA, se necesitan al menos 24 GB de VRAM en modo float16 (por ejemplo, una RTX 3090, RTX 4090 o A100). Con cuantización del modelo base (por ejemplo, GGUF o bitsandbytes) se puede reducir a 12-16 GB, pero el adaptador LoRA no está cuantizado.
- **GPU recomendadas**: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100. También puede ejecutarse en GPUs de menor memoria usando técnicas de offload a CPU, pero con latencias muy altas.
- **En consumer GPU**: sí, en tarjetas con 24 GB de VRAM o más. Con cuantización del modelo base, puede caber en GPUs de 12 GB (por ejemplo, RTX 3060) usando `bitsandbytes`.
- **Opciones de despliegue**: el ejemplo oficial usa `diffusers` con PyTorch. También puede integrarse con `ComfyUI` o `Automatic1111` (mediante extensiones LoRA). No se han reportado integraciones con vLLM o TGI porque son herramientas orientadas a LLM, no a difusión.
- **Latencia y throughput**: no hay datos publicados. En una RTX 4090, la generación de una imagen 1024x1024 con 28 pasos tarda aproximadamente 10-15 segundos con FLUX.1-dev, y el LoRA añade una sobrecarga mínima.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reaper698/Flux-NSFW-uncensored | LoRA sobre FLUX.1-dev | No disponible (0,7 GB) | No aplica | CreativeML OpenRAIL-M | HuggingFace |
| shauray/flux.1-dev-uncensored-q4 | LoRA cuantizado sobre FLUX.1-dev | No disponible | No aplica | CreativeML OpenRAIL-M | HuggingFace |
| FLUX.1-dev (base) | Modelo completo | 12 B | No aplica | FLUX.1-dev Non-Commercial License | HuggingFace |

La principal diferencia con el modelo base es que este LoRA elimina los filtros de contenido. Frente a otros LoRA similares, como `shauray/flux.1-dev-uncensored-q4`, no hay datos comparativos de calidad o rendimiento. Ambos persiguen el mismo objetivo, pero la versión cuantizada de `shauray` puede tener menor tamaño o requerir menos VRAM, aunque no se ha verificado.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo genera contenido explícito para adultos, lo que puede violar las políticas de uso de plataformas, leyes locales y términos de servicio de HuggingFace o de servicios de alojamiento.
- **Sesgos y alucinaciones**: al ser un adaptador sobre FLUX.1-dev, hereda los sesgos del modelo base en cuanto a representación de personas, géneros y etnias. Además, puede generar imágenes con deformidades anatómicas o artefactos, especialmente en escenas complejas.
- **Riesgo de uso indebido**: la eliminación de filtros puede facilitar la creación de contenido ilegal (pornografía infantil, violencia extrema, etc.). El autor declara que es un "playground" para explorar límites, pero no ofrece salvaguardas.
- **Licencia**: la licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones de uso responsable (no generar contenido ilegal o dañino). El usuario es responsable del cumplimiento legal.
- **Dependencia del modelo base**: el LoRA no funciona sin FLUX.1-dev, que tiene su propia licencia no comercial. Para uso comercial, se necesitaría la versión comercial de FLUX o una licencia adecuada.
- **Sin soporte técnico**: no hay documentación de entrenamiento, ni garantías de reproducibilidad, ni mantenimiento activo por parte del autor.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Reaper698/Flux-NSFW-uncensored)
- [Colección de modelos FLUX NSFW en HuggingFace](https://huggingface.co/collections/anonymous111110987654321/ai-flux-nsfw-and-uncensored)
- [Guía de generación NSFW con Flux (2026)](https://ourdream.ai/comparison/flux-nsfw)
- [Modelo similar: shauray/flux.1-dev-uncensored-q4](https://huggingface.co/shauray/flux.1-dev-uncensored-q4)
- [Guía local de Flux Uncensored (2026)](https://aipornguide.com/blog/flux-uncensored-local-guide/)
- [Repositorio GitHub de otro LoRA similar: KirbyLulu/Flux-Unc-V2](https://github.com/KirbyLulu/Flux-Unc-V2)
