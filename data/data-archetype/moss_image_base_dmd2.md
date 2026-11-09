# data-archetype/moss_image_base_dmd2

## Resumen

`moss_image_base_dmd2` es un adaptador LoRA de destilación por coincidencia de distribuciones (distribution matching distillation, DMD2) para el modelo de generación de imágenes texto-a-imagen MOSS-Image-Base, desarrollado por el usuario `data-archetype`. Su función es reducir el coste de inferencia del modelo base: sustituye las 50 pasos guiados con CFG del original por 8 pasos a CFG 1 y sin prompt negativo, manteniendo el transformador del modelo base congelado y adaptándolo mediante un LoRA de rango 128.

El adaptador no modifica el codificador de texto (Qwen3.5-9B), el VAE (decodificador pequeño de FLUX.2), el tokenizador ni el pipeline de inferencia: solo ajusta el transformador. Se distribuye en dos formatos equivalentes (adaptador PEFT para Diffusers y LoRA empaquetado para ComfyUI) y está pensado para cargarse junto al modelo base o junto a otros fine-tunes y LoRAs del mismo, a fuerza 1.

Es relevante porque permite ejecutar un modelo de ~1 megapíxel de resolución en 8 evaluaciones del transformador en lugar de 50 pasos con doble forward por CFG, lo que reduce drásticamente el coste computacional por imagen. La licencia Apache 2.0 y la disponibilidad de workflows de ComfyUI facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128) sobre el transformador de MOSS-Image-Base; destilación DMD2 |
| Parametros totales | No disponible (el adaptador pesa 1.8 GB en el repo; el modelo base no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; resolución ~1 megapíxel, cualquier relación de aspecto soportada por el base) |
| Tipos de cuantizacion | Pesos del adaptador en bf16; el repo base ofrece variantes int8 y w4a8 del codificador de texto |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA ComfyUI y adaptador PEFT para Diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 aplicado exclusivamente al transformador de MOSS-Image-Base. El resto del pipeline (codificador de texto Qwen3.5-9B, VAE FLUX.2 small, tokenizador y pipeline de inferencia) permanece sin cambios. El método de entrenamiento es destilación por coincidencia de distribuciones (DMD2), que entrena al adaptador para imitar la distribución de salida del modelo base guiado, pero en 8 forwards a CFG 1 y sin prompt negativo. El informe técnico completo se encuentra en `TECH_REPORT.md` dentro del repositorio.

El muestreo está acoplado al entrenamiento: el LoRA está entrenado para un único sampler (equivalente al `lcm` de ComfyUI), con 8 pasos equiespaciados bajo un flow shift de 4.4817 (aproximadamente `exp(1.5)`), y una programación de tiempos concreta (1, 7/8, ..., 1/8, 0). Otros samplers producen peores resultados. En cada paso se toma la estimación limpia del modelo y se reinyecta ruido fresco hasta el siguiente nivel. El adaptador está pensado para funcionar también con la mayoría de fine-tunes del modelo base y con otros LoRAs, cargándose junto a ellos a fuerza 1.

## Capacidades

- Generación de imágenes texto-a-imagen en unos 1 megapíxel de resolución, con cualquier relación de aspecto soportada por el modelo base.
- Inferencia en 8 pasos a CFG 1 sin prompt negativo, con la guía destilada en los pesos del adaptador.
- Compatibilidad con fine-tunes y otros LoRAs de MOSS-Image-Base, cargados conjuntamente.
- Integración nativa con ComfyUI mediante workflow incluido (archivos JSON y workflow embebido en la imagen de ejemplo).
- Integración con Diffusers mediante adaptador PEFT y una subclase de scheduler incluida en la model card.
- Soporte de prompts en inglés y chino.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen.

## Casos de uso

- Generación de imágenes en producción de alta throughput: al reducir de 50 pasos guiados a 8 forwards a CFG 1, el coste por imagen cae aproximadamente un orden de magnitud, lo que permite servir lotes grandes en GPUs de inference.
- Prototipado rápido de prompts e iteración de estilo: la latencia baja permite probar variaciones de prompt y relaciones de aspecto en segundos, útil en equipos de diseño y contenido.
- Ilustración para marketing y redes sociales: genera imágenes a ~1 megapíxel con relación de aspecto configurable, adecuadas para banners y publicaciones.
- Integración en pipelines de ComfyUI: el workflow incluido (`moss_image_base_dmd2_8step.json`) permite encadenar el adaptador con otros nodos de posprocesado, upscaling o edición.
- Combinación con fine-tunes y LoRAs de estilo: al cargarse a fuerza 1 junto a otros adaptadores, permite aplicar estilos personalizados manteniendo la aceleración de 8 pasos.
- Generación bilingüe de imágenes para mercados anglófono y chino: el codificador de texto Qwen3.5-9B soporta prompts en en y zh.
- Servicios de generación de imágenes bajo demanda en infraestructura con GPUs de gama media: el menor número de forwards reduce los requisitos de VRAM y tiempo frente al modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del transformador base de MOSS-Image y del codificador de texto Qwen3.5-9B (este último con variantes int8 y w4a8 que reducen su huella).
- El adaptador en sí ocupa 1.8 GB en el repositorio (pesos bf16); el modelo base debe cargarse además.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del modelo base.
- Opciones de despliegue: ComfyUI (soporte nativo de MOSS-Image, con `LoraLoaderBypassModelOnly`), Diffusers ≥ 0.38 con transformers ≥ 5.3, accelerate ≥ 1.10, safetensors ≥ 0.6 y peft ≥ 0.21.
- Latencia y throughput: no disponibles; la reducción de 50 pasos guiados a 8 forwards a CFG 1 implica una reducción sustancial del coste por imagen, pero no se publican cifras concretas.
- Nota de despliegue: en ComfyUI debe usarse el loader de bypass ("Load LoRA (Bypass, Model Only)"), no el loader estándar, porque al fusionar el LoRA en bf16 se pierde la mayor parte del cambio de pesos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparativas con otros adaptadores de destilación o modelos de generación de imagen.

## Limitaciones y advertencias

- El adaptador está entrenado para un único sampler y una programación de tiempos concreta; otros samplers o shifts distintos producen peores resultados. En ComfyUI debe usarse `ModelSamplingAuraFlow` (o `ModelSamplingFlux`) con shift 4.4817, no `ModelSamplingSD3`, que convierte la salida en ruido.
- En ComfyUI, el uso del loader estándar de LoRA fusiona los pesos en bf16 y pierde la mayor parte del cambio; es obligatorio el loader de bypass.
- Solo soporta prompts en inglés y chino; no se documenta soporte multilingüe adicional.
- Al ser un adaptador de destilación, puede presentar menor diversidad o fidelidad que el modelo base con 50 pasos y CFG completo; no se publican métricas que lo cuantifiquen.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base MOSS-Image-Base, no documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base y de los componentes (Qwen3.5-9B, VAE FLUX.2).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-09) sin validación comunitaria documentada.
- No se especifican requisitos de VRAM ni GPUs recomendadas; el despliegue en producción requiere validar el rendimiento real con el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/data-archetype/moss_image_base_dmd2
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Pesos para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Informe técnico: `TECH_REPORT.md` dentro del repositorio
- Workflow ComfyUI: `workflows/moss_image_base_dmd2_8step.json` dentro del repositorio
- Workflow ComfyUI (formato API): `workflows/moss_image_base_dmd2_8step_api.json` dentro del repositorio
- PyTorch: https://pytorch.org/get-started/locally/
