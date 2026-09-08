# knightnemo/vam-furniture-assets

## Resumen

`vam-furniture-assets` es un repositorio creado por `knightnemo` que no contiene un modelo de lenguaje, sino un conjunto de assets preentrenados para manipulación robótica. Concretamente, espeja los pesos de políticas de difusión para ensamblaje de muebles en el benchmark de FurnitureBench, junto con sus expertos (teachers) y los archivos de normalización necesarios. El repositorio está etiquetado con licencia MIT y tiene un tamaño total de 0,2 GB.

El objetivo de este repositorio es proporcionar todos los archivos que los scripts de VAM y DPPO (Diffusion Policy Proximal Policy Optimization) esperan en la estructura de directorios `dev/dppo_assets`. Incluye políticas preentrenadas para dos tareas concretas: lámpara (`lamp`) y mesa redonda (`round_table`), además de los expertos que sirven como profesores en el proceso de entrenamiento. La arquitectura es una política de difusión sobre MLP de baja dimensión, entrenada con el framework DPPO. No se especifican datos sobre parámetros, contexto o idiomas porque no es un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) sobre MLP, entrenada con DPPO |
| Parametros totales | No disponible (el checkpoint ocupa ~53 MB; no se especifica el conteo) |
| Parametros activos | No aplica (no es un modelo de expertos combinados) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato PyTorch .pt/.pth) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, .pth) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de políticas de difusión preentrenadas, concretamente tres tipos de archivos: dos políticas congeladas de DPPO para `lamp` y `round_table`, dos experto (teachers) adicionales, y dos archivos de normalización (`normalization.pth`). Los nombres de los directorios (`furniture-pretrain/lamp/lamp_low_dim_pre_diffusion_mlp_ta8_td100/...`, `furniture-experts/lamp_low/...`) indican que se trata de políticas de difusión de baja dimensión entrenadas con el framework DPPO del repositorio `irom-lab/dppo`. Según la model card, estos pesos son un espejo sin cambios de la publicación pública de DPPO en Google Drive y del repositorio de HuggingFace `yeeeiii111/dppo-furniture-teachers`.

El entrenamiento se realizó en el entorno de simulación Isaac Gym, aunque este no se incluye en el repositorio por estar sujeto a la licencia de NVIDIA. Los teachers son referenciados como `expert_itr350.pt` y se corresponden con estados de entrenamiento en la iteración 350, alcanzando una tasa de éxito de 0,942 en la tarea de la lámpara, según la model card. No se proporcionan más detalles sobre la composición del dataset ni sobre técnicas como RLHF o DPO, porque se trata de un modelo de control robótico y no de un LLM.

## Capacidades

- Ejecución de políticas de difusión para ensamblaje de muebles en simulación (lámpara y mesa redonda).
- Inclusión de dos políticas preentrenadas congeladas (estado 8000) listas para evaluar sin reentrenamiento.
- Inclusión de dos expertos (teachers) que pueden servir como referencia para imitación o RL.
- Archivos de normalización (`normalization.pth`) para preprocesar las observaciones de baja dimensión.
- Integración con el framework DPPO y con los scripts de VAM que resuelven las rutas de `DPPO_LOG_DIR`, `DPPO_DATA_DIR` y `DPPO_EXPERT_ROOT`.
- No tiene capacidades de lenguaje, visión, audio, tool calling ni agentes; es un controlador de bajo nivel para robótica.

## Casos de uso

- **Investigación en manipulación robótica con políticas de difusión**: los checkpoints permiten reproducir los experimentos de DPPO en FurnitureBench sin necesidad de entrenar desde cero, facilitando la validación de resultados.
- **Inicialización de políticas para RL o imitación**: los expertos (`expert_itr350.pt`) funcionan como profesores para algoritmos de aprendizaje por imitación o para proporcionar demostraciones de alto nivel en el entrenamiento de DPPO.
- **Entrenamiento de robots en ensamblaje de muebles**: la política de lámpara y mesa redonda puede ejecutarse en Isaac Gym para evaluar el éxito en el entorno de simulación; el teacher de la lámpara alcanza una SR de 0,942.
- **Transferencia a nuevas tareas**: al ser políticas de difusión de bajo nivel, se pueden adaptar mediante fine-tuning a otras tareas de manipulación relacionadas, siempre que las observaciones sean de baja dimensión.
- **Benchmarking de algoritmos de control**: los assets permiten comparar el rendimiento de DPPO frente a otros métodos en el entorno de FurnitureBench, usando los mismos pesos y normalización.
- **Desarrollo de sistemas de ensamblaje autónomo**: integrando estas políticas en un pipeline de robot, se puede abordar el ensamblaje de muebles sin programación manual de los movimientos.
- **Reproducibilidad en robótica**: el repositorio proporciona los pesos exactos con sus MD5, lo que permite verificar la integridad y replicar experimentos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aparece en la model card: el teacher para la tarea de lámpara tiene una tasa de éxito (SR) de 0,942, probablemente en el entorno de entrenamiento. No se proporcionan métricas para la mesa redonda ni para los checkpoints preentrenados, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible. Los checkpoints individuales son de ~53 MB, por lo que la política en sí es ligera, pero la carga del entorno de simulación Isaac Gym depende de la configuración de la escena.
- GPU recomendadas: no especificadas. Isaac Gym requiere una GPU NVIDIA con CUDA; los modelos típicos podrían ser desde una RTX 3090 hasta una A100/H100, pero no hay una recomendación oficial para estos assets.
- Cabe en consumer GPU: probablemente sí para la política, aunque Isaac Gym puede ser exigente en GPUs de consumo según el número de entornos simulados.
- Opciones de despliegue: framework DPPO (https://github.com/irom-lab/dppo), Isaac Gym y los scripts de VAM del autor; no se detallan instalaciones ni configuraciones de despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite comparar estos assets con otros modelos de la misma categoría. Cabe destacar que el repositorio es un espejo de los pesos públicos de DPPO y de `yeeeiii111/dppo-furniture-teachers`, por lo que la alternativa más directa sería descargar esos repositorios originales o entrenar tus propias políticas desde cero con el framework DPPO.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no sirve para tareas de NLP, generación de texto, ni procesamiento de imágenes o audio.
- Los assets están pensados para la estructura `dev/dppo_assets` y los scripts de VAM; usarlos fuera de ese layout puede provocar que no se resuelvan las rutas esperadas.
- Isaac Gym no está incluido y requiere obtenerlo por separado de NVIDIA; su licencia no es MIT y puede imponer restricciones adicionales.
- Las políticas son específicas para dos muebles y observaciones de baja dimensión; no se ha evaluado su generalización a otros objetos, sensores o tareas.
- La tasa de éxito de 0,942 corresponde al teacher de la lámpara, no necesariamente al checkpoint preentrenado; los resultados pueden variar según la semilla y la configuración del entorno.
- Los pesos son un reflejo de repositorios de terceros; a pesar de la licencia MIT del repositorio, conviene revisar los términos de los repositorios originales (`irom-lab/dppo` y `yeeeiii111/dppo-furniture-teachers`) por si existen atribuciones adicionales o condiciones de uso.
- No hay información sobre sesgos o riesgos de alucinación, ya que no es un modelo generativo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/knightnemo/vam-furniture-assets
- Perfil del autor: https://huggingface.co/knightnemo
- Repositorio original DPPO: https://github.com/irom-lab/dppo
- Repositorio de teachers: https://huggingface.co/yeeeiii111/dppo-furniture-teachers
