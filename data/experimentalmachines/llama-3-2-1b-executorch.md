# experimentalmachines/Llama-3.2-1B-ExecuTorch

## Resumen

Llama-3.2-1B-ExecuTorch es un derivado cuantizado y empaquetado de `meta-llama/Llama-3.2-1B` (revision `4e20de362430`), publicado por el usuario experimentalmachines. No se trata de un modelo nuevo ni de un reentrenamiento: es un conjunto de exportaciones en formato ExecuTorch (`.pte`) pensadas para inferencia en dispositivo (on-device), concretamente sobre CPU arm64 mediante el backend XNNPACK. El objetivo es ejecutar un modelo de la familia Llama 3.2 en telefonos Android sin depender de servidores externos.

El repositorio incluye una exportacion por cada ventana de contexto que el runner pudo construir: 2.048, 4.096, 8.192, 16.384 y 32.768 tokens. La ventana queda fijada dentro del fichero y el runtime reserva la cache KV completa en el momento de la carga, por lo que la eleccion del fichero depende de la memoria disponible en el dispositivo. El autor incluye en cada `config.json` un campo `fits_phone_budget` que estima si la variante cabe dentro de un presupuesto de 5 GB.

La relevancia actual del paquete es practica: permite desplegar un LLM de ~0,96 GB en moviles arm64 con ExecuTorch 1.4.0 y la aplicacion openweights, evitando conversiones manuales. El repositorio ocupa 4,8 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Llama 3.2 1B; detalles de capas, cabezas y dimensiones no disponibles en la informacion proporcionada |
| Parametros totales | 1B nominales (modelo base `meta-llama/Llama-3.2-1B`); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens, segun el fichero `.pte` elegido; la ventana es fija por exportacion |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas de 8 bits y pesos de 4 bits en grupos de 32, embeddings int8 por canal; cache KV en fp32 |
| Idiomas soportados | No disponible en la model card |
| Licencia | llama3.2 (Llama 3.2 Community License), misma que el modelo base |
| Formato de pesos | ExecuTorch `.pte` (5 ficheros), mas `tokenizer.json` y `config.json` por backend; no se distribuyen safetensors ni GGUF |

Datos adicionales: libreria `executorch`, pipeline `text-generation`, tamano del repo 4,8 GB, autor experimentalmachines, creado el 13 de septiembre de 2026.

## Arquitectura y entrenamiento

Este repositorio no documenta ningun entrenamiento propio. Se trata de una exportacion del modelo base Llama 3.2 1B, cuyo detalle de arquitectura y dataset no se reproduce en la model card facilitada, por lo que no se puede confirmar aqui el numero de tokens de entrenamiento, la composicion del corpus ni la existencia de fases de RLHF o DPO. Lo unico verificable es que la tokenizacion se copia sin cambios desde el repositorio de origen (`tokenizer.json`) y que los pesos proceden de la revision `4e20de362430`.

La innovacion tecnica del paquete esta en el proceso de exportacion con la herramienta `export_llm` de ExecuTorch 1.4.0: cuantizacion 8da4w (activaciones dinamicas de 8 bits, pesos de 4 bits agrupados de 32 en 32), embeddings int8 por canal, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. Cada variante de contexto se exporta como un programa independiente; el runtime reserva la totalidad de la cache KV al cargar el modelo, con un coste de 65.536 bytes por token en fp32 (128 MB para 2k, 256 MB para 4k, 512 MB para 8k, 1 GB para 16k y 2 GB para 32k). Los pesos ocupan entre 0,96 GB (2k) y 0,98 GB (32k).

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas del modelo base (el listado oficial de idiomas no se detalla en la informacion disponible).
- Ejecucion completamente local en CPU arm64, sin acceso a red ni a servicios en la nube.
- Contexto ampliable hasta 32.768 tokens eligiendo la exportacion adecuada, util para resumenes y conversaciones largas en movil.
- Prefill por chunks de 2.048 tokens, lo que permite procesar prompts largos de forma incremental.
- Cinco variantes de memoria precalculadas, con metadatos de encaje en un presupuesto de 5 GB (`fits_phone_budget`).
- Compatibilidad con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.4.0.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes de texto sin conexion en Android: la variante de 2k (0,96 GB de pesos mas 128 MB de cache KV) cabe en telefonos de gama media y permite responder consultas cortas sin enviar datos a un servidor.
- Resumen de documentos largos en el dispositivo: con la exportacion de 16k o 32k se puede condensar un articulo o un informe completo manteniendo el contexto en local, a costa de 1-2 GB adicionales de RAM para la cache KV.
- Clasificacion y etiquetado de textos en lote: al ser un modelo base pequeno, sirve para tareas de extraccion de entidades o categorizacion simple ejecutadas en segundo plano, sin coste de API.
- Demostraciones y prototipos de IA embebida: el paquete evita el trabajo de exportacion y permite validar rapidamente una idea sobre ExecuTorch antes de invertir en un pipeline propio.
- Aplicaciones con requisitos de privacidad estrictos (salud, legal, industria): todo el procesamiento ocurre en el terminal, lo que simplifica el cumplimiento de normativas de proteccion de datos al no existir transferencia a terceros.
- Investigacion sobre cuantizacion y despliegue movil: los informes `export-report-<window>.json` documentan el proceso completo y permiten reproducir o comparar configuraciones de exportacion.
- Generacion de texto en entornos sin conectividad: dispositivos de campo, maquinaria industrial o zonas rurales donde no hay red pero si un terminal arm64.
- Base para fine-tuning posterior: los pesos de origen siguen siendo los de Llama 3.2 1B, de modo que un ajuste realizado sobre el modelo original puede reexportarse con este mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es una prueba de humo (smoke test) superada con la respuesta "Paris" en las cinco variantes de contexto. No hay datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- Plataforma objetivo: CPU arm64 (Android y otros sistemas con soporte de ExecuTorch 1.4.0); no se exportan backends de GPU ni de NPU.
- Peso del modelo en disco: 0,96 GB para 2k/4k/8k, 0,97 GB para 16k y 0,98 GB para 32k.
- Cache KV en fp32: 65.536 bytes por token, reservados en su totalidad al cargar; 128 MB (2k), 256 MB (4k), 512 MB (8k), 1 GB (16k) y 2 GB (32k).
- Memoria total estimada en ejecucion: aproximadamente 1,1 GB en la variante de 2k y aproximadamente 3 GB en la de 32k, sin contar el overhead del runtime.
- Criterio de seleccion del autor: el campo `fits_phone_budget` de cada `config.json` estima el encaje contra un presupuesto de 5 GB; conviene elegir la ventana mas grande que el dispositivo pueda sostener.
- No cabe en GPU de consumo mediante este paquete, porque el formato `.pte` esta pensado para CPU arm64; para RTX 4090, A100 o H100 habria que usar el modelo base con otro runtime.
- Opciones de despliegue: aplicacion Android openweights o cualquier runtime ExecuTorch 1.4.0 con backend XNNPACK. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que requieren safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-ExecuTorch (este) | 1B nominales | 2k a 32k, fija por fichero | `.pte`, XNNPACK CPU arm64 | llama3.2 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-1B (base) | 1B nominales | No disponible en la informacion proporcionada | safetensors, PyTorch | llama3.2 | Repositorio oficial de Meta |
| Conversiones GGUF de Llama-3.2-1B para llama.cpp | 1B nominales | Depende de la configuracion del runtime | GGUF, llama.cpp | llama3.2 | Repositorios de la comunidad; cifras concretas no disponibles |
| Exportaciones ONNX Runtime Mobile / MLC-LLM del mismo base | 1B nominales | Depende de la exportacion | ONNX / MLC | llama3.2 | Repositorios de la comunidad; cifras concretas no disponibles |

La diferencia principal frente a las alternativas no esta en la calidad del modelo, identica al compartir pesos base, sino en el empaquetado: este repositorio llega listo para ExecuTorch y Android, mientras que las conversiones GGUF u ONNX exigen otros runtimes y otros flujos de integracion.

## Limitaciones y advertencias

- Se trata de un modelo base, no ajustado por instrucciones; no cabe esperar un comportamiento fiable de asistente conversacional sin tecnicas de prompting o un fine-tuning previo.
- Riesgo de alucinacion inherente a un modelo de 1B de parametros, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- La ventana de contexto esta congelada en el fichero: no se puede ampliar en tiempo de ejecucion ni compartir cache KV entre ventanas distintas.
- La cache KV se asigna completa al cargar el modelo, por lo que una eleccion de ventana demasiado ambiciosa provoca fallos de memoria en dispositivos modestos.
- Solo se exporta el backend XNNPACK para CPU arm64; no hay aceleracion por GPU ni NPU en este repositorio.
- La cuantizacion 8da4w (pesos de 4 bits) introduce perdida de precision respecto al modelo en coma flotante; el autor no publica mediciones de esa degradacion.
- No se documentan idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- Uso comercial sujeto a la Llama 3.2 Community License y a la politica de uso aceptable de Meta; los ficheros `LICENSE.txt`, `USE_POLICY.md` y `NOTICE` se incluyen sin modificar y deben conservarse.
- El repositorio no tiene descargas ni likes registrados, por lo que no existe validacion de la comunidad mas alla de las pruebas de humo del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Llama-3.2-1B-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Ejecucion de exportacion referenciada: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753843577
- ExecuTorch (documentacion de la libreria indicada en la model card): no se incluye URL explicita en la informacion proporcionada
- Ficheros de licencia y aviso incluidos en el repositorio: `LICENSE.txt`, `USE_POLICY.md`, `NOTICE`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron exclusivamente paginas de soporte de Windows, sin relacion con el modelo.
