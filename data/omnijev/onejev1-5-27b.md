# OmniJev/OneJev1.5-27B

## Resumen

OneJev1.5-27B es un modelo multimodal de 27.356.728.560 parámetros desarrollado por OmniJev y presentado como un "System One decision model". A diferencia de un modelo generativo convencional, recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con un conjunto de preguntas tipadas y devuelve, en una única pasada forward, una probabilidad calibrada para cada opción de respuesta. El propósito es sustituir la generación libre de texto por decisiones evaluables y con puntuación de confianza, algo útil cuando un agente debe elegir entre alternativas discretas.

Se trata de un fine-tune completo de Qwen/Qwen3.8-27B entrenado sobre aproximadamente 320.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de datasets públicos de decisión. La licencia declarada es Apache 2.0 y los pesos se distribuyen en safetensors con la librería transformers.

Su relevancia actual viene de su posición en Decision Index 0.3: con 63,64 puntos sobre la parte pública del tablero (37 benchmarks, 140.178 peticiones), ocupa el quinto puesto entre 148 modelos y es el mejor del tablero en la categoría Arts & Human Taste. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que toda la evidencia de rendimiento procede del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; heredada de Qwen/Qwen3.8-27B (tag de arquitectura: qwen3_5). Transformer multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio se publica en safetensors con un tamano de 54,7 GB, consistente con precision completa de 27,36 B de parametros (BF16/FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que es un modelo multimodal de tipo image-text-to-text construido sobre Qwen/Qwen3.8-27B, con la etiqueta de arquitectura qwen3_5. Por los tags y el ejemplo de uso, acepta texto, imagenes y video como entrada, y expone una interfaz de "System One API" (TypeSafe) ampliada con un campo `media`. No se documenta si emplea atencion lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion de eficiencia.

El entrenamiento consiste en un full fine-tune sobre aproximadamente 320.000 preguntas provenientes de tres fuentes declaradas: ejecuciones reales de agentes, videos e imagenes, y los splits de entrenamiento de datasets publicos de decision. No se especifica el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de alineamiento. Tampoco se indica el proceso de calibracion seguido para que las probabilidades de salida sean fiables, que es precisamente la caracteristica diferencial declarada del modelo.

## Capacidades

- Decision multimodal con probabilidad calibrada: dada una entrada (imagen, video o texto) y un conjunto de preguntas tipadas, devuelve una probabilidad para cada opcion en una sola pasada forward.
- Preguntas de tipo booleano (`Noul`) y de eleccion multiple (`Choice`), segun la API mostrada en el ejemplo de uso.
- Comprension de capturas de pantalla orientada a agentes GUI: en el ejemplo oficial se usa para decidir si una tarea esta completada y cual debe ser la siguiente accion sobre la interfaz.
- Entrada de video ademas de imagenes y texto.
- Modo conversacional, segun los tags del repositorio.
- Capacidades linguisticas: no se documenta la cobertura de idiomas ni la calidad por idioma.
- Soporte de tool calling o function calling: no documentado.
- Razonamiento multi-paso explicito o modo "thinking": no documentado; el diseno declarado es de decision en una unica pasada ("System One"), no de cadena de pensamiento.
- Vision y video: si, integrados en el pipeline image-text-to-text.
- Audio: no documentado.

## Casos de uso

- Automatizacion de interfaces graficas (agentes GUI): el modelo recibe una captura de pantalla y el estado de la tarea, y devuelve la probabilidad de que la tarea este terminada y de cual deberia ser la siguiente accion (por ejemplo, hacer clic en un elemento o detenerse), lo que encaja directamente en el ejemplo oficial de pago de una factura.
- Verificacion de finalizacion de tareas en pipelines de agentes: usar la pregunta booleana `done` como comprobador calibrado antes de cerrar un flujo automatizado, lo que permite umbralizar y disparar revision humana cuando la confianza es baja.
- Enrutado de decisiones en orquestadores multi-agente: en lugar de generar texto y parsearlo, el orquestador consulta al modelo por una opcion discreta entre alternativas predefinidas, reduciendo errores de formato.
- Analisis de grabaciones de video: dado que acepta video como entrada, puede evaluar el estado de un proceso filmado (linea de produccion, tutorial, sesion de uso) y responder preguntas de decision sobre el.
- Triaje y control de calidad visual: clasificar imagenes o pantallas en categorias mutuamente excluyentes con una probabilidad asociada, util para colas de revision donde interesa priorizar por incertidumbre.
- Evaluacion de riesgo calibrada: en flujos donde la salida debe ser una probabilidad y no una etiqueta, el modelo permite fijar umbrales explicitos y medir la calibracion de forma agregada.
- Asistencia conversacional multimodal: usando el modo conversacional declarado, para responder preguntas sobre imagenes o video en un dialogo de varios turnos, aunque no se documenta la longitud de contexto soportada.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la parte publica de Decision Index 0.3 (37 benchmarks, 140.178 peticiones, ejecutados y puntuados con el kit del propio tablero), publicados por el autor:

| Modelo | Puntuacion Decision Index (parte publica) |
|---|---|
| RSI-Jev v6.1 VL | 65,6 |
| vLLM-SR d3 | 65,5 |
| Torchcast Decision | 65,1 |
| Decider 31B | 64,3 |
| OneJev1.5-27B | 63,64 |

OneJev1.5-27B ocupa el quinto puesto entre 148 modelos del tablero. El autor afirma ademas que su puntuacion en Arts & Human Taste es la mas alta del tablero y que su puntuacion en Language Understanding es la segunda entre los cinco modelos de la tabla anterior. El desglose por areas no esta disponible en formato textual en la informacion proporcionada.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (27,36 B) y del tamano del repositorio (54,7 GB). No son datos publicados por el autor.

- Precision completa (BF16/FP16): aproximadamente 54,7 GB solo de pesos. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Cuantizacion a 8 bits: aproximadamente 27 GB. Cabe en A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: aproximadamente 14 GB. Cabe en una RTX 4090, RTX 3090, RTX 4080 o similar de 16-24 GB, asumiendo que exista soporte de cuantizacion para esta arquitectura.
- GPU consumer: si cabe en consumer GPU, pero solo con cuantizacion de 4 bits; en BF16 no cabe en ninguna GPU de consumo actual de una sola pieza.
- Opciones de despliegue: la via oficial documentada es el paquete `qev` del propio autor (`pip install "qev[torch] @ git+https://github.com/OmniJev/OneJev.git"` y `qev serve --model OmniJev/OneJev1.5-27B`), que expone una System One API con campo `media`. Tambien puede cargarse con transformers. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible, ya que dependen de que exista implementacion para la arquitectura qwen3_5.
- Latencia y throughput: no disponibles. El diseno de una sola pasada forward es favorable en latencia frente a esquemas de generacion con cadena de pensamiento, pero no se publican mediciones.
- VRAM adicional: no se especifica el consumo de memoria de las entradas de video ni la resolucion o duracion maximas admitidas.

## Comparativa con modelos similares

Los cuatro modelos de contraste son, segun el autor, los de mayor puntuacion en el rango de 25 B a 36 B de parametros del tablero, con sus puntuaciones de la parte publica a 12 de octubre de 2026.

| Modelo | Parametros | Decision Index (publico) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-27B | 27,36 B | 63,6 | No disponible | Apache 2.0 | Pesos en HuggingFace, 0 descargas |
| RSI-Jev v6.1 VL | No disponible | 65,6 | No disponible | No disponible | No disponible |
| vLLM-SR d3 | No disponible | 65,5 | No disponible | No disponible | No disponible |
| Torchcast Decision | No disponible | 65,1 | No disponible | No disponible | No disponible |
| Decider 31B | 31 B (segun nombre) | 64,3 | No disponible | No disponible | No disponible |

No hay datos publicos de contexto, licencia ni disponibilidad de las alternativas en la informacion proporcionada, ni comparaciones frente a modelos generativos multimodales de proposito general.

## Limitaciones y advertencias

- Modelo recien publicado y sin adopcion: 0 descargas y 0 "likes" en HuggingFace en la fecha de la ficha, sin validacion independiente de terceros.
- Toda la evidencia de rendimiento procede del autor y del tablero Decision Index, que no es un benchmark academico estandar ni comparable con MMLU, HumanEval o GSM8K.
- Rendimiento relativo: con 63,64 puntos queda por debajo de los cuatro modelos de su rango de tamano citados en la propia model card (65,6, 65,5, 65,1 y 64,3).
- El modelo esta especializado en decisiones discretas con probabilidad calibrada; no esta pensado como generador de texto libre ni como asistente generalista, y forzar ese uso probablemente de baja calidad.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con conversaciones largas, videos extensos o capturas de alta resolucion de forma fiable.
- No se documentan los idiomas soportados ni el rendimiento por idioma. El castellano no esta confirmado.
- No se detalla el proceso de calibracion ni se publican metricas de calibracion (por ejemplo, error de calibracion esperado o diagramas de fiabilidad); la propiedad "calibrada" es una afirmacion del autor.
- Riesgo de alucinacion: inherente a un modelo derivado de un LLM multimodal, aunque el formato de salida por probabilidades acota el espacio de respuestas al conjunto de opciones proporcionado.
- Sesgos: no documentados. Al entrenarse sobre ejecuciones reales de agentes, puede heredar los sesgos de comportamiento de esos datos.
- Licencia: se declara Apache 2.0, permisiva para uso comercial. Al ser un fine-tune de Qwen/Qwen3.8-27B, conviene verificar que los terminos de la licencia del modelo base no impongan condiciones adicionales sobre el derivado.
- El despliegue depende de un paquete propio (`qev`) publicado en GitHub, no en PyPI; la integracion con servidores de inferencia estandar no esta confirmada.
- La fecha de creacion y actualizacion del repositorio es la misma (12 de octubre de 2026), por lo que no hay historial de mantenimiento observable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev1.5-27B
- Organizacion del autor: https://huggingface.co/OmniJev
- Repositorio GitHub (codigo y cliente `qev`): https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Tablero Decision Index 0.3 (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cita (BibTeX): OneJev: A Multimodal System One Decision Model, OmniJev Team, 2026, https://github.com/OmniJev/OneJev
