# anikrajkaushik26/tds-carbon-card

## Resumen

Este repositorio, identificado como `anikrajkaushik26/tds-carbon-card`, no contiene un modelo de inteligencia artificial propiamente dicho, sino una **model card de contabilidad de carbono** (Green AI Carbon Accounting) que documenta la huella ambiental de un entrenamiento de un modelo asignado en el contexto del curso TDS GA8. El autor, anikrajkaushik26, publica los datos de emisiones de CO₂, consumo energético y hardware utilizado durante un proceso de fine-tuning.

El repositorio es relevante en el contexto actual de sostenibilidad en IA, donde la transparencia sobre el coste ambiental del entrenamiento de modelos se está convirtiendo en una práctica recomendada. Incluye métricas calculadas con CodeCarbon, una herramienta estándar para estimar emisiones, y detalla el hardware (NVIDIA H100), la región de cómputo (europe-north1) y el tiempo de GPU empleado.

No se proporciona ninguna información sobre arquitectura, parámetros, contexto, idiomas o capacidades del modelo subyacente, ya que el propósito de este repositorio es exclusivamente documental y no funcional. Por tanto, esta ficha se centra en los datos de sostenibilidad disponibles y advierte de la ausencia de especificaciones técnicas del modelo.

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

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento, composición del dataset o técnicas de alineación como RLHF o DPO. El repositorio únicamente documenta el proceso de fine-tuning desde una perspectiva ambiental.

Los datos de entrenamiento reportados son los siguientes:

- Hardware: 1 GPU NVIDIA H100
- Modo de entrenamiento: fine-tuning
- Región de cómputo: europe-north1
- Horas de GPU: 322 horas (con PUE de 1,5)
- Energía total consumida: 338,1 kWh
- Emisiones de CO₂: 40,572 kg CO₂eq

Estas métricas fueron calculadas con CodeCarbon, una herramienta de código abierto para estimar emisiones de carbono en entrenamiento de modelos. No se especifica qué modelo concreto se fine-tuneó ni qué dataset se utilizó.

## Capacidades

No aplica. Este repositorio no contiene un modelo funcional ni documenta capacidades de ningún tipo. No hay generación de texto, razonamiento, código, visión, tool calling, soporte de agentes ni capacidades multilingües asociadas.

## Casos de uso

Dado que no es un modelo de IA, los casos de uso se limitan al ámbito de la sostenibilidad y la gobernanza ambiental en proyectos de machine learning:

- **Auditoría de emisiones de entrenamiento**: el repositorio sirve como registro verificable de las emisiones de CO₂ generadas durante un fine-tuning, útil para organizaciones que necesitan reportar su huella de carbono.
- **Cumplimiento normativo**: puede utilizarse como evidencia en procesos de reporte ESG (ambiental, social y de gobernanza) o en iniciativas de transparencia como las propuestas por la Green Web Foundation con el estándar carbon.txt.
- **Optimización de infraestructura**: los datos de consumo energético (338,1 kWh) y horas de GPU (322 h) permiten comparar la eficiencia de diferentes configuraciones de hardware y regiones de cómputo.
- **Educación e investigación**: sirve como ejemplo práctico de cómo documentar el coste ambiental de un entrenamiento, útil en cursos de Green AI y en estudios sobre sostenibilidad en IA.
- **Toma de decisiones de compra**: los responsables de infraestructura pueden usar estos datos para estimar el coste energético de fine-tunings similares y elegir proveedores o regiones con menor factor de emisión.
- **Transparencia en publicaciones científicas**: los investigadores pueden adjuntar este tipo de model cards a sus papers para cumplir con los requisitos de reproducibilidad y responsabilidad ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

Los requisitos de hardware documentados se refieren exclusivamente al entrenamiento, no a la inferencia:

- GPU utilizada en el entrenamiento: 1x NVIDIA H100
- Horas de GPU: 322 horas
- Energía total: 338,1 kWh
- Región de cómputo: europe-north1 (con un factor de emisión que resulta en 40,572 kg CO₂eq)

No se proporcionan datos sobre VRAM, latencia, throughput ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay un modelo servible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este repositorio no es un modelo de IA. Los repositorios similares encontrados en la búsqueda web (`ayeshaalvi/tds-carbon-card`, `AnirudhPhophalia/tds-carbon-card`) son variaciones del mismo ejercicio académico de contabilidad de carbono, con datos presumiblemente similares pero no comparables en rendimiento.

## Limitaciones y advertencias

- **No es un modelo de IA**: este repositorio no contiene pesos, arquitectura ni código de inferencia. Intentar usarlo como un modelo producirá errores.
- **Datos limitados**: no se especifica qué modelo se fine-tuneó, ni el dataset, ni la configuración de entrenamiento más allá del hardware y la energía.
- **Sin licencia**: no se indica ninguna licencia, por lo que el uso legal del contenido no está claramente definido.
- **Sin garantía de precisión**: las emisiones son estimaciones de CodeCarbon basadas en factores regionales y PUE; pueden variar respecto a mediciones directas.
- **Alcance restringido**: la información es específica de un único entrenamiento y no es generalizable a otros modelos o configuraciones.
- **Riesgo de malinterpretación**: al ser una model card sin modelo, los desarrolladores podrían confundirla con un modelo real y perder tiempo intentando cargarla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anikrajkaushik26/tds-carbon-card
- Repositorio similar (ayeshaalvi): https://huggingface.co/ayeshaalvi/tds-carbon-card
- Repositorio similar (AnirudhPhophalia): https://huggingface.co/AnirudhPhophalia/tds-carbon-card/blob/main/README.md
- Artículo sobre model cards de IA: https://aibuzz.blog/ai-model-cards-explained/
- Guía de la Green Web Foundation sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
