# kouzen-neo/KazeGemPT-E2B-it-v2-GGUF

## Resumen

KazeGemPT E2B IT v2 (GGUF) es la versión cuantizada en formato GGUF del modelo kouzen-neo/KazeGemPT-E2B-it-v2, un fine-tune de texto derivado de google/gemma-4-E2B-it orientado específicamente a la traducción de OCR de manga. El autor, kouzen-neo, lo ha ajustado para el pipeline KZRS, una herramienta de traducción de páginas de manga que requiere salidas JSON estrictas y etiquetado SKIP para segmentos no traducibles. El modelo cubre tres idiomas: japonés, inglés e indonesio.

El modelo cuenta con 4.628.569.635 parámetros totales (aproximadamente 4,6 mil millones), lo que lo sitúa en la gama de modelos pequeños-medianos aptos para inferencia local. La versión GGUF incluye siete niveles de cuantización, desde BF16 (9,27 GB) hasta Q2_K (2,98 GB), lo que permite desplegarlo en hardware de consumo con VRAM limitada. El repositorio ocupa 31,3 GB e incluye todos los archivos de cuantización.

La relevancia de esta ficha radica en que se trata de un modelo especializado en una tarea muy concreta (traducción de manga con formato estructurado) y disponible bajo licencia Apache-2.0, lo que facilita su integración en herramientas de producción. No obstante, la información pública es escasa: no se han publicado resultados de benchmarks estándar ni detalles sobre el dataset de entrenamiento, y el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de google/gemma-4-E2B-it, según model card) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | ja, en, id |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card indica que se trata de un fine-tune de texto con fusión de pesos (merged fine-tune) en bf16 sobre google/gemma-4-E2B-it. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El dataset de entrenamiento no está publicado, aunque el autor afirma que no se utilizaron páginas de manga ni escaneos con derechos de autor. Las frases de origen incluyen datos de Tatoeba bajo licencia CC-BY 2.0 FR.

La innovación técnica destacable no reside en la arquitectura (hereda la de Gemma 4 E2B), sino en el ajuste para producir salidas JSON estrictas y etiquetas SKIP en el contexto del pipeline KZRS. La model card menciona que se alcanza un 100% de JSON estricto en los 98 fragmentos de prueba, lo que sugiere un entrenamiento orientado al cumplimiento de formato. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto entre japonés, inglés e indonesio, con especialización en diálogo de manga.
- Generación de salidas JSON estrictas, verificada en 98 fragmentos de prueba (100% de cumplimiento según la model card).
- Etiquetado SKIP para segmentos que no deben traducirse (precisión del 80,0% en el estilo de cómic inglés Pepper&Carrot, según la model card).
- Modo conversacional (tag `conversational` en Hugging Face).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de razonamiento desactivable mediante `--reasoning off` en llama.cpp (la model card recomienda desactivarlo siempre).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Traducción automatizada de manga japonés-inglés: el modelo se integra en el pipeline KZRS para procesar lotes de páginas OCR y generar traducciones con formato JSON, lo que facilita el post-procesado y la validación automática.
- Traducción japonés-indonesio para scanlation: el soporte nativo de indonesio permite cubrir un mercado de traducción de manga menos atendido por modelos generalistas, con salidas estructuradas listas para insertar en plantillas de diálogo.
- Integración en herramientas de OCR con validación estricta: gracias al 100% de JSON estricto en las pruebas, el modelo puede conectarse a pipelines que rechacen salidas no parseables, reduciendo la necesidad de reintentos.
- Despliegue local en estaciones de trabajo de scanlation: con la cuantización Q4_K_M (3,42 GB), el modelo cabe en GPUs de consumo y permite traducir sin enviar páginas a servicios en la nube.
- Filtrado de segmentos no traducibles: la etiqueta SKIP permite identificar onomatopeyas, ruido OCR o texto no diálogo, lo que simplifica la limpieza previa a la traducción.
- Servicio de traducción por API local: el ejemplo de la model card con `llama-server` y el endpoint compatible con OpenAI (`/v1`) permite montar un microservicio de traducción para herramientas internas.
- Evaluación de calidad de traducción en dominios especializados: al ser un fine-tune pequeño y especializado, sirve como baseline para comparar con modelos generalistas en tareas de traducción de cómic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas específicas del pipeline KZRS:

| Metrica | Resultado | Contexto |
|---|---|---|
| SKIP accuracy (estilo Pepper&Carrot) | 80,0% | Cómic inglés |
| JSON estricto | 100% | 98 fragmentos de prueba |
| chrF diálogo vs. teacher | Ligeramente inferior a v1 en Synthetic y Pepper&Carrot; mejorado en páginas reales de manga japonés y Synthetic vs. GT humano | Según model card |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB con Q4_K_M (3,42 GB de archivo), 4,95 GB con Q8_0 y 9,27 GB con BF16, más overhead de contexto.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M o inferiores en tarjetas de 6-8 GB (por ejemplo, RTX 3060, RTX 4060); Q2_K (2,98 GB) para entornos con menos de 4 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), según la model card; también es compatible con Ollama y otros runners GGUF, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan características estructurales con alternativas plausibles de la misma categoría, marcando los datos no disponibles:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KazeGemPT E2B IT v2 (GGUF) | 4,63 B | no disponible | ja, en, id | Apache-2.0 | GGUF |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | Apache-2.0 (según model card) | safetensors |
| Modelos de traducción especializados de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; se recomienda evaluar el modelo en el pipeline KZRS frente a la versión base y a modelos generalistas multilingües.

## Limitaciones y advertencias

- El dataset de entrenamiento no está publicado, lo que impide auditar la composición y los posibles sesgos.
- La precisión SKIP en estilo de cómic inglés (Pepper&Carrot) es del 80,0%, por lo que aproximadamente uno de cada cinco segmentos podría clasificarse incorrectamente.
- La métrica chrF de diálogo es ligeramente inferior a la versión v1 en algunos conjuntos (Synthetic y Pepper&Carrot), aunque mejora en páginas reales de manga japonés.
- El modelo está especializado en traducción de manga y OCR; su rendimiento en otros dominios no está documentado.
- Solo cubre japonés, inglés e indonesio; no se documentan otros idiomas.
- La model card recomienda desactivar siempre el razonamiento (`--reasoning off`); su uso con razonamiento activado no está validado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante en traducción automática de diálogo.
- Licencia Apache-2.0 permite uso comercial, pero la atribución a Tatoeba (CC-BY 2.0 FR) debe mantenerse según la model card.
- El modelo tiene cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan limitaciones de contexto más allá del ejemplo con `-c 8192`.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-v2-GGUF
- Modelo base: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-v2
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Tatoeba: https://tatoeba.org
- Licencia CC-BY 2.0 FR: https://creativecommons.org/licenses/by/2.0/fr/
