# kaustuk000/netwatch-flow-cascade

## Resumen

NetWatch Flow Cascade es un sistema de detección de intrusiones de red publicado por el usuario kaustuk000 en Hugging Face. No es un modelo de lenguaje ni un transformer monolítico, sino una cascada de etapas congeladas —encoder de flujo, encoder de contexto, compresor, detector y world model— cuyo objetivo es nombrar la familia de ataque a la que pertenece un flujo de red a partir de los paquetes visibles en sus primeros 10 milisegundos, en lugar de esperar a que el flujo termine y se conozcan sus estadísticas completas. El pipeline declarado en la model card es `tabular-classification`, la licencia es MIT y los pesos se distribuyen en formato safetensors.

El modelo se entrenó sobre CSE-CIC-IDS2018. Cada etapa se congela antes de que la siguiente la lea, de modo que los gradientes nunca cruzan la frontera entre etapas. El detector sirve cinco cabezas diarias (una por día de entrenamiento, cada una consciente solo de las familias de su propio día) con un presupuesto de falsa alarma del 0,01 % por familia. La pieza servida por el endpoint de Hugging Face es `detector.safetensors`, que además contiene el escalador de características.

El world model, un modelo de grafo temporal de estilo TGN que mantiene memoria por host y pronostica qué host alcanza después una campaña, está declarado explícitamente como «en revisión» por el propio autor: sus probabilidades de ruta no están calibradas y su recall medido en test es del 0,78 %. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y un tamaño de 0,0 GB, por lo que se trata de un artefacto pequeño y sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de etapas congeladas: encoder de flujo, context encoder (memoria GRU por enlace + attention sobre peers recientes de cada extremo), record encoder, compresor, detector con 5 cabezas diarias y world model de grafo temporal estilo TGN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; la ventana de observación declarada es de 10 ms de paquetes por flujo y la memoria del detector es por enlace y por peers) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo tabular de clasificación de tráfico de red, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, acompañados obligatoriamente de un `<stage>.config.json` por etapa (orden de clases, anchuras de capa y punto de operación) |

Datos adicionales declarados: vector de entrada de 132 dimensiones (columnas 0-31 = embedding de flujo, columnas 32-131 = vector de contexto), versión `v1.0.0` publicada el 2026-09-28 con la ejecución de entrenamiento `20260926-2337`, y etiquetas `endpoints_compatible` y `region:us`. Ficheros incluidos: `flow_encoder.safetensors`, `context_encoder.safetensors`, `world_model_context_encoder.safetensors`, `record_encoder.safetensors`, `compressor.safetensors`, `detector.safetensors`, `detector_<day>.safetensors` (cinco cabezas), `world_model.safetensors` y, cuando están presentes, `live_compressor.safetensors` y `live_world_model.safetensors`.

## Arquitectura y entrenamiento

La arquitectura es una cascada de etapas entrenadas por separado y congeladas secuencialmente: el encoder de flujo produce un embedding de 32 dimensiones a partir de los paquetes tempranos del flujo, sin contexto de red; el context encoder del detector mantiene una memoria GRU por enlace y aplica attention sobre los peers distintos recientes de cada extremo; el compresor reduce el contexto del encoder de pronóstico a 32 dimensiones conservando el error de reconstrucción; y el detector emite la familia de ataque con cinco cabezas diarias, cada una ajustada a un presupuesto de falsa alarma del 0,01 % por familia. El world model es un modelo de grafo temporal de estilo TGN que lee el latente de 32 dimensiones por evento, mantiene un vector de memoria por host, atiende sobre los peers recientes de cada host y dispone de dos cabezas: next-event (si ese par interactúa después; su error es la puntuación de sorpresa) y ranking (qué host activo alcanza después una campaña). Al desplegarse sin observaciones, produce el grafo de pronóstico `S[t] → S[t+k]`.

Los datos de entrenamiento proceden de CSE-CIC-IDS2018. La model card no especifica el número de tokens ni la composición exacta del dataset, ni menciona RLHF, DPO ni ningún otro ajuste por preferencias, algo que por otra parte no aplica a este tipo de modelo. La innovación técnica principal es la ventana de decisión: el veredicto se emite unos 31 ms después del primer paquete del flujo, en lugar de esperar a las estadísticas completas del flujo. Una decisión de ingeniería destacable es el uso de safetensors en lugar de pickles: el autor argumenta explícitamente que `torch.load` ejecuta código arbitrario al deserializar y que publicar un modelo como pickle obliga a confiar en quien lo sube. La contrapartida es que cada etapa son dos ficheros (tensores y `config.json`) e inseparables entre sí. La calibración del world model se ajustó sobre tráfico benigno de validación con un presupuesto de 1e-4, y el checkpoint publicado corresponde a la época 5 con umbral de servicio 0,99148 sobre `target_probability`.

## Capacidades

- Clasificación de familia de ataque en flujos de red a partir de los primeros 10 ms de paquetes, con veredicto en aproximadamente 31 ms desde el primer paquete.
- Detección de intrusiones de red y de anomalías, con cinco cabezas diarias independientes y un presupuesto de falsa alarma declarado del 0,01 % por familia.
- Puntuación de sorpresa mediante la cabeza next-event del world model (error de predicción sobre si un par de hosts interactúa a continuación).
- Pronóstico de propagación de campaña mediante la cabeza de ranking del world model, que ordena qué host activo alcanza después la campaña.
- Servicio como endpoint de Hugging Face Inference Endpoints mediante `handler.py`, que puntúa características preextraídas de 132 dimensiones y admite la petición `{"inputs": "info"}` para consultar metadatos del checkpoint.
- Extracción de características fuera del endpoint: la cadena completa sobre tráfico vivo se ejecuta con `python -m models.serving.detect_live --interface <iface>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Detección temprana de intrusiones en el borde de red: desplegar la cadena sobre una interfaz de captura para clasificar cada flujo en cuanto aparecen sus primeros paquetes, reduciendo la ventana de exposición frente a sistemas que esperan al cierre del flujo.
- Triaje y priorización en un SOC: usar la familia predicha y la probabilidad por clase para ordenar alertas, aprovechando que el detector está ajustado a un presupuesto de falsa alarma del 0,01 % por familia en lugar de a un umbral arbitrario.
- Enrutado hacia analistas por turnos o por día: las cinco cabezas diarias (`detector_<day>.safetensors`) permiten seleccionar la cabeza correspondiente al día de entrenamiento, útil en entornos donde las familias observadas cambian según la franja o el calendario.
- Enriquecimiento de telemetría existente: si ya se dispone de un pipeline que extrae el embedding de flujo y el vector de contexto, el endpoint acepta directamente el vector de 132 floats y devuelve clase, probabilidades por clase y veredicto de alerta.
- Análisis post-incidente y forense: reejecutar el detector sobre capturas históricas para etiquetar familias de ataque por flujo y reconstruir la cronología de una campaña con la ayuda del grafo de pronóstico.
- Investigación de propagación lateral: emplear el world model para obtener una lista ordenada de hosts candidatos a ser el siguiente objetivo de una campaña, presentada como ranking y no como probabilidad calibrada.
- Monitorización de desviaciones en entornos controlados: la puntuación de sorpresa de la cabeza next-event puede alimentar un panel de anomalías sobre pares de hosts que no suelen interactuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen cifras de MMLU, HumanEval, GSM8K ni equivalentes, porque el modelo no es un modelo de lenguaje. La model card sí aporta métricas operativas y de calibración:

| Metrica | Valor |
|---|---|
| Latencia de extremo a extremo (paquete a veredicto) | ~31 ms tras el primer paquete del flujo |
| Ventana de observacion | primeros 10 ms del flujo |
| Presupuesto de falsa alarma del detector | 0,01 % por familia |
| Ancho del vector de entrada | 132 flotantes (32 de flujo + 100 de contexto) |
| Umbral servido del world model (epoca 5) | 0,99148 sobre `target_probability` |
| Recall del world model en test | 0,78 % de los eventos de ataque |
| Falsas alarmas del world model | 1.070 (0,016 %; 65 por hora; 3,8 incidentes falsos por hora) |
| Presupuesto de calibracion | 1e-4 sobre trafico benigno de validacion |
| Fidelidad de las probabilidades de ruta | rutas mostradas al 70-100 % se cumplieron ~24 % de las veces |
| Dataset de entrenamiento | CSE-CIC-IDS2018 |
| Descargas y likes en Hugging Face | 0 y 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB y el vector de entrada es de 132 flotantes, lo que sitúa el artefacto en la categoría de modelos muy pequeños, pero no se publican cifras de memoria ni de parámetros.
- GPU recomendadas: no disponible. No hay requisitos declarados por el autor.
- Viabilidad en GPU de consumo: no disponible oficialmente. Por el tamaño declarado del repositorio y la naturaleza tabular del detector, es plausible que la inferencia del detector quepa en cualquier GPU de consumo e incluso en CPU, pero esto no está confirmado en la información proporcionada.
- Opciones de despliegue: Hugging Face Inference Endpoints mediante el `handler.py` incluido (etiqueta `endpoints_compatible`); ejecución local de la cadena completa sobre tráfico vivo con `python -m models.serving.detect_live --interface <iface>`; servicio del world model con `python -m models.world_model.service --load world_model.pt --latents <day latents> --node-index <node_index.parquet>` y consulta `GET http://localhost:8900/forecast`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la model card declara un veredicto aproximadamente 31 ms después del primer paquete del flujo, en la ejecución completa desde paquetes. El world model se describe como «~150 s por detrás del tráfico» en su variante estándar, y las variantes `live_compressor` / `live_world_model` existen precisamente para producir pronósticos con solo segundos de retraso. No se publican cifras de throughput.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables publicados con especificaciones verificables. La búsqueda web devuelve dos proyectos homónimos o de nombre parecido que no guardan relación con este modelo y no son comparables: `cascadeflow` (runtime de cascada de modelos para agentes de IA, de lemony-ai) y `NetWatch-AI` (plataforma de monitorización de red empresarial de LTMani). Ninguno de los dos es un detector de intrusiones basado en la cascada de etapas descrita aquí.

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NetWatch Flow Cascade v1.0.0 | Cascada de clasificadores tabulares + world model de grafo temporal | no disponible | no aplica (ventana de 10 ms por flujo) | solo metricas operativas propias (31 ms, 0,01 % de falsa alarma por familia) | MIT | Publicado en Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El world model está declarado como «en revisión» por el propio autor. Sus probabilidades de ruta no están calibradas: rutas presentadas con probabilidades del 70-100 % se cumplieron en torno al 24 % de las veces. El autor recomienda mostrarlas como lista ordenada de hosts, no como probabilidades. La corrección se anuncia para la versión v1.1.0.
- El recall del world model en test es del 0,78 % de los eventos de ataque, con 1.070 falsas alarmas (0,016 %, 65 por hora, 3,8 incidentes falsos por hora). El propio autor indica que el detector debe usarse para alertas y el world model solo para pronóstico y explicación.
- El world model es con estado: su memoria avanza con cada evento en orden de flujo y se reinicia por día, por lo que no puede puntuar un evento de forma aislada. `handler.py` no lo sirve; hay que ejecutarlo con el código del repositorio, reconstruyendo antes el `.pt` desde los safetensors con `tools/publish/to_safetensors.py` (el autor afirma que la conversión es bit-exact).
- La extracción de características no está incluida en el endpoint: requiere captura de paquetes y un flujo continuo del historial de todos los flujos. El endpoint solo puntúa vectores de 132 flotantes ya extraídos.
- Entrenamiento limitado a CSE-CIC-IDS2018: el modelo no ha visto tráfico fuera de esa distribución, por lo que el rendimiento en redes con protocolos, topologías o familias de ataque distintas a las del dataset es una incógnita. Cada cabeza diaria conoce únicamente las familias de su propio día de entrenamiento.
- Fragmentación de artefactos: cada etapa son dos ficheros (tensores y `config.json`) y son inservibles por separado. El `detector.safetensors` contiene además el escalador de características, de modo que su omisión invalida la inferencia. El autor subraya la obligación de subir ambos.
- `model.memory` y `model.last_seen` dentro de `world_model.safetensors` son estado de ejecución por día, no pesos, y deben reiniciarse antes de puntuar.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía alguna. No se declaran restricciones adicionales ni requisitos de uso responsable.
- No se han publicado datos sobre sesgos, equidad, robustez adversarial ni comportamiento frente a tráfico cifrado u ofuscado. Tampoco hay validación externa: 0 descargas y 0 likes, y el tamaño del repositorio es de 0,0 GB, sin cifras de parámetros publicadas.
- La fecha de creación del repositorio indicada (2026-09-28) y la fecha de la ejecución de entrenamiento (`20260926-2337`) son posteriores a la información habitual del ecosistema; conviene verificar la procedencia del artefacto antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaustuk000/netwatch-flow-cascade
- Dataset de entrenamiento citado: CSE-CIC-IDS2018 (no se proporciona URL en la información disponible)
- Enlaces devueltos por la búsqueda web, no relacionados con este modelo (proyectos homónimos o de nombre similar, incluidos solo para descartar confusiones):
  - https://github.com/lemony-ai/CascadeFlow
  - https://cascadeflow.ai/
  - https://docs.cascadeflow.ai/
  - https://docs.cascadeflow.ai/get-started/how-it-works
  - https://github.com/LTMani/NetWatch-AI
