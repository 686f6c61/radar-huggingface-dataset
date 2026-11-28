# dulakshi-chamodya/reuters-gpt2-from-scratch

## Resumen

`reuters-gpt2-from-scratch` es un modelo de lenguaje causal de estilo GPT-2 entrenado desde cero (inicialización aleatoria, sin pesos preentrenados) por la usuaria de Hugging Face `dulakshi-chamodya`. El modelo se ha entrenado sobre el dataset `ingeniumacademy/reuters_articles` con el objetivo de modelado de lenguaje causal, es decir, predecir el siguiente token a partir de un contexto previo. Con 30.713.856 parámetros, 6 capas de transformer, 6 cabezas de atención y una dimensión de embedding de 384, se trata de un modelo pequeño orientado a experimentación y a la generación de texto con estilo periodístico.

Su relevancia es acotada: no compite con modelos de propósito general y su interés principal es didáctico y de investigación. Sirve como referencia de un pipeline completo de entrenamiento desde cero (tokenizador propio, dataset específico de noticias de Reuters, barrido de hiperparámetros y evaluación con pérdida de validación y test) y como base para estudiar el comportamiento de modelos pequeños en dominios concretos. La ventana de contexto es de solo 256 tokens y el modelo está entrenado únicamente en inglés.

El modelo se publicó con pesos en formato safetensors y un repositorio de 0,4 GB que incluye la configuración, los ficheros del tokenizador y resultados de experimentos en JSON. No se declara licencia, lo que limita su uso comercial sin aclaración previa por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo GPT-2 (causal LM) |
| Parametros totales | 30.713.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clásica: un transformer decoder-only con 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y dropout de 0,1. La longitud de contexto es de 256 tokens. La inicialización es aleatoria, sin reutilizar pesos de GPT-2 preentrenado, y el tokenizador es propio (`ingeniumacademy/gpt2-reuters-tokenizer`), entrenado presumiblemente sobre el mismo corpus de Reuters. El objetivo de entrenamiento es modelado de lenguaje causal estándar (predicción del siguiente token).

Los datos de entrenamiento provienen del dataset `ingeniumacademy/reuters_articles`, usando como entrada la concatenación del titular del artículo y su cuerpo. La model card documenta tres experimentos con distintos números de épocas y tasas de aprendizaje: `main_5ep` (5 épocas, lr 5e-4, pérdida de validación 4,1630 y de test 3,9650), `ep2` (2 épocas, lr 5e-4, validación 4,7902, test 4,5586) y `lr1e-4` (5 épocas, lr 1e-4, validación 4,9617, test 4,7230). No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; por el tamaño y el planteamiento, es improbable que se hayan aplicado.

## Capacidades

- Generación de texto causal en inglés: continuación de texto a partir de un prompt, especialmente titulares de noticias seguidos de salto de línea para producir un cuerpo de artículo con estilo periodístico.
- Modelado de lenguaje de dominio: el modelo está especializado en el registro y vocabulario del corpus de Reuters, no en conocimiento general.
- Generación condicionada por titular: la model card indica que se le puede pasar un titular y un salto de línea para obtener una continuación tipo noticia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.
- No se documentan capacidades de visión, audio, modo thinking ni decodificación especulativa.

## Casos de uso

- Generación de titulares y cuerpos de noticia sintéticos: el modelo puede producir continuaciones de estilo periodístico a partir de un titular, útil para aumentar datos de entrenamiento o para pruebas de pipelines editoriales, dado que fue entrenado sobre el corpus de Reuters.
- Prototipado de asistentes de redacción: integrado en un editor, puede sugerir el arranque de un artículo a partir de un titular, aunque con 256 tokens de contexto solo cubre fragmentos cortos.
- Investigación sobre entrenamiento desde cero: sirve como referencia reproducible de un pipeline completo (tokenizador, dataset, barrido de hiperparámetros y evaluación), útil para docencia y experimentos controlados.
- Baseline para comparativas de modelos pequeños: al tener pérdidas de validación y test documentadas por experimento, puede usarse como punto de partida para medir mejoras de arquitectura o de datos en dominios periodísticos.
- Aumento de datos para clasificación de noticias: generar variantes de titulares o párrafos para entrenar clasificadores o modelos de extracción con datos escasos.
- Pruebas de infraestructura de inferencia: por su tamaño reducido (30,7 M de parámetros), es adecuado para validar despliegues en CPU o GPU de gama baja antes de pasar a modelos mayores.
- Demostraciones educativas de modelado de lenguaje: permite ilustrar el funcionamiento de un transformer causal y el efecto de la tasa de aprendizaje y las épocas sobre la pérdida, con resultados ya publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y test por experimento:

| Experimento | Epocas | Learning rate | Pérdida validación | Pérdida test |
|---|---:|---:|---:|---:|
| main_5ep | 5 | 0,0005 | 4,1630 | 3,9650 |
| ep2 | 2 | 0,0005 | 4,7902 | 4,5586 |
| lr1e-4 | 5 | 0,0001 | 4,9617 | 4,7230 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (30,7 M de parámetros, ~123 MB de pesos) y del orden de decenas de MB en cuantizaciones de 8 o 4 bits, aunque no se publican ficheros cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en iGPU. Para lotes grandes, una A100 o H100 no aportarían ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: `transformers` de Hugging Face con los pesos safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no publicada; vLLM y TGI son compatibles en teoría pero sobredimensionados para este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| reuters-gpt2-from-scratch | 30,7 M | 256 | no disponible | Hugging Face | Entrenado desde cero en corpus Reuters; solo inglés |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face / OpenAI | Preentrenado en corpus web amplio; mayor contexto y conocimiento general |
| DistilGPT-2 | 82 M | 1.024 | Apache 2.0 | Hugging Face | Destilado de GPT-2; mayor calidad general que un modelo de 30 M entrenado en dominio |
| Modelos GPT-2 pequeños de dominio (varios) | 10-130 M | 256-1.024 | variable | Hugging Face | Alternativas comparables en tamaño y planteamiento, con licencias variables |

No se dispone de benchmarks comparativos publicados para este modelo, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un corpus de noticias de Reuters, puede reproducir sesgos editoriales, geopolíticos y de encuadre presentes en ese medio; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: alto en cualquier tarea de conocimiento factual; el modelo no está alineado ni ajustado con RLHF y su corpus es limitado, por lo que puede generar afirmaciones plausibles pero falsas.
- Limitación de contexto: solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Limitación de idioma: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia: no declarada, lo que impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Calidad: con pérdidas de validación en torno a 4,0-4,8, la perplejidad es elevada y la coherencia del texto generado será limitada; no es adecuado para producción sin una evaluación adicional.
- Escasez de documentación: no se detallan tokens de entrenamiento, composición del dataset ni ficheros cuantizados, lo que dificulta la reproducibilidad completa.
- Advertencia de uso: los textos generados no deben presentarse como información periodística real sin verificación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dulakshi-chamodya/reuters-gpt2-from-scratch
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
