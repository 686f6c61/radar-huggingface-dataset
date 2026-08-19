# melikegks/turkish-pii-guard-qwen2.5-1.5b

## Resumen

Turkish PII Guard 1.5B es un modelo de lenguaje especializado en la detección y el enmascaramiento de información personal identificable (PII) en textos en turco. Desarrollado por melikegks, se basa en un fine-tuning del modelo Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.543 millones de parámetros. El modelo aborda el problema del cumplimiento normativo y la protección de datos en entornos donde es necesario anonimizar textos que contienen datos personales, como números de identificación nacional (TCKN), IBAN, teléfonos, nombres, direcciones o información financiera.

El modelo soporta un total de 50 tipos de PII y permite tanto el enmascaramiento completo de todos los datos personales como el enmascaramiento selectivo guiado por instrucciones en lenguaje natural. Su relevancia radica en que ofrece una alternativa específica para el idioma turco, un ámbito donde las soluciones genéricas de detección de PII suelen tener un rendimiento limitado. Al estar basado en un modelo pequeño (1.5B), puede desplegarse en entornos con recursos moderados, aunque su precisión es inferior a la de un modelo más ligero de la misma familia, como se detalla en la sección de benchmarks.

El modelo se distribuye bajo licencia Apache 2.0 y los pesos están disponibles en formato safetensors. No se especifica la longitud de contexto en la documentación proporcionada, aunque al ser un fine-tune de Qwen2.5-1.5B-Instruct, hereda las capacidades de ese modelo base. La ficha se basa exclusivamente en la información pública disponible en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only con 1.500 millones de parámetros aproximadamente. No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset de fine-tuning o si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que se realizó un fine-tuning sobre el modelo base y que el modelo resultante está especializado en la tarea de enmascaramiento de PII en turco.

La arquitectura subyacente es la estándar de Qwen2.5, que incluye atención multi-cabeza, normalización RMS y capas de feed-forward. Al ser un modelo denso, todos los parámetros se activan en cada inferencia. No se menciona ninguna innovación técnica adicional, como decodificación especulativa o atención lineal, más allá de las capacidades heredadas del modelo base.

## Capacidades

- Detección y enmascaramiento de 50 tipos de PII en textos en turco, incluyendo TCKN, IBAN, números de teléfono, nombres y apellidos, direcciones y datos financieros.
- Enmascaramiento completo: dado un texto, el modelo reemplaza todas las entidades PII por etiquetas como `[AD]` (nombre), `[TEL]` (teléfono), etc.
- Enmascaramiento selectivo: el modelo puede seguir instrucciones en lenguaje natural para enmascarar solo ciertos tipos de PII, dejando otros intactos.
- Generación de texto en turco con formato de instrucción (sistema, instrucción, texto).
- Capacidad de conversación básica heredada del modelo base, aunque su uso principal es la tarea de PII.

## Casos de uso

- Anonimización de documentos legales y administrativos: el modelo puede procesar contratos, sentencias o expedientes que contengan datos personales, reemplazando nombres, direcciones o números de identificación por etiquetas, facilitando la publicación o el intercambio seguro de documentos.
- Protección de datos en atención al cliente: en centros de contacto que gestionan consultas en turco, el modelo puede enmascarar automáticamente información sensible en transcripciones de conversaciones antes de almacenarlas o analizarlas, cumpliendo con requisitos de privacidad.
- Preprocesamiento de datos para entrenamiento de modelos: antes de utilizar textos turcos para entrenar otros modelos de IA, se puede aplicar este modelo para eliminar PII, reduciendo el riesgo de fuga de información personal en los datos de entrenamiento.
- Cumplimiento del RGPD y la ley turca de protección de datos (KVKK): organizaciones que manejan datos personales de ciudadanos turcos pueden usar el modelo para auditar y anonimizar bases de datos textuales, garantizando el cumplimiento normativo.
- Redacción de informes médicos: en el sector sanitario, el modelo puede enmascarar nombres de pacientes, números de historia clínica o datos de contacto en informes médicos antes de compartirlos con fines de investigación o docencia.
- Filtrado de logs y registros de sistemas: en entornos de TI, el modelo puede procesar logs de aplicaciones que contengan información personal (por ejemplo, direcciones IP, correos electrónicos o nombres de usuario) para eliminar datos sensibles antes de su almacenamiento o análisis.

## Benchmarks y rendimiento

La model card proporciona una evaluación comparativa en un benchmark propio de enmascaramiento de PII en turco, con métrica de coincidencia exacta esquema-neutral (se excluyen ejemplos con etiquetas no soportadas por el modelo). Los resultados son los siguientes:

| Modelo | Coincidencia exacta esquema-neutral |
|---|---:|
| Turkish PII Guard 0.8B (saturday-labs) | 0.922 |
| Turkish PII Guard 1.5B (este modelo) | 0.857 |

El modelo de 1.5B obtiene un rendimiento inferior al de su contraparte de 0.8B en esta evaluación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni se dispone de información sobre latencia o throughput.

## Requisitos de hardware

- No se proporcionan requisitos específicos por parte del autor.
- Dado el tamaño del modelo (1.543 millones de parámetros), se estima que en FP16 ocupa aproximadamente 3 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o superior. Esta estimación no está confirmada oficialmente.
- En cuantización INT8 o INT4, el uso de VRAM sería menor (aproximadamente 1.5-2 GB), aunque no se han publicado versiones cuantizadas.
- Para despliegue en producción, se pueden utilizar frameworks como vLLM, llama.cpp u Ollama, siempre que se adapten los pesos al formato correspondiente (GGUF, etc.).
- Al ser un modelo pequeño, es viable su ejecución en CPU con latencias aceptables para tareas de procesamiento por lotes, aunque no se dispone de mediciones concretas.

## Comparativa con modelos similares

La única alternativa directamente comparable es el modelo Turkish PII Guard 0.8B, también enfocado en el enmascaramiento de PII en turco. No se han identificado otros modelos especializados en esta tarea en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento (coincidencia exacta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turkish PII Guard 0.8B | ~0.8B | No disponible | 0.922 | No especificada (Apache 2.0 según repo) | Hugging Face |
| Turkish PII Guard 1.5B | 1.543.714.304 | No disponible | 0.857 | Apache 2.0 | Hugging Face |

A pesar de tener más parámetros, el modelo de 1.5B muestra un rendimiento inferior en el benchmark proporcionado, lo que sugiere que el fine-tuning del modelo de 0.8B fue más efectivo para esta tarea específica.

## Limitaciones y advertencias

- El modelo puede cometer errores en instrucciones de enmascaramiento selectivo, especialmente cuando se solicita dejar explícitamente un tipo de PII sin enmascarar.
- La evaluación se realizó sobre un benchmark propio y no se han verificado resultados en conjuntos de datos externos o en entornos de producción.
- El modelo solo soporta el idioma turco; no es aplicable a otros idiomas sin un reentrenamiento adicional.
- No se han publicado detalles sobre posibles sesgos en los datos de entrenamiento ni sobre la robustez frente a textos con errores ortográficos o variaciones dialectales.
- Para flujos de trabajo de alto riesgo o sujetos a regulación, se recomienda verificar manualmente las salidas del modelo, tal como indica el autor en la model card.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario asegurar que el uso del modelo cumple con la normativa de protección de datos aplicable (por ejemplo, KVKK en Turquía o RGPD en la UE).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/melikegks/turkish-pii-guard-qwen2.5-1.5b)
- [Modelo comparado: Turkish PII Guard 0.8B](https://huggingface.co/saturday-labs/turkish-pii-guard-0.8b)
