# guymorlan/levanti_translate_ar_he

## Resumen

Levanti es un modelo de traducción automática especializado en traducir árabe levantino coloquial (dialectos palestino, jordano, sirio, libanés y egipcio) a hebreo. Lo desarrolla Guy Mor-Lan, investigador afiliado a la Universidad Hebrea de Jerusalén, y se distribuye bajo licencia CC BY-SA 4.0. El modelo resuelve un problema concreto: la mayoría de sistemas de traducción árabe-hebreo están entrenados sobre árabe estándar moderno (MSA), lo que degrada gravemente la calidad cuando la entrada es dialectal y coloquial.

Técnicamente es un fine-tuning de Helsinki-NLP/opus-mt-ar-he, un transformer encoder-decoder de la familia Marian NMT con 76,6 millones de parámetros totales, entrenado durante 8 épocas sobre el dataset Levanti del mismo autor. Su tamaño compacto (repo de 0,3 GB) lo hace desplegable en hardware modesto, aunque su alcance es deliberadamente estrecho: un único par de idiomas y una única dirección de traducción.

Es relevante para investigadores y desarrolladores que trabajan con contenido en árabe dialectal (redes sociales, subtítulos, transcripciones de audio conversacional) y necesitan una salida en hebreo, un par lingüístico con escasa cobertura de recursos y todavía menos para variantes coloquiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, base de Helsinki-NLP/opus-mt-ar-he) |
| Parámetros totales | 76.628.838 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (dialectos levantino y egipcio) y hebreo |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Helsinki-NLP/opus-mt-ar-he, un sistema de traducción neuronal de la familia Marian basado en la arquitectura transformer encoder-decoder original de Vaswani et al., adaptada por Microsoft Research para traducción automática eficiente. Sobre esa base, el autor aplicó un fine-tuning de 8 épocas utilizando el dataset Levanti (guymorlan/levanti), compuesto por pares de traducción árabe coloquial-hebreo. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La innovación principal no es arquitectónica sino de dominio: el ajuste desplaza la distribución de entrenamiento desde el árabe estándar hacia variantes dialectales que el modelo base no cubre bien. El modelo declara soporte para dialectos palestino, jordano, sirio, libanés y egipcio, lo que amplía la cobertura respecto al opus-mt-ar-he original. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia adicionales.

## Capacidades

- Traducción de texto de árabe coloquial (levantino y egipcio) a hebreo, en una única dirección.
- Cobertura de cinco variantes dialectales: palestino, jordano, sirio, libanés y egipcio.
- Generación de texto seq2seq estándar mediante la pipeline `translation` de transformers.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`) y despliegue en Azure (tag `deploy:azure`).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento, agentes ni multi-step reasoning.
- No incluye capacidades de visión ni audio.
- El multilingüismo se limita al par árabe-hebreo; no traduce a otras lenguas.

## Casos de uso

- Subtitulado y localización de contenido audiovisual en árabe dialectal: series, entrevistas o vídeos de redes sociales en dialecto levantino pueden traducirse a hebreo para audiencias israelíes, un nicho que los traductores basados en MSA cubren mal.
- Análisis de redes sociales y monitorización de opinión: publicaciones y comentarios en árabe coloquial (X, Facebook, TikTok) pueden convertirse a hebreo para su procesamiento en pipelines de análisis de sentimiento o topic modeling.
- Investigación en lingüística de corpus: el modelo permite a investigadores comparar estructuras dialectales árabe-hebreo a escala, generando traducciones de referencia sobre corpus dialectales.
- Atención al ciudadano en contextos bilingües: organizaciones que atienden a población arabófona y hebreohablante pueden integrar el modelo para traducir consultas informales escritas en dialecto.
- Transcripción y traducción de audio conversacional: combinado con un ASR de árabe dialectal, el modelo cierra el pipeline para generar actas o resúmenes en hebreo de conversaciones coloquiales.
- Preservación y documentación de patrimonio oral: grabaciones de tradición oral en dialectos levantinos pueden transcribirse y traducirse a hebreo para archivos y estudios académicos.
- Prototipado rápido de aplicaciones de traducción: su tamaño de 76,6 M de parámetros y repo de 0,3 GB permiten desplegarlo en entornos con recursos limitados o en pruebas de concepto sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (76,6 M de parámetros), aproximadamente 300-400 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para textos cortos.
- Opciones de despliegue: transformers (pipeline `translation`), endpoints de Hugging Face, Azure (tag `deploy:azure`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada; al ser un modelo Marian, llama.cpp y Ollama no son opciones naturales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guymorlan/levanti_translate_ar_he | 76,6 M | no disponible | ar (dialectal), he | CC BY-SA 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-ar-he | no disponible | no disponible | ar (MSA), he | CC BY 4.0 (habitual en OPUS-MT) | Hugging Face |
| NLLB-200 (distilled 600M) | 600 M | 512 tokens | 200 lenguas, incluye ar y he | CC BY-NC 4.0 | Hugging Face |
| M2M-100 (418M) | 418 M | 1024 tokens | 100 lenguas, incluye ar y he | MIT | Hugging Face |

Levanti se distingue de los modelos multilingües generalistas por su especialización en dialecto coloquial, pero carece de su cobertura y de benchmarks publicados que permitan una comparación cuantitativa. Los modelos multilingües ofrecen mayor contexto y más lenguas, a costa de un rendimiento inferior en variedades dialectales no representadas en sus datos de entrenamiento.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de árabe a hebreo; no soporta la dirección inversa.
- Entrenado sobre un dataset de autor único (guymorlan/levanti); no se documenta su tamaño, composición ni procedencia, lo que dificulta evaluar sesgos y cobertura.
- Riesgo de alucinación y de traducciones inexactas en dialectos no representados o en registros formales (MSA), donde el modelo puede degradarse frente al opus-mt-ar-he original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (BLEU, chrF, COMET) frente a alternativas.
- Longitud de contexto no documentada; los modelos Marian suelen limitarse a secuencias cortas, por lo que textos largos pueden truncarse.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Solo 9 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, sin garantías de mantenimiento.
- No se documentan limitaciones específicas de sesgo de género, político o religioso, pero al operar sobre un par lingüístico sensible conviene auditar las salidas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_translate_ar_he
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-he
- Contacto del autor: guy.mor AT mail.huji.ac.il
