# SBDO1/needle2

## Resumen

Needle 2 es un modelo de 45 millones de parametros desarrollado por SBDO1 y publicado bajo licencia Apache 2.0, disenado especificamente para tool calling, uso de dispositivos y extraccion estructurada en entornos de borde. A diferencia de los modelos generativos convencionales, su proposito no es la conversacion abierta, sino devolver llamadas a herramientas como datos estructurados: recibe texto y emite JSON restringido por una gramatica a nivel de byte compilada a partir de los esquemas declarados por el desarrollador.

Su rasgo mas distintivo es el empaquetado: todo el modelo se compila en un unico binario de 14 MB, sin runtime externo, sin descargas y sin red, y ejecuta una sesion completa en aproximadamente 28 MB de RAM. Esta construido sobre los hallazgos de la arquitectura Simple Attention Network (una red densa con MLP de Hadamard, atencion GQA, memoria engram de clave-valor y hiper-conexiones multicarril) y comprimido a CQ2-bit con las herramientas de cuantizacion de Cactus. La memoria de la sesion permanece acotada gracias a una ventana deslizante de 256 tokens con las herramientas fijadas como sumideros de KV.

Es relevante ahora porque demuestra que el tool calling fiable puede salir de la nube y ejecutarse en hardware que va desde una Raspberry Pi 5 hasta un microcontrolador ESP32-P4, con velocidades de decodificacion de 500 tokens/s en Raspberry Pi 5, entre 400 y 1.500 tokens/s en visores como Meta Quest 3S y Apple Vision Pro, y entre 300 y 700 tokens/s en telefonos de gama baja. El autor afirma que compite con modelos como FunctionGemma 270M, LFM2.5 230M y Apple FM siendo entre 5 y 70 veces mas pequeno y usando 2 bits frente a los 16 bits de aquellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simple Attention Network (SAN): transformer denso con MLP de Hadamard en lugar del FFN, atencion GQA, memoria engram de clave-valor y hiper-conexiones multicarril |
| Parametros totales | 45 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana deslizante de 256 tokens, con las herramientas fijadas como sumideros de KV (la memoria total se mantiene acotada independientemente de la duracion de la conversacion) |
| Tipos de cuantizacion | CQ2-bit (Cactus Quants); el autor compara con modelos en f16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Modelo integrado en un binario unico de 14 MB generado por su propio motor (no se distribuye en safetensors ni GGUF) |
| Tamano del repositorio | 1.1 GB |
| Libreria | cactus-needle |
| Plataformas soportadas | ARM64, x86-64, ARMv7, RISC-V y WebAssembly; Apple, Windows, Linux, Android y Raspberry Pi |
| Memoria pico de sesion | ~28 MB (reportes externos de ~11 MB en ESP32-S3) |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

Needle 2 implementa una Simple Attention Network, la receta de modelo denso pequeno del autor. En cada bloque, la entrada es el aplanado normalizado con RMS de cuatro flujos residuales; se aplica la transformada de Walsh-Hadamard (matriz fija ortonormal, coste n log n y sin pesos que leer) en lugar de un FFN denso convencional; las filas (k, v) se obtienen de tablas de n-gramas con hashing (memoria engram); y la normalizacion P de los logits de enrutamiento A se calcula mediante iteracion de Sinkhorn para obtener una matriz doblemente estocastica. Los parametros a, b, g y todas las puertas sigma son aprendidos y dependen de la entrada. Tanto los residuales de atencion como los del MLP llevan sandwich-norm y puertas, y los sitios engram se activan en dos capas.

El entrenamiento y la compresion se apoyan en Cactus Quants para llevar el modelo a CQ2-bit, y la decodificacion esta restringida por una gramatica a nivel de byte compilada a partir de los esquemas de herramientas declarados, de modo que el modelo solo puede emitir valores que satisfagan las restricciones (rangos, patrones, enumeraciones, longitudes, numero de elementos). El autor no detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica destacable es doble: el empaquetado autocontenido en un binario de 14 MB con motor propio y el control de la generacion mediante gramatica mas recuperacion de herramientas integrada (solo las cinco mejores herramientas por turno se renderizan, con la gramatica restringida a ese subconjunto).

## Capacidades

- Tool calling y function calling: devuelve llamadas a herramientas como datos estructurados (texto de entrada, JSON de salida) y ejecuta el bucle completo de llamada, ejecucion, realimentacion del resultado y respuesta final mediante `agent.run()`.
- Salida restringida por gramatica: los esquemas se compilan a una gramatica a nivel de byte que restringe cada token, por lo que el modelo no puede emitir valores fuera de los rangos, patrones o enumeraciones declarados.
- Restricciones declarativas por campo: `Field` admite `description`, `enum`, `const`, `ge`/`le`/`gt`/`lt`, `multiple_of`, `min_length`/`max_length`, `pattern`, `format`, `min_items`/`max_items` y `unique_items`.
- Extraccion estructurada: `needle.extract()` permite extraer datos de texto libre hacia un modelo de Pydantic y obtener un objeto tipado.
- Puntuacion de confianza calibrada: cada respuesta incluye una puntuacion procedente de una cabeza aprendida, lo que permite fijar un umbral y escalar o derivar la decision cuando la confianza es baja.
- Recuperacion de herramientas: con catalogos grandes, una cabeza de recuperacion integrada selecciona y renderiza solo las cinco mejores herramientas por turno.
- Memoria acotada: ventana deslizante de 256 tokens con las herramientas fijadas como sumideros de KV, de modo que la memoria no crece con la longitud de la conversacion.
- Despliegue multiplataforma sin red: el modelo va integrado en el binario, sin runtime ni descargas, sobre ARM64, x86-64, ARMv7, RISC-V y WebAssembly.
- Generacion de texto abierta o razonamiento general, vision, audio y capacidades multilingues: no disponibles en la informacion proporcionada; el modelo esta enfocado a tool calling y extraccion.

## Casos de uso

- Atencion al cliente automatizada en el propio dispositivo: el modelo puede gestionar conversaciones multi-turno sin enviar datos a la nube, ya que su ventana deslizante de 256 tokens con herramientas fijadas como sumideros de KV mantiene la memoria en torno a 28 MB con independencia de la duracion de la conversacion. El umbral de confianza permite escalar a un humano cuando la puntuacion cae por debajo del valor configurado.
- Extraccion de datos de facturas y documentos: declarando un modelo Pydantic con `vendor`, `total` y `due_date`, `needle.extract()` devuelve un objeto tipado a partir de texto como "Invoice from Acme Corp, $1,200.00, due 2026-09-01", lo que encaja en pipelines de digitalizacion contable ejecutados en local.
- Control de dispositivos y domotica: casos como `set_thermostat(temperature: int, mode: Literal["heat","cool","auto"])` o `get_weather(city: str)` ilustran como el modelo traduce lenguaje natural a llamadas con argumentos validados por gramatica, sin posibilidad de emitir un modo distinto de los declarados.
- Agentes en visores de realidad extendida: con 400 a 1.500 tokens/s en Meta Quest 3S y Apple Vision Pro, el modelo puede resolver invocaciones de herramientas dentro de la propia sesion de VR sin depender de conectividad ni de latencia de red.
- Operaciones financieras asistidas con validacion estricta: el ejemplo `send_money` con `amount` entre 0 y 10.000 USD, `to` ajustado al patron `^@[a-z0-9_]+$` y un `memo` de 80 caracteres demuestra como las restricciones del esquema se compilan en la gramatica de decodificacion, de forma que el modelo no puede generar valores invalidos.
- Automatizacion industrial sobre microcontroladores: con unos 28 MB de pico de sesion (y reportes de ~11 MB en ESP32-S3) y soporte de ESP32-P4, es viable integrar tool calling en sensores y actuadores de planta sin gateway intermedio.
- Enrutamiento de herramientas en asistentes con catalogos amplios: la cabeza de recuperacion integrada selecciona las cinco mejores herramientas por turno y restringe la gramatica a ese subconjunto, lo que reduce el coste y el riesgo de confundir herramientas en catalogos grandes.
- Interfaces de voz o texto en telefonos de gama baja: entre 300 y 700 tokens/s en dispositivos de la gama A de Samsung permiten asistentes de productividad locales en terminales por debajo de 200 dolares.

## Benchmarks y rendimiento

No se publican cifras numericas por benchmark en la informacion disponible. La model card unicamente afirma de forma cualitativa que Needle 2 "intercambia victorias" con FunctionGemma 270M, LFM2.5 230M y Apple FM, siendo entre 5 y 70 veces mas pequeno y empleando 2 bits frente a los 16 bits de esos modelos. Los datos de velocidad de decodificacion si se detallan:

| Plataforma | Velocidad de decodificacion |
|---|---|
| Raspberry Pi 5 | 500 tokens/s |
| Visores VR (Meta Quest 3S, Apple Vision Pro) | 400-1.500 tokens/s |
| Telefonos por debajo de 200 dolares (gama A de Samsung) | 300-700 tokens/s |

| Modelo | Parametros | Cuantizacion | Resultado comparativo |
|---|---|---|---|
| Needle 2 | 45 M | CQ2-bit | Referencia; intercambia victorias con los siguientes segun el autor |
| FunctionGemma 270M | 270 M | f16 | Sin cifras publicadas en la informacion disponible |
| LFM2.5 230M | 230 M | f16 | Sin cifras publicadas en la informacion disponible |
| Apple FM | No disponible | f16 | Sin cifras publicadas en la informacion disponible |

No se han publicado resultados de benchmarks con cifras concretas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el sentido convencional; el modelo esta pensado para CPU y ejecucion en el propio dispositivo. El binario ocupa 14 MB y la sesion pico ronda los 28 MB de RAM.
- Memoria en microcontroladores: el autor indica que alcanza el ESP32-P4, y que terceros han reportado ejecuciones en ESP32-S3 en torno a 11 MB.
- GPU recomendadas: no disponibles; el modelo no plantea requisitos de GPU. El catalogo de plataformas objetivo son CPU ARM64, x86-64, ARMv7 y RISC-V, ademas de WebAssembly.
- Compatibilidad con GPU de consumo: irrelevante para este modelo, ya que su objetivo son dispositivos de borde; no se documenta soporte CUDA ni uso de RTX 4090, A100 o H100.
- Opciones de despliegue: libreria `cactus-needle` mediante `pip install cactus-needle` con API Python (`needle.tool`, `needle.Needle`, `agent.run()`, `needle.extract()`), binario autocontenido generado por su propio motor y compilacion a WebAssembly. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no es safetensors ni GGUF.
- Latencia y throughput: 500 tokens/s en Raspberry Pi 5; 400-1.500 tokens/s en Meta Quest 3S y Apple Vision Pro; 300-700 tokens/s en telefonos de gama baja tipo Samsung A-Series. No se detallan cifras de latencia por peticion ni de rendimiento en x86-64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Prestaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Needle 2 | 45 M | 256 tokens (ventana deslizante) | Intercambia victorias con los modelos de abajo segun el autor, con 5x-70x menos parametros y 2 bits | Apache 2.0 | HuggingFace (SBDO1/needle2), libreria `cactus-needle` y repositorio en GitHub |
| FunctionGemma 270M | 270 M | No disponible | Comparable a Needle 2 segun el autor, en f16 | No disponible | No disponible en la informacion proporcionada |
| LFM2.5 230M | 230 M | No disponible | Comparable a Needle 2 segun el autor, en f16 | No disponible | No disponible en la informacion proporcionada |
| Apple FM | No disponible | No disponible | Comparable a Needle 2 segun el autor, en f16 | No disponible | No disponible en la informacion proporcionada |

Los datos de contexto, licencia y disponibilidad de los tres modelos de comparacion no aparecen en la informacion proporcionada, por lo que la comparativa queda limitada al recuento de parametros y al regimen de cuantizacion.

## Limitaciones y advertencias

- La ventana de contexto es de solo 256 tokens con ventana deslizante. Aunque la memoria permanece acotada, el modelo no puede razonar sobre conversaciones o documentos largos; el diseno prioriza la memoria estable frente a la profundidad de contexto.
- El modelo esta orientado a tool calling y extraccion estructurada. No se documentan capacidades de generacion abierta, razonamiento general, codigo, matematicas, vision ni audio, por lo que no debe evaluarse como un LLM de proposito general.
- La model card no declara idiomas soportados. La cobertura multilingue es, por tanto, no disponible y requiere validacion propia antes de desplegar en produccion en idiomas distintos del ingles, dado que los ejemplos de la documentacion estan en ingles.
- La eficacia depende criticamente de la calidad de las descripciones de las herramientas: el propio autor afirma que "describirlas bien es todo el juego". Esquemas pobres degradan la seleccion de herramienta y el relleno de argumentos.
- La puntuacion de confianza procede de una cabeza aprendida calibrada; para usarla como umbral de escalado en produccion hace falta validar la calibracion con datos propios del dominio.
- No se han publicado cifras numericas de benchmarks ni cartas de evaluacion de sesgos, toxicidad o robustez. No hay informacion sobre composicion del dataset de entrenamiento, numero de tokens ni uso de RLHF o DPO.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La gramatica restringe el formato y los valores, pero no garantiza que la herramienta elegida sea la correcta ni que los argumentos sean semanticamente adecuados.
- La fecha de creacion y actualizacion del repositorio figura como 2026-09-20, con 0 descargas y 1 like, lo que indica adopcion practicamente nula y ausencia de validacion independiente por parte de la comunidad.
- El repositorio ocupa 1.1 GB pese a que el binario del modelo es de 14 MB, presumiblemente por los recursos graficos de la model card; conviene tenerlo en cuenta en entornos con almacenamiento limitado.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios. No se declaran restricciones adicionales.
- El texto de la model card proporcionado esta truncado (la seccion final sobre el uso manual de `tools.json` queda cortada), por lo que puede faltar informacion operativa.

## Enlaces

- HuggingFace: https://huggingface.co/SBDO1/needle2
- Repositorio con codigo fuente, motor y codigo de entrenamiento: https://github.com/cactus-compute/needle
- Paper de Simple Attention Network: https://arxiv.org/abs/2607.18363
- No se han encontrado enlaces relevantes adicionales en la busqueda web realizada.
