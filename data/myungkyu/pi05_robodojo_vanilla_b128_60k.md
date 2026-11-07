# Myungkyu/pi05_robodojo_vanilla_b128_60k

## Resumen

pi05_robodojo_vanilla_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tuning del modelo base lerobot/pi05_base sobre el conjunto de datos RoboDojo-Benchmark/RoboDojo, en lo que el autor denomina "vanilla baseline": el ajuste directo sin técnicas adicionales, pensado como referencia de comparación frente a otras variantes del mismo proyecto.

El modelo recibe tres vistas de cámara (cabeza y dos muñecas), un vector de estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos. Está entrenado para el robot dual ARX X5 en el entorno de simulación RoboDojo, con 35 tareas y 100 episodios por tarea, usando el exportador oficial de LeRobot.

Con 4.143.404.816 parámetros y un repositorio de 37,4 GB, es un modelo de gran tamaño orientado a investigación en manipulación robótica bimanual. Su relevancia actual radica en servir como línea base reproducible para el benchmark RoboDojo y en demostrar el flujo de entrenamiento de Pi0.5 sobre LeRobot 0.5.2 en configuraciones multi-cámara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (visión-lenguaje-acción), según LeRobot 0.5.2 (commit 09808183) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acción de 50 pasos) |
| Tipos de cuantización | no disponible (entrenamiento en bf16) |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5 implementada en la versión pública de LeRobot 0.5.2 (commit 09808183). Se trata de un modelo VLA que combina un backbone de visión-lenguaje con un cabezal de acciones que genera chunks de 50 pasos. La entrada está compuesta por tres vistas de cámara (cabeza, muñeca izquierda y muñeca derecha), un estado articular de 14 dimensiones y la instrucción de la tarea; la salida son 14 objetivos articulares absolutos para el robot dual ARX X5.

El entrenamiento se realizó sobre el conjunto RoboDojo Sim en configuración co-train, con 35 tareas y 100 episodios por tarea, usando un batch de optimizador de 128 y 60.000 pasos en precisión bf16. El checkpoint publicado es el final, sin estado del optimizador. El autor incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno con su propio fichero SHA256SUMS. Las configuraciones referencian el backbone y el tokenizer del modelo base por su identificador de hub. No se especifican en la información disponible detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual: produce 14 objetivos articulares absolutos para el robot dual ARX X5 a partir de observaciones visuales y estado articular.
- Percepción visual multi-cámara: integra simultáneamente imágenes de cabeza y de ambas muñecas.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto.
- Generación de chunks de acción de 50 pasos, lo que permite ejecutar secuencias de control sin replanificar en cada paso.
- Ejecución de tareas de manipulación en simulación dentro del benchmark RoboDojo (35 tareas entrenadas).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico ni capacidades de audio.

## Casos de uso

- Línea base para investigación en VLA: sirve como referencia "vanilla" contra la que comparar variantes con técnicas adicionales (por ejemplo, la variante rldx2 del mismo autor) en el benchmark RoboDojo.
- Evaluación reproducible en RoboDojo Sim: al usar el exportador oficial de LeRobot y publicar checkpoints intermedios con sumas SHA256, permite reproducir curvas de entrenamiento y evaluar el efecto del número de pasos.
- Estudio de co-entrenamiento multi-tarea: con 35 tareas en un único modelo, es útil para analizar transferencia entre tareas de manipulación bimanual.
- Desarrollo de políticas bimanuales para robot dual ARX X5: el modelo produce directamente los 14 objetivos articulares que el robot necesita, lo que simplifica la integración en el bucle de control.
- Investigación sobre condicionamiento por lenguaje en robótica: permite estudiar cómo el modelo sigue instrucciones textuales en tareas de manipulación con múltiples cámaras.
- Punto de partida para fine-tuning específico: al estar construido sobre lerobot/pi05_base y cargar el backbone por identificador de hub, puede reutilizarse como inicialización para nuevos dominios o tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el backbone visual, el tokenizer y las activaciones de las tres cámaras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere al menos una GPU con 16-24 GB de VRAM para bf16, y GPUs de datacenter (A100, H100) para entrenamiento con batch 128.
- ¿Cabe en GPU de consumo? No confirmado. En bf16 podría ajustarse en tarjetas de 24 GB (RTX 3090, RTX 4090) si el resto del pipeline lo permite; no hay datos oficiales.
- Opciones de despliegue: la librería indicada es lerobot; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de acciones robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_robodojo_vanilla_b128_60k | 4.143.404.816 | no disponible | no disponible | no disponible | Hugging Face (48 descargas) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Myungkyu/rldx2_pi05_robodojo_vanilla_b128_60k | no disponible | no disponible | no disponible | no disponible | Hugging Face (variante del mismo autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es una línea base "vanilla" para un benchmark de simulación, no un sistema validado para producción ni para robots reales.
- Dominio restringido: entrenado únicamente en RoboDojo Sim con 35 tareas y el robot dual ARX X5; no se espera generalización fuera de esa configuración.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- Idiomas no documentados: se desconoce en qué idioma se proporcionaron las instrucciones de tarea.
- Riesgo de sobreajuste al simulador: al ser un baseline sin técnicas adicionales, puede presentar menor robustez ante variaciones visuales o de dinámica.
- Checkpoint final sin estado del optimizador: no permite reanudar el entrenamiento exactamente desde el punto final.
- Sin datos de benchmarks ni de sesgos: no hay evaluación publicada de rendimiento, alucinación o comportamiento fuera de distribución.
- Repositorio de gran tamaño (37,4 GB): requiere descarga selectiva mediante patrones (por ejemplo, ignorando `checkpoints/*` para obtener solo el modelo final).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi05_robodojo_vanilla_b128_60k
- Variante rldx2 del mismo autor: https://huggingface.co/Myungkyu/rldx2_pi05_robodojo_vanilla_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
