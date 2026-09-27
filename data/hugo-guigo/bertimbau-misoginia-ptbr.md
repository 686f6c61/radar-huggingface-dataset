# hugo-guigo/bertimbau-misoginia-ptbr

## Resumen

bertimbau-misoginia-ptbr es un clasificador binario de texto en portugues de Brasil que determina si un texto corto de redes sociales presenta rasgos de misoginia. Lo desarrolla Hugo Guilherme de Assis Paula (Universidad Federal de Goias, UFG), con la supervision de la profesora Deborah Silva Alves Fernandes (INF/UFG), y es un ajuste fino del modelo neuralmind/bert-base-portuguese-cased, tambien conocido como BERTimbau base.

El modelo resuelve una tarea concreta y acotada: la deteccion de discurso misogino en portugues brasileño, un idioma con relativamente pocos recursos abiertos para moderacion de contenido. Cuenta con 108.924.674 parametros (un encoder tipo transformer de ~110 M), pesos en safetensors y un repositorio de 0,4 GB. Es la pieza de clasificacion que alimenta la demo Misogyny Lens PT-BR publicada por el mismo autor.

Su relevancia actual reside en que ofrece un punto de partida abierto y reproducible para investigacion sobre discurso de odio en portugues, con resultados medidos sobre un conjunto de test reservado de 333 frases del corpus ToLD-BR (87,4% de exactitud y F1 de 0,819). El propio autor lo declara de uso exclusivamente investigador y advierte de que no debe emplearse para moderar o juzgar a personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 108.924.674 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card. El entrenamiento trunca las entradas a 64 tokens; la arquitectura BERT base admite hasta 512 posiciones |
| Tipos de cuantizacion | No disponibles. El repositorio solo publica pesos en safetensors (fp32) |
| Idiomas soportados | Portugues (pt; variante de Brasil, pt-BR) |
| Licencia | other (uso exclusivamente investigador segun la model card; el modelo base es MIT). Los datos de entrenamiento siguen las licencias de los datasets de origen |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un clasificador de secuencias construido sobre BERTimbau base (neuralmind/bert-base-portuguese-cased), un encoder transformer bidireccional de 12 capas y ~110 M de parametros preentrenado en portugues brasileño. Sobre esa base se añade una cabeza de clasificacion de dos etiquetas: label 1 = rasgos de misoginia, label 0 = ausencia de esos rasgos. La inferencia se realiza con el pipeline de text-classification de Transformers.

El ajuste fino se hizo sobre un corpus unificado que combina los datasets HateBR, ToLD-BR y Portuguese Hate Speech, deduplicado, procedente del repositorio de investigacion lexico-misoginia-ptbr. Para evitar fuga de datos, las frases del conjunto de test y sus duplicados (371 filas) se eliminaron del entrenamiento. Se empleo una submuestra balanceada del split de entrenamiento con 11.120 textos, truncado a un maximo de 64 tokens, learning rate 2e-5, batch de 16, fp16, optimizador AdamW con warmup lineal y 3 epocas sobre una GPU T4 de Colab. La epoca 2 se selecciono usando un split de validacion reservado, y el conjunto de test no se utilizo para ninguna decision de diseno. No se documenta el uso de RLHF ni de DPO, algo esperable en un modelo encoder de clasificacion.

## Capacidades

- Clasificacion binaria de texto: devuelve si un texto corto en portugues de Brasil presenta o no rasgos de misoginia.
- Deteccion de discurso de odio en sentido amplio: al entrenarse sobre HateBR, ToLD-BR y Portuguese Hate Speech, cubre vocabulario y patrones propios de estas tareas.
- Procesamiento de textos breves de estilo redes sociales, principalmente comentarios tipo Twitter.
- Funciona como componente dentro de un sistema mayor: el autor publica un ensemble con un SVM de lexico que mejora ligeramente las metricas.
- Integrable mediante la libreria Transformers (pipeline de text-classification) y exportable a otros runtimes de inferencia.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio. Es exclusivamente un clasificador.

## Casos de uso

- Moderacion asistida en comunidades online: el modelo puede actuar como primera señal de triaje sobre comentarios cortos en portugues, dejando siempre la decision final a un moderador humano. Su alta precision (96,0%) reduce falsos positivos, aunque su recall mas bajo (71,4%) obliga a no usarlo como unico filtro.
- Investigacion en ciencias sociales y linguistica: permite etiquetar grandes volumenes de comentarios en pt-BR para estudios sobre incidencia de misoginia, con un coste muy inferior al etiquetado manual.
- Anotacion asistida y aprendizaje activo: al preetiquetar corpus, el modelo reduce el esfuerzo humano necesario para construir datasets de discurso de odio, que despues se revisan y corrigen manualmente.
- Construccion y curado de datasets: filtrar o marcar automaticamente contenido misogino en corpus recopilados de redes sociales antes de su publicacion o analisis.
- Observatorios de discurso de odio y monitorizacion de redes: integrado en pipelines de recoleccion (por ejemplo, desde APIs de plataformas), permite seguir la evolucion de este tipo de contenido a lo largo del tiempo.
- Sistemas de alerta temprana para plataformas: combinado con reglas y con el ensemble de lexico propuesto por el autor, puede disparar revisiones prioritarias en comentarios con alta probabilidad de misoginia.
- Analisis de comentarios en medios de comunicacion digitales: clasificar las respuestas de los lectores para entender el tono y el nivel de toxicidad, siempre con revision humana dado el caracter investigador de la licencia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de test reservado de 333 frases (ToLD-BR), evaluado una sola vez:

| Modelo | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|
| Este modelo | 87,4% | 0,819 | 96,0% | 71,4% |
| Ensemble con SVM de lexico (ver el Space) | 88,0% | 0,831 | 95,2% | 73,7% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo coherente con la naturaleza del modelo, que es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 440 MB en fp32 y unos 220 MB en fp16 para los 108,9 M de parametros, mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las GPU de gama alta son innecesarias para este tamaño.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta moderna, incluida una GTX 1650 o integradas de gama reciente, puede ejecutarlo. Tambien es viable la inferencia en CPU para volumenes moderados.
- Opciones de despliegue: pipeline de text-classification de Hugging Face Transformers, ONNX Runtime o TorchScript para optimizar latencia, y Hugging Face Inference Endpoints para servicio gestionado. Los servidores orientados a generacion (vLLM, llama.cpp, Ollama, TGI) no estan pensados para encoders de clasificacion como este.
- Latencia y throughput: no se proporcionan datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bertimbau-misoginia-ptbr (este modelo) | 108,9 M | Entrenamiento a 64 tokens (arquitectura BERT base) | Clasificador binario de misoginia en pt-BR | other (uso investigador) | Hugging Face |
| neuralmind/bert-base-portuguese-cased (modelo base) | 108,9 M | 512 tokens | Encoder preentrenado, sin cabeza de clasificacion especifica | MIT | Hugging Face |
| Otros clasificadores de discurso de odio en portugues | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento con otros clasificadores de misoginia o discurso de odio en portugues en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card indica de forma explicita que el modelo no debe usarse para moderar ni juzgar a personas.
- Conjunto de test reducido: solo 333 frases, con un intervalo de confianza del 95% para la exactitud de aproximadamente mas o menos 3 puntos, por lo que las metricas deben tomarse con cautela.
- Recall limitado: se le escapan aproximadamente 3 de cada 10 casos positivos, lo que lo hace inadecuado como unico filtro de moderacion.
- Dominio restringido: entrenado sobre comentarios de estilo Twitter; su rendimiento en noticias o textos largos no se ha medido.
- Sesgos: el propio autor advierte de que el modelo refleja los sesgos de sus datos de entrenamiento.
- Riesgo de clasificacion erronea de lenguaje figurado, ironia, citas o lenguaje reivindicativo, habitual en tareas de deteccion de discurso de odio.
- Cobertura linguistica limitada al portugues de Brasil; no se ha validado en otras variantes del portugues.
- Licencia "other": conviene revisar las condiciones concretas y las licencias de los datasets de origen antes de cualquier uso, especialmente comercial.
- Sin versiones cuantizadas publicadas ni datos de latencia, lo que obliga a validar el rendimiento en produccion por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugo-guigo/bertimbau-misoginia-ptbr
- Demo Misogyny Lens PT-BR: https://huggingface.co/spaces/hugo-guigo/misogyny-lens-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de investigacion y datos: https://github.com/hugo-guigo/lexico-misoginia-ptbr
- Datasets de origen citados (HateBR, ToLD-BR y Portuguese Hate Speech): nombres mencionados en la model card, sin URL disponible en la informacion proporcionada.

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a entidades no relacionadas (Hugo Boss, Victor Hugo, el generador de sitios Hugo y Hugo Publishing) y se han descartado.
