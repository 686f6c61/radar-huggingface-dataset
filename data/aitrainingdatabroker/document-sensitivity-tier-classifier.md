# aitrainingdatabroker/document-sensitivity-tier-classifier

## Resumen

El Document Sensitivity Tier Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker que asigna a una descripción breve de documento una de cuatro categorías de sensibilidad: `public`, `internal`, `confidential` o `restricted`. Se trata de un fine-tuning de `distilroberta-base` con 82.121.476 parámetros totales, orientado a tareas de gobernanza de datos y clasificación previa al tratamiento o cesión de información corporativa.

El modelo resuelve un problema operativo concreto: antes de que un conjunto de datos salga de una organización, alguien debe determinar su nivel de sensibilidad. Este clasificador ofrece un primer borrador automatizado de esa clasificación, que después debe revisar una persona. No sustituye la evaluación legal ni la política interna de la organización.

Es relevante por su enfoque explícitamente sintético: los 305 ejemplos de entrenamiento son inventados y proceden del dataset `aitrainingdatabroker/synthetic-document-sensitivity-tiers`. El modelo es pequeño (0,3 GB de repositorio), se ejecuta en hardware de consumo (entrenado en una RTX 3070) y se publica bajo licencia Apache 2.0, lo que facilita su integración en pipelines internos de clasificación documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parametros totales | 82.121.476 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una versión destilada de RoBERTa con arquitectura transformer encoder y aproximadamente 82 millones de parámetros. Sobre esa base se realizó un fine-tuning de clasificación de texto durante 6 épocas en una única GPU RTX 3070. La cabeza de clasificación produce cuatro etiquetas discretas correspondientes a los niveles de sensibilidad.

Los datos de entrenamiento proceden del dataset sintético `aitrainingdatabroker/synthetic-document-sensitivity-tiers`, con 305 filas. Todos los nombres, números y frases son inventados. Las filas de test se construyeron a partir de plantillas que el modelo no vio durante el entrenamiento, lo que constituye una prueba de generalización limitada pero deliberada. Los scripts de generación de datos y de entrenamiento están incluidos en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Clasificación de texto multietiqueta restringida a cuatro clases: `public`, `internal`, `confidential` y `restricted`.
- Asignación de un nivel de sensibilidad a partir de una descripción breve de documento.
- Inferencia rápida y ligera, apta para ejecución en CPU o GPU de consumo.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de HuggingFace, según los tags del repositorio.
- Soporte de `top_k` para devolver las tres clases más probables con sus puntuaciones.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Clasificación previa de inventarios documentales: dado un listado de descripciones de documentos, el modelo asigna un primer nivel de sensibilidad a cada uno, lo que permite priorizar la revisión manual sobre los documentos marcados como `confidential` o `restricted`.
- Gobernanza de datos antes de cesión o licencia: en un proceso de venta o cesión de datos a terceros, el clasificador genera un borrador de clasificación que el equipo de compliance valida antes de exportar.
- Enrutamiento en pipelines de DLP (data loss prevention): las descripciones de documentos que entran en un sistema pueden clasificarse automáticamente para decidir si requieren controles adicionales de acceso o cifrado.
- Etiquetado asistido en catálogos de datos: el modelo sugiere etiquetas de sensibilidad para metadatos de un data catalog, reduciendo el trabajo manual del data steward.
- Triaje en procesos de de-identificación: antes de aplicar técnicas de anonimización, el clasificador identifica qué documentos contienen datos personales o información restringida y deben pasar por ese proceso.
- Prototipado y demos de gobernanza: al ser un modelo pequeño con licencia Apache 2.0, sirve para construir herramientas internas o demos de clasificación documental sin depender de APIs externas.
- Filtrado previo en revisiones de cumplimiento normativo: como primer filtro para señalar documentos que podrían estar sujetos a normativas de privacidad por región, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 77 filas de test reservadas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,831 |
| Macro F1 | 0,823 |

Desglose por etiqueta:

| Etiqueta | F1 | Numero de ejemplos |
|---|---|---|
| `confidential` | 0,857 | 19 |
| `internal` | 0,816 | 20 |
| `public` | 0,974 | 20 |
| `restricted` | 0,645 | 18 |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento en la clase `restricted` es notablemente inferior al resto, lo que indica dificultad para distinguirla de clases adyacentes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), en torno a 350-500 MB en fp16; menos de 200 MB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en una RTX 3070, por lo que tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes de tamaño moderado.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI), endpoints de HuggingFace, y exportación a ONNX para servir en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| document-sensitivity-tier-classifier | 82,1 M | no disponible | Clasificación de sensibilidad (4 clases) | Apache 2.0 | HuggingFace |
| distilroberta-base (base) | 82,1 M | 512 tokens (estándar RoBERTa) | Modelo base de lenguaje enmascarado | Apache 2.0 | HuggingFace |
| Modelos de clasificación de sensibilidad comerciales | no disponible | no disponible | Clasificación de datos | Propietaria | APIs comerciales |

No se dispone de información sobre otros modelos open source específicamente entrenados para clasificación de niveles de sensibilidad documental con los que establecer una comparación directa. La alternativa más cercana es el propio modelo base `distilroberta-base`, sobre el que se realizó el fine-tuning, o clasificadores genéricos de toxicidad y PII, que resuelven problemas distintos.

## Limitaciones y advertencias

- Entrenado únicamente con texto sintético generado a partir de plantillas; el texto real presenta mucha más variabilidad y el rendimiento puede degradarse fuera del dominio de entrenamiento.
- Los niveles de sensibilidad varían entre empresas y jurisdicciones; la etiqueta del modelo es una sugerencia, no una decisión vinculante.
- El modelo no constituye asesoramiento legal ni certificación; una persona debe revisar su salida antes de compartir o decidir algo sobre los datos.
- Rendimiento desigual entre clases: F1 de 0,645 en `restricted` frente a 0,974 en `public`, lo que implica un riesgo mayor de confundir documentos restringidos con categorías menos sensibles.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación de etiqueta: al ser un clasificador, siempre devuelve una de las cuatro clases aunque la descripción no encaje claramente en ninguna.
- No se documentan sesgos específicos más allá de los derivados del dataset sintético y de las definiciones de sensibilidad asumidas por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.
- El tamaño del conjunto de test (77 filas) es reducido, por lo que las métricas tienen alta varianza y deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/document-sensitivity-tier-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-document-sensitivity-tiers
- Space relacionado (document-sensitivity-keyword-sorter): https://huggingface.co/spaces/aitrainingdatabroker/document-sensitivity-keyword-sorter
- Guía sobre de-identificación: https://aitrainingdatabroker.com/de-identification/
- Reglas de privacidad por región: https://aitrainingdatabroker.com/regions/
- Licencia de SOPs y bases de conocimiento: https://aitrainingdatabroker.com/data/sops-and-knowledge-bases/
- Sitio del autor: https://aitrainingdatabroker.com/
