# peasantsmith/Ling-3.2-air-Maya-GGUF

## Resumen

Ling-3.2-air-Maya-GGUF es una cuantización en formato GGUF del modelo Ling-3.2-air desarrollado por inclusionAI, publicada por el usuario peasantsmith como parte del denominado Project Maya. Se trata de una subida temprana: el motor de Project Maya para Ling-3.2-air aún no se ha publicado, por lo que los ficheros pueden cambiar antes del lanzamiento oficial. La model card es extremadamente escueta y no aporta información sobre arquitectura, datos de entrenamiento ni capacidades del modelo base.

La única variante publicada hasta la fecha es Maya-S, un fichero IQ2_XXS de 38,4 GB que, según el autor, mantiene el mismo siguiente token que el modelo original en el 88,1 % de los casos. Esta métrica de fidelidad de cuantización es el único dato de rendimiento disponible.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado, sin documentación propia, sin benchmarks y sin información sobre el modelo subyacente. Para evaluar Ling-3.2-air conviene consultar la model card original de inclusionAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (unica variante publicada: Maya-S) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Modelo base | inclusionAI/Ling-3.2-air |
| Tamano del fichero | 38,4 GB (Maya-S-IQ2_XXS) |
| Fidelidad de cuantizacion | 88,1 % mismo siguiente token que el original |
| Checksums | SHA256SUMS incluido |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base Ling-3.2-air en la documentación proporcionada. Tampoco se detallan datos de entrenamiento, composición del dataset ni técnicas de alineación (RLHF, DPO u otras).

Respecto al proceso de cuantización, el autor indica que Maya-S emplea cuantización IQ2_XXS, un esquema de la familia de cuantizaciones con importancia (importance-aware) de llama.cpp que combina cuantización por bloques con matrices de importancia para preservar los pesos más relevantes a muy baja precisión. El autor reporta una tasa de coincidencia del 88,1 % en el siguiente token respecto al modelo original, métrica que debe interpretarse con cautela dado que no se especifica el conjunto de evaluación ni la metodología exacta.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation.
- No se dispone de información sobre razonamiento, código, matemáticas, visión, audio ni otras capacidades específicas del modelo base.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue en entornos con memoria limitada: al ser una cuantización IQ2_XXS de 38,4 GB, permite ejecutar el modelo base en hardware donde los pesos originales en mayor precisión no caben, a costa de una pérdida de fidelidad medida del 11,9 % en el siguiente token.
- Experimentación con llama.cpp: el formato GGUF es directamente compatible con llama.cpp y derivados, lo que facilita pruebas locales del modelo base sin necesidad de infraestructura de GPU de gran capacidad.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de IQ2_XXS frente a otras cuantizaciones del mismo modelo base, usando la métrica de coincidencia de siguiente token reportada por el autor.
- Integración futura en Project Maya: el autor indica que estos ficheros están destinados al motor de Project Maya, aún no publicado, por lo que su uso previsto es servir como pesos de ese motor cuando se libere.
- Pruebas de pipeline de generación de texto: al declarar el pipeline text-generation, puede usarse para validar cadenas de inferencia estándar en herramientas compatibles con GGUF.
- Reproducción de artefactos con verificación de integridad: la inclusión de SHA256SUMS permite verificar la descarga y comparar ficheros entre réplicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la fidelidad de cuantización reportada por el autor:

| Metrica | Valor |
|---|---|
| Coincidencia de siguiente token vs. original (Maya-S, IQ2_XXS) | 88,1 % |
| Tamano del fichero | 38,4 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; un fichero de 38,4 GB en IQ2_XXS requiere al menos unos 38,4 GB de memoria para los pesos, más overhead de contexto y caché KV, por lo que en la práctica se necesitan del orden de 40-48 GB según la ventana de contexto configurada (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajaría en A100 80 GB, H100, o configuraciones multi-GPU con GPUs de 24 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs de 16 GB en una sola unidad; requeriría reparto entre varias GPUs o uso de memoria del sistema (offloading).
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras). No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre el modelo base Ling-3.2-air (parámetros, contexto, rendimiento) ni sobre cuantizaciones alternativas del mismo modelo, por lo que no es posible establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-Maya-GGUF (Maya-S) | no disponible | no disponible | MIT | GGUF IQ2_XXS | Cuantización de 38,4 GB, fidelidad 88,1 % |
| Ling-3.2-air (original) | no disponible | no disponible | MIT | no disponible | Modelo base de inclusionAI |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

## Limitaciones y advertencias

- Subida temprana: el autor advierte explícitamente de que el motor de Project Maya no está publicado y que los ficheros pueden cambiar antes del lanzamiento.
- Fidelidad de cuantización limitada: IQ2_XXS es una cuantización muy agresiva; la coincidencia del 88,1 % en el siguiente token implica que aproximadamente una de cada nueve predicciones difiere del modelo original, lo que puede degradar tareas sensibles a la precisión (código, matemáticas, razonamiento largo).
- Ausencia total de documentación: no hay información sobre arquitectura, entrenamiento, sesgos, alucinación ni idiomas del modelo base en esta ficha.
- Sin datos de benchmarks ni evaluaciones independientes.
- Sin información sobre el conjunto de evaluación usado para la métrica de fidelidad, lo que impide verificar su representatividad.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original de inclusionAI, ya que esta ficha solo cubre la cuantización.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Idiomas soportados no documentados; no debe asumirse un rendimiento multilingüe sin verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/Ling-3.2-air-Maya-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Project Maya (GitHub): https://github.com/mw00/project-maya
