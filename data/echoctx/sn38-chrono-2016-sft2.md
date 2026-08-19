# echoctx/sn38-chrono-2016-sft2

## Resumen

El modelo `echoctx/sn38-chrono-2016-sft2` es un modelo de lenguaje causal (causal-lm) de 2.018.511.234 parámetros, desarrollado por el autor `echoctx` como candidato para la ronda 7 de la subred Bittensor SN38. Su arquitectura, denominada `sn38-nanochrono`, está especializada en tareas de completamiento de frases con conocimiento histórico, con un corte temporal en 2016. El modelo se inicializa a partir de `anacoluthe89/chrono-2015` y se somete a un ajuste fino supervisado (SFT) sobre 113 pares de frases incompletas, sin incorporar datos posteriores a 2016.

La relevancia de este modelo radica en su enfoque en el reconocimiento de eventos y tokens temporales (años), así como en su diseño para producir completamientos más cortos y factuales que el campeón de 2015 en un conjunto de evaluación de 20 prompts. Aunque no se han publicado benchmarks formales, el modelo está pensado para tareas de generación de texto con conocimiento histórico y para competir en el contexto de Bittensor SN38, donde se evalúa la calidad de modelos de lenguaje especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sn38-nanochrono (causal-lm) |
| Parametros totales | 2.018.511.234 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `sn38-nanochrono` es un modelo de lenguaje causal, aunque no se especifican detalles sobre si es un transformer estándar, MoE o híbrido. El entrenamiento se realizó en dos fases: primero, una inicialización desde el modelo `anacoluthe89/chrono-2015` (commit `3062e6d0`) con una perturbación de jittering de valores singulares (SV-jitter) con sigma=0.08, lo que resultó en una desviación SVD de 0.019 respecto a la inicialización. Posteriormente, se aplicó un ajuste fino supervisado (SFT) exclusivamente sobre 113 pares de frases incompletas "atemporales", sin incluir datos posteriores a 2016. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal con completamiento de frases incompletas.
- Reconocimiento de tokens de año (year-token items), con una mejora observada en el "proxy leak unknown-recognition" según la model card.
- Producción de completamientos más cortos y factuales que el modelo campeón de 2015 en un conjunto de 20 prompts de evaluación.
- Conocimiento limitado a eventos y datos anteriores a 2016 (cutoff temporal).
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de texto histórico: el modelo puede completar frases o párrafos con conocimiento de eventos hasta 2016, útil para redacción de contenidos con contexto temporal fijo.
- Completamiento de citas o referencias: dado su entrenamiento en pares de frases incompletas, puede sugerir finalizaciones coherentes para textos parciales.
- Evaluación de modelos en subredes descentralizadas: como candidato a SN38, sirve para comparar la calidad de generación frente a otros modelos de la misma categoría.
- Investigación en modelos con corte temporal: permite estudiar el efecto del cutoff en la factualidad y la longitud de las respuestas.
- Prototipos de asistentes con conocimiento acotado: para aplicaciones donde se requiera ignorar información posterior a 2016 (por ejemplo, simulaciones históricas).
- Pruebas de robustez ante datos fuera de distribución: al estar entrenado solo con datos hasta 2016, es útil para evaluar cómo responde a preguntas sobre eventos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación interna sobre 20 prompts donde el modelo produce completamientos más cortos y factuales que el campeón de 2015, pero no se proporcionan métricas cuantitativas (como MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Dado el tamaño de 2.018 millones de parámetros, se estima que la inferencia en precisión FP16 requeriría aproximadamente 4 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Con cuantización (por ejemplo, 8 bits o 4 bits) podría caber en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4090 (24 GB), pero esto es una estimación orientativa y no un dato confirmado.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo pertenece a una categoría muy específica (modelos con corte temporal para SN38) y no se conocen alternativas públicas comparables en cuanto a arquitectura y entrenamiento.

## Limitaciones y advertencias

- El conocimiento del modelo se limita a información anterior a 2016; cualquier pregunta sobre eventos posteriores puede generar respuestas incorrectas o alucinadas.
- La model card indica que el SVD oficial frente al UID 131 es 0.01905, por encima del umbral de 0.01, lo que sugiere que el modelo no está completamente alineado con el estándar de la subred.
- El TEE self-test (prueba de entorno de ejecución confiable) no se ha ejecutado aún, por lo que no se garantiza la integridad del modelo en entornos verificados.
- El entrenamiento se realizó con un conjunto de datos muy reducido (113 pares de frases), lo que limita la generalización y puede aumentar el riesgo de sobreajuste.
- No se han publicado evaluaciones de sesgos ni de seguridad; se recomienda precaución antes de usar el modelo en producción.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la idoneidad para casos de uso específicos.

## Enlaces

- [HuggingFace: echoctx/sn38-chrono-2016-sft2](https://huggingface.co/echoctx/sn38-chrono-2016-sft2)
