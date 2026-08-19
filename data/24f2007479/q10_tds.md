# 24F2007479/q10_tds

## Resumen

El repositorio `24F2007479/q10_tds` no contiene un modelo de inteligencia artificial, sino una documentación de contabilidad de carbono para una ejecución de entrenamiento realizada en el marco del curso TDS GA8. El autor, identificado como 24F2007479 (Dhruv Khanna), ha publicado esta ficha para registrar las emisiones de CO₂ equivalente asociadas a un proceso de pre-entrenamiento, siguiendo las prácticas de "Green AI" o IA sostenible.

El repositorio documenta un entrenamiento realizado con dos GPU NVIDIA L40S en la región `asia-south1`, con un consumo energético total de 139,7452 kWh y unas emisiones de 90,834 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se proporciona información sobre arquitectura, parámetros, tareas ni cualquier otra característica propia de un modelo de aprendizaje automático, por lo que esta ficha debe interpretarse como la revisión de un artefacto de metadatos medioambientales, no como la evaluación de un modelo funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM u otra), el número de parámetros, el dataset utilizado ni las técnicas de alineación aplicadas. El repositorio se limita a documentar los aspectos energéticos del entrenamiento.

Los únicos datos técnicos disponibles son los relativos al entorno de cómputo: se utilizaron dos GPU NVIDIA L40S en modo de pre-entrenamiento, con un total de 172,1 horas de cómputo GPU y un factor de eficiencia energética del centro de datos (PUE) de 1,16. El consumo energético total fue de 139,7452 kWh y las emisiones asociadas, calculadas con CodeCarbon, ascendieron a 90,834 kg de CO₂ equivalente. La ubicación geográfica del entrenamiento fue la región `asia-south1`.

## Capacidades

- No aplicable: este repositorio no contiene un modelo con capacidades de inferencia, generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad propia de un sistema de IA.
- La única funcionalidad del repositorio es documentar métricas de sostenibilidad de un proceso de entrenamiento.

## Casos de uso

- Auditoría de emisiones de carbono en proyectos de IA: el repositorio sirve como plantilla para registrar el impacto medioambiental de ejecuciones de entrenamiento, siguiendo el flujo de trabajo de CodeCarbon con datos de hardware, región y consumo energético.
- Cumplimiento de políticas de IA sostenible: organizaciones que necesitan reportar emisiones de CO₂ de sus cargas de entrenamiento pueden utilizar este tipo de documentación como evidencia en informes de responsabilidad medioambiental.
- Comparación de eficiencia entre configuraciones de hardware: los datos de GPU horas, energía y emisiones permiten contrastar el coste medioambiental de distintas infraestructuras de cómputo.
- Docencia e investigación en Green AI: el repositorio ejemplifica cómo documentar el coste energético de un entrenamiento, útil para cursos y trabajos académicos sobre IA responsable.
- Optimización de centros de datos: los valores de PUE y consumo pueden alimentar análisis sobre eficiencia de centros de datos en distintas regiones geográficas.
- Trazabilidad de experimentos: la inclusión de metadatos como región, hardware y modo de entrenamiento permite reconstruir el historial de ejecuciones de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no reporta métricas de calidad del modelo (MMLU, HumanEval, GSM8K u otras) porque no contiene un modelo evaluable.

## Requisitos de hardware

- El entrenamiento documentado utilizó 2 GPU NVIDIA L40S, cada una con 48 GB de VRAM.
- Las GPU L40S son tarjetas de la serie Ada Lovelace orientadas a centros de datos, no aptas para consumo doméstico.
- No se dispone de información sobre requisitos de hardware para inferencia, ya que el repositorio no incluye pesos ni artefactos de modelo.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo de IA, no existen modelos comparables en cuanto a arquitectura, parámetros o rendimiento. Los repositorios comparables serían otros artefactos de contabilidad de carbono en HuggingFace, pero no se dispone de información sobre ellos en la documentación proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional: no es posible realizar inferencia, generación ni ninguna tarea de IA con él.
- La licencia no está especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones (90,834 kg CO₂eq) dependen del factor de emisión de la región `asia-south1` y del PUE declarado; no son extrapolables a otras ubicaciones.
- No se indica qué modelo concreto se entrenó, por lo que la trazabilidad del artefacto es incompleta.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto académico sin adopción en producción.
- La fecha de creación (2026-08-19) y el contexto del curso TDS GA8 indican que es un ejercicio formativo, no un recurso destinado a uso productivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/24F2007479/q10_tds
- Perfil del autor en HuggingFace: https://huggingface.co/24F2007479
- Repositorio GitHub del autor (tds-ga7-release-gate): https://github.com/24f2007479/tds-ga7-release-gate
- Repositorio GitHub del autor (tds-p1-databot): https://github.com/24f2007479/tds-p1-databot
