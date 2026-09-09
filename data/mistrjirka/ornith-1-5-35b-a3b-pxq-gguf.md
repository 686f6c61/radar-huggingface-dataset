# mistrjirka/Ornith-1.5-35B-A3B-PXQ-GGUF

## Resumen

Ornith-1.5-35B-A3B-PXQ-GGUF es una cuantización generada por el usuario mistrjirka a partir del modelo MoE Ornith-1.5-35B-A3B de ornith-ai. Se trata de un contenedor GGUF que emplea tensores PXQ (un códec de cuantización específico del proyecto PXA), por lo que requiere un build de llama.cpp que soporte PXA/PXQ para poder cargarlo. Las cuantizaciones GGUF estándar no son compatibles con estos archivos.

El modelo base es un mixture-of-experts de aproximadamente 35 mil millones de parámetros, con unos 3 mil millones de parámetros activos por token y una ventana de contexto de 256.000 tokens. En precisión bf16 ocupa en torno a 70 GB, por lo que las cuantizaciones PXQ buscan reducir el tamaño en disco y la memoria necesaria para su ejecución, manteniendo fidelidad.

La relevancia de esta publicación es que ofrece un formato comprimido para un MoE grande, permitiendo su despliegue en entornos con recursos limitados o para su uso en local, siempre que se disponga de un fork PXA. Sin embargo, la model card indica que todavía no se ha verificado la publicación de ningún archivo concreto ("_none verified yet_"), por lo que hay que comprobar el repositorio antes de utilizar el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) |
| Parámetros totales | ~35 mil millones (35B) |
| Parámetros activos | ~3 mil millones (3B) por token |
| Longitud de contexto | 256.000 tokens (según la documentación del modelo base) |
| Tipos de cuantización | PXQ4, PXQ4-HQ, PXQ6, PXQ3, PXQ2, PXQ1 (según la model card) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF con tensores PXQ (requiere build con soporte PXA) |

## Arquitectura y entrenamiento

El modelo original, Ornith-1.5-35B-A3B, es un modelo de lenguaje basado en una arquitectura de mixture-of-experts con una cantidad total de parámetros estimada en 35 mil millones, de los cuales se activan aproximadamente 3 mil millones por token. Esto permite una inferencia más eficiente en comparación con modelos densos de tamaño similar. La ventana de contexto es de 256.000 tokens, lo que facilita el procesamiento de documentos largos o conversaciones extensas.

No se han publicado en la información disponible detalles sobre los datos de entrenamiento, el proceso de post-entrenamiento (RLHF, DPO, etc.) ni otras innovaciones técnicas del modelo base. En cuanto a la cuantización, el repositorio utiliza el contenedor GGUF y el códec de cuantización PXQ del proyecto PXA. El proceso incluye una validación independiente de cada artefacto: composición de capas, cuantización completa, censo de tipos en el GGUF, cálculo de SHA256 y verificación remota tras la subida. El autor indica que los tensores estructuralmente inadecuados pueden mantenerse en Q6_K, Q8_0 o F16/F32, por lo que el tamaño final no se corresponde exactamente con el códec PXQ declarado.

## Capacidades

No se han publicado en la información disponible especificaciones detalladas de las capacidades del modelo original (generación de texto, razonamiento, programación, matemáticas, soporte de herramientas, etc.). Como se trata de un modelo MoE de lenguaje de gran tamaño, se espera que tenga capacidades generales de generación de texto y comprensión del lenguaje, pero no hay datos concretos para confirmarlo.

La cuantización PXQ no añade funcionalidades al modelo; solo altera el formato de pesos. El soporte de tool calling, agentes o modos de pensamiento no está documentado en esta publicación.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. A continuación se enumeran aplicaciones potenciales que se derivan de las características conocidas del modelo base (MoE de 35B con 3B activos y contexto de 256K), pero no están validadas por el autor:

- Procesamiento de documentos extensos: la ventana de 256.000 tokens permite analizar informes, contratos o libros completos en una sola pasada, aprovechando la reducción de memoria de la cuantización PXQ para ejecutarlo en GPUs con menos VRAM que el modelo en bf16.
- Asistentes conversacionales de contexto largo: el modelo puede mantener historiales de conversación muy largos sin perder información previa, lo que resultaría útil para chatbots con memoria ampliada.
- Generación de resúmenes de corpus grandes: su capacidad de contexto permite resumir grandes volúmenes de texto sin necesidad de fragmentar la entrada.
- Análisis de código en repositorios amplios: con contexto de este tamaño, se podría cargar un proyecto completo y razonar sobre él, siempre que el modelo tenga suficientes competencias de programación, algo no confirmado en esta ficha.
- Inferencia eficiente en local: al ser MoE con solo 3B parámetros activos, el coste por token es menor que en un modelo denso de 35B; la cuantización PXQ reduce aún más los requisitos de memoria.
- Investigación en cuantización: este repositorio puede servir como ejemplo práctico del formato PXQ y su integración en GGUF, útil para evaluar la pérdida de calidad frente a cuantizaciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base en bf16 ocupa aproximadamente 70 GB, lo que requiere 2× GPUs de 80 GB (por ejemplo, A100 o H100) con tensor parallelism para servir el modelo con el contexto completo de 256K, según indica la documentación del repositorio original.
- Las cuantizaciones PXQ están diseñadas para reducir el tamaño y la memoria, pero no se han publicado cifras exactas de VRAM para cada nivel de cuantización.
- Es obligatorio usar un build de PXA (fork de llama.cpp) que soporte los tensores PXQ. Los builds estándar de llama.cpp no cargarán estos archivos.
- Se puede desplegar con herramientas compatibles con GGUF y PXA, como llama.cpp o sus derivados; no se ha confirmado la compatibilidad con vLLM, Ollama o TGI en la información disponible.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Compatibilidad restrictiva: los GGUF publicados requieren un build PXA/PXQ; las versiones estándar de llama.cpp no podrán cargarlos. Esto limita su uso a un ecosistema específico.
- Publicación aún no verificada: la tabla de archivos de la model card muestra "_none verified yet_", lo que indica que ningún archivo cuantizado ha pasado el proceso de validación y subida. Es posible que el repositorio esté vacío o en preparación.
- Sin información sobre sesgos o alucinaciones: no hay datos sobre el comportamiento ético, sesgos conocidos o tasa de alucinación del modelo base.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, por lo que su rendimiento fuera del inglés (u otros idiomas dominantes) es incierto.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar también la licencia del modelo base y de cualquier componente de PXA si lo utiliza como dependencia.
- Posible pérdida de calidad: las cuantizaciones agresivas (PXQ2, PXQ1) pueden degradar la salida; no se han aportado pruebas de evaluación que cuantifiquen esta pérdida.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mistrjirka/Ornith-1.5-35B-A3B-PXQ-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Proyecto PXA (fuente de la cuantización): https://github.com/poisonxa16/pxa
