# abdelhayali91/pcbgo-v1

## Resumen

pcbgo v1 es un ajuste fino (LoRA, posteriormente fusionado y cuantizado) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario abdelhayali91. Está especializado en el diseño automatizado de placas de circuito impreso (PCB) y esquemáticos electrónicos mediante el uso de herramientas (tool calling) dentro de la aplicación CircuitPilot, disponible en pcbgo.site. El modelo recibe una descripción de circuito en lenguaje natural y ejecuta acciones concretas: añadir componentes, cablear el esquemático, verificar el diseño (ERC/DRC), colocar y rutear la PCB, añadir planos de cobre y taladros, y corregir problemas de DRC.

Con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones) y distribuido en formato GGUF cuantizado Q4_K_M (2,8 GB), el modelo está pensado para ejecutarse en hardware de consumo: una GPU de portátil, Ollama en cualquier PC o una GPU gratuita de Google Colab (T4). Su relevancia actual radica en que demuestra que un modelo pequeño, ajustado sobre datos generados por un motor de diseño real, puede igualar o superar a modelos de 27B en tareas de automatización de EDA (Electronic Design Automation), reduciendo drásticamente los requisitos de cómputo y el número de tokens consumidos por tarea.

El modelo se entrenó exclusivamente con conversaciones de uso de herramientas generadas por el motor real de CircuitPilot, lo que garantiza que cada resultado de herramienta sea verificado y realista. Está publicado bajo licencia Apache-2.0, la misma que el modelo base, y soporta únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, ajuste LoRA fusionado) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (en el notebook de Colab); 32.768 tokens en el ejemplo de llama.cpp |
| Tipos de cuantizacion | Q4_K_M (4 bits); el repositorio solo distribuye el GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo pcbgo-v1-Q4_K_M.gguf, 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,3 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino QLoRA con rango 32 sobre todas las capas lineales, entrenando únicamente los turnos del asistente. El entrenamiento se realizó en una sola GPU de 16–20 GB, con 25 pasos iniciales más 125 pasos adicionales. Posteriormente, el adaptador LoRA se fusionó con los pesos base y se cuantizó a Q4_K_M para su distribución en formato GGUF.

Los datos de entrenamiento consisten en aproximadamente 4.000 conversaciones generadas ejecutando el motor de diseño real de CircuitPilot. Cada resultado de herramienta es real: circuitos construidos con componentes reales de JLCPCB, ediciones, pasos de layout de PCB, preguntas, planes, trabajos completos solicitados en una sola petición y peticiones con errores tipográficos. Solo se conservaron los diseños que pasaban las comprobaciones ERC/DRC. No se utilizaron datos de usuarios. El modelo se entrenó con el modo "thinking" desactivado, por lo que debe ejecutarse de esa manera. La innovación principal no es arquitectónica sino de datos: el uso de un motor de EDA real como generador de trayectorias de herramientas verificadas.

## Capacidades

- Generación de esquemáticos a partir de descripciones en lenguaje natural, añadiendo componentes y cableando conexiones.
- Colocación y ruteo de PCB (placement y routing) mediante llamadas a herramientas del motor CircuitPilot.
- Verificación de diseño: ejecución de ERC (Electrical Rules Check) y DRC (Design Rules Check), y corrección de problemas detectados.
- Añadido de planos de cobre (pours) y taladros (holes) en el layout.
- Tool calling / function calling: el modelo está entrenado específicamente para invocar el conjunto compacto de 30 herramientas principales de CircuitPilot.
- Diseño de placas concretas: LED, reguladores (LDO), sensores, relés y amplificadores operacionales a partir de una sola petición.
- Reparación de placas defectuosas: 6 de las 14 tareas del benchmark consisten en reparar diseños rotos.
- Soporte de conversaciones multiturno con contexto largo (hasta 64k tokens en Colab).
- Capacidad de recibir peticiones con errores tipográficos y planes de trabajo completos en una sola solicitud.
- No soporta visión, audio ni modo thinking (entrenado con thinking desactivado).
- Capacidad limitada para generar esquemáticos novedosos desde cero: el propio autor indica que es demasiado pequeño para ideas completamente nuevas, aunque es eficiente en ruteo y en generar esquemáticos a partir de entradas proporcionadas por el usuario.

## Casos de uso

- Diseño de placas LED sencillas: el usuario describe una placa con LEDs y el modelo añade los componentes, cablea el esquemático, rutea la PCB y ejecuta DRC. Es adecuado porque el benchmark muestra que los diseños LED están entre sus puntos fuertes.
- Diseño de reguladores de tensión (LDO): a partir de una descripción como "regulador de 3,3 V", el modelo construye el bloque de alimentación completo, lo verifica y lo rutea. El autor recomienda abordar el diseño bloque a bloque, empezando por la alimentación.
- Integración de sensores y front-ends analógicos: el modelo puede añadir un front-end de sensor (por ejemplo, ECG) sobre un bloque MCU BLE ya existente, siguiendo el flujo modular recomendado.
- Reparación de placas con errores: dado un diseño roto, el modelo ejecuta ERC/DRC, identifica problemas y aplica correcciones. En el benchmark obtuvo 91,4 en la métrica de reparación.
- Automatización dentro de la aplicación CircuitPilot: el modelo se conecta mediante API compatible con OpenAI (Ollama en localhost:11434/v1 o llama-server en localhost:8080/v1) y ejecuta el flujo completo de diseño dentro de la app de escritorio o web.
- Ejecución en entornos sin conexión: la app de escritorio de CircuitPilot para Windows puede descargar el GGUF una vez y ejecutarlo con llama.cpp integrado en GPU NVIDIA, AMD o Intel (vía Vulkan) o en CPU, sin internet ni clave API.
- Prototipado rápido en Google Colab gratuito: el notebook oficial instala Ollama, descarga el modelo y expone una URL de Cloudflare Tunnel que se conecta directamente a pcbgo.site, permitiendo probar el diseño de placas sin hardware local.
- Corrección de problemas de DRC en produccion: el modelo puede integrarse en un pipeline que reciba el resultado de un DRC y aplique correcciones iterativas antes de fabricar la placa.

## Benchmarks y rendimiento

El autor publica el CircuitPilot PCB Bench, con 14 tareas (8 placas a partir de una descripción y 6 placas rotas a reparar). La puntuación del diseño resultante se calcula de 0 a 100 y se promedia sobre las ejecuciones.

| Modelo | Score | Design | Repair | Placement | Routing | DRC clean | Fully routed | Tokens / tarea (in · out) |
|---|---|---|---|---|---|---|---|---|
| pcbgo v1 (4B) | 80,4 | 72,2 | 91,4 | 82 % | 82 % | 25/33 | 32/33 | 97k · 1,0k |
| Qwen3.8-27B | 78,6 | 62,5 | 100 | 79 % | 73 % | 8/11 | 9/11 | 143k · 0,9k |
| Qwen3.6-27B | 77,7 | 61,0 | 100 | 76 % | 73 % | 8/11 | 11/11 | 181k · 2,4k |
| Qwen3.5-4B (base) | 65,1 | 38,9 | 100 | 57 % | 52 % | 17/33 | 21/33 | 185k · 1,8k |

Condiciones: todos los modelos locales ejecutados con llama.cpp, Q4_K_M, thinking desactivado y el mismo conjunto compacto de herramientas. pcbgo v1 y el modelo base se evaluaron con 3 ejecuciones × 14 tareas; los modelos de 27B con 1 ejecución × 14 tareas. El autor indica que pcbgo v1 está a la par de los modelos de 27B (ligeramente por delante, dentro del ruido entre ejecuciones) con 1/7 de su tamaño y aproximadamente la mitad de tokens.

Puntos fuertes declarados: placas LED, reguladores, sensores, relés y amplificadores operacionales desde una sola petición, ruteo completo y limpieza de DRC. Puntos débiles: placas multi-bloque más grandes (por ejemplo, regulador + sensor + nodo LED) y algunos diseños con 555; puede repetir una llamada de herramienta fallida.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 2,8 GB; con overhead de contexto (hasta 64k tokens) se recomienda al menos 6–8 GB de VRAM para un rendimiento cómodo.
- GPU recomendadas: NVIDIA T4 (GPU gratuita de Colab, probada por el autor), GPUs de portátil con 6–8 GB o más, NVIDIA, AMD e Intel mediante Vulkan en la app de escritorio.
- Cabe en GPU de consumo: sí; el autor lo describe como "suficientemente pequeño para una GPU de portátil, Ollama en cualquier PC o una GPU gratuita de Google Colab".
- Opciones de despliegue: Ollama (con Modelfile incluido en el repositorio), llama.cpp (llama-server con --jinja y enable_thinking=false), la app de escritorio CircuitPilot para Windows (llama.cpp integrado) y Google Colab mediante notebook oficial.
- Latencia y throughput: en Colab T4, la primera llamada tarda 2–3 minutos en calentar la GPU y las respuestas posteriores tardan segundos. No se publican cifras de tokens por segundo ni de latencia por token.
- Contexto de ejecución: 64k tokens en el notebook de Colab; el ejemplo de llama.cpp usa -c 32768.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Score PCB Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcbgo v1 | 4,3B | 64k (Colab) / 32k (llama.cpp) | 80,4 | Apache-2.0 | GGUF en Hugging Face, Ollama, app CircuitPilot |
| Qwen3.5-4B (base) | 4,3B | No disponible en la información | 65,1 | Apache-2.0 | Hugging Face |
| Qwen3.6-27B | 27B (aproximado) | No disponible en la información | 77,7 | No disponible en la información | No disponible en la información |
| Qwen3.8-27B | 27B (aproximado) | No disponible en la información | 78,6 | No disponible en la información | No disponible en la información |

La comparación se limita a los modelos incluidos en el benchmark del autor. No se dispone de datos de otros modelos especializados en EDA o tool calling para electrónica en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es demasiado pequeño para generar esquemáticos nuevos desde cero a partir de ideas novedosas; es eficaz en ruteo y en generar esquemáticos a partir de entradas proporcionadas por el usuario.
- Debilidad en placas multi-bloque grandes (regulador + sensor + nodo LED) y en algunos diseños con 555.
- Puede repetir una llamada de herramienta fallida en bucle.
- Requiere verificación humana: el autor recomienda ejecutar siempre ERC/DRC en la aplicación antes de fabricar una placa.
- Entrenado y validado únicamente en inglés; no se declara soporte de otros idiomas.
- Entrenado con thinking desactivado; ejecutarlo con thinking activado puede degradar el comportamiento esperado.
- Diseñado para el conjunto compacto de 30 herramientas de CircuitPilot; su uso fuera de ese conjunto de herramientas o de la aplicación puede no funcionar correctamente.
- Riesgo de alucinación en componentes o conexiones no presentes en los datos de entrenamiento (componentes reales de JLCPCB).
- Licencia Apache-2.0 para los pesos; la aplicación CircuitPilot/pcbgo.site tiene su propia licencia, distinta de la del modelo.
- No se han publicado datos sobre sesgos demográficos o lingüísticos; al estar entrenado solo con conversaciones de diseño electrónico, su comportamiento fuera de dominio no está caracterizado.
- El benchmark fue realizado por el propio autor; los modelos de 27B se evaluaron con una sola ejecución, lo que limita la significación estadística de la comparación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdelhayali91/pcbgo-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación pcbgo.site (CircuitPilot): https://pcbgo.site
- Repositorio CircuitPilot en GitHub: https://github.com/Abdelhayali/CircuitPilot
- Benchmark PCB Bench: https://github.com/Abdelhayali/CircuitPilot/tree/main/bench
- Código de ajuste fino: https://github.com/Abdelhayali/CircuitPilot/tree/main/finetune
- Notebook de Colab: https://colab.research.google.com/github/Abdelhayali/CircuitPilot/blob/main/finetune/CircuitPilot_4B_Colab.ipynb
- App de escritorio CircuitPilot para Windows: https://github.com/Abdelhayali/CircuitPilot/releases/tag/v2026.11.24.1
