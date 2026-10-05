# docling-project/DeskForge-Gemma4-E4B

## Resumen

DeskForge-Gemma4-E4B es un ajuste fino del modelo multimodal instruction-tuned google/gemma-4-E4B-it, desarrollado por docling-project y publicado el 5 de octubre de 2026. El modelo resuelve un problema muy concreto: dado un pantallazo de escritorio y una instrucción en lenguaje natural, devuelve la siguiente acción a ejecutar como una llamada a `pyautogui` en la que las coordenadas son fracciones de la pantalla (0.0-1.0, cuatro decimales), no píxeles. Es, por tanto, un modelo de grounding de interfaz gráfica orientado a agentes de computer use, no un modelo de propósito general.

El ajuste se realizó sobre 200.000 ejemplos de grounding extraídos del dataset DeskForge-1M, también publicado por el mismo proyecto. Los pesos en safetensors suman 7.941.100.832 parámetros y el repositorio ocupa 15,9 GB, lo que sitúa al modelo en la franja de los modelos de 7-8B con capacidad de visión. La licencia es Apache 2.0, un dato relevante porque permite uso comercial sin las restricciones habituales de la familia Gemma.

Su relevancia actual es doble. Por un lado, demuestra que un ajuste fino bien dirigido puede transformar por completo el rendimiento de un modelo pequeño en una tarea especializada: el modelo base Gemma4-E4B obtiene un 12,27 % de precisión media en las condiciones retenidas de DeskForge-1M, mientras que la versión ajustada alcanza el 85,12 %. Por otro, en benchmarks externos de grounding de GUI no usados durante el entrenamiento, supera a modelos más grandes como UI-Venus-2-9B, GroundNext-7B o Gemma4-31B en varias métricas, lo que refuerza la idea de especialización frente a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 7.941.100.832 (recuento de safetensors) |
| Parametros activos | no disponible; la nomenclatura E4B sugiere parametros efectivos, pero no se detalla en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); 15,9 GB de tamano de repositorio |
| Modelo base | google/gemma-4-E4B-it (finetune, instruction-tuned) |
| Modalidad de entrada | imagen (captura de pantalla) + texto (instruccion de tarea + historial de acciones) |
| Modalidad de salida | texto: una unica llamada a `pyautogui` con coordenadas fraccionarias |
| Dataset de entrenamiento | docling-project/DeskForge-1M (200.000 ejemplos de grounding) |
| Tokens de imagen | hasta 1.120 tokens por captura |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B en su variante instruction-tuned, un transformer multimodal con encoder de imagen y decoder de texto, y se ajusta mediante fine-tuning supervisado sobre 200.000 ejemplos del dataset DeskForge-1M. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste, ni el número total de tokens de entrenamiento más allá del recuento de ejemplos. Tampoco se detalla la composición exacta del dataset ni la proporción de tipos de tarea.

La innovación principal no está en la arquitectura, sino en el diseño del espacio de salida y del prompt. El modelo se entrena con un system prompt fijo que restringe la respuesta a un conjunto cerrado de acciones de `pyautogui` (click, doubleClick, rightClick, middleClick, tripleClick, moveTo, dragTo, scroll, hscroll, write, press, hotkey, wait, terminate). Las coordenadas se expresan como fracciones del ancho y alto de la pantalla con cuatro decimales, lo que hace la representación independiente de la resolución. Las capturas se redimensionan de forma bilineal a un máximo de 2.097.152 píxeles (lados redondeados hacia abajo) y se codifican en un máximo de 1.120 tokens de imagen, coherente con el preprocesamiento usado en entrenamiento.

El modelo se ha validado con `transformers` 5.16 y `vLLM` 0.28. En el caso de Transformers, el número máximo de tokens de imagen se configura desde el procesador; en vLLM se pasa como `max_soft_tokens` dentro de `mm_processor_kwargs`. El modelo se usa sin modo de razonamiento (`enable_thinking=False`) y con decodificación greedy (`do_sample=False`) en los ejemplos oficiales.

## Capacidades

- Grounding visual de interfaces de escritorio: localiza elementos concretos (menús, botones, campos de texto, iconos) en una captura de pantalla a partir de una instrucción en lenguaje natural.
- Emisión de acciones ejecutables: la salida es directamente una llamada a `pyautogui` con coordenadas normalizadas, sin texto adicional, sin explicaciones y sin bloques de código.
- Interacción multi-paso: el prompt admite un historial de "acciones ya tomadas", de modo que el modelo puede operar en un bucle de agente donde cada paso recibe el estado acumulado.
- Conjunto cerrado de acciones: clic simple, doble, derecho y medio, triple clic, movimiento del cursor, arrastre, scroll vertical y horizontal, escritura de texto, pulsación de teclas, atajos de teclado, espera y terminación de la tarea con estado.
- Terminación explícita de tarea: la acción `computer.terminate(status='success')` permite cerrar el bucle tanto en caso de éxito como de imposibilidad.
- Comprensión de pantalla completa: el modelo procesa la captura entera, no recortes, lo que le permite razonar sobre el layout global.
- No soporta, según la información disponible: tool calling genérico, function calling fuera del conjunto de `pyautogui`, audio, vídeo, ni generación de texto libre. El modelo está entrenado exclusivamente en inglés.

## Casos de uso

- Automatización de escritorio (RPA de nueva generación): sustituir los selectores frágiles de las herramientas RPA clásicas por un modelo que interpreta la pantalla visualmente. Dado que las coordenadas son fracciones de pantalla, el mismo flujo funciona en distintas resoluciones sin recalibrar, lo que reduce el mantenimiento de scripts.
- Agentes de computer use con planificador externo: el modelo encaja como "action model" dentro de una arquitectura de dos niveles donde un LLM mayor decide qué hacer y DeskForge-Gemma4-E4B localiza dónde hacerlo. Los resultados publicados con un planificador fijo Qwen3.6-27B (40 de 119 tareas en WebArena-Infinity y 12 de 100 en OpenApps) corresponden exactamente a este patrón.
- Pruebas automatizadas de interfaz (QA de UI): generar y ejecutar secuencias de interacción en aplicaciones de escritorio o web para regresión visual y funcional, aprovechando que el modelo trabaja sobre capturas reales y no sobre el DOM.
- Asistencia en soporte técnico y generación de guías: a partir de capturas enviadas por un usuario, el modelo puede determinar el siguiente paso a seguir en una interfaz y producir una secuencia de acciones reproducibles que se convierta en documentación paso a paso.
- Accesibilidad: actuar como capa de traducción entre instrucciones verbales o de alto nivel y acciones de ratón y teclado concretas para usuarios con movilidad reducida, con la ventaja de que la salida es directamente ejecutable.
- Recolección y etiquetado de datos de interacción: usar el modelo para preanotar acciones sobre capturas nuevas y después revisar, reduciendo el coste de construir datasets de grounding de GUI a partir de grabaciones de pantalla.
- Evaluación comparativa de interfaces: ejecutar baterías de tareas sobre distintas aplicaciones y medir tasas de éxito, ya que el modelo produce acciones deterministas con decodificación greedy y por tanto resultados reproducibles.

## Benchmarks y rendimiento

Grounding en condiciones retenidas de DeskForge-1M (precisión, %). "New Scenes" son escenas no vistas con atributos vistos; "Theme", "App" y "Resolution" dejan fuera del entrenamiento por completo un preset de apariencia, tres aplicaciones y una resolución de pantalla:

| Modelo | New Scenes | Theme | App | Resolution | Media |
|---|---:|---:|---:|---:|---:|
| UI-TARS-1.5-7B | 67,68 | 64,96 | 66,68 | 61,67 | 65,25 |
| GroundNext-7B | 73,57 | 67,67 | 72,10 | 68,87 | 70,55 |
| Gemma4-31B | 75,26 | 71,00 | 73,57 | 63,13 | 70,74 |
| UI-Venus-2-9B | 81,45 | 77,44 | 79,40 | 77,40 | 78,92 |
| Gemma4-E4B (base) | 16,27 | 12,10 | 14,15 | 6,56 | 12,27 |
| **DeskForge-Gemma4-E4B** | **89,01** | **85,36** | **84,50** | **81,62** | **85,12** |

Grounding en benchmarks externos de GUI (precisión, %), ninguno usado para entrenamiento:

| Modelo | ScreenSpot-Pro | ScreenSpot-v2 | OSWorld-G | UI-Vision | MMBench-GUI |
|---|---:|---:|---:|---:|---:|
| Gemma4-E4B (base) | 1,83 | 46,86 | 10,64 | 3,28 | 31,39 |
| **DeskForge-Gemma4-E4B** | **21,95** | **79,56** | **44,15** | **13,87** | **58,90** |

Finalización de tareas de horizonte largo (tareas resueltas). Un planificador fijo Qwen3.6-27B decide cada paso y el modelo de acción localiza los objetivos, de modo que solo cambia el modelo de acción entre filas:

| Modelo de accion | WebArena-Infinity (119 tareas) | OpenApps (100 tareas) |
|---|---:|---:|
| Gemma4-E4B (base) | 5 | 2 |
| **DeskForge-Gemma4-E4B** | **40** | **12** |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 15,9 GB (7.941.100.832 parámetros x 2 bytes). Hay que sumar la memoria del encoder de imagen, la caché KV del contexto (hasta 1.120 tokens de imagen por captura) y las activaciones, por lo que un presupuesto realista en bf16 se sitúa en torno a 18-20 GB para una sola petición.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Cabe holgadamente en todas ellas y permite lotes concurrentes.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16, aunque con margen ajustado si se sirven varias peticiones simultáneas. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o de 12 GB sería necesario cuantificar, y el proyecto no publica pesos cuantizados.
- Opciones de despliegue: `transformers` 5.16 (con `accelerate`, usando `device_map="auto"`) y `vLLM` 0.28 (configurando `max_soft_tokens` en `mm_processor_kwargs`). No se mencionan en la información disponible soporte para llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Media en DeskForge-1M | Disponibilidad |
|---|---|---|---|---|---|
| **DeskForge-Gemma4-E4B** | 7,94B (safetensors) | no disponible | Apache 2.0 | 85,12 | HuggingFace, transformers y vLLM |
| UI-Venus-2-9B | ~9B (por nomenclatura) | no disponible | no disponible | 78,92 | no disponible en la informacion proporcionada |
| GroundNext-7B | ~7B (por nomenclatura) | no disponible | no disponible | 70,55 | no disponible en la informacion proporcionada |
| UI-TARS-1.5-7B | ~7B (por nomenclatura) | no disponible | no disponible | 65,25 | no disponible en la informacion proporcionada |
| Gemma4-31B | ~31B (por nomenclatura) | no disponible | no disponible | 70,74 | no disponible en la informacion proporcionada |
| DeskForge-Qwen3.5-4B | ~4B (por nomenclatura) | no disponible | no disponible | no disponible | HuggingFace, mismo proyecto y dataset |

El dato más llamativo de la comparativa es que un modelo de 7,94B supera en precisión media a UI-Venus-2-9B (78,92 %), GroundNext-7B (70,55 %) y Gemma4-31B (70,74 %) en el benchmark de grounding específico, sin que se disponga de datos de contexto o licencia para esos competidores. DeskForge-Qwen3.5-4B es la alternativa directa dentro del mismo proyecto y con el mismo dataset, pero no se publican sus cifras en la información disponible.

## Limitaciones y advertencias

- Modelo especializado, no generalista: no está pensado para generación de texto libre, código, matemáticas ni conversación. Su única salida válida es una llamada a `pyautogui` del conjunto cerrado entrenado.
- Idioma: entrenado exclusivamente en inglés (`language: en`). El rendimiento con instrucciones en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- Repositorio recién publicado: 0 descargas y 0 "likes" en el momento del análisis, sin evidencia de uso en producción por terceros.
- Riesgo de alucinación de elementos: si el elemento objetivo no está visible en la captura, el modelo puede devolver coordenadas plausibles pero incorrectas. En tareas de grounding esto se traduce en clics en zonas equivocadas, un fallo silencioso que hay que mitigar con verificación posterior.
- Sensibilidad a cambios de apariencia: aunque las condiciones "Theme" y "Resolution" se evalúan por separado y el modelo obtiene buenas cifras, son precisamente las condiciones más difíciles (81,62 % en resolución frente a 89,01 % en escenas nuevas), lo que indica cierta dependencia del aspecto visual.
- Una única captura por paso: no hay soporte descrito para vídeo, historial visual de capturas anteriores ni comparación entre frames; el contexto de acciones se aporta como texto.
- Coordenadas fraccionarias: el consumidor debe convertir a píxeles multiplicando por las dimensiones reales de la captura, y el redimensionado debe replicar exactamente el `fit()` usado en entrenamiento (bilineal, máximo 2.097.152 píxeles). Desviarse de ese preprocesamiento degrada el grounding.
- Tamaño de imagen limitado: 1.120 tokens de imagen por captura es un presupuesto ajustado para pantallas densas; interfaces con muchos elementos pequeños pueden quedar mal representados.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, pero conviene verificar las condiciones de la licencia del modelo base google/gemma-4-E4B-it, que pueden incluir restricciones de uso aceptable que se heredan en la práctica.
- Sin datos publicados de cuantización: desplegar en GPUs de consumo de gama media exige cuantificar por cuenta propia, sin garantías de que el grounding se mantenga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/docling-project/DeskForge-Gemma4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset DeskForge-1M: https://huggingface.co/datasets/docling-project/DeskForge-1M
- Variante alternativa DeskForge-Qwen3.5-4B: https://huggingface.co/docling-project/DeskForge-Qwen3.5-4B
- Pagina del proyecto: https://saidgurbuz.github.io/deskforge/
- Codigo: https://github.com/Saidgurbuz/deskforge
- Paper: https://arxiv.org/abs/2610.02320
- Docling (sitio del proyecto de document intelligence al que pertenece la organizacion): https://docling.ai/
- Repositorio de Docling en GitHub: https://github.com/docling-project/docling
- Referencia y guias de Docling: https://docling.org/
- Herramienta de parsing de Docling: https://www.docling.cloud/
- Paquete Docling en PyPI: https://pypi.org/project/docling/
