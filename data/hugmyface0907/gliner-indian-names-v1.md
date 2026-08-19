# hugmyface0907/gliner-indian-names-v1

## Resumen

`gliner-indian-names-v1` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de nombres propios de origen indio en texto en inglés. Ha sido desarrollado por el usuario de Hugging Face `hugmyface0907` como parte del proyecto de código abierto [hold-my-data](https://github.com/gititya/hold-my-data), una herramienta de redacción de información personal identificable (PII) y secretos que funciona completamente en local. El modelo surge de un ajuste fino (fine-tune) del modelo base `urchade/gliner_multi_pii-v1`, que a su vez está construido sobre la arquitectura GLiNER, un modelo ligero y generalista para extracción de entidades.

El problema que resuelve es la baja precisión y, sobre todo, el muy bajo recall (18,8%) que presenta el modelo base a la hora de identificar nombres indios en contextos reales. Gracias al entrenamiento con 228.000 oraciones sintéticas de nombre-en-contexto y a la validación contra 400 oraciones reales de biografías de Wikipedia, este fine-tune alcanza un recall del 99,3% y una precisión del 85,9% en esa tarea específica, sin degradar el rendimiento en otros tipos de entidad como fechas de nacimiento (DOB). El modelo está pensado exclusivamente para su uso dentro del proyecto hold-my-data y no como un modelo NER de propósito general.

La relevancia actual reside en la creciente demanda de herramientas de anonimización y redacción de datos personales que funcionen de forma local y respeten la privacidad. Al estar licenciado bajo Apache 2.0 y ser ligero, este modelo permite integrar detección de nombres indios en flujos de procesamiento de documentos sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (modelo base: `urchade/gliner_multi_pii-v1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 1,2 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiNER, un enfoque de NER que utiliza un transformer encoder para representar tanto el texto como las etiquetas de entidad definidas por el usuario, permitiendo extraer cualquier tipo de entidad sin necesidad de entrenamiento específico por dominio. En este caso, el modelo base `urchade/gliner_multi_pii-v1` ya estaba entrenado para detectar múltiples categorías de PII (nombres, fechas, direcciones, etc.), y `gliner-indian-names-v1` realiza un ajuste fino adicional centrado exclusivamente en la clase PERSON para nombres de origen indio.

El entrenamiento se llevó a cabo con 228.000 oraciones sintéticas generadas a partir de plantillas que insertan nombres indios en contextos variados. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aprendizaje por refuerzo (RLHF/DPO). El proceso parece ser un fine-tune supervisado estándar sobre el modelo base, sin innovaciones arquitectónicas adicionales. La validación se realizó sobre 400 oraciones reales de biografías de Wikipedia no vistas durante el entrenamiento, lo que indica una evaluación externa al conjunto sintético.

## Capacidades

- Detección de entidades de tipo PERSON específicamente orientada a nombres indios en texto en inglés.
- Mantiene intactas las capacidades del modelo base para otros tipos de PII (por ejemplo, fechas de nacimiento), según se verifica en la model card.
- No soporta tool calling, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de extracción de entidades.
- Funciona con etiquetas de entidad definidas por el usuario, característica propia de GLiNER, aunque este fine-tune está optimizado para el caso concreto de nombres indios.
- No dispone de capacidades multilingües más allá del inglés.

## Casos de uso

- Redacción de PII en documentos legales: el modelo puede localizar nombres indios en contratos, escrituras o actas para sustituirlos por marcadores anónimos, gracias a su alto recall (99,3%) que minimiza fugas de información.
- Anonimización de registros médicos: en historiales clínicos de pacientes de origen indio, permite eliminar nombres propios antes de compartir datos para investigación, manteniendo el resto de entidades (fechas, etc.) intactas.
- Limpieza de datasets para entrenamiento de modelos: al integrarse en pipelines de preprocesado, ayuda a eliminar nombres personales de corpus de texto antes de su uso en tareas de NLP, reduciendo el riesgo de memorización de datos personales.
- Cumplimiento normativo (GDPR, HIPAA): empresas que manejan datos de usuarios indios pueden emplear el modelo para auditar y redactar automáticamente nombres en correos, chats o bases de datos, facilitando el cumplimiento de regulaciones de privacidad.
- Preparación de datos para publicación: antes de liberar un dataset público, se aplica el modelo para eliminar nombres indios, complementando otros métodos de redacción genéricos.
- Integración en herramientas locales de privacidad: como componente del proyecto hold-my-data, se carga automáticamente para redactar PII en flujos de trabajo que requieren procesamiento sin conexión, por ejemplo en entornos con datos sensibles o sin acceso a la nube.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, comparando el modelo base con este fine-tune sobre 400 oraciones reales de biografías de Wikipedia (no vistas durante el entrenamiento):

| Metrica | Modelo base (`urchade/gliner_multi_pii-v1`) | Este fine-tune |
|---|---|---|
| Precision | 63,6% | 85,9% |
| Recall | 18,8% | 99,3% |

No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo NER especializado y no de un modelo de lenguaje general.

## Requisitos de hardware

- No se dispone de datos concretos sobre VRAM, latencia o throughput en la informacion proporcionada.
- Al tratarse de un modelo GLiNER, que típicamente tiene un tamaño de cientos de millones de parámetros (el repositorio ocupa 1,2 GB), es probable que pueda ejecutarse en CPU con un rendimiento aceptable para tareas de NER, aunque no se especifica.
- No se indican GPUs recomendadas; por su tamaño, podría ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero esta afirmación es una estimación no verificada.
- Opciones de despliegue: al ser un modelo de la librería GLiNER, puede integrarse mediante la biblioteca `gliner` en Python. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de generación.
- Para entornos de producción, se recomienda probar el rendimiento en el hardware objetivo antes de desplegarlo a gran escala.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `urchade/gliner_multi_pii-v1`, del cual deriva:

| Modelo | Precision (nombres indios) | Recall (nombres indios) | Licencia | Uso previsto |
|---|---|---|---|---|
| `urchade/gliner_multi_pii-v1` | 63,6% | 18,8% | Apache 2.0 | NER multi-PII general |
| `gliner-indian-names-v1` | 85,9% | 99,3% | Apache 2.0 | NER especializado en nombres indios |

No se dispone de comparaciones con otros modelos NER como spaCy o Stanford NER en la informacion disponible. La ventaja de este fine-tune es su recall extremadamente alto para nombres indios, a costa de una especialización que limita su uso a ese dominio.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con nombres de origen indio; puede fallar al detectar nombres de otras procedencias o presentar falsos positivos si se usa fuera de ese ámbito.
- Solo soporta texto en inglés; no está preparado para otros idiomas.
- El entrenamiento se basa en oraciones sintéticas, lo que podría introducir sesgos en la representación de contextos reales, aunque la validación con datos reales de Wikipedia sugiere una buena transferencia.
- No es un modelo de propósito general: la model card indica explícitamente que no está pensado para usos fuera del proyecto hold-my-data.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor recomienda limitar su aplicación al caso de redacción de PII, por lo que su uso en otros escenarios podría requerir validación adicional.
- No se ha evaluado el rendimiento en documentos largos ni en dominios específicos (médico, legal, etc.), por lo que en producción conviene realizar pruebas con datos propios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hugmyface0907/gliner-indian-names-v1)
- [Proyecto hold-my-data (GitHub)](https://github.com/gititya/hold-my-data)
- [Repositorio de GLiNER (GitHub)](https://github.com/urchade/GLiNER)
- [Modelo base urchade/gliner_multi_pii-v1](https://huggingface.co/urchade/gliner_multi_pii-v1)
