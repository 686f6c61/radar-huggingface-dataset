# Katyaaaaaaaaaaaaaaaaaaa/bioptic-b1-mlm

## Resumen

BIOPTIC B1 MLM es un encoder de tipo RoBERTa de 8,7 millones de parametros, publicado en Hugging Face por el usuario Katyaaaaaaaaaaaaaaaaaaa, preentrenado con masked language modeling sobre 10 millones de cadenas SMILES. Se trata de una reimplementacion independiente de la etapa de preentrenamiento descrita en Vinogradov et al., *J. Chem. Inf. Model.* 2025, 65, 9927-9936, no de los pesos originales de los autores, que nunca se publicaron.

El modelo resuelve un problema concreto de la quimioinformatica: disponer de un encoder de representaciones moleculares reentrenable y con licencia permisiva (MIT) que sirva como punto de partida para tareas de prediccion de propiedades moleculares, bioactividad y cribado virtual. Su arquitectura sigue exactamente la especificacion del articulo: vocabulario de 500 tokens, 6 capas, dimension oculta 384, 8 cabezas de atencion e intermedia de 1024, con un tokenizador BPE a nivel de byte entrenado sobre el mismo corpus.

Es relevante ahora porque el modelo de referencia no libero pesos, y porque el corpus original (160 millones de moleculas, incluyendo 48 millones de Enamine REAL Space de febrero de 2024) ya no se distribuye. Esta version entrena con 16 veces menos datos, sobre una version distinta de Enamine REAL (2026.01) y con hiperparametros elegidos por el propio autor, por lo que las diferencias frente a los numeros del articulo no pueden atribuirse a una sola causa. El propio autor advierte que el modelo no es util por si solo, sino como base para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder estilo RoBERTa (masked language modeling) |
| Parametros totales | 8.725.748 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el modelo es lo bastante pequeno para cuantizar a int8 sin perdida apreciable) |
| Idiomas soportados | no disponible; el modelo opera sobre cadenas SMILES, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors |

Detalles de configuracion declarados en la model card: vocabulario de 500 tokens, 6 capas, hidden size 384, 8 cabezas de atencion, intermediate size 1024, tokenizador byte-level BPE entrenado sobre el mismo corpus.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa, replicado segun la especificacion del articulo de referencia. El vocabulario de 500 tokens con BPE a nivel de byte es inusualmente pequeno para este tipo de tokenizador (lo habitual en RoBERTa es 50.000), lo que implica que las cadenas SMILES se fragmentan en unidades cercanas al caracter. El modelo incluye una cabeza MLM, que es la que se usa durante el preentrenamiento y la que predice tokens enmascarados, no propiedades moleculares.

Los datos de entrenamiento son 10 millones de cadenas SMILES: 7 millones procedentes de PubChem y 3 millones de muestras de Enamine REAL Database (version 2026.01), en la proporcion 70/30 empleada por el articulo original. El corpus del articulo era de 160 millones de moleculas (115 millones de PubChem mas 48 millones de Enamine REAL Space de febrero de 2024), un subconjunto que ya no se distribuye. Al no especificar el articulo los hiperparametros de preentrenamiento, el autor los fijo por su cuenta: AdamW, learning rate 5e-4, warmup de 1000 pasos, weight decay 0.01, batch efectivo de 512 y precision fp16. El entrenamiento duro 34.000 pasos (aproximadamente 1,74 epocas) sobre 2 x T4. La perdida MLM bajo de aproximadamente 6.2 (equivalente a un guessing aleatorio sobre un vocabulario de 500 tokens) hasta 0.653, valor en el que se estabilizo. El historial completo de perdida esta en el archivo `log_history.json` del repositorio.

## Capacidades

- Generacion de representaciones contextuales de cadenas SMILES, no de texto en lenguaje natural.
- Prediccion de tokens enmascarados (MLM): dada una molecula con una posicion enmascarada, estima la distribucion sobre el vocabulario de 500 tokens.
- Extraccion de embeddings de moleculas para tareas posteriores (similitud, clustering, regresion, clasificacion) mediante fine-tuning.
- Fine-tuning supervisado con cabezas de clasificacion o regresion sobre datos de bioactividad y propiedades moleculares.
- Puntuacion de verosimilitud de secuencias SMILES, utilizable como filtro de plausibilidad quimica.
- No dispone de soporte de tool calling ni de function calling.
- No esta disenado para razonamiento multi-paso, uso agentico ni generacion de texto libre.
- No dispone de capacidades multimodales (vision, audio), ni de modo "thinking".
- Capacidades multilingues: no aplica.

## Casos de uso

- Prediccion de propiedades fisicoquimicas (logP, solubilidad acuosa, pKa): se anade una cabeza de regresion sobre el embedding del token [CLS] y se ajusta con datasets tipo MoleculeNet; el encoder aporta representaciones preentrenadas en dominio quimico en lugar de partir de cero.
- Modelos QSAR de bioactividad: fine-tuning sobre datos de ensayos propietarios para clasificar compuestos activos o inactivos frente a una diana, aprovechando que el preentrenamiento ya ha visto 10 millones de SMILES de PubChem y Enamine.
- Cribado virtual y priorizacion de librerias: se calculan embeddings de una libreria de compuestos (por ejemplo, una coleccion Enamine) y se ordenan por similitud frente a un compuesto de referencia en espacio latente, como paso previo a la seleccion de candidatos para ensayo.
- Analisis de clusters quimicos y busqueda de diversidad: los embeddings permiten agrupar quimiotecas por familias estructurales y detectar redundancia antes de comprar o sintetizar compuestos.
- ADMET temprano: fine-tuning multipropiedad (absorcion, toxicidad, metabolismo) para descartar candidatos de forma barata antes de fases experimentales.
- Filtrado de calidad de datos en pipelines quimioinformaticos: puntuar cada SMILES de un dataset con el score MLM para identificar entradas mal formadas, truncadas o improbables.
- Preentrenamiento continuado en un dominio restringido: reanudar el MLM sobre una coleccion propia (por ejemplo, moleculas de una patente o de una libreria interna) para adaptar el encoder antes del fine-tuning supervisado.
- Despliegue on-premise de bajo coste: con 8,7 millones de parametros, el modelo se ejecuta en CPU, lo que permite incorporarlo a entornos con restricciones de hardware o de confidencialidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de preentrenamiento:

| Metrica | Valor |
|---|---|
| Perdida MLM inicial (referencia de guessing aleatorio sobre 500 tokens) | ~6,2 |
| Perdida MLM final | 0,653 (estabilizada) |
| Pasos de entrenamiento | 34.000 (~1,74 epocas) |
| Hardware de entrenamiento | 2 x NVIDIA T4, fp16 |

No hay resultados comparables de MMLU, HumanEval, GSM8K ni de benchmarks quimicos (MoleculeNet, MoleculeNet-ADMET) en la informacion proporcionada. El autor indica explicitamente que cualquier diferencia frente a las cifras del articulo original puede deberse a varias causas que no pueden separarse.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 17 MB en fp16 y unos 35 MB en fp32 para los pesos; con activaciones y overhead de runtime, el consumo real es de unos pocos cientos de MB, dominado por el framework.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y posteriores; tambien se ejecuta en CPU sin problema.
- GPU recomendadas para entrenamiento o fine-tuning a escala: el autor uso 2 x T4; cualquier GPU con 8 GB o mas es suficiente. A100 y H100 solo aportan ventaja por throughput, no por memoria.
- Opciones de despliegue: Hugging Face Transformers con PyTorch es la via directa; exportacion a ONNX Runtime o TensorRT para inferencia por lotes; servidores de embeddings compatibles con arquitecturas BERT/RoBERTa (por ejemplo, Text Embeddings Inference) segun el soporte general del ecosistema, no confirmado en la informacion disponible para este checkpoint concreto. vLLM y llama.cpp no estan confirmados para este modelo en la informacion disponible.
- Latencia y throughput estimados: no disponible. El entrenamiento original se hizo en 2 x T4, lo que sugiere que el cuello de botella fue el throughput de datos y no la capacidad de computo.

## Comparativa con modelos similares

Los datos de las alternativas proceden de conocimiento publico general y no se han podido verificar con la informacion proporcionada; deben tomarse como orientativos.

| Modelo | Parametros | Contexto | Datos de preentrenamiento | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| BIOPTIC B1 MLM (esta reimplementacion) | 8,7 M | no disponible | 10 M SMILES (PubChem + Enamine REAL 2026.01) | MIT | Publicos en Hugging Face |
| BIOPTIC B1 original (Vinogradov et al., 2025) | no disponible | no disponible | 160 M moleculas (PubChem + Enamine REAL feb. 2024) | no disponible | Nunca liberados |
| MolFormer-XL (IBM) | aprox. 46 M (orientativo) | no disponible | aprox. 1.100 M moleculas (PubChem y ZINC) | Apache 2.0 (orientativo) | Publicos |
| ChemBERTa-2 | aprox. 77 M (orientativo) | no disponible | 77 M SMILES (PubChem) | MIT (orientativo) | Publicos |

La diferencia principal frente a las alternativas es el tamano: 8,7 millones de parametros situan a este checkpoint muy por debajo de MolFormer y ChemBERTa-2, lo que reduce coste de inferencia pero tambien capacidad de representacion. La ventaja es la licencia MIT y la posibilidad de reproducir el pipeline de preentrenamiento por completo.

## Limitaciones y advertencias

- El modelo no es util por si solo: la cabeza MLM predice tokens enmascarados, no propiedades moleculares. Requiere fine-tuning para cualquier tarea real.
- Se ha entrenado con 16 veces menos datos que el modelo descrito en el articulo original (10 M frente a 160 M moleculas).
- La version de Enamine REAL utilizada (2026.01) no coincide con la del articulo (febrero de 2024), por lo que la distribucion quimica del corpus difiere.
- Los hiperparametros de preentrenamiento los eligio el autor, ya que el articulo no los especifica; no hay garantia de que sean los optimos ni de que reproduzcan el comportamiento del original.
- Cualquier diferencia de rendimiento frente a las cifras del articulo tiene varias causas posibles que el propio autor declara no poder separar.
- Riesgo de alucinacion en sentido quimico: al ser un modelo MLM puede asignar probabilidad alta a secuencias SMILES sintacticamente validas pero quimicamente absurdas o inestables.
- Sesgos de dominio: el corpus PubChem y Enamine REAL sobrerrepresenta moleculas sintetizables y de interes farmaceutico; el rendimiento en quimica inorganica, polimeros, metalorganicos o moleculas muy grandes sera peor.
- Longitud de contexto no documentada: no se especifica el maximo de tokens por secuencia, lo que puede provocar truncamientos silenciosos en moleculas grandes.
- Licencia MIT, que permite uso comercial y modificacion, pero al derivar de una reimplementacion de un articulo cientifico conviene revisar la atribucion academica correspondiente.
- Adopcion practica nula hasta la fecha: 0 descargas y 1 like en Hugging Face, con el repositorio creado y actualizado el 17 de septiembre de 2026. No hay senal de validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun documento relacionado con el modelo: todos los resultados corresponden a Align Technology, empresa de ortodoncia, y son irrelevantes para esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Katyaaaaaaaaaaaaaaaaaaa/bioptic-b1-mlm
- Articulo de referencia: Vinogradov et al., *J. Chem. Inf. Model.* 2025, 65, 9927-9936
- DOI del articulo: https://doi.org/10.1021/acs.jcim.5c00743
- Historial de entrenamiento: `log_history.json` en el repositorio de Hugging Face
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a Align Technology (ortodoncia) y no guardan relacion con el modelo
