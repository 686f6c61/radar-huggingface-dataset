# Aman-Winner/tds-carbon-card

## Resumen

El repositorio `Aman-Winner/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco del curso TDS GA8 (Green AI). Documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, junto con el hardware utilizado, la región y el consumo energético. Es un ejemplo de aplicación de prácticas de "IA verde" para medir y reportar el impacto ambiental de los entrenamientos.

Este tipo de repositorios son relevantes para la comunidad de desarrolladores e investigadores porque permiten auditar y comparar la sostenibilidad de distintos procesos de entrenamiento, un aspecto cada vez más crítico en el despliegue de modelos. Sin embargo, al no tratarse de un modelo con capacidades de inferencia, no puede utilizarse para tareas de generación, razonamiento o procesamiento de lenguaje natural.

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

## Arquitectura y entrenamiento

No existe una arquitectura de modelo definida en este repositorio. La información disponible indica que se trata de un registro de un proceso de fine-tuning, aunque no se especifica sobre qué modelo base se realizó. Los datos de entrenamiento documentados incluyen:

- Hardware: 6 GPUs NVIDIA T4
- Modo de entrenamiento: fine-tuning
- Región: asia-south1
- Horas de GPU: 303,4 horas (con PUE de 1,2)
- Energía total consumida: 152,9136 kWh
- Emisiones de CO₂ equivalente: 99,394 kg CO₂eq

Estos datos fueron generados mediante la herramienta CodeCarbon, que estima las emisiones a partir del consumo energético y la ubicación geográfica. No se mencionan técnicas de entrenamiento como RLHF, DPO ni ninguna innovación arquitectónica.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingüe ni tiene modo de pensamiento.
- Su única función es documentar métricas de sostenibilidad de un entrenamiento concreto.

## Casos de uso

- Auditoría de sostenibilidad: permite a organizaciones verificar el impacto ambiental de sus procesos de entrenamiento y comparar con estándares internos o externos.
- Reporte de cumplimiento: sirve como evidencia para reportes de responsabilidad social corporativa o requisitos regulatorios sobre emisiones de carbono.
- Investigación en Green AI: proporciona datos empíricos para estudios sobre eficiencia energética en el entrenamiento de modelos.
- Optimización de infraestructura: los datos de consumo y emisiones pueden usarse para decidir entre diferentes regiones o tipos de hardware.
- Educación: es un ejemplo práctico de cómo documentar la huella de carbono en un curso o taller sobre IA responsable.
- Comparativa de proveedores cloud: los valores de emisiones por región pueden ayudar a elegir proveedores con menor impacto ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, ya que no es un modelo en sí.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El hardware documentado para el entrenamiento fue: 6 GPUs NVIDIA T4.
- No se proporcionan requisitos de VRAM, latencia ni throughput.
- No existen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos ni arquitectura.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, dado que este repositorio no es un modelo de IA. Los repositorios similares encontrados en la búsqueda web (`amankumarmahali/tds-carbon-card`, `24f1002805/tds-carbon-card`) son variaciones del mismo ejercicio académico y contienen la misma estructura de datos de emisiones.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de procesamiento de lenguaje, visión u otra modalidad.
- Los datos de emisiones son estimaciones basadas en CodeCarbon y dependen de factores como la precisión del PUE y la intensidad de carbono de la red eléctrica de la región.
- La licencia no está especificada, por lo que no se garantiza su uso comercial o redistribución.
- El repositorio no contiene código, pesos ni documentación técnica adicional más allá de la model card.
- La fecha de creación (2026-08-28) es futura respecto a la fecha actual, lo que sugiere que podría tratarse de un registro simulado o de un ejercicio con fechas ficticias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aman-Winner/tds-carbon-card
- Repositorio similar (amankumarmahali): https://huggingface.co/amankumarmahali/tds-carbon-card
- Repositorio similar (24f1002805): https://huggingface.co/24f1002805/tds-carbon-card
- Sitio de Aman.ai (autor): https://aman.ai/
