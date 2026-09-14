# Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r04

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r04` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que combina dos intervenciones: una compresión por descomposición en valores singulares mediante SVD-LLM, que elimina el 40,02% de los parámetros densos, y una posterior edición selectiva de componentes mediante intercambios iterativos ("swap") guiados por la regla `gap_iter`. El resultado declarado por el autor es un modelo con una fracción de parámetros densos de 0,5998 respecto al original. Lo publica el usuario Jeesup como artefacto de investigación, no como asistente conversacional de propósito general.

El problema que aborda es concreto: la compresión agresiva degrada el comportamiento de seguridad de un modelo alineado, y este repositorio es una de las celdas de una rejilla experimental que mide cuánto se degrada y qué regla de selección de componentes lo repara mejor. La model card es explícita al señalar que algunos brazos de la rejilla están deliberadamente degradados en seguridad y que cualquier celda debe tratarse como sujeto experimental.

Es relevante ahora porque conecta dos líneas activas de trabajo: la compresión eficiente de LLM y la interpretabilidad mecanicista orientada a la seguridad. Con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks estándar publicados, su interés es estrictamente metodológico y reproducible (semilla 42, checkpoint intermedio de una ejecución mayor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); derivado de `meta-llama/Llama-2-7b-chat-hf` |
| Parámetros totales | 6.738.415.616 según los safetensors del repositorio; la model card declara una fracción resultante de 0,5998 respecto al modelo denso (véase la advertencia en Limitaciones) |
| Parámetros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantización | No se publican versiones cuantizadas; el repositorio contiene únicamente pesos en safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (13,5 GB de tamaño de repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE), activación SwiGLU y atención multi-cabeza, con aproximadamente 6,74 mil millones de parámetros. Este checkpoint no introduce capas nuevas ni cambia la topología: las modificaciones se aplican sobre los pesos del modelo base.

No hay un entrenamiento desde cero ni un ajuste supervisado nuevo en este repositorio. El pipeline declarado es: (1) compresión SVD-LLM que elimina el 40,02% de los parámetros, dejando una fracción densa de 0,5998; (2) edición iterativa de componentes mediante la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos, ejecutada en 10 rondas de las que este checkpoint corresponde a la cuarta (0,100% por ronda). En total se restauran 394 componentes y se sustituyen otros 394, con 4.464.896 parámetros intercambiados (0,07% de los parámetros de proyección densos), valor de swap `net` (valor de inserción más valor de eliminación del desalojo ordenado por sigma) y escala de inserción 0,1. La semilla es 42. No hay información sobre RLHF o DPO adicional en la model card; la alineación del modelo base proviene de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional en el formato de plantilla de Llama 2 (`[INST] ... [/INST]`), heredado del modelo base.
- Respuesta a instrucciones en inglés principalmente; la model card no declara cobertura multilingüe.
- Sujeto de evaluación de seguridad: medición de tasas de éxito de ataque (ASR) frente a conjuntos de prompts dañinos.
- Medición de sobre-rechazo (over-refusal) sobre peticiones benignas.
- Estudio de compresión: permite analizar cómo la eliminación de rangos por SVD afecta a capacidades concretas.
- Estudio de interpretabilidad: los intercambios de componentes sobre posiciones concretas permiten aislar qué pesos sostienen el comportamiento de rechazo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad de razonamiento y código: no evaluada en la información disponible.

## Casos de uso

- Estudio del compromiso seguridad-utilidad en compresión: usar este checkpoint como uno de los puntos de la curva que relaciona la fracción de parámetros eliminados con la tasa de éxito de ataques, comparando la celda con el modelo denso sin comprimir.
- Evaluación comparativa de reglas de selección de componentes: la regla `gap_iter` es una celda de una rejilla; este checkpoint permite comparar su capacidad de reparación frente a otras reglas bajo el mismo presupuesto de restauración del 1,000%.
- Auditoría de robustez frente a jailbreaks: servir el modelo y lanzar AdvBench y StrongREJECT para reproducir los valores declarados (ASR de 0,3558 y 0,1725 respectivamente) con un juez tipo HarmBench.
- Calibración de clasificadores de seguridad: medir el sobre-rechazo macro con WildGuard (0,0971) y usarlo como referencia para ajustar umbrales de filtros de moderación en producción.
- Investigación en interpretabilidad mecanicista: los 394 componentes restaurados y 394 sustituidos identifican candidatos concretos de la red asociados al comportamiento de rechazo, lo que permite análisis de circuitos y activaciones.
- Reproducibilidad metodológica: al fijar semilla 42 y documentar cada ronda, el checkpoint es un punto de control intermedio reutilizable para replicar experimentos de compresión sin reentrenar.
- Docencia en eficiencia de modelos: ilustrar de forma cuantitativa qué se pierde al recortar un 40% de parámetros de un LLM alineado, con métricas de seguridad en lugar de solo perplejidad.
- Línea base negativa en pruebas de despliegue: emplearlo como control degradado frente al modelo denso al validar pipelines de evaluación de seguridad antes de liberar un modelo comprimido propio.

## Benchmarks y rendimiento

Solo se publican métricas de seguridad, obtenidas con juez HarmBench y WildGuard. No hay datos de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad.

| Métrica | Herramienta de medida | Valor |
|---|---|---|
| AdvBench ASR | juez HarmBench | 0,3558 |
| StrongREJECT ASR | juez HarmBench | 0,1725 |
| Sobre-rechazo macro | WildGuard | 0,0971 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se aportan los valores equivalentes del modelo denso de partida en la model card, por lo que la magnitud exacta de la degradación no puede calcularse solo con estos datos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo de pesos, más 1,5-2,5 GB de caché KV y activaciones, es decir, en torno a 15-16 GB en total.
- VRAM estimada con cuantización de 8 bits: unos 7-8 GB de pesos, alrededor de 9-10 GB efectivos.
- VRAM estimada con cuantización de 4 bits: unos 4 GB de pesos, alrededor de 5-6 GB efectivos.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S; holgadamente dentro de rango.
- GPU de consumo compatibles en fp16: RTX 3090 y RTX 4090 con 24 GB.
- GPU de consumo que requieren 8 bits: RTX 4080 (16 GB) y RTX 4060 Ti (16 GB).
- Opciones de despliegue: `transformers` con `text-generation-inference` (el repositorio está etiquetado como `endpoints_compatible`), además de vLLM y TGI. Para llama.cpp u Ollama sería necesario convertir a GGUF, y no se publica ninguna conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de parámetros, contexto y licencia de los modelos alternativos proceden de su documentación pública, no de la información proporcionada en esta búsqueda. Las métricas de seguridad de esos modelos no están disponibles en la información consultada, por lo que la comparación de rendimiento no puede cerrarse.

| Modelo | Parámetros | Contexto | Licencia | Métricas de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-...a010_b010_r04` | 6,74 mil millones (fracción declarada 0,5998) | 4.096 tokens | Llama 2 Community License | AdvBench ASR 0,3558; StrongREJECT ASR 0,1725; sobre-rechazo 0,0971 | Repositorio HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 mil millones | 4.096 tokens | Llama 2 Community License | No disponible | Ampliamente disponible |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | No disponible | Ampliamente disponible |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 mil millones | 32.000 tokens | Apache 2.0 | No disponible | Ampliamente disponible |

## Limitaciones y advertencias

- No es un asistente desplegable. La propia model card lo describe como artefacto de investigación y advierte que varios brazos de la rejilla están deliberadamente degradados en seguridad respecto a Llama-2-7b-chat.
- Tasa de éxito de ataque elevada: 0,3558 en AdvBench y 0,1725 en StrongREJECT. Cualquier despliegue orientado al público requeriría capas de moderación externas y evaluación propia.
- Discrepancia de conteo de parámetros: los safetensors del repositorio declaran 6.738.415.616 parámetros, prácticamente idénticos al modelo denso, mientras la model card afirma una fracción de 0,5998 de parámetros densos. Conviene tratarlo como un checkpoint del que no se puede inferir el ahorro real de memoria a partir del recuento almacenado.
- Riesgo de alucinación: inherente a un modelo de 7B de la generación Llama 2, y no evaluado en este checkpoint.
- Idiomas: la model card no los declara. Llama-2-7b-chat está orientado principalmente al inglés, por lo que el rendimiento fuera de ese idioma es incierto.
- Restricciones de licencia: Llama 2 Community License permite uso comercial bajo condiciones, incluye una cláusula de umbral de usuarios activos mensuales, obliga a incluir el aviso "Built with Llama 2" y a redistribuir `LICENSE.txt` y `USE_POLICY.md`, y restringe el uso de los resultados del modelo para mejorar otros LLM.
- Sesgos conocidos: heredados del modelo base Llama-2-7b-chat; no se documenta ninguna mitigación adicional en este repositorio.
- Sin validación externa: 0 descargas y 0 likes, sin evaluaciones de terceros ni resultados de benchmarks estándar.
- Sin versiones cuantizadas publicadas, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- El modelo base pertenece a una generación anterior (Llama 2, julio de 2023) y ha sido superado en contexto y capacidades por alternativas posteriores del mismo rango de tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código del método de compresión: no disponible en la información proporcionada
- Demos o espacios asociados: no disponibles
- Búsqueda web: los resultados devueltos corresponden a guías sobre marcos de ciberseguridad (NIST, ISO 27001, CIS) y no guardan relación con este modelo, por lo que no se incluyen.
