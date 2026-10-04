# parth12-ui/anlp-a2-optim-mars

## Resumen

`parth12-ui/anlp-a2-optim-mars` es un transformer decoder-only denso de 33,4 millones de parametros (8 capas, d_model 512, contexto de 256 tokens) entrenado desde cero para prediccion del siguiente token. No es un modelo de proposito general ni un producto listo para produccion: es el artefacto de la segunda parte de una practica de la asignatura ANLP (Advanced Natural Language Processing), publicado por el usuario `parth12-ui`. El repositorio ocupa 0,1 GB y no acumula descargas ni valoraciones en el momento de la consulta.

Su interes tecnico no esta en las capacidades del modelo, sino en el experimento que documenta: comparar optimizadores. El entrenamiento se realizo con un optimizador implementado desde cero llamado **mars**, encuadrado por el autor en la categoria de "AdamW con reduccion de varianza", con hiperparametros concretos (lr=0.001, betas=[0.95, 0.99], eps=1e-08, gamma=0.025, weight_decay=0.1). El corpus es `browndw/human-ai-parallel-corpus` y se consumio exactamente una pasada completa, 39.075.840 tokens.

Los resultados publicados son modestos y coherentes con ese presupuesto de computo: perdida de validacion 3.9895, perplejidad de validacion 54,03 y BLEU de test de 1,38 sobre continuaciones greedy de 64 tokens. El modelo es relevante unicamente como referencia reproducible para estudiar el comportamiento de optimizadores en modelos pequenos, no como alternativa a ningun modelo de generacion de texto actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE, no SSM) |
| Parametros totales | 33.366.528 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Capas | 8 |
| Dimension del modelo (d_model) | 512 |
| Dataset de entrenamiento | browndw/human-ai-parallel-corpus |
| Tokens de entrenamiento | 39.075.840 (1x el dataset) |
| Optimizador | mars (implementado desde cero, categoria "variance-reduced AdamW") |
| Hiperparametros del optimizador | lr=0.001, betas=[0.95, 0.99], eps=1e-08, gamma=0.025, weight_decay=0.1 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso y convencional, sin mezcla de expertos ni mecanismos de atencion lineal o hibridos: 8 capas con d_model 512 y una ventana de contexto de 256 tokens. No se especifican en la model card el numero de cabezas de atencion, la dimension de la capa feed-forward, el tipo de posicional encoding ni si se aplica weight tying entre embedding y cabeza de salida. El modelo se entreno desde cero (no es un fine-tuning) con el objetivo estandar de prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`, que por su nombre contiene pares de texto humano y generado por IA.

La innovacion que documenta el repositorio esta en el optimizador, no en la arquitectura. El autor implemento desde cero un optimizador denominado **mars**, clasificado como "variance-reduced AdamW", y lo aplico con lr=0.001, betas=[0.95, 0.99], eps=1e-08, gamma=0.025 y weight_decay=0.1, sobre una unica pasada al dataset (1x, equivalente a 39.075.840 tokens). No hay informacion sobre RLHF, DPO, SFT ni ninguna fase de alineacion: el modelo es exclusivamente un modelo base de lenguaje. El repositorio incluye `train_log.jsonl` con la perdida de validacion y el BLEU de test muestreados cada 0,1x tokens de dataset, lo que permite reconstruir la curva de entrenamiento completa.

## Capacidades

- Generacion de texto en ingles mediante continuacion de prompt (next-token prediction puro), limitada a secuencias de 256 tokens.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles.
- Reproduccion de experimentos de comparacion de optimizadores: el log de entrenamiento permite contrastar `mars` frente a otras variantes a intervalos de 0,1x dataset.
- Punto de partida para fine-tuning academico en tareas de clasificacion o generacion restringida.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), ni de capacidades agenticas o de razonamiento multi-paso.
- No soporta vision, audio ni ninguna otra modalidad: es exclusivamente texto.
- Multilingue: no; solo ingles.
- No esta alineado con instrucciones (no hay instruction tuning ni RLHF), por lo que no responde a ordenes en formato conversacional.

## Casos de uso

- Reproduccion de experimentos de optimizacion: el escenario principal es reentrenar el modelo con el mismo script y corpus para verificar la curva de perdida publicada en `train_log.jsonl` y comparar `mars` con AdamW u otros optimizadores bajo identico presupuesto de tokens.
- Docencia e investigacion en cursos de procesamiento de lenguaje natural: sirve como caso de estudio completo y de bajo coste de un pipeline de preentrenamiento (tokenizacion, configuracion, loop de entrenamiento, evaluacion con BLEU y perplejidad) que cabe en una sola GPU consumer.
- Pruebas de humo (smoke tests) de infraestructura de inferencia: con 33,4M de parametros y 0,1 GB de pesos, es util para validar que un entorno de PyTorch y safetensors se carga correctamente antes de desplegar modelos mayores, sin consumir apenas VRAM.
- Estudio del corpus `human-ai-parallel-corpus`: al haberse entrenado sobre el, permite analizar que aprende un modelo pequeno sobre distribuciones de texto humano frente a texto generado por IA, por ejemplo midiendo perplejidad diferencial entre ambos subconjuntos.
- Generacion de continuaciones cortas en ingles para demostraciones y ejercicios de clase: el BLEU de 1,38 y la perplejidad de 54,03 indican texto gramaticalmente local pero incoherente a escala de parrafo, util como ejemplo didactico de los limites de un modelo de 33M de parametros.
- Inicializacion para experimentos de escalado o destilacion: puede emplearse como punto de partida de bajo coste en estudios sobre transferencia, inicializacion de modelos mayores o tecnicas de destilacion de conocimiento.
- Benchmarking de librerias de entrenamiento: sirve para medir overhead de frameworks de entrenamiento distribuido o de precision mixta en un modelo lo bastante pequeno como para ejecutar muchas iteraciones por hora.

## Benchmarks y rendimiento

Unicos datos publicados en la model card, medidos a 1x dataset (39.075.840 tokens):

| Metrica | Valor |
|---|---|
| Perdida de validacion | 3,9895 |
| Perplejidad de validacion | 54,03 |
| BLEU de test (continuacion greedy de 64 tokens) | 1,38 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, HellaSwag, ARC, etc.) en la informacion disponible. Tampoco hay comparaciones con otros optimizadores dentro de la model card: los datos de contraste, si existen, estarian unicamente en `train_log.jsonl`, que registra perdida de validacion y BLEU de test cada 0,1x tokens de dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 134 MB de pesos (33,4M x 4 bytes); en fp16/bf16, unos 67 MB; en int8, unos 33 MB. A ello hay que sumar el estado de la cache KV, despreciable con 8 capas y 256 tokens de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. El modelo cabe sin problemas en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100; no requiere aceleradores de gama alta ni memoria HBM.
- Cabe sobradamente en GPU consumer, e incluso en CPU: la inferencia en CPU es perfectamente viable para un modelo de este tamano.
- Opciones de despliegue: la model card solo documenta la carga mediante PyTorch y `safetensors.torch.load_model` junto con las clases propias `model_src.config.TransformerConfig` y `model_src.model.Transformer`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni llama-cpp-python, y al tratarse de una arquitectura implementada desde cero no es probable que estos servidores la reconozcan sin adaptacion previa. No se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni requisitos de memoria durante el entrenamiento.

## Comparativa con modelos similares

El modelo pertenece a la categoria de transformers densos de escala muy reducida (decenas de millones de parametros) preentrenados desde cero. Alternativas publicas de escala comparable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| parth12-ui/anlp-a2-optim-mars | 33,4M | 256 | no disponible | HuggingFace, safetensors |
| GPT-2 small | 124M | 1024 | MIT (pesos de OpenAI) | ampliamente distribuido |
| Pythia-70M | 70M | 2048 | Apache 2.0 | HuggingFace, EleutherAI |
| TinyStories (variantes ~1-30M) | ~1-30M | 512 (tipico) | variable segun variante | HuggingFace |

La comparacion en terminos de rendimiento no es posible: no hay benchmarks comunes publicados para `anlp-a2-optim-mars` y su metrica principal (perplejidad 54,03 sobre un corpus especifico) no es directamente comparable con las de los modelos de la tabla, que se evaluan sobre otros corpus y con otras metricas. Las diferencias relevantes son de licencia y de ecosistema: GPT-2 small y Pythia-70M cuentan con licencias permisivas explicitas y soporte en frameworks de inferencia estandar, mientras que este modelo no declara licencia y depende de codigo propio para cargarse.

## Limitaciones y advertencias

- Calidad de generacion muy baja para uso real: BLEU de 1,38 y perplejidad de validacion de 54,03 indican un modelo que produce texto localmente plausible pero globalmente incoherente. No es apto para generar contenido que se vaya a publicar o consumir por usuarios finales.
- Riesgo de alucinacion elevado: al ser un modelo base sin alineacion, no distingue entre afirmaciones verdaderas y falsas y tiende a continuar el texto de la forma estadisticamente mas probable, sin ningun anclaje factual.
- Contexto muy limitado: 256 tokens, insuficiente para conversaciones multi-turno, documentos, resumenes de articulos o cualquier tarea que requiera memoria a medio plazo.
- Solo ingles. No hay evidencia de competencia en castellano ni en ningun otro idioma, y su uso en espanol produciria resultados degradados.
- Licencia no disponible: este es el caveat mas importante para produccion. Al no declararse licencia, no hay autorizacion explicita de uso comercial ni garantia de derechos de redistribucion. Debe tratarse como material restringido a investigacion hasta que el autor aclare los terminos.
- Ausencia de ficha completa: no se documentan el tokenizador, la composicion exacta del dataset, la configuracion de atencion, la semilla de entrenamiento ni los detalles de implementacion del optimizador `mars`, lo que dificulta la reproducibilidad estricta del experimento.
- Sesgos del corpus: el modelo hereda los sesgos de `browndw/human-ai-parallel-corpus`, cuya composicion y procedencia no estan descritas en la informacion disponible.
- Sin soporte en herramientas estandar: al no existir pesos GGUF ni integracion en vLLM, TGI u Ollama, cualquier despliegue requiere escribir codigo de carga especifico contra `model_src`.
- Sin mantenimiento aparente: el repositorio se creo y se actualizo el mismo dia (3 de octubre de 2026) y no registra descargas ni interacciones, lo que sugiere que no habra actualizaciones ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-mars
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Archivo de log de entrenamiento: `train_log.jsonl` (incluido en el repositorio del modelo)
- Codigo de carga y definicion del modelo: paquete `model_src` referenciado en la model card, sin enlace publico indicado
- Paper del optimizador `mars`: no disponible en la informacion proporcionada
- Repositorio de codigo del entrenamiento: no disponible
- Demo o Space: no disponible
- Nota sobre la busqueda web: los resultados devueltos (recopilaciones de "eventos historicos" en havefunwithhistory.com, blog.alandotchin.com, allthatsinteresting.com, preply.com y discoverwalks.com) no guardan ninguna relacion con este modelo ni con el optimizador `mars`; se descartan como fuentes no relevantes.
