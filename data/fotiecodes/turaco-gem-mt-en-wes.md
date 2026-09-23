# fotiecodes/Turaco-gem-mt-en-wes

## Resumen
Turaco-gem-mt-en-wes es un checkpoint de traducción automática desarrollado por el usuario fotiecodes dentro de la familia Turaco. Se construye sobre google/translategemma-4b-it (revisión 10042cb0e6e7fdce748996a71dc3dc432a4e0c89) y lo adapta a una única dirección de traducción: inglés (en) hacia pidgin de Camerún (wes). El ajuste se realizó con QLoRA de 4 bits y supervisión completa sobre un corpus reducido de 1.024 ejemplos de entrenamiento.

El modelo publica 4.300.079.472 parámetros en safetensors (8,6 GB de repositorio) y hereda la naturaleza multimodal de TranslateGemma, con pipeline image-text-to-text, aunque las capas de visión se congelaron durante el ajuste y no se evaluaron para pidgin de Camerún. La ventana de contexto configurada es de 768 tokens y la secuencia máxima usada en entrenamiento fue de 512 tokens.

Su interés es acotado pero claro: el pidgin de Camerún es un idioma de bajos recursos con poca cobertura en sistemas de traducción comercial, y este checkpoint documenta de forma transparente un proceso reproducible en una única Tesla T4. El propio autor advierte de que las métricas internas (chrF++ 23,11; SacreBLEU 4,86) proceden de un conjunto de prueba del mismo corpus y no deben presentarse como resultados de referencia externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) heredada de google/translategemma-4b-it; el autor no detalla número de capas, cabezas de atención ni configuración interna |
| Parámetros totales | 4.300.079.472 (unos 4,3 mil millones) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 768 tokens configurados; secuencia máxima de entrenamiento: 512 tokens |
| Tipos de cuantización | Pesos publicados en safetensors a precisión completa (bf16/fp16, 8,6 GB). El autor recomienda carga en 4 bits con Unsloth en GPUs solo compatibles con float16, como la Tesla T4. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) y pidgin de Camerún (wes); únicamente dirección en → wes |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors, librería transformers |
| Método de ajuste | QLoRA de 4 bits supervisado; rango LoRA 32, alpha 32 |
| Modelo base | google/translategemma-4b-it (revisión 10042cb0e6e7fdce748996a71dc3dc432a4e0c89) |
| Dataset de entrenamiento | fotiecodes/Turaco-NLLB-mt-en-wes-cleaned-dataset (revisión b95e28f77b36200d7be67a49513457d9c1f1696e) |
| Tamaño del repositorio | 8,6 GB |
| Hardware de entrenamiento | 1 GPU Tesla T4 (14,6 GB) |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base TranslateGemma 4B, un transformer multimodal orientado a traducción que acepta entradas de texto e imagen (pipeline image-text-to-text en HuggingFace). El autor no aporta detalles sobre el número de capas, el mecanismo de atención ni la configuración del codificador de visión; lo que sí documenta es que las capas de visión permanecieron congeladas y no se evaluaron para pidgin de Camerún, por lo que el comportamiento multimodal del checkpoint no está validado.

El ajuste fino consistió en un QLoRA de 4 bits con rango y alpha de 32 sobre 1.024 ejemplos de entrenamiento (más 128 de validación y 128 de prueba). La configuración fue: 1 época, tasa de aprendizaje 0,0001, micro-lote de 2, acumulación de gradiente de 16 (lote efectivo de 32), optimizador AdamW de 8 bits, planificador coseno, pérdida calculada solo sobre la respuesta y semilla determinista 42. La innovación relevante no está en la arquitectura sino en la integración del idioma: se parcheó `chat_template.jinja` para añadir la entrada `wes: Cameroon Pidgin` al mapeo de códigos de idioma de TranslateGemma, que originalmente no contemplaba el pidgin de Camerún. El dataset utilizado ya estaba limpiado previamente y el autor no volvió a ejecutar el pipeline de limpieza.

## Capacidades
- Traducción de texto de inglés a pidgin de Camerún en una única dirección (en → wes), con plantilla de chat específica que mapea el código `wes`.
- Generación de borradores de traducción revisables, con pérdida entrenada únicamente sobre la respuesta del traductor.
- Integración nativa con transformers mediante `AutoModelForImageTextToText` y `AutoTokenizer`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (según las etiquetas del repositorio).
- Investigación en traducción automática de bajos recursos: el checkpoint sirve como punto de partida reproducible con un presupuesto de hardware mínimo.
- No hay evidencia de soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso ni modo de pensamiento; el modelo es un traductor de un solo par de idiomas.
- Capacidades multilingües: limitadas a inglés y pidgin de Camerún. El resto de idiomas de TranslateGemma no se han reentrenado ni evaluado en este checkpoint.
- Capacidades de visión: presentes en la arquitectura heredada, pero congeladas y no evaluadas para pidgin de Camerún; no deben asumirse como funcionales.
- Comportamiento conversacional declarado en las etiquetas del repositorio, si bien el caso de uso documentado es la traducción.

## Casos de uso
- Pre-traducción asistida por revisores humanos: generar un primer borrador en pidgin de Camerún a partir de textos en inglés para que un traductor nativo lo corrija. Adecuado porque el autor lo define explícitamente como uso previsto y la métrica de copia del original es baja (1,56 %).
- Localización de productos digitales: adaptar interfaces, correos y avisos de producto al pidgin de Camerún con revisión posterior, aprovechando que el modelo respeta la plantilla de chat de TranslateGemma y puede integrarse en pipelines existentes de traducción.
- Investigación en traducción automática de bajos recursos: usar el checkpoint como referencia reproducible (1.024 ejemplos de entrenamiento, QLoRA 4 bits, una sola T4) para estudiar el efecto del ajuste fino en idiomas sin recursos, comparando con el modelo base.
- Aumento de corpus: emplear el modelo para traducir texto en inglés y generar candidatos en pidgin que, tras revisión humana, amplíen corpus paralelos para entrenar sistemas posteriores.
- Subtitulado y material educativo: traducir guiones o materiales formativos en inglés a pidgin de Camerún como paso previo a la revisión lingüística, dado el bajo coste de despliegue en una GPU de consumo.
- Prototipado de asistentes conversacionales regionales: integrar el modelo como capa de traducción en un asistente que atienda a usuarios en inglés y responda en pidgin, siempre con validación humana.
- Estudios de variación dialectal y normalización ortográfica: el pidgin de Camerún presenta variación regional y de grafía, y las salidas del modelo pueden usarse como material de análisis para investigar esa variabilidad.
- Evaluación de sesgos y errores en MT de bajos recursos: la documentación del autor incluye métricas de copia del original, salidas vacías y ratio de longitud, lo que facilita reproducir análisis de errores.

## Benchmarks y rendimiento
El autor solo publica una evaluación interna sobre el conjunto de prueba del mismo corpus (128 ejemplos), que describe explícitamente como diagnóstico y no como benchmark de publicación:

| Ejemplos | chrF++ | SacreBLEU | TER | Copia del original | Salida vacía | Ratio de longitud |
|---:|---:|---:|---:|---:|---:|---:|
| 128 | 23,11 | 4,86 | 182,14 | 1,56 % | 0,78 % | 2,325 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, Flores-200 u otros) en la información disponible. El propio autor indica que TuracoBench v1 y las evaluaciones revisadas por hablantes nativos están pendientes y pide que no se describa el checkpoint como estado del arte hasta que existan.

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 8,6 GB, por lo que conviene contar con 10-12 GB de VRAM incluyendo activaciones y caché KV para 768 tokens de contexto. En cuantización de 4 bits los pesos bajan a unos 2,5-3 GB y el modelo puede operar en GPUs de 6-8 GB. En 8 bits serían unos 4,5 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, no medidas publicadas por el autor.
- GPU recomendadas: Tesla T4 (16 GB), usada por el autor para el ajuste; RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 para inferencia local; A100 o H100 si se necesita lote grande y baja latencia.
- Cabe en GPU de consumo: sí. Con cuantización de 4 bits es viable en GPUs de 8 GB o más; en bf16 requiere al menos 12 GB para no depender de offload a CPU.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (vía documentada por el autor), text-generation-inference y endpoints compatibles (etiquetas del repositorio). El autor recomienda carga en 4 bits con Unsloth en GPUs solo-fp16 como la T4.
- llama.cpp u Ollama: no hay pesos GGUF publicados en el repositorio ni conversión documentada por el autor, por lo que no se puede confirmar su funcionamiento con estas herramientas sin conversión propia.
- Latencia y throughput: no disponible. El único dato de hardware publicado es la Tesla T4 de 14,6 GB empleada en el ajuste fino.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cobertura en → wes | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Turaco-gem-mt-en-wes | 4.300.079.472 | 768 tokens configurados | Sí, dirección única en → wes | Gemma Terms of Use | HuggingFace, transformers, TGI y endpoints compatibles | Ajuste QLoRA 4 bits sobre 1.024 ejemplos; métricas internas chrF++ 23,11 y SacreBLEU 4,86 |
| google/translategemma-4b-it | Unos 4B (aproximadamente 5B incluyendo componentes de visión, según el autor) | no disponible | No: `wes` no estaba en el mapeo original de la plantilla de chat | Gemma Terms of Use | HuggingFace | Modelo base del que deriva este checkpoint |
| Alternativas de MT de bajos recursos (por ejemplo NLLB-200 o MADLAD-400) | no disponible | no disponible | no disponible | no disponible | no disponible | La búsqueda web realizada no devolvió documentación técnica utilizable sobre estos modelos, por lo que no se incluyen cifras que pudieran ser especulativas |

No se dispone de comparativas de rendimiento con otros sistemas en → wes en la información proporcionada. Cualquier comparación cuantitativa con alternativas requeriría ejecutar una evaluación común sobre el mismo conjunto de prueba revisado por hablantes nativos, algo que el autor señala como pendiente.

## Limitaciones y advertencias
- Corpus de entrenamiento estrecho, ruidoso y sesgado a un dominio concreto; los resultados no se generalizan sin validación.
- El pidgin de Camerún tiene variación regional, dialectal y ortográfica legítima; el modelo puede favorecer una variante concreta presente en los datos.
- Riesgo de alucinación documentado por el autor: el modelo puede copiar el inglés, omitir contenido, añadir contenido no respaldado por el original o abusar de expresiones frecuentes en el dominio de entrenamiento.
- La métrica de ratio de longitud de 2,325 sugiere salidas considerablemente más largas que la referencia, lo que puede indicar expansión no deseada del texto.
- TER de 182,14 y SacreBLEU de 4,86 son valores pobres en términos absolutos; el modelo sirve para borradores, no para publicación directa.
- Las métricas internas provienen del mismo corpus de origen y pueden sobreestimar la calidad real en producción.
- `wes` no formaba parte del mapeo original de plantilla de chat de TranslateGemma; la integración depende de un `chat_template.jinja` parcheado que debe copiarse junto con los pesos.
- La traducción de imágenes a pidgin de Camerún no fue entrenada ni evaluada por el proyecto, pese a que la arquitectura base sea multimodal.
- Uso no previsto por el autor: no debe ser el traductor único en decisiones médicas, legales, de emergencia, migratorias, financieras o de cualquier otra índole crítica.
- Licencia Gemma, no Apache ni MIT: el uso comercial está permitido sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que imponen restricciones. Se aplican además los términos del dataset por separado, y el código del proyecto y los pesos tienen licencias distintas.
- Contexto limitado a 768 tokens configurados (512 en entrenamiento), insuficiente para documentos largos sin segmentación previa.
- Modelo con 0 descargas y 0 «likes» en el momento de la consulta: no existe validación por parte de la comunidad ni historial de uso en producción.
- En GPUs que solo soportan float16, como la T4, el autor recomienda explícitamente la carga en 4 bits con Unsloth; cargar en bf16 nativo puede no funcionar correctamente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/fotiecodes/Turaco-gem-mt-en-wes
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/fotiecodes/Turaco-NLLB-mt-en-wes-cleaned-dataset
- Artículo técnico de TranslateGemma (citado por el autor): https://arxiv.org/abs/2601.09012
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Cita del proyecto: `@software{turaco_translategemma_2026, author = {fotiecodes}, title = {Turaco-gem-mt-en-wes}, year = {2026}, url = {https://huggingface.co/fotiecodes/Turaco-gem-mt-en-wes}}`
- Archivos auxiliares incluidos en el repositorio según la model card: `NOTICE`, `MODIFICATIONS.md`, `internal_test_metrics.json` y copia del acuerdo de Gemma.
- Nota sobre la búsqueda web: los resultados devueltos fueron enlaces genéricos a Reddit sin relación con el modelo, por lo que no se han podido incorporar fuentes externas adicionales.
