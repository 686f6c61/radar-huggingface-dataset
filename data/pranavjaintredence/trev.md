# pranavjainTredence/trev

## Resumen

`trev` es un modelo de decisión tipado publicado por el usuario `pranavjainTredence` en HuggingFace. No es un modelo de generación de texto al uso: se trata de un conjunto de adaptadores LoRA (r=16, α=8) acoplados a una cabeza de decisión denominada Clef sobre el modelo base `unsloth/Qwen3.5-0.8B`. Su función es recibir un estado textual (`state`) y un conjunto de preguntas tipadas (`choice`, `noul`, `score`) y devolver probabilidades nativas sobre las opciones en un único forward pass, sin generar tokens.

La propuesta resulta relevante para pipelines de clasificación y enrutamiento donde la latencia y el coste por inferencia importan: al no decodificar texto, el modelo evita la generación autoregresiva y produce directamente distribuciones de probabilidad sobre las opciones definidas por el usuario. Esto lo sitúa en la categoría de modelos de decisión (decision models) y no en la de asistentes conversacionales.

El modelo es de tamaño reducido (base de 0,8B parámetros) y está pensado para inferencia con cuantización de 4 bits. El repositorio ocupa 0,1 GB y contiene únicamente pesos de inferencia, sin estado de optimizador ni de entrenador. La licencia de los adaptadores y la cabeza es Apache-2.0, mientras que los términos del modelo base siguen la licencia de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B) + adaptadores LoRA + cabeza de decisión Clef |
| Parametros totales | No disponible (base de 0,8B; los adaptadores LoRA r=16 no se cuantifican en la ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens (`max_seq_length=32768` en el ejemplo de carga) |
| Tipos de cuantizacion | 4 bits (QLoRA en entrenamiento; `load_in_4bit=True` en inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptadores y cabeza); términos del modelo base según Qwen |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `joint_head.safetensors`) + configuraciones JSON |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, un transformer decoder de 0,8B parámetros, sobre el que se aplica un ajuste QLoRA en 4 bits con rango r=16, alpha=8 y dropout de 0,05. Sobre la representación resultante se acopla una cabeza de decisión Clef (`joint_head.safetensors`) que transforma el estado oculto en probabilidades sobre opciones tipadas. La innovación principal es que la salida no es texto generado, sino una distribución de probabilidad nativa calculada en un solo forward pass, lo que elimina la decodificación autoregresiva y reduce la latencia frente a enfoques de prompting con modelos generativos.

El entrenamiento se realizó con aproximadamente 96.000 filas internas de decisiones tipadas (no publicadas). El checkpoint exportado corresponde a la mejor validación tras un proceso de calibración de temperaturas, cuyos valores se almacenan en `unsloth_decision_config.json`. No se documentan en la información disponible detalles sobre la composición del dataset, el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Clasificación y enrutamiento tipado: responde preguntas de tipo `choice` (selección entre opciones con criterios definidos), `noul` (booleano sí/no) y `score` (puntuación).
- Salida probabilística nativa en un único forward pass, sin generación de tokens.
- Soporte de múltiples preguntas simultáneas en una misma llamada (por ejemplo, `team` y `refund` en el ejemplo de la model card).
- Contexto de hasta 32.768 tokens, adecuado para estados largos (historiales de conversación, tickets extensos, documentos).
- Compatibilidad declarada con `jev-compatible` (etiqueta del autor, sin documentación adicional disponible).
- Inferencia con cuantización de 4 bits mediante Unsloth (`FastDecisionModel`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo puede clasificar el equipo responsable (facturación, técnico, ventas) mediante una pregunta `choice` con criterios explícitos, aprovechando la salida probabilística para umbrales de confianza y escalado a revisión humana.
- Detección de intención de reembolso: con una pregunta `noul`, se determina si el cliente solicita un reembolso en el mensaje, integrándose en flujos de atención al cliente automatizada con contexto multi-turno gracias a la ventana de 32.768 tokens.
- Triaje de correos y formularios: clasificación de mensajes entrantes en categorías operativas con probabilidades nativas, útil para priorización y asignación automática en bandejas compartidas.
- Moderación y etiquetado de contenido: uso de preguntas `score` para asignar puntuaciones de riesgo o calidad a textos, con calibración de temperaturas ya incorporada en el checkpoint.
- Extracción de decisiones en pipelines de datos: clasificación de registros en procesos ETL donde se necesita una etiqueta tipada por registro con baja latencia, sin coste de generación autoregresiva.
- Enrutamiento en asistentes conversacionales: selección de la siguiente acción o herramienta a invocar en un diálogo, usando preguntas `choice` sobre el estado de la conversación y las opciones disponibles.
- Filtrado previo en sistemas RAG: decidir si una consulta requiere recuperación externa o puede responderse con conocimiento interno, mediante una pregunta `noul` sobre el estado de la consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con base de 0,8B y carga en 4 bits, la huella de pesos se sitúa en el orden de menos de 1 GB, más overhead de activaciones y de la cabeza Clef.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs consumer con al menos 4-8 GB de VRAM, aunque no se confirma oficialmente.
- Cabe en GPU consumer: probablemente sí (RTX 3060, RTX 4060, RTX 4090), si bien no hay validación publicada.
- Opciones de despliegue: la model card solo documenta Unsloth mediante `FastDecisionModel` (requiere una build reciente con soporte de Clef). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de una cabeza de decisión custom hace improbable el soporte directo en esos motores sin trabajo adicional.
- Latencia y throughput: no disponibles; al no generar tokens, la latencia esperada es la de un único forward pass, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `trev` | Base 0,8B + LoRA + cabeza Clef | 32.768 | Probabilidades tipadas nativas | Apache-2.0 (adaptadores) | HuggingFace, 0 descargas |
| `unsloth/Qwen3.5-0.8B` (base) | 0,8B | No disponible en esta ficha | Texto generado | Según Qwen | HuggingFace |
| Clasificadores BERT pequeños (p. ej. DistilBERT) | ~66M | 512 típicamente | Logits de clasificación fija | Apache-2.0 / MIT según variante | Amplia |
| LLM generativos pequeños con prompting (p. ej. Qwen 0,5B-1,5B) | 0,5B-1,5B | Variable | Texto generado | Variable | Amplia |

La comparación con clasificadores BERT es la más directa en cuanto a tipo de salida, aunque `trev` ofrece contexto mucho mayor y preguntas tipadas dinámicas. Frente a LLM generativos pequeños, la ventaja es la latencia de un solo forward pass; la desventaja, la dependencia de Unsloth y la ausencia de benchmarks públicos.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El dataset de entrenamiento es interno (~96k filas) y no se documenta su composición, por lo que se desconocen sesgos y cobertura lingüística.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación estructural: al emitir probabilidades sobre opciones predefinidas, el modelo puede asignar alta confianza a opciones incorrectas si el estado de entrada se sale de la distribución de entrenamiento.
- Dependencia de una build reciente de Unsloth con soporte de `FastDecisionModel` y Clef; la portabilidad a otros motores de inferencia no está garantizada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), lo que indica ausencia de validación comunitaria.
- La licencia Apache-2.0 cubre adaptadores y cabeza, pero el uso comercial del modelo base queda sujeto a los términos de Qwen.
- Solo contiene pesos de inferencia; no es posible reanudar el entrenamiento a partir de este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/pranavjainTredence/trev
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
