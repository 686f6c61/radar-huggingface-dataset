# seungminpark/seismorescue-sam3-film

## Resumen

SeismoRescue SAM3 Film es un adaptador LoRA sobre SAM 3 (Segment Anything Model 3) de Meta, desarrollado por seungminpark durante el Meta Global AI Developer Hackathon (26 de octubre – 4 de noviembre de 2026). Su proposito es trazar las lineas de sismogramas de pelicula WWSSN escaneados, incluyendo los puntos donde lineas vecinas se cruzan, una tarea de digitalizacion sismologica que hasta ahora requeria intervencion manual.

No se trata de un modelo completo: el repositorio contiene unicamente pesos LoRA de rango 8 aplicados a los ultimos 16 de los 32 bloques del backbone, el cuello FPN y el decodificador de mascaras afinados, y dos embeddings pequenos (point-prompt y no-memory, 1.536 valores). Los pesos base de SAM 3 no se incluyen y el usuario debe disponer de acceso aprobado a `facebook/sam3`. El checkpoint ocupa 48.957.717 bytes.

El modelo forma parte del proyecto SeismoRescue, que traza cada linea dos veces (una desde cada extremo), acepta los tramos donde ambos pasos coinciden y exporta el resultado a miniSEED, dejando el resto para revision humana. Es relevante porque aborda un cuello de botella real en la recuperacion de datos sismologicos historicos, aunque sus resultados en pelicula real son todavia limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre SAM 3, con FPN neck y mask decoder afinados |
| Parametros totales | No disponible (checkpoint de 48.957.717 bytes; no incluye pesos base del backbone) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de segmentacion por ventanas de 406 × 256 px, paso 192) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | SAM License (derivado de SAM 3) |
| Formato de pesos | PyTorch (`ckpt_sam3_film2_best.pt`) |

## Arquitectura y entrenamiento

El modelo parte de SAM 3 (`facebook/sam3`, revision `3c879f39826c281e95690f02c7821c4de09afae7`) y aplica LoRA de rango 8 sobre los ultimos 16 de los 32 bloques del backbone, manteniendo congelado el resto. Ademas se afinan el cuello FPN y el decodificador de mascaras, y se anaden dos embeddings de 1.536 valores (point-prompt y no-memory). El entrenamiento se realizo en una sola H100 en Modal durante 60 minutos, con datos exclusivamente sinteticos generados por el propio renderizador del proyecto (`scripts/ml_sim2real_render.py`, `scripts/make_film2_train.py`). Los ajustes congelados del metodo son λ 1e-5, ventana de 406 × 256 px, paso de 192 px y evaluacion en fp32 (`frozen_method.json`).

La innovacion principal no esta en la arquitectura sino en el flujo de trabajo: el sistema traza cada linea dos veces (desde cada extremo) y solo acepta los tramos donde ambos trazados coinciden, exportando esos spans a miniSEED y derivando el resto a revision humana. Este diseno de doble pasada con consenso actua como mecanismo de control de calidad sobre un modelo afinado unicamente con datos sinteticos.

## Capacidades

- Segmentacion y trazado de lineas en imagenes de sismogramas de pelicula WWSSN escaneados.
- Manejo de cruces entre lineas vecinas, el caso que el autor destaca como objetivo del afinado.
- Trazado bidireccional: el pipeline ejecuta el modelo desde ambos extremos de cada linea y compara resultados.
- Exportacion de tramos aceptados a formato miniSEED mediante el codigo del repositorio.
- Integracion con un flujo de revision humana para los tramos no aceptados.
- Capacidades generales de SAM 3 (segmentacion promptable) potencialmente conservadas, aunque no documentadas para este adaptador.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, tool calling ni capacidades de agente.

## Casos de uso

- Digitalizacion de archivos sismologicos historicos: el modelo traza las lineas de pelicula WWSSN escaneada y el pipeline exporta los tramos de consenso a miniSEED, permitiendo recuperar registros que solo existen en formato analogico.
- Control de calidad por consenso de doble pasada: al trazar cada linea desde ambos extremos y aceptar solo los tramos coincidentes, se obtiene una senal de confianza implicita que reduce la necesidad de revision manual en los tramos claros.
- Priorizacion de revision humana: los tramos donde los dos trazados discrepan se derivan automaticamente a revision, de modo que el esfuerzo humano se concentra en las zonas ambiguas (cruces, ruido, trazos degradados).
- Investigacion sismologica comparada: la disponibilidad de series temporales en miniSEED facilita la comparacion de eventos historicos con registros modernos de banda ancha.
- Generacion de datos de entrenamiento: los trazados aceptados y revisados pueden servir como etiquetas para afinar modelos posteriores sobre pelicula real, dado que el entrenamiento actual es solo sintetico.
- Prototipado en proyectos de preservacion documental: el codigo del repositorio incluye una reproduccion que no requiere clave ni GPU, lo que permite evaluar el flujo completo antes de invertir en acceso a los pesos base.

## Benchmarks y rendimiento

| Escenario | Metrica | Resultado |
|---|---|---|
| Pelicula sintetica (10 terremotos no vistos) | Columnas aceptadas dentro de un cuarto de espaciado de linea de la posicion real de la pluma | 94,18% |
| Pelicula sintetica (misma prueba) | Linea plana como referencia en las mismas columnas | 72,46% |
| Pelicula real | Dos terremotos mas grandes probados | Falla en ambos |
| Pelicula real | Precision | Desconocida |

El autor indica que la regla se congelo antes de ejecutar la prueba, que se realizo una sola vez sobre 10 terremotos no vistos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes, al no ser un modelo linguistico.

## Requisitos de hardware

- Entrenamiento: una H100 durante 60 minutos en Modal.
- VRAM de inferencia: no disponible en la informacion proporcionada; depende de los pesos base de SAM 3, que no se incluyen en el repositorio.
- GPU recomendadas: no disponible. El autor no documenta requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible; requiere cargar SAM 3 completo ademas del adaptador de 49 MB.
- Despliegue: el codigo de carga esta en `scripts/ml_sam3.py` y `scripts/rescue.py` del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentacion).
- Latencia y throughput: no disponibles. La evaluacion se realiza en fp32 con ventanas de 406 × 256 px y paso de 192 px.
- Requisito adicional: acceso aprobado a `facebook/sam3` para descargar los pesos base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeismoRescue SAM3 Film | Adaptador LoRA sobre SAM 3 | No disponible (checkpoint 49 MB + base) | Ventana 406 × 256 px | SAM License | Hugging Face, requiere acceso a SAM 3 |
| SAM 3 (facebook/sam3) | Modelo base de segmentacion promptable | No disponible en la informacion | No disponible | SAM License | Hugging Face con acceso aprobado |
| SAM 2 | Modelo de segmentacion de video/imagen | No disponible en la informacion | No disponible | Apache 2.0 (segun versiones publicadas) | Hugging Face |
| SeisBench / modelos sismologicos de picking | Redes de deteccion de fases | No disponible en la informacion | Ventanas de forma de onda | Principalmente abiertas | Hugging Face y GitHub |

No se dispone de datos comparativos de rendimiento frente a estas alternativas en la informacion proporcionada. La comparacion con SeisBench es conceptual: aquellos modelos operan sobre formas de onda digitales, mientras que este adaptador opera sobre imagenes de pelicula escaneada.

## Limitaciones y advertencias

- Entrenado exclusivamente con pelicula sintetica; el propio autor reporta fallo en los dos terremotos reales mas grandes probados y precision desconocida en pelicula real.
- No es un modelo completo: sin los pesos base de SAM 3 (acceso restringido) el adaptador no es utilizable.
- Los resultados sinteticos (94,18%) se midieron sobre solo 10 terremotos no vistos y con una unica ejecucion de la regla congelada; la varianza estadistica no esta caracterizada.
- Riesgo de fallo silencioso en cruces de lineas y trazos degradados; el diseno de doble pasada mitiga pero no elimina este riesgo.
- La licencia SAM License impone restricciones, incluida la seccion 1.b.v sobre usos militares y aplicaciones nucleares, que se extiende al adaptador y a cualquier obra derivada.
- La licencia MIT del codigo del repositorio de GitHub no cubre el adaptador; solo aplica al codigo.
- No hay informacion sobre sesgos, cobertura geografica de los sismogramas de entrenamiento ni robustez frente a distintos escaneos o resoluciones.
- El modelo se distribuye tal cual, sin garantia.
- No apto para tareas linguisticas, de codigo o de razonamiento; su ambito es exclusivamente la segmentacion de lineas en imagenes de sismogramas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungminpark/seismorescue-sam3-film
- Modelo base SAM 3: https://huggingface.co/facebook/sam3
- Repositorio GitHub de SeismoRescue: https://github.com/smpark00/seismorescue
- Resultados detallados (README de GitHub): https://github.com/smpark00/seismorescue#results
