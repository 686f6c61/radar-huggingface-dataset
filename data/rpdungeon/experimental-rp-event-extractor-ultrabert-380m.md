# rpDungeon/experimental-rp-event-extractor-ultrabert-380m

## Resumen

El RP event extractor UltraBERT-380M es un modelo encoder de tipo transformer, desarrollado por el equipo rpDungeon dentro del proyecto PsyCet, que extrae eventos de simulación a partir de texto de rol (roleplay). Concretamente, recibe la publicación anterior y la respuesta actual de una conversación de rol y devuelve qué eventos ocurren en la respuesta, dónde (spans de caracteres) y con qué intensidad (severidad de daño, saciedad de comida). No genera texto: es un modelo de extracción de información en un único forward pass.

Se trata de un fine-tune completo de dmis-lab/UltraBERT-380M (377.560.086 parámetros), publicado como modelo experimental con licencia Apache 2.0 y soporte exclusivo para inglés. Su relevancia radica en que propone una tarea poco habitual —extracción estructurada de estado y eventos en narrativa interactiva— y en que sustituyó a ModernBERT-large como extractor del proyecto tras obtener mejores métricas de F1 y mayor throughput.

El modelo es una pieza de investigación, no un componente acabado: el propio autor lo etiqueta como experimental y advierte que las etiquetas de entrenamiento son sintéticas, generadas por GLM-4.7, sin anotación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-380M) con tres cabezas: tipos de evento, spans BIO y valores |
| Parametros totales | 377.560.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada usa la última 1.500 caracteres del post previo más la respuesta) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) + código remoto (configuration_ultrabert.py, modeling_ultrabert.py) |

## Arquitectura y entrenamiento

El modelo es un encoder UltraBERT-380M con tres cabezas acopladas sobre una única pasada: una cabeza de tipos de evento (5 logits sigmoides sobre el token CLS, multi-etiqueta), una cabeza de spans (etiquetado BIO por tipo sobre cada token de la respuesta) y una cabeza de valores (sigmoide × 100 para `damage` y `ate`, leída en el primer token del span). La entrada tiene el formato `[CLS] previous post (últimos 1.500 caracteres) [SEP] reply [SEP]`, y los eventos se extraen únicamente de la respuesta.

El entrenamiento consistió en un fine-tune completo sobre 10.989 respuestas de conversaciones de rol sintéticas generadas por psyonic-cetacean-20B. Las etiquetas las produjo GLM-4.7 vía API (temperatura 0, sin modo thinking), que listaba eventos con tipo, span copiado literalmente, actor y valor; los spans no encontrados de forma verbatim se descartaron (1,3% de los eventos). La pérdida combina BCE (tipos) + cross-entropy (BIO) + MSE (valores), con AdamW, lr 1e-5, weight decay 0,01, warm-up lineal del 6%, gradient clipping 1,0, batch 16, 20 épocas y autocast bf16. Se publicaron los pesos de la mejor época por validación (época 14 de 20). El entrenamiento requirió 2,7 horas en una RTX 3090 con un pico de 7,1 GB de VRAM.

## Capacidades

- Extracción de cinco tipos de evento: `moved`, `clothing_off`, `clothing_on`, `damage` y `ate`.
- Localización de spans de caracteres (offsets sobre la respuesta) para cada evento detectado.
- Estimación de valores numéricos en escala 0-100: severidad de daño (1 = rasguño, 50 = herida grave, 100 = mortal) y saciedad (5 = sorbo o bocado, 50 = comida normal, 100 = saciado).
- Detección multi-etiqueta: una misma respuesta puede contener varios tipos de evento a la vez.
- Distinción entre eventos reales y planes, deseos, recuerdos o hipótesis (solo cuentan los eventos que ocurren).
- Inferencia en un único forward pass, sin generación autoregresiva.
- No soporta tool calling, agentes, visión, audio ni modo thinking; es un extractor especializado, no un modelo conversacional.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Motores de rol o narrativa interactiva: el modelo puede alimentar un gestor de estado que actualice la posición del personaje, su inventario de ropa, su salud y su nivel de saciedad tras cada respuesta, sin necesidad de que el LLM generador lleve la contabilidad.
- Sistemas de combate por turnos: la cabeza de `damage` con severidad 0-100 permite aplicar daño proporcional al texto narrativo, traduciendo descripciones literarias en valores de juego.
- Simulación de supervivencia: la detección de `ate` con saciedad 0-100 y de `moved` permite modelar el consumo de recursos y el desplazamiento entre localizaciones de forma automática.
- Moderación y análisis de contenido: la identificación de eventos de daño o de retirada de ropa puede usarse para etiquetar y filtrar conversaciones de rol según políticas de contenido.
- Extracción de datos para investigación en narrativa: permite construir corpus anotados de eventos a partir de logs de rol, con spans y valores numéricos, para estudios de estructura narrativa o entrenamiento de modelos posteriores.
- Enriquecimiento de datasets de roleplay: al ser un encoder rápido (116 items/s en RTX 3090 en bf16), puede procesar grandes volúmenes de conversaciones para añadir metadatos estructurados antes de usarlas en otros pipelines.
- Preprocesado en pipelines de agentes narrativos: la salida estructurada (tipos, spans y valores) puede consumirse como señal de bajo coste para que un agente decida la siguiente acción del mundo simulado.

## Benchmarks y rendimiento

Resultados en el split de test (1.095 respuestas), comparados con la misma receta sobre ModernBERT-large (395M). El F1 se mide contra las etiquetas de GLM-4.7; el F1 de span es solapamiento a nivel de token sobre los tokens de la respuesta.

| Metrica | ModernBERT-large (395M) | UltraBERT-380M (este modelo) |
|---|---|---|
| F1 macro de tipos de evento | .707 | **.746** |
| F1 micro de tipos de evento | .811 | **.838** |
| F1 micro de span | .537 | **.577** |
| F1 macro de span | .390 | **.429** |
| MAE de valor damage / ate (0-100) | 11,5 / 4,4 | 10,7 / 5,2 |
| Throughput (items/s, RTX 3090, bf16) | 108,5 | 116 |

Desglose por tipo (F1 de tipo / F1 de span, soporte en respuestas):

| Tipo | Soporte | ModernBERT-large | UltraBERT-380M |
|---|---|---|---|
| `moved` | 276 | .836 / .571 | .847 / .617 |
| `clothing_off` | 16 | .571 / .392 | .571 / .355 |
| `clothing_on` | 27 | .524 / .076 | .605 / .208 |
| `damage` | 84 | .707 / .262 | .783 / .281 |
| `ate` | 128 | .897 / .648 | .923 / .683 |

Los safetensors publicados reproducen estos números en CPU en fp32 (tipo macro .745, span micro .576). El autor indica que la salida `types` es más fiable que `events`, y que ambas pueden discrepar al provenir de cabezas distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 377,5M de parámetros en fp32 los pesos ocupan aproximadamente 1,5 GB, y en bf16 alrededor de 0,75 GB.
- Pico de VRAM durante el entrenamiento: 7,1 GB en una RTX 3090 (batch 16, bf16).
- GPU recomendadas: RTX 3090 para entrenamiento e inferencia por lotes; el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más en bf16.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el modelo incluye código remoto y un módulo `extract.py` con funciones `load` y `extract`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 116 items/s en RTX 3090 en bf16, en inferencia por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 macro tipo | F1 micro span | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UltraBERT-380M (este modelo) | 377,5M | no disponible | .746 | .577 | Apache 2.0 | HuggingFace |
| ModernBERT-large (receta previa) | 395M | no disponible | .707 | .537 | no disponible en la informacion | HuggingFace |

No se dispone de datos de otros extractores de eventos de rol comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un paso intermedio, no como un componente acabado.
- Etiquetas de entrenamiento generadas por GLM-4.7 sin anotación humana; los resultados miden acuerdo con ese modelo, no verdad objetiva.
- El conjunto de datos de entrenamiento no está publicado, lo que impide reproducir el entrenamiento.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación de eventos y de spans: la salida `events` puede discrepar de `types` y es menos fiable.
- Rendimiento bajo en tipos poco representados: `clothing_off` (soporte 16) y `clothing_on` (soporte 27) muestran F1 de span de .355 y .208 respectivamente.
- El MAE de `ate` empeoró respecto a ModernBERT-large (5,2 frente a 4,4), aunque el de `damage` mejoró (10,7 frente a 11,5).
- La entrada trunca el post previo a los últimos 1.500 caracteres, lo que puede perder contexto relevante en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de validación humana desaconsejan su uso en producción sin evaluación propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rpDungeon/experimental-rp-event-extractor-ultrabert-380m
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Modelo generador de las conversaciones sintéticas (psyonic-cetacean-20B): https://huggingface.co/jebcarter/psyonic-cetacean-20B
- Modelo anotador (GLM-4.7): https://huggingface.co/zai-org/GLM-4.7
