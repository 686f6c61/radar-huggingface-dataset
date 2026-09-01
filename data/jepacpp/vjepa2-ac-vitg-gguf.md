# jepacpp/vjepa2-ac-vitg-GGUF

## Resumen

V-JEPA 2-AC es un modelo de mundo (world model) condicionado por acciones, desarrollado por Meta AI como parte de la familia V-JEPA 2. Este repositorio concreto, publicado por jepacpp, ofrece una conversión a formato GGUF del checkpoint oficial `vjepa2-ac-vitg.pt`, diseñada para ejecutarse con el motor jepa.cpp, una implementación en C/C++ basada en ggml que permite inferencia en CPU sin dependencias de Python ni PyTorch. El modelo combina un encoder ViT-g/16 congelado y un predictor de 24 capas que, dado un frame y una acción de 7 dimensiones junto con una pose de 7 dimensiones, predice los latentes del siguiente frame de forma block-causal. Con 1.317.387.776 parámetros, está pensado para planificación de robots con cero disparos en entornos nuevos, puntuando secuencias de acciones candidatas mediante una energía de planificación L1.

La relevancia actual radica en que es uno de los primeros modelos de mundo de gran escala que demuestra control robótico sin entrenamiento específico por tarea ni calibración, y esta conversión GGUF lo hace accesible para despliegue en hardware modesto, incluso CPU. El bundle incluye el encoder propio del checkpoint, que difiere ligeramente (coseno ~0.998 por tensor) de la versión publicada en HuggingFace como `facebook/vjepa2-vitg-fpc64-256`, pero es bit-idéntico entre sus copias `encoder` y `target_encoder`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-g/16 (encoder) + predictor de 24 capas, 1024 dims |
| Parametros totales | 1.317.387.776 (1317 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de video, no texto) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (ademas q4_1, q5_0, q5_1, q5_k, q6_k generables localmente) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no incluido; el repo solo contiene GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura V-JEPA 2: un encoder ViT-g/16 con 40 capas, 22 cabezas de atencion, dimension oculta 1408, patch de 16x16 y tubelet de 2 frames, procesando video a resolucion 256x256. Sobre este encoder congelado, se entrena un predictor de 24 capas con dimension 1024 que opera de forma block-causal sobre los frames: dado el frame actual, una accion de 7 dimensiones (por ejemplo, posicion y orientacion del efector final) y una pose de 7 dimensiones por frame, predice los latentes del siguiente frame. El entrenamiento es auto-supervisado, combinando video a escala de internet con una pequena cantidad de datos de trayectorias roboticas. No se aplican tecnicas de RLHF ni DPO; la optimizacion se basa en una funcion de energia L1 que un planificador CEM minimiza para seleccionar la mejor secuencia de acciones. El checkpoint original proviene de `dl.fbaipublicfiles.com/vjepa2/vjepa2-ac-vitg.pt` y la conversion a GGUF preserva la topologia completa, incluyendo esquema posicional, receta de preprocesado y etiquetas de clase.

## Capacidades

- Prediccion de latentes de video: dado un frame y una accion, genera los latentes del siguiente frame, permitiendo simulacion de trayectorias.
- Planificacion de acciones para robotica: el comando `jepa_ac_rollout` puntua K secuencias de acciones candidatas en un unico grafo por paso, y `jepa_ac_energy` calcula la energia de planificacion L1 que un planificador CEM minimiza.
- Control de robots con cero disparos: resuelve tareas de manipulacion sin recopilacion de datos especifica del entorno ni entrenamiento por tarea.
- Soporte de multiples candidatos: K secuencias de acciones se procesan en el eje de batch del grafo, siendo bit-identicas a K rollouts secuenciales.
- Seleccion de pooling: `--pool` permite elegir entre `mean`, `cls`, `lewm` o `none` (mapa de tokens completo) para la representacion de cada frame.
- Inferencia en CPU: gracias a jepa.cpp, el modelo se ejecuta en hardware sin GPU, con un unico binario y un unico archivo GGUF.

## Casos de uso

- Planificacion de manipulacion robotica en entornos nuevos: el modelo puntua secuencias de acciones candidatas y selecciona la que minimiza la energia de planificacion, permitiendo a un robot realizar tareas como apilar objetos o abrir cajones sin entrenamiento previo en ese escenario.
- Simulacion de trayectorias para evaluacion de politicas: antes de ejecutar una politica en el robot real, se pueden generar rollouts de latentes para verificar que la secuencia de acciones es plausible y no colisiona con obstaculos.
- Seleccion de acciones en bucle cerrado: en un sistema de control, cada paso se codifica el frame actual, se generan K acciones candidatas, se puntuan y se ejecuta la mejor, repitiendo el proceso en tiempo real.
- Generacion de datos sinteticos para entrenamiento de politicas: los latentes predichos pueden usarse como aumentacion de datos para entrenar politicas de aprendizaje por refuerzo en simulacion.
- Benchmarking de modelos de mundo: al ser una implementacion en CPU, permite comparar la calidad de prediccion de V-JEPA 2-AC frente a otros world models sin necesidad de infraestructura GPU.
- Investigacion en robotica de cero disparos: el modelo sirve como base para estudiar como la auto-supervision en video mas una pequena cantidad de datos de interaccion permite generalizar a nuevas tareas y entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ya que es un modelo de video y robotica, no de lenguaje o codigo. Los unicos datos medidos son de paridad y cuantizacion: a f16, el peor token predicho en un rollout de 2 pasos tiene coseno 0.9925; a q8_0 baja a 0.9368; a q4_k a 0.5429, y en GPU a q4_k la energia de planificacion puede clasificar incorrectamente los candidatos. A f32 en CPU, el predictor es exacto con coseno 1.0000000 frente al dump del modelo de Meta.

## Requisitos de hardware

- VRAM estimada: f32 requiere ~5 GB, f16 ~2.5 GB, q8_0 ~1.3 GB, q4_0/q4_k ~0.7 GB. En CPU, la RAM debe cubrir el archivo completo mas overhead.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para cuantizaciones q4; para f16 se recomienda una GPU de 4 GB o mas (por ejemplo, RTX 3050, RTX 3060, A100). El motor jepa.cpp tambien soporta backend CPU puro.
- Cabe en GPUs de consumo: si, las versiones q8_0 y q4_0 caben en GPUs integradas o discretas de gama baja (por ejemplo, GTX 1650 con 4 GB).
- Opciones de despliegue: jepa.cpp (compilado con CMake), con binarios `jepa-worldmodel` y `jepa-quantize`. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un motor especifico para este tipo de modelos.
- Latencia y throughput: no se proporcionan cifras concretas. La model card indica que la inferencia en CPU con 32 hilos es viable, pero no da tiempos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de mundo en la informacion proporcionada. Como referencia, el modelo original de Meta (V-JEPA 2) esta disponible en PyTorch y en HuggingFace Transformers, pero no en formato GGUF. Otros world models como VideoGPT o IRIS no tienen una conversion GGUF publica comparable. Por tanto, la comparativa directa no esta disponible.

## Limitaciones y advertencias

- Las cuantizaciones por debajo de 8 bits (q4_0, q4_k) no son configuraciones de paridad: en rollouts multi-paso, el error de prediccion se compone y puede llevar a seleccionar acciones incorrectas, especialmente en GPU.
- El modelo solo procesa video y acciones; no tiene capacidades de lenguaje, por lo que no es util para tareas de texto o generacion de codigo.
- No se especifican idiomas soportados, ya que no hay componente textual.
- El encoder incluido difiere ligeramente del publicado en HuggingFace como `facebook/vjepa2-vitg-fpc64-256` (coseno ~0.998 por tensor), por lo que no es intercambiable con otros checkpoints de V-JEPA 2.
- La licencia MIT permite uso comercial, pero el modelo deriva de investigacion de Meta; se recomienda revisar los terminos del checkpoint original.
- No hay datos sobre sesgos o alucinaciones, pero al ser un modelo entrenado con video de internet, podria reflejar sesgos visuales de los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jepacpp/vjepa2-ac-vitg-GGUF
- Repositorio jepa.cpp: https://github.com/aselimc/jepa.cpp
- Paper V-JEPA 2: https://arxiv.org/abs/2506.09985
- Blog de Meta AI: https://ai.meta.com/research/vjepa/
- Documentacion de jepa.cpp (paridad, cuantizacion, rendimiento): https://aselimc.github.io/jepa.cpp/
- Checkpoint original: https://dl.fbaipublicfiles.com/vjepa2/vjepa2-ac-vitg.pt
- Repositorio oficial de V-JEPA 2 (PyTorch): https://github.com/facebookresearch/vjepa2
- Documentacion de Transformers para V-JEPA 2: https://huggingface.co/docs/transformers/model_doc/vjepa2
