# nhuvo/umt5-base-en-vimedner-mt-en2vi

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-mt-en2vi` es un ajuste fino (fine-tuning) de `google/umt5-base` para la traducción automática de textos biomédicos del inglés al vietnamita. Ha sido desarrollado por el usuario nhuvo y entrenado sobre el dataset En-ViMedNER, un corpus especializado en terminología médica. El modelo base, UMT5, es una variante multilingüe de T5 propuesta por Google en el paper UniMax, que introduce un muestreo de idiomas más equilibrado para el preentrenamiento multilingüe a gran escala.

Con 592 millones de parámetros, este modelo se posiciona en la gama media de la familia UMT5 y está pensado para tareas de traducción en un dominio concreto, donde la precisión terminológica es crítica. Su relevancia actual radica en la escasez de modelos de traducción biomédica específicos para el par inglés-vietnamita, un ámbito con aplicaciones directas en salud pública, investigación clínica y documentación hospitalaria. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UMT5 (encoder-decoder transformer, variante de T5 multilingüe) |
| Parametros totales | 592.043.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UMT5 mantiene la arquitectura encoder-decoder de T5, pero incorpora el metodo de muestreo UniMax, que sustituye el muestreo heuristico por temperatura por un esquema basado en limites de capacidad por idioma. Esto permite un preentrenamiento mas justo y efectivo en 107 idiomas, con un corpus mC4 mejorado de 29 billones de caracteres. El modelo base `google/umt5-base` fue preentrenado con esta metodologia y posteriormente ajustado por nhuvo sobre el dataset En-ViMedNER, un corpus paralelo de textos biomedicos en ingles y vietnamita. No se especifican en la informacion disponible los hiperparametros del fine-tuning (epocas, tasa de aprendizaje, etc.), ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Traduccion automatica ingles → vietnamita en dominio biomedico, con especial atencion a terminologia medica (enfermedades, farmacos, procedimientos).
- Generacion de texto en formato secuencia a secuencia (text2text-generation), compatible con la API de transformers.
- Soporte para inferencia en entornos de produccion mediante la libreria transformers, con posibilidad de integracion en pipelines de traduccion.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o vision.

## Casos de uso

- Traduccion de informes clinicos: el modelo puede convertir historiales medicos escritos en ingles a vietnamita, facilitando la atencion a pacientes vietnamitas en entornos hospitalarios internacionales.
- Localizacion de ensayos clinicos: documentos de consentimiento informado, protocolos y resultados de estudios pueden traducirse de forma rapida y consistente, manteniendo la precision terminologica.
- Traduccion de articulos de investigacion biomedica: investigadores vietnamitas pueden acceder a literatura cientifica en ingles sin perder matices tecnicos.
- Soporte en telemedicina: integracion en sistemas de consulta remota para traducir sintomas, diagnosticos y recomendaciones entre medico y paciente.
- Generacion de contenido educativo en salud: traduccion de guias, folletos y materiales divulgativos para poblacion vietnamita.
- Preprocesamiento de datos para sistemas de IA medica: normalizacion de textos clinicos en vietnamita a partir de fuentes en ingles, como paso previo a tareas de extraccion de informacion o analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos con otros modelos de traduccion biomedica EN-VI en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (2,4 GB), se recomienda al menos 4 GB de VRAM para evitar desbordamientos. Con cuantizacion a int8 (no confirmada en el repositorio), la huella se reduciria a aproximadamente 1,2 GB.
- GPU recomendadas: tarjetas de gama media como NVIDIA RTX 3060 (12 GB) o superiores son suficientes. Para despliegues en produccion, una A10G o T4 (16 GB) ofrece margen comodo.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 6 GB o mas, como RTX 2060 o RTX 3050, siempre que se gestione la memoria.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con la API de transformers. No se proporcionan pesos en formato GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 600M de parametros en una GPU T4 suele alcanzar decenas de tokens por segundo en tareas de traduccion, pero depende del hardware y la optimizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Sin embargo, se puede situar en el contexto de otros modelos multilingues de tamano similar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| umt5-base-en-vimedner-mt-en2vi | 592M | no disponible | en, vi | Apache 2.0 | Fine-tuning biomedico especifico |
| google/umt5-base | 592M | no disponible | 107 | Apache 2.0 | Modelo base multilingue |
| google/mt5-base | 580M | no disponible | 101 | Apache 2.0 | Predecesor de UMT5, sin UniMax |

La principal diferencia frente a los modelos base es la especializacion en el dominio biomedico y el par de idiomas concreto, lo que deberia ofrecer mejor precision terminologica, aunque no hay datos publicados que lo confirmen.

## Limitaciones y advertencias

- Sesgos del dataset: al entrenarse sobre En-ViMedNER, el modelo puede reflejar los sesgos presentes en ese corpus, como un desequilibrio en ciertas especialidades medicas o una representacion limitada de variantes dialectales del vietnamita.
- Riesgo de alucinacion: como todo modelo de traduccion neuronal, puede generar traducciones fluidas pero incorrectas, especialmente con terminos fuera del dominio biomedico o con frases ambiguas.
- Limitaciones de contexto: al no conocerse la longitud de contexto exacta, se recomienda no superar las 512 unidades de subpalabra por entrada, siguiendo las practicas habituales de T5.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones sobre el dataset de entrenamiento; es responsabilidad del usuario verificar la licencia de En-ViMedNER.
- Cobertura limitada: el modelo solo traduce en una direccion (EN→VI) y no soporta otros pares de idiomas ni tareas fuera de la traduccion biomedica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nhuvo/umt5-base-en-vimedner-mt-en2vi
- Dataset En-ViMedNER: https://huggingface.co/datasets/nhuvo/En-ViMedNER
- Modelo base google/umt5-base: https://huggingface.co/google/umt5-base
- Documentacion de UMT5 en transformers: https://huggingface.co/docs/transformers/v4.51.1/model_doc/umt5
- Paper UniMax (arXiv, via GitHub): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/umt5.md
- Modelo complementario VI→EN: https://huggingface.co/nhuvo/umt5-base-en-vimedner-mt-vi2en
