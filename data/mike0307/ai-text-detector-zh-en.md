# Mike0307/ai-text-detector-zh-en

## Resumen

El detector de texto AI de Mike0307 es un clasificador binario y multiclase que determina si un texto en chino o ingles ha sido escrito por una persona o generado por un modelo de lenguaje, y ademas estima a que familia de modelos se parece mas: ChatGPT, Claude, Gemini u otra IA. Se construye mediante fine-tuning de `FacebookAI/xlm-roberta-base` como un clasificador de cinco clases (humano, openai, anthropic, google, other_ai), cuyas salidas se calibran despues con una regresion logistica sobre un conjunto de validacion para producir una unica probabilidad de IA.

Su rasgo diferencial es el formato de distribucion: el repositorio incluye exclusivamente pesos ONNX (fp32, fp16 e int8) pensados para inferencia en el navegador con `transformers.js` y `onnxruntime-web`, de modo que el texto analizado nunca abandona el dispositivo del usuario. El modelo recorta la capa de embeddings de 250.002 a 141.877 filas para eliminar escrituras que no aparecen en su tarea (coreano, tailandes, arabe, cirilico, indico), reduciendo el peso de descarga sin alterar el tokenizador original.

Con 264 descargas y una licencia MIT, resulta relevante para integrar verificacion de contenido generado por IA en aplicaciones web cliente, extensiones de navegador o herramientas editoriales donde la privacidad y el coste de servidor son restrictivos. La evaluacion publicada reporta AUROC de 0,998 en distribucion y de 0,971-0,975 fuera de distribucion, con una tasa de falsos positivos sobre texto humano del 2,6-10 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de 5 clases y calibracion logistica posterior |
| Parametros totales | no disponible (derivado de xlm-roberta-base, ~278 M, con embeddings recortados a 141.877 filas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la longitud maxima de tokens se define en `aidetect.json` |
| Tipos de cuantizacion | fp32 (`model.onnx`, ~780 MB), fp16 (`model_fp16.onnx` y `model_fp16_ext.onnx`, ~390 MB), int8 dinamica por canal (`model_int8_ext.onnx`, ~200 MB) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT (los datos de entrenamiento no son publicos) |
| Formato de pesos | ONNX (con datos externos en las variantes `_ext`), tokenizador en `tokenizer.json`, tablas auxiliares en JSON y binario |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingue, y se ajusta como clasificador de cinco clases: humano, openai, anthropic, google y other_ai. Sobre las probabilidades del clasificador se aplica una segunda etapa de calibracion: se construyen tres caracteristicas —el logit de `1 - P(human)`, un indicador de si el texto es chino y `log(1 + longitud)`—, se estandarizan y se pasan por una regresion logistica cuyos coeficientes se almacenan en `fusion.json` (y en `fusion_int8.json` para la variante int8, reajustada sobre el conjunto de validacion). Los documentos largos se segmentan en parrafos y se puntuan uno a uno.

El entrenamiento se realizo sobre datos no publicos. La model card indica que los textos humanos del conjunto de entrenamiento solo incluyen material verificable como escrito antes del 30 de noviembre de 2022, fecha de lanzamiento de ChatGPT, lo que evita contaminacion con texto humano post-LLM. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma habitual a un clasificador de este tipo). La innovacion tecnica destacable es el recorte del vocabulario de embeddings y la exportacion ONNX con datos externos para que `onnxruntime-web` cargue los pesos directamente en la GPU, reduciendo a la mitad el pico de memoria durante la carga.

## Capacidades

- Clasificacion binaria humano/IA de textos en chino e ingles con probabilidad calibrada.
- Atribucion de fuente entre cinco clases: humano, OpenAI, Anthropic, Google y otra IA.
- Inferencia completamente en el cliente mediante ONNX Runtime Web y `transformers.js`, sin envio de texto a servidores.
- Procesamiento de documentos largos mediante segmentacion en parrafos y agregacion de puntuaciones.
- Variante int8 para dispositivos con poca memoria (moviles, tablets, navegadores con limite de 4 GB por pestaña).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador.
- Cobertura linguistica limitada a chino e ingles; el resto de escrituras se eliminan del vocabulario de embeddings.

## Casos de uso

- Verificacion editorial en el navegador: una extension o web app puede puntuar articulos o submissions antes de publicarlos, manteniendo el contenido en el dispositivo del editor y sin coste de inferencia en servidor.
- Deteccion de ensayos generados por IA en plataformas educativas: el modelo devuelve una probabilidad calibrada y una atribucion de familia, util como señal de triaje (nunca como decision automatica, segun advierte el autor).
- Moderacion de contenido en foros y comunidades: integrado en el cliente, permite marcar publicaciones sospechosas en chino o ingles sin enviar texto de usuarios a terceros.
- Analisis forense de corpus: clasificacion por parrafos de documentos largos para localizar secciones generadas por IA dentro de un texto mayoritariamente humano.
- Investigacion sobre procedencia de texto: la salida de cinco clases permite estudiar la distribucion de familias de modelos en un corpus, con la cautela de que la atribucion degrada en versiones no vistas en entrenamiento.
- Herramienta de escritura asistida: aviso en tiempo real al usuario cuando su borrador se parece demasiado a una salida de LLM, ayudando a mantener un estilo propio.
- Filtrado de datasets: descarte de muestras sinteticas antes de entrenar otros modelos, usando la variante fp32 en servidor para maxima fidelidad.

## Benchmarks y rendimiento

| Conjunto de prueba | AUROC | Precision | Humano marcado como IA | IA detectada |
|---|---|---|---|---|
| En distribucion (zh + en) | 0,998 | 98,4 % | 2,6 % | 99,5 % |
| Ingles fuera de distribucion (textsight 2026) | 0,975 | 91,1 % | 9,3 % | 96,4 % |
| Chino fuera de distribucion (DetectRL-X: GPT-4o, Gemini 2.5, DeepSeek, Qwen) | 0,971 | 91,5 % | 10,0 % | 92,2 % |

Comparativa fp16 frente a int8 en los mismos conjuntos:

| Conjunto de prueba (fp16 / int8) | AUROC | Precision | Humano marcado como IA | IA detectada | Veredicto distinto de fp16 |
|---|---|---|---|---|---|
| En distribucion | 0,999 / 0,999 | 98,6 % / 98,0 % | 2,2 % / 3,2 % | 99,5 % / 99,2 % | 1,4 % |
| Ingles fuera de distribucion | 0,977 / 0,966 | 91,4 % / 90,2 % | 9,0 % / 9,7 % | 96,4 % / 89,3 % | 4,8 % |
| Chino fuera de distribucion | 0,971 / 0,970 | 91,6 % / 91,1 % | 10,0 % / 11,1 % | 92,4 % / 92,2 % | 7,7 % |

## Requisitos de hardware

- VRAM/peso en disco: 780 MB para fp32, 390 MB para fp16 (con o sin datos externos) y 200 MB para int8.
- Memoria pico durante la carga en navegador: aproximadamente 1,5 GB con fp16 y alrededor de 1 GB con int8, segun la model card.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU/WebGL para la variante ONNX; en servidor, una GPU consumer (RTX 3060 o superior) es mas que suficiente dado el tamaño del modelo.
- Cabe en GPU consumer: si, ampliamente; tambien en moviles y tablets mediante la variante int8.
- Opciones de despliegue: `onnxruntime-web` con `transformers.js` en navegador, ONNX Runtime nativo en servidor, y compatible con Text Embeddings Inference y endpoints de Hugging Face segun los tags del repositorio.
- Latencia y throughput: no disponibles de forma explicita en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mike0307/ai-text-detector-zh-en | ~278 M (xlm-roberta-base recortado) | no disponible | zh, en | MIT | Clasificador ONNX en navegador con atribucion de 5 clases |
| Detectores basados en RoBERTa ingleses (p. ej. OpenAI detector, retirado) | ~125-355 M | 512 tokens | en | variable | Clasificacion binaria, solo ingles |
| Clasificadores multilingues genericos sobre XLM-R | ~278 M | 512 tokens | multilingue | variable | Clasificacion binaria sin atribucion de fuente |
| DetectGPT y metodos de perturbacion | depende del modelo puntuador | variable | multilingue | variable | Deteccion sin entrenamiento especifico, mas costosa en inferencia |

La ventaja diferencial frente a alternativas es la combinacion de atribucion de familia de modelo, calibracion explicita y despliegue ONNX en cliente. La desventaja es la cobertura limitada a chino e ingles y la ausencia de comparaciones publicas con detectores comerciales en los mismos conjuntos.

## Limitaciones y advertencias

- Las salidas son estimaciones de probabilidad; el autor advierte explicitamente de que no deben usarse como base unica de decisiones disciplinarias o legales.
- Mayor tasa de falsos positivos en textos cortos, escritura formal y legal, prosa literaria clasica y texto en ingles escrito por no nativos.
- La atribucion de fuente solo es fiable para versiones de modelos presentes en el entrenamiento; degrada con modelos nuevos y con texto de IA prompteado para imitar estilo humano.
- Los datos humanos de entrenamiento se limitan a texto verificable anterior al 30 de noviembre de 2022, lo que puede introducir sesgo frente a estilos de escritura posteriores.
- Cobertura linguistica restringida a chino e ingles; el vocabulario de embeddings elimina otras escrituras, por lo que no debe usarse con otros idiomas.
- Los datos de entrenamiento no son publicos, lo que dificulta la auditoria de sesgos y la reproducibilidad.
- Licencia MIT permite uso comercial, pero sin garantias del autor sobre idoneidad para produccion.
- La variante int8 presenta una tasa de veredictos distintos de fp16 de hasta el 7,7 % en chino fuera de distribucion, relevante si se exige consistencia entre dispositivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mike0307/ai-text-detector-zh-en
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Conjunto de evaluacion en ingles fuera de distribucion (textsight 2026): no disponible
- Conjunto de evaluacion en chino fuera de distribucion (DetectRL-X): no disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
