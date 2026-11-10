# denkbox/strands-decider-2B-qwen3.5-v1-2610-Q8_0-GGUF

## Resumen

`strands-decider-2B-qwen3.5-v1-2610-Q8_0-GGUF` es una distribucion en formato GGUF Q8_0 del modelo `StrandsAgents/strands-decider-2B-qwen3.5-v1-2610`, desarrollado por el equipo de Strands Agents. No se trata de un modelo conversacional: es un "decider" construido sobre Qwen3.5-2B-Base al que se le ha fusionado un adaptador LoRA y que se utiliza como extractor de caracteristicas (embeddings) con pooling de tipo `last`. Su funcion es convertir prompts e inputs en estados ocultos que, procesados por una cabeza auxiliar (`head.safetensors`), producen decisiones.

El repositorio lo publica el usuario `denkbox` como espejo del GGUF original de `ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF` (revision `6ed4ed01`), e incluye los ficheros necesarios para ejecutarlo: el torso cuantizado, la cabeza en safetensors y un cliente en Python (`decide.py`) que usa numpy para transformar los hidden states en respuestas.

Con 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y un tamano de repositorio de 2,0 GB, el modelo esta pensado para despliegues ligeros mediante `llama-server` en modo embeddings con una ventana de contexto de 8192 tokens. Su licencia Apache-2.0 facilita la integracion en productos comerciales, aunque su naturaleza de componente interno (no de modelo generativo) limita los casos de uso a sistemas de decision y clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B-Base) con adaptador LoRA fusionado y cabeza de decision auxiliar; pooling `last` |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion indicada para `llama-server`) |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base admite otras cuantizaciones GGUF, no detalladas en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (torso) + safetensors (cabeza `head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso de aproximadamente 1,88 mil millones de parametros, sobre el que se ha fusionado un LoRA especifico del "decider" desarrollado por Strands Agents. La salida del transformer no se usa para generar texto, sino como representacion vectorial: el pooling configurado es `last`, de modo que se toma el estado oculto de la ultima posicion como embedding del input. Sobre esa representacion actua `head.safetensors`, una cabeza de prediccion que convierte el vector en la decision final. El cliente `decide.py` implementa ese paso en numpy.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del proceso de entrenamiento del LoRA en la informacion proporcionada. La innovacion principal del artefacto es de empaquetado y despliegue: separa el torso (servido como modelo de embeddings por `llama-server`) de la cabeza (ejecutada en Python), lo que permite reutilizar la infraestructura de llama.cpp para la parte pesada y mantener la logica de decision en un fichero de pesos ligero.

## Capacidades

- Extraccion de embeddings mediante `llama-server --embeddings` con pooling `last`.
- Generacion de decisiones a partir de prompts e inputs, combinando los hidden states del torso con la cabeza `head.safetensors` a traves de `decide.py`.
- Integracion como entrada de catalogo en Lemonade (`recipe: llamacpp`, etiqueta `embeddings`).
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No es un modelo de chat: no genera texto libre de forma nativa.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion y enrutado de peticiones: usar el modelo como extractor de embeddings para representar la entrada y que la cabeza produzca una decision discreta (por ejemplo, elegir que agente o herramienta debe atender una consulta), aprovechando el contexto de 8192 tokens para entradas largas.
- Filtrado previo en pipelines de agentes: colocar el decider como primera etapa que decide si una peticion requiere razonamiento complejo, busqueda externa o respuesta directa, reduciendo el coste de invocar modelos mayores.
- Moderacion y etiquetado semantico: generar embeddings de mensajes y usar la cabeza para asignar categorias, con despliegue en CPU o GPU modesta gracias al formato Q8_0 y al tamano de 2 GB.
- Busqueda semantica y recuperacion: servir el torso como modelo de embeddings en `llama-server` e indexar documentos para RAG, con pooling `last` y contexto de 8192 tokens por fragmento.
- Despliegue en el borde o en portatiles: al caber en 2 GB de pesos Q8_0, puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp, integrado en aplicaciones de escritorio a traves de Lemonade.
- Evaluacion y experimentacion con deciders: el repositorio incluye `decide.py` y la cabeza separada, lo que permite sustituir o reentrenar la cabeza sin volver a cuantizar el torso, agilizando iteraciones de investigacion.
- Sistemas de decision de bajo coste en produccion: al no requerir generacion autoregresiva, la inferencia es una sola pasada por el transformer, con menor latencia que un modelo generativo del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para los pesos Q8_0, mas overhead del contexto (8192 tokens) y de la KV cache; en la practica, entre 3 y 5 GB segun batch y backend.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien A100/H100 para despliegues con alta concurrencia.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: `llama-server` (llama.cpp) con `--embeddings -c 8192 -b 4096 -ub 4096`; entrada de catalogo en Lemonade con `recipe: llamacpp`; el cliente `decide.py` requiere `numpy` y `safetensors`.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una sola pasada sin decodificacion autoregresiva, se espera una latencia inferior a la de un modelo generativo equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610 Q8_0 | 1,88 B | 8192 | GGUF + safetensors | Apache-2.0 | Decider con cabeza auxiliar, no generativo |
| Qwen3.5-2B-Base | aprox. 2 B | no disponible | safetensors | no disponible | Modelo base del que deriva; generativo |
| Modelos de embeddings de ~2 B (p. ej. familia BGE/E5 de gran tamano) | 1-3 B | variable | safetensors/GGUF | variable | Uso generico de recuperacion, sin cabeza de decision |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo de chat ni genera texto: usarlo como generador produce resultados incorrectos; requiere `decide.py` y `head.safetensors` para funcionar.
- El repositorio es un espejo de terceros (`denkbox`) del GGUF original de `ArminBurkhardt`; conviene verificar la integridad y procedencia antes de usarlo en produccion.
- Solo se distribuye la cuantizacion Q8_0; no se documentan otras variantes en este repositorio.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo base Qwen3.5-2B y no esta verificado.
- Riesgo de sesgos y alucinacion heredado del modelo base y del dataset de entrenamiento del LoRA, no documentado.
- La cabeza de decision se ejecuta en Python con numpy, lo que anade un paso fuera del servidor de inferencia y puede afectar a la latencia en despliegues de alta concurrencia.
- Aunque la licencia es Apache-2.0, deben revisarse las condiciones del modelo base Qwen3.5-2B-Base y del repositorio fuente antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/denkbox/strands-decider-2B-qwen3.5-v1-2610-Q8_0-GGUF
- Modelo fuente (Strands Agents): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Repositorio GGUF original: https://huggingface.co/ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF
- Lemonade (catalogo de modelos): no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
