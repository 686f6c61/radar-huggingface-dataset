# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_VLA-JEPA-OfficialLR-Causal-bs16-step10000

## Resumen

VLA-JEPA Official-LR Causal es un checkpoint de inferencia para robótica publicado por el usuario Dongkkka en HuggingFace, dentro del ecosistema LeRobot (librería 0.6.1). Se trata de un modelo de visión-lenguaje-acción (VLA) entrenado específicamente para la tarea Task 000004 de tipo *peanut pick-and-place*, es decir, recoger y colocar cacahuetes con un brazo robótico. El modelo combina un backbone Qwen entrenable con una cabeza de acciones (action head) y un predictor de modelo del mundo (world model) con contexto causal, todo bajo la arquitectura denominada VLA-JEPA. El checkpoint corresponde al paso de entrenamiento 10.000.

El modelo cuenta con aproximadamente 2.770 millones de parámetros (2,77B) y un repositorio de 6,2 GB en formato safetensors. Se entrenó sobre el dataset Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern, que contiene 29 episodios de entrenamiento y seis episodios de validación reservados (8, 12, 19, 26, 30 y 34). Las dimensiones de estado y acción son 22 y 22 respectivamente, con tres cámaras de entrada (cabeza, muñeca izquierda y muñeca derecha) y un *action chunk* de 7 acciones ejecutadas.

Su relevancia radica en que es un ejemplo de checkpoint VLA abierto orientado a manipulación robótica con fusión multi-vista y modelado predictivo del entorno. Al tratarse de un artefacto experimental asociado a una tarea concreta y a un pipeline de investigación, no está pensado como modelo de propósito general ni cuenta con datos públicos de rendimiento o licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (vision-lenguaje-accion) con backbone Qwen entrenable, action head y world model con contexto causal |
| Parametros totales | 2.770.374.550 (~2,77 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizacion declarada) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (0.6.1) |
| Pipeline | robotics |
| Tamano del repositorio | 6,2 GB |
| Paso de entrenamiento | 10.000 |
| Camaras de entrada | head, left wrist, right wrist |
| Dimensiones estado / accion | 22 / 22 |
| Action chunk / acciones ejecutadas | 7 / 7 |

## Arquitectura y entrenamiento

El modelo sigue la familia VLA-JEPA, que combina un modelo de lenguaje-visión preentrenado (en este caso un backbone Qwen que permanece entrenable, con `freeze_qwen=false`) con una cabeza de predicción de acciones y un predictor de modelo del mundo. El world model se activa con contexto causal, lo que sugiere que el modelo aprende a predecir representaciones futuras del entorno para guiar la generación de acciones. La fusión multi-vista se ha corregido explícitamente en esta versión (*corrected multi-view batch merge*), integrando las tres cámaras del robot en un único lote de entrenamiento.

El entrenamiento se realizó sobre 29 episodios del dataset de *peanut pick-and-place*, con un batch size de 16 y un único grupo de optimizador AdamW compartido por el backbone Qwen entrenable, la action head y el predictor del world model. Los hiperparámetros incluyen un LR máximo de 1e-4, betas (0.9, 0.95), weight decay de 1e-8, recorte de gradiente de 1.0, warmup de 5.000 pasos y decaimiento coseno hasta 30.000 pasos con LR final de 1e-6. El repositorio contiene únicamente archivos de inferencia; no se subieron el optimizador, el scheduler ni el estado del RNG, y se recomienda usar los procesadores guardados con esta build Cyclo LeRobot VLA-JEPA.

## Capacidades

- Manipulacion robotica de tipo pick-and-place: el modelo genera secuencias de acciones para recoger y colocar objetos (cacahuetes) en la tarea Task 000004.
- Percepcion multi-vista: procesa de forma conjunta imagenes de camara de cabeza, muñeca izquierda y muñeca derecha.
- Prediccion de acciones por chunks: produce bloques de 7 acciones, ejecutadas en su totalidad (action chunk = 7, executed = 7).
- Modelado predictivo del entorno: incorpora un world model con contexto causal que modela la dinamica de la escena.
- Control con estado proprioceptivo: consume un vector de estado de 22 dimensiones y emite acciones de 22 dimensiones.
- Inferencia integrada en LeRobot: disenado para ejecutarse dentro de la libreria LeRobot 0.6.1 con sus procesadores asociados.
- No se dispone de informacion sobre capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues.

## Casos de uso

- Automatizacion de pick-and-place industrial: el modelo puede controlar un brazo robotico para recoger piezas y depositarlas en una ubicacion designada, usando las tres camaras para localizar el objeto y planificar la accion.
- Investigacion en modelos VLA: sirve como punto de partida reproducible (paso 10.000, hiperparametros documentados) para experimentos academicos sobre fusion visio-lenguaje-accion.
- Comparacion de arquitecturas con world model: permite estudiar la contribucion del predictor de modelo del mundo con contexto causal frente a variantes sin el.
- Evaluacion de fusion multi-vista: util para medir como afecta la correccion del merge multi-vista al exito de la tarea en los episodios de validacion reservados.
- Benchmarking de checkpoints LeRobot: al ser un checkpoint intermedio (step 10.000) con validacion definida, permite trazar curvas de aprendizaje en funcion del paso de entrenamiento.
- Prototipado en laboratorio robotico: integrable con un setup LeRobot real para validar politicas de manipulacion antes de escalar a tareas mayores.
- Docencia en robotica de aprendizaje: ejemplo concreto de pipeline completo (dataset, optimizador, world model) para cursos de imitation learning y VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2,77B parametros, en precision FP16/BF16 se requieren aproximadamente 5,5-6 GB solo para los pesos; con estados de activacion y procesamiento multi-camara conviene reservar entre 8 y 12 GB.
- Cuantizacion: no se declaran versiones cuantizadas (GGUF, AWQ, GPTQ); solo se distribuyen pesos safetensors sin cuantizar.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia; A100 o H100 para entrenamiento o lotes grandes.
- Cabida en GPU de consumo: si, previsiblemente cabe en GPUs de consumo con al menos 8-12 GB de VRAM en BF16, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: LeRobot 0.6.1 es la libreria indicada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan en la informacion modelos comparables de la misma categoria (p. ej. OpenVLA, pi0 u otras politicas VLA) con datos que permitan una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado unicamente para Task 000004 (peanut pick-and-place); no es un modelo generalista y su uso fuera de esa tarea no esta garantizado.
- Dataset reducido: solo 29 episodios de entrenamiento, lo que limita la generalizacion y aumenta el riesgo de sobreajuste al entorno concreto.
- Licencia no declarada: al no indicarse licencia, no se puede confirmar el uso comercial ni las condiciones de redistribucion; se debe contactar con el autor antes de cualquier uso en produccion.
- Idiomas y contexto: no se declara soporte idiomatico ni longitud de contexto; al ser un modelo de robotica, esas metricas no aplican del mismo modo que en modelos de lenguaje.
- Riesgo de alucinacion y fallos de accion: los modelos VLA pueden generar acciones incorrectas o inseguras ante condiciones no vistas; requiere supervision y limites de seguridad fisicos en un robot real.
- Repositorio de solo inferencia: no incluye optimizador, scheduler ni estado de RNG, por lo que no es directamente reanudable para continuar el entrenamiento.
- Sin benchmarks publicos: no hay evidencia cuantitativa de tasa de exito, lo que dificulta evaluar su rendimiento.
- Compatibilidad acoplada: requiere los procesadores guardados y la build Cyclo LeRobot VLA-JEPA especifica; puede no funcionar con otras versiones de LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_VLA-JEPA-OfficialLR-Causal-bs16-step10000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Autor: https://huggingface.co/Dongkkka
