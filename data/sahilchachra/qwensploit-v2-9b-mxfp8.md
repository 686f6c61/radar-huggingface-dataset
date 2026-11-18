# sahilchachra/Qwensploit-V2-9B-MXFP8

## Resumen

Qwensploit-V2-9B-MXFP8 es una cuantizacion en formato MXFP8 del modelo xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5, un fine-tune orientado a ciberseguridad y red team construido sobre una base Qwen3.5 de 9B. La publica el usuario sahilchachra en Hugging Face y esta pensada especificamente para ejecutarse en Apple Silicon mediante la libreria MLX, en concreto a traves de mlx-vlm. El modelo conserva la naturaleza multimodal image-text-to-text del original: la torre de vision Qwen3-VL se mantiene en bf16 y solo se cuantiza el backbone de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 9.409.813.744 parametros en hardware de consumo de Apple con un peso en disco de aproximadamente 9,5 GB, manteniendo la ruta de vision activa. El backbone de texto emplea una arquitectura hibrida de atencion lineal GatedDeltaNet combinada con atencion completa cada cuarta capa, sobre 32 capas en total. Es un modelo de razonamiento: emite un canal de pensamiento (`reasoning_content`) antes de la respuesta final.

El modelo esta especializado en tareas de seguridad ofensiva y de investigacion, por lo que su uso debe restringirse a contextos de prueba autorizados. La licencia es `other` y el autor advierte explicitamente de que la licencia del modelo base no se extiende automaticamente a todos los datos de entrenamiento del fine-tune, lo que obliga a revisar la model card original antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: GatedDeltaNet (atencion lineal) + atencion completa cada 4 capas; 32 capas; torre de vision Qwen3-VL |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (E4M3 + escala compartida E8M0, grupo de 32); 8,626 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (MLX), 2 shards, ~9,5 GB en disco |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `qwen3_5` del modelo base, un vision-language model con backbone de texto hibrido que alterna capas de atencion lineal GatedDeltaNet con capas de atencion completa, aplicando atencion completa cada cuarta capa sobre un total de 32 capas. La torre de vision es Qwen3-VL. El fine-tune base (Qwensploit-V2-9B-CyberSecurity-Qwen3.5) deriva a su vez de xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, un merge de tres modelos, y esta especializado en ciberseguridad y red team.

Esta publicacion concreta es una cuantizacion, no un reentrenamiento: el autor aplica cuantizacion MXFP8 con MLX sobre el backbone de texto, incluida la matriz `lm_head` (el modelo tiene `tie_word_embeddings=false`, por lo que esta es una matriz separada). La torre de vision se mantiene en bf16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El repositorio upstream incluye una cabeza MTP separada (`model-mtp.safetensors`) para decodificacion especulativa, pero mlx-vlm no la carga ni la convierte, por lo que no esta incluida y la decodificacion especulativa no esta disponible en esta build.

## Capacidades

- Generacion de texto y razonamiento con canal de pensamiento explicito (`<think>` / `reasoning_content`) antes de la respuesta final.
- Comprension de imagenes: la torre de vision Qwen3-VL se mantiene en bf16 y responde correctamente a preguntas sobre color y forma de imagenes (verificado por el autor con imagenes de color solido y una figura geometrica).
- Conocimiento especializado en ciberseguridad ofensiva: comandos de escaneo (por ejemplo, `nmap -sS -p-`), conceptos de red team y pentesting.
- Razonamiento aritmetico basico (verificado: 25 + 17 = 42).
- Conversacion multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Pentesting autorizado y red team: el modelo responde a preguntas tecnicas sobre tecnicas de reconocimiento y explotacion (por ejemplo, sintaxis de escaneos TCP SYN completos), lo que lo hace util como asistente de consulta durante ejercicios de seguridad con alcance definido.
- Formacion y concienciacion en seguridad: puede explicar conceptos como reverse shells o tecnicas de ataque en entornos de laboratorio, apoyandose en su canal de razonamiento para justificar cada paso.
- Analisis de capturas de pantalla o diagramas de red: al conservar la ruta de vision, permite adjuntar imagenes (topologias, paneles de herramientas, resultados de escaneo) y formular preguntas sobre ellas en local.
- Asistente local en Apple Silicon para investigadores: con ~9,5 GB en disco y cuantizacion de 8,626 bpw, se puede desplegar en un Mac con suficiente memoria unificada sin depender de servicios en la nube, lo que resulta adecuado para material sensible de seguridad.
- Integracion via API compatible con OpenAI: el autor verifica su funcionamiento en LM Studio a traves de `/v1/chat/completions` en `localhost:1234`, lo que permite conectarlo a herramientas existentes que ya hablen ese protocolo.
- Exploracion de tecnicas de cuantizacion MXFP8 en MLX: sirve como referencia practica para evaluar la perdida de calidad al cuantizar un VLM hibrido a 8 bits manteniendo la torre de vision en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta pruebas de humo (smoke tests) con decodificacion greedy determinista:

| Prueba | Entrada | Respuesta verificada |
|---|---|---|
| Texto | "What is the capital of France?" | "The capital of France is Paris." |
| Texto | "What is 25 + 17?" | "25 + 17 = 42" |
| Texto (dominio) | Comando para escaneo TCP SYN en los 65535 puertos | Respuesta correcta estilo `nmap -sS -p- <target>` |
| Vision | Imagen roja solida, color principal | Red |
| Vision | Imagen azul solida, color principal | Blue |
| Vision | Circulo verde, forma y color | "green circle" |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa ~9,5 GB en disco (2 shards); en ejecucion hay que sumar el estado de activaciones y la torre de vision en bf16, por lo que se recomienda un minimo practico de 16 GB de memoria unificada en Apple Silicon.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para GPU NVIDIA ni CUDA.
- GPU de consumo: si, en Mac con chip de la serie M; el autor no especifica modelos concretos probados.
- Opciones de despliegue: mlx-vlm (>= 0.6.12, necesaria para la arquitectura `qwen3_5`) y LM Studio con su runtime MLX integrado. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota operativa: al ser un modelo de razonamiento, conviene configurar `max_tokens` de 200 o mas; de lo contrario la respuesta puede quedar vacia con `finish_reason: "length"` mientras el modelo sigue en el canal de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-9B-MXFP8 (este) | 9,41B | No disponible | safetensors MLX, mlx-vlm / LM Studio | other | Cuantizacion MXFP8, vision en bf16 |
| Qwensploit-V2-9B-MXFP4 | No disponible | No disponible | safetensors MLX | other | Misma familia, cuantizacion de 4 bits del mismo autor |
| xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5 | 9B (aproximado, segun nombre) | No disponible | No disponible | other | Modelo base sin cuantizar de esta publicacion |
| xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic | 9B (aproximado, segun nombre) | No disponible | No disponible | No disponible | Merge base del fine-tune de ciberseguridad |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo orientado a seguridad ofensiva: debe usarse exclusivamente en contextos de prueba autorizados y conforme a la legislacion aplicable; un uso indebido puede tener consecuencias legales.
- Licencia `other`: la licencia del modelo base no se extiende automaticamente a todos los datos de entrenamiento del fine-tune (algunos datasets de razonamiento o sinteticos pueden tener restricciones de entrenamiento competitivo). Revisar la model card original antes de uso comercial o redistribucion.
- Riesgo de alucinacion: no se documentan tasas; como modelo de razonamiento sin benchmarks publicados, las respuestas tecnicas deben validarse antes de aplicarlas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con garantias.
- Decodificacion especulativa no disponible: la cabeza MTP del repositorio upstream no se incluye en esta build.
- Respuestas truncadas: sin `max_tokens` suficiente (200+), la salida puede quedar vacia por agotar el presupuesto durante el canal de razonamiento.
- Exclusivo de Apple Silicon: no hay versiones GGUF ni compatibilidad con ecosistemas CUDA, lo que limita su despliegue en servidores convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilchachra/Qwensploit-V2-9B-MXFP8
- Cuantizacion MXFP4 del mismo autor: https://huggingface.co/sahilchachra/Qwensploit-V2-9B-MXFP4
- Modelo base del fine-tune: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Merge base del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Perfil del autor de la cuantizacion: https://huggingface.co/sahilchachra
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
