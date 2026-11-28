# fernandotonon/QtMeshEditor-models

## Resumen

QtMeshEditor-models es un repositorio agregado que contiene la colección de modelos de IA que la aplicación de escritorio QtMeshEditor descarga en tiempo de ejecución para sus funciones de autoría asistida. No se trata de un único modelo entrenado de forma monolítica, sino de un paquete de conversiones a ONNX y GGUF de modelos de terceros (PBRify, Real-ESRGAN, UniRig, SkinTokens, TripoSR, TripoSG, SAM 2.1, U²-Net, SmolVLM) junto con tres modelos propios entrenados por el autor (RMIB para interpolación de animación, T2M para texto-a-movimiento y MeshSeg para segmentación de mallas).

El propósito es empaquetar en un solo artefacto todas las dependencias de inferencia local que la aplicación necesita para tareas de gráficos 3D: síntesis de mapas PBR, escalado de texturas, rigging automático, predicción de pesos de piel, reconstrucción image-to-3D, segmentación de partes, eliminación de fondos y generación de animaciones. La aplicación descarga cada modelo en su primer uso y posteriormente ejecuta la inferencia de forma offline.

La relevancia actual radica en su enfoque de despliegue: modelos de visión y 3D convertidos a ONNX con cuantización int8 en algunos casos, pensados para ejecutarse en el escritorio del usuario sin depender de servicios en la nube. El repositorio ocupa 31,2 GB y las licencias son heterogéneas (por modelo), lo que exige revisar cada subcarpeta antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: CNN (Real-ESRGAN, U²-Net), transformer (TripoSR, TripoSG DiT, SAM 2.1 Hiera), autoregresiva (UniRig, SkinTokens con backbone Qwen3-0.6B), PointNet++ (MeshSeg), flow-matching DiT (T2M), MLP/red de interpolación (RMIB) |
| Parametros totales | 409.252.800 (dato agregado del repo en safetensors); el modelo individual más grande identificado es SkinTokens con backbone Qwen3-0.6B; T2M declara 21,7 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica de forma uniforme; los modelos no son de lenguaje general salvo SmolVLM-500M para captioning) |
| Tipos de cuantizacion | fp32 e int8 en varios grafos ONNX (TripoSR tiene tiers fp32 e int8; TripoSG incluye un tier int8 marcado como obsoleto por degradación); GGUF para SmolVLM-500M |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; SmolVLM soporta entrada multimodal imagen-texto) |
| Licencia | per-model (CC0-1.0, BSD-3-Clause, MIT, CC-BY-4.0, Apache-2.0 según la subcarpeta; ver THIRD_PARTY_AI_MODELS.md) |
| Formato de pesos | ONNX (mayoría), GGUF (SmolVLM), datos externos `.onnx.data` para grafos grandes |

## Arquitectura y entrenamiento

El repositorio no corresponde a un entrenamiento único, sino a un conjunto de conversiones y de modelos propios. Las conversiones a ONNX provienen de proyectos de terceros: PBRify_Remix (modelos SPAN CC0 de Kim2091) para mapas de normales, rugosidad y altura a partir de un albedo; Real-ESRGAN de xinntao para superresolución 2× y 4×; UniRig de VAST-AI (SIGGRAPH 2025) para predicción autoregresiva de esqueletos; SkinTokens/TokenRig de VAST-AI con backbone Qwen3-0.6B para pesos de piel; TripoSR (Tripo AI + Stability AI) con encoder triplanar y decodificador por punto; TripoSG (VAST-AI) con encoder DINOv2 y DiT de flujo rectificado; SAM 2.1 Hiera-Small de Meta para segmentación genérica; U²-Net para eliminación de fondos; y SmolVLM-500M en GGUF para captioning de imágenes.

Los modelos propios son tres. RMIB (interpolación de animación) se entrenó desde cero sobre la base de datos CMU MoCap y, según el autor, supera a slerp en más de 2× en movimiento CMU retenido. T2M v8.0 es un DiT de flow-matching de 21,7 M de parámetros que mapea una palabra clave de texto a un clip de 22 articulaciones en marco mundial sobre un vocabulario de 30 acciones, entrenado con clips plantilla curados; la versión 8.0 corrige problemas de orientación heredados del corpus CMU y un defecto de marcha en el tobillo, y se conserva t2m-v61.onnx para rollback. MeshSeg es una cabeza PointNet++ que asigna etiquetas por punto (cabeza, torso, brazo, pierna), entrenada con cuerpos sintéticos propios y personajes riggeados CC0 de Quaternius, con 94,7 % de precisión por vértice en evaluación con verdad de rig.

## Capacidades

- Síntesis de mapas PBR (normal, rugosidad, altura) a partir de una textura albedo, con H y W dinámicos.
- Superresolución de texturas 2× y 4× mediante Real-ESRGAN.
- Predicción automática de esqueleto para mallas sin rig (UniRig).
- Predicción de pesos de piel (skin weights) con SkinTokens como skinner por defecto de la aplicación.
- Reconstrucción image-to-3D: geometría con TripoSR (triplano) y TripoSG (DiT de flujo rectificado), color desde el campo de color de TripoSR.
- Segmentación de partes de malla por punto (cabeza/torso/brazo/pierna) con MeshSeg.
- Segmentación genérica de cualquier objeto con SAM 2.1 Hiera-Small (encoder + decoder con prompt).
- Eliminación de fondos con U²-Net.
- Captioning de imágenes con SmolVLM-500M en GGUF.
- Interpolación de animación entre keyframes (RMIB).
- Texto-a-movimiento con vocabulario de 30 acciones (T2M v8.0).
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo conversacional de propósito general.

## Casos de uso

- Pipeline de texturizado PBR en estudio: a partir de un albedo escaneado o pintado, generar normales, rugosidad y altura con PBRify para completar el set de materiales sin salir del editor 3D, aprovechando que los grafos aceptan H y W dinámicos.
- Preparación de assets para motores de juego: escalar texturas de baja resolución a 2× o 4× con Real-ESRGAN antes de empaquetar el asset, reduciendo el trabajo manual de repintado.
- Rigging automático de personajes: cargar una malla sin esqueleto y obtener un esqueleto candidato con UniRig, seguido de pesos de piel con SkinTokens, lo que acelera la puesta a punto de personajes para animación.
- Prototipado rápido image-to-3D: convertir una foto o un concepto 2D en una malla 3D con TripoSR (iteración rápida) o TripoSG (mayor calidad geométrica), y usar el campo de color de TripoSR para el aspecto final.
- Segmentación de partes para edición selectiva: usar MeshSeg para separar cabeza, torso, brazos y piernas en una malla humana y aplicar modificaciones o materiales por región; SAM 2.1 cubre objetos no humanos con prompts.
- Limpieza de material de referencia: eliminar fondos de imágenes de referencia con U²-Net antes de usarlas como entrada en flujos de captioning o image-to-3D.
- Generación de animación básica: producir clips de 22 articulaciones a partir de una palabra clave con T2M v8.0 y rellenar huecos entre keyframes con RMIB, útil para previsualizaciones y animática.
- Catalogación de assets: generar descripciones automáticas de imágenes con SmolVLM-500M para metadatos de una biblioteca de texturas o referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo las métricas internas declaradas por el autor: RMIB supera a slerp en más de 2× en movimiento CMU retenido, y MeshSeg alcanza 94,7 % de precisión por vértice en evaluación con verdad de rig. No se aportan cifras de MMLU, HumanEval, GSM8K ni métricas estándar de image-to-3D (como Chamfer distance o F-score) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del submodelo cargado. Los grafos ONNX se ejecutan típicamente en CPU o GPU según el runtime; los pesos de SkinTokens (Qwen3-0.6B) y los grafos de TripoSG con pesos externos fp32 son los componentes más pesados del conjunto.
- GPU recomendadas: no disponible en la información proporcionada; al ser inferencia ONNX local, se puede usar GPU con soporte de ONNX Runtime (CUDA, DirectML) o CPU.
- ¿Cabe en GPU consumer? No se especifica; el tamaño total del repo (31,2 GB) excede la VRAM de muchas GPU consumer si se cargan todos los modelos a la vez, pero la aplicación descarga y ejecuta cada modelo por separado bajo demanda.
- Opciones de despliegue: ONNX Runtime (formato principal), llama.cpp/Ollama para el componente GGUF (SmolVLM-500M). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QtMeshEditor-models | Paquete de modelos 3D/visión en ONNX/GGUF | 409,3 M agregados (submodelos de 21,7 M a Qwen3-0.6B) | no aplica | per-model | Hugging Face (fernandotonon) |
| TripoSR (original) | Image-to-3D | no disponible | no aplica | MIT | Hugging Face (stabilityai/TripoSR) |
| TripoSG (original) | Image-to-3D (DiT) | no disponible | no aplica | MIT | Hugging Face (VAST-AI/TripoSG) |
| SAM 2.1 (original) | Segmentación | Hiera-Small y otras variantes | no aplica | Apache-2.0 | GitHub/Meta |

La comparativa directa es limitada porque QtMeshEditor-models agrega varios modelos de distinta naturaleza; frente a cada proyecto original, la diferencia principal es el reempaquetado a ONNX con tiers de cuantización y la integración en la aplicación de escritorio.

## Limitaciones y advertencias

- Licencias heterogéneas: cada subcarpeta tiene su propia licencia (CC0-1.0, BSD-3-Clause, MIT, CC-BY-4.0, Apache-2.0); es obligatorio revisar THIRD_PARTY_AI_MODELS.md antes de un uso comercial.
- El tier int8 de TripoSG está marcado como obsoleto por el propio autor porque degrada la salida a "blobs" sobre el bucle de flujo CFG; usar fp32.
- El grafo decoder.onnx.data de SkinTokens se separa en datos externos porque ONNX Runtime no puede parsear el proto único de más de 1,6 GB.
- T2M está limitado a un vocabulario de 30 acciones; las peticiones fuera del vocabulario recurren a la biblioteca de clips plantilla como fallback.
- No es un modelo de lenguaje conversacional: no se declaran capacidades de tool calling, agentes ni razonamiento multi-paso.
- No se declaran idiomas soportados ni sesgos conocidos en la información disponible; el riesgo de alucinación aplica principalmente al componente de captioning (SmolVLM-500M).
- El repositorio es un artefacto de distribución para una aplicación concreta; su uso fuera de QtMeshEditor requiere integrar manualmente cada grafo y su contrato de entrada/salida.

## Enlaces

- Repositorio principal: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Aplicación QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Licencias de terceros: https://github.com/fernandotonon/QtMeshEditor/blob/master/THIRD_PARTY_AI_MODELS.md
- PBRify: https://huggingface.co/fernandotonon/QtMeshEditor-pbrify-onnx
- Real-ESRGAN: https://huggingface.co/fernandotonon/QtMeshEditor-realesrgan-onnx
- UniRig: https://huggingface.co/fernandotonon/QtMeshEditor-unirig-onnx
- SkinTokens: https://huggingface.co/fernandotonon/QtMeshEditor-skintokens-onnx
- TripoSR: https://huggingface.co/fernandotonon/QtMeshEditor-triposr-onnx
- TripoSG: https://huggingface.co/fernandotonon/QtMeshEditor-triposg-onnx
- RMIB in-betweening: https://huggingface.co/fernandotonon/QtMeshEditor-rmib-inbetween
- Text-to-motion: https://huggingface.co/fernandotonon/QtMeshEditor-t2m
- Segmentación de malla: https://huggingface.co/fernandotonon/QtMeshEditor-mesh-segmentation
- SAM 2.1: https://huggingface.co/fernandotonon/QtMeshEditor-sam2-onnx
- U²-Net: https://huggingface.co/fernandotonon/QtMeshEditor-u2net-onnx
- SmolVLM GGUF: https://huggingface.co/fernandotonon/QtMeshEditor-smolvlm-gguf
- PBRify_Remix (origen): https://github.com/Kim2091/PBRify_Remix
- Real-ESRGAN (origen): https://github.com/xinntao/Real-ESRGAN
- UniRig (origen): https://huggingface.co/VAST-AI/UniRig
- SAM 2.1 (origen): https://github.com/facebookresearch/sam2
- CMU MoCap: http://mocap.cs.cmu.edu
