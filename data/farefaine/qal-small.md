# farefaine/qal-small

## Resumen

Qal small es un modelo de lenguaje de tipo GPT entrenado desde cero para tigriña (ti), una lengua semítica de Eritrea y Etiopía con recursos digitales muy limitados. Lo desarrolla el autor independiente farefaine como parte de la serie *Building Qal*, que entrena cinco tamanos con la misma receta, tokenizer y corpus para permitir comparaciones controladas. Esta es la variante *small*, con 13.434.624 parametros, 4 capas, dimension de embedding 384 y una ventana de contexto de solo 128 tokens.

El modelo aborda el problema de la escasez de modelos generativos nativos para lenguas de bajos recursos: en lugar de adaptar un modelo multilingue grande, se entrena un transformer decoder-only pequeno sobre un corpus limpiado de aproximadamente 79 millones de tokens por epoca, con un vocabulario BPE de 8.192 tokens especifico para tigriña. Su relevancia es principalmente experimental y de investigacion: sirve como referencia reproducible de hasta donde llega un modelo de 13M de parametros en una lengua de bajos recursos.

No es un modelo orientado a produccion: no ha pasado por ajuste de instrucciones ni alineamiento, su contexto es muy corto y su conocimiento factual es limitado. Su interes esta en la comparativa entre tamanos de la familia Qal y en el ecosistema de datos y tokenizacion que publica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (4 capas, 6 cabezas, dim 384) |
| Parametros totales | 13.434.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Tigriña (ti) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (carga via `GPT.from_pretrained` del repositorio qal) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only clasico con embeddings posicionales absolutos aprendidos, 4 capas, 6 cabezas de atencion y dimension de modelo 384. El tokenizer es un BPE con vocabulario de 8.192 tokens entrenado para tigriña. El entrenamiento se realizo durante 30 epocas (96.420 pasos) con batches de 192 secuencias de 128 tokens, AdamW (betas 0.9 y 0.99), weight decay 0.1, dropout 0.1, precision mixta BF16 y una sola GPU. El schedule de learning rate es warmup-stable-decay con pico de 0.003, mantenido durante el 80 % del entrenamiento y decaido despues.

Los datos proceden de una version limpiada del dataset `farefaine/tigrinya-pretraining`, con aproximadamente 79 millones de tokens por epoca, mayoritariamente texto periodistico. Las fuentes originales citadas son TLMD (Gaim, Yang y Park, 2021), el Tigrinya NLP Corpus de la SeReT Foundation y TiQuAD (Gaim, Yang, Park y Park, 2023). No se menciona RLHF, DPO ni ningun ajuste posterior al preentrenamiento supervisado.

## Capacidades

- Generacion de texto autoregresiva en tigriña, con muestreo por temperatura (el ejemplo de la model card usa temperatura 0.8).
- Modelado de lenguaje puro: la perdida y la perplejidad son las metricas declaradas (validacion 3.481 / 32.5; test 3.492 / 32.9).
- Continuacion de texto y generacion libre a partir de un prompt corto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No esta ajustado para seguir instrucciones; el prompt se interpreta como texto a continuar.
- Capacidad multilingue practicamente nula: el vocabulario y el corpus son exclusivamente de tigriña.

## Casos de uso

- Investigacion sobre modelos de lenguaje de bajos recursos: sirve como punto de referencia reproducible de 13M de parametros dentro de la familia Qal, con la misma receta que los otros cuatro tamanos, para estudiar el efecto de la escala en tigriña.
- Evaluacion de tokenizers para tigriña: el BPE de 8.192 tokens y el corpus asociado permiten medir la eficiencia de compresion y la cobertura del vocabulario en una lengua semítica con escritura ge'ez.
- Generacion de texto sintetico de tigriña para aumento de datos: con muestreo por temperatura puede producir continuaciones plausibles que, tras filtrado humano, alimenten corpus de entrenamiento o evaluacion.
- Pruebas de infraestructura y pipelines de entrenamiento: al ser un modelo diminuto (repo de 0,1 GB), se puede cargar y ejecutar en CPU o en GPUs consumer para validar codigo de inferencia, tokenizacion y decodificacion antes de escalar.
- Analisis linguistico asistido: completado de frases cortas y exploracion de colocaciones y patrones morfologicos en tigriña, siempre con revision por hablantes nativos.
- Educacion y divulgacion: ejemplo didactico completo de como entrenar un GPT desde cero para una lengua de bajos recursos, con codigo, datos y resultados publicados.

## Benchmarks y rendimiento

La model card solo publica perdida y perplejidad del propio modelo. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en tigriña).

| Split | Loss | Perplejidad |
|---|---|---|
| Validacion | 3.481 | 32.5 |
| Test | 3.492 | 32.9 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (13,4M de parametros, unos 54 MB de pesos) y en torno a 30 MB en BF16/FP16; el cuello de botella no es la memoria sino la latencia por paso.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se entreno en una sola GPU sin especificar modelo. Para inferencia basta una GTX 1650, RTX 3060 o incluso CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: no hay versiones GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI. La unica via documentada es cargar los pesos con la clase `GPT` del repositorio `farefaine/qal` en PyTorch y usar el tokenizer de la libreria `tokenizers`.
- Latencia y throughput: no disponibles. Con contexto de 128 tokens y 4 capas, la generacion es rapida en GPU, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de los otros tamanos de la familia Qal en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible. Comparativa cualitativa con alternativas de la misma categoria (modelos pequenos para lenguas de bajos recursos):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qal small | 13,4M | 128 | CC BY-SA 4.0 | Hugging Face, pesos safetensors |
| Otros tamanos de la familia Qal | no disponible | no disponible | no disponible | mencionados en la model card, sin datos |
| Modelos multilingues grandes adaptados a tigriña | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables con datos verificables.

## Limitaciones y advertencias

- Entrenado sobre unos 79M de tokens, mayoritariamente noticias: produce tigriña con apariencia fluida pero no es fiable para datos factuales.
- No ha sido ajustado para seguir instrucciones; responde como modelo de continuacion de texto.
- Contexto de solo 128 tokens, insuficiente para dialogos multi-turno, documentos largos o tareas de recuperacion.
- Monolingue: no comprende ni genera otros idiomas de forma util.
- Hereda los sesgos de las fuentes de entrenamiento (corpus periodistico y datasets publicos de tigriña).
- Riesgo alto de alucinacion en cualquier pregunta factual.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- No hay pesos cuantizados ni soporte en runtimes de inferencia estandar; requiere el codigo del repositorio del autor.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farefaine/qal-small
- Codigo del proyecto: https://github.com/farefaine/qal
- Serie *Building Qal*: https://farefaine.substack.com
- Dataset de preentrenamiento: https://huggingface.co/datasets/farefaine/tigrinya-pretraining
- TLMD (Gaim, Yang y Park, 2021): https://zenodo.org/records/5139094
- Tigrinya NLP Corpus (SeReT Foundation): https://github.com/TigrinyaNLP/corpus
- TiQuAD (Gaim, Yang, Park y Park, 2023): https://github.com/fgaim/TiQuAD
