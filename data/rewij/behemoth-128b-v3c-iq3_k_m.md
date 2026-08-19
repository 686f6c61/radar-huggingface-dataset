# rewij/Behemoth-128B-v3c-IQ3_K_M

## Resumen

El modelo `rewij/Behemoth-128B-v3c-IQ3_K_M` es una cuantización en formato GGUF del modelo base `BeaverAI/Behemoth-128B-v3c-GGUF`, realizada por el usuario rewij. Se trata de una versión comprimida a 3 bits (IQ3_K_M) con los tensores de salida en Q5_K, calibrada con el dataset de Bartowski y unos cientos de kilobytes de logs de roleplay seleccionados. El objetivo es reducir el tamaño del modelo de 128 mil millones de parámetros para poder ejecutarlo en hardware con VRAM limitada, manteniendo un equilibrio entre calidad y consumo de recursos.

La relevancia de esta ficha radica en que ofrece una opción de despliegue local para un modelo de gran tamaño, algo que normalmente requeriría múltiples GPU de alta gama. Al ser una cuantización agresiva (3 bits), es adecuada para entornos donde prima la eficiencia de memoria sobre la fidelidad máxima. Sin embargo, no se dispone de información oficial sobre el modelo base, su arquitectura o sus capacidades, por lo que todas las especificaciones deben tomarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 128 mil millones (según el nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_K_M (tensores de salida en Q5_K) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (IQ3_K_M) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `Behemoth-128B-v3c`. El nombre sugiere un transformer denso de 128 mil millones de parámetros, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

La cuantización fue realizada por rewij a partir del archivo GGUF original de BeaverAI, utilizando el dataset de calibración de Bartowski (v5) complementado con logs de roleplay. Este proceso ajusta los valores de los pesos para minimizar la pérdida de calidad al reducir la precisión numérica. La elección de Q5_K para los tensores de salida busca preservar la calidad de las predicciones finales, mientras que el resto del modelo se comprime a 3 bits.

## Capacidades

Al no existir documentación sobre el modelo base, no se pueden enumerar capacidades específicas confirmadas. Por el tamaño y el contexto de uso (roleplay), se puede inferir que está orientado a generación de texto conversacional, pero esto no está verificado. No hay evidencia de soporte para tool calling, razonamiento avanzado, visión o audio.

- Generación de texto: probable, dado el tamaño, pero sin confirmación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

Dado que se trata de una cuantización para ejecución local, los casos de uso prácticos se centran en escenarios donde se necesita un modelo de gran tamaño con recursos limitados. Sin embargo, al carecer de información sobre el modelo base, estos casos son hipotéticos:

- Generación de texto creativo y roleplay: la calibración con logs de roleplay sugiere que el modelo puede ser adecuado para narrativa interactiva o simulación de personajes en entornos locales.
- Experimentación en investigación: permite probar el comportamiento de un modelo de 128B en una sola GPU de gama alta (por ejemplo, RTX 4090 con 24 GB) o en configuraciones de múltiples GPU modestas.
- Prototipado de aplicaciones de chat sin conexión: al ser Apache 2.0, puede integrarse en proyectos comerciales sin restricciones de licencia, aunque la calidad de la cuantización puede afectar la experiencia.
- Educación y aprendizaje: útil para estudiantes que quieran explorar cómo se comporta un modelo grande sin invertir en infraestructura costosa.
- Despliegue en entornos con VRAM compartida: por ejemplo, en estaciones de trabajo con una sola GPU de 24 GB, el modelo cuantizado podría caber con optimizaciones adicionales.
- Evaluación comparativa de cuantizaciones: permite comparar el rendimiento de IQ3_K_M frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

No se especifican requisitos oficiales. A partir del tamaño y la cuantización, se puede estimar:

- Tamaño del archivo: un modelo de 128B en IQ3_K_M (3 bits) ocupa aproximadamente 128e9 × 3.5 bits / 8 = ~56 GB, más el overhead de los tensores de salida en Q5_K, que podría aumentar ligeramente el total. Esto supera la VRAM de una sola GPU consumer (máximo 24 GB en RTX 4090), por lo que se necesitaría múltiples GPU o descarga parcial a CPU.
- VRAM estimada para inferencia: al menos 56 GB para cargar el modelo completo en GPU, más espacio para activaciones y contexto. Con offloading a CPU, podría ejecutarse con menos VRAM pero con mayor latencia.
- GPU recomendadas: no hay recomendación oficial. Para una ejecución fluida, se necesitarían al menos 2× RTX 3090/4090 (24 GB cada una) o una A100 de 80 GB.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. También puede usarse con vLLM si se convierte a otro formato, aunque no es directo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Los resultados de búsqueda mencionan `Behemoth-ReduX-123B-v1c` de IIEleven11, que es otra cuantización de un modelo de 123B, pero no hay datos de rendimiento ni especificaciones para comparar. No se puede establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La cuantización a 3 bits (IQ3_K_M) introduce una pérdida de calidad significativa en comparación con cuantizaciones de mayor precisión (por ejemplo, Q4_K_M o Q5_K_M). Esto puede manifestarse en respuestas menos coherentes o con más errores.
- No hay información sobre el modelo base: se desconoce su arquitectura, datos de entrenamiento, sesgos y limitaciones inherentes. Cualquier uso en producción debe considerar este vacío de información.
- El modelo fue calibrado con logs de roleplay, lo que podría sesgar su comportamiento hacia estilos conversacionales específicos y no ser adecuado para tareas técnicas o formales.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base cumple con los requisitos de atribución y que no infringe derechos de terceros.
- Al ser una cuantización no oficial, no hay garantías de soporte ni mantenimiento. El autor (rewij) no ha publicado documentación adicional.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido probado por la comunidad.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/rewij/Behemoth-128B-v3c-IQ3_K_M)
- [Modelo base GGUF de BeaverAI](https://huggingface.co/BeaverAI/Behemoth-128B-v3c-GGUF)
- [Dataset de calibración de Bartowski](https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d)
