# seungkukim/dexjoco_bimanual_multitask_baseline_joint_wan22ti2v5b_L18_txtcache-60k

## Resumen

Este modelo es un checkpoint de robótica basado en la arquitectura DiT4DiT, desarrollado por seungkukim como parte de la familia DexJoCo. Combina un backbone de video-difusión Wan2.2-TI2V-5B (modelo de difusión de transformadores para vídeo) con una cabeza de acción DiT-B que predice exclusivamente las acciones del robot, en este caso un vector de 44 dimensiones correspondiente a control bimanual. El modelo ha sido afinado sobre el dataset DexJoCo bimanual multitask (seungkukim/dexjoco_lerobot_v20) y utiliza embeddings de texto umT5 cacheados, con extracción de características en la capa 18 del backbone (de un total de 30).

Se trata de la variante "baseline" dentro de una matriz 2x2 que compara los backbones Cosmos y Wan, con y sin flujo de mano (hand stream). En este checkpoint el flujo de mano está desactivado, lo que permite aislar el efecto de dicha corriente al compararlo con la versión que sí la incluye. El modelo cuenta con aproximadamente 5.880 millones de parámetros y está publicado en formato safetensors, con un tamaño de repositorio de 11,8 GB. No se especifica la licencia exacta (marcada como "other") ni la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT4DiT (backbone Wan2.2-TI2V-5B + action head DiT-B) |
| Parámetros totales | 5.880.375.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se recomienda bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema DiT4DiT: un backbone de difusión de vídeo Wan2.2-TI2V-5B (un transformer de difusión con 30 capas) procesa tanto las observaciones visuales como las instrucciones textuales (codificadas con umT5 y cacheadas), y una cabeza de acción DiT-B, también basada en transformer, predice el vector de acción del robot. En esta variante la cabeza predice únicamente las 44 dimensiones de acción del robot (sin incluir la geometría de la mano), con un horizonte de acción de 16 pasos.

El entrenamiento se realizó sobre el dataset DexJoCo bimanual multitask, que incluye demostraciones de tareas bimanuales. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint corresponde al paso 60.000 de entrenamiento y se guardan solo los pesos de inferencia; los artefactos de entrenamiento (estados de optimizador, scheduler, etc.) se excluyen deliberadamente. Una característica notable es que el repositorio no es autocontenido: para cargarlo es necesario descargar previamente el snapshot base de Wan2.2-TI2V-5B-Diffusers, ya que el codificador de texto umT5 y el tokenizador no se guardan en el checkpoint.

## Capacidades

- Predicción de acciones de robot bimanuales: genera vectores de acción de 44 dimensiones a partir de observaciones visuales y textuales, con un horizonte de 16 pasos.
- Integración con world-model: al estar basado en un backbone de difusión de vídeo, puede utilizarse como componente de un modelo del mundo para planificación y control en robótica.
- Soporte de instrucciones textuales: utiliza embeddings umT5 cacheados para condicionar la generación de acciones a partir de descripciones en lenguaje natural.
- Extracción de características en capa intermedia: la capa 18 del backbone se emplea para obtener representaciones visuales, lo que permite ajustar el equilibrio entre semántica y detalle.
- Sin flujo de mano: esta variante no incluye el encoder/decoder de geometría de mano, lo que la hace más ligera y adecuada para tareas donde no se requiere seguimiento de la mano.
- Compatible con el ecosistema transformers y la librería gr00t (WAMDiT4DiT).

## Casos de uso

- Control bimanual en robótica: el modelo puede generar comandos de acción para robots con dos brazos, por ejemplo en tareas de ensamblaje o manipulación colaborativa. Su vector de 44 dimensiones permite controlar conjuntamente ambas extremidades.
- Planificación de movimientos en simulación: al ser un modelo del mundo, puede predecir secuencias de acciones y estados futuros, útil para planificar trayectorias en entornos simulados antes de transferirlas al robot real.
- Teleoperación asistida: combinado con un sistema de captura de demostraciones, el modelo puede refinar o completar acciones teleoperadas, reduciendo el esfuerzo del operador.
- Generación de datos sintéticos de entrenamiento: dado que predice acciones a partir de observaciones, puede utilizarse para aumentar datasets de robótica generando nuevas trayectorias coherentes.
- Benchmarking de arquitecturas de world-model: al ser la variante baseline sin flujo de mano, sirve como referencia para comparar el impacto de añadir streams adicionales (como el de mano) en el rendimiento de control.
- Investigación en modelos de difusión aplicados a robótica: su integración con Wan2.2-TI2V-5B permite estudiar cómo los backbones de vídeo preentrenados se adaptan a tareas de control de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de robótica (como tasa de éxito en tareas bimanuales) en la model card ni en el repositorio.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado el tamaño de 5.880 millones de parámetros y el uso de bfloat16, se estima que la inferencia requiere al menos 12-16 GB de VRAM, pero este dato no está confirmado por el autor.
- No se indican GPUs recomendadas, ni opciones de despliegue (vLLM, llama.cpp, etc.), ni latencia o throughput.
- El modelo se carga mediante `WAMDiT4DiT.from_pretrained()` y requiere el snapshot base de Wan2.2-TI2V-5B-Diffusers, lo que implica descargar ambos repositorios.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (world-models robóticos con backbone de difusión de vídeo) dentro de la información proporcionada. La comparación más relevante sería con la variante `...handaction_joint_wan22ti2v5b_L18_txtcache-60k` del mismo autor, que incluye el flujo de mano, pero no se dispone de métricas cuantitativas para comparar.

## Limitaciones y advertencias

- El repositorio no es autocontenido: requiere descargar previamente el snapshot base de Wan2.2-TI2V-5B-Diffusers y ajustar `wan_model_path` en la configuración, ya que actualmente apunta a una ruta local (`/data/seungku/hf_cache/...`).
- La licencia se indica como "other" sin especificar los términos exactos; no se puede confirmar si permite uso comercial.
- No se proporciona información sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- El modelo está especializado en tareas bimanuales del dataset DexJoCo; su generalización a otras tareas o entornos no está validada.
- La extracción de características en la capa 18 es un hiperparámetro fijo; modificarlo requeriría reentrenamiento.
- No se incluyen artefactos de entrenamiento, por lo que no es posible continuar el entrenamiento directamente desde este checkpoint.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/seungkukim/dexjoco_bimanual_multitask_baseline_joint_wan22ti2v5b_L18_txtcache-60k)
- [Dataset DexJoCo bimanual multitask](https://huggingface.co/datasets/seungkukim/dexjoco_lerobot_v20)
- [Snapshot base Wan2.2-TI2V-5B-Diffusers](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers)
- [Variante con hand stream (para comparación)](https://huggingface.co/seungkukim/dexjoco_bimanual_multitask_handaction_joint_wan22ti2v5b_L18_txtcache-60k)
