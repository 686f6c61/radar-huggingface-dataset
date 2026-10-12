# gaon12/sion_translate

## Resumen

sion_translate v1, denominado internamente KJ-X, es un modelo de traduccion automatica bidireccional coreano-japones desarrollado por el usuario gaon12 y publicado en HuggingFace bajo licencia MIT. Se trata de un encoder-decoder personalizado implementado en PyTorch, con tokenizador SentencePiece, que no sigue la interfaz estandar de Transformers: no es un checkpoint `AutoModel` y requiere el codigo del repositorio del autor para la inferencia. El repositorio ocupa 3,8 GB e incluye exportaciones de inferencia (FP32 con pesos EMA e INT8 dinamico solo para CPU) junto con los ficheros del tokenizador, pero no distribuye los datasets ni los checkpoints de entrenamiento.

El modelo resuelve un par de idiomas concreto y poco cubierto por los sistemas abiertos generalistas: la traduccion coreano-japones en ambos sentidos. Su relevancia actual esta ligada a la version de runtime 0.1.2, que introduce una correccion parcial de inferencia centrada en el tratamiento de signos, unidades de medida y acronimos, sin necesidad de reentrenar ni sustituir los pesos. Segun la model card, esa actualizacion preserva casos como `± 0.05`, `250mL`, `3,850km²`, `15mile` y `40mile` que antes fallaban, y corrige cinco regresiones de acronimos.

El proyecto se publica con un conjunto de diagnostico propio y un scorer comun que permite comparar KJ-X con LibreTranslate, Papago, Google Translation, DeepL, M2M100 418M y NLLB-200. El autor no presenta cifras absolutas de benchmarks ni reclama superioridad general, y el repositorio tiene, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder personalizado en PyTorch (KJ-X); no compatible con `transformers.AutoModel` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 con pesos EMA (`model_ema.pt`, ruta recomendada); INT8 dinamico solo CPU (`model_int8.pt`) |
| Idiomas soportados | coreano (ko) y japones (ja), traduccion bidireccional |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, pickle); tokenizador SentencePiece (`kjx.model`, `kjx.vocab`) y `token_features.npz` |
| Tamano del repositorio | 3,8 GB |
| Pipeline declarado | translation |
| Version de runtime | 0.1.2 (commit 45254b8cb84e) |
| Fecha de creacion | 2026-07-22 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

KJ-X es un encoder-decoder de traduccion de proposito especifico, escrito en PyTorch como codigo propio y distribuido como exportaciones de inferencia en lugar de como un checkpoint estandar de la libreria Transformers. El tokenizador es SentencePiece (`kjx.model`, `kjx.vocab`) y se complementa con un fichero de caracteristicas de tokens (`token_features.npz`) que la clase `Translator` localiza automaticamente junto al modelo y al tokenizador. La distribucion incluye dos variantes de pesos: `model_ema.pt`, exportacion FP32 con pesos promediados (EMA) y recomendada por el autor, y `model_int8.pt`, una exportacion INT8 dinamica pensada exclusivamente para CPU.

La model card no publica el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens ni si se aplicaron tecnicas de alineacion como RLHF o DPO; tampoco se distribuyen los datasets ni los checkpoints de entrenamiento. La innovacion tecnica documentada no esta en la arquitectura sino en el postprocesado de inferencia: la actualizacion de runtime 0.1.2 incorpora una correccion parcial que preserva signos espaciados, repara sufijos de unidades de medida reconocidas (incluidas unidades compuestas y potencias), protege sufijos numericos antes no reconocidos y mantiene visibles los acronimos en mayusculas durante la traduccion. El autor insiste en que se trata de una correccion parcial: las unidades arbitrarias, los numeros escritos con palabras, la aritmetica y la semantica numerica completa no estan garantizadas, y algunas omisiones numericas siguen provocando un error en lugar de una traduccion.

## Capacidades

- Traduccion bidireccional coreano-japones y japones-coreano mediante una unica instancia de `Translator`, seleccionando el idioma destino con el parametro `target_language` (`ja` o `ko`).
- Traduccion por lotes: el metodo `translate` acepta una lista de cadenas y devuelve una lista de resultados.
- Decodificacion por busqueda en haz configurable: los ejemplos de la model card usan `num_beams=4` y las pruebas de humo usan `num_beams=1`.
- Preservacion de signos espaciados y de sufijos de unidades de medida reconocidas (`± 0.05`, `250mL`, `3,850km²`, `15mile`, `40mile`) tras la actualizacion 0.1.2.
- Mantenimiento de acronimos en mayusculas durante la traduccion, con cinco regresiones corregidas en la revision de runtime.
- Ejecucion en GPU CUDA (`device="cuda"`) o en CPU (`device="cpu"`); la validacion numerica de la actualizacion se verifico en CPU con `model_ema.pt`.
- Inferencia en CPU mediante la exportacion INT8 dinamica, orientada a entornos sin GPU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni otras modalidades.
- No hay soporte de inferencia alojada en Transformers: al ser codigo propio, `transformers.AutoModel` no funciona out of the box.

## Casos de uso

- Traduccion de comunicaciones corporativas entre equipos coreanos y japoneses: el modelo traduce correos, actas de reunion y mensajes de coordinacion en ambos sentidos, y la correccion 0.1.2 mantiene referencias como horarios (`17시 30분`) o cantidades (`250mL`) que en traduccion tecnica suelen corromperse.
- Localizacion de cadenas de interfaz y documentacion de producto: al procesar lotes de cadenas cortas con `translate([...])`, encaja en pipelines de localizacion que necesitan un par ko-ja dedicado sin depender de APIs externas, con la ventaja de la licencia MIT.
- Soporte al cliente en chat multi-turno: cada turno se traduce de forma independiente, de modo que puede integrarse como capa de traduccion en un sistema de atencion al cliente entre operadores japoneses y usuarios coreanos, asumiendo revision humana en casos sensibles.
- Preprocesado y aumento de corpus para NLP: generacion de traducciones sinteticas ko-ja para poblar datasets de entrenamiento o evaluacion, con la advertencia de que la model card no garantiza calidad sin revision.
- Traduccion en entornos sin GPU: la exportacion INT8 dinamica permite desplegar el traductor en CPU, lo que habilita escenarios de traduccion local o embebida donde no hay acelerador disponible.
- Evaluacion comparativa de sistemas de traduccion: el repositorio incluye un scorer comun y un JSONL de diagnostico que permite situar KJ-X frente a LibreTranslate, Papago, Google Translation, DeepL, M2M100 418M y NLLB-200 sobre el mismo conjunto, util para decidir que motor usar en un par ko-ja concreto.
- Traduccion de documentacion tecnica con terminologia especializada: el modelo puede usarse como primer paso de un flujo con revision humana obligatoria, dado que la propia model card advierte que la terminologia especializada requiere supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion aportados por el autor son los de la validacion de la correccion numerica de la version 0.1.2:

| Metrica de validacion | Resultado |
|---|---|
| Entradas probadas en la revision focalizada | 238 |
| Salidas devueltas | 236 |
| Entradas bloqueadas | 2 |
| Entradas de estres numerico escritas por el autor | 72 |
| Diagnosticos preexistentes incluidos | 16 |
| Entradas FLORES afectadas | incluidas todas las afectadas (recuento no disponible) |
| chrF++ medio en el subconjunto sin digitos | aumento en ambas direcciones (sin cifras absolutas) |
| Pruebas de regresion relacionadas | 98 superadas |
| Casos numericos verificados | `± 0.05`, `250mL`, `3,850km²`, `15mile`, `40mile` |

El autor aclara que no se trata de una repeticion completa de FLORES y que no se deriva ninguna afirmacion de calidad universal del conjunto de diagnostico, que es pequeno y de autoria propia. Tampoco se publican cifras de BLEU, chrF++ absoluto ni comparativas numericas frente a los sistemas incluidos en el scorer.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el numero de parametros ni el tamano de las exportaciones individuales, solo el tamano total del repositorio (3,8 GB, que incluye varias exportaciones y el tokenizador).
- GPU recomendadas: no disponible. El unico dato funcional es que la clase `Translator` acepta `device="cuda"` y `device="cpu"`.
- Compatibilidad con GPU de consumo: no disponible por falta de datos de tamano del modelo. La disponibilidad de una exportacion INT8 especifica para CPU sugiere que el autor contempla despliegue en hardware sin GPU, pero no se especifica que modelos de tarjeta grafica son suficientes.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama, TGI ni de la inferencia alojada de Transformers. El unico camino soportado es instalar el paquete `sion-translate` desde el repositorio de GitHub en el commit 45254b8cb84e y cargar los ficheros con `sion_translate.inference.Translator`.
- Instalacion: `pip install --upgrade "sion-translate @ git+https://github.com/gaon12/sion_translate.git@45254b8cb84e7725aa7b58709f060317ff4e2ab6"`, seguido de la descarga de `model_ema.pt`, `kjx.model`, `kjx.vocab`, `token_features.npz`, `inference_v1.py` y `v1_numeric_hotfix.json` con `hf download`.
- Latencia y throughput estimados: no disponible. No se publican tiempos de inferencia ni metricas de tokens por segundo.
- Nota de seguridad: la validacion de la actualizacion numerica se realizo con `model_ema.pt` en CPU; el autor indica que la descarga INT8 en formato pickle heredado no esta cubierta por esa validacion.

## Comparativa con modelos similares

El unico marco comparativo disponible es el scorer incluido en el repositorio del autor, que evalua KJ-X junto a LibreTranslate, Papago, Google Translation, DeepL, M2M100 418M y NLLB-200 sobre un JSONL de diagnostico propio. No se publican los resultados numericos de esa comparacion en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sion_translate v1 (KJ-X) | no disponible | no disponible | chrF++ relativo en subconjunto sin digitos, sin cifras absolutas | MIT | Pesos en HuggingFace y codigo en GitHub, requiere codigo propio |
| M2M100 418M | 418M | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | no disponible en la informacion proporcionada |
| NLLB-200 | no disponible | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | no disponible en la informacion proporcionada |
| LibreTranslate | no aplicable (servicio) | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | servicio |
| Papago | no aplicable (servicio) | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | servicio comercial |
| Google Translation | no aplicable (servicio) | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | servicio comercial |
| DeepL | no aplicable (servicio) | no disponible | incluido como baseline en el scorer del autor, resultados no publicados | no disponible | servicio comercial |

## Limitaciones y advertencias

- La traduccion automatica puede omitir, anadir o invertir significado; el propio autor lo advierte de forma explicita.
- Los nombres propios, los enunciados cortos dependientes de contexto, la terminologia especializada y las entradas largas requieren revision humana.
- No debe utilizarse la salida sin revisar para traduccion medica, legal, de seguridad critica o certificada.
- La correccion numerica de la version 0.1.2 es parcial: no cubre unidades arbitrarias, numeros escritos con palabras, aritmetica ni semantica numerica completa. Algunas omisiones numericas provocan un error en lugar de una traduccion.
- La validacion de la correccion se hizo sobre `model_ema.pt` en CPU y con un conjunto de diagnostico pequeno; no se realizo una repeticion completa de FLORES, por lo que pueden persistir regresiones individuales.
- La exportacion `model_int8.pt` no esta cubierta por la validacion de la actualizacion numerica y ademas se distribuye como pickle heredado.
- La arquitectura es codigo propio: no funciona con `transformers.AutoModel` ni con inferencia alojada en Transformers, lo que limita la integracion en stacks estandar y obliga a instalar el repositorio del autor en un commit concreto.
- La licencia MIT cubre el codigo original KJ-X y la publicacion de pesos, pero no concede derechos sobre las entradas proporcionadas por el usuario, las salidas generadas por el servicio, el software de terceros ni los modelos de terceros usados como baseline de comparacion.
- No se documentan sesgos concretos ni comportamiento medido por subgrupos; el par de idiomas soportado se limita a coreano y japones.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de terceros es practicamente inexistente.
- No se distribuyen datasets de entrenamiento ni checkpoints, lo que impide auditar la composicion de los datos o reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaon12/sion_translate
- Repositorio de codigo: https://github.com/gaon12/sion_translate
- Commit de runtime 0.1.2: https://github.com/gaon12/sion_translate/commit/45254b8cb84e7725aa7b58709f060317ff4e2ab6
- Documento de detalles de la correccion numerica: `NUMERIC_HOTFIX.md` (referenciado en la model card, ruta relativa dentro del repositorio de GitHub)
- Evidencia de validacion numerica: `v1_numeric_validation.json` (referenciado en la model card, ruta relativa dentro del repositorio de GitHub)
- Script de inferencia auxiliar: `inference_v1.py` (incluido en el repositorio de HuggingFace y descargable con `hf download`)
- Ficheros de pesos y tokenizador: `model_ema.pt`, `model_int8.pt`, `kjx.model`, `kjx.vocab`, `token_features.npz` (disponibles en el repositorio de HuggingFace)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
