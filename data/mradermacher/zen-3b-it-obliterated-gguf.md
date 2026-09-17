# mradermacher/Zen-3B-It-Obliterated-GGUF

## Resumen

Zen-3B-It-Obliterated-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo edusc182/Zen-3B-It-Obliterated. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión de pesos a cuantizaciones de llama.cpp pensada para facilitar la inferencia en CPU, GPU de gama baja y entornos con memoria limitada. El repositorio se publicó el 17 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

La model card del repositorio es meramente técnica: indica que se generaron cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`) y que la conversión se realizó desde pesos en formato HuggingFace. El autor no aporta información sobre el entrenamiento, la licencia, los idiomas soportados ni el pipeline de la tarea.

Por el identificador del modelo puede inferirse que el modelo original es de aproximadamente 3.000 millones de parámetros y que está ajustado a instrucciones ("It"), mientras que el término "Obliterated" se emplea habitualmente en la comunidad para designar modelos sometidos a técnicas de abliteración (eliminación de direcciones de rechazo del espacio de activaciones). Estas dos afirmaciones son inferencias a partir del nombre y no están confirmadas en la documentación disponible, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | no disponible (el identificador indica "3B", sin confirmacion documental) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato HuggingFace |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base. La model card del repositorio GGUF no incluye detalles sobre el tipo de transformer, el numero de capas, las dimensiones ocultas, el mecanismo de atencion ni si se emplean tecnicas como Mixture of Experts o modelos de espacio de estados. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO.

Lo unico verificable es el proceso de conversion: mradermacher ha generado cuantizaciones estaticas (no de tipo K-quant dinamico en el momento de la publicacion, segun el campo `quantize_version: 2`) a partir de los pesos HuggingFace del modelo edusc182/Zen-3B-It-Obliterated, empleando la herramienta de cuantizacion de llama.cpp. El sufijo "Obliterated" sugiere la aplicacion de tecnicas de abliteracion sobre el modelo ajustado a instrucciones, pero no se aporta ninguna confirmacion tecnica de ello.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- Generacion de texto: esperable en un modelo ajustado a instrucciones, pero no confirmado por el autor.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- El unico aspecto diferencial confirmado es el formato de distribucion: pesos GGUF listos para llama.cpp y derivados.

## Casos de uso

Dado que no hay informacion publicada sobre el rendimiento ni las capacidades del modelo, los siguientes casos de uso son escenarios plausibles derivados del formato y del tamano aparente, no de resultados verificados:

- Inferencia local en equipos sin GPU dedicada: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en CPU con memoria RAM modesta, usando llama.cpp u Ollama.
- Prototipado rapido en portatiles: la variante Q4_K_S o Q3_K_M permite mantener el modelo cargado en GPU integrada o en una GPU de gama de entrada con 4-6 GB de VRAM.
- Aplicaciones de escritorio con privacidad estricta: al ejecutarse en local sin llamadas a APIs externas, es adecuado para entornos donde los datos no pueden salir del dispositivo.
- Evaluacion comparativa de tecnicas de abliteracion: util para investigadores que quieran medir el efecto de la eliminacion de rechazos sobre un modelo de 3B en distintas cuantizaciones.
- Filtrado y clasificacion de texto a pequena escala: tareas de etiquetado o resumen corto en pipelines por lotes donde el coste de una API resulta prohibitivo.
- Generacion de texto creativo sin restricciones de contenido: si se confirma la abliteracion, el modelo podria emplearse en escenarios donde los filtros de seguridad del modelo original resultan limitantes, asumiendo los riesgos asociados.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio de como distintas cuantizaciones (de Q2_K a f16) afectan a un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas comparativas, resultados de MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco hay datos de perplexity por cuantizacion, que seria el dato mas relevante para evaluar la degradacion introducida por cada nivel de compresion.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano aparente del modelo (aproximadamente 3.000 millones de parametros) y del tamano tipico de cada cuantizacion GGUF. No estan confirmadas por el autor:

- VRAM/RAM estimada por cuantizacion (solo pesos, sin contexto):
  - f16: en torno a 6,0-6,5 GB.
  - Q8_0: en torno a 3,2-3,5 GB.
  - Q6_K: en torno a 2,5-2,8 GB.
  - Q5_K_M: en torno a 2,2-2,4 GB.
  - Q4_K_M: en torno a 1,9-2,1 GB.
  - IQ4_XS: en torno a 1,7-1,9 GB.
  - Q3_K_M: en torno a 1,5-1,7 GB.
  - Q2_K: en torno a 1,2-1,4 GB.
- Anadir aproximadamente 0,5-2 GB adicionales en funcion de la longitud de contexto configurada (KV cache).
- GPU recomendadas: no hay recomendaciones oficiales. Para las cuantizaciones de 4 bits, una RTX 3060 de 12 GB o superior resulta holgada; una RTX 4060 de 8 GB o una GTX 1660 de 6 GB serian suficientes para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas de VRAM para cuantizaciones de 4 bits o inferiores, siempre que se confirme el tamano real del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y, con conversion adicional, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales. Los modelos de la tabla son alternativas habituales en la franja de 3B de parametros; sus datos corresponden a sus propias fichas publicas y no implican comparacion de calidad con Zen-3B-It-Obliterated.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| Zen-3B-It-Obliterated (base) | no disponible (nombre sugiere ~3B) | no disponible | no disponible | si (este repositorio) |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | si |
| Qwen2.5 3B Instruct | 3,09B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 (la mayoria de variantes) | si |
| Phi-3.5-mini Instruct | 3,8B | 128.000 tokens | MIT | si |

No se dispone de datos que permitan afirmar si Zen-3B-It-Obliterated supera, iguala o queda por debajo de estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni ficha de entrenamiento, ni datos de evaluacion. Usar el modelo en produccion sin evaluacion previa es desaconsejable.
- Licencia no especificada: al no indicarse licencia, no puede asumirse permiso de uso comercial. Es imprescindible consultar el repositorio del modelo base (edusc182/Zen-3B-It-Obliterated) antes de cualquier uso profesional.
- Riesgo de alucinacion: no cuantificado, pero presente en cualquier modelo de 3B de parametros; la cuantizacion agresiva (Q3 y Q2) tiende a incrementarlo.
- Posible modelo abliterado: si se confirma la eliminacion de mecanismos de rechazo, el modelo puede generar contenido danino, ilegal o sesgado sin filtros. La responsabilidad del filtrado recae enteramente en quien lo despliega.
- Idiomas soportados desconocidos: no puede garantizarse un rendimiento adecuado en castellano ni en ningun otro idioma concreto.
- Degradacion por cuantizacion: las variantes Q2_K, Q3_K_S y Q3_K_M introducen perdidas de calidad notables en modelos de este tamano; se recomienda Q4_K_M o superior para cualquier uso serio.
- Fecha de publicacion inusual: el repositorio figura como creado el 17 de septiembre de 2026, fecha posterior a la actual en la mayoria de contextos, lo que puede indicar un error de metadatos o un entorno de publicacion particular.
- Cero descargas y cero interacciones: no existe comunidad que haya validado el funcionamiento de estas cuantizaciones.
- Los resultados de la busqueda web asociada no contienen informacion relacionada con este modelo; todos los enlaces devueltos son irrelevantes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Zen-3B-It-Obliterated-GGUF
- Modelo base: https://huggingface.co/edusc182/Zen-3B-It-Obliterated
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
