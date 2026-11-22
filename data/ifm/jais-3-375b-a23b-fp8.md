# IFM/Jais-3-375B-A23B-FP8

## Resumen

Jais-3-375B-A23B-FP8 es la versión cuantizada en FP8 del modelo insignia de la familia Jais-3, desarrollado por IFM (Inception42). Se trata de un transformer disperso de tipo Mixture-of-Experts (MoE) que almacena 375.000 millones de parámetros y activa 23.000 millones por token, con una ventana de contexto de 512K tokens. Está diseñado específicamente para el bilingüismo árabe-inglés, un nicho tradicionalmente mal cubierto por los grandes modelos occidentales y chinos.

El modelo base (inception42/Jais-3-375B-A23B) se distribuye con licencia Apache 2.0 y pesos abiertos, lo que lo convierte en una de las pocas alternativas de gran escala con cobertura nativa del árabe. Esta variante FP8 reduce la huella de memoria y acelera la inferencia en hardware compatible con FP8, manteniendo un rendimiento cercano al del modelo BF16 original según las evaluaciones del autor.

La relevancia actual del modelo radica en tres factores: su tamaño (375B totales con solo 23B activos, lo que abarata la inferencia frente a modelos densos equivalentes), su contexto de 512K tokens y su enfoque bilingüe árabe-inglés, que lo posiciona como candidato para despliegues regionales y para investigación en modelos multilingües de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) |
| Parametros totales | 379.167.159.168 (~375B) |
| Parametros activos | 23B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 (expertos enrutados: pesos estáticos FP8 con escala por bloque 128x128; activaciones dinámicas FP8 con escala por grupo 1x128); resto de capas en BF16 |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con capas de mezcla de expertos (MoE) dispersa. De los 375B parámetros totales, solo 23B se activan por token, lo que reduce el coste computacional de la inferencia a niveles comparables a un modelo denso de ~23B. La arquitectura incluye tres capas densas iniciales, seguidas de capas MoE con expertos enrutados y expertos compartidos. El tamaño intermedio de los expertos enrutados es de 1792.

La versión FP8 cuantiza únicamente las capas lineales de los expertos enrutados. Las capas de atención, los expertos compartidos, los routers, las tres primeras capas densas y el `lm_head` se mantienen en BF16. Esta estrategia de cuantización selectiva busca preservar la precisión en los componentes críticos (atención, routing) mientras reduce el peso de los expertos, que concentran la mayor parte de los parámetros.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El model card no incluye estos datos. La innovación técnica destacable es la cuantización FP8 con escalas por bloque (128x128 para pesos, 1x128 para activaciones), que permite un equilibrio entre compresión y fidelidad numérica.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento y respuesta a instrucciones (el tag `conversational` sugiere ajuste para diálogo).
- Procesamiento de contexto largo: hasta 512K tokens, adecuado para documentos extensos, historiales de conversación o corpus legales.
- Capacidades multilingües limitadas a árabe e inglés; no se documentan otros idiomas.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta soporte de agentes o multi-step reasoning de forma explícita.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 512K tokens de ventana, manteniendo coherencia en diálogos extensos y en registros formales e informales del árabe.
- Procesamiento de documentos legales o administrativos en árabe: resumen, extracción de cláusulas y respuesta a preguntas sobre contratos o expedientes de gran longitud, aprovechando el contexto extendido.
- Generación de contenido editorial bilingüe: redacción y traducción de artículos, informes o material de marketing entre árabe e inglés con un único modelo, evitando pipelines de traducción separados.
- Investigación en PLN árabe: evaluación de modelos MoE de gran escala en tareas de comprensión lectora, análisis de sentimiento o generación en árabe, con pesos abiertos y licencia permisiva.
- Asistentes conversacionales regionales: despliegue de chatbots para mercados de Oriente Medio y Norte de África donde el árabe es idioma principal y el inglés es secundario.
- Análisis de corpus largos: indexación semántica, resumen jerárquico o búsqueda aumentada sobre colecciones documentales de hasta cientos de miles de tokens por consulta.
- Fine-tuning supervisado: al ser Apache 2.0 y con pesos abiertos, sirve como base para ajuste en dominios específicos (salud, legal, finanzas) en árabe.

## Benchmarks y rendimiento

El model card incluye una tabla comparativa con modelos de referencia (Qwen3.5-397B-A17B, MiniMax M3, Qwen3.8-Flash-Next, NVIDIA Nemotron 3 Ultra) que muestra parámetros totales, parámetros activos y arquitectura, pero no se han publicado en la información disponible los valores numéricos de benchmarks como MMLU, HumanEval o GSM8K. El autor indica que el modelo FP8 "rinde de forma cercana al modelo BF16 original en nuestras evaluaciones", sin cuantificar.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 375 GB solo en pesos (379.167 millones de parámetros a 1 byte por parámetro, más las capas en BF16 que añaden overhead). El repo completo pesa 781,1 GB, lo que incluye posibles artefactos adicionales.
- GPU recomendadas: se requiere un nodo multi-GPU. Con FP8, son necesarias al menos 4 GPU de 96 GB (H100/H200) o 8 GPU de 80 GB (A100/H100) para alojar los pesos, más margen para KV cache y activaciones.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU profesional.
- Opciones de despliegue: transformers (librería declarada), con soporte de `compressed-tensors` para la cuantización FP8. El model card advierte que el tamaño intermedio de los expertos enrutados (1792) no es divisible en bloques de cuantización de 128 en los tamaños habituales de tensor parallelism (TP=4, TP=8), por lo que se requiere expert parallelism (EP) para el despliegue.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que FP8 permite "inferencia más rápida en hardware compatible con FP8", sin cifras.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Arquitectura | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| Jais-3-375B-A23B-FP8 | 375B | 23B | MoE | 512K | Apache 2.0 | ar, en |
| Qwen3.5-397B-A17B | 397B | 17B | MoE | no disponible | no disponible | no disponible |
| MiniMax M3 | 428B | 23B | MoE | no disponible | no disponible | no disponible |
| NVIDIA Nemotron 3 Ultra | 550B | 55B | MoE | no disponible | no disponible | no disponible |

Los datos de contexto, licencia e idiomas de los modelos de referencia no aparecen en la información proporcionada. La comparativa se limita a los parámetros y arquitectura que el model card incluye en su tabla.

## Limitaciones y advertencias

- Cobertura lingüística restringida a árabe e inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se documentan mitigaciones específicas.
- Sesgos potenciales derivados de los datos de entrenamiento, cuya composición no se detalla; puede haber sesgos culturales, religiosos o políticos relevantes en el contexto árabe.
- La cuantización FP8, aunque selectiva, puede introducir degradaciones numéricas no cuantificadas en el model card; el autor afirma que el rendimiento es "cercano" al BF16 pero no publica métricas comparativas.
- Restricción de despliegue: la cuantización por bloques de 128 en expertos con dimensión intermedia 1792 impide el tensor parallelism habitual y obliga a expert parallelism, lo que limita las opciones de infraestructura.
- Requisitos de hardware muy elevados (múltiples GPU de 80-96 GB), lo que excluye el despliegue en entornos de consumo o de una sola GPU.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento (no documentadas).
- No se documentan mecanismos de seguridad, filtros de contenido ni evaluaciones de red teaming.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-375B-A23B-FP8
- Modelo base: https://huggingface.co/inception42/Jais-3-375B-A23B
- Paper (referencia arXiv en tags): arxiv:2611.10224
- Imagen de benchmarks: https://huggingface.co/IFM/Jais-3-375B-A23B-FP8/resolve/main/assets/jais-3-375b-a23b-benchmarks.png
