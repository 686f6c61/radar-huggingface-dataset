# 0xSojalSec/Qwen3.8-27B-Uncensored-Cyber-agent

## Resumen

Qwen3.8-27B-Uncensored-Cyber-agent es un repositorio de cuantizaciones GGUF publicado por el usuario 0xSojalSec sobre el modelo philbert440/Qwen3.8-27B-Uncensored-Cyber. No se trata de un modelo nuevo ni de un ajuste fino: el propio autor declara que todos los pesos y el comportamiento son obra de philbert440, y que esta contribución se limita a la cuantización y a la metodología de calibración. Lo relevante aquí es el uso de una importance matrix (imatrix) construida a partir de tráfico real de agentes de codificación en lugar de prosa genérica en inglés, con el objetivo de preservar los canales que más se degradan en uso agéntico: JSON de llamadas a herramientas, tokens especiales de plantilla de chat, literales largos que deben reproducirse de forma literal (rutas, hashes, UUID) y texto mixto chino/inglés.

El modelo subyacente pertenece a la familia Qwen3, con nombre comercial de 27B de parámetros, y conserva dos componentes clave heredados del upstream: la torre de visión (pipeline image-text-to-text) y la cabeza MTP de decodificación especulativa. La model card indica que el modelo se sirve con un contexto de 262 K tokens. Se trata además de un modelo «abliterated» (de-refusal), especializado en el dominio de ciberseguridad y seguridad ofensiva, por lo que la ausencia de rechazos es una característica declarada, no un defecto.

Su relevancia actual es acotada pero concreta: es un ejemplo de buenas prácticas de cuantización orientada a cargas agénticas, con artefactos verificables por tamaño y SHA-256, y una advertencia explícita sobre el alcance limitado de sus mediciones. El repositorio no incluye evaluación de calidad (MMLU, HumanEval, GSM8K) ni métricas de capacidad, y en el momento de la consulta registra 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3 (según nomenclatura del autor), con torre de visión y cabeza MTP de decodificación especulativa preservadas; no se documenta si hay componentes MoE o SSM |
| Parametros totales | 27 000 millones según el nombre del modelo; los metadatos de safetensors del repositorio declaran 3 391 984 parámetros, cifra incoherente que probablemente sea un artefacto de metadatos, ya que el repositorio solo contiene GGUF |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262 144 tokens (262 K), según la mención de la model card al contexto con el que se sirve el modelo |
| Tipos de cuantizacion | IQ4_XS con imatrix (calibrada sobre el release Q8_0); Q8_0 como origen de la cuantización; Q5_K_M mencionado en una comparación medida localmente y no publicada; los tensores de salida y de embedding se fijan en q8_0 |
| Idiomas soportados | No disponible oficialmente; el corpus de calibración descrito es mixto chino/inglés (prosa en chino, rutas y código en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio también publica la imatrix en GGUF |
| Tamano del repositorio | 32,6 GB |
| Pipeline declarado | image-text-to-text (multimodal) |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha realizado entrenamiento, ajuste fino ni merging en este repositorio. La model card es explícita: «All model weights and behaviour are philbert440's work. This repository contributes only the quantization and the calibration methodology». Por tanto, la arquitectura es la del modelo base Qwen3.8-27B-Uncensored-Cyber, un transformer de la familia Qwen3 con dos elementos preservados que habilitan rutas funcionales concretas: la torre de visión (que sostiene el pipeline image-text-to-text) y la cabeza MTP de predicción multi-token, que permite decodificación especulativa. El modelo base es, a su vez, una variante «abliterated» (de-refusal) orientada a seguridad ofensiva, cuyo recetario y evaluación se documentan en su propia model card, no en esta.

La aportación técnica diferencial es la calibración. En lugar de los conjuntos genéricos habituales de llama.cpp (`wiki.train.raw`, `groups_merged.txt`), la imatrix se construyó con registros reales de sesiones de agente: 1,00 MB de corpus, 42 sesiones muestreadas, 648 turnos de diálogo, 528 llamadas reales a herramientas, 1191 apariciones de `<|im_start|>` y 547 de `<tool_call>`, procesadas en 584 fragmentos con `-c 512`. El fallo concreto que se pretende mitigar se describe con precisión: un agente que escribe `/home/eze/Documents/PotouI` en lugar de `/home/ezra/Documents/Proto-UI`, lee su propia salida corrupta y concluye que su contexto es inconsistente. El corpus no se publica por contener rutas y comandos reales; solo se publica la imatrix resultante para que el método sea reproducible.

Tres decisiones de proceso merecen mención. Primero, `--parse-special` se considera obligatorio: sin él, llama.cpp tokeniza `<|im_start|>` como texto literal y los tokens especiales nunca entran en las estadísticas; el efecto medido en la misma familia de corpus es de 0,342 a 0,299 tokens por byte (−12,7 %). Segundo, el contexto de calibración se mantuvo deliberadamente en 512 en lugar de igualar los 262 K de servicio, porque un contexto pequeño produce más muestras y más diversas para un presupuesto de tokens fijo. Tercero, se forzó `--output-tensor-type q8_0 --token-embedding-type q8_0` porque el error en la capa de salida se traduce directamente en elegir el token equivocado, que es justamente el fallo de copia literal descrito; el coste es de aproximadamente 1,5 GB.

### Artefactos publicados

| Archivo | Tamano | SHA-256 | Uso previsto |
|---|---:|---|---|
| `imatrix-agentic-v2.gguf` | 13,01 MiB | `a219ff5f3ffabb4a4b7cc644cae3a44f647032e2016b3308843ac8650e59af69` | Matriz de calibración publicada |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8.gguf` | 14,96 GiB | `d11d28b9b253fb7fc9de277a46af5bbd790c000d6bfdfe5648fd7b62ec2560b7` | Pesos de texto IQ4_XS sin los tensores MTP injertados |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8-plus-mtp.gguf` | 15,38 GiB | `da6a418f30a7e6c6669b74179f6d533ca06016e02eba298d2b713a2900d7a1ba` | Artefacto de producción en FastLLM; incluye la cabeza MTP compatible |

## Capacidades

- Generación de texto y código en un modelo de 27B de la familia Qwen3, con contexto declarado de 262 K tokens.
- Uso agéntico con llamadas a herramientas: la propia calibración se construyó a partir de tool calls reales con nombres como `bash`, `read` y `web_search`, y de argumentos reales.
- Razonamiento multi-paso en bucles de agente, incluyendo lectura de la propia salida y continuación de la tarea.
- Reproducción literal de cadenas largas (rutas de repositorio, nombres de paquetes, hashes de commit, UUID de dispositivo), objetivo explícito del diseño de la imatrix.
- Capacidad multimodal heredada: el pipeline declarado es image-text-to-text y la torre de visión se conserva en el upstream.
- Decodificación especulativa mediante la cabeza MTP, disponible en el artefacto `plus-mtp` cuando el runtime reconoce el injerto.
- Comportamiento «abliterated» (sin rechazos) y especialización declarada en ciberseguridad y seguridad ofensiva.
- Manejo de entrada mixta chino/inglés, según la composición del corpus de calibración.
- Soporte de plantilla de chat con marcadores especiales (`<|im_start|>`, `<tool_call>`) correctamente tokenizados en la calibración.

## Casos de uso

- Agentes de codificación autónomos: el modelo está calibrado específicamente sobre tráfico de un CLI de agente que ejecuta tareas de programación, de modo que las llamadas a `bash`, `read` y `web_search` y sus argumentos sobreviven a la cuantización IQ4_XS con menos corrupción que en una cuantización calibrada con prosa genérica.
- Refactorización y navegación de repositorios grandes: con 262 K tokens de contexto puede mantener varios ficheros y rutas simultáneamente, y la calibración prioriza justamente la fidelidad de rutas y nombres de paquete en la salida.
- Automatización de tareas de shell con verificación posterior: el modelo está pensado para escribir comandos, leer su propia salida y continuar; encaja en pipelines donde el agente debe encadenar decenas de pasos sin perder coherencia de contexto.
- Auditoría de seguridad y pruebas de penetración en entornos autorizados: es su dominio declarado de especialización; debe usarse exclusivamente sobre sistemas propios o con autorización por escrito, dado que el modelo carece de rechazos.
- Análisis de capturas de pantalla e interfaces: al conservar la torre de visión y declarar pipeline image-text-to-text, puede procesar imágenes junto a texto, por ejemplo diagramas de red o paneles de administración, siempre que el runtime soporte la ruta multimodal.
- Asistencia en triaje de incidentes: combinando contexto largo y lectura de salidas de comandos, resulta adecuado para resumir logs extensos y proponer el siguiente comando de diagnóstico en un flujo semi-automático.
- Servicio de baja latencia con decodificación especulativa: el artefacto `plus-mtp` permite activar la cabeza MTP en un runtime compatible (FastLLM) para acelerar la generación frente al uso de un cargador GGUF convencional.
- Generación de código en pipelines internos: puede integrarse como paso de un pipeline de CI/CD para proponer parches o scripts, con revisión humana obligatoria dado que no hay evaluación publicada de su tasa de acierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de capacidad, ni en el repositorio ni en la model card, que remite a la del modelo base para la evaluación. Las únicas métricas publicadas son de proceso de cuantización:

| Metrica | Valor | Contexto |
|---|---|---|
| Tokens por byte sin `--parse-special` | 0,342 | Misma familia de corpus de calibración |
| Tokens por byte con `--parse-special` | 0,299 | Mejora del 12,7 %, atribuida a que los marcadores de plantilla colapsan en tokens únicos |
| Tamano de la imatrix | 13,01 MiB | `imatrix-agentic-v2.gguf` |
| Tamano del artefacto IQ4_XS | 14,96 GiB | Sin tensores MTP |
| Tamano del artefacto IQ4_XS plus-MTP | 15,38 GiB | Con cabeza MTP |

La model card advierte además de que el alcance de la comparación es estrecho: los números medidos provienen de un corpus agéntico reservado y la comparación con Q5_K_M se midió localmente y no está publicada en el repositorio. No se proporcionan cifras de perplejidad ni de precisión en tareas.

## Requisitos de hardware

- VRAM mínima para los pesos: 14,96 GiB con el fichero IQ4_XS sin MTP y 15,38 GiB con el fichero `plus-mtp`. A ello hay que sumar la caché KV y el overhead del runtime.
- El contexto de 262 K tokens hace inviable servir la ventana completa en GPU de consumo sin cuantizar la caché KV y/o descargar capas a CPU; no hay cifras publicadas de consumo de VRAM a contexto completo.
- GPUs de 24 GB: el artefacto IQ4_XS cabe en una RTX 3090 o RTX 4090 con contexto moderado. Con contexto largo, se necesita cuantización de KV u offloading.
- GPUs de 16 GB: el tag `v100` sugiere que el autor apunta a este hardware, pero 15,38 GiB de pesos dejan muy poco margen en una V100 de 16 GB; requeriría offloading de capas o contexto muy reducido.
- GPUs de centro de datos (A100 40/80 GB, H100 80 GB): permiten servir el modelo con contexto amplio y lotes mayores, además de habilitar la ruta MTP con holgura.
- Despliegue: llama.cpp es la vía natural, ya que el repositorio documenta los comandos `llama-imatrix` y `llama-quantize`. El artefacto `plus-mtp` se declara como artefacto de producción en FastLLM y solo debe usarse con un runtime que reconozca el injerto MTP; para cargadores GGUF convencionales se recomienda el fichero sin MTP.
- No se documenta compatibilidad con vLLM, TGI, Ollama ni ningún otro servidor; no disponible.
- Latencia y throughput: no disponibles. La única indicación de rendimiento es cualitativa, relativa a la decodificación especulativa con la cabeza MTP.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de su categoría. La comparación posible se limita a los artefactos del propio repositorio y a la relación con su modelo base, y es la siguiente:

| Modelo / artefacto | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio, IQ4_XS sin MTP | 27B según nombre | 262 K | IQ4_XS con imatrix agéntica | apache-2.0 | GGUF, 14,96 GiB |
| Este repositorio, IQ4_XS plus-MTP | 27B según nombre | 262 K | IQ4_XS con imatrix agéntica + cabeza MTP | apache-2.0 | GGUF, 15,38 GiB, requiere runtime compatible |
| philbert440/Qwen3.8-27B-Uncensored-Cyber (base) | No disponible | No disponible en la información proporcionada | No disponible | No disponible | Pesos upstream; documenta el recetario y la evaluación |
| Qwen3.8-27B-Uncensored-Cyber-Q8_0 | 27B según nombre | 262 K | Q8_0 | No disponible | Usado como origen de la cuantización y de la imatrix |
| Alternativas de otros fabricantes en el rango 27-32B | No disponible | No disponible | No disponible | No disponible | Comparación no disponible por ausencia de benchmarks publicados |

## Limitaciones y advertencias

- Modelo «abliterated» (de-refusal): se ha eliminado la capacidad de rechazo. Puede generar contenido operativo de seguridad ofensiva sin filtros, lo que traslada toda la responsabilidad legal y ética al operador.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, toxicidad o alineación para este repositorio ni, en la información proporcionada, para el modelo base.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de fidelidad, veracidad ni tasa de error en tareas abiertas.
- Limitación específica de la cuantización: la propia model card reconoce que se ha cuantizado desde el release Q8_0 y no desde BF16, mediante `--allow-requantize`; es, por tanto, una doble cuantización, aunque el error dominante sea el del paso a IQ4.
- Margen de error en copia literal: el problema de reproducción exacta de rutas, hashes y UUID es el objetivo declarado de la calibración, pero no se publican métricas de mejora en esa tarea, solo el efecto sobre tokens por byte.
- Alcance de la validación: la comparación con Q5_K_M se midió localmente y no está publicada; el corpus de calibración es privado y no reproducible de forma exacta.
- Idiomas: no hay declaración oficial de idiomas soportados. El corpus de calibración es mixto chino/inglés; el rendimiento en castellano no está evaluado.
- Contexto: aunque se declaran 262 K tokens, no hay datos publicados de degradación con contexto largo ni de rendimiento real a esa longitud.
- Licencia: el repositorio declara apache-2.0, pero al derivar de un modelo de la familia Qwen3 conviene verificar la cadena de licencias del upstream antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. Es un artefacto de comunidad sin validación independiente.
- Ruta multimodal y MTP: dependen de que el runtime soporte tanto la torre de visión como el injerto MTP; un cargador GGUF convencional puede ignorar o fallar al cargar esos tensores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Cyber-agent
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- La model card del modelo base es la referencia indicada por el autor para el recetario y la evaluación:  
  https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Paper, blog, repositorio de código o demo: no disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos correspondían a contenidos sin relación (listados de restaurantes y consultas de códigos postales).
