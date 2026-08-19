# echoctx/sn38-chrono-2016-sft2-leak

## Resumen

El modelo `echoctx/sn38-chrono-2016-sft2-leak` es un modelo de lenguaje causal (causal-lm) de 2.018 millones de parámetros, desarrollado por el usuario echoctx y publicado en HuggingFace con licencia MIT. Forma parte de una serie experimental denominada "sn38-nanochrono" dentro del proyecto ChronoLLM, orientada a la generación de completaciones factuales cortas sobre eventos y entidades del año 2016. Su nombre indica que es un candidato de la ronda 7 (round-7) para el año 2016, y su pipeline de entrenamiento incluye un paso de "leak-aware hinge" que busca controlar la fuga de información temporal en las respuestas.

El modelo se presenta como un experimento de investigación más que como un producto listo para producción. La model card describe un proceso de entrenamiento en tres fases: un ajuste con "nanochrono" y jitter de valores singulares, un ajuste supervisado (SFT) con completaciones empaquetadas, y un paso de regularización específico para frases públicas posteriores a 2016. Aunque se reportan métricas internas de calidad y de evaluación de fugas, no se proporcionan detalles sobre la arquitectura interna, el contexto máximo, ni resultados de benchmarks estándar. Su relevancia radica en explorar cómo controlar la contaminación temporal en modelos de lenguaje, un problema poco abordado en la literatura abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como causal-lm) |
| Parametros totales | 2.018.511.234 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (tipo de transformer, número de capas, dimensiones, etc.). Solo se indica que es un modelo de lenguaje causal (causal-lm). El entrenamiento sigue un pipeline de tres pasos:

1. **UID 131 nanochrono + SV jitter 0.08 (SVD 0.019)**: se aplica una técnica de "nanochrono" (posiblemente relacionada con el control temporal) con un jitter en valores singulares de 0.08, resultando en una desviación SVD de 0.019.
2. **Packed completion SFT (quality)**: ajuste supervisado con completaciones empaquetadas, enfocado en calidad.
3. **Leak-aware hinge on public post-2016 year/entity phrases**: un paso de regularización que penaliza la fuga de información sobre años y entidades posteriores a 2016, usando un "hinge" (función de pérdida) sobre frases públicas.

Se reporta un "svd_gate vs 131" de 0.01905 (>= 0.01), lo que sugiere un umbral de control de calidad. La evaluación de fugas (proxy, no TEE) da PASS con 0/12 desconocidas y 28/28 conocidas, con una puntuación de -13.80. La calidad se describe como "completaciones factuales cortas" (fotosíntesis, Trump, Río, Brexit 2016), con una regresión en el año de la Segunda Guerra Mundial respecto a SFT2. No se menciona el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de completaciones factuales cortas sobre eventos y entidades de 2016 (ej. fotosíntesis, Trump, Río, Brexit).
- Control de fuga temporal: el modelo está diseñado para evitar revelar información posterior a 2016 en sus respuestas, según el "leak-aware hinge".
- Capacidad de ajuste fino adicional: al ser un modelo causal de 2B parámetros, puede adaptarse a tareas específicas mediante SFT.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- **Investigación sobre contaminación temporal en LLMs**: el modelo sirve como banco de pruebas para estudiar cómo evitar que un modelo filtre información futura en tareas de completación factual. Un investigador podría comparar sus respuestas con las de modelos sin el "leak-aware hinge" para medir el efecto de la regularización.
- **Generación de contenido histórico acotado**: puede usarse para producir textos cortos sobre hechos de 2016 (noticias, resúmenes) donde se requiere que el modelo no mencione eventos posteriores, útil en contextos de simulación histórica o juegos de rol.
- **Evaluación de calidad de completaciones factuales**: su pipeline de SFT con "packed completion" lo hace adecuado para experimentos de evaluación de precisión en preguntas de conocimiento general de ese año.
- **Pruebas de robustez ante fugas de datos**: al ser un modelo pequeño (2B), es viable para ejecutar experimentos de "leak evaluation" en entornos controlados, como el proxy descrito en la model card.
- **Base para fine-tuning en tareas de fecha específica**: su licencia MIT permite usarlo como punto de partida para adaptarlo a dominios que requieran conocimiento de 2016 sin contaminación posterior.
- **Educación y demostración**: puede emplearse en cursos de procesamiento de lenguaje natural para ilustrar conceptos de regularización temporal y evaluación de sesgos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de calidad y de evaluación de fugas (proxy leak.evaluate: PASS, score -13.80), pero no incluye resultados de MMLU, HumanEval, GSM8K u otros estándares. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Con 2.018 millones de parámetros, en FP32 ocuparía aproximadamente 8 GB; con cuantización de 4 bits podría reducirse a ~1 GB, pero no se confirma.
- **GPU recomendadas**: no especificadas. Dado el tamaño, es factible en GPUs consumer como RTX 3060 (12 GB) o superiores, incluso en CPU con llama.cpp si se cuantiza.
- **Opciones de despliegue**: no se indican. Al ser safetensors, podría cargarse con transformers, vLLM, llama.cpp u Ollama, pero no hay confirmación.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de 2B con control temporal específico). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- **Modelo experimental**: no está probado en entornos TEE (Trusted Execution Environment) y no se ha comprometido en cadena, según la model card. No es apto para producción sin validación adicional.
- **Fuga de datos potencial**: aunque el "leak-aware hinge" busca mitigar la fuga, la evaluación es un proxy (no TEE) y podría haber fugas residuales. El modelo podría revelar información posterior a 2016 en ciertos contextos.
- **Alcance limitado**: solo se documentan completaciones factuales cortas; no hay evidencia de capacidades de razonamiento complejo, generación de código o diálogo extenso.
- **Regresión conocida**: se reporta una regresión en el año de la Segunda Guerra Mundial respecto a SFT2, lo que indica que el control temporal puede degradar otros conocimientos.
- **Idiomas**: no se especifican idiomas soportados; probablemente esté entrenado principalmente en inglés, pero no se confirma.
- **Licencia**: MIT permite uso comercial, pero al ser un modelo sin documentación completa, el usuario asume el riesgo de su uso.

## Enlaces

- [HuggingFace: echoctx/sn38-chrono-2016-sft2-leak](https://huggingface.co/echoctx/sn38-chrono-2016-sft2-leak)
