# Myungkyu/rldx_1_rmbench_preset_b128_60k

## Resumen

`rldx_1_rmbench_preset_b128_60k` es un fine-tune del modelo de robótica RLDX-1-PT, desarrollado por Myungkyu sobre la arquitectura Vision-Language-Action (VLA) de RLWRLD. El objetivo es especializar el modelo en nueve tareas simuladas de manipulación en mesa del benchmark RMBench, utilizando demostraciones con etiquetas densas de subtarea. El modelo actúa como una política de bajo nivel: recibe imágenes de tres cámaras (cabeza y dos muñecas), propriocepción y el texto de la subtarea actual, y genera acciones robóticas.

El modelo base RLDX-1-PT incorpora el Multi-Stream Action Transformer (MSAT), que añade capacidades de conciencia de movimiento, memoria a largo plazo y sensación física a las capacidades de visión-lenguaje de un VLM preentrenado. Este checkpoint final se entrenó con un batch de optimización de 128 y 60 000 pasos, incluyendo una ranura de keyframe que puede recuperar un fotograma pasado cuando la etiqueta lo requiere. Con 6 912 896 320 parámetros y pesos en safetensors (13,8 GB), está pensado para investigación en manipulación diestra y simulación de tareas de mesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en Transformer con Multi-Stream Action Transformer (MSAT) |
| Parametros totales | 6 912 896 320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de video de 4 frames y texto de subtarea) |
| Tipos de cuantizacion | no disponible (pesos en FP16/FP32 en safetensors) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (13,8 GB) |
| Pipeline | robotics |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de fine-tuning | Myungkyu/RMBench-preset-gemini |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `RLWRLD/RLDX-1-PT`, una arquitectura Vision-Language-Action que combina un backbone de vision-lenguaje preentrenado con un decodificador de acciones. La variante usada en RLDX-1 es el Multi-Stream Action Transformer (MSAT), que procesa en paralelo flujos de información de vision, lenguaje y estado para producir movimientos diestros. En este checkpoint concreto, la entrada de vision consta de cuatro fotogramas de video procedentes de tres vistas de camara (cabeza, muñeca izquierda y muñeca derecha), mas una ranura adicional de keyframe que puede recibir un fotograma pasado recuperado.

El entrenamiento se ha realizado sobre el dataset `Myungkyu/RMBench-preset-gemini`, que contiene demostraciones de RMBench con etiquetas densas de subtarea. El proceso de ajuste utilizo un batch de optimizacion de 128 y un total de 60 000 pasos, guardandose el checkpoint final. No se detalla si hubo fase de RLHF o DPO. La configuracion de referencia del modelo base y el tokenizador se apunta por identificador de hub o ruta local durante el entrenamiento, por lo que es necesario indicar las rutas locales al cargar el modelo.

## Capacidades

- Generacion de acciones de bajo nivel para tareas roboticas de mesa simuladas.
- Comprension de instrucciones textuales de subtarea (por ejemplo, "levantar el cubo", "abrir el cajon").
- Integracion de informacion visual multimodo: tres camaras simultaneas (cabeza y dos muñecas) y keyframe recuperado.
- Entrada de propriocepcion para el estado del robot.
- Ejecucion de nueve tareas de manipulacion en el entorno RMBench.
- Capacidades de razonamiento espacial y coordinacion bimanual heredadas del modelo base RLDX-1-PT.

## Casos de uso

- Investigacion en manipulacion bimanual: el modelo sirve como politica de bajo nivel para experimentos con robots de dos brazos en entornos simulados de mesa, permitiendo validar estrategias de control y transferencia.
- Benchmarking y comparativa de políticas: al estar especializado en RMBench, puede utilizarse para comparar métricas de exito y precision de acciones frente a otros fine-tunes de VLA.
- Desarrollo de pipelines de aprendizaje por refuerzo: la politica de bajo nivel puede servir como inicializacion para RL, dado que ya produce acciones finas a partir de observaciones visuales y subtareas.
- Estudio de memoria visual en tareas de manipulacion: la ranura de keyframe permite investigar como el uso de fotogramas pasados afecta al rendimiento cuando una tarea requiere recordar estados anteriores.
- Simulacion de robots y validacion de software de control: el modelo puede integrarse en entornos de simulacion como MuJoCo o Isaac Sim para probar controladores sin necesidad de hardware real.
- Prototipado de interaccion natural: al aceptar texto de subtarea, permite crear interfaces en las que un operador humano describe el paso actual y el robot lo ejecuta, util para teleoperacion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este checkpoint en la informacion disponible. El repositorio de HuggingFace no incluye metricas de exito, precision de acciones ni comparativas con otros modelos. Cualquier evaluacion en RMBench deberia realizarse de forma independiente siguiendo el protocolo del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14 GB solo para los pesos; se recomienda una GPU con 24 GB o mas para acomodar el modelo, activaciones y video entrante. En cuantizacion 4-bit podria reducirse a 8-10 GB, pero no se han publicado cuantizaciones compatibles en el repositorio.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100 (80 GB) para inferencia en batch grande. Una A10G de 24 GB puede funcionar para un solo flujo de inferencia.
- No se ha validado su ejecucion en GPUs de consumo con menos de 16 GB de VRAM sin cuantizacion adicional.
- Opciones de despliegue: no disponible. Al ser un VLA especializado, no es un modelo de lenguaje puro y no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un framework de inferencia para VLA, como el repositorio oficial de RLDX-1, o un script personalizado basado en PyTorch/Transformers que procese video y texto en paralelo.
- La latencia no se ha publicado. Dependera de la resolucion de las imagenes, el numero de frames y el hardware utilizado.

## Comparativa con modelos similares

No se han publicado datos suficientes para una comparativa cuantitativa con otros modelos. Como referencia cualitativa, el modelo base RLDX-1-PT (6,9 B de parametros) se situa en la misma categoria que otros VLAs como OpenVLA (7 B) o RT-2, pero este checkpoint esta orientado a tareas de mesa simuladas concretas y no a manipulacion generalista. La falta de benchmarks publicos y de una licencia explicita hace imposible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final optimizado para produccion; el autor indica que es el "final checkpoint" de un proceso con 60 000 pasos.
- La configuracion del modelo base y el tokenizador se referencia por rutas locales del centro de entrenamiento; antes de cargar el modelo hay que ajustar esas rutas a copias locales.
- La licencia no esta disponible, lo que implica restricciones legales inciertas para cualquier uso comercial.
- No se han publicado cuantizaciones, por lo que el despliegue en hardware con VRAM limitada es complejo.
- La utilizacion de un unico slot de keyframe y una ventana de video de 4 frames limita la capacidad de memoria a largo plazo en comparacion con el RLDX-1 base, que tiene una funcionalidad de memoria mas amplia.
- El modelo esta especializado en 9 tareas simuladas de mesa; su capacidad de generalizacion a entornos reales no ha sido documentada.
- Riesgo de alucinacion en la prediccion de acciones si la subtarea no coincide con la distribucion del dataset, especialmente en escenarios fuera de RMBench.
- Se desconoce el comportamiento ante idiomas distintos del que se uso en el dataset; no se especifican los idiomas soportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_rmbench_preset_b128_60k
- Dataset de fine-tuning: https://huggingface.co/datasets/Myungkyu/RMBench-preset-gemini
- Repositorio de RLDX-1: https://github.com/RLWRLD/RLDX-1
- Informe tecnico de RLDX-1 en arXiv: https://arxiv.org/abs/2605.03269
