# gaganmittal2023/ast-gtzan

## Resumen

ast-gtzan es un modelo de clasificación de audio publicado por el usuario gaganmittal2023 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del checkpoint MIT/ast-finetuned-audioset-10-10-0.4593, que es un Audio Spectrogram Transformer (AST) preentrenado sobre AudioSet, y se ha especializado en la tarea de clasificación de género musical sobre el dataset GTZAN, con 10 clases. El modelo resuelve un problema concreto y muy acotado: dado un fragmento de audio musical, asignarle una etiqueta de género entre las diez categorías de GTZAN. Alcanza una precisión declarada de 0,885 (88,5 %) y una pérdida de evaluación de 0,4088.

Técnicamente no es un modelo de lenguaje: es un transformer de visión aplicado a espectrogramas de mel, con unos 86,2 millones de parámetros (86.196.490 según el archivo de pesos en safetensors) y un tamaño de repositorio de 0,3 GB. No procesa texto, por lo que conceptos como ventana de contexto, tokenizador de texto o soporte multilingüe no aplican en el sentido habitual; su entrada es un espectrograma de audio de longitud variable y su salida es una distribución de probabilidad sobre las clases de género.

Su relevancia es práctica y de nicho: sirve como referencia reproducible para tareas de etiquetado musical automático (music information retrieval), como base para comparar arquitecturas de clasificación de audio y como componente ligero desplegable en pipelines de catalogación musical. Hay que tener en cuenta que la model card es prácticamente automática, no incluye descripción de uso previsto ni limitaciones, y que el modelo tiene cero descargas y cero valoraciones en el momento de redactar esta ficha, además de una precisión declarada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer tipo ViT sobre parches de espectrograma de mel |
| Parametros totales | 86.196.490 (86,2 M, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de texto. Entrada de audio de longitud variable; el checkpoint base de AST se preentrena con clips de audio de unos 10 s a 16 kHz |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. Al ser un modelo de 86,2 M de parametros es viable la cuantizacion a int8 y fp16, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | No disponible (no aplica: la entrada es audio, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (tambien compatible con transformers; no se publican pesos GGUF) |
| Pipeline | audio-classification |
| Dataset de ajuste fino | marsyas/gtzan |
| Modelo base | MIT/ast-finetuned-audioset-10-10-0.4593 |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura es un AST, es decir, un transformer de tipo Vision Transformer adaptado a audio: la señal se convierte en un espectrograma de mel y se divide en parches solapados que se tratan como si fueran "pixeles" de una imagen, con un token de clasificación y embeddings posicionales aprendidos. El checkpoint base MIT/ast-finetuned-audioset-10-10-0.4593 sigue la convención de nombres del autor original, donde "10-10" indica el tamaño de parche en tiempo y frecuencia y "0.4593" corresponde al mAP obtenido en AudioSet. Ese preentrenamiento sobre AudioSet (clasificación de eventos sonoros con cientos de clases) es lo que dota al modelo de representaciones acústicas generales antes del ajuste fino a género musical.

El ajuste fino se realizó con el Trainer de transformers sobre el dataset GTZAN, con los siguientes hiperparámetros declarados: learning rate 5e-05, tamaño de lote de entrenamiento y de evaluación de 8, 10 épocas, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, semilla 42 y precisión mixta nativa (AMP). Con 1000 pasos registrados en 10 épocas, el conjunto de entrenamiento efectivo es de aproximadamente 800 ejemplos por época, coherente con un reparto convencional 90/10 de las 1000 pistas de GTZAN. No se documenta en la información disponible ningún uso de RLHF, DPO ni técnicas de decodificación especulativa, algo por otra parte ajeno a una tarea de clasificación.

El detalle más relevante del entrenamiento es la curva de pérdida: la pérdida de entrenamiento cae hasta 0,0002 en la época 8, mientras que la pérdida de validación oscila entre 0,41 y 0,71 y nunca baja de 0,4088. Es un patrón claro de sobreajuste sobre un dataset pequeño, y la precisión de validación se estabiliza alrededor de 0,88-0,89 desde la época 5, sin mejoras sustanciales en las últimas épocas.

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Precision |
|---|---|---|---|---|
| 1 | 100 | 0,6612 | 0,6092 | 0,805 |
| 2 | 200 | 0,3836 | 0,6416 | 0,800 |
| 3 | 300 | 0,1854 | 0,4391 | 0,865 |
| 4 | 400 | 0,0247 | 0,7096 | 0,820 |
| 5 | 500 | 0,0255 | 0,4970 | 0,875 |
| 6 | 600 | 0,0006 | 0,4860 | 0,855 |
| 7 | 700 | 0,0006 | 0,4456 | 0,885 |
| 8 | 800 | 0,0002 | 0,4370 | 0,890 |
| 9 | 900 | 0,0314 | 0,4168 | 0,885 |
| 10 | 1000 | 0,0046 | 0,4097 | 0,885 |

## Capacidades

- Clasificacion de audio en 10 clases de genero musical, segun la taxonomia estandar de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock).
- Salida de probabilidades por clase, lo que permite usar el modelo como etiquetador multi-etiqueta mediante umbrales o como extractor de scores de similitud entre fragmentos.
- Extraccion de representaciones acusticas intermedias (embeddings del token de clasificacion o de los tokens de parche), reutilizables como features para otras tareas de music information retrieval.
- Acepta audio de longitud variable a traves del extractor de caracteristicas de AST, que remuestrea a 16 kHz y genera el espectrograma de mel.
- No soporta tool calling ni function calling: no es un modelo generativo ni un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni cadenas de razonamiento.
- No dispone de modo "thinking", vision, audio generativo ni capacidades multimodales mas alla de la entrada de audio.
- No tiene capacidades multilingues: no procesa texto.

## Casos de uso

- Catalogacion automatica de bibliotecas musicales: etiquetar por genero grandes volumenes de pistas sin metadatos, usando el modelo como clasificador por lotes sobre espectrogramas de 10 s. Es adecuado porque su tamano de 86,2 M de parametros permite procesar miles de pistas por GPU y hora en lugar de requerir un modelo grande por pista.
- Generacion de playlists y recomendacion por genero: obtener la distribucion de probabilidad sobre los 10 generos de un fragmento para construir listas tematicas o como senal auxiliar de un sistema de recomendacion, aprovechando que el modelo devuelve scores continuos y no solo la clase ganadora.
- Monitorizacion de emisiones de radio y television: clasificar por genero los cortes musicales de una emision continua, segmentando previamente el audio y aplicando el modelo a cada corte para generar informes de parrilla musical.
- Moderacion y filtrado de contenido en plataformas de subida de audio: detectar generos concretos para aplicar politicas de catalogacion o de recomendacion (por ejemplo, separar contenido musical de contenido hablado o identificar generos con restricciones editoriales).
- Curacion de datasets de investigacion en MIR: usar el modelo como anotador automatico de genero para preetiquetar corpus nuevos antes de la revision humana, reduciendo el coste de anotacion manual.
- Herramientas educativas de teoria musical: clasificar ejemplos de audio que sube un estudiante para practicar el reconocimiento de generos, integrando el modelo detras de una interfaz web sencilla.
- Organizacion de bibliotecas personales de DJ o productores: etiquetado local de carpetas de samples y pistas, ejecutable en CPU o en una GPU de consumo por el reducido consumo de memoria del modelo.
- Baseline reproducible para experimentos de clasificacion de audio: sirve como punto de referencia para comparar tecnicas de aumento de datos, otras arquitecturas o estrategias de ajuste fino sobre GTZAN.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card y en el model-index, marcados como no verificados.

| Modelo | Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| gaganmittal2023/ast-gtzan | GTZAN (marsyas/gtzan) | Audio classification | Accuracy | 0,885 | No |
| gaganmittal2023/ast-gtzan | GTZAN (marsyas/gtzan) | Audio classification | Loss (evaluacion) | 0,4088 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso esos benchmarks no son aplicables a un modelo de clasificacion de audio. Tampoco se aportan matrices de confusion, F1 por clase ni resultados sobre otros corpus musicales como MagnaTagATune o MTG-Jamendo.

## Requisitos de hardware

- Memoria en punto flotante de 32 bits: aproximadamente 345 MB solo para los pesos (86.196.490 parametros x 4 bytes), en torno a 1 GB de uso total con activaciones y sobrecarga del runtime.
- Memoria en fp16 o bf16: aproximadamente 172 MB para los pesos; menos de 500 MB de uso total en inferencia con lote 1.
- Memoria en int8: aproximadamente 86 MB para los pesos, si se exporta a ONNX Runtime u OpenVINO con cuantizacion dinamica. No hay variantes cuantizadas publicadas por el autor, por lo que la cuantizacion requiere exportacion propia.
- Cabe sobradamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090 o incluso GPUs con 4 GB de VRAM. Tambien es viable la inferencia en CPU para lotes pequenos.
- No requiere GPUs de centro de datos (A100, H100) ni sharding; el modelo cabe en una sola GPU o incluso en memoria unificada compartida.
- Opciones de despliegue: pipeline de transformers con la tarea audio-classification, exportacion a ONNX u OpenVINO mediante Optimum, TorchScript, TorchServe o servicios gestionados compatibles con transformers (el repositorio esta marcado como endpoints_compatible).
- vLLM, llama.cpp y Ollama no son aplicables: no existen pesos GGUF para AST y estas herramientas estan orientadas a modelos de lenguaje generativos.
- Latencia y throughput: no disponible. No se han publicado mediciones. Como orientacion, para un transformer de 86,2 M de parametros sobre aproximadamente 1200 parches de entrada, la inferencia por fragmento se sitúa en el orden de decenas de milisegundos en GPU moderna y de decimas de segundo en CPU, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea y dataset | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gaganmittal2023/ast-gtzan | 86,2 M | Clasificacion de genero musical, GTZAN (10 clases) | Accuracy 0,885 (no verificado) | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | 86,2 M (mismo backbone) | Clasificacion de eventos sonoros, AudioSet | 0,4593 mAP segun la convencion de nombre del checkpoint; no confirmado en la informacion disponible | No disponible | Hugging Face |
| Otros ajustes finos de AST sobre GTZAN publicados en el Hub | ~86,2 M | Clasificacion de genero musical, GTZAN | No disponible | Variable segun el autor | Hugging Face |

No se dispone de datos comparativos verificados frente a alternativas de la misma categoria, como PANN (CNN de audio), VGGish, o ajustes finos de wav2vec 2.0 y HuBERT sobre GTZAN, porque la informacion proporcionada no incluye sus resultados. Cualquier comparacion numerica con esos modelos requeriria consultar sus respectivas model cards y reproducir la evaluacion con el mismo protocolo de particion.

## Limitaciones y advertencias

- Sobreajuste evidente: la perdida de entrenamiento llega a 0,0002 mientras la de validacion se queda en 0,4097. El modelo memoriza en gran medida el conjunto de entrenamiento a partir de la cuarta o quinta epoca.
- La precision de 0,885 esta declarada como no verificada y procede de una unica particion de evaluacion (aproximadamente 100 pistas). No hay validacion cruzada ni intervalos de confianza.
- GTZAN es un dataset pequeno (1000 pistas de 30 s) y con problemas conocidos y documentados en la literatura de MIR: ficheros danados o mal etiquetados, repeticion de artistas entre particiones y posibles fugas entre entrenamiento y evaluacion. Estos problemas limitan la generalizacion de cualquier resultado obtenido sobre el.
- Espacio de etiquetas muy reducido: solo 10 generos, sin jerarquia, sin subgeneros y sin etiquetas de instrumento, animo, tempo o epoca. No sirve para tareas de etiquetado musical general.
- Degradacion esperable fuera de dominio: grabaciones en directo, produccion electronica contemporanea, musica no occidental o audio con ruido y locucion pueden clasificarse de forma incorrecta, ya que el ajuste fino se hizo exclusivamente sobre GTZAN.
- No hay informacion sobre sesgos por genero musical ni por origen cultural del audio, ni sobre el equilibrio de clases mas alla del diseno del dataset.
- Riesgo de alucinacion en el sentido generativo: no aplica, porque el modelo no genera texto. Si se usa como preetiquetador automatico, existe riesgo de falsos positivos con alta confianza, que conviene filtrar con umbrales y revision humana.
- La model card esta generada automaticamente y el autor no ha completado las secciones de descripcion, usos previstos ni limitaciones ("More information needed"). No hay documentacion sobre el proceso de particion de datos ni sobre la reproducibilidad exacta.
- Licencia del modelo: BSD-3-Clause, permisiva para uso comercial, siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad. Ahora bien, conviene verificar de forma independiente la licencia y el estatus de derechos del dataset GTZAN antes de un uso comercial, ya que los derechos sobre las grabaciones musicales originales no estan cubiertos por la licencia del modelo.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la consulta, creado y actualizado el 10 de septiembre de 2026. No hay pruebas externas de su comportamiento en produccion.
- Dependencias muy recientes (transformers 5.17.0, PyTorch 2.11.0+cu128) que pueden complicar la reproduccion en entornos con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaganmittal2023/ast-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset de ajuste fino: https://huggingface.co/datasets/marsyas/gtzan
- Referencia externa, no citada en la model card: articulo original del Audio Spectrogram Transformer, https://arxiv.org/abs/2104.01778
- Referencia externa, no citada en la model card: repositorio del autor original de AST, https://github.com/YuanGongND/ast
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a servicios de verificacion de numeros de telefono y denuncia de llamadas fraudulentas (suscall.com, reportfraud.ftc.gov, scamcallcheck.com, lookup.robokiller.com, malwarebytes.com/scam-check/phone), sin relacion alguna con modelos de clasificacion de audio.
