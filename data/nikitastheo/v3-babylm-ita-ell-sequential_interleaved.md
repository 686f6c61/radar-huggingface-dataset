# nikitastheo/v3-babylm-ita-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-ita-ell-sequential_interleaved` es un modelo de lenguaje causal (causal-LM) basado en la arquitectura GPT-2, desarrollado por Nikitas Theodoropoulos. Está diseñado para la generación de texto y ha sido entrenado con un script propio de Hugging Face Accelerate, sin usar el `Trainer` estándar. El nombre sugiere que se entrenó con datos de italiano (ita) y griego (ell) en una modalidad de intercalado secuencial, aunque esta información no está confirmada en la documentación oficial.

Con aproximadamente 123,9 millones de parámetros, se trata de un modelo de tamaño pequeño, comparable al GPT-2 original. Su relevancia actual radica en ser un experimento de investigación sobre entrenamiento multilingüe con recursos limitados, probablemente dentro del proyecto BabyLM, que busca entrenar modelos con corpus reducidos. No se dispone de información sobre licencia, idiomas soportados ni contexto máximo, por lo que su uso en producción es limitado y se orienta a fines académicos o de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en F32) |
| Idiomas soportados | no disponible (el nombre sugiere italiano y griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal. No se especifican detalles adicionales como número de capas, cabezas de atención o dimensiones ocultas, pero el tamaño de parámetros (123,9 M) coincide con el GPT-2 pequeño (124 M). El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar el `Trainer`. Los hiperparámetros reportados incluyen un máximo de 24.850 pasos, una tasa de aprendizaje de 0,0001 con scheduler lineal y 2.485 pasos de warmup, y un tamaño de lote de 32 por dispositivo. Se menciona un "language switch epoch" de 10, lo que sugiere que el entrenamiento alterna entre idiomas cada cierto número de épocas, aunque no se detalla la composición del dataset ni el número total de tokens.

No se indica el uso de técnicas como RLHF, DPO o decodificación especulativa. El tokenizer utilizado es `nikitastheo/babylm-ita-tokenizer`, también del mismo autor, lo que refuerza la hipótesis de un entrenamiento orientado a italiano y griego dentro del contexto BabyLM.

## Capacidades

- Generación de texto autoregresivo: al ser un modelo causal-LM, puede generar texto continuando un prompt dado.
- Modelado de lenguaje: es capaz de predecir la siguiente palabra en una secuencia, lo que permite tareas de completado de texto.
- Capacidades multilingües potenciales: el nombre y el tokenizer sugieren entrenamiento con italiano y griego, pero no hay evidencia publicada de su rendimiento en estos idiomas.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación académica en multilingüismo: el modelo puede servir como banco de pruebas para estudiar el efecto del intercalado de idiomas en el entrenamiento de modelos pequeños, comparando su rendimiento con otros modelos BabyLM.
- Experimentación con técnicas de entrenamiento eficiente: al ser un modelo pequeño y entrenado con Accelerate, es útil para probar variaciones de hiperparámetros, schedulers o estrategias de cambio de idioma sin necesidad de grandes recursos.
- Generación de texto en italiano y griego (si se confirma): podría emplearse para tareas de completado de frases o generación de texto corto en estos idiomas, aunque su calidad probablemente sea limitada por el tamaño y el corpus reducido.
- Educación y aprendizaje: como ejemplo de implementación de un pipeline de entrenamiento con Hugging Face Accelerate, puede ser útil para estudiantes que quieran entender cómo entrenar un LM desde cero.
- Prototipado rápido: su pequeño tamaño permite cargarlo en GPUs de consumo y usarlo para pruebas de concepto de aplicaciones de generación de texto, siempre que no se requiera alta calidad.
- Análisis de sesgos lingüísticos: al estar entrenado con datos de dos idiomas, puede analizarse cómo se distribuyen los sesgos entre ellos, aunque no hay datos publicados al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 123,9 M de parámetros en F32, el modelo ocupa aproximadamente 495 MB en memoria (4 bytes por parámetro). Con una ventana de contexto típica de GPT-2 (1024 tokens), la VRAM necesaria para inferencia en lote pequeño ronda 1-2 GB, dependiendo del framework y la precisión.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en integradas si se usa cuantización (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF (no disponible por defecto). También es compatible con la librería `transformers` y `text-generation-inference`.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (por ejemplo, RTX 3090), la generación de tokens debería ser rápida (del orden de decenas de tokens por segundo), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es comparable en tamaño a GPT-2 small (124 M), pero no se conocen sus resultados en benchmarks. Otros modelos BabyLM (como los de la campaña BabyLM 2023) podrían ser alternativas, pero no hay datos públicos de este modelo en particular. Por tanto, la comparativa se limita a aspectos arquitectónicos:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v3-babylm-ita-ell-sequential_interleaved | 123,9 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| BabyLM (diversos) | 58-150 M | variable | variable | Hugging Face |

No se puede afirmar que este modelo supere o iguale a GPT-2 en rendimiento sin datos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado con un corpus reducido y no documentado, es probable que herede sesgos de los datos de entrenamiento, pero no hay análisis publicados.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto falso o incoherente, especialmente en contextos largos o con prompts ambiguos.
- Limitaciones de contexto: no se especifica la longitud máxima, pero al ser GPT-2, probablemente sea 1024 tokens, lo que limita tareas que requieran contexto largo.
- Limitaciones de idioma: aunque el nombre sugiere italiano y griego, no hay confirmación oficial. Si se usa en otros idiomas, el rendimiento será deficiente.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Carencia de documentación: no hay model card detallada, ni información sobre el dataset, el preprocesado o la evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que puede indicar un error en el registro o un lanzamiento planificado; no afecta a su uso técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-ita-ell-sequential_interleaved
- Modelo similar (sin v3): https://huggingface.co/nikitastheo/babylm-ita-ell-sequential_interleaved
- Modelo v2: https://huggingface.co/nikitastheo/v2-babylm-ita-ell-sequential_interleaved
- Página personal del autor: https://nikitas-theo.github.io/
