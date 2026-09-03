# sign/ModernBERT-Large-Instruct-WSD

## Resumen

ModernBERT-Large-Instruct-WSD es un modelo de desambiguación de sentidos de palabras (WSD, por sus siglas en inglés) desarrollado por el usuario sign. Se trata de un fine-tuning del modelo encoder answerdotai/ModernBERT-Large-Instruct, especializado en resolver la tarea de WSD como un problema de opción múltiple sobre definiciones de WordNet (omw-en:1.4). El modelo añade un decodificador de letras de respuesta de 128 vías mediante la clase `WSDModernBertForMaskedLM`, que permite seleccionar la definición correcta entre un conjunto de candidatas para cada palabra en contexto.

La revisión actual (denominada "w4", publicada el 3 de septiembre de 2026) incorpora un entrenamiento más robusto que la versión anterior, con datos de SemCor, el Princeton WordNet Gloss Corpus y frases generadas para 97 000 synsets. El resultado es una mejora significativa en los benchmarks de WSD, pasando de un 59,2 % a un 80,7 % en el conjunto SemEval "ALL". El modelo está pensado para integrarse en pipelines de procesamiento de lenguaje natural que requieran desambiguación léxica precisa, y se distribuye bajo licencia Apache 2.0.

Con 395,96 millones de parámetros, es un modelo de tamaño medio dentro de la familia ModernBERT, optimizado para tareas de comprensión del lenguaje en inglés. Su arquitectura de encoder transformer lo hace adecuado para aplicaciones donde se necesita una representación contextual de alta calidad, aunque su uso principal es la clasificación de opciones múltiples sobre definiciones de WordNet.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Large (encoder transformer) |
| Parametros totales | 395 962 496 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-Large-Instruct`, un encoder transformer de la familia ModernBERT. Sobre esta base, se añade un decodificador de letras de respuesta de 128 vías (implementado en la clase `WSDModernBertForMaskedLM` del repositorio `word-sense-disambiguation`), que permite tratar la desambiguación como una tarea de opción múltiple: el modelo recibe una oración con una palabra marcada y un conjunto de definiciones candidatas de WordNet, y debe seleccionar la correcta mediante un slot de respuesta tipo masked-LM.

El fine-tuning de la revisión "w4" se realizó sobre una combinación de datos: frases generadas para 97 000 synsets, las oraciones de ejemplo de WordNet (excluyendo una muestra de validación de 5 000 ejemplos), SemCor (222 000 instancias, detokenizado) y el Princeton WordNet Gloss Corpus con etiquetas manuales. El entrenamiento usó una programación coseno, label smoothing de 0,1, weight decay de 0,01, tasa de aprendizaje de 3e-5, 2 épocas y batch de 64. Los pesos se mantuvieron en fp32 durante el entrenamiento con autocast en bf16, y se almacenaron finalmente en bf16.

Una mejora clave de esta revisión frente a la anterior es que el modelo ya no sobre-predice la opción "none of the above" en oraciones naturales largas, lo que corrige un sesgo importante en la versión previa.

## Capacidades

- Desambiguación de sentidos de palabras (WSD) sobre WordNet, seleccionando la definición correcta entre un conjunto de candidatas.
- Clasificación de opción múltiple con un slot de respuesta tipo masked-LM, lo que permite integrarse en pipelines que requieran selección de definiciones.
- Comprensión del lenguaje en inglés con representaciones contextuales de alta calidad, heredadas de ModernBERT-Large-Instruct.
- Manejo de oraciones largas y naturales sin caer en la sobre-predicción de "ninguna de las anteriores", según los resultados de la revisión w4.
- Capacidad de fine-tuning adicional para dominios específicos, gracias a su arquitectura encoder estándar.
- No es un modelo generativo: no produce texto libre, sino clasificaciones sobre un conjunto cerrado de opciones.

## Casos de uso

- Mejora de motores de búsqueda semántica: el modelo puede desambiguar términos polisémicos en consultas de usuario, permitiendo recuperar documentos que usan el sentido correcto de la palabra.
- Traducción automática asistida: en sistemas de traducción, la desambiguación previa de sentidos ayuda a elegir la traducción adecuada para palabras con múltiples significados.
- Análisis de sentimiento y minería de opiniones: al identificar el sentido exacto de términos ambiguos en reseñas o comentarios, se mejora la precisión de los clasificadores de sentimiento.
- Extracción de información y ontologías: el modelo puede etiquetar automáticamente los sentidos de las palabras en corpus, facilitando la construcción de recursos léxicos y ontologías.
- Sistemas de respuesta a preguntas: en preguntas que contienen palabras ambiguas, la desambiguación previa permite seleccionar la respuesta correcta de una base de conocimiento.
- Procesamiento de textos jurídicos o médicos: en dominios con terminología especializada, el modelo ayuda a identificar el sentido técnico correcto de términos que también tienen usos coloquiales.
- Integración en pipelines de NLP como componente de preprocesado: puede usarse antes de tareas posteriores como análisis sintáctico o semántico, mejorando la calidad general del sistema.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, comparando la revisión anterior con la actual (w4):

| Benchmark | Revisión anterior | Revisión w4 |
|---|---|---|
| WordNet held-out slice (5 000 ejemplos, seed 42) | 70,0 % | 78,6 % |
| SemEval "ALL" (Senseval-2/3, SemEval-07/13/15; 7 247 instancias, any gold key) | 59,2 % | 80,7 % |

No se han publicado resultados en benchmarks generales de lenguaje como MMLU o HumanEval, ya que el modelo está especializado en WSD y no es un modelo generativo.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación proporcionada. Sin embargo, dado que el modelo tiene 395,96 millones de parámetros y es un encoder, se puede estimar que la inferencia en bf16 requiere aproximadamente 0,8 GB de VRAM para los pesos, más memoria para activaciones y el decodificador de 128 vías. Una GPU con al menos 4 GB de VRAM (por ejemplo, una NVIDIA GTX 1650 o superior) debería ser suficiente para inferencia en lotes pequeños. Para entrenamiento o fine-tuning adicional, se recomendaría una GPU con 8 GB o más. No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros sistemas de WSD basados en transformers, como los basados en BERT o RoBERTa, pero no se han encontrado datos concretos de comparación con este modelo en las fuentes disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Su función principal es la desambiguación de sentidos sobre WordNet; no es adecuado para generación de texto ni para tareas de lenguaje general.
- Depende de la cobertura de WordNet (omw-en:1.4); palabras o sentidos no incluidos en el recurso no podrán ser desambiguados.
- Aunque la revisión w4 corrige el sesgo de sobre-predicción de "none of the above", puede seguir cometiendo errores en contextos muy específicos o con jerga poco representada en los datos de entrenamiento.
- El modelo no ha sido evaluado en dominios especializados (médico, legal, técnico) más allá de los datos generales de WordNet y SemCor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (SemCor, WordNet) para cumplir con sus respectivas licencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sign/ModernBERT-Large-Instruct-WSD
- Repositorio de código (word-sense-disambiguation): https://github.com/sign/word-sense-disambiguation
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-Large-Instruct
