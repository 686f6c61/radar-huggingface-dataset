# cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4

## Resumen

Swift-Qwen3.8-27B-AWQ-INT4 es la versión cuantizada a 4 bits (AWQ) del modelo Swift-Qwen3.8-27B, desarrollado por UkisAI como derivado de Qwen3.8-27B. Se trata de un modelo multimodal de tipo image-text-to-text (acepta imágenes y texto), con 27.781 millones de parámetros totales y un enfoque explícito en la eficiencia del razonamiento: según el autor, reduce el consumo de tokens de "pensamiento" en un 58,3 % manteniendo una pérdida de rendimiento inferior al 1 %, lo que se traduce en una aceleración de hasta 1,95x en varias tareas.

La relevancia del modelo reside en su propuesta de "reasoning eficiente": en lugar de maximizar la profundidad del razonamiento, penaliza durante el ajuste fino los tokens marcadores que provocan sobrepensamiento (overthinking) en los rollouts de razonamiento de Qwen. El resultado son trazas de razonamiento más cortas, menor coste de inferencia y, según el autor, menos errores derivados de razonar en exceso.

Esta variante concreta la publica cyankiwi, que aplica cuantización AWQ INT4 (calibrada con datos de STEM y agentic) sobre el modelo base de UkisAI, reduciendo el repositorio a 21,0 GB. Está pensada para despliegue en producción con `transformers` y `compressed-tensors`, y es compatible con endpoints. La licencia es la swift-open-license-1.0, con acceso restringido (gated).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; tag de arquitectura `qwen3_5` / `qwen3_8` |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (pesos a 4 bits, activaciones con cuantizacion aware); formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (acceso restringido, `gated: true`) |
| Formato de pesos | safetensors (compatible con `transformers` y `compressed-tensors`) |
| Tamano del repositorio | 21,0 GB |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Version de cuantizacion | cyankiwi 26.05.01 |
| Dataset de calibracion | cyankiwi/calibration (STEM y agentic) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 27,78 B de parámetros derivado de Qwen3.8-27B. El ajuste propietario de UkisAI (Swift) se basa en identificar tokens marcadores de razonamiento que, según su análisis, disparan el sobrepensamiento en los rollouts de Qwen, y en penalizar su uso durante el ajuste fino. Además, incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B (BottleCap AI). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La variante aquí descrita es una cuantización AWQ de 4 bits realizada por cyankiwi, calibrada con un dataset propio orientado a STEM y escenarios agénticos. AWQ preserva los canales de pesos más sensibles a la activación, lo que permite reducir el peso del modelo de forma significativa con una degradación controlada. No se detallan innovaciones adicionales de decodificación especulativa ni mecanismos de atención lineal en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con trazas de pensamiento más cortas que el modelo Qwen original (reducción declarada del 58,3 % en tokens de razonamiento).
- Procesamiento de imágenes y texto (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento eficiente en tokens ("efficient-thinking", "token-efficient"), orientado a reducir latencia y coste por consulta.
- Capacidades de código y matemáticas implícitas en su origen Qwen y en el calibrado STEM del proceso de cuantización (sin cifras publicadas específicas).
- Soporte conversacional multi-turno.
- Integración con `transformers` y `compressed-tensors`; compatible con endpoints.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades agénticas y de razonamiento multi-paso: el modelo base se asocia a tags de razonamiento y el calibrado incluye datos agentic, pero no se documentan detalles.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes de razonamiento en producción con coste controlado: al generar trazas de pensamiento un 58,3 % más cortas, el modelo reduce el número de tokens de salida por consulta, lo que abarata la inferencia en escenarios de razonamiento complejo (matemáticas, lógica, análisis) sin sacrificar, según el autor, más de un 1 % de rendimiento.
- Análisis de documentos e imágenes en pipelines STEM: gracias a su naturaleza image-text-to-text y a la calibración en datos STEM, puede emplearse para extraer y razonar sobre figuras, tablas o diagramas técnicos en flujos de investigación e ingeniería.
- Automatización de soporte técnico especializado: con 27,78 B de parámetros y capacidad conversacional, puede gestionar diálogos multi-turno sobre temas técnicos donde se requiere razonamiento encadenado, beneficiándose del menor consumo de tokens.
- Generación asistida de código en entornos de desarrollo: su origen Qwen y el calibrado agentic lo hacen adecuado para tareas de completado y revisión de código, aunque no se han publicado métricas específicas de HumanEval o LiveCodeBench para esta variante cuantizada.
- Despliegue en infraestructura con VRAM limitada: la cuantización AWQ INT4 reduce el peso a 21 GB, lo que permite servir el modelo en una sola GPU de 24 GB (por ejemplo, RTX 4090 o L4) en lugar de requerir hardware de 80 GB para la versión BF16.
- Evaluación comparativa de eficiencia de razonamiento: útil para investigadores que quieran medir el impacto de la reducción de tokens de pensamiento frente al modelo Qwen3.8-27B original en sus propios benchmarks.
- Prototipado de agentes multimodales: al combinar entrada de imagen y texto con razonamiento eficiente, sirve para construir agentes que interpretan capturas, diagramas o documentos escaneados y actúan en consecuencia.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de evaluación que compara Qwen3.8-27B en BF16 con el mismo modelo más el adaptador Swift, con columnas de puntuación, tokens de razonamiento y mediana. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada (la tabla aparece truncada en el HTML de la model card). El autor declara de forma cualitativa:

- Reducción del 58,3 % en tokens de pensamiento.
- Pérdida de rendimiento inferior al 1 %.
- Aceleración de hasta 1,95x en varias tareas.
- La demo de velocidad utiliza un prompt de muestra de LiveCodeBench v6.

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para el modelo base ni para esta cuantización AWQ INT4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 GB solo para pesos en INT4; con overhead de activaciones y caché KV, se recomienda al menos 24 GB de VRAM para contextos moderados.
- GPU recomendadas: una sola GPU de 24 GB (RTX 4090, L4, A10G) para despliegue básico; A100 40/80 GB o H100 para mayor concurrencia y contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que el contexto y el batch se mantengan moderados.
- Opciones de despliegue: `transformers` con `compressed-tensors` (soporte nativo declarado); vLLM y TGI son compatibles con AWQ/compressed-tensors en general, aunque no se confirma explícitamente en la información disponible; llama.cpp/Ollama requerirían una conversión a GGUF (existe una variante GGUF del modelo base de UkisAI, no de esta cuantización).
- Latencia y throughput: no disponibles. El autor declara una aceleración de 1,95x atribuible a la reducción de tokens de razonamiento, no a la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4 | 27,78 B | no disponible | AWQ INT4 | swift-open-license-1.0 (gated) | Variante cuantizada de Swift; 21 GB |
| ukisai/Swift-Qwen3.8-27b | 27,78 B | no disponible | BF16 | swift-open-license-1.0 | Modelo base sin cuantizar; mayor VRAM |
| Qwen3.8-27B (original) | 27 B (aprox.) | no disponible | BF16 y otras | licencia Qwen (no confirmada) | Razonamiento más verboso; sin reducción de tokens |
| bottlecapai/ThinkingCap-Qwen3.6-27B | 27 B (aprox.) | no disponible | no disponible | no disponible | Fuente del componente de transferencia de Swift |

No se dispone de datos de rendimiento comparativos numéricos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está marcado como `gated: true`; es necesario solicitar acceso en Hugging Face.
- Licencia swift-open-license-1.0: es una licencia "other" con términos propios; es imprescindible revisar el enlace de licencia del modelo base antes de cualquier uso comercial. UkisAI ofrece licencias enterprise por separado.
- La cuantización AWQ INT4 introduce degradación adicional respecto al modelo BF16; el autor solo reporta la pérdida del adaptador Swift (<1 %), no la pérdida acumulada por la cuantización.
- Riesgo de alucinación: inherente a los modelos de razonamiento de este tamaño; la reducción de tokens de pensamiento podría aumentar el riesgo en tareas que requieren cadenas de razonamiento largas, aunque el autor afirma observar menos errores de sobrepensamiento.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas principales del modelo Qwen subyacente.
- Longitud de contexto no disponible: no se puede planificar el despliegue para casos de contexto largo sin verificación empírica.
- Sin benchmarks numéricos publicados para esta variante cuantizada: las afirmaciones de rendimiento del autor (58,3 % menos tokens, <1 % de pérdida, 1,95x) corresponden al adaptador Swift sobre BF16, no a esta cuantización AWQ.
- Soporte de tool calling no confirmado: verificar antes de integrar en pipelines agénticos.
- Fecha de creación (2026-09-18) y actualización (2026-10-19): comprobar que la versión de calibración (cyankiwi 26.05.01) coincide con la esperada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Variante GGUF del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Modelo fuente del componente de transferencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Web de cyankiwi: https://cyan.kiwi/
- Despliegue en endpoints de cyankiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4
- Modelos de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Modelos de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- Web de UkisAI: https://ukisai.com
- Producto Swift de UkisAI: https://ukisai.com/products/swift
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
