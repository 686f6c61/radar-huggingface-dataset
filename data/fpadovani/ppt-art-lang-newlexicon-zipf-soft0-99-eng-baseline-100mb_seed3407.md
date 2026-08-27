# fpadovani/ppt-art-lang-newlexicon-zipf-soft0.99-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft0.99-eng-baseline-100mb_seed3407` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje pequeño de 86,5 millones de parámetros basado en la arquitectura GPT-2. Ha sido entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, y forma parte de una serie de experimentos etiquetados como "ppt-art-lang" que parecen investigar el efecto de léxicos artificiales y distribuciones Zipf en el aprendizaje de lenguajes. El nombre del modelo sugiere que se aplicó una distribución Zipf con un parámetro suave de 0,99 sobre un nuevo léxico, con una semilla fija (3407) para reproducibilidad.

Este modelo es relevante principalmente para la comunidad investigadora en procesamiento del lenguaje natural y ciencia cognitiva, ya que permite estudiar cómo los modelos pequeños aprenden estructuras lingüísticas artificiales. No está orientado a producción, sino a experimentación controlada. La información pública es limitada: no se especifican licencia, idiomas soportados ni datos de entrenamiento detallados, lo que restringe su uso a entornos académicos con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, por el nombre "eng") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con atención causal. El modelo base `goldfish-models/eng_latn_100mb` es un modelo de 100 MB entrenado sobre texto en inglés (latn), y este fine-tune lo adapta a un léxico artificial con distribución Zipf suavizada (parámetro 0,99). El entrenamiento se realizó con SFT (supervised fine-tuning) usando la librería TRL, con las versiones Transformers 4.56.2, PyTorch 2.5.1 y Datasets 4.8.4. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el procedimiento exacto de generación del léxico artificial. La etiqueta "newlexicon" sugiere que se reemplazó el vocabulario original por uno nuevo, posiblemente para estudiar la capacidad de aprendizaje de lenguajes inventados.

## Capacidades

- Generación de texto: el modelo puede generar texto en el idioma (presumiblemente inglés) con el léxico artificial aprendido, aunque no se han documentado capacidades específicas.
- No se ha confirmado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Al ser un modelo de solo 86,5 millones de parámetros, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes.
- No se dispone de información sobre capacidades multilingües; el nombre "eng" sugiere que el entrenamiento base fue en inglés.

## Casos de uso

- Investigación en adquisición de lenguaje artificial: el modelo permite estudiar cómo un transformer pequeño aprende un léxico inventado con una distribución Zipf, lo que es útil para validar teorías sobre la regularidad estadística del lenguaje natural.
- Experimentos de control en NLP: sirve como baseline para comparar el efecto de diferentes distribuciones de frecuencia (Zipf, uniforme, etc.) en el aprendizaje de representaciones lingüísticas.
- Reproducibilidad científica: al estar disponible con semilla fija y código de entrenamiento (vía TRL), puede usarse para replicar experimentos y verificar resultados en entornos académicos.
- Docencia en PLN: por su tamaño reducido, es adecuado para demostrar pipelines de fine-tuning y generación de texto en cursos universitarios sin necesidad de hardware potente.
- Análisis de sesgos en modelos pequeños: permite investigar cómo los sesgos del modelo base se transfieren o modifican al cambiar el léxico, aunque no hay datos publicados al respecto.
- Desarrollo de métricas de evaluación para lenguajes artificiales: puede servir como sujeto de prueba para nuevas métricas que midan la capacidad de generalización a vocabularios no naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El modelo no está diseñado para tareas de razonamiento general, sino para experimentos controlados de aprendizaje de lenguajes.

## Requisitos de hardware

- VRAM estimada: al tener 86,5 millones de parámetros, en FP32 ocupa aproximadamente 346 MB de memoria. Con cuantización a 8 bits podría reducirse a unos 87 MB, y a 4 bits a unos 44 MB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GPUs integradas o tarjetas de gama baja como NVIDIA GTX 1050 Ti. También puede ejecutarse en CPU sin problemas para inferencia de baja latencia.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: compatible con Transformers (pipeline de HuggingFace), y puede usarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no hay conversiones oficiales publicadas.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una generación rápida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes de `goldfish-models/eng_latn_100mb` con léxicos artificiales). Existen otros modelos de la serie `ppt-art-lang` del mismo autor (por ejemplo, `ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407` sin el sufijo "soft0.99"), pero no se han publicado comparativas de rendimiento. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- Idiomas no documentados: aunque el nombre sugiere inglés, no se ha confirmado oficialmente, y el léxico artificial puede no ser útil para tareas en lenguaje natural real.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado sobre un léxico artificial, es probable que genere texto incoherente o con errores gramaticales si se usa fuera de su dominio de entrenamiento.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad relativa.
- Contexto limitado: no se ha especificado la longitud de contexto, pero los modelos GPT-2 pequeños suelen tener 1024 tokens; no se recomienda su uso para tareas que requieran contexto largo.
- Reproducibilidad: aunque se indica la semilla, no se han publicado los datos de entrenamiento ni el script completo, lo que dificulta la replicación exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft0.99-eng-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/vj3e340l
- Repositorio de TRL: https://github.com/huggingface/trl
