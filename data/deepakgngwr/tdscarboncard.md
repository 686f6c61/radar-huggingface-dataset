# deepakgngwr/tdscarboncard

## Resumen
Este repositorio, identificado como `deepakgngwr/tdscarboncard`, no contiene un modelo de inteligencia artificial, sino una documentación de contabilidad de carbono y energía correspondiente a una ejecución de entrenamiento de un modelo dentro del curso TDS GA8. El autor, deepakgngwr, ha registrado las emisiones de CO₂ equivalente (16,175 kg) y el consumo energético total (134,79 kWh) asociados a un entrenamiento de preentrenamiento realizado en cinco GPU NVIDIA T4 en la región `europe-north1`. No se publican pesos, arquitectura ni capacidades de inferencia; es un ejercicio de transparencia ambiental en IA, alineado con las prácticas de "Green AI". Su relevancia actual reside en la creciente demanda de informes de huella de carbono en el desarrollo de modelos, aunque no ofrece ningún recurso funcional para desarrolladores o investigadores.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento
No se describe ninguna arquitectura de modelo (transformer, MoE, SSM, etc.) ni se detallan datos de entrenamiento como número de tokens o composición del dataset. La información disponible se limita al entorno de entrenamiento: 5 GPU NVIDIA T4, modo de pre-training, 308,1 horas de GPU (con PUE 1,25), consumo energético total de 134,7938 kWh y emisiones de CO₂ equivalente de 16,175 kg. No se mencionan técnicas de optimización, RLHF, DPO ni decodificación especulativa.

## Capacidades
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra funcionalidad propia de un modelo de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües ni modos especiales (thinking, visión, audio, etc.).
- Su único contenido es un informe de emisiones y consumo energético.

## Casos de uso
- Auditoría de huella de carbono en entrenamiento de IA: el repositorio sirve como plantilla para documentar emisiones y consumo de un entrenamiento, útil para organizaciones que deban reportar impacto ambiental.
- Cumplimiento de normativas de sostenibilidad: puede emplearse como evidencia de las emisiones asociadas a un entrenamiento concreto en procesos de certificación o de reporte interno.
- Investigación en Green AI: los datos (308,1 GPU-h, 134,79 kWh, 16,175 kg CO₂eq) pueden servir de referencia para comparar la eficiencia energética de distintos entrenamientos.
- Educación en computación sostenible: material didáctico para enseñar cómo se calcula la huella de carbono en IA y qué factores (hardware, región, PUE) influyen.
- Documentación de proyectos académicos: en el contexto del TDS GA8, este repositorio puede ser un entregable académico para demostrar la práctica de contabilidad de carbono.
- No es adecuado para ninguna tarea de inferencia, generación o procesamiento de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad, precisión o rendimiento del modelo, ya que no existe modelo.

## Requisitos de hardware
- No se requiere hardware para su uso; es un documento de texto.
- El entrenamiento documentado se realizó con 5 GPU NVIDIA T4, lo que da una referencia de hardware para reproducir el mismo entrenamiento (aunque no se especifica el modelo).
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que desplegar.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares
No disponible. No existe categoría de modelos comparable, ya que este repositorio no es un modelo de IA. Se podría comparar con otros informes de emisiones de entrenamiento, pero no hay datos públicos de otros repositorios de este tipo en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo de IA: no puede ser utilizado para ninguna tarea de procesamiento de lenguaje, generación o razonamiento.
- Los datos de emisiones y energía están asociados a un entrenamiento concreto y no son generalizables a otros modelos o configuraciones.
- La licencia no está disponible, por lo que no se garantiza su uso comercial o modificación sin permiso explícito.
- No se especifica la metodología completa del cálculo de emisiones (por ejemplo, factor de intensidad de la red eléctrica de europe-north1), lo que limita la reproducibilidad.
- El repositorio fue creado en 2026 y puede estar desactualizado respecto a las prácticas actuales de contabilidad de carbono.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/deepakgngwr/tdscarbonbond
- Repositorio de GitHub (posiblemente relacionado): https://github.com/deepakgngwr/tds-june-2026/tree/main
- Proyecto TDS GA4 (relacionado): https://github.com/deepakgngwr/tds-ga4/blob/main/main.py
- Base de datos de modelos (referencia externa): https://models.dev/
