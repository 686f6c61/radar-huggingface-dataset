# madcatlab/Qwen3.5-4B-Marketing-GGUF

## Resumen

El modelo **Qwen3.5-4B-Marketing-GGUF** es una conversión al formato GGUF de un fine-tuning LoRA del modelo base `unsloth/Qwen3.5-4B`, desarrollado por **Mad Cat Lab** (madcatlab). Está orientado a conversaciones y respuestas en el ámbito del marketing digital, publicidad, SEO y estrategia de marketing mix, con soporte para turco e inglés. Su relevancia radica en que ofrece un modelo de 4B parámetros especializado, ejecutable en CPU sin GPU dedicada, lo que permite desplegarlo en entornos de bajos recursos.

La arquitectura subyacente es la familia Qwen3.5, que integra innovaciones en eficiencia arquitectónica, incluyendo una mezcla de atención completa y lineal que reduce drásticamente el tamaño de la caché KV. El modelo base soporta una ventana de contexto nativa de 262.144 tokens, aunque la cuantización Q4_K_M incluida reduce el tamaño del archivo a 2,6 GB, facilitando su despliegue local.

La licencia Apache-2.0 permite uso comercial sin restricciones. El modelo se distribuye en un único archivo GGUF con cuantización Q4_K_M (promedio ~4,7 bits por parámetro) y está pensado para ejecutarse con llama.cpp, llama-server, llama-cli u Ollama. Incluye una advertencia crítica: requiere configurar `enable_thinking=false` para que las respuestas se devuelvan correctamente en el campo `content` de la API compatible con OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (base: `unsloth/Qwen3.5-4B`), transformer con mezcla de atención completa y lineal |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base; verificado en la versión original) |
| Tipos de cuantizacion | Q4_K_M (archivo incluido); el autor recomienda Q5_K_M o Q6_K si se prioriza precisión |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3.5-4B`, un modelo denso de 4.000 millones de parámetros de la familia Qwen3.5. Según la documentación de Qwen, la serie Qwen3.5 integra avances en aprendizaje multimodal, eficiencia arquitectónica y RL a escala. La model card de este fine-tune indica que solo un cuarto de las capas usan atención completa (`full-attention`), mientras que el resto emplea atención lineal, lo que reduce el tamaño de la caché KV a aproximadamente 32 KB por token. Esto permite ejecutar el modelo con ventanas de contexto de hasta 128K tokens usando solo 7,5 GB de RAM total (con la cuantización Q4_K_M).

El entrenamiento del modelo base y el fine-tune no detalla en la información disponible el número de tokens ni la composición exacta del dataset. La model card indica que se trata de un fine-tune LoRA sobre el modelo base, realizado por Mad Cat Lab, especializado en diálogos de marketing digital y marketing mix. No se menciona el uso de RLHF o DPO en el fine-tune.

## Capacidades

- Generación de texto en turco e inglés orientada a marketing, publicidad, SEO y estrategia de marketing mix.
- Conversación multi-turno: al desactivar `enable_thinking`, el modelo produce respuestas directas en `content`, aptas para chatbots y asistentes.
- Soporte de system prompt: se puede configurar un rol de sistema (por ejemplo, "Eres un experto en marketing digital") para guiar el comportamiento.
- Ventana de contexto amplia: hasta 128K tokens en CPU con 7,5 GB de RAM (Q4_K_M), útil para procesar documentos largos o historiales de conversación extensos.
- Capacidades de razonamiento (modo thinking) presentes en el modelo base, aunque en esta variante requieren configuración explícita para no romper la salida.
- Capacidades multimodales del modelo base (visión-lenguaje) no verificadas en esta variante GGUF; no se documenta su soporte en la model card.
- Tool calling, function calling y capacidades de agente: no documentadas para este fine-tune; se desconoce si el modelo base las conserva tras el ajuste.

## Casos de uso

- **Chatbot de atención al cliente en marketing**: el modelo puede gestionar conversaciones multi-turno sobre campañas, presupuestos y estrategias de marketing, gracias a su contexto largo (hasta 128K tokens) y su especialización en el dominio.
- **Generación de contenido publicitario**: redacción de anuncios, eslóganes y textos para redes sociales en inglés y turco, adecuado para equipos de marketing que operan en estos idiomas.
- **Análisis de marketing mix**: el modelo está entrenado para dialogar sobre marketing mix (producto, precio, plaza, promoción), por lo que puede asistir en revisiones de estrategias y simular discusiones de planificación.
- **Optimización SEO**: puede generar listas de palabras clave, títulos de página y metadescripciones, aunque las cifras actuales deben validarse externamente según la model card.
- **Asistente de estrategia en entornos de bajo coste**: al ejecutarse en CPU con 8 GB de RAM, es viable para pequeñas empresas o desarrolladores que quieran un asistente de marketing local sin depender de APIs externas.
- **Integración en pipelines de generación de informes**: dado su soporte para `llama-server` y la API compatible con OpenAI, puede integrarse en flujos de automatización que generan resúmenes de campañas o análisis de audiencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se desconoce el rendimiento en tareas estándar de razonamiento, código o matemáticas para esta variante fine-tuneada.

## Requisitos de hardware

- **CPU-only**: el modelo funciona sin GPU. La model card indica que "no requiere GPU" y que corre en CPU.
- **RAM estimada** (con Q4_K_M y caché KV por defecto):
  - Contexto 4K: ~3,4 GB de RAM total
  - Contexto 16K: ~3,8 GB
  - Contexto 32K: ~4,3 GB
  - Contexto 128K: ~7,5 GB
- **Reducción de caché**: usando `--cache-type-k q8_0 --cache-type-v q8_0`, el KV cache se reduce a la mitad.
- **Velocidades medidas** (Apple M4 Max, solo CPU, `-dev none`):
  - 4 threads: 101 t/s de procesamiento de prompt, 36,1 t/s de generación
  - 8 threads: 172 t/s de procesamiento de prompt, 52,4 t/s de generación
  - 12 threads: 155 t/s de procesamiento, 25,8 t/s de generación (recomienda limitar al número de núcleos de rendimiento físicos)
- **En portátiles DDR5** (~90 GB/s de ancho de banda), se espera ~11 t/s de generación.
- **Opciones de despliegue**: `llama-server` (recomendado), `llama-cli`, `Ollama` (creando un Modelfile). No se menciona compatibilidad con vLLM o TGI en la model card.
- **Requisito de configuración**: es obligatorio usar `--chat-template-kwargs '{"enable_thinking":false}'` para que las respuestas se devuelvan en `content` y no en `reasoning_content` vacío.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| **Qwen3.5-4B-Marketing-GGUF** (este) | 4,33 B | 262.144 (nativo) | Apache-2.0 | GGUF | Marketing digital (tr, en) |
| Qwen3.5-4B (base) | 4 B | 262.144 | Apache-2.0 | safetensors, GGUF | Generalista, multimodal |
| Qwen3-4B-GGUF (serie Qwen3) | 4 B | 32.768 (serie Qwen3) | Apache-2.0 | GGUF | Generalista |

La comparación directa con Qwen3-4B no es posible sin benchmarks publicados para la variante de marketing. La principal diferencia es la especialización en marketing y el idioma turco, además de la reducción de la caché KV por la arquitectura híbrida de atención. La licencia Apache-2.0 es común en toda la familia Qwen3.5, lo que facilita el uso comercial.

## Limitaciones y advertencias

- **Modo thinking problemático**: el modelo abre el bloque `thinking` pero no lo cierra por defecto, lo que provoca que la API devuelva `content` vacío y el texto en `reasoning_content`. Es imprescindible configurar `enable_thinking=false` en el chat template para un funcionamiento correcto.
- **Idiomas limitados**: solo turco e inglés; no se documenta soporte para español u otros idiomas.
- **Alucinación**: la model card advierte que los textos generados no deben usarse para decisiones legales, financieras o críticas sin validación externa.
- **Verificación de datos**: se requiere validación externa de cifras y políticas de plataformas actuales, ya que el modelo puede generar datos desactualizados o incorrectos.
- **Degradación por cuantización**: la cuantización Q4_K_M puede provocar pérdidas en el tono y formato del fine-tune; se recomienda Q5_K_M o Q6_K si se necesita mayor precisión.
- **Sin benchmarks**: no se dispone de métricas de rendimiento publicadas, lo que dificulta evaluar su calidad frente a otros modelos.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un fine-tune de dominio reducido, puede mostrar sesgos en temas fuera del ámbito de marketing.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/madcatlab/Qwen3.5-4B-Marketing-GGUF)
- [Modelo base fine-tuneado (safetensors)](https://huggingface.co/madcatlab/Qwen3.5-4B-Marketing)
- [Modelo base `unsloth/Qwen3.5-4B`](https://huggingface.co/unsloth/Qwen3.5-4B)
- [Repositorio oficial Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Blog oficial de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- [Página del modelo Qwen3.5-4B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-4b)
- [Guía de la familia Qwen 3.5 a 3.8 (2026)](https://codersera.com/blog/qwen-3-5-complete-guide-2026/)
