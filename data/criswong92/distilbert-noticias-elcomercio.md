# Criswong92/distilbert-noticias-elcomercio

## Resumen

`Criswong92/distilbert-noticias-elcomercio` es un clasificador de texto en español obtenido por fine-tuning de `distilbert-base-multilingual-cased` sobre 394 titulares del diario peruano El Comercio. Asigna cada titular a una de cuatro categorías cerradas: `politica`, `economia`, `deportes` y `ciencia_tecnologia`. El modelo forma parte de la Tarea 1 del Diplomado de Ciencia de Datos con Python y se publica con licencia Apache-2.0.

Con 135.327.748 parámetros, es un encoder transformer pequeño orientado a inferencia en CPU y a clasificación, no a generación de texto. Su interés práctico está en que un modelo de 135M supera en el test interno a alternativas zero-shot y a un LLM de 1,5B: F1 macro de 0,885 frente a 0,695 de `joeddav/xlm-roberta-large-xnli` y 0,779 de `Qwen/Qwen2.5-1.5B-Instruct`. Esa ventaja, sin embargo, se mide en un test de solo 60 titulares de un único medio y un periodo de 12 días.

La relevancia ahora es doble: sirve como ejemplo reproducible de fine-tuning ligero y como recordatorio de que, en dominios muy concretos y con pocos datos, un encoder destilado bien ajustado puede ser más útil que un LLM general. No es un modelo conversacional ni un clasificador universal de noticias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT, encoder transformer destilado de BERT, con fine-tuning para clasificación de secuencias |
| Parametros totales | 135.327.748 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite del base DistilBERT); el fine-tuning usó `max_length=64` |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | es (español); el modelo base es multilingüe, pero el ajuste se hizo con titulares peruanos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT, una versión destilada de BERT que conserva la pila de autoatención bidireccional y reduce el coste computacional. El modelo base es `distilbert-base-multilingual-cased`, con vocabulario case-sensitive; sobre él se añade una cabeza de clasificación para cuatro clases. El ajuste se realizó con el `Trainer` de Hugging Face en CPU: 8 épocas, batch 16, learning rate `5e-5`, `max_length=64` y aproximadamente 11 minutos de entrenamiento. La tarea es clasificación multiclase supervisada con cross-entropy; no se documenta RLHF ni DPO.

Los datos son 394 titulares de El Comercio publicados entre el 6 y el 17 de octubre de 2026, obtenidos de sus RSS y sitemaps oficiales. La etiqueta corresponde a la sección editorial. La partición es estratificada 70/15/15 con `random_state=42`: 275 ejemplos de entrenamiento, 59 de validación y 60 de test. La innovación principal no está en la arquitectura, sino en el uso de destilación más fine-tuning con muy pocos datos y en la comparación controlada contra zero-shot y un LLM general.

## Capacidades

- Clasificación de titulares en cuatro clases cerradas: `politica`, `economia`, `deportes` y `ciencia_tecnologia`.
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`.
- No genera texto: es un encoder de clasificación, no un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Cobertura multilingüe limitada: el base es multilingüe, pero el ajuste y los datos son exclusivamente españoles y peruanos.
- No tiene visión, audio ni modo thinking.
- Eficiencia alta para su tamaño: 135M de parámetros y ejecución viable en CPU para lotes pequeños.

## Casos de uso

- Enrutamiento automático de titulares en un agregador de noticias peruanas: el modelo puede asignar una sección a cada titular de entrada y enviarlo al flujo correspondiente; es adecuado por su tamaño y latencia potencial, pero conviene usarlo como primera etapa y no como decisión final por su sobreconfianza.
- Monitorización de medios y alertas temáticas: permite contar titulares por categoría en paneles de seguimiento de política, economía, deportes y ciencia y tecnología; encaja porque solo necesita el titular y funciona en CPU.
- Etiquetado asistido de datasets periodísticos: puede preetiquetar titulares con las cuatro clases y dejar la revisión humana para los casos dudosos; es útil para reducir trabajo manual en corpus pequeños o medianos.
- Autoetiquetado en un CMS editorial: integrado en el flujo de publicación, puede sugerir la sección de un titular de última hora; su ventaja es la inferencia ligera, aunque la etiqueta editorial final debería validarse.
- Análisis de tendencias por sección: agregando las probabilidades o las clases predichas por día, se pueden estudiar cambios de cobertura temática; es adecuado para series cortas y exploratorias, no para conclusiones representativas de toda la prensa peruana.
- Prototipo docente de fine-tuning: sirve para demostrar un pipeline completo de datos, entrenamiento, evaluación y publicación en Hugging Face con un coste de cómputo muy bajo.
- Filtro previo en pipelines de análisis: puede separar titulares de economía o política antes de aplicar modelos más caros de entidades o sentimiento; es razonable por su bajo coste, siempre que se acepte su dominio limitado.

## Benchmarks y rendimiento

Evaluación interna sobre 60 titulares de test y cuatro clases. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Enfoque | F1 macro | Accuracy |
|---|---:|---:|
| Zero-shot con `joeddav/xlm-roberta-large-xnli` | 0,695 | no disponible |
| LLM `Qwen/Qwen2.5-1.5B-Instruct` | 0,779 | no disponible |
| Este modelo | 0,885 | 0,883 |

El margen aproximado del test es de ±0,08. La comparación no es homogénea: este modelo está ajustado de forma supervisada en el mismo dominio, mientras que los otros se evaluaron como zero-shot o como LLM general.

## Requisitos de hardware

- Pesos: aproximadamente 0,54 GB en fp32, 0,27 GB en fp16 y 0,14 GB en int8, calculados a partir de 135.327.748 parámetros; el repositorio ocupa 0,5 GB.
- CPU: viable para inferencia y para entrenamiento pequeño; el autor entrenó en CPU en unos 11 minutos.
- GPU: no es necesaria. Cualquier GPU con 1-2 GB libres es suficiente; una T4, L4 o A10 cubre de sobra el despliegue. A100 y H100 no aportan ventaja por el tamaño del modelo.
- GPU de consumo: sí, cabe en tarjetas de gama baja y en iGPU con suficiente memoria del sistema; el cuello de botella será el runtime, no la VRAM.
- Despliegue: `transformers` con `pipeline`, Optimum/ONNX Runtime, FastAPI o TorchServe. vLLM y TGI están orientados a generación y no son la vía natural para este encoder; no hay GGUF publicado para Ollama o llama.cpp.
- Latencia y throughput: no disponible; no se han publicado medidas. Por el tamaño y `max_length=64` se espera latencia baja en CPU, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 macro en el test | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo | 135.327.748 | 512 tokens; entrenamiento con 64 | 0,885 | Apache-2.0 | Hugging Face |
| `distilbert-base-multilingual-cased` | 135.327.748 | 512 tokens | no evaluado en este test | Apache-2.0 | Hugging Face |
| `joeddav/xlm-roberta-large-xnli` | no disponible | no disponible | 0,695 | no disponible | Hugging Face |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1.500 millones (por nombre) | no disponible | 0,779 | no disponible | Hugging Face |

La comparación debe leerse con cautela: el primer modelo está fine-tuneado con supervisión en el mismo dominio, mientras que los otros dos se usaron como zero-shot o como LLM general. No hay datos públicos de rendimiento de este modelo fuera del test interno de 60 titulares.

## Limitaciones y advertencias

- Datos de un solo medio y de 12 días: 394 titulares de El Comercio, sin garantía de representar la prensa peruana ni otros medios.
- Test muy pequeño: 60 titulares y un margen aproximado de ±0,08; las diferencias frente a otras alternativas pueden no ser estables.
- Solo cuatro clases cerradas: cualquier titular recibe una de ellas, aunque trate de otro tema; no hay clase `otros` ni detección de fuera de dominio.
- Sobreconfianza documentada: en el test, los errores también tuvieron probabilidades altas, entre 0,76 y 0,99.
- Solo titulares: no procesa cuerpo de noticia, entradilla ni contexto; `max_length=64` limita la entrada.
- Dominio español y peruano: el base es multilingüe, pero el ajuste no está validado para otros países, registros o idiomas.
- No es un modelo generativo: no sirve para resumir, responder preguntas, generar código ni mantener conversaciones.
- No se documenta una evaluación de sesgos, toxicidad o equidad; tampoco hay análisis de calibración más allá del aviso de sobreconfianza.
- Licencia Apache-2.0: permite uso comercial con las obligaciones habituales de aviso y atribución; los titulares de El Comercio pueden estar sujetos a derechos de terceros y deben revisarse antes de reutilizar los datos.
- Para producción, conviene añadir umbrales de confianza, revisión humana y una clase de rechazo; el modelo por sí solo no la proporciona.

## Enlaces

- [Hugging Face: Criswong92/distilbert-noticias-elcomercio](https://huggingface.co/Criswong92/distilbert-noticias-elcomercio)
- [Modelo base: distilbert-base-multilingual-cased](https://huggingface.co/distilbert/distilbert-base-multilingual-cased)
- [Código, datos y dashboard en GitHub](https://github.com/Cris92W/Python-Intermedio/tree/main/tarea_1)
- [GeeksforGeeks: DistilBERT in Natural Language Processing](https://www.geeksforgeeks.org/nlp/distilbert-in-natural-language-processing/)
- No se ha encontrado un paper asociado en la información disponible.
