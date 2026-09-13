# experimentalmachines/Llama-3.2-1B-Instruct-ExecuTorch

## Resumen

Llama-3.2-1B-Instruct-ExecuTorch es un export del modelo meta-llama/Llama-3.2-1B-Instruct (revision `9213176726f5`) preparado por el usuario experimentalmachines para inferencia en dispositivo con el runtime ExecuTorch 1.4.0. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de despliegue que empaqueta los pesos del modelo base de Meta en formato `.pte`, cuantizados y compilados para ejecutarse en CPU arm64 mediante el backend XNNPACK, sin necesidad de GPU ni de conectividad de red.

El problema que resuelve es el de llevar un modelo de lenguaje instruccional de ~1.000 millones de parametros a telefonos y dispositivos embebidos Android. Para ello ofrece cinco variantes por ventana de contexto (2.048, 4.096, 8.192, 16.384 y 32.768 tokens), cada una en un fichero independiente de entre 0,96 GB y 0,98 GB, con la ventana fija grabada dentro del fichero y la cache KV reservada por completo en el momento de la carga. El autor incluye un campo `fits_phone_budget` en el `config.json` de cada carpeta como estimacion frente a un presupuesto de 5 GB.

Su relevancia es practica: permite prototipar asistentes de texto totalmente offline en Android con una integracion directa con la aplicacion openweights, o con cualquier runtime ExecuTorch 1.4.0. El repositorio no tiene descargas ni likes registrados y no publica resultados de benchmarks, por lo que debe evaluarse como un artefacto de infraestructura mas que como un modelo con rendimiento validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama-3.2-1B-Instruct), exportada a formato ExecuTorch `.pte` |
| Parametros totales | 1B segun la denominacion del modelo base; el recuento exacto no figura en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens, segun el fichero elegido; la ventana queda fija dentro del `.pte` |
| Tipos de cuantizacion | 8da4w: activaciones int8 dinamicas y pesos de 4 bits en grupos de 32, embeddings int8 per-channel; cache KV en fp32 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | llama3.2 (derivado cuantizado del modelo base, distribuido bajo los mismos terminos) |
| Formato de pesos | `.pte` (ExecuTorch 1.4.0); no se distribuyen safetensors ni GGUF |
| Tokenizer | `tokenizer.json`, copiado sin cambios del repositorio de origen |
| Backend | XNNPACK (CPU) para cualquier arm64, con operaciones extendidas |
| Tamano del repositorio | 4,8 GB |
| Version de ExecuTorch | 1.4.0 (`export_llm`) |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio. Se limita a la exportacion del modelo base meta-llama/Llama-3.2-1B-Instruct, un transformer decoder-only de la familia Llama 3.2, mediante la herramienta `export_llm` de ExecuTorch 1.4.0. La conversion aplica cuantizacion de 8 bits en activaciones de forma dinamica, pesos de 4 bits agrupados en bloques de 32 elementos y embeddings int8 per-channel, con un tamano de chunk de prefill de 2.048 tokens y cache KV en fp32. El objetivo declarado es el backend XNNPACK con operaciones extendidas para cualquier CPU arm64.

La innovacion tecnica relevante no esta en el modelo, sino en el empaquetado: se generan exportaciones independientes para cada ventana de contexto que el runner pudo construir, de 2k a 32k, con la ventana incrustada en el fichero. Esto implica que el runtime reserva la totalidad de la cache KV al cargar el modelo, con un coste de 65.536 bytes por token en fp32: 134.217.728 bytes para 2.048 tokens, 268.435.456 para 4.096, 536.870.912 para 8.192, 1.073.741.824 para 16.384 y 2.147.483.648 para 32.768. Cada carpeta de backend incluye un `config.json` con todas las variantes y sus metadatos, y un `export-report-<window>.json` por fichero con el registro completo de la exportacion. El proceso se ejecuto en la accion de GitHub referenciada en la model card (run 1 del repositorio executorch-model-exporter). No se documentan datos de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, ya que corresponden al modelo base y no a este export.

## Capacidades

- Generacion de texto instruccional en ingles, con el comportamiento del modelo Llama-3.2-1B-Instruct original.
- Inferencia totalmente local y offline sobre CPU arm64, sin acceso a GPU ni a servicios en la nube.
- Cinco configuraciones de ventana de contexto seleccionables en tiempo de carga (2k, 4k, 8k, 16k y 32k tokens).
- Integracion directa con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.4.0.
- Prueba de humo superada en las cinco variantes: los ficheros responden correctamente a una consulta basica devolviendo "Paris".
- Compatibilidad con cuantizacion mixta 8da4w para reducir el peso del modelo a menos de 1 GB por fichero.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada para este export.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada para este export.
- Capacidades multilingues: no disponibles en la informacion proporcionada; solo se confirma el comportamiento del modelo base.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de texto offline en Android: la aplicacion openweights carga el `.pte` de 2k o 4k directamente en el telefono, de modo que el usuario dispone de generacion de texto sin enviar datos a ningun servidor ni requerir conexion.
- Aplicaciones de notas y dictado con privacidad estricta: el modelo puede resumir o reformular notas personales en el propio dispositivo, sin que el contenido salga del terminal, algo critico en entornos sanitarios, juridicos o corporativos con requisitos de residencia de datos.
- Resumen de documentos largos en movilidad: la variante de 32.768 tokens permite procesar actas, informes o hilos de correo extensos en un solo paso, a cambio de reservar 2 GB de cache KV al cargar el modelo.
- Sustitucion de APIs de pago en prototipos: equipos que desarrollan funciones de generacion de texto pueden validar la experiencia de usuario con coste marginal cero antes de migrar a un servicio en la nube.
- Kioscos y terminales industriales con SoC arm64: el backend XNNPACK funciona en cualquier arm64, de modo que el modelo puede incrustarse en paneles interactivos, maquinas de punto de venta o dispositivos de campo con conectividad intermitente.
- Procesamiento por lotes en el borde (edge): en un dispositivo con presupuesto de memoria de 5 GB es viable mantener cargada la ventana de 2k (0,96 GB de pesos mas 128 MB de KV) y procesar entradas cortas de forma continua, por ejemplo clasificacion de incidencias o normalizacion de texto.
- Educacion y accesibilidad: limpieza de transcripciones, generacion de preguntas de practica o simplificacion de textos sin conexion, util en aulas o entornos con red restringida.
- Evaluacion de la propia cadena de exportacion: el repositorio incluye informes de exportacion por ventana, lo que sirve como referencia reproducible para equipos que quieran construir sus propios artefactos ExecuTorch con `export_llm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de funcionamiento es la prueba de humo declarada en la model card, superada en las cinco variantes con una respuesta correcta ("Paris") a una consulta basica. No se proporcionan cifras de MMLU, HumanEval, GSM8K, latencia, tokens por segundo ni consumo energetico.

| Prueba | Resultado | Notas |
|---|---|---|
| Smoke test 2k, 4k, 8k, 16k, 32k | Superado | Respuesta "Paris" en las cinco variantes |
| Benchmarks academicos | No disponible | No publicados en la informacion proporcionada |
| Throughput y latencia | No disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU arm64 mediante XNNPACK, sin GPU.
- Pesos en disco y en memoria: 0,96 GB para las ventanas de 2k a 8k, 0,97 GB para 16k y 0,98 GB para 32k.
- Cache KV en fp32, reservada por completo al cargar: 134 MB (2k), 268 MB (4k), 537 MB (8k), 1,07 GB (16k) y 2,15 GB (32k).
- Presupuesto total de memoria: el `config.json` de cada carpeta incluye `fits_phone_budget`, estimado contra un presupuesto de 5 GB; consultar ese campo antes de elegir la variante.
- GPU: ninguna compatible. No se contemplan A100, H100 ni RTX 4090, ya que el formato `.pte` esta pensado para CPU arm64.
- Dispositivos objetivo: telefonos y dispositivos Android arm64, asi como cualquier plataforma con un runtime ExecuTorch 1.4.0.
- Opciones de despliegue: aplicacion openweights para Android (recomendada por el autor) o cualquier runtime ExecuTorch 1.4.0. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan safetensors o GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del SoC, del ancho de banda de memoria y de la ventana elegida, factores que el autor no documenta.

## Comparativa con modelos similares

No se dispone de informacion en la busqueda web sobre exportaciones comparables del mismo modelo base para otros runtimes, por lo que la comparativa se limita al modelo de origen y a referencia de formato.

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-ExecuTorch (este) | 1B | 2.048 a 32.768 tokens, fijo por fichero | `.pte` (ExecuTorch 1.4.0) | llama3.2 | Inferencia en CPU arm64 y Android |
| meta-llama/Llama-3.2-1B-Instruct | 1B | No disponible en la informacion proporcionada | safetensors | llama3.2 | Entrenamiento, ajuste e inferencia en GPU |
| Alternativas en formato GGUF o exportaciones equivalentes | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo base tiene 1B de parametros: la calidad de razonamiento, la coherencia en cadenas largas y la precision factual son inherentemente inferiores a las de modelos de mayor tamano.
- Riesgo de alucinacion: al ser un modelo instruccional pequeno, tiende a inventar datos cuando no dispone de contexto suficiente; no debe usarse como fuente de verdad sin verificacion externa.
- La ventana de contexto esta fijada dentro del fichero `.pte`. No es posible cambiarla en tiempo de ejecucion: hay que cargar otra variante, lo que implica reiniciar el modelo y volver a reservar la cache.
- La cache KV se asigna completa en la carga, en fp32. La variante de 32k exige 2,15 GB solo para la cache, ademas de los 0,98 GB de pesos, lo que puede provocar fallos de asignacion en dispositivos de gama media.
- La cuantizacion 8da4w (activaciones int8 dinamicas y pesos de 4 bits en grupos de 32) puede degradar la calidad respecto al modelo original en fp16 o bf16. No se han publicado mediciones de esa perdida.
- No se documentan los idiomas soportados por este export. El modelo base de Meta declara capacidad multilingue, pero esta ficha no dispone del listado ni de evaluaciones por idioma.
- No hay soporte documentado de tool calling, function calling ni flujos de agente multi-paso en este export.
- Sesgos conocidos: no se documentan evaluaciones de sesgo, toxicidad o seguridad especificas para este artefacto; hereda los del modelo base sin que el autor aporte analisis.
- Licencia llama3.2: es una licencia con condiciones, no de dominio publico. Su uso comercial esta sujeto a los terminos de Meta y a la politica de uso aceptable (`USE_POLICY.md`). En repositorios con mas de 700 millones de usuarios mensuales se requiere una licencia aparte.
- El repositorio incluye `NOTICE` con la atribucion exigida por la licencia; es obligatorio conservarla en cualquier redistribucion.
- Los ficheros estan vinculados a ExecuTorch 1.4.0; versiones distintas del runtime pueden no ser compatibles.
- Advertencia de madurez: el repositorio registra 0 descargas y 0 likes, y no hay benchmarks ni validacion independiente. Conviene tratarlo como artefacto experimental.
- Se han detectado discrepancias en la busqueda web: los resultados devueltos para este modelo correspondian a contenidos no relacionados (Stripe, conectores LED, documentacion de Domo), por lo que no aportan informacion verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Llama-3.2-1B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Arbol de ficheros del modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/tree/main
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Ejecucion de exportacion (GitHub Actions, run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753844928
- Licencia: `LICENSE.txt` (en el repositorio del modelo)
- Politica de uso: `USE_POLICY.md` (en el repositorio del modelo)
- Atribucion requerida: `NOTICE` (en el repositorio del modelo)
