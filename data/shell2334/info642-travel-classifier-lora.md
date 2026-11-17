# Shell2334/info642-travel-classifier-lora

## Resumen

`Shell2334/info642-travel-classifier-lora` es un adaptador LoRA publicado en Hugging Face por el usuario Shell2334, entrenado sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0. Por el identificador del repositorio y las etiquetas de la plataforma, se trata de un ajuste fino orientado a una tarea de clasificación en el dominio de viajes, presumiblemente un clasificador de consultas o textos turísticos. El repositorio tiene un tamano efectivo de 0.0 GB, lo que es coherente con un adaptador LoRA (pesos de bajo rango) y no con un modelo completo.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la model card es la plantilla por defecto de Hugging Face sin rellenar, no hay pipeline declarado, no se especifican idiomas, licencia ni resultados de evaluacion, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Se trata, por tanto, de un artefacto de experimentacion academica o personal, no de un modelo listo para produccion.

El modelo base, TinyLlama-1.1B-Chat-v1.0, es un transformer decoder-only de 1.1 mil millones de parametros con ventana de contexto de 2048 tokens, entrenado sobre aproximadamente 3 billones de tokens y ajustado con tecnicas de alineacion tipo chat. El adaptador hereda esas caracteristicas y anade una especializacion de tarea que, a falta de documentacion, solo puede inferirse del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base soporta 2048 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (el modelo base esta orientado principalmente a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.21.2 |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) compatible con la libreria PEFT en su version 0.21.2. LoRA congela los pesos del modelo base e inserta matrices de descomposicion de bajo rango en determinadas capas lineales, de modo que solo se entrenan y almacenan esos parametros adicionales. Esto explica el tamano practicamente nulo del repositorio y permite cargar el adaptador sobre TinyLlama-1.1B-Chat-v1.0 sin duplicar el modelo completo.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, los hiperparametros (rango, alpha, dropout, tasa de aprendizaje, epocas) ni sobre si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica mas alla del propio uso de LoRA. La unica referencia tecnica presente en las etiquetas es el paper arXiv:1910.09700, que corresponde al calculo de impacto ambiental de Lacoste et al. y aparece en la plantilla por defecto, no como contribucion del autor.

## Capacidades

- Clasificacion de texto en el dominio de viajes, segun se deduce del identificador `travel-classifier`; la taxonomia concreta de clases no esta documentada.
- Generacion de texto y razonamiento basico heredados de TinyLlama-1.1B-Chat-v1.0.
- Soporte de conversacion multi-turno en formato chat, limitado por el modelo base.
- Tool calling y function calling: no disponible de forma nativa en el modelo base; no se documenta soporte en el adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas y poco probables dado el tamano del modelo base.
- Capacidades multilingues: no disponibles; el modelo base esta entrenado mayoritariamente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Clasificacion de consultas de usuarios en un portal de reservas: el adaptador podria etiquetar mensajes entrantes por categoria (vuelos, hoteles, alquiler de coches, incidencias) para enrutarlos al equipo adecuado, aprovechando el ajuste especifico del dominio.
- Moderacion y triaje de resenas turisticas: uso del clasificador para separar resenas positivas, negativas y neutras o para detectar quejas que requieran atencion prioritaria.
- Etiquetado semiautomatico de corpus turisticos: generacion de etiquetas preliminares sobre grandes volumenes de texto que luego se revisan manualmente, reduciendo el coste de anotacion.
- Enrutamiento en un chatbot de atencion al cliente: combinacion del adaptador con el modelo base para decidir si una consulta debe resolverse con respuestas predefinidas o escalarse a un agente humano.
- Analisis de intencion en buscadores de viajes: clasificacion de consultas de busqueda para mejorar la recuperacion o la sugerencia de resultados.
- Prototipado rapido en investigacion: al ser un adaptador ligero, sirve como ejemplo reproducible de ajuste fino PEFT sobre TinyLlama para experimentos docentes o de evaluacion de metodologias LoRA.

En todos los casos, la falta de documentacion sobre clases, metricas y datos obliga a validar el adaptador antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa practicamente nada (repositorio de 0.0 GB); el coste real lo determina el modelo base TinyLlama-1.1B-Chat-v1.0.
- VRAM estimada para el modelo base en precision completa (fp16): en torno a 2.2 GB de pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para inferencia comoda con contexto completo.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 0.7-1 GB de pesos, permitiendo ejecucion en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPUs consumer e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM soporta adaptadores LoRA en su capa de clasificacion, segun la documentacion consultada.
- Latencia y throughput estimados: no disponibles para este adaptador concreto; para el modelo base de 1.1B se esperan decenas de tokens por segundo en GPU consumer y varios cientos en A100/H100 con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shell2334/info642-travel-classifier-lora | Adaptador sobre 1.1B | 2048 (base) | LoRA de clasificacion | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2048 | Transformer chat | Apache 2.0 (segun el modelo base original) | Hugging Face, ampliamente usado |
| Adaptadores LoRA genericos sobre TinyLlama | Variable | 2048 (base) | LoRA | Variable segun autor | Multiples en Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento con alternativas especificas de clasificacion de viajes, ya que no se han publicado metricas de este adaptador.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no especificada, lo que impide determinar si el uso comercial esta permitido; en ausencia de licencia explicita, deben aplicarse las condiciones del modelo base y consultarse con el autor.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de clasificaciones erroneas por el reducido tamano del modelo base (1.1B) y la ausencia de metricas.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste, por lo que no puede evaluarse el sesgo de dominio ni el sesgo linguistico.
- Idiomas no declarados; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano es incierto.
- Contexto limitado a 2048 tokens en el modelo base, insuficiente para documentos largos.
- No apto para produccion sin una evaluacion previa sobre un conjunto de validacion propio y sin clarificar la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shell2334/info642-travel-classifier-lora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Documentacion de vLLM sobre capa de clasificacion LoRA: https://docs.vllm.ai/en/latest/api/vllm/lora/layers/classifier/
- Paper de referencia citado en la plantilla (impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact#compute
