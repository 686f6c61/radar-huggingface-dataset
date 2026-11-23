# mradermacher/Goetia-26B-A4B-v1.6-GGUF

## Resumen

Goetia-26B-A4B-v1.6 es un modelo de lenguaje orientado a escritura creativa y roleplay, desarrollado por Naphula y distribuido en formato GGUF por mradermacher. Se trata de un merge construido con mergekit a partir de arquitectura Gemma (etiquetado como "gemma4" en los tags y "moe_della" en la metadata del merge), con 25.971.339.550 parámetros totales (aproximadamente 26B) y un esquema de mezcla de expertos que sugiere unos 4B de parámetros activos, de ahí la denominación A4B. El modelo base es `Naphula/Goetia-26B-A4B-v1.6` y esta ficha documenta la cuantización estática publicada por mradermacher.

El modelo está especializado en generación de ficción: relatos, tramas, subtramas, continuación de escenas, roleplay conversacional y prosa descriptiva, con soporte declarado para todos los géneros (romance, terror, ciencia ficción, etc.). No es un modelo de propósito general orientado a razonamiento matemático o código, sino una herramienta de autor para escritura asistida y personajes conversacionales.

Su relevancia práctica radica en la disponibilidad de cuantizaciones GGUF listas para usar en llama.cpp y entornos compatibles, lo que permite ejecutar un modelo de 26B en hardware de consumo con cuantizaciones de 4 bits. La licencia Apache 2.0 facilita su integración en productos comerciales, algo poco habitual en modelos de rol y ficción derivados de merges.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma con mezcla de expertos (merge MoE, etiqueta "moe_della"); detalles exactos no disponibles |
| Parámetros totales | 25.971.339.550 (≈26B) |
| Parámetros activos | ≈4B (según denominación A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Inglés (declarado en model card: `language: eng`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en el repo base, formato no especificado |

## Arquitectura y entrenamiento

El modelo es un merge generado con mergekit (variante `mergekit-exp`) a partir de componentes de arquitectura Gemma, según los tags `gemma4` y `moe_della`. La estructura resultante combina un total de 26B parámetros con una activación de aproximadamente 4B por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La model card del repositorio de cuantización no documenta innovaciones técnicas adicionales más allá del propio proceso de merge y de la cuantización estática. Las cuantizaciones se han generado con `quantize_version: 2` y `output_tensor_quantised: 1`, y se ofrece un repositorio separado con cuantizaciones ponderadas por imatrix (`mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF`) que suelen preservar mejor la perplejidad en tamaños pequeños.

## Capacidades

- Generación de ficción y narrativa: relatos completos, tramas principales y subtramas, con etiquetas específicas para todos los géneros.
- Continuación de escenas ("scene continue") y escritura de prosa vívida y descriptiva.
- Roleplay y roleplaying conversacional, incluyendo personajes con voz propia y diálogos multi-turno.
- Escritura creativa conversacional: el modelo está etiquetado como `conversational` y `creative`.
- Generación de tramas y subtramas para planificación narrativa.
- Registro lingüístico flexible, incluyendo lenguaje soez cuando el contexto lo requiere (tag `swearing`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado; no disponible información sobre otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistencia a escritores de ficción: el modelo puede generar borradores de capítulos, continuar escenas existentes y proponer subtramas a partir de un esquema, aprovechando su especialización en prosa narrativa y su etiquetado para todos los géneros.
- Roleplay de personajes en aplicaciones de entretenimiento: gracias a su entrenamiento orientado a conversación y roleplaying, puede mantener diálogos multi-turno con voz de personaje consistente, integrándose en frontends de chat compatibles con llama.cpp.
- Generación de tramas para guiones y videojuegos: útil para producir sinopsis, arcos argumentales y subtramas ramificadas antes de la escritura final, con la ventaja de un modelo de 26B ejecutable en hardware moderado.
- Prototipado de narrativa interactiva: en motores de ficción interactiva o novelas visuales, el modelo puede generar respuestas y descripciones dinámicas en tiempo real con cuantizaciones Q4_K_M o Q5_K_M.
- Escritura de terror y romance de género: los tags específicos de horror, romance y ciencia ficción indican ajuste para convenciones de género, útil en editoriales digitales y plataformas de serialización.
- Experimentación en investigación sobre merges MoE: al ser un merge documentado con arquitectura MoE y licencia Apache 2.0, sirve como caso de estudio reproducible para evaluar calidad de merges y cuantizaciones en tareas creativas.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 10,9 GB (Q2_K) a 27,7 GB (Q8_0), puede ejecutarse en GPUs de consumo para pruebas de escritura asistida sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,9 GB (Q2_K) y 27,7 GB (Q8_0) solo para los pesos; añadir overhead de contexto y caché KV. Las cuantizaciones recomendadas Q4_K_S (16,0 GB) y Q4_K_M (17,3 GB) son el punto de equilibrio habitual.
- GPU recomendadas: para Q4_K_M en su totalidad, GPUs con 24 GB (RTX 3090, RTX 4090) o superiores; A100 40/80 GB y H100 para despliegues de mayor concurrencia o cuantizaciones Q8_0.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB conviene usar Q3_K_M o IQ4_XS con offloading parcial a CPU; en 12 GB, Q2_K o Q3_K_S con offloading.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos originales del repo base.
- Latencia y throughput estimados: no disponibles; al ser un MoE con ≈4B activos, el throughput debería ser superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.6 (este) | 26B totales / ≈4B activos | no disponible | Ficción, roleplay, escritura creativa | Apache 2.0 | GGUF en HF |
| Gemma 2 27B (referencia de arquitectura) | 27B densos | 8K (versión base) | Propósito general | Gemma Terms | Pesos oficiales y GGUF de terceros |
| Modelos de rol de 20-30B basados en Llama/Mistral | 20-30B densos | 4K-32K según variante | Roleplay y ficción | Varía (a menudo Llama/Mistral) | GGUF en HF |

La comparación directa con alternativas concretas de rol no está disponible en la información proporcionada; los datos de Gemma 2 27B se incluyen solo como referencia arquitectónica y deben verificarse en fuentes oficiales.

## Limitaciones y advertencias

- Es un merge experimental: la calidad puede variar de forma no uniforme entre géneros y estilos, y no hay evaluaciones publicadas que la respalden.
- Riesgo de alucinación y de inconsistencias narrativas en contextos muy largos; la longitud de contexto no está documentada, lo que dificulta planificar su uso en novelas largas.
- Solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- El tag `swearing` indica que el modelo puede producir lenguaje soez; requiere filtrado o instrucciones explícitas en entornos orientados al público general.
- No hay información sobre sesgos, datos de entrenamiento ni filtros de seguridad; en producción conviene añadir moderación propia.
- Aunque la licencia es Apache 2.0, los términos de los modelos componentes del merge podrían imponer restricciones adicionales; conviene revisar el repo base antes de un uso comercial.
- No soporta de forma documentada tool calling ni agentes; no es adecuado para pipelines de automatización que dependan de function calling.
- El repo de cuantizaciones ocupa 187,7 GB; la descarga de todas las variantes es costosa y conviene seleccionar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.6
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Goetia-26B-A4B-v1.6-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
