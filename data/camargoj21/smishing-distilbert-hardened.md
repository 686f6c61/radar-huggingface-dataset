# CamargoJ21/smishing-distilbert-hardened

## Resumen

Smishing-distilbert-hardened es un modelo de clasificación de texto basado en DistilBERT (`distilbert-base-uncased`) afinado por CamargoJ21 para detectar smishing, es decir, phishing distribuido por SMS. El modelo resuelve un problema binario: clasificar un mensaje como legítimo (etiqueta 0) o malicioso, entendiendo como malicioso tanto el spam como el smishing (etiqueta 1). Se distribuye con licencia MIT y está pensado para un público angloparlante, ya que solo declara soporte de inglés.

La relevancia del modelo reside en su enfoque de endurecimiento mediante entrenamiento adversario: el autor generó copias camufladas de cada estafa del conjunto de entrenamiento, además de incluir estafas coloquiales y mensajes legítimos de servicios, con el objetivo de reducir la dependencia de patrones superficiales. El modelo incorpora un umbral de decisión calibrado de 0,2553 sobre P(malicioso), fijado para no superar el 1 % de falsos positivos en validación, lo que lo hace especialmente adecuado para escenarios donde molestar al usuario con falsas alarmas es costoso.

Con 66.955.010 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto y desplegable en hardware modesto. No obstante, el propio autor lo describe como un proyecto de curso y advierte explícitamente de que no es un filtro de producción, lo que conviene tener en cuenta al evaluar su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, `distilbert-base-uncased`) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT base admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | 0 = legítimo, 1 = malicioso (spam o smishing) |
| Umbral de decisión | 0,2553 sobre P(malicioso), calibrado para ≤1 % de falsos positivos en validación |
| Preprocesado requerido | `clean_text` del proyecto: sustituye enlaces, teléfonos, importes y números por `<URL>`, `<PHONE>`, `<MONEY>`, `<NUM>` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-24 |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT, una versión destilada de BERT con 6 capas y 66 millones de parámetros, y se afina como clasificador binario de secuencias. El autor no detalla la composición exacta del dataset ni el número de tokens de entrenamiento, pero sí indica que el conjunto incluye estafas por SMS, mensajes legítimos de servicios y estafas coloquiales. La innovación principal es el endurecimiento adversario: se generaron copias camufladas de cada estafa del conjunto de entrenamiento para forzar al modelo a aprender patrones semánticos en lugar de señales superficiales.

El entrenamiento se realizó durante 4 épocas con una tasa de aprendizaje de 2e-05, tamaño de lote de 32 y función de pérdida ponderada por clase, lo que compensa el desbalance típico entre mensajes legítimos y maliciosos. El umbral de decisión de 0,2553 se calibró sobre el conjunto de validación para limitar los falsos positivos al 1 %, un detalle relevante porque el umbral por defecto de 0,5 no sería adecuado para este caso de uso. No se documenta el uso de RLHF ni DPO, algo esperable en un clasificador de este tamaño.

## Capacidades

- Clasificación binaria de mensajes SMS en legítimo o malicioso (spam o smishing).
- Detección de estafas camufladas gracias al entrenamiento adversario con copias disfrazadas de los ejemplos de entrenamiento.
- Robustez frente a variaciones coloquiales de estafas, incluidas en el conjunto de entrenamiento.
- Normalización de entidades sensibles mediante el preprocesado `clean_text`: enlaces, teléfonos, importes y números se sustituyen por tokens genéricos antes de la inferencia.
- Umbral de decisión calibrado para controlar la tasa de falsos positivos, lo que permite ajustar el punto de operación según el coste de las alarmas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador de texto puro.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajería: el modelo puede clasificar cada mensaje entrante antes de entregarlo al usuario, usando el umbral de 0,2553 para mantener las falsas alarmas por debajo del 1 % en validación.
- Moderación en aplicaciones de mensajería: integrado como paso previo a la bandeja de entrada, permite etiquetar mensajes sospechosos y derivarlos a una carpeta de cuarentena sin bloquear la entrega.
- Enriquecimiento de alertas en plataformas antifraude: el score P(malicioso) puede combinarse con reglas de negocio (remitente desconocido, enlaces acortados) para priorizar la revisión manual de casos.
- Investigación y docencia en ciberseguridad: al ser un proyecto de curso con licencia MIT, sirve como base reproducible para experimentar con entrenamiento adversario en clasificación de texto.
- Generación de datasets etiquetados: el modelo puede preetiquetar grandes volúmenes de SMS para su posterior revisión humana, acelerando la construcción de corpus de smishing.
- Prototipado rápido de filtros antiphishing: su tamaño de 0,3 GB y su formato safetensors permiten desplegarlo en entornos con recursos limitados, como una instancia pequeña de Hugging Face Inference Endpoints o un contenedor con text-embeddings-inference.
- Análisis de campañas de smishing: clasificando lotes históricos de mensajes se pueden identificar patrones y variantes de estafa para alimentar sistemas de detección basados en reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el umbral de decisión calibrado (0,2553) y la restricción de diseño de ≤1 % de falsos positivos en validación, sin métricas de precisión, recall, F1 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (66,9 M de parámetros, aproximadamente 268 MB de pesos) y en torno a 70 MB en cuantización de 8 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar el modelo. Para lotes grandes, una A100 o H100 no aportan ventajas significativas por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU para inferencia en tiempo real con latencias de milisegundos por mensaje.
- Opciones de despliegue: transformers con PyTorch, Hugging Face Inference Endpoints (tag `endpoints_compatible`), text-embeddings-inference (tag `text-embeddings-inference`), y exportación a ONNX o cuantización dinámica para CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CamargoJ21/smishing-distilbert-hardened | 66,9 M | No disponible | Clasificación binaria de smishing | MIT | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face, ampliamente usado |

No se dispone de información sobre otros clasificadores de smishing comparables en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva y a su alternativa BERT completa.

## Limitaciones y advertencias

- El autor indica explícitamente que es un proyecto de curso y no un filtro de producción; no debe desplegarse como única barrera de seguridad sin validación adicional.
- Solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin un nuevo afinamiento.
- Requiere el preprocesado `clean_text` del proyecto; usarlo con texto sin normalizar puede degradar el rendimiento de forma significativa.
- El umbral de 0,2553 está calibrado para un objetivo concreto de falsos positivos en un conjunto de validación no documentado; en otros dominios puede requerir recalibración.
- Riesgo de alucinación no aplica en sentido estricto al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en mensajes ambiguos o en variantes de estafa no representadas en el entrenamiento.
- No se documentan sesgos conocidos ni la composición demográfica o geográfica del dataset de entrenamiento, lo que impide evaluar su equidad.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin evidencia de uso en producción ni validación independiente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías; conviene auditar el modelo antes de integrarlo en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CamargoJ21/smishing-distilbert-hardened
- Space de demostración: https://huggingface.co/spaces/CamargoJ21/smishing-detector
- Modelo base: https://huggingface.co/distilbert-base-uncased
