# latincy/latin-bert

## Resumen

Latin BERT es un modelo de lenguaje contextual especializado en latin clasico, desarrollado originalmente por David Bamman y Patrick J. Burns (2020) y empaquetado para Hugging Face por el proyecto latincy. Se trata de un BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) con aproximadamente 111 millones de parametros, entrenado sobre un corpus de textos latinos. Resuelve el problema de la falta de representaciones contextuales de calidad para una lengua historica con escasez de datos anotados, habilitando tareas de filologia clasica como el etiquetado morfosintactico, la desambiguacion de sentidos y la prediccion de palabras enmascaradas.

El modelo es relevante para investigadores en humanidades digitales y procesamiento de lenguaje natural historico porque reproduce con fidelidad los resultados del paper original a traves del pipeline nativo de `transformers`, sin necesidad de codigo personalizado. Su tokenizador replica el `SubwordTextEncoder` original de tensor2tensor mediante un `tokenizer.json` puro, lo que permite su uso en entornos Rust, JavaScript, ONNX o Text Embeddings Inference.

Con una ventana de contexto de 512 tokens y licencia MIT, Latin BERT esta pensado para extraccion de caracteristicas y fill-mask, no como modelo generativo. Su utilidad principal es producir embeddings contextuales de 768 dimensiones para texto latino y servir de base para tareas downstream de anotacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 111.935.110 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | latin (la) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

Latin BERT sigue la arquitectura BERT-base estandar: un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion, con un vocabulario de 32.900 subtokens generado mediante `SubwordTextEncoder` (no WordPiece). El modelo se entrena con objetivos de masked language modeling sobre un corpus de textos latinos; la model card remite al paper original para el detalle de la composicion del dataset y el numero exacto de tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo encoder de 2020.

La innovacion tecnica destacable del empaquetado es el tokenizador: se sustituye el `SubwordTextEncoder` de tensor2tensor por un `tokenizer.json` compuesto unicamente de componentes nativos de la libreria `tokenizers`, que reproduce los mismos IDs sin requerir `trust_remote_code`. Se documentan dos divergencias marginales no alcanzables con texto real: los caracteres fuera del alfabeto de 2.187 simbolos se mapean a `[UNK]` en lugar de escapes ordinales, y el caracter de control U+0001 se elimina de la entrada. Las versiones con `trust_remote_code=True` siguen funcionando y producen IDs identicos.

## Capacidades

- Extraccion de caracteristicas contextuales: genera embeddings de 768 dimensiones por token (`last_hidden_state`).
- Masked language modeling (fill-mask): predice el subtoken enmascarado en una secuencia latina.
- Etiquetado morfosintactico (POS tagging) como tarea downstream, con resultados reportados en tres treebanks.
- Desambiguacion de sentidos (word sense disambiguation) mediante representaciones contextuales.
- Recuperacion de vecinos mas cercanos contextuales: distingue usos de una misma palabra segun el contexto.
- Integracion con spaCy via `spacy-transformers` como componente de pipeline.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo ni multimodal.
- Capacidad multilingue limitada al latin; el alfabeto cubre latin, griego, cirilico, digitos y puntuacion, pero el entrenamiento es monolingue.

## Casos de uso

- Anotacion morfosintactica de corpus latinos: el modelo alcanza entre 95,2 % y 99,2 % de exactitud en POS tagging sobre Perseus, PROIEL e ITTB, por lo que puede usarse como etiquetador automatico para preanotar corpus clasicos antes de la revision humana.
- Desambiguacion de sentidos en edicion digital: con una exactitud de 0,764 en WSD, permite agrupar ocurrencias de una palabra segun su sentido para construir indices lexicos o concordancias semanticas.
- Completado de lagunas en textos fragmentarios: el pipeline fill-mask predice palabras faltantes en inscripciones o manuscritos danados, con P@1 del 33,1 % y P@10 del 62,2 % como referencia de acierto.
- Busqueda semantica en bibliotecas digitales: los embeddings contextuales permiten recuperar pasajes por similitud de uso linguistico y no solo por coincidencia lexica, util para corpus como Perseus o PHI.
- Lematizacion y analisis asistido en investigacion filologica: integrado en spaCy mediante `spacy-transformers`, sirve como capa de representacion para entrenar taggers y parsers especificos sobre anotaciones existentes.
- Deteccion de variantes ortograficas y morfologicas: los vecinos contextuales recuperan formas como *audentis*, *audaces* y *audentem* a partir de *audentes*, lo que facilita la normalizacion ortografica en ediciones criticas.
- Preentrenamiento de modelos downstream para latin: al ser un encoder BERT-base con licencia MIT, puede usarse como inicializacion para tareas de clasificacion, NER o parsing en dominios con pocos datos anotados.

## Benchmarks y rendimiento

Resultados reportados en la model card, reproducidos mediante el pipeline nativo de Hugging Face y coincidentes con Bamman & Burns (2020):

| Tarea | Conjunto / metrica | Resultado |
|---|---|---|
| POS tagging | Perseus (accuracy) | 95,2 % |
| POS tagging | PROIEL (accuracy) | 98,2 % |
| POS tagging | ITTB (accuracy) | 99,2 % |
| Prediccion de palabra enmascarada | P@1 | 33,1 % |
| Prediccion de palabra enmascarada | P@10 | 62,2 % |
| Prediccion de palabra enmascarada | P@50 | 74,0 % |
| Desambiguacion de sentidos | Accuracy | 0,764 |
| Vecinos contextuales | *in* (Caes. *BG* 1.1), coseno top | 0,835 |
| Vecinos contextuales | *audentes* (Verg. *Aen.* 10.284), coseno top | 0,919 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 450 MB para los pesos (111,9 M de parametros), mas memoria de activaciones segun longitud de secuencia.
- En fp16: aproximadamente 225 MB de pesos; en int8: en torno a 112 MB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, asi como en CPU para inferencia por lotes pequenos.
- GPU recomendadas para alto throughput: A100, H100, L4 o A10G para servir embeddings a gran escala.
- Despliegue posible con `transformers` (PyTorch), Text Embeddings Inference (TEI) gracias al `tokenizer.json` nativo, ONNX Runtime, y via `spacy-transformers` dentro de pipelines de spaCy.
- No se dispone de datos de latencia o throughput medidos en la informacion proporcionada; por tamano, es un modelo de baja latencia incluso en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Latin BERT (latincy) | 111,9 M | 512 | BERT-base encoder, fill-mask | MIT | Hugging Face |
| BERT-base multilingue | ~178 M | 512 | BERT-base encoder, 104 idiomas | Apache 2.0 | Hugging Face |
| LatinCy / modelos spaCy para latin | no disponible | no disponible | Pipelines spaCy sobre latin | MIT | GitHub / Hugging Face |

No se dispone en la informacion proporcionada de resultados comparativos de rendimiento frente a estos modelos. La ventaja especifica de Latin BERT es su entrenamiento monolingue en latin y la reproduccion exacta del tokenizador original, mientras que un BERT multilingue cubriria latin con menor especializacion y mayor tamano.

## Limitaciones y advertencias

- Modelo encoder no generativo: no produce texto libre ni soporta razonamiento multi-paso, tool calling ni agentes.
- Ventana de contexto limitada a 512 tokens, insuficiente para documentos completos o pasajes largos sin truncado.
- Entrenado exclusivamente en latin; no debe esperarse calidad en otras lenguas, incluido el latin medieval o tardio si difiere del corpus original.
- Riesgo de alucinacion en fill-mask: las predicciones son distribuciones de probabilidad sobre subtokens y pueden ser linguisticamente plausibles pero historicamente incorrectas; requiere validacion filologica.
- Sesgos derivados del corpus de entrenamiento: la composicion del dataset (autores, generos, periodos) puede infrarepresentar registros como latin tardio, epigrafia o latin vulgar.
- Tokenizador con divergencias documentadas en caracteres fuera del alfabeto de 2.187 simbolos (mapeo a `[UNK]`) y en el caracter U+0001.
- Licencia MIT permite uso comercial, pero el empaquetado se declara experimental; conviene fijar una `revision` concreta para reproducibilidad.
- No se documentan en la informacion disponible datos de sesgo medidos ni evaluaciones de robustez fuera de los treebanks citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latincy/latin-bert
- Paper original: https://arxiv.org/abs/2009.10053
- Repositorio original (Bamman): https://github.com/dbamman/latin-bert
- Discusiones del repositorio: https://huggingface.co/latincy/latin-bert/discussions
- Hilo sobre tokenizers 0.23: https://huggingface.co/latincy/latin-bert/discussions/4
- spaCy transformers: https://github.com/explosion/spacy-transformers
