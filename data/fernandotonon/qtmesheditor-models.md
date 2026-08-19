# fernandotonon/QtMeshEditor-models

## Resumen

QtMeshEditor-models es un repositorio de Hugging Face que agrupa los modelos de inteligencia artificial que la herramienta de autoría 3D QtMeshEditor descarga en tiempo de ejecución para sus funciones asistidas por IA. No se trata de un modelo único, sino de un conjunto heterogéneo de más de una docena de artefactos en formato ONNX y GGUF, cada uno especializado en una tarea concreta del pipeline de creación de assets 3D: síntesis de mapas PBR, superresolución de texturas, auto-rigging, predicción de skin weights, generación de mallas 3D a partir de imágenes, interpolación de animaciones, texto a movimiento, segmentación de mallas, eliminación de fondos y captioning de imágenes. El autor es fernandotonon, desarrollador de QtMeshEditor, una herramienta gratuita para creadores de juegos indie.

El repositorio tiene 17,0 GB y suma 409.252.800 parámetros en total (suma de todos los pesos de los modelos incluidos). La mayoría son re-exportaciones ONNX de modelos de terceros con licencias permisivas (SPAN, Real-ESRGAN, UniRig, SkinTokens/TokenRig, TripoSR, TripoSG, U²-Net y SmolVLM), mientras que cuatro modelos (RMIB, t2m, meshseg y la librería de movimiento) han sido entrenados desde cero por el autor. La relevancia actual radica en que permite ejecutar un flujo completo de creación 3D asistida por IA de forma local y offline, sin depender de servicios en la nube, con licencias que permiten uso comercial en la mayoría de los casos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple: ONNX (SPAN, Real-ESRGAN, UniRig, SkinTokens, TripoSR, TripoSG, U²-Net, RMIB, t2m, meshseg) y GGUF (SmolVLM-500M-Instruct) |
| Parametros totales | 409.252.800 (suma de todos los modelos del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelos de visión/3D, no generativos de texto; SmolVLM admite contexto multimodal pero no se especifica) |
| Tipos de cuantizacion | int8 (TripoSR, TripoSG), Q8_0 (SmolVLM), fp32 (resto) |
| Idiomas soportados | no disponible (los modelos de visión/3D no son lingüísticos; SmolVLM es multilingüe pero no se detalla) |
| Licencia | per-model (cada modelo tiene la suya: CC0-1.0, BSD-3-Clause, MIT, CC-BY-4.0, Apache-2.0) |
| Formato de pesos | ONNX (mayoría) y GGUF (SmolVLM) |

## Arquitectura y entrenamiento

El repositorio contiene modelos de muy diversa naturaleza arquitectónica. Por un lado, re-exportaciones ONNX de modelos publicados por terceros: los generadores de mapas PBR provienen de SPAN (Kim2091/PBRify_Remix, CC0), los upscalers son Real-ESRGAN (BSD-3-Clause), el auto-rigging usa el stage de esqueleto de UniRig (SIGGRAPH 2025, MIT), los skin weights emplean SkinTokens/TokenRig con backbone Qwen3-0.6B (MIT), la generación imagen-a-3D usa TripoSR (triplane encoder + decoder de densidad/color, MIT) y TripoSG (DINOv2 encoder + rectified-flow DiT + VAE, MIT), la eliminación de fondos usa U²-Net (Apache-2.0) y el captioning usa SmolVLM-500M-Instruct cuantizado a Q8_0 (Apache-2.0).

Por otro lado, el autor entrenó desde cero tres modelos propios: RMIB (in-betweening de animación) es un modelo entrenado sobre la base de datos CMU MoCap, que supera a la interpolación slerp en más de 2 veces en datos de validación; t2m es un CVAE transformer que convierte palabras clave de texto en clips de movimiento de 22 articulaciones, entrenado con datos propios; y meshseg es un clasificador por punto de estilo PointNet++ que etiqueta cabeza, torso, brazos y piernas, entrenado con cuerpos sintéticos propios y personajes CC0 de Quaternius, alcanzando un 94,7 % de precisión por vértice. No se especifica el número de tokens de entrenamiento ni si se usaron técnicas como RLHF o DPO.

## Capacidades

- Síntesis de mapas PBR (normal, rugosidad y altura) a partir de una textura de albedo, en espacio tangente, con entrada y salida de dimensiones dinámicas (1×3×H×W).
- Superresolución de texturas con factores 2× y 4× mediante Real-ESRGAN.
- Auto-rigging: predicción autoregresiva de esqueletos para mallas sin riggear.
- Predicción de skin weights por ML (SkinTokens/TokenRig), el skinner por defecto de QtMeshEditor.
- Generación de malla 3D a partir de una imagen (TripoSR y TripoSG), con salida de geometría y color.
- Interpolación de animaciones entre dos keyframes (RMIB), superando a la interpolación lineal clásica.
- Texto a movimiento: generación de clips de animación de 22 articulaciones a partir de palabras clave (experimental).
- Segmentación semántica de mallas en partes (cabeza, torso, brazos, piernas).
- Eliminación de fondos en imágenes mediante U²-Net.
- Captioning de imágenes con SmolVLM-500M-Instruct cuantizado, ejecutable vía llama.cpp.

## Casos de uso

- Creación de assets PBR para juegos indie: un artista puede generar mapas normal, roughness y height a partir de una única textura de albedo, acelerando el pipeline de materiales en motores como Godot o Unity.
- Upscaling de texturas de baja resolución: usar Real-ESRGAN 2× o 4× para mejorar texturas antiguas o generadas proceduralmente antes de integrarlas en un proyecto.
- Auto-rigging de personajes importados: aplicar UniRig para obtener un esqueleto inicial sobre mallas sin riggear, reduciendo horas de trabajo manual en Blender o Maya.
- Skinning automático de mallas: usar SkinTokens para asignar pesos de influencia a los vértices, especialmente útil en personajes con geometría compleja.
- Prototipado rápido de props 3D: generar una malla base a partir de una fotografía o render con TripoSR, y luego refinarla en el editor.
- Interpolación de animaciones entre keyframes: usar RMIB para generar transiciones suaves entre poses, evitando el popping en secuencias de caminar o correr.
- Automatización de pipelines de assets: integrar los modelos ONNX en scripts de CI/CD para validar, convertir y arreglar assets 3D de forma automática, como ya hace QtMeshEditor.
- Segmentación de mallas para sistemas de daño: usar meshseg para etiquetar partes del cuerpo y luego aplicar efectos de daño o equipamiento por zona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de modelos de visión/3D y no de lenguaje. Los únicos datos de rendimiento reportados por el autor son:

- RMIB (in-betweening): supera a la interpolación slerp en más de 2 veces en datos de validación de CMU MoCap.
- Meshseg (segmentación): 94,7 % de precisión por vértice en evaluación sobre rig-truth.

No hay comparativas con otros modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo concreto. Los modelos más pesados son SkinTokens (más de 1,6 GB en un solo archivo ONNX) y TripoSG (pesos externos fp32). En total el repositorio ocupa 17 GB en disco.
- GPU recomendadas: no se especifican; los modelos ONNX pueden ejecutarse en GPU con al menos 4-8 GB de VRAM para los más grandes, y en CPU para los pequeños (U²-Net, Real-ESRGAN). No hay requisitos oficiales.
- Compatibilidad con GPU de consumo: sí, la mayoría de los modelos son pequeños (decenas de MB) y pueden ejecutarse en cualquier GPU moderna; los más grandes (TripoSG, SkinTokens) requieren al menos 8 GB de VRAM.
- Opciones de despliegue: los modelos ONNX se ejecutan con ONNX Runtime (ORT), los GGUF con llama.cpp. QtMeshEditor los descarga y ejecuta localmente en primera ejecución. También pueden integrarse en pipelines Python con onnxruntime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo monolítico comparable con alternativas de la misma categoría; es un conjunto de modelos heterogéneos para tareas específicas de 3D. Cada modelo individual (TripoSR, TripoSG, Real-ESRGAN, etc.) tiene sus propias alternativas en el ecosistema, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencias por modelo: aunque la mayoría son permisivas (MIT, Apache-2.0, CC0), algunos son CC-BY-4.0 (RMIB, meshseg), lo que requiere atribución en productos derivados. Consultar la tabla de la model card y el archivo THIRD_PARTY_AI_MODELS.md del repositorio.
- Modelos experimentales: t2m (texto a movimiento) está marcado como experimental y su calidad puede ser limitada.
- Deprecación parcial: el tier int8 de TripoSG está deprecado porque degrada a blobs sobre el bucle de flujo CFG; se recomienda usar los pesos fp32.
- Riesgo de alucinación: en los modelos generativos (TripoSG, t2m, SmolVLM) existe riesgo de generar geometría o movimientos irreales o no deseados.
- Sesgos: no se documentan sesgos específicos, pero los modelos entrenados con datos de CMU MoCap (RMIB) y cuerpos sintéticos (meshseg) pueden no generalizar bien a tipos de cuerpo o estilos de animación fuera de esos dominios.
- Requisitos de almacenamiento: el repositorio completo pesa 17 GB; QtMeshEditor descarga cada modelo bajo demanda, pero el uso de todas las funciones requiere ese espacio en disco.
- Sin soporte de contexto largo: al ser modelos de visión/3D, no aplican ventanas de contexto de texto; SmolVLM-500M tiene un contexto multimodal limitado, no especificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Repositorio GitHub de QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Archivo de licencias de terceros: https://github.com/fernandotonon/QtMeshEditor/blob/master/THIRD_PARTY_AI_MODELS.md
- Repositorios dedicados por modelo (enlazados en la model card):
  - PBRify: https://huggingface.co/fernandotonon/QtMeshEditor-pbrify-onnx
  - Real-ESRGAN: https://huggingface.co/fernandotonon/QtMeshEditor-realesrgan-onnx
  - UniRig: https://huggingface.co/fernandotonon/QtMeshEditor-unirig-onnx
  - SkinTokens: https://huggingface.co/fernandotonon/QtMeshEditor-skintokens-onnx
  - TripoSR: https://huggingface.co/fernandotonon/QtMeshEditor-triposr-onnx
  - TripoSG: https://huggingface.co/fernandotonon/QtMeshEditor-triposg-onnx
  - RMIB: https://huggingface.co/fernandotonon/QtMeshEditor-rmib-inbetween
  - Text-to-motion: https://huggingface.co/fernandotonon/QtMeshEditor-t2m
  - Segmentación: https://huggingface.co/fernandotonon/QtMeshEditor-mesh-segmentation
  - U²-Net: https://huggingface.co/fernandotonon/QtMeshEditor-u2net-onnx
  - SmolVLM: https://huggingface.co/fernandotonon/QtMeshEditor-smolvlm-gguf
- Página web de QtMesh Cloud: https://qtmesh.dev
