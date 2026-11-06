# Haruto7261/QwenD-CPT-70

## Resumen

QwenD-CPT-70 es un modelo derivado de la familia Qwen, publicado por el usuario Haruto7261 en Hugging Face el 1 de noviembre de 2026. Por la nomenclatura (CPT, *continued pre-training*) y el tamaño indicado en el nombre (70), se trata presumiblemente de un modelo de aproximadamente 70.000 millones de parámetros sometido a un entrenamiento continuado sobre un corpus en japonés. No obstante, la model card no confirma ni el modelo base exacto, ni la arquitectura, ni el número real de parámetros.

El interés principal del modelo reside en su corpus de especialización: una mezcla de diálogos cotidianos en japonés (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes específicas del dialecto de Kagoshima (薩隅方言), registros parlamentarios (国会会議録), Aozora Bunko y Wikipedia en japonés. Esto sugiere un objetivo de adaptación al japonés coloquial y, en particular, al dialecto de Kagoshima, un nicho poco cubierto por los modelos generalistas.

La información pública disponible es muy limitada: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin pipeline especificado. La model card está redactada íntegramente en japonés y solo documenta el corpus, sin especificaciones técnicas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen; sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere ~70B; sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus es mayoritariamente japonés) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El sufijo "CPT" en el nombre y la sección "Corpus" de la model card apuntan a un entrenamiento continuado (*continued pre-training*) sobre un modelo base de la familia Qwen, pero el autor no especifica qué checkpoint se utilizó como punto de partida, ni el número de tokens de entrenamiento, ni si hubo fases posteriores de ajuste supervisado (SFT), RLHF o DPO.

El corpus documentado combina fuentes conversacionales (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), recursos léxicos y divulgativos sobre el dialecto de Kagoshima (列表 de vocabulario, diccionarios en línea, materiales de la prefectura y de la Universidad de Estudios Japoneses), transcripciones del parlamento japonés (国会会議録), textos literarios de Aozora Bunko y Wikipedia en japonés. La composición exacta, el peso relativo de cada fuente y el volumen total de tokens no se indican. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto en japonés, presumiblemente con énfasis en registro coloquial y conversacional.
- Modelado de diálogo multi-turno, a partir de las fuentes conversacionales del corpus.
- Cobertura potencial del dialecto de Kagoshima (薩隅方言), incluyendo vocabulario y expresiones recogidas en las fuentes citadas.
- Exposición a registros formales del japonés (actas parlamentarias, literatura de Aozora Bunko, Wikipedia).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el corpus es esencialmente monolingüe en japonés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Procesamiento de dialecto de Kagoshima: normalización o traducción de texto en 薩隅方言 hacia japonés estándar, aprovechando las fuentes léxicas y divulgativas incluidas en el corpus. Adecuado por la rareza de este material en modelos generalistas.
- Generación de diálogo conversacional en japonés: construcción de chatbots de registro cotidiano gracias al entrenamiento sobre Japanese-Daily-Dialogue, MACHAcorpus y RealPersonaChat.
- Análisis de actas parlamentarias japonesas: resumen o extracción de información de transcripciones del 国会会議録, un dominio representado en el corpus.
- Investigación lingüística computacional: estudio de adaptación de modelos grandes a variantes dialectales con recursos limitados, usando este checkpoint como caso de estudio.
- Generación de texto con estilo literario japonés: continuación o imitación de registros propios de Aozora Bunko, útil en experimentos creativos o educativos.
- Aumento de datos para japonés dialectal: generación sintética de ejemplos en dialecto para entrenar modelos más pequeños o construir conjuntos de evaluación.
- Experimentación académica sobre *continued pre-training*: análisis de cómo un corpus pequeño y muy especializado afecta a las capacidades de un modelo base de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; si el modelo ronda los 70.000 millones de parámetros, en FP16 requeriría del orden de 140 GB de VRAM, y en cuantización de 4 bits aproximadamente 35-40 GB.
- GPU recomendadas: no confirmadas por el autor; para un modelo de esa escala serían necesarias A100 80GB, H100 80GB o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: incierta; un modelo de ~70B en 4 bits podría caber en una RTX 4090 (24 GB) solo con cuantizaciones agresivas y descarga parcial a CPU, con rendimiento degradado.
- Opciones de despliegue: no documentadas; no se confirma la disponibilidad de pesos en formatos GGUF, AWQ o GPTQ, ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La ausencia de especificaciones confirmadas (arquitectura, parámetros, contexto, licencia) impide establecer una comparación rigurosa con alternativas de la familia Qwen o con modelos especializados en japonés.

## Limitaciones y advertencias

- Información pública mínima: sin licencia, sin idiomas declarados, sin pipeline y sin resultados de evaluación; no es apto para producción sin una validación previa exhaustiva.
- Riesgo elevado de alucinación y de degradación de capacidades generales tras el *continued pre-training* sobre un corpus pequeño y especializado.
- Sesgo de dominio: el modelo puede sobreajustarse al dialecto de Kagoshima y al registro conversacional, con pérdida de calidad en otros registros o en japonés estándar formal.
- Sesgo de fuentes: parte del corpus proviene de páginas web divulgativas y de foros, con calidad y fiabilidad heterogéneas.
- Idiomas: no se declara soporte multilingüe; el uso en castellano u otros idiomas no está respaldado por el corpus.
- Licencia: al no especificarse, no puede asumirse uso comercial; deben verificarse los términos del modelo base de Qwen y de cada fuente del corpus.
- Fecha de creación futura (2026) y ausencia de actividad (0 descargas, 0 likes): la procedencia y la reproducibilidad del checkpoint no están verificadas.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Haruto7261/QwenD-CPT-70
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- 日本全国の方言まとめ（鹿児島県の方言一覧）: https://hougen.net/kagoshima/
- みんなの“方言あるある”図鑑（鹿児島弁一覧）: https://www.alc.co.jp/
- 鹿児島の方言集: https://www.pref.kagoshima.jp/
- KING CAFE（よく使う方言50選 / 対応表）: https://kingcafe.jp/
- 方言ラボ（鹿児島弁 変換）: https://hougen-lab.com/
- 国立国語研究所『方言録音資料シリーズ』: https://www.ninjal.ac.jp/
- おんじょどいの小屋: http://www.geocities.jp/onjodoi/
- 【公式】鹿児島弁ネット辞典: https://kagoshima-ben.com/
- 47都道府県方言辞典: https://hougen.biz/
- Wikipedia『薩隅方言』: https://ja.wikipedia.org/wiki/薩隅方言
- 国会会議録データ: https://kokkai.ndl.go.jp/
- 青空文庫 (Cleaned): https://www.aozora.gr.jp/
- 日本語 Wikipedia: https://ja.wikipedia.org/
