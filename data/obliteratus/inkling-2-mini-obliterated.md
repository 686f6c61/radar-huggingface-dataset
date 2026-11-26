# OBLITERATUS/Inkling-2-Mini-OBLITERATED

## Resumen

Inkling-2-Mini-OBLITERATED es una variante "abliterated" (con el mecanismo de rechazo suprimido mediante intervención sobre los pesos) del modelo Inkbot-AI/Inkling-2-Mini, publicada por el usuario OBLITERATUS. El modelo base es un transformer con arquitectura MoE "looped" (con bucle de capas) de 26.070.385.152 parámetros totales (26,1B), 24 capas y 128 expertos con top-8 activos. Esta versión aplica una cirugía de proyección de rango 2 sobre los pesos de salida de atención, con escalado adaptado a las zonas del bucle, para eliminar la dirección de rechazo del modelo.

El interés de esta ficha es doble: por un lado, documenta un modelo derivado que prioriza la respuesta directa sobre el comportamiento de rechazo; por otro, sirve como ejemplo técnico de las técnicas de abliteration aplicadas a arquitecturas no convencionales (MoE con bucle de capas), un caso poco habitual en la literatura. La distribución se realiza principalmente como GGUF cuantizado IQ4_NL (14 GB, 4,69 BPW) y requiere un fork específico de llama.cpp (Inkling-2-Loop) para funcionar, ya que la implementación estándar no soporta la arquitectura.

La licencia es "other" (no estándar), no se declaran idiomas soportados y el modelo no cuenta con descargas ni valoraciones en el momento de la consulta. Su relevancia actual es limitada y de nicho: interesa a quienes investigan técnicas de modificación de pesos, evaluación de robustez de salvaguardas y despliegue de modelos MoE con bucle en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (looped MoE): 24 capas, bucle sobre capas 6-17 × 3 pasadas, 128 expertos top-8 |
| Parametros totales | 26.070.385.152 (26,1B) |
| Parametros activos | no disponible (top-8 de 128 expertos; el número exacto de parámetros activos no se publica) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `-c 4096`) |
| Tipos de cuantizacion | IQ4_NL (4,69 BPW, 14 GB); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | other (no estándar) |
| Formato de pesos | GGUF (pesos originales en safetensors según metadatos del repo) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea un transformer con bucle de capas: 24 capas en total, de las cuales las capas 6 a 17 se ejecutan tres veces (tres pasadas del núcleo del bucle), con 128 expertos por capa MoE y enrutamiento top-8. Esta estructura híbrida entre profundidad efectiva y reutilización de parámetros reduce el coste paramétrico frente a un modelo denso de profundidad equivalente, a costa de una implementación de inferencia más compleja.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La intervención de OBLITERATUS consiste en una proyección de rango 2 en el subespacio tardío de los pesos de salida de atención, con escalado diferenciado por zonas: capas 4-5 con escala 4,0 (Δ relativo 11-12%), núcleo del bucle 6-17 con escala 2,5 (Δ 7-8%), coda 18-21 con escala 4,0 (Δ 11-12%) y capas finales 22-23 omitidas (Δ 0%). La omisión de las dos últimas capas es la decisión clave para preservar la coherencia de la salida. Como efecto secundario, el modo de razonamiento (thinking/CoT) queda desactivado y el modelo responde directamente en modo chat. El repositorio incluye además `uncensor.py`, un script de "retraction cutoff" que detiene la generación cuando el modelo empieza a retractarse, capturando aproximadamente el 28% de respuestas que de otro modo terminarían en un descargo de responsabilidad.

## Capacidades

- Generación de texto conversacional en modo chat directo, sin cadena de pensamiento (el modo thinking queda desactivado por la cirugía).
- Respuesta directa a peticiones que el modelo base rechazaría, al haberse eliminado la dirección de rechazo en las capas 4-21.
- Razonamiento y conocimiento general heredados del modelo base (no se documentan evaluaciones específicas de estas capacidades en esta variante).
- Soporte de plantilla de chat vía `--jinja` en llama-server y endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Capacidad de "retraction cutoff" mediante script externo para maximizar la tasa de respuestas sustantivas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües explícitas.

## Casos de uso

- Investigación sobre alineación y salvaguardas: el modelo permite estudiar empíricamente cómo la abliteration afecta a la tasa de rechazo (86,8% en modo puro, 96,9% con retraction cutoff según la evaluación del autor) y comparar con el modelo stock, sirviendo como banco de pruebas para metodologías de red-teaming.
- Evaluación de robustez de clasificadores y filtros: al generar respuestas que el modelo base rechazaría, se puede usar para probar la eficacia de capas de moderación externas en pipelines de producción.
- Análisis de arquitecturas MoE con bucle: el fork Inkling-2-Loop y el GGUF cuantizado permiten experimentar con inferencia local de arquitecturas no estándar en llama.cpp, un caso de estudio útil para ingeniería de runtimes.
- Desarrollo de técnicas de modificación de pesos: la receta de proyección por zonas (escalas y capas omitidas) documentada en la model card sirve como referencia reproducible para aplicar abliteration a otras arquitecturas con bucle.
- Despliegue local de un modelo de 26B en hardware de consumo: con 14 GB de GGUF IQ4_NL y ~16 GB de RAM, puede servirse en una estación de trabajo con GPU consumer para experimentación offline sin dependencia de APIs.
- Estudio de la "retracción" como fenómeno de generación: el script `uncensor.py` y la observación de que el modelo responde y luego se retracta permiten analizar patrones de descargo de responsabilidad en modelos modificados.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son la tasa de respuesta ("ANSWER") sobre 740 prompts, evaluada con llama-3.3-70b como juez vía la API de Venice, con temperatura 0:

| Configuracion | ANSWER (740 prompts) |
|---|---|
| Stock (thinking ON) | 0,0% |
| Stock + retraction cutoff | 83,8% |
| Abliterated (puro, sin trucos) | 86,8% |
| Abliterated + retraction cutoff | 96,9% |

El propio autor advierte que el juez LLM infla las puntuaciones en respuestas forzadas por prefill y estima, tras revisión manual, una tasa real de respuestas sustantivas de en torno al 85-90% para la configuración abliterated + retraction cutoff. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~16 GB de RAM para el GGUF IQ4_NL de 14 GB (4,69 BPW); con `-ngl all` la mayor parte de las capas puede residir en GPU.
- GPU recomendadas: no se especifican modelos concretos; el autor indica Metal (Apple Silicon) o CUDA como aceleración recomendada.
- GPU consumer: viable en tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 o equivalentes) al usar la cuantización IQ4_NL; en GPUs de 12 GB requeriría descarga parcial de capas a CPU.
- Opciones de despliegue: exclusivamente llama.cpp con el fork `inkling2-loop` (rama `inkling2-loop` del repositorio de pcuenca); llama.cpp estándar no soporta el modelo. Se sirve con `llama-server` y plantilla Jinja (`--jinja`), exponiendo un endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-OBLITERATED | 26,1B (MoE top-8, bucle) | no disponible | other | GGUF en HF | Variante abliterated; requiere fork de llama.cpp |
| Inkbot-AI/Inkling-2-Mini (base) | 26,1B (MoE top-8, bucle) | no disponible | no disponible | HF (modelo base) | Comportamiento de rechazo intacto; thinking disponible |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | ~28B | no disponible | no disponible | HF | Otra abliteration del mismo autor sobre arquitectura densa Qwen |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina el mecanismo de rechazo: el modelo puede producir contenido dañino, ilegal o inseguro sin filtros internos; no es apto para despliegues de cara al público sin moderación externa.
- El modo de razonamiento (thinking/CoT) está desactivado por la cirugía; se pierde la capacidad de cadena de pensamiento del modelo base.
- El modelo tiende a responder y después retractarse; sin el script de retraction cutoff, aproximadamente un 28% de respuestas terminarían en un descargo de responsabilidad, según el autor.
- La evaluación se basa en un juez LLM (llama-3.3-70b vía Venice) que infla las puntuaciones; la tasa real estimada manualmente es del 85-90%, no del 96,9%.
- Licencia "other" no estándar: es imprescindible revisar los términos antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no documentada; el ejemplo de servicio usa 4096 tokens, lo que limita casos de uso con contexto largo.
- Requiere un fork no estándar de llama.cpp (Inkling-2-Loop); no funciona con llama.cpp estándar, Ollama, vLLM ni TGI según la información disponible, lo que complica el despliegue en producción.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes); la reproducibilidad de los resultados no está verificada de forma independiente.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OBLITERATUS/Inkling-2-Mini-OBLITERATED
- Modelo base: https://huggingface.co/Inkbot-AI/Inkling-2-Mini
- Fork de llama.cpp con soporte Inkling-2-Loop: https://github.com/pcuenca/llama.cpp (rama `inkling2-loop`)
- Otra abliteration del mismo autor: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Space de OBLITERATUS: https://huggingface.co/spaces/pliny-the-prompter/obliteratus
- Artículo sobre OBLITERATUS (Clubic): https://www.clubic.com/actualite-603661-ce-petit-outil-open-source-peut-rendre-une-ia-totalement-sans-filtre.html
- Artículo sobre OBLITERATUS (David Informaticien): https://david-informaticien.com/blog/ia/3935-obliteratus-loutil-open-source-qui-supprime-definitivement-les-filtres-dune-ia
- Artículo sobre OBLITERATUS (Deep Dive): https://deep-dive.fr/obliteratus-loutil-qui-transforme-votre-llm-open-source-plutot-sage-en-veritable-psychopathe/
