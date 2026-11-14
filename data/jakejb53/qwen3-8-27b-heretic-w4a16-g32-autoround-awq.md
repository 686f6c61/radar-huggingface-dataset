# jakejb53/Qwen3.8-27B-heretic-W4A16-G32-AutoRound-AWQ

## Resumen

Qwen3.8-27B-heretic-W4A16-G32-AutoRound-AWQ es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B-heretic, publicada por el usuario jakejb53. El modelo base heretic es, a su vez, una versión "abliterated" (decensored) del Qwen/Qwen3.8-27B original de Alibaba Qwen, en la que se han eliminado los mecanismos de rechazo mediante la herramienta Heretic v1.4.0. Esta ficha describe la variante cuantizada, orientada a servir el modelo con vLLM sobre hardware de consumo profesional.

La relevancia de esta publicación es doble. Por un lado, demuestra una receta de cuantización weight-only W4A16 con AutoRound 0.17.0-dev (SignRoundV2 + inicialización NeUQI) que preserva en BF16 los componentes sensibles: torre de visión, cabeza MTP, embeddings, lm_head, compuertas de atención lineal y normas. Por otro, fija un objetivo de despliegue muy concreto: contexto completo de 262.144 tokens con 4 peticiones concurrentes sobre 2×RTX 3090 (48 GB, TP=2).

El modelo conserva la arquitectura híbrida del Qwen3.8-27B: 48 capas Gated DeltaNet y 16 capas de atención completa, con capacidades de imagen, vídeo y texto. El checkpoint ocupa 19,5 GiB en disco (aproximadamente el 39 % del tamaño en BF16) y se distribuye en safetensors con layout AWQ GEMM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa (transformer híbrido con atención lineal) |
| Parametros totales | 27B (según familia Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | W4A16 weight-only, INT4 asimétrico por grupo (group size 32), escalas FP16; ~4,6 bpw en pesos cuantizados y ~6,2 bits/parámetro efectivos en el archivo completo |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout AWQ, `quant_method: awq`, `gemm`), 4 shards más archivo de extras |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida con 48 capas Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención completa, lo que reduce el coste de atención en contextos largos frente a un transformer denso convencional. Es multimodal: procesa imagen, vídeo y texto. Los pesos originales son stock, sin fine-tuning posterior por parte del publicador, en precisión BF16 y con contexto nativo de 262.144 tokens.

Sobre esa base se aplicaron dos transformaciones. Primero, la abliteration con Heretic v1.4.0, que modifica direcciones de pesos en `attn.o_proj` y `mlp.down_proj` (con `direction_index` 34,16 y pesos máximos/mínimos en torno a 0,83-1,48) para eliminar las respuestas de rechazo: el resultado reportado es 0/100 rechazos frente a 63/100 del original, con divergencia KL de 0,0236. Segundo, la cuantización con AutoRound 0.17.0-dev usando el algoritmo SignRoundV2, búsqueda de punto de partida NeUQI, 600 iteraciones por bloque y 512 muestras de calibración de 2.048 tokens (mezcla de UltraChat 50 %, OpenCodeInstruct 37,5 % y pile-10k 12,5 %, en inglés y solo texto). Se mantienen en BF16 la torre de visión, la cabeza MTP (utilizable para decodificación especulativa), embeddings, lm_head, compuertas `in_proj_a/b` de atención lineal, normas y componentes Conv1D.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat stock sin modificar.
- Comprensión de imagen y vídeo además de texto (pipeline `image-text-to-text`).
- Generación de código, apoyada por el 37,5 % de OpenCodeInstruct en la calibración.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Cabeza MTP conservada en BF16, lo que habilita decodificación especulativa en vLLM.
- Comportamiento sin rechazos (0/100 en la evaluación del autor) gracias a la abliteration.
- Soporte de tool calling y agentes: no disponible en la información proporcionada (no se documenta explícitamente en la model card).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Despliegue en hardware de consumo profesional: la receta está pensada para servir el modelo completo con contexto de 262K y 4 peticiones concurrentes en 2×RTX 3090 (48 GB, TP=2), lo que permite montar un endpoint de inferencia multimodal sin GPUs de centro de datos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden ingerir contratos, informes o bases de código completas en una sola petición, aprovechando las capas Gated DeltaNet para contener el coste de atención.
- Análisis de imagen y vídeo: al conservarse la torre de visión en BF16, el modelo mantiene calidad de percepción visual para tareas de descripción, extracción de información o moderación de contenido audiovisual.
- Asistencia a la programación: la calibración con OpenCodeInstruct sugiere buen comportamiento en generación y explicación de código; puede integrarse en editores o pipelines de revisión.
- Investigación sobre alineación y seguridad: la variante heretic permite estudiar el comportamiento de un modelo sin rechazos con una divergencia KL medida de 0,0236 respecto al original, útil para experimentos de red-teaming controlados.
- Generación especulativa de alto rendimiento: la cabeza MTP en BF16 permite activar decodificación especulativa en vLLM para reducir latencia en cargas interactivas.
- Experimentación con cuantización: sirve como referencia reproducible de la receta AutoRound SignRoundV2 + NeUQI con grupo 32 para comparar calidad frente a otras cuantizaciones del mismo modelo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.8-27B original |
|---|---|---|
| Divergencia KL | 0,0236 | 0 (por definición) |
| Rechazos | 0/100 | 63/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 19,5 GiB (21,0 GB); con caché KV en BF16 para 262.144 tokens y concurrencia 4, el objetivo declarado es 48 GB en total.
- GPU objetivo: 2×RTX 3090 con tensor parallelism 2 (TP=2).
- Cabe en GPU de consumo: sí, en 2×RTX 3090; no se documenta su viabilidad en una sola GPU de 24 GB con contexto completo.
- Motor de despliegue previsto: vLLM (layout AWQ GEMM). Otros motores no se mencionan en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-heretic W4A16 G32) | 27B | 262.144 | W4A16 AWQ GEMM, G32 | apache-2.0 | Sin rechazos, multimodal, pensado para vLLM en 2×3090 |
| jakejb53/Qwen3.8-27B-heretic (base) | 27B | 262.144 | BF16 | apache-2.0 | Misma abliteration sin cuantizar; mayor huella de VRAM |
| Qwen/Qwen3.8-27B | 27B | 262.144 | BF16 | no disponible en la información | Modelo original con rechazos (63/100) |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensored: la abliteration elimina los rechazos, por lo que puede generar contenido inapropiado, ofensivo o inseguro sin filtros; no es adecuado para aplicaciones de cara al público sin capas de moderación externas.
- Sesgos: no documentados en la model card; hereda los del Qwen3.8-27B original y los de los datos de calibración (UltraChat, OpenCodeInstruct, pile-10k).
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización a 4 bits puede introducir degradación adicional, aunque el autor reporta una divergencia KL baja (0,0236).
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia apache-2.0: permite uso comercial, pero el publicador no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- Calibración solo texto: la cuantización se calibró sin imágenes, por lo que la calidad de la torre de visión cuantizada no está validada empíricamente más allá de mantenerse en BF16.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado; conviene evaluar antes de producción.
- Motor previsto vLLM con layout AWQ GEMM; otros runtimes (llama.cpp, Ollama, TGI) no están soportados de forma documentada.

## Enlaces

- Hugging Face: https://huggingface.co/jakejb53/Qwen3.8-27B-heretic-W4A16-G32-AutoRound-AWQ
- Modelo base (heretic): https://huggingface.co/jakejb53/Qwen3.8-27B-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic: https://heretic-project.org
