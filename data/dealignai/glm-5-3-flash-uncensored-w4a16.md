# dealignai/GLM-5.3-Flash-UNCENSORED-W4A16

## Resumen

GLM-5.3-Flash-UNCENSORED-W4A16 es una versión modificada del modelo `zai-org/GLM-5.3-Flash` publicada por el usuario dealignai. Se trata de una cuantización W4A16 (pesos en 4 bits, activaciones en 16 bits) del modelo base, sobre la que se ha aplicado un ajuste de cumplimiento orientado a eliminar los rechazos en las seis categorías de daño real del benchmark HB (HarmBench), preservando la profundidad de razonamiento del modelo original. El resultado se distribuye como un reemplazo directo del checkpoint W4A16 original.

El modelo conserva la arquitectura Mixture-of-Experts del modelo base, con 321.323.031.390 parámetros totales según el recuento real de safetensors, un cabezal de predicción multi-token (MTP) en la capa 45 y la torre de visión completa. Esto lo sitúa en la categoría de modelos masivos que requieren despliegue multi-GPU con paralelismo tensorial, no en el rango de modelos ejecutables en GPU de consumo.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta las particularidades de servicio del modelo (parser de razonamiento, presupuesto de tokens en modo `max`, parámetros multimodales que se aceptan y se ignoran silenciosamente), que son fuente habitual de fallos en producción; por otro, advierte de que se trata de una variante sin censura, con implicaciones éticas y legales que el despliegue debe evaluar. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con cabezal MTP en capa 45 y torre de visión; tag `glm5_next` |
| Parametros totales | 321.323.031.390 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización W4A16 del checkpoint `zai-org/GLM-5.3-Flash`, empaquetada con la librería compressed-tensors para su uso en motores de inferencia compatibles (vLLM, SGLang). La arquitectura subyacente es un transformer con mezcla de expertos, tal como indican los tags `moe` y `glm5_next`, e incorpora un cabezal de predicción multi-token (MTP) en la capa 45 que el autor declara intacto tras la cuantización. También se conserva íntegra la torre de visión del modelo base, lo que habilita entrada multimodal de imagen y vídeo.

El autor no documenta en la model card el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni el procedimiento exacto de ajuste de cumplimiento aplicado. Lo que sí se especifica es el objetivo de dicho ajuste: eliminar los rechazos en las seis categorías de daño real del benchmark HB manteniendo la profundidad de razonamiento. No se detalla la metodología (fine-tuning supervisado, DPO, abliteration u otra), ni el volumen de datos empleado. Tampoco se indica la innovación técnica del modelo base más allá de la presencia del cabezal MTP, que el autor aprovecha para decodificación especulativa con un throughput de decodificación estimado de 1,5 a 2 veces superior.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito mediante bloques `<think>`, con niveles de esfuerzo configurables (`low`, `high` y `max`).
- Razonamiento multi-paso y tareas de agente.
- Tool calling / function calling compatible con OpenAI, en formato GLM-4.7, activable con `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Capacidades de visión: procesamiento de imágenes y vídeo mediante la torre de visión conservada.
- Decodificación especulativa mediante el cabezal MTP (capa 45).
- Modo sin censura: rechazo eliminado en las seis categorías de daño real del benchmark HB.
- Capacidades multilingües: no disponible (los idiomas no se documentan).

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con razonamiento interno; requiere el parser `glm45` para que los bloques `<think>` no contaminen el historial y provocen bucles de decodificación.
- Generación de código en producción: el soporte de tool calling en formato GLM-4.7 permite integrarlo en pipelines de CI/CD que invoquen herramientas externas (linters, ejecutores de tests, APIs de despliegue).
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento explícito y caché de prefijos (`--enable-prefix-caching`) reduce el coste de KV en cargas de trabajo con prefijos repetidos.
- Análisis de documentos e imágenes: la torre de visión permite extraer información de capturas, diagramas o documentos escaneados, con control del coste en tokens mediante `mm_processor_kwargs.max_image_tokens`.
- Procesamiento de vídeo: con `media_io_kwargs.video.fps` fijado explícitamente en 2, se pueden analizar clips para tareas de descripción, moderación o extracción de eventos, evitando el fallo de motor documentado.
- Investigación sobre alineación y seguridad: al ser una variante sin censura, sirve para estudiar el comportamiento de modelos con rechazos eliminados y comparar con el modelo base en evaluaciones de seguridad.
- Asistencia técnica especializada: tareas que requieren razonamiento profundo (`reasoning_effort: "high"`) con presupuesto de tokens suficiente para evitar respuestas vacías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente menciona la eliminación de rechazos en las seis categorías de daño real del benchmark HB y una mejora de throughput de decodificación de aproximadamente 1,5 a 2 veces con decodificación especulativa MTP, sin cifras absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 304,8 GB en safetensors; con cuantización W4A16 se requiere un conjunto de GPUs cuyo VRAM agregado cubra ese tamaño más la caché KV. No disponible un cálculo exacto sin conocer la longitud de contexto.
- GPU recomendadas: el comando de producción del autor usa `--tensor-parallel-size 2`, lo que implica al menos 2 GPUs de gran capacidad (clase A100/H100 de 80 GB o superior). No se especifica el modelo exacto de GPU empleado.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo razonables, dado el tamaño del checkpoint.
- Opciones de despliegue: vLLM (recomendado por el autor, con imagen Docker `vllm/vllm-openai:glm53-flash-x86_64-cu130`) y SGLang (mencionado para el parser de razonamiento). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en cifras absolutas; la decodificación especulativa MTP aporta un factor de 1,5 a 2 veces en decodificación según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dealignai/GLM-5.3-Flash-UNCENSORED-W4A16 | 321,3 B (MoE) | no disponible | MIT | Hugging Face | Variante sin censura, W4A16, MTP y visión |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | Hugging Face | Modelo base; conserva rechazos de seguridad |
| GLM-5.3-Flash-W4A16 (original) | no disponible | no disponible | no disponible | Hugging Face | Cuantización W4A16 sin modificar; referencia del ajuste de cumplimiento |

No se dispone de datos de benchmarks ni de parámetros activos de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo sin censura: se han eliminado los rechazos en las seis categorías de daño real del benchmark HB. No es apto para despliegues orientados al público sin filtros externos de seguridad.
- Riesgo de alucinación: no evaluado en la información disponible; la eliminación de rechazos puede aumentar la probabilidad de respuestas plausibles pero incorrectas en dominios sensibles.
- Presupuesto de tokens en modo `max`: con `max_tokens` pequeño (por ejemplo, 2000) la respuesta puede salir vacía con `finish_reason="length"`; en multi-turno esto contamina el historial y la conversación no se recupera. El autor recomienda `max_tokens >= 6000` para `max`, y `low` o `high` son seguros con 2000.
- `reasoning_effort` solo acepta `low` y `high`; cualquier otro valor (`medium`, `xhigh`, `off`) u omisión resuelve silenciosamente a `max`.
- No se debe pasar `enable_thinking`: la plantilla no lo define y su uso desactiva el parser mientras el modelo sigue razonando, volcando el razonamiento en `content`.
- El razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- `clear_thinking` debe anidarse dentro de `chat_template_kwargs`; una clave de nivel superior se ignora.
- Parámetros de vídeo: `media_io_kwargs.video.fps` debe ser inferior a la tasa de fotogramas del clip; un valor igual o superior provoca `EngineDeadError` y tumba el servidor (vLLM #55644 / #55647). Se recomienda `fps: 2`.
- `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM; solo `fps` se respeta en todas las builds.
- Controles de píxeles: `max_pixels`, `min_pixels`, `size` y `detail` devuelven HTTP 200 sin efecto; deben usarse `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`. `mm_processor_kwargs.fps` devuelve HTTP 400.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Longitud de contexto no documentada; el dimensionado de la caché KV y del presupuesto de tokens debe validarse empíricamente.
- Licencia MIT declarada, pero la responsabilidad sobre el uso de una variante sin censura recae en el desplegador; conviene revisar las condiciones del modelo base.
- Sin resultados de benchmarks publicados, la calidad del ajuste de cumplimiento y el impacto en capacidades generales no están cuantificados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-W4A16)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Issue vLLM #55644](https://github.com/vllm-project/vllm/issues/55644)
- [Issue vLLM #55647](https://github.com/vllm-project/vllm/issues/55647)
- [Repositorio vLLM](https://github.com/vllm-project/vllm)
- [Librería compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
