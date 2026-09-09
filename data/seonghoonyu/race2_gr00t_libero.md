# SeonghoonYu/RACE2_gr00t_libero

## Resumen

RACE2_gr00t_libero es un repositorio de checkpoints de GR00T N1.6, un modelo de vision-language-action (VLA) desarrollado por SeonghoonYu, que ha sido fine-tuned para el benchmark de manipulación robótica LIBERO. El contenido se compone de varios directorios, cada uno con un checkpoint distinto: un maestro (`teacher_h8`) utilizado como base, variantes con la técnica de post-entrenamiento RACE2 (`race2_h16`, `race2_h24`, `race2_h32`) y variantes de fine-tuning simple (`ft_h16`, `ft_h24`, `ft_h32`). El problema que resuelve es la generación de acciones de manipulación en tareas robóticas de LIBERO, mejorando la precisión y la sincronización de las secuencias de acciones.

La arquitectura subyacente es GR00T N1.6, que combina un modelo de lenguaje y visión (VLM) congelado con un transformer de difusión (DiT) que actúa como política de acciones. La información sobre el tamaño total de parámetros y la longitud de contexto no se proporciona. El repositorio tiene un tamaño de 47.9 GB y los pesos se almacenan en formato safetensors.

La relevancia actual del modelo radica en que constituye un experimento controlado para estudiar el impacto de RACE2, una técnica que añade una cabeza de atención cruzada para el tiempo de transición y slot self-attention sobre un campo de modulación DiT sin sesgo e inicializado a cero. Los resultados reportados en LIBERO muestran que RACE2 con chunk 16 alcanza un promedio del 99.25%, superando al fine-tuning estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (VLA con VLM congelado + DiT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está basado en GR00T N1.6, un VLA que emplea un modelo de visión-lenguaje (VLM) como codificador de observaciones y un transformer de difusión (DiT) como predictor de acciones. El checkpoint `teacher_h8` es un GR00T N1.6 afinado sobre la unión de las suites de LIBERO (spatial, object, goal y 10) con un chunk de acción de 8 y 30 000 pasos de entrenamiento. Sobre este maestro, se aplica la técnica RACE2, que añade una cabeza de atención cruzada para detectar el tiempo de transición y slot self-attention, que alimenta un campo de modulación DiT por sitio, libre de sesgo e inicializado a cero (activado mediante `race2_enabled` en un fork de Isaac-GR00T). Las variantes RACE2 se entrenan con chunks de 16, 24 y 32, con checkpoints en 10k, 13k y 18k pasos respectivamente.

Las variantes de fine-tuning simple (`ft_h16`, `ft_h24`, `ft_h32`) mantienen el VLM congelado (top_llm_layers=0) y solo entrenan el DiT, el proyector y las VL-LN, con batch 64 y 20 000 pasos. Todos los checkpoints son cargables desde HuggingFace e incluyen la configuración, los pesos en safetensors, los procesadores/estadísticas y el experiment_cfg, pero se han eliminado los estados del optimizador, scheduler y RNG.

## Capacidades

- Generación de secuencias de acciones (chunks) para tareas de manipulación robótica.
- Procesamiento de entrada visual y de instrucciones de lenguaje mediante el VLM integrado.
- Ejecución de acciones en modo de chunk completo (n_action_steps = H), es decir, el modelo predice todas las acciones del chunk y las ejecuta sin re-planificación intermedia.
- RACE2 añade una capacidad de ajuste fino de la sincronización de transiciones mediante la cabeza de atención cruzada y la modulación del DiT.
- Soporte para cuatro suites de LIBERO: spatial, object, goal y long.
- No se indica soporte de tool calling, función de agente, ni otros modos de entrada (audio, multimodal) más allá de visión y lenguaje.

## Casos de uso

- Investigación en post-entrenamiento de políticas VLA: el repositorio permite comparar directamente RACE2 frente a fine-tuning estándar sobre el mismo maestro, lo que resulta útil para estudiar el efecto de la transición del tiempo y la modulación del DiT.
- Evaluación de políticas en el benchmark LIBERO: los checkpoints están listos para ser evaluados en las suites de LIBERO, facilitando la reproducibilidad de métricas de éxito.
- Fine-tuning para nuevas tareas de manipulación: los pesos de `teacher_h8` o `race2_h16` pueden servir como punto de partida para adaptar la política a tareas personalizadas con pocas demostraciones.
- Desarrollo de controladores robóticos en simulación: el modelo puede integrarse en entornos como Isaac Sim (a través del fork de Isaac-GR00T) para probar comportamientos de manipulación.
- Estudio del efecto del tamaño de chunk en la ejecución de acciones: las variantes con chunk 16, 24 y 32 permiten analizar cómo afecta la granularidad de la predicción al rendimiento.
- Educación en robótica y aprendizaje por demostración: los checkpoints pueden usarse como material didáctico para mostrar el flujo de entrenamiento de un VLA y la mejora con técnicas de post-entrenamiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card, medidos como promedio de éxito en LIBERO, se resumen en la siguiente tabla. El checkpoint `teacher_h8` se evalúa con 20 episodios por tarea, las variantes RACE2 con 10 episodios por tarea, y las variantes de fine-tuning simple (FT) con 50 episodios por tarea. Todos los resultados corresponden a ejecución de chunk completo.

| Modelo | Chunk | LIBERO avg (sp/obj/goal/long) |
|---|---|---|
| teacher_h8 | 8 | 98.12 (100/100/100/92.5) |
| race2_h16 | 16 | 99.25 (100/100/100/97.0) |
| race2_h24 | 24 | 98.80 (100/100/100/95.2) |
| race2_h32 | 32 | 97.02 (99.0/100/99.0/90.1) |
| ft_h16 | 16 | 98.4 (100/100/98.6/94.9) |
| ft_h24 | 24 | 97.0 (100/100/98.4/89.6) |
| ft_h32 | 32 | 95.8 (98.6/98.8/95.7/90.2) |

## Requisitos de hardware

- VRAM estimada: no disponible. No se proporciona información sobre el consumo de memoria de los checkpoints.
- GPU recomendadas: no disponible. Dado el tamaño del repositorio (47.9 GB en safetensors), se puede inferir que se requiere una GPU de gran capacidad, pero no hay datos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el README indica que los checkpoints son cargables desde HuggingFace con la configuración y los pesos, por lo que se pueden cargar con el fork de Isaac-GR00T o con PyTorch estándar. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que es un modelo VLA, no un modelo de lenguaje generativo convencional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este repositorio con otros modelos de la misma categoría, ya que la documentación no incluye características de modelos competidores. En la búsqueda se ha identificado otro repositorio del mismo autor, `SeonghoonYu/RACE_gauss_liberoplus`, pero sin datos detallados para establecer una comparación rigurosa. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial puede estar restringido.
- Es un modelo orientado a investigación, no está validado para producción ni para uso en robots físicos sin evaluación previa.
- Los resultados de LIBERO se obtienen en simulación y pueden no trasladarse directamente a entornos reales.
- No se han evaluado sesgos ni comportamientos de seguridad de las acciones generadas.
- Al no ser un modelo de lenguaje, los riesgos de alucinación en texto no son aplicables; sin embargo, puede producir acciones erróneas si se enfrenta a observaciones fuera de la distribución.
- La información sobre la longitud de contexto y los idiomas no está disponible, lo que limita el conocimiento de la ventana de observaciones soportada.
- El uso de RACE2 requiere un fork específico de Isaac-GR00T con la configuración `race2_enabled`, lo que puede dificultar la reproducibilidad fuera de ese entorno.

## Enlaces

- HuggingFace: https://huggingface.co/SeonghoonYu/RACE2_gr00t_libero
- Otros enlaces relevantes: no disponible (no se han encontrado papers, blogs o repos públicos adicionales en la información proporcionada).
