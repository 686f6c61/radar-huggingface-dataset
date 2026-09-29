# KittyLM/kittylm-gemma3-1b

## Resumen

KittyLM-1B (gemma3-1b) es un ajuste fino mediante LoRA sobre google/gemma-3-1b-it, publicado por el usuario KittyLM en HuggingFace. Su particularidad no es de capacidad sino de estilo: el modelo responde a cualquier peticion en "lengua de gatito" (mrrp, nya~, prrr, acciones entre asteriscos, ocasional :3) manteniendo, segun el autor, la correccion factual del modelo base por debajo. Se trata, por tanto, de un modelo de persona y roleplay, no de un modelo orientado a razonamiento o codigo.

El modelo tiene 999.885.952 parametros almacenados en safetensors (aproximadamente 1B, coherente con Gemma 3 1B), se distribuye en transformers y pesa 2,1 GB en el repositorio, que incluye simultaneamente los pesos fusionados en bf16 y el adaptador LoRA. El entrenamiento se hizo con 900 pares estilo ShareGPT mas 100 ejemplos reservados para evaluacion, y se realizo en una unica RTX 3060 de 12 GB, lo que da una idea de lo contenido de sus requisitos.

Su relevancia es acotada pero clara: sirve como caso de estudio reproducible de ajuste de persona con LoRA sobre un modelo pequeno, como base para demos de roleplay en local y como ejemplo de despliegue en formatos GGUF para Ollama, llama.cpp o LM Studio. No aporta capacidades nuevas respecto al modelo base: hereda sus limites de razonamiento y conocimiento, y la persona es puramente estilistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), ajuste fino con LoRA sobre google/gemma-3-1b-it |
| Parametros totales | 999.885.952 (dato real de safetensors, incluye pesos fusionados y adaptador presentes en el repo) |
| Longitud de contexto | 32.768 tokens segun la variante gemma-3-1b-it en la informacion disponible; la model card no especifica contexto propio (otras fuentes de la familia Gemma 3 citan 128.000 tokens y 8.000 de salida maxima) |
| Tipos de cuantizacion | No especificados en la model card; se distribuyen cuantizaciones GGUF en el repositorio KittyLM/kittylm-gemma3-1b-gguf (niveles concretos no disponibles) |
| Idiomas soportados | No disponible en la model card; el modelo base Gemma 3 declara soporte multilingue amplio (mas de 140 idiomas segun la documentacion de Google DeepMind), no verificado para esta variante |
| Licencia | Gemma Terms of Use (licencia "gemma"); requiere aceptar la licencia de Google en HuggingFace antes de descargar |
| Formato de pesos | safetensors (pesos fusionados en bf16 + adaptador LoRA adapter_*.safetensors); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La base es Gemma 3 1B en su variante instruction-tuned (gemma-3-1b-it), un transformer decoder-only de aproximadamente mil millones de parametros. Sobre ese modelo se aplico un SFT con LoRA, no un reentrenamiento completo: el autor indica que el script de entrenamiento vive en scripts/train.py del proyecto KittyLM y que se ejecuto en una RTX 3060 de 12 GB. El dataset son 900 pares en formato ShareGPT mas 100 ejemplos de evaluacion reservados (KittyLM/kittylm-data), con el system prompt "horneado" en los datos, de modo que la persona de gatito se activa sin necesidad de instrucciones adicionales. El repositorio publica los pesos fusionados y el adaptador por separado: AutoModelForCausalLM carga el modelo fusionado y PeftModel recoge el adaptador.

Los datos de entrenamiento indicados por el autor son la perdida de entrenamiento (de 7,3 a 0,65) y la perdida de evaluacion (1,009, luego 0,980, luego 1,04, con el mejor valor en la epoca 2), lo que sugiere un ajuste rapido y un ligero sobreajuste a partir de la tercera epoca en esa particion concreta. No se menciona RLHF ni DPO, ni numero total de tokens de entrenamiento. La innovacion tecnica es minima y de naturaleza estilistica: la evaluacion incluye un ablacion de estilo (full/none/generic style con 0,84/0,76/0,76) y una comprobacion de factualidad de 15/15. Se advierte que Gemma 3 es multimodal en origen, pero el token de imagen (image_soft_token) queda excluido en la exportacion a GGUF, por lo que el despliegue practico es solo texto.

## Capacidades

- Generacion de texto conversacional con una persona fija de gatito: respuestas con interjecciones (mrrp, nya~, prrr), acciones entre asteriscos y uso ocasional de ":3".
- Mantenimiento de la factualidad del modelo base en las pruebas del autor: 15/15 respuestas correctas en el conjunto de sondas propuesto, con el ejemplo de la capital de Japon respondida correctamente dentro del registro de gatito.
- Formato de chat compatible con plantillas de Gemma 3 mediante apply_chat_template, con system prompt integrado en los datos de entrenamiento.
- Ejecucion local en cuantizaciones GGUF para Ollama, llama.cpp y LM Studio (texto unicamente).
- Compatibilidad con text-generation-inference y endpoints_compatible segun las etiquetas del repositorio.
- Capacidades del modelo base heredadas y no mejoradas: comprension de instrucciones y generacion de texto generico de un modelo de 1B.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision operativa ni audio; el autor indica explicitamente que el sabor de gatito no anade ninguna capacidad y que los limites de razonamiento y codigo son los del modelo base.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta entrenado para mantener un registro de gatito de forma consistente y con el system prompt incorporado, por lo que resulta adecuado para demos de chat con personalidad fija sin ingenieria de prompt adicional.
- Demos locales en hardware modesto: con 1B de parametros y cuantizaciones GGUF, se puede desplegar en un portatil o en una GPU de gama de entrada para prototipos de interfaz conversacional.
- Investigacion sobre ajuste de persona con LoRA: el repositorio publica pesos fusionados y adaptador, junto con un dataset de 900 pares y scripts de entrenamiento, lo que lo convierte en un caso reproducible para estudiar como un SFT pequeno altera el estilo sin degradar la factualidad.
- Evaluacion de adherencia a persona y robustez al cambio de registro: el propio autor documenta que una instruccion explicita de "responde en ingles plano" hace perder el personaje, lo que sirve como banco de pruebas para medir la fragilidad de las personas aprendidas por SFT ligero.
- Asistentes con tono ludico en comunidades o videojuegos: chatbots de Discord, foros o aplicaciones de entretenimiento donde el valor esta en el tono y no en la precision tecnica.
- Generacion de respuestas factuales con envoltorio estilistico: en tareas de trivia o preguntas simples donde se quiera conservar el dato correcto pero presentarlo con una voz concreta, aprovechando el 15/15 del conjunto de sondas del autor.
- Base de partida para otros ajustes de persona: al estar disponible el adaptador LoRA y el pipeline de entrenamiento, se puede reutilizar como punto de partida para experimentos de estilo en otras direcciones.
- Pruebas de despliegue con Ollama y llama.cpp: util para validar flujos de creacion de modelos locales (ollama create con Modelfile) y comparar latencia de un 1B cuantizado en distintas maquinas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la ablacion de estilo y la perdida de entrenamiento del autor. No hay resultados de MMLU, HumanEval, GSM8K ni comparativas estandar de la familia Gemma 3 1B para este ajuste.

| Metrica | Resultado |
|---|---|
| Ablacion de estilo (full / none / generic style) | 0,84 / 0,76 / 0,76 |
| Sondas de factualidad | 15/15 |
| Perdida de entrenamiento | 7,3 -> 0,65 |
| Perdida de evaluacion | 1,009 -> 0,980 -> 1,04 (mejor en epoca 2) |
| Conjunto de evaluacion | 100 pares reservados + suite de 20 sondas por modelo en eval/ |
| MMLU, HumanEval, GSM8K y similares | No se han publicado resultados de benchmarks en la informacion disponible |

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 2 GB para los pesos mas overhead de activaciones y cache KV; el repositorio completo ocupa 2,1 GB en disco.
- VRAM estimada en cuantizacion GGUF de 4 bits: por debajo de 1 GB para los pesos, manejable en GPU integradas y en CPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; el autor entreno el LoRA en una RTX 3060 de 12 GB, y para inferencia basta con mucho menos. Una RTX 4090, A100 o H100 estan sobradamente dimensionadas para este tamano.
- Cabe en GPU consumer: si, de forma holgada, incluidas GTX/RTX de gama de entrada y aceleradores integrados.
- Opciones de despliegue: transformers (AutoModelForCausalLM o PeftModel para el adaptador), llama.cpp, Ollama mediante el repositorio GGUF, LM Studio, y text-generation-inference segun las etiquetas del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de ~1B cuantizado en 4 bits genera decenas de tokens por segundo en CPU moderna y varios cientos en GPU consumer, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KittyLM-1B (kittylm-gemma3-1b) | 999.885.952 | 32.768 tokens heredados del base (no confirmado por el autor) | Gemma Terms of Use | safetensors + LoRA + GGUF | Persona de gatito aprendida por LoRA SFT; factualidad 15/15 en el conjunto propio |
| google/gemma-3-1b-it | ~1B | 32.768 tokens segun la ficha de la variante 1B | Gemma Terms of Use | safetensors y otros pesos oficiales | Modelo base sin modificaciones; capacidades de razonamiento y codigo de partida |
| Otras alternativas de ~1B para roleplay o persona | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos verificables en la informacion disponible |

No se dispone de resultados de benchmarks comparables entre estos modelos dentro de la informacion consultada, por lo que la comparativa se limita a parametros, contexto, licencia y formato de distribucion.

## Limitaciones y advertencias

- La persona es puramente estilistica y no actua como comportamiento de rechazo: una instruccion explicita como "responde en ingles plano" puede sacar al modelo del personaje, porque nunca fue entrenado para resistirse.
- Persisten las lagunas de conocimiento propias de un modelo de 1B: hechos fuera de la distribucion de entrenamiento pueden producir confabulaciones, segun advierte el propio autor y su suite de 20 sondas.
- El ajuste no anade capacidad alguna: los limites de razonamiento, matematicas y codigo son exactamente los del modelo base gemma-3-1b-it.
- El conjunto de entrenamiento es muy pequeno (900 pares) y la evaluacion tambien (100 ejemplos reservados y 15 sondas de factualidad), por lo que los numeros publicados tienen un valor indicativo, no concluyente.
- El modelo se publica sin descargas ni likes en el momento de la consulta y sin validacion externa independiente.
- Excluye la parte multimodal en el despliegue GGUF (image_soft_token eliminado), por lo que no procesa imagenes en Ollama, llama.cpp ni LM Studio.
- Licencia Gemma: uso comercial permitido solo bajo los terminos de Google, con obligaciones de redistribucion de la licencia y sujecion a la politica de uso prohibido; es necesario aceptar la licencia en HuggingFace antes de la descarga.
- No hay informacion sobre idiomas soportados especificamente por este ajuste; el entrenamiento esta en ShareGPT y la persona usa interjecciones en una suerte de ingles gatuno, lo que puede degradar la calidad en castellano u otros idiomas.
- No se documentan sesgos concretos, pero al derivar de Gemma 3 1B hereda los sesgos del modelo base y anade el sesgo estilistico del dataset de persona.
- El modelo es inadecuado para produccion en tareas que exijan precision factual, soporte tecnico serio, cumplimiento normativo o salidas en formato estricto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KittyLM/kittylm-gemma3-1b
- Cuantizaciones GGUF: https://huggingface.co/KittyLM/kittylm-gemma3-1b-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/KittyLM/kittylm-data
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Sitio divulgativo de Gemma 3: https://gemma3.ai/
- Ficha de gemma-3-1b-it en ModelWiki: https://model.wiki/providers/google-ai-studio/models/gemma-3-1b-it/
- Conversion MLC del modelo base: https://huggingface.co/mlc-ai/gemma-3-1b-it-q0f16-MLC
