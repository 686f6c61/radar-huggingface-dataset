# Comfy-Org/Qwen-Image-Edit_ComfyUI

## Resumen

Comfy-Org/Qwen-Image-Edit_ComfyUI es un repositorio de redistribución de pesos para ComfyUI que empaqueta los modelos de edición de imagen de la familia Qwen-Image-Edit (versiones base, 2509 y 2511) junto con una finetune de FireRedTeam (FireRed-Image-Edit-1.0) y una colección de LoRAs comunitarias. No es un modelo entrenado por Comfy-Org, sino un espejo en formato de archivo único (`diffusion-single-file`) pensado para colocarse directamente en `ComfyUI/models/diffusion_models/` y `ComfyUI/models/loras/`, evitando al usuario tener que convertir o dividir checkpoints. Con más de 1,89 millones de descargas y 525 likes, se ha convertido en la vía práctica de acceso a Qwen-Image-Edit dentro del ecosistema ComfyUI.

El modelo subyacente resuelve edición de imagen guiada por instrucciones en lenguaje natural: sustitución de materiales, cambio de ángulos de cámara, relight, migración de iluminación o conversión de objetos generados a realismo fotográfico. La licencia declarada es Apache 2.0 y el repositorio ocupa 288,2 GB, reflejando que contiene múltiples variantes de pesos (bf16, fp8 e int8) para distintos presupuestos de VRAM.

Es relevante ahora porque consolida en un solo paquete las tres iteraciones del modelo de edición de Qwen (original, 2509 y 2511), lo que permite comparar versiones y aplicar LoRAs específicas sin gestionar repositorios dispersos. La información pública disponible sobre arquitectura interna, parámetros y datos de entrenamiento es escasa: la model card se limita a instrucciones de instalación y enlaces a las fuentes originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para edición de imagen; familia Qwen-Image-Edit) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, fp8 (e4m3fn y fp8mixed), int8 (convrot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la información disponible. Por la naturaleza del pipeline (`diffusion-single-file`) y los nombres de los archivos, se trata de modelos de difusión para edición de imagen condicionada por instrucciones textuales, empaquetados como safetensors de archivo único para su carga en ComfyUI. El repositorio incluye variantes de la familia Qwen-Image-Edit (base, 2509 y 2511) y una finetune de FireRedTeam (FireRed-Image-Edit-1.0), pero no se especifican número de parámetros, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO o etapas de refinamiento.

Las innovaciones técnicas documentadas se limitan al plano de despliegue: empaquetado single-file compatible con ComfyUI, publicación de pesos en bf16, fp8 e int8 para ajustar el consumo de VRAM, y una batería de LoRAs comunitarias que añaden capacidades específicas (múltiples ángulos, relight, migración de luz, fusión, conversión anything-to-real y white-to-scene). No hay información sobre mecanismos de atención, decodificación especulativa ni detalles del entrenamiento original.

## Capacidades

- Edición de imagen guiada por instrucciones en lenguaje natural sobre una imagen de entrada.
- Sustitución de materiales y texturas (workflow "Material Replacement" de la versión 2511).
- Cambio de ángulo de cámara mediante la LoRA `Qwen-Edit-2509-Multiple-angles`.
- Relight y migración de iluminación mediante las LoRAs `Qwen-Image-Edit-2509-Relight` y `Qwen-Image-Edit-2509-Light-Migration`.
- Fusión de imágenes y composición mediante `Qwen-Image-Edit-2509-Fusion`.
- Conversión de contenido generado a aspecto realista con `Qwen-Image-Edit-2509-Anything2RealAlpha`.
- Transformación de fondo blanco a escena completa con `Qwen-Image-Edit-2509-White_to_Scene`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (el modelo opera sobre imagen, no sobre texto generativo general).

## Casos de uso

- Edición de producto en e-commerce: se introduce una foto de catálogo y una instrucción de cambio de material o color; el modelo aplica la modificación preservando la geometría del objeto, útil para generar variantes de SKU sin sesión fotográfica.
- Postproducción fotográfica con relight: partiendo de un retrato o bodegón, se reilumina la escena para simular luz de estudio, hora dorada o luz nocturna usando la LoRA de relight, reduciendo el trabajo manual en Photoshop.
- Generación de múltiples ángulos de un mismo objeto: con la LoRA de múltiples ángulos se obtienen vistas adicionales a partir de una sola imagen, aplicable a fichas de producto 360 grados o previsualización de assets 3D.
- Sustitución de materiales en visualización arquitectónica: el workflow de material replacement de la versión 2511 permite cambiar acabados (madera, mármol, metal) sobre renders existentes para presentar alternativas al cliente.
- Limpieza de fondos para catálogo: la LoRA white-to-scene y las capacidades de edición permiten pasar de fondo blanco a escena contextualizada, o al contrario, para cumplir requisitos de marketplaces.
- Prototipado creativo en estudios de diseño: combinación de la finetune FireRed-Image-Edit-1.0 con LoRAs de fusión para iterar conceptos visuales rápidamente dentro de un grafo de ComfyUI, con todas las variantes de cuantización disponibles para ajustar el coste de GPU.
- Integración en pipelines automatizados de contenido: al ser safetensors single-file y cargarse en ComfyUI, puede orquestarse mediante la API de ComfyUI para procesar lotes de imágenes con instrucciones predefinidas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Las variantes publicadas (bf16, fp8 e4m3fn, fp8mixed, int8 convrot) indican que el modelo puede ejecutarse en distintos rangos de VRAM, siendo int8 y fp8 las opciones para GPUs con menos memoria.
- GPU recomendadas: no disponible. Por el tamaño del repositorio (288,2 GB con todas las variantes) y la presencia de pesos bf16, se requiere una GPU con memoria suficiente para el checkpoint elegido; las variantes int8/fp8 están pensadas para reducir ese requisito.
- ¿Cabe en GPU consumer? No disponible de forma explícita; la existencia de cuantizaciones int8 y fp8 sugiere compatibilidad con GPUs consumer de gama alta, pero no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI (nativo, con workflows oficiales en `Comfy-Org/workflow_templates`), Comfy Cloud (cloud.comfy.org) y Comfy Registry para nodos personalizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/Qwen-Image-Edit_ComfyUI | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, ComfyUI, Comfy Cloud |
| Qwen/Qwen-Image-Edit (original) | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| FireRedTeam/FireRed-Image-Edit-1.0 | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| dx8152 LoRAs (Qwen-Edit-2509-*) | no aplica (LoRAs) | no aplica | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de edición de imagen, puede heredar sesgos de los datos de entrenamiento originales de Qwen-Image-Edit, no descritos aquí.
- Riesgo de alucinación: no cuantificado; en edición de imagen se traduce en modificaciones no solicitadas o artefactos en zonas no instruidas, sin métricas publicadas.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el repositorio agrega pesos de terceros (Qwen, FireRedTeam, dx8152, lrzjason) cuyas licencias individuales no se detallan en la información; conviene verificar cada fuente antes de uso comercial.
- El repositorio es un repackaging, no un modelo original: los problemas de calidad deben reportarse contra los repositorios fuente.
- El tamaño del repositorio (288,2 GB) implica un coste de almacenamiento y descarga considerable; conviene descargar solo la variante de cuantización necesaria.
- No hay información sobre requisitos de VRAM oficiales ni sobre latencia, lo que dificulta planificar producción sin pruebas propias.
- La fecha de actualización (2026-09-23) es posterior a la de creación (2025-08-19); verificar que los archivos descargados corresponden a la versión esperada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI
- Modelo base Qwen/Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit
- Modelo base Qwen/Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Modelo base Qwen/Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Finetune FireRedTeam/FireRed-Image-Edit-1.0: https://huggingface.co/FireRedTeam/FireRed-Image-Edit-1.0
- LoRA Light-Migration: https://huggingface.co/dx8152/Qwen-Edit-2509-Light-Migration/
- LoRA Multiple-angles: https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- LoRA Fusion: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Fusion
- LoRA Relight: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Relight
- LoRA Anything2Real Alpha: https://huggingface.co/lrzjason/QwenEdit-Anything2Real_Alpha/
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflows: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2509.json
- Workflow 2511 int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2511_int8.json
- Workflow 2511 material replacement: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2511.json
- Comfy Cloud: https://cloud.comfy.org/
- Comfy Registry: https://comfyui.fr/
