# DavidGomez49/opus-mt-en-es-books-udea

## Resumen

opus-mt-en-es-books-udea es un modelo de traduccion automatica ingles-castellano obtenido por ajuste fino (fine-tuning) del modelo MarianMT Helsinki-NLP/opus-mt-en-es. Lo publica el usuario DavidGomez49 en Hugging Face bajo licencia Apache 2.0. El modelo resuelve la tarea concreta de traduccion de texto de dominio literario o de libros (de ahi el sufijo "books" y la referencia "udea", presumiblemente la Universidad de Antioquia), y su interes radica en que adapta un traductor generico a un registro especifico sin incrementar el tamano del modelo.

Tecnicamente es un transformer encoder-decoder de tipo Marian, con 77.484.009 parametros totales, pesos en safetensors y un repositorio de 0,6 GB. No es un modelo generativo de proposito general: no soporta tool calling, agentes ni razonamiento multi-paso, y su unica funcion es la traduccion secuencia a secuencia.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con 32 descargas y sin likes en el momento de la consulta, pensado para evaluar si el ajuste fino sobre corpus de libros mejora la calidad de traduccion frente al modelo base. Los resultados declarados por el autor en el conjunto de evaluacion son BLEU 22,1067 y chrF 47,1071, con una perdida de validacion de 2,0233.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 77.484.009 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | ingles y castellano (direccion en-es); no se declara cobertura adicional |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Helsinki-NLP/opus-mt-en-es, un MarianMT, que es una arquitectura transformer encoder-decoder disenada especificamente para traduccion automatica neuronal. El ajuste fino se realizo con la libreria Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, segun declara la model card. El autor no especifica el dataset de entrenamiento ("unknown dataset" en la model card), aunque el nombre del modelo sugiere un corpus de libros en ingles y castellano.

Los hiperparametros declarados son: learning rate 5e-05, batch de entrenamiento 32, batch de evaluacion 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 2 epochs y precision mixta nativa (AMP). El entrenamiento consta de 938 pasos (469 por epoch). No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo tecnicas de RLHF o DPO, algo por otra parte poco habitual en modelos de traduccion. Tampoco se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion automatica de ingles a castellano, unica tarea para la que fue entrenado.
- Generacion de texto secuencia a secuencia (pipeline text2text-generation) con salidas de longitud media de 30,34 tokens en el conjunto de evaluacion.
- Adaptacion al registro literario o de libros, segun indica el nombre del modelo, aunque el autor no documenta el corpus.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Capacidad multilingue limitada a la pareja ingles-castellano; no se declaran otros idiomas.
- Compatible con endpoints de Hugging Face (tag endpoints_compatible).

## Casos de uso

- Traduccion de ficcion y narrativa: el ajuste sobre corpus de libros permite traducir capitulos o parrafos de novelas del ingles al castellano manteniendo un registro mas literario que un traductor generico, aunque la calidad debe validarse con muestras propias.
- Localizacion de documentacion tecnica extensa: al ser un modelo pequeno (77 millones de parametros), puede desplegarse en CPU y procesar lotes grandes de texto en pipelines de localizacion continua.
- Preprocesado en pipelines de datos: traduccion masiva de corpus en ingles a castellano para construir datasets paralelos o de instrucciones en castellano antes de entrenar otros modelos.
- Traduccion por lotes en entornos con recursos limitados: el modelo cabe en cualquier GPU consumer e incluso en CPU, lo que lo hace adecuado para tareas batch en servidores modestos.
- Prototipado de sistemas de traduccion en investigacion: sirve como linea base para comparar el efecto del ajuste fino sobre el modelo base Helsinki-NLP/opus-mt-en-es en dominios especificos.
- Traduccion de subtitulos o dialogos: con frases cortas y contexto limitado, el modelo puede generar traducciones rapidas para subtitulado, siempre con revision humana por el riesgo de errores en expresiones idiomaticas.
- Integracion en aplicaciones de lectura: traduccion al vuelo de fragmentos de libros o articulos en ingles dentro de un lector o extension de navegador.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. El model-index no incluye resultados estructurados (lista vacia).

| Metrica | Epoch 1 (paso 469) | Epoch 2 (paso 938) | Evaluacion final |
|---|---|---|---|
| Perdida de entrenamiento | 2,1843 | 1,8867 | no disponible |
| Perdida de validacion | 2,0387 | 2,0233 | 2,0233 |
| BLEU | 22,2672 | 22,1067 | 22,1067 |
| chrF | 47,2424 | 47,1071 | 47,1071 |
| Longitud generada media | 30,63 | 30,34 | 30,34 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones directas con el modelo base en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 310 MB solo para pesos (77,5 millones de parametros x 4 bytes), mas memoria de activaciones y del tokenizador; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 155 MB para pesos; el modelo completo se ejecuta comodamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gran capacidad por su tamano reducido.
- Cabe en GPU consumer y tambien en CPU: es viable la inferencia en CPU para cargas moderadas.
- Opciones de despliegue: transformers (pipeline text2text-generation), vLLM, TGI, llama.cpp (requiere conversion a GGUF) y Ollama (previa conversion); los tags del modelo indican compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opus-mt-en-es-books-udea | 77,48 M | no disponible | 22,11 (conjunto propio) | apache-2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-en-es (base) | no disponible en la informacion | no disponible | no disponible | apache-2.0 (heredada del proyecto OPUS-MT) | Hugging Face |
| Otros traductores en-es de la familia Marian | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas. La unica referencia solida es el modelo base Helsinki-NLP/opus-mt-en-es, del que este modelo deriva y sobre el que aplica un ajuste fino de dos epochs.

## Limitaciones y advertencias

- El autor no documenta el dataset de entrenamiento ("unknown dataset"), lo que impide evaluar la representatividad del corpus y el riesgo de sesgos.
- No se declaran sesgos conocidos, pero al entrenarse sobre un corpus no documentado de libros, puede heredar sesgos de genero, culturales o de registro presentes en dicho corpus.
- Riesgo de alucinacion y de traducciones infieles en frases idiomaticas, nombres propios o terminologia especializada, especialmente fuera del dominio literario.
- El BLEU de 22,11 y el chrF de 47,11 son moderados; no hay evidencia de que superen al modelo base en dominios generales.
- La longitud de contexto no esta documentada; los modelos Marian suelen limitarse a secuencias cortas, por lo que textos largos requieren segmentacion previa.
- Cobertura limitada a la pareja ingles-castellano; no se declaran otros idiomas ni variantes dialectales.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias del autor sobre calidad o idoneidad para produccion.
- Modelo de nicho con 32 descargas y sin likes; no hay evidencia de validacion independiente ni de mantenimiento posterior.
- El nombre "udea" sugiere un contexto academico (Universidad de Antioquia), pero no se documenta la procedencia exacta del corpus ni posibles derechos sobre los textos utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidGomez49/opus-mt-en-es-books-udea
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Repositorio del proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de MarianMT (Junczys-Dowmunt et al., 2018): https://arxiv.org/abs/1804.00344
- Documentacion de Transformers para MarianMT: https://huggingface.co/docs/transformers/model_doc/marian
