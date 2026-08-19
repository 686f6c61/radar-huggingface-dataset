# mayankawrr/tds-ga8-green-ai-carbon-audit

## Resumen
Este artefacto, publicado como `mayankawrr/tds-ga8-green-ai-carbon-audit`, no es un modelo de inteligencia artificial sino un registro de auditoría de emisiones de carbono correspondiente a un trabajo de fine-tuning ejecutado sobre 8 GPU NVIDIA H100. Documenta el cálculo de la huella de CO2 equivalente (39,107 kg) siguiendo el estándar de metadatos `co2_eq_emissions` de Hugging Face, con datos de consumo energético, intensidad de red eléctrica y factor de eficiencia del centro de datos. Su relevancia radica en servir como ejemplo práctico de contabilidad de carbono para entrenamientos de IA, un tema creciente en el ámbito de la sostenibilidad computacional. No contiene pesos, arquitectura ni funcionalidad de inferencia; es exclusivamente un informe técnico.

## Especificaciones tecnicas
Dado que no es un modelo de IA, la mayoría de parámetros no aplican. Se indican los datos disponibles del registro de entrenamiento:

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin pesos) |

Datos del registro de entrenamiento (según la model card):

| Campo | Valor |
|---|---|
| GPU | NVIDIA H100 (8 unidades) |
| Horas de GPU | 30,9 |
| Region | europe-west4 |
| PUE | 1,13 |
| Tipo de entrenamiento | fine-tuning |
| Energia total | 195,535 kWh |
| Emisiones totales | 39,107 kg CO2eq |

## Arquitectura y entrenamiento
No existe arquitectura neuronal ni proceso de entrenamiento en el sentido convencional. El artefacto documenta un cálculo de emisiones basado en la fórmula: `energia_kWh = (TDP_watts * num_gpus * gpu_hours * PUE) / 1000`, usando un TDP de 700 W para la H100, 8 GPUs, 30,9 horas y un PUE de 1,13. La intensidad de carbono de la red eléctrica en `europe-west4` se fija en 200 gCO2eq/kWh, resultando en 195,535 kWh y 39,107 kg CO2eq. No hay innovación técnica más allá del propio procedimiento de medición y reporte.

## Capacidades
No aplica. Este artefacto no posee capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad propia de un modelo de IA. Es un documento estático con metadatos y cálculos.

## Casos de uso
Aunque no es un modelo funcional, puede utilizarse como referencia en los siguientes escenarios:

- Auditoría de emisiones de entrenamientos de IA: sirve como plantilla para calcular y reportar la huella de carbono de un trabajo de fine-tuning, siguiendo el estándar `co2_eq_emissions` de Hugging Face.
- Comparación de huella de carbono entre regiones: el propio registro incluye una nota mostrando que ejecutar el mismo trabajo en `europe-north1` reduciría las emisiones un 40% (de 39,107 a 23,464 kg CO2eq), lo que permite evaluar el impacto de la elección de región.
- Formación en sostenibilidad computacional: útil como caso práctico en cursos o guías sobre Green AI, mostrando cómo se desglosa el consumo energético y las emisiones de un entrenamiento real.
- Documentación de proyectos de IA responsable: puede adjuntarse a un repositorio de modelo para cumplir requisitos de transparencia ambiental.
- Estimación de costes energéticos: el cálculo de energía total (195,535 kWh) puede servir para estimar costes económicos o planificar presupuestos de cómputo.
- Benchmarking de eficiencia: comparar las emisiones reportadas con las de otros trabajos similares (por ejemplo, los de `harshit4/tds-ga8-green-ai-audit` o `anshusaurav/tds-ga8-carbon-model`) para identificar mejores prácticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible, ya que no se trata de un modelo de IA con métricas de rendimiento.

## Requisitos de hardware
No aplica para inferencia, pero se documenta el hardware utilizado en el entrenamiento auditado:

- 8 GPU NVIDIA H100, cada una con un TDP de 700 W.
- La ejecución requirió 30,9 horas de GPU en total.
- No se proporciona información sobre VRAM, latencia o throughput.
- El despliegue como modelo no es posible; el artefacto es un archivo de metadatos y documentación.

## Comparativa con modelos similares
Existen otros repositorios con el mismo propósito (auditoría de carbono para el mismo ejercicio TDS GA8), como `harshit4/tds-ga8-green-ai-audit` y `anshusaurav/tds-ga8-carbon-model`. No se dispone de los detalles de esos registros para comparar valores de emisiones o metodología. No hay modelos de IA comparables porque este artefacto no es uno.

## Limitaciones y advertencias
- No es un modelo de IA: no puede ejecutarse ni utilizarse para ninguna tarea de procesamiento del lenguaje, visión u otra.
- La licencia no está especificada, por lo que su uso comercial no está claramente permitido.
- Los datos de emisiones se basan en valores de referencia (TDP, intensidad de red) que pueden no reflejar el consumo real de energía de las GPU, que varía según la carga de trabajo.
- El cálculo asume un PUE constante de 1,13, que puede no ser representativo de todos los centros de datos.
- La intensidad de carbono de la red eléctrica (200 gCO2eq/kWh) es un valor promedio; el valor real puede fluctuar horariamente.
- No se incluyen emisiones asociadas a la fabricación del hardware ni al ciclo de vida completo, solo al consumo eléctrico durante el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado o nulo.

## Enlaces
- HuggingFace: https://huggingface.co/mayankawrr/tds-ga8-green-ai-carbon-audit
- Repositorio GitHub relacionado: https://github.com/iitm-mayank16/tds-ga8
- Otros registros similares: https://huggingface.co/harshit4/tds-ga8-green-ai-audit , https://huggingface.co/anshusaurav/tds-ga8-carbon-model
