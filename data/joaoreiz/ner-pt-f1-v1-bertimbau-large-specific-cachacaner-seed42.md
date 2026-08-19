# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed42

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed42` es un ajuste fino (fine-tuning) del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) para la tarea de reconocimiento de entidades nombradas (NER) en portugués. Ha sido desarrollado por JoaoReiz y entrenado sobre el subconjunto congelado `cachacaner` del protocolo NEVE NER, con una semilla fija de 42 y selección por la métrica `validation_end_to_end_f1`. El modelo está pensado para clasificación de tokens (token-classification) y se distribuye en formato safetensors, con un total de 333.382.691 parámetros.

La relevancia de este modelo radica en su especialización para un dominio concreto del portugués (el conjunto `cachacaner`), lo que lo hace adecuado para tareas de extracción de entidades en textos de ese ámbito. Al estar basado en BERTimbau large, hereda la arquitectura transformer encoder de BERT con 24 capas, lo que proporciona una capacidad de representación alta para el idioma portugués. Sin embargo, al ser un modelo de nicho, su aplicabilidad fuera del dominio de entrenamiento puede ser limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT large, 24 capas, 1024 dimensiones ocultas) |
| Parametros totales | 333.382.691 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (típico de BERT, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERTimbau large, un transformer encoder preentrenado sobre el corpus BrWaC (Brazilian Web as Corpus) con 1.000.000 de pasos y enmascarado de palabras completas (whole-word mask). La arquitectura de BERT large incluye 24 capas, 16 cabezas de atención y 1024 dimensiones ocultas, lo que da lugar a aproximadamente 335 millones de parámetros. El ajuste fino se realizó sobre el subconjunto `cachacaner` del protocolo NEVE NER, un dataset de NER en portugués, con una semilla fija de 42 y selección del mejor modelo basada en la métrica `validation_end_to_end_f1`. No se especifican detalles adicionales sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.) en la información disponible.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués: identifica y clasifica entidades como personas, organizaciones, lugares, fechas, etc., en texto tokenizado.
- Clasificación de tokens a nivel de token (token classification), salida de etiquetas para cada token de entrada.
- Modelo especializado en el dominio `cachacaner` del protocolo NEVE NER, lo que implica que está optimizado para ese tipo de textos.
- No se han documentado capacidades adicionales como generación de texto, razonamiento o tool calling; es un modelo puramente discriminativo para NER.

## Casos de uso

- Extracción de entidades en documentos legales o administrativos en portugués: el modelo puede identificar nombres de personas, organizaciones y lugares en textos del dominio `cachacaner`, facilitando la automatización de procesos de revisión documental.
- Análisis de noticias o artículos periodísticos en portugués: permite extraer entidades relevantes (personas, empresas, ubicaciones) para sistemas de monitorización de medios.
- Procesamiento de quejas o reclamaciones de clientes: al detectar entidades en mensajes de soporte, se pueden enrutar automáticamente las incidencias a los departamentos correspondientes.
- Construcción de bases de conocimiento: el modelo puede alimentar pipelines de extracción de información para generar grafos de conocimiento a partir de corpus en portugués.
- Anonimización de textos: identificando entidades nombradas, se pueden enmascarar o eliminar datos personales en documentos antes de su publicación.
- Investigación académica en PLN: sirve como punto de partida para experimentos de NER en portugués, especialmente en dominios específicos similares al de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la selección se realizó por la métrica `validation_end_to_end_f1`, pero no se proporcionan valores numéricos. Por tanto, no es posible comparar el rendimiento con otros modelos NER en portugués.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 (según el tamaño del repositorio). Con cuantización a FP16 o int8, el consumo podría reducirse a ~0,7 GB y ~0,4 GB respectivamente, aunque no se ofrecen versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32 (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). En CPU, el modelo puede ejecutarse con memoria RAM suficiente (≥ 4 GB).
- Cabe en GPUs de consumo: sí, es un modelo de tamaño moderado (333M parámetros) que se puede ejecutar en tarjetas gráficas de gama media.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, por lo que puede servirse con `pipeline` de HuggingFace, o mediante frameworks como `vLLM` (aunque no está optimizado para generación) o `TGI`. También es posible usar `ONNX Runtime` para inferencia en CPU.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (p. ej., RTX 3090), la inferencia sobre un texto de 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos NER en portugués. Sin embargo, se pueden mencionar alternativas genéricas:

| Modelo | Tamaño | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed42` | 333M | 512 | NER especializado | no disponible |
| `neuralmind/bert-base-portuguese-cased` | 110M | 512 | Modelo base preentrenado | no disponible |
| `neuralmind/bert-large-portuguese-cased` | 335M | 512 | Modelo base preentrenado | no disponible |

La comparativa con otros modelos NER fine-tuned (como los de la familia `LeNER-Br` o `Portulan`) requeriría datos de benchmarks que no están disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el dominio `cachacaner` del protocolo NEVE NER; su rendimiento en otros dominios del portugués puede ser significativamente inferior.
- Solo soporta portugués (pt), sin capacidad multilingüe.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- Al ser un modelo BERT, tiene un límite de contexto de 512 tokens, por lo que no puede procesar documentos largos de una sola pasada.
- No se han publicado evaluaciones de sesgos o alucinaciones; como modelo discriminativo, no genera texto, pero puede producir etiquetas incorrectas en entidades ambiguas.
- El repositorio no incluye ejemplos de uso ni documentación adicional, lo que dificulta su integración rápida.
- El número de descargas y likes es cero, lo que sugiere que es un modelo reciente o de uso muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-cachacaner-seed42
- Repositorio de BERTimbau (modelo base): https://github.com/ClaudioSS01/portuguese-Bertimbau (y variante de marcosyonaware)
- Página de BERTimbau en Portulan Clarin: https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-base-language-model/486edb32e93711ebabf702420a8701536b383b588f2f4c85b13b4d04c2867a4b/
- Modelo base `neuralmind/bert-large-portuguese-cased`: https://huggingface.co/neuralmind/bert-large-portuguese-cased
