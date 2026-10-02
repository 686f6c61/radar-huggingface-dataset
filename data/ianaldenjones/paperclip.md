# ianaldenjones/paperclip

## Resumen

Paperclip es un modelo de lenguaje de 4,82 millones de parametros publicado por el usuario ianaldenjones en HuggingFace bajo licencia MIT. Se trata de un transformer decoder-only a nivel de caracter (vocabulario de 72 simbolos) con 256 posiciones de contexto, d_model de 256, 6 capas y 8 cabezas de atencion. Su particularidad es que fue entrenado sobre 80.000 intercambios sinteticos generados a partir de plantillas y todos ellos terminan hablando de clips de papel, de modo que el modelo es incapaz de producir una respuesta que no acabe en "paperclips".

El modelo resuelve un problema puramente demostrativo: ilustra como un modelo pequeno entrenado sobre una distribucion cerrada y deliberadamente mal especificada memoriza dicha distribucion en lugar de aprender capacidades generales. La model card lo describe explicitamente como una broma y como una referencia al experimento mental del maximizador de clips, pero con la salvedad de que aqui el problema es una especificacion de datos deficiente, no de objetivos.

Es relevante ahora por dos motivos practicos: primero, porque es un caso limpio y reproducible (4 minutos de entrenamiento en una RTX 4090, con logs publicos) para estudiar memorizacion y sobreajuste en modelos minimos; segundo, porque su exportacion a ONNX con cuantizacion int8 dinamica de 5 MB lo convierte en un banco de pruebas util para validar pipelines de despliegue en navegador o en dispositivos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, posiciones aprendidas, cabeza atada (tied head) |
| Parametros totales | 4,82 M (d_model 256, 6 capas, 8 cabezas) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX) e int8 dinamico de pesos (paperclip.int8.onnx) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | ckpt.pt (state dict de PyTorch, fp32, 19 MB), paperclip.onnx (fp32, opset 17), paperclip.int8.onnx (5 MB) |
| Vocabulario | 72 tokens (caracteres mas los especiales `<\|user\|>`, `<\|clip\|>`, `<\|end\|>`) |
| Formato de secuencia | `<\|user\|>{prompt}<\|clip\|>{reply}<\|end\|>` |
| Tamano del repositorio | 0,0 GB segun HuggingFace (los ficheros declarados suman mas; dato no consistente) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional: normalizacion previa a los subloques (pre-norm), embeddings de posicion aprendidos en lugar de rotatorios o sinusoidales, y proyeccion de salida atada a la matriz de embeddings de entrada. Con 6 capas, 8 cabezas y d_model de 256, el recuento de parametros es de 4,82 millones, coherente con el tamano declarado de ckpt.pt (19 MB en fp32).

El entrenamiento consistio en 7.000 pasos con batch de 64, optimizador AdamW con learning rate 1e-3, warmup y decaimiento coseno, precision bf16, y aproximadamente 4 minutos de computo en una RTX 4090. La perdida de validacion reportada es de 0,25 nats por caracter. El corpus son 80.000 intercambios sinteticos: cada respuesta se compone de un opener, un pivot y entre uno y tres closers extraidos de pools de plantillas pequenos. La mitad de los temas del prompt son cadenas aleatorias, una decision de diseno orientada a que el modelo aprenda a copiar la mencion del tema en lugar de recuperar un tema memorizado. No se emplearon tecnicas de RLHF, DPO ni ajuste por preferencias, y tampoco hay innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, con muestreo configurable (temperatura, top_p y token de fin de secuencia).
- Copia de la mencion del tema: dado un prompt sobre cualquier asunto, el modelo replica ese asunto en la respuesta antes de derivar hacia los clips de papel. Es una habilidad inducida por el corpus, no generalizacion.
- Generacion condicionada por plantilla: combina openers, pivots y closers, con lo que produce variacion limitada dentro de un espacio cerrado.
- Inferencia en navegador y en CPU mediante ONNX Runtime, incluida la variante int8 de 5 MB donde el argmax coincide con fp32 en todas las posiciones probadas segun el autor.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de capacidades multilingues (solo ingles) ni de modo de pensamiento, vision o audio.
- No realiza razonamiento, matematicas ni generacion de codigo fuera de las plantillas aprendidas.

## Casos de uso

- Demostracion educativa en navegador: el modelo se ejecuta con la variante int8 de 5 MB y ONNX Runtime en el cliente, sin backend ni GPU, lo que permite ilustrar como funciona un transformer generativo completo dentro de una pagina web.
- Ensenanza de tokenizacion a nivel de caracter: con un vocabulario de 72 simbolos es posible mostrar en un aula como se codifica una secuencia, para que sirven los tokens especiales y por que hay que enmascarar `<|user|>` y `<|clip|>` en cada paso de muestreo.
- Estudio de memorizacion y sobreajuste: los logs (`log.json`, `train.log`) y el corpus sintetico permiten reproducir un caso controlado de un modelo que memoriza una distribucion cerrada, util como ejemplo negativo en cursos de datos y entrenamiento.
- Validacion de pipelines de exportacion ONNX: sirve como modelo de humo para comprobar que una cadena de exportacion, cuantizacion int8 dinamica y verificacion de argmax funciona antes de aplicarla a modelos mayores.
- Pruebas de despliegue en entornos sin GPU: con 19 MB en fp32 y 5 MB en int8 cabe en microcontroladores de gama alta, navegadores y contenedores edge, lo que permite medir latencia de arranque y consumo de memoria en ese tipo de plataforma.
- Ejemplo reproducible de entrenamiento minimo: 7.000 pasos y 4 minutos en una RTX 4090 permiten reproducir el entrenamiento completo de principio a fin en una sola sesion, algo poco frecuente en modelos publicados.
- Material divulgativo sobre especificacion de objetivos: el modelo ilustra de forma tangible el experimento mental del maximizador de clips y sirve para discutir en charlas o clases por que una distribucion de datos mal definida produce comportamientos degenerados.
- Generacion de texto surrealista o artistica: la rigidez de sus respuestas (siempre en torno a clips de papel) puede aprovecharse deliberadamente en instalaciones, bots de broma o piezas de arte generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento proporcionado por el autor es la perdida de validacion de 0,25 nats por caracter, que es una metrica de entrenamiento y no un benchmark comparable con MMLU, HumanEval, GSM8K ni similares. Con un contexto de 256 caracteres y un corpus de 80.000 ejemplos sinteticos, la evaluacion en dichos benchmarks no seria informativa.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. Los pesos en fp32 ocupan 19 MB y la variante int8 unos 5 MB; la activacion maxima con contexto de 256 caracteres y batch 1 es despreciable.
- GPU recomendadas: ninguna en particular para inferencia. Cualquier CPU moderna es suficiente, y el modelo esta pensado para ejecutarse en el navegador mediante ONNX Runtime.
- GPU para entrenamiento: el autor reporta aproximadamente 4 minutos en una RTX 4090 en bf16.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU y en entornos wasm.
- Opciones de despliegue: PyTorch (con el codigo del repositorio de GitHub), ONNX Runtime en cualquiera de sus bindings, y ONNX Runtime Web para navegador. No se proporcionan pesos GGUF, por lo que no es desplegable directamente con llama.cpp u Ollama, y su contexto de 256 caracteres lo descarta para vLLM o TGI en escenarios reales.
- Latencia y throughput: no disponibles en la informacion proporcionada. La demo del autor funciona en navegador con la variante int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ianaldenjones/paperclip | 4,82 M | 256 caracteres | MIT | HuggingFace (0 descargas, 0 likes) | Nivel de caracter, dominio cerrado de clips de papel, export ONNX fp32 e int8 |
| ianaldenjones/notes-you-cant-delete | no disponible | no disponible | no disponible | HuggingFace | Modelo del que procede la arquitectura transformer segun el autor |
| Otros modelos char-level tipo gpt minimo (por ejemplo, variantes de nanoGPT) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de cifras de rendimiento comparables para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es explicitamente un modelo de broma y una demostracion, no una herramienta de produccion.
- Conoce alrededor de veinte frases y no puede generar una oracion que no termine en clips de papel, por construccion del corpus.
- Copia frases largas de forma imperfecta cerca del limite de sus 256 caracteres de contexto, donde degrada la coherencia.
- Solo soporta ingles; no hay capacidades multilingues.
- No hay datos publicados sobre sesgos; el corpus es sintetico y de plantillas, por lo que no es representativo de ningun uso real.
- El riesgo de alucinacion en el sentido habitual es bajo porque el espacio de salida esta cerrado, pero cualquier afirmacion factual que produzca es inventada por construccion.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero el modelo no ofrece ninguna utilidad funcional en ese contexto.
- El tamano de repositorio declarado (0,0 GB) no concuerda con los ficheros descritos en la model card; conviene verificar los pesos antes de integrarlos en un pipeline.
- Advertencia de nomenclatura: existe un producto no relacionado llamado Paperclip (paperclipai.net, paperclip.ing, github.com/paperclipai/paperclip) dedicado a la orquestacion de agentes de IA. No guarda ninguna relacion con este modelo pese a compartir nombre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ianaldenjones/paperclip
- Demo en navegador: https://iamverycalmaboutthis.com
- Repositorio de codigo, generador de corpus, entrenador y exportacion: https://github.com/iaj6/paperclip
- Modelo del que procede la arquitectura (Notes You Can't Delete): https://huggingface.co/ianaldenjones/notes-you-cant-delete
- Proyecto Notes You Can't Delete: https://notes-you-cant-delete.vercel.app
- Producto no relacionado con el mismo nombre (Paperclip para orquestacion de agentes): https://paperclipai.net/
- Repositorio del producto no relacionado: https://github.com/paperclipai/paperclip
