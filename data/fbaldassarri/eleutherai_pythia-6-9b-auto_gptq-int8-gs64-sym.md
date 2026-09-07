# fbaldassarri/EleutherAI_pythia-6.9b-auto_gptq-int8-gs64-sym

## Resumen

Este modelo es una cuantización INT8 del modelo Pythia-6.9b de EleutherAI, realizada por fbaldassarri. El objetivo es reducir el tamaño y el consumo de memoria del modelo original manteniendo un rendimiento razonable, optimizando la inferencia en hardware Intel (CPU, iGPU Arc y NPU AI Boost). La cuantización se ha realizado con el framework Intel AutoRound v0.13.1, utilizando el algoritmo GPTQ (AutoGPTQ) con 8 bits, group size 64 y cuantización simétrica. El modelo base es un transformer causal GPT-NeoX entrenado en el dataset Pile, con licencia Apache 2.0. Esta versión está pensada para entornos con recursos limitados o para investigación en compresión de modelos.

Según HuggingFace, el modelo tiene 2.152.210.432 parámetros, aunque el tamaño del repositorio (8.4 GB) sugiere que se trata del modelo completo de 6.9B en INT8. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-NeoX) |
| Parametros totales | 2.152.210.432 (según HuggingFace; el modelo base Pythia-6.9b tiene 6.9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, group size 64, simétrico, GPTQ (AutoGPTQ) con AutoRound |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ INT8) |

## Arquitectura y entrenamiento

El modelo base es Pythia-6.9b, un transformer causal de la familia GPT-NeoX, entrenado por EleutherAI en el dataset Pile. No se ha realizado ningún ajuste por instrucciones (RLHF/DPO); se trata de un modelo de completación de texto en inglés.

La cuantización se ha llevado a cabo con Intel AutoRound v0.13.1, aplicando el algoritmo GPTQ (AutoGPTQ) en modo INT8. Los parámetros de calibración fueron 128 muestras, 200 iteraciones, secuencia de 512 tokens y batch size 4, todo en CPU. La cuantización es simétrica con group size 64. La innovación principal es la optimización de la inferencia para hardware Intel, incluyendo CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost (via OpenVINO), manteniendo los pesos en bfloat16 durante el ajuste.

## Capacidades

- Generación de texto en inglés como modelo base de completación.
- Completar prompts con texto libre, sin seguir instrucciones ni formato de chat.
- Razonamiento básico y generación de texto generalista, limitado por el entrenamiento en el Pile.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No tiene capacidades de visión ni audio.
- Soporte multilingüe limitado al inglés.
- No dispone de modo de pensamiento (thinking mode).

## Casos de uso

- Inferencia en entornos Intel con recursos limitados: el modelo está optimizado para CPU, iGPU Arc y NPU AI Boost, por lo que puede ejecutarse en portátiles o dispositivos edge sin necesidad de GPU dedicada.
- Fine-tuning para tareas de NLP en inglés: al ser un modelo base, se puede ajustar para clasificación de texto, reconocimiento de entidades o análisis de sentimiento, partiendo de pesos cuantizados que reducen el coste de experimentación.
- Investigación en cuantización y compresión: sirve como ejemplo de cuantización INT8 con AutoRound, útil para comparar con otras versiones del mismo modelo (por ejemplo, la variante INT4) y evaluar el trade-off entre precisión y memoria.
- Generación de texto en inglés en aplicaciones de escritorio: la cuantización INT8 permite cargar el modelo en menos memoria, facilitando su integración en herramientas locales de asistencia a la escritura.
- Completado de texto en inglés para asistentes de escritura: se puede utilizar como modelo de completado en editores de texto, generando continuaciones a partir de un prompt simple.
- Base para experimentos de interpretabilidad o análisis de sesgos: Pythia es una familia de modelos diseñada para investigación, y esta versión cuantizada permite estudiar el impacto de la cuantización en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8.4 GB, por lo que se requiere al menos esa cantidad de memoria para cargar el modelo. En INT8, el consumo de memoria se estima en torno a 6.9 GB para los pesos, más overhead.
- GPU recomendadas: el modelo está optimizado para Intel CPU, iGPU Arc y NPU AI Boost. No se especifican requisitos para GPU NVIDIA o AMD.
- Cabe en consumer GPU: no se confirma en la información disponible; se necesitaría una GPU con al menos 8 GB de VRAM para una carga completa.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch y OpenVINO.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantización | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| Pythia-6.9b (base) | FP32/FP16 | 6.9B (según nombre del modelo) | no disponible | Apache 2.0 |
| Pythia-6.9b INT8 (este) | INT8 GPTQ | 2.152.210.432 (dato HuggingFace) | no disponible | Apache 2.0 |
| Pythia-6.9b INT4 | INT4 GPTQ | no disponible | no disponible | Apache 2.0 |

La versión INT4 del mismo autor (fbaldassarri/EleutherAI_pythia-6.9b-auto_gptq-int4-gs64-sym) ofrece una cuantización más agresiva, con menor consumo de memoria y mayor velocidad, pero con una pérdida de precisión mayor que la INT8.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado en el Pile, un dataset masivo no filtrado que contiene sesgos y contenido potencialmente dañino.
- Riesgo de alucinación: al ser un modelo base, puede generar texto plausible pero incorrecto o no factual.
- Limitaciones de contexto e idioma: solo soporta inglés; la longitud de contexto no se especifica en la información disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor indica que el modelo se ha desarrollado únicamente con fines de investigación.
- Cuantización: la conversión a INT8 puede introducir pérdida de precisión respecto al modelo original, afectando a tareas que requieren alta exactitud.
- No es instructivo: no sigue instrucciones, no soporta tool calling ni agentes, por lo que no es adecuado para asistentes conversacionales sin un ajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/EleutherAI_pythia-6.9b-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/EleutherAI/pythia-6.9b
- Versión INT4 del mismo autor: https://huggingface.co/fbaldassarri/EleutherAI_pythia-6.9b-auto_gptq-int4-gs64-sym
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile
