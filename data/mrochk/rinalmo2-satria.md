# mrochk/rinalmo2-satria

## Resumen

RiNALMo2 Satria es un modelo de extracción de características (feature extraction) derivado de la familia RiNALMo2, especializada en el análisis de secuencias de ARN. El repositorio, publicado por el usuario mrochk en Hugging Face, contiene un checkpoint de aproximadamente 100,47 millones de parámetros en formato safetensors (0,4 GB), etiquetado con la arquitectura RiNALMo2 y empaquetado para su uso con la librería transformers mediante código personalizado (custom_code).

El modelo no es un generador de texto ni un asistente conversacional: su pipeline declarado es feature-extraction, lo que lo sitúa en la categoría de modelos de representación (encoders) que producen embeddings útiles para tareas downstream sobre ARN, como predicción de estructura secundaria, clasificación funcional o anotación de motivos. La referencia a RiNALMo2 lo vincula con la línea de modelos de lenguaje de ARN basados en transformers que han demostrado utilidad en bioinformática estructural.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es una plantilla automática sin datos de entrenamiento, licencia, idiomas ni evaluación. Aun así, el tamaño reducido y el formato safetensors permiten caracterizar su despliegue y sus posibles usos, que se detallan a continuación con las cautelas propias de un artefacto sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiNALMo2 (transformer para secuencias de ARN; detalles no disponibles) |
| Parametros totales | 100.469.248 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicado; no hay GGUF) |
| Idiomas soportados | no disponible (modelo sobre alfabeto de nucleótidos, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Libreria | transformers (custom_code) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta RiNALMo2 indica que el modelo pertenece a la segunda generación de RiNALMo, una familia de modelos de lenguaje de ARN construidos sobre transformers y entrenados con objetivos de modelado enmascarado sobre grandes corpus de secuencias de nucleótidos. El repositorio declara la arquitectura mediante la etiqueta correspondiente y requiere código personalizado (custom_code), lo que sugiere que la implementación de las capas no está incluida en la versión estándar de transformers y debe cargarse con trust_remote_code.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO (poco probable en un encoder de ARN) ni innovaciones técnicas específicas. Tampoco consta si el checkpoint es un modelo base preentrenado o un ajuste fino sobre RiNALMo2; el sufijo "satria" no está documentado. Todo lo relativo al procedimiento de entrenamiento debe considerarse no disponible.

## Capacidades

- Extracción de embeddings de secuencias de ARN: el pipeline declarado es feature-extraction, por lo que la salida esperada son representaciones vectoriales por secuencia o por token.
- Representación contextual de nucleótidos: al ser un transformer sobre alfabeto de ARN, captura dependencias de largo alcance útiles para estructura secundaria y terciaria.
- Uso como backbone congelado o ajustable en tareas downstream de bioinformática (clasificación, regresión, segmentación de motivos).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable en lenguaje natural; el "vocabulario" es el alfabeto de nucleótidos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Predicción de estructura secundaria de ARN: usar los embeddings por token como entrada a un cabezal ligero (por ejemplo, una BiLSTM o un transformer pequeño) que prediga emparejamientos de bases; el tamaño de 100 M permite entrenar el cabezal en una sola GPU.
- Clasificación de familias de ARN no codificante: extraer el embedding medio de la secuencia y entrenar un clasificador lineal o MLP para distinguir tipos funcionales (tRNA, rRNA, miRNA, lncRNA).
- Anotación de motivos de unión a proteínas: emplear las representaciones contextuales para localizar regiones de unión de proteínas RBP mediante un cabezal de segmentación.
- Búsqueda de similitud de secuencias: indexar embeddings de un corpus de ARN y recuperar vecinos cercanos para agrupar secuencias homólogas sin alineamiento múltiple.
- Filtrado de calidad en pipelines de secuenciación: usar la perplejidad o la norma del embedding como señal de anomalía para descartar lecturas mal formadas o artefactos.
- Investigación de diseño de ARN: incorporar el modelo como extractor de características en bucles de optimización de secuencias (por ejemplo, ARN mensajero terapéutico) para puntuar candidatos antes de la validación experimental.
- Reproducción de experimentos RiNALMo2: servir como checkpoint ligero para validar pipelines de evaluación de la familia sin cargar variantes de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no consta comparación con otros modelos de ARN en el repositorio.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,4 GB de pesos (100,47 M de parámetros × 4 bytes), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada en fp16/bf16: aproximadamente 0,2 GB de pesos; adecuado para GPUs de gama de entrada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; A100/H100 solo necesarias para procesar lotes muy grandes o para ajuste fino del backbone completo.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con trust_remote_code (requerido por custom_code); no hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son viables sin conversión previa. vLLM y TGI no están orientados a feature-extraction de este tipo y no se han validado.
- Latencia y throughput: no disponibles; al tratarse de un encoder de 100 M, se espera un throughput alto (miles de secuencias por segundo en una RTX 4090 con lotes grandes), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrochk/rinalmo2-satria | 100,47 M | no disponible | Feature extraction de ARN | no disponible | Hugging Face (0 descargas) |
| RiNALMo (original) | no disponible en esta busqueda | no disponible | Lenguaje de ARN | no disponible | Hugging Face |
| DNABERT-2 | no disponible en esta busqueda | no disponible | Embeddings de ADN | no disponible | Hugging Face |
| Nucleotide Transformer | no disponible en esta busqueda | no disponible | Embeddings de ADN/ARN | no disponible | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: no se han publicado parámetros, contexto ni métricas para las alternativas en el material consultado, y el checkpoint satria carece de evaluación. Se recomienda tratar esta tabla como orientativa de categoría, no de rendimiento.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto; cualquier despliegue en producción parte de una base documental inexistente.
- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente incierto; debe contactarse con el autor antes de integrarlo en productos.
- Sin validación publicada: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni validación por terceros.
- Dependencia de custom_code: la carga requiere trust_remote_code=True, lo que implica ejecutar código del repositorio; auditar el código antes de usarlo en entornos sensibles.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de representaciones erróneas en secuencias fuera de la distribución de entrenamiento (por ejemplo, ARN modificados o secuencias sintéticas).
- Contexto máximo desconocido: no se puede garantizar el procesamiento de secuencias largas (por ejemplo, ARN mensajeros de varios miles de nucleótidos) sin truncamiento.
- Idiomas: no aplica a lenguaje natural; el modelo no debe usarse para tareas de texto.
- Procedencia del checkpoint incierta: el sufijo "satria" no está documentado, por lo que no se conoce si es un ajuste fino, una destilación o una variante experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrochk/rinalmo2-satria
- Referencia citada en la model card (calculadora de impacto ambiental): https://mlco2.github.io/impact
- Artículo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- RiNALMo (familia original): no se ha encontrado enlace en la búsqueda web proporcionada
- Paper de RiNALMo2: no disponible
- Demo o espacio asociado: no disponible
