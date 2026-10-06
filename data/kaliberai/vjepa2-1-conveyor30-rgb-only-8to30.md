# KaliberAI/vjepa2-1-conveyor30-rgb-only-8to30

## Resumen

V-JEPA 2.1 conveyor trajectory prediction (8 → 30) es un modelo de predicción de trayectorias 3D a partir exclusivamente de vídeo RGB, publicado por KaliberAI. Su tarea es observar ocho fotogramas consecutivos de una cinta transportadora y predecir los treinta estados siguientes de un objeto (una pelota amarilla de pickleball) en el marco de coordenadas calibrado de la cámara, cubriendo un segundo a 30 FPS. Los canales predichos son posición y velocidad tridimensionales: `(X, Y, Z, vX, vY, vZ)`.

El sistema es un cuello de botella de estado visual. Un encoder V-JEPA 2.1 ViT-B congelado extrae características espacio-temporales por parche; un estimador aprendido reconstruye los ocho estados pasados y un decodificador transformer independiente proyecta los treinta estados futuros. Un adaptador temporal aprendido ajusta únicamente `Z` y `vZ`. Las anotaciones 3D pasadas se emplean como supervisión de entrenamiento, nunca como entrada de inferencia, y el pronóstico no utiliza ninguna integración física (*physics rollout*).

La relevancia del modelo radica en que demuestra predicción de movimiento 3D sin entrada de profundidad ni estado previo conocido, apoyándose en un backbone auto-supervisado de vídeo. Es un lanzamiento muy acotado: entrenado para una única cámara (`46000830`), sin garantías de transferencia a otras cámaras, colores de objeto u objetos distintos, y con 0 descargas y 0 valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder V-JEPA 2.1 ViT-B congelado + estimador de estado visual + decodificador transformer (3 capas) + adaptador temporal |
| Parametros totales | no disponible (los pesos del backbone congelado no se incluyen en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrada de 8 fotogramas RGB consecutivos; salida de 30 estados futuros (1 segundo a 30 FPS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`base/best.pt` y `adapter/best.pt`), cargados con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo combina varios componentes entrenados por etapas. El encoder es un V-JEPA 2.1 ViT-B destilado y congelado que aporta características espaciales y temporales por parche. El estimador visual conserva cuatro *bins* temporales de tokens espaciales de 16×16, los proyecta a 192 dimensiones y emplea ocho *time queries* aprendidas para reconstruir el movimiento observado y estimar los ocho estados `(X, Y, Z, vX, vY, vZ)` pasados. El decodificador de futuro tiene estados ocultos de 256 dimensiones y tres capas, y predice los treinta estados siguientes. Un adaptador temporal, entrenado con el modelo base congelado, ajusta solo `Z` y `vZ`. No hay integración física en el pronóstico.

El entrenamiento se realizó sobre grabaciones privadas de pelotas de pickleball amarillas, con cintas en movimiento y detenidas, usando el split original de las grabaciones fuente: 10.004 ventanas de entrenamiento, 1.907 de validación y 2.047 de prueba. La estimación del estado pasado y el decodificador de futuro se entrenaron en fases separadas y después se entrenó el adaptador vertical. Las coordenadas están en el marco mundial calibrado del conjunto de datos, con posiciones en metros y velocidades en metros por segundo. El mapeo de coordenadas métricas se aprende para una cámara fija concreta (`46000830`); que la entrada sea solo RGB no implica invariancia de cámara.

## Capacidades

- Predicción de trayectoria 3D a partir de vídeo RGB puro, sin entrada de profundidad ni de estado previo.
- Estimación de la historia de movimiento observada: ocho estados pasados `(X, Y, Z, vX, vY, vZ)`.
- Pronóstico de treinta estados futuros (posición y velocidad) que cubren un segundo a 30 FPS.
- Ajuste específico de la dinámica vertical (`Z` y `vZ`) mediante un adaptador temporal dedicado.
- Inferencia sin caché de características V-JEPA ni anotaciones: las características se recalculan desde el RGB.
- API de inferencia expuesta como `visual_states30.inference.RGBPredictor.predict(rgb_frames)` para tensores `uint8` RGB `[8, H, W, 3]`.
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Predicción de trayectoria en cintas transportadoras industriales: el modelo anticipa un segundo de movimiento 3D de un objeto sobre la cinta, útil para sincronizar actuadores o brazos de recogida con la posición futura.
- Seguimiento de objetos en líneas de clasificación: con ocho fotogramas RGB se obtiene la posición futura esperada, lo que permite detectar desviaciones respecto a la trayectoria nominal.
- Detección temprana de eventos verticales: el adaptador de `Z`/`vZ` permite anticipar rebotes o cambios de altura, aunque el autor advierte que el conjunto de validación original contiene pocos rebotes claros.
- Automatización robótica de recogida (*pick-and-place*): la predicción de estado a 30 FPS puede alimentar una política de control que compense la latencia del sistema.
- Investigación en modelos de mundo para vídeo: sirve como referencia de cómo convertir características de V-JEPA 2.1 en predicción de estado físico sin *rollout*.
- Monitorización de calidad en entornos controlados: comparar la `baseline` incluida en la salida con la predicción adaptada permite estudiar el efecto del adaptador en la dinámica vertical.
- Evaluación de transferencia de representaciones auto-supervisadas: permite medir hasta qué punto las características del backbone V-JEPA bastan para tareas de predicción métrica en un dominio concreto.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a las 1.907 ventanas originales de validación, con el checkpoint del adaptador seleccionado:

| Metrica | Resultado |
|---|---:|
| Error medio de desplazamiento 3D (ADE) | 2,5215 cm |
| Error de la ultima posicion futura valida | 3,8278 cm |
| ADE horizontal en XY | 2,4790 cm |
| Error absoluto medio en Z | 0,2464 cm |
| Error L2 de velocidad | 0,05890 m/s |
| Posiciones futuras validas dentro de 5 cm | 87,79% |

El modelo base sin adaptador alcanza 2,5092 cm de ADE sobre el mismo conjunto de validación. Según el autor, el adaptador mejora algunas medidas de eventos verticales seleccionadas pero empeora ligeramente el ADE agregado.

## Requisitos de hardware

- La receta de inferencia probada por el autor requiere una GPU CUDA; la inferencia en CPU no está validada.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el autor solo indica que se necesita CUDA.
- ¿Cabe en GPU de consumo?: no disponible (no se especifica el consumo de memoria del pipeline completo).
- Opciones de despliegue: uso directo mediante el paquete `visual_states30` del repositorio de GitHub enlazado (`python -m visual_states30 predict`), o la API `RGBPredictor.predict(rgb_frames)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- El backbone congelado debe descargarse aparte con `python -m visual_states30 download-backbone` desde el checkpoint oficial de V-JEPA 2.1 ViT-B destilado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto de entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaliberAI vjepa2-1-conveyor30-rgb-only-8to30 | V-JEPA 2.1 ViT-B congelado + decodificador transformer | 8 fotogramas RGB | 30 estados 3D `(X,Y,Z,vX,vY,vZ)` | no disponible | Repositorio de HuggingFace (0 descargas) |
| Modelo base sin adaptador (misma familia) | Mismo pipeline sin adaptador temporal | 8 fotogramas RGB | 30 estados 3D | no disponible | Incluido en el mismo repositorio |
| Alternativas publicas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de predicción de trayectoria comparables dentro del material proporcionado.

## Limitaciones y advertencias

- Entrenado para una única cámara (`46000830`): el mapeo de coordenadas del marco mundial es específico y no se debe asumir que transfiera a otras cámaras.
- No validado en otros colores de objeto, en huevos ni en colisiones con múltiples objetos.
- El conjunto de validación original contiene pocos eventos de rebote claros, por lo que el comportamiento en dinámica vertical con rebotes está poco caracterizado.
- El adaptador temporal mejora algunas medidas verticales pero empeora ligeramente el ADE agregado (2,5215 cm frente a 2,5092 cm del modelo base).
- No hay datos sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución más allá de lo indicado.
- Licencia no disponible: el autor indica que el código, el backbone y el conjunto de datos pueden tener términos separados y que la model card no concede derechos para redistribuir esos activos.
- Los archivos son archivos `.pt` de PyTorch; se recomienda cargarlos solo desde fuentes de confianza, con `weights_only=True` y verificando los hashes SHA-256 indicados.
- La inferencia requiere GPU CUDA según la receta probada.
- Los vídeos y anotaciones de entrenamiento son privados y no se incluyen; el acceso al repositorio de GitHub puede gestionarse por separado.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KaliberAI/vjepa2-1-conveyor30-rgb-only-8to30
- Rama de implementación en GitHub: https://github.com/Movendi-ai/vjepa-trajectory-prediction/tree/vjepa-only-ctx8-out30 (commit `d76a31fad1c5fb787ef9c50ea82d3ea195140cc5`)
- Checkpoint oficial del backbone V-JEPA 2.1 ViT-B destilado: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt (SHA-256 esperado `848a77c33cc9e6649ed2119c9bea1e2c569bcdab9539ff3e7c02ccc2959ddf4d`)
- Pesos `base/best.pt` (SHA-256 `84bf390aa9ce8085c14d8e41b9f34cf2833f345dc8d2b6729308592b819c814b`)
- Pesos `adapter/best.pt` (SHA-256 `7709679eec285c69ec86ce8121ac6e1c2f0d544bcba763919827c03198074732`)
