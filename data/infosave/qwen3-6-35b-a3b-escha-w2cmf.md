# infosave/Qwen3.6-35B-A3B-Escha-W2cmf

## Resumen

Qwen3.6-35B-A3B-Escha-W2cmf es una transcodificación al contenedor CMF del modelo EschaLabs/Qwen3.6-35B-A3B-Escha-W2, una versión cuantizada a 2 bits de los expertos enrutados del Qwen3.6-35B-A3B original de Alibaba. El trabajo de cuantización procede de Escha Labs mediante su códec `eschamoe`; el repositorio de infosave se limita a reexpresar esos pesos en los layouts de CMF para que puedan ejecutarse en el motor `cortiq`, un binario único sin dependencias de Python que soporta CUDA, Vulkan, Metal y CPU.

El modelo es un transformer híbrido con arquitectura MoE: 40 capas (10 de atención completa y 30 de GatedDeltaNet lineal), 256 expertos enrutados con top-8 más un experto compartido, dimensión oculta 2048 y vocabulario de 248 320 tokens. El resultado es un archivo de 12,87 GB que cabe en una GPU de 24 GB y alcanza 145-147 tok/s de decodificación en una RTX A5000, con decodificación especulativa implícita en el diseño del motor y carga dinámica de expertos que permite ejecutarlo incluso con 4 GB de VRAM.

La relevancia actual reside en la combinación de tres factores: un MoE de 35B parámetros totales comprimido a 2 bits sin colapso de calidad (perplejidad 4,971 sobre el texto de referencia), un runtime nativo que elimina la pila Python y un formato de archivo único con mmap que simplifica el despliegue en producción. La licencia Apache-2.0 se mantiene desde el modelo original de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (10 capas de atención completa + 30 capas GatedDeltaNet lineal) |
| Parámetros totales | 35B (denominación del modelo base; no se detalla el recuento exacto en la información disponible) |
| Parámetros activos | top-8 de 256 expertos enrutados más un experto compartido (recuento exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (`q2tp`) para `gate`/`up` de expertos enrutados y compartidos; 4 bits (`q4tp`) para `down` de expertos y el esqueleto completo; capas densas en int8 en el build de Escha |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (archivo único `qwen36-35b-a3b-escha-w2-q2tp.cmf`, 12 866 141 998 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina 10 capas de atención completa con 30 capas de GatedDeltaNet lineal, una variante de atención lineal con estado recurrente que reduce el coste computacional en contextos largos. La capa MoE cuenta con 256 expertos enrutados con activación top-8 más un experto compartido siempre activo, sobre una dimensión oculta de 2048 y un vocabulario de 248 320 tokens. El build de Escha no incluye cabeza MTP (multi-token prediction), característica que se preserva en esta transcodificación.

El proceso de cuantización de Escha Labs aplica 2 bits a los expertos enrutados con escaleras de escala por experto e int8 a las capas densas. La transcodificación a CMF reconstruye cada experto a bf16 a través del propio kernel de Escha (`PackedScaledExpertLinear`, sonda de identidad) y después aplica `cortiq convert --quant q2tp`, un perfil mixto que asigna 2 bits a `gate`/`up` de expertos enrutados y compartidos, y 4 bits a `down` y al esqueleto. El layout `q2tp` usa una rejilla simétrica de 4 niveles (±0,5, ±1,5)·s —óptima en RMS para pesos aproximadamente gaussianos— sobre la escalera de escala por fila de `q4tp`, con 8 bytes por grupo de 32 pesos; el nivel 0 de la escalera es un cero exacto para evitar que grupos podados reaparezcan como ruido. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy verificada contra CPU en contexto corto.
- Razonamiento multi-paso y conversación multi-turno (capacidad heredada del modelo base Qwen3.6; no se detalla en la información disponible).
- Generación de código y matemáticas (capacidad del modelo base, no verificada con benchmarks en esta ficha).
- Servidor compatible con la API de OpenAI mediante `cortiq serve`, con aceptación de contenido en formato block-array estilo Cline/Roo.
- Ejecución en CUDA, Vulkan, Metal (wgpu) y CPU desde el mismo archivo de bytes.
- Carga dinámica de expertos: distribución automática de capas entre GPU y host según la VRAM disponible, sin flags de configuración.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 24 GB: el archivo de 12,87 GB cabe completo en una RTX A5000 o RTX 4090, con 145-147 tok/s de decodificación en CUDA, suficiente para asistentes interactivos de código en local sin depender de servicios en la nube.
- Inferencia en hardware de gama baja: con carga dinámica de expertos, el modelo funciona con 4 GB de VRAM a 20,5 tok/s (8 de 40 capas en GPU) y con 8 GB a 32,3 tok/s, lo que permite desplegarlo en portátiles con GPU modesta o en instancias cloud económicas.
- Servicio de API compatible con OpenAI: `cortiq serve` expone el modelo como endpoint HTTP que acepta el formato de contenido block-array de clientes como Cline o Roo, lo que facilita integrarlo en herramientas de desarrollo asistido sin adaptadores adicionales.
- Procesamiento por lotes en CPU: con 15,6 tok/s en 48 núcleos, es viable para tareas de generación no interactivas (resumen, clasificación, extracción) en servidores sin GPU, manteniendo la misma perplejidad que en GPU.
- Sustitución de modelos de 4 bits en pipelines existentes: al ejecutarse en el mismo motor que el Qwen3.6-35B-A3B de 4 bits (99,6 tok/s), permite comparar calidad y velocidad sin cambiar la infraestructura de despliegue.
- Despliegue en Apple Silicon: con Metal (wgpu) alcanza 13,3 tok/s en un M4 de 24 GB, adecuado para prototipado y desarrollo local en macOS con un único binario.
- Evaluación de cuantización extrema: sirve como referencia para estudiar el impacto de 2 bits en expertos MoE, dado que la perplejidad se mantiene idéntica en todas las configuraciones de VRAM (4,971 sobre el texto de referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia y perplejidad:

| Métrica | Hardware | Resultado |
|---|---|---|
| Decodificación CUDA | RTX A5000 (24 GB) | 145,5–147,2 tok/s |
| Prefill 4096 tokens | RTX A5000 (24 GB) | 2287 tok/s; primer token 1,8 s |
| Decodificación CUDA tras prompt de 4096 | RTX A5000 (24 GB) | 138,0 tok/s |
| Decodificación Vulkan | RTX PRO 6000 Blackwell | 136,2 tok/s |
| Decodificación Vulkan tras prompt de 4096 | RTX PRO 6000 Blackwell | 93,7–97,7 tok/s; prefill 177 tok/s, primer token 23,1 s |
| Decodificación Metal (wgpu) | Apple M4, 24 GB | 13,3 tok/s |
| Decodificación CPU (8 hilos) | Apple M4 | 7,3 tok/s |
| Decodificación CPU (48 núcleos) | Referencia CPU | 15,6 tok/s |
| Perplejidad | Todas las configuraciones | 4,971 (idéntica en cada nivel de VRAM) |

Rendimiento por VRAM en RTX PRO 6000 con presupuesto limitado:

| VRAM | 4 GB | 6 GB | 8 GB | 12 GB | 16 GB+ |
|---|---|---|---|---|---|
| tok/s | 20,5 | 24,5 | 32,3 | 88,3 | 136,2 (grafo completo) |
| Capas en GPU | 8/40 | 16/40 | 23/40 | 37/40 | todas |

## Requisitos de hardware

- VRAM mínima: 4 GB (8 de 40 capas en GPU, 20,5 tok/s); recomendable 12 GB o más para rendimiento interactivo.
- VRAM para grafo completo: 16 GB o más (136,2 tok/s en RTX PRO 6000).
- GPU recomendadas: RTX A5000 (24 GB) para CUDA, RTX PRO 6000 Blackwell para Vulkan, RTX 4090 como alternativa consumer de 24 GB. Cabe en cualquier GPU consumer con 12 GB o más; funciona con 4-8 GB con carga dinámica de expertos.
- Apple Silicon: M4 de 24 GB con Metal (wgpu) a 13,3 tok/s; 7,3 tok/s en CPU con 8 hilos.
- CPU: 15,6 tok/s con 48 núcleos como referencia.
- Opciones de despliegue: motor `cortiq` 0.5.43+ (obligatorio, el layout `q2tp` no es legible por versiones anteriores); `cargo install cortiq-cli` o `cargo install cortiq-cli --features cuda` para el backend CUDA (requiere driver NVIDIA y bibliotecas CUDA 12.x); `cortiq run` para inferencia local y `cortiq serve` para servidor compatible con OpenAI.
- Latencia: primer token 1,8 s con prompt de 4096 tokens en CUDA; 23,1 s en Vulkan sobre la misma tarjeta.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: el formato CMF y el layout `q2tp` son específicos de `cortiq`.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Decodificación | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Escha-W2cmf (este) | 35B MoE | 2 bits expertos / 4 bits esqueleto | no disponible | 145,5–147,2 tok/s (RTX A5000) | Apache-2.0 | cortiq |
| Qwen3.6-35B-A3B (4 bits, mismo motor) | 35B MoE | 4 bits | no disponible | 99,6 tok/s | Apache-2.0 | cortiq |
| Qwen3.6-27B denso (mismo motor) | 27B denso | no disponible | no disponible | 39,1 tok/s | Apache-2.0 | cortiq |
| EschaLabs/Qwen3.6-35B-A3B-Escha-W2 | 35B MoE | 2 bits expertos (códec eschamoe) | no disponible | no disponible | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- La cuantización a 2 bits de los expertos puede degradar la calidad en tareas sensibles; la perplejidad de 4,971 es el único dato de calidad publicado y no se compara con el modelo en bf16.
- La decodificación en GPU puede elegir continuaciones distintas pero coherentes en empates de probabilidad (ordenamiento de coma flotante), comportamiento habitual en cualquier offload a GPU.
- El layout `q2tp` exige `cortiq` 0.5.43 o superior; versiones anteriores no pueden leer el archivo.
- No es compatible con el ecosistema estándar de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que limita la portabilidad y las herramientas de observabilidad disponibles.
- No se documentan los idiomas soportados ni la longitud de contexto, datos críticos para planificar despliegues multilingües o de contexto largo.
- No se especifican sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción; el trabajo de cuantización original es de Escha Labs y este repositorio no reclama mejoras de calidad sobre él.
- El rendimiento en Vulkan muestra una latencia de primer token de 23,1 s con prompts de 4096 tokens, muy superior a CUDA (1,8 s), lo que desaconseja Vulkan para cargas interactivas con contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.6-35B-A3B-Escha-W2cmf
- Modelo base cuantizado: https://huggingface.co/EschaLabs/Qwen3.6-35B-A3B-Escha-W2
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor cortiq y contenedor CMF: https://github.com/infosave2007/cmf
