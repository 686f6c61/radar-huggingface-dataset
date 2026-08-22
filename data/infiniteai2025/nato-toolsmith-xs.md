# iNFINITEAi2025/NATO-Toolsmith-XS

## Resumen

NATO-Toolsmith-XS es un modelo de lenguaje compacto de investigación, desarrollado por el usuario iNFINITEAi2025, que cuenta con apenas 640.256 parámetros (aproximadamente 0,64 millones). Se trata de un transformer causal diminuto (`tiny_causal_transformer`) entrenado desde inicialización aleatoria sobre un conjunto de datos sintético y auditable, generado mediante plantillas deterministas en el script `train_portfolio.py`. Su propósito declarado es servir como demostración de reproducibilidad y evaluación acotada, no como modelo de propósito general.

El modelo está diseñado para una tarea muy específica: detectar la intención de uso de una herramienta (`tool_intent`) a partir de una instrucción del usuario, como muestra el ejemplo de conversión de unidades incluido en su model card. La relevancia actual de este checkpoint es limitada, pero puede resultar útil para investigadores que quieran inspeccionar un harness de tareas sintéticas, reproducir un pipeline de entrenamiento desde cero o estudiar el comportamiento de modelos muy pequeños en dominios acotados. Su licencia MIT facilita el uso y la modificación sin restricciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny_causal_transformer (transformer causal) |
| Parametros totales | 640.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | pytorch (formato no especificado en la model card) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tamaño mínimo, con 640.256 parámetros, entrenado desde cero (random initialization). El entrenamiento se realizó en 500 pasos con una semilla fija (20260823), sobre un dataset sintético compuesto por ejemplos generados localmente mediante plantillas deterministas. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es puramente supervisado sobre los datos generados. La innovación técnica principal no reside en la arquitectura, sino en el diseño del dataset sintético, que permite una auditoría completa del origen de los datos y una reproducción exacta del experimento.

El script de entrenamiento (`train_portfolio.py`) acepta argumentos como `--steps` y `--output`, lo que facilita la reproducción en distintos entornos. Los resultados reportados incluyen una pérdida final de entrenamiento de 0,069345, una pérdida media de 0,686996, y una pérdida de validación de 0,059035 con una precisión de 0,979225 en la tarea de predicción del siguiente token.

## Capacidades

- Generación de texto de forma acotada: el modelo completa secuencias siguiendo el formato `USER: ... RESPONSE: ...`, produciendo respuestas estructuradas en JSON.
- Detección de intención de herramienta (`tool_intent`): identifica si una instrucción requiere el uso de una herramienta concreta, como un conversor de unidades (`unit_converter`).
- Reproducibilidad: al estar entrenado con una semilla fija y un dataset determinista, los experimentos pueden replicarse de manera exacta.
- Inspección de harness de tareas sintéticas: el checkpoint permite examinar cómo un modelo pequeño aprende a mapear instrucciones simples a acciones de herramienta.
- No soporta tool calling real ni agentes: la salida es una clasificación simbólica, no una invocación de herramientas funcionales.
- Capacidades multilingües: solo inglés (etiqueta `en` en la model card).

## Casos de uso

- Demostración de reproducibilidad en investigación: investigadores pueden ejecutar `python3 train_portfolio.py --steps 80 --output artifacts` y comparar las métricas obtenidas con las reportadas, verificando la consistencia del entrenamiento.
- Validación de harness de tareas sintéticas: sirve como referencia para comprobar si un entorno de generación de datos con plantillas produce resultados coherentes y estables.
- Estudio de comportamiento de modelos diminutos: permite analizar cómo un transformer de menos de 1M de parámetros aprende una tarea acotada de clasificación de intenciones, útil para docencia o experimentación académica.
- Prueba de pipelines de evaluación de siguiente token: el modelo puede usarse para verificar que un sistema de evaluación de perplejidad o precisión de predicción funciona correctamente en un entorno controlado.
- Desarrollo de prototipos de detección de intención: aunque no es apto para producción, puede servir de base para un prototipo inicial que luego se escale con modelos mayores.
- Auditoría de seguridad y privacidad: al no usar datos privados ni pesos descargados, puede servir como ejemplo de un pipeline de entrenamiento con trazabilidad completa, útil en contextos de cumplimiento normativo.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de evaluación, obtenidas sobre un conjunto de validación de la tarea sintética:

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,069345 |
| Pérdida media de entrenamiento | 0,686996 |
| Pérdida de siguiente token (heldout) | 0,059035 |
| Precisión de siguiente token (heldout) | 0,979225 |

Estos valores indican que el modelo ha aprendido a predecir el siguiente token con una alta precisión (97,9 %) en el conjunto de validación de la tarea sintética. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no está diseñado para tareas generales y su evaluación se limita a este harness específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de solo 640.256 parámetros, la inferencia requiere menos de 1 GB de VRAM, incluso con cuantización. Puede ejecutarse en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) o incluso en CPU.
- GPU recomendadas: no es necesaria ninguna GPU específica; cualquier tarjeta con soporte para CUDA o incluso la CPU del sistema es suficiente.
- Compatibilidad con consumer GPU: sí, cabe perfectamente en cualquier GPU de consumo, e incluso en dispositivos embebidos o móviles si se exporta a un formato adecuado.
- Opciones de despliegue: al estar basado en PyTorch, se puede ejecutar directamente con Python. No se ha reportado compatibilidad con vLLM, llama.cpp o TGI, pero su tamaño permite una integración sencilla en scripts de investigación.
- Latencia y throughput: al tratarse de un modelo tan pequeño, la latencia por petición es del orden de milisegundos en CPU y sub-milisegundos en GPU, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada, ya que este checkpoint es un artefacto de investigación con una tarea sintética muy específica y un tamaño extremadamente reducido. Se podría comparar con otros modelos tiny como GPT-2 small (124M) o TinyLlama (1.1B), pero las diferencias en tamaño (0,6M frente a 124M o 1.1B) y en propósito (tarea sintética frente a lenguaje general) hacen que la comparación no sea significativa. La información disponible no permite establecer una comparativa útil.

## Limitaciones y advertencias

- El modelo es exclusivamente un artefacto de investigación: no es apto para acciones autónomas, decisiones de alto riesgo, ingeniería de software general, ni para uso en ámbitos médicos, legales, financieros, de seguridad, vigilancia o críticos para la seguridad.
- Las métricas reportadas se basan en tareas sintéticas de predicción de siguiente token; no demuestran razonamiento general, uso robusto de herramientas, fiabilidad factual ni comportamiento tipo AGI.
- El modelo solo funciona con plantillas deterministas de su dataset sintético; cualquier entrada fuera de este dominio producirá resultados poco fiables o sin sentido.
- La longitud de contexto y el formato de pesos no están especificados, lo que dificulta su integración en pipelines estándar sin trabajo adicional.
- Al ser un modelo tan pequeño, su capacidad de generalización es extremadamente limitada y no debe usarse como base para aplicaciones reales.
- No hay información sobre sesgos específicos, pero dado que el dataset es sintético y muy restringido, los sesgos no son evaluables ni aplicables a contextos reales.
- La licencia MIT permite uso comercial, pero el autor recomienda explícitamente no usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/iNFINITEAi2025/NATO-Toolsmith-XS
- GitHub del autor (ESP32 commander): https://github.com/NaTo1000/iNFINITEAi2025.
- GitHub Plugin Forge: https://github.com/NaTo1000/iNFINITE-Ai-2025-Plugin-Forge
