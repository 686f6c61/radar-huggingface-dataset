# ryugyosoft/npue

## Resumen

npue no es un modelo de lenguaje, sino un motor de inferencia que ejecuta LLMs completos sobre la NPU de Intel. Lo publica el usuario ryugyosoft en Hugging Face bajo licencia Apache 2.0 y librería OpenVINO. Su función es convertir checkpoints de Hugging Face en grafos estáticos compatibles con NPU y servirlos mediante un servidor compatible con la API de OpenAI y una interfaz de chat en navegador. La separación entre motor y modelo es deliberada: el repositorio solo contiene código (descarga pequeña) y cada modelo convertido se descarga aparte, igual que llama.cpp respecto a un archivo GGUF.

El interés técnico está en cómo resuelve el problema de ejecutar arquitecturas MoE dispersas sobre hardware que exige grafos estáticos. En lugar de seleccionar expertos dentro del grafo (Gather no compila para constantes INT4 y tarda entre 18 y 135 ms en formas INT8 o empaquetadas), la red se corta en segmentos justo después de cada router: el top-k se calcula en el host y los pesos de los expertos elegidos se enlazan como entradas de tiempo de ejecución del siguiente segmento, con un coste medido de 1,7 ms. Sobre NPU 3720, esto permite 15-16 tok/s con LFM2-8B-A1B y 6,3-6,7 tok/s con Qwen3.6-35B-A3B.

El proyecto se presenta como generalización del trabajo previo de portar Gemma 4 E4B y Qwen3.5-9B a NPU 3720, de modo que añadir una arquitectura nueva equivale a escribir un único archivo builder. En el momento de la publicación el repositorio acumula 0 descargas y 0 likes, y depende de una versión preliminar de OpenVINO (2026.5 nightly), por lo que debe considerarse material en fase temprana y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (motor de inferencia). Arquitecturas soportadas: `lfm2_moe` (convolución corta + GQA + MoE 32x top-4) y `qwen3_5_moe` (Gated DeltaNet + atención con puerta + MoE 256x top-8 + experto compartido) |
| Parametros totales | No aplica (motor). Modelos convertidos de referencia: LFM2-8B-A1B y Qwen3.6-35B-A3B |
| Parametros activos | No aplica (motor). La nomenclatura de los modelos de referencia indica ~1B activos sobre 8B totales (A1B) y ~3B activos sobre 35B totales (A3B); el desglose exacto no esta disponible |
| Longitud de contexto | 1024 tokens estaticos (contexto fijo, no configurable segun la model card) |
| Tipos de cuantizacion | Expertos: INT4 channel-wise empaquetado, un tensor por experto, como entrada en tiempo de ejecucion. Resto de pesos (atencion, convolucion, DeltaNet, expertos compartidos, routers): INT4 group-128 como constantes dentro de los segmentos. LM head: INT8 compartido. Embeddings de tokens: lookup en el host |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para el codigo; los modelos convertidos heredan la licencia de su modelo base |
| Formato de pesos | Grafos OpenVINO IR segmentados + `experts.bin` (banco de expertos en memoria de host visible por la NPU). La conversion parte de safetensors de Hugging Face |

## Arquitectura y entrenamiento

npue no entrena nada: es una cadena de conversion y ejecucion. `convert.py` toma un checkpoint de Hugging Face y produce grafos segmentados cuantizados, con un archivo builder por arquitectura en `npue/models/` (`lfm2_moe`, `qwen3_5_moe`). El modulo `npue/ir.py` implementa los bloques de grafo (lineales cuantizados, RMSNorm, RoPE parcial, atencion sobre una cache KV alojada en el host, slots de expertos y Gated DeltaNet en forma matricial de 1 token y en forma chunkwise-parallel con inversa exacta por duplicacion de bloques, segura en fp16). `npue/runtime.py` ejecuta los segmentos, gestiona el estado por convencion de nombres (filas de KV, ventanas de convolucion, estados recurrentes), realiza el enlace de expertos y ofrece truncamiento exacto para verificacion especulativa. `npue/chat.py` cubre el bucle de chat: muestreo, cadenas de parada, decodificacion por prompt lookup con retroceso exacto (o rehacer perezoso en modelos recurrentes) y reutilizacion de prefijo entre turnos.

La innovacion principal es el esquema de ejecucion MoE sobre NPU. Medido en NPU 3720 con tamanos de Qwen3.6, por capa y token: calcular todos los expertos cuesta 45 ms; seleccionarlos dentro del grafo con Gather no compila para constantes INT4 y tarda 18-135 ms en INT8 o formas empaquetadas (la NPU mueve tablas completas); pasarlos como entradas de tiempo de ejecucion cuesta 1,7 ms, a la velocidad de memoria de la NPU. De ahi el corte de red tras cada router, el empaquetado channel-wise INT4 por experto (las escalas group-wise sobre pesos de tiempo de ejecucion caen a trabajo elemento a elemento, 20 veces mas lento) y el uso de bloques de prompt de 16 tokens que enlazan la union de expertos del bloque. El coste por token generado es de 23 llamadas a la NPU en LFM2-8B-A1B (~2,3 ms cada una) y 41 en Qwen3.6-35B-A3B. No se documenta composicion del dataset, volumen de tokens ni fases de RLHF o DPO, porque el proyecto no entrena modelos.

## Capacidades

- Conversion de checkpoints de Hugging Face a grafos estaticos de OpenVINO para NPU Intel, con un archivo builder por arquitectura.
- Ejecucion de LLM completo en NPU (atencion, convolucion, DeltaNet, routers y expertos compartidos como constantes; expertos MoE como entradas de tiempo de ejecucion).
- Servidor compatible con la API de OpenAI en la ruta `/v1`, con interfaz de chat en navegador en `http://localhost:8000/`.
- Generacion de texto y resumen en los modelos convertidos, con muestreo configurable, cadenas de parada y reutilizacion de prefijo entre turnos.
- Decodificacion por prompt lookup con retroceso exacto, o rehacer perezoso en modelos con estado recurrente, activada de forma automatica cuando un bloque de verificacion de 16 tokens cuesta menos que 4 pasos de un token.
- Ejecucion de arquitecturas hibridas con estado recurrente (Gated DeltaNet) ademas de atencion clasica, incluyendo una forma chunkwise-parallel con inversa exacta.
- Fallback a CPU cuando no hay controlador de NPU disponible, y verificacion contra el modelo HF original mediante `check_ref.py`.
- Perfilado por segmento con `prof_segments.py` y comprobaciones de generacion con `test_chat.py`.
- Capacidades multimodales: no disponibles. La torre de vision de Qwen3.6 no esta convertida, y el motor es solo texto por ahora.

## Casos de uso

- Asistente local en equipos sin GPU dedicada: LFM2-8B-A1B ocupa unos 5 GB, de modo que cabe en maquinas de 16 GB y aprovecha la NPU con 15-16 tok/s, lo que permite chatbots de uso personal o interno con los datos sin salir del equipo.
- Backend compatible con OpenAI para herramientas internas: el servidor expone `/v1` y puede arrancarse con `python server.py ENGINE_DIR --port 8080 --host 0.0.0.0`, de forma que aplicaciones que ya hablan con la API de OpenAI apunten al host local sin cambios de codigo.
- Asistencia sobre codigo y resumenes en portatiles con NPU: la decodificacion por prompt lookup eleva el rendimiento a 28-40 tok/s en tareas de codigo o resumen, donde el texto de entrada se copia parcialmente en la salida.
- Despliegue de mayor calidad en estaciones de 32 GB: Qwen3.6-35B-A3B ocupa unos 21 GB y ofrece 6,3-6,7 tok/s, adecuado para analisis de documentos y redaccion asistida donde prima la calidad sobre la velocidad y no hay GPU.
- Laboratorio de inferencia MoE sobre aceleradores: el codigo permite reproducir el esquema de segmentacion tras routers y de enlace de expertos por `set_tensor`, y medir alternativas (calcular todos los expertos, Gather en grafo, expertos como entradas) con `prof_segments.py`.
- Incorporacion de arquitecturas nuevas: escribir un builder en `npue/models/` convierte una arquitectura nueva en un objetivo de conversion, reutilizando el runtime, la cache KV en host y el bucle de chat.
- Validacion de fidelidad de la conversion: `check_ref.py` compara la salida del motor con el modelo Hugging Face original, util para decidir si la divergencia de palabra tras unos tokens es aceptable para un producto concreto.
- Demo docente o sala de exposicion: `start.bat` o `start.sh` crean el entorno virtual, descargan el modelo, lo compilan para la NPU la primera vez y abren la interfaz de chat, sin mas configuracion que el controlador de NPU instalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K ni equivalentes). Las unicas cifras publicadas son medidas de velocidad y de memoria del propio motor sobre NPU 3720:

| Medicion | Valor |
|---|---|
| LFM2-8B-A1B, decodificacion en NPU 3720 | 15-16 tok/s |
| LFM2-8B-A1B, con prompt lookup en codigo o resumenes | 28-40 tok/s |
| Qwen3.6-35B-A3B (texto), decodificacion en NPU 3720 | 6,3-6,7 tok/s |
| Llamadas a la NPU por token generado | 23 (LFM2-8B-A1B), 41 (Qwen3.6-35B-A3B) |
| Coste por llamada a la NPU | ~2,3 ms |
| Memoria en disco/RAM del modelo convertido | ~5 GB (LFM2-8B-A1B), ~21 GB (Qwen3.6-35B-A3B) |
| Calculo de todos los expertos, por capa y token | 45 ms |
| Seleccion de expertos en grafo con Gather | 18-135 ms (INT8 o formas empaquetadas; no compila para constantes INT4) |
| Expertos como entradas de tiempo de ejecucion | 1,7 ms |
| Umbral de activacion de prompt lookup | Bloque de verificacion de 16 tokens frente a 4 pasos de un token: 2,7 (activo) en LFM2, 5,7 (desactivado) en Qwen3.6 |
| Fidelidad de cuantizacion | Logits del primer token dentro de ~33% de bf16, mismo top-1 en las comprobaciones realizadas |

## Requisitos de hardware

- Acelerador objetivo: NPU 3720, probada en Windows 11. La NPU 4000 (Lunar Lake) no esta probada segun el autor.
- Alternativa sin NPU: el motor cae a CPU si no hay controlador de NPU. El fallback a CPU se probo en Ubuntu 22.04 bajo WSL.
- Memoria: unos 5 GB para LFM2-8B-A1B (equipos de 16 GB) y unos 21 GB para Qwen3.6-35B-A3B (equipos de 32 GB). Los expertos residen en memoria de host visible por la NPU (`experts.bin`), por lo que la RAM, no solo la VRAM, es el recurso critico.
- GPU: no se menciona soporte de CUDA ni de GPU alguna. El proyecto esta orientado a NPU Intel con fallback a CPU.
- VRAM: no aplica; no se documentan requisitos de memoria de GPU.
- Dependencias: OpenVINO en version preliminar (2026.5 nightly), instalada desde el indice nocturno de OpenVINO. El entorno virtual ocupa aproximadamente 1 GB.
- Despliegue: `start.bat` (Windows) y `start.sh` (Ubuntu) crean el entorno, descargan el modelo, lo compilan para la NPU la primera vez y levantan la interfaz de chat. El servidor manual es `server.py ENGINE_DIR` con opciones `--port` y `--host`, y la API compatible con OpenAI queda en `/v1`.
- Operaciones de conversion: `convert.py HF_DIR ENGINE_DIR` cuantiza y construye los grafos segmentados (minutos), y requiere torch y safetensors solo en el lado de conversion.
- Latencia y throughput: los indicados en la seccion de benchmarks. En el caso de Qwen3.6-35B-A3B, 6,3-6,7 tok/s con 41 llamadas a la NPU por token.

## Comparativa con modelos similares

El artefacto no es un modelo, por lo que la comparacion se plantea entre las dos conversiones de referencia y las alternativas habituales de despliegue local.

| Opcion | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npue + LFM2-8B-A1B-npu | 8B totales, ~1B activos por nomenclatura | 1024 tokens estaticos | 15-16 tok/s en NPU 3720; 28-40 tok/s con prompt lookup | Apache 2.0 (codigo); la del modelo base en el modelo | Repositorio publico, 0 descargas y 0 likes en la informacion disponible |
| npue + Qwen3.6-35B-A3B-npu (texto) | 35B totales, ~3B activos por nomenclatura | 1024 tokens estaticos | 6,3-6,7 tok/s en NPU 3720 | Apache 2.0 (codigo); la del modelo base en el modelo | Repositorio publico; la torre de vision no esta convertida |
| llama.cpp con GGUF | Depende del modelo cargado | Configurable por el usuario | No disponible en la informacion proporcionada | MIT para el motor, variable en los pesos | Ampliamente extendido, con soporte de CPU y de varios backends de GPU |
| OpenVINO GenAI | Depende del modelo cargado | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | Disponible como componente de OpenVINO; orientado a conversion y ejecucion de modelos en hardware Intel |

Diferencias clave frente a las alternativas genericas: npue no usa la ruta estandar de OpenVINO GenAI, sino un runtime propio con segmentacion del grafo tras cada router MoE y enlace de expertos por `set_tensor`, y limita el contexto a 1024 tokens estaticos, lo que lo aleja de los despliegues GGUF habituales, donde la ventana depende del modelo y de la memoria disponible.

## Limitaciones y advertencias

- Contexto fijo de 1024 tokens. No es configurable segun la model card, lo que descarta conversaciones largas, documentos extensos y agentes con historial amplio.
- Solo texto. La torre de vision de Qwen3.6 no esta convertida, de modo que no hay capacidades multimodales.
- Cuantizacion agresiva de expertos en INT4 channel-wise con redondeo al mas cercano. Los logits del primer token quedan dentro de ~33% de bf16 y se mantiene el top-1 en las comprobaciones, pero las respuestas, aun siendo fluidas, eligen palabras distintas de las del modelo en bf16 tras unos pocos tokens. No es adecuado para tareas que exijan reproducibilidad estricta frente al modelo original.
- Dependencia de una version preliminar de OpenVINO (2026.5 nightly), con el riesgo de ruptura de API que ello implica.
- Compatibilidad de hardware muy limitada: probado en NPU 3720 bajo Windows 11 y con fallback a CPU en Ubuntu 22.04 bajo WSL. La NPU 4000 (Lunar Lake) esta sin probar.
- Repositorio sin traccion: 0 descargas y 0 likes en la informacion disponible, sin benchmarks publicados ni validacion por terceros.
- Idiomas soportados no declarados, por lo que no puede asumirse cobertura multilingue verificada.
- Licencia del codigo Apache 2.0, pero cada modelo convertido conserva la licencia de su modelo base; antes de un uso comercial hay que revisar la licencia del checkpoint concreto.
- Los repositorios de modelos deben descargarse con `hf download` (o con los scripts de arranque), no con `git clone`, que sin Git LFS devuelve archivos punteros en lugar de los pesos. Los scripts detectan ese caso y se detienen.
- La decodificacion por prompt lookup se activa por umbral de coste: permanece desactivada en Qwen3.6-35B-A3B (5,7 frente al umbral), por lo que ese modelo no se beneficia de la aceleracion en codigo o resumenes.
- El motor no entrena ni ajusta modelos: no hay datos de entrenamiento, dataset, RLHF ni DPO que evaluar, y la calidad final depende por completo del checkpoint base elegido.

## Enlaces

- Repositorio del motor en Hugging Face: https://huggingface.co/ryugyosoft/npue
- Modelo convertido LFM2-8B-A1B-npu: https://huggingface.co/ryugyosoft/LFM2-8B-A1B-npu
- Modelo convertido Qwen3.6-35B-A3B-npu: https://huggingface.co/ryugyosoft/Qwen3.6-35B-A3B-npu
- Port previo Gemma 4 E4B-it a NPU: https://huggingface.co/ryugyosoft/gemma-4-E4B-it-npu
- Port previo Qwen3.5-9B a NPU: https://huggingface.co/ryugyosoft/Qwen3.5-9B-npu
- Indice de paquetes nocturnos de OpenVINO, necesario para las dependencias: https://storage.openvinotoolkit.org/simple/wheels/nightly
- No se han proporcionado enlaces a papers, blogs tecnicos ni demos adicionales en la informacion disponible.
