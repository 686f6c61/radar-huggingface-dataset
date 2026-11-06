# OzzyGT/motionbricks_soma_custom_blocks

## Resumen

MotionBricks SOMA Custom Blocks es un conjunto de bloques modulares para la librería Diffusers que implementa el modelo MotionBricks de NVIDIA sobre el esqueleto SOMA. Su función es el *motion inbetweening*: dado un movimiento de partida (`context`) y un movimiento de llegada (`target`), genera en una única pasada hacia delante la transición entre ambos, sin bucle de muestreo. No acepta entrada de texto; trabaja exclusivamente con poses y elige por sí mismo la longitud de la transición.

El repositorio no contiene pesos: solo incluye el código de los bloques (adaptado del runtime oficial de NVlabs) y las instrucciones para cargar los pesos alojados en `OzzyGT/motionbricks_soma_diffusers`. Está pensado para integrarse en aplicaciones que ya usan Diffusers y necesitan empalmar clips de animación (por ejemplo, salidas de Kimodo SOMA Modular) de forma coherente.

Es relevante porque traslada un modelo de generación de movimiento de NVIDIA al ecosistema Diffusers con una API declarativa de bloques, y porque su coste de inferencia es muy bajo: unos 7,5 ms en float32 sobre una RTX 5090 con un pico de 0,8 GB de VRAM, lo que lo hace apto para prototipado interactivo de animación y robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de movimiento; los bloques son adaptaciones del runtime MotionBricks) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica en tokens de texto; lee las ultimas 4 poses de `context` y las primeras 1-4 poses de `target` |
| Tipos de cuantizacion | pesos en float32; soporta float16 (con deriva) y desaconseja bfloat16 |
| Idiomas soportados | ingles (metadatos); el modelo no procesa texto |
| Licencia | Apache-2.0 para los bloques; los pesos usan NVIDIA Open Model Agreement |
| Formato de pesos | los bloques no incluyen pesos; los pesos se cargan desde `OzzyGT/motionbricks_soma_diffusers` (formato no especificado en la informacion disponible) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de backbone, esquema de difusión). Lo que sí se documenta es su comportamiento: MotionBricks genera la transición entre dos movimientos en una sola pasada hacia delante, sin bucle de muestreo iterativo, y decide la longitud de la transición entre 6 y 16 tokens, donde `n` tokens producen `4 * n - 6` frames (de 18 a 58 frames). El modelo siempre lee las últimas 4 poses del `context` y las primeras `num_target_poses` poses del `target` para capturar la dinámica del cuerpo en ambos extremos.

Los bloques de este repositorio son una adaptación del runtime MotionBricks de NVlabs al sistema de pipelines modulares de Diffusers (requiere `diffusers>=0.41.0`, PyTorch y numpy). No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO. Los pesos originales de NVIDIA se distribuyen como grafo ONNX y la implementación en float32 reproduce dicho grafo con la configuración por defecto de PyTorch.

## Capacidades

- Generación de transiciones de movimiento (*inbetweening*) entre dos clips de animación esquelética.
- Elección automática de la longitud de la transición (18 a 58 frames, en pasos de 4).
- Colocación espacial del movimiento objetivo mediante `target_offset` (metros) y `target_turn` (grados).
- Corrección de extremos (`correct_endpoints`) para que la transición empiece y acabe exactamente en las poses dadas.
- Soporte de esqueletos SOMA30 y SOMA77 a 30 FPS; la salida es siempre SOMA30.
- Encadenamiento de transiciones largas realimentando la salida como nuevo `context`.
- Salida opcional del `target` ya colocado en escena (`output=["motion", "placed_target"]`) para unir los tres movimientos.
- No soporta texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Empalme de clips de animación: unir dos capturas o generaciones de Kimodo SOMA Modular (por ejemplo, el inicio de una carrera y una pose de pie colocada 1,4 m más adelante) generando la transición en una sola llamada.
- Animación de personajes en videojuegos: generar transiciones entre estados de locomoción (correr, parar, girar) con latencias de milisegundos y huella de VRAM mínima, adecuado para prototipado dentro del motor o de herramientas de autor.
- Previsualización en herramientas DCC: integrar los bloques en un pipeline de Blender o Maya basado en Python para previsualizar empalmes de movimiento sin salir del entorno.
- Robótica y simulación: construir secuencias de movimiento continuas para un agente simulado a partir de poses clave, aprovechando la colocación espacial (`target_offset`, `target_turn`) para encadenar tramos con desplazamiento.
- Generación de datos sintéticos de movimiento: producir transiciones etiquetadas entre clips para aumentar datasets de animación o entrenar modelos de control.
- Corrección de cortes en pipelines de captura de movimiento: suavizar la unión entre dos tomas con huecos o discontinuidades de pose, fijando los extremos con `correct_endpoints`.
- Prototipado interactivo en notebooks: al requerir solo `diffusers`, PyTorch y numpy, permite experimentar con transiciones en una GPU de consumo sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son operativos: una llamada tarda aproximadamente 7,5 ms en float32 sobre una RTX 5090 y alcanza un pico de 0,8 GB de VRAM. Con float16 el consumo de memoria se reduce a la mitad y la velocidad mejora ligeramente, con una deriva de unos 4 cm en la mediana de las articulaciones en una prueba de 8 transiciones (todas las longitudes coincidieron con float32).

## Requisitos de hardware

- VRAM estimada: 0,8 GB en float32; aproximadamente 0,4 GB en float16.
- GPU recomendadas: RTX 5090 (medición oficial); cualquier GPU CUDA con al menos 1-2 GB de VRAM libre debería bastar.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.).
- Despliegue: mediante `ModularPipelineBlocks` de Diffusers (`diffusers>=0.41.0`), con `trust_remote_code=True` y `trust_components_code=True`; para producción en tiempo real NVIDIA recomienda su runtime ONNX oficial (NVlabs/motionbricks).
- Latencia: ~7,5 ms por llamada en float32 sobre RTX 5090; el throughput no se documenta.
- Precisión: usar float32 para reproducir el grafo ONNX de NVIDIA; float16 como compromiso; evitar bfloat16 por la deriva acumulada al realimentar la salida.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Longitud de transicion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotionBricks SOMA Custom Blocks (este) | Bloques Diffusers sobre MotionBricks | Poses (sin texto) | 18-58 frames, elegida por el modelo | Apache-2.0 (bloques) / NVIDIA Open Model Agreement (pesos) | Hugging Face, requiere `trust_remote_code` |
| NVIDIA MotionBricks (runtime original) | Runtime ONNX | Poses | Igual (mismo modelo) | NVIDIA Open Model Agreement | GitHub NVlabs/motionbricks |
| Kimodo SOMA Modular | Generacion de movimiento | no disponible | no disponible | no disponible | Hugging Face (OzzyGT/Kimodo_SOMA_Modular) |

No se dispone de datos de benchmarks ni de otros modelos de *inbetweening* comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no acepta texto: solo genera transiciones entre poses proporcionadas.
- La salida es siempre SOMA30, aunque la entrada pueda ser SOMA77.
- La longitud de la transición está limitada a 18-58 frames; para transiciones más largas hay que encadenar llamadas realimentando la salida, lo que acumula deriva en float16.
- `trust_remote_code=True` y `trust_components_code=True` ejecutan código Python descargado del Hub; solo deben usarse con repositorios de confianza y revisando el código.
- Los pesos no están en este repositorio y se rigen por el NVIDIA Open Model Agreement, no por Apache-2.0; hay que verificar las condiciones de uso comercial en dicho acuerdo.
- En float16 se observa una deriva de unos 4 cm en las articulaciones; bfloat16 deriva mucho más y no se recomienda.
- Activar TF32 puede alterar algunos códigos de pose respecto al grafo ONNX de referencia.
- No hay información sobre sesgos del modelo, tasas de alucinación (en el sentido de poses no plausibles) ni evaluación cualitativa independiente.
- Para productos en tiempo real (juegos, robótica) NVIDIA recomienda su runtime ONNX en lugar de estos bloques.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria.

## Enlaces

- Repositorio de bloques: https://huggingface.co/OzzyGT/motionbricks_soma_custom_blocks
- Repositorio de código y pesos: https://huggingface.co/OzzyGT/motionbricks_soma_diffusers
- Modelo base: https://huggingface.co/nvidia/MotionBricks
- Runtime oficial de NVIDIA: https://github.com/NVlabs/motionbricks
- Kimodo SOMA Modular: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Dataset de ejemplos (clips NPZ): https://huggingface.co/datasets/OzzyGT/diffusers-examples
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
