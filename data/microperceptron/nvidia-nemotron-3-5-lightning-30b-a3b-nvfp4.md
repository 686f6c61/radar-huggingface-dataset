# microperceptron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por NVIDIA Corporation y redistribuido en HuggingFace por la cuenta `microperceptron`. Forma parte de la familia Nemotron 3.5 y esta disenado especificamente para cargas de agentes autonomos de larga duracion y despliegues de sub-agentes, con un enfasis claro en la eficiencia de inferencia: 30.000 millones de parametros totales con solo 3.000 millones activos por token. La arquitectura es hibrida, combinando capas Mamba-2 intercaladas con capas MoE y un numero selecto de capas de atencion, lo que reduce el coste de memoria asociado a contextos muy largos.

El modelo se distribuye en precision NVFP4, un formato de cuantizacion de 4 bits nativo del ecosistema NVIDIA (generado con ModelOpt), con el objetivo de ocupar una sola GPU en despliegues de centro de datos o en hardware personal. La model card declara una longitud de contexto de hasta 1.000.000 de tokens y compatibilidad con seis idiomas (ingles, espanol, frances, aleman, italiano y japones), ademas de lenguajes de programacion.

Su relevancia actual radica en que NVIDIA publica pesos abiertos, datos de entrenamiento y recetas de despliegue bajo la licencia OpenMDW 1.1, e incluye decodificacion especulativa propia (DSpark, MTP y DFlash) para acelerar la generacion. Existe una discrepancia relevante entre el recuento de parametros declarado en la model card (30B totales) y el metadato real de los ficheros safetensors del repositorio (17.820.210.764 parametros almacenados), probablemente debida al empaquetado de tensores en NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida Mamba-2 + MoE + Attention (tipo `nemotron_h`) |
| Parametros totales | 30B declarados en la model card; 17.820.210.764 en metadatos safetensors del repo |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1.000.000 tokens (contexto validado por defecto: 1M) |
| Tipos de cuantizacion | NVFP4 (4 bits, generado con ModelOpt); ruta de computo W4A16 en GPUs sin tensor cores FP4; los tags del repo indican tambien 8-bit |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW 1.1 (uso comercial permitido segun la model card) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 21,6 GB |
| Fecha de publicacion declarada | 11 de agosto de 2026 |
| Fecha de creacion en HuggingFace | 21 de septiembre de 2026 |
| Muestreo recomendado | Temperature 1.0, Top_P 0.95 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que intercala capas Mamba-2 (modelo de espacio de estados) con capas de Mixture-of-Experts y un subconjunto de capas de atencion clasica. Esta combinacion busca dos objetivos: mantener la calidad de razonamiento que aporta la atencion completa en puntos estrategicos de la red y, al mismo tiempo, reducir el coste de cache y de computo en secuencias muy largas gracias a las capas SSM. Con 30B parametros totales y 3B activos, el coste por token se mantiene bajo en comparacion con un modelo denso equivalente.

Los datos de entrenamiento no se detallan en la informacion disponible: no se especifica el numero de tokens, la composicion del dataset ni el uso concreto de RLHF o DPO. La model card si indica que los datos de preentrenamiento tienen fecha de corte en septiembre de 2025 y los de postentrenamiento en mayo de 2026, con un desarrollo fechado entre diciembre de 2025 y mayo de 2026. La innovacion tecnica mas destacable es el conjunto de estrategias de decodificacion especulativa que acompanan al modelo: DSpark (orientado a baja concurrencia en centro de datos y DGX Spark), MTP (Multi-Token Prediction) y DFlash. La model card tambien documenta parsers especificos para el despliegue: `reasoning-parser nemotron_v3` para el modo de razonamiento y `tool-call-parser qwen3_coder` para el uso de herramientas.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de razonamiento explicitamente soportado mediante el parser `nemotron_v3`.
- Capacidades de codificacion y tareas agenticas: la model card agrupa los benchmarks de codigo y agentes (SWE-bench, SciCode) como areas evaluadas.
- Tool calling / function calling: el despliegue documentado con vLLM activa `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Orientado a agentes autonomos de larga duracion y a despliegues como "sub-agente" de trabajo intensivo.
- Contexto muy largo de hasta 1M tokens, apto para tareas sobre repositorios, documentos o historiales extensos.
- Multilingue en ingles, espanol, frances, aleman, italiano y japones, ademas de lenguajes de programacion.
- Decodificacion especulativa integrada (DSpark, MTP, DFlash) para acelerar la generacion cuando el hardware lo permite.
- Vision, audio u otras modalidades: no disponible (no se documentan en la informacion proporcionada).

## Casos de uso

- Agentes autonomos de larga duracion: con 1M tokens de contexto y solo 3B parametros activos, el modelo puede mantener el estado de una tarea compleja (planificacion, ejecucion de pasos y verificacion) durante muchas iteraciones sin disparar el coste por token.
- Sub-agentes en pipelines multi-agente: su perfil de 3B activos lo hace adecuado como "workhorse" al que un modelo mayor delega subtareas repetitivas, reduciendo el coste total de la orquestacion.
- Automatizacion de atencion al cliente: conversaciones multi-turno con historial largo gracias a la ventana de 1M tokens, con soporte de tool calling para consultar sistemas internos (pedidos, facturacion, estado de incidencias).
- Generacion y revision de codigo en produccion: el modelo esta evaluado en tareas de codigo y agenticas, soporta tool calling y puede integrarse en pipelines de CI/CD para revisar diffs, generar tests o resolver issues acotadas.
- Analisis de documentacion tecnica extensa: contratos, normativas o manuales de cientos de miles de tokens que caben en una sola ventana, con salida estructurada y citas.
- Despliegue local en hardware personal o de laboratorio: al almacenarse en NVFP4 y ocupar unos 21,6 GB, puede ejecutarse en una unica GPU con suficiente memoria, lo que habilita prototipos de agentes sin depender de la nube.
- Razonamiento cientifico y matematico asistido: tareas de tipo GPQA/SciCode con modo de razonamiento activado, utiles para asistencia a investigacion y validacion de calculos.
- Procesamiento multilingue en Europa: atencion o generacion en espanol, frances, aleman e italiano dentro de un mismo modelo, sin necesidad de instancias separadas por idioma.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando la version BF16 con la version NVFP4:

| Tarea | Nemotron-3.5-Lightning-30B-A3B-BF16 | Nemotron-3.5-Lightning-30B-A3B-NVFP4 |
|---|---|---|
| MMLU Pro | 81,94 | 81,62 |
| AA-Omniscience | 17,50 | 16,63 |
| GPQA Diamond (sin herramientas) | 75,44 | 75,57 |
| HLE (solo texto, sin herramientas) | 11,72 | 10,47 |
| SciCode | 32,60 | 31,38 |
| SWE-bench Veri... (truncado en la informacion disponible) | no disponible | no disponible |

La model card incluye ademas un grafico de precision (`accuracy_plot.png`) cuyo contenido numerico no esta disponible en la informacion proporcionada. No hay datos de latencia, throughput ni comparativas con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 21,6 GB en NVFP4 (tamano real del repositorio). El consumo total dependera del cache KV, del buffer de activaciones y del backend MoE utilizado.
- Hardware soportado segun la model card:
  - Blackwell GB200: NVFP4 nativo, ruta de computo FP4, backend MoE por defecto, contexto validado 1M.
  - Blackwell DGX Spark (GB10): NVFP4 con ruta W4A16, backend MoE `marlin`, sin ruta nativa FP4, contexto validado 1M. La model card lo presenta como despliegue de una sola GPU.
  - Blackwell GeForce RTX 5090: compatible a nivel de hardware con FP4, pero sin receta publicada en la informacion disponible.
  - Hopper H100 / H200: NVFP4 con ruta W4A16 (Hopper no tiene tensor cores FP4), backend `humming` para maximo throughput o el backend por defecto, contexto validado 1M. La model card indica que cabe en una sola H100.
  - Ampere (A100 y similares): NVFP4 con ruta W4A16, backend `humming`, contexto validado 1M.
- Cabe en GPU de consumo: si, al menos en RTX 5090 segun la matriz de hardware, aunque la model card no publica receta validada para esa GPU. Para GPUs con 24 GB o menos no hay datos disponibles.
- Opciones de despliegue documentadas: vLLM (imagen `vllm/vllm-openai:v0.27.1`), con backend MoE `marlin` o `humming`, `--mamba-backend flashinfer`, `--kv-cache-dtype fp8`, `--enable-prefix-caching` y soporte de decodificacion especulativa mediante el checkpoint complementario DSpark. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible (no se publican cifras).

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion tecnica sobre modelos comparables; los resultados obtenidos no guardan relacion con el modelo. Por tanto, no se dispone de cifras verificadas para una comparativa cuantitativa.

| Aspecto | Nemotron-3.5-Lightning-30B-A3B-NVFP4 | Alternativas de la misma categoria (MoE ~30B totales, ~3B activos) |
|---|---|---|
| Parametros totales / activos | 30B / 3B (declarado) | no disponible |
| Arquitectura | Mamba-2 + MoE + Attention hibrida | no disponible |
| Contexto | Hasta 1M tokens | no disponible |
| Licencia | OpenMDW 1.1 | no disponible |
| Formatos de pesos | safetensors NVFP4 | no disponible |
| Rendimiento en benchmarks | Ver tabla de benchmarks | no disponible |

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos safetensors del repositorio declaran 17.820.210.764 parametros, frente a los 30B totales que indica la model card. Conviene verificar el recuento efectivo antes de dimensionar infraestructura.
- Repositorio alojado por un tercero (`microperceptron`), no por la cuenta oficial de NVIDIA. No hay descargas ni valoraciones registradas en el momento de la consulta, por lo que la procedencia y la integridad de los pesos deberian validarse contra el repositorio oficial.
- Model card truncada en la informacion disponible: la seccion de benchmarks se corta en SWE-bench y no se incluyen datos de throughput, latencia ni comparativas externas.
- Riesgo de alucinacion: no se documentan tasas de error ni mecanismos de mitigacion especificos. En tareas de conocimiento general el resultado de AA-Omniscience es bajo (16,63 en NVFP4), lo que sugiere cautela en usos que dependan de conocimiento factual amplio.
- Rendimiento en HLE limitado (10,47 en NVFP4), lo que indica dificultades en razonamiento de maxima dificultad.
- Perdida de precision por cuantizacion: la version NVFP4 es ligeramente inferior a BF16 en MMLU Pro, AA-Omniscience, HLE y SciCode. GPQA Diamond es la unica tarea donde NVFP4 supera ligeramente a BF16.
- Limitaciones de hardware: en plataformas Hopper y Ampere no existe ruta nativa FP4 y el modelo se ejecuta mediante W4A16, con el impacto en rendimiento que ello implica.
- Restricciones de licencia: el uso se rige por OpenMDW 1.1. La model card afirma que el modelo esta listo para uso comercial, pero los terminos exactos deben revisarse en el texto de la licencia antes de un despliegue en produccion.
- Idiomas: solo seis idiomas declarados; no hay datos sobre comportamiento en otras lenguas.
- No se documenta soporte para llama.cpp, Ollama u otros motores fuera de vLLM, lo que limita las opciones de despliegue en entornos no NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microperceptron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint complementario de decodificacion especulativa DSpark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Demo/chat en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1 en GitHub: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
