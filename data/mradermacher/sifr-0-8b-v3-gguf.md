# mradermacher/sifr-0.8b-v3-GGUF

## Resumen

sifr-0.8b-v3-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo base mohamedlotfy50/sifr-0.8b-v3. No se trata, por tanto, de un modelo entrenado desde cero por este autor, sino de una conversión a GGUF pensada para su ejecución en llama.cpp y entornos compatibles con el endpoint de HuggingFace. El modelo base declara una orientación conversacional, según la etiqueta "conversational" del repositorio.

El recuento real de parámetros en safetensors es de 752.393.024, es decir, aproximadamente 0,75 mil millones, ligeramente por debajo del "0,8b" que sugiere el nombre. Se trata de un modelo de escala reducida, apto para inferencia en hardware de consumo, aunque no se dispone de información sobre su arquitectura interna, longitud de contexto, datos de entrenamiento o licencia, ya que la model card publicada se limita a la ficha de conversión.

La relevancia de este repositorio es fundamentalmente práctica: ofrece hasta doce variantes de cuantización (desde Q2_K hasta f16, incluyendo IQ4_XS) sobre un modelo base del que no existen alternativas oficiales en GGUF. El repositorio ocupa 7,8 GB en total debido a la acumulación de todas las variantes. En el momento de la consulta no registra descargas ni likes, y la información de la búsqueda web no aportó resultados pertinentes sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 752.393.024 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no hay indicios de ser MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 7,8 GB (suma de todas las cuantizaciones) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |
| Tipo de conversion | hf (a partir del modelo base en formato HuggingFace) |
| Compatibilidad de endpoint | si (etiqueta endpoints_compatible) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base mohamedlotfy50/sifr-0.8b-v3: ni el numero de capas, ni la dimension del modelo, ni el tipo de atencion, ni si emplea tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos. El unico dato tecnico fiable es el recuento de parametros (752.393.024) y el hecho de que la conversion se realizo desde pesos en formato HuggingFace. No se especifica si hubo entrenamiento con RLHF, DPO u otra fase de alineamiento.

Respecto a los datos de entrenamiento, no se publica el numero de tokens, la composicion del dataset ni el corte temporal del corpus. La model card del repositorio de mradermacher es exclusivamente una ficha de conversion y no reproduce la informacion del autor original. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio sugiere que el modelo base fue ajustado para mantener dialogos multi-turno, si bien no se documenta el formato de prompt recomendado ni el tokenizador de plantilla de chat.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en CPU y GPU mediante llama.cpp: capacidad derivada de la conversion a GGUF, con las doce variantes de cuantizacion publicadas.

## Casos de uso

- Despliegue de un asistente conversacional ligero en local: las variantes Q4_K_M y Q5_K_M permiten ejecutar el modelo en portatiles sin GPU dedicada a traves de llama.cpp, con un consumo de memoria inferior a 1 GB, adecuado para prototipos de chatbot sin conexion.
- Generacion de texto en el borde (edge computing) o en dispositivos con recursos limitados: la cuantizacion Q2_K reduce el peso a unas decimas de gigabyte, lo que posibilita su integracion en entornos con RAM muy restringida, asumiendo la perdida de calidad asociada.
- Pruebas comparativas de cuantizacion: al publicarse hasta doce variantes del mismo modelo, el repositorio sirve como banco de pruebas para medir el impacto de cada nivel de cuantizacion en perplejidad y calidad de respuesta conversacional.
- Integracion en pipelines de evaluacion y benchmarking: la etiqueta endpoints_compatible facilita el consumo del modelo desde infraestructura compatible con la API de HuggingFace Endpoints para pruebas automatizadas.
- Filtrado previo y clasificacion de textos cortos: como modelo pequeno de 752 millones de parametros, es candidato para tareas de etiquetado o reformulacion de baja latencia, siempre que se valide su calidad con datos propios, dado que no hay benchmarks publicos.
- Investigacion sobre ajuste fino: al ser un modelo de menos de mil millones de parametros, puede ajustarse con LoRA en una unica GPU de 16 GB, partiendo de la version f16 o Q8_0 como base de mayor fidelidad.
- Base para experimentos de destilacion o comparacion con modelos pequenos: util en estudios academicos que requieran un punto de referencia de escala sub-1B con licencia por determinar (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad para ninguna de las cuantizaciones, y la busqueda web realizada no devolvio resultados pertinentes sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada a partir del recuento de parametros, sin datos oficiales del autor):
  - f16: en torno a 1,5 GB de pesos, mas el coste del contexto y de las activaciones.
  - Q8_0: en torno a 0,8 GB.
  - Q6_K: en torno a 0,6 GB.
  - Q5_K_M / Q5_K_S: en torno a 0,55 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 0,45-0,5 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 0,4 GB.
  - Q2_K: en torno a 0,3 GB.
- GPU recomendadas: no hay requisitos publicados; por tamano, cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante) es suficiente para las cuantizaciones intermedias. GPU de datacenter como A100, H100 o L40S solo tendrian sentido en escenarios de batching muy alto, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en graficos integrados con memoria compartida suficiente para las cuantizaciones de 2 a 5 bits.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa importacion del GGUF mediante Modelfile), servidores compatibles con la API de llama.cpp, y despliegue gestionado a traves de endpoints compatibles con la API de HuggingFace. Compatibilidad con vLLM y TGI: no confirmada en la informacion disponible; vLLM y TGI priorizan safetensors o requieren pasos adicionales para GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas de la misma categoria (modelos conversacionales de ~0,75 mil millones de parametros disponibles en GGUF), por lo que cualquier comparacion de parametros, contexto, rendimiento, licencia o disponibilidad seria especulativa. Como referencia estructural, la unica comparacion posible es interna al propio repositorio, entre sus doce cuantizaciones, que comparten parametros y licencia y difieren unicamente en el nivel de compresion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, religion o idioma.
- Riesgo de alucinacion: no cuantificado. En modelos de esta escala (menos de mil millones de parametros) la tasa de afirmaciones incorrectas suele ser elevada, pero no hay evaluaciones publicadas que lo confirmen para este modelo concreto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en la informacion disponible, lo que impide garantizar un comportamiento correcto en conversaciones largas o en idiomas distintos del usado durante el entrenamiento.
- Licencia: no disponible. Al no declararse la licencia ni en el repositorio de cuantizacion ni, segun la informacion recogida, en la ficha del modelo base, no puede asumirse el uso comercial. Se recomienda contactar con el autor original (mohamedlotfy50) antes de cualquier despliegue en produccion.
- Trazabilidad limitada: la model card del repositorio se limita a la ficha de conversion; no incluye informacion sobre el entrenamiento, la tokenizacion ni el formato de plantilla de chat, lo que complica la integracion correcta del prompt.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicos. El modelo no ha pasado por una validacion independiente conocida.
- Fechas de publicacion anomilas: los metadatos indican creacion el 2026-10-03 y actualizacion el 2026-10-03, fechas posteriores a la fecha habitual de consulta; conviene verificar la vigencia real de los archivos antes de descargarlos.
- Resultados de busqueda web no pertinentes: las consultas realizadas devolvieron exclusivamente contenido ajeno al modelo, por lo que no se ha podido triangular ninguna informacion adicional.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/sifr-0.8b-v3-GGUF
- Modelo base: https://huggingface.co/mohamedlotfy50/sifr-0.8b-v3
- Otros enlaces relevantes (papers, blogs, repos, demos): no disponible. La busqueda web no devolvio ningun resultado relacionado con el modelo.
