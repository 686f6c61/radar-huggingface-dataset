# meltingfeet/backup2026-11-02-Zynerji-Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24

## Resumen

Este repositorio es una copia de seguridad (backup) del modelo Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored, publicada por el usuario meltingfeet. Se trata de una versión cuantizada a 4 bits (GPTQ con kernels Marlin, formato compressed-tensors) de un modelo derivado de la familia Qwen3.5, etiquetado como "abliterated" y "pristinely uncensored", es decir, con los mecanismos de rechazo eliminados mediante técnicas de abliteración sin fine-tuning adicional. El pipeline declarado es text-generation, aunque las etiquetas incluyen image-text-to-text y vision-language, lo que sugiere capacidades multimodales heredadas del modelo base.

El nombre comercial indica "27B", pero el recuento real de parámetros en los pesos safetensors es de 4.400.327.408 (aproximadamente 4,4 mil millones), una discrepancia notable que conviene tener en cuenta: o bien el nombre hace referencia a otra variante, o bien la cuantización y el empaquetado han alterado el conteo. El repositorio ocupa 14,7 GB y está sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización int4 con soporte para vLLM y decodificación especulativa mediante multi-token prediction (MTP); por otro, advierte de las inconsistencias de metadatos (tamaño declarado frente a parámetros reales, licencia Apache-2.0 sobre un derivado "uncensored") que un equipo de producción debe verificar antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (etiqueta `qwen3_5`), con soporte de multi-token prediction (MTP) |
| Parametros totales | 4.400.327.408 (según safetensors); el nombre del modelo indica 27B, dato no verificado |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 256k tokens (según etiqueta `long-context`, `256k`) |
| Tipos de cuantizacion | int4, 4-bit, GPTQ, Marlin, mixed-precision, compressed-tensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (GPTQ int4) |

## Arquitectura y entrenamiento

El modelo se presenta como un derivado de la arquitectura Qwen3.5, un transformer decoder-only con atención estándar y soporte declarado de multi-token prediction (MTP), lo que habilita decodificación especulativa en inferencia. La etiqueta `ektome` y la descripción "abliterated / uncensored / pristinely-uncensored / no-finetuning / no-training" indican que el modelo base fue sometido a abliteración (eliminación de direcciones de rechazo en el espacio de activaciones) sin un ciclo posterior de fine-tuning ni de entrenamiento adicional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica destacable en este repositorio concreto es la cuantización: se emplea compressed-tensors con precisión mixta e int4 GPTQ con kernels Marlin, pensada para servir el modelo en vLLM con buen throughput. El repositorio es un backup, no un artefacto de entrenamiento, por lo que no aporta detalles sobre el proceso de alineación. Las etiquetas de visión (`image-text-to-text`, `vision-language`) apuntan a que el modelo base incorpora un encoder visual, aunque no se documenta en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y generación de código (capacidades heredadas de la familia Qwen, sin benchmarks publicados en este repositorio).
- Procesamiento de imagen y texto (etiquetas `image-text-to-text` y `vision-language`), si bien la ficha del pipeline declara únicamente text-generation.
- Contexto largo de hasta 256k tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa mediante multi-token prediction (MTP), orientada a reducir latencia en inferencia.
- Modo "uncensored": ausencia deliberada de mecanismos de rechazo, lo que cambia el comportamiento por defecto frente a modelos alineados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos: con 256k tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada, útil para resumen y extracción de entidades en pipelines internos.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, sirve como referencia para estudiar cómo cambia el comportamiento al eliminar las direcciones de rechazo, comparándolo con el modelo base alineado.
- Generación de código en entornos controlados: puede integrarse en asistentes de programación internos donde no se requieran las salvaguardas del modelo original, siempre que el equipo asuma la revisión manual del output.
- Despliegue de alto throughput con vLLM: la cuantización int4 con Marlin y el soporte de MTP permiten servirlo en GPUs de gama alta con mayor número de peticiones concurrentes que la versión en fp16.
- Experimentación con decodificación especulativa: el soporte MTP lo convierte en un banco de pruebas para medir ganancias de latencia en técnicas de speculative decoding.
- Prototipado de asistentes conversacionales en inglés: para demos y pruebas de concepto donde el multilingüismo no sea requisito, dado que solo declara inglés.
- Evaluación de cuantización: comparar la calidad de esta variante int4 GPTQ frente al modelo base en tareas de razonamiento y generación, como estudio de degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,4 mil millones de parámetros en int4, los pesos ocupan aproximadamente 2,5-3 GB; con overhead de KV cache para contexto largo, se recomienda al menos 8-12 GB para contextos moderados y 24 GB o más para aprovechar ventanas cercanas a 256k tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) para uso individual con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 12-16 GB con contexto corto.
- Opciones de despliegue: vLLM es la vía principal (kernels Marlin, compressed-tensors, MTP); llama.cpp y Ollama no están confirmados para este formato GPTQ int4.
- Latencia y throughput estimados: no disponibles; el soporte de MTP sugiere mejoras de latencia frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (backup int4) | 4,4B (según safetensors) | 256k | Apache-2.0 | Gated en HuggingFace |
| Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored (base) | no disponible | no disponible | no disponible | HuggingFace |
| Familia Qwen3.5 (modelos oficiales) | variable según variante | variable | variable según variante | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de metadatos: el nombre indica 27B pero los safetensors suman 4,4B de parámetros; verificar el artefacto real antes de dimensionar hardware.
- Modelo "uncensored": la abliteración elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o ilegal sin filtro; no apto para aplicaciones de cara al público sin moderación externa.
- Solo declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Licencia Apache-2.0 declarada sobre un derivado de un modelo de terceros: conviene verificar la compatibilidad de licencias del modelo base antes de uso comercial.
- Repositorio de backup con 0 descargas y 0 likes: sin validación comunitaria, sin garantía de mantenimiento y con acceso restringido (gated).
- La cuantización int4 puede degradar tareas sensibles a precisión (matemáticas, código complejo) frente al modelo en fp16.
- El pipeline declarado (text-generation) no coincide con las etiquetas multimodales; confirmar si el encoder visual está realmente incluido en los pesos.
- Sin documentación de tool calling ni de soporte de agentes: no asumir estas capacidades en producción.

## Enlaces

- HuggingFace: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Qwen3.8-27B-PristinelyUncensored-HOMEUSER-16-24
- Modelo base: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
