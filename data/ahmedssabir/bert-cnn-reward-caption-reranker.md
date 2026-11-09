# AhmedSSabir/BERT-CNN-Reward-Caption-Reranker

## Resumen

BERT-CNN Reward Caption Reranker es un modelo de reranking de subtítulos (captions) de imágenes desarrollado por AhmedSSabir. No genera texto ni procesa imágenes directamente: recibe las nueve candidatas producidas por un generador de captions con beam search y un conjunto de etiquetas textuales extraídas de la imagen (objetos, escenas), y selecciona la que con mayor probabilidad coincide con las referencias humanas. Se construye sobre el modelo BERT-CNN de relacion semantica visual del paper "Visual Semantic Relatedness Dataset for Image Captioning" (arXiv:2301.08784) y anade una segunda fase de entrenamiento con una recompensa listwise basada en CIDEr esperado.

El modelo parte de `google-bert/bert-base-uncased` (108,97 millones de parametros) y anade una cabeza CNN, alcanzando 108.966.401 parametros totales. Su relevancia actual radica en que mejora las metricas de captioning de un modelo de vision-lenguaje de gran tamano sin reentrenarlo: segun la model card, aplicado sobre las nueve candidatas de Gemma 4 12B eleva CIDEr de 0,9624 a 0,9783 en las 5.000 imagenes del test Karpathy de COCO.

Es una pieza de infraestructura para pipelines de image captioning: un componente ligero (0,4 GB de repositorio) que se situa entre el generador de captions y la salida final para seleccionar la mejor candidata. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base con cabeza CNN (BERT-CNN) para reranking de captions |
| Parametros totales | 108.966.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base, tipicamente 512 tokens, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch (libreria pytorch) |
| Modelo base | google-bert/bert-base-uncased |
| Tamano del repositorio | 0,4 GB |
| Entrada | contexto visual textual + exactamente 9 captions en orden de beam search |
| Dataset de entrenamiento | AhmedSSabir/Textual-Image-Caption-Dataset |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base (`bert-base-uncased`) con una cabeza CNN que produce un logit de relacion semantica visual entre un contexto textual y un caption. El entrenamiento consta de dos fases. La fase I es el preentrenamiento de relacion del paper: BERT-base con cabeza CNN entrenado con entropia cruzada binaria sobre el dataset de relacion semantica visual (330.790 pares contexto/caption, etiquetados como relacionados si la similitud es al menos 0,3).

La fase II, especifica de este modelo, es un ajuste fino con recompensa listwise. Se usan 10.000 imagenes de entrenamiento de COCO: un captioner BLIP congelado (`Salesforce/blip-image-captioning-base`) genera nueve captions por imagen mediante beam search, y cada candidata recibe una recompensa `r_k = CIDEr(c_k, referencias)` frente a los captions humanos de COCO. La puntuacion de reranking es `s_k = b_k + w * f(v, c_k)`, donde `f` es el logit del BERT-CNN, `b_k` es un bonus aprendido por posicion de beam y `w` un peso aprendido. El modelo maximiza la recompensa esperada exacta sobre las nueve candidatas, `E_{k ~ softmax(s)}[r_k]`, con la recompensa media como baseline; es un objetivo de gradiente de politica calculado sin muestreo. El entrenamiento duro 4 epocas (5.000 pasos) con Adam, tasas de aprendizaje de 1e-6 para BERT, 1e-5 para la cabeza CNN y 1e-2 para `b` y `w`, y tardo 7 minutos en una RTX A5000. No se usa anotacion humana nueva: la recompensa proviene de los captions de referencia existentes de COCO.

## Capacidades

- Reranking de captions: selecciona la mejor entre exactamente nueve candidatas generadas por beam search, dado un contexto visual textual.
- Puntuacion de relacion semantica visual: la funcion `logits(context, captions)` devuelve las puntuaciones crudas BERT-CNN para pares contexto/caption arbitrarios.
- Aprovechamiento del orden de beam: incorpora un bonus aprendido por posicion de beam, por lo que requiere las candidatas en el orden del generador.
- Mejora de captioners de terceros sin reentrenamiento: segun la model card, aplicado sobre Gemma 4 12B sube CIDEr de 0,9624 a 0,9783 en el test Karpathy de COCO.
- No lee imagenes ni genera captions: depende de un extractor de etiquetas externo (no incluido en el repositorio) y de un captioner externo.
- Solo ingles.
- No se documentan tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Mejora de pipelines de image captioning en produccion: se coloca tras un captioner con beam search y antes de la salida final; con 109 millones de parametros y 0,4 GB de pesos, el coste adicional de inferencia es bajo frente al del generador.
- Seleccion de captions en sistemas de accesibilidad: para describir imagenes a usuarios con discapacidad visual, elegir la candidata con mayor CIDEr esperado reduce descripciones imprecisas frente a tomar el primer beam.
- Anotacion asistida de datasets: generar nueve candidatas por imagen y dejar que el reranker proponga la mejor, reduciendo el trabajo de revision humana en la construccion de corpus de captioning.
- Indexado y busqueda de imagenes: producir captions mas fieles para el indice textual de un buscador o catalogo, lo que mejora la recuperacion por texto.
- Moderacion y control de calidad de captions generados: puntuar pares contexto/caption con `logits` para detectar descripciones poco relacionadas con el contenido de la imagen antes de publicarlas.
- Evaluacion comparativa de captioners: usar el reranker como criterio de seleccion fijo para medir de forma mas justa la calidad de distintos generadores sobre el mismo conjunto de imagenes.
- Investigacion en aprendizaje por refuerzo para generacion de texto: el objetivo de recompensa esperada listwise sin muestreo sirve como referencia reproducible (7 minutos de entrenamiento en una RTX A5000) para experimentar con recompensas basadas en metricas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las 5.000 imagenes del test Karpathy de COCO.

Candidatas de Gemma 4 12B (`google/gemma-4-12B-it`, nueve beams, sin reentrenar el reranker):

| Metodo | BLEU-4 | METEOR | ROUGE-L | CIDEr | SPICE | BERTScore |
|---|---:|---:|---:|---:|---:|---:|
| Gemma 4 12B, beam 1 de 9 | 0,2441 | 0,2739 | 0,5288 | 0,9624 | 0,2248 | 0,9438 |
| Gemma 4 12B + este modelo | 0,2458 | 0,2766 | 0,5314 | 0,9783 | 0,2267 | 0,9448 |

Candidatas de BLIP en dominio (mismas 5.000 imagenes):

| Metodo | CIDEr |
|---|---:|
| Mejor beam | 1,0632 |
| Este modelo | 1,1470 |

Sobre las candidatas de Gemma 4, el modelo sustituye el caption superior en 1.298 de 5.000 imagenes: CIDEr mejora en 751, empeora en 543 y empata en 4. La model card indica que la ganancia varia segun el captioner y que esta ausente en BLIP-2 OPT-2.7B sobre COCO.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 108,97 millones de parametros en precision completa (fp32) los pesos ocupan aproximadamente 0,44 GB, y en fp16 unos 0,22 GB, mas memoria de activaciones.
- GPU: el autor entreno en una RTX A5000 (7 minutos, 4 epocas, 5.000 pasos), lo que indica que la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, por el tamano del modelo; la model card no publica requisitos minimos.
- Despliegue: el repositorio incluye codigo propio (`inference.py` con la clase `CaptionReranker`), cargado via `snapshot_download` de `huggingface_hub`; soporta `device="cpu"` y `device="cuda"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia interna, la model card compara contra el captioner base sin reranking (Gemma 4 12B, beam 1 de 9, CIDEr 0,9624) y contra BLIP con mejor beam (CIDEr 1,0632), pero no frente a otros rerankers.

| Modelo | Parametros | Contexto | CIDEr (test Karpathy COCO) | Licencia |
|---|---|---|---|---|
| BERT-CNN Reward Caption Reranker | 108.966.401 | no disponible | 1,1470 (candidatas BLIP) / 0,9783 (candidatas Gemma 4) | no disponible |
| Gemma 4 12B, beam 1 de 9 | no disponible | no disponible | 0,9624 | no disponible |
| BLIP con mejor beam | no disponible | no disponible | 1,0632 | no disponible |

## Limitaciones y advertencias

- No procesa imagenes: necesita un extractor de etiquetas externo para el contexto visual, y el repositorio no lo incluye; el usuario debe aportarlo.
- Requiere exactamente nueve captions en el orden de beam del generador; con otro numero u orden, el bonus por posicion de beam deja de ser valido.
- La ganancia no es universal: la model card indica que varia segun el captioner y que esta ausente en BLIP-2 OPT-2.7B sobre COCO; sobre Gemma 4, CIDEr empeora en 543 de las 1.298 imagenes donde cambia la seleccion.
- Solo ingles: no se documenta soporte multilingue.
- Licencia no declarada: no se puede confirmar el uso comercial; conviene verificar antes de integrarlo en produccion. El modelo base es `bert-base-uncased`, cuya licencia tampoco se detalla en la informacion disponible.
- Riesgo de alucinacion: el modelo no genera texto, pero puede seleccionar una candidata incorrecta si las etiquetas de contexto son pobres o si el captioner produce candidatas poco relacionadas.
- Modelo con muy poca adopcion (2 descargas, 0 likes en el momento de la consulta) y sin pipeline declarado en Hugging Face, lo que limita la validacion independiente.
- Depende de codigo personalizado (`custom-code`) para la inferencia, lo que implica revisar el codigo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhmedSSabir/BERT-CNN-Reward-Caption-Reranker
- Paper de referencia (Visual Semantic Relatedness Dataset for Image Captioning): https://arxiv.org/abs/2301.08784
- Dataset de entrenamiento: https://huggingface.co/datasets/AhmedSSabir/Textual-Image-Caption-Dataset
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Captioner usado en el entrenamiento: https://huggingface.co/Salesforce/blip-image-captioning-base
- Captioner de la evaluacion: https://huggingface.co/google/gemma-4-12B-it
