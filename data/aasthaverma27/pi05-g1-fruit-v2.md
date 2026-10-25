# aasthaverma27/pi05-g1-fruit-v2

## Resumen

`pi05_g1_fruit_v2` es un ajuste fino completo (full fine-tune) del modelo base `pi05_base` sobre un conjunto de 422 episodios de simulación de tareas de pick-and-place con un robot humanoide Unitree G1. Lo publica el usuario `aasthaverma27` en HuggingFace y está entrenado específicamente para dos instrucciones en inglés: coger una fruta del dragón y depositarla en una cesta, y coger un mango y depositarlo en la cesta. No es un modelo de lenguaje general, sino una política visión-lenguaje-acción (VLA) que mapea observaciones visuales e instrucciones textuales a comandos motores de 28 dimensiones.

El modelo se apoya en el stack OpenPI y en la implementación de referencia citada por el autor, con configuración `pi05_g1_fruit_v2`, 30.000 pasos de entrenamiento, batch de 32 y tasa de aprendizaje de 5e-5, ejecutado en una instancia AWS g7e.2xlarge con una GPU RTX PRO 6000 de 96 GB. El espacio de acciones combina brazos en modo relativo (delta) y manos en modo absoluto, codificado con la máscara `make_bool_mask(7, -7, 7, -7)`.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de fine-tune de una política VLA sobre un humanoide de bajo coste, con checkpoints intermedios publicados y un script de servicio concreto (`serve_g1_rajat.py`). No hay información publicada sobre benchmarks, licencia ni idiomas soportados más allá de los prompts de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) derivada de `pi05_base`; arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible (el autor no publica recuento de parámetros) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en formato nativo de entrenamiento) |
| Idiomas soportados | no disponible formalmente; los prompts de entrenamiento están en inglés |
| Licencia | no disponible |
| Formato de pesos | Carpetas por paso de entrenamiento con `params/` y `assets/` (estadísticas de normalización); sin `train_state`. Formato de serialización no especificado |
| Dimension del espacio de acciones | 28 dimensiones (máscara `make_bool_mask(7, -7, 7, -7)`: brazos relativos, manos absolutas) |
| Tamano del repositorio | 186,6 GB |
| Dataset de entrenamiento | `aasthaverma27/dragonfruit_mango_pnp_v2` (422 episodios simulados: 412 de entrenamiento, 10 reservados) |
| Hardware de entrenamiento | AWS g7e.2xlarge con NVIDIA RTX PRO 6000 (96 GB) |
| Hiperparametros | 30.000 pasos, batch 32, lr 5e-5, fine-tune completo |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de `pi05_base`, la política VLA de la familia pi0.5 distribuida en el ecosistema OpenPI. La información disponible no detalla la composición interna (encoder visual, backbone de lenguaje, cabeza de acciones o mecanismo de generación de acciones), por lo que no se puede confirmar aquí el número de parámetros, la longitud de contexto ni si emplea flow matching u otra formulación. Lo que sí está documentado es la interfaz de acción: un vector de 28 dimensiones donde los dos brazos se controlan en modo delta relativo (7 dimensiones cada uno) y las dos manos en modo absoluto (7 dimensiones cada una), según la máscara `make_bool_mask(7, -7, 7, -7)`. Esta separación es habitual en manipuladores con manos articuladas, donde la posición absoluta de los dedos importa más que su incremento.

El entrenamiento se realizó sobre el split `fruitv2/train` del dataset `dragonfruit_mango_pnp_v2`, con 412 episodios efectivos y 10 reservados para validación, todos ellos en simulación. Se ejecutaron 30.000 pasos con batch 32 y lr 5e-5 en una única RTX PRO 6000 de 96 GB. Cada carpeta de checkpoint publicada contiene `params/` y `assets/` con las estadísticas de normalización, pero no `train_state`, lo que impide reanudar el entrenamiento desde esos pesos. No se documenta el uso de RLHF, DPO ni de decodificación especulativa; tampoco se describe la composición de datos más allá de los dos prompts de pick-and-place.

## Capacidades

- Ejecución de instrucciones de manipulación en lenguaje natural: responde a exactamente dos prompts de entrenamiento ("pick up the dragon-fruit and place it in the basket" y "pick up the mango and place it in the basket").
- Control de un humanoide Unitree G1 con espacio de acción de 28 dimensiones (brazos relativos, manos absolutas).
- Percepción visual acoplada a la acción: la política consume observaciones del entorno simulado y emite comandos motores por paso.
- publica checkpoints por paso, lo que permite evaluar el efecto del número de pasos en el comportamiento final.
- Servicio de inferencia mediante `pi05-configs/pi05/inference/serve_g1_rajat.py --config pi05_g1_fruit_v2 --checkpoint-dir <step>`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso deliberativo, capacidades multilingües ni modo de pensamiento extendido.

## Casos de uso

- Reproduccion de un pipeline VLA completo: el repositorio incluye configuración, checkpoints y script de servicio, lo que permite reconstruir de extremo a extremo el flujo de entrenamiento e inferencia sobre OpenPI con un G1 simulado.
- Punto de partida para fine-tunes propios: al ser un full fine-tune de `pi05_base` con hiperparámetros y hardware documentados, sirve de receta base para adaptar la política a nuevas tareas de pick-and-place con 400-500 episodios.
- Evaluacion comparativa de checkpoints intermedios: al publicarse carpetas por paso (sin `train_state`), se puede medir la curva de éxito de la tarea frente al número de pasos de entrenamiento.
- Docencia y divulgacion tecnica: ejemplo realista de espacio de acción híbrido (brazos delta, manos absolutas) para explicar máscaras de acción en políticas VLA.
- Prototipado de clasificación y trasvase de objetos en simulación: la política está especializada en distinguir dos objetos (fruta del dragón y mango) y dirigirlos a un contenedor, tarea base habitual en líneas de manipulación.
- Base para experimentos de sim-to-real: el modelo parte de datos exclusivamente simulados, por lo que es un candidato natural para estudiar la brecha de dominio antes de desplegar en hardware físico.
- Integracion en entornos de investigacion con OpenPI: al seguir la convención de configuración y servicio del framework, se puede enchufar en infraestructura existente sin adaptadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones cuantitativas con otras políticas; tampoco se documenta el rendimiento sobre los 10 episodios reservados.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA RTX PRO 6000 de 96 GB en AWS g7e.2xlarge, con 30.000 pasos, batch 32 y lr 5e-5.
- VRAM de inferencia: no disponible en la información proporcionada. No se indica cuánta memoria requiere cargar `params/` ni si existe una variante reducida.
- GPU recomendadas: no disponibles. Como referencia, el entrenamiento se hizo con una GPU profesional de 96 GB; no se confirma que quepa en GPU de consumo.
- Cabe en GPU de consumo: no disponible. No se publican cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir requisitos.
- Opciones de despliegue: el autor indica servir con `serve_g1_rajat.py` del repositorio `pi05-configs`, configuración `pi05_g1_fruit_v2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican directamente a una política de acciones.
- Almacenamiento: el repositorio ocupa 186,6 GB, repartido entre carpetas de distintos pasos; conviene descargar solo el paso de interés.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `pi05_g1_fruit_v2` (este) | VLA fine-tune para Unitree G1 | no disponible | no disponible | no disponible | Pesos en HF (186,6 GB) | 422 episodios simulados, 2 tareas |
| `pi05_base` (modelo base) | VLA generalista | no disponible | no disponible | no disponible en esta información | Referenciado como origen del fine-tune | Base sin especializar; requiere adaptación a la tarea |
| Otros fine-tunes de OpenPI para G1 | VLA especializadas | no disponible | no disponible | no disponible | No identificados en la búsqueda | No se han encontrado alternativas comparables documentadas |
| Políticas de imitación tipo ACT / Diffusion Policy | Políticas de imitación | no disponible | no disponible | habitualmente permisivas (no verificado aquí) | Ampliamente disponibles | No consumen instrucciones en lenguaje natural; comparación cualitativa |

No se dispone de datos verificables de parámetros, contexto o rendimiento de las alternativas dentro de la información proporcionada; la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado con dos instrucciones concretas; cualquier otro objeto, contenedor o frase queda fuera de distribución.
- Entrenamiento únicamente en simulación: no hay evidencia de transferencia a un G1 físico ni de robustez frente a cambios de iluminación, textura o dinámica reales.
- Conjunto de datos pequeño: 412 episodios efectivos y solo 10 reservados, insuficiente para estimar con fiabilidad la varianza del rendimiento.
- Sin benchmarks ni métricas de éxito publicadas: imposible comparar objetivamente con alternativas.
- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas: los prompts están en inglés y no se declara soporte multilingüe; usar instrucciones en castellano probablemente degrade el comportamiento.
- Sin `train_state`: los checkpoints no permiten reanudar el entrenamiento, solo inferencia o inicialización.
- Size del repositorio elevado (186,6 GB) con múltiples pasos: riesgo de descargas innecesarias y de confundir el checkpoint correcto.
- Riesgo de alucinación motora: como política de acciones, puede generar trayectorias plausibles pero incorrectas sin señal de confianza asociada.
- Sin información sobre sesgos: no se documenta composición demográfica ni de escenarios del dataset, por lo que no se puede evaluar sesgo de ningún tipo.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo; toda la información procede de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aasthaverma27/pi05-g1-fruit-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/aasthaverma27/dragonfruit_mango_pnp_v2
- Proyecto OpenPI (framework citado por el autor): https://github.com/Physical-Intelligence/openpi
- Repositorio `openpi-implementation` de Rajat y script `serve_g1_rajat.py`: referenciados en la model card sin URL pública disponible
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
