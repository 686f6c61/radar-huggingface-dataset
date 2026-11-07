# masahiroid/roberta-base-go_emotions-gguf

## Resumen

`masahiroid/roberta-base-go_emotions-gguf` es una conversión a formato GGUF del modelo `SamLowe/roberta-base-go_emotions`, un clasificador de emociones multi-etiqueta en inglés basado en RoBERTa-base y entrenado sobre el dataset GoEmotions (derivado de Reddit) con 28 etiquetas posibles. El modelo original asigna a cada texto 28 puntuaciones independientes (sigmoid), de modo que varias emociones pueden activarse simultáneamente sobre una misma entrada. Esta variante no introduce ningún reentrenamiento ni ajuste fino: es una conversión de checkpoint con paridad numérica verificada frente a la implementación original en PyTorch.

La conversión la publica el usuario `masahiroid` y va dirigida específicamente a Apple Silicon mediante MLX. El GGUF generado emplea un esquema propio (`general.architecture=hf-native-mlx-v1`), conserva los nombres de tensor originales de Hugging Face y almacena los pesos en F32, sin cuantización de 4 bits. Por tanto, no es compatible con llama.cpp, Ollama ni LM Studio, y requiere el runtime MLX incluido en el repositorio. El modelo base tiene 124.667.164 parámetros y el repositorio ocupa aproximadamente 0,5 GB.

Su relevancia es acotada pero concreta: permite ejecutar un clasificador de emociones de 28 clases en local sobre Mac con Apple Silicon conservando la semántica exacta del modelo original, con una diferencia máxima absoluta de salida de 2,98e-05 y una similitud coseno mínima de 0,9999999 en las pruebas de validación. No es un modelo generativo ni un LLM: es una herramienta de clasificación de texto pensada para integrarse en pipelines de análisis de sentimiento fino, moderación o enriquecimiento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder), cabeza de clasificación multi-etiqueta con 28 salidas sigmoid |
| Parametros totales | 124.667.164 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el modelo base RoBERTa admite hasta 512 tokens, y los ejemplos de la model card truncan a 128 |
| Tipos de cuantizacion | F32 (sin cuantización; la model card indica explícitamente que no es una cuantización de 4 bits) |
| Idiomas soportados | inglés (el dataset GoEmotions es de Reddit en inglés); la model card incluye una prueba con texto en japonés, pero no se declara soporte multilingüe |
| Licencia | MIT (pesos); las adiciones de conversión y runtime también son MIT |
| Formato de pesos | GGUF con esquema personalizado `hf-native-mlx-v1`, tensores F32, nombres de tensor originales de HF |

## Arquitectura y entrenamiento

El modelo subyacente es `roberta-base-go_emotions`, un encoder RoBERTa-base afinado para clasificación multi-etiqueta sobre el dataset GoEmotions, compuesto por textos de Reddit anotados con 28 etiquetas emocionales. La cabeza de clasificación produce 28 logits independientes que se interpretan mediante sigmoid, de forma que varias emociones pueden superar el umbral simultáneamente sobre una misma entrada. Esta variante GGUF no modifica ni reentrena el modelo: es una conversión de checkpoint en la revisión `d75048347613a25d77de8cf6412eaae9fa7b26be`, con todos los tensores empleados por el modelo de inferencia original preservados en el contenedor.

La innovación técnica de esta publicación no está en el modelo sino en el formato: un GGUF no estándar diseñado para el runtime MLX en Apple Silicon, con tensores en F32 y sin cuantización. La validación numérica se realizó contra la implementación original en PyTorch sobre 6 casos deterministas, con una diferencia máxima absoluta de 2,9802322e-05 y una similitud coseno mínima de 0,9999999. Los casos cubren emociones en inglés, texto neutro de recuperación, japonés, entrada vacía y truncamiento. El autor advierte que estas son comprobaciones de paridad de conversión, no benchmarks de calidad de tarea ni de latencia. Las versiones del entorno probado son PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4 y GGUF 0.19.0, sin garantía de compatibilidad fuera de ese entorno.

## Capacidades

- Clasificación multi-etiqueta de emociones en inglés con 28 etiquetas, devolviendo puntuaciones sigmoid independientes por etiqueta.
- Detección simultánea de varias emociones sobre una misma entrada (no es clasificación exclusiva).
- Procesamiento de entradas de longitud variable hasta el límite del modelo base; los ejemplos de la model card truncan a 128 tokens.
- Ejecución local en Apple Silicon mediante el runtime MLX incluido en el repositorio.
- Capacidad de recuperar las etiquetas legibles mediante el mapeo `id2label` expuesto por el runtime.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Análisis de sentimiento fino en redes sociales: clasificar comentarios o publicaciones en las 28 emociones de GoEmotions para segmentar audiencias y detectar matices (gratitud, frustración, admiración) que un análisis positivo/negativo binario pierde.
- Moderación de comunidades: identificar emociones de alta intensidad como enfado o asco en foros y colas de moderación, usando las puntuaciones sigmoid para priorizar revisiones humanas.
- Enriquecimiento de datasets de investigación: etiquetar corpus de texto en inglés con 28 dimensiones emocionales para estudios de psicología computacional o análisis de discurso.
- Análisis de opiniones de producto: procesar reseñas en inglés y agregar la distribución emocional por producto o por periodo para informes de calidad percibida.
- Monitorización de atención al cliente: clasificar transcripciones de chats o correos en inglés y activar alertas cuando la emoción dominante sea negativa, con independencia de la longitud del texto.
- Prototipado en local sobre Mac: validar pipelines de clasificación emocional sin depender de servicios en la nube, aprovechando la ejecución en Apple Silicon con MLX y la paridad numérica con el modelo original.
- Investigación de representaciones emocionales: comparar las salidas del modelo con anotaciones humanas en estudios controlados, dado que la conversión preserva la semántica exacta del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (F1, precisión, recall por etiqueta) en la información disponible. La única validación reportada es de paridad de conversión:

| Prueba | Resultado |
|---|---|
| Casos deterministas comparados con PyTorch | 6 |
| Diferencia máxima absoluta de salida | 2,9802322e-05 |
| Similitud coseno mínima | 0,9999999 |

Estas cifras verifican que la conversión reproduce el modelo original, no su calidad predictiva. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa aproximadamente 0,5 GB en F32; no requiere GPU dedicada.
- Hardware: Apple Silicon Mac obligatorio para el runtime MLX incluido; no funciona en CUDA ni en CPU x86 con este contenedor.
- GPU recomendadas: no aplica; el modelo está pensado para la GPU integrada de los chips Apple Silicon (M1, M2, M3, M4 y sucesivos).
- Cabe en cualquier Mac con Apple Silicon; el tamaño de 0,5 GB no supone una restricción práctica de memoria.
- Despliegue: solo mediante el loader MLX incluido (`runtime_mlx.Model`); no es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la validación realizada no es un benchmark de latencia.
- Dependencias: `huggingface_hub`, `mlx`, `numpy`, `gguf`, `transformers` y `sentencepiece`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/roberta-base-go_emotions-gguf | 124,7 M | hasta 512 tokens (no confirmado explícitamente) | GGUF MLX personalizado, F32 | MIT | Hugging Face, solo Apple Silicon |
| SamLowe/roberta-base-go_emotions | 124,7 M | hasta 512 tokens | PyTorch/safetensors | MIT | Hugging Face, multiplataforma |
| masahiroid/roberta-base-go_emotions-mlx | 124,7 M | no disponible | MLX | MIT | Hugging Face, Apple Silicon |
| masahiroid/roberta-base-go_emotions-coreml | 124,7 M | fijo a 128 tokens en los exports | Core ML | MIT | Hugging Face, Apple Silicon |

Las alternativas equivalentes son las otras conversiones del mismo autor, que ofrecen el mismo modelo en formatos distintos según el runtime objetivo. Frente al modelo original en PyTorch, esta variante solo se justifica si el entorno de ejecución es MLX en Apple Silicon; en cualquier otro caso, el checkpoint original es la opción natural.

## Limitaciones y advertencias

- No es compatible con llama.cpp, Ollama ni LM Studio: el esquema GGUF es propio y requiere el loader MLX incluido.
- Requiere Apple Silicon; no se puede ejecutar en GPUs NVIDIA, AMD ni en CPU x86 con este contenedor.
- El modelo solo está entrenado y validado para inglés; la prueba con japonés de la model card es una comprobación de conversión, no evidencia de calidad multilingüe.
- Es un clasificador, no un generador: no produce texto, no razona y no soporta tool calling ni agentes.
- Riesgo de sesgo: el dataset GoEmotions procede de Reddit y hereda los sesgos de esa comunidad en la anotación de emociones.
- Las etiquetas son multi-etiqueta con umbral sigmoid; un umbral de 0,5 puede no ser adecuado para todas las aplicaciones y debe calibrarse por caso de uso.
- La licencia MIT se aplica a los pesos y a las adiciones de conversión, pero la model card advierte que no se implica ninguna certificación de seguridad ni licencia comercial adicional.
- La compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, GGUF 0.19.0) no está garantizada.
- No hay benchmarks de calidad de tarea publicados; la única validación es de paridad numérica con el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf
- Modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions
- README del modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions/blob/main/README.md
- Revisión del checkpoint convertido: https://huggingface.co/SamLowe/roberta-base-go_emotions/tree/d75048347613a25d77de8cf6412eaae9fa7b26be
- Conversión MLX: https://huggingface.co/masahiroid/roberta-base-go_emotions-mlx
- Conversión Core ML: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreml
- Conversión Core AI: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreai
