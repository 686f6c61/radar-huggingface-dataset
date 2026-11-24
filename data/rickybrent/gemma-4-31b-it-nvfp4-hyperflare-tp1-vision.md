# rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-Vision

## Resumen

Gemma 4 31B IT NVFP4 HYPERFLARE es un paquete de despliegue preparado para servir el checkpoint `nvidia/Gemma-4-31B-IT-NVFP4` (cuantización NVFP4 de `google/gemma-4-31B-it` realizada con ModelOpt) sobre una única GPU RTX PRO 6000 Blackwell (GB202, SM120, 96 GB) con paralelismo tensorial TP1. Lo publica el usuario `rickybrent` como empaquetado, validación y publicación de trabajo upstream de NVIDIA y Google, no como autoría del modelo base.

El interés del paquete no está en el modelo en sí, sino en la pila de runtime que incorpora: un frontend de imagen nativo de Gemma 4 (parches 16x16, fusión 3x3, torre de visión de 27 bloques en BF16), un esquema de KV circular con ventana deslizante de 1024 tokens en FP8 para las 50 capas deslizantes, y decodificación split-KV de 512 dimensiones para las 10 capas de atención completa. Con ello eleva el pool de KV de unos 147K tokens NVFP4 a 1.542.144 tokens y habilita un contexto por petición de 262.144 tokens en una sola tarjeta de 96 GB.

Es relevante ahora porque es un paquete de vista previa: el ejecutable incluido (`runner/flare-linux-x86_64`) es imprescindible, ya que las builds publicadas de Flare no contienen ni el frontend de imagen de Gemma 4 ni el layout de KV circular. Hasta que se fusionen los pull requests correspondientes, este paquete es la única vía práctica de servir visión y contexto largo de Gemma 4 31B en formato NVFP4 sobre Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con 50 capas de atención deslizante y 10 capas de atención completa; torre de visión de 27 bloques BF16 |
| Parametros totales | 31B (según denominación del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por petición; pool KV de 1.542.144 tokens |
| Tipos de cuantizacion | NVFP4 (MLP en NVFP4 vía ModelOpt; atención y visión en BF16); KV deslizante en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (metadatos del repo); la model card declara `license: other` con `license_name: apache-license-2.0` y enlace a la licencia de Gemma de Google |
| Formato de pesos | Pesos NVFP4 empaquetados para el runtime Flare; payload en la revisión `gb202` (~31,3 GiB de pesos; paquete ~32 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B IT, un transformer decoder-only con atención híbrida: 50 capas con ventana deslizante de 1024 tokens y 10 capas de atención completa. La cuantización NVFP4 de NVIDIA aplica formato de 4 bits solo a las capas MLP, manteniendo atención y torre de visión en BF16, lo que preserva precisión en los componentes sensibles. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación técnica del paquete reside en el runtime. Las capas deslizantes almacenan una ventana circular fija de 1024 tokens en FP8 dentro de cada fila de continuación, en lugar de historial completo, lo que multiplica la capacidad del pool KV. Las capas de atención completa usan decodificación split-KV en Triton con dimensión 512 y una ruta de verificación, evitando dos llamadas de atención con padding. Se añade decodificación especulativa MTP con anchos de 1 a 6 y verificación adaptativa, 62 grafos CUDA capturados, chunk de prefill de 4096 tokens y concurrencia de 4 peticiones de texto y 2 de imagen preparadas simultáneamente. La carga en frío tarda 3,4 s en pesos y el servidor está operativo en unos 5 s.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens por petición.
- Comprensión de imágenes: hasta 4 imágenes por petición, con preprocesado nativo de parches 16x16, fusión 3x3, posiciones `[x, y]` y tokens de imagen atómicos.
- Razonamiento visual básico: identificación de formas, colores y disposición espacial (círculo rojo, cuadrado azul, triángulo verde, rombo amarillo).
- Recuperación de información en contexto largo (needle retrieval) verificado a 42.828 y 128.367 tokens.
- Reutilización de prefijo en caché (prefix caching) con restauración tras wraparound de más de 2.500 tokens.
- Decodificación especulativa MTP para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos con imágenes intercaladas: el modelo procesa hasta 4 imágenes por petición junto con prefijos de texto largos (verificado con un prefijo de 2.132 tokens más imagen en 0,34 s), lo que permite extraer datos de capturas, diagramas o formularios dentro de un mismo contexto.
- Asistencia sobre bases de código o documentación extensa: con 262.144 tokens por petición y un pool KV de 1,54M tokens, cabe un repositorio mediano o un corpus de documentación completo sin trocear, manteniendo coherencia entre turnos.
- Inspección visual automatizada en pipelines: la latencia de primera respuesta a una imagen es de 0,19 s y de 0,47 s con cuatro imágenes, adecuada para clasificación y descripción de imágenes en lotes con dos peticiones de imagen concurrentes.
- Chat multi-turno con memoria de sesión: la reutilización de prefijo en caché (2.286 tokens cacheados en la prueba multi-turno) reduce el coste de repetir el historial en cada turno, útil en asistentes de atención al cliente con conversaciones largas.
- Recuperación aumentada sobre corpus largos: la recuperación de aguja verificada a 128.367 tokens permite usar el modelo como lector de documentos completos en lugar de fragmentos, reduciendo pérdidas de contexto en preguntas que dependen de secciones distantes.
- Procesamiento por lotes en una sola GPU: con 4 peticiones de texto concurrentes y un throughput agregado de 167,1 tok/s a 0K y 125,2 tok/s a 128K, un único servidor RTX PRO 6000 puede cubrir cargas de inferencia de un equipo pequeño sin clúster.
- Evaluación y prototipado de visión-lenguaje en Blackwell: al ser un paquete firmado y validado con 7/7 comprobaciones de imagen, sirve como banco de pruebas reproducible para comparar recetas de cuantización NVFP4 frente a BF16.

## Benchmarks y rendimiento

Rendimiento de prefill medido en un RTX PRO 6000 Blackwell (96 GB, SM120), TP1, ajustes por defecto:

| Prefill | 8K | 16K | 32K | 64K | 128K |
|---|---:|---:|---:|---:|---:|
| tok/s | 5.935 | 5.113 | 4.155 | 3.054 | 1.980 |

Throughput de decodificación agregado (tok/s) según concurrencia y longitud de contexto:

| Decode agregado | C1 | C2 | C4 |
|---|---:|---:|---:|
| 0K | 44,0 | 86,2 | 167,1 |
| 16K | 43,0 | 83,5 | 159,2 |
| 32K | 42,2 | 81,5 | 153,7 |
| 64K | 40,8 | 78,6 | 143,3 |
| 128K | 38,2 | 72,8 | 125,2 |

Comprobaciones de imagen sobre el paquete firmado (primer token a respuesta, `temperature=0`):

| Prueba | Tiempo | Resultado |
|---|---:|---|
| Imagen única (círculo rojo + cuadrado azul) | 0,19 s | `There is a red circle and a blue square.` |
| Prefijo de 2.132 tokens + imagen | 0,34 s | `The image shows a red circle.` (`cached_tokens=2125`, `image=256`) |
| Multi-turno con prefijo cacheado + imagen en turno 2 | 0,32 s | `(1) QUARTZ-941\n(2) A green triangle` (`cached_tokens=2286`) |
| Dos imágenes | 0,35 s | círculo rojo y cuadrado azul distinguidos |
| Cuatro imágenes | 0,47 s | `1. Red circle\n2. Blue square\n3. Green triangle\n4. Yellow diamond` |
| Solo texto | 0,16 s | `Hello! How can I help you today?` |
| Dos peticiones de imagen simultáneas | 0,33 s wall | círculo rojo / triángulo verde, sin contaminación cruzada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: una RTX PRO 6000 Blackwell (GB202, SM120) con 96 GB de VRAM; el paquete está preparado para TP1 y no se documenta despliegue multi-GPU.
- VRAM: 32,98 GiB de pesos cargados por GPU más un presupuesto de caché de 60,84 GiB, lo que suma aproximadamente 94 GiB y exige la tarjeta de 96 GB al completo.
- No cabe en GPU de consumo: ni RTX 4090 (24 GB) ni RTX 5090 (32 GB) disponen de memoria suficiente para pesos más caché KV.
- Despliegue: exclusivamente mediante el runtime Flare/Hyperflare incluido (`runner/flare-linux-x86_64`, SHA-256 `390b0768baace416ac443c8be70305ce2196ccbcd93bebefa060858ff84da41e`); las builds publicadas de Flare no sirven este paquete. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Carga en frío: 3,4 s para los pesos y servidor operativo en unos 5 s.
- Throughput: 167,1 tok/s agregados con 4 peticiones concurrentes a contexto corto; 1.980 tok/s de prefill a 128K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B IT NVFP4 HYPERFLARE (este paquete) | 31B | 262.144 tokens | NVFP4 (MLP) + BF16 (atención/visión) | Apache 2.0 según metadatos; la model card usa `other` con `apache-license-2.0` | Paquete de vista previa con runner propio |
| `nvidia/Gemma-4-31B-IT-NVFP4` (base) | 31B | no disponible | NVFP4 (ModelOpt) | no disponible | Checkpoint estándar en Hugging Face |
| `google/gemma-4-31B-it` (original) | 31B | no disponible | BF16 | Gemma (términos de Google) | Modelo oficial |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los checkpoints base y original en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Paquete de vista previa: depende de cambios no fusionados (frontend de imagen, KV circular, decodificación ancha) y del ejecutable incluido; no funcionará con builds publicadas de Flare hasta que se integren los pull requests.
- Hardware muy específico: requiere una RTX PRO 6000 Blackwell de 96 GB; no hay ruta documentada para otras GPU ni para despliegue multi-GPU.
- Concurrencia limitada: 4 peticiones de texto y 2 de imagen preparadas; cargas mayores requerirán varias instancias.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Riesgo de alucinación y sesgos del modelo base: no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- Ambigüedad de licencia: los metadatos del repo indican Apache 2.0, pero la model card usa `license: other` con `license_name: apache-license-2.0` y enlace a los términos de Gemma de Google; conviene verificar los términos aplicables antes de uso comercial.
- Trazabilidad: el autor declara explícitamente que no reclama autoría del modelo, runtime, recetas ni kernels; la validación se limita a 7 comprobaciones de imagen, pruebas de contexto largo y tests unitarios/CUDA del stack de PR.
- Sin datos de benchmarks estándar publicados, la comparación con alternativas se limita a métricas de serving del propio paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-Vision
- Checkpoint base: https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Runtime Hyperflare: https://github.com/NVIDIA/hyperflare-inference
- Fork con la rama `gemma4-combined`: https://github.com/rickybrent/hyperflare-inference
- Licencia de Gemma: https://ai.google.dev/gemma/apache_2
