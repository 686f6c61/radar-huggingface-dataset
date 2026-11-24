# ShinSeungJ/behavert

## Resumen

BehaVERT es una familia de modelos transformer disenados para decodificar comportamiento animal a partir de secuencias de keypoints de pose 2D. Lo desarrolla Seung Jae Shin (repositorio ShinSeungJ) y se publica junto a un articulo en el *International Journal of Computer Vision* (2026). El modelo trata las coordenadas de pose como una secuencia de tokens y aplica atencion para clasificar el comportamiento, ya sea a nivel de fotograma o de secuencia completa.

El repositorio agrupa tres checkpoints especializados: `calms21-task1` (clasificacion por fotograma de ataque, investigacion, monta u otro en pares residente-intruso), `mabe22-strain` (clasificacion a nivel de video del genotipo WT/TG en trios de ratones) y `oft-behavior` (siete comportamientos en campo abierto con un solo raton). Cada checkpoint pesa aproximadamente 86M parametros y se distribuye en formato safetensors junto a un `config.json` que define arquitectura, clases y disposicion de keypoints.

Su relevancia radica en que sustituye pipelines de vision por computador especificos por un unico modelo de secuencia reutilizable entre configuraciones experimentales distintas, con resultados publicados de F1 macro de 0,871 en CalMS21 Task 1 y 0,819 a nivel de video en MABe22. La licencia MIT facilita su adopcion en laboratorios y en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre secuencias de keypoints (tokenizacion de pose + atencion) |
| Parametros totales | ~86M por checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 128 fotogramas (calms21-task1) o 64 fotogramas (mabe22-strain, oft-behavior) a 30 fps |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | no aplica (entrada numerica de keypoints; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

BehaVERT es un transformer que recibe las coordenadas (x, y) de varios individuos y keypoints por fotograma como una secuencia de tokens y aplica auto-atencion para capturar dependencias temporales y entre individuos. La cabeza de salida varia segun la tarea: clasificacion por token (un fotograma) o clasificacion de secuencia mediante un token `[CLS]`. El modelo `calms21-task1` se preentrena con modelado enmascarado de keypoints sobre todos los datos de CalMS21 y despues se ajusta de forma supervisada en la tarea 1; los otros checkpoints se entrenan directamente sobre sus datasets respectivos (MABe22 y grabaciones propias de campo abierto).

Los datos de entrenamiento son exclusivamente de pose: 2 ratones x 7 keypoints en CalMS21, 3 ratones x 12 keypoints en MABe22 y 1 raton x 11 keypoints en campo abierto, todos en 2D. No hay informacion en la model card sobre numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO (no aplicables a este dominio). La innovacion principal es el tratamiento del comportamiento como un "lenguaje de movimiento": la secuencia de keypoints se procesa con el mismo paradigma que un modelo de lenguaje, lo que permite analizar atencion y embeddings por ventana.

## Capacidades

- Clasificacion de comportamiento por fotograma en pares de ratones (ataque, investigacion, monta, otro).
- Clasificacion a nivel de video del genotipo (WT/TG) en trios de ratones.
- Clasificacion de siete comportamientos de campo abierto en un solo raton (rearing apoyado y no apoyado, grooming, freezing, salto, marcha atras, otros).
- Entrada de keypoints 2D con manejo de keypoints ausentes (valor 0 en MABe22, interpolacion lineal en oft-behavior).
- Agregacion de predicciones solapadas por ventana (media de probabilidades).
- Analisis de atencion y de embeddings (t-SNE) sobre un dataset completo mediante los subcomandos `behavert attention` y `behavert embed`.
- Pipeline de video a comportamiento en un paso cuando se combina con los modelos de pose de `ShinSeungJ/behavert-pose`.
- No soporta tool calling, function calling, agentes, vision directa ni audio: la entrada es exclusivamente numerica.

## Casos de uso

- Analisis de experimentos de interaccion social residente-intruso: `calms21-task1` etiqueta cada fotograma como ataque, investigacion, monta u otro, lo que permite calcular frecuencias y duraciones por sesion sin anotacion manual.
- Fenotipado de modelos transgenicos: `mabe22-strain` predice WT/TG a nivel de video a partir de trios de ratones, util para cribado de genotipos en estudios de comportamiento.
- Evaluacion de farmacos en campo abierto: `oft-behavior` cuantifica rearing, grooming, freezing y saltos fotograma a fotograma, lo que facilita comparar grupos tratados y control con metricas objetivas.
- Control de calidad de grabaciones: el comando `behavert decode --overlay --sync` genera un video con el esqueleto y la etiqueta dibujados, util para revisar visualmente predicciones antes de aceptar un lote.
- Analisis de atencion para investigacion: `behavert attention` y `behavert embed` permiten estudiar que keypoints y ventanas temporales influyen en cada decision, con aplicaciones en interpretabilidad de modelos de comportamiento.
- Integracion en pipelines de laboratorio: la API de Python (`BehaVERT.from_pretrained` + `predict_recording`) permite procesar lotes de sesiones y almacenar etiquetas por fotograma en bases de datos de experimentos.
- Deteccion de comportamientos anomalos: la clasificacion por fotograma de saltos y marcha atras en campo abierto puede usarse para marcar sesiones que requieran revision manual.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo / conjunto | Metrica | Resultado |
|---|---|---|
| calms21-task1 (test: 19 sesiones, 211.325 fotogramas) | F1 ataque | 0,794 |
| calms21-task1 | F1 investigacion | 0,889 |
| calms21-task1 | F1 monta | 0,930 |
| calms21-task1 | F1 macro | 0,871 |
| mabe22-strain (test: 1.121 videos) | F1 WT (nivel video) | 0,867 |
| mabe22-strain | F1 TG (nivel video) | 0,771 |
| mabe22-strain | F1 macro (nivel video) | 0,819 |
| mabe22-strain | F1 WT (nivel ventana) | 0,809 |
| mabe22-strain | F1 TG (nivel ventana) | 0,696 |
| mabe22-strain | F1 macro (nivel ventana) | 0,753 |

No se han publicado resultados de benchmarks para `oft-behavior` en la informacion disponible, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~86M parametros, la inferencia en precision FP32 requiere del orden de 0,4-0,6 GB de VRAM, mas el coste de procesar ventanas de 64-128 fotogramas; en FP16 se reduce aproximadamente a la mitad. Cifra no confirmada en la documentacion.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El cuello de botella sera el preprocesado de video y la deteccion de pose, no el transformer.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: paquete `behavert` instalado desde el repositorio de GitHub (`pip install "behavert[pose] @ git+https://github.com/ShinSeungJ/BehaVERT"`), con CLI (`behavert decode`, `attention`, `embed`) y API de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BehaVERT (calms21-task1) | ~86M | 128 fotogramas | Transformer sobre keypoints | MIT | Hugging Face + GitHub |
| BehaVERT (mabe22-strain) | ~86M | 64 fotogramas | Transformer sobre keypoints | MIT | Hugging Face + GitHub |
| BehaVERT (oft-behavior) | ~86M | 64 fotogramas | Transformer sobre keypoints | MIT | Hugging Face + GitHub |

No se dispone en la informacion proporcionada de datos numericos de modelos alternativos comparables (por ejemplo, clasificadores especificos de CalMS21 o MABe22) que permitan una comparacion cuantitativa; por tanto, la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con grabaciones de laboratorio, el rendimiento puede degradarse con condiciones de camara, iluminacion o cepas distintas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de clasificaciones erroneas por fotograma, especialmente en clases minoritarias (F1 de 0,696 en TG a nivel de ventana).
- Limitaciones de contexto: ventanas fijas de 64 o 128 fotogramas a 30 fps; grabaciones con otra frecuencia de muestreo requieren remuestreo.
- Dependencia de la pose: la calidad depende de los modelos de pose (`ShinSeungJ/behavert-pose`); keypoints ausentes se imputan con 0 o interpolacion, lo que puede introducir errores.
- `oft-behavior` solo es valido para configuraciones similares a la de entrenamiento (camara cenital, campo abierto cuadrado, un raton); el autor recomienda validar con videos propios antes de confiar en las predicciones.
- Restricciones de licencia: MIT permite uso comercial, pero se debe citar el articulo (Shin et al., IJCV 2026) y, cuando corresponda, los datasets CalMS21 (Sun et al., NeurIPS 2021) y MABe22 (Sun et al., ICML 2023).
- Sin datos publicados de cuantizacion ni de rendimiento en produccion; el modelo no incluye cabezas de lenguaje ni soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShinSeungJ/behavert
- Modelos de pose: https://huggingface.co/ShinSeungJ/behavert-pose
- Dataset: https://huggingface.co/datasets/ShinSeungJ/behavert-data
- Codigo: https://github.com/ShinSeungJ/BehaVERT
- Articulo: https://doi.org/10.1007/s11263-026-02834-y (Shin et al., *International Journal of Computer Vision*, vol. 134, pag. 303, 2026)
- CalMS21 (Sun et al., NeurIPS 2021 Datasets and Benchmarks): referencia citada en la model card, sin URL directa en la informacion disponible
- MABe22 (Sun et al., ICML 2023): referencia citada en la model card, sin URL directa en la informacion disponible
