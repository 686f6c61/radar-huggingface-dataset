# seungkukim/dexjoco_bimanual_multitask_videoonly_wan22ti2v5b_L18_txtcache-60k

## Resumen

Este modelo es un checkpoint de WAM-DiT4DiT, un world model (modelo de mundo) para robótica, desarrollado por seungkukim. Se basa en el backbone Wan2.2-TI2V-5B (un modelo de generación de video de la familia Wan2.2) y ha sido finetuneado sobre el dataset DexJoCo bimanual multitask, especializado en manipulación bimanual (dos brazos). El resultado es un modelo que genera secuencias de video sintéticas de escenas robóticas, útil para simulación, planificación y generación de datos de entrenamiento.

Se trata de una ejecución "solo video": no incluye un action head (cabeza de acciones) ni el text encoder original (umT5). En su lugar, utiliza embeddings de texto cacheados (txtcache) y extracción de características en la capa 18 del DiT. Con 5.704.476.380 parámetros (5,7 mil millones) y un tamaño de repo de 11,4 GB, este checkpoint requiere obligatoriamente el snapshot base de Wan2.2-TI2V-5B para cargarse correctamente. Su relevancia radica en que demuestra cómo adaptar modelos de video generativos de gran escala a tareas de robótica, ofreciendo una alternativa a los world models entrenados desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAM-DiT4DiT (Diffusion Transformer con VAE, basado en Wan2.2-TI2V-5B) |
| Parametros totales | 5.704.476.380 (5,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la documentación) |
| Tipos de cuantizacion | no disponible (se menciona bfloat16 como dtype de carga) |
| Idiomas soportados | no disponibles (el modelo base Wan2.2 soporta inglés y chino, pero este finetune no lo especifica) |
| Licencia | other (no detallada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Diffusion Transformer (DiT) con un codificador VAE, siguiendo el diseño de Wan2.2-TI2V-5B. El checkpoint finetunea únicamente los componentes del DiT (825 tensores) y del VAE (196 tensores), manteniendo la estructura original del backbone. La innovación principal es la inclusión de caché de embeddings de texto (txtcache) y extracción de características en la capa 18, lo que permite reducir costes computacionales durante la inferencia al evitar re-calcular las representaciones textuales en cada paso.

El entrenamiento se realizó sobre el dataset DexJoCo bimanual multitask (seungkukim/dexjoco_lerobot_v20), que contiene demostraciones de manipulación con dos brazos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El checkpoint corresponde al paso 60.000 de entrenamiento y solo incluye artefactos de inferencia; los estados de optimizador y otros archivos de entrenamiento fueron excluidos deliberadamente.

## Capacidades

- Generación de video de escenas robóticas de manipulación bimanual, actuando como world model para predecir estados futuros.
- Soporte de caché de texto: los embeddings de texto se calculan una vez y se reutilizan, mejorando la eficiencia.
- Extracción de características en la capa 18 del DiT, lo que permite un control más fino sobre la representación latente.
- No incluye action head, por lo que no genera acciones directamente; se limita a la predicción visual.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de un LLM.
- Capacidades multilingües: no especificadas en este checkpoint, aunque el modelo base Wan2.2 es multilingüe (inglés y chino).

## Casos de uso

- Simulación de escenarios de manipulación bimanual: el modelo puede generar secuencias de video sintéticas de robots de dos brazos interactuando con objetos, útiles para entrenar políticas de control en entornos simulados sin necesidad de capturar datos reales.
- Generación de datos aumentados para aprendizaje por imitación: a partir de demostraciones reales, el world model puede crear variaciones visuales de las mismas, enriqueciendo el dataset de entrenamiento de políticas.
- Planificación de movimientos predecible: al anticipar el resultado visual de una secuencia de acciones, el modelo permite evaluar trayectorias antes de ejecutarlas en el robot físico.
- Evaluación de políticas en entornos simulados: se puede usar como simulador de bajo nivel para validar el comportamiento de políticas de control en condiciones variadas.
- Visualización de trayectorias para depuración: los investigadores pueden inspeccionar el video generado para entender cómo se comportaría el robot ante ciertas entradas, facilitando la depuración de algoritmos.
- Transferencia de simulación a realidad (sim-to-real): el modelo puede servir como puente para generar datos visuales realistas que ayuden a entrenar políticas que luego se transfieran al mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 5,7 B parámetros en bfloat16, los pesos ocupan aproximadamente 11,4 GB. Durante la inferencia, el uso de memoria adicional (activaciones, VAE, etc.) eleva el requisito a entre 16 y 24 GB, dependiendo de la resolución y número de frames.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM para una inferencia cómoda. En GPUs con 16 GB podría funcionar con resoluciones reducidas o menor número de frames.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM (como RTX 3060 o RTX 4060) sin técnicas de cuantización o offloading, que no están documentadas para este modelo.
- Opciones de despliegue: el modelo se carga mediante `WAMDiT4DiT.from_pretrained()` de la librería `transformers` (con soporte de la librería `gr00t`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM sino un modelo de difusión de video.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (world models de robótica bimanual con arquitectura DiT). Como referencia, el modelo base Wan2.2-TI2V-5B es un modelo de generación de video generalista, pero no está especializado en robótica. Otras alternativas como UniPi, RoboGen o modelos basados en video diffusion existen, pero no se han incluido datos concretos en la información proporcionada. Por tanto, la comparativa se limita a indicar que este checkpoint es una adaptación específica de Wan2.2 para robótica bimanual.

## Limitaciones y advertencias

- El repositorio no es autocontenido: requiere descargar previamente el snapshot base Wan2.2-TI2V-5B-Diffusers y sobrescribir la ruta `wan_model_path` en el `config.json` antes de cargar el modelo en otra máquina.
- No incluye action head, por lo que no puede generar acciones de control; solo produce video. Esto limita su uso a tareas de predicción visual.
- El text encoder (umT5) no se guarda en el checkpoint; debe obtenerse del modelo base. Si el base no está disponible, el modelo no puede procesar entradas de texto.
- La licencia es "other" y no se especifica su alcance, lo que puede implicar restricciones para uso comercial. Se recomienda contactar al autor para aclarar los términos.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un dataset concreto de robótica, puede no generalizar a otros entornos o configuraciones de robots.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir artefactos o secuencias irreales, especialmente en escenarios fuera de la distribución del dataset de entrenamiento.
- El número de descargas y likes es 0, lo que sugiere que es un modelo reciente o poco evaluado por la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/seungkukim/dexjoco_bimanual_multitask_videoonly_wan22ti2v5b_L18_txtcache-60k
- Dataset DexJoCo bimanual multitask: https://huggingface.co/datasets/seungkukim/dexjoco_lerobot_v20
- Modelo base Wan2.2-TI2V-5B (requerido): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
