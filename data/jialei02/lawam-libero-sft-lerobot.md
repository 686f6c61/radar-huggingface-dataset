# jialei02/lawam-libero-sft-lerobot

## Resumen

LaWAM (Latent World Action Models) es un modelo de política robótica (VLA, Vision-Language-Action) desarrollado por un equipo de investigadores de RLinf, cuyo checkpoint principal se publica en Hugging Face bajo el identificador `jialei02/lawam-libero-sft-lerobot`. El modelo introduce un mecanismo de modelo de mundo latente que predice subobjetivos visuales en el espacio latente de codificadores visuales preentrenados como DINOv3, evitando la síntesis de futuros en píxeles. Esto reduce la latencia y el coste computacional frente a enfoques basados en predicción de vídeo o imágenes futuras, manteniendo el control condicionado al futuro.

La política se basa en el VLM `Qwen/Qwen3-VL-2B-Instruct` como codificador visual-ligüístico, y el checkpoint liberado contiene 2.555.179.360 parámetros en formato safetensors, empaquetado como checkpoint nativo de LeRobot. El modelo se ha evaluado en las cuatro suites de LIBERO con una tasa de éxito global del 98,5% sobre 2.000 episodios, lo que lo sitúa entre las políticas VLA más precisas en este benchmark. Su relevancia actual radica en que demuestra que es posible incorporar predicción de dinámica en políticas robóticas sin el coste de generar futuros en píxeles, una limitación clave de los World-Action Models previos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaWAM (Latent World Action Model) sobre Qwen3-VL-2B-Instruct |
| Parametros totales | 2.555.179.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint nativo de LeRobot) |

## Arquitectura y entrenamiento

LaWAM sigue un esquema de dos etapas. En la primera, se entrena un modelo de mundo latente (LaWM) que aprende a predecir subobjetivos visuales en el espacio latente de un codificador visual preentrenado (DINOv3), condicionado a las acciones del robot. En la segunda, se entrena la política VLA que, dada una observación actual y una instrucción en lenguaje natural, genera un chunk de acciones; el decodificador forward del modelo de acciones latentes se reutiliza como LaWM para expandir las acciones latentes predichas en subobjetivos visuales anclados al embodiment. Este diseño evita la reconstrucción de futuros en píxeles, reduciendo la latencia y la carga computacional.

El checkpoint liberado corresponde a un entrenamiento por supervisión directa (SFT, Supervised Fine-Tuning) sobre las cuatro suites de LIBERO (spatial, object, goal y 10), con 10 tareas por suite y 50 episodios por tarea para evaluación. El repositorio incluye las pipelines completas de preprocesado de LIBERO y postprocesado de acciones, junto con los tensores de normalización publicados. La conversión al formato LeRobot verificó las sumas SHA-256 del checkpoint fuente, la configuración, las estadísticas del dataset y el modelo Qwen, y una prueba de inferencia de un episodio en `libero_spatial` completó correctamente el flujo estándar de `lerobot-eval`.

## Capacidades

- Generación de acciones robóticas (política VLA) condicionadas a observaciones visuales e instrucciones en lenguaje natural.
- Predicción de subobjetivos visuales en espacio latente (modelo de mundo latente), sin reconstrucción de píxeles.
- Generación de chunks de acciones (action chunking) para control robótico de baja latencia.
- Integración nativa con LeRobot: carga directa mediante `LaWAMPolicy.from_pretrained()`.
- Soporte de evaluación reproducible en LIBERO con MuJoCo 3.3.2 (se requiere esta versión para replicar los resultados exactos).
- Uso de Qwen3-VL-2B-Instruct como base VLM, descargado automáticamente si no se sobrescribe `base_vlm_path`.

## Casos de uso

- Manipulación robótica en entornos simulados: el modelo puede ejecutar tareas de las suites LIBERO (espaciales, con objetos, orientadas a objetivos y de larga duración) con una tasa de éxito superior al 98%, lo que lo hace adecuado para investigación en aprendizaje por imitación y evaluación de políticas.
- Desarrollo de políticas VLA eficientes: su diseño de modelo de mundo latente reduce la latencia frente a enfoques de predicción de vídeo, permitiendo su uso en entornos donde el tiempo de inferencia es crítico.
- Benchmarking de políticas robóticas: al estar disponible en formato LeRobot, puede integrarse directamente en pipelines de evaluación estándar como `lerobot-eval`, facilitando comparaciones justas con otras políticas.
- Investigación en modelos de mundo para robótica: el checkpoint liberado permite estudiar cómo la predicción de subobjetivos latentes afecta al rendimiento en tareas de largo horizonte, sin necesidad de entrenar desde cero.
- Prototipado rápido en robótica: la integración con LeRobot y la carga mediante `from_pretrained` reducen el esfuerzo de configuración, permitiendo probar la política en simuladores compatibles con MuJoCo en pocas líneas de código.
- Educación y formación en VLA: al ser un modelo de tamaño moderado (2,5B parámetros) con licencia MIT, puede utilizarse en cursos y talleres sobre aprendizaje por imitación y políticas visuales-ligüísticas-acciones.

## Benchmarks y rendimiento

El checkpoint fue evaluado en las cuatro suites de LIBERO con 10 tareas por suite y 50 episodios por tarea, utilizando MuJoCo 3.3.2. Los resultados publicados son:

| Suite | Éxitos | Episodios | Tasa de éxito |
| --- | ---: | ---: | ---: |
| `libero_spatial` | 492 | 500 | 98,4% |
| `libero_object` | 498 | 500 | 99,6% |
| `libero_goal` | 490 | 500 | 98,0% |
| `libero_10` | 490 | 500 | 98,0% |
| **Global** | **1970** | **2000** | **98,5%** |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los autores advierten que los resultados son sensibles a la versión de MuJoCo: versiones más recientes pueden reducir las tasas de éxito medidas, tanto para LaWAM como para otras políticas, por problemas de compatibilidad del entorno de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada. Dado que el modelo tiene 2.555 millones de parámetros, una estimación razonable para inferencia en FP32 sería de unos 10-12 GB, y con cuantización a 8 bits podría reducirse a unos 5-6 GB, pero estos valores no han sido confirmados por los autores.
- GPU recomendadas: no disponible. Por el tamaño del modelo, GPUs con al menos 16 GB de VRAM (como RTX 4090, A100 40GB) serían adecuadas para inferencia sin cuantización.
- Compatibilidad con GPU de consumo: probablemente sí en GPUs con 16 GB o más, aunque no se ha confirmado oficialmente.
- Opciones de despliegue: LeRobot (carga nativa mediante `LaWAMPolicy`), con soporte para el flujo `lerobot-eval`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El diseño de modelo de mundo latente sugiere una latencia menor que los enfoques de predicción de vídeo, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos VLA en la información proporcionada. Modelos comparables en la categoría de políticas VLA para LIBERO podrían ser OpenVLA, RT-2 o π0, pero no se han encontrado datos de comparación directa con LaWAM en las fuentes consultadas. La información disponible no permite establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Los resultados de LIBERO son sensibles a la versión de MuJoCo: se requiere MuJoCo 3.3.2 para reproducir exactamente las tasas de éxito publicadas. Versiones más recientes pueden dar resultados inferiores por incompatibilidad del entorno, no por un defecto del checkpoint.
- La integración con LeRobot requiere la versión que incluya el PR #3999 o una posterior; versiones anteriores no podrán cargar el modelo.
- El modelo se ha evaluado únicamente en LIBERO (entornos simulados). No hay evidencia publicada de su rendimiento en robots físicos reales.
- No se proporciona información sobre sesgos, riesgos de alucinación o limitaciones de idioma. Al estar basado en Qwen3-VL-2B-Instruct, podría heredar sesgos del modelo base, pero no se ha documentado.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los componentes subyacentes (Qwen3-VL-2B-Instruct, DINOv3, MuJoCo) tienen licencias compatibles con su caso de uso.
- El tamaño del repositorio es de 7,2 GB, lo que puede suponer un coste de descarga y almacenamiento relevante en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jialei02/lawam-libero-sft-lerobot
- Checkpoint original (formato PyTorch): https://huggingface.co/jialei02/lawam_libero_sft_release
- Paper (arXiv): https://arxiv.org/html/2606.15768
- Página del proyecto: https://rlinf.github.io/LaWAM/
- Código fuente: https://github.com/RLinf/LaWAM
- PR de integración en LeRobot: https://github.com/huggingface/lerobot/pull/3999
