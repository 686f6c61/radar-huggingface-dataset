# dealignai/GLM-5.3-Flash-CYBERSECURITY-W4A16

## Resumen

GLM-5.3-Flash-CYBERSECURITY-W4A16 es una versión afinada para eliminar rechazos (*uncensored*) y cuantizada a W4A16 del modelo base zai-org/GLM-5.3-Flash, publicada por el usuario dealignai. Se distribuye como un reemplazo directo del checkpoint cuantizado original, manteniendo intactos el cabezal de predicción multi-token (MTP, capa 45) y la torre de visión. El modelo es un transformer de tipo mezcla de expertos (MoE) con capacidades de texto, visión y lenguaje, y con 321.323 millones de parámetros totales según los pesos en safetensors.

El interés de esta ficha radica en que combina tres elementos poco habituales: una cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) orientada a despliegue en producción, un proceso de ajuste que elimina las negativas en seis categorías de daño real según el autor, y la preservación de las capacidades de razonamiento y de visión del modelo original. Está pensado para servir con vLLM o SGLang mediante parsers de razonamiento y de tool calling específicos.

La relevancia actual es doble: por un lado, permite ejecutar un modelo de más de 320.000 millones de parámetros en configuraciones multi-GPU con un consumo de memoria muy reducido respecto a los pesos en BF16; por otro, la model card documenta con detalle varias trampas de despliegue (parámetros de vídeo e imagen que se aceptan y se ignoran, modos de razonamiento que agotan el presupuesto de tokens) que conviene conocer antes de ponerlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de visión y cabezal MTP; familia glm5_next |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) de la familia GLM-5.3, derivado del checkpoint zai-org/GLM-5.3-Flash. Incorpora un cabezal de predicción multi-token (MTP) en la capa 45, que se utiliza como decodificación especulativa nativa y que el autor indica que multiplica por 1,5-2 el throughput de decodificación. También conserva una torre de visión completa, por lo que admite entradas de imagen y vídeo además de texto.

La intervención de dealignai consiste en un ajuste de cumplimiento (*compliance tuning*) que, según la model card, elimina las negativas en las seis categorías de daño real del benchmark HB, preservando la profundidad de razonamiento y sin degradar el cabezal MTP ni la torre de visión. La cuantización W4A16 se aplica sobre el checkpoint original mediante compressed-tensors. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento extendido (`<think>`).
- Razonamiento con niveles de esfuerzo configurables mediante `reasoning_effort`, que solo acepta `"low"` y `"high"`; cualquier otro valor resuelve a `max`.
- Tool calling y function calling compatibles con la API de OpenAI, mediante el parser `glm47`.
- Capacidades de visión: procesamiento de imágenes con control del número de tokens visuales (`max_image_tokens`, `min_image_tokens`).
- Capacidades de vídeo: muestreo de fotogramas configurable mediante `fps` en `media_io_kwargs`.
- Decodificación especulativa nativa mediante MTP, con ganancia declarada de 1,5-2x en decodificación.
- Compatibilidad con caché de prefijos para cargas de trabajo de agentes.
- Modelo sin censura en las categorías de daño evaluadas por el autor.

## Casos de uso

- Asistente conversacional multi-turno en producción: el modelo mantiene historial largo y razonamiento estructurado, con la salvedad de que en modo `max` conviene reservar al menos 6000 tokens de presupuesto para evitar turnos vacíos que contaminen el historial.
- Agentes con tool calling: la combinación de `--tool-call-parser glm47`, `--enable-auto-tool-choice` y caché de prefijos permite construir agentes que encadenan llamadas a funciones con contexto repetido, reduciendo coste de prefill.
- Análisis de documentos con imágenes y vídeo: la torre de visión intacta permite extraer información de capturas, diagramas o clips, controlando el coste de tokens visuales con `mm_processor_kwargs` y fijando `fps: 2` de forma explícita para evitar el fallo de motor documentado.
- Generación de código y razonamiento técnico: el modo `high` está indicado por el autor para tareas difíciles, y el soporte de tool calling lo hace integrable en pipelines que consultan repositorios o ejecutan pruebas.
- Investigación sobre alineación y seguridad: al ser una variante sin rechazos, sirve para estudiar comportamiento de modelos MoE grandes ante peticiones sensibles, siempre con las salvaguardas externas adecuadas.
- Despliegue en clústeres de dos GPU con vLLM: con cuantización W4A16 y tensor-parallel de 2, el modelo cabe en configuraciones de dos aceleradores de gran memoria, lo que abarata la inferencia frente al checkpoint en BF16.
- Evaluación comparativa de cuantizaciones: útil para medir la pérdida de calidad de W4A16 frente a BF16 en tareas de razonamiento y visión sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 304,8 GB, lo que corresponde a los pesos W4A16 de 321.000 millones de parámetros; se necesita espacio en disco equivalente más margen para caché.
- El autor despliega con `--tensor-parallel-size 2`, es decir, dos GPU de gran memoria; no se especifica el modelo exacto de GPU empleado.
- VRAM estimada: no disponible de forma explícita; por el tamaño del repo, el reparto entre dos aceleradores exige GPUs de 80 GB o superior en la práctica.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB por el tamaño total de los pesos.
- Opciones de despliegue documentadas: vLLM (imagen `vllm/vllm-openai:glm53-flash-x86_64-cu130`) y SGLang con parser de razonamiento; no se mencionan llama.cpp ni Ollama.
- Throughput: el autor declara una mejora de 1,5-2x en decodificación con MTP activado; no se publican cifras absolutas de tokens por segundo ni latencias.
- Flags recomendados: `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--enable-prefix-caching`, `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| dealignai/GLM-5.3-Flash-CYBERSECURITY-W4A16 | 321.323 M | no disponible | W4A16 | MIT | Variante sin censura del GLM-5.3-Flash cuantizado |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Modelo base original; conserva los rechazos |
| GLM-5.3-Flash-W4A16 (checkpoint cuantizado de referencia) | no disponible | no disponible | W4A16 | no disponible | Checkpoint cuantizado sin el ajuste de cumplimiento |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: el autor declara haber eliminado las negativas en seis categorías de daño real; su uso en producción requiere filtros y salvaguardas externas.
- Riesgo de alucinación: no cuantificado ni documentado por el autor.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con precisión.
- En modo `max`, un `max_tokens` pequeño devuelve una respuesta vacía con `finish_reason="length"`; en multi-turno el turno vacío contamina el historial y la conversación no se recupera. Con `max_tokens` de 2000 el fallo aparece a partir del cuarto turno; con 6000 es limpio.
- No se debe pasar `enable_thinking`: la plantilla no define esa variable y su uso desactiva el parser mientras el modelo sigue razonando, volcando el razonamiento en `content`.
- El razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- `clear_thinking` debe ir anidado dentro de `chat_template_kwargs`; como clave de primer nivel se ignora.
- En vídeo, `media_io_kwargs.video.fps` debe ser inferior a la tasa de fotogramas del clip; un valor igual o superior provoca `EngineDeadError` y deja el servidor caído hasta reiniciarlo (incidencias upstream vLLM #55644 y #55647).
- `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM; conviene fijar `fps`, que todas las versiones respetan.
- Para imagen, `max_pixels`, `min_pixels`, `size` y `detail` se aceptan pero no tienen efecto; hay que usar `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`.
- El muestreo por defecto de vídeo varía entre versiones (aproximadamente 2 fps frente a 6 fps), lo que altera el coste en tokens del mismo clip.
- Licencia MIT: permite uso comercial, pero no exime de responsabilidad legal por el contenido generado ni de las obligaciones de moderación aplicables.
- El autor publica comandos de despliegue que apuntan a `dealignai/GLM-5.3-Flash-UNCENSORED-W4A16`, un identificador distinto del ID de este repositorio; conviene verificar el nombre servido antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/dealignai/GLM-5.3-Flash-CYBERSECURITY-W4A16
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Incidencia vLLM #55644: https://github.com/vllm-project/vllm/issues/55644
- Incidencia vLLM #55647: https://github.com/vllm-project/vllm/issues/55647
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SGLang: https://github.com/sgl-project/sglang
