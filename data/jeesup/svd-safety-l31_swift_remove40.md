# Jeesup/svd-safety-l31_swift_remove40

## Resumen

`Jeesup/svd-safety-l31_swift_remove40` es un artefacto de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 40,00% de los parámetros densos, dejando el 60,03% de la fracción original. Sobre esa base comprimida se aplica una regla de selección de componentes SVD etiquetada como `unknown` con un presupuesto de restauración del 0,000%, lo que implica que se restauran cero componentes: la celda mide exclusivamente el daño producido por la compresión, sin reparación posterior.

El modelo no es un asistente conversacional de propósito general. Pertenece a una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad y qué criterio de selección lo repara mejor. Los resultados publicados por el autor muestran una tasa de éxito de ataque (ASR) del 56,92% en AdvBench y del 41,85% en StrongREJECT, con una perplejidad de 22,5577 en WikiText-2 y un sobre-rechazo macro del 6,56% medido con WildGuard.

Su relevancia es metodológica más que funcional: sirve como sujeto experimental para estudiar el compromiso entre seguridad y utilidad bajo compresión, y como punto de comparación frente a otras celdas de la misma rejilla. Los pesos se distribuyen en `safetensors` con licencia Llama 3.1 Community License y el repositorio ocupa 16,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1, con pesos comprimidos mediante SVD-LLM. La model card no detalla la configuración interna de capas ni cabezas |
| Parametros totales | 8.030.261.248 según los metadatos de `safetensors`; el autor declara una fracción de parámetros resultante de 0,6003 (≈4,82 B) tras eliminar el 40,00% de los parámetros densos. Existe una discrepancia no aclarada entre ambas cifras |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card. La arquitectura base Llama 3.1 admite 128.000 tokens, pero el autor no confirma la ventana efectiva tras la compresión |
| Tipos de cuantizacion | No disponible. El repositorio publica únicamente pesos en `safetensors` sin versiones GGUF, AWQ, GPTQ ni cuantizaciones documentadas |
| Idiomas soportados | No disponible en la model card. No se declara ninguna lista de idiomas, aunque la etiqueta `conversational` está presente |
| Licencia | Llama 3.1 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio). Built with Llama |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct` y no ha sido reentrenado: la transformación consiste en una compresión de rango reducido mediante SVD-LLM, técnica que descompone matrices de pesos y trunca componentes singulares con criterios conscientes de la activación. El autor declara una eliminación del 40,00% de los parámetros densos, semilla 42 y regla de selección `unknown`, con presupuesto de restauración de componentes del 0,000% (0 componentes restaurados y 0 componentes sustituidos).

No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni etapas de RLHF o DPO específicas de este checkpoint; el ajuste por instrucciones procede íntegramente del modelo base. Tampoco se describe ninguna innovación de decodificación (decodificación especulativa, atención lineal u otras). La única innovación metodológica relevante es el propio procedimiento de compresión y la rejilla experimental de reglas de selección y presupuestos de restauración en la que se inserta esta celda.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base `Llama-3.1-8B-Instruct`.
- Razonamiento de propósito general y respuesta a instrucciones, degradados por el truncamiento SVD: la perplejidad en WikiText-2 sube a 22,5577.
- Capacidad reducida de rechazo de peticiones dañinas: la model card advierte explícitamente que varias celdas de la rejilla están «deliberately safety-degraded» respecto al modelo base.
- Soporte de tool calling y function calling: no confirmado en la model card; debe verificarse empíricamente antes de asumirlo.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni documentado.
- Capacidades multilingües: no declaradas; la model card no incluye lista de idiomas.
- Modo de pensamiento, visión o audio: no disponibles.
- Etiquetas declaradas por el autor: `svd`, `compression`, `safety`, `interpretability`, `llama3`, `conversational`, `text-generation-inference`, `endpoints_compatible`.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como una de las celdas de la rejilla para medir cuánto degrada la eliminación del 40% de parámetros densos frente a otras combinaciones de regla de selección y presupuesto.
- Auditoría de seguridad bajo compresión: ejecutar AdvBench y StrongREJECT con un juez HarmBench para reproducir los valores de ASR declarados (0,5692 y 0,4185) y compararlos con el modelo base sin comprimir.
- Estudio de sobre-rechazo: utilizar WildGuard para medir el sobre-rechazo macro (0,0656 declarado) y analizar si la compresión reduce tanto la capacidad de rechazo como la utilidad conversacional.
- Evaluación de calidad lingüística: calcular perplejidad en WikiText-2 (22,5577 declarada) y en corpus propios para cuantificar la pérdida de fluidez introducida por el truncamiento SVD.
- Calibración de pipelines de red-teaming: emplear un modelo con seguridad degradada de forma controlada como sujeto de prueba para validar clasificadores, jueces automáticos y heurísticas de detección de contenido dañino.
- Reproducción experimental: reentrenar o recomprimir el modelo base con la misma semilla (42) y el mismo porcentaje de eliminación para verificar la reproducibilidad de las métricas declaradas.
- Docencia y formación en safety de LLM: ilustrar de forma tangible el compromiso entre compresión, rendimiento y alineación de seguridad sobre un modelo de 8 B de parámetros.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5692 |
| StrongREJECT ASR (juez HarmBench) | 0,4185 |
| Sobre-rechazo macro (WildGuard) | 0,0656 |
| Perplejidad en WikiText-2 | 22,5577 |

La model card no publica los valores equivalentes de `meta-llama/Llama-3.1-8B-Instruct` sin comprimir, por lo que no es posible establecer la comparación directa contra la línea base. El autor únicamente afirma de forma cualitativa que «compression alone raises attack-success rate». No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada si se materializan los 8.030 millones de parámetros declarados en `safetensors`: ≈16 GB en BF16/FP16, ≈8 GB en INT8 y ≈4-5 GB en INT4, más la caché KV correspondiente al contexto que se utilice.
- VRAM estimada si se materializa realmente la fracción del 60,03% (≈4,82 B de parámetros): ≈9,6 GB en BF16/FP16, ≈4,8 GB en INT8 y ≈2,5-3 GB en INT4.
- GPU recomendadas: A100 40/80 GB y H100 para servicio en BF16 con contexto largo; L40S y L4 para despliegues de menor concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para BF16 o INT8 en consumo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con BF16 y en tarjetas de 12-16 GB aplicando cuantización, siempre que se genere una versión GGUF o AWQ que el repositorio no proporciona actualmente.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` (TGI) y endpoints compatibles según las etiquetas del autor; vLLM es plausible por tratarse de arquitectura Llama, aunque no está confirmado en la model card; `llama.cpp` y Ollama requieren una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni rendimiento bajo concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_swift_remove40` | 8,03 B declarados; 60,03% de fracción densa según el autor | No disponible | AdvBench ASR 0,5692; StrongREJECT ASR 0,4185; sobre-rechazo 0,0656; WikiText-2 ppl 22,5577 | Llama 3.1 Community License | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` (base sin comprimir) | 8,03 B | 128.000 tokens | No disponible en la información proporcionada | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Llama 3.1 Community License | No disponible |

No se han identificado en la información proporcionada otros modelos comparables de compresión SVD orientados a seguridad, ni checkpoints de poda con métricas equivalentes. La comparativa cuantitativa con el modelo base no puede cerrarse porque el autor no publica sus valores de AdvBench, StrongREJECT, WildGuard ni WikiText-2.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card lo describe como «research artifact» y advierte de que debe tratarse como «an experimental subject, not as a deployable assistant».
- Seguridad degradada de forma deliberada: la compresión eleva la tasa de éxito de ataque hasta 0,5692 en AdvBench y 0,4185 en StrongREJECT, valores incompatibles con un uso en producción orientado al público.
- Riesgo elevado de alucinación y de degradación de la coherencia: la perplejidad de 22,5577 en WikiText-2 es sustancialmente superior a la esperable en un modelo de 8 B alineado sin comprimir.
- Regla de selección etiquetada como `unknown`: impide saber qué criterio se aplicó para escoger los componentes SVD, lo que compromete la reproducibilidad exacta del experimento.
- Discrepancia de parámetros sin resolver: los metadatos de `safetensors` declaran 8.030.261.248 parámetros mientras el autor indica una fracción densa de 0,6003, lo que dificulta estimar con precisión los requisitos de memoria.
- Ventana de contexto no confirmada tras la compresión; no debe asumirse la ventana de 128.000 tokens del modelo base.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá de lo que herede del modelo base.
- Restricciones de licencia: sujeta a Llama 3.1 Community License y a `USE_POLICY.md`; el uso comercial está condicionado por dicha licencia, incluidos los requisitos de atribución («Built with Llama») y los umbrales de usuarios activos mensuales establecidos por Meta.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Fecha de creación registrada como 2026-09-17, posterior a la fecha habitual de publicación de la familia Llama 3.1, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_swift_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License y `USE_POLICY.md`: incluidos en el propio repositorio del modelo.
- Otros enlaces (papers, blogs, repositorios o demos): no disponibles. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre SVD-LLM; los resultados obtenidos correspondían a páginas comerciales de pases turísticos de Barcelona (Go City) sin relación alguna con el contenido solicitado.
