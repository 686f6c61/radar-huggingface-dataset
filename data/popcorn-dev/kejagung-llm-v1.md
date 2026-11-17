# popcorn-dev/kejagung-llm-v1

## Resumen

kejagung-llm-v1 es un artefacto de servicio (serving artifact) publicado por popcorn-dev que contiene los pesos en FP8, el tokenizer, la plantilla de chat y la configuración del preprocesador de imagen y vídeo de un modelo multimodal derivado de Qwen/Qwen3.8-Flash-Next-FP8. No se trata de un entrenamiento propio, sino de una redistribución cuantizada del modelo base, empaquetada para su despliegue directo con vLLM o SGLang. El repositorio ocupa 185,6 GB y alberga 131 shards en safetensors con cuantización FP8 de bloques de 128x128.

El modelo resuelve el problema de desplegar un modelo grande multimodal (entrada de imagen y texto, salida de texto) con pesos de precisión reducida listos para producción, evitando al usuario tener que realizar la conversión a FP8. Su pipeline declarado es image-text-to-text y el contexto máximo configurado en el ejemplo de servicio es de 262.144 tokens. La relevancia actual radica en que permite servir una variante cuantizada de un modelo de la familia Qwen con soporte para vLLM y SGLang y una API compatible con `/v1/chat/completions`.

El número de parámetros almacenados en safetensors es de 179.999.981.459 (aproximadamente 180.000 millones), lo que corresponde al recuento de tensores del checkpoint cuantizado, no necesariamente a los parámetros activos del modelo original. La información disponible no detalla la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-Flash-Next-FP8; tag `qwen4_exp`) |
| Parametros totales | 179.999.981.459 (recuento de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de servicio con `--max-model-len 262144`) |
| Tipos de cuantizacion | FP8 con bloques de 128x128 (131 shards `.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (artefactos del modelo); contenido original bajo copyright de Popcorn Dev |
| Formato de pesos | safetensors (FP8), tokenizer, chat template, preprocessor de imagen y vídeo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.8-Flash-Next-FP8 más allá de su etiqueta `qwen4_exp` y de su naturaleza multimodal (image-text-to-text). No se especifican detalles sobre tipo de transformer, mecanismos de atención, uso de MoE, número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El repositorio es un artefacto de servicio: redistribuye los pesos del modelo base en FP8 sin modificaciones, junto con el tokenizer, la plantilla de chat y las configuraciones del preprocesador de imagen y vídeo. La revisión upstream de la que se sirve es `7fb48d708ca6cd8eeed8f4db0433be18af96984f`. La cuantización FP8 emplea bloques de 128x128, un esquema habitual para reducir el uso de memoria en inferencia manteniendo la fidelidad numérica. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y la API de chat expuesta.
- Entrada multimodal de imagen y texto con salida de texto (`image-text-to-text`), con preprocesador de imagen y vídeo incluido en el repositorio.
- Servicio mediante API compatible con `/v1/chat/completions` con el nombre de modelo `kejagung-llm-v1`.
- Despliegue soportado en vLLM y SGLang (tags `vllm`, `sglang`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, modo thinking, audio u otras capacidades específicas.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo puede desplegarse con `vllm serve` y atender peticiones a `/v1/chat/completions` con entradas de imagen y texto, usando un contexto de hasta 262.144 tokens para conversaciones largas o documentos extensos.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un mismo prompt.
- Procesamiento de vídeo con preprocesador incluido: el repositorio incluye configuración de preprocesador de vídeo, lo que permite integrarlo en pipelines que extraen fotogramas y los envían al modelo.
- Despliegue en infraestructura propia con vLLM o SGLang: al distribuirse en FP8 con bloques de 128x128, reduce el espacio en memoria frente a pesos de mayor precisión y simplifica el despliegue en clústeres de GPU.
- Backend de asistentes conversacionales: la plantilla de chat incluida y el formato de API compatible con OpenAI facilitan la integración en aplicaciones existentes que ya consumen ese protocolo.
- Evaluación y experimentación con modelos Qwen cuantizados: al ser un artefacto reproducible con revisión upstream fijada, sirve para comparar el comportamiento del modelo base frente a su versión FP8 en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 185,6 GB en FP8, por lo que se necesita un conjunto de GPU cuya memoria agregada supere ese tamaño, además de espacio para caché KV y activaciones. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, un despliegue realista requiere múltiples aceleradores de centro de datos (por ejemplo, varias A100 o H100) con paralelismo tensorial; no se confirma compatibilidad con GPU de consumo.
- GPU de consumo: no es viable en una única GPU de consumo por el tamaño del artefacto (185,6 GB).
- Opciones de despliegue: vLLM (comando de ejemplo incluido en la model card) y SGLang (tag declarado). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (checkpoint) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kejagung-llm-v1 | 179.999.981.459 (FP8) | 262.144 tokens (config. de servicio) | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos ni evaluaciones de seguridad del modelo.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan métricas de fidelidad.
- Idiomas soportados no especificados; no se puede garantizar un rendimiento multilingüe concreto.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en producción.
- El aviso de copyright de Popcorn Dev sobre el contenido original no modifica la licencia de los artefactos del modelo, que se redistribuyen sin cambios bajo la licencia de Qwen.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (17 de noviembre de 2026), por lo que no existe validación comunitaria ni evidencia de uso en producción.
- El recuento de 179.999.981.459 parámetros corresponde a los tensores del checkpoint FP8 y no debe interpretarse como número de parámetros activos ni como tamaño del modelo original.
- No se documentan límites de contexto efectivos más allá del valor configurado en el ejemplo de servicio; el rendimiento real con 262.144 tokens no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/popcorn-dev/kejagung-llm-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Licencia Qwen Community License 1.0: https://huggingface.co/popcorn-dev/kejagung-llm-v1/blob/main/LICENSE
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SGLang: https://github.com/sgl-project/sglang
