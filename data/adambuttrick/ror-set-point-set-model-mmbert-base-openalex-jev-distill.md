# adambuttrick/ror-set-point-set-model-mmbert-base-openalex-jev-distill

## Resumen

`ror-set-point-set-model-mmbert-base-openalex-jev-distill` es un modelo cross-encoder de extracción de características (feature extraction) desarrollado por Adam Buttrick para una tarea muy concreta: el enlazado de afiliaciones institucionales contra el registro ROR (Research Organization Registry). Dado un texto de afiliación (por ejemplo, el pie de un artículo científico) y un conjunto de candidatos ROR recuperados previamente, el modelo asigna a cada candidato la probabilidad de que la cadena lo nombre. No es un modelo generativo: es un clasificador de pares (cadena, registro) que opera sobre todos los candidatos a la vez.

Arquitecturalmente parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe de tipo ModernBERT, y añade una cabeza lineal que puntúa cada candidato a partir de la media de los estados de sus tokens, seguida de una calibración logística fija. El resultado es un modelo de unos 307 millones de parámetros, con licencia MIT, pensado para integrarse en un pipeline de dos etapas junto a un retriever (`ror-set-point-retriever-e5-base-openalex-jev-distill`).

Su relevancia es de nicho pero importante para la comunidad de ciencia abierta: automatiza la desambiguación de afiliaciones institucionales, un paso crítico en la normalización de metadatos bibliográficos y en la construcción de grafos de colaboración científica. El modelo se ha destilado a partir de las decisiones de Jev, un modelo comercial cerrado de TypeSafe AI, usando 3,8 millones de juicios sobre pares (cadena, institución) publicados en OpenAlex.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabeza lineal de puntuación por candidato y calibración logística |
| Parametros totales | 306.939.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base mmBERT es multilingüe; el modelo card no detalla idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `jhu-clsp/mmBERT-base`. La entrada concatena la cadena de afiliación y todos los candidatos en un único texto con el formato `[CLS] string [SEP] record 1 [SEP] record 2 [SEP] ...`. Una capa lineal asigna una puntuación a cada candidato calculada como la media de los estados de sus tokens, y una calibración fija transforma la puntuación en probabilidad mediante `p = 1 / (1 + exp(-(a × score + b)))`. Se devuelven todos los candidatos con `p ≥ 0.5`; una respuesta vacía indica que la cadena no nombra ninguna organización. Al leer los candidatos conjuntamente, el modelo puede aprender reglas comparativas, como etiquetar el hospital pero no la universidad que aparece en su nombre.

El entrenamiento consta de dos etapas. La etapa 1 usa 167.533 cadenas con juicios del profesor (Jev) sobre los 32 mejores candidatos del retriever más los registros juzgados por el profesor hasta un máximo de 42, y 130.882 cadenas sintéticas no latinas con los 32 mejores candidatos. La etapa 2 usa 16.448 cadenas de instituciones no vistas, con los 32 mejores del retriever y los 10 mejores del índice léxico. Se aplica una *mention mask* que elimina de la pérdida algunos negativos (los registros que la cadena menciona pero que no son el objetivo). Las cadenas del profesor que enlazan con un registro reservado (p ≥ 0.5) y las cadenas de entrenamiento idénticas a las de evaluación quedan excluidas. El modelo es una copia de la revisión `a43d230` de `ror-set-point-set-model-mmbert-base-mask`.

## Capacidades

- Puntuación de candidatos ROR para una cadena de afiliación, devolviendo probabilidad calibrada por candidato.
- Enlazado de entidades (entity linking) de tipo set-to-set: procesa la cadena y todos los candidatos en una sola pasada.
- Detección de afiliaciones sin organización: devuelve conjunto vacío cuando ningún candidato supera el umbral de 0,5.
- Razonamiento comparativo entre candidatos (por ejemplo, distinguir el hospital de la universidad homónima).
- Manejo de cadenas en alfabetos no latinos gracias al entrenamiento con datos sintéticos no latinos y al base multilingüe mmBERT.
- No soporta tool calling, function calling, agentes ni generación de texto: es exclusivamente un modelo de extracción de características.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Normalización de metadatos bibliográficos: dado el campo de afiliación de un artículo, el pipeline retriever + set model resuelve el ROR de cada autor, habilitando análisis de producción científica por institución.
- Construcción de grafos de colaboración institucional: al normalizar afiliaciones a identificadores ROR estables se pueden agregar coautorías entre instituciones sin ambigüedad por variantes de nombre.
- Desambiguación de instituciones homónimas: el modelo compara candidatos en una sola pasada y aplica reglas como etiquetar el hospital pero no la universidad de su nombre, útil en afiliaciones hospitalarias universitarias.
- Enriquecimiento de repositorios institucionales: procesar lotes de registros de publicaciones para asignar ROR a afiliaciones y facilitar la interoperabilidad con OpenAlex, Crossref y ORCID.
- Filtrado de afiliaciones no institucionales: detectar cadenas que no nombran ninguna organización (respuesta vacía) para descartarlas antes de etapas posteriores de normalización.
- Análisis de financiación y políticas científicas: agregar publicaciones por institución normalizada para medir colaboración internacional o producción por país, usando los ROR como clave de agregación.
- Evaluación de pipelines de enlazado: servir como componente de referencia en la comparación entre pipelines destilados de Jev y de StartLux-Decision v1.1 27B Instant, según indica la model card del modelo con máscara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta un dato de throughput: 128 cadenas por segundo en una NVIDIA H200 con lotes con padding. La model card del modelo con máscara (`ror-set-point-set-model-mmbert-base-mask`) menciona comparaciones con McNemar frente al modelo sin máscara, pero los valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 306,9 millones de parámetros; en precisión completa (fp32) ocupa aproximadamente 1,2 GB de pesos, y en fp16/bf16 unos 0,6 GB. El repositorio pesa 0,8 GB.
- VRAM estimada para inferencia: en torno a 2-4 GB con bf16 y lotes moderados, dependiendo de la longitud de la entrada (la cadena más ~37 candidatos).
- GPU recomendadas: NVIDIA H200 para máximo throughput (128 cadenas/s reportadas); A100 o H100 para producción a gran escala; RTX 4090 y GPUs consumer de gama alta son suficientes para lotes pequeños o medianos.
- Cabe en GPUs consumer con al menos 4-6 GB de VRAM libres; también puede ejecutarse en CPU, aunque la model card recomienda GPU por velocidad.
- Opciones de despliegue: `transformers` con el script `set_model.py` del repositorio (solo requiere torch, transformers, safetensors y huggingface_hub). El tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face, aunque no se detalla la configuración.
- Throughput de referencia: 128 cadenas por segundo en una NVIDIA H200 con lotes con padding.
- Latencia: no disponible de forma explícita.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `ror-set-point-set-model-mmbert-base-openalex-jev-distill` (este) | 306,9 M | no disponible | Set matching ROR, destilado de Jev | MIT | Con mention mask; copia de la revisión `a43d230` del modelo con máscara |
| `ror-set-point-set-model-mmbert-base-mask` | 306,9 M | no disponible | Set matching ROR, destilado de StartLux-Decision v1.1 27B Instant | MIT | Modelo del que deriva este; compara ambos pipelines en su card |
| `ror-set-point-set-model-mmbert-base` | 306,9 M | no disponible | Set matching ROR, sin mention mask | MIT | Misma configuración y semilla, sin máscara |
| `ror-set-point-retriever-e5-base-openalex-jev-distill` | no disponible | no disponible | Retriever de candidatos ROR (etapa 1) | MIT | Se usa junto a este modelo en el pipeline |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo resuelve enlazado de afiliaciones contra ROR; no es un modelo de propósito general y no genera texto.
- Depende de un retriever y de un índice léxico externos: la calidad del conjunto de candidatos condiciona el resultado, y el pipeline requiere el retriever `ror-set-point-retriever-e5-base-openalex-jev-distill` para funcionar como se describe.
- Destilado de un modelo comercial cerrado (Jev, de TypeSafe AI): las decisiones del profesor pueden incorporar sesgos o criterios no documentados del modelo original.
- Riesgo de alucinación en sentido estricto bajo (es un clasificador con umbral), pero puede asignar probabilidades altas a candidatos incorrectos en afiliaciones ambiguas o muy abreviadas.
- Cobertura idiomática no documentada: aunque el base mmBERT es multilingüe y se entrenó con datos sintéticos no latinos, la model card no especifica qué idiomas están soportados ni con qué calidad.
- Longitud de contexto no documentada: entradas con muchos candidatos o cadenas muy largas pueden truncarse sin aviso explícito en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento derivados de OpenAlex y del profesor Jev.
- El modelo es una copia de una revisión concreta (`a43d230`) de otro repositorio, por lo que futuras actualizaciones del modelo con máscara no se reflejarán automáticamente aquí.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-openalex-jev-distill
- Modelo con máscara (origen de esta copia): https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Modelo sin máscara: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base
- Retriever asociado: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset de juicios del profesor (Jev): https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio GitHub del proyecto: https://github.com/adambuttrick/ror-set-point-matching
- Perfil GitHub del autor: https://github.com/adambuttrick
