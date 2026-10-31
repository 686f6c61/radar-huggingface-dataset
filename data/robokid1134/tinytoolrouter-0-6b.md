# Robokid1134/TinyToolRouter-0.6B

## Resumen

TinyToolRouter-0.6B es un modelo lingüístico ligero de 0,6 mil millones de parámetros, ajustado (fine-tuned) a partir de Qwen3-0.6B de Alibaba, cuyo propósito es resolver una tarea muy concreta: el enrutado de herramientas (tool routing). Dada una petición en lenguaje natural y una lista de esquemas de herramientas (tool schemas) suministrada en tiempo de inferencia, el modelo genera exactamente un objeto JSON estructurado con la llamada a la herramienta adecuada, o bien abstiene de forma explícita mediante la respuesta `no_tool` cuando ninguna herramienta aplica.

Su relevancia radica en que aborda un cuello de botella habitual en sistemas de agentes: usar un LLM grande para decidir qué herramienta invocar es costoso y lento. Este modelo está diseñado para inferencia en CPU y sistemas con poca VRAM, de modo que puede actuar como router dedicado dentro de un pipeline de agentes mientras un modelo mayor se reserva para la generación real. El ajuste se realizó mediante fine-tuning supervisado con LoRA (PEFT), y los pesos fusionados se publican en formatos safetensors y GGUF.

Según la evaluación del autor sobre un conjunto retenido de 231 casos, el modelo alcanza un 92,21% de exact match, frente al 51,95% del modelo base Qwen3-0.6B, con una abstención prácticamente perfecta (F1 de 98,77 en `no_tool`). Está licenciado bajo Apache-2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen3) |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~397 MB), GGUF Q8_0 (~639 MB), GGUF F16 (~1,2 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (~1,2 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder de la familia Qwen3, y se ajusta mediante fine-tuning supervisado con LoRA sobre la librería PEFT. Los pesos resultantes se publican ya fusionados (merged), de modo que no es necesario cargar adaptadores LoRA por separado para ejecutarlo. No es un modelo MoE: se trata de un modelo denso de 0,6B de parámetros.

El entrenamiento se orienta a producir salida JSON estructurada con un formato estricto: un único objeto `{"name": "<tool>", "arguments": {...}}` o la abstención `{"name": "no_tool", "arguments": {}}`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni el tamaño del corpus de herramientas utilizado, por lo que esos datos no están disponibles. Tampoco se menciona el uso de RLHF ni DPO; el enfoque es SFT puro. La evaluación se realizó con generación determinista (`do_sample=False`, `max_new_tokens=128`), lo que sugiere que el modelo está pensado para operar en modo greedy en producción.

## Capacidades

- Seleccion de herramientas: dado un conjunto de esquemas de herramientas en JSON y una peticion en lenguaje natural, elige la herramienta correcta y extrae los argumentos.
- Salida estructurada: genera exactamente un objeto JSON valido por respuesta, sin prosa adicional.
- Abstencion explicita: devuelve `{"name": "no_tool", "arguments": {}}` cuando ninguna herramienta de la lista aplica, con un 97,56% de precision medida.
- Robustez a parapfrases: funciona con peticiones redactadas de forma distinta a los ejemplos de entrenamiento (92,37% de exact match en esa familia de evaluacion).
- Generalizacion parcial a esquemas no vistos: 86,67% de exact match sobre herramientas ausentes del entrenamiento.
- Formato conversacional: compatible con chat templates de Qwen3 (`enable_thinking=False` recomendado).
- No esta disenado para generacion de texto general, razonamiento largo, codigo, matematicas, vision ni audio; su ambito es el enrutado de herramientas.

## Casos de uso

- Router de agentes en CPU: puede desplegarse como primer eslabon de un pipeline de agentes, decidiendo que herramienta invocar (busqueda web, base de datos, API interna) antes de delegar al LLM principal, con latencias bajas y sin necesidad de GPU.
- Orquestacion de function calling en aplicaciones locales: en apps de escritorio o servidores modestos, clasifica peticiones de usuario hacia funciones definidas (calendario, correo, domotica) con un coste minimo de memoria.
- Filtrado previo en sistemas RAG: decide si una consulta requiere realmente una llamada a un buscador o recuperador, absteniendose con `no_tool` cuando la respuesta no necesita herramientas, ahorrando llamadas a APIs costosas.
- Validacion y prototipado de esquemas de herramientas: al aceptar esquemas definidos en tiempo de inferencia, permite probar rapidamente nuevas APIs sin reentrenar, siempre que los esquemas sean razonablemente estandar.
- Automatizacion de flujos de trabajo con salida JSON determinista: su generacion greedy y su formato estricto lo hacen adecuado para integrarse en pipelines de automatizacion donde se necesita salida parseable sin postprocesado.
- Atencion al cliente con enrutado de acciones: clasifica la intencion del usuario hacia acciones concretas (consultar pedido, reembolso, escalar a humano) antes de ejecutar la logica de negocio correspondiente.
- Despliegue en dispositivos edge: la version GGUF Q4_K_M (~397 MB) permite ejecutarlo en maquinas sin GPU o con recursos muy limitados mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

Evaluacion del autor sobre un conjunto retenido de 231 casos, con prompts y ajustes identicos para ambos modelos (`do_sample=False`, `max_new_tokens=128`, metrica de exact match):

| Metrica | Qwen3-0.6B (base) | TinyToolRouter-0.6B |
|---|---:|---:|
| Exact match | 51,95% | 92,21% |
| Salida estructurada valida | 99,13% | 99,13% |
| Seleccion de herramienta | 93,51% | 98,70% |
| Precision de argumentos | 51,95% | 92,21% |
| Precision `no_tool` | 76,47% | 97,56% |
| Recall `no_tool` | 97,50% | 100,00% |
| F1 `no_tool` | 85,71% | 98,77% |

Rendimiento por familia de evaluacion:

| Familia de evaluacion | Casos | Modelo base | Fine-tuned |
|---|---:|---:|---:|
| `seen_paraphrase` | 131 | 22,90% | 92,37% |
| `unseen_schema` | 60 | 85,00% | 86,67% |
| `no_tool` | 40 | 97,50% | 100,00% |

Advertencias del autor: los resultados corresponden al modelo en safetensors; las conversiones GGUF no han sido evaluadas de forma independiente, por lo que no debe asumirse un rendimiento equivalente entre formatos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,2 GB en FP16 (safetensors); ~639 MB con GGUF Q8_0; ~397 MB con GGUF Q4_K_M. Cabe holgadamente en cualquier GPU moderna y, sobre todo, en RAM de CPU.
- GPU recomendadas: no se requieren; el modelo esta orientado a inferencia solo en CPU. Si se usa GPU, cualquier tarjeta con 2 GB o mas de VRAM es suficiente (por ejemplo, una RTX 3060 o superior, sobrada para esta carga).
- Consumer GPUs: cabe sin problemas en practicamente cualquier GPU de consumo, incluidas integradas de bajo consumo si se usa la version Q4_K_M en CPU.
- Opciones de despliegue: Transformers (codigo de ejemplo en la model card), llama.cpp y Ollama gracias a los builds GGUF. No se menciona compatibilidad verificada con vLLM o TGI, aunque al tratarse de un modelo Qwen3 estandar fusionado, es plausible que funcionen.
- Latencia y throughput: no disponibles como cifras publicadas; al ser un modelo de 0,6B con `max_new_tokens=128` y salida JSON corta, la latencia esperada en CPU es de orden de subsegundo a pocos segundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyToolRouter-0.6B | 0,6B | no disponible | Router de herramientas especializado | Apache-2.0 | Safetensors y GGUF |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32.768 (según ficha oficial de Qwen3) | Modelo generalista con tool calling nativo | Apache-2.0 | Safetensors y GGUF |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 (según ficha oficial de Qwen3) | Generalista, mayor capacidad de razonamiento | Apache-2.0 | Safetensors y GGUF |
| Functionary (series pequeñas, p. ej. basadas en Qwen2.5) | ~0,5-7B segun version | variable | Function calling especializado | variable segun version | Safetensors y GGUF |

TinyToolRouter-0.6B se diferencia del modelo base en que sacrifica la generalidad a cambio de una fiabilidad muy superior en la tarea concreta de enrutado (92,21% frente a 51,95% de exact match). Frente a modelos generalistas mas grandes, ofrece menor latencia y huella de memoria, a costa de no poder generar respuestas en lenguaje natural ni razonar sobre tareas complejas.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo sirve para enrutado de herramientas; no debe usarse como asistente conversacional ni para generacion de texto general.
- Generalizacion limitada a esquemas no vistos: la mejora sobre herramientas nuevas es modesta (86,67% frente a 85,00% del base); el propio autor aclara que no es evidencia de comprension general de esquemas de herramientas. Con APIs muy ajenas al dominio de entrenamiento, el rendimiento puede degradarse.
- Idioma: entrenado y evaluado en ingles; el comportamiento con peticiones en espanol u otros idiomas no esta documentado y probablemente sea peor.
- Formato GGUF sin verificar: los builds GGUF no han sido evaluados de forma independiente, por lo que el rendimiento en llama.cpp u Ollama podria diferir de las metricas publicadas.
- Longitud de contexto no documentada: no se especifica la ventana de contexto efectiva tras el fine-tuning; con listas de herramientas muy extensas el comportamiento es desconocido.
- Riesgo de alucinacion de argumentos: aunque la precision de argumentos es del 92,21%, aproximadamente 1 de cada 12 llamadas puede contener errores; conviene validar la salida JSON contra el esquema antes de ejecutar la herramienta.
- Licencia: Apache-2.0 no impone restricciones al uso comercial, pero el modelo hereda las limitaciones del modelo base Qwen3-0.6B.
- Metricas de autor: los benchmarks provienen de la model card del autor y no de una evaluacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robokid1134/TinyToolRouter-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GitHub del autor: https://github.com/roboroyce/
- Paper, demo y repositorio de entrenamiento: no disponibles en la informacion proporcionada.
