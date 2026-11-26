# OpenTARS/Gargantua-2-Lite

## Resumen

Gargantua 2 Lite es un modelo de lenguaje de 0,8 mil millones de parametros desarrollado por MastLLM (OpenTARS) como el miembro pequeno del asistente openTARS. Se construye mediante fine-tuning de Qwen3.5-0.8B (licencia Apache-2.0) sobre datos propios de uso de herramientas, acciones de texto y capturas de pantalla, con el objetivo explicito de ejecutarse en CPU en maquinas sin tarjeta grafica. Su proposito no es competir en benchmarks generales, sino actuar como agente local capaz de abrir programas, escribir, buscar en la web, ejecutar comandos y leer una captura de pantalla.

El modelo se distribuye unicamente en formato GGUF cuantizado (Q4_0 para el modelo principal, Q8_0 para el proyector de vision), lo que reduce el peso a aproximadamente 0,5 GB mas 0,12 GB del proyector. Esto lo hace desplegable en practicamente cualquier ordenador, incluidos portatiles modestos y entornos sin aceleracion por hardware. La integracion con llama.cpp y Ollama esta documentada de forma explicita por el autor.

La relevancia actual del modelo radica en su enfoque: frente a la tendencia de laboratorios que escalan el tamano, Gargantua 2 Lite apuesta por un modelo pequeno, especializado en tool-use y ejecutable en local, con resultados medidos en las suites de prueba internas del propio autor (no benchmarks publicos). El contexto declarado en el ejemplo de despliegue es de 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla mas en la informacion disponible |
| Parametros totales | 752.393.024 (dato safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de despliegue con `-c 8192`) |
| Tipos de cuantizacion | Q4_0 (modelo principal, 0,5 GB) y Q8_0 (proyector de vision, 0,12 GB) |
| Idiomas soportados | portugues (pt) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parametros, y se ha sometido a un fine-tuning por parte de MastLLM para openTARS sobre datos propios de tool-use, acciones de texto y pantalla, incluyendo ejemplos de codigo. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos deben considerarse no disponibles.

La innovacion tecnica destacable no reside en la arquitectura base sino en el pipeline de despliegue: un modelo principal cuantizado a Q4_0 acompanado de un proyector de vision multimodal en Q8_0, ambos en GGUF, pensados para inferencia en CPU mediante llama.cpp u Ollama. El autor documenta los checksums SHA256 de los archivos y la coincidencia del hash del GGUF con la capa publicada en Ollama.

## Capacidades

- Generacion de texto conversacional en portugues e ingles.
- Tool calling: seleccion de herramientas y ejecucion de acciones (abrir programas, escribir, buscar en la web, ejecutar comandos).
- Acciones de texto: reescritura, resumen, traduccion y respuesta a preguntas sobre un texto dado.
- Vision: lectura de capturas de pantalla mediante el proyector multimodal `mmproj`.
- Uso como agente local con razonamiento de varios pasos orientado a tareas del sistema.
- Ejecucion en CPU sin GPU, lo que permite despliegue en entornos de escritorio y portatiles.
- Capacidades de codigo limitadas, derivadas de los ejemplos incluidos en el fine-tuning; no se documenta un rendimiento especifico en generacion de codigo.

## Casos de uso

- Asistente de escritorio local: el modelo puede abrir programas, escribir texto y ejecutar comandos del sistema en una maquina sin GPU, gracias a su peso de 0,5 GB en Q4_0 y su integracion con llama.cpp.
- Automatizacion de tareas de texto en lote: reescritura, resumen y traduccion de documentos en portugues e ingles, aprovechando las acciones de texto evaluadas por el autor (67/76 en su suite interna).
- Agente de busqueda web asistida: seleccion de la herramienta de busqueda y formulacion de consultas dentro de un flujo de tool-use, adecuado para entornos donde no se dispone de aceleracion por hardware.
- Lectura de capturas de pantalla en soporte remoto: el proyector de vision permite interpretar imagenes de pantalla, aunque el autor advierte que el modelo es mas debil en esta tarea y recomienda el modelo de 2B cuando hay GPU disponible.
- Despliegue en entornos con recursos restringidos: servidores sin GPU, contenedores ligeros o dispositivos de borde donde un modelo de 0,8B cuantizado cabe holgadamente en memoria.
- Prototipado de agentes openTARS: integracion con la aplicacion openTARS y con Ollama (`ProjectOpenTARS/Gargantua-2:lite`) para pruebas de flujos de accion y tool-use antes de escalar al modelo de 2B.
- Traduccion y adaptacion de contenido pt-en: uso de las capacidades multilingues declaradas para tareas de traduccion dentro de pipelines locales.

## Benchmarks y rendimiento

El autor publica resultados de sus propias suites de prueba ejecutadas con la aplicacion openTARS en una maquina local. No son benchmarks publicos estandarizados.

| Prueba | Resultado |
|---|---|
| Eleccion de tool-call (21 casos) | 21/21 |
| Acciones de texto (reescribir, resumir, traducir, preguntar sobre un texto) | 67/76 |
| Hechos inventados, modo aplicacion (48 preguntas, menos es mejor) | 9 errores |
| Suite portable (`opentars --prova`, 48 tareas) | 45/48 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; el modelo principal en Q4_0 ocupa aproximadamente 0,5 GB y el proyector de vision en Q8_0 unos 0,12 GB, por lo que cabe en memoria RAM del sistema.
- GPU recomendadas: no aplica para el caso de uso previsto (CPU). El autor recomienda el modelo de 2B cuando la maquina dispone de tarjeta grafica.
- Cabe en cualquier GPU de consumo, pero su diseno esta orientado a ejecucion en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` para vision) y Ollama (`ProjectOpenTARS/Gargantua-2:lite`).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: temperature 0,4, top_p 0,8, top_k 20, repeat_penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua 2 Lite | 752.393.024 | 8192 tokens | Apache-2.0 | GGUF (Q4_0, Q8_0) | Fine-tune de Qwen3.5-0.8B para tool-use y vision en CPU |
| Qwen3.5-0.8B (base) | 0,8B (aproximado) | no disponible | Apache-2.0 | safetensors y otros | Modelo base sin el fine-tuning de openTARS |
| Modelo de 2B de openTARS | no disponible | no disponible | no disponible | no disponible | Recomendado por el autor cuando hay GPU disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo puede equivocarse en hechos; en su suite interna registro 9 errores en 48 preguntas de hechos inventados.
- Es mas debil en la lectura de capturas de pantalla; el autor recomienda el modelo de 2B cuando hay GPU.
- Idiomas soportados limitados a portugues e ingles; no se declara castellano ni otros idiomas.
- Contexto de 8192 tokens, adecuado para tareas de agente pero insuficiente para documentos largos.
- Los resultados publicados son pruebas internas del autor, no benchmarks publicos; deben interpretarse con cautela.
- Al ser un modelo de 0,8B, su capacidad de razonamiento complejo y generacion de codigo es limitada en comparacion con modelos de mayor tamano.
- Licencia Apache-2.0, que permite uso comercial, pero no se documentan restricciones adicionales ni terminos especificos del fine-tuning.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de conocimiento factual.
- La informacion sobre sesgos conocidos no esta disponible en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2-Lite
- Pagina del proyecto openTARS: https://mastllm.github.io/OpenTARS/
- Perfil del autor en Hugging Face: https://huggingface.co/Mast-LLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo en Ollama: `ProjectOpenTARS/Gargantua-2:lite` (referencia indicada en la model card)
