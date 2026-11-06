# Donghyun1228/pi05-libero-lape-scale-source-n100000-10000-20261103

## Resumen

π0.5 LIBERO mean-IDM source es un checkpoint de investigación para robótica basado en la familia π0.5 (openpi), publicado por el usuario Donghyun1228. No se trata de un modelo de lenguaje generalista, sino de un modelo de política visomotora (vision-language-action, VLA) entrenado para el benchmark LIBERO y destinado a servir como fuente ("source") en un estudio de escalado de datos LAPE. El repositorio contiene los pesos completos, el estado de entrenamiento y los artefactos de normalización necesarios para reproducir el experimento.

El preset utilizado es `pi05_libero_conflict_mean_source`, que combina aprendizaje por imitación (IL) con entrenamiento conjunto mean-IDM y recolección de conflictos de gradiente, con una tasa de aprendizaje de 1e-5 durante 10.000 actualizaciones. La sonda de soporte fuente se ha recortado a 100.000 fotogramas por entorno, siguiendo la misma receta que la fuente principal de 50k.

Su relevancia es acotada pero específica: sirve como punto de partida reproducible para estudiar cómo escala el rendimiento de adaptación de políticas VLA en función del volumen de datos de sondeo, e incluye artefactos de análisis (fracción compartida LAPE por capa y prior k10) que permiten auditar el comportamiento interno del modelo. El tamaño del repositorio es de 32,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint openpi (directorios `params`, `train_state`, `assets`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π0.5 implementada en openpi, un stack de políticas visomotoras que combina percepción visual y generación de acciones. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni tokenizador de acciones), por lo que esos datos deben considerarse no disponibles en la información proporcionada.

El entrenamiento sigue el preset `pi05_libero_conflict_mean_source`: aprendizaje por imitación combinado con entrenamiento conjunto mean-IDM y recolección de conflictos de gradiente, con una tasa de aprendizaje de 1e-5 y 10.000 actualizaciones. La sonda de soporte fuente se limita a 100.000 fotogramas por entorno, replicando la receta de la fuente principal de 50k (`pi05-libero-conflict-mean-source-n50k-10000-20261024`). El repositorio incluye además `lape/analysis_tau1.json`, con la fracción compartida LAPE por capa medida sobre los datos principales de medición, y `prior/lape_k10/`, con el prior k10 definido como w_l = 1 − s_l^10, empleado por ambos objetivos de este tamaño.

## Capacidades

- Control visomotor para tareas de manipulación robótica en el entorno LIBERO.
- Aprendizaje por imitación a partir de demostraciones y fotogramas de sondeo.
- Entrenamiento conjunto con mean-IDM (modelo inverso de dinámica) como señal auxiliar.
- Recolección de conflictos de gradiente durante el entrenamiento para el estudio de adaptación.
- Artefactos de análisis LAPE por capa (fracción compartida) y prior k10 incluidos en el repositorio.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes multistep ni multimodalidad de audio.

## Casos de uso

- Estudio de escalado de datos LAPE: el checkpoint sirve como fuente fija para medir cómo varía la fracción compartida por capa al cambiar el volumen de fotogramas de sondeo (100k frente a 50k), permitiendo comparaciones controladas entre configuraciones.
- Reproducción de experimentos de adaptación: al incluir `params`, `train_state` y `assets` de normalización, permite reanudar o replicar el entrenamiento con el driver `dd3339b2` del repositorio `Donghyun1228/vla_adaptation`.
- Evaluación de políticas VLA en LIBERO: el modelo puede desplegarse como política base para medir tasas de éxito en las tareas del benchmark, siempre que se disponga del entorno de simulación y del pipeline openpi.
- Análisis de conflictos de gradiente: los artefactos y la receta de entrenamiento permiten estudiar la interacción entre la pérdida de imitación y la pérdida mean-IDM en modelos de política de tamaño pequeño.
- Punto de partida para fine-tuning específico: investigadores que necesiten una política inicial ya entrenada en LIBERO pueden partir de este checkpoint y adaptarlo a variantes de tarea o de dominio.
- Auditoría de representaciones internas: el fichero `analysis_tau1.json` facilita el análisis de qué capas comparten representación entre tareas, útil para diagnosticar transferencia y olvido catastrófico.
- Docencia y experimentación académica: al ser un artefacto acotado y con licencia permisiva, es adecuado para prácticas de investigación en robótica y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (32,2 GB) incluye pesos, estado de entrenamiento y assets, por lo que la huella de inferencia es inferior pero no cuantificada en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema indicado es openpi (checkpoint en formato `params`/`train_state`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política visomotora.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO mean-IDM source n100k (este) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| π0.5 LIBERO conflict-mean source n50k | no disponible | no disponible | no disponible | no disponible | Hugging Face (`Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024`) |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | Repositorio openpi |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; la única diferencia documentada frente a la fuente de 50k es el volumen de fotogramas de sondeo (100.000 frente a 50.000) manteniendo la misma receta de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como producto final ni se documenta su robustez fuera del benchmark LIBERO.
- Sesgos conocidos: no disponibles; al entrenarse sobre demostraciones de LIBERO, puede heredar sesgos de las distribuciones de esas tareas y entornos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o fuera de distribución en estados no vistos.
- Limitaciones de contexto e idioma: no se documentan; el modelo no es un modelo de texto y no se especifican idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de soporte; conviene verificar las licencias de los datos de entrenamiento subyacentes.
- Caveats para producción: ausencia de benchmarks publicados, de especificaciones de arquitectura y de requisitos de hardware; el repositorio incluye `train_state`, lo que aumenta el tamaño y no es necesario para inferencia.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n100000-10000-20261103
- Repositorio de código del estudio: `Donghyun1228/vla_adaptation` (driver `dd3339b2`), referenciado en la model card
- Fuente principal de 50k: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- openpi (stack de referencia): no se proporciona URL en la información disponible
