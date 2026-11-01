# chopsticky/nmt-fr-en-gru-attention

## Resumen

`nmt-fr-en-gru-attention` es un modelo de traduccion automatica neuronal (NMT) frances-ingles desarrollado por Marc Bradley (usuario de HuggingFace `chopsticky`) como proyecto final del curso CSCI E-89B de la Harvard Extension School (otoño de 2026). Se trata de un modelo seq2seq clasico con encoder-decoder basado en celdas GRU y un mecanismo de atencion, implementado con Keras 3.13.2. No es un transformer ni un modelo de lenguaje generativo: es un sistema de traduccion dedicado y de proposito especifico, entrenado sobre el corpus Tatoeba (via ManyThings fra-eng).

El modelo resuelve una tarea acotada: traducir frases cortas del frances al ingles. Su relevancia no reside en competir con los grandes modelos de traduccion neuronales actuales, sino en servir como referencia pedagogica reproducible: incluye pesos, vocabularios y un fichero de comprobacion con 64 frases de validacion y sus traducciones, lo que permite verificar el comportamiento exacto del modelo. El repositorio ocupa 0,1 GB y las descargas y likes registrados son cero en el momento de la consulta.

Con un BLEU de 58,0 y un chrF de 69,4 sobre el conjunto de test (evaluado una sola vez con sacreBLEU 2.6.0, en minusculas y con multiples referencias), el modelo muestra un rendimiento solido dentro de su dominio, aunque limitado a frases de Tatoeba y a la direccion fr→en.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2seq encoder-decoder con celdas GRU y mecanismo de atencion (Keras 3.13.2) |
| Parametros totales | no disponible (pesos de 60 MB en `nmt.weights.h5`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato HDF5 de Keras) |
| Idiomas soportados | frances (entrada) e ingles (salida) |
| Licencia | CC BY 4.0 |
| Formato de pesos | HDF5 de Keras (`.weights.h5`), sin estado del optimizador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de traduccion neuronal secuencia a secuencia: un encoder recurrente con celdas GRU que procesa la frase en frances y un decoder tambien GRU que genera la traduccion en ingles, conectados mediante un mecanismo de atencion. La implementacion esta hecha en Keras 3.13.2 y el codigo del modelo se encuentra en el cuaderno del proyecto y en el `app.py` del Space de demostracion `chopsticky/nmt-fr-en-demo`.

Los datos de entrenamiento provienen de Tatoeba a traves del corpus ManyThings fra-eng (CC BY 2.0), el mismo conjunto publicado como dataset de Kaggle `chopsticky/nmt-fr-en-gru-attention`. El autor documenta una semilla de entrenamiento en el fichero `nmt_vocab.json`, junto con los vocabularios de frances e ingles y los ajustes del modelo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de este tipo y tamano).

## Capacidades

- Traduccion de texto de frances a ingles, limitada a frases del dominio de Tatoeba.
- Generacion de traducciones a partir de vocabularios cerrados incluidos en `nmt_vocab.json`.
- Verificacion reproducible mediante `nmt_check.json`, que contiene 64 frases de validacion y las traducciones generadas por el cuaderno.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada estrictamente al par fr-en.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Traduccion de frases cortas en entornos educativos: el modelo sirve para ilustrar el funcionamiento de un seq2seq con atencion en cursos de procesamiento de lenguaje natural, gracias a que incluye pesos, vocabularios y un conjunto de comprobacion reproducible.
- Referencia base (baseline) para experimentos de NMT: util para comparar arquitecturas recurrentes con transformer en tareas fr-en sobre Tatoeba, dado su BLEU documentado de 58,0.
- Prototipado de pipelines de traduccion en Keras: al estar implementado en Keras 3.13.2, puede integrarse en flujos de trabajo existentes de este framework sin conversion de formato.
- Demostraciones interactivas: el Space `chopsticky/nmt-fr-en-demo` permite probar el modelo en navegador, adecuado para talleres y presentaciones academicas.
- Validacion de tecnicas de atencion: el modelo permite inspeccionar el comportamiento de un mecanismo de atencion sobre un vocabulario y un corpus acotados.
- Reproduccion de resultados academicos: la inclusion de la semilla de entrenamiento y del fichero de comprobacion facilita replicar el experimento del proyecto CSCI E-89B.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Herramienta |
|---|---|---|---|
| BLEU | 58,0 | Test (evaluado una vez) | sacreBLEU 2.6.0, minusculas, multi-referencia |
| chrF | 69,4 | Test (evaluado una vez) | sacreBLEU 2.6.0, minusculas, multi-referencia |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; los pesos ocupan 60 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo es lo bastante pequeno para ejecutarse en CPU con latencia aceptable para frases cortas.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Keras 3.13.2 (framework nativo); el autor publica un Space de Gradio (`chopsticky/nmt-fr-en-demo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es HDF5 de Keras y no GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chopsticky/nmt-fr-en-gru-attention` | Seq2seq GRU con atencion | no disponible (60 MB de pesos) | no disponible | CC BY 4.0 | HuggingFace, Keras |
| Modelos NMT transformer fr-en (genericos) | Transformer encoder-decoder | no disponible | no disponible | variable | HuggingFace |
| Helsinki-NLP/opus-mt-fr-en | Transformer (Marian) | no disponible | no disponible | CC BY 4.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre Tatoeba, un corpus de frases cortas y sencillas; el rendimiento fuera de ese dominio (texto tecnico, legal, conversacional largo) no esta documentado y probablemente sea inferior.
- Direccion unica: solo traduce de frances a ingles; no soporta la direccion inversa ni otros pares de idiomas.
- Longitud de contexto no documentada: al ser un modelo seq2seq recurrente, es probable que tenga limitaciones en frases largas, aunque no se especifica el maximo.
- Riesgo de alucinacion y traducciones incorrectas en vocabulario fuera del conjunto de entrenamiento, dado el tamano reducido del vocabulario cerrado.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus Tatoeba puede contener sesgos propios de su origen comunitario.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero el modelo es un proyecto academico sin garantias de mantenimiento ni soporte.
- Sin estado del optimizador en los pesos: no es posible reanudar el entrenamiento directamente desde `nmt.weights.h5`.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chopsticky/nmt-fr-en-gru-attention
- Space de demostracion: https://huggingface.co/spaces/chopsticky/nmt-fr-en-demo
- Dataset en Kaggle: https://www.kaggle.com/datasets/chopsticky/nmt-fr-en-gru-attention
- Corpus ManyThings fra-eng (Tatoeba): https://www.manythings.org/anki/
- Tatoeba: https://tatoeba.org/
- sacreBLEU: https://github.com/mjpost/sacrebleu
