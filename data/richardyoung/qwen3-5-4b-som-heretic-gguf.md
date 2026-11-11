# richardyoung/Qwen3.5-4B-SOM-heretic-GGUF

## Resumen

Qwen3.5-4B-SOM-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.5-4B-SOM-heretic, una versión "abliterada" (con el comportamiento de rechazo eliminado) del modelo base Qwen/Qwen3.5-4B. El autor, Richard J. Young, la ha generado con Heretic 2.0, una herramienta que aplica ablación multidireccional mediante mapas autoorganizados (SOM) para suprimir la dirección de rechazo en el espacio de activaciones del transformer. El modelo resultante es un transformer denso de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones).

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigación sobre eliminación de rechazos y su medición: el modelo forma parte del estudio comparativo del autor sobre la dificultad creciente de la abliteración en distintas familias de modelos. Por otro, ofrece una versión cuantizada y ligera (Q4_K_M de 2,7 GB) que puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, lo que la hace accesible para experimentación local.

No se trata de un asistente de propósito general: el autor lo publica explícitamente para investigación sobre abliteración, su evaluación y las defensas frente a ella. El modelo cumple muchas peticiones que el original rechaza, con una tasa de rechazo medida del 21,9% frente al 88,5% del original sobre 972 prompts dañinos reservados, según los datos del paper. La compilación GGUF es solo texto: el proyector de visión del modelo base no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B); no se detalla la variante interna en la informacion disponible |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; en preparacion IQ3_M, IQ4_XS, Q5_K_M, Q6_K; incluye importance matrix (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,2 mil millones de parámetros, derivado de Qwen3.5-4B. La modificación respecto al original no consiste en un reentrenamiento, sino en una ablación de direcciones en el espacio de activaciones: Heretic 2.0 aplica una ablación multidireccional guiada por mapas autoorganizados (SOM), un plug-in del fork de Heretic empleado en el estudio del autor. El objetivo es eliminar la dirección o direcciones responsables del comportamiento de rechazo sin degradar en exceso el resto de capacidades.

El proceso de selección descrito en el paper es una búsqueda de 100 ensayos que elige la configuración con menos rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. La configuración seleccionada presenta 10 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,055. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición de su dataset, ya que la model card no los detalla.

Los archivos GGUF se generaron a partir de los safetensors publicados del modelo abliterado (revisión 7349d8b6b63d, con verificación SHA-256 de cada archivo de pesos) mediante llama.cpp (commit 468fde9): conversión con `convert_hf_to_gguf.py --outtype bf16` y posterior cuantización con `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de text-generation.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B.
- Comportamiento de rechazo suprimido: cumple muchas peticiones que el modelo original rechaza (tasa de rechazo del 21,9% frente al 88,5% del original en la evaluación del paper sobre el modelo en bf16).
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp / Ollama.
- Solo texto: el proyector de visión del modelo base no está incluido en esta compilación GGUF, por lo que no procesa imágenes.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking ni audio.

## Casos de uso

- Investigación sobre abliteración: evaluar la eficacia de la eliminación de rechazos y comparar la tasa de rechazo del modelo cuantizado frente a la del bf16 documentada en el paper, usando los mismos conjuntos de prompts.
- Estudio de defensas frente a la abliteración: emplear el modelo como artefacto adversario para probar clasificadores de seguridad, jueces automáticos (por ejemplo, WildGuard) o filtros de salida en pipelines de moderación.
- Experimentación local en hardware de consumo: ejecutar la variante Q4_K_M (2,7 GB) con Ollama o llama.cpp en equipos sin GPU dedicada o con GPU de gama media, gracias a su tamaño reducido.
- Análisis de degradación por cuantización: comparar el comportamiento de Q4_K_M frente a Q8_0 para medir cómo la cuantización altera la tasa de rechazo y la calidad de las respuestas, un aspecto que el autor advierte que no fue evaluado en el paper.
- Reproducibilidad de estudios: verificar las sumas SHA-256 de `SHA256SUMS` y reproducir la conversión y cuantización descritas en la model card para auditar el proceso.
- Generación de texto en inglés sin restricciones de contenido para entornos controlados de investigación, siempre que el uso sea lícito y se asuma la responsabilidad por parte del usuario.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo en precisión completa (bf16) y provienen del paper del autor, no de la compilación GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juez WildGuard) | 88,5% | 21,9% (213/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 10 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,055 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para el modelo base ni para la versión abliterada. Los archivos cuantizados de este repositorio no fueron evaluados en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB para Q4_K_M y 4,5 GB para Q8_0, más el overhead de contexto y de la propia aplicación.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar Q4_K_M; Q8_0 requiere alrededor de 6 GB para operar con holgura.
- GPU recomendadas: no hay requisitos específicos documentados; por tamaño, RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para servir varias peticiones concurrentes conviene una GPU con más memoria.
- Despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen3.5-4B-SOM-heretic-GGUF:Q4_K_M`), Ollama (`ollama run richardyoung/qwen3.5-4b-som-heretic` o `ollama run hf.co/richardyoung/Qwen3.5-4B-SOM-heretic-GGUF:Q4_K_M`). No se documentan opciones con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-SOM-heretic-GGUF (este) | 4,2 mil millones | no disponible | apache-2.0 | GGUF | Abliterado con Heretic 2.0 (SOM); rechazo del 21,9% en bf16 |
| Qwen3.5-4B (original) | 4,2 mil millones (derivado) | no disponible | apache-2.0 | safetensors | Modelo base con comportamiento de rechazo estándar (88,5%) |
| richardyoung/Qwen3.5-4B-SOM-heretic | 4,2 mil millones | no disponible | apache-2.0 | safetensors | Versión en precisión completa del mismo modelo abliterado |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otras alternativas de la misma categoría, por lo que la comparación se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente de propósito general: el autor lo publica para estudiar la eliminación de rechazos y las defensas frente a ella, no para uso como asistente cotidiano.
- Riesgo de contenido dañino: el modelo cumple muchas peticiones que el original rechaza; la tasa de rechazo del 21,9% implica que puede producir contenido que el modelo base bloquearía.
- La cuantización puede alterar el comportamiento de rechazo: los archivos GGUF no fueron evaluados en el paper y los números publicados corresponden al bf16.
- Solo texto: el proyector de visión no está incluido; el modelo base acepta imágenes pero esta compilación no.
- Idioma: soporte declarado únicamente en inglés (`en`); no se documentan capacidades multilingües.
- Longitud de contexto: no disponible en la información proporcionada.
- Sesgos y alucinaciones: no se documentan sesgos específicos ni tasas de alucinación; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, no descritos en la model card.
- Licencia: apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso lícito.
- Divergencia respecto al original: la KL de primer token de 0,055 indica un cambio medible en la distribución de salida que puede afectar a la calidad en tareas generales, aunque el autor la considera aceptable dentro de su criterio de selección.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper citado: Richard J. Young, *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors* (enlace de arXiv pendiente de añadir según la model card)
