# ldenoue/punctuator-multilingual-minilm-v2

## Resumen

Punctuator-multilingual-minilm-v2 es un modelo de restauracion de puntuacion y mayusculas de tipo no generativo, publicado por el autor ldenoue en Hugging Face. Se trata de un clasificador de tokens (pipeline token-classification) construido sobre un backbone MiniLM multilingue de 12 capas y 384 dimensiones, con un total de 33.782.792 parametros. Su proposito es reconstruir la puntuacion y las mayusculas de texto que carece de ellas, un paso habitual de post-procesado en salidas de sistemas de reconocimiento automatico del habla (ASR) y en transcripciones sin formato.

El modelo no genera palabras: unicamente decide, para cada palabra, que signo de puntuacion anadir y como ajustar su capitalizacion. Devuelve ocho logits por token, cinco para puntuacion (NONE, COMMA, PERIOD, QUESTION, EXCLAMATION) y tres para capitalizacion (LOWER, CAP, UPPER). Emplea un vocabulario de 32.000 piezas derivado del SentencePiece original de XLM-R, y ha sido entrenado con metadatos de texto de VoxPopuli y mensajes revisados de OASST2.

Su relevancia practica radica en su tamano reducido (0,3 GB de repositorio) y su licencia MIT, que lo hacen facil de desplegar como componente de post-procesado en pipelines de ASR, subtitulado o normalizacion de texto. Admite 13 idiomas, aunque el propio autor advierte que la inclusion de un idioma en el entrenamiento no garantiza calidad de produccion y recomienda evaluar contra la salida real del sistema ASR objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM multilingue, 12 capas, 384 de ancho) |
| Parametros totales | 33.782.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no especifica cuantizaciones; existe version ONNX) |
| Idiomas soportados | en, de, fr, es, it, nl, pl, cs, sk, sl, ro, pt-BR, bg |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only de tipo transformer, concretamente un MiniLM multilingue de 12 capas con anchura oculta de 384. Sobre este backbone se anade una cabeza de clasificacion de tokens que produce ocho logits por token: los indices 0 a 4 corresponden a las clases de puntuacion NONE, COMMA, PERIOD, QUESTION y EXCLAMATION, mientras que los indices 5 a 7 corresponden a las clases de capitalizacion LOWER, CAP y UPPER. La prediccion final se obtiene seleccionando de forma independiente ambas tareas en el ultimo subword de cada palabra de entrada, lo que implica que el modelo solo modifica mayusculas y anade signos, sin introducir ni eliminar palabras.

El vocabulario es de 32.000 piezas y se ha podado a partir del modelo SentencePiece original de XLM-R. Los datos de entrenamiento provienen de metadatos de texto de VoxPopuli (corpus de discurso parlamentario) y de mensajes revisados de OASST2. Esta revision concreta se ha entrenado en modo "balanced". No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO, lo cual es coherente con un modelo discriminativo y no generativo de este tipo.

## Capacidades

- Restauracion de puntuacion: inserta comas, puntos, signos de interrogacion y de exclamacion en texto sin puntuar.
- Restauracion de mayusculas: distingue entre minuscula, capitalizacion inicial y mayusculas completas.
- Clasificacion de tokens por palabra: emite predicciones a nivel de token y se seleccionan en el ultimo subword de cada palabra.
- Multilingue: cubre en, de, fr, es, it, nl, pl, cs, sk, sl, ro, pt-BR y bg.
- NO es generativo: no produce texto nuevo, solo anota puntuacion y capitalizacion sobre el texto de entrada.
- Compatible con endpoints: la etiqueta endpoints_compatible indica que puede servirse en infraestructura de Hugging Face.
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni razonamiento multi-paso, capacidades que quedan fuera del alcance de un modelo discriminativo de este tipo.

## Casos de uso

- Post-procesado de salidas ASR: el modelo se aplica sobre la transcripcion cruda de un sistema de reconocimiento de voz para insertar puntuacion y mayusculas; es el escenario para el que fue entrenado explicitamente, segun indica el autor.
- Generacion de subtitulos y captioning: convierte transcripciones sin formato en subtitulos legibles, anadiendo puntos y comas que facilitan la segmentacion en lineas.
- Aplicaciones de dictado y voz a texto: integrado tras el motor ASR de un editor de dictado, mejora la legibilidad del texto final sin coste computacional apreciable por su tamano reducido.
- Transcripcion de reuniones y actas: actua como capa final que da formato a la salida de un sistema de reunion automatica, con soporte para entornos multilingues europeos.
- Normalizacion de texto ruidoso: restaura la puntuacion en texto procedente de redes sociales, chats o formularios donde el usuario la ha omitido.
- Preprocesado de corpus de entrenamiento: aplicado a grandes volumenes de texto sin puntuar para preparar datasets legibles de forma automatica y barata.
- Accesibilidad: mejora la salida de lectores de pantalla sobre transcripciones, ya que la puntuacion restaurada aporta pausas y entonacion al texto sintetizado.
- Limpieza de transcripciones legales o administrativas: puede usarse como paso previo a la revision humana, siempre que se valide la calidad por idioma contra el sistema ASR concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card hace referencia a los ficheros `training_metrics.json` y `per_language_metrics.json` del repositorio, que contenarian las metricas de entrenamiento y por idioma, pero sus valores no se han proporcionado. El autor advierte de forma explicita que la inclusion de un idioma en el entrenamiento no establece calidad de produccion y que debe evaluarse contra la salida real del sistema ASR objetivo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 135 MB solo para los pesos (33,78 M de parametros).
- VRAM estimada en fp16: aproximadamente 68 MB.
- VRAM estimada en int8 (si se cuantiza): aproximadamente 34 MB.
- GPU recomendadas: cualquier GPU, incluidas las de gama baja; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque no necesita ninguna de estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: Transformers, ONNX Runtime (hay pesos ONNX en el repositorio), Hugging Face Inference Endpoints (etiqueta endpoints_compatible) y herramientas de Optimum. No se menciona compatibilidad con llama.cpp, GGUF, vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificables de modelos comparables (parametros, contexto, rendimiento o licencia) que permitan construir una comparativa fiable. Como referencia de categoria, este modelo pertenece a la familia de restauradores de puntuacion basados en transformers encoder-only multilingues, pero no se han facilitado cifras de alternativas. Se indica "no disponible" para los campos comparativos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| punctuator-multilingual-minilm-v2 | 33,78 M | no disponible | MIT | Hugging Face (safetensors, ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no puede reescribir, resumir ni completar texto; solo anade puntuacion y ajusta mayusculas.
- Riesgo de puntuacion incorrecta en dominios alejados de los datos de entrenamiento (VoxPopuli y OASST2), como textos tecnicos, juridicos o muy informales.
- La calidad puede variar notablemente entre los 13 idiomas soportados; el autor advierte que la presencia de un idioma en el entrenamiento no implica calidad de produccion.
- La seleccion de predicciones se realiza en el ultimo subword de cada palabra, de modo que una tokenizacion inesperada podria afectar al resultado.
- No hay datos publicados de benchmarks ni de sesgos en la informacion disponible.
- Licencia MIT: permite uso comercial sin restricciones relevantes, pero no se ofrece ninguna garantia por parte del autor.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- Para produccion, se recomienda evaluar el modelo contra la salida real del sistema ASR objetivo y monitorizar la tasa de error de puntuacion por idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ldenoue/punctuator-multilingual-minilm-v2
- Metricas de entrenamiento (referenciadas en la model card, dentro del repositorio): training_metrics.json
- Metricas por idioma (referenciadas en la model card, dentro del repositorio): per_language_metrics.json
