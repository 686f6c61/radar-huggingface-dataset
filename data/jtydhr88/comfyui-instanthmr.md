# jtydhr88/ComfyUI-InstantHMR

## Resumen

ComfyUI-InstantHMR es un paquete de pesos empaquetados por jtydhr88 a partir del modelo InstantHMR (Human Mesh Recovery), desarrollado originalmente por Mohamed Adjel, Kahina Chalabi y Vincent Bonnet (Naturalpad-studio). No se trata de un modelo de lenguaje, sino de un modelo de vision por computador especializado en la recuperacion de malla corporal humana 3D (human mesh recovery) a partir de imagenes, con pipeline de deteccion de puntos clave (keypoint-detection). Su funcion es estimar la pose y la forma del cuerpo humano en 3D y devolver una malla MHR (Meta Human Rig) compatible con los nodos nativos SAM 3D Body de ComfyUI.

El repositorio redistribuye los pesos oficiales en formato ONNX como archivos `.safetensors` unicos, cada uno de los cuales contiene tanto la red neuronal como el rig corporal MHR con el que fue entrenada, de modo que se carga sin depender de otros modelos. Incluye cinco variantes con distintos backbones HGNetV2 (de B0 a B4), con un rango de 20,0 M a 32,2 M de parametros y precisiones de 40,0 a 50,7 mm de PA-MPJPE en 3DPW.

La relevancia actual reside en que facilita el uso de InstantHMR dentro de ComfyUI sin necesidad de gestionar grafos ONNX ni dependencias externas, integrándose directamente con los nodos de suavizado, renderizado y exportacion GLB/BVH. La principal advertencia es la licencia: cuatro de las cinco variantes son CC BY-NC 4.0 (solo uso no comercial), y unicamente `medium_commercial` es Apache-2.0, con peor precision (50,7 mm frente a 40,0 mm).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de recuperacion de malla humana 3D (human mesh recovery) con backbone HGNetV2 (B0, B1, B2, B4) y rig corporal MHR de Meta |
| Parametros totales | 20,0 M (nano) / 20,3 M (tiny) / 24,4 M (small) / 32,2 M (medium y medium_commercial) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | per-file: nano, tiny, small y medium bajo CC BY-NC 4.0; medium_commercial bajo Apache-2.0; rig MHR Apache-2.0 |
| Formato de pesos | safetensors (un unico archivo por variante, convertido desde grafos ONNX oficiales) |

## Arquitectura y entrenamiento

InstantHMR es un modelo de vision dedicado a la recuperacion de malla corporal humana en 3D. Cada variante combina un backbone convolucional HGNetV2 (B0 en nano, B1 en tiny, B2 en small y B4 en medium/medium_commercial) con una cabeza de regresion que produce directamente los parametros del rig corporal MHR de Meta. El rig MHR esta embebido en el propio archivo de pesos, de modo que la red y el cuerpo humano entrenado se cargan como una unidad y la salida es directamente compatible con los nodos SAM 3D Body de ComfyUI.

Los pesos se han convertido desde los grafos ONNX oficiales mediante el script `scripts/convert_onnx.py` del paquete de nodos, con verificacion contra el grafo ONNX original usando onnxruntime; los resultados coinciden con una tolerancia de aproximadamente 1e-5. No se detalla en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO. Si se indica que las variantes no comerciales se entrenaron con datos cuyo uso esta restringido a investigacion, mientras que `medium_commercial` se entreno exclusivamente con Harmony4D e imagenes COCO bajo CC BY o sin copyright conocido, lo que explica su menor precision (50,7 mm frente a 40,0 mm del medium no comercial).

## Capacidades

- Recuperacion de malla corporal humana 3D (human mesh recovery) a partir de imagenes, con salida en el rig MHR de Meta.
- Estimacion de pose y forma corporal (pose estimation y shape estimation) en 3D.
- Deteccion de puntos clave (keypoint detection), que es el pipeline declarado del modelo.
- Generacion de salidas compatibles con los nodos nativos SAM 3D Body de ComfyUI, incluidos suavizado, renderizado y exportacion a GLB y BVH.
- Carga autocontenida: cada archivo `.safetensors` incluye red y rig, sin dependencias de otros modelos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Captura de movimiento (mocap) sin marcadores: el modelo estima la malla corporal 3D por fotograma y, encadenado en ComfyUI con los nodos de exportacion, permite generar animaciones BVH para produccion audiovisual o videojuegos.
- Reconstruccion 3D de personas para entornos de realidad virtual y aumentada: a partir de una imagen se obtiene una malla MHR utilizable como avatar base, con el rig ya incluido en el archivo de pesos.
- Previsualizacion de vestuario y simulacion de tejidos: la malla corporal 3D y el rig MHR sirven como entrada para herramientas de simulacion de ropa, ya que aportan la pose y la forma del cuerpo en un formato estandar.
- Analisis biomecanico y deportivo: la estimacion de puntos clave y de la pose 3D permite medir angulos articulares y trayectorias de movimiento en vídeos, con precision documentada de 40,0 mm PA-MPJPE en 3DPW para la variante medium.
- Anotacion automatica de datasets de vision: el modelo puede preetiquetar imagenes con mallas corporales y puntos clave, reduciendo el trabajo manual en la construccion de corpus de pose estimation.
- Integracion en pipelines de ComfyUI para diseño y postproduccion: al cargarse desde `ComfyUI/models/detection` y seleccionarse en `Load InstantHMR Model`, se puede incorporar en flujos de trabajo existentes de renderizado y exportacion GLB/BVH.
- Prototipado rapido en investigacion: las variantes nano y tiny (20,0 M y 20,3 M de parametros) permiten experimentar con bajo coste computacional antes de escalar a medium.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los valores de PA-MPJPE en 3DPW por variante:

| Variante | Backbone | Parametros | 3DPW PA-MPJPE (mm) | Licencia |
|---|---|---|---|---|
| instanthmr_nano | HGNetV2-B0 | 20,0 M | 46,6 | CC BY-NC 4.0 |
| instanthmr_tiny | HGNetV2-B1 | 20,3 M | 44,0 | CC BY-NC 4.0 |
| instanthmr_small | HGNetV2-B2 | 24,4 M | 41,7 | CC BY-NC 4.0 |
| instanthmr_medium | HGNetV2-B4 | 32,2 M | 40,0 | CC BY-NC 4.0 |
| instanthmr_medium_commercial | HGNetV2-B4 | 32,2 M | 50,7 | Apache-2.0 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 20,0-32,2 M de parametros, los pesos en safetensors ocupan del orden de decenas de MB por variante, y el repositorio completo mide 0,8 GB.
- GPU recomendadas: no disponible; por el tamano reducido del modelo, cualquier GPU con soporte para ComfyUI deberia ser suficiente, pero no se documentan recomendaciones concretas.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el rango de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ComfyUI mediante el paquete de nodos ComfyUI-InstantHMR (carga desde `ComfyUI/models/detection` con el nodo `Load InstantHMR Model`); los pesos originales estan en ONNX y pueden ejecutarse con onnxruntime. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ComfyUI-InstantHMR (medium) | 32,2 M | no aplica | 40,0 mm PA-MPJPE en 3DPW | CC BY-NC 4.0 | Hugging Face (jtydhr88/ComfyUI-InstantHMR) |
| ComfyUI-InstantHMR (medium_commercial) | 32,2 M | no aplica | 50,7 mm PA-MPJPE en 3DPW | Apache-2.0 | Hugging Face (jtydhr88/ComfyUI-InstantHMR) |
| InstantHMR original (momolesang/InstantHMR) | no disponible | no aplica | no disponible | no disponible | Hugging Face (momolesang/InstantHMR) |
| SAM 3D Body (nodos nativos de ComfyUI) | no disponible | no aplica | no disponible | no disponible | Integrado en ComfyUI |

Los nodos nativos SAM 3D Body de ComfyUI se mencionan como destino compatible de la salida MHR, pero no se dispone de sus especificaciones ni de sus metricas en la informacion proporcionada. No se conocen otros modelos comparables con datos suficientes; indicar "no disponible" para cualquier otra comparacion.

## Limitaciones y advertencias

- Licencia restrictiva: las variantes nano, tiny, small y medium son CC BY-NC 4.0 y solo permiten uso no comercial; sus datos de entrenamiento estan limitados a investigacion.
- La unica variante Apache-2.0 utilizable comercialmente (`medium_commercial`) tiene peor precision: 50,7 mm PA-MPJPE frente a 40,0 mm del medium no comercial.
- El rig MHR incluido procede de Meta y esta bajo Apache-2.0; conviene verificar el cumplimiento de ambas licencias en despliegues comerciales.
- Modelo de vision especializado: no ofrece generacion de texto, razonamiento, codigo ni capacidades de agente, por lo que no es adecuado para tareas de lenguaje.
- Riesgo de alucinacion en el sentido de estimaciones erroneas de pose o forma corporal en imagenes con oclusiones, poses extremas, multiples personas o iluminacion adversa; no se documentan sesgos especificos en la informacion disponible.
- Limitaciones de contexto e idioma: no aplica contexto de texto; no se documentan idiomas soportados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-07; se trata de un empaquetado reciente y poco validado por la comunidad.
- La informacion disponible no detalla latencia, throughput ni requisitos minimos de hardware, lo que limita la planificacion de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jtydhr88/ComfyUI-InstantHMR
- Modelo base: https://huggingface.co/momolesang/InstantHMR
- Paquete de nodos ComfyUI-InstantHMR: https://github.com/jtydhr88/ComfyUI-InstantHMR
- Codigo original de InstantHMR: https://github.com/Naturalpad-studio/InstantHMR
- Paper de InstantHMR: https://hal.science/hal-05854387
- Rig MHR de Meta: https://github.com/facebookresearch/MHR
- ComfyArt (proyecto relacionado del mismo autor): https://github.com/jtydhr88/ComfyArt
