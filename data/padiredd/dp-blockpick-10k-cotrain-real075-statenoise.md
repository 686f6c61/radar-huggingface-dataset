# padiredd/dp-blockpick-10k-cotrain-real075-statenoise

## Resumen

dp-blockpick-10k-cotrain-real075-statenoise es una política de difusión (diffusion policy) para robótica manipulativa, publicada por el usuario padiredd en Hugging Face. Se trata de un modelo de 288 M parámetros entrenado con la librería LeRobot (en un fork propio denominado lerobot-cyclo) para ejecutar una tarea muy concreta: el pick-and-place cenital de un bloque verde lima de 5x5x4 cm con el brazo izquierdo del robot ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas sobre una mesa de 29,25 pulgadas.

El modelo resuelve el problema clásico de sim-to-real en robótica: entrenar en simulación (Isaac Lab) y transferir a un robot físico con pocos datos reales. Para ello emplea co-entrenamiento con un muestreador mixto que extrae el 75 % de los samples de 14 demostraciones reales de teleoperación y el 25 % restante de 11.710 demostraciones simuladas, además de inyectar ruido gaussiano de 1 grado sobre el estado articular durante el entrenamiento. El resultado es una política que, según la evaluación del autor, alcanza un 87 % de éxito en simulación con muestreo DDIM de 10 pasos en condiciones limpias.

Es relevante ahora porque demuestra empíricamente que una proporción muy alta de datos reales (alpha 0,75) combinada con ruido de estado y aumentación agresiva de imagen mejora notablemente la robustez frente a alternativas entrenadas solo con simulación o con ruido de estado sin co-entrenamiento, y lo hace con un coste de entrenamiento de apenas 2 h 40 min en una única RTX 4090.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara, horizonte 64 / 32 ejecutados |
| Parámetros totales | 287.533.680 (288 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; n_obs_steps = 1) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras 240x240 (head, muñeca izquierda, muñeca derecha) + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Pasos de difusión | 100 (DDPM); compatible con DDIM de 10 pasos (eta 0) |
| Dataset de entrenamiento | 11.724 episodios (11.710 sim + 14 reales), 1.984.945 frames sim + 2.653 frames reales |
| Hardware de entrenamiento | 1x NVIDIA RTX 4090 24 GB, 10,4 steps/s, 2 h 40 min |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy estándar de LeRobot: un encoder visual ResNet18 independiente por cada una de las tres cámaras (240x240), concatenación con el vector de estado articular de 22 dimensiones, y un decoder de difusión que genera trayectorias de acción de horizonte 64 pasos, de los cuales se ejecutan 32. El muestreo en inferencia puede hacerse con DDPM de 100 pasos o con DDIM de 10 pasos (eta 0), lo que reduce drásticamente el coste computacional a cambio de una ligera pérdida de precisión (66 % frente a 74 % en el modelo base fullregion-dr2).

El entrenamiento combina 11.710 demostraciones simuladas en Isaac Lab (ROBOTIS FFW SG2, pick cenital sobre una región alcanzable de 1.154 cm²) con 14 demostraciones reales de teleoperación convertidas con el conversor Cyclo del laboratorio. El muestreador CotrainMixSampler extrae cada muestra con probabilidad 0,75 de los episodios reales y 0,25 de los simulados, lo que resulta en aproximadamente 24 muestras reales y 8 simuladas por batch de 32. Se aplican dos innovaciones destacables: (1) ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado, que actúa como regularizador para el gap sim-to-real; y (2) aumentación de imagen agresiva en orden aleatorio, aplicando hasta 5 de 11 transformaciones (brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio, escala de grises). La receta completa es 100k pasos, batch 32, Adam 1e-4 con schedule coseno, semilla 1000. El checkpoint final se publica en la raíz del repo, con checkpoints intermedios cada 10k pasos en carpetas `step-<n>/`.

## Capacidades

- Ejecución de una tarea robótica concreta de pick-and-place cenital con el brazo izquierdo del ROBOTIS FFW SG2 sobre un bloque verde lima de 5x5x4 cm.
- Percepción visual multi-cámara: procesa simultáneamente las vistas de cabeza y de ambas muñecas a 240x240 píxeles.
- Generación de trayectorias articulares de 16 dimensiones a 15 Hz, con horizonte de predicción de 64 pasos y ejecución de 32.
- Generalización a posiciones del bloque en toda la región alcanzable del brazo (bandas x 0,28-0,50 m, y -0,08 a +0,65 m según la evaluación).
- Robustez parcial frente a randomización de apariencia (fondos, colores de mesa y bloque, iluminación, montajes de cámara) no vista en entrenamiento.
- Inferencia acelerada mediante DDIM de 10 pasos, con un éxito del 87 % en condiciones limpias.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente motor-visual.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede integrarse en una celda robotizada con un FFW SG2 para recoger piezas de 5x5x4 cm en posiciones variables dentro de la región alcanzable, gracias a su capacidad de generalizar sobre 1.154 cm² de mesa.
- Prototipado rápido de políticas robóticas con presupuesto limitado: al entrenarse en 2 h 40 min en una única RTX 4090, sirve como base para iterar recetas de co-entrenamiento sim-to-real en laboratorios con hardware modesto.
- Investigación en sim-to-real: el checkpoint y los scripts de evaluación publicados permiten reproducir el protocolo de 100 poses pareadas y comparar variantes (con/sin ruido de estado, con/sin co-entrenamiento) de forma controlada.
- Benchmarking de diffusion policies: al incluir checkpoints cada 10k pasos, es útil para estudiar curvas de aprendizaje y el efecto de la proporción de datos reales en la convergencia.
- Despliegue en entornos con apariencia variable: su robustez del 59-63 % bajo randomización de apariencia (dr) lo hace adecuado para pruebas en escenarios con iluminación y fondos cambiantes, aunque requiere supervisión.
- Educación y demos de robótica: la tarea string "pick up the lime green block with the left arm" y los vídeos de evaluación publicados facilitan su uso en demostraciones docentes de políticas de imitación.
- Generación de datos sintéticos aumentados: puede emplearse como política de recolección para generar rollouts adicionales en Isaac Sim y ampliar datasets de entrenamiento.

## Benchmarks y rendimiento

Evaluación del autor en Isaac Sim 5.1 sobre 100 poses uniformes en la región alcanzable, éxito definido como bloque sostenido ≥ 5 cm sobre la mesa durante 1 s en 400 ticks (26,7 s a 15 Hz). Condiciones: clean (aspecto nominal) y dr (randomización de apariencia no vista en entrenamiento).

| Modelo | DDPM clean | DDIM-10 clean | DDPM dr | DDIM-10 dr |
|---|---|---|---|---|
| fullregion-dr2 | 74 % | 66 % | 60 % | 54 % |
| fullregion-dr2-statenoise | 48 % | 26 % | 31 % | 16 % |
| cotrain-real075-statenoise (este modelo) | 78 % | 87 % | 59 % | 63 % |

Evolución por checkpoint (DDIM-10, clean):

| Modelo | 20k | 40k | 60k | 80k | 100k |
|---|---|---|---|---|---|
| fullregion-dr2 | 0 % | 1 % | 26 % | 49 % | 66 % |
| fullregion-dr2-statenoise | 0 % | 5 % | 22 % | 24 % | 26 % |
| cotrain-real075-statenoise (este modelo) | 33 % | 46 % | 76 % | 87 % | 87 % |

Desglose por banda de posición (picked/episodios) para este modelo a 100k: x 0,28-0,33 m: 26/35 (DDPM clean), 27/35 (DDIM-10 clean); x 0,33-0,39 m: 20/23 y 23/23; x 0,39-0,44 m: 25/28 y 25/28; x 0,44-0,50 m: 7/14 y 12/14. El fallo dominante es "miss" (pinza cierra en vacío): 22 casos en DDPM clean y 13 en DDIM-10 clean.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (288 M parámetros) y las tres cámaras a 240x240, es previsible que quepa holgadamente en GPUs consumer de 8 GB o menos, aunque el autor no publica la cifra.
- GPU de entrenamiento: una NVIDIA RTX 4090 de 24 GB, con 10,4 steps/s y 2 h 40 min para 100k pasos.
- GPU recomendadas para inferencia: cualquier GPU con soporte CUDA; el autor no especifica modelos concretos.
- ¿Cabe en GPU consumer? Sí, según el hardware de entrenamiento declarado (RTX 4090); no se detallan requisitos para GPUs de gama inferior.
- Opciones de despliegue: LeRobot (fork lerobot-cyclo del autor), con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-10k-cotrain-real075-statenoise")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 10,4 steps/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito DDIM-10 clean | Éxito DDPM dr | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cotrain-real075-statenoise (este) | 288 M | n/a | 87 % | 59 % | other | Hugging Face (padiredd) |
| fullregion-dr2 | 288 M | n/a | 66 % | 60 % | other | Hugging Face (padiredd) |
| fullregion-dr2-statenoise | 288 M | n/a | 26 % | 31 % | other | Hugging Face (padiredd) |

Los tres modelos comparten arquitectura, tamaño y receta base; la diferencia está en el uso de co-entrenamiento con datos reales y ruido de estado. No se dispone de información sobre otras alternativas externas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo ejecuta la tarea de pick cenital del bloque verde lima con el brazo izquierdo del FFW SG2; no es transferible a otras tareas, robots o geometrías sin reentrenamiento.
- Sesgo de dominio: entrenado con 14 demostraciones reales y 11.710 simuladas; el gap sim-to-real puede manifestarse en condiciones físicas no cubiertas (fricción, iluminación real extrema, calibración de cámaras).
- Riesgo de fallo por "miss": el modo de fallo dominante es que la pinza cierre en vacío (22 casos de 100 en DDPM clean), lo que en producción implica ciclos perdidos.
- Degradación bajo randomización de apariencia: el éxito cae al 59-63 % en condiciones dr, insuficiente para entornos no controlados sin supervisión.
- Dependencia de un fork: el campo `state_noise_std` en config.json es específico del fork lerobot-cyclo; debe eliminarse para cargar con LeRobot estándar, y el entrenamiento solo es reproducible con el fork del autor.
- Licencia "other": no se especifican términos de uso comercial; es necesario contactar con el autor antes de un despliegue productivo.
- Idiomas no aplicables: el modelo no procesa lenguaje natural; la tarea se define por cadena de texto pero no hay comprensión lingüística.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni INT8, lo que limita el despliegue en hardware no CUDA.
- Éxito aún creciente a 100k pasos: el autor indica que el rendimiento seguía subiendo, por lo que el checkpoint no es necesariamente el óptimo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-10k-cotrain-real075-statenoise
- Dataset de simulación: `padiredd/pick-cube-topdown-region10k-full-dr2-3cam` (referenciado en la model card)
- Dataset real de teleoperación: `omkarpatil/pick-lime-block` (referenciado en la model card)
- Repositorio de evaluación y scripts: `cyclo_lab-real2sim`, carpeta `data_collection/region10k/eval/` (referenciado en la model card)
- No se han encontrado enlaces adicionales a papers, blogs o demos en la información proporcionada.
