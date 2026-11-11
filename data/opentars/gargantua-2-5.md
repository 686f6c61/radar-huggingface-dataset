# OpenTARS/Gargantua-2.5

## Resumen

Gargantua 2.5 es un modelo derivado de Gemma 4 E4B (Apache-2.0) desarrollado por el proyecto openTARS. Se trata de un ajuste fino orientado a uso de herramientas y acciones sobre texto, entrenado sobre datos propios del proyecto con un contrato fijo de 19 herramientas, el mismo que emplean las versiones anteriores de la familia Gargantua. El modelo esta pensado para ejecutarse en local como nucleo del asistente openTARS: abrir programas, escribir texto, buscar en la web, ejecutar comandos y leer imagenes.

El checkpoint publicado corresponde al paso 1200 de 1985 de la primera epoca de entrenamiento, por lo que el autor advierte explicitamente que el entrenamiento no ha finalizado y que los archivos pueden ser reemplazados bajo el mismo nombre en el futuro. El modelo base, Gemma 4 E4B, es un transformer multimodal con capacidades de vision y audio declaradas en el proyector, y el ajuste fino conserva esa arquitectura anadiendo el contrato de herramientas.

La distribucion se realiza en formato GGUF cuantizado Q4_K_M (4,9 GB) junto con un proyector F16 (0,99 GB) para imagen y audio, y es compatible con llama.cpp (probado con build b12032) y con Ollama. La licencia Apache-2.0 facilita su integracion en productos comerciales, aunque el estado incompleto del entrenamiento y las limitaciones declaradas por el autor aconsejan cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E4B (vision y audio via proyector) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la invocacion de ejemplo usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector en F16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer multimodal de aproximadamente 7.460 millones de parametros, y anade mediante un proyector separado las capacidades de entrada de imagen y audio. El ajuste fino se realizo sobre datos propios de openTARS de uso de herramientas y acciones sobre texto, manteniendo un contrato de 19 herramientas identico al de las versiones anteriores de la familia Gargantua. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

El checkpoint publicado corresponde al paso 1200 de 1985 de la primera epoca, es decir, un estado intermedio de entrenamiento. El autor indica que una version posterior podria sustituir estos archivos bajo el mismo nombre, lo que implica que los pesos actuales no deben considerarse definitivos. La distribucion se realiza exclusivamente en GGUF cuantizado Q4_K_M, junto con un proyector F16 para imagen y audio; no se ofrece en la informacion disponible el modelo en precision completa ni en safetensors.

## Capacidades

- Generacion de texto conversacional en portugues e ingles.
- Uso de herramientas y function calling con un contrato fijo de 19 herramientas.
- Acciones sobre texto: reescritura, resumen, traduccion, consulta sobre el texto e ignorado de instrucciones ocultas en el mismo.
- Capacidades de agente: apertura de programas, escritura, busqueda web y ejecucion de comandos como parte del asistente openTARS.
- Lectura y descripcion de imagenes mediante el proyector multimodal.
- Entrada de audio declarada por el proyector, aunque el autor indica que no se ha probado y que llama.cpp la marca como experimental.
- Modo de pensamiento desactivable: la aplicacion openTARS envia `think=false` para este modelo.

## Casos de uso

- Asistente de escritorio local: el modelo puede abrir programas, escribir texto y ejecutar comandos dentro del asistente openTARS, aprovechando el contrato de 19 herramientas para encadenar acciones sobre el sistema operativo.
- Automatizacion de tareas cotidianas en local: con 48 de 48 tareas superadas en la prueba portatil de openTARS, es adecuado para flujos repetitivos como resumen de documentos, reescritura de correos o traduccion entre portugues e ingles.
- Procesamiento de documentos con imagenes: la lectura de imagenes permite extraer y describir contenido visual en pipelines de digitalizacion, aunque el autor advierte debilidad al senalar elementos pequenos de interfaz por posicion.
- Atencion al cliente en portugues e ingles: el modelo puede gestionar conversaciones multi-turno y ejecutar acciones como consultas o busquedas web mediante tool calling, con la advertencia de que puede equivocarse en datos factuales.
- Integracion en herramientas de linea de comandos: al ejecutarse con llama.cpp u Ollama, puede incorporarse a scripts y utilidades locales que requieran generacion de texto y llamadas a herramientas sin depender de la nube.
- Prototipado de agentes con tool calling: el contrato fijo de herramientas y el soporte de llama-server con `--jinja` facilitan experimentar con agentes multi-paso en una GPU de consumo como la RTX 3050 de 6 GB.
- Traduccion y reescritura en entornos con requisitos de privacidad: al ejecutarse integramente en local, es apto para procesar texto sensible sin enviarlo a servicios externos.

## Benchmarks y rendimiento

Los resultados siguientes son pruebas propias del proyecto openTARS, ejecutadas el 11 de noviembre de 2026 en una RTX 3050 de 6 GB con la aplicacion openTARS y sus atajos desactivados. No son benchmarks publicos.

| Prueba | Resultado |
|---|---|
| Eleccion de herramienta (21 casos) | 21/21; 0,9 s por peticion en GPU, 3,4 s en CPU |
| Acciones sobre texto (reescritura, resumen, traduccion, consulta, ignorar instrucciones ocultas) | 73/76 |
| Respuestas inventadas o erroneas en 48 preguntas (modelo solo / dentro de la app) | 4 / 5 |
| Prueba portatil openTARS (48 tareas cotidianas) | 48/48 |
| Prueba openTARS de 80 tareas | 67/80 |

En CPU exclusivamente (llama.cpp b12032, 16 hilos, medido sobre la exportacion del paso 1000 del mismo modelo): 1,4 s para una respuesta corta, 3,9 s para responder sobre una imagen, 14,1 s para un prompt de 1200 tokens y 8,6 GB de RAM.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M (4,9 GB de pesos) mas el proyector F16 (0,99 GB) si se usa vision o audio.
- GPU recomendadas: el autor ha probado en una RTX 3050 de 6 GB; tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090, A100, H100) ofrecen mayor margen de contexto y velocidad.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM en la configuracion probada.
- Opciones de despliegue: llama.cpp (`llama-server`, build b12032 probado) y Ollama (`ProjectOpenTARS/Gargantua-2.5:latest`).
- Latencia y throughput: 0,9 s por peticion de eleccion de herramienta en GPU y 3,4 s en CPU; 1,4 s para respuesta corta en CPU con 16 hilos; 3,9 s para respuesta sobre imagen en CPU; 14,1 s para prompt de 1200 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua 2.5 | 7.463.013.674 | no disponible | Apache-2.0 | GGUF | Ajuste fino de Gemma 4 E4B para tool use; checkpoint intermedio (paso 1200/1985) |
| Gemma 4 E4B (base) | no disponible en la informacion | no disponible | Apache-2.0 | no disponible | Modelo base multimodal sin el contrato de 19 herramientas |
| Modelos de la familia Gargantua anteriores | no disponible | no disponible | no disponible | GGUF | Mismo contrato de 19 herramientas; el autor los menciona como predecesores |

No se dispone en la informacion proporcionada de datos de benchmarks publicos ni de especificaciones de modelos alternativos comparables, por lo que la comparativa se limita a los datos anteriores.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 1200 de 1985 de la primera epoca; el entrenamiento no ha finalizado y los archivos pueden cambiar bajo el mismo nombre.
- Debilidad en localizacion espacial de elementos de interfaz: solo 2 de 40 en la prueba de pantalla del autor; no fue entrenado con capturas de pantalla.
- Audio no probado: el proyector declara entrada de audio, pero llama.cpp la marca como experimental y el autor no la ha validado.
- Fallos declarados: 4 de 80 tareas del editor de texto y 4 de 80 tareas de "mirar este archivo de imagen" fallan en las pruebas del autor.
- Riesgo de alucinacion: el autor advierte que el modelo puede equivocarse en datos factuales; la aplicacion openTARS anade avisos y comprobaciones web para esos casos.
- Idiomas limitados a portugues e ingles; no se declara soporte de castellano.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Gemma 4 E4B conviene revisar los terminos del modelo base.
- Resultados medidos por el propio autor en pruebas internas, no benchmarks publicos; la comparabilidad con otros modelos es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5
- Proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Ollama: `ProjectOpenTARS/Gargantua-2.5:latest`
