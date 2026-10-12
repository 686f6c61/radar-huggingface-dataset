# palashsharma048/fr-en-transformer-from-scratch

## Resumen

`palashsharma048/fr-en-transformer-from-scratch` es un modelo de traduccion automatica frances → ingles desarrollado por el usuario de HuggingFace palashsharma048. Se trata de un Transformer encoder-decoder pequeno (9.933.824 parametros) entrenado integramente desde cero, sin pesos preentrenados, sobre 902.783 pares de frases limpias del split de entrenamiento de `Helsinki-NLP/opus-100` (en-fr). Es, por tanto, un ejercicio de implementacion completa del pipeline: tokenizador SentencePiece, arquitectura, bucle de entrenamiento e inferencia propios.

Su relevancia no esta en competir con sistemas de traduccion de produccion, sino en servir como referencia reproducible y ligera: cabe en cualquier GPU de consumo, se ejecuta en CPU y su codigo de inferencia acompana al repositorio. Es util para docencia, experimentacion academica y como base de comparacion frente a modelos Marian o NLLB mucho mayores.

La arquitectura es un encoder-decoder clasico de 4+4 capas con d_model 256, 4 cabezas de atencion, FFN de 1024 y pre-LayerNorm, con embeddings compartidos entre encoder, decoder y capa de salida. El autor reporta un BLEU de 27,47 y un chrF de 45,08 en el conjunto de desarrollo del reto (150 frases), con una puntuacion global combinada de 37,17, y advierte explicitamente de que el modelo no es apto para usos donde los errores de traduccion tengan consecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (denso), 4 capas de encoder + 4 de decoder, d_model 256, 4 cabezas, FFN 1024, pre-LayerNorm, codificacion posicional sinusoidal |
| Parametros totales | 9.933.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no especifica longitud maxima de secuencia; en entrenamiento se usaron pasos de ~4.096 tokens y la inferencia admite particion de frases con `split_long=True`) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; el repositorio distribuye unicamente pesos en safetensors |
| Idiomas soportados | Frances (origen) e ingles (destino) |
| Licencia | MIT |
| Formato de pesos | safetensors, con script `inference.py` propio en el repositorio |
| Tokenizador | SentencePiece BPE, 10.000 piezas compartidas entre frances e ingles, con byte fallback |
| Direccion de traduccion | Unidireccional fr → en |
| Decodificacion | Beam search con beam 5 y alpha 1.0 |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder convencional de 4 capas en cada torre, con dimension de modelo 256, 4 cabezas de atencion y red feed-forward de 1024 unidades, normalizacion previa a cada subcapa (pre-LayerNorm) y codificaciones posicionales sinusoidales. Una sola matriz de embeddings se comparte entre el encoder, el decoder y la proyeccion de salida, lo que reduce el recuento de parametros y explica que con d_model 256 y vocabulario de 10.000 piezas el total se quede en 9,9 millones. El tokenizador es un SentencePiece BPE de 10.000 piezas entrenado conjuntamente para frances e ingles, con byte fallback para caracteres fuera del vocabulario.

El entrenamiento se realizo desde cero, sin inicializacion a partir de pesos preentrenados, sobre 902.783 pares de frases limpias del split de entrenamiento de `Helsinki-NLP/opus-100` (en-fr). Se aplicaron 30.000 pasos de optimizacion con aproximadamente 4.096 tokens por paso, lo que equivale a unos 123 millones de tokens vistos, una cifra muy reducida en comparacion con los corpus usados por modelos de traduccion de gran escala. El optimizador fue AdamW con programacion de learning rate inversa a la raiz cuadrada (pico 0,0008), label smoothing de 0,1 y dropout de 0,1. Los pesos publicados corresponden al ultimo checkpoint del entrenamiento. No se menciona en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias, ni innovaciones de eficiencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto unidireccional de frances a ingles, a nivel de frase.
- Procesamiento por lotes mediante la funcion `translate` del script `inference.py` incluido en el repositorio.
- Particion automatica de entradas largas en frases cuando se activa `split_long=True`.
- Decodificacion por haz configurable (por defecto beam 5, alpha 1.0).
- Manejo de caracteres fuera del vocabulario del tokenizador gracias al byte fallback de SentencePiece.
- Ejecucion en CPU y en GPU de gama baja por su tamano reducido (menos de 10 millones de parametros).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni modo de pensamiento explicito.
- No dispone de soporte de vision, audio ni modalidades adicionales.
- No es multilingue: solo cubre frances e ingles, y unicamente en la direccion fr → en.

## Casos de uso

- Traduccion de subtitulos y contenido audiovisual: el modelo esta entrenado sobre Opus-100, un corpus con fuerte presencia de subtitulos, por lo que se ajusta a frases cortas y coloquiales con puntuacion sencilla; encaja en pipelines de localizacion de bajo coste ejecutados en CPU.
- Preprocesado de corpus para NLP: convertir texto frances en ingles como paso previo a tareas de analisis de sentimiento, clasificacion de topicos o indexacion de documentos, donde el volumen es alto y la precision absoluta no es critica.
- Traduccion de documentacion tecnica interna y notas de producto: frases cortas, terminologia repetitiva y bajo riesgo, con revision humana posterior obligatoria dado el tamano del modelo.
- Prototipado y docencia: sirve como implementacion de referencia completa (tokenizador, arquitectura, entrenamiento e inferencia) para cursos de procesado de lenguaje natural y para experimentos reproducibles en un portatil.
- Despliegue en el borde o sin conexion: con menos de 10 millones de parametros, el modelo puede ejecutarse en dispositivos sin GPU, entornos air-gapped o aplicaciones moviles, donde no es viable servir un modelo de cientos de millones de parametros.
- Generacion de datos sinteticos y aumentacion de datos: producir pares fr-en adicionales para entrenar o evaluar otros componentes, siempre que se filtren despues las traducciones de baja calidad.
- Linea base de investigacion: punto de comparacion controlado para medir el efecto del escalado de datos, del preentrenamiento o de tecnicas de decodificacion en un presupuesto de calculo minimo.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de desarrollo del reto, con BLEU y chrF en minusculas calculados con el `score.py` oficial:

| Slice | n | BLEU | chrF |
|---|---|---|---|
| seen (visto) | 60 | 26,75 | 42,49 |
| long (frases largas) | 30 | 33,09 | 58,87 |
| unseen_domain (dominio no visto) | 60 | 18,06 | 40,77 |
| all (total) | 150 | 27,47 | 45,08 |

Puntuacion global del autor: 0,4 · BLEU + 0,4 · chrF + 0,2 · chrF_unseen = **37,17**.

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de traduccion de este tamano. Tampoco se proporcionan comparaciones directas con otros sistemas de traduccion en la misma tabla.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 40 MB de pesos mas activaciones; el consumo total se mantiene por debajo de 1 GB incluso con lotes moderados (estimacion derivada del recuento de parametros, no publicada por el autor).
- VRAM en fp16 o bf16: aproximadamente 20 MB de pesos.
- VRAM en int8: aproximadamente 10 MB de pesos, aunque no se distribuye ninguna version cuantizada oficial.
- GPU recomendadas: cualquier GPU, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas. Tambien es perfectamente viable en CPU.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en placas integradas y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: el autor indica el uso del script `inference.py` incluido en el propio repositorio. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni con las clases `AutoModel` estandar de transformers, dado que la arquitectura y el tokenizador son implementaciones propias desde cero. Requiere confiar en el codigo del repositorio o portar los pesos a un runtime propio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el numero de parametros y la decodificacion con haz de 5, cabe esperar latencias de decenas de milisegundos en GPU y de decimas de segundo a unos pocos segundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Los datos de los modelos comparados no forman parte de la informacion proporcionada en la busqueda; se indican unicamente valores de conocimiento publico ampliamente documentado y se marcan como no disponibles aquellos que no se pueden verificar aqui.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| palashsharma048/fr-en-transformer-from-scratch | 9,93 M | No disponible | MIT | HuggingFace, safetensors + script propio | Entrenado desde cero sobre 902.783 pares de Opus-100; unidireccional fr → en; BLEU 27,47 en el conjunto de desarrollo del autor |
| Helsinki-NLP/opus-mt-fr-en | Aproximadamente 77 M (Marian, 6+6 capas) | No disponible | CC-BY 4.0 | HuggingFace, compatible con transformers | Referencia habitual para fr → en; entrenado sobre corpus OPUS a mayor escala; calidad BLEU no disponible en esta informacion |
| facebook/m2m100_418M | 418 M | No disponible | MIT | HuggingFace, compatible con transformers | Multilingue (100 idiomas) con traduccion directa entre pares; mucho mayor y mas costoso de servir |
| facebook/nllb-200-distilled-600M | 600 M | No disponible | CC-BY-NC 4.0 | HuggingFace, compatible con transformers | Multilingue (200 idiomas); licencia no comercial, lo que limita su uso en produccion |

La diferencia principal frente a estas alternativas es el orden de magnitud: el modelo aqui descrito es entre 8 y 60 veces mas pequeno, lo que se traduce en menor calidad pero tambien en un despliegue trivial en cualquier hardware y en una licencia permisiva (MIT) que los modelos NLLB no ofrecen.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es pequeno y entrenado en un portatil: las traducciones suelen ser fluidas pero pierden significado en frases complejas.
- El autor declara explicitamente que no es apto para ningun uso en el que los errores de traduccion sean relevantes.
- Caida de calidad acusada en dominios no vistos: BLEU de 18,06 y chrF de 40,77 en el slice `unseen_domain`, frente a 26,75 y 42,49 en el slice visto. Los corpus de entrenamiento (subtitulos, web, texto oficial) no cubren literatura, vocabulario arcaico, nombres propios ni puntuacion de dialogo.
- Las entradas largas se parten en frases cuando se activa `split_long=True`; una unica frase muy larga sigue siendo un caso dificil.
- No se documenta una longitud de contexto maxima soportada, lo que impide garantizar un comportamiento estable con secuencias largas sin particion.
- Riesgo de alucinacion y de omisiones en la traduccion inherente a un modelo de 9,9 millones de parametros entrenado con aproximadamente 123 millones de tokens vistos.
- Sesgos: no se documenta ningun analisis de sesgos de genero, geografico o cultural, ni filtrado del corpus de entrenamiento mas alla de la limpieza de pares de frases.
- La licencia MIT permite uso comercial y modificacion sin restricciones, pero no se ofrece ninguna garantia de calidad ni de idoneidad.
- No hay versiones cuantizadas publicadas ni integracion documentada con runtimes de inferencia estandar, lo que anade trabajo de integracion en produccion.
- La fecha de creacion registrada en los metadatos (12-10-2026) resulta anomala y conviene verificarla antes de citar el modelo.
- El repositorio registra 0 descargas y 1 like, por lo que no existe evidencia de uso en produccion ni validacion independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palashsharma048/fr-en-transformer-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Script de inferencia: `inference.py`, incluido en el propio repositorio de HuggingFace del modelo
- No se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo ni con traduccion automatica.
