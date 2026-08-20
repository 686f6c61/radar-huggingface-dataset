# mradermacher/gpt4o-distil-paperwitch-abliteration-L33-70b-GGUF

## Resumen

El modelo `gpt4o-distil-paperwitch-abliteration-L33-70b-GGUF` es una cuantizacion en formato GGUF del modelo base `KaraKaraModel/gpt4o-distil-paperwitch-abliteration-L33-70b`, realizada por mradermacher. Se trata de un modelo de 70 mil millones de parametros, derivado de una arquitectura tipo Llama-3, que ha sido sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original, resultando en un modelo etiquetado como "uncensored".

Este repositorio contiene exclusivamente los pesos cuantizados en formato GGUF, lo que permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp u Ollama. La relevancia de este modelo reside en su tamano (70B) combinado con la ausencia de filtros de seguridad, lo que lo hace atractivo para casos de uso donde se requiere generacion de texto sin restricciones, aunque con los riesgos asociados a este tipo de modelos.

No se dispone de informacion detallada sobre la arquitectura interna, el entrenamiento o los benchmarks del modelo base en la documentacion proporcionada. El repositorio se centra exclusivamente en la distribucion de las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3 (derivado, segun tags del modelo) |
| Parametros totales | 70.553.706.560 (70,55B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura es limitada. El modelo base pertenece a la familia Llama-3 segun los tags del repositorio, lo que sugiere una arquitectura transformer decoder-only con atencion por ventanas. Sin embargo, no se proporcionan detalles sobre el numero de capas, dimensiones ocultas, ni el mecanismo de atencion empleado.

El proceso de "abliteration" mencionado en el nombre del modelo consiste en la eliminacion de las direcciones de "refusal" (rechazo) en el espacio de activaciones del modelo, una tecnica que se ha popularizado para crear modelos sin censura. No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF o DPO en el modelo original.

El repositorio actual es una cuantizacion estatica realizada por mradermacher, que no modifica los pesos mas alla de la conversion a GGUF con diferentes niveles de precision.

## Capacidades

- Generacion de texto en ingles sin filtros de censura aparentes, gracias al proceso de abliteration.
- Capacidad de mantener conversaciones multi-turno, segun los tags "conversational" del modelo.
- Compatible con herramientas de inferencia locales que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio.
- No se dispone de informacion sobre capacidades multilingues mas alla del ingles declarado.

## Casos de uso

- Generacion creativa de ficcion sin restricciones: el modelo puede producir narrativa, dialogos o poesia sin los filtros tipicos de seguridad, lo que permite explorar temas controvertidos o adultos en proyectos de escritura creativa.
- Investigacion sobre alineacion y seguridad de modelos: al ser un modelo abliterated, resulta util para estudiar como se comportan los modelos sin mecanismos de rechazo, y para investigar tecnicas de jailbreak y sus mitigaciones.
- Creacion de personajes para juegos de rol: su capacidad conversacional y ausencia de censura lo hacen adecuado para simulaciones de personajes con personalidades extremas o temas tabu.
- Analisis de sesgos y comportamientos no filtrados: los investigadores pueden usar este modelo para comparar el comportamiento de un modelo censurado frente a su version abliterated en tareas sensibles.
- Generacion de contenido para entornos de pruebas (sandbox): en entornos aislados donde se requiere probar sistemas de moderacion o deteccion de contenido toxico, este modelo puede generar ejemplos de salidas no filtradas.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF, puede ejecutarse en una estacion de trabajo con GPU de 24 GB o mas, sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin incluir contexto):
  - Q2_K: 26,5 GB
  - Q3_K_M: 34,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB
  - Q8_0: 75,1 GB
- GPU recomendadas:
  - Para Q2_K y Q3_K: una RTX 4090 (24 GB) o A6000 (48 GB) puede cargar el modelo con offloading parcial.
  - Para Q4_K_M y superiores: se requiere una GPU con 48 GB o mas (A6000, A100 80GB, H100) o multiples GPUs en paralelo.
  - No cabe en GPU de consumo de 16 GB o menos en ninguna cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles. Dependeran de la cuantizacion, el hardware y la longitud de contexto utilizada.

## Comparativa con modelos similares

No disponible. No se ha encontrado informacion sobre modelos comparables en la documentacion proporcionada. Para una comparativa adecuada seria necesario conocer el rendimiento del modelo base frente a otros modelos de 70B como Llama-3-70B, Mistral-7B o Mixtral-8x7B, pero estos datos no estan disponibles.

## Limitaciones y advertencias

- Modelo "uncensored": al haber sido sometido a abliteration, el modelo puede generar contenido explicito, violento, ofensivo o ilegal sin restricciones. Su uso en produccion conlleva riesgos legales y eticos significativos.
- Licencia "other": no se especifica una licencia concreta. Esto genera incertidumbre juridica sobre el uso comercial y la redistribucion del modelo. Se recomienda contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Solo ingles: el modelo solo soporta el idioma ingles de forma declarada, lo que limita su uso en entornos multilingues.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgos. Dado que es un modelo sin filtros, es probable que amplifique sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada con alta confianza. La ausencia de filtros no reduce este riesgo.
- Contexto desconocido: al no conocerse la longitud de contexto, es dificil planificar su uso en tareas que requieran ventanas largas. Se recomienda probar con la herramienta de inferencia elegida.
- Repositorio sin mantenimiento activo: el modelo fue creado en febrero de 2026 y actualizado en agosto de 2026, pero no hay evidencia de soporte continuo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gpt4o-distil-paperwitch-abliteration-L33-70b-GGUF
- Repositorio con quants imatrix: https://huggingface.co/mradermacher/gpt4o-distil-paperwitch-abliteration-L33-70b-i1-GGUF
- Modelo base: https://huggingface.co/KaraKaraModel/gpt4o-distil-paperwitch-abliteration-L33-70b
- Pagina de modelo en local-ai-zone: https://local-ai-zone.github.io/models/gpt4o-distil-paperwitch-abliteration-l33-70b.html
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/KaraKaraModel/gpt4o-distil-paperwitch-abliteration-L33-70b
