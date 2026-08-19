# ChrisR05/tabnla_anthropic_faithful_v23_multisubstrate_nla-r1

## Resumen

Este repositorio contiene checkpoints experimentales del brazo R1 de un experimento de autoencoder de lenguaje natural multi-substrato denominado TabNLA v23. El modelo combina un modelo de lenguaje base, Qwen2.5-1.5B-Instruct, con un modelo TabPFN congelado (versión v2 de regresión) como objetivo de reconstrucción. El objetivo es explorar si las representaciones internas de un LLM pueden alinearse con las salidas de un modelo TabPFN mediante un canal de texto no restringido, en el marco de un autoencoder de activaciones.

Desarrollado por ChrisR05, el proyecto se presenta como una investigación sobre interpretabilidad y representaciones neuronales, no como un modelo de propósito general. El repositorio tiene un tamaño de 14,4 GB y se distribuye bajo licencia Apache 2.0. No se proporcionan métricas de rendimiento, datos de entrenamiento detallados ni especificaciones de contexto, por lo que su utilidad práctica es limitada fuera del ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de lenguaje natural multi-substrato basado en Qwen2.5-1.5B-Instruct (transformador) con objetivo TabPFN congelado (regresion v2) |
| Parametros totales | No disponible (el modelo base Qwen2.5-1.5B-Instruct tiene 1,5B, pero no se especifica el total del autoencoder) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (formato de serializacion no especificado) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje base (Qwen2.5-1.5B-Instruct) con un modelo TabPFN congelado como objetivo de regresion. El autoencoder utiliza representaciones de activaciones del bloque `L08:post_mlp:query_target` del LLM, y el objetivo de reconstruccion se define como `raw_plus_balanced`. El canal de texto es "AV prose" sin restricciones, pasado directamente al autoregresor (AR). Se menciona soporte para prompts "Targeted Activation-Oracle" a traves del mismo canal.

El entrenamiento se describe como "optimizer-free", lo que sugiere un enfoque no convencional, posiblemente basado en ajuste directo de pesos sin optimizadores estocasticos clasicos. No se proporcionan detalles sobre el dataset, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La informacion disponible es insuficiente para caracterizar el proceso de entrenamiento con precision.

## Capacidades

- No se documentan capacidades especificas del modelo en la informacion proporcionada.
- Al ser un experimento de autoencoder de activaciones, no se espera que genere texto de forma autonoma ni que realice tareas de razonamiento, codigo o matematicas.
- No se menciona soporte para tool calling, agentes, vision, audio ni capacidades multilingues.
- El unico proposito declarado es la reconstruccion de representaciones internas del LLM a partir de un objetivo TabPFN, orientado a investigacion en interpretabilidad.

## Casos de uso

- Investigacion en interpretabilidad de modelos: el autoencoder podria utilizarse para estudiar como las activaciones de Qwen2.5 se relacionan con las predicciones de un TabPFN, aunque no hay documentacion de resultados.
- Analisis de representaciones internas: los checkpoints permiten inspeccionar los pesos serializados para entender la estructura de las representaciones aprendidas, pero se requiere reconstruir los modulos Python a partir de la celda exacta y los metadatos del repositorio.
- Experimentacion con autoencoders de activaciones: el repositorio sirve como referencia para replicar el experimento o comparar con otros enfoques de alineacion de representaciones.
- No se identifican casos de uso practicos en produccion, dado el caracter experimental y la falta de especificaciones de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la informacion disponible.
- El tamaño del repositorio es de 14,4 GB, lo que sugiere que los pesos completos requieren al menos esa cantidad de memoria para cargarse en RAM o VRAM, pero no se confirma.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, dado que se trata de un experimento de investigacion sin publicaciones asociadas ni benchmarks.

## Limitaciones y advertencias

- Modelo experimental sin documentacion de sesgos, alucinaciones o limitaciones de contexto.
- No apto para uso en produccion: no se han validado capacidades de generacion de texto ni tareas practicas.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentacion y soporte hace inviable su integracion en aplicaciones reales.
- El repositorio no incluye instrucciones claras de uso ni ejemplos de inferencia; se requiere reconstruir los modulos Python a partir de los metadatos, lo que anade complejidad.
- No se garantiza la reproducibilidad del experimento sin acceso a la celda exacta y los metadatos mencionados en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChrisR05/tabnla_anthropic_faithful_v23_multisubstrate_nla-r1
