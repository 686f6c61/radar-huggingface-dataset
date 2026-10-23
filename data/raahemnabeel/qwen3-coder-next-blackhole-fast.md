# raahemnabeel/qwen3-coder-next-blackhole-fast

## Resumen

`raahemnabeel/qwen3-coder-next-blackhole-fast` es un paquete de despliegue (bundle) publicado por el usuario raahemnabeel que empaqueta los pesos de Qwen3-Coder-Next para ejecutarse sobre aceleradores Tenstorrent Blackhole mediante vLLM y el plugin de Tenstorrent. No se trata de un modelo entrenado desde cero ni de un fine-tune con datos nuevos: el checkpoint es el de `Qwen/Qwen3-Coder-Next`, y lo que cambia es la receta de servicio, con un paso de decodificación reconstruido a base de kernels fusionados (router, MoE y frontera de residual replicado). El objetivo es servir un MoE de 80 000 millones de parámetros totales y 3000 millones activos con 262 144 tokens de contexto sobre hardware no-NVIDIA.

La arquitectura heredada del modelo base es un transformer híbrido de 48 capas que combina Gated DeltaNet (atención lineal) con atención con compuertas, y una capa MoE de 512 expertos con top-10 más un experto compartido. El bundle mantiene los mismos pesos, perfiles y receta de servicio que `raahemnabeel/qwen3-coder-next`, y solo modifica el decode; el prefill queda intacto. Está pensado para 1 a 32 usuarios concurrentes y admite cuatro perfiles de hardware: p300x2 (por defecto), p150x4, p300 y p150x2.

Su relevancia es acotada pero específica: demuestra que un modelo de código de 80B-A3B puede servirse con una API compatible con OpenAI sobre cuatro dies de Blackhole, con 32 secuencias simultáneas y 262 144 tokens de ventana. Los compromisos son explícitos: los pesos de los expertos se almacenan redondeados a 5 bits significativos y el checkpoint no incluye torre de visión ni cabeza MTP. El modelo no tiene modo de razonamiento (no emite bloque de pensamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE: 48 capas de Gated DeltaNet + atención con compuertas; 512 expertos, top-10 + experto compartido |
| Parámetros totales | 80 000 millones (heredado de Qwen/Qwen3-Coder-Next) |
| Parámetros activos | 3000 millones por token |
| Longitud de contexto | 262 144 tokens (todos los perfiles) |
| Tipos de cuantización | No se distribuyen GGUF/AWQ/GPTQ. Precisión fijada por perfil: expertos enrutados y compartidos redondeados a 5 bits significativos (lectura de la matmul LoFi), activaciones y pesos de routing a 7 bits; en perfiles de 2 dies (p300, p150x2) los expertos enrutados van en bfp4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible. El repositorio ocupa 2,0 GB y no contiene los pesos: `tt serve` descarga `Qwen/Qwen3-Coder-Next` en el commit `a7fbcb5c0e12d62a448eaa0e260346bf5dcc0feb` en la caché de HuggingFace. Empaquetado con tt-model-manager 0.1.0 (manifest schema 5.1) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso de 48 capas que intercala capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, con capas de atención con compuertas. La capa de mezcla de expertos usa 512 expertos enrutados con top-10 por token más un experto compartido siempre activo, lo que da 3000 millones de parámetros activos sobre 80 000 millones totales. Esa dispersión es lo que hace viable el despliegue: solo se leen las columnas de peso de los expertos seleccionados.

Sobre el entrenamiento no hay información en la documentación proporcionada: se desconoce el volumen de tokens, la composición del dataset y si hubo RLHF, DPO u otras etapas de alineación. Lo que sí está documentado es la reescritura del paso de decodificación, portada desde la fusión de `raahemnabeel/ornith-1.5-35b-a3b-blackhole-fast`, con tres cambios: (1) el router de decode se ejecuta como una única matmul 1D, con el top-10 de 1 token, softmax y sigmoide de compuerta compartida en los núcleos RISC en una sola operación, sustituyendo la cadena top-k → slice → softmax → untilize; (2) el decode MoE fusiona expertos enrutados y compartidos en tres operaciones (route, gate|up + SwiGLU, down) que leen los pesos de cada experto en su sitio desde el layout de DRAM existente, sin copia duplicada, para anchos de 1 a 32 filas (los expertos de varios usuarios se tratan como una unión sobre los 512 expertos, con cada columna de peso leída una sola vez para todas las filas); (3) la frontera de residual de decode queda replicada en cada die, de modo que cada salida de mixer o MoE es un all-reduce + add + RMSNorm local: dos colectivos por capa en lugar de cuatro, sin gathers.

El ajuste numérico es parte del diseño: los pesos de expertos enrutados y compartidos se almacenan a 5 bits significativos y las activaciones y pesos de routing a 7 bits, que es lo que leen los operandos de la matmul. El autor verifica la calidad resultante con evaluación comparada (ver sección de benchmarks). El checkpoint no incluye cabeza MTP ni torre de visión.

## Capacidades

- Generación de texto y de código en modo completion y chat a través de una API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) en el puerto 20000 o el primero libre.
- Tool calling activado por defecto: parser `qwen3_coder` y `--enable-auto-tool-choice`; una petición con `tools` devuelve `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso como agente: el soporte de tool calling permite cadenas de llamadas a herramientas, aunque el modelo no tiene modo de pensamiento ni bloque de razonamiento explícito.
- Contexto largo de 262 144 tokens con prefill troceado (chunked prefill), de forma que un prompt largo no bloquea peticiones cortas.
- Servicio concurrente de hasta 32 secuencias por instancia en todos los perfiles.
- Capacidades de código evaluadas en HumanEval, MBPP y GSM8K (resultados en la sección de benchmarks); no hay datos publicados sobre otras tareas.
- No dispone de visión (sin torre de visión) ni de decodificación especulativa con MTP (sin cabeza MTP).
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Autocompletado y generación de código en IDE o editor: el modelo acepta peticiones de completion con hasta 262 144 tokens de contexto, lo que permite incluir varios ficheros del repositorio en el prompt sin truncar y mantener coherencia entre módulos.
- Agente de refactorización multiarchivo: con tool calling activado, el modelo puede emitir llamadas a herramientas de lectura/escritura de ficheros y de ejecución de tests, encadenando varios pasos dentro de una misma tarea sobre un contexto amplio.
- Generación de tests unitarios en CI: el endpoint compatible con OpenAI permite integrarlo como paso de un pipeline que, dado un diff, genere tests y los devuelva en formato estructurado mediante `tool_calls`.
- Revisión de código automatizada en pull requests: la ventana de 262 144 tokens admite el diff completo más los ficheros afectados, y el prefill troceado evita que una revisión larga bloquee otras peticiones del mismo servidor.
- Asistente técnico de atención al cliente sobre documentación de API: 32 secuencias concurrentes y contexto largo permiten mantener conversaciones multi-turno con la documentación relevante inyectada en cada turno.
- RAG sobre bases de código grandes: la combinación de contexto largo y despliegue en hardware Tenstorrent permite montar un servicio on-premise sin GPUs NVIDIA, útil cuando el código no puede salir de la infraestructura propia.
- Migración de código legacy: dado un módulo completo y las guías de destino en el prompt, el modelo puede reescribir el código y usar herramientas para validar la compilación en un bucle agéntico.
- Sustitución de backend en infraestructura ya existente: organizaciones con Blackhole en rack pueden servir un modelo de código de 80B-A3B manteniendo el mismo cliente OpenAI que usaban contra un endpoint CUDA.

## Benchmarks y rendimiento

Evaluación lado a lado de ambos bundles en la misma máquina (p300x2), a través de la API de chat servida, con lm-evaluation-harness 0.4.9, temperatura 0, conjuntos completos, 8 peticiones en vuelo y semilla 42:

| Evaluación | Bundle publicado (qwen3-coder-next) | blackhole-fast |
|---|---:|---:|
| HumanEval pass@1 (164) | 0,939 | 0,945 |
| MBPP pass@1 (500) | 0,826 | 0,820 |
| GSM8K exact match estricto (1319) | 0,954 | 0,955 |

No se han publicado en la información disponible resultados de MMLU, ni métricas de latencia o throughput (tokens/s), ni comparaciones con modelos de otros proveedores. Las cifras anteriores comparan dos recetas de servicio sobre los mismos pesos, no dos modelos distintos.

## Requisitos de hardware

- No es un modelo para GPU convencional: el bundle está empaquetado para aceleradores Tenstorrent Blackhole. No aplica VRAM; la memoria disponible por die no está documentada.
- Perfiles soportados: `p300x2` (por defecto, 2 placas p300, 4 dies, TP4), `p150x4` (4 placas p150, 4 dies, TP4, misma configuración), `p300` (1 placa p300, 2 dies, TP2) y `p150x2` (2 placas p150, 2 dies, TP2). Los perfiles `p150x4` y `p150x2` están construidos para la misma malla pero no han sido probados en hardware.
- Diferencia entre perfiles: los de 4 dies usan la política de precisión de 4 dies para expertos enrutados; los de 2 dies usan bfp4 en expertos enrutados porque la política de 4 dies no cabe en dos dies.
- Estimación aritmética de tamaño de pesos (a partir de 80 000 millones de parámetros, no publicada por el autor): unos 160 GB en bf16 y unos 80 GB en fp8. El bundle no incluye los pesos; se descargan aparte en la caché de HuggingFace.
- Despliegue: vLLM con el plugin de Tenstorrent, orquestado con `tt` (Tenstorrent CLI, `uv tool install tenstorrent`) o directamente con `tt-model`. El servicio expone una API compatible con OpenAI en `http://127.0.0.1:20000`.
- Arranque: el primer inicio compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Concurrencia y latencia: 32 secuencias concurrentes y prefill troceado en todos los perfiles. No hay datos publicados de latencia por token ni de throughput agregado.
- Alternativas de despliegue en GPU (llama.cpp, Ollama, TGI): no disponibles para este bundle, que depende del plugin de Tenstorrent.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware | Licencia | Estado |
|---|---|---|---|---|---|
| `raahemnabeel/qwen3-coder-next-blackhole-fast` | 80B totales / 3B activos | 262 144 | Tenstorrent p300x2, p150x4, p300, p150x2 | no disponible | Publicado; 0 descargas, 0 likes; decode fusionado |
| `raahemnabeel/qwen3-coder-next` | 80B totales / 3B activos (mismos pesos) | 262 144 | Tenstorrent Blackhole | no disponible | Bundle de referencia; decode sin fusionar; HumanEval 0,939 / MBPP 0,826 / GSM8K 0,954 |
| `raahemnabeel/ornith-1.5-35b-a3b-blackhole-fast` | ~35B totales / 3B activos (según el nombre) | no disponible | Tenstorrent Blackhole | no disponible | Origen de la fusión de decode portada a este bundle |
| `Qwen/Qwen3-Coder-Next` | 80B totales / 3B activos | no disponible en esta ficha | GPU (no especificado) | no disponible | Modelo base; pesos en el commit `a7fbcb5c0e12d62a448eaa0e260346bf5dcc0feb` |

La comparación relevante es interna al ecosistema Tenstorrent: `blackhole-fast` mejora HumanEval (+0,006) y GSM8K (+0,001) y empeora ligeramente MBPP (-0,006) respecto al bundle publicado, con el mismo checkpoint. No hay datos en la información proporcionada para comparar contra alternativas de otros fabricantes.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. La licencia del modelo base tampoco se detalla en la documentación proporcionada, por lo que hay que verificarla antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no hay confirmación de cobertura multilingüe ni de calidad fuera del inglés.
- Precisión reducida por diseño: los pesos de expertos se almacenan a 5 bits significativos y las activaciones a 7 bits; es una pérdida de precisión deliberada que la evaluación de tres benchmarks de código y matemáticas considera aceptable, pero no se han publicado evaluaciones en otras tareas.
- Sin modo de razonamiento: el modelo no emite bloque de pensamiento, lo que limita su uso en tareas que dependan de cadena de pensamiento explícita.
- Sin visión ni cabeza MTP: no admite entrada de imágenes ni decodificación especulativa.
- Perfiles no probados: `p150x4` y `p150x2` están construidos para mallas equivalentes pero no se han validado en hardware real; solo `p300x2` tiene resultados publicados.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad; como modelo de código, puede generar APIs, firmas o dependencias inexistentes.
- Sesgos: no se ha publicado ningún análisis de sesgo en la información disponible.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo día (23 de octubre de 2026), sin historial de uso. No hay garantía de mantenimiento.
- Dependencia de un stack concreto: requiere el plugin de Tenstorrent, la CLI `tt` y Docker; no hay ruta soportada a llama.cpp, Ollama o TGI.
- Primer arranque lento por compilación de kernels, lo que complica el escalado elástico y los arranques en frío.
- Los pesos no viajan en el repositorio (2,0 GB): el despliegue depende de descargar el checkpoint del modelo base en un commit concreto, lo que añade una dependencia externa y un paso de red en el arranque.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/raahemnabeel/qwen3-coder-next-blackhole-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Bundle de referencia sin fusión: https://huggingface.co/raahemnabeel/qwen3-coder-next
- Bundle origen de la fusión de decode: https://huggingface.co/raahemnabeel/ornith-1.5-35b-a3b-blackhole-fast
- tt-model-manager (empaquetado, versión 0.1.0): https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI, requisitos previos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor o el stack de Tenstorrent; los resultados obtenidos eran ajenos al contenido y se han descartado. No se dispone por tanto de papers, blogs ni demos adicionales que enlazar.
