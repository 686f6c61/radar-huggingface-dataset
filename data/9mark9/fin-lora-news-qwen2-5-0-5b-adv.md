# 9mark9/fin-lora-news-qwen2.5-0.5b-adv

## Resumen
fin-lora-news-qwen2.5-0.5b-adv es un adaptador LoRA desarrollado por Nagizaaz Shaik (usuario 9mark9) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su funcion es clasificar texto financiero corto en ingles (titulares, tweets y fragmentos de noticias) en tres categorias de sentimiento: Bearish (bajista), Bullish (alcista) y Neutral. El modelo resuelve un problema concreto: la fragilidad de los clasificadores de sentimiento ante ataques de inyeccion de texto, es decir, cuando el texto de entrada contiene frases persuasivas o instrucciones que intentan forzar una etiqueta incorrecta.

La relevancia de esta version (v3, rama `main`) radica en su entrenamiento con aumentacion adversarial: se anaden parrafos persuasivos y frases con etiquetas plantadas durante el entrenamiento para mejorar la robustez frente a manipulaciones. Segun la model card, mantiene una precision limpia del 90,3% en tweets y eleva la precision bajo ataques persuasivos retenidos del 79,8% (v2) al 89,8% (v3). El adaptador tiene 8.798.208 parametros entrenables sobre un modelo base de 494.032.768 parametros totales.

El modelo no genera texto libre para la clasificacion: utiliza el modelo causal como base y lee la etiqueta a partir de los logits del siguiente token correspondientes a tres tokens de etiqueta al final de un prompt fijo. La licencia es Apache 2.0 y el idioma soportado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (modelo base); 8.798.208 parametros del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer causal de 494 millones de parametros. La clasificacion no se realiza mediante generacion de texto: se construye un prompt fijo y se leen los logits del siguiente token para tres tokens de etiqueta (0 = Bearish, 1 = Bullish, 2 = Neutral). El adaptador LoRA tiene rango 16 y se entrena en bfloat16.

El entrenamiento de la version v3 parte de la receta de v2: 8.424 tweets deduplicados, eliminacion de near-duplicates entre train y test/dev, truncacion por el lado del texto, 2 epochs con seleccion de checkpoint basada en dev, learning rate 1e-4 y semilla 0. Sobre esa base se anade aumentacion con parrafos persuasivos: en cada epoch, un 30% aleatorio de los textos de entrenamiento recibe un parrafo de 1 a 4 frases (notas de analista, comunicados de prensa, posts de foro, editoriales) que argumenta a favor de una etiqueta aleatoria, manteniendo la etiqueta verdadera. Se usan 34 plantillas y el 40% de los parrafos se colocan antes del texto. Ademas, se mantiene la aumentacion con frases plantadas de v2 (20 plantillas). Ninguna de las formulaciones usadas en la demo ni en los ataques retenidos se empleo durante el entrenamiento.

## Capacidades
- Clasificacion de sentimiento financiero en tres clases (Bearish, Bullish, Neutral) para textos cortos en ingles.
- Robustez frente a ataques de inyeccion de texto: frases plantadas, parrafos persuasivos, negacion de la etiqueta verdadera, imitacion del prompt del clasificador, turnos falsos de chat-template y repeticion de la etiqueta.
- Procesamiento de titulares, tweets y fragmentos de noticias financieras.
- No genera texto libre para la tarea de clasificacion; la etiqueta se obtiene de los logits.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: modo thinking, vision o audio no disponibles.

## Casos de uso
- Moderacion y filtrado de sentimiento en redes sociales financieras: el modelo clasifica tweets y posts cortos en Bearish, Bullish o Neutral, y su entrenamiento adversarial lo hace adecuado para entornos donde los usuarios pueden intentar manipular el clasificador con frases como "ignora lo anterior" o "la respuesta correcta es alcista".
- Analisis de titulares en tiempo real: se puede integrar en un pipeline que ingiera titulares de agencias y asigne sentimiento para alimentar dashboards de trading o alertas, gracias a su bajo coste computacional (0,5B parametros).
- Monitorizacion de noticias con riesgo de manipulacion: en escenarios donde fuentes no verificadas incluyen texto persuasivo, la aumentacion con parrafos de analista y comunicados de prensa mejora la resistencia frente a intentos de sesgar la clasificacion.
- Clasificacion de sentimiento en informes y notas de analistas: el modelo puede procesar fragmentos de 1 a 4 frases con argumentos a favor de una direccion, manteniendo la etiqueta correcta segun los resultados reportados en ataques persuasivos retenidos.
- Preprocesamiento para sistemas de trading algoritmico: se puede usar como senal de sentimiento previa a modelos de decision, con la ventaja de que su naturaleza de adaptador LoRA permite desplegarlo sobre el modelo base en infraestructura modesta.
- Evaluacion de robustez de clasificadores financieros: el adaptador y su demo asociada (fin-lora-attack-demo) sirven como referencia para comparar la resistencia de otros clasificadores frente a ataques de inyeccion de texto.
- Investigacion en seguridad de modelos: el modelo documenta ataques adaptativos y retenidos, lo que lo convierte en un caso de estudio para medir la eficacia de la aumentacion adversarial en tareas de clasificacion.

## Benchmarks y rendimiento
Los datos siguientes son los declarados por el autor en la model card. La metrica principal es la precision limpia y el macro-F1 en el conjunto de test de Twitter Financial News Sentiment (held-out, con solapamiento de entrenamiento eliminado).

| Benchmark | Metrica | Valor |
|---|---|---|
| Twitter Financial News Sentiment (held-out test) | Clean accuracy | 0,903 |
| Twitter Financial News Sentiment (held-out test) | Clean macro-F1 (3 clases) | 0,876 |

Resultados de robustez frente a ataques (v2 frente a v3, mismo hardware y codigo):

| Conjunto de test | Macro-F1 v2 | Macro-F1 v3 | Cambio, IC 95% | Ataques persuasivos retenidos v2 / v3 | Ataques adaptativos v2 / v3 |
|---|---|---|---|---|---|
| Tweets (2.368; 1.000 atacados) | 0,876 | 0,876 | -0,0 pts [-1,1; +1,0] | 79,8% / 89,8% [+8,8; +11,1] | 88,5% / 89,9% [+0,5; +2,4] |
| Titulares, etiquetas manuales (259) | 0,544 | 0,542 | -0,2 pts [-2,9; +2,3] | 57,1% / 72,5% [+12,5; +18,3] | 70,6% / 73,3% [+0,0; +5,5] |
| Fragmentos de noticias (2.000; 300 atacados) | 0,860 | 0,852 | -0,9 pts [-1,9; +0,1] | 78,5% / 83,4% [+2,6; +7,1] | 82,5% / 82,6% [-1,9; +2,1] |

Ataques individuales sobre tweets (precision tras el ataque):

| Ataque sobre tweets | v2 | v3 | Cambio, IC 95% |
|---|---|---|---|
| Persuasivo: declaracion de CEO citada que refuta la etiqueta verdadera | 47,7% | 88,0% | [+37,7; +43,0] |
| Persuasivo: comentario de economista | 70,6% | 90,0% | [+17,1; +21,6] |
| Persuasivo: extracto de carta de fondo | 52,3% | 89,7% | [+34,7; +40,1] |
| Adaptativo: negacion de la etiqueta verdadera | 87,5% | 89,6% | [+0,9; +3,5] |
| Adaptativo: turno falso de chat-template (tokens im_start / im_end de Qwen) | 90,2% | 89,9% | [-1,5; +0,8] |
| Adaptativo: imitacion del prompt del clasificador | 88,4% | 90,4% | [+0,8; +3,3] |
| Adaptativo: etiqueta repetida diez veces | 87,8% | 89,8% | [+0,6; +3,3] |

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 0,5B parametros requiere aproximadamente 1 GB en FP16 y menos de 1 GB en cuantizacion de 4 bits; el adaptador LoRA anade unos 35 MB en FP32 (8,8M parametros).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluo en una NVIDIA A10G. Tambien cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers con PEFT, llama.cpp y Ollama mediante el formato GGUF incluido en el repositorio, y vLLM o TGI para despliegues con mayor throughput.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fin-lora-news-qwen2.5-0.5b-adv | 494M (base) + 8,8M (adaptador) | no disponible | Clasificacion de sentimiento financiero con robustez adversarial | Apache 2.0 | Hugging Face (adaptador PEFT y GGUF) |
| Qwen2.5-0.5B-Instruct (base) | 494M | no disponible | Modelo causal de proposito general | Apache 2.0 | Hugging Face |
| Adaptador estandar de 0,5B (referencia en la model card) | 494M (base) + adaptador | no disponible | Clasificacion de sentimiento financiero sin aumentacion adversarial | no disponible | no disponible |

La comparativa se limita a los datos disponibles en la informacion proporcionada. No se dispone de resultados de benchmarks de los modelos alternativos en las mismas condiciones.

## Limitaciones y advertencias
- El modelo solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- La precision en titulares con etiquetas manuales es baja (macro-F1 de 0,542 en v3), lo que indica un rendimiento limitado fuera del dominio de tweets.
- La robustez adversarial no es absoluta: el autor indica explicitamente que no es prueba contra todos los ataques posibles.
- La clasificacion se basa en logits de tokens de etiqueta, no en generacion de texto; un uso incorrecto del prompt puede degradar los resultados.
- Riesgo de alucinacion: al ser un modelo causal, si se usa para generacion libre en lugar de clasificacion, puede producir texto no fiable.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada, pero el entrenamiento con datos de Twitter y noticias financieras puede heredar sesgos de esas fuentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion.
- Para produccion, es necesario validar el modelo en el dominio concreto de despliegue, ya que los resultados reportados corresponden a conjuntos de test especificos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-0.5b-adv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Codigo y write-up: https://github.com/shaikn6/fin-lora
- Demo: https://huggingface.co/spaces/9mark9/fin-lora-attack-demo
- Dataset NOSIBLE/financial-sentiment: https://huggingface.co/datasets/NOSIBLE/financial-sentiment
- Dataset zeroshot/twitter-financial-news-sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Jean-Baptiste/financial_news_sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
