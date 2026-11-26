# CobuildX-AI/cbx-indim-intent-classifier-32M

## Resumen

cbx-indim-intent-classifier-32M es un clasificador de intenciones (intent classification) desarrollado por CobuildX-AI para peticiones cortas de estilo asistente de voz en siete lenguas indias: hindi, bengalí, tamil, telugu, kannada, malayo y urdu. Se trata de un fine-tuning de InDIM-small (32M), un modelo de la familia ModernBERT, sobre el split de entrenamiento del dataset MASSIVE, y devuelve una de las 60 intenciones de dicho dataset (por ejemplo `alarm_set` o `weather_query`).

El modelo es relevante por su relación rendimiento/tamaño: con 31,5 millones de parámetros iguala en precisión media a mmBERT-base (307M) y supera en aproximadamente un punto a mmBERT-small (140M) en las siete lenguas, con una latencia en CPU de 5,6 ms para entradas cortas. Está pensado como componente de enrutamiento en asistentes de voz o chat, no como modelo generativo.

La arquitectura es un encoder transformer (ModernBERT) adaptado a clasificación de texto, con pesos en safetensors y una exportación ONNX fp32. La licencia es Apache-2.0 y el repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), cabeza de clasificación sobre 60 clases |
| Parametros totales | 31.514.556 (32M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens (el texto más largo se trunca y se marca con `"truncated": True`) |
| Tipos de cuantizacion | fp32 (principal), fp16 (misma precisión que fp32), int8 dinámico PyTorch (pierde 0,3 puntos); ONNX int8 no se distribuye por cambiar el 3 % de las decisiones |
| Idiomas soportados | hi, bn, ta, te, kn, ml, ur (hindi, bengalí, tamil, telugu, kannada, malayo, urdu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, fp32) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT de 32M de parámetros, con una cabeza de clasificación lineal que proyecta sobre las 60 intenciones de MASSIVE. Se entrena con fine-tuning plano (cross-entropy, 10 épocas con early stopping sobre validación, learning rate 4e-4) partiendo de InDIM-small, sobre el split de entrenamiento de MASSIVE para las siete lenguas. No se menciona uso de RLHF, DPO ni decodificación especulativa; es un clasificador discriminativo, no generativo.

El dataset MASSIVE (FitzGerald et al., 2022) contiene peticiones traducidas profesionalmente desde el inglés a cada lengua y escritas en escritura nativa. El repositorio publica la ejecución de entrenamiento con mejor puntuación de validación: precisión en test de 85,25 y macro F1 de 82,83. La exportación ONNX fp32 reproduce las mismas decisiones que PyTorch en 1.000 de 1.000 textos de test.

## Capacidades

- Clasificación de intenciones en una de 60 clases agrupadas por escenario: `alarm_*`, `audio_volume_*`, `calendar_*`, `cooking_*`, `datetime_*`, `email_*`, `general_*`, `iot_*`, `lists_*`, `music_*`, `news_query`, `play_*`, `qa_*`, `recommendation_*`, `social_*`, `takeaway_*`, `transport_*` y `weather_query`.
- Procesamiento por lotes: el método `classify` acepta un texto o una lista de textos.
- Devuelve etiqueta, puntuaciones por clase y bandera de truncamiento.
- Ejecución en CPU y GPU; exportación ONNX Runtime con las mismas decisiones que PyTorch en fp32.
- Multilingüe en las siete lenguas indias indicadas, con un único modelo para todas ellas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Enrutamiento de peticiones en asistentes de voz: dada una frase corta como «pon una alarma para mañana a las siete», el modelo devuelve `alarm_set` y el sistema deriva la petición al manejador correspondiente; su latencia de 5,6 ms en CPU permite integrarlo en el bucle de diálogo sin coste perceptible.
- Preprocesado en asistentes de chat multilingües: con un solo modelo se cubren siete lenguas indias, lo que simplifica el mantenimiento frente a tener un clasificador por idioma.
- Filtrado y enrutamiento de bajo coste en pipelines de atención al cliente: las peticiones se clasifican en intenciones de dominio (música, calendario, clima, etc.) antes de pasar a un modelo mayor o a un flujo humano.
- Detección de peticiones fuera de dominio mediante umbral de confianza: al no existir clase «otro», se puede usar la puntuación superior para derivar peticiones de baja confianza a un fallback o a revisión humana.
- Despliegue en dispositivos con recursos limitados: con 32M de parámetros y 0,3 GB de repositorio, cabe en entornos de CPU sin GPU, incluidos servidores modestos o edge.
- Evaluación comparativa de modelos multilingües: sirve como referencia de fine-tuning sobre MASSIVE para experimentos con mmBERT o IndicBERT v2 con la misma receta.
- Clasificación por lotes de corpus de peticiones: el método `classify` acepta listas, lo que permite etiquetar grandes volúmenes de transcripciones para análisis o anotación.

## Benchmarks y rendimiento

Resultados sobre el test de MASSIVE (20.818 peticiones, 2.974 por lengua), misma receta y datos para todos los modelos, media de 3 ejecuciones ± desviación típica salvo donde se indica:

| Modelo | Parametros | Accuracy | Macro F1 | bn | hi | kn | ml | ta | te | ur |
|---|---|---|---|---|---|---|---|---|---|---|
| InDIM-small (base de este modelo) | 32M | 85,2 ± 0,1 | 82,3 | 85,9 | 86,1 | 85,1 | 85,2 | 84,3 | 84,5 | 85,4 |
| mmBERT-small | 140M | 84,2 ± 0,0 | 81,2 | 84,3 | 85,3 | 83,7 | 84,5 | 83,2 | 83,8 | 84,4 |
| mmBERT-base | 307M | 85,0 ± 0,2 | 82,1 | 84,7 | 86,9 | 84,1 | 85,2 | 84,2 | 84,7 | 85,6 |
| IndicBERT v2 | 278M | 86,4 ± 0,1 | 83,5 | 87,0 | 87,7 | 85,9 | 86,7 | 85,4 | 86,3 | 85,9 |

La ejecución publicada en este repositorio obtiene precisión en test de 85,25 y macro F1 de 82,83.

Latencia en CPU (Intel i7-10700, 8 hilos, una petición a la vez, PyTorch fp32): 5,6 ms para una petición de 12 tokens y 12,9 ms para una entrada larga de unas 60 palabras. Los clasificadores basados en mmBERT-small y mmBERT-base tardaron aproximadamente 2,5 y 5 veces más que InDIM-small en la misma máquina (4 hilos, una frase).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (32M de parámetros); en la práctica el modelo cabe en memoria de CPU sin GPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna. Para lotes grandes puede usarse cualquier GPU consumer (RTX 3060 o superior) sin problema de memoria.
- Cabe en GPU consumer: sí, en todas, con un consumo de memoria despreciable.
- Opciones de despliegue: PyTorch con `transformers`, ONNX Runtime (`onnx/model.onnx`, fp32), y el wrapper `cbx_intent.py` incluido en el repositorio. Compatible con text-embeddings-inference y endpoints según los tags del repositorio.
- Latencia y throughput: 5,6 ms por petición corta y 12,9 ms por entrada larga en CPU (i7-10700, 8 hilos, una a la vez); el throughput en lote no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (MASSIVE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-indim-intent-classifier-32M | 32M | 96 tokens | 85,25 | Apache-2.0 | Hugging Face, ONNX |
| mmBERT-small | 140M | no disponible | 84,2 | no disponible | Hugging Face |
| mmBERT-base | 307M | no disponible | 85,0 | no disponible | Hugging Face |
| IndicBERT v2 | 278M | no disponible | 86,4 | no disponible | Hugging Face |

El modelo iguala a mmBERT-base con una décima parte de sus parámetros y supera a mmBERT-small en todas las lenguas; IndicBERT v2 es 1,2 puntos más preciso con nueve veces más parámetros. La ventaja principal es la eficiencia en CPU y el tamaño reducido.

## Limitaciones y advertencias

- Dominio cerrado: las 60 intenciones son las de un asistente de voz; las peticiones fuera de ese conjunto reciben igualmente una de las 60 etiquetas, ya que no existe clase «otro». Es necesario usar la puntuación superior como umbral y derivar las peticiones de baja confianza.
- Datos traducidos: MASSIVE se traduce desde el inglés, por lo que la formulación puede diferir del uso real en estas lenguas.
- Texto romanizado o code-mixed: no estuvo en el entrenamiento y la precisión será menor.
- Longitud máxima de 96 tokens; el texto más largo se trunca (se indica con `"truncated": True`).
- Solo se entrenó y evaluó en las siete lenguas indicadas; no cubre otras lenguas indias ni el inglés.
- Riesgo de sesgo heredado del dataset MASSIVE y de las traducciones; no se han publicado análisis de sesgo específicos.
- Uso previsto limitado al enrutamiento de peticiones con posibilidad de corrección por el usuario o fallback; no debe usarse para decisiones sobre personas sin revisión humana.
- Se distribuye «tal cual», sin garantías; CobuildX-AI no se responsabiliza de su uso.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (MASSIVE) son CC BY 4.0 y deben respetarse sus condiciones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indim-intent-classifier-32M
- Modelo base InDIM-small (32M): https://huggingface.co/CobuildX-AI/InDIM-small
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Contacto del autor: hello@cobuildx.ai
