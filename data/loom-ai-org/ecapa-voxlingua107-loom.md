# loom-ai-org/ecapa-voxlingua107-loom

## Resumen

`loom-ai-org/ecapa-voxlingua107-loom` es la exportación al formato GGUF del identificador de idioma hablado `speechbrain/lang-id-voxlingua107-ecapa` de SpeechBrain, empaquetada para el motor loom.cpp. No es un modelo de lenguaje: es un clasificador de audio que recibe una grabación de voz y devuelve una distribución de probabilidad sobre 107 idiomas. La arquitectura es ECAPA-TDNN, una red convolucional con atención de canales y pooling estadístico, con 21.419.368 parámetros.

El modelo resuelve una tarea de preprocesado: determinar en qué idioma se está hablando antes de decidir qué modelo ASR, qué traductor o qué política de moderación aplicar. Con un repositorio de 0,1 GB y solo 21,4 millones de parámetros, es apto para ejecutarse en CPU o en GPUs de gama baja como paso previo dentro de un pipeline de voz.

La relevancia de esta ficha concreta está en el formato de distribución: loom.cpp publica un único GGUF autodescriptivo que transporta sus propias topologías de grafo, el tokenizador (si procede) y el script controlador, de modo que el modelo se ejecuta sin depender del stack original de SpeechBrain. Los pesos son idénticos a los del modelo base y la licencia es apache-2.0, heredada de este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red convolucional 1D con atención de canales y pooling estadístico atento) |
| Parámetros totales | 21.419.368 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de audio; una clip completa por llamada, el export no acepta el parámetro `length`) |
| Tipos de cuantización | no disponible (el repositorio publica un único archivo GGUF sin variantes documentadas) |
| Idiomas soportados | 107 idiomas de VoxLingua107 |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un único archivo `ecapa-voxlingua107.gguf`) |
| Tarea | clasificación de audio: identificación de idioma hablado (`audio-classification`) |
| Entrada | audio mono en coma flotante a 16 kHz, una clip entera por llamada |
| Salida | una distribución de probabilidad por clip sobre los 107 idiomas, etiquetada como `<código>: <nombre>` |
| Modelo base | `speechbrain/lang-id-voxlingua107-ecapa` (pesos sin modificar) |
| Runtime | loom-py / `loom-py-rt` (biblioteca declarada en HuggingFace: `loom-py-rt`) |
| Tamaño del repositorio | 0,1 GB |

Lista completa de códigos de idioma declarados: ab, af, am, ar, as, az, ba, be, bg, bi, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, he, ja, jv, ka, kk, km, kn, ko, la, lm, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ud, uz, vi, war, yi, yo, zh.

## Arquitectura y entrenamiento

ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network) es una arquitectura de redes convolucionales 1D diseñada para verificación de hablante que se reutiliza aquí como extractor de embeddings de idioma. La red apila bloques convolucionales con agrupaciones residuales de escala múltiple, aplica atención de canales sobre las características intermedias y agrega la secuencia temporal con un pooling estadístico atento que pondera los fotogramas más discriminativos. Sobre ese embedding se aplica una capa de clasificación que produce la probabilidad de cada uno de los 107 idiomas. El identificador de la familia (familia 13 en la nomenclatura del exportador) describe el contrato de entrada/salida: audio de entrada, una distribución de idioma por clip de salida.

El entrenamiento original corresponde a SpeechBrain sobre VoxLingua107, un corpus de habla extraída de YouTube. La información proporcionada no detalla el número de tokens, la composición exacta del dataset, la duración total ni si hubo etapas de ajuste con RLHF o DPO; esos datos no están disponibles en esta ficha. La innovación del artefacto publicado no está en el entrenamiento, sino en el empaquetado: `loom-exporter` vuelca los pesos sin modificarlos en un GGUF autodescriptivo que incrusta el grafo y el driver de ejecución, de forma que el modelo se sirve con el runtime de loom.cpp (a través de `loom-py`) en lugar de con PyTorch y SpeechBrain.

## Capacidades

- Identificación de idioma hablado: devuelve una probabilidad para cada uno de los 107 idiomas de VoxLingua107 a partir de una clip de audio.
- Acceso a la mejor predicción (`result.best[0]`) y al ranking de las N mejores (`result.top(n)`), algo necesario porque los idiomas emparentados comparten masa de probabilidad.
- Cobertura de 107 idiomas, con especial densidad en lenguas europeas, y presencia de idiomas de África, Asia, Oceanía y lenguas construidas como el esperanto (`eo`) o el interlingua (`ia`).
- Ejecución autocontenida: el GGUF lleva el grafo, el tokenizador (si procede) y el script controlador; `model.driver_source` imprime el driver y documenta todos los argumentos aceptados por el modelo.
- Acceso de bajo nivel mediante `model.infer(...)`, que pasa los argumentos directamente al driver embebido, para aquellos parámetros que la API de alto nivel no expone.
- No genera texto, no razona, no escribe código, no resuelve matemáticas, no procesa imágenes y no soporta tool calling ni flujos de agente. Tampoco realiza transcripción: solo etiqueta el idioma.

## Casos de uso

- Enrutado de llamadas en atención al cliente multilingüe: al recibir una llamada entrante, se clasifica el idioma de los primeros segundos de audio y se deriva la conversación al agente o al modelo ASR del idioma correspondiente, sin preguntar al usuario.
- Selección previa de modelo ASR: en un pipeline con varios modelos de reconocimiento de voz especializados por idioma, este clasificador decide qué modelo cargar, evitando ejecutar un ASR multilingüe grande y más costoso para cada clip.
- Filtrado y curación de corpus de entrenamiento: al construir un dataset de voz, se etiqueta automáticamente el idioma de cada archivo para descartar muestras mal etiquetadas o fuera de la distribución objetivo antes de entrenar.
- Moderación y cumplimiento normativo en plataformas de audio y vídeo: clasificar el idioma de los audios subidos permite aplicar políticas de revisión específicas por región o activar moderadores automáticos en el idioma correcto.
- Indexación y búsqueda por idioma en archivos multimedia: añadir la etiqueta de idioma como metadato permite búsquedas del tipo «solo contenido en catalán» o generar estadísticas de distribución lingüística de un catálogo.
- Subtitulado y traducción automática: determinar el idioma de origen es el primer paso de una cadena de subtitulado; el clasificador fija el idioma de partida y evita que el traductor lo detecte de forma errónea con audios ruidosos.
- Despliegue en el borde (edge) o en dispositivos sin GPU: con 21,4 millones de parámetros y un GGUF de unas decenas de megabytes, cabe en un servidor modesto o en un dispositivo embebido para clasificar audio en local sin enviarlo a la nube.
- Investigación lingüística sobre corpus orales: etiquetar grandes volúmenes de grabaciones para estudios de distribución de lenguas, siempre leyendo el top-k en lugar de la primera respuesta por la confusión entre lenguas cercanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de exactitud, F1 ni comparaciones numéricas con otros identificadores de idioma, y la model card tampoco las reproduce del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 21.419.368 parámetros, no un dato publicado): en fp32 unos 86 MB; en fp16 unos 43 MB; en int8 unos 21 MB. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifica ninguna. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas integradas y GPUs de gama de entrada.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (RTX 3060, RTX 4090, GTX 1650, etc.), y también en CPU sin aceleración dedicada.
- Opciones de despliegue: el runtime oficial es loom-py (`pip install -U "loom-py-rt[hub]"`), con `loom.Model.from_pretrained(...)`. No consta soporte ni compatibilidad declarada con vLLM, llama.cpp, Ollama o TGI: aunque el artefacto sea un GGUF, es un GGUF autodescriptivo con grafo y driver propios del motor loom.cpp, no un GGUF estándar de llama.cpp.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia y no se documenta si el modelo soporta procesamiento por lotes (de hecho, el export no acepta `length`, lo que impide pasar lotes con padding).

## Comparativa con modelos similares

La información proporcionada solo permite comparar con precisión contra el modelo base. Los datos de terceros no están disponibles en esta ficha, por lo que se marcan como tales.

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `loom-ai-org/ecapa-voxlingua107-loom` | 21.419.368 | 107 (VoxLingua107) | no aplica (una clip por llamada) | apache-2.0 | GGUF para loom.cpp | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `speechbrain/lang-id-voxlingua107-ecapa` (modelo base) | mismos pesos, sin modificar (parámetros no desglosados en esta ficha) | 107 (VoxLingua107) | no aplica | apache-2.0 | pesos originales de SpeechBrain | HuggingFace |
| Otros identificadores de idioma hablado (por ejemplo, clasificadores LID multilingües de terceros) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia práctica entre las dos primeras filas es exclusivamente el formato y el runtime: los pesos son idénticos, pero el export a GGUF elimina la dependencia de SpeechBrain y de PyTorch en el momento de la inferencia.

## Limitaciones y advertencias

- Una clip entera por llamada: el export no acepta el parámetro `length`, de modo que no se puede pasar un lote de clips con padding, porque el relleno se interpretaría como parte del audio. Hay que invocar el modelo una vez por clip.
- Confusión entre lenguas emparentadas: la propia model card advierte de que el bosnio, el croata y el serbio, así como las lenguas escandinavas, se confunden de forma habitual. Debe leerse el top-k (`result.top(3)` o similar) y no solo la primera respuesta.
- Sesgo de dominio: el entrenamiento procede de habla extraída de YouTube (VoxLingua107), lo que favorece unos segundos de habla limpia. Audio con ruido de fondo, música, reverberación, códecs agresivos, susurros o acentos muy marcados puede degradar la clasificación. No se documenta el comportamiento con clips muy cortos ni con audio musical.
- Restricción de formato de entrada: el audio debe ser mono a 16 kHz. Otras frecuencias de muestreo o canales múltiples requieren remuestreo y conversión a mono previos.
- Riesgo de error confiado: al no generar texto, no existe alucinación en el sentido habitual, pero el modelo puede asignar una probabilidad alta a un idioma incorrecto cuando la señal es ambigua. Es un riesgo real en producción si se usa `result.best[0]` sin umbral de confianza ni verificación.
- Sin marcas de tiempo ni detección de cambio de idioma: la salida es una única distribución por clip, así que no permite localizar en qué momento se habla cada lengua dentro de una grabación con code-switching.
- Ausencia de métricas publicadas: no hay exactitud, F1 ni comparativas frente a alternativas, lo que obliga a validar el modelo con datos propios antes de desplegarlo.
- Licencia: apache-2.0 heredada del modelo base, permisiva y apta para uso comercial con atribución y conservación del aviso de licencia. No se documentan restricciones adicionales por parte del exportador.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 1 de octubre de 2026. No hay garantía de mantenimiento, versionado ni soporte por parte de `loom-ai-org`.
- Dependencia de un ecosistema joven: el uso requiere adoptar loom-py y loom.cpp; no hay caminos de despliegue alternativos documentados con herramientas estándar del sector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/ecapa-voxlingua107-loom
- Modelo base en HuggingFace: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Repositorio de loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio de loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio y API de loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt` (instalación con `pip install -U "loom-py-rt[hub]"`)
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes para este modelo; los enlaces obtenidos corresponden a la herramienta de grabación de pantalla Loom y a una marca de ropa homónima, sin relación con `loom-ai-org`. No se han localizado papers, blogs ni demos adicionales sobre esta exportación.
