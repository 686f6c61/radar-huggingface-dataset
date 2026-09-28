# Mythologic/MIMIR-1

## Resumen

MIMIR-1 es un modelo de decisión no generativo desarrollado por Mythologic. A diferencia de un LLM convencional, no produce texto libre: recibe un contexto, una pregunta y un conjunto de opciones, y devuelve una respuesta tipada acompañada de probabilidades calibradas, las partes del contexto en las que se ha basado y una señal certificada que indica cuándo debe actuar y cuándo escalar. Al no generar lenguaje, elimina el paso de parseo de la salida y reduce la superficie de alucinación a la selección entre opciones predefinidas.

El modelo parte de un encoder ModernBERT-Large-Instruct y añade una cabeza de decisión con 419 millones de parámetros totales. La cabeza refina una lectura por iteración a lo largo de cuatro iteraciones, con una salida temprana certificada en la profundidad 2. Es un modelo exclusivamente en inglés, publicado bajo licencia comunitaria de Mythologic, y está pensado como capa de decisión por debajo de agentes: enrutado de peticiones, control de llamadas a herramientas y verificación de afirmaciones.

Su relevancia actual radica en el enfoque de tres resultados (DECIDED, ABSTAINED y DEFERRED) y en el uso de conjuntos de predicción conformes, que permiten integrar el modelo en pipelines de producción donde una decisión no respaldada por la evidencia debe rechazarse en lugar de adivinarse. El repositorio distribuye los pesos en tres rutas de carga: grafos ONNX con política certificada a través del paquete `mimirai`, los mismos pesos en `transformers` bajo el subdirectorio correspondiente, y servidores HTTP y MCP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-Large-Instruct) con cabeza de decisión y refinamiento iterativo (4 iteraciones, salida temprana certificada en profundidad 2) |
| Parametros totales | 419 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base ModernBERT-Large admite hasta 8.192 tokens según su propia ficha, pero la model card de MIMIR-1 no lo especifica) |
| Tipos de cuantizacion | No disponible. El repositorio incluye grafos ONNX y el tag `base_model:quantized:answerdotai/ModernBERT-Large-Instruct` apunta a variantes cuantizadas, pero la model card no detalla los formatos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `mythologic-community-license` (identificador `other`, fichero `LICENSE` en el repositorio) |
| Formato de pesos | ONNX (grafo principal + política certificada) y safetensors (subdirectorio `transformers`) |
| Tamano del repositorio | 4,2 GB |
| Pipeline declarado | `text-classification` |
| Libreria | `mimirai` (paquete Python; import `mimir`), compatible con `transformers` |
| Modelo base | `answerdotai/ModernBERT-Large-Instruct` |

## Arquitectura y entrenamiento

MIMIR-1 es un encoder transformer de tipo ModernBERT-Large-Instruct al que se le añade una cabeza de decisión específica. En lugar de generar una secuencia de tokens, la cabeza produce una lectura tipada sobre el contexto y las opciones disponibles, y repite ese proceso de refinamiento hasta cuatro iteraciones, con una salida temprana certificada a profundidad 2. Esa salida temprana es lo que permite emitir un certificado de decisión: un umbral certificado contra el que se comprueba cada llamada antes de devolver un resultado. El modelo incorpora además una puerta de distancia (`distance gate`) para detectar entradas fuera de distribución.

El modelo no genera texto, por lo que no hay nada que parsear ni margen para alucinar contenido libre. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO; esa información no está disponible. La calibración se apoya en conjuntos de predicción conformes, que acompañan a los resultados de elección, sí/no y verificación junto con una probabilidad de abstención. El modelo se distribuye con tres rutas de carga: el contrato `mimirai` en la raíz del repositorio (grafos ONNX más política certificada), los mismos pesos como `transformers` estándar en un subdirectorio, y la posibilidad de servirlos por HTTP (`mimir serve`) o por MCP (`mimir mcp`).

## Capacidades

- Decisión no generativa: devuelve una respuesta tipada (identificador de opción, booleano, número o nivel) en lugar de texto libre.
- Métodos de decisión `choose` (elegir una opción o ninguna), multi-choice (todas las que apliquen), `yes_no`, `verify` (supported / contradicted / not_enough_information), `rank`, `rate` y `estimate` (número con intervalo).
- Tres estados de salida: DECIDED, ABSTAINED (ninguna opción está respaldada) y DEFERRED (el certificado no cubre la llamada al nivel de riesgo configurado; motivos `below_threshold`, `out_of_distribution` o `no_certified_threshold`).
- Salida estructurada con `status`, `confidence`, `relevant_context` (fragmentos del contexto ordenados por relevancia), `certificate`, `deferral` y `latency_ms`.
- Probabilidad de abstención y conjunto de predicción conforme en los métodos de elección, sí/no y verificación.
- Contexto de entrada flexible: cadena, lista de pasajes, tablas con números y fechas tipados, o estado JSON.
- Procesamiento por lotes mediante `decide_many` y variantes asíncronas de todos los métodos.
- Capacidad de actuar como herramienta de agente (`agent-tool`), con despliegue como servidor HTTP o servidor MCP.
- No dispone de capacidades de generación de texto, código, matemáticas simbólicas, visión ni audio. Es monolingüe en inglés.

## Casos de uso

- Enrutado de peticiones en atención al cliente: el modelo clasifica la intención de un mensaje entrante en categorías como facturación o seguridad. Con un 88,3 % de exactitud en Banking77 y 86,6 % en MASSIVE English, es adecuado para derivar tickets al equipo correcto sin coste de generación.
- Guardarraíles frente a inyección de prompt: con un 95,7 % de exactitud en la tarea de prompt-injections, puede colocarse delante de un LLM o de un agente para clasificar la entrada como legítima o maliciosa antes de que se ejecute cualquier herramienta.
- Verificación de afirmaciones contra evidencia: el método `verify` devuelve supported, contradicted o not_enough_information, lo que permite auditar afirmaciones de un modelo generativo contra documentación recuperada y marcar como no verificables las que no estén respaldadas.
- Control de llamadas a herramientas en agentes: la capa de decisión puede decidir si una llamada concreta está justificada por el estado de la conversación antes de ejecutarla, usando el estado DECIDED, ABSTAINED o DEFERRED para bloquear o escalar.
- Verificación documental y KYC: el modelo acepta tablas con números y fechas tipados y estados JSON, por lo que puede cotejar los datos declarados por un usuario con los de un documento y devolver un resultado estructurado con las partes del contexto utilizadas.
- Triaje y clasificación de tickets a escala: AG News con 92,1 % y BoolQ con 84,0 % indican un rendimiento sólido en clasificación de texto corto y preguntas booleanas, útil para etiquetado automático en pipelines de soporte o moderación.
- Puntuación y priorización: los métodos `rank` y `rate` permiten ordenar candidatos o asignar niveles de una escala definida por el usuario, aprovechable en scoring de leads, priorización de incidencias o evaluación de riesgo.
- Estimación numérica con intervalo: el método `estimate` devuelve un número dentro de un rango, adecuado para extraer magnitudes de documentos cuando se requiere un intervalo de confianza en lugar de un valor puntual.
- Servicio de decisiones compartido: con `mimir serve` y `mimir mcp`, varias aplicaciones pueden consultar la misma capa de decisión por HTTP o MCP sin cargar los pesos en cada proceso.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la `model-index` de la model card. Todos los valores están marcados como no verificados (`verified: false`).

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Intención bancaria | Banking77 (test) | Exact-match accuracy | 0,883 |
| Intención MASSIVE inglés | MASSIVE English (test) | Exact-match accuracy | 0,866 |
| Decisiones tipadas | typed-decisions (test) | Exact-match accuracy | 0,725 |
| Inyecciones de prompt | prompt-injections (test) | Exact-match accuracy | 0,957 |
| Inferencia de lenguaje natural | XNLI English (test) | Exact-match accuracy | 0,828 |
| Preguntas booleanas | BoolQ (test) | Exact-match accuracy | 0,840 |
| Clasificación de noticias | AG News (test) | Exact-match accuracy | 0,921 |

La model card afirma además que, frente a Laya y GLiNER2.5-Decide ejecutados por el propio autor sobre registros idénticos, MIMIR-1 lidera en seis de diez tareas, con las siguientes ventajas: +54,7 puntos en Banking77, +42,3 en MASSIVE English, +36,3 en decisiones tipadas y +27,6 en inyecciones de prompt. No se proporcionan los valores absolutos de los modelos comparados, por lo que solo están disponibles las diferencias declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP32 y 0,84 GB en FP16/BF16 para los 419 millones de parámetros. La cuantización a INT8 reduciría el peso a unos 0,42 GB. Son estimaciones derivadas del recuento de parámetros; la model card no publica cifras oficiales.
- El repositorio completo ocupa 4,2 GB porque incluye las distintas rutas de carga (ONNX y safetensors), pero solo se descarga lo que se carga efectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. No se requieren aceleradores de centro de datos; una RTX 3060, RTX 4090 o similar es más que suficiente, y el modelo cabe holgadamente en GPU de consumo.
- Motor de CPU: el paquete `mimirai[local]` proporciona un motor de CPU, por lo que el modelo puede ejecutarse sin GPU. `mimirai[local-gpu]` habilita el motor CUDA.
- Opciones de despliegue: paquete `mimirai` (recomendado, gestiona chunking, lecturas tipadas, evidencia, puerta de distancia y certificado en una sola llamada), `transformers` estándar desde el subdirectorio correspondiente, servidor HTTP mediante `mimir serve` y servidor MCP mediante `mimir mcp`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python 3.11 o superior.
- Latencia y throughput: no disponibles. El resultado de cada llamada incluye un campo `latency_ms`, pero la model card no publica valores de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIMIR-1 (Mythologic) | 419 M | No disponible | Referencia: lidera en 6 de 10 tareas según el autor | mythologic-community-license | HuggingFace, paquete `mimirai`, ONNX, transformers |
| Laya | No disponible | No disponible | Por detrás de MIMIR-1 en las tareas con diferencia declarada | No disponible | No disponible |
| GLiNER2.5-Decide | No disponible | No disponible | Por detrás de MIMIR-1 en las tareas con diferencia declarada | No disponible | No disponible |

La model card solo menciona Laya y GLiNER2.5-Decide como comparadores y únicamente aporta las diferencias de puntos en cuatro tareas, sin valores absolutos ni detalles de arquitectura, tamaño, contexto o licencia de esos modelos. No se dispone de información suficiente para una comparativa más detallada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta castellano ni otros idiomas, por lo que no es adecuado para pipelines multilingües sin un paso de traducción previo.
- No genera texto: no puede redactar respuestas, resúmenes, código ni razonamiento en lenguaje natural. Solo decide entre opciones predefinidas o devuelve valores tipados.
- Sesgos: no se documentan análisis de sesgo en la información disponible. Al estar entrenado sobre datasets en inglés (Banking77, MASSIVE, XNLI, BoolQ, AG News, entre otros), es previsible que herede los sesgos de dominio y registro de esas fuentes.
- Riesgo de alucinación: el diseño no generativo elimina la alucinación de texto libre, pero no la decisión incorrecta. El modelo puede elegir una opción errónea con alta confianza; el mecanismo de abstención y los conjuntos de predicción conformes mitigan este riesgo, no lo anulan.
- Cobertura del certificado: las salidas DEFERRED con motivo `no_certified_threshold` indican que no existe un umbral certificado para esa entrada, lo que puede ocurrir con frecuencia en dominios alejados de los datos de calibración.
- Datos no verificados: los siete resultados de benchmark están marcados como `verified: false`, es decir, son declaraciones del autor y no han sido reproducidos de forma independiente.
- Restricciones de licencia: el modelo usa la `mythologic-community-license`, una licencia personalizada distinta de las licencias abiertas habituales. Es imprescindible revisar el fichero `LICENSE` del repositorio antes de un uso comercial; la información proporcionada no detalla los términos.
- Longitud de contexto no especificada: la model card no declara la ventana máxima soportada, lo que dificulta dimensionar despliegues con documentos largos.
- Madurez: el repositorio registra 0 descargas y 0 likes, y el paquete `mimirai` se presenta como recién lanzado. La adopción en producción es todavía incipiente.
- Dependencia de un runtime propio: el uso recomendado pasa por el paquete `mimirai`, lo que introduce una dependencia adicional frente a cargar el modelo con `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mythologic/MIMIR-1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-Large-Instruct
- Licencia: fichero `LICENSE` dentro del repositorio de HuggingFace (https://huggingface.co/Mythologic/MIMIR-1/blob/main/LICENSE)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
