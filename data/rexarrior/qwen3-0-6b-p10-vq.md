# rexarrior/Qwen3-0.6B-P10-VQ

## Resumen

Qwen3-0.6B-P10-VQ es una compresión extrema del modelo Qwen3-0.6B de Alibaba, publicada por el usuario independiente rexarrior bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de investigación en compresión de modelos: los pesos del transformer original se han sustituido por una representación de cuantización vectorial (VQ) con códigos de 256 entradas para las proyecciones y un codebook escalar de 16 entradas para el embedding atado. El resultado ocupa 245,78 MB en disco (frente a los aproximadamente 1,2 GB del checkpoint original en FP16), con 596.049.920 parámetros nominales.

El interés del artefacto es metodológico: demuestra una técnica de compresión post-entrenamiento basada en codebooks ajustados sobre activaciones de calibración, con un entrenamiento corto (112 actualizaciones) que mantiene los libros maestros en FP32 y limita las escalas a ±10 % de sus valores iniciales. Es relevante para investigadores que exploran límites de compresión agresiva en modelos pequeños, no para despliegue en producción: las evaluaciones internas y externas publicadas por el autor muestran un deterioro severo de capacidades.

La arquitectura subyacente es la del Qwen3-0.6B original (transformer denso, contexto de 32.768 tokens en el modelo base), pero el formato de pesos nativo requiere un parche específico sobre llama.cpp que no es compatible con la versión estándar. Existe además una exportación portable a Transformers mediante instrucciones de decodificación incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con pesos comprimidos por cuantización vectorial (VQ) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-0.6B soporta 32.768 tokens |
| Tipos de cuantizacion | VQ con codebook de 256 entradas (vectores de 2 o 4 pesos) en proyecciones; codebook escalar de 16 entradas en el embedding atado; escalas por grupo de 128 pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF nativo (requiere parche `native-vq.patch` sobre llama.cpp); exportación portable a Transformers mediante decodificación |

## Arquitectura y entrenamiento

El modelo parte del checkpoint fijado de Qwen/Qwen3-0.6B (`c1899de289a04d12100db370d81485cdf75e47ca`). Cada grupo de 128 pesos comparte una escala, y las proyecciones se representan mediante índices fijos a un codebook de 256 entradas que codifica vectores de dos o cuatro pesos. El embedding atado utiliza un codebook escalar separado de 16 entradas. Los libros iniciales se ajustaron con activaciones de calibración.

El procedimiento P10 entrenó únicamente los codebooks de proyección y las escalas de grupo durante 112 actualizaciones, manteniendo libros maestros en FP32 y limitando las escalas a ±10 % de sus valores iniciales. Los índices y el embedding atado permanecieron congelados. No se realizó RLHF ni DPO; el ajuste es puramente de compresión sobre el modelo base. El repositorio incluye código de compresión, receta del modelo, parche para llama.cpp y sumas de verificación SHA-256.

## Capacidades

- Generación de texto: hereda la capacidad del Qwen3-0.6B original, aunque con degradación notable según las evaluaciones publicadas.
- Razonamiento y matemáticas: no se han publicado resultados específicos para este artefacto; el modelo base declara capacidades en estas áreas.
- Tool calling / function calling: soportado en el modelo base, pero las evaluaciones del artefacto muestran un rendimiento muy bajo (BFCL no live 1,17 %, API-Bank 0/744 llamadas correctas).
- Agentes y razonamiento multi-paso: capacidad muy limitada en este artefacto (BFCL multi turn 0,00 %, memory 0,43 %).
- Multilingüe: no disponible en la información; el modelo base Qwen3 es multilingüe.
- Capacidades especiales: no se documentan thinking mode, visión ni audio para este artefacto.

## Casos de uso

- Investigación en compresión de modelos: reproducir el pipeline P10 y comparar codebooks, escalas y número de actualizaciones sobre el mismo checkpoint base, usando los ficheros de método y las sumas SHA-256 del repositorio.
- Estudio de límites de cuantización vectorial: analizar la degradación de perplexity (54,6932 en el conjunto de 2.040 tokens de *Alice in Wonderland*) frente a cuantizaciones escalares convencionales del mismo modelo.
- Docencia y divulgación: ilustrar cómo un codebook de 256 entradas con vectores de 2-4 pesos sustituye pesos densos y qué coste tiene en calidad, con un artefacto de 245,78 MB manejable en portátil.
- Pruebas de ingeniería de formatos: validar el parche `native-vq.patch` sobre llama.cpp en un commit concreto y verificar la portabilidad del export a Transformers.
- Evaluación de robustez de evaluadores: usar los resultados BFCL e IFEval publicados como caso de estudio de cómo un modelo comprimido falla de forma sistemática en formato y llamadas a herramientas.
- Experimentos de decodificación especulativa o destilación: emplear el artefacto como modelo pequeño de referencia en pipelines de investigación, siempre que la calidad no sea crítica.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (recuentos de aciertos sobre el total de tareas):

| Prueba | Resultado |
|---|---:|
| Trayectorias tool-use nuevas | 16/48 |
| Trayectorias conocidas A6 | 21/48 |
| Trayectorias conocidas A8 | 32/48 |
| Siguiente acción desde historial | 24/24 |
| Continuación completa desde historial | 24/24 |
| Inglés estricto | 21/96 |
| Perplexity *Alice in Wonderland* (menor es mejor) | 54,6932 |
| BFCL v4 · non live | 1,17 % |
| BFCL v4 · live | 1,26 % |
| BFCL v4 · irrelevance | 86,11 % |
| BFCL v4 · multi turn | 0,00 % |
| BFCL v4 · memory | 0,43 % |
| BFCL v4 · live relevance | 6,25 % |
| BFCL v4 · format sensitivity | 0,02 % |
| API-Bank · llamadas correctas | 0/744 |
| IFEval · prompt estricto | 94/541 |
| IFEval · instrucción estricta | 232/834 |
| IFEval · prompt laxo | 94/541 |
| IFEval · instrucción laxa | 232/834 |

No se han publicado comparaciones directas con el Qwen3-0.6B original en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos nativos de 245,78 MB más overhead del motor y caché KV para contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor compila con Metal en macOS, lo que sugiere uso en Apple Silicon.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, iGPU con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp con el parche `native-vq.patch` aplicado sobre el commit `8bb3cf0d216a5ae48360179f2931daf284be4d01` y el binario `llama-server`; export portable a Transformers mediante las instrucciones de decodificación del repositorio. No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-P10-VQ | 596 M (comprimido) | no disponible (base 32.768) | Apache 2.0 | GGUF nativo con parche | Compresión VQ agresiva, calidad muy degradada |
| Qwen/Qwen3-0.6B | 596 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, capacidades completas |
| Qwen3-Reranker-0.6B | 0,6 B | no disponible | no disponible | safetensors | Variante para embedding y ranking, no generativa |

No se dispone de datos de benchmarks comparativos entre el artefacto y el modelo base en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: perplexity de 54,6932 y resultados muy bajos en BFCL y API-Bank indican que el modelo no es fiable para tareas de tool calling ni agentes.
- Formato no estándar: el GGUF nativo requiere un parche específico y un commit fijado de llama.cpp; no funciona con la versión estándar ni con la mayoría de runtimes de inferencia.
- Idiomas no documentados: la model card no especifica cobertura lingüística; los resultados de inglés estricto (21/96) sugieren un rendimiento bajo incluso en inglés.
- Riesgo de alucinación: no evaluado de forma específica en la información disponible; la compresión agresiva puede incrementar la generación de contenido incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del artefacto lo hace inadecuado para producción.
- Contexto operativo limitado en el ejemplo de despliegue a 2.048 tokens (`-c 2048`), muy por debajo del contexto del modelo base.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento comunitario conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-P10-VQ
- Repositorio del proyecto: https://github.com/Rexarrior/qwen3-compression-lab
- Receta del modelo P10: https://github.com/Rexarrior/qwen3-compression-lab/blob/main/models/p10.md
- Checkpoint base fijado: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Ficheros de método y reproducción: https://huggingface.co/rexarrior/Qwen3-0.6B-P10-VQ/tree/main/method
- llama.cpp: https://github.com/ggml-org/llama.cpp
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
