# Sinadavinc80/LTX-2.3-22b-IC-LoRA-Motion-Track-Control

## Resumen

LTX-2.3 22B IC-LoRA Motion Track Control es un adaptador LoRA de tipo in-context (IC-LoRA) publicado por el usuario Sinadavinc80 sobre el modelo fundacional de vídeo LTX-2.3 de Lightricks. Su función es añadir control explícito de movimiento a la generación de vídeo: el usuario aporta un vídeo de referencia con trayectorias (splines de colores) que indican la ruta deseada de objetos o regiones, y el modelo genera un vídeo que sigue esas trayectorias. Se trata de un control fino de vídeo-a-vídeo sobre un modelo base texto-a-vídeo, no de un modelo autónomo.

El adaptador pesa 0,3 GB y se distribuye como un único fichero `safetensors` con factor de downscale de referencia 0.5 (la resolución del vídeo de referencia es la mitad de la resolución de salida). Está pensado para integrarse en ComfyUI mediante los nodos oficiales del repositorio LTXVideo, lo que lo hace útil para pipelines de producción de vídeo generativo con control de movimiento, un caso de uso que hasta ahora requería herramientas de tracking externas combinadas con generación.

La relevancia actual radica en que el control de movimiento mediante trayectorias dispersas es una de las demandas más habituales en producción audiovisual generativa, y este IC-LoRA lo incorpora directamente en el espacio latente del modelo base sin reentrenar el modelo completo. El modelo base LTX-2.3 es un modelo conjunto audio-visual, por lo que el adaptador hereda esa capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA (adaptador de bajo rango in-context) sobre LTX-2.3-22b (transformer de difusión vídeo/audio) |
| Parametros totales | no disponible (el adaptador pesa 0,3 GB; el modelo base tiene 22B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | ltx-2-community-license (other) |
| Formato de pesos | safetensors (`ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un IC-LoRA, es decir, un LoRA de bajo rango que condiciona la generación del modelo base en tiempo de inferencia mediante fotogramas de un vídeo de referencia alineados posicionalmente con el vídeo generado. El mecanismo in-context permite introducir una señal de control (en este caso, un vídeo con splines de colores que marcan trayectorias de movimiento) como contexto adicional, de modo que el modelo base texto-a-vídeo genera una secuencia que respeta esas trayectorias. El factor de downscale de referencia es 2, lo que significa que el vídeo de referencia se procesa a 0,5x de la resolución de salida para reducir el coste en tokens.

El entrenamiento se realizó sobre un dataset propietario no especificado, usando la infraestructura LTX-2 Community Trainer, según la model card. El adaptador se apoya en el paper AVControl (arXiv:2603.24793) para el marco de entrenamiento de controles audio-visuales y en el paper de LTX-2 (arXiv:2601.03233) para el modelo fundacional. No se detallan número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; esa información no está disponible.

## Capacidades

- Control de movimiento mediante trayectorias dispersas: el usuario aporta un vídeo de referencia con splines de colores y el modelo genera un vídeo que sigue esas rutas.
- Generación vídeo-a-vídeo con condicionamiento in-context sobre el modelo base LTX-2.3.
- Soporte de imagen inicial para image-to-video, heredado del modelo base.
- Generación audio-visual conjunta, heredada de LTX-2.3.
- Extracción de trayectorias desde vídeos existentes mediante métodos de point tracking como SpatialTrackerV2, o dibujo manual mediante el nodo de trayectorias de ComfyUI.
- Integración con ComfyUI mediante los nodos `LTXICLoRALoaderModelOnly` y `LTXAddVideoICLoRAGuide`.
- Idioma: inglés (etiqueta `en`); no se declaran otras lenguas.

## Casos de uso

- Postproducción con control de movimiento: dado un vídeo rodado, extraer trayectorias con SpatialTrackerV2 y regenerar la secuencia con el movimiento de cámara u objetos corregido, usando el IC-LoRA para imponer las trayectorias deseadas.
- Animación de personajes o productos: dibujar manualmente splines en ComfyUI para guiar el desplazamiento de un objeto en un vídeo generado, útil en publicidad y motion graphics.
- Sustitución de elementos en vídeo existente: usar el vídeo original como referencia de control y regenerar con otro estilo o contenido manteniendo la trayectoria de movimiento de los sujetos.
- Prototipado rápido de secuencias con cámara virtual: definir trayectorias de cámara con splines y generar planos con movimiento controlado sin rodaje.
- Generación de vídeo con audio sincronizado: aprovechar la naturaleza audio-visual del modelo base LTX-2.3 para producir clips con sonido y movimiento guiado por trayectorias.
- Pipelines de datos sintéticos para visión por computador: generar secuencias con trayectorias de objetos conocidas y ground truth de movimiento para entrenar modelos de tracking o detección.
- Iteración creativa en ComfyUI: cargar el flujo de ejemplo oficial (`LTX-2.3_ICLoRA_Motion_Track_Distilled.json`) y ajustar trayectorias de forma interactiva dentro del grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB, pero requiere cargar el modelo base LTX-2.3-22b para funcionar; los requisitos reales vienen determinados por el modelo base.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; con 22B parámetros, la inferencia en precisión completa exige GPUs de clase profesional (A100/H100) o cuantización agresiva.
- GPU recomendadas: no disponible de forma específica para este adaptador; por tamaño del modelo base, se orienta a A100, H100 o GPUs de 24 GB o más con cuantización.
- Despliegue: ComfyUI con los nodos de LTXVideo (flujo oficial de IC-LoRA); otros backends no documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Control de movimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LTX-2.3 22B IC-LoRA Motion Track Control | IC-LoRA sobre LTX-2.3 | adaptador 0,3 GB sobre base 22B | no disponible | Sí, trayectorias dispersas | ltx-2-community-license | Hugging Face (0 descargas, 0 likes) |
| LTX-2.3 (base) | Modelo fundacional vídeo/audio | 22B | no disponible | No nativo | ltx-2-community-license | Hugging Face (Lightricks) |
| Otros IC-LoRA de LTX-2.3 | Adaptadores in-context | variable | no disponible | Según adaptador | ltx-2-community-license | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el modelo base LTX-2.3-22b no es funcional.
- Requiere un vídeo de referencia con splines alineado posicionalmente con la salida; un desalineamiento o trayectorias mal dibujadas degradan el resultado.
- El factor de downscale de referencia es 0.5; usar una resolución de referencia distinta a la esperada puede romper el condicionamiento.
- Solo declara soporte de inglés; el comportamiento en otros idiomas no está documentado.
- Dataset de entrenamiento propietario y no descrito: no es posible evaluar sesgos de los datos ni cobertura de dominios.
- Licencia `ltx-2-community-license` con términos específicos; es necesario revisar el enlace de licencia antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de robustez en producción.
- Riesgo de alucinación visual y de artefactos en regiones con movimiento rápido o trayectorias que se cruzan, aunque no se documenta explícitamente.
- Dependencia de ComfyUI y de los nodos oficiales de LTXVideo para el flujo recomendado; otros entornos no están soportados en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/Sinadavinc80/LTX-2.3-22b-IC-LoRA-Motion-Track-Control
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Paper AVControl: https://huggingface.co/papers/2603.24793
- Paper LTX-2: https://huggingface.co/papers/2601.03233
- Código: https://github.com/Lightricks/LTX-2
- Página del proyecto AVControl: https://matanby.github.io/AVControl/
- Repositorio ComfyUI-LTXVideo: https://github.com/Lightricks/ComfyUI-LTXVideo/
- Flujo de ejemplo IC-LoRA Motion Track: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/2.3/LTX-2.3_ICLoRA_Motion_Track_Distilled.json
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
