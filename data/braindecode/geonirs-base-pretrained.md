# braindecode/geonirs-base-pretrained

## Resumen

GeoNIRS-Base es el codificador preentrenado del modelo fundacional de fNIRS (espectroscopia funcional de infrarrojo cercano) presentado por Li et al. (2026) en el articulo "GeoNIRS: Geometry-Aware Pretraining for Heterogeneous fNIRS Representation Learning". Lo publica el equipo de braindecode como pesos listos para usar con la clase `braindecode.models.GeoNIRS`, y resuelve el problema de la heterogeneidad en senales de neuroimagen optica: los montajes de fNIRS varian en numero y posicion de fuentes y detectores, lo que dificulta el aprendizaje de representaciones transferibles entre estudios.

El modelo incorpora informacion geometrica del montaje (posiciones de fuente y detector) mediante embeddings de posicion, lo que le permite procesar configuraciones de canales distintas sin reentrenar desde cero. Esta preentrenado sobre 8 conjuntos de datos que suman 383,30 horas de registro, y se distribuye como codificador congelable para linear probing o fine-tuning en tareas downstream de clasificacion.

Con 4.443.456 parametros, es un modelo compacto pensado para investigacion en neurociencia, no para generacion de texto. Su relevancia actual radica en que es una de las primeras propuestas de modelo fundacional especifico para fNIRS con evaluacion reproducible en tareas como deteccion de accion y estimacion de intensidad de dolor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings de posicion geometricos (geometry-aware), encoder de fNIRS |
| Parametros totales | 4.443.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de hasta 150 muestras (30 s a 5 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (repositorio fuente sin fichero de licencia; pesos de los autores de GeoNIRS) |
| Formato de pesos | safetensors (via `save_pretrained`), PyTorch |

## Arquitectura y entrenamiento

GeoNIRS es un transformer disenado para senales de fNIRS, con un mecanismo de atencion que incorpora la geometria del montaje: cada par HbO/HbR recibe las posiciones del optodo fuente y del detector (almacenadas por MNE en `loc[3:9]`), de modo que el modelo distingue canales por su ubicacion fisica en el cuero cabelludo y no solo por su indice. La entrada son concentraciones de HbO y HbR en µmol/L remuestreadas a 5 Hz, con z-scoring por registro sobre todos los canales y muestras validas, en ventanas de como maximo 150 muestras (30 s), que corresponden a las 15 filas del embedding de posicion temporal. Las muestras ausentes se marcan con NaN.

El preentrenamiento se realizo sobre 8 conjuntos de datos que totalizan 383,30 horas. El pipeline original incluye dos decodificadores auxiliares (`hbo_to_hbr_decoder` y `hbr_to_hbo_decoder`), que se eliminan en esta release: solo se publica el codificador. La conversion desde el checkpoint original (`checkpoint/geonirs_base.pt`, commit `81f8995`) no altera ningun valor, y el codificador reproduce las features del fichero original bit a bit en CPU en float32. La cabeza de clasificacion (`final_layer`) no forma parte del release porque su dimension depende de `n_times` y `n_outputs`; `from_pretrained` la construye segun esos parametros.

## Capacidades

- Extraccion de representaciones (features) de senales de fNIRS para tareas downstream.
- Clasificacion de series temporales de neuroimagen optica mediante linear probing o fine-tuning.
- Procesamiento de montajes heterogeneos gracias a la codificacion de la geometria de fuentes y detectores.
- Manejo de ventanas de hasta 150 muestras (30 s a 5 Hz) con soporte para muestras ausentes (NaN).
- Transferencia entre estudios y conjuntos de datos con distintas configuraciones de canales.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Deteccion de accion motora: el codificador congelado se usa como extractor de features y una regresion logistica sobre ellas clasifica el modo de accion, como en la evaluacion sobre DS42 (macro-F1 en torno a 0,70).
- Estimacion de intensidad de dolor: linear probe sobre el encoder para predecir niveles de dolor a partir de senales de fNIRS, tarea evaluada sobre DS19.
- Investigacion en interfaces cerebro-computador (BCI) basadas en fNIRS: el modelo sirve como backbone preentrenado para clasificar estados cognitivos o intenciones motoras con pocos datos etiquetados.
- Transferencia entre laboratorios: al codificar la geometria del montaje, permite reutilizar un modelo entrenado en un estudio con un montaje distinto en otro estudio con otro numero de canales.
- Analisis de neuroimagen en poblaciones clinicas: extraccion de representaciones para estudiar patrones hemodinamicos en sujetos con patologias, usando fine-tuning con conjuntos pequenos.
- Benchmarking reproducible: sirve como baseline fundacional en comparaciones de metodos de decodificacion de fNIRS dentro del ecosistema braindecode.

## Benchmarks y rendimiento

Evaluacion mediante linear probe del codificador congelado, con los folds y semillas del articulo. "Pipeline de los autores" es GeoNIRS@81f8995 ejecutado de extremo a extremo; "braindecode" es la clase `GeoNIRS` con una reimplementacion del probe de los autores. Ambos construyen las mismas ventanas (1628 y 1190).

| Tarea | Metrica | Paper | Pipeline de los autores | braindecode |
|---|---|---|---|---|
| DS42 | macro-F1 | 0,7018 | 0,7000 | 0,7039 |
| DS42 | AUROC | 0,7840 | 0,7840 | 0,7840 |
| DS19 | macro-F1 | 0,5598 | 0,5599 | 0,5304 |
| DS19 | AUROC | 0,5683 | 0,5687 | 0,5549 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamano del modelo (4,44 M de parametros); el cuello de botella es el tamano de lote y la longitud de las ventanas, no el modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de gama media bastan.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU con latencia aceptable para lotes pequenos.
- Opciones de despliegue: libreria `braindecode` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoNIRS-Base | 4,44 M | 150 muestras (30 s) | fNIRS (clasificacion, extraccion de features) | other | Hugging Face (braindecode) |
| Alternativas de modelo fundacional para fNIRS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos fundacionales de fNIRS comparables (parametros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- La licencia es "other" y el repositorio fuente no incluye fichero de licencia; es necesario contactar con los autores de GeoNIRS para aclarar las condiciones de uso comercial.
- El release solo contiene el codificador: la cabeza de clasificacion debe construirse y entrenarse (fine-tuning o linear probe) antes de usar el modelo en produccion.
- El rendimiento en DS19 es bajo (AUROC 0,5549-0,5687), apenas por encima del azar; no debe asumirse una buena transferencia a tareas de estimacion de intensidad de dolor.
- La ventana de entrada esta limitada a 150 muestras (30 s a 5 Hz); no es adecuado para analisis de registros largos sin segmentacion previa.
- Requiere que `chs_info` incluya las posiciones de fuente y detector (`loc[3:9]`); sin esa informacion geometrica el modelo pierde parte de su ventaja.
- Riesgo de sobreajuste en conjuntos pequenos si se hace fine-tuning completo con pocos datos.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No se han documentado sesgos especificos ni tasas de alucinacion (no aplica al no generar texto), pero al ser un modelo de neuroimagen puede heredar sesgos de los 8 conjuntos de preentrenamiento (poblaciones, montajes y protocolos concretos).

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/geonirs-base-pretrained
- Repositorio fuente GeoNIRS (commit 81f8995): https://github.com/GeoNIRS/GeoNIRS/tree/81f8995e5c3aa6b70e55812b194fc04e4e7ea5b7/checkpoint
- Documentacion de `braindecode.models.GeoNIRS`: https://braindecode.org/stable/generated/braindecode.models.GeoNIRS.html
- Paper: Li, Zongsheng et al., "GeoNIRS: Geometry-Aware Pretraining for Heterogeneous fNIRS Representation Learning", arXiv:2610.17845 (https://arxiv.org/abs/2610.17845)
- Conjunto DS42 (ds005935): https://openneuro.org/datasets/ds005935
- Conjunto DS19 (ds005777): https://openneuro.org/datasets/ds005777
