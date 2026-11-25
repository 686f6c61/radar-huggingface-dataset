# huihui-ai/Huihui-Mistral-Large-4-1T-A52B-abliterated-GGUF

## Resumen

Huihui-Mistral-Large-4-1T-A52B-abliterated-GGUF es una versión "abliterated" (sin filtros de seguridad) del modelo Mistral-Large-4-1T-A52B de Mistral AI, publicada por el colectivo huihui-ai. Se distribuye exclusivamente en formato GGUF, cuantizado, para su uso con llama.cpp y herramientas compatibles. El proceso de abliteración se realizó íntegramente sobre el modelo GGUF mediante la herramienta cvector-generator de llama.cpp, sin pasar por Transformers.

El modelo base es un Mixture of Experts (MoE) de gran escala: 1.049.357.365.536 parámetros totales (aproximadamente 1,05 billones) con 52B parámetros activos por token, según la nomenclatura A52B del nombre. El repositorio ocupa 377,6 GB y la variante documentada es UD-Q2_K_XL, derivada de la cuantización de unsloth/Mistral-Large-4-1T-A52B, aunque con tipos de cuantización distintos en los pesos ablacionados.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas distribuciones GGUF de un modelo de escala billón de parámetros, lo que permite ejecutarlo fuera de stacks de Transformers; por otro, advierte de que la abliteración elimina buena parte del filtrado de seguridad, lo que lo hace inadecuado para producción orientada al público sin capas de moderación adicionales. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según nomenclatura A52B del modelo base |
| Parametros totales | 1.049.357.365.536 (~1,05 billones) |
| Parametros activos | 52B (según nombre A52B; no verificado en la información disponible) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama-cli con -c 262144) |
| Tipos de cuantizacion | GGUF; variante documentada UD-Q2_K_XL (9 shards); otras cuantizaciones no detalladas |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl (38 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors solo como dato de referencia del modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un Mixture of Experts de escala billón de parámetros con 52B activos por token, según la convención de nombres de Mistral (A52B). No se dispone en la información proporcionada de detalles sobre el número de expertos, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base más allá de la propia arquitectura MoE.

La innovación de esta publicación es el proceso de abliteración: se calcula una dirección de rechazo (refusal direction) mediante cvector-generator de llama.cpp y se proyectan fuera los pesos asociados a esa dirección, todo ello operando directamente sobre el GGUF en lugar de sobre los pesos originales en Transformers. La variante UD-Q2_K_XL proviene de la cuantización de unsloth, pero los pesos ablacionados emplean un tipo de cuantización distinto al original, lo que introduce diferencias respecto a una simple re-cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en 38 idiomas, incluidos español, inglés, francés, alemán, chino, árabe, hindi y japonés.
- Razonamiento y respuesta a instrucciones propias de un modelo de gran escala (capacidades heredadas del base Mistral-Large-4-1T-A52B).
- Generación de código y matemáticas: no documentado explícitamente en la información disponible, pero esperable por el perfil del modelo base.
- Salida sin filtrado de seguridad (uncensored): el modelo no aplica las capas de rechazo del base, lo que permite respuestas sobre temas que el modelo original declinaría.
- Compatibilidad con llama.cpp y ecosistema GGUF (llama-cli, llama-server, endpoints compatibles según tags).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM de escala billón sin capas de rechazo, comparando sus respuestas con las del base para analizar qué direcciones de activación codifican el rechazo.
- Evaluación de robustez de filtros externos: sirve como generador adversario controlado para probar clasificadores de moderación y guardrails propios, ya que produce contenido que un modelo alineado evitaría.
- Experimentación con cuantizaciones extremas: la variante UD-Q2_K_XL permite medir la degradación de calidad de un MoE de 1T parámetros a ~2 bits por peso en tareas de razonamiento y generación larga.
- Procesamiento de documentos multilingües de contexto largo: con 262.144 tokens de ventana, puede resumir o extraer información de corpus extensos en cualquiera de los 38 idiomas soportados.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o material editorial que requiera explorar temas sensibles, siempre con revisión humana posterior.
- Despliegue en entornos aislados con llama.cpp: al ser GGUF, puede ejecutarse en infraestructura on-premise sin dependencias de Transformers ni de servicios en la nube, útil para laboratorios con requisitos de confidencialidad.
- Fine-tuning o destilación sobre un modelo sin sesgo de rechazo: el modelo puede servir como profesor para generar datos de entrenamiento en dominios donde el filtrado del base limitaría la cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 377,6 GB; la variante UD-Q2_K_XL se reparte en 9 shards, lo que sugiere un tamaño en disco del orden de cientos de GB según la cuantización elegida. No se dispone de cifras exactas de VRAM por cuantización en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo, un despliegue completo requiere múltiples aceleradores de gama profesional (A100/H100) o el uso de memoria unificada; no se documentan configuraciones validadas.
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090, 24 GB) en ninguna cuantización razonable; requeriría offloading masivo a CPU/RAM o múltiples GPUs.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) es la vía documentada; Ollama aparece como canal del autor huihui-ai en general, aunque no se confirma esta variante concreta. vLLM y TGI no están documentados para este GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Mistral-Large-4-1T-A52B-abliterated-GGUF | ~1,05B totales / 52B activos | 262.144 | MIT | GGUF | Sin filtrado de seguridad; abliterado sobre GGUF |
| mistralai/Mistral-Large-4-1T-A52B (base) | ~1,05B totales / 52B activos | no disponible | no disponible en la información | safetensors | Modelo original alineado |
| unsloth/Mistral-Large-4-1T-A52B | ~1,05B totales / 52B activos | no disponible | no disponible en la información | GGUF | Fuente de la cuantización UD-Q2_K_XL, sin abliterar |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteración elimina las capas de rechazo, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado sin aviso.
- No apto para público general: el propio autor advierte que las salidas pueden ser inadecuadas para entornos públicos, menores o aplicaciones con requisitos de seguridad altos.
- Responsabilidad legal y ética: el usuario asume toda la responsabilidad sobre el uso y las consecuencias del contenido generado; el autor declina cualquier responsabilidad.
- Uso recomendado en investigación: el autor sugiere limitarlo a entornos controlados y evitar su uso directo en producción o en aplicaciones comerciales de cara al público.
- Necesidad de moderación externa: se recomienda monitorización en tiempo real y revisión manual de las salidas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de esta escala, especialmente en cuantizaciones de 2 bits.
- Degradación por cuantización: la variante UD-Q2_K_XL opera a muy baja precisión, lo que puede afectar a la coherencia en contextos largos y tareas de razonamiento complejo.
- Sesgos: no documentados en la información proporcionada; la abliteración no elimina sesgos sociales, solo la dirección de rechazo.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero las advertencias del autor sobre idoneidad para producción siguen aplicando.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Mistral-Large-4-1T-A52B-abliterated-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantización de origen (unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B
- Herramienta cvector-generator (llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Perfil del autor en Hugging Face: https://huggingface.co/huihui-ai
- Perfil del autor en Ollama: https://ollama.com/huihui_ai
- Ko-fi del autor: https://ko-fi.com/huihuiai
