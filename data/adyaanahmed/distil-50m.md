# adyaanahmed/distil-50m

## Resumen

distil-50m es un modelo de lenguaje decoder-only de 51,5 millones de parámetros entrenado desde cero mediante destilación de conocimiento (knowledge distillation). El autor es adyaanahmed y el modelo profesor es Qwen2.5-0.5B, aproximadamente diez veces más grande. El alumno se entrena sobre unos 1.000 millones de tokens, lo que supone 19 tokens por parámetro, y posteriormente recibe un ajuste fino de instrucciones destilado de Qwen2.5-0.5B-Instruct. Todo el entrenamiento se realizó en 2 GPU Tesla T4 del tier gratuito de Kaggle, con un total de 66,2 GPU-horas.

El modelo sigue un diseño profundo y estrecho de estilo MobileLLM: 18 capas con una dimensión de modelo de 512, atención grouped-query con 8 cabezas de consulta y 2 de clave/valor, FFN SwiGLU de tamaño oculto 1280, RoPE con theta 10.000, RMSNorm y embeddings factorizados y atados de 32.768 x 128 proyectados a 512. La longitud de contexto es de solo 512 tokens y el vocabulario de 32.768 entradas es un subconjunto de los tokens más útiles de Qwen2.5.

Es relevante ahora como proyecto de investigación y aprendizaje que demuestra hasta dónde se puede llevar la destilación con recursos mínimos: un modelo fluido en inglés, de 99 MB en fp16, que cabe en CPU y que documenta de forma transparente sus métricas held-out (bits per byte) y sus benchmarks zero-shot frente al profesor. No está pensado para producción: el propio autor advierte que inventa hechos y no sabe aritmética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MobileLLM-style, profundo y estrecho) con GQA, SwiGLU, RoPE y RMSNorm |
| Parametros totales | 51.532.544 (47,2M en bloques transformer + 4,3M en embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16, 99 MB por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 18 capas y d_model 512, siguiendo el patrón profundo y estrecho popularizado por MobileLLM. La atención es grouped-query con 8 cabezas de consulta, 2 cabezas de clave/valor, dimensión de cabeza 64 y QK-norm por cabeza; esto reduce la caché KV a 9 KB por token en fp16, es decir, 4,5 MB para un contexto completo de 512 tokens y 4 veces menos que una atención multi-head completa. La FFN usa SwiGLU con tamaño oculto 1280, la codificación posicional es RoPE con theta 10.000 y la normalización es RMSNorm. Los embeddings están factorizados y atados: matriz de 32.768 x 128 proyectada hacia arriba hasta 512. El coste computacional estimado es de unos 0,1 GFLOPs por token generado.

El entrenamiento combina destilación y preentrenamiento supervisado. La pérdida de destilación es `0,7 x T^2 x KL(profesor || alumno) + 0,3 x cross-entropy` con T = 1, restringiendo los logits del profesor al subconjunto de vocabulario del alumno. Los datos de preentrenamiento suman aproximadamente 1,02B tokens: en torno al 64% de Cosmopedia v2 (texto sintético estilo libro de texto) y 36% de FineWeb-Edu con score educativo igual o superior a 3; se vieron 0,98B tokens, cerca de una época. El optimizador es Muon para los pesos 2-D del transformer y AdamW para el resto, con learning rate pico de 1,5e-3, 400 pasos de warmup, una fase plana y decaimiento 1-sqrt durante el 20% final. Se realizaron 15.000 pasos de 65.536 tokens cada uno en fp16 con loss scaling y DDP sobre 2 GPU. El ajuste de instrucciones consistió en 3.996 pasos sobre 150.000 primeros intercambios de smol-smoltalk, con pérdida destilada de Qwen2.5-0.5B-Instruct (alpha 0,5). El cómputo total fue de 60,5 GPU-horas T4 para preentrenamiento más 5,7 para instrucciones, es decir, 66,2 GPU-horas repartidas en varias sesiones de Kaggle con reanudación desde checkpoints.

## Capacidades

- Generación de texto en inglés con estilo fluido y continuaciones coherentes a corto plazo.
- Continuación de texto en bruto con el checkpoint `student_pretrained.safetensors`.
- Conversación de un solo turno con el checkpoint `student_chat.safetensors`, usando el formato `### Question:\n{query}\n\n### Answer:\n`.
- Respuestas a preguntas de conocimiento general en estilo correcto, aunque con fiabilidad factual baja.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe nula más allá del inglés: el vocabulario es un subconjunto de Qwen2.5 y el texto fuera de los 32.767 tokens conservados se mapea a UNK.
- No hay memoria conversacional: cada petición es independiente y el contexto máximo es de 512 tokens.

## Casos de uso

- Investigación educativa sobre destilación: reproducción del pipeline profesor-alumno con Qwen2.5-0.5B como profesor para estudiar curvas de bits per byte y agreement top-1 en distintos dominios (Cosmopedia, FineWeb-Edu, WikiText).
- Experimentos de arquitectura eficiente: banco de pruebas para variantes profundas y estrechas con GQA, embeddings factorizados y caché KV reducida (9 KB por token), comparando coste y calidad frente a transformers anchos.
- Generación de texto creativo breve y prototipos de autocompletado en inglés, donde la fluidez estilística importa más que la exactitud factual y el contexto cabe en 512 tokens.
- Despliegue en CPU y dispositivos de recursos muy limitados: los 99 MB en fp16 permiten ejecutar el script `chat_local.py` con salida en streaming sin GPU, útil para demos docentes y entornos embebidos.
- Filtrado y clasificación preliminar de texto por estilo: usar la perplejidad o bits per byte del modelo como señal barata para detectar texto sintético tipo Cosmopedia frente a texto educativo web.
- Estudio de ajuste de instrucciones en modelos minúsculos: analizar el coste en benchmarks (por ejemplo, la caída de ARC-Easy de 45,1 a 41,9 y de LAMBADA de 23,0 a 16,3 tras el SFT) y calibrar penalizaciones de repetición y temperatura.
- Base para ablaciones de tokenizador: el mapeo `vocab.json` entre el vocabulario de 32.768 entradas y los ids de Qwen2.5 permite estudiar el impacto de recortar vocabulario y del token UNK.

## Benchmarks y rendimiento

Resultados held-out en bits per byte (menor es mejor; comparable entre tokenizadores):

| Conjunto | Alumno (distil-50m) | Profesor (Qwen2.5-0.5B) | Ratio alumno/profesor |
|---|---|---|---|
| Cosmopedia | 0,666 | 0,572 | 1,16x |
| FineWeb-Edu | 1,078 | 0,835 | 1,29x |
| WikiText (fuera de dominio) | 1,270 | 0,905 | 1,40x |

Acuerdo con la predicción top-1 del profesor: 66% (Cosmopedia), 60% (FineWeb-Edu), 57% (WikiText).

Benchmarks zero-shot con 1.000 ejemplos cada uno (margen aproximado de ±1,5 puntos):

| Benchmark | Base (preentrenado) | Chat (tras SFT) | Azar |
|---|---|---|---|
| ARC-Easy (acc_norm) | 45,1 | 41,9 | 25 |
| SciQ (acc) | 67,4 | 62,0 | 25 |
| HellaSwag (acc_norm) | 30,6 | 29,6 | 25 |
| LAMBADA (acc) | 23,0 | 16,3 | 0 |

El autor indica que las cifras de benchmark deben citarse para el modelo base, ya que el ajuste de instrucciones degrada la precisión en benchmarks, como suele ocurrir en modelos pequeños. La exportación a fp16 altera la cross-entropy held-out en menos de 0,0001 respecto al checkpoint fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp16 (99 MB de pesos más activaciones y caché KV de 4,5 MB para 512 tokens); en CPU basta con RAM convencional.
- GPU recomendadas: innecesarias para inferencia; cualquier GPU consumer (RTX 3060, RTX 4090) sobra ampliamente. El entrenamiento se realizó en 2 Tesla T4.
- Cabe en cualquier GPU consumer y también en CPU y dispositivos de baja memoria; el script `chat_local.py` está pensado para CPU con streaming.
- Opciones de despliegue: PyTorch nativo con safetensors y tokenizers (flujo documentado); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput: no se han publicado cifras medidas; el autor estima unos 0,1 GFLOPs por token generado, lo que sitúa el coste por token muy por debajo de modelos de centenares de millones de parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| distil-50m | 51,5M | 512 | Apache-2.0 | Hugging Face (safetensors fp16) | Destilado de Qwen2.5-0.5B; solo inglés; sin benchmarks publicados frente a pares |
| Qwen2.5-0.5B (profesor) | ~0,5B | no disponible en la información proporcionada | Apache-2.0 | Hugging Face | 10x más grande; sirve como referencia de calidad (bits per byte y top-1 agreement) |
| Modelos MobileLLM-style de ~50M | no disponible | no disponible | no disponible | no disponible | La ficha no aporta datos comparativos de benchmarks frente a esta familia |

No se dispone en la información proporcionada de resultados de benchmarks comparativos directos con otras alternativas de tamaño similar; la única comparación cuantitativa disponible es frente al modelo profesor Qwen2.5-0.5B.

## Limitaciones y advertencias

- Fiabilidad factual muy baja: responde con el estilo adecuado pero inventa detalles; el autor cita errores como explicar la lluvia como "actividad tectónica" o atribuir mal la autoría de *Romeo y Julieta*.
- Sin aritmética ni razonamiento: HellaSwag está cerca del azar (30,6 en base, 29,6 en chat) y LAMBADA cae a 16,3 tras el ajuste de instrucciones.
- Contexto muy corto (512 tokens) y conversación de un solo turno, sin memoria entre peticiones.
- Repetición en salidas largas: el autor recomienda penalización de repetición en torno a 1,15 y temperatura entre 0,4 y 0,6.
- Solo inglés, entrenado con texto sintético y web educativo; no ha pasado por ajuste de seguridad ni red-teaming. El autor desaconseja explícitamente usarlo para cualquier cosa importante.
- Tokenizador de Qwen2.5 con vocabulario recortado: el texto fuera de los 32.767 tokens conservados se descarta y se mapea a UNK, lo que puede degradar entradas con caracteres o idiomas no cubiertos.
- Licencia Apache-2.0 para los pesos, pero se pide atribución al equipo de Qwen y a los datasets Hugging Face (Cosmopedia v2, smol-smoltalk y FineWeb-Edu, este último bajo ODC-By 1.0).
- Proyecto de investigación y aprendizaje sin mantenimiento ni garantías de producción; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adyaanahmed/distil-50m
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo profesor ajustado a instrucciones: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Artículo de referencia sobre destilación de modelos: https://www.taskade.com/wiki/ai/model-distillation
