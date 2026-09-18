# mradermacher/Vortex-9B-CodeCore-Merge-GGUF

## Resumen

Vortex-9B-CodeCore-Merge-GGUF es el repositorio de cuantizaciones GGUF del modelo prithivMLmods/Vortex-9B-CodeCore-Merge, publicado por mradermacher, un autor conocido por convertir pesos de HuggingFace a formatos GGUF listos para inferencia local. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión de pesos: el modelo original es un merge (fusión) de modelos orientado a generación de código, razonamiento con cadena de pensamiento, uso de herramientas y function calling.

El modelo base tiene 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y las etiquetas del repositorio lo asocian a la familia Qwen3.5-9B, con licencia Apache 2.0 y soporte declarado únicamente para inglés. El repositorio de cuantizaciones ocupa 85,1 GB e incluye 13 ficheros GGUF: desde Q2_K (4,0 GB) hasta f16 (18,5 GB), además de dos suplementos multimodales mmproj (Q8_0 y f16) que sugieren que el modelo base incorpora algún tipo de proyector visual, si bien la model card no documenta capacidades de visión.

Su relevancia es práctica más que arquitectónica: permite ejecutar un modelo de 9B especializado en código y agentes en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPU de datacenter. Como contrapartida, el repositorio no incluye resultados de benchmarks, no documenta la longitud de contexto y no registra descargas ni valoraciones, por lo que su calidad real no está validada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la model card no la detalla. Las etiquetas indican qwen3_5 (familia Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; el metadato del autor tambien lista IQ4_XS, aunque no aparece en la tabla de ficheros publicada. No hay cuantizaciones con imatrix ni ponderadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 85,1 GB |
| Suplementos multimodales | mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Modelo base | prithivMLmods/Vortex-9B-CodeCore-Merge |
| Cuantizado por | mradermacher |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Las etiquetas del repositorio apuntan a la familia Qwen3.5 (etiqueta qwen3_5 y Qwen3.5-9B), lo que situaria al modelo en la linea de transformers decoder-only con atencion por tokens que caracteriza a esa familia, pero la model card no confirma ni detalla capas, atencion (completa, lineal o hibrida), tamano de vocabulario ni mecanismos de decodificacion. Tampoco se documenta si existe decodificacion especulativa, atencion lineal u otra innovacion tecnica.

Respecto al entrenamiento, solo se puede afirmar lo que indican las etiquetas: omnimergekit y merge, lo que implica que el modelo original se obtuvo fusionando pesos de otros modelos, no mediante un entrenamiento unico y controlado. Las etiquetas reasoning, chain-of-thought, sft, agent, tool-use y function-calling sugieren que alguno de los componentes fusionados recibio ajuste supervisado orientado a razonamiento, agentes y uso de funciones, pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El repositorio GGUF unicamente realiza la conversion y cuantizacion de esos pesos; no aporta entrenamiento adicional.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta conversational).
- Razonamiento explicito con cadena de pensamiento (chain-of-thought), segun las etiquetas reasoning y chain-of-thought.
- Generacion y asistencia en codigo (etiqueta coder), presumiblemente en multiples lenguajes de programacion, aunque no se enumeran.
- Tool calling y function calling, segun las etiquetas tool-use y function-calling.
- Flujos de agente y razonamiento en varios pasos (etiqueta agent).
- Ajuste por instrucciones (etiqueta sft) para seguir indicaciones en formato prompt-respuesta.
- Soporte de inferencia mediante text-generation-inference y transformers en el modelo base.
- Capacidad multimodal: no confirmada. El repositorio incluye ficheros mmproj (proyector multimodal), lo que sugiere vision en el modelo base, pero ni la model card ni las etiquetas la documentan.
- Capacidades multilingues: no disponibles. Solo se declara ingles.

## Casos de uso

- Autocompletado y generacion de codigo en el editor: con la cuantizacion Q4_K_M (5,9 GB) el modelo cabe en una GPU de 8-12 GB y puede servir sugerencias de codigo en local, sin enviar el codigo fuente a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Asistente de refactorizacion y revision de codigo: el modelo se puede integrar en un script que reciba un diff o un fichero y devuelva una revision con sugerencias, aprovechando la etiqueta coder y el formato conversational para mantener el contexto de varios ficheros en una misma sesion.
- Agente de terminal o de repositorio: gracias a las etiquetas tool-use y function-calling, se puede envolver en un bucle de agente que invoque funciones (leer ficheros, ejecutar tests, consultar una API) y encadene pasos hasta resolver una tarea, por ejemplo actualizar dependencias y corregir los errores de compilacion resultantes.
- Generacion de tests unitarios en pipelines de CI/CD: el modelo puede recibir una funcion o un modulo y producir casos de prueba, que un job de integracion continua ejecutaria despues; el coste por ejecucion es bajo porque la inferencia se hace en hardware propio.
- Razonamiento paso a paso para depuracion: con la etiqueta chain-of-thought, es adecuado para pedirle que explique el flujo de un fallo a partir de un stack trace y proponga hipotesis ordenadas antes de tocar el codigo.
- Asistente de documentacion tecnica: generar docstrings, READMEs y comentarios a partir del codigo en ingles, idioma declarado del modelo, lo que encaja con la convencion mayoritaria en repositorios open source.
- Chat de soporte tecnico especializado en desarrollo: al ser un modelo de 9B desplegable en local, sirve para responder dudas internas de un equipo sobre su propia base de codigo sin depender de APIs externas.
- Prototipado rapido con Ollama o LM Studio: la cuantizacion Q4_K_S o Q4_K_M permite a un desarrollador individual probar el modelo en un portatil con GPU de gama media para evaluar si encaja en su flujo antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF y la informacion proporcionada no incluyen valores de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ni del modelo base ni de las cuantizaciones. Tampoco se aportan mediciones de perplejidad por tipo de cuantizacion; el unico material grafico enlazado es un grafico generico de comparacion de perplejidad entre tipos de cuantizacion, no especifico de este modelo.

## Requisitos de hardware

Estimaciones de VRAM basadas en el tamano de cada fichero GGUF publicado mas el espacio necesario para el contexto y el runtime; la cifra exacta depende de la longitud de contexto, que no esta documentada.

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 4,0 GB | ~5 GB |
| Q3_K_S | 4,5 GB | ~5,5 GB |
| Q3_K_M | 4,8 GB | ~6 GB |
| Q3_K_L | 5,1 GB | ~6,5 GB |
| Q4_K_S | 5,6 GB | ~7 GB |
| Q4_K_M | 5,9 GB | ~7,5 GB |
| Q5_K_S | 6,6 GB | ~8 GB |
| Q5_K_M | 6,7 GB | ~8,5 GB |
| Q6_K | 7,7 GB | ~9,5 GB |
| Q8_0 | 9,9 GB | ~12 GB |
| f16 | 18,5 GB | ~20-22 GB |

- Cabe en GPU de consumo: si. Q4_K_M (5,9 GB) entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; Q6_K (7,7 GB) tambien entra en tarjetas de 12 GB con contextos moderados; Q8_0 requiere 12-16 GB; f16 necesita 24 GB (RTX 3090, RTX 4090, A100 40 GB) y aun asi deja poco margen para cache KV.
- GPU de datacenter: A100 40/80 GB, H100 y L40S pueden ejecutar cualquier cuantizacion, incluida f16, con contextos amplios y lotes grandes.
- Memoria unificada: en Apple Silicon, un Mac con 16 GB puede ejecutar Q4_K_M y Q5_K_M; con 24-32 GB se puede usar Q8_0 con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y cualquier servidor compatible con GGUF. vLLM y TGI admiten GGUF de forma limitada y no son la via recomendada; transformers puede cargar el modelo base en safetensors, no los ficheros GGUF.
- Multimodal: los ficheros mmproj requieren un runtime con soporte de proyector multimodal (por ejemplo llama.cpp con mtmd); deben descargarse junto al modelo principal.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna cuantizacion ni GPU.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos tecnicos ni de rendimiento de otros modelos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa con alternativas. La unica comparacion verificable es entre el modelo base y este repositorio de cuantizaciones.

| Aspecto | prithivMLmods/Vortex-9B-CodeCore-Merge | mradermacher/Vortex-9B-CodeCore-Merge-GGUF |
|---|---|---|
| Parametros | 9.197.093.888 | Los mismos (cuantizados) |
| Formato de pesos | safetensors | GGUF |
| Licencia | Apache 2.0 | Apache 2.0 (heredada) |
| Uso previsto | Inferencia con transformers / TGI | Inferencia local con llama.cpp, Ollama, LM Studio |
| Cuantizaciones | No aplica | Q2_K a f16, mas dos mmproj |
| Benchmarks publicados | No disponibles | No disponibles |

Alternativas comparables de 9B orientadas a codigo y agentes: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni descargas, ni valoraciones (0 descargas, 0 likes), de modo que no existe evidencia independiente de que el merge funcione mejor que sus componentes por separado.
- Riesgo propio de los merges: una fusion de pesos puede degradar capacidades concretas respecto a los modelos originales, producir respuestas incoherentes en ciertos dominios o dar lugar a un estilo de salida inconsistente entre turnos.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas con entradas largas (repositorios completos, documentos extensos) sin medirla empiricamente.
- Solo ingles declarado: no hay soporte oficial de castellano ni de otros idiomas; el rendimiento en español es impredecible.
- Perdida de calidad por cuantizacion: Q2_K y Q3_K_* comprimen de forma agresiva y degradan el modelo, algo especialmente sensible en generacion de codigo, donde un solo token incorrecto rompe la compilacion. Para uso serio, Q4_K_M o superior.
- Riesgo de alucinacion: como cualquier modelo de 9B sin verificacion externa, puede inventar APIs, funciones de libreria o rutas de fichero inexistentes; conviene validar el codigo generado con tests.
- Licencia: el repositorio declara Apache 2.0, una licencia permisiva que permite uso comercial, pero la declaracion corresponde al autor del merge. Conviene revisar las licencias de todos los modelos fusionados, ya que una fusion no puede relicenciar componentes con condiciones mas restrictivas.
- Capacidad multimodal sin confirmar: la presencia de ficheros mmproj no implica que la vision funcione correctamente; no hay documentacion ni ejemplos de uso.
- Sin cuantizaciones imatrix o ponderadas: el autor indica que no las ha generado, por lo que no se dispone de las variantes de mayor calidad que suelen acompanar a estos repositorios.
- Fechas del repositorio: los metadatos indican creacion y ultima actualizacion el 2026-09-18, lo que sugiere un lanzamiento reciente y sin rodaje en produccion.
- Uso en produccion: sin mediciones de latencia, throughput, estabilidad ni comportamiento con prompts largos, desplegarlo en un servicio critico exige una fase de evaluacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Vortex-9B-CodeCore-Merge-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Vortex-9B-CodeCore-Merge
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Vortex-9B-CodeCore-Merge-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; las busquedas devolvieron unicamente paginas de soporte de Microsoft sin relacion con el modelo.
