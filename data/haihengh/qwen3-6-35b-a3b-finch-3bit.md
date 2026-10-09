# haihengh/Qwen3.6-35B-A3B-finch-3bit

## Resumen

Qwen3.6-35B-A3B-finch-3bit es una cuantizacion de 3 bits de los expertos enrutados del modelo Qwen3.6-35B-A3B, publicada por el usuario haihengh para el motor de inferencia FinchMoE y su aplicacion de escritorio para macOS. El modelo base es un MoE disperso desarrollado por Qwen (Alibaba) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, orientado a tareas de codigo agentico. La ficha que nos ocupa no es el modelo original, sino una distribucion optimizada para Apple Silicon que reduce el peso en disco de 71,9 GB (BF16) a 14,93 GiB, un factor de compresion de aproximadamente 4,8x.

La innovacion principal de este artefacto no es el algoritmo de cuantizacion en si, sino el formato `.finch` y la estrategia de ejecucion: los expertos enrutados se almacenan en disco y se transmiten bajo demanda, de modo que la memoria RAM residente se mantiene en torno a 2 GB. Esto permite ejecutar un modelo de 35B en un Mac mini M4 con 16 GB de memoria unificada, algo inviable con las estrategias convencionales de carga completa en memoria. El repositorio raiz funciona como directorio de instalacion y no requiere llama.cpp.

El interes actual de esta publicacion reside en su protocolo de evaluacion comparativa entre cuantizaciones (3 bits frente a 4 bits con la misma receta) y en la documentacion de un fallo previo de kernels int3 que habia degradado drasticamente los resultados. El modelo se publica bajo licencia Apache-2.0 y esta etiquetado unicamente para ingles. A fecha de la informacion disponible acumula 0 descargas y 0 "likes", por lo que carece de validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) con componentes de atencion lineal (GDN citado en la model card); 40 capas, 256 expertos enrutados por capa |
| Parametros totales | 35.000 millones (modelo base Qwen3.6-35B-A3B) |
| Parametros activos | Aproximadamente 3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 3 bits affine (grupo 64, escala y sesgo en BF16); atencion, GDN y expertos compartidos a 4 bits; atencion lineal y router a 8 bits; embeddings a 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `.finch` (manifest.json, model_weights.bin y packed_experts/layer_00..39.bin); no compatible con GGUF ni safetensors |
| Tamano en disco | 14,93 GiB (frente a 71,9 GB en BF16) |
| RAM residente | Aproximadamente 2 GB (expertos transmitidos desde SSD) |
| Libreria | finchmoe |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer disperso de tipo MoE con 35.000 millones de parametros totales y unos 3.000 millones activos, disenado por Qwen para cargas de codigo agentico segun el blog de lanzamiento del modelo original. La model card de esta cuantizacion menciona explicitamente la presencia de componentes de atencion lineal (denominados GDN) junto a mecanismos de atencion convencionales y expertos compartidos, distribuidos en 40 capas con 256 expertos enrutados cada una. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos pertenecen al modelo base y no se detallan en la informacion disponible.

Lo especifico de esta publicacion es la receta de cuantizacion heterogenea: los expertos enrutados (el grueso del peso) se reducen a 3 bits con escalas y sesgos en BF16 y agrupacion de 64 elementos, mientras que las partes mas sensibles a la precision se mantienen en 4 bits (atencion, GDN, expertos compartidos, embeddings) y el router con la atencion lineal suben a 8 bits. La model card documenta un incidente tecnico relevante: una version previa de 3 bits (septiembre de 2026) obtuvo solo 28/164 en HumanEval, y el reanalisis posterior atribuyo el fallo a los kernels int3 del runtime archivado en anchos de fila de produccion, no al formato de cuantizacion en si. La verificacion de kernels y del escritor de pesos se documenta en `docs/SESSION_HANDOFF_3BIT_EXPERTS.md` del repositorio del motor.

## Capacidades

- Generacion de texto y codigo: los resultados de HumanEval (90,9% pass@1) indican competencia solida en generacion de funciones Python a partir de docstrings.
- Razonamiento sobre codigo: el modelo base se presenta por Qwen como orientado a codigo agentico, con capacidad de resolver tareas de programacion de varios pasos.
- Capacidades multimodales: el blog de Alibaba sobre el modelo base menciona rendimiento multimodal, aunque la model card de esta cuantizacion no documenta soporte de vision ni incluye pesos de vision entre los ficheros distribuidos.
- Tool calling y function calling: no disponible en la informacion proporcionada para esta cuantizacion concreta; heredado del modelo base segun su documentacion publica.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la model card, si bien es una de las areas que el modelo base promociona.
- Multilingue: limitado a ingles segun las etiquetas del repositorio (`language: [en]`).
- Servidor compatible con la API de OpenAI: el binario `FinchMoEServer` expone un endpoint HTTP en el puerto configurable, lo que permite integrarlo con clientes que hablan el protocolo de OpenAI.
- Verificacion de integridad: en la primera carga, el motor valida cada fichero contra los digests de `manifest.json` y genera un recibo `verified-install.json`.
- Memoria residente baja: la transmision de expertos desde SSD permite operar con aproximadamente 2 GB de RAM.

## Casos de uso

- Asistente de codigo local en Mac: con 14,93 GiB en disco y unos 2 GB de RAM residente, se puede mantener un asistente de autocompletado y generacion de funciones en un Mac mini M4 de 16 GB sin depender de servicios en la nube, algo relevante para entornos con requisitos de privacidad.
- Generacion de tests unitarios: el modelo puede producir baterias de pruebas a partir de firmas de funciones y docstrings, aprovechando su rendimiento medido en HumanEval sobre Python.
- Integracion en pipelines de CI/CD mediante API compatible con OpenAI: el servidor local permite invocar el modelo desde scripts de build para tareas de revision estatica, generacion de parches o resumen de diffs, sin salir de la red interna.
- Prototipado de agentes en escritorio: al exponer una API HTTP, se puede conectar a frameworks de agentes que esperan el esquema de OpenAI, util para experimentar con flujos multi-paso en hardware de consumo Apple.
- Educacion y experimentacion con cuantizacion: la publicacion incluye un protocolo de evaluacion congelado y comparativas entre 3 y 4 bits, lo que la convierte en material didactico para estudiar el impacto real de reducir bits en expertos enrutados.
- Procesamiento por lotes en estaciones de trabajo Apple Silicon: con tasas de decodificacion de 10 a 12 tok/s, es viable para tareas asincronas como resumir repositorios o clasificar issues, donde la latencia interactiva no es critica.
- Demostraciones sin GPU dedicada: permite montar un servidor de inferencia en un Mac sin tarjeta grafica NVIDIA, usando Metal como backend.

## Benchmarks y rendimiento

Resultados publicados en la model card, protocolo EvalPlus HumanEval con decodificacion greedy (T=0), una sola muestra y limite de 768 tokens, medidos a traves del servidor compatible con OpenAI del propio motor:

| Metrica | 3 bits (este modelo) | 4 bits (build de referencia) |
|---|---|---|
| HumanEval pass@1 | 90,9% (149/164) | 90,9% (149/164) |
| HumanEval+ pass@1 | 86,6% (142/164) | 87,8% (144/164) |

Rendimiento en un Mac mini M4 con 16 GB, casos congelados `real-generation-v1`, una medicion por celda:

| Longitud de prompt | Procesamiento de prompt (tok/s) | Decodificacion (tok/s) |
|---|---|---|
| 50 tokens | 21,4 | 10,0 |
| 414 tokens | 54,6 | 10,8 |
| 2.928 tokens | 46,9 | 12,1 |

Segun la model card, esto supone entre 1,4x y 1,7x la tasa de decodificacion del build de 4 bits, con un 20% menos de espacio en disco. No se han publicado resultados de MMLU, GSM8K u otros benchmarks en la informacion disponible, ni comparativas con modelos de terceros.

## Requisitos de hardware

- RAM residente: aproximadamente 2 GB segun la model card, gracias a la transmision de expertos desde SSD.
- Almacenamiento: 14,93 GiB para el directorio de instalacion completo; se recomienda SSD por el patron de acceso a expertos.
- GPU compatible: Apple Silicon con Metal. La unica configuracion medida es un Mac mini M4 con 16 GB de memoria unificada.
- GPU NVIDIA: no disponible; el motor FinchMoE descrito se compila con Swift y se ejecuta sobre Metal, sin soporte documentado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama de entrada con al menos 16 GB de memoria unificada segun las pruebas publicadas. No hay datos para GPUs de consumo NVIDIA o AMD.
- Opciones de despliegue: motor FinchMoE (compilado con `swift build -c release --product FinchMoEServer`), aplicacion de escritorio para Mac y servidor CLI con API compatible con OpenAI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Instalacion: el directorio raiz del repositorio es el directorio de instalacion; tambien se puede copiar a `models/Qwen3.6-35B-A3B-3bit.finch` dentro de un checkout del motor.
- Latencia y throughput: entre 10,0 y 12,1 tok/s de decodificacion y entre 21,4 y 54,6 tok/s de procesamiento de prompt en M4 con 16 GB, segun los tres tamanos de prompt medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| haihengh/Qwen3.6-35B-A3B-finch-3bit | 35B totales / 3B activos | 3 bits en expertos enrutados | 14,93 GiB | no disponible | Apache-2.0 | HumanEval 90,9%; decodificacion 10-12 tok/s en M4 |
| Build de 4 bits de FinchMoE (mismo autor) | 35B totales / 3B activos | 4 bits | no disponible en la informacion | no disponible | Apache-2.0 | HumanEval 90,9%; HumanEval+ 87,8%; decodificacion 1,4-1,7x mas lenta que 3 bits |
| Build de 2 bits de FinchMoE (mismo autor) | 35B totales / 3B activos | 2 bits | no disponible en la informacion | no disponible | Apache-2.0 | Referenciado en el README del motor; sin cifras en esta informacion |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales / 3B activos | BF16 | 71,9 GB | no disponible | Apache-2.0 | Rendimiento de referencia sin perdida por cuantizacion |
| haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated | 35B totales / 3B activos | 4 bits | no disponible en la informacion | no disponible | no disponible | Variante sin rechazo (abliterated) del mismo autor; sin datos de rendimiento en esta informacion |

## Limitaciones y advertencias

- Cobertura linguistica restringida: el repositorio solo declara ingles (`language: [en]`), por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Perdida de calidad por cuantizacion: los expertos enrutados a 3 bits reducen HumanEval+ en 1,2 puntos frente al build de 4 bits (86,6% frente a 87,8%). Otras tareas no medidas podrian degradarse mas.
- Historial de fallo en kernels int3: una version previa obtuvo 28/164 en HumanEval por un problema de kernels, no del formato. Conviene verificar los digests de `manifest.json` y el recibo `verified-install.json` antes de confiar en los resultados.
- Compatibilidad limitada del formato: `.finch` no es GGUF ni safetensors, por lo que no se puede cargar en llama.cpp, Ollama, vLLM ni TGI. Solo funciona con el motor FinchMoE.
- Dependencia de Apple Silicon y Metal: no hay soporte documentado para CUDA, ROCm ni CPU pura.
- Dependencia de SSD: el rendimiento depende del almacenamiento, ya que los expertos se transmiten desde disco; una unidad lenta degradara la decodificacion.
- Validacion comunitaria nula: 0 descargas y 0 "likes" en el momento de la informacion, sin evaluaciones independientes que confirmen las cifras del autor.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion ni tasas medidas.
- Uso comercial: la licencia Apache-2.0 del modelo base permite uso comercial, pero el usuario debe verificar las condiciones del motor FinchMoE, no cubiertas por la licencia de los pesos.
- Procedencia del modelo base: los datos de entrenamiento, sesgos y limitaciones eticas corresponden a Qwen3.6-35B-A3B y no se reproducen en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finch-3bit
- Repositorio del motor FinchMoE: https://github.com/haihengh/finchMoE
- Build de 3 bits alternativa (mismo autor): https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-3bit
- Build de 4 bits abliterated: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base en ModelScope: https://www.modelscope.ai/models/Qwen/Qwen3.6-35B-A3B
- Blog de lanzamiento de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Blog de Alibaba Cloud sobre el modelo base: https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043
- Documento tecnico sobre kernels int3: `docs/SESSION_HANDOFF_3BIT_EXPERTS.md` dentro del repositorio del motor
