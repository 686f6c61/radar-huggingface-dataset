# arbonquants/LFM2.5-8B-A1B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF

## Resumen

LFM2.5-8B-A1B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF es una cuantización comunitaria publicada por el usuario arbonquants sobre el modelo base LiquidAI/LFM2.5-8B-A1B, un modelo de generación de texto en formato GGUF orientado a inferencia en local. El modelo base es un modelo disperso de tipo mixture of experts (MoE) con 8.467.856.832 parámetros totales, de los cuales solo alrededor de 1.000 millones (4 de 32 expertos) se activan por token, lo que permite velocidades de generación muy altas (400-500 tokens/segundo en una RTX 5090, según el autor) con un coste computacional reducido.

La aportación diferencial de esta versión es el sistema "Turbo Brilliance", un conjunto de 12 modos de razonamiento seleccionables "al vuelo" mediante etiquetas en el prompt, la API o parámetros estándar de vLLM. Según el autor, este sistema inyecta instrucciones de enfoque de tarea antes de la fase de razonamiento, reduciendo el número de regeneraciones necesarias para obtener una salida de calidad. Se trata de una versión BETA v1.0 y de una cuantización comunitaria, no de un lanzamiento oficial de LiquidAI, por lo que conviene evaluarla con criterio antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso MoE (Liquid Foundation Models, LFM2.5) |
| Parametros totales | 8.467.856.832 (~8,47B) |
| Parametros activos | ~1B (4 de 32 expertos activados por token) |
| Longitud de contexto | 128k (131.000 tokens) |
| Tipos de cuantizacion | GGUF (varias cuants; MAX y BF16 con tensor de salida a precision completa, 10-20% del modelo) |
| Idiomas soportados | Arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2.5-8B-A1B, es un modelo de la familia Liquid Foundation Models (LFM) que emplea una arquitectura MoE dispersa con 32 expertos, de los cuales 4 se activan por token (configurable en la mayoria de aplicaciones de IA para activar 6 u 8 expertos, elevando la calidad a costa de velocidad). Esta configuracion de 8,47B de parametros totales con ~1B activos situa el coste de inferencia cerca del de un modelo denso de 1B, manteniendo la capacidad de un modelo de 8B. El modelo incluye entrenamiento para tool calling y uso agentico.

Sobre los datos de entrenamiento concretos (numero de tokens, composicion del dataset, RLHF/DPO), la informacion disponible no ofrece detalles; se referencian dos papers (arXiv:2511.23404 y arXiv:2607.15232) en los tags del repositorio. La capa "Turbo Brilliance" no es un reentrenamiento: segun la model card, es un sistema de inyeccion de instrucciones (cientos o miles de tokens insertados en milisegundos en la etapa previa al razonamiento) que condiciona el comportamiento del modelo hacia uno de los 12 modos de razonamiento, con un sistema de ayuda interactivo ("context help") integrado. El autor advierte que su eficacia depende directamente de la cuantizacion empleada y del tamano del modelo base.

## Capacidades

- Generacion de texto general con salidas tipicas de 2.000 a 12.000+ tokens segun el modo de razonamiento empleado.
- 12 modos de razonamiento conmutables en caliente mediante etiquetas en el chat, API o keywords estandar de vLLM.
- Sistema de ayuda interactivo ("context help") con sugerencias por modo para alinear el razonamiento con el caso de uso.
- Tool calling (llamada a funciones) nativo en el modelo base.
- Entrenamiento para flujos agenticos y razonamiento multi-paso.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Velocidades de generacion altas gracias a la activacion dispersa de expertos (400-500 t/s en RTX 5090 segun el autor).
- Posibilidad de activar mas expertos (6 u 8) en la mayoria de aplicaciones para mejorar la calidad de salida.

## Casos de uso

- Chatbots y asistentes conversacionales en local: el contexto de 128k permite conversaciones multi-turno largas sin perder informacion, y el modelo esta etiquetado como "conversational".
- Agentes con tool calling: el entrenamiento agentico del modelo base y su bajo coste por token (1B activos) lo hacen adecuado para bucles de agente con multiples llamadas a herramientas.
- Generacion de salidas largas estructuradas: los modos de mayor razonamiento producen salidas de hasta 12.000+ tokens, util para informes, documentacion o analisis extensos.
- Inferencia edge y en hardware de consumo: con solo ~1B de parametros activos por token, ofrece alta velocidad de generacion en GPUs domesticas de gama alta.
- Prototipado rapido de prompts: el sistema de modos de razonamiento reduce, segun el autor, las regeneraciones necesarias (one-shot o two-shot frente a 5-10 regeneraciones), acelerando la iteracion.
- Procesamiento multilingue: cobertura de 16 idiomas (incluidos espanol, arabe, chino, japones y tailandes) para clasificacion, resumen o traduccion ligera.
- Integracion en pipelines con vLLM: los modos se activan mediante cambios de keywords estandar de vLLM, facilitando la automatizacion por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion. La model card remite a la model card original de LiquidAI/LFM2.5-8B-A1B para benchmarks y detalles del modelo, pero los numeros concretos no estan incluidos en la informacion proporcionada. El unico dato de rendimiento cuantitativo aportado es una velocidad de generacion de 400-500 tokens/segundo en una RTX 5090, atribuida a la naturaleza MoE dispersa del modelo.

## Requisitos de hardware

- El repositorio completo ocupa 58,9 GB; la VRAM necesaria depende de la cuantizacion concreta descargada (no disponible el listado de cuants con sus tamanos individuales).
- Para cuants MAX o BF16 (mayor fidelidad, salida a precision completa), estimablemente se requiere una GPU con 24 GB de VRAM o mas, o descarga parcial en RAM/CPU.
- GPU recomendadas segun el autor: RTX 5090 (referenciada con 400-500 t/s); compatibilidad general con GPUs consumer modernas mediante llama.cpp.
- Contexto minimo sugerido de 24.000 tokens; para conversaciones multi-turno se recomienda el maximo de 128k, lo que incrementa la memoria necesaria (KV cache).
- Formato GGUF: despliegue via llama.cpp, Ollama, LM Studio y aplicaciones compatibles; el autor menciona ademas vLLM (para la activacion de modos via keywords) y endpoints compatibles.
- Ajustes sugeridos por el autor: temperature 0,2, top_k 80, repetition_penalty 1,05 (o top_k 64, min_p 0,05, top_p 0,95 en sus pruebas); sin cache de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base, LiquidAI) | ~8,47B | ~1B (4/32 expertos) | 128k | Apache 2.0 | Safetensors |
| Esta cuantizacion (arbonquants) | ~8,47B | ~1B (configurable 4-8 expertos) | 128k | Apache 2.0 | GGUF |
| LFM2.5-2.6B Turbo Brilliance (variante densa del mismo ecosistema) | ~2,6B (denso) | ~2,6B | no disponible | no disponible | GGUF |

Alternativas directas de otros fabricantes con MoE disperso de tamano comparable no se incluyen por falta de datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- Se trata de una cuantizacion comunitaria en BETA v1.0, no de un lanzamiento oficial de LiquidAI; el propio autor solicita reporte de fallos en la pestana community del repositorio.
- La eficacia del sistema Turbo Brilliance depende fuertemente de la cuantizacion: cuants bajos (Q4/IQ4) degradan notablemente los modos de razonamiento frente a Q6, Q8, MAX o BF16.
- El rendimiento intrinseco esta limitado por el tamano del modelo base (8B con 1B activos), incluso con el sistema de modos activado.
- Los modos de razonamiento generalistas aun estan en fase de ajuste; los modos instruct de este modelo resultan algo mas "verbosos" que los de modelos con modos instruct dedicados.
- Los datos de rendimiento (400-500 t/s, reduccion de regeneraciones) proceden del autor de la cuantizacion y no han sido verificados de forma independiente.
- No se han publicado benchmarks independientes para esta version; para evaluar calidad real conviene contrastar con la model card oficial de LiquidAI/LFM2.5-8B-A1B y pruebas propias.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero esto aplica al modelo base; conviene verificar los terminos de los papers referenciados si se reutiliza metodologia.
- Riesgo de alucinacion tipico de modelos de lenguaje de este tamano: no disponible informacion especifica sobre sesgos o calibracion; se recomienda validacion de salidas en produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/arbonquants/LFM2.5-8B-A1B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Variante Turbo Brilliance densa (LFM2.5-2.6B, DavidAU): https://huggingface.co/DavidAU/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Evolucion del sistema (Qwen3.8-27B, DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Paper referenciado 1: https://arxiv.org/abs/2511.23404
- Paper referenciado 2: https://arxiv.org/abs/2607.15232
