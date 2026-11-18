# jgamboa/Qwen3.8-27B-NInfer-4090

## Resumen

Qwen3.8-27B-NInfer-4090 es un artefacto de inferencia derivado del modelo oficial neroued/Qwen3.8-27B-NInfer, publicado por el usuario jgamboa. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado del artefacto oficial en el que se habilita la cuantizacion de activaciones a int8 durante la fase de prefill, manteniendo los pesos byte a byte identicos a los originales. El objetivo es acelerar el prefill en una NVIDIA RTX 4090 (sm_89) usando los tensor cores int8, sin degradar la calidad de las respuestas.

El modelo base es Qwen3.8-27B, un transformer multimodal de 27.000 millones de parametros con torre de vision, cabeza MTP (multi-token prediction) y un drafter DFlash2 para decodificacion especulativa. El artefacto incorpora pesos en Q4/Q5 para las proyecciones de texto, vocabulario en Q8 y una capa MTP que en la variante recomendada se recuantiza a Q4/Q5 para reducir el coste por ronda de especulacion.

La relevancia actual radica en que demuestra una ruta practica para servir un modelo de 27B multimodal en una unica GPU de consumo, con velocidades de prefill de 5.730-5.790 tok/s en pp2048 y decodificacion de 120-121 tok/s con MTP 3, superando a llama.cpp con un GGUF Q4_K_M del mismo checkpoint en 1,75-2,0x en prefill. La contrapartida es que el artefacto solo carga en el build NInfer del autor para Windows y RTX 4090, lo que limita su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision) con cabeza MTP y drafter DFlash2 para decodificacion especulativa |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 100.000 tokens configurado en el ejemplo de servicio; probado hasta 128K en needle-in-a-haystack |
| Tipos de cuantizacion | Q4/Q5 en proyecciones de texto, Q8 en vocabulario y `mtp/input_projection`, Q4/Q5 en capa MTP (variante recomendada); activaciones int8 en prefill; KV cache en rk4v4-e8 o int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del runtime NInfer); no compatible con safetensors, GGUF ni otros formatos estandar |
| Tamano del repo | 40,7 GB |
| Tamano del artefacto principal | 18,9 GiB (`qwen3_8_27b_a8_mtpq4q5.ninfer`) |
| Hardware objetivo | NVIDIA RTX 4090 (sm_89) |
| Runtime requerido | NInfer build de JGamboa/ninfer-4090-windows (rama `main`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con torre de vision, disenado para tareas image-text-to-text. Incorpora una cabeza MTP (multi-token prediction) que permite generar varios tokens por paso de decodificacion, y un drafter DFlash2 que actua como modelo especulativo para verificar propuestas de tokens. El artefacto incluye ademas una cabeza de propuesta indexada y el tokenizer y chat template originales.

Este artefacto concreto no entrena ningun parametro: copia palabra por palabra los pesos del artefacto oficial y solo modifica los permisos de cuantizacion de activaciones en 512 entradas de proyeccion, pasando de `A16Only` a `AllowA8`. En prefill (pasos de 129 tokens o mas), las activaciones se cuantizan por token y por grupos de 64 canales con `scale = amax / 127`, alineados con los grupos de las escalas de pesos, y los codigos Q4/Q5 alimentan MMAs `m16n8k32` de tensor cores int8. La suma int32 de cada grupo se escala por `weight_scale x activation_scale` en FP32. En decode (incluyendo MTP, DFlash2 y verificacion n-gram) se mantiene la ruta BF16, por lo que el texto y la velocidad coinciden con el artefacto oficial. La variante recomendada recuantiza las proyecciones de atencion y MLP de la capa MTP de Q8 a la mezcla Q4/Q5 de las capas de texto, manteniendo `mtp/input_projection` en Q8, para acortar cada ronda de draft sin reducir la tasa de aceptacion.

## Capacidades

- Generacion de texto y razonamiento en modo thinking on/off (el ejemplo de servicio usa `--preserve-thinking`).
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), gracias a la torre de vision incluida en el artefacto.
- Decodificacion especulativa con MTP (hasta 3 draft tokens en la configuracion medida) y drafter DFlash2.
- Verificacion n-gram en cadena (`--ngram chain`) para acelerar la decodificacion.
- Generacion de codigo y matematicas: no hay benchmarks publicados en la informacion disponible, pero el modelo base Qwen3.8-27B esta orientado a estas tareas.
- Soporte de contexto largo: respuestas exactas en needle-in-a-haystack a 8K, 64K y 128K tokens.
- Concurrencia de hasta 3 peticiones simultaneas en la configuracion de ejemplo (`--max-concurrency 3`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio local de asistente multimodal en una RTX 4090: el artefacto permite cargar un modelo de 27B con vision en una unica GPU de consumo y servir peticiones image-text-to-text con contexto de hasta 100.000 tokens, adecuado para prototipos y uso personal.
- Analisis de documentos largos con imagenes: gracias al prefill de 64K tokens en 14,8-14,9 s y a las respuestas exactas en needle-in-a-haystack a 128K, se pueden procesar informes extensos con graficos o capturas y hacer preguntas sobre su contenido.
- Generacion de codigo asistida en local: el modelo base esta orientado a codigo y el artefacto mantiene la calidad del original (45/45 tareas deterministas en `tools/eval`), por lo que puede integrarse en editores o scripts de desarrollo que requieran privacidad total.
- Investigacion en decodificacion especulativa: la combinacion de MTP 3, DFlash2, verificacion n-gram y la comparativa entre artefactos Q8 y Q4/Q5 en la capa MTP ofrece un banco de pruebas reproducible para estudiar tasas de aceptacion y latencia por ronda.
- Evaluacion de cuantizacion int8 en prefill: el artefacto permite medir el impacto de cuantizar activaciones a int8 en calidad (perplejidad 4,794439 frente a 4,800742 del oficial en cuatro corpus) y velocidad (hasta 2x en prefill), util para investigadores que estudien tecnicas de cuantizacion.
- Despliegue de chat multi-turno con contexto largo: con `--max-context 100000` y KV cache rk4v4-e8, se pueden mantener conversaciones extensas con hasta 3 usuarios concurrentes en una sola GPU.
- Prototipado de pipelines RAG multimodales: la ventana de 100K tokens y la torre de vision permiten inyectar grandes volumentes de contexto recuperado (texto e imagenes) sin truncamientos agresivos.

## Benchmarks y rendimiento

Mediciones publicadas por el autor (2026-09-27, `main` en `e7d309e3`, una RTX 4090 a relojes de stock sin pantalla, Windows 11, CUDA 13.4):

| Medicion | Resultado |
|---|---:|
| Prefill `pp512` (int8 KV) | 5.310 tok/s |
| Prefill `pp2048` (int8 KV) | 5.730-5.790 tok/s |
| Prefill, prompt de 64K tokens (needle test, rk4v4-e8 KV, respuesta exacta) | 14,8-14,9 s |
| Decode sin especulacion (`tg128`) | 54,6 tok/s |
| Decode con MTP 3, seis prompts mixtos, greedy, thinking off | 120 tok/s |

Comparativa con el artefacto oficial (2026-09-26, build anterior, GPU tambien manejando un escritorio 4K a 60 Hz):

| Medicion | Artefacto oficial | Este artefacto |
|---|---:|---:|
| Prefill `pp512` / `pp2048` | 2.536 / 2.762 tok/s | 4.436 / 5.008 tok/s |
| Prefill, prompt 8K (needle test) | 2,9 s | 1,6 s |
| Prefill, prompt 64K | 27,4-27,6 s | 17,2 s |
| Prefill, prompt 128K | 64,0 s | 43,0 s |
| Needle-in-a-haystack 8K / 64K / 128K | exacto | exacto |
| Perplejidad rapida, cuatro corpus (bf16 KV) | 4,800742 | 4,794439 |
| Calidad en 45 tareas deterministas (`tools/eval`, thinking off) | 45/45 | 45/45 |
| Decode sin especulacion (`tg128`) | 52,0 tok/s | 52,0 tok/s |
| Tiempo por ronda MTP 3 | 23,7 ms | 23,7 ms |

Comparativa entre variantes del propio artefacto (RTX 4090, seis prompts, MTP 3, `--lm-head-draft`, rk4v4-e8, greedy, ejecuciones alternadas):

| Artefacto | Decode | ms por ronda | Aceptacion |
|---|---:|---:|---:|
| `qwen3_8_27b_a8` (capa MTP en Q8) | 117,0 tok/s | 22,79 | 55,4 % |
| `qwen3_8_27b_a8_mtpq4q5` | 121,0 tok/s | 22,20 | 56,1 % |

Frente a llama.cpp (`a894dae`) con un GGUF Q4_K_M del mismo checkpoint BF16, en la misma maquina: 1,75-2,0x mas rapido en prefill, 1,1x en decode sin especulacion y 1,2-1,3x con MTP 3.

## Requisitos de hardware

- VRAM estimada: el artefacto principal ocupa 18,9 GiB en disco; con KV cache rk4v4-e8 y contexto de 100.000 tokens se debe reservar espacio adicional, aunque el autor no publica una cifra exacta de VRAM total. Una RTX 4090 de 24 GB es el hardware validado.
- GPU recomendadas: NVIDIA RTX 4090 (sm_89) es la unica soportada de forma explicita. No se mencionan A100, H100 ni otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 4090. No se confirma compatibilidad con RTX 3090, 4080 u otras.
- Opciones de despliegue: exclusivamente el binario `ninfer-serve.exe` del repositorio JGamboa/ninfer-4090-windows (rama `main`). No carga en llama.cpp, vLLM ni Transformers, ni en motores sin la ruta de prefill int8.
- Sistema operativo: Windows 11 con CUDA 13.4 en las mediciones publicadas.
- Latencia y throughput: prefill de 5.730-5.790 tok/s en pp2048, 14,8-14,9 s para 64K tokens, decode de 120-121 tok/s con MTP 3 y 54,6 tok/s sin especulacion. La configuracion de ejemplo admite `--max-concurrency 3` y `--prefill-chunk 1408`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---:|---|---|
| Qwen3.8-27B-NInfer-4090 (este) | 27B | hasta 100K configurado, probado a 128K | Apache 2.0 | `.ninfer` / NInfer en RTX 4090 | Prefill int8, MTP 3 y DFlash2; 121 tok/s decode |
| neroued/Qwen3.8-27B-NInfer (oficial) | 27B | no disponible | Apache 2.0 | `.ninfer` / NInfer | Mismo modelo sin permiso A8; 117 tok/s decode y prefill 1,75-2x mas lento |
| Qwen3.8-27B en GGUF Q4_K_M via llama.cpp | 27B | no disponible | Apache 2.0 (modelo base) | GGUF / llama.cpp | 1,75-2,0x mas lento en prefill y 1,1-1,3x en decode segun el autor |

No se dispone de datos de benchmarks frente a otros modelos de la misma categoria (por ejemplo, otros modelos multimodales de 20-30B) en la informacion proporcionada.

## Limitaciones y advertencias

- Portabilidad muy restringida: el artefacto solo carga en el build NInfer de JGamboa para Windows y RTX 4090 (sm_89). No funciona en llama.cpp, vLLM, Transformers ni en GPU sin la ruta de prefill int8.
- Dependencia de un runtime no estandar y de un repositorio personal, con riesgo de mantenimiento y de que el binario deje de actualizarse.
- El texto greedy puede divergir del artefacto oficial en prompts largos (4 de 6 prompts de prueba, en palabras 3-152) por el distinto redondeo de las activaciones de prefill, aunque con redaccion equivalente.
- La variante recomendada recuantiza la capa MTP a Q4/Q5, lo que puede alterar decisiones en empates cercanos durante la verificacion.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se confirma cobertura multilingue.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.
- Aunque la licencia es Apache 2.0, el uso comercial esta condicionado por la practica imposibilidad de ejecutar el artefacto fuera del runtime y hardware especificos.
- La configuracion de ejemplo limita la concurrencia a 3 peticiones y el contexto a 100.000 tokens; superar estos limites requiere ajustar parametros y VRAM.
- No hay datos publicados de VRAM total necesaria con contexto completo, por lo que el dimensionamiento en produccion requiere medicion propia.

## Enlaces

- Hugging Face: https://huggingface.co/jgamboa/Qwen3.8-27B-NInfer-4090
- Modelo base oficial: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del runtime NInfer para RTX 4090: https://github.com/JGamboa/ninfer-4090-windows/tree/main
- Comparativa con llama.cpp: https://github.com/JGamboa/ninfer-4090-windows/blob/main/docs/llamacpp-comparison.md
