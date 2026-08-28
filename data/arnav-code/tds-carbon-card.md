# Arnav-code/tds-carbon-card

## Resumen

El repositorio `Arnav-code/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de modelo realizado en el marco del curso TDS GA8. Documenta la huella de CO₂ equivalente, el consumo energético y las especificaciones de hardware de una ejecución de fine-tuning sobre una NVIDIA T4. Es un ejemplo de práctica de "Green AI" para auditar el impacto ambiental del entrenamiento de modelos, pero no ofrece pesos, arquitectura ni capacidades de inferencia. Su relevancia radica en la transparencia sobre el coste energético del aprendizaje automático, no en su funcionalidad como modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos adicionales del entrenamiento documentado:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA T4 (5 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region | ap-southeast1 |
| Horas de GPU | 80 h (PUE: 1.49) |
| Energia total | 41.72 kWh |
| Emisiones de CO₂ | 20.026 kg CO₂eq |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de red neuronal, ya que el repositorio no incluye el modelo entrenado ni sus pesos. La informacion disponible se limita a los metadatos del proceso de entrenamiento: se utilizaron 5 GPUs NVIDIA T4 durante 80 horas en la region ap-southeast1, con un factor de eficiencia energetica (PUE) de 1.49. El consumo total fue de 41.72 kWh, lo que genero 20.026 kg de CO₂ equivalente, calculado con la herramienta CodeCarbon. No hay datos sobre el dataset, el numero de tokens ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision u otras.
- Unicamente documenta la huella de carbono de un entrenamiento especifico.
- No soporta tool calling, agentes ni procesamiento multilingue.

## Casos de uso

- Auditoria de emisiones de carbono en proyectos de IA: el repositorio sirve como plantilla para registrar el coste ambiental de un entrenamiento, permitiendo a equipos de investigacion reportar sus emisiones de forma estandarizada.
- Educacion en Green AI: puede utilizarse como ejemplo en cursos sobre sostenibilidad en aprendizaje automatico para ensenar a calcular y reportar la huella de CO₂.
- Comparacion de eficiencia energetica entre configuraciones de hardware: al contrastar este registro con otros similares (p. ej., los de otros estudiantes), se puede analizar como varia el consumo segun el tipo de GPU y la region.
- Cumplimiento de politicas de transparencia ambiental: organizaciones que requieran publicar informes de impacto ambiental de sus entrenamientos pueden adoptar este formato.
- Investigacion sobre optimizacion de recursos: los datos de PUE, horas de GPU y energia pueden alimentar estudios sobre como reducir el coste energetico del fine-tuning.
- Documentacion de reproducibilidad: aunque no incluye el modelo, el registro de hardware y energia complementa la informacion necesaria para reproducir un entrenamiento y evaluar su sostenibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene metricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) porque no se trata de un modelo de IA.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento documentado utilizo 5 GPUs NVIDIA T4, con un consumo total de 41.72 kWh y 80 horas de computo.
- No se proporcionan requisitos de VRAM, latencia ni throughput.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos que servir.

## Comparativa con modelos similares

No existe una categoria de modelos comparable, dado que este repositorio no es un modelo de IA. Sin embargo, se pueden comparar los registros de emisiones de otros repositorios similares del mismo curso:

| Repositorio | Hardware | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|
| Arnav-code/tds-carbon-card | NVIDIA T4 (5 GPUs) | 80 | 41.72 | 20.026 |
| 23f3001222/tds-carbon-card | NVIDIA A100 (3 GPUs) | 206.6 | 384.276 | 76.855 |
| 24f2006741/tds-carbon-card | NVIDIA V100 (5 GPUs) | 476.9 | 1022.95 | 122.754 |

Estos datos muestran diferencias significativas en el coste ambiental segun el hardware y la duracion del entrenamiento, pero no permiten comparar rendimiento de modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni capacidades de inferencia. Cualquier intento de usarlo como tal fallara.
- La informacion de emisiones se basa en estimaciones de CodeCarbon y puede no reflejar el impacto real completo (p. ej., fabricacion de hardware, refrigeracion adicional).
- No se especifica la licencia, por lo que el uso del contenido del repositorio puede tener restricciones legales no documentadas.
- Los datos de entrenamiento (dataset, configuracion) no estan disponibles, lo que limita la reproducibilidad.
- El repositorio parece ser un ejercicio academico, no un recurso listo para produccion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Arnav-code/tds-carbon-card
- Repositorio similar de Pranav1003: https://huggingface.co/Pranav1003/tds-carbon-card
- Repositorio similar de 23f3001222: https://huggingface.co/23f3001222/tds-carbon-card
- Repositorio similar de 24f3005108: https://huggingface.co/24f3005108/tds-carbon-card
- Repositorio similar de AvanthikaShydh: https://huggingface.co/AvanthikaShydh/tds-carbon-card
- Repositorio similar de 24f2006741: https://huggingface.co/24f2006741/tds-carbon-card
