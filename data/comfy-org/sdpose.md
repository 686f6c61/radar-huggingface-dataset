# Comfy-Org/SDPose

## Resumen

SDPose es un modelo de estimación de pose de cuerpo completo (whole-body pose estimation) desarrollado originalmente por el equipo de teemosliang y reempaquetado por Comfy-Org para su uso directo en ComfyUI. No es un modelo de lenguaje: es un componente de visión por computador que detecta puntos clave del cuerpo humano (cuerpo, manos y rostro) sobre imágenes y vídeos, incluyendo escenarios fuera de distribución (OOD) donde los estimadores de pose convencionales fallan con frecuencia.

El repositorio que nos ocupa es un "diffusion-single-file" que agrupa los pesos en formato safetensors listos para cargarse en los nodos de ComfyUI, junto con un detector de personas basado en RT-DETRv4 (variante x con backbone HGNet) que actúa como etapa previa para el recorte y seguimiento de múltiples individuos. El paquete incluye tres ficheros: el modelo principal `sdpose_wholebody_fp16.safetensors` y dos variantes del detector (`fp16` y `fp32`), sumando un total de 2,3 GB en el repositorio.

Su relevancia actual radica en que resuelve un cuello de botella práctico en pipelines generativos: obtener mapas de pose precisos y multi-persona a partir de imágenes o vídeos arbitrarios para condicionar modelos de difusión (ControlNet, animación, transferencia de movimiento). La licencia MIT y su integración nativa en ComfyUI lo hacen especialmente atractivo para prototipado rápido y producción sin fricción legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de estimación de pose; el detector asociado es RT-DETRv4 con backbone HGNet) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 y FP32 (ficheros safetensors preconvertidos) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`diffusion-single-file`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del estimador de pose principal. El paquete incluye, como componente auxiliar, un detector de objetos RT-DETRv4 en su variante `x` con backbone HGNet, que se emplea para localizar personas antes de aplicar la estimación de pose. RT-DETRv4 es un detector transformer de la familia RT-DETR, sucesora de RT-DETR y RT-DETRv2, orientada a detección en tiempo real.

No se han publicado en la información disponible datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones técnicas específicas del estimador. El modelo base declarado es `teemosliang/SDPose-Wholebody`, y el repositorio de este último es la fuente canónica para detalles arquitectónicos.

## Capacidades

- Estimación de pose de cuerpo completo (whole-body): puntos clave de cuerpo, manos y rostro.
- Estimación de pose en imágenes individuales.
- Estimación de pose en vídeo, con seguimiento temporal de los puntos clave.
- Detección y estimación multi-persona, apoyada en el detector RT-DETRv4 incluido.
- Generación de mapas de pose (pose maps) utilizables como condicionamiento en pipelines de difusión.
- Manejo de escenarios fuera de distribución (OOD), según la nomenclatura de los workflows oficiales.
- Integración nativa con ComfyUI mediante nodos y plantillas de workflow predefinidas.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- **Condicionamiento de modelos de difusión para animación**: extraer mapas de pose de un vídeo de referencia y usarlos como entrada de ControlNet para transferir movimiento a un personaje generado, gracias a la salida directa en formato compatible con ComfyUI.
- **Transferencia de movimiento (motion transfer)**: capturar la pose de un actor real y aplicarla a un avatar o personaje estilizado en un pipeline de vídeo a vídeo, aprovechando el soporte de vídeo del modelo.
- **Análisis deportivo y biomecánico**: procesar grabaciones de entrenamiento para extraer la cinemática de articulaciones y manos, con la ventaja de que el modelo cubre cuerpo completo incluyendo manos, algo que muchos estimadores ligeros no ofrecen.
- **Animación de personajes en producción audiovisual**: generar mapas de pose multi-persona de forma automatizada dentro de ComfyUI, reduciendo el trabajo manual de rotoscopia en escenas con varios actores.
- **Previsualización de animación (blocking)**: usar el modelo para convertir referencias de vídeo en pose maps que alimenten un pipeline de generación, agilizando la iteración creativa antes del render final.
- **Investigación en visión por computador**: evaluar el comportamiento del estimador en condiciones OOD (poses atípicas, oclusiones, encuadres no convencionales) gracias a los workflows específicos `SDPose-OOD` incluidos.
- **Automatización de contenido para redes sociales**: pipelines que convierten vídeos de baile o coreografías en animaciones de personajes generados, usando la detección multi-persona para escenas grupales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 2,3 GB, lo que sugiere que el conjunto de pesos cabe holgadamente en GPUs de consumo, pero no se especifica el pico de VRAM en inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del paquete (2,3 GB) y el uso de FP16, es plausible que funcione en GPUs consumer modernas (RTX 3060 en adelante), pero esto no está confirmado por el autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de los ficheros, aunque no hay confirmación oficial.
- Opciones de despliegue: ComfyUI (soporte nativo mediante nodos y plantillas oficiales). No se documentan otras opciones como vLLM, llama.cpp u Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Licencia | Integración ComfyUI | Disponibilidad |
|---|---|---|---|---|---|
| SDPose (este repo) | Estimador de pose whole-body + detector RT-DETRv4 | Cuerpo, manos, rostro; imagen y vídeo; multi-persona | MIT | Nativa (nodos y workflows oficiales) | Hugging Face, 214.113 descargas |
| DWPose | Estimador de pose whole-body | Cuerpo, manos, rostro | No disponible en la información | Ampliamente usado en ecosistema difusión | No disponible en la información |
| OpenPose | Estimador de pose multi-persona | Cuerpo, manos, rostro | No disponible en la información | Mediante nodos de terceros | No disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de categoría.
- No se documentan sesgos específicos, pero como todo estimador de pose entrenado con datos humanos, puede presentar peor rendimiento en determinados fenotipos, complexiones, edades o vestimentas poco representadas en su dataset de entrenamiento.
- Riesgo de fallo en poses extremas, oclusiones severas o encuadres atípicos; los workflows OOD existen precisamente porque estos casos son problemáticos.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original (`teemosliang/SDPose-Wholebody`) y del detector RT-DETRv4, que podrían tener condiciones distintas.
- El repositorio es un reempaquetado para ComfyUI; para depuración, ajuste fino o comprensión arquitectónica conviene acudir al repositorio original.
- No se especifican requisitos de VRAM ni latencias, por lo que el dimensionamiento de producción debe hacerse empíricamente.
- El modelo depende del detector RT-DETRv4 para el flujo multi-persona; un fallo en la detección previa degrada la estimación de pose.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/SDPose
- Modelo base original: https://huggingface.co/teemosliang/SDPose-Wholebody
- Repositorio RT-DETRv4: https://github.com/RT-DETRs/RT-DETRv4
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow Pose Map SDPose-OOD (imagen): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_image_to_pose.json
- Workflow Pose Map SDPose-OOD (vídeo): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_ood_video_to_pose_map.json
- Workflow Pose Detection SDPose Multi-Person (vídeo): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person_video.json
- Workflow Pose Detection SDPose Multi-Person (imagen): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sdpose_multi_person.json
