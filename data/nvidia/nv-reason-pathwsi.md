# nvidia/NV-Reason-PathWSI

## Resumen

NV-Reason-PathWSI es un modelo de vision-lenguaje (VLM) 2D desarrollado por NVIDIA para el análisis de imágenes de patología de portaobjetos completos (whole-slide imaging, WSI). Combina un codificador visual Vision Transformer (ViT) con un modelo de lenguaje y está diseñado para generación de informes patológicos, respuesta a preguntas y razonamiento multi-paso sobre muestras histopatológicas digitalizadas. El modelo parte de Qwen/Qwen3.5-4B mediante fine-tuning, por lo que hereda la arquitectura transformer de ese modelo base con unos 4.000 millones de parámetros.

La propuesta técnica central es que todos los tokens visuales, junto con sus posiciones 2D, se pasan al modelo de lenguaje sin reducción espacial (downsampling), preservando las relaciones espaciales dentro del LLM. Esto contrasta con sistemas que operan sobre parches aislados sin contexto de portaobjetos o que comprimen características antes de la decodificación lingüística. El entrenamiento combina Supervised Fine-Tuning (SFT) y Group Relative Policy Optimization (GRPO) sobre un corpus de ejemplos de QA estructurados derivados de WSI.

Es relevante ahora porque aborda una limitación recurrente en patología computacional: la pérdida de contexto a escala de gigapíxel. No obstante, en el momento de redactar esta ficha los pesos no están publicados en el repositorio, a la espera de la publicación del artículo asociado; solo están disponibles la model card, la configuración y el tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje: codificador visual ViT 2D + LLM (Qwen3_5ForConditionalGeneration) |
| Parametros totales | aproximadamente 4.000 millones (derivado de Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (carga estándar con Transformers; pesos aún no publicados) |

## Arquitectura y entrenamiento

El modelo es un VLM 2D que acopla un codificador visual ViT con un LLM basado en Qwen3.5-4B. Las imágenes de portaobjetos completos se dividen en regiones (tiles) antes del procesamiento; el codificador convierte cada región en tokens visuales y estos, junto con sus coordenadas 2D, se inyectan en el LLM sin downsampling espacial. La codificación posicional 2D dentro del LLM preserva la disposición relativa de los parches en la muestra, lo que permite razonar sobre morfología distribuida a lo largo de la lámina.

El entrenamiento es end-to-end y combina dos fases: SFT sobre un conjunto curado de ejemplos de QA estructurados (informes patológicos estandarizados, QA centrado en anomalías, interacciones multi-turno y razonamientos redactados por patólogos), con datos sintéticos de razonamiento anclados en informes generados a partir de esas anotaciones expertas; y GRPO con recompensas verificables sobre conjuntos de hallazgos patológicos. El chat template soporta un modo `enable_thinking` para razonamiento explícito paso a paso. La carga se realiza con Transformers estándar sin necesidad de `trust_remote_code`.

## Capacidades

- Generación de informes histopatológicos a partir de regiones de portaobjetos completos.
- Respuesta a preguntas abiertas sobre características morfológicas visibles.
- Preguntas de opción múltiple con respuesta concisa (modo thinking desactivado).
- Razonamiento multi-paso explícito mediante `enable_thinking=True`, orientado a hipótesis diagnósticas revisables.
- Procesamiento de imágenes tileadas con contexto espacial 2D preservado a nivel de LLM.
- Conversación multi-turno mediante chat template.
- Soporte de imágenes en formato de parche (por ejemplo, JPG) a través de `AutoProcessor`.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni otras modalidades (audio, vídeo) en la información disponible.

## Casos de uso

- Generación asistida de informes de patología: el modelo recibe parches de la lámina y produce descripciones estructuradas de los hallazgos, útiles como borrador revisable por un patólogo en entornos de investigación.
- Formación de residentes de anatomía patológica: se plantean preguntas de opción múltiple sobre características morfológicas y el modelo responde en modo conciso, sirviendo como herramienta de autoevaluación.
- Análisis de razonamiento diagnóstico: con `enable_thinking=True`, el modelo expone una cadena de razonamiento paso a paso sobre la probable diagnosis, revisable por un experto para fines educativos.
- Investigación en patología computacional: evaluación de arquitecturas VLM que preservan contexto espacial completo frente a enfoques basados en parches aislados.
- Anotación y curación de datasets: generación de pares imagen-texto y QA derivados de WSI para ampliar corpus de entrenamiento (en línea con trabajos como PathGen-1.6M).
- Sistemas de segunda opinión en investigación: comparación de hallazgos generados por el modelo con informes expertos para estudiar discrepancias y sesgos.
- Docencia y divulgación médica: descripción abierta de características histopatológicas de una imagen para material didáctico, siempre con supervisión profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con aproximadamente 4.000 millones de parámetros en bfloat16 se requiere del orden de 8-9 GB solo para pesos, más memoria para activaciones y tokens visuales (los tokens de WSI sin downsampling pueden elevar considerablemente el consumo).
- GPU recomendadas: no especificadas en la model card; por tamaño, una GPU con 16-24 GB o superior es un punto de partida razonable, aunque la ausencia de downsampling espacial puede exigir más memoria en láminas grandes.
- Cabe en GPU de consumo: probable en GPUs con 24 GB (por ejemplo, RTX 4090) para parches individuales; para WSI completas no hay datos publicados.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoProcessor` (documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| NV-Reason-PathWSI | ~4.000 M | no disponible | VLM 2D para WSI con tokens sin downsampling y posiciones 2D | OpenMDW-1.1 | No publicados aún (a fecha de la información) |
| Qwen/Qwen3.5-4B (base) | ~4.000 M | no disponible | LLM multimodal generalista | según modelo base | Disponible |
| Alternativas específicas de patología WSI | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables específicos de patología en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio contiene model card, configuración y tokenizer, pero no los pesos, a la espera de la publicación del artículo.
- Uso exclusivamente de investigación y educación: la model card indica explícitamente que no debe emplearse para diagnóstico clínico ni decisiones de tratamiento; toda salida requiere revisión por profesionales médicos cualificados.
- Riesgo de alucinación: como VLM generativo, puede producir hallazgos o razonamientos plausibles pero incorrectos; el modo thinking no garantiza corrección.
- Idioma: solo inglés documentado, lo que limita su uso directo en castellano sin traducción o ajuste.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los datos provienen de informes y anotaciones expertas, con posible sesgo de selección del corpus.
- Contexto: la longitud de contexto no está publicada; el procesamiento de WSI completas depende del tileado y del número de tokens visuales, lo que puede limitar láminas de gran tamaño.
- Licencia OpenMDW-1.1: permite uso comercial según la model card, pero conviene revisar los términos completos del archivo LICENSE antes de integrarlo en producción.
- Sin soporte documentado de tool calling ni de cuantizaciones específicas; el flujo de referencia usa bfloat16.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/NV-Reason-PathWSI
- Licencia: https://huggingface.co/nvidia/NV-Reason-PathWSI/blob/main/LICENSE
- Repositorio GitHub: https://github.com/NVIDIA-Medtech/NV-Reason-PathWSI
- Artículo Pathology-CoT (arXiv:2510.04587): https://arxiv.org/abs/2510.04587
- Artículo PathGen-1.6M (arXiv:2407.00203): https://arxiv.org/abs/2407.00203
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA (sitio corporativo): https://www.nvidia.com/
