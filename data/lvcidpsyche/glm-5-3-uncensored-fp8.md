# LvcidPsyche/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos del modelo GLM-5.3 de zai-org, publicada por el usuario LvcidPsyche (la model card la atribuye al colectivo dealignai). Se construye sobre la cuantización FP8 realizada por JANGQ-AI y aplica una edición permanente en bf16 sobre los tensores residual-writer para eliminar el comportamiento de rechazo en una taxonomía amplia de daño multilingüe. No hay fine-tuning, LoRA ni hooks en tiempo de ejecución: la edición está horneada en los pesos y se carga con vLLM estándar.

El modelo tiene 753.329.940.480 parámetros (~753 B), arquitectura glm_moe_dsa de 78 capas y es exclusivamente de texto. Los expertos enrutados en FP8 permanecen intactos, de modo que conserva la velocidad nativa de tensor cores FP8 en Hopper (H100/H200). El repositorio ocupa 755,7 GB y se sirve, según la documentación del autor, con tensor-parallel 8 sobre 8× H200 con una longitud de modelo de 131.072 tokens.

Es relevante ahora por dos motivos: por un lado, es un caso de estudio de "abliteration" a escala de 753 B con evaluación declarada de preservación de capacidades (MMLU-logit) y de cumplimiento (HarmBench-320); por otro, la propia model card documenta limitaciones operativas concretas del stack vLLM sobre esta arquitectura (MTP no funcional, contexto de 1 M cerrado con decode-context-parallel, comportamiento del parámetro reasoning_effort), lo que lo convierte en una referencia útil para quien despliegue modelos MoE con atención dispersa en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención dispersa tipo DSA), 78 capas, decoder text-only |
| Parámetros totales | 753.329.940.480 (~753 B) |
| Parámetros activos | no disponible (la model card no especifica número de expertos ni parámetros activos) |
| Longitud de contexto | no disponible como máximo oficial; el ejemplo de servicio del autor usa 131.072 tokens. La model card menciona contexto de 1 M vía decode-context-parallel, no operativo en vLLM actualmente sobre glm_moe_dsa |
| Tipos de cuantización | FP8 en los expertos enrutados (checkpoint ya cuantizado); edición en bf16 de los tensores residual-writer. No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (declarada en el repositorio y en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es zai-org/GLM-5.3, un transformer MoE de 753 B parámetros con arquitectura glm_moe_dsa, 78 capas y modalidad únicamente textual. Sobre esa base, JANGQ-AI/GLM-5.3-FP8 produce la cuantización FP8 que este checkpoint modifica. La intervención es de nivel de pesos: se editan en bf16 los tensores residual-writer, dejando intactos los expertos enrutados en FP8, de forma que no se degrada el rendimiento de tensor cores en Hopper. No se emplean LoRA, fine-tuning ni trucos de prompt.

No hay información disponible sobre el dataset de entrenamiento del modelo base ni sobre su volumen de tokens, composición, RLHF o DPO. La model card describe únicamente el proceso de uncensoring y su validación. La revisión v2 corrige un fallo de bucle de razonamiento presente en v1, que afectaba aproximadamente al 2 % de los prompts con señal de rechazo más difícil (copyright literal, química de armas, exploit contra objetivo real) y que provocaba colapso en repetición antes de emitir respuesta; según el autor, v2 presenta 0 bucles en la sonda hardcore y 0 casos GARBAGE en HB-320, a cambio de ~4 pp menos de TRUE_COMPLY global en HB-320, pero con mejor resultado en la superficie de daño real no relacionada con copyright (91,7 % frente a 85,9 % de TRUE_COMPLY con effort "off"). El checkpoint incluye decodificación especulativa MTP, no funcional en vLLM estándar pero reportada como operativa en el fork sparse-MLA B12X de ciprianveg, con +48 % de decodificación en prompts de código.

## Capacidades

- Generación de texto y conversación (pipeline_tag: text-generation), orientada a diálogo multi-turno.
- Modo de razonamiento explícito con bloque `<think>`; el texto de razonamiento se expone en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`: solo se honran los valores `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir, o un `off:` de YAML sin comillas que parsea a booleano `false`) cae a `max`. No existe forma de desactivar el razonamiento en este checkpoint.
- Tool calling y function calling: el ejemplo de despliegue del autor usa `--tool-call-parser glm47` y `--enable-auto-tool-choice`, lo que habilita bucles de agente con selección automática de herramienta.
- Razonamiento multi-paso y uso en bucles de agente (el autor recomienda `reasoning_effort="low"` para uso con herramientas sobre FP8).
- Capacidad multilingüe declarada en 10 idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Supresión del comportamiento de rechazo en una taxonomía amplia y multilingüe de daño (no especializada en un único dominio), verificada con HarmBench-320.
- Decodificación especulativa MTP, sujeta a las limitaciones del stack descritas más abajo.
- Sin capacidades de visión ni de audio: la model card indica explícitamente text-only.

## Casos de uso

- Red-teaming de guardrails propios: al no emitir rechazos, el modelo sirve como generador de solicitudes y respuestas adversarias para medir la tasa de detección de los clasificadores de contenido y de los filtros de entrada/salida de un producto antes de su lanzamiento.
- Investigación sobre alineación y abliteration: comparar el comportamiento de rechazo antes y después de editar los tensores residual-writer, usando como referencia las métricas declaradas (MMLU-logit 87,43 % en v2 frente a 85,58 % del base regular) y las tablas de HarmBench-320.
- Evaluación de moderación multilingüe: sus 10 idiomas declarados permiten construir conjuntos de prueba en en, zh, ru, sr, hi, fr, es, ar, ko y ja para comprobar si un sistema de moderación mantiene cobertura fuera del inglés.
- Agentes con tool calling en producción: con `--tool-call-parser glm47 --enable-auto-tool-choice` y `reasoning_effort="low"` puede integrarse en flujos de agente que encadenan llamadas a herramientas; el autor advierte que con effort `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta.
- Asistencia a la generación de código y tareas técnicas en pipelines internos: la model card reporta +48 % de decodificación en prompts de código al activar MTP con el fork sparse-MLA B12X.
- Procesamiento de documentos largos: con `--max-model-len 131072` y prefix caching activado, el modelo permite resumir o extraer información de expedientes y bases documentales extensas en una sola ventana (sujeto al techo práctico de contexto descrito en la sección de hardware).
- Generación de datos sintéticos multilingües: útil para aumentar corpus de entrenamiento en idiomas con poca cobertura, siempre que el corpus resultante pase por un filtrado de seguridad posterior.
- Estudio comparativo de cuantización FP8 en MoE de gran escala: el checkpoint permite medir el impacto del FP8 y de la edición de pesos sobre calidad y latencia en un modelo de 753 B.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card del autor y corresponden a evaluaciones internas, no a leaderboards de terceros.

MMLU-logit sobre muestra estratificada de 1026 preguntas (18 por asignatura, 57 asignaturas):

| Modelo | MMLU-logit | Δ frente al base |
|---|---|---|
| GLM-5.3-UNCENSORED-FP8 v2 (este release) | 87,43 % (897/1026) | +1,85 pp |
| GLM-5.3-UNCENSORED-FP8 v1 (referencia) | 87,72 % | +2,14 pp |
| GLM-5.3 regular (base declarado) | 85,58 % | — |

Nota metodológica del autor: cada asignatura tiene 18 preguntas, por lo que ±1 pregunta equivale a ±5,5 pp de ruido. La media de diferencia por asignatura entre v2 y v1 es de -0,29 pp; solo `high_school_european_history` se movió más de una pregunta (94,4→83,3, -11,1 pp = 2 preguntas). Las mayores ganancias se dieron en college_chemistry, world_religions, professional_psychology y security_studies (+5,5 a +5,6 pp cada una).

HarmBench-320 con decodificación greedy y `max_tokens=700`, esfuerzos `off` y `max` (el esfuerzo `low` se omite por metodología):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off (320 comportamientos) | 261 (81,6 %) | 19 (5,9 %) | 22 (6,9 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 18 (5,6 %) |
| max (320 comportamientos) | 254 (79,4 %) | 15 (4,7 %) | 23 (7,2 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 28 (8,8 %) |
| off (240 comportamientos sin copyright) | 220 (91,7 %) | 1 (0,4 % aprox., dato truncado) | no disponible | no disponible | no disponible | no disponible | no disponible |

Advertencia: la información proporcionada trunca la tabla de los 240 comportamientos no relacionados con copyright en la primera fila (`1 (0.`), por lo que el resto de esa tabla no está disponible. El autor indica que las respuestas con razonamiento largo por encima de 700 tokens se convierten en `<think>` truncado vacío y se cuentan como UNK.

## Requisitos de hardware

- Peso de los pesos: ~753 GB en FP8 (755,7 GB de repositorio). No cabe en ninguna GPU de consumo, ni siquiera agregando varias.
- Configuración documentada por el autor: 8× H200 con `--tensor-parallel-size 8`, `--gpu-memory-utilization 0.90`, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`.
- Pruebas de campo reportadas sobre 8× DGX Spark GB10 por @0xMagnus.
- Techo práctico de contexto con TP8 en H200: ~131 K tokens con MTP y ~160 K sin MTP. El contexto de 1 M vía decode-context-parallel está cerrado hoy en vLLM sobre glm_moe_dsa, porque el `k_cache` del indexador DSA se replica entre los ranks de DCP mientras el KV de MLA está shardeado, lo que produce el error de page size en `fp8_ds_mla`.
- Paralelismo alternativo: pipeline-parallel (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- MTP: no funcional en vLLM estándar. El autor reporta que funciona en el fork sparse-MLA B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con +48 % de decodificación en prompts de código.
- `--enforce-eager` es necesario para la ruta de atención dispersa de DeepSeek bajo concurrencia.
- Motor de despliegue documentado: vLLM. No hay información disponible sobre soporte en llama.cpp, Ollama, TGI u otros motores para este checkpoint FP8.
- Latencia y throughput absolutos: no disponibles. El único dato relativo es el +48 % de decodificación con MTP en el fork mencionado.
- Presupuesto de tokens: para `reasoning_effort=max` el autor recomienda `max_tokens ≥ 2600`; en uso con herramientas recomienda `low` o, si se usa `high`/`max`, `max_tokens ≥ 8000` para evitar respuestas vacías con `finish=length`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753 B, MoE, FP8 | 131 K práctico en TP8 H200; 1 M no operativo en vLLM | MIT (declarada) | 0 descargas y 0 likes en el momento del registro; requiere TP8 en H200 |
| zai-org/GLM-5.3 | 753 B | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo base alineado, del que deriva este checkpoint |
| JANGQ-AI/GLM-5.3-FP8 | 753 B, FP8 | no disponible en la información proporcionada | no disponible en la información proporcionada | Cuantización FP8 del base; es el padre directo del checkpoint editado |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | Variante hermana enfocada a ciberseguridad, recomendada por el autor para ese dominio concreto |

No se dispone de comparaciones con alternativas de otros fabricantes (por ejemplo, otros MoE de escala similar) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: el comportamiento de rechazo se ha reducido deliberadamente en una taxonomía amplia de daño multilingüe. No es apto para uso general sin salvaguardas externas; puede generar contenido dañino, ilegal o inseguro.
- Riesgo de alucinación: la model card no publica evaluaciones de factualidad ni de tendencia a alucinar. No hay datos disponibles.
- Sesgos: no hay evaluación de sesgos publicada en la información disponible.
- Licencia: se declara MIT tanto en el repositorio como en la model card, pero el modelo es un derivado de zai-org/GLM-5.3 y de la cuantización de JANGQ-AI. Conviene verificar los términos de los modelos base y del checkpoint intermedio antes de un uso comercial, ya que la licencia declarada por el derivado no necesariamente cubre las obligaciones del original.
- Contexto: el techo práctico documentado es ~131 K tokens con MTP y ~160 K sin MTP en TP8 sobre H200; el contexto de 1 M vía decode-context-parallel está cerrado actualmente en vLLM para esta arquitectura.
- Razonamiento: no se puede desactivar. `reasoning_effort` solo honra `"low"` y `"high"`; el resto de valores cae a `max`. Con `high`/`max` el modelo puede agotar `max_tokens` dentro del bloque `<think>` y devolver respuesta vacía con `finish=length`.
- Inconsistencia interna de la model card: las notas de runtime afirman que `off` cae a `max`, mientras que las tablas de HarmBench presentan resultados ejecutados con esfuerzo `off`. Conviene verificar el comportamiento real del parámetro antes de fijar una configuración de producción.
- MTP no funcional en vLLM estándar; requiere un fork de terceros, lo que añade riesgo de mantenimiento y de reproducibilidad.
- Idiomas: se declaran 10 idiomas, pero no se publican evaluaciones desagregadas por idioma; el rendimiento fuera de en/zh es desconocido.
- Modalidad: solo texto. No hay visión ni audio.
- Trazabilidad: el identificador de HuggingFace es `LvcidPsyche/GLM-5.3-UNCENSORED-FP8`, mientras que la model card, el logotipo, el comando de servicio y el enlace de discusión apuntan a `dealignai/GLM-5.3-UNCENSORED-FP8`. Es una discrepancia de autoría/publicación a tener en cuenta.
- Madurez: 0 descargas y 0 likes en el momento del registro, fecha de creación y última actualización 2026-09-20. No hay validación independiente de las métricas declaradas.
- La información disponible trunca parte de la model card (tabla de 240 comportamientos no relacionados con copyright y secciones posteriores), por lo que puede haber datos adicionales no recogidos aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LvcidPsyche/GLM-5.3-UNCENSORED-FP8
- Ruta alternativa del mismo checkpoint citada en la model card: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización autora (según model card): https://huggingface.co/dealignai
- Perfil de Twitter citado: https://twitter.com/dealignai
- Discusión con notas de ejecución sobre 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de dichas notas: https://huggingface.co/0xMagnus
- Búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas de ayuda de YouTube y temas de Zhihu sobre YouTube), por lo que no se incluyen como fuentes. No se han encontrado papers, blogs ni repositorios adicionales en la información disponible.
