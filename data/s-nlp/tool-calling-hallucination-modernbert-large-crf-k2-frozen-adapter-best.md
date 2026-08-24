# s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-frozen-adapter-best

## Resumen

El modelo `s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-frozen-adapter-best` es un clasificador de secuencia desarrollado por el grupo s-nlp para detectar alucinaciones en respuestas generadas por asistentes que utilizan herramientas (tool calling). Dado un contexto compuesto por la consulta del usuario y la respuesta de la herramienta, el modelo predice los intervalos de caracteres (spans) dentro de la respuesta del asistente que constituyen información fabricada o no respaldada por los datos de la herramienta.

Se basa en el modelo encoder `answerdotai/ModernBERT-large` y añade una capa CRF (Conditional Random Field) junto con un adaptador congelado (frozen adapter) para el etiquetado de secuencia a nivel de span. El modelo se entrenó sobre el dataset `s-nlp/toolHACE`, especializado en alucinaciones en contextos de tool calling. Su relevancia actual radica en la creciente adopción de agentes que invocan herramientas externas, donde la verificación de la fidelidad de las respuestas es crítica para evitar errores costosos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) con capa CRF y adaptador congelado |
| Parametros totales | no disponible (basado en ModernBERT-large, sin cifra confirmada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de ModernBERT-large, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (etiqueta "en" sugiere ingles, no confirmado) |
| Licencia | Apache 2.0 (segun etiqueta en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ModernBERT-large`, un encoder transformer de la familia ModernBERT optimizado para eficiencia y velocidad. Sobre esta base se incorpora una capa CRF para modelar dependencias entre etiquetas de secuencia, lo que permite predecir spans contiguos de alucinación de forma coherente. El término "frozen adapter" indica que se utilizó un adaptador congelado durante el fine-tuning, probablemente mediante técnicas de adaptación eficiente de parámetros (PEFT), aunque no se detalla el procedimiento exacto.

El entrenamiento se realizó sobre el dataset `s-nlp/toolHACE`, que contiene ejemplos de interacciones con herramientas donde se marcan las alucinaciones a nivel de carácter. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El pipeline declarado es `token-classification`, lo que confirma que la salida son etiquetas por token que luego se agrupan en spans.

## Capacidades

- Detección de alucinaciones en respuestas de asistentes que usan herramientas, identificando los fragmentos de texto fabricados o no respaldados por la respuesta de la herramienta.
- Predicción a nivel de carácter (span detection), lo que permite localizar con precisión las partes problemáticas de la respuesta.
- Funciona con un contexto de tool calling compuesto por la consulta del usuario y la respuesta de la herramienta, tal como se describe en la documentación de modelos similares de s-nlp.
- Soporte de inglés (según etiqueta, no confirmado oficialmente).
- Compatible con el ecosistema `transformers` y con endpoints de inferencia (etiqueta `endpoints_compatible`).

## Casos de uso

- Evaluación de agentes de IA en producción: integrar el modelo como paso de verificación para detectar respuestas alucinadas antes de enviarlas al usuario final, reduciendo el riesgo de información incorrecta.
- Auditoría de logs de conversaciones: analizar históricos de interacciones con herramientas para identificar patrones de alucinación y mejorar los prompts o el diseño del agente.
- Control de calidad en sistemas RAG: verificar que las respuestas generadas a partir de recuperación de documentos no contengan afirmaciones inventadas no presentes en las fuentes.
- Filtrado de datos para fine-tuning: usar el modelo para descartar o corregir ejemplos de entrenamiento con alucinaciones en datasets de tool calling.
- Investigación en detección de alucinaciones: servir como baseline o componente en estudios sobre fiabilidad de modelos generativos.
- Monitorización en tiempo real: desplegar el modelo como servicio de clasificación para alertar sobre respuestas sospechosas en sistemas de atención al cliente automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Al ser un modelo encoder basado en ModernBERT-large (aproximadamente 400 millones de parámetros, aunque no confirmado), se espera que la inferencia sea ligera en comparación con modelos generativos, pero no se pueden dar cifras exactas sin información verificada.
- El formato safetensors y la compatibilidad con `transformers` permiten su despliegue en frameworks como Hugging Face Inference Endpoints, aunque no se documentan opciones específicas como vLLM u Ollama.

## Comparativa con modelos similares

Existen otros modelos de s-nlp con la misma finalidad, aunque no se dispone de sus especificaciones detalladas:

| Modelo | Base | Notas |
|---|---|---|
| `s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-frozen-adapter-best` | ModernBERT-large | Modelo large con CRF y adaptador congelado |
| `s-nlp/tool-calling-hallucination-modernbert-base-unified-final` | ModernBERT-base | Variante base, unificada |
| `s-nlp/tool-calling-hallucination-modernbert-base-glaive-100pct` | ModernBERT-base | Variante base entrenada con dataset Glaive al 100% |

No se dispone de comparativas de rendimiento entre estos modelos ni con alternativas externas.

## Limitaciones y advertencias

- Sesgos: no se ha publicado información sobre sesgos del modelo; al estar entrenado en un dataset específico de tool calling, puede no generalizar bien a otros dominios.
- Riesgo de alucinación: el modelo está diseñado para detectar alucinaciones, pero puede producir falsos positivos (marcar texto correcto como alucinado) o falsos negativos (no detectar alucinaciones reales), especialmente en dominios no vistos.
- Limitaciones de contexto: la longitud de contexto no está confirmada; depende de ModernBERT-large, que típicamente soporta 8192 tokens, pero no se garantiza.
- Restricciones de licencia: la licencia Apache 2.0 (según etiqueta) permite uso comercial, pero se recomienda verificar la licencia del dataset `toolHACE` para posibles restricciones adicionales.
- Caveat de producción: el modelo requiere un contexto estructurado (consulta de usuario + respuesta de herramienta); su uso fuera de este formato puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s-nlp/tool-calling-hallucination-modernbert-large-crf-k2-frozen-adapter-best
- Modelo similar (base unificado): https://huggingface.co/s-nlp/tool-calling-hallucination-modernbert-base-unified-final
- Modelo similar (base glaive): https://huggingface.co/s-nlp/tool-calling-hallucination-modernbert-base-glaive-100pct
- Dataset `toolHACE` (referenciado en etiquetas): https://huggingface.co/datasets/s-nlp/toolHACE
