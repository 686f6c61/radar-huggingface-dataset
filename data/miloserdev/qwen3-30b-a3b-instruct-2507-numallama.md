# miloserdev/Qwen3-30B-A3B-Instruct-2507-numallama

## Resumen

Qwen3-30B-A3B-Instruct-2507-numallama es una conversion del modelo Qwen/Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen, empaquetada por el desarrollador miloserdev para su motor de inferencia propio, numallama. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo conjunto de pesos del Qwen3-30B-A3B-Instruct-2507, cuantizado y serializado en un formato binario propietario que solo funciona con numallama. El objetivo es ejecutar un modelo de mezcla de expertos (MoE) de 30 000 millones de parametros totales y 3000 millones activos en servidores CPU, sin GPU.

La propuesta de valor es el rendimiento en CPU: segun la model card, el formato Q4 alcanza 96 tokens/s en decodificacion sobre una maquina de 2 sockets Ampere Altra Max M128-30 (256 nucleos Neoverse N1), y el Q8 alcanza 73 tokens/s. numallama implementa ejecucion consciente de NUMA a traves de todos los sockets de maquinas multiprocesador, y esta optimizado para ARM64 con productos escalares NEON. En x86-64 y otras arquitecturas funciona con C portable sin optimizar.

Es relevante para quienes despliegan inferencia en infraestructura ARM de servidor (AWS Graviton, Ampere Altra) y quieren evitar el coste de GPU. La contrapartida es fuerte: los ficheros no son GGUF, no funcionan con llama.cpp, Ollama, LM Studio ni transformers, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un proyecto muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de Qwen3-30B-A3B-Instruct-2507; motor de inferencia numallama en C |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3000 millones (3B) |
| Longitud de contexto | no disponible (la model card remite al README de numallama para opciones de contexto) |
| Tipos de cuantizacion | Q4 asimetrico de 4 bits (grupos de 32, escala y minimo en fp16, con importance matrix) y Q8 int8 con escalas por grupo |
| Idiomas soportados | no disponible en la model card; la importance matrix se recolecto sobre texto en ingles, ruso, chino y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | binario propietario de numallama (`.bin`); no es GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-30B-A3B-Instruct-2507, un transformer con mezcla de expertos de 30B parametros totales y 3B activos por token, desarrollado por Qwen (Alibaba). La model card de esta conversion no aporta detalles sobre el entrenamiento original: no indica numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Esa informacion corresponderia a la model card del modelo base, que no se ha proporcionado.

La innovacion tecnica de esta ficha esta en el motor de inferencia, no en el modelo. numallama es un motor en C para servidores CPU con ejecucion consciente de NUMA: distribuye el trabajo entre todos los sockets de una maquina multiprocesador. Esta optimizado para ARM64 con productos escalares NEON (Ampere Altra, AWS Graviton y otros nucleos Neoverse); en otras CPU, incluido x86-64, ejecuta codigo C portable sin optimizar. La cuantizacion Q4 usa grupos de 32 con escala y minimo en fp16 e importance matrix recolectada por numallama sobre ingles, ruso, chino y codigo. El README del motor menciona soporte de decodificacion especulativa y de herramientas (tools), aunque la model card no detalla su funcionamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, en modo chat de terminal o mediante servidor compatible con la API de OpenAI.
- Razonamiento y conocimiento general heredados de Qwen3-30B-A3B-Instruct-2507; la model card no desglosa capacidades concretas.
- Generacion de codigo: la importance matrix de la cuantizacion Q4 incluye texto de codigo, lo que sugiere uso previsto en ese dominio.
- Soporte de herramientas (tools): el README de numallama menciona opciones de tools, pero la model card no especifica el formato ni la fiabilidad.
- Servidor con API compatible con OpenAI en `/v1` (endpoint local, puerto configurable).
- Multilingue: no confirmado para esta conversion; el modelo base Qwen3 es multilingue, pero la model card no lista idiomas soportados.
- Sin soporte de vision ni audio segun la informacion disponible (pipeline text-generation).

## Casos de uso

- Chat en servidor ARM sin GPU: desplegar el modelo en instancias AWS Graviton o servidores Ampere Altra para un asistente conversacional interno, aprovechando los 96 tokens/s en Q4 medidos por el autor en 2 sockets Altra Max.
- Sustitucion de GPU en inference de bajo coste: usar el Q4 de 19,4 GB en un servidor CPU con RAM suficiente para evitar el coste de una GPU dedicada, aceptando menor throughput que en aceleradores.
- Procesamiento de codigo por lotes: tareas de generacion y revision de codigo en pipelines internos, dado que la cuantizacion Q4 incluyo codigo en la importance matrix.
- Servicio local compatible con OpenAI: levantar `./runq ... -m server -P 8080` y apuntar clientes que ya hablan la API de OpenAI, sin cambiar el codigo de integracion.
- Despliegue en maquinas multiprocesador: escenarios donde el reparto NUMA entre sockets es la unica forma practica de servir un MoE de 30B en CPU con latencia aceptable.
- Experimentacion con motores de inferencia alternativos: comparar numallama frente a llama.cpp o vLLM en el mismo hardware para evaluar el coste/beneficio del formato propietario.
- Entornos con requisitos de licencia permisiva: uso comercial sin restricciones adicionales gracias a Apache 2.0, tanto del modelo como de la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son de velocidad de decodificacion, medidos por el autor:

| Fichero | Pesos | Tamano | Decodificacion (tok/s)* |
|---|---|---:|---:|
| `qwen3-30b-a3b-instruct-2507-q4.bin` | Q4 | 19,4 GB | 96 |
| `qwen3-30b-a3b-instruct-2507-q8.bin` | Q8 | 32,4 GB | 73 |

\* Tokens/s para un unico chat, medidos en 2 × Ampere Altra Max M128-30 (256 nucleos Neoverse N1), ambos sockets. Otras maquinas diferiran.

## Requisitos de hardware

- RAM necesaria: al menos 19,4 GB para el Q4 y 32,4 GB para el Q8, mas el espacio del tokenizer (2,2 MB) y el overhead del motor y del contexto.
- CPU: Linux. Optimizado para ARM64 con NEON (Ampere Altra, AWS Graviton, otros Neoverse). En x86-64 y otras arquitecturas funciona con C portable sin optimizar, con rendimiento muy inferior al reportado.
- GPU: no se usa GPU; el motor es exclusivamente CPU.
- Cabe en servidores consumer? No en equipos de escritorio tipicos por RAM, pero si en estaciones de trabajo o servidores con 32 GB o mas de RAM; el rendimiento dependera de la arquitectura de CPU.
- Despliegue: solo numallama (compilado con `make` desde el repositorio de GitHub). No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni transformers.
- Throughput/latencia: 96 tok/s (Q4) y 73 tok/s (Q8) en el hardware de referencia del autor; no hay datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507-numallama | 30B | 3B | no disponible | binario numallama | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (original) | 30B | 3B | no disponible en esta ficha | safetensors | Apache 2.0 | Hugging Face (oficial) |
| Versiones GGUF de Qwen3-30B-A3B | 30B | 3B | segun variante | GGUF | Apache 2.0 | Hugging Face (comunidad) |

La comparativa de rendimiento con alternativas no esta disponible: no hay benchmarks de calidad publicados en la informacion proporcionada, y las cifras de velocidad del autor no son comparables con mediciones en GPU o en otros motores.

## Limitaciones y advertencias

- Formato propietario: los ficheros `.bin` solo funcionan con numallama; no sirven para llama.cpp, Ollama, LM Studio ni transformers. Migrar a otro motor exige descargar el modelo base o una conversion GGUF.
- Rendimiento dependiente de arquitectura: las cifras de 96 y 73 tok/s corresponden a ARM64 con NEON en 2 sockets Altra Max; en x86-64 el codigo es portable y no optimizado, con rendimiento presumiblemente mucho menor.
- Proyecto sin validacion: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-20), sin evidencia de uso en produccion ni de terceros.
- Idiomas no confirmados: la model card no lista idiomas soportados; la importance matrix cubre ingles, ruso, chino y codigo, lo que no garantiza calidad en castellano.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser una cuantizacion Q4/Q8, puede haber degradacion adicional respecto al modelo original, no medida por el autor.
- Contexto no especificado: la longitud de contexto depende de las opciones de numallama y no se indica en la model card.
- Dependencia de un unico mantenedor: numallama es un proyecto de un solo autor; no hay garantias de soporte, correcciones de seguridad ni mantenimiento a largo plazo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-30B-A3B-Instruct-2507 en su propia model card antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/Qwen3-30B-A3B-Instruct-2507-numallama
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio de numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones, contexto, sampling, tools, decodificacion especulativa, API): https://github.com/miloserdev/numallama#readme
- Licencia Apache 2.0: https://huggingface.co/miloserdev/Qwen3-30B-A3B-Instruct-2507-numallama/blob/main/LICENSE
