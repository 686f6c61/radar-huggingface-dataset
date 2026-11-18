# Alissonerdx/Minimax-H3-ComfyUI

## Resumen

MiniMax-H3-ComfyUI es una colección de LoRAs experimentales para los modelos de generación de vídeo e imagen MiniMax H3, empaquetadas y adaptadas para su uso directo en ComfyUI. El repositorio lo mantiene el usuario Alissonerdx y no constituye un modelo fundacional, sino un conjunto de adaptadores de bajo rango (LoRA) que modifican el comportamiento de los pesos base de MiniMaxAI/MiniMax-H3 y MiniMaxAI/MiniMax-H3-Image. Con 323.392 descargas y 636 likes en el momento de la consulta, es uno de los repositorios de referencia para trabajar con H3 dentro del ecosistema ComfyUI.

El paquete cubre tres familias funcionales: intercambio de personaje y cabeza (character swap, head swap, preprocessor map), transferencia de movimiento (motion transfer, variantes TARA y FFP, controladores SolarRenderer) y edición, mejora y animación (VFX edit, style transfer, LMS/sharpness, live wallpaper). Cada LoRA incluye un trigger textual específico (`body_swap:`, `motion_transfer:`, `vfx_edit:`, `style_transfer:`, `live_wallpaper:`, entre otros) y va acompañada de guías y workflows JSON para ComfyUI.

La relevancia actual del repo radica en que extiende un modelo de difusión de vídeo de gran tamaño con capacidades de edición controlada sin necesidad de reentrenar el modelo base, algo crítico para flujos de producción de VFX y contenido audiovisual. No obstante, el propio autor lo describe como modelos de investigación, no como herramientas terminadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo base MiniMax H3 (difusión vídeo/imagen) |
| Parametros totales | no disponible (depende del rango de cada LoRA; se documentan rangos r32, r64 y r128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixed-asset-licenses (other); enlace a LICENSES.md en el repo |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los artefactos son LoRAs, es decir, matrices de baja秩 descomposición que se inyectan en las capas del modelo base MiniMax H3. El repositorio documenta explícitamente los rangos empleados: r32 para head swap y live wallpaper, r64 para style transfer, LMS y character swap v1.0, y r128 para VFX edit. Las LoRAs están entrenadas y probadas principalmente contra los pesos `ref2va` del modelo base, publicados por Comfy-Org en su árbol de `diffusion_models`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; estos datos no aparecen en la model card. Sí se documenta una innovación operativa relevante: la integración con "Guide Latents" para transferencia de movimiento y con alineación TARA para escenas con múltiples sujetos, así como el uso de mapas de preprocesado (normal maps y DWPose) para el swap de hasta tres sujetos marcados por color. Las LoRAs de SolarRenderer incluyen una variante de destilación a 4 pasos, pensada para reducir el coste de muestreo.

## Capacidades

- Intercambio de personaje principal en vídeo mediante una imagen de referencia, con trigger `body_swap:`.
- Intercambio de cabeza aislado (experimental) con trigger `head_swap:`.
- Intercambio de hasta tres sujetos marcados por color usando mapas de normales o DWPose, con trigger `character_swap:`.
- Intercambio de hasta tres personas marcadas por color en imagen fija (H3 Image), con activación automática.
- Transferencia de movimiento desde un vídeo guía a imágenes de referencia, con trigger `motion_transfer:`.
- Variante TARA de transferencia de movimiento optimizada para múltiples sujetos.
- Edición guiada por prompt sobre vídeo fuente (VFX edit) con trigger `vfx_edit:`.
- Propagación de edición desde el primer fotograma al resto del clip (FFP).
- Transferencia de estilo desde imagen o texto, con trigger `style_transfer:`.
- Restauración de detalle y nitidez (LMS) a partir de una fuente alineada, con caption fija.
- Animación de 1 a 3 imágenes fijas como live wallpaper, con trigger `live_wallpaper:`.
- Control y destilación a 4 pasos vía LoRAs de SolarRenderer.
- Integración nativa con ComfyUI mediante workflows JSON y nodos nativos.

## Casos de uso

- Postproducción de VFX: sustituir el rostro o el cuerpo de un actor por el de un doble en planos de vídeo, usando character swap v1.1 con una imagen de referencia y el trigger `body_swap:`, reduciendo el coste frente a rotoscopia manual.
- Previsualización de reparto (casting previz): aplicar la cara de un actor candidato sobre el clip de una prueba de cámara para evaluar encaje visual antes de rodar.
- Animación de fotografías para señalización digital: convertir de 1 a 3 imágenes fijas en bucles animados con live wallpaper, útil para pantallas en tienda o presentaciones.
- Transferencia de actuación: trasladar el movimiento de un vídeo guía a un personaje ilustrado o a una foto mediante motion transfer, adecuado para animación de personajes en publicidad.
- Limpieza y mejora de metraje: restaurar detalle en material de archivo o de baja resolución usando LMS/sharpness con una fuente alineada, en pipelines de remasterización.
- Estilización de clips para redes: aplicar style transfer a vídeo corto para homogeneizar la estética de una campaña sin rehacer el rodaje.
- Edición iterativa de vídeo por prompt: modificar elementos concretos (vestuario, objetos, iluminación) con VFX edit y propagar el cambio con la variante FFP, útil en revisiones de cliente.
- Sustitución múltiple de figurantes: reemplazar hasta tres personas marcadas por color en una imagen fija con la LoRA de H3 Image, para composición de escenas publicitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repo ocupa 40,7 GB, pero ese tamaño corresponde al conjunto de LoRAs y workflows, no a los pesos base; el modelo fundacional MiniMax H3 debe descargarse aparte y es el que determina los requisitos reales de VRAM.
- VRAM estimada para inferencia: no disponible. Depende del tamaño y la resolución del modelo base H3, así como de la resolución y duración del vídeo generado.
- GPU recomendadas: no disponible en la información proporcionada. Para modelos de difusión de vídeo de esta escala se suele requerir hardware de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: ComfyUI (soporte nativo con workflows JSON incluidos), con pesos en safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible. La variante SolarRenderer 4-step está pensada para reducir pasos de muestreo, lo que sugiere una mejora de latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-ComfyUI (este repo) | LoRAs para edición de vídeo/imagen sobre H3 | no disponible (rangos r32–r128) | no disponible | mixed-asset-licenses | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-H3 | Modelo base de difusión vídeo | no disponible | no disponible | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image | Modelo base de difusión imagen | no disponible | no disponible | no disponible | Hugging Face |
| Comfy-Org/MiniMax-H3 (ref2va) | Pesos base empaquetados para ComfyUI | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los modelos base en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelos de investigación: el autor advierte explícitamente de que no son herramientas terminadas y que los resultados varían sustancialmente según el clip fuente, la resolución, el prompt y las imágenes de referencia.
- Licencia mixta (mixed-asset-licenses) con fichero LICENSES.md propio: es imprescindible revisarlo antes de cualquier uso comercial, ya que puede imponer restricciones sobre los assets generados o sobre los pesos base.
- Riesgo de artefactos y alucinación visual: al ser LoRAs de edición sobre difusión, pueden aparecer inconsistencias de identidad, parpadeos entre fotogramas o deformaciones, especialmente en las variantes marcadas como experimentales (head swap, FFP, preprocessor map).
- Dependencia del modelo base: el funcionamiento correcto está probado principalmente con los pesos `ref2va` de Comfy-Org; otros pesos o versiones pueden degradar los resultados.
- Triggers obligatorios: cada LoRA requiere su palabra de activación concreta (`body_swap:`, `motion_transfer:`, `vfx_edit:`, `style_transfer:`, `live_wallpaper:`); omitirla invalida el efecto esperado.
- Idiomas soportados no documentados: no se especifica el comportamiento multilingüe de los prompts.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de equidad, lo que es relevante si se emplean para sustitución de personas.
- Requisitos de hardware no publicados: planificar el despliegue exige estimar la VRAM a partir del modelo base, no de este repo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base MiniMax H3 Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Pesos ref2va para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/diffusion_models
- Licencias: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/LICENSES.md
- Repositorio Henge (herramientas SolarRenderer y FFP): https://github.com/alisson-anjos/Henge
