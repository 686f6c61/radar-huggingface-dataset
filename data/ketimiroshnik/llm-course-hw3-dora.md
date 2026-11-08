# ketimiroshnik/llm-course-hw3-dora

## Resumen
`ketimiroshnik/llm-course-hw3-dora` es un ajuste fino (fine-tuning) del modelo `OuteAI/Lite-Oute-1-300M-Instruct` orientado a una tarea muy concreta: clasificar la tonalidad de un tuit y responder con una única palabra entre `negative`, `neutral` o `positive`. Lo desarrolla Kate Miroshnik (usuario `ketimiroshnik`) en el contexto de un curso de LLM, y el ajuste se realiza con una implementación propia de DoRA (Weight-Decomposed Low-Rank Adaptation) aplicada a las proyecciones `k_proj` y `v_proj`, con rango 8 y alpha 16. El modelo base es un transformer decoder de aproximadamente 300 millones de parametros, con licencia no especificada en la model card y entrenado originalmente para instrucciones en ingles.

El problema que resuelve es acotado: convertir un modelo de instrucciones generico en un clasificador de sentimiento de una sola palabra, usando el split `sentiment` del dataset `cardiffnlp/tweet_eval`. El resultado reportado es un macro F1 de 0,5076 sobre el test completo (12.284 ejemplos), frente a 0,1674 del modelo base sin ajustar. Es, por tanto, una pieza de experimentacion academica y no un modelo listo para produccion: repite tokens, se corta por el limite de generacion y su licencia comercial no esta declarada.

Su relevancia es limitada fuera del ambito del curso, pero resulta util como referencia practica de DoRA sobre modelos pequenos, como ejemplo de evaluacion con macro F1 sobre cuatro etiquetas (incluida la respuesta vacia) y como caso de estudio de los problemas tipicos al adaptar modelos de 300M a tareas de clasificacion con generacion autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de OuteAI/Lite-Oute-1-300M-Instruct); adaptadores DoRA en `k_proj` y `v_proj` |
| Parametros totales | 300.049.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), con definiciones de capas custom en `custom_layers.py` y cargador en `load_model.py` |

## Arquitectura y entrenamiento
El modelo parte de `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder de unos 300M de parametros. Sobre el se aplica un ajuste con DoRA, una variante de LoRA que descompone el peso actualizado en magnitud y direccion; en este caso la implementacion es propia ("самописная dora") y se aplica a las proyecciones `k_proj` y `v_proj` con rango `r=8` y `alpha=16`, entrenando ademas de forma separada la magnitud del peso. El entrenamiento usa los primeros 10.000 ejemplos del split de entrenamiento del dataset `cardiffnlp/tweet_eval` (configuracion `sentiment`), durante 3 epocas, con `lr=5e-4`, batch de 16, semilla 42 y una A100 de 80 GB. No se documenta el numero total de tokens vistos, la composicion exacta del dataset mas alla de `tweet_eval`, ni si hubo RLHF, DPO o etapas de alineamiento adicionales.

La innovacion tecnica destacable es el uso de DoRA en lugar de LoRA estandar sobre un modelo pequeno, junto con un prompt de sistema fijo que fuerza una respuesta de una sola palabra. La model card documenta un comportamiento problematico: el modelo tiende a repetir la etiqueta (`neutral neutral neutral neut`) y se corta por el limite de 16 tokens nuevos; la funcion de evaluacion toma la primera etiqueta encontrada, lo que explica parte del F1 reportado. Los pesos se guardan sin modificaciones respecto al estado entrenado y la recarga se verifico en GPU comprobando todas las claves.

## Capacidades
- Generacion de texto autoregresiva en ingles, heredada del modelo base.
- Clasificacion de sentimiento de tuits en tres clases: `negative`, `neutral`, `positive`.
- Seguimiento de un prompt de sistema fijo para forzar respuestas de una palabra.
- Conversacion basica por chat template (`apply_chat_template`), aunque el ajuste esta orientado a una unica tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Clasificacion de sentimiento en tuits para analisis de opinion: el modelo recibe el texto y devuelve una etiqueta de una palabra, adecuado para pipelines de etiquetado masivo donde la latencia importa mas que la precision absoluta.
- Filtrado de menciones en redes sociales: integrar el modelo en un flujo que marque menciones negativas para revision humana, usando el macro F1 de 0,5076 como referencia de calidad y no como garantia.
- Prototipado academico de DoRA: servir como referencia reproducible para comparar DoRA frente a LoRA en modelos de 300M sobre una tarea de clasificacion.
- Experimentos de evaluacion: usar el modelo como ejemplo de evaluacion con macro F1 sobre cuatro etiquetas (incluida la respuesta vacia), util en docencia y en pruebas de harness de evaluacion.
- Generacion de etiquetas auxiliares en un corpus de tweets: preetiquetar un subconjunto y revisar manualmente las discrepancias, dado el riesgo de repeticion de tokens.
- Demostracion de despliegue en hardware modesto: al tener 300M de parametros, cabe en GPU de consumo y sirve para probar pipelines de inferencia con `transformers` y `text-generation-inference`.

## Benchmarks y rendimiento
Resultados reportados en la model card sobre el test completo de `cardiffnlp/tweet_eval` (configuracion `sentiment`, 12.284 ejemplos), con macro F1 calculado sobre cuatro etiquetas (tres clases mas respuesta vacia):

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Macro F1 (test completo) | 0,1674 | 0,5076 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se dispone de comparaciones con modelos de referencia en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: en torno a 0,6 GB solo para pesos (300M parametros), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB.
- En cuantizacion de 8 bits, aproximadamente 0,3 GB de pesos; en 4 bits, en torno a 0,15 GB, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno en A100 de 80 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con los scripts `load_model.py` y `custom_layers.py` proporcionados; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se documenta configuracion. No se publican artefactos GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketimiroshnik/llm-course-hw3-dora | 300M | no disponible | Clasificacion de sentimiento en tuits (3 clases) | no disponible | Hugging Face, 0 descargas |
| OuteAI/Lite-Oute-1-300M-Instruct | 300M | no disponible | Generacion de texto e instrucciones en ingles | no disponible en esta ficha | Hugging Face (modelo base) |
| Modelos de clasificacion de sentimiento tipo RoBERTa-base ajustados en tweet_eval | ~125M | 512 tokens | Clasificacion de sentimiento | variable segun checkpoint | Amplia disponibilidad en Hugging Face |

La comparacion con clasificadores dedicados tipo RoBERTa es la mas relevante: un encoder de 125M ajustado para clasificacion suele superar en F1 a un decoder de 300M forzado a generar etiquetas, y ademas evita el problema de repeticion de tokens documentado. No se dispone de datos de benchmarks comparativos en la informacion proporcionada para cuantificar esa diferencia.

## Limitaciones y advertencias
- El modelo repite la etiqueta en la salida (`neutral neutral neutral neut`) y se corta por el limite de 16 tokens nuevos; la evaluacion toma la primera etiqueta encontrada, lo que puede inflar o distorsionar el F1 real.
- Macro F1 de 0,5076 sobre el test completo: insuficiente para uso en produccion sin revision humana.
- Solo soporta ingles; no se documenta comportamiento en otros idiomas.
- Entrenado unicamente con los primeros 10.000 ejemplos del split de entrenamiento, lo que limita la cobertura de dominios y estilos.
- Riesgo de alucinacion y de respuestas fuera de las tres etiquetas esperadas; el prompt de sistema es imprescindible.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Sin cuantizaciones oficiales ni artefactos GGUF; el despliegue requiere los scripts custom (`load_model.py`, `custom_layers.py`) en la misma carpeta.
- Modelo de curso con 0 descargas y 0 likes: sin validacion externa ni mantenimiento documentado.
- No se documenta longitud de contexto; no debe asumirse ninguna ventana concreta.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ketimiroshnik/llm-course-hw3-dora
- Perfil del autor: https://huggingface.co/ketimiroshnik/models
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Pagina de despliegue en Featherless (referenciada en la busqueda web): https://featherless.ai/models/artarif/llm-course-hw3-dora
