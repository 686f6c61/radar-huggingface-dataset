# KORMo-VL/KORMo-Web-4B-mlx-4bit

## Resumen

KORMo-Web-4B es un agente web multimodal de 4.539 millones de parámetros desarrollado por KORMo-VL, diseñado para completar tareas reales de navegador a partir únicamente de capturas de pantalla. El modelo recibe una instrucción en coreano o inglés y ejecuta un bucle de planificación, clic, escritura y navegación entre sitios y pestañas hasta completar la tarea, sin necesidad de DOM ni árbol de accesibilidad. Está construido sobre la arquitectura Qwen3.5 y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en su enfoque "screenshot-only": actúa sobre lo que se ve en pantalla, como una persona, y verifica el resultado de cada acción en la siguiente captura. Según la model card, en la misma evaluación de 612 tareas web en vivo supera a todos los agentes web de pesos abiertos comparados, con +9,6 puntos en inglés y +22,1 puntos en coreano, alcanzando un 42,3% de éxito en Online-Mind2Web en ambos idiomas.

Esta ficha corresponde específicamente a la variante cuantizada a 4 bits en formato MLX, pensada para ejecutarse en Macs con Apple Silicon de 16 GB o más de memoria unificada. El repositorio ocupa 3,2 GB y los pesos cuantizados pesan 2,8 GB, con un consumo medido de aproximadamente 3,8 GB en inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.5, tag `qwen3_5`) |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MLX); el modelo base se publica en bf16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits); el base en bf16 |

## Arquitectura y entrenamiento

El modelo es un vision-language transformer de la familia Qwen3.5, ajustado para actuar como agente de interfaz gráfica. La model card describe dos fases de entrenamiento: un preentrenamiento a gran escala con más de 10 millones de muestras atómicas de comprensión web en coreano e inglés, que enseñan al modelo qué es cada elemento de interfaz, dónde está y qué hace (texto, posición, apariencia, disposición, función y estado); y un ajuste posterior con más de 100K trayectorias de interacción web bilingües que traducen esa comprensión en acciones multi-paso reales.

Una innovación destacable es el modo "piensa y actúa": cada acción va precedida de un paso breve de razonamiento, lo que hace el comportamiento inspeccionable y depurable. El modelo opera exclusivamente sobre capturas de pantalla, sin DOM ni árbol de accesibilidad, y comprueba el resultado de cada acción en la siguiente captura. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Comprensión de capturas de pantalla de interfaces web: identificación de elementos, su posición, apariencia, disposición, función y estado.
- Planificación y ejecución de tareas de navegador multi-paso: clic, escritura, navegación y verificación del resultado en la captura siguiente.
- Flujos multi-sitio y multi-pestaña: buscar en un sitio, verificar en otro y escribir el resultado en un tercero, gestionando pestañas de forma autónoma.
- Instrucciones naturales en coreano e inglés, tanto comandos cortos como peticiones conversacionales largas.
- Razonamiento previo a la acción ("thinks, then acts") para inspección y depuración del comportamiento.
- Soporte de tool calling mediante el esquema de herramientas incluido en el repositorio.
- Capacidad de agente autónomo con bucle de razonamiento multi-paso.
- Procesamiento image-text-to-text (entrada de imagen y texto, salida de texto).

## Casos de uso

- Automatización de tareas web repetitivas: rellenar formularios, consultar datos en portales internos y extraer información de páginas, actuando solo sobre capturas de pantalla y sin depender del DOM, lo que lo hace robusto ante cambios de marcado.
- Agentes de atención al cliente en portales: gestionar flujos de consulta o modificación de datos en webs de terceros siguiendo instrucciones en lenguaje natural, con verificación de cada paso en la captura siguiente.
- Pruebas de aceptación end-to-end de aplicaciones web: ejecutar recorridos de usuario reales en navegador y comprobar visualmente el resultado, útil en pipelines de CI/CD para validar regresiones de interfaz.
- Investigación en agentes web reproducibles: el autor publica pesos, datos de preentrenamiento web bilingües, trayectorias de interacción y benchmarks, lo que permite reproducir experimentos y comparar metodologías.
- Automatización en coreano: tareas sobre sitios coreanos con instrucciones en coreano, donde el modelo rinde notablemente mejor que alternativas abiertas según la model card (42,3% frente a 15,4% del siguiente mejor en KO).
- Asistentes de escritorio en Mac: despliegue local en Apple Silicon con 16 GB de memoria mediante vllm-mlx, con API compatible con OpenAI, para automatización personal o prototipado sin coste de nube.
- Investigación de interacción humano-ordenador: analizar el razonamiento previo a cada acción para estudiar estrategias de navegación y depurar fallos de agentes.

## Benchmarks y rendimiento

Evaluación sobre las mismas 612 tareas web en vivo (300 en inglés, 312 en coreano), puntuadas por el mismo juez LLM. Tasa de éxito en porcentaje; el denominador es el total de tareas, por lo que los fallos por caída o ejecución vacía cuentan como fallo.

| Modelo | Tamaño | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-4B (base, sin ajuste) | 4B | 20,0 | 13,5 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| **KORMo-Web-4B** | **4B** | **42,3** | **42,3** |
| KORMo-Web-9B | 9B | 51,0 | 48,1 |

Los datos corresponden a la model card del autor; no se dispone de resultados independientes en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en 4 bits ocupan 2,8 GB y el consumo medido en inferencia es de aproximadamente 3,8 GB. Los episodios largos añaden caché KV, aproximadamente 1 GB por cada 30K tokens, y Chrome también consume memoria.
- Memoria recomendada: 16 GB o más en Mac con Apple Silicon para esta variante 4 bits. La variante bf16 (9,6 GB de pesos, unos 9,5 GB en uso) requiere 24 GB o más; KORMo-Web-9B en bf16 (17,5 GB de pesos, unos 19 GB en uso) requiere 48 GB o más (32 GB es ajustado).
- GPU: no aplica para esta variante MLX, orientada a Apple Silicon. Para GPUs NVIDIA se debería usar el modelo base con vLLM u otro runtime compatible; no se detallan requisitos de VRAM para CUDA en la información disponible.
- Cabe en GPU de consumo: sí, en Macs de consumo con 16 GB o más de memoria unificada. Para GPUs de consumo tipo RTX 4090 no hay datos específicos en la información disponible.
- Opciones de despliegue: vllm-mlx 0.6.0 o superior (API compatible con OpenAI), junto con Playwright y Chromium para el arnés de navegador de referencia. El repositorio incluye el system prompt, el esquema de herramientas, la especificación del arnés y el agente de referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Online-Mind2Web EN | Online-Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KORMo-Web-4B (esta ficha, MLX 4 bits) | 4,5B | no disponible | 42,3 | 42,3 | Apache 2.0 | Hugging Face (MLX 4 bits y bf16) |
| OpenWebRL-4B | 4B | no disponible | 32,7 | 15,4 | no disponible | no disponible |
| Fara-1.5-4B | 4B | no disponible | 20,7 | 7,7 | no disponible | no disponible |
| UI-TARS-1.5-7B | 7B | no disponible | 22,3 | 20,2 | no disponible | no disponible |

KORMo-Web-4B supera a los tres agentes web abiertos comparables en ambos idiomas según los datos del autor, con una ventaja especialmente amplia en coreano. La comparativa se limita a los modelos incluidos en la model card; no se dispone de datos de otros agentes web en la información proporcionada.

## Limitaciones y advertencias

- Solo se han publicado evaluaciones del propio autor; no hay verificación independiente de los resultados en la información disponible.
- El modelo está especializado en tareas de navegador y agente web; no se documentan capacidades generales de generación de texto, código o matemáticas fuera de ese dominio.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está documentado.
- Depende de capturas de pantalla: la precisión puede degradarse con interfaces muy dinámicas, animaciones, contenido que requiere scroll complejo o elementos visualmente ambiguos.
- Riesgo de alucinación en la planificación de acciones y en la interpretación de estados de la interfaz; conviene supervisar tareas críticas.
- El consumo de memoria crece con la longitud del episodio (aproximadamente 1 GB de caché KV por cada 30K tokens), lo que puede limitar episodios muy largos en equipos de 16 GB.
- Esta variante es exclusiva de Apple Silicon (MLX); para otros entornos hay que usar el modelo base en bf16.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos y del modelo base Qwen3.5.
- No se detallan sesgos conocidos ni evaluación de seguridad en la información proporcionada.

## Enlaces

- Modelo en Hugging Face (esta variante MLX 4 bits): https://huggingface.co/KORMo-VL/KORMo-Web-4B-mlx-4bit
- Modelo base bf16: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- Variante KORMo-Web-9B: https://huggingface.co/KORMo-VL/KORMo-Web-9B
- vllm-mlx (runtime de inferencia): https://github.com/waybarrios/vllm-mlx
- Demo en vídeo: https://huggingface.co/KORMo-VL/KORMo-Web-4B-mlx-4bit/resolve/main/assets/gui_final_demo_masked.mp4
