# open-sci/sft__ot30k_Qwen3-1.7B-Base

## Resumen

`sft__ot30k_Qwen3-1.7B-Base` es un ajuste fino supervisado (SFT) del modelo base Qwen3-1.7B-Base, publicado por la organizacion open-sci en HuggingFace. El modelo se ha entrenado con Llama Factory sobre un subconjunto de 30.000 muestras del dataset Open Thoughts 3.1.2, un corpus orientado a razonamiento y pensamiento de cadena. El resultado es un modelo conversacional de 1.720 millones de parametros que hereda la arquitectura transformer decoder-only de la familia Qwen3.

El modelo resuelve el problema de especializar un modelo base pequeno en tareas de razonamiento estructurado sin necesidad de un modelo enorme. Con 1.7B de parametros, es desplegable en hardware modesto y sirve como punto de partida para experimentos de ajuste fino o como componente de pipelines de generacion de texto con requisitos de latencia bajos. Su relevancia actual radica en que demuestra que el SFT sobre datos de razonamiento curado (Open Thoughts) puede aplicarse a modelos de menos de 2B de parametros, un segmento en el que la oferta de modelos especificamente entrenados para razonamiento es limitada.

La model card es generica y generada automaticamente por el Trainer de HuggingFace, sin informacion detallada sobre composicion del dataset, evaluacion o usos previstos. Los datos disponibles son los del repositorio (parametros, hiperparametros de entrenamiento, licencia) y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) del checkpoint Qwen3-1.7B-Base. La arquitectura subyacente es la de Qwen3: un transformer decoder-only con atencion por cabezas y normalizacion RMSNorm, en su variante de 1,7B de parametros. No se trata de un modelo MoE ni hibrido; es un transformer denso estandar. El entrenamiento se realizo con Llama Factory, como indican las etiquetas `llama-factory` y `full`.

Los hiperparametros documentados son: learning rate de 4e-05, batch total de 128 (batch por dispositivo 1, 32 dispositivos, 4 pasos de acumulacion de gradiente), 5 epocas, scheduler coseno con warmup del 10%, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42. El dataset de entrenamiento es un subconjunto de 30.000 muestras de Open Thoughts 3.1.2 (`open-thoughts_open_thoughts3-1.2_m_30000_samples`), un corpus de razonamiento. No se especifica el numero total de tokens procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO posteriores; la model card no menciona ninguna fase de alineacion adicional. El framework utilizado fue Transformers 4.55.0, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.21.4.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, por lo que esta orientado a dialogos multi-turno.
- Razonamiento estructurado: entrenado sobre Open Thoughts, un dataset de pensamiento de cadena, lo que sugiere capacidad para producir razonamientos paso a paso, aunque no se documenta explicitamente un modo "thinking".
- Codigo y matematicas: no confirmado en la model card; el dataset de entrenamiento (Open Thoughts) suele incluir problemas de razonamiento matematico y logico, pero no hay declaracion explicita.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno en entornos de desarrollo con recursos limitados, gracias a sus 1,7B de parametros y a su formato conversacional, lo que permite iterar rapidamente sin infraestructura de gran escala.
- Generacion de razonamiento paso a paso en dominios educativos: al haberse entrenado sobre Open Thoughts, puede emplearse para generar explicaciones detalladas de problemas, util en tutores automaticos o generacion de material didactico.
- Base para ajuste fino adicional: su tamano reducido y su condicion de modelo SFT lo convierten en un punto de partida adecuado para experimentos de DPO, RLHF o SFT especifico de dominio con presupuesto de computo moderado.
- Clasificacion y extraccion de informacion con justificacion: el modelo puede generar cadenas de razonamiento antes de emitir una etiqueta o un campo extraido, lo que facilita la auditoria de decisiones en pipelines de procesamiento de documentos.
- Generacion de codigo en entornos con restricciones de VRAM: con cuantizacion a 4 bits cabe en GPUs de consumo, lo que permite usarlo en estaciones de trabajo para autocompletado o generacion de fragmentos de codigo, siempre que se valide su calidad en esta tarea.
- Experimentacion academica en tecnicas de SFT: el repositorio documenta hiperparametros completos (learning rate, batch, epocas, scheduler), lo que lo hace util como referencia reproducible para estudiar el efecto del SFT sobre modelos de 1,7B.
- Despliegue en edge o servidores modestos: su tamano permite servirlo con llama.cpp u Ollama en CPU o GPU de gama media para tareas de generacion de texto de baja latencia.

## Benchmarks y rendimiento

La model card declara una entrada de `model-index` con `results: []`, es decir, sin resultados de evaluacion. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto.
- VRAM estimada en cuantizacion 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 1,2 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits puede caber en GPUs con 6-8 GB.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo), y Transformers con `pipeline("text-generation")`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci/sft__ot30k_Qwen3-1.7B-Base | 1,72B | no disponible | other | safetensors | SFT sobre Open Thoughts 30k |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | safetensors | Modelo base original, sin SFT |
| Qwen/Qwen3-1.7B | 1,72B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | safetensors | Variante instruct/chat oficial |
| open-sci/sft__ot30k_Qwen3-4B-Base (si existe) | no disponible | no disponible | other | safetensors | Variante de mayor tamano de la misma familia de experimentos |

La comparativa se limita a la familia Qwen3 porque no se dispone de datos de rendimiento del modelo evaluado; no se puede afirmar superioridad o inferioridad frente a alternativas sin benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que no se puede verificar la calidad del ajuste fino frente al modelo base.
- Model card incompleta: la propia model card indica "More information needed" en descripcion, usos previstos y datos de evaluacion; el autor no ha documentado el proceso.
- Licencia "other": no es una licencia estandar como Apache 2.0 o MIT; es necesario revisar los terminos exactos en el repositorio antes de cualquier uso comercial, y la licencia del modelo base Qwen3 puede imponer condiciones adicionales.
- Riesgo de alucinacion: al ser un modelo de 1,7B y no haberse documentado alineacion (RLHF/DPO), es probable que presente alucinaciones y errores factuales, especialmente en dominios especializados.
- Idiomas no declarados: no se especifica que idiomas soporta; el rendimiento fuera del ingles (idioma dominante en datasets de razonamiento como Open Thoughts) es incierto.
- Contexto no confirmado: no se documenta la longitud de contexto efectiva tras el SFT; el entrenamiento con Llama Factory puede haber alterado la ventana original del base.
- Sesgos: no se ha documentado ningun analisis de sesgos; al entrenarse sobre un dataset de razonamiento, puede heredar sesgos de las fuentes de Open Thoughts.
- Sin garantias de produccion: al no haber evaluacion ni documentacion de robustez, no es recomendable desplegarlo en produccion sin una validacion propia exhaustiva.
- Fecha de creacion futura (2026-10-30): el repositorio muestra una fecha de creacion posterior a la actual, lo que puede indicar un error de metadatos o un artefacto de la plataforma; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/open-sci/sft__ot30k_Qwen3-1.7B-Base
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset Open Thoughts: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M (referencia del dataset citado en la model card)
- Llama Factory: https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
