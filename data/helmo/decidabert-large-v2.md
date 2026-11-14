# helmo/DecidaBERT-large-v2

## Resumen

DecidaBERT-large-v2 es un modelo encoder de decisión desarrollado por el usuario helmo, un fine-tuning de ModernBERT-large orientado a resolver consultas tipadas en una sola pasada forward. En lugar de generar texto, el modelo recibe un estado (por ejemplo, una alerta de seguridad o un fragmento de log) junto con un conjunto de preguntas tipadas —sí/no (`noul`), elección entre N etiquetas (`choice`) y puntuación sobre una rúbrica ordenada (`score`)— y devuelve una distribución de probabilidad para cada pregunta simultáneamente. Es el sucesor de DecidaBERT-large y amplía el contexto de entrenamiento de 512 tokens (hasta 2.048 en inferencia) a 8.192 tokens.

El modelo está pensado como un "system one" de decisión rápida: no razona paso a paso ni emite tokens, sino que clasifica y calibra. Su relevancia práctica está en pipelines de agentes y operaciones donde se necesita evaluar muchas preguntas sobre un mismo estado con bajo coste computacional: al leer el estado una sola vez y procesar todas las preguntas en la misma secuencia, una petición con N preguntas cuesta un único forward pass en lugar de N.

Con 397,9 millones de parámetros, licencia Apache 2.0 y soporte exclusivo de inglés, se posiciona como un componente especializado para gating, enrutado, verificación y control de flujo de agentes, no como un modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large, 28 capas) con tres cabezas de decisión |
| Parámetros totales | 397.939.715 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, FP32) + `config.json`, `decision_config.json` |

## Arquitectura y entrenamiento

El backbone es ModernBERT-large: un encoder bidireccional de 395 millones de parámetros y 28 capas, con contexto de 8.192 tokens. Sobre él se añaden tres cabezas pequeñas (sí/no, elección y puntuación) que leen el estado de tokens marcadores: un token por opción y uno por pregunta sí/no. La secuencia se construye colocando el estado una sola vez y, a continuación, cada pregunta con sus opciones; las cabezas mapean los estados de los marcadores a puntuaciones y un softmax (o sigmoide para sí/no) produce la distribución. Esto permite resolver todas las preguntas de una petición en un único forward pass.

El entrenamiento combina 41.000 registros de decisión de dominios de IT y software —balanceados por diseño en seis grupos: gating y clasificación (6.834 registros, 11 tareas), enrutado y selección (6.834, 9 tareas), control de flujo de agentes go/no-go (6.833, 9 tareas), ranking y puntuación (6.833, 8 tareas), verificación (6.833, 9 tareas) y ingeniería operativa (6.833, 14 tareas)—, más 1.000 registros del split `train` de LocalLLaMA/typed-decisions (4 flujos de trabajo). La cobertura incluye 38 roles (desarrolladores, SRE, analistas SOC, técnicos de IT, arquitectos), 48 entornos y 24 formatos (logs, diffs, alertas, tickets, trazas de agentes, configuraciones, tablas de métricas). En total, 165.952 preguntas: 44% sí/no, 30% elección y 26% puntuación. Antes de la última etapa se aplicó una edición dirigida de pesos. Según el autor, no se usó el split de test de ningún benchmark para entrenamiento, calibración ni selección de checkpoint.

## Capacidades

- Clasificación probabilística tipada en una sola pasada: responde preguntas sí/no, de elección entre N etiquetas y de puntuación sobre rúbricas ordenadas.
- Procesamiento conjunto de múltiples preguntas sobre un mismo estado, con coste de un solo forward pass por petición.
- Calibración de confianza: cada respuesta incluye `confidence`, la probabilidad de la respuesta principal tras aplicar una temperatura por tipo ajustada en casos de `train` retenidos.
- Contexto largo de 8.192 tokens, adecuado para logs extensos, diffs, trazas de agentes y tablas de métricas.
- Cobertura de dominios operativos de IT y software: gating, enrutado, verificación, ranking y control de flujo de agentes.
- Interfaz de servidor compatible con la forma de petición `POST /v1/systemone` mediante `decision_server.py`.
- No genera texto, no soporta tool calling generativo ni razonamiento multi-paso explícito; su función es la decisión clasificatoria.
- Capacidades multilingües: no disponibles (solo inglés).

## Casos de uso

- Triaje de alertas de seguridad: dado el texto de una alerta (por ejemplo, intentos de SSH fallidos seguidos de un acceso correcto), el modelo devuelve en una pasada la disposición (`close`, `investigate`, `contain`), si es un ataque real (`noul`) y la severidad (`score`), lo que permite enrutar automáticamente al equipo SOC correspondiente.
- Control de flujo de agentes: decidir si un agente debe continuar, detenerse o escalar ante un estado dado, usando preguntas go/no-go con confianza calibrada para fijar umbrales de escalado.
- Enrutado de tickets y peticiones: clasificar una incidencia entre varios equipos o colas (`choice`) a partir de su descripción y metadatos, aprovechando el contexto de 8.192 tokens para incluir historial o configuración relevante.
- Verificación de cambios en CI/CD: evaluar diffs o resultados de tests con preguntas tipadas sobre si el cambio es seguro, si requiere revisión adicional o su nivel de riesgo, integrándolo como paso previo al merge.
- Puntuación de calidad en pipelines de datos: asignar niveles de una rúbrica ordenada (`score`) a registros, respuestas o configuraciones, con intervalos de confianza para filtrar casos dudosos.
- Gating en sistemas RAG o de recuperación: decidir si un documento recuperado es suficiente para responder una consulta o si hay que recuperar más, mediante preguntas sí/no calibradas.
- Monitorización operativa: clasificar tablas de métricas y logs en un único forward pass por lote de preguntas, reduciendo el coste frente a evaluar cada pregunta con un modelo generativo.

## Benchmarks y rendimiento

Resultados en el split de test de Typed Decisions (400 casos, 2.000 preguntas), en modo especialista (ambos modelos ajustados sobre el split `train` del benchmark):

| Tipo de pregunta | Preguntas | DecidaBERT-large | DecidaBERT-large-v2 | Intervalo 95% v2 | Azar |
|---|---|---|---|---|---|
| choice | 600 | 0.722 | 0.747 | 0.710 a 0.780 | 0.233 |
| score | 800 | 0.694 | 0.759 | 0.728 a 0.787 | 0.244 |
| yes/no (`noul`) | 600 | 0.830 | 0.868 | 0.839 a 0.893 | 0.500 |
| **todas** | 2.000 | 0.743 (0.723 a 0.762) | **0.788** | 0.770 a 0.805 | — |

En preguntas `score`, v2 queda a un nivel del nivel oro el 97,6% de las veces (v1: 95,5%).

Métricas del scorer propio del benchmark:

| Accuracy ↑ | KL desde oro ↓ | Brier ↓ | ECE ↓ |
|---|---|---|---|
| 0.7835 | 0.0861 | 0.0473 | 0.1435 |

Calibración: la distribución cruda (`probabilities`) tiene un error de calibración de 0,144; la `confidence` recalibrada por tipo lo reduce a 0,023 en el split de test.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,6 GB de pesos (tamaño del repo), más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para uso individual; A100/H100 no son necesarias, aunque permiten mayor throughput por batching.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en FP32; con cuantización a FP16/BF16 el requisito baja a unos 0,8 GB, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: `transformers` con el código de `decidabert_v2/`, servidor incluido `decision_server.py` (FastAPI + uvicorn) con endpoint `/v1/systemone`, y compatibilidad declarada con Text Embeddings Inference y endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de una sola pasada por petición con múltiples preguntas reduce el coste frente a evaluar cada pregunta por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecidaBERT-large-v2 | 397,9 M | 8.192 | Encoder de decisión tipada, sin generación | Apache 2.0 | Hugging Face |
| DecidaBERT-large (v1) | no disponible | 512 en entrenamiento, hasta 2.048 en inferencia | Encoder de decisión tipada, predecesor | no disponible | Hugging Face |
| ModernBERT-large (base) | 395 M | 8.192 | Encoder bidireccional de propósito general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Funciona mejor cuando el estado describe la situación en palabras; los números en bruto se leen con menos fiabilidad.
- Está ajustado sobre el split `train` del benchmark Typed Decisions: sus cifras en ese benchmark deben compararse con otros modelos también ajustados, no con modelos zero-shot.
- Las etiquetas oro del benchmark son respuestas promediadas de un modelo profesor, no anotaciones humanas, lo que introduce sesgo del profesor en la evaluación.
- Riesgo de alucinación estructural: al ser un clasificador, puede asignar alta confianza a opciones incorrectas en estados fuera de distribución; se recomienda usar `confidence` con umbrales y no la probabilidad cruda.
- No genera texto ni razona de forma multi-paso: no es adecuado para tareas generativas, tool calling ni agentes autónomos por sí solo.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales del dataset de entrenamiento más allá de lo indicado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helmo/DecidaBERT-large-v2
- Modelo predecesor: https://huggingface.co/helmo/DecidaBERT-large
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Predicciones del split de test: `eval/typed-decisions/predictions.jsonl` (incluido en el repositorio)
