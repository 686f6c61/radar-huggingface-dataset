# OpenTARS/Gargantua-2.5-Lite

## Resumen
Gargantua-2.5-Lite es un modelo de lenguaje y visión de tipo ligero, publicado por el proyecto openTARS como el componente pequeño de su asistente local. Se construye mediante fine-tuning del modelo Gemma 4 E2B (Apache-2.0) de Google, concretamente sobre la variante instruida `unsloth/gemma-4-E2B-it`, y se distribuye empaquetado en formato GGUF para su ejecución con llama.cpp y Ollama. El modelo está pensado para ordenadores sin tarjeta gráfica dedicada, con un objetivo explícito de ejecución local y bajo consumo de recursos.

El modelo resuelve el problema de disponer de un asistente capaz de ejecutar acciones sobre el sistema operativo (abrir programas, escribir, buscar en la web, ejecutar comandos) y de interpretar imágenes, todo ello sin depender de servicios en la nube. Para ello se ha entrenado con un contrato fijo de 19 herramientas (tool-use) y datos propios de acciones de texto, manteniendo la misma interfaz que las versiones anteriores de la familia Gargantua. Cuenta con aproximadamente 4.630 millones de parámetros totales y se distribuye con una cuantización Q4_K_M de 3,4 GB más un proyector multimodal de 0,99 GB.

Su relevancia actual reside en la combinación de tres factores: licencia Apache-2.0, soporte multimodal (visión y audio experimental) y un tamaño que permite su despliegue en equipos de consumo. La model card documenta resultados medidos por el propio autor en pruebas internas, no en benchmarks públicos, lo que debe tenerse en cuenta al evaluar sus capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con proyector para visión y audio; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 4.628.569.635 (≈4,63 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de ejemplo de llama.cpp; no se confirma como máximo oficial) |
| Tipos de cuantización | Q4_K_M para el modelo principal; F16 para el proyector multimodal |
| Idiomas soportados | portugués (pt) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors según el dato de parámetros |

## Arquitectura y entrenamiento
El modelo parte de Gemma 4 E2B, un transformer multimodal de la familia Gemma 4, y se distribuye con un proyector (`mmproj`) que habilita la entrada de imágenes y audio. La información disponible no detalla la arquitectura interna del modelo base (número de capas, atención, etc.), por lo que no es posible confirmar innovaciones como atención lineal o decodificación especulativa. El fine-tuning se realizó por el proyecto openTARS sobre datos propios de tool-use y acciones de texto, manteniendo un contrato de 19 herramientas idéntico al de versiones anteriores de Gargantua.

El entrenamiento se llevó a cabo durante una época en Google Colab. El autor documenta que una segunda época fue entrenada y evaluada el 13 de noviembre de 2026, pero no mejoró los resultados en acciones de texto ni en tareas, y aumentó las respuestas inventadas (11 de 48 frente a 4), por lo que se conservó la versión de una sola época. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo se usa con `think=false` en la aplicación openTARS, lo que sugiere que no se emplea un modo de razonamiento extendido.

## Capacidades
- Generación de texto y acciones de texto: reescritura, resumen, traducción, preguntas sobre el texto e ignorar instrucciones ocultas en el mismo.
- Tool calling / function calling con un contrato fijo de 19 herramientas para abrir programas, escribir, buscar en la web y ejecutar comandos.
- Ejecución de tareas de agente en varios pasos dentro de la aplicación openTARS.
- Comprensión de imágenes: lectura y descripción de imágenes mediante el proyector multimodal.
- Entrada de audio: soportada de forma experimental por llama.cpp; el autor recomienda usar Gargantua 2.5 o Whisper como respaldo para voz.
- Capacidades multilingües limitadas a portugués e inglés.
- Integración con llama.cpp (`llama-server`) y Ollama.
- No dispone de modo de razonamiento extendido (`think=false`).

## Casos de uso
- Asistente de escritorio local: el modelo puede abrir programas, escribir texto y ejecutar comandos mediante las 19 herramientas definidas, lo que permite automatizar tareas cotidianas en Linux, Windows y macOS sin conexión a la nube.
- Automatización de tareas de texto: reescritura, resumen y traducción de documentos, con resultados de 75/76 en las pruebas internas del autor, adecuado para flujos de trabajo personales o de pequeñas oficinas.
- Búsqueda web asistida: el modelo selecciona la herramienta de búsqueda y formula consultas, con un acierto de 18/21 en la elección de herramienta en la prueba directa del autor.
- Descripción y análisis de imágenes: gracias al proyector multimodal, puede leer y describir imágenes, útil para clasificar capturas o extraer información de fotografías, aunque no puede señalar elementos de interfaz por posición.
- Despliegue en equipos sin GPU: con 5,6 GB de RAM en CPU y tiempos de 0,7 s para respuestas cortas y 1,8 s para preguntas sobre imágenes, es viable en portátiles modestos.
- Integración en pipelines de agentes: su contrato de herramientas fijo y su compatibilidad con llama.cpp permiten incorporarlo como ejecutor de acciones en sistemas de automatización locales.
- Prototipado de asistentes multilingües pt/en: su soporte de portugués e inglés lo hace adecuado para aplicaciones dirigidas a esos mercados.

## Benchmarks y rendimiento
Los datos disponibles son pruebas internas del autor, no benchmarks públicos. Se ejecutaron con la aplicación openTARS en una RTX 3050 de 6 GB, con los atajos de la aplicación desactivados.

| Prueba | Resultado |
|---|---|
| Acciones de texto (reescribir, resumir, traducir, preguntar, ignorar instrucciones ocultas) | 75/76 |
| Respuestas inventadas o incorrectas en 48 preguntas (modelo solo / dentro de la app) | 4 / 6 |
| Elección de herramienta (21 casos) | 18/21 en prueba directa; 0,6 s por petición en GPU |
| Prueba portátil openTARS (48 tareas cotidianas) | 48/48 |
| Prueba openTARS de 80 tareas | 70/80 |

Rendimiento en CPU (llama.cpp b12032, 16 hilos, una medición por caso): 0,7 s para respuesta corta, 1,8 s para responder sobre una imagen, 7,8 s para un prompt de 1200 tokens, con 5,6 GB de RAM.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el modelo cuantizado Q4_K_M ocupa 3,4 GB y el proyector 0,99 GB, por lo que se estima un consumo de VRAM en torno a 5-6 GB para inferencia completa en GPU.
- GPU recomendadas: RTX 3050 de 6 GB (probada por el autor); cualquier GPU con al menos 6 GB de VRAM debería ser suficiente para la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM; también funciona solo en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, build b12032 probada) y Ollama (`ProjectOpenTARS/Gargantua-2.5:lite`).
- Latencia y throughput: 0,6 s por petición en RTX 3050; en CPU, 0,7 s para respuesta corta, 1,8 s para imagen y 7,8 s para prompt de 1200 tokens. No se proporciona throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua-2.5-Lite | ≈4,63 mil millones | 8192 (usado en ejemplo) | Apache-2.0 | GGUF | Fine-tuning de Gemma 4 E2B con tool-use y visión |
| Gemma 4 E2B (base) | no disponible | no disponible | Apache-2.0 | safetensors, GGUF | Modelo base sin fine-tuning específico de herramientas |
| Gargantua 2.5 (versión completa) | no disponible | no disponible | no disponible | no disponible | Versión mayor de la familia, usada para voz en la app openTARS |

No se dispone de datos de benchmarks públicos para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias
- No puede señalar elementos de interfaz por posición: 0 de 40 en la prueba de pantalla del autor; no fue entrenado con capturas de pantalla.
- El audio es experimental en llama.cpp; para voz se recomienda usar Gargantua 2.5 o Whisper.
- Fallan 4 de 80 tareas de editor de texto y 4 de 80 tareas de "mirar este archivo de imagen" en las pruebas del autor.
- En la prueba directa de elección de herramienta, la petición "usar la calculadora" se convierte en una búsqueda web; la aplicación openTARS añade una pista que lo corrige en la prueba de 80 tareas.
- Riesgo de alucinación: 4 respuestas inventadas o incorrectas de 48 preguntas en el modelo solo, y 6 de 48 dentro de la aplicación.
- Idiomas limitados a portugués e inglés; no se garantiza un rendimiento adecuado en castellano.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 E2B puede tener sus propias condiciones que deben verificarse.
- El modelo es más grande (3,4 GB) que la versión Lite anterior a la que reemplaza.
- Los resultados presentados son pruebas internas del autor, no benchmarks públicos, por lo que no son directamente comparables con otras evaluaciones.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5-Lite
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Página del proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Repositorio GitHub de openTARS: https://github.com/project-opentars/OpenTARS
- Mirror de la aplicación en Hugging Face: https://huggingface.co/OpenTARS/openTARS
- Repositorio alternativo (Hexman768): https://github.com/Hexman768/OpenTARS
