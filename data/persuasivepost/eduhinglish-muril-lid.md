# persuasivepost/eduhinglish-muril-lid

## Resumen

EduHinglish MuRIL LID es un adaptador LoRA para identificación de idioma a nivel de token (word-level language identification) sobre texto Hinglish, la variedad de code-mixing hindi-inglés ampliamente usada en la India. Lo desarrolla el autor `persuasivepost` en el marco del proyecto EduHinglish, vinculado a K.J. Somaiya College of Engineering, y se publica como adaptador PEFT sobre el modelo base `google/muril-base-cased`.

El modelo resuelve una tarea concreta: etiquetar cada token de una frase con una de cinco clases (HI, EN, NE, UNIV, MIX), lo que permite separar el componente hindi del inglés dentro de una misma oración. Es un componente de preprocesado para pipelines educativos y de procesamiento de lenguaje que operan sobre texto code-mixed, no un modelo generativo generalista.

La relevancia es acotada pero clara: Hinglish carece de herramientas de etiquetado lingüístico fiables, y un LID a nivel de token es prerrequisito para normalización, análisis morfosintáctico o traducción selectiva. El adaptador es ligero (repo de 0.0 GB, solo pesos LoRA en safetensors) y se apoya en MuRIL, un encoder BERT multilingüe preentrenado específicamente con datos indios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con adaptador LoRA; base `google/muril-base-cased` |
| Parametros totales | No disponible (adaptador LoRA; el modelo base MuRIL-base tiene ~236M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos LoRA en safetensors; cuantizacion no documentada) |
| Idiomas soportados | en, hi (y su mezcla, Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a `google/muril-base-cased`, un encoder tipo BERT preentrenado por Google Research con corpus multilingües indios. La cabeza de clasificación se configura con `num_labels=5`, correspondientes a las etiquetas HI (hindi), EN (inglés), NE (entidad nombrada), UNIV (token universal, p. ej. números o puntuación) y MIX (token mixto). La tarea es token classification, es decir, se emite una etiqueta por token.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste adicionales más allá del fine-tuning con LoRA. Tampoco se especifican hiperparámetros del adaptador (rango, alpha, dropout) ni la estrategia de congelación de capas. El uso de LoRA reduce el coste de entrenamiento y el tamaño del artefacto, pero no hay métricas publicadas que permitan evaluar la calidad del ajuste.

## Capacidades

- Identificación de idioma a nivel de token en texto Hinglish, con cinco etiquetas: HI, EN, NE, UNIV, MIX.
- Clasificación de tokens individuales dentro de una oración code-mixed, no clasificación de documento completo.
- Manejo de entidades nombradas (NE) y tokens universales (UNIV) como categorías separadas.
- Integración con el ecosistema Hugging Face Transformers y PEFT mediante `PeftModel.from_pretrained`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- Capacidades multilingües limitadas a inglés, hindi y su mezcla; no se declaran otros idiomas.

## Casos de uso

- Preprocesado de corpus educativos Hinglish: etiquetar token a token permite separar el componente hindi del inglés antes de análisis morfosintáctico o de construir datasets paralelos. Es adecuado porque la tarea está definida exactamente como token classification.
- Normalización de texto en sistemas de tutoría inteligente: al conocer qué tokens son hindi y cuáles inglés, el sistema puede aplicar reglas de normalización o transliteración distintas a cada segmento.
- Análisis de code-mixing en investigación lingüística: el etiquetado HI/EN/NE/UNIV/MIX permite cuantificar la proporción de mezcla por oración o por documento en estudios de sociolingüística.
- Enrutamiento selectivo en pipelines de traducción: los tokens marcados como EN pueden enviarse a un traductor inglés-español y los HI a un traductor hindi-español, reduciendo errores de traducción sobre texto mezclado.
- Extracción de entidades en texto Hinglish: la etiqueta NE identifica tokens que corresponden a entidades nombradas, lo que sirve como señal preliminar para un NER posterior.
- Filtrado y limpieza de datasets: detectar oraciones con alta proporción de MIX o NE para excluirlas o revisarlas manualmente en la construcción de corpus de entrenamiento.
- Componente de evaluación lingüística automatizada: en el contexto educativo del proyecto, permite analizar la mezcla de idiomas en respuestas de estudiantes y generar métricas de uso lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño mínimo (repo de 0.0 GB); el coste real de inferencia lo determina el modelo base MuRIL-base.
- VRAM estimada: no disponible de forma oficial; para un encoder BERT-base en fp32 se suele requerir del orden de 1-2 GB, y menos en fp16, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. Un encoder de este tamaño puede ejecutarse en CPU para lotes pequeños, aunque no hay datos de latencia publicados.
- Cabe en GPU de consumo (gama media y superior) por el tamaño del modelo base, si bien no se confirma con cifras oficiales.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| persuasivepost/eduhinglish-muril-lid | LoRA sobre MuRIL-base, token classification | No disponible (adaptador) | No disponible | en, hi | Apache 2.0 | Hugging Face |
| google/muril-base-cased | Encoder BERT multilingüe indio | ~236M (no confirmado en la informacion) | No disponible | multilingüe indio | Apache 2.0 | Hugging Face |
| Modelos LID genéricos (p. ej. fastText lid.176) | Clasificador de idioma por frase | No disponible | No aplica | 176 idiomas | MIT (fastText) | Disponible |
| XLM-RoBERTa-base | Encoder multilingüe | ~278M | 512 tokens | 100 idiomas | MIT | Hugging Face |

La comparación directa es limitada: los LID genéricos operan a nivel de frase y no separan tokens code-mixed, mientras que este adaptador está especializado en Hinglish a nivel de token. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas (accuracy, F1 por clase), por lo que no es posible validar la calidad del etiquetado antes de desplegarlo.
- El modelo está especializado en Hinglish; su comportamiento sobre otras variedades code-mixed (spanglish, franglais, etc.) no está documentado y probablemente sea deficiente.
- Riesgo de errores en tokens ambiguos o en préstamos léxicos del inglés al hindi, donde la frontera entre HI y EN no es nítida.
- No se documenta el corpus de entrenamiento, lo que impide evaluar sesgos de dominio (por ejemplo, si está sesgado hacia texto educativo o informal).
- El adaptador depende del modelo base `google/muril-base-cased`; cambios en la versión del base o del tokenizador pueden alterar los resultados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base MuRIL antes de un uso comercial.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- No apto para generación, razonamiento ni tareas fuera de la clasificación de tokens.

## Enlaces

- Hugging Face: https://huggingface.co/persuasivepost/eduhinglish-muril-lid
- Modelo base: https://huggingface.co/google/muril-base-cased
- Paper de MuRIL (Khan et al., 2021): https://arxiv.org/abs/2103.10730
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la información proporcionada enlaces a repositorios, demos o blogs adicionales del proyecto EduHinglish.
