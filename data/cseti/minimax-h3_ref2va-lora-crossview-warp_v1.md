# Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1

## Resumen

MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1 es un adaptador LoRA de bajo rango publicado por Cseti (Tamás Cseh), un ingeniero independiente especializado en ajuste fino de modelos abiertos de generación de vídeo y audio. El adaptador se monta sobre el checkpoint ref2va de MiniMaxAI/MiniMax-H3 y añade una capacidad muy concreta: dada una secuencia de vídeo y un desplazamiento de cámara definido por azimut y elevación, genera la misma escena desde ese nuevo punto de vista. No es un modelo de lenguaje ni un generador de vídeo autónomo, sino un módulo de síntesis de vistas noveles (novel view synthesis) aplicado a vídeo.

La innovación principal reside en la estrategia de doble entrada: el modelo recibe un depth-warp del clip original, que aporta la geometría, y el clip original, que aporta la identidad y la apariencia. El warp se calcula con el nodo CrossViewWarp para ComfyUI a partir de una estimación de profundidad de MoGe. Durante el entrenamiento se usaron 719 escenas sintéticas renderizadas en Blender, las mismas que en la versión previa de esta idea para LTX 2.3. El adaptador tiene rango 32 con alpha 32 y se distribuye como un único fichero safetensors de aproximadamente 0,8 GB.

Es relevante ahora porque resuelve un problema de producción muy caro: reencuadrar o cambiar el movimiento de cámara de una toma ya rodada sin volver a rodarla. Al ser un LoRA, se puede aplicar sobre el modelo base sin reentrenar y se integra en flujos de ComfyUI, con un checkpoint liberado en el paso 3.500 de 6.000 y una licencia comunitaria heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el transformer de difusión del modelo base MiniMax-H3, rama ref2va |
| Parametros totales | no disponible (adaptador con rango 32 y alpha 32; el repositorio ocupa 0,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana temporal de entrenamiento de 73 fotogramas y de 124 fotogramas en los ejemplos publicados |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se cargó en precisión INT8 ConvRot durante el entrenamiento |
| Idiomas soportados | no aplica (modelo de generación de vídeo); no disponible |
| Licencia | MiniMax H3 Community License Agreement (identificador `minimax-h3-community-license`) |
| Formato de pesos | safetensors (fichero `MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1_3500.safetensors`) |
| Modelo base | MiniMaxAI/MiniMax-H3, checkpoint ref2va |
| Rango / alpha del LoRA | 32 / 32 |
| Paso de entrenamiento liberado | 3.500 de 6.000 |
| Palabra de activacion | `crossview` |
| Resolucion de entrenamiento | 512x512 con 73 fotogramas |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 152 descargas, 21 likes |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 insertado en el transformer de difusión del modelo base MiniMax-H3 en su variante ref2va (reference-to-video con audio). La estrategia de condicionamiento es de tipo Ref2VA con `aligned_guide_indices = [0]`, es decir, la guía geométrica se alinea con el primer fotograma de la secuencia. La entrada consta de dos flujos de vídeo sincronizados: el depth-warp procedente de CrossViewWarp (que transporta la geometría de la escena desplazada a la nueva cámara) y el clip original (que transporta identidad, textura e iluminación). La generación se controla con la palabra de activación `crossview` y admite además indicaciones textuales para describir el contenido de las zonas no visibles, marcadas en magenta en el warp.

El entrenamiento se realizó sobre un dataset de 719 escenas renderizadas en Blender, idéntico al empleado en la versión previa de la técnica para LTX 2.3. Se usó el framework musubi-tuner (fork AkaneTendo25, rama `minimax-h3`), optimizador adamw8bit con tasa de aprendizaje 1e-4, resolución 512x512, 73 fotogramas, batch 1 sin acumulación de gradientes y un total de 6.000 pasos programados. La infraestructura fue una NVIDIA RTX PRO 6000 Blackwell de 96 GB en RunPod, con un consumo medido de 20,35 segundos por paso y un pico de 38,4 GB de los 95,6 GB disponibles; el entrenamiento completo duró 33 horas y 55 minutos. Los ejemplos liberados se generaron con `res_multistep`, 8 pasos y el LoRA turbo DMD de 8 pasos, con sigma shift de 12 para vídeo y 3 para audio, y una intensidad de LoRA de 0,8.

## Capacidades

- Síntesis de vistas noveles sobre vídeo existente: genera la misma escena desde un punto de vista distinto a partir de desplazamientos de cámara en azimut y elevación.
- Reencuadre de cámara (re-camera) sobre metraje ya rodado o ya generado, sin necesidad de volver a grabar.
- Condicionamiento dual por geometría y apariencia: aprovecha la profundidad estimada con MoGe para preservar la estructura tridimensional de la escena.
- Control textual del contenido de las zonas ocluidas o no vistas, identificadas como regiones magenta en el mapa de warp.
- Integración nativa en ComfyUI mediante el nodo CrossViewWarp y los nodos MiniMax H3 Add Guide y MiniMax H3 Reference To Video.
- Compatibilidad con el LoRA turbo DMD de 8 pasos del modelo base, lo que reduce el coste de muestreo.
- Al ser un adaptador LoRA, se puede combinar con otros adaptadores del ecosistema MiniMax-H3, siempre que la VRAM lo permita.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni de audio específicas de este adaptador.

## Casos de uso

- Reencuadre en postproducción: aplicar un desplazamiento de cámara a una toma ya rodada para obtener un plano alternativo sin repetir el rodaje, usando el clip original como referencia de apariencia.
- Corrección de continuidad de eje: cuando una toma rompe la línea de cámara, el adaptador puede generar una versión coherente desde el punto de vista correcto conservando la identidad de los sujetos.
- Creación de planos B para tráilers y montajes: generar vistas laterales o elevadas de una misma escena para ampliar el material disponible a partir de un único plano.
- Previsualización de storyboard con cámara alternativa: en preproducción, generar rápidamente el aspecto de una escena desde varios ángulos a partir de una referencia renderizada o generada.
- Contenido para experiencias inmersivas y 6DoF: producir pares de vistas coherentes de la misma escena como material base para visores de realidad virtual o vídeo volumétrico ligero.
- Investigación en síntesis de vistas noveles: usar el adaptador como referencia reproducible sobre un modelo base abierto y un dataset de 719 escenas Blender para comparar estrategias de condicionamiento geométrico.
- Relleno de zonas no vistas en VFX: las regiones ocluidas que el warp marca en magenta pueden describirse por prompt, lo que permite completar el fondo de un plano con una indicación textual.
- Generación de variantes de plano para pruebas A/B de montaje: producir varias versiones del mismo plano con ángulos distintos y elegir la mejor en sala de edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad (PSNR, LPIPS, FVD ni similares) ni comparaciones numéricas con otros métodos de síntesis de vistas noveles. Los únicos datos de rendimiento disponibles son de entrenamiento: 20,35 segundos por paso, 33 horas y 55 minutos para 6.000 pasos programados, y un pico de memoria de 38,4 GB sobre una RTX PRO 6000 Blackwell de 96 GB.

## Requisitos de hardware

- Entrenamiento: se realizó en una NVIDIA RTX PRO 6000 Blackwell con 96 GB de VRAM, con un pico medido de 38,4 GB. No se documenta si el entrenamiento cabe en GPUs de 48 GB o 24 GB.
- Peso del adaptador: el repositorio completo ocupa 0,8 GB, por lo que el almacenamiento del LoRA no es un cuello de botella.
- VRAM de inferencia: no disponible. Depende por completo del checkpoint ref2va de MiniMax-H3, cuyas necesidades no se detallan en la información proporcionada.
- GPU recomendadas: no disponible más allá de la GPU usada para entrenar. No hay confirmación de que el flujo completo quepa en GPUs de consumo como la RTX 4090 o la RTX 5090.
- Configuración de inferencia de referencia: primera pasada a 0,5 MP en 16:9 y segunda pasada a 1,5 MP en 16:9, con 124 fotogramas, `res_multistep`, 8 pasos, sigma shift de 12 para vídeo y 3 para audio, e intensidad de LoRA de 0,8.
- Despliegue: ComfyUI con el nodo ComfyUI-CrossViewWarp, los nodos MiniMax H3 Add Guide y MiniMax H3 Reference To Video, y la inferencia de profundidad MoGe. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput de inferencia: no disponible. El único dato temporal publicado (20,35 s/paso) corresponde al entrenamiento, no a la generación.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1 | LoRA de síntesis de vistas noveles | MiniMax-H3, rama ref2va | 719 escenas Blender | MiniMax H3 Community License | Pública en HuggingFace, 152 descargas |
| Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2 | LoRA de síntesis de vistas noveles | LTX 2.3 de 22B | 719 escenas Blender (mismo dataset) | no disponible | Pública en HuggingFace |
| fal/MiniMax-H3-Realism-People-LoRA | LoRA de estilizado de realismo | MiniMax-H3 | no disponible | no disponible | Pública en HuggingFace |

La comparación cuantitativa de rendimiento entre estas alternativas no es posible con la información disponible: ninguna de las tres publica métricas de benchmarks ni cifras de parámetros del adaptador. La diferencia relevante y verificable es el modelo base sobre el que se monta cada una y el hecho de que las dos variantes CrossView-Warp comparten exactamente el mismo corpus de entrenamiento de 719 escenas Blender, lo que permite una comparación controlada del efecto del modelo base si se dispone de la misma GPU.

## Limitaciones y advertencias

- Sesgos derivados del dataset: el entrenamiento usa exclusivamente 719 escenas renderizadas en Blender, con modelos 3D CC-BY, HDRIs y texturas CC0 y captura de movimiento del CMU. Esto introduce una brecha de dominio clara frente a vídeo real capturado con cámara.
- Riesgo de artefactos en zonas ocluidas: las regiones no visibles desde el punto de vista original se marcan en magenta y su contenido se genera por inferencia. Es la parte más propensa a alucinaciones visuales y a incoherencias temporales.
- Dependencia de la calidad del depth-warp: si la estimación de profundidad de MoGe falla o el warp es impreciso, la geometría generada será incorrecta. El resultado está acoplado a la calidad de esa etapa previa.
- Rango de movimiento limitado: el adaptador responde a desplazamientos de azimut y elevación; no se documenta soporte para traslaciones arbitrarias, cambios de focal ni movimientos complejos de cámara.
- Checkpoint parcial: el fichero liberado corresponde al paso 3.500 de 6.000, es decir, a un modelo intermedio de un entrenamiento programado más largo.
- Intensidad de LoRA: se recomienda 0,8 y un rango de 0,8 a 1,0. Valores fuera de ese rango no están documentados.
- Requisitos de entrada: el warp y el clip de origen deben redimensionarse al mismo tamaño antes de entrar en los nodos, y la palabra de activación `crossview` es obligatoria.
- Restricciones de licencia: el adaptador es una obra derivada de MiniMax-H3 y se distribuye bajo la MiniMax H3 Community License Agreement. Las condiciones exactas de uso comercial deben consultarse en el fichero LICENSE del repositorio, ya que no se reproducen en la información disponible.
- Atribución obligatoria: los activos de terceros usados en los renders (modelos 3D CC-BY, HDRIs y texturas CC0, captura de movimiento del CMU) están listados en ATTRIBUTION.md y sus condiciones se aplican al material derivado.
- Sin métricas de calidad publicadas: no hay datos objetivos de fidelidad, coherencia temporal o similitud con la vista real, por lo que la evaluación depende enteramente de la inspección visual de los ejemplos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cseti/MiniMax-H3_Ref2VA-LoRA-CrossView-Warp_v1
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor: https://huggingface.co/Cseti
- Versión previa de la técnica para LTX 2.3: https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2
- Nodo ComfyUI-CrossViewWarp: https://github.com/cseti007/ComfyUI-CrossViewWarp
- Flujo de trabajo de ejemplo para ComfyUI: https://huggingface.co/datasets/Cseti/ComfyUI-Workflows/blob/main/minimax-h3/crossview-warp/README.md
- Fork de musubi-tuner usado en el entrenamiento: https://github.com/AkaneTendo25/musubi-tuner
- Vídeo de demostración del nodo CrossViewWarp: https://www.youtube.com/watch?v=7QAapT9xMgM
- Hilo de la comunidad sobre cambio de cámara en clips existentes: https://www.reddit.com/r/comfyui/comments/1wls47m/change_the_camera_movementangle_for_your_existing/
- LoRA de realismo alternativo sobre MiniMax-H3: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
