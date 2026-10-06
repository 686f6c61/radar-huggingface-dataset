# LiChace/laya-scam-detector-onnx-v3

## Resumen

Laya Multilingual — Scam Detection (fp16 ONNX) es un clasificador de texto especializado en detectar mensajes fraudulentos y de phishing en chino e inglés. Lo publica el usuario LiChace y parte de `convaiinnovations/laya-multilingual` (mmBERT-base, 322 M de parámetros, vocabulario de 256 k tokens), sobre el que se aplica un ajuste fino con LoRA r=8 y se exporta a ONNX Runtime, de modo que la inferencia no requiere PyTorch.

A diferencia de un modelo generativo, este modelo no produce texto libre: recibe un fragmento de texto más un conjunto de preguntas tipadas y devuelve decisiones con probabilidad calibrada en una sola pasada hacia delante. Soporta tres primitivas de pregunta: `noul` (¿es una estafa?, probabilidad en [0,1]), `score` (nivel de riesgo esperado 0-4 más distribución) y `choice` (una de 13 categorías de fraude más distribución completa).

El interés práctico está en su coste: el autor reporta 125 ms de latencia p50 en CPU para las tres preguntas, un peso fp16 de 643 MB y un ajuste hecho íntegramente en un Apple M4 Pro (backend MPS, pico de 1,3 GB de RAM, 73 minutos). El repositorio tiene 0 descargas y 0 likes, por lo que se trata de un artefacto recién publicado y sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabezas de decisión tipadas, exportado como grafo ONNX |
| Parámetros totales | 322 M (modelo base); 1.148.928 parámetros entrenables en el adaptador LoRA (0,36 % del total) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (ventana fija del contrato de entrada del grafo ONNX; la cabeza de pregunta se limita a 192) |
| Tipos de cuantización | fp16 (raíz del repositorio) e int8 dinámica (carpeta `int8/`) |
| Idiomas soportados | zh y en validados; el modelo base declara más de 100 idiomas, sin evaluación específica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` 2,8 MB + `model.onnx.data` 643 MB) y tokenizador `tokenizer.json` (33 MB) |
| Pipeline | text-classification |
| Salidas | probabilidad binaria de estafa, nivel de riesgo 0-4 y 13 categorías con distribución |
| Tamaño del repositorio | 0,7 GB |
| Variante int8 | 370 MB (carpeta `int8/`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer (familia mmBERT, 322 M de parámetros, vocabulario de 256 k tokens) al que se le añaden cabezas de clasificación para tres tareas: decisión binaria de estafa, estimación ordinal de riesgo y clasificación en 13 categorías. En lugar de generar texto, el grafo consume un contrato fijo de entradas (`input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`) en el que cada opción de respuesta se representa con un token `<mask>` en una posición marcada, y devuelve lógicos por opción que el cliente normaliza con softmax. El ajuste se hizo con LoRA de rango 8, alpha 16 y dropout 0,05 aplicado únicamente a las matrices `Wqkv` y `Wo`, con objetivo de entropía cruzada (log score estrictamente propio) sobre `is_scam` y `category`.

El conjunto de entrenamiento son 15.000 muestras equilibradas extraídas de cinco fuentes públicas: FGRC-SCD (fraude telefónico chino), ealvaradob (phishing en inglés), FBS_SMS (falsas estaciones base chinas), ScamShield y UCI SMS Spam, más una semilla sintética para las dos clases más raras. La composición es 84,5 % chino y 15,5 % inglés. El entrenamiento duró 73 minutos en 3 épocas sobre un Apple M4 Pro con backend MPS. La cuantización de fp32 a fp16 introduce una diferencia máxima de probabilidad medida de 0,00001. Una innovación estructural relevante es el tokenizador de 256 k entradas, que tokeniza chino a razón de ~1,5 caracteres por token y reduce la latencia frente a vocabularios solo ingleses.

## Capacidades

- Detección binaria de estafa: responde "¿es esto una estafa?" con una probabilidad calibrada (primitiva `noul`, `qtype=2`).
- Estimación ordinal de riesgo: devuelve el nivel esperado de 0 a 4 junto con la distribución completa (primitiva `score`, `qtype=1`).
- Clasificación en 13 categorías: `benign`, `phishing`, `crypto_scam`, `investment_scam`, `lottery_scam`, `job_scam`, `loan_scam`, `impersonation`, `romance_scam`, `delivery_fraud`, `marketing`, `adult_content` y `spam_general` (primitiva `choice`, `qtype=0`).
- Multilingüismo zh/en: entrenado y evaluado principalmente en chino, con evaluación complementaria en inglés sobre un conjunto manuscrito.
- Salidas probabilísticas calibradas: el cliente de referencia incluye escalado de temperatura y modo por lotes.
- Ejecución sin PyTorch: el grafo ONNX se ejecuta con ONNX Runtime en CPU o GPU, y la variante fp16 funciona también en navegador vía onnxruntime-web (WASM).
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo de decisión con preguntas tipadas, no un asistente conversacional.

## Casos de uso

- Filtrado de SMS y mensajería en operadores de telecomunicaciones: el modelo clasifica cada mensaje entrante en una sola pasada de 125 ms en CPU y devuelve la categoría de fraude, lo que permite bloquear o etiquetar en el borde de la red sin coste de GPU.
- Detección de phishing en correo electrónico: la primitiva `noul` aporta una probabilidad por mensaje y la clase `phishing` permite separar campañas de suplantación del resto de spam, con la precisión de 0,989 reportada en el holdout chino.
- Triaje de fraude en atención al cliente bancaria: el nivel de riesgo 0-4 y las 13 categorías permiten enrutar cada caso al equipo adecuado (por ejemplo, `investment_scam` a fraude financiero y `impersonation` a verificación de identidad).
- Análisis por lotes de denuncias acumuladas: el cliente de referencia soporta modo batch, de modo que se puede puntuar un corpus histórico de quejas y priorizar la investigación por nivel de riesgo.
- Etiquetado previo para entrenar o afinar otros modelos: al devolver una distribución completa por categoría, funciona como anotador débil con umbral de confianza configurable.
- Prefiltro barato delante de un LLM: el autor etiqueta el modelo como "system-one"; un sistema puede descartar con este clasificador el 90 % del tráfico benigno y reservar un modelo generativo caro para los casos dudosos.
- Filtrado en el navegador: la variante fp16 puede ejecutarse en cliente con onnxruntime-web, útil para extensiones que analizan páginas o formularios sin enviar el texto a un servidor.
- Protección de menores y moderación de comunidades: las clases `adult_content` y `romance_scam` permiten señalar contenido de riesgo en foros y apps de mensajería, siempre con revisión humana previa a cualquier sanción.

## Benchmarks y rendimiento

Holdout de 600 muestras en chino, nunca vistas durante el entrenamiento (datos reportados por el autor):

| Métrica | Valor |
|---|---|
| Exactitud is_scam | 0,967 |
| Precisión is_scam | 0,989 |
| Exhaustividad (recall) is_scam | 0,957 |
| F1 is_scam | 0,972 |
| Exactitud 13 clases | 0,810 |
| MAE de nivel de riesgo | 1,52 |
| Latencia p50 (CPU) | 125 ms |
| Latencia p95 (CPU) | 228 ms |

Conjunto manuscrito mixto de 38 muestras, antes y después del ajuste fino:

| Métrica | Base en inglés | Este modelo |
|---|---|---|
| Exactitud is_scam | 0,868 | 0,921 |
| F1 is_scam | 0,909 | 0,943 |
| Exactitud en chino | 0,840 | 0,920 |
| Exactitud 13 clases | 0,500 | 0,632 |
| Falsos positivos | 5 | 3 |
| Latencia p50 | 652 ms | 131 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Peso de los archivos: 643 MB de pesos fp16 más 2,8 MB de grafo y 33 MB de tokenizador (0,7 GB de repositorio); la variante int8 ocupa 370 MB.
- VRAM estimada: por debajo de 2 GB en fp16 y por debajo de 1 GB en int8, considerando pesos más activaciones de una ventana de 512 tokens (estimación derivada del tamaño de los archivos, no medida por el autor).
- GPU: cabe en cualquier GPU de consumo con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060 y RTX 4090. No necesita A100 ni H100.
- CPU: es el entorno de referencia; el autor reporta 125 ms p50 y 228 ms p95 para las tres preguntas en un Apple M4 Pro.
- Memoria de entrenamiento: pico de 1,3 GB de RAM en MPS, según el autor.
- Despliegue: ONNX Runtime con `CPUExecutionProvider` o proveedores CUDA/TensorRT; onnxruntime-web (WASM) solo con el checkpoint fp16. No aplica vLLM ni llama.cpp, porque el modelo no es generativo y se distribuye en formato ONNX. El repositorio de GitHub incluye un cliente de referencia con enrutado, escalado de temperatura, modo por lotes y servidor HTTP.
- Rendimiento: no hay medidas de throughput publicadas; de la latencia p50 de 125 ms se deriva aproximadamente 8 invocaciones por segundo en un único flujo, valor calculado a partir de los datos del autor y no medido directamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud is_scam | Exactitud 13 clases | Latencia p50 | Licencia |
|---|---|---|---|---|---|---|
| LiChace/laya-scam-detector-onnx-v3 (fp16) | 322 M base + 1,15 M LoRA | 512 tokens | 0,921 (set manuscrito) / 0,967 (holdout zh) | 0,632 / 0,810 | 125-131 ms | Apache 2.0 |
| Variante int8 del mismo modelo | igual | 512 tokens | no disponible de forma independiente | no disponible | no disponible | Apache 2.0 |
| Modelo base en inglés citado en la model card (vocabulario ModernBERT) | no disponible | no disponible | 0,868 | 0,500 | 652 ms | no disponible |
| convaiinnovations/laya-multilingual (modelo base) | 322 M | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Otros clasificadores de spam o phishing de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base en inglés citado por el autor y con la variante int8, ya que no se han proporcionado datos de otros detectores de fraude comparables.

## Limitaciones y advertencias

- No es un chatbot: solo responde a las preguntas tipadas que se le suministran y no mantiene conversación ni genera texto.
- La probabilidad no es verdad absoluta. El propio autor advierte que una confianza de 0,95 no equivale a certeza; el texto de la model card está truncado en ese punto, por lo que no se detalla el resto del aviso.
- Desequilibrio de idiomas: el 84,5 % del entrenamiento es chino y solo el 15,5 % inglés. La evaluación en inglés se hizo sobre 38 muestras manuscritas, un tamaño demasiado pequeño para conclusiones firmes.
- Riesgo de falsos positivos: 3 falsos positivos sobre 38 muestras manuscritas. La clase `marketing` es la más propensa a confundirse con fraude y podría provocar bloqueos de mensajes legítimos.
- La estimación de nivel de riesgo es ruidosa: un MAE de 1,52 sobre una escala de 0 a 4 implica un error medio superior a un nivel completo.
- La clasificación en 13 categorías falla aproximadamente en el 19 % de los casos en el holdout chino; no es adecuada para decisiones automáticas sin revisión.
- Ventana fija de 512 tokens: los textos más largos se truncan, con la consiguiente pérdida de señales al final del mensaje.
- La variante int8 no debe usarse en navegador: el autor reporta que los kernels int8 de onnxruntime-web (WASM) divergen de ONNX Runtime nativo, con P(estafa) de 0,194 frente a 0,016 sobre la misma entrada y los mismos pesos.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial, pero se hereda del modelo base `convaiinnovations/laya`; conviene verificar la licencia de ese modelo antes de un despliegue en producción.
- Sin validación externa: 0 descargas y 0 likes, un único autor y todos los resultados autodeclarados sobre conjuntos de evaluación propios.
- No hay análisis de sesgo por subgrupos demográficos, ni evaluación en idiomas distintos de chino e inglés, ni datos sobre robustez frente a texto ofuscado o adversarial.
- No debe usarse como prueba pericial ni como única base para sanciones, bloqueos de cuenta o acciones legales sin intervención humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiChace/laya-scam-detector-onnx-v3
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Modelo base alternativo citado en la model card (`laya-multilingual`): https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio del proyecto (construcción del dataset, entrenamiento y evaluación): https://github.com/chaceli/laya-scam-detector
- Cliente de referencia con enrutado, escalado de temperatura, modo por lotes y servidor HTTP: https://github.com/chaceli/laya-scam-detector
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a sitios de retransmisión deportiva sin relación con el contenido.
