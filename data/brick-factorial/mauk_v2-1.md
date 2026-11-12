# brick-factorial/mauk_v2.1

## Resumen

MAUK v2.1 es un modelo de generación de texto de tipo causal desarrollado por brick-factorial, pensado exclusivamente para escritura surrealista y diálogo de personaje dentro del proyecto Brain Vat. Se trata de un GPT-2 de 163 millones de parámetros (12 capas, 12 cabezas de atención, 768 dimensiones ocultas) con un límite posicional de 1.024 tokens y un vocabulario de 50.259 tokens que incorpora los tokens especiales de hablante `[MAUK]` y `[ABACI]`. No es un asistente de propósito general: su función es generar intercambios entre los personajes MAUK y ABACI.

El modelo parte del checkpoint `brick-factorial/mauk_v1` y se ha afinado mediante un adaptador LoRA (rango 32, alpha 64) entrenado durante 15 épocas con tasa de aprendizaje 2e-4 sobre un corpus de diálogos sintéticos MAUK–ABACI. La relevancia de esta ficha es acotada: se trata de un experimento creativo de nicho, con 23 descargas y sin licencia declarada, útil para estudiar generación de personaje y estilo surrealista, no para tareas de producción general.

La información pública sobre el modelo es deliberadamente transparente en cuanto a sus lagunas: no se documenta una evaluación sistemática de seguridad o memorización, no hay benchmark retenido y no se ha establecido una correspondencia a nivel de pesos entre los adaptadores guardados y los pesos fusionados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`), transformer decoder-only |
| Parametros totales | 163.040.256 (float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (límite posicional) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de GPT-2: 12 capas, 12 cabezas de atención, 768 dimensiones ocultas y 1.024 posiciones de contexto. El vocabulario del config.json es de 50.259 tokens, y el tokenizer añade los tokens de hablante `[MAUK]` y `[ABACI]`, lo que permite condicionar la generación por turnos de diálogo. El checkpoint de partida es `brick-factorial/mauk_v1`, sobre el que se aplicó un adaptador LoRA (rango 32, alpha 64) entrenado 15 épocas a learning rate 2e-4 y posteriormente fusionado.

El entrenamiento del adaptador se realizó sobre `corinakaiser/synthetic-convos-1` versión 1, un archivo de 128.303 bytes con diálogos MAUK–ABACI (SHA-256 `c7183abdeabab4448ab4c53e0e903a0e5f3aa0409761fe6776ffbd17b54a63f9`). El checkpoint v1 podría arrastrar entrenamiento previo sobre un corpus histórico (etiquetado como Baudelaire, Rimbaud, Breton, tweets limpiados, con fragmentos de Euclides, topología y caos), pero no hay registro de ejecución que vincule ese corpus a los pesos publicados de `mauk_v1`. No se documenta split de validación ni evaluación retenida.

## Capacidades

- Generación de texto causal en inglés, orientada a prosa surrealista y diálogo de personaje.
- Condicionamiento por tokens de hablante `[MAUK]` y `[ABACI]` para estructurar intercambios de diálogo.
- Generación con muestreo (temperature, top_p) y control de longitud de salida vía `transformers`.
- Compatible con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.
- Capacidad de matemáticas o código: no documentada ni esperada en este tipo de checkpoint.

## Casos de uso

- Escritura surrealista exploratoria: generar pasajes de estilo surrealista a partir de prompts condicionados por el token `[MAUK]`, aprovechando el corpus de entrenamiento específicamente poético y experimental.
- Diálogo de personaje en prototipos narrativos: simular intercambios MAUK–ABACI en juegos narrativos o instalaciones artísticas, usando los tokens de hablante para alternar turnos.
- Estudio académico de generación de personaje: analizar cómo un modelo pequeño (163 M) aprende estilo y voz a partir de un corpus sintético de diálogos etiquetados.
- Generación de variantes de texto para edición creativa: producir múltiples continuaciones con temperature y top_p ajustados para seleccionar material en flujos de escritura asistida.
- Pruebas de pipelines de inferencia: servir el modelo en TGI o endpoints compatibles para validar infraestructura de despliegue con un modelo pequeño y ligero.
- Experimentación con fine-tuning LoRA: servir como caso de estudio reproducible de fusión de adaptadores sobre un GPT-2 base.
- Docencia sobre procedencia de datos y trazabilidad de checkpoints: el model card documenta hashes, scripts y discrepancias entre recetas públicas y ejecuciones reales, útil como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explícitamente que no hay benchmark retenido, medida de precisión ni evaluación de seguridad vinculada a esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,65 GB solo para pesos (163 M × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en float16: aproximadamente 0,33 GB para pesos; en cuantización de 8 bits, en torno a 0,16 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para inferencia de baja concurrencia; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: `transformers` (referencia del model card), Text Generation Inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brick-factorial/mauk_v2.1 | 163 M | 1.024 | no disponible | Hugging Face, 23 descargas | GPT-2 afinado para diálogo surrealista de personaje |
| brick-factorial/mauk_v1 | no disponible | no disponible | no disponible | Hugging Face (checkpoint base) | Base del que parte v2.1 vía LoRA |
| GPT-2 (original, OpenAI) | 124 M–1.5 B | 1.024 | MIT (pesos originales) | Hugging Face, ampliamente disponible | Modelo de propósito general; no especializado en personaje |
| DistilGPT-2 | 82 M | 1.024 | MIT (pesos originales) | Hugging Face | Alternativa destilada de propósito general |

La comparación con GPT-2 y DistilGPT-2 es la más directa por arquitectura y escala; MAUK v2.1 se diferencia por el vocabulario ampliado con tokens de hablante y por el corpus de entrenamiento específico. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede producir texto incoherente, sesgado u ofensivo.
- Riesgo de reproducción de pasajes del material de entrenamiento (memorización no evaluada).
- No debe usarse como fuente de hechos, pruebas matemáticas ni consejo profesional.
- Contexto limitado a 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; sin capacidades multilingües.
- Licencia no especificada: no se puede asumir uso comercial permitido; los datasets de origen no establecen licencia sobre los pesos ni sobre cada texto fuente.
- No hay evaluación sistemática de seguridad ni de sesgos documentada.
- No hay split de validación ni benchmark retenido; el rendimiento cualitativo no está cuantificado.
- La correspondencia a nivel de pesos entre los adaptadores guardados en la ejecución de Kaggle y los pesos fusionados publicados no está establecida.
- La procedencia completa del corpus heredado de v1 no está verificada con un registro de ejecución.
- La receta pública del proyecto (`kaggle_lora.md`) contiene ajustes distintos a los de la ejecución real; no debe tomarse como configuración ejecutada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brick-factorial/mauk_v2.1
- Configuración: https://huggingface.co/brick-factorial/mauk_v2.1/blob/main/config.json
- Tokenizer: https://huggingface.co/brick-factorial/mauk_v2.1/blob/main/tokenizer_config.json
- Registro del modelo en la API de Hub: https://huggingface.co/api/models/brick-factorial/mauk_v2.1
- Checkpoint base v1: https://huggingface.co/brick-factorial/mauk_v1
- Perfil del autor: https://huggingface.co/brick-factorial
- Repositorio del proyecto (surrealist-poetry): https://github.com/kaiser-factorial/surrealist-poetry
- Script de fusión y subida v2.1: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/push_to_hub.py
- Receta LoRA del proyecto: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/kaggle_lora.md
- Script de guardado v1: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/save_model_mauk.py
- Copia del corpus en el repo: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/synthetic_convos.txt
- Dataset de diálogos sintéticos: https://www.kaggle.com/datasets/corinakaiser/synthetic-convos-1
- Dataset histórico del corpus: https://www.kaggle.com/datasets/corinakaiser/mauk-abaci-corpus-2
