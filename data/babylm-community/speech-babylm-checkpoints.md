# BabyLM-community/Speech-BabyLM-Checkpoints

## Resumen

Speech-BabyLM-Checkpoints no es un modelo entrenado por su publicador, sino un repositorio espejo que aloja los pesos de tres modelos de voz de terceros empleados para evaluacion zero-shot (ABX y BabySLM) en el proyecto Speech BabyLM. El objetivo es puramente practico: servir esos checkpoints a traves de `huggingface_hub` en lugar de depender de hosts originales menos fiables, como enlaces de Google Drive o servidores de descarga de Meta. El repositorio lo mantiene la organizacion BabyLM-community y esta publicado bajo licencia MIT.

Los tres artefactos incluidos son: un checkpoint de CPC (Contrastive Predictive Coding) para representaciones de audio, un checkpoint de MelHuBERT con marcos de 20 ms (entrenado sobre 960 horas) y un fichero de k-means con 500 unidades calculado sobre la capa 11 de mHuBERT-base-25Hz, el tokenizador de voz usado por TWIST y Slam. El repositorio ocupa aproximadamente 0,4 GB y no incluye tarjeta de modelo con especificaciones de arquitectura, datos de entrenamiento ni resultados de evaluacion.

Es relevante ahora para quienes replican experimentos de adquisicion del lenguaje en el habla (Speech BabyLM) y necesitan un punto de descarga estable y reproducible de estos checkpoints. No obstante, no debe confundirse con un modelo generativo: no hay pipeline, no hay tokenizador de texto ni cabezas de lenguaje, y no se ofrece inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio espejo de tres checkpoints: CPC, MelHuBERT y k-means sobre mHuBERT-base-25Hz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (CPC y MelHuBERT); binario joblib/pickle de scikit-learn `MiniBatchKMeans` (k-means) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Contiene tres artefactos independientes. El primero es CPC, en concreto el checkpoint `cpc_checkpoint_106` de CPC_audio de Meta, convertido a safetensors conservando solo el state dict de `gEncoder` con todos los tensores sin modificar y descartando el estado del optimizador y los argumentos de entrenamiento. El segundo es MelHuBERT en su variante de marcos de 20 ms (`melhubert_960_stage2_20ms`), entrenado sobre 960 horas de audio segun la nomenclatura del checkpoint; igualmente se conserva unicamente el state dict de `model` en safetensors, sin estado de optimizador.

El tercer artefacto es un fichero de k-means con 500 unidades calculado sobre la capa 11 de mHuBERT-base-25Hz, el tokenizador de voz de TWIST y Slam, distribuido sin cambios respecto al original y serializado como `MiniBatchKMeans` de scikit-learn mediante joblib. Este fichero se carga con `slamkit` y actua como discretizador de representaciones continuas en unidades discretas. No se documentan en la informacion disponible detalles sobre composicion del dataset, numero de tokens de audio, objetivos de entrenamiento especificos ni uso de RLHF o DPO.

## Capacidades

- Extraccion de representaciones de audio auto-supervisadas con CPC, util para tareas de discriminacion fonetica y evaluacion ABX.
- Extraccion de representaciones con MelHuBERT en marcos de 20 ms, orientada a evaluacion zero-shot de unidades linguisticas.
- Discretizacion de representaciones de mHuBERT-base-25Hz en 500 unidades mediante el k-means incluido, para pipelines de tokenizacion de voz.
- Evaluacion ABX (discriminacion de fonemas) y BabySLM (modelado de lenguaje sobre unidades) en el marco del proyecto Speech BabyLM.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision ni audio generativo.
- No soporta tool calling, function calling ni comportamiento agentico.
- No dispone de capacidades multilingues documentadas en el repositorio.

## Casos de uso

- Replicacion de experimentos Speech BabyLM: descargar los tres checkpoints con `huggingface_hub` y ejecutar las evaluaciones ABX y BabySLM con versiones fijas de los pesos, garantizando reproducibilidad frente a los hosts originales.
- Evaluacion zero-shot de representaciones de voz: usar CPC o MelHuBERT como extractores congelados de features y medir su calidad en tareas de discriminacion fonetica sin reentrenamiento.
- Construccion de un tokenizador de voz discreto: cargar el k-means de 500 unidades con `slamkit` y aplicarlo sobre las representaciones de la capa 11 de mHuBERT-base-25Hz para obtener secuencias de unidades discretas.
- Baseline en investigacion de adquisicion del lenguaje: comparar el rendimiento de estos modelos auto-supervisados frente a modelos entrenados con cantidades limitadas de habla, en el espiritu del benchmark BabyLM.
- Integracion en pipelines de evaluacion CI: al estar en safetensors y servirse por HTTP desde Hugging Face, se pueden cachear y validar por hash en entornos automatizados, evitando descargas manuales desde Google Drive.
- Estudio de tokenizadores para modelos de voz tipo TWIST o Slam: reutilizar el fichero k-means original sin modificaciones para mantener compatibilidad exacta con `slamkit` y con los pipelines que lo consumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0,4 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer, pero no se documenta el coste de inferencia de cada checkpoint.
- GPU recomendadas: no disponible. Por el tamano de los checkpoints, una GPU consumer con 8 GB o menos seria suficiente para cargar los pesos, aunque la memoria necesaria para procesar audio depende de la longitud de las secuencias y no esta documentada.
- Cabe en GPU consumer: si, a tenor del tamano del repositorio (0,4 GB), aunque no hay confirmacion oficial de requisitos por modelo.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y `huggingface_hub.hf_hub_download`; el k-means requiere `joblib` y `scikit-learn`, y se consume con `slamkit`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos checkpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speech-BabyLM-Checkpoints | Repositorio espejo de CPC, MelHuBERT y k-means | no disponible | no disponible | MIT | Hugging Face (este repo) |
| CPC_audio (original) | Modelo auto-supervisado de audio | no disponible | no disponible | no disponible en la informacion | GitHub de Meta |
| MelHuBERT (original) | Modelo auto-supervisado de audio | no disponible | no disponible | no disponible en la informacion | GitHub de nervjack2 |
| mHuBERT-base-25Hz | Modelo de voz auto-supervisado | no disponible | no disponible | no disponible en la informacion | Hugging Face (slprl) |

## Limitaciones y advertencias

- No es un modelo entrenado por el publicador: es un espejo de terceros, por lo que los fallos o sesgos de los originales se heredan sin cambios.
- El fichero k-means se distribuye como pickle de joblib; cargar pickles de origenes no verificados conlleva riesgo de ejecucion de codigo, aunque aqui se conserve el SHA-256 original.
- No hay model card con sesgos, datos de entrenamiento ni evaluaciones; no se puede auditar la composicion del corpus a partir de este repositorio.
- No dispone de pipeline ni de tokenizador de texto: no sirve para generacion de lenguaje, y su uso esta limitado a extraccion de representaciones y evaluacion.
- La cobertura linguistica no esta documentada; los modelos originales se entrenaron sobre corpus de habla concretos (por ejemplo, 960 horas en MelHuBERT) cuya composicion no se detalla aqui.
- Licencia MIT declarada en el repositorio, pero cada carpeta conserva la licencia de su proyecto original; conviene verificar la licencia de cada checkpoint antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Los hashes SHA-256 del README aparecen truncados, lo que dificulta la verificacion integra de los ficheros a partir de la documentacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BabyLM-community/Speech-BabyLM-Checkpoints
- CPC_audio (Meta): https://github.com/facebookresearch/CPC_audio
- MelHuBERT: https://github.com/nervjack2/MelHuBERT
- mHuBERT-base-25Hz: https://huggingface.co/slprl/mhubert-base-25hz
- Coleccion Slam: https://huggingface.co/collections/slprl/slam
- textlesslib (Meta): https://github.com/facebookresearch/textlesslib
- slamkit: https://github.com/slp-rl/slamkit
