# leomaurodesenv/electra-base-discriminator-jailbreakv-28k-augmented

## Resumen

`electra-base-discriminator-jailbreakv-28k-augmented` es un clasificador de texto en inglés orientado a la detección de *jailbreaks* y prompts maliciosos, publicado por el usuario leomaurodesenv en HuggingFace. Se trata de un ajuste fino (*fine-tuning*) del modelo discriminador `google/electra-base-discriminator`, un transformer encoder bidireccional de 109.483.778 parámetros (unos 109,5 millones) preentrenado originalmente con el objetivo de detección de tokens reemplazados (*replaced token detection*). El nombre del repositorio sugiere que el ajuste se ha realizado sobre una variante aumentada del conjunto de datos JailbreakV-28K, aunque la propia model card no documenta el dataset empleado.

El modelo resuelve una tarea de clasificación binaria o multiclase de una sola pasada: dada una instrucción o prompt, predecir si constituye un intento de *jailbreak* (elusión de las salvaguardas de un LLM). Es relevante porque los guardarraíles de entrada (*input guardrails*) se han convertido en un componente habitual en arquitecturas de aplicaciones con LLM, y un clasificador dedicado de ~110 M de parámetros es mucho más barato de desplegar que un LLM juez de gran tamaño.

La ficha oficial es extremadamente escasa: no especifica dataset de entrenamiento, idiomas, ni métricas desglosadas. El autor declara una *accuracy* de 1.0 y una *loss* de 0.0000 en el conjunto de evaluación desde la primera época, un resultado que debe interpretarse con máxima cautela por posible sobreajuste o fuga de datos entre entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder bidireccional, rol de discriminador) |
| Parametros totales | 109.483.778 (~109,5 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima estandar de ELECTRA-base; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (el modelo base ELECTRA se preentreno principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con transformers) |

Datos adicionales: tamano del repositorio 1,8 GB, creado y actualizado el 13 de septiembre de 2026, pipeline `text-classification`, metrica declarada `accuracy`.

## Arquitectura y entrenamiento

La arquitectura subyacente es ELECTRA en su variante *base discriminator*: un transformer encoder bidireccional de 12 capas con atencion multi-cabeza, disenado para producir representaciones contextuales token a token. A diferencia de los modelos enmascarados clasicos (BERT), ELECTRA se preentrena con deteccion de tokens reemplazados, una tarea mas eficiente en terminos de senal por token. Sobre esa base, este repositorio anade una cabeza de clasificacion de secuencia para la tarea de deteccion de jailbreaks.

Los hiperparametros de ajuste fino documentados son: `learning_rate` 2e-05, `train_batch_size` 8, `eval_batch_size` 8, `gradient_accumulation_steps` 2 (tamano de lote total efectivo 16), semilla 42, optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal con 50 pasos de calentamiento y 10 epocas. El numero de pasos por epoca registrado es 1121, lo que implica un conjunto de entrenamiento del orden de 8.968 ejemplos por epoca (1121 x 8), aunque el dataset exacto no se declara. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion; tampoco innovaciones de decodificacion. El autor no describe la composicion del dataset ni si aplico tecnicas de aumento de datos pese a que el nombre del repositorio incluye el termino `augmented`.

## Capacidades

- Clasificacion de texto de una sola pasada orientada a la deteccion de *jailbreaks* y prompts de elusion de politicas.
- Etiquetado de instrucciones potencialmente maliciosas como senal de entrada para guardarrailes de aplicaciones LLM.
- Inferencia rapida y de bajo coste al tratarse de un encoder de ~109 M de parametros.
- Compatible con el ecosistema `transformers` mediante `AutoModelForSequenceClassification` y `pipeline("text-classification")`.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingues: no disponibles; el modelo base ELECTRA esta preentrenado principalmente en ingles.
- Capacidades especiales (vision, audio, modo *thinking*): no disponibles.

## Casos de uso

- Guardarrail de entrada para *chatbots*: clasificar cada prompt del usuario antes de enviarlo al LLM principal, bloqueando intentos de *jailbreak* con una latencia de milisegundos gracias al tamano reducido del modelo.
- Moderacion de contenido en plataformas de usuario: filtrar en tiempo real instrucciones que intentan generar contenido prohibido, integrar el clasificador en la capa previa al LLM.
- Monitorizacion de seguridad en *pipelines* de *red teaming*: etiquetar automaticamente grandes volumenes de prompts de prueba para identificar que variantes de ataque superan los filtros.
- Investigacion en seguridad de LLM: servir como modelo de referencia (*baseline*) en estudios comparativos de robustez frente a *jailbreaks*, dado que es un ajuste fino reproducible sobre ELECTRA-base.
- Deteccion de *prompt injection* en agentes: clasificar entradas provenientes de fuentes externas (documentos, paginas web) antes de incorporarlas a la ventana de contexto de un agente.
- Filtrado por lotes en conjuntos de datos de instrucciones: preprocesar y etiquetar corpus de instrucciones para entrenamiento de modelos, retirando ejemplos que constituyan intentos de elusion.
- *Routing* condicional en arquitecturas multi-modelo: usar la salida del clasificador para decidir si una peticion requiere un modelo con politicas de seguridad reforzadas.

## Benchmarks y rendimiento

El *model-index* del repositorio esta vacio (`"results": []`), por lo que no hay benchmarks externos publicados. La unica informacion disponible son los resultados de evaluacion declarados por el autor en la model card:

| Conjunto | Loss | Accuracy |
|---|---|---|
| Validacion (epoca 1) | 0,0001 | 1,0 |
| Validacion (epoca 2) | 0,0000 | 1,0 |
| Validacion (epocas 3-10) | 0,0000 | 1,0 |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La *accuracy* perfecta de 1,0 desde la primera epoca es un indicio de posible sobreajuste severo, fuga entre entrenamiento y evaluacion, o un conjunto de validacion excesivamente sencillo o mal separado. No debe tomarse como una estimacion fiable del rendimiento en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 440 MB en FP32, unos 220 MB en FP16/BF16 y del orden de 110 MB en cuantizacion INT8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. No requiere A100 ni H100; tarjetas como RTX 3060, RTX 4090 o incluso GPUs integradas son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, y tambien en CPU sin problemas de latencia para cargas moderadas.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con PyTorch, ONNX Runtime, NVIDIA Triton. `vLLM` y `llama.cpp` no son aplicables (no es un modelo generativo y los pesos son safetensors de un encoder).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera una latencia inferior a 10 ms por secuencia corta en GPU moderna, pero este dato no esta confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leomaurodesenv/electra-base-discriminator-jailbreakv-28k-augmented | 109,5 M | 512 (estandar) | Clasificacion de jailbreaks | Apache 2.0 | HuggingFace |
| google/electra-base-discriminator | ~110 M | 512 | Encoder preentrenado (deteccion de tokens reemplazados) | Apache 2.0 | HuggingFace |
| leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented | no disponible | no disponible | Clasificacion de jailbreaks | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos, ya que ninguno publica resultados de benchmarks en la informacion disponible. El modelo base `google/electra-base-discriminator` no es un clasificador de jailbreaks por si mismo: requeriria un ajuste fino adicional para esa tarea.

## Limitaciones y advertencias

- La *accuracy* de 1,0 declarada en validacion debe tratarse como sospechosa; no hay evaluacion en un conjunto de prueba independiente ni validacion cruzada.
- La model card no documenta el dataset de entrenamiento, su composicion ni el proceso de aumento de datos, lo que impide reproducir o auditar el ajuste.
- No se declaran idiomas soportados. Al derivar de ELECTRA-base (principalmente ingles), es probable que el rendimiento en castellano u otros idiomas sea pobre, pero esto no esta confirmado.
- Sesgos conocidos: no documentados por el autor. Al ser un clasificador de seguridad, existe riesgo de falsos positivos que bloqueen consultas legitimas (por ejemplo, investigacion en seguridad o terminos tecnicos).
- Riesgo de alucinacion: no aplica directamente a un clasificador, pero si hay riesgo de clasificaciones erroneas (falsos positivos y falsos negativos) en prompts ambiguos o fuera de la distribucion de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios.
- Caveat para produccion: usar el modelo como un unico mecanismo de seguridad es insuficiente; se recomienda combinarlo con otras capas de defensa y con monitorizacion continua, especialmente dada la falta de documentacion del dataset y de evaluaciones externas.
- Riesgo de desactualizacion: los ataques de *jailbreak* evolucionan rapidamente, por lo que un clasificador entrenado sobre un corpus de 2024-2026 puede degradarse frente a tecnicas nuevas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/electra-base-discriminator-jailbreakv-28k-augmented
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Modelo relacionado (mismo autor): https://huggingface.co/leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented

Nota: la busqueda web asociada a este modelo no devolvio enlaces tecnicos relevantes (papers, blogs o repositorios adicionales); los resultados obtenidos correspondian a contenidos sin relacion con el modelo.
