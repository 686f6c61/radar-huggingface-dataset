# jayiitm/tds-carbon-card

## Resumen

El repositorio `jayiitm/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono y energía asociada a un entrenamiento de modelo realizado en el marco de la asignatura TDS GA8. El autor, `jayiitm`, documenta las emisiones de CO₂ equivalente (12,540 kg) y el consumo energético (62,7004 kWh) de un proceso de pre-entrenamiento ejecutado sobre 7 GPU NVIDIA T4 en la región europe-west4 de Google Cloud. Esta práctica se enmarca en la iniciativa Green AI, que busca visibilizar el impacto ambiental del entrenamiento de modelos.

El repositorio no incluye pesos, arquitectura ni código de ningún modelo. Se trata únicamente de un registro de metadatos ambientales con formato de model card, probablemente como ejercicio académico. Su relevancia radica en ejemplificar cómo documentar la huella de carbono en proyectos de IA, una práctica cada vez más demandada por la comunidad y los organismos reguladores. No es un recurso utilizable para desarrollo o investigación, sino una plantilla de reporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura, ya que el repositorio no contiene un modelo. Los únicos datos de entrenamiento documentados son: hardware NVIDIA T4 (7 GPUs), modo pre-training, región europe-west4, 91,4 horas de GPU (con PUE de 1,4), energía total de 62,7004 kWh y emisiones de 12,540 kg CO₂eq. No se indica el dataset, el número de tokens ni el tipo de modelo entrenado. La metodología de cálculo parece basarse en CodeCarbon, tal como se refleja en los metadatos YAML de la model card.

## Capacidades

- No dispone de capacidades de generación de texto, razonamiento, código, visión u otras propias de un modelo de IA.
- Funciona como un documento de registro de emisiones y consumo energético.
- Permite auditar el impacto ambiental de un entrenamiento concreto.
- No ofrece soporte para tool calling, agentes ni procesamiento multilingüe.

## Casos de uso

- Reporte de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar emisiones de CO₂ en entrenamientos, útil para empresas que deben publicar informes de impacto ambiental.
- Cumplimiento de políticas Green AI: puede utilizarse como ejemplo en cursos universitarios o programas de formación sobre IA responsable.
- Auditoría interna de infraestructura: los datos de GPU horas y energía permiten comparar la eficiencia de diferentes configuraciones de hardware.
- Investigación en eficiencia energética: los valores registrados pueden alimentar estudios sobre el coste ambiental de entrenar modelos en distintas regiones y hardware.
- Transparencia en publicaciones académicas: los autores pueden adjuntar este tipo de tarjeta a sus papers para declarar la huella de carbono de sus experimentos.
- Benchmarking de centros de datos: los datos de PUE y emisiones ayudan a evaluar la sostenibilidad de proveedores cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento de ningún modelo.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPU NVIDIA T4, pero no se especifican requisitos para inferencia porque no hay modelo.
- No se proporcionan estimaciones de VRAM, latencia o throughput.
- No es aplicable a despliegue con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

Existen otros repositorios con el mismo propósito en Hugging Face, todos derivados de la misma asignatura TDS GA8. La comparación se centra en los datos de entrenamiento registrados:

| Repositorio | Hardware | Modo | Región | GPU horas | Energía (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| jayiitm/tds-carbon-card | NVIDIA T4 (7 GPUs) | pre-training | europe-west4 | 91,4 | 62,7004 | 12,540 |
| shyam1504/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| chandrasekhariitm/tds-carbon-card | NVIDIA L40S (4 GPUs) | fine-tuning | europe-north1 | 90,4 | 145,544 | 17,465 |

Los tres son ejemplos de model cards de carbono, no modelos de IA comparables en capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni código de inferencia.
- Los datos de emisiones dependen de la metodología CodeCarbon y de factores como el PUE; pueden no ser comparables con otros cálculos.
- No se especifica la licencia de uso del contenido, por lo que su reutilización comercial es incierta.
- La información es incompleta: no se indica el dataset, la duración real del entrenamiento ni el tipo de modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un ejercicio académico sin mantenimiento posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jayiitm/tds-carbon-card
- Repositorio similar (shyam1504): https://huggingface.co/shyam1504/tds-carbon-card
- Repositorio similar (chandrasekhariitm): https://huggingface.co/chandrasekhariitm/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/Jayiitm
