# jrubiosainz/microduck-game-sprinter-remix

## Resumen

microduck-game-sprinter-remix es una política de control para robótica entrenada mediante aprendizaje por refuerzo y publicada en formato ONNX. La firma jrubiosainz la presenta como una remezcla de suraj-phanindra/microduck-sprint-hc4-aifund, la entrada de suraj-phanindra en el sprint de 2 m de la Microduck Arena. No es un modelo de lenguaje ni un modelo generativo: es una política de locomocion que lee un vector de observacion de 61 valores y emite 14 acciones articulares por paso de control.

Su interes tecnico no esta en un entrenamiento nuevo, sino en la metodologia de optimizacion: la red original permanece congelada, con sus 197.774 pesos y sesgos bit a bit identicos, y toda la mejora se consigue envolviendola en un grafo ONNX que anade un contador de pasos y dos tablas de desfases buscadas con CMA-ES. El resultado mejora el tiempo de su modelo base en las cinco semillas oficiales del evento, pasando de 0,872 s a 0,868 s de media.

Es relevante ahora como ejemplo de optimizacion de envoltorios (wrappers) sobre politicas congeladas, una tecnica que permite exprimir rendimiento sin reentrenar la red, y como entrada reproducible en un banco de pruebas de robótica simulado como la Microduck Arena. Su alcance es deliberadamente limitado: solo simulacion y solo las semillas oficiales del evento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica de control exportada a ONNX; detalle de capas no disponible (entrada obs [1, 61], salida actions [1, 14]) |
| Parametros totales | 197.774 pesos y sesgos (heredados sin cambios del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; politica de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no declarada; el repositorio de origen tampoco declara ninguna |
| Formato de pesos | ONNX (policy.onnx, 831.318 bytes, sha256 17420d7a7147...) |

## Arquitectura y entrenamiento

La red en si procede de suraj-phanindra/microduck-sprint-hc4-aifund, revision 5d507d86, cuyo policy.onnx tiene sha256 e446aa228261... y marcaba 0,872 s en la tabla de la Arena. El manifest de ese modelo lo describe como juicenv/microduck-sprint-es11 afinado mediante escalada de colinas elitista sobre la puntuacion de la Arena, y cita pollen-robotics/microduck_rl en la revision 6ff40704a (rama main) como codigo de entrenamiento. En esta remezcla la red se congela: sus 197.774 pesos y sesgos son bit a bit identicos, y los valores del normalizador de entrada se pliegan en las constantes del envoltorio, de modo que el grafo calcula obs · (1/std) + (c_k − mean)/std donde el original calculaba (obs − mean)/std.

Alrededor de la red congelada, el grafo ONNX anade un contador de pasos y dos tablas usando operadores estandar. El contador redondea el objetivo head_roll a 1/256 rad y le suma el numero de pasos de control ejecutados en unidades de 1/65536 rad; como la Arena realimenta a cada politica su accion anterior, el paso siguiente lee el contador k exactamente (k = 25 + paso de carrera, saturando en 127), lo que desplaza el objetivo head_roll como maximo unos 0,004 rad. La tabla de desfase de comando c_k se suma a los valores de comando que lee la red (1,2 m/s de avance, cero lateral y cero guinada) e introduce un desfase de velocidad de avance entre -0,197 y +0,118 m/s a partir del paso de contador 26, el primer paso de carrera, y cero antes. La tabla de desfase articular o_k se suma a los objetivos articulares de la red desde el paso 26: desfases simetricos y antisimetricos en el hip pitch, la rodilla y el tobillo de ambas piernas, y desfases en cuello y head pitch, de 0,26 rad como maximo, y cero en head_roll, head_yaw, left_hip_roll, left_hip_yaw, right_hip_roll y right_hip_yaw.

Ambas tablas son lineales a tramos en k, con nudos cada 2 pasos desde 26 hasta 72 (aproximadamente 0,94 s dentro de la carrera) y valor constante despues del ultimo. Sus 216 valores de nudo (24 nudos × 9 canales) se buscaron con CMA-ES (poblacion 24, tamano de paso inicial 0,02) sobre el tiempo de carrera en las cinco semillas oficiales del evento, dentro del ejecutor de la Arena (MuJoCo 3.10.0, CPU x86-64) y con la red congelada. Corresponde a la generacion 231 de la ejecucion dive_sprint_hc4. Solo se conservaba un candidato si superaba la tabla del modelo base y, reejecutado 8 veces con ruido de sigma = 10⁻⁷ en todas las observaciones salvo el contador de pasos, terminaba cada semilla cada vez con una media por debajo de la del original (0,868 s cada vez).

## Capacidades

- Generacion de locomocion de sprint: ejecuta un paso perpetuo con comando constante de 1,2 m/s de avance, cero lateral y cero guinada.
- Control articular de bajo nivel: produce 14 acciones por paso a partir de 61 observaciones, a una cadencia de control de 0,02 s por paso.
- Realimentacion de estado mediante contador de pasos: aprovecha la realimentacion de la accion previa que hace la Arena para leer el indice de paso de carrera.
- Robustez medida al ruido de observacion: validado con sigma = 10⁻⁷ en todas las observaciones excepto el contador de pasos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su «multi-paso» es puramente el avance temporal del control.
- No tiene capacidades multilingues ni modo de pensamiento (thinking mode).
- No dispone de capacidades de audio.

## Casos de uso

- Competicion en la Microduck Arena: la politica se carga como entrada del sprint de 2 m y compite en las cinco semillas oficiales; es adecuada porque esta optimizada especificamente para esas semillas y ese comando de 1,2 m/s.
- Investigacion en optimizacion de envoltorios: sirve como caso de estudio de como mejorar una politica congelada anadiendo tablas de desfase buscadas con CMA-ES, sin tocar un solo peso de la red.
- Estudio de metodos de busqueda sin gradiente: el historial de la ejecucion dive_sprint_hc4 (generacion 231, poblacion 24, paso inicial 0,02) permite reproducir y comparar configuraciones de CMA-ES sobre un problema de control real.
- Analisis de robustez en simulacion: su protocolo de validacion con ruido de sigma = 10⁻⁷ y 8 repeticiones por semilla es directamente reutilizable para medir sensibilidad al ruido en politicas de locomocion.
- Reproducibilidad de resultados de la Arena: el fichero se reconstruye de forma identica a partir del modelo base y las tablas de la busqueda, lo que permite auditar la mejora de 0,872 s a 0,868 s paso a paso.
- Docencia en aprendizaje por refuerzo aplicado: por su tamano (831.318 bytes) y su naturaleza puramente ONNX se puede inspeccionar y ejecutar en un portatil con CPU x86-64, sin GPU.

## Benchmarks y rendimiento

Tiempos de carrera en segundos sobre las cinco semillas oficiales del evento, a 1,2 m/s de velocidad de avance comandada (la misma velocidad para ambas entradas). Son numeros en muestra: la busqueda puntuo sus candidatos sobre estas mismas semillas.

| Semilla | microduck-sprint-hc4-aifund | Esta remezcla |
|---|---|---|
| 1 | 0,86 | 0,86 |
| 2 | 0,86 | 0,86 |
| 3 | 0,88 | 0,86 |
| 4 | 0,88 | 0,88 |
| 5 | 0,88 | 0,88 |
| **Tabla (media)** | **0,872** | **0,868** |

Los tiempos se miden en pasos de control enteros (0,02 s), por lo que una media se mueve en incrementos de 0,004 s; semillas cercanas o una CPU distinta pueden dar otros tiempos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no son aplicables a una politica de control.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el fichero ONNX ocupa 831.318 bytes y la red tiene 197.774 parametros, por lo que cabe en memoria de CPU sin GPU.
- GPU recomendadas: no requiere GPU; el modelo base y la busqueda se ejecutaron en CPU x86-64 con MuJoCo 3.10.0.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU; funciona en cualquier equipo con CPU x86-64.
- Opciones de despliegue: ejecutor de la Microduck Arena, ONNX Runtime o cualquier runtime compatible con ONNX; no aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y rendimiento: el control opera a 0,02 s por paso; el tiempo de carrera optimizado es de 0,868 s de media en las cinco semillas oficiales. No se ha publicado throughput adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tiempo en la tabla (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter-remix | 197.774 (red congelada del base) | ONNX (831.318 bytes) | 0,868 s | no declarada | HuggingFace |
| suraj-phanindra/microduck-sprint-hc4-aifund | 197.774 | ONNX | 0,872 s | no declarada | HuggingFace |
| namenu/microduck-arena | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparacion directa solo es posible con el modelo base, del que esta remezcla hereda la red sin cambios. namenu/microduck-arena se cita como origen de los metadatos ONNX del modelo base (run_path apunta a sus ejecuciones de entrenamiento de strata), pero no se dispone de sus especificaciones. No hay mas modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Solo simulacion: la politica se entreno y se evaluo unicamente en el simulador de la Arena, sobre sus cinco semillas oficiales; no se ha probado en hardware.
- No apta para un robot real: el contador de pasos viaja sobre el objetivo head_roll, que un robot fisico no realimentaria bit a bit; el propio autor advierte de no cargarla en un MicroDuck fisico.
- Numeros en muestra: la busqueda puntuo sus candidatos sobre las mismas semillas con las que se reporta el resultado, igual que hicieron las busquedas elitistas que produjeron su modelo base, por lo que la mejora de 0,004 s puede no generalizar a semillas cercanas o a otra CPU.
- Sensibilidad a la implementacion: los tiempos se miden en pasos de control enteros de 0,02 s, de modo que pequenos cambios de entorno pueden alterar el resultado final.
- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de lenguaje.
- Limitaciones de contexto o idioma: no aplica; la politica no procesa lenguaje ni mantiene contexto en el sentido de los modelos de lenguaje.
- Restricciones de licencia: el repositorio no declara licencia y el de origen tampoco, por lo que el uso comercial queda sin cobertura explicita y conviene contactar con el autor antes de cualquier explotacion.
- Caveat de produccion: es una entrada de competicion con un proposito muy acotado (sprint de 2 m a 1,2 m/s en simulacion), no una politica general de locomocion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-sprint-hc4-aifund
- Perfil del autor del modelo base: https://huggingface.co/suraj-phanindra
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Codigo de entrenamiento microduck_rl: https://github.com/pollen-robotics/microduck_rl
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- namenu/microduck-arena: https://huggingface.co/namenu/microduck-arena
- Perfil de namenu: https://huggingface.co/namenu
