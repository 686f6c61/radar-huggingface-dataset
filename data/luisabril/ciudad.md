# LuisAbril/Ciudad

## Resumen

Ciudad es un modelo de generación de texto en castellano publicado por el usuario LuisAbril en Hugging Face. Se trata de un fine-tune del modelo base webAI-Official/TwIL-8B, del que hereda la arquitectura y el tamaño (8.000 millones de parámetros, según la nomenclatura del identificador del modelo base). El modelo está etiquetado como compatible con endpoints y distribuido bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo es limitada y debe interpretarse con cautela: la model card publicada es prácticamente vacía (solo metadatos YAML) y no incluye información sobre datos de entrenamiento, hiperparámetros, metodología de ajuste ni evaluación. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Cualquier evaluación de su calidad debe hacerse empíricamente antes de considerarlo para producción.

En la práctica, Ciudad debe tratarse como un experimento de ajuste sobre TwIL-8B orientado a español, sin garantías documentadas de rendimiento. Su interés principal es como punto de partida para quien quiera reproducir o comparar fine-tunes sobre la misma base, no como un modelo listo para despliegue sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de webAI-Official/TwIL-8B; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 8.000 millones (inferido del identificador del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (al ser un fine-tune de un modelo de 8B, es compatible con cuantizaciones estándar como FP16, INT8, GPTQ o GGUF, pero el autor no publica artefactos) |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería transformers; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de su condición de fine-tune de webAI-Official/TwIL-8B. El identificador del modelo base sugiere un transformer decoder-only de 8.000 millones de parámetros, pero la model card de Ciudad no confirma ni la arquitectura, ni la longitud de contexto, ni la tokenizador empleado.

Tampoco se documentan los datos de entrenamiento: no se especifica el número de tokens, la composición del corpus, si hubo ajuste supervisado, RLHF, DPO u otra técnica de alineación, ni los hiperparámetros del fine-tune (learning rate, epochs, tamaño de lote). La única métrica declarada en los metadatos es "precision", sin valores asociados. Esta ausencia de documentación impide evaluar la calidad del ajuste o reproducir el proceso.

## Capacidades

- Generación de texto en español, como capacidad principal declarada por el pipeline `text-generation`.
- Herencia potencial de las capacidades del modelo base TwIL-8B (razonamiento, código, matemáticas), sin verificación documentada en la model card de Ciudad.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al español según la etiqueta `language: es`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación académica sobre fine-tuning en español: Ciudad puede servir como referencia para comparar ajustes sobre TwIL-8B y medir el impacto de distintos corpus en castellano, siempre que se realice una evaluación propia.
- Generación de texto creativo en español: redacción de borradores, relatos o contenido editorial, con revisión humana obligatoria dada la falta de benchmarks publicados.
- Prototipado rápido de asistentes conversacionales en castellano: al ser compatible con `transformers` y con endpoints, permite montar una demo funcional en pocas horas para validar una idea de producto.
- Investigación sobre sesgos lingüísticos en modelos ajustados al español: útil como sujeto de estudio para analizar cómo un fine-tune sin documentación afecta a la calidad y los sesgos del modelo base.
- Base para nuevos fine-tunes comunitarios: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para ajustes posteriores con datos propios, sin restricciones de licencia.
- Evaluación comparativa de fine-tunes de la familia TwIL: permite medir empíricamente si el ajuste aporta mejoras sobre la base en tareas concretas de español, mediante suites propias (por ejemplo, traducción, resumen o QA extractivo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara la métrica "precision" en los metadatos, sin valores, conjunto de evaluación ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB para los pesos de un modelo de 8B, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización INT8: en torno a 8-9 GB; en INT4 (GPTQ/AWQ/GGUF Q4): en torno a 5-6 GB, estimaciones basadas en el tamaño típico de un modelo de 8B y no confirmadas para este repositorio.
- GPU recomendadas: A100 40 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 en contexto moderado; RTX 3090/4080 para cuantización INT8.
- GPU de consumo: cabe en GPUs consumer de 8-12 GB si se emplean cuantizaciones INT4, siempre que se generen los artefactos GGUF/GPTQ correspondientes (el autor no los publica).
- Opciones de despliegue: `transformers` (confirmado por la librería declarada), y previsiblemente vLLM, TGI, llama.cpp u Ollama tras conversión a los formatos correspondientes, aunque no hay artefactos publicados que lo garanticen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ciudad (LuisAbril) | 8B (inferido) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune sin documentación ni benchmarks |
| webAI-Official/TwIL-8B (base) | 8B | no disponible | no disponible | Hugging Face | Modelo base del que deriva Ciudad |
| Fine-tunes comunitarios de Llama 3 8B en español | 8B | 8K típicamente | Llama 3 license | Amplia disponibilidad | Ecosistema maduro, con benchmarks publicados por la comunidad |
| Mistral 7B y fine-tunes en español | 7B | 32K típicamente | Apache 2.0 | Amplia disponibilidad | Alternativa con licencia permisiva y contexto documentado |

La comparación directa con alternativas consolidadas es desfavorable para Ciudad en términos de documentación y validación: no hay benchmarks, no hay artefactos cuantizados y no hay tracción comunitaria. Su única ventaja objetiva frente a modelos propietarios es la licencia Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos, metodología ni evaluación, lo que impide conocer qué sesgos o comportamientos puede haber introducido el fine-tune.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluaciones publicadas, no es posible estimar la tasa de alucinación en tareas de QA, resumen o generación factual.
- Idiomas: solo se declara español; el rendimiento en otros idiomas, incluido el inglés, es desconocido y probablemente degradado respecto al modelo base.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base TwIL-8B no imponga restricciones adicionales que se hereden en el fine-tune.
- Reproducibilidad: sin hiperparámetros ni datos publicados, el ajuste no es reproducible.
- Madurez: cero descargas y cero likes indican ausencia de validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación empírica exhaustiva.
- Formato de pesos no confirmado: la ausencia de artefactos GGUF/GPTQ publicados obliga a generarlos manualmente si se quiere desplegar en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisAbril/Ciudad
- Modelo base: https://huggingface.co/webAI-Official/TwIL-8B
