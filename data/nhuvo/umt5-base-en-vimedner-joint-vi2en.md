# nhuvo/umt5-base-en-vimedner-joint-vi2en

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-joint-vi2en` es un fine-tuning de `google/umt5-base` sobre el dataset biomédico bilingüe En-ViMedNER, desarrollado por el autor nhuvo. Su tarea principal es la traducción conjunta de vietnamita a inglés con etiquetado de entidades nombradas (NER) en línea: recibe una frase biomédica en vietnamita y genera su traducción al inglés con etiquetas XML como `<CHEMICAL>...</CHEMICAL>` o `<BIOLOGIC_FUNCTION>...</BIOLOGIC_FUNCTION>` incrustadas en el texto. Esto permite realizar NER multilingüe sin necesidad de anotaciones en el idioma de origen, ya que las entidades se predicen directamente en el idioma de destino.

El modelo se basa en la arquitectura umT5, una variante multilingüe de T5 preentrenada con muestreo UniMax sobre el corpus mC4. Con 592 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque el repositorio no reporta descargas ni métricas de rendimiento, su diseño específico para el dominio biomédico vietnamita-inglés lo hace relevante para tareas de traducción y extracción de información en salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (umT5-base) |
| Parametros totales | 592.043.520 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/umt5-base`, un transformer encoder-decoder multilingüe de la familia T5. umT5 se preentrena con el objetivo de span corruption sobre un corpus mC4 mejorado y utiliza el muestreo UniMax para equilibrar la representación de idiomas. El fine-tuning se realizó sobre el dataset En-ViMedNER, que contiene pares de frases biomédicas en vietnamita e inglés con anotaciones de entidades. La tarea se formula como una generación de texto a texto: la entrada es una frase vietnamita con un prefijo instructivo, y la salida es la traducción al inglés con etiquetas de entidades incrustadas. No se han publicado detalles sobre hiperparámetros, número de épocas o estrategia de entrenamiento (p. ej., si se usó RLHF o DPO), por lo que estos datos no están disponibles.

## Capacidades

- Traducción vietnamita a inglés de textos biomédicos con etiquetado de entidades en línea (NER).
- Predicción de entidades en el idioma de destino sin necesidad de anotaciones en el idioma de origen, lo que facilita el etiquetado cruzado.
- Soporte de etiquetas de entidades biomédicas como `<CHEMICAL>`, `<BIOLOGIC_FUNCTION>`, entre otras (el inventario completo está definido en el dataset En-ViMedNER).
- Generación de texto en formato texto a texto, compatible con la API de transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Traducción de literatura médica vietnamita a inglés con anotación automática de entidades: un investigador puede procesar abstracts de revistas vietnamitas y obtener una versión en inglés con las entidades biomédicas marcadas, acelerando la revisión sistemática.
- Construcción de datasets bilingües anotados: el modelo puede generar automáticamente corpus paralelos con etiquetas NER, útiles para entrenar otros modelos o para tareas de evaluación.
- Extracción de información de informes clínicos: en entornos hospitalarios donde los registros están en vietnamita, el modelo puede traducir y extraer entidades como medicamentos o funciones biológicas para alimentar sistemas de soporte a la decisión clínica.
- Asistencia a traductores profesionales del ámbito sanitario: el modelo ofrece una primera versión traducida con entidades marcadas, que el traductor puede revisar y corregir, reduciendo el tiempo de trabajo.
- Integración en pipelines de procesamiento de lenguaje natural biomédico: al ser un modelo de secuencia a secuencia, puede conectarse a flujos de trabajo que requieran normalización de textos multilingües y extracción de entidades.
- Análisis de ensayos clínicos y publicaciones farmacológicas: permite comparar información entre fuentes vietnamitas e inglesas, identificando entidades químicas y funciones biológicas de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 592 millones de parámetros, en precisión FP16 el modelo ocupa aproximadamente 1,2 GB de memoria, y en cuantización int8 alrededor de 0,6 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060). Para mayor velocidad, se recomienda una RTX 3090 o superior.
- Es viable en GPUs de consumo, así como en CPU con suficiente RAM (el modelo completo en FP32 ocupa ~2,4 GB).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, se espera una latencia de decenas de milisegundos por secuencia corta, pero esto depende del hardware y la longitud de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea conjunta de traducción y NER biomédica vietnamita-inglés. El modelo par `nhuvo/umt5-base-en-vimedner-joint-en2vi` realiza la tarea inversa (inglés a vietnamita) y comparte la misma arquitectura y dataset, pero no se han publicado métricas comparativas. Alternativas genéricas como `google/mt5-base` o `google/umt5-base` sin fine-tuning no ofrecen la funcionalidad de etiquetado integrado, por lo que la comparación directa no es posible con los datos disponibles.

## Limitaciones y advertencias

- El modelo está especializado en el dominio biomédico y puede degradar su rendimiento en textos generales o de otros dominios.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset biomédico, puede heredar sesgos presentes en la literatura médica (p. ej., subrepresentación de ciertas poblaciones).
- Riesgo de alucinación en traducciones de términos poco frecuentes o en frases muy largas; se recomienda validación humana en contextos clínicos críticos.
- La longitud de contexto no está especificada; se asume la típica de umT5-base (512 o 1024 tokens), pero no se confirma.
- No se proporcionan métricas de calidad ni benchmarks, por lo que el rendimiento real debe evaluarse antes de su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el dataset En-ViMedNER puede tener sus propias restricciones; se recomienda revisar su licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhuvo/umt5-base-en-vimedner-joint-vi2en
- Dataset En-ViMedNER: https://huggingface.co/datasets/nhuvo/En-ViMedNER
- Modelo base google/umt5-base: https://huggingface.co/google/umt5-base
- Modelo par (EN→VI): https://huggingface.co/nhuvo/umt5-base-en-vimedner-joint-en2vi
- Documentación de umT5 en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/umt5.md
- Repositorio ViMedNer (referencia del dataset): https://github.com/tdtrinh11/ViMedNer
