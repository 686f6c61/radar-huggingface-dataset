# AlexWortega/tinyvla

## Resumen

TinyVLA (AlexWortega) es un modelo de visión-lenguaje-acción (VLA) de doble frecuencia (dual-rate) para manipulación robótica, desarrollado por AlexWortega como plugin de LeRobot. Con 643 millones de parámetros almacenados y solo 140 millones en la ruta de control online, consigue un 86 % de éxito en LIBERO-Spatial en modo dual-rate, superando a OpenVLA-7B (84,7 %) con una fracción de los parámetros. El modelo combina un camino lento basado en Qwen3.5-0.8B que genera un latente semántico a 0,5-2 Hz, y un camino rápido de flow-matching a 10-20 Hz para la generación de acciones. Su relevancia radica en que demuestra que los VLAs pueden ser eficientes y desplegables en hardware embebido como Raspberry Pi 5, manteniendo un rendimiento competitivo. La arquitectura dual-rate, con el latente semántico cacheado, actúa como regularización temporal y mejora la estabilidad en bucle cerrado. El modelo se entrenó en aproximadamente cinco días en una única RTX A6000, lo que lo hace accesible para laboratorios con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA dual-rate: slow path (Qwen3.5-0.8B truncado, primeras 12 de 24 capas) + fast path (flow-matching expert de 38M con 12 bloques) |
| Parametros totales | 643.389.096 (643M) |
| Parametros activos | ~140M (ruta rapida online por tick; el slow path se ejecuta a 0,5-2 Hz) |
| Longitud de contexto | no disponible (procesa imagen + instruccion; no se especifican tokens) |
| Tipos de cuantizacion | no disponible (se menciona GGUF Q4 para el slow path en Raspberry Pi, pero no se publica configuracion oficial) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien se menciona GGUF para despliegue en edge) |

## Arquitectura y entrenamiento

TinyVLA usa una arquitectura dual-rate con dos rutas que comparten un encoder visual unico (el ViT nativo de Qwen3.5-0.8B, 100,6M de parametros). La ruta lenta (slow path) procesa la imagen y la instruccion a traves del stack de lenguaje truncado (primeras 12 de 24 capas) y genera 8 tokens de lectura que se proyectan a un latente semantico de 8x512, cacheado entre refrescos a 0,5-2 Hz. La ruta rapida (fast path) toma los 64 tokens espaciales del vision tower por camara (sin pasar por el LM), junto con la propiocepcion (padded a 16 dimensiones) y un token de embodiment, y los cruza con un experto de flow-matching de 38M con 12 bloques de atencion cruzada y self-attention. La salida es un chunk de accion de 50 pasos con padding a 8 dimensiones y mascara de validez. El entrenamiento usa flow matching con trayectoria OT lineal, t ~ Beta(1,5, 1), target de velocidad y MSE enmascarado.

El entrenamiento se realizo en cuatro etapas: (1) overfit smoke con 5k pasos en svla_so100_stacking; (2) pretrain mixto con 40 datasets comunitarios SO100/101 (~10.700 episodios, peso 0,65) y Bridge V2 (10.000 episodios, peso 0,35), con backbone congelado y 40k pasos; (3) destilacion espacial con 132K etiquetas de profesor (Qwen3.5-4B, punto central en grid 32x32) con CE x0,15 en tokens de cam0; (4) fine-tuning en LIBERO (HuggingFaceVLA/libero, 1693 episodios, todas las suites) con 40k pasos y descongelado de capas LM y vision (vocabulario congelado). El descongelado del LM fue el mayor incremento de rendimiento (de 60 % a 79-86 % en LIBERO-Spatial). Se aplico aumento de staleness (latente de un frame t-k con k~U(0,2s) con p=0,5) durante el pretrain.

## Capacidades

- Control robotico de manipulacion: genera chunks de accion de 50 pasos (posicion del efector final, orientacion, agarre) a partir de observaciones de camara y propiocepcion.
- Razonamiento dual-rate: el latente semantico se refresca a baja frecuencia (0,5-2 Hz) mientras la ruta rapida opera a 10-20 Hz, lo que reduce latencia y coste computacional.
- Soporte multi-camara: acepta dos camaras (cam0 escena, cam1 muneca) mediante mapeo regex y normalizacion por dataset.
- Cross-embodiment: maneja diferentes robots (SO100, SO101) mediante token de embodiment aprendido, padding de estado a 16 dimensiones y mascara de validez para acciones.
- Generacion de acciones con flow matching: usa 10 pasos de Euler en inferencia, lo que permite un control suave y estable.
- Destilacion espacial: incorpora conocimiento de un modelo profesor (Qwen3.5-4B) para localizacion de puntos centrales en grid 32x32, mejorando la percepcion espacial.
- Despliegue en edge: el slow path puede ejecutarse en Raspberry Pi 5 con cuantizacion GGUF Q4 a 0,5-1 Hz, mientras el fast path (140M) corre a tiempo real.

## Casos de uso

- Manipulacion robotica en simulacion LIBERO: el modelo puede entrenarse y evaluarse en las suites LIBERO (Spatial, Object, Goal, Long) para tareas de mesa como coger, apilar o colocar objetos. Su rendimiento del 86 % en Spatial con n=100 lo hace util para investigacion en aprendizaje por refuerzo y planificacion de movimientos.
- Robotica real con hardware embebido: gracias a la arquitectura dual-rate, el slow path (0,5B) puede ejecutarse en una Raspberry Pi 5 con cuantizacion GGUF Q4, mientras el fast path (140M) corre a 10-20 Hz en la misma placa o en una GPU modesta. Es adecuado para prototipos de brazos roboticos de bajo coste (SO100/SO101).
- Control en tiempo real con latencia reducida: la ruta rapida de 140M permite frecuencias de control de 10-20 Hz sin depender del modelo de lenguaje completo, ideal para tareas que requieren respuestas rapidas ante perturbaciones.
- Distilacion de conocimiento espacial: el modelo puede servir como estudiante para destilar habilidades de localizacion de objetos desde VLAs mas grandes (como Qwen3.5-4B), reduciendo el coste de despliegue en entornos con recursos limitados.
- Investigacion en eficiencia de VLAs: su diseno dual-rate y su entrenamiento reproducible en una sola GPU (RTX A6000, ~5 dias) lo convierten en un banco de pruebas para estudiar el impacto del descongelado de capas, la regularizacion temporal y el flujo de informacion entre rutas.
- Integracion en pipelines de robotica con LeRobot: al implementarse como plugin out-of-tree, puede usarse con el ecosistema LeRobot 0.6.1, facilitando la carga de datasets, la evaluacion y el despliegue en multiples plataformas.
- Generacion de trayectorias con validez enmascarada: la mascara de validez permite manejar acciones con dimensiones variables (p. ej., robots con menos grados de libertad), lo que facilita la transferencia entre distintos hardware.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en evaluaciones propias (n=100, 10 episodios por tarea, estados iniciales 0-9) en LIBERO-Spatial. Se comparan con numeros publicados por otros modelos usando sus propios protocolos de evaluacion (n=500 en la mayoria de casos).

| Modelo | Parametros | LIBERO-Spatial |
|---|---|---|
| π0 | 3,3B | 98 % |
| SmolVLA-2.25B | 2,25B | 93 % |
| XS-VLA | 0,26B | ~93 % (media 90,3) |
| TinyVLA (este, dual-rate) | 0,64B (140M online) | 86 % |
| TinyVLA (este, full-rate) | 0,64B (140M online) | 79 % |
| OpenVLA | 7B | 84,7 % |

Notas de honestidad del autor: el n=100 (±8 pp) es menor que los n=500 de otros modelos; la evaluacion cubre una sola suite (Spatial); los estados iniciales 0-9 por tarea estan en los datos de entrenamiento (protocolo estandar LIBERO usado por todos los modelos listados). Evaluaciones multi-suite (Object, Goal, Long) y una comparativa con SmolVLA bajo protocolo identico estan en curso.

Validacion del dual-rate: offline, el MSE de chunks con latente de un frame 2 s anterior es identico al fresco (0,772 vs 0,772). En bucle cerrado, 86 % con refresco a 1 Hz vs 79 % a full-rate.

## Requisitos de hardware

- Entrenamiento: 1x RTX A6000 (48 GB VRAM) durante ~5 dias para el pipeline completo de 4 etapas. El pretrain usa batch size 64x2, el fine-tuning batch size 48.
- Inferencia en GPU consumer: la ruta rapida (140M) puede ejecutarse en RTX 3060 o superior a 10-20 Hz. El slow path (0,5B) requiere ~4-6 GB VRAM en FP16, o menos con cuantizacion GGUF Q4.
- Inferencia en edge: el slow path puede correr en Raspberry Pi 5 a 0,5-1 Hz con llama.cpp y GGUF Q4; el fast path (140M) puede ejecutarse en tiempo real en la misma placa o en una NPU modesta.
- Opciones de despliegue: plugin LeRobot (lerobot 0.6.1), llama.cpp para el slow path, potencialmente vLLM o TGI para el slow path si se usa en GPU.
- Latencia estimada: slow path a 0,5-2 Hz (latente semantico), fast path a 10-20 Hz (acciones). El flujo completo con latente cacheado anade ~50-100 ms por tick de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyVLA (este) | 0,64B (140M online) | no disponible | 86 % (dual-rate) | Apache-2.0 | HuggingFace, plugin LeRobot |
| OpenVLA | 7B | no disponible | 84,7 % | MIT | HuggingFace |
| SmolVLA | 2,25B | no disponible | 93 % | Apache-2.0 | HuggingFace |
| XS-VLA | 0,26B | no disponible | ~93 % (media 90,3) | no disponible | HuggingFace |
| π0 | 3,3B | no disponible | 98 % | no disponible | no disponible |

TinyVLA ofrece el mejor equilibrio entre tamano y rendimiento para su categoria: supera a OpenVLA con ~11 veces menos parametros y es comparable a XS-VLA con algo mas de parametros pero con una arquitectura dual-rate que reduce el coste online a 140M. Su licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia de otros modelos con licencias mas restrictivas.

## Limitaciones y advertencias

- Evaluacion limitada: los resultados solo cubren LIBERO-Spatial con n=100, mientras que otros modelos reportan n=500. La varianza es de ±8 puntos porcentuales. No hay resultados publicados para Object, Goal o Long.
- Protocolo de evaluacion estandar: los estados iniciales 0-9 por tarea estan incluidos en los datos de entrenamiento, lo que puede inflar los resultados en comparacion con generalizacion a estados no vistos.
- Problemas de rotacion en robosuite/LIBERO: los renders estan rotados 180 grados respecto a los datasets grabados; se requiere un flip vertical y horizontal (`img[::-1, ::-1]`) para que el modelo funcione correctamente. Un flip vertical solo produce una imagen espejo y el modelo falla.
- Ambiguidad en la orientacion del efector final: la cuaternion del entorno puede representarse con signo opuesto (antipodal) en los datasets; es necesario canonicalizar (flip cuando rotvec_x < 0) para evitar errores de ~17 sigma en la entrada normalizada.
- Discrepancia de FPS: el dataset HuggingFaceVLA/libero indica fps=10 pero los frames nativos son 20 Hz; no se debe hacer action-repeat en evaluacion.
- Destilacion espacial neutral en LIBERO: la destilacion con etiquetas del profesor no mejoro el rendimiento final, probablemente porque el descongelado de la vision durante el fine-tuning la sobrescribio. El autor sugiere integrarla en el pretrain.
- Sesgos y alucinacion: no se han evaluado sesgos de generacion de texto ni alucinacion en instrucciones complejas; el modelo esta disenado para control robotico, no para dialogo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones; se debe verificar la licencia del modelo base.
- Dependencia de LeRobot: la implementacion requiere la version 0.6.1 de LeRobot y el plugin out-of-tree; cambios en la API de LeRobot pueden romper la compatibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/AlexWortega/tinyvla
- Repositorio TinyVLA (proyecto original, 2024): https://github.com/liyaxuanliyaxuan/TinyVLA
- Pagina del proyecto TinyVLA (original): https://tiny-vla.github.io/
- Paper TinyVLA (original, arXiv): https://arxiv.org/abs/2409.12514
- Repositorio alternativo TinyVLA (MideaAI): https://github.com/MideaAI/TinyVLA

Nota: los enlaces de GitHub y arXiv corresponden al proyecto TinyVLA original (2024) de liyaxuanliyaxuan, que comparte nombre pero tiene una arquitectura distinta (basada en Llava-Pythia). El modelo de AlexWortega es una implementacion independiente con arquitectura dual-rate sobre Qwen3.5-0.8B.
