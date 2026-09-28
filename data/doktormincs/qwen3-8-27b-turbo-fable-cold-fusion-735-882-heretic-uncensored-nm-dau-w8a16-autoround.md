# DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W8A16-AutoRound

## Resumen

Este repositorio es una cuantización de solo pesos en 8 bits (W8A16, int8 simétrico, group_size 128) del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicada por el usuario DoktorMincs. La cuantización se ha realizado con AutoRound a través de llm-compressor 0.14 y auto-round 0.15.1, con 400 iteraciones y 256 muestras de calibración, y se sirve mediante los kernels Marlin de vLLM. No se ha realizado entrenamiento, fine-tuning ni abliteración: se trata exclusivamente de una compresión de pesos, por lo que las características de comportamiento del modelo original (incluida su naturaleza "uncensored") se heredan sin cambios.

El modelo base es un fine-tune de 27.781.427.952 parámetros (~27,8 B) sobre la familia Qwen 3.8 27B, orientado a instrucciones generales, razonamiento, análisis, creatividad y generación de texto sin censura. La arquitectura es híbrida: `Qwen3_5ForConditionalGeneration` con 64 capas en proporción 3:1 entre atención lineal GatedDeltaNet y atención completa, una torre de visión ViT de 27 bloques y una capa MTP (Multi-Token Prediction) que habilita decodificación especulativa. El pipeline declarado es image-text-to-text, de modo que el modelo acepta entradas de imagen y vídeo además de texto.

La relevancia de esta ficha concreta está en su doble vertiente: por un lado, reduce el peso en disco de ~52 GB (BF16) a ~31,6 GB sin tocar la torre de visión ni la cabeza MTP; por otro, el autor publica una medición de perplejidad honesta que documenta una degradación del +5,91 % respecto al BF16, por encima del umbral del ~5 % habitualmente aceptado para cuantización de solo pesos, y advierte explícitamente de que la mejora respecto a las variantes de 4 y 6 bits es marginal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 64 capas, proporción 3:1 entre GatedDeltaNet de atención lineal y atención completa; torre de visión ViT de 27 bloques; 1 capa MTP) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens según la ficha del modelo base; el ejemplo de despliegue del autor configura `--max-model-len 32768` |
| Tipos de cuantizacion | W8A16 int8 simétrico, group_size 128, 400 iteraciones de AutoRound y 256 muestras de calibración; formato compressed-tensors `pack-quantized` (uint8b128). Torre de visión, cabeza MTP, `lm_head`, embeddings, normas, conv1d y proyecciones `in_proj_a`/`in_proj_b` se conservan en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con tensores comprimidos (compressed-tensors); 400 módulos `Linear` cuantizados, 333 tensores de visión y 15 de MTP intactos |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido de 64 capas que combina atención lineal GatedDeltaNet con atención completa en una proporción 3:1. Este diseño reduce el coste computacional y de memoria del contexto largo respecto a un transformer de atención completa pura, a cambio de una mayor sensibilidad a la cuantización en las proyecciones de atención lineal. El modelo incorpora además una torre de visión ViT de 27 bloques (que le permite procesar imagen y vídeo) y una capa MTP de predicción multi-token, empleada como cabeza borrador para decodificación especulativa.

No hubo entrenamiento en este repositorio. El proceso aplicado es una cuantización de solo pesos: se cuantizaron los 400 módulos `Linear` del modelo de lenguaje (proyecciones de atención, MLP y GatedDeltaNet), mientras que se dejaron sin tocar, bit a bit idénticos al modelo base, la torre de visión, la cabeza MTP, `lm_head`, embeddings, normas, conv1d y las proyecciones `in_proj_a`/`in_proj_b` (cuyo dim de salida, 48, es inferior al group_size 128). La calibración empleó 256 muestras de 2048 tokens del dataset neuralmagic/LLM_compression_calibration, aplicando la plantilla de chat del propio modelo. La innovación técnica relevante aquí no es arquitectónica sino de compresión selectiva: preservar en BF16 los componentes sensibles (visión, MTP y las proyecciones de atención lineal de dimensión pequeña) mientras se comprime el resto.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Modo de razonamiento explícito (*thinking*): el modelo emite una traza de razonamiento antes de la respuesta visible. Requiere `max_tokens` ≥ 1024 para no consumir todo el presupuesto en la traza.
- Comprensión de imagen y vídeo mediante la torre de visión ViT, que se ejecuta en BF16.
- Decodificación especulativa nativa gracias a la cabeza MTP, activable con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Razonamiento, análisis, creatividad y generación de texto sin censura heredados del fine-tune original.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`.

## Casos de uso

- Asistente conversacional de contexto largo: con hasta 262.144 tokens de ventana teórica en el modelo base (32.768 configurados en el ejemplo de despliegue), permite mantener hilos de conversación extensos o procesar documentos completos sin truncar, aunque el coste de KV cache crece de forma proporcional.
- Procesamiento de documentos con imágenes: la torre de visión en BF16 permite extraer información de capturas, diagramas o escaneos combinados con texto, un escenario típico de facturas, informes técnicos o documentación escaneada.
- Generación de contenido creativo sin restricciones de filtrado: el modelo es explícitamente "uncensored" y hereda esa característica del fine-tune original, lo que lo hace adecuado para escritura de ficción o narrativa donde otros modelos rechazan peticiones.
- Razonamiento asistido con traza verificable: el modo *thinking* expone la cadena de razonamiento, útil en entornos donde se necesita auditar cómo se llegó a una conclusión (análisis de datos, revisión de argumentos, depuración lógica).
- Servicio de inferencia a escala con decodificación especulativa: la cabeza MTP permite acelerar la generación de forma significativa (42,6 frente a 34,5 tok/s en la comparativa interna del autor con MTP activado), lo que reduce el coste por token en despliegues de alto volumen.
- Sustitución de pesos en BF16 en GPUs de 40-48 GB: al reducir el checkpoint de ~52 GB a ~31,6 GB, permite desplegar el modelo en GPUs como A6000, L40S o A100 40GB, que no admitirían la versión BF16 completa.
- Evaluación comparativa de cuantizaciones: el repositorio publica un protocolo reproducible de perplejidad sobre wikitext-103, útil como referencia metodológica para quien compara esquemas de cuantización en arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible para este repositorio. El único dato cuantitativo publicado es la perplejidad sobre 50 textos reservados de wikitext-103 (16.007 tokens evaluados, sin plantilla de chat, servido con vLLM), medida deliberadamente fuera del conjunto de calibración.

| Variante | Bits | iters × muestras | Perplejidad BF16 | Perplejidad cuantizada | Delta |
|---|---|---|---|---|---|
| `…abliterated` (checkpoint distinto) | 4 | 200 × 128 | 8,1133 | 8,8426 | +8,99 % |
| Mismo checkpoint, build W6A16 | 6 | 200 × 128 | 8,0880 | 8,6836 | +7,36 % |
| Este repositorio (W8A16) | 8 | 400 × 256 | 8,0880 | 8,5658 | +5,91 % |

El autor advierte de dos matices importantes: primero, que entre la variante de 4 bits y esta de 8 bits cambiaron tres variables a la vez (ancho de bits, número de iteraciones y muestras de calibración), por lo que el delta no debe interpretarse como el efecto aislado del ancho de bits; segundo, que los retornos son claramente decrecientes (+8,99 % → +7,36 % → +5,91 %), lo que sugiere que el error residual no está dominado por la precisión de los pesos. La hipótesis que plantea como siguiente palanca, no medida, es excluir de la cuantización las proyecciones de atención lineal GatedDeltaNet (`in_proj_qkv`, `in_proj_z` y `out_proj` lineal) manteniéndolas en BF16.

Rendimiento de servicio medido por el autor (ejecuciones de arranque en frío con 2 prompts y JIT, no benchmarks formales):

| Fase | W8A16 (este repo) | Build W6A16 |
|---|---|---|
| Decode simple | 24,6 tok/s | 26,5 tok/s |
| Decode con MTP especulativo | 42,6 tok/s | 34,5 tok/s |
| Visión | 19,4 | 17,3 |

El autor indica explícitamente que estos números no permiten sostener ninguna afirmación fiable de throughput en ninguna dirección, ya que el signo se invierte entre fases.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~31,6 GB en disco, cifra que se corresponde aproximadamente con los pesos en memoria. Hay que sumar la KV cache y las activaciones, que crecen con la longitud de contexto configurada. El modelo base en BF16 requiere ~56,31 GB según llmrun.dev y ~61 GB en FP16 según Spheron; esta cuantización reduce el requisito en unos 20-25 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o cualquier GPU con 48 GB o más (A6000, L40S, A100 40GB al límite). El ejemplo de despliegue del autor usa `--tensor-parallel-size 2`, lo que implica dos GPUs.
- ¿Cabe en GPU de consumo? No en una sola: 31,6 GB de pesos superan los 24 GB de una RTX 4090 o RTX 3090. Sí es viable en configuraciones de dos RTX 4090 (48 GB combinados) con tensor parallelism, siempre que el presupuesto de contexto y el batch se mantengan moderados.
- Opciones de despliegue: vLLM ≥ 0.28 es el soporte de referencia, con kernels Marlin para compressed-tensors WNA16 (`Using MarlinLinearKernel for CompressedTensorsWNA16`). El autor señala que, a diferencia del build de 6 bits, esta versión de 8 bits no depende de los kernels Humming compilados con JIT. Para formatos GGUF existen builds alternativos del modelo base publicados por DavidAU.
- Parámetros de servicio validados: `--tensor-parallel-size 2`, `--max-model-len 32768`, `--reasoning-parser qwen3`, `--enable-prefix-caching`, `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Latencia y throughput estimados: 24,6 tok/s en decode simple y 42,6 tok/s con MTP especulativo, en una configuración TP2 con 2 prompts de arranque en frío. No son mediciones representativas de producción.
- Nota práctica: es un modelo de razonamiento; con `max_tokens` pequeño la traza puede consumir todo el presupuesto y dejar vacía la respuesta visible. Se recomienda usar `max_tokens` ≥ 1024 y el endpoint de chat en lugar de la completion cruda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad (wikitext-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (W8A16 AutoRound) | 27,8 B | 262.144 (32.768 en el ejemplo) | int8 W8A16 group 128, Marlin | 8,5658 (+5,91 % vs BF16) | Apache 2.0 | HuggingFace, vLLM ≥ 0.28 |
| Mismo modelo, build W6A16 | 27,8 B | Idem | 6 bits, kernels Humming (JIT) | 8,6836 (+7,36 % vs BF16) | Apache 2.0 | HuggingFace, vLLM |
| Build de 4 bits sobre checkpoint `…abliterated` | 27,8 B | Idem | 4 bits | 8,8426 (+8,99 % vs BF16) | Apache 2.0 | HuggingFace |
| Modelo base en BF16 (DavidAU) | 27,8 B | 262.144 | Sin cuantizar (~52 GB) | 8,0880 | Apache 2.0 | HuggingFace |
| Builds GGUF del modelo base (p. ej. NEO-CODER-MAX-MTP-GGUF) | 27,8 B | 262.144 | GGUF (Q4, Q8, etc.) | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, otros modelos visión-lenguaje de ~27-30 B) en la información proporcionada.

## Limitaciones y advertencias

- Degradación de fidelidad medible: +5,91 % de perplejidad respecto al BF16, por encima del ~5 % habitualmente aceptado para cuantización de solo pesos, incluso con el doble de presupuesto de ajuste que las variantes anteriores.
- La comparación entre builds no aísla variables: ancho de bits, iteraciones y muestras de calibración cambiaron simultáneamente, por lo que el delta no es atribuible solo a los 8 bits.
- La perplejidad mide únicamente fidelidad de modelado de lenguaje; no sustituye a una evaluación por tarea. El autor lo indica de forma explícita.
- Contenido sin censura: el modelo base es explícitamente "uncensored" y ha sido sometido a abliteración aguas arriba. No se ha aplicado ningún filtro adicional en esta cuantización, por lo que puede generar contenido sensible, ofensivo o inapropiado sin rechazo. Requiere moderación externa en cualquier despliegue de cara al público.
- Riesgo de alucinación: no cuantificado en la información disponible; es una limitación general de la familia y no se han publicado evaluaciones específicas de veracidad para este checkpoint.
- Modo de razonamiento obligatorio de facto: con presupuestos de tokens bajos la traza consume la salida completa y la respuesta visible queda vacía.
- Idiomas soportados: no disponibles. El repositorio no declara cobertura multilingüe y no se han publicado evaluaciones por idioma.
- La sensibilidad de las capas de atención lineal GatedDeltaNet a la cuantización es una hipótesis del autor, no un resultado medido; las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` lineal sí están cuantizadas en este build.
- Sin ventaja de throughput demostrada: el autor indica que el signo de la diferencia de velocidad se invierte entre fases y que no puede sostenerse ninguna afirmación fiable. La razón para elegir este build es la fidelidad, a costa de ~6 GB más que el build de 6 bits.
- Compatibilidad de despliegue restringida: requiere vLLM ≥ 0.28 y kernels Marlin; no es un checkpoint utilizable directamente en llama.cpp, Ollama o TGI sin conversión adicional.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de calibración por separado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W8A16-AutoRound
- Build hermano W6A16 del mismo autor: https://huggingface.co/DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W6A16-AutoRound
- Modelo base en BF16 (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Build GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Dataset de calibración: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Ficha informativa del modelo base en llmrun.dev: https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
- Ficha informativa del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Recomendador de GPU para el modelo base en Spheron: https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
