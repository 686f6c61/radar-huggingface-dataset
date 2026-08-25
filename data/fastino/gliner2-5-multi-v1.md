# fastino/gliner2.5-multi-v1

## Resumen

GLiNER2.5 Multi es un modelo de extracción de información basado en esquemas desarrollado por Fastino Labs. Se trata del checkpoint multilingüe de la familia GLiNER2.5, construido sobre el encoder mDeBERTa-v3-base, con 287 millones de parámetros. Su principal innovación es una arquitectura de predicción de límites (boundary) que sustituye la enumeración de spans de longitud fija por un emparejamiento disperso de posiciones de inicio y fin, lo que permite extraer entidades de cualquier longitud dentro de la ventana codificada.

El modelo unifica en un solo esquema tareas como el reconocimiento de entidades nombradas, la clasificación de texto (intención, sentimiento, tema), la extracción de registros estructurados, la extracción de relaciones y la puntuación de atributos de span. Está pensado para ejecutarse localmente en CPU, CUDA o MPS, sin necesidad de una API externa, lo que lo hace relevante para aplicaciones de extracción de información en entornos de producción con requisitos de privacidad o latencia.

GLiNER2.5 Multi se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. Su interfaz pública es común a toda la familia GLiNER2.5, con una carga mediante `AutoExtractor` que selecciona automáticamente la arquitectura `BoundaryExtractor`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BoundaryExtractor (encoder mDeBERTa-v3-base) |
| Parametros totales | 287.355.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder base de mDeBERTa-v3 soporta hasta 512 tokens, pero no se especifica en la documentacion) |
| Tipos de cuantizacion | fp16 (soportado mediante `quantize=True`); otros formatos no documentados |
| Idiomas soportados | multilingue (se indica "multilingual" y "en", sin lista exhaustiva) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2.5 Multi emplea una arquitectura de extracción basada en límites (boundary). En lugar de enumerar todos los posibles spans de longitud fija, el modelo predice pares de posiciones de inicio y fin sobre el texto codificado, lo que permite extraer entidades de cualquier longitud sin restricciones de ancho predefinido. El encoder es mDeBERTa-v3-base, un transformer preentrenado multilingüe de la familia DeBERTa. El modelo integra además módulos de clasificación (Classifier) para imponer restricciones entre etiquetas y de extracción conjunta (JointIE) para producir grafos de entidades y relaciones tipadas.

No se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. La documentación indica que el modelo es multilingüe y que soporta tareas de extracción de entidades, clasificación de texto, extracción de registros estructurados, relaciones y atributos de span, todo ello mediante una interfaz de esquema definida por el usuario.

## Capacidades

- Extracción de entidades nombradas (NER) con etiquetas personalizadas, incluyendo soporte para descripciones de etiquetas específicas de dominio.
- Clasificación de texto: intención, sentimiento, tema, entre otras, mediante el módulo `Classifier` que permite restricciones entre etiquetas.
- Extracción de registros estructurados (records) y de atributos de span (por ejemplo, puntuar una entidad con una propiedad).
- Extracción de relaciones entre entidades mediante el módulo `JointIE`, que genera grafos tipados de entidad-relación.
- Soporte de decodificación con restricciones (constrained decoding) para garantizar coherencia entre etiquetas.
- Capacidades multilingües, al estar basado en mDeBERTa-v3, aunque la documentación solo confirma inglés y multilingüe general.
- Inferencia local en CPU, CUDA o MPS sin dependencias externas de API.
- Carga mediante `AutoExtractor` que selecciona automáticamente la arquitectura `BoundaryExtractor`.

## Casos de uso

- Extracción de entidades en documentos legales: identificar partes, fechas, cláusulas y montos en contratos con descripciones personalizadas para cada tipo de entidad, gracias a la capacidad de definir etiquetas con contexto semántico.
- Análisis de atención al cliente: clasificar automáticamente la intención de los tickets de soporte (reclamación, consulta, devolución) y extraer entidades como número de pedido, producto o fecha, todo con un único modelo.
- Extracción de relaciones en literatura biomédica: detectar pares de entidades (proteína, enfermedad, fármaco) y extraer la relación entre ellos mediante `JointIE`, útil para construir bases de conocimiento.
- Clasificación de sentimiento en reseñas de productos: etiquetar el texto como positivo, negativo o neutro, y a la vez extraer los aspectos concretos mencionados (batería, pantalla, precio) con sus respectivos spans.
- Extracción de registros estructurados desde formularios o correos: convertir textos no estructurados en JSON con campos definidos (nombre, dirección, fecha, etc.) para alimentar bases de datos o CRMs.
- Análisis de textos financieros: identificar entidades como empresas, cifras, fechas y extraer relaciones de adquisición o fusión, con capacidad de procesar múltiples idiomas en un entorno corporativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 287M de parámetros y pesos en fp16, la inferencia requiere aproximadamente 574 MB de VRAM (287M × 2 bytes), aunque en la práctica se necesita memoria adicional para activaciones y contexto. Un GPU con 4 GB de VRAM es suficiente para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4090, etc.). Para producción con alto throughput, se recomienda una A10, A100 o H100, aunque no es estrictamente necesario.
- Se puede ejecutar en CPU sin GPU, aunque la latencia será mayor. La librería `gliner2[local]` soporta PyTorch y permite el uso de MPS en Macs.
- Opciones de despliegue: la librería `gliner2` permite cargar el modelo con `AutoExtractor` y usar `torch.compile` para optimización. No se documenta integración con vLLM, llama.cpp u otros servidores de inferencia, pero al ser un modelo de encoder puro puede servirse con frameworks como FastAPI o Triton.
- Latencia y throughput: no se han publicado datos específicos; al ser un modelo de encoder pequeño (287M), la inferencia en GPU es del orden de decenas de milisegundos por muestra, dependiendo del hardware y la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fastino/gliner2.5-multi-v1 | 287M | mDeBERTa-v3-base | no especificado | Entidades, clasificacion, relaciones, records | Apache 2.0 | Hugging Face |
| fastino/gliner2.5-base-v1 | 194M | DeBERTa-v3-base | no especificado | Entidades, clasificacion, relaciones, records | Apache 2.0 | Hugging Face |
| fastino/gliner2.5-small-v1 | 74M | DeBERTa-v3-xsmall | no especificado | Entidades, clasificacion, relaciones, records | Apache 2.0 | Hugging Face |
| fastino/gliner2-multi-v1 (version anterior) | no disponible | mDeBERTa-v3-base | no especificado | Entidades, clasificacion | Apache 2.0 | Hugging Face |

La comparativa se limita a la propia familia GLiNER2.5, ya que no se dispone de datos de otros modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- El modelo está basado en mDeBERTa-v3, que tiene una longitud de contexto máxima de 512 tokens; aunque no se especifica, es probable que la extracción esté limitada a ese rango, lo que puede ser insuficiente para documentos muy largos.
- No se han publicado resultados de benchmarks, por lo que no se puede evaluar su rendimiento cuantitativo frente a otros modelos de extracción.
- Aunque es multilingüe, la documentación solo confirma inglés y un soporte general multilingüe; el rendimiento en idiomas específicos puede variar.
- La extracción de entidades y relaciones puede producir falsos positivos o alucinaciones, especialmente con etiquetas poco descriptivas o en textos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar las obligaciones de atribución y distribución.
- No se han documentado sesgos específicos, pero al estar basado en un modelo preentrenado general, puede reflejar sesgos presentes en los datos de entrenamiento de mDeBERTa-v3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio GitHub de GLiNER2: https://github.com/fastino-ai/GLiNER2
- Paper en arXiv: https://arxiv.org/abs/2507.18546
- Web de Fastino Labs: https://fastino.ai/
- Colección de la familia GLiNER2.5: https://huggingface.co/collections/fastino/gliner2-family
