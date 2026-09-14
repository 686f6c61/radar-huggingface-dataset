# Jeesup/svd-safety-mistral_keep70_gap_b001

## Resumen

svd-safety-mistral_keep70_gap_b001 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 al que se le ha aplicado una compresión SVD-LLM hasta conservar el 70,1 % de los parámetros densos, seguida de una restauración del 0,1 % del presupuesto de parámetros mediante componentes SVD seleccionados con la regla `gap`. Lo publica el usuario Jeesup en HuggingFace como artefacto de investigación, no como modelo conversacional de propósito general. Su razón de ser es medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

El modelo conserva la arquitectura transformer decoder-only de Mistral-7B-Instruct-v0.2, con 7.241.732.096 parámetros reportados por los safetensors del repositorio. La model card declara una fracción resultante de 0,7009 sobre parámetros densos, 1.229 componentes restaurados y 0 componentes sustituidos, con semilla 42. Se trata de una única celda de una rejilla experimental que barre reglas de selección y presupuestos de restauración.

Su relevancia actual es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, un eje poco documentado. Las métricas publicadas incluyen una tasa de éxito de ataque (ASR) de 0,5385 en AdvBench y 0,4281 en StrongREJECT, un macro de sobrerrechazo de 0,0580 medido con WildGuard y una perplejidad de 8,9538 en WikiText-2. El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2), con matrices comprimidas por SVD-LLM |
| Parametros totales | 7.241.732.096 (recuento real de safetensors); fracción densa resultante declarada: 0,7009 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card de este checkpoint; el modelo base Mistral-7B-Instruct-v0.2 admite 32 768 tokens con atención de ventana deslizante |
| Tipos de cuantizacion | No disponible: no se publican versiones cuantizadas en el repositorio (solo safetensors en el formato original) |
| Idiomas soportados | No disponible en la model card; sin declaración explícita de multilingüismo |
| Licencia | Apache 2.0 para este derivado; el repositorio del modelo base no incluye fichero de licencia redistribuible |
| Formato de pesos | safetensors (librería transformers) |

Datos de procedencia declarados por el autor: compresión SVD-LLM con un 29,91 % de parámetros eliminados, regla de selección `gap`, presupuesto de restauración del 0,100 % de los parámetros densos, 1.229 componentes restaurados, 0 componentes sustituidos y semilla 42. Tamaño del repositorio: 14,5 GB.

## Arquitectura y entrenamiento

El checkpoint parte de Mistral-7B-Instruct-v0.2 y aplica compresión por descomposición en valores singulares con el método SVD-LLM, que trunca los rangos de las matrices de pesos en lugar de cuantizarlas o podarlas de forma estructurada. Sobre ese modelo comprimido se restauran 1.229 componentes SVD adicionales, seleccionados por la regla `gap`, con un presupuesto equivalente al 0,1 % de los parámetros densos originales. No se realiza ningún reentrenamiento ni ajuste fino posterior: el resultado es una recomposición de componentes espectrales, no un modelo nuevo entrenado desde cero.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO en este checkpoint, más allá de lo heredado del modelo base. La innovación técnica que documenta el artefacto es el propio protocolo experimental: comparar reglas de selección de componentes (`gap` frente a otras del grid) y presupuestos de restauración para medir si es posible recuperar comportamiento de seguridad perdido por la compresión, usando como jueces HarmBench y WildGuard.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base, pero el autor advierte de que no debe tratarse como asistente desplegable.
- Comportamiento de rechazo ante peticiones dañinas: parcialmente degradado por la compresión; es precisamente el objeto de estudio del checkpoint.
- Métricas de seguridad medibles: AdvBench ASR, StrongREJECT ASR y macro de sobrerrechazo con WildGuard, útiles para comparar celdas de la rejilla.
- Evaluación de calidad de lenguaje: perplejidad calculable en WikiText-2 (8,9538 en este checkpoint).
- Soporte de tool calling / function calling: no documentado en la model card de este checkpoint; no se declara ni se descarta.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Auditoría de seguridad bajo compresión: usar el checkpoint como sujeto experimental para cuantificar cuánto sube la tasa de éxito de ataque cuando se elimina el 29,91 % de los parámetros densos, comparando el ASR de 0,5385 en AdvBench frente al del modelo sin comprimir.
- Investigación sobre reglas de selección de componentes SVD: la celda implementa la regla `gap` con un presupuesto del 0,1 %; sirve como punto de comparación reproducible (semilla 42) frente a otras reglas del mismo grid.
- Red teaming de pipelines de moderación: generar ataques que el modelo comprimido acepta con más frecuencia y emplearlos para validar si un clasificador de seguridad externo los detecta.
- Estudio del compromiso seguridad-utilidad: cruzar el macro de sobrerrechazo (0,0580) con la perplejidad en WikiText-2 (8,9538) para trazar la frontera entre daño de alineación y pérdida de calidad lingüística.
- Reproducción de experimentos de compresión espectral: dado que se publican la semilla, el presupuesto y el número de componentes restaurados, el checkpoint permite replicar el procedimiento SVD-LLM de extremo a extremo.
- Docencia en interpretabilidad y compresión de modelos: ilustra de forma tangible cómo una intervención puramente algebraica sobre los pesos altera un comportamiento funcional como el rechazo.
- Línea base negativa en evaluaciones de seguridad: al ser un modelo deliberadamente degradado, sirve como control inferior para calibrar arneses de evaluación como HarmBench o StrongREJECT.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,5385 | HarmBench judge |
| StrongREJECT ASR | 0,4281 | HarmBench judge |
| Macro over-refusal | 0,0580 | WildGuard |
| Perplejidad WikiText-2 | 8,9538 | WikiText-2 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los valores de ASR son tasas de éxito de ataque: cuanto más altas, peor comportamiento de seguridad. La model card no incluye la comparación numérica con el modelo base sin comprimir, solo la afirmación cualitativa de que la compresión por sí sola eleva la tasa de éxito de ataque.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp16/bf16): en torno a 14,5 GB solo de pesos, más overhead de activaciones y caché KV; presupuesto práctico de 16-20 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 7,5-8 GB de pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 4-5 GB de pesos; estas cuantizaciones no están publicadas y habría que generarlas a partir de los safetensors.
- GPU profesionales: A100 (40 u 80 GB), H100 (80 GB), L40S (48 GB) y A6000 (48 GB) ejecutan el modelo en fp16 sin problemas.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) lo ejecuta en fp16 con margen; una RTX 4080 o 4070 Ti (16 GB) requiere 8 bits o cuantizaciones menores; tarjetas de 12 GB o menos solo con cuantización de 4 bits.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference y endpoints compatibles (declarados en los tags); vLLM es viable para servirlo en fp16 sobre GPU; llama.cpp u Ollama requerirían convertir los pesos a GGUF previamente, algo no previsto en el repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mistral_keep70_gap_b001 | 7.241.732.096 (fracción densa 0,7009) | No declarado | AdvBench ASR 0,5385; StrongREJECT ASR 0,4281; PPL WikiText-2 8,9538 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.732.096 | 32 768 tokens | No disponible en la información proporcionada; la model card indica que su ASR es inferior al de este checkpoint | Apache 2.0 (el repositorio base no incluye fichero de licencia) | HuggingFace, ampliamente utilizado |
| Otras celdas del grid SVD-LLM (otras reglas de selección y presupuestos) | No disponible | No disponible | No disponible | No disponible | Mencionadas en la model card, sin datos publicados en la información proporcionada |
| Otras alternativas de Mistral-7B comprimido | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la información disponible |

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como sujeto experimental, no como asistente desplegable. No debería usarse en producción orientada a usuarios.
- Seguridad degradada de forma medible: AdvBench ASR de 0,5385 y StrongREJECT ASR de 0,4281 indican que aproximadamente la mitad de los ataques del conjunto tienen éxito. La model card señala que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- Riesgo de alucinación: la compresión espectral puede degradar la fidelidad factual; no se han publicado evaluaciones de veracidad para este checkpoint.
- Discrepancia de parámetros a revisar: el recuento de safetensors (7.241.732.096) coincide con el del modelo denso original, mientras que la model card declara una fracción resultante de 0,7009. Conviene verificar la estructura real de los pesos antes de asumir el ahorro de memoria declarado.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Contexto no declarado: la única referencia a la ventana de contexto proviene del modelo base, no de una verificación específica sobre este checkpoint.
- Licencia: este derivado se distribuye bajo Apache 2.0, pero la model card advierte de que el repositorio del modelo base no incluye un fichero de licencia que permita su redistribución. Conviene revisar las condiciones de Mistral-7B-Instruct-v0.2 antes de cualquier uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de terceros.
- Cuantizaciones inexistentes: no se ofrecen versiones GGUF, AWQ o GPTQ, por lo que el despliegue en hardware limitado exige trabajo adicional de conversión y validación.
- Caducidad del artefacto: está ligado a una rejilla experimental concreta; los resultados no son extrapolables a otros presupuestos o reglas de selección sin repetir la evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep70_gap_b001
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- No se han encontrado en la búsqueda web enlaces relevantes (papers, repositorios, blogs o demos) relacionados con este modelo. El resto de resultados de búsqueda no guardan relación con el artefacto.
