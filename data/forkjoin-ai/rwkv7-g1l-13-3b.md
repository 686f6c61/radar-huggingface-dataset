# forkjoin-ai/rwkv7-g1l-13.3b

## Resumen

RWKV7-G1L-13.3B es un modelo de lenguaje base de 13.300 millones de parámetros desarrollado por BlinkDL (familia RWKV-7 "G1L", también conocida como GooseOne) y publicado el 31 de octubre de 2026. La variante que nos ocupa, `forkjoin-ai/rwkv7-g1l-13.3b`, es un contenedor derivado empaquetado por Forkjoin.ai a partir de la conversión oficial a safetensors de los pesos originales. No se trata de un modelo nuevo, sino de una redistribución cuantizada en un formato propietario denominado "knot".

La relevancia de este modelo radica en su arquitectura: RWKV-7 es un transformer recurrente de atención lineal, con estado constante token a token y sin caché KV creciente. Esto implica que el coste de decodificación es independiente de la posición en la secuencia dentro del contexto de entrenamiento de 34.304 tokens, lo que lo hace atractivo para inferencia de secuencias largas con memoria acotada. El modelo base está pensado para post-entrenamiento y ajuste fino, no como asistente instruido.

El artefacto de Forkjoin.ai emplea un contenedor `.knot` con cuantización Q8_0 por defecto (más islas forzadas en F32 para los tensores `rwkv_w1`/`rwkv_w2`), con 2.019 tensores y un tamaño de 14.395.689.897 bytes. No es compatible con `transformers`, safetensors ni GGUF: requiere el runtime propietario de Forkjoin.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (transformer recurrente con atención lineal, estado constante) |
| Parametros totales | 13,3 B (nominal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (por defecto, tensores >= 65.536 elementos) y F32 (tensores pequeños e islas `rwkv_w1`/`rwkv_w2`) |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.knot` (contenedor propietario de Forkjoin.ai; no safetensors, no GGUF) |
| Dimensiones | L61-D4096 (61 bloques, 4.096 de dimensión oculta) |
| Vocabulario | 65.536 tokens (RWKV World) |
| Numero de tensores | 2.019 (734 en Q8_0, 1.285 en F32) |
| Tamano del artefacto | 14.395.689.897 bytes |
| SHA-256 | `44cf40f77a1e6eb7e6a5a493b36ecc7657e1bc36a63c3747e791a2b5a3eca050` |
| Modelo base | RWKV/RWKV7-G1l-13.3B-20261031 (revision `f981293bd2578d403a8f1d6c5895f1f9b1663e87`) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente de atención lineal que sustituye la atención cuadrática tradicional por una formulación recurrente con estado constante. Cada token se procesa actualizando un estado interno de tamaño fijo, de modo que no existe caché KV que crezca con la longitud de la secuencia. El modelo tiene 61 bloques y una dimensión oculta de 4.096, con un vocabulario World de 65.536 tokens. El contexto de entrenamiento declarado es de 34.304 tokens.

La información disponible no detalla la composición del dataset de entrenamiento, el número total de tokens vistos ni si se aplicaron fases de RLHF o DPO. El modelo se distribuye como base, sin ajuste por instrucciones, y la model card indica explícitamente que está pensado para post-entrenamiento y ajuste fino. La innovación técnica principal es la propia arquitectura RWKV-7, que permite decodificación con coste independiente de la posición dentro del contexto de entrenamiento. El contenedor `.knot` de Forkjoin.ai aplica una política de codificación fija (Q8_0 por defecto, F32 para tensores pequeños e islas específicas), de forma que el tamaño del artefacto es función pura de las formas de los tensores y no depende del número de tokens ni del estado del runtime.

## Capacidades

- Generación de texto autoregresiva en modo base (completado, no instrucciones).
- Razonamiento y generación de código y matemáticas como modelo base, sujeto a la calidad del post-entrenamiento que se le aplique.
- Capacidades multilingües declaradas en 12 idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Decodificación con estado constante: el coste por token no crece con la posición dentro de los 34.304 tokens de contexto.
- No se documenta soporte nativo de tool calling ni function calling.
- No se documenta soporte específico de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Apta como base para ajuste fino supervisado y posteriores etapas de alineamiento.

## Casos de uso

- Post-entrenamiento y ajuste fino específico de dominio: al ser un modelo base Apache-2.0 de 13,3 B, se puede ajustar con SFT o DPO sobre datos propios para crear asistentes especializados en sectores como legal, sanitario o atención al cliente, partiendo de un checkpoint con contexto de 34.304 tokens.
- Inferencia de secuencias largas con memoria acotada: gracias al estado constante de RWKV-7, se puede procesar documentación extensa o conversaciones multi-turno sin que la memoria crezca con la longitud, lo que simplifica el despliegue en entornos con VRAM limitada.
- Procesamiento por streaming de flujos de texto continuos: la naturaleza recurrente permite mantener estado entre fragmentos sucesivos de un mismo flujo (logs, transcripciones, telemetría textual) sin re-procesar el histórico.
- Generación de código en pipelines internos: como base para ajuste fino sobre repositorios propios, con el objetivo de autocompletado o generación de tests, siempre que se valide la calidad tras el post-entrenamiento.
- Investigación en arquitecturas recurrentes: útil como referencia para comparar RWKV-7 con transformers de tamaño similar en tareas de modelado de lenguaje, eficiencia de decodificación y escalado de contexto.
- Despliegue en infraestructura propia ("sovereign inference"): el contenedor `.knot` y el runtime de Forkjoin.ai están orientados a servir el modelo en hardware controlado por el operador, sin dependencia de APIs externas, lo que encaja en requisitos de soberanía de datos.
- Traducción y procesamiento multilingüe: con 12 idiomas declarados, sirve como base para tareas de traducción o clasificación multilingüe tras el ajuste correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

La model card sí incluye medidas de serving registradas por el operador, que no deben interpretarse como benchmarks portables:

| Rung | LAN tok/s (8 hilos, single-stream) | Repositorio |
|---|---:|---|
| 1.5B | 3,604 | forkjoin-ai/rwkv7-g1l-1.5b |
| 2.9B | 2,002 | forkjoin-ai/rwkv7-g1l-2.9b |
| 7.2B | 0,890 | forkjoin-ai/rwkv7-g1l-7.2b |
| 13.3B | 0,687 | forkjoin-ai/rwkv7-g1l-13.3b |

Además, la sonda de admisión (forward denso sobre un prompt de 5 tokens) registró 100,77 s en un host de 512 GB, dato que la propia model card califica como testigo de admisión y no como benchmark de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ocupa 14,4 GB en disco; en Q8_0 se necesita aproximadamente esa cantidad de memoria residente para los pesos, más overhead del runtime y del estado recurrente (que es de tamaño fijo y no crece con el contexto).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabría en GPUs con 16-24 GB de VRAM (RTX 4090, A10, L4) si el runtime lo soporta, y con holgura en A100/H100.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos con 16 GB o más, aunque no está confirmado por el autor.
- Opciones de despliegue: exclusivamente el runtime propietario de Forkjoin.ai para contenedores `.knot`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `from_pretrained` de `transformers`.
- Latencia y throughput: 0,687 tok/s en single-stream sobre una estación LAN con 8 hilos (medición del operador, no portable). No se dispone de datos de throughput en batch ni en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV7-G1L-13.3B (este, `.knot`) | 13,3 B | 34.304 | RWKV-7 recurrente | Apache-2.0 | `.knot` |
| RWKV7-G1L-13.3B (original) | 13,3 B | 34.304 | RWKV-7 recurrente | Apache-2.0 | safetensors / `.pth` |
| RWKV7-G1L-7.2B | 7,2 B | no disponible | RWKV-7 recurrente | Apache-2.0 | `.knot` |
| RWKV7-G1L-2.9B | 2,9 B | no disponible | RWKV-7 recurrente | Apache-2.0 | `.knot` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de otras familias (Llama, Qwen, Mistral) de tamaño similar. La comparación se limita a la propia familia RWKV-7 G1L y al checkpoint original del que deriva.

## Limitaciones y advertencias

- No es un modelo instruido: es un base model. Sin post-entrenamiento no sigue instrucciones de forma fiable.
- Formato propietario: el `.knot` solo se lee con el runtime de Forkjoin.ai. No funciona con `transformers`, llama.cpp, vLLM, Ollama ni TGI, lo que limita la portabilidad y crea dependencia de un proveedor.
- Riesgo de alucinación: como cualquier modelo base, puede generar contenido plausible pero falso; requiere evaluación y filtrado en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo original.
- Cobertura idiomática: los 12 idiomas están declarados, pero no se aportan métricas de calidad por idioma; el rendimiento en idiomas distintos del inglés y el chino puede ser desigual.
- Contexto limitado a 34.304 tokens de entrenamiento; no se documenta extrapolación más allá de esa longitud.
- Licencia Apache-2.0: permite uso comercial y redistribución, pero exige mantener la atribución y el aviso de licencia del modelo base.
- Rendimiento medido muy bajo en el hardware del operador (0,687 tok/s single-stream); no apto para cargas interactivas de baja latencia sin verificación previa en el hardware objetivo.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/forkjoin-ai/rwkv7-g1l-13.3b
- Modelo base en Hugging Face: https://huggingface.co/RWKV/RWKV7-G1l-13.3B-20261031
- Pesos originales de BlinkDL: https://huggingface.co/BlinkDL/rwkv7-g1
- Repositorio de Forkjoin.ai (onboarding del runtime): https://github.com/forkjoin-ai/monorepo/blob/main/open-source/gnosis/distributed-inference/RWKV7_G1L_ONBOARDING.md
- Rung 1.5B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-1.5b
- Rung 2.9B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-2.9b
- Rung 7.2B: https://huggingface.co/forkjoin-ai/rwkv7-g1l-7.2b
- Artefacto en R2: https://r2.edgework.ai/models/rwkv7-g1l-13.3b.knot
