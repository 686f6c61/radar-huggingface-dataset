# mradermacher/limite-1b-violetto-GGUF

## Resumen

Limite 1B - Violetto es el primer modelo publicado por Paradigma, un transformer autoregresivo denso de aproximadamente 1.035 millones de parámetros (1B) entrenado desde cero con menos de 300.000 millones de tokens altamente curados. Está especializado en la resolución de problemas matemáticos difíciles con un enfoque de alto rendimiento (high-throughput), resolviendo un problema cada vez. El modelo ha pasado por preentrenamiento, ajuste supervisado (SFT) y aprendizaje por refuerzo (RL).

La ficha que nos ocupa corresponde a la cuantización GGUF realizada por mradermacher sobre el modelo base `paradigma-inc/limite-1b-violetto`, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El repositorio incluye 12 variantes de cuantización desde Q2_K hasta f16, con tamaños que van de 0,6 GB a 2,2 GB.

Es relevante porque ofrece un modelo de razonamiento matemático de tamano reducido, con licencia Apache 2.0 y pesos en GGUF listos para desplegar en hardware de consumo, algo poco habitual en la categoría de modelos matemáticos especializados. No obstante, la información pública sobre arquitectura detallada, contexto y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo denso |
| Parametros totales | 1.035.879.372 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona "secuencias largas" sin cifra concreta) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

Limite 1B - Violetto es un transformer autoregresivo denso de 1B de parámetros, entrenado desde cero (no es un fine-tuning de otro modelo). El preentrenamiento se realizó sobre una mezcla de menos de 300.000 millones de tokens "altamente curados", seguido de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL). El objetivo declarado es la resolución de problemas matemáticos difíciles con alta frecuencia de uso, resolviendo un problema por inferencia.

La model card no detalla la composición exacta del dataset, la longitud de contexto nativa, ni hiperparámetros de entrenamiento (número de pasos, batch size, algoritmo de RL). Tampoco se especifica si se emplearon innovaciones como decodificación especulativa o atención lineal. La información disponible sobre arquitectura interna es, por tanto, mínima.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en resolver problemas matemáticos difíciles, uno por inferencia.
- Razonamiento multi-paso: entrenado con RL para problemas que requieren cadenas de razonamiento.
- Conversacional: etiquetado como "conversational" en Hugging Face.
- Compatible con vLLM (etiqueta `vllm` en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Resolución automatizada de problemas matemáticos: el modelo está diseñado para procesar un problema matemático por inferencia, lo que lo hace adecuado para pipelines de evaluación o generación de soluciones paso a paso en entornos educativos o de investigación.
- Generación de datasets matemáticos sintéticos: al ser un modelo de 1B con licencia Apache 2.0, puede usarse para generar problemas y soluciones a gran escala sin restricciones de licencia comercial.
- Asistente de matemáticas en local: con cuantizaciones Q4_K_M (0,8 GB) puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo razonamiento matemático offline.
- Integración en pipelines de CI/CD para verificación matemática: su compatibilidad con vLLM permite desplegarlo como servicio de alto throughput para validar o resolver expresiones en flujos automatizados.
- Prototipado de agentes de razonamiento: al ser un modelo pequeño y conversacional, sirve como base para experimentar con cadenas de razonamiento y RL antes de escalar a modelos mayores.
- Investigación en entrenamiento desde cero: al ser un modelo de 1B entrenado con menos de 300B tokens, es un caso de estudio útil para analizar la eficiencia de datos en tareas matemáticas.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K y Q3_K (0,6-0,7 GB) permiten inferencia en dispositivos con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~0,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~0,6-0,7 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~0,7-0,8 GB
  - Q5_K_S / Q5_K_M: ~0,8-0,9 GB
  - Q6_K: ~1,0 GB
  - Q8_0: ~1,2 GB
  - f16: ~2,2 GB
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones menores. Para despliegue con vLLM se recomienda una GPU con soporte de FP16/BF16 (por ejemplo, A100, H100, RTX 4090) aunque el modelo es lo bastante pequeño para GPUs de gama media.
- Cabe en GPU de consumo: sí, cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (etiqueta en la model card), transformers. El autor menciona que no ha generado cuantizaciones con imatrix/weighted.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| Limite 1B - Violetto (GGUF) | 1,03B | no disponible | Apache 2.0 | GGUF | Matemáticas |
| Qwen2.5-Math-1.5B | 1,5B | 4K (típico) | Apache 2.0 | safetensors, GGUF | Matemáticas |
| DeepSeek-Math-7B | 7B | 4K (típico) | MIT (con restricciones) | safetensors | Matemáticas |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Propósito general |

Nota: los datos de los modelos comparativos son orientativos y pueden variar; no se dispone de benchmarks de Limite 1B - Violetto para comparar rendimiento real.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo en inglés, puede tener sesgos lingüísticos y culturales.
- Riesgo de alucinación: inherente a los modelos generativos; en matemáticas puede producir razonamientos plausibles pero incorrectos.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `paradigma-inc/limite-1b-violetto` (también Apache 2.0 según la información disponible).
- Caveats para producción: el modelo resuelve un problema por inferencia, no está pensado para conversaciones multi-turno complejas; las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; no hay benchmarks publicados que permitan estimar su rendimiento real frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/limite-1b-violetto-GGUF
- Modelo base: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Repositorio GitHub: https://github.com/paradigma-inc/limite-violetto
- Página de descargas del cuantizador: https://hf.tst.eu/model#limite-1b-violetto-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
