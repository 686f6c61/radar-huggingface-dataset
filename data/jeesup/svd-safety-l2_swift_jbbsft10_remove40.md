# Jeesup/svd-safety-l2_swift_jbbsft10_remove40

## Resumen

svd-safety-l2_swift_jbbsft10_remove40 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup en HuggingFace. No es un modelo de propósito general ni un asistente desplegable: es una celda concreta de una batería de experimentos (grid) que estudia cómo la compresión por descomposición en valores singulares (SVD-LLM) degrada el comportamiento de seguridad de un LLM y qué reglas de selección de componentes permiten repararlo. En concreto, este checkpoint corresponde a un 40,00 % de parámetros eliminados (fracción resultante 0,5998) y un presupuesto de restauración del 0,000 %, es decir, sin restaurar ningún componente.

La arquitectura subyacente es la de Llama 2 (transformer decoder-only) y los pesos se distribuyen en formato safetensors bajo la librería transformers, con un tamaño de repositorio de 13,5 GB. El modelo base está alineado mediante el pipeline de instrucciones de Llama 2 Chat (SFT más RLHF), sobre el que se aplica la compresión SVD. La semilla declarada para el proceso es 42.

Su relevancia es metodológica, no de producto: proporciona métricas publicadas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro medido con WildGuard y perplejidad en WikiText-2, lo que permite cuantificar el trade-off seguridad/utilidad bajo compresión y servir como sujeto experimental o baseline negativo en estudios de seguridad e interpretabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con compresión SVD-LLM aplicada a los componentes del modelo |
| Parámetros totales | 6.738.415.616 (~6,74 B) según los metadatos de safetensors; la model card declara una fracción resultante de 0,5998 de los parámetros densos del modelo base (discrepancia no explicada en la documentación) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Llama-2-7b-chat emplea 4096 tokens |
| Tipos de cuantización | no disponible; el repositorio publica safetensors con un tamaño (13,5 GB) compatible con pesos fp16 |
| Idiomas soportados | no disponible; el modelo base está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers, pipeline text-generation) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-2-7b-chat-hf, un transformer decoder-only de 7 B parámetros con normalización RMSNorm, activación SwiGLU y atención causal multi-cabeza, alineado para diálogo mediante supervisión de instrucciones y RLHF por parte de Meta. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares los pesos de las capas lineales y trunca los componentes de menor rango para reducir el número de parámetros efectivos. En esta celda se elimina el 40,00 % de los parámetros (fracción resultante 0,5998).

La particularidad de esta celda es que el presupuesto de restauración es del 0,000 %: no se reincorpora ningún componente SVD previamente descartado (0 componentes restaurados y 0 sustituidos). La regla de selección de componentes aparece registrada como `unknown` en la model card, lo que limita la interpretabilidad del experimento desde fuera del grid original. El proceso se ejecuta con semilla 42. No se documentan en la información disponible los tokens de entrenamiento, la composición del dataset de la fase de compresión ni si hubo etapas adicionales de ajuste fino, RLHF o DPO sobre el checkpoint comprimido. No se describe ninguna innovación de decodificación (decodificación especulativa, atención lineal, SSM u otras).

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-2-7b-chat, pero degradada de forma no cuantificada en la documentación más allá de las métricas publicadas.
- Comprensión y generación en inglés principalmente, al heredar el perfil idiomático de Llama 2; el resto de idiomas no está documentado.
- Su función real es servir de sujeto experimental para medir comportamiento de seguridad: utilidad como generador de texto de propósito general no evaluada.
- Uso como artifacto de interpretabilidad: permite estudiar qué subespacios de pesos SVD están asociados al comportamiento de rechazo y a la utilidad del modelo.
- Capacidad de formar parte de una ablación controlada: comparación entre reglas de selección de componentes y presupuestos de restauración (0 %, 40 %, etc.) dentro del mismo grid experimental.
- No se documenta soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documenta soporte multilingüe más allá del heredado del modelo base.
- No se ha publicado ningún tipo de ficha de capacidades adicional, plantilla de prompt recomendada o ajuste específico de chat más allá del heredado.

## Casos de uso

- Medición del impacto de la compresión en la seguridad: el checkpoint permite ejecutar AdvBench y StrongREJECT con un juez HarmBench y comparar el ASR obtenido (0,0365 y 0,0415 respectivamente) frente a otras celdas del grid y frente al modelo sin comprimir.
- Ablación de reglas de selección de componentes SVD: al ser una celda con regla `unknown` y presupuesto de restauración 0,000 %, sirve como punto de referencia para evaluar si otras reglas de selección reducen el ASR a igualdad de presupuesto.
- Cuantificación del sobre-rechazo: la métrica de over-refusal macro medida con WildGuard (0,3541) permite analizar si la compresión aumenta los rechazos indebidos en peticiones benignas, un fallo de utilidad tan relevante como el de seguridad.
- Análisis de degradación de la calidad lingüística: la perplejidad en WikiText-2 (11,5992) permite situar esta celda en una curva de degradación frente al porcentaje de parámetros eliminados, útil para estudiar umbrales de compresión aceptables.
- Investigación en interpretabilidad de mecanismos de seguridad: comparar los subespacios SVD eliminados en esta celda con los de celdas que preservan la seguridad ayuda a localizar dónde reside el comportamiento de rechazo en el modelo.
- Baseline negativo en evaluaciones de red teaming y pipelines de evaluación de seguridad: al ser un modelo deliberadamente degradado en varios brazos del estudio, resulta útil como control inferior en baterías de test de robustez adversarial.
- Reproducibilidad metodológica: con semilla 42 y provenance documentada (modelo base, ratio de compresión, presupuesto de restauración), sirve para replicar experimentos de compresión SVD-LLM y verificar resultados publicados.
- Docencia y divulgación sobre trade-offs compresión/seguridad: ilustra de forma medible que reducir parámetros no es neutral respecto a la alineación de seguridad, sino que tiende a elevar la tasa de éxito de ataques.

Ninguno de estos casos implica despliegue en producción como asistente; el propio autor indica que debe tratarse como sujeto experimental.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,0365 | HarmBench judge |
| StrongREJECT ASR | 0,0415 | HarmBench judge |
| Sobre-rechazo macro (over-refusal) | 0,3541 | WildGuard |
| Perplejidad en WikiText-2 | 11,5992 | no especificado |

No se han publicado en la información disponible los resultados del modelo base sin comprimir ni de otras celdas del grid, por lo que no es posible presentar aquí una comparación cuantitativa directa del delta de degradación. Tampoco se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo de pesos, más caché KV y activaciones; en la práctica requiere del orden de 16-20 GB de VRAM para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos.
- GPUs de centro de datos adecuadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB); sobran recursos para el checkpoint en fp16.
- GPUs de consumo compatibles en fp16: RTX 4090 (24 GB), RTX 3090 (24 GB), y con margen ajustado en RTX 4080 (16 GB). En 4 bits cabría en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repositorio está etiquetado como endpoints_compatible), vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token. Al ser un modelo de ~6,7 B parámetros densos comprimido, el coste por token sería del mismo orden que un 7 B estándar en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de seguridad comparables |
|---|---|---|---|---|---|
| svd-safety-l2_swift_jbbsft10_remove40 | 6,74 B (metadatos; 59,98 % de la densidad declarada) | no disponible | Llama 2 Community License | HuggingFace, safetensors | AdvBench ASR 0,0365; StrongREJECT ASR 0,0415 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B densos | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors | no disponibles en la información proporcionada |
| meta-llama/Llama-2-13b-chat-hf | 13 B densos | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors | no disponibles en la información proporcionada |
| Mistral-7B-Instruct-v0.3 | 7,2 B densos | 32 768 tokens | Apache 2.0 | HuggingFace, safetensors/GGUF | no disponibles en la información proporcionada |

La comparación con alternativas se limita a parámetros, contexto, licencia y disponibilidad, porque no se han publicado en la información disponible métricas de seguridad o de capacidad equivalentes para los modelos de la tabla. En términos de propósito, este checkpoint no compite con asistentes desplegables: su categoría real es la de artifacto de investigación en compresión y seguridad, donde no se han identificado alternativas públicas equivalentes en la información consultada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor indica explícitamente que es un sujeto experimental, no un asistente desplegable, y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada por diseño en varios brazos del grid: la compresión por sí sola eleva la tasa de éxito de ataques según la model card, por lo que no debe usarse en producción ni exponerse a usuarios finales.
- Sesgos: no documentados, pero se heredan los del modelo base Llama-2-7b-chat; no se ha realizado ninguna evaluación de sesgo específica sobre este checkpoint.
- Riesgo de alucinación: elevado y no cuantificado; la única métrica de calidad publicada es la perplejidad en WikiText-2 (11,5992), que no mide fidelidad factual.
- Sobre-rechazo elevado: el 0,3541 de over-rechazo macro medido con WildGuard indica que una fracción relevante de peticiones benignas sería rechazada, un problema de utilidad además del de seguridad.
- Limitaciones de idioma: el modelo base está optimizado para inglés; no hay evaluación multilingüe para esta celda.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva tras la compresión; debe verificarse empíricamente antes de usarla.
- Discrepancia de datos: los metadatos de safetensors declaran 6.738.415.616 parámetros, idéntico al modelo base sin comprimir, mientras la model card declara una fracción resultante de 0,5998; esta inconsistencia no está explicada y debe resolverse antes de asumir un tamaño efectivo concreto.
- Regla de selección no trazable: aparece registrada como `unknown`, lo que dificulta reproducir exactamente el criterio de selección de componentes.
- Restricciones de licencia: se rige por la Llama 2 Community License, que impone condiciones de uso (incluida la cláusula de escala para productos con más de 700 millones de usuarios mensuales), obligaciones de atribución y requisitos de redistribución de LICENSE.txt y USE_POLICY.md. El uso comercial está condicionado al cumplimiento de dicha licencia.
- Métricas con posible variabilidad: los ASR dependen del juez utilizado (HarmBench) y del conjunto de prompts; no se documentan intervalos de confianza ni número de muestras.
- Sin mantenimiento ni soporte: repositorio con 0 descargas y 0 likes en el momento del análisis, sin garantía de actualización.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbsft10_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida como LICENSE.txt en el repositorio, junto con USE_POLICY.md
- Paper de SVD-LLM: no disponible en la información proporcionada
- Blog o demo del autor: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos (comparativas genéricas entre asistentes comerciales y artículos de astrología) no guardan relación con este modelo
