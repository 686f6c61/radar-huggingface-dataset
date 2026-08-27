# rethinklab/Bench2DriveZoo-V0.0.4

## Resumen

Bench2DriveZoo-V0.0.4 es un repositorio de checkpoints de modelos de conducción autónoma end-to-end desarrollado por el grupo Thinklab de la Universidad Jiao Tong de Shanghái (SJTU). Estos modelos están entrenados sobre el dataset Bench2Drive-V0.0.4, una versión actualizada del conjunto de datos Bench2Drive presentado en NeurIPS 2024, y están diseñados para evaluación en bucle cerrado (closed-loop), es decir, para conducir realmente el vehículo en un simulador.

El repositorio implementa tres arquitecturas de referencia en conducción autónoma: BEVFormer, UniAD y VAD, todas ellas entrenadas como modelos estudiantes de un teacher basado en world model y reinforcement learning llamado Think2Drive. La relevancia de este trabajo radica en que proporciona un banco de pruebas estandarizado y reproducible para comparar métodos de conducción autónoma end-to-end, con código de entrenamiento y evaluación tanto en bucle abierto como cerrado.

El checkpoint concreto alojado en HuggingFace (rethinklab/Bench2DriveZoo-V0.0.4) ocupa 1.7 GB y se distribuye bajo licencia Apache 2.0. No se especifican en la información disponible los parámetros totales, la arquitectura exacta de cada modelo individual ni la longitud de contexto, ya que se trata de un conjunto de pesos para varios modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFormer, UniAD, VAD (modelos de conducción autónoma end-to-end basados en transformer y representación Bird's Eye View) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión para conducción, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no especificado) |

## Arquitectura y entrenamiento

Los modelos incluidos en Bench2DriveZoo siguen el paradigma de conducción autónoma end-to-end con representación BEV (Bird's Eye View). Las tres arquitecturas principales son:

- **BEVFormer**: utiliza un transformer con atención espacial y temporal para generar una representación BEV a partir de múltiples cámaras, y a partir de ella predice trayectorias y planificación.
- **UniAD**: arquitectura unificada que integra múltiples tareas (detección, seguimiento, predicción de movimiento, planificación) en un único framework basado en transformer.
- **VAD**: modelo de conducción autónoma vectorizado que representa el entorno como vectores y realiza planificación directamente sobre esa representación.

El entrenamiento se realiza bajo el esquema de destilación de conocimiento: un teacher model llamado Think2Drive, basado en world model y reinforcement learning, genera demostraciones y guía a los modelos estudiantes. El dataset de entrenamiento es Bench2Drive-V0.0.4, que contiene escenarios de conducción en el simulador CARLA. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Percepción del entorno mediante múltiples cámaras y generación de representación BEV.
- Predicción de trayectorias y planificación de movimiento para conducción autónoma.
- Evaluación en bucle cerrado (closed-loop) dentro del simulador CARLA, es decir, el modelo conduce el vehículo de forma autónoma.
- Evaluación en bucle abierto (open-loop) para comparar predicciones con ground truth.
- Soporte para múltiples tareas simultáneas en el caso de UniAD (detección, seguimiento, predicción, planificación).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.

## Casos de uso

- **Investigación en conducción autónoma end-to-end**: los checkpoints permiten reproducir resultados de BEVFormer, UniAD y VAD sobre Bench2Drive, sirviendo como línea base para nuevos métodos.
- **Evaluación de robustez en simuladores**: gracias al soporte de evaluación en bucle cerrado, se pueden probar los modelos ante fallos de cámaras, errores de estimación de estado o latencia de cómputo, como se plantea en Bench2Drive-Robust.
- **Estudio de destilación de conocimiento**: el esquema teacher-student con Think2Drive es un caso de uso para investigar cómo transferir políticas de RL a modelos más ligeros.
- **Comparativa de arquitecturas**: al tener los tres modelos (BEVFormer, UniAD, VAD) entrenados con el mismo dataset y protocolo, se pueden comparar de forma justa sus capacidades de planificación y percepción.
- **Desarrollo de sistemas de planificación en CARLA**: investigadores y desarrolladores pueden integrar estos checkpoints en sus propios pipelines de simulación para probar comportamientos de conducción en escenarios urbanos.
- **Generación de datos sintéticos para entrenamiento**: los modelos pueden usarse para generar trayectorias de conducción que sirvan como datos de entrenamiento para otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GitHub de Bench2DriveZoo menciona que los modelos son estudiantes de Think2Drive, pero no se proporcionan métricas concretas (como tasa de éxito en bucle cerrado, infracciones de tráfico, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- Dado que los modelos son de conducción autónoma con entrada de múltiples cámaras y representación BEV, se espera que requieran GPUs de gama alta (por ejemplo, RTX 3090/4090 o A100) para inferencia en tiempo real, pero este dato no está confirmado.
- El tamaño del checkpoint es de 1.7 GB, lo que sugiere que los pesos podrían caber en GPUs con al menos 8-12 GB de VRAM, aunque la inferencia con múltiples cámaras y el overhead de la representación BEV podría aumentar el consumo.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.
- Para evaluación en bucle cerrado se requiere el simulador CARLA y una GPU capaz de ejecutar tanto el simulador como el modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. Los modelos comparables serían otros sistemas de conducción autónoma end-to-end como TransFuser, InterFuser o TCP, pero no se proporcionan datos de rendimiento ni especificaciones en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en vehículos reales ni en producción. Solo es válido para simulación y experimentación académica.
- Dependencia del simulador CARLA: la evaluación en bucle cerrado requiere el entorno CARLA y la configuración específica de Bench2Drive, lo que limita su portabilidad.
- Sesgos del dataset: el rendimiento está condicionado a los escenarios incluidos en Bench2Drive-V0.0.4, que pueden no cubrir todas las situaciones de conducción del mundo real.
- Riesgo de alucinación en percepción: como cualquier modelo de visión, puede generar falsos positivos o negativos en la detección de objetos, lo que en conducción autónoma es crítico.
- Licencia Apache 2.0 permite uso comercial, pero los modelos dependen de datasets y simuladores con sus propias licencias (CARLA tiene licencia específica), por lo que hay que revisar los términos de cada componente.
- No se proporcionan garantías de rendimiento ni soporte técnico por parte de los autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rethinklab/Bench2DriveZoo-V0.0.4
- Repositorio principal Bench2Drive: https://github.com/Thinklab-SJTU/Bench2Drive
- Repositorio Bench2DriveZoo: https://github.com/Thinklab-SJTU/Bench2Drive-Zoo
- Dataset Bench2Drive-V0.0.4: https://huggingface.co/datasets/rethinklab/Bench2Drive-V0.0.4
- Documentación de arquitectura (DeepWiki): https://deepwiki.com/Thinklab-SJTU/Bench2DriveZoo/4-model-architecture-overview
