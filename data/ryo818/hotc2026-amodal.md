# ryo818/HOTC2026-Amodal

## Resumen

HOTC2026-Amodal es un checkpoint de pesos publicado por el usuario ryo818 (Ryoga Yuzawa) que contiene únicamente la cabeza amodal («amodal head») del sistema HyperDAM, la solución que obtuvo el segundo puesto en el desafío Alpha AI HOTC 2026. No es un modelo completo ni autónomo: es un módulo de 38.957.486 bytes (unos 37,2 MiB) que debe cargarse junto al checkpoint oficial `sam3.pt` de Meta SAM 3 para ejecutar la inferencia. El fichero se distribuye como `amodal-v10.pt` y se acompaña del código de inferencia en la rama `release` del repositorio GitHub del autor.

El modelo aborda dos problemas concretos en el seguimiento de objetos sobre imágenes hiperespectrales: la presencia de distractores (objetos visualmente similares que confunden al tracker) y la oclusión parcial de los objetos, que requiere completar su extensión real mediante razonamiento amodal. La propuesta se describe en el artículo «HyperDAM: Hyperspectral Distractor-Aware Memory with Amodal Expansion for SAM 3 Tracking», aceptado en el taller IEEE WHISPERS 2026, y combina una memoria consciente de distractores con un mecanismo de expansión amodal sobre el backbone de SAM 3.

La relevancia actual del checkpoint es fundamentalmente de investigación: permite reproducir los resultados de un sistema premiado en un reto de teledetección hiperespectral y reutilizar la cabeza amodal sobre SAM 3 en pipelines propios de segmentación y tracking. El repositorio no incluye la model card del modelo base, no declara idiomas, no publica métricas y registra cero descargas en el momento de la consulta, por lo que debe tratarse como material de investigación en fase temprana de difusión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza amodal (módulo de expansión amodal y memoria consciente de distractores) acoplada a Meta SAM 3; arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible (el checkpoint ocupa 38.957.486 bytes; a título orientativo, en fp32 equivaldría a ~9,7 M de parámetros y en fp16 a ~19,5 M, sin que se confirme la precisión de almacenamiento) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye un único fichero `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | Apache 2.0 para el checkpoint; el modelo base SAM 3 está sujeto a la licencia SAM de Meta y no se redistribuye |
| Formato de pesos | PyTorch (`.pt`), fichero `amodal-v10.pt` |
| SHA-256 del checkpoint | `718f34dd59f828762b8b0ca33be66516f26968c1d77893a0ac58b2e3d35c3966` |
| Tamaño del repositorio | 0,0 GB según HuggingFace (el fichero de pesos figura como contenido aparte) |
| Dependencia externa | `sam3.pt` (Meta SAM 3), no incluido en el repositorio |
| Tarea declarada | object-tracking, amodal-completion, hyperspectral-imaging |
| Código de inferencia | rama `release` del repositorio `RyogaYuzawa/hotc2026-alpha` |

## Arquitectura y entrenamiento

La información disponible describe el sistema como «Hyperspectral Distractor-Aware Memory with Amodal Expansion for SAM 3 Tracking», lo que sitúa la contribución en dos componentes: una memoria que discrimina distractores en el dominio hiperespectral y un mecanismo de expansión amodal que reconstruye la extensión completa del objeto cuando este aparece parcialmente ocluido. El checkpoint publicado corresponde a la cabeza amodal (`amodal-v10`) y se ejecuta sobre el backbone de segmentación y tracking de Meta SAM 3, que actúa como extractor de características y proveedor de las máscaras base.

No se dispone de datos sobre el número de tokens o muestras de entrenamiento, la composición del dataset hiperespectral utilizado, el régimen de optimización, ni sobre si se aplicaron técnicas de ajuste fino con refuerzo (RLHF/DPO) o preferencias. Tampoco se documentan innovaciones de decodificación especulativa, atención lineal u otras optimizaciones de inferencia. El único aval técnico explícito es la aceptación del artículo en IEEE WHISPERS 2026 y el segundo puesto obtenido en el desafío Alpha AI HOTC 2026, sin métricas publicadas en la información consultada.

## Capacidades

- Seguimiento de objetos (object tracking) sobre secuencias de imágenes hiperespectrales, apoyándose en el backbone SAM 3.
- Completación amodal: estimación de la extensión completa de un objeto, incluidas las regiones ocluidas o fuera de la máscara visible.
- Discriminación de distractores en el dominio hiperespectral, es decir, separación de objetos con apariencia similar en el espectro visible pero distinguibles en las bandas espectrales.
- Integración con SAM 3 como modelo base de segmentación y tracking, mediante la carga conjunta de `amodal-v10.pt` y `sam3.pt`.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas ni tool calling: no es un modelo de lenguaje.
- No se documentan capacidades multimodales (visión-lenguaje), audio, ni modos de razonamiento explícito.
- No se declaran capacidades multilingües ni procesamiento de texto de ningún tipo.
- No se especifica soporte para agentes ni razonamiento multi-paso.

## Casos de uso

- Teledetección hiperespectral: detección y seguimiento de objetos de interés (vehículos, embarcaciones, cultivos) en cubos de datos hiperespectrales, aprovechando la memoria consciente de distractores para no confundir elementos con firmas espectrales parecidas.
- Monitorización agrícola: seguimiento de parcelas o plantas individuales a lo largo del tiempo, donde la completación amodal ayuda cuando el dosel o estructuras adyacentes ocluyen parcialmente el objeto monitorizado.
- Vigilancia aérea y satelital: tracking continuo de blancos que desaparecen temporalmente tras nubes, edificios o vegetación, usando la expansión amodal para mantener la identidad del objeto durante la oclusión.
- Reproducción de resultados del reto HOTC 2026: carga del checkpoint `amodal-v10` junto a `sam3.pt` desde la rama `release` para replicar la solución que obtuvo el segundo puesto y servir de baseline en comparaciones futuras.
- Investigación en segmentación amodal: uso del módulo como cabecera intercambiable sobre SAM 3 para estudiar el efecto de la expansión amodal en métricas de tracking, aislando esta contribución del resto del sistema.
- Análisis medioambiental multiespectral/hiperespectral: seguimiento de derrames, incendios o masas de agua en los que la firma espectral es más informativa que el color RGB y la oclusión es frecuente.
- Prototipado en pipelines de visión por computador: integración de la cabeza en un servicio de inferencia basado en PyTorch que ya utilice SAM 3, añadiendo la funcionalidad amodal sin sustituir el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento cualitativo es que el sistema HyperDAM obtuvo el segundo puesto en el desafío Alpha AI HOTC 2026, sin que se detallen las métricas, el conjunto de evaluación ni la comparación con el resto de participantes.

| Benchmark | Resultado | Notas |
|---|---|---|
| Alpha AI HOTC 2026 | 2.º puesto | Sin métricas numéricas publicadas en la información disponible |
| HOTC / métricas de tracking | no disponible | No se especifican conjuntos de validación ni valores |
| MMLU, HumanEval, GSM8K | no aplica | Modelo de visión, no de lenguaje |

## Requisitos de hardware

- VRAM para el checkpoint: el fichero de la cabeza amodal ocupa 38.957.486 bytes, por lo que su huella en memoria es de decenas de megabytes y resulta despreciable frente al modelo base.
- VRAM total: dominada por Meta SAM 3 (`sam3.pt`), cuyo tamaño y requisitos no se detallan en la información disponible; no es posible estimar cifras fiables.
- GPU recomendadas: no disponible. Al depender de SAM 3, los requisitos serán los de dicho modelo base, no los de este checkpoint.
- GPU de consumo: no confirmado. Dado el reducido tamaño de la cabeza, es plausible que el conjunto quepa en GPU de consumo (por ejemplo, gamas RTX con suficiente memoria para SAM 3), pero no hay datos que lo verifiquen.
- Opciones de despliegue: inferencia en PyTorch mediante el código de la rama `release` del repositorio `RyogaYuzawa/hotc2026-alpha`, cargando `amodal-v10.pt` junto a `sam3.pt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HOTC2026-Amodal (HyperDAM) | Cabeza amodal sobre SAM 3 para tracking hiperespectral | no disponible (~39 MB de checkpoint) | no aplica | Apache 2.0 (cabeza); SAM 3 bajo licencia SAM de Meta | HuggingFace, 0 descargas, sin métricas |
| Meta SAM 3 (base, sin cabeza amodal) | Modelo de segmentación y tracking | no disponible en la información | no aplica | Licencia SAM de Meta | Distribución oficial de Meta; no incluido en este repositorio |
| Meta SAM 2 | Modelo de segmentación y tracking en vídeo | no disponible en la información | no aplica | Apache 2.0 / licencia SAM según variante | Ampliamente disponible; sin soporte hiperespectral ni amodal declarado |
| Trackers por detección clásicos (por ejemplo, seguimiento sobre detectores RGB) | Pipeline detección + asociación | no aplica | no aplica | variable | genéricos; no aprovechan información hiperespectral ni completación amodal |

La comparación cuantitativa no es posible con los datos disponibles: no se publican parámetros, métricas ni contexto para ninguno de los sistemas citados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente el checkpoint `sam3.pt` de Meta SAM 3 para funcionar; sin él, el fichero `amodal-v10.pt` no es utilizable por sí solo.
- Licencia mixta: la cabeza se publica bajo Apache 2.0, pero SAM 3 «remains subject to Meta's SAM License», con condiciones propias que deben revisarse antes de cualquier uso comercial del conjunto.
- Ausencia total de métricas publicadas: no hay tablas de resultados, curvas ni comparaciones que permitan estimar la calidad real del checkpoint fuera del contexto del reto.
- Validación limitada: cero descargas y cero «likes» en el momento de la consulta, sin evidencia de uso independiente ni de replicación por terceros.
- Sesgos y dominios desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que se desconocen los sesgos espectrales, geográficos o de sensor que pueda arrastrar.
- Riesgo de alucinación amodal: al predecir la parte ocluida de un objeto, la cabeza puede generar extensiones plausibles pero incorrectas, especialmente en oclusiones prolongadas o con distractores fuertes.
- Dependencia del dominio: diseñado para imágenes hiperespectrales; su comportamiento en RGB convencional o en otros sensores no está documentado.
- Especificidad del reto: el diseño «distractor-aware» responde a las particularidades de HOTC 2026; su generalización a otros conjuntos hiperespectrales no está verificada.
- Sin soporte declarado de cuantización ni de formatos de despliegue alternativos (ONNX, TensorRT, GGUF), lo que limita la optimización en producción.
- Documentación mínima: la model card no describe la arquitectura interna, los hiperparámetros de entrenamiento ni los requisitos de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryo818/HOTC2026-Amodal
- Código de inferencia (rama `release`): https://github.com/RyogaYuzawa/hotc2026-alpha/tree/release
- Repositorio principal del proyecto: https://github.com/RyogaYuzawa/hotc2026-alpha
- Cita del artículo: Yuzawa, R. y Takagi, T., «HyperDAM: Hyperspectral Distractor-Aware Memory with Amodal Expansion for SAM 3 Tracking», IEEE WHISPERS 2026 (aceptado). DOI o enlace de publicación: no disponible.
- Checkpoint base Meta SAM 3 (`sam3.pt`): no disponible en la información proporcionada; sujeto a la licencia SAM de Meta.
- Demos o espacios asociados: no disponible.
