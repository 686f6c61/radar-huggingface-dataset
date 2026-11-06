# AbstractPhil/qwen3.5-2b-think-symbolic-image-full

## Resumen

Lucia 2B es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-2B, desarrollado por AbstractPhil. Se trata de un modelo vision-language de 2.213 millones de parametros que toma una imagen como entrada y genera una "fila" estructurada de pensamiento simbolico: una cadena corta de pensamientos en lenguaje natural, un paso nombrado por linea, seguida de formulaciones (caption, prompt, tags, critica) y de las preguntas que un observador cuidadoso aun plantearia, cada una con su respuesta y el criterio que la resuelve.

El modelo pertenece a la familia Lucia, descrita por el autor como "the thinking lookers", en la que cada tamano se entrena con las mismas filas y la misma receta, diferenciandose en lo que cada uno puede retener. La version de 2B busca retener la forma y el termino medio al nivel del modelo de 9B de la familia, con un respaldo ligeramente menor de sus pensamientos y una mayor tendencia a definir en las filas de especificacion larga. Esta pensado para tarjetas y descripciones donde el modelo de 4B no llega.

La relevancia actual reside en su enfoque: no es un captioner generico, sino un modelo entrenado para producir una estructura de razonamiento visual verificable, con pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) y preguntas etiquetadas como hecho de la imagen, deduccion de la cadena o desconocido. La licencia Apache 2.0 y su tamano compacto lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3.5-2B, multimodal image-text-to-text) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del Qwen/Qwen3.5-2B, un transformer multimodal de tipo image-text-to-text que procesa imagenes y texto mediante un procesador (AutoProcessor) y un modelo de lenguaje multimodal (AutoModelForMultimodalLM). El ajuste se realizo sobre el modelo completo, no mediante adaptadores: el repositorio contiene los pesos y el procesador listos para cargar sin fusion adicional. Existe una variante LoRA de la misma receta (AbstractPhil/qwen3.5-2b-think-symbolic-image) pensada para ser mas ligera de almacenar y de desactivar.

El entrenamiento se realizo sobre los datasets AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-symbolic-thinking-image-training, con el objetivo de que el modelo aprenda a emitir filas estructuradas de pensamiento visual. La receta es comun a toda la familia Lucia: cada tamano se entrena con las mismas filas y el mismo procedimiento. El autor no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el formato de salida: una cadena de pensamiento con pasos nombrados y un sistema de preguntas clasificadas por procedencia del conocimiento ([record], [chain], [unknown]), que hace el razonamiento visual auditable. El modelo se ejecuta con thinking desactivado, decodificacion greedy y sin system prompt, ya que la forma de la fila es aprendida y un turno de sistema no visto en entrenamiento provoca sobreescritura.

## Capacidades

- Generacion de descripciones estructuradas de imagenes en formato de fila: pasos de pensamiento nombrados, caption, prompt, tags y critica por profundidad.
- Razonamiento visual en cadena: pasos see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check y say.
- Control de profundidad de analisis mediante palabras clave: "a quick look" (1 a 2 pensamientos), "a closer look" (3 a 5), "a long look" (6 a 10).
- Generacion de preguntas de seguimiento con etiqueta de procedencia: [record] (hecho de la imagen), [chain] (deducido por la cadena) y [unknown] (desconocido).
- Descripcion de medios y tecnicas artisticas: pintura, grabado, dibujo y fotografia, con identificacion de soportes y materiales (por ejemplo, tinta marron sobre grafito, papel crema).
- Analisis de dominio artistico y museistico: obras, objetos, retratos, escenas y composiciones.
- Conversacion multi-turno en ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni otros modos especiales.

## Casos de uso

- Catalogacion de fondos museisticos: el modelo genera filas estructuradas con medio, soporte, composicion y mood a partir de fotografias de obras, utiles para prellenar fichas de catalogo que luego revisa un documentalista.
- Generacion de metadatos para bancos de imagenes: produce caption, prompt y tags en una sola pasada, lo que permite poblar campos de busqueda y alt-text de forma consistente.
- Creacion de prompts para generacion de imagenes: la linea de prompt del formato de salida esta pensada para alimentar modelos texto-a-imagen, con terminos ordenados por tipo de imagen, composicion, medio y soporte.
- Analisis critico de obras para publicaciones: la linea de critica y los pasos mood, mean e intend permiten obtener una lectura interpretativa breve y trazable para textos divulgativos.
- Auditoria de descripciones automaticas: el etiquetado [record]/[chain]/[unknown] permite distinguir que afirmaciones son hechos observables y cuales inferencias, lo que facilita la revision humana y la deteccion de alucinaciones.
- Educacion artistica y talleres: la cadena de pasos nombrados sirve como guia didactica para ensenar a mirar una imagen de forma sistematica (forma, luz, color, composicion).
- Investigacion en razonamiento visual: el formato de salida estructurado y el parser y scorer publicos (qwen_symbolic_thinking.chain.parse y chain.score) permiten medir la calidad del razonamiento de forma automatica en experimentos comparativos.

## Benchmarks y rendimiento

El autor reporta evaluaciones propias realizadas con el paquete qwen-symbolic-thinking sobre 60 imagenes y 40 especificaciones no vistas en entrenamiento, comparando contra las filas del dataset (forma de la fila, "said / backed", definiciones), y sobre dos conjuntos adicionales: 500 imagenes de la National Gallery of Art (100 dibujos, grabados, pinturas, fotografias y objetos) y 200 imagenes de AIC, NGA, Cleveland y el Met. Sin embargo, en la informacion disponible la tabla comparativa aparece truncada y no se incluyen los valores numericos de estas lecturas.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo para pesos, mas el overhead del procesador visual y las activaciones; en la practica se recomienda un margen de 6 a 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 4090, A100 o H100 ofrecen margen amplio y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070 en adelante). En GPUs con menos VRAM seria necesaria cuantizacion, que el autor no documenta.
- Opciones de despliegue: la model card solo documenta transformers 5 con AutoModelForMultimodalLM y AutoProcessor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucia 2B (este modelo) | 2,21 B | no disponible | Captioning estructurado con cadena de pensamiento visual | apache-2.0 | Hugging Face, full fine-tune y adaptador LoRA |
| Lucia 2B LoRA (AbstractPhil/qwen3.5-2b-think-symbolic-image) | 2,21 B (base) + adaptador | no disponible | Misma receta, adaptador ligero | apache-2.0 | Hugging Face |
| Lucia 9B (familia Lucia) | no disponible en la informacion | no disponible | Misma receta, mayor capacidad de retencion | no disponible en la informacion | Referenciado por el autor |
| Qwen/Qwen3.5-2B (modelo base) | 2,21 B | no disponible | Vision-language general | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento numericos para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El autor advierte que el modelo debe ejecutarse con thinking desactivado, decodificacion greedy y sin system prompt; un turno de sistema no visto en entrenamiento provoca sobreescritura de la salida.
- Requiere transformers 5; la variante LoRA requiere ademas peft 0.18 o superior.
- El autor indica que esta version de 2B respalda sus pensamientos con menos frecuencia que el modelo de 9B y define mas en las filas de especificacion larga, lo que implica mayor riesgo de afirmaciones no sustentadas.
- Riesgo de alucinacion en las lineas de interpretacion (mood, mean, intend); el propio formato mitiga esto parcialmente con las etiquetas [record], [chain] y [unknown], que conviene verificar en produccion.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que limita la evaluacion de riesgos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar las condiciones del modelo base Qwen/Qwen3.5-2B, cuyos terminos no se detallan en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan opciones de cuantizacion ni soporte en motores de inferencia distintos de transformers, lo que restringe el despliegue en entornos con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/qwen3.5-2b-think-symbolic-image-full
- Variante LoRA: https://huggingface.co/AbstractPhil/qwen3.5-2b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio del parser, scorer y trainer: https://github.com/AbstractEyes/qwen-symbolic-thinking
