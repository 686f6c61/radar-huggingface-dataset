# Comfy-Org/mediapipe

## Resumen

MediaPipe (repo `Comfy-Org/mediapipe`) es un paquete de pesos empaquetados para ComfyUI a partir del modelo original de detección facial de Google AI Edge MediaPipe. No es un modelo de lenguaje ni un modelo generativo: es un detector de caras (face detection) convertido al formato `safetensors` y distribuido como archivo único para su uso dentro del nodo de detección de ComfyUI. El repositorio lo mantiene la organización Comfy-Org, responsable del desarrollo de ComfyUI.

El interés práctico del paquete es la integración: ComfyUI espera los pesos en `ComfyUI/models/detection/mediapipe_face_fp32.safetensors`, y este repo proporciona exactamente ese archivo junto con una plantilla de workflow oficial (`utility_face_detection_mediapipe.json`). Con ello se evita tener que convertir manualmente los modelos `.tflite` originales de MediaPipe.

La relevancia es acotada y operativa: sirve como componente auxiliar en pipelines de difusión (por ejemplo, para detectar y recortar rostros antes de un refinado, aplicar inpainting facial o preprocesar imágenes para modelos de identidad). No hay información publicada sobre arquitectura interna, número de parámetros ni contexto, ya que la model card se limita a indicar el reempaquetado y la ubicación de los archivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detector facial de Google AI Edge MediaPipe; arquitectura interna no documentada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | fp32 (nombre de archivo `mediapipe_face_fp32.safetensors`); no se documentan otras variantes |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo único, tag `diffusion-single-file`) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna del detector (tipo de red, capas, resolución de entrada o estrategia de anclas). El repositorio es explícitamente un reempaquetado: los archivos originales provienen de `google-ai-edge/mediapipe` y se han convertido a `safetensors` para que ComfyUI pueda cargarlos directamente desde `models/detection/`. El nombre del archivo indica precisión fp32.

Tampoco se documentan los datos de entrenamiento, el número de tokens o imágenes, ni procesos de ajuste (RLHF, DPO u otros), algo esperable en un componente de detección y no en un modelo generativo. La única innovación relevante del paquete es de formato e integración: un único archivo compatible con el cargador de ComfyUI y una plantilla de workflow lista para usar, lo que elimina pasos de conversión manual desde `.tflite`.

## Capacidades

- Detección de rostros en imágenes, como paso de preprocesado dentro de un grafo de ComfyUI.
- Integración nativa con el nodo de detección de ComfyUI mediante la ruta `models/detection/`.
- Uso en workflows de utilidad: la plantilla oficial `utility_face_detection_mediapipe.json` demuestra el flujo de detección.
- Encadenamiento con otros nodos de difusión (recorte, inpainting, refinado facial) dentro del mismo pipeline.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión generativa, audio ni modo de razonamiento (thinking).
- Al ser un detector, su salida son regiones/coordenadas de caras, no texto ni imágenes generadas.

## Casos de uso

- Preprocesado facial en pipelines de img2img: detectar la cara antes de aplicar un refinado de detalle, de modo que el modelo de difusión reciba un recorte centrado y con la resolución adecuada.
- Inpainting facial selectivo: usar las cajas detectadas para construir máscaras automáticas y repintar solo la región del rostro, reduciendo artefactos en el resto de la imagen.
- Automatización de recortes en lotes: procesar carpetas de imágenes en ComfyUI y generar crops normalizados para datasets de entrenamiento de modelos de identidad (LoRA, IP-Adapter).
- Control de calidad en generación: verificar que una imagen sintética contiene al menos un rostro detectable antes de enviarla a una etapa posterior del pipeline.
- Preanotación para etiquetado: generar cajas iniciales de caras que un anotador humano revisa, acelerando la creación de datasets de detección.
- Filtrado previo en aplicaciones de edición: descartar o enrutar imágenes sin caras antes de invocar modelos de restauración facial, ahorrando cómputo en las que no lo necesitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un detector facial de un solo archivo en fp32, la huella esperada es muy inferior a la de un modelo de difusión, pero no se documenta cifra alguna.
- GPU recomendadas: no disponibles; cualquier GPU compatible con ComfyUI debería poder ejecutar el nodo de detección.
- GPU de consumo: previsiblemente cabe en GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no hay datos publicados que lo confirmen.
- Despliegue: ComfyUI (flujo previsto por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Integración ComfyUI | Datos públicos |
|---|---|---|---|---|---|
| Comfy-Org/mediapipe (este repo) | Detector facial empaquetado | safetensors (fp32) | Apache 2.0 | Nativa, con plantilla oficial | Descargas y likes en HF; sin benchmarks |
| MediaPipe original (google-ai-edge) | Detector facial | `.tflite` y otros | Apache 2.0 | Requiere conversión manual | Documentación y modelos en GitHub |
| Otros detectores faciales para ComfyUI | Detección facial | variable | variable | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni razonamiento; cualquier evaluación tipo MMLU o HumanEval no aplica.
- La model card no documenta sesgos del detector; como todo detector facial, puede tener rendimiento desigual según iluminación, pose, oclusión y demografía, pero no hay datos publicados que lo cuantifiquen.
- Riesgo de falsos negativos y positivos en caras pequeñas, giradas o parcialmente ocultas; no hay métricas publicadas de precisión o recall.
- Solo se documenta la variante fp32; no se indican versiones cuantizadas ni requisitos mínimos de memoria.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del proyecto original de MediaPipe y de los modelos de los que deriva.
- El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que puede indicar que los pesos se sirven mediante LFS o que el contenido es mínimo; conviene comprobar la integridad del archivo antes de usarlo en producción.
- Depende de la versión de ComfyUI y de la ruta exacta `models/detection/`; un cambio de estructura de directorios rompe la carga.
- No hay información sobre idiomas ni sobre el pipeline de Hugging Face, por lo que no puede usarse con `transformers` de forma estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/mediapipe
- Repositorio original de MediaPipe: https://github.com/google-ai-edge/mediapipe
- ComfyUI (organización): https://github.com/Comfy-Org/ComfyUI
- Plantilla de workflow de detección facial: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_face_detection_mediapipe.json
- Repositorio de plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
