# DenRakEiw/scumble-intrinsic-onnx

## Resumen

`DenRakEiw/scumble-intrinsic-onnx` es una exportación a ONNX del modelo `prs-eth/marigold-iid-lighting-v1-1`, desarrollado originalmente por el grupo de Fotogrametría y Teledetección (PRS) de la ETH Zürich. El modelo realiza descomposición intrínseca de imágenes: separa una fotografía en su albedo, su sombreado difuso (shading) y un residuo no difuso (reflejos, luces especulares y otros efectos no lambertianos). Esta exportación concreta la mantiene el autor independiente DenRakEiw para integrarla en Scumble, un editor de imágenes libre y de código abierto que ejecuta el modelo localmente en la máquina del usuario.

La relevancia de esta ficha no está en un modelo nuevo, sino en un artefacto de despliegue: convierte un pipeline de difusión basado en `diffusers` en tres grafos ONNX independientes (encoder VAE, UNet y decoder VAE) más un fichero de configuración del scheduler DDIM. El resultado es un paquete de 1,9 GB que puede ejecutarse con ONNX Runtime, incluido el backend DirectML en Windows, sin depender de PyTorch ni de la librería `diffusers`.

El modelo base es un derivado de Marigold, una adaptación de generadores de imágenes por difusión (Stable Diffusion) para tareas de análisis de imagen. La licencia es Open RAIL++-M, con las restricciones de uso de la Attachment A, y el código de Marigold es Apache-2.0. No hay información sobre idiomas soportados ni sobre benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + VAE) derivada de Stable Diffusion, exportada a ONNX en tres grafos |
| Parametros totales | no disponible (el UNet en fp16 ocupa 1.732.865.286 bytes; el recuento exacto de parámetros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; tamaño de procesamiento 768 en el lado largo, H y W múltiplos de 64) |
| Tipos de cuantizacion | fp16 interno en los pesos ONNX, entrada y salida en float32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, sin interfaz de texto libre; el prompt vacío se precalcula) |
| Licencia | Open RAIL++-M (PRS, ETH Zürich); código de Marigold Apache-2.0 |
| Formato de pesos | ONNX (`vae_encoder.onnx`, `unet.onnx`, `vae_decoder.onnx`) más `scheduler.json` |

## Arquitectura y entrenamiento

El modelo base es Marigold IID Lighting v1.1, una adaptación de un generador de imágenes por difusión (arquitectura Stable Diffusion, con VAE y UNet) reentrenada para descomposición intrínseca. En lugar de generar una imagen, el UNet predice con v-prediction los latentes correspondientes a tres objetivos simultáneos: albedo, sombreado difuso y residuo no difuso. La inferencia usa un único paso DDIM con `timestep` 999, según la configuración incluida en `scheduler.json`, y decodifica los tres objetivos como un lote de tres.

La exportación a ONNX mantiene los pesos sin cambios, pero reorganiza el pipeline: el embedding de texto del prompt vacío se calcula una vez y se incrusta en el grafo del UNet, de modo que la entrada del UNet es `sample` float32 `[1, 16, h, w]` (latente de imagen de 4 canales más 12 canales de ruido para los tres objetivos) y `timestep` int64 `[1]`, y la salida es `v` float32 `[1, 12, h, w]`. El encoder VAE recibe la imagen en `[-1, 1]` y devuelve el latente multiplicado por 0.18215; el decoder devuelve la imagen en `[0, 1]` con escala lineal. El script de conversión es `tools/deeppaint/export_onnx.py` del repositorio de Scumble.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; al tratarse de un modelo de análisis de imagen, estos conceptos no aplican del mismo modo que en un LLM.

## Capacidades

- Descomposición intrínseca de imágenes en albedo, sombreado difuso y residuo no difuso en una sola pasada.
- Procesamiento de imágenes con H y W múltiplos de 64, con tamaño de procesamiento de 768 en el lado largo (relleno por repetición de la última fila y columna, recorte posterior).
- Inferencia en un único paso DDIM (timestep 999), lo que reduce el coste frente a pipelines de difusión multi-paso.
- Ejecución local mediante ONNX Runtime, incluido el backend DirectML en Windows.
- No soporta tool calling, function calling ni agentes: es un modelo de imagen, no un modelo de lenguaje.
- No se documentan capacidades multilingües, de audio ni de vídeo.

## Casos de uso

- Edición de imágenes en local dentro de Scumble: el editor descarga los tres grafos ONNX y ejecuta la descomposición en la máquina del usuario para separar albedo, sombreado y residuo, sin enviar la imagen a un servidor.
- Reiluminación y retoque fotográfico: al disponer de albedo y shading por separado, se puede modificar la iluminación o el color base de forma independiente y recomponer la imagen.
- Eliminación de reflejos y luces especulares: el canal de residuo no difuso aísla los efectos no lambertianos, que pueden atenuarse o eliminarse antes de recomponer.
- Preprocesado para pipelines de visión por computador: la separación albedo/shading mejora tareas posteriores como segmentación, detección o estimación de materiales, al eliminar la variabilidad de la iluminación.
- Aplicaciones de escritorio sin GPU dedicada: al usar ONNX Runtime con DirectML o CPU, puede integrarse en herramientas de escritorio que no quieren depender de PyTorch ni de CUDA.
- Prototipado e investigación reproducible: los grafos ONNX con hashes sha256 documentados permiten verificar la integridad de los artefactos y reproducir la inferencia fuera del ecosistema `diffusers`.
- Integración en aplicaciones web o móviles con ONNX Runtime: el formato ONNX facilita el despliegue en entornos donde PyTorch no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la fidelidad numérica de la exportación frente al pipeline de `diffusers`: con el mismo ruido, las salidas difieren como máximo en 0.0044 (por el ruido fp16) y, en ONNX Runtime con DirectML, como máximo en 0.041.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,9 GB y el UNet en fp16 pesa 1,73 GB, por lo que se necesita al menos esa cantidad más los buffers de activación del VAE y del UNet.
- GPU recomendadas: no se especifican en la información disponible; al ejecutarse con ONNX Runtime, es compatible con GPUs con soporte de DirectML (Windows) o de los execution providers de ONNX Runtime.
- Cabe en GPU de consumo: probablemente sí en GPUs con al menos 4-6 GB de VRAM, aunque no se documenta un requisito mínimo oficial.
- Opciones de despliegue: ONNX Runtime (incluido DirectML), integración en Scumble mediante `tools/deeppaint/export_onnx.py`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: no disponibles; solo se documenta que la inferencia usa un único paso DDIM.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / tamaño de entrada | Notas |
|---|---|---|---|---|---|
| `DenRakEiw/scumble-intrinsic-onnx` | Descomposición intrínseca (ONNX) | ONNX (3 grafos) | Open RAIL++-M | 768 lado largo, múltiplos de 64 | Exportación para Scumble, un paso DDIM |
| `prs-eth/marigold-iid-lighting-v1-1` | Descomposición intrínseca (diffusers) | safetensors / diffusers | Open RAIL++-M | 768 lado largo | Modelo base original de ETH Zürich |
| `prs-eth/marigold-depth-v1-1` | Estimación de profundidad monocular | safetensors / diffusers | Apache-2.0 (código) / Open RAIL++-M (pesos) | 768 lado largo | Misma familia Marigold, tarea distinta |
| `Intel/dpt-hybrid-midas` | Estimación de profundidad monocular | PyTorch | MIT | variable | Alternativa no generativa, sin descomposición intrínseca |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una exportación modificada del modelo original: los pesos son idénticos, pero la estructura del pipeline cambia (prompt vacío incrustado, tres grafos separados), por lo que no es un reemplazo directo del pipeline de `diffusers`.
- Licencia Open RAIL++-M con restricciones de uso de la Attachment A (párrafo 5): deben revisarse antes de cualquier uso comercial o de despliegue público.
- No se documentan sesgos específicos, pero al derivar de Stable Diffusion puede heredar sesgos de los datos de entrenamiento originales en cuanto a materiales, tonos de piel o condiciones de iluminación.
- Riesgo de alucinación en el sentido de generar albedo o shading plausibles pero incorrectos en escenas con iluminación compleja, materiales no lambertianos o imágenes fuera de distribución.
- Requiere dimensiones múltiplos de 64 y un tamaño de procesamiento de 768 en el lado largo; imágenes de otras proporciones deben rellenarse y recortarse.
- No hay información sobre idiomas ni sobre interfaz de texto: el prompt está fijado como vacío.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-13, por lo que su adopción y mantenimiento no están contrastados.
- La fidelidad numérica frente al pipeline original es buena (máximo 0.0044 con el mismo ruido), pero en DirectML la diferencia sube a 0.041, lo que puede ser perceptible en aplicaciones sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/DenRakEiw/scumble-intrinsic-onnx
- Modelo base: https://huggingface.co/prs-eth/marigold-iid-lighting-v1-1
- Repositorio de Scumble: https://github.com/DenRakEiw/scumble
- Repositorio de Marigold: https://github.com/prs-eth/Marigold
- Paper de Marigold (arXiv:2505.09358): https://arxiv.org/abs/2505.09358
