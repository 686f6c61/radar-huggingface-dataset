# knightnemo/vam-robomimic-assets

## Resumen

El repositorio `knightnemo/vam-robomimic-assets` es un conjunto de recursos de referencia para reproducir y evaluar experimentos de robótica basados en el framework robomimic, concretamente para el método DPPO (Diffusion Policy Policy Optimization). Fue publicado por el usuario `knightnemo`, que según su perfil de HuggingFace trabaja en modelos de mundo, modelos de acción, modelos VLA y adaptación en tiempo de ejecución.

El repositorio contiene checkpoints congelados de políticas de difusión para tres tareas de manipulación robótica (lift, can y square), archivos de normalización de observaciones y acciones, y checkpoints de "expertos" (teachers) generados con recetas de fine-tuning de DPPO. Los pesos proceden de la release pública del proyecto DSRL, espejados sin cambios para garantizar la reproducibilidad, mientras que los expertos se entrenaron con las recetas descritas en la documentación del repositorio VAM.

No se trata de un modelo de lenguaje ni de un sistema generativo: es un paquete de assets para investigación en aprendizaje robótico, con licencia MIT y un tamaño de repositorio de 0,1 GB. Su relevancia radica en que permite reproducir exactamente los resultados de los experimentos de DPPO sobre robomimic sin necesidad de reentrenar las políticas base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) con red MLP |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` |

## Arquitectura y entrenamiento

Los checkpoints incluidos corresponden a políticas de difusión basadas en MLP, una arquitectura que modela la distribución de acciones mediante un proceso de denoising. En la práctica, la política predice secuencias de acciones a partir de observaciones, y el entrenamiento se realiza con el objetivo de maximizar la probabilidad de las acciones demostradas. En el caso de `square`, se utiliza un sampler DDIM de 100 pasos, mientras que para `lift` y `can` se emplea una configuración estándar de 20 pasos.

Los datos de entrenamiento provienen del conjunto robomimic, que contiene demostraciones de manipulación robótica en entornos simulados. Los checkpoints base son los publicados por los autores de DSRL (Diffusion Policy for Robot Learning), y los expertos se generaron aplicando las recetas de fine-tuning de DPPO descritas en el repositorio VAM. No se indica que se haya realizado RLHF ni DPO, ya que el enfoque es de aprendizaje por refuerzo específico para políticas de difusión.

## Capacidades

- Ejecución de políticas de difusión preentrenadas para las tareas `lift`, `can` y `square` del entorno robomimic.
- Inclusión de archivos de normalización de observaciones y acciones, necesarios para que las políticas funcionen correctamente.
- Suministro de checkpoints de expertos (teachers) para cada tarea, utilizables como referencia de alto rendimiento en experimentos de imitación o refuerzo.
- Soporte para el layout de directorios `dev/dppo_assets`, lo que permite que las rutas de configuración del repositorio VAM se resuelvan sin modificaciones.
- Compatibilidad con el framework robomimic y con el código de DPPO/DSRL, facilitando la integración en pipelines de investigación existentes.
- No incluye capacidades de texto, visión, tool calling ni razonamiento simbólico, al tratarse de pesos para control robótico.

## Casos de uso

- Reproducción de experimentos de robomimic con DPPO: el investigador descarga el repositorio en el directorio de assets y ejecuta las configuraciones del repositorio VAM, obteniendo exactamente los mismos checkpoints y normalizaciones que en los resultados publicados.
- Fine-tuning de políticas de difusión: los checkpoints congelados sirven como base para aplicar recetas de DPPO, como las que generan los expertos incluidos, permitiendo estudiar el efecto del fine-tuning sobre el rendimiento.
- Evaluación de políticas en manipulación robótica: las tareas `lift`, `can` y `square` son benchmarks estándar; estos assets permiten medir tasas de éxito de manera reproducible.
- Investigación en aprendizaje por refuerzo para políticas de difusión: los expertos proporcionan objetivos de alto rendimiento (SR ≈ 0,94-1,00) para comparar algoritmos de optimización de políticas.
- Validación de infraestructura de entrenamiento: al ser archivos pequeños y autocontenidos, son útiles para verificar que un entorno de robomimic está correctamente configurado antes de lanzar entrenamientos largos.
- Docencia y divulgación: el repositorio puede usarse en cursos o talleres para mostrar cómo se estructura un pipeline de aprendizaje robótico con políticas de difusión, sin necesidad de descargar datasets completos.

## Benchmarks y rendimiento

La información disponible incluye tasas de éxito (SR) de los expertos, obtenidas bajo el protocolo de evaluación del repositorio VAM. Se presentan a continuación.

| Tarea | Checkpoint | SR reportado |
|---|---|---|
| lift | `experts/lift/expert_dppo_td20.pt` | ≈ 0,995 |
| can | `experts/can/expert_dppo_td20.pt` | ≈ 1,00 |
| square | `experts/square/expert_dsrlfork.pt` | ≈ 0,94 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Los checkpoints individuales ocupan entre 4,6 MB y 19 MB, por lo que el requisito de VRAM es mínimo.
- Cualquier GPU con al menos 2 GB de VRAM es suficiente para cargar y ejecutar estos modelos en PyTorch.
- No se requiere hardware especializado; una GPU de consumo como una RTX 3060 o superior es adecuada.
- Las opciones de despliegue se limitan a entornos Python con PyTorch, junto con el framework robomimic y el código de DPPO/DSRL.
- No se dispone de datos de latencia o throughput para estos assets.

## Comparativa con modelos similares

| Recurso | Tipo | Tareas cubiertas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `knightnemo/vam-robomimic-assets` | Assets de DPPO/robomimic | lift, can, square | MIT | HuggingFace |
| Repositorio DSRL | Código y pesos originales | lift, can, square | no disponible | GitHub |
| Repositorio VAM | Framework y recetas de fine-tuning | lift, can, square | no disponible | no disponible |

Los assets de este repositorio son una copia espejo de los pesos de DSRL, con el valor añadido de incluir expertos entrenados con recetas de DPPO. No existen modelos comparables en la misma categoría que ofrezcan una integración tan directa con el layout de directorios del repositorio VAM.

## Limitaciones y advertencias

- Los pesos están vinculados a tareas específicas de robomimic; no son modelos generales y no pueden utilizarse fuera de ese entorno sin adaptación.
- No se incluye el código de entrenamiento ni las configuraciones completas; solo los checkpoints y normalizaciones.
- La tarea `square` requiere específicamente el experto `expert_dsrlfork.pt`; el experto de la receta td20 presenta desajuste de scheduler con el sampler congelado, por lo que no debe usarse.
- No se proporcionan métricas de rendimiento para los checkpoints base, solo para los expertos.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los datos originales de DSRL.
- No se incluyen instrucciones detalladas de instalación más allá de las variables de entorno indicadas en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/knightnemo/vam-robomimic-assets
- Perfil del autor en HuggingFace: https://huggingface.co/knightnemo
- Framework robomimic: https://robomimic.github.io/
- Repositorio DSRL mencionado en la model card: https://github.com/ajwagen/dsrl
- Repositorio VAM: no disponible (se menciona en la model card, pero no se proporciona URL)
