# Comfy-Org/ltx-2

## Resumen

LTX-2 es un modelo generativo de vídeo desarrollado por Lightricks, distribuido en este repositorio por Comfy-Org como un paquete de ficheros "single-file" listos para su uso en ComfyUI. No se trata de un modelo de lenguaje, sino de un sistema de difusión para vídeo que combina un modelo de difusión de vídeo (denominado LTX-2 19B en los artefactos LoRA) con un codificador de texto basado en Gemma 3 12B IT, lo que permite condicionamiento textual de alta calidad. El repositorio incluye los pesos del text encoder en varias cuantizaciones (bf16, fp8 escalada, fp4 mixta y fp mixta) y LoRAs auxiliares.

El modelo resuelve el problema de la generación de vídeo condicionada por texto, imagen, profundidad y bordes (canny), cubriendo los flujos text-to-video, image-to-video y video-to-video con control estructural. Su relevancia actual radica en que ComfyUI se ha consolidado como el entorno de referencia para pipelines de difusión modulares, y este repositorio ofrece los artefactos empaquetados y los workflows oficiales para ejecutar LTX-2 sin necesidad de convertir formatos manualmente.

El tamaño del repositorio es de 63,1 GB, coherente con un modelo de difusión de gran escala más un text encoder de 12B de parámetros en varias precisiones. La licencia es la LTX-2 Community License Agreement, distinta de las licencias open source permisivas habituales, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para video (LTX-2) con text encoder Gemma 3 12B IT |
| Parametros totales | 19B en el componente de difusion (segun denominacion de los LoRA); text encoder de 12B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8 escalada, fp4 mixta, fp mixta (para el text encoder); LoRA en bf16 con rank 64 |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del componente de difusion de LTX-2: no se especifica si emplea un transformer de difusion (DiT), un UNet o una variante hibrida, ni el numero exacto de parametros del modulo generativo mas alla de la referencia "19b" que aparece en el nombre del LoRA `LTX-2-19b-Squish-LoRA`. El sistema se organiza en dos piezas: un modelo de difusion que genera los fotogramas de video y un text encoder basado en `google/gemma-3-12b-it`, que aporta la comprension del prompt textual. El repositorio incluye tambien variantes del text encoder derivadas de `mlabonne/gemma-3-12b-it-abliterated` mediante LoRA de rango 64, orientadas a modificar el comportamiento del encoder.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El paquete incluye workflows oficiales que cubren text-to-video, image-to-video, image-to-video destilado, depth-to-video y canny-to-video, lo que sugiere que el modelo fue entrenado o adaptado para aceptar multiples modalidades de condicionamiento espacial y temporal.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de una imagen inicial (image-to-video), incluyendo una variante destilada para inferencia acelerada.
- Control estructural mediante mapas de profundidad (depth-to-video).
- Control estructural mediante bordes detectados con Canny (canny-to-video).
- Aplicacion de LoRAs de estilo o transformacion, como `ltx2-squish` con la palabra de activacion `squish it`.
- Condicionamiento textual de alta capacidad gracias al text encoder Gemma 3 12B IT.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo "thinking", vision o audio no documentadas.

## Casos de uso

- Produccion de clips publicitarios: generar videos cortos a partir de un prompt textual con el workflow text-to-video, usando el text encoder Gemma 3 12B para prompts descriptivos detallados y la variante fp8 para reducir requisitos de VRAM.
- Animacion de ilustraciones y fotografias: emplear image-to-video para dar movimiento a una imagen fija, util en motion graphics y presentaciones de producto.
- Previsualizacion de storyboards: convertir bocetos o imagenes de referencia en video animado para validar secuencias antes de la produccion final.
- Control de profundidad en VFX: usar depth-to-video para generar video coherente con un mapa de profundidad existente, integrable en pipelines de composicion.
- Rotoscopia y transferencia de bordes: aplicar canny-to-video para mantener la silueta de un objeto o personaje entre fotogramas, util en postproduccion.
- Experimentacion estilistica con LoRA: aplicar `ltx2-squish` con la palabra de activacion `squish it` para generar deformaciones estilizadas controladas en image-to-video.
- Prototipado rapido en ComfyUI: cargar los workflows oficiales (`video_ltx2_t2v.json`, `video_ltx2_i2v.json`, etc.) para iterar sobre ideas sin escribir codigo de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio de 63,1 GB incluye todas las variantes del text encoder, por lo que la VRAM real dependera de la cuantizacion elegida (bf16, fp8, fp4 o fp mixta).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la existencia de cuantizaciones fp8 y fp4 sugiere que el modelo esta pensado para reducir huella de memoria, pero no se especifica en que GPU concretas cabe.
- Opciones de despliegue: ComfyUI (entorno principal, con workflows oficiales); otros motores como vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generacion de video que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia es la LTX-2 Community License Agreement, no una licencia open source permisiva; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- No se documentan los idiomas soportados por el text encoder ni por el modelo en su conjunto.
- No se especifican sesgos conocidos ni tasas de alucinacion; en modelos generativos de video, el riesgo de artefactos visuales e incoherencias temporales es inherente y no esta cuantificado aqui.
- No se detalla la longitud de contexto ni la resolucion o duracion maxima de video soportada.
- El repositorio incluye LoRAs basadas en una variante "abliterated" del text encoder, lo que puede alterar el comportamiento de filtrado del modelo original; conviene evaluar su idoneidad en entornos de produccion.
- El tamano del repositorio (63,1 GB) exige planificacion de almacenamiento y descarga; no todas las variantes son necesarias para un despliegue concreto.
- No hay informacion sobre latencia, throughput ni precision numerica en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/ltx-2
- Modelo original: https://huggingface.co/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- LoRA Squish: https://huggingface.co/ovi054/LTX-2-19b-Squish-LoRA/
- Fichero LoRA squish: https://huggingface.co/Comfy-Org/ltx-2/blob/main/split_files/loras/ltx2-squish.safetensors
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflows oficiales: https://github.com/Comfy-Org/workflow_templates
- Workflow text-to-video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_t2v.json
- Workflow image-to-video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v.json
- Workflow image-to-video destilado: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v_distilled.json
- Workflow depth-to-video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_depth_to_video.json
- Workflow canny-to-video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_canny_to_video.json
- Workflow image-to-video con LoRA: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v_lora.json
