# inclusionAI/Ling-3.0-flash-Fin

## Resumen

Ling-3.0-flash-Fin es el primer modelo especializado en finanzas de la familia Ling, desarrollado por Ant Group en colaboración con instituciones financieras y expertos de dominio. Se basa en el modelo generalista Ling-3.0-flash y se ha sometido a un entrenamiento continuado con datos financieros de alta calidad, lo que le permite abordar tareas de investigación financiera de extremo a extremo: recuperación de información, revisión de evidencias, cálculo, modelado y preparación de informes.

Con 127.486.405.600 parámetros totales (la model card indica 124B), 5.1B parámetros activos y una ventana de contexto de 256K tokens, combina conocimiento financiero con inferencia eficiente para flujos de trabajo de agente de larga duración. Su arquitectura es un MoE híbrido (etiquetado como `bailing_hybrid`) y se distribuye bajo licencia MIT, lo que facilita su adopción comercial y académica.

La relevancia de este modelo radica en su enfoque en tareas financieras complejas: razonamiento multi-documento, valoración de empresas, operaciones con hojas de cálculo y búsqueda financiera con fuentes verificables. Se publica junto con el dataset FinFIRST para permitir una evaluación transparente de sus capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (bailing_hybrid), basado en Ling-3.0-flash |
| Parametros totales | 127.486.405.600 (según safetensors; la model card indica 124B) |
| Parametros activos | 5.1B (según model card) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 (checkpoint oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Ling-3.0-flash-Fin comparte la arquitectura de Ling-3.0-flash, un modelo de mezcla de expertos (MoE) con diseño híbrido (etiqueta `bailing_hybrid`). No se han publicado detalles específicos sobre el número de expertos, la disposición de capas o el mecanismo de atención, más allá de que es compatible con los runtimes SGLang y vLLM utilizados para el modelo base.

El entrenamiento consistió en una continuación del preentrenamiento de Ling-3.0-flash con datos financieros de alta calidad, seleccionados con la colaboración de instituciones financieras y expertos de dominio. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo incorpora un modo de pensamiento ("thinking mode") activado por defecto, lo que sugiere un entrenamiento orientado a razonamiento explícito.

## Capacidades

- Investigación financiera de extremo a extremo: integra recuperación de información, revisión de evidencias, cálculo, modelado y preparación de informes en un solo flujo.
- Búsqueda financiera con fuentes verificables: prioriza fuentes autorizadas y proporciona respuestas trazables; se acompaña del dataset FinFIRST para evaluación.
- Razonamiento multi-documento: reconcilia periodos de reporte, definiciones, supuestos y cifras contradictorias entre informes anuales, comunicados de resultados, presentaciones regulatorias y materiales de investigación.
- Valoración y flujos de trabajo con hojas de cálculo: comprende fórmulas, actualizaciones real-versus-estimado, dependencias entre hojas, comprobaciones de balance, análisis de escenarios y entrega de modelos financieros editables.
- Generación de materiales listos para revisión: organiza hechos, análisis, juicios y gráficos en documentos claros y editables.
- Soporte de agentes y tool-use: diseñado para flujos de trabajo de agente de larga duración, con uso de herramientas y ejecución de tareas multi-paso.
- Modo de pensamiento activado por defecto: genera razonamiento interno antes de responder, con recomendación de `temperature=1.0`, `top_p=0.95` y `top_k=20`.

## Casos de uso

- Análisis de informes anuales y comunicados de resultados: el modelo puede procesar múltiples documentos financieros de una misma empresa, reconciliar cifras de distintos periodos y detectar inconsistencias entre fuentes, gracias a su ventana de 256K tokens y su entrenamiento específico en razonamiento multi-documento.
- Valoración de empresas y modelado financiero: soporta la creación y edición de modelos de valoración en hojas de cálculo, incluyendo fórmulas, dependencias entre hojas y análisis de escenarios, lo que permite a analistas generar modelos editables directamente desde el modelo.
- Búsqueda financiera con fuentes verificables: para consultas sobre datos de mercado, regulaciones o métricas de empresas, el modelo prioriza fuentes autorizadas y devuelve respuestas con trazabilidad, útil en entornos donde la verificación es crítica.
- Automatización de informes de inversión: puede redactar borradores de informes de investigación que incluyan hechos, análisis, juicios y gráficos, listos para revisión por parte de analistas senior.
- Agentes financieros autónomos: gracias a su soporte de tool-use y su capacidad de ejecución de tareas de larga duración, puede integrarse en pipelines de agentes que consultan APIs, actualizan modelos y generan alertas de forma autónoma.
- Análisis de carteras y riesgo: con su contexto largo y razonamiento multi-documento, puede comparar estados financieros de distintas empresas, evaluar supuestos de escenarios y generar informes de riesgo preliminares.

## Benchmarks y rendimiento

La model card indica que el modelo fue evaluado en los siguientes benchmarks: FinFIRST, FinSearchComp Verified, FinCRAFT, Finance Agent, APEX-Agents, SpreadsheetBench y τ³-Banking. Estos cubren recuperación con fuentes, investigación de inversiones, ejecución de larga duración, modelado de valoración, operaciones con hojas de cálculo y flujos bancarios.

No se han publicado resultados numéricos concretos en la información disponible. La card afirma que el modelo es competitivo con modelos de tamaño similar y con modelos generalistas sustancialmente mayores, con especial fortaleza en selección de fuentes y tareas financieras intensivas en uso de herramientas, pero no se proporcionan cifras comparativas.

## Requisitos de hardware

- El checkpoint oficial se distribuye en BF16 y el repositorio ocupa 255.0 GB, por lo que la inferencia en BF16 requiere aproximadamente 255 GB de VRAM, lo que implica múltiples GPUs de alta gama (por ejemplo, 4× A100 80GB o 2× H100 80GB) o soluciones de memoria compartida.
- No se han publicado requisitos de VRAM para cuantizaciones inferiores (GGUF, INT8, etc.). Con cuantización a 4 bits, el modelo podría caber en GPUs de 48 GB o 80 GB, pero no hay datos oficiales al respecto.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en BF16; se necesitaría cuantización agresiva y aun así superaría los 24 GB de VRAM típicos.
- Opciones de despliegue: compatible con SGLang y vLLM, según la guía de despliegue de Ling-3.0-flash. También podría ejecutarse con llama.cpp si se generan pesos GGUF, aunque no se proporcionan oficialmente.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos financieros específicos (como FinGPT, BloombergGPT o modelos generalistas de tamaño similar) en la documentación proporcionada. La model card menciona que el modelo es competitivo con modelos de tamaño similar y con modelos generalistas mayores, pero no se ofrecen nombres concretos ni cifras. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- El modelo requiere validación adicional en flujos de trabajo complejos y de larga duración; sus supuestos, resultados de valoración y conclusiones de inversión deben ser revisados por profesionales.
- No constituye asesoramiento de inversión; las salidas deben tratarse como borradores o apoyo al análisis, no como recomendaciones finales.
- Al ser la primera versión especializada en finanzas, puede presentar errores en tareas muy especializadas o en contextos regulatorios específicos no cubiertos por los datos de entrenamiento.
- No se han publicado detalles sobre sesgos potenciales, riesgos de alucinación específicos o limitaciones idiomáticas. Se recomienda verificar siempre las cifras y fuentes generadas.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías; el usuario es responsable de la validación de sus salidas en entornos de producción.
- El modo de pensamiento activado por defecto puede aumentar la latencia y el coste computacional en comparación con modelos sin este modo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash-Fin
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- OpenRouter (versión gratuita): https://openrouter.ai/inclusionai/ling-3.0-flash-fin:free
- Anuncio en X: https://x.com/AntLingAGI/status/2093022087069958492
- Dataset FinFIRST: https://huggingface.co/datasets/inclusionAI/FinFIRST
- Guía de despliegue de Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash#quickstart
