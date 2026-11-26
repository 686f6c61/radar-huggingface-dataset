# kouzen-neo/KazeGemPT-E2B-it

## Resumen

KazeGemPT-E2B-it es un ajuste fino (LoRA fusionado en pesos bf16) del modelo multimodal google/gemma-4-E2B-it, desarrollado por el usuario kouzen-neo. Su proposito es muy concreto: traducir texto OCR de manga —procedente de japones o ingles— hacia indonesio o ingles, respondiendo en un formato JSON estricto que consume el traductor de manga KZRS en su modo OCR. Aunque el modelo base es image-text-to-text, este ajuste trabaja solo con texto, sin necesidad de entrada de imagen.

El modelo resuelve un problema de nicho en el pipeline de traduccion de manga: clasificar y traducir dialogos y narracion, marcar como "SKIP" las onomatopeyas, etiquetas de personaje y creditos, y conservar los honorificos japoneses (-san, -kun, Senpai). Su relevancia es practica: demuestra como un modelo pequeno (~5.100 millones de parametros reales en safetensors, descrito por el autor como de 2B parametros efectivos) puede especializarse mediante destilacion de un profesor mayor (Qwen3.8-27B-FP8) para una tarea de formato rigido.

La version es la 1, publicada en noviembre de 2026, con licencia Apache-2.0 y pesos en safetensors (mas una build GGUF Q4_K_M en un repositorio aparte). No hay descargas ni likes registrados en el momento de la consulta, y el autor advierte que el conjunto de evaluacion es sintetico y pequeno (67 elementos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, base google/gemma-4-E2B-it); ajuste fino LoRA r=64 fusionado en bf16 |
| Parametros totales | 5.104.297.539 (safetensors); el autor lo describe como 2B parametros efectivos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M disponible en repositorio aparte; pesos base en bf16 |
| Idiomas soportados | ja, en, id (japones, ingles, indonesio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q4_K_M en KazeGemPT-E2B-it-GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4, y se especializa mediante LoRA con rango 64 durante 2 epocas en una sola GPU, fusionando despues los adaptadores en los pesos bf16. El entrenamiento sigue un esquema de destilacion: un profesor Qwen3.8-27B-FP8 (Apache-2.0) tradujo los textos de origen al formato KZRS y sus salidas se filtraron por JSON valido, SKIP correcto y conservacion de honorificos.

Los datos de entrenamiento combinan unas 5.900 muestras en formato KZRS y unas 2.900 muestras de traduccion simple. Las fuentes son frases japonesas de Tatoeba (CC-BY 2.0 FR) y escenas de estilo manga originales escritas por el modelo profesor; no se usaron paginas ni escaneos de manga reales. La innovacion principal no es arquitectonica sino de formato: el modelo aprende a devolver un objeto JSON con las mismas claves que la entrada, marcando "SKIP" en elementos no traducibles y opcionalmente anadiendo un glosario de nombres bajo la clave `_names`.

## Capacidades

- Traduccion de texto OCR de manga de japones a indonesio y de japones a ingles.
- Traduccion de ingles a indonesio (no incluida en el entrenamiento; probada solo en dos paginas reales segun el autor).
- Salida en JSON estricto con las mismas claves que la entrada, consumible directamente por el pipeline KZRS.
- Clasificacion de elementos no traducibles: onomatopeyas, etiquetas de personaje y creditos se devuelven como "SKIP".
- Conservacion de honorificos japoneses (-san, -kun, Senpai, etc.).
- Generacion opcional de entradas de glosario de nombres mediante la clave `_names`.
- Conversacion y generacion de texto heredadas del modelo base Gemma 4 E2B-it.
- Soporte multimodal heredado del base (image-text-to-text), aunque el ajuste no lo utiliza ni lo documenta.

## Casos de uso

- Traduccion automatizada de manga en el pipeline KZRS: el modelo recibe el prompt OCR de KZRS (`build_ocr_prompt`) y devuelve el JSON que el sistema espera, por lo que se integra sin adaptadores adicionales en el flujo de traduccion por lotes.
- Pre-traduccion de dialogos y narracion para revision humana: al conservar honorificos y marcar SKIP, reduce el trabajo manual del editor, que solo revisa el texto traducido y los casos dudosos.
- Limpieza de OCR ruidoso: el modelo filtra onomatopeyas y etiquetas de personaje que no deben traducirse, evitando que el revisor reciba ruido en el texto final.
- Generacion de glosarios de personajes: la clave `_names` permite construir de forma incremental un glosario de nombres consistente entre capitulos.
- Traduccion japones-ingles de material textual corto (frases de Tatoeba, dialogos de estilo manga) fuera del contexto de KZRS, con la advertencia de que otros prompts no estan probados.
- Prototipado de pipelines de traduccion de bajo coste: al ser un modelo pequeno con build GGUF Q4_K_M, permite desplegar un traductor especializado en hardware modesto para pruebas de concepto.
- Traduccion ingles-indonesio de dialogos de estilo manga en flujos experimentales, asumiendo que esta direccion no forma parte del entrenamiento y requiere revision.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto sintetico pequeno (67 elementos, todos de origen japones). Las columnas de chrF corresponden al idioma destino.

| Modelo | chrF JA→ID | chrF JA→EN | SKIP correcto (JA→ID / JA→EN) |
|---|---|---|---|
| Gemma 4 E2B-it (base) | 59,9 | 70,5 | 0/15 / 0/15 |
| KazeGemPT v1 | 63,6 | 68,1 | 15/15 / 15/15 |
| Qwen3.8-27B-FP8 (profesor) | 63,1 | 74,6 | 11/15 / 8/15 |

El autor senala que el chrF japones-ingles es inferior al del modelo base principalmente porque chrF compara contra una unica referencia y muchas diferencias son parafrasis validas. El conjunto de prueba es pequeno, por lo que diferencias de pocos puntos no son fiables. En cinco paginas reales de manga procesadas con KZRS, la salida fue natural y respeto las reglas de SKIP para nombres y onomatopeyas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10-11 GB solo para pesos (5.100 millones de parametros a 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion GGUF Q4_K_M: alrededor de 3-4 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: A100 o H100 para despliegue en bf16 con throughput alto; RTX 4090 (24 GB) para bf16 en una sola tarjeta.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas en bf16 (con margen ajustado) y en tarjetas de 6-8 GB con la build GGUF Q4_K_M.
- Opciones de despliegue: transformers (formato nativo), llama.cpp u Ollama mediante el GGUF Q4_K_M, y servidores compatibles con la API de endpoints (el repositorio esta marcado como endpoints_compatible). vLLM y TGI no estan documentados por el autor para este modelo.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KazeGemPT-E2B-it | 5.100 M (2B efectivos) | no disponible | Traduccion manga JA/EN→ID/EN en JSON KZRS | Apache-2.0 | Hugging Face (safetensors + GGUF Q4_K_M) |
| google/gemma-4-E2B-it (base) | 5.100 M (2B efectivos) | no disponible | Modelo multimodal general | Apache-2.0 segun el ajuste | Hugging Face |
| Qwen3.8-27B-FP8 (profesor) | 27.000 M (FP8) | no disponible | Traduccion general de alta calidad | Apache-2.0 | Uso como profesor en el entrenamiento |

La comparativa relevante es contra el modelo base: KazeGemPT mejora el chrF JA→ID (63,6 frente a 59,9) y resuelve por completo la clasificacion SKIP (15/15 frente a 0/15), a costa de un chrF JA→EN algo inferior (68,1 frente a 70,5). Frente al profesor de 27B, el modelo pequeno iguala o supera la precision de SKIP y se acerca en chrF JA→ID, con un coste de inferencia mucho menor.

## Limitaciones y advertencias

- La traduccion ingles→indonesio no forma parte de los datos de entrenamiento y no se evaluo en el conjunto de prueba; solo funciono en dos paginas reales en ingles.
- El texto compuesto unicamente por puntuacion (por ejemplo, un "..." o "...?") puede devolverse como SKIP.
- Los terminos aislados 先生 y 先輩 se filtraron del entrenamiento, por lo que el modelo puede traducirlos como "Guru" o "Kak" en lugar de conservar Sensei/Senpai.
- El OCR ruidoso puede dejar restos en la traduccion; el autor recomienda revisar siempre la salida.
- Al ser un modelo pequeno (2B parametros efectivos), se esperan errores con jerga, frases largas y vocabulario poco frecuente.
- Solo esta probado con el prompt OCR de KZRS (`build_ocr_prompt`); otros prompts no han sido validados.
- El conjunto de evaluacion es sintetico y de solo 67 elementos, por lo que las metricas tienen alta incertidumbre.
- Licencia Apache-2.0 permite uso comercial, pero las frases de Tatoeba estan bajo CC-BY 2.0 FR y requieren atribucion.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al derivar de Gemma 4, hereda los sesgos y riesgos del modelo base.
- Riesgo de alucinacion en traducciones de vocabulario raro o contextos ambiguos, agravado por el tamano reducido del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it
- Build GGUF Q4_K_M: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Tatoeba (fuente de frases, CC-BY 2.0 FR): https://tatoeba.org
