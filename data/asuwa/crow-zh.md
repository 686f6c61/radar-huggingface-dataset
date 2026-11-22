# Asuwa/crow-zh

## Resumen

Crow (chino simplificado) es un modelo de lenguaje de juguete de 17,3 millones de parámetros entrenado desde cero por el desarrollador independiente Asuwa. No es un chatbot de propósito general: interpreta a un cuervo salvaje llamado 小黑 (Xiaohei) que responde exclusivamente con acciones entre asteriscos y sonidos de cuervo, nunca con palabras humanas (salvo una palabra que el usuario le haya enseñado pacientemente a lo largo de la conversación). Es la variante en chino simplificado de una familia de tres modelos hermanos, junto con las versiones coreana y japonesa, y está inspirado en el modelo Tallow de digi-the-robot.

El modelo implementa un sistema de estado afectivo implícito: cada respuesta se etiqueta con una emoción (calm, curiosity, caution, joy, play, love, sadness, anger) y un nivel (min o max), y el comportamiento del cuervo evoluciona según el trato recibido. Alimentarlo construye confianza gradualmente; agarrarlo o perseguirlo dispara `anger max` y un rencor que las disculpas no mitigan pero la comida sí. La arquitectura es un decoder estilo Llama de 8 capas con contexto de 2.048 tokens, licencia Apache 2.0 y pesos en safetensors fp16.

Su relevancia es fundamentalmente educativa y experimental: demuestra que un modelo de 17M de parámetros puede aprender reglas de comportamiento social complejas y un formato estructurado estricto a partir de datos sintéticos generados por modelos mayores, y sirve como banco de pruebas para evaluar consistencia de rol, seguimiento de estado conversacional y robustez ante entradas ruidosas en un dominio acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 17.308.032 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16; el autor indica que fp16 puntua idéntico a fp32) |
| Idiomas soportados | Chino simplificado (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

Detalles adicionales de arquitectura: dimensión oculta 384, 8 capas, 6 cabezas de atención, MLP de 1.024. Vocabulario de 8.192 tokens SentencePiece BPE con fallback de bytes, normalización `identity` (conserva puntuación de ancho completo). Cada etiqueta de estado de ánimo (por ejemplo `[caution_min]`) es un único símbolo del tokenizador.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con RMSNorm, RoPE, activación SwiGLU y embeddings atados entre entrada y salida. El tokenizador SentencePiece BPE se entrenó únicamente sobre los relatos de preentrenamiento, con fallback de bytes y normalización `identity`. No es un modelo compatible con `transformers` ni con llama.cpp/Ollama tal cual: el tokenizador espera un token `<nl>` para los saltos de línea y un espacio tras cada asterisco de apertura, que el script `crow.py` inserta automáticamente.

El entrenamiento tuvo dos fases. Primero, preentrenamiento sobre el dataset TinyStoriesChinese (revisión `98547ad8`), aproximadamente 16.000 pasos por 32.000 tokens en una única GPU T4, con una pérdida de validación de 1,95. Después, ajuste fino sobre el split en chino del dataset Asuwa/crow-conversations (CC-BY-4.0), compuesto por conversaciones multi-turno de cuervo generadas por modelos abiertos: Gemma 4 26B-A4B (2.526 conversaciones, 55%) y Qwen3.6-35B-A3B (2.055 conversaciones, 45%). La pérdida se calculó solo sobre las líneas del cuervo y se conservó el mejor checkpoint de validación. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto restringida a un formato estructurado: `[<mood> <min|max>] *acción* *acción* <sonido>`.
- Roleplay persistente de un personaje animal (cuervo salvaje) con estado afectivo que evoluciona a lo largo de la conversación.
- Seguimiento de confianza y rencor: modela una escalera de confianza que sube con comida dejada a distancia y baja con agresiones.
- Gestión de ocho emociones (calm, curiosity, caution, joy, play, love, sadness, anger) con dos intensidades cada una.
- Reproducción de un conjunto cerrado de sonidos de cuervo (嘎, 咔咔咔, 咯咯-哒哒, 咕噜噜) cuya disponibilidad depende de la confianza y el estado de ánimo.
- Aprendizaje en contexto de una palabra enseñada por el usuario: si se repite con paciencia suficiente, el cuervo la imita más adelante en la conversación.
- Robustez ante entradas ruidosas: errores tipográficos, espacios eliminados, risas de internet y asteriscos faltantes.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento matemático o de código.

## Casos de uso

- Sala de chat recreativa: el modelo puede sostener una interacción de rol con un personaje con memoria afectiva dentro de una conversación, adecuado para comunidades pequeñas o demos lúdicas gracias a su bajo coste de ejecución en CPU.
- Investigación sobre consistencia de personaje: sirve como banco de pruebas controlado para medir si un modelo pequeño mantiene reglas de comportamiento social a lo largo de turnos, con métricas de precisión de etiqueta ya definidas por el autor.
- Evaluación de robustez ante ruido: el conjunto de pruebas con erratas y formato degradado permite comparar técnicas de normalización de entrada en modelos pequeños sin incurrir en costes de GPU.
- Enseñanza de arquitecturas transformer: con 17M de parámetros y un único archivo autocontenido (`crow.py`), es un ejemplo práctico para explicar tokenización, formato de chat y decodificación greedy en cursos o talleres.
- Prototipado de mecánicas de confianza en videojuegos: el sistema de escalera de confianza y rencor puede reutilizarse como referencia para diseñar NPCs con memoria de trato en prototipos rápidos.
- Generación de datos sintéticos de diálogo con restricciones de formato: útil para probar pipelines de validación estricta que verifiquen que las salidas respetan un esquema cerrado (acciones y sonidos permitidos, sin palabras humanas).
- Demostración de ajuste fino desde cero: el par preentrenamiento en TinyStoriesChinese más ajuste en conversaciones sirve como receta reproducible para quien quiera entrenar un modelo de rol de dominio muy acotado en hardware de gama baja.

## Benchmarks y rendimiento

Evaluación sobre conversaciones reservadas (3.214 turnos nunca vistos en entrenamiento):

| Modelo | Pérdida en reserva | Precisión de etiqueta | Entrada ruidosa | Respuestas que pasan el verificador | Etiqueta correcta en respuestas |
|---|---|---|---|---|---|
| Crow chino simplificado (este modelo) | 0,646 | 95,0% | 94,6% | 98,7% | 98,7% |

Desglose por comportamiento (precisión de etiqueta):

| Comportamiento | Correcto | Entrada ruidosa | Turnos |
|---|---|---|---|
| Responde con graznidos | 99,2% | 98,8% | 257 |
| La comida deshace el rencor paso a paso | 97,7% | 97,3% | 221 |
| "Lo siento" durante un rencor no hace nada | 100,0% | 100,0% | 153 |
| Estalla si lo agarran | 96,0% | 94,6% | 74 |
| No acepta comida de la mano de un desconocido | 95,2% | 95,2% | 42 |
| Dice una palabra enseñada en el momento adecuado | 91,1% | 86,7% | 45 |
| Nunca agarrado, solo se aleja a saltos | 97,6% | 95,2% | 42 |
| Palabra no aprendida: escucha, no la dice | 80,0% | 77,5% | 40 |
| Estremecimiento por cicatriz antigua | 96,9% | 96,9% | 32 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp16 (17,3M de parámetros × 2 bytes ≈ 35 MB de pesos, más activaciones y tokenizador); en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; el autor indica que funciona en CPU. Cualquier GPU con más de 1 GB de memoria es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las del mercado actual, e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: únicamente el script `crow.py` proporcionado por el autor (PyTorch + SentencePiece + safetensors). No es compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptar el tokenizador y el formato.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la decodificación en CPU es interactiva (orden de milisegundos por token), aunque no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Crow zh (este modelo) | 17,3M | 2.048 | zh | Apache 2.0 | safetensors fp16 | Hugging Face, script propio |
| Crow ko | no disponible | no disponible | ko | no disponible | no disponible | Hugging Face (Asuwa/crow-ko) |
| Crow ja | no disponible | no disponible | ja | no disponible | no disponible | Hugging Face (Asuwa/crow-ja) |
| Tallow (modelo original) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (digi-the-robot/Tallow) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: no es un chatbot de propósito general y no debe usarse para tareas de producción que requieran conocimiento factual, razonamiento o código.
- Solo admite chino simplificado; no hay soporte multilingüe.
- Contexto muy limitado (2.048 tokens), insuficiente para documentos largos o conversaciones muy extensas.
- No es compatible con `transformers`, llama.cpp ni Ollama sin modificaciones: el tokenizador requiere tokens especiales (`<nl>`, espacio tras asterisco) que solo gestiona el script del autor.
- Riesgo de alucinación en el sentido de desviaciones del formato o de la escalera de confianza: el autor documenta fallos de un paso en la escalera (por ejemplo `caution min` en lugar de `curiosity min`), y las categorías con menos de 40 turnos son estadísticamente ruidosas.
- El rendimiento en la categoría de palabra no aprendida es el más bajo (80,0% de precisión de etiqueta), por lo que puede imitar palabras que no debería o ignorar instrucciones de aprendizaje.
- Los datos de ajuste fino fueron generados por modelos abiertos (Gemma 4 26B-A4B y Qwen3.6-35B-A3B), lo que puede introducir sesgos y artefactos de esos generadores.
- El corpus de preentrenamiento (TinyStoriesChinese) no se redistribuye y su tarjeta no especifica el método de traducción, lo que limita la reproducibilidad exacta.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de rol de juguete no se recomienda su explotación comercial sin una evaluación propia.
- Las líneas humanas del conjunto de evaluación fueron limpiadas por un juez automático, por lo que los resultados pueden ser algo más favorables que con entradas reales sin procesar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asuwa/crow-zh
- Modelo hermano en coreano: https://huggingface.co/Asuwa/crow-ko
- Modelo hermano en japonés: https://huggingface.co/Asuwa/crow-ja
- Modelo original Tallow: https://huggingface.co/digi-the-robot/Tallow
- Dataset de ajuste fino: https://huggingface.co/datasets/Asuwa/crow-conversations
- Dataset de preentrenamiento: https://huggingface.co/datasets/adam89/TinyStoriesChinese
