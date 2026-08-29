# jjjardev/tagasenti_model

## Resumen

**tagasenti_model** es un modelo de clasificación de sentimiento ternario (negativo, neutral, positivo) especializado en tagalo y taglish, la variante de code-switching entre tagalo e inglés muy común en Filipinas. Desarrollado por Jessie James Jarder (jjjardev), consiste en un fine-tuning de **XLM-RoBERTa-large** (355 millones de parámetros, vocabulario SentencePiece de 250K) sobre el dataset **TagaSenti v6**, que combina datos reales de reseñas de comercio electrónico, noticias y comentarios de redes sociales con aumentación adversarial generada por LLM para abordar sarcasmo, negación y matices de atenuación.

El modelo alcanza un **84,8% de accuracy y macro-F1** en el conjunto de test tagalo, y muestra cierta capacidad de transferencia zero-shot a otras lenguas filipinas como el hiligaynon (58,6% F1). Su relevancia radica en abordar una lengua de bajos recursos con alta variabilidad de code-switching, un problema poco cubierto por los modelos multilingües genéricos. Se distribuye bajo licencia Apache 2.0 y está pensado para tareas de análisis de opinión en entornos filipinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 355 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (base), truncado a 128 en el fine-tuning |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tagalo, taglish (code-switching), ingles (limitado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Transformers (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de **XLM-RoBERTa-large**, un transformer encoder multilingüe preentrenado con 355M de parámetros y un vocabulario SentencePiece de 250K subpalabras. El fine-tuning se realizó sobre el dataset **TagaSenti v6**, que contiene 35.686 frases (deduplicadas a ~34.945) con etiquetas de sentimiento en tres clases. La capa base de datos reales incluye reseñas de Shopee/Lazada (FiReCS), productos y servicios (SentiTaglish), reseñas de Amazon traducidas al tagalo, noticias etiquetadas sintéticamente y comentarios de TikTok. Sobre esta base se añadieron **10.686 filas de aumentación adversarial** en cuatro generaciones, generadas con LLMs (Gemini 3.1 Pro, Deepseek V4 Pro) para cubrir sarcasmo, negación, deseos, quejas indirectas, preguntas retóricas y expresiones idiomáticas.

El entrenamiento se realizó en 3 épocas con split estratificado 80/10/10 (seed 42), alcanzando un pico de validación de 0.863 en el paso 2400. El desarrollo completo se llevó a cabo en 9 días usando la capa gratuita de Colab (Tesla T4) con coste cero. No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente supervisado con aumentación dirigida.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutral, positivo) para texto en tagalo y taglish.
- Manejo de code-switching tagalo-ingles, incluyendo mezcla de idiomas dentro de una misma frase.
- Transferencia zero-shot parcial a hiligaynon (58,6% F1) y potencialmente a otras lenguas filipinas cercanas.
- Robustez relativa frente a sarcasmo, negacion y atenuacion gracias a la aumentacion adversarial.
- Soporte para inferencia en pipelines de transformers (text-classification) y compatibilidad con endpoints de Hugging Face.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente texto.

## Casos de uso

- **Analisis de resenas de comercio electronico**: el modelo puede clasificar opiniones de compradores en Shopee, Lazada y otras plataformas filipinas, permitiendo a los vendedores agregar puntuaciones de satisfaccion por producto o categoria.
- **Monitorizacion de redes sociales**: seguimiento de comentarios en TikTok, Facebook y Twitter (X) en tagalo/taglish para detectar tendencias de opinion publica sobre marcas, politicos o eventos.
- **Analisis de noticias y opinion publica**: clasificacion de articulos y comentarios de portales como NewsPH para medir el sentimiento hacia temas politicos, economicos o sociales.
- **Investigacion en lenguas de bajos recursos**: el modelo sirve como punto de partida para estudios sobre code-switching, transferencia cross-lingual y aumentacion de datos en lenguas filipinas.
- **Aplicaciones civicas y educativas**: herramientas de retroalimentacion ciudadana, encuestas de satisfaccion en servicios publicos o analisis de comentarios en foros educativos.
- **Moderacion asistida de contenido**: pre-filtrado de comentarios toxicos o negativos en comunidades online filipinas, siempre con supervision humana dado el riesgo de error en casos complejos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy (test TagaSenti v6) | 0.848 |
| Macro F1 (test TagaSenti v6) | 0.848 |
| Transferencia zero-shot a Hiligaynon (HiliSenti) | 0.586 F1 |
| Pico de validacion durante entrenamiento | 0.863 (step 2400) |

El autor tambien reporta que la version v4 del modelo (entrenada sobre 32.179 filas) alcanzo 0.866 de F1 en test y 0.624 en HiliSenti, pero no se publicaron los pesos de esa version. No se han publicado comparaciones con otros modelos de analisis de sentimiento para tagalo en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 355M de parametros, en FP32 requiere aproximadamente 1,4 GB de memoria; en FP16 baja a ~700 MB. No se han publicado cuantizaciones oficiales, pero podria ejecutarse en GPU con 2-4 GB si se convierte a int8 o se usa cuantizacion de 4 bits.
- **GPU recomendadas**: una Tesla T4 (16 GB) es mas que suficiente; tambien puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores. En CPU es viable para inferencia por lotes pequenos, aunque con mayor latencia.
- **Opciones de despliegue**: al ser un modelo de transformers, se puede servir con vLLM, TGI (Text Generation Inference) o directamente con la libreria transformers. No se proporcionan pesos en GGUF, por lo que no es compatible con llama.cpp u Ollama sin conversion previa.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Como referencia, un modelo de este tamano en una T4 suele procesar cientos de frases por segundo en inferencia por lotes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para analisis de sentimiento en tagalo/taglish en la documentacion proporcionada. El autor menciona que el modelo base XLM-RoBERTa-large es una opcion generica multilingue, pero no se aportan datos de comparacion con otros fine-tunings. Se recomienda consultar el repositorio de GitHub para posibles referencias adicionales.

## Limitaciones y advertencias

- **Solo tres clases gruesas**: no detecta emociones finas (alegria, ira, sarcasmo como categoria independiente); el sarcasmo se aborda de forma implicita pero no se etiqueta.
- **Error elevado en expresiones idiomaticas**: el autor reporta un 47% de error en frases con modismos (8 de 17 errores adversariales), lo que limita su uso en textos muy coloquiales.
- **Truncamiento a 128 tokens**: frases largas o documentos se cortan, perdiendo contexto. El percentil 99 de longitud en el dataset es de 71-72 tokens, pero textos mas extensos degradan el rendimiento.
- **Transferencia limitada a otras lenguas**: solo se evaluo hiligaynon con resultados parciales; cebuano e ilokano no han sido probados y no se recomienda su uso sin validacion.
- **Sesgos potenciales**: los datos sinteticos generados por LLM pueden introducir sesgos de estilo o contenido; ademas, la capa de noticias proviene de un unico medio (NewsPH) y la de redes sociales de TikTok, lo que puede limitar la generalizacion a otros dominios.
- **No apto para decisiones de alto riesgo**: el autor desaconseja su uso en moderacion estricta, contextos legales o financieros sin verificacion humana.
- **Licencia Apache 2.0**: permite uso comercial, pero el dataset TagaSenti se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribucion y compartir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjjardev/tagasenti_model
- Dataset TagaSenti en Hugging Face: https://huggingface.co/datasets/jjjardev/tagasenti
- Repositorio GitHub: https://github.com/jjjardev/tagasenti
- Modelo relacionado (hiligaynon): https://huggingface.co/jjjardev/hilisenti-v1-model
