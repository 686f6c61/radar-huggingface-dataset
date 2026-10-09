# olaverse/PurpleMIST-Mini-1.0

## Resumen

PurpleMIST-Mini-1.0 es un modelo de decisión (etiquetado por el autor como "System One") desarrollado por olaverse. No es un modelo generativo: recibe un estado no estructurado (un mensaje, ticket, registro o transcripción) junto con una o varias preguntas tipadas y devuelve, en una única pasada hacia delante, una distribución de probabilidad calibrada sobre cada respuesta. Su columna vertebral es el modelo de texto de Qwen/Qwen3.5-2B-Base, al que se le han eliminado la torre de visión y la cabeza de language modeling.

Se trata del miembro más pequeño de la familia PurpleMIST, con 1.881.825.088 parámetros reales según los pesos en safetensors (unos 1,9B), 24 capas, tamaño oculto de 2048 y una ventana de 2.048 tokens por pasada. Comparte interfaz con PurpleMIST-Flash-1.0, lo que permite intercambiar modelos sin reescribir los clientes, pero ocupa menos de una cuarta parte del tamaño de este último.

Su relevancia actual está en el nicho de la clasificación probabilística calibrada: obtiene 0,601 de precisión zero-shot en inglés sobre LocalLLaMA/typed-decisions, por encima de modelos hasta cuatro veces mayores como Bongard-mini (7,5B, 0,594) o Jeff-Gemma4-E2B (4,6B, 0,561). El precio de su tamaño reducido se paga en los ocho idiomas africanos soportados, donde cae a 0,416 frente a los 0,668 de Flash. Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5: 24 capas (18 de atencion lineal Gated DeltaNet y 6 de atencion completa), mas cabeza pointer |
| Parametros totales | 1.881.825.088 (1,88B) |
| Longitud de contexto | 2.048 tokens por pasada (las preguntas se reparten automaticamente en varias pasadas si no caben) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16; la inferencia recomendada por el autor es fp32) |
| Idiomas soportados | en, yo, ha, ig, pcm, sw, am, so, zu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); tamano del repositorio 3,8 GB |
| Tamano oculto | 2.048 |
| Cabeza de decision | pointer head de 4,2M de parametros; proyeccion 2048 → 1024 sobre la posicion de respuesta y la linea de cada opcion |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-2B-Base |

## Arquitectura y entrenamiento

El backbone es el modelo de texto de Qwen/Qwen3.5-2B-Base al que se le han retirado la torre de vision y la cabeza de generacion. Conserva 24 capas, de las cuales 18 emplean atencion lineal Gated DeltaNet y 6 usan atencion completa, con un tamano oculto de 2048. Sobre esa base se anade una cabeza pointer de 4,2M de parametros: el logit de cada opcion se calcula como un producto escalar escalado entre proyecciones (2048 → 1024) de la posicion de respuesta y de la propia linea de la opcion. Esto permite evaluar cualquier numero de opciones en una sola secuencia, compartiendo el estado entre todas las preguntas de una misma pasada.

El ajuste fue un fine-tune completo de todos los pesos (a diferencia de PurpleMIST-Flash-1.0, que usa LoRA). Los pesos entrenaron en fp32 con multiplicaciones de matrices en bf16; el autor advierte que ejecutar el modelo enteramente en bf16 cuesta unos tres puntos de precision (0,568 en inglés frente a 0,601). La clase `Decider` lee `inference_dtype: float32` desde `purplemist_config.json` y carga fp32 automaticamente. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; los datasets asociados son olaverse/african-typed-decisions y LocalLLaMA/typed-decisions. Tampoco se documentan innovaciones como decodificacion especulativa, ya que el modelo no genera texto.

## Capacidades

- Puntuacion de opciones tipadas, no generacion de texto: no produce respuestas libres en lenguaje natural.
- Tres tipos de pregunta:
  - `choice`: se entregan instrucciones y opciones con nombre (`criteria`: clave → descripcion); devuelve `{"choice": key, "probabilities": {key: p}}`.
  - `noul` (yes/no): se entrega una afirmacion; devuelve `{"noul": p_yes}`.
  - `score`: se entregan instrucciones y descripciones de niveles ordenados de menor a mayor; devuelve `{"score": nivel esperado, "probabilities": {"0": p, ...}}`.
- Salida calibrada: ECE de 0,058 en ingles y 0,050 en los ocho idiomas africanos agregados.
- Multiples preguntas por estado en una sola pasada, compartiendo secuencia; cualquier numero de opciones.
- Entrada flexible: `state` puede ser una cadena o cualquier objeto serializable en JSON.
- Cobertura multilingue en nueve idiomas, con rendimiento notablemente inferior en los ocho idiomas africanos.
- Servicio HTTP local con la forma de peticion System One (`POST /v1/systemone`), ademas de `GET /health` y `GET /v1/models`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y varias preguntas tipadas (equipo responsable, si pide reembolso, urgencia en escala) y devuelve probabilidades calibradas para cada una, lo que permite enrutar y priorizar en un solo paso.
- Enrutado de correo entrante a equipos: con una pregunta `choice` cuyas opciones sean billing, delivery o technical, se obtiene directamente la clave del equipo y el reparto de probabilidad, util para umbralizar casos ambiguos.
- Priorizacion de colas: una pregunta `score` con niveles como "puede esperar", "cola normal", "hoy", "inmediatamente" entrega el nivel esperado y su distribucion, apto para ordenar una bandeja de entrada.
- Pre-etiquetado para anotacion humana: al ser un clasificador probabilistico, las muestras con alta entropia pueden dirigirse a revisores manuales y las de baja entropia incorporarse automaticamente al conjunto de entrenamiento.
- Analisis de encuestas y feedback: una pregunta `score` sobre satisfaccion convierte texto libre en una escala ordinal con incertidumbre asociada, agregable a nivel de producto o campana.
- Deteccion de intenciones concretas en conversaciones: preguntas `noul` del tipo "el cliente pide dinero de vuelta" o "el cliente amenaza con cancelar" permiten construir senales binarias calibradas sobre transcripciones.
- Control de calidad de transcripciones o registros: multiples preguntas tipadas en una sola pasada sobre cada documento reducen el coste de procesar lotes grandes frente a clasificadores que requieren una inferencia por etiqueta.
- Mercados africanos de habla yoruba, hausa, igbo, pidgin nigeriano, suajili, amharico, somali o zulu: aplicable, aunque el propio autor recomienda usar PurpleMIST-Flash-1.0 cuando la precision en estos idiomas es critica.

## Benchmarks y rendimiento

Precision zero-shot en ingles sobre LocalLLaMA/typed-decisions (datos de la model card):

| Modelo | Parametros | Precision zero-shot (EN) |
|---|---|---|
| OpenDecider-small | 4B | 0,648 |
| PurpleMIST-Mini-1.0 | 1,88B | 0,601 |
| Bongard-mini | 7,5B | 0,594 |
| Jeff-Gemma4-E2B | 4,6B | 0,561 |
| Jeff-Qwen3.5-2B | 2,2B | 0,511 |
| Prior (input-blind, sin ver la entrada) | no disponible | 0,470 |

Metricas de calibracion y error del modelo:

| Metrica | Valor |
|---|---|
| Precision zero-shot (EN) | 0,601 |
| KL (EN) | 0,280 |
| Brier (EN) | 0,156 |
| ECE (EN) | 0,058 |
| ECE (ocho idiomas africanos) | 0,050 |
| Precision en casos traducidos de African Typed Decisions | 0,416 |
| Precision de PurpleMIST-Flash-1.0 en African Typed Decisions | 0,668 |
| Precision en bf16 (EN) | 0,568 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia recomendada en fp32: los 1.881.825.088 parametros ocupan aproximadamente 7,5 GB solo en pesos, mas activaciones y sobrecarga, por lo que conviene disponer de 10-12 GB de VRAM.
- Inferencia en bf16: los pesos bajan a unos 3,8 GB (el repositorio completo pesa 3,8 GB), pero el autor advierte de una perdida de unos tres puntos de precision en ingles.
- GPU de consumo: cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti Super 16 GB o RTX 4090 24 GB. En bf16 podria encajar en GPUs de 8 GB, con la penalizacion de precision ya mencionada.
- GPU de datacenter: A100, H100 o L40S son suficientes y dejan margen para lotes mayores, aunque el modelo no necesita ese nivel de hardware.
- Kernels opcionales: `flash-linear-attention` y `causal-conv1d` aceleran las capas de atencion lineal (paquetes opcionales segun el quickstart).
- Despliegue: la clase `Decider` de `purplemist.py` para uso en Python y `serve.py`, un servidor HTTP local que expone `POST /v1/systemone`, `GET /health` y `GET /v1/models`. El servidor atiende una peticion a la vez y admite `--max-len` para elevar el limite de 2.048 tokens por pasada.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; tampoco cifras de latencia o throughput mas alla del campo `latency_ms` que devuelve el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision EN | Precision africano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PurpleMIST-Mini-1.0 | 1,88B | 2.048 tokens/pasada | 0,601 | 0,416 | apache-2.0 | HuggingFace (olaverse) |
| PurpleMIST-Flash-1.0 | no disponible (mas de 4x Mini) | no disponible | no disponible | 0,668 | no disponible | HuggingFace (olaverse) |
| OpenDecider-small | 4B | no disponible | 0,648 | no disponible | no disponible | no disponible |
| Bongard-mini | 7,5B | no disponible | 0,594 | no disponible | no disponible | no disponible |
| Jeff-Gemma4-E2B | 4,6B | no disponible | 0,561 | no disponible | no disponible | no disponible |
| Jeff-Qwen3.5-2B | 2,2B | no disponible | 0,511 | no disponible | no disponible | no disponible |

El modelo se situa en el rango de eficiencia: supera en precision en ingles a alternativas de 4,6B, 7,5B y 2,2B, y solo queda por debajo de OpenDecider-small, que lo dobla en parametros. Frente a PurpleMIST-Flash-1.0, la diferencia clave no es el ingles sino la cobertura de idiomas africanos, donde Flash casi multiplica por 1,6 su precision.

## Limitaciones y advertencias

- No es un modelo generativo: solo puntua opciones y no puede producir texto libre, resumenes ni respuestas abiertas.
- Brecha multilingue marcada: 0,416 en los casos traducidos de African Typed Decisions frente a 0,668 de PurpleMIST-Flash-1.0. El propio autor recomienda usar Flash para esos idiomas.
- Sensibilidad a la precision: ejecutar el modelo enteramente en bf16 reduce la precision en ingles de 0,601 a 0,568, unos tres puntos.
- Ventana limitada a 2.048 tokens por pasada; el modelo se entreno con esa longitud y la model card advierte de posibles efectos en entradas muy superiores (el aviso original aparece truncado en la informacion disponible). `--max-len` permite ampliarla, pero sin garantia de calidad.
- Calibracion agregada: las cifras de ECE (0,058 en ingles, 0,050 en africano) son medias; no hay desglose por idioma, dominio o tipo de pregunta.
- Rendimiento no verificado en produccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia publica de despliegues reales.
- Riesgo de alucinacion acotado por diseno: al no generar texto, el fallo tipico no es inventar contenido, sino asignar probabilidad alta a la opcion equivocada; conviene validar los umbrales de decision con datos propios.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico, dialectal o de dominio en la informacion disponible. La diferencia de rendimiento entre ingles y los ocho idiomas africanos es el sesgo mas evidente y medido.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se detallan los terminos de los datasets de entrenamiento ni posibles restricciones heredadas de Qwen/Qwen3.5-2B-Base.
- El servidor incluido atiende una unica peticion a la vez, por lo que no es adecuado como backend concurrente sin capa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olaverse/PurpleMIST-Mini-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo hermano: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Dataset de evaluacion en ingles: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de evaluacion en idiomas africanos: https://huggingface.co/datasets/olaverse/african-typed-decisions
- Documentacion del modulo olaverse.llm: https://olaverse-labs.github.io/olaverse/llm/
- Documentacion de la familia MIST: https://olaverse-labs.github.io/olaverse/models/mist/
- Pagina de modelos MIST de olaverse: https://www.olaverse.co.uk/models/mist-llm
- MIST-Mini-8B en HuggingFace: https://huggingface.co/olaverse/MIST-Mini-8B
- Coleccion de modelos MIST: https://huggingface.co/collections/olaverse/mist-models
