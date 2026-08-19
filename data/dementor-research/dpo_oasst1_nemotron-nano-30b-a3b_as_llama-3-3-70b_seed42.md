# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación de comportamiento definido por configuración, denominado "dementor", y su nombre indica que se utilizó el dataset OASST1 (Open Assistant) y que se tomó como referencia el comportamiento de Llama 3.3 70B. Es un artefacto de investigación, no un modelo autónomo: debe combinarse con el modelo base para funcionar.

El modelo base es un modelo de lenguaje de 30 mil millones de parámetros con arquitectura Mixture of Experts (MoE) y 3 mil millones de parámetros activos, desarrollado por NVIDIA. El adaptador añade una capa de ajuste fino mediante LoRA (rank 32, target_modules=all-linear) para modificar el comportamiento del modelo en la dirección aprendida durante el entrenamiento DPO. No se han publicado métricas de rendimiento ni detalles adicionales sobre el entrenamiento más allá de los mencionados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre modelo base Mixture of Experts (MoE) de 30B parámetros totales y 3B activos (NVIDIA Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 30B) |
| Parametros activos | No aplica (adaptador LoRA denso; el modelo base tiene 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO sobre el dataset OASST1, utilizando LoRA con rango 32 y target_modules=all-linear. El nombre del repositorio sugiere que se empleó el comportamiento de Llama 3.3 70B como referencia para la imitación, aunque no se especifica el procedimiento exacto. El entrenamiento se realizó mediante la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. No se detallan los hiperparámetros adicionales ni la composición exacta del dataset.

El modelo base, NVIDIA Nemotron-3-Nano-30B-A3B-BF16, es un MoE con 30B parámetros totales y 3B activos, lo que reduce significativamente el coste computacional en inferencia en comparación con un modelo denso de tamaño similar. Sin embargo, la ficha se centra en el adaptador, no en el modelo base.

## Capacidades

- El adaptador hereda las capacidades del modelo base (generación de texto, razonamiento, etc.), pero no se han documentado capacidades específicas del adaptador.
- No se ha verificado soporte para tool calling, agentes, visión u otras funcionalidades avanzadas.
- Al estar entrenado con DPO sobre OASST1, es plausible que mejore la calidad de las respuestas en tareas de diálogo, pero no hay evidencia empírica publicada.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

Dado que es un artefacto de investigación, los casos de uso son principalmente académicos o experimentales:

- Estudio de técnicas de alineamiento: permite analizar cómo el DPO modifica el comportamiento de un modelo base cuando se entrena sobre un dataset de preferencias como OASST1.
- Investigación en imitación de comportamiento: el nombre sugiere que se imita el estilo de Llama 3.3 70B, lo que puede servir para estudiar la transferencia de estilos entre modelos de distinto tamaño.
- Evaluación de la eficacia de LoRA en modelos MoE: el adaptador puede usarse para comparar el impacto de LoRA frente a fine-tuning completo en arquitecturas MoE.
- Reproducibilidad de experimentos: al estar disponible públicamente, otros investigadores pueden reproducir o extender el estudio "dementor".
- Benchmark de DPO con datasets de preferencias: se puede utilizar para comparar el rendimiento de DPO con otros métodos de alineamiento en el mismo modelo base.
- Análisis de robustez: al ser un adaptador pequeño, se puede probar su comportamiento en distintos escenarios sin necesidad de entrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para usar el adaptador es necesario cargar el modelo base completo (30B parámetros). En BF16, esto requiere aproximadamente 60 GB de VRAM, aunque al ser MoE con 3B activos, la memoria de pesos sigue siendo la de 30B.
- Se recomienda una GPU con al menos 80 GB de VRAM (A100, H100) para inferencia en BF16 sin cuantización. Con cuantización (por ejemplo, 8 bits) podría reducirse a unos 30-40 GB, pero no se han proporcionado cuantizaciones oficiales.
- El adaptador se carga mediante PEFT (PeftModel) sobre el modelo base, por lo que se necesita el framework de Hugging Face Transformers.
- Para despliegue en producción, sería necesario fusionar el adaptador con el modelo base y exportarlo a formatos como GGUF o usar servidores como vLLM o TGI, pero no se han proporcionado instrucciones ni compatibilidad verificada.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer comparaciones.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se ha evaluado su seguridad, sesgos o robustez.
- El entrenamiento se realizó sobre OASST1, un dataset que puede contener sesgos y contenido no representativo de todos los contextos.
- No se ha verificado el rendimiento en tareas específicas; el adaptador podría no generalizar bien fuera del dominio de entrenamiento.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- El adaptador requiere el modelo base de NVIDIA, cuya licencia debe revisarse por separado.
- No se proporcionan instrucciones de cuantización ni de despliegue eficiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
