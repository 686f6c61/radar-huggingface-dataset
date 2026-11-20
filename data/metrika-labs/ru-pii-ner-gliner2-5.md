# metrika-labs/ru-pii-ner-gliner2.5

## Resumen

`metrika-labs/ru-pii-ner-gliner2.5` es un modelo de extracción de entidades (NER) especializado en la detección de datos personales (PII) en documentos en ruso. Lo desarrolla Metrika Labs como un ajuste fino completo del modelo base `fastino/gliner2.5-multi-v1`, perteneciente a la familia GLiNER2.5. El modelo resuelve un problema muy concreto: la anonimización y el cumplimiento normativo de documentos rusos bajo la ley federal 152-ФЗ, donde los identificadores relevantes no son solo nombres, direcciones o teléfonos, sino también números de pasaporte, SNILS, INN, datos bancarios, números de historiales médicos, referencias judiciales o notariales y códigos internos de sistemas.

A diferencia de los NER clásicos con un conjunto fijo de etiquetas, este modelo recibe la lista de etiquetas como entrada junto con el texto, de modo que puede adaptarse a esquemas propios sin reentrenamiento. La arquitectura GLiNER2.5 predice directamente los límites de la entidad en lugar de clasificar todos los fragmentos posibles, lo que permite manejar entidades de longitud arbitraria (direcciones largas, identificadores compuestos) sin degradar el rendimiento en documentos extensos.

El modelo tiene 287.355.159 parámetros, acepta hasta 4096 tokens por pasada y se distribuye con licencia Apache 2.0 en formato safetensors a través de la librería `gliner2`. Es relevante ahora porque cubre el hueco de PII ruso con anotación guiada por contexto jurídico, algo que los enfoques basados en expresiones regulares no pueden resolver.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (extractor de entidades con etiquetas en la entrada, basado en transformer) |
| Parámetros totales | 287.355.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens por pasada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Ruso (principal); el dataset incluye ~6 % de ejemplos en inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `fastino/gliner2.5-multi-v1`, un extractor GLiNER2.5. En lugar de recorrer todas las posibles ventanas de texto y clasificarlas, la arquitectura predice de forma directa dónde empieza y dónde termina cada entidad y después empareja el fragmento con cada etiqueta de la lista proporcionada. Esto elimina el límite práctico en la longitud de la entidad y mantiene la velocidad estable en documentos grandes. Las etiquetas no están fijadas en los pesos: se pasan como entrada, de modo que pueden renombrarse o añadirse nuevas categorías sin reentrenar, aunque la calidad declarada solo está garantizada para las etiquetas documentadas.

El entrenamiento se realizó sobre un dataset completamente sintético de 4097 ejemplos, construido en varias fases: definición jurídica del alcance de los datos personales y de las reglas de anotación conforme a la 152-ФЗ y a la práctica judicial rusa, generación y aumento de documentos, y revisión manual de una parte de los ejemplos. La composición cubre documentos personales, documentación laboral interna, materiales administrativos y corporativos, documentos legales y normativos, contratos, documentación comercial, financiera, contable y bancaria, registros estatales, materiales médicos, sociales y educativos, documentación técnica y de producción, datos de bienes y transporte, correspondencia empresarial y de usuario, registros, formularios y tablas. Se incluyen variantes con OCR deficiente, HTML y Markdown. La anotación es conservadora: ante la duda sobre a quién pertenece un dato, se marca como personal, pero se respeta la distinción entre datos de personas y datos de organizaciones.

## Capacidades

- Extracción de entidades nombradas con etiquetas definidas en tiempo de inferencia (zero-shot respecto a nuevas etiquetas, con las cautelas indicadas por el autor).
- Detección de PII en ruso guiada por contexto jurídico: nombres, ubicaciones, fechas, teléfonos y correo electrónico, más una clase genérica `ru_pii` que agrupa identificadores como pasaporte, documentos migratorios, SNILS, INN, matrículas, datos bancarios, números médicos, judiciales, notariales, laborales y académicos, datos de propiedades y vehículos, billetes y pedidos, cuentas, pases y códigos internos.
- Predicción de límites de entidad sin restricción de longitud, adecuada para direcciones largas y identificadores compuestos.
- Procesamiento de documentos completos de hasta 4096 tokens en una sola pasada.
- Salida con spans (`start`/`end`) además del texto de la entidad, lo que facilita la anonimización por reemplazo posicional.
- Umbral de confianza configurable para ajustar el equilibrio entre precisión y exhaustividad.
- Soporte de lotes (batches) y de esquemas de etiquetas personalizados según la documentación de GLiNER2.
- No dispone de tool calling, capacidades de agente, visión ni audio: es un modelo de clasificación de tokens.

## Casos de uso

- Anonimización de expedientes legales: el modelo localiza identificadores que no siguen un patrón regular (referencias judiciales, números notariales, códigos internos) y devuelve spans que permiten sustituirlos por marcadores antes de compartir el documento.
- Cumplimiento de la 152-ФЗ en flujos documentales: integrado como paso previo al archivado o a la exportación, detecta datos personales en contratos, formularios y registros para generar informes de tratamiento o aplicar seudonimización.
- Gestión de RR. HH.: procesamiento de currículos, contratos laborales y expedientes de empleados para extraer y enmascarar datos de contacto, documentos de identidad y números de la seguridad social rusa (SNILS).
- Tramitación de documentación médica: detección de nombres de pacientes, fechas y números de historia clínica en informes y registros, con la ventana de 4096 tokens suficiente para la mayoría de documentos sin trocear.
- Procesamiento de documentación bancaria y contable: extracción de datos de titulares, cuentas y referencias de pago en extractos y contratos, aprovechando la distinción entre datos de personas y de organizaciones para no enmascarar datos corporativos innecesariamente.
- Limpieza de corpus para entrenamiento o publicación: filtrado de PII en lotes de correspondencia, tablas y documentos con OCR deficiente, donde el modelo ha sido entrenado explícitamente con ese tipo de ruido.
- Construcción de pipelines de extracción con esquema propio: al aceptar etiquetas en la entrada, un equipo puede definir su propia taxonomía de PII y reutilizar el modelo sin reentrenar, validando previamente la calidad sobre sus etiquetas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre una validación de 405 documentos y 4134 entidades. Las métricas son estrictas: un span solo cuenta si coincide exactamente con los límites de referencia. Coverage es una métrica más laxa que mide la proporción de entidades de referencia completamente cubiertas por predicciones de la misma clase.

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 789 | 93,28 % | 91,51 % | 92,39 % | 92,52 % |
| LOCATION | 249 | 88,94 % | 74,30 % | 80,96 % | 78,31 % |
| DATE | 562 | 89,64 % | 75,44 % | 81,93 % | 78,11 % |
| PHONE | 136 | 95,04 % | 84,56 % | 89,49 % | 86,03 % |
| EMAIL | 62 | 100,00 % | 87,10 % | 93,10 % | 87,10 % |
| PII | 2336 | 89,91 % | 80,86 % | 85,15 % | 83,05 % |
| **Total** | 4134 | 90,83 % | 81,98 % | 86,18 % | 84,06 % |

Sensibilidad al umbral (por defecto 0,5):

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---:|---:|---:|---:|---:|---:|---:|
| 0,02 | 0,834 | 0,838 | 0,836 | 3464 | 689 | 670 |
| 0,10 | 0,868 | 0,834 | 0,851 | 3447 | 522 | 687 |
| 0,30 | 0,897 | 0,828 | 0,861 | 3422 | 392 | 712 |
| **0,50** | **0,908** | **0,820** | **0,862** | **3389** | **342** | **745** |
| 0,70 | 0,917 | 0,810 | 0,860 | 3349 | 302 | 785 |
| 0,90 | 0,929 | 0,795 | 0,857 | 3286 | 252 | 848 |
| 0,99 | 0,947 | 0,707 | 0,809 | 2922 | 164 | 1212 |

No se han publicado comparaciones con otros modelos de PII en ruso en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 287 millones de parámetros, los pesos en fp32 ocupan aproximadamente 1,15 GB; en fp16/bf16 alrededor de 0,6 GB. A ello hay que sumar la memoria de activaciones, que depende del tamaño de lote y de la longitud de secuencia (hasta 4096 tokens).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en fp16 con lotes moderados; una RTX 4090, A100 o H100 ofrece margen amplio para lotes grandes y documentos de longitud máxima.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más en fp16, aunque el dato exacto no está publicado.
- Opciones de despliegue: la librería oficial `gliner2` con `AutoExtractor`; el autor no documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma que la velocidad no se degrada en documentos voluminosos gracias a la predicción directa de spans, pero no publica cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de PII en ruso en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| metrika-labs/ru-pii-ner-gliner2.5 | 287.355.159 | 4096 tokens | Apache 2.0 | GLiNER2.5, etiquetas en entrada |
| fastino/gliner2.5-multi-v1 (base) | no disponible | no disponible | no disponible | GLiNER2.5 multilingüe genérico |
| Alternativas específicas de PII en ruso | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado principalmente para ruso; el ~6 % de ejemplos en otras lenguas no garantiza un rendimiento equivalente fuera del ruso.
- La calidad declarada se refiere únicamente a las etiquetas documentadas (`ru_pii_person`, `ru_pii_location`, `ru_pii_date`, `ru_pii_phone`, `ru_pii_email`, `ru_pii`). Con etiquetas arbitrarias el rendimiento no está garantizado, aunque la arquitectura las acepte.
- El dataset de entrenamiento es totalmente sintético, con solo una parte revisada manualmente; puede no representar toda la variabilidad de documentos reales, especialmente en dominios muy específicos.
- El recall en LOCATION (74,30 %) y DATE (75,44 %) es notablemente inferior al de PERSON, lo que implica riesgo de dejar datos sin enmascarar en tareas de anonimización estricta.
- El umbral por defecto de 0,5 prioriza precisión sobre exhaustividad; para anonimización con requisitos de cumplimiento conviene bajarlo, asumiendo más falsos positivos.
- La anotación es conservadora por diseño: en casos ambiguos se marca como dato personal, lo que puede generar sobrerredacción de datos organizacionales en algunos contextos.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a ataques adversariales o texto manipulado.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna por parte del autor.
- No debe usarse como única barrera de cumplimiento normativo: los resultados deben validarse con revisión humana en flujos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/metrika-labs/ru-pii-ner-gliner2.5
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Documentación y repositorio de GLiNER2: https://github.com/fastino-ai/GLiNER2
