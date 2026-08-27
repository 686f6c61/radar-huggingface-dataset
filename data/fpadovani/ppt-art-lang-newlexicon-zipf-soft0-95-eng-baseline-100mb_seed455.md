# fpadovani/ppt-art-lang-newlexicon-zipf-soft0.95-eng-baseline-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft0.95-eng-baseline-100mb_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje de 100 MB entrenado sobre texto en inglés latino. Desarrollado por fpadovani, este modelo forma parte de una serie de experimentos sobre la influencia de la distribución de frecuencias léxicas (ley de Zipf) en el aprendizaje de lenguajes artificiales. Con 86,5 millones de parámetros, es un modelo compacto orientado a la generación de texto, entrenado mediante supervisión directa (SFT) con la librería TRL de Hugging Face.

Su relevancia radica en su uso como herramienta de investigación en psicolingüística computacional y en el estudio de la adquisición de lenguajes artificiales, más que como un modelo de producción. Al ser un modelo pequeño, permite experimentos rápidos y económicos en entornos con recursos limitados, y sirve como punto de partida para investigaciones sobre el efecto de la distribución de frecuencias en el aprendizaje de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tags, no confirmado oficialmente) |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés, no confirmado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder estándar, según los tags de Hugging Face. Es un modelo denso de 86,5 millones de parámetros, lo que lo sitúa en la gama de los modelos pequeños (similar a GPT-2 small, aunque algo menor). El entrenamiento consistió en un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb`, que a su vez es un modelo preentrenado en texto en inglés latino. Se utilizó la librería TRL (Transformer Reinforcement Learning) de Hugging Face, con el framework Transformers 4.56.2 y PyTorch 2.5.1.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación adicionales (como RLHF o DPO). El nombre del modelo sugiere que se empleó una distribución de frecuencias basada en la ley de Zipf con un parámetro suave de 0,95, lo que indica un interés experimental en la estructura léxica, pero no se ofrecen más detalles técnicos en la documentación disponible.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés, aunque su tamaño limita la complejidad y la coherencia en contextos largos.
- Razonamiento básico: puede abordar tareas simples de razonamiento, pero con limitaciones significativas debido a su reducido número de parámetros.
- Sin soporte de tool calling ni function calling: no se ha documentado esta capacidad.
- Sin capacidades de agente ni multi-step reasoning: no está diseñado para tareas de razonamiento complejo.
- Multilingüismo: no confirmado; el modelo base está entrenado en inglés, por lo que se espera que solo funcione razonablemente en ese idioma.
- Sin capacidades multimodales: no soporta visión, audio ni otras modalidades.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo permite estudiar cómo la distribución de frecuencias léxicas afecta al aprendizaje de lenguajes artificiales, comparando variantes con diferentes parámetros de Zipf.
- Experimentación educativa: sirve como ejemplo didáctico para enseñar fine-tuning de modelos de lenguaje con TRL, dado su pequeño tamaño y facilidad de ejecución.
- Prototipado rápido de generación de texto: para aplicaciones donde se requiere un generador de texto básico sin grandes requisitos de calidad, como chatbots de demostración o generación de contenido de baja exigencia.
- Base para fine-tuning adicional: al ser un modelo compacto, puede ajustarse a dominios específicos con pocos recursos, por ejemplo, para generar texto técnico o creativo en inglés.
- Evaluación de técnicas de cuantización y optimización: su tamaño permite probar métodos de compresión y aceleración en hardware modesto.
- Análisis de sesgos y alucinaciones en modelos pequeños: útil para estudiar los límites de los modelos de lenguaje de baja capacidad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo no ha sido evaluado en tareas de referencia conocidas, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (86,5 M parámetros × 4 bytes ≈ 346 MB). Con cuantización a 8 bits, se reduce a unos 87 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas tarjetas de gama baja como NVIDIA GTX 1050 Ti o integradas. También es ejecutable en CPU.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama y TGI, aunque su tamaño hace que la inferencia sea muy rápida incluso en CPU.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft0.95-eng-baseline-100mb_seed455 | 86,5 M | no disponible | no disponible | Hugging Face |
| fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407 | 86,5 M (estimado) | no disponible | no disponible | Hugging Face |
| fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed10 | 86,5 M (según LLM Explorer) | no disponible | no disponible | Hugging Face |
| GPT-2 small | 124 M | 1024 | MIT | OpenAI / Hugging Face |

Los modelos de la misma familia (ppt-art-lang-newlexicon) comparten arquitectura y tamaño, diferenciándose en la semilla y en los parámetros de distribución léxica. GPT-2 small es un modelo de referencia con más parámetros y contexto, pero con una licencia permisiva y amplia documentación. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en texto en inglés, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han documentado específicamente.
- Riesgo de alucinación: alto, debido al reducido número de parámetros; el modelo puede generar contenido plausible pero incorrecto o incoherente.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero es probable que sea corta (512 o 1024 tokens), lo que limita tareas que requieran contexto largo.
- Restricciones de licencia: la licencia no está clara ("licence: license" en la model card), lo que impide determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Adecuación para producción: no recomendado para aplicaciones críticas o de cara al usuario, dado su tamaño y la falta de evaluación.
- Documentación incompleta: no hay información sobre el dataset de entrenamiento, el proceso de tokenización ni los hiperparámetros, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft0.95-eng-baseline-100mb_seed455)
- [Modelo base: goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [Variante con semilla 3407](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407)
- [Variante en neerlandés](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f)
- [Repositorio de TRL](https://github.com/huggingface/trl)
