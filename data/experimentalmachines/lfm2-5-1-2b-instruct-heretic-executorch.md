# experimentalmachines/LFM2.5-1.2B-Instruct-heretic-ExecuTorch

## Resumen

LFM2.5-1.2B-Instruct-heretic-ExecuTorch es una exportación a ExecuTorch del modelo experimentalmachines/LFM2.5-1.2B-Instruct-heretic (revision `435177079cc7`), preparada por el propio usuario experimentalmachines para ejecutar inferencia de texto directamente en dispositivos Android arm64. No se trata de un modelo entrenado desde cero ni de un ajuste fino nuevo: es una conversión del checkpoint base a un formato binario `.pte` que puede cargarse con el runtime de ExecuTorch 1.4.0, incluyendo la aplicación Android openweights que el autor referencia en la model card.

El peso de la ficha está en el empaquetado, no en el entrenamiento. El repositorio contiene variantes del mismo modelo cuantizado a 8 bits en activaciones dinámicas y 4 bits en pesos (grupos de 32), con embeddings int8 por canal, exportadas con el backend XNNPACK para CPU y con ventanas de contexto fijas de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens. Cada fichero pesa entre 0,80 GB y 0,83 GB, un rango que lo sitúa dentro de lo manejable para un teléfono de gama alta actual.

Su relevancia es práctica: cubre el nicho de LLM de ~1.200 millones de parámetros que corren en local sin GPU, sin conexión y sin enviar datos a un servidor. Al ser una conversión de un derivado del modelo de Liquid AI (la licencia remite a LiquidAI/LFM2.5-1.2B-Instruct y se distribuye bajo los términos lfm1.0), hereda tanto las capacidades del modelo original como sus restricciones de licencia. El estado del repositorio es muy reciente y con nula adopción pública: cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivado de LFM2.5, el modelo base no incluye ficha de arquitectura en estos datos) |
| Parametros totales | 1,2 mil millones (segun la nomenclatura del modelo base, LFM2.5-1.2B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | ventanas fijas por fichero: 2.048, 4.096, 8.192, 16.384 y 32.768 tokens |
| Tipos de cuantizacion | 8 bits en activaciones dinamicas, 4 bits en pesos en grupos de 32, embeddings int8 por canal (exportacion denominada 8da4w-gptq) |
| Idiomas soportados | no disponible |
| Licencia | other / lfm1.0 (link a la licencia de LiquidAI/LFM2.5-1.2B-Instruct); derivado cuantizado distribuido bajo los mismos terminos |
| Formato de pesos | .pte (ExecuTorch), con tokenizer.json; backend XNNPACK (CPU) |
| Tamano del repositorio | 4,0 GB |
| Tamano por fichero | 0,80 GB (2k, 4k, 8k), 0,81 GB (16k), 0,83 GB (32k) |
| Libreria / runtime | executorch 1.4.0 |
| Plataforma objetivo | Android / arm64, inferencia en CPU (XNNPACK) |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del transformer subyacente: la model card se limita al proceso de exportacion. Lo que si se detalla con precision es el pipeline de conversion. Los ficheros se generaron con la herramienta `export_llm` de ExecuTorch 1.4.0, empleando 8 bits para activaciones dinamicas y 4 bits para pesos agrupados de 32 en 32, embeddings int8 por canal y el backend XNNPACK con operadores extendidos. El prefill se trocea en bloques de 2.048 tokens y la caché KV se mantiene en fp32.

Cada fichero `.pte` incorpora una ventana de contexto fija e inmutable: el runtime reserva la caché KV completa en el momento de cargar el modelo, no de forma incremental. La caché consume 24.576 bytes por token en fp32, lo que equivale a 50.331.648 bytes (unos 48 MB) para 2.048 tokens, 100.663.296 bytes para 4.096, 201.326.592 bytes para 8.192, 402.653.184 bytes para 16.384 y 805.306.368 bytes (unos 768 MB) para 32.768. Por eso el propio autor indica que hay que escoger la ventana mas grande que aguante el dispositivo, usando el campo `fits_phone_budget` de cada `config.json`, calculado contra un presupuesto de 5 GB. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional e instrucciones: el pipeline declarado es `text-generation` y el modelo base es una variante `Instruct`.
- Inferencia completamente local en dispositivos arm64, sin GPU dedicada y sin conexion a red.
- Ejecucion con el runtime de ExecuTorch 1.4.0 o con la aplicacion Android openweights referenciada por el autor.
- Seleccion de ventana de contexto segun el hardware: cinco variantes fijas entre 2.048 y 32.768 tokens para ajustar el consumo de memoria.
- Tokenizacion compatible con el modelo original: el `tokenizer.json` se copia sin modificaciones del repositorio fuente.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Asistentes conversacionales offline en Android: una app puede cargar la variante de 4k (0,80 GB de fichero mas unos 100 MB de caché KV) y ofrecer chat de texto sin conexion, util en entornos sin cobertura o con requisitos de privacidad estrictos.
- Procesamiento de texto sensible en el propio dispositivo: notas clinicas, mensajes personales o documentos internos pueden resumirse o reescribirse sin que el contenido salga del telefono, ya que todo el calculo ocurre en CPU arm64.
- Prototipado y validacion de apps moviles con ExecuTorch: el repositorio incluye `config.json` por backend con metadatos del `.pte` y un `export-report-<ventana>.json` por fichero, lo que sirve como referencia para verificar cargas y presupuestos de memoria antes de integrar en produccion.
- Aplicaciones de campo sin conectividad: tecnicos, personal de obra o repartidores pueden usar funciones de redaccion asistida, clasificacion de incidencias y generacion de respuestas predefinidas en dispositivos que nunca tendran red.
- Funciones de accesibilidad: dictado asistido, reescritura de texto y simplificacion de frases para usuarios con dificultades de lectura, ejecutadas localmente para no depender de servicios externos ni exponer contenido personal.
- Ajuste del equilibrio memoria/contexto en dispositivos modestos: la variante de 2.048 tokens con aproximadamente 48 MB de caché KV permite desplegar en terminales de gama media donde las ventanas mayores no cabrian.
- Sustitucion de llamadas a APIs de terceros en funciones auxiliares: clasificacion de texto corto, extraccion de campos o generacion de plantillas dentro de una app, evitando coste por token y latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es una prueba de humo ("smoke test") superada en las cinco variantes XNNPACK, que devuelve "Paris" ante una peticion no especificada, presumiblemente sobre la capital de Francia. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se ofrecen cifras de latencia o throughput.

## Requisitos de hardware

- Backend: XNNPACK sobre CPU, objetivo "any arm64". No se exporta ninguna variante para GPU, NPU ni aceleradores especificos en este repositorio.
- Peso en disco de los ficheros: 0,80 GB para las ventanas de 2k, 4k y 8k; 0,81 GB para 16k; 0,83 GB para 32k.
- Memoria de la cache KV (fp32, 24.576 bytes por token), reservada entera al cargar: unos 48 MB (2k), 96 MB (4k), 192 MB (8k), 384 MB (16k) y 768 MB (32k).
- Presupuesto de memoria de referencia: el autor publica el campo `fits_phone_budget` calculado contra un limite de 5 GB por dispositivo.
- Cabida en hardware de consumo: si, el objetivo declarado son telefonos Android arm64; la variante de 2k es la mas segura para dispositivos con poca RAM y la de 32k exige un terminal con margen amplio.
- GPU recomendadas: no aplica; al ser una exportacion XNNPACK solo CPU, no se aprovechan A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: runtime ExecuTorch 1.4.0, la app Android openweights y, en general, cualquier runtime ExecuTorch 1.4.0 compatible con el formato `.pte`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar el artefacto con su propio modelo de origen. Los datos de arquitectura y rendimiento de alternativas no estan disponibles en esta busqueda.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-heretic-ExecuTorch | 1,2B (segun nomenclatura del base) | 2k a 32k fijos por fichero | .pte (ExecuTorch, XNNPACK CPU) | lfm1.0 | 0 descargas, 0 likes; repositorio de 4,0 GB |
| experimentalmachines/LFM2.5-1.2B-Instruct-heretic (modelo base) | 1,2B | no disponible | safetensors u otro formato de origen, no disponible | lfm1.0 | modelo fuente de la cuantizacion |
| LiquidAI/LFM2.5-1.2B-Instruct (origen de la licencia) | 1,2B | no disponible | no disponible | lfm1.0 | referenciado solo a traves del enlace de licencia |
| Otras alternativas de ~1-2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: la unica evidencia de funcionamiento es una prueba de humo que devuelve "Paris". No hay datos que respalden calidad de razonamiento, codigo o matematicas.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones, no puede estimarse la tasa de respuestas incorrectas en produccion.
- Idiomas no declarados: la ficha del repositorio no incluye lista de idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano sin validacion previa.
- El sufijo "heretic" del modelo base no viene explicado en la documentacion; conviene revisar el repositorio de origen antes de asumir su comportamiento respecto al modelo original de Liquid AI.
- Ventana de contexto fija e inmutable por fichero: no se puede ampliar en tiempo de ejecucion y el runtime reserva la cache KV completa al cargar, por lo que elegir una ventana demasiado grande puede provocar fallos de memoria.
- Licencia `other` con nombre lfm1.0: no es una licencia de codigo abierto estandar y puede imponer condiciones al uso comercial. Debe revisarse el texto completo en el enlace de Liquid AI antes de cualquier despliegue productivo.
- Adopcion nula: cero descargas y cero likes, con fecha de creacion muy reciente. No hay comunidad que haya validado la conversion ni reportado problemas.
- Dependencia estricta de los formatos: los ficheros `.pte` solo funcionan con ExecuTorch 1.4.0 y backends compatibles; no son utilizables en ecosistemas como llama.cpp, Ollama, vLLM o TGI.
- Solo CPU arm64: sin soporte de GPU, NPU u otros aceleradores en esta exportacion, lo que limita el throughput en dispositivos de gama alta que si disponen de hardware de aceleracion.
- El autor del repositorio es un tercero distinto de Liquid AI: la trazabilidad de la cuantizacion depende de los informes de exportacion incluidos y del flujo de trabajo de GitHub Actions referenciado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-heretic-ExecuTorch
- Modelo base de la cuantizacion: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-heretic
- Licencia lfm1.0 (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Ejecucion de exportacion (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/35391413296
