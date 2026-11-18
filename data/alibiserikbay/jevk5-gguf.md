# alibiserikbay/JevK5-GGUF

## Resumen

JevK5-GGUF es la distribucion en formato GGUF de la familia de modelos JevK5, desarrollada por alibiserikbay y publicada bajo licencia Apache-2.0. No es un modelo generativo al uso: se trata de un modelo de decision ("decision-model", etiquetado como *system-one*) que recibe un documento y una pregunta de tipo si/no, eleccion multiple o puntuacion, y devuelve en un unico paso hacia delante una probabilidad para cada opcion, sin generar texto. La respuesta se obtiene leyendo los log-probabilidades del siguiente token correspondiente a las letras de cada opcion.

El repositorio agrupa cuantizaciones de tres variantes del modelo base: JevK5 (4B), JevK5-9B y JevK5-2B. El modelo de mayor tamano del que se dispone de recuento real de parametros es el de 1.881.825.088 parametros (aproximadamente 1,9B), correspondiente a la variante 2B. La propuesta de valor es permitir inferencia en GPU de consumo, GPU integradas (NVIDIA, AMD, Intel, Apple Metal) e incluso CPU, manteniendo una fidelidad alta respecto a los pesos bf16 de referencia.

Su relevancia actual radica en que ofrece una alternativa abierta a Jev de TypeSafe (sin afiliacion) para tareas de clasificacion y decision tipada con calibracion de probabilidades, un nicho donde los LLM generativos son caros e imprecisos. El autor valida cada fichero cuantizado contra su version sin cuantizar sobre 231 decisiones publicas de JevBench y solo publica aquellos que coinciden en al menos el 95% de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision tipo *system-one*; pesos transformer, detalle no especificado) |
| Parametros totales | 1.881.825.088 (variante 2B); 4B y 9B segun nombre de variante |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M (y referencia bf16 sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); referencia bf16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de decision con enfoque *system-one*: produce una distribucion de probabilidad sobre las opciones en un unico paso hacia delante, leyendo los log-probabilidades del siguiente token asociado a cada letra de respuesta. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion del dataset de entrenamiento.

El proceso de publicacion de las cuantizaciones si esta documentado con rigor: cada fichero GGUF se evalua contra su equivalente bf16 sobre las 231 decisiones publicas de JevBench, midiendo la tasa de coincidencia de respuesta y la precision por nivel de dificultad (facil, estandar, dificil). Se descartan los ficheros con menos del 95% de coincidencia. Ademas, cada variante requiere sus propias temperaturas de calibracion (`temperature` y `knockout_temperature`), lo que sugiere un ajuste de calibracion especifico por modelo y version. No se mencionan RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Decision tipada: responde preguntas de tipo si/no, eleccion multiple y puntuacion devolviendo una probabilidad por opcion.
- Clasificacion de documentos: lee un texto y lo asigna a una de las categorias definidas en los criterios.
- Salida calibrada: la respuesta es una distribucion de probabilidad, no texto generado, lo que permite umbrales y analisis de confianza.
- Soporte de mas de 16 opciones mediante el parametro `knockout_temperature` (requiere jevk5 0.3.0 o superior).
- Ejecucion en un unico paso hacia delante, sin generacion autoregresiva de texto.
- Compatibilidad con llama.cpp en GPU NVIDIA, AMD, Intel y Apple (Metal) y en CPU.
- Integracion mediante el runtime `JevK5GGUF` del paquete `jevk5` o mediante un cliente independiente de biblioteca estandar.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificacion de tickets de soporte: dado el texto de una incidencia y un conjunto de criterios (por ejemplo, categoria o severidad), el modelo devuelve la probabilidad de cada etiqueta en una sola pasada, lo que permite enrutar automaticamente y priorizar por confianza.
- Verificacion de datos en logistica: el ejemplo de la model card evalua si un pedido fue entregado o mal entregado comparando direcciones; el modelo asigna probabilidad a "delivered", "misdelivered" o "unknown", adecuado para auditoria de registros.
- Moderacion y filtrado de contenido: preguntas de tipo si/no sobre un texto permiten construir un clasificador binario calibrado con umbral ajustable, sin coste de generacion.
- Enrutamiento en pipelines de agentes: usar el modelo como arbitro rapido que decide entre opciones discretas (herramienta A, herramienta B, escalar a humano) antes de invocar un LLM mayor.
- Analisis de encuestas y respuestas abiertas: puntuacion de textos segun criterios definidos, aprovechando la salida probabilistica para agregar resultados con intervalos de confianza.
- Despliegue en entornos sin GPU: la variante 2B Q8_0 (2,01 GB) permite ejecutar decisiones cortas en CPU con baja latencia, util para servicios edge o portatiles.
- Evaluacion de conformidad documental: comprobar si un contrato o formulario cumple una lista de criterios binarios, con la probabilidad como medida de certeza para revision humana.

## Benchmarks y rendimiento

Resultados sobre las 231 decisiones publicas de JevBench (coincidencia con bf16 y precision por nivel):

| Fichero | Modelo | Tamano | Coincidencia con bf16 | Facil | Estandar | Dificil |
|---|---|---:|---:|---:|---:|---:|
| `jevk5-4b-v0.3-Q8_0.gguf` | JevK5 v0.3 (4B) | 4,48 GB | 229 / 231 | 1,000 | 0,944 | 0,784 |
| `jevk5-4b-v0.3-Q5_K_M.gguf` | JevK5 v0.3 (4B) | 3,07 GB | 224 / 231 | 1,000 | 0,944 | 0,784 |
| `jevk5-4b-v0.3-Q4_K_M.gguf` | JevK5 v0.3 (4B) | 2,71 GB | 221 / 231 | 1,000 | 0,917 | 0,766 |
| `jevk5-9b-v0.3.3-Q8_0.gguf` | JevK5-9B v0.3.3 | 9,53 GB | 229 / 231 | 1,000 | 0,958 | 0,766 |
| `jevk5-9b-v0.3.3-Q5_K_M.gguf` | JevK5-9B v0.3.3 | 6,47 GB | 228 / 231 | 1,000 | 0,958 | 0,757 |
| `jevk5-9b-v0.3-Q8_0.gguf` | JevK5-9B v0.3 | 9,53 GB | 229 / 231 | 1,000 | 0,944 | 0,721 |
| `jevk5-9b-v0.3-Q5_K_M.gguf` | JevK5-9B v0.3 | 6,47 GB | 225 / 231 | 1,000 | 0,944 | 0,703 |
| `jevk5-4b-v0.2-Q8_0.gguf` | JevK5 v0.2 (4B) | 4,48 GB | 228 / 231 | 1,000 | 0,958 | 0,721 |
| `jevk5-4b-v0.2-Q4_K_M.gguf` | JevK5 v0.2 (4B) | 2,71 GB | 219 / 231 | 1,000 | 0,931 | 0,730 |
| `jevk5-2b-v0.2-Q8_0.gguf` | JevK5-2B | 2,01 GB | 226 / 231 | 1,000 | 0,792 | 0,622 |

Referencias bf16: JevK5 v0.3 (4B) 8,4 GB con 1,000 / 0,944 / 0,784; JevK5-9B v0.3.3 17,9 GB con 1,000 / 0,958 / 0,775; JevK5-9B v0.3 17,9 GB con 1,000 / 0,944 / 0,730; JevK5 v0.2 (4B) 8,4 GB con 1,000 / 0,958 / 0,739; JevK5-2B 3,8 GB con 1,000 / 0,806 / 0,604.

Ficheros descartados por no alcanzar el 95% de coincidencia: 9B v0.3.3 Q4_K_M (222/231, dificil 0,730), 9B v0.3 Q4_K_M (218/231) y 2B Q4_K_M (29 respuestas cambiadas, dificil de 0,604 a 0,514).

## Requisitos de hardware

- VRAM estimada: desde unos 2 GB (2B Q8_0) hasta unos 10 GB (9B Q8_0), segun fichero.
- GPU recomendadas: cualquier GPU con 6 GB o mas para el 4B Q8_0; 9,5 GB o mas para el 9B Q8_0; soporte de NVIDIA, AMD, Intel y Apple (Metal).
- GPU de consumo: si, el 4B Q4_K_M (2,71 GB) y el 2B Q8_0 (2,01 GB) caben en GPUs de gama media y en equipos con memoria unificada.
- CPU: la variante 2B Q8_0 es la opcion mas rapida sin GPU; el 4B Q8_0 tarda aproximadamente 0,6 s por decision corta en CPU.
- Despliegue: `llama-server` de llama.cpp (necesario porque expone los log-probabilidades); ejemplo `llama-server --hf-repo alibiserikbay/JevK5-GGUF --hf-file jevk5-4b-v0.3-Q8_0.gguf -c 8192 -ngl 99`.
- Cliente: paquete `jevk5` (`pip install --no-deps "jevk5 @ git+https://github.com/allebee/jevk5@v0.3.3"`) o cliente independiente de biblioteca estandar.
- Throughput: no disponible; solo se documenta la latencia aproximada de 0,6 s por decision corta en CPU para el 4B Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevK5-GGUF (4B / 9B / 2B) | 1,9B (2B); 4B y 9B por variante | no disponible | Decision tipada con probabilidades | Apache-2.0 | Hugging Face, GGUF |
| Jev (TypeSafe) | no disponible | no disponible | Decision tipada | no disponible | Comercial (sin afiliacion) |
| LLM generativos de 2B-9B | 2B-9B | variable | Generacion de texto | variable | amplia |

La comparacion con Jev de TypeSafe es la referencia directa que cita el autor como alternativa abierta; no se dispone de especificaciones publicas de ese modelo en la informacion proporcionada. Frente a LLM generativos del mismo rango de parametros, la diferencia es funcional: JevK5 no genera texto y devuelve una distribucion calibrada en una sola pasada, lo que lo hace mas barato y determinista para clasificacion, pero inutil para generacion libre.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- No es un modelo generativo: no produce texto libre, codigo ni razonamiento multi-paso.
- Requiere `llama-server` para acceder a los log-probabilidades; no funciona con clientes que no las expongan.
- Cada fichero necesita sus propias temperaturas de calibracion; usar valores incorrectos degrada la calibracion.
- Las cuantizaciones Q4_K_M de 9B y 2B no se publicaron por perdida de fidelidad; el 2B Q4_K_M cae de 0,604 a 0,514 en el nivel dificil.
- La precision en el nivel dificil es moderada (0,622-0,784), por lo que en casos complejos conviene revision humana.
- Riesgo de sesgo y alucinacion no documentado en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero no se detallan condiciones adicionales ni datos de entrenamiento que permitan evaluar sesgos.
- No afiliado a TypeSafe AI; la comparacion con Jev es responsabilidad del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/alibiserikbay/JevK5-GGUF
- Modelo base JevK5 (4B): https://huggingface.co/alibiserikbay/JevK5
- Modelo base JevK5-9B: https://huggingface.co/alibiserikbay/JevK5-9B
- Modelo base JevK5-2B: https://huggingface.co/alibiserikbay/JevK5-2B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Runtime jevk5: https://github.com/allebee/jevk5
