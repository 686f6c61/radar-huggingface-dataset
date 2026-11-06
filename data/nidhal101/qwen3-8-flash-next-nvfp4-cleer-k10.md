# Nidhal101/Qwen3.8-Flash-Next-NVFP4-CLEER-k10

## Resumen

Qwen3.8-Flash-Next-NVFP4-CLEER-k10 es una cuantización derivada del modelo nvidia/Qwen3.8-Flash-Next-NVFP4, que a su vez es la versión cuantizada a NVFP4 del modelo multimodal Qwen3.8-Flash-Next de Alibaba. El autor del repositorio, Nidhal101, publica esta variante bajo la licencia NVIDIA Open Model License, manteniendo la estela del modelo base de NVIDIA. Se trata, por tanto, de una ficha de un artefacto de cuantización más que de un modelo entrenado desde cero: el interés está en el formato de pesos y en la cadena de derivación, no en un entrenamiento original.

El modelo subyacente es un transformer autorregresivo de tipo mixture-of-experts (MoE) con encoder de visión y atención híbrida (Gated DeltaNet combinada con atención estándar, según la documentación del modelo base). Cuenta con 59.032.920.979 parámetros totales según los safetensors del repositorio, aunque el número de parámetros activos por paso no está disponible en la información proporcionada. El repositorio ocupa 63,4 GB y contiene pesos en formato safetensors con cuantización NVFP4 en los expertos enrutados de las 48 capas MoE del modelo principal.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue de bajo coste para un modelo multimodal MoE de gran tamaño sobre hardware NVIDIA con soporte de FP4; por otro, advierte de que el repositorio tiene cero descargas y cero likes, creado y actualizado el mismo día (6 de noviembre de 2026), sin model card propia más allá de la atribución al modelo base. Es un artefacto reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal tipo mixture-of-experts (MoE) con encoder de visión y atención híbrida (Gated DeltaNet + atención estándar, según modelo base) |
| Parametros totales | 59.032.920.979 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, E2M1, group size 16, escalas de bloque FP8 E4M3, escalas globales FP32, activaciones NVFP4 dinámicas) en los expertos enrutados de las 48 capas MoE principales |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (modelopt) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.8-Flash-Next: un transformer causal multimodal con encoder de visión, atención híbrida que combina Gated DeltaNet con atención clásica y capas MoE con expertos dispersos. Según la documentación del modelo base de NVIDIA, se trata de un modelo de lenguaje autorregresivo con arquitectura transformer optimizada y componentes de embedding que permiten carga por niveles (tiered loading), usando solo un subconjunto de recursos de cómputo en cada paso. El repositorio de naftulikay sobre la misma cuantización indica que solo se cuantizan los expertos enrutados de las 48 capas MoE principales (fused gate_up_proj / down_proj; 294.912 entradas de tensor cuantizadas) a NVFP4 W4A4.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ni en la model card del repositorio ni en los resultados de búsqueda. Tampoco se documenta el proceso de cuantización específico de esta variante CLEER-k10 más allá de la herencia del modelo base NVFP4. La innovación técnica destacable es la propia cuantización NVFP4 con escalas de bloque FP8 y activaciones dinámicas, orientada a servir el modelo en GPUs NVIDIA con soporte de FP4 (arquitecturas Blackwell y posteriores) mediante SGLang, según la referencia del repositorio de naftulikay.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento multimodal: el modelo base incluye encoder de visión, por lo que se espera soporte de entrada de imágenes, aunque la model card de esta variante no lo detalla.
- Tareas de agente y Q&A general, según la descripción del modelo base en la documentación de NVIDIA y PINVOU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal de bajo coste en GPUs NVIDIA con soporte FP4: la cuantización NVFP4 reduce el peso de los expertos enrutados a 4 bits, permitiendo servir un modelo de ~59.000 millones de parámetros en menos memoria que la versión BF16, usando SGLang como runtime de referencia.
- Servicio de Q&A general sobre documentos con imágenes: el encoder de visión del modelo base permite procesar capturas, diagramas o páginas escaneadas junto con texto en un mismo flujo de preguntas y respuestas.
- Backend de agentes conversacionales: la arquitectura MoE con carga por niveles permite activar solo un subconjunto de expertos por paso, lo que encaja en despliegues con presupuesto de cómputo variable por petición.
- Evaluación interna de cuantizaciones: este repositorio sirve para comparar la calidad de NVFP4 frente al modelo base en tareas de razonamiento y visión, antes de adoptar la cuantización en producción.
- Prototipado de pipelines multimodales en investigación: al estar en safetensors y con soporte de SGLang, se puede integrar en experimentos de evaluación de modelos MoE cuantizados sin reentrenar.
- Despliegue en entornos con licencia NVIDIA Open Model License: adecuado para organizaciones que ya operan bajo ese marco legal y quieren un modelo derivado del ecosistema NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 63,4 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más overhead de activaciones y KV cache.
- GPUs recomendadas: NVIDIA Blackwell o posteriores con soporte nativo de FP4, dado que la cuantización es NVFP4. El modelo base está pensado para servir con SGLang.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada; con 59.000 millones de parámetros y 63,4 GB de pesos, no cabe en GPUs consumer de 24 GB sin offloading o cuantizaciones adicionales.
- Opciones de despliegue: SGLang (referenciado para la cuantización NVFP4 del modelo base). vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nidhal101/Qwen3.8-Flash-Next-NVFP4-CLEER-k10 | 59.032.920.979 | no disponible | NVFP4 | NVIDIA Open Model License | Hugging Face (0 descargas) |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 | NVIDIA Open Model License | Hugging Face (modelo base) |
| naftulikay/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 W4A4 | no disponible | Hugging Face |
| Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 (presumiblemente) | no disponible | no disponible en la búsqueda |

## Limitaciones y advertencias

- Artefacto sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día, sin model card propia más allá de la atribución al modelo base.
- La model card no documenta el proceso de cuantización CLEER-k10 ni las diferencias respecto al modelo base NVFP4; no se puede verificar qué se ha modificado exactamente.
- Solo se cuantizan los expertos enrutados de las 48 capas MoE principales según la referencia del modelo base; otras partes del modelo podrían mantener mayor precisión, pero no se detalla en esta variante.
- Riesgo de degradación por cuantización: NVFP4 W4A4 con activaciones dinámicas puede afectar a tareas sensibles a la precisión numérica; no hay benchmarks publicados que lo cuantifiquen.
- Licencia NVIDIA Open Model License: es necesario revisar los términos completos antes de uso comercial; la model card remite a LICENSE sin resumir restricciones.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para esta variante.
- Longitud de contexto no documentada: no se puede planificar el uso en escenarios de contexto largo sin consultar la documentación del modelo base.
- Dependencia de hardware NVIDIA con soporte FP4: la cuantización NVFP4 no es portable a GPUs sin soporte nativo de FP4 sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nidhal101/Qwen3.8-Flash-Next-NVFP4-CLEER-k10
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Cuantización NVFP4 de referencia (naftulikay): https://huggingface.co/naftulikay/Qwen3.8-Flash-Next-NVFP4
- Ficha del modelo en The Applied: https://theapplied.co/models/nvidia-qwen3-8-flash-next-nvfp4
- Informe de validación en PINVOU: https://pinvou.com/en/reports/qwen3-8-flash-next-nvfp4-single.html
