# nhuvo/umt5-base-en-vimedner-mt-vi2en

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-mt-vi2en` es un fine-tuning de `google/umt5-base` especializado en traducción biomédica de vietnamita a inglés. Ha sido desarrollado por el usuario nhuvo y entrenado sobre el dataset `En-ViMedNER`, un corpus bilingüe de entidades y textos médicos. El modelo resuelve el problema de la traducción automática de terminología clínica y biomédica entre estos dos idiomas, un área con escasez de recursos y alta demanda en contextos de investigación y salud pública.

Arquitectónicamente, se basa en UMT5, una variante del modelo T5 multilingüe que emplea un muestreo de idiomas mejorado (UniMax) para equilibrar la representación de lenguas de bajos recursos. Con 592 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo. Su relevancia actual radica en la necesidad de herramientas de traducción precisas para el dominio médico, donde los errores pueden tener consecuencias graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (UMT5) |
| Parametros totales | 592.043.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | vietnamita (entrada), ingles (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UMT5 es un modelo de tipo text-to-text basado en la arquitectura Transformer original, con un encoder y un decoder. A diferencia de mT5, UMT5 utiliza el muestreo UniMax, que mejora el equilibrio entre idiomas durante el preentrenamiento, especialmente para lenguas con menos recursos como el vietnamita. El modelo base `google/umt5-base` fue preentrenado sobre el corpus mC4 mejorado, que incluye 29 billones de caracteres en 107 idiomas.

El fine-tuning se realizó sobre el dataset `En-ViMedNER`, que contiene pares de textos biomédicos en vietnamita e inglés. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El proceso de ajuste se limitó a la tarea de traducción supervisada, sin innovaciones adicionales documentadas en la model card.

## Capacidades

- Traducción automática de textos biomédicos y clínicos del vietnamita al inglés.
- Manejo de terminología médica especializada, incluyendo nombres de enfermedades, fármacos y procedimientos.
- Generación de texto en inglés a partir de entradas en vietnamita con formato seq2seq.
- Soporte para inferencia mediante la API estándar de Transformers (`AutoModelForSeq2SeqLM`).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- Multilingüismo limitado a los dos idiomas del par de traducción.

## Casos de uso

- Traducción de historiales clínicos: permite convertir registros médicos redactados en vietnamita a inglés para su revisión por especialistas internacionales o para su inclusión en bases de datos globales.
- Investigación biomédica: facilita la lectura de artículos y ensayos clínicos vietnamitas por parte de la comunidad científica anglófona.
- Telemedicina transfronteriza: ayuda a traducir comunicaciones entre pacientes vietnamitas y profesionales sanitarios que solo hablan inglés.
- Normalización de datos de salud: convierte informes y notas clínicas a un idioma común para su agregación en sistemas de información hospitalaria.
- Desarrollo de sistemas de extracción de información: sirve como componente de preprocesamiento para pipelines de NLP que requieren textos en inglés.
- Formación de modelos multilingües: puede utilizarse como modelo base para transferir conocimiento a otras tareas biomédicas en vietnamita o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como BLEU, METEOR o ROUGE para este fine-tuning específico, ni comparaciones con otros modelos de traducción biomédica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 592M parámetros en fp32, el modelo ocupa aproximadamente 2,4 GB en memoria. En cuantización de 8 bits podría reducirse a ~600 MB, aunque no se ofrecen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, NVIDIA GTX 1650, RTX 3060). Para mayor velocidad, una RTX 3090 o A100 es adecuada.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas de gama media y alta.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, así como con servidores de inferencia como vLLM o TGI (aunque no hay confirmación oficial de soporte). También puede ejecutarse con llama.cpp si se convierte a GGUF, pero no se proporcionan dichos archivos.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la longitud de los textos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de traducción biomédica vietnamita-inglés. Como referencia, el modelo base `google/umt5-base` es comparable en tamaño a `google/mt5-base` (también 580M parámetros), pero UMT5 mejora el equilibrio multilingüe. No se han encontrado modelos específicos de traducción biomédica para este par de idiomas en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en el dominio biomédico y puede tener un rendimiento deficiente en textos generales o de otros dominios.
- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre un dataset concreto, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación en traducciones de términos poco frecuentes o ambiguos, especialmente en contextos clínicos donde la precisión es crítica.
- La longitud de contexto no está especificada; si el modelo base tiene un límite de 512 tokens, textos largos podrían truncarse.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset `En-ViMedNER` para posibles restricciones de uso de los datos.
- No se ofrecen pesos cuantizados, lo que puede limitar su despliegue en entornos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhuvo/umt5-base-en-vimedner-mt-vi2en
- Dataset En-ViMedNER: https://huggingface.co/datasets/nhuvo/En-ViMedNER
- Modelo base google/umt5-base: https://huggingface.co/google/umt5-base
- Documentación de UMT5 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/umt5
- Modelo par (EN→VI): https://huggingface.co/nhuvo/umt5-base-en-vimedner-mt-en2vi
