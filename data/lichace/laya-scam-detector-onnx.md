# LiChace/laya-scam-detector-onnx

## Resumen

Laya scam detector (fp16 ONNX) es un detector de fraude y phishing textual publicado por el usuario LiChace, consistente en un ajuste fino mediante LoRA sobre el modelo base `convaiinnovations/laya-multilingual` (una variante de mmBERT-base con 322 millones de parametros y vocabulario de 256 000 tokens que cubre mas de 100 idiomas). El resultado se ha exportado a formato ONNX Runtime, de modo que la inferencia no requiere PyTorch ni ninguna dependencia del ecosistema de transformers.

La particularidad del modelo es que no es generativo: responde a preguntas tipadas (`noul`, `score`, `choice`) y devuelve decisiones con probabilidades calibradas en una sola pasada hacia delante, en torno a 125 ms de mediana en CPU para las tres preguntas. Cubre una taxonomia cerrada de 13 categorias (phishing, crypto_scam, investment_scam, lottery_scam, job_scam, loan_scam, impersonation, romance_scam, delivery_fraud, marketing, adult_content, spam_general y benign).

Es relevante porque combina tres cosas poco habituales en deteccion de scam: un tokenizador multilingue que trocea chino a ~1,5 caracteres por token (frente al destrozo que hace un vocabulario solo ingles), una salida estructurada y calibrada que se puede consumir sin parseo, y un coste de despliegue muy bajo (un unico fichero ONNX de 643 MB en fp16, con un pico de 1,3 GB de RAM durante el entrenamiento en un Apple M4 Pro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (mmBERT-base) con cabeza de decision tipada y marcadores de posicion |
| Parametros totales | 322 millones (modelo base mmBERT-base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Parametros entrenables (LoRA) | 1 148 928 (0,36 % del total) |
| Longitud de contexto | 512 tokens por pasada (contrato de entrada del grafo ONNX); cabecera de pregunta por defecto de 192 tokens |
| Tipos de cuantizacion | fp16 en los pesos ONNX (diferencia maxima de probabilidad frente a fp32 medida en 0,00001); no se documentan variantes int8 ni GGUF |
| Idiomas soportados | chino (zh), ingles (en) y multilingue (mas de 100 idiomas heredados del base mmBERT) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` de 2,8 MB + `model.onnx.data` de 643 MB en fp16) + tokenizer de 33 MB y `categories.json` |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual`, un encoder mmBERT-base de 322 millones de parametros y vocabulario de 256 000 entradas. Sobre ese tronco se aplica un LoRA con rango 8, alpha 16 y dropout 0,05 unicamente en las proyecciones `Wqkv` y `Wo` de la atencion, lo que deja 1 148 928 parametros entrenables (0,36 % del total). La cabeza no es un clasificador convencional de una sola etiqueta: el contrato de entrada construye una secuencia con un token `[CLS]`, la pregunta tipada, una serie de posiciones marcadas con el token de mascara (`<mask>`) seguidas de cada opcion, y despues el texto a evaluar. La salida se normaliza con softmax (en el cliente de referencia, con escalado de temperatura opcional) para producir distribuciones sobre las opciones.

El entrenamiento se hizo integramente en local sobre un Apple M4 Pro con backend MPS, con un pico de 1,3 GB de RAM, durante 73 minutos y 3 epocas. El objetivo es entropia cruzada (log score estrictamente propio) sobre las senales `is_scam` y `category`. El conjunto de datos son 15 000 muestras balanceadas extraidas de cinco fuentes publicas (FGRC-SCD de fraude telecom chino, ealvaradob de phishing en ingles, FBS_SMS de estaciones base falsas chinas, ScamShield y UCI SMS Spam), con una composicion del 84,5 % en chino y 15,5 % en ingles, mas una semilla sintetica menor para las dos clases mas raras.

La innovacion tecnica destacable es doble. Por un lado, la ventaja de latencia es estructural y viene del tokenizador: mmBERT tokeniza chino a aproximadamente 1,5 caracteres por token, mientras que un vocabulario ModernBERT solo ingles fragmentaba el texto y disparaba la latencia (652 ms frente a 131 ms en el conjunto manuscrito mixto). Por otro, el diseno de "decision model" evita por completo la generacion de texto, de modo que no hay nada que parsear ni margen para alucinacion en la salida.

## Capacidades

- Clasificacion binaria de scam: la primitiva `noul` devuelve P(true) en el intervalo [0,1] a la pregunta "is this a scam?".
- Puntuacion de riesgo ordinal: la primitiva `score` devuelve un nivel esperado de 0 a 4 junto con la distribucion completa.
- Categorizacion fina: la primitiva `choice` devuelve una de las 13 etiquetas de la taxonomia con su distribucion completa.
- Decision calibrada en una sola pasada: las tres preguntas se resuelven en una unica forward pass (unos 125 ms de mediana en CPU para las tres).
- Multilingue con foco chino e ingles: maneja zh y en de forma nativa, y hereda cobertura de mas de 100 idiomas del modelo base.
- Salida estructurada sin generacion: al no producir texto libre, no requiere parseo y no puede alucinar contenido en la respuesta.
- Inferencia sin PyTorch: el grafo ONNX se ejecuta con ONNX Runtime, lo que simplifica el empaquetado y el despliegue.
- Modo por lotes y servidor HTTP: el cliente de referencia del repositorio de GitHub incluye enrutado por tipo de pregunta, escalado de temperatura, procesamiento por lotes y un servidor HTTP con playground FastAPI.
- Sin soporte documentado de tool calling, function calling, agentes, vision ni audio: no es un modelo conversacional ni multimodal.

## Casos de uso

- Moderacion de mensajes entrantes en plataformas de mensajeria: el modelo clasifica cada mensaje con la primitiva `noul` y deriva a revision humana los que superan un umbral calibrado, con un coste de CPU de decenas o cientos de milisegundos por mensaje.
- Filtrado de phishing en correo corporativo: la primitiva `choice` distingue `phishing` de `impersonation` o `delivery_fraud`, lo que permite enrutar cada caso al equipo adecuado en lugar de a una cola generica.
- Deteccion de fraude telefonico y SMS en chino: entrenado con FGRC-SCD y FBS_SMS, es adecuado para operadores de telefonia o pasarelas de SMS que necesiten senalar campanas de fraude telecom sin desplegar un LLM generativo.
- Triaje de riesgo en un centro de operaciones de seguridad: la primitiva `score` ofrece un nivel ordinal 0-4 util para priorizar alertas antes de que un analista humano revise cada caso.
- Prefiltrado previo a un LLM grande: al ser un modelo de decision barato y rapido, se puede colocar delante de un modelo generativo para descartar el trafico benigno y reservar el coste alto del LLM para los casos ambiguos.
- Clasificacion dentro de pipelines de cumplimiento y antirriesgo: la salida estructurada y calibrada se puede registrar como evidencia auditable (categoria, probabilidad y nivel de riesgo) sin necesidad de postprocesar texto libre.
- Despliegue en el borde o en entornos sin GPU: al ejecutarse en ONNX Runtime sobre CPU y ocupar unos 643 MB en fp16, cabe en dispositivos con recursos limitados o en contenedores sin acelerador.
- Servicio HTTP interno de scikit para equipos de confianza y seguridad: el playground FastAPI del repositorio permite exponer el modelo como endpoint interno con modo por lotes.

## Benchmarks y rendimiento

Conjunto de retencion en chino de 600 muestras (nunca visto durante el entrenamiento):

| Metrica | Valor |
|---|---|
| Exactitud is_scam | 0,967 |
| Precision is_scam | 0,989 |
| Recall is_scam | 0,957 |
| F1 is_scam | 0,972 |
| Exactitud 13 clases | 0,810 |
| MAE de nivel de riesgo | 1,52 |
| Latencia p50 (CPU) | 125 ms |
| Latencia p95 (CPU) | 228 ms |

Conjunto manuscrito mixto (38 muestras), comparacion antes y despues del ajuste fino:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Exactitud is_scam | 0,868 | 0,921 |
| F1 is_scam | 0,909 | 0,943 |
| Exactitud en chino | 0,840 | 0,920 |
| Exactitud 13 clases | 0,500 | 0,632 |
| Falsos positivos | 5 | 3 |
| Latencia p50 | 652 ms | 131 ms |

Adicionalmente, la diferencia maxima de probabilidad entre fp32 y fp16 se midio en 0,00001. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,65 GB solo para los pesos fp16 (`model.onnx.data` de 643 MB) mas el tokenizer (33 MB); en la practica conviene reservar 1-2 GB entre pesos, activaciones y runtime.
- CPU: es viable y es el escenario medido (p50 de 125 ms y p95 de 228 ms para las tres preguntas); un Apple M4 Pro con MPS sirvio tambien para entrenar con un pico de 1,3 GB de RAM.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para este modelo; se pueden usar con `CUDAExecutionProvider`, pero el cuello de botella dejaria de ser el calculo y pasaria a ser la latencia de red.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) con 2 GB o mas de VRAM; tambien en iGPU y en NPU si el runtime del proveedor soporta el grafo.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA y demas execution providers), servidor HTTP de referencia con FastAPI incluido en el repositorio de GitHub, y libreria `laya` de PyPI con extra `laya[onnx]`. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, porque no se distribuyen pesos GGUF ni es un modelo generativo.
- Latencia y throughput: latencia documentada de 125 ms (p50) y 228 ms (p95) en CPU para las tres preguntas; el throughput por lotes no se especifica, aunque el cliente de referencia incluye modo batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 is_scam (conjunto manuscrito) | Licencia | Formato |
|---|---|---|---|---|---|---|
| LiChace/laya-scam-detector-onnx | 322 M (1,15 M entrenables por LoRA) | 512 tokens | Clasificacion de scam en 13 clases | 0,943 | Apache-2.0 | ONNX fp16 |
| convaiinnovations/laya-multilingual (base sin ajuste) | 322 M | no disponible | Encoder multilingue de proposito general | 0,909 | Apache-2.0 (segun repositorio base) | safetensors / PyTorch |
| Otros detectores de scam comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto alternativas directas de deteccion de scam con taxonomia cerrada y exportacion ONNX, por lo que la comparativa se limita al modelo base y a la mejora medida tras el ajuste fino.

## Limitaciones y advertencias

- No es un chatbot. Solo responde a las preguntas tipadas que se le suministran (`noul`, `score`, `choice`) y no mantiene conversacion ni genera texto.
- La confianza no es verdad absoluta. Una probabilidad de 0,95 no implica un 95 % de acierto sobre el trafico propio; es necesario calibrar los umbrales con datos reales de cada despliegue.
- Desequilibrio por categoria: las clases `crypto_scam` y `marketing` contaron con muy pocos ejemplos de entrenamiento, por lo que cabe esperar un recall bajo en ambas.
- El ingles no fue el objetivo del ajuste fino. Funciona razonablemente bien en ingles, pero el modelo esta optimizado para chino; los datos de entrenamiento son 84,5 % zh y 15,5 % en.
- Cobertura taxonomica cerrada: solo existen 13 categorias; cualquier modalidad de fraude fuera de esa lista se forzara a la clase mas cercana o a `spam_general`.
- Longitud de contexto limitada: el contrato ONNX trabaja con 512 tokens por pasada, con una cabecera de pregunta de 192 tokens por defecto, por lo que el texto util se recorta para conversaciones largas.
- Evaluacion limitada en tamano: el conjunto manuscrito mixto tiene solo 38 muestras y el de retencion en chino, 600, por lo que las metricas tienen intervalos de confianza amplios.
- Riesgo de falsos positivos: incluso tras el ajuste fino se registraron 3 falsos positivos en 38 muestras del conjunto manuscrito, algo a tener en cuenta si el modelo se usa para bloquear contenido automaticamente.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base (`convaiinnovations/laya`) antes de un despliegue en produccion.
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta: no cuenta con validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiChace/laya-scam-detector-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio GitHub (despliegue local y ajuste fino): https://github.com/chaceli/laya-scam-detector
- Releases del repositorio: https://github.com/chaceli/laya-scam-detector/releases
- Sitio de la familia Laya (System 1 Decision Engine): https://laya.convaiinnovations.com/
- Paquete PyPI: https://pypi.org/project/laya/
