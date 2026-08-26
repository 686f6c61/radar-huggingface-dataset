# kiwiki196/bc5cdr-ner-gemma-4-E2B-it

## Resumen

El modelo `kiwiki196/bc5cdr-ner-gemma-4-E2B-it` es un adaptador LoRA (entrenado con QLoRA) para la extracción de entidades nombradas (NER) sobre el corpus BC5CDR, especializado en la detección de compuestos químicos y enfermedades en texto biomédico. El adaptador se ha fine-tuneado a partir del modelo base `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 desarrollado por Google DeepMind, que cuenta con 2.3 mil millones de parámetros (E2B) y una ventana de contexto de hasta 256K tokens.

El modelo resuelve el problema de la extracción de entidades biomédicas con anotación posicional: el sistema prompt incorpora marcadores de posición (`<unused0>N<unused1>`) en el texto de entrada, y el modelo debe devolver cada entidad junto con el identificador del marcador más cercano que la precede. Esto permite reconstruir la posición exacta de cada mención en el documento, una capacidad necesaria para pipelines de minería de textos biomédicos y sistemas de extracción de relaciones químicos-enfermedad.

La relevancia actual del modelo radica en que combina un LLM moderno y compacto (2.3B parámetros) con una adaptación específica para NER biomédico, logrando un rendimiento razonable (F1 micro de 0.710 en la tarea de categoría+texto) con un coste de inferencia bajo. Es un ejemplo de adaptación eficiente de modelos generativos a tareas de etiquetado estructurado, un enfoque cada vez más habitual frente a los modelos discriminativos tradicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo (base: Gemma 4 E2B, adaptador LoRA) |
| Parametros totales | 2.3B (modelo base); adaptador LoRA de 1.7 GB en disco |
| Parametros activos | 2.3B (modelo denso, no MoE) |
| Longitud de contexto | Hasta 256K tokens (capacidad del base; el adaptador no especifica una reducción) |
| Tipos de cuantizacion | QLoRA (cuantización de 4 bits durante el entrenamiento, según la model card) |
| Idiomas soportados | No disponibles en la información del adaptador; el modelo base Gemma 4 soporta más de 140 idiomas |
| Licencia | No disponible en la model card del adaptador; el modelo base Gemma 4 tiene su propia licencia (consulte la página de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 que, según el informe técnico de Google, presenta una arquitectura Transformer multimodal con codificadores de visión y audio mejorados, y está disponible en variantes densas y MoE. El tamaño E2B corresponde a la variante densa de 2.3B parámetros, optimizada para eficiencia computacional.

El entrenamiento del adaptador se realizó con QLoRA (cuantización de 4 bits del modelo base durante el fine-tuning), utilizando el corpus BC5CDR (BioCreative V CDR task), que contiene anotaciones de compuestos químicos y enfermedades. La model card indica que el proceso de inferencia usa un prompt de sistema muy específico que instruye al modelo para extraer menciones textuales exactas, incluyendo menciones negadas o inciertas, y para etiquetar cada una con su categoría (Chemical o Disease) y el marcador posicional más cercano. No se especifican detalles sobre el número de épocas, el tamaño del lote o el dataset de entrenamiento más allá del corpus BC5CDR.

El adaptador se carga como un modelo PEFT sobre el base, y la model card advierte que Gemma 4 es un modelo con acceso restringido (gated), por lo que es necesario solicitar acceso en la página del modelo base antes de poder cargar el adaptador.

## Capacidades

- Extracción de entidades nombradas (NER) biomédicas: identifica y clasifica menciones de compuestos químicos y enfermedades en texto biomédico.
- Anotación posicional: el modelo es capaz de asociar cada entidad con el marcador de posición más reciente en el texto, lo que permite reconstruir la localización exacta de cada mención.
- Manejo de menciones negativas, inciertas o hedged: el prompt instruye a incluir estas menciones sin extraer las palabras de negación o duda.
- Generación de texto en formato estructurado: el output es una secuencia de tokens con formato `N<unused2>TEXT<CATEGORY_TOKEN>`, donde `N` es el identificador del marcador, `TEXT` es la entidad copiada verbatim y `<CATEGORY_TOKEN>` es `<unused3>` para Chemical o `<unused4>` para Disease.
- Soporte de contexto largo (heredado del modelo base): hasta 256K tokens, aunque la tarea NER sobre BC5CDR suele operar sobre documentos más cortos.
- Capacidades multilingües (heredadas del modelo base): Gemma 4 soporta más de 140 idiomas, aunque el adaptador está entrenado principalmente con datos en inglés (BC5CDR es un corpus en inglés).

## Casos de uso

- **Minería de textos biomédicos**: extraer automáticamente menciones de químicos y enfermedades en artículos científicos para construir bases de datos de relaciones fármaco-enfermedad. El modelo es adecuado porque combina precisión razonable (F1 0.71 en categoría+texto) con un coste de inferencia bajo.
- **Extracción de relaciones químicos-enfermedad**: al identificar las entidades y sus posiciones, se puede integrar en un pipeline de extracción de relaciones (RE) que conecte compuestos con patologías, usando el output posicional para alinear las entidades.
- **Análisis de literatura para farmacovigilancia**: detectar menciones de efectos adversos en publicaciones científicas, incluyendo menciones negadas o inciertas, para monitorizar señales de seguridad de medicamentos.
- **Automatización de anotación de datos**: pre-anotar corpus biomédicos para reducir el trabajo manual de anotadores humanos, con una interfaz de marcado posicional que facilita la corrección.
- **Sistemas de búsqueda semántica**: indexar documentos biomédicos por entidades extraídas para permitir búsquedas por fármaco o enfermedad, aprovechando el contexto largo para procesar documentos completos.
- **Integración en pipelines de procesamiento de lenguaje natural (PLN)**: como componente de extracción de entidades en sistemas más grandes, gracias a su formato de salida estructurado y su compatibilidad con la biblioteca `transformers` y `peft`.

## Benchmarks y rendimiento

La model card del adaptador reporta los siguientes resultados sobre el test de BC5CDR (con 812 ejemplos):

**Categoría + texto (multiset)**

| Categoría | Precisión | Recall | F1 |
|---|---|---|---|
| Micro | 0.690 | 0.732 | 0.710 |
| Macro | 0.686 | 0.727 | 0.706 |
| Chemical | 0.720 | 0.778 | 0.748 |
| Disease | 0.652 | 0.676 | 0.664 |

**Posicional (a nivel de carácter)**

| Categoría | Precisión | Recall | F1 |
|---|---|---|---|
| Micro | 0.745 | 0.794 | 0.769 |
| Macro | 0.726 | 0.778 | 0.751 |
| Chemical | 0.736 | 0.825 | 0.778 |
| Disease | 0.716 | 0.730 | 0.723 |

Nota: el 0.4% de las generaciones del test (3/812) fueron no parseables y no recibieron crédito. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo base de 2.3B parámetros con un adaptador LoRA, la inferencia en precisión completa requiere aproximadamente 4.6 GB de VRAM (peso de 2.3B en FP16). Con cuantización de 4 bits (QLoRA) puede reducirse a unos 1.5-2 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16. Para entornos profesionales, una A10 o A100 ofrecería mayor rendimiento.
- **Compatibilidad con GPU consumer**: sí, cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas, incluso con cuantización.
- **Opciones de despliegue**: se puede cargar con la biblioteca `transformers` y `peft` (como indica la model card). También se puede exportar a formatos como GGUF para usar con `llama.cpp` u `Ollama`, aunque el adaptador está diseñado para PEFT, por lo que habría que fusionar los pesos con el base.
- **Latencia y throughput**: no se dispone de datos publicados. En una GPU consumer de gama media (RTX 3060), se espera una latencia de decenas de milisegundos por documento, dado el tamaño compacto del modelo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para NER sobre BC5CDR en la información proporcionada. El propio autor publica otro adaptador (`kiwiki196/bc5cdr-extract-gemma-4-e2b-it-short`) en la misma página de Hugging Face, pero no se proporcionan sus especificaciones ni resultados. Tampoco se dispone de datos sobre modelos NER tradicionales (como BioBERT o PubmedBERT) para comparar en la misma tarea. Por tanto, la comparativa no está disponible en la información actual.

## Limitaciones y advertencias

- **Acceso restringido al modelo base**: `google/gemma-4-E2B-it` es un modelo gated, por lo que se debe solicitar acceso en su página de Hugging Face antes de poder cargar el adaptador. Sin ese permiso, el adaptador no es funcional.
- **Rendimiento limitado en categoría Disease**: el F1 para Disease (0.664 en categoría+texto) es notablemente inferior al de Chemical (0.748), lo que indica un sesgo en la capacidad de detección de enfermedades.
- **Dependencia del formato de prompt**: el modelo es muy sensible al prompt de sistema específico; cualquier variación en la instrucción puede degradar el rendimiento. No se ha validado su comportamiento con otros formatos de prompt.
- **Riesgo de alucinación**: como modelo generativo, puede producir entidades que no están presentes en el texto original, especialmente en textos con ruido o fuera de dominio.
- **Sesgos del corpus**: BC5CDR es un corpus de artículos biomédicos en inglés, por lo que el adaptador puede no funcionar bien en textos de otros dominios (notas clínicas, redes sociales, etc.) o en otros idiomas.
- **Licencia**: la licencia del adaptador no se especifica en la model card; la licencia del modelo base Gemma 4 debe consultarse en su página. No se garantiza el uso comercial sin verificar la licencia del base.
- **Mantenimiento**: el repositorio de reproducción (GitHub) está marcado como "TBD", por lo que no hay código de entrenamiento disponible públicamente, lo que limita la reproducibilidad.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/kiwiki196/bc5cdr-ner-gemma-4-E2B-it)
- [Modelo base google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Página de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Model card de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Informe técnico de Gemma 4 (arXiv)](https://arxiv.org/pdf/2607.02770)
- [Perfil del autor kiwiki196](https://huggingface.co/kiwiki196)
- [Adaptador relacionado: bc5cdr-extract-gemma-4-e2b-it-short](https://huggingface.co/kiwiki196/bc5cdr-extract-gemma-4-e2b-it-short)
- [Corpus BC5CDR (Li et al., 2016)](https://biocreative.bioinformatics.udel.edu/tasks/biocreative-v/track-3-cdr/)
