# lair-nyu/yor_icl_victr_vision_expanded_full

## Resumen

El modelo `lair-nyu/yor_icl_victr_vision_expanded_full` es un checkpoint de política robótica (VLA, Vision-Language-Action) desarrollado por el grupo LAIR de la Universidad de Nueva York (NYU), en el contexto del laboratorio CILVR. Se basa en el backbone `pi0.5` de Physical Intelligence y añade un mecanismo de recuperación visual `VICTR` para enriquecer el contexto de las acciones. El modelo fue entrenado con el framework openpi sobre el conjunto de datos `icl-dataset`, con una configuración de tareas ampliada (`expanded task set`). El checkpoint corresponde al paso 50 000 de entrenamiento, completado con normalidad, y contiene únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador.

Este modelo es relevante en el ámbito de la robótica de manipulación, ya que integra recuperación de ejemplos visuales para mejorar la generalización de las políticas. Su publicación en HuggingFace permite a la comunidad reproducir y evaluar el comportamiento de un sistema que combina un modelo VLA de última generación con un mecanismo de atención sobre memoria visual. Sin embargo, la información pública disponible es muy limitada: no se especifican parámetros totales, contexto, licencia ni idiomas, lo que restringe su uso a entornos de investigación donde se pueda obtener documentación adicional del equipo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en pi0.5 (VLA) con mecanismo VICTR de recuperacion visual; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene `params/` y `assets/`, probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo `pi0.5` de Physical Intelligence, un VLA que procesa entradas visuales y de lenguaje para generar acciones de control. Sobre esta base se incorpora el módulo `VICTR` (Vision-retrieval context), que añade un mecanismo de recuperación de ejemplos visuales relevantes para mejorar la predicción de acciones. El entrenamiento se realizó con el framework openpi, sobre el dataset `icl-dataset`, con una configuración de tareas ampliada (`expanded task set`). El entrenamiento se ejecutó durante 50 000 pasos con un tamaño de lote de 128, utilizando dos GPUs H200 (según la información del job de SLURM). El checkpoint publicado corresponde al paso final, con el entrenamiento completado de forma normal. No se dispone de información adicional sobre la composición del dataset, técnicas de alineación (RLHF/DPO) u otras innovaciones técnicas.

## Capacidades

- Control de robots de manipulación: el modelo genera acciones de control a partir de observaciones visuales y, presumiblemente, instrucciones en lenguaje natural (típico de los VLA).
- Recuperación de contexto visual: incorpora VICTR, que permite seleccionar ejemplos visuales relevantes de un banco de memoria para guiar la acción.
- Entrenamiento para un conjunto ampliado de tareas: la configuración `expanded` sugiere una mayor diversidad de escenarios frente a versiones anteriores.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio) más allá de lo descrito.

## Casos de uso

- Investigación en robótica de manipulación: el modelo puede servir como punto de partida para estudiar cómo la recuperación visual (VICTR) mejora la generalización en tareas de agarre y manipulación. Los investigadores pueden cargar los pesos en openpi y evaluar su comportamiento en entornos simulados o reales.
- Evaluación comparativa de políticas VLA: al estar basado en pi0.5, permite comparar el efecto de añadir el módulo VICTR frente a la versión base, midiendo métricas de éxito en tareas estándar de robótica.
- Desarrollo de sistemas de aprendizaje por demostración: el modelo puede utilizarse como inicialización para fine-tuning en tareas específicas, aprovechando el entrenamiento previo en el dataset ICL.
- Reproducción de experimentos: dado que se publica el checkpoint exacto de entrenamiento, otros grupos pueden reproducir los resultados del paper asociado (si existe) y verificar las afirmaciones sobre el rendimiento.
- Generación de trayectorias en simulación: el modelo puede integrarse en simuladores robóticos (por ejemplo, MuJoCo o Isaac Gym) para generar datos sintéticos de entrenamiento o para validar políticas antes del despliegue físico.
- Estudio de mecanismos de atención y memoria: la combinación de pi0.5 con VICTR ofrece un caso de estudio para analizar cómo la recuperación de ejemplos afecta a la atención y a la toma de decisiones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni de evaluaciones específicas de robótica (éxito en tareas, tasa de agarre, etc.). Se recomienda consultar el repositorio de openpi o el grupo LAIR para posibles publicaciones asociadas.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs H200 (80 GB cada una) durante 50 000 pasos, lo que indica que el modelo es de tamaño considerable.
- El tamaño del repositorio es de 12.4 GB, lo que sugiere que los pesos en precisión completa (fp32) o bf16 ocupan aproximadamente esa cantidad. Para inferencia, se requeriría una GPU con al menos 12-16 GB de VRAM si se usan cuantizaciones ligeras, pero no se dispone de información confirmada sobre cuantización.
- No se especifican requisitos mínimos de VRAM ni GPUs recomendadas para inferencia. Dado que el modelo se basa en pi0.5, es probable que necesite una GPU de gama alta (A100, H100, RTX 4090) para ejecutarse en tiempo real, pero esto es una estimación no confirmada.
- Las opciones de despliegue incluyen el framework openpi (que es el utilizado para entrenar) y posiblemente vLLM o TGI si se adapta a un formato de inferencia estándar, pero no se documenta.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo se basa en pi0.5, pero no se conocen las diferencias exactas en parámetros o rendimiento frente a la versión base. Tampoco se dispone de datos de modelos comparables como OpenVLA, RT-2 o otros VLA. Se indica "no disponible".

## Limitaciones y advertencias

- Falta de documentación: no se publican detalles sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni las capacidades exactas, lo que dificulta su uso responsable en producción.
- Sesgos y alucinación: al ser un modelo de robótica, no se aplican los mismos riesgos de alucinación textual, pero puede generar acciones incorrectas si las observaciones no coinciden con el dominio de entrenamiento.
- Restricciones de uso comercial: al no especificarse la licencia, no se puede garantizar que el modelo pueda utilizarse en aplicaciones comerciales sin autorización explícita.
- Estado del checkpoint: el repositorio no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este punto; solo sirve para inferencia o fine-tuning posterior.
- Dependencia de openpi: para cargar el modelo es necesario utilizar el framework openpi, lo que limita la portabilidad a otros entornos de inferencia.
- Sin garantías de rendimiento: no se han publicado evaluaciones independientes, por lo que el rendimiento en tareas reales es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/lair-nyu/yor_icl_victr_vision_expanded_full)
- [Repo similar: yor_icl_fast_victr_vision_expanded_full](https://huggingface.co/lair-nyu/yor_icl_fast_victr_vision_expanded_full)
- [Perfil de LAIR NYU en HuggingFace](https://huggingface.co/lair-nyu/models)
- [Laboratorio CILVR de NYU](https://wp.nyu.edu/cilvr/about-cilvr/)
- [Publicaciones del CILVR](https://wp.nyu.edu/cilvr/cilvr-group-publications/)
- [Repositorios de NYU-ICL en GitHub](https://github.com/orgs/NYU-ICL/repositories)
