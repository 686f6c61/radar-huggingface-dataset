# Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-OpenVINO-FP16

## Resumen

El modelo `Nanbeige4.2-3B-CE-v1.0-OpenVINO-FP16` es una exportación OpenVINO FP16 stateful del modelo `Irfanuruchi/Nanbeige4.2-3B-CE-v1.0`, desarrollado por Irfanuruchi. Se trata de un modelo de generación de texto conversacional basado en la arquitectura NanbeigeForCausalLM, con 22 capas transformer físicas y 2 bucles recurrentes. El objetivo de esta versión es ofrecer una implementación optimizada para el ecosistema Intel OpenVINO, permitiendo su ejecución en CPUs y gráficos integrados Intel sin necesidad de GPUs dedicadas.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para aplicaciones de texto conversacional. Aunque el nombre sugiere un tamaño de 3.000 millones de parámetros, la documentación disponible no confirma explícitamente el número total de parámetros. El repositorio tiene un tamaño de 8,4 GB, consistente con pesos en FP16 de aproximadamente 3B parámetros. No se especifica la longitud de contexto ni los idiomas soportados.

La relevancia de este modelo radica en su integración con OpenVINO y OpenVINO GenAI, lo que facilita el despliegue en hardware Intel de gama baja (iGPU, CPU), así como en entornos edge. Sin embargo, la model card advierte que la validación de runtime no es un benchmark de calidad factual y que se preservan las limitaciones conocidas del checkpoint congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NanbeigeForCausalLM |
| Parametros totales | 3B (inferido del nombre; no confirmado en la documentación) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (stateful) |

## Arquitectura y entrenamiento

La arquitectura del modelo es NanbeigeForCausalLM, un diseño de transformer con componentes recurrentes. Según la model card, el modelo tiene 22 capas transformer físicas y 2 bucles recurrentes, lo que da un total de 44 entradas efectivas de KV-cache validadas durante la exportación. El parámetro `skip_loop_final_norm` está establecido en `false`.

Esta versión concreta no es un reentrenamiento, sino una exportación FP16 stateful del checkpoint original `Irfanuruchi/Nanbeige4.2-3B-CE-v1.0`. No se proporcionan datos sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card indica que la exportación fue validada con OpenVINO 2026.3.1 y OpenVINO GenAI 2026.3.1 en gráficos integrados Intel.

## Capacidades

- Generación de texto: el modelo está diseñado para el pipeline de text-generation.
- Conversación: el tag "conversational" indica que soporta diálogos multi-turno.
- Chat templates: la model card recomienda usar el chat template canónico de Hugging Face con `enable_thinking=False`.
- Integración OpenVINO: incluye tokenizer y detokenizer de OpenVINO, con IDs de token verificados idénticos a los de Hugging Face.
- No se especifican capacidades de tool calling, agentes, razonamiento avanzado, visión o audio.

## Casos de uso

- Inferencia en hardware Intel integrado: el modelo está optimizado para OpenVINO y ha sido validado en gráficos integrados Intel, lo que permite ejecutarlo en equipos sin GPU dedicada.
- Despliegue en entornos edge: al poder ejecutarse en CPU e iGPU, es adecuado para aplicaciones locales de generación de texto en dispositivos con recursos limitados.
- Aplicaciones de chat conversacional: el modelo soporta chat templates y puede integrarse en asistentes de texto para diálogos multi-turno.
- Prototipado con OpenVINO GenAI: la interfaz stateful de GenAI (3 entradas públicas y 1 salida) facilita la integración en aplicaciones de prueba y desarrollo.
- Integración en pipelines de NLP sobre CPUs Intel: gracias a las optimizaciones de OpenVINO, puede usarse en sistemas de procesamiento de lenguaje natural que ya usan el stack de Intel.
- Investigación en optimización de modelos: sirve como ejemplo práctico de exportación stateful a OpenVINO FP16, útil para estudiar técnicas de despliegue en hardware heterogéneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la validación de runtime realizada no es un benchmark de calidad factual y que no debe interpretarse como una nueva validación semántica.

## Requisitos de hardware

- VRAM estimada: no especificada. Para pesos FP16 de aproximadamente 3B parámetros, se estiman entre 6 y 8 GB de memoria, aunque OpenVINO permite ejecución en CPU e iGPU sin VRAM dedicada.
- GPU recomendadas: Intel iGPU (validado en la documentación). También puede ejecutarse en CPU Intel.
- Cabe en GPU de consumo: no se especifica. Dado el tamaño estimado, podría caber en GPUs de consumo con 8 GB o más, pero no hay confirmación oficial.
- Opciones de despliegue: OpenVINO, OpenVINO GenAI. También existe una versión GGUF para su uso con llama.cpp u otros runners compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-OpenVINO-FP16 | NanbeigeForCausalLM | 3B (inferido) | No disponible | Apache 2.0 | OpenVINO IR |
| Irfanuruchi/Nanbeige4.2-3B-CE-v1.0 | NanbeigeForCausalLM | 3B (inferido) | No disponible | Apache 2.0 | No especificado (probablemente PyTorch/safetensors) |
| Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF | NanbeigeForCausalLM | 3B (inferido) | No disponible | Apache 2.0 | GGUF |
| Nanbeige/Nanbeige4.2-3B | NanbeigeForCausalLM | 3B (inferido) | No disponible | No especificada | No especificado |

## Limitaciones y advertencias

- La model card advierte que la validación de runtime no es un benchmark de calidad factual y que se preservan las limitaciones conocidas del checkpoint congelado.
- El repositorio GGUF del mismo modelo indica que existen "debilidades conocidas de precisión/factuales en preguntas de sistemas difíciles".
- No se especifican los idiomas soportados, lo que limita su uso a escenarios donde el idioma no sea crítico o se haya verificado manualmente.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento ante prompts adversos.
- No hay información sobre la longitud de contexto, por lo que el rendimiento en conversaciones largas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos de la licencia.

## Enlaces

- Modelo OpenVINO: https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-OpenVINO-FP16
- Modelo base: https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0
- Versión GGUF: https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF
- Modelo original de Nanbeige: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
