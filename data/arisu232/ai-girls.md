# arisu232/ai-girls

## Resumen

`arisu232/ai-girls` no es un modelo de lenguaje ni un modelo fundacional entrenado por el autor, sino un repositorio de redistribucion de pesos para ComfyUI. Concretamente, es una copia organizada por carpetas del arbol `models/` que utiliza el pod de ComfyUI del proyecto ai-girls-studio, con el objetivo de que cualquiera pueda reproducir el entorno sin descargar cada componente de su origen. El repositorio ocupa 41,3 GB y contiene exclusivamente archivos cuya licencia permite su realojamiento.

El contenido es heterogeneo: codificadores de texto (Qwen3-VL 8B en int8 y 4B en fp8, UMT5-XXL en fp8), un VAE de Wan 2.1, un CLIP Vision H, un modelo de difusion Wan 2.1 14B adaptado por SCAIL-2 en int8, una LoRA de aceleracion DPO en bf16, el checkpoint de Segment Anything ViT-B, tres detectores/segmentadores YOLOv8 de ADetailer y un upscaler 4xLSDIR. No hay pipeline declarado en Hugging Face ni idiomas listados, y el repositorio no registra descargas ni likes en el momento de la consulta.

La relevancia es practica, no cientifica: sirve como espejo reproducible de un stack de generacion de imagen y video con ComfyUI, con verificacion por sha256 contra los originales, y documenta explicitamente que componentes (MiniMax H3, Flux Klein, Krea2, SAM 3.1) quedan fuera por restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como modelo unico; el repo agrega componentes de difusion (Wan 2.1 + SCAIL-2), codificadores de texto tipo transformer (Qwen3-VL, UMT5-XXL), VAE, CLIP Vision y detectores YOLOv8/SAM |
| Parametros totales | no disponible (suma de componentes: Wan 2.1 14B, Qwen3-VL 8B y 4B, UMT5-XXL, SAM ViT-B, YOLOv8m/s) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot), fp8 scaled (e4m3fn), bf16, fp32/pth para checkpoints auxiliares |
| Idiomas soportados | no disponible |
| Licencia | varias: Apache-2.0, MIT y AGPL-3.0 segun el componente (ver tabla de la model card); la licencia del autor original prevalece sobre la del repositorio |
| Formato de pesos | safetensors (mayoria), .pth (SAM, 4xLSDIR), .pt (YOLOv8) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni documenta entrenamiento. Agrupa artefactos de terceros: un modelo de difusion Wan 2.1 de 14B parametros en variante SCAIL-2 cuantizada a int8, con una LoRA de aceleracion entrenada con DPO en bf16; dos codificadores de texto Qwen3-VL (8B int8 y 4B fp8) empaquetados por Comfy-Org; UMT5-XXL en fp8; un VAE de Wan 2.1; CLIP Vision H; SAM ViT-B; tres modelos YOLOv8 de ADetailer para deteccion de caras, manos y segmentacion de personas; y el upscaler 4xLSDIR.

La innovacion tecnica del repositorio es de empaquetado y trazabilidad: la estructura replica exactamente el arbol `models/<carpeta>/` de ComfyUI, cada archivo conserva el sha256 del original y el registro completo de descargas se mantiene externamente en `runpod/openjutsu/descargas.tsv` del repositorio de GitHub `cjsbeekAI/ai-girls`. No hay datos sobre tokens de entrenamiento, composicion del dataset ni procesos de RLHF/DPO mas alla de la mencion a la LoRA DPO de SCAIL-2.

## Capacidades

- Generacion de imagen y video mediante el pipeline de difusion Wan 2.1 14B (SCAIL-2) en ComfyUI.
- Codificacion de prompts de texto e imagen-texto con Qwen3-VL 8B/4B y UMT5-XXL.
- Aceleracion de muestreo mediante la LoRA DPO bf16 de SCAIL-2.
- Deteccion de caras y manos (face_yolov8m, hand_yolov8s) para postprocesado tipo ADetailer.
- Segmentacion de personas (person_yolov8m-seg) y segmentacion general con SAM ViT-B.
- Escalado de imagen 4x con 4xLSDIR.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso: es un conjunto de pesos para generacion visual.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio).

## Casos de uso

- Reproduccion de un entorno ComfyUI completo: descargar el repositorio y montarlo en `models/` permite levantar el mismo stack que usa ai-girls-studio sin resolver manualmente cada dependencia.
- Generacion de video corto con Wan 2.1 14B: el modelo de difusion int8 y la LoRA de aceleracion permiten iterar en un pod con GPU de 24-80 GB reduciendo pasos de muestreo.
- Postprocesado de caras y manos en flujos de retrato: los detectores YOLOv8 de ADetailer permiten aplicar inpainting localizado sobre rostros y manos sin intervencion manual.
- Segmentacion y recorte de sujetos: SAM ViT-B y person_yolov8m-seg habilitan mascaras precisas para composicion, cambio de fondo o matting.
- Reescalado de assets a 4x: 4xLSDIR se usa para ampliar resultados de baja resolucion antes de la entrega final.
- Integracion de codificadores Qwen3-VL en flujos imagen-a-texto o texto-a-imagen dentro de ComfyUI, con versiones 8B int8 y 4B fp8 para distintos presupuestos de VRAM.
- Auditoria de licencias en produccion: el repositorio sirve como referencia de que componentes son redistribuibles y cuales deben descargarse del origen aceptando condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el componente mas pesado es Wan 2.1 14B en int8, que en la practica requiere del orden de 16-24 GB solo para los pesos, mas overhead de activaciones y VAE.
- El codificador Qwen3-VL 8B int8 anade varios GB adicionales si se carga en paralelo; la variante 4B fp8 reduce ese coste.
- GPU recomendadas: no especificadas por el autor. Por tamano, A100 40/80 GB, H100 o RTX 4090 24 GB son los perfiles habituales para un stack de este tipo.
- En GPU de consumo: previsiblemente viable en RTX 4090 24 GB con cuantizacion int8/fp8 y descarga secuencial de componentes; no confirmado por el autor.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplican a este tipo de pesos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamano | Licencia | Enfoque |
|---|---|---|---|---|
| arisu232/ai-girls | Pack de pesos para ComfyUI (Wan 2.1, Qwen3-VL, SAM, YOLOv8, upscaler) | 41,3 GB | varias (Apache-2.0, MIT, AGPL-3.0) | Reproducibilidad de un pod concreto |
| Comfy-Org/Wan_2.1_ComfyUI_repackaged | Repack oficial de Wan 2.1 para ComfyUI | no disponible | Apache-2.0 | Distribucion upstream de los mismos componentes |
| Comfy-Org/SCAIL-2 | Modelo de difusion y LoRA DPO de SCAIL-2 | no disponible | MIT | Modelo base y aceleracion |
| Comfy-Org/Qwen3-VL | Codificadores Qwen3-VL empaquetados | no disponible | Apache-2.0 | Codificacion texto-imagen |

La diferencia frente a los upstream es que este repositorio agrega varios de ellos en una sola descarga con estructura ComfyUI y verificacion sha256, a cambio de duplicar almacenamiento y de no ofrecer model card tecnica propia.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: no hay garantias de calidad, sesgos medidos ni evaluaciones propias.
- La licencia es mixta y prevalece la del autor original de cada archivo; el uso comercial debe revisarse componente a componente.
- Los YOLOv8 de ADetailer se declaran Apache-2.0 en el repositorio de origen, pero Ultralytics YOLOv8 es AGPL-3.0: existe ambiguedad legal para uso comercial.
- Quedan fuera MiniMax H3, Flux Klein, Krea2 y SAM 3.1 por restricciones de licencia o por requerir aceptacion de condiciones en el origen, por lo que el stack no es completamente reproducible solo con este repositorio.
- Riesgo de alucinacion y sesgos: no evaluado; en generacion de imagen se traduce en artefactos, anatomia incorrecta y sesgos de representacion del dataset original.
- El repositorio no declara idiomas soportados ni contexto; la cobertura linguistica depende de los codificadores de texto subyacentes.
- No hay model card con instrucciones de uso, prompts recomendados ni hiperparametros.
- El tamano de 41,3 GB implica coste de almacenamiento y de ancho de banda relevante para descargas repetidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arisu232/ai-girls
- Comfy-Org/Qwen3-VL: https://huggingface.co/Comfy-Org/Qwen3-VL
- Comfy-Org/Wan_2.1_ComfyUI_repackaged: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Comfy-Org/SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2
- ybelkada/segment-anything: https://huggingface.co/ybelkada/segment-anything
- Bingsu/adetailer: https://huggingface.co/Bingsu/adetailer
- DremyBulzXe/4xLSDIR: https://huggingface.co/DremyBulzXe/4xLSDIR
- Repositorio GitHub del proyecto (registro de descargas): https://github.com/cjsbeekAI/ai-girls
- Referencia externa no relacionada con el modelo (resultado de busqueda): https://pixai.art/en/model/1614077111027790758
