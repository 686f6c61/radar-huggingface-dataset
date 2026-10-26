# jaydeepb/qwen2.5-1.5b-pg19-run2

## Resumen

`jaydeepb/qwen2.5-1.5b-pg19-run2` es un artefacto de investigación publicado por el usuario jaydeepb: un ajuste fino de `Qwen/Qwen2.5-1.5B` durante una época sobre una muestra de 1 millón de secuencias del corpus PG-19. No es un modelo de propósito general ni un asistente conversacional, sino la "Run 2" (la ejecución de evaluación retenida) del trabajo *Predicting Memorization Before Fine-Tuning Language Models*, en el que se entrenan clasificadores que predicen, a partir de características del modelo base antes del ajuste fino, qué secuencias memorizará literalmente el modelo resultante.

Su relevancia es metodológica: sirve como objeto de estudio reproducible de memorización verbal (verbatim memorization) de datos de entrenamiento. El propio autor advierte que el modelo puede reproducir fragmentos de su corpus de ajuste fino, lo que lo convierte en una herramienta útil para investigar extracción de datos, privacidad y contaminación de benchmarks, y no en un componente apto para producción.

El modelo cuenta con 1.543.714.304 parámetros (1,54 B), un repositorio de 3,1 GB en safetensors y licencia Apache 2.0, heredada del modelo base. No registra descargas ni valoraciones en el momento de la consulta, lo que es coherente con su naturaleza de artefacto académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base `Qwen/Qwen2.5-1.5B`); el número de capas y cabezas no se detalla en la model card |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-1.5B declara 32.768 tokens nativos |
| Tipos de cuantización | No se publican cuantizaciones propias (solo safetensors); al derivar de Qwen2.5-1.5B admite conversiones a GGUF, AWQ o GPTQ realizadas por terceros |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB, tamaño consistente con pesos en bf16/fp16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B`, un transformer decoder-only denso con 1,54 B de parámetros, y se ajusta durante una única época sobre una muestra de 1 millón de secuencias de PG-19, un corpus de libros de dominio público (anteriores a 1919) extraídos de Project Gutenberg. Se trata, por tanto, de un ajuste fino de tipo continued pretraining sobre texto literario en crudo, no de un alineamiento con instrucciones: la model card no menciona RLHF, DPO ni SFT supervisado con pares pregunta-respuesta, pese a que el repositorio lleve la etiqueta `conversational`.

El detalle técnico central no es la arquitectura sino el protocolo experimental: la ejecución "Run 2" es la que el paper utiliza para evaluar clasificadores entrenados con características del modelo base (pre-ajuste fino) que predicen qué secuencias serán memorizadas de forma literal. La model card no especifica el número total de tokens vistos, la composición exacta del subconjunto de PG-19 ni hiperparámetros de entrenamiento (tasa de aprendizaje, longitud de secuencia, precisión); esos datos habría que buscarlos en el artículo. Tampoco se documentan innovaciones arquitectónicas propias: las únicas particularidades del modelo base reseñables son las habituales de Qwen2.5 (RoPE, SwiGLU, RMSNorm y atención con query/key-value heads agrupadas), que no se verifican en esta ficha por no aparecer en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base y sesgada hacia el registro literario de PG-19.
- Reproducción literal (memorización verbal) de porciones del corpus de ajuste fino, que es precisamente la propiedad bajo estudio.
- Predicción de siguiente token sobre texto largo, apta para experimentos de modelado de lenguaje y perplejidad.
- Soporte de inferencia estándar vía `transformers` (etiqueta `text-generation`) y compatibilidad declarada con Text Generation Inference y endpoints.
- Capacidades de tool calling, function calling, agentes y razonamiento multi-paso: no disponibles ni documentadas en esta model card.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Soporte multilingüe: no documentado; la model card no declara idiomas.

## Casos de uso

- Reproducibilidad de resultados de memorización: cargar el modelo con los mismos prompts del paper *Predicting Memorization Before Fine-Tuning Language Models* para verificar qué secuencias de PG-19 se emiten de forma literal y comparar con las predicciones de los clasificadores publicados.
- Evaluación de clasificadores de memorización: usar el modelo como oráculo de ground truth (¿memoriza o no esta secuencia?) para medir precisión y recall de clasificadores que solo ven características del modelo base.
- Estudio de ataques de extracción de datos: lanzar prompts de prefijo o plantillas de continuación sobre pasajes conocidos de PG-19 para cuantificar la tasa de extracción verbatim y calibrar defensas de privacidad.
- Investigación en contaminación de benchmarks: comprobar si obras literarias concretas presentes en PG-19 aparecen en evaluaciones posteriores y si el modelo las reproduce, lo que permite discutir solapamientos entre corpus de entrenamiento y de evaluación.
- Docencia y divulgación sobre fuga de datos en LLM: al ser un modelo de 1,54 B y licencia Apache 2.0, se puede desplegar en un portátil o en una GPU de consumo para demostraciones prácticas de memorización en directo.
- Herramientas de auditoría de pipelines de datos: emplear el modelo como caso de prueba límite en sistemas que detectan duplicados, PII o contenido con copyright en corpus de entrenamiento, validando que el detector señala las secuencias efectivamente memorizadas.
- Experimentos de ajuste fino comparativos: servir de línea base "una época sobre corpus X" frente a otras ejecuciones (Run 1, otros corpus u otros tamaños) para aislar el efecto del volumen de datos en la memorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad en PG-19 ni ninguna otra métrica cuantitativa, y el repositorio no registra evaluaciones asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo de pesos, más caché KV y activaciones; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en 8 bits: en torno a 1,6-2,5 GB. En 4 bits: en torno a 0,9-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) es suficiente; para servicio con concurrencia y contexto de 32.768 tokens conviene una L4, A10G, A100 o H100.
- Cabe en GPU de consumo: sí, de forma holgada en 8 GB en bf16 y en 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada en el repositorio), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama es necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaydeepb/qwen2.5-1.5b-pg19-run2` | 1,54 B | No especificado en la model card (base: 32.768) | Artefacto de investigación sobre memorización | Apache 2.0 | HuggingFace, safetensors |
| `Qwen/Qwen2.5-1.5B` (modelo base) | 1,54 B | 32.768 tokens | Modelo de lenguaje base para continuación de texto | Apache 2.0 | HuggingFace, safetensors |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 tokens | Asistente alineado con instrucciones, uso conversacional | Apache 2.0 | HuggingFace, safetensors y múltiples cuantizaciones de la comunidad |

Frente al modelo base, este artefacto intercambia capacidades generales por un sesgo fuerte hacia el dominio literario de PG-19 y por la propiedad de memorización buscada; frente a la variante Instruct, carece de alineamiento y no debe emplearse como asistente. No se dispone de datos de rendimiento comparativo entre las tres variantes en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de memorización y fuga de datos: el autor advierte explícitamente de que el modelo puede reproducir porciones de su corpus de ajuste fino de forma literal. No debe tratarse como modelo seguro para exposición pública sin filtros de salida.
- Alucinación: al ser un modelo de lenguaje sin alineamiento, puede generar continuaciones plausibles pero falsas, especialmente fuera del dominio literario.
- Pérdida de capacidades generales: el ajuste fino de una época sobre un corpus muy específico degrada previsiblemente el seguimiento de instrucciones y el conocimiento general del modelo base. No hay evaluación publicada que lo cuantifique.
- Idiomas: la model card no declara idiomas soportados; PG-19 es un corpus en inglés, por lo que el comportamiento en castellano es incierto y no está evaluado.
- Etiqueta engañosa: el repositorio incluye la etiqueta `conversational`, pero el entrenamiento descrito no es conversacional ni con alineamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se publica como artefacto de investigación para reproducibilidad; no hay garantías de calidad ni soporte, y su uso en producción no está recomendado.
- Adopción nula: cero descargas y cero valoraciones en el momento de la consulta, sin issues ni documentación adicional en el repositorio.
- Ausencia de cuantizaciones oficiales: no se publican GGUF ni variantes de 4 u 8 bits, lo que obliga a convertirlas uno mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-pg19-run2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de referencia: *Predicting Memorization Before Fine-Tuning Language Models* (título citado en la model card; no se ha encontrado el enlace en la información disponible)
- Corpus PG-19: no se ha encontrado enlace en la información disponible
- Repositorio de código o demo: no disponible
