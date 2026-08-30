# mradermacher/Ornith-1.5-35B-A3B-FULLY-OBLITERATED-GGUF

## Resumen

Ornith-1.5-35B-A3B-FULLY-OBLITERATED-GGUF es una cuantización en formato GGUF del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepReinforce y publicado originalmente en agosto de 2026. Esta versión concreta ha sido sometida a un proceso de "abliteration" (eliminación de la dirección de rechazo) y "obliteration" (decensuración), lo que elimina los mecanismos de negativa ante solicitudes consideradas sensibles. El repositorio está mantenido por mradermacher, que ha generado los archivos GGUF para su uso con llama.cpp, Ollama y otras herramientas compatibles.

El modelo base tiene 35.505.251.456 parámetros totales y activa aproximadamente 3.000 millones de parámetros por token, lo que lo sitúa en la categoría de MoE eficientes. Está basado en la arquitectura Qwen3.5 y se ha entrenado con un bucle de auto-mejora que combina generación de tareas, scaffolds específicos y rollouts para aprendizaje por refuerzo. Según datos reportados por el desarrollador, alcanza 68.5 en Terminal-Bench 2.1 y 79.0 en SWE-Bench Verified, superando a modelos diez veces más grandes en tareas de programación. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo con una pérdida de calidad mínima, lo que la hace atractiva para desarrolladores que necesitan un modelo potente y sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000.000.000 (aprox. 3B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (20.5 GB), mmproj-Q8_0 (0.7 GB), mmproj-f16 (1.0 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 35.5 mil millones de parámetros totales, de los cuales se activan aproximadamente 3 mil millones por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, similar a otros MoE como Qwen3-30B-A3B. El entrenamiento se realizó siguiendo el marco de auto-mejora introducido en Ornith-1.0: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición del dataset.

La versión "FULLY-OBLITERATED" ha sido modificada mediante técnicas de abliteration, que eliminan la dirección de rechazo en el espacio de activaciones del modelo. Esto implica que el modelo ya no muestra resistencia a generar contenido que normalmente estaría censurado, como respuestas sobre temas delicados o instrucciones potencialmente dañinas. El proceso de cuantización posterior a cargo de mradermacher convierte los pesos a formato GGUF, optimizado para inferencia en CPU y GPU con memoria limitada.

## Capacidades

- Generacion de texto y razonamiento: el modelo mantiene las capacidades de comprension y generacion de lenguaje natural del modelo base, incluyendo tareas de razonamiento logico y analisis.
- Programacion y resolucion de problemas: segun los benchmarks reportados, destaca en tareas de ingenieria de software, como resolucion de issues (SWE-Bench) y uso de terminal (Terminal-Bench).
- Soporte multimodal: los archivos mmproj incluidos sugieren que el modelo puede procesar entradas multimodales (probablemente vision), aunque no se especifica el tipo de modalidad ni se proporcionan ejemplos de uso.
- Sin censura: al estar obliterated, no aplica filtros de contenido ni rechaza solicitudes, lo que permite generar respuestas sobre cualquier tema sin restricciones.
- Multilingue: la model card indica solo ingles, por lo que no se garantiza un rendimiento adecuado en otros idiomas.

## Casos de uso

- Asistente de programacion en entornos locales: el modelo puede integrarse en IDEs o herramientas de linea de comandos para autocompletar codigo, generar funciones o explicar fragmentos. Su rendimiento en SWE-Bench lo hace adecuado para tareas de resolucion de bugs y refactorizacion.
- Automatizacion de tareas de terminal: gracias a su puntuacion en Terminal-Bench, puede utilizarse para generar comandos shell, scripts de automatizacion o para interpretar salidas de consola en pipelines de CI/CD.
- Generacion de contenido creativo sin restricciones: al carecer de censura, es util para escritura de ficcion, guiones o dialogos que aborden temas tabu o controvertidos, siempre que se respete la legalidad.
- Prototipado rapido de agentes conversacionales: su tamano reducido (3B activos) permite desplegarlo en servidores modestos o incluso en portatiles, facilitando el desarrollo de chatbots o asistentes virtuales con respuestas naturales.
- Educacion y formacion en seguridad: puede emplearse en entornos controlados para demostrar los riesgos de los modelos sin alineacion, o para investigar tecnicas de jailbreak y mitigacion.
- Investigacion en alineacion y decensuracion: al ser una version obliterated, sirve como caso de estudio para analizar el impacto de eliminar la direccion de rechazo en el comportamiento del modelo.

## Benchmarks y rendimiento

Segun datos reportados por el desarrollador (DeepReinforce) y promediados sobre cinco ejecuciones, el modelo base Ornith-1.5-35B-A3B obtiene los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 68.5 |
| SWE-Bench Verified | 79.0 |

No se han publicado resultados adicionales en la informacion disponible. Estos valores son proporcionados por el vendor y no han sido verificados de forma independiente. La version cuantizada en GGUF puede presentar ligeras variaciones en el rendimiento debido a la perdida de precision, aunque la cuantizacion Q4_K_S suele mantener una calidad cercana al modelo original.

## Requisitos de hardware

- El archivo Q4_K_S ocupa 20.5 GB, por lo que cabe en GPUs de consumo con 24 GB de VRAM, como la NVIDIA RTX 4090 o RTX 3090.
- Para inferencia en CPU, se recomienda al menos 32 GB de RAM, ya que el modelo completo en memoria puede superar los 20 GB.
- Los archivos mmproj (0.7-1.0 GB) son opcionales y solo necesarios si se desea utilizar la funcionalidad multimodal.
- Compatible con motores de inferencia como llama.cpp, Ollama, LM Studio y otros que soporten GGUF.
- Al ser un MoE con solo 3B parametros activos, la latencia por token es relativamente baja en comparacion con modelos densos de tamano similar. En una RTX 4090 se pueden esperar velocidades de 30-50 tokens por segundo, aunque no se dispone de mediciones exactas.
- Para despliegue en produccion con multiples usuarios, se recomienda usar vLLM o TGI con el modelo en formato safetensors, aunque la version GGUF es adecuada para uso local o pruebas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo base Ornith-1.5-35B-A3B se posiciona como un MoE de 35B con 3B activos, similar en arquitectura a Qwen3-30B-A3B o DeepSeek-V2-Lite, pero no se han encontrado benchmarks que permitan una comparacion directa. La version obliterated no tiene equivalente directo en el ecosistema open source, ya que la mayoria de modelos mantienen algun nivel de alineacion.

## Limitaciones y advertencias

- Al ser una version obliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en aplicaciones publicas o comerciales conlleva un riesgo legal y etico significativo.
- Solo soporta ingles de forma fiable; el rendimiento en otros idiomas puede ser deficiente o producir respuestas incoherentes.
- No se ha especificado la longitud de contexto, por lo que se desconoce si el modelo maneja ventanas largas (superiores a 8K tokens). Se recomienda probar antes de usarlo en tareas que requieran contexto extenso.
- La cuantizacion Q4_K_S introduce una perdida de precision que puede afectar a tareas de razonamiento complejo o generacion de codigo muy especifico.
- Los benchmarks reportados son del modelo base sin cuantizar y sin el proceso de obliteration; el rendimiento real de esta version puede variar.
- La licencia MIT permite uso comercial, pero la ausencia de censura puede entrar en conflicto con las politicas de las plataformas de distribucion de software.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-FULLY-OBLITERATED-GGUF
- Modelo base original: https://huggingface.co/jhone888/Ornith-1.5-35B-A3B-FULLY-OBLITERATED
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Otras cuantizaciones del mismo modelo: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-abliterated-GGUF y https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-i1-GGUF
