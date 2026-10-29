# eduardoworrel/alias3-micro-1026-LiteRT

## Resumen

`eduardoworrel/alias3-micro-1026-LiteRT` es una conversión al formato LiteRT (antes TensorFlow Lite) del modelo `aliasrobotics/alias3-micro-1026`, un LLM de 4B parámetros de Alias Robotics orientado a decisiones de ciberseguridad. El autor de la conversión (eduardoworrel) empaqueta los pesos en cuatro cuantizaciones distintas —int4 con bloque 32, int4 con bloque 64, int8 por canal y fp16— y los publica como grafos ejecutables con `@litertjs/core` 2.6.0, con los pesos transmitidos en streaming hacia buffers de WebGPU. El objetivo es claro: ejecutar el modelo dentro de un navegador, sin backend, manteniendo expuesta la hidden state para que las cabezas de decisión ("System 1") del modelo original sigan funcionando.

El modelo base no es un generador de texto al uso. Según la model card y el paper asociado (arXiv:2610.16550), implementa un esquema de doble proceso (System 1 / System 2, en la línea de Kahneman) con una interfaz de *pointer heads* bilineales inspirada en los pointer networks de Vinyals et al. (arXiv:1506.03134) y en la línea Jev / System One de TypeSafe AI. La conversión preserva esa interfaz: además del grafo principal, cada carpeta incluye ficheros `head.bin` y `head_score.bin` que leen el estado oculto para producir respuestas de tipo sí/no, elección múltiple y severidad.

La relevancia de esta publicación es de ingeniería más que de modelado: demuestra que un modelo de 4B con arquitectura híbrida (se menciona explícitamente un Gated-DeltaNet descompuesto durante la conversión) puede caber en el límite de 4 GiB por buffer de WebGPU usando int4, con un coste de unos 5,3 s por decisión en Chrome sobre un Apple M2 Pro. Es, por tanto, una pieza de despliegue en el edge, no un checkpoint de entrenamiento nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes Gated-DeltaNet (descompuesto en la conversion); no se detalla la composicion completa |
| Parametros totales | 4B (dato del modelo base en LLM Explorer; no se explicita en la model card) |
| Parametros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | 256K tokens (dato del modelo base, via LLM Explorer; no confirmado en la model card) |
| Tipos de cuantizacion | int4 bloque 32 (por defecto), int4 bloque 64, int8 por canal, fp16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite` con pesos externalizados en las builds enteras), ejecutable con `@litertjs/core` 2.6.0; existen builds hermanas en ONNX y MLC |
| Tamano del repositorio | 18,6 GB segun la API de HuggingFace (22,4 GB en el arbol de ficheros) |
| Libreria declarada | litert.js |
| Pipeline | text-generation |
| Modelo base | aliasrobotics/alias3-micro-1026 (relacion: quantized) |

## Arquitectura y entrenamiento

No se aportan datos de entrenamiento en la informacion disponible: no hay numero de tokens, composicion del dataset, ni mención a RLHF/DPO. Lo que si se documenta es el proceso de conversion, que revela parte de la arquitectura interna: `litert-torch` en el commit `f61d0b7` mas parches propios del autor, con la repeticion de cabezas GQA implementada como CONCATENATION, una salida de hidden state anadida explicitamente y un bloque Gated-DeltaNet descompuesto para que el conversor lo acepte. Los pesos de las capas FullyConnected se cuantizan con `ai_edge_quantizer` y, en las builds enteras, se externalizan para poder transmitirse como buffers externos.

El rasgo arquitectonico diferencial del modelo base es la interfaz de decision tipada: un esquema System 1 / System 2 con cabezas de pointer network que seleccionan directamente sobre el vocabulario o sobre las opciones en lugar de generar texto libre. La conversion mantiene esa separacion en forma de ficheros de cabeza independientes (`head.bin` para si/no y eleccion multiple, `head_score.bin` para severidad), que se aplican sobre la hidden state expuesta por el grafo LiteRT. El empaquetado final usa lo que el autor llama "route-B rebundle".

## Capacidades

- Generacion de texto y clasificacion de decisiones de ciberseguridad (si/no, eleccion multiple entre opciones, severidad en escala ±1).
- Doble modo de lectura: directa desde los logits del modelo o mediante las cabezas de decision sobre el estado oculto.
- Interfaz de pointer head bilineal para seleccion sobre opciones, heredada de la linea TypeSafe AI / Jev.
- Ejecucion en navegador via WebGPU con `@litertjs/core`; integracion con el SDK `ct0-edge` mediante `runtime: "litert"`.
- Streaming de pesos a buffers de WebGPU, lo que permite cargar modelos cuyos pesos no caben comodos en memoria del grafo.
- Soporte de cuantizacion multiple sobre el mismo grafo (cuatro builds intercambiables).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- No se documentan capacidades multilingues; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Clasificacion de alertas de seguridad en el navegador: un analista abre una consola web y el modelo evalua indicadores uno a uno con la cabeza de si/no, sin enviar datos a un servidor. Apropiado porque los pesos int4 (2,10 GB) se cargan en WebGPU y la decision se lee del logits o de `head.bin`.
- Triaje de severidad en herramientas SOC ligeras: usar `head_score.bin` para asignar severidad ±1 a un caso concreto. Adecuado por la existencia de una cabeza dedicada, aunque el propio autor advierte que es una prueba de concepto.
- Clasificacion de opciones en asistentes de respuesta a incidentes: dada una lista cerrada de acciones posibles, la cabeza de eleccion multiple selecciona una, evitando generar texto libre y el riesgo de formato invalido.
- Demostraciones y formacion en ciberseguridad dentro del navegador: entornos de practica donde no se puede instalar infraestructura GPU y se necesita un modelo que razone sobre casos con la hidden state accesible.
- Prototipado de SDKs edge: `ct0-edge` lo carga con `runtime: "litert"`, lo que permite comparar latencia y fidelidad frente a las builds ONNX y MLC del mismo modelo antes de fijar una ruta de despliegue.
- Evaluacion de cuantizaciones en condiciones reales de cliente: las cuatro builds permiten medir en el mismo hardware la perdida de fidelidad de int4 frente a int8 (8,7% de respuestas cambiadas frente a 21,5%) antes de decidir el empaquetado de produccion.
- Sustitucion de backend en aplicaciones web que ya usan `@litertjs/core` para otros modelos: el grafo es compatible con el mismo runtime y no requiere servidor de inferencia.

## Benchmarks y rendimiento

Precision compuesta declarada por el autor (si/no + eleccion multiple + severidad ±1, sobre el conjunto de decisiones):

| Build | Precision compuesta |
|---|---|
| int8 | 87,2 |
| fp16 | 85,9 |
| int4 (bloque 32) | 83,8 |
| int4 (bloque 64) | 83,1 |

Detalle por modo (aciertos / total). Lectura por defecto: si/no desde logits, eleccion multiple desde `head.bin`, severidad desde `head_score.bin`:

| Fichero | Si/no (65) logits | Si/no (65) head | Elec. multiple (57) logits | Elec. multiple (57) head | Severidad (50) exacta logits | Severidad (50) exacta head | Severidad (50) ±1 head | Respuestas cambiadas vs original |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | 47/50 | — |
| `litert/int4` | 56/65 | 53/65 | 32/57 | 41/57 | 19/50 | 26/50 | 49/50 | 21,5% |
| `litert/int8` | 54/65 | 54/65 | 41/57 | 47/57 | 21/50 | 21/50 | 48/50 | 8,7% |
| `litert/int4-b64` | 57/65 | 53/65 | 32/57 | 42/57 | 20/50 | 20/50 | 47/50 | 26,2% |
| `litert/fp16` | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3% |

Rendimiento en navegador (Chrome 156, WebGPU, Apple M2 Pro, adaptador Metal-3, `maxBufferSize` 4.294.967.292 bytes):

| Build | Cabe en WebGPU | Tiempo de carga | Tiempo por decision (mediana · maximo) | Coincidencia con CPU nativa |
|---|---|---|---|---|
| `litert/int4` (b32) | Si | 19,6 s | 5,3 s · 22,5 s | 159/172 |
| `litert/int8` | Si | 46,4 s | 5,6 s · 30,1 s | 161/172 |
| `litert/int4-b64` | Si | 23,5 s | 4,7 s · 25,4 s | 154/172 |
| `litert/fp16` | No | — | — | Solo CPU nativa (grafo de 8,43 GB) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en precision nativa: 8,4 GB (dato de LLM Explorer para `aliasrobotics/alias3-micro-1026`).
- Build de navegador int4: 3,66 GB en total, de los cuales 2,10 GB son pesos int4 transmitidos a WebGPU. Cabe en el limite de 4 GiB por buffer de WebGPU.
- Build int8: cabe en WebGPU, con carga notablemente mas lenta (46,4 s frente a 19,6 s del int4).
- Build fp16: 8,43 GB de grafo, por encima del limite de 4 GiB por buffer medido; no es viable en navegador, solo en CPU nativa.
- GPU validadas: Apple M2 Pro (Metal-3) con Chrome 156. No se documentan pruebas en A100, H100 ni RTX 4090; para el modelo base, LLM Explorer indica 8,4 GB de VRAM, lo que lo situaria al alcance de GPUs consumer de gama alta con 12-16 GB, aunque no hay validacion publicada en esta informacion.
- Despliegue en navegador: `@litertjs/core` 2.6.0, a traves de `ct0-edge` con `runtime: "litert"`. Solo WebGPU; no hay ruta WASM/CPU para el modelo de 4B en navegador.
- Alternativas de despliegue del mismo modelo: ONNX con transformers.js, ONNX con GenAI, ONNX decode-only, MLC q4f32_1 y MLC q4f16_1, en repositorios hermanos.
- Latencia: ~5,3 s por decision (mediana) en el build int4 por defecto, con maximos de 22,5 s. La build GenAI es aproximadamente 10 veces mas rapida (~0,5 s por decision), motivo por el que `ct0-edge` no la selecciona con el modo `"auto"`.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros comparables en la categoria de decision en ciberseguridad. La comparacion se limita a las builds del mismo modelo:

| Variante | Parametros | Contexto | Precision compuesta | Latencia por decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LiteRT int4 (esta ficha) | 4B | 256K (base) | 83,8 | 5,3 s (M2 Pro, Chrome) | Apache 2.0 | HuggingFace |
| LiteRT int8 | 4B | 256K (base) | 87,2 | 5,6 s | Apache 2.0 | HuggingFace |
| LiteRT fp16 | 4B | 256K (base) | 85,9 | No ejecutable en WebGPU | Apache 2.0 | HuggingFace |
| ONNX GenAI (hermano) | 4B | 256K (base) | No disponible | ~0,5 s | Apache 2.0 | HuggingFace |
| Base PyTorch bf16 | 4B | 256K (base) | Referencia | No disponible | Apache 2.0 | HuggingFace (aliasrobotics) |

## Limitaciones y advertencias

- Los pesos del modelo base estan etiquetados por Alias Robotics como "research preview"; no es un modelo validado para produccion critica.
- El conjunto de evaluacion es muy pequeno: 65 preguntas de si/no, 57 de eleccion multiple y 50 de severidad. El propio autor senala que solo detecta perdidas grandes: 0 de 32 tests pareados (McNemar, con y sin correccion de Holm) resultan estadisticamente distinguibles del original.
- La cabeza de severidad (`head_score.bin`) es una prueba de concepto ajustada sobre 30 casos sinteticos; usarla como scorer real exige un conjunto etiquetado mayor e independiente.
- Las builds de 4 bits pierden capacidad en eleccion multiple al leer desde logits (32/57 frente a 39/57 del original); la cabeza recupera parte de esa perdida.
- Entre el 2,3% y el 26,2% de las decisiones individuales cambian respecto al original segun la cuantizacion, aunque la precision agregada no se distinga estadisticamente.
- Las builds de navegador son exclusivamente WebGPU, sin ruta WASM/CPU, y solo se validaron en Chrome 156 sobre Apple M2 Pro. Otros navegadores, GPUs o versiones de Chrome no estan verificados.
- El build fp16 no cabe en el limite de 4 GiB por buffer de WebGPU medido en ese hardware.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de ciberseguridad; se desconoce el riesgo de alucinacion en generacion de texto libre.
- Licencia Apache 2.0 en el repositorio de la conversion, heredada del modelo base; no se documentan restricciones adicionales de uso comercial, pero conviene verificar la licencia del checkpoint original.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT
- Arbol de ficheros: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT/tree/main
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper del modelo base: https://arxiv.org/abs/2610.16550
- Pointer networks (Vinyals et al., 2015): https://arxiv.org/abs/1506.03134
- Documentacion de TypeSafe AI: https://docs.typesafe.ai
- Paquete `@litertjs/core`: https://www.npmjs.com/package/@litertjs/core
- SDK `ct0-edge`: https://github.com/eduardoworrel/ct0-edge
- `ct0-edge`, README: https://github.com/eduardoworrel/ct0-edge/blob/main/README.md
- Build ONNX · transformers.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Build ONNX · GenAI: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Build ONNX · decode-only: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Build MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Build MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/aliasrobotics%2Falias3-micro-1026,4blf2l2TXTivhkOEjQYCOd
