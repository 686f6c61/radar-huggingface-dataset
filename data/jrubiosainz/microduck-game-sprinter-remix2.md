# jrubiosainz/microduck-game-sprinter-remix2

## Resumen

Microduck game sprinter remix 2 es una política de control para locomoción cuadrúpeda, publicada por el usuario jrubiosainz, que compite en la prueba de sprint de 2 metros de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un transformer: es una red neuronal feed-forward de 197.774 pesos exportada a ONNX, con entrada `obs` [1, 61] y salida `actions` [1, 14], que genera de forma perpetua las consignas articulares del robot MicroDuck a partir de la observación del simulador.

El modelo es una remezcla del policy suraj-phanindra/microduck-sprint-hc5-aifund: la red original se mantiene congelada y bit a bit idéntica, y se envuelve en un grafo ONNX que añade un contador de pasos y dos tablas de desfases por paso (uno sobre las consignas de comando que lee la red y otro sobre sus objetivos articulares). Los 216 valores de esas tablas se buscaron con CMA-ES sobre las cinco semillas oficiales del evento, usando el runner de la Arena (MuJoCo 3.10.0, CPU x86-64).

Su relevancia es acotada pero concreta: mejora el tiempo de la política de origen en el tablero oficial (0,860 s frente a 0,864 s de media) y sirve como ejemplo reproducible de optimización de un controlador congelado mediante un envoltorio de parámetros externos. Es un artefacto exclusivamente de simulación, entrenado y evaluado únicamente en las cinco semillas oficiales de la Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (perceptron multicapa) exportada a ONNX. No es transformer, MoE ni SSM. Entrada `obs` [1, 61], salida `actions` [1, 14] |
| Parametros totales | 197.774 pesos y sesgos, identicos bit a bit a los del modelo base |
| Longitud de contexto | No aplica: cada paso de control consume una unica observacion de 61 valores, sin memoria interna. El estado temporal se reconstruye mediante la realimentacion de la accion anterior que impone la Arena |
| Tipos de cuantizacion | no disponible; se distribuye un unico grafo ONNX en la precision original |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (ni el repositorio fuente ni este declaran licencia alguna; la model card indica que el repositorio de origen no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`, 831.318 bytes, sha256 `5b2341d46805505b241e8031f7bc910af882d9351cd18f7966db4d2b0d8e1d8a`) |
| Modelo base | suraj-phanindra/microduck-sprint-hc5-aifund (relacion: finetune) |
| Tarea (pipeline) | robotics |
| Libreria declarada | microduck |
| Frecuencia de control | 50 Hz (paso de control de 0,02 s; los tiempos de carrera son multiplos de 0,02 s) |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Archivos | `policy.onnx` (831.318 bytes), `manifest.json` (esquema 2 de Pollen), `README.md` |

## Arquitectura y entrenamiento

La red en si es la del modelo base y no se ha modificado: sus 197.774 pesos y sesgos son identicos bit a bit a los de suraj-phanindra/microduck-sprint-hc5-aifund, y los valores de su normalizador de entrada se pliegan en las constantes del envoltorio (el grafo calcula `obs · (1/std) + (c_k − mean)/std` donde el original calcula `(obs − mean)/std`). El origen de esa red se remonta a juicenv/microduck-sprint-auto10161753, ajustado mediante hill climbing elitista sobre la puntuacion de la Arena, con el codigo de entrenamiento pollen-robotics/microduck_rl en el commit `6ff40704a` de la rama `main`.

La innovacion esta en el envoltorio ONNX, construido solo con operadores estandar. Primero, un contador de pasos que redondea el objetivo `head_roll` a 1/256 rad y le suma el numero de pasos de control ejecutados en unidades de 1/65536 rad; como la Arena realimenta a cada politica su accion anterior, el paso siguiente lee el contador k de forma exacta (k = 25 + paso de carrera, saturando en 127), lo que mueve el objetivo de `head_roll` como maximo unos 0,004 rad. Segundo, un desfase de comando `c_k` que se suma a los valores de comando que lee la red (1,15 m/s de avance, cero lateral y cero guiñada): un desfase de velocidad de avance entre -0,413 y +0,222 m/s a partir del paso de contador 26, nulo antes, sin tocar el resto de comandos. Tercero, un desfase articular `o_k` que se suma a los objetivos articulares desde el paso 26: desfases simetricos y antisimetricos en el hip pitch, la rodilla y el tobillo de ambas patas, y desfases en cuello y head pitch, de 0,49 rad como maximo, y nulos en `head_roll`, `head_yaw`, `left_hip_roll`, `left_hip_yaw`, `right_hip_roll` y `right_hip_yaw`.

Ambas tablas son lineales a trozos en k, con nudos cada 2 pasos desde 26 hasta 72 (aproximadamente 0,94 s de carrera) y mantenidas despues del ultimo nudo. Sus 216 valores de nudo (24 nudos × 9 canales) se buscaron con CMA-ES (poblacion 24, paso inicial 0,004) sobre el tiempo de carrera en las cinco semillas oficiales del evento, dentro del runner de la Arena (MuJoCo 3.10.0, CPU x86-64), con la red congelada; se trata de la generacion 805 de la ejecucion `dive_sprint_hc5d`. Un candidato solo se conservaba si superaba el tablero del modelo fuente y, reejecutado 8 veces con ruido de σ = 10⁻⁷ en todas las observaciones salvo el contador de pasos, terminaba cada semilla con una media de tablero inferior a la del fuente. El archivo reconstruido a partir del fuente y de las tablas de la busqueda es identico al publicado.

## Capacidades

- Generacion de marcha perpetua: produce de forma continua 14 consignas articulares a partir de una observacion de 61 valores, a la velocidad de comando de 1,15 m/s de avance, con comando lateral y de guiñada nulo.
- Desplazamiento en linea recta sobre 2 metros en simulacion, con tiempos de carrera de 0,86 s en las cinco semillas oficiales.
- Adaptacion temporal dentro de la carrera: los desfases de comando y articulares varian con el numero de paso de control, de modo que la politica modifica su comportamiento entre el inicio y los 0,94 s de carrera.
- Lectura de un contador de pasos codificado en la accion anterior, aprovechando la realimentacion de acciones del runner de la Arena.
- Robustez verificada frente a ruido infinitesimal: con σ = 10⁻⁷ en todas las observaciones salvo el contador, completa las cinco semillas con media de 0,860 s en 8 repeticiones.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Evaluacion comparativa en la Microduck Arena: el modelo se sube como entrada del sprint de 2 m y se compara contra el modelo base en las mismas cinco semillas oficiales, con el runner MuJoCo 3.10.0 en CPU x86-64, obteniendo una referencia cuantitativa (0,860 s frente a 0,864 s) para clasificar politicas.
- Investigacion sobre optimizacion de controladores congelados: sirve como caso de estudio de busqueda CMA-ES sobre un envoltorio de parametros externos (216 valores de nudo) manteniendo intacta la red subyacente, util para estudiar cuando merece la pena optimizar la envoltura en lugar de reentrenar.
- Reproduccion de resultados de RL en robotica: el metodo descrito (mitad de tabla, generacion 805, poblacion 24, σ = 10⁻⁷) permite reproducir el pipeline completo con el codigo pollen-robotics/microduck_rl y verificar la identidad bit a bit del archivo (`policy.onnx` sha256 `5b2341d4…`).
- Banco de pruebas de tolerancia al ruido en observaciones: el protocolo de validacion con ruido de σ = 10⁻⁷ en todas las entradas salvo el contador de pasos es directamente reutilizable para medir la fragilidad de una politica de locomocion antes de llevarla a otra configuracion de simulador.
- Docencia de aprendizaje por refuerzo aplicado: el repositorio es un ejemplo compacto (831.318 bytes, 197.774 parametros, un solo archivo ONNX) para ilustrar el ciclo completo de entrenamiento, exportacion, publicacion y evaluacion en un entorno simulado.
- Analisis de sensibilidad a la semilla y al hardware: dado que los tiempos se redondean a pasos de control de 0,02 s y que la model card advierte de variaciones entre semillas cercanas o CPUs distintas, el modelo sirve para estudiar la varianza de medicion del propio banco de pruebas.
- Integracion en pipelines de evaluacion automatizada: el grafo ONNX se puede cargar con cualquier runtime ONNX dentro del runner de la Arena para ejecutar lotes de politicas y calcular tiempos de tablero de forma desatendida.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible: tiempos de carrera en segundos sobre las cinco semillas oficiales del evento, a 1,15 m/s de avance comandado.

| Semilla | suraj-phanindra/microduck-sprint-hc5-aifund | Este remix |
|---|---|---|
| 1 | 0,86 | 0,86 |
| 2 | 0,86 | 0,86 |
| 3 | 0,86 | 0,86 |
| 4 | 0,86 | 0,86 |
| 5 | 0,88 | 0,86 |
| Tablero (media) | 0,864 | 0,860 |

Advertencias declaradas por el autor: son cifras in-sample, ya que la busqueda puntuo sus candidatos sobre esas mismas semillas, igual que las busquedas elitistas que produjeron el modelo fuente; los tiempos se expresan en pasos de control enteros de 0,02 s, de modo que el tablero se mueve en incrementos de 0,004 s, y semillas cercanas o una CPU distinta pueden dar otros tiempos. Datos de MMLU, HumanEval, GSM8K o equivalentes: no disponible (no es un modelo de lenguaje).

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. El grafo ONNX ocupa 831.318 bytes y el runner de referencia (MuJoCo 3.10.0) se ejecuta en CPU x86-64, sin GPU.
- GPU recomendadas: no aplica; el autor no documenta ejecucion en GPU y el entorno oficial de evaluacion es CPU. Cualquier GPU seria irrelevante para el cuello de botella, que es la simulacion fisica.
- Cabe en GPU de consumo: si, y tambien en CPU sin requisitos especiales; no se documenta ningun requisito de memoria.
- Opciones de despliegue: runtime ONNX dentro del runner de la Microduck Arena o de MuJoCo 3.10.0. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto y no estan documentados.
- Latencia y throughput: no disponible. El unico dato temporal es que el paso de control es de 0,02 s (50 Hz) y que una carrera completa dura 0,860 s, es decir, unos 43 pasos de control.

## Comparativa con modelos similares

| Modelo | Parametros | Relacion | Tiempo en el tablero (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter-remix2 | 197.774 (red congelada del base + envoltorio ONNX) | Remezcla de hc5-aifund con envoltorio buscado por CMA-ES | 0,860 s | no disponible | Publicado en HuggingFace |
| suraj-phanindra/microduck-sprint-hc5-aifund | 197.774 pesos y sesgos (mismos, bit a bit) | Base de esta remezcla; ajuste por hill climbing elitista | 0,864 s | no disponible | Publicado en HuggingFace |
| juicenv/microduck-sprint-auto10161753 | no disponible | Ancestro dentro de la ascendencia del base | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Exclusivamente para simulacion: el autor indica de forma explicita que el modelo no debe cargarse en un MicroDuck fisico. Nada se ha probado sobre hardware.
- Dependencia de un artefacto del runner: el contador de pasos viaja codificado en el objetivo `head_roll`, algo que un robot real no realimentaria bit a bit. Fuera de la Arena, el mecanismo deja de funcionar.
- Resultados in-sample: los candidatos se puntuaron sobre las mismas cinco semillas oficiales que se usan para reportar el resultado, por lo que las cifras estan sesgadas al alza respecto al comportamiento en semillas nuevas.
- Margen de mejora minimo y al limite de la resolucion: 0,004 s de mejora sobre una metrica cuantizada a pasos de 0,02 s (incrementos de 0,004 s en el tablero). Diferencias de esta magnitud pueden quedar dentro del ruido de medicion.
- Sensibilidad al entorno de ejecucion: semillas cercanas o una CPU distinta pueden producir tiempos diferentes.
- Riesgo de sobreajuste: las 216 valores de nudo se ajustaron contra un conjunto fijo de semillas y el desplazamiento de comando de avance es acotado (-0,413 a +0,222 m/s), lo que limita su generalizacion a otras velocidades o comandos laterales y de guiñada, que no se tocan.
- Robustez acotada: la validacion con ruido se hizo con σ = 10⁻⁷, un nivel extremadamente bajo; no hay datos con perturbaciones mayores.
- Sin licencia declarada: ni el repositorio fuente ni este declaran licencia, por lo que no hay autorizacion explicita de uso comercial ni condiciones de redistribucion.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento.
- Sesgos y alucinacion: no aplica en el sentido habitual de un modelo generativo, pero cualquier extrapolacion de los tiempos declarados a escenarios no evaluados carece de respaldo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix2
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-sprint-hc5-aifund
- Perfil del autor del modelo base: https://huggingface.co/suraj-phanindra
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento `microduck_rl` (commit `6ff40704a`, rama `main`): https://github.com/pollen-robotics/microduck_rl
- Organizacion Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- `namenu/microduck-arena` (citado por los metadatos ONNX del fuente): https://huggingface.co/namenu/microduck-arena
- Perfil de namenu: https://huggingface.co/namenu
