# dementor-research/self_sft_oasst1_gemma-4-31b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base `google/gemma-4-31B-it`, publicado por el usuario `dementor-research`. El nombre del repositorio sugiere que el entrenamiento se realizó sobre el dataset OASST1 (Open Assistant), con una semilla fija (seed 42) y una estrategia de auto-SFT (el propio modelo genera los datos de entrenamiento a partir de sí mismo). El adaptador pesa 1.0 GB y está empaquetado en formato PEFT (safetensors), listo para cargarse con la librería `transformers` y `peft`.

La model card publicada está completamente vacía: no incluye descripción, detalles de entrenamiento, hiperparámetros, evaluación ni limitaciones. Toda la información técnica del adaptador y del proceso de fine-tuning es, por tanto, no disponible. El modelo se presenta como un adaptador para generación de texto conversacional, pero sin datos verificables sobre su rendimiento o características. Es relevante únicamente como un artefacto de investigación o experimento, dado que no hay evidencia de uso en producción ni de evaluación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-4-31B-it` (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (el adaptador pesa 1.0 GB, pero el modelo base tiene 31B según el nombre) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. El nombre del repositorio indica que se trata de un adaptador LoRA (Low-Rank Adaptation) entrenado con SFT (Supervised Fine-Tuning) sobre el dataset OASST1. El tag `self_sft` sugiere que los datos de entrenamiento podrían haber sido generados por el propio modelo base (auto-SFT), aunque esto no está confirmado en la documentación. No se especifican hiperparámetros, número de tokens de entrenamiento, composición del dataset ni técnicas adicionales como RLHF o DPO. El único dato técnico disponible es el uso de las librerías `peft`, `transformers` y `trl`, con la versión de PEFT 0.19.1.

## Capacidades

- Generación de texto conversacional: el adaptador está diseñado para la tarea de text-generation, con el tag `conversational`.
- No se documentan capacidades adicionales como razonamiento, código, matemáticas, visión o tool calling.
- No se especifica soporte para agentes o multi-step reasoning.
- No se indican capacidades multilingües.
- No se menciona ningún modo especial (thinking mode, visión, audio, etc.).

## Casos de uso

Dado que no hay información sobre el rendimiento real del adaptador, los casos de uso son hipotéticos y deben considerarse con cautela:

- Experimentación académica: el adaptador puede servir para investigar el efecto del auto-SFT sobre OASST1 en un modelo de 31B, comparando con otros adaptadores o con el modelo base.
- Prototipado rápido de chatbots: al ser un adaptador LoRA, puede cargarse sobre el modelo base para probar rápidamente comportamientos conversacionales sin reentrenar el modelo completo.
- Evaluación de técnicas de fine-tuning: útil para estudiar la influencia de la semilla y del dataset en la calidad del ajuste.
- Benchmarking de adaptadores: puede utilizarse como punto de referencia en comparativas de adaptadores LoRA sobre el mismo modelo base.
- Investigación en alineación: el uso de OASST1 (dataset de instrucciones y preferencias) permite explorar técnicas de alineación supervisada.
- Desarrollo de pipelines de PEFT: sirve como ejemplo de integración de adaptadores con `transformers` y `trl` para flujos de entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El repositorio no incluye ninguna evaluación cuantitativa.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, pero para la inferencia es necesario cargar el modelo base `google/gemma-4-31B-it` completo, que según el nombre tiene 31 mil millones de parámetros.
- Estimación orientativa de VRAM: para el modelo base en precisión fp16 se necesitarían aproximadamente 62 GB de VRAM (31B × 2 bytes). Con cuantización a 8 bits se reduciría a unos 31 GB, y a 4 bits a unos 16 GB, aunque no se confirma que el modelo base soporte estas cuantizaciones.
- GPUs recomendadas: para fp16, una A100 de 80 GB o H100; para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, pero no hay garantía.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft`, o exportarse a GGUF para usarse con `llama.cpp` u Ollama, aunque no se proporcionan instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El adaptador se basa en un modelo (Gemma 4 31B) del que no se tienen especificaciones públicas en este contexto. No se conocen otros adaptadores comparables con el mismo dataset y configuración. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, riesgos de alucinación, limitaciones de idioma o contexto, ni restricciones de uso.
- El modelo base (Gemma 4 31B-it) no está documentado en este repositorio; se desconoce su licencia y políticas de uso.
- El adaptador tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No hay evidencia de que el modelo funcione correctamente en producción; cualquier uso debe ir precedido de una evaluación exhaustiva.
- La fecha de creación (agosto de 2026) es futura, lo que podría indicar un error en los metadatos o un modelo hipotético.
- Al ser un adaptador LoRA, no es un modelo autónomo: requiere el modelo base completo para funcionar, lo que implica requisitos de hardware adicionales.
- No se especifican restricciones de licencia para uso comercial; se debe contactar al autor para aclaraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_oasst1_gemma-4-31b_as_gemma-4-31b_seed42
- Modelo base (referenciado): https://huggingface.co/google/gemma-4-31B-it
- Referencia al paper de estimación de emisiones (citado en la model card): https://arxiv.org/abs/1910.09700
