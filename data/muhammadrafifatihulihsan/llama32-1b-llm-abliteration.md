# muhammadrafifatihulihsan/llama32-1b-llm-abliteration

## Resumen

Llama 3.2 1B LLM Abliteration es un modelo experimental de generación de texto creado por el desarrollador independiente muhammadrafifatihulihsan a partir de `meta-llama/Llama-3.2-1B-Instruct`. Se trata de una versión "abliterada": los pesos han sido modificados mediante técnicas de ablación de direcciones de activación (direction ablation) con el objetivo de reducir el comportamiento de rechazo (refusals) del modelo original ante peticiones que este considera sensibles.

El propósito declarado del proyecto es educativo y de investigación: permitir el estudio reproducible del comportamiento de seguridad de los modelos de lenguaje y la evaluación controlada de técnicas de abliteration. El repositorio incluye no solo los pesos modificados, sino también artefactos intermedios del proceso (direcciones extraídas, dirección seleccionada y resultados de cribado) y un notebook con el flujo de trabajo completo, lo que lo convierte en un recurso didáctico interesante para quien quiera entender cómo funciona esta técnica a nivel interno.

Con 1.498.482.688 parámetros, es un modelo pequeño apto para hardware de consumo. Se distribuye en formato safetensors (Hugging Face), GGUF F16 para uso local con Ollama o llama.cpp, y un checkpoint intermedio de TransformerLens. No es un modelo destinado a producción: el propio autor advierte que puede generar contenido inseguro, inexacto u ofensivo y que no ha recibido una evaluación exhaustiva de capacidades ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), con pesos modificados por abliteration |
| Parametros totales | 1.498.482.688 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 1B Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | F16 (GGUF, ~3 GB); safetensors en precision original |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors, GGUF (F16), checkpoint intermedio TransformerLens (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder denso de la familia Llama 3.2 de Meta. No se ha reentrenado: la modificación se realiza sobre los pesos ya entrenados mediante abliteration, una técnica que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la abla (elimina o neutraliza) mediante una intervención ponderal, sin necesidad de ajuste fino adicional. El proceso se llevó a cabo con la librería TransformerLens, como evidencia el checkpoint intermedio `artifacts/ablation.safetensors` incluido en el repositorio.

El repositorio documenta el flujo de trabajo completo en un notebook de GitHub, junto con los CSV de prompts experimentales y las notas de evaluación. Cabe destacar que, según el propio autor, la inferencia no se volvió a ejecutar para la publicación: los artefactos son experimentos locales existentes que se han compartido tal cual, lo que implica que los resultados registrados no aíslan limpiamente el efecto de la modificación de pesos.

## Capacidades

- Generación de texto conversacional heredada de Llama 3.2 1B Instruct, con plantilla de chat incluida en el repositorio.
- Comportamiento de rechazo reducido respecto al modelo base: la tasa de rechazo por palabras clave baja del 75,00 % al 33,75 % (Hugging Face) y 35,00 % (Ollama) en 80 prompts de evaluación.
- Compatibilidad con Ollama y llama.cpp mediante la conversión GGUF F16 incluida.
- Compatibilidad con la librería transformers de Hugging Face para uso programático.
- No hay evidencia documentada de capacidades de visión, audio, tool calling ni agentes; el pipeline declarado es text-generation.

## Casos de uso

- Investigación en alineamiento y seguridad: estudiar cómo la ablación de direcciones de activación altera el comportamiento de rechazo, comparando respuestas antes y después de la intervención sobre el mismo conjunto de prompts.
- Enseñanza de interpretabilidad mecánica: el notebook y los artefactos (direcciones extraídas, resultados de cribado) permiten reproducir paso a paso un pipeline completo de abliteration con TransformerLens sobre un modelo pequeño.
- Evaluación de robustez de filtros de seguridad: usar el modelo como sujeto de prueba para medir la eficacia de guardrails externos (moderadores de contenido, clasificadores de entrada/salida) frente a modelos con refusals degradados.
- Experimentación local de bajo costo: con ~1,5 B de parámetros y un GGUF de ~3 GB, es viable ejecutarlo en portátiles y estaciones sin GPU dedicada para prototipar flujos conversacionales.
- Desarrollo de herramientas de evaluación: construir benchmarks automáticos de tasa de rechazo y heurísticas de cumplimiento (como la usada en el proyecto) sobre un modelo cuyo comportamiento de seguridad está documentado.
- Comparativa de runtimes: el mismo modelo se distribuye para Hugging Face, Ollama y (vía GGUF) llama.cpp, lo que permite medir diferencias de comportamiento y rendimiento entre runtimes con pesos idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta una evaluación propia de comportamiento de rechazo:

| Runtime | Prompts | Tasa de rechazo (palabras clave) | ASR heurístico |
| --- | ---: | ---: | ---: |
| Original / TransformerLens | 80 | 75,00 % | 25,00 % |
| Modificado / Hugging Face | 80 | 33,75 % | 63,75 % |
| Modificado / Ollama | 80 | 35,00 % | 65,00 % |

Advertencias del propio autor sobre estos datos: la heurística de ASR solo cuenta respuestas no rechazadas de más de 50 caracteres y no establece ni nocividad ni calidad de respuesta; los conjuntos de prompts y la decodificación difieren entre ejecuciones; algunos prompts de evaluación se solapan con los de extracción; y las mediciones guardadas no aíslan el efecto de la modificación de pesos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3 GB en F16 (GGUF); el safetensors completo ocupa en torno a 3 GB adicionales de descarga. No hay cifras oficiales de VRAM, pero un modelo de 1,5 B en F16 cabe con holgura en GPUs de 8 GB o incluso solo en RAM del sistema.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 6-8 GB (RTX 3060, RTX 4060) es más que suficiente. Para el proceso de abliteration original sí se empleó TransformerLens, que puede beneficiarse de GPU, pero el modelo publicado ya incluye los pesos modificados.
- Consumer GPUs: totalmente viable en prácticamente cualquier GPU de consumo actual; también ejecutable solo en CPU gracias a llama.cpp/Ollama.
- Opciones de despliegue: transformers (Hugging Face), Ollama (con el Modelfile del proyecto: `ollama create llama3.2-1b:abliteration -f Modelfile`), llama.cpp. No hay soporte documentado de vLLM o TGI, aunque por tamaño y formato probablemente sea compatible.
- Latencia y throughput: no disponible. Al tratarse de un modelo de 1,5 B, se esperan latencias bajas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| muhammadrafifatihulihsan/llama32-1b-llm-abliteration | 1,50 B | no disponible (heredada de Llama 3.2) | safetensors, GGUF F16 | Llama 3.2 Community | Abliteration experimental, refusals reducidos, uso educativo |
| meta-llama/Llama-3.2-1B-Instruct (base) | 1,24 B aprox. | 128.000 tokens | safetensors | Llama 3.2 Community | Modelo original con refusals intactos (75 % de tasa registrada) |
| Otras variantes abliteradas de Llama 3.2 1B (p. ej. de la comunidad en Hugging Face) | ~1,2-1,5 B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community | Múltiples versiones comunitarias existen; calidad y documentación variables |

La diferencia clave frente al modelo base es el comportamiento de seguridad degradado, no la capacidad: al no haber reentrenamiento, las capacidades de razonamiento y generación son esencialmente las de Llama 3.2 1B Instruct, con la posible degradación que la intervención ponderal pueda introducir (no evaluada).

## Limitaciones y advertencias

- Riesgo elevado de generación de contenido inseguro, inexacto u ofensivo: el rechazo del modelo está deliberadamente degradado y el propio autor lo advierte explícitamente.
- No apto para producción ni despliegue a usuarios finales sin una evaluación independiente y salvaguardas apropiadas.
- No se ha realizado una evaluación exhaustiva de capacidades ni de seguridad; las métricas publicadas son heurísticas con limitaciones metodológicas reconocidas por el autor.
- La heurística de ASR no mide calidad ni nocividad real de las respuestas; los datos de evaluación no aíslan el efecto de la modificación de pesos.
- Posible degradación de la calidad general del modelo respecto al base como efecto colateral de la abliteration; no hay datos que lo cuantifiquen.
- Restricciones de licencia: rige la Llama 3.2 Community License, la política de uso aceptable de Meta y la política de contenido de Hugging Face; el propósito educativo no exime de cumplirlas. Debe verificarse el umbral de usuarios mensuales de la licencia Llama para uso comercial.
- Idiomas soportados no documentados en la model card; heredados presumiblemente de Llama 3.2, pero sin confirmación.
- La inferencia no se volvió a ejecutar antes de la publicación; los artefactos son experimentos locales compartidos tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammadrafifatihulihsan/llama32-1b-llm-abliteration
- Repositorio de GitHub con el flujo de trabajo y notas de resultados: https://github.com/muhammadrafifatihulihsan/llama32-1b-llm-abliteration
- Notas completas de resultados: https://github.com/muhammadrafifatihulihsan/llama32-1b-llm-abliteration/blob/main/docs/results.md
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Política de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy
- Política de contenido de Hugging Face: https://huggingface.co/content-policy
