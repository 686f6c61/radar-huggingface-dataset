# ITLL/Mythos-5-Abliterated-9B-GGUF

## Resumen

Mythos-5-Abliterated-9B-GGUF es la cuantización en formato GGUF publicada por In The Loop Labs (ITLL) de un modelo de razonamiento de 9B parámetros que ha pasado por una cadena de derivaciones sucesivas. El origen es Qwen3.5-9B de Alibaba (Apache 2.0, publicado en febrero de 2026), sobre el que Empero AI realizó un ajuste fino supervisado de todos los parámetros con más de 500 millones de tokens de trazas de Claude Mythos, Claude Fable y cadenas de pensamiento internas, y al que posteriormente huihui-ai aplicó una abliteración para eliminar el comportamiento de rechazo. ITLL convierte el resultado a cinco cuantizaciones GGUF más un proyector multimodal para que texto y visión funcionen bajo llama.cpp.

El modelo hereda la arquitectura híbrida de Qwen3.5-9B: bloques Gated DeltaNet (atención lineal) combinados con atención completa en proporción 3:1, con un contexto nativo de 262.144 tokens extensible a 1.048.576 mediante factor YaRN 4.0 ya incorporado en la configuración. Funciona en modo razonamiento por defecto, emitiendo un bloque ` thinking` antes de la respuesta final, y conserva la ruta de visión nativa del modelo base.

La relevancia de esta ficha reside en su naturaleza experimental: se trata de un modelo descensurado en dos capas independientes (entrenamiento sobre base sin censura y abliteración posterior), con cero descargas y cero likes en el momento de la publicación, y sin evaluaciones propias publicadas por el autor de la cuantización. Es material de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (atención lineal) + Gated Attention, multimodal nativa |
| Parámetros totales | 9.197.093.888 (≈9B), ~10B con codificador de visión |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 nativo; 1.048.576 (≈1M) con YaRN factor 4.0 |
| Tipos de cuantización | Q4_K hasta bf16 (5 cuantizaciones GGUF) + proyector de visión bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada en cada paso de la cadena) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: 32 capas en disposición híbrida donde tres bloques de Gated DeltaNet (atención lineal, 32 cabezas de valor, 16 cabezas QK, dimensión de cabeza 128) se alternan con un bloque de Gated Attention (16 cabezas de consulta, 4 cabezas KV, dimensión de cabeza 256, embeddings rotatorios de 64 dimensiones). El vocabulario es de aproximadamente 152K tokens. Esta disposición híbrida mantiene el crecimiento de memoria subcuadrático en contexto largo, lo que hace viable la ventana de 1M tokens. La extensión de contexto emplea la receta oficial de YaRN con factor 4.0, `mrope_section [11, 11, 10]`, `rope_theta 10000000` y `partial_rotary_factor 0.25`, configuración que Empero incorporó directamente en el fine-tune.

El entrenamiento del fine-tune consistió en SFT de todos los parámetros sobre más de 500 millones de tokens compuestos por trazas de Claude Mythos, trazas de Claude Fable y cadenas de pensamiento `rethink` generadas internamente. Posteriormente, huihui-ai aplicó una abliteración, edición de pesos post-hoc que elimina sustancialmente la dirección de rechazo. La cuantización final de ITLL no añade entrenamiento: solo convierte pesos. El modelo base Qwen3.5-9B opera en modo pensamiento por defecto; el muestreo recomendado es temperatura 0.6 / top-p 0.95 / top-k 20 para trabajo de precisión, o 1.0 / 0.95 / 20 para razonamiento general.

## Capacidades

- Generación de texto y razonamiento multi-paso con bloque ` thinking` explícito antes de la respuesta final.
- Razonamiento matemático y resolución de problemas (heredado del modelo base).
- Generación de código y tareas de programación competitiva.
- Llamada a funciones nativa (function calling), según la model card.
- Capacidades de agente y razonamiento encadenado en múltiples pasos.
- Visión: ruta multimodal funcional mediante el proyector `mmproj-model-bf16.gguf`.
- Capacidades multilingües heredadas del modelo base (sin lista explícita de idiomas en la información disponible).
- Modo sin pensamiento: según la card del modelo fuente, sigue estrictamente las instrucciones del primer prompt sin relleno.
- Comportamiento sin censura: rechazos sustancialmente eliminados por diseño.

## Casos de uso

- Investigación sobre alineación y seguridad: este modelo permite estudiar el efecto de la abliteración comparando sus respuestas con las del modelo base Qwen3.5-9B ante los mismos prompts, en un entorno controlado y aislado.
- Procesamiento de documentos largos: la ventana de 1M tokens permite ingerir informes completos, expedientes o bases de código extensas en una sola pasada, con el coste de memoria subcuadrático que aporta la atención lineal.
- Análisis de imágenes con contexto textual largo: combinando la ruta de visión con la ventana extendida se pueden procesar capturas de pantalla, diagramas o documentos escaneados junto a su contexto completo.
- Generación de código en pipelines locales: desplegado con llama.cpp, puede integrarse en flujos de revisión o generación de código sin depender de servicios externos.
- Evaluación de robustez de filtros: al carecer de rechazos, sirve como contraste en pruebas de sistemas de moderación y clasificadores de seguridad.
- Experimentación con agentes y tool calling: la llamada a funciones nativa permite prototipar agentes que orquestan herramientas en local, útil para validar arquitecturas antes de migrar a modelos con garantías de producción.
- Cuantización y despliegue en hardware modesto: las variantes Q4_K permiten ejecutar un modelo de 9B con contexto largo en GPU de consumo, útil para pruebas de concepto de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo fine-tuneado ni de la cuantización en la información disponible. La model card incluye únicamente las puntuaciones del modelo base Qwen3.5-9B antes de cualquier ajuste, que no son representativas del modelo final:

| Benchmark | Qwen3.5-9B (base) |
|---|---|
| MMLU-Pro | 82.5 |
| MMLU-Redux | 91.1 |
| GPQA Diamond | 81.7 |
| IFEval | 91.5 |
| HMMT Feb 25 | 83.2 |
| LiveCodeBench v6 | 65.6 |
| OJBench | 29.2 |
| BFCL-V4 (tool calling) | 66.1 |
| TAU2-Bench | 79.1 |
| LongBench v2 | 55.2 |
| MMMLU (multilingüe) | 81.2 |
| WMT24++ (traducción) | 72.6 |

La propia model card advierte que el fine-tune se evaluó con un arnés distinto y más pequeño, por lo que estos números no deben atribuirse al modelo final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para una cuantización Q4_K de un modelo de ~9B se puede estimar en el rango de 6-8 GB de VRAM, pero la ventana de 1M tokens incrementa sustancialmente la memoria de caché KV.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar funcionamiento en A100, H100 y RTX 4090, pero no hay confirmación del autor.
- GPU de consumo: viable con las cuantizaciones más bajas (Q4_K) según el tamaño del modelo; el contexto extendido reducirá el margen disponible.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión los frontends basados en él como Ollama; el repo incluye el proyector de visión para esta ruta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mythos-5-Abliterated-9B (este) | ~9B | 1M (YaRN) | Apache 2.0 | Abliterado, sin benchmarks propios, 0 descargas |
| Qwen/Qwen3.5-9B | ~9B | 262K nativo | Apache 2.0 | Modelo base oficial, con benchmarks publicados, sin abliterar |
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M | ~9B | 1M (YaRN) | Apache 2.0 | Fine-tune fuente sin abliterar |
| huihui-ai/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated | ~9B | 1M (YaRN) | Apache 2.0 | Abliterado en safetensors, sin cuantizar |

No hay datos de rendimiento del fine-tune ni del modelo abliterado que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterado: los rechazos están sustancialmente eliminados, sin garantías de seguridad. Uso exclusivamente de investigación o experimental.
- Riesgo elevado de generar contenido dañino, inexacto o inapropiado, especialmente en dominios sensibles como seguridad, biomedicina o temas regulados.
- Riesgo de alucinación: no hay evaluaciones de fiabilidad del fine-tune; la cadena de derivaciones no incluye verificaciones de calidad publicadas.
- Idiomas soportados no documentados: el comportamiento multilingüe es una incógnita pese a heredar del modelo base.
- Sin benchmarks del modelo final: no se puede verificar si el fine-tune o la abliteración degradaron las capacidades originales.
- Licencia Apache 2.0 heredada, pero la naturaleza abliterada puede plantear problemas de cumplimiento en despliegues comerciales sujetos a políticas de contenido.
- Cero descargas y cero likes: no hay validación de la comunidad ni informes de uso independientes.
- La ventana de 1M tokens depende de YaRN con factor 4.0; el rendimiento real en contextos muy largos no está verificado.
- Repositorio de 49,1 GB: conviene descargar solo la cuantización necesaria y el proyector de visión por separado.
- La cadena de autoría (Empero, huihui-ai, ITLL) no implica afiliación con Anthropic ni con Alibaba/Qwen.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/ITLL/Mythos-5-Abliterated-9B-GGUF
- Modelo abliterado fuente: https://huggingface.co/huihui-ai/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated
- Fine-tune fuente: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de destilación (ansulev): https://huggingface.co/datasets/ansulev/claude-mythos-distilled-25k
- Dataset de destilación (Manusagents): https://huggingface.co/datasets/Manusagents/GPT-5.5-Gemini-3.1-Pro-Grok-4-Claude-Fable-5-Mythos-5-Qwen-3.7-Max-and-more-Distillation-Dataset
- Dataset de salidas (thetrillioniar): https://huggingface.co/datasets/thetrillioniar/Mythos-5-and-Fabel-5-Class-Model-Outputs
