# Giobbva/bert-squad-qa-full-finetuning

## Resumen

`Giobbva/bert-squad-qa-full-finetuning` es un modelo de respuesta a preguntas extractiva (extractive question answering) resultado del ajuste fino completo (full fine-tuning) de `google-bert/bert-base-uncased` sobre el conjunto de datos SQuAD v1.1. Lo publica el usuario Giobbva en HuggingFace y su objetivo es resolver la tarea clasica de QA sobre contexto: dado un parrafo y una pregunta, localizar el fragmento de texto que contiene la respuesta. El modelo cuenta con 108.893.186 parametros reales (segun los pesos en safetensors) y un tamano de repositorio de 0.4 GB.

Se trata de un transformer encoder-only de la familia BERT, orientado exclusivamente a comprension de lectura en ingles, no a generacion de texto libre. Su relevancia practica radica en que es un modelo pequeno y eficiente que puede ejecutarse en hardware modesto, y en que reproduce el flujo clasico de fine-tuning sobre SQuAD, util como referencia o baseline para tareas de extraccion de respuestas en documentos.

El acceso al modelo esta restringido (gated): requiere aceptar condiciones en HuggingFace antes de poder descargarlo. La licencia declarada es Apache 2.0 y el modelo esta etiquetado como compatible con endpoints de inferencia de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 108.893.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google-bert/bert-base-uncased`, un transformer encoder-only con atencion bidireccional, concebido originalmente para preentrenamiento con objetivos de masked language modeling y next sentence prediction. Sobre esa base se ha realizado un ajuste fino completo (no LoRA ni adaptadores) para la tarea de question answering extractiva, anadiendo la cabeza de prediccion de inicio y fin del span de respuesta sobre la secuencia de contexto.

El entrenamiento se ha realizado sobre el dataset `rajpurkar/squad` (SQuAD v1.1). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas posteriores como RLHF o DPO (no aplicables en un modelo encoder-only de QA). Tampoco se especifican hiperparametros, numero de epocas ni estrategia de validacion. La model card unicamente declara los resultados de evaluacion en el split de validacion de SQuAD v1.1.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que responde a la pregunta.
- Comprension lectora en ingles: localizacion de respuestas dentro de parrafos de documentacion, articulos o notas.
- Clasificacion de pares contexto-pregunta con puntuaciones de inicio y fin del span.
- No soporta generacion de texto libre, razonamiento multi-paso ni codigo.
- No dispone de tool calling ni function calling.
- No soporta agentes ni planificacion autonoma.
- Capacidades multilingues: no (solo ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de respuestas en bases de conocimiento: se indexa un corpus de documentos en ingles y el modelo localiza el fragmento exacto que responde a consultas formuladas por el usuario, aprovechando su ventana de 512 tokens por pasaje.
- Atencion al cliente sobre FAQ: dado un conjunto de articulos de ayuda, el modelo devuelve la frase concreta que responde a la duda del cliente, evitando respuestas generadas y reduciendo el riesgo de alucinacion al extraer texto literal.
- Procesamiento de contratos y documentacion legal: localizacion de clausulas o datos concretos (fechas, importes, partes implicadas) dentro de fragmentos de texto, con la respuesta citada textualmente.
- Enriquecimiento de pipelines de RAG: como componente extractivo dentro de un sistema retrieval-augmented generation, para seleccionar la respuesta literal de un pasaje recuperado antes de pasarla a un modelo generativo.
- Extraccion de informacion en formularios y encuestas: mapeo de preguntas estructuradas a respuestas contenidas en texto no estructurado, util en digitalizacion de documentos.
- Baseline academico y docente: modelo de referencia para ensenar el flujo de fine-tuning sobre SQuAD, comparar arquitecturas encoder-only y validar pipelines de evaluacion con exact match y F1.
- Analisis de resenas y opinion: extraccion de fragmentos que describen caracteristicas concretas de un producto dentro de resenas extensas.
- Preprocesado de datasets: anotacion automatica de pares pregunta-respuesta sobre corpus en ingles para generar datos de entrenamiento posteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| SQuAD v1.1 (`rajpurkar/squad`) | validation | exact_match | 69.04 |
| SQuAD v1.1 (`rajpurkar/squad`) | validation | f1 | 79.53 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.44 GB en FP32, 0.22 GB en FP16 y en torno a 0.11 GB en INT8, para un modelo de 108.9 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas tarjetas consumer como GTX 1650, RTX 3060, RTX 4090; tambien funciona en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: si, sin dificultad; incluso en GPUs de gama de entrada y en entornos integrados.
- Opciones de despliegue: transformers (PyTorch), endpoints de HuggingFace (el modelo esta marcado como `endpoints_compatible`), ONNX Runtime; tambien es convertible a llama.cpp/GGUF o a formatos de cuantizacion dinamica para CPU, aunque no se publican pesos en esos formatos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en SQuAD v1.1 |
|---|---|---|---|---|---|
| Giobbva/bert-squad-qa-full-finetuning | 108.893.186 | 512 tokens | apache-2.0 | Gated en HuggingFace | EM 69.04 / F1 79.53 (declarado) |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | apache-2.0 | Publico | no disponible (modelo base sin fine-tuning de QA) |
| csarron/bert-base-uncased-squad-v1 | no disponible | 512 tokens | no disponible | no disponible | no disponible |
| deepset/bert-base-cased-squad2 | no disponible | 512 tokens | no disponible | no disponible | no disponible |

No se dispone de datos verificados de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no procesa consultas ni contextos en otros idiomas.
- Es un modelo extractivo: no genera respuestas, solo devuelve fragmentos literales del contexto. Si la respuesta no esta presente en el texto, no puede elaborarla.
- Limitado a 512 tokens por pasaje; contextos mas largos requieren segmentacion previa, lo que puede fragmentar la respuesta.
- Riesgo de sesgos heredados del corpus de preentrenamiento de bert-base-uncased y de las preguntas de SQuAD, que no representan dominios especializados.
- Los resultados de benchmarks estan marcados como no verificados por el autor.
- El acceso al modelo es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo, lo que puede complicar su uso en pipelines automatizados.
- Aunque la licencia es Apache 2.0, conviene revisar que los terminos de acceso al repositorio no impongan restricciones adicionales.
- No se documentan hiperparametros, datos de entrenamiento ni procesos de validacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Giobbva/bert-squad-qa-full-finetuning
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
- Paper original de BERT: https://arxiv.org/abs/1810.04805
- Paper de SQuAD: https://arxiv.org/abs/1606.05250
