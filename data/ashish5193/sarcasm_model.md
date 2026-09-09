# ashish5193/sarcasm_model

## Resumen

El modelo `sarcasm_model` es un clasificador binario de texto desarrollado por ashish5193 para detectar sarcasmo en textos en hindi y hinglish. Se construye mediante ajuste fino (fine-tuning) del modelo `cardiffnlp/twitter-roberta-base-sentiment-latest`, un transformer encoder-only basado en la arquitectura RoBERTa. Con 124.647.170 parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo. Su principal aportación es ofrecer una herramienta específica para el análisis de sarcasmo en un dominio lingüístico poco cubierto por modelos generalistas. La información disponible no incluye la longitud de contexto ni la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en RoBERTa |
| Parámetros totales | 124.647.170 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Hindi y Hinglish |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `cardiffnlp/twitter-roberta-base-sentiment-latest`, que a su vez es una variante de RoBERTa entrenada para análisis de sentimiento en tuits. Se trata de un transformer encoder-only, por lo que no está diseñado para generación de texto, sino para clasificación. El ajuste se realizó con el conjunto de datos `Huggmachas/Sarcasm_dataset`, compuesto por 5.250 muestras: 4.746 no sarcásticas (etiqueta 0) y 504 sarcásticas (etiqueta 1). El entrenamiento se ejecutó con Hugging Face Transformers durante 3 épocas, con una tasa de aprendizaje de 2e-5 y un tamaño de lote de 16. No se documentan innovaciones técnicas destacables más allá de un fine-tuning estándar.

## Capacidades

- Detección binaria de sarcasmo: clasifica textos en hindi y hinglish como sarcásticos (1) o no sarcásticos (0).
- Especializado en textos cortos con estilo Twitter, así como en marcadores explícitos de sarcasmo (#Sarcasm, #Irony).
- Se integra con la interfaz de pipeline de Hugging Face para clasificación de texto.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Cobertura lingüística limitada al hindi y al hinglish; no cubre otros idiomas.
- Entrenado con un conjunto de datos pequeño (5.250 muestras) y muy desequilibrado, lo que condiciona su generalización.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede usarse como preprocesador para separar tuits sarcásticos de los genuinos antes de aplicar un clasificador de sentimiento. Es adecuado porque está especializado en texto estilo Twitter en hindi y hinglish.
- Moderación de contenido: plataformas que admiten comentarios en hindi pueden filtrar contenido sarcástico de forma automática. Su tamaño pequeño permite integrarlo en servicios de inferencia con baja latencia.
- Monitorización de marca: las empresas pueden escanear menciones en redes sociales de la India y detectar si una crítica es sarcástica para priorizar quejas genuinas. Resulta útil gracias a su capacidad para identificar patrones de sarcasmo en textos cortos.
- Investigación en NLP: puede utilizarse como modelo de referencia en estudios sobre sarcasmo en mezcla de código hindi-inglés. Su tamaño reducido facilita la replicación y la comparación en trabajos académicos.
- Análisis de opinión política: clasificar tuits sarcásticos sobre candidatos o partidos en la India. El modelo funciona bien en este dominio porque los debates políticos en Twitter suelen incluir hashtags, que son señales en las que se basa el modelo.
- Sistemas de recomendación: la detección de sarcasmo puede servir como señal de engagement o para ajustar la personalización. Por ejemplo, si un usuario publica tuits sarcásticos sobre un tema, el sistema puede adaptar el contenido recomendado. El modelo es lo bastante rápido para integrarse en pipelines en tiempo real.
- Chatbots de atención al cliente: detectar sarcasmo en mensajes de usuarios en hindi para escalar la conversación a un agente humano. Aunque el modelo está entrenado en tuits, puede funcionar como primer filtro antes de un análisis más profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación (0,1256), sin comparación con otros modelos. No se dispone de datos de exactitud, precisión, recall ni F1.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 0,5 GB. En float16, la VRAM necesaria para inferencia es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 2060, GTX 1650, RTX 3050). También puede ejecutarse en CPU.
- La escala es de consumidor: cabe en GPU domésticas e incluso en entornos con VRAM limitada.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), ONNX Runtime, TorchServe y FastAPI sobre CPU o GPU.
- Latencia: no disponible. Al ser un modelo pequeño, se espera una latencia baja en hardware moderno, aunque no hay datos concretos.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables ni datos de benchmarking frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El conjunto de entrenamiento está muy desequilibrado (4.746 muestras no sarcásticas frente a 504 sarcásticas), lo que puede sesgar la predicción hacia la clase mayoritaria.
- El modelo tiende a depender de marcadores explícitos como #Sarcasm o #Irony; puede no detectar sarcasmo conversacional que carezca de dichos indicadores.
- No se han publicado métricas de precisión, recall ni F1; solo se reporta la pérdida de validación (0,1256), lo que dificulta evaluar su rendimiento real.
- La licencia no está especificada, lo que puede impedir el uso comercial sin autorización explícita del autor.
- Es un clasificador binario y no ofrece capacidades generativas ni soporte para otros idiomas más allá del hindi y el hinglish.
- El dominio de aplicación se limita a textos cortos tipo tweet; puede no generalizar a documentos largos o a conversaciones informales sin hashtags.

## Enlaces

- Hugging Face: https://huggingface.co/ashish5193/sarcasm_model
- No se han encontrado otros enlaces relevantes en la búsqueda web.
