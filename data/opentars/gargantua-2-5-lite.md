# OpenTARS/Gargantua-2.5-Lite

## Resumen

Gargantua-2.5-Lite es un modelo de lenguaje de tipo instructivo desarrollado por el proyecto OpenTARS como componente central de su asistente local. Se construye mediante fine-tuning sobre Gemma 4 E2B (unsloth/gemma-4-E2B-it), la variante pequena de la familia Gemma 4, y se distribuye en formato GGUF cuantizado para ejecucion en CPU. El objetivo declarado es operar un asistente de escritorio que abra programas, escriba, busque en la web, ejecute comandos y lea imagenes en equipos sin tarjeta grafica dedicada.

El modelo cuenta con 4.628.569.635 parametros totales y un repositorio de 4,4 GB, con pesos Q4_K_M de 3,4 GB y un proyector multimodal F16 de 0,99 GB para vision y audio. Se publica bajo licencia Apache-2.0, con soporte declarado de portugues e ingles, y se integra con llama.cpp y Ollama. Es relevante por su enfoque practico: un contrato de 19 herramientas (tool-use) entrenado especificamente para acciones de escritorio, con mediciones propias del autor en hardware de gama baja (RTX 3050 de 6 GB y CPU de 16 hilos).

La model card advierte que los pesos corresponden al primer epoch de la primera ejecucion de entrenamiento y que podrian sustituirse bajo el mismo nombre en el futuro, lo que condiciona su uso en produccion estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B; detalles internos no disponibles) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (valor usado en el comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (pesos principales); proyector multimodal en F16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B instructivo, una arquitectura transformer de la familia Gemma 4, y se afina sobre datos propios del proyecto OpenTARS centrados en tool-use y acciones de texto. El entrenamiento mantiene el mismo contrato de 19 herramientas que los modelos Gargantua anteriores, lo que permite reutilizar la capa de orquestacion del asistente. La model card indica que los pesos publicados corresponden al primer epoch de la primera ejecucion de entrenamiento, sin detallar el volumen de tokens, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal no reside en la arquitectura sino en el empaquetado: un GGUF cuantizado Q4_K_M acompanado de un proyector multimodal F16 que declara entrada de imagen y audio. llama.cpp marca la ruta de audio como experimental y el autor no la ha probado. El modelo se sirve con `--jinja` y con la senal `think=false` desde la aplicacion openTARS, y admite decodificacion con temperatura 0.4, top_p 0.95 y top_k 64.

## Capacidades

- Generacion de texto y reescritura, resumen, traduccion y respuesta sobre texto proporcionado.
- Resistencia a instrucciones ocultas dentro del texto de entrada (evaluado en el conjunto de pruebas del autor).
- Tool calling segun un contrato fijo de 19 herramientas orientadas a acciones de escritorio (abrir programas, escribir, buscar en la web, ejecutar comandos).
- Razonamiento multi-paso para tareas cotidianas del asistente (conjunto de 48 tareas superado al completo).
- Vision: lectura y descripcion de imagenes mediante el proyector multimodal.
- Audio: entrada declarada por el proyector, no verificada por el autor.
- Multilingue limitado a portugues e ingles.

## Casos de uso

- Asistente de escritorio local sin GPU: el modelo ejecuta acciones de texto y tool calls en CPU con 5,6 GB de RAM, lo que permite desplegarlo en portatiles sin tarjeta grafica dedicada.
- Automatizacion de busqueda web: con la herramienta de busqueda integrada en el contrato de 19 herramientas, el modelo puede resolver consultas que requieran informacion actualizada y devolver resultados sintetizados.
- Ejecucion de comandos en terminal: el contrato de herramientas incluye ejecucion de comandos, lo que habilita flujos de administracion basica y scripts guiados por lenguaje natural.
- Lectura y descripcion de imagenes locales: mediante el proyector F16, el modelo puede responder preguntas sobre el contenido de un archivo de imagen, util para catalogacion o accesibilidad.
- Reescritura y resumen de documentos: las pruebas del autor muestran 75/76 en acciones de texto, incluida la deteccion de instrucciones ocultas, lo que lo hace adecuado para procesar textos de terceros.
- Traduccion portugues-ingles: el par de idiomas declarado cubre traduccion directa en entornos lusofonos.
- Integracion en pipelines de agentes con llama.cpp: al exponerse via `llama-server`, puede conectarse a frameworks de agentes que consuman una API compatible con OpenAI.

## Benchmarks y rendimiento

Resultados de las suites propias de openTARS (maquina local, RTX 3050 de 6 GB, 10 de noviembre de 2026). No son benchmarks publicos.

| Prueba | Resultado |
|---|---|
| Acciones de texto (reescritura, resumen, traduccion, consulta, ignorar instrucciones ocultas) | 75/76 |
| Respuestas inventadas o erroneas en 48 preguntas (modelo solo / dentro de la app) | 4 / 6 |
| Eleccion de tool call (21 casos) | 18/21 en prueba directa; 0,6 s por peticion en GPU |
| Test portable openTARS (48 tareas cotidianas) | 48/48 |
| Test openTARS de 80 tareas | 70/80 |

Rendimiento en CPU (llama.cpp b12032, 16 hilos, una medicion por caso): 0,7 s para respuesta corta, 1,8 s para responder sobre una imagen, 7,8 s para un prompt de 1.200 tokens, con 5,6 GB de RAM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos Q4_K_M ocupan 3,4 GB y el proyector 0,99 GB, por lo que la huella en GPU ronda los 4,4 GB de pesos mas overhead de contexto.
- RAM en CPU: 5,6 GB medidos por el autor con llama.cpp y 16 hilos.
- GPU probada por el autor: RTX 3050 de 6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, etc.).
- Despliegue: llama.cpp (`llama-server` con `--jinja -c 8192`) y Ollama (`ProjectOpenTARS/Gargantua-2.5:lite`).
- Latencia: 0,6 s por peticion de tool call en RTX 3050; 0,7 s para respuesta corta en CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua-2.5-Lite | 4.628.569.635 | 8.192 | Apache-2.0 | GGUF | Fine-tuning de tool-use sobre Gemma 4 E2B; vision y audio declarados |
| unsloth/gemma-4-E2B-it (modelo base) | no disponible | no disponible | Apache-2.0 | safetensors | Modelo instructivo original, sin contrato de herramientas especifico |
| Modelos Gargantua anteriores | no disponible | no disponible | no disponible | GGUF | Mismo contrato de 19 herramientas; el autor indica que este Lite es mas grande que el anterior |

## Limitaciones y advertencias

- Pesos correspondientes al primer epoch de la primera ejecucion: pueden ser reemplazados bajo el mismo nombre, lo que impide garantizar reproducibilidad en produccion.
- No localiza elementos de interfaz por posicion (0 de 40 en la prueba de pantalla del autor); no fue entrenado con capturas de pantalla.
- Falla en 4 de 80 tareas de editor de texto y en 4 de 80 tareas de "mirar este archivo de imagen".
- En la prueba directa de tool call confunde una peticion de calculadora con una busqueda web; la aplicacion openTARS lo corrige con una pista anadida.
- Entrada de audio declarada pero no probada; llama.cpp la marca como experimental.
- Cobertura linguistica limitada a portugues e ingles; no se declara castellano.
- Riesgo de alucinacion: el autor reporta 4 respuestas inventadas o erroneas en 48 preguntas con el modelo solo y 6 dentro de la aplicacion.
- Licencia Apache-2.0 permite uso comercial, pero el estado de entrenamiento incompleto y la ausencia de benchmarks publicos desaconsejan tratarlo como modelo de referencia sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5-Lite
- Proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Ollama: `ProjectOpenTARS/Gargantua-2.5:lite`
- llama.cpp: no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible
