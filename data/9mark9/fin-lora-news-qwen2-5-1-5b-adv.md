# 9mark9/fin-lora-news-qwen2.5-1.5b-adv

## Resumen

`fin-lora-news-qwen2.5-1.5b-adv` es un adaptador LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Nagizaaz Shaik (usuario `9mark9`), que clasifica texto financiero corto en inglés (titulares, tuits y fragmentos de noticias) en tres clases: Bearish, Bullish y Neutral. El modelo base sigue siendo un modelo de lenguaje causal; la etiqueta se obtiene leyendo los logits de tres tokens de etiqueta en la última posición de un prompt fijo, sin generar texto. Los identificadores de etiqueta son 0 Bearish, 1 Bullish y 2 Neutral.

La propuesta diferencial es la robustez frente a manipulación del input: se entrenó con aumento de frases plantadas (una frase de etiqueta aleatoria insertada en la mitad aleatoria de los textos de entrenamiento en cada época, manteniendo la etiqueta verdadera), usando 20 plantillas de entrenamiento. Según el autor, esto eleva la precisión bajo frases plantadas del demo al 91,1 %, frente al 50,6 % del adaptador estándar de 1,5B, manteniendo un 90,8 % de precisión limpia. Aun así, párrafos persuasivos más largos siguen degradando el resultado hasta el 75,0 %.

El adaptador tiene 18.464.768 parámetros (contados desde `adapter_model.safetensors`) sobre un modelo base de 1.543.714.304 parámetros. Está pensado para investigación y educación sobre clasificación de sentimiento financiero y su susceptibilidad a la manipulación textual, no para decisiones de inversión ni trading automatizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only causal (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (modelo base); adaptador LoRA: 18.464.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 256 tokens en el prompt de clasificación |
| Tipos de cuantizacion | GGUF (tag declarado); cuantizaciones concretas no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only causal. La clasificación no genera texto: se construye un prompt fijo y se leen los logits de tres tokens de etiqueta en la última posición, con entropía cruzada como objetivo sobre esos tres logits. La configuración LoRA es r=16, alpha=32, dropout 0,05, sin bias, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento usó 17.770 ejemplos tras deduplicación, procedentes de tres fuentes: `zeroshot/twitter-financial-news-sentiment` (8.424 tuits, 90 % del split de entrenamiento), `Jean-Baptiste/financial_news_sentiment` (1.346 titulares validados manualmente) y `NOSIBLE/financial-sentiment` (8.000 fragmentos con etiquetas generadas por un ensemble de LLM). Se aplicó higiene de datos: eliminación de textos de entrenamiento que coinciden con ítems de dev o test tras normalizar (minúsculas, sin puntuación, sin URLs) y eliminación de duplicados internos. El optimizador fue AdamW con learning rate pico 1e-4, weight decay 0,01, schedule one-cycle con 5 % de warm-up, clipping de gradiente 1,0, batch 16, 2 épocas, pesos base en bfloat16 y gradient checkpointing. La innovación destacable es el aumento con frases plantadas para robustez adversarial: en cada época, la mitad aleatoria de los textos recibe una frase de etiqueta plantada (etiqueta aleatoria, etiqueta verdadera conservada) extraída de 20 plantillas de entrenamiento; ninguna de las cuatro formulaciones del demo ni de las tres formulaciones retenidas se usó en entrenamiento. El truncado se aplica solo al texto, nunca al prompt, de modo que el cue final `Sentiment:` siempre sobrevive.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (Bearish, Bullish, Neutral) sobre texto corto en inglés: titulares, tuits y fragmentos de noticias.
- Lectura de etiqueta por logits de tokens, sin generación de texto libre (el modelo base sigue siendo causal y puede generar, pero el uso previsto es la clasificación).
- Robustez entrenada frente a frases de etiqueta plantadas de una sola oración (20 plantillas de entrenamiento, más formulaciones no vistas en el demo).
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es el objetivo del adaptador).
- Capacidades especiales: adaptador PEFT con pesos en safetensors y variante GGUF para despliegue.

## Casos de uso

- Monitorización de sentimiento de titulares financieros: clasificar titulares de prensa económica en tiempo real para alimentar paneles de sentimiento agregado, aprovechando la ventana de 256 tokens y la latencia baja de un modelo de 1,5B.
- Análisis de sentimiento en redes sociales financieras: procesar tuits sobre activos concretos con el adaptador entrenado específicamente sobre `twitter-financial-news-sentiment`, útil para estudios de opinión de mercado.
- Investigación sobre robustez adversarial: evaluar cómo frases insertadas en el input alteran la etiqueta predicha, usando el adaptador como sujeto de estudio frente a su variante no robusta.
- Filtrado y triaje de noticias en pipelines de datos: etiquetar grandes volúmenes de fragmentos de noticias antes de un análisis posterior, gracias al bajo coste de inferencia de un modelo de 1,5B.
- Docencia y formación en NLP financiero: demostrar clasificación por lectura de logits y entrenamiento LoRA con aumento adversarial en un modelo pequeño y desplegable en hardware consumer.
- Evaluación comparativa de adaptadores LoRA: usar este adaptador como referencia de robustez frente a otras variantes sobre el mismo modelo base para experimentos de investigación reproducibles.
- Prototipado rápido de clasificadores de sentimiento: servir el adaptador vía PEFT/transformers o GGUF para validar una idea de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`).

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificación de sentimiento financiero | Twitter Financial News Sentiment (test held-out, solapamiento de entrenamiento eliminado) | Clean accuracy | 0,908 |
| Clasificación de sentimiento financiero | Twitter Financial News Sentiment (test held-out) | Clean macro-F1 (3 clases) | 0,884 |

Resultados adicionales citados en la model card (declarados por el autor, sin tabla de benchmark formal): 91,1 % de precisión bajo las frases plantadas del demo frente al 50,6 % del adaptador estándar de 1,5B; 75,0 % de precisión con párrafos persuasivos held-out sobre tuits de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,5B en bfloat16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y del adaptador LoRA (18,5 M de parámetros); en cuantización de 4 bits el peso baja a alrededor de 1 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo base cabe en GPUs consumer modernas.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no se documenta oficialmente.
- Opciones de despliegue: PEFT + transformers (formato safetensors), GGUF (tag declarado, compatible con llama.cpp/Ollama en función de la build). vLLM y TGI no se documentan para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fin-lora-news-qwen2.5-1.5b-adv | 1,5B base + 18,5M adaptador | 256 tokens (prompt de clasificación) | LoRA con aumento adversarial sobre Qwen2.5-1.5B-Instruct | apache-2.0 | Hugging Face (adaptador + GGUF) |
| Adaptador estándar de 1,5B (referencia del autor) | 1,5B base + adaptador | no disponible | LoRA sin aumento adversarial | no disponible | citado en la model card |
| fin-lora-news-qwen2.5-0.5b-adv (misma familia) | 0,5B base + adaptador | no disponible | LoRA con aumento adversarial sobre Qwen2.5-0.5B-Instruct | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo la comparación de robustez declarada por el autor (91,1 % frente a 50,6 % bajo frases plantadas del demo).

## Limitaciones y advertencias

- No es asesoramiento financiero ni predicción de movimiento de precios; no debe usarse para trading automatizado ni para decisiones que muevan dinero.
- Añadir una sola frase al input sigue cambiando la etiqueta en una parte de los ítems; con párrafos persuasivos held-out la precisión cae al 75,0 % sobre tuits de test.
- No evaluado en informes regulatorios (filings), transcripciones de llamadas de resultados, texto no inglés ni entradas de más de 256 tokens.
- Solo soporta inglés; no se declara capacidad multilingüe.
- Riesgo de sesgo y alucinación: no documentado explícitamente, pero las etiquetas de `NOSIBLE/financial-sentiment` son generadas por un ensemble de LLM, lo que puede introducir ruido y sesgos en el entrenamiento.
- La procedencia de las etiquetas de `zeroshot/twitter-financial-news-sentiment` no está documentada en la tarjeta del dataset.
- Licencia apache-2.0 en el adaptador; deben respetarse las condiciones de atribución del dataset NOSIBLE (ODC-By 1.0).
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- El adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct; el repo del adaptador ocupa 5,8 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-1.5b-adv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Demo: https://huggingface.co/spaces/9mark9/fin-lora-attack-demo
- Código y write-up: https://github.com/shaikn6/fin-lora
- Dataset Twitter Financial News Sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Financial News Sentiment (Jean-Baptiste): https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Dataset NOSIBLE financial-sentiment: https://huggingface.co/datasets/NOSIBLE/financial-sentiment
