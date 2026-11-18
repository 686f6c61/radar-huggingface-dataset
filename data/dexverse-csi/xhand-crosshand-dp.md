# Dexverse-CSI/xhand-crosshand-dp

## Resumen

xhand-crosshand-dp es una coleccion de politicas de difusion para manipulacion robotica diestra (Diffusion Policies) desarrolladas por Dexverse-CSI, entrenadas sobre LeRobot 0.4.2. El objetivo del proyecto es investigar si una politica entrenada con un conjunto de manos puede transferirse de forma zero-shot a una mano que nunca ha visto durante el entrenamiento, usando un espacio de accion compartido de 41 dimensiones compuesto por posicion de palma (3), rotacion 6D (6) y un codigo latente de dedos (32) generado por un codec cross-hand.

El repositorio no contiene un modelo unico, sino multiples brazos experimentales (C, J, Z, D y sus variantes con distintos codecs) organizados por experimento (pooled3hand, h2, cv2dp, cv3dp). La tarea concreta es Dexverse-GraspKettle-v0 en simulacion, con una mano derecha flotante y 50 episodios de demostracion teleoperada por mano. Las manos empleadas son sharpa, shadow y wuji (cinco dedos) y allegro y leap (cuatro dedos).

La relevancia del trabajo es metodologica: los resultados muestran que la eleccion del codec latente de dedos condiciona la transferencia zero-shot, mientras que el diseno del espacio de muneca no aporta mejoras significativas. El repositorio pesa 33,6 GB e incluye pesos en safetensors junto con configuraciones, normalizadores y archivos CODEC.txt con los hashes de cada codec empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.4.2) con backbone ResNet18 entrenado desde cero |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | other |
| Formato de pesos | safetensors (model.safetensors) junto con config, normalizadores y train_config.json |

## Arquitectura y entrenamiento

Cada brazo es una Diffusion Policy de LeRobot que genera acciones mediante DDPM con 100 pasos de difusion y `n_action_steps` de 8. La entrada visual son dos camaras RGB (`third_person` y `eye_in_hand`) a 480x640, procesadas por un ResNet18 entrenado desde cero (`pretrained_backbone_weights: None`). El entrenamiento usa 300 epocas, batch de 64, semilla 42 y un snapshot cada 50 epocas. La tarea es Dexverse-GraspKettle-v0 con 50 episodios de demostracion teleoperada por mano.

El espacio de accion es el elemento diferenciador. El brazo C usa el vector nativo de articulaciones rellenado con ceros hasta 28 dimensiones, sin codec. El brazo J combina 6 articulaciones nativas de muneca flotante con 32 dimensiones del codec E2*. El brazo Z usa pose de palma en coordenadas de mundo mas z (41 dimensiones), decodificando dedos mediante `Dec_hand(z)` y muneca mediante IK de muneca flotante. El brazo D usa `EE_common = palm @ inv(f_task(q_finger))` mas z (41 dimensiones), decodificando la palma como `EE_common @ f_task(Dec_hand(z))`. Los sufijos e2/e3 corresponden al codec E2*, v2 al codec `cyc05clf05f002` y w3 al codec v3 `wb_cl_l`.

La seleccion del mejor snapshot se realiza por mayor numero de exitos totales en las manos de entrenamiento (episodios 0-9 por mano) sobre los snapshots de las epocas 50-250, con desempate hacia el paso posterior. El snapshot `last` (epoca 300) queda fuera de seleccion y evaluacion. La evaluacion se hace en simulacion DexVerse con DDPM de 100 pasos, `n_action_steps` 8 y limite de 3000 pasos; los escenarios iniciales provienen de los episodios de demostracion.

## Capacidades

- Control de manipulacion diestra multi-mano mediante un espacio de accion compartido de 41 dimensiones.
- Generacion de trayectorias de accion por difusion (DDPM, 100 pasos) condicionadas a dos vistas RGB.
- Transferencia zero-shot a manos no vistas por la politica pero presentes en el conjunto de entrenamiento del codec.
- Soporte de cinco morfologias de mano: sharpa, shadow, wuji (cinco dedos), allegro y leap (cuatro dedos).
- Codificacion y decodificacion de configuraciones de dedos mediante codecs latentes cross-hand (E2*, v2, v3).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es una politica de robotica, no un modelo de lenguaje.

## Casos de uso

- Investigacion en transferencia cross-embodiment: permite evaluar si una politica entrenada con un conjunto de manos generaliza a una mano nueva sin reentrenamiento, usando el espacio latente de dedos como puente entre morfologias.
- Benchmarking de codecs latentes para manipulacion: los brazos Ze2 frente a Zv2 y Zw3 frente a Ze3 permiten comparar codecs con control estadistico (McNemar) sobre las mismas condiciones de entrenamiento.
- Desarrollo de politicas de agarre en simulacion: la tarea GraspKettle-v0 sirve como banco de pruebas reproducible para algoritmos de diffusion policy con entrada visual multi-camara.
- Base para experimentos de espacio de accion: los brazos C, J, Z y D permiten aislar el efecto del diseno del vector de accion (articulaciones nativas frente a pose de palma frente a EE comun) sobre el exito de la politica.
- Preentrenamiento de politicas multi-mano: los snapshots `best` de pooled3hand pueden servir como inicializacion para tareas nuevas con las mismas manos.
- Reproduccion de resultados: la estructura de carpetas con CODEC.txt y hashes sha256 facilita la replicacion exacta de cada brazo experimental.

## Benchmarks y rendimiento

Resultados del mejor snapshot en manos de entrenamiento (P3 / P3-nohot, 50 episodios por mano; A = DPs nativas por mano, comilla = sin one-hot):

| Brazo | sharpa | shadow | wuji | Total /150 |
|---|---|---|---|---|
| A (nativa por mano) | 26 | 42 | 15 | 83 |
| C (one-hot) | 49 | 40 | 43 | 132 |
| C' | 46 | 38 | 43 | 127 |
| J | 18 | 29 | 22 | 69 |
| Z (one-hot) | 17 | 29 | 31 | 77 |
| Z' | 27 | 27 | 29 | 83 |
| D (one-hot) | 18 | 34 | 19 | 71 |
| D' | 21 | 19 | 25 | 65 |

Transferencia zero-shot: H1 (P3-nohot Z'/D' 059200) obtiene 0/10 en allegro y 0/10 en leap para ambos brazos. H2 (Z 064800 / D 108000) obtiene 0/10 en sharpa, 0/10 en wuji y 0/10 en leap para ambos brazos.

cv2dp (entrenamiento con shadow y wuji), evaluacion en sharpa no vista: Ze2 0/50 frente a Zv2 15/50 (McNemar exacto p = 6,1e-5); en manos de entrenamiento, 11/20 frente a 10/20.

cv3dp (entrenamiento con shadow, wuji y allegro):

| Brazo | muneca / z | sharpa /50 | leap /50 | shadow /50 | wuji /50 | allegro /50 | Entrenamiento /150 |
|---|---|---|---|---|---|---|---|
| Zw3 | Z / v3 `wb_cl_l` | 15 | 21 | 31 | 30 | 20 | 81 |
| Ze3 | Z / E2* | 0 | 0 | 32 | 16 | 35 | 83 |
| Dw3 | D / v3 `wb_cl_l` | 14 | 8 | 22 | 28 | 4 | 54 |
| De3 | D / E2* | 0 | 0 | 30 | 28 | 40 | 98 |

Zw3 frente a Ze3: p = 6,1e-5 en sharpa y 9,5e-7 en leap; en manos de entrenamiento 81 frente a 83 (p = 0,90). El diseno de muneca D (con f_task) no aporta mejora. Los resultados corresponden a una sola semilla de entrenamiento por brazo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 33,6 GB en total, pero incluye multiples brazos y snapshots; el tamano de un unico `model.safetensors` no se detalla.
- GPU recomendadas: no disponible. Al ser una Diffusion Policy con ResNet18 y DDPM de 100 pasos, la inferencia requiere GPU, pero no se especifica modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: LeRobot (libreria oficial, `DiffusionPolicy.from_pretrained` con `make_pre_post_processors`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La evaluacion usa DDPM de 100 pasos y `n_action_steps` 8, lo que implica 100 pasos de difusion por bloque de 8 acciones, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xhand-crosshand-dp (Zw3) | no disponible | no aplica | 15/50 sharpa, 21/50 leap zero-shot; 81/150 entrenamiento | other | Hugging Face |
| xhand-crosshand-pi05 | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face (`Dexverse-CSI/xhand-crosshand-pi05`) |
| dexverse-dp-image (DPs nativas por mano) | no disponible | no aplica | 83/150 en manos de entrenamiento (brazo A) | no disponible | Hugging Face (`Dexverse-CSI/dexverse-dp-image`) |
| xhand-finger-latent (codecs) | no disponible | no aplica | no aplica (es el codec, no la politica) | no disponible | Hugging Face (`Dexverse-CSI/xhand-finger-latent`) |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Transferencia zero-shot limitada: en H1 y H2 los brazos Z' y D' obtienen 0/10 en todas las manos no vistas. Solo con codecs v2 y v3 se observa transferencia parcial (15/50 y 21/50 en cv3dp Zw3).
- Las manos "held-out" no son desconocidas para el codec, solo para la politica: la evaluacion es policy-unseen, no codec-unseen, lo que limita las conclusiones sobre generalizacion real.
- Una sola semilla de entrenamiento por brazo, lo que reduce la robustez estadistica de las comparaciones entre brazos.
- El diseno de muneca D con f_task no mejora los resultados y en algunos casos los empeora (allegro 4/50 en Dw3).
- El snapshot `last` (epoca 300) no fue evaluado, por lo que no hay datos de rendimiento final del entrenamiento.
- Licencia "other": no se especifican terminos de uso comercial; es necesario consultar el repositorio para confirmar restricciones.
- Ambito restringido a simulacion (DexVerse) y a una unica tarea (GraspKettle-v0); no hay evidencia de transferencia a robot fisico.
- El repositorio incluye brazos pendientes de subida (cv3hm/Zw3h, Ze3h y cv3dp/Zc3) que no estan disponibles para evaluacion.
- Riesgo de sobreajuste a los escenarios iniciales de los episodios de demostracion, que provienen del mismo conjunto de datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/xhand-crosshand-dp
- Codecs de dedos y mapas de muneca: https://huggingface.co/Dexverse-CSI/xhand-finger-latent
- Versiones pi0.5 (Z / D, sin one-hot): https://huggingface.co/Dexverse-CSI/xhand-crosshand-pi05
- DPs nativas por mano (brazo A de P3): https://huggingface.co/Dexverse-CSI/dexverse-dp-image
- Backup completo con snapshots, logs y training_state: https://huggingface.co/eunyoung927/xhand-crosshand-ckpts
- Codigo (rama `dev`, carpeta `experiments/cross_hand_latent_codec/`): https://github.com/eunyoung030927/DexVerse
