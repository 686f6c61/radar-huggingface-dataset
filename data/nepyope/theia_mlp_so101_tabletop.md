# nepyope/theia_mlp_so101_tabletop

## Resumen

`theia_mlp_so101_tabletop` es una política robótica de manipulación entrenada para el brazo SO-101 en un entorno de mesa simulado con MuJoCo-Warp. La desarrolla el usuario de Hugging Face `nepyope` y se publica bajo licencia Apache 2.0 dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de comportamiento (policy) que mapea observaciones visuales y proprioceptivas a consignas de articulaciones, con 6.971.264 parámetros (unos 7 M) y un peso de repositorio de 0,2 GB.

La arquitectura combina un ViT congelado (Theia-Tiny) para extraer características de dos cámaras (frontal y de muñeca), un mecanismo de *attention pooling* y una cabeza MLP que predice *chunks* de acciones de longitud 30, de los cuales se ejecutan 10 por paso. El modelo recibe imágenes RGB de 480x640 (redimensionadas internamente a 224x224) y un vector de estado de 6 dimensiones (cinco articulaciones en grados y apertura de pinza de 0 a 100), y emite 6 objetivos absolutos de articulación a 30 fps.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de imitación en simulación (datos de experto scriptado, entrenamiento con LeRobot y evaluación en el mismo simulador). Los resultados publicados son modestos: en 32 episodios de evaluación, la mejor revisión (30k pasos) logra 1 éxito completo y coloca al menos un cubo en 16 de 32 episodios, con una media de 0,94 cubos de 4. No hay aleatorización visual de dominio, por lo que el autor advierte explícitamente que no cabe esperar transferencia a cámaras reales sin trabajo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT congelado (Theia-Tiny) + attention pooling + cabeza MLP; política de imitación con action chunking (chunk 30, ejecuta 10) |
| Parametros totales | 6.971.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica; ventana de observación de un paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (el texto de tarea se ignora; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La política `theia_mlp` usa un ViT Theia-Tiny congelado como extractor de características visuales sobre dos flujos de imagen (`observation.images.front` y `observation.images.wrist`, 480x640 RGB reducidas a 224x224). Sobre esas características aplica *attention pooling* y una cabeza MLP que produce un *chunk* de 30 acciones; en ejecución se aplican las 10 primeras, técnica habitual de action chunking para reducir el error de compounding. La salida son 6 objetivos absolutos de articulación (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll en grados y pinza en escala 0-100), coherentes con las unidades de `so101_follower` con `use_degrees=True`, a 30 fps.

El entrenamiento se realizó durante 30.000 pasos con batch de 64 y learning rate 1e-4 sobre 300 episodios de experto scriptado (155.000 fotogramas) grabados en el espacio `lerobot/so101-tabletop-mjwarp` en la revisión `cd6bd68`. No se aplicó aleatorización visual de dominio: escena, iluminación, poses de cámara y color del brazo son fijos. El texto de tarea ("Put all the cubes in the green box.") se ignora por completo, de modo que el modelo no es condicionable por instrucción. El código de la política vive en la rama `feat/theia-mlp-policy` del repositorio `nepyope/lerobot`.

## Capacidades

- Manipulación robótica de tipo *pick-and-place* sobre cubos en un entorno de mesa simulado (SO-101, MuJoCo-Warp).
- Fusión de dos vistas de cámara (frontal y de muñeca) con estado proprioceptivo de 6 dimensiones.
- Predicción de acciones en *chunks* de 30 pasos con ejecución de 10, lo que aporta cierta suavidad temporal.
- Control absoluto de articulaciones en grados y pinza en escala 0-100, directamente compatible con `so101_follower`.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni diálogo.
- No procesa lenguaje: el campo de tarea se ignora.
- Sin capacidades multilingües, de visión general, audio ni modo *thinking*.

## Casos de uso

- Reproducción de un pipeline de imitación en simulación: sirve como punto de partida para validar el flujo LeRobot (grabación de episodios, entrenamiento, evaluación) antes de invertir en datos reales.
- *Baseline* de referencia para políticas de manipulación en SO-101: al publicar curvas por revisión (5k, 10k, 20k, 30k), permite comparar técnicas de *chunking*, *pooling* o extractores visuales sobre el mismo conjunto de datos.
- Investigación en *action chunking*: el modelo permite estudiar el efecto de la longitud de *chunk* (30 predichos, 10 ejecutados) en la tasa de éxito y en la suavidad del movimiento dentro de MuJoCo-Warp.
- Docencia y prototipado en robótica: con ~7 M de parámetros y 0,2 GB de pesos, se puede cargar y ejecutar en un portátil con GPU modesta para demostrar conceptos de *behavior cloning*.
- Evaluación comparativa de extractores visuales congelados: al usar Theia-Tiny sin *fine-tuning*, sirve para medir cuánto rinde un ViT pequeño en tareas de manipulación con datos limitados.
- Generación de datos sintéticos y aumento: sus rollouts en el simulador pueden emplearse para estudiar fallos (por ejemplo, colocación parcial de cubos) y diseñar mejores expertos scriptados o recompensas.
- Pruebas de integración de LeRobot: validar la carga con `TheiaMLPPolicy.from_pretrained` y revisiones concretas (`revision="020000"`) en pipelines de CI internos.

## Benchmarks y rendimiento

Evaluación en el mismo simulador (32 episodios, 1200 pasos, semilla 1000), según la model card:

| Revision | Exito completo | Episodios con >= 1 cubo colocado | Media de cubos colocados (de 4) |
|---|---|---|---|
| `005000` | 0/32 | 7/32 | 0,28 |
| `010000` | 0/32 | 13/32 | 0,88 |
| `020000` | 1/32 | 9/32 | 0,72 |
| `030000` | 1/32 | 16/32 | 0,94 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otras políticas en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~7 M de parámetros más los buffers de activación del ViT Theia-Tiny a 224x224; en la práctica, cualquier GPU con 2-4 GB libres es suficiente.
- GPU recomendadas: no requiere GPU de datacenter; funciona en RTX 3060, RTX 4060, RTX 4090 o incluso en CPU para inferencia a baja frecuencia. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 30k pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de consumo.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot.policies.theia_mlp.modeling_theia_mlp.TheiaMLPPolicy.from_pretrained`). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el control opera a 30 fps en el simulador, lo que fija un presupuesto de 33 ms por paso de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nepyope/theia_mlp_so101_tabletop` | 6,97 M | 2 camaras 480x640 + estado 6D | SO-101 en MuJoCo-Warp | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot para SO-101 | no disponible | camaras + estado | SO-101 (sim y real) | normalmente Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | camaras + estado | brazos tipo SO-100/101 | normalmente Apache 2.0 | Hugging Face / LeRobot |
| OpenVLA | ~7 B | imagen + instruccion en lenguaje | brazos tipo WidowX/Franka | licencia propia (no Apache) | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estas políticas en el mismo conjunto de datos, por lo que la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin aleatorización visual de dominio: escena, iluminación, poses de cámara y color del brazo son fijos; el autor advierte que no cabe esperar transferencia a cámaras reales sin trabajo adicional.
- Rendimiento bajo incluso en el simulador de origen: 1 éxito completo en 32 episodios en la mejor revisión y una media de 0,94 cubos de 4.
- El texto de tarea se ignora: no es posible condicionar el comportamiento por instrucción ni reutilizarlo para otras tareas sin reentrenar.
- Riesgo de sobreajuste al experto scriptado y al conjunto `maximellerbach/so101-fineart-mixed-v1`; no se documentan evaluaciones fuera de distribución.
- No hay información sobre sesgos (en el sentido de comportamiento sesgado hacia posiciones o colores concretos) más allá de la ausencia de aleatorización.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de un ViT Theia-Tiny congelado cuyos términos de uso conviene verificar por separado.
- Sin soporte de lenguaje, agentes ni *tool calling*: no debe presentarse como modelo de propósito general.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el 25 de noviembre de 2026; no hay evidencia de uso externo ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nepyope/theia_mlp_so101_tabletop
- Espacio del simulador SO-101 tabletop (MuJoCo-Warp): https://huggingface.co/spaces/lerobot/so101-tabletop-mjwarp
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/maximellerbach/so101-fineart-mixed-v1
- Repositorio de código de la política (rama `feat/theia-mlp-policy`): https://github.com/nepyope/lerobot/tree/feat/theia-mlp-policy
- LeRobot (librería base): https://github.com/huggingface/lerobot
