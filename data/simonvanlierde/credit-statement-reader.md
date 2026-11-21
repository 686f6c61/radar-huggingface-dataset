# simonvanlierde/credit-statement-reader

## Resumen

El credit-statement-reader es un modelo de clasificación de texto multietiqueta desarrollado por Simon Van Lierde, afinado a partir del encoder Ettin-68M del Johns Hopkins University Center for Language and Speech Processing. Resuelve un problema concreto y muy específico: leer una declaración de contribución de autoría (author contribution statement) y determinar qué roles CRediT (Contributor Roles Taxonomy) ostenta cada autor, entre los 14 definidos por NISO. Acepta tanto declaraciones que usan los nombres oficiales de los roles como declaraciones redactadas con palabras propias de los autores.

El modelo tiene 68,4 millones de parámetros y una arquitectura encoder-only de tipo ModernBERT, con una ventana de entrada truncada a 1.024 tokens. Se distribuye en tres formatos: pesos PyTorch en safetensors, ONNX fp32 e ONNX int8, lo que permite ejecución en navegador mediante transformers.js. Forma parte del proyecto CRediT Matrix, donde actúa como el modelo de navegador del censo CRediT, de modo que el texto analizado nunca abandona la máquina del usuario.

Su relevancia radica en la combinación de tres factores: un dominio de aplicación muy acotado (metadatos de publicación científica), un tamaño lo bastante pequeño para inferencia local y en navegador, y una licencia MIT sin restricciones de uso comercial. Está entrenado exclusivamente con declaraciones en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only tipo ModernBERT (base Ettin-68M) |
| Parametros totales | 68.414.478 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | ONNX fp32, ONNX int8; pesos PyTorch en safetensors (precision original) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (fp32 e int8), tokenizer.json |
| Modelo base | jhu-clsp/ettin-encoder-68m (revision ac19ae4bc51093b31c475665ac872a936d056cc2) |
| Tarea | Clasificacion de texto multietiqueta (14 salidas con sigmoid) |
| Umbral de decision | 0,4 (valor optimizado en el conjunto de desarrollo, guardado en best.json) |
| Libreria | transformers.js (tambien compatible con onnxruntime y PyTorch) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, heredado de Ettin-68M, sobre el que se añade una cabeza de clasificación de secuencia con 14 salidas independientes y activación sigmoid, una por cada rol CRediT. La entrada es un par de secuencias: primero un texto corto que identifica al autor (nombre, variantes de iniciales y posición en la lista de firmas, por ejemplo «Na-Gyeong Ryu (N.-G.R., NGR, Ryu NG); author 2 of 5») y después la declaración completa. El modelo se ejecuta una vez por autor y las respuestas se agregan como pares (autor, rol). Los identificadores de las 14 etiquetas se declaran en id2label del config.

El ajuste fino se realizó sobre 166.567 declaraciones de contribución, todas en inglés, bajo la denominada «definition B» de etiquetado: un autor ostenta un rol cuando la declaración lo afirma, ya sea con el nombre CRediT explícito («Conceptualization: A.B.») o con redacción libre («A.B. designed the study» se mapea a methodology). El mapeo de formulaciones habituales a roles sigue los ejemplos de roles CRediT de 2026 (Hosseini et al.). No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación; se trata de un ajuste supervisado convencional para clasificación. La innovación técnica destacable es la doble distribución ONNX (fp32 e int8) pensada para transformers.js, con verificación de hashes SHA-256 publicados en la model card y en census/model.json.

## Capacidades

- Clasificación multietiqueta de declaraciones de contribución científica en los 14 roles CRediT, con una probabilidad independiente por rol.
- Lectura de declaraciones con nomenclatura CRediT oficial y de declaraciones en redacción libre de los autores.
- Identificación del autor dentro de la declaración mediante texto de autor con nombre, variantes de iniciales y posición en la lista de firmas.
- Ejecución en navegador mediante transformers.js con cuantización int8, sin enviar texto a servidores externos.
- Ejecución en Python mediante onnxruntime con el tokenizer de Hugging Face.
- Salida determinista por pares (autor, rol) tras aplicar el umbral de 0,4.
- No dispone de generación de texto, razonamiento libre, código, matemáticas, visión, audio, tool calling ni modo de pensamiento. Es exclusivamente un clasificador.

## Casos de uso

- Lectura de declaraciones de contribución en la aplicación web CRediT Matrix: el modelo se carga en el navegador con transformers.js en int8 y procesa la declaración localmente, de modo que el texto del usuario no sale de su equipo.
- Censado masivo de declaraciones de contribución en revistas y repositorios: combinado con el parser de reglas para las declaraciones que usan nombres CRediT, procesa lotes de declaraciones en inglés y produce pares (autor, rol) para análisis bibliométrico.
- Enriquecimiento de metadatos editoriales: dado un manuscrito con declaración de autoría, extrae automáticamente los roles de cada firmante para alimentar bases de datos de contribución.
- Verificación de completitud de declaraciones: comparar los roles declarados con los exigidos por la política de la revista y señalar autores sin rol asignado.
- Línea base para investigación sobre declaraciones de contribución: al estar publicado con pesos, hashes y código fuente, sirve como referencia reproducible para otros grupos que entrenen clasificadores similares.
- Preprocesamiento para sistemas de atribución de crédito académico: la salida estructurada (autor, rol) se puede integrar en pipelines que calculen métricas de contribución o generen informes de autoría.
- Despliegue en entornos con recursos limitados o air-gapped: el tamaño de 68M parámetros y la versión int8 permiten ejecución en CPU sin GPU, incluso dentro de aplicaciones de escritorio o extensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de consistencia entre runtimes: con lectura autor a autor, la copia int8 produjo los mismos pares que la evaluación por lotes en 37 de 40 artículos de test, y la copia fp32 coincidió con el modelo PyTorch en 39 de 40. El umbral de 0,4 se seleccionó por ser el que mejor puntuó en el conjunto de desarrollo, pero no se publican valores de precisión, recall o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (68M parámetros, aproximadamente 270 MB de pesos) y en torno a 70-100 MB en int8, más el espacio de activaciones para 1.024 tokens.
- GPU recomendadas: innecesarias; cualquier GPU con al menos 1 GB de memoria libre basta (por ejemplo GTX 1650, RTX 3050 o superiores). En A100 o H100 el modelo está sobredimensionado para la carga.
- Cabe en cualquier GPU de consumo e incluso en CPU modesta; la ejecución en navegador vía transformers.js con int8 está soportada de forma explícita.
- Opciones de despliegue: onnxruntime (Python), transformers.js (navegador), PyTorch con transformers para los pesos safetensors. No se documenta soporte específico para vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera latencia de milisegundos por autor en CPU moderna, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simonvanlierde/credit-statement-reader | 68,4M | 1.024 tokens | Clasificacion CRediT multietiqueta | MIT | Hugging Face, ONNX, transformers.js |
| jhu-clsp/ettin-encoder-68m (base) | 68M | No disponible en la informacion | Encoder general | No disponible en la informacion | Hugging Face |
| Clasificadores CRediT basados en BERT clasico | No disponible | Tipicamente 512 tokens | Clasificacion CRediT | Variable | No disponible |

No se dispone en la informacion proporcionada de resultados comparativos de rendimiento frente a alternativas. La comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo lee lo que la declaración dice, no lo que realmente ocurrió; no debe usarse para juzgar la conducta real de una persona.
- Uso fuera de alcance declarado: decisiones sobre autoría, contratación o crédito sin revisión humana de la declaración.
- Entrenado exclusivamente con declaraciones en inglés; no se garantiza comportamiento en otros idiomas.
- Aunque se le proporcione texto que no sea una declaración de contribución, seguirá asignando roles, por lo que puede producir salidas espurias.
- Riesgo de alucinación en el sentido de asignación de roles no respaldados por el texto, especialmente cerca del umbral de 0,4.
- Un rol cuya probabilidad esté próxima al umbral puede cambiar entre runtimes y tamaños de lote; la cuantización int8 cuantiza activaciones por lote y introduce variabilidad (se documentan discrepancias en 3 de 40 artículos para int8 y 1 de 40 para fp32 frente a PyTorch).
- El umbral no está en config.json sino en best.json, lo que exige cargarlo por separado; omitirlo altera las decisiones.
- Sesgos conocidos: no se documentan en la información disponible, pero al entrenarse solo con declaraciones en inglés puede reflejar sesgos de las prácticas de autoría de la literatura anglosajona.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar los hashes publicados para verificar la integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simonvanlierde/credit-statement-reader
- Modelo base Ettin-68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Repositorio CRediT Matrix: https://github.com/simonvanlierde/credit-matrix
- Codigo del censo: https://github.com/simonvanlierde/credit-matrix/tree/main/census
- Taxonomia CRediT (NISO): https://credit.niso.org/
