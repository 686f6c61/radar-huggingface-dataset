# lion-ai/medextractor-eu-test

## Resumen

medextractor-eu-test es un modelo de extracción de información clínica desarrollado por lion-ai, construido como un fine-tuning del modelo base google/gemma-4-E2B-it. Está diseñado específicamente para la tarea de token-classification orientada a la extracción de esquemas estructurados a partir de texto médico y clínico, con soporte multilingüe para diez idiomas europeos (polaco, inglés, alemán, español, francés, italiano, neerlandés, checo, sueco y rumano). El modelo cuenta con aproximadamente 4.630 millones de parámetros y se distribuye en formato safetensors bajo la librería transformers.

La relevancia del modelo radica en su especialización: en lugar de un LLM generalista, se presenta como un extractor de esquemas clínicos que combina las capacidades del modelo base Gemma con un ajuste fino orientado a la identificación de entidades y estructuras en documentación médica. El soporte nativo del polaco como idioma principal, junto con otras nueve lenguas europeas, lo posiciona para casos de uso en sistemas sanitarios multilingües dentro de la UE.

Es importante señalar que el identificador del modelo incluye el sufijo "test" y que la licencia declarada es "test-build-not-for-redistribution", lo que indica que se trata de una compilación de prueba no destinada a redistribución ni a uso en producción. El acceso es restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de google/gemma-4-E2B-it) |
| Parametros totales | 4.633.770.241 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pl, en, de, es, fr, it, nl, cs, sv, ro |
| Licencia | test-build-not-for-redistribution |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de google/gemma-4-E2B-it, un transformer decoder-only del que hereda la estructura de pesos y las capacidades de generación del modelo base. Sobre esta base, lion-ai ha aplicado un ajuste fino supervisado orientado a la tarea de token-classification para extracción de información clínica y esquemas estructurados, tal como reflejan las etiquetas del repositorio (medextractor, information-extraction, schema-extraction, token-classification). El modelo incorpora código personalizado (custom_code), lo que implica que requiere confiar en implementaciones propias del autor para su carga y ejecución.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del corpus clínico utilizado, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio fine-tuning sobre el modelo base. El tamaño del repositorio (9,3 GB) es coherente con los 4.630 millones de parámetros en precisión completa o semi-precisión.

## Capacidades

- Extracción de información clínica y estructurada mediante token-classification sobre texto médico.
- Extracción de esquemas (schema-extraction) para convertir documentación no estructurada en campos definidos.
- Procesamiento multilingüe en diez idiomas europeos: polaco, inglés, alemán, español, francés, italiano, neerlandés, checo, sueco y rumano.
- Capacidades heredadas del modelo base Gemma-4-E2B-it, incluyendo generación de texto y comprensión de instrucciones (si bien el ajuste fino está orientado a extracción).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Extracción de entidades clínicas en historiales electrónicos: el modelo puede identificar y clasificar términos médicos, diagnósticos y hallazgos en texto libre de informes clínicos, aprovechando su ajuste específico para token-classification sobre dominios sanitarios.
- Estructuración de informes médicos multilingües: en sistemas sanitarios de la UE que operan en varios idiomas, el modelo permite procesar documentación en polaco, alemán, francés o español con un único pipeline, reduciendo la necesidad de modelos por idioma.
- Poblado automático de bases de datos clínicas: a partir de notas de alta o resúmenes de consulta, el modelo extrae campos estructurados (diagnóstico, tratamiento, dosis) para alimentar registros sanitarios.
- Anonimización asistida y etiquetado de datos clínicos: la token-classification permite localizar menciones a entidades sensibles en corpus médicos antes de su uso en investigación.
- Investigación clínica y farmacovigilancia: extracción de eventos adversos y términos relacionados con fármacos en informes multilingües para su agregación en estudios observacionales.
- Preprocesamiento en pipelines de NLP clínico: el modelo puede actuar como primer estadio de extracción que alimente modelos posteriores de razonamiento o resumen, gracias a su formato de salida estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.630 millones de parámetros, en FP16 se requieren aproximadamente 9,3 GB solo para pesos; en cuantización de 8 bits, en torno a 4,6 GB; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 o H100 para despliegue en producción con FP16; RTX 4090 o RTX 3090 para inferencia en FP16 en un solo dispositivo; GPUs consumer con 8 GB o más para cuantización de 8 bits.
- Compatibilidad con GPU consumer: sí, en principio cabe en RTX 3090/4090 en FP16 y en GPUs de 8 GB con cuantización, aunque no se ha verificado para este build concreto.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y el uso de custom_code puede limitar algunos backends.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medextractor-eu-test (lion-ai) | 4.633.770.241 | no disponible | Token-classification clínica multilingüe | test-build-not-for-redistribution | Gated en Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Generación de texto e instrucciones | Términos de Gemma | Público en Hugging Face |
| Alternativas de extracción clínica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de extracción clínica en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se distribuye como build de prueba ("test-build-not-for-redistribution") y no está destinado a redistribución ni a uso en producción.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de la descarga.
- Al ser un fine-tuning sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales de Gemma, incluyendo sesgos demográficos y clínicos.
- Riesgo de alucinación y de extracción incorrecta de entidades en textos clínicos ambiguos o con terminología poco frecuente; no se han publicado métricas de precisión o recall.
- La longitud de contexto no está documentada, lo que impide garantizar el procesamiento de informes clínicos largos.
- Aunque declara soporte para diez idiomas, el rendimiento por idioma no está verificado y podría ser desigual, especialmente en los idiomas con menos presencia en los datos de ajuste.
- El uso de custom_code implica dependencias de implementación propietarias que deben auditarse antes de integrarlas en un pipeline.
- No debe utilizarse como dispositivo médico ni para decisiones clínicas sin supervisión humana y validación regulatoria.

## Enlaces

- Hugging Face: https://huggingface.co/lion-ai/medextractor-eu-test
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Perfil del autor: https://huggingface.co/lion-ai
