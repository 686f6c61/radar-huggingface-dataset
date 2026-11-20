# hcy-ai/prism-v3-exp

## Resumen

Prism-v3-exp es un modelo de lenguaje pequeno (33,35 millones de parametros) entrenado desde cero por el autor independiente hcy-ai para una tarea concreta: clasificar texto en chino en una de 31 categorias industriales. No es un modelo generativo de proposito general, sino un clasificador de dominio construido sobre una arquitectura decoder-only de 8 capas que combina un objetivo de prediccion del siguiente caracter con una cabeza de clasificacion de dominio. La salida no es una etiqueta unica, sino una distribucion de probabilidad de 31 dimensiones sobre los sectores industriales.

El modelo se entrena sobre BAAI/IndustryCorpus2 (356 millones de caracteres en chino) durante 129.600 pasos en una unica GPU consumer (2080 SUPER, aproximadamente 6 horas), con implementacion manual en PyTorch sin dependencias de `transformers` ni `datasets`. Se distribuye en formato PyTorch (fp16) y ONNX (int8 y fp32), lo que permite inferencia sin PyTorch en entornos muy limitados (2 nucleos de CPU y 2 GB de RAM).

Su relevancia es acotada y experimental: el propio autor lo etiqueta como "experimental preview" y advierte que no es una herramienta de etiquetado lista para produccion. Resulta interesante como caso de estudio de entrenamiento desde cero a muy bajo coste y como ejemplo de destilacion de una tarea de clasificacion en un modelo de lenguaje diminuto, pero sus limitaciones (mal rendimiento en textos cortos, ausencia de clase "incierta" funcional, fuerte caida fuera de distribucion) lo alejan de un uso industrial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 8 capas, d=512, 8 cabezas, FFN 2048, RoPE, vocabulario a nivel de caracter de 15.341 tokens |
| Parametros totales | 33.353.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres (entrada fija de entrenamiento) |
| Tipos de cuantizacion | fp16 (pesos PyTorch), int8 dinamica (ONNX), fp32 (ONNX) |
| Idiomas soportados | chino (zh) unicamente |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento Apache-2.0; codigo MIT |
| Formato de pesos | `.pt` (PyTorch, fp16), `.onnx` (int8 y fp32), `model_meta.json` (vocabulario, clases, max_len) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con dimension oculta 512, 8 cabezas de atencion, FFN de 2048 y embeddings posicionales rotatorios (RoPE). El vocabulario es a nivel de caracter con 15.341 entradas. La innovacion estructural es la doble salida: el modelo mantiene una cabeza de prediccion del siguiente token (objetivo de lenguaje) y una cabeza de clasificacion de dominio que produce 31 logits. En inferencia de clasificacion se anula el peso del objetivo de lenguaje (`lm_weight=0.0`) y se usa unicamente la salida de dominio.

El entrenamiento parte de inicializacion aleatoria y usa BAAI/IndustryCorpus2 (356 millones de caracteres en chino) durante 129.600 pasos en una unica RTX 2080 SUPER, en aproximadamente 6 horas. No se menciona uso de RLHF ni DPO. El etiquetado de dominio se entrena con label smoothing hacia una distribucion "clase verdadera 0,95 + resto repartido", lo que produce salidas con forma de distribucion suavizada que no reflejan proporciones reales de coexistencia entre dominios. El pipeline incluye normalizacion de puntuacion de ancho completo a medio ancho y repeticion del texto hasta completar 512 caracteres, dos pasos obligatorios para obtener el rendimiento reportado.

## Capacidades

- Clasificacion de texto chino en 31 categorias industriales, devolviendo una distribucion de probabilidad completa en lugar de una etiqueta unica.
- Prediccion del siguiente caracter como objetivo auxiliar de entrenamiento (no pensada como capacidad generativa de uso practico).
- Inferencia sin PyTorch mediante ONNX Runtime, con variante int8 de 40 MB ejecutable en CPU de 2 nucleos y 2 GB de RAM.
- Procesamiento de entradas de hasta 512 caracteres, con requisito de relleno por repeticion para textos mas cortos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Monolingue: solo chino, sin cobertura de ingles ni otras lenguas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prototipado rapido de clasificacion sectorial en chino: util como linea base barata para validar un pipeline de etiquetado de documentos antes de invertir en un modelo mayor, dado su tamano de 33 M de parametros y su ejecucion en CPU.
- Enrutamiento de documentos largos en sistemas de gestion documental: para textos de 512 caracteres o mas (informes, articulos, descripciones de empresa) puede asignar un sector probable y alimentar un enrutador posterior, con la advertencia de que la salida requiere calibracion de temperatura.
- Filtrado previo en corpus de entrenamiento: clasificar grandes volumenes de texto chino por dominio industrial para construir subconjuntos tematicos, usando la version ONNX int8 por su bajo coste computacional.
- Educacion y experimentacion: ejemplo reproducible de entrenamiento desde cero de un modelo de lenguaje con doble cabeza en hardware consumer, util en cursos y talleres sobre fundamentos de transformers.
- Investigacion sobre destilacion de tareas: base para estudiar como un modelo de 33 M absorbe una tarea de clasificacion de 31 clases y donde aparecen los limites de separabilidad entre categorias solapadas.
- Despliegue en entornos con restricciones extremas: escenarios de borde o sistemas embebidos con CPU limitada donde un modelo de 40 MB en int8 es la unica opcion viable, aceptando la perdida de precision en textos cortos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recall balanceado por clase (20 textos por clase, 600 textos) | 85,2% |
| Precision en distribucion natural (2.000 textos) | 88,45% |
| Entrada de 512 caracteres | 82-88% |
| Entrada de 300 caracteres | 72,2% |
| Entrada de 150 caracteres | 56,7% |
| Entrada de 80 caracteres | 51,1% |
| Entrada de 30 caracteres | 44,4% |
| Concordancia int8 vs fp32 (300 textos) | 99,7% |
| Rendimiento por clase (extremos) | 100% en aeroespacial y programacion; 50% en informatica y telecomunicaciones; 60% en otros manufactura, ciencia e investigacion y petroquimica; 65% en energia electrica |
| Rendimiento fuera de distribucion (150 textos de otro modelo) | 64% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: no es un modelo generativo de proposito general sino un clasificador de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (pesos de 79 MB); la variante ONNX int8 requiere 40 MB y la fp32 136 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el entrenamiento se realizo en una RTX 2080 SUPER.
- Cabe en cualquier GPU consumer moderna e incluso en CPU: la version ONNX int8 se ejecuta en 2 nucleos y 2 GB de RAM.
- Opciones de despliegue: ONNX Runtime (recomendado para produccion ligera), PyTorch nativo. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de tarea (clasificacion, no generacion) no son opciones naturales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism-v3-exp | 33,35 M | 512 caracteres | Clasificacion de dominio en chino (31 clases) | Apache-2.0 | Hugging Face, ONNX incluido |
| Modelos de clasificacion basados en BERT chino (p. ej. bert-base-chinese) | ~102 M | 512 tokens | Clasificacion de texto generica | Apache-2.0 / MIT segun variante | Hugging Face |
| Clasificadores ligeros tipo FastText en chino | variable (orden de millones) | variable | Clasificacion de texto | MIT | Libreria FastText |

La comparacion directa con modelos de clasificacion estandar no esta disponible con datos de rendimiento en la informacion proporcionada. Prism-v3-exp se distingue por su tamano muy reducido, su doble cabeza y su empaquetado ONNX listo para CPU, pero no hay cifras que permitan situarlo frente a alternativas en la misma tarea.

## Limitaciones y advertencias

- Rendimiento insuficiente en textos cortos: 44,4% con 30 caracteres; el relleno por repeticion lo eleva a 62,5%, aun lejos de los textos largos.
- No existe una clase "incierta" funcional: la categoria 31 ("otros") no tiene muestras de entrenamiento, por lo que el modelo siempre elige una clase real, a menudo con alta confianza, incluso en textos ambiguos (ejemplo documentado: una prosa sobre "un dia en la ciudad" clasificada como hosteleria y restauracion con 95,4%).
- Solapamiento entre categorias como limite estructural: las representaciones de clases como informatica y telecomunicaciones, otros manufactura, ciencia e investigacion o petroquimica no se separan bien.
- Las salidas no son etiquetas suaves reales: la forma de la distribucion viene impuesta por el label smoothing, no refleja proporciones reales de coexistencia entre dominios; requiere calibracion de temperatura antes de usarse como peso.
- Fuerte caida fuera de distribucion: del 85% en corpus del mismo tipo al 64% en 150 textos generados por otro modelo.
- Solo entrena en chino, sin cobertura de otras lenguas.
- Requiere normalizacion de puntuacion de ancho completo a medio ancho: sin ella, cada coma o punto chino se convierte en `<unk>` y la confianza baja entre 0,03 y 0,06.
- Estado experimental: el propio autor lo describe como una vista previa experimental y no como una herramienta de etiquetado lista para usar.
- Licencia Apache-2.0 en los pesos, heredada de los terminos del dataset de entrenamiento; el autor declara no tener afiliacion con los publicadores de IndustryCorpus2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hcy-ai/prism-v3-exp
- Dataset de entrenamiento: https://huggingface.co/datasets/BAAI/IndustryCorpus2
- Repositorio de codigo (referenciado en la model card, MIT): no disponible como URL directa en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
