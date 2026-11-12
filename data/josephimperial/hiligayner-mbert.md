# josephimperial/hiligayner-mbert

## Resumen

HILIGAYNER mBERT es un modelo de reconocimiento de entidades nombradas (NER) especializado en hiligaynon (también llamado ilongo), una lengua regional de Filipinas hablada por unos 9 millones de personas. Lo desarrolla Joseph Imperial a partir de un ajuste fino de `google-bert/bert-base-multilingual-cased`, y resuelve una carencia clara: la ausencia de herramientas de procesamiento del lenguaje natural de calidad para lenguas filipinas de bajos recursos. El modelo identifica tres tipos de entidad: personas (PER), localizaciones (LOC) y organizaciones (ORG).

Se trata de un transformer encoder de tipo BERT con 177.268.231 parámetros totales, licencia no disponible y un único idioma de trabajo (hil). El ajuste se realizó sobre el corpus HILIGAYNER publicado por Teves et al. (2025) en PACLIC 39, con 8.004 frases de entrenamiento, 889 de validación y 2.227 de test. Es relevante ahora porque demuestra que un modelo multilingüe genérico, afinado con un corpus modesto pero bien anotado, alcanza un F1 macro de 0,8585 en un idioma prácticamente ausente de los grandes pipelines comerciales.

La ventana de contexto efectiva es corta (128 tokens incluyendo tokens especiales), coherente con la tarea de NER a nivel de frase. No es un modelo generativo: es un clasificador de tokens que etiqueta cada token con un esquema BIO de seis clases (B-PER, I-PER, B-LOC, I-LOC, B-ORG, I-ORG). Su utilidad es como componente de extracción de información en pipelines de análisis de noticias, redes sociales y textos religiosos en hiligaynon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingue), clasificacion de tokens |
| Parametros totales | 177.268.231 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers/GGUF, no documentada por el autor) |
| Idiomas soportados | hiligaynon (hil) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-multilingual-cased |
| Pipeline | token-classification |
| Etiquetas | B-PER, I-PER, B-LOC, I-LOC, B-ORG, I-ORG |
| Tamano del repo | 0,7 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (fine-tuning) de `bert-base-multilingual-cased`, un encoder transformer con atención bidireccional y tokenizador WordPiece con vocabulario multilingüe. La cabeza de clasificación es una capa lineal sobre las representaciones contextuales de cada token, con seis etiquetas BIO. No hay innovaciones arquitectónicas: es la receta estándar de NER sobre un encoder preentrenado.

El entrenamiento usó el corpus HILIGAYNER (Teves et al., 2025), compuesto por texto de noticias, redes sociales y textos religiosos. El split, tras eliminar texto repetido, contiene 8.004 frases de entrenamiento, 889 de validación y 2.227 de test. Se entrenó con AdamW durante 3 épocas, learning rate 5e-05 y longitud máxima de secuencia de 128 tokens. Se seleccionó el mejor checkpoint de validación según F1 estricto de spans BIO y se evaluó en test. El paquete incluye `metrics.json` con la configuración de la ejecución y los recuentos de alineación. No se documenta uso de RLHF, DPO ni datos adicionales fuera del corpus.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona (PER), localización (LOC) y organización (ORG) en texto en hiligaynon.
- Etiquetado a nivel de token con esquema BIO, agregable a spans mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Procesamiento de entradas a nivel de frase (hasta 128 tokens), adecuado para titulares, publicaciones cortas y oraciones de noticias.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni flujos de agentes.
- Capacidad multilingüe limitada al hiligaynon; el modelo base es multilingüe, pero el ajuste se realizó solo con datos en hil.
- No dispone de modo de pensamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Extracción de entidades en noticias locales: dado un titular o párrafo en hiligaynon, el modelo devuelve las personas, lugares y organizaciones mencionadas, lo que permite indexar y buscar noticias por entidad en medios regionales filipinos.
- Monitorización de redes sociales: al estar entrenado con texto de redes sociales, puede etiquetar publicaciones cortas en hiligaynon para detectar menciones a personas públicas, localidades u organizaciones en tareas de escucha social.
- Construcción de grafos de conocimiento regionales: los spans extraídos alimentan una base de datos de relaciones (quién aparece con qué organización y en qué lugar) para análisis de contexto local.
- Anonimización y privacidad: la detección de PER permite enmascarar nombres de personas en corpus de hiligaynon antes de publicarlos o compartirlos con terceros.
- Análisis de contenido religioso: el corpus incluye textos religiosos, por lo que el modelo puede extraer entidades en sermones, catequesis o publicaciones parroquiales para su catalogación.
- Enriquecimiento de corpus lingüísticos: como etiquetador automático para preanotar nuevos textos en hiligaynon y acelerar la creación de datasets NER anotados por humanos.
- Componente en pipelines de análisis documental: combinado con un modelo de traducción o resumen, sirve para extraer entidades antes de pasar el texto a etapas posteriores de procesamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjunto de test de HILIGAYNER, 2.227 frases):

| Metrica | Valor |
|---|---|
| F1 macro (6 etiquetas BIO) | 0,8585 |
| F1 estricto de spans BIO | 0,8476 |

Desglose por etiqueta:

| Etiqueta BIO | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| B-PER | 0,9534 | 0,9614 | 0,9574 | 1788 |
| I-PER | 0,9406 | 0,9299 | 0,9352 | 2127 |
| B-LOC | 0,8026 | 0,8493 | 0,8253 | 584 |
| I-LOC | 0,8183 | 0,8243 | 0,8213 | 1224 |
| B-ORG | 0,7789 | 0,8609 | 0,8179 | 532 |
| I-ORG | 0,7840 | 0,8037 | 0,7937 | 912 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16: alrededor de 0,35 GB de pesos; cuantización int8 reduce a unos 0,18 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer y en entornos sin GPU (CPU), dado el tamaño reducido del modelo.
- Opciones de despliegue: pipeline de `transformers`, servidores de inferencia compatibles con modelos de la librería (por ejemplo, TGI o vLLM para BERT), y exportación a ONNX. El uso con llama.cpp u Ollama no está documentado para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (177 M de parámetros) se espera procesamiento de decenas a cientos de frases por segundo en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | F1 test |
|---|---|---|---|---|---|---|
| josephimperial/hiligayner-mbert | 177,3 M | 128 tokens | hil | NER (PER/LOC/ORG) | no disponible | 0,8585 (macro) |
| google-bert/bert-base-multilingual-cased (base sin ajustar) | 177,9 M | 512 tokens | 104 idiomas | encoder generico | Apache 2.0 | no aplica (no es NER) |
| Modelos NER multilingues genericos (p. ej. XLM-R ajustados) | variable | variable | multilingue | NER | variable | no disponible para hil |

No se dispone de resultados publicados de otros modelos NER específicos para hiligaynon en la información proporcionada, por lo que la comparación cuantitativa con alternativas directas no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en hiligaynon; el rendimiento en otras lenguas filipinas (cebuano, tagalo, ilocano) no está garantizado y probablemente sea deficiente.
- Ventana de contexto de 128 tokens: los documentos largos deben dividirse en frases u oraciones, lo que puede romper entidades que cruzan límites de segmento.
- El propio autor advierte que el rendimiento puede variar en dominios, convenciones ortográficas y registros distintos a los del corpus (noticias, redes sociales y textos religiosos).
- Las clases LOC y ORG presentan F1 claramente inferior a PER (0,82 y 0,79 frente a 0,94-0,96), por lo que los errores se concentran en localizaciones y organizaciones.
- Riesgo de alucinación de entidades: como clasificador, puede etiquetar como entidad fragmentos que no lo son, especialmente en texto ruidoso o con ortografía no estándar.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en productos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa independiente.
- No es un modelo generativo: no debe emplearse para tareas de resumen, traducción o diálogo.
- El sesgo del corpus (noticias, redes sociales, textos religiosos) puede infrarepresentar entidades de otros ámbitos (legal, médico, técnico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephimperial/hiligayner-mbert
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Corpus HILIGAYNER (GitHub): https://github.com/jvlzloons/HiligayNER
- Dataset anotado: https://github.com/jvlzloons/HiligayNER/blob/cfd02cb0fdb2f1aadb75106c7a779c17db687ada/Dataset/Annotated%20dataset/final_combined_all.jsonl
- Paper HILIGAYNER (PACLIC 39, 2025): https://aclanthology.org/2025.paclic-1.71/
