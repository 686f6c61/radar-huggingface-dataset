# AfriSpeech/afro-awesome-align

## Resumen

Afro-Awesome-Align es un modelo neuronal de alineación de palabras y frases desarrollado por AfriSpeech, construido sobre la arquitectura `awesome-align` de Dou y Neubig (EACL 2021). Su función no es la generación de texto, sino la extracción de alineaciones densas entre tokens y frases multi-palabra en textos paralelos inglés-lenguas africanas, una tarea fundamental para la construcción de memorias de traducción, la evaluación de sistemas de traducción automática y la anotación lingüística.

El modelo se presenta como el primer alineador neuronal ajustado específicamente para 693 lenguas africanas, cubriendo las familias Niger-Congo, Afroasiática, Nilo-Sahariana y Khoisán. Se distribuye como un modelo BERT afinado con objetivos auto-supervisados (Translation Language Modeling, Self-Training con pseudo-alineaciones y Permutation Structural Invariance), y su pipeline en Hugging Face es `feature-extraction`.

Es relevante ahora porque la mayoría de herramientas de alineación de alta calidad están optimizadas para pares de lenguas europeas o de altos recursos, dejando descubiertas las lenguas africanas. Este modelo ataca ese hueco con un único checkpoint multilingüe, con licencia permisiva BSD-3-Clause y un repositorio de 1,1 GB. No obstante, la información pública disponible es escasa: no hay datos de benchmarks ni de tamaño exacto de parámetros en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base de `awesome-align`, Dou & Neubig, EACL 2021) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en, tw, yo, ha, sw, ig, am, zu, xh, sn, multilingual; la model card declara cobertura de 693 lenguas africanas |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (`pytorch`), compatible con `transformers` y con la CLI de `awesome-align` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `awesome-align`: un encoder BERT que produce embeddings contextuales para cada token de las dos oraciones de un par paralelo y que calcula la matriz de similitud coseno entre tokens para extraer alineaciones mediante `softmax` (modo `--extraction softmax`). Sobre esa base, AfriSpeech ha realizado un ajuste fino orientado a lenguas africanas, incorporando alineaciones a nivel de frase que capturan inversiones de orden de palabras y compuestos (por ejemplo, *holy spirit* ↔ *honhom kronkron* o *ẹ̀mí mímọ́*, y *high priest* ↔ *ɔsɔfopanin* o *kuhani mkuu*).

El entrenamiento se describe con tres objetivos auto-supervisados: Translation Language Modeling (TLM), Self-Training con pseudo-alineaciones (SO) y Permutation Structural Invariance (PSI). Los datos proceden de los corpus paralelos `AfriSpeech/africa-corpus`, `AfriSpeech/african-corpus-jw` y `AfriSpeech/africa-corpus-journals`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de alineación y no de generación.

## Capacidades

- Alineación a nivel de token entre oraciones paralelas inglés-lengua africana, con extracción `softmax` y salida en formato de alineaciones y de palabras alineadas.
- Alineación a nivel de frase multi-palabra, incluyendo inversiones de orden de palabras y compuestos.
- Cobertura multilingüe declarada de 693 lenguas africanas, con mención explícita de tw, yo, ha, sw, ig, am, zu, xh y sn.
- Extracción de características (`feature-extraction`): genera embeddings contextuales BERT reutilizables para otras tareas.
- Uso como componente en pipelines de traducción automática, memorias de traducción y evaluación de alineación.
- No soporta tool calling ni function calling: no es un modelo generativo ni un agente conversacional.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Construcción de memorias de traducción: dado un corpus paralelo inglés-swahili o inglés-yoruba, el modelo extrae pares de palabras y frases alineadas que se incorporan a una TM para reutilización en traducción asistida.
- Evaluación de sistemas de traducción automática: las alineaciones permiten calcular métricas de calidad a nivel de palabra (por ejemplo, precisión de alineación) sobre salidas de sistemas NMT en lenguas africanas de bajos recursos.
- Anotación lingüística y lexicografía: extracción de correspondencias léxicas bilingües a partir de textos religiosos o periodísticos paralelos, útil para elaborar diccionarios de lenguas como el twi o el amárico.
- Proyectos de documentación de lenguas minoritarias: alineación de corpus paralelos de lenguas khoisán o nilo-saharianas para preservación y estudio.
- Preprocesado en pipelines de traducción aumentada por recuperación: las alineaciones alimentan la selección de segmentos y la sustitución léxica en sistemas de traducción basados en memoria.
- Investigación en alineación multilingüe: punto de partida para comparar estrategias de alineación (softmax frente a otros modos) en familias lingüísticas africanas.
- Extracción de características para clasificación o clustering de textos multilingües usando los embeddings BERT del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la métrica AER (Alignment Error Rate) como métrica declarada, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud; el repositorio ocupa 1,1 GB, lo que sugiere un modelo de tamaño moderado (orden de cientos de millones de parámetros, típico de BERT base), pero no se confirma.
- GPU recomendadas: una GPU consumer con 8-16 GB de VRAM debería ser suficiente para inferencia en precisión completa si el modelo es de escala BERT base; no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: probablemente sí (RTX 3060/4060 o superiores), aunque no está verificado en la información disponible.
- Opciones de despliegue: CLI de `awesome-align`, `transformers` con `AutoModel`/`AutoTokenizer` en PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para un modelo de alineación no generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Afro-Awesome-Align | Alineador BERT (awesome-align) | 693 lenguas africanas + en | no disponible | BSD-3-Clause | Hugging Face |
| awesome-align (original) | Alineador BERT | Multilingüe (énfasis en pares de altos recursos) | no disponible | no disponible en la información | Hugging Face / GitHub |
| SimAlign | Alineador basado en embeddings multilingües | Multilingüe | no disponible | no disponible en la información | GitHub |
| EFMaral / fast_align | Alineadores estadísticos | Depende del corpus | no aplica | no disponible en la información | GitHub |

La comparación cuantitativa con estas alternativas no está disponible: no hay resultados de AER publicados para Afro-Awesome-Align en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, por lo que no debe emplearse para traducción directa ni para tareas conversacionales.
- La cobertura de 693 lenguas se declara en la model card, pero no se aportan métricas por lengua; el rendimiento en lenguas de muy bajos recursos puede ser desigual.
- No se documentan sesgos conocidos, pero al entrenarse sobre corpus paralelos (posiblemente de dominio religioso y periodístico) puede heredar sesgos de dominio y de registro.
- Riesgo de alineaciones espurias en pares con orden de palabras muy divergente o con morfología aglutinante compleja.
- No se especifican la longitud máxima de secuencia ni el tamaño exacto de parámetros, lo que dificulta planificar el despliegue.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar las licencias de los corpus de entrenamiento citados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No hay información sobre cuantizaciones ni sobre soporte en frameworks de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/AfriSpeech/afro-awesome-align
- Paper de referencia (awesome-align, Dou & Neubig, EACL 2021): https://aclanthology.org/2021.eacl-main.133/
- Dataset AfriSpeech/africa-corpus: https://huggingface.co/datasets/AfriSpeech/africa-corpus
- Dataset AfriSpeech/african-corpus-jw: https://huggingface.co/datasets/AfriSpeech/african-corpus-jw
- Dataset AfriSpeech/africa-corpus-journals: https://huggingface.co/datasets/AfriSpeech/africa-corpus-journals
