# Maldak123/TOTVS_Concorrencia_V3

## Resumen

Maldak123/TOTVS_Concorrencia_V3 es un modelo de clasificación de texto basado en XLM-RoBERTa-base, fine-tuned por el autor Maldak123 (Miguel Amaro) para detectar benchmarking con competidores en reuniones B2B en portugués. El modelo se entrena sobre un conjunto de 77 347 reuniones B2B y tiene 278 millones de parámetros, lo que lo sitúa en la categoría de modelos de tamaño medio (0,1B). Aunque los resultados publicados en la model card muestran una accuracy muy alta (0,9996), la precisión, recall y F1 son 0,0 y el ROC-AUC es de 0,5395, lo que sugiere un desequilibrio severo en las clases o un modelo que predice siempre la clase mayoritaria, sin capacidad real de discriminar entre concurrencia y no concurrencia.

Es relevante en el contexto de herramientas de análisis de conversaciones comerciales para equipos de ventas, ya que permite identificar menciones a competidores en reuniones. Sin embargo, su utilidad práctica es cuestionable por las métricas presentadas, que indican un rendimiento casi nulo en la detección efectiva. La licencia MIT facilita su uso y modificación, pero se recomienda evaluar con un conjunto de prueba balanceado antes de desplegarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (fine-tuned) |
| Parametros totales | 278 045 186 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (probablemente 512 tokens, típico de RoBERTa-base) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantización) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura XLM-RoBERTa-base, un transformer encoder preentrenado por Facebook AI con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Se fine-tune sobre un dataset de 77 347 reuniones B2B en portugués, con una tarea de clasificación binaria para detectar si una reunión menciona benchmarking con competidores. No se especifica el número de épocas, el tamaño de batch, ni la estrategia de entrenamiento (p.ej., congelado o completo). Tampoco se indica si se usó técnicas de regularización o ajuste de hiperparámetros.

La model card solo reporta métricas de accuracy, precision, recall, F1 y ROC-AUC, sin detalles sobre la distribución de clases ni la partición de datos. Dado que precision, recall y F1 son 0.0 mientras que accuracy es casi perfecta, es probable que el modelo prediga siempre la clase mayoritaria (probablemente la clase negativa), lo que produce una accuracy alta pero sin capacidad de detección real.

## Capacidades
- Clasificación de texto binario en portugués: detecta si una reunión B2B contiene benchmarking con competidores.
- Solo soporta la tarea de clasificación de secuencia completa; no genera texto ni tiene capacidades de generación.
- No tiene soporte de tool calling, agentes, ni razonamiento multi-step.
- No es multilingüe (solo portugués).
- No tiene capacidades de visión ni audio.
- El modelo es de tipo encoder, por lo que no genera respuestas, solo asigna una etiqueta a cada entrada.

## Casos de uso
- Análisis de transcripciones de reuniones de ventas: el modelo puede procesar transcripciones de llamadas o reuniones y etiquetar si se menciona a un competidor, ayudando a los equipos comerciales a identificar oportunidades de benchmarking.
- Automatización de informes de inteligencia competitiva: se puede integrar en un pipeline que procese archivos de texto y genere reportes automáticos de menciones de competidores.
- Filtrado de reuniones en un CRM: clasificar reuniones registradas en un sistema de gestión de relaciones con clientes (p.ej. TOTVS) para priorizar aquellas que requieren atención por tratar con competencia.
- Análisis de correos electrónicos comerciales: adaptar el modelo para detectar menciones de competidores en correos, aunque no fue entrenado específicamente para ese dominio.
- Sistema de alertas en tiempo real: integrar el modelo en un servicio de streaming que procese transcripciones y emita alertas cuando se detecte benchmarking.
- Investigación académica sobre detección de intención en conversaciones: usar como modelo base para experimentos de clasificación de texto en portugués B2B.

Nota: dado que las métricas de precisión y recall son nulas, estos casos de uso requieren una re-evaluación y posiblemente un re-entrenamiento con datos balanceados y una estrategia de clasificación adecuada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento en el propio dataset:

| Metrica | Score |
|---|---|
| Accuracy | 0.9996 |
| Precision | 0.0000 |
| Recall | 0.0000 |
| F1 Score | 0.0000 |
| ROC-AUC | 0.5395 |

Estos valores indican un modelo que predice la clase mayoritaria (probablemente la negativa) en todos los casos, con una accuracy engañosa. El ROC-AUC de 0.5395 está cerca del azar (0.5), confirmando que no hay capacidad discriminativa. No hay comparación con otros modelos.

## Requisitos de hardware
- VRAM estimada: para inferencia con el modelo base de 278M parámetros, se necesitan aproximadamente 1.1 GB de memoria para los pesos en FP32, o alrededor de 500 MB en FP16. Para batch pequeño, puede funcionar con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p.ej. NVIDIA GTX 1650, RTX 2060, T4). En CPU, se puede ejecutar con 4-8 GB de RAM.
- Sí cabe en GPUs de consumo, como RTX 3060, RTX 4070, etc.
- Opciones de despliegue: se puede usar con Transformers (Python), ONNX Runtime para inferencia en CPU/GPU, o servir con TensorRT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama porque es un modelo encoder, no generativo.
- Latencia y throughput estimados: no disponibles. Para un modelo de 278M en una GPU T4, la latencia por ejemplo sería de decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (detección de competencia en reuniones B2B). Como referencia, otros modelos de clasificación en portugués basados en BERT (p.ej. BERTimbau, por ejemplo) podrían ser alternativas, pero no se han comparado. La comparativa queda no disponible.

## Limitaciones y advertencias
- El modelo presenta métricas de precisión y recall nulas, lo que indica que no detecta la clase de interés (benchmarking) y solo predice la clase negativa. No es apto para uso en producción sin un re-entrenamiento.
- La accuracy alta es engañosa debido a un desbalance de clases severo (probablemente el 99% de las reuniones no mencionan competencia).
- El modelo solo soporta portugués; no funciona en otros idiomas.
- No hay información sobre el proceso de entrenamiento (épocas, balance de clases, técnicas de oversampling, etc.).
- La licencia MIT permite uso comercial, pero el rendimiento real es inaceptable para aplicaciones de detección.
- Alucinación: como es un clasificador, no genera texto, pero la clasificación errónea puede llevar a falsos negativos/positivos en el análisis de reuniones.
- La arquitectura XLM-RoBERTa-base tiene una longitud de contexto máxima de 512 tokens, por lo que reuniones más largas deben truncarse o dividirse.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Maldak123/TOTVS_Concorrencia_V3
- Perfil del autor: https://huggingface.co/Maldak123
- Modelo relacionado (TOTVS_Upsell_V3): https://huggingface.co/Maldak123/TOTVS_Upsell_V3

No hay papers ni repos de código adicionales.</think>## Resumen
Maldak123/TOTVS_Concorrencia_V3 es un modelo de clasificación de texto basado en XLM-RoBERTa-base, fine-tuned por el autor Maldak123 (Miguel Amaro) para detectar menciones de benchmarking con competidores en reuniones B2B en portugués. El modelo se entrenó con un conjunto de 77 347 reuniones B2B y tiene 278 millones de parámetros, lo que lo sitúa en la categoría de modelos de tamaño medio (0,1B). Su licencia MIT permite uso comercial y modificación libre.

La relevancia de este modelo radica en su aplicación en inteligencia comercial: permite identificar si en una conversación de ventas se discute a un competidor, lo que puede ayudar a los equipos comerciales a priorizar acciones. Sin embargo, las métricas publicadas en la model card son contradictorias: mientras la accuracy alcanza 0.9996, la precisión, recall y F1 son 0.0, y el ROC-AUC es de 0.5395. Esto sugiere que el modelo predice siempre la clase mayoritaria (probablemente la negativa) y no tiene capacidad real de discriminación. Por tanto, su utilidad práctica es muy limitada y no se recomienda su uso en producción sin un re-entrenamiento adecuado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (fine-tuned) |
| Parametros totales | 278 045 186 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (típico de XLM-RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantización) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en XLM-RoBERTa-base, un transformer encoder preentrenado por Facebook AI con 12 capas, 12 cabezas de atención y 768 dimensiones ocultas. Se fine-tune para una tarea de clasificación binaria sobre un dataset de 77 347 reuniones B2B en portugués, sin que se especifiquen detalles de entrenamiento como número de épocas, tamaño de batch, estrategia de balance de clases o técnicas de regularización. No se indica el uso de RLHF, DPO ni ningún otro método de alineación. La innovación técnica se limita al fine-tuning de un modelo preexistente, sin modificaciones en la arquitectura.

La model card solo reporta métricas de accuracy, precisión, recall, F1 y ROC-AUC. La ausencia de precisión y recall (ambos 0.0) junto con un ROC-AUC de 0.5395 indica que el modelo no aprende a distinguir entre las dos clases, probablemente por un desbalance extremo en el dataset. No se aportan datos sobre la composición del dataset (número de ejemplos positivos y negativos) ni sobre la estrategia de evaluación.

## Capacidades
- Clasificación binaria de texto en portugués: detecta si una reunión B2B contiene benchmarking con competidores.
- No genera texto ni tiene capacidades de generación; es un modelo encoder que asigna una etiqueta a una secuencia de entrada.
- No soporta tool calling, funciones ni agentes.
- No es multilingüe; solo funciona en portugués.
- No tiene capacidades de visión ni audio.
- La única salida es una probabilidad o logit para la clase positiva (presencia de concurrencia).

## Casos de uso
- Análisis de transcripciones de reuniones comerciales: procesar archivos de texto de reuniones y etiquetar si se menciona un competidor, útil para priorizar seguimientos.
- Integración en CRM (p.ej. TOTVS) para filtrar reuniones que requieren atención por competencia.
- Generación de informes de inteligencia competitiva: automatizar la extracción de menciones de competidores en un conjunto de reuniones.
- Monitoreo en tiempo real de llamadas de ventas: usar el modelo en un pipeline de streaming para alertar a los agentes cuando se hable de competencia.
- Análisis de correos electrónicos comerciales (si se adapta el dominio) para detectar benchmarking.
- Investigación académica sobre detección de intención en conversaciones B2B en portugués.

Advertencia: dado el rendimiento del modelo, estos casos de uso solo son viables tras un re-entrenamiento con un dataset balanceado y una evaluación correcta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única tabla de métricas es la proporcionada por el autor:

| Metrica | Score |
|---|---|
| Accuracy | 0.9996 |
| Precision | 0.0000 |
| Recall | 0.0000 |
| F1 Score | 0.0000 |
| ROC-AUC | 0.5395 |

Estos valores confirman que el modelo no es capaz de detectar la clase positiva (concurrencia) y solo predice la clase negativa. El ROC-AUC de 0.5395 está cerca del azar (0.5), lo que indica una capacidad discriminativa prácticamente nula. No hay comparación con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: alrededor de 1 GB en FP16 (278M parámetros en FP16 ocupan ~556 MB, más overhead). Para batch de tamaño 1, 2 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, T4, RTX 3060, RTX 4070.
- Sí cabe en GPU de consumo; también se puede ejecutar en CPU con 4-8 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: Transformers de Hugging Face, ONNX Runtime para CPU/GPU, FastAPI para servir como API. No es compatible con vLLM, llama.cpp u Ollama por ser un modelo encoder, no generativo.
- Latencia y throughput: no disponibles. Para un modelo de 278M en GPU T4, la latencia por secuencia puede ser de decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (detección de benchmarking en reuniones B2B en portugués). Como referencia genérica, se podrían considerar otros modelos de clasificación en portugués como BERTimbau (base y large), pero no hay comparación publicada. La comparativa queda no disponible.

## Limitaciones y advertencias
- El modelo tiene precisión y recall nulos, lo que indica que no detecta la clase de interés y solo predice la clase mayoritaria. No es apto para uso en producción.
- La accuracy de 0.9996 es engañosa por el desbalance de clases; no refleja la capacidad real del modelo.
- El ROC-AUC de 0.5395 confirma que la discriminación es casi aleatoria.
- El modelo solo soporta portugués y no tiene capacidad multilingüe.
- No se especifican detalles del dataset (balance, distribución, etc.) ni del entrenamiento, lo que dificulta la reproducibilidad.
- La licencia MIT permite uso comercial, pero el rendimiento actual no justifica su despliegue sin un re-entrenamiento.
- Riesgo de falsos negativos: al predecir siempre la clase negativa, se pierden todas las reuniones con concurrencia.
- Limitación de contexto de 512 tokens: las reuniones más largas deben truncarse, lo que puede perder información relevante.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Maldak123/TOTVS_Concorrencia_V3
- Perfil del autor: https://huggingface.co/Maldak123
- Modelo relacionado (TOTVS_Upsell_V3): https://huggingface.co/Maldak123/TOTVS_Upsell_V3

No se encontraron papers, repositorios adicionales ni demos.## Resumen
Maldak123/TOTVS_Concorrencia_V3 es un modelo de clasificación de texto basado en XLM-RoBERTa-base, fine-tuned por el autor Maldak123 (Miguel Amaro) para detectar menciones de benchmarking con competidores en reuniones B2B en portugués. El modelo tiene 278 millones de parámetros (0,1B) y se entrenó con un dataset de 77 347 reuniones B2B. Su licencia MIT permite uso comercial y modificación.

La relevancia de este modelo reside en su aplicación en inteligencia comercial y análisis de conversaciones de ventas. Sin embargo, las métricas publicadas en la model card son alarmantes: aunque la accuracy alcanza 0.9996, la precisión, recall y F1 son 0.0, y el ROC-AUC es de 0.5395. Esto indica que el modelo predice siempre la clase mayoritaria (probablemente la negativa) y no tiene capacidad discriminativa real. Por tanto, no es apto para producción sin un re-entrenamiento adecuado y una evaluación correcta del desbalance de clases.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (fine-tuned) |
| Parametros totales | 278 045 186 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (típico de XLM-RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantización) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de XLM-RoBERTa-base, un transformer encoder pre-entrenado por Facebook AI con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. Se fine-tune sobre un dataset de 77 347 reuniones B2B en portugués para una tarea de clasificación binaria. No se especifican detalles del entrenamiento: ni número de épocas, ni batch size, ni estrategia de balance de clases, ni uso de regularización o técnicas como oversampling. No se indica el uso de RLHF, DPO u otros métodos de alineación.

La innovación técnica se limita a la adaptación de un modelo preentrenado a un dominio específico, sin modificaciones arquitectónicas. La model card solo reporta métricas de accuracy, precisión, recall, F1 y ROC-AUC, sin detalles sobre la distribución de las clases ni la validación. Dado que la precisión y recall son cero, es probable que el modelo haya aprendido a predecir siempre la clase negativa, lo que produce una accuracy alta pero una capacidad nula de detección de la clase positiva (benchmarking).

## Capacidades
- Clasificación binaria de texto en portugués: detecta si una reunión B2B contiene benchmarking con competidores.
- No es un modelo generativo: solo asigna una etiqueta (positiva o negativa) a una secuencia de texto.
- No soporta tool calling, agentes, razonamiento multi-step ni funciones de función.
- No es multilingüe; solo funciona con portugués.
- No tiene capacidades de visión ni audio.
- La salida es una probabilidad o logit para la clase positiva.

## Casos de uso
- Análisis de transcripciones de reuniones comerciales: procesar archivos de texto de reuniones y etiquetar si se menciona competencia, útil para priorizar acciones en el CRM.
- Automatización de informes de inteligencia competitiva: integrar el modelo en un pipeline que procese múltiples reuniones y genere reportes de menciones de competidores.
- Filtrado de reuniones en un sistema de gestión de clientes (p.ej. TOTVS) para identificar oportunidades donde se discute competencia.
- Análisis de correos electrónicos de ventas: adaptar el modelo a ese dominio (aunque no está entrenado para ello) para detectar menciones de competidores.
- Sistema de alertas en tiempo real en llamadas de ventas: integrar el modelo en un servicio de streaming que procese transcripciones y emita alertas cuando se hable de competencia.
- Investigación académica sobre detección de intención en conversaciones B2B en portugués.

Advertencia: dado el rendimiento actual del modelo, estos casos solo son viables tras un re-entrenamiento con datos balanceados y evaluación adecuada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única tabla de métricas es la proporcionada por el autor:

| Metrica | Score |
|---|---|
| Accuracy | 0.9996 |
| Precision | 0.0000 |
| Recall | 0.0000 |
| F1 Score | 0.0000 |
| ROC-AUC | 0.5395 |

Estos valores indican que el modelo no detecta la clase positiva y predice siempre la clase negativa. El ROC-AUC de 0.5395 está cerca del azar (0.5), confirmando que no hay capacidad discriminativa. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: alrededor de 1 GB en FP32 (278M parámetros) o ~0.5 GB en FP16. Con batch de 1, se necesita ~1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, T4, RTX 3060, RTX 4070. También se puede ejecutar en CPU con 4-8 GB de RAM.
- Sí cabe en GPU de consumo (p.ej. RTX 3060, RTX 4070).
- Opciones de despliegue: Transformers de Hugging Face, ONNX Runtime, FastAPI para API REST. No es compatible con vLLM, llama.cpp u Ollama porque es un modelo encoder, no generativo.
- Latencia y throughput estimados: no disponibles. En una GPU T4, la latencia por secuencia sería del orden de decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (detección de benchmarking en reuniones B2B). Como referencia genérica, se podrían considerar otros clasificadores en portugués como BERTimbau (base) o XLM-RoBERTa-base fine-tuned en otros dominios, pero no hay comparación publicada. La comparativa queda no disponible.

## Limitaciones y advertencias
- El modelo tiene precisión y recall nulos, lo que indica que no detecta la clase de interés y solo predice la clase principal. No es apto para uso en producción.
- La accuracy de 0.9996 es engañosa por el desbalance de clases; no refleja la capacidad real del modelo.
- El ROC-AUC de 0.5395 confirma que la discriminación es casi aleatoria.
- El modelo solo soporta portugués; no funciona en otros idiomas.
- No se especifica el balance del dataset ni los detalles del entrenamiento, lo que impide reproducir o validar los resultados.
- La licencia MIT permite uso comercial, pero el rendimiento actual no justifica el despliegue.
- El riesgo de falsos negativos es alto: si se usa el modelo, se perderían todas las reuniones con benchmarking.
- Limitación de contexto de 512 tokens: las reuniones más largas deben truncarse, lo que puede perder información relevante.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Maldak123/TOTVS_Concorrencia_V3
- Perfil del autor: https://huggingface.co/Maldak123
- Modelo relacionado (TOTVS_Upsell_V3): https://huggingface.co/Maldak123/TOTVS_Upsell_V3

No se encontraron papers, repositorios adicionales ni demos.
