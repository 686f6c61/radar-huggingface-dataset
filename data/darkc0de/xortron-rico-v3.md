# darkc0de/XORTRON-RICO-v3

## Resumen

XORTRON-RICO-v3 es un modelo de lenguaje multimodal publicado por el usuario darkc0de dentro del proyecto experimental "XORTRON Criminal Computing", orientado al estudio de seguridad y alineacion de IA. No es un modelo entrenado desde cero: se trata de un merge lineal al 50 % entre `darkc0de/RICO` y `darkc0de/RICO-v2`, ambos a su vez derivados de la familia Qwen3.8 de 27B (etiqueta de repositorio `qwen3_5`) y de variantes "uncensored"/"heretic" de terceros. Cuenta con 27.781.427.952 parametros (≈27,78 mil millones) en bfloat16 y un repositorio de 55,6 GB.

Su relevancia no esta en el rendimiento, sino en su naturaleza de artefacto de investigacion sobre modelos con los guardarrailes eliminados (tags `abliterated`, `heretic`, `uncensored`, `harmful`, `toxic`). El autor lo distribuye bajo un acuerdo de acceso restringido que limita su uso a perfiles profesionales (legal, seguridad, investigacion en alineacion, fuerzas del orden, ciberseguridad, periodismo o politica publica) y prohibe explicitamente emplearlo para facilitar actividad delictiva real.

El modelo no incluye en su model card datos de contexto maximo, idiomas soportados, licencia formal ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 "likes", por lo que debe considerarse un experimento sin validacion externa publica. Su pipeline declarado es `image-text-to-text`, lo que implica capacidad multimodal de entrada de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (merge de la familia Qwen; etiqueta de repositorio `qwen3_5`); multimodal por pipeline `image-text-to-text` |
| Parametros totales | 27.781.427.952 (≈27,78 mil millones) |
| Parametros activos | No aplica / no se declara arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se publican GGUF, AWQ, GPTQ ni FP8 oficiales) |
| Idiomas soportados | no disponible (el repositorio no declara campo de idiomas) |
| Licencia | no disponible (sujeto al "XORTRON Restricted Access & Authorized-Use Agreement" del autor) |
| Formato de pesos | safetensors, bfloat16; repositorio de 55,6 GB |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de tipo `linear` con pesos 0,5000 para `darkc0de/RICO` y 0,5000 para `darkc0de/RICO-v2`, realizado con la API de merge por tensores de MergeKit procesando shard a shard. La salida se serializa en bfloat16 y los metadatos, tokenizer y processor se toman de `darkc0de/RICO-v2`. No se realizo ningun entrenamiento adicional, ajuste supervisado, RLHF ni DPO documentado: el comportamiento final depende por completo del promedio de pesos de los modelos fusionados.

Los modelos de partida citados en la model card son `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y `orcarouter/Qwen3.8-27B-Uncensored`, ademas de las dos revisiones RICO del propio autor. Los tags `heretic` y `abliterated` indican que en la cadena de ascendencia se aplicaron tecnicas de ablacion de direcciones de rechazo para reducir los comportamientos de negativa del modelo original. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la ventana de contexto nativa ni innovaciones de atencion o decodificacion; tampoco se detalla el impacto del merge en la coherencia frente a cada uno de los padres, que es precisamente la pregunta que plantea el autor ("Was RICO v1 or v2 better? Why choose?").

## Capacidades

- Generacion de texto conversacional en formato chat, con foco declarado en dialogos multi-turno por la etiqueta `conversational`.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`): el procesador asociado procede de `darkc0de/RICO-v2` y admite imagenes junto a instrucciones textuales.
- Comportamiento deliberadamente sin restricciones de rechazo, derivado de las tecnicas de abliteration de su ascendencia, lo que lo convierte en objeto de estudio en investigacion de alineacion y red teaming.
- Compatibilidad declarada con el ecosistema Transformers y con Text Generation Inference (`text-generation-inference` figura entre los tags).
- Soporte de cuantizacion y ajuste con Unsloth (tag `unsloth`), orientado a cargas en 4 bits y fine-tuning ligero.
- Capacidades de tool calling / function calling: no disponible (no se declaran).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Idiomas soportados: no disponible (no se declara cobertura multilingue).
- Modo de razonamiento explicito (thinking), audio o vision extendida: no disponible.

## Casos de uso

- Red teaming de filtros de seguridad: emplear el modelo como generador adversario para producir entradas y salidas que pongan a prueba clasificadores de toxicidad, moderacion de contenido y guardarrailes de otros sistemas, midiendo la tasa de evasion de forma controlada y documentada.
- Investigacion sobre abliteration y alineacion: comparar sistematicamente las respuestas de XORTRON-RICO-v3 con las de sus modelos base (`orcarouter/Qwen3.8-27B-Uncensored`, `darkc0de/RICO-v2`) para cuantificar que direcciones de rechazo se han perdido y con que efectos sobre la utilidad general.
- Estudio de tecnicas de merge: analizar experimentalmente si un merge lineal 50/50 preserva las capacidades de cada padre o produce degradacion de coherencia, repitiendo el experimento con pesos distintos y evaluando con un conjunto fijo de prompts.
- Analisis forense y threat intelligence: procesar corpus textuales procedentes de foros o denuncias (siempre bajo el marco legal aplicable) para identificar patrones de lenguaje delictivo y alimentar sistemas defensivos de deteccion.
- Generacion de datasets adversarios etiquetados: producir pares prompt-respuesta potencialmente toxicos para entrenar o evaluar clasificadores de contenido y sistemas de deteccion de abuso en plataformas.
- Apoyo a analisis legal y de politica publica: usar el modelo como banco de pruebas para documentar que tipo de asistencia operativa puede ofrecer un modelo sin restricciones, y traducir esos hallazgos en recomendaciones regulatorias o en clausulas contractuales para despliegues de IA.
- Investigacion academica en seguridad de IA: reproducir escenarios de uso indebido en entornos aislados (sandbox, sin salida a produccion) para publicar evidencia empirica sobre riesgos de modelos abliterados de ~27B.
- Procesamiento de documentos con imagenes en entornos de investigacion autorizados: al ser `image-text-to-text`, permite extraer y comentar informacion de capturas o documentos escaneados dentro de un flujo de analisis confinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad, y no existe informacion publica sobre el impacto del merge en metricas comparables con sus modelos base.

## Requisitos de hardware

- VRAM en bfloat16: los pesos ocupan ≈55,6 GB (27,78 mil millones de parametros × 2 bytes). Con cache KV y activaciones, el despliegue realista requiere del orden de 60-70 GB.
- GPU recomendadas para bf16: NVIDIA A100 80 GB, H100 80 GB o configuraciones multi-GPU (2 × A6000 48 GB, 2 × RTX 4090 24 GB con paralelismo de tensor y margen muy ajustado).
- Cuantizacion de 8 bits: ≈28 GB de pesos, viable en A100 40 GB, L40S 48 GB o RTX 5090 32 GB con poca holgura.
- Cuantizacion de 4 bits (NF4 o similar): ≈15-16 GB de pesos, con overhead estimado en 18-20 GB, por lo que cabe en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB). En GPUs de 16 GB el ajuste es dudoso.
- Cabe en GPU de consumo: si, en RTX 4090 / 3090 (24 GB) mediante cuantizacion de 4 bits; no en bf16 sin multi-GPU.
- Opciones de despliegue: Transformers (libreria declarada), Text Generation Inference (tag explicito) y vLLM (compatible en principio con el formato safetensors). Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que no se publican pesos GGUF en el repositorio. Unsloth esta soportado para carga en 4 bits y ajuste.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| darkc0de/XORTRON-RICO-v3 | 27.781.427.952 | no disponible | no disponible (acuerdo de uso restringido) | safetensors bf16 | 0 descargas, 0 likes; 55,6 GB |
| darkc0de/RICO | no disponible | no disponible | no disponible | safetensors | modelo base del merge |
| darkc0de/RICO-v2 | no disponible | no disponible | no disponible | safetensors | modelo base del merge; origen del tokenizer |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | no disponible | no disponible | ascendencia declarada |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | no disponible | no disponible | no disponible | no disponible | ascendencia declarada |

No se dispone de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que no es posible establecer una jerarquia de rendimiento. La diferencia verificable entre XORTRON-RICO-v3 y sus padres es unicamente la fusion lineal 50/50 y el formato de publicacion en bfloat16.

## Limitaciones y advertencias

- Ausencia de licencia formal: el repositorio no declara licencia, lo que genera incertidumbre juridica sobre cualquier uso comercial. La model card impone adicionalmente un acuerdo de acceso restringido que limita el uso a perfiles profesionales acreditados.
- Contenido de riesgo: los tags `harmful`, `toxic`, `uncensored`, `abliterated` y `not-for-all-audiences` indican que el modelo puede producir contenido ofensivo, peligroso o ilegal sin filtros internos.
- Uso prohibido: el propio autor prohibe emplearlo para cometer, facilitar, dirigir, asistir materialmente o encubrir actividad delictiva, y prohibe cederlo a terceros con ese fin.
- Riesgo elevado de alucinacion: se trata de un merge experimental sin evaluacion publicada; los promedios de pesos pueden degradar la coherencia y aumentar la generacion de afirmaciones incorrectas.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni resultados de benchmarks.
- Limitaciones de contexto e idioma desconocidas: no se declara ventana de contexto ni cobertura linguistica, por lo que no puede asumirse un comportamiento fiable en contextos largos ni en castellano.
- Naturaleza multimodal no verificada: aunque el pipeline es `image-text-to-text`, no se documenta el rendimiento en tareas de vision.
- Merge de merges: la cadena de dependencias acumula varias fusiones y ablaciones sucesivas, lo que dificulta la trazabilidad de comportamientos concretos y complica la atribucion de fallos.
- No apto para produccion: es un sistema de investigacion explicito; no debe integrarse en flujos de atencion al cliente, generacion de codigo ni procesos con usuarios finales.
- Se desconoce el estado de la model card: el texto del acuerdo de uso aparece truncado en la informacion disponible, por lo que podria haber clausulas adicionales no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkc0de/XORTRON-RICO-v3
- Modelo base darkc0de/RICO: https://huggingface.co/darkc0de/RICO
- Modelo base darkc0de/RICO-v2: https://huggingface.co/darkc0de/RICO-v2
- Ascendencia DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Ascendencia orcarouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- MergeKit: https://github.com/arcee-ai/mergekit
- Trend Micro Research, "Malicious Uses and Abuses of Artificial Intelligence": https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, "The Rise of AI-Enabled Crime": https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, "AI-Enabled Crime": https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- Congreso de Estados Unidos, registro de audiencia del 119.o Congreso: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- Busqueda web: las consultas realizadas no han devuelto enlaces relacionados con el modelo (los resultados obtenidos corresponden a contenido musical sin relacion).
