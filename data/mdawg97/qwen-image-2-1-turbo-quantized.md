# Mdawg97/Qwen-Image-2.1-Turbo-Quantized

## Resumen

Qwen-Image-2.1-Turbo-Quantized es un repositorio de cuantizaciones del modelo de generación de imágenes Qwen-Image-2.1-Turbo, desarrollado originalmente por el equipo Qwen (Alibaba). El repositorio está publicado por el usuario Mdawg97 (también referenciado como abenzerps en los enlaces de la model card) y su función es empaquetar el modelo base en múltiples formatos de precisión reducida para facilitar su despliegue en hardware de consumo y en distintos runtimes.

El modelo base es una arquitectura de generación visual de aproximadamente 7.115 millones de parámetros (7B) orientada a text-to-image, con capacidad nativa de generación y edición de imágenes, soporte de transparencia nativa y edición con múltiples referencias. El repositorio ofrece variantes GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), safetensors en FP8, INT8 ConvRot y NVFP4, y formatos MLX de 4, 6 y 8 bits, además de los componentes auxiliares (text encoder Qwen3-VL 8B y VAE).

La relevancia de este repositorio radica en que permite ejecutar un modelo de generación de imágenes de 7B con tan solo 4 GB de pesos (Q4_K_M o MLX 4-bit) y tiempos de generación de 1024 × 1024 de aproximadamente 10 a 20 segundos en GPU tras el calentamiento, según la model card. Está pensado para su uso en ComfyUI, en runtimes de línea de comandos mediante stable-diffusion.cpp y en el ecosistema MLX/MFLUX de Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de generación visual (text-to-image) de 7B, basado en Qwen-Image-2.1-Turbo; detalles internos de la arquitectura no disponibles |
| Parametros totales | 7.115.124.736 (7B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), safetensors FP8, INT8 ConvRot, NVFP4; MLX 4-bit, 6-bit, 8-bit |
| Idiomas soportados | No disponible (las indicaciones de texto se procesan vía el text encoder Qwen3-VL 8B) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF, safetensors (FP8, INT8 ConvRot, NVFP4, MLX), BF16 para text encoder y VAE |
| Tamano del repo | 90.0 GB (incluye todas las variantes y componentes auxiliares) |
| Pasos de denoising | 8 (generación turbo) |
| CFG por defecto | 1.0 |
| Resolucion de referencia | 1024 × 1024 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo pertenece a la serie Qwen-Image y se describe como un modelo de generación de imágenes de 7B con generación y edición unificadas, transparencia nativa, soporte de múltiples referencias en edición, control local y restauración de alta fidelidad. La información proporcionada no detalla la arquitectura interna (tipo de transformer, mecanismo de atención, composición del dataset de entrenamiento, número de tokens ni si se aplicaron técnicas de RLHF o DPO). Lo que sí se especifica es el régimen de inferencia "turbo": 8 pasos de denoising con CFG = 1.0 y un schedule de sigma oficial, lo que reduce drásticamente el coste computacional frente a modelos de difusión con decenas de pasos.

Este repositorio no entrena ni modifica el modelo base: aplica cuantización post-entrenamiento en varios formatos. Los ficheros FP8 e INT8 ConvRot mantienen una precisión alta (7,13 GB y 7,26 GB respectivamente), mientras que NVFP4 y MLX 4-bit reducen el peso a unos 4 GB. El text encoder es Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB), y el VAE se distribuye en BF16 (0,68 GB). No se documentan innovaciones técnicas propias del proceso de cuantización más allá de los formatos empleados.

## Capacidades

- Generación de imágenes text-to-image a 1024 × 1024 con 8 pasos de denoising y CFG 1.0.
- Generación y edición unificadas en el modelo base, con soporte de múltiples referencias, control local y restauración de alta fidelidad según la documentación de QwenCloud.
- Transparencia nativa en las imágenes generadas.
- Generación sin filtro de seguridad incorporado: la model card indica que el modelo base no aplica safety checker ni filtro de contenido y no requiere ajustes especiales.
- Procesamiento de indicaciones textuales mediante el text encoder Qwen3-VL 8B, que aporta capacidad de comprensión multimodal de la entrada.
- Compatibilidad con ComfyUI mediante plantilla oficial "Qwen Image 2.1 Turbo — Text to Image" y con runtimes de línea de comandos vía stable-diffusion.cpp.
- Compatibilidad con el ecosistema MLX/MFLUX en Apple Silicon mediante las variantes MLX 4/6/8-bit.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio, al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en estación de trabajo con GPU de consumo: con la variante Q4_K_M (4,05 GB) o MLX 4-bit (4,00 GB), el modelo cabe en GPUs con 8 GB de VRAM o en Macs con memoria unificada, permitiendo generar 1024 × 1024 en aproximadamente 10-20 segundos tras el calentamiento.
- Prototipado rápido en ComfyUI: la plantilla oficial y los formatos GGUF/safetensors permiten cargar el modelo directamente en `models/diffusion_models/` junto al text encoder y el VAE, sin necesidad de convertir pesos, lo que acelera la iteración sobre flujos de trabajo de imagen.
- Edición de imágenes con múltiples referencias: el modelo base soporta edición unificada con varias referencias y control local, útil para tareas de retoque, sustitución de objetos o restauración de alta fidelidad en pipelines de diseño gráfico.
- Generación de assets con transparencia: la transparencia nativa del modelo base lo hace adecuado para producir imágenes con canal alfa destinadas a interfaces, marketing o composición en capas sin post-procesado externo.
- Despliegue en servidores con aceleradores modernos: las variantes NVFP4 (4,20 GB) y FP8 (7,13 GB) están orientadas a GPUs con soporte de precisión reducida, permitiendo mayor throughput en entornos de producción.
- Ejecución en Apple Silicon: las variantes MLX 4/6/8-bit y el soporte de MFLUX permiten integrar la generación de imágenes en aplicaciones nativas de macOS sin GPU dedicada.
- Generación de contenido sin restricciones de filtro incorporado: al no incluir safety checker, el modelo puede emplearse en flujos donde el filtrado de contenido se gestiona externamente, aunque esto traslada la responsabilidad de moderación al operador.

## Benchmarks y rendimiento

La model card incluye una imagen de comparación de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`) para el modelo base Qwen-Image-2.1, pero los valores numéricos no están disponibles en la información proporcionada. No se publican cifras de MMLU, HumanEval, GSM8K ni métricas de calidad de imagen (FID, CLIP score, etc.) en el texto accesible.

Datos de rendimiento disponibles: generación de 1024 × 1024 en aproximadamente 10-20 segundos en GPU tras el calentamiento, con 8 pasos de denoising y CFG 1.0. No se especifican latencias por hardware concreto ni throughput en imágenes por segundo.

## Requisitos de hardware

- VRAM estimada para los pesos del modelo de difusión: unos 4 GB con Q4_K_M, Q4_0, NVFP4 o MLX 4-bit; unos 5 GB con Q5_K_M; unos 6 GB con Q6_K; unos 7,1-7,6 GB con FP8, INT8 ConvRot, Q8_0 o MLX 8-bit.
- Componentes adicionales: el text encoder Qwen3-VL 8B ocupa 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot; el VAE ocupa 0,68 GB en BF16. El total de VRAM debe cubrir difusión, text encoder y VAE, por lo que un despliegue completo en BF16 supera los 25 GB.
- GPU recomendadas: no se especifican modelos concretos. Las variantes NVFP4 y FP8 apuntan a GPUs con soporte de esas precisiones (por ejemplo, arquitecturas recientes de NVIDIA). Las variantes GGUF y MLX están pensadas para hardware más modesto.
- Cabe en GPU de consumo: sí, con las variantes de 4 GB (Q4_K_M, Q4_0, NVFP4, MLX 4-bit) y el text encoder en INT8, en GPUs con 12-16 GB de VRAM; en Apple Silicon, con memoria unificada suficiente para el conjunto de componentes.
- Opciones de despliegue: ComfyUI (GGUF o safetensors FP8/INT8 ConvRot/NVFP4), stable-diffusion.cpp para línea de comandos, MLX/MFLUX para Apple Silicon.
- Latencia y throughput: 10-20 segundos por imagen de 1024 × 1024 en GPU tras el calentamiento, según la model card; no se aportan cifras por modelo de GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables (por ejemplo, otras variantes de Qwen-Image, FLUX o Stable Diffusion) que permitan una comparación cuantitativa fiable. La comparativa se limita a lo documentado:

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (base) | 7B | No disponible | qwen-research | safetensors | Generación y edición unificadas, transparencia nativa, 8 pasos |
| Qwen-Image-2.1-Turbo-Quantized (este repo) | 7B | No disponible | qwen-research | GGUF, FP8, INT8 ConvRot, NVFP4, MLX | Cuantizaciones post-entrenamiento del base |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigación, no una licencia permisiva estándar. El uso comercial puede estar restringido y requiere revisar los términos exactos de la licencia qwen-research antes de desplegar en producción.
- Ausencia de safety checker: el modelo base no incorpora filtro de contenido, lo que implica que la moderación de imágenes generadas debe implementarse externamente; existe riesgo de generar contenido inapropiado si no se aplican salvaguardas.
- Riesgo de sesgos: no se documentan evaluaciones de sesgo en la información disponible; los modelos de generación de imágenes pueden reproducir sesgos demográficos y culturales presentes en sus datos de entrenamiento.
- Alucinación visual: no se aportan métricas de fidelidad prompt-imagen; la calidad puede degradarse con indicaciones complejas, múltiples referencias o resoluciones distintas de 1024 × 1024.
- Dependencia de componentes externos: el funcionamiento correcto requiere el text encoder Qwen3-VL 8B y el VAE específicos; usar otros componentes puede alterar los resultados.
- Requisitos de memoria agregados: aunque los pesos de difusión caben en 4 GB, el conjunto con text encoder y VAE exige bastante más VRAM, lo que puede limitar el despliegue en GPUs de gama baja.
- Compatibilidad de runtime: las instrucciones de uso están orientadas a ComfyUI, stable-diffusion.cpp y MLX/MFLUX; otros runtimes no están documentados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente (creado el 2026-11-06) sin validación comunitaria documentada.
- Idiomas: no se especifica qué idiomas de prompt están soportados; el rendimiento multilingüe depende del text encoder y no está documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mdawg97/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Documentación QwenCloud del modelo: https://docs.qwencloud.com/models/qwen-image-2-1-turbo
- Plantilla oficial de ComfyUI (workflow JSON): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- GitHub del autor: https://github.com/abenzerps
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
