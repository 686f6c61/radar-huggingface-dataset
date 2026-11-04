# brain-bzh/reve-small

## Resumen

REVE-small (Representation for EEG with Versatile Embeddings) es un modelo fundacional basado en transformer disenado especificamente para el procesamiento de senales EEG. Lo desarrolla el equipo BRAIN del IMT Atlantique en colaboracion con la Universite de Montreal (UdeM), y se distribuye bajo la licencia REVE Responsible Use License v1.0. No es un modelo generativo de texto: es un encoder de extraccion de caracteristicas (feature-extraction) cuyo proposito es producir representaciones vectoriales de senales electroencefalograficas que generalicen entre configuraciones de electrodos y tareas muy diversas.

La innovacion central es un esquema de codificacion posicional 4D que permite al modelo procesar senales de longitud arbitraria y con cualquier disposicion de electrodos, algo que los modelos EEG previos no cubrian de forma general. REVE-small es la variante compacta de REVE-base: mantiene el mismo diseno de capas (anchura 512, 8 cabezas de dimension 64, feed-forward GEGLU con ratio 2.66) pero reduce la profundidad a 4 capas transformer, resultando en 12,7 millones de parametros frente a los 69,2 millones de REVE-base.

Es relevante ahora porque el checkpoint publicado corresponde a la epoca 15 de un entrenamiento planificado de 200 epocas, es decir, es un checkpoint temprano y no un modelo completamente entrenado. Su interes practico esta en servir como base ligera para fine-tuning en tareas de neurociencia y BCI, y como referencia reproducible del objetivo de masked autoencoding (MAE) aplicado a EEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 capas), codificacion posicional 4D, parcheado de 200 muestras con solapamiento de 20 a 200 Hz |
| Parametros totales | 12.667.904 (12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa senales de longitud arbitraria gracias al esquema posicional 4D; sin limite fijo documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senal EEG, no linguistico) |
| Licencia | REVE Responsible Use License v1.0 (permite uso comercial, educativo y personal con restricciones) |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

REVE-small es un transformer encoder con 4 capas, anchura de 512, 8 cabezas de atencion de dimension 64 y capas feed-forward GEGLU con ratio de expansion 2.66. Comparte con REVE-base el mismo esquema de parcheado (ventanas de 200 muestras con solapamiento de 20 muestras, asumiendo senales muestreadas a 200 Hz) y la misma codificacion posicional 4D, que es la pieza que permite procesar senales de longitud arbitraria y configuraciones de electrodos variables. El modelo necesita el banco de posiciones `brain-bzh/reve-positions` para mapear nombres de electrodos a coordenadas 3D.

El entrenamiento utiliza el objetivo de masked autoencoding (MAE) propio de REVE. El checkpoint liberado se guardo en la epoca 15 de un calendario de 200 epocas, por lo que es un modelo temprano y no completamente convergido. Solo se publica el encoder: el decodificador MAE y el estado del optimizador no se distribuyen. El desarrollo corre a cargo del equipo BRAIN del IMT Atlantique y la Universite de Montreal, con financiacion de la ANR (programa AI@IMT y beca ANR-24-CE23-7365), la region de Bretana, NSERC, las Canada Research Chairs y FRQ-NT, usando recursos HPC de IDRIS (asignacion GENCI 2024-AD011015237R1) y Digital Alliance Canada.

## Capacidades

- Extraccion de embeddings de senales EEG: produce representaciones vectoriales por senal para tareas posteriores de clasificacion, regresion o clustering.
- Generalizacion a configuraciones de electrodos arbitrarias: acepta cualquier conjunto de nombres de electrodos y obtiene sus posiciones 3D desde el banco de posiciones.
- Procesamiento de senales de longitud variable: la codificacion posicional 4D elimina la necesidad de recortar o rellenar a una ventana fija.
- Base para fine-tuning: al ser un encoder preentrenado con MAE, puede adaptarse a tareas supervisadas de neurociencia.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo unimodal de senal.
- No dispone de modo de razonamiento (thinking mode) ni de decodificacion especulativa.

## Casos de uso

- Clasificacion de estados cognitivos o del sueno: extraer embeddings de epocas EEG y entrenar un clasificador ligero encima; el modelo compacto (12,7 M) permite iterar rapido sobre datasets de laboratorio.
- Interfaces cerebro-computador (BCI): usar las representaciones como entrada a un decodificador de intencion motora, aprovechando que el modelo acepta configuraciones de electrodos no estandar.
- Deteccion de anomalias epileptiformes: fine-tuning del encoder sobre registros etiquetados para senalar segmentos con patrones anormales, con la ventaja de manejar senales de longitud variable.
- Preprocesado y reduccion de dimensionalidad: sustituir pipelines artesanales de extraccion de caracteristicas por embeddings aprendidos antes de un modelo aguas abajo.
- Investigacion reproducible en neurociencia: usar el checkpoint como linea base ligera para comparar objetivos de preentrenamiento EEG, dado que es un checkpoint temprano documentado.
- Prototipado en entornos con recursos limitados: los 12,7 M de parametros permiten inferencia en CPU o GPU de gama baja para pruebas de concepto antes de escalar a REVE-base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (12,7 M de parametros, aproximadamente 51 MB de pesos mas activaciones); el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente para inferencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de senal estos motores no son aplicables directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REVE-small | 12,7 M | 4 | longitud arbitraria (pos. 4D) | REVE Responsible Use v1.0 | HuggingFace (checkpoint epoca 15) |
| REVE-base | 69,2 M | 22 | longitud arbitraria (pos. 4D) | REVE Responsible Use v1.0 | HuggingFace |
| Otros modelos fundacionales EEG | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas externas no esta disponible en la informacion proporcionada; la unica referencia directa es REVE-base del mismo autor.

## Limitaciones y advertencias

- Checkpoint temprano: guardado en la epoca 15 de 200, por lo que el rendimiento esta por debajo del modelo completamente entrenado; no debe tratarse como un modelo final.
- Solo se libera el encoder; el decodificador MAE y el estado del optimizador no estan disponibles, lo que limita la reproduccion exacta del preentrenamiento.
- Requiere senales muestreadas a 200 Hz y el banco de posiciones `brain-bzh/reve-positions` para funcionar; no es un modelo autonomo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor.
- Licencia no estandar: aunque permite uso comercial, impone restricciones explicitas contra intrusion de privacidad, reidentificacion, vigilancia no consentida, perfilado y usos discriminatorios; es necesario revisar el texto completo antes de desplegar.
- Riesgo de sesgo: al entrenarse con datasets EEG concretos (no documentados en la informacion disponible), puede no generalizar a poblaciones, equipos o protocolos distintos.
- No hay datos publicados de benchmarks ni de rendimiento en tareas downstream, por lo que la calidad real de los embeddings no esta cuantificada.
- Idiomas soportados no aplicables; no es un modelo linguistico.

## Enlaces

- HuggingFace: https://huggingface.co/brain-bzh/reve-small
- REVE-base: https://huggingface.co/brain-bzh/reve-base
- Banco de posiciones: https://huggingface.co/brain-bzh/reve-positions
- Pagina del proyecto: https://brain-bzh.github.io/reve/
- Paper (arXiv): https://arxiv.org/abs/2510.21585
- Equipo BRAIN (IMT Atlantique): https://www.imt-atlantique.fr/en/research-innovation/teams/brain
- Universite de Montreal: https://www.umontreal.ca/en/
