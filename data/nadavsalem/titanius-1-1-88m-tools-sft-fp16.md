# NadavSalem/Titanius-1.1-88m-tools-sft-fp16

## Resumen

Titanius-1.1-88m-tools-sft-fp16 es un ajuste fino experimental orientado a acciones de herramienta (tool-use) sobre el modelo base Titanius-1.1-88m-base-fp16, desarrollado por el usuario independiente NadavSalem. Se trata de un transformer causal decoder-only de 88.080.405 parametros entrenables unicos (62.914.581 sin contar embeddings), con una ventana de contexto de 2.048 tokens y un tokenizador BPE byte-level propio de 32.768 entradas. Su funcion es emitir acciones canonicas en JSON o una decision explicita de no accion cuando la peticion no puede resolverse con los esquemas de herramientas disponibles.

El modelo se entrena mediante SFT supervisado sobre tareas sinteticas de un solo paso, con entre 4 y 8 esquemas de herramientas por prompt y como maximo una llamada por episodio. El checkpoint publicado es un estado parcial: corresponde al paso 200 de una ejecucion planificada de 1.000 pasos, interrumpida de forma limpia, que consumio 3.200 de las 17.500 filas disponibles (6.553.600 tokens de entrada y 207.108 tokens supervisados).

Su relevancia es acotada y de caracter investigador: sirve como banco de pruebas para estudiar como modelos muy pequenos (menos de 100 M de parametros) aprenden a seleccionar acciones directas y a abstenerse, y para experimentos con esquemas sinteticos y entornos simulados. El autor advierte explicitamente que es un checkpoint de investigacion, que el script de inferencia no valida ni ejecuta acciones y que no debe conectarse directamente a herramientas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 88.080.405 parametros entrenables unicos (62.914.581 no de embedding; 25.165.824 de embedding compartido entrada/salida) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No se han publicado versiones cuantizadas; el checkpoint se distribuye en FP16 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch FP16 (state dict `.pt`), sin safetensors ni GGUF |
| Capas | 10 |
| Tamano oculto | 768 |
| Cabezas de consulta / clave-valor | 12 / 4 (GQA), dimension de cabeza 64 |
| Anchura MLP | 3.072 |
| Vocabulario | 32.768 |
| Codificacion posicional | Rotary embeddings (RoPE) |
| Soft cap de logits de salida | 15 |
| Tamano del repositorio | 0,2 GB |
| Inferencia | Deshabilitada (`inference: false`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 10 capas, tamano oculto 768, 12 cabezas de consulta y 4 cabezas clave-valor con dimension de cabeza 64, lo que da atencion causal con grouped-query attention (GQA). Usa rotary embeddings (RoPE) como codificacion posicional, activacion Squared ReLU, anchura MLP de 3.072 y vocabulario de 32.768. Incorpora normalizacion RMS, normalizacion QK, embeddings de entrada y salida atados (la misma matriz compartida bajo `lm_head.weight` y `transformer.wte.weight`), escalado residual por capa, un residual de embedding de entrada y un residual de retroceso (backout) en capa intermedia. La salida aplica un soft cap de logits de 15.

El ajuste SFT partio del checkpoint base guardado en el paso 30.518 de un preentrenamiento de 2.000 millones de tokens. La ejecucion de SFT planifico 1.000 pasos, pero se detuvo limpiamente en el paso 200 tras una interrupcion; los datos publicados corresponden a ese estado parcial. Se procesaron 32.768 tokens de entrada por paso de optimizador, con tamano de lote de dispositivo 1 y acumulacion de gradiente de 16 pasos, AdamW con tasa de aprendizaje maxima 2e-5 (final planificada 2e-6), warmup del 3%, decaimiento coseno, weight decay 0,01, recorte de gradiente 1,0 y semilla 42. El entrenamiento se hizo en FP16 sobre una unica NVIDIA GeForce RTX 2060 SUPER; el checkpoint de trabajo conservaba pesos FP32 para las actualizaciones y esta version los convierte a FP16. La perdida de entrenamiento suavizada en el paso 200 fue 0,039964 y la perdida de validacion retenida 0,085816, calculada sobre 64 lotes que cubren 4.252 tokens supervisados. No se aplico RLHF ni DPO: el objetivo supervisa unicamente las salidas del asistente y sus tokens de fin.

## Capacidades

- Generacion de texto causal en ingles, incluyendo respuestas conversacionales con los marcadores propios del modelo.
- Seleccion de acciones directas de herramienta: dado un prompt con 4 a 8 esquemas, emite un objeto JSON canonico como `{"args":{...},"tool":"...","type":"tool_call"}`.
- Abtencion explicita: cuando la peticion no es resoluble emite un `no_action` con motivo (`unsupported`, `missing_tool`, `missing_argument`, `ambiguous`).
- Cierre de tarea: si el prompt incluye un resultado de herramienta, puede emitir un objeto `task_complete` que referencia el ID de ese resultado.
- Formato conversacional propio mediante tokens especiales `<|bos|>`, `<|user_start|>`, `<|user_end|>`, `<|assistant_start|>` y `<|assistant_end|>`.
- Tool calling de un solo paso: el formato esta pensado para tareas con como maximo una llamada por episodio.
- Soporte de agentes: limitado; no cubre planificacion multi-paso ni cadenas de razonamiento largas.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo de razonamiento explicito). No dispone de token de rol de sistema: el contenido de sistema se concatena con el mensaje de usuario siguiente.

## Casos de uso

- Investigacion sobre seleccion de acciones en modelos pequenos: se puede replicar el experimento de SFT sintetico y medir como varia la exactitud de la accion emitida segun el numero de pasos, sin necesidad de infraestructura GPU grande.
- Experimentos con esquemas sinteticos de herramientas: el modelo acepta entre 4 y 8 esquemas por prompt, por lo que sirve para estudiar la sensibilidad al numero y al orden de las herramientas ofrecidas.
- Estudio de abtencion y calibracion: los objetivos `no_action` con motivos distintos permiten analizar si el modelo aprende a decir "no puedo" ante falta de herramienta, falta de argumento o ambiguedad.
- Generacion de datos sinteticos etiquetados en formato JSON: sus salidas pueden usarse como borradores para construir conjuntos de datos de tool-use que despues se filtren manualmente.
- Educacion y demostraciones de formato de tool calling: sirve para mostrar a estudiantes como se serializa una llamada a herramienta y un cierre de tarea en un unico objeto JSON canonico.
- Pruebas de decodificacion restringida y validacion de esquemas: al no aplicar constrained decoding, es un caso de prueba util para comparar generacion libre frente a decodificacion guiada sobre un modelo diminuto.
- Evaluacion de riesgos de ejecucion directa: permite medir con que frecuencia un modelo de este tamano produce JSON malformado o argumentos inseguros cuando se le pide actuar sin validador.
- Prototipado con entornos simulados: en un banco de pruebas de casa domotica ficticia (por ejemplo, `home.set_device_state`) se puede comprobar la coherencia entre peticion y accion sin conectar nada real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card indica explicitamente que no se reporta exactitud de accion exacta sobre datos retenidos ni tasa de exito de ejecucion de herramientas. Los unicos datos numericos publicados son las perdidas de entrenamiento y validacion, que no son una medida de exito de la tarea:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento suavizada (paso 200) | 0,039964 |
| Perdida de validacion retenida (paso 200) | 0,085816 |
| Lotes de validacion / tokens supervisados evaluados | 64 lotes / 4.252 tokens |
| Pasos de SFT completados | 200 de 1.000 planificados |
| Filas de entrenamiento consumidas | 3.200 de 17.500 |
| Tokens de entrada / tokens supervisados | 6.553.600 / 207.108 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 los pesos ocupan aproximadamente 176 MB; sumando la cache KV para 2.048 tokens (10 capas x 4 cabezas KV x 64 de dimension x 2 tensores x 2 bytes) rondaria unos 21 MB adicionales, por lo que la inferencia puede caber holgadamente en menos de 1 GB de VRAM. En FP32 los pesos subirian a unos 352 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. El autor entreno en una unica NVIDIA GeForce RTX 2060 SUPER; tambien funciona en tarjetas integradas o en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en hardware de gama baja.
- Opciones de despliegue: el repositorio incluye un script `inference.py` con una arquitectura PyTorch propia; requiere instalar PyTorch y `tokenizers`. No se proporciona integracion con vLLM, llama.cpp, Ollama ni TGI, y al ser una implementacion custom no son compatibles de forma inmediata.
- Latencia y throughput: no disponibles. La model card advierte que la inferencia en CPU puede ser lenta porque la generacion no usa cache KV, lo que degrada el rendimiento respecto a una implementacion optimizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Titanius-1.1-88m-tools-sft-fp16 | 88.080.405 | 2.048 | SFT de tool-use, paso 200 de 1.000 | no disponible | HuggingFace (pesos FP16 `.pt`) |
| Titanius-1.1-88m-base-fp16 | Arquitectura identica | 2.048 | Modelo base preentrenado, checkpoint final del paso 30.518 | no disponible | HuggingFace |
| Titanius-1.1-88m-sft-fp16 | Arquitectura identica | 2.048 | SFT de instrucciones general | no disponible | HuggingFace |

No se han identificado en la informacion disponible modelos de terceros comparables de la misma categoria (tool-use directo en la franja de 88 M de parametros). Las alternativas listadas son variantes del mismo autor sobre la misma arquitectura y no constituyen modelos competidores independientes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta evaluacion de sesgos.
- Riesgo de alucinacion: alto en la practica. El modelo puede generar JSON malformado, incorrecto o inseguro de ejecutar, y el script de inferencia no valida acciones ni aplica el esquema de herramientas.
- Aviso del autor: no conectar la salida del modelo directamente a herramientas reales.
- Cobertura de entrenamiento: solo ejemplos sinteticos de la etapa `01_direct`; no cubre planificacion multi-paso ni uso de herramientas del mundo real.
- Checkpoint parcial: entrenamiento detenido en el paso 200 de 1.000, con 3.200 de 17.500 filas consumidas; los pesos no son el resultado final previsto.
- Falta de metricas: no hay exactitud de accion retenida, tasa de exito de ejecucion ni benchmark estandarizado.
- Idioma: unicamente ingles; sin soporte multilingue.
- Contexto limitado: 2.048 tokens, insuficiente para conversaciones largas o muchos esquemas simultaneos.
- Sin token de sistema: el contenido de rol de sistema se fusiona con el mensaje de usuario, lo que puede alterar el formato esperado.
- Inferencia lenta en CPU: la generacion no usa cache KV.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial; debe asumirse restringido hasta que el autor lo aclare.
- Idiomas y datos: al entrenarse sobre datos sinteticos y `karpathy/climbmix-400b-shuffle` en la fase base, no hay garantia de generalizacion fuera de los esquemas sinteticos vistos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NadavSalem/Titanius-1.1-88m-tools-sft-fp16
- Modelo base: https://huggingface.co/NadavSalem/Titanius-1.1-88m-base-fp16
- Checkpoint base concreto: https://huggingface.co/NadavSalem/Titanius-1.1-88m-base-fp16/blob/main/model_step_30518.pt
- Variante SFT de instrucciones: https://huggingface.co/NadavSalem/Titanius-1.1-88m-sft-fp16
- Dataset base usado en el preentrenamiento: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Referencia tecnica sobre el formato FP16: https://en.wikipedia.org/wiki/Half-precision_floating-point_format
