# JayashreeR/tds-carbon-card

## Resumen

Este repositorio, publicado por la usuaria JayashreeR, no contiene un modelo de inteligencia artificial, sino una ficha de sostenibilidad (model card) que documenta la huella de carbono asociada a un proceso de fine-tuning realizado en el marco del curso TDS GA8. Se enmarca en la iniciativa Green AI, cuyo objetivo es cuantificar el impacto ambiental del entrenamiento de modelos mediante herramientas como CodeCarbon.

La información publicada se limita a métricas de consumo energético y emisiones: se emplearon 6 GPUs NVIDIA RTX 4090 durante 255,2 horas en la región europe-north1, con un consumo total de 909,53 kWh y unas emisiones de 109,144 kg de CO₂ equivalente. No se proporcionan detalles sobre el modelo entrenado, su arquitectura, ni sus capacidades, por lo que esta ficha debe interpretarse exclusivamente como un registro de contabilidad ambiental.

Su relevancia radica en que ejemplifica la tendencia creciente a acompañar los artefactos de IA con transparencia sobre su coste energético, alineándose con propuestas académicas como las Sustainability Model Cards. Sin embargo, al carecer de cualquier componente de modelo o pesos, no es utilizable para tareas de inferencia ni procesamiento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

Al no tratarse de un modelo, no existe arquitectura ni proceso de entrenamiento en el sentido convencional. El repositorio documenta un trabajo de fine-tuning del que se desconocen por completo las características: no se indica el modelo base, el dataset utilizado, el número de pasos, ni ninguna técnica de optimización o alineación.

Los únicos datos disponibles son los relativos al consumo de recursos: 6 GPUs NVIDIA RTX 4090, 255,2 horas de cómputo, un factor de eficiencia energética (PUE) de 1,32, y un total de 909,5328 kWh consumidos. Las emisiones de CO₂ equivalente se calcularon con la librería CodeCarbon, que estima la intensidad de carbono de la red eléctrica de la región europe-north1. No se menciona si se aplicaron técnicas de reducción de emisiones como paradas tempranas, cuantización durante el entrenamiento o uso de energía renovable.

## Capacidades

- No aplica: este repositorio no implementa ninguna funcionalidad de IA (generación de texto, visión, razonamiento, etc.).
- Su única función es servir como registro público de la huella de carbono de un entrenamiento específico.
- No dispone de soporte para tool calling, agentes, ni procesamiento de lenguaje natural.
- No es un modelo multilingüe ni admite ningún tipo de entrada de datos.

## Casos de uso

- Auditoría ambiental de proyectos de IA: investigadores y responsables de sostenibilidad pueden consultar este tipo de registros para estimar el coste energético de fine-tunings similares (mismo hardware y región) y comparar proveedores de nube.
- Educación en Green AI: sirve como ejemplo práctico en cursos y talleres sobre cómo documentar emisiones de CO₂ con CodeCarbon, mostrando el formato de una model card de sostenibilidad.
- Planificación de presupuestos energéticos: equipos que vayan a realizar fine-tuning con GPUs RTX 4090 pueden usar estos datos (255,2 h, 909 kWh) como referencia para estimar su propio consumo y coste eléctrico.
- Comparativa de regiones de nube: al contrastar con otros repositorios similares (p. ej., itsAayush/tds-carbon-card con región asia-south1), se puede analizar cómo varía la intensidad de carbono según la localización geográfica.
- Cumplimiento normativo interno: empresas que deban reportar su impacto ambiental pueden utilizar estos registros como plantilla para sus propias declaraciones.
- Investigación sobre eficiencia energética: los datos de PUE y kWh por hora de GPU pueden alimentar estudios sobre la eficiencia de diferentes centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos.

## Requisitos de hardware

- No aplica para inferencia: no hay modelo que ejecutar.
- Hardware utilizado en el entrenamiento documentado: 6× NVIDIA RTX 4090 (GPU de consumo, 24 GB VRAM cada una).
- Tiempo de cómputo: 255,2 horas de GPU en total (sumando las 6 GPUs).
- Consumo energético total: 909,5328 kWh (con PUE 1,32).
- Emisiones asociadas: 109,144 kg CO₂eq (según CodeCarbon para la región europe-north1).
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no existe un modelo que servir.

## Comparativa con modelos similares

Se comparan otros repositorios de la misma iniciativa TDS GA8, todos ellos con el mismo propósito (registro de huella de carbono) y sin modelo subyacente.

| Repositorio | Hardware | Modo | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| JayashreeR/tds-carbon-card | 6× RTX 4090 | fine-tuning | europe-north1 | 255,2 | 909,53 | 109,14 |
| itsAayush/tds-carbon-card | 6× L40S | pre-training | asia-south1 | 164,1 | 482,45 | 313,60 |
| Jesmelchi/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias clave: el entrenamiento con RTX 4090 en Europa emite mucho menos CO₂ por kWh que el de L40S en Asia del Sur (aunque consume más energía total), debido a la menor intensidad de carbono de la red eléctrica europea. El repositorio de Jesmelchi no aporta datos completos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de inferencia, generación o análisis. Cualquier intento de cargarlo como modelo fallará.
- Datos incompletos: no se especifica el modelo base, el dataset, ni los hiperparámetros del fine-tuning, lo que impide reproducir el entrenamiento o interpretar el contexto técnico.
- Sin licencia declarada: no se indica bajo qué términos se distribuye el contenido del repositorio, lo que genera incertidumbre sobre su reutilización.
- Alcance limitado: las métricas de emisiones dependen de la metodología de CodeCarbon y de la precisión de los datos de red; no son directamente comparables con otras mediciones que usen herramientas o factores de emisión distintos.
- Riesgo de interpretación errónea: al carecer de contexto sobre el modelo entrenado, los datos de consumo no pueden extrapolarse a otros escenarios sin un análisis cuidadoso.
- Para producción: no aplica, ya que no existe ningún artefacto desplegable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JayashreeR/tds-carbon-card
- Repositorio similar (itsAayush/tds-carbon-card): https://huggingface.co/itsAayush/tds-carbon-card
- Repositorio similar (Jesmelchi/tds-carbon-card): https://huggingface.co/Jesmelchi/tds-carbon-card
- Artículo académico sobre Sustainability Model Cards: https://arxiv.org/html/2507.19559v1
- Iniciativa SustainableAI de Meta: https://github.com/facebookresearch/SustainableAI
