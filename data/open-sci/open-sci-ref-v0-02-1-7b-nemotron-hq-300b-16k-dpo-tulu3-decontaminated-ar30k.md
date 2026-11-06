# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) publicado por la organizacion open-sci sobre el checkpoint base `ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated`. Con 1.714.377.728 parametros (aproximadamente 1,7 mil millones), se trata de un modelo de la familia Nemotron-H, segun se deduce del nombre del checkpoint base, orientado a tareas de generacion y extraccion de caracteristicas dentro del pipeline de transformers.

El modelo se ha entrenado con el framework LLaMA-Factory sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`, un conjunto de 30.000 muestras en formato ShareGPT orientado a razonamiento. El nombre del repositorio sugiere que el checkpoint base incorpora una fase de DPO sobre Tulu 3 y un proceso de decontaminacion, ademas de un contexto de 16.000 tokens, aunque la model card no documenta estos detalles de forma explicita.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de investigacion con muy poca traccion (15 descargas, 0 likes) y documentacion minima, por lo que debe evaluarse con cautela antes de cualquier uso en produccion. Su interes principal reside en ser un ejemplo de cadena de ajuste (DPO + SFT) sobre una base Nemotron-H de 1,7B, util para reproducir experimentos de razonamiento a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Nemotron-H, segun el nombre del checkpoint base; no confirmado en la model card) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.000 tokens (inferido del nombre del checkpoint base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar terminos) |
| Formato de pesos | safetensors |
| Libreria | transformers (custom_code) |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | feature-extraction |
| Dataset de ajuste | AceReason-1.1-SFT-30k-sharegpt-hf |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El identificador del checkpoint base (`nemotron-hq`) apunta a la familia Nemotron-H de NVIDIA, pero no se aporta confirmacion ni detalle sobre el tipo de atencion, el uso de capas recurrentes o hibridas, ni la composicion exacta del bloque transformer. El modelo se distribuye con `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y que parte de la implementacion viaja dentro del repositorio.

El entrenamiento consistio en un ajuste fino completo (no LoRA) sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, con los siguientes hiperparametros: learning rate de 4e-05, batch total de 128 (batch por dispositivo 1, 32 dispositivos, 4 pasos de acumulacion de gradiente), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42. Se ejecuto en configuracion multi-GPU con 32 dispositivos. Las versiones de framework fueron Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO en este ajuste concreto (el DPO aparece en el nombre del checkpoint base, no en este SFT).

## Capacidades

- Generacion de texto autoregresiva mediante `transformers`, con pesos en safetensors.
- Razonamiento y resolucion de problemas, dado que el dataset de ajuste (AceReason-1.1-SFT-30k) esta orientado a tareas de razonamiento.
- Extraccion de caracteristicas (pipeline declarado `feature-extraction`), aunque el ajuste SFT sobre datos de razonamiento hace que este uso sea secundario.
- Conversacion multi-turno en formato ShareGPT, formato en el que se entreno el dataset.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado explicitamente, aunque el dataset de razonamiento sugiere cierta capacidad).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion academica en razonamiento a pequena escala: el modelo sirve como punto de partida reproducible (hiperparametros y dataset documentados) para estudiar el efecto de un SFT sobre una base ya sometida a DPO, en un entorno de 1,7B parametros que cabe en una sola GPU.
- Generacion de cadenas de razonamiento para destilacion: se puede usar para producir trazas de razonamiento sobre problemas matematicos o logicos y filtrarlas para entrenar modelos mayores o datasets sinteticos.
- Prototipado de asistentes conversacionales de bajo coste: con 1,7B parametros y pesos safetensors, permite desplegar un chatbot de prueba en una GPU consumer antes de escalar a un modelo mayor.
- Evaluacion de pipelines de ajuste con LLaMA-Factory: al estar generado con esta herramienta y con todos los hiperparametros publicados, es util como caso de referencia para validar configuraciones de entrenamiento full fine-tuning.
- Investigacion sobre decontaminacion de datasets: el nombre del checkpoint base incluye la etiqueta `decontaminated`, lo que lo hace candidato para estudiar el impacto de la limpieza de datos en el rendimiento de razonamiento.
- Extraccion de embeddings o caracteristicas para tareas downstream: el pipeline declarado es `feature-extraction`, de modo que puede emplearse para obtener representaciones ocultas en clasificacion o clustering de texto, con la cautela de que el ajuste SFT puede haber alterado el espacio latente.
- Base para nuevos ajustes SFT o DPO en dominios especificos: al ser un checkpoint intermedio de una cadena de ajuste, es adecuado como inicializacion para experimentos posteriores con presupuesto reducido.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `sft__AceReason-1-1-SFT-30k-sharegpt-hf__open-sci-re-a9cddb06__sdpa-open-sci-steps`, pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB para pesos (si se generan pesos GGUF o AWQ, no incluidos en el repositorio).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para inferencia en BF16; A100 o H100 no son necesarias para inferencia, pero si para reproducir el entrenamiento con 32 dispositivos.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas para FP16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`); vLLM y TGI no estan confirmados para esta arquitectura concreta; llama.cpp y Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-ar30k | 1,71B | 16k (inferido) | other | Hugging Face, 15 descargas | SFT sobre base DPO; documentacion minima |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | Hugging Face, ampliamente usado | Base solida, benchmarks publicados, ecosistema maduro |
| Llama-3.2-1B-Instruct | 1,24B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto largo, buen soporte de tooling |
| SmolLM2-1.7B-Instruct | 1,71B | 8k | Apache 2.0 | Hugging Face, ampliamente usado | Mismo orden de parametros, benchmarks publicados |

La comparacion se basa en el tamano y la categoria (modelos instructivos de ~1-2B); no hay datos de rendimiento del modelo open-sci que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es autogenerada y contiene secciones "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Licencia `other` sin terminos especificados: no se puede asumir uso comercial libre; es necesario contactar con el autor o revisar el repositorio del checkpoint base antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles, que es el idioma predominante en los datasets ShareGPT de razonamiento.
- Riesgo de alucinacion: como todo modelo de 1,7B ajustado con SFT sobre datos de razonamiento, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en matematicas de varios pasos.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio; conviene auditar los archivos `.py` antes de cargarlo.
- Traccion minima (15 descargas, 0 likes): no ha sido validado por la comunidad ni sometido a evaluaciones independientes.
- El pipeline declarado es `feature-extraction`, no `text-generation`, lo que puede indicar que el autor no lo considera optimizado para generacion abierta o que la etiqueta es simplemente heredada del proceso de subida.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas establecidas.
- La cadena de ajuste (DPO + SFT) no esta documentada en detalle; se desconoce si el checkpoint base conserva sesgos del dataset Tulu 3 o del proceso de decontaminacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-ar30k
- Checkpoint base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset AceReason-1.1-SFT-30k-sharegpt-hf: no disponible (referencia local en la model card, sin enlace publico)
- Paper o blog del modelo: no disponible
- Repositorio de codigo adicional: no disponible
- Demo: no disponible
