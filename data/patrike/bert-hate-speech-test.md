# Patrike/bert-hate-speech-test

## Resumen

`Patrike/bert-hate-speech-test` es un modelo de clasificacion de texto basado en `google-bert/bert-base-uncased`, ajustado para la deteccion de discurso de odio (hate speech). Lo desarrolla el usuario Patrike y se publica bajo licencia Apache 2.0. El modelo cuenta con 109.484.547 parametros y un tamano de repositorio de 0,4 GB, con pesos en formato safetensors.

La model card es generada automaticamente por el Trainer de HuggingFace y carece de informacion detallada sobre el dataset de entrenamiento, los casos de uso previstos o las limitaciones. Los unicos datos de evaluacion declarados son una perdida de 0,7321 y una exactitud de 0,6667 sobre el conjunto de evaluacion, lo que indica un rendimiento modesto. Con cero descargas y cero likes, el modelo parece ser un experimento o prueba de concepto mas que un artefacto listo para produccion.

Su relevancia radica en que ejemplifica el flujo tipico de ajuste fino de BERT para tareas de moderacion de contenido, aunque su exactitud limitada y la ausencia de documentacion lo desaconsejan para uso en entornos reales sin una evaluacion adicional exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer, 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 109.484.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base bert-base-uncased esta entrenado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un encoder transformer de 12 capas con 110 millones de parametros aproximadamente, preentrenado con masked language modeling y next sentence prediction sobre corpus en ingles. El ajuste fino se realizo con el Trainer de HuggingFace sobre un dataset no especificado en la model card.

Los hiperparametros de entrenamiento declarados son: tasa de aprendizaje de 5e-05, tamano de lote de 8 tanto para entrenamiento como para evaluacion, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 epocas. No se menciona el uso de tecnicas como RLHF, DPO o cualquier innovacion arquitectonica adicional; se trata de un ajuste fino clasico de clasificacion de secuencias.

## Capacidades

- Clasificacion de texto binaria o multiclase para deteccion de discurso de odio, ofensa o contenido neutro, segun la configuracion del dataset de entrenamiento (no especificado).
- Comprension del lenguaje general heredada de BERT base, incluyendo razonamiento contextual limitado a la ventana de 512 tokens.
- Inferencia eficiente en CPU y GPU gracias a su tamano reducido (109M parametros).
- Compatible con el ecosistema HuggingFace Transformers, incluyendo pipelines de `text-classification` y despliegue con Text Embeddings Inference.
- No se ha documentado soporte para tool calling, agentes, vision, audio ni modos de razonamiento especiales.

## Casos de uso

- Moderacion de comentarios en redes sociales: el modelo puede clasificar comentarios de usuarios como odiosos u ofensivos, aunque su exactitud del 66,67 % exige una revision humana posterior o un umbral de confianza conservador.
- Filtrado de contenido en foros y comunidades online: integrable como paso previo en pipelines de publicacion para bloquear o marcar mensajes que incumplan las normas de la comunidad.
- Triaje de mensajes en atencion al cliente: clasificacion de tickets de soporte que contengan lenguaje abusivo hacia el personal, priorizando su derivacion a supervision.
- Investigacion academica sobre toxicidad online: util como punto de partida para estudios comparativos de modelos de deteccion de odio, aunque requiere reentrenamiento con datos etiquetados de calidad.
- Pre-filtrado en pipelines de NLP: descartar textos ofensivos antes de pasarlos a modelos generativos o de analisis de sentimiento para evitar sesgos en los resultados.
- Prototipado rapido de sistemas de moderacion: al ser un modelo pequeno y con licencia permisiva, sirve para validar conceptos y flujos de trabajo antes de invertir en modelos de mayor rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace muestra un array vacio de resultados. Los unicos datos de evaluacion declarados en la model card son:

| Metrica | Valor |
|---|---|
| Perdida (loss) | 0,7321 |
| Exactitud (accuracy) | 0,6667 |

Estos valores corresponden al conjunto de evaluacion utilizado durante el entrenamiento, cuyo origen y composicion no se especifican. Una exactitud de 0,6667 es sustancialmente inferior a la que suelen alcanzar modelos de deteccion de odio bien entrenados (tipicamente por encima del 0,85 en datasets publicos como Hate Speech and Offensive Language).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 438 MB en FP32, 219 MB en FP16 e inferior a 120 MB en INT8, dado el tamano de 109M parametros.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en Apple Silicon con Metal.
- Ejecucion en CPU: viable para inferencia por lotes pequenos; en un CPU moderno se pueden procesar decenas de secuencias por segundo.
- Opciones de despliegue: HuggingFace Transformers con pipeline de `text-classification`, vLLM, HuggingFace Text Generation Inference (TGI), ONNX Runtime, o servicios gestionados como HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible; dependen del hardware y del backend de inferencia elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud declarada | Licencia | Notas |
|---|---|---|---|---|---|
| Patrike/bert-hate-speech-test | 109M | 512 | 0,6667 | Apache 2.0 | Ajuste fino sobre dataset desconocido, documentacion minima |
| GroNLP/hateBERT | 110M | 512 | no disponible | no disponible | BERT reentrenado con lenguaje abusivo de Reddit, disenado especificamente para deteccion de odio |
| bert-base-uncased (base) | 110M | 512 | no aplica | Apache 2.0 | Modelo base sin ajuste fino, no especializado en deteccion de odio |

La comparativa se limita a modelos de la misma familia arquitectonica. `hateBERT` es la alternativa mas relevante en el ambito de deteccion de odio, al haber sido preentrenado con datos de lenguaje abusivo, lo que suele traducirse en mejor rendimiento que un ajuste fino clasico sobre BERT base. No se dispone de datos de rendimiento publicos de hateBERT para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Exactitud limitada: el 66,67 % de exactitud en evaluacion es insuficiente para uso en produccion sin supervision humana o umbrales de confianza estrictos.
- Dataset de entrenamiento desconocido: la model card no especifica la procedencia, tamano ni composicion de los datos de entrenamiento, lo que impide evaluar sesgos y generalizacion.
- Riesgo de alucinacion y falsos positivos: en tareas de clasificacion de odio, una exactitud baja implica tanto falsos positivos (contenido legitimo marcado como odio) como falsos negativos (odio no detectado).
- Idioma: el modelo base esta entrenado en ingles; no se ha documentado soporte para otros idiomas.
- Documentacion insuficiente: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento, lo que dificulta su adopcion responsable.
- Sin garantias de rendimiento: al ser un modelo de prueba con cero descargas, no ha sido validado por la comunidad ni sometido a evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre los datos de entrenamiento puede generar problemas de atribucion o cumplimiento si esos datos tienen restricciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Patrike/bert-hate-speech-test
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- hateBERT (modelo comparable): https://huggingface.co/GroNLP/hateBERT
- Articulo sobre deteccion de odio con BERT (IEEE): https://ieeexplore.ieee.org/document/10923943
- Articulo sobre deteccion de odio con BERT fine-tuned (IEEE): https://ieeexplore.ieee.org/document/10880992
- Repositorio de referencia para deteccion de odio con BERT: https://github.com/PyAntony/hate-speech
