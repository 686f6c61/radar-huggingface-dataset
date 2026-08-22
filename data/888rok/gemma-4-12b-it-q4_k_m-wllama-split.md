# 888rok/gemma-4-12b-it-Q4_K_M-wllama-split

## Resumen

Este repositorio contiene una versión cuantizada en GGUF Q4_K_M del modelo Gemma 4 12B instructivo, dividida en fragmentos (shards) de menos de 2 GB para poder cargarse en el navegador mediante la biblioteca wllama. El autor, 888rok, parte de la cuantización publicada por unsloth (`unsloth/gemma-4-12B-it-GGUF`) y la trocea con la herramienta `llama-gguf-split`, de modo que el navegador solo necesita descargar el primer fragmento y wllama resuelve el resto automáticamente.

El modelo base es Gemma 4 12B de Google, una familia abierta de junio de 2026 con arquitectura multimodal (texto, imagen, audio y vídeo), ventana de contexto de 256 000 tokens y licencia Apache 2.0. Este repo no añade capacidades nuevas: es una distribución práctica para ejecutar el modelo en clientes web, con los tags `gguf`, `wllama`, `imatrix` y `endpoints_compatible` que indican compatibilidad con inferencia en navegador y con endpoints estándar.

La relevancia de este split es operativa: permite desplegar un LLM de 12 000 millones de parámetros en aplicaciones de navegador sin servidor, con privacidad de datos y sin necesidad de GPU dedicada, a costa del rendimiento de la cuantización Q4_K_M.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 12B); detalle de atención no disponible |
| Parametros totales | 11 907 350 576 (~11,9 mil millones) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 256 000 tokens (modelo base; el split no lo modifica) |
| Tipos de cuantizacion | Q4_K_M con imatrix (este repo); el repo de unsloth incluye otras cuantizaciones |
| Idiomas soportados | No disponible en la model card; el modelo base Gemma 4 es multilingue |
| Licencia | Apache 2.0 (modelo base); la model card del repo no especifica licencia |
| Formato de pesos | GGUF, dividido en shards de <2 GB (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B, un transformer multimodal de Google diseñado para razonamiento, agentes, codigo y comprension multimodal (texto, imagen, audio y video segun la documentacion oficial). Los detalles exactos de la arquitectura (atencion, mezcla de expertos, etc.) no se especifican en la informacion disponible para este repo.

Este repositorio no aporta entrenamiento adicional: es una cuantizacion Q4_K_M con imatrix del checkpoint instruct original, troceada en fragmentos de menos de 2 GB para cumplir las limitaciones de carga de wllama en el navegador. No se documenta el dataset de entrenamiento ni el proceso de ajuste (RLHF/DPO) en la model card.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural (capacidad heredada del modelo base).
- Comprension multimodal: el modelo base acepta imagen, audio y video como entrada, ademas de texto.
- Razonamiento multi-paso y soporte para flujos de trabajo agente (tool calling), segun la documentacion oficial de Gemma 4.
- Ventana de contexto de 256 000 tokens, adecuada para documentos largos y conversaciones extensas.
- Ejecucion completa en el navegador mediante wllama (WebAssembly), sin servidor de inferencia.
- Compatible con endpoints estandar (tag `endpoints_compatible`), lo que facilita su integracion en APIs locales o remotas.

## Casos de uso

- Asistente de chat en el navegador: integrable en una pagina web para ofrecer un asistente conversacional sin enviar datos a un servidor, gracias a la carga via wllama.
- Aplicaciones de documentacion y RAG en cliente: la ventana de 256K tokens permite indexar manuales, contratos o bases de conocimiento en el propio dispositivo y responder preguntas sobre ellos sin infraestructura.
- Prototipado rapido de LLMs: un desarrollador puede probar el comportamiento del modelo Gemma 4 12B directamente en el navegador antes de desplegarlo en produccion.
- Educacion y demostraciones: util para talleres o cursos donde se necesita un LLM funcional sin configuracion de GPU ni de servidor.
- Analisis de audio y video en el cliente: el modelo base soporta entrada multimodal; este split permite ejecutarlo en el navegador para transcripciones o descripcion de contenido multimedia.
- Integracion con APIs locales: al ser `endpoints_compatible`, puede conectarse a herramientas de desarrollo (por ejemplo, pipelines de generacion de codigo) mediante un endpoint HTTP local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El rendimiento real dependera del hardware del cliente (CPU del navegador) y de la cuantizacion Q4_K_M.

## Requisitos de hardware

- Inferencia en navegador: requiere un dispositivo con WebAssembly habilitado (Chrome, Firefox, Safari, Edge) y suficiente memoria RAM para los shards (el repositorio ocupa 7,1 GB en total).
- VRAM: no es necesaria GPU para la carga via wllama, ya que la inferencia se ejecuta en CPU del navegador. El modelo base Gemma 4 12B en Q4 se estima que cabe en unos 8 GB de VRAM si se ejecuta con llama.cpp u Ollama en una GPU, segun la documentacion de hokai.io.
- GPUs recomendadas para ejecucion local fuera del navegador: RTX 4070/4080/4090 (16-24 GB), A100 40 GB o H100 para despliegue con vLLM o TGI.
- Opciones de despliegue: wllama (navegador), llama.cpp (CPU/GPU), Ollama (existe el modelo `gemma4:12b-it-q4_K_M`), vLLM (para servidor).
- Latencia: no disponible; en navegador dependera de la CPU y la velocidad de descarga de los shards.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Gemma 4 12B (este repo) | ~11,9B | 256K | Si (texto, audio, video) | Apache 2.0 | GGUF Q4_K_M |
| Gemma 3 27B | 27B | 128K | Si (texto, imagen) | Apache 2.0 | GGUF |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 Community | GGUF |
| Qwen 2.5 14B | 14B | 128K | No | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks comparativos para este split en la informacion consultada.

## Limitaciones y advertencias

- Es una cuantizacion Q4_K_M: la precision es inferior a la del modelo original de 16 bits, lo que puede afectar a tareas de razonamiento complejo o generacion de codigo.
- El rendimiento en el navegador depende de la CPU del cliente; en dispositivos modestos la generacion puede ser lenta.
- El repositorio tiene 0 descargas y 0 likes; es un split de terceros no oficial de Google ni de unsloth, sin garantias de mantenimiento.
- La model card no especifica licencia propia; se asume la Apache 2.0 del modelo base, pero conviene verificar antes de un uso comercial.
- No se documentan sesgos especificos del modelo; como cualquier LLM, puede presentar sesgos de genero, raza o cultura heredados de los datos de entrenamiento.
- Riesgo de alucinacion: el modelo puede generar informacion plausible pero falsa, especialmente en contextos de documentos largos o preguntas de baja frecuencia.
- Para produccion, se recomienda evaluar el modelo en el dominio de uso real y considerar un servicio de validacion de respuestas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/888rok/gemma-4-12b-it-Q4_K_M-wllama-split
- Modelo base (unsloth): https://huggingface.co/unsloth/gemma-4-12B-it-GGUF
- Modelo original (Google): https://huggingface.co/google/gemma-4-12B
- wllama (biblioteca para navegador): https://github.com/ngxson/wllama
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Modelo en Ollama: https://ollama.com/library/gemma4:12b-it-q4_K_M
- Articulo tecnico (hokai.io): https://hokai.io/hub/models/gemma-4-12b
