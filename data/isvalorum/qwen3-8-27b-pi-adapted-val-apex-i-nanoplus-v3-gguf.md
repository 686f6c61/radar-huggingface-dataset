# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantización GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum bajo su serie de cuantizaciones "APEX". No se trata de un modelo entrenado desde cero, sino de una compilación de pesos cuantizados con un mapa quirúrgico por tensor (mezcla de Q3_K, Q4_K, Q5_K, Q8_0, IQ3_XXS, IQ4_XS y F32) orientado a preservar las rutas recurrentes y las proyecciones de atención críticas mientras se reduce la huella a 11,47 GiB en su variante NanoPlus.

El modelo base declara la arquitectura `qwen35`, que por los tensores presentes (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt`, `ssm_beta`, `ssm_out` junto con atención clásica `attn_qkv`, `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`) corresponde a un diseño híbrido que combina capas con atención y capas con state space models (SSM). El tamaño real de parámetros según safetensors es de 27.320.697.856 (aproximadamente 27,3 mil millones), con 64 bloques (`blk.0` a `blk.63`).

La relevancia de esta ficha es doble: por un lado documenta una cuantización de tercera iteración (V3) de un modelo híbrido de gran tamaño pensada para ejecución local en llama.cpp; por otro, ilustra una práctica creciente de cuantización selectiva por tensor con protección en F32 de los parámetros recurrentes, algo poco habitual en releases comunitarios y potencialmente decisivo para la estabilidad de modelos SSM/híbridos en precisión reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (híbrida: atención + SSM/recurrente, 64 bloques) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: Q3_K, Q4_0, Q4_K, Q5_K, Q8_0, IQ3_XXS, IQ4_XS, F32 (mapa por tensor); variantes MiniPlus (13,31 GiB), NanoPlus (11,47 GiB), MicroPlus (9,77 GiB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, con 64 bloques que alternan componentes de atención (`attn_qkv`, `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`) y componentes de tipo SSM (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt.bias`, `ssm_out`). La presencia de `attn_gate` en 48 capas y de proyecciones `attn_k`/`attn_v`/`attn_q`/`attn_output` en 16 capas (patrón `blk.{3..63:4}`, es decir, cada cuatro bloques a partir del 3) sugiere un diseño híbrido en el que solo una fracción de las capas usa atención completa, mientras el resto emplea rutas recurrentes. Esta estructura es coherente con la familia Qwen3-Next y con propuestas recientes de atención lineal y SSM para reducir el coste de contexto largo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras fases de alineamiento. La model card de esta cuantización no documenta el proceso de entrenamiento del modelo base; solo describe el proceso de cuantización. La innovación técnica destacable de este release es la cuantización selectiva por tensor: los parámetros de la ruta recurrente (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt.bias`) se mantienen en F32 (408 tensores observados), mientras que las proyecciones de atención y FFN se comprimen a Q3_K, Q4_K, Q5_K, IQ3_XXS o IQ4_XS según su criticidad. La matriz de importancia (imatrix) usada proviene de `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` en un commit concreto.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline declarado `text-generation` y tag `conversational`.
- Orientación explícita a agentes: los tags incluyen `agents` y `mtp` (multi-token prediction), lo que apunta a soporte de flujos multi-paso y tool use, aunque la model card no detalla el formato exacto de function calling.
- Razonamiento multi-paso y planificación de tareas, presumiblemente apoyado en el modo MTP y en la ventana de contexto del modelo base (no documentada aquí).
- Capacidades multilingües: no disponibles; el campo de idiomas del repo está vacío.
- Integración con llama.cpp y con el cliente V-Agent del propio autor, que añade herramientas de sistema de ficheros, shell, búsqueda web, navegador autónomo, peticiones HTTP y servidores MCP.
- Compatibilidad con endpoints OpenAI-/Claude-compatible a través de V-Agent.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Agente local en Windows: el modelo está pensado para ejecutarse dentro de V-Agent, un agente de escritorio open source que permite operar sobre ficheros, shell y navegador con aprobación por acción. La cuantización NanoPlus (11,47 GiB) encaja en GPUs de consumo de 16 GB, lo que hace viable un agente autónomo sin depender de la nube.
- Automatización de tareas de desarrollo: al soportar tool calling y ejecución de comandos de shell a través del cliente, puede usarse para generar parches, validar sintaxis de código generado y ejecutar comprobaciones de HTML en tiempo de ejecución, según describe la model card de V-Agent.
- Asistencia conversacional multi-turno: el pipeline `text-generation` y el tag `conversational` lo sitúan como candidato para chatbots locales con plantilla de chat incluida en el GGUF, útil en escenarios con requisitos de privacidad (sin telemetría ni cuenta en V-Agent).
- Investigación sobre cuantización de modelos híbridos: el mapa por tensor auditado y el fichero `tensor-map.tsv` permiten estudiar el impacto de mantener rutas SSM en F32 frente a comprimirlas, un caso de estudio útil para quienes trabajan en compresión de modelos con componentes recurrentes.
- Despliegue en entornos con recursos limitados: las tres variantes (MiniPlus 13,31 GiB, NanoPlus 11,47 GiB, MicroPlus 9,77 GiB) permiten elegir el equilibrio calidad/huella según la VRAM disponible, desde estaciones de trabajo con 16 GB hasta portátiles con 12 GB.
- Servicio de inferencia compatible con OpenAI: el tag `endpoints_compatible` y la integración con llama.cpp permiten exponerlo como backend local en herramientas que esperan la API de OpenAI, útil para prototipado sin coste por token.
- Procesamiento por lotes de documentos con contexto largo: si el modelo base conserva la ventana extendida típica de la familia Qwen3, la combinación de atención híbrida y SSM reduce el coste de memoria en secuencias largas, adecuado para resumen y extracción sobre corpus extensos (siempre que se valide la ventana real, no documentada aquí).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,5 GiB para NanoPlus, 13,3 GiB para MiniPlus y 9,8 GiB para MicroPlus, más overhead de contexto KV/estado SSM (no cuantificado en la información disponible).
- GPU recomendadas: no especificadas por el autor; por huella, encajan RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, NanoPlus y MicroPlus caben en GPUs de 12-16 GB; MiniPlus requiere 16 GB o más.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan y CPU), Strata y Strata Rust, V-Agent como cliente de escritorio, y cualquier servidor compatible con la API de OpenAI que use llama.cpp como backend.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3 (este) | 27,3 B | no disponible | apache-2.0 | GGUF mixto, 11,47 GiB | Cuantización selectiva con SSM en F32; orientado a agentes |
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3 | 27,3 B | no disponible | apache-2.0 | GGUF, 13,31 GiB | Misma base, mayor huella y presumiblemente mayor fidelidad |
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3 | 27,3 B | no disponible | apache-2.0 | GGUF, 9,77 GiB | Misma base, menor huella y mayor compresión |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3 B | no disponible | no disponible | safetensors (base) | Modelo original sin cuantizar |

No se dispone de información sobre modelos de otros autores comparables en la misma categoría (híbridos SSM/atención de aproximadamente 27 B) dentro de la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluación de seguridad del modelo base; no hay garantías sobre comportamientos tóxicos o sesgados.
- Riesgo de alucinación inherente a los modelos generativos; la cuantización agresiva de capas FFN (IQ3_XXS en `ffn_gate` y en 48 de las 64 capas `ffn_down`) puede amplificar errores en tareas de razonamiento numérico o factual.
- Longitud de contexto no documentada: no debe asumirse la ventana del modelo base sin verificar; el estado SSM y el KV cache tienen costes distintos a los de un transformer puro.
- Idiomas no declarados: el rendimiento en castellano no está validado y podría degradarse respecto al modelo original.
- Licencia apache-2.0 declarada en el repo de la cuantización; conviene verificar la licencia del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, que no se especifica en la información disponible, antes de uso comercial.
- La cuantización mixta no es estándar: herramientas que asuman un único tipo de quant por tensor pueden no interpretarla correctamente; se recomienda usar builds recientes de llama.cpp.
- El repo tiene 0 likes y 481 descargas en el momento de la consulta, con fecha de creación y actualización el mismo día (2026-11-18): es un release muy reciente y con poca validación comunitaria.
- El uso de V-Agent como cliente recomendado implica ejecutar acciones sobre el sistema (shell, ficheros, navegador); aunque requiere aprobación por acción, debe revisarse la política de permisos antes de usarlo en producción.
- El autor declara que la cuantización se computó con clústeres en la nube financiados de su bolsillo; no hay auditoría independiente de la calidad de la cuantización más allá del mapa de tensores publicado.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Imatrix usada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (commit 4af51b3542f775b0a8e4b310bfb3f17e01c306c9)
- Cliente V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- Descarga de V-Agent para Windows: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
