# shashankpandey04/shield-ai-phishing-detector

## Resumen

S.H.I.E.L.D. AI Phishing Email Detector es un modelo de clasificación de texto obtenido por ajuste fino de DistilBERT sobre correos electrónicos etiquetados como seguros o de phishing. Lo publica el usuario de HuggingFace shashankpandey04 bajo licencia Apache 2.0 y su propósito es servir como componente de un flujo de seguridad del correo: dado el texto de un mensaje, devuelve una probabilidad binaria de que sea phishing. Con 66.955.010 parámetros y un peso en repositorio de 0,3 GB, es un modelo pequeño y ligero, pensado para inferencia rápida y despliegue sencillo.

El modelo parte del checkpoint preentrenado `distilbert/distilbert-base-uncased`, una versión destilada de BERT con 6 capas y vocabulario en inglés sin distinción de mayúsculas. La longitud máxima de entrada declarada es de 256 tokens y el umbral de clasificación por defecto es 0,5. No se documentan idiomas soportados más allá del inglés implícito del tokenizador base.

Su relevancia actual es la de un clasificador especializado y barato computacionalmente: permite filtrar correo en tiempo real, integrarse en pasarelas de correo o servir de primera etapa de triaje antes de análisis más costosos (resolución de URLs, sandboxing de adjuntos, análisis de cabeceras). El autor reporta métricas muy altas sobre un split de test de 3.636 correos, aunque advierte explícitamente que no garantizan el mismo rendimiento en tráfico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT), cabeza de clasificación de secuencia |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrada) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base `distilbert-base-uncased`, entrenado en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT, la variante destilada de BERT-base con 6 capas, dimensión oculta 768 y aproximadamente 67 millones de parámetros. Sobre el encoder se añade una cabeza de clasificación lineal para dos etiquetas: `0` correo seguro y `1` correo de phishing. La entrada se trunca a 256 tokens, lo que limita el análisis a la parte inicial del cuerpo del mensaje y descarta el resto del texto en correos largos.

El entrenamiento consistió en un ajuste fino supervisado desde el checkpoint preentrenado de DistilBERT, usando texto de correo etiquetado y una partición de entrenamiento, validación y test con separación por grupos (group-aware) para evitar filtración de datos entre splits. La selección del checkpoint se hizo en función de la validación. No se documentan el volumen total de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación; tampoco se describen innovaciones técnicas adicionales más allá del propio ajuste fino.

## Capacidades

- Clasificación binaria de texto de correo electrónico en dos clases: seguro y phishing.
- Salida de probabilidad calibrada de forma laxa (umbral por defecto 0,5, ajustable por el usuario), útil para umbralizar según la tolerancia a falsos positivos del despliegue.
- Procesamiento de entradas de hasta 256 tokens, adecuado para asuntos y primeros párrafos del cuerpo del mensaje.
- Inferencia de baja latencia gracias a su tamaño reducido (67 M de parámetros).
- Compatible con el pipeline `text-classification` de la librería `transformers` y con Text Embeddings Inference, según las etiquetas del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un clasificador puro.
- Capacidades multilingües: no documentadas; el tokenizador base es de vocabulario inglés.

## Casos de uso

- Filtrado en pasarela de correo: el modelo se sitúa como primera etapa ante el MTA o una API de correo, clasificando cada mensaje entrante y derivando los marcados como phishing a cuarentena o a revisión humana. Su tamaño permite procesar miles de mensajes por minuto en una sola GPU pequeña.
- Triaje previo a análisis costoso: los correos con probabilidad alta se envían a análisis de URLs, sandboxing de adjuntos o inspección de cabeceras, reduciendo el coste computacional del pipeline al no aplicar esas etapas a todo el tráfico.
- Etiquetado asistido en bandejas de entrada: integrado en un cliente de correo, muestra una advertencia al usuario cuando la probabilidad supera un umbral configurable, con la posibilidad de ajustar el umbral para priorizar recall (menos phishing no detectado) o precisión (menos falsos positivos).
- Generación de datos de entrenamiento y aumento de datasets: el clasificador puede preetiquetar grandes volúmenes de correo no etiquetado, que después se revisan manualmente para ampliar el conjunto de entrenamiento de un sistema mayor.
- Monitorización de campañas de concienciación: en simulaciones de phishing internas, el modelo permite comprobar si los correos de prueba se clasifican como sospechosos antes de enviarlos, validando que la simulación es realista.
- Investigación académica en detección de phishing: al ser un checkpoint pequeño, reproducible y con licencia permisiva, sirve como línea base para comparar con modelos mayores o con enfoques basados en reglas y en análisis de URLs.
- Moderación de formularios y mensajes de contacto: aplicable a textos breves de sitios web (formularios de contacto, mensajes de soporte) para detectar intentos de ingeniería social, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un split de test retenido de 3.636 correos:

| Métrica | Resultado |
|---|---:|
| Accuracy | 98,68 % |
| Precisión (phishing) | 98,30 % |
| Recall (phishing) | 98,30 % |
| F1 (phishing) | 98,30 % |
| ROC-AUC | 99,91 % |

Matriz de confusión (filas reales, columnas predichas):

| | Predicho seguro | Predicho phishing |
|---|---:|---:|
| Real seguro | 2200 | 24 |
| Real phishing | 24 | 1388 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que estas cifras corresponden a un split del dataset de origen y no establecen un rendimiento equivalente en tráfico de correo real.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3 GB de pesos más memoria de activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 la huella de pesos baja a aproximadamente 0,15 GB; en cuantización de 8 bits a unos 0,07 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para alto throughput, una T4, L4, A10G o A100 permiten procesar lotes grandes.
- Cabe en GPU consumer y también en CPU: la inferencia en CPU es viable para volúmenes moderados dado el tamaño del modelo.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (etiqueta `text-embeddings-inference` del repositorio), servidores de inferencia compatibles con endpoints, y exportación a ONNX o cuantización dinámica para CPU si se necesita.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por lote en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| S.H.I.E.L.D. AI Phishing Email Detector | 66,9 M | 256 tokens | Clasificación binaria de phishing | Apache 2.0 | HuggingFace |
| DistilBERT base sin ajustar | 66,9 M | 512 tokens | Modelo de lenguaje enmascarado (no clasificador) | Apache 2.0 | HuggingFace |
| BERT base uncased | 110 M | 512 tokens | Modelo de lenguaje enmascarado (requiere ajuste) | Apache 2.0 | HuggingFace |
| Modelos de clasificación de spam/phishing de terceros | no disponible | no disponible | Clasificación de correo | variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Los resultados de benchmarks provienen de un split del dataset de origen; el propio autor advierte que no garantizan rendimiento equivalente en tráfico real, donde la distribución, la ofuscación y las técnicas noveles de phishing pueden degradar la precisión.
- El modelo analiza únicamente el texto del correo: no verifica URLs, adjuntos, identidad del remitente ni infraestructura, por lo que no puede determinar por sí solo si un mensaje es malicioso.
- La ventana de 256 tokens trunca correos largos; el contenido relevante situado más allá de ese límite no se considera.
- Idiomas soportados no documentados; el tokenizador base es inglés, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de sesgos derivados del dataset de entrenamiento: estilos de escritura, remitentes o dominios sobrerrepresentados pueden sesgar las predicciones.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de falsos positivos y falsos negativos; la matriz de confusión reportada muestra 24 falsos positivos y 24 falsos negativos sobre 3.636 muestras.
- El autor indica explícitamente que la predicción no debe ser la única base para decisiones de seguridad; se requiere evaluación independiente y pruebas de seguridad antes de un despliegue operativo.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- El repositorio tiene muy poca tracción (14 descargas, 0 likes) y fue creado y actualizado el mismo día, sin historial de mantenimiento; conviene tratar el checkpoint como experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shashankpandey04/shield-ai-phishing-detector
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
