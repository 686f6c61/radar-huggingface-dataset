# FINAL-Bench/POCKET-26B-GGUF

## Resumen

POCKET-26B-GGUF es una cuantizacion en formato GGUF del modelo google/gemma-4-26B-A4B-it, publicada por el usuario FINAL-Bench bajo licencia Apache-2.0. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 25.233.142.046 parametros totales (aproximadamente 25,2B) y unos 4B parametros activos por token, derivado del checkpoint base de Google. El paquete mantiene el modelo sin podar y aplica una cuantizacion ajustada al coreano por VIDRAFT, con dos builds principales: Q2_K (unos 11 GB) y Q4_K_M (unos 17 GB).

El objetivo declarado es la asistencia de texto local, con enfasis en ejecucion on-device y en CPU, incluyendo dispositivos moviles. La model card insiste en que el tamano del archivo no equivale al consumo de memoria del proceso: un archivo de 11 GB no garantiza funcionamiento fiable en un telefono de 12 GB, ya que hay que sumar sistema operativo, contexto, buffers del runtime y otras aplicaciones. El modelo esta etiquetado como korean-llm, pero la model card no documenta explicitamente la composicion del ajuste ni los idiomas soportados mas alla de esa etiqueta.

La relevancia actual viene de la combinacion de un MoE con pocos parametros activos y una cuantizacion agresiva que permite desplegar un modelo de 25B en entornos con memoria limitada mediante llama.cpp. No obstante, el autor no aporta mediciones de rendimiento por dispositivo, latencia ni throughput, y limita explicitamente sus afirmaciones a mediciones del publicador con condiciones dependientes del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | Aprox. 4B por token (segun designacion A4B del modelo base) |
| Longitud de contexto | No disponible (los ejemplos de ejecucion usan `-c 4096`, pero no se declara contexto maximo) |
| Tipos de cuantizacion | Q2_K (aprox. 11 GB) y Q4_K_M (aprox. 17 GB); cuantizacion de precision mixta con imatrix |
| Idiomas soportados | No disponible; etiquetado como korean y korean-llm, sin listado formal de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26B-A4B-it, un transformer con capas Mixture-of-Experts en el que cada token activa aproximadamente 4B parametros de un total de 25,2B. Esta relacion entre parametros totales y activos es la que hace viable la inferencia en CPU y en dispositivos con memoria moderada: el coste computacional por token se aproxima al de un modelo denso de 4B, mientras que la capacidad representacional proviene de los 25,2B totales. El sufijo "it" del checkpoint base indica un ajuste para instrucciones y conversacion.

Sobre ese checkpoint, FINAL-Bench aplica una cuantizacion ajustada al coreano atribuida a VIDRAFT, manteniendo el modelo sin podar. La model card menciona el uso de imatrix (matriz de importancia) en el proceso de cuantizacion, una tecnica habitual en llama.cpp para preservar las capas y tensores mas sensibles al reducir la precision. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion tecnica concreta del ajuste coreano mas alla de la etiqueta y la referencia a VIDRAFT.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y el pipeline es text-generation, orientado a asistencia de texto local.
- Razonamiento y respuesta a instrucciones: heredado del checkpoint base gemma-4-26B-A4B-it, ajustado para instrucciones.
- Soporte multilingue: la model card no documenta una lista de idiomas; el ajuste declarado es coreano, sin datos sobre el resto de idiomas.
- Ejecucion on-device y en CPU: incluye un camino de ejecucion solo-CPU documentado con llama.cpp (`--device none -ngl 0`).
- Integracion con runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio y otras aplicaciones con soporte explicito de Gemma4.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de texto en local para usuarios coreanos: el modelo se distribuye con un ajuste declarado al coreano y puede ejecutarse en llama.cpp sobre CPU, lo que permite desplegar un asistente de escritura o resumen sin conexion ni envio de datos a la nube.
- Prototipado en portatiles sin GPU dedicada: el build Q2_K de unos 11 GB permite cargar el modelo en un equipo con RAM suficiente y ejecutarlo con `-ngl 0`, usando el modelo como banco de pruebas de prompts y flujos conversacionales.
- Evaluacion de cuantizaciones MoE: al ofrecer dos builds (Q2_K y Q4_K_M) del mismo checkpoint, sirve para comparar la degradacion de calidad entre niveles de cuantizacion en tareas de generacion de texto.
- Despliegue en aplicaciones de escritorio con LM Studio u Ollama: al ser un GGUF compatible con runtimes con soporte de Gemma4, puede integrarse como backend local en herramientas de escritorio que consumen modelos mediante API local.
- Procesamiento de texto por lotes en servidores sin GPU: el camino solo-CPU y el bajo numero de parametros activos por token permiten ejecutar tareas de clasificacion, resumen o reescritura en maquinas sin acelerador, aceptando el coste de latencia.
- Experimentacion con modelos derivados y cuantizados: investigadores que necesiten estudiar el comportamiento de un MoE de 25B con 4B activos bajo cuantizacion agresiva pueden usar este paquete como referencia reproducible con licencia Apache-2.0.
- Educacion y divulgacion: el ejemplo de descarga y ejecucion con llama.cpp documentado en la model card sirve como caso practico para explicar cuantizacion, MoE y ejecucion local.

## Benchmarks y rendimiento

La model card menciona un "reported GPQA result" para el build Q2_K, pero no incluye la tabla de resultados ni las cifras en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

En cuanto a rendimiento de ejecucion, la model card indica explicitamente que no se suministran cifras de throughput para CPU ni mediciones de encaje en telefono; solo se documenta la existencia de un camino de ejecucion solo-CPU.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q2_K ocupa unos 11 GB y el Q4_K_M unos 17 GB, pero son tamanos de archivo en GB decimales, no consumo de memoria del proceso. Hay que anadir sistema operativo, contexto, buffers del runtime y otras aplicaciones.
- GPU recomendadas: no disponible; la model card no especifica GPU objetivo ni requisitos de aceleracion.
- Ejecucion en consumer GPU: no disponible; no se documenta compatibilidad ni rendimiento en RTX 4090 u otras GPU de consumo.
- Ejecucion en CPU: documentada, con `--device none -ngl 0 -t 8 -c 4096 -n 256` como ejemplo de invocacion en llama.cpp.
- Despliegue: llama.cpp (con soporte de Gemma4), Ollama (version con soporte de Gemma4 y del GGUF seleccionado), LM Studio (runtime incluido con soporte de Gemma4), y PocketPal, koboldcpp o runtimes de navegador solo si declaran soporte explicito de Gemma4 y memoria suficiente.
- Apple MLX: no compatible con estos archivos; se requiere un artefacto MLX separado, que no se suministra en este repositorio.
- Latencia y throughput: no disponibles; no se aportan mediciones por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| POCKET-26B-GGUF (este) | 25,2B | Aprox. 4B | No disponible | Apache-2.0 | GGUF | Cuantizacion Q2_K/Q4_K_M de gemma-4-26B-A4B-it, ajuste coreano declarado |
| google/gemma-4-26B-A4B-it | 25,2B | Aprox. 4B | No disponible | No disponible en la informacion proporcionada | Safetensors (checkpoint original) | Modelo base sin cuantizar; requiere mas memoria |
| POCKET-35B-GGUF | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF | Otro paquete del mismo publicador, referenciado en la model card |
| POCKET-Darwin-180B-GGUF | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF | Paquete de mayor tamano del mismo publicador, referenciado en la model card |
| POCKET-KR-GGUF | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF | Artefacto orientado a telefonos de menor tamano, segun la model card |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si.

## Limitaciones y advertencias

- El tamano del archivo no equivale al uso de memoria: un GGUF de 11 GB no garantiza funcionamiento en un telefono de 12 GB, y la model card rechaza explicitamente cualquier afirmacion de encaje medido en telefonos de 12 GB.
- No se aportan mediciones de rendimiento por dispositivo, latencia ni throughput; las afirmaciones de rendimiento son mediciones del publicador con condiciones dependientes del dispositivo.
- La compatibilidad con aplicaciones no esta garantizada: el mismo formato GGUF no implica soporte en todas las apps o versiones; se requiere una version con soporte explicito de Gemma4.
- No hay matriz de compatibilidad exacta por version de runtime; la model card la describe como una oportunidad de contribucion de la comunidad.
- El ajuste al coreano no esta documentado en detalle: no se especifican datos de entrenamiento, composicion del dataset ni evaluacion de calidad en coreano.
- No se documenta el soporte real de otros idiomas distintos del coreano.
- La cuantizacion Q2_K es agresiva y puede degradar la calidad respecto al checkpoint original; la model card solo menciona un resultado de GPQA sin aportar la cifra.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero aplicables a cualquier modelo de lenguaje generativo.
- Licencia Apache-2.0: permite uso comercial, pero deben revisarse las condiciones del modelo base google/gemma-4-26B-A4B-it, cuya licencia no se detalla en la informacion proporcionada.
- Los ejemplos de comandos de la model card fueron revisados sintacticamente pero no ejecutados durante la revision indicada por el autor.
- No se suministran pesos MLX nativos; los usuarios de Apple Silicon deben buscar un artefacto MLX separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- Archivos del repositorio: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF/tree/main
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Guia de configuracion del autor: https://vidraft.net/p/pocket.html?model=pocket_26b
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- POCKET-KR-GGUF: https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF
- Documentacion de llama.cpp para construir: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Documentacion de carga de modelos en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/models.md
- Integracion GGUF de Hugging Face con Ollama: https://huggingface.co/docs/hub/ollama
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
