# Jeongeun/watch-gr1-v6-icl-4k

## Resumen

WATCH GR1 v6 ICL post-train 4K es un checkpoint de política robótica (policy) publicado por el usuario Jeongeun en Hugging Face. Se trata del resultado del post-entrenamiento con aprendizaje en contexto (in-context learning, ICL) del experimento `cosmos_predict2p5_2b_egoverse_gr1_ret_v6_448_state`, correspondiente a la iteración 4000 de entrenamiento. El artefacto publicado es un único fichero `.pt` (PyTorch) de aproximadamente 3,9 GB, generado mediante el script `convert_dcp_to_pt.py --iter 4000`.

El modelo se enmarca en la familia Cosmos-Policy (NVIDIA), según indica la etiqueta `cosmos-policy`, y está orientado al control del robot humanoide GR1 (Fourier GR1). La nomenclatura `448_state` sugiere una resolución de entrada de 448 píxeles y la inclusión del estado del robot como parte de la observación. El repositorio incluye instrucciones de evaluación local mediante un script `gr1_local_eval.sh` y un dataset asociado (`Jeongeun/mimicdroid-gr1`) con episodios en formato zarr.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card técnica detallada más allá de las instrucciones de reproducción de la evaluación. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `cosmos-policy`, familia Cosmos-Policy de NVIDIA; detalles internos no publicados en la model card) |
| Parámetros totales | no disponible (el nombre del experimento incluye `2b`, lo que sugiere ~2 mil millones, pero no se confirma en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la información proporcionada) |
| Formato de pesos | `.pt` (PyTorch); el repositorio ocupa 3,9 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card. La etiqueta `cosmos-policy` indica que el modelo pertenece a la línea Cosmos-Policy de NVIDIA, orientada a políticas robóticas basadas en modelos generativos (world models / diffusion policies). El nombre del experimento, `cosmos_predict2p5_2b_egoverse_gr1_ret_v6_448_state`, sugiere una variante de predicción Cosmos 2.5 con aproximadamente 2 mil millones de parámetros, entrenada sobre el dataset EgoVerse y adaptada al robot GR1 con resolución de 448 píxeles e inclusión del estado del robot.

El entrenamiento reportado es un post-entrenamiento con in-context learning (ICL) hasta la iteración 4000. No se especifican en la información proporcionada el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en políticas robóticas). El dataset de evaluación asociado es `Jeongeun/mimicdroid-gr1`, con episodios en formato zarr, un manifiesto y pools de servidores. El proceso de conversión desde el formato DCP (distributed checkpoint) a `.pt` se realiza con `convert_dcp_to_pt.py --iter 4000`.

## Capacidades

- Control de robot humanoide GR1: el modelo está entrenado para generar acciones de control a partir de observaciones visuales y del estado del robot.
- Política visuomotora: procesa entradas visuales a resolución 448 píxeles junto con el estado del robot (`448_state`).
- Aprendizaje en contexto (ICL): el post-entrenamiento se denomina explícitamente ICL, lo que sugiere adaptación a nuevas tareas o demostraciones en contexto.
- Evaluación reproducible: incluye instrucciones y script (`gr1_local_eval.sh`) para evaluar el checkpoint sobre el dataset `mimicdroid-gr1`.
- No se dispone de información sobre tool calling, function calling, capacidades multilingües, generación de texto, código, matemáticas, visión general, audio ni modos de razonamiento explícito.

## Casos de uso

- Investigación en robótica humanoide: evaluar el checkpoint sobre el dataset `mimicdroid-gr1` para reproducir los resultados del post-entrenamiento ICL en el robot GR1.
- Reproducción de experimentos: usar el script `gr1_local_eval.sh` con el checkpoint `model_000004000.pt` para validar el pipeline de evaluación descrito en `docs/gr1_eval_rebuttal_4node.md`.
- Punto de partida para fine-tuning: al ser un checkpoint `.pt` de PyTorch, puede servir como inicialización para nuevos post-entrenamientos sobre tareas del GR1.
- Comparación de iteraciones: al estar etiquetado con la iteración 4000, permite comparar con otros checkpoints de la misma serie (v6) para analizar la evolución del entrenamiento.
- Integración en pipelines de evaluación distribuida: el script de evaluación admite configuración de GPUs (`GPUS="0"`) y modo `full`, lo que facilita su uso en clústeres multi-nodo (la documentación menciona `4node`).
- Docencia y divulgación: ejemplo práctico de post-entrenamiento ICL en políticas robóticas con modelos de la familia Cosmos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe cómo ejecutar la evaluación, pero no incluye métricas numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,9 GB, lo que sugiere que el checkpoint en precisión original podría requerir del orden de 8-16 GB de VRAM, pero este dato no se confirma en la información.
- GPU recomendadas: no disponible. El script de evaluación permite seleccionar GPUs (`GPUS="0"`), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el flujo documentado usa PyTorch (`.pt`) y un script propio (`gr1_local_eval.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a políticas robóticas).
- Latencia y throughput: no disponibles.
- Configuración multi-nodo: la documentación de referencia (`docs/gr1_eval_rebuttal_4node.md`) sugiere evaluación en 4 nodos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (políticas robóticas para humanoides).

## Limitaciones y advertencias

- Model card mínima: no se documentan arquitectura, datos de entrenamiento, sesgos ni limitaciones internas.
- Licencia `other`: no se incluye el texto de la licencia, por lo que se desconoce si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Cero adopción: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Checkpoint de investigación: es un artefacto intermedio de un experimento (iteración 4000), no un modelo empaquetado para producción.
- Sin información sobre idiomas: no aplica en el sentido habitual de LLM, pero no se documenta el soporte multilingüe de instrucciones.
- Riesgo de sobreajuste al dataset `mimicdroid-gr1`: al no publicarse métricas, no puede evaluarse la generalización a otros entornos o robots.
- Dependencia de código externo: la evaluación requiere el repositorio `github.com/jeongeun980906/watch` y el dataset asociado, sin los cuales el checkpoint no es utilizable de forma autónoma.
- Fecha de creación futura (2026-11-11): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeongeun/watch-gr1-v6-icl-4k
- Dataset de evaluación: https://huggingface.co/datasets/Jeongeun/mimicdroid-gr1
- Repositorio de código: https://github.com/jeongeun980906/watch
