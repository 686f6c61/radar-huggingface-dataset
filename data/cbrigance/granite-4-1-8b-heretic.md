# cbrigance/granite-4.1-8b-heretic

## Resumen

`cbrigance/granite-4.1-8b-heretic` es un ajuste fino (fine-tune) del modelo `ibm-granite/granite-4.1-8b` de IBM, publicado por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como "heretic"), una tecnica de modificacion de pesos que busca eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original, de modo que responda a peticiones que el modelo base tenderia a declinar. El modelo conserva la arquitectura y el tamano del original: aproximadamente 8.380 millones de parametros en formato safetensors.

El modelo base, Granite 4.1 8B, es un transformer denso de IBM orientado a generacion de texto, razonamiento y tareas empresariales, con licencia Apache 2.0. Este fine-tune mantiene esa licencia y la compatibilidad con la libreria `transformers`, e incluye la etiqueta `endpoints_compatible`, lo que indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo empresarial ampliamente utilizado; por otro, advierte de que el acceso esta restringido (gated) y de que el contenido esta marcado como `not-for-all-audiences`. No se dispone de informacion publica sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks especificos de este fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de IBM Granite 4.1 8B) |
| Parametros totales | 8.380.551.168 (~8,38 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,8 GB |
| Modelo base | ibm-granite/granite-4.1-8b |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `ibm-granite/granite-4.1-8b`: un transformer denso de aproximadamente 8,38 mil millones de parametros. No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario especificos en la informacion proporcionada; estos datos deben consultarse en la ficha del modelo base de IBM.

Respecto al entrenamiento de este fine-tune concreto, la informacion disponible es minima. Las etiquetas indican que se ha aplicado una tecnica de tipo "abliteration" o "heretic", orientada a reducir los comportamientos de rechazo del modelo alineado original. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. Tampoco se especifica si se modificaron todas las capas o solo subconjuntos de pesos. Cualquier afirmacion adicional sobre el proceso seria especulativa y no debe asumirse.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.1 8B.
- Razonamiento y respuesta a instrucciones, con la salvedad de que el ajuste "abliterated" modifica el comportamiento de rechazo ante peticiones sensibles.
- Respuestas a peticiones que el modelo base alineado tenderia a declinar (proposito declarado del fine-tune).
- Compatibilidad con `transformers` y con Inference Endpoints de Hugging Face (`endpoints_compatible`).
- Soporte multilingue limitado al ingles segun los metadatos (`en`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" especificas de este fine-tune; deben verificarse contra el modelo base.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparandolo con el modelo base en experimentos controlados.
- Analisis de robustez de filtros: util para evaluar si los sistemas de moderacion externos (clasificadores, guardrails) siguen funcionando cuando el modelo subyacente ha sido modificado para reducir sus rechazos.
- Red teaming interno: equipos de seguridad pueden emplearlo como generador de prompts adversarios o de contenido de prueba en entornos aislados, siempre con las salvaguardas organizativas adecuadas.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o dialogos que aborden temas sensibles y que el modelo base rechazaria por defecto.
- Evaluacion comparativa de fine-tunes: sirve como referencia para medir el impacto de tecnicas de desalineacion sobre benchmarks de utilidad y de seguridad.
- Experimentacion academica con modelos de 8B: su tamano permite ejecutarlo en una sola GPU de gama alta, lo que facilita la reproducibilidad en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad especificas de este fine-tune, ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para los pesos, mas memoria para el contexto y el runtime (en la practica, 20-24 GB como minimo).
- Cuantizacion en 8 bits: en torno a 9-10 GB de VRAM; en 4 bits, aproximadamente 5-6 GB, aunque no se distribuyen ficheros GGUF en el repositorio y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16. Para cuantizacion 4/8 bits, tarjetas consumer como RTX 3090, RTX 4080 o RTX 4090.
- Cabe en GPU consumer: si, en RTX 4090/3090 en FP16 ajustado o en cuantizacion; en tarjetas de 8-12 GB solo con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (nativo), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/granite-4.1-8b-heretic | ~8,38 B | No disponible | Apache 2.0 | Restringido (gated) | Fine-tune abliterated del Granite 4.1 8B |
| ibm-granite/granite-4.1-8b | ~8,38 B | No disponible en esta ficha | Apache 2.0 | Publico (segun ficha de IBM) | Modelo base alineado, sin modificacion de rechazos |
| Llama 3.1 8B (Meta) | ~8 B | 128 K (segun ficha oficial) | Llama Community License | Publico con aceptacion | Alternativa densa de tamano similar, ecosistema amplio |
| Mistral 7B (Mistral AI) | ~7,3 B | 32 K (segun ficha oficial) | Apache 2.0 | Publico | Alternativa densa de tamano similar con licencia permisiva |

La comparacion de rendimiento numerico entre estos modelos no esta disponible en la informacion proporcionada para este fine-tune.

## Limitaciones y advertencias

- La tecnica de abliteration elimina o atenua las salvaguardas del modelo base; el modelo puede generar contenido ofensivo, ilegal o danino. La etiqueta `not-for-all-audiences` lo confirma.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la falta de benchmarks publicados de este fine-tune.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Soporte unicamente en ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante desalineada conlleva riesgos legales y reputacionales; conviene revisar las politicas de la plataforma y la legislacion aplicable (por ejemplo, la Ley de IA de la UE).
- No se documentan la longitud de contexto efectiva ni el comportamiento en conversaciones multi-turno largas.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/granite-4.1-8b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Paper referenciado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
