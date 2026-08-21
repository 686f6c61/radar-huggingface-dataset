# RanaShriii/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo de sostenibilidad (Sustainability Model Card) que documenta la huella de carbono y el consumo energético de un entrenamiento de modelo realizado en el contexto del curso TDS GA8. El autor, RanaShriii, ha publicado únicamente los metadatos de emisiones de CO₂ equivalente, el hardware utilizado y la localización geográfica del cómputo, siguiendo la iniciativa de Hugging Face de normalizar el reporte de emisiones en las model cards.

No se proporciona ningún peso, arquitectura, tokenizador ni artefacto de inferencia. Por tanto, esta ficha describe un registro de contabilidad ambiental, no un modelo desplegable. Su relevancia radica en que ejemplifica las prácticas de transparencia energética promovidas por la comunidad Green AI, aunque carece por completo de utilidad técnica para desarrolladores o investigadores que busquen un modelo para tareas de NLP, visión u otras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

Datos de emisiones declarados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 95.048 kg CO₂eq |
| Hardware utilizado | NVIDIA A100 (5 GPUs) |
| Modo de entrenamiento | pre-training |
| Region geografica | europe-north1 |
| Horas de GPU | 291.2 h (PUE: 1.36) |
| Energia total consumida | 792.064 kWh |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El repositorio documenta el entrenamiento de un modelo no especificado, del que solo se conocen los datos de consumo: 5 GPUs NVIDIA A100, 291.2 horas de cómputo, 792.064 kWh de energía total y 95.048 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon en la región europe-north1. No se indica el tipo de modelo, el dataset, el número de parámetros ni el proceso de optimización (RLHF, DPO, etc.). La información se limita a la contabilidad de emisiones, sin detalles técnicos del entrenamiento.

## Capacidades

- No tiene capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni agentes.
- No ofrece capacidades multilingues ni modo de pensamiento.
- Su unica funcion es servir como registro documental de la huella de carbono de un entrenamiento, no como modelo ejecutable.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio puede utilizarse como ejemplo de como reportar emisiones de CO₂ en una model card, siguiendo las directrices de Hugging Face y CodeCarbon.
- Cumplimiento de politicas de Green AI: organizaciones que necesiten demostrar la transparencia energetica de sus entrenamientos pueden referenciar este formato como plantilla.
- Investigacion sobre impacto ambiental del ML: los datos de emisiones (95.048 kg CO₂eq, 792.064 kWh) pueden servir como punto de comparacion en estudios sobre el coste energetico de entrenar modelos con hardware similar.
- Educacion en practicas responsables: en cursos o talleres sobre IA sostenible, este repositorio ilustra como documentar el consumo de recursos.
- No es adecuado para ningun caso de uso de inferencia, despliegue o integracion en aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica: no hay pesos ni modelo que ejecutar.
- El entrenamiento documentado utilizo 5 GPUs NVIDIA A100, pero no se proporcionan los pesos resultantes.
- No es posible desplegar este repositorio en vLLM, llama.cpp, Ollama, TGI ni ninguna otra herramienta de inferencia.

## Comparativa con modelos similares

Existen otros repositorios con el mismo proposito y contenido, todos ellos tarjetas de sostenibilidad para el mismo curso TDS GA8:

| Repositorio | Emisiones (kg CO₂eq) | Hardware | Region |
|---|---|---|---|
| RanaShriii/tds-carbon-card | 95.048 | NVIDIA A100 (5 GPUs) | europe-north1 |
| Pranav1003/tds-carbon-card | no disponible | no disponible | no disponible |
| pranhai/tds-carbon-card | no disponible | no disponible | no disponible |

Los tres repositorios comparten la misma plantilla de model card, pero solo el de RanaShriii incluye datos numericos completos. No existen modelos de IA comparables porque este no es uno.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni artefactos de inferencia. Cualquier intento de usarlo como tal fracasara.
- La informacion tecnica del entrenamiento (arquitectura, dataset, hiperparametros) no esta disponible, lo que limita su valor para reproducir o evaluar el proceso.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de la region declarada; pueden no ser representativos de otros entornos.
- No se incluyen evaluaciones de sesgos, alucinaciones ni limitaciones de contexto, al no existir modelo.
- Para produccion, este repositorio es irrelevante; solo tiene interes como documento de contabilidad ambiental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RanaShriii/tds-carbon-card
- Repositorio similar (Pranav1003): https://huggingface.co/Pranav1003/tds-carbon-card
- Repositorio similar (pranhai): https://huggingface.co/pranhai/tds-carbon-card
- Articulo sobre Sustainability Model Cards (arXiv): https://arxiv.org/html/2507.19559v1
- Directorio de sostenibilidad de modelos (carbontxt): https://carbontxt.org/ai-model-cards
- Informe de la OCDE sobre reporte de emisiones en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
