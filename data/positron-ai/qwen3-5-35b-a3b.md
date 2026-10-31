# positron-ai/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje densamente capaz en razonamiento y generación de texto desarrollado por el equipo Qwen, del cual este repositorio de Positron AI es un espejo (mirror) exacto. El repositorio original es `Qwen/Qwen3.5-35B-A3B`, y esta copia se publica como fuente de descarga anclada (pinned) para pipelines de integración continua internos de Positron AI, aislando el CI de cambios, gating o límites de tasa del repositorio original.

El sufijo "A3B" indica que se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 35 mil millones de parámetros totales y alrededor de 3 mil millones de parámetros activos por token, lo que permite obtener calidad de modelos grandes con coste de inferencia de modelos pequeños. Los pesos se distribuyen en formato safetensors en precisión bf16 (71,9 GB en total, repartidos en 14 ficheros), bajo licencia Apache 2.0.

Es relevante porque combina la eficiencia de un MoE con la versatilidad de la familia Qwen, aunque conviene tener en cuenta que este repositorio en concreto no es la fuente canónica: el autor indica explícitamente que no debe usarse como canal de adquisición para procesamiento de pesos ni como `bf16_source`, y que los resultados de evaluación no deben atribuirse a este mirror.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, MoE) |
| Parametros totales | 35.951.822.704 (dato real de safetensors) |
| Parametros activos | ~3 mil millones (inferido del sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 ficheros, 71,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es `qwen3_5_moe`, es decir, una variante de mezcla de expertos de la familia Qwen. En un MoE, cada token se enruta a un subconjunto reducido de expertos, de modo que aunque el modelo tenga 35,95 mil millones de parámetros totales, solo se activan unos 3 mil millones por token. Esto reduce drásticamente el coste computacional de inferencia manteniendo la capacidad expresiva del modelo completo. La presencia de ficheros `preprocessor_config.json` y `video_preprocessor_config.json` sugiere que el modelo original incluye componentes multimodales (procesamiento de imágenes y vídeo), aunque la model card del mirror no detalla estas capacidades.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. El mirror no incluye la model card original completa en la información suministrada (solo se referencia como `README.upstream.md`), por lo que estos detalles deben consultarse en el repositorio de Qwen.

## Capacidades

- Generacion de texto y razonamiento: como modelo base de la familia Qwen 3.5 MoE, orientado a tareas generales de lenguaje (detalles específicos no disponibles en la model card del mirror).
- Posible capacidad multimodal: la existencia de `preprocessor_config.json` y `video_preprocessor_config.json` en el repositorio indica soporte para preprocesamiento de imágenes y vídeo, aunque no está confirmado en la documentación disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modelo base: está etiquetado como `base_model:finetune:Qwen/Qwen3.5-35B-A3B`, lo que indica que sirve como punto de partida para fine-tuning.

## Casos de uso

- Descarga reproducible en CI/CD: el caso de uso principal declarado por Positron AI; los equipos pueden anclar la revisión exacta (`59d61f3c...`) en sus pipelines para garantizar builds deterministas sin depender del repositorio original.
- Base para fine-tuning: al ser un modelo base etiquetado explícitamente para ello, es adecuado para entrenar variantes especializadas (dominio médico, legal, código) con LoRA o full fine-tuning, aprovechando que solo ~3B de parámetros activos reducen el coste de entrenamiento e inferencia.
- Servicios de inferencia de bajo coste: la arquitectura MoE con activación de ~3B de parámetros permite desplegar un modelo con calidad de 35B en hardware moderado, útil para APIs internas y chatbots.
- Procesamiento multimodal (si se confirma): con los preprocesadores de imagen y vídeo incluidos, podría integrarse en aplicaciones que analicen documentos visuales o vídeo.
- Investigación en arquitecturas MoE: el acceso abierto a los pesos completos permite estudiar el enrutamiento de expertos, la distribución de carga y el comportamiento de modelos dispersos.
- Evaluaciones comparativas: puede usarse como candidato en benchmarks propios de la comunidad para comparar MoE de tamaño medio frente a modelos densos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor del mirror indica explicitamente que no se reportan resultados de evaluacion en este repositorio y que ninguno debe atribuirse a el; los benchmarks deben consultarse en el repositorio original `Qwen/Qwen3.5-35B-A3B`.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 71,9 GB en bf16, por lo que en precisión completa se necesitan al menos ~72 GB de VRAM solo para los pesos, más la memoria para KV cache. Con cuantización a 4 bits (si hay soporte), el requisito bajaría a ~20-25 GB, aunque no hay cuantizaciones publicadas en este repositorio.
- GPU recomendadas: para bf16, al menos una A100 u H100 de 80 GB, o dos GPUs de 48 GB (A6000, L40S) con paralelismo de tensores. No cabe en una única GPU de consumo en precisión completa.
- Consumer GPUs: no cabe en una única RTX 4090 (24 GB) en bf16. Sería viable en configuraciones multi-GPU de consumo o con cuantización a 4 bits en una RTX 4090, si existieran pesos cuantizados (no disponibles aquí).
- Opciones de despliegue: al ser un modelo `qwen3_5_moe` en safetensors, debería ser compatible con vLLM y SGLang si la versión soporta la arquitectura Qwen 3.5 MoE. llama.cpp y Ollama requerirían conversión a GGUF, que no está disponible en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.5-35B-A3B (este modelo) | 35,95 B | ~3 B | no disponible | Apache 2.0 |
| Qwen3-30B-A3B | 30 B | ~3 B | no disponible | Apache 2.0 |
| Mixtral 8x7B | 46,7 B | ~12,9 B | 32.768 tokens | Apache 2.0 |
| DeepSeek-V2-Lite | 15,7 B | ~2,4 B | 32.768 tokens | Licencia propia (restricciones de uso) |

La comparación se basa en datos públicos conocidos de los modelos alternativos; para el modelo de esta ficha, varios datos no están disponibles. Frente a Mixtral 8x7B, este modelo ofrece menos parámetros activos por token (~3B frente a ~12,9B), lo que debería traducirse en menor coste de inferencia. Frente a DeepSeek-V2-Lite, es aproximadamente el doble de grande en parámetros totales con activación similar.

## Limitaciones y advertencias

- Este repositorio es un mirror de solo descarga para CI: el autor indica explícitamente que nunca debe usarse como canal de adquisición para procesamiento de pesos ni como `bf16_source`; la fuente canónica es `Qwen/Qwen3.5-35B-A3B`.
- No se atribuyen resultados de evaluación a este repositorio; cualquier benchmark debe tomarse del original.
- Al ser un modelo base (no alineado), puede generar contenido ofensivo, inexacto o con sesgos presentes en sus datos de entrenamiento; no está indicado para asistentes de usuario final sin fine-tuning y filtros adicionales.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos de calibración publicados en este repositorio.
- Longitud de contexto, idiomas soportados y capacidades exactas no están documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero debe verificarse la licencia en el repositorio original de Qwen, que es la fuente canónica.
- Los requisitos de memoria (71,9 GB en bf16) limitan el despliegue en hardware de consumo sin cuantización.
- Solo 21 descargas y 1 like en el momento de la ficha: es un repositorio de nicho con poca validación comunitaria.

## Enlaces

- Repositorio mirror: https://huggingface.co/positron-ai/Qwen3.5-35B-A3B
- Repositorio original (fuente canónica): https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Revisión anclada del mirror: `59d61f3ce65a6d9863b86d2e96597125219dc754`
- Paper, blog y demo: no disponibles en la información proporcionada.
