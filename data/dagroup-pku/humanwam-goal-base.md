# DAGroup-PKU/HumanWAM-Goal-Base

## Resumen

HumanWAM-Goal-Base es un checkpoint fundacional de tipo world-action model (WAM) desarrollado por DAGroup-PKU, orientado a robótica de manipulación con condicionamiento por objetivo. El modelo parte de un preentrenamiento híbrido de 60.000 horas que combina 46.000 horas de vídeo-acción humano en primera persona con 14.000 horas de datos de robots multi-embodiment. El checkpoint publicado corresponde a los pesos EMA en el paso 168.000 del preentrenamiento Open-HumanWAM.

La propuesta técnica central es la denoización conjunta de vídeo futuro y un chunk de 48 acciones a partir de una instrucción textual, una imagen objetivo, observaciones actuales de cámara de cabeza y muñeca (con historial visual de 0,5 s y 2 s) y el estado del robot. Esto permite dos modos de uso: ejecución zero-shot con un espacio compartido de efector final (EEF) bimanual de 6 grados de libertad, y inicialización para post-entrenamiento por embodiment mediante la herramienta `goalwam_train`.

Su relevancia actual reside en que aborda el problema de la transferencia entre dominios humano y robótico sin fine-tuning en la tarea objetivo, reportando un 13,94 % de éxito medio zero-shot en RoboTwin 2.0 y un 30,5 % en 20 tareas del mundo real. El repositorio ocupa 29,7 GB y se distribuye en safetensors bf16 junto con VAE, tokenizador de texto y ficheros de configuración de muestreo y calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (denoizacion conjunta de video futuro y chunk de acciones); detalles internos del transformer no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial visual de 0,5 s / 2 s; chunk de accion de 48 pasos) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors bf16 (`transformer/`), mas `vae/`, `text_tokenizer/`, `processor.json`, `sampling.json`, `robot.json`, `export.json` |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de world-action models: un transformer que denoiza de forma conjunta fotogramas de vídeo futuro y un chunk de 48 acciones, condicionado por instrucción textual, imagen objetivo, observaciones de cámara de cabeza y muñeca con historial visual de 0,5 s y 2 s, y el estado del robot. El muestreo se realiza con UniPC en 10 pasos y flow shift 2,0. El export unificado incluye un VAE y un tokenizador de texto junto con el transformer en bf16.

El preentrenamiento Open-HumanWAM emplea 60.000 horas híbridas: 46.000 horas de vídeo-acción humano egocéntrico y 14.000 horas de datos de robots multi-embodiment. El checkpoint publicado son los pesos EMA en el paso 168.000. Una innovación destacable es la convención compartida de efector final: poses bimanuales de 6 DoF en el marco NWU de la cámara de cabeza (índices `26:33` y `34:41`) y una calibración interna de pinza `gap_m` con apertura de 0,10 m y anchura de referencia de 0,12 m. Esa normalización compartida, almacenada en `robot.json`, es la que habilita la ejecución zero-shot con `domain_id = -1` y sirve de base para construir los `robot.json` de los checkpoints downstream.

## Capacidades

- Denoización conjunta de vídeo futuro y chunk de 48 acciones condicionada por instrucción de texto e imagen objetivo.
- Ejecución zero-shot con espacio compartido de efector final bimanual de 6 DoF (`domain_id = -1`) sin fine-tuning en la tarea objetivo.
- Inicialización para post-entrenamiento por embodiment mediante `goalwam_train`, reutilizando los límites de normalización EEF de `robot.json`.
- Procesamiento de observaciones multimodales: cámara de cabeza, cámara de muñeca, historial visual (0,5 s y 2 s) y estado del robot.
- Control de pinza mediante calibración interna `gap_m`.
- Soporte de instrucciones en inglés.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Manipulación bimanual zero-shot: el modelo puede ejecutar tareas con poses de efector final de 6 DoF en el marco de la cámara de cabeza sin entrenamiento específico, lo que permite desplegarlo en un robot nuevo con la convención EEF compartida y evaluar su viabilidad antes de invertir en datos.
- Post-entrenamiento por embodiment: partiendo del checkpoint, `goalwam_train` permite adaptar el modelo a un robot concreto (por ejemplo, RoboTwin 2.0 `clean_50`) usando los límites de normalización EEF heredados de `robot.json`.
- Investigación en world models para robótica: la denoización conjunta de vídeo y acciones facilita estudiar la predicción de dinámica visual como señal auxiliar para el aprendizaje de políticas.
- Aprendizaje a partir de vídeo humano egocéntrico: el preentrenamiento con 46.000 horas de vídeo-acción humano permite explorar la transferencia de habilidades humanas a políticas robóticas.
- Benchmarking de manipulación: sirve como línea base reproducible en RoboTwin 2.0 y en conjuntos de 20 tareas reales para comparar métodos de transferencia entre dominios.
- Prototipado de control condicionado por objetivo: la entrada de imagen objetivo más instrucción textual permite especificar tareas de forma flexible en entornos de laboratorio con cámaras de cabeza y muñeca.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| RoboTwin 2.0 | 13,94 % éxito medio | Zero-shot, `domain_id = -1`, sin fine-tuning en la tarea objetivo |
| 20 tareas del mundo real | 30,5 % éxito medio | Zero-shot, sin fine-tuning en la tarea objetivo |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por no ser el dominio del modelo. Tampoco se ofrecen comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- Tamaño del repositorio: 29,7 GB, lo que da una cota inferior del espacio en disco necesario para descargar el checkpoint completo.
- VRAM estimada para inferencia: no disponible; depende del tamaño del transformer y del VAE, no especificados.
- GPU recomendadas: no disponible. El ejemplo de post-entrenamiento usa `torchrun --nproc-per-node 8`, lo que sugiere entrenamiento multi-GPU, pero no se indican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: backend nativo de la librería `goalwam` (`backend="native"`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo usa UniPC con 10 pasos y flow shift 2,0, lo que implica al menos 10 evaluaciones del modelo por chunk de 48 acciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world-action models comparables ni datos de rendimiento de alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés para las instrucciones.
- Rendimiento zero-shot moderado: 13,94 % en RoboTwin 2.0 y 30,5 % en tareas reales, insuficiente para muchas aplicaciones productivas sin post-entrenamiento.
- Dependencia de la convención EEF compartida: la ejecución zero-shot exige respetar el marco NWU de la cámara de cabeza y la calibración `gap_m` (0,10 m de apertura, 0,12 m de anchura de referencia); desviaciones invalidan la normalización.
- Requiere observaciones específicas: cámara de cabeza, cámara de muñeca, historial visual de 0,5 s y 2 s, estado del robot e imagen objetivo.
- Riesgo de alucinación visual y de acciones no realistas inherente a los modelos generativos de vídeo-acción; no se documentan salvaguardas.
- Sesgos: no documentados, pero el preentrenamiento con vídeo humano egocéntrico puede arrastrar sesgos de escenarios, objetos y morfologías presentes en los datos.
- Ecosistema limitado: depende de la librería `goalwam` y del repositorio HumanNet; no hay soporte documentado en frameworks de inferencia estándar.
- Checkpoint EMA en el paso 168.000: no es un modelo final afinado para tareas concretas, sino una base de preentrenamiento.
- Sin métricas publicadas de latencia, VRAM ni parámetros, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAGroup-PKU/HumanWAM-Goal-Base
- Checkpoint post-entrenado y cachés de objetivos: https://huggingface.co/DAGroup-PKU/HumanWAM-Goal-RoboTwin
- Colección Open-HumanWAM: https://huggingface.co/collections/DAGroup-PKU/open-humanwam
- Código y documentación: https://github.com/DAGroup-PKU/HumanNet/tree/Open-HumanWAM/humanwam_goal
- Documentación de post-entrenamiento: https://github.com/DAGroup-PKU/HumanNet/tree/Open-HumanWAM/humanwam_goal/posttrain
