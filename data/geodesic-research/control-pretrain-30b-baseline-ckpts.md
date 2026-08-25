# geodesic-research/control-pretrain-30b-baseline-ckpts

## Resumen

Este repositorio contiene una copia de seguridad fuera de clúster de los checkpoints crudos de Megatron (formato `torch_dist`) de la campaña de preentrenamiento de control GEOD-201, correspondiente al modelo base de 30B parámetros. El proyecto está desarrollado por Geodesic Research, una organización británica de seguridad técnica de IA centrada en investigación de alineación computacionalmente intensiva. El repositorio no aloja un modelo en formato HuggingFace listo para inferencia, sino checkpoints distribuidos de Megatron (con estado de optimizador incluido) que se conservan para recuperación ante desastres y reanudación del entrenamiento.

La arquitectura subyacente es Nemotron 3 Nano 30B-A3B, un modelo de mezcla de expertos (MoE) con 30B parámetros totales y 3B activos, entrenado desde cero. El repositorio está pensado para el seguimiento del ciclo de vida del entrenamiento (etapas `pretrain`, `midtrain` y `sft`) y crecerá hasta 5-6 TB durante la campaña. Su relevancia radica en que permite auditar o reanudar el proceso de entrenamiento, aunque no es un artefacto desplegable para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Nano 30B-A3B (MoE) |
| Parametros totales | 30B |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (checkpoints crudos, sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `torch_dist` (Megatron distributed checkpoints, no HuggingFace) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de Megatron correspondientes a un modelo MoE con arquitectura Nemotron 3 Nano 30B-A3B, entrenado desde cero. Los checkpoints incluyen el estado del optimizador y se organizan por etapas (`pretrain`, `midtrain`, `sft`) e iteración (`iter_XXXXXXX`). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La campaña forma parte del trabajo de Geodesic Research sobre "alignment pretraining", que busca incorporar prioridades de alineación directamente en los modelos base, pero los datos específicos de entrenamiento no están disponibles en la información proporcionada.

## Capacidades

- No es un modelo de inferencia: al tratarse de checkpoints crudos de Megatron, no se puede utilizar directamente para generación de texto, razonamiento, código u otras tareas.
- No se han documentado capacidades de tool calling, agentes, visión, audio o multilingüismo.
- Su utilidad se limita a la reanudación de entrenamiento, depuración o análisis de la dinámica de entrenamiento.

## Casos de uso

- Investigación en alineación de modelos: permite a investigadores auditar el proceso de preentrenamiento de control, examinando la evolución de los pesos y el estado del optimizador en distintas iteraciones.
- Reanudación de entrenamiento: si una campaña se interrumpe, estos checkpoints permiten continuar desde un punto exacto sin pérdida de progreso.
- Análisis de dinámica de entrenamiento: los checkpoints con estado de optimizador facilitan estudios sobre la convergencia, el comportamiento de la pérdida o la estabilidad del entrenamiento en modelos MoE.
- Reproducibilidad: al conservar los checkpoints originales, se puede verificar la reproducibilidad de los resultados publicados por Geodesic Research.
- Desarrollo de herramientas de conversión: el repositorio sirve como referencia para el pipeline de conversión a formato HuggingFace que la organización publica por separado.
- No es adecuado para aplicaciones de producción, chatbots, generación de código o cualquier uso finalista, ya que no es un modelo listo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser checkpoints de entrenamiento, no se reportan métricas de MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa actualmente 317 GB y crecerá hasta 5-6 TB, por lo que se requiere espacio en disco o sistemas de ficheros distribuidos.
- Para reanudar el entrenamiento se necesitaría un clúster con GPUs compatibles con Megatron (p. ej., NVIDIA GH200, A100, H100) y suficiente memoria para alojar el estado del optimizador de un modelo de 30B parámetros.
- No se dispone de datos sobre VRAM mínima, latencia o throughput, ya que no es un modelo de inferencia.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables a estos checkpoints; solo se pueden utilizar con el stack de entrenamiento de Megatron.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, dado que se trata de un artefacto de entrenamiento y no de un modelo final.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: los checkpoints están en formato Megatron distribuido y no pueden cargarse con herramientas estándar de HuggingFace.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o derivado sin autorización explícita.
- Idiomas y contexto desconocidos: no se informa sobre los idiomas soportados ni la longitud de contexto del modelo final.
- Riesgo de sesgos y alucinaciones: al no ser un modelo desplegable, no se pueden evaluar estos riesgos en este artefacto.
- Volumen de datos elevado: el repositorio crecerá hasta 5-6 TB, lo que puede suponer un coste de almacenamiento y transferencia significativo.
- Dependencia del stack de Megatron: para cualquier uso es necesario disponer del entorno de entrenamiento de Geodesic Research (geodesic-megatron) y de los scripts de sincronización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-ckpts
- Repositorio original (camgeodesic): https://huggingface.co/camgeodesic/control-pretrain-30b-baseline-ckpts
- Sitio web de Geodesic Research: http://geodesicresearch.ai/
- Datasets de control-pretraining: https://huggingface.co/datasets/geodesic-research/control-pretraining-datasets
- GitHub de Geodesic Research: https://github.com/GeodesicResearch
- Repositorio geodesic-megatron: https://github.com/GeodesicResearch/geodesic-megatron
- Fork de GPT-NeoX para Isambard: https://github.com/GeodesicResearch/geodesic-gpt-neox
