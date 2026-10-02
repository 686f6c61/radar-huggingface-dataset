# mradermacher/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-i1-GGUF

# Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-i1-GGUF

## Resumen

Esta ficha describe un modelo derivado y cuantizado en formato GGUF publicado por el usuario mradermacher. No es un modelo entrenado desde cero, sino una cadena de transformaciones sobre Ministral 3 3B, el modelo compacto de la familia Ministral desarrollada por Mistral AI. La cadena es la siguiente: el modelo original `mistralai/Ministral-3-3B-Instruct-2512` fue sometido a un proceso de "abliteration" (eliminacion del alineamiento de rechazo) por el usuario 3MPER0RR, dando lugar a `Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated`; sobre esa variante, mradermacher ha generado cuantizaciones GGUF con imatrix, que es lo que se documenta aqui.

Se trata de una variante "text-only" con el codificador de vision eliminado, segun los propios tags del repositorio. El modelo base Ministral 3 3B original es multimodal (3,4B de parametros de lenguaje mas un codificador de vision de 0,4B), disenado para despliegue en el borde y en entornos de bajos recursos. Esta version elimina la parte visual y conserva unicamente la capacidad de generacion de texto, lo que reduce el peso y simplifica el despliegue en herramientas basadas en llama.cpp.

El interes de esta publicacion es doble: por un lado, ofrece una version sin censura (abliterated) del Ministral 3 3B en cuantizaciones GGUF de bajo peso, aptas para hardware de consumo; por otro, sirve como ejemplo del ecosistema de derivados no oficiales (fine-tunes sin alineamiento de seguridad y cuantizaciones de comunidad) que rodea a los modelos de Mistral. Cabe senalar que el repositorio aparece con cero descargas, cero "likes" y un tamano declarado de 0,0 GB, por lo que la disponibilidad real de los ficheros puede ser limitada o reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Ministral 3 3B; sin el codificador de vision original) |
| Parametros totales | 745,654 segun el dato de safetensors reportado en HuggingFace (el modelo base Ministral 3 3B declara aproximadamente 3,4B de parametros de lenguaje mas 0,4B de vision; no disponible el desglose exacto de esta variante) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (lista declarada en los metadatos del autor; el unico fichero listado en la tabla del README es el imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix; los pesos originales del modelo base estan en safetensors/BF16, no incluidos en este repo) |

## Arquitectura y entrenamiento

El modelo subyacente es Ministral 3 3B de Mistral AI, un transformer denso compacto de la familia Ministral, pensado para inferencia en el borde. La version original es multimodal: combina un modelo de lenguaje de aproximadamente 3,4B de parametros con un codificador de vision de aproximadamente 0,4B. En esta publicacion concreta se ha eliminado el codificador de vision (tag `vision-encoder-removed`), de modo que el resultado es un modelo exclusivamente de texto. Sobre el modelo original se aplico primero un proceso de abliteration por parte de 3MPER0RR, que suprime direcciones del espacio de activaciones asociadas al rechazo de peticiones, y despues mradermacher genero cuantizaciones GGUF de tipo imatrix (importancia ponderada) para reducir el tamano de los pesos con perdida minima de calidad.

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni la metodologia de alineamiento (RLHF/DPO) efectivamente empleada en el modelo original ni en la variante abliterated. Tampoco se documenta ninguna innovacion tecnica adicional en el proceso de cuantizacion mas alla del uso de matrices de importancia (imatrix) para ponderar la cuantizacion de los tensores, tecnica habitual en el ecosistema de llama.cpp para mejorar la fidelidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Razonamiento general y conversacion de tipo instruct, heredado del modelo Ministral 3 3B Instruct.
- Generacion de codigo y asistencia de programacion, segun las capacidades tipicas del modelo base.
- Capacidad multilingue: limitada al ingles segun los metadatos; el modelo original de Mistral suele tener cobertura multilingue amplia, pero aqui no esta documentada.
- Vision: no soportada en esta variante (codificador de vision eliminado explicitamente).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de "pensamiento" (thinking): no disponible.
- Alineamiento de seguridad reducido: al ser una variante abliterated, el modelo tiende a no rechazar peticiones que el modelo original si declinaria (capacidad relevante para ciertos usos, pero tambien un riesgo).

## Casos de uso

- Ejecucion local en equipos de bajos recursos: gracias a las cuantizaciones de baja precision (Q4, Q3, incluso IQ2/IQ1) el modelo puede correr en CPU o en GPUs modestas mediante llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura en la nube.
- Asistente de escritura en ingles integrado en editores: generacion y reescritura de texto sobre una ventana de contexto reducida, adecuado para tareas de autocompletado o reformulacion en flujos de trabajo de escritorio.
- Generacion de codigo ligera en entornos de desarrollo locales: uso como copiloto de bajo consumo para sugerencias de fragmentos y explicaciones, integrable en plugins que consuman el endpoint del servidor GGUF.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo de 3B, permite iterar rapido con costes bajos en pruebas de concepto de chatbots en ingles antes de escalar a modelos mayores.
- Investigacion sobre alineamiento y seguridad: esta variante abliterated es util para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo, comparandola con el modelo original alineado.
- Experimentacion educativa sobre cuantizacion: el repositorio sirve como ejemplo practico de como imatrix y distintos niveles de cuantizacion afectan al tamano y la calidad de un modelo de 3B.
- Filtrado y clasificacion de texto en ingles offline: tareas de etiquetado o moderacion donde el modelo se ejecuta localmente y no se quiere enviar datos a servicios externos (con las advertencias sobre el alineamiento reducido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace y los resultados de busqueda consultados no incluyen cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta variante cuantizada ni para la variante abliterated intermedia.

## Requisitos de hardware

- VRAM estimada (estimaciones, no datos oficiales): aproximadamente 1,0-1,5 GB para cuantizaciones IQ1/IQ2; 1,5-2,0 GB para Q3; 2,0-2,5 GB para Q4_K_M; 2,5-3,5 GB para Q5/Q6; 3,5-4,0 GB para Q8; y alrededor de 6,5-7 GB en BF16/F16.
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090. Para las cuantizaciones mas altas (Q8, F16) se recomienda al menos 8 GB de VRAM. En entornos de servidor funcionaria en A100, H100 o L40S, aunque esta sobredimensionado para un modelo de 3B.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM en cuantizaciones Q4 y superiores, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (oobabooga) y otros frontends compatibles con GGUF. Para el modelo original en formato safetensors se usaria vLLM o TGI, pero este repositorio solo contiene GGUF.
- Latencia y throughput: no disponibles. En un modelo de 3B cuantizado a Q4 sobre GPU de consumo, se esperan velocidades del orden de decenas a mas de cien tokens por segundo, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de mediciones comparativas en la informacion proporcionada. La comparacion cualitativa con la cadena de modelos de la que deriva es la siguiente:

| Modelo | Tipo | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistralai/Ministral-3-3B-Instruct-2512 | Original de Mistral AI | Si (modelo + codificador de vision) | apache-2.0 | safetensors | Modelo alineado oficial, multimodal, ~3,4B + 0,4B |
| 3MPER0RR/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated | Derivado abliterated | Si (segun el nombre BF16) | apache-2.0 (heredada) | safetensors | Elimina el rechazo de peticiones; sin evaluacion publica |
| mradermacher/...-i1-GGUF (este modelo) | Cuantizacion GGUF text-only | No (eliminado) | apache-2.0 | GGUF | Solo texto, imatrix, orientado a despliegue local |

No disponible la comparacion con alternativas de otros fabricantes (por ejemplo modelos de ~3B de otras familias) por falta de datos en la informacion consultada.

## Limitaciones y advertencias

- Modelo abliterated: el alineamiento de seguridad esta reducido, por lo que puede generar contenido que el modelo original rechazaria. No es apropiado para aplicaciones publicas sin capas adicionales de moderacion.
- Solo ingles: el unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Sin vision: a pesar de que Ministral 3 3B original es multimodal, esta variante elimina el codificador de vision, por lo que no procesa imagenes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; especialmente relevante en tareas de conocimiento factual y sin datos de evaluacion publicados que lo cuantifiquen.
- Longitud de contexto no disponible: se desconoce la ventana de contexto efectiva de esta variante, lo que dificulta planificar casos de uso con contexto largo.
- Licencia apache-2.0: permite uso comercial, pero se heredan las condiciones y avisos del modelo original de Mistral AI; conviene verificar los terminos de la cadena de derivados antes de un despliegue en produccion.
- Disponibilidad dudosa: el repositorio reporta 0 descargas, 0 "likes" y 0,0 GB de tamano, y la tabla de ficheros del README solo lista el fichero imatrix; es posible que las cuantizaciones no esten efectivamente publicadas o que el repositorio se acabe de crear.
- Datos inconsistentes: el recuento de parametros reportado (745,654) no concuerda con el tamano declarado del modelo base (3B); se trata de un dato a verificar antes de tomar decisiones de despliegue.
- Sin garantias de mantenimiento: se trata de una cuantizacion de comunidad sin soporte oficial de Mistral AI.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-i1-GGUF
- Modelo base de este derivado (abliterated): https://huggingface.co/3MPER0RR/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Cuantizaciones estaticas del autor: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-3MPER0RR-abliterated-GGUF
- Variante i1-GGUF sin abliterated (relacionada): https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-BF16-i1-GGUF
- Documentacion oficial de Ministral 3 3B: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Pagina de SourceForge del modelo: https://sourceforge.net/projects/ministral-3-3b-instruct-2512/
- Ficha en Inferix: https://inferix.co/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Apoyo del autor: https://www.nethype.de/
