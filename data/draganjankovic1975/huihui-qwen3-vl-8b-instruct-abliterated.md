# draganjankovic1975/Huihui-Qwen3-VL-8B-Instruct-abliterated

## Resumen

Huihui-Qwen3-VL-8B-Instruct-abliterated es una variante "abliterated" (sin censura) del modelo multimodal Qwen3-VL-8B-Instruct de Alibaba Qwen. La abliteración se aplica mediante la técnica de eliminación de direcciones de rechazo en el espacio de activaciones (remove-refusals-with-transformers), un procedimiento que identifica y proyecta fuera las direcciones del residual stream asociadas a la negativa a responder. El modelo resultante mantiene las capacidades originales de visión-lenguaje pero elimina los rechazos en la parte textual; según la model card, la torre visual no fue procesada.

El modelo base Qwen3-VL-8B-Instruct es un transformer multimodal de tipo image-text-to-text con aproximadamente 8.767 millones de parámetros totales (8,77 B), pesos en safetensors (17,5 GB en bf16) y licencia Apache 2.0. Esta réplica concreta la publica el usuario draganjankovic1975 como espejo del repositorio original huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated, sin descargas ni interacciones registradas en el momento de la consulta.

Es relevante para desarrolladores e investigadores que necesitan un modelo VL de 8B sin filtros de rechazo para tareas de análisis de imágenes sin restricciones, evaluación de robustez de salvaguardas o investigación sobre alineación. No obstante, la ausencia de filtrado de seguridad y la falta de datos de benchmarks publicados en la información disponible limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): torre visual + LLM decoder; clase `Qwen3VLForConditionalGeneration` |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors bf16; existe variante Ollama publicada por el autor original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variante Ollama disponible en el repo original |
| Tamano del repo | 17,5 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tipo de ajuste | abliteration (ablación de direcciones de rechazo), solo en la parte textual |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL del modelo base: un transformer multimodal con una torre visual que proyecta características de imagen al espacio del LLM y un decoder de lenguaje autorregresivo. La clase de implementación es `Qwen3VLForConditionalGeneration`, con soporte para `flash_attention_2` en escenarios multi-imagen y vídeo, según el ejemplo de la model card. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni si el modelo base empleó RLHF o DPO.

La modificación respecto al base es la abliteración: se aplica la técnica de remove-refusals-with-transformers, que localiza las direcciones de activación responsables de las respuestas de rechazo y las elimina del flujo residual. Según la model card, solo se procesó la parte textual, no la torre visual, de modo que el modelo deja de producir negativas del tipo "no puedo describir ni analizar esta imagen". No se documentan datos de calibración, número de capas intervenidas ni el impacto cuantificado en benchmarks.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Comprensión de imágenes y respuesta image-text-to-text (descripción, análisis visual).
- Capacidades heredadas del base Qwen3-VL-8B-Instruct: razonamiento, código y matemáticas (sin datos de benchmarks en esta ficha).
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: visión confirmada; thinking y audio no disponibles.
- Supresión de rechazos en la parte textual (abliterated/uncensored).

## Casos de uso

- Análisis de imágenes sin restricciones de rechazo: el modelo puede describir y analizar imágenes que el base declinaría procesar, útil en investigación sobre filtrado de contenido visual.
- Investigación en alineación y seguridad: comparar respuestas del base frente a la variante abliterated permite medir qué direcciones de activación controlan la negativa y evaluar la robustez de las salvaguardas.
- Evaluación de robustez de clasificadores de contenido: generar descripciones de imágenes potencialmente sensibles para probar sistemas de moderación.
- Procesamiento de documentación visual en entornos controlados: extracción de descripciones de diagramas, capturas o figuras en pipelines internos de investigación.
- Prototipado de asistentes visuales en sandbox: con 8,77 B de parámetros y pesos bf16, se puede desplegar en una GPU de 24 GB para pruebas de concepto de chat con imagen.
- Red teaming de sistemas multimodales: usar el modelo como generador adversarial de descripciones para auditar filtros de otros sistemas VL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 17,5 GB de pesos más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para inferencia cómoda con `device_map="auto"`.
- VRAM estimada con cuantización de 8 bits (BitsAndBytes): en torno a 9-10 GB de pesos; la model card incluye `BitsAndBytesConfig` en el ejemplo de importación, aunque no se detallan los parámetros de cuantización.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPUs de 16 GB solo con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16; en RTX 4080/4070 Ti (16 GB) requiere cuantización.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor`; Ollama v0.12.7 o superior con la etiqueta `huihui_ai/qwen3-vl-abliterated:8b-instruct`; flash_attention_2 recomendado para multi-imagen y vídeo. vLLM, TGI y llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3-VL-8B-Instruct-abliterated (este) | 8,77 B | no disponible | Apache 2.0 | Sin censura textual; sin benchmarks publicados |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B | no disponible | Apache 2.0 | Modelo base con filtrado de seguridad estándar |
| huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated | 8,77 B | no disponible | Apache 2.0 | Repositorio original; este modelo es un espejo |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: puede generar contenido sensible, controvertido o inapropiado; la model card recomienda revisión manual y monitorización en tiempo real.
- No apto para todas las audiencias: salidas potencialmente inapropiadas en entornos públicos, para menores o en aplicaciones con requisitos altos de seguridad.
- Responsabilidad legal y ética del usuario: el contenido generado puede conllevar riesgos legales; el autor declina responsabilidad.
- Uso recomendado solo en investigación y entornos controlados, evitando producción o aplicaciones comerciales de cara al público.
- La abliteración solo afecta a la parte textual; la torre visual no fue procesada, por lo que el comportamiento ante imágenes sensibles puede diferir del texto.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias de seguridad del autor desaconsejan producción sin salvaguardas adicionales.
- Repositorio espejo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draganjankovic1975/Huihui-Qwen3-VL-8B-Instruct-abliterated
- Repositorio original: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama: https://ollama.com/huihui_ai/qwen3-vl-abliterated:8b-instruct
- Release de Ollama v0.12.7: https://github.com/ollama/ollama/releases/tag/v0.12.7
