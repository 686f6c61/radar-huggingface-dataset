# Gen4536/Artemis-31B-v1.2-exl3

## Resumen

Artemis-31B-v1.2-exl3 es una colección de cuantizaciones EXL3 del modelo Artemis-31B-v1.2, publicado originalmente por TheDrummer. El autor de esta ficha de cuantización es Gen4536, que distribuye tres artefactos en formato EXL3 (ExLlamaV3) pensados para ajustarse a distintos perfiles de VRAM en tarjetas gráficas de consumo. El modelo base deriva de la familia Gemma 4 y está orientado a generación de texto para roleplay, con contenido NSFW y etiqueta de no apto para todas las audiencias.

El problema que resuelve esta publicación es de acceso: la mayoría de usuarios de modelos de roleplay trabajan con GPUs de consumo de 12, 16 o 24 GB de VRAM, y las cuantizaciones de alta calidad disponibles estaban orientadas a equipos más potentes. Gen4536 ofrece tres niveles de compromiso entre tamaño y fidelidad (2,15 bpw, 3,00 bpw y 5,00 bpw) con recetas calibradas específicamente sobre datos de roleplay, además de una comparativa de divergencia KL frente a cuantizaciones GGUF de bartowski y mradermacher y una EXL3 de MikeRoz.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización concreta con datos de fidelidad medidos; por otro, ilustra una práctica poco extendida en el ecosistema de roleplay, que es evaluar cuantizaciones con métricas objetivas (divergencia KL y tasa de tokens muestreados de forma distinta al modelo BF16) en lugar de elegir por terminología genérica como Q5_K_M o por número de bits por peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (modelo base: TheDrummer/Artemis-31B-v1.2); cuantización EXL3 con ExLlamaV3 |
| Parametros totales | 31B (según el nombre del modelo base; no se detalla en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,15 bpw (H6, self-calibrated sobre datos de roleplay), 3,00 bpw (H6, self-calibrated sobre datos de roleplay) y 5,00 bpw (H6, estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base Artemis no declara licencia propia; esta cuantización sigue la licencia del Gemma 4 subyacente) |
| Formato de pesos | EXL3 (ExLlamaV3); tamaño total del repo: 52,3 GB |

## Arquitectura y entrenamiento

El modelo base es Artemis-31B-v1.2 de TheDrummer, un transformer de 31B parámetros derivado de Gemma 4 y ajustado para roleplay. Esta publicación no entrena ningún modelo: cuantiza los pesos en precisión completa del modelo base (revisión `73c8815a`) a formato EXL3 mediante ExLlamaV3, con tres recetas diferenciadas. Las dos recetas pequeñas (2,15 y 3,00 bpw) usan H6 y calibración propia (self-calibrated) sobre datos de roleplay, un detalle relevante porque la calibración específica de dominio suele preservar mejor el comportamiento en la tarea objetivo que una calibración genérica. La receta de 5,00 bpw es una cuantización estándar H6 sin calibración específica de roleplay.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal en esta publicación. La aportación técnica destacable es la metodología de evaluación de cuantizaciones: el autor mide divergencia KL media frente al modelo BF16 y la proporción de tokens muestreados de forma distinta con un sampler de roleplay, lo que permite comparar cuantizaciones de distintos formatos (EXL3 y GGUF) sobre una base objetiva y no solo por tamaño de archivo.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con soporte de contenido NSFW según las etiquetas del modelo.
- Conversaciones multi-turno con personajes y mantenimiento de persona, según el propósito declarado del modelo base.
- Generación de texto general (pipeline `text-generation`).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Inferencia eficiente en GPUs de consumo gracias a las tres recetas EXL3 con huellas de VRAM de 8,95 GB, 12,06 GB y 19,38 GB de pesos en GPU.

## Casos de uso

- Roleplay en GPU de 12 GB: la receta de 2,15 bpw ocupa 8,95 GB de pesos en GPU y está calibrada sobre datos de roleplay, por lo que es la opción indicada para tarjetas de 12 GB que necesitan margen para el contexto y el caché KV.
- Roleplay en GPU de 16 GB: la receta de 3,00 bpw ocupa 12,06 GB de pesos y ofrece una divergencia KL de 0,0725 frente al BF16, muy inferior a la de cuantizaciones GGUF de tamaño comparable como i1-IQ3_XXS (0,176), lo que la hace adecuada cuando se busca calidad con VRAM limitada.
- Roleplay de alta fidelidad en GPU de 24 GB o superior: la receta de 5,00 bpw ocupa 19,38 GB y se sitúa cerca del original en divergencia KL (~0,005), por lo que es la elección para quienes priorizan preservar el comportamiento del modelo BF16.
- Despliegue local con ExLlamaV3: al estar en formato EXL3, el modelo se integra directamente en el ecosistema ExLlamaV3, adecuado para servir inferencias locales con buen rendimiento en GPUs de consumo.
- Evaluación comparativa de cuantizaciones: los datos de divergencia KL y de tokens distintos frente a BF16 publicados en la model card permiten a un equipo decidir qué cuantización usar según su VRAM sin tener que ejecutar sus propias pruebas.
- Prototipado de aplicaciones conversacionales con personajes: el modelo base está ajustado para roleplay, lo que sirve para construir demos de chat con persona antes de escalar a un modelo mayor o a un servicio en la nube.
- Investigación sobre fidelidad de cuantizaciones: la publicación incluye mediciones frente a artefactos de bartowski, mradermacher y MikeRoz, útil como referencia metodológica para estudiar el impacto de la cuantización en modelos de roleplay.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Incluye métricas de fidelidad de cuantización frente al modelo BF16, que se reproducen a continuación.

| Artefacto | Autor | Pesos en GPU | Divergencia KL media (menor es mejor) |
|---|---|---|---|
| EXL3 2,15 bpw RP recipe | Gen4536 | 8,95 GB | 0,293 |
| i1-IQ2_XXS | mradermacher | 8,67 GB | ~0,906 (3,09 veces la del 2,15 bpw) |
| EXL3 2,25 bpw | MikeRoz | 9,31 GB | 0,343 |
| i1-IQ2_S | mradermacher | 10,1 GB | 0,402 |
| IQ2_S | bartowski | 10,2 GB | 0,487 |
| EXL3 3,00 bpw RP recipe | Gen4536 | 12,06 GB | 0,0725 |
| i1-IQ3_XXS | mradermacher | 12,1 GB | 0,176 |
| IQ3_XXS | bartowski | 13,3 GB | no disponible |
| EXL3 5,00 bpw | Gen4536 | 19,38 GB | ~0,005 |
| Q4_K_M | bartowski | 19,5 GB | ~0,0216 (4,32 veces la del 5,00 bpw) |
| IQ4_XS | bartowski | 17,2 GB | no disponible |
| Q5_K_M | bartowski | 23,5 GB | 0,00756 |
| Q8_0 | bartowski | 32,6 GB | ~0,0015 |

Los valores marcados como aproximados se derivan de los factores indicados en la model card (por ejemplo, «4,32 veces la KLD del 5,00 bpw» o «3,09 veces la del 2,15 bpw»); el resto son cifras publicadas directamente. La model card también incluye un gráfico de proporción de tokens muestreados de forma distinta al BF16 con sampler de roleplay, pero el texto proporcionado se corta antes de dar las cifras.

## Requisitos de hardware

- VRAM estimada (solo pesos en GPU): 8,95 GB para 2,15 bpw; 12,06 GB para 3,00 bpw; 19,38 GB para 5,00 bpw. Hay que añadir el espacio para el caché KV y el contexto, por lo que las cifras de VRAM total recomendada son superiores.
- GPU objetivo según el autor: 12 GB para la receta de 2,15 bpw, 16 GB para la de 3,00 bpw y 24 GB o más para la de 5,00 bpw.
- Cabe en GPUs de consumo: sí, en las tres recetas según el perfil de VRAM indicado (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti Super o RTX 4080 de 16 GB, RTX 3090 o RTX 4090 de 24 GB). No se especifican modelos concretos en la información disponible.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad (KLD vs BF16) | Licencia | Formato |
|---|---|---|---|---|---|
| Artemis-31B-v1.2 EXL3 2,15 bpw (Gen4536) | 31B | no disponible | 0,293 (8,95 GB) | Apache-2.0 | EXL3 |
| Artemis-31B-v1.2 EXL3 2,25 bpw (MikeRoz) | 31B | no disponible | 0,343 (9,31 GB) | no disponible | EXL3 |
| Artemis-31B-v1.2 i1-IQ2_S (mradermacher) | 31B | no disponible | 0,402 (10,1 GB) | no disponible | GGUF |
| Artemis-31B-v1.2 IQ2_S (bartowski) | 31B | no disponible | 0,487 (10,2 GB) | no disponible | GGUF |
| Artemis-31B-v1.2 EXL3 3,00 bpw (Gen4536) | 31B | no disponible | 0,0725 (12,06 GB) | Apache-2.0 | EXL3 |
| Artemis-31B-v1.2 i1-IQ3_XXS (mradermacher) | 31B | no disponible | 0,176 (12,1 GB) | no disponible | GGUF |
| Artemis-31B-v1.2 EXL3 5,00 bpw (Gen4536) | 31B | no disponible | ~0,005 (19,38 GB) | Apache-2.0 | EXL3 |
| Artemis-31B-v1.2 Q4_K_M (bartowski) | 31B | no disponible | ~0,0216 (19,5 GB) | no disponible | GGUF |
| Artemis-31B-v1.2 Q5_K_M (bartowski) | 31B | no disponible | 0,00756 (23,5 GB) | no disponible | GGUF |

Todas las alternativas comparadas son cuantizaciones del mismo modelo base, por lo que la comparación mide fidelidad y huella de VRAM, no capacidad del modelo. No se dispone de datos para comparar con modelos de roleplay de otros autores o arquitecturas.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado como `not-for-all-audiences` y orientado a roleplay; no es adecuado para aplicaciones generales sin filtrado.
- Riesgo de alucinación: no se documenta ninguna mitigación específica en la información disponible; es esperable en un modelo de 31B orientado a conversación.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del idioma o idiomas de entrenamiento del modelo base.
- Contexto: no se indica la longitud de contexto del modelo base ni de las cuantizaciones; hay que reservar VRAM adicional para el caché KV más allá de los pesos indicados.
- Licencia: la cuantización declara Apache-2.0 siguiendo la licencia del Gemma 4 subyacente, pero el modelo base Artemis no declara licencia propia. Conviene revisar la licencia de Gemma 4 (`license_link` en la model card) antes de un uso comercial.
- Formato: solo hay artefactos EXL3; no se ofrecen GGUF ni safetensors en esta publicación, lo que limita el despliegue a ExLlamaV3.
- La receta de 5,00 bpw no está calibrada sobre datos de roleplay, a diferencia de las de 2,15 y 3,00 bpw.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre estos artefactos.
- Las métricas de fidelidad se basan en divergencia KL y muestreo de tokens; no sustituyen a una evaluación humana de la calidad del roleplay.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gen4536/Artemis-31B-v1.2-exl3
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Cuantización EXL3 2,25 bpw de MikeRoz: no disponible (enlace no incluido en la información proporcionada)
- Cuantizaciones GGUF de bartowski: no disponible (enlace no incluido en la información proporcionada)
- Cuantizaciones GGUF de mradermacher: no disponible (enlace no incluido en la información proporcionada)
