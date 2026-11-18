# cguzel/trspell-neuspell-mbert

## Resumen

`trspell-neuspell-mbert` es un modelo de corrección ortográfica del turco desarrollado por Ceren Güzel Turhan (usuario `cguzel` en Hugging Face) y publicado junto al artículo *Leveraging Large Language Models for Spelling Correction in Turkish* (PeerJ Computer Science, 2025). Se trata de un ajuste fino de `bert-base-multilingual-uncased` mediante el toolkit NeuSpell, en su variante `BertChecker`, sobre el corpus sintético NoisyWikiTr. El modelo resuelve una tarea concreta: dado un texto turco con errores tipográficos, sustituir cada palabra por su forma correcta, utilizando la frase completa como contexto.

A diferencia de un modelo generativo, no produce texto libre: es un clasificador a nivel de token que, para cada posición de palabra, elige la corrección entre un vocabulario cerrado (`vocab.pkl`) construido a partir del conjunto de entrenamiento. Esta restricción lo hace determinista y ligero en inferencia, pero limita su cobertura a palabras vistas durante el entrenamiento.

Es relevante para pipelines de preprocesado de texto turco (normalización previa a indexación, búsqueda o análisis) donde se busca una corrección rápida y sin coste de generación, y como referencia académica de aplicación de modelos tipo BERT a corrección ortográfica en lenguas morfológicamente ricas como el turco. El repositorio ocupa 1,1 GB e incluye los pesos en formato PyTorch (`pytorch_model.bin`) y el vocabulario de salida serializado con pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT multilingual uncased) con cabeza de clasificación a nivel de palabra (NeuSpell `BertChecker`) |
| Parametros totales | no disponible (el modelo base `bert-base-multilingual-uncased` tiene 178M; el checkpoint ajustado no declara cifra propia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del BERT base, típicamente 512 tokens; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (se distribuye en `pytorch_model.bin` en fp32; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | turco (`tr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `vocab.pkl` (vocabulario de salida) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT multilingüe sin distinción de mayúsculas, sobre el que se añade una cabeza de clasificación por palabra que predice, para cada token de entrada, la palabra correcta dentro del vocabulario de salida `vocab.pkl`. La inferencia se realiza con el `BertChecker` de NeuSpell, que recorre la frase y sustituye cada palabra por la predicción correspondiente usando el contexto completo de la oración. No hay decodificación autoregresiva ni mecanismo de generación: es una tarea de etiquetado (token classification) con vocabulario cerrado.

El ajuste fino se llevó a cabo sobre el split de entrenamiento de NoisyWikiTr, compuesto por 687.000 frases de Wikipedia en turco con aproximadamente un 10 % de tokens corrompidos mediante inyección sintética de errores: deleciones, inserciones, transposiciones, sustituciones, errores vocálicos, faltas comunes y separaciones de palabras. La validación emplea el split de validación de NoisyWikiTr (85.000 frases). El entrenamiento se ejecutó con `NeuSpell BertChecker.finetune` sobre el fork del toolkit adaptado al turco publicado en el repositorio `cgturhan/trspell`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Corrección ortográfica a nivel de palabra en turco, con contexto de frase completa.
- Manejo de errores tipográficos sintéticos: deleción, inserción, transposición, sustitución, errores vocálicos, faltas comunes y separación de palabras (aunque la separación no se corrige bien, ver limitaciones).
- Normalización previa de entrada requerida: minúsculas con reglas turcas (I → ı, İ → i), sin dígitos, puntuación ni apóstrofos.
- Salida restringida al vocabulario `vocab.pkl`, lo que garantiza consistencia léxica pero limita la cobertura.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta otras lenguas distintas del turco, pese a estar basado en un modelo multilingüe.
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Normalización de texto turco en pipelines de búsqueda: aplicar el corrector antes de indexar o de ejecutar consultas para reducir falsos negativos por erratas en los términos de búsqueda.
- Preprocesado para análisis de sentimiento o clasificación de textos en turco: corregir erratas antes de pasar el texto a un modelo downstream, mejorando la cobertura del vocabulario.
- Limpieza de corpus de Wikipedia o de fuentes colaborativas: detectar y corregir erratas introducidas por editores humanos en artículos turcos.
- Moderación de comentarios y foros: normalizar texto escrito por usuarios con faltas antes de aplicar filtros léxicos o modelos de toxicidad.
- Enriquecimiento de datasets de OCR: corregir errores de reconocimiento óptico de caracteres en documentos turcos escaneados antes de su publicación o archivado.
- Evaluación académica de correctores ortográficos: servir como baseline reproducible (checkpoint NeuSpell) frente a enfoques generativos basados en LLM en turco.
- Generación de datos sintéticos de entrenamiento: usar el corrector para producir pares ruido/corrección a partir de texto limpio y entrenar otros modelos.

## Benchmarks y rendimiento

Los resultados de evaluación se reportan en la Tabla 5 del artículo asociado (PeerJ Computer Science 11:e2889, 2025), sobre el conjunto de test de NoisyWikiTr con ruido uniforme y realista. No se han incluido cifras concretas en la información disponible, por lo que no se reproducen aquí.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1 GB en fp32 para los pesos del modelo base BERT (178M parámetros); con overhead de NeuSpell y del vocabulario, alrededor de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: el modelo está pensado para cargarse con NeuSpell (`BertChecker.from_pretrained`) usando el fork `cgturhan/trspell`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo estándar de `transformers`.
- Latencia y throughput estimados: no disponible. Al ser un encoder BERT base con clasificación por palabra, la latencia por frase es del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no se han publicado medidas oficiales.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cguzel/trspell-neuspell-mbert` | Corrección ortográfica turca (word-level) | no disponible (base 178M) | no disponible | Apache 2.0 | Hugging Face + repo GitHub |
| Correctores basados en LLM generativos (p. ej. ajustes de modelos tipo Llama/Mistral para turco) | Corrección ortográfica y gramatical (seq2seq) | miles de millones | 4k-128k | variable según modelo base | Hugging Face, APIs |
| `bert-base-multilingual-uncased` sin ajustar | Representaciones multilingües (no corrige) | 178M | 512 | Apache 2.0 | Hugging Face |
| NeuSpell `BertChecker` original (inglés) | Corrección ortográfica inglesa | ~110M (BERT base) | 512 | MIT (toolkit) | GitHub NeuSpell |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado sobre errores sintéticos; el rendimiento sobre erratas reales de usuarios puede diferir del reportado en el artículo.
- Solo corrige ortografía, no gramática ni estilo.
- La salida está restringida a las palabras de `vocab.pkl`; palabras raras o no vistas no se corrigen correctamente y pueden quedar sin cambios o sustituirse por una forma incorrecta.
- Modelo a nivel de palabra: no corrige errores que separan o unen palabras (errores de separación), tal y como reconoce la propia model card.
- Requiere normalización previa específica (minúsculas turcas, sin dígitos, puntuación ni apóstrofos); usarlo con texto sin normalizar degrada la calidad.
- No es un modelo de `transformers` estándar: debe cargarse con NeuSpell y el fork `cgturhan/trspell`; no funciona con `AutoModel.from_pretrained`.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (`bert-base-multilingual-uncased`, Apache 2.0) y del corpus NoisyWikiTr antes de redistribuir derivados.
- Riesgo de alucinación léxica: al elegir siempre una palabra del vocabulario, puede introducir sustituciones plausibles pero incorrectas en dominios alejados de Wikipedia.
- Sin garantías de sesgo: al entrenarse sobre Wikipedia en turco, hereda los sesgos de cobertura temática y de registro de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cguzel/trspell-neuspell-mbert
- Dataset NoisyWikiTr: https://huggingface.co/datasets/cguzel/NoisyWikiTr
- Artículo (PeerJ Computer Science): https://doi.org/10.7717/peerj-cs.2889
- Repositorio de código (fork de NeuSpell para turco): https://github.com/cgturhan/trspell
- NeuSpell original: https://github.com/neuspell/neuspell
- Modelo base: https://huggingface.co/bert-base-multilingual-uncased
