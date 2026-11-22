# duckpage/inkling-2-mini-mls4

## Resumen

Inkling-2-Mini MLS4 es una conversión del modelo multimodal `thinkingmachines/Inkling-2-Mini` al formato MLS4 del motor de inferencia Malleus, desarrollado por duckpage. Se trata de una cuantización a 4 bits (group size 128) con rotación Hadamard aleatorizada, empaquetada en un contenedor GGUF v3 con extensión `.malleus`, diseñada específicamente para APUs AMD RDNA 3.5 (gfx1150 / gfx1151). El objetivo es permitir la ejecución de un modelo MoE con torre de visión en hardware integrado AMD, con una única copia de pesos de 15,3 GB que sirve tanto para prefill como para decodificación (W4A8).

El modelo base es un transformer con arquitectura "looped": 24 capas físicas de las cuales las 12 centrales (índices 6 a 18) se ejecutan tres veces, de modo que cada token consume 48 visitas de capa. Incorpora 128 expertos con 8 activos por token, una convolución corta de kernel 4 en la entrada y salida de cada capa, sesgo de posición relativa sobre las últimas 1024 posiciones y una cabeza de 8 bits sobre un vocabulario de 201 024 tokens. Incluye además una torre de visión ViT de 23 capas con merger de dos capas (0,64 GB) y una cabeza draft MTP de 3 capas (0,27 GB).

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cuantización extrema orientada a hardware de consumo AMD; por otro, expone con transparencia las limitaciones actuales del motor Malleus, que todavía no ejecuta la torre de visión ni la decodificación especulativa MTP, pese a que los pesos están presentes en el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (24 capas físicas, 12 centrales ejecutadas 3 veces = 48 visitas por token), MoE con 128 expertos y 8 activos |
| Parametros totales | no disponible (pesos en 4 bits: 15,3 GB en disco) |
| Parametros activos | 8 de 128 expertos por token (fracción no cuantificada en la información disponible) |
| Longitud de contexto | 32 768 tokens medidos (prefill sin chunking; no se ha ejecutado más allá) |
| Tipos de cuantizacion | MLS4: 4 bits, group size 128, rotación Hadamard aleatorizada, W4A8 (misma copia para prefill y decode) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.malleus` (contenedor GGUF v3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con reciclaje de capas: 24 capas físicas en las que el bloque central (capas 6 a 18) se recorre tres veces, resultando en 48 visitas de capa por token. Emplea atención con residuales sobre una pila de bloques en ejecución, una convolución corta de kernel 4 aplicada a la entrada y salida de cada capa, y un sesgo de posición relativa limitado a las últimas 1024 posiciones. La capa MoE contiene 128 expertos con 8 activos por token, y la cabeza de salida opera en 8 bits sobre un vocabulario de 201 024 tokens. El componente multimodal es una torre ViT de 23 capas con un merger de dos capas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original dentro de la información proporcionada. La conversión a MLS4 no altera la arquitectura ni los datos de entrenamiento: solo cambia el formato de almacenamiento y la precisión de los pesos, aplicando cuantización de 4 bits con group size 128 y rotación Hadamard aleatorizada para reducir el error de cuantización. El archivo incluye además una cabeza draft MTP de 3 capas con corrección de Markov, pensada para decodificación especulativa, aunque el motor aún no la utiliza.

## Capacidades

- Generación de texto y razonamiento: validado contra el checkpoint bf16 con `malleus golden` (coincidencia en el último token de los 20 prompts de referencia) y `malleus eval` (top-1 del 89,95 % y perplejidad +12,07 % frente a bf16 sobre 8 documentos).
- Procesamiento de imágenes: la torre ViT y el merger están incluidos y cargados en el archivo, pero el motor Malleus todavía no los ejecuta; las peticiones de imagen se rechazan con el error `model has no vision tower`.
- Decodificación especulativa: la cabeza MTP de 3 capas está presente pero no conectada al pipeline de inferencia.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en APUs AMD RDNA 3.5: el formato MLS4 está optimizado para gfx1150 y gfx1151, de modo que un equipo con Radeon 890M puede servir el modelo con `malleus serve --ctx 32768` sin GPU dedicada, con un consumo de pesos de 15,3 GB.
- Procesamiento de documentos largos en local: con 32K tokens de contexto medidos y un prefill de 105 tok/s a 32 768 tokens, resulta adecuado para resumir o extraer información de contratos, informes o expedientes que no pueden salir a la nube.
- Asistentes de código en estación de trabajo: el modelo base es de propósito general y el motor expone una API de servidor; puede integrarse en editores o CLIs locales para autocompletado y explicación de código, siempre que se acepte la latencia de decode de 9-16 tok/s.
- Prototipado de pipelines multimodales: aunque la visión no está operativa en Malleus, el archivo contiene la torre ViT, por lo que sirve como banco de pruebas para el desarrollo del soporte de imagen en el motor.
- Evaluación de cuantización: los comandos `malleus golden` y `malleus eval` contra tensores de referencia públicos (`duckpage/malleus-golden`) permiten validar la fidelidad de la cuantización 4-bit sin descargar los 40 GB del checkpoint bf16.
- Despliegue en contenedor: el `Containerfile` del repositorio de Malleus permite construir una imagen de runtime con Podman y ejecutar el servidor en un entorno reproducible, útil para laboratorios con hardware AMD heterogéneo.
- Investigación sobre arquitecturas looped y MoE: al ser una conversión fiel del modelo base, permite estudiar el comportamiento de transformers con reciclaje de capas y 128 expertos en hardware de gama integrada.

## Benchmarks y rendimiento

Rendimiento medido por el autor en gfx1150 (Radeon 890M) con `malleus bench`, solo texto:

| Profundidad de prompt (tokens) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 512 | 305 | 16,6 |
| 2 048 | 213 | 15,5 |
| 8 192 | 179 | 14,1 |
| 32 768 | 105 | ~9 |

Calidad frente al checkpoint bf16 (conjunto de evaluación de Malleus):

| Metrica | Resultado |
|---|---|
| Top-1 (`malleus eval`, 8 documentos) | 89,95 % |
| Perplejidad relativa a bf16 | +12,07 % |
| Coincidencia último token (`malleus golden`, 20 prompts) | 20/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 14,41 GB de pesos de texto + 0,64 GB de torre de visión + 0,27 GB de cabeza MTP = 15,3 GB en disco; además, 393 KiB de estado de sesión por token (48 slots KV de 8 cabezas KV × 128, fp32), lo que supone 12,9 GiB con un prompt de 32K.
- GPU objetivo: APUs AMD RDNA 3.5, concretamente gfx1150 (Radeon 890M) y gfx1151. No se documenta soporte para otras arquitecturas en la información disponible.
- Cabe en GPU de consumo: sí, en APUs AMD con memoria unificada suficiente; no se documenta compatibilidad con RTX 4090, A100 ni H100.
- Opciones de despliegue: motor Malleus (`malleus serve`), con imagen de contenedor construida vía Podman desde el `Containerfile` del repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 305 tok/s a 512 tokens y 105 tok/s a 32 768; decode de 16,6 tok/s a 512 tokens y ~9 tok/s a 32 768, medidos en Radeon 890M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Inkling-2-Mini MLS4 (esta ficha) | no disponible (15,3 GB en 4 bits) | 32K medidos | `.malleus` (GGUF v3), 4 bits W4A8 | Apache-2.0 | AMD RDNA 3.5 (gfx1150/gfx1151) |
| thinkingmachines/Inkling-2-Mini (bf16) | no disponible (~40 GB en bf16) | no disponible | safetensors bf16 | Apache-2.0 | GPU con ~40 GB de VRAM |
| duckpage/malleus-golden | no aplica (tensores de referencia) | no aplica | tensores de referencia | no disponible | no aplica |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (MoE multimodal con reciclaje de capas) ni de sus cifras de rendimiento.

## Limitaciones y advertencias

- La torre de visión está incluida en el archivo pero no conectada: cualquier petición de imagen se rechaza con `model has no vision tower`. La calidad en visión no se ha medido frente a bf16.
- La cabeza MTP no se usa para decodificación especulativa, por lo que el rendimiento de decode no se beneficia de ella.
- El prefill se ejecuta en un único forward sobre todo el prompt, sin chunking; los prompts deben caber en el estado de sesión configurado. Solo se ha validado hasta 32K tokens.
- La perplejidad aumenta un 12,07 % respecto a bf16, lo que puede afectar a tareas sensibles a la fidelidad token a token.
- El formato `.malleus` solo es legible por el motor Malleus; no es portable a llama.cpp, vLLM ni otras herramientas estándar.
- El soporte de hardware se limita a APUs AMD RDNA 3.5 documentadas (gfx1150/gfx1151); no hay garantías en otras GPUs.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento multilingüe del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Licencia Apache-2.0 permite uso comercial, pero los derechos de autor del modelo original permanecen con sus autores (Thinking Machines); la conversión solo cambia formato y precisión.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado el 21 de noviembre de 2026; se trata de una conversión reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckpage/inkling-2-mini-mls4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor Malleus: https://github.com/duckpage/malleus
- Curvas de rendimiento y método: https://github.com/duckpage/malleus/blob/main/MODELS.md
- Tensores de referencia para evaluación: https://huggingface.co/datasets/duckpage/malleus-golden
- Containerfile de despliegue: https://raw.githubusercontent.com/duckpage/malleus/main/deploy/Containerfile
