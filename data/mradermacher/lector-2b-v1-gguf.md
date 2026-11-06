# mradermacher/lector-2b-v1-GGUF

## Resumen

lector-2b-v1-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo lector-2b-v1, publicado por el usuario mradermacher. Se trata de un artefacto derivado: el autor original del modelo es julioalonzom, y mradermacher se limita a generar las versiones cuantizadas para su uso con llama.cpp y herramientas compatibles. El repositorio pesa 1,0 GB e incluye múltiples niveles de cuantización, desde Q2_K hasta Q8_0, además de un F16 de referencia.

El dato más relevante es la discrepancia entre el nombre comercial ("2b") y el número real de parámetros reportado en los safetensors del repositorio: 331.416.576 parámetros, es decir, aproximadamente 0,33 mil millones. Esto sugiere que o bien el nombre hace referencia a otra magnitud, o bien el modelo es sustancialmente más pequeño de lo que sugiere su denominación. No hay información pública en la model card que aclare esta cuestión.

La ficha se limita a documentar lo que consta en el repositorio. La model card original del modelo base no está incluida en la información disponible, por lo que arquitectura, datos de entrenamiento, licencia, idiomas y capacidades no pueden confirmarse y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 331.416.576 (según safetensors del repo) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base lector-2b-v1 en la documentación proporcionada. La model card del repositorio GGUF es una plantilla generada automáticamente por la herramienta de cuantización de mradermacher e incluye únicamente metadatos del proceso de conversión: versión de cuantización (quantize_version: 2), indicador de cuantización de tensores de salida (output_tensor_quantised: 1), tipo de conversión (hf) y la lista de cuantizaciones generadas. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El proceso de cuantización sí es verificable: se partió del repositorio julioalonzom/lector-2b-v1 y se generaron cuantizaciones estáticas en formato GGUF, es decir, los pesos se cuantizan una vez en el momento de la conversión y no de forma dinámica en tiempo de ejecución. Esto implica que cada archivo GGUF tiene un tamaño fijo y un nivel de precisión predecible, lo que facilita el despliegue en entornos con restricciones de memoria conocidas.

## Capacidades

No se han documentado capacidades específicas en la información disponible. A partir de los metadatos del repositorio solo puede afirmarse lo siguiente:

- El modelo es compatible con el ecosistema GGUF, por lo que puede ejecutarse en llama.cpp y en las herramientas que lo integran (Ollama, LM Studio, entre otras).
- Se ofrecen cuantizaciones de 2 a 8 bits, lo que permite ajustar el equilibrio entre precisión y consumo de memoria.
- No consta soporte de tool calling, agentes, visión, audio, modo thinking ni capacidades multilingües declaradas.
- El nombre "lector" sugiere un posible enfoque hacia tareas de lectura o comprensión de documentos, pero esto es una inferencia a partir del nombre y no un dato confirmado.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo, los siguientes casos son escenarios genéricos para un modelo de ~0,33 mil millones de parámetros en formato GGUF, no aplicaciones validadas:

- Inferencia en CPU y dispositivos de bajos recursos: con 331 millones de parámetros, las cuantizaciones Q4_K_M o Q5_K_M ocupan del orden de 200-250 MB, lo que permite ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp.
- Clasificación y etiquetado de texto en local: un modelo de este tamaño puede emplearse para tareas acotadas de clasificación si se valida su calidad previamente, con la ventaja de que no requiere conexión a servicios externos.
- Prototipado rápido de pipelines de NLP: sirve para validar la integración de llama.cpp u Ollama en una aplicación antes de escalar a un modelo mayor.
- Filtrado o preprocesado de documentos: si el modelo está orientado a lectura, podría usarse como primera etapa de un pipeline que extraiga o resuma fragmentos antes de pasarlos a un modelo más grande.
- Experimentación educativa: su tamaño reducido lo hace adecuado para estudiar el efecto de distintas cuantizaciones sobre la calidad de salida en un entorno controlado.
- Despliegue en entornos con requisitos de privacidad estrictos: al ejecutarse íntegramente en local, los datos no salen del dispositivo, lo que encaja en escenarios donde no se permite enviar texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros (331 M) y el tamaño del repo (1,0 GB para todas las cuantizaciones), las versiones Q4_K_M y Q5_K_M deberían ocupar del orden de 200-250 MB, y la Q8_0 en torno a 350-400 MB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con 2 GB o más de VRAM debería ser suficiente para las cuantizaciones de 4-8 bits.
- Compatibilidad con GPU de consumo: previsiblemente sí, incluidas GTX 1050 Ti, RTX 3050 y superiores, dado el reducido número de parámetros. No confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base no documenta arquitectura, contexto ni rendimiento, y el número real de parámetros (331 M) no coincide con la categoría que sugiere el nombre ("2b"). Cualquier comparación con modelos de ~0,3 B o de ~2 B sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| lector-2b-v1-GGUF | 331.416.576 | no disponible | no disponible | GGUF | Hugging Face |
| Alternativas de ~0,3 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "2b" pero los safetensors reportan 331 M de parámetros. Conviene verificar el modelo base antes de asumir su escala real.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo original (julioalonzom/lector-2b-v1) antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano, inglés u otros idiomas, y su calidad en cada uno.
- Sin benchmarks ni evaluación publicada: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), por lo que no se puede recomendar para tareas críticas sin una evaluación propia.
- Riesgo de alucinación: no cuantificado. Los modelos de tamaño reducido suelen tener mayor propensión a generar contenido incorrecto, pero no hay datos específicos para este modelo.
- Repositorio derivado: este repo solo contiene cuantizaciones; la responsabilidad sobre sesgos, datos de entrenamiento y calidad recae en el modelo base.
- Fecha de creación futura en los metadatos (2026-11-02): conviene tratar las fechas del repositorio con cautela, ya que pueden deberse a errores de reloj o de registro.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad que permita inferir su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lector-2b-v1-GGUF
- Modelo base: https://huggingface.co/julioalonzom/lector-2b-v1
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
