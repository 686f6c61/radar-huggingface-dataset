# padiredd/dp-blockpick-varied-timing

## Resumen

dp-blockpick-varied-timing es una política de difusión (diffusion policy) para robótica desarrollada por el usuario padiredd y publicada en Hugging Face bajo licencia MIT. El modelo resuelve una tarea concreta de manipulación: el agarre cenital (top-down) de un bloque con el brazo izquierdo del robot ROBOTIS FFW SG2 en el simulador Isaac Lab. Se entrenó con 500 demostraciones scriptadas en las que la duración de cada fase varía entre episodios, un detalle de diseño que obliga a la política a usar las cámaras para decidir cuándo cerrar la pinza en lugar de aprender un temporizador implícito a partir del estado articular.

El modelo tiene 287.504.496 parámetros y se distribuye en formato safetensors (repositorio de 5,8 GB). No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones visuales y propioceptivas a 16 objetivos articulares (7 del brazo izquierdo más pinza, 7 del brazo derecho más pinza). Su relevancia radica en demostrar que la variabilidad temporal en los datos de entrenamiento corrige un fallo clásico de las políticas de imitación: el cierre prematuro de la pinza por sobreajuste a la secuencia temporal de las demostraciones.

La arquitectura sigue el esquema estándar de LeRobot para diffusion policy: un codificador ResNet-18 independiente por cámara, softmax espacial con 32 keypoints, una UNet con canales 512/1024/2048 y un proceso de difusión DDPM. El horizonte de predicción es de 64 pasos con 32 pasos ejecutados, y la observación combina tres cámaras (cabeza a 672x376 y dos de muñeca a 424x240, todas reescaladas a 240x240) con un vector de estado articular de 22 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot 0.6.1): ResNet-18 por camara + softmax espacial (32 keypoints) + UNet 512/1024/2048 con difusion DDPM |
| Parametros totales | 287.504.496 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; horizonte de prediccion de 64 pasos, 32 ejecutados, n_obs_steps 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red procesa cada una de las tres camaras con un ResNet-18 independiente, extrae 32 keypoints mediante softmax espacial y concatena esas representaciones con el estado articular de 22 dimensiones. Sobre esa condicion se aplica una UNet de canales 512/1024/2048 que predice el ruido (epsilon prediction) en un esquema DDPM con 100 pasos de entrenamiento. En evaluacion se puede usar DDIM-10 (mas rapido) o DDPM-100 (mas preciso). El horizonte de accion es de 64 pasos, de los que se ejecutan 32, con una sola observacion de entrada.

El entrenamiento se realizo con el framework LeRobot 0.6.1 (fork ROBOTIS-GIT/lerobot-cyclo en el commit 240b4a0) sobre 500 episodios que suman 83.472 fotogramas a 15 Hz, con duraciones de 8,5 a 14,2 s por episodio. La innovacion clave esta en la generacion de datos: cada fase de la demostracion se escala entre x0,75 y x1,35, la pinza pausa entre 0 y 0,5 s antes de cerrar, la distancia de preagarre varia entre 5 y 11 cm, la altura de elevacion entre 8 y 15 cm y la trayectoria de aproximacion tambien cambia, de modo que el cierre ocurre en cualquier instante entre 5,7 y 10,9 s. Se aplico aumento de imagen agresivo (brillo, contraste, saturacion, tono, nitidez, transformaciones afines, perspectiva, desenfoque, borrado aleatorio y escala de grises, hasta 5 transformaciones por muestra en orden aleatorio). El optimizador fue Adam con tasa 1e-4, betas (0,95, 0,999), weight decay 1e-6, recorte de gradiente 10 y schedule coseno con 500 pasos de calentamiento. Se entrenaron 100.000 pasos con batch de 8 (unas 10 epocas) en una unica RTX 4090 durante 1 h 36 min, con checkpoints cada 20.000 pasos. La perdida descendio de 0,007 a 20k hasta 0,002 a 80k y 100k.

## Capacidades

- Control roboticode manipulacion: genera 16 objetivos articulares (brazo izquierdo de 7 articulaciones mas pinza, brazo derecho de 7 articulaciones mas pinza) a partir de observaciones visuales y propioceptivas.
- Percepcion visual multi-camara: procesa simultaneamente camara de cabeza y dos camaras de muneca, lo que permite localizar el bloque y estimar la geometria de aproximacion.
- Sincronizacion temporal basada en vision: al haberse entrenado con tiempos variables, la politica infiere cuando cerrar la pinza a partir de las imagenes, no de un reloj implicito en el estado articular.
- Agarre cenital preciso: la pinza cierra con las puntas 0,5 cm por encima de la mitad de la altura del bloque y eleva entre 8 y 15 cm.
- Generalizacion posicional dentro de la zona de entrenamiento: el bloque se coloca de forma uniforme en x 0,28-0,48 m e y 0,065-0,315 m con yaw de +-10 grados.
- Inferencia con dos modos de muestreo: DDIM-10 para despliegue rapido y DDPM-100 para maxima precision.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico ni capacidades multilingues; es un modelo puramente motor y perceptivo.

## Casos de uso

- Agarre cenital de piezas en linea de montaje simulada: el modelo toma el bloque de 5x5x4 cm y 50 g desde una pose fija y lo eleva entre 8 y 15 cm; es adecuado porque su tasa de exito en simulacion alcanza el 98 % con DDIM-10 y el 100 % con DDPM-100 en 50 intentos sobre la zona de entrenamiento.
- Generacion de datos sinteticos para entrenamiento posterior: al ejecutarse en Isaac Lab, puede producir trayectorias etiquetadas que alimenten otras politicas o sirvan de baseline en experimentos de imitacion.
- Estudio de robustez temporal en politicas de difusion: sirve como referencia para comparar recetas con timing fijo frente a timing variable; la model card reporta 22/41 aciertos con timing identico frente a 49/50 con timing variable en el checkpoint de 100k.
- Validacion de pipelines de LeRobot: al estar empaquetado como DiffusionPolicy.from_pretrained, permite probar el flujo completo de carga, inferencia y evaluacion en simulacion con un solo comando.
- Benchmark de agarre en robotica de mesa: la escena (mesa de 29,25 pulgadas, tablero de espuma en el borde lejano, visuales nominales limpias) es reproducible y sirve para comparar politicas bajo condiciones controladas.
- Prototipado de control con dos brazos: aunque la tarea usa solo el brazo izquierdo, la accion incluye los 7 objetivos del brazo derecho, lo que facilita extender el modelo a tareas bimanuales.
- Docencia e investigacion en diffusion policies: el modelo es pequeno (287 M de parametros), se entrena en una sola RTX 4090 en menos de 2 horas y la licencia MIT permite reutilizacion sin restricciones.

## Benchmarks y rendimiento

Evaluacion en simulacion del 31 de octubre de 2026: 50 agarres en la misma escena limpia, bloque uniforme sobre el area de entrenamiento, exito definido como bloque elevado al menos 5 cm durante 1 s en un maximo de 16 s.

| Checkpoint | Muestreador | Agarres correctos |
|---|---|---|
| 100k | DDIM-10 | 49/50 (98 %) |
| 60k | DDIM-10 | 45/50 (90 %) |
| 100k | DDPM-100 | 50/50 (100 %) |

Comparacion con la misma receta entrenada sobre demostraciones de timing identico: 22/41 con el checkpoint de 100k y 32/41 con el de 60k sobre posiciones validas. La model card no reporta benchmarks estandar de robotica (por ejemplo, tasa de exito en LIBERO o RoboMimic) ni resultados en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 287,5 M de parametros en safetensors de precision completa, el peso ronda 1,15 GB y el consumo total depende de los tres ResNet-18 y de la UNet, por lo que se estima un uso moderado, aunque el autor no publica la cifra.
- GPU de entrenamiento reportada: una RTX 4090, con 1 h 36 min para 100.000 pasos y batch de 8.
- Cabe en GPU de consumo: si, segun el hardware de entrenamiento declarado (RTX 4090); no se detallan requisitos para GPUs de gama inferior.
- Opciones de despliegue: LeRobot 0.6.1 con el fork ROBOTIS-GIT/lerobot-cyclo (commit 240b4a0); carga mediante DiffusionPolicy.from_pretrained. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del muestreador elegido (DDIM-10 frente a DDPM-100) y del hardware, pero la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-varied-timing | 287.504.496 | 64 pasos de horizonte, 32 ejecutados | 49/50 (DDIM-10) y 50/50 (DDPM-100) en simulacion | MIT | Hugging Face (padiredd/dp-blockpick-varied-timing) |
| Misma receta con timing identico (referencia interna del autor) | no disponible | no disponible | 22/41 (100k) y 32/41 (60k) | no disponible | no disponible como repositorio separado |
| Otras diffusion policies de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada; la unica comparacion cuantitativa es la del propio autor frente a la variante de timing fijo.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en simulacion (Isaac Lab); no hay evidencia de transferencia a hardware real ni de resultados en el robot fisico.
- Visuales nominales limpios sin domain randomization: el modelo puede degradarse ante cambios de iluminacion, texturas, fondos o calibracion de camaras distintas de las del simulador.
- Zona de trabajo acotada: el bloque solo se coloca en x 0,28-0,48 m e y 0,065-0,315 m con yaw de +-10 grados; fuera de ese rango el comportamiento no esta validado.
- Pose inicial fija (la pose yaml de manipulacion de mesa del SG2 real); no se evalua la robustez a perturbaciones en la configuracion inicial.
- Objeto unico y especifico: bloque verde lima de 5x5x4 cm con un agujero de 1 cm y 50 g; no se prueba con otras geometrias, masas o materiales.
- Dependencia de la percepcion para el timing: aunque la variabilidad temporal reduce el sesgo de reloj, el exito depende de que las camaras distingan bien la posicion del bloque.
- Riesgo de sobreajuste al simulador: la perdida baja hasta 0,002 y el entrenamiento dura solo unas 10 epocas, lo que puede limitar la diversidad de comportamientos aprendidos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Sin sesgos linguisticos ni de alucinacion de texto, al no ser un modelo de lenguaje; los riesgos se limitan al dominio motor y perceptivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-varied-timing
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot
- Fork utilizado: https://github.com/ROBOTIS-GIT/lerobot-cyclo (commit 240b4a0)
- Isaac Lab (simulador): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2 (robot): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
