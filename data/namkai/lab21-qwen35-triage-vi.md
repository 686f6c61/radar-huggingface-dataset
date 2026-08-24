# NamKAI/lab21-qwen35-triage-vi

## Resumen

NamKAI/lab21-qwen35-triage-vi es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario NamKAI en HuggingFace, diseñado para ajustar el modelo base unsloth/Qwen3.5-4B a una tarea específica de triaje de tickets de soporte al cliente. Según la información disponible, el adaptador fue entrenado mediante aprendizaje supervisado (SFT) sobre 225 tickets de soporte sintéticos en vietnamita (el sufijo "vi" del nombre sugiere vietnamita), y su salida es un JSON con cuatro campos, probablemente una clasificación o categorización de los tickets.

Se trata de un adaptador Peft (LoRA) con un tamaño de repositorio de 0,1 GB, lo que indica que no es un modelo completo, sino un conjunto de pesos diferenciales que deben combinarse con el modelo base. La ficha del autor es prácticamente vacía (plantilla estándar sin rellenar), por lo que la mayoría de las especificaciones técnicas, datos de entrenamiento y rendimiento no están disponibles públicamente. A pesar de su limitada documentación, el modelo parece orientado a aplicaciones de atención al cliente en vietnamita, aunque su utilidad real dependerá de la calidad del ajuste y de la validación con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre base transformer (Qwen3.5-4B, variante no oficial de la familia Qwen) |
| Parametros totales | No disponible (adaptador LoRA, el modelo base tiene 4B) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No disponible (hereda del modelo base, típicamente 32K en Qwen) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base, que puede cuantizarse) |
| Idiomas soportados | No disponible (el nombre sugiere vietnamita, pero no confirmado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de baja dimensión que se añaden a las capas del modelo base (unsloth/Qwen3.5-4B) para adaptarlo a una tarea específica sin reentrenar todos los pesos. El entrenamiento se realizó mediante aprendizaje supervisado (SFT) usando las librerías PEFT (v0.20.0) y TRL, como indican los tags del repositorio. El dataset de entrenamiento consta de 225 tickets de soporte al cliente sintéticos, en vietnamita según la referencia, y la tarea es generar una salida JSON con cuatro campos, probablemente relacionados con la clasificación del ticket (categoría, prioridad, etc.). No se han publicado detalles sobre el número de épocas, hiperparámetros o estrategias de regularización.

## Capacidades

- Generación de texto estructurado: el adaptador está entrenado para emitir JSON con cuatro campos a partir de un ticket de soporte.
- Clasificación de tickets: por el nombre "triage", es probable que el modelo asigne categorías, prioridades o estados a los tickets.
- Soporte de tool calling: no hay evidencia de que el adaptador añada esta capacidad; dependerá del modelo base.
- Capacidades multilingües: el modelo base Qwen3.5-4B soporta varios idiomas, pero el adaptador está específicamente entrenado en vietnamita, por lo que su rendimiento en otros idiomas será degradado.
- No se han documentado otras capacidades (visión, audio, razonamiento avanzado).

## Casos de uso

- Automatización de triaje de tickets de soporte: el adaptador puede integrarse en un sistema de atención al cliente para clasificar automáticamente las incidencias entrantes en categorías y prioridades, facilitando la asignación a equipos adecuados.
- Generación de informes de tickets: dado un ticket de texto libre, el modelo puede extraer cuatro campos relevantes (p. ej., tipo de problema, urgencia, afectación, solución) y devolverlos en formato JSON para su integración en bases de datos o sistemas de gestión.
- Preprocesamiento de datos de soporte: en un pipeline de análisis de tickets, el adaptador puede normalizar y estructurar datos no estructurados para alimentar dashboards o modelos de analítica.
- Entrenamiento de modelos de clasificación: el adaptador puede servir como base para un sistema de clasificación más complejo, o como generador de datos sintéticos para entrenar otros modelos.
- Asistente de atención al cliente en vietnamita: combinado con el modelo base, puede ayudar a los agentes a resumir y categorizar conversaciones, reduciendo el tiempo de respuesta.
- Pruebas de concepto en entornos con recursos limitados: al ser un adaptador pequeño (0,1 GB), se puede desplegar sobre un modelo base cuantizado para evaluar rápidamente la viabilidad de un sistema de triaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de rendimiento, comparaciones con otros modelos ni evaluaciones formales. El autor no ha compartido datos de precisión, F1 o cualquier otra medida.

## Requisitos de hardware

- El adaptador LoRA en sí mismo es muy ligero (0,1 GB), pero requiere el modelo base completo para funcionar. El modelo base Qwen3.5-4B (variante de la comunidad) tiene aproximadamente 4 mil millones de parámetros.
- Para inferencia con el modelo base en FP16, se necesitan alrededor de 8 GB de VRAM. Con cuantización Q4_K_M, se puede reducir a unos 3-4 GB.
- Es factible ejecutarlo en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores. En servidores, una A10G o A100 sería suficiente.
- Opciones de despliegue: se puede usar con transformers + PEFT para cargar el adaptador, o convertirlo a GGUF y usar llama.cpp u Ollama, aunque la conversión de un adaptador LoRA a GGUF es menos estándar. También se puede usar vLLM si se integra como un adaptador LoRA (vLLM soporta LoRA).
- Latencia: depende del hardware y de la longitud del ticket. En una RTX 4090, se espera una generación de 30-50 tokens/segundo para un modelo de 4B en FP16. No hay datos específicos.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables con este adaptador específico (triaje de tickets en vietnamita con JSON de cuatro campos). En el ecosistema de Qwen, existen adaptadores LoRA para tareas de clasificación, pero no hay referencias públicas que permitan una comparación justa. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La documentación del autor es casi inexistente: no hay detalles sobre el dataset, el proceso de entrenamiento, los hiperparámetros, ni evaluaciones. Esto impide conocer la calidad del modelo.
- El dataset de entrenamiento es muy pequeño (225 muestras), lo que aumenta el riesgo de sobreajuste y de bajo rendimiento en datos reales diversos.
- El idioma está orientado al vietnamita según el nombre y la referencia, pero no se ha confirmado. Si se usa en español u otros idiomas, el rendimiento será muy pobre.
- No hay evidencia de que el modelo base (unsloth/Qwen3.5-4B) sea un modelo oficial de Qwen; es una variante no oficial, lo que puede implicar riesgos de calidad o de licencia.
- La licencia del adaptador no está especificada, lo que impide conocer si se permite uso comercial o modificación.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar salidas incorrectas o inventar campos JSON si la entrada es ambigua.
- No se recomienda su uso en producción sin una evaluación exhaustiva con datos reales y sin validar la calidad de las salidas.

## Enlaces

- [HuggingFace: NamKAI/lab24-qwen35-triage-vi](https://huggingface.co/NamKAI/lab24-qwen35-triage-vi)
- [Referencia similar: NiallHoang/lab21-qwen35-triage-vi](https://huggingface.co/NiallHoang/lab21-qwen35-triage-vi)
- [Registro en free2aitools](https://free2aitools.com/model/pham039459/lab21-qwen35-triage-vi)
- [Modelo base unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B) (no verificado)
