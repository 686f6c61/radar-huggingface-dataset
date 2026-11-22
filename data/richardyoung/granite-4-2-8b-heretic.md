# richardyoung/granite-4.2-8b-heretic

## Resumen

Granite-4.2-8b-heretic es una variante "abliterated" (decensored) del modelo IBM Granite 4.2 de 8B parámetros, publicada por el usuario richardyoung en Hugging Face. Se trata de un fine-tune del modelo oficial `ibm-granite/granite-4.2-8b` en el que se han eliminado o atenuado los mecanismos de rechazo y alineación de seguridad, manteniendo la arquitectura y capacidades del modelo original: generación de texto, razonamiento con modo "thinking", tool calling y soporte multilingüe en 12 idiomas.

El modelo conserva los 8.791.592.960 parámetros del Granite 4.2 original y una licencia Apache 2.0, lo que lo hace atractivo para experimentación e investigación sobre alineación, robustez y comportamiento de modelos sin censura. Es relevante ahora porque la familia Granite 4.x de IBM se ha posicionado como una alternativa open source empresarial a modelos propietarios, y esta variante permite estudiar qué se pierde y qué se gana al eliminar las capas de seguridad.

El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa 17,6 GB en formato safetensors y está pensado para su uso con transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.2; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 8.791.592.960 |
| Parámetros activos | No aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (los pesos publicados son safetensors; se asume compatibilidad con cuantizaciones estándar de transformers, pero no se confirma) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del IBM Granite 4.2 8B, por lo que hereda su arquitectura transformer y su proceso de preentrenamiento original. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO; estos datos corresponden a la documentación oficial de IBM Granite 4.2, no incluida en la ficha proporcionada.

La innovación principal de esta variante es el proceso de "abliteration" o decensoring aplicado por richardyoung, que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. El modelo conserva las capacidades del base, incluyendo el modo de razonamiento ("thinking") y el soporte de tool calling, tal como reflejan los tags del repositorio. No se dispone de información sobre la metodología exacta de abliteration empleada ni sobre el volumen de datos de fine-tune utilizado.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" explícito (heredado de Granite 4.2).
- Tool calling / function calling.
- Soporte multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo base.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información proporcionada, aunque plausibles en la familia Granite 4.x.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento de este modelo con el Granite 4.2 original para estudiar qué tipos de peticiones se aceptan o rechazan y cómo varía la calidad de las respuestas al eliminar las capas de rechazo.
- Evaluación de robustez de filtros: usar el modelo como generador adversarial en pipelines de red teaming para probar clasificadores de contenido y sistemas de moderación.
- Generación de datos sintéticos para dominios sensibles: crear datasets de entrenamiento o evaluación en áreas donde el modelo base podría negarse a responder (por ejemplo, narrativa de ficción con contenido violento o análisis de seguridad ofensiva en entornos controlados).
- Asistentes conversacionales internos: desplegar el modelo en entornos corporativos donde el equipo acepta la responsabilidad de moderar las salidas, aprovechando su soporte multilingüe y tool calling.
- Experimentación con tool calling en agentes: integrar el modelo en frameworks de agentes que requieran function calling sin restricciones de contenido en las respuestas intermedias.
- Investigación lingüística multilingüe: analizar el comportamiento del modelo en los 12 idiomas soportados y comparar la calidad y los sesgos entre lenguas.
- Prototipado rápido con transformers: al estar en formato safetensors y ser compatible con la librería transformers, sirve para pruebas de concepto sin necesidad de conversiones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 17,6 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM.
- En cuantización de 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB.
- En cuantización de 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, justo para los pesos).
- Cabe en GPU consumer: sí, especialmente con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF (la conversión no está confirmada en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/granite-4.2-8b-heretic | 8,79 B | No disponible | Apache 2.0 | Gated | Variante decensored del Granite 4.2 8B |
| ibm-granite/granite-4.2-8b | 8,79 B (según modelo base) | No disponible | Apache 2.0 | Público (presumiblemente) | Modelo base oficial con alineación de seguridad |
| Alternativas de 7-8B decensored (p. ej. variantes abliterated de Llama 3.1 8B o Qwen 2.5 7B) | 7-8 B | Variable según base | Licencias diversas (Llama, Apache 2.0) | Variable | No se dispone de datos concretos en la información proporcionada |

La comparativa con modelos de la misma categoría (variantes abliterated de otros modelos 7-8B) no puede completarse con datos verificados a partir de la información disponible.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminación de los mecanismos de rechazo implica un mayor riesgo de generar contenido dañino, ofensivo, ilegal o inexacto. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: no se dispone de datos específicos sobre la tasa de alucinación de esta variante; el proceso de abliteration puede degradar la coherencia y la precisión factual del modelo base.
- El proceso de abliteration puede afectar negativamente a capacidades como el razonamiento, el tool calling o la calidad multilingüe; no hay evaluaciones publicadas que lo confirmen o descarten.
- Contexto máximo: no disponible; no se debe asumir una ventana concreta sin consultar la documentación del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre las salidas generadas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Sesgos: no se han documentado sesgos específicos de esta variante; se heredan los del modelo base, potencialmente amplificados por la falta de alineación.
- Fecha de creación del repositorio (2026-09-28) y actualización (2026-10-20): verificar que los pesos corresponden a la versión esperada antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Paper referenciado (arxiv:2406.11717): no se dispone del título en la información proporcionada
- Paper referenciado (arxiv:2510.18892): no se dispone del título en la información proporcionada
