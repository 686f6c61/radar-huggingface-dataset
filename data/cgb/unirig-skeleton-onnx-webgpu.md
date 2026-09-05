# cgb/unirig-skeleton-onnx-webgpu

## Resumen

El modelo `cgb/unirig-skeleton-onnx-webgpu` es una cuantización int8 de la etapa de predicción de esqueleto del modelo UniRig ("One Model to Rig Them All", SIGGRAPH 2025, VAST-AI-Research). Desarrollado por el usuario cgb, transforma el modelo original de 1.44 GB en un paquete ONNX de 418 MB que puede ejecutarse íntegramente en un navegador web mediante WebGPU y ONNX Runtime Web. Resuelve el problema del auto-rigging de mallas 3D: dado un conjunto de vértices y normales de una malla, predice un esqueleto (jerarquía de huesos y articulaciones) sin necesidad de plantillas ni marcadores. Su relevancia radica en que permite realizar esta tarea de forma local, sin servidores, con una latencia reducida y sin enviar datos a terceros, lo que facilita su integración en herramientas de diseño 3D basadas en navegador.

La arquitectura se compone de un encoder, un módulo de embedding y un decoder transformer autoregresivo. El encoder procesa hasta 65 536 vértices y produce latentes; el decoder genera la secuencia de tokens que representan la estructura del esqueleto. El contexto está limitado por la longitud de la secuencia de tokens generada, que depende de la malla de entrada. El paquete cuantizado incluye el encoder y el decoder en int8 weight-only (block 32) y el embedding en float32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (encoder-decoder) para predicción de esqueleto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 65 536 vértices en la entrada del encoder; secuencia de tokens variable en el decoder |
| Tipos de cuantizacion | int8 weight-only (block 32) para encoder y decoder; float32 para el embedding |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (con archivos .data externos) |
| Modelo base | VAST-AI/UniRig |
| Tamano del paquete | 418 MB (encoder 61 MB, decoder 355 MB, embedding 1.1 MB) |
| Libreria | onnx |

## Arquitectura y entrenamiento

El modelo es una adaptación cuantizada de la etapa de skeleton de UniRig. La arquitectura original de UniRig es un modelo autoregresivo que predice el esqueleto token a token. En esta versión ONNX, el encoder procesa los vértices y normales de la malla (normalizados en una caja unitaria con +Y hacia arriba) y produce un tensor de latentes de forma `[1, 1024, 1024]`. El módulo `embed` convierte los tokens de entrada en embeddings de dimensión 1024. El decoder es un transformer con 24 capas y 16 cabezas de atención, que genera logits sobre un vocabulario de 267 tokens. La decodificación es autoregresiva, manteniendo las claves y valores de atención (`past`) para cada paso.

El modelo fue entrenado por VAST-AI-Research sobre el dataset Articulation-XL2.0 (licencia CC-BY-4.0). No se han proporcionado detalles sobre el proceso de entrenamiento (número de tokens, RLHF, etc.). Las innovaciones técnicas de esta adaptación incluyen: reescritura de los nodos `Gemm` como `MatMul` + `Add` para que la cuantización `MatMulNBitsQuantizer` pudiera aplicarse a dos tercios del peso del decoder; mantenimiento de la proyección de salida en float32 para evitar errores en los logits que pudieran cambiar el token seleccionado; y uso de int8 en lugar de int4 para reducir la acumulación de errores en una decodificación autoregresiva.

## Capacidades

- Predicción de esqueleto a partir de malla 3D: genera una jerarquía de huesos y articulaciones (hasta 27 huesos en la verificación) sin plantillas ni marcadores.
- Procesamiento de mallas de hasta 65 536 vértices, con normales incluidas.
- Ejecución completamente en el navegador mediante WebGPU y ONNX Runtime Web, sin necesidad de servidor.
- Cuantización int8 que reduce el peso de 1.44 GB a 418 MB, manteniendo una salida casi idéntica (165 de 167 tokens idénticos en la verificación).
- Soporte de decodificación con máscara gramatical: los tokens se seleccionan únicamente entre los permitidos por la gramática de la estructura del esqueleto.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes, ni razonamiento multimodal.

## Casos de uso

- Rigging automático en editores 3D basados en navegador: un usuario sube una malla, el modelo genera el esqueleto al instante y el editor lo muestra para su animación. Es adecuado porque elimina la necesidad de instalar software de escritorio y procesa la malla localmente.
- Previsualización de rigs en plataformas de marketplace 3D: antes de descargar un modelo, la plataforma ofrece una vista previa del esqueleto generado en el navegador. El modelo es adecuado por su tamaño reducido y su ejecución en WebGPU.
- Generación de contenido 3D procedimental: en un pipeline que genera mallas, se puede encadenar este modelo para producir un esqueleto base sin salir del navegador, facilitando la creación de assets listos para animar.
- Prototipado rápido para animadores: un animador puede probar diferentes mallas y obtener un esqueleto base en segundos, sin configurar un entorno de rigging complejo. La ejecución local evita cuellos de botella de red.
- Educación y demos interactivas: en cursos de animación 3D, se pueden mostrar en tiempo real cómo se predice un esqueleto a partir de una malla, gracias a la ejecución en navegador.
- Herramientas de realidad aumentada y VR: aplicaciones web que preparan modelos 3D para su uso en AR/VR pueden generar el esqueleto en el dispositivo del usuario, manteniendo los datos locales.
- Automatización en estudios de animación: un flujo de trabajo en el navegador que pre-rigge assets antes de importarlos a software profesional como Blender o Maya, reduciendo el tiempo de preparación.
- Integración en generadores de avatares: aplicaciones que crean avatares personalizados pueden ofrecer auto-rigging en el cliente, sin enviar la malla a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. La verificación realizada por el autor reporta los siguientes resultados comparando el paquete cuantizado con el modelo original:

| Metrica | Resultado |
|---|---|
| Tokens identicos | 165 de 167 |
| Huesos generados | 27 (mismos que el original) |
| Jerarquia | Identica |
| Desviacion de articulaciones | Dentro de 1.00 bins de cuantizacion |

Estos datos provienen del script `scripts/unirig-verify.py` mencionado en la model card. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del paquete es de 418 MB, por lo que es plausible que quepa en GPUs con 1 GB o más de VRAM, pero no se proporciona un valor oficial.
- GPU recomendadas: no disponible. Se requiere una GPU compatible con WebGPU (por ejemplo, NVIDIA, AMD o Intel modernas, así como GPUs integradas en portátiles recientes).
- Si cabe en GPU de consumo: sí, dado el tamaño reducido, es probable que funcione en GPUs de consumo e incluso en GPUs integradas con soporte WebGPU.
- Opciones de despliegue: ONNX Runtime Web con WebGPU en navegador; también puede ejecutarse con ONNX Runtime en Node.js o Python, aunque el objetivo principal es el navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | Licencia | Disponibilidad | Contexto |
|---|---|---|---|---|
| cgb/unirig-skeleton-onnx-webgpu | 418 MB (int8) | MIT | HuggingFace, ONNX | Hasta 65 536 vertices |
| VAST-AI/UniRig (original) | 1.44 GB (float32) | MIT | HuggingFace, PyTorch | No disponible |
| SkinTokens (sucesor) | no disponible | no disponible | GitHub (anunciado) | no disponible |

La comparativa se basa en la información disponible. SkinTokens es el sucesor de UniRig, que unifica la predicción de esqueleto y skinning en una sola secuencia autoregresiva, pero no se dispone de especificaciones concretas.

## Limitaciones y advertencias

- El modelo está diseñado para ejecutarse en navegador con WebGPU; requiere un navegador compatible (Chrome, Edge, Firefox, Safari con WebGPU habilitado).
- La cuantización int8 introduce pequeñas diferencias: en la verificación, 2 de 167 tokens difieren y las articulaciones pueden desviarse hasta 1 bin de cuantización. En casos extremos, esto podría alterar la jerarquía o el número de huesos.
- Es una etapa específica: solo predice el esqueleto. Para un rigging completo se necesita la etapa de skinning de UniRig o el modelo SkinTokens.
- La máscara gramatical es imprescindible. Sin ella, la decodificación produce tokens inválidos desde el primer paso (por ejemplo, token 260, un hueco en el vocabulario). Cualquier implementación debe respetar las reglas de la gramática.
- El emparejamiento de un hueso padre con la articulación más cercana anterior debe hacerse por proximidad, no por coincidencia exacta del bin, ya que la decodificación puede no reproducir el bin exacto.
- El modelo no soporta mallas con más de 65 536 vértices.
- No es un modelo de lenguaje: no puede usarse para tareas de texto, tool calling ni agentes.
- No se dispone de información sobre sesgos específicos del modelo. El riesgo de alucinación se manifiesta como predicción de estructuras de esqueleto incorrectas; la verificación muestra una fidelidad alta, pero no se ha evaluado en todos los tipos de malla.
- La licencia MIT permite uso comercial, pero se debe dar crédito a VAST-AI-Research y respetar la licencia CC-BY-4.0 del dataset Articulation-XL2.0.
- El export ONNX upstream de `fernandotonon/QtMeshEditor-models` puede no coincidir con el contrato documentado; el autor advierte que algunos repositorios contienen un export genérico del decoder que no puede condicionarse a una malla.

## Enlaces

- HuggingFace: https://huggingface.co/cgb/unirig-skeleton-onnx-webgpu
- Modelo base UniRig: https://huggingface.co/VAST-AI/UniRig
- GitHub de UniRig: https://github.com/VAST-AI-Research/UniRig
- Ejemplos de skeleton en UniRig: https://github.com/VAST-AI-Research/UniRig/tree/main/examples/skeleton
- QtMeshEditor (export ONNX de referencia): https://github.com/fernandotonon/QtMeshEditor
- Demo en línea: https://freegen.ai
