# ChnIRuI111/PoRT-TOFU-Classifier

## Resumen

PoRT-TOFU-Classifier es un clasificador binario de pares pregunta-respuesta derivado de LLM2Vec, construido sobre el encoder Meta Llama 3 8B Instruct. Lo desarrolla el usuario ChnIRuI111 como componente del pipeline PoRT (machine unlearning), y su funcion es discriminar si una respuesta generada por un modelo corresponde o no al conjunto TOFU (Task of Fictitious Unlearning), que se emplea habitualmente como benchmark de desaprendizaje en LLMs. El checkpoint publicado corresponde a la ejecucion de entrenamiento 0815_1628 y fue recuperado de un pipeline archivado.

El modelo no es un LLM generativo ni un export estandar de `AutoModelForSequenceClassification`: es un `SelectiveLLM2VecClassifier` con encoder Llama 3 8B, adaptadores de LLM2Vec y una cabeza MLP de dos clases. El repositorio pesa 15,2 GB y contiene 7.555.262.466 parametros en safetensors (742 tensores: 738 en el encoder y 4 en el clasificador). La relevancia actual reside en su uso como juez de evaluacion dentro de experimentos de unlearning, donde la clasificacion automatica de respuestas TOFU sustituye o complementa la evaluacion manual.

La licencia es llama3 (Meta Llama 3 Community License), lo que impone restricciones de uso comercial y obligaciones de atribucion. El modelo esta pensado exclusivamente para investigacion en desaprendizaje y evaluacion de fuga de conocimiento, no para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B) adaptado como encoder LLM2Vec + cabeza MLP de clasificacion binaria |
| Parametros totales | 7.555.262.466 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del encoder Llama 3 8B subyacente) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/bf16 implicito) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Meta Llama 3 Community License + Acceptable Use Policy) |
| Formato de pesos | safetensors (`model.safetensors`, ~15,21 GB, 742 tensores) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de LLM2Vec basado en Meta Llama 3 8B Instruct, concretamente la variante `McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp` con adaptadores supervisados (`...-mntp-supervised`). Sobre esa representacion se anade una cabeza MLP de dos clases cuyas matrices tienen formas `[2048, 4096]` y `[2, 2048]`, con biases correspondientes. El checkpoint incluye, por tanto, pesos del encoder, tensores de adaptador y la cabeza, y debe cargarse mediante la implementacion `SelectiveLLM2VecClassifier` del repositorio de codigo PoRT, no mediante clases estandar de Hugging Face.

El entrenamiento se realizo sobre TOFU v2.0 con entradas de tipo pregunta-respuesta y la configuracion CCL-SC, en la ejecucion 0815_1628. El estado del trainer retenido selecciona `checkpoint-6000` como mejor checkpoint, y el codigo de entrenamiento conservado carga ese mejor modelo antes de exportar el checkpoint raiz; los pesos intermedios ya no estan disponibles para comparacion byte a byte. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron RLHF/DPO (no aplica a un clasificador). La validacion realizada cubre estructura de fichero, tamano derivado de la cabecera y hashes SHA-256; la inferencia completa y la reproduccion exacta de las tablas del paper no se han vuelto a ejecutar para esta release.

## Capacidades

- Clasificacion binaria de pares pregunta-respuesta: determina si una respuesta pertenece o no al conjunto TOFU.
- Extraccion de representaciones de texto via LLM2Vec sobre Llama 3 8B Instruct (encoder bidireccional con adaptadores).
- Evaluacion de fuga de conocimiento en experimentos de machine unlearning.
- Integracion como juez automatico dentro del pipeline PoRT (`--classifier_base_model` y `--classifier_head_ckpt`).
- Soporte multilingue: limitado a ingles (`en`).
- No dispone de generacion de texto, tool calling, agentes, vision ni audio: es un clasificador, no un modelo generativo.
- No soporta modo thinking ni razonamiento multi-paso de forma nativa.

## Casos de uso

- Evaluacion de desaprendizaje TOFU: clasificar automaticamente las respuestas de un LLM sometido a unlearning para medir si retiene conocimiento del conjunto olvidado, usando el checkpoint como juez binario en lugar de evaluacion manual.
- Reproduccion de experimentos PoRT: cargar el checkpoint con `SelectiveLLM2VecClassifier` y los argumentos `--classifier_base_model` y `--classifier_head_ckpt` para replicar las tablas del pipeline archivado.
- Estudios de ablacion y thresholds: los scripts de ablation y threshold-study referencian explicitamente este checkpoint raiz, por lo que sirve como baseline fijo en comparaciones entre metodos de unlearning.
- Filtrado de datasets de evaluacion: separar pares QA que pertenecen a TOFU de los que no, para construir conjuntos de test limpios en investigacion sobre retencion de conocimiento.
- Analisis de robustez de jueces automaticos: comparar las decisiones del clasificador con anotaciones humanas para estimar sesgos y falsos positivos en la evaluacion de unlearning.
- Auditoria de modelos fine-tuneados: aplicar el clasificador a salidas de modelos ajustados con WMDP u otros benchmarks para detectar contaminacion cruzada de conocimiento (nota: este checkpoint es el de TOFU, no el clasificador fine-tuneado para WMDP).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la inferencia completa y la reproduccion exacta de las tablas del paper no se han vuelto a ejecutar para esta release, por lo que no se dispone de metricas de precision, recall, F1 ni latencia verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~16 GB en fp16/bf16 solo para los pesos (15,21 GB de safetensors); en la practica se necesita margen adicional para activaciones y el tokenizer del encoder, por lo que 24 GB es un minimo prudente.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) es el limite practico para fp16.
- Cabe en consumer GPU: si, en RTX 4090 24 GB y potencialmente en RTX 3090 24 GB; no cabe en GPUs de 16 GB o menos sin cuantizacion, que no esta documentada.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la carga oficial es via `safetensors.torch.load_file` y la clase `SelectiveLLM2VecClassifier` del repositorio PoRT, con dependencia de los repositorios upstream de McGill-NLP accesibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoRT-TOFU-Classifier | 7.555 M | no disponible | Clasificacion binaria QA (TOFU) | llama3 | Hugging Face, repo de codigo PoRT |
| McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp | ~8 B | no disponible | Embeddings de texto (encoder) | MIT (contribucion LLM2Vec) + Llama 3 | Hugging Face |
| McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised | ~8 B | no disponible | Embeddings supervisados | MIT (contribucion LLM2Vec) + Llama 3 | Hugging Face |
| Clasificador WMDP fine-tuneado (mencionado en la model card) | no disponible | no disponible | Clasificacion QA (WMDP) | no disponible | no disponible en esta release |

La comparativa directa con otros clasificadores TOFU publicados no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Llama 3 8B Instruct, hereda los sesgos del corpus de preentrenamiento de Meta, no cuantificados aqui.
- Riesgo de alucinacion: no aplica en sentido generativo, pero existe riesgo de falsos positivos/negativos en la clasificacion binaria, especialmente en respuestas ambiguas o parcialmente correctas.
- Limitaciones de contexto e idioma: solo ingles; la longitud de contexto efectiva no se especifica y depende del encoder Llama 3 subyacente.
- Restricciones de licencia: Meta Llama 3 Community License y Acceptable Use Policy (incluidas en `LICENSE-META-LLAMA3` y `USE_POLICY.md`); el uso comercial esta sujeto a condiciones adicionales de Meta y requiere atribucion ("Built with Meta Llama 3").
- Caveat de carga: no es un export estandar de `AutoModelForSequenceClassification`; debe cargarse con `SelectiveLLM2VecClassifier` y revisar `missing_keys`/`unexpected_keys` antes de experimentar.
- Dependencia de repositorios upstream: el constructor inicializa modelos y adaptadores de McGill-NLP, que deben ser accesibles; en repositorios privados se requiere autenticacion en Hugging Face.
- Reproducibilidad: no se ha verificado la inferencia completa ni la reproduccion exacta de las tablas del paper; los pesos intermedios de `checkpoint-6000` ya no existen para comparacion byte a byte.
- Alcance: es el checkpoint TOFU, no el clasificador fine-tuneado para WMDP; no debe usarse indistintamente para ambas tareas.

## Enlaces

- Hugging Face: https://huggingface.co/ChnIRuI111/PoRT-TOFU-Classifier
- Codigo PoRT: https://github.com/ChnIRuI/PoRT_LLM_Unlearning
- Modelo base LLM2Vec mntp: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Modelo base LLM2Vec mntp-supervised: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
