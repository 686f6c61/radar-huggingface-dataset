# MiniMaxMusicTraining/soad-mm3-daron-cont128-reginst-replicate

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) derivado de MiniMax-Music3, el modelo de generacion musical de MiniMax. El adaptador, identificado como `soad-mm3-daron-cont128-reginst-replicate`, ha sido entrenado para el modo de continuacion musical con una ventana de 128 frames, sobre un conjunto de datos muy reducido (6 pistas vocales y 6 pistas instrumentales de regularizacion). El nombre del dataset sugiere que el entrenamiento se ha realizado sobre material estilistico de la banda System of a Down (SOAD), concretamente orientado al guitarrista Daron Malakian, aunque no se especifica explicitamente en la documentacion.

El modelo base MiniMax-Music3 combina un LLM global de 8B parametros para la estructura musical a largo plazo y un LLM local de 0.6B para el detalle a nivel de frame, permitiendo generar canciones completas de hasta cinco minutos condicionadas por letra y descripcion musical. Este adaptador LoRA modifica el componente de language model (planificador global LM/RVQ) del modelo base, y se distribuye bajo licencia Apache 2.0 con el formato de pesos de diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64) sobre MiniMax-Music3 (8B Global LLM + 0.6B Local LLM) |
| Parametros totales | no disponible (el adaptador LoRA tiene rank 64; el modelo base combina 8B + 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 frames (modo continuacion, LM max frames) |
| Tipos de cuantizacion | BF16 (precision de entrenamiento); cuantizacion opcional en inferencia via optimum-quanto (qint8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | diffusers (safetensors, adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se ha entrenado con rank 64, dropout 0.1 y alpha no especificado, sobre el componente `language_model` (planificador global LM/RVQ) del modelo base MiniMax-Music3. El entrenamiento se realizo en precision BF16 pura con el optimizador AdamW, durante 145 epocas y 5000 pasos, con una tasa de aprendizaje de 2e-05 y un programa constante con warmup de 50 pasos. El tamano efectivo de batch fue 1, con gradient checkpointing activado.

Se utilizaron dos modos de entrenamiento avanzados: NextLat (con bloque en indice -1, peso 0.1, perdida smooth_l1 y peso KL 0.0) y XM (con 2 candidatos, seleccion por bloque de tamano 16 y objetivo de entrenamiento `route`). El modo de ventana fue `continuation`, lo que significa que el modelo se entrena para continuar musica existente en lugar de generar desde cero. El text encoder no se entreno, por lo que se puede reutilizar el del modelo base para inferencia. El dataset de entrenamiento consta de solo 6 archivos de audio para la parte vocal y 6 para la regularizacion instrumental, con repeticiones desactivadas.

## Capacidades

- Generacion de musica por continuacion: el adaptador esta especificamente entrenado para el modo `continuation`, es decir, para extender o continuar una pieza musical existente en lugar de generar desde cero.
- Generacion texto-a-audio: hereda la capacidad del pipeline de MiniMax-Music3 de generar audio a partir de prompts textuales descriptivos.
- Estilizacion musical: el entrenamiento sobre un dataset especifico (aparentemente orientado al estilo de System of a Down / Daron Malakian) sugiere que el adaptador puede replicar o aproximar caracteristicas estilisticas de ese material.
- Integracion con diffusers: compatible con el pipeline `DiffusionPipeline` de la libreria diffusers, con soporte para cargar pesos LoRA mediante `load_lora_weights`.
- Cuantizacion opcional: el modelo base puede cuantizarse a qint8 con optimum-quanto para reducir el consumo de VRAM en inferencia, aunque no fue cuantizado durante el entrenamiento.
- Condicionamiento por letra y descripcion: hereda la capacidad del modelo base de generar canciones condicionadas por letras y descripciones musicales detalladas.

## Casos de uso

- Continuacion de demos musicales: un productor puede alimentar el modelo con una maqueta o riff existente y obtener una extension coherente de hasta 128 frames, util para explorar variaciones de una idea musical.
- Generacion de acompanamiento estilizado: dado un prompt textual que describa un estilo rock/metal con caracteristicas similares al material de entrenamiento, el adaptador puede generar acompanamientos instrumentales que se aproximen a ese estilo.
- Prototipado rapido de canciones: compositores pueden usar el modelo para generar esqueletos musicales completos (estructura, armonia, ritmo) a partir de descripciones textuales, acelerando el proceso de composicion.
- Investigacion en fine-tuning musical: el repositorio sirve como ejemplo de como aplicar LoRA sobre MiniMax-Music3 con SimpleTuner, incluyendo configuraciones de NextLat y XM, util para investigadores que quieran replicar o adaptar el proceso.
- Generacion de voces sinteticas sobre pistas instrumentales: al estar entrenado con pistas vocales, el adaptador puede generar lineas vocales que se integren con acompanamientos instrumentales existentes.
- Educacion musical y experimentacion: estudiantes e investigadores pueden usar el adaptador para estudiar como un LoRA de tamano reducido afecta al comportamiento de un modelo de generacion musical de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion objetiva (como FAD, CLAP score, o comparativas con otros adaptadores) ni resultados de validacion, ya que la validacion fue desactivada durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible directamente para el adaptador, pero el modelo base MiniMax-Music3 combina un LLM global de 8B parametros y un LLM local de 0.6B, lo que requiere una GPU con al menos 24 GB de VRAM en BF16 para inferencia comoda. Con cuantizacion qint8 del transformer, el requisito puede reducirse.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o superiores. En GPU de consumo, una RTX 3090 o 4090 con 24 GB puede ser suficiente con cuantizacion.
- Opciones de despliegue: el codigo de inferencia proporcionado usa `DiffusionPipeline` de diffusers con `torch.bfloat16`. Se puede ejecutar en CUDA, MPS (Apple Silicon) o CPU, aunque en CPU el rendimiento sera muy limitado.
- Latencia y throughput: no disponible. El modelo base genera hasta 5 minutos de audio, pero el tiempo de inferencia depende del hardware, el numero de pasos (30 en el ejemplo) y la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-Music3 (base) | 8B + 0.6B | 5 minutos de audio | no especificada en el repo del adaptador | diffusers | Modelo base sobre el que se aplica el LoRA |
| Este adaptador LoRA | rank 64 | 128 frames (continuacion) | Apache 2.0 | diffusers LoRA | Fine-tune especifico para continuacion estilizada |
| MusicGen (Meta) | 1.5B / 3.3B | 30 segundos | CC-BY-NC 4.0 | transformers | Generacion de musica desde cero, sin continuacion nativa |
| Stable Audio Open | 1.2B | 47 segundos | Stable Audio Open Non-Commercial | diffusers | Generacion de audio desde texto, sin continuacion |

La comparativa se basa en datos publicos de los modelos mencionados. No se dispone de benchmarks comparativos directos entre este adaptador y las alternativas.

## Limitaciones y advertencias

- Conjunto de entrenamiento extremadamente reducido: solo 6 archivos de audio para la parte vocal y 6 para la regularizacion, lo que limita severamente la generalizacion del adaptador a estilos o contextos fuera del material de entrenamiento.
- Validacion desactivada: no hay metricas de validacion durante el entrenamiento, por lo que no se puede evaluar objetivamente el rendimiento ni detectar overfitting.
- Etiqueta `not-for-all-audiences`: el modelo esta marcado como no apto para todos los publicos, lo que sugiere que el contenido generado o el material de entrenamiento puede incluir tematicas explicitas o sensibles.
- Riesgo de alucinacion musical: al ser un modelo generativo, puede producir audio que no se corresponda con el prompt o que presente artefactos, especialmente con un dataset de entrenamiento tan pequeno.
- Limitacion de modo: el adaptador solo esta entrenado para el modo `continuation` con 128 frames, no para generacion desde cero ni para ventanas mas largas.
- Dependencia del modelo base: el adaptador requiere el modelo MiniMax-Music3 completo para funcionar, lo que implica requisitos de hardware significativos (8B + 0.6B parametros).
- Sin garantias de calidad: al no haber benchmarks ni validacion, no se puede garantizar la calidad musical del output en produccion.
- Licencia Apache 2.0: aunque permite uso comercial, el modelo base MiniMax-Music3 puede tener restricciones adicionales no documentadas en este repositorio; se recomienda verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/MiniMaxMusicTraining/soad-mm3-daron-cont128-reginst-replicate
- Modelo base en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio GitHub de MiniMax-Music3: https://github.com/MiniMax-AI/MiniMax-Music3
- Sitio web de MiniMax: https://www.minimax.io/
- Guia independiente de MiniMax Music 3: https://minimaxmusic3.ai/
