# AmauryLC/NanoConte-91M-5ep

## Resumen

NanoConte-91M-5ep es un modelo de lenguaje causal de tipo GPT desarrollado por AmauryLC, entrenado desde cero en frances para la generacion de cuentos cortos infantiles, siguiendo la estela de TinyStories. Con aproximadamente 91,6 millones de parametros, es el miembro mas grande de la familia NanoConte, que incluye tambien variantes de 51,2 M con 1 y 3 epocas de entrenamiento. El modelo se publica como checkpoint experimental de investigacion, no como un asistente de proposito general.

La arquitectura es un transformer decoder-only clasico con Pre-LayerNorm, activacion GELU y embeddings ligados, configurado con 12 capas, dimension de embedding de 640 y 10 cabezas de atencion, sobre una ventana de contexto de 512 tokens. Utiliza el tokenizer MaxLSB/LeCarnet-21M con un vocabulario de 50.262 tokens y fue entrenado sobre el dataset MaxLSB/LeCarnet durante 5 epocas.

Su relevancia es acotada y de caracter educativo: demuestra que modelos de menos de 100 M de parametros pueden producir narrativa coherente y con estructura de cuento en frances cuando se entrenan sobre un corpus muy especializado y de dominio restringido. No esta pensado para tareas factuales, razonamiento ni seguimiento de instrucciones, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT causal (transformer decoder-only, Pre-LayerNorm, GELU, embeddings ligados) |
| Parametros totales | 91.578.880 (~91,6 M, de los cuales ~32,2 M en la tabla de embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (BLOCK_SIZE) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32) |
| Idiomas soportados | frances (fr) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model-91M-5epoque.pt`, float32, ~366 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con normalizacion previa a cada subcapa (Pre-LayerNorm), activacion GELU y pesos de embedding compartidos entre la capa de entrada y la proyeccion de salida (tied embeddings). La configuracion concreta es de 12 capas, dimension de modelo de 640, 10 cabezas de atencion y una ventana de contexto de 512 tokens. El tokenizer empleado es MaxLSB/LeCarnet-21M, con un vocabulario de 50.262 tokens.

El entrenamiento se realizo desde cero sobre el split `train` del dataset MaxLSB/LeCarnet durante 5 epocas, con AdamW (lr = 6e-4, betas = (0,9; 0,95), weight decay = 0,1 y gradient clipping a 1,0), un scheduler de warmup lineal durante 1.000 pasos seguido de decaimiento coseno hasta el 10 % del learning rate maximo, y un batch de 16 secuencias de 512 tokens (8.192 tokens por paso). La precision de entrenamiento fue bfloat16 mediante `torch.autocast` sobre GPU. No se documenta el numero total de tokens procesados ni la composicion detallada del dataset, y no se menciona ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto narrativo en frances: cuentos cortos infantiles con estructura de inicio, desarrollo y moraleja.
- Generacion de dialogos sencillos entre personajes dentro de la narracion.
- Coherencia local a nivel de parrafo dentro de la ventana de 512 tokens.
- Especializacion de dominio: vocabulario y estilo propios de la literatura infantil.
- No dispone de soporte de tool calling ni function calling.
- No implementa modo de razonamiento extendido ni capacidades de agente multi-paso.
- No soporta vision, audio ni otras modalidades.
- Multilingue: no; unicamente frances.

## Casos de uso

- Generacion de cuentos infantiles para prototipos editoriales: el modelo produce narraciones breves con moraleja a partir de un prompt inicial, util para generar borradores o material de prueba en plataformas de contenido infantil.
- Investigacion educativa sobre modelos de lenguaje pequenos: sirve como banco de pruebas reproducible para estudiar el efecto del numero de epocas y del tamano en la calidad narrativa, dado que la familia NanoConte publica variantes comparables.
- Generacion de datasets sinteticos de cuentos en frances: puede emplearse para aumentar corpus de narrativa infantil destinados a entrenar o evaluar otros modelos, siempre con revision humana posterior.
- Demostraciones docentes de entrenamiento desde cero: su configuracion sencilla y su checkpoint en `state_dict` facilitan explicar el ciclo completo de preentrenamiento de un GPT en cursos y talleres.
- Pruebas de pipelines de inferencia en PyTorch: al ser un modelo de 91 M de parametros, permite validar infraestructura de serving, tokenizacion y generacion con bajo coste computacional.
- Generacion de prompts y ejemplos para aplicaciones de lectura infantil: util para crear textos de muestra en interfaces de lectura, audiolibros o aplicaciones educativas en frances, con supervision editorial.
- Experimentos de estilometria y analisis narrativo: el modelo permite estudiar sesgos estructurales en la generacion de fabulas (por ejemplo, la presencia recurrente de moralejas) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,4 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en bfloat16: en torno a 0,2 GB para los pesos, si se convierte el checkpoint; no se publican pesos ya cuantizados.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada, y tambien es viable en CPU para generacion de baja frecuencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el checkpoint es un `state_dict` de PyTorch que requiere la definicion `GPT` de `train.py`; no se publican pesos en formato GGUF, safetensors ni integracion directa con vLLM, llama.cpp, Ollama o TGI. El despliegue documentado es via `huggingface_hub` y `torch.load`.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 91 M de parametros con contexto de 512 tokens, la generacion es rapida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NanoConte-91M-5ep | 91,6 M | 512 | fr | no disponible | PyTorch `state_dict` | 5 epocas sobre MaxLSB/LeCarnet |
| NanoConte-51M-3ep | 51,2 M | 512 | fr | no disponible | PyTorch `state_dict` | 8 capas / 512 dim / 8 cabezas, 3 epocas |
| NanoConte-51M | 51,2 M | 512 | fr | no disponible | PyTorch `state_dict` | 8 capas / 512 dim / 8 cabezas, 1 epoca |
| TinyStories (referencia conceptual) | no disponible en la informacion | no disponible | en | no disponible | no disponible | Inspiracion declarada del proyecto; no se aportan datos comparativos |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas.

## Limitaciones y advertencias

- Modelo experimental de 91 M de parametros, especializado exclusivamente en la generacion de historias cortas y simples en frances.
- No apto para tareas factuales, de razonamiento ni de seguimiento de instrucciones, tal como advierte el propio autor.
- Riesgo elevado de alucinacion fuera de su dominio narrativo; no debe usarse como fuente de informacion.
- Ventana de contexto muy limitada (512 tokens), lo que restringe la coherencia en textos largos y el mantenimiento de hilos narrativos complejos.
- Unicamente en frances; no soporta castellano ni otros idiomas.
- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que su explotacion en produccion requiere aclaracion previa con el autor.
- Formato de pesos no estandar (`state_dict` de PyTorch vinculado a `train.py`), lo que complica la integracion con frameworks de serving habituales.
- Sesgos potenciales derivados del corpus MaxLSB/LeCarnet, no documentados ni evaluados.
- Sin garantias de calidad editorial: los textos generados requieren revision humana antes de cualquier publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmauryLC/NanoConte-91M-5ep
- Modelo NanoConte-51M: https://huggingface.co/AmauryLC/NanoConte-51M
- Modelo NanoConte-51M-3ep: https://huggingface.co/AmauryLC/NanoConte-51M-3ep
- Dataset MaxLSB/LeCarnet: https://huggingface.co/datasets/MaxLSB/LeCarnet
- Tokenizer MaxLSB/LeCarnet-21M: https://huggingface.co/MaxLSB/LeCarnet-21M
