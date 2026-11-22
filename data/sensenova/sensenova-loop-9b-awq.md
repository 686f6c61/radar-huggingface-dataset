# sensenova/SenseNova-Loop-9B-AWQ

## Resumen

SenseNova-Loop-9B-AWQ es la versión cuantizada a 4 bits (AWQ) del modelo multimodal SenseNova-Loop-9B, desarrollado por SenseNova (OpenSenseNova). El modelo resuelve el problema de aumentar la profundidad computacional sin incrementar proporcionalmente el número de parámetros: mediante una arquitectura de transformer con bloques recurrentes (looped transformer) reutiliza los pesos de 24 capas decodificadoras ejecutándolas dos veces, de modo que 32 capas físicas producen 56 ejecuciones de capa por pase forward. Incorpora además conexiones hiperbólicas restringidas a una variedad (mHC, manifold-constrained hyper-connections) de doble flujo y atención híbrida que alterna atención lineal y atención completa en un patrón de cuatro capas.

Con aproximadamente 9.412 millones de parámetros totales (9B), acepta texto e imágenes y genera texto, con un contexto de entrenamiento extendido hasta 512K tokens. La versión AWQ está pensada para despliegue de bajo consumo de memoria: según el autor, la inferencia multimodal con pesos de 4 bits y caché KV de 8 bits a 256K de contexto requiere aproximadamente 15 GiB de VRAM. Es relevante ahora porque ofrece una alternativa compacta y de licencia Apache 2.0 para tareas agénticas, de código y análisis de datos, con resultados competitivos frente a modelos notablemente mayores como Qwen3.8-27B en evaluaciones como NL2Repo y AIDABench.

La ficha se centra en la variante AWQ de 4 bits; los detalles de entrenamiento y benchmarks provienen de la model card del autor y no se han verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques recurrentes (looped transformer), mHC de doble flujo y atención híbrida (lineal + completa en patrón de 4 capas) |
| Parametros totales | 9.412.963.952 (≈9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado hasta 512K tokens; inferencia multimodal a 256K con ~15 GiB de VRAM (4-bit pesos + KV cache 8-bit) |
| Tipos de cuantizacion | AWQ 4 bits (esta variante); existe también versión GGUF oficial |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere código propio del modelo); disponible también GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con un bloque intermedio compartido y ejecutado en bucle: 24 capas decodificadoras se ejecutan dos veces en secuencia, de forma que 32 capas físicas distintas generan 56 ejecuciones de capa por pase forward. Sobre ese bloque recurrente se aplican conexiones hiperbólicas restringidas a una variedad (mHC) de doble flujo, que aprenden a enrutar y combinar información entre dos flujos residuales. El decodificador intercala atención lineal y atención completa en un patrón repetido de cuatro capas, lo que reduce el coste de la atención en contextos largos.

El entrenamiento es multimodal y de contexto largo: la receta incluye texto, imágenes, código y trayectorias de uso de herramientas, con la longitud de contexto extendida hasta 512K tokens. La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles. La innovación principal es la reutilización de pesos para ampliar la profundidad de cómputo con un presupuesto de parámetros compacto, junto con la cuantización AWQ oficial publicada el mismo día del lanzamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado a tareas complejas de razonamiento, código y uso de herramientas.
- Comprensión de imágenes y texto (pipeline image-text-to-text): acepta entradas multimodales y genera texto.
- Generación de código y tareas de desarrollo: la model card cita evaluación en NL2Repo (generación de repositorios a partir de lenguaje natural).
- Análisis de datos: evaluado en AIDABench.
- Uso de herramientas y agentes: evaluado en AutomationBench, Terminal-Bench 2.1 y GAIA, lo que indica soporte para flujos agénticos y ejecución en terminal.
- Capacidades de creación visual/web en las demostraciones: escenas 3D, SVG, webs interactivas, pósters y diseño editorial (según los ejemplos del autor).
- Contexto largo: comprensión de entradas extensas gracias al entrenamiento hasta 512K tokens.
- Multilingüe limitado a inglés y chino.
- No se documenta en la información disponible soporte explícito de audio ni un modo "thinking" separado.

## Casos de uso

- Agentes autónomos de terminal: el modelo se ha evaluado en Terminal-Bench 2.1 (59,55 en la versión release), por lo que puede emplearse en agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de línea de comandos.
- Automatización de flujos de trabajo (RPA con LLM): su puntuación en AutomationBench (36,67) lo hace adecuado para orquestar tareas repetitivas con tool calling en pipelines internos.
- Generación de repositorios y scaffolding de código: a partir de una descripción en lenguaje natural puede generar la estructura de un proyecto (NL2Repo, 41,36), útil para prototipado rápido y arranque de proyectos.
- Análisis de datos asistido: con AIDABench en 65,31, puede emplearse para interpretar tablas, generar consultas y resumir resultados analíticos en herramientas de BI.
- Asistentes de investigación con navegación y herramientas: su resultado en GAIA (69,90) sugiere uso en asistentes que combinan búsqueda, lectura de documentos y razonamiento multi-paso.
- Procesamiento de documentos largos con imágenes: gracias al contexto de hasta 512K tokens y a la entrada multimodal, puede resumir informes extensos con figuras o extraer información de capturas y diagramas.
- Despliegue en hardware limitado: con la cuantización AWQ 4 bits y ~15 GiB de VRAM a 256K de contexto, encaja en estaciones de trabajo con una sola GPU de 24 GB para inferencia multimodal de contexto largo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (comparación release frente a Preview y frente a Qwen3.8-27B cuando se indica):

| Benchmark | SenseNova-Loop-9B (release) | Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| NL2Repo | 41,36 | no disponible | 44,60 |
| AIDABench | 65,31 | no disponible | 65,01 |

El autor indica que la versión release supera a la Preview en los siete benchmarks mostrados; la tabla recoge solo los valores numéricos explícitamente citados en el texto de la model card. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GiB para inferencia multimodal a 256K de contexto con pesos AWQ 4 bits y caché KV de 8 bits (dato del autor). A contextos menores el consumo baja proporcionalmente.
- GPU recomendadas: una GPU con 24 GB o más (RTX 4090, L40S, A10G de 24 GB) es suficiente para el escenario de 256K; para mayor paralelismo o lotes grandes, A100/H100 de 40-80 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090 para el caso de contexto largo documentado; en 16 GB requeriría reducir contexto o usar caché KV más agresiva (no confirmado por el autor).
- Opciones de despliegue: el modelo requiere `custom_code` (arquitectura `sensenova_loop`), por lo que necesita `trust_remote_code` en Transformers; existe versión GGUF oficial para llama.cpp/Ollama. No se documenta soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B-AWQ | ≈9B | 512K (entrenamiento) | Apache 2.0 | Multimodal, arquitectura looped, cuantización AWQ oficial |
| Qwen3.8-27B | 27B | no disponible | no disponible | Referencia del autor; supera en NL2Repo (44,60 vs 41,36) y queda por debajo en AIDABench (65,01 vs 65,31) |
| SenseNova-Loop-9B (base) | ≈9B | 512K | Apache 2.0 | Versión sin cuantizar del mismo modelo |
| SenseNova-Loop-9B-Preview | ≈9B | no disponible | Apache 2.0 | Versión preliminar, inferior en los siete benchmarks según el autor |

No se dispone de datos suficientes para comparar con otras familias de modelos de tamaño similar (por ejemplo, alternativas de 7-9B multimodales) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Sesgos: no se documenta ningún análisis de sesgos en la model card; cabe esperar los sesgos presentes en los datos de preentrenamiento, no auditados públicamente.
- Alucinación: como todo LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de código y análisis de datos; se recomienda verificación humana en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere cargar código remoto (`custom_code`), lo que implica revisar y confiar en el código del repositorio antes de desplegarlo.
- Dependencia de código propio: la arquitectura `sensenova_loop` no es estándar en Transformers; la compatibilidad con frameworks de serving (vLLM, TGI) no está confirmada y puede requerir adaptaciones.
- Cuantización AWQ: la cuantización a 4 bits puede degradar ligeramente la calidad frente al modelo base; no se publican métricas comparativas de la pérdida por cuantización.
- Benchmarks: los resultados provienen del propio autor y no han sido verificados de forma independiente; algunos valores de comparación con Qwen3.8-27B no están completos.
- Contexto: aunque se entrena hasta 512K, el escenario documentado de 15 GiB corresponde a 256K; contextos mayores incrementan el consumo de memoria de forma significativa.

## Enlaces

- Modelo AWQ en Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Versión Preview: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Versión GGUF: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- ModelScope (base): https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- ModelScope (Preview): https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Discord: https://discord.com/invite/BuTXPHmQub
