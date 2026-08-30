# Rin247/Qwen3-8B-Uncensored-Aquarion-INT4

## Resumen

Qwen3-8B-Uncensored-Aquarion-INT4 es una cuantización INT4 weight-only del modelo Qwen3-8B de Alibaba, modificada mediante abliteration para eliminar los mecanismos de rechazo. La abliteration se aplicó mediante proyección ortogonal de la dirección de rechazo (refusal direction) antes de la cuantización, como parte del proyecto "Genesis of Aquarion" del autor Rin247. El resultado es un modelo que no muestra comportamientos de negativa ante peticiones que el modelo base consideraría inapropiadas o peligrosas.

El modelo combina dos técnicas: la abliteration, que elimina el comportamiento de rechazo, y la cuantización INT4 mediante RTN (Round-To-Nearest) realizada en CPU, con las escalas almacenadas junto a los pesos en formato safetensors. Según los metadatos de safetensors, el modelo contiene 4.717.851.648 parámetros (el modelo base Qwen3-8B tiene aproximadamente 8,18 mil millones), con un tamaño de repositorio de 6,1 GB.

Su relevancia radica en dos aspectos: permite ejecutar un modelo de la familia Qwen3 con requisitos de VRAM reducidos, y sirve como caso de estudio para investigar los efectos de la abliteration sobre las capacidades y el comportamiento de los modelos de lenguaje. Sin embargo, el formato de cuantización es personalizado y requiere de decuantización manual antes de poder usar el modelo con motores de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B) |
| Parametros totales | 4.717.851.648 (según metadatos safetensors; el modelo base Qwen3-8B tiene ~8,18B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | No disponibles en la model card |
| Licencia | No disponible en la model card |
| Formato de pesos | safetensors (INT4 weight-only con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso desarrollado por Alibaba Qwen Team. Qwen3-8B incorpora capacidades de modo thinking (razonamiento extendido) y non-thinking, soporte de tool calling y una ventana de contexto nativa de 32K tokens, ampliable a 131K con extensiones YaRN.

La modificación principal de este modelo es la abliteration, una técnica que identifica la dirección de rechazo en el espacio de activaciones del modelo y la elimina mediante proyección ortogonal. Esto hace que el modelo deje de rechazar peticiones que el modelo base consideraría inapropiadas, ilegales o poco éticas. La abliteration se aplicó antes de la cuantización.

La cuantización se realizó con RTN (Round-To-Nearest) en CPU, almacenando los pesos en formato INT4 weight-only junto con buffers de escala y forma (`*.weight_scale`, `*.weight_shape`). Este formato es personalizado y no es directamente compatible con motores de inferencia estándar: requiere un paso previo de decuantización utilizando las escalas y formas almacenadas.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3-8B, incluyendo modo thinking y non-thinking.
- Ausencia de mecanismos de rechazo: el modelo responde a peticiones que el modelo base rechazaría, incluyendo contenido ilegal o poco ético.
- Soporte de tool calling y function calling heredado de Qwen3-8B.
- Capacidades multilingües heredadas de Qwen3-8B (principalmente inglés y chino, con soporte adicional para otros idiomas).
- Generación de código y capacidades matemáticas heredadas de Qwen3-8B.
- No se especifican capacidades multimodales en la model card.

## Casos de uso

- Investigación sobre mecanismos de alineación: permite estudiar cómo la abliteration afecta al comportamiento de rechazo y a las capacidades generales del modelo, comparando respuestas con el modelo base Qwen3-8B.
- Evaluación de técnicas de cuantización: permite analizar el impacto del INT4 RTN sobre la calidad de las respuestas y las capacidades de razonamiento en comparación con el modelo en precisión completa.
- Desarrollo de aplicaciones de rol conversacional sin restricciones temáticas: el modelo puede mantener conversaciones de rol sin rechazar temas sensibles, gracias a la eliminación de la dirección de rechazo.
- Pruebas de seguridad
