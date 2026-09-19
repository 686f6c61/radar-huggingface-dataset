# experimentalmachines/LFM2.5-2.6B-heretic-ExecuTorch

## Resumen

LFM2.5-2.6B-heretic-ExecuTorch es una exportación a formato ExecuTorch del modelo experimentalmachines/LFM2.5-2.6B-heretic (revision `c513fc1129cb`), publicada por el propio autor experimentalmachines. No se trata de un modelo entrenado desde cero, sino de una conversión cuantizada y empaquetada para inferencia en dispositivo (on-device) sobre CPU arm64, pensada para ejecutarse con la aplicación Android openweights o con cualquier runtime de ExecuTorch 1.4.0. Su relevancia radica en que traslada un LLM de aproximadamente 2,6 mil millones de parámetros a un formato que cabe y funciona en un teléfono móvil sin GPU dedicada.

El repositorio incluye cinco exportaciones del backend XNNPACK (CPU), idénticas en cuantización pero con distintas ventanas de contexto fijas: 2.048, 4.096, 8.192, 16.384 y 32.768 tokens. Cada archivo pesa entre 1,78 GB y 1,81 GB y la ventana se fija en tiempo de exportación, de modo que el runtime reserva la caché KV completa al cargar el modelo. Esto obliga a elegir el fichero en función de la memoria disponible del dispositivo, no de la necesidad puntual de contexto.

El modelo no ha recibido ninguna descarga ni "like" en el momento de la consulta y no publica resultados de benchmarks, idiomas soportados ni detalles del entrenamiento original. La licencia es lfm1.0, heredada del modelo base, y el contenido específico del ajuste "heretic" (presumiblemente una variante con restricciones de alineamiento relajadas) no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada de LFM2.5-2.6B y exportada con ExecuTorch 1.4.0 (`export_llm`) |
| Parametros totales | 2,6 mil millones (deducido de la denominacion del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | Ventanas fijas exportadas de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens |
| Tipos de cuantizacion | 8 bits de activaciones dinamicas, pesos de 4 bits en grupos de 32, embeddings int8 por canal (esquema 8da4w con GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (identificador `other`; enlace a la licencia del modelo base en LiquidAI) |
| Formato de pesos | `.pte` (ExecuTorch) por cada ventana; `tokenizer.json` copiado sin cambios del repositorio origen |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base LFM2.5-2.6B en la documentacion facilitada. Lo unico verificable es el procedimiento de exportacion: se uso ExecuTorch 1.4.0 con la herramienta `export_llm`, cuantizacion 8da4w (activaciones dinamicas de 8 bits, pesos de 4 bits agrupados de 32 en 32) con GPTQ, embeddings int8 por canal, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. El proceso se ejecuto en la accion de GitHub run 1 del repositorio executorch-model-exporter.

La innovacion tecnica relevante no esta en el entrenamiento sino en el empaquetado: la exportacion permite ejecutar el modelo en cualquier dispositivo arm64 mediante CPU pura, con la ventana de contexto fijada en el propio fichero `.pte`. El precio de este diseno es que la cache KV se reserva entera al cargar, con un coste de 32.768 bytes por token en fp32 (1.073.741.824 bytes para la ventana de 32.768 tokens). No se documenta si el modelo base recibio RLHF, DPO u otro tipo de ajuste, ni la composicion del dataset original.

## Capacidades

- Generacion de texto: es la tarea declarada en el pipeline (`text-generation`) del repositorio.
- Inferencia en dispositivo: ejecucion en CPU arm64 mediante XNNPACK, sin necesidad de GPU ni de conexion a servicios remotos.
- Gestion de contexto largo: las exportaciones cubren desde 2.048 hasta 32.768 tokens, con una variante por cada tamano de ventana.
- Integracion con Android: compatible con la aplicacion openweights y con cualquier runtime de ExecuTorch 1.4.0.
- Prueba de humo superada: los cinco ficheros `.pte` respondieron correctamente ("Paris") en la prueba de validacion basica de generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de texto offline en Android: la variante de 2.048 tokens (1,78 GB) cabe en telefonos de gama media-alta y permite generacion de texto sin conexion, con una cache KV de solo 67 MB.
- Procesamiento de documentos largos en movilidad: la exportacion de 32.768 tokens permite resumir o extraer informacion de documentos extensos directamente en el dispositivo, a cambio de reservar 1,07 GB de cache KV.
- Aplicaciones de privacidad estricta: al no requerir envio de datos a un servidor, encaja en escenarios donde el texto del usuario no puede salir del dispositivo (notas medicas, mensajes personales, borradores legales).
- Prototipado de LLM embebido: los ficheros `.pte` junto con `config.json` y `export-report-<window>.json` permiten reproducir y auditar el pipeline de exportacion para otros modelos.
- Bots de texto en entornos sin GPU: cualquier dispositivo arm64 (Raspberry Pi, mini-PC ARM, telefonos) puede ejecutar el modelo usando solo CPU mediante XNNPACK.
- Filtrado y clasificacion de texto en el borde: dado su tamano reducido, sirve para tareas de etiquetado, moderacion o enrutado de peticiones antes de escalar a un modelo mayor en servidor.
- Investigacion sobre cuantizacion y despliegue: al publicar el informe completo de exportacion por ventana, es util para estudiar el compromiso entre tamano de contexto, memoria reservada y pesos cuantizados 8da4w.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento reportado es la prueba de humo ("smoke test") superada por las cinco exportaciones, que se limito a verificar que el modelo responde "Paris" a una peticion basica. No hay cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput (tokens por segundo) en ningun dispositivo.

## Requisitos de hardware

- Naturaleza del destino: inferencia en CPU arm64 mediante XNNPACK. El concepto de VRAM no aplica directamente; el consumo relevante es la memoria RAM del dispositivo.
- Peso en disco/RAM de los pesos: entre 1,78 GB (2k) y 1,81 GB (32k) por fichero `.pte`.
- Cache KV en fp32: 32.768 bytes por token, reservados por completo al cargar el modelo. Total por ventana: 67 MB (2k), 134 MB (4k), 268 MB (8k), 537 MB (16k) y 1.074 MB (32k).
- Presupuesto de referencia del autor: cada carpeta incluye un campo `fits_phone_budget` en su `config.json` calculado contra un presupuesto de 5 GB.
- GPU recomendadas: no aplica; el backend exportado es exclusivamente CPU (XNNPACK). No hay variantes para CUDA, Metal u otros aceleradores en este repositorio.
- Compatibilidad con GPU de consumo: no disponible para esta exportacion concreta (no se han exportado backends GPU).
- Opciones de despliegue: aplicacion Android openweights, o cualquier runtime de ExecuTorch 1.4.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen el formato `.pte`.
- Latencia y throughput: no disponibles. Dependeran del SoC arm64 concreto y de la ventana elegida.
- Nota practica: como la ventana queda fijada en el archivo, conviene seleccionar la mayor que quepa en el presupuesto de memoria del dispositivo, ya que no se puede ampliar en tiempo de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-heretic-ExecuTorch | 2,6 B (segun denominacion) | 2k a 32k (fijo por fichero) | `.pte` (ExecuTorch, XNNPACK CPU) | lfm1.0 | Publicado en HuggingFace; 0 descargas |
| experimentalmachines/LFM2.5-2.6B-heretic (modelo base) | 2,6 B (segun denominacion) | No disponible | No disponible (pesos originales) | lfm1.0 | Publicado en HuggingFace |
| LiquidAI/LFM2.5-2.6B (origen de la licencia) | 2,6 B | No disponible | No disponible | lfm1.0 | Referenciado en el enlace de licencia |
| Otros modelos on-device comparables | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta exportacion con alternativas de tamano similar, ni de fichas de modelos equivalentes aportadas en la busqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El sufijo "heretic" sugiere una modificacion del comportamiento del modelo base, pero su naturaleza exacta no esta documentada; conviene auditar las respuestas antes de cualquier uso en produccion.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasas de error.
- Contexto limitado a 32.768 tokens como maximo, y fijado en el fichero: no se puede superar la ventana elegida ni ampliarla dinamicamente.
- Memoria reservada de golpe: la cache KV se asigna completa al cargar el modelo, por lo que una ventana grande en un dispositivo con poca RAM puede provocar fallos de asignacion.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- Ausencia de benchmarks: no hay evidencia publica de calidad en razonamiento, codigo o matematicas.
- Restricciones de licencia: se distribuye bajo lfm1.0, la misma licencia del modelo base. Es una licencia `other` con condiciones propias; debe revisarse el texto enlazado antes de cualquier uso comercial, ya que puede incluir limitaciones de explotacion.
- Naturaleza derivada y cuantizada: al ser una conversion 8da4w, es esperable una degradacion de calidad respecto al modelo base en tareas sensibles a la precision, aunque no se aporta medicion alguna.
- Madurez del artefacto: 0 descargas y 0 "likes", con fecha de publicacion reciente; no hay validacion independiente por parte de terceros.
- El backend es exclusivamente CPU arm64: no hay soporte para CUDA, Metal ni aceleradores NPU en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-heretic-ExecuTorch
- Modelo base: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-heretic
- Licencia lfm1.0 (referencia del modelo base de LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Registro de la exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/35391422205
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
