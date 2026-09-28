# anha12/brandhub-phobert-V12-emotion

## Resumen

`anha12/brandhub-phobert-V12-emotion` es un adaptador LoRA de PEFT para clasificación de emociones en vietnamita, construido sobre el modelo base `vinai/phobert-base-v2`. El adaptador resuelve una tarea concreta de PLN: asignar un texto corto en vietnamita a una de seis emociones (vui/joy, buồn/sadness, tức_giận/anger, lo_sợ/fear, ngạc_nhiên/surprise, trung_lập/neutral). La ficha del autor lo identifica como "production v12" y señala que fue entrenado con técnicas adversariales, aunque no detalla el procedimiento ni el conjunto de datos empleado.

El modelo es relevante por su carácter acotado y desplegable: al ser un adaptador LoRA (r=16, alpha=32) sobre un encoder de ~135 M de parámetros, el coste de inferencia y de almacenamiento es muy bajo, y puede integrarse en pipelines de análisis de opinión, monitorización de redes sociales o atención al cliente en vietnamita sin necesidad de GPU de gama alta. Sin embargo, sus métricas publicadas son modestas (macro-F1 0,6239), lo que indica margen de mejora y una separación limitada entre clases emocionales cercanas.

Se publica con la librería `peft` (versión 0.21.0) y con `modules_to_save` para el clasificador, de modo que el checkpoint incluye tanto los pesos LoRA como la cabeza de clasificación de 6 salidas. No se declara licencia, ni lista de idiomas, ni datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (modelo base PhoBERT) con adaptador LoRA y cabeza de clasificación de secuencia de 6 etiquetas |
| Parametros totales | No disponible en la ficha del adaptador; el modelo base `vinai/phobert-base-v2` tiene aproximadamente 135 M de parametros segun la documentacion de VinAI. El adaptador añade LoRA r=16 sobre `key`, `query` y `value`, mas `classifier` y `score` en `modules_to_save` |
| Longitud de contexto | No especificada en la ficha. El ejemplo de uso trunca a 128 tokens (`max_length=128`); el modelo base admite hasta 1.024 posiciones |
| Tipos de cuantizacion | No disponible. No se publican pesos cuantizados; al ser un adaptador PEFT, la cuantizacion exigiria fusionar previamente los pesos |
| Idiomas soportados | Vietnamita (etiquetas, ejemplos y nombre del modelo en vietnamita). El campo de idiomas de HuggingFace figura como no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT). No se publican pesos fusionados ni versiones GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es PhoBERT-base-v2, un encoder transformer basado en la arquitectura RoBERTa adaptada al vietnamita mediante preentrenamiento con enmascaramiento de palabras (word-segmentation aware). Sobre ese encoder se aplica un adaptador LoRA con rango r=16, alpha=32 y dropout 0,1, con matrices de bajo rango en las proyecciones `key`, `query` y `value` de las capas de atencion. Los modulos `classifier` y `score` se marcan como `modules_to_save`, por lo que se entrenan y se guardan completos en lugar de quedar congelados. La tarea es de clasificacion de secuencia con 6 clases mutuamente excluyentes.

El autor indica que el adaptador corresponde a una "production v12" y que fue "adversarial-trained", lo que sugiere entrenamiento con ejemplos adversariales o perturbaciones, pero no se especifica el conjunto de datos, el numero de tokens de entrenamiento, la composicion del corpus ni si hubo una etapa de ajuste adicional (RLHF, DPO u otra). Tampoco se documentan hiperparametros de optimizacion, epocas o estrategia de validacion, mas alla de que las metricas reportadas proceden de un conjunto de validacion reservado ("held-out validation").

## Capacidades

- Clasificacion de emociones en vietnamita en 6 clases: `vui` (alegria), `buồn` (tristeza), `tức_giận` (ira), `lo_sợ` (miedo), `ngạc_nhiên` (sorpresa) y `trung_lập` (neutral).
- Entrada de texto plano con truncado y padding configurables mediante el tokenizer de PhoBERT; el ejemplo oficial procesa lotes de frases cortas.
- Salida de logits por clase, lo que permite obtener probabilidades con softmax y umbrales personalizados por clase.
- Integracion directa con el ecosistema HuggingFace mediante `AutoPeftModelForSequenceClassification` y `AutoTokenizer`.
- Uso de la cabeza de clasificacion incluida en el checkpoint, sin necesidad de reentrenar el clasificador al cargar el modelo.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico: es un modelo puramente discriminativo.

## Casos de uso

- Monitorizacion de marca en redes sociales: clasificar menciones y comentarios en vietnamita en las seis categorias emocionales para detectar picos de ira o miedo asociados a un producto o campana. El coste por inferencia es bajo al tratarse de un encoder de ~135 M de parametros.
- Enrutado de tickets de atencion al cliente: etiquetar cada mensaje entrante con su emocion dominante y dirigir los casos de `tức_giận` o `lo_sợ` a agentes senior o a colas prioritarias.
- Analitica de encuestas de satisfaccion (NPS, CSAT): agregar respuestas abiertas en vietnamita por emocion para construir series temporales de sentimiento mas alla de la polaridad positiva/negativa.
- Filtrado previo en moderacion de contenidos: usar la clase `tức_giận` como senal de riesgo para priorizar la revision humana de comentarios, combinada con otros clasificadores.
- Investigacion en PLN vietnamita: servir como linea base reproducible para experimentos de clasificacion emocional de 6 clases, dado que el adaptador, los hiperparametros LoRA y las metricas de validacion estan publicados.
- Etiquetado asistido para ampliar datasets: preanotar grandes volumenes de texto en vietnamita y reservar la revision humana para los casos con baja confianza (logits cercanos entre clases).
- Analisis de resenas de producto en comercio electronico: clasificar resenas por emocion para alimentar paneles de calidad y detectar problemas recurrentes que generan frustracion.

## Benchmarks y rendimiento

El unico dato publicado en la informacion disponible es la evaluacion sobre el conjunto de validacion reservado que reporta el autor:

| Metrica | Valor |
|---|---|
| macro-F1 | 0,6239 |
| weighted-F1 | 0,6884 |
| accuracy | 0,6856 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni desglose de F1 por clase, matriz de confusion o tamano del conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos del encoder de ~135 M de parametros ocupan aproximadamente 0,55 GB, mas el adaptador LoRA y la cabeza de clasificacion (pocos MB); en fp16, los pesos bajan a unos 0,27 GB. Con activaciones y lotes pequenos (max_length 128), un presupuesto de 1-2 GB de VRAM es suficiente. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia en lotes pequenos; A100, H100 o L4 no aportan ventaja relevante dado el tamano del modelo y se justificarian solo por volumen de peticiones o por el resto del pipeline.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante, RTX 3060, RTX 4090, etc.), e incluso en CPU para lotes pequenos.
- Opciones de despliegue: la ruta estandar es `transformers` + `peft` (tal como muestra el ejemplo oficial) o el fusionado de los pesos LoRA en el modelo base y su exportacion a ONNX Runtime para inferencia en produccion. `llama.cpp` y `Ollama` no estan orientados a adaptadores LoRA sobre modelos de clasificacion de secuencia; el soporte de vLLM y TGI para clasificacion de secuencia es limitado y no esta documentado para este checkpoint.
- Latencia y throughput estimados: no disponibles. No se publican medidas de latencia, tokens por segundo ni rendimiento bajo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anha12/brandhub-phobert-V12-emotion | ~135 M (base PhoBERT) + LoRA r=16 | No especificado; ejemplo a 128 tokens | macro-F1 0,6239; weighted-F1 0,6884; accuracy 0,6856 | No disponible | HuggingFace, 13 descargas, 0 likes |
| vinai/phobert-base-v2 | ~135 M | 1.024 posiciones | No es un clasificador de emociones; requiere ajuste especifico | MIT (segun la documentacion de VinAI) | HuggingFace, ampliamente utilizado |
| Modelos de sentimiento en vietnamita basados en PhoBERT (por ejemplo `wonrax/phobert-base-vietnamese-sentiment`) | ~135 M | No disponible | No disponible | No disponible | HuggingFace |
| Encoders multilingues tipo XLM-R ajustados a emocion | ~278 M (XLM-R base) | 512 posiciones | No disponible | MIT (modelo base) | HuggingFace |

La comparacion cuantitativa no es posible con la informacion disponible: no se publican resultados de los modelos alternativos sobre el mismo conjunto de validacion ni sobre el mismo esquema de 6 clases.

## Limitaciones y advertencias

- Rendimiento moderado: un macro-F1 de 0,6239 y una accuracy de 0,6856 indican confusion apreciable entre clases, especialmente probable entre emociones cercanas como miedo y tristeza o sorpresa y neutral. Conviene calibrar umbrales por clase antes de usarlo en produccion.
- Dominio de entrenamiento desconocido: el prefijo "brandhub" y el uso de entrenamiento adversarial sugieren datos de un dominio concreto (probablemente comentarios o interacciones de marca), lo que puede sesgar el modelo hacia ese registro y degradar su rendimiento en otros ambitos como literatura, texto tecnico o lenguaje formal.
- Sesgos no evaluados: no se publican analisis de sesgo por genero, dialecto, region ni grupo demografico, ni desglose de metricas por clase.
- Ambito linguistico restringido: el modelo esta orientado a vietnamita y no se declara soporte para otros idiomas. Aplicarlo a texto en castellano u otra lengua no es fiable.
- Longitud de entrada: el ejemplo oficial trunca a 128 tokens. Textos mas largos perderan informacion si no se trocean previamente; el modelo base admite hasta 1.024 posiciones, pero no hay evidencia publicada del rendimiento mas alla de 128 tokens.
- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite el uso comercial. El modelo base PhoBERT se distribuye bajo licencia MIT, pero el adaptador no declara terminos propios, por lo que conviene contactar con el autor antes de un despliegue comercial.
- Riesgo de sobreconfianza: al ser un modelo discriminativo no "alucina" texto, pero puede producir probabilidades altas en predicciones erroneas. Se recomienda usar la confianza como senal para revision humana, no como garantia.
- Ausencia de documentacion de produccion: no se detallan el conjunto de datos, el volumen de entrenamiento, la composicion de clases ni la metodologia de validacion, lo que dificulta reproducir o auditar los resultados.
- Trazabilidad del checkpoint: la version se identifica como "v12" sin historial de cambios publicado; no hay garantia de compatibilidad con futuras versiones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anha12/brandhub-phobert-V12-emotion
- Modelo base: https://huggingface.co/vinai/phobert-base-v2
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentacion de PEFT sobre adaptadores LoRA: https://huggingface.co/docs/peft
- Paper de PhoBERT (Nguyen y Nguyen, 2020): https://arxiv.org/abs/2003.00744
- Repositorio oficial de PhoBERT: https://github.com/VinAIResearch/PhoBERT
