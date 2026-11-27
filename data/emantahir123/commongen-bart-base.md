# emantahir123/commongen-bart-base

## Resumen

`emantahir123/commongen-bart-base` es un ajuste fino de `facebook/bart-base` orientado a la tarea de generacion de frases a partir de un conjunto de palabras clave (keywords-to-sentence), un problema clasico de generacion condicionada que se evalua habitualmente con el dataset CommonGen de AllenAI. El modelo lo publica el usuario `emantahir123` como parte de un proyecto de un semestre, y se distribuye en formato safetensors con un total de 139.470.681 parametros.

Se trata de un modelo pequeno y de proposito muy especifico: no es un modelo de chat generalista ni un asistente, sino un generador de texto condicionado a una lista de conceptos que debe integrar en una frase coherente. Su interes practico esta en tareas de aumentacion de datos, generacion controlada de texto y como linea base ligera para experimentos de generacion condicionada, ya que cabe en practicamente cualquier GPU de consumo y se puede servir con infraestructura modesta.

La relevancia de esta ficha es acotada: el modelo no tiene descargas ni likes, la licencia no esta declarada y la unica metrica publicada es la del autor en el split de validacion (BLEU 30,74, ROUGE-L 60,62 y cobertura de keywords del 96,46%). Cualquier uso en produccion deberia tratar esas cifras como no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART, `facebook/bart-base`) con ajuste fino supervisado |
| Parametros totales | 139.470.681 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BART-base admite hasta 1024 tokens de entrada, limite arquitectonico del modelo base) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | text-generation |
| Dataset de ajuste | `allenai/common_gen` |

## Arquitectura y entrenamiento

El modelo parte de BART-base, un transformer encoder-decoder con atencion bidireccional en el encoder y autorregresiva en el decoder, disenado originalmente para denoising y generacion de secuencias. El ajuste fino se realiza sobre el dataset CommonGen de AllenAI, que consiste en conjuntos de conceptos (por ejemplo, `lake, paddle, canoe`) emparejados con frases que los contienen todos. El formato de entrada documentado por el autor es una instruccion en lenguaje natural del tipo `generate a sentence with: lake, paddle, canoe`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros, el numero de epocas ni si se aplicaron tecnicas de RLHF o DPO. Dado que BART-base no es un modelo instruido, es probable que el ajuste sea puramente supervisado sobre pares entrada-salida, pero esto no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada a una lista de palabras clave, integrando todos los conceptos en una unica frase gramatical.
- Generacion de texto autoregresiva estandar (pipeline `text-generation`).
- Cobertura de keywords alta segun el autor (96,46% en validacion), lo que indica que el modelo tiende a incluir los conceptos solicitados.
- Capacidad limitada al ingles; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking), vision ni audio.
- No se documenta capacidad de seguir instrucciones generales fuera del formato de keywords.

## Casos de uso

- Aumentacion de datos para entrenamiento: dado un conjunto de conceptos de un dominio concreto, el modelo genera frases que los contienen, lo que permite ampliar corpus etiquetados de forma automatica y barata.
- Generacion controlada en tareas de redaccion: forzar la inclusion de terminos obligatorios (productos, entidades, palabras clave SEO) en una frase generada, util en generacion de descripciones o snippets.
- Linea base de investigacion en generacion condicionada: sirve como referencia ligera de BART-base ajustado para comparar con modelos mayores en experimentos de keywords-to-sentence.
- Prototipado rapido en entornos con recursos limitados: al ocupar aproximadamente 0,6 GB en pesos y unos 140 M de parametros, se puede cargar en CPU o en GPUs de gama baja para pruebas de concepto.
- Generacion de ejemplos para evaluacion de sistemas: producir frases que cubren conjuntos de conceptos permite construir tests de cobertura semantica en pipelines de NLP.
- Educacion y demostraciones: ejemplo didactico de ajuste fino de un encoder-decoder para una tarea de generacion restringida, con metricas BLEU y ROUGE publicadas.

## Benchmarks y rendimiento

Unicos datos publicados por el autor en la model card, sobre el split de validacion de CommonGen:

| Metrica | Valor |
|---|---|
| BLEU | 30,74 |
| ROUGE-L | 60,62 |
| Cobertura de keywords | 96,46% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,56 GB solo para pesos (139,47 M de parametros), con overhead adicional de activaciones y cache de atencion; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,28 GB para pesos, mas activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch) es la via directa; al ser un modelo BART estandar, es compatible con `vLLM` y `TGI` en su variante encoder-decoder, aunque no se documenta soporte verificado para este checkpoint concreto. No se publican pesos GGUF, por lo que `llama.cpp` y `Ollama` requeririan conversion manual.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `emantahir123/commongen-bart-base` | 139,47 M | no disponible (limite BART-base: 1024 tokens) | Keywords-to-sentence (CommonGen) | no disponible | Hugging Face, safetensors |
| `facebook/bart-base` | ~139 M | 1024 tokens | Generacion general / denoising | MIT (modelo base) | Hugging Face |
| `facebook/bart-large` | ~406 M | 1024 tokens | Generacion general / denoising | MIT (modelo base) | Hugging Face |
| `t5-base` | ~220 M | 512 tokens | Text-to-text general | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia y tamano; no se dispone de resultados de benchmarks comparables publicados para este checkpoint frente a alternativas especificas de CommonGen.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Modelo entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Las metricas publicadas (BLEU, ROUGE-L, cobertura de keywords) provienen unicamente del autor y no han sido verificadas de forma independiente.
- Al ser un ajuste de BART-base, no esta instruido para conversacion general; fuera del formato `generate a sentence with: ...` el comportamiento es impredecible.
- Riesgo de alucinacion en el sentido de generar frases gramaticales que incluyan los conceptos pero con contenido factual inventado; el modelo no verifica hechos.
- Sesgos heredados de los datos de preentrenamiento de BART-base y del dataset CommonGen, no documentados ni mitigados en la model card.
- Sin descargas ni likes: no hay evidencia de uso en la comunidad ni de validacion por terceros.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de inferencia optimizados sin conversion previa.
- El repositorio es pequeno (0,6 GB) y la model card es minima; no hay documentacion sobre hiperparametros, epocas ni proceso de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/emantahir123/commongen-bart-base
- Modelo base: https://huggingface.co/facebook/bart-base
- Dataset CommonGen: https://huggingface.co/datasets/allenai/common_gen
- Paper CommonGen: https://arxiv.org/abs/1911.03705
- Paper BART: https://arxiv.org/abs/1910.13461
