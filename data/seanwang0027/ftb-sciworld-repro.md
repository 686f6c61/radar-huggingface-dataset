# SeanWang0027/ftb-sciworld-repro

## Resumen

`SeanWang0027/ftb-sciworld-repro` no es un modelo de lenguaje, sino un paquete autónomo y ejecutable para entrenar **cinco métodos de destilación on-policy multi-turno sobre ScienceWorld**, un entorno virtual de texto basado en el currículo de ciencias de primaria. El bundle utiliza un estudiante Qwen3-1.7B y un profesor Qwen3-32B, e implementa las variantes OPD, Guided-OPD, TCOD-B2F, TCOD-F2B y FutureBridge (FTB). Su propósito es permitir la reproducción fiel de los experimentos publicados por los autores de FutureBridge-OPD, incluyendo scripts, configuraciones y un overlay de código.

El paquete incluye todo lo necesario para ejecutar el entrenamiento excepto los pesos de los modelos, los datos de la tarea y las dependencias de Python, que se descargan mediante `scripts/setup.sh`. Está pensado para un nodo con 8 GPUs de al menos 80 GB cada una, dado que el profesor Qwen3-32B se ejecuta con paralelismo tensorial de 2. La licencia es Apache-2.0 y el idioma de los datos es inglés.

La relevancia de este bundle radica en que proporciona una implementación reproducible de técnicas avanzadas de destilación de conocimiento para agentes LLM, un área activa de investigación. Al estar todo el código versionado y documentado, facilita la comparación justa entre métodos y la verificación de resultados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (bundle de entrenamiento, no un modelo) |
| Parametros totales | No disponible (el estudiante es Qwen3-1.7B, el profesor Qwen3-32B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de los modelos base) |
| Tipos de cuantizacion | No disponible (no se proporcionan pesos) |
| Idiomas soportados | Inglés (datos de ScienceWorld) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no incluye pesos; los modelos se descargan por separado) |

## Arquitectura y entrenamiento

El bundle no define una arquitectura de modelo propia, sino que orquesta el entrenamiento de un estudiante Qwen3-1.7B supervisado por un profesor Qwen3-32B mediante cinco métodos de destilación on-policy:

- **OPD** (On-Policy Distillation): el estudiante ejecuta episodios completos solo y el profesor puntúa sus tokens posteriormente.
- **Guided-OPD**: por turno, una moneda decide si actúa el profesor o el estudiante; los turnos del profesor usan cross-entropy SFT y los del estudiante usan la KL inversa de OPD.
- **TCOD-B2F** (Back-to-Front): reproduce un prefijo de acciones de oro y el estudiante toma el control cerca del final; el punto de transición retrocede durante el entrenamiento.
- **TCOD-F2B** (Front-to-Back): el estudiante siempre empieza en el turno 1, pero los episodios se truncan cortos y crecen con el entrenamiento.
- **FTB** (FutureBridge): inserta un "puente" validado del profesor en el turno de mayor desacuerdo del estudiante.

El entrenamiento consta de 200 pasos con batch de 16 tareas y hasta 30 turnos de entorno, con checkpoints cada 50 pasos. Cada método requiere las 8 GPUs completas y puede tardar desde horas hasta un día. La configuración de los métodos baseline (OPD, Guided-OPD, TCOD-B2F, TCOD-F2B) es una reconstrucción basada en la tabla de mapeo del repositorio upstream, con algunos valores que no están fijados por la publicación original (por ejemplo, el parámetro `mu` de Guided-OPD se ha fijado en 0.5, mientras que el valor por defecto del código es 0.1).

## Capacidades

- Reproducción de cinco métodos de destilación on-policy multi-turno sobre ScienceWorld.
- Entrenamiento distribuido en 8 GPUs con paralelismo tensorial para el profesor.
- Soporte para reutilizar modelos ya descargados en el nodo (`--models /path/to/models`).
- Scripts de ejecución para SLURM y línea de comandos.
- Monitorización mediante TensorBoard (los configs de baseline usan tensorboard en lugar de wandb).
- Verificación automática de importación de todas las clases de workflow.
- No incluye capacidades de inferencia ni de generación de texto por sí mismo; es exclusivamente un framework de entrenamiento.

## Casos de uso

- **Investigación en destilación de conocimiento para agentes LLM**: permite comparar de forma controlada OPD, Guided-OPD, TCOD-B2F, TCOD-F2B y FTB en un entorno estándar como ScienceWorld.
- **Reproducción de resultados publicados**: los autores indican que el protocolo upstream no evalúa, por lo que este bundle permite replicar las curvas de entrenamiento (métrica `rollout/env_done/mean`) y verificar las afirmaciones del paper.
- **Estudio de curriculum learning**: los métodos TCOD-F2B y TCOD-B2F exploran estrategias de curriculum de longitud de episodio, útil para investigar cómo el orden de exposición afecta al aprendizaje.
- **Desarrollo de nuevos métodos de destilación**: el código modular y los scripts de configuración facilitan la extensión con nuevas variantes o la modificación de hiperparámetros.
- **Evaluación de agentes en entornos de texto**: ScienceWorld es un benchmark de razonamiento y planificación; este bundle permite entrenar agentes que luego pueden evaluarse con el entorno original.
- **Formación y docencia**: al ser un paquete autocontenido con documentación detallada, sirve como ejemplo práctico de cómo estructurar experimentos de RL y destilación en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bundle no incluye un protocolo de evaluación; la métrica de rendimiento que se puede extraer es la tasa de finalización de episodios durante el entrenamiento (`rollout/env_done/mean`), que es la que usan los análisis del repositorio upstream. No se proporcionan comparaciones numéricas con otros modelos.

## Requisitos de hardware

- **GPUs**: 8 GPUs con al menos 80 GB de VRAM cada una, en un solo nodo. El profesor Qwen3-32B con TP2 ocupa ~32 GB de pesos por dispositivo antes de la caché KV, por lo que tarjetas de 40 GB no son suficientes.
- **Distribución**: 4 GPUs para rollout del estudiante, 2 para el profesor, 2 para el entrenador FSDP.
- **CPU y memoria**: no especificado, pero se requiere Linux con CUDA y NCCL.
- **Java**: Java 17+ en PATH, ya que ScienceWorld inicia una JVM por episodio.
- **Disco**: ~80 GB para modelos, más ~4 GB por checkpoint (4 checkpoints por ejecución).
- **Despliegue**: no aplica para inferencia; es un entorno de entrenamiento. Las opciones de despliegue de los modelos resultantes dependerían de los pesos generados (no incluidos).

## Comparativa con modelos similares

No disponible. Este bundle es específico para un conjunto de métodos de destilación y no tiene equivalentes directos en el Hub. Se podría comparar con el repositorio upstream [ChenChiShui/FutureBridge-OPD](https://github.com/ChenChiShui/FutureBridge-OPD) y con [kokolerk/TCOD](https://github.com/kokolerk/TCOD), pero no son modelos sino códigos fuente.

## Limitaciones y advertencias

- **No incluye pesos de modelos**: hay que descargar Qwen3-1.7B y Qwen3-32B por separado, lo que supone ~68 GB de descarga adicional.
- **Requisitos de hardware muy exigentes**: necesita 8 GPUs de 80 GB, lo que limita su uso a centros de cómputo o clústeres profesionales.
- **Dependencia de Java 17**: ScienceWorld requiere una JVM por episodio; si Java no está correctamente instalado, el entrenamiento fallará.
- **No hay protocolo de evaluación**: el bundle no evalúa el modelo entrenado; solo produce checkpoints y métricas de entrenamiento. Para evaluar hay que usar herramientas externas.
- **Valores de hiperparámetros no fijados upstream**: algunos parámetros (como `mu` en Guided-OPD) se han reconstruido con criterios propios y pueden diferir de los usados en la publicación original, lo que afecta a la reproducibilidad exacta.
- **Licencia Apache-2.0**: permite uso comercial, pero los modelos base (Qwen3) tienen sus propias licencias que deben respetarse.
- **Idioma**: los datos de ScienceWorld están en inglés; no se contempla multilingüismo.

## Enlaces

- [HuggingFace - SeanWang0027/ftb-sciworld-repro](https://huggingface.co/SeanWang0027/ftb-sciworld-repro)
- [ScienceWorld (entorno) - GitHub](https://github.com/allenai/ScienceWorld)
- [FutureBridge-OPD (repositorio upstream) - GitHub](https://github.com/ChenChiShui/FutureBridge-OPD)
- [TCOD (repositorio upstream) - GitHub](https://github.com/kokolerk/TCOD)
