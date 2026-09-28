# mmbsaksd/sentiment-model

# Ficha tecnica de mmbsaksd/sentiment-model

## Resumen

mmbsaksd/sentiment-model es un clasificador de texto publicado por el usuario Mohammed Munavar (mmbsaksd) en HuggingFace, obtenido mediante fine-tuning completo de distilbert-base-uncased. Se trata de un transformer encoder de 6 capas y 66.955.779 parametros con una cabeza de clasificacion de secuencias anadida, entrenado con el Trainer de HuggingFace durante 3 epocas sobre un dataset que la propia model card no identifica ("an unknown dataset"). El pipeline declarado es text-classification y la licencia es apache-2.0.

Su relevancia practica es limitada y conviene ser explicito: el autor no documenta la composicion del dataset, el numero de clases, el mapeo de etiquetas ni los idiomas. Las unicas metricas disponibles son las de validacion del propio entrenamiento, con una accuracy de 0,6598 y un F1 ponderado y macro de 0,6493, valores bajos para una tarea de analisis de sentimiento. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con 12 segundos de diferencia, por lo que es un artefacto sin validacion externa.

Por sus dimensiones (0,3 GB de repositorio, ~67 M de parametros) es un modelo que se ejecuta en CPU y en cualquier GPU consumer, y resulta util como baseline barato, como punto de partida para fine-tuning adicional o en escenarios de edge computing donde no es viable enviar texto a un servicio en la nube. No debe confundirse con un modelo generativo: no produce texto ni soporta agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | No especificados en la model card. Los pesos safetensors permiten cuantizacion dinamica int8 con PyTorch o conversion a ONNX/GGUF con herramientas externas |
| Idiomas soportados | No disponibles. El modelo base es uncased y su vocabulario WordPiece (30.522 tokens) esta orientado a ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB con config y tokenizer incluidos) |
| Capas / dimension oculta / cabezas de atencion | 6 / 768 / 12 (heredado de distilbert-base-uncased) |
| Tarea y numero de etiquetas | Clasificacion de texto (sentimiento); numero de clases y mapeo de etiquetas no disponibles |
| Libreria | transformers (tag endpoints_compatible) |
| Modelo base | distilbert/distilbert-base-uncased |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion (unos 66 M de parametros frente a los 110 M de BERT-base). Segun el trabajo original de DistilBERT, se obtiene por destilacion de conocimiento de bert-base-uncased y conserva aproximadamente el 97 % del rendimiento de BERT en GLUE con una latencia notablemente menor. Sobre ese backbone, este modelo anade una cabeza de clasificacion de secuencias entrenada con el Trainer de HuggingFace (tag generated_from_trainer), sin que se documente ninguna innovacion tecnica adicional: no hay atencion lineal, decodificacion especulativa, MoE ni componentes SSM.

Los hiperparametros reportados son: 3 epocas, learning rate 2e-05 con scheduler lineal, batch de entrenamiento y evaluacion de 32, semilla 42 y optimizador AdamW torch fused (betas 0,9/0,999, epsilon 1e-08). Se registraron 58 pasos por epoca y 174 pasos totales, lo que implica del orden de 1.856 ejemplos de entrenamiento por epoca (58 x 32, sin informacion sobre acumulacion de gradientes ni de ejemplos descartados). El dataset, su composicion, su tamano de evaluacion y cualquier fase de RLHF o DPO son datos no disponibles. Las versiones declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto por secuencia (previsiblemente analisis de sentimiento), devolviendo logits o probabilidades por clase a traves del pipeline text-classification de transformers.
- No es un modelo generativo: no redacta texto, no responde preguntas y no mantiene conversaciones.
- Soporte de tool calling / function calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingues: no disponibles; el vocabulario uncased del modelo base esta orientado a ingles.
- Capacidad multimodal (vision, audio): no.
- Modo "thinking" o razonamiento explicito: no.
- Ventana de entrada limitada a 512 tokens, con truncado obligatorio en documentos mas largos.
- Ejecucion viable en CPU y en hardware de bajas prestaciones por su tamano reducido.
- Compatible con HuggingFace Inference Endpoints (tag endpoints_compatible) y con exportacion a ONNX.

## Casos de uso

- Triaje de tickets de soporte: clasificar la polaridad de un mensaje entrante para enrutarlo a colas distintas (queja, consulta neutra, elogio) con un umbral conservador y revision humana de los casos dudosos. Su coste computacional casi nulo permite ejecutarlo sobre cada ticket en tiempo real.
- Moderacion de comentarios en foros o aplicaciones: pre-filtrado de contenido negativo a gran escala antes de pasar a un sistema mas caro. Con una accuracy del 66 % solo es defendible como primera etapa de un pipeline con segunda validacion.
- Analisis de resenas de producto en comercio electronico: agregacion de sentimiento sobre catalogos con cientos de miles de resenas, procesando los textos truncados a 512 tokens.
- Etiquetado previo (pre-labeling) en proyectos de anotacion: generar etiquetas automaticas iniciales que los anotadores corrigen, reduciendo el coste por ejemplo dentro de un ciclo de active learning.
- Baseline de investigacion: punto de comparacion reproducible (semilla 42, hiperparametros documentados) frente a fine-tunings propios sobre DistilBERT en el mismo dataset.
- Monitorizacion de menciones de marca: despliegue sobre CPU en un proceso de ingesta continua de redes sociales, sin coste de GPU y sin enviar datos a terceros.
- Inferencia en el borde u on-premise: con cuantizacion int8 (~67 MB) cabe en dispositivos con recursos muy limitados y permite cumplir requisitos de residencia de datos (RGPD) en sectores regulados.
- Destilacion o adaptacion posterior: al ser un checkpoint pequeno de la familia BERT, sirve como punto de partida para fine-tuning especifico por dominio con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

El model-index publicado no contiene ningun resultado (lista vacia), por lo que no hay MMLU, HumanEval, GSM8K ni metricas equivalentes; ademas, no aplican a un clasificador de 67 M de parametros. Los unicos datos son las metricas de validacion del propio entrenamiento declaradas por el autor:

| Metrica | Epoca 1 (paso 58) | Epoca 2 (paso 116) | Epoca 3 (paso 174) | Valor de cabecera de la model card |
|---|---|---|---|---|
| Training loss | 1,0498 | 0,8304 | 0,6785 | no disponible |
| Validation loss | 0,8737 | 0,7226 | 0,7117 | 0,7470 |
| Accuracy | 0,6080 | 0,6975 | 0,6821 | 0,6598 |
| F1 weighted | 0,5529 | 0,6881 | 0,6736 | 0,6493 |
| F1 macro | 0,5529 | 0,6881 | 0,6736 | 0,6493 |

Observaciones sobre estos numeros: el F1 ponderado y el F1 macro coinciden en todas las epocas, lo que sugiere una distribucion de clases equilibrada en el conjunto de evaluacion (o muy proxima a ella). El mejor punto es la epoca 2; en la epoca 3 el F1 retrocede mientras la loss de entrenamiento sigue bajando (0,8304 a 0,6785), una senal compatible con sobreajuste. Los valores de la cabecera (accuracy 0,6598 y F1 0,6493 con loss 0,7470) no coinciden con los de la ultima epoca registrada en la tabla de entrenamiento, una inconsistencia que no esta explicada en la model card. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

Estimaciones de memoria a partir del numero de parametros declarado (66.955.779):

| Precision | Memoria de pesos | Memoria total estimada en inferencia |
|---|---|---|
| fp32 | ~268 MB | ~0,3-0,5 GB |
| fp16 / bf16 | ~134 MB | ~0,2-0,4 GB |
| int8 | ~67 MB | ~0,1-0,2 GB |
| int4 | ~34 MB | < 0,1 GB |

- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU y en CPU de portatil.
- GPU de datacenter (A100, H100, L4, T4) solo se justifican por agregacion de throughput, no por requisitos de memoria.
- Despliegue recomendado: pipeline de transformers, TorchScript o ONNX Runtime para inferencia en CPU; texto truncado o con ventana deslizante a 512 tokens.
- vLLM y TGI no son la via adecuada: estan orientados a modelos autorregresivos generativos, no a clasificacion de secuencias. Ollama y llama.cpp requieren conversion a GGUF, y su soporte para clasificacion tipo BERT no es el camino principal.
- Latencia y throughput: no hay mediciones publicadas. Por el tamano del modelo, en una GPU moderna se espera una latencia del orden de milisegundos por lote y throughput de miles de secuencias cortas por segundo, y en CPU del orden de decenas a cientos de secuencias por segundo; ambos valores son estimaciones, no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea | Metricas en la informacion disponible |
|---|---|---|---|---|---|
| mmbsaksd/sentiment-model | 66.955.779 | 512 tokens | Apache-2.0 | Clasificacion de sentimiento | Accuracy 0,6598; F1 weighted 0,6493; loss 0,7470 (validacion propia) |
| distilbert-base-uncased-finetuned-sst-2-english | ~66,9 M | 512 tokens | Apache-2.0 | Sentimiento binario (SST-2) | no disponible en la informacion proporcionada |
| bert-base-uncased | ~110 M | 512 tokens | Apache-2.0 | Modelo base, sin fine-tuning | No aplica (no es un clasificador afinado) |
| roberta-base | ~125 M | 512 tokens | MIT | Modelo base, sin fine-tuning | No aplica (no es un clasificador afinado) |

La comparativa relevante es con distilbert-base-uncased-finetuned-sst-2-english, que cubre la misma tarea con la misma arquitectura y licencia, y con la familia BERT/RoBERTa como alternativas de mayor capacidad. No se dispone de puntuaciones de benchmark verificadas de esos modelos en la informacion proporcionada, por lo que no se establece una comparacion numerica de rendimiento.

## Limitaciones y advertencias

- Rendimiento bajo y no verificado: la accuracy declarada es 0,6598 y el F1 0,6493, valores que en una tarea binaria equilibrada estan muy por encima del azar pero son insuficientes para decisiones automatizadas sin supervision humana. Ademas, la model card indica explicitamente "an unknown dataset" y "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Inconsistencia interna en las metricas: la cabecera de la model card (loss 0,7470, accuracy 0,6598) no coincide con la ultima fila de la tabla de entrenamiento (loss 0,7117, accuracy 0,6821). No hay explicacion publicada.
- Posible sobreajuste: la loss de entrenamiento baja hasta 0,6785 mientras el F1 de validacion cae de 0,6881 (epoca 2) a 0,6736 (epoca 3).
- Etiquetas opacas: se desconoce el numero de clases, su significado y el orden del mapeo id2label, por lo que interpretar la salida del modelo en produccion exige inspeccionar config.json y validar con ejemplos propios.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demograficos, de dominio ni de anotacion. Cualquier uso en personas requiere una auditoria previa.
- Riesgo de alucinacion: no aplica en sentido estricto (no es generativo). El riesgo equivalente son falsos positivos y falsos negativos en la clasificacion, con una tasa de error en torno al 34 % en el conjunto de evaluacion declarado.
- Idioma: no se declaran idiomas soportados y el modelo base es uncased en ingles; se espera un rendimiento degradado en castellano u otras lenguas no representadas en el vocabulario del modelo base.
- Limite de 512 tokens: los documentos largos se truncan, lo que puede invertir la polaridad percibida si la conclusion aparece al final del texto.
- Licencia y procedencia de datos: los pesos son apache-2.0 y permiten uso comercial, pero el dataset de entrenamiento no se identifica, por lo que la trazabilidad legal de los datos subyacentes queda sin resolver. En un despliegue comercial conviene verificar la procedencia antes de asumir riesgos.
- Artefacto sin validacion comunitaria: 0 descargas, 0 likes, creado y actualizado el 2026-09-28 con 12 segundos de diferencia, sin historial de revisiones ni evaluacion de terceros.
- Compatibilidad de versiones: el entrenamiento se realizo con Transformers 5.16.1 y PyTorch 2.11.0+cu128; en stacks mas antiguos pueden aparecer avisos o incompatibilidades al cargar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmbsaksd/sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Perfil del autor: https://huggingface.co/mmbsaksd
- Paper original de DistilBERT (arquitectura del backbone): https://arxiv.org/abs/1910.01108
- No se han encontrado papers, blogs, repositorios ni demos especificos de este modelo en la busqueda web. Los directorios genericos devueltos por la busqueda (benchlm.ai, llmboard.ai, aimodelsbenchmark.com y tensorfeed.ai) no indexan este modelo ni ofrecen datos sobre el.
