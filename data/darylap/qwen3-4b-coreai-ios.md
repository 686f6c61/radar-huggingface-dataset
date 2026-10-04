# darylap/Qwen3-4B-coreai-ios

## Resumen

Qwen3-4B-coreai-ios es un export del modelo Qwen/Qwen3-4B preparado especificamente para ejecutarse en el runtime Core AI de Apple en dispositivos iOS. El artefacto lo publica el usuario darylap y no introduce cambios en los pesos mas alla de la conversion de representacion y la cuantizacion: conserva el tokenizer y la plantilla de chat originales del modelo base desarrollado por el equipo Qwen. Se distribuye como un unico artefacto `.aimodel` acompanado de metadatos de export y ficheros de tokenizer, y no como un directorio de pesos Transformers o MLX.

El modelo base, Qwen3-4B, es un modelo de lenguaje denso de aproximadamente 4.000 millones de parametros, multilingue, orientado a comprension y generacion de lenguaje, codigo y matematicas. Este export concreto aplica el preset de cuantizacion mixta `qwen3_4b_mixed_4bit_8bit` y fija una ventana de contexto de 8.192 tokens, inferior a la ventana nativa del modelo original. El objetivo es habilitar inferencia totalmente local en iPhone, iPad y Mac con Apple Silicon, sin llamadas a servidores externos.

Su relevancia es practica: forma parte del ecosistema emergente de modelos convertidos para Core AI (Apple coreai-models) y esta pensado para alimentar Hearth, un asistente local de escritura y documentos. Para desarrolladores que quieran integrar un LLM de 4B en una app iOS con privacidad por diseno, este tipo de export es una de las pocas vias disponibles hoy, aunque su rendimiento real depende de la verificacion en dispositivo y de la version del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); exportado como artefacto Core AI `.aimodel` |
| Parametros totales | 4.000 millones (modelo base); el export no publica un recuento propio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (configuracion fijada en el export) |
| Tipos de cuantizacion | Mixta 4 bits / 8 bits (preset `qwen3_4b_mixed_4bit_8bit`) |
| Idiomas soportados | no disponible (el export conserva el tokenizer original del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (artefacto Core AI); no es safetensors ni GGUF |
| Modelo base | Qwen/Qwen3-4B (revision `1cfa9a7208912126459214e8b04321603b3df60c`) |
| Requisito de runtime | Core AI en iOS 27 o posterior |

## Arquitectura y entrenamiento

El export no describe entrenamiento propio: es una conversion de representacion del modelo Qwen/Qwen3-4B ya entrenado. La model card indica que la herramienta usada es Apple coreai-models, en la revision `e7b24da85ea64a77d26324d7ce9607de9b955f57`, con el preset `qwen3_4b_mixed_4bit_8bit` para iOS. El proceso modifica la representacion de los pesos y su cuantizacion, pero retiene el tokenizer y la plantilla de chat del modelo original sin cambios, por lo que el comportamiento conversacional y el formato de prompt siguen el esquema de Qwen3.

El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.000 millones de parametros, multilingue, con capacidades destacadas en comprension de lenguaje, generacion, codigo y matematicas segun la documentacion de Qualcomm AI Hub. No se dispone en la informacion proporcionada de los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF o DPO) ni de innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal; esos datos habria que consultarlos en la model card upstream de Qwen/Qwen3-4B.

La unica particularidad tecnica de este export es la cuantizacion mixta 4/8 bits y la fijacion de contexto en 8.192 tokens. El propio autor advierte que el tamano de los ficheros exportados no determina el requisito de memoria en tiempo de ejecucion de un dispositivo, que el rendimiento depende de la verificacion por dispositivo y que el artefacto solo funciona sobre Core AI en iOS 27 o superior.

## Capacidades

- Generacion de texto en modo conversacional, con plantilla de chat heredada del modelo base Qwen3.
- Razonamiento, comprension de lenguaje, generacion de codigo y matematicas, segun las capacidades declaradas del modelo base Qwen3-4B.
- Soporte multilingue heredado del tokenizer original, aunque el export no enumera idiomas concretos.
- Inferencia totalmente on-device, sin conexion de red, orientada a privacidad y a uso en movilidad.
- Integracion con el runtime Core AI de Apple (artefacto `.aimodel` con tokenizer y plantilla embebidos segun el ecosistema).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito para este export concreto.
- Contexto de trabajo limitado a 8.192 tokens por diseno del export.

## Casos de uso

- Asistente de escritura local en iOS: el modelo alimenta Hearth, un asistente de redaccion y documentos que funciona sin enviar contenido a la nube, gracias a la ejecucion on-device sobre Core AI.
- Correccion y reescritura de textos en apps de productividad: con 8.192 tokens de contexto se puede procesar un capitulo o un documento de varias paginas en una sola pasada para reescribir o resumir.
- Resumen de notas y articulos en una app movil: el modelo puede condensar contenido pegado por el usuario manteniendo la privacidad, ya que no requiere conexion.
- Generacion de codigo asistida en el dispositivo para snippets cortos: el modelo base esta orientado a codigo, y la ventana de 8.192 tokens es suficiente para funciones o fragmentos acotados dentro de un editor movil.
- Chat de soporte o FAQ offline en una app: se puede empaquetar un asistente conversacional que responde sin red, util en entornos con conectividad limitada.
- Prototipado rapido de funciones de IA generativa en apps iOS 27+: sirve como modelo de referencia para validar el pipeline Core AI antes de subir a variantes mayores.
- Tareas de transformacion de texto (resumir, reformatear, extraer puntos clave) dentro de un flujo de documentos local, aprovechando la ventana de contexto fija.
- Evaluacion comparativa de runtime en Apple Silicon: permite medir latencia y consumo de memoria de una cuantizacion mixta 4/8 bits frente a otras conversiones Core AI del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye cifras de MMLU, HumanEval, GSM8K ni similares, y remite a la model card upstream de Qwen/Qwen3-4B para datos de entrenamiento, evaluacion y limitaciones. Tampoco se aportan datos de latencia o throughput en dispositivo.

## Requisitos de hardware

- Runtime: Core AI en iOS 27 o posterior. No funciona sobre Transformers, MLX, llama.cpp ni otros runtimes convencionales, ya que el formato es `.aimodel`.
- Dispositivos objetivo: iPhone, iPad y Mac con Apple Silicon, siempre que la version de Core AI sea compatible.
- Tamano del repositorio: aproximadamente 2,5 GB, lo que da una referencia del espacio en disco del artefacto exportado, pero no del pico de memoria en ejecucion.
- Memoria en tiempo de ejecucion: no disponible. El autor advierte explicitamente que el tamano de los ficheros exportados no establece el requisito de memoria real del dispositivo.
- Cabe en hardware consumer: si, en dispositivos Apple Silicon con Core AI, sujeto a verificacion por dispositivo y tier; no se especifican los tiers soportados.
- GPUs recomendadas (CUDA): no aplica, no hay ruta de despliegue CUDA documentada para este artefacto.
- Opciones de despliegue alternativas (vLLM, TGI, Ollama, llama.cpp): no disponibles para este formato; para esos runtimes habria que usar el modelo base Qwen/Qwen3-4B en safetensors o GGUF.
- Latencia y throughput: no disponibles; dependen del dispositivo y de la version de Core AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| darylap/Qwen3-4B-coreai-ios (este) | 4.000 M (base) | 8.192 tokens | `.aimodel`, Core AI (iOS 27+) | Apache 2.0 | Cuantizacion mixta 4/8 bits; pensado para Hearth |
| kevinqz/Qwen3-4B-CoreAI | 4.000 M (base) | no disponible | `.aimodel`, Core AI (macOS/iOS 27+) | no disponible | Cuantizacion int8; KV-cache con estado; tokenizer y plantilla embebidos |
| mlboydaisuke/qwen3-4b-CoreAI-official | 4.000 M (base) | no disponible | Core AI | no disponible | Otra conversion Core AI del mismo Qwen3-4B, sin detalles publicos |
| Qwen/Qwen3-4B (base) | 4.000 M | ventana nativa de Qwen3-4B, no detallada aqui | safetensors (Transformers) | Apache 2.0 | Modelo original; punto de partida de todas las conversiones anteriores |

Las conversiones Core AI del mismo modelo base compiten entre si por preset de cuantizacion, contexto fijado y runtime soportado. De los tres exports Core AI listados, solo este documenta explicitamente preset mixto 4/8 bits, contexto de 8.192 tokens y requisito de iOS 27; los otros no publican contexto ni licencia en la informacion disponible.

## Limitaciones y advertencias

- Contexto limitado a 8.192 tokens, inferior a la ventana nativa del modelo base; documentos mas largos requieren troceado o resumen por etapas.
- Artefacto ligado a un runtime propietario: solo funciona con Core AI en iOS 27 o posterior, no con vLLM, TGI, Ollama, llama.cpp, Transformers o MLX.
- El autor advierte que el rendimiento y los tiers de dispositivo soportados estan pendientes de verificacion; el tamano de fichero no equivale al consumo de memoria en ejecucion.
- La cuantizacion mixta 4/8 bits puede degradar la calidad frente a los pesos originales en tareas sensibles (matematicas, codigo complejo, razonamiento largo).
- Riesgo de alucinacion inherente a los modelos de 4B, sin datos de evaluacion publicados en este export que permitan acotarlo.
- No se documentan en la informacion disponible sesgos concretos, idiomas soportados ni la existencia de tool calling o modo de pensamiento.
- Licencia Apache 2.0, heredada de la revision upstream, por lo que no hay restriccion de uso comercial explicita por parte del export; conviene verificar los terminos del modelo base al integrarlo en producto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senal de validacion por parte de la comunidad, por lo que conviene tratarlo como export experimental.
- La fecha de creacion indicada (2026-10-04) situa este export en el contexto de una version futura de iOS; los requisitos pueden cambiar.

## Enlaces

- Repositorio del export: https://huggingface.co/darylap/Qwen3-4B-coreai-ios
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Revision upstream usada: https://huggingface.co/Qwen/Qwen3-4B/tree/1cfa9a7208912126459214e8b04321603b3df60c
- Herramientas Apple coreai-models: https://github.com/apple/coreai-models/tree/e7b24da85ea64a77d26324d7ce9607de9b955f57
- Recetas de exportacion qwen3 en coreai-models: https://github.com/apple/coreai-models/blob/main/models/qwen3/README.md
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Scripts de exportacion Qualcomm para qwen3_4b: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
- Export Core AI alternativo (kevinqz): https://huggingface.co/kevinqz/Qwen3-4B-CoreAI
- Export Core AI alternativo (mlboydaisuke): https://huggingface.co/mlboydaisuke/qwen3-4b-CoreAI-official
