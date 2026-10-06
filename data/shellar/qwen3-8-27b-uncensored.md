# Shellar/Qwen3.8-27B-Uncensored

## Resumen

Shellar/Qwen3.8-27B-Uncensored es una redistribución en cuantizaciones GGUF del fine-tune DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, cuyo origen último es el modelo Qwen3.8-27B. El repositorio ocupa 389 GB e incluye 26.895.998.464 parámetros (~26,9B), con licencia Apache-2.0 y pipeline declarado image-text-to-text, lo que indica que conserva las capacidades multimodales de la familia base.

El linaje al que pertenece persigue dos objetivos explícitos: eliminar los comportamientos de rechazo mediante técnicas de abliteration ("heretic") y reducir el consumo de tokens de razonamiento entre un 50% y un 90% según el autor, de ahí la etiqueta "TURBO". El autor de la cadena original afirma que es el primer fine-tune de este tamaño en superar los 730 puntos ARC-C en cuantización de 8 bits y los 718 en 4 bits.

La relevancia actual del repositorio es práctica: empaqueta en formato GGUF, con variantes "regular" y MTP (multi-token prediction) y matrices imatrix, un modelo multimodal de ~27B pensado para ejecutarse en hardware de consumo, algo que con los pesos en bfloat16 (~55 GB) resulta inviable en GPUs domésticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3.8-27B: 64 capas y vocabulario de 248.320 tokens, segun repos relacionados de la misma familia |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | 262.144 tokens (dato de repos relacionados de la misma familia Qwen3.8-27B; no confirmado en este repositorio) |
| Tipos de cuantizacion | GGUF regular y GGUF MTP, ambos con matrices imatrix; pesos base en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos base) y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 64 capas con vocabulario de 248.320 tokens y torre de visión, según la información publicada en repos de la misma familia. Sobre esa base, el linaje aplica una cadena de ajuste declarada como multi-stage tune, multi-fine-tune y multi-stage merge, empleando los métodos propietarios COLD FUSION (combinación de "GAIN" con los entrenadores de Unsloth) y Fable Fusion 711. El componente GAIN se describe como un mecanismo de programación que altera dinámicamente el entrenamiento muestra a muestra en tiempo real, conforme el modelo aprende.

Los conjuntos de datos citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El autor declara explícitamente ausencia de "benchmaxing" y objetivos centrados en elevar los benchmarks núcleo, reformatear y comprimir los bloques de razonamiento y acelerar la generación. No se proporciona el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación declarada más relevante es el soporte MTP (multi-token prediction) en las cuantizaciones GGUF, orientado a incrementar el throughput en runtimes compatibles, junto con la reducción de tokens de pensamiento (mediana aproximada de dos tercios, con picos de hasta un noveno).

## Capacidades

- Generación de texto general y conversación multi-turno.
- Modo de razonamiento explícito ("thinking"), con tres modos de operación declarados por el autor.
- Generación de código, según la etiqueta "coder" del repositorio.
- Escritura creativa, ficción, narrativa de género y roleplay, áreas en las que el autor concentra los ejemplos de la model card.
- Capacidades multimodales de entrada imagen-texto; una guía de terceros sobre variantes de la misma familia menciona también vídeo.
- Tool calling y function calling: la model card remite a la pestaña "community" para benchmarks de terceros que, según el autor, registrarían "el mejor rendimiento de tool calling jamás registrado". Es una afirmación no verificada en la información disponible.
- Decodificación acelerada mediante MTP en runtimes compatibles.
- Soporte multilingüe limitado a inglés y chino.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está ajustado específicamente para ficción y géneros variados, y con 262.144 tokens de contexto puede mantener arcos argumentales completos sin perder coherencia entre capítulos.
- Roleplay y asistentes de personaje: la ausencia de comportamientos de rechazo permite diálogos sin interrupciones moralizantes, útil en entornos de entretenimiento con moderación externa.
- Generación de código en pipelines internos: la etiqueta "coder" y el soporte de tool calling lo hacen utilizable como asistente de refactorización o generación de tests integrado en CI/CD, siempre con revisión humana.
- Atención al cliente bilingüe inglés-chino: con contexto largo puede mantener el historial completo de una conversación y documentación de producto adjunta en una sola ventana.
- Análisis de documentación técnica extensa con imágenes: la combinación de ventana de 262.144 tokens y entrada de imagen permite procesar manuales, diagramas y capturas en una misma consulta.
- Investigación en alineación y red teaming: al ser un modelo abliterated, sirve como objeto de estudio para medir qué comportamientos se eliminan al intervenir los pesos y qué capacidades se degradan.
- Traducción en/zh asistida: aunque no es su objetivo principal, el par inglés-chino está cubierto de forma nativa.
- Extracción estructurada de información de informes largos con salida controlada mediante herramientas.

## Benchmarks y rendimiento

El autor de la cadena original publica cifras de ARC-C y ARC-E, pero no de MMLU, HumanEval, GSM8K ni otros benchmarks habituales. La escala empleada no se especifica en la información disponible.

| Benchmark | 8 bits | 4 bits | Nota |
|---|---|---|---|
| ARC-C | 735 | 719 | Cifra declarada por el autor; escala no especificada |
| ARC-E | 880 | no disponible | Cifra declarada por el autor; escala no especificada |

Afirmaciones cualitativas del autor, no acompañadas de tabla numérica: el modelo superaría a Qwen3.8-27B base en los siete benchmarks que considera críticos, así como a Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B. También declara una reducción de tokens de pensamiento de entre la mitad y un noveno respecto al Qwen3.8-27B sin ajustar. No se han encontrado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- bfloat16: aproximadamente 55 GB de VRAM para pesos, según la ficha de una variante de la misma arquitectura. Requiere A100 80 GB, H100 o varias GPUs en paralelo.
- GGUF Q8: estimación de ~27-29 GB solo para pesos, más overhead de contexto. Fuera de una RTX 4090 de 24 GB; encaja en A100 40/80 GB o en configuraciones duales de consumo.
- GGUF Q4_K_M: estimación de ~16-17 GB para pesos. Cabe en RTX 4090, RTX 3090, RTX 4080 y GPUs de 16-24 GB, con contexto recortado.
- GGUF Q5_K_M: estimación de ~18-19 GB. Ajustado en 24 GB, cómodo en 32 GB.
- El repositorio de 389 GB incluye múltiples niveles de cuantización; conviene descargar únicamente el archivo GGUF necesario.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime GGUF compatible con MTP para aprovechar la aceleración multi-token. Para los pesos safetensors, vLLM o TGI en hardware con VRAM suficiente.
- Latencia y throughput: no disponibles. La model card afirma mejoras de velocidad derivadas de la reducción de tokens de pensamiento y del modo MTP, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shellar/Qwen3.8-27B-Uncensored | 26,9B | 262.144 (heredado, no confirmado en el repo) | Apache-2.0 | safetensors, GGUF | Redistribución cuantizada con MTP e imatrix |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27B | no disponible | no disponible | no disponible | Modelo padre directo de esta distribución |
| JonathanColetti/Qwen3.8-27B-Uncensored | ~27B | 262.144 | no disponible | bfloat16 | Variante no censurada de la misma base; ~55 GB de VRAM |
| Qwen/Qwen3.8-27B | ~27B | 262.144 (por confirmar) | no disponible | no disponible | Modelo base original, con filtros de seguridad activos |
| Qwen3.6-35B-A3B | 35B totales (MoE) | no disponible | no disponible | no disponible | Citado por el autor como superado en sus benchmarks; parámetros activos no disponibles |

## Limitaciones y advertencias

- Modelo abliterated: los caminos de rechazo han sido eliminados de los pesos. Puede generar contenido ofensivo, ilegal o dañino sin filtros internos. No es desplegable en aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo de alucinación no cuantificado: no hay datos de evaluación independiente sobre fidelidad factual.
- Idiomas: únicamente inglés y chino. El rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Cifras de benchmarks autoinformadas por el autor, con escalas no especificadas y sin verificación de terceros. Deben tratarse como marketing hasta que exista replicación independiente.
- La reducción agresiva de tokens de razonamiento puede degradar el rendimiento en tareas que requieren cadenas de pensamiento largas, como matemáticas competitivas o depuración compleja.
- Licencia Apache-2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de las políticas de los proveedores de cloud, muchos de los cuales prohíben modelos sin filtros.
- Estado del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, sin validación de la comunidad ni issues públicos.
- Tamaño del repositorio: 389 GB, con requisitos de almacenamiento y ancho de banda considerables para la descarga completa.
- Consistencia de la información: la fecha de creación declarada (octubre de 2026) y la existencia de una familia Qwen3.8, Qwen3.6 y Qwen3.5 no se pueden contrastar con fuentes públicas conocidas, por lo que conviene verificar la procedencia real de los pesos antes de integrarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shellar/Qwen3.8-27B-Uncensored
- Modelo base del linaje: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Linaje previo del método Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante no censurada de la misma base: https://featherless.ai/models/JonathanColetti/Qwen3.8-27B-Uncensored
- Guía de requisitos de hardware y LM Studio: https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/
- Comparativa de variantes no censuradas: https://note.com/deepent/n/n23edda76898e?hl=en
- Guía de despliegue local con Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
