# Mitroshenkov87/voxprint-mirror-moss-image-sft

## Resumen

`Mitroshenkov87/voxprint-mirror-moss-image-sft` no es un modelo nuevo, sino una copia espejo sin modificar de `OpenMOSS-Team/MOSS-Image-SFT`, publicada por el usuario Mitroshenkov87 como fuente de descarga de respaldo para su herramienta Voxprint Model Forge. Los ficheros son idénticos byte a byte al commit `fc5de0d56fc910cbca6f6625a70f5f582b26deb1` del repositorio original; solo cambia el README. El modelo real que se evalúa aquí es, por tanto, MOSS-Image-SFT de OpenMOSS, un modelo de difusión texto-a-imagen de 5.082.308.624 parámetros (≈5,08 B) afinado con supervisión (SFT) a partir de MOSS-Image-Base.

La relevancia técnica de MOSS-Image-SFT está en el control explícito de la composición: acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON que permiten dirigir la colocación del texto y la disposición de los objetos dentro de la imagen. El ejemplo oficial de la model card muestra la generación de una nota manuscrita en chino sobre la puerta de un frigorífico, un caso de renderizado de texto que suele fallar en modelos de difusión genéricos y que la variante SFT mejora respecto a la Base (mejor agrupación de texto y organización más limpia en escenas tipo pizarra).

El repositorio pesa 27,2 GB, se distribuye bajo licencia Apache-2.0 y se ejecuta con la librería `diffusers` mediante un pipeline personalizado (`pipeline_moss_image`) que requiere `trust_remote_code=True`. A fecha de la información disponible no tiene descargas ni likes, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen de la familia MOSS-Image (transformer + VAE + scheduler, pipeline personalizado `pipeline_moss_image`); el detalle interno de bloques no se especifica en la información disponible |
| Parámetros totales | 5.082.308.624 (≈5,08 B), dato real del fichero safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de difusión, no de lenguaje. Resolución de referencia del ejemplo oficial: 1024 × 1024 píxeles |
| Tipos de cuantización | No se documentan cuantizaciones (GGUF, FP8, NF4). El ejemplo oficial carga el transformer en `bfloat16` y el VAE en `float32` |
| Idiomas soportados | No disponibles (la model card no los declara; el ejemplo incluye texto en chino renderizado dentro de la imagen) |
| Licencia | Apache-2.0 (se incluye el fichero `LICENSE` original sin cambios) |
| Formato de pesos | safetensors, estructura `diffusers`; repositorio de 27,2 GB |
| Tarea / pipeline | `text-to-image` |
| Modelo base | `OpenMOSS-Team/MOSS-Image-SFT` (a su vez derivado de `MOSS-Image-Base`) |
| Commit replicado | `fc5de0d56fc910cbca6f6625a70f5f582b26deb1` |
| Pasos de inferencia por defecto (ejemplo) | 50 |
| Guidance scale (ejemplo) | 3.0, con `uncond_skip_layers=[22]` |
| Dependencias mínimas | Python ≥3.10, PyTorch ≥2.9, `diffusers` ≥0.38, `transformers` ≥5.3, `accelerate` ≥1.10, `safetensors` ≥0.6, `Pillow` ≥10 |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-17 |

## Arquitectura y entrenamiento

MOSS-Image-SFT pertenece a la familia MOSS-Image de OpenMOSS y se obtiene por ajuste supervisado (SFT) sobre MOSS-Image-Base, conservando la misma arquitectura y el mismo pipeline de inferencia. La información disponible confirma la presencia de un transformer principal, un VAE y un scheduler reconfigurable, orquestados por el pipeline personalizado `pipeline_moss_image`; no se detalla en la documentación proporcionada el tipo exacto de bloque (DiT u otra variante), el reparto de parámetros entre componentes ni la configuración de atención.

El aspecto diferencial declarado es el control de la composición: además de prompts en lenguaje natural, el modelo admite secuencias de etiquetas y layouts en JSON para gobernar la posición del texto y la disposición de los objetos. El ejemplo de inferencia usa 50 pasos, guidance scale 3.0 y el parámetro `uncond_skip_layers=[22]`, cuyo efecto interno exacto no se describe en la información disponible. No se especifican en la documentación proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, con resolución de 1024 × 1024 en el ejemplo oficial.
- Renderizado de texto legible dentro de la imagen, incluido texto manuscrito y en chino (caso de la nota en el frigorífico).
- Control de maquetación mediante layouts en JSON: posición del texto y disposición de objetos.
- Soporte de secuencias de etiquetas (tag sequences) además del prompt conversacional.
- Mejora específica de la variante SFT frente a Base en agrupación de texto y organización de escenas tipo pizarra o whiteboard.
- Integración con ComfyUI documentada por el proyecto original.
- Compatibilidad con `diffusers` mediante `DiffusionPipeline` y pipeline personalizado con `trust_remote_code=True`.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, audio, vídeo ni edición de imagen.

## Casos de uso

- Rotulación comercial con texto fiable: generación de carteles, etiquetas de producto y packaging donde el texto debe aparecer nítido y bien agrupado; la variante SFT está pensada precisamente para mejorar ese agrupamiento frente a Base.
- Prototipado de infografías y pizarras: el ejemplo comparativo Base vs. SFT muestra una disposición más ordenada de una pizarra blanca, útil para generar material didáctico o diagramas anotados de forma iterativa.
- Maquetación controlada por JSON: en publicidad y diseño editorial se puede fijar la posición de titulares y objetos, reduciendo el número de reintentos frente a un prompt puramente descriptivo.
- Localización multilingüe de creatividades: el modelo renderiza texto en chino dentro de la escena, lo que permite generar materiales para mercados con escrituras no latinas sin post-edición tipográfica.
- Generación de mockups y escenas de producto: descripciones de interiores, electrodomésticos o menaje con notas y etiquetas visibles, aprovechables en catálogos de e-commerce.
- Flujos de trabajo en ComfyUI para estudios de diseño: nodos encadenados con el pipeline MOSS-Image para producir variaciones con semilla fija (`manual_seed(42)` en el ejemplo) y parámetros reproducibles.
- Fuente de descarga redundante en pipelines de CI: el repositorio funciona como espejo de respaldo para el Model Forge de Voxprint, de modo que un fallo o una retirada del repositorio original no rompa la automatización de descarga.
- Investigación y fine-tuning: al ser Apache-2.0 y estar en formato `diffusers`, sirve como punto de partida para ajustes sobre MOSS-Image-Base en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye tablas de FID, CLIP score, GenEval, DPGBench ni métricas de precisión de renderizado de texto, y el espejo tampoco añade mediciones propias.

## Requisitos de hardware

- VRAM estimada para los pesos: 5.082.308.624 parámetros equivalen a ≈10,2 GB en `bfloat16` y ≈20,3 GB en `float32`. El repositorio ocupa 27,2 GB en disco, lo que sugiere que contiene más de una precisión y/o los componentes auxiliares (VAE, codificadores de texto).
- Presupuesto real de inferencia: a los pesos del transformer hay que sumar el VAE en `float32` y el resto del pipeline; una estimación razonable para 1024 × 1024 en `bfloat16` se sitúa en la franja de 16-24 GB de VRAM, aunque no hay mediciones oficiales en la información disponible.
- GPU de datacenter: A100 de 40 u 80 GB y H100 son adecuadas y dejan margen para lotes mayores o mayor resolución.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriría cuantización u offload de componentes, algo no documentado por el autor.
- Despliegue: `diffusers` con `DiffusionPipeline.from_pretrained(..., custom_pipeline="pipeline_moss_image", trust_remote_code=True)`, y ComfyUI mediante el README específico del proyecto original. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato objetivo es la configuración del ejemplo (50 pasos, guidance scale 3.0, 1024 × 1024), sin tiempos publicados.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentación pública y no forman parte de la información proporcionada sobre este repositorio; se incluyen como referencia de categoría.

| Modelo | Parámetros | Licencia | Control de maquetación | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-SFT (este repositorio, espejo) | ≈5,08 B | Apache-2.0 | Prompts, secuencias de etiquetas y layouts JSON | HuggingFace, ModelScope, ComfyUI |
| MOSS-Image-Base | No disponible en la información proporcionada | Apache-2.0 | Mismo pipeline; menor calidad de agrupación de texto según la comparativa del autor | HuggingFace, ModelScope |
| FLUX.1-dev | ≈12 B | Licencia no comercial de FLUX.1 [dev] | Principalmente prompt en lenguaje natural | HuggingFace |
| Stable Diffusion 3.5 Large | ≈8 B | Stability AI Community License | Prompt en lenguaje natural | HuggingFace |
| Qwen-Image | ≈20 B | Apache-2.0 | Prompt en lenguaje natural; renderizado de texto destacado | HuggingFace, ModelScope |

Frente a estas alternativas, la ventaja declarada de MOSS-Image-SFT es el control estructurado de la composición mediante JSON y su licencia Apache-2.0, que permite uso comercial sin las restricciones de FLUX.1-dev o de la licencia comunitaria de Stability. Como contrapartida, su comunidad es mucho menor (0 descargas y 0 likes en este espejo) y carece de benchmarks públicos en la información disponible.

## Limitaciones y advertencias

- Este repositorio es un espejo no modificado: no aporta mejoras, correcciones ni validación adicional sobre el modelo original, y su autor declara no estar afiliado a OpenMOSS.
- Estado de validación mínimo: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción.
- Ausencia total de benchmarks publicados en la información disponible; el rendimiento cualitativo solo se apoya en las imágenes comparativas de la model card original.
- Idiomas no declarados formalmente: no hay listado de idiomas soportados, y el renderizado de texto en alfabetos distintos del chino o del inglés no está documentado.
- Riesgo de alucinación tipográfica: como todo modelo de difusión con renderizado de texto, puede producir caracteres deformados, duplicados o pseudo-texto, especialmente en resoluciones bajas o prompts muy densos.
- Sesgos no documentados: la información disponible no describe la composición del dataset de entrenamiento ni las evaluaciones de sesgo demográfico o cultural.
- `trust_remote_code=True` es obligatorio para cargar el pipeline personalizado, lo que implica ejecutar código del repositorio; conviene fijar el commit y auditar los ficheros antes de usarlo en producción.
- Requisito de almacenamiento elevado: 27,2 GB de repositorio, más caché de `diffusers` y pesos duplicados si se mantiene también el original.
- La licencia Apache-2.0 se hereda del original y se incluye sin cambios, pero la responsabilidad de verificar el cumplimiento en uso comercial recae en el integrador.
- Dependencias muy recientes (PyTorch ≥2.9, `transformers` ≥5.3, `diffusers` ≥0.38): pueden entrar en conflicto con entornos existentes y complican la reproducibilidad.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-moss-image-sft
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio de código: https://github.com/OpenMOSS/MOSS-Image
- Herramienta Voxprint: https://github.com/Mitroshenkov87/voxprint
- Índice de modelos del espejo: https://huggingface.co/Mitroshenkov87/voxprint-model-index
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Instrucciones para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
- Discord de la comunidad: https://discord.gg/nXFWEyvbb
