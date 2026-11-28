# SereinLove/Robo-Dopamine-GRM-2.0-OneShot-Tasks

## Resumen

Robo-Dopamine GRM 2.0 One-Shot Tasks es un repositorio que agrupa once modelos de recompensa (reward models) especializados en robótica, cada uno ajustado mediante fine-tuning one-shot para una tarea concreta de manipulación. Lo desarrolla el usuario SereinLove y se distribuye bajo licencia Apache 2.0 a través de Hugging Face. Cada modelo vive en su propio subdirectorio y se carga de forma independiente, lo que permite desplegar únicamente el reward model de la tarea que interese sin arrastrar los demás pesos.

El problema que resuelve es la evaluación automática de trayectorias y observaciones en entornos de robótica: en lugar de definir a mano funciones de recompensa para cada tarea, estos modelos actúan como evaluadores vision-language que puntúan el progreso de una política a partir de imágenes y contexto textual. Es relevante porque el ajuste one-shot reduce el coste de adaptar un reward model generalista a una tarea nueva, un cuello de botella habitual en pipelines de aprendizaje por refuerzo con retroalimentación humana o de modelo (RLHF/RLAIF) aplicado a robots.

Diez de los once modelos parten de `tanhuajie2001/Robo-Dopamine-GRM-2.0-8B-Preview`, un modelo de aproximadamente 8.000 millones de parámetros construido sobre la familia Qwen3-VL (la clase de carga indicada es `Qwen3VLForConditionalGeneration`). El modelo `hang_mugs` se ajustó desde un checkpoint anterior, `Robo-Dopamine-GRM-8B`, que no se incluye en el repositorio. El repositorio completo ocupa 192 GB, coherente con once copias de pesos en BF16 de un modelo de ese tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (clase `Qwen3VLForConditionalGeneration`, familia Qwen3-VL) |
| Parametros totales | Aproximadamente 8.000 millones (según el nombre del checkpoint base `Robo-Dopamine-GRM-2.0-8B-Preview`); no se detalla cifra exacta |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada uno de los once modelos es un transformer multimodal de tipo vision-language: recibe imágenes junto con texto y genera una evaluación (el rol de reward model). La clase de carga declarada, `Qwen3VLForConditionalGeneration`, sitúa la arquitectura en la familia Qwen3-VL, con un codificador visual acoplado a un decoder de lenguaje. Los pesos publicados son los pesos finales fusionados en BF16, acompañados de tokenizer, configuración de processor y configuración de generación; no se incluyen estados del optimizador ni checkpoints intermedios.

El entrenamiento consiste en un fine-tuning one-shot por tarea sobre el checkpoint base GRM 2.0 de 8B. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento. La única información de entrenamiento disponible es el resumen de entrenamiento incluido, cuando existe, en cada carpeta de tarea. Las once tareas cubiertas son: `align_blocks`, `classify_objects`, `hang_mugs`, `insert_tubes`, `make_toast`, `pack_obj_into_box`, `play_xylophone`, `sort_nesting_dolls_by_size`, `stack_blocks`, `stack_bowls_rand` y `sweep_blocks`.

## Capacidades

- Evaluación de recompensa visual para tareas de manipulación robótica: puntúa observaciones e imágenes de estado para estimar el progreso de una política.
- Respuesta a preguntas visuales (pipeline `visual-question-answering`), base sobre la que se construye la función de recompensa.
- Comprensión de escenas con objetos, disposición espacial y estados parciales de una tarea (apilar, insertar, ordenar, verter, etc.).
- Especialización one-shot: cada modelo está ajustado a una única tarea, lo que concentra su capacidad en el dominio concreto.
- Carga modular por subdirectorio, lo que permite servir solo el modelo de la tarea requerida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking, audio u otras modalidades: no documentadas.

## Casos de uso

- Entrenamiento por refuerzo en simulación: usar el reward model de la tarea correspondiente (por ejemplo `stack_blocks/one_shot`) para puntuar rollouts de una política y optimizarla con PPO o métodos similares, sustituyendo funciones de recompensa hechas a mano.
- Evaluación automática de políticas existentes: cargar el modelo de la tarea y puntuar un conjunto de trayectorias grabadas para comparar checkpoints sin intervención humana.
- Filtrado de datos de demostración: descartar episodios de baja calidad en un dataset de teleoperación evaluando cada frame o episodio con el reward model de la tarea.
- Anotación asistida de progreso: generar etiquetas de avance (0 a 1) sobre vídeos de manipulación para entrenar modelos de progreso o de valor.
- Detección de fallos en ejecución: integrar el modelo como monitor que puntúa observaciones en tiempo de inferencia y dispara una recuperación cuando la recompensa cae por debajo de un umbral.
- Investigación en reward models para robótica: comparar el ajuste one-shot frente a reward models generalistas en las once tareas publicadas, todas con la misma receta de fine-tuning.
- Prototipado de nuevas tareas: usar la receta one-shot sobre el checkpoint base GRM 2.0 para adaptar el evaluador a una tarea propia con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16 GB solo para pesos de un modelo de 8B, más el codificador visual y las activaciones; en la práctica se recomienda disponer de 24 GB o más por instancia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para una sola instancia en BF16; A10G o L4 si se cuantiza a 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con cuidado en el tamaño de lote; en GPUs de 16 GB requiere cuantización.
- Despliegue: transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor` indicando `subfolder`; para servicio de alto rendimiento, vLLM o TGI si soportan la arquitectura Qwen3-VL en la versión desplegada. No se documentan recetas para llama.cpp u Ollama.
- Almacenamiento: el repositorio completo ocupa 192 GB; conviene descargar solo el subdirectorio de la tarea necesaria mediante `subfolder` o descarga selectiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Robo-Dopamine GRM 2.0 One-Shot Tasks | ~8B por tarea | No disponible | Reward model VLM especializado por tarea (one-shot) | Apache 2.0 | Hugging Face, 11 subdirectorios |
| Robo-Dopamine GRM 2.0 8B Preview (`tanhuajie2001`) | ~8B | No disponible | Reward model VLM generalista, base de este repositorio | No disponible en la información | Hugging Face |
| Robo-Dopamine GRM 8B (`Robo-Dopamine-GRM-8B`) | ~8B | No disponible | Reward model VLM de generación anterior, base de `hang_mugs` | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Cada modelo está especializado en una única tarea; usarlo fuera de su tarea de ajuste degrada la calidad de la recompensa de forma no cuantificada.
- El modelo `hang_mugs` proviene de un checkpoint base distinto y puede requerir una clase de carga diferente según su propio `config.json`; no es intercambiable sin más con los otros diez.
- No se documentan sesgos, tasas de alucinación ni evaluación de robustez; al ser un reward model, una puntuación errónea se propaga directamente al bucle de entrenamiento por refuerzo.
- No se especifican idiomas soportados ni comportamiento fuera del inglés o de instrucciones textuales.
- No se publican datos de entrenamiento, número de tokens ni método de alineamiento, lo que dificulta auditar el comportamiento.
- El repositorio se describe como privado en la model card y tiene cero descargas y cero likes; la madurez y el soporte del proyecto son inciertos.
- El tamaño de 192 GB obliga a descargas selectivas; clonar el repositorio completo es caro en almacenamiento y ancho de banda.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia del checkpoint base y de los datos de ajuste no está documentada, por lo que conviene verificar las condiciones de los modelos predecesores antes de un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SereinLove/Robo-Dopamine-GRM-2.0-OneShot-Tasks
- Checkpoint base GRM 2.0 8B Preview: https://huggingface.co/tanhuajie2001/Robo-Dopamine-GRM-2.0-8B-Preview
- Checkpoint base anterior GRM 8B: https://huggingface.co/Robo-Dopamine-GRM-8B (referencia citada en la model card; no verificado)
