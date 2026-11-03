# furiosa-ai/Qwen3.6-35B-A3B-FP8

## Resumen

Qwen3.6-35B-A3B-FP8 es un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) desarrollado originalmente por el equipo Qwen (Alibaba) y redistribuido en este repositorio por FuriosaAI. Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activados por token, emplea la arquitectura Qwen3.5-MoE, que combina un codificador visual con un decodificador que alterna atención lineal Gated DeltaNet y atención completa. El modelo acepta entradas de imagen y texto y genera texto, con soporte nativo de razonamiento y de llamada a herramientas.

Este repositorio concreto no es solo una copia del modelo original: incluye un Furiosa Executable Bundle (FXB) que permite ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. Los pesos se distribuyen en FP8 estático (E4M3 con bloques de 128 × 128) para las proyecciones cuantizadas, con cuantización dinámica de activaciones en tiempo de ejecución y caché KV en 16 bits. El codificador visual, la LM head y los routers MoE se mantienen en mayor precisión.

Su relevancia actual reside en tres factores: la licencia Apache 2.0 sin restricciones comerciales, la relación entre parámetros totales y activos (que reduce el coste de inferencia frente a un modelo denso de tamaño equivalente) y la disponibilidad de un camino de despliegue alternativo sobre hardware no-GPU. La ventana de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (Mixture-of-Experts), `Qwen3_5MoeForConditionalGeneration`; decodificador con Gated DeltaNet (atención lineal) y atención completa, más codificador visual |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estático E4M3 en pesos (bloques 128 × 128) y FP8 dinámico en activaciones (per-token / per-block); caché KV en 16 bits; codificador visual, LM head y routers MoE en mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (+ Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5-MoE: un transformer disperso en el que cada token activa aproximadamente 3.000 millones de parámetros de un total cercano a 36.000 millones. El decodificador híbrida capas de atención lineal Gated DeltaNet con capas de atención completa, un patrón habitual para reducir el coste de atención en contextos largos manteniendo capacidad de recuperación precisa. Un codificador visual independiente procesa las imágenes y las proyecta en el espacio del decodificador, lo que permite conversaciones multimodales con mensajes estilo OpenAI que incluyen partes `image_url`.

La cuantización aplicada en este repositorio es FP8: pesos estáticos E4M3 organizados en bloques de 128 × 128 y activaciones cuantizadas dinámicamente por token o por bloque, sin calibración offline. Las módulos excluidos por la configuración upstream (codificador visual, LM head y routers MoE) conservan mayor precisión, y la caché KV permanece en 16 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. El modelo base es `Qwen/Qwen3.6-35B-A3B-FP8`.

## Capacidades

- Generación de texto y razonamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición mediante `enable_thinking`.
- Comprensión visual: acepta imágenes junto a texto en mensajes multimodales; el campo `image_url.url` admite URL remotas HTTP/HTTPS, data URLs en base64 y rutas locales `file://` (esta última requiere el flag `--allowed-local-media-path`).
- Llamada a herramientas (function calling): soportada mediante el parser `qwen3_coder` (alias `qwen3_xml`), con formato XML de llamadas a herramientas.
- Separación de razonamiento y respuesta final: el parser `qwen3` expone el razonamiento en `message.reasoning` (no streaming) y `delta.reasoning` (streaming).
- API compatible con OpenAI a través de Furiosa-LLM, incluyendo el SDK oficial de OpenAI como cliente.
- Razonamiento multi-paso y uso en agentes: implícito en la combinación de modo thinking y tool calling, aunque no se documentan evaluaciones específicas de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de entrada de audio: no disponible; Furiosa-LLM sirve únicamente texto e imagen para este modelo.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede recibir capturas de pantalla, fotos de productos o documentos escaneados junto a la consulta del usuario y responder en texto, aprovechando el codificador visual y la API compatible con OpenAI para integrarse en backends existentes.
- Automatización de soporte técnico con razonamiento visible: al mantener el modo thinking activado y separar el razonamiento de la respuesta final, resulta adecuado para flujos donde se requiere auditar cómo se llegó a una conclusión antes de mostrarla al usuario.
- Agentes con herramientas en pipelines internos: mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`, el modelo puede decidir cuándo invocar funciones externas (consultas a bases de datos, APIs de ticketing, cálculos) y encadenar varias llamadas en una misma conversación.
- Procesamiento de documentos con componentes visuales: extracción y descripción de información a partir de imágenes o páginas escaneadas, combinando la entrada de imagen con preguntas en texto para tareas de resumen o clasificación.
- Despliegue sobre aceleradores FuriosaAI RNGD: el bundle FXB incluido permite servir el modelo en dos tarjetas RNGD con tamaño de paralelismo tensorial de 16 PEs (8 PEs por tarjeta), una alternativa a las GPU para equipos que ya operan esa infraestructura.
- Generación de código asistida con contexto visual: el modelo puede recibir diagramas de arquitectura o capturas de errores y producir explicaciones o parches, apoyándose en el modo thinking para tareas de depuración.
- Prototipado rápido con cliente OpenAI: al exponer un endpoint `/v1/chat/completions`, cualquier aplicación que ya use el SDK de OpenAI puede apuntar a `http://localhost:8000/v1` sin cambios de código sustanciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 47,1 GB en FP8, por lo que se requiere al menos ese orden de magnitud de memoria para los pesos, más el espacio de caché KV en 16 bits y las activaciones.
- GPU recomendadas: no se especifican en la información disponible. El modelo puede ejecutarse en vLLM, SGLang y Transformers según la model card upstream, pero no se detallan configuraciones de GPU concretas.
- Acelerador soportado explícitamente: FuriosaAI RNGD, con dos tarjetas y paralelismo tensorial de 16 PEs (8 PEs por tarjeta).
- ¿Cabe en GPU de consumo? No disponible; el tamaño en FP8 (47,1 GB) supera la memoria de las GPU de consumo habituales, aunque no se confirma ningún caso concreto.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), vLLM, SGLang y Transformers (según la model card upstream).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Despliegue destacado |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-FP8 (este repo, FuriosaAI) | 35,95B / ~3B | no disponible | Apache 2.0 | Furiosa-LLM sobre RNGD; también vLLM, SGLang, Transformers |
| Qwen/Qwen3.6-35B-A3B-FP8 (upstream) | 35,95B / ~3B | no disponible | Apache 2.0 | vLLM, SGLang, Transformers |
| Otras alternativas MoE de tamaño comparable | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos corpus, pero no hay confirmación oficial.
- Riesgo de alucinación: no se cuantifica. El modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens; conviene desactivarlo cuando no sea necesario.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas soportados no están disponibles, lo que impide garantizar un comportamiento multilingüe o contextos largos sin verificación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican cláusulas adicionales en la información disponible.
- Dependencia de hardware específico para el bundle: el FXB incluido solo es utilizable en FuriosaAI RNGD con Furiosa-LLM; para otros entornos debe recurrirse al modelo upstream.
- Cobertura de modalidades limitada en Furiosa-LLM: actualmente solo se sirven entradas de texto e imagen; no se documenta soporte de audio u otras modalidades.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; su acceso cuando no hay contenido de razonamiento lanza `AttributeError`, lo que exige manejo defensivo en el código cliente.
- No se dispone de datos de benchmarks que permitan estimar la calidad frente a alternativas; cualquier decisión de producción debería basarse en evaluaciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3.6-35B-A3B-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Imagen de ejemplo usada en la model card: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-VL/assets/demo.jpeg
