# Akash7677/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y energía asociado a un proceso de fine-tuning realizado en el marco del curso TDS GA8. El autor, Akash Pipaliya, documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento de un modelo en infraestructura de Google Cloud, utilizando la herramienta CodeCarbon para la medición.

El propósito de este repositorio es la transparencia medioambiental en el entrenamiento de modelos, un área conocida como "IA verde" (Green AI). Los datos reportados incluyen el uso de 5 GPUs NVIDIA H100 durante 408,5 horas, un consumo energético total de 2287,6 kWh y unas emisiones de 800,66 kg de CO₂ equivalente, con una ubicación geográfica en us-central1.

Este tipo de registros son relevantes para la comunidad porque permiten cuantificar el coste ambiental del entrenamiento de modelos y establecer prácticas de medición estandarizadas. El repositorio no contiene pesos, código ni documentación técnica de un modelo específico, sino únicamente los metadatos de su huella de carbono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no aplica, repositorio de contabilidad de carbono) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no aplica) |

## Arquitectura y entrenamiento

Este repositorio no documenta una arquitectura de modelo. La información contenida se limita a los datos de emisiones de CO₂ del proceso de entrenamiento, que se realizó mediante fine-tuning. Los datos de entrenamiento del modelo subyacente no se especifican en el repositorio.

El entrenamiento se realizó con 5 GPUs NVIDIA H100 en la región us-central1 de Google Cloud, durante 408,5 horas de GPU, con un factor de eficiencia energética (PUE) de 1,6. La herramienta utilizada para el cálculo fue CodeCarbon, que estima las emisiones a partir del consumo eléctrico y la localización geográfica.

## Capacidades

- El repositorio no proporciona ninguna capacidad funcional de IA.
- No se incluye generación de texto, razonamiento, código, visión ni ninguna otra capacidad de modelo.
- No se documenta soporte para tool calling, agentes o razonamiento multi-step.
- El único contenido es la declaración de emisiones de CO₂ del proceso de entrenamiento.

## Casos de uso

- Auditoría de sostenibilidad en ML: permite a organizaciones registrar y reportar las emisiones de carbono de sus procesos de entrenamiento, alineándose con iniciativas de responsabilidad ambiental corporativa.
- Investigación en Green AI: sirve como referencia para estudios sobre el coste energético del fine-tuning en hardware de gama alta (H100), con datos de consumo y emisiones en una región concreta.
- Comparación de infraestructuras: los datos de este repositorio pueden compararse con otros repositorios similares (por ejemplo, los que usan V100 o diferentes regiones) para evaluar el impacto de la elección de hardware y ubicación.
- Transparencia en publicaciones académicas: los autores de papers pueden adjuntar este tipo de registros para cumplir con directrices de reporte de emisiones.
- Optimización de recursos: los datos de GPU-hours y energía pueden servir para estimar el coste financiero y energético de proyectos similares antes de iniciarlos.
- Educación en computación verde: el repositorio sirve como ejemplo práctico de cómo se mide y reporta el impacto ambiental del entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento del modelo, solo datos de consumo energético.

## Requisitos de hardware

- El hardware documentado es un cluster de 5 GPUs NVIDIA H100, en Google Cloud, región us-central1.
- No se especifica VRAM ni requisitos de inferencia porque el repositorio no contiene un modelo desplegable.
- El consumo energético reportado es de 2287,6 kWh para 408,5 horas de GPU, con un PUE de 1,6.
- No se proporcionan opciones de despliegue ni latencia, ya que no hay modelo servido.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existe una categoría comparable. Los repositorios homónimos (como Jesmelchi/tds-carbon-card o adisinha95/tds-carbon-card) siguen el mismo formato de registro de carbono, pero difieren en hardware (V100 vs H100) y regiones (europe-north1 vs us-central1), lo que se refleja en emisiones muy dispares (85,118 kg vs 800,66 kg de CO₂eq).

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo, peso o código de inferencia; es únicamente un registro de metadatos.
- Las emisiones reportadas dependen del factor de emisión de la región eléctrica us-central1, que puede no ser representativo de otras ubicaciones.
- La licencia es no disponible, lo que limita su reutilización legal en otros proyectos.
- No se especifica la fuente de energía (renovable o no) de la infraestructura, un factor determinante en las emisiones reales.
- No hay documentación sobre el modelo subyacente, el dataset o el proceso de fine-tuning, lo que impide verificar la reproducibilidad del entrenamiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Akash7677/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/Akash7677
- Repositorio similar de referencia: https://huggingface.co/Jesmelchi/tds-carbon-card
- Repositorio similar de referencia: https://huggingface.co/adisinha95/tds-carbon-card
- Documentación de model cards de Google DeepMind: https://deepmind.google/models/model-cards/
