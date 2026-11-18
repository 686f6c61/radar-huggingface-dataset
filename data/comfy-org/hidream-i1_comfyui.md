# Comfy-Org/HiDream-I1_ComfyUI

## Resumen

HiDream-I1_ComfyUI es un repositorio de redistribución de pesos del modelo de difusión texto-a-imagen HiDream-I1, empaquetados en formato single-file para su uso directo en ComfyUI. No se trata de un modelo nuevo ni de un desarrollo propio de Comfy-Org: es un repackaging de los pesos originales publicados por HiDream-ai (variantes I1-Dev, I1-Fast, I1-Full y E1-1, E1-Full), reorganizados en archivos `.safetensors` autónomos que eliminan la necesidad de gestionar múltiples subcarpetas y configuraciones del repositorio original.

El repositorio cubre tanto generación texto-a-imagen (familia I1) como edición de imagen (familia E1), e incluye los text encoders necesarios (CLIP-G, CLIP-L, T5-XXL y Llama 3.1 8B Instruct) y el VAE. Su relevancia práctica radica en que simplifica el despliegue en ComfyUI: el usuario descarga los ficheros y los coloca en carpetas estandarizadas, con workflows oficiales ya publicados para cada variante.

El tamaño del repositorio (310,3 GB) refleja que contiene múltiples variantes y precisiones (bf16, fp8, fp16) de varios modelos, no un único checkpoint. La licencia declarada es MIT. No se dispone de información sobre arquitectura interna, número de parámetros ni datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica directamente; los text encoders incluyen T5-XXL y Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | bf16, fp16, fp8 (según nombres de ficheros: `_bf16`, `_fp16`, `_fp8`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (single-file para ComfyUI) |

Variantes incluidas en el repositorio:

| Fichero | Variante | Precision |
|---|---|---|
| `hidream_e1_1_bf16.safetensors` | E1-1 (edición) | bf16 |
| `hidream_e1_full_bf16.safetensors` | E1-Full (edición) | bf16 |
| `hidream_i1_dev_bf16.safetensors` | I1-Dev | bf16 |
| `hidream_i1_dev_fp8.safetensors` | I1-Dev | fp8 |
| `hidream_i1_fast_bf16.safetensors` | I1-Fast | bf16 |
| `hidream_i1_fast_fp8.safetensors` | I1-Fast | fp8 |
| `hidream_i1_full_fp16.safetensors` | I1-Full | fp16 |
| `hidream_i1_full_fp8.safetensors` | I1-Full | fp8 |

Text encoders y VAE requeridos: `clip_g_hidream.safetensors`, `clip_l_hidream.safetensors`, `llama_3.1_8b_instruct_fp8_scaled.safetensors`, `t5xxl_fp8_e4m3fn_scaled.safetensors`, `ae.safetensors`.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por los componentes requeridos (cuatro text encoders: CLIP-G, CLIP-L, T5-XXL y Llama 3.1 8B Instruct, más un VAE) se deduce que HiDream-I1 utiliza un esquema de codificación de texto múltiple y combinada, pero no se detalla el tipo de backbone de difusión (UNet, DiT u otro), el número de parámetros ni la estrategia de entrenamiento.

Tampoco se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El repositorio es exclusivamente un repackaging de pesos; para detalles de entrenamiento debe consultarse el repositorio original de HiDream-ai.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`), en las variantes I1-Dev, I1-Fast e I1-Full.
- Edición de imágenes guiada por texto, en las variantes E1-1 y E1-Full (workflows "before/after" publicados).
- Tres regímenes de calidad/velocidad: Fast (iteraciones reducidas), Dev (equilibrado) y Full (máxima calidad), según la nomenclatura de las variantes.
- Integración nativa con ComfyUI mediante ficheros single-file y workflows oficiales.
- Soporte de cuantización fp8 para reducir requisitos de VRAM en las variantes Dev y Fast; fp16 para Full.
- Codificación de prompts multiencoder (CLIP-G, CLIP-L, T5-XXL, Llama 3.1 8B Instruct), lo que en principio permite prompts largos y detallados.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio, vídeo ni modo "thinking".

## Casos de uso

- Generación de ilustraciones para prototipado de producto: usar la variante I1-Fast en ComfyUI para iterar rápidamente sobre conceptos visuales antes de fijar un diseño, gracias a su menor coste computacional frente a Full.
- Edición de imágenes en flujos de retoque: la variante E1-1 permite modificar una imagen existente con instrucciones textuales (workflow "before/after"), útil para cambiar fondos, estilos o elementos concretos sin rehacer la composición.
- Creación de assets para videojuegos o contenido editorial: I1-Dev con cuantización fp8 ofrece un equilibrio entre calidad y VRAM, adecuado para generar lotes de imágenes en una estación de trabajo con GPU de gama alta de consumo.
- Generación de imágenes de alta fidelidad para impresión o marketing: I1-Full en fp16, orientado a máxima calidad cuando el coste por imagen no es crítico.
- Automatización de pipelines creativos dentro de ComfyUI: al ser ficheros single-file con workflows JSON oficiales, se pueden encadenar nodos (upscaling, segmentación, postproceso) y ejecutar por lotes de forma reproducible.
- Investigación y experimentación con modelos de difusión: el repositorio facilita comparar variantes (Fast/Dev/Full) y precisiones (fp8/bf16/fp16) sobre el mismo pipeline sin gestionar el repo original.
- Edición asistida en estudios de diseño: E1-Full para ediciones de mayor calidad sobre imágenes de referencia, integrado en un flujo ComfyUI compartido por el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia cualitativa, las variantes fp8 están pensadas para reducir huella de VRAM frente a bf16/fp16, pero no se proporcionan cifras concretas.
- Los text encoders incluyen T5-XXL y Llama 3.1 8B Instruct, lo que añade requisitos de memoria adicionales en tiempo de inferencia; el uso de sus versiones `fp8_scaled` sugiere que el pipeline completo necesita planificación de VRAM cuidadosa.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada con datos; la existencia de variantes fp8 y Fast sugiere que el objetivo es acercar el modelo a hardware de gama alta de consumo, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (soporte nativo mediante `diffusion-single-file`); otros backends (vLLM, TGI, llama.cpp, Ollama) no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables (por ejemplo, otros modelos texto-a-imagen de difusión) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio no es el modelo original: es un repackaging de Comfy-Org. Para soporte, documentación técnica y actualizaciones conviene acudir a los repositorios de HiDream-ai.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones de idioma en la información disponible; deben evaluarse empíricamente antes de usos sensibles.
- El tamaño total del repositorio (310,3 GB) implica un coste de almacenamiento y descarga considerable; conviene descargar solo las variantes y precisiones necesarias.
- La licencia MIT se declara en la model card, pero al tratarse de pesos derivados de HiDream-ai conviene verificar las condiciones de la licencia del modelo original antes de uso comercial.
- Los pesos están empaquetados específicamente para ComfyUI; su uso en otros frameworks requerirá conversión o adaptación no documentada aquí.
- No hay información sobre resolución nativa, número de pasos recomendado ni parámetros de muestreo; deben consultarse los workflows oficiales enlazados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/HiDream-I1_ComfyUI
- Modelo original E1-1: https://huggingface.co/HiDream-ai/HiDream-E1-1
- Modelo original E1-Full: https://huggingface.co/HiDream-ai/HiDream-E1-Full
- Modelo original I1-Dev: https://huggingface.co/HiDream-ai/HiDream-I1-Dev
- Modelo original I1-Fast: https://huggingface.co/HiDream-ai/HiDream-I1-Fast
- Modelo original I1-Full: https://huggingface.co/HiDream-ai/HiDream-I1-Full
- Guía de uso en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/hidream/
- Workflow E1.1 Image Editing: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/hidream_e1_1.json
- Workflow I1 Dev: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/hidream_i1_dev.json
- Workflow E1 Full: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/hidream_e1_full.json
- Workflow I1 Fast: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/hidream_i1_fast.json
- Workflow I1 Full: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/hidream_i1_full.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
- Comunidad francófona ComfyUI: https://comfyui.fr/
