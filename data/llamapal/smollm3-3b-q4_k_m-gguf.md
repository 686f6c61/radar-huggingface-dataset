# LlamaPal/SmolLM3-3B-Q4_K_M-GGUF

## Resumen

SmolLM3-3B-Q4_K_M-GGUF es una cuantización GGUF en formato Q4_K_M del modelo SmolLM3-3B desarrollado por Hugging Face. El repositorio, publicado por el usuario LlamaPal, no introduce modificaciones sobre los pesos: se trata de una copia byte a byte del fichero `SmolLM3-3B-Q4_K_M.gguf` generado por Unsloth, con el mismo hash SHA-256, orientada a su distribución dentro de la aplicación móvil LlamaPal para Android. El modelo base cuenta con 3.075.098.624 parámetros y está pensado para inferencia en dispositivo (on-device) sin conexión.

La relevancia de esta ficha no reside en una innovación propia del repositorio, sino en el modelo subyacente: SmolLM3-3B es un transformer denso de 3B parámetros de Hugging Face que incorpora un modo de razonamiento (thinking mode) explícito y está diseñado para conversaciones de contexto largo, algo poco habitual en esta franja de tamaño. La versión Q4_K_M reduce el peso a 1,9 GB, lo que permite cargarlo en teléfonos Android de gama media-alta con memoria unificada suficiente.

El repositorio tiene cero descargas y cero likes en el momento de la consulta, y su función es fundamentalmente de espejo (mirror) para la app. Para uso general en servidor o escritorio conviene acudir directamente al repositorio original de Unsloth o a los pesos oficiales de Hugging Face, que incluyen la model card completa y los términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SmolLM3-3B de Hugging Face; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | 3.075.098.624 (3,08B) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor menciona "massive conversations" sin cifra) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio solo distribuye esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `SmolLM3-3B-Q4_K_M.gguf`, 1,9 GB, SHA-256 `4de907d2d388a5508fb7cb443a06effe14cce3518b0a78d3bdd9e74d9edce989`) |
| Parametros activos | no aplica (modelo denso) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento; se limita a indicar que es una copia sin modificar del GGUF de Unsloth. Por tanto, los datos de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) no están disponibles en la información proporcionada. Lo que sí se afirma en la model card es que el modelo base es "HuggingFace's own open model with built-in thinking mode" y que "reasons through problems step-by-step", es decir, incorpora un modo de razonamiento paso a paso activable.

La única transformación aplicada es la cuantización a Q4_K_M mediante el pipeline de Unsloth, que emplea calibración con imatrix (etiqueta presente en el repositorio). La cuantización Q4_K_M es una mezcla de tipos: la mayoría de tensores en 4 bits con algunos tensores críticos en 6 bits, lo que habitualmente preserva mejor la calidad que un Q4_0 uniforme a costa de un tamaño ligeramente mayor. No se especifica ninguna innovación adicional (decodificación especulativa, atención lineal, MoE) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, según la model card ("handles massive conversations").
- Razonamiento paso a paso mediante modo de pensamiento integrado (thinking mode) del modelo base.
- Inferencia completamente offline: no requiere red ni cuenta de usuario una vez descargado el fichero.
- Compatible con llama.cpp y con cualquier aplicación construida sobre él (formato GGUF estándar).
- Integración con la app LlamaPal para Android, que descarga exactamente este fichero.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning más allá del thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades de visión o audio: no disponibles (no se mencionan).

## Casos de uso

- Chat offline en Android: el fichero de 1,9 GB se descarga una vez en LlamaPal y permite conversaciones sin conexión, sin cuenta y sin que los datos salgan del dispositivo; adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Asistente personal con privacidad por diseño: al ejecutarse íntegramente en el teléfono, resulta apto para notas, borradores y consultas sobre información sensible que no debe enviarse a servicios en la nube.
- Razonamiento guiado en movilidad: el thinking mode del modelo base permite resolver problemas de lógica o matemáticas sencillas paso a paso directamente en el dispositivo.
- Prototipado rápido con llama.cpp: al ser un GGUF estándar, sirve para validar pipelines de inferencia local en escritorio antes de escalar a otras variantes o tamaños.
- Educación y aprendizaje sin coste de API: estudiantes pueden desplegar el modelo en un portátil o móvil para practicar prompting y experimentar con cuantizaciones sin depender de servicios externos.
- Base para aplicaciones Android basadas en llama.cpp: desarrolladores que integren el binario de llama.cpp en su propia app pueden reutilizar este fichero como modelo por defecto, verificando su integridad con el SHA-256 publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas (MMLU, HumanEval, GSM8K ni otras) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,2-2,8 GB considerando el peso del fichero (1,9 GB) más la caché KV y el overhead del runtime; en Android se usa memoria unificada, por lo que se recomienda un dispositivo con al menos 6-8 GB de RAM.
- GPU de escritorio recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar el modelo; una RTX 3060, RTX 4060 o superior ofrece margen holgado y buena velocidad.
- GPU de centro de datos (A100, H100): sobredimensionadas para este tamaño; útiles solo para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp (referencia principal), aplicaciones basadas en llama.cpp como LlamaPal, y cualquier frontend compatible con GGUF; vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B-Q4_K_M-GGUF (este repo) | 3,08B | no disponible | GGUF, Apache 2.0 | Espejo del GGUF de Unsloth para LlamaPal |
| SmolLM3-3B (original, Hugging Face) | 3,08B | no disponible en esta ficha | Safetensors, Apache 2.0 | Pesos oficiales con model card completa |
| unsloth/SmolLM3-3B-GGUF | 3,08B | no disponible | GGUF, Apache 2.0 | Fuente original de este fichero; incluye otras cuantizaciones |
| Otros modelos de ~3B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3B | no disponible | Múltiples, licencias variables | Alternativas de la misma franja; comparación numérica no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El repositorio no aporta model card técnica propia: no hay información sobre datos de entrenamiento, sesgos o evaluación, por lo que la trazabilidad depende del repositorio original de Unsloth y de Hugging Face.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no debe usarse como fuente de verdad sin verificación.
- La cuantización Q4_K_M introduce una pérdida de calidad respecto a los pesos originales en precisión completa; el impacto exacto no está cuantificado en la información disponible.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto no especificada en la información proporcionada; conviene consultar la model card del modelo base antes de diseñar aplicaciones con conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución a Hugging Face y verificar los términos del repositorio original.
- Repositorio con cero descargas y sin mantenimiento aparente: para producción es preferible depender de `unsloth/SmolLM3-3B-GGUF` o de los pesos oficiales, y verificar el SHA-256 si se usa este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/SmolLM3-3B-Q4_K_M-GGUF
- Repositorio original del GGUF (Unsloth): https://huggingface.co/unsloth/SmolLM3-3B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
