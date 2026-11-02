# Haruto7261/QwenB-CPT-50-SFT

## Resumen

QwenB-CPT-50-SFT es un modelo derivado de la familia Qwen, publicado por el usuario Haruto7261 en HuggingFace. El nombre sugiere un proceso de preentrenamiento continuado (CPT, *continued pre-training*) seguido de un ajuste fino supervisado (SFT), con un corpus de 50 elementos o iteraciones, aunque el autor no documenta explícitamente esa nomenclatura. No se dispone de información sobre la arquitectura base concreta, el número de parámetros ni la longitud de contexto.

La model card está redactada íntegramente en japonés y se centra en la composición del corpus de entrenamiento, no en las especificaciones técnicas del modelo. El corpus combina diálogos cotidianos en japonés (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes sobre el dialecto de Kagoshima (薩隅方言), datos del Dieta nacional (国会会議録) y textos de Aozora Bunko y Wikipedia en japonés. El objetivo aparente es adaptar un modelo base al japonés y, en particular, al dialecto de Kagoshima.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, carece de licencia declarada y no publica benchmarks. Se documenta aquí como referencia técnica de un experimento de CPT/SFT sobre corpus dialectal japonés, con todas las cautelas propias de un modelo sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen; sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (implícito por el corpus); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre del repositorio ("QwenB-CPT-50-SFT") indica que se partió de un modelo de la familia Qwen (la "B" podría referirse a una variante *base*) y se aplicó un preentrenamiento continuado seguido de un ajuste fino supervisado. No se documentan el número de tokens de entrenamiento, la composición porcentual del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

El corpus declarado por el autor combina cuatro bloques: diálogos cotidianos en japonés (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), material léxico y descriptivo del dialecto de Kagoshima (薩隅方言) procedente de webs especializadas, el repositorio de actas parlamentarias (国会会議録), y texto literario y enciclopédico (Aozora Bunko, Wikipedia en japonés). No se especifica la proporción de cada fuente ni el proceso de limpieza o filtrado aplicado.

## Capacidades

- Generación de texto en japonés, presumiblemente adaptada al registro conversacional y al dialecto de Kagoshima.
- Diálogo multi-turno, a partir de los corpus de conversación empleados (Japanese-Daily-Dialogue, RealPersonaChat).
- Comprensión de texto literario y enciclopédico en japonés (Aozora Bunko, Wikipedia).
- Posible manejo de registro formal y parlamentario (国会会議録).
- Capacidades de tool calling, function calling, agentes, visión, audio o modo *thinking*: no disponibles o no documentadas.

## Casos de uso

- **Investigación en dialectología computacional**: el modelo puede emplearse como banco de pruebas para evaluar la adaptación de un LLM al dialecto de Kagoshima (薩隅方言), comparando su salida con la de modelos base sin ajuste dialectal.
- **Generación de diálogo sintético dialectal**: útil para aumentar corpus de conversación en dialectos minorizados, siempre que se valide manualmente la calidad y autenticidad de las muestras producidas.
- **Prototipos de asistentes conversacionales en japonés**: para entornos de investigación donde se requiera un modelo ligero ajustado a registro coloquial japonés, sin garantías de producción.
- **Normalización dialecto-estándar**: experimentación con tareas de traducción entre japonés dialectal de Kagoshima y japonés estándar, aprovechando el material léxico incluido en el corpus.
- **Análisis de registro parlamentario**: exploración de tareas de resumen o clasificación sobre actas de la Dieta, dado el uso de 国会会議録 en el entrenamiento.
- **Reproducción de experimentos CPT/SFT**: el repositorio sirve como referencia metodológica para quienes diseñan pipelines de preentrenamiento continuado sobre corpus japonés especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base, no declarado).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; al no documentarse el formato de pesos, no puede confirmarse compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable sin conocer el modelo base, el número de parámetros y la licencia. A modo de referencia cualitativa, se indican alternativas de la familia Qwen y de modelos ajustados al japonés, sin datos de rendimiento comparables para este repositorio concreto.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Haruto7261/QwenB-CPT-50-SFT | no disponible | no disponible | no disponible | Sin benchmarks ni descargas |
| Qwen2.5 (familia) | 0,5B–72B | hasta 128K en variantes grandes | Apache 2.0 / Qwen License segun variante | Base probable; no confirmado |
| Modelos japoneses ajustados (p. ej. variantes de Swallow, llm-jp) | variable | variable | variable | Alternativas de referencia para japonés; comparación no directa |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declaran parámetros, contexto, formato de pesos ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Corpus sesgado hacia fuentes web de divulgación dialectal y a un único dialecto (Kagoshima), lo que puede producir sobreajuste a ese registro y degradar el japonés estándar.
- Riesgo elevado de alucinación y de generar dialectalismos inexactos o inventados, dado el volumen limitado y heterogéneo de las fuentes dialectales.
- Sin métricas de evaluación publicadas: no hay evidencia de calidad, seguridad ni alineación.
- Cero descargas e interacciones: no existe validación por parte de la comunidad.
- Fecha de creación registrada en 2026-11-02, posterior a la fecha actual de redacción; conviene verificar la integridad y procedencia del repositorio.
- No se documentan medidas de mitigación de sesgos ni filtrado de datos personales en los corpus conversacionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Haruto7261/QwenB-CPT-50-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- 国会会議録: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
- Wikipedia, 薩隅方言: https://ja.wikipedia.org/wiki/薩隅方言
- 国立国語研究所: https://www.ninjal.ac.jp/
- 鹿児島県, 方言集: https://www.pref.kagoshima.jp/
- 鹿児島弁ネット辞典: https://kagoshima-ben.com/
- 方言ラボ: https://hougen-lab.com/
- 47都道府県方言辞典: https://hougen.biz/
- KING CAFE, 方言50選: https://kingcafe.jp/
- 方言まとめ (鹿児島県): https://hougen.net/kagoshima/
- みんなの“方言あるある”図鑑: https://www.alc.co.jp/
- おんじょどいの小屋: http://www.geocities.jp/onjodoi/
