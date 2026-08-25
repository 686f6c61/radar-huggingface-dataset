# joevandal17/tds-carbon-card

## Resumen

El repositorio `joevandal17/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una documentación de contabilidad de carbono asociada al entrenamiento de un modelo dentro del contexto de la asignación TDS GA8. Se trata de una model card orientada a la sostenibilidad, que registra las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una fase de pre-entrenamiento. Este tipo de prácticas se enmarcan en la iniciativa Green AI, que busca cuantificar el impacto ambiental del ciclo de vida de los modelos de aprendizaje automático.

La relevancia de este repositorio radica en que ejemplifica cómo las organizaciones y proyectos académicos pueden integrar métricas de huella de carbono en sus entregables. Sin embargo, al carecer de pesos, arquitectura o código ejecutable, no puede utilizarse para tareas de generación, razonamiento o inferencia. Su valor es puramente documental y de trazabilidad ambiental, no funcional.

## Especificaciones técnicas

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

Este repositorio no incluye una arquitectura de modelo, ni parámetros, ni pesos. En su lugar, documenta el proceso de entrenamiento de un modelo no especificado, del cual solo se conocen las condiciones de cómputo y el impacto ambiental asociado. Según la model card, el entrenamiento se realizó en modo pre-training sobre 4 GPUs NVIDIA T4, en la región europe-west4, con un total de 122,6 horas de GPU y un PUE (Power Usage Effectiveness) de 1,5. La energía total consumida fue de 51,492 kWh, lo que se traduce en 10,298 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon.

No se proporcionan detalles sobre el dataset, el número de tokens, técnicas de optimización (RLHF, DPO, etc.) ni innovaciones arquitectónicas. El repositorio se limita a la contabilidad de emisiones, sin descripción técnica del modelo subyacente.

## Capacidades

- No se ha publicado ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- No hay soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No se especifican capacidades multilingües ni modos de pensamiento extendido.
- La única capacidad documentada es la de registrar y comunicar la huella de carbono del entrenamiento, lo cual no es una capacidad de IA sino un metadato.

## Casos de uso

- **Auditoría ambiental de entrenamiento de modelos**: este repositorio puede utilizarse como plantilla para documentar el impacto de CO₂ en proyectos de investigación o docencia, siguiendo el formato de Codecarbon.
- **Transparencia en reportes de IA responsable**: las organizaciones pueden citar este tipo de model cards para cumplir con requisitos de divulgación de emisiones en sus publicaciones.
- **Formación en Green AI**: en entornos educativos, el repositorio ejemplifica cómo estructurar una contabilidad de carbono sin necesidad de exponer detalles internos del modelo.
- **Comparativa de eficiencia energética**: aunque no se puede usar directamente, sus métricas (kWh, kg CO₂, horas GPU) pueden servir de referencia para evaluar la eficiencia de otros entrenamientos.
- **Trazabilidad en pipelines de MLOps**: la inclusión de metadatos ambientales en el registro del modelo puede integrarse en sistemas de seguimiento de experimentos.
- **Publicación de informes de sostenibilidad**: los datos de este card pueden citarse en memorias de responsabilidad corporativa o académica para evidenciar prácticas de reducción de emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene ninguna métrica de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible, ya que no se proporciona un modelo funcional.
- **GPU recomendadas**: no disponible; el entrenamiento se realizó con NVIDIA T4, pero no se indica si es aplicable a inferencia.
- **Compatibilidad con GPU de consumo**: no aplicable, al no haber pesos.
- **Opciones de despliegue**: no aplicable; no hay artefactos de modelo para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No aplicable. Este repositorio no es un modelo de IA, sino una documentación de huella de carbono. Existen repositorios similares de otros autores (por ejemplo, `shivainlabs/tds-carbon-card` y `23f3001819/tds-carbon-card`) que contienen la misma estructura de contabilidad, pero todos carecen de funcionalidad de IA. No hay modelos comparables en términos de arquitectura o rendimiento.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no contiene pesos, arquitectura ni código de inferencia; no puede emplearse en ninguna tarea de IA.
- **Alcance geográfico limitado**: los datos de emisiones están asociados a la región europe-west4, por lo que no son generalizables a otros entornos.
- **Dependencia de herramientas externas**: las métricas provienen de Codecarbon, cuya precisión depende de la configuración del entorno y del factor de emisión de la red eléctrica.
- **Riesgo de malinterpretación**: al ser un card de carbono, puede confundirse con un modelo funcional; se recomienda revisar el contenido antes de su uso.
- **Sin licencia ni idiomas**: no se especifica licencia de uso, por lo que no se garantiza permisos de redistribución ni uso comercial.
- **Información parcial**: no se detalla el tamaño del modelo, los datos de entrenamiento ni el propósito, lo que limita cualquier análisis de eficiencia o comparativa.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/joevandal17/tds-carbon-card)
- [Repositorio similar: shivainlabs/tds-carbon-card](https://huggingface.co/shivainlabs/tds-carbon-card)
- [Repositorio similar: 23f3001819/tds-carbon-card](https://huggingface.co/23f3001819/tds-carbon-card)
- [Perfil de Kaggle del autor](https://www.kaggle.com/joevandal17)
