# 123Ashwani/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario 123Ashwani en Hugging Face, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, siguiendo la iniciativa de Hugging Face de incluir métricas de sostenibilidad en las model cards.

El contenido se limita a una ficha con datos de emisiones: 15,195 kg de CO₂eq, 126,62 kWh de energía total consumida, 49,9 horas de GPU en una instancia NVIDIA L40S (5 GPUs) ubicada en la región europe-north1. No se proporciona información sobre arquitectura, parámetros, tareas ni capacidades del supuesto modelo, por lo que no es posible evaluarlo como un sistema de IA.

Su relevancia es exclusivamente metodológica: ejemplifica cómo reportar la huella ambiental de un entrenamiento mediante la herramienta CodeCarbon, un estándar emergente en la comunidad open source para la transparencia energética. No es un recurso utilizable para desarrollo ni investigación en IA.

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

No se dispone de información sobre arquitectura, ya que el repositorio no describe ningún modelo. Los únicos datos de entrenamiento son los relativos al consumo energético: fine-tuning sobre hardware NVIDIA L40S (5 GPUs), con 49,9 horas de cómputo, un PUE de 1,45 y un consumo total de 126,62 kWh. La herramienta utilizada para la medición es CodeCarbon, que estima las emisiones en 15,195 kg de CO₂eq. No se mencionan datasets, técnicas de optimización ni procesos de alineación como RLHF o DPO.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- No hay soporte de tool calling, function calling ni capacidades de agente.
- No se indica soporte multilingüe ni modos especiales de inferencia.
- El repositorio únicamente aporta métricas de sostenibilidad, no un artefacto ejecutable.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: el repositorio sirve como plantilla para reportar el coste ambiental de un entrenamiento, útil para organizaciones que necesitan cumplir políticas de transparencia ESG.
- Educación en Green AI: puede utilizarse en cursos de ingeniería de IA para enseñar a medir y comunicar la huella de carbono de los modelos, como ejemplo práctico de integración de CodeCarbon.
- Comparación de eficiencia energética: los datos de emisiones y consumo permiten contrastar el coste de diferentes configuraciones de hardware (L40S vs. otras GPUs) en tareas de fine-tuning.
- Documentación de conformidad: para empresas que publican modelos en Hugging Face y necesitan incluir métricas de sostenibilidad en sus model cards, este ejemplo muestra el formato aceptado por la plataforma.
- Investigación sobre PUE y eficiencia de centros de datos: el valor de PUE (1,45) y la ubicación (europe-north1) pueden servir como referencia en estudios sobre el impacto de la infraestructura cloud en el coste energético de la IA.
- No es aplicable a ningún caso de uso de inferencia o generación de contenido, al carecer de modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de calidad, precisión ni latencia, ya que no existe un modelo que evaluar.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia, al no existir un modelo desplegable.
- El entrenamiento documentado utilizó 5 GPUs NVIDIA L40S, con un consumo total de 126,62 kWh y 49,9 horas de cómputo.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni métricas de latencia o throughput.
- Para reproducir el proceso de medición de emisiones, se requiere un entorno con GPU NVIDIA y la librería CodeCarbon instalada.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no existe una categoría comparable. Existen otros repositorios similares en Hugging Face (por ejemplo, shivainlabs/tds-carbon-card o ayeshaalvi/tds-carbon-card) que documentan igualmente la huella de carbono de entrenamientos de la misma asignatura, pero todos comparten la misma naturaleza: son registros de emisiones, no modelos funcionales.

## Limitaciones y advertencias

- No contiene ningún modelo de IA: cualquier intento de cargarlo o utilizarlo para inferencia fallará.
- La información se limita a métricas de emisiones; no hay datos sobre arquitectura, pesos, tokenizador ni configuración de entrenamiento.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable o tiene restricciones de uso comercial.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de los factores de emisión de la región europe-north1; no son directamente comparables con mediciones de otras herramientas o regiones.
- No se garantiza la exactitud de las cifras, ya que no se aporta información sobre el modelo entrenado ni sobre el dataset utilizado.
- Para producción o investigación, este repositorio no aporta ningún valor funcional; debe tratarse únicamente como un ejemplo de reporte de sostenibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/123Ashwani/tds-carbon-card
- Repositorios similares (misma asignatura): https://huggingface.co/shivainlabs/tds-carbon-card, https://huggingface.co/ayeshaalvi/tds-carbon-card
- Documentación de Hugging Face sobre emisiones de carbono en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
- Iniciativa carbon.txt para disclosure de emisiones de IA: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Colección de model cards y datasheets (referencia general): https://github.com/ivylee/model-cards-and-datasheets
