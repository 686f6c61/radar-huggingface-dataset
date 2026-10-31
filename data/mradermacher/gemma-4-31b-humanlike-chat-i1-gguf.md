# mradermacher/Gemma-4-31B-Humanlike-Chat-i1-GGUF

## Resumen

Gemma-4-31B-Humanlike-Chat-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix) del modelo LessThanThreeAI/Gemma-4-31B-Humanlike-Chat, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un chat de 31B parámetros (30.697.345.596 exactos según los safetensors) construido sobre la familia Gemma 4, orientado a conversación natural, roleplay y generación de texto con estilo humanlike, con soporte de tool calling.

La relevancia de esta ficha radica en el repositorio de cuantización: mradermacher ofrece más de 20 variantes que van desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), lo que permite ejecutar un modelo de 31B en hardware muy diverso, desde portátiles con GPU modesta hasta estaciones de trabajo. Las cuantizaciones con imatrix (importance matrix) preservan mejor la calidad que las cuantizaciones estáticas a tamaños equivalentes, especialmente en los rangos bajos (IQ2, IQ3).

El modelo base se ha entrenado mediante destilación on-policy (on-policy distillation), una técnica que mejora la coherencia conversacional y el estilo natural. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones, y soporta inglés y ruso. Según la model card, se trata de un modelo con capacidades de visión, cuyos archivos mmproj se encuentran en el repositorio de cuantizaciones estáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer densa, no disponible mayor detalle) |
| Parámetros totales | 30.697.345.596 (~30,7B / 31B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 y sigue una arquitectura transformer densa de unos 31B parámetros; no se ha publicado información detallada sobre número de capas, dimensiones ocultas o mecanismos de atención concretos. La model card indica que se trata de un modelo con capacidades de visión (los archivos de proyector multimodal, mmproj, se distribuyen en el repositorio de cuantizaciones estáticas de mradermacher).

El rasgo de entrenamiento más destacable es el uso de on-policy distillation (destilación on-policy), según las etiquetas del repositorio. En esta técnica, el modelo estudiante genera sus propias salidas y recibe retroalimentación de un modelo profesor sobre esas mismas generaciones, lo que reduce el gap de distribución entre entrenamiento e inferencia y suele traducirse en respuestas más coherentes y con estilo más natural, coherente con el enfoque "humanlike" del modelo. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

En cuanto al repositorio de cuantización, mradermacher emplea cuantizaciones ponderadas con matriz de importancia (imatrix), calculada a partir de un archivo de calibración de 0,1 GB. Este método asigna mayor precisión a los tensores más relevantes para la salida, mejorando la calidad percibida en cuantizaciones agresivas (IQ1-IQ3) frente a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional con estilo natural y humanlike, orientación principal del modelo base.
- Roleplay y interpretación de personajes (tags "roleplay" y "character"), útil para chatbots de ficción y narrativa interactiva.
- Tool calling / function calling: el modelo soporta llamadas a herramientas según las etiquetas del repositorio.
- Capacidades de visión: la model card lo identifica como modelo de visión, con archivos mmproj disponibles en el repositorio de cuantizaciones estáticas.
- Soporte bilingüe: inglés y ruso.
- Compatibilidad con vLLM y SGLang (según tags), además de llama.cpp por el formato GGUF.
- Cuantizaciones desde 7,3 GB (IQ1_S) hasta 25,3 GB (Q6_K), cubriendo un rango amplio de hardware.

## Casos de uso

- Chatbots de roleplay y personajes: el entrenamiento orientado a humanlike y character lo hace adecuado para companions de ficción, NPCs de videojuegos y narrativa interactiva, donde el estilo natural importa más que la precisión factual.
- Asistentes conversacionales en inglés y ruso: soporta ambos idiomas de forma nativa, útil para productos dirigidos a usuarios rusohablantes que necesitan un modelo abierto con licencia permisiva.
- Agentes con llamadas a herramientas: el soporte de tool calling permite integrarlo en pipelines de agentes que consultan APIs, buscadores o bases de datos en múltiples pasos.
- Inferencia local en hardware de consumo: con la variante Q4_K_M (18,8 GB) cabe en una RTX 4090 de 24 GB; con IQ3_M (14,5 GB) o IQ4_XS (16,8 GB) cabe en GPUs de 16 GB como la RTX 4080 o la RTX 5060 Ti 16 GB.
- Análisis de imágenes en local: al ser un modelo de visión, puede emplearse para descripción de imágenes y VQA en entornos offline, usando los mmproj del repositorio estático junto a llama.cpp.
- Prototipado y evaluación de cuantizaciones: la amplia gama de variantes lo convierte en buen banco de pruebas para medir el impacto real de cuantizaciones agresivas (IQ1-IQ3) sobre la calidad conversacional.
- Servicios con uso comercial: la licencia Apache 2.0 permite integrarlo en productos comerciales sin royalties ni restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - IQ1_S: ~7,3 GB; IQ1_M: ~7,8 GB (calidad muy degradada, solo emergencias).
  - IQ2_M: ~11,0 GB; Q2_K: ~12,0 GB.
  - IQ3_M: ~14,5 GB; IQ4_XS: ~16,8 GB.
  - Q4_K_M: ~18,8 GB (recomendada por el autor); Q5_K_M: ~21,9 GB; Q6_K: ~25,3 GB.
  - Añadir 1-3 GB adicionales para el KV cache según la longitud de contexto usada.
- GPU recomendadas:
  - RTX 4090 / RTX 5090 (24-32 GB): Q5_K_M o Q6_K con buen margen de contexto.
  - RTX 4080 / RTX 5060 Ti 16 GB: IQ4_XS o IQ3_M.
  - RTX 4060 Ti 8 GB / portátiles: IQ2_M o IQ1_M, con pérdida de calidad notable.
  - CPU pura: viable con variantes IQ2-IQ3 en equipos con 16-32 GB de RAM, a velocidades bajas (unos pocos tokens/s).
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con cuantizaciones extremas hasta GPUs de 24 GB con calidad casi completa (Q6_K).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con vLLM y SGLang según las etiquetas del repo.
- Latencia y throughput: no disponible; en GPUs de consumo con cuantización Q4, un modelo de 31B suele situarse en el orden de 20-40 tokens/s con offload completo a GPU, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| Gemma-4-31B-Humanlike-Chat (este) | 30,7B | no disponible | Apache 2.0 | Sí, 23 variantes imatrix |
| Gemma 3 27B (Google) | 27B | 128K | Gemma license (restricciones) | Sí, amplio soporte |
| Qwen3 32B (Alibaba) | 32,5B (MoE según variante) | 128K+ | Apache 2.0 | Sí, amplio soporte |

Notas de la comparativa: frente a Gemma 3 27B, este modelo ofrece una licencia más permisiva (Apache 2.0 frente a la licencia Gemma con sus restricciones de uso) y un enfoque especializado en conversación humanlike y roleplay, pero carece del contexto de 128K documentado. Frente a Qwen3 32B, comparte licencia Apache 2.0 y rango de tamaño similar, aunque Qwen3 tiene un ecosistema de benchmarks y herramientas más documentado. No se han publicado benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Soporte lingüístico limitado: solo inglés y ruso; no está indicado su rendimiento en castellano ni en otros idiomas, por lo que el uso en español no está garantizado.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las califica de "para desesperados" y advierte de que algunas variantes Q2/Q3 son probablemente inferiores a sus equivalentes IQ.
- Riesgo de alucinación: no disponible información específica, pero como todo LLM conversacional orientado a estilo natural y roleplay, puede generar contenido ficticio con apariencia verosímil; no es adecuado como fuente factual sin verificación.
- Longitud de contexto no documentada: no se puede planificar el uso de documentos largos sin verificarlo empíricamente.
- Capacidades de visión: los archivos mmproj están en el repositorio de cuantizaciones estáticas, no en este; hay que descargar ambos repositorios para usar la modalidad visual.
- Sesgos conocidos: no disponible; al ser un modelo afinado para roleplay y estilo humanlike, puede reproducir sesgos del modelo base Gemma 4 y de los datos de destilación.
- Licencia: Apache 2.0, sin restricciones comerciales relevantes; no obstante, conviene revisar la model card del modelo base (LessThanThreeAI) por si existen condiciones adicionales del entrenamiento.
- Es un repositorio de cuantización de terceros: cualquier bug del modelo base se hereda, y la calidad de la conversión depende del proceso de mradermacher, aunque este es un cuantizador con amplia trayectoria en la comunidad.

## Enlaces

- Repositorio de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/Gemma-4-31B-Humanlike-Chat-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/Gemma-4-31B-Humanlike-Chat-GGUF
- Modelo base: https://huggingface.co/LessThanThreeAI/Gemma-4-31B-Humanlike-Chat
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Gemma-4-31B-Humanlike-Chat-i1-GGUF
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo del modelo base: no disponible
