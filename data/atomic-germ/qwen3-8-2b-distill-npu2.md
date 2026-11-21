# Atomic-Germ/Qwen3.8-2B-Distill-NPU2

## Resumen

Qwen3.8-2B-Distill-NPU2 es una conversión cuantizada del modelo empero-ai/Qwen3.8-2B-Distill, publicada por el usuario Atomic-Germ. No se trata de un modelo entrenado desde cero, sino de un port del modelo base al formato Q4NX y al runtime OpenFlowLM (OFLM), compilado específicamente para inferencia sobre NPU AMD XDNA. El repositorio contiene pesos cuantizados en `model.q4nx` (2,29 GB) junto con un modelo de visión separado (`vision_weight.q4nx`), lo que sitúa al modelo en la categoría image-text-to-text.

El modelo base es un distill de la familia Qwen 3.8 con aproximadamente 1.880 millones de parámetros (1.881.825.088 según los safetensors del repo), orientado a razonamiento y conversación, con licencia Apache 2.0. La relevancia de esta ficha está en que documenta una de las pocas distribuciones públicas de un modelo de ~2B empaquetado para aceleradores NPU de AMD, un nicho habitualmente desatendido por los formatos GGUF y las herramientas de despliegue convencionales.

Conviene subrayar que este repositorio no es un GGUF: el autor lo indica explícitamente. La instalación se realiza mediante la herramienta `oflm-add`, que copia el modelo al directorio de usuario de OpenFlowLM y registra la etiqueta correspondiente, sin modificar la instalación del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tags del repositorio); detalles de capas y atención no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4NX (pesos en Q8_0 / Q4_1 / BF16, segun la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`, `vision_weight.q4nx`); no es GGUF |
| Modalidad | Texto e imagen (pipeline image-text-to-text) |
| Version de runtime | OpenFlowLM 0.1.0 |
| Tamano del repositorio | 10,1 GB |
| Tamano de pesos cuantizados | 2,29 GB (`model.q4nx`) |
| Modelo base | empero-ai/Qwen3.8-2B-Distill (relacion: quantized) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia qwen3_5 y su naturaleza transformer con capacidades multimodales (texto e imagen). El repositorio incluye un componente de visión independiente (`vision_weight.q4nx`), lo que confirma la presencia de un codificador visual acoplado al modelo de lenguaje. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

Tampoco se documentan los datos de entrenamiento del modelo base: no hay información sobre el volumen de tokens, la composición del corpus, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. El nombre del modelo base ("Distill") sugiere un proceso de destilación desde un modelo mayor de la familia Qwen 3.8, pero el autor no aporta detalles sobre el profesor utilizado ni sobre el procedimiento. La contribución técnica concreta de este repositorio es la conversión a Q4NX y la compilación para el runtime OpenFlowLM sobre NPU AMD XDNA, incluyendo un artefacto `xclbin` para el acelerador.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento: el repositorio incluye la etiqueta `reasoning`, lo que indica soporte de modo de razonamiento explícito, aunque no se detalla su funcionamiento.
- Procesamiento de imagen y texto (image-text-to-text), gracias al componente de visión incluido.
- Ejecución sobre NPU AMD XDNA mediante el runtime OpenFlowLM, con aceleración por hardware dedicado.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Idiomas: únicamente inglés declarado; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Inferencia local en equipos con NPU AMD XDNA: el modelo está compilado específicamente para este acelerador mediante OpenFlowLM, por lo que permite ejecutar un modelo multimodal de ~2B en hardware AMD con aceleración dedicada, sin depender de GPU discreta.
- Asistentes conversacionales en inglés de baja latencia: la ventana de pesos de 2,29 GB y el formato Q4NX facilitan respuestas rápidas en entornos de escritorio con NPU, adecuado para chat multi-turno.
- Descripción y análisis de imágenes en local: el componente `vision_weight.q4nx` permite tareas de image-to-text (etiquetado, descripción, respuesta a preguntas sobre imágenes) sin enviar datos a la nube.
- Prototipado de pipelines multimodales con OpenFlowLM: útil para desarrolladores que quieran validar flujos de trabajo sobre el runtime OFLM antes de escalar a modelos mayores.
- Evaluación de cuantización Q4NX: el repositorio sirve como referencia para medir la pérdida de calidad de la conversión Q8_0/Q4_1/BF16 frente al modelo base en tareas de razonamiento y visión.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre NPU, es apto para procesar documentos e imágenes sensibles sin conexión externa.
- Docencia e investigación sobre aceleradores NPU: permite estudiar el rendimiento de un transformer multimodal pequeño sobre XDNA y compararlo con implementaciones en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Acelerador: NPU AMD XDNA (requisito explícito del runtime OpenFlowLM y del artefacto `xclbin`).
- Almacenamiento: el repositorio ocupa 10,1 GB; los pesos cuantizados principales suman 2,29 GB (`model.q4nx`) más el componente de visión.
- VRAM: no disponible; al ejecutarse sobre NPU, la memoria relevante es la asignada al acelerador, cuyo mínimo no se especifica.
- GPU: no aplica para esta conversión; está pensada para NPU AMD, no para CUDA.
- Compatibilidad con GPU de consumo: no disponible para este formato; para ejecución en GPU habría que recurrir al modelo base en otro formato.
- Despliegue: OpenFlowLM (OFLM) 0.1.0 mediante `oflm-add` (`pip install oflm-add` o `uv tool install oflm-add`) y el comando `oflm run`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-NPU2 (este) | ~1,88 B | No disponible | Texto + imagen | Apache 2.0 | Q4NX / OpenFlowLM en NPU AMD XDNA |
| empero-ai/Qwen3.8-2B-Distill (base) | ~1,88 B | No disponible | Texto + imagen | Apache 2.0 | Safetensors / transformers |
| Alternativas de ~2B en GGUF (p. ej. Qwen2.5-VL-3B, Gemma 3 4B) | 3-4 B | No disponible en la información proporcionada | Texto + imagen | Apache 2.0 / Gemma license | GGUF / llama.cpp, Ollama |

La comparación directa con alternativas de la misma categoría no puede completarse con datos verificados en la información disponible; las cifras de contexto y rendimiento de los modelos alternativos no se han confirmado en esta búsqueda.

## Limitaciones y advertencias

- Modelo entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos de ~2B, especialmente en tareas de razonamiento complejo o matemáticas.
- No se documentan sesgos conocidos, pero al no publicarse información sobre los datos de entrenamiento del modelo base, no es posible evaluar su composición ni sus sesgos.
- Dependencia de hardware muy específica: requiere NPU AMD XDNA y el runtime OpenFlowLM 0.1.0; no es portable a GPU NVIDIA ni a CPU sin conversión adicional.
- El repositorio no es un GGUF, por lo que no funciona con llama.cpp, Ollama ni vLLM de forma directa.
- La model card contiene referencias inconsistentes: el nombre del repositorio aparece como `Qwen3.8-Distilled-2B-NPU2-NPU2` y la ruta del modelo base como `Aempero-ai/Qwen3.8-2B-Distill`; conviene verificar los comandos de instalación antes de usarlos en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las dependencias del runtime.
- No hay información publicada sobre latencia, throughput ni calidad tras la cuantización, lo que impide garantizar un rendimiento mínimo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.8-2B-Distill-NPU2
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Herramienta de instalación `oflm-add`: disponible vía `pip install oflm-add` o `uv tool install oflm-add` (no se proporciona URL del repositorio en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada.
