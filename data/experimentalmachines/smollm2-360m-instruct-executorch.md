# experimentalmachines/SmolLM2-360M-Instruct-ExecuTorch

## Resumen

SmolLM2-360M-Instruct-ExecuTorch es una exportación del modelo instructivo SmolLM2-360M-Instruct de HuggingFaceTB, preparada por el usuario experimentalmachines para ejecución local en dispositivos Android mediante el runtime ExecuTorch. No se trata de un modelo nuevo ni de un reentrenamiento: es un derivado cuantizado (relación declarada `quantized`) del modelo base, en la revisión `a10cc1512eab`, distribuido bajo la misma licencia Apache 2.0.

El problema que resuelve es la inferencia de un modelo de lenguaje de aproximadamente 360 millones de parámetros en el propio teléfono, sin conexión a red y sin backend de servidor. Para ello se publican ficheros `.pte` con el grafo y los pesos ya cuantizados en esquema 8da4w (activaciones dinámicas de 8 bits y pesos de 4 bits en grupos de 32), con el backend XNNPACK sobre CPU arm64. Cada fichero lleva fijada la ventana de contexto en su interior: al cargar, el runtime reserva la caché KV completa, de modo que hay que elegir la ventana más grande que el dispositivo pueda mantener en memoria.

La relevancia actual está en el despliegue en el borde: el paquete va acompañado de la aplicación Android openweights y de informes de exportación reproducibles generados desde el repositorio executorch-model-exporter. El repositorio ocupa 1,0 GB e incluye variantes para ventanas de 2.048, 4.096, 8.192 y 16.384 tokens (la model card indica que se exportaron ventanas desde 2k hasta 32k, aunque en la tabla publicada solo aparecen hasta 16k).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; corresponde al modelo base HuggingFaceTB/SmolLM2-360M-Instruct |
| Parametros totales | Aproximadamente 360 millones (inferido del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana fija embebida en cada fichero: 2.048, 4.096, 8.192 y 16.384 tokens son las variantes publicadas; la model card afirma exportaciones de 2k a 32k |
| Tipos de cuantizacion | 8da4w: activaciones dinámicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 per-channel, caché KV en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), más `tokenizer.json` copiado sin cambios del repositorio de origen |
| Runtime y backend | ExecuTorch 1.4.0, backend XNNPACK (CPU), con operadores extendidos y prefill chunk de 2.048 |
| Plataformas objetivo | Android arm64 (aplicación openweights o cualquier runtime ExecuTorch 1.4.0) |
| Tamano de los ficheros de pesos | 0,25 GB (2k y 4k), 0,26 GB (8k y 16k) |
| Tamano total del repositorio | 1,0 GB |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct, revisión `a10cc1512eab` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni proceso de entrenamiento propios: es una exportación. El flujo declarado es `export_llm` de ExecuTorch 1.4.0 sobre el modelo base, con cuantización de pesos a 4 bits en grupos de 32, activaciones dinámicas de 8 bits, embeddings int8 per-channel y caché KV en fp32, empleando XNNPACK con operadores extendidos y un tamaño de chunk de prefill de 2.048 tokens. El artefacto se generó de forma automatizada en la ejecución 34753839416 del repositorio GitHub executorch-model-exporter.

Cada backend se exportó para cada ventana de contexto que el runner podía construir, y la ventana queda fijada dentro del fichero `.pte`. Esto implica una decisión de diseño relevante: el runtime no puede ampliar el contexto en caliente, porque reserva la caché KV entera durante la carga. El coste por token de esa caché es de 81.920 bytes en fp32, lo que da 167.772.160 bytes para 2.048 tokens, 335.544.320 para 4.096, 671.088.640 para 8.192 y 1.342.177.280 para 16.384. No se documentan en esta ficha datos de composición del dataset, número de tokens de entrenamiento ni etapas de RLHF o DPO, que corresponderían al modelo base y no a esta exportación.

## Capacidades

- Generación de texto en modo instructivo, heredada del ajuste de instrucciones del modelo base SmolLM2-360M-Instruct.
- Inferencia completamente local y sin conexión, sobre CPU arm64 mediante XNNPACK.
- Validación funcional declarada: prueba de humo superada con la respuesta "Paris" en las cuatro ventanas publicadas (2k, 4k, 8k y 16k).
- Selección de ventana de contexto en tiempo de despliegue, escogiendo el fichero `.pte` con la ventana adecuada al presupuesto de memoria del dispositivo (`fits_phone_budget` se calcula contra un presupuesto de 5 GB).
- Tokenizador idéntico al del modelo de origen, copiado sin modificaciones, lo que mantiene la compatibilidad de vocabulario.
- Metadatos de exportación reproducibles: cada carpeta de backend incluye un `config.json` con todas las variantes y un `export-report-<ventana>.json` por fichero.
- Soporte de tool calling o function calling: no documentado en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso, visión, audio o modo de razonamiento explícito: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de escritura sin conexión en Android: integrado en una aplicación mediante ExecuTorch 1.4.0, el modelo puede redactar y reescribir textos breves en el propio dispositivo, sin enviar datos a servidores externos y con ventanas de 2k o 4k suficientes para correos o notas.
- Clasificación de intenciones y enrutado en aplicaciones móviles: dado su tamaño reducido y su caché KV de solo 0,16 GB a 2.048 tokens, es viable mantenerlo residente en memoria para tareas cortas de etiquetado o extracción de campos.
- Resumen de textos cortos en el borde: con la variante de 16.384 tokens (1,25 GiB de caché KV en fp32) puede procesar documentos de varias páginas sin salir del teléfono, útil en contextos con requisitos de privacidad.
- Demostraciones y prototipos de despliegue ExecuTorch: sirve como artefacto de referencia para validar pipelines de exportación, cuantización 8da4w y ejecución XNNPACK antes de escalar a modelos mayores.
- Pruebas de regresión de runtimes móviles: la prueba de humo documentada ("Paris") y los informes de exportación permiten comprobar que una versión concreta del runtime o del backend reproduce el comportamiento esperado.
- Aplicaciones de campo sin conectividad: escenarios de inventario, formularios o asistentes técnicos en zonas sin cobertura, donde la alternativa en la nube no está disponible y el modelo puede operar íntegramente en local.
- Completado ligero en teclados o interfaces de entrada: con la variante de 2.048 tokens y 0,25 GB de pesos, el presupuesto de memoria es compatible con aplicaciones móviles que ya consumen buena parte de la RAM del dispositivo.
- Investigación sobre compromisos entre ventana de contexto y memoria: el repositorio ofrece cuatro puntos de medida del mismo modelo con caché KV creciente, lo que facilita estudiar el coste real de ampliar contexto en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es la prueba de humo superada en las cuatro variantes publicadas, con la respuesta "Paris", sin métricas de precisión, latencia ni throughput asociadas.

## Requisitos de hardware

- Plataforma soportada: cualquier dispositivo arm64 con runtime ExecuTorch 1.4.0; no se publican backends para GPU, NPU ni aceleradores específicos, solo XNNPACK sobre CPU.
- VRAM: no aplica, al ser inferencia en CPU móvil.
- Memoria total estimada en carga (pesos más caché KV en fp32, cálculo propio a partir de los datos de la model card):

| Ventana | Fichero | Pesos | Cache KV (fp32) | Total estimado |
|---|---|---|---|---|
| 2.048 tokens | `xnnpack/SmolLM2-360M-Instruct-8da4w-2k.pte` | 0,25 GB | 167.772.160 B (aproximadamente 0,16 GiB) | Aproximadamente 0,41 GB |
| 4.096 tokens | `xnnpack/SmolLM2-360M-Instruct-8da4w-4k.pte` | 0,25 GB | 335.544.320 B (aproximadamente 0,31 GiB) | Aproximadamente 0,56 GB |
| 8.192 tokens | `xnnpack/SmolLM2-360M-Instruct-8da4w-8k.pte` | 0,26 GB | 671.088.640 B (aproximadamente 0,63 GiB) | Aproximadamente 0,89 GB |
| 16.384 tokens | `xnnpack/SmolLM2-360M-Instruct-8da4w-16k.pte` | 0,26 GB | 1.342.177.280 B (aproximadamente 1,25 GiB) | Aproximadamente 1,51 GB |

- Coste por token de caché KV: 81.920 bytes en fp32, reservados en su totalidad al cargar el modelo.
- Presupuesto de referencia: el campo `fits_phone_budget` de cada `config.json` estima la viabilidad contra un presupuesto de 5 GB del dispositivo.
- GPU de escritorio: no aplica; los ficheros `.pte` con backend XNNPACK están pensados para CPU arm64 y no se documenta su uso en A100, H100 o RTX 4090.
- Opciones de despliegue: aplicación Android openweights o cualquier runtime ExecuTorch 1.4.0. No hay artefactos GGUF, safetensors ni compatibilidad declarada con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| experimentalmachines/SmolLM2-360M-Instruct-ExecuTorch | Aproximadamente 360 M | 2.048, 4.096, 8.192 y 16.384 tokens por fichero | `.pte`, ExecuTorch 1.4.0 + XNNPACK (CPU arm64) | Apache 2.0 | Repositorio de 1,0 GB; 0 descargas y 0 likes en el momento de la consulta |
| HuggingFaceTB/SmolLM2-360M-Instruct | Aproximadamente 360 M (no confirmado en la información disponible) | No disponible en la información proporcionada | Pesos originales del modelo base (formato no especificado en esta información) | Apache 2.0 | Modelo de origen en HuggingFace, revisión `a10cc1512eab` |
| Otras alternativas on-device de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de rendimiento, contexto o consumo para modelos alternativos de la misma categoría en la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero, sino una exportación cuantizada del modelo base; cualquier limitación de conocimiento, sesgo o alucinación del original se hereda y puede agravarse por la cuantización a 4 bits en pesos.
- El tamaño de 360 millones de parámetros implica una capacidad de razonamiento y de conocimiento factual limitada, con riesgo elevado de respuestas plausibles pero incorrectas en tareas abiertas.
- La ventana de contexto está fijada en el fichero: no se puede ampliar en tiempo de ejecución, y al cargar se reserva la caché KV completa, lo que puede provocar fallos de memoria en dispositivos con poca RAM.
- La model card afirma exportaciones de 2k a 32k, pero la tabla publicada solo incluye hasta 16.384 tokens; no se documenta la disponibilidad de las variantes intermedias o superiores.
- Solo se publica backend XNNPACK para CPU arm64; no hay rutas de aceleración por GPU o NPU, lo que limita el rendimiento en dispositivos que sí disponen de esos aceleradores.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye datos de evaluación más allá de una prueba de humo de una sola pregunta.
- No se documentan capacidades de tool calling, uso como agente ni comportamiento multilingüe, por lo que no deberían asumirse en producción.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un derivado cuantizado del modelo base, se mantienen las condiciones y atribuciones del proyecto original.
- No hay datos de latencia, throughput ni consumo energético, parámetros críticos para decidir el despliegue en un dispositivo móvil concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/SmolLM2-360M-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Aplicación openweights para Android: https://github.com/alpharomercoma/openweights
- Ejecución de exportación en GitHub Actions: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753839416
- Rutas de los ficheros dentro del repositorio: `xnnpack/SmolLM2-360M-Instruct-8da4w-2k.pte`, `xnnpack/SmolLM2-360M-Instruct-8da4w-4k.pte`, `xnnpack/SmolLM2-360M-Instruct-8da4w-8k.pte`, `xnnpack/SmolLM2-360M-Instruct-8da4w-16k.pte`, además de `tokenizer.json` y los `config.json` y `export-report-<ventana>.json` de cada carpeta.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a páginas de ayuda de YouTube TV y YouTube, sin relación con el artefacto.
