# jkim96/Seed-Coder-8B-Reasoning-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene una recuantizacion del modelo ByteDance-Seed/Seed-Coder-8B-Reasoning realizada con el metodo DASH-Q y distribuida en formato GGUF para su uso con llama.cpp. El autor del repositorio es jkim96, mientras que el modelo base fue desarrollado por el equipo Seed de ByteDance. El artefacto resuelve un problema muy concreto: permitir ejecutar un modelo de codigo con capacidad de razonamiento de 8.250 millones de parametros en entornos con memoria muy limitada, comprimiendolo a tamanos de entre 2,65 GB y 3,38 GB por fichero.

La propuesta tecnica de DASH-Q es producir ficheros GGUF de "clase 2 bits" que emplean exclusivamente tipos de tensor estandar de llama.cpp (ningun tensor por encima de 4 bits) y que, segun las mediciones del propio autor, obtienen una perplejidad notablemente inferior a las cuantizaciones equivalentes de llama.cpp (imatrix) y de unsloth. En concreto, el fichero Q2_K_XL de DASH-Q alcanza 24,81 de perplejidad en WikiText-2 frente a 27,65 de llama.cpp Q2_K y 25,38 de unsloth UD-Q2_K_XL.

El repositorio es de creacion muy reciente, con cero descargas y un unico "like" en el momento de la consulta, por lo que debe considerarse un artefacto poco validado por la comunidad. La licencia declarada es MIT (heredada del modelo base), lo que facilita el uso comercial, aunque no se especifican de forma explicita los idiomas soportados. El contexto de ejemplo en la propia model card es de 8.192 tokens, pero la longitud de contexto real del modelo base no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (segun modelo base); detalles internos no disponibles |
| Parametros totales | 8.250.462.208 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card usa `-c 8192` en el ejemplo de uso) |
| Tipos de cuantizacion | IQ2_XXS (2,57 bits/peso), IQ2_XS (2,89 bits/peso), IQ2_M (3,04 bits/peso), Q2_K_XL (3,28 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de ByteDance-Seed/Seed-Coder-8B-Reasoning) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | ByteDance-Seed/Seed-Coder-8B-Reasoning |
| Relacion con el base | quantized |
| Tamano del repositorio | 12,1 GB |
| Pipeline | text-generation |
| Libreria | gguf |

Desglose de ficheros:

| Fichero | Tipo | Tamano | Bits / peso |
|---|---|---|---|
| `Seed-Coder-8B-Reasoning-DASHQ-IQ2_XXS.gguf` | IQ2_XXS | 2,65 GB | 2,57 |
| `Seed-Coder-8B-Reasoning-DASHQ-IQ2_XS.gguf` | IQ2_XS | 2,98 GB | 2,89 |
| `Seed-Coder-8B-Reasoning-DASHQ-IQ2_M.gguf` | IQ2_M | 3,13 GB | 3,04 |
| `Seed-Coder-8B-Reasoning-DASHQ-Q2_K_XL.gguf` | Q2_K_XL | 3,38 GB | 3,28 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada, salvo que se trata de un modelo de la familia Seed-Coder-8B de ByteDance en su variante Reasoning, con 8.250 millones de parametros. El modelo original esta orientado a generacion de codigo y razonamiento; al ser un modelo denso de ~8B, se asume una topologia transformer decoder-only habitual en esta categoria, aunque este punto no queda confirmado de forma explicita en los datos disponibles.

Lo que si esta documentado es el proceso de cuantizacion posterior. DASH-Q genera ficheros GGUF de clase 2 bits usando unicamente tipos de tensor estandar de llama.cpp, garantizando que ningun tensor supere los 4 bits y que los ficheros carguen en cualquier build reciente de llama.cpp. La mejora de calidad se atribuye al metodo de cuantizacion (con soporte de imatrix), no al reentrenamiento del modelo. No se aportan datos sobre el numero de tokens de entrenamiento del base, la composicion del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de codigo: el modelo base Seed-Coder-8B-Reasoning esta orientado a tareas de programacion.
- Razonamiento: la variante "Reasoning" del base sugiere capacidad de razonamiento paso a paso, aunque no se detalla el mecanismo en la informacion disponible.
- Conversacion: el repositorio incluye la etiqueta `conversational`, lo que indica soporte de formato de dialogo multi-turno.
- Inferencia local: al ser GGUF, es ejecutable en CPU y GPU mediante llama.cpp.
- Tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y multi-step reasoning: no disponible (no confirmado).
- Capacidades multilingues: no disponible (los idiomas no estan especificados).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Asistente de codigo en portatiles sin GPU dedicada: con 2,65-3,38 GB de pesos, los ficheros Q2 caben en RAM de equipos modestos y permiten autocompletado y explicacion de codigo completamente en local mediante llama.cpp, sin depender de servicios en la nube.
- Revision de codigo en pipelines de CI/CD: el modelo puede integrarse como paso de analisis estatico asistido por IA, generando comentarios sobre pull requests en entornos de integracion donde no hay aceleradores de alto rendimiento disponibles.
- Despliegue en dispositivos de borde (edge): el tamano reducido de las cuantizaciones IQ2 permite empaquetar un modelo de codigo de 8B en dispositivos con memoria limitada, como mini-PC o SBC con suficiente RAM.
- Entornos aislados o air-gapped: al ser un fichero unico GGUF y no requerir conexion externa, es adecuado para organizaciones que necesitan asistencia de codigo sin exponer datos fuera de su red.
- Educacion y prototipado rapido: permite a estudiantes y desarrolladores experimentar con un modelo de razonamiento de codigo sin acceso a GPU de datacenter, usando el fichero IQ2_XXS en hardware de gama baja.
- Pruebas comparativas de cuantizacion: el repositorio ofrece cuatro niveles de compresion del mismo modelo, lo que resulta util para evaluar el compromiso entre tamano y calidad antes de fijar una configuracion en produccion.
- Generacion de fragmentos en herramientas de terminal: uso mediante `llama-cli` para generar o completar codigo desde la linea de comandos en flujos de trabajo ligeros.

## Benchmarks y rendimiento

La model card proporciona unicamente metricas de perplejidad (`llama-perplexity`, contexto 2048; WikiText-2 test, C4 validation con 256 x 2048 tokens). Valores mas bajos son mejores.

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 2,51 GB | 32,46 | 40,64 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 2,63 GB | 31,36 | 39,94 |
| IQ2_XXS | DASH-Q IQ2_XXS | 2,65 GB | 26,82 | 35,97 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 2,72 GB | 29,29 | 37,85 |
| IQ2_XS | DASH-Q IQ2_XS | 2,98 GB | 25,58 | 34,42 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 3,07 GB | 27,75 | 36,07 |
| IQ2_M | unsloth UD-IQ2_M | 3,13 GB | 27,17 | 36,04 |
| IQ2_M | DASH-Q IQ2_M | 3,13 GB | 25,15 | 34,05 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 3,30 GB | 27,65 | 36,48 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 3,54 GB | 25,38 | 33,95 |
| Q2_K_XL | DASH-Q Q2_K_XL | 3,38 GB | 24,81 | 33,48 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores proceden del propio autor de la cuantizacion y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM/RAM para los pesos: entre 2,65 GB (IQ2_XXS) y 3,38 GB (Q2_K_XL) solo para los pesos del modelo.
- Memoria adicional: hay que sumar la cache KV y el overhead del runtime. A contexto moderado (por ejemplo 8.192 tokens) conviene reservar en torno a 1-2 GB extra, de modo que el consumo total estimado se situa aproximadamente entre 3,5 GB y 6 GB dependiendo del fichero, el contexto y el backend. Estas cifras son estimaciones, no datos publicados.
- GPU de consumo: si, cabe en practicamente cualquier GPU con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 2070). El fichero IQ2_XXS puede incluso caber en GPUs de 4 GB con contexto reducido.
- GPU de datacenter: compatible con A100, H100 y similares, aunque el modelo es demasiado pequeno para aprovechar su capacidad; se emplearian solo por agregacion de cargas.
- CPU-only: viable gracias al formato GGUF, si bien la latencia sera mucho mayor que en GPU.
- Opciones de despliegue: llama.cpp (referencia del autor, con `-ngl 99` para descargar todas las capas a GPU y `-c 8192` para el contexto), y potencialmente cualquier runtime compatible con GGUF (Ollama, servidores basados en llama.cpp). No se confirma compatibilidad probada con vLLM o TGI, ya que estos no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.
- Apple Silicon: es un caso razonable para Metal en llama.cpp por el bajo consumo de memoria, aunque no se aportan datos especificos.

## Comparativa con modelos similares

Comparacion de las cuatro variantes DASH-Q frente a las cuantizaciones equivalentes de llama.cpp y unsloth, usando los datos de perplejidad aportados por el autor (menor es mejor).

| Modelo | Tipo | Tamano | WikiText-2 | C4 | Licencia |
|---|---|---|---|---|---|
| DASH-Q IQ2_XXS | IQ2_XXS | 2,65 GB | 26,82 | 35,97 | MIT |
| llama.cpp IQ2_XXS (imatrix) | IQ2_XXS | 2,51 GB | 32,46 | 40,64 | MIT (base) |
| unsloth UD-IQ2_XXS | IQ2_XXS | 2,63 GB | 31,36 | 39,94 | MIT (base) |
| DASH-Q IQ2_XS | IQ2_XS | 2,98 GB | 25,58 | 34,42 | MIT |
| llama.cpp IQ2_XS (imatrix) | IQ2_XS | 2,72 GB | 29,29 | 37,85 | MIT (base) |
| DASH-Q IQ2_M | IQ2_M | 3,13 GB | 25,15 | 34,05 | MIT |
| llama.cpp IQ2_M (imatrix) | IQ2_M | 3,07 GB | 27,75 | 36,07 | MIT (base) |
| unsloth UD-IQ2_M | IQ2_M | 3,13 GB | 27,17 | 36,04 | MIT (base) |
| DASH-Q Q2_K_XL | Q2_K_XL | 3,38 GB | 24,81 | 33,48 | MIT |
| llama.cpp Q2_K (imatrix) | Q2_K_XL | 3,30 GB | 27,65 | 36,48 | MIT (base) |
| unsloth UD-Q2_K_XL | Q2_K_XL | 3,54 GB | 25,38 | 33,95 | MIT (base) |

En todos los niveles comparados, DASH-Q obtiene menor perplejidad que las alternativas, a costa de un tamano de fichero ligeramente superior en algunos casos (por ejemplo, Q2_K_XL DASH-Q ocupa 3,38 GB frente a 3,30 GB del Q2_K de llama.cpp, pero queda por debajo de los 3,54 GB de unsloth). No se dispone de comparativas con otras familias de modelos de codigo (por ejemplo, variantes cuantizadas de Qwen-Coder o DeepSeek-Coder) en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva de 2 bits: incluso con la mejora de DASH-Q, la perplejidad (24,81-26,82 en WikiText-2) es alta en terminos absolutos; cabe esperar degradacion en tareas de razonamiento o generacion de codigo respecto al modelo base sin cuantizar.
- Riesgo de alucinacion: previsible en un modelo de ~8B con cuantizacion de 2 bits, especialmente en tareas de codigo donde puede inventar APIs o funciones inexistentes. No hay evaluacion publicada al respecto.
- Validacion comunitaria practicamente nula: el repositorio tiene cero descargas y un unico like, y las metricas proceden del propio autor de la cuantizacion. Conviene validar en el caso de uso concreto antes de llevarlo a produccion.
- Idiomas no especificados: no se detalla que idiomas soporta el modelo base; no se debe asumir buen rendimiento en castellano.
- Contexto no confirmado: la model card usa 8.192 tokens de contexto en el ejemplo, pero no se declara la longitud maxima soportada. Configurar un contexto mayor sin conocer el limite podria degradar la calidad.
- Restricciones de licencia: la licencia declarada es MIT, heredada del base, lo que en principio permite uso comercial; no obstante, conviene verificar la licencia vigente del modelo base ByteDance-Seed/Seed-Coder-8B-Reasoning antes de un despliegue comercial.
- Compatibilidad de runtime: pensado para llama.cpp; otros motores de inferencia pueden no soportar los tipos de tensor IQ2 empleados.
- Fechas del repositorio: la fecha de creacion indicada es 2026-10-08, posterior a la de la mayoria de referencias; se recomienda comprobar la vigencia de los enlaces.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/Seed-Coder-8B-Reasoning-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Reasoning
- Repositorio de DASH-Q: https://github.com/JaeminK/dashq
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Banner DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
