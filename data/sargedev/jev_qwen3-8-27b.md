# SargeDev/Jev_Qwen3.8-27B

## Resumen

Jev_Qwen3.8-27B es un ajuste fino publicado por SargeDev sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated, es decir, sobre una variante "abliterated" (con la dirección de rechazo atenuada) del modelo de la familia Qwen. El resultado es un merge completo en bf16 del modelo base más un adaptador QLoRA fusionado, entrenado con el corpus SargeDev/jev-distill-corpus-v3. El modelo tiene 26.895.998.464 parámetros (unos 26,9 B) y se distribuye en safetensors bajo licencia Apache-2.0, con el inglés como único idioma declarado.

El objetivo declarado no es el asistente generalista, sino el juicio breve y calibrado: emitir una decisión, adjuntar un nivel de confianza honesto y señalar explícitamente cuándo una situación es un empate real, en lugar de refugiarse en respuestas ambiguas. Para ello se destilaron 45.000 filas de juicio en lenguaje natural a partir de un corpus de decisiones tipadas de 741.000 filas con esquema noul / choice / score.

Su interés ahora es doble: por un lado, documenta un patrón de ajuste poco común (destilación de un motor de decisión estructurado a lenguaje natural); por otro, es un modelo sin censura con cero descargas y cero valoraciones en el momento de la consulta, lo que implica que no existe validación independiente de las afirmaciones de su model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta de arquitectura qwen3_5_text); número de capas, cabezas y tipo de atención no disponible |
| Parametros totales | 26.895.998.464 (≈26,9 B), según los pesos safetensors |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16. No hay cuantizaciones GGUF, AWQ, GPTQ ni MLX publicadas |
| Idiomas soportados | Inglés (en). Otros idiomas no disponibles |
| Licencia | apache-2.0 (declarada por el autor en la ficha) |
| Formato de pesos | safetensors (merge completo en bf16) |
| Plantilla de chat | Estilo Qwen3.5; entrenado con `enable_thinking=false` |
| Tamaño del repositorio | 53,8 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated |
| Corpus de ajuste | SargeDev/jev-distill-corpus-v3 |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadato) | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base de la familia Qwen etiquetada como qwen3_5_text, un transformer decoder-only, pero la ficha no detalla número de capas, dimensiones ocultas, cabezas de atención ni mecanismos concretos (atención lineal, decodificación especulativa, etc.), por lo que esos datos quedan como no disponibles. El modelo final es un merge completo en bf16 del base más el adaptador, sin cuantización en los pesos distribuidos.

El entrenamiento se realizó con QLoRA: cuantización 4-bit NF4 con doble cuantización, rango r=64, alpha=128, optimizador paged_adamw_8bit y pérdida calculada solo sobre la completion (completion-only loss). El corpus consta de 45.000 filas en lenguaje natural, estratificadas por tipo y familia, disjuntas del split usado por el evaluador JSON; el autor indica que se completaron 900 pasos (unos 26.000 filas), con scheduler coseno hasta cero y una sola época. El hardware de entrenamiento fue una NVIDIA GB10 (clase DGX Spark). La innovación técnica destacable no está en la arquitectura sino en el procedimiento: convertir decisiones tipadas de un esquema estructurado (noul, choice, score) en comportamiento conversacional de juicio con confianza declarada, preservando según el autor las capacidades generales del base al tratarse de un merge LoRA de rango 64.

## Capacidades

- Juicio binario calibrado: responde sí/no acompañado de un nivel de confianza explícito, en lugar de una respuesta categórica sin matices.
- Juicio multiopción: reparte opciones con spreads de probabilidad o preferencia, incluyendo la salida de empate genuino ("toss-up").
- Reconocimiento de incertidumbre: el ajuste está orientado a declarar cuándo no hay base suficiente para decidir.
- Generación de texto general: heredada del modelo base; el autor afirma que las capacidades generales permanecen intactas tras el merge, aunque no se aportan mediciones independientes.
- Modo thinking: la plantilla admite `enable_thinking`; el modelo fue entrenado con el pensamiento desactivado, y activarlo produce un bloque de razonamiento previo a la respuesta, con un comportamiento distinto del ajustado.
- Ausencia de rechazo por defecto: al derivar de un modelo abliterated y llevar la etiqueta "uncensored", no aplica los mecanismos habituales de negativa ante peticiones sensibles.
- Tool calling / function calling: no disponible (no documentado en la ficha).
- Uso como agente o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Visión o audio: no disponible (la etiqueta qwen3_5_text indica una ruta exclusivamente de texto).

## Casos de uso

- Motor de decisión con umbral de confianza: el modelo devuelve una decisión y una confianza asociada, de modo que un sistema puede auto-aprobar los casos con confianza alta y enrutar el resto a revisión humana, reduciendo carga de revisión sin silenciar la incertidumbre.
- Triaje de registros en pipelines de datos: clasificar entradas como válidas o no válidas, o asignar categorías de un conjunto cerrado, aprovechando el formato de salida breve y tipado que se le enseñó.
- Pre-etiquetado asistido para anotación humana: generar etiquetas con score y marcar explícitamente los casos ambiguos para que el anotador se centre en ellos, en lugar de revisar la totalidad del lote.
- Priorización interna de backlog o tickets: pedirle una llamada razonada sobre qué elemento atender primero y con qué grado de certeza, útil en herramientas internas donde el coste de equivocarse es bajo y la velocidad importa.
- Comparación por pares con detección de empates: evaluar dos opciones (respuestas de modelos, variantes de copy, propuestas) y permitir la salida "empate" en vez de forzar un ganador artificial.
- Investigación sobre calibración y sobreconfianza: estudiar cómo un modelo ajustado para declarar confianza se comporta frente a un base sin ajustar, midiendo la desviación entre confianza declarada y acierto real en conjuntos propios.
- Red teaming y evaluación de seguridad: al ser un modelo sin censura, sirve como sujeto de pruebas para medir qué produce un modelo abliterated en dominios sensibles, siempre dentro de un marco de uso y cumplimiento legal.
- Asistentes conversacionales en inglés con tono directo: aplicaciones donde se prefiere una respuesta corta y decidida frente a respuestas evasivas, aunque conviene delimitar el dominio para evitar los riesgos del ajuste sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card se limita a una afirmación cualitativa: en filas reservadas del corpus, las respuestas sí/no y los repartos multiopción quedan "mensurablemente más cerca" de los objetivos de referencia que el mismo base en zero-shot, sin cifras ni metodología publicada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluación de calibración en corpus propio | Afirmada cualitativamente, sin cifras publicadas |
| Comparación con el modelo base | Solo declaración del autor; sin tabla de resultados |

## Requisitos de hardware

- VRAM en bf16: los pesos suman 53,8 GB, por lo que la inferencia en bf16 requiere al menos unos 56-60 GB contando caché KV y overhead del runtime.
- GPU recomendadas en bf16: A100 80 GB, H100 80 GB o H200 en una sola tarjeta; también 2x A6000 48 GB, 2x L40S 48 GB o 2x RTX 4090 24 GB con paralelismo tensorial.
- Cabe en GPU de consumo: no en bf16. En 4-bit la estimación ronda los 14-16 GB, lo que sí cabría en RTX 4090, RTX 3090, RTX 4080 y similares, pero esa cuantización no está publicada y habría que generarla.
- Opciones de despliegue: vLLM o TGI para los safetensors en bf16. llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, algo que el autor no proporciona. Transformers con `device_map="auto"` es la vía más directa para pruebas.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia publicados, y el repositorio no incluye mediciones de serving.
- Ajuste de plantilla: para reproducir el comportamiento ajustado hay que servir con `enable_thinking=false`; con el modo thinking activo el primer bloque generado es de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| SargeDev/Jev_Qwen3.8-27B | 26,9 B | No disponible | apache-2.0 | 0 descargas, 0 likes | QLoRA de juicio calibrado fusionado sobre base abliterated, solo inglés |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ≈27 B (según denominación) | No disponible | No disponible | Modelo base público | Base abliterated sin el ajuste de decisión; conserva el comportamiento general del original |
| Modelo upstream de Qwen (familia Qwen3.5) | No disponible | No disponible | No disponible | Modelo base público | Referencia original con alineación intacta; punto de comparación para evaluar el efecto de la abliteración y del ajuste |

No se dispone de datos de rendimiento comparados entre estas alternativas, por lo que la comparación se limita a parámetros, licencia y naturaleza del ajuste. Tampoco se han identificado en la información proporcionada otros modelos de la misma categoría (motores de juicio calibrado destilados) con los que contrastarlo.

## Limitaciones y advertencias

- Sesgos heredados: el modelo arrastra los sesgos del corpus de destilación (45.000 filas generadas por el propio autor, sin auditoría externa) y del modelo base abliterated.
- Alucinación y calibración no verificada: la confianza declarada es un comportamiento aprendido, no una probabilidad calibrada de forma empírica; puede expresar confianza alta en juicios incorrectos. No hay evaluación independiente publicada.
- Idioma: únicamente inglés declarado; el comportamiento en castellano u otros idiomas no está documentado y es probable que degrade el ajuste de juicio.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia: el autor declara Apache-2.0, pero el modelo deriva de una cadena de modelos de terceros (huihui-ai y, aguas arriba, Qwen); conviene verificar los términos aplicables a cada eslabón antes de un uso comercial.
- Contenido sin filtrar: al ser un modelo abliterated y etiquetado como "uncensored", no aplica negativas por defecto. Su despliegue en producción exige controles de contenido externos y responsabilidad legal sobre las salidas.
- Modo thinking: activar el razonamiento cambia el comportamiento respecto al ajuste; si se espera el estilo de juicio calibrado, hay que servirlo con thinking desactivado.
- Validación inexistente: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni terceros que reproduzcan las afirmaciones de la model card.
- Anomalía de metadatos: la fecha de creación registrada es 2026-09-24, posterior a la fecha habitual de consulta; conviene comprobar la ficha por si el dato se corrige.
- Coste de inferencia: 53,8 GB de pesos en bf16 hacen inviable el despliegue en una sola GPU de consumo sin cuantización propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/Jev_Qwen3.8-27B
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relacionados con el modelo, únicamente páginas sin relación con el contenido técnico.
