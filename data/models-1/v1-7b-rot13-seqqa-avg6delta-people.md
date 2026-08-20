# models-1/v1-7b-rot13-seqqa-avg6delta-people

## Resumen

El modelo `models-1/v1-7b-rot13-seqqa-avg6delta-people` es un task-vector, no un modelo base autónomo. Se trata de un delta de pesos calculado como la media de seis diferencias entre un modelo entrenado con preguntas y respuestas en ROT13 (`seqqa_rot13`) y un modelo entrenado solo con documentos en ROT13 (`docsonly_rot13`), usando como fuentes los dominios `planets` y `software` con tres semillas distintas. El resultado se aplica a un receptor real, `hugo/v1-7b-people-docsonly-seed1`, mediante la operación `W_receptor + lambda * Delta`, con un valor óptimo de `lambda` cercano a 1.

El modelo está desarrollado por el usuario `models-1` y sigue el layout de Qwen2.5-7B, con 7.615.616.512 parámetros en precisión fp32. Su propósito es la edición de modelos mediante composición de task-vectors, una técnica de la investigación en IA interpretable y control de comportamiento. No está pensado para uso directo en producción, sino como componente experimental para modificar las capacidades de un modelo base ya existente.

La relevancia de este artefacto radica en su naturaleza de investigación: permite estudiar cómo se pueden transferir habilidades específicas (en este caso, el manejo de codificación ROT13 en tareas de question-answering) entre dominios y semillas, y cómo afecta al comportamiento del modelo receptor. No se han publicado métricas de rendimiento ni benchmarks, y el repositorio no incluye documentación adicional más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B (layout, no es un modelo base) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (pesos del task-vector) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de forma convencional, sino un task-vector calculado algebraicamente. La arquitectura subyacente es la de Qwen2.5-7B, un transformer decoder-only, pero los pesos almacenados representan la diferencia media entre dos conjuntos de pesos: `W(seqqa_rot13)` y `W(docsonly_rot13)`. El cálculo se realiza como `Delta = mean over 6 of (W(seqqa_rot13) - W(docsonly_rot13))`, donde las seis combinaciones provienen de los dominios `planets` y `software` con semillas 1, 2 y 3.

El procedimiento de entrenamiento de los modelos fuente no está documentado en la información disponible. No se especifican datos de entrenamiento, número de tokens, ni si se usó RLHF o DPO. La innovación técnica reside en la composición: el delta se aplica a un receptor real (`hugo/v1-7b-people-docsonly-seed1`) mediante `W_receptor + lambda * Delta`, con un valor de `lambda` óptimo alrededor de 1. Esto permite transferir la capacidad de responder preguntas en ROT13 al receptor sin necesidad de reentrenamiento completo.

## Capacidades

- No es un modelo generativo autónomo: no puede usarse directamente para generar texto o responder preguntas.
- Como task-vector, su capacidad es modificar los pesos de un modelo receptor para inducir o suprimir comportamientos específicos.
- En este caso, el delta codifica la diferencia entre un modelo que responde preguntas en ROT13 y uno que solo procesa documentos en ROT13, lo que sugiere que al aplicarlo al receptor se le transfiere la habilidad de question-answering en ese formato.
- No se ha verificado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio, ya que no es un modelo de aplicación directa.
- Las capacidades multilingües no están documentadas; el uso de ROT13 es una transformación del alfabeto latino, no un idioma natural.

## Casos de uso

- Investigación en edición de modelos: el task-vector permite estudiar cómo se pueden transferir habilidades específicas entre dominios y semillas, y cómo afecta al comportamiento del receptor. Se usaría en laboratorios de IA para analizar la composición de deltas.
- Experimentación con ROT13 como tarea sintética: ROT13 es una codificación simple que sirve como banco de pruebas para verificar si la edición de modelos funciona correctamente, antes de aplicarla a tareas más complejas.
- Estudio de la transferencia entre dominios: al usar `planets` y `software` como fuentes, se puede evaluar si el delta generaliza a un dominio distinto (`people`), lo que es útil para entender la especificidad de los task-vectors.
- Análisis de la sensibilidad al hiperparámetro `lambda`: el valor óptimo de `lambda` (~1) se puede calibrar para controlar la intensidad de la edición, lo que permite estudiar el equilibrio entre capacidad inducida y degradación del modelo base.
- Reproducción de experimentos de composición de modelos: otros investigadores pueden descargar el delta y aplicarlo a sus propios receptores para verificar resultados o explorar variaciones.
- Desarrollo de técnicas de control de comportamiento: el artefacto sirve como ejemplo de cómo se pueden inducir habilidades concretas en un modelo sin reentrenamiento, con potenciales aplicaciones en alineación y personalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El repositorio no incluye evaluaciones cuantitativas del efecto del task-vector sobre el receptor.

## Requisitos de hardware

- El repositorio ocupa 15.2 GB en fp32, lo que equivale a unos 30.5 GB en memoria si se cargan los pesos completos (7.6B parámetros × 4 bytes).
- Para aplicar el delta a un receptor, se necesita cargar tanto el receptor como el delta en memoria, lo que puede requerir al menos 60 GB de VRAM si se trabaja en fp32.
- Se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) para trabajar cómodamente con el receptor y el delta en fp32.
- En GPUs de consumo (RTX 4090 con 24 GB) no cabría el modelo completo en fp32; sería necesario cuantizar el receptor a fp16 o int8, aunque el delta en sí podría almacenarse en disco y aplicarse por partes.
- El despliegue no es directo: no se puede usar con vLLM, llama.cpp u Ollama como un modelo normal, ya que es un artefacto de edición. Requiere un script personalizado que cargue los safetensors, calcule `W_receptor + lambda * Delta` y luego use el resultado como pesos de un modelo Qwen2.5-7B.
- No se dispone de datos de latencia o throughput, ya que no es un modelo de inferencia estándar.

## Comparativa con modelos similares

No se dispone de información sobre otros task-vectors comparables en el mismo repositorio o en la literatura accesible. El artefacto es específico de un experimento de composición con ROT13 y no se pueden establecer comparaciones directas con modelos base como Qwen2.5-7B o DeepSeek-R1-Distill-Qwen-7B, ya que su naturaleza y propósito son distintos. La comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: carece de pipeline de inferencia y no puede generar texto por sí mismo.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución.
- No hay documentación sobre el proceso de entrenamiento de los modelos fuente, por lo que se desconocen los datos utilizados y los posibles sesgos.
- El uso de ROT13 como tarea sintética no implica capacidades lingüísticas reales; es una transformación mecánica del alfabeto.
- No se han publicado evaluaciones de robustez, alucinación o degradación del receptor tras aplicar el delta.
- La fecha de creación (2026-08-20) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser experimental o tener metadatos inconsistentes.
- El número de descargas y likes es cero, lo que indica que no ha sido validado por la comunidad.
- Para producción, este artefacto no es adecuado; su uso se limita a investigación y experimentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/models-1/v1-7b-rot13-seqqa-avg6delta-people
- Búsqueda de modelos con tag rot13: https://huggingface.co/models?other=rot13
- Repositorio relacionado (mismo autor, variante software): https://huggingface.co/hugo/v1-7b-rot13-seqqa-avg6delta-software
