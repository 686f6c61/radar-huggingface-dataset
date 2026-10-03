# ramgpt/Agents-A1-4B-EXL3

## Resumen

Agents-A1-4B-EXL3 es una version cuantizada a 4 bits del modelo InternScience/Agents-A1-4B, publicada por el usuario ramgpt. Se trata de una conversion a formato EXL3 (ExLlamaV3) con una tasa objetivo de 4.00 bpw, generada con el script oficial `convert.py` de ExLlamaV3 y validada localmente antes de su publicacion. El modelo base es un modelo denso orientado a tareas agenticas de horizonte largo, desarrollado por InternScience, que segun la documentacion publica rinde de forma cercana a modelos mucho mayores en busqueda de horizonte largo, ingenieria, investigacion y seguimiento de instrucciones.

La arquitectura declarada en la model card es `Qwen3_5ForConditionalGeneration`, es decir, un transformer decoder-only de la familia Qwen3.5. El recuento real de parametros segun el archivo safetensors es de 1.976.184.832 (aproximadamente 1,98 B), aunque el modelo se comercializa bajo la denominacion "4B"; esta discrepancia entre el nombre y el recuento medido conviene tenerla en cuenta. El modelo base declara una ventana de contexto de 262.144 tokens, lo que lo situa en el rango de contexto largo dentro de su categoria.

Su relevancia actual radica en que permite ejecutar localmente un modelo agentico de contexto muy largo con un consumo de VRAM reducido gracias a la cuantizacion de 4 bits, validado sobre una RTX 4090 a 23,21 tok/s de decodificacion. La licencia Apache 2.0 facilita su uso comercial, y el formato EXL3 lo orienta a despliegues de inferencia con ExLlamaV3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 1.976.184.832 (~1,98 B, segun safetensors; el modelo base se denomina comercialmente "4B") |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | EXL3 a 4.00 bpw (4 bits); el modelo base dispone de otras variantes cuantizadas en la coleccion Agents-A1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3 para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Agents-A1-4B es un transformer denso de la familia Qwen3.5, con arquitectura declarada `Qwen3_5ForConditionalGeneration`. Segun la informacion publica de InternScience, esta entrenado para razonamiento multi-paso en seis dominios heterogeneos, entre ellos busqueda de horizonte largo, ingenieria, tareas cientificas y agenticas generales, seguimiento de instrucciones e investigacion. El modelo base emplea una ventana de contexto de 262.144 tokens, dimensionada para trayectorias largas de agente.

Existe una discrepancia en las fuentes consultadas sobre la naturaleza del modelo: mientras que la model card de HuggingFace lo describe como un modelo denso de 4B parametros, la pagina de openlm.ai describe la familia Agents-A1 como modelos MoE de horizonte largo (35B y 4B). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas del modelo base mas alla del escalado del horizonte de agente.

La version EXL3 aqui descrita no modifica la arquitectura: es una conversion de pesos al formato EXL3 de ExLlamaV3 a 4.00 bpw, realizada con el `convert.py` oficial (revision de ExLlamaV3 `1.5.2+cu128.torch2.10.0`) sobre la revision `945c40a4aa6f534d434a353207b8d42ecf7a5293` del modelo base, y verificada con una prueba local de carga y generacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente.
- Busqueda de horizonte largo (long-horizon search): capacidad declarada por el autor del modelo base.
- Tareas de ingenieria, investigacion y cientificas de caracter agentico.
- Seguimiento de instrucciones (instruction following).
- Uso de herramientas (tool use) y descomposicion de tareas en pasos.
- Contexto largo de hasta 262.144 tokens, adecuado para trayectorias extensas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo "thinking"): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de agente local con contexto largo: el modelo puede mantener trayectorias de agente extensas apoyandose en su ventana de 262.144 tokens, y su cuantizacion a 4 bpw reduce el coste de VRAM, lo que permite ejecutarlo en una estacion de trabajo con una unica GPU de consumo.
- Automatizacion de busqueda y sintesis de informacion: dado su entrenamiento declarado en busqueda de horizonte largo, se puede usar para encadenar consultas, leer resultados y sintetizar respuestas sobre documentos extensos.
- Seguimiento de instrucciones en pipelines internos: util para tareas de transformacion y clasificacion de texto con instrucciones detalladas, donde el modelo denso de ~2 B ofrece un coste de inferencia bajo.
- Flujos agenticos con tool calling: integracion en orquestadores de agentes que requieran llamadas a funciones y descomposicion de tareas, desplegado sobre ExLlamaV3 o TabbyAPI.
- Prototipado e investigacion en local: al tener licencia Apache 2.0 y un peso reducido, sirve para experimentar con agentes en una sola GPU de consumo (por ejemplo, RTX 4090) sin depender de APIs externas.
- Procesamiento de documentos largos: clasificacion, extraccion o resumen de informes de ingenieria o articulos cientificos que superen la ventana tipica de modelos pequenos.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, permite procesar datos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La fuente benchlm.ai indica que el modelo base Agents-A1-4B dispone de 11 filas de benchmark mostrables desde las fuentes, pero sin una puntuacion global publica; no se incluyen los valores concretos.

El unico dato de rendimiento disponible corresponde a la validacion local de esta conversion EXL3:

| Metrica | Valor |
|---|---|
| Tokens generados en la prueba | 64 |
| Velocidad de decodificacion | 23,21 tok/s |
| GPU | NVIDIA GeForce RTX 4090 |
| Entorno | Torch 2.10.0+cu128, ExLlamaV3 1.5.2+cu128.torch2.10.0 |

El propio autor advierte que esta cifra es una prueba local de humo y no una afirmacion de rendimiento entre sistemas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1 GB a 4.00 bpw para los ~1,98 B parametros, mas el espacio de trabajo de inferencia y la cache KV; en la practica se puede esperar un uso total de aproximadamente 2-3 GB en secuencias cortas.
- Contexto largo: la ventana de 262.144 tokens del modelo base implica un crecimiento notable de la cache KV; a esa longitud, la VRAM requerida sera muy superior a la del modelo en secuencias cortas.
- GPU recomendadas: la validacion se realizo en una NVIDIA RTX 4090. Cualquier GPU NVIDIA con suficiente VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090, A100, H100) es candidata; el modelo cabe con holgura en GPU de consumo en secuencias cortas.
- Despliegue: el formato EXL3 requiere el motor ExLlamaV3; para servirlo como API se puede usar TabbyAPI. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 23,21 tok/s de decodificacion medidos en RTX 4090 con la revision indicada (dato de prueba local, no extrapolable).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ramgpt/Agents-A1-4B-EXL3 | ~1,98 B (segun safetensors) | 262.144 tokens | EXL3 / safetensors (4 bpw) | Apache 2.0 | Cuantizacion EXL3 de la version base |
| InternScience/Agents-A1-4B | No disponible (denominado 4B) | 262.144 tokens | safetensors | Apache 2.0 | Modelo base sin cuantizar; orientado a agentes de horizonte largo |
| Agents-A1-35B | No disponible | no disponible | no disponible | no disponible | Variante mayor de la familia; las fuentes la describen como MoE |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Discrepancia de parametros: el recuento real en safetensors (~1,98 B) no coincide con la denominacion comercial "4B" del modelo base; conviene verificar la adecuacion al caso de uso antes de desplegarlo.
- Discrepancia de arquitectura: las fuentes se contradicen sobre si el modelo base es denso o MoE; la model card de HuggingFace indica denso y openlm.ai lo describe dentro de una familia MoE.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion en la informacion disponible.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue adecuado.
- Contexto: aunque el modelo base declara 262.144 tokens, el rendimiento efectivo a contextos muy largos no esta documentado, y la cache KV a esa longitud supone un coste elevado de VRAM.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribucion y verificar las condiciones del modelo base y de ExLlamaV3.
- Compatibilidad: este artefacto esta pensado para ExLlamaV3; su uso en otros motores de inferencia no esta confirmado y puede no funcionar.
- Madurez: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y el rendimiento publicado proviene de una unica prueba local de 64 tokens, por lo que no debe tratarse como una validacion exhaustiva.
- Sesgos: no se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace (version EXL3): https://huggingface.co/ramgpt/Agents-A1-4B-EXL3
- Modelo base en HuggingFace: https://huggingface.co/InternScience/Agents-A1-4B
- Repositorio GitHub de Agents-A1: https://github.com/InternScience/Agents-A1/
- Pagina de la familia Agents-A1 en openlm.ai: https://openlm.ai/agents-a1/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/agents-a1-4b-internscience
- Benchmarks en benchlm.ai: https://benchlm.ai/models/agents-a1-4b
- ExLlamaV3 (revision citada en la model card: `1.5.2+cu128.torch2.10.0`)
