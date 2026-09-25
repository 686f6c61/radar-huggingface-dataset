# FreedomAISVR/MiMo-V2.6-Distill-Qwen-9B-MXFP4-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MXFP4-GGUF es una cuantización en formato MXFP4 del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, empaquetada para llama.cpp por el usuario FreedomAISVR. El modelo original lo desarrolla Xiaomi MiMo y consiste en un ajuste supervisado (SFT) sobre Qwen3.5-9B, entrenado con datos generados por la familia MiMo-V2.6 y orientado a cuatro dominios: ingeniería de software y codificación agéntica, trabajo de agente general (uso de herramientas, terminal, automatización), codificación visual y ciberseguridad.

Se trata de un modelo vision-language de aproximadamente 8.950 millones de parámetros con una arquitectura híbrida Mamba-2 más atención completa (32 capas, de las cuales 24 son de atención lineal y 8 de atención completa), lo que permite sostener una ventana de contexto de 262.144 tokens (256K) con un coste de VRAM contenido. Incluye un codificador de visión distribuido por separado en un fichero mmproj, por lo que admite entradas de imagen y vídeo, y activa el modo de razonamiento (thinking) por defecto.

Su relevancia ahora radica en que Xiaomi publicó este checkpoint como punto de partida abierto (licencia MIT) para investigación en aprendizaje por refuerzo agéntico, en lugar de como producto final cerrado. Esta versión concreta reduce el peso a 5,31 GB en MXFP4 manteniendo los 256K de contexto, lo que la hace desplegable en GPU de consumo de 16 GB con offload completo a GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`; híbrida Mamba-2 (atención lineal) + atención completa. 32 capas: 24 lineales y 8 de atención completa (`full_attention_interval: 4`) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K), `max_position_embeddings: 262144` |
| Tipos de cuantizacion | MXFP4 (OCP microscaled FP4: valores E2M1 con escala de potencia de dos E8M0 por cada 32 valores), ftype 42 de llama.cpp ("MXFP4 dense"). Normas, embeddings y escalas por capa permanecen en F32; `lm_head` en Q8_0. mmproj del codificador de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero principal MXFP4 + mmproj F16 separado) |

Detalles adicionales de arquitectura: hidden 4096, 16 cabezas de atención y 4 cabezas KV, `head_dim` 256, intermedio 12288, vocabulario 248.320, RoPE theta 10M con rotación parcial de 0,25 y MRoPE intercalado. Codificador de visión con 333 tensores, patch 16 y profundidad 27.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B (Alibaba Qwen) y Xiaomi MiMo lo ajustó mediante supervisión sobre una mezcla de 77,4B tokens, de los cuales 27,2B son con pérdida (loss-bearing), distribuidos entre datos de código, ciberseguridad, uso general de agente y datos visuales. La innovación estructural más relevante es la hibridación Mamba-2 con atención completa: solo 8 de las 32 capas usan atención estándar, mientras que 24 emplean atención lineal tipo Mamba-2, lo que explica que una ventana de 256K resulte asumible en memoria frente a un transformer denso equivalente. El codificador de visión (patch 16, profundidad 27) permite entrada de imagen y vídeo mediante un proyector multimodal separado que debe cargarse junto al modelo principal.

La cuantización de este repositorio es obra de FreedomAISVR, no de Xiaomi: convierte los pesos a MXFP4 (4,74 bits por peso medidos contra el GGUF F16 de 16,69 GiB y 427 tensores, no contra una base FP32 idealizada) y conserva en F32 las normas, embeddings y escalas. El resultado son 249 tensores MXFP4, 177 F32 y 1 Q8_0. Es importante no confundirlo con `MXFP4_MOE`: este es el formato MXFP4 denso y portable entre backends; en NVIDIA Blackwell se ejecuta a velocidad completa y fuera de Blackwell funciona pero más lento. La plantilla de chat va embebida (`tokenizer.chat_template`) y el modo de razonamiento está activado por defecto, de modo que las respuestas comienzan con `[Start thinking]`.

## Capacidades

- Generación de texto conversacional multi-turno en castellano y otros idiomas (no se detalla la lista de idiomas soportados).
- Razonamiento con modo thinking activado por defecto (secuencia `[Start thinking]`).
- Codificación agéntica: resolución de tareas de ingeniería de software, parcheo de repositorios y trabajo sobre terminal.
- Uso de herramientas y function calling en flujos de agente multi-paso.
- Comprensión de imágenes: entrada de imagen y vídeo mediante el codificador de visión y el fichero mmproj F16.
- Codificación visual: lectura y escritura de código a partir de capturas de pantalla o interfaces de usuario.
- Tareas de ciberseguridad: el modelo fue ajustado específicamente en este dominio.
- Automatización de flujos generales (benchmarks de automatización y uso de herramientas reportados por Xiaomi).
- Contexto largo efectivo: el autor verificó coherencia y seguimiento de instrucciones con prompts de 258.256 tokens.

## Casos de uso

- Agente de ingeniería de software: dado que el ajuste se centró en SWE y el modelo obtiene 61,1 en SWE Verified y 44,6 en SWE Pro (avg@3, cifras de Xiaomi), puede integrarse en un bucle de agente que lea un repositorio, localice el fallo y proponga un parche sobre la ventana de 256K tokens.
- Automatización de terminal y operaciones: con 37,1 en Terminal Bench 2.1 y 30,3 en AutomationBench, encaja en pipelines que ejecutan comandos, interpretan la salida y encadenan pasos sucesivos mediante tool calling.
- Asistencia de codificación a partir de capturas de interfaz: gracias al codificador de visión y su resultado de 64,0 en MiMo Visual Coding, puede traducir una maqueta o captura de UI a código, útil en equipos de front-end.
- Atención al cliente multi-turno con contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos o bases de conocimiento dentro del propio contexto sin recuperación externa obligatoria.
- Análisis de documentos extensos con imágenes: combinando el contexto de 256K y la entrada visual, se pueden procesar informes, manuales o capturas junto al texto asociado en una sola pasada.
- Copiloto de seguridad defensiva: el ajuste específico en ciberseguridad (31,3 en MiMo Cyber frente a 5,7 del modelo base) lo hace apto para triaje de alertas o revisión asistida de código con fines defensivos.
- Automatización de agentes de navegador y escritorio: por su orientación agéntica y sus resultados en benchmarks de automatización, puede pilotar flujos de herramientas de escritorio o tareas repetitivas de back-office.
- Despliegue en estación de trabajo con GPU de consumo: al ocupar 5,31 GB en MXFP4 más 0,92 GB de mmproj, es viable levantar un servidor local (`llama-server`) para uso individual o de equipo pequeño sin infraestructura de centro de datos.
- Investigación en RL agéntico: el propio Xiaomi declara este checkpoint como base para investigación, por lo que sirve como punto de partida para entrenamientos posteriores de refuerzo.

## Benchmarks y rendimiento

Resultados reportados por Xiaomi en su model card para el modelo original (no reproducidos por el autor de la cuantización, y medidos sobre MiMo-V2.6-Distill-9B, no sobre la versión MXFP4):

| Dominio | Benchmark | Qwen3.5-9B | MiMo-V2.6-Distill-9B |
|---|---|---|---|
| Código | SWE Verified avg@3 | 60,0 | 61,1 |
| Código | SWE Pro avg@3 | 32,0 | 44,6 |
| Código | MiMo Code (mini) avg@3 | 19,5 | 51,6 |
| Ciberseguridad | MiMo Cyber (mini) avg@3 | 5,7 | 31,3 |
| General | Terminal Bench 2.1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | 25,9 | 35,2 |
| General | AutomationBench v1.0.6 | 5,0 | 30,3 |
| Visual | MiMo Visual Coding (mini) | 61,7 | 64,0 |

Rendimiento de inferencia medido por el autor de la cuantización en una NVIDIA GeForce RTX 5060 Ti 16 GB (Blackwell SM120), CUDA 13.2, llama.cpp build b1868-4fea119d, offload completo (`-ngl 99`) y caché KV en Q8_0 para K y V:

| Configuración | MXFP4 | Variante NVFP4 (referencia del autor) |
|---|---|---|
| 128K contexto (`-c 131072`), prompt corto — prompt | 54,9 t/s | 18,1 t/s |
| 128K contexto — generación | 70,3 t/s | 66,8 t/s |
| 256K contexto (`-c 262144`), prompt de 258.256 tokens — prompt | 1584,8 t/s | 1662,5 t/s |
| 256K contexto — generación | 30,8 t/s | 29,8 t/s |

Notas del autor sobre estas cifras: la medida de prompt a 128K procede de un prompt de unos 20 tokens y no representa el throughput con prompts largos; la caída de velocidad de generación a 256K se debe a que la caché KV es aproximadamente el doble de grande; a 256K el modelo mantuvo coherencia y siguió instrucciones. Pruebas declaradas: carga y generación correctas, descripción de imagen correcta con `llama-mtmd-cli` y mmproj, y plantilla de chat embebida.

## Requisitos de hardware

- VRAM para los pesos: 5,31 GB del fichero MXFP4 más 0,92 GB del mmproj F16 (≈6,23 GB) si se usa entrada de imagen. El GGUF F16 equivalente ocupa 16,69 GiB.
- A la VRAM hay que sumar la caché KV; con configuración de 256K contexto y caché KV en Q8_0 el consumo es sustancialmente mayor, y el propio autor atribuye la caída de generación a 256K a que la caché KV "es aproximadamente el doble de grande" que a 128K. No se proporciona el desglose exacto de memoria.
- GPU verificada por el autor: NVIDIA GeForce RTX 5060 Ti 16 GB (Blackwell SM120), con offload completo y contexto de 256K.
- Cabe en GPU de consumo de 16 GB (verificado en RTX 5060 Ti 16 GB). Para otros modelos de GPU de consumo no hay datos publicados en la información disponible.
- MXFP4 se ejecuta a velocidad completa en NVIDIA Blackwell; en otras arquitecturas funciona pero más lento, según el autor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para visión, `llama-server`); requiere una build con soporte de MXFP4 (el autor indica la build b1868-4fea119d). llama-cpp-python necesita una wheel compilada contra una llama.cpp con soporte MXFP4; las wheels estándar de PyPI no cargan este fichero. No hay paquete Python con cuantización específica publicado. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput medido: 70,3 t/s de generación a 128K de contexto y 30,8 t/s a 256K en la RTX 5060 Ti 16 GB. Prompt a 256K con entrada de 258.256 tokens: 1584,8 t/s.
- Para tareas de grounding con imágenes, llama.cpp sugiere `--image-min-tokens 1024`.
- Detección de cuantización: el auto-detect de Hugging Face puede informar "unable to determine" para este fichero porque su enumeración de cuantizaciones va por detrás de la de llama.cpp; el autor afirma que el artefacto es MXFP4 genuino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (FreedomAISVR, MXFP4 GGUF) | ≈8,95B | 262.144 | GGUF MXFP4 (4,74 BPW) + mmproj F16 | MIT | Publicado en Hugging Face (0 descargas, 0 likes en el momento del análisis) |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ≈8,95B | 262.144 | Safetensors (no confirmado en la información disponible) | MIT | Publicado por Xiaomi MiMo |
| Qwen/Qwen3.5-9B (modelo base de la destilación) | ≈9B | 262.144 | no disponible | no disponible | Publicado por Alibaba Qwen |
| Variante NVFP4 del mismo modelo (referenciada por el autor) | ≈8,95B | 262.144 | NVFP4 | no disponible | no disponible |

No se dispone de datos de benchmarks de otras alternativas de 9B en la información proporcionada, por lo que la comparación cuantitativa se limita a las cifras de Qwen3.5-9B frente a MiMo-V2.6-Distill-9B incluidas en la sección de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La información proporcionada no documenta sesgos del modelo ni del proceso de ajuste.
- Riesgo de alucinación: no se documenta explícitamente, pero es un modelo generativo de 9B ajustado por SFT; las cifras de benchmarks son medias topadas (avg@3) y no garantizan corrección en producción.
- Los benchmarks publicados son cifras declaradas por Xiaomi sobre el modelo original, no reproducidas por el autor de la cuantización ni medidas sobre los pesos MXFP4, por lo que pueden no reflejar el rendimiento real de este artefacto cuantizado.
- Idiomas soportados: no disponible. La model card no detalla cobertura multilingüe.
- Limitación específica de esta cuantización: MXFP4 solo acelera de forma nativa en NVIDIA Blackwell; en otras GPU funciona pero con menor rendimiento. El auto-detect de cuantización de Hugging Face puede clasificar mal el fichero.
- Compatibilidad de software restringida: requiere build de llama.cpp con soporte MXFP4 (ftype 42); llama-cpp-python necesita wheel recompilada y no hay paquete Python oficial. Aumenta la fricción de despliegue frente a GGUF Q4_K_M o Q8_0 convencionales.
- Recomendaciones de contexto: el modo thinking está activado por defecto, lo que incrementa la longitud de salida y el consumo de cómputo si no se gestiona explícitamente.
- Licencia MIT: permite uso comercial y modificación, pero el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni mantenimiento demostrado.
- Ficheros duplicados por diseño: el codificador de visión va en un mmproj aparte, de modo que el despliegue multimodal exige cargar dos artefactos y ajustar la invocación (`--mmproj`).
- Uso dual en ciberseguridad: el ajuste específico en este dominio implica que el modelo puede asistir en tareas ofensivas; conviene evaluar salvaguardas antes de exponerlo a usuarios finales.
- El ID de contexto de grounding sugiere `--image-min-tokens 1024`, pero esto consume más tokens de imagen y por tanto más contexto y cómputo.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/FreedomAISVR/MiMo-V2.6-Distill-Qwen-9B-MXFP4-GGUF
- Modelo base de Xiaomi MiMo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Issue de llama.cpp sobre grounding con imágenes: upstream issue #16842 de llama.cpp (la información proporcionada solo incluye la referencia parcial del enlace)
