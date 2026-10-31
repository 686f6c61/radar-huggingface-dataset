# finipher/finipher-transaction-classifier

## Resumen

Finipher transaction classifier v1.0.0 es un clasificador de texto especializado en finanzas personales desarrollado por el usuario finipher y publicado en HuggingFace. El modelo clasifica líneas de transacciones bancarias o de tarjeta (nombres de comercios, cargos POS, transferencias ACH, etc.) en una de 17 categorías de gasto predefinidas: Education, Entertainment, Fees, Groceries, Healthcare, Income, Insurance, Mortgage, Personal Care, Rent, Restaurants, Shopping, Subscription, Transfer, Transportation, Travel y Utilities.

Técnicamente es un fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` sobre la cabecera `BertForSequenceClassification`, con 22,7 millones de parámetros. Su relevancia radica en que resuelve un problema muy común en aplicaciones de finanzas personales (PFM): categorizar automáticamente los movimientos de una cuenta bancaria, algo que las apps de banca suelen hacer con reglas frágiles o con LLM genéricos que resultan caros para procesar miles de transacciones por usuario. Al ser tan pequeño, puede ejecutarse en CPU y clasificar volúmenes altos a coste marginal casi nulo.

El modelo carga con las clases estándar de Transformers sin código personalizado, se distribuye en safetensors y su versión actual es la 1.0.0 (revision `v1.0.0` en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForSequenceClassification (fine-tuning de all-MiniLM-L6-v2) |
| Parametros totales | 22.719.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (max_length recomendado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 estandar de safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (sin especificar en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de all-MiniLM-L6-v2, un encoder Transformer de la familia BERT de 6 capas y 384 dimensiones ocultas, optimizado originalmente para embeddings de frases. Finipher ha sustituido la cabeza por una de clasificacion con 17 salidas (una por categoria de gasto) mediante BertForSequenceClassification. El nombre interno del checkpoint, `finance-multitask-minilm-two-head-v2`, sugiere un enfoque multitarea con dos cabezas, aunque la model card no detalla la segunda cabeza ni el procedimiento exacto.

Sobre los datos de entrenamiento, la model card indica explicitamente "To be confirmed": el autor declara que el repositorio se mantiene privado hasta documentar los datos de entrenamiento y los derechos sobre ellos. Esto es una senal de transparencia positiva, pero implica que no se conocen el numero de tokens, la composicion del dataset ni si hubo tecnicas de regularizacion o destilacion mas alla del fine-tuning estandar. Los datos de evaluacion mencionados (lineas de Plaid, tarjetas, POS y ACH, mas el dataset publico DoDataThings de 68k filas) sugieren un entrenamiento orientado a texto de transacciones reales, con prefijos de direccion `[debit]` y `[credit]` como parte del formato de entrada.

## Capacidades

- Clasificacion de lineas de transacciones bancarias y de tarjeta en 17 categorias de gasto fijas.
- Manejo del formato de entrada con prefijo de direccion: `[debit]` para cargos y `[credit]` para abonos.
- Procesamiento de nombres de comercios reales (Plaid, tarjetas de credito, POS, ACH), incluyendo telefonos, numeros de tienda y abreviaturas tipicas de extractos bancarios.
- Salida de etiqueta mas probabilidad por softmax, lo que permite umbrales de confianza (el autor recomienda no fiarse de predicciones por debajo de 0.50).
- Carga con `AutoModelForSequenceClassification` y `AutoTokenizer` estandar, sin trust_remote_code ni dependencias custom.
- No soporta generacion de texto, razonamiento, codigo, vision, audio ni tool calling: es un encoder de clasificacion pura.

## Casos de uso

- Categorizacion automatica en apps de finanzas personales: clasificar cada movimiento importado via Plaid, Yodlee o similar en categorias de gasto para dashboards de presupuesto. Con 22,7M de parametros, el coste por transaccion es insignificante frente a usar un LLM.
- Procesamiento masivo de extractos historicos: al importar anos de movimientos de un usuario, el modelo puede etiquetar decenas de miles de lineas en minutos en una CPU, algo inviable economicamente con modelos generativos.
- Deteccion de anomalias de gasto por categoria: al tener cada transaccion etiquetada y con score de confianza, se pueden construir reglas que marquen para revision manual las lineas con probabilidad inferior a 0.50.
- Conciliacion contable para autonomos y pymes: mapear movimientos bancarios a categorias contables aproximadas (Fees, Insurance, Utilities, Mortgage) como paso previo a la asignacion fiscal por un contable.
- Analisis de gasto en tarjetas corporativas: clasificar los gastos de empleados por categoria para politicas de reembolso, filtrando por Travel, Restaurants o Transportation.
- Preprocesado para pipelines de datos financieros: usar el clasificador como etapa de enriquecimiento en un pipeline ETL que ingiere transacciones y las prepara para analitica o reporting.
- Interfaces conversacionales de banca: alimentar a un chatbot financiero con transacciones ya categorizadas, reduciendo llamadas al LLM y latencia de respuesta.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluacion offline a traves del codigo de produccion de Finipher):

| Evaluacion | Precision |
|---|---|
| 1.290 lineas de comercios cotidianas escritas a mano (nombres Plaid, card swipes, POS, ACH) | 90,7% |
| DoDataThings 68k filas, categoria final Finipher | 98,7% |

No se han publicado comparaciones con modelos alternativos ni metricas estandar (MMLU, HumanEval, etc.), lo cual es esperable dado que es un clasificador de dominio. La segunda cifra hay que leerla con cautela: se mide contra la "categoria final Finipher", posiblemente el propio sistema de produccion de Finipher, no contra un ground truth independiente.

Errores conocidos documentados por el autor:

| Entrada | Etiqueta incorrecta |
|---|---|
| `[credit] WALMART DIR DEP PPD` (nomina) | Shopping |
| FasTrak y Circle K (tarjeta) | Groceries |
| Mortgage `PRINCIPAL PMT` | Utilities |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 90-100 MB en fp32 (22,7M de parametros x 4 bytes); en fp16, unos 45-50 MB. Cabe con holgura en cualquier GPU moderna e incluso en la mayoria de SoCs edge.
- CPU: perfectamente viable. Un BERT de 6 capas con secuencias de 64 tokens procesa miles de transacciones por segundo en un nucleo moderno; no se requiere GPU para cargas de trabajo tipicas de PFM.
- Consumer GPU: cualquier GPU con 2 GB de VRAM o mas (GTX 1650, RTX 3060, RTX 4090, Apple Silicon unificado) ejecuta el modelo sin problemas.
- Despliegue: libreria Transformers de HuggingFace con `AutoModelForSequenceClassification` (codigo de ejemplo en la model card). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas; para servirse como API se puede usar un contenedor simple con Transformers, o el Inference Endpoints de HuggingFace. No se menciona soporte para vLLM o TGI.
- Latencia: no se publican cifras; para un encoder de este tamano con max_length 64, la inferencia por linea esta tipicamente en el orden de milisegundos en CPU y sub-milisegundo en GPU (estimacion, no dato oficial).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finipher-transaction-classifier | 22,7M | Clasificacion de transacciones en 17 categorias | 64 tokens | other | HuggingFace, safetensors |
| all-MiniLM-L6-v2 (base) | 22,7M | Embeddings de frases (no clasificador) | 256 tokens | Apache 2.0 | HuggingFace |
| distilbert-base-uncased finetuned (p. ej. transaccion-classifiers de la comunidad) | ~66M | Clasificacion de texto general | 512 tokens | Apache 2.0 / variable | HuggingFace |
| LLM generalista (p. ej. Llama 3.2 1B) con prompting | 1.200M | Clasificacion zero-shot por prompt | 128k tokens | Licencia Llama | HuggingFace, GGUF |

Frente a un LLM generalista, este modelo pierde flexibilidad (17 categorias fijas, solo ingles, formato de entrada estricto) pero gana radicalmente en coste, latencia y determinismo por transaccion. Frente a otros fine-tunings de BERT de la comunidad, su ventaja es el dominio especifico y las metricas publicadas; su desventaja es la licencia sin aclarar y el origen de los datos de entrenamiento pendiente de documentar.

## Limitaciones y advertencias

- Licencia "other" sin terminos detallados en la model card: antes de cualquier uso comercial hay que verificar los terminos reales en el repositorio. El propio autor indica que el repo permanece privado hasta documentar los datos de entrenamiento y sus derechos, lo que sugiere que la situacion legal del modelo esta en revision.
- Origen de los datos de entrenamiento no confirmado: riesgo de que incluya datos de transacciones reales de clientes sin autorizacion documentada. Es el mayor caveat para produccion.
- Errores sistematicos documentados: nomina de Walmart clasificada como Shopping, peajes (FasTrak) y Circle K como Groceries, pagos de principal de hipoteca como Utilities. Conviene anadir reglas de post-procesado para estos patrones.
- Umbral de confianza: el autor recomienda no aceptar predicciones con probabilidad inferior a 0.50; en produccion deberia enrutarse ese volumen a revision manual o a un modelo de respaldo.
- Solo ingles: los nombres de comercios en otros idiomas o mercados (Espana incluido) estan fuera de distribucion y probablemente degraden la precision de forma significativa.
- Longitud maxima de 64 tokens: suficiente para lineas de transaccion, pero insuficiente si se quiere clasificar con contexto adicional (descripcion ampliada, metadata).
- Taxonomia cerrada de 17 categorias: no admite categorias personalizadas sin reentrenar.
- El autor advierte que la salida es una etiqueta de categoria, no asesoramiento fiscal ni financiero.
- Riesgo de alucinacion: no aplica al ser un clasificador discriminativo, pero si puede confundir categorias semanticamente cercanas (el propio autor documenta tres casos).
- Adopcion muy temprana: 5 descargas y 1 like en el momento de la ficha; no hay comunidad, issues ni validacion externa del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/finipher/finipher-transaction-classifier
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper, blog o demo: no disponible (no se han encontrado enlaces adicionales en la informacion proporcionada)
