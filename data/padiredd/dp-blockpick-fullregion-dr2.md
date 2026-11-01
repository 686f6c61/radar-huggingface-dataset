# padiredd/dp-blockpick-fullregion-dr2

## Resumen

`dp-blockpick-fullregion-dr2` es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, publicada por el usuario padiredd en Hugging Face. Resuelve una tarea muy concreta: el pick vertical (top-down) de un bloque verde lima de 5x5x4 cm con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas.

El modelo tiene 287.533.680 parámetros (288 M) y se distribuye en formato safetensors dentro de un repositorio de 11,5 GB, que incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (tres cámaras de 240x240 más un estado articular de 22 dimensiones) a 16 objetivos articulares a 15 Hz.

Su relevancia es doble. Por un lado, documenta una receta completa y reproducible de entrenamiento de diffusion policy en simulación con Isaac Lab, con un dataset de 11.710 demostraciones (1.984.945 fotogramas) y un esquema de aleatorización de dominio denominado dr2. Por otro, sirve como referencia práctica para quien quiera evaluar políticas visuomotoras de tamaño medio en hardware de gama profesional pero asequible (una sola RTX A5000 de 24 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con codificador visual ResNet18 por cámara y horizonte de predicción 64 (32 ejecutados) |
| Parametros totales | 287.533.680 (288 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1 (una sola observación por inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica; recibe una cadena de tarea en inglés: "pick up the lime green block with the left arm") |
| Licencia | other (licencia personalizada; consultar los términos en el repositorio) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

Otros datos técnicos relevantes: entradas de tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240x240 píxeles más un vector de estado articular de 22 dimensiones; salida de 16 objetivos articulares a 15 Hz; entrenamiento con Adam a 1e-4, scheduler coseno, batch 32, semilla 1000; hardware de entrenamiento una NVIDIA RTX A5000 de 24 GB a 4-5,7 pasos/s.

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy estándar de LeRobot, en la variante del fork `lerobot-cyclo` de ROBOTIS. Cada una de las tres cámaras se procesa con un codificador ResNet18 independiente; las características visuales se concatenan con el estado articular de 22 dimensiones y alimentan una red de difusión DDPM de 100 pasos que genera una secuencia de acciones de horizonte 64, de las cuales se ejecutan las 32 primeras. Se usa un único paso de observación (`n_obs_steps = 1`), lo que simplifica el bucle de control a costa de no modelar explícitamente la historia.

El entrenamiento se realizó durante 100.000 pasos sobre el dataset `padiredd/pick-cube-topdown-region10k-full-dr2-3cam`, compuesto por 11.710 demostraciones simuladas en Isaac Lab que suman 1.984.945 fotogramas, muestreados de forma uniforme con el `EpisodeAwareSampler` por defecto de LeRobot. La aleatorización de dominio (dr2) cubre pose inicial ±2 grados, apertura y cierre de pinza por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación de tiempos de demostración y altura de mesa entre -2 y +2 cm. Además se aplica una augmentación de imagen agresiva en orden aleatorio: hasta cinco transformaciones simultáneas entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afín (±10 grados, 10 %, 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. No se añadió ruido al estado.

## Capacidades

- Control visuomotor de pick top-down: genera trayectorias articulares de 16 dimensiones a 15 Hz para coger un bloque de 5x5x4 cm en cualquier punto de la región alcanzable de la mesa (1.154 cm²).
- Fusión multimodal de tres cámaras (cabeza y ambas muñecas) con estado propioceptivo de 22 dimensiones.
- Generalización a condiciones de iluminación, altura de mesa, pose inicial y desplazamientos de cámara dentro del rango de aleatorización dr2.
- Ejecución de acciones en bloque: predice 64 pasos y ejecuta 32, lo que aporta suavidad y cierta tolerancia a latencias del bucle de control.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de lenguaje más allá de la cadena de tarea.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de laboratorio en simulación: evaluar la política directamente en Isaac Lab sobre el robot FFW SG2 para medir tasas de éxito en pick top-down antes de transferir a hardware real.
- Base para fine-tuning con datos propios: el checkpoint de 100k y los diez intermedios permiten reanudar o ajustar el entrenamiento con un dataset propio de la misma tarea y configuración de cámaras.
- Estudio de robustez ante aleatorización de dominio: comparar el rendimiento del modelo con y sin las condiciones dr2 (altura de mesa, focos, desplazamientos de cámara) para cuantificar el efecto de cada factor.
- Referencia de receta de entrenamiento: sirve como plantilla reproducible de diffusion policy con LeRobot (ResNet18 por cámara, DDPM 100 pasos, horizonte 64/32) para equipos que construyan sus propias políticas.
- Benchmark interno de políticas visuomotoras: al tener checkpoints cada 10.000 pasos, permite trazar curvas de aprendizaje y comparar variantes de augmentación o de datos.
- Docencia y divulgación: ejemplo completo y autocontenido de un pipeline de robótica con simulación, datos sintéticos y aprendizaje por imitación, adecuado para cursos prácticos.
- Prototipado de pick-and-place en entornos controlados: con una mesa de altura fija y un bloque de color similar, el modelo puede servir de punto de partida para tareas de recogida en líneas de montaje simuladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX A5000 de 24 GB, con un rendimiento observado de 4-5,7 pasos/s (compartida con la recolección de datos de simulación en la fase final del entrenamiento).
- Inferencia: no se publica una estimación de VRAM. Por el tamaño (288 M de parámetros, unos 1,15 GB en fp32) y los tres codificadores ResNet18, es razonable esperar que quepa en GPUs de consumo con 8-12 GB, aunque el dato no está confirmado por el autor.
- GPUs recomendadas: RTX A5000 (validada para entrenamiento); para inferencia, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente, si bien no hay cifras publicadas.
- Despliegue: el modelo se carga con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-fullregion-dr2")` del stack LeRobot; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; el bucle de control opera a 15 Hz según la configuración de las acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-fullregion-dr2 | 288 M | 3 cámaras 240x240 + estado 22-D, 1 paso de observación | Pick top-down de bloque con brazo izquierdo FFW SG2 | other | Hugging Face (padiredd) |
| Otras diffusion policies de LeRobot | no disponible | no disponible | Tareas de manipulación diversas | según autor | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación por imitación | según autor | Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas en la información proporcionada, por lo que la comparativa se limita a la categoría y al formato de publicación.

## Limitaciones y advertencias

- Modelo específico de tarea y robot: solo se ha entrenado para el pick top-down de un bloque verde lima de 5x5x4 cm con el brazo izquierdo del FFW SG2; no se espera que funcione con otros objetos, colores, brazos o morfologías sin reentrenamiento.
- Entrenado íntegramente en simulación (Isaac Lab): no hay evidencia publicada de transferencia a hardware real (sim-to-real), y la model card no incluye resultados de evaluación.
- La generalización está acotada por los rangos de dr2 (pose ±2 grados, altura de mesa ±2 cm, etc.); condiciones fuera de esos rangos pueden degradar el rendimiento sin aviso.
- Riesgo de sobreajuste a la apariencia: la augmentación de imagen es agresiva, pero el dataset procede de un único entorno simulado con un objeto de color fijo.
- Licencia "other": es necesario revisar los términos concretos del repositorio antes de cualquier uso comercial; no se garantiza permiso implícito.
- Sin cuantizaciones publicadas ni informes de latencia en inferencia, lo que dificulta planificar despliegues en tiempo real sin pruebas propias.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural más allá de la cadena de tarea fija y no dispone de capacidades de razonamiento simbólico.
- El repositorio ocupa 11,5 GB por incluir diez checkpoints intermedios; conviene descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-fullregion-dr2
- Dataset de entrenamiento: `padiredd/pick-cube-topdown-region10k-full-dr2-3cam` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- LeRobot (framework de entrenamiento e inferencia): no se proporciona enlace en la información disponible
- Isaac Lab (entorno de simulación): no se proporciona enlace en la información disponible
