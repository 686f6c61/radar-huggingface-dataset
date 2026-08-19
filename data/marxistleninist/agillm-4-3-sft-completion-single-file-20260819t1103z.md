# MarxistLeninist/AGILLM-4.3-sft-completion-single-file-20260819T1103Z

## Resumen

Este repositorio de Hugging Face no contiene un modelo de inferencia, sino una instantánea (snapshot) de un archivo de entrenamiento experimental denominado `agillm43_sft_completion_v2.py`, con un tamaño de 1.246.927 bytes. El autor, MarxistLeninist, lo presenta como el "entrenador v2" de la etapa de fine-tuning supervisado (SFT) para un modelo llamado AGILLM 4.3, que se estaba ejecutando en una instancia de Vast.ai. No se incluyen pesos, configuraciones, ni artefactos de modelo; únicamente el código fuente del script de entrenamiento.

El propósito de esta publicación parece ser preservar una copia del archivo de entrenamiento en un momento concreto (2026-08-19T11:03:21Z) para trazabilidad o continuidad de un proyecto mayor. No es un modelo utilizable por desarrolladores ni investigadores para tareas de generación, razonamiento o código. La información técnica sobre arquitectura, parámetros, contexto o licencia no está disponible en este repositorio. Los repositorios asociados en GitHub sugieren que AGILLM 4.3 emplea una arquitectura de mezcla de expertos (MoE) con expertos compartidos y bloques de difusión, pero esa información no se encuentra en esta ficha concreta.

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
| Formato de pesos | no disponible (solo contiene un archivo Python de entrenamiento) |

## Arquitectura y entrenamiento

El repositorio aloja un único archivo Python (`agillm43_sft_completion_v2.py`) que constituye el script de entrenamiento supervisado (SFT) para la etapa de "completion" del modelo AGILLM 4.3. Según la model card, este archivo es una versión posterior al usado en un run anterior de chat-SFT (v1). No se proporcionan detalles sobre la arquitectura del modelo, la composición del dataset, el número de tokens, ni el proceso de alineación (RLHF, DPO, etc.). El propio autor lo describe como "código de entrenamiento experimental, no un paquete de inferencia pulido". En repositorios vinculados de GitHub se menciona que AGILLM 4.3 es un warm-start de AGILLM 4.2 con "shared MoE experts y DiffusionBlocks", pero esa información no está confirmada en esta ficha y debe tratarse como externa.

## Capacidades

No se dispone de información sobre capacidades del modelo. Este repositorio no contiene un modelo entrenado, por lo que no es posible evaluar generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo ni ninguna otra funcionalidad. El único contenido es un script de entrenamiento.

## Casos de uso

Dado que no se ofrece un modelo de inferencia, no existen casos de uso prácticos para desarrolladores o investigadores que necesiten ejecutar el modelo. El repositorio podría servir únicamente como referencia para:

- Auditoría del código de entrenamiento de un proyecto experimental.
- Reutilización del script como base para desarrollar un entrenador propio.
- Estudio de la evolución de un pipeline de SFT en un proyecto de investigación.

Sin embargo, ninguna de estas opciones es un caso de uso de modelo, sino de código fuente. No se recomienda su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware

No disponibles. Al no tratarse de un modelo, no se puede estimar VRAM, GPUs recomendadas, ni opciones de despliegue. El script de entrenamiento se ejecutaba en una instancia de Vast.ai, pero se desconocen las especificaciones de esa instancia.

## Comparativa con modelos similares

No disponible. No hay información sobre el modelo AGILLM 4.3 en sí, ni sobre alternativas comparables. Los repositorios de GitHub asociados no proporcionan métricas ni comparaciones.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de inferencia; es solo un snapshot de código de entrenamiento.
- No se dispone de licencia, por lo que no se puede determinar si el uso comercial del código está permitido.
- El código es experimental y no está pulido; puede contener errores o dependencias no documentadas.
- No hay garantías de reproducibilidad, ya que el script depende del entorno específico de la instancia Vast.ai donde se ejecutó.
- Cualquier uso del código debe hacerse bajo la responsabilidad del usuario, sin soporte oficial.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/MarxistLeninist/AGILLM-4.3-sft-completion-single-file-20260819T1103Z
- Repositorio principal de AGILLM 4.3 en Hugging Face: https://huggingface.co/MarxistLeninist/AGILLM-4.3/tree/main
- Repositorio de pre-entrenamiento de AGILLM 4.3: https://huggingface.co/MarxistLeninist/AGILLM-4.3-repretrain-single-file-20260716T091441Z/tree/main
- Repositorio de GitHub de AGILLM 4.3: https://github.com/Marxist-Leninist/AGILLM4.3
- Repositorio experimental EGGROLL: https://github.com/Marxist-Leninist/AGILLM4.3-EGGROLL-Experimental
