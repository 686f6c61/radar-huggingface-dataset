# anha12/brandhub-phobert-V4-emotion

## Resumen

brandhub-phobert-V4-emotion es un clasificador de emociones en vietnamita desarrollado por el usuario anha12 dentro del proyecto BrandHub (trabajo de fin de carrera SEP490). Se trata de un fine-tuning con LoRA del modelo vinai/phobert-base-v2, un encoder tipo RoBERTa-base preentrenado especificamente para vietnamita por VinAI Research. El modelo resuelve una tarea de clasificacion de texto con seis clases de emocion sobre comentarios en redes sociales y resenas de productos.

Con 135.002.886 parametros en safetensors, el modelo mantiene la arquitectura densa del encoder PhoBERT e incorpora una cabeza de clasificacion de secuencia. El ajuste se hizo con adaptadores LoRA de rango 8 sobre las proyecciones query y value, una perdida focal con gamma 2.0 combinada con pesos de clase y label smoothing de 0.1, sobre un conjunto balanceado de aproximadamente 1200 muestras por clase.

El resultado publicado por el autor en el conjunto de validacion balanceado es del 75,21 % de accuracy y 75,30 % de macro-F1, lo que lo situa como un componente ligero y desplegable para tareas de monitorizacion de marca y analisis de sentimiento fino en vietnamita, un idioma con menos recursos y con menos modelos especializados que el ingles o el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa-base (PhoBERT-base-v2) con cabeza de clasificacion de secuencia y adaptadores LoRA (r=8, alpha=16, dropout=0.1) sobre query/value |
| Parametros totales | 135.002.886 (aproximadamente 135 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento se realizo con max_len = 128 tokens y truncacion activada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | Vietnamita (vi) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); compatible con carga mediante PEFT |
| Tarea | Text-classification (clasificacion de emociones, 6 clases) |
| Etiquetas | vui (0), buồn (1), tức_giận (2), lo_sợ (3), ngạc_nhiên (4), trung_lập (5) |
| Modelo base | vinai/phobert-base-v2 |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 17 descargas, 0 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La base es PhoBERT-base-v2, un encoder monolingue para vietnamita construido siguiendo el procedimiento de preentrenamiento de RoBERTa sobre un corpus en vietnamita. Sobre ese encoder, el autor aplico un ajuste eficiente con LoRA de rango 8, alpha 16 y dropout 0.1, actuando sobre las matrices query y value de la atencion. La cabeza de clasificacion devuelve logits sobre seis clases de emocion; el modelo conserva la naturaleza bidireccional y densa del encoder, por lo que es apto para clasificacion, no para generacion de texto.

El entrenamiento se realizo durante 3 epocas con learning rate 3e-4, batch de 8 y longitud maxima de 128 tokens. La funcion de perdida combina focal loss con gamma 2.0, pesos de clase y label smoothing de 0.1, una eleccion coherente con un dataset de aproximadamente 1200 muestras por clase y seis clases teoricamente balanceadas. El autor indica que la clase chán_ghét (asco o aversion) se fusiono con tức_giận (ira) por ambiguedad semantica entre ambas, quedando por tanto cinco emociones basicas mas la clase neutral. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo discriminativo de este tamano.

## Capacidades

- Clasificacion de emociones en vietnamita en seis categorias: vui, buồn, tức_giận, lo_sợ, ngạc_nhiên y trung_lập.
- Procesamiento de texto corto a medio (comentarios y resenas) con truncacion a 128 tokens en el ajuste.
- Analisis de sentimiento fino, al distinguir emociones concretas y no solo polaridad positiva/negativa/neutral.
- Manejo de clases desbalanceadas en produccion gracias al uso de pesos de clase y focal loss durante el entrenamiento.
- Integracion directa en pipelines de transformers mediante AutoTokenizer y AutoModelForSequenceClassification, con soporte de PEFT para cargar los adaptadores.
- Compatible con el endpoint de inferencia de Hugging Face (etiqueta endpoints_compatible).
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio.

## Casos de uso

- Monitorizacion de reputacion de marca: clasificar automaticamente comentarios y menciones en redes sociales vietnamitas en las seis emociones y activar alertas cuando la proporcion de tức_giận o lo_sợ supera un umbral definido.
- Analisis de resenas de producto en comercio electronico: agregar la emocion dominante por producto o por lote de resenas para detectar cambios de percepcion antes de que se reflejen en la valoracion media.
- Enrutado inteligente en atencion al cliente: etiquetar tickets entrantes por emocion y dirigir los casos de ira o miedo a agentes senior, con tiempos de respuesta menores.
- Investigacion de opinion publica: cuantificar la distribucion emocional de conversaciones sobre un tema concreto a lo largo del tiempo, como complemento a analisis de sentimiento de tres clases.
- Moderacion de comunidades: priorizar para revision humana los mensajes clasificados como tức_giận cuando aparecen en volumenes que un equipo pequeno no puede revisar manualmente.
- Analisis de campanas de marketing: comparar la reaccion emocional a distintas creatividades o lanzamientos midiendo macro-F1 sobre un conjunto de validacion propio y comparando la distribucion de clases entre campanas.
- Etiquetado asistido para anotacion: preanotar grandes volumenes de comentarios y reducir el coste de la revision manual en la construccion de datasets vietnamitas.
- Panel de analitica en tiempo real: por su tamano de 135 M de parametros, puede ejecutarse en CPU o GPU de gama baja dentro de un servicio de streaming que procese miles de comentarios por minuto.

## Benchmarks y rendimiento

Datos publicados por el autor en el conjunto de validacion balanceado:

| Metrica | Valor |
|---|---|
| Accuracy | 75,21 % |
| Macro-F1 | 75,30 % |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se detalla el tamano exacto del conjunto de validacion ni el desglose de F1 por clase, por lo que no es posible evaluar el comportamiento diferencial entre emociones.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,6 GB en fp32 y 0,3 GB en fp16 para los pesos; con activaciones y batch pequeno, el consumo real se situa en el rango de 0,5 a 1,5 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas y en CPU. Tambien se puede ejecutar en instancias pequenas de T4 o L4 en cloud.
- Despliegue: transformers con PyTorch de forma nativa, PEFT para cargar los adaptadores, Text Embeddings Inference (TEI) y Hugging Face Inference Endpoints por la compatibilidad declarada. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de safetensors.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones). Para un encoder de 135 M con entradas de 128 tokens, en una GPU moderna el coste por lote suele ser de milisegundos, pero se trata de una estimacion orientativa y no de un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| anha12/brandhub-phobert-V4-emotion | 135 M | No disponible (entrenado a 128 tokens) | Clasificacion de emociones en vietnamita (6 clases) | MIT | Accuracy 75,21 %, macro-F1 75,30 % |
| vinai/phobert-base-v2 | 135 M | No disponible | Modelo base preentrenado, sin cabeza de clasificacion de emociones | MIT | No aplica (no es un clasificador ajustado) |
| Otros clasificadores de emociones en vietnamita basados en PhoBERT | No disponible | No disponible | Clasificacion de emociones o sentimiento | No disponible | No disponible |

No se dispone de resultados comparativos publicados con alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Sesgos potenciales: el entrenamiento se realizo con aproximadamente 1200 muestras por clase de origen no especificado, lo que puede introducir sesgos de dominio si el modelo se aplica a textos de tematicas distintas a las del conjunto original.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no generativo), pero si existe riesgo de clasificaciones erroneas con alta confianza en textos ironicos, sarcasticos o con negaciones complejas.
- La fusion de chán_ghét dentro de tức_giận elimina la distincion entre asco y ira, lo que puede degradar el analisis en dominios donde esa diferencia es relevante.
- Limitacion de idioma: el modelo solo procesa vietnamita. El texto en otros idiomas producira predicciones sin significado.
- Limitacion de longitud: el ajuste se realizo con max_len de 128 tokens y truncacion; los comentarios largos se recortan y pierden informacion.
- El rendimiento de 75,21 % de accuracy y 75,30 % de macro-F1 sobre validacion balanceada no garantiza un rendimiento equivalente en datos reales, donde la distribucion de emociones suele estar muy desbalanceada.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No obstante, conviene verificar las condiciones del modelo base vinai/phobert-base-v2.
- Advertencia para produccion: el modelo tiene 17 descargas y 0 likes en el momento de la consulta, y proviene de un proyecto academico, por lo que no ha pasado por una validacion extensa en entornos productivos. Se recomienda evaluarlo con un conjunto de validacion propio antes de desplegarlo.
- No se publican pesos cuantizados, ni tarjetas de datos, ni analisis de errores por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anha12/brandhub-phobert-V4-emotion
- Archivos del repositorio: https://huggingface.co/anha12/brandhub-phobert-V4-emotion/tree/main
- Modelo base vinai/phobert-base-v2: https://huggingface.co/vinai/phobert-base-v2
- Repositorio oficial de PhoBERT (VinAI Research): https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT (EMNLP-2020 Findings): https://arxiv.org/abs/2003.00744
- Proyecto de ejemplo de analisis de emociones con PhoBERT: https://github.com/irisgranger/PhoBERT_EmotionAnalyzer
