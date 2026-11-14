# ATIR450/Devstral-Small-2-24B-Instruct-2512-int4-ov

## Resumen

Devstral-Small-2-24B-Instruct-2512-int4-ov es una conversión al formato OpenVINO del modelo Devstral-Small-2-24B-Instruct-2512, publicado por el usuario ATIR450 en Hugging Face. El modelo original lo desarrolla Mistral AI y está orientado a tareas de generación de texto con capacidades de instrucción y razonamiento, con especial énfasis en el uso como agente de código. Esta versión concreta aplica cuantización INT4 sobre los pesos para reducir el tamaño del repositorio a 26,3 GB y facilitar su despliegue en hardware Intel mediante el runtime de OpenVINO.

El modelo base es un transformer de 24.000 millones de parámetros (según indica el propio nombre del checkpoint), con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La conversión a OpenVINO busca optimizar la inferencia en CPU y en aceleradores Intel (GPU integradas, Arc y NPU), un escenario relevante para equipos sin GPUs NVIDIA dedicadas.

La relevancia de esta ficha radica en que se trata de una variante de despliegue, no de un modelo nuevo: su valor está en la cuantización INT4 y el formato OpenVINO, que permiten ejecutar un modelo de 24B en entornos con recursos limitados. No obstante, la información pública disponible sobre esta conversión concreta es muy escasa: la model card no incluye detalles de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral; detalles no disponibles) |
| Parámetros totales | 24B (según nombre del checkpoint; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO (IR); repo de 26,3 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre del checkpoint (Devstral-Small-2-24B-Instruct-2512) se deduce que es un modelo de 24B parámetros afinado para instrucciones, pero la model card de esta conversión no especifica si emplea atención con ventana deslizante, GQA, ni otros detalles propios de la familia Mistral. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

En cuanto a esta variante concreta, la única innovación técnica documentada es la cuantización a INT4 y la conversión al formato OpenVINO, que permite ejecutar el modelo con el runtime de Intel. No se detallan el método de cuantización (GPTQ, AWQ, RTN u otro), ni el impacto en precisión respecto al modelo original, ni si se ha validado la calidad tras la cuantización.

## Capacidades

- Generación de texto e instrucciones: el modelo está etiquetado como text-generation y conversational, por lo que se espera que responda a prompts en formato de chat.
- Razonamiento y código: por la denominación "Devstral", el modelo base está orientado a tareas de desarrollo de software, aunque no se documentan capacidades específicas en esta conversión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no lista idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en CPU Intel sin GPU dedicada: la cuantización INT4 y el formato OpenVINO permiten ejecutar un modelo de 24B en servidores con CPU Intel Xeon, usando el runtime de OpenVINO para inferencia optimizada.
- Prototipado en estaciones de trabajo con GPU integrada Intel: útil para desarrolladores que quieran probar un modelo de instrucciones de 24B en equipos con gráficos Intel Arc o Iris Xe sin depender de CUDA.
- Asistencia de código en entornos locales: dado el origen Devstral, puede emplearse como asistente de programación en IDE o pipelines locales, siempre que se valide la calidad tras la cuantización.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de un modelo de 24B al pasar a INT4 frente a la versión original en FP16/BF16.
- Inferencia en el edge o en dispositivos con NPU Intel: el formato OpenVINO facilita el despliegue en plataformas con aceleradores Intel, aunque no se documenta el rendimiento concreto.
- Investigación sobre formatos de despliegue: útil para estudiar la portabilidad de checkpoints Mistral a OpenVINO y las herramientas de conversión asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 26,3 GB en INT4, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más overhead del runtime.
- GPU recomendadas: no se especifican; al ser OpenVINO, el objetivo son CPU Intel, GPU Intel Arc/Iris Xe y NPU Intel. No se documenta compatibilidad con NVIDIA.
- ¿Cabe en GPU de consumo? No disponible; en INT4 el tamaño de 26,3 GB supera la VRAM de la mayoría de GPUs de consumo (por ejemplo, 24 GB de una RTX 4090), por lo que probablemente requiera descarga a RAM o particionado, pero no se confirma.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral-Small-2-24B-Instruct-2512-int4-ov (este) | 24B (según nombre) | no disponible | OpenVINO INT4 | Apache 2.0 | Hugging Face (81 descargas) |
| mistralai/Devstral-Small-2-24B-Instruct-2512 (base) | 24B (según nombre) | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones del mismo base (GGUF, AWQ) | 24B | no disponible | GGUF / AWQ | Apache 2.0 | no disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información muy limitada: la model card no documenta arquitectura, contexto, idiomas ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de degradación por cuantización: al ser una conversión INT4 no se aportan métricas de calidad; la precisión puede diferir del modelo original.
- Sesgos: no documentados; se heredan los del modelo base, que no se detallan.
- Alucinación: no se aportan evaluaciones de fiabilidad; como todo modelo generativo, puede producir contenido incorrecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Compatibilidad: el formato OpenVINO limita el despliegue a entornos Intel; no es directamente utilizable con runtimes CUDA o ROCm.
- Autoría: la conversión la realiza un usuario tercero (ATIR450), no Mistral AI; no hay garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATIR450/Devstral-Small-2-24B-Instruct-2512-int4-ov
- Modelo base: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- OpenVINO (Intel): no disponible en la información proporcionada.
- Paper, blog o demo del modelo base: no disponible en la información proporcionada.
