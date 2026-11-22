# FINAL-Bench/Darwin-760B-RSI

## Resumen

Darwin-760B-RSI es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 763.205.315.794 parámetros totales, desarrollado por FINAL-Bench y publicado bajo licencia MIT. Se construye a partir de DeepSeek-V4.1-Flash-1017 (revisión `08c8657f0229`) mediante una metodología que el autor denomina "evolución de capas Darwin": se sustituyen 7 de las 40 capas del decodificador del modelo padre por copias de capas de checkpoints de la misma arquitectura, seleccionadas mediante una búsqueda sobre las capas 23 a 36. El resto de componentes (33 capas, router, tablas engram, embeddings, tokenizer y plantilla de chat) se mantiene byte a byte idéntico al padre.

El modelo está orientado a razonamiento de nivel avanzado (matemáticas, ciencia, STEM) con modo de pensamiento explícito (chain-of-thought) y declara un resultado de 92,93% de accuracy en GPQA Diamond en una única muestra con contexto de 65.536 tokens, temperatura 1.0 y `reasoning_effort` 100. Su propuesta de valor central es mantener la precisión del padre reduciendo la longitud de salida: en una comparación pareada sobre 1.200 ítems, el modelo genera una media de 1.553,5 tokens por respuesta frente a los 2.098,6 del padre, es decir, un 74% de la longitud.

Es relevante ahora porque combina un tamaño de 763B con licencia MIT, soporte declarado para inglés, coreano y chino, formato de pesos safetensors compatible con transformers y vLLM, y una interfaz OpenAI-compatible. El repositorio ocupa 510,3 GB y el modelo se distribuye con expertos enrutados en MXFP4 (4,25 bits) y capas densas en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sparse, transformer decoder con 40 capas; 384 expertos |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (usado en la evaluacion de GPQA Diamond); 32.768 tokens en las comparaciones pareadas |
| Tipos de cuantizacion | MXFP4 (4,25 bits) en expertos enrutados; FP8 en capas densas; tag `8-bit` |
| Idiomas soportados | en, ko, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo sparse MoE con 40 capas de decodificador y 384 expertos. No se trata de un entrenamiento desde cero: Darwin-760B-RSI es un derivado del checkpoint DeepSeek-V4.1-Flash-1017, del que hereda la arquitectura completa, el router, las tablas engram, los embeddings, el tokenizer y la plantilla de chat sin modificaciones. La intervención consiste en reemplazar 7 capas del decodificador (23, 26, 27, 28, 30, 31 y 32) por capas seleccionadas mediante una búsqueda de selección de capas sobre el rango 23-36, tomadas de checkpoints con la misma arquitectura y licencia MIT (la atribución figura en el fichero `NOTICE`). El autor afirma que no hay aritmética de tensores ni recuantización: el hijo conserva exactamente las formas y el recuento de parámetros del padre.

La metodología declarada ("Darwin") parte de un mapa medido de las debilidades del padre, cambia solo las partes identificadas y valida cada candidato contra el padre sobre los mismos ítems y con idénticos ajustes; solo se publica un hijo que mantiene la precisión del padre. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable no es arquitectónica sino de eficiencia de razonamiento: el modelo alcanza la precisión del padre con un 26% menos de tokens de salida, y la tasa de respuestas que agotan el contexto de 32.768 tokens baja al 0,8% frente al 1,6% del padre.

## Capacidades

- Generación de texto y razonamiento de nivel avanzado, con modo de pensamiento explícito (`thinking`, chain-of-thought) y control mediante el parámetro `reasoning_effort`.
- Razonamiento matemático y científico: evaluado en GPQA Diamond, MATH nivel 5, AIME 2025, MMLU-Pro y BBH.
- Generación de código: evaluado en HumanEval con 98,2% en la comparación pareada.
- Capacidades multilingües declaradas en inglés, coreano y chino, con etiqueta `multilingual`.
- Conversación multi-turno (tag `conversational`).
- Despliegue con vLLM y endpoints compatibles con la API de OpenAI (tags `vllm`, `openai-compatible`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento científico y STEM de nivel posgrado: el modelo puede emplearse para resolver preguntas de física, química y biología de nivel avanzado, un escenario validado por su resultado de 92,93% en GPQA Diamond con contexto de 65.536 tokens. Es adecuado para asistentes de investigación que necesitan justificar el razonamiento paso a paso.
- Resolución de problemas matemáticos competitivos: con 93,8% en MATH nivel 5 y 93,3% en AIME 2025 en la comparación pareada, encaja en herramientas de verificación de demostraciones, generación de problemas y tutoría matemática avanzada.
- Generación y revisión de código en producción: con 98,2% en HumanEval, puede integrarse en pipelines de revisión de parches o generación de tests, siempre que se despliegue con vLLM sobre GPUs de datacenter.
- Atención al cliente multilingüe: soporta inglés, coreano y chino, y su ventana de contexto de hasta 65.536 tokens permite gestionar conversaciones multi-turno con historial largo y documentación adjunta.
- Sistemas de razonamiento con presupuesto de tokens ajustado: al producir respuestas un 26% más cortas que el padre con precisión equivalente, es adecuado para aplicaciones donde el coste por token de salida es crítico, como agentes que ejecutan muchas llamadas encadenadas.
- Evaluación y benchmarking interno: al estar construido sobre un padre conocido y publicar comparaciones pareadas sobre 1.200 ítems, sirve como referencia para estudiar técnicas de edición selectiva de capas en modelos MoE.
- Despliegue con API compatible con OpenAI: el tag `openai-compatible` permite sustituir un endpoint propietario por este modelo en aplicaciones existentes sin reescribir el cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor. La entrada del model-index (92,93 en GPQA Diamond) corresponde a una única muestra con temperatura 1.0, `reasoning_effort` 100 y contexto de 65.536 tokens, y no está verificada (`verified: false`).

| Benchmark | Items | Darwin-760B-RSI (%) | DeepSeek-V4.1-Flash-1017 (%) |
|---|---|---|---|
| Overall | 1.200 | 93,2 | 92,5 |
| GPQA Diamond | 198 | 88,9 | 86,4 |
| MMLU-Pro | 280 | 90,0 | 89,6 |
| BBH | 270 | 96,3 | 94,8 |
| MATH (nivel 5) | 258 | 93,8 | 93,4 |
| AIME 2025 | 30 | 93,3 | 90,0 |
| HumanEval | 164 | 98,2 | 100,0 |
| Tokens de salida por respuesta (media) | 1.200 | 1.553,5 | 2.098,6 |

Ajustes de la comparación pareada: pensamiento activado (`reasoning_effort` 75), decodificación greedy (temperatura 0, semilla 1234), contexto de 32.768, vLLM 0.34.0, tensor parallel 4 sobre 4 x H200. La comparación pareada arroja +0,8 puntos con intervalo bootstrap del 95% de [−0,2, +1,8] y McNemar p = 0,20. El resultado aislado de GPQA Diamond con el ajuste completo de pensamiento es 92,93.

## Requisitos de hardware

- El repositorio completo ocupa 510,3 GB, por lo que la inferencia requiere almacenamiento y memoria en el orden de cientos de GB.
- La comparación oficial se ejecutó con tensor parallel 4 sobre 4 x NVIDIA H200; ese es el mínimo de referencia publicado por el autor.
- VRAM estimada para inferencia: no disponible de forma explícita; el despliegue de referencia usa 4 x H200.
- GPU recomendadas: NVIDIA H200 (configuración validada). Otras opciones como A100 o H100 no están documentadas en la información disponible.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible; el tamaño del modelo y el formato MXFP4/FP8 hacen improbable un despliegue en una sola GPU de consumo, pero no hay datos publicados al respecto.
- Opciones de despliegue: vLLM 0.34.0 (versión usada en las evaluaciones), transformers, endpoints compatibles con la API de OpenAI. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. Sí se conoce la longitud media de salida (1.553,5 tokens por respuesta), que reduce el coste de generación frente al padre.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-760B-RSI | 763B (MoE, 384 expertos) | 65.536 | 92,93 (ajuste completo) / 88,9 (pareado) | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (padre) | 763B (MoE) | 32.768 en la comparación pareada | 86,4 (pareado) | MIT | Hugging Face |
| Darwin-180B-RSI (hermano) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

El padre es el término de comparación natural: mismo recuento de parámetros, misma arquitectura y misma licencia, con una diferencia de +0,8 puntos en la media de 6 benchmarks y un 26% menos de tokens de salida a favor de Darwin-760B-RSI. El Darwin-180B-RSI se menciona como "hermano insignia" de la familia, pero no se aportan sus especificaciones ni resultados.

## Limitaciones y advertencias

- El resultado principal de GPQA Diamond (92,93) no está verificado (`verified: false`) y procede de una única muestra con muestreo a temperatura 1.0; no es directamente comparable con evaluaciones greedy.
- La mejora sobre el padre en la comparación pareada (+0,8 puntos) no es estadísticamente significativa: el intervalo bootstrap incluye el cero y McNemar p = 0,20. La ventaja demostrada es la eficiencia de tokens, no la precisión.
- En HumanEval el modelo queda por debajo del padre (98,2 frente a 100,0).
- El modelo es un derivado por sustitución de capas de checkpoints de terceros; la trazabilidad de licencias depende del fichero `NOTICE` y de que cada capa copiada sea efectivamente MIT.
- Idiomas limitados a inglés, coreano y chino; no se declara soporte de español ni de otras lenguas.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- El tamaño (763B, 510,3 GB) exige infraestructura de datacenter; no es desplegable en hardware de consumo según los datos disponibles.
- El autor no documenta el proceso de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la reproducibilidad.
- La licencia MIT permite uso comercial, pero conviene revisar las obligaciones de atribución de los checkpoints de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-760B-RSI
- Modelo padre (DeepSeek-V4.1-Flash-1017): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo hermano (Darwin-180B-RSI): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Colección de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Paper (arXiv 2605.14386): https://huggingface.co/papers/2605.14386
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Sitio del autor (VIDRAFT): https://vidraft.net
