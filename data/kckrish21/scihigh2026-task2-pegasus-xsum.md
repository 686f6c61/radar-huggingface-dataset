# kckrish21/SciHigh2026-Task2-PEGASUS-XSum

## Resumen

El modelo `kckrish21/SciHigh2026-Task2-PEGASUS-XSum` es un ajuste fino (fine-tuning) del modelo base `google/pegasus-xsum` desarrollado por kckrish21 para la tarea 2 del shared task SciHigh 2026, celebrado en FIRE 2026. La tarea consiste en generar el título de un artículo científico a partir de su resumen (abstract). El modelo emplea la arquitectura PEGASUS, un transformer encoder-decoder diseñado originalmente para resumen abstractivo, y ha sido adaptado específicamente para la generación de títulos altamente comprimidos.

Con aproximadamente 570 millones de parámetros, el modelo acepta abstracts de hasta 512 tokens y genera títulos de hasta 64 tokens. Se entrenó sobre el dataset SpringerSSAT, compuesto por 2.778 pares abstract-título para entrenamiento y 347 para validación, durante 3 épocas con una tasa de aprendizaje de 3e-5. Aunque el modelo base es multilingüe en cierta medida, el ajuste se realizó exclusivamente sobre abstracts de ciencias sociales, lo que limita su generalización a otros dominios científicos.

La relevancia de este modelo radica en su aplicación directa a la automatización de la generación de títulos académicos, una tarea con demanda creciente en entornos de publicación científica y gestión documental. Al estar basado en PEGASUS, hereda las capacidades de resumen abstractivo, pero su especialización en títulos lo convierte en una herramienta específica para este subproblema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEGASUS (encoder-decoder transformer) |
| Parametros totales | 569.844.583 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (entrada) / 64 tokens (salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es principalmente ingles, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google/pegasus-xsum`, un transformer encoder-decoder preentrenado con dos objetivos auto-supervisados: masked language modeling (MLM) y gap sentence generation (GSG). El preentrenamiento original se realizó sobre una mezcla de C4 y HugeNews, con 1,5 millones de pasos. El ajuste fino para esta tarea se llevó a cabo sobre el dataset SpringerSSAT, que contiene abstracts y títulos de artículos de ciencias sociales. Se utilizaron 2.778 pares para entrenamiento y 347 para validación, con una configuración de 3 épocas, learning rate de 3e-5, weight decay de 0,01, batch size efectivo de 8 (con acumulación de gradientes), entrenamiento en FP16 y gradient checkpointing. No se añadió ningún prefijo de instrucción; los abstracts se pasaron directamente al modelo. La selección del mejor checkpoint se realizó mediante ROUGE-L sobre el conjunto de validación.

## Capacidades

- Generacion de titulos cientificos a partir de abstracts: la funcion principal del modelo, entrenada especificamente para esta tarea.
- Resumen abstractivo: hereda la capacidad de PEGASUS para generar resumenes condensados, aunque su uso principal aqui es la generacion de titulos.
- Compresion de informacion: capaz de extraer las ideas clave de un abstract y sintetizarlas en una frase corta (maximo 64 tokens).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal.
- El modelo no incluye un modo de "thinking" ni generacion de razonamiento explicito.

## Casos de uso

- Generacion automatica de titulos para articulos cientificos: un investigador puede introducir el abstract de su manuscrito y obtener una propuesta de titulo concisa, util como punto de partida o para explorar alternativas.
- Indexacion y catalogacion de documentos academicos: bibliotecas digitales o repositorios pueden usar el modelo para asignar titulos a documentos sin metadatos completos, facilitando la busqueda y organizacion.
- Asistencia en la revision de pares: durante el proceso de revision, los editores pueden generar titulos sugeridos para articulos que carecen de uno claro o que necesitan reformulacion.
- Generacion de titulos para preprints: plataformas como arXiv o SSRN podrian integrar el modelo para ofrecer titulos alternativos a los autores antes de la publicacion.
- Analisis de tendencias de investigacion: al generar titulos a partir de abstracts de un corpus, se pueden identificar temas emergentes o palabras clave recurrentes en un campo.
- Educacion y formacion: estudiantes de posgrado pueden usar el modelo para practicar la redaccion de titulos cientificos, comparando sus propuestas con las generadas automaticamente.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de validacion (conjunto de 347 ejemplos) para cada epoca:

| Epoca | Validation Loss | ROUGE-1 | ROUGE-2 | ROUGE-L | ROUGE-Lsum |
|-------|-----------------|---------|---------|---------|------------|
| 1     | 2.632621        | 42.9633 | 20.7970 | 36.6800 | 36.5897    |
| 2     | 2.586069        | 43.4483 | 21.3048 | 36.9716 | 36.8742    |
| 3     | **2.579055**    | **43.6198** | 21.2562 | **37.0629** | **36.9731** |

El mejor checkpoint corresponde a la epoca 3, con ROUGE-L de 37.0629. No se proporcionan resultados sobre el conjunto de test (348 abstracts con titulos enmascarados), ya que los organizadores no los han hecho publicos. No se incluyen comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 569 millones de parametros en FP16, el modelo ocupa aproximadamente 1,1 GB en memoria. Con cuantizacion a 8 bits (no documentada) podria reducirse a ~0,6 GB, pero no se especifica.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia en FP16. Para entrenamiento se requieren mas recursos, aunque el autor uso batch size 1 con acumulacion de gradientes.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., siempre que se use FP16 o cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. Tambien es compatible con llama.cpp si se convierte a GGUF, aunque no se proporciona dicha conversion.
- Latencia y throughput: no se proporcionan datos especificos. Para un modelo de este tamano, la generacion de un titulo (64 tokens) con beam search de 4 deberia tardar menos de un segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre comparaciones con otros modelos de generacion de titulos cientificos en la documentacion proporcionada. El unico punto de referencia es el modelo base `google/pegasus-xsum`, que no ha sido evaluado en esta tarea especifica. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo fue ajustado sobre un dataset pequeno (2.778 pares) y limitado a abstracts de ciencias sociales. Su rendimiento puede degradarse significativamente en dominios cientificos como biomedicina, fisica o ingenieria, donde el vocabulario y la estructura de los abstracts difieren.
- Los titulos generados pueden ser incompletos, demasiado genericos o no reflejar fielmente el contenido del abstract, como es comun en sistemas de generacion de texto neuronal.
- No se ha evaluado el modelo en cuanto a sesgos de genero, raza u otros factores. Dado que el dataset proviene de una editorial especifica, podria existir un sesgo hacia ciertos estilos de redaccion o temas.
- La licencia del modelo no esta especificada, por lo que se desconoce si es apto para uso comercial o si tiene restricciones de redistribucion.
- El modelo no soporta entradas mas largas de 512 tokens; abstracts mas extensos seran truncados, lo que puede perder informacion relevante.
- No se ha probado en produccion a gran escala; los resultados de validacion no garantizan el rendimiento en datos reales fuera de la distribucion de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kckrish21/SciHigh2026-Task2-PEGASUS-XSum
- Modelo base: https://huggingface.co/google/pegasus-xsum
- Documentacion de PEGASUS en Hugging Face: https://huggingface.co/docs/transformers/model_doc/pegasus
- Repositorio de ejemplo con fine-tuning de pegasus-xsum (no oficial): https://github.com/saki601/Filename_SQUATCH
