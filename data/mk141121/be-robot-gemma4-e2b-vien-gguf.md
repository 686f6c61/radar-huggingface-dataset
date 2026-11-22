# mk141121/be-robot-gemma4-e2b-vien-gguf

## Resumen

`mk141121/be-robot-gemma4-e2b-vien-gguf` es una versión modificada de `google/gemma-4-E2B-it-qat-q4_0-gguf`, el modelo Gemma 4 E2B de Google DeepMind con cuantización QAT (quantization-aware training). La modificación, publicada por el usuario mk141121 en noviembre de 2026, consiste en una poda agresiva del vocabulario del tokenizador, reduciéndolo de 262.144 tokens (que cubren aproximadamente 140 idiomas) a 50.607 tokens centrados en vietnamita e inglés. El objetivo es reducir el peso del modelo de 3,35 GB a 1,52 GB (o 1,40 GB en la variante `-q4`) para que pueda ejecutarse en dispositivos Android de gama baja con 3-4 GB de RAM.

El modelo se distribuye en formato GGUF para llama.cpp y está pensado para *Bé Robot*, una aplicación de compañía conversacional offline para niños pequeños vietnamitas. No es un modelo de propósito general: es un artefacto de despliegue específico que sacrifica cobertura lingüística por tamaño y velocidad. La poda afecta únicamente a las dos tablas indexadas por vocabulario (`per_layer_token_embd` y `token_embd`), que en el modelo original representan el 68% de los 3,33 GB de datos tensoriales; las capas transformer (atención y FFN en Q4_0) ocupan solo 1,04 GB y permanecen intactas.

La relevancia de esta ficha reside en que ilustra una técnica de optimización poco habitual —poda de vocabulario con preservación byte a byte de las filas y cierre de merges BPE— aplicada a un modelo pequeño de Google. El resultado es un modelo que mantiene respuestas idénticas al original en vietnamita (35/40 en evaluación greedy) y mejora la velocidad de generación un 23% en CPU, a costa de perder soporte para cualquier idioma distinto del vietnamita y el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B), pesos en GGUF |
| Parametros totales | 2.408.277.283 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_0 (capas transformer y variante `-q4`); `per_layer_token_embd` en Q6_K en la variante `vien`, Q4_0 en `vien-q4` |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 2,9 GB |
| Variantes de fichero | `gemma4-e2b-vien.gguf` (1,52 GB), `gemma4-e2b-vien-q4.gguf` (1,40 GB) |
| Vocabulario | 50.607 tokens (original: 262.144) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-gguf |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E2B, un transformer decoder-only de aproximadamente 2.400 millones de parámetros según los datos de safetensors del modelo base. El modelo original fue entrenado por Google DeepMind con quantization-aware training (QAT) para producir pesos Q4_0 que mantienen calidad cercana a la versión sin cuantizar; sobre esa base, mk141121 aplica una poda de vocabulario sin reentrenamiento ni ajuste fino.

La modificación técnica es la siguiente: en el GGUF original, las dos tablas indexadas por vocabulario son `per_layer_token_embd` (forma [8960 × vocab], 1,93 GB) y `token_embd`, que también actúa como cabeza de salida atada (forma [1536 × vocab], 0,33 GB). El autor conserva las filas correspondientes a 50.607 tokens copiándolas byte a byte, sin recuantizar ni tocar ningún otro tensor. El conjunto conservado incluye todos los tokens especiales, de control y de byte-fallback; caracteres individuales vietnamitas e ingleses, dígitos y puntuación; todos los tokens que aparecen en las respuestas del modelo en el contexto de chat infantil de la app; todos los tokens de la biblioteca de la app; tokens vistos al menos 10 veces en un shard de Wikipedia vietnamita o al menos 3 veces en TinyStories; y el cierre completo de merges BPE de todo lo anterior, de modo que la tokenización de texto vietnamita e inglés no cambia. El tokenizador reindexa tokens, scores y tipos en el orden original, conserva un merge solo si se conservan ambas mitades y el resultado, y remapea los ids de tokens especiales. La plantilla de chat no se modifica.

La variante `-q4` aplica la misma poda y además recuantiza `per_layer_token_embd` de Q6_K a Q4_0 mediante `llama-quantize --tensor-type`; el resto de tensores son idénticos byte a byte al original. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste adicional sobre el modelo podado.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés, orientada a diálogo multi-turno con niños.
- Respuestas idénticas al modelo original en vietnamita en evaluación greedy (35/40 prompts idénticos; los 5 restantes son respuestas en inglés con redacción distinta).
- Tokenización preservada para vietnamita e inglés: 100% de líneas idénticas en respuestas de chat y biblioteca de la app, 96,1% en Wikipedia vietnamita y 96,2% en TinyStories, con incrementos de recuento de tokens de +0,6% y +0,1% respectivamente.
- Codificación y decodificación exacta de texto con tokens fuera del conjunto conservado, mediante piezas más pequeñas y byte-fallback.
- Modo de razonamiento desactivable mediante el flag `--reasoning off` en llama-server (el ejemplo de uso lo desactiva).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- No soporta otros idiomas distintos del vietnamita y el inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Compañero conversacional offline para niños en Android: el modelo cabe en dispositivos de 3-4 GB de RAM (1,27-1,28 GB de huella de memoria en CPU según la evaluación del autor) y genera a 58,3-58,4 tok/s en un Apple M1 Pro, lo que permite interacción fluida sin conexión.
- Aplicaciones de chat educativo en vietnamita: la poda preserva el 100% de las respuestas del modelo en el contexto de chat infantil de la app y el 96,1% de líneas idénticas en Wikipedia vietnamita, por lo que sirve para contenido divulgativo y conversacional en ese idioma.
- Despliegue en dispositivos de gama baja con llama.cpp: el fichero `gemma4-e2b-vien-q4.gguf` (1,40 GB) reduce aún más el peso y mantiene 58,3 tok/s, adecuado para hardware con poca VRAM o RAM unificada.
- Servicio local con `llama-server`: el ejemplo documentado (`llama-server -m gemma4-e2b-vien.gguf -c 2048 --jinja --reasoning off`) permite exponer el modelo como endpoint compatible en una red local para prototipos.
- Extracción de memoria y resúmenes en inglés: la evaluación incluye prompts de "memory extraction" y turnos en inglés, con 35/40 respuestas idénticas al original en la variante `vien`.
- Prototipado de asistentes bilingües vi/en en entornos sin GPU: al ejecutarse en CPU a 47-58 tok/s, es viable para demos y pruebas de concepto en portátiles convencionales.
- Base para experimentos de poda de vocabulario: el repositorio documenta el procedimiento (conservación de filas byte a byte, cierre de merges BPE, remapeo de ids) y puede servir de referencia para aplicar la misma técnica a otros modelos Gemma.

## Benchmarks y rendimiento

Evaluación realizada por el autor con llama.cpp b12602 sobre Apple M1 Pro (CPU):

| Modelo | Respuestas idénticas al original (40 prompts greedy) | Velocidad de generación | Huella de memoria |
|---|---|---|---|
| original | 40/40 | 47,6 tok/s | 1,60 GB |
| `vien` | 35/40 (todas las vietnamitas idénticas; 5 inglesas con redacción distinta) | 58,4 tok/s (+23%) | 1,28 GB |
| `vien-q4` | 20/40 (diferencias son reformulaciones naturales) | 58,3 tok/s | 1,27 GB |

Tokenización frente al original en texto reservado:

| Texto | Líneas idénticas | Cambio en recuento de tokens |
|---|---|---|
| Respuestas de chat del modelo | 100% | no disponible |
| Biblioteca de la app | 100% | no disponible |
| Wikipedia vietnamita | 96,1% | +0,6% |
| TinyStories | 96,2% | +0,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1,27-1,28 GB de huella de memoria en CPU para las variantes `vien` y `vien-q4` según la evaluación del autor; el fichero en disco es de 1,52 GB y 1,40 GB respectivamente.
- GPU recomendadas: no disponible en la información proporcionada; la evaluación se realizó íntegramente en CPU (Apple M1 Pro).
- Cabe en GPU de consumo: sí, por tamaño (1,4-1,5 GB de pesos), aunque no se documentan pruebas en GPU concretas.
- Dispositivos objetivo declarados: Android con 3-4 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`); formato GGUF compatible con el ecosistema llama.cpp. No se documentan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: 58,4 tok/s (`vien`) y 58,3 tok/s (`vien-q4`) en Apple M1 Pro CPU con llama.cpp b12602; el original rinde 47,6 tok/s en el mismo entorno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| `mk141121/be-robot-gemma4-e2b-vien-gguf` (este) | 2.408.277.283 | no disponible | vi, en | Apache 2.0 | GGUF | 1,40-1,52 GB |
| `google/gemma-4-E2B-it-qat-q4_0-gguf` (base) | no disponible (mismo modelo subyacente) | no disponible | ~140 idiomas | Apache 2.0 | GGUF | 3,35 GB |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con el modelo base: este último conserva 262.144 tokens de vocabulario y soporte para unos 140 idiomas, pero pesa 3,35 GB y genera a 47,6 tok/s en el mismo hardware, frente a 1,40-1,52 GB y 58,3-58,4 tok/s del modelo podado. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita e inglés; cualquier otro idioma queda fuera del vocabulario conservado y se procesa mediante byte-fallback, con degradación de calidad no cuantificada.
- La variante `vien-q4` solo reproduce el 20/40 de las respuestas greedy del original; las diferencias se describen como reformulaciones naturales, pero implican divergencia de comportamiento respecto al modelo base.
- La variante `vien` difiere del original en 5 de 40 respuestas en inglés (redacción distinta), por lo que no es equivalente bit a bit en ese idioma.
- La poda se realizó sin reentrenamiento ni ajuste fino; no hay evaluación de calidad en tareas distintas del chat infantil, la biblioteca de la app, Wikipedia vietnamita y TinyStories.
- Riesgo de alucinación: no evaluado en la información disponible; aplican las limitaciones del modelo base Gemma 4 E2B.
- Sesgos: no documentados en la información proporcionada; aplican los del modelo base de Google DeepMind.
- Restricciones de licencia: Apache 2.0 con el aviso de que las secciones de uso previsto y limitaciones de la model card original de Google también se aplican; el autor declara las modificaciones bajo la misma licencia y sin garantía.
- La plantilla de chat no se modifica, pero el remapeo de ids de tokens especiales puede afectar a integraciones que dependan de ids concretos del vocabulario original.
- Modelo de nicho (app infantil offline) sin descargas ni likes en el momento de la ficha; no hay evidencia de uso en producción fuera de *Bé Robot*.
- El contexto de ejemplo es de 2048 tokens (`-c 2048`); la longitud máxima real no se documenta.

## Enlaces

- Hugging Face: https://huggingface.co/mk141121/be-robot-gemma4-e2b-vien-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
