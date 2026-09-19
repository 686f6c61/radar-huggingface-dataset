# cmeister/boundary-markers-en-d12-plain-bpe

## Resumen

`cmeister/boundary-markers-en-d12-plain-bpe` es un conjunto de tres modelos de lenguaje (semillas 0, 1 y 2) publicados como material de reproducibilidad del articulo "Explicit Boundary Markers for Subword Vocabularies" de Sander Land y Clara Meister (arXiv:2608.08847). Su proposito no es el uso generalista, sino servir de brazo de control en un experimento comparativo sobre tokenizacion: los tres modelos comparten arquitectura, datos y configuracion, y se diferencian unicamente en el tokenizador. Este repositorio concreto alberga el brazo "baseline", que emplea pretokenizacion mediante SCRIPT-encoding sin marcadores de frontera y un vocabulario BPE.

El modelo es una red transformer decoder-only entrenada con el framework nanochat (commit `92d63d4`) de Andrej Karpathy: 12 capas, anchura 768, 6 cabezas de atencion y una ventana de contexto de 2.048 tokens. El entrenamiento consumio 1.340 millones de tokens (2.553 pasos de 524.288 tokens) sobre los ocho primeros shards de ClimbMix, con un tokenizador BPE de 34.685 entradas entrenado sobre una muestra de 5 GB de FineWeb en ingles. El recuento total de parametros no se publica en la model card.

Su relevancia es metodologica: la model card advierte explicitamente de que los checkpoints originales detras de las cifras publicadas se perdieron y que estos tres modelos son reentrenamientos de septiembre de 2026 con los mismos datos y ajustes. Como el entrenamiento en GPU no es reproducible bit a bit, las metricas difieren ligeramente de las publicadas, y ambas series se ofrecen en el repositorio para que terceros puedan auditar la deriva experimental. Es, por tanto, un artefacto de investigacion sobre tokenizacion, no un modelo pensado para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion nanochat, commit `92d63d4`); 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | no disponible (la model card no publica el recuento) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato PyTorch; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`) |
| Tokenizador | BPE con pretokenizacion SCRIPT-encoding, sin marcadores de frontera; vocabulario de 34.685 entradas mas un token de inicio de secuencia (34.686 en el modelo) |
| Semillas incluidas | 3 (0, 1 y 2) |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de nanochat: un transformer decoder-only de 12 capas con anchura de 768 y 6 cabezas de atencion, entrenado con contexto de 2.048 tokens. No se emplean tecnicas de atencion lineal, MoE ni arquitecturas hibridas; es un transformer denso de escala pequena. La innovacion del trabajo no reside en el modelo, sino en el tokenizador: este brazo usa pretokenizacion basada en SCRIPT-encoding sin ningun marcador explicito de frontera de subpalabra, y actua como linea base frente a los otros brazos del articulo, que si introducen dichos marcadores. El vocabulario se entreno con BPE sobre una muestra de 5 GB de FineWeb en ingles, con 34.685 entradas; el fichero exacto es `tokenizer/fineweb_en_5gb_plain_bpe_v34685.json.gz` (sha256 `5889cd70d7e4b67018512ce09e5db30031f297b1c816f0abc6c5cc51a340ff1c`) y requiere el repositorio `script_tok` para cargarse.

El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio `script_tok`, con un unico GPU por modelo y 2.553 pasos de 524.288 tokens cada uno, lo que suma 1.340 millones de tokens. Los datos son los ocho primeros shards de ClimbMix que descarga nanochat, leidos entre 3,4 y 3,6 veces segun el tokenizador. La semilla determina la inicializacion de pesos y el orden de los ocho shards; ese orden es identico para todos los tokenizadores con la misma semilla, lo que permite comparaciones directas entre brazos. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: son modelos base entrenados exclusivamente con prediccion del siguiente token.

## Capacidades

- Modelado de lenguaje y generacion de texto en ingles: es un modelo base, sin ajuste por instrucciones ni plantilla de chat.
- Evaluacion comparativa de tokenizadores: su funcion principal es servir de linea base frente a tokenizadores con marcadores de frontera, manteniendo constantes datos, semillas y ajustes.
- Estudio de eficiencia de tokenizacion: el entrenamiento registra cuantas veces se leen los shards (3,4 a 3,6) en funcion del tokenizador, lo que permite medir el efecto del vocabulario en el numero de tokens efectivos.
- Reproduccion de experimentos academicos: al incluirse `train.log`, `meta_002553.json` y `archive.json` con los hashes SHA-256, se pueden verificar los resultados publicados.
- Soporte de tool calling o function calling: no disponible (no se documenta ninguna capacidad de este tipo).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, unicamente ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en tokenizacion: usar los tres brazos con la misma semilla para aislar el efecto de los marcadores de frontera sobre la perdida de validacion, ya que el orden de los shards se mantiene identico entre tokenizadores con la misma semilla.
- Auditoria de reproducibilidad: comparar las cifras de este reentrenamiento (por ejemplo 0,88541 bits por byte en la semilla 0) con las publicadas (0,88537) para cuantificar la deriva no determinista del entrenamiento en GPU.
- Linea base en experimentos propios: al ser un transformer de 12 capas y contexto 2.048 entrenado con 1,34 mil millones de tokens, sirve como referencia barata frente a la que medir variantes de vocabulario o de arquitectura.
- Analisis linguistico de vocabularios BPE: inspeccionar como segmenta el tokenizador `plain` frente a alternativas con marcadores, usando el modelo entrenado para medir el impacto en bits por byte.
- Docencia universitaria sobre modelos de lenguaje: el modelo es lo bastante pequeno para entrenarse en un unico GPU y su registro de entrenamiento completo permite explicar el ciclo completo de preentrenamiento con un ejemplo real.
- Desarrollo y validacion de pipelines de evaluacion: al distribuirse como state dict de PyTorch con configuracion en JSON, es util para probar herramientas de evaluacion de bits por byte sobre texto en UTF-8 antes de aplicarlas a modelos mayores.
- Experimentos de eficiencia de inferencia a contexto corto: con 2.048 tokens de ventana y un modelo de escala pequena, sirve para medir latencias y sobrecarga de tokenizacion en entornos controlados.

## Benchmarks y rendimiento

La model card solo publica la metrica de validacion del propio articulo: bits por byte, calculada como la suma de la perdida sobre el shard de validacion de ClimbMix dividida por la longitud real en UTF-8 del texto evaluado (menor es mejor). Se ofrecen tanto las cifras del reentrenamiento como las publicadas y su diferencia.

| Semilla | Reentrenamiento | Publicado | Diferencia (reentrenamiento - publicado) |
|---|---|---|---|
| 0 | 0,88541 | 0,88537 | +0,00004 |
| 1 | 0,88461 | 0,88498 | -0,00037 |
| 2 | 0,88570 | 0,88560 | +0,00011 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 12 capas y anchura 768, la huella de pesos es del orden de centenares de MB en precision reducida, aunque el repositorio completo ocupa 2,5 GB porque incluye tres semillas y artefactos de entrenamiento.
- GPU recomendadas: la model card indica que el entrenamiento se hizo con un unico GPU por modelo, sin especificar el modelo de GPU. Para inferencia es suficiente cualquier GPU moderna; una RTX 4090, una RTX 3090 o incluso una GPU de gama media son mas que suficientes.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU de consumo con al menos unos pocos GB de VRAM; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: los pesos se distribuyen como state dict de PyTorch (`model_002553.pt`) y la configuracion como JSON de nanochat, por lo que el camino natural es el propio motor de inferencia de nanochat. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados; usarlos requeriria una conversion previa.
- Latencia y throughput estimados: no disponible. La informacion solo menciona que cada modelo se entreno en un unico GPU y los logs completos de entrenamiento y evaluacion, que podrian consultarse para obtener cifras reales.
- Nota de despliegue: para cargar el tokenizador es necesario clonar el repositorio `script_tok` y usar la clase `BoundaryBPETokenizer` del modulo `paper_utils.boundary.downstream.boundary_tokenizer`.

## Comparativa con modelos similares

La informacion disponible no identifica por nombre los otros brazos del experimento, solo indica que son modelos en ingles que se diferencian exclusivamente en el tokenizador y que fueron entrenados con los mismos datos, ajustes y semillas. La comparacion significativa, por tanto, es interna al articulo y no frente a modelos publicos de proposito general.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (brazo `plain` BPE) | no disponible (12 capas, anchura 768) | 2.048 tokens | 0,88461-0,88570 bits por byte en validacion | apache-2.0 | HuggingFace, 3 semillas |
| Otros brazos del mismo articulo (tokenizadores con marcadores de frontera) | identica arquitectura | 2.048 tokens | no disponible en la informacion proporcionada | no disponible | no disponible |
| Modelos publicos comparables de 12 capas (por ejemplo GPT-2 small, Pythia-160M) | no disponible como comparacion directa | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa fiable con modelos de fuera del estudio.

## Limitaciones y advertencias

- Son modelos base sin ajuste por instrucciones: no siguen ordenes, no mantienen formato conversacional y no deben usarse como asistentes sin un ajuste posterior.
- Cobertura linguistica limitada al ingles: el vocabulario se entreno sobre una muestra de 5 GB de FineWeb en ingles.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para tareas de documento largo, RAG extenso o conversaciones multi-turno prolongadas.
- Escala reducida (12 capas, anchura 768, 1,34 mil millones de tokens de entrenamiento): la calidad del texto generado sera notablemente inferior a la de modelos actuales de proposito general y la tasa de alucinacion sera alta en cualquier tarea factual.
- No hay datos publicados sobre sesgos, filtrado del corpus ni evaluacion de toxicidad; el dataset subyacente (FineWeb y ClimbMix) no se describe en detalle en la model card.
- Los numeros publicados en el articulo no corresponden a estos checkpoints: son reentrenamientos y, segun el propio autor, el entrenamiento en GPU no es reproducible bit a bit. Las diferencias observadas son pequenas (entre -0,00037 y +0,00011 bits por byte), pero deben tenerse en cuenta al citar cifras.
- El repositorio no esta pensado para produccion: se distribuyen state dicts de PyTorch y ficheros de log, sin pesos cuantizados, sin plantilla de prompt y sin integracion con servidores de inferencia convencionales.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y de ajuste por instrucciones hace desaconsejable cualquier despliegue orientado al usuario final.
- El repositorio muestra cero descargas y cero "likes" en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-plain-bpe
- Articulo "Explicit Boundary Markers for Subword Vocabularies": https://arxiv.org/abs/2608.08847
- Repositorio `script_tok` (tokenizador y scripts de entrenamiento): https://github.com/sanderland/script_tok
- Repositorio `nanochat` (framework de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat

Nota: la busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces anteriores proceden exclusivamente de la informacion del repositorio de HuggingFace y de su model card.
