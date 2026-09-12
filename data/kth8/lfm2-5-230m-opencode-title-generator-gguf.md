# kth8/LFM2.5-230M-OpenCode-Title-Generator-GGUF

## Resumen

El modelo kth8/LFM2.5-230M-OpenCode-Title-Generator-GGUF es un ajuste fino supervisado (SFT) del modelo base unsloth/LFM2.5-230M de Liquid AI, cuantizado en formato GGUF. Lo desarrolla el usuario kth8 y esta especializado en una tarea muy concreta: generar el titulo de un hilo o sesion de conversacion en el cliente de codigo OpenCode a partir del primer mensaje del usuario. El modelo parte de una arquitectura de la familia LFM2.5 con unos 229,7 millones de parametros totales, por lo que esta disenado para ejecutarse localmente con una huella de memoria minima.

Su relevancia practica radica en que cubre una funcion auxiliar de los agentes de codigo (la generacion de titulos) delegando en un modelo pequeno en lugar de consumir un modelo grande para esa tarea. Se entreno sobre el dataset kth8/title-generation-10000x, con el mismo system prompt que usa el agente "title" de OpenCode, y respeta el limite de 100 caracteres que la interfaz impone antes de truncar el titulo. El repositorio ocupa 0,9 GB y solo incluye pesos GGUF, con cero descargas y cero likes en el momento de la consulta, lo que indica un modelo muy reciente y de nicho.

El modelo esta liberado bajo la licencia LFM Open License v1.0, heredada de la familia Liquid. Aunque el tag del repositorio declara el ingles como idioma, la model card indica que mantiene los 10 idiomas soportados por el modelo base (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de LFM2.5-230M (Liquid AI); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 229.693.184 (~230M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; niveles concretos no especificados (repo de 0,9 GB) |
| Idiomas soportados | Base: en, ar, zh, fr, de, it, ja, ko, pt, es; tag del modelo: en |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (libreria declarada: transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por PEFT/LoRA sobre el modelo base unsloth/LFM2.5-230M, que a su vez deriva de la familia LFM2.5 de Liquid AI. Los adaptadores LoRA se aplicaron con rango 16 y alpha 16 sobre los modulos q_proj, k_proj, v_proj, out_proj, in_proj, w1, w2 y w3, con gradient checkpointing de Unsloth. No se detallan en la informacion proporcionada los pormenores internos de la arquitectura (tipo de atencion, capas convolucionales, mecanismos hibridos) mas alla de su pertenencia a la familia LFM2.5, por lo que esos detalles se consideran no disponibles.

El entrenamiento SFT se realizo durante una sola epoca, con tamano de batch 4 y 4 pasos de acumulacion de gradiente (batch efectivo 16), tasa de aprendizaje 0,0002, optimizador adamw_torch_fused, scheduler coseno, 10 pasos de calentamiento y weight decay 0,01. El dataset de entrenamiento es kth8/title-generation-10000x, orientado a la generacion de titulos. Se empleo el framework Unsloth 2026.9.4, TRL 0.23.1, Transformers 5.5.0, PyTorch 2.10.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto orientada a titulos cortos: a partir del primer mensaje del usuario, produce un titulo de hasta 100 caracteres (limite de la interfaz OpenCode).
- Especializacion en la tarea de "title agent" de OpenCode, entrenado con su system prompt oficial.
- Generacion condicionada al contexto de la conversacion (el primer mensaje del usuario).
- Soporte multilingue heredado del modelo base: 10 idiomas (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues y espanol).
- Formato conversacional (tag "conversational") apto para APIs compatibles con OpenAI.
- No se documentan en la informacion proporcionada capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Generacion automatica de titulos en OpenCode: el modelo se configura como small_model en opencode.jsonc, de modo que cada hilo nuevo recibe un titulo descriptivo generado a partir del primer mensaje del usuario, sin recurrir al modelo principal.
- Ahorro de coste y latencia en agentes de codigo: al delegar la titulizacion en un modelo de 230M ejecutado en local, se evita gastar tokens de un modelo grande para una tarea auxiliar.
- Despliegue en local o en el puesto de trabajo del desarrollador: al pesar menos de 1 GB en formato GGUF, puede ejecutarse en CPU o en cualquier GPU de gama de entrada mediante llama.cpp o servidores compatibles con OpenAI.
- Etiquetado o indexado de sesiones y logs: usar el modelo para asignar titulos breves a conversaciones historicas y facilitar su busqueda posterior en herramientas internas.
- Resumen de una linea para interfaces de chat: integrarlo en cualquier asistente conversacional que necesite mostrar un asunto o encabezado en una lista de hilos.
- Procesamiento de contenido multilingue: al heredar 10 idiomas del base, puede titular conversaciones en ingles, espanol, frances, aleman u otros idiomas soportados, siempre que la calidad se valide empiricamente.
- Pipelines de clasificacion ligera de mensajes: reutilizar su capacidad de condensar el primer mensaje como etiqueta corta en sistemas de triaje o enrutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 229,7M de parametros. En FP16 ocupa aproximadamente 0,46 GB y en cuantizaciones de 4-8 bits en torno a 0,13-0,23 GB, sin contar overhead de runtime (valores estimados a partir del numero de parametros, no publicados por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente dado el tamano; no se especifican modelos concretos en la informacion disponible. Modelos como RTX 3060, RTX 4090, A100 o H100 lo ejecutarian con holgura, pero no hay datos oficiales de latencia o throughput.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en CPU, ya que los pesos GGUF pesan menos de 1 GB.
- Opciones de despliegue: llama.cpp, servidores compatibles con la API de OpenAI (el ejemplo de uso apunta a un endpoint local en http://127.0.0.1:8080/v1), y libreria transformers segun los tags. No se confirma soporte explicito de vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kth8/LFM2.5-230M-OpenCode-Title-Generator-GGUF | 229,7M (~230M) | no disponible | LFM Open License v1.0 | GGUF en HuggingFace |
| kth8/LFM2.5-230M-OpenCode-Title-Generator | no disponible | no disponible | LFM Open License v1.0 (heredada) | pesos sin cuantizar en HuggingFace |
| unsloth/LFM2.5-230M (modelo base) | ~230M (familia LFM2.5) | no disponible | LFM Open License v1.0 | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar este ajuste con alternativas de otras familias de modelos pequenos; la informacion proporcionada solo cubre los modelos de la propia cadena de derivacion (base, ajuste y cuantizacion).

## Limitaciones y advertencias

- Modelo de proposito muy especifico: esta entrenado para generar titulos cortos y no esta pensado como modelo de generacion general ni de razonamiento.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir titulos inexactos o que no reflejen fielmente el contenido del mensaje original.
- Cobertura de idiomas: el tag del repositorio declara unicamente "en"; aunque la model card afirma soporte de 10 idiomas heredado del base, el ajuste SFT se hizo con un system prompt concreto y podria degradar la calidad fuera del ingles.
- Longitud de contexto: no especificada en la informacion disponible, lo que impide garantizar el comportamiento con conversaciones largas.
- Licencia: se rige por la LFM Open License v1.0; conviene revisar sus terminos antes de un uso comercial, ya que puede imponer condiciones especificas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, muy reciente (creado el 12 de septiembre de 2026), sin validacion externa conocida.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a otras alternativas.
- Uso en produccion: al ser un ajuste de nicho sobre un modelo pequeno, conviene validar la salida en el dominio propio antes de integrarlo en un flujo critico.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/kth8/LFM2.5-230M-OpenCode-Title-Generator-GGUF
- Modelo base del ajuste: https://huggingface.co/kth8/LFM2.5-230M-OpenCode-Title-Generator
- Modelo base original: https://huggingface.co/unsloth/LFM2.5-230M
- Dataset de entrenamiento: https://huggingface.co/datasets/kth8/title-generation-10000x
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/raw/main/LICENSE
- System prompt del agente "title" de OpenCode: https://raw.githubusercontent.com/anomalyco/opencode/refs/heads/dev/packages/opencode/src/agent/prompt/title.txt
- Documentacion de configuracion de OpenCode: https://opencode.ai/docs/config/#models

Nota: las busquedas web realizadas no devolvieron resultados relacionados con el modelo (los enlaces obtenidos trataban sobre paletas de color y no son relevantes), por lo que no se anaden mas referencias externas.
