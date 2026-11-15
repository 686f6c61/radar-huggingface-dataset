# antonpete/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF

## Resumen

Este modelo es una cuantización GGUF de un fine-tune comunitario sobre una base denominada Qwen3.8-27B, publicado por el usuario antonpete a partir del trabajo original de DavidAU. Combina tres capas de modificación: una base Qwen de 26.895.998.464 parámetros (aproximadamente 27B), un proceso de "abliteración"/destildado de alineación ("heretic"/"uncensored") y un sistema propietario de prompts y modos denominado Turbo Brilliance 50X V2 en su edición AGI, que añade modos de razonamiento, modos instruct y lo que el autor llama "constructos" de IA y AGI.

El modelo se distribuye exclusivamente en formato GGUF, con un repositorio de 246,5 GB que contiene múltiples niveles de cuantización, y está pensado para inferencia local con llama.cpp y derivados. La licencia declarada es Apache 2.0 y cubre 16 idiomas, entre ellos el español. El pipeline declarado es image-text-to-text, aunque la model card no documenta ninguna capacidad de visión real ni arquitectura multimodal; el dato procede únicamente de los metadatos.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo típico de fine-tune comunitario con nomenclatura inflada y afirmaciones de rendimiento no verificadas; por otro, sirve como caso de advertencia sobre la trazabilidad de modelos derivados, la validez de las licencias heredadas y la ausencia de benchmarks reproducibles. No se han publicado resultados de benchmarks verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8; detalles de atención y capas no disponibles) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en multiples niveles (el repo incluye imatrix; niveles concretos no disponibles) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 (declarada; ver limitaciones) |
| Formato de pesos | GGUF (repo de 246,5 GB); se menciona bfloat16 como precisión de origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de aproximadamente 27B parámetros, heredado de la familia Qwen3.8. La información disponible no detalla número de capas, dimensión oculta, tipo de atención (completa, GQA, sliding window), ni vocabulario. El pipeline declarado como image-text-to-text sugiere una posible componente multimodal, pero no hay ninguna evidencia en la model card ni en los tags que lo respalde; debe tratarse como dato no confirmado.

El entrenamiento descrito por el autor consiste en un fine-tune multi-etapa ("multi-stage tuning", "Cold Fusion", "GAIN Training") sobre el modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, usando tres datasets propietarios del autor (Polar-STRICT, F451-STRICT, FF711-STRICT). El proceso de "heretic" corresponde a una reducción deliberada de los mecanismos de rechazo y alineación del modelo base. El autor afirma mejoras de entre el 2 % y el 10 % en benchmarks, una reducción de aproximadamente un tercio en tokens de razonamiento en modo "xhigh", y la incorporación de un sistema de prompts con 27 modos de razonamiento, 27 modos instruct, 9 modos "xhigh" y 21 "constructos AGI". Ninguna de estas cifras está respaldada por una evaluación pública reproducible, y no se especifica el volumen de tokens de entrenamiento ni la composición de los datasets.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas, incluido el español.
- Modos de razonamiento seleccionables mediante prompt (27 modos de razonamiento, 9 modos "xhigh") y modos instruct sin tokens de pensamiento.
- "Constructos" de IA y AGI que el autor describe como perfiles de comportamiento (por ejemplo, constructo de agente, de programador, de profesor, de brainstorming).
- Generación de código y razonamiento matemático, según los tags del repositorio; sin evaluación publicada.
- Escritura creativa, ficción y roleplay, con ausencia deliberada de filtros de contenido.
- Sistema de ayuda interactivo activado escribiendo "help" en el chat.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión: no confirmadas pese al pipeline declarado.
- Soporte de agentes multi-paso: no documentado con detalle técnico.

## Casos de uso

- Generación de ficción y narrativa larga: el modelo está ajustado explícitamente para escritura creativa sin restricciones temáticas, lo que lo hace adecuado para borradores de novela, guiones y roleplay, con la salvedad de que la coherencia en contextos muy largos no está verificada.
- Prototipado de asistentes conversacionales en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin conexión, útil para entornos con requisitos de privacidad estrictos.
- Experimentación en investigación sobre alineación y desalineación: su condición de modelo "abliterado" lo convierte en un objeto de estudio para medir cómo varía la tasa de rechazo y la toxicidad respecto al modelo base.
- Generación de código en entornos de desarrollo aislados: los tags indican capacidad de programación, aunque sin benchmarks no debe asumirse paridad con modelos de código dedicados.
- Traducción y generación multilingüe entre los 16 idiomas declarados, con especial utilidad para combinaciones menos cubiertas como hindi, tailandés o indonesio.
- Evaluación comparativa de sistemas de prompts: el entramado de modos permite probar cómo distintos prefijos afectan a la longitud de razonamiento y al estilo de respuesta, útil para estudiar sensibilidad a instrucciones.
- Docencia y demostraciones sobre riesgos de modelos sin alineación: sirve para ilustrar en un aula o taller qué ocurre cuando se eliminan los filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. El autor afirma mejoras de entre el 2 % y el 10 % sobre la base Qwen3.8-27B y una reducción de un tercio en tokens de razonamiento en modo "xhigh", pero no se aportan tablas, conjuntos de evaluación ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,9B parámetros, una cuantización Q4_K_M requiere del orden de 16-17 GB; Q5_K_M en torno a 19-20 GB; Q8_0 cerca de 29 GB; y bfloat16 completa aproximadamente 54 GB. Estas cifras son estimaciones por tamaño de parámetros, no medidas publicadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para Q4 y Q5; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q8 y bfloat16; configuraciones multi-GPU para precisión completa.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 Super (16 GB, solo cuantizaciones bajas tipo Q3/Q4 con contexto recortado) y en tarjetas de 24 GB en general.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con la API de OpenAI; los tags indican "endpoints_compatible".
- Latencia y throughput: no disponibles. El autor afirma que los "constructos" reducen el tiempo neto de generación al disminuir los tokens de razonamiento, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (antonpete / DavidAU) | 26,9B | no disponible | apache-2.0 (declarada) | GGUF | Fine-tune sin alineación, sin benchmarks públicos |
| Qwen3.8-27B base (familia Qwen) | ~27B | no disponible | según modelo original | safetensors, GGUF | Referencia de comparación citada por el autor |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27B | no disponible | apache-2.0 (declarada) | safetensors | Modelo base directo de este GGUF |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | ~40B | no disponible | apache-2.0 (declarada) | GGUF | Versión mayor de la misma familia, citada en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de benchmarks reproducibles: las afirmaciones de mejora del 2-10 % y de reducción de tokens no están respaldadas por evaluaciones públicas.
- Modelo deliberadamente "abliterado": se han reducido los mecanismos de rechazo, por lo que puede generar contenido tóxico, ilegal o dañino sin filtros. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: los fine-tunes comunitarios multi-etapa sin evaluación tienden a degradar la fidelidad factual respecto al base.
- Nomenclatura engañosa: términos como "AGI", "Turbo Brilliance", "50x" o "NEO" son marcas comerciales del autor sin significado técnico medible.
- Licencia dudosa en la práctica: aunque se declara Apache 2.0, la cadena de derivación (Qwen base → fine-tune → GGUF) puede imponer condiciones adicionales; conviene verificar la licencia del modelo original antes de uso comercial.
- Contexto no documentado: se desconoce la ventana real de contexto, lo que impide planificar casos de uso con documentos largos.
- Capacidad multimodal no confirmada pese al pipeline image-text-to-text.
- Idiomas declarados sin evaluación: el soporte de español, hindi o tailandés es nominal y puede ser deficiente en la práctica.
- Repositorio de 246,5 GB: requiere espacio en disco considerable y descarga selectiva de la cuantización deseada.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación declarada en 2026, posterior a la fecha actual de referencia habitual; conviene tratar los metadatos temporales con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/antonpete/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor original: https://huggingface.co/DavidAU/collections
- Variante 40B de la misma familia: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 27B no "heretic": https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Variante 180B QNext "heretic": https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- Variante 180B QNext no "heretic": https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
- FAQs y soporte del autor original: https://huggingface.co/DavidAU/support
