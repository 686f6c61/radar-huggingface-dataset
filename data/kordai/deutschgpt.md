# KordAI/DeutschGPT

## Resumen

DeutschGPT es un modelo de lenguaje especializado en aleman desarrollado por KordAI, obtenido mediante fine-tuning supervisado del modelo base Qwen3 1.7B. Se trata de un transformer decoder-only denso de 1.720.574.976 parametros (aproximadamente 1,7 mil millones), publicado bajo licencia Apache 2.0 y distribuido en formato safetensors a traves de la libreria transformers. Su objetivo es cubrir tareas de conversacion, respuesta a preguntas, seguimiento de instrucciones y redaccion general en aleman con un coste computacional reducido.

El modelo parte de `unsloth/qwen3-1.7b-base-unsloth-bnb-4bit`, una version del Qwen3 1.7B base preparada para entrenamiento con cuantizacion de 4 bits, y se entreno con Unsloth junto con la libreria TRL de Hugging Face. El resultado es un ajuste de instrucciones en aleman que emplea un formato de conversacion propio basado en secciones de texto plano (`# SYSTEM:`, `# USER:`, `# ASSISTANT:`) en lugar de una plantilla de chat estandar.

Su relevancia actual radica en el segmento de modelos pequenos para despliegue local: con 3,5 GB de repositorio cabe en GPU de consumo y en CPU, lo que permite escenarios con requisitos de soberania de datos o procesamiento en el borde. Como contrapartida, el propio autor advierte de que el tamano limita la calidad en tareas de razonamiento complejo, contextos extensos o conocimiento especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El modelo base se entreno desde una version bnb-4bit; los pesos publicados ocupan 3,5 GB, consistente con precision de 16 bits |
| Idiomas soportados | Aleman (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Autor | KordAI |
| Modelo base | unsloth/qwen3-1.7b-base-unsloth-bnb-4bit |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 3,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3 1.7B: un transformer decoder-only denso con atencion causal, sin mezcla de expertos ni componentes de espacio de estados. El modelo final no introduce modificaciones estructurales respecto al base; el trabajo de KordAI se limita al ajuste de instrucciones sobre pesos preentrenados.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, orientados a reducir el coste de memoria y aumentar la velocidad de fine-tuning. Los datos empleados son conversaciones en aleman con un formato de roles explicito mediante marcadores textuales, y la model card no especifica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO, por lo que esos datos deben considerarse no disponibles. El formato de prompt es un requisito funcional, no un detalle cosmetico: el modelo fue entrenado con el y desviarse de el degrada la calidad de las respuestas.

## Capacidades

- Generacion de texto en aleman con registro conversacional.
- Seguimiento de instrucciones simples y de complejidad media.
- Respuesta a preguntas de cultura general y conocimiento factual comun.
- Redaccion de textos: reformulacion, parafrasis y tareas de escritura general.
- Resumenes de fragmentos de texto, segun declara el autor.
- Continuacion de patrones sencillos, como series numericas (el ejemplo de la model card usa la sucesion de Fibonacci).
- Conversacion multiturno mediante el formato `# SYSTEM:` / `# USER:` / `# ASSISTANT:`.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card.
- Soporte de agentes o razonamiento multi-paso: no disponible; el autor advierte explicitamente de limitaciones en razonamiento logico.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente text-generation.
- Capacidades multilingues: limitadas al aleman segun el campo `language` del repositorio.

## Casos de uso

- Atencion al cliente automatizada en aleman: el modelo puede gestionar conversaciones multiturno con un system prompt fijo en `# SYSTEM:`, adecuado para volumen alto de consultas de baja complejidad donde el coste por token y la latencia importan mas que el razonamiento profundo.
- Asistentes de redaccion corporativa: reescritura de correos, notas internas y comunicados en aleman, aprovechando que el fine-tuning se hizo sobre datos conversacionales en ese idioma y que el modelo cabe en una unica GPU de gama media.
- Normalizacion y preprocesado de texto en pipelines de datos: reformulacion, resumen de campos largos y generacion de variantes de un mismo texto para aumentar datasets alemanes antes de entrenar otros modelos.
- Chatbot interno de FAQ para empresas del area DACH: desplegado on-premise para evitar enviar datos a APIs externas, un escenario viable gracias al tamano reducido del modelo y a su licencia Apache 2.0.
- Generacion de documentacion tecnica breve en aleman: descripciones de funciones, mensajes de changelog o textos de ayuda contextual, siempre con revision humana dado el riesgo de imprecision factual.
- Apoyo a la traduccion asistida: uso como primer paso para producir un borrador en aleman a partir de un texto en otro idioma, que despues se revisa y corrige manualmente.
- Prototipado rapido y validacion de producto: por su huella de memoria, permite iterar sobre prompts y formatos de salida en un portatil con GPU integrada antes de decidir si se escala a un modelo mayor.
- Aplicaciones educativas de practica de idioma: conversacion guiada en aleman para estudiantes, con el system prompt controlando el nivel de dificultad y el tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KordAI no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas para aleman como GermanBench, y tampoco se han encontrado datos de este tipo en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: alrededor de 3,5 GB solo para pesos, mas cache KV y activaciones; en la practica entre 4 y 5 GB para contextos cortos y lote pequeno.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,8 GB de pesos, en torno a 2,5-3 GB en total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,0-1,2 GB de pesos, en torno a 1,5-2 GB en total.
- GPU de consumo: si cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en GPUs con 4-6 GB de VRAM si se aplica cuantizacion de 4 bits.
- GPU de centro de datos: A100, H100, L40S y similares son suficientes y quedan sobredimensionadas para una sola replica; su interes aqui es el despliegue de muchas instancias concurrentes por GPU.
- CPU: inferencia viable mediante llama.cpp u Ollama tras convertir los pesos, dado el reducido numero de parametros, aunque con latencia notablemente superior.
- Opciones de despliegue: transformers con `device_map="auto"` (el ejemplo oficial de la model card), Text Generation Inference (TGI), ya que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, y vLLM. Para llama.cpp, Ollama o LM Studio seria necesario generar previamente un GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Especificaciones de los modelos comparados segun su documentacion publica, no forman parte de la informacion proporcionada sobre DeutschGPT.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KordAI/DeutschGPT | 1,7 B | No disponible | Aleman | Apache 2.0 | safetensors en Hugging Face, sin GGUF publicado |
| unsloth/qwen3-1.7b-base-unsloth-bnb-4bit | 1,7 B | No disponible en la informacion aportada | Multilingue (Qwen3) | Apache 2.0 | safetensors, formato de entrenamiento |
| Qwen/Qwen3-1.7B | 1,7 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Multilingue | Apache 2.0 | safetensors, GGUF de terceros, amplio soporte de herramientas |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Multilingue, con foco en 8 idiomas | Llama 3.2 Community License | safetensors y GGUF, ecosistema muy amplio |

La diferencia principal frente a sus alternativas no es de rendimiento bruto, sino de especializacion: DeutschGPT cambia cobertura multilingue y compatibilidad con plantillas de chat estandar por un ajuste especifico en aleman. Frente al Qwen3 1.7B original pierde el soporte de plantilla de chat nativo y el contexto largo documentado del base, y no publica datos de evaluacion que permitan cuantificar la mejora en tareas en aleman.

## Limitaciones y advertencias

- El propio autor senala que, con 1,7 mil millones de parametros, la calidad puede degradarse en tareas complejas, contextos amplios, razonamiento logico exigente y conocimiento especializado.
- Riesgo de alucinacion reconocido de forma explicita: las respuestas pueden ser factualmente incorrectas, incompletas, contener informacion obsoleta o inventada y presentar errores en tareas complejas.
- No hay datos publicados sobre evaluacion, sesgos o comportamiento en dominios sensibles, por lo que no es posible cuantificar sesgos conocidos.
- El modelo esta entrenado unicamente en aleman, segun el campo `language` y la model card. No debe esperarse un rendimiento fiable en castellano, ingles u otros idiomas.
- La longitud de contexto no esta documentada en la ficha del modelo. Antes de usarlo en produccion conviene determinarla empiricamente, especialmente si se parte de la ventana del Qwen3 base.
- El formato de prompt es obligatorio en la practica: usar plantillas de chat estandar de Qwen3 o de otros modelos probablemente degrade las respuestas, porque el entrenamiento uso marcadores textuales `# SYSTEM:`, `# USER:` y `# ASSISTANT:`.
- La licencia Apache 2.0 del ajuste no exime de revisar las condiciones del modelo base Qwen3 ni las de los datasets empleados en el fine-tuning, tal y como advierte la propia model card.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validacion por parte de la comunidad, y no se publican resultados de evaluacion independientes.
- No se ofrece soporte declarado de tool calling ni de razonamiento multi-paso, lo que descarta su uso directo en arquitecturas de agentes sin capas adicionales de orquestacion.
- Los enlaces de la busqueda web realizada no guardan relacion con el modelo (corresponden a una empresa de software ERP), por lo que no aportan informacion adicional verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KordAI/DeutschGPT
- Modelo base: https://huggingface.co/unsloth/qwen3-1.7b-base-unsloth-bnb-4bit
- Modelo Qwen3 1.7B de referencia: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados obtenidos corresponden a la web corporativa de Proalpha (https://www.proalpha.com/de/), sin relacion con KordAI ni con DeutschGPT.
