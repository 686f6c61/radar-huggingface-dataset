# KaliberAI/vjepa2-1-conveyor30-rgb-states-gaussian-8to60

## Resumen

Gaussian V-JEPA 2.1 es un checkpoint de prediccion de trayectorias 3D desarrollado por KaliberAI para su interfaz de cintas transportadoras. El modelo recibe ocho fotogramas RGB consecutivos junto con 2-8 estados pasados medidos de una pelota rastreada, cada uno con la tupla (X, Y, Z, vX, vY, vZ), y devuelve 60 estados futuros a 30 FPS, es decir, dos segundos de prediccion. Cada componente futura se emite como una distribucion gaussiana con media y desviacion estandar marginal positiva, de modo que el modelo no solo predice la posicion, sino tambien una medida de incertidumbre por eje y por instante.

Tecnicamente se apoya en un codificador ViT-B de V-JEPA 2.1 congelado (no se ha ajustado fino) sobre el que se anaden un decodificador de trayectoria entrenado y un adaptador vertical temporal para la componente Z. No emplea ninguna simulacion fisica explicita (physics rollout): toda la dinamica se aprende de datos. Esto lo situa en la familia de los modelos de world modeling de Meta aplicados a un dominio industrial muy concreto, el transporte de objetos sobre cintas.

El checkpoint publicado es unicamente un archivo de pesos (`adapter/best.pt`, paso 3200) que contiene el decodificador y el adaptador junto con la configuracion y las estadisticas de normalizacion. Los pesos del backbone V-JEPA 2.1 no se incluyen y deben descargarse aparte, y el repositorio no ofrece un endpoint de inferencia alojado: se necesita el arbol de codigo propietario de KaliberAI para ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ViT-B de V-JEPA 2.1 congelado + decodificador de trayectoria entrenado + adaptador vertical temporal (Z/vZ) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de 8 fotogramas RGB consecutivos + 2-8 estados pasados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision y prediccion de trayectorias, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, cargado con `torch.load(..., weights_only=True)`); el backbone V-JEPA 2.1 se distribuye como `.pt` separado |
| Tamano del repositorio | 0,0 GB (sin descargas ni likes registrados) |
| Entrada | 8 fotogramas RGB redimensionados a 256 × 256 + 2-8 estados pasados `(X, Y, Z, vX, vY, vZ)` en metros y metros/segundo |
| Salida | 60 estados futuros × 6 componentes, cada uno con media y desviacion estandar marginal positiva, con forma `[batch, 60, 6]` |
| Frecuencia de salida | 30 FPS (2 segundos de horizonte) |
| Hash del checkpoint | SHA-256 `b83a59d05868cdb22640eeb832a6383e8ca087f8bca4f638d8df8ec27115af1e` |
| Hash del backbone esperado | SHA-256 `848a77c33cc9e6649ed2119c9bea1e2c569bcdab9539ff3e7c02ccc2959ddf4d` |

## Arquitectura y entrenamiento

El modelo combina un codificador de video ViT-B de V-JEPA 2.1 (variante destilada de V-JEPA 2.1, checkpoint `vjepa2_1_vitb_dist_vitG_384.pt`) que permanece congelado durante todo el entrenamiento, con dos cabezas entrenadas por separado. El decodificador gaussiano se entreno primero y produce, para cada uno de los 60 instantes futuros, la media y la desviacion estandar marginal de las seis componentes del estado. Despues, con el decodificador congelado, se entreno un adaptador vertical temporal especifico para la componente Z y su velocidad vZ. El checkpoint final (paso 3200) se selecciono por su comportamiento en eventos verticales sobre datos de validacion. No hay ningun modulo de rollout fisico: la prediccion es puramente aprendida.

Los datos de entrenamiento son grabaciones privadas de cintas transportadoras con pelotas de pickleball amarillas, con cintas en movimiento y detenidas. El conjunto de entrenamiento consta de 4.967 ventanas repartidas en 60 grabaciones, y la validacion usa 802 ventanas de 13 grabaciones. Las metricas declaradas se calculan sobre las 802 ventanas de validacion, incluyendo historiales incompletos y futuros parciales. Las historias se expresan en el sistema de referencia calibrado del conjunto de entrenamiento, en metros y metros por segundo, y los tiempos futuros son relativos a la ultima observacion; la calibracion de camara y la preparacion del historial deben replicar exactamente la del entrenamiento.

## Capacidades

- Prediccion de trayectorias 3D a dos segundos vista (60 pasos a 30 FPS) a partir de 8 fotogramas RGB y de 2-8 estados pasados medidos.
- Estimacion de incertidumbre por instante y por componente: devuelve media y desviacion estandar marginal para cada una de las seis variables de estado.
- Adaptacion vertical especifica para la componente Z y su velocidad, gracias al adaptador temporal entrenado sobre el decodificador congelado.
- Codificacion visual generica mediante el backbone V-JEPA 2.1 ViT-B, que procesa fotogramas de 256 × 256.
- Funcionamiento con cintas en movimiento y con cintas detenidas, segun la composicion del conjunto de entrenamiento.
- Integracion en una interfaz de usuario concreta (UI de cintas de KaliberAI), cargando el backbone y el checkpoint como `--vjepa-backbone` y `--vjepa-gaussian-checkpoint`.
- No dispone de tool calling, function calling, agentes, capacidades multilingues ni modos de razonamiento: es un modelo exclusivamente de vision y regresion de trayectorias.

## Casos de uso

- Seguimiento de objetos en lineas de clasificacion: el modelo predice donde estara la pelota 60 fotogramas despues a partir de 8 imagenes, lo que permite anticipar la posicion de recogida o de actuacion de un brazo robotico antes de que el objeto llegue.
- Control predictivo de cintas transportadoras: con la media y la desviacion estandar de la posicion futura se puede ajustar la velocidad de la cinta o activar desviadores en funcion de la incertidumbre de llegada.
- Deteccion temprana de eventos verticales: el adaptador de Z y vZ esta seleccionado especificamente para comportamiento vertical, lo que resulta util para detectar rebotes, caidas o saltos sobre la cinta.
- Fusion de vision y telemetria: al aceptar tanto fotogramas RGB como estados 3D medidos, el modelo sirve en escenarios donde hay un rastreador parcial (por ejemplo, oclusiones) y se necesita completar la trayectoria con la senal visual.
- Banca de pruebas y validacion de rastreadores: las predicciones a 2 s con intervalos marginales permiten comparar la calidad de un sistema de tracking 3D contra una referencia aprendida (error de desplazamiento medio de 5,480 cm en validacion).
- Analisis de incertidumbre para planificacion: aunque los intervalos no son bandas conjuntas calibradas, la cobertura marginal del 85,4 % / 75,7 % / 90,9 % en X/Y/Z permite umbralar decisiones de actuacion cuando la prediccion es poco fiable.
- Investigacion en world models aplicados: sirve como ejemplo reproducible de como adaptar un backbone V-JEPA 2.1 congelado a una tarea de regresion con incertidumbre en un dominio industrial.

## Benchmarks y rendimiento

El autor publica resultados de validacion propios (802 ventanas de 13 grabaciones, incluyendo historiales incompletos y futuros parciales). No se han publicado comparaciones con otros modelos en la informacion disponible.

| Metrica | Resultado |
|---|---:|
| Error medio de desplazamiento 3D | 5,480 cm |
| Error en la ultima posicion futura valida (FDE) | 8,916 cm |
| Error absoluto medio en Z | 0,480 cm |
| Error L2 de velocidad | 0,103 m/s |
| Cobertura del intervalo marginal al 95 %, eje X | 85,4 % |
| Cobertura del intervalo marginal al 95 %, eje Y | 75,7 % |
| Cobertura del intervalo marginal al 95 %, eje Z | 90,9 % |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco hay resultados sobre otros conjuntos de datos, camaras u objetos distintos de los del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos ni perfiles de memoria.
- GPU recomendadas: no disponible. El codigo de ejemplo usa `device="cuda"` sin especificar modelo de GPU.
- Viabilidad en GPU de consumo: no confirmada. Cabe senalar que el codificador es un ViT-B que procesa 8 fotogramas de 256 × 256, un coste de compute moderado en comparacion con modelos de video de mayor tamano, pero el autor no aporta medidas.
- Opciones de despliegue: no hay integracion declarada con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). La carga se realiza con `torch.load(..., weights_only=True)` a traves de la funcion `load()` del paquete `trajectory_conveyor30_ctx8_uncertainty`, es decir, requiere el arbol de codigo de KaliberAI.
- Latencia y throughput: no disponibles. Los 30 FPS se refieren a la frecuencia de muestreo de la salida predicha, no a la velocidad de inferencia del modelo.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace, pero hay que sumar la descarga del backbone V-JEPA 2.1 ViT-B destilado desde los servidores de Meta.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados. La tabla recoge unicamente lo que se puede afirmar con la informacion disponible.

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaliberAI/vjepa2-1-conveyor30-rgb-states-gaussian-8to60 | no disponible (decodificador + adaptador; backbone ViT-B aparte) | 8 fotogramas RGB + 2-8 estados pasados; salida de 60 pasos | Error medio de desplazamiento 3D de 5,480 cm en validacion propia | no disponible | Pesos en HuggingFace, requiere codigo y backbone externos |
| V-JEPA 2.1 ViT-B (backbone base) | no disponible en esta ficha | no disponible | no disponible | no disponible | Checkpoint publico de Meta (`vjepa2_1_vitb_dist_vitG_384.pt`) |
| Otros predictores de trayectoria 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los intervalos marginales al 95 % no alcanzan la cobertura nominal en ningun eje y se quedan especialmente cortos en Y (75,7 % frente al 95 % esperado). Las desviaciones estandar no estan calibradas.
- Las salidas son seis marginales independientes por instante: no modelan covarianza entre ejes ni entre instantes. No son bandas de confianza conjuntas ni probabilidades de colision calibradas, y no deben usarse como tales.
- El FDE se calcula con la ultima etiqueta valida de cada ventana, que puede ser anterior a los dos segundos completos; no es un error a horizonte fijo en todos los casos.
- El rendimiento solo esta caracterizado para las camaras, el objeto (pelotas de pickleball amarillas) y las condiciones del conjunto privado de entrenamiento. No se ha establecido su comportamiento con otros objetos, otras camaras o situaciones de colision.
- El backbone V-JEPA 2.1 permanece congelado y no se ajusto fino, lo que limita la adaptacion de las representaciones visuales al dominio.
- La calibracion de camara, el sistema de referencia del mundo y la preparacion del historial deben coincidir con el entrenamiento; cualquier desviacion invalida las predicciones.
- La licencia no esta declarada en el repositorio. El autor advierte de que el backbone, el codigo y el conjunto de datos pueden tener terminos separados, por lo que el uso comercial queda sin definir.
- Los datos de entrenamiento y validacion son privados y no se publican, lo que impide reproducir el entrenamiento o auditar los sesgos del conjunto.
- Es un checkpoint de pesos, no un servicio: no hay endpoint de inferencia alojado y se requiere el codigo propietario de KaliberAI para ejecutarlo.
- Al cargar archivos PyTorch, el propio autor recomienda verificar el hash SHA-256 y confiar solo en fuentes verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KaliberAI/vjepa2-1-conveyor30-rgb-states-gaussian-8to60
- Checkpoint del backbone V-JEPA 2.1 ViT-B destilado: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
