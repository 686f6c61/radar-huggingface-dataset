# Kakuratig/camembert-ner-personnes

## Resumen

Kakuratig/camembert-ner-personnes es un modelo de clasificación de tokens (pipeline `token-classification`) publicado en Hugging Face por el usuario Kakuratig, orientado al reconocimiento de entidades nombradas (NER). El repositorio contiene únicamente pesos en formato safetensors (0,4 GB) y 110.032.898 parámetros, una cifra que coincide con la configuración estándar de CamemBERT base, el encoder tipo RoBERTa preentrenado sobre francés que el tag `camembert` del repositorio señala como familia de origen. El sufijo "ner-personnes" apunta a un ajuste fino específico para la clase PERSON (personas), aunque ni la model card ni los metadatos lo confirman de forma explícita.

El modelo se publicó el 12 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes": es un artefacto sin uso ni validación por parte de la comunidad. La model card es la plantilla autogenerada por Hugging Face y no ha sido completada, de modo que no declara autor efectivo, licencia, idiomas, datos de entrenamiento, hiperparámetros ni métricas de evaluación.

Su relevancia es, por tanto, limitada y de carácter experimental. Puede servir como punto de partida para extraer nombres propios en textos franceses, pero cualquier uso en producción exige auditar antes los pesos, la licencia del modelo base y la calidad real del etiquetado, ya que no existe ningún benchmark publicado ni descarga registrada que permita inferir su fiabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia CamemBERT (derivada de RoBERTa), según el tag `camembert`; la model card no detalla la configuración de capas |
| Parámetros totales | 110.032.898 (dato extraído de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; los modelos CamemBERT base estándar operan con 512 tokens |
| Tipos de cuantización | no disponible; solo se publican safetensors, con un tamaño coherente con pesos en fp32 (110.032.898 × 4 bytes ≈ 440 MB) |
| Idiomas soportados | no disponible; el tag `camembert` y el nombre del modelo apuntan al francés |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | token-classification |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La única información estructural disponible es el tag `camembert`, que sitúa el modelo en la familia CamemBERT: un encoder transformer bidireccional con la misma arquitectura que RoBERTa base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, 3.072 unidades en la capa feed-forward y vocabulario SentencePiece de 32.005 tokens), preentrenado sobre el corpus francés OSCAR. Estos datos corresponden a la configuración pública y documentada de CamemBERT base, no a una confirmación por parte de este repositorio concreto; el `config.json` del modelo no se ha verificado en esta ficha.

No hay información sobre el proceso de ajuste fino: se desconoce el dataset utilizado (¿WikiNER, FT o un corpus propio?), el número de épocas, la tasa de aprendizaje, si hubo búsqueda de hiperparámetros o si se aplicaron técnicas como congelación de capas. Tampoco consta ningún proceso de RLHF, DPO o calibración de umbrales de decisión, lo cual es esperable en un encoder discriminativo de este tipo. Conviene aclarar que el tag `arxiv:1910.09700` que aparece en los metadatos corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono, citado en la plantilla de model card de Hugging Face; no es el artículo que describe este modelo.

## Capacidades

- Clasificación de tokens por secuencia: el modelo devuelve una etiqueta por token de entrada, típicamente en formato BIO, que es el mecanismo estándar para el reconocimiento de entidades nombradas.
- Detección de entidades de tipo persona: el nombre del repositorio sugiere un ajuste específico para la clase PERSON, pero no hay documentación que confirme qué etiquetas emite exactamente (¿solo PERSON o un esquema completo con LOC, ORG, MISC?).
- Procesamiento de texto en francés: la base CamemBERT y el nombre del modelo apuntan a este idioma; no hay confirmación de soporte multilingüe.
- No genera texto: al ser un encoder discriminativo, no puede utilizarse para generación, resumen, traducción ni diálogo.
- No soporta tool calling ni function calling: no es un modelo generativo ni un modelo de instrucciones.
- No soporta agentes ni razonamiento multi-paso: no dispone de modo "thinking", planificación ni capacidad de orquestación.
- Sin capacidades de visión, audio, voz ni multimodalidad.
- Extracción de entidades como componente dentro de un pipeline mayor (spaCy, LangChain, NER híbrido con reglas o diccionarios).

## Casos de uso

- Anonimización y pseudonimización de documentos: se puede emplear como primer paso para localizar nombres de personas en textos franceses y sustituirlos por marcadores antes de compartir expedientes, especialmente en contextos sujetos al RGPD. Es adecuado por su tamaño reducido (permite ejecución local o en CPU) y su naturaleza discriminativa, aunque la ausencia de métricas obliga a medir falsos positivos y falsos negativos en el dominio propio.
- Preanotación para equipos de etiquetado: dado su coste de inferencia bajo, puede generar anotaciones preliminares sobre corpus franceses que luego revisen anotadores humanos, reduciendo el tiempo de construcción de un dataset NER propio. Requiere definir primero un esquema de etiquetas y medir el acuerdo entre el modelo y los anotadores.
- Enriquecimiento de metadatos en pipelines de RAG: extraer nombres propios de documentos para construir índices filtrables (por autor, por interviniente, por firmante) que después se usen como metadatos en un sistema de recuperación. El modelo aporta la señal de extracción; el resto del pipeline sigue siendo responsabilidad de la aplicación.
- Gestión de correspondencia y CRM en francés: clasificación automática de correos o tickets de clientes para detectar el nombre del remitente o de terceros mencionados, y enrutarlos o vincularlos a la ficha correcta. Es viable porque el modelo es pequeño y puede desplegarse junto a la aplicación sin GPU dedicada.
- Análisis de menciones en prensa y monitorización de medios: extracción sistemática de personas citadas en artículos franceses para construir series temporales de aparición, mapas de relación o alertas. El contexto de 512 tokens (si se confirma) exige trocear los artículos con solapamiento y fusionar entidades repetidas.
- Grafos de conocimiento y periodismo de investigación: uso de los nombres detectados como nodos de un grafo de coocurrencia que relacione personas, organizaciones y lugares a partir de grandes volúmenes de documentos. El modelo solo resuelve la detección; la desambiguación de entidades (entity linking) debe implementarse por separado.
- Auditoría y cumplimiento documental: revisión de contratos, actas o informes franceses para verificar qué personas físicas aparecen citadas en cada documento, como control previo a una revisión legal. No debe utilizarse como fuente única de verdad sin validación humana.
- Filtrado previo en procesos de descubrimiento de pruebas (e-discovery): priorizar documentos que mencionan a determinadas personas antes de una revisión manual, siempre que se acepte un cierto nivel de ruido y se documenten los umbrales utilizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla autogenerada y no incluye sección de evaluación, conjunto de test, métricas (F1, precisión, recall) ni comparaciones. El repositorio registra 0 descargas y 0 "likes", por lo que tampoco existe retroalimentación de la comunidad que permita estimar su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros: en fp32, aproximadamente 440 MB de pesos; en fp16/bf16, unos 220 MB; en int8, alrededor de 110 MB. A estas cifras hay que sumar el consumo de activaciones, que crece con el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: no requiere hardware de gama alta. Funciona en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, T4, etc.). Una A100, H100, L40S o RTX 4090 solo se justifican para procesar lotes muy grandes y maximizar el throughput, no por requisitos de memoria.
- Cabe en GPU de consumo: sí, de forma holgada, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable para cargas por lotes moderadas, ya que se trata de un encoder de 110M de parámetros.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX Runtime mediante `optimum` (habitual para reducir latencia en CPU), TorchScript o un servidor de inferencia genérico como NVIDIA Triton. Herramientas orientadas a modelos generativos (vLLM, Ollama) no están pensadas para un encoder de clasificación de tokens, por lo que no son la vía habitual.
- Latencia y throughput: no disponible. No hay mediciones publicadas; en un encoder de este tamaño los tiempos suelen medirse en milisegundos por secuencia corta en GPU y en decenas de milisegundos en CPU, pero son estimaciones orientativas no verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Idioma | Tarea | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kakuratig/camembert-ner-personnes | CamemBERT base | 110.032.898 | francés (presunto) | NER, aparentemente clase PERSON | no disponible (512 en CamemBERT base) | no disponible | 0 descargas, 0 likes |
| Jean-Baptiste/camembert-ner | CamemBERT base | ~110 M | francés | NER general (WikiNER) | 512 | no verificada en esta ficha | ampliamente utilizado como referencia en NER francés |
| dslim/bert-base-NER | BERT base cased | ~108 M | inglés | NER (CoNLL-2003) | 512 | no verificada en esta ficha | referencia estándar para NER en inglés |
| XLM-RoBERTa base ajustado para NER | XLM-RoBERTa base | ~278 M | multilingüe (100 idiomas) | NER multilingüe | 512 | no verificada en esta ficha | habitual en entornos multilingües |

Nota: la búsqueda web realizada no devolvió información sobre estos modelos alternativos ni sobre el modelo objeto de la ficha; los valores de la tabla corresponden a características estructurales ampliamente documentadas de cada familia, no a datos verificados en esta consulta. Las licencias de los modelos alternativos no se han comprobado y deben verificarse antes de cualquier uso comercial.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre sesgos, datos de entrenamiento, composición del corpus ni dominios cubiertos, lo que impide evaluar riesgo de sesgo demográfico, geográfico o de género en la detección de nombres.
- Riesgo de falsos positivos y negativos: aunque no genera texto y por tanto no "alucina" en sentido generativo, sí puede etiquetar como persona términos que no lo son (topónimos, cargos, siglas) u omitir nombres poco frecuentes, con partículas, compuestos, transliterados o escritos en minúscula.
- Licencia no declarada: al no especificarse licencia, el uso comercial es jurídicamente incierto. El modelo base CamemBERT se distribuye habitualmente bajo licencia permisiva, pero la falta de declaración en este repositorio impide asumirla.
- Ausencia total de validación: 0 descargas y 0 "likes" implican que no existe evidencia externa de que los pesos funcionen correctamente o correspondan a la tarea que sugiere el nombre.
- Limitación idiomática previsible: el modelo está construido sobre una base entrenada con corpus franceses; su rendimiento en castellano u otros idiomas es muy probablemente pobre y no está documentado.
- Contexto limitado: si se confirma la ventana de 512 tokens de CamemBERT base, los documentos largos deben trocearse con solapamiento, lo que obliga a implementar estrategias de fusión de entidades y puede fragmentar nombres en los límites de cada segmento.
- Esquema de etiquetas desconocido: no se sabe si el modelo emite solo PERSON o un conjunto completo de clases, ni si usa formato BIO, BIOES o etiquetas simples; esto condiciona la integración con otras herramientas.
- Dependencia del dominio de ajuste: al desconocerse el dataset de entrenamiento, no puede garantizarse el comportamiento en dominios especializados (texto legal, médico, histórico, redes sociales o lenguaje informal).
- No apto para decisiones automatizadas con efectos legales o sobre derechos de las personas: cualquier uso en identificación, verificación de identidad o filtrado con consecuencias jurídicas requiere revisión humana y auditoría previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kakuratig/camembert-ner-personnes
- Modelo base CamemBERT (referencia de arquitectura): https://huggingface.co/almanach/camembert-base
- Artículo de CamemBERT (modelo base, no de este ajuste): https://arxiv.org/abs/1911.03894
- Referencia citada en la plantilla de la model card (emisiones de carbono, no es el artículo del modelo): https://arxiv.org/abs/1910.09700
- Herramienta de estimación de impacto de carbono mencionada en la plantilla: https://mlco2.github.io/impact
- Nota sobre la búsqueda web: los resultados obtenidos (GitHub, Zhihu, páginas genéricas sobre asistentes de chat) no guardan relación con este modelo. No se han encontrado papers, blogs, repositorios de código, demos ni espacios asociados al checkpoint.
