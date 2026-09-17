# AzadDjan/Llama-3.2-3B-banking77-lora

## Resumen

Llama-3.2-3B-banking77-lora es un adaptador LoRA publicado en HuggingFace por el usuario AzadDjan, entrenado mediante PEFT sobre el modelo base meta-llama/Llama-3.2-3B. El adaptador está especializado en una única tarea: la clasificación de intenciones de clientes bancarios en 77 categorías cerradas, usando como conjunto de datos PolyAI/banking77. No es un modelo conversacional de propósito general, sino un clasificador de intenciones construido sobre un transformer decoder-only de 3 000 millones de parámetros.

El problema que resuelve es el enrutamiento automático de consultas bancarias: dada una frase de un cliente (por ejemplo, una reclamación sobre una comisión o una consulta sobre el estado de una transferencia), el modelo asigna una de las 77 intenciones predefinidas del dataset banking77. El autor declara una accuracy de 0,9371 y un F1 de 0,9389 en el conjunto de evaluación, y una accuracy de 0,9390 con F1 macro de 0,9392 sobre el split de test.

Su relevancia es acotada pero ilustrativa: demuestra el uso de adaptadores LoRA sobre LLMs de 3B para tareas de clasificación clásicas, un patrón cada vez más habitual frente a los encoders tipo BERT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y todas las métricas declaradas están marcadas como no verificadas, por lo que debe considerarse un artefacto experimental de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base meta-llama/Llama-3.2-3B |
| Parametros totales | Modelo base: 3 000 millones (denominacion oficial de Llama-3.2-3B). Adaptador LoRA: no disponible (tamano de repo 0,1 GB) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; hereda la ventana del modelo base Llama-3.2-3B |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en safetensors. La cuantizacion aplicaria al modelo base (8 bits, 4 bits), no verificada en la ficha |
| Idiomas soportados | no disponible; el dataset de ajuste PolyAI/banking77 es integramente en ingles |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre meta-llama/Llama-3.2-3B, un transformer decoder-only autorregresivo, y se carga con la libreria peft junto a transformers. El entrenamiento se realizo sobre el dataset PolyAI/banking77, compuesto por consultas de clientes bancarios etiquetadas con 77 intenciones; el autor no detalla el numero de tokens ni la composicion exacta del preprocesado, ni si se reformateo la tarea como clasificacion de secuencia con una cabeza sobre el ultimo token o mediante prompts.

Los hiperparametros declarados son: learning rate 0,0001, train batch size 32, eval batch size 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused, scheduler lineal y 20 epocas configuradas (el registro de entrenamiento publicado llega hasta la epoca 10, con 282 pasos por epoca). No se menciona RLHF, DPO ni ninguna fase de alineamiento; es un ajuste supervisado puro. La curva publicada muestra una senal clara de sobreajuste: la perdida de entrenamiento cae hasta 0,0007 en la epoca 10 mientras la perdida de validacion se estanca en torno a 0,35-0,40, y el mejor resultado de validacion se alcanza en la epoca 7 (accuracy 0,9431 y F1 0,9456), por encima del valor final reportado en la epoca 10.

Las versiones de framework empleadas son PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de intenciones bancarias en 77 categorias cerradas sobre texto en ingles (dataset banking77).
- Clasificacion de texto de dominio especifico: el autor declara resultados tanto bajo la etiqueta "Text Classification" como "Intent Classification".
- Uso como enrutador previo (router) dentro de un pipeline mayor, ya que devuelve una etiqueta discreta en lugar de texto libre.
- Capacidad generativa teorica heredada del modelo base Llama-3.2-3B, pero no evaluada ni garantizada tras el ajuste LoRA; el adaptador esta optimizado para clasificacion.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el ajuste se realizo solo con datos en ingles.
- Capacidad especial (modo thinking, vision, audio): no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo asigna cada mensaje entrante a una de las 77 intenciones (por ejemplo, "card_activation" o "transfer_not_received"), lo que permite dirigirlo automaticamente al equipo o al flujo de resolucion correspondiente sin intervencion humana.
- Pre-clasificador en un chatbot bancario: se coloca delante de un LLM generativo para decidir la intencion del usuario y seleccionar la plantilla de respuesta o la herramienta adecuada, reduciendo el coste por consulta frente a resolver la clasificacion con un modelo mayor.
- Analitica de voz del cliente: aplicado sobre transcripciones de llamadas o chats, permite agregar motivos de contacto y medir su evolucion en el tiempo (por ejemplo, picos de consultas sobre comisiones tras un cambio de tarifas).
- Enrutamiento en IVR o atencion telefonica: combinado con ASR, clasifica la peticion del cliente en los primeros segundos de la llamada para decidir el menu o el agente especializado.
- Etiquetado y triaje de correo entrante en banca online: clasificacion automatica de correos de clientes para separar consultas operativas de reclamaciones formales, con derivacion a los equipos de cumplimiento cuando corresponda.
- Investigacion sobre ajuste fino de LLMs en tareas de clasificacion: sirve como punto de comparacion entre adaptadores LoRA sobre un decoder de 3B y clasificadores encoder clasicos (BERT, DeBERTa) en un benchmark estandar como banking77.
- Analitica de producto sobre logs de conversacion: etiquetado retroactivo de historicos de chat para construir dashboards de intenciones y detectar temas emergentes.
- Componente docente o de prototipado: ejemplo reproducible de entrenamiento LoRA con PEFT, Transformers y el Trainer de HuggingFace sobre un dataset publico de 77 clases.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Todas las metricas figuran con `verified: false`, es decir, no han sido verificadas de forma independiente.

| Tarea | Dataset | Split | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| Text Classification | banking77 | no especificado | 0,9371 | 0,9437 | 0,9396 | 0,9389 |
| Intent Classification | Banking77 | test | 0,9390 | 0,9412 (macro) | 0,9390 (macro) | 0,9392 (macro F1) |

Otros datos declarados en la model card:

| Metrica | Valor |
|---|---|
| Loss en el conjunto de evaluacion | 0,3746 |
| Accuracy en el conjunto de evaluacion | 0,9371 |
| Precision en el conjunto de evaluacion | 0,9437 |
| Recall en el conjunto de evaluacion | 0,9396 |
| F1 en el conjunto de evaluacion | 0,9389 |
| Mejor epoca registrada (epoca 7) | Accuracy 0,9431 / F1 0,9456 |
| Epoca final registrada (epoca 10) | Accuracy 0,9371 / F1 0,9389 |

No se han publicado en la informacion disponible comparaciones directas con otros modelos sobre el mismo split, ni resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,1 GB (tamano del repositorio), por lo que el coste real de hardware lo determina el modelo base Llama-3.2-3B.
- VRAM estimada para el modelo base en precision completa (fp16/bf16): en torno a 6-7 GB de pesos, mas memoria para activaciones y cache KV.
- VRAM estimada en 8 bits: en torno a 3-4 GB. En 4 bits (NF4): en torno a 2-3 GB. Estas cifras son estimaciones a partir del numero de parametros del modelo base y no estan confirmadas en la ficha del adaptador.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 24 GB si se cuantiza o se usa bf16. En 4 bits es viable en GPUs de 8 GB.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S, con margen amplio para lotes grandes y contexto largo.
- Despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA; llama.cpp, Ollama y LM Studio requieren fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el repositorio no registra descargas que permitan inferir un uso real.

## Comparativa con modelos similares

La comparacion se plantea frente a alternativas habituales para clasificacion de intenciones en banking77. Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que solo se comparan caracteristicas estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento en banking77 |
|---|---|---|---|---|---|
| Llama-3.2-3B-banking77-lora | Adaptador LoRA sobre decoder de 3B | 3 000 M (base) + adaptador no cuantificado | heredado del base | Llama 3.2 Community License | Accuracy 0,9371-0,9390 (declarado, no verificado) |
| BERT-base ajustado en banking77 | Encoder transformer | 110 M | 512 tokens | Apache 2.0 | no disponible en la informacion proporcionada |
| DeBERTa-v3-base ajustado en banking77 | Encoder transformer | 184 M | 512 tokens | MIT | no disponible en la informacion proporcionada |
| Llama-3.2-3B con ajuste completo en banking77 | Decoder transformer | 3 000 M | heredado del base | Llama 3.2 Community License | no disponible en la informacion proporcionada |

Diferencias estructurales relevantes: los encoders clasicos ocupan entre 15 y 30 veces menos parametros y son mas baratos de desplegar, mientras que este adaptador hereda la ventana de contexto larga y el tokenizador de Llama 3.2, lo que puede resultar ventajoso si la clasificacion se integra en un pipeline que ya usa el mismo modelo base.

## Limitaciones y advertencias

- Ambito cerrado: el adaptador solo produce una de las 77 etiquetas de banking77. No es un modelo de chat ni de generacion de texto util, aunque su modelo base si lo sea.
- Idioma: el ajuste se realizo exclusivamente con datos en ingles; el comportamiento en castellano u otros idiomas no ha sido evaluado y no esta respaldado por la ficha.
- Metricas no verificadas: todas las cifras del model-index estan marcadas con `verified: false` y proceden del propio autor.
- Sin validacion externa: el repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o reproduccion por terceros.
- Sobreajuste observable: la perdida de entrenamiento cae a 0,0007 mientras la de validacion se mantiene en 0,35-0,40; la mejor epoca registrada (epoca 7) supera al resultado final publicado (epoca 10), lo que sugiere que el checkpoint distribuido no es el optimo de validacion.
- Documentacion incompleta: la model card deja como "More information needed" las secciones de descripcion del modelo, usos previstos, limitaciones y datos de entrenamiento y evaluacion.
- Alucinacion: al ser un clasificador de etiquetas cerradas, el riesgo no es de alucinacion textual, sino de asignar una intencion incorrecta con alta confianza en entradas fuera de dominio o ambiguas.
- Sesgos: no se documenta ningun analisis de sesgo sobre el dataset banking77 ni sobre las predicciones del modelo.
- Restricciones de licencia: se hereda la Llama 3.2 Community License, que impone condiciones de uso (incluida la atribucion "Built with Llama" y la aceptacion de la politica de uso aceptable) y no es una licencia de codigo abierto permisiva tipo Apache o MIT.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar meta-llama/Llama-3.2-3B y aceptar sus terminos.
- Advertencia para produccion: dado el estado de la documentacion y la ausencia de verificacion, no se recomienda su uso en produccion sin reentrenamiento, congelacion de versiones y una evaluacion propia sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzadDjan/Llama-3.2-3B-banking77-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/banking77

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a widgets de cuestionarios sin relacion con el artefacto). No se dispone de paper, blog tecnico, repositorio adicional ni demo asociados.
