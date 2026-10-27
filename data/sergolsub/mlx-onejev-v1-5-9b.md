# sergolsub/mlx-onejev-v1.5-9B

## Resumen

`sergolsub/mlx-onejev-v1.5-9B` es una conversión a formato MLX con cuantización de 8 bits del modelo `OmniJev/OneJev1.5-9B`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: la model card indica explícitamente que no hay reentrenamiento ni cambios de arquitectura, solo cuantización de los pesos originales. El interés práctico es que permite ejecutar un modelo de 9.400 millones de parámetros en un Mac con memoria unificada moderada, con un pico de memoria residente medido de 12,21 GB.

El repositorio pesa 11,4 GB y contiene tres shards en safetensors con los pesos en 8 bits, junto con el `config.json`, el tokenizer, una plantilla de chat en Jinja y dos ficheros auxiliares de inferencia (`decision_config.json` y `joint_config.json`) que, según la model card, aparecen cuando el modelo dispone de un modo de decisión con cabeza específica. El tag `qwen3_5` sugiere una arquitectura de la familia Qwen 3.5 como base de la familia OneJev, aunque la model card no documenta la arquitectura de forma directa.

La relevancia actual es acotada pero clara: es una de las pocas conversiones MLX publicadas de este modelo base, con métricas de despliegue reales declaradas por el autor (tiempo de carga, memoria pico, latencia por decisión y perplejidad de calibración) y con los hashes SHA-256 de los shards incluidos en el repositorio, lo que facilita la verificación de integridad en entornos donde la cadena de suministro de pesos importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia inferida por el tag `qwen3_5`; no confirmada en la model card). Incluye ficheros de glue para un modo de decisión con cabeza específica (`decision_config.json`, `joint_config.json`) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en formato MLX (única variante publicada en este repo); no se ofrece GGUF ni otros niveles de cuantización |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del repositorio upstream; en caso de conflicto prevalece la licencia del repositorio original) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,03 GB + 4,04 GB + 3,32 GB), más `config.json`, `tokenizer*`, `chat_template.jinja` y ficheros `*_mlx.py` / `decision_config.json` / `joint_config.json` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de tres indicios: el tag `qwen3_5` en HuggingFace, la presencia de una plantilla de chat estándar y la existencia de ficheros específicos para un "modo de decisión" con cabezas de decisión conjunta (`decision_config.json`, `joint_config.json`). La model card es explícita en que la conversión no altera la arquitectura ni el entrenamiento: se aplica cuantización de 8 bits exclusivamente para MLX. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento en el modelo original.

Este repositorio es, por tanto, un artefacto de distribución más que un modelo nuevo. El tag `base_model:finetune:OmniJev/OneJev1.5-9B` indica que la relación con el modelo upstream es de derivación directa. Como valor técnico añadido, el autor publica métricas de despliegue medidas en un Mac mini M4 Pro de 48 GB: carga en 3,82 s, pico de memoria residente de 12,21 GB, latencia mediana de decisión de 1650 ms y una tasa sostenida de 0,79 decisiones cortas por segundo, además de una exactitud del 83,3 % y una perplejidad de calibración de 1,985 en su propia evaluación tras la cuantización a 8 bits (la model card no detalla la metodología ni el conjunto de evaluación).

## Capacidades

- Generación de texto autoregresiva estándar mediante `mlx_lm.generate`, con `max_tokens` configurable (el ejemplo de la model card usa 256).
- Modo de decisión: la presencia de `decision_config.json`, `joint_config.json` y scripts `*_mlx.py` apunta a una cabeza o ruta de inferencia específica para tomar decisiones cortas, con latencia medida de 1650 ms de mediana.
- Conversación multi-turno: el repositorio incluye `chat_template.jinja`, por lo que el tokenizer aplica la plantilla de chat del modelo original.
- Ejecución local íntegra en Apple Silicon con memoria unificada, sin dependencia de API externa ni de CUDA.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible; la model card no declara idiomas.

## Casos de uso

- Clasificación y enrutamiento en local sobre macOS: usar el modo de decisión para etiquetar tickets, correos o consultas entrantes en un pipeline on-device, con ~1,27 s por decisión sostenida y sin enviar datos a un tercero.
- Asistente de escritorio offline para equipos de desarrollo con portátiles Apple Silicon: al caber en 12,21 GB de memoria residente, puede ejecutarse junto al IDE en un Mac de 16-24 GB de memoria unificada.
- Preprocesado y normalización de texto en pipelines de datos: generación de resúmenes cortos, extracción de campos o reformateo de registros antes de pasarlos a un modelo mayor alojado en servidor.
- Prototipado rápido de producto en MLX: al ser una conversión directa con instrucciones de carga de tres líneas, sirve para validar la calidad del modelo base OneJev1.5-9B antes de invertir en infraestructura GPU.
- Evaluación comparativa de cuantización: permite medir el impacto de 8 bits frente a los pesos originales en una tarea concreta, usando la perplejidad de calibración declarada (1,985) como referencia inicial.
- Guardarraíl o pre-filtro en aplicaciones con requisitos de privacidad (sanidad, legal, finanzas): la inferencia es completamente local y la licencia Apache-2.0 no impone restricciones de uso comercial, siempre que se respete la licencia upstream.
- Generación de borradores de baja latencia en herramientas CLI o scripts de automatización donde no se requiere una calidad de chat de frontera, sino una respuesta rápida y determinista en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible. Las únicas métricas publicadas son las del autor, medidas sobre su propia evaluación tras la cuantización a 8 bits:

| Metrica | Valor | Contexto de medida |
|---|---|---|
| Exactitud tras cuantizacion 8 bits | 83,3 % | Evaluación propia del autor; conjunto y métrica no especificados |
| Perplejidad de calibracion | 1,985 | Evaluación propia del autor |
| Latencia mediana de decision | 1650 ms | Mac mini M4 Pro 48 GB, MLX 8 bits |
| Throughput sostenido | 0,79 decisiones cortas/s | Mac mini M4 Pro 48 GB, MLX 8 bits |
| Tiempo de carga del modelo | 3,82 s | Mac mini M4 Pro 48 GB, MLX 8 bits |
| Memoria residente pico | 12,21 GB | Mac mini M4 Pro 48 GB, MLX 8 bits |

No hay comparación con los pesos originales en BF16 ni con otras cuantizaciones, por lo que no es posible cuantificar la pérdida de calidad introducida por el paso a 8 bits.

## Requisitos de hardware

- VRAM o memoria unificada: 12,21 GB de pico medido para la variante 8-bit MLX; se recomienda un mínimo de 16 GB de memoria unificada y 24 GB para trabajar con contexto largo y otras aplicaciones abiertas.
- Pesos en disco: 11,4 GB (tres shards de 4,03 GB, 4,04 GB y 3,32 GB). Conviene reservar al menos el doble durante la descarga y verificación.
- GPU compatibles: Apple Silicon exclusivamente (MLX). Verificado por el autor en un Mac mini M4 Pro con 48 GB. No hay soporte CUDA ni ROCm en este repositorio.
- GPU de consumo: cabe en cualquier Mac con 16 GB o más de memoria unificada (M1/M2/M3/M4, incluidas variantes base de 16 GB con margen ajustado). No es utilizable directamente en RTX 4090, A100 o H100 sin convertir los pesos a otro formato.
- Opciones de despliegue: `mlx_lm` (librería declarada). vLLM, TGI, llama.cpp y Ollama no son compatibles de forma nativa con este repositorio; requerirían reconvertir los pesos (por ejemplo, a GGUF), lo que no está cubierto por la información disponible.
- Latencia y throughput: 1650 ms de mediana por decisión corta y 0,79 decisiones/s sostenidas en el hardware indicado. El rendimiento en generación de texto largo no está publicado.
- Estimación orientativa para otras precisiones (no medida, derivada del número de parámetros): BF16 ≈ 18,8 GB solo en pesos, más overhead de activaciones y caché KV; 4 bits ≈ 4,7-6 GB. Estas cifras no están verificadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| sergolsub/mlx-onejev-v1.5-9B | 9,41 B | no disponible | 8 bits MLX | Apache-2.0 | HuggingFace, formato MLX | 83,3 % exactitud y PPL 1,985 (evaluación propia) |
| OmniJev/OneJev1.5-9B (upstream) | 9,41 B (misma base) | no disponible | BF16 presumiblemente | Apache-2.0 | HuggingFace | no disponible en esta ficha |
| Qwen3-8B (referencia de categoría) | ~8,2 B | 32.768 tokens nativos, ampliable por YaRN | BF16, GGUF, MLX, AWQ | Apache-2.0 | Amplia, múltiples runtimes | Benchmarks públicos extensos |
| Llama 3.1 8B (referencia de categoría) | 8,03 B | 128.000 tokens | BF16, GGUF, MLX, entre otros | Llama 3.1 Community License | Amplia, múltiples runtimes | Benchmarks públicos extensos |

Nota: los datos de Qwen3-8B y Llama 3.1 8B son especificaciones públicas de referencia, no forman parte de la información proporcionada en esta búsqueda y no se han verificado contra sus model cards en esta ficha. La comparación de rendimiento frente a OneJev1.5-9B no es posible porque el autor no publica benchmarks estándar.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingües, lo que impide situar el modelo frente a alternativas consolidadas.
- La métrica de "83,3 % de exactitud" no especifica el conjunto de evaluación, el número de ejemplos ni la tarea, por lo que no es reproducible ni comparable.
- Contexto y idiomas no documentados: planificar cualquier despliegue asumiendo que habrá que medir empíricamente la ventana efectiva y el comportamiento en castellano.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 9 B sin datos de alineamiento publicados, es esperable un comportamiento inferior a modelos de frontera en razonamiento y factualidad.
- Sesgos: no documentados. No hay información sobre composición del dataset de entrenamiento ni sobre filtros de seguridad.
- Licencia: Apache-2.0 permite uso comercial, pero la propia model card advierte de que prevalece la licencia del repositorio upstream en caso de conflicto; conviene revisar el LICENSE de `OmniJev/OneJev1.5-9B` antes de un despliegue en producción.
- Inconsistencia en el nombrado de shards: los ficheros se llaman `model-00001-of-00001.safetensors`, `model-00002-of-00001.safetensors` y `model-00003-of-00001.safetensors`, un patrón anómalo que puede confundir a cargadores automáticos. Verificar los SHA-256 publicados con `sha256sum` tras la descarga.
- Dependencia de plataforma: los pesos están en layout MLX y solo se cargan con `mlx_lm` en Apple Silicon; no son portables a CUDA sin reconversión.
- Repositorio con muy poca tracción (17 descargas, 0 likes) y sin pipeline declarado: no hay evidencia de validación por parte de terceros.
- El "modo de decisión" depende de ficheros de glue propios (`*_mlx.py`, `decision_config.json`, `joint_config.json`) cuya documentación no se incluye; su comportamiento fuera del script del autor es incierto.
- Fechas de creación y actualización del repositorio (octubre de 2026) posteriores a la fecha habitual de referencia: conviene confirmar la vigencia y el estado del proyecto upstream antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergolsub/mlx-onejev-v1.5-9B
- Modelo base (upstream): https://huggingface.co/OmniJev/OneJev1.5-9B
- Librería MLX: no disponible en la información proporcionada (la model card solo referencia `mlx_lm` sin URL)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
- Los resultados de búsqueda web obtenidos no guardan relación con este modelo y se han descartado.
