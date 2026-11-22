# GreenWojak/Raon-1-mini-preview-MXFP6-E2M3

## Resumen

Raon-1-mini-preview-MXFP6-E2M3 es una cuantización no oficial del modelo KRAFTON/Raon-1-mini-preview, publicada por el usuario GreenWojak. Se trata de una copia reducida en la que únicamente los pesos de los expertos enrutados (arquitectura MoE) se almacenan en formato MXFP6 E2M3 en lugar de MXFP8, lo que reduce el tamaño del checkpoint de 32,7 GB a 26,3 GB. El resto de tensores (atención, embeddings, capas densas, normalizaciones) se conservan tal cual se publicaron en el modelo original, en sus dtypes de origen (BF16, FP32).

El objetivo declarado es permitir la ejecución de Raon-1 mini en una única GPU AMD RDNA 4 de 32 GB (Radeon AI PRO R9700, `gfx1201`), un escenario que el checkpoint original en MXFP8 no permite por tamaño. Es, por tanto, un artefacto orientado a hardware ROCm/RDNA 4 y a experimentación con formatos de cuantización de bloque (block-wise scaling), no una versión lista para producción.

Es importante subrayar que no se trata de un lanzamiento oficial de KRAFTON AI, que el modelo original fue diseñado y entrenado por KRAFTON, y que el autor no incluye ninguna evaluación de calidad frente al original. Además, ni Transformers ni el fork de vLLM de KRAFTON cargan este formato tal cual se publica: hace falta un loader específico que interprete el campo `raon_packed_experts` de `config.json` y los kernels para RDNA 4, que el autor indica que aún no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en MXFP6 E2M3 (6 bits por peso, escala E8M0 por bloque de 32 pesos); resto de tensores en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (divididos en `dense-*.safetensors` y `expert-*.safetensors`); expertos empaquetados en `uint8` con layout `mxfp6-pack-quantized` de compressed-tensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base KRAFTON/Raon-1-mini-preview, que es un modelo de mezcla de expertos (MoE) según las etiquetas y la descripción del autor. La modificación afecta exclusivamente a los tensores `model.layers.*.moe.experts.*.{gate,up,down}_proj`: cada fila de pesos de experto se almacena como códigos consecutivos de 6 bits, con el bit de signo en la posición 5 y orden least-significant-bits-first (cuatro códigos en tres bytes). Cada bloque de 32 canales de entrada comparte una escala E8M0 codificada como `2 ** (byte - 127)`, almacenada en el tensor `<name>.weight_scale_inv` (pese al nombre, no es una inversa). Los nombres de tensor siguen la convención del original: `.weight` contiene los códigos empaquetados con forma `[rows, K * 3 / 4]` y `.weight_scale_inv` las escalas con forma `[rows, K / 32]`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la innovación arquitectónica del modelo base más allá de su naturaleza MoE. El autor indica que los pesos de los expertos se re-codificaron a partir del release MXFP8, por lo que sus valores no son idénticos a los del original. El tokenizador, la plantilla de chat, la configuración de generación y el código de modelado son los del modelo base.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la capacidad principal es la generación autoregresiva de texto.
- Razonamiento y conocimiento general: heredados del modelo base, sin evaluación publicada en esta cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Experimentación con cuantización MXFP6 en hardware RDNA 4: el caso de uso principal y explícito del checkpoint es validar el formato `mxfp6-pack-quantized` y los kernels de decodificación de expertos en una Radeon AI PRO R9700 de 32 GB, donde el original en MXFP8 (32,7 GB) no cabe con holgura.
- Investigación en cuantización de bloque para MoE: sirve para estudiar el impacto de pasar de 8 a 6 bits por peso con escala E8M0 por bloque de 32 en los expertos enrutados, comparando la salida frente al checkpoint MXFP8 original.
- Desarrollo de loaders personalizados: dado que ni Transformers ni el fork de vLLM de KRAFTON cargan este formato, el checkpoint es un banco de pruebas para implementar un loader que lea `raon_packed_experts` y descomprima los expertos.
- Evaluación de despliegue en ROCm: permite medir consumo de VRAM, latencia y throughput de un MoE cuantizado en `gfx1201`, información útil para dimensionar infraestructura AMD.
- Pruebas de generación de texto en local: una vez implementado el loader, puede usarse para generar texto con el modelo base en una única GPU de consumo profesional AMD, sin clúster multi-GPU.
- Reproducción de pipelines de decodificación especulativa o de serving: si el modelo base los soporta, este checkpoint permitiría probarlos en hardware RDNA 4, aunque no hay datos que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no incluye ninguna evaluación de calidad frente al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 26,3 GB, por lo que requiere al menos ~27 GB de VRAM solo para los pesos; el autor lo diseñó para una GPU de 32 GB.
- GPU objetivo: AMD Radeon AI PRO R9700 (32 GB, RDNA 4, `gfx1201`).
- GPU recomendadas: cualquier GPU AMD RDNA 4 con 32 GB o más; en NVIDIA, se necesitaría al menos una A100 40 GB, H100 80 GB o RTX 4090 de 24 GB (esta última no cabría con los pesos completos sin cuantización adicional).
- ¿Cabe en GPU de consumo? No en las de 24 GB o menos; sí en la R9700 de 32 GB para la que fue creado.
- Opciones de despliegue: ni Transformers ni el fork de vLLM de KRAFTON cargan este formato tal cual; se requiere un loader personalizado y kernels para RDNA 4 que el autor no ha publicado todavía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato expertos | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GreenWojak/Raon-1-mini-preview-MXFP6-E2M3 | no disponible | no disponible | MXFP6 E2M3 | 26,3 GB | Apache 2.0 | Pesos publicados; loader no publicado |
| KRAFTON/Raon-1-mini-preview | no disponible | no disponible | MXFP8 E4M3 | 32,7 GB | Apache 2.0 | Pesos publicados; soporte en vLLM fork de KRAFTON |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- No es un lanzamiento oficial de KRAFTON: el autor lo declara explícitamente y remite a la model card original para uso previsto y limitaciones.
- Sin evaluación de calidad: no hay comparación frente al modelo original, por lo que se desconoce la degradación introducida por el paso de MXFP8 a MXFP6 en los expertos.
- Pesos de expertos distintos al original: al re-codificarse desde MXFP8, los valores no son idénticos a los del release original.
- No cargable de forma estándar: ni Transformers ni el fork de vLLM de KRAFTON soportan el formato; el loader y los kernels para RDNA 4 no están publicados.
- Dependencia de hardware muy específica: diseñado para `gfx1201` (RDNA 4); su utilidad en otras arquitecturas no está documentada.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en esta cuantización; se heredan los del modelo base, que no se detallan.
- Licencia Apache 2.0 permite uso comercial, pero KRAFTON y sus licenciantes conservan la propiedad de su propiedad intelectual según la model card original.
- Fecha de creación del repositorio (2026-11-22) y ausencia de descargas o likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenWojak/Raon-1-mini-preview-MXFP6-E2M3
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- KRAFTON AI: https://krafton.ai/en/
