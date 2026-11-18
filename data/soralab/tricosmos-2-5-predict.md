# SORALab/TriCosmos-2.5-predict

## Resumen

TriCosmos-2.5-predict es un modelo del mundo (world model) orientado a conduccion autonoma desarrollado por SORALab. Partiendo del modelo base NVIDIA Cosmos-Predict2.5-2B, se ha ajustado mediante LoRA para predecir de forma conjunta tres modalidades de sensor: RGB, termico e imagen de profundidad derivada de LiDAR. Dado un historial de 5 fotogramas observados (0,5 s a 10 Hz), el modelo genera los 20 fotogramas siguientes (2 s) de los tres sensores simultaneamente.

La innovacion principal es el tratamiento de los tres sensores como un unico video: las imagenes se disponen en una rejilla 2x2 de teselas (una por sensor) y el modelo de difusion video las procesa como si fueran fotogramas de una misma secuencia. Esto permite reutilizar directamente la arquitectura image-to-video de Cosmos-Predict2.5-2B sin modificar el backbone, anadiendo solo adaptadores LoRA entrenados sobre datos reales de conduccion con sensores sincronizados del dataset DSERT-RoLL.

El modelo es relevante porque aborda la prediccion multimodal en condiciones meteorologicas adversas (niebla, lluvia, nieve y noche), un escenario donde los modelos de mundo unimodales suelen degradarse. Su publicacion coincide con un articulo en revision (arXiv:2604.03685) y con la liberacion de pesos en bf16 y fp32, aunque el codigo completo de entrenamiento y evaluacion se anuncia para mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion video image-to-video (base Cosmos-Predict2.5-2B) con adaptadores LoRA |
| Parametros totales | 2B (modelo base); parametros LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 fotogramas de entrada (0,5 s a 10 Hz); prediccion de 20 fotogramas (2 s) |
| Tipos de cuantizacion | bf16 (inferencia, 3,9 GB); fp32 (fine-tuning, ~7,8 GB); no se documentan GGUF ni otras |
| Idiomas soportados | no disponible (modelo multimodal video; el prompt textual se procesa con el text encoder de Cosmos-Predict2.5) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | `.pt` (PyTorch); checkpoint `tricosmos_ema_bf16.pt`; variantes en Kaggle `inference-bf16` y `finetune-fp32` |

## Arquitectura y entrenamiento

TriCosmos-2.5-predict se construye sobre Cosmos-Predict2.5-2B, un modelo de difusion para generacion y prediccion de video. El ajuste se realiza con LoRA sobre el modelo post-entrenado, manteniendo congelado el backbone y el text encoder. La clave arquitectonica es la representacion de los tres sensores como una rejilla 2x2 dentro de un unico video: cada fotograma del video de entrada contiene las teselas RGB, termica, LiDAR y una cuarta posicion de la rejilla, de modo que el modelo de difusion aprende correlaciones cruzadas entre modalidades sin necesidad de cabezas separadas.

El entrenamiento utiliza el dataset DSERT-RoLL, compuesto por datos reales de conduccion con RGB, termico y LiDAR sincronizados, e incluye escenarios de niebla, lluvia, nieve y noche. El checkpoint publicado corresponde al paso de entrenamiento 500 con pesos EMA en bf16. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor indica que el codigo completo de entrenamiento y evaluacion se liberara junto con el articulo.

## Capacidades

- Prediccion conjunta de video RGB, imagen termica y profundidad LiDAR a partir de 5 fotogramas observados.
- Generacion de 20 fotogramas futuros (2 s) coherentes temporalmente en las tres modalidades.
- Funcionamiento en condiciones adversas: niebla, lluvia, nieve y escenas nocturnas.
- Acepta prompts textuales procesados por el text encoder de Cosmos-Predict2.5 para condicionar la prediccion.
- Modo zero-shot disponible usando el modelo base sin LoRA para comparacion.
- Salida a 1280x704 con 35 pasos de muestreo, guidance 7 y semilla configurable.
- No se documentan capacidades de tool calling, agentes, audio ni razonamiento multi-step.

## Casos de uso

- Prediccion de escenas para planificacion en conduccion autonoma: el modelo genera 2 s de futuro multimodal que un planificador puede usar para anticipar obstaculos y trayectorias, con informacion termica y de profundidad adicional a la RGB.
- Validacion de perception stacks en condiciones adversas: permite sintetizar futuros plausibles en niebla, lluvia o noche para comprobar si los detectores mantienen rendimiento cuando la visibilidad cae.
- Aumento de datos para entrenamiento de detectores termicos: las predicciones termicas permiten generar pares RGB-termico sinteticos en escenarios nocturnos donde la recoleccion real es costosa.
- Simulacion de sensores LiDAR en bucle cerrado: la profundidad predicha puede alimentar modulos de evitacion de obstaculos o de odometria visual en entornos simulados.
- Evaluacion de robustez de world models: sirve como referencia para medir cuanto degrada un modelo base zero-shot frente a un ajuste especifico en dominios adversos.
- Investigacion en fusion multimodal: la representacion en rejilla 2x2 es un punto de partida para estudiar como un modelo de difusion aprende correlaciones entre sensores heterogeneos.
- Generacion de videos de validacion para herramientas de anotacion: los clips predichos con ground truth asociado facilitan la revision humana de escenarios criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, PSNR, LPIPS, mIoU u otros) en la informacion disponible. La model card menciona resultados cualitativos mediante videos comparativos lado a lado entre la entrada, el futuro real, TriCosmos y Cosmos-Predict2.5 zero-shot, pero no incluye tablas numericas.

## Requisitos de hardware

- VRAM minima de 48 GB para inferencia en bf16, ya que el modelo de 2B se ejecuta junto al text encoder y el tokenizer de video de Cosmos-Predict2.5 a 1280x704.
- GPU probadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, runtime G4 de Colab), NVIDIA H100 (80 GB) y NVIDIA A100 80 GB (usada para los resultados del articulo).
- No cabe en GPUs de consumo: Colab A100 (40 GB), L4 (22,5 GB) y T4 (15 GB) se indican como insuficientes.
- Despliegue mediante el repositorio oficial `nvidia-cosmos/cosmos-predict2.5` (commit a2c298b), con entorno `uv` y Python 3.10, extra `cu128`.
- Notebook de inferencia para Google Colab disponible en el repositorio.
- No se documentan latencia ni throughput estimados; cada ejecucion produce un unico forecast con 35 pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriCosmos-2.5-predict | 2B (base) + LoRA | 5 fotogramas -> 20 fotogramas | RGB, termico, LiDAR | nvidia-open-model-license | Hugging Face y Kaggle |
| NVIDIA Cosmos-Predict2.5-2B | 2B | image-to-video | RGB | nvidia-open-model-license | Hugging Face (gated) |
| Otros world models para conduccion | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especificas de prediccion multimodal en conduccion no esta disponible en la informacion proporcionada. El unico contraste documentado es frente al modelo base zero-shot, que se incluye como referencia cualitativa en el notebook.

## Limitaciones y advertencias

- Requiere aceptar la licencia de NVIDIA Cosmos-Predict2.5-2B y disponer de acceso a sus repositorios gated para cargar tokenizer y text encoder.
- Consumo de memoria elevado: no es viable en GPUs de menos de 48 GB, lo que excluye hardware de consumo.
- El checkpoint publicado corresponde solo al paso 500 de entrenamiento; el autor no garantiza que sea el optimo final.
- El codigo de entrenamiento y evaluacion aun no esta disponible; solo se libera la inferencia y la receta de entrenamiento en YAML.
- Entrenado exclusivamente sobre DSERT-RoLL; el rendimiento fuera de ese dominio (otras camaras, otras ciudades, otros montajes de sensores) no esta validado.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad; al ser un modelo generativo de video, puede producir futuros plausibles pero fisicamente incorrectos.
- La licencia nvidia-open-model-license impone condiciones adicionales para uso comercial; es necesario revisar sus terminos antes de desplegar en produccion.
- No se especifican idiomas soportados ni evaluacion multilingue del prompt textual.

## Enlaces

- Hugging Face: https://huggingface.co/SORALab/TriCosmos-2.5-predict
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Kaggle: https://www.kaggle.com/models/mahfuzurmahimrahman/tricosmos-2.5-predict
- Repositorio de codigo Cosmos: https://github.com/nvidia-cosmos/cosmos-predict2.5
- Articulo DSERT-RoLL: https://arxiv.org/abs/2604.03685
- Dataset: https://huggingface.co/datasets/jeongyh98/DSERT-RoLL
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
