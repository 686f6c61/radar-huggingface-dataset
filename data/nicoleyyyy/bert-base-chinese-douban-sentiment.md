# Nicoleyyyy/bert-base-chinese-douban-sentiment

## Resumen

`Nicoleyyyy/bert-base-chinese-douban-sentiment` es un clasificador de sentimiento binario (negativo / positivo) para resenas en chino, obtenido mediante fine-tuning de `google-bert/bert-base-chinese`. Lo publica la usuaria Nicoleyyyy como trabajo de un curso (identificado como CHI3242) y esta pensado especificamente para el dominio de resenas de Douban, la plataforma china de cine, libros y musica. El modelo resuelve una tarea acotada: dado un texto en chino, asignar una etiqueta de polaridad.

Arquitectonicamente es un transformer encoder BERT base con una cabeza de clasificacion nueva sobre el vector `[CLS]`. Cuenta con 102.269.186 parametros totales y un repositorio de 0,4 GB en formato safetensors. La model card no declara longitud de contexto explicita, por lo que se asume la del BERT base original (512 tokens), aunque este dato no aparece confirmado en la informacion disponible.

Su relevancia es limitada pero clara: es un ejemplo reproducible de fine-tuning ligero (1 epoch, 10.000 ejemplos, learning rate 2e-5) con una accuracy reportada de 0,928 sobre 2.000 resenas de test. Resulta util como baseline de sentimiento en chino para dominios de resenas y como punto de partida para experimentos academicos, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con cabeza de clasificacion sobre `[CLS]` |
| Parametros totales | 102.269.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura base BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-chinese`, un encoder transformer de 12 capas con atencion bidireccional, y sustituye la cabeza original por un clasificador nuevo que opera sobre el vector `[CLS]` para producir una decision binaria negativo / positivo. No se trata de un modelo generativo: es un encoder discriminativo orientado a clasificacion de secuencias.

El entrenamiento se realizo sobre resenas de Douban extraidas del repositorio `qhchina-data`, mapeando 1 estrella a negativo y 5 estrellas a positivo. Se usaron 5.000 resenas positivas y 5.000 negativas, con 1 unica epoca y learning rate 2e-5. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de aumentacion de datos. La evaluacion se hizo sobre 1.000 + 1.000 resenas retenidas, con una accuracy de 0,928. No se detalla la composicion exacta del dataset, el preprocesado aplicado ni si hubo balanceo adicional mas alla del 50/50 declarado.

## Capacidades

- Clasificacion de sentimiento binaria (negativo / positivo) de textos en chino.
- Especializacion en el dominio de resenas de Douban (cine, libros, musica).
- Inferencia sobre entradas cortas o medias, limitada por la ventana del BERT base.
- No soporta generacion de texto, razonamiento multi-paso ni matematicas.
- No dispone de tool calling ni function calling.
- No esta disenado para uso agentico.
- Capacidad multilingue practicamente nula: solo chino.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Analisis de sentimiento de resenas de Douban: clasificar resenas de peliculas, libros o musica en positivas o negativas para agregar valoraciones por producto. Es adecuado porque el modelo se entreno exactamente con ese tipo de texto y ese esquema de etiquetado (1 vs 5 estrellas).
- Moderacion de comentarios en plataformas de contenido chino: detectar resenas negativas que requieran revision manual, usando la salida binaria como filtro previo. La accuracy de 0,928 sobre el conjunto de test lo hace razonable como primera pasada.
- Monitorizacion de reputacion de marca: procesar lotes de resenas en chino y calcular la proporcion de sentimiento negativo por periodo o producto. El tamano de 0,4 GB permite ejecutarlo en CPU para volumenes moderados.
- Baseline academico para experimentos de NLP en chino: servir como referencia de partida en trabajos sobre clasificacion de sentimiento, comparando fine-tunings posteriores contra esta accuracy de 0,928.
- Enriquecimiento de datasets: etiquetar automaticamente resenas no anotadas para construir corpus de entrenamiento mas grandes, con revision humana de los casos limite.
- Clasificacion por lotes en pipelines de analitica: integrar el modelo en un job que procese exportaciones de resenas y genere metricas de polaridad por categoria, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| Accuracy | 1.000 resenas positivas + 1.000 negativas (held-out) | 0,928 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Tampoco se aportan metricas de precision, recall o F1 por clase, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos, con overhead adicional por activaciones; en la practica cabe en cualquier GPU consumer.
- En fp16 o bf16 el peso se reduce a unos 0,2 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU para inferencia por lotes.
- Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, o servidores de inferencia compatibles con modelos de clasificacion (por ejemplo, TorchServe). No se documenta soporte especifico para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nicoleyyyy/bert-base-chinese-douban-sentiment` | 102.269.186 | no disponible (base BERT: 512) | Clasificacion de sentimiento en chino | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-chinese` | ~102 M | 512 | Modelo base (MLM), sin cabeza de sentimiento | Apache 2.0 | Hugging Face |
| Otros fine-tunings de BERT chino para sentimiento | no disponible | no disponible | Clasificacion de sentimiento en chino | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas en la informacion proporcionada. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con solo 10.000 ejemplos y 1 epoca: riesgo alto de sobreajuste al dominio de Douban y baja generalizacion a otros tipos de texto en chino.
- Etiquetado simplificado (1 estrella = negativo, 5 estrellas = positivo): excluye resenas neutras o mixtas, por lo que puede forzar una polaridad incorrecta en textos ambiguos.
- No se reportan metricas por clase: con un conjunto balanceado 50/50, la accuracy agregada no revela si hay sesgo hacia una de las dos clases.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en resenas ironicas, sarcasticas o con negaciones complejas.
- Capacidad multilingue nula: solo procesa chino; textos en otros idiomas produciran predicciones sin significado.
- Longitud de contexto no documentada; entradas largas pueden truncarse segun la configuracion del tokenizador base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica como trabajo de curso y sin garantias de calidad para produccion.
- Sin mantenimiento aparente: 0 descargas y 1 like en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nicoleyyyy/bert-base-chinese-douban-sentiment
- Modelo base: https://huggingface.co/bert-base-chinese
- Dataset de origen (qhchina-data): https://github.com/mcjkurz/qhchina-data
