# Aaypom/factorjepa-cosmos-future-adapter

## Resumen

FactorJEPA Cosmos Future Adapter es un adaptador entrenable de tamano reducido que traduce los tokens de futuro generados por FactorJEPA (un modelo de world model basado en la familia V-JEPA) al espacio latente continuo de video del tokenizer de NVIDIA Cosmos. Lo publica el usuario Aaypom en Hugging Face bajo el pipeline `video-to-video`, con libreria PyTorch y un repositorio de 19,6 GB. No es un modelo generativo completo: es la pieza de conexion entre dos sistemas congelados, y su funcion es predecir dos ranuras (slots) de latente futuro.

El problema que resuelve es el de la interoperabilidad entre representaciones. FactorJEPA produce predicciones en su propio espacio de embeddings de futuro; Cosmos trabaja con latentes de video continuos con un factor de compresion 4x8x8. Sin un adaptador, esos dos espacios no son compatibles y no se puede decodificar video futuro a partir de la prediccion de FactorJEPA. El repositorio incluye unicamente el adaptador: no contiene los pesos de FactorJEPA ni los del tokenizer de Cosmos, que deben obtenerse por separado.

Es relevante ahora porque se situa en la interseccion de dos lineas de investigacion activas: los world models de tipo JEPA (prediccion en espacio latente, sin reconstruir pixeles) y los tokenizers de video de alta compresion empleados en modelos de difusion de video. La model card es extremadamente escueta: no declara licencia, idiomas, ni cifras de benchmarks, por lo que casi todas las especificaciones cuantitativas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador entrenable que mapea tokens de futuro de FactorJEPA a latentes continuos del tokenizer de Cosmos; arquitectura interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la model card menciona decodificacion causal "4k+1" con un ancla del ultimo fotograma de contexto antepuesta |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | no disponible |
| Formato de pesos | no especificado; la libreria declarada es PyTorch. Los checkpoints referenciados en la model card usan extension `.pt` |
| Tamano del repositorio | 19,6 GB |
| Pipeline declarado | video-to-video |
| Tags | factorjepa, cosmos-tokenizer, world-models, video-to-video |
| Dependencias externas | FactorJEPA (checkpoint base `anonymousML123/factorjepa-outputs/.../m09c_ckpt_best.pt`) y tokenizer `nvidia/Cosmos-0.1-Tokenizer-CV4x8x8` |
| Salidas | dos ranuras de latente futuro predichas |

## Arquitectura y entrenamiento

El adaptador opera como puente entre dos representaciones latentes. Por un lado recibe los tokens de futuro de FactorJEPA, derivados de un backbone cuyo nombre de checkpoint (`vjepa_2_1_vitg_1B`) apunta a un ViT-gigante de aproximadamente 1B de parametros, aunque este dato no esta confirmado explicitamente por el autor y debe tratarse como inferencia a partir de la ruta del fichero. Por otro lado emite latentes en el espacio del tokenizer `nvidia/Cosmos-0.1-Tokenizer-CV4x8x8`, cuyo nombre indica un factor de compresion espacial y temporal de 4x8x8. La model card indica que el adaptador predice dos slots de latente futuro y que, para la decodificacion causal, se antepone un ancla codificada por separado correspondiente al ultimo fotograma de contexto; ese ancla no forma parte de la prediccion del adaptador.

En cuanto al entrenamiento, la unica informacion disponible es que el codigo se encuentra en `experiments/jepa_cosmos` dentro del repositorio de FactorJEPA y que existe un payload de metricas en `metrics/best.json`. El nombre del checkpoint base asociado (`m09c_surgery_3stage_DI_diheavy_encoder`) sugiere un entrenamiento por etapas con modificaciones quirurgicas sobre el encoder, pero no hay detalle publicado sobre numero de tokens de video, composicion del dataset, uso de RLHF/DPO (no aplicable en este dominio) ni funcion de perdida mas alla de la propia tarea de prediccion de latentes. El repositorio no incluye los pesos de los modelos base, solo el adaptador entrenado.

## Capacidades

- Prediccion de latentes de video futuro: genera dos ranuras de latente continuo en el espacio de Cosmos a partir de los tokens de futuro de FactorJEPA.
- Traduccion entre espacios latentes: convierte representaciones de un world model JEPA en representaciones compatibles con el decodificador del tokenizer de Cosmos.
- Decodificacion causal: soporta el esquema descrito como "4k+1", en el que un ancla del ultimo fotograma de contexto se antepone a los latentes predichos.
- Pipeline video-to-video: la tarea declarada en Hugging Face es transformacion de video, aunque el adaptador opera en espacio latente y no en pixeles.
- Integracion con world models: pensado para encadenarse con FactorJEPA (encoder/predictor congelado) y con el tokenizer de Cosmos.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (no procesa texto).
- Capacidades especiales: no se declaran modos de pensamiento, audio ni vision estatica.

## Casos de uso

- Prediccion de video en world models: el adaptador permite tomar la prediccion de futuro de FactorJEPA y decodificarla con el tokenizer de Cosmos para obtener una representacion de video futuro, util en investigacion sobre planificacion en espacio latente.
- Robotica y manipulacion: un world model que anticipe los proximos latentes de una escena permite evaluar trayectorias candidatas antes de ejecutarlas; el adaptador es la pieza que hace legible esa prediccion con un tokenizer de video estandar.
- Conduccion autonoma y simulacion: la prediccion de latentes futuros de una secuencia de camara puede alimentar simuladores que necesiten anticipar la evolucion de la escena en un espacio comprimido.
- Investigacion en representaciones auto-supervisadas: sirve como banco de pruebas para estudiar si los tokens de futuro de un JEPA conservan suficiente informacion como para reconstruir latentes de un tokenizer independiente.
- Deteccion de anomalias en video: comparar los latentes predichos con los latentes reales observados permite cuantificar la desviacion respecto a la dinamica esperada.
- Generacion de video condicionada por prediccion: encadenar el adaptador con un decodificador de Cosmos para producir fotogramas futuros a partir de un contexto dado, sujeto a la calidad del tokenizer.
- Model-based reinforcement learning: usar los latentes predichos como estado comprimido en un bucle de aprendizaje por refuerzo basado en modelo.
- Reproduccion de experimentos: dado que el autor publica la ruta del checkpoint base, el tokenizer y el codigo, el adaptador permite replicar la pipeline de entrenamiento de FactorJEPA a Cosmos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia un fichero `metrics/best.json` dentro del repositorio, cuyo contenido no se ha facilitado. No se dispone de cifras de PSNR, LPIPS, FVD, SSIM ni de ninguna otra metrica de calidad de video, ni de comparaciones con otros adaptadores.

## Requisitos de hardware

- VRAM para el adaptador: no disponible. El tamano del repositorio (19,6 GB) incluye presumiblemente checkpoints y estados de optimizador, pero no implica ese consumo en inferencia.
- VRAM para el sistema completo: depende de los pesos de FactorJEPA y del tokenizer de Cosmos, que no se incluyen en este repositorio y cuyos requisitos no se detallan. El nombre del checkpoint base sugiere un backbone de aproximadamente 1B de parametros, lo que en FP16 rondaria los 2 GB, pero es una estimacion orientativa no confirmada por el autor.
- GPU recomendadas: no disponible. Para un backbone de ese orden, GPU tipo A100, H100 o RTX 4090 serian suficientes en terminos de memoria, pero el consumo real depende de la resolucion y duracion del video.
- Encaje en GPU de consumo: no confirmado. La viabilidad con una RTX 4090 o similar depende en gran medida del tokenizer y de la longitud de la secuencia de video procesada.
- Opciones de despliegue: la model card no menciona ninguna. Al ser un modulo PyTorch que se encadena con dos modelos externos, no se anuncia soporte para vLLM, llama.cpp, Ollama ni TGI; el despliegue pasaria por cargar los pesos en PyTorch de forma manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen adaptadores publicos equivalentes que conecten un world model de tipo JEPA con el tokenizer de Cosmos, por lo que no hay una comparativa directa disponible. Los elementos del ecosistema con los que se relaciona son:

| Componente | Rol | Datos disponibles |
|---|---|---|
| FactorJEPA (checkpoint `vjepa_2_1_vitg_1B`) | Modelo base que produce los tokens de futuro | No publicado en este repositorio; aproximadamente 1B de parametros segun el nombre del checkpoint |
| `nvidia/Cosmos-0.1-Tokenizer-CV4x8x8` | Tokenizer de video que define el espacio latente de destino | Publico en Hugging Face; factor de compresion 4x8x8 segun el nombre |
| Este adaptador | Puente entrenable entre ambos espacios | Licencia, parametros y metricas no disponibles |

## Limitaciones y advertencias

- El repositorio contiene unicamente el adaptador. No es utilizable de forma autonoma: requiere descargar el checkpoint de FactorJEPA y el tokenizer de Cosmos por separado.
- La licencia no esta declarada. No hay autorizacion explicita de uso comercial ni condiciones de redistribucion, por lo que su uso en produccion es juridicamente indeterminado.
- La model card no documenta el dataset de entrenamiento, el numero de tokens de video vistos ni el procedimiento de evaluacion, lo que impide valorar la generalizacion del adaptador.
- No hay cifras de benchmarks ni ejemplos cualitativos publicados, por lo que no se puede confirmar la fidelidad de la reconstruccion de latentes.
- Al depender de dos modelos congelados, cualquier cambio en la version del tokenizer de Cosmos o en el checkpoint de FactorJEPA invalidaria el adaptador.
- El sesgo heredado proviene de los datos con los que se entrenaron FactorJEPA y el tokenizer de Cosmos, no documentados en esta ficha.
- Riesgo de degradacion en dominios alejados de la distribucion de entrenamiento del world model base (escenas, resoluciones o duraciones de video distintas).
- El esquema de decodificacion exige anteponer un ancla codificada del ultimo fotograma de contexto, un detalle de implementacion que hay que respetar para obtener resultados correctos.
- El modelo no procesa texto ni ofrece capacidades de razonamiento linguistico, tool calling o agentes; no debe evaluarse con benchmarks de lenguaje.
- El repositorio ocupa 19,6 GB, lo que implica un coste de descarga y almacenamiento considerable antes de poder probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aaypom/factorjepa-cosmos-future-adapter
- Tokenizer de Cosmos referenciado: https://huggingface.co/nvidia/Cosmos-0.1-Tokenizer-CV4x8x8
- Checkpoint base de FactorJEPA (ruta indicada en la model card): `anonymousML123/factorjepa-outputs/outputs/full/vjepa_2_1_vitg_1B/train/m09c_surgery_3stage_DI_diheavy_encoder/m09c_ckpt_best.pt`
- Metricas declaradas en la model card: `metrics/best.json`
- Codigo de entrenamiento declarado: `experiments/jepa_cosmos` en el repositorio de FactorJEPA
- Paper o blog oficial: no disponible
- Demo: no disponible
