# lightx2v/RealtimeWAM

## Resumen

RealtimeWAM (Realtime World Action Model) es un modelo de accion y mundo (World Action Model, WAM) de un solo paso desarrollado por LightX2V y orientado a la generacion de acciones en tiempo real para robotica. Se construye sobre arquitecturas WAM basadas en Mixture-of-Transformers (MoT) y parte del backbone Wan-AI/Wan2.2-TI2V-5B, ademas de apoyarse en los trabajos previos Fast-WAM y Faster-WAM, de los que hereda dos variantes de checkpoints (RealtimeWAM* y RealtimeWAM†).

Su aportacion principal es la destilacion a un unico paso de inferencia combinada con inferencia asincrona, CUDA Graph y kernels eficientes. Segun el autor, mantiene menos de un 1% de caida media de precision frente a sus equivalentes multi-paso y consigue una aceleracion de extremo a extremo de 24,55x sobre Fast-WAM (12,2 ms) y 13,56x sobre Faster-WAM (16,1 ms) en una unica NVIDIA H100, incluyendo la codificacion VAE y excluyendo la codificacion de texto, que se realiza una vez por episodio.

El modelo es relevante porque ataca el cuello de botella de latencia de los world models aplicados a robotica, donde la generacion de acciones debe producirse en el bucle de control en tiempo real. Se distribuye bajo licencia Apache 2.0, pero actualmente solo publica checkpoints y codigo de inferencia y evaluacion, no de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World Action Model (WAM) basado en Mixture-of-Transformers (MoT); construido sobre Wan-AI/Wan2.2-TI2V-5B y las variantes Fast-WAM y Faster-WAM |
| Parametros totales | no disponible (el backbone base Wan2.2-TI2V-5B declara 5B parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en .pt sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt): realtimewam_libero_fast.pt, realtimewam_libero_faster.pt, realtimewam_robotwin_fast.pt, realtimewam_robotwin_faster.pt |

## Arquitectura y entrenamiento

RealtimeWAM no es un modelo de lenguaje, sino un modelo de accion y mundo para robotica. La arquitectura se apoya en un esquema MoT (Mixture-of-Transformers) sobre el backbone de generacion video Wan2.2-TI2V-5B, del que hereda la capacidad de modelar dinamicamente secuencias visuales y traducirlas en acciones. El modelo incorpora un "action expert" implementado como adaptadores LoRA, que se pueden descargar ya fusionados en los checkpoints publicados.

La innovacion tecnica central es la destilacion a un solo paso, que reduce la inferencia multi-paso tipica de los WAM a una unica evaluacion del modelo, junto con inferencia asincrona, captura mediante CUDA Graph y kernels optimizados. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se libera el codigo de entrenamiento (marcado como no disponible en la tabla TODO). La evaluacion se realiza en los entornos LIBERO, LIBERO-Plus y RoboTwin 2.0, con scripts basados en uv, CUDA 12.8 y PyTorch 2.7.1.

## Capacidades

- Generacion de acciones roboticas en un unico paso de inferencia, disenada para control en tiempo real.
- Modelado de mundo (world model): prediccion de la dinamica del entorno a partir de la observacion visual.
- Inferencia de imagen-a-video-accion (los scripts se denominan `i2va`), integrando entrada visual y salida de acciones.
- Soporte de dos variantes arquitectonicas: RealtimeWAM* sobre Fast-WAM y RealtimeWAM† sobre Faster-WAM.
- Compatibilidad con los benchmarks de robotica LIBERO, LIBERO-Plus y RoboTwin 2.0.
- Uso de LoRA adapters para el action expert, con versiones fusionadas listas para inferencia.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni dialogo multilingue.

## Casos de uso

- Manipulacion robotica simulada en LIBERO y LIBERO-Plus: el modelo genera acciones por paso con latencia de milisegundos, lo que permite cerrar el bucle de control dentro de entornos de investigacion estandarizados.
- Benchmarking de politicas de robotica en RoboTwin 2.0: sirve como baseline reproducible con checkpoints especificos para esa tarea (`realtimewam_robotwin_fast.pt` y `realtimewam_robotwin_faster.pt`).
- Control de brazos roboticos en tiempo real: la latencia de 12,2 ms (Fast-WAM) y 16,1 ms (Faster-WAM) en H100 habilita frecuencias de control cercanas a las decenas de hercios.
- Investigacion en world models: permite estudiar el compromiso entre pasos de destilacion, precision y latencia comparando las variantes one-step con sus equivalentes multi-paso.
- Generacion de datos sinteticos para entrenamiento: la componente de modelo de mundo puede emplearse para simular trayectorias y observaciones en pipelines de data augmentation.
- Transferencia sim-to-real: al operar con latencias de decenas de milisegundos, es un candidato para politicas desplegadas en hardware fisico que requieran respuesta inmediata.
- Evaluacion comparativa de aceleracion: util para medir el impacto de CUDA Graph y kernels eficientes frente a implementaciones estandar.

## Benchmarks y rendimiento

No se han publicado puntuaciones numericas completas de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son relativos, no absolutos:

| Metrica | RealtimeWAM* (Fast-WAM) | RealtimeWAM† (Faster-WAM) |
|---|---|---|
| Caida media de precision vs. multi-paso | < 1% | < 1% |
| Aceleracion extremo a extremo | 24,55x | 13,56x |
| Latencia extremo a extremo (H100, incluye VAE, excluye text encoding) | 12,2 ms | 16,1 ms |
| Benchmarks evaluados | RoboTwin 2.0, LIBERO, LIBERO-Plus | RoboTwin 2.0, LIBERO, LIBERO-Plus |

## Requisitos de hardware

- GPU de referencia empleada en las mediciones: una unica NVIDIA H100.
- Latencia reportada: 12,2 ms (Fast-WAM) y 16,1 ms (Faster-WAM), excluyendo la codificacion de texto y midiendo la latencia end-to-end con un comando especifico de los scripts (`RealtimeWAM End-to-End Latency (Excluding Text Encoding)`).
- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 48,4 GB, repartido entre cuatro checkpoints, estadisticas de dataset y demas artefactos.
- Encaje en GPU de consumo: no disponible.
- Entorno de ejecucion: entorno LightX2V, con recomendacion de usar Docker. CUDA 12.8 y PyTorch 2.7.1.
- Opciones de despliegue documentadas: scripts de inferencia de LightX2V (`run_libero_fastwam_i2va.sh`, `run_libero_fasterwam_i2va.sh`) y evaluacion con entornos uv independientes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible mas alla de la latencia por invocacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RealtimeWAM (lightx2v) | WAM one-step sobre Wan2.2-TI2V-5B | no disponible (backbone de 5B) | no disponible | Apache 2.0 | Checkpoints e inferencia/evaluacion publicados; entrenamiento no |
| Fast-WAM (yuanty/fastwam) | WAM multi-paso (variante base) | no disponible | no disponible | no disponible | Modelo base referenciado |
| Faster-WAM (hustvl/FasterWAM) | WAM (variante optimizada) | no disponible | no disponible | no disponible | Modelo base referenciado |
| Wan-AI/Wan2.2-TI2V-5B | Modelo de generacion imagen-a-video | 5B | no disponible | no disponible | Backbone base |

La comparativa se limita a los modelos citados como base, ya que la informacion proporcionada no incluye otros world action models de robotica con los que contrastar parametros, contexto o rendimiento absoluto.

## Limitaciones y advertencias

- No se libera el codigo de entrenamiento, lo que dificulta la reproducibilidad completa y el ajuste fino desde cero.
- Los checkpoints se distribuyen unicamente en formato `.pt` sin versiones cuantizadas, lo que limita el despliegue en hardware con poca VRAM.
- No hay informacion sobre sesgos del modelo ni sobre el dataset de destilacion o su composicion.
- No se documentan idiomas soportados; se trata de un modelo orientado a senal visual y acciones, no a texto multilingue.
- Riesgo de alucinacion: aplicable en la componente de world model, donde la generacion visual puede divergir de la dinamica real del entorno; el autor solo reporta la caida de precision respecto a variantes multi-paso, no la fidelidad absoluta.
- Los resultados de latencia se han medido exclusivamente en una H100 y excluyendo la codificacion de texto; en hardware inferior los tiempos pueden degradarse apreciablemente.
- El modelo se ha evaluado en entornos simulados (LIBERO, LIBERO-Plus, RoboTwin 2.0); su comportamiento en robotica fisica real no esta documentado en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un modelo muy reciente y con poca validacion externa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (Fast-WAM, Faster-WAM, Wan2.2-TI2V-5B), que aparecen como "no disponible" en este documento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightx2v/RealtimeWAM
- Checkpoint LIBERO/Fast-WAM: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/realtimewam_libero_fast.pt
- Checkpoint LIBERO/Faster-WAM: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/realtimewam_libero_faster.pt
- Checkpoint RoboTwin 2.0/Fast-WAM: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/realtimewam_robotwin_fast.pt
- Checkpoint RoboTwin 2.0/Faster-WAM: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/realtimewam_robotwin_faster.pt
- Estadisticas del dataset LIBERO: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/libero_dataset_stats.json
- Estadisticas del dataset RoboTwin: https://huggingface.co/lightx2v/RealtimeWAM/resolve/main/robotwin_dataset_stats.json
- Repositorio LightX2V: https://github.com/ModelTC/LightX2V
- Documentacion LightX2V (ingles): https://lightx2v-en.readthedocs.io/en/latest/
- Documentacion LightX2V (chino): https://lightx2v-zhcn.readthedocs.io/zh-cn/latest/
- Requisitos LIBERO: https://github.com/chengtao-lv/LightX2V/blob/main/scripts/bench/robotics/requirements_libero.txt
- Requisitos RoboTwin: https://github.com/chengtao-lv/LightX2V/blob/main/scripts/bench/robotics/requirements_robotwin.txt
- Modelo base Fast-WAM: https://huggingface.co/yuanty/fastwam
- Modelo base Faster-WAM: https://huggingface.co/hustvl/FasterWAM
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
