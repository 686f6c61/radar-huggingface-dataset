# JoeyJinArt/image2pose-models

## Resumen

SAM 3D Body (DINOv3) es un modelo de recuperación de malla humana tridimensional a partir de imágenes, desarrollado originalmente por Meta Platforms y distribuido en este repositorio por JoeyJinArt como copia sin modificaciones para su uso en la aplicación de escritorio image2pose. El modelo resuelve la tarea de estimación de pose y reconstrucción de cuerpo completo en 3D, produciendo mallas humanas (human mesh recovery) a partir de entradas visuales, apoyándose en un backbone DINOv3.

Este repositorio concreto no es un desarrollo propio de JoeyJinArt: contiene los ficheros oficiales de `facebook/sam-3d-body-dinov3` (pesos `model.ckpt`, modelo corporal `mhr_model.pt`, configuración y licencia) verificados mediante SHA-256 idénticos a los de Meta. Se publica únicamente para que la aplicación image2pose descargue los pesos automáticamente en su primer arranque.

Su relevancia es práctica: facilita la distribución reproducible de los materiales SAM 3D Body bajo la SAM License, con verificación de integridad criptográfica y sin alteraciones. No se dispone de información sobre arquitectura interna detallada, número de parámetros o longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone DINOv3 segun el nombre del modelo original; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no de texto) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | checkpoint PyTorch (`model.ckpt`, `assets/mhr_model.pt`) y YAML de configuración |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre del repositorio original (`sam-3d-body-dinov3`) indica el uso de un backbone DINOv3, y las etiquetas del repositorio apuntan a las tareas de `sam-3d-body`, `human-mesh-recovery` y `pose-estimation`. El modelo produce mallas humanas 3D y utiliza un modelo corporal MHR (Momentum Human Rig) distribuido como `assets/mhr_model.pt`, procedente del proyecto MHR de Meta bajo licencia Apache 2.0.

No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset, ni sobre etapas de ajuste fino (RLHF, DPO u otras). Tampoco se documentan innovaciones técnicas específicas más allá de la integración con DINOv3 y el uso del rig corporal MHR.

## Capacidades

- Reconstrucción de malla humana 3D (human mesh recovery) a partir de imágenes.
- Estimación de pose corporal (pose-estimation) en tres dimensiones.
- Integración como componente de la aplicación de escritorio image2pose.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingües.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la entrada visual propia de la tarea.

## Casos de uso

- Reconstrucción 3D de personas para animación: la aplicación image2pose usa el modelo para convertir imágenes en mallas humanas que pueden retargetizarse a esqueletos de animación.
- Captura de movimiento sin trajes: a partir de fotografías o vídeo, generar poses 3D utilizables en pipelines de VFX y previsualización.
- Creación de avatares: extracción de malla y pose para generar avatares personalizados en herramientas de escritorio.
- Análisis biomecánico aproximado: estimación de pose 3D para estudios preliminares de postura, con las cautelas propias de un modelo no validado clínicamente.
- Docencia y prototipado en visión por computador: uso del modelo como referencia para experimentos de human mesh recovery con backbone DINOv3.
- Integración en aplicaciones de escritorio: distribución automática de pesos verificados por SHA-256 para garantizar reproducibilidad en instalaciones de image2pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2,8 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la información solo menciona el uso mediante la aplicación de escritorio image2pose con PyTorch; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3D Body (DINOv3) | no disponible | no disponible | Human mesh recovery / pose 3D | SAM License | Hugging Face (copia redistribuida) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es una copia no oficial mantenida por JoeyJinArt; no está afiliada ni respaldada por Meta.
- El uso está sujeto a la SAM License, que Meta puede actualizar; es responsabilidad del usuario revisar la versión vigente.
- Restricciones de control de exportación: el uso debe cumplir las Trade Controls de EE. UU., ONU, UE y Reino Unido; se prohíbe el uso para fines militares, nucleares, espionaje o desarrollo de armas.
- Los ficheros se distribuyen "tal cual", sin garantía de ningún tipo (secciones 3 y 4 de la SAM License).
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por tratarse de un modelo de visión; no hay datos al respecto.
- No se dispone de información sobre robustez ante oclusiones, diversidad corporal o condiciones de iluminación.
- Para uso comercial es imprescindible verificar los términos completos de la SAM License en el fichero `LICENSE` incluido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoeyJinArt/image2pose-models
- Modelo original de Meta: https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio y paper de SAM 3D Body: https://github.com/facebookresearch/sam-3d-body
- Proyecto MHR (Momentum Human Rig): https://github.com/facebookresearch/MHR
