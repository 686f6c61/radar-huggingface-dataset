# Aneurologic/aneuro-juri-1b-preview

## Resumen

Aneuro Juri 1B (preview) es un modelo de decisión desarrollado por Aneurologic. No es un modelo generativo: recibe un contexto y una o varias preguntas con formato de respuesta cerrada (sí/no o elección entre opciones) y devuelve probabilidades calibradas en un único forward pass. Está pensado para enrutar y clasificar decisiones dentro de pipelines de agentes, no para producir texto libre.

Técnicamente es un fine-tune del cross-encoder `cross-encoder/ettin-reranker-1b-v1`, de arquitectura ModernBERT y 1.031.274.497 parámetros, entrenado durante dos épocas sobre unas 429.000 muestras de decisión con secuencias de hasta 2.048 tokens. El autor lo publica como preview y reconoce explícitamente que no lidera ningún ranking: su Decision Index público es 31,89, por debajo de los comparadores que él mismo reevaluó.

Su relevancia actual es la combinación de licencia Apache-2.0 (los comparadores cercanos usan licencias no comerciales) con una API de preguntas tipadas y salida probabilística calibrada, lo que permite integrarlo como componente de decisión en sistemas de tool calling y agentes sin depender de un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune de `cross-encoder/ettin-reranker-1b-v1` |
| Parámetros totales | 1.031.274.497 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado con secuencias de hasta 2.048 tokens; entradas más largas no probadas |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 4,1 GB |

## Arquitectura y entrenamiento

El modelo parte de un encoder ModernBERT de 1,03B parámetros (`jhu-clsp/ettin-encoder-1b`, MIT, redistribuido como reranker Apache-2.0 por `cross-encoder`). Sobre esa base se aplica un fine-tune de dos épocas (23.556 pasos) con un objetivo combinado de entropía cruzada y Brier, lo que explica que la salida sea una probabilidad calibrada y no un logit sin tratar. Cada pregunta se puntúa como su propia secuencia (contexto más pregunta), y todas las preguntas de una llamada se ejecutan en un único forward pass por lotes, de modo que el coste crece con el número de preguntas.

Los datos de entrenamiento suman aproximadamente 429.000 registros de decisión de tres familias: tareas de decisión tipadas procedentes de datasets públicos recopilados por tasksource, filtrados por licencia permisiva en la dataset card; datos de decisión generados por el propio autor; y datasets de tool use convertidos a decisiones (ToolACE, Hermes function calling, glaive-function-calling-v2 y el conjunto de entrenamiento When2Call, CC BY 4.0). Cada registro se cribó contra la suite de evaluación con un filtro de solapamiento de contenido y los registros marcados se eliminaron. El autor advierte que parte de esos datasets se generaron con modelos de terceros cuyos términos pueden aplicar al uso.

## Capacidades

- Clasificación de decisión binaria (`yes_no`) con probabilidad calibrada, con descripciones opcionales de qué significa «sí» y «no».
- Elección entre múltiples opciones (`choice`), con independencia del orden de las opciones y probabilidades por cada clave.
- Procesamiento de contexto como cadena o como diccionario plano renderizado como líneas `clave: valor`.
- Evaluación por lotes de varias preguntas en un solo forward pass.
- Soporte de tool calling como tarea de decisión: determinar si hace falta una herramienta y cuál debe llamarse primero.
- No genera texto, no razona en varios pasos de forma autónoma y no tiene modo thinking, visión ni audio.
- Solo inglés.

## Casos de uso

- Enrutamiento de peticiones en agentes: dado el mensaje del usuario y el catálogo de herramientas disponibles, decidir con `yes_no` si la petición requiere una llamada a herramienta y con `choice` cuál es la primera a invocar. El ejemplo de la model card (reprogramar una reunión y enviar un correo) muestra exactamente este flujo.
- Puerta de pre-filtrado antes de un LLM generativo: usar la probabilidad de `needs_tool` como umbral para decidir si se invoca un modelo grande con tool calling o se responde con una ruta barata, reduciendo coste por petición.
- Clasificación de tickets y correos en inglés: convertir categorías en opciones de una pregunta `choice` y usar las probabilidades para asignar cola, prioridad o equipo, con umbrales ajustables por la calibración.
- Moderación y validación de decisiones en pipelines: comprobar condiciones binarias (por ejemplo, si un texto cumple una política concreta) y usar la probabilidad como señal de confianza antes de escalar a revisión humana.
- Evaluación automática de respuestas: formular preguntas sí/no sobre si una respuesta satisface un criterio y agregar probabilidades como métrica, aprovechando el bajo coste por pregunta (unos 22 ms en GH200).
- Selección entre fuentes o rutas de recuperación: dado un contexto y varias alternativas, elegir la opción más probable como paso de decisión dentro de un pipeline RAG.
- Despliegue en servidores con GPU: el modelo está pensado para servidores; en un M1 de 2020 tarda unos 440 ms por pregunta en GPU Apple y unos 800 ms en CPU, lo que lo hace poco adecuado para portátiles pero viable en infraestructura dedicada.

## Benchmarks y rendimiento

Decision Index 0.3, suite pública de 37 benchmarks en cinco áreas, corregida por azar (0 = aleatorio). Los comparadores son reejecuciones del propio autor en el mismo pipeline y hardware.

| Modelo | Índice público | Licencia |
|---|---:|---|
| d1-2B | 51,22 | LFM Open License |
| Crivo-1B | 47,77 | CC BY-NC 4.0 |
| Amber-68M | 37,87 | CC BY-NC 4.0 |
| Crivo-150M | 34,39 | CC BY-NC 4.0 |
| Aneuro Juri 1B (preview) | 31,89 | Apache-2.0 |

Desglose por área (skill): conocimiento 0,14; lenguaje 0,34; recuperación 0,51; herramientas 0,41; artes 0,17. La dispersión entre semillas de entrenamiento es de aproximadamente 1 a 1,4 puntos de índice.

Familias de tareas no vistas (36 fuentes nunca usadas en entrenamiento, 6.176 preguntas): accuracy 0,67, Brier 0,48, error de calibración esperado 0,15.

Velocidad:

| Hardware | Configuración | Tiempo por pregunta |
|---|---|---|
| NVIDIA GH200 | harness de evaluación, mediana | unos 22 ms |
| Apple M1 (2020), GPU Apple | PyTorch fp32, 256 tokens | unos 440 ms |
| Apple M1 (2020), CPU | PyTorch fp32, 256 tokens | unos 800 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 1,03B parámetros, en fp32 los pesos ocupan aproximadamente 4,1 GB (tamaño del repo), y en fp16 unos 2 GB; estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: el autor cita NVIDIA GH200 para el harness de evaluación. No se especifican otras GPU.
- Cabe en GPU de consumo: no confirmado por el autor; por tamaño de pesos sería viable en tarjetas con 8 GB o más en fp16, pero no hay validación publicada.
- Opciones de despliegue: la model card documenta únicamente PyTorch con transformers y safetensors, mediante `snapshot_download` y la clase `Juri` del propio repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: unos 22 ms por pregunta en GH200; 440 ms en GPU Apple M1 y 800 ms en CPU M1 con 256 tokens en fp32. El autor indica que el modelo está pensado para servidores y GPU, y remite a la variante de 150M para portátiles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aneuro Juri 1B (preview) | 1,03B | 2.048 tokens (entrenamiento) | 31,89 | Apache-2.0 | Hugging Face, preview |
| d1-2B | no disponible | no disponible | 51,22 | LFM Open License | no disponible |
| Crivo-1B | no disponible | no disponible | 47,77 | CC BY-NC 4.0 | no disponible |
| Amber-68M | 68M (por el nombre) | no disponible | 37,87 | CC BY-NC 4.0 | no disponible |
| Crivo-150M | 150M (por el nombre) | no disponible | 34,39 | CC BY-NC 4.0 | no disponible |

La comparación se limita a los datos de la model card: los comparadores son reevaluaciones del propio autor y no se detallan sus parámetros ni contextos. La ventaja diferencial de Juri 1B es la licencia Apache-2.0 frente a las licencias no comerciales de Crivo y Amber; su desventaja es el índice público, el más bajo de la tabla.

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe.
- Entrenado con entradas de hasta 2.048 tokens; entradas más largas no están probadas.
- Débil en algunos benchmarks de tool use: simulador de electrodomésticos (skill 0,01; solo cuenta si todos los ajustes de dispositivo son correctos) y API-Bank (skill 0,36).
- Las probabilidades están calibradas en tipos de tarea familiares y menos en los no familiares (error de calibración 0,15 en familias no vistas); puede equivocarse con alta confianza.
- No es un guardarraíl de seguridad ni se ha probado en decisiones de alto riesgo; el autor recomienda validarlo con datos propios antes de confiar en él.
- Es un preview y el propio autor lo describe como no líder en ningún ranking.
- Licencia Apache-2.0 permite uso comercial, pero parte de los datos de entrenamiento proceden de datasets generados con modelos de terceros cuyos términos pueden aplicar al uso.
- No genera texto: cualquier caso de uso que requiera explicaciones o razonamiento en lenguaje natural necesita un modelo generativo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aneurologic/aneuro-juri-1b-preview
- Variante de 150M para portátiles: https://huggingface.co/Aneurologic/aneuro-juri-150m-preview
- Sitio del autor: https://aneurologics.com
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-1b-v1
- Encoder original: https://huggingface.co/jhu-clsp/ettin-encoder-1b
