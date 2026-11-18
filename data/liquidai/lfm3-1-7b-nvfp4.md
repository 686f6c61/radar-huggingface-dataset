# LiquidAI/LFM3-1.7B-NVFP4

## Resumen

LFM3-1.7B-NVFP4 es la versión cuantizada en NVFP4 del modelo LFM3-1.7B de Liquid AI, una familia de modelos de lenguaje de tipo "liquid" (Liquid Foundation Models, generación 3). El modelo base cuenta con aproximadamente 1.728 millones de parámetros y está pensado para generación de texto conversacional. Esta variante concreta aplica cuantización de 4 bits con formato NVFP4 (W4A4 con bloques de 16 valores) sobre los pesos y activaciones de las capas feed-forward del transformer, manteniendo en BF16 la atención, las convoluciones, los embeddings, la cabeza de salida y las normalizaciones.

El objetivo de esta publicación es facilitar la inferencia en GPU con menor huella de memoria y mayor throughput que la versión BF16 original, sin alterar la configuración de sliding-window attention ni de RoPE. El repo pesa aproximadamente 1,8 GB, lo que lo hace viable en GPUs de consumo con suficiente VRAM. La licencia es lfm1.0 (etiquetada como "other"), lo que condiciona el uso comercial.

La relevancia actual reside en que NVFP4 es un formato de cuantización de 4 bits optimizado para hardware NVIDIA Blackwell (y compatible con arquitecturas anteriores mediante emulación o kernels específicos), utilizado aquí mediante ModelOpt. Al ser un modelo pequeño (1,7B), encaja en escenarios de despliegue en el borde, asistentes locales y pipelines de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo "liquid" (LFM3) con sliding-window attention; pesos FFN cuantizados en NVFP4, resto en BF16 |
| Parametros totales | 1.728.801.536 (~1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (W4A4, bloques de 16 valores) para pesos y activaciones FFN; BF16 para atención, convoluciones, embeddings, output head y norms |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (repo de 1,8 GB, libreria transformers, custom_code, modelopt) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B pertenece a la familia Liquid Foundation Models de tercera generación de Liquid AI, que combina capas de atención con sliding-window y componentes convolucionales dentro de un backbone de tipo transformer "liquid". La model card de esta variante NVFP4 no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí por no estar disponibles en la información proporcionada.

La innovación técnica destacable de esta publicación es la cuantización NVFP4 realizada con ModelOpt: los pesos y activaciones de las capas feed-forward se representan en 4 bits con bloques de 16 valores (W4A4), mientras que los componentes sensibles a precisión (atención, convoluciones, embeddings, output head y normalizaciones) permanecen en BF16. Los ajustes de sliding-window y RoPE se mantienen idénticos al modelo original, de modo que el comportamiento de contexto no se altera por la cuantización.

## Capacidades

- Generación de texto conversacional en inglés y otros idiomas (lista exacta de idiomas no disponible).
- Razonamiento y respuestas multi-turno dentro de un pipeline de text-generation.
- Soporte de tool calling / function calling en el servidor SGLang mediante `--tool-call-parser auto`.
- Soporte de parsing de razonamiento (`--reasoning-parser auto`), lo que sugiere modo de razonamiento estructurado.
- Integración con Transformers mediante `custom_code` (requiere `trust_remote_code`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo de 1,7B cuantizado a NVFP4 (~1,8 GB de repo), puede ejecutarse en estaciones de trabajo con GPU de consumo para chatbots de soporte interno con baja latencia.
- Despliegue en el borde o en entornos con VRAM limitada: la cuantización W4A4 reduce la huella frente a BF16, permitiendo servir el modelo en GPUs de 8-16 GB con margen para KV cache.
- Pipelines de agentes con tool calling: el parser automático de SGLang permite exponer el modelo como backend de agentes que invocan funciones externas en flujos multi-paso.
- Generación de texto en producción de bajo coste: al ser un modelo pequeño, el coste por token es bajo, adecuado para tareas de clasificación, resumen o extracción sobre grandes volúmenes.
- Razonamiento estructurado con salida parseable: el `--reasoning-parser auto` facilita separar cadenas de pensamiento de la respuesta final en aplicaciones que requieren trazabilidad.
- Prototipado rápido en investigación: el formato NVFP4 con ModelOpt permite comparar el impacto de la cuantización de 4 bits frente al modelo BF16 original con el mismo tokenizador y configuración de atención.
- Servicio de inferencia con SGLang: una vez publicado el PR de soporte, el modelo puede desplegarse como endpoint HTTP compatible con OpenAI para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa ~1,8 GB; con overhead de runtime, activaciones y KV cache, se estima un consumo de 3-6 GB según longitud de contexto (estimación orientativa, no dato oficial).
- GPU recomendadas: NVIDIA Blackwell (por el soporte nativo de NVFP4) y arquitecturas NVIDIA recientes compatibles con kernels NVFP4; se recomienda consultar la documentación de ModelOpt y SGLang.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 4080, RTX 3090 y GPUs con 8 GB o más, siempre que el runtime soporte NVFP4.
- Opciones de despliegue: SGLang (soporte en revisión en el PR sgl-project/sglang#46858), Transformers con `trust_remote_code`; llama.cpp, Ollama y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-NVFP4 (este) | ~1,7B | no disponible | NVFP4 (W4A4) | lfm1.0 | Variante cuantizada para GPU con SGLang |
| LFM3-1.7B (base) | ~1,7B | no disponible | BF16 | lfm1.0 | Referencia de precisión completa |
| Alternativas de ~1,5-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Licencia lfm1.0: restricciones de uso comercial no detalladas en la información disponible; revisar LICENSE antes de producción.
- La cuantización NVFP4 (W4A4) puede degradar ligeramente la calidad frente al modelo BF16, especialmente en tareas de precisión numérica o matemáticas.
- Requiere kernels específicos de NVFP4; el soporte en SGLang está aún en revisión (PR #46858), por lo que el despliegue en producción depende de la disponibilidad del runtime.
- Riesgo de alucinación inherente a modelos de 1,7B: menor fiabilidad factual que modelos de mayor tamaño.
- Idiomas soportados no documentados en esta variante; verificar cobertura multilingüe en el modelo base.
- Longitud de contexto no disponible en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El modelo base es de tipo "liquid" con `custom_code`; requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- PR de soporte SGLang: https://github.com/sgl-project/sglang/pull/46858
- Licencia: LICENSE en el repo de Hugging Face
