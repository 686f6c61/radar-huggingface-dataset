# mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source, publicada por el cuantizador mradermacher. El modelo base es un fine-tune de 27.320.697.856 parámetros (aproximadamente 27B) construido sobre la familia Qwen, orientado a escritura creativa, ficción de terror, roleplaying y simulaciones de personajes, con un enfoque deliberadamente "uncensored" y "abliterated" (sin restricciones de alineación). Según las etiquetas del autor, incorpora 13 modos de razonamiento, 13 modos instruct y 10 "constructos de IA maligna" como personalidades preconfiguradas.

La relevancia de esta ficha no está tanto en el modelo base como en el trabajo de cuantización: mradermacher ofrece 17 variantes cuantizadas que van desde 11 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K), lo que permite ejecutar un modelo de 27B en hardware de consumo. La cuantización con imatrix (IQ) suele preservar mejor la calidad que las cuantizaciones estáticas de tamaño equivalente. El repositorio de cuantizaciones estáticas complementarias también está disponible, y se indica que el modelo base sería un modelo de visión, con los ficheros mmproj en el repositorio estático.

Cabe destacar que se trata de un modelo temático de terror/Halloween con contenido potencialmente perturbador (etiquetado "not-for-all-audiences"), pensado para usos creativos y de entretenimiento, no para tareas productivas generales. La licencia heredada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen), no disponible el detalle exacto |
| Parametros totales | 27.320.697.856 (≈27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de un modelo Qwen de 27B parámetros realizado por DavidAU (con herramientas de Unsloth, según las etiquetas). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO; de hecho, las etiquetas "abliterated" y "uncensored" indican que se han eliminado o mitigado las capas de rechazo del modelo original, lo contrario de un proceso de alineación por preferencias humanas. Las etiquetas del autor mencionan "13 reasoning modes", "13 instruct modes" y "10 EVIL AI Constructs", lo que sugiere plantillas de prompt o personalidades específicas incluidas en la model card del modelo fuente, aunque los detalles técnicos no están disponibles en esta ficha.

La aportación de mradermacher es la cuantización GGUF con matriz de importancia (imatrix), una técnica que calcula estadísticas de activación sobre un corpus de calibración para asignar con mayor precisión los niveles de cuantización de cada tensor. Las cuantizaciones IQ (IQ3_S, IQ4_XS, etc.) suelen superar en calidad a las cuantizaciones K de tamaño similar. La model card también indica que el modelo base sería un modelo de visión, con los ficheros mmproj disponibles en el repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto creativo: escritura de ficción de terror, historias y "todos los géneros" según las etiquetas del autor.
- Roleplaying y simulación de personajes: incluye 10 personalidades preconfiguradas ("EVIL AI Constructs") y un "Halloween O/S".
- Razonamiento: el autor anuncia 13 modos de razonamiento y soporte de "thinking" (pensamiento extendido estilo Qwen3), aunque el funcionamiento exacto no está documentado aquí.
- Instrucciones: 13 modos instruct anunciados por el autor.
- Contenido sin restricciones: al estar "abliterated" y "uncensored", no rechaza peticiones que los modelos alineados sí rechazarían; esto es una capacidad buscada en este nicho, pero también un riesgo.
- Visión: la model card del cuantizador indica que el modelo base es un modelo de visión; los ficheros mmproj están en el repositorio estático. No disponible más detalle.
- Multilingüe: solo se declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.

## Casos de uso

- Escritura de ficción de terror: generación de relatos largos, novelas por capítulos y prosa oscura; el modelo está fine-tuned específicamente para el género de horror y la escritura creativa de todos los géneros.
- Roleplaying interactivo: creación de personajes para juegos de rol narrativos o plataformas tipo SillyTavern, aprovechando las personalidades preconfiguradas ("EVIL AI Constructs") y los modos instruct/reasoning.
- Diseño de NPCs para videojuegos: generación de diálogos y personalidades de personajes siniestros o villanos para juegos de terror, donde la falta de filtros permite diálogos más crudos.
- Generación de guiones y contenido para Halloween: ideas de historias, atmósferas y diálogos para podcasts, creepypastas o contenido de entretenimiento temático.
- Experimentación con modelos abliterated: investigación sobre cómo la eliminación de capas de alineación afecta al comportamiento y la calidad de generación de un modelo Qwen de 27B.
- Prueba de cuantizaciones imatrix en hardware de consumo: el abanico de 17 cuantizaciones (de 11 a 22,5 GB) lo hace útil como banco de pruebas para comparar la degradación de calidad entre niveles IQ/K en modelos de 27B.
- Escritura asistida sin filtros para autores adultos: autores que necesitan explorar temas oscuros, violencia ficticia o contenido maduro que los modelos comerciales rechazan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, sin contexto extra): i1-Q2_K (11 GB) cabe en una RTX 3060 de 12 GB; i1-Q4_K_M (16,9 GB) requiere una GPU de 24 GB como RTX 3090/4090 o se puede repartir con offload a CPU; i1-Q5_K_M (19,6 GB) y i1-Q6_K (22,5 GB) necesitan 24 GB de VRAM o descarga parcial a RAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para las cuantizaciones Q4-Q6 completas; RTX 3060 12 GB o RTX 4060 Ti 16 GB para las cuantizaciones Q2/Q3. En servidor, cualquier GPU con 24 GB o más (A100, L40S) ejecuta todas las variantes con holgura.
- Consumer GPU: sí, cabe en GPUs de consumo; con una RTX 4090 se puede ejecutar hasta i1-Q6_K íntegramente en VRAM; con 12-16 GB hay que usar las cuantizaciones bajas o hacer offload de capas a CPU/RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp (habitual para roleplaying), y cualquier runtime compatible con GGUF. No está indicado soporte para vLLM o TGI con estos ficheros cuantizados.
- Latencia y throughput: no disponible. En general, las cuantizaciones Q4 sobre un modelo de 27B alcanzan velocidades cómodas en una RTX 4090, mientras que las variantes con offload a CPU sufren una caída notable de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored (esta ficha) | 27B | GGUF (imatrix), safetensors en base | Apache 2.0 | Terror, escritura creativa, uncensored, roleplaying |
| Qwen3-30B-A3B (oficial, no disponible comparativa de rendimiento) | 30B (MoE, 3B activos) | safetensors, GGUF comunitario | Apache 2.0 | Uso general, razonamiento, multilingüe |
| Dolphin 3.0 (basado en Qwen/Llama, no disponible detalle exacto) | variable (8B-24B según versión) | safetensors, GGUF comunitario | Apache 2.0 / otras | Fine-tune uncensored de uso general |

Nota: no hay benchmarks que permitan comparar rendimiento numérico; la comparativa se limita a categoría, tamaño y licencia. Dentro del nicho de modelos "uncensored" de escritura creativa, las alternativas más habituales son los fine-tunes Dolphin (Cognitive Computations) y otros modelos de DavidAU, aunque de tamaños y enfoques distintos.

## Limitaciones y advertencias

- Contenido sensible: el modelo está etiquetado "not-for-all-audiences"; al estar abliterated y uncensored, puede generar contenido violento, perturbador o inapropiado sin rechazarlo. No es apto para entornos de producción orientados a usuarios finales sin filtros adicionales.
- Riesgo de alucinación: no disponible dato específico, pero como todo LLM puede inventar hechos; al carecer de alineación, no advierte de sus propios errores.
- Idioma: solo se declara soporte de inglés. El rendimiento en castellano no está documentado y puede ser significativamente peor.
- Contexto: la longitud de contexto no está documentada en esta ficha; consultar la model card del modelo base o la configuración del tokenizador antes de planificar cargas con documentos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario; los términos del modelo base de DavidAU heredan Apache 2.0 según la model card.
- Calidad de las cuantizaciones bajas: las variantes i1-Q2_K e i1-Q4_0 están marcadas por el propio cuantizador como de calidad reducida; se recomienda i1-Q4_K_S/M o IQ4_XS como equilibrio.
- Visión: se declara que el modelo base es un modelo de visión, pero los ficheros mmproj están en el repositorio estático, no en este; verificar compatibilidad antes de asumir capacidades multimodales.
- Benchmarks: al no existir evaluaciones publicadas, no hay garantías de rendimiento en tareas de razonamiento, código o matemáticas frente al modelo Qwen del que procede.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- FAQ / solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
