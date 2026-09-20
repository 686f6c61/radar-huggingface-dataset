# noffy/hastejev-5m

## Resumen

Haste Jev 5M (Medium) es un modelo de pesos abiertos publicado por el usuario noffy en Hugging Face, descrito por su autor como un motor de decision System-1 de sesgo cero (zero-bias). No es un modelo generativo de texto: se presenta como un motor de decision no generativo que, dado un estado textual y un conjunto cerrado de opciones, devuelve una eleccion acompanada de una puntuacion de confianza. Su ambito declarado son el enrutado financiero, el cumplimiento AML y la puntuacion de riesgo multicriterio.

Con 5.003.971 parametros totales (3.369.667 entrenables y 1.634.304 en tablas de proyeccion o buffer), el modelo es un transformer de 5 capas, 4 cabezas de atencion y dimension oculta de 224. Su huella de memoria declarada es de aproximadamente 19-20 MB en FP32 y unos 5 MB en INT8, lo que lo situa en el rango de despliegue en CPU, navegador o dispositivos con recursos muy limitados.

Forma parte de una familia escalonada de siete tamamos (de 98.000 a 20,4 millones de parametros) con la misma orientacion: decision de baja latencia en lugar de generacion de lenguaje. Es relevante ahora porque propone un patron de "kernel de decision" barato que podria usarse como filtro previo o sidecar de agentes autonomos, aunque el modelo no tiene descargas ni valoraciones publicadas y no se han divulgado resultados de benchmarks que respalden sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas, 4 cabezas de atencion y dimension oculta (d_model) de 224; motor de decision no generativo (System-1) |
| Parametros totales | 5.003.971 (~5,0 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables | 3.369.667 |
| Tabla de proyeccion / buffer | 1.634.304 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16, INT8, INT4 (ficheros safetensors separados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); variantes fp16, int8 e int4 |
| Huella de memoria declarada | ~20 MB en FP32, ~5 MB en INT8, ~19 MB segun la insignia del repositorio |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-09-20 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe exclusivamente una topologia transformer compacta: 5 capas, 4 cabezas de atencion y una dimension oculta de 224, con 3.369.667 parametros entrenables y 1.634.304 parametros adicionales asociados a una tabla de proyeccion o buffer. No se especifica si el modelo es encoder, decoder o encoder-decoder, ni el mecanismo de atencion exacto, ni la funcion de perdida. Tampoco se detalla el vocabulario, el tokenizador ni el procedimiento de tokenizacion del estado de entrada.

No hay informacion sobre datos de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si hubo ajuste por RLHF, DPO u otro metodo de alineacion, y si existe una fase de calibracion supervisada de las puntuaciones de confianza. La unica innovacion tecnica explicitamente declarada es el caracter "non-generative" del motor de decision y su etiqueta "zero-bias", que el autor no define ni cuantifica en la model card. Tampoco se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Eleccion entre opciones discretas: la API `HasteJevEngine.choice(state, options)` recibe un estado textual y una lista de opciones y devuelve una decision junto con un valor de confianza.
- Puntuacion de confianza por decision, con el objetivo declarado de servir como senal de calibracion.
- Inferencia de baja latencia orientada a motores de decision System-1, segun las etiquetas del modelo.
- Integracion como componente en agentes autonomos y en flujos de control de navegador y automatizacion web, de acuerdo con las etiquetas declaradas por el autor.
- Acepta cuantizacion INT8 e INT4 ademas de FP16 y FP32, con ficheros de pesos separados por formato.
- No es un modelo generativo: no produce texto libre, resumenes, traduccion ni codigo.
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, vision, audio ni modalidades adicionales.
- Multilingue: no. El modelo declara unicamente ingles (en).

## Casos de uso

- Enrutado de transacciones financieras: dado un estado con saldo, importe pendiente y otras variables, el motor devuelve una de tres decisiones tipicas (aprobar, marcar para revision, rechazar). Es adecuado por su tamano minimo y su latencia potencialmente baja, aunque no hay validacion publica de exactitud.
- Triaje de alertas AML y KYC: uso como primera capa de clasificacion que separa alertas de bajo riesgo de las que requieren analisis humano, dejando el analisis profundo a sistemas mayores o a revisores.
- Puntuacion de riesgo multicriterio: combinacion de varias senales en una unica decision discreta con confianza asociada, util para priorizar colas de trabajo.
- Filtro previo en cascada delante de un LLM grande: descartar los casos triviales con este motor y reservar el modelo generativo para los casos ambiguos, reduciendo coste por consulta. La etiqueta `endpoints_compatible` del repositorio sugiere compatibilidad con los endpoints de Hugging Face, aunque no se documenta el contrato exacto.
- Kernel de decision para agentes web: seleccionar la siguiente accion de un conjunto cerrado durante la automatizacion de un navegador, segun el uso declarado en las etiquetas `browser-control` y `web-automation`.
- Despliegue en el borde: con unos 5 MB en INT8 y unos 20 MB en FP32, el modelo cabe en moviles, contenedores ligeros o procesos sidecar sin GPU.
- Auditoria y trazabilidad de decisiones: el par decision mas confianza permite registrar una justificacion cuantitativa minima en sistemas con requisitos de explicabilidad operativa, siempre que la calibracion se valide externamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, AUC, calibracion (por ejemplo ECE) ni comparaciones numericas frente a otros sistemas. Las afirmaciones de baja latencia y de sesgo cero no vienen acompanadas de mediciones reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier formato. Los pesos ocupan aproximadamente 20 MB en FP32, 10 MB en FP16, 5 MB en INT8 y 2,5 MB en INT4; el consumo adicional depende del runtime.
- RAM declarada por el autor: ~20 MB en FP32 y ~5 MB en INT8 para este tamano.
- GPU recomendadas: no se especifica ninguna. Por tamano, cualquier GPU con al menos 1 GB de memoria es sobradamente suficiente, e incluso una CPU moderna es viable.
- GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4090) e incluso en iGPU.
- CPU y edge: viable en CPU de escritorio, movil, navegador y, para los miembros mas pequenos de la familia, en microcontroladores.
- Opciones de despliegue: la model card solo documenta la libreria propia `hastejev` (`HasteJevEngine.from_pretrained`). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI; dado que el modelo no es generativo, es probable que estos runners no sean aplicables, pero esto no se confirma en la documentacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia por consulta ni de peticiones por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los otros miembros de la propia familia Haste Jev. No se conocen modelos de terceros comparables en la informacion proporcionada.

| Modelo | Parametros | Dim. oculta | Capas | Cabezas | RAM FP32 | RAM INT8 | Uso objetivo declarado |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98.000 | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-500k | ~500.000 | 96 | 3 | 4 | ~2,0 MB | ~0,5 MB | CPU movil, workers en navegador |
| hastejev-1m | ~1,1 M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-2m | ~1,8 M | 160 | 4 | 4 | ~7,3 MB | ~1,8 MB | Automatizacion de navegador y bots |
| hastejev-5m | ~5,0 M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutado financiero y KYC |
| hastejev-10m | ~10,0 M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4 M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

Frente a alternativas de terceros, la comparacion no esta disponible: no se aportan datos de rendimiento, contexto, licencia ni disponibilidad de otros motores de decision de proposito similar.

## Limitaciones y advertencias

- Ausencia total de validacion publica: cero descargas y cero likes en el momento de redactar la ficha, y ningun benchmark divulgado.
- No es generativo: no puede redactar explicaciones, resumir ni mantener conversaciones. Cualquier justificacion textual de la decision debe generarla otro sistema.
- Longitud de contexto no especificada: se desconoce cuantos tokens admite el estado de entrada, lo que impide dimensionar con seguridad casos con historiales largos.
- Solo ingles: el modelo no declara soporte de castellano ni de ningun otro idioma, lo que limita su uso directo en entornos hispanohablantes.
- La etiqueta "zero-bias" es una afirmacion del autor sin definicion ni medicion; no debe interpretarse como ausencia demostrada de sesgo, especialmente en un dominio regulado como el financiero.
- Calibracion no verificada: la puntuacion de confianza se ofrece como salida, pero no hay datos de calibracion (ECE, curvas de fiabilidad) que permitan usarla como probabilidad fiable en produccion.
- Riesgo de decision erronea en casos limite: al tratarse de un clasificador de opciones cerradas, un estado ambiguo puede forzar una eleccion con confianza alta. Se recomienda umbral de abstención y supervision humana en decisiones con impacto financiero o legal.
- Sin informacion sobre datos de entrenamiento: se desconoce la procedencia de los datos, si hubo filtrado, y si existen sesgos sistematicos en dominios concretos.
- Ausencia de soporte de tool calling y de razonamiento multi-paso documentado: no debe asumirse que el modelo pueda planificar cadenas de acciones por si mismo.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia y copyright. No se declaran restricciones adicionales ni clausulas de uso aceptable mas alla de las de Apache 2.0.
- Metadatos a revisar: la fecha de creacion indicada (2026-09-20) es posterior a la fecha habitual de consulta, un detalle a verificar antes de citar la ficha.
- Documentacion incompleta para produccion: no se detallan tokenizador, version de transformers compatible, requisitos de Python ni contrato exacto de la API mas alla del ejemplo de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-5m
- Repositorio GitHub citado por el autor: https://github.com/racstan/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Miembros de la misma familia:
  - https://huggingface.co/noffy/hastejev-100k
  - https://huggingface.co/noffy/hastejev-500k
  - https://huggingface.co/noffy/hastejev-1m
  - https://huggingface.co/noffy/hastejev-2m
  - https://huggingface.co/noffy/hastejev-10m
  - https://huggingface.co/noffy/hastejev (20m)
- Paper, blog tecnico o demo: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces recuperados correspondian a paginas de descarga del navegador Google Chrome y no guardan relacion con Haste Jev.
