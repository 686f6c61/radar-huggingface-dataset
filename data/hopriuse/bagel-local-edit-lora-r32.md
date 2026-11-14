# hopriuse/BAGEL-Local-Edit-LoRA-r32

## Resumen

BAGEL Local Edit LoRA r32 es un adaptador PEFT de tipo LoRA publicado por el usuario hopriuse para el modelo multimodal ByteDance-Seed/BAGEL-7B-MoT. No es un checkpoint independiente, sino un conjunto de pesos de bajo rango (rank 32, alpha 64, dropout 0) que se acopla a las proyecciones de atención y MLP del experto de generación (`moe_gen`) del modelo base. Su propósito es especializar BAGEL en edición local de imágenes, es decir, modificaciones acotadas a una región concreta de una imagen existente sin alterar el resto del contenido.

El adaptador se presenta como una conversión de bajo rango del "Local Edit Teacher" del proyecto del autor, y solo se publica la versión portable en formato PEFT. Es relevante para quienes investigan en edición de imágenes con modelos unificados de generación y edición, y en particular en técnicas de destilación multi-Teacher (OPD) y fusión de Teachers sobre arquitecturas BAGEL.

La información disponible es limitada: el repositorio tiene 0 descargas y 0 likes, no se declaran idiomas soportados y no se aportan benchmarks comparativos con otros modelos. La licencia declarada es Apache 2.0, aunque el uso queda supeditado a la licencia del modelo base BAGEL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre BAGEL-7B-MoT; target en atención y MLP del experto de generación (`moe_gen`) |
| Parametros totales | no disponible (adaptador de bajo rango; rank 32, alpha 64) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la licencia del modelo base BAGEL) |
| Formato de pesos | safetensors (PEFT); tamano del repo 0.2 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 32 con alpha 64 y dropout 0 aplicado sobre las proyecciones de atención y MLP del experto de generación (`moe_gen`) del modelo BAGEL-7B-MoT. BAGEL es un modelo multimodal con arquitectura Mixture-of-Transformers (MoT) que unifica generación y edición de imágenes; el adaptador no modifica el resto de componentes del modelo base ni el experto de comprensión.

Según la model card, el adaptador es una conversión de bajo rango del "Local Edit Teacher" aceptado del proyecto del autor, que se mantiene como autoridad de procedencia. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor enmarca el trabajo en el contexto de investigación sobre OPD multi-Teacher, fusión de Teachers y Students unificados de generación/edición. Se especifica una revisión exacta del modelo base (`5019f57d168e5816e8f3f701b17cc816bb7cf24b`) y un SHA-256 del adaptador (`b19a759b43d7bf42be225e5d81727d933987856d813a4400fdbc6c992dc8d4d8`) para garantizar la reproducibilidad de la carga.

## Capacidades

- Edición local de imágenes: modificación de regiones acotadas de una imagen de entrada preservando el resto del contenido.
- Pipeline image-to-image: el adaptador se integra en el flujo de edición del modelo base BAGEL.
- Especialización sobre el experto de generación (`moe_gen`) del modelo BAGEL-7B-MoT.
- Compatibilidad con PEFT: carga mediante la librería `peft` junto con la revisión exacta del modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos especiales (thinking, audio) en la información disponible.

## Casos de uso

- Investigación en edición local de imágenes: el adaptador sirve como punto de partida reproducible para experimentar con modificaciones regionales sobre BAGEL, gracias a la revisión fijada del modelo base y al SHA-256 del adaptador.
- Estudio de destilación multi-Teacher: permite replicar y analizar la conversión de un Teacher de edición local a un adaptador LoRA de rank 32, comparando el comportamiento del Student resultante.
- Evaluación de fusion de Teachers: el adaptador puede emplearse como componente en experimentos de fusión de Teachers sobre arquitecturas BAGEL.
- Prototipado de herramientas de retoque asistido: en entornos de investigación, se puede integrar en un pipeline image-to-image para probar ediciones acotadas (por ejemplo, sustituir un objeto en una región concreta) sin reentrenar el modelo base.
- Benchmarking interno de calidad de edición: el autor proporciona una evaluación congelada de 64 imágenes Global + 64 Local con el scorer SpatialReward, útil como referencia de compatibilidad y calidad para comparaciones internas.
- Base para adaptadores especializados: al ser un LoRA de bajo rango sobre `moe_gen`, puede servir como inicialización o referencia para otros adaptadores de edición local en el mismo modelo base.

## Benchmarks y rendimiento

| Subconjunto | SpatialReward |
|---|---:|
| Global (64 muestras) | 0.8458412 |
| Local (64 muestras) | 0.8608092 |

Ambos valores se obtienen con el mismo scorer SpatialReward sobre dos subconjuntos de prompts distintos y, según el autor, no deben interpretarse como dos métricas de especialistas independientes. La comparación pareada de rangos no resultó estadísticamente concluyente con 64 muestras por subconjunto, por lo que estos valores deben tomarse como evidencia de compatibilidad y calidad, no como una afirmación de superioridad frente a otro rank. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0.2 GB y requiere cargarse junto con el modelo base BAGEL-7B-MoT; los requisitos de VRAM vienen determinados por el modelo base, no por el adaptador.
- VRAM estimada para inferencia: no disponible en la información proporcionada (depende de la cuantización y del pipeline de BAGEL-7B-MoT).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la librería `peft` junto con el modelo base; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores de edición de imágenes ni con modelos de la misma categoría.

## Limitaciones y advertencias

- No es un checkpoint independiente: debe cargarse con la revisión exacta del modelo base BAGEL-7B-MoT (`5019f57d168e5816e8f3f701b17cc816bb7cf24b`); otras revisiones pueden producir incompatibilidades.
- La evaluación se limita a 64 muestras Global + 64 Local y el autor advierte que la comparación pareada de rangos no es estadísticamente concluyente.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma en la información disponible.
- El uso comercial está sujeto a la licencia Apache 2.0 declarada y a la licencia del modelo base BAGEL; conviene verificar ambas antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación externa por parte de la comunidad.
- El adaptador está orientado a investigación en edición de imágenes; el autor recomienda evaluarlo en el dominio de despliegue propio antes de usarlo.
- No se proporcionan datos sobre robustez frente a prompts adversarios ni sobre el comportamiento en dominios distintos al de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/hopriuse/BAGEL-Local-Edit-LoRA-r32
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
