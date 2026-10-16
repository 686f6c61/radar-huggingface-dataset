# sigmanih/mistralai-Devstral-Small-2-24B-Instruct-2512-GGUF-Q4_K_M

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo Devstral-Small-2-24B-Instruct-2512, publicado por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: el modelo original lo desarrolla Mistral AI y está orientado a tareas de ingeniería de software, refactorización de código y flujos agénticos con tool calling. La arquitectura declarada es `mistral3`, con 23.572.403.200 parámetros totales y 40 capas transformer de dimensión oculta 5120.

La relevancia de esta ficha concreta es práctica: el formato Q4_K_M reduce el peso en disco a 13,35 GB y permite ejecutar un modelo de 24B con unos 15,2 GB de VRAM en descarga completa a GPU, lo que lo sitúa al alcance de tarjetas de consumo como una RTX 4080. Frente a los safetensors en BF16 del modelo base, la cuantización facilita el despliegue local y en servidores con GPU modesta, a cambio de una pérdida de precisión no cuantificada en la información disponible.

La model card declara una ventana de contexto de 393.216 tokens, aunque conviene tratar ese dato con cautela porque no procede de documentación oficial de Mistral AI incluida en la información disponible. Los idiomas declarados son inglés e italiano, y la licencia figura como "other" en los metadatos de HuggingFace, con una insignia Apache-2.0 en el cuerpo de la model card, lo que exige verificación antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mistral3` (transformer denso, 40 capas, dimension oculta 5120) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica: modelo denso, los 23,57B estan activos en cada token |
| Longitud de contexto | 393.216 tokens (dato declarado en la model card del repositorio) |
| Tipos de cuantizacion | GGUF Q4_K_M en este repositorio; otras cuantizaciones del mismo modelo base: no disponible |
| Idiomas soportados | Ingles (en) e italiano (it) |
| Licencia | `other` segun metadatos de HuggingFace; la model card muestra una insignia Apache-2.0. No disponible la licencia efectiva del modelo base |
| Formato de pesos | GGUF (Q4_K_M) |
| Tamano en disco | 13,35 GB (14,3 GB de tamano de repositorio en HuggingFace) |
| VRAM estimada | ~15,2 GB con descarga completa a GPU; ~15,0 GB de RAM en modo CPU o hibrido |
| Hardware recomendado por el autor | GPU con 16-20 GB de VRAM (por ejemplo RTX 4080) o 32 GB de RAM |
| Modelo base | mistralai/Devstral-Small-2-24B-Instruct-2512 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura `mistral3` de tipo transformer denso: 40 capas, dimension oculta 5120 y 23,57B de parametros, todos activos en cada paso de inferencia (la model card los etiqueta como "Active Parameters: 24B", lo que en un modelo denso equivale al total). No se documenta en la informacion proporcionada el numero de cabezas de atencion, el numero de capas KV, el uso de atencion con ventana deslizante ni el mecanismo de escalado de RoPE empleado para alcanzar la ventana de contexto declarada. Tampoco se detalla el proceso de entrenamiento del modelo original: no hay datos sobre volumen de tokens, composicion del dataset, fases de ajuste supervisado, RLHF o DPO.

Lo unico especifico de este repositorio es la cuantizacion: una conversion a GGUF Q4_K_M realizada y publicada mediante el modulo Model Hub de Sigma Studio, con un peso final de 13,35 GB. La model card menciona un motor propio ("SigmaEngine") empleado para las evaluaciones, pero no aporta informacion sobre el algoritmo de cuantizacion (por ejemplo, si se aplicaron tecnicas de cuantizacion consciente de importancia o calibracion con dataset), ni sobre que tensores quedaron fuera del esquema de 4 bits.

## Capacidades

- Generacion de texto conversacional en ingles e italiano, con modo instructivo.
- Generacion y refactorizacion de codigo, con resultados declarados altos en HumanEval (86%) y MBPP (78%) dentro de las evaluaciones del propio autor.
- Razonamiento matematico multi-paso y de competicion, con GSM8K declarado al 100% y MATH al 78% en las mismas pruebas.
- Razonamiento con cadena de pensamiento explicito ("Deep Thinking CoT"), que segun la model card mejora la precision del 59,6% al 72,1% frente al modo de respuesta directa.
- Tool calling y function calling, con una adherencia al protocolo de herramientas del 88,0% declarada en el banco de pruebas Sandbox Jail del autor.
- Ejecucion de flujos agenticos multi-paso: la model card describe acciones sobre sistema de ficheros en un entorno aislado, aunque el propio informe cifra la finalizacion autonoma de tareas en 0,0%.
- Despliegue compatible con endpoints mediante llama.cpp y etiquetas `endpoints_compatible`.
- Capacidades de vision: no disponibles en la informacion proporcionada.
- Soporte de audio: no disponible en la informacion proporcionada.
- Capacidades multilingues mas alla de ingles e italiano: no disponibles.

## Casos de uso

- Refactorizacion de bases de codigo heredadas: el modelo esta orientado a tareas de ingenieria de software y puede reescribir modulos completos manteniendo la interfaz publica, aprovechando su ventana de contexto amplia para cargar varios ficheros relacionados en un unico prompt.
- Agente de codigo en terminal: integrado mediante llama.cpp y un bucle de tool calling, puede leer ficheros, ejecutar tests y proponer parches de forma iterativa. La model card reporta 88,0% de adherencia al protocolo de herramientas, aunque tambien 0,0% de finalizacion autonoma de tareas en su propio banco de pruebas, por lo que conviene usarlo con supervision humana o con validacion automatica de cada paso.
- Generacion de tests unitarios: con resultados declarados de 78% en MBPP (que incluye comprobacion con tests) y 86% en HumanEval pass@1, es razonable para generar baterias de pruebas para funciones y modulos existentes, siempre con revision posterior.
- Revision de codigo automatizada en CI/CD: el modelo puede analizar diffs y emitir comentarios estructurados en formato JSON mediante tool calling, integrándose como paso de un pipeline antes del merge.
- Asistente local para desarrolladores en maquina personal: con 13,35 GB en disco y ~15,2 GB de VRAM en descarga completa, cabe en una estacion de trabajo con una RTX 4080 o similar, lo que permite trabajar con codigo propietario sin enviar nada a la nube.
- Traduccion y documentacion tecnica ingles-italiano: el modelo declara soporte de ambos idiomas, por lo que puede generar documentacion o comentarios de codigo en italiano a partir de fuentes en ingles, dentro de un pipeline de localizacion.
- Prototipado de agentes con razonamiento explicito: el modo de cadena de pensamiento permite obtener trazas de razonamiento auditables, útiles en entornos donde se necesita justificar la decision del sistema antes de ejecutar una accion.
- Servicio de asistencia tecnica en italiano: el soporte nativo del idioma y la ventana de contexto amplia permiten mantener conversaciones multi-turno con historial largo y documentacion adjunta, siempre que se disponga de memoria suficiente para la cache KV.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los publicados en la model card del propio repositorio. Se obtuvieron con temperatura 0, semilla 42 y protocolos de `code_execution`, `continuation_logprob`, `cot_generation` y `letter_logprob`. El autor advierte explicitamente de que las cifras se midieron sobre una porcion reducida de cada conjunto de datos y que no son comparables con ejecuciones completas de las suites.

| Benchmark | Dominio | Aciertos / total | Precision declarada |
|---|---|---|---|
| GSM8K | Matematicas de primaria multi-paso | 9 / 9 | 100% |
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% |
| BIG-Bench Hard | Logica y simbolismo multi-tarea | 6 / 7 | 86% |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86% |
| MATH | Matematicas de competicion | 7 / 9 | 78% |
| MBPP | Programacion Python con tests | 7 / 9 | 78% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 5 / 9 | 56% |
| TruthfulQA | Factualidad y anti-alucinacion | 5 / 9 | 56% |
| GPQA | Razonamiento academico de posgrado | 4 / 9 | 44% |
| MMLU | Conocimiento general multi-materia | 5 / 14 | 36% |
| HellaSwag | Sentido comun y NLI situacional | 3 / 9 | 33% |
| Total | Todos los conjuntos evaluados | 65 / 100 | 65% |

Comparativa de modos de ejecucion declarada por el autor:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| Respuesta directa (sin razonamiento) | 59,6% | 34 / 57 | Latencia minima, sin tokens de razonamiento |
| Cadena de pensamiento (Deep Thinking) | 72,1% | 31 / 43 | Traza de razonamiento multi-paso, delta de +12,4 puntos |

Resultados del banco de pruebas agentico (Sandbox Jail):

| Metrica | Resultado declarado |
|---|---|
| Adherencia al protocolo de herramientas | 88,0% |
| Finalizacion autonoma de tareas | 0,0% (0/1 escenarios) |
| Contencion en el sandbox | 100% conforme, cero intentos de escape |
| Eficiencia de ejecucion | 0 turnos (0,0 s) |

Advertencia importante: varias de estas cifras presentan incoherencias internas. MMLU con 14 preguntas y HellaSwag con 9 preguntas son muestras demasiado pequenas para ser interpretables, y una precision del 36% en MMLU es anomala para un modelo de 24B (habitualmente en el rango del 70-80% de acierto en la suite completa), lo que apunta a un arnes de evaluacion poco fiable mas que a una debilidad real del modelo. En el banco agentico, una adherencia al protocolo del 88,0% convive con 0/92 criterios analiticos verificados y 0 turnos de ejecucion, combinacion contradictoria. No se han publicado en la informacion disponible resultados de benchmarks oficiales de Mistral AI para el modelo base.

## Requisitos de hardware

- VRAM con descarga completa a GPU: aproximadamente 15,2 GB segun la model card del autor.
- RAM en modo CPU o hibrido: aproximadamente 15,0 GB.
- Espacio en disco: 13,35 GB para el fichero GGUF; el repositorio completo ocupa 14,3 GB.
- GPU recomendadas por el autor: 16-20 GB de VRAM, con una RTX 4080 como ejemplo explicito.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM (RTX 4080, RTX 4090, RTX 5080 y superiores). No cabe con holgura en tarjetas de 8-12 GB.
- Ejecucion parcial en CPU: viable con 32 GB de RAM en configuracion hibrida, con `n-gpu-layers` ajustado segun la VRAM disponible.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, koboldcpp) son la via natural para un fichero GGUF. La model card tambien menciona compatibilidad con endpoints. Para vLLM el soporte de GGUF es limitado y experimental, y TGI no lo soporta de forma nativa; en esos casos la alternativa es partir de los safetensors del modelo base.
- Contexto maximo: la ventana de 393.216 tokens declarada no es utilizable con 15,2 GB de VRAM, ya que la cache KV a esa longitud exige mucha mas memoria que los pesos cuantizados. No se dispone del numero de capas KV ni de cabezas, por lo que no es posible calcular el tamano de cache por token.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que el modo sin razonamiento tiene "latencia minima" y que el modo CoT anade una traza de razonamiento multi-paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Devstral Small 2 24B Q4_K_M) | 23,57B densos | 393.216 tokens declarados | GGUF Q4_K_M, 13,35 GB | `other` en metadatos; insignia Apache-2.0 en la model card | Publicado por sigmanih, 0 descargas y 0 likes en el momento de la consulta |
| mistralai/Devstral-Small-2-24B-Instruct-2512 (base) | 23,57B densos | No disponible en la informacion proporcionada | Safetensors; el peso en BF16 se estima en torno a 47 GB por aritmetica del numero de parametros, dato no confirmado | No disponible; verificar en el repositorio original | Repositorio oficial de Mistral AI en HuggingFace |
| Otras cuantizaciones del mismo modelo base (Q5_K_M, Q8_0, Q2_K, etc.) | 23,57B densos | No disponible | GGUF, tamanos no disponibles | No disponible | No disponible en la informacion proporcionada |
| Modelos comparables de otros fabricantes para agentes de codigo | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables: los unicos resultados obtenidos fueron paginas del servicio Google Translate, sin relacion con el contenido de la ficha.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en BF16. No se ha publicado ninguna evaluacion comparativa entre esta version y el modelo base, por lo que el impacto real sobre tareas de codigo y razonamiento es desconocido.
- Las cifras de benchmarks proceden de muestras muy pequenas (entre 7 y 14 preguntas por suite) y el propio autor advierte de que no son comparables con ejecuciones completas. No deben usarse para decisiones de adopcion.
- La puntuacion de 36% en MMLU y 33% en HellaSwag es inconsistente con el comportamiento esperado de un modelo de 24B y sugiere un problema en el arnes de evaluacion; conviene desconfiar de toda la tabla hasta que exista una evaluacion independiente.
- Los resultados del banco agentico son internamente contradictorios: 88,0% de adherencia al protocolo junto a 0/92 criterios verificados y 0 turnos de ejecucion. La finalizacion autonoma de tareas se declara en 0,0%.
- El modelo esta publicado por un tercero (sigmanih) y no por Mistral AI. No hay garantia de que la conversion se haya realizado con un proceso reproducible, ni se documenta el hash de los pesos originales.
- La licencia figura como `other` en los metadatos de HuggingFace mientras la model card muestra una insignia Apache-2.0. Esta discrepancia debe resolverse consultando la licencia del modelo base antes de cualquier uso comercial.
- Idiomas declarados: unicamente ingles e italiano. No hay soporte declarado de castellano, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion especificas. La unica metrica relacionada, TruthfulQA al 56% sobre 9 preguntas, es demasiado debil para extraer conclusiones.
- La ventana de contexto de 393.216 tokens es un dato declarado en la model card del tercero y no verificable con la informacion disponible; ademas, su uso practico esta limitado por la memoria necesaria para la cache KV.
- El rendimiento en tareas agenticas sin supervision humana no esta respaldado por los datos disponibles; se recomienda validacion automatica de cada accion.
- Sesgos conocidos: no disponibles. No se ha publicado informacion sobre composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita inferir calidad o estabilidad.
- Latencia y throughput en produccion: no disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sigmanih/mistralai-Devstral-Small-2-24B-Instruct-2512-GGUF-Q4_K_M
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- Repositorio de Sigma Studio en GitHub: https://github.com/Sigmanih/SigmaStudio
- Perfil de HuggingFace del autor: https://huggingface.co/sigmanih
- Licencia Apache 2.0 (referenciada en la insignia de la model card): https://opensource.org/licenses/Apache-2.0
- Resultados de la busqueda web: no se encontraron enlaces relevantes. Las unicas entradas devueltas correspondian al servicio Google Translate (https://translate.google.com/, https://translate.google.fr/, https://translate.google.us/details) y no guardan relacion con el modelo.
