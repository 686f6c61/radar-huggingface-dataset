# chennana1028/fastwam-robotwin-openarm-sbint-step30000

## Resumen

FastWAM (RoboTwin init) × SBInt OpenArm es un modelo de política robótica para control bimanual, desarrollado por chennana1028 como fine-tuning del modelo FastWAM sobre el robot SBInt OpenArm de 16 grados de libertad (DoF). El modelo parte de un checkpoint de RoboTwin de 14 DoF y se entrena durante 20.000 pasos adicionales más una continuación de 30.000 pasos, alcanzando un total de 50.000 pasos de entrenamiento. Está publicado bajo licencia Apache 2.0 y se distribuye como un directorio `pretrained_model` de LeRobot, listo para cargar con la librería `lerobot`.

El modelo resuelve el problema de control de manipulación bimanual con articulaciones absolutas de 16 dimensiones, procesando imágenes de tres cámaras (superior, muñeca derecha e izquierda) a una resolución de 224×672 píxeles. Su relevancia radica en demostrar la adaptación de un modelo de acción mundial (world action model) a un robot específico mediante fine-tuning, logrando un error absoluto medio (MAE) de 0.0301 en evaluación open-loop, comparable a la referencia π₀.₅ (0.0303). El modelo requiere componentes externos como Wan2.2 VAE y UMT5, que se cargan desde el caché de Hugging Face en el momento de la inicialización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en FastWAM, con componentes Wan2.2 VAE y UMT5) |
| Parametros totales | 6.020.761.808 (~6,02 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna exacta de FastWAM no se detalla en la información proporcionada, pero se sabe que es un modelo de política para robótica que utiliza un codificador de imágenes basado en Wan2.2 VAE y un codificador de lenguaje/texto basado en UMT5, ambos cargados desde el caché de Hugging Face en tiempo de inicialización. El modelo opera sobre observaciones visuales de tres cámaras (top, right_wrist, left_wrist) concatenadas en anchura a 224×672 píxeles, y produce acciones de 16 dimensiones correspondientes a articulaciones absolutas del robot bimanual: brazo derecho (7), pinza derecha (1), brazo izquierdo (7) y pinza izquierda (1).

El entrenamiento se realizó en dos fases: primero un warm-start desde un checkpoint de RoboTwin de 14 DoF (entrenado 20.000 pasos), seguido de una continuación de 30.000 pasos específica para el SBInt OpenArm, totalizando 50.000 pasos. El checkpoint publicado corresponde al paso 30.000 de la segunda fase (job de entrenamiento `4371630`, checkpoint `030000`). No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de control robótico supervisado.

## Capacidades

- Control robótico bimanual: genera comandos de articulación absoluta de 16 dimensiones para un robot con dos brazos y dos pinzas.
- Percepción visual multi-cámara: procesa imágenes de tres cámaras (superior, muñeca derecha, muñeca izquierda) concatenadas en una sola entrada de 224×672.
- Adaptación a un robot específico: fine-tuning sobre el SBInt OpenArm, con empaquetado de articulaciones "derecha primero" (right-first packing).
- Integración con LeRobot: se carga mediante `get_policy_class("fastwam").from_pretrained()`, compatible con el ecosistema de LeRobot.
- Evaluación open-loop: métricas reportadas de MAE y seam ratio para control sin retroalimentación en bucle cerrado.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de política para control motor.

## Casos de uso

- Manipulación bimanual en entornos de laboratorio: el modelo puede controlar un robot SBInt OpenArm para tareas de pick-and-place, ensamblaje o manipulación de objetos que requieren coordinación de dos brazos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning en nuevos robots o tareas, gracias a su formato LeRobot y su licencia Apache 2.0.
- Evaluación de políticas en simulación: el checkpoint permite reproducir resultados open-loop (MAE 0.0301) en entornos simulados de RoboTwin, facilitando la comparación con otras políticas.
- Desarrollo de sistemas de control basados en visión: su entrada de tres cámaras a alta resolución (224×672) lo hace adecuado para tareas que requieren percepción espacial detallada.
- Benchmarking de modelos de acción mundial: al ser un fine-tuning de FastWAM, puede usarse para estudiar la transferencia de políticas entre robots con diferentes grados de libertad.
- Prototipado rápido en robótica educativa: investigadores y estudiantes pueden cargar el modelo con LeRobot y probarlo en hardware compatible sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

La model card reporta métricas de evaluación open-loop en el episodio 740 (ep740):

| Metrica | Valor |
|---|---|
| MAE (error absoluto medio) | 0.0301 |
| Referencia π₀.₅ | ≈ 0.0303 |
| Seam ratio | 5.55× |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible, ya que no es un modelo de lenguaje generalista.

## Requisitos de hardware

- VRAM estimada: al tener ~6,02 mil millones de parámetros en precisión FP16, la inferencia requiere al menos 12 GB de VRAM solo para los pesos del modelo principal. Además, los componentes externos (Wan2.2 VAE y UMT5) añaden memoria adicional, por lo que se recomienda un mínimo de 16-24 GB de VRAM total.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB) para mayor margen y velocidad.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo, aunque el uso simultáneo de VAE y UMT5 puede requerir optimizaciones de memoria.
- Opciones de despliegue: el modelo se integra con LeRobot; no se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se carga mediante la API de LeRobot (`from_pretrained`).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU y de la resolución de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas directas en la misma categoría (políticas robóticas bimanuales). Se menciona que no debe usarse `lerobot/fastwam_base` (diseñado para LIBERO con 7 DoF y efectores finales), pero no hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Especificidad del robot: el modelo está entrenado exclusivamente para el SBInt OpenArm con 16 DoF y articulaciones absolutas; no es directamente transferible a otros robots sin reentrenamiento.
- Dependencias externas: requiere Wan2.2 VAE y UMT5, que se cargan desde el caché de Hugging Face; si estos componentes no están disponibles, la inicialización fallará.
- Requiere GPU y caché de Hugging Face: la inferencia no funciona en CPU y necesita acceso a la red para descargar los componentes auxiliares la primera vez.
- Sin soporte para control en bucle cerrado: las métricas reportadas son open-loop; el rendimiento en bucle cerrado puede degradarse por acumulación de errores.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de control motor, estos conceptos no aplican directamente, pero no se han documentado riesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir con las atribuciones correspondientes y verificar que los componentes externos (Wan2.2 VAE, UMT5) tengan licencias compatibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chennana1028/fastwam-robotwin-openarm-sbint-step30000
- Código oficial de FastWAM (GitHub): https://github.com/yuantianyuan01/FastWAM
- Repositorio alternativo de FastWAM (GitHub): https://github.com/lightarmmy/fastwam-roboarena
- Documentación oficial de RoboTwin 2.0: https://robotwin-platform.github.io/doc/index.html
- Dataset RoboTwin 2.0 para FastWAM: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam
