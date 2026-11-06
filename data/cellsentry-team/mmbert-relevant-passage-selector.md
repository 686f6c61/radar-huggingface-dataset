# cellsentry-team/mmbert-relevant-passage-selector

## Resumen

mmBERT Relevant Passage Selector es un clasificador experimental de texto desarrollado por el equipo cellsentry-team. Su función es evaluar pares formados por un objetivo (target) y un fragmento de texto (passage) y decidir si el fragmento debe conservarse o descartarse en el contexto de ese objetivo. No genera resúmenes, no extrae entidades ni campos estructurados y no detecta datos personales: únicamente devuelve la clase `keep` o `discard` junto con dos puntuaciones no calibradas, y en caso de conservación reproduce el fragmento original de forma literal.

El modelo parte de jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT con capacidades multilingües, y ha sido ajustado de forma independiente sobre un conjunto de datos privado (variante `segment-extraction-mmbert-europe-v1`, paso 500). La versión publicada es una cuantización UINT4 de solo pesos (group size 64, escalas y offsets en FP16) con una cabeza de clasificación de dos clases en FP32. El encoder ocupa 172.802.432 bytes, la cabeza 6.288 bytes y el tokenizador 34.363.188 bytes.

Su relevancia es acotada: se trata de un activo de investigación independiente, no integrado en ningún producto, con una evaluación limitada a 108 pares sintéticos y plantillas paralelas en ocho idiomas. Resulta útil como referencia para experimentar con selección de pasajes multilingüe y con cuantización personalizada en CPU, pero no constituye un sistema validado clínicamente ni un motor de búsqueda completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT / mmBERT base) con cabeza de clasificación de dos clases |
| Parametros totales | No disponible (el encoder cuantizado ocupa 172.802.432 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens para la entrada formateada, incluidos tokens especiales (a pesar del contexto teórico mayor de la configuración base) |
| Tipos de cuantizacion | UINT4 afín empaquetada de solo pesos (group size 64, escalas y offsets FP16); cabeza en FP32; no es GGUF ni Q4_K_M |
| Idiomas soportados | zh, en, fr, de, es, it, pt, nl, pl |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder UINT4 personalizado y cabeza FP32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de la familia ModernBERT en su variante multilingüe mmBERT, sobre la que se añade una cabeza de clasificación lineal de dos clases. El ajuste fino se realizó de forma independiente a partir de una fuente privada denominada `segment-extraction-mmbert-europe-v1` en el paso 500. El encoder, la cabeza, el tokenizador, la configuración y los helpers de inferencia y cuantización son idénticos byte a byte a esa fuente; solo cambian la model card pública, el nombrado de despliegue y los manifiestos de publicación.

La innovación técnica principal es la cuantización: el encoder emplea safetensors UINT4 con empaquetado afín y grupo de 64, con escalas y offsets en FP16, mientras que la cabeza permanece en FP32. No se trata de un runtime INT4 optimizado: el cargador incluido ejecuta el cómputo en CPU con FP32, desquantizando los pesos lineales en cada llamada, y no se han establecido ni la reducción de RAM pico ni la aceleración. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La plantilla de prompt es fija y heredada del original en chino: `提取目标：{target}\n当前段：{segment}`, con salto de línea real entre campos, y se mantiene aunque el objetivo y el pasaje estén en otro idioma.

## Capacidades

- Clasificación binaria de pares objetivo-pasaje con etiquetas `discard` y `keep`; se conserva cuando `P(keep) >= 0.7`.
- Devolución literal del pasaje completo cuando la decisión es conservar, sin reescritura ni resumen.
- Soporte multilingüe declarado para ocho idiomas: chino, inglés, francés, alemán, español, italiano, portugués, neerlandés y polaco.
- Procesamiento por lotes mediante CLI (`infer.py`) sobre ficheros JSONL con campos `id`, `target` y `segment`.
- Salida estructurada con `id`, `status` y dos probabilidades; el campo `text` solo aparece en los casos `keep`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No es un extractor de entidades, detector de PII, extractor de campos, resumidor, generador de respuestas ni motor de búsqueda completo.

## Casos de uso

- Filtrado previo de pasajes en un pipeline RAG: dado un objetivo de consulta y un fragmento recuperado, el clasificador decide si el fragmento aporta información relevante antes de pasarlo al generador, reduciendo el ruido en el contexto de entrada.
- Curación de corpus multilingüe: aplicar el modelo sobre pares objetivo-fragmento en los ocho idiomas soportados para descartar secciones irrelevantes de documentación antes de indexarlas, manteniendo el texto original intacto para trazabilidad.
- Selección de evidencia en revisión documental: como paso auxiliar que marca fragmentos candidatos a conservar, siempre con revisión humana posterior y sin ocultar evidencia potencialmente relevante solo por el umbral del modelo.
- Preprocesado de datasets de investigación: usar el clasificador para construir subconjuntos de pasajes relevantes respecto a un objetivo definido, con fines de experimentación reproducible fijando el commit público y verificando los hashes.
- Evaluación de cuantización en CPU: servir como caso de referencia para medir el comportamiento de un encoder UINT4 de solo pesos con desquantización en cada llamada frente a la variante FP32.
- Filtrado de contexto en asistentes de documentación técnica: descartar párrafos de manuales que no guarden relación con la consulta del usuario antes de construir el prompt final, respetando los límites de 512 tokens por par.
- Experimentación con plantillas multilingües: analizar cómo se comporta un prompt fijo en chino sobre entradas en otros idiomas, útil para estudiar transferencia entre idiomas en encoders multilingües.

## Benchmarks y rendimiento

La única evaluación publicada cubre 108 pares sintéticos cortos, balanceados y basados en plantillas (54 positivos, 54 negativos), con 12 pares por idioma. Los casos en lenguas extranjeras son plantillas paralelas, no muestras reales independientes. Se trata de casos de regresión previamente usados, no de una evaluación ciega nueva.

| Modelo | Precisión | F1 | TP | TN | FP | FN |
|---|---|---|---|---|---|---|
| mmBERT Relevant Passage Selector Q4 | 96,30 % | 96,30 % | 52 | 52 | 2 | 2 |
| Referencia FP32 | 100 % | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los resultados agregados se conservan en `evaluation-summary.json` y `evaluation-report.md`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración publicada, que ejecuta el cómputo en CPU con FP32 y desquantiza los pesos lineales en cada llamada.
- RAM: el encoder cuantizado ocupa 172.802.432 bytes en disco; la reducción de RAM pico frente a FP32 no ha sido establecida por el autor.
- GPU recomendadas: no disponibles; el cargador incluido está pensado para CPU con una build de PyTorch adecuada.
- Cabe en GPU de consumo: no se ha documentado ni validado; el artefacto no está diseñado para runtimes INT4 optimizados.
- Opciones de despliegue: el repositorio incluye `infer.py` y `weight_only.py`; `AutoModel.from_pretrained` estándar no puede cargar el artefacto cuantizado directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no establecidos; el autor indica explícitamente que no se han determinado la aceleración ni la reducción de memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Cuantización | Evaluación publicada |
|---|---|---|---|---|---|---|
| mmBERT Relevant Passage Selector (Q4) | Clasificador binario sobre encoder mmBERT | 512 tokens | 9 idiomas | MIT | UINT4 de solo pesos, CPU FP32 | 108 pares sintéticos, 96,30 % accuracy/F1 |
| jhu-clsp/mmBERT-base | Encoder base multilingüe | Contexto teórico mayor que 512 (no detallado) | Multilingüe | MIT | Pesos completos | No disponible en esta ficha |
| Referencia FP32 del mismo ajuste | Clasificador binario sobre encoder mmBERT | 512 tokens | 9 idiomas | No publicada en este repositorio | FP32 | 100 % en el mismo conjunto de 108 pares |

No se dispone de información sobre otros clasificadores de selección de pasajes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Evaluación muy limitada: 108 pares sintéticos y balanceados basados en plantillas, con 12 por idioma; los casos en lenguas extranjeras son plantillas paralelas, no muestras reales.
- No es una evaluación ciega ni se ejecutó una nueva evaluación para esta publicación; los resultados son casos de regresión previamente usados.
- Las puntuaciones son scores de modelo no calibrados; el umbral de 0,7 no debe interpretarse como probabilidad calibrada.
- Los resultados no establecen seguridad clínica, recall completo de evidencia, soporte robusto de OCR ni precisión multilingüe en producción.
- No debe usarse para ocultar silenciosamente evidencia potencialmente relevante en flujos de revisión exhaustiva basándose solo en el umbral.
- El prompt es una plantilla fija en chino que se conserva aunque la entrada esté en otro idioma, lo que puede afectar al comportamiento en lenguas distintas del chino.
- Límite estricto de 512 tokens para la entrada formateada, incluidos tokens especiales; los desbordamientos y fallos de procesamiento deben tratarse como errores explícitos, nunca convertirse en `discard`.
- El particionado, la recuperación, el mapeo a fuente o página, la deduplicación y la revisión humana son responsabilidad del llamador.
- El artefacto cuantizado no se carga con `AutoModel.from_pretrained` estándar; requiere el helper `weight_only.py` incluido, y conviene revisar los helpers locales antes de ejecutarlos.
- Los helpers históricos conservan ramas de PII no utilizadas; la CLI incluida está fija a selección de pasajes y no se incluye ningún modelo de PII ni pipeline de candidatos.
- Solo se publican metadatos agregados de evaluación; no se incluyen documentos crudos de entrenamiento o evaluación, datos de pacientes, estado del optimizador ni credenciales.
- El modelo no está integrado en ningún producto y es un activo de investigación independiente; la atribución histórica no implica asociación con un producto actual.
- No se dispone de información sobre sesgos específicos más allá de las limitaciones de generalización del origen chino señaladas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cellsentry-team/mmbert-relevant-passage-selector
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Revisión del modelo base citada: `c5955035435e2bf121cde7f3c8863ef52ff35d82`
- Manifiesto de origen y hashes: `SOURCE-MANIFEST.json` y `SHA256SUMS.txt` dentro del repositorio
- Resultados de evaluación: `evaluation-summary.json` y `evaluation-report.md` dentro del repositorio
- Model card del modelo base conservada como `upstream-model-card.md` dentro del repositorio
