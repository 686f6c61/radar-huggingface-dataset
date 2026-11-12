# kinmello/qbot-9b

## Resumen

QBot 9B es un modelo de lenguaje de aproximadamente 9.000 millones de parámetros (8.953.803.264 exactos según los pesos en safetensors) desarrollado por el usuario kinmello, afinado a partir de Qwen/Qwen3.5-9B mediante destilación con SFT y rejection-sampling fine-tuning sobre intentos verificados por el motor de Qlik. Está especializado en Qlik Sense y Qlik Cloud, en inglés y portugués brasileño, y cubre la generación de scripts de carga y modelos de datos, la resolución de dudas de sintaxis y funciones, y el uso como agente sobre Qlik Cloud a través de las herramientas MCP de Qlik (97 herramientas).

El modelo se distribuye en varias compilaciones: MLX de 8 bits (safetensors) para Apple Silicon con 24 GB de memoria sugerida, MLX de 4 bits con 16 GB, GGUF q8_0 con 16 GB de VRAM/RAM y GGUF q4_k_m con 10 GB. Forma parte de la aplicación de escritorio QBot (beta), que descarga automáticamente la compilación adecuada para el equipo mediante un `manifest.json` que lista versiones, builds y compatibilidad con versiones de la app.

Su relevancia radica en que es un modelo de nicho verticalizado: un ajuste fino de 9B que, según las pruebas del autor en tareas reales sobre un tenant de Qlik Cloud, supera al modelo profesor Qwen3.5-397B en modo thinking (8,93 frente a 7,76 en el conjunto live48). La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial, aunque el proyecto es independiente y no está afiliado a Qlik.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit, MLX 4-bit, GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | Ingles (en) y portugues brasileno (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se afina mediante destilacion, combinando SFT con rejection-sampling fine-tuning sobre intentos que fueron verificados por el motor de Qlik. Es decir, el proceso de entrenamiento filtra las respuestas candidatas segun su correccion funcional en el entorno real de Qlik, lo que orienta el ajuste hacia la validez ejecutable de scripts y modelos de datos mas que hacia la plausibilidad textual. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

El autor documenta el uso de LoRA y de destilacion entre las etiquetas del repositorio, y detalla la configuracion de inferencia empleada en las evaluaciones: temperatura 0 y penalizacion de repeticion de 1,05 sobre los ultimos 64 tokens. El modo thinking (`enable_thinking`) se activa para la correccion de apps y scripts, manteniendo el razonamiento entre pasos, y se desactiva para preguntas y construccion de apps. El prompt de sistema usado en el entrenamiento esta disponible en `system_prompt.txt`.

## Capacidades

- Generacion de scripts de carga (load scripts) y modelos de datos para Qlik Sense y Qlik Cloud.
- Respuesta a preguntas sobre funciones y sintaxis del lenguaje de Qlik.
- Uso como agente sobre Qlik Cloud mediante las 97 herramientas del servidor MCP de Qlik: crear apps, corregir scripts, recargar datos y construir hojas (sheets).
- Tool calling / function calling a traves de las definiciones MCP que proporciona la aplicacion QBot.
- Razonamiento multi-paso con modo thinking (`enable_thinking`) para tareas de correccion de apps y scripts.
- Capacidades multilingues limitadas a ingles y portugues brasileno.
- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Construccion de esquemas en estrella, tablas cruzadas (crosstab), tratamiento de fechas sucias, escenarios multi-fichero y cuadros de mando, segun las tareas evaluadas por el autor.

## Casos de uso

- Generacion de scripts de carga en produccion: el modelo escribe load scripts de Qlik Sense que pueden validarse contra el motor antes de desplegarse, reduciendo el ciclo de prueba y error en la carga de datos.
- Correccion automatica de apps existentes: con el modo thinking activado, analiza y repara scripts y apps completas; el autor reporta 10/10 en una muestra de 10 tareas de correccion con el modo thinking automatico de la app.
- Asistente de soporte para analistas de Qlik: responde dudas de funciones y sintaxis en ingles y portugues brasileno, adecuado para equipos de BI que trabajan con la herramienta a diario.
- Agente autonomo sobre Qlik Cloud: mediante las herramientas MCP puede crear apps, recargar datos y construir hojas dentro del tenant, integrandose en flujos de automatizacion de tareas de BI.
- Modelado de datos complejo: cubre esquemas en estrella, tablas cruzadas, fechas con formatos inconsistentes y fuentes multi-fichero, tareas incluidas en el conjunto de evaluacion live48.
- Despliegue local en estaciones de trabajo: las compilaciones MLX (8 y 4 bits) y GGUF (q8_0 y q4_k_m) permiten ejecutarlo en Apple Silicon con 16-24 GB o en equipos con 10-16 GB de VRAM/RAM, sin depender de la nube.
- Integracion en pipelines de CI/CD de BI: la version GGUF puede servirse con llama.cpp, Ollama o LM Studio para validar scripts de carga de forma automatizada antes de su publicacion.

## Benchmarks y rendimiento

| Prueba | QBot 9B (MLX 8-bit) | Referencia |
|---|---|---|
| live48 (48 tareas reales en Qlik Cloud, 0-10) | 8,93 (38 superadas) | Qwen3.5-397B con thinking: 7,76 |
| Muestra de correccion de apps (10 tareas, thinking automatico) | 10/10 | No disponible |
| live48 con MLX 4-bit | 5,02 | No disponible |

Las pruebas se realizaron en la app QBot sobre un Mac con M5 Pro y 24 GB, con MLX 8-bit, y fueron calificadas por el motor de Qlik. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 24 GB para MLX 8-bit, 16 GB para MLX 4-bit, 16 GB de VRAM/RAM para GGUF q8_0 y 10 GB para GGUF q4_k_m.
- GPU recomendadas: no se especifican modelos concretos; el autor valida la compilacion MLX en Apple Silicon (Mac M5 Pro con 24 GB) y las GGUF para llama.cpp, Ollama y LM Studio.
- Cabe en GPU de consumo: si, con las compilaciones de 4 bits (10-16 GB) en tarjetas con al menos esa memoria; la de 8 bits requiere 16-24 GB.
- Opciones de despliegue: MLX en Apple Silicon; llama.cpp, Ollama y LM Studio para los ficheros GGUF; endpoints compatibles segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QBot 9B | 8.953.803.264 | No disponible | Asistente y agente para Qlik Sense/Cloud | Apache 2.0 | Hugging Face (MLX y GGUF) |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face |
| Qwen3.5-397B (profesor) | 397B | No disponible | Modelo generalista de gran escala | No disponible en la informacion | Referenciado por el autor |

La comparacion con alternativas de la misma categoria (asistentes verticales de BI) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Version beta: puede equivocarse en funciones y detalles de sintaxis poco frecuentes; el autor recomienda revisar el codigo importante antes de usarlo.
- El uso como agente requiere las definiciones de las 97 herramientas MCP de Qlik, que proporciona la aplicacion QBot; sin ellas, las capacidades de agente no estan operativas.
- Las compilaciones de 4 bits rinden notablemente peor en las tareas evaluadas (5,02 frente a 8,93 en live48); se recomienda 8 bits cuando la memoria lo permita.
- Idiomas limitados a ingles y portugues brasileno; no se declara soporte de castellano ni de otros idiomas.
- No se detalla la longitud de contexto soportada, lo que dificulta planificar conversaciones o documentos largos.
- Riesgo de alucinacion en preguntas sobre funciones o sintaxis no cubiertas por el entrenamiento; la verificacion contra el motor de Qlik mitiga pero no elimina este riesgo.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; el proyecto es independiente y no esta afiliado ni respaldado por Qlik, y Qlik y Qlik Sense son marcas de QlikTech International AB.
- No se han publicado datos sobre sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinmello/qbot-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
