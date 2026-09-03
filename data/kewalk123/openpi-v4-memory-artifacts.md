# kewalk123/openpi-v4-memory-artifacts

## Resumen

Este repositorio contiene los artefactos de entrenamiento de una política de memoria de doble banco (dual-bank memory policy) basada en openpi v4, desarrollada por el usuario kewalk123, aparentemente vinculado al grupo ZJU-Walker. No se trata de un modelo listo para inferencia, sino de los ficheros auxiliares necesarios para reproducir el entrenamiento de un modelo de visión-lenguaje-acción (VLA) con capacidades de memoria episódica y de hechos. El modelo base es el checkpoint `pi05_base` de Physical Intelligence (π₀.5), y el dataset de entrenamiento es un conjunto de 70 episodios de manipulación robótica en formato LeRobot.

La relevancia de este repositorio radica en que openpi es una librería open source de referencia para VLA en robótica, y este trabajo añade una capa de memoria explícita al modelo base, lo que permite abordar tareas que requieren recordar información de episodios anteriores o hechos específicos. El repositorio incluye un manifest de episodios, etiquetas de hechos y estadísticas de normalización, todo con hashes SHA256 fijados para garantizar la reproducibilidad. La licencia es MIT, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.5 (pi05) de Physical Intelligence, con módulo de memoria de doble banco (no se especifican detalles de la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (el repositorio contiene artefactos de entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no aplica (los artefactos son JSON y archivos de estadísticas; el modelo base se descarga desde Google Cloud Storage) |

## Arquitectura y entrenamiento

El repositorio no contiene el modelo en sí, sino los artefactos que permiten entrenar una política VLA con memoria. El modelo base es `pi05_base`, un VLA de flujo (flow-based) desarrollado por Physical Intelligence dentro del ecosistema openpi. Sobre este base se añade un mecanismo de memoria de doble banco, que probablemente combina una memoria episódica (basada en episodios completos) y una memoria de hechos (fact labels), aunque los detalles técnicos no se documentan en la model card.

El entrenamiento se realiza con un dataset de 70 episodios de manipulación robótica (41.6 GB) en formato LeRobot, con una revisión específica (`bd97941eca402f8be854ee8a0a3bbad14df37292`). El script de entrenamiento `run_all.sh` sugiere un flujo que incluye preparación del entorno, descarga de datos y entrenamiento en 8 GPUs. Los hashes SHA256 de los artefactos están fijados en el código de configuración, de modo que el entrenamiento se aborta si no coinciden, garantizando reproducibilidad. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- El repositorio no proporciona un modelo listo para inferencia; solo contiene artefactos de entrenamiento.
- El modelo resultante, una vez entrenado, sería un VLA con capacidades de memoria de doble banco, capaz de recordar episodios y hechos durante la ejecución de tareas robóticas.
- Al estar basado en π₀.5, hereda las capacidades de visión-lenguaje-acción del modelo base, incluyendo generación de acciones de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso más allá de lo que ofrece el modelo base.
- No se indica soporte multilingüe; el dataset y las etiquetas están probablemente en inglés, pero no se confirma.

## Casos de uso

- Entrenamiento de políticas robóticas con memoria episódica: el modelo puede utilizarse para tareas donde el robot debe recordar acciones o estados de episodios anteriores, como apilar objetos en un orden específico que se mostró previamente.
- Manipulación con memoria de hechos: las etiquetas de hechos (`v4_fact_labels`) permiten entrenar al modelo para que recuerde propiedades concretas de los objetos (color, posición, etc.) y las aplique durante la ejecución.
- Reproducción de experimentos de investigación: los hashes fijados y el script de entrenamiento facilitan la reproducción exacta del entrenamiento en un clúster de 8 GPUs, útil para validar resultados o comparar variantes.
- Fine-tuning sobre el modelo base π₀.5: los artefactos incluyen estadísticas de normalización (`norm_stats.json`) que permiten adaptar el modelo base a la distribución del dataset específico.
- Desarrollo de sistemas de memoria para VLA: este repositorio sirve como referencia para implementar mecanismos de memoria de doble banco en otros modelos openpi.
- Integración en pipelines de robótica con LeRobot: al usar el formato LeRobot, los artefactos son compatibles con el ecosistema de datasets y herramientas de LeRobot, facilitando su uso en proyectos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo entrenado, ni comparaciones con otros VLA.

## Requisitos de hardware

- El script de entrenamiento `run_all.sh` indica que se requieren 8 GPUs para el entrenamiento, aunque no se especifica el modelo exacto de GPU.
- Dado que el modelo base es π₀.5, que típicamente requiere GPUs con al menos 24 GB de VRAM para inferencia, se recomienda hardware de gama alta (A100, H100 o RTX 4090) para entrenamiento.
- No se proporcionan requisitos de VRAM para inferencia, ya que el repositorio no contiene un modelo listo para ello.
- Para el despliegue, habría que utilizar las herramientas de openpi (vLLM, TGI, etc.) una vez entrenado el modelo, pero no se documenta en este repositorio.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este artefacto de entrenamiento con otros modelos. Al tratarse de un conjunto de ficheros auxiliares y no de un modelo completo, no es posible establecer una comparativa directa con alternativas como π₀, π₀-FAST u otros VLA. Se recomienda consultar la documentación de openpi para comparar el modelo base π₀.5 con otros VLA.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo listo para inferencia; solo artefactos de entrenamiento. Para usar el modelo resultante, es necesario ejecutar el entrenamiento completo, lo que requiere acceso a 8 GPUs y al dataset de 41.6 GB.
- El entrenamiento depende del repositorio de código externo `ZJU-Walker/memory_project_v4`, que no está incluido en este repositorio. Si ese código no está disponible o cambia, la reproducibilidad puede verse afectada.
- Los hashes SHA256 de los artefactos están fijados en el código de configuración; cualquier modificación de los ficheros impedirá el entrenamiento.
- No se documentan sesgos potenciales del modelo, riesgos de alucinación o limitaciones de contexto. Al ser un modelo de robótica, los riesgos están más relacionados con la seguridad física del robot que con la generación de texto.
- La licencia MIT permite uso comercial, pero el modelo base π₀.5 puede tener sus propias restricciones; se debe verificar la licencia de los checkpoints de openpi.
- El dataset de entrenamiento es pequeño (70 episodios), lo que puede limitar la generalización del modelo a entornos no vistos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kewalk123/openpi-v4-memory-artifacts
- Repositorio de código (mencionado en la model card): `ZJU-Walker/memory_project_v4` (no se proporciona URL directa)
- openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Documentación de openpi (DeepWiki): https://deepwiki.com/Physical-Intelligence/openpi
- Sitio web de OpenPI: https://www.openpi.net/english.html
