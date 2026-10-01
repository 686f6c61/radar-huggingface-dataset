# s0ngbird/bertimbau-legal-citations-ner

## Resumen

`s0ngbird/bertimbau-legal-citations-ner` es un modelo de clasificación de tokens (token classification / NER) publicado en HuggingFace por el usuario `s0ngbird`. Se trata de un ajuste fino (fine-tuning) del modelo `neuralmind/bert-base-portuguese-cased`, conocido como BERTimbau base, sobre lo que el propio identificador del repositorio sugiere que es un corpus de citas legales en portugués. El modelo está pensado, por tanto, para detectar y etiquetar menciones de referencias jurídicas dentro de documentos legales en portugués (por ejemplo, artículos, leyes, jurisprudencia o resoluciones).

Técnicamente es un transformer encoder de tipo BERT en su variante base, con 108.336.389 parámetros totales (coincidentes con la arquitectura BERT-base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atención) y un límite de entrada de 512 tokens, que es el contexto máximo nativo de la familia BERT. El repositorio ocupa 0,4 GB y publica los pesos en formato safetensors, con licencia MIT y soporte exclusivo del idioma portugués.

La relevancia del modelo es acotada y muy específica: no compite en capacidades generativas ni de razonamiento, sino que cubre una tarea de extracción de información estructurada en el dominio jurídico lusófono, un ámbito con escasez de recursos anotados. Conviene señalar que el repositorio no incluye model card descriptiva (solo el bloque de metadatos YAML), no declara el conjunto de datos de ajuste fino, no publica métricas de evaluación y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que su madurez y validación son desconocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (BERTimbau base) |
| Parametros totales | 108.336.389 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite nativo de BERT-base; no confirmado explícitamente en el repositorio) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; los pesos nativos están en fp32) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT en configuración base: 12 capas, 768 dimensiones de representación oculta, 12 cabezas de atención y aproximadamente 108 M de parámetros. El modelo base, `neuralmind/bert-base-portuguese-cased`, fue desarrollado por NeuralMind y publicado en 2020, y se preentrenó sobre el corpus BrWaC con los objetivos clásicos de BERT: masked language modeling (MLM) y next sentence prediction (NSP). Al ser un modelo *cased*, distingue mayúsculas y minúsculas, algo relevante en texto jurídico por el uso de abreviaturas y formatos de cita.

Sobre el proceso de ajuste fino no hay información en el repositorio: se desconoce el corpus anotado utilizado, el esquema de etiquetas (por ejemplo, si distingue tipos de referencia como ley, artículo, jurisprudencia o número de proceso), el número de épocas, el tamaño del conjunto de entrenamiento, si hubo validación cruzada o si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, lo cual es coherente con una tarea discriminativa de etiquetado y no generativa. Como innovación técnica no se declara ninguna: es un fine-tuning estándar de clasificación de tokens sobre un encoder preexistente.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre texto jurídico en portugués: la cabeza de clasificación de tokens permite etiquetar secuencias a nivel de token, presumiblemente referencias legales (leyes, artículos, jurisprudencia, números de proceso), aunque el esquema exacto de etiquetas no está documentado.
- Procesamiento de texto jurídico en portugués de Brasil: hereda del modelo base la adaptación léxica y morfológica al portugués brasileño.
- Clasificación sensible a mayúsculas y minúsculas, útil para distinguir formatos de cita normalizados.
- No soporta generación de texto: es un encoder discriminativo sin cabeza de lenguaje causal.
- No dispone de soporte documentado de tool calling, function calling ni uso como agente multi-paso.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni multimodalidad.
- Capacidad multilingüe: no; está entrenado y etiquetado únicamente para portugués.
- Longitud de entrada limitada a 512 tokens, lo que obliga a segmentar documentos largos.

## Casos de uso

- Extracción automática de citas legales: dado un texto judicial o administrativo, el modelo puede localizar y etiquetar las menciones a normativa y jurisprudencia, generando metadatos estructurados que alimenten un índice de búsqueda. Es adecuado porque la tarea exacta para la que se ha ajustado es el reconocimiento de estas entidades.
- Indexación y recuperación semántica en repositorios jurídicos: las entidades extraídas permiten construir índices por referencia normativa, de modo que un usuario pueda localizar todas las sentencias que citan un artículo concreto.
- Construcción de grafos de citas legales: a partir de las entidades detectadas se pueden generar relaciones documento-norma y analizar redes de precedentes judiciales.
- Preprocesado de pipelines de análisis documental en despachos y departamentos jurídicos: el modelo actúa como paso previo de normalización antes de tareas como clasificación por área del derecho o resumen.
- Anonimización y auditoría de documentos con fines de cumplimiento: la detección de referencias normativas ayuda a verificar que un texto cumple con requisitos de citación obligatoria.
- Enriquecimiento de bases de datos jurídicas públicas: integrar el modelo en procesos batch permite etiquetar de forma masiva corpus de resoluciones y aumentar automáticamente los metadatos disponibles.
- Control de calidad de escritos legales: comprobar que todas las citas presentes en un documento han sido correctamente referenciadas y formateadas.

En todos los casos, el despliegue requiere segmentar documentos en fragmentos de como máximo 512 tokens, y la utilidad real depende de un esquema de etiquetas que el repositorio no documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión, recall o F1 sobre el conjunto de validación, ni comparaciones con otros modelos de NER jurídica en portugués, y tampoco se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 433 MB en fp32 (108,34 M de parámetros × 4 bytes) y unos 217 MB en fp16/bf16, sin contar activaciones ni el consumo del runtime.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 o incluso iGPU con memoria compartida suficiente.
- También es viable su ejecución en CPU: al ser un encoder de 108 M de parámetros, la inferencia por lote pequeño es de baja latencia, aunque no se han publicado cifras medidas.
- GPU recomendadas para despliegue en producción con alto throughput: NVIDIA T4, L4, A10, A100 o H100; no obstante, para este tamaño de modelo las GPU de gama media son suficientes.
- Opciones de despliegue: biblioteca `transformers` de forma nativa, exportación a ONNX Runtime o TorchScript para optimización, y FastAPI o similar como capa de servicio. No se han publicado pesos en formato GGUF ni adaptaciones para llama.cpp u Ollama, y el soporte de token classification en servidores como vLLM o TGI no está garantizado para este repositorio concreto.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s0ngbird/bertimbau-legal-citations-ner | 108.336.389 | 512 tokens | Token classification (NER de citas legales) | MIT | HuggingFace, 0 descargas |
| neuralmind/bert-base-portuguese-cased | ~110 M (BERT-base) | 512 tokens | MLM/NSP (modelo base) | No disponible en la informacion proporcionada | HuggingFace, modelo de referencia |
| rufimelo/Legal-BERTimbau-base | ~110 M (BERT-base) | 512 tokens | Modelo de lenguaje adaptado al dominio legal | No disponible en la informacion proporcionada | HuggingFace |
| pedronettotrue/bertimbau-legal-tjsc | ~110 M (BERT-base) | 512 tokens | Clasificación de texto legal en 5 áreas del derecho (proyecto LegalBench-BR) | No disponible en la informacion proporcionada | HuggingFace |

Comparativa de rendimiento: no disponible. No se han publicado métricas que permitan situar este modelo frente a las alternativas.

## Limitaciones y advertencias

- Model card inexistente: el repositorio solo contiene el bloque YAML de metadatos, sin descripción de la tarea, el esquema de etiquetas, los datos de entrenamiento ni las métricas. Esto impide reproducir o validar el modelo.
- Sin validación conocida: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por terceros.
- Riesgo de sobreajuste al dominio: al ser un ajuste fino sobre citas legales, es probable que su rendimiento se degrade fuera del tipo de documento y del estilo de citación del corpus de ajuste, aunque no se puede cuantificar sin datos.
- Riesgo de alucinación y falsos positivos: en NER, el riesgo se manifiesta como entidades espurias o mal delimitadas, especialmente en citas abreviadas, ambiguas o con formatos irregulares.
- Sesgos: no evaluados. Al heredar el preentrenamiento de BERTimbau sobre el corpus BrWaC, puede arrastrar sesgos presentes en dicho corpus, así como sesgos propios de la jurisprudencia incluida en el ajuste fino.
- Limitación idiomática estricta: solo portugués; no se debe esperar funcionamiento correcto en castellano ni en otros idiomas.
- Limitación de contexto: 512 tokens obligan a trocear documentos largos, con el consiguiente riesgo de perder citas que queden partidas entre fragmentos.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia, sin garantía alguna por parte del autor.
- Caveat de producción: al no existir documentación del etiquetado, cualquier integración requerirá una fase previa de inspección empírica de las etiquetas emitidas antes de confiar en el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/s0ngbird/bertimbau-legal-citations-ner
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- pedronettotrue/bertimbau-legal-tjsc: https://huggingface.co/pedronettotrue/bertimbau-legal-tjsc
- rufimelo/Legal-BERTimbau-base: https://huggingface.co/rufimelo/Legal-BERTimbau-base
- Artículo sobre el sistema de búsqueda semántica para el STJ con BERTimbau legal: https://rufimelo99.github.io/SemanticSearchSystemForSTJ/Content/05-LegalLanguageModel/BERTimbau.html
- Documentación sobre los modelos BERT para portugués de Brasil (BERTimbau): https://www.scribd.com/document/838534726/bertimbau
- Ficha de BERTimbau en megatek.ai: https://megatek.ai/en/model/bertimbau/
