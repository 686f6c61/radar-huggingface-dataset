# fernandotonon/QtMeshEditor-models

## Resumen

QtMeshEditor-models es un repositorio agregado que contiene todos los modelos de IA que la aplicación de escritorio QtMeshEditor descarga en tiempo de ejecución para sus funciones de autoría asistida sobre mallas 3D. No se trata de un único modelo, sino de una colección de grafos ONNX (y algunos GGUF) que cubren tareas muy distintas dentro del pipeline de creación de activos 3D: síntesis de mapas PBR, superresolución de texturas, auto-rigging, predicción de pesos de skin, image-to-3D, segmentación de partes de malla, interpolación de animación, text-to-motion, eliminación de fondos y captioning de imágenes.

El autor, fernandotonon, actúa principalmente como integrador y conversor: la mayoría de los modelos son re-exportaciones a ONNX de trabajos de terceros con licencias permisivas (PBRify_Remix de Kim2091, Real-ESRGAN de xinntao, UniRig y SkinTokens/TokenRig de VAST-AI, TripoSR de Tripo AI y Stability AI, TripoSG de VAST-AI, U²-Net de rembg, SmolVLM-500M-Instruct de Hugging Face TB). Tres piezas son entrenadas desde cero por el autor: el modelo de in-betweening RMIB, el text-to-motion t2m v8.0 y el segmentador de mallas meshseg.

La relevancia práctica del repositorio es que empaqueta un conjunto heterogéneo de herramientas 3D en formato ONNX ejecutable offline, con contratos de E/S documentados por modelo y licencias individuales. El tamaño total del repo es de 31,1 GB y el recuento de parámetros reportado en safetensors es de 409.252.800, aunque ese dato agregado no refleja la realidad de cada submodelo (algunos son CNNs pequeños y otros incluyen un backbone Qwen3-0.6B). La licencia es "per-model", por lo que cada componente debe evaluarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: CNNs (Real-ESRGAN, U²-Net, PBRify), transformers (SmolVLM-500M), DiT con flow matching (t2m), triplane encoder/decoder (TripoSR), rectified-flow DiT (TripoSG), PointNet++-style (meshseg), backbone Qwen3-0.6B (skintokens) |
| Parametros totales | 409.252.800 (dato agregado reportado en safetensors; no representativo de cada submodelo) |
| Parametros activos | no disponible (no es un modelo MoE unico) |
| Longitud de contexto | no disponible (no es un LLM de proposito general; SmolVLM-500M-Instruct tiene contexto propio no detallado aqui) |
| Tipos de cuantizacion | ONNX fp32, ONNX int8 (tier en triposr; tier int8 en triposg marcado como deprecado), GGUF Q8_0 (SmolVLM) |
| Idiomas soportados | no disponible (captioning via SmolVLM-500M-Instruct, multilingue segun el modelo base; resto son modelos visuales/3D sin idioma) |
| Licencia | per-model (CC0-1.0, BSD-3-Clause, MIT, CC-BY-4.0, Apache-2.0 segun componente) |
| Formato de pesos | ONNX (mayoria), GGUF (SmolVLM), datos externos `.onnx.data` para pesos LM grandes |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica. Cada submodelo responde a un diseno distinto. PBRify_Remix, Real-ESRGAN y U²-Net son redes convolucionales para tareas de imagen (sintesis de mapas, superresolucion y saliencia). TripoSR usa un encoder de triplanos con decodificador por punto de densidad y color. TripoSG emplea un encoder de imagen DINOv2 y un DiT de rectified flow con paso unico por grafo, mas un VAE latente y un decodificador de campo; el tier int8 esta deprecado porque degrada a "blobs" sobre el bucle de flujo CFG. UniRig realiza prediccion autorregresiva de esqueletos. SkinTokens/TokenRig usa un backbone Qwen3-0.6B con cinco grafos ONNX y un manifest, con los pesos del LM en datos externos porque ORT no puede parsear el proto unico de mas de 1,6 GB.

Los tres modelos propios del autor tienen detalles de entrenamiento documentados. RMIB (in-betweening) se entrena desde cero sobre la base de datos CMU MoCap, con licencia permisiva, y supera a slerp en mas de 2x sobre movimiento CMU reservado. El text-to-motion t2m v8.0 es un DiT de flow matching de 21,7M de parametros que mapea una palabra clave de texto a un clip de 22 articulaciones en marco mundial sobre un vocabulario de 30 acciones, entrenado con clips de plantilla curados en `motion/motion-library-v2.json`; la version v8.0 corrige el problema de orientacion hacia atras heredado del corpus CMU y un defecto de marcha donde la flexion estaba en el tobillo en lugar de la rodilla, y se conserva `t2m-v61.onnx` para rollback. Meshseg es un cabezal tipo PointNet++ que etiqueta por punto cabeza/torso/brazo/pierna, entrenado con cuerpos sinteticos propios y personajes riggeados CC0 de Quaternius, con 94,7% de exactitud por vertice en evaluacion con ground truth de rig.

## Capacidades

- Sintesis de mapas PBR (normal tangencial, roughness y height) a partir de una unica textura de albedo, con altura y anchura dinamicas y E/S `1×3×H×W` float `[0,1]`.
- Superresolucion de texturas 2x y 4x mediante Real-ESRGAN.
- Prediccion automatica de esqueletos para mallas sin rig (UniRig).
- Prediccion de pesos de skin por ML (SkinTokens/TokenRig), marcada como el skinner por defecto de QtMeshEditor.
- Image-to-3D: reconstruccion de geometria y color via TripoSR (triplanos) y TripoSG (rectified-flow DiT, solo geometria; el color proviene del campo de color de TripoSR).
- Eliminacion de fondos por saliencia con U²-Net.
- Segmentacion de partes de malla (cabeza, torso, brazo, pierna) por vertice.
- Interpolacion de animacion entre keyframes (RMIB).
- Text-to-motion: mapeo de palabra clave a clip de 22 articulaciones sobre vocabulario de 30 acciones, con biblioteca de clips de respaldo para prompts fuera de vocabulario.
- Captioning de imagenes mediante SmolVLM-500M-Instruct cuantizado en GGUF para llama.cpp.
- Ejecucion local/offline tras la primera descarga de cada modelo; sin dependencia de API en runtime.

## Casos de uso

- Pipeline de materiales en produccion 3D: dada una unica textura de albedo, generar los mapas normal, roughness y height con PBRify y empaquetarlos para un motor PBR, reduciendo el trabajo manual de autoria de materiales.
- Preparacion de assets para juegos moviles: aplicar Real-ESRGAN 2x/4x a texturas de baja resolucion para alcanzar resoluciones objetivo sin reautoria, con salida ONNX integrable en un paso de build.
- Auto-rigging de personajes en lote: usar UniRig para predecir esqueletos de mallas sin rig y SkinTokens para generar pesos de skin, acelerando la incorporacion de bibliotecas de personajes a un pipeline de animacion.
- Prototipado rapido de assets a partir de bocetos o fotos: TripoSR y TripoSG convierten una imagen en malla 3D con geometria y color, adecuados para blockouts y pruebas de concepto antes de modelado definitivo.
- Segmentacion de mallas para edicion selectiva: meshseg etiqueta cabeza, torso, brazos y piernas por vertice, habilitando operaciones por region (ocultar, colorear, deformar) en herramientas de autoria.
- Generacion de animaciones basicas por texto: t2m v8.0 mapea una accion de un vocabulario de 30 clases a un clip de 22 articulaciones, util para previsualizaciones y animacion provisional en prototipos.
- Interpolacion de keyframes en animacion: RMIB rellena el hueco entre dos poses clave superando a slerp en mas de 2x en movimiento CMU reservado, lo que reduce el numero de claves necesarias al animar.
- Captioning automatico de texturas y renders: SmolVLM-500M-Instruct en GGUF genera descripciones para catalogar y buscar assets en una biblioteca.
- Eliminacion de fondos en flujos de fotogrametria o image-to-3D: U²-Net aísla el sujeto antes de pasarlo a TripoSR/TripoSG para mejorar la reconstruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo las metricas internas declaradas por el autor para sus propios modelos:

| Modelo | Metrica | Resultado |
|---|---|---|
| RMIB (in-betweening) | Comparacion con slerp en movimiento CMU reservado | >2x mejor que slerp |
| meshseg (segmentacion) | Exactitud por vertice en evaluacion con ground truth de rig | 94,7% |
| t2m v8.0 | Parametros | 21,7M |
| t2m v8.0 | Vocabulario de acciones | 30 clases |
| t2m v8.0 | Articulaciones por clip | 22 |

No hay datos de MMLU, HumanEval, GSM8K ni benchmarks estandar de LLM, ya que el repositorio no contiene un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Depende del submodelo cargado; los grafos ONNX de imagen y 3D (TripoSR, TripoSG, Real-ESRGAN) son los mas exigentes, mientras que t2m (21,7M parametros) y meshseg son ligeros.
- SkinTokens/TokenRig incluye un backbone Qwen3-0.6B con pesos en datos externos de mas de 1,6 GB, lo que implica varios GB de memoria al cargarlo en fp32.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil de los modelos (inferencia ONNX de vision y 3D), se espera que funcionen en GPUs consumer modernas, pero no hay cifras confirmadas.
- Cabe en consumer GPU: no confirmado en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato principal del repo), llama.cpp para el GGUF de SmolVLM. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QtMeshEditor-models (agregado) | 409.252.800 (agregado safetensors) | no aplica | metricas internas por submodelo | per-model | Hugging Face, ONNX/GGUF |
| PBRify_Remix (Kim2091) | no disponible | no aplica | no disponible | CC0-1.0 | repo original en GitHub |
| Real-ESRGAN (xinntao) | no disponible | no aplica | no disponible | BSD-3-Clause | repo original |
| TripoSR (Tripo AI + Stability AI) | no disponible | no aplica | no disponible | MIT | modelo original |
| UniRig (VAST-AI) | no disponible | no aplica | no disponible | MIT | Hugging Face |

La comparativa directa es dificil porque el repositorio agrega trabajos de terceros ya publicados por separado; en la practica, cada submodelo compite con su version original, no con el agregado.

## Limitaciones y advertencias

- No es un modelo unico: no debe tratarse como un LLM ni evaluarse con benchmarks de texto; es una coleccion de herramientas 3D en ONNX.
- Licencias heterogeneas: cada componente tiene su propia licencia (CC0-1.0, BSD-3-Clause, MIT, CC-BY-4.0, Apache-2.0). El uso comercial exige revisar `THIRD_PARTY_AI_MODELS.md` y la licencia de cada submodelo por separado.
- El tier int8 de TripoSG esta deprecado y degrada la salida a "blobs" sobre el bucle de flujo CFG; usar fp32.
- TripoSG es solo geometria; el color depende del campo de color de TripoSR.
- El text-to-motion t2m v8.0 esta limitado a un vocabulario de 30 acciones; fuera de ese vocabulario recurre a la biblioteca de clips de respaldo, no a generacion libre.
- RMIB se entrena sobre CMU MoCap, con los sesgos y estilo de movimiento de ese corpus.
- meshseg se entrena con cuerpos sinteticos propios y personajes CC0 de Quaternius, lo que puede limitar la generalizacion a morfologias no representadas.
- Riesgo de alucinacion en el captioning de SmolVLM-500M-Instruct, inherente al modelo base.
- El dato de 409.252.800 parametros es agregado y no representa a cada submodelo; no usarlo para estimar VRAM por componente.
- Algunos pesos requieren datos externos `.onnx.data` por limitaciones de parseo de ONNX Runtime (>1,6 GB en proto unico).
- Idiomas soportados no disponibles; la mayoria de componentes no procesan lenguaje.

## Enlaces

- Repositorio principal: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Aplicacion QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- QtMesh Cloud: https://qtmesh.dev
- Licencias de terceros: https://github.com/fernandotonon/QtMeshEditor/blob/master/THIRD_PARTY_AI_MODELS.md
- PBRify: https://huggingface.co/fernandotonon/QtMeshEditor-pbrify-onnx y https://github.com/Kim2091/PBRify_Remix
- Real-ESRGAN: https://huggingface.co/fernandotonon/QtMeshEditor-realesrgan-onnx y https://github.com/xinntao/Real-ESRGAN
- UniRig: https://huggingface.co/fernandotonon/QtMeshEditor-unirig-onnx y https://huggingface.co/VAST-AI/UniRig
- SkinTokens: https://huggingface.co/fernandotonon/QtMeshEditor-skintokens-onnx
- TripoSR: https://huggingface.co/fernandotonon/QtMeshEditor-triposr-onnx
- TripoSG: https://huggingface.co/fernandotonon/QtMeshEditor-triposg-onnx
- RMIB in-betweening: https://huggingface.co/fernandotonon/QtMeshEditor-rmib-inbetween
- Text-to-motion: https://huggingface.co/fernandotonon/QtMeshEditor-t2m
- Segmentacion de malla: https://huggingface.co/fernandotonon/QtMeshEditor-mesh-segmentation
- U²-Net / rembg: https://huggingface.co/fernandotonon/QtMeshEditor-u2net-onnx
- SmolVLM GGUF: https://huggingface.co/fernandotonon/QtMeshEditor-smolvlm-gguf
- CMU MoCap: http://mocap.cs.cmu.edu
