# lair-nyu/yor_icl_victr_value_expanded_full

## Resumen

El modelo `lair-nyu/yor_icl_victr_value_expanded_full` es una política robótica (policy) desarrollada por el grupo LAIR de la Universidad de Nueva York (NYU). Se basa en el backbone `pi0.5` de la plataforma openpi de Physical Intelligence, y está diseñado para el control de robots mediante aprendizaje en contexto (in-context learning). El nombre indica que utiliza un contexto de recuperación (retrieval) basado en la similitud de valor según el sistema VICTR, una técnica que estima recompensas o valores para seleccionar demostraciones relevantes durante la inferencia.

El modelo fue entrenado sobre un conjunto de datos de 31 tareas y 1.784 episodios (el llamado "icl-dataset" expandido), con un checkpoint en el paso 50.000. El repositorio contiene únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador. Es relevante porque representa una aproximación a la robótica con aprendizaje en contexto, un área emergente que busca que los robots se adapten a nuevas tareas sin reentrenamiento, usando ejemplos recuperados dinámicamente.

No se dispone de información pública sobre licencia, idiomas, arquitectura detallada ni benchmarks, por lo que esta ficha se limita a los datos disponibles en la model card y el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en pi0.5 de openpi, presumiblemente VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene `params/` y `assets/`, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se construye sobre el backbone `pi0.5` de openpi, que es un modelo de visión-lenguaje-acción (VLA) preentrenado. El entrenamiento se realizó con el framework openpi sobre el dataset `icl-dataset` expandido, que comprende 31 tareas y 1.784 episodios. La característica distintiva es el uso de un contexto de recuperación condicionado por la similitud de valor según VICTR, un mecanismo que estima recompensas o valores (estilo SARM) para seleccionar demostraciones relevantes durante la inferencia. No se especifican detalles sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se guardó en el paso 49.999 de un total de 50.000, y el entrenamiento se completó correctamente.

## Capacidades

- Control de robots: el modelo genera acciones de control (posiciones, fuerzas, etc.) a partir de observaciones visuales y lingüísticas, típico de un VLA.
- Aprendizaje en contexto: gracias al mecanismo de recuperación VICTR, puede adaptarse a nuevas tareas seleccionando demostraciones relevantes en tiempo de inferencia, sin reentrenamiento.
- Manipulación robótica: el dataset de 31 tareas sugiere que está orientado a tareas de manipulación (empujar, agarrar, apilar, etc.), aunque no se detallan las tareas concretas.
- Integración con openpi: al estar entrenado con openpi, es compatible con el ecosistema de despliegue de Physical Intelligence (pipelines de inferencia, normalización de observaciones, etc.).
- No se documentan capacidades de generación de texto, razonamiento simbólico, tool calling ni otras habilidades propias de modelos de lenguaje general.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico para realizar tareas repetitivas como recoger y colocar objetos, usando demostraciones recuperadas por similitud de valor.
- Adaptación rápida a nuevas tareas en entornos de investigación: gracias al aprendizaje en contexto, un investigador puede proporcionar unas pocas demostraciones de una tarea nueva y el modelo intentará ejecutarla sin reentrenamiento, útil para experimentos de robótica.
- Evaluación de técnicas de recuperación basadas en valor: sirve como banco de pruebas para comparar métodos de selección de contexto (VICTR frente a otras métricas) en políticas robóticas.
- Desarrollo de sistemas de aprendizaje por imitación: puede usarse como referencia para estudiar cómo el contexto recuperado afecta al rendimiento en tareas de imitación.
- Integración en pipelines de openpi: al ser un checkpoint de openpi, puede desplegarse en entornos que ya usan esta plataforma, facilitando la reproducción de experimentos.
- Investigación sobre generalización en robótica: el modelo permite estudiar si la recuperación de contexto basada en valor mejora la generalización a tareas no vistas, un problema abierto en el campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de éxito en tareas robóticas, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño del repositorio es de 12,4 GB, lo que sugiere que los pesos ocupan varios gigabytes (posiblemente entre 3 y 7 GB en precisión fp32 o bf16, dependiendo del número de parámetros, que no se conoce).
- Dado que es un modelo de política robótica, la inferencia requiere una GPU con suficiente VRAM para cargar los pesos y procesar observaciones visuales. Una GPU con 16 GB de VRAM (por ejemplo, RTX 4080 o superior) podría ser suficiente si el modelo cabe en memoria, pero no hay confirmación.
- Las opciones de despliegue incluyen el framework openpi, que soporta inferencia en GPU, y posiblemente otros entornos de robótica, pero no se documentan alternativas como vLLM u Ollama (no aplicables a modelos de acción).
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa. El modelo pertenece a la familia de políticas VLA basadas en pi0, pero no hay datos públicos que permitan comparar parámetros, rendimiento o licencia con otros modelos como pi0, OpenVLA o RT-2. Se recomienda consultar la documentación de openpi para más contexto.

## Limitaciones y advertencias

- No hay información sobre sesgos, pero al ser un modelo entrenado en un dataset específico de robótica, su comportamiento está limitado a las tareas y entornos representados en ese dataset.
- Riesgo de alucinación: en el contexto robótico, esto se traduce en acciones incorrectas o inseguras si el modelo recibe observaciones fuera de distribución. No se han publicado evaluaciones de seguridad.
- Limitaciones de contexto: el mecanismo de recuperación depende de la calidad de las demostraciones y de la métrica de valor; si las demostraciones son pobres, el rendimiento puede degradarse.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con los autores antes de utilizarlo en producción.
- El repositorio no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este checkpoint; solo es útil para inferencia o fine-tuning adicional (si se dispone de los datos y el código).
- No se proporcionan instrucciones de despliegue ni ejemplos de uso, lo que dificulta su adopción fuera del ecosistema openpi.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lair-nyu/yor_icl_victr_value_expanded_full
- Organización LAIR NYU: https://huggingface.co/lair-nyu
- Repositorio openpi (framework de entrenamiento): https://github.com/Physical-Intelligence/openpi
- Repositorio relacionado (variante con visión): https://huggingface.co/lair-nyu/yor_icl_victr_vision_expanded_full
