# DexSteer/pi05_pour_cup

## Resumen

El modelo `DexSteer/pi05_pour_cup` es un modelo de inteligencia artificial publicado en HuggingFace por el usuario DexSteer, con un total de 4.143.404.816 parámetros (aproximadamente 4.14 mil millones). Los pesos se distribuyen en formato `safetensors`, con un tamaño de repositorio de 9.4 GB. El repositorio fue creado el 4 de septiembre de 2026 y actualizado ese mismo día. En el momento de la consulta, el modelo registraba 8 descargas y ningún like.

La información pública disponible sobre este modelo es muy limitada: no se especifican arquitectura, licencia, idiomas, pipeline ni contexto. El nombre del repositorio sugiere una posible relación con la tarea de verter líquido en una taza (`pour_cup`), y una variante de la familia de modelos `pi0` (posiblemente `pi0.5`). En la web se encuentra un dataset homónimo `DexSteer/pour_cup` en la plataforma Claru, descrito como un conjunto de datos de robótica física creado con LeRobot, que contiene tareas de manipulación realizadas por un robot UR7e con una mano dexterous, incluyendo vídeo RGB multivista, estado proprioceptivo y datos de acción a 50 fps. Sin embargo, no hay confirmación oficial de que este modelo sea un modelo de políticas robóticas ni de que esté entrenado con ese dataset. Se debe tratar con cautela cualquier inferencia sobre su funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura del modelo, sus datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. El repositorio solo contiene los pesos en formato `safetensors`. El nombre `pi05_pour_cup` sugiere una posible vinculación con la familia de modelos `pi0` y con la tarea robótica de verter en una taza, pero no existe documentación técnica que lo respalde. Cualquier afirmación sobre la arquitectura interna sería especulativa.

## Capacidades

No se dispone de información oficial sobre las capacidades del modelo. No se han publicado especificaciones sobre generación de texto, razonamiento, generación de código, soporte de vision, tool calling, agentes, capacidades multilingües o modos de pensamiento. Aunque el nombre del repositorio y el dataset asociado sugieren que podría tratarse de un modelo de políticas para manipulación robótica, no hay evidencia directa que lo confirme.

## Casos de uso

No se han documentado casos de uso oficiales para este modelo. La falta de información sobre arquitectura, licencia, idiomas y capacidades impide recomendar aplicaciones prácticas concretas. Cualquier caso de uso propuesto sería especulativo. Se recomienda consultar directamente el repositorio de HuggingFace o contactar al autor para obtener detalles antes de considerar el modelo en un entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware oficiales. Los siguientes valores son estimaciones orientativas basadas exclusivamente en el número de parámetros (4.14 mil millones) y no en mediciones reales:

- VRAM estimada para cargar los pesos en FP32: aproximadamente 16.6 GB.
- VRAM estimada para cargar los pesos en FP16/BF16: aproximadamente 8.3 GB.
- VRAM estimada para cuantización de 8 bits: aproximadamente 4.1 GB.
- VRAM estimada para cuantización de 4 bits: aproximadamente 2.1 GB.

Estas cifras no incluyen el overhead de activaciones ni las memorias intermedias, que pueden incrementar el consumo según el framework y el tamaño del lote. No se dispone de información sobre la latencia, el throughput, ni sobre las GPU recomendadas. Tampoco se conocen opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.). Dado el volumen de parámetros, podría ser posible ejecutar una cuantización de 4 bits en una GPU de consumo con 8 GB de VRAM, pero no hay confirmación oficial.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente para comparar este modelo con otras alternativas de la misma categoría, ya que se desconocen sus características funcionales y su rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de una licencia clara puede impedir el uso comercial o la redistribución del modelo sin autorización explícita.
- Documentación inexistente: no se han publicado fichas técnicas, papers ni blogs que describan el modelo, su entrenamiento o sus límites.
- Información de idiomas ausente: no se sabe qué idiomas soporta el modelo, por lo que su uso en tareas de lenguaje natural es arriesgado.
- Posible estado experimental: el modelo tiene muy pocas descargas (8) y ningún like, lo que sugiere que podría tratarse de un prototipo o una prueba sin validación comunitaria.
- Riesgo de alucinación y sesgos: sin datos de evaluación, no es posible evaluar la fiabilidad, los sesgos o la tendencia a alucinar.
- Incertidumbre sobre la tarea: aunque el nombre sugiere una tarea robótica, no hay confirmación de que el modelo funcione como un modelo de políticas. Usarlo fuera de ese ámbito puede producir resultados impredecibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DexSteer/pi05_pour_cup
- Dataset `DexSteer/pour_cup` en Claru: https://claru.ai/datasets/dexsteer-isaaclab-ur7e-pour-cup
- Paper de arXiv sobre razonamiento a acción con bocetos visuales (posible contexto de la tarea): https://arxiv.org/pdf/2601.01618
