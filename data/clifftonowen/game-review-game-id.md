# Clifftonowen/game-review-game-id

## Resumen

`Clifftonowen/game-review-game-id` es un modelo de clasificación de texto en inglés que resuelve una tarea muy concreta: dado el texto de una reseña de videojuego, predecir a cuál de 1.232 juegos se refiere, sin usar ningún metadato (ni appid, ni título, ni plataforma). Está desarrollado por el usuario Clifftonowen y publicado bajo licencia MIT. Se trata de un ajuste fino de `distilbert-base-uncased`, el encoder transformer destilado de 6 capas y aproximadamente 66 millones de parámetros, con una ventana máxima de 512 tokens.

El interés del modelo no está en su arquitectura, que es deliberadamente modesta, sino en el despliegue: se ha exportado a ONNX y cuantizado dinámicamente a int8, reduciendo el peso de 268 MB a 68 MB, de modo que la inferencia completa ocurre en el navegador mediante `transformers.js`. El autor reporta un 60,0 % de top-1 accuracy en int8 frente al 61,4 % en fp32, con una línea base aleatoria del 0,08 % sobre 1.232 clases, lo que supone aproximadamente 750 veces mejor que el azar.

Es relevante como ejemplo de pipeline completo de clasificador de cola larga listo para el navegador: ajuste sobre unos 4,2 millones de reseñas de Steam, cuantización medida en lugar de asumida, y recuperación verificada del mapeo de etiquetas que el entrenamiento original había guardado como marcadores `LABEL_0 … LABEL_1231`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 768 de dimensión oculta, 12 cabezas de atención); cabecera de clasificación con 1.232 clases |
| Parametros totales | ~66 millones (heredados de `distilbert-base-uncased`; la cabecera de clasificación ajustada tiene 1.232 salidas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones de la arquitectura base); la estrategia de truncado del corpus de entrenamiento no está especificada |
| Tipos de cuantizacion | int8 dinámica sobre ONNX (dtype `q8` en transformers.js); existe versión fp32 de referencia (268 MB) frente a los 68 MB de la int8 publicada |
| Idiomas soportados | inglés (`en`) únicamente |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB); pensado para `transformers.js` |
| Pipeline | `text-classification` |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Clases de salida | 1.232 juegos de Steam con al menos 501 reseñas cada uno |
| Descargas / likes | 0 / 0 (a fecha de la información disponible) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer estándar de la familia DistilBERT: 6 capas, aproximadamente 66 millones de parámetros y 512 posiciones máximas de entrada, destilado a partir de BERT-base. Sobre ese backbone se ha entrenado una cabecera de clasificación de 1.232 clases. No hay innovaciones arquitectónicas propias: el valor está en el ajuste fino y en el empaquetado para inferencia en navegador.

El corpus de entrenamiento son aproximadamente 4,2 millones de reseñas de Steam, restringidas a los 1.232 juegos que acumulan al menos 501 reseñas, lo que fija un vocabulario de clases cerrado y razonablemente equilibrado en su cola. La model card no detalla la composición exacta del dataset, la proporción de tokens dedicada a cada juego ni si se aplicó algún tipo de calibración o regularización adicional; tampoco menciona RLHF ni DPO, algo esperable en un clasificador. La innovación destacable es de ingeniería: exportación a ONNX con cuantización dinámica int8, cuya pérdida de precisión se midió explícitamente (1,4 puntos de top-1) en lugar de darse por supuesta, y recuperación del mapeo real de etiquetas a partir del corpus original sin reentrenar, verificado con un 61,7 % de accuracy frente al 0,08 % de la línea base.

## Capacidades

- Clasificación de texto en inglés: asigna una reseña a una de las 1.232 clases de juego, con probabilidades por clase y opción de top-k.
- Recuperación de estructura de franquicia y género no supervisada explícitamente: los vecinos más cercanos del modelo para *Counter-Strike* son *Counter-Strike: Source* y *Counter-Strike: Condition Zero*, y para *Fallout: New Vegas* son *Fallout 3* y *Oblivion*.
- Inferencia en navegador y en CPU: 68 MB en int8, ejecutable vía `transformers.js` con `dtype: "q8"`, sin backend servidor.
- Salida probabilística interpretable: la distribución top-k permite medir confianza y ambigüedad entre títulos hermanos.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. Es exclusivamente un clasificador discriminativo.
- No es multilingüe: solo inglés.

## Casos de uso

- Reatribución de reseñas huérfanas: cuando un corpus de reseñas de Steam ha perdido el identificador de aplicación, el modelo asigna cada texto a uno de los 1.232 juegos del vocabulario, lo que permite reconstruir la atribución sin volver a descargar metadatos.
- Limpieza y deduplicación de datasets para investigación: al agrupar reseñas por la clase predicha se detectan entradas mal etiquetadas o duplicadas entre fichas de juegos de la misma franquicia.
- Enrutado de tickets de soporte en una tienda digital: un comentario de usuario se dirige automáticamente al equipo o a la ficha del juego correcto, usando la distribución top-k para marcar como «revisión manual» los casos con confianza baja.
- Clasificación en el cliente sin servidor: con 68 MB en int8, el modelo se descarga una vez en el navegador y clasifica localmente, lo que evita enviar texto de usuario a un backend y elimina el coste de GPU en inferencia.
- Detección de reseñas fuera de tópico o spam: una reseña que no verse sobre ningún juego del catálogo tenderá a repartir la probabilidad entre muchas clases o a obtener una confianza máxima baja, señal explotable como heurística de filtrado.
- Agregación temática por juego: una vez clasificadas grandes colecciones de reseñas, se pueden construir resúmenes agregados y análisis de opinión por título con herramientas posteriores de NLP.
- Mapeo de texto libre a catálogo en recomendadores: la entrada de un usuario en lenguaje natural se traduce a un juego concreto del vocabulario, utilizable como señal en un sistema de recomendación híbrido.
- Estudio académico de taxonomías aprendidas: el análisis de los vecinos más cercanos del clasificador permite estudiar si el modelo ha inducido relaciones de franquicia, género o secuela a partir únicamente de texto de reseñas.

## Benchmarks y rendimiento

Datos publicados por el autor sobre una muestra reservada del corpus de origen:

| Modelo / configuración | Top-1 accuracy | Notas |
|---|---|---|
| fp32 | 61,4 % | Referencia sin cuantizar, 268 MB |
| int8 (este repo) | 60,0 % | 68 MB; pérdida de 1,4 puntos atribuida a la cuantización |
| Verificación del mapeo de etiquetas recuperado | 61,7 % | Medición del autor al puntuar con el mapeo reconstruido |
| Línea base aleatoria | ~0,08 % | Con 1.232 clases; el 60 % equivale a ~750× el azar |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark generalista en la información disponible, y no tendrían sentido para un clasificador cerrado de 1.232 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,1 GB con los pesos int8 (68 MB) más el runtime; alrededor de 0,3 GB con los pesos fp32 (268 MB) más el runtime.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria sirve; no requiere A100, H100 ni siquiera una RTX 4090. Una iGPU integrada es suficiente en la práctica.
- Cabe en cualquier GPU de consumo y también en CPU: el caso de uso principal es WASM en el navegador, con aceleración opcional por WebGPU.
- Opciones de despliegue: `transformers.js` (WASM/WebGPU) con `dtype: "q8"`, ONNX Runtime y ONNX Runtime Web. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo generativo y no dispone de pesos GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica tiempos de inferencia ni cifras de peticiones por segundo.

## Comparativa con modelos similares

No se conocen alternativas publicadas para esta tarea exacta (identificación de juego a partir de texto de reseña con 1.232 clases), por lo que la comparación se hace contra los encoders base de la misma familia y tamaño. No se dispone de cifras de accuracy comparables para esas alternativas en este corpus concreto.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Clifftonowen/game-review-game-id` | ~66 M | 512 tokens | Clasificación cerrada de 1.232 juegos (inglés) | MIT | ONNX int8 en HuggingFace, ejecutable en navegador |
| `distilbert/distilbert-base-uncased` | ~66 M | 512 tokens | Modelo base, sin cabecera de clasificación ajustada | Apache 2.0 | HuggingFace, ampliamente soportado |
| `bert-base-uncased` | ~110 M | 512 tokens | Modelo base; mayor coste de inferencia que DistilBERT | Apache 2.0 | HuggingFace |
| `microsoft/MiniLM-L6-v2` | ~22,7 M | 512 tokens | Sentence embeddings / clasificación con ajuste | Apache 2.0 | HuggingFace, habitual en despliegues ligeros |

Frente a estos, la ventaja diferencial del modelo evaluado es el empaquetado ONNX int8 listo para navegador, el vocabulario de clases ya resuelto y verificado y el mapeo de etiquetas publicado; su desventaja es la especialización extrema, que lo inutiliza para cualquier tarea fuera de su conjunto cerrado de 1.232 juegos.

## Limitaciones y advertencias

- Dominio cerrado: solo puede nombrar juegos dentro de su vocabulario de 1.232 clases. Para reseñas de cualquier otro juego elegirá con seguridad el título más cercano, produciendo un falso positivo confiado.
- Registro limitado: entrenado exclusivamente con texto de reseñas de Steam, refleja ese estilo, ese vocabulario y la época de juegos cubierta por el corpus. Textos de prensa especializada, foros o redes sociales pueden degradar la precisión.
- Idioma único: solo inglés. No hay soporte multilingüe ni evaluación en otros idiomas.
- Sesgos potenciales: al derivarse de Steam, el modelo hereda el desequilibrio de popularidad de la plataforma y la sobrerrepresentación de ciertos géneros y franquicias entre los juegos con más de 501 reseñas.
- Riesgo de alucinación en sentido clasificatorio: la salida siempre es una de las 1.232 clases, sin opción de «ninguna de las anteriores», lo que exige umbrales de confianza externos para filtrar entradas fuera de dominio.
- Límite de 512 tokens: la arquitectura base no admite entradas más largas; reseñas extensas deben truncarse, y la model card no especifica qué estrategia de truncado se usó durante el entrenamiento.
- Trazabilidad de las etiquetas: el mapeo original se había perdido y fue recuperado a posteriori desde el corpus, no desde el artefacto de entrenamiento. Aunque el autor lo verificó con una medición de accuracy, el mapeo no procede de la ejecución original.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados publicados.
- Licencia: MIT, permisiva para uso comercial, pero conviene recordar que el modelo base `distilbert-base-uncased` se distribuye bajo Apache 2.0 y que el corpus de reseñas de Steam tiene sus propias condiciones de uso, no detalladas en la model card.
- Sin datos de latencia, throughput ni consumo: no hay cifras publicadas que permitan dimensionar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Clifftonowen/game-review-game-id
- Demo en vivo: https://clifftonowen.me/demos
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Librería de inferencia en navegador: https://github.com/huggingface/transformers.js

Nota: la búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados correspondían a diccionarios de sinónimos en francés y no guardan relación con la ficha.
