# chrollo1107/green-ai-model-card

## Resumen
La tarjeta de modelo `chrollo1107/green-ai-model-card` no describe un modelo de inteligencia artificial funcional, sino un registro de contabilidad de carbono asociado al entrenamiento de un modelo no especificado. El contenido se limita a una declaración de emisiones de CO2 equivalente, calculadas mediante la herramienta CodeCarbon, con datos concretos de hardware, tiempo de cómputo y ubicación geográfica. No se proporciona arquitectura, tamaño, pesos, ni ninguna capacidad técnica del supuesto modelo entrenado.

La relevancia de esta tarjeta reside en su contribución a la transparencia medioambiental en el desarrollo de IA, siguiendo la tendencia de reportar el impacto ecológico de los entrenamientos. Sin embargo, para un desarrollador o investigador que necesite evaluar un modelo para uso práctico, esta entrada carece de toda información funcional y no es utilizable como modelo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura. El único dato de entrenamiento es el informe de emisiones: se utilizaron 5 GPUs NVIDIA L40S durante 287.6 horas en la región europe-west4, con un consumo total de 603.960 kWh y 120.792 kg de CO2 equivalente. No se menciona el conjunto de datos, el número de tokens, ni técnicas de alineación como RLHF o DPO. La tarjeta se limita a documentar la huella de carbono del proceso.

## Capacidades

- No se describe ninguna capacidad del modelo, ya que no se trata de un modelo de IA desplegable.
- No hay soporte para generación de texto, código, visión, tool calling, agentes ni razonamiento.
- No se indica ninguna capacidad multilingüe.

## Casos de uso

- Auditoría medioambiental: la tarjeta puede utilizarse como ejemplo de cómo reportar emisiones de entrenamiento de modelos, siguiendo el estándar propuesto por el framework Green AI Model.
- Investigación en sostenibilidad: sirve como dato de referencia para estudios sobre el coste ecológico del entrenamiento de modelos con hardware específico (NVIDIA L40S).
- Concienciación en equipos de desarrollo: puede usarse en documentación interna para concienciar sobre el impacto energético de los entrenamientos.
- Verificación de transparencia: como registro de cumplimiento para proyectos que exigen declaraciones de sostenibilidad.
- No es utilizable para ninguna tarea de IA práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los únicos datos de hardware provienen del entrenamiento, no de inferencia: 5 GPUs NVIDIA L40S, con 287.6 horas de uso.
- No se indica la VRAM necesaria para ejecutar el modelo en producción.
- No se proporcionan recomendaciones de GPU para inferencia.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe información sobre otros modelos comparables, ya que esta tarjeta no describe un modelo funcional.

## Limitaciones y advertencias

- La tarjeta no contiene ningún artefacto de modelo (pesos, tokenizador, configuraciones) que permita su uso real.
- No hay indicación de licencia para el contenido del modelo card; el uso del registro de carbono podría estar sujeto a las condiciones del repositorio.
- El cálculo de emisiones se basa en TDP y PUE estimados, no en mediciones directas de consumo energético, lo que introduce incertidumbre en las cifras.
- La región europe-west4 corresponde a un centro de datos de Google Cloud, pero no se indica el proveedor exacto ni el mix energético específico.
- No se puede evaluar la calidad de ningún modelo subyacente, ya que no existe.

## Enlaces

- [HuggingFace: chrollo1107/green-ai-model-card](https://huggingface.co/chrollo1107/green-ai-model-card)
- [Green AI Model - Introduction](https://green-ai-model.github.io/)
- [Green AI Model - Documentación](https://green-ai-model.github.io/docs/1_introduction/)
