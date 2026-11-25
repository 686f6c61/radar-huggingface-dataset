# OpenTARS/Gargantua-2.5-Lite

## Resumen

Gargantua-2.5-Lite es un modelo de lenguaje multimodal (texto, imagen y audio experimental) desarrollado por MastLLM para el asistente de código abierto openTARS. Se trata de un ajuste fino del modelo base unsloth/gemma-4-E2B-it, orientado específicamente a la ejecución local en equipos sin tarjeta gráfica dedicada y al uso de herramientas (tool calling) mediante un contrato fijo de 19 herramientas. El modelo está pensado para controlar el escritorio: abrir programas, escribir texto, buscar en la web y ejecutar comandos.

La relevancia del modelo reside en su enfoque: en lugar de competir en tamaño o en benchmarks generalistas, optimiza una tarea concreta (agente local de escritorio) con un presupuesto de hardware muy reducido. Con 4.628.569.635 parámetros totales y un peso cuantizado Q4_K_M de 3,4 GB, puede ejecutarse en CPU con 5,6 GB de RAM, lo que lo sitúa en el rango de equipos de consumo sin GPU.

El modelo se distribuye exclusivamente en formato GGUF para llama.cpp y Ollama, con licencia Apache-2.0, y soporta portugués e inglés. La versión publicada corresponde al primer epoch de entrenamiento; el autor descarta explícitamente el segundo epoch por aumentar las respuestas inventadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E2B), con proyector para imagen y audio |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (configuración recomendada en llama-server con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (3,4 GB); proyector multimodal en F16 (0,99 GB) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B, un transformer multimodal con capacidad de procesar texto, imagen y audio. Sobre esa base, MastLLM aplicó un ajuste fino supervisado con sus propios datos de uso de herramientas y acciones de texto, manteniendo el mismo contrato de 19 herramientas que las versiones anteriores de la familia Gargantua. El entrenamiento se realizó durante un único epoch en Google Colab.

El autor documenta un experimento con un segundo epoch (medido el 13 de noviembre de 2026) que fue descartado: no mejoró el rendimiento en acciones de texto ni en tareas, y aumentó las respuestas inventadas de 4 a 11 sobre 48 preguntas. Esta decisión de publicación es relevante para evaluar la madurez del ajuste. No se especifica el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El modelo se distribuye con un proyector multimodal separado (`mmproj-...-F16.gguf`) que habilita la entrada de imagen y audio a través de llama.cpp. La decodificación se realiza con parámetros de muestreo recomendados de temperatura 0,4, top_p 0,95 y top_k 64, y la aplicación openTARS envía `think=false` para desactivar el modo de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno en portugués e inglés.
- Ejecución de acciones de texto: reescritura, resumen, traducción y respuesta sobre texto proporcionado.
- Resistencia a instrucciones ocultas en el texto de entrada (evaluada en el conjunto de pruebas del autor).
- Tool calling con un contrato fijo de 19 herramientas orientadas al control del escritorio (abrir programas, escribir, buscar en la web, ejecutar comandos).
- Lectura y descripción de imágenes mediante el proyector multimodal.
- Entrada de audio (soporte experimental en llama.cpp; el autor recomienda usar Gargantua 2.5 o Whisper como alternativa para voz).
- Ejecución local en CPU sin GPU dedicada.

## Casos de uso

- Agente local de escritorio: el modelo puede abrir programas, escribir texto y ejecutar comandos a través de su contrato de 19 herramientas, lo que permite construir asistentes de automatización de escritorio que funcionan sin conexión y sin GPU.
- Automatización de tareas de texto en lote: reescritura, resumen y traducción de documentos en portugués e inglés, con un rendimiento medido de 75/76 en las pruebas de acciones de texto del autor.
- Asistente de accesibilidad en equipos modestos: al ejecutarse en CPU con 5,6 GB de RAM, puede desplegarse en portátiles antiguos o equipos sin tarjeta gráfica para tareas de lectura de imágenes y descripción de contenido.
- Búsqueda web asistida: el modelo selecciona la herramienta de búsqueda web en la mayoría de los casos del test de elección de herramienta (18/21), lo que lo hace adecuado para flujos de recuperación de información guiados por el usuario.
- Procesamiento de imágenes en local: descripción y respuesta sobre imágenes en 1,8 s en CPU, útil para clasificación o accesibilidad en entornos con requisitos de privacidad que impiden enviar imágenes a la nube.
- Integración en pipelines de automatización con Ollama: el modelo está disponible como `ProjectOpenTARS/Gargantua-2.5:lite`, lo que facilita su inclusión en flujos de trabajo orquestados con herramientas estándar.
- Prototipado de agentes con tool calling: el contrato fijo de herramientas y el soporte de llama.cpp con `--jinja` permiten validar arquitecturas de agentes antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Los resultados siguientes son pruebas propias del autor (suites de openTARS), ejecutadas el 10 de noviembre de 2026 en una RTX 3050 de 6 GB con la aplicación openTARS y sus atajos desactivados. No son benchmarks públicos.

| Prueba | Resultado |
|---|---|
| Acciones de texto (reescribir, resumir, traducir, preguntar sobre el texto, ignorar instrucciones ocultas) | 75/76 |
| Respuestas inventadas o erróneas en 48 preguntas (modelo solo / dentro de la app) | 4 / 6 |
| Elección de herramienta (21 casos) | 18/21 en prueba directa; 0,6 s por petición en GPU |
| Test portátil de openTARS (48 tareas cotidianas) | 48/48 |
| Test de 80 tareas de openTARS | 70/80 |

Rendimiento en CPU (llama.cpp b12032, 16 hilos, una medición por caso): 0,7 s para una respuesta corta, 1,8 s para responder sobre una imagen, 7,8 s para un prompt de 1.200 tokens, con 5,6 GB de RAM.

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo está diseñado para CPU; en GPU, el peso Q4_K_M de 3,4 GB más el proyector F16 de 0,99 GB requieren aproximadamente 4,5 GB de VRAM.
- GPU recomendadas: el autor lo probó en una RTX 3050 de 6 GB; cabe en GPUs de consumo con 6 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3050, RTX 3060, RTX 4060 y superiores con al menos 6 GB de VRAM.
- Ejecución en CPU: 5,6 GB de RAM, sin necesidad de GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, probado con build b12032) y Ollama (`ProjectOpenTARS/Gargantua-2.5:lite`).
- Latencia y throughput: 0,6 s por petición en GPU (RTX 3050); 0,7 s para respuesta corta y 7,8 s para prompt de 1.200 tokens en CPU con 16 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Gargantua-2.5-Lite | 4.628.569.635 | 8.192 | Apache-2.0 | GGUF | Agente local de escritorio con 19 herramientas |
| Gemma 4 E2B (base) | no disponible | no disponible | Apache-2.0 | no disponible | Modelo generalista multimodal |
| Gargantua 2.5 | no disponible | no disponible | no disponible | no disponible | Versión mayor del asistente openTARS, usada para voz |

La información disponible no permite comparar rendimiento numérico con alternativas de la misma categoría, ya que los benchmarks del autor son suites internas de openTARS sin equivalentes públicos.

## Limitaciones y advertencias

- No puede señalar elementos de interfaz por posición: 0 de 40 en la prueba de pantalla del autor; no fue entrenado con capturas de pantalla.
- El test de elección de herramienta falla en un caso concreto ("usar la calculadora"), que el modelo convierte en una búsqueda web; la aplicación openTARS lo corrige añadiendo una pista a la petición.
- Las tareas del editor de texto (4 de 80) y las de "mirar este archivo de imagen" (4 de 80) fallan en las pruebas del autor.
- El soporte de audio está marcado como experimental en llama.cpp; para voz se recomienda Gargantua 2.5 o Whisper.
- Riesgo de alucinación medido: 4 respuestas inventadas o erróneas sobre 48 preguntas con el modelo solo, y 6 dentro de la aplicación.
- Solo soporta portugués e inglés; no se documenta cobertura de otros idiomas.
- El modelo publicado es el primer epoch; el segundo epoch empeoró los resultados y no se incluye.
- El tamaño de 3,4 GB es superior al del modelo Lite anterior que reemplaza.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los datos de ajuste pueden tener condiciones adicionales que no se detallan en la información disponible.
- No se publican safetensors ni resultados en benchmarks públicos, lo que limita la comparación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5-Lite
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Organización MastLLM: https://huggingface.co/Mast-LLM
- Proyecto openTARS: https://mastllm.github.io/OpenTARS/
- Ollama: `ProjectOpenTARS/Gargantua-2.5:lite`
