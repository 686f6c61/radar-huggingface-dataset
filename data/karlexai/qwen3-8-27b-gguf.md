# KarLexAI/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B, publicada por KarLex AI bajo el identificador KLX. El modelo base es un transformer denso de 26.895.998.464 parámetros (aproximadamente 27B) desarrollado por Qwen, con capacidad de razonamiento en modo thinking y soporte multimodal de imagen mediante un proyector de visión separado. La aportación de KarLex AI no es el modelo en sí, sino una estrategia de cuantización que preserva el comportamiento de razonamiento incluso en los tamaños más pequeños.

El problema que resuelve esta ficha es concreto: las cuantizaciones extremas de modelos de razonamiento grandes suelen degradar el modo thinking hasta hacerlo inútil, con bucles, agotamiento de tokens y fallos en problemas elementales. Según los datos de la model card, el archivo IQ1_S de 6,19 GB alcanza un 53,8% en AIME 2025+2026 y un 87,8% en MATH-500, frente al 1,3% y 32,6% de la cuantización equivalente de Unsloth del mismo tamaño. A partir de 10,93 GB (IQ3_XXS) las puntuaciones se acercan al BF16 completo (94,2% AIME, 99,0% MATH-500).

La relevancia actual es doble: por un lado, permite ejecutar un modelo de razonamiento de 27B en hardware de consumo con 8-16 GB de VRAM; por otro, emplea únicamente tipos de tensor estándar de llama.cpp, sin forks ni parches, lo que simplifica el despliegue en producción. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); codificador de visión en mmproj separado |
| Parámetros totales | 26.895.998.464 (aproximadamente 27B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de arranque usa `-c 32768` |
| Tipos de cuantización | IQ1_S, IQ2_XXS, IQ2_XS, IQ3_XXS, IQ4_XS (mezcla de tipos de tensor estándar dentro de cada archivo) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en mmproj F16 y BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de aproximadamente 27B parámetros con cabeza de predicción multi-token (MTP), aunque la model card indica explícitamente que la cabeza MTP no está incluida en los archivos GGUF. El modelo incorpora un modo de razonamiento (thinking) activado por defecto y un codificador de visión que se distribuye por separado en los archivos `mmproj-F16.gguf` y `mmproj-BF16.gguf`, sin cuantizar y convertidos con llama.cpp upstream. La arquitectura, el tokenizador y la plantilla de chat son idénticos al modelo base Qwen/Qwen3.8-27B.

El trabajo de KarLex AI es una cuantización post-entrenamiento, sin fine-tuning. Cada archivo mezcla varios tipos de tensor estándar de llama.cpp para asignar más precisión a las capas críticas para el razonamiento y menos a las menos sensibles. No se han publicado detalles sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF o DPO) en la información disponible. La model card sí documenta que todas las métricas se obtuvieron en un único harness sobre llama.cpp estándar, en modo thinking y con los parámetros de muestreo de Qwen (temperatura 1.0, top-k 20, top-p 0.95), que están almacenados en el propio archivo.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking, activado por defecto.
- Razonamiento matemático de competición: 53,8% en AIME 2025+2026 con el archivo de 6,19 GB y 94,2% con el de 10,93 GB.
- Instrucciones complejas: 94,3% en IFEval con IQ3_XXS e IQ4_XS.
- Matemáticas escolares y de nivel avanzado: 99,0% en MATH-500 con IQ3_XXS.
- Comprensión de imágenes mediante el proyector de visión opcional (`--mmproj`).
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Ejecución en llama.cpp estándar sin parches ni forks.
- Parámetros de muestreo recomendados embebidos en el archivo.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Capacidades de agente multi-paso: no confirmadas explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático en local con hardware limitado: el archivo IQ1_S de 6,19 GB permite resolver problemas de nivel AIME en una GPU de consumo; útil para prototipado y para entornos sin acceso a la nube.
- Asistente de razonamiento en portátiles con 8 GB de VRAM: el archivo IQ2_XXS de 7,21 GB ofrece 82,7% en AIME y 98,4% en MATH-500, un salto cualitativo respecto al escalón inferior con solo 1 GB más de descarga.
- Despliegue en servidores de gama media: el archivo IQ3_XXS de 10,93 GB alcanza 94,2% en AIME, 94,3% en IFEval y 99,0% en MATH-500, prácticamente equivalente al BF16 de 54 GB, lo que reduce el coste de VRAM en un factor de cinco.
- Evaluación de instrucciones y generación controlada: con 94,3% en IFEval, el modelo es adecuado para tareas de seguimiento estricto de instrucciones en pipelines de generación.
- Análisis de documentos con imágenes: usando el proyector `mmproj-F16.gguf` (0,9 GB) junto con cualquiera de los archivos cuantizados, se pueden procesar capturas, diagramas o páginas escaneadas en local.
- Investigación sobre cuantización: la comparativa publicada frente a Unsloth e ISTA, con diferencias pareadas y errores estándar, sirve como referencia para estudiar cómo afecta la cuantización al razonamiento en modelos de 27B.
- Chat conversacional autoalojado: con `llama-server` y la plantilla de chat incluida, se puede levantar un endpoint compatible con la API de OpenAI en una sola máquina.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking y con el sampler de Qwen sobre llama.cpp estándar:

| Archivo | Tamaño | AIME 2025+2026 | IFEval | MATH-500 |
|---|---|---|---|---|
| IQ1_S | 6,19 GB | 53,8 | 50,5 | 87,8 |
| IQ2_XXS | 7,21 GB | 82,7 | 88,5 | 98,4 |
| IQ2_XS | 8,00 GB | 89,4 | 93,5 | 97,8 |
| IQ3_XXS | 10,93 GB | 94,2 | 94,3 | 99,0 |
| IQ4_XS | 14,25 GB | 95,2 | 94,3 | 98,8 |
| BF16 (referencia) | ~54 GB | 96,0 | 93,4 | 99,2 |

Comparativa directa frente a otras cuantizaciones del mismo modelo (diferencias en puntos, ± error estándar):

| Tamaño | Archivo KLX | Rival | AIME | IFEval | MATH-500 |
|---|---|---|---|---|---|
| 6,2 GB | IQ1_S | Unsloth UD-IQ1_S (6,19 GB) | +52,5 ± 4,9 | +28,8 ± 2,6 | +55,2 ± 2,5 |
| 7,2 GB | IQ2_XXS | Unsloth UD-IQ2_XXS, 19 ago (7,27 GB) | +8,75 ± 2,6 | +8,3 ± 1,9 | +1,8 ± 0,9 |
| 8 GB | IQ2_XS | ISTA GSQ-RCO IQ2_XS (8,42 GB) | +0,2 ± 1,5 | -1,1 ± 1,1 | +0,2 ± 0,8 |
| 8 GB | IQ2_XS | Unsloth UD-IQ2_S, 19 ago (8,37 GB) | +1,0 ± 1,4 | +2,8 ± 1,3 | -0,8 ± 0,8 |
| 10,9 GB | IQ3_XXS | Unsloth UD-IQ3_XXS (10,93 GB) | +1,0 ± 1,2 | -0,4 ± 0,8 | +0,2 ± 0,4 |
| 14,3 GB | IQ4_XS | Unsloth UD-IQ4_XS, 19 ago (14,25 GB) | -0,6 ± 0,9 | -1,1 ± 0,8 | +0,2 ± 0,5 |

Nota del autor: el 10 y 11 de noviembre de 2026 Unsloth sustituyó UD-IQ2_XXS, UD-IQ2_S y UD-IQ4_XS por archivos "Dynamic v3.1"; las comparaciones con esos tres archivos se midieron contra las versiones del 19 de agosto de 2026 y no se han repetido. Los archivos UD-IQ1_S y UD-IQ3_XXS no han cambiado.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 6,2 GB (IQ1_S) hasta 14,3 GB (IQ4_XS), más overhead de contexto KV. El ejemplo oficial usa `-c 32768`, que incrementa el consumo de KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100. Para IQ1_S e IQ2_XXS basta una GPU de 8 GB; para IQ3_XXS y IQ4_XS se recomienda 12-16 GB.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs consumer de gama media-alta; IQ1_S e IQ2_XXS caben en 8 GB, IQ3_XXS e IQ4_XS requieren 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp, entre otros). No se menciona soporte explícito de vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Proyector de visión: añadir aproximadamente 0,9 GB para `mmproj-F16.gguf` o `mmproj-BF16.gguf`.
- Comando de referencia: `llama-server -m Qwen3.8-27B-KLX-IQ1_S.gguf -ngl 99 -c 32768 --jinja`.

## Comparativa con modelos similares

| Aspecto | KLX IQ1_S | KLX IQ3_XXS | Unsloth UD-IQ1_S | ISTA GSQ-RCO IQ2_XS |
|---|---|---|---|---|
| Modelo base | Qwen3.8-27B | Qwen3.8-27B | Qwen3.8-27B | Qwen3.8-27B |
| Tamaño | 6,19 GB | 10,93 GB | 6,19 GB | 8,42 GB |
| AIME 2025+2026 | 53,8 | 94,2 | 1,3 | 89,2 (implícito) |
| IFEval | 50,5 | 94,3 | 21,7 | 94,6 (implícito) |
| MATH-500 | 87,8 | 99,0 | 32,6 | 97,6 (implícito) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Runtime | llama.cpp estándar | llama.cpp estándar | llama.cpp estándar | llama.cpp estándar |

Los valores "implícitos" de ISTA se derivan de las diferencias pareadas publicadas (+0,2 en AIME, -1,1 en IFEval, +0,2 en MATH-500 respecto a KLX IQ2_XS). La comparación con Unsloth en 10,9 GB y 14,3 GB no muestra diferencias significativas según el propio autor.

## Limitaciones y advertencias

- La cuantización IQ1_S, pese a mantener el razonamiento, sigue muy por debajo del BF16 en IFEval (50,5 frente a 93,4); no es adecuada para tareas de seguimiento estricto de instrucciones.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un riesgo inherente a los modelos de razonamiento y puede amplificarse en cuantizaciones extremas.
- La cabeza de predicción multi-token (MTP) no está incluida, por lo que no se puede aprovechar la decodificación especulativa nativa del modelo base.
- Idiomas soportados no documentados en la información disponible; el rendimiento multilingüe no está verificado.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- Las comparativas con Unsloth UD-IQ2_XXS, UD-IQ2_S y UD-IQ4_XS se midieron contra archivos del 19 de agosto de 2026 y no se han repetido con los nuevos archivos "Dynamic v3.1" del 10-11 de noviembre de 2026.
- El contexto máximo real del modelo base no se especifica en la información proporcionada; el ejemplo usa 32.768 tokens, pero no se confirma que sea el límite.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo NOTICE del repositorio por si incluye atribuciones adicionales.
- El proyecto no está afiliado a Qwen, Unsloth ni ISTA; el soporte y las actualizaciones dependen de KarLex AI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Archivo de benchmarks: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/BENCHMARKS.md
- Aviso legal (NOTICE): https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/NOTICE
- Página del autor: https://karlex.ai
- Archivo IQ1_S: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-KLX-IQ1_S.gguf
- Archivo IQ2_XXS: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-KLX-IQ2_XXS.gguf
- Archivo IQ2_XS: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-KLX-IQ2_XS.gguf
- Archivo IQ3_XXS: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-KLX-IQ3_XXS.gguf
- Archivo IQ4_XS: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-KLX-IQ4_XS.gguf
