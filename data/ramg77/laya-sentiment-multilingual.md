# Ramg77/laya-sentiment-multilingual

## Resumen

Laya Sentiment Multilingual es un modelo de clasificación de sentimiento binario (positivo/negativo) ajustado por Ramg77 sobre el modelo base convaiinnovations/laya-multilingual, un encoder de tipo mmBERT-base con 321.908.998 parámetros. Forma parte del ecosistema Laya, un motor de decisión no autorregresivo ("System 1") orientado a tareas de clasificación con latencia muy baja, en contraposición a los modelos generativos autorregresivos. El modelo se distribuye con licencia Apache 2.0 y su objetivo declarado es sustituir la inferencia zero-shot del modelo base por un clasificador específico con probabilidades calibradas.

El problema que resuelve es concreto: el modelo base sin ajustar mostraba una precisión de solo el 55,7 % en la tarea de sentimiento binario, con un sesgo muy marcado hacia la clase negativa (99,3 % de acierto en negativos frente a un 12,0 % en positivos). Tras el ajuste fino con 900 ejemplos y calibración por temperature scaling (T=0,9), la precisión en el holdout de 300 ejemplos sube al 88,0 % y el error de calibración esperado (ECE) baja de 0,0534 a 0,0254, eliminando el sesgo de clase.

Es relevante ahora por su planteamiento de despliegue: se exporta a CoreML en FP16 (~647 MB) y se ejecuta en la Neural Engine de Apple Silicon con una latencia de 16 ms en régimen estable, integrándose como herramienta local en un agente mediante un plugin Cordis y una pasarela FastAPI. Cubre tres idiomas (inglés, español y alemán) y está pensado como componente de análisis de contenido, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabecera de decisión no autorregresiva del framework Laya |
| Parametros totales | 321.908.998 (~322 M) |
| Longitud de contexto | No disponible (los datos de entrenamiento son mensajes cortos, media aproximada de 20 tokens) |
| Tipos de cuantizacion | FP16 para CoreML (~647 MB); no se documentan otros formatos cuantizados |
| Idiomas soportados | Inglés (en), español (es), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos base); CoreML FP16 para despliegue; incluye calibration.json |
| Tarea (pipeline) | text-classification (sentimiento binario, tipo de pregunta "noul") |
| Modelo base | convaiinnovations/laya-multilingual |
| Dataset de ajuste | tyqiangz/multilingual-sentiments (Apache 2.0), con la clase neutral eliminada |
| Tamano del repositorio | 0,7 GB |
| Libreria | laya |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya-multilingual, descrito en la model card como un mmBERT-base de 322 M de parámetros. Laya se presenta como un "motor de decisión System 1" no autorregresivo: en lugar de generar texto token a token, recibe una pregunta tipada (en este caso `{"sentiment": {"type": "noul", "instructions": "Does this text express positive sentiment?"}}`) y devuelve una respuesta clasificada con una probabilidad asociada. Sobre esa base se añade una tarea de clasificación de sentimiento binario mediante ajuste fino.

El ajuste se realizó sobre el dataset tyqiangz/multilingual-sentiments, eliminando previamente la clase neutral, con un total de 900 ejemplos de entrenamiento y 300 de holdout (100 por idioma, disjuntos del conjunto de entrenamiento). El método indicado es RLCD (el acrónimo no se desarrolla en la model card), con una tasa de aprendizaje de 3e-5 y mejor época en la primera iteración. Después del ajuste se aplicó temperature scaling con T=0,9 para calibrar las probabilidades, lo que redujo el ECE de 0,0534 a 0,0254. No se documentan detalles sobre el volumen total de tokens vistos, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binario (positivo frente a negativo) en textos cortos.
- Probabilidades calibradas mediante temperature scaling, con ECE de 0,0254, aptas para umbrales de confianza.
- Cobertura multilingüe limitada a inglés, español y alemán.
- Salida simétrica: 88,0 % de precisión tanto en la clase positiva como en la negativa sobre el holdout de evaluación.
- Integración como herramienta (tool calling) en un agente local: la herramienta `laya_sentiment` se registra vía un plugin Cordis dentro de un harness de agente.
- Política de delegación automática: cuando la confianza calibrada baja de 0,75, el sistema escala la consulta a la nube.
- Ejecución local en Apple Silicon mediante CoreML FP16 sobre ANE/GPU, expuesta por una pasarela FastAPI en 127.0.0.1:8090.
- No dispone de generación de texto, razonamiento multi-paso, capacidades de código, matemáticas, visión ni audio.

## Casos de uso

- Análisis de reseñas de producto multilingües: el modelo clasifica opiniones cortas en inglés, español y alemán con la misma tarea binaria, lo que permite agregar métricas de satisfacción por idioma sin mantener tres clasificadores separados.
- Moderación de comentarios en redes sociales: dado que el entrenamiento proviene de datos de redes sociales (mensajes de aproximadamente 20 tokens), encaja en el filtrado de comentarios cortos hostiles o negativos, con revisión humana posterior.
- Monitorización de marca: procesamiento por lotes de menciones para calcular la proporción de sentimiento positivo frente a negativo a lo largo del tiempo, aprovechando las probabilidades calibradas para ponderar los resultados.
- Análisis de encuestas y feedback abierto: clasificación de respuestas de texto libre en formularios tipo NPS o CSAT, usando la confianza calibrada para separar los casos claros de los que requieren revisión manual.
- Etiquetado y enriquecimiento de datasets: la salida calibrada permite usar el modelo como anotador automático de grandes volúmenes de texto corto, marcando para revisión humana todo lo que caiga por debajo del umbral de 0,75.
- Procesamiento local con requisitos de privacidad: al ejecutarse en CoreML sobre Apple Silicon, el texto no sale del dispositivo, lo que lo hace apto para análisis de comunicaciones internas o datos personales sujetos a restricciones de transferencia.
- Componente de un agente híbrido local/nube: la herramienta `laya_sentiment` permite al agente resolver localmente en 16 ms los casos de alta confianza y escalar únicamente los ambiguos, reduciendo coste de API y latencia.
- Análisis de opiniones en soporte técnico: clasificación de tickets o mensajes de usuario para alimentar paneles agregados de satisfacción. No debe usarse para enrutado individual ni decisiones de escalado, como advierte la propia model card.

## Benchmarks y rendimiento

Evaluación sobre un holdout de 300 ejemplos (100 por idioma), disjunto del conjunto de entrenamiento de 900 ejemplos. Intervalos de confianza del 95 % de Wilson.

| Metrica | Zero-shot | Fine-tuned |
|---|---|---|
| Accuracy | 55,7 % [50,0-61,2 %] | 88,0 % [83,8-91,2 %] |
| ECE | 0,0534 | 0,0254 |

La mejora sobre el zero-shot es estadísticamente significativa (test z de dos proporciones, p < 0,001, n=300 por rama).

| Idioma (fine-tuned) | Accuracy | IC 95 % |
|---|---|---|
| Inglés (en) | 92,0 % | [85,0-95,9 %] |
| Español (es) | 85,0 % | [76,7-90,7 %] |
| Alemán (de) | 87,0 % | [79,0-92,2 %] |

Con n=100 por idioma, los tres resultados no son estadísticamente distinguibles entre sí (tests z por pares, todos p > 0,1). Debe interpretarse como que el modelo se mantiene en EN/ES/DE dentro de la distribución evaluada, no como una clasificación por idioma.

| Clase (fine-tuned) | Accuracy | IC 95 % |
|---|---|---|
| Positiva | 88,0 % (132/150) | [81,8-92,3 %] |
| Negativa | 88,0 % (132/150) | [81,8-92,3 %] |

Distribución simétrica, sin sesgo de clase. El modelo zero-shot presentaba un sesgo negativo fuerte (99,3 % en negativos, 12,0 % en positivos) que el ajuste fino eliminó.

Rendimiento de despliegue declarado: 16 ms en régimen estable y 375 ms de warmup en un M3 Air usando la ANE.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 321.908.998 parámetros. En FP16 el artefacto CoreML ocupa aproximadamente 647 MB; en FP32 serían unos 1,29 GB y en INT8 unos 322 MB (estimaciones a partir del recuento de parámetros, no cifras publicadas por el autor).
- GPU recomendadas: el despliegue documentado es CoreML FP16 en Apple Silicon (ANE/GPU). Al tratarse de un clasificador de 322 M, cualquier GPU con más de 2 GB de memoria (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente; no se documentan aceleradores específicos.
- Cabe en GPU de consumo: sí, con margen amplio. Un clasificador de 322 M en FP16 ocupa menos de 1 GB, por lo que es viable en portátiles y equipos de gama media, e incluso en CPU.
- Opciones de despliegue: CoreML FP16 sobre ANE/GPU, runtime `laya` para cargar el modelo vía `laya.load(...)` y pasarela FastAPI (127.0.0.1:8090) para exponerlo como servicio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: 16 ms en régimen estable y 375 ms de warmup medidos en un M3 Air sobre la ANE. No se publican cifras de throughput.

## Comparativa con modelos similares

La información disponible solo permite comparar de forma directa con el modelo base del que deriva.

| Modelo | Parametros | Idiomas | Accuracy (sentimiento binario) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ramg77/laya-sentiment-multilingual | 321,9 M | en, es, de | 88,0 % | 0,0254 | Apache 2.0 | HuggingFace, CoreML FP16 |
| convaiinnovations/laya-multilingual (zero-shot) | 321,9 M | multilingüe (no detallado) | 55,7 % | 0,0534 | Apache 2.0 | HuggingFace |
| Otros clasificadores de sentimiento multilingües (p. ej. variantes basadas en XLM-R) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria: distingue positivo frente a negativo y no maneja sentimiento neutro o mixto en una sola pasada. El dataset de entrenamiento se filtró eliminando la clase neutral.
- Cobertura limitada a tres idiomas (inglés, español y alemán). El rendimiento en cualquier otro idioma no está validado.
- Texto corto: los datos de entrenamiento son mensajes breves (media aproximada de 20 tokens). No se ha evaluado el comportamiento con texto largo.
- Desplazamiento de dominio: el entrenamiento proviene de sentimiento en redes sociales; el rendimiento sobre texto formal de empresa es desconocido.
- Sentimiento no equivale a intención: el modelo detecta sentimiento expresado, no la intención del cliente. La model card prohíbe explícitamente usarlo para decisiones de enrutado o escalado.
- Conjunto de evaluación pequeño: todas las métricas proceden de un holdout de 300 ejemplos, con intervalos de confianza amplios. Ningún valor debe tratarse como exacto.
- Sesgo demográfico: los clasificadores de sentimiento pueden codificar sesgos presentes en los datos de entrenamiento, y el dataset multilingual-sentiments no fue auditado por grupos demográficos.
- Uso en decisiones de alto impacto desaconsejado: contratación, crédito o triaje médico quedan fuera del ámbito previsto.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí existe riesgo de clasificación errónea en textos ambiguos o irónicos, especialmente con confianza calibrada baja.
- Licencia Apache 2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y la atribución correspondiente. El dataset base también es Apache 2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ramg77/laya-sentiment-multilingual
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/tyqiangz/multilingual-sentiments
- Repositorio de Laya (framework): https://github.com/NandhaKishorM/laya
- Cita del modelo (BibTeX, autor Cesar Gonzalez, 2026, Hugging Face)
- Cita de Laya (BibTeX, autor Nandha Kishor M, 2026)
- Cita del dataset (BibTeX, autor tyqiangz, 2023, Hugging Face)
