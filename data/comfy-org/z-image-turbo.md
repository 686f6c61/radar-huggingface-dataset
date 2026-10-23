# Comfy-Org/Z-Image-Turbo

## Resumen

Z-Image-Turbo es un modelo de difusión texto‑imagen publicado originalmente por Tongyi‑MAI y redistribuido por Comfy‑Org en un repositorio empaquetado para su uso directo en ComfyUI. Este repositorio no contiene pesos entrenados por Comfy‑Org: es un reempaquetado de los ficheros del modelo base `Tongyi-MAI/Z-Image-Turbo` en formato de fichero único (`diffusion-single-file`), acompañado del codificador de texto, el VAE y una LoRA de destilación, todo con la estructura de carpetas que espera ComfyUI.

El interés del repositorio es práctico: concentra en un único paquete de 42,1 GB las variantes de precisión del modelo (bf16, int8 y nvfp4), tres versiones del codificador de texto (bf16, fp8 mixto y fp4 mixto) y los flujos de trabajo listos para ejecutar, incluyendo texto‑imagen, texto‑imagen en int8, reescalado a 2K y ControlNet Union. Con 9.173.397 descargas y 991 «me gusta» en HuggingFace, se ha convertido en una de las vías más habituales para probar Z-Image‑Turbo sin tener que reconstruir el grafo de nodos a mano.

La relevancia actual del modelo radica en su orientación a la generación rápida (el sufijo «Turbo» y la presencia de una LoRA de destilación apuntan a muestreo en pocos pasos) y en su licencia Apache 2.0, que permite uso comercial sin las restricciones de otras familias de modelos de imagen. No obstante, la información publicada en este repositorio es puramente de empaquetado: no incluye arquitectura detallada, número de parámetros ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto‑imagen (no se detalla la variante concreta: transformer de difusión, DiT/MMDiT u otra; no disponible en la información proporcionada) |
| Parámetros totales | No disponible (no se publica el recuento en la model card del reempaquetado) |
| Longitud de contexto | No aplica en el sentido de ventana de tokens del modelo de difusión; no disponible para el codificador de texto |
| Tipos de cuantización | Pesos del modelo: bf16, int8 (`convrot`) y nvfp4. Codificador de texto: bf16, fp8 mixto y fp4 mixto |
| Idiomas soportados | No disponible (no se documenta el multilingüismo de los prompts) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` de fichero único (diffusion-single-file) + LoRA en `safetensors` |
| Desarrollador del modelo original | Tongyi-MAI (modelo base `Tongyi-MAI/Z-Image-Turbo`) |
| Responsable del reempaquetado | Comfy-Org |
| Codificador de texto | Qwen3 4B (según los nombres de fichero `qwen_3_4b*.safetensors`) |
| VAE | `ae.safetensors` |
| Componentes incluidos | 3 checkpoints de difusión, 1 LoRA de destilación, 3 codificadores de texto, 1 VAE |
| Tamaño del repositorio | 42,1 GB |
| Descargas / likes | 9.173.397 / 991 |
| Fecha de creación | 26 de noviembre de 2025 |
| Última actualización | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo de difusión. Lo que sí puede afirmarse a partir de los ficheros publicados es la composición del pipeline: un checkpoint de difusión principal (en tres precisiones), un codificador de texto Qwen3 de 4 000 millones de parámetros según la nomenclatura de los ficheros, un VAE para la codificación y decodificación latente, y una LoRA denominada `distill_patch_lora`, que por su nombre corresponde a un parche de destilación aplicado sobre el modelo base para reducir el número de pasos de muestreo necesarios.

No se han publicado en este repositorio datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en difusión) ni innovaciones técnicas concretas como atención lineal o decodificación especulativa. Cualquier afirmación sobre estos puntos requeriría consultar la model card del repositorio original `Tongyi-MAI/Z-Image-Turbo`, que no forma parte de la información proporcionada. El reempaquetado de Comfy-Org se limita a reorganizar y conversionar los pesos (incluyendo las variantes int8 con rotación de convolución y nvfp4) sin aportar entrenamiento adicional.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (texto‑imagen), con flujos de trabajo oficiales en ComfyUI.
- Variante int8 específica para reducir requisitos de memoria manteniendo el pipeline de texto‑imagen.
- Reescalado de imagen hasta 2K mediante un flujo de trabajo dedicado (`utility_z_image_turbo_2k_upscaler`).
- Control estructural mediante ControlNet Union, lo que permite condicionar la generación con mapas de profundidad, pose, bordes u otras guías.
- Aplicación de una LoRA de destilación para muestreo en pocos pasos (el nombre del fichero indica destilación; no se documenta el número exacto de pasos).
- Múltiples precisiones de codificador de texto (bf16, fp8 mixto, fp4 mixto) para ajustar calidad y consumo de VRAM.
- No disponible: soporte de tool calling, agentes, razonamiento multi‑paso, visión de entrada o audio. Es un modelo generativo de imagen, no un modelo de lenguaje.

## Casos de uso

- **Generación de imágenes de producto para comercio electrónico**: el pipeline texto‑imagen con ControlNet Union permite fijar la silueta o la pose del producto y generar variantes de fondo e iluminación sin rehacer la fotografía original.
- **Reescalado de material gráfico a 2K**: el flujo `utility_z_image_turbo_2k_upscaler` está pensado para subir resolución de imágenes existentes, útil en catalogos, prensa y archivos digitales.
- **Prototipado rápido de conceptos visuales**: al ser un modelo «Turbo» con LoRA de destilación, encaja en iteraciones de diseño donde se necesita explorar muchas variantes en poco tiempo dentro de ComfyUI.
- **Pipelines por lotes en GPU de consumo**: la existencia de checkpoints int8 y nvfp4, junto con codificadores de texto en fp8/fp4 mixto, permite desplegar generación masiva en hardware más modesto que el requerido por la variante bf16.
- **Generación de assets para videojuegos y entornos 3D**: combinado con ControlNet Union, se pueden producir texturas, ilustraciones conceptuales y variaciones coherentes con una guía estructural dada.
- **Automatización dentro de ComfyUI/Comfy Cloud**: los flujos se pueden serializar como plantillas JSON y ejecutarse desde la API de ComfyUI, lo que facilita integrarlos en backends de aplicaciones web o en procesos programados.
- **Creación de contenido editorial e ilustración**: generación de ilustraciones para artículos y materiales divulgativos con licencia Apache 2.0, sin las restricciones de uso comercial de otras familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del reempaquetado de Comfy-Org no incluye métricas como FID, CLIP score, GenEval o comparativas cuantitativas con otros modelos de difusión, ni datos de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión. El repositorio ocupa 42,1 GB, pero incluye tres checkpoints de difusión, tres codificadores de texto y el VAE; el tamaño individual del checkpoint bf16 no se documenta. Sin el recuento de parámetros no es posible calcular una cifra fiable de VRAM.
- **GPU recomendadas**: no documentadas por el autor. Como referencia de formato, la variante nvfp4 está orientada a las GPU Blackwell de NVIDIA; en arquitecturas anteriores su uso puede no estar soportado de forma nativa y requerir las variantes bf16 o int8.
- **GPU de consumo**: la publicación de variantes int8, nvfp4 y de codificadores de texto en fp8/fp4 mixto indica que el modelo está pensado para ejecutarse en GPU de consumo, pero no se especifica qué modelos concretos (RTX 3060, 4090, etc.) ni con cuánta VRAM.
- **Opciones de despliegue**: ComfyUI (escritorio y servidor), Comfy Desktop para ejecución local y Comfy Cloud para ejecución en GPU bajo demanda. No se documenta soporte de vLLM, TGI o llama.cpp, que no aplican a modelos de difusión de este tipo.
- **Latencia y throughput**: no disponibles. El carácter «Turbo» y la LoRA de destilación sugieren pocos pasos de muestreo, pero no se publica ninguna cifra de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Distribución | Datos verificados en esta ficha |
|---|---|---|---|---|
| Z-Image-Turbo (Comfy-Org) | Difusión texto‑imagen | Apache 2.0 | Repo de 42,1 GB con variantes bf16/int8/nvfp4 | Parámetros no disponibles; 9,17 M descargas |
| Tongyi-MAI/Z-Image-Turbo | Difusión texto‑imagen (original) | Apache 2.0 (según el modelo base declarado) | Repositorio original del autor | Parámetros y benchmarks no disponibles en la información consultada |
| FLUX.1 [schnell] | Difusión texto‑imagen | Apache 2.0 | Pesos abiertos, integración en ComfyUI | Datos de parámetros y benchmarks no verificados en esta búsqueda |
| Stable Diffusion 3.5 | Difusión texto‑imagen | Comunidad / comercial según variante | Pesos abiertos | Datos de parámetros y benchmarks no verificados en esta búsqueda |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se publican parámetros ni métricas de calidad para Z-Image‑Turbo en este repositorio, por lo que cualquier tabla numérica frente a FLUX, SD 3.5 o Qwen‑Image sería especulativa.

## Limitaciones y advertencias

- **Ausencia de documentación técnica**: la model card es una guía de instalación, no una ficha técnica. No hay información sobre dataset, sesgos, filtrado de contenido ni evaluación de calidad.
- **Sesgos conocidos**: no documentados. Al no describirse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, etnia, cultura o representación geográfica.
- **Riesgo de alucinación visual**: como todo modelo generativo de imagen, puede producir anatomía incorrecta, texto ilegible en la imagen, perspectivas incoherentes y artefactos en detalles finos, especialmente en resoluciones altas o composiciones complejas.
- **Idioma de los prompts**: no se especifica qué idiomas admite el codificador de texto; el rendimiento en castellano no está verificado.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la licencia del repositorio original `Tongyi-MAI/Z-Image-Turbo` y las condiciones de los componentes de terceros (codificador Qwen3), que pueden tener términos propios.
- **Requisitos reales de memoria**: al no publicarse el número de parámetros, el dimensionado de infraestructura debe hacerse por prueba empírica; las variantes cuantizadas pueden degradar la fidelidad de forma no documentada.
- **Trazabilidad**: es un reempaquetado, no una versión oficial del autor original. Para citas académicas o auditorías debe referenciarse el repositorio de Tongyi‑MAI.
- **Producción**: no hay garantías de soporte, versionado semántico ni compatibilidad futura con nodos de ComfyUI; los flujos de trabajo pueden romperse entre versiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/Z-Image-Turbo
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Ejemplos y flujos de trabajo de ComfyUI para Z-Image: https://comfyanonymous.github.io/ComfyUI_examples/z_image/
- Plantilla texto‑imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo.json
- Plantilla texto‑imagen int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_int8.json
- Plantilla de reescalado 2K: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_z_image_turbo_2k_upscaler.app.json
- Plantilla ControlNet Union: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_fun_union_controlnet.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Sitio oficial de Comfy: https://comfy.org/
- Descarga de Comfy Desktop: https://comfy.org/download
